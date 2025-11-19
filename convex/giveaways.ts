// convex/publicGiveaways.ts - VERSÃO TIPADA E SEGURA
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Definição do objeto Participante para reutilizar e evitar 'any'
const participantSchema = v.object({
  id: v.string(),
  name: v.string(),
  identifier: v.string(),
  timestamp: v.string(),
  verified: v.optional(v.boolean()),
  platform: v.optional(v.string()),
});

// ============================================
// 💾 CRUD DE SORTEIOS
// ============================================

export const saveGiveaway = mutation({
  args: {
    giveawayId: v.string(),
    title: v.string(),
    // ✅ CORREÇÃO: Trocamos v.any() pela estrutura real
    participants: v.array(participantSchema),
    isActive: v.boolean(),
    method: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const existing = await ctx.db
      .query("publicGiveaways")
      .withIndex("by_giveaway_id", (q) => q.eq("giveawayId", args.giveawayId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("publicGiveaways", {
      giveawayId: args.giveawayId,
      title: args.title,
      createdBy: identity.subject,
      participants: args.participants, // Agora tipado corretamente
      isActive: true,
      method: args.method,
      createdAt: Date.now(),
    });
  },
});

export const getUserGiveaways = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const giveaways = await ctx.db
      .query("publicGiveaways")
      .withIndex("by_creator", (q) => q.eq("createdBy", identity.subject))
      .order("desc")
      .collect();

    return giveaways.map((g) => ({
      ...g,
      id: g.giveawayId,
      participantsCount: g.participants.length,
    }));
  },
});

export const getGiveaway = query({
  args: { giveawayId: v.string() },
  handler: async (ctx, args) => {
    const giveaway = await ctx.db
      .query("publicGiveaways")
      .withIndex("by_giveaway_id", (q) => q.eq("giveawayId", args.giveawayId))
      .first();

    if (!giveaway) return null;

    return {
      ...giveaway,
      id: giveaway.giveawayId,
    };
  },
});

export const deleteGiveaway = mutation({
  args: { giveawayId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const giveaway = await ctx.db
      .query("publicGiveaways")
      .withIndex("by_giveaway_id", (q) => q.eq("giveawayId", args.giveawayId))
      .first();

    if (!giveaway || giveaway.createdBy !== identity.subject) {
      throw new Error("Permissão negada");
    }

    await ctx.db.delete(giveaway._id);
  },
});

export const endGiveaway = mutation({
  args: { giveawayId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const giveaway = await ctx.db
      .query("publicGiveaways")
      .withIndex("by_giveaway_id", (q) => q.eq("giveawayId", args.giveawayId))
      .first();

    if (!giveaway || giveaway.createdBy !== identity.subject) {
      throw new Error("Erro ao acessar sorteio");
    }

    await ctx.db.patch(giveaway._id, { isActive: false });
  },
});

// ============================================
// 🎲 FUNÇÃO DE SORTEIO (PickWinner)
// ============================================

export const pickWinner = mutation({
  args: { giveawayId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const giveaway = await ctx.db
      .query("publicGiveaways")
      .withIndex("by_giveaway_id", (q) => q.eq("giveawayId", args.giveawayId))
      .first();

    if (!giveaway || giveaway.createdBy !== identity.subject) {
      throw new Error("Sorteio não encontrado ou permissão negada");
    }

    if (giveaway.participants.length < 2) {
      throw new Error("Mínimo de 2 participantes necessários");
    }

    const randomIndex = Math.floor(Math.random() * giveaway.participants.length);
    const winner = giveaway.participants[randomIndex];

    return {
      name: winner.name,
      identifier: winner.identifier,
      timestamp: new Date().toISOString(),
      method: giveaway.method,
      total: giveaway.participants.length
    };
  },
});

// Função pública para entrar no sorteio
export const joinGiveaway = mutation({
  args: {
    giveawayId: v.string(),
    name: v.string(),
    identifier: v.string()
  },
  handler: async (ctx, args) => {
    const giveaway = await ctx.db
      .query("publicGiveaways")
      .withIndex("by_giveaway_id", (q) => q.eq("giveawayId", args.giveawayId))
      .first();

    if (!giveaway) throw new Error("Sorteio não existe");
    if (!giveaway.isActive) throw new Error("Sorteio encerrado");

    const exists = giveaway.participants.some(
      (p) => p.identifier === args.identifier
    );

    if (exists) throw new Error("Você já está participando!");

    const newParticipant = {
      id: Math.random().toString(36).substr(2, 9),
      name: args.name,
      identifier: args.identifier,
      timestamp: new Date().toISOString(),
      verified: true
    };

    await ctx.db.patch(giveaway._id, {
      participants: [...giveaway.participants, newParticipant]
    });

    return { success: true };
  },
});