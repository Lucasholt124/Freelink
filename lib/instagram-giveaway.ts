export type InstagramMode = "post" | "live";
export type InstagramComment = {
  id: string;
  username: string;
  text: string;
  capturedAt: string;
  publishedAt?: string;
};
export type CommentRules = {
  uniqueUsers: boolean;
  keyword: string;
  mentions: number;
  excludedUsers: string;
};
export type InstagramDraw = {
  id: string;
  drawnAt: string;
  winner: InstagramComment;
  eligibleCount: number;
  rules: CommentRules;
  entries: InstagramComment[];
  digest: string;
};
export type InstagramSession = {
  id: string;
  title: string;
  url: string;
  mode: InstagramMode;
  createdAt: string;
  closedAt?: string;
  comments: InstagramComment[];
  draws: InstagramDraw[];
};
export const COMMENT_LIMIT = 5000;
export const defaultCommentRules: CommentRules = {
  uniqueUsers: true,
  keyword: "",
  mentions: 0,
  excludedUsers: "",
};
export const normalizeCommentText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
export function instagramSource(value: string, mode: InstagramMode) {
  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== "https:" ||
      !["instagram.com", "www.instagram.com"].includes(url.hostname) ||
      url.port ||
      url.username ||
      url.password
    )
      return null;
    let parts = url.pathname.split("/").filter(Boolean);
    if (
      mode === "post" &&
      parts.length === 3 &&
      /^[a-zA-Z0-9_.]{1,30}$/.test(parts[0]) &&
      ["p", "reel", "reels"].includes(parts[1])
    )
      parts = parts.slice(1);
    if (
      mode === "post" &&
      parts.length === 2 &&
      ["p", "reel", "reels"].includes(parts[0]) &&
      /^[\w-]{5,80}$/.test(parts[1])
    )
      return `https://www.instagram.com/${parts[0] === "p" ? "p" : "reel"}/${parts[1]}/`;
    if (
      mode === "live" &&
      parts.length >= 2 &&
      parts.length <= 3 &&
      /^[a-zA-Z0-9_.]{1,30}$/.test(parts[0]) &&
      parts[1] === "live" &&
      (!parts[2] || /^\d{5,30}$/.test(parts[2]))
    ) {
      const id = parts[2] || url.searchParams.get("broadcast_id");
      if (id && !/^\d{5,30}$/.test(id)) return null;
      return `https://www.instagram.com/${parts[0]}/live/${id ? `?broadcast_id=${id}` : ""}`;
    }
  } catch {}
  return null;
}
export function validateComment(value: unknown): InstagramComment | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (
    typeof item.id !== "string" ||
    item.id.length > 2500 ||
    !item.id ||
    typeof item.username !== "string" ||
    !/^[a-zA-Z0-9_.]{1,30}$/.test(item.username) ||
    typeof item.text !== "string" ||
    !item.text.trim() ||
    item.text.length > 2200 ||
    typeof item.capturedAt !== "string" ||
    !Number.isFinite(Date.parse(item.capturedAt))
  )
    return null;
  const publishedAt =
    typeof item.publishedAt === "string" &&
    Number.isFinite(Date.parse(item.publishedAt))
      ? item.publishedAt
      : undefined;
  return {
    id: item.id,
    username: item.username.toLowerCase(),
    text: item.text.trim(),
    capturedAt: item.capturedAt,
    ...(publishedAt ? { publishedAt } : {}),
  };
}
export function mergeCommentBatch(
  existing: InstagramComment[],
  incoming: unknown[],
) {
  const result = [...existing];
  const ids = new Set(existing.map((comment) => comment.id));
  let rejected = 0;
  for (const raw of incoming.slice(0, 200)) {
    const comment = validateComment(raw);
    if (!comment) {
      rejected++;
      continue;
    }
    if (ids.has(comment.id)) continue;
    if (result.length >= COMMENT_LIMIT) break;
    ids.add(comment.id);
    result.push(comment);
  }
  return {
    comments: result,
    added: result.length - existing.length,
    rejected,
    atLimit: result.length >= COMMENT_LIMIT,
  };
}
export function commentEntries(
  comments: InstagramComment[],
  rules: CommentRules,
  previousWinners: string[] = [],
) {
  const excluded = new Set([
    ...rules.excludedUsers
      .split(/[\s,;]+/)
      .map((name) => name.replace(/^@/, "").toLowerCase()),
    ...previousWinners.map((name) => name.toLowerCase()),
  ]);
  const seen = new Set<string>();
  const keyword = normalizeCommentText(rules.keyword);
  const mentions = Number.isFinite(rules.mentions)
    ? Math.max(0, Math.min(5, Math.floor(rules.mentions)))
    : 0;
  return comments.filter((comment) => {
    const user = comment.username.toLowerCase();
    if (
      excluded.has(user) ||
      (keyword && !normalizeCommentText(comment.text).includes(keyword))
    )
      return false;
    const tags = new Set(
      [
        ...comment.text.matchAll(
          /(?:^|[^a-zA-Z0-9_.@])@([a-zA-Z0-9_.]{1,30})(?![a-zA-Z0-9_.])/g,
        ),
      ]
        .map((match) => match[1].toLowerCase())
        .filter((name) => name !== user),
    );
    if (tags.size < mentions || (rules.uniqueUsers && seen.has(user)))
      return false;
    seen.add(user);
    return true;
  });
}
export function uniformIndex(length: number, random: () => number) {
  if (!Number.isSafeInteger(length) || length < 2 || length > COMMENT_LIMIT)
    throw new Error("São necessárias pelo menos duas chances elegíveis.");
  const cap = 0x100000000 - (0x100000000 % length);
  let number: number;
  do {
    number = random();
    if (!Number.isInteger(number) || number < 0 || number >= 0x100000000)
      throw new Error("Não foi possível gerar o resultado.");
  } while (number >= cap);
  return number % length;
}
export async function drawInstagramSession(
  session: InstagramSession,
  rules: CommentRules,
  random: () => number,
  id: string,
  drawnAt: string,
  digest: (text: string) => Promise<string>,
): Promise<InstagramDraw> {
  if (!session.closedAt)
    throw new Error("Encerre a captura e confira a lista antes de sortear.");
  const entries = commentEntries(
    session.comments,
    rules,
    session.draws.map((draw) => draw.winner.username),
  );
  const winner = entries[uniformIndex(entries.length, random)];
  const payload = {
    sessionId: session.id,
    source: session.url,
    closedAt: session.closedAt,
    id,
    drawnAt,
    rules: { ...rules },
    entries: entries.map((entry) => ({ ...entry })),
    winner: { ...winner },
  };
  return {
    id,
    drawnAt,
    winner: payload.winner,
    eligibleCount: entries.length,
    rules: payload.rules,
    entries: payload.entries,
    digest: await digest(JSON.stringify(payload)),
  };
}
export function exportInstagramAudit(session: InstagramSession) {
  return JSON.stringify(
    {
      format: "freelinnk-comments-v1",
      collection:
        "Comentários carregados no navegador; a lista pode ser parcial. Comentários idênticos sem identificador nativo contam uma vez. Não verifica curtidas ou seguidores.",
      integrity:
        "O resumo SHA-256 registra o conteúdo do sorteio; não é certificação independente de origem ou aleatoriedade.",
      session,
    },
    null,
    2,
  );
}
export function commentCsv(comments: InstagramComment[]) {
  const cell = (value: string) =>
    `"${(/^[=+\-@\t\r]/.test(value) ? "'" + value : value).replace(/"/g, '""')}"`;
  return (
    "\ufeff" +
    [
      ["usuario", "comentario", "coletado_em"],
      ...comments.map((comment) => [
        "@" + comment.username,
        comment.text,
        comment.capturedAt,
      ]),
    ]
      .map((row) => row.map(cell).join(";"))
      .join("\r\n")
  );
}
