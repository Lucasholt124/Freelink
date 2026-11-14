const RESERVED = new Set([
  "accounts",
  "direct",
  "explore",
  "reels",
  "reel",
  "p",
  "stories",
  "about",
  "legal",
]);
export function profileUsername(anchor) {
  try {
    const url = new URL(
      anchor.getAttribute("href"),
      "https://www.instagram.com",
    );
    const parts = url.pathname.split("/").filter(Boolean);
    if (
      !["instagram.com", "www.instagram.com"].includes(url.hostname) ||
      parts.length !== 1 ||
      RESERVED.has(parts[0]) ||
      !/^[a-zA-Z0-9_.]{1,30}$/.test(parts[0])
    )
      return null;
    const text = anchor.textContent.trim().replace(/^@/, "");
    return text.toLowerCase() === parts[0].toLowerCase()
      ? parts[0].toLowerCase()
      : null;
  } catch {
    return null;
  }
}
function cleanText(value) {
  return value.replace(/\s+/g, " ").trim();
}
export function extractComment(row, mode, now = new Date().toISOString()) {
  if (
    row.closest("nav,header,form,[data-freelinnk-reader]") ||
    row.querySelector("h1")
  )
    return null;
  const authors = Array.from(row.querySelectorAll("h3 a[href],a[href]"))
    .map((anchor) => ({ anchor, user: profileUsername(anchor) }))
    .filter(
      (item) => item.user && !item.anchor.textContent.trim().startsWith("@"),
    );
  if (new Set(authors.map((item) => item.user)).size > 1) return null;
  if (!authors.length) return null;
  const { anchor, user } = authors[0];
  if (mode === "post" && !row.querySelector("time") && !row.querySelector("h3"))
    return null;
  const textNodes = Array.from(
    row.querySelectorAll('span[dir="auto"],span[dir="ltr"],p[dir="auto"]'),
  )
    .filter(
      (element) =>
        !element.closest('a,button,time,h3,[role="button"]') &&
        !element.querySelector('h3,time,button,[role="button"]'),
    )
    .map((element) => cleanText(element.textContent))
    .filter((text) => text && text !== user && text.length <= 2200);
  const text = textNodes.sort((a, b) => b.length - a.length)[0];
  if (!text) return null;
  if (
    mode === "live" &&
    /^(joined|joined the live video|entrou|entrou na live|entrou no video ao vivo|requested to join|pediu para participar|started following you|comecou a seguir voce)$/i.test(
      text.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
    )
  )
    return null;
  const time = row.querySelector("time[datetime]")?.getAttribute("datetime");
  const publishedAt =
    time && Number.isFinite(Date.parse(time))
      ? new Date(time).toISOString()
      : undefined;
  const nativeLink = Array.from(row.querySelectorAll("a[href]"))
    .map((link) => link.getAttribute("href"))
    .find((href) => /\/c\/\d+|[?&]comment_id=\d+/.test(href));
  const nativeId = nativeLink?.match(/(?:\/c\/|comment_id=)(\d+)/)?.[1];
  const id = nativeId
    ? `ig:${nativeId}`
    : `text:${user}:${text}:${publishedAt || ""}`;
  return {
    id,
    username: user,
    text,
    capturedAt: now,
    ...(publishedAt ? { publishedAt } : {}),
  };
}
export function extractComments(root, mode, now) {
  const semantic = Array.from(root.querySelectorAll('ul li,[role="listitem"]'));
  const candidates = semantic.length ? semantic : Array.from(root.children);
  const seen = new Set();
  const found = [];
  for (const row of candidates) {
    const comment = extractComment(row, mode, now);
    if (comment && !seen.has(comment.id)) {
      seen.add(comment.id);
      found.push(comment);
    }
  }
  return found;
}
export function findCommentRow(target, mode) {
  let row = target instanceof Element ? target : null;
  for (let step = 0; row && step < 6; step++, row = row.parentElement) {
    if (row.tagName === "MAIN" || row.tagName === "BODY") break;
    if (extractComment(row, mode)) return row;
  }
  return null;
}
