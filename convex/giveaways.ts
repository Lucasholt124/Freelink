import { action } from "./_generated/server";
import { v } from "convex/values";

// --- Sorteio Instagram ---
export const runInstagramGiveaway = action({
  args: {
    comments: v.array(v.string()),
    unique: v.boolean(),
    mentions: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Usuário não autenticado.");

    if (args.comments.length === 0) {
      throw new Error("Nenhum comentário foi fornecido.");
    }

    let eligibleComments = args.comments.map((c) => {
      const parts = c.split(/\s+/);
      const username = parts[0]?.replace(":", "") || "desconhecido";
      return { username, text: c };
    });

    if (args.mentions > 0) {
      eligibleComments = eligibleComments.filter(
        (c) => (c.text.match(/@/g) || []).length >= args.mentions
      );
    }
    if (args.unique) {
      const uniqueUsernames = new Set<string>();
      eligibleComments = eligibleComments.filter((c) => {
        if (!uniqueUsernames.has(c.username)) {
          uniqueUsernames.add(c.username);
          return true;
        }
        return false;
      });
    }

    if (eligibleComments.length === 0)
      throw new Error("Nenhum comentário elegível encontrado com esses filtros.");

    const winner =
      eligibleComments[Math.floor(Math.random() * eligibleComments.length)];

    return {
      username: winner.username,
      commentText: winner.text,
      profilePicUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(
        winner.username
      )}`,
    };
  },
});

// --- Sorteio Lista ---
export const runListGiveaway = action({
  args: {
    participants: v.array(v.string()),
    unique: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Usuário não autenticado.");

    let participantsList = args.participants
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    if (participantsList.length === 0)
      throw new Error("A lista de participantes está vazia.");

    if (args.unique) {
      participantsList = [...new Set(participantsList)];
    }
    if (participantsList.length === 0)
      throw new Error("A lista ficou vazia após remover duplicatas.");

    const winnerName =
      participantsList[Math.floor(Math.random() * participantsList.length)];

    return {
      username: winnerName,
      commentText: "Selecionado(a) da lista",
      profilePicUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(
        winnerName
      )}`,
    };
  },
});

// --- Sorteio Numérico ---
export const runNumberGiveaway = action({
  args: {
    min: v.number(),
    max: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Usuário não autenticado.");

    if (args.min > args.max) {
      throw new Error("O valor mínimo não pode ser maior que o máximo.");
    }

    const number =
      Math.floor(Math.random() * (args.max - args.min + 1)) + args.min;

    return { number };
  },
});

// --- Sorteio Ponderado (Lista com pesos) ---
export const runWeightedListGiveaway = action({
  args: {
    participants: v.array(
      v.object({
        username: v.string(),
        weight: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Usuário não autenticado.");

    if (args.participants.length === 0)
      throw new Error("A lista de participantes está vazia.");

    // Soma total dos pesos
    const totalWeight = args.participants.reduce(
      (acc, p) => acc + p.weight,
      0
    );
    if (totalWeight <= 0)
      throw new Error("A soma dos pesos deve ser maior que zero.");

    // Sorteio ponderado
    let random = Math.random() * totalWeight;
    for (const participant of args.participants) {
      random -= participant.weight;
      if (random <= 0) {
        return {
          username: participant.username,
          weight: participant.weight,
          commentText: "Selecionado(a) ponderado(a)",
          profilePicUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(
            participant.username
          )}`,
        };
      }
    }

    // Fallback (não deve ocorrer)
    const fallback = args.participants[0];
    return {
      username: fallback.username,
      weight: fallback.weight,
      commentText: "Selecionado(a) ponderado(a)",
      profilePicUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(
        fallback.username
      )}`,
    };
  },
});