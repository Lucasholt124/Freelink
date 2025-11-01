// /convex/schema.ts - VERSÃO CORRIGIDA
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
    backgroundType: v.optional(v.union(v.literal("color"), v.literal("gradient"), v.literal("image"))),
    backgroundStyle: v.optional(v.union(v.literal("full"), v.literal("header"))),
    backgroundColor1: v.optional(v.string()),
    backgroundColor2: v.optional(v.string()),
    backgroundImageStorageId: v.optional(v.id("_storage")),
    backgroundImageBlur: v.optional(v.number()),
    backgroundImageOpacity: v.optional(v.number()),
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
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_user_provider", ["userId", "provider"]),

  shortLinks: defineTable({
    userId: v.string(),
    slug: v.string(),
    originalUrl: v.string(),
    clicks: v.number(),
    createdAt: v.optional(v.number()),
  }).index("by_slug", ["slug"]).index("by_user", ["userId"]),

  analyses: defineTable({
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
    userId: v.string(),
    username: v.string(),
    bio: v.string(),
    offer: v.string(),
    audience: v.string(),
    planDuration: v.union(v.literal("week"), v.literal("month")),
    aiModel: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]).index("by_created", ["createdAt"]),

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

  generatedImages: defineTable({
    userId: v.string(),
    prompt: v.string(),
    imageUrl: v.string(),
    storageId: v.id("_storage"),
    method: v.optional(v.string()),
    createdAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  // ✅ TABELA CORRIGIDA PARA ACEITAR DADOS ANTIGOS E NOVOS
  dailyImageUsage: defineTable({
    userId: v.string(),
    date: v.string(), // formato: "YYYY-MM-DD"
    count: v.number(),
    images: v.optional(v.array(v.object({
      imageId: v.id("generatedImages"),
      createdAt: v.number(),
    }))), // ✅ AGORA É OPCIONAL para aceitar registros antigos
    lastResetAt: v.optional(v.number()),
    createdAt: v.optional(v.number()), // ✅ Campo dos registros antigos
    updatedAt: v.optional(v.number()), // ✅ Campo dos registros antigos
  }).index("by_user_date", ["userId", "date"])
    .index("by_user", ["userId"]),

  aiStudioContent: defineTable({
    userId: v.string(),
    type: v.union(
      v.literal("enhanced_image"),
      v.literal("audio"),
      v.literal("transcription"),
      v.literal("video"),
      v.literal("chat")
    ),
    originalUrl: v.optional(v.string()),
    resultUrl: v.optional(v.string()),
    text: v.optional(v.string()),
    prompt: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    createdAt: v.optional(v.number()),
  }).index("by_user", ["userId"])
    .index("by_user_and_type", ["userId", "type"]),

  publicGiveaways: defineTable({
    giveawayId: v.string(),
    title: v.string(),
    createdBy: v.string(),
    participants: v.array(v.object({
      id: v.string(),
      name: v.string(),
      identifier: v.string(),
      timestamp: v.string(),
      verified: v.optional(v.boolean()),
    })),
    isActive: v.boolean(),
    method: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_giveaway_id", ["giveawayId"])
    .index("by_creator", ["createdBy"]),
});