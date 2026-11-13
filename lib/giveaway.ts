export type GiveawayMethod = "link" | "qrcode";
export type GiveawayParticipant = {
  id: string;
  name: string;
  identifier: string;
  timestamp: string;
  verified?: boolean;
};
export type Giveaway = {
  id: string;
  title: string;
  participants: GiveawayParticipant[];
  isActive: boolean;
  method?: string;
  createdAt: string;
};
export type GiveawayResult = {
  giveawayId: string;
  title: string;
  winner: GiveawayParticipant;
  total: number;
  drawnAt: string;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
export function filterParticipants(
  participants: GiveawayParticipant[],
  search: string,
) {
  const terms = normalize(search).trim().split(/\s+/).filter(Boolean);
  return participants.filter((participant) =>
    terms.every((term) =>
      normalize(`${participant.name} ${participant.identifier}`).includes(term),
    ),
  );
}
export function filterGiveaways(
  giveaways: Giveaway[],
  status: "all" | "active" | "closed",
) {
  return giveaways.filter(
    (giveaway) =>
      status === "all" ||
      (status === "active" ? giveaway.isActive : !giveaway.isActive),
  );
}
export function participantContact(identifier: string) {
  return identifier.replace(/^(Instagram|WhatsApp):\s*/i, "").trim();
}
export function giveawayDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data indisponível";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
export function randomParticipantIndex(
  count: number,
  nextUint32: () => number,
) {
  if (!Number.isSafeInteger(count) || count < 2 || count > 0x100000000)
    throw new Error("São necessários pelo menos dois participantes.");
  const limit = 0x100000000 - (0x100000000 % count);
  let value: number;
  do {
    value = nextUint32();
    if (!Number.isInteger(value) || value < 0 || value >= 0x100000000)
      throw new Error("Não foi possível realizar o sorteio.");
  } while (value >= limit);
  return value % count;
}
export function drawGiveaway(
  giveaway: Giveaway,
  nextUint32: () => number,
  drawnAt = new Date().toISOString(),
): GiveawayResult {
  const index = randomParticipantIndex(
    giveaway.participants.length,
    nextUint32,
  );
  return {
    giveawayId: giveaway.id,
    title: giveaway.title,
    total: giveaway.participants.length,
    drawnAt,
    winner: { ...giveaway.participants[index] },
  };
}
export function resultStorageKey(userId: string, giveawayId: string) {
  return `freelinnk:giveaway-result:v1:${encodeURIComponent(userId)}:${encodeURIComponent(giveawayId)}`;
}
export function parseGiveawayResult(
  value: string | null,
  giveawayId: string,
): GiveawayResult | null {
  if (!value) return null;
  try {
    const result = JSON.parse(value);
    if (
      result?.giveawayId !== giveawayId ||
      typeof result.title !== "string" ||
      !Number.isSafeInteger(result.total) ||
      result.total < 2 ||
      typeof result.drawnAt !== "string" ||
      Number.isNaN(Date.parse(result.drawnAt))
    )
      return null;
    const winner = result.winner;
    if (
      !winner ||
      ![winner.id, winner.name, winner.identifier, winner.timestamp].every(
        (field) => typeof field === "string",
      )
    )
      return null;
    return {
      giveawayId,
      title: result.title,
      total: result.total,
      drawnAt: result.drawnAt,
      winner: {
        id: winner.id,
        name: winner.name,
        identifier: winner.identifier,
        timestamp: winner.timestamp,
      },
    };
  } catch {
    return null;
  }
}
export function giveawayResultText(result: GiveawayResult) {
  return `Resultado do sorteio: ${result.title}\n\nPessoa sorteada: ${result.winner.name}\nContato: ${result.winner.identifier}\nParticipantes considerados: ${result.total}\nData: ${new Date(result.drawnAt).toLocaleString("pt-BR")}\n\nRealizado no Freelinnk.`;
}
