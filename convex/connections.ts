// Em convex/connections.ts

import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api"; // IMPORTANTE: importação do objeto interno gerado pelo Convex

// --- MUTATION INTERNA (Segura, chamada apenas por actions) ---
export const createOrUpdateInternal = internalMutation({
  args: {
    userId: v.string(),
    provider: v.string(),
    providerAccountId: v.string(),
    accessToken: v.string(),
    tokenExpiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("connections")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", args.userId).eq("provider", args.provider)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        providerAccountId: args.providerAccountId,
        accessToken: args.accessToken,
        tokenExpiresAt: args.tokenExpiresAt,
      });
    } else {
      await ctx.db.insert("connections", {
        userId: args.userId,
        provider: args.provider,
        providerAccountId: args.providerAccountId,
        accessToken: args.accessToken,
        tokenExpiresAt: args.tokenExpiresAt,
      });
    }
  },
});

// --- QUERY (Pública, chamada pelo frontend para ver o status) ---
export const get = query({
  args: { provider: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("connections")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", identity.subject).eq("provider", args.provider)
      )
      .unique();
  },
});

// --- ACTION (Pública, chamada pela API de callback do Next.js) ---
export const exchangeCodeForToken = action({
  args: {
    code: v.string(),
    redirectUri: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Usuário não autenticado para realizar a troca de token.");

    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
    if (!clientId || !clientSecret)
      throw new Error("Variáveis de ambiente do Instagram não configuradas no Convex.");

    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${args.redirectUri}&code=${args.code}`;
    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(tokenData.error?.message || "Falha ao obter token de curta duração.");
    }

    const longTokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${tokenData.access_token}`;
    const longTokenResponse = await fetch(longTokenUrl);
    const longTokenData = await longTokenResponse.json();
    if (!longTokenResponse.ok || !longTokenData.access_token) {
      throw new Error(longTokenData.error?.message || "Falha ao obter token de longa duração.");
    }

    const userInfoUrl = `https://graph.instagram.com/me?fields=id,username&access_token=${longTokenData.access_token}`;
    const userInfoResponse = await fetch(userInfoUrl);
    const userInfo = await userInfoResponse.json();
    if (!userInfoResponse.ok || !userInfo.id) {
      throw new Error(userInfo.error?.message || "Falha ao buscar informações do usuário.");
    }

    // CHAMADA CORRETA AO ctx.runMutation USANDO internal.connections.createOrUpdateInternal
    await ctx.runMutation(internal.connections.createOrUpdateInternal, {
      userId: identity.subject,
      provider: "instagram",
      providerAccountId: userInfo.id,
      accessToken: longTokenData.access_token,
      tokenExpiresAt: Date.now() + (longTokenData.expires_in * 1000),
    });

    return { success: true };
  },
});
