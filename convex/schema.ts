// Em /convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
    refreshToken: v.optional(v.string()),
  }).index("by_user_provider", ["userId", "provider"]),

  shortLinks: defineTable({
    userId: v.string(),
    slug: v.string(),
    originalUrl: v.string(),
    clicks: v.number(),
    createdAt: v.optional(v.number()),
  }).index("by_slug", ["slug"]).index("by_user", ["userId"]),

  // ===============================================================
  // ▼▼▼ A ÚNICA SEÇÃO ALTERADA É ESTA TABELA 'analyses' ▼▼▼
  // ===============================================================
  analyses: defineTable({
    // --- CAMPOS ESTRATÉGICOS NOVOS ---
    optimized_bio: v.string(),
    content_pillars: v.array(v.object({
      pillar: v.string(),
      description: v.string()
    })),
    audience_persona: v.object({
      name: v.string(),
      description: v.string(),
      pain_points: v.array(v.string())
    }),
    brand_voice: v.string(),

    // --- PLANO DE CONTEÚDO ATUALIZADO ---
    content_plan: v.array(v.object({
      day: v.string(),
      time: v.string(),
      format: v.union(v.literal("reels"), v.literal("carrossel"), v.literal("stories"), v.literal("imagem"), v.literal("atividade")),
      title: v.string(),
      content_idea: v.string(),
      status: v.union(v.literal("planejado"), v.literal("concluido")),
      completedAt: v.optional(v.number()),
      funnel_stage: v.union(v.literal("atrair"), v.literal("nutrir"), v.literal("converter")),
      focus_metric: v.string(),
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
    })),

    // --- CAMPOS DE METADADOS (JÁ EXISTENTES) ---
    userId: v.string(),
    username: v.string(),
    bio: v.string(),
    offer: v.string(),
    audience: v.string(),
    planDuration: v.union(v.literal("week"), v.literal("month")),
    aiModel: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]).index("by_created", ["createdAt"]), // Removidos os campos antigos (suggestions, strategy, grid)

  // ===============================================================
  // ▲▲▲ FIM DA SEÇÃO ALTERADA ▲▲▲
  // ===============================================================

  // Suas outras tabelas (sem alterações)
  sharedAchievements: defineTable({
    userId: v.string(),
    streakDays: v.number(),
    completedPosts: v.number(),
    totalPosts: v.number(),
    shareCode: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
    views: v.number(),
    platform: v.optional(v.string()),
  }).index("by_user", ["userId"])
    .index("by_shareCode", ["shareCode"])
    .index("by_expiration", ["expiresAt"]),

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