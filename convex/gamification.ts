// convex/gamification.ts
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

// ✅ FUNÇÃO PRINCIPAL - ATUALIZA STREAK E XP
export const updateActivityStreak = internalMutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!stats) {
      // ✅ Se não existe stats, criar
      await ctx.db.insert("userStats", {
        userId: args.userId,
        currentStreak: 1,
        longestStreak: 1,
        totalSales: 1,
        totalRevenue: 0,
        level: 1,
        xp: 10,
        lastActivityDate: new Date().toISOString().split("T")[0],
        badges: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const lastDate = new Date(stats.lastActivityDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let newStreak = stats.currentStreak;
    let newXP = stats.xp;

    // ✅ Lógica de Streak
    if (diffDays === 1) {
      // Dia consecutivo = incrementa streak
      newStreak = stats.currentStreak + 1;
      newXP = stats.xp + 10; // +10 XP por dia consecutivo
    } else if (diffDays > 1) {
      // Perdeu a sequência = reseta
      newStreak = 1;
      newXP = stats.xp + 5; // +5 XP por venda fora de sequência
    } else if (diffDays === 0) {
      // Mesmo dia = mantém streak, mas dá XP
      newStreak = stats.currentStreak;
      newXP = stats.xp + 5; // +5 XP por venda no mesmo dia
    }

    const newLevel = Math.floor(newXP / 100) + 1;
    const newTotalSales = stats.totalSales + 1;

    // ✅ Atualizar stats
    await ctx.db.patch(stats._id, {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, stats.longestStreak),
      lastActivityDate: today,
      xp: newXP,
      level: newLevel,
      totalSales: newTotalSales,
      updatedAt: Date.now(),
    });

    // ============================================
    // 🏆 CONQUISTAS AUTOMÁTICAS
    // ============================================

    // ✅ Conquista: 7 dias consecutivos
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

    // ✅ Conquista: 30 dias consecutivos
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

    // ✅ Conquista: 10 vendas
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

    // ✅ Conquista: 50 vendas
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

    // ✅ Conquista: 100 vendas
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

    // ✅ Conquista: 500 vendas
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

    // ✅ Conquista: Subiu de nível
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

// ✅ FUNÇÃO PARA REVERTER STREAK E XP QUANDO UMA VENDA É REMOVIDA
export const revertActivityStreak = internalMutation({
  args: { 
    userId: v.string(),
    saleDate: v.string(), // Data da venda que foi removida
  },
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!stats) {
      return; // Se não há stats, não há nada para reverter
    }

    // Verificar se ainda há outras vendas no mesmo dia
    const remainingSales = await ctx.db
      .query("sales")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).eq("date", args.saleDate)
      )
      .collect();

    // Se ainda há vendas no mesmo dia, apenas decrementa totalSales e ajusta XP
    if (remainingSales.length > 0) {
      // Ainda há vendas no mesmo dia, então o streak e lastActivityDate não mudam
      // Apenas reverter XP e decrementar totalSales
      // Como não sabemos se era a primeira venda do dia ou não, vamos subtrair 5 XP (padrão)
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
      // Não há mais vendas no mesmo dia - precisa reverter streak e XP
      const saleDateObj = new Date(args.saleDate);
      const lastDateObj = new Date(stats.lastActivityDate);
      const diffDays = Math.floor(
        (lastDateObj.getTime() - saleDateObj.getTime()) / (1000 * 60 * 60 * 24)
      );

      let newStreak = stats.currentStreak;
      let newXP = stats.xp;
      let newLastActivityDate = stats.lastActivityDate;

      // Se a venda removida era do último dia de atividade (diffDays === 0)
      if (diffDays === 0) {
        // Precisamos encontrar a última venda antes dessa data
        const previousSales = await ctx.db
          .query("sales")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .filter((q) => q.lt(q.field("date"), args.saleDate))
          .order("desc")
          .first();

        if (previousSales) {
          // Há uma venda anterior, usar essa data como nova lastActivityDate
          newLastActivityDate = previousSales.date;
          const prevDateObj = new Date(previousSales.date);
          const daysBetween = Math.floor(
            (saleDateObj.getTime() - prevDateObj.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysBetween === 1) {
            // Era dia consecutivo, então o streak atual foi ganho por essa venda removida
            // Reverter o streak em 1
            newStreak = Math.max(0, stats.currentStreak - 1);
            newXP = Math.max(0, stats.xp - 10); // Reverter 10 XP do dia consecutivo
          } else {
            // Não era consecutivo, a venda removida não afetava o streak
            // Mas como era o último dia, precisamos atualizar lastActivityDate
            newStreak = stats.currentStreak;
            newXP = Math.max(0, stats.xp - 5); // Reverter 5 XP
          }
        } else {
          // Não há vendas anteriores, resetar streak para 0
          newStreak = 0;
          newXP = Math.max(0, stats.xp - 5);
          // Usar a data da venda removida como referência (mas não há mais vendas nesse dia)
          newLastActivityDate = args.saleDate;
        }
      } else {
        // A venda removida não era do último dia, apenas ajustar XP
        // Não afeta streak nem lastActivityDate
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