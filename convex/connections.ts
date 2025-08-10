import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrUpdate = mutation({
  args: {
    provider: v.string(),
    providerAccountId: v.string(),
    accessToken: v.string(),
    tokenExpiresAt: v.optional(v.number()), // opcional
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Usuário não autenticado.");

    const { subject: userId } = identity;

    const existingConnection = await ctx.db
      .query("connections")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", userId).eq("provider", args.provider)
      )
      .unique();

    if (existingConnection) {
      await ctx.db.patch(existingConnection._id, {
        accessToken: args.accessToken,
        providerAccountId: args.providerAccountId,
        tokenExpiresAt: args.tokenExpiresAt,
      });
    } else {
      await ctx.db.insert("connections", {
        userId,
        provider: args.provider,
        providerAccountId: args.providerAccountId,
        accessToken: args.accessToken,
       tokenExpiresAt: args.tokenExpiresAt,
      });
    }
  },
});

export const get = query({
  args: {
    provider: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Usuário não autenticado.");

    const { subject: userId } = identity;

    return await ctx.db
      .query("connections")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", userId).eq("provider", args.provider)
      )
      .unique();
  },
});
