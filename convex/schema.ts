// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Tabela para mapear usernames únicos para userIds do Clerk
  usernames: defineTable({
    userId: v.string(),
    username: v.string(),
  })
    .index("by_user_id", ["userId"])
    .index("by_username", ["username"]),

  // Tabela para os links criados pelos usuários
  links: defineTable({
    userId: v.string(),
    title: v.string(),
    url: v.string(),
    order: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_order", ["userId", "order"]),

  // Tabela para as customizações de perfil
  userCustomizations: defineTable({
    userId: v.string(),
    profilePictureStorageId: v.optional(v.id("_storage")),
    description: v.optional(v.string()),
    accentColor: v.optional(v.string()),
  }).index("by_user_id", ["userId"]), // <-- VÍRGULA ADICIONADA AQUI

  // Tabela para os IDs de rastreamento (Pixel, GA4)
  tracking: defineTable({
    userId: v.string(),
    facebookPixelId: v.optional(v.string()),
    googleAnalyticsId: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

});