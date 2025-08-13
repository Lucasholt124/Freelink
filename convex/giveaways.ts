// Em /convex/giveaways.ts
// (Substitua o arquivo inteiro)

import { action } from "./_generated/server";
import { v } from "convex/values";


// --- ACTION para o sorteio do Instagram (agora recebe uma lista de comentários) ---
export const runInstagramGiveaway = action({
  args: {
    comments: v.array(v.string()), // Recebe a lista de comentários já extraída
    unique: v.boolean(),
    mentions: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Usuário não autenticado.");

    if (args.comments.length === 0) {
      throw new Error("Nenhum comentário foi fornecido.");
    }

    // Processa a lista de texto para um formato de objeto
    let eligibleComments = args.comments.map(c => {
        const parts = c.split(/\s+/); // Divide por espaços
        const username = parts[0]?.replace(':', '') || 'desconhecido';
        return { username, text: c };
    });

    if (args.mentions > 0) {
      eligibleComments = eligibleComments.filter(c => (c.text.match(/@/g) || []).length >= args.mentions);
    }
    if (args.unique) {
      const uniqueUsernames = new Set<string>();
      eligibleComments = eligibleComments.filter(c => {
        if (!uniqueUsernames.has(c.username)) {
          uniqueUsernames.add(c.username);
          return true;
        }
        return false;
      });
    }

    if (eligibleComments.length === 0) throw new Error("Nenhum comentário elegível encontrado com esses filtros.");
    const winner = eligibleComments[Math.floor(Math.random() * eligibleComments.length)];

    return {
      username: winner.username,
      commentText: winner.text,
      profilePicUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(winner.username)}`,
    };
  },
});

// --- ACTION para sorteio de Lista ---
export const runListGiveaway = action({
    args: {
        participants: v.array(v.string()),
        unique: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Usuário não autenticado.");

        let participantsList = args.participants.map(p => p.trim()).filter(p => p.length > 0);
        if (participantsList.length === 0) throw new Error("A lista de participantes está vazia.");

        if (args.unique) {
            participantsList = [...new Set(participantsList)];
        }
        if (participantsList.length === 0) throw new Error("A lista ficou vazia após remover duplicatas.");

        const winnerName = participantsList[Math.floor(Math.random() * participantsList.length)];

        return {
            username: winnerName,
            commentText: "Selecionado(a) da lista",
            profilePicUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(winnerName)}`
        };
    }
});