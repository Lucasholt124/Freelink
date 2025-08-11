// convex/storeInstagramToken.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const storeInstagramToken = mutation({
  args: {
    userId: v.string(),
    provider: v.string(), // "instagram"
    providerAccountId: v.string(),
    accessToken: v.string(),
    tokenExpiresAt: v.optional(v.number()), // pode ser undefined
  },
  handler: async (ctx, args) => {
    // Verifica se já existe uma conexão desse provider para o usuário
    const existing = await ctx.db
      .query("connections")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", args.userId).eq("provider", args.provider)
      )
      .first();

    if (existing) {
      // Atualiza o registro existente
      await ctx.db.patch(existing._id, {
        providerAccountId: args.providerAccountId,
        accessToken: args.accessToken,
        tokenExpiresAt: args.tokenExpiresAt ?? undefined,
      });
    } else {
      // Cria um novo registro
      await ctx.db.insert("connections", {
        userId: args.userId,
        provider: args.provider,
        providerAccountId: args.providerAccountId,
        accessToken: args.accessToken,
        tokenExpiresAt: args.tokenExpiresAt ?? undefined,
      });
    }
  },
});
