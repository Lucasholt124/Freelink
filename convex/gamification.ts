// convex/gamification.ts - CRIAR NOVO ARQUIVO
import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const initUserStats = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const existing = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (existing) return existing;

    return await ctx.db.insert("userStats", {
      userId: identity.subject,
      currentStreak: 0,
      longestStreak: 0,
      totalSales: 0,
      totalRevenue: 0,
      level: 1,
      xp: 0,
      lastActivityDate: new Date().toISOString().split("T")[0],
      badges: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();
  },
});

export const updateActivityStreak = internalMutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!stats) return;

    const today = new Date().toISOString().split("T")[0];
    const lastDate = new Date(stats.lastActivityDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let newStreak = stats.currentStreak;
    if (diffDays === 1) {
      newStreak = stats.currentStreak + 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }

    const newXP = stats.xp + 10;
    const newLevel = Math.floor(newXP / 100) + 1;

    await ctx.db.patch(stats._id, {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, stats.longestStreak),
      lastActivityDate: today,
      xp: newXP,
      level: newLevel,
      updatedAt: Date.now(),
    });

    // Conquistas automáticas
    if (newStreak === 7) {
      await ctx.db.insert("achievements", {
        userId: args.userId,
        type: "streak_7",
        title: "🔥 Fogo no Parquinho!",
        description: "7 dias seguidos registrando",
        icon: "🔥",
        unlockedAt: Date.now(),
        seen: false,
      });
    }

    if (newStreak === 30) {
      await ctx.db.insert("achievements", {
        userId: args.userId,
        type: "streak_30",
        title: "🚀 Mestre da Consistência",
        description: "30 dias sem parar!",
        icon: "🚀",
        unlockedAt: Date.now(),
        seen: false,
      });
    }
  },
});

export const getUnseenAchievements = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("achievements")
      .withIndex("by_user_unseen", (q) =>
        q.eq("userId", identity.subject).eq("seen", false)
      )
      .collect();
  },
});

export const markAchievementSeen = mutation({
  args: { id: v.id("achievements") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { seen: true });
  },
});