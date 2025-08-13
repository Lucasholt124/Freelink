// Em /convex/schema.ts
// (Substitua o arquivo inteiro)

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
  // NOVA TABELA ADICIONADA AQUI
  // =======================================================
  analyses: defineTable({
    userId: v.string(),
    suggestions: v.array(v.string()),
    strategy: v.string(),
    grid: v.array(v.string()),
    content_plan: v.array(v.object({
        day: v.string(),
        time: v.string(),
        format: v.string(),
        title: v.string(),
        content_idea: v.string(),
        status: v.string(),
    })),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]), // <-- O índice que estava faltando
});