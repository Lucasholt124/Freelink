// Em /convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Adicione a definição do storage

export default defineSchema({
  // Suas tabelas existentes (sem alterações)
  usernames: defineTable({
    userId: v.string(),
    username: v.string(),
  }).index("by_user_id", ["userId"]).index("by_username", ["username"]),

  links: defineTable({
    userId: v.string(),
    title: v.string(),
    url: v.string(),
    order: v.number(),
  }).index("by_user", ["userId"]).index("by_user_and_order", ["userId", "order"]),

  userCustomizations: defineTable({
    userId: v.string(),
    profilePictureStorageId: v.optional(v.id("_storage")),
    description: v.optional(v.string()),
    accentColor: v.optional(v.string()),
  }).index("by_user_id", ["userId"]),

  tracking: defineTable({
    userId: v.string(),
    facebookPixelId: v.optional(v.string()),
    googleAnalyticsId: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  connections: defineTable({
    userId: v.string(),
    provider: v.string(),
    providerAccountId: v.string(),
    tokenExpiresAt: v.optional(v.number()),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()), // Adicionado para refresh tokens
  }).index("by_user_provider", ["userId", "provider"]),

  shortLinks: defineTable({
    userId: v.string(),
    slug: v.string(),
    originalUrl: v.string(),
    clicks: v.number(),
    createdAt: v.optional(v.number()), // Adicionado para tracking
  }).index("by_slug", ["slug"]).index("by_user", ["userId"]),

  // Tabela 'analyses' com melhorias
  analyses: defineTable({
    userId: v.string(),
    suggestions: v.array(v.string()),
    strategy: v.string(),
    grid: v.array(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    username: v.string(),
    bio: v.string(),
    offer: v.string(),
    audience: v.string(),
    planDuration: v.union(v.literal("week"), v.literal("month")),

    // Adicionado campo para rastrear o modelo usado
    aiModel: v.optional(v.string()),

    content_plan: v.array(
      v.object({
        day: v.string(),
        time: v.string(),
        format: v.string(),
        title: v.string(),
        content_idea: v.string(),
        status: v.union(v.literal("planejado"), v.literal("concluido")),

        // Adicionado campo para data de conclusão
        completedAt: v.optional(v.number()),

        details: v.optional(v.object({
          tool_suggestion: v.string(),
          step_by_step: v.string(),
          script_or_copy: v.string(),
          hashtags: v.string(),
          creative_guidance: v.object({
            type: v.string(),
            description: v.string(),
            prompt: v.string(),
            tool_link: v.string(),
          }),
        })),
      })
    ),
  }).index("by_user", ["userId"]).index("by_created", ["createdAt"]),

  // Nova tabela para compartilhamentos de conquistas
sharedAchievements: defineTable({
  userId: v.string(),
  // Remover a linha imageStorageId: v.id("_storage"),
  streakDays: v.number(),
  completedPosts: v.number(),
  totalPosts: v.number(),
  shareCode: v.string(), // Código curto para compartilhamento
  createdAt: v.number(),
  expiresAt: v.number(), // Data de expiração da imagem
  views: v.number(), // Contador de visualizações
  platform: v.optional(v.string()), // Plataforma de compartilhamento
}).index("by_user", ["userId"])
  .index("by_shareCode", ["shareCode"])
  .index("by_expiration", ["expiresAt"]),

  // Tabela para registrar streak dos usuários
  userStreaks: defineTable({
    userId: v.string(),
    currentStreak: v.number(),
    bestStreak: v.number(),
    lastActivityDate: v.number(),
    milestones: v.array(v.object({
      streakDays: v.number(),
      achievedAt: v.number(),
      shared: v.boolean(),
    })),
  }).index("by_user", ["userId"]),
});