import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// 1. QUERY: Busca quem é Free e precisa receber email
// Roda no ambiente Edge (Padrão do Convex)
export const getTargets = internalQuery({
  handler: async (ctx) => {
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;

    const users = await ctx.db
      .query("usernames")
      .withIndex("by_plan", (q) => q.eq("plan", "free"))
      .collect();

    const targets = [];

    for (const user of users) {
      if (!user.createdAt || !user.email) continue;

      const createdDaysAgo = (now - user.createdAt) / dayInMs;
      const stage = user.marketingStage || 0;
      const lastSent = user.lastMarketingSentAt || 0;
      const daysSinceLastSent = (now - lastSent) / dayInMs;

      if (stage === 0 && createdDaysAgo >= 3) {
        targets.push({ user, type: 'day3' });
      } else if (stage === 1 && daysSinceLastSent >= 6) {
        targets.push({ user, type: 'day9' });
      } else if (stage === 2 && daysSinceLastSent >= 12) {
        targets.push({ user, type: 'day21' });
      }
    }

    return targets.slice(0, 50);
  },
});

// 2. MUTATION: Atualiza o banco depois de enviar
export const updateStats = internalMutation({
  args: { userId: v.id("usernames"), newStage: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      marketingStage: args.newStage,
      lastMarketingSentAt: Date.now(),
    });
  },
});