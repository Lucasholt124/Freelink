import {
  extractComments,
  extractComment,
  findCommentRow,
} from "./extractor.js";
import { instagramSource, COMMENT_LIMIT } from "../../lib/instagram-giveaway";
let active = null,
  timer = null,
  panel = null,
  statusText = null,
  root = null,
  picking = false;
function stop() {
  clearInterval(timer);
  timer = null;
  active = null;
  picking = false;
  if (panel) {
    panel.remove();
    panel = null;
  }
}
function button(text, action) {
  const item = document.createElement("button");
  item.textContent = text;
  item.type = "button";
  item.addEventListener("click", action);
  item.style.cssText =
    "padding:7px 9px;border:1px solid #daceed;border-radius:8px;background:white;color:#4c2c83;cursor:pointer;font:12px Arial";
  return item;
}
function interfacePanel() {
  panel = document.createElement("section");
  panel.setAttribute("data-freelinnk-reader", "true");
  panel.setAttribute("aria-label", "Leitor do Freelinnk");
  panel.style.cssText =
    "position:fixed;bottom:18px;right:18px;width:300px;max-width:90vw;z-index:2147483647;background:#faf7ff;color:#30223f;border:1px solid #daceed;border-radius:15px;padding:16px;box-shadow:0 8px 35px #0002;font:13px/1.6 Arial";
  const title = document.createElement("strong");
  title.textContent = "Freelinnk · captura de comentários";
  statusText = document.createElement("p");
  statusText.textContent =
    "Abra os comentários. A leitura começa quando a lista estiver visível.";
  const tip = document.createElement("p");
  tip.textContent =
    active.mode === "live"
      ? "Mantenha esta live aberta. Só entram comentários carregados a partir da captura."
      : "Abra a lista de comentários. O leitor tenta carregar mais; você também pode rolar a lista.";
  tip.style.fontSize = "11px";
  const actions = document.createElement("div");
  actions.style.cssText = "display:flex;gap:6px;flex-wrap:wrap";
  actions.append(
    button("Indicar um comentário", () => {
      picking = true;
      statusText.textContent =
        "Clique em um comentário da lista para indicar a área de leitura.";
    }),
    button("Pausar", () => {
      const sessionId = active?.sessionId;
      stop();
      if (sessionId)
        chrome.runtime
          .sendMessage({
            kind: "COLLECTOR_BATCH",
            sessionId,
            status: "paused",
            comments: [],
          })
          .catch(() => {});
    }),
  );
  panel.append(title, statusText, tip, actions);
  document.documentElement.append(panel);
}
function mainRoot() {
  if (root?.isConnected) return root;
  const main = document.querySelector('main,[role="main"]');
  if (active?.mode === "post") {
    // Scope to the current post, never a whole feed of recommended publications.
    return (
      document.querySelector('[role="dialog"] article') ||
      main?.querySelector("article") ||
      null
    );
  }
  return main;
}
function scrollList(rows) {
  if (!active || active.mode !== "post") return;
  const base = rows[0] || mainRoot();
  if (!base) return;
  // Only explicit comment-loading controls. Never click Like, Follow or Reply.
  const candidates = Array.from(
    mainRoot().querySelectorAll('button,[role="button"]'),
  );
  const more = candidates.find(
    (element) =>
      element.getClientRects().length &&
      /^(carregar mais comentarios|ver mais comentarios|load more comments|view more comments)$/i.test(
        (element.getAttribute("aria-label") || element.textContent)
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim(),
      ),
  );
  if (more) {
    more.click();
    return;
  }
  let scroller = base;
  while (
    scroller &&
    scroller !== document.body &&
    scroller !== document.documentElement
  ) {
    const style = getComputedStyle(scroller);
    if (
      /auto|scroll/.test(style.overflowY) &&
      scroller.scrollHeight > scroller.clientHeight + 40
    ) {
      scroller.scrollBy({
        top: Math.max(120, scroller.clientHeight * 0.75),
        behavior: "instant",
      });
      return;
    }
    scroller = scroller.parentElement;
  }
}
async function scan() {
  const capture = active;
  if (!capture || capture.running) return;
  capture.running = true;
  try {
    if (instagramSource(location.href, capture.mode) !== capture.url) {
      statusText.textContent =
        "O endereço mudou. Volte ao Freelinnk e inicie novamente.";
      clearInterval(timer);
      return;
    }
    const main = mainRoot();
    let comments = [];
    if (main) {
      comments = extractComments(main, capture.mode);
      if (root && extractComment(root, capture.mode))
        comments.unshift(extractComment(root, capture.mode));
    }
    const fresh = comments
      .filter((comment) => !capture.seen.has(comment.id))
      .slice(0, Math.min(100, COMMENT_LIMIT - capture.seen.size));
    const status =
      capture.seen.size + fresh.length >= COMMENT_LIMIT
        ? "limit"
        : comments.length
          ? "collecting"
          : "waiting";
    const response = await chrome.runtime.sendMessage({
      kind: "COLLECTOR_BATCH",
      sessionId: capture.sessionId,
      status,
      comments: fresh,
    });
    if (!active || capture !== active) return;
    if (!response?.ok) {
      statusText.textContent =
        response?.error || "Volte ao Freelinnk para retomar a conexão.";
      clearInterval(timer);
      return;
    }
    fresh.forEach((comment) => capture.seen.add(comment.id));
    if (fresh.length) capture.idle = 0;
    else capture.idle++;
    statusText.textContent = capture.seen.size
      ? `${capture.seen.size} comentários lidos nesta captura. Confira a lista no Freelinnk.`
      : "Ainda não identifiquei comentários. Abra a lista ou use “Indicar um comentário”.";
    if (status === "limit") {
      statusText.textContent =
        "Limite de 5.000 comentários nesta captura. Confira a lista no Freelinnk.";
      clearInterval(timer);
    } else if (capture.idle < 15 && capture.mode === "post")
      scrollList(
        Array.from(main?.querySelectorAll('ul li,[role="listitem"]') || []),
      );
    else if (capture.idle === 15 && capture.mode === "post") {
      statusText.textContent =
        "Sem novos comentários carregados. A lista pode estar parcial; role a área de comentários ou confira no Freelinnk.";
      await chrome.runtime.sendMessage({
        kind: "COLLECTOR_BATCH",
        sessionId: capture.sessionId,
        status: "idle",
        comments: [],
      });
    }
  } catch {
    if (statusText)
      statusText.textContent =
        "A leitura foi interrompida. Volte ao Freelinnk e tente novamente.";
    clearInterval(timer);
  } finally {
    capture.running = false;
  }
}
document.addEventListener(
  "click",
  (event) => {
    if (
      !picking ||
      !active ||
      event.target.closest?.("[data-freelinnk-reader]")
    )
      return;
    const row = findCommentRow(event.target, active.mode);
    if (!row) {
      statusText.textContent =
        "Não identifiquei autor e comentário nessa área. Clique no texto de outro comentário.";
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    root = row.closest('ul,[role="list"]') || row.parentElement;
    if (root === document.body || root === document.documentElement) {
      root = null;
      return;
    }
    picking = false;
    active.idle = 0;
    statusText.textContent =
      "Área selecionada. Lendo os comentários carregados…";
    void scan();
  },
  true,
);
chrome.runtime.onMessage.addListener((message, _sender, respond) => {
  if (message.kind === "COLLECTOR_STOP") {
    if (active?.sessionId === message.sessionId) stop();
    respond({ ok: true });
    return;
  }
  if (message.kind !== "COLLECTOR_START") return;
  stop();
  if (instagramSource(location.href, message.mode) !== message.url) {
    respond({ ok: false });
    return;
  }
  active = { ...message, seen: new Set(), idle: 0, running: false };
  root = null;
  interfacePanel();
  respond({ ok: true });
  timer = setInterval(() => void scan(), 1500);
  void scan();
});
window.addEventListener("pagehide", () => {
  if (active) {
    chrome.runtime
      .sendMessage({
        kind: "COLLECTOR_BATCH",
        sessionId: active.sessionId,
        status: "paused",
        comments: [],
      })
      .catch(() => {});
  }
  stop();
});
