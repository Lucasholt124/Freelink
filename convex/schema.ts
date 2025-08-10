// Em convex/schema.ts

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

  // Tabela para os links da página de bio principal
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
  }).index("by_user_id", ["userId"]),

  // Tabela para os IDs de rastreamento (Pixel, GA4)
  tracking: defineTable({
    userId: v.string(),
    facebookPixelId: v.optional(v.string()),
    googleAnalyticsId: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  // Tabela para as conexões com serviços de terceiros (Instagram, etc.)
  connections: defineTable({
    userId: v.string(),
    provider: v.string(),
    providerAccountId: v.string(),
     tokenExpiresAt: v.optional(v.number()),
    accessToken: v.string(),
  }).index("by_user_provider", ["userId", "provider"]),

  // NOVA TABELA: Para os links encurtados
  shortLinks: defineTable({
    userId: v.string(),
    slug: v.string(), // O "apelido" curto, ex: "minha-promo"
    originalUrl: v.string(), // A URL longa original
    clicks: v.number(), // Contador de cliques
  })
    .index("by_slug", ["slug"]) // Índice para o redirecionamento rápido
    .index("by_user", ["userId"]), // Índice para listar os links do usuário
});