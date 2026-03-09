import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ID DO ADMIN MASTER
const ADMIN_USER_ID = "user_301NTkVsE3v48SXkoCEp0XOXifI";

// --- QUERY: Buscar IDs pelo nome de usuário (slug) ---
export const getIdsBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    // 1. Encontrar o usuário pelo slug na tabela 'usernames'
    const userBySlug = await ctx.db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", args.slug))
      .first();

    let targetUserId = userBySlug?.userId;

    // 1.1 Se não achou em usernames, tenta em subAccounts
    if (!targetUserId) {
        const subAccountBySlug = await ctx.db
            .query("subAccounts")
            .withIndex("by_username", (q) => q.eq("username", args.slug))
            .first();
        if (subAccountBySlug) {
            targetUserId = subAccountBySlug.subUserId;
        }
    }

    if (!targetUserId) return null;

    // 2. Com o userId, buscar as configurações
    const trackingSettings = await ctx.db
      .query("tracking")
      .withIndex("by_userId", (q) => q.eq("userId", targetUserId))
      .first();

    return trackingSettings;
  },
});

// --- MUTAÇÃO: Salvar ou atualizar os IDs ---
export const saveTrackingIds = mutation({
  args: {
    userId: v.optional(v.string()), // Recebe o ID da sub-conta (se houver)
    facebookPixelId: v.optional(v.string()),
    googleAnalyticsId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Você precisa estar logado.");

    // Define o ID alvo (Sub-conta ou Conta Principal)
    const targetUserId = args.userId || identity.subject;

    // TRAVA DE SEGURANÇA: Garante que ninguém altere contas de terceiros
    if (targetUserId !== identity.subject && identity.subject !== ADMIN_USER_ID) {
        const subAccount = await ctx.db.query("subAccounts")
            .withIndex("by_sub_user", (q) => q.eq("subUserId", targetUserId))
            .first();

        if (!subAccount || subAccount.ownerUserId !== identity.subject) {
            throw new Error("Acesso negado: Você não tem permissão para editar esta página.");
        }
    }

    const existingSettings = await ctx.db
      .query("tracking")
      .withIndex("by_userId", (q) => q.eq("userId", targetUserId))
      .first();

    const cleanFacebookPixel = args.facebookPixelId?.trim();
    const facebookPixelId = cleanFacebookPixel && cleanFacebookPixel.length > 0
      ? cleanFacebookPixel
      : undefined;

    const cleanGoogleAnalytics = args.googleAnalyticsId?.trim();
    const googleAnalyticsId = cleanGoogleAnalytics && cleanGoogleAnalytics.length > 0
      ? cleanGoogleAnalytics
      : undefined;

    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, {
        facebookPixelId,
        googleAnalyticsId,
      });
    } else {
      await ctx.db.insert("tracking", {
        userId: targetUserId,
        facebookPixelId,
        googleAnalyticsId,
      });
    }

    return { success: true };
  },
});

// --- QUERY: Buscar as configurações (Lê sub-conta) ---
export const getMyTrackingIds = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const targetUserId = args.userId || identity.subject;

    return await ctx.db
      .query("tracking")
      .withIndex("by_userId", (q) => q.eq("userId", targetUserId))
      .first();
  }
});