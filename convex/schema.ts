// Em /convex/schema.ts
// (Substitua o arquivo inteiro)

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
  }).index("by_user_provider", ["userId", "provider"]),

  shortLinks: defineTable({
    userId: v.string(),
    slug: v.string(),
    originalUrl: v.string(),
    clicks: v.number(),
  }).index("by_slug", ["slug"]).index("by_user", ["userId"]),

  // =======================================================
  // TABELA 'analyses' ATUALIZADA
  // =======================================================
  analyses: defineTable({
    // Campos que já existiam e permanecem
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

    // <<< A GRANDE MUDANÇA ESTÁ AQUI DENTRO DO content_plan >>>
    content_plan: v.array(
      v.object({
        day: v.string(),
        time: v.string(),
        format: v.string(),
        title: v.string(),
        content_idea: v.string(),
        status: v.union(v.literal("planejado"), v.literal("concluido")),

        // A ESTRUTURA DE 'details' FOI COMPLETAMENTE REVISADA
        details: v.optional(v.object({
            tool_suggestion: v.string(),
            step_by_step: v.string(),
            script_or_copy: v.string(),
            hashtags: v.string(),
            creative_guidance: v.object({
                type: v.string(), // 'image' ou 'video'
                description: v.string(),
                prompt: v.string(),
                tool_link: v.string(), // Link direto para a ferramenta gratuita
            }),
        })),
      })
    ),
  }).index("by_user", ["userId"]),
});