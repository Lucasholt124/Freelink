// Em convex/connections.ts
// (Substitua o conteúdo deste arquivo. Você pode deletar storeInstagramToken.ts e getInstagramData.ts)

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Esta mutation faz o papel de "store" e "update" em uma só função.
export const createOrUpdate = mutation({
  args: {
    provider: v.string(),
    providerAccountId: v.string(),
    accessToken: v.string(),
    tokenExpiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Usuário não autenticado.");

    const existing = await ctx.db
      .query("connections")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", identity.subject).eq("provider", args.provider)
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
        userId: identity.subject,
        provider: args.provider,
        providerAccountId: args.providerAccountId,
        accessToken: args.accessToken,
        tokenExpiresAt: args.tokenExpiresAt,
      });
    }
  },
});

// Esta query busca os dados da conexão para o usuário logado.
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