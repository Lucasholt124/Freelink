// Em convex/tracking.ts

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// --- QUERY: Buscar IDs pelo nome de usuário (slug) ---
export const getIdsBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    // 1. Encontrar o usuário pelo slug na tabela 'usernames'
    const userBySlug = await ctx.db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", args.slug))
      .first();

    if (!userBySlug) {
      return null;
    }

    // 2. Com o userId, buscar as configurações de rastreamento na tabela 'tracking'
    const trackingSettings = await ctx.db
      .query("tracking")
      .withIndex("by_userId", (q) => q.eq("userId", userBySlug.userId))
      .first();

    return trackingSettings;
  },
});

// --- MUTAÇÃO: Salvar ou atualizar os IDs ---
export const saveTrackingIds = mutation({
  args: {
    // A validação de entrada continua a mesma
    facebookPixelId: v.optional(v.string()),
    googleAnalyticsId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Você precisa estar logado.");
    }
    const userId = identity.subject;

    const existingSettings = await ctx.db
      .query("tracking")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    // --- CORREÇÃO PRINCIPAL AQUI ---
    // Se a string estiver vazia ou for apenas espaços, o valor se torna `undefined`.
    // Isso corresponde exatamente ao tipo `v.optional(v.string())` do schema.
    const facebookPixelId = args.facebookPixelId?.trim() || undefined;
    const googleAnalyticsId = args.googleAnalyticsId?.trim() || undefined;

    if (existingSettings) {
      // O 'patch' agora recebe `string | undefined`, que é o tipo correto.
      await ctx.db.patch(existingSettings._id, {
        facebookPixelId,
        googleAnalyticsId,
      });
    } else {
      // O 'insert' agora recebe `string | undefined`, que também é o tipo correto.
      await ctx.db.insert("tracking", {
        userId,
        facebookPixelId,
        googleAnalyticsId,
      });
    }
    return { success: true };
  },
});

// --- QUERY: Buscar as configurações do usuário logado (para o formulário do dashboard) ---
export const getMyTrackingIds = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    return await ctx.db
      .query("tracking")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();
  }
});