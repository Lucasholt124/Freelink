// Em /convex/publicGiveaways.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Criar ou atualizar sorteio (requer autenticação)
export const saveGiveaway = mutation({
  args: {
    giveawayId: v.string(),
    title: v.string(),
    participants: v.array(v.object({
      id: v.string(),
      name: v.string(),
      identifier: v.string(),
      timestamp: v.string(),
      verified: v.optional(v.boolean()),
    })),
    isActive: v.boolean(),
    method: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Usuário não autenticado.");
    }

    const createdBy = identity.email || identity.subject;

    // Verificar se já existe
    const existing = await ctx.db
      .query("publicGiveaways")
      .withIndex("by_giveaway_id", (q) => q.eq("giveawayId", args.giveawayId))
      .first();

    if (existing) {
      // Atualizar
      await ctx.db.patch(existing._id, {
        title: args.title,
        participants: args.participants,
        isActive: args.isActive,
        updatedAt: Date.now(),
      });
      return { success: true, id: existing._id };
    } else {
      // Criar novo
      const id = await ctx.db.insert("publicGiveaways", {
        giveawayId: args.giveawayId,
        title: args.title,
        participants: args.participants,
        isActive: args.isActive,
        method: args.method,
        createdBy,
        createdAt: Date.now(),
      });
      return { success: true, id };
    }
  },
});

// Buscar sorteio por ID (público - sem autenticação)
export const getGiveaway = query({
  args: { giveawayId: v.string() },
  handler: async (ctx, args) => {
    const giveaway = await ctx.db
      .query("publicGiveaways")
      .withIndex("by_giveaway_id", (q) => q.eq("giveawayId", args.giveawayId))
      .first();

    if (!giveaway) {
      return null;
    }

    // Retornar no formato esperado pelo frontend
    return {
      id: giveaway.giveawayId,
      title: giveaway.title,
      participants: giveaway.participants,
      isActive: giveaway.isActive,
      method: giveaway.method,
      createdAt: new Date(giveaway.createdAt).toISOString(),
    };
  },
});

// Adicionar participante (público - sem autenticação)
export const addParticipant = mutation({
  args: {
    giveawayId: v.string(),
    participant: v.object({
      id: v.string(),
      name: v.string(),
      identifier: v.string(),
      timestamp: v.string(),
      verified: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const giveaway = await ctx.db
      .query("publicGiveaways")
      .withIndex("by_giveaway_id", (q) => q.eq("giveawayId", args.giveawayId))
      .first();

    if (!giveaway) {
      throw new Error("Sorteio não encontrado");
    }

    if (!giveaway.isActive) {
      throw new Error("Este sorteio não está mais ativo");
    }

    // Verificar se já está participando
    const alreadyParticipating = giveaway.participants.some(
      (p) => p.identifier.toLowerCase() === args.participant.identifier.toLowerCase()
    );

    if (alreadyParticipating) {
      throw new Error("Você já está participando deste sorteio!");
    }

    // Adicionar participante
    const updatedParticipants = [...giveaway.participants, args.participant];

    await ctx.db.patch(giveaway._id, {
      participants: updatedParticipants,
      updatedAt: Date.now(),
    });

    return { success: true, totalParticipants: updatedParticipants.length };
  },
});

// Listar sorteios do usuário (requer autenticação)
export const getUserGiveaways = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const createdBy = identity.email || identity.subject;

    const giveaways = await ctx.db
      .query("publicGiveaways")
      .withIndex("by_creator", (q) => q.eq("createdBy", createdBy))
      .order("desc")
      .take(50);

    return giveaways.map(g => ({
      id: g.giveawayId,
      title: g.title,
      participants: g.participants,
      isActive: g.isActive,
      method: g.method,
      createdAt: new Date(g.createdAt).toISOString(),
      participantsCount: g.participants.length,
    }));
  },
});

// Deletar sorteio (requer autenticação e ser o criador)
export const deleteGiveaway = mutation({
  args: { giveawayId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Usuário não autenticado.");
    }

    const createdBy = identity.email || identity.subject;

    const giveaway = await ctx.db
      .query("publicGiveaways")
      .withIndex("by_giveaway_id", (q) => q.eq("giveawayId", args.giveawayId))
      .first();

    if (!giveaway) {
      throw new Error("Sorteio não encontrado");
    }

    if (giveaway.createdBy !== createdBy) {
      throw new Error("Você não tem permissão para deletar este sorteio");
    }

    await ctx.db.delete(giveaway._id);

    return { success: true };
  },
});

// Finalizar sorteio (requer autenticação e ser o criador)
export const endGiveaway = mutation({
  args: { giveawayId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Usuário não autenticado.");
    }

    const createdBy = identity.email || identity.subject;

    const giveaway = await ctx.db
      .query("publicGiveaways")
      .withIndex("by_giveaway_id", (q) => q.eq("giveawayId", args.giveawayId))
      .first();

    if (!giveaway) {
      throw new Error("Sorteio não encontrado");
    }

    if (giveaway.createdBy !== createdBy) {
      throw new Error("Você não tem permissão para finalizar este sorteio");
    }

    await ctx.db.patch(giveaway._id, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});