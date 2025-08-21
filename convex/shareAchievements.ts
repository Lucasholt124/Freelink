// Em /convex/shareAchievements.ts
import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { nanoid } from "nanoid";

// Gerar um código curto para compartilhamento
function generateShareCode() {
  return nanoid(8); // 8 caracteres alfanuméricos
}

// Função para compartilhar conquista (sem armazenar imagem)
export const shareAchievement = mutation({
  args: {
    streakDays: v.number(),
    completedPosts: v.number(),
    totalPosts: v.number(),
     username: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    const userId = identity.subject;

    try {
      // Gerar código de compartilhamento
      const shareCode = generateShareCode();

      // Calcular data de expiração (30 dias)
      const now = Date.now();
      const expiresAt = now + 1000 * 60 * 60 * 24 * 30;

      // Salvar o registro (sem referência a imageStorageId)
      const achievementId = await ctx.db.insert("sharedAchievements",
        {
            userId,
            shareCode,
            streakDays: args.streakDays,
            completedPosts: args.completedPosts,
            totalPosts: args.totalPosts,
            createdAt: now,
            expiresAt,
            views: 0,
        });

      // Atualizar o contador de visualizações
      const achievement = await ctx.db.get(achievementId);
      if (achievement) {
        await ctx.db.patch(achievementId, {
          views: achievement.views + 1,
        });
        }

      // Atualizar ou registrar streak do usuário
      const userStreak = await ctx.db
        .query("userStreaks")
        .withIndex("by_user", q => q.eq("userId", userId))
        .first();

      if (userStreak) {
        // Atualizar streak existente
        const bestStreak = Math.max(userStreak.bestStreak, args.streakDays);

        // Verificar se este é um novo marco
        const isNewMilestone = [7, 14, 30, 60, 90, 180, 365].includes(args.streakDays) &&
          !userStreak.milestones.some(m => m.streakDays === args.streakDays);

        const milestones = isNewMilestone
          ? [...userStreak.milestones, {
              streakDays: args.streakDays,
              achievedAt: now,
              shared: true,
            }]
          : userStreak.milestones;

        await ctx.db.patch(userStreak._id, {
          currentStreak: args.streakDays,
          bestStreak,
          lastActivityDate: now,
          milestones,
        });
      } else {
        // Criar novo registro de streak
        await ctx.db.insert("userStreaks", {
          userId,
          currentStreak: args.streakDays,
          bestStreak: args.streakDays,
          lastActivityDate: now,
          milestones: args.streakDays >= 7 ? [{
            streakDays: args.streakDays,
            achievedAt: now,
            shared: true,
          }] : [],
        });
      }

      // Determinar a URL base para compartilhamento
      const baseUrl = process.env?.NEXT_PUBLIC_APP_URL || "https://freelink.io";

      // Retornar informações para compartilhamento
      return {
        achievementId,
        shareCode,
        shareUrl: `${baseUrl}/share/${shareCode}`,
      };
    } catch (error) {
      console.error("Erro ao compartilhar conquista:", error);
      throw new Error(`Falha ao compartilhar conquista: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  },
});

// Obter detalhes da conquista compartilhada
export const getSharedAchievement = query({
  args: {
    shareCode: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Buscar a conquista pelo código
      const achievement = await ctx.db
        .query("sharedAchievements")
        .withIndex("by_shareCode", q => q.eq("shareCode", args.shareCode))
        .first();

      if (!achievement) {
        return null;
      }

      // Verificar se não expirou
      if (achievement.expiresAt < Date.now()) {
        return { expired: true };
      }

      return {
        streakDays: achievement.streakDays,
        completedPosts: achievement.completedPosts,
        totalPosts: achievement.totalPosts,
        createdAt: achievement.createdAt,
        views: achievement.views,
      };
    } catch (error) {
      console.error("Erro ao obter conquista compartilhada:", error);
      return null;
    }
  },
});

// Registrar visualização
export const registerAchievementView = mutation({
  args: {
    shareCode: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const achievement = await ctx.db
        .query("sharedAchievements")
        .withIndex("by_shareCode", q => q.eq("shareCode", args.shareCode))
        .first();

      if (!achievement) {
        return false;
      }

      await ctx.db.patch(achievement._id, {
        views: achievement.views + 1,
      });

      return true;
    } catch (error) {
      console.error("Erro ao registrar visualização:", error);
      return false;
    }
  },
});

// Atualizar plataforma de compartilhamento
export const updateSharingPlatform = mutation({
  args: {
    achievementId: v.id("sharedAchievements"),
    platform: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    try {
      const achievement = await ctx.db.get(args.achievementId);
      if (!achievement || achievement.userId !== identity.subject) {
        throw new Error("Conquista não encontrada ou sem permissão");
      }

      await ctx.db.patch(args.achievementId, {
        platform: args.platform,
      });

      return true;
    } catch (error) {
      console.error("Erro ao atualizar plataforma:", error);
      throw new Error("Falha ao atualizar plataforma de compartilhamento");
    }
  },
});

// Função auxiliar para compartilhar URL via HTTP
export const getShareableUrl = action({
  args: {
    shareCode: v.string(),
  },
  handler: async (ctx, args) => {
    // Determinar a URL base para compartilhamento
    const baseUrl = process.env?.NEXT_PUBLIC_APP_URL || "https://freelink.io";
    return `${baseUrl}/share/${args.shareCode}`;
  },
});