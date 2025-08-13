// Em /convex/schema.ts
// (Substitua o arquivo inteiro)

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Suas tabelas existentes
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
  // TABELA 'analyses' ATUALIZADA COM OS NOVOS CAMPOS
  // =======================================================
  analyses: defineTable({
    // Campos que você já tinha
    userId: v.string(),
    suggestions: v.array(v.string()),
    strategy: v.string(),
    grid: v.array(v.string()),
    content_plan: v.array(
      v.object({
        day: v.string(),
        time: v.string(),
        format: v.string(),
        title: v.string(),
        content_idea: v.string(),
        // Tipo melhorado para consistência
        status: v.union(v.literal("planejado"), v.literal("concluido")),
        details: v.optional(
          v.object({
            passo_a_passo: v.string()
          })
        ),
      })
    ),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),

    // --- NOVOS CAMPOS ADICIONADOS AQUI ---
    username: v.string(),
    bio: v.string(),
    offer: v.string(),
    audience: v.string(),
    planDuration: v.union(v.literal("week"), v.literal("month")),

  }).index("by_user", ["userId"]),
});