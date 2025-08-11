// convex/getInstagramData.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getInstagramData = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const connection = await ctx.db
      .query("connections")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", args.userId).eq("provider", "instagram")
      )
      .first();

    if (!connection) return null;

    return {
      providerAccountId: connection.providerAccountId,
      accessToken: connection.accessToken,
      tokenExpiresAt: connection.tokenExpiresAt ?? null,
    };
  },
});
