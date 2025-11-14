// convex/gamification.ts
import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// 🇧🇷 Data correta do Brasil
const getBrazilDate = (): string => {
  const now = new Date();
  const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const year = brazilTime.getFullYear();
  const month = String(brazilTime.getMonth() + 1).padStart(2, "0");
  const day = String(brazilTime.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const initUserStats = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null; // ✅ RETORNA NULL EM VEZ DE ERRO

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
      lastActivityDate: getBrazilDate(), // ✅ DATA CORRETA
      badges: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const resetUserStats = internalMutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (stats) {
      await ctx.db.patch(stats._id, {
        level: 1,
        xp: 0,
        totalSales: 0,
        totalRevenue: 0,
        totalProfit: 0,
        currentStreak: 0,
        longestStreak: stats.longestStreak,
        lastActivityDate: getBrazilDate(), // ✅ DATA CORRETA
        badges: [],
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userStats", {
        userId: args.userId,
        level: 1,
        xp: 0,
        totalSales: 0,
        totalRevenue: 0,
        totalProfit: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: getBrazilDate(), // ✅ DATA CORRETA
        badges: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
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

    const today = getBrazilDate(); // ✅ DATA CORRETA

    if (!stats) {
      await ctx.db.insert("userStats", {
        userId: args.userId,
        currentStreak: 1,
        longestStreak: 1,
        totalSales: 1,
        totalRevenue: 0,
        level: 1,
        xp: 10,
        lastActivityDate: today,
        badges: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return;
    }

    const lastDate = new Date(stats.lastActivityDate + "T00:00:00");
    const todayDate = new Date(today + "T00:00:00");
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let newStreak = stats.currentStreak;
    let newXP = stats.xp;

    if (diffDays === 1) {
      newStreak = stats.currentStreak + 1;
      newXP = stats.xp + 10;
    } else if (diffDays > 1) {
      newStreak = 1;
      newXP = stats.xp + 5;
    } else if (diffDays === 0) {
      newStreak = stats.currentStreak;
      newXP = stats.xp + 5;
    }

    const newLevel = Math.floor(newXP / 100) + 1;
    const newTotalSales = stats.totalSales + 1;

    await ctx.db.patch(stats._id, {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, stats.longestStreak),
      lastActivityDate: today,
      xp: newXP,
      level: newLevel,
      totalSales: newTotalSales,
      updatedAt: Date.now(),
    });

    // 🏆 CONQUISTAS
    if (newStreak === 7 && !stats.badges.includes("streak_7")) {
      await ctx.db.insert("achievements", {
        userId: args.userId,
        type: "streak_7",
        title: "🔥 Fogo no Parquinho!",
        description: "7 dias seguidos registrando vendas",
        icon: "🔥",
        unlockedAt: Date.now(),
        seen: false,
      });

      await ctx.db.patch(stats._id, {
        badges: [...stats.badges, "streak_7"],
      });
    }

    if (newStreak === 30 && !stats.badges.includes("streak_30")) {
      await ctx.db.insert("achievements", {
        userId: args.userId,
        type: "streak_30",
        title: "🚀 Mestre da Consistência",
        description: "30 dias sem parar!",
        icon: "🚀",
        unlockedAt: Date.now(),
        seen: false,
      });

      await ctx.db.patch(stats._id, {
        badges: [...stats.badges, "streak_30"],
      });
    }

    if (newTotalSales === 10 && !stats.badges.includes("sales_10")) {
      await ctx.db.insert("achievements", {
        userId: args.userId,
        type: "sales_10",
        title: "🎯 Primeiras 10 Vendas!",
        description: "Você está pegando o jeito",
        icon: "🎯",
        unlockedAt: Date.now(),
        seen: false,
      });

      await ctx.db.patch(stats._id, {
        badges: [...stats.badges, "sales_10"],
      });
    }

    if (newTotalSales === 50 && !stats.badges.includes("sales_50")) {
      await ctx.db.insert("achievements", {
        userId: args.userId,
        type: "sales_50",
        title: "⭐ Meio Centenário!",
        description: "50 vendas registradas",
        icon: "⭐",
        unlockedAt: Date.now(),
        seen: false,
      });

      await ctx.db.patch(stats._id, {
        badges: [...stats.badges, "sales_50"],
      });
    }

    if (newTotalSales === 100 && !stats.badges.includes("sales_100")) {
      await ctx.db.insert("achievements", {
        userId: args.userId,
        type: "sales_100",
        title: "💎 Centenário!",
        description: "100 vendas registradas",
        icon: "💎",
        unlockedAt: Date.now(),
        seen: false,
      });

      await ctx.db.patch(stats._id, {
        badges: [...stats.badges, "sales_100"],
      });
    }

    if (newTotalSales === 500 && !stats.badges.includes("sales_500")) {
      await ctx.db.insert("achievements", {
        userId: args.userId,
        type: "sales_500",
        title: "🏆 Lendário!",
        description: "500 vendas! Você é imbatível",
        icon: "🏆",
        unlockedAt: Date.now(),
        seen: false,
      });

      await ctx.db.patch(stats._id, {
        badges: [...stats.badges, "sales_500"],
      });
    }

    if (newLevel > stats.level) {
      await ctx.db.insert("achievements", {
        userId: args.userId,
        type: `level_${newLevel}`,
        title: `⬆️ Nível ${newLevel}!`,
        description: `Você alcançou o nível ${newLevel}`,
        icon: "⬆️",
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
      .order("desc")
      .collect();
  },
});

export const getAllAchievements = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

export const markAchievementSeen = mutation({
  args: { id: v.id("achievements") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { seen: true });
  },
});

export const revertActivityStreak = internalMutation({
  args: {
    userId: v.string(),
    saleDate: v.string(),
  },
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!stats) return;

    const remainingSales = await ctx.db
      .query("sales")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", args.userId).eq("month", args.saleDate.substring(0, 7))
      )
      .filter((q) => q.eq(q.field("date"), args.saleDate))
      .collect();

    if (remainingSales.length > 0) {
      const newXP = Math.max(0, stats.xp - 5);
      const newLevel = Math.floor(newXP / 100) + 1;
      const newTotalSales = Math.max(0, stats.totalSales - 1);

      await ctx.db.patch(stats._id, {
        xp: newXP,
        level: newLevel,
        totalSales: newTotalSales,
        updatedAt: Date.now(),
      });
    } else {
      const saleDateObj = new Date(args.saleDate + "T00:00:00");
      const lastDateObj = new Date(stats.lastActivityDate + "T00:00:00");
      const diffDays = Math.floor(
        (lastDateObj.getTime() - saleDateObj.getTime()) / (1000 * 60 * 60 * 24)
      );

      let newStreak = stats.currentStreak;
      let newXP = stats.xp;
      let newLastActivityDate = stats.lastActivityDate;

      if (diffDays === 0) {
        const allSales = await ctx.db
          .query("sales")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .collect();

        const previousSales = allSales
          .filter((s) => s.date < args.saleDate)
          .sort((a, b) => b.date.localeCompare(a.date))[0];

        if (previousSales) {
          newLastActivityDate = previousSales.date;
          const prevDateObj = new Date(previousSales.date + "T00:00:00");
          const daysBetween = Math.floor(
            (saleDateObj.getTime() - prevDateObj.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysBetween === 1) {
            newStreak = Math.max(0, stats.currentStreak - 1);
            newXP = Math.max(0, stats.xp - 10);
          } else {
            newStreak = stats.currentStreak;
            newXP = Math.max(0, stats.xp - 5);
          }
        } else {
          newStreak = 0;
          newXP = Math.max(0, stats.xp - 5);
          newLastActivityDate = args.saleDate;
        }
      } else {
        newXP = Math.max(0, stats.xp - 5);
      }

      const newLevel = Math.floor(newXP / 100) + 1;
      const newTotalSales = Math.max(0, stats.totalSales - 1);

      await ctx.db.patch(stats._id, {
        currentStreak: newStreak,
        xp: newXP,
        level: newLevel,
        totalSales: newTotalSales,
        lastActivityDate: newLastActivityDate,
        updatedAt: Date.now(),
      });
    }
  },
});