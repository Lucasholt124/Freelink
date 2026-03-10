import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================
  // 👤 USUÁRIOS E PERFIL
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
    profilePictureUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    backgroundType: v.optional(
      v.union(v.literal("color"), v.literal("gradient"), v.literal("image"))
    ),
    backgroundStyle: v.optional(v.union(v.literal("full"), v.literal("header"))),
    backgroundColor1: v.optional(v.string()),
    backgroundColor2: v.optional(v.string()),
    backgroundImageStorageId: v.optional(v.id("_storage")),
    backgroundImageUrl: v.optional(v.string()),
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

  // ============================================
  // 🏢 MÚLTIPLAS PÁGINAS (SUB-CONTAS)
  // ============================================
  subAccounts: defineTable({
    ownerUserId: v.string(),   // userId do Clerk da conta principal (quem criou)
    subUserId: v.string(),     // userId do Clerk da sub-conta (gerado pelo sistema)
    username: v.string(),      // slug da sub-conta (ex: "pizzariadomario")
    displayName: v.optional(v.string()), // nome amigável opcional
    createdAt: v.number(),
  })
    .index("by_owner", ["ownerUserId"])
    .index("by_sub_user", ["subUserId"])
    .index("by_username", ["username"]),

  // ============================================
  // 🎮 GAMIFICAÇÃO E ONBOARDING
  // ============================================
  userOnboarding: defineTable({
    userId: v.string(),
    currentStep: v.number(),
    completed: v.boolean(),
    steps: v.array(
      v.object({
        step: v.number(),
        name: v.string(),
        completed: v.boolean(),
      })
    ),
    hasSeenWelcome: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  userStats: defineTable({
    userId: v.string(),
    currentStreak: v.number(),
    longestStreak: v.number(),
    totalSales: v.number(),
    totalRevenue: v.number(),
    totalProfit: v.optional(v.number()),
    level: v.number(),
    xp: v.number(),
    lastActivityDate: v.string(),
    badges: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  achievements: defineTable({
    userId: v.string(),
    type: v.string(),
    title: v.string(),
    description: v.string(),
    icon: v.string(),
    unlockedAt: v.number(),
    seen: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unseen", ["userId", "seen"]),

  // ============================================
  // 💼 GESTÃO FINANCEIRA COMPLETA
  // ============================================
  profitCalculations: defineTable({
    userId: v.string(),
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
    revenue: v.object({
      monthly: v.number(),
      products: v.optional(
        v.array(
          v.object({
            name: v.string(),
            price: v.number(),
            quantity: v.number(),
            total: v.number(),
          })
        )
      ),
    }),
    fixedCosts: v.object({
      rent: v.optional(v.number()),
      salaries: v.optional(v.number()),
      software: v.optional(v.number()),
      marketing: v.optional(v.number()),
      utilities: v.optional(v.number()),
      insurance: v.optional(v.number()),
      other: v.optional(v.number()),
      total: v.number(),
    }),
    variableCosts: v.object({
      materials: v.optional(v.number()),
      shipping: v.optional(v.number()),
      commissions: v.optional(v.number()),
      packaging: v.optional(v.number()),
      ads: v.optional(v.number()),
      fees: v.optional(v.number()),
      other: v.optional(v.number()),
      total: v.number(),
    }),
    results: v.object({
      totalRevenue: v.number(),
      totalCosts: v.number(),
      grossProfit: v.number(),
      netProfit: v.number(),
      profitMargin: v.number(),
      breakEvenPoint: v.number(),
      roi: v.number(),
    }),
    aiAnalysis: v.optional(
      v.object({
        score: v.number(),
        insights: v.array(v.string()),
        warnings: v.array(v.string()),
        opportunities: v.array(v.string()),
        benchmarkComparison: v.object({
          industry: v.string(),
          yourMargin: v.number(),
          industryAverage: v.number(),
          status: v.union(
            v.literal("above"),
            v.literal("average"),
            v.literal("below")
          ),
        }),
        recommendations: v.array(
          v.object({
            title: v.string(),
            description: v.string(),
            impact: v.union(
              v.literal("high"),
              v.literal("medium"),
              v.literal("low")
            ),
            potentialSavings: v.number(),
          })
        ),
      })
    ),
    scenarios: v.optional(
      v.object({
        optimistic: v.object({
          revenue: v.number(),
          profit: v.number(),
          margin: v.number(),
        }),
        realistic: v.object({
          revenue: v.number(),
          profit: v.number(),
          margin: v.number(),
        }),
        pessimistic: v.object({
          revenue: v.number(),
          profit: v.number(),
          margin: v.number(),
        }),
      })
    ),
    favorite: v.optional(v.boolean()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
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
    progress: v.number(),
    createdAt: v.number(),
    achievedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_calculation", ["calculationId"]),

  businesses: defineTable({
    userId: v.string(),
    name: v.string(),
    type: v.union(
      v.literal("ecommerce"),
      v.literal("services"),
      v.literal("retail"),
      v.literal("freelancer"),
      v.literal("consulting"),
      v.literal("manufacturing"),
      v.literal("other")
    ),
    currency: v.string(),
    timezone: v.optional(v.string()),
    active: v.boolean(),
    settings: v.optional(
      v.object({
        taxRate: v.optional(v.number()),
        lowStockAlert: v.optional(v.number()),
        defaultPaymentMethod: v.optional(v.string()),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "active"]),

  expenseCategories: defineTable({
    userId: v.string(),
    businessId: v.optional(v.id("businesses")),
    name: v.string(),
    icon: v.string(),
    color: v.string(),
    type: v.union(v.literal("fixed"), v.literal("variable")),
    budget: v.optional(v.number()),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_business", ["businessId"])
    .index("by_user_active", ["userId", "active"]),

  suppliers: defineTable({
    userId: v.string(),
    businessId: v.optional(v.id("businesses")),
    name: v.string(),
    contact: v.optional(
      v.object({
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        address: v.optional(v.string()),
      })
    ),
    notes: v.optional(v.string()),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_business", ["businessId"]),

    customers: defineTable({
      userId: v.string(),
      businessId: v.optional(v.id("businesses")),
      name: v.string(),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      address: v.optional(v.string()),
      notes: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      totalSpent: v.number(),
      totalOrders: v.number(),
      lastPurchase: v.optional(v.number()),
      active: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.optional(v.number()),
      birthDate: v.optional(v.string()),
      status: v.optional(v.string()),
    })
    .index("by_user", ["userId"])
    .index("by_business", ["businessId"])
    .index("by_email", ["userId", "email"]),

  products: defineTable({
    userId: v.string(),
    businessId: v.optional(v.id("businesses")),
    supplierId: v.optional(v.id("suppliers")),
    sku: v.optional(v.string()),
    barcode: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    costPrice: v.number(),
    salePrice: v.number(),
    suggestedPrice: v.optional(v.number()),
    stock: v.optional(v.number()),
    minStock: v.optional(v.number()),
    maxStock: v.optional(v.number()),
    unit: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    active: v.boolean(),
    featured: v.optional(v.boolean()),
    notes: v.optional(v.string()),
    totalSold: v.optional(v.number()),
    totalRevenue: v.optional(v.number()),
    totalProfit: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_business", ["businessId"])
    .index("by_user_active", ["userId", "active"])
    .index("by_sku", ["userId", "sku"])
    .index("by_supplier", ["supplierId"])
    .index("by_category", ["userId", "category"])
    .index("by_featured", ["userId", "featured"]),

  sales: defineTable({
    userId: v.string(),
    businessId: v.optional(v.id("businesses")),
    customerId: v.optional(v.id("customers")),
    productId: v.optional(v.id("products")),
    productName: v.string(),
    quantity: v.number(),
    costPrice: v.number(),
    salePrice: v.number(),
    // 🔥 NOVO CAMPO: Adicionado para o Carrinho de Vendas Múltiplas
    items: v.optional(
      v.array(
        v.object({
          productId: v.optional(v.id("products")),
          productName: v.string(),
          quantity: v.number(),
          costPrice: v.number(),
          salePrice: v.number(),
        })
      )
    ),
    discount: v.optional(v.number()),
    totalCost: v.number(),
    totalRevenue: v.number(),
    profit: v.number(),
    paymentMethod: v.optional(
      v.union(
        v.literal("cash"),
        v.literal("credit_card"),
        v.literal("debit_card"),
        v.literal("pix"),
        v.literal("bank_transfer"),
        v.literal("other")
      )
    ),
    paymentStatus: v.optional(
      v.union(
        v.literal("paid"),
        v.literal("pending"),
        v.literal("overdue"),
        v.literal("cancelled")
      )
    ),
    date: v.string(),
    month: v.string(),
    dueDate: v.optional(v.string()),
    paidAt: v.optional(v.number()),
    invoiceNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isQuickSale: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_business", ["businessId"])
    .index("by_customer", ["customerId"])
    .index("by_product", ["productId"])
    .index("by_user_month", ["userId", "month"])
    .index("by_month", ["month"])
    .index("by_user_date", ["userId", "date"])
    .index("by_payment_status", ["userId", "paymentStatus"]),

  expenses: defineTable({
    userId: v.string(),
    businessId: v.optional(v.id("businesses")),
    categoryId: v.optional(v.id("expenseCategories")),
    categoryName: v.string(),
    supplierId: v.optional(v.id("suppliers")),
    description: v.string(),
    amount: v.number(),
    type: v.union(v.literal("fixed"), v.literal("variable"), v.literal("one_time")),
    recurring: v.optional(v.boolean()),
    recurrenceInterval: v.optional(
      v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"), v.literal("yearly"))
    ),
    paymentMethod: v.optional(
      v.union(
        v.literal("cash"),
        v.literal("credit_card"),
        v.literal("debit_card"),
        v.literal("pix"),
        v.literal("bank_transfer"),
        v.literal("other")
      )
    ),
    paymentStatus: v.optional(
      v.union(
        v.literal("paid"),
        v.literal("pending"),
        v.literal("overdue")
      )
    ),
    date: v.string(),
    month: v.string(),
    dueDate: v.optional(v.string()),
    paidAt: v.optional(v.number()),
    invoiceNumber: v.optional(v.string()),
    attachmentStorageId: v.optional(v.id("_storage")),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_business", ["businessId"])
    .index("by_category", ["categoryId"])
    .index("by_supplier", ["supplierId"])
    .index("by_user_month", ["userId", "month"])
    .index("by_month", ["month"])
    .index("by_payment_status", ["userId", "paymentStatus"])
    .index("by_type", ["userId", "type"]),

  financialGoals: defineTable({
    userId: v.string(),
    businessId: v.optional(v.id("businesses")),
    type: v.union(
      v.literal("revenue"),
      v.literal("profit"),
      v.literal("margin"),
      v.literal("sales_count"),
      v.literal("expense_reduction")
    ),
    title: v.string(),
    description: v.optional(v.string()),
    targetValue: v.number(),
    currentValue: v.number(),
    period: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"), v.literal("yearly")),
    startDate: v.string(),
    endDate: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("achieved"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    achievedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_business", ["businessId"])
    .index("by_status", ["userId", "status"]),

  monthlyReports: defineTable({
    userId: v.string(),
    businessId: v.optional(v.id("businesses")),
    month: v.string(),
    totalSales: v.number(),
    totalRevenue: v.number(),
    totalCost: v.number(),
    grossProfit: v.number(),
    totalExpenses: v.number(),
    fixedExpenses: v.optional(v.number()),
    variableExpenses: v.optional(v.number()),
    expensesByCategory: v.object({
      aluguel: v.optional(v.number()),
      luz_agua: v.optional(v.number()),
      internet: v.optional(v.number()),
      transporte: v.optional(v.number()),
      alimentacao: v.optional(v.number()),
      marketing: v.optional(v.number()),
      materiais: v.optional(v.number()),
      funcionarios: v.optional(v.number()),
      outros: v.optional(v.number()),
    }),
    netProfit: v.number(),
    profitMargin: v.number(),
    topProducts: v.array(
      v.object({
        productId: v.string(),
        productName: v.string(),
        quantity: v.number(),
        revenue: v.number(),
        profit: v.number(),
      })
    ),
    topCustomers: v.optional(
      v.array(
        v.object({
          customerId: v.string(),
          customerName: v.string(),
          totalSpent: v.number(),
          orderCount: v.number(),
        })
      )
    ),
    vsLastMonth: v.optional(
      v.object({
        revenue: v.number(),
        profit: v.number(),
        expenses: v.number(),
      })
    ),
    vsLastYear: v.optional(
      v.object({
        revenue: v.number(),
        profit: v.number(),
        expenses: v.number(),
      })
    ),
    aiPredictions: v.optional(
      v.object({
        nextMonthRevenue: v.number(),
        nextMonthProfit: v.number(),
        confidence: v.number(),
        suggestions: v.array(v.string()),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_business", ["businessId"])
    .index("by_user_month", ["userId", "month"]),

  alerts: defineTable({
    userId: v.string(),
    businessId: v.optional(v.id("businesses")),
    type: v.union(
      v.literal("low_stock"),
      v.literal("high_expense"),
      v.literal("goal_progress"),
      v.literal("payment_overdue"),
      v.literal("negative_profit"),
      v.literal("milestone")
    ),
    severity: v.union(v.literal("info"), v.literal("warning"), v.literal("critical")),
    title: v.string(),
    message: v.string(),
    actionUrl: v.optional(v.string()),
    read: v.boolean(),
    readAt: v.optional(v.number()),
    relatedId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "read"])
    .index("by_business", ["businessId"]),

  deletedRecords: defineTable({
    userId: v.string(),
    recordType: v.union(
      v.literal("product"),
      v.literal("sale"),
      v.literal("expense"),
      v.literal("customer"),
      v.literal("supplier")
    ),
    recordId: v.string(),
    recordData: v.string(),
    deletedAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_expiration", ["expiresAt"]),

  exports: defineTable({
    userId: v.string(),
    businessId: v.optional(v.id("businesses")),
    type: v.union(
      v.literal("excel"),
      v.literal("pdf"),
      v.literal("csv")
    ),
    dataType: v.union(
      v.literal("sales"),
      v.literal("expenses"),
      v.literal("products"),
      v.literal("report"),
      v.literal("all")
    ),
    period: v.optional(
      v.object({
        start: v.string(),
        end: v.string(),
      })
    ),
    fileStorageId: v.optional(v.id("_storage")),
    fileUrl: v.optional(v.string()),
    status: v.union(
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_expiration", ["expiresAt"]),

  // ============================================
  // 🚀 VENDAS RÁPIDAS E FLUXO DE CAIXA
  // ============================================
  dailySummaries: defineTable({
    userId: v.string(),
    businessId: v.optional(v.id("businesses")),
    date: v.string(),
    totalCost: v.optional(v.number()),
    totalRevenue: v.number(),
    totalExpenses: v.number(),
    grossProfit: v.optional(v.number()),
    netProfit: v.number(),
    salesCount: v.number(),
    expensesCount: v.number(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"])
    .index("by_business", ["businessId"]),

  cashFlow: defineTable({
    userId: v.string(),
    businessId: v.optional(v.id("businesses")),
    type: v.union(v.literal("in"), v.literal("out")),
    amount: v.number(),
    description: v.string(),
    category: v.optional(v.string()),
    date: v.string(),
    time: v.string(),
    paymentMethod: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"])
    .index("by_business", ["businessId"])
    .index("by_type", ["userId", "type"]),
});