import { instagramSource, validateComment } from "./connector-core.js";
let serial = Promise.resolve();
function workspace(value) {
  try {
    const url = new URL(value);
    return (
      /^\/dashboard\/giveaway\/?$/.test(url.pathname) &&
      ((url.protocol === "https:" &&
        !url.port &&
        ["www.freelinnk.com", "freelinnk.com"].includes(url.hostname)) ||
        (url.protocol === "http:" &&
          ["localhost", "127.0.0.1"].includes(url.hostname) &&
          url.port === "5000"))
    );
  } catch {
    return false;
  }
}
async function bindings() {
  return (await chrome.storage.session.get("bindings")).bindings || {};
}
async function write(value) {
  await chrome.storage.session.set({ bindings: value });
}
async function stop(binding) {
  if (binding?.sourceTab)
    await chrome.tabs
      .sendMessage(binding.sourceTab, {
        kind: "COLLECTOR_STOP",
        sessionId: binding.sessionId,
      })
      .catch(() => {});
}
async function handle(message, sender) {
  if (message.kind === "WORKSPACE") {
    if (!sender.tab?.id || !workspace(sender.url || ""))
      throw new Error("Abra a ferramenta de sorteios do Freelinnk.");
    if (message.action === "HELLO") return { ok: true, version: "0.1.0" };
    const all = await bindings(),
      key = String(sender.tab.id),
      binding = all[key];
    if (message.action === "STOP" && binding && !message.sessionId) {
      await stop(binding);
      binding.status = "paused";
      await write(all);
      return { ok: true, status: "paused" };
    }
    if (message.action === "START") {
      if (!binding && Object.keys(all).length >= 3)
        return {
          ok: false,
          error: "Feche outra aba de captura do Freelinnk antes de começar.",
        };
      const url = instagramSource(message.url, message.mode);
      if (
        !url ||
        !["post", "live"].includes(message.mode) ||
        typeof message.sessionId !== "string" ||
        !/^[a-zA-Z0-9-]{16,80}$/.test(message.sessionId)
      )
        throw new Error("Revise o link da publicação ou da live.");
      if (binding) await stop(binding);
      // Create an inactive tab first so no update event can outrun the binding.
      const tab = await chrome.tabs.create({
        url: "about:blank",
        active: false,
      });
      all[key] = {
        sessionId: message.sessionId,
        sourceTab: tab.id,
        url,
        mode: message.mode,
        status: "opening",
        queue: [],
        nextSeq: 1,
        lastSeen: Date.now(),
      };
      await write(all);
      await chrome.tabs.update(tab.id, { url, active: true });
      return { ok: true, status: "opening" };
    }
    if (!binding || binding.sessionId !== message.sessionId) {
      if (message.action === "STOP") return { ok: true };
      return { ok: true, status: "disconnected" };
    }
    if (message.action === "STOP") {
      await stop(binding);
      binding.status = "paused";
      await write(all);
      return { ok: true, status: "paused" };
    }
    if (message.action === "ACK") {
      if (
        Number.isSafeInteger(message.seq) &&
        binding.queue[0]?.seq === message.seq
      )
        binding.queue.shift();
      await write(all);
      return { ok: true };
    }
    if (message.action === "POLL")
      return {
        ok: true,
        status:
          Date.now() - binding.lastSeen > 45000 &&
          binding.status === "collecting"
            ? "disconnected"
            : binding.status,
        batch: binding.queue[0] || null,
      };
    throw new Error("Comando desconhecido.");
  }
  if (message.kind === "COLLECTOR_BATCH") {
    if (!sender.tab?.id) return { ok: false };
    const all = await bindings();
    const entry = Object.values(all).find(
      (binding) =>
        binding.sourceTab === sender.tab.id &&
        binding.sessionId === message.sessionId,
    );
    if (!entry || instagramSource(sender.url || "", entry.mode) !== entry.url)
      return { ok: false, error: "A página mudou. Inicie uma nova captura." };
    if (entry.status === "paused")
      return { ok: false, error: "A captura foi pausada." };
    entry.lastSeen = Date.now();
    if (entry.queue.length >= 6) {
      entry.status = "buffer_full";
      await write(all);
      return {
        ok: false,
        error: "Volte à aba do Freelinnk para salvar os comentários recebidos.",
      };
    }
    const comments = Array.isArray(message.comments)
      ? message.comments.slice(0, 100).map(validateComment).filter(Boolean)
      : [];
    if (comments.length) entry.queue.push({ seq: entry.nextSeq++, comments });
    const statuses = [
      "collecting",
      "waiting",
      "idle",
      "limit",
      "paused",
      "unrecognized",
    ];
    entry.status = statuses.includes(message.status)
      ? message.status
      : "collecting";
    await write(all);
    return { ok: true };
  }
  return { ok: false };
}
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  serial = serial
    .then(() => handle(message, sender))
    .then(respond)
    .catch(() =>
      respond({
        ok: false,
        error:
          "Não foi possível comunicar com o leitor. Recarregue as duas abas e tente novamente.",
      }),
    );
  return true;
});
chrome.tabs.onUpdated.addListener((tabId, change) => {
  if (change.status !== "complete") return;
  serial = serial
    .then(async () => {
      const all = await bindings();
      const binding = Object.values(all).find(
        (entry) => entry.sourceTab === tabId,
      );
      if (!binding || binding.status !== "opening") return;
      let ready = false;
      for (let attempt = 0; attempt < 8; attempt++) {
        try {
          const result = await chrome.tabs.sendMessage(tabId, {
            kind: "COLLECTOR_START",
            sessionId: binding.sessionId,
            url: binding.url,
            mode: binding.mode,
          });
          ready = !!result?.ok;
          if (ready) break;
        } catch {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
      if (!ready) {
        binding.status = "unrecognized";
        await write(all);
      }
    })
    .catch(() => {});
});
chrome.tabs.onRemoved.addListener((tabId) => {
  serial = serial
    .then(async () => {
      const all = await bindings();
      for (const [key, binding] of Object.entries(all)) {
        if (Number(key) === tabId) {
          await stop(binding);
          delete all[key];
        } else if (binding.sourceTab === tabId) {
          binding.status = "disconnected";
        }
      }
      await write(all);
    })
    .catch(() => {});
});
chrome.action.onClicked.addListener(() =>
  chrome.tabs.create({ url: "https://www.freelinnk.com/dashboard/giveaway" }),
);
