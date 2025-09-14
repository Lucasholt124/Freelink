// Em /convex/connections.ts
// (Substitua o arquivo inteiro)

import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

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

// --- QUERY (Pública, chamada pelo frontend) ---
export const get = query({
  args: { provider: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("connections")
      .withIndex("by_user_provider", q => q.eq("userId", identity.subject).eq("provider", args.provider))
      .unique();
  },
});

// --- ACTION (Pública, chamada pela API do Next.js) ---
export const exchangeCodeForToken = action({
  args: {
    code: v.string(),
    redirectUri: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new Error("Variáveis de ambiente do Instagram não configuradas no Convex.");

    // =======================================================
    // CORREÇÃO: Construindo as URLs com `new URL()` para mais robustez
    // =======================================================

    // Etapa 1: Trocar code por token de curta duração
    const tokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', clientId);
    tokenUrl.searchParams.set('client_secret', clientSecret);
    tokenUrl.searchParams.set('redirect_uri', args.redirectUri);
    tokenUrl.searchParams.set('code', args.code);

    const tokenResponse = await fetch(tokenUrl.toString()); // Usamos .toString()
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
        throw new Error(tokenData.error?.message || 'Falha ao obter token de curta duração.');
    }

    // Etapa 2: Trocar por token de longa duração
    const longTokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
    longTokenUrl.searchParams.set('grant_type', 'fb_exchange_token');
    longTokenUrl.searchParams.set('client_id', clientId);
    longTokenUrl.searchParams.set('client_secret', clientSecret);
    longTokenUrl.searchParams.set('fb_exchange_token', tokenData.access_token);

    const longTokenResponse = await fetch(longTokenUrl.toString());
    const longTokenData = await longTokenResponse.json();
    if (!longTokenResponse.ok || !longTokenData.access_token) {
        throw new Error(longTokenData.error?.message || 'Falha ao obter token de longa duração.');
    }

    // Etapa 3: Obter informações do usuário
    const userInfoUrl = new URL('https://graph.instagram.com/me');
    userInfoUrl.searchParams.set('fields', 'id,username');
    userInfoUrl.searchParams.set('access_token', longTokenData.access_token);

    const userInfoResponse = await fetch(userInfoUrl.toString());
    const userInfo = await userInfoResponse.json();
    if (!userInfoResponse.ok || !userInfo.id) {
        throw new Error(userInfo.error?.message || 'Falha ao buscar informações do usuário.');
    }

    // Etapa 4: Salvar no DB via mutation interna
    await ctx.runMutation(internal.connections.createOrUpdateInternal, {
        userId: args.userId,
        provider: 'instagram',
        providerAccountId: userInfo.id,
        accessToken: longTokenData.access_token,
        tokenExpiresAt: Date.now() + (longTokenData.expires_in * 1000),
    });

    return { success: true };
  },
});