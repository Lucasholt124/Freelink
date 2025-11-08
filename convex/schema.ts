import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================
  // TABELAS EXISTENTES (mantidas)
  // ============================================
  usernames: defineTable({
    userId: v.string(),
    username: v.string(),
  })
    .index("by_user_id", ["userId"])
    .index("by_username", ["username"]),

  links: defineTable({
    userId: v.string(),
    title: v.string(),
    url: v.string(),
    order: v.number(),
    thumbnailStorageId: v.optional(v.id("_storage")),
    isFeatured: v.optional(v.boolean()),
    badgeType: v.optional(
      v.union(
        v.literal("new"),
        v.literal("hot"),
        v.literal("popular"),
        v.literal("limited")
      )
    ),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_order", ["userId", "order"]),

  userCustomizations: defineTable({
    userId: v.string(),
    profilePictureStorageId: v.optional(v.id("_storage")),
    description: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    backgroundType: v.optional(
      v.union(v.literal("color"), v.literal("gradient"), v.literal("image"))
    ),
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
  })
    .index("by_slug", ["slug"])
    .index("by_user", ["userId"]),

  analyses: defineTable({
    optimized_bio: v.string(),
    content_pillars: v.array(
      v.object({
        pillar: v.string(),
        description: v.string(),
      })
    ),
    audience_persona: v.object({
      name: v.string(),
      description: v.string(),
      pain_points: v.array(v.string()),
    }),
    brand_voice: v.string(),
    content_plan: v.array(
      v.object({
        day: v.string(),
        time: v.string(),
        format: v.union(
          v.literal("reels"),
          v.literal("carrossel"),
          v.literal("stories"),
          v.literal("imagem"),
          v.literal("atividade")
        ),
        title: v.string(),
        content_idea: v.string(),
        status: v.union(v.literal("planejado"), v.literal("concluido")),
        completedAt: v.optional(v.number()),
        funnel_stage: v.union(
          v.literal("atrair"),
          v.literal("nutrir"),
          v.literal("converter")
        ),
        focus_metric: v.string(),
        details: v.optional(
          v.object({
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
          })
        ),
      })
    ),
    userId: v.string(),
    username: v.string(),
    bio: v.string(),
    offer: v.string(),
    audience: v.string(),
    planDuration: v.union(v.literal("week"), v.literal("month")),
    aiModel: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_created", ["createdAt"]),

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
  })
    .index("by_user", ["userId"])
    .index("by_shareCode", ["shareCode"])
    .index("by_expiration", ["expiresAt"]),

  userStreaks: defineTable({
    userId: v.string(),
    currentStreak: v.number(),
    bestStreak: v.number(),
    lastActivityDate: v.number(),
    milestones: v.array(
      v.object({
        streakDays: v.number(),
        achievedAt: v.number(),
        shared: v.boolean(),
      })
    ),
  }).index("by_user", ["userId"]),

  generatedImages: defineTable({
    userId: v.string(),
    prompt: v.string(),
    imageUrl: v.string(),
    storageId: v.id("_storage"),
    method: v.optional(v.string()),
    createdAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  dailyImageUsage: defineTable({
    userId: v.string(),
    date: v.string(),
    count: v.number(),
    images: v.optional(
      v.array(
        v.object({
          imageId: v.id("generatedImages"),
          createdAt: v.number(),
        })
      )
    ),
    lastResetAt: v.optional(v.number()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user_date", ["userId", "date"])
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
  })
    .index("by_user", ["userId"])
    .index("by_user_and_type", ["userId", "type"]),

  publicGiveaways: defineTable({
    giveawayId: v.string(),
    title: v.string(),
    createdBy: v.string(),
    participants: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        identifier: v.string(),
        timestamp: v.string(),
        verified: v.optional(v.boolean()),
      })
    ),
    isActive: v.boolean(),
    method: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_giveaway_id", ["giveawayId"])
    .index("by_creator", ["createdBy"]),

  // ============================================
  // NOVAS TABELAS FREELINKBRAIN
  // ============================================

  // Campanhas de conteúdo geradas
  brainCampaigns: defineTable({
    userId: v.string(),
    theme: v.string(),
    themeSummary: v.string(),
    targetAudience: v.string(),
    viralStrategy: v.object({
      best_times: v.array(v.string()),
      hashtag_strategy: v.string(),
      engagement_hacks: v.array(v.string()),
    }),
    contentPack: v.string(), // JSON stringificado
    favorite: v.optional(v.boolean()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"]),

  // Posts agendados (SEM Buffer - COM Notificações Push)
  scheduledPosts: defineTable({
    userId: v.string(),
    campaignId: v.id("brainCampaigns"),

    // Tipo de conteúdo
    contentType: v.union(
      v.literal("reel"),
      v.literal("carousel"),
      v.literal("image_post"),
      v.literal("story_sequence")
    ),
    contentData: v.string(), // JSON stringificado

    // Mídia
    mediaStorageId: v.optional(v.id("_storage")),
    mediaUrl: v.optional(v.string()),

    // Legenda editável
    caption: v.string(),
    hashtags: v.array(v.string()),

    // Agendamento
    scheduledDate: v.string(), // "YYYY-MM-DD"
    scheduledTime: v.string(), // "HH:MM"
    scheduledTimestamp: v.number(),

    // Plataforma
    platform: v.union(
      v.literal("instagram"),
      v.literal("facebook"),
      v.literal("linkedin"),
      v.literal("twitter"),
      v.literal("tiktok")
    ),

    // Publicação automática (integração com Buffer)
    autoPublish: v.optional(v.boolean()),
    bufferUpdateId: v.optional(v.string()),
    bufferProfileId: v.optional(v.string()),
    publishError: v.optional(v.string()),

    // Status (SEM publishing, SEM published - apenas agendamento)
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("queued"), // Adicionado para auto-publish
      v.literal("notified"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("publishing"), // Adicionado para integração com Buffer
      v.literal("published"),  // Adicionado para integração com Buffer
      v.literal("failed")      // Adicionado para integração com Buffer
    ),

    // Notificação enviada?
    notificationSent: v.optional(v.boolean()),
    notificationSentAt: v.optional(v.number()),

    // Performance (preenchido MANUALMENTE pelo usuário depois)
    performance: v.optional(
      v.object({
        views: v.optional(v.number()),
        likes: v.optional(v.number()),
        comments: v.optional(v.number()),
        shares: v.optional(v.number()),
        saves: v.optional(v.number()),
        reach: v.optional(v.number()),
        engagement: v.optional(v.number()),
      })
    ),

    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
     .index("by_user", ["userId"])
    .index("by_campaign", ["campaignId"])
    .index("by_user_scheduled", ["userId", "scheduledTimestamp"])
    .index("by_status", ["status"])
    .index("by_scheduled_timestamp", ["scheduledTimestamp"]) // ✅ CORRIGIDO
    .index("by_notification_pending", ["notificationSent", "status"]) // ✅ CORRIGIDO
    .index("by_auto_publish", ["autoPublish"]), // <-- ÍNDICE ADICIONADO AQUI

  // 🔔 NOVA TABELA: Push Subscriptions (assinaturas de notificação)
  pushSubscriptions: defineTable({
    userId: v.string(),
    endpoint: v.string(), // URL única do navegador
    keys: v.object({
      p256dh: v.string(),
      auth: v.string(),
    }),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
    lastUsedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_endpoint", ["endpoint"]),

  // 🔔 NOVA TABELA: Histórico de notificações enviadas
  notificationHistory: defineTable({
    userId: v.string(),
    postId: v.id("scheduledPosts"),
    title: v.string(),
    body: v.string(),
    sentAt: v.number(),
    success: v.boolean(),
    error: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_post", ["postId"]),

    profitCalculations: defineTable({
  userId: v.string(),

  // Informações do negócio
  businessName: v.string(),
  businessType: v.union(
    v.literal("ecommerce"),
    v.literal("saas"),
    v.literal("freelancer"),
    v.literal("infoproducts"),
    v.literal("services"),
    v.literal("physical_store"),
    v.literal("dropshipping"),
    v.literal("consulting"),
    v.literal("other")
  ),

  // Receitas
  revenue: v.object({
    monthly: v.number(),
    products: v.optional(v.array(v.object({
      name: v.string(),
      price: v.number(),
      quantity: v.number(),
      total: v.number()
    })))
  }),

  // Custos Fixos
  fixedCosts: v.object({
    rent: v.optional(v.number()),
    salaries: v.optional(v.number()),
    software: v.optional(v.number()),
    marketing: v.optional(v.number()),
    utilities: v.optional(v.number()),
    insurance: v.optional(v.number()),
    other: v.optional(v.number()),
    total: v.number()
  }),

  // Custos Variáveis
  variableCosts: v.object({
    materials: v.optional(v.number()),
    shipping: v.optional(v.number()),
    commissions: v.optional(v.number()),
    packaging: v.optional(v.number()),
    ads: v.optional(v.number()),
    fees: v.optional(v.number()),
    other: v.optional(v.number()),
    total: v.number()
  }),

  // Resultados calculados
  results: v.object({
    totalRevenue: v.number(),
    totalCosts: v.number(),
    grossProfit: v.number(),
    netProfit: v.number(),
    profitMargin: v.number(),
    breakEvenPoint: v.number(),
    roi: v.number()
  }),

  // Análise IA
  aiAnalysis: v.optional(v.object({
    score: v.number(), // 0-100
    insights: v.array(v.string()),
    warnings: v.array(v.string()),
    opportunities: v.array(v.string()),
    benchmarkComparison: v.object({
      industry: v.string(),
      yourMargin: v.number(),
      industryAverage: v.number(),
      status: v.union(v.literal("above"), v.literal("average"), v.literal("below"))
    }),
    recommendations: v.array(v.object({
      title: v.string(),
      description: v.string(),
      impact: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
      potentialSavings: v.number()
    }))
  })),

  // Simulações
  scenarios: v.optional(v.object({
    optimistic: v.object({
      revenue: v.number(),
      profit: v.number(),
      margin: v.number()
    }),
    realistic: v.object({
      revenue: v.number(),
      profit: v.number(),
      margin: v.number()
    }),
    pessimistic: v.object({
      revenue: v.number(),
      profit: v.number(),
      margin: v.number()
    })
  })),

  // Meta
  favorite: v.optional(v.boolean()),
  notes: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.optional(v.number())
})
  .index("by_user", ["userId"])
  .index("by_user_created", ["userId", "createdAt"])
  .index("by_favorite", ["userId", "favorite"]),

profitGoals: defineTable({
  userId: v.string(),
  calculationId: v.id("profitCalculations"),

  targetProfit: v.number(),
  targetMargin: v.number(),
  deadline: v.string(),

  status: v.union(
    v.literal("active"),
    v.literal("achieved"),
    v.literal("failed")
  ),

  progress: v.number(), // 0-100
  createdAt: v.number(),
  achievedAt: v.optional(v.number())
})
  .index("by_user", ["userId"])
  .index("by_calculation", ["calculationId"]),
});