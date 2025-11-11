// convex/profitCalculator.ts
import { action, mutation, query, internalMutation, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

// =================================================================
// 🚀 VENDAS RÁPIDAS (MODO PAPEL E CANETA)
// =================================================================

export const addQuickSale = mutation({
  args: {
    amount: v.number(),
    costPrice: v.optional(v.number()),
    description: v.optional(v.string()),
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
    date: v.optional(v.string()),
    businessId: v.optional(v.id("businesses")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const today = args.date || new Date().toISOString().split("T")[0];
    const month = today.substring(0, 7);
    const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    // CALCULAR LUCRO CORRETAMENTE
    const costPrice = args.costPrice || 0;
    const totalCost = costPrice;
    const totalRevenue = args.amount;
    const profit = args.amount - totalCost;

    // Adiciona no cash flow
    await ctx.db.insert("cashFlow", {
      userId: identity.subject,
      businessId: args.businessId,
      type: "in",
      amount: args.amount,
      description: args.description || "Venda rápida",
      date: today,
      time,
      paymentMethod: args.paymentMethod,
      createdAt: Date.now(),
    });

    // Adiciona como venda sem produto
    const saleId = await ctx.db.insert("sales", {
      userId: identity.subject,
      businessId: args.businessId,
      productName: args.description || "Venda rápida",
      quantity: 1,
      costPrice: costPrice,
      salePrice: args.amount,
      totalCost: totalCost,
      totalRevenue: totalRevenue,
      profit: profit,
      paymentMethod: args.paymentMethod,
      paymentStatus: "paid",
      date: today,
      month,
      paidAt: Date.now(),
      isQuickSale: true,
      createdAt: Date.now(),
    });

    // ✅ CORREÇÃO: Força a atualização do resumo diário
    await ctx.scheduler.runAfter(0, internal.profitCalculator.updateDailySummary, {
      userId: identity.subject,
      date: today,
      businessId: args.businessId,
    });

    // ✅ NOVO: Agenda a atualização do relatório mensal e metas
    await ctx.scheduler.runAfter(100, internal.profitCalculator.regenerateMonthlyReport, {
      userId: identity.subject,
      month: month,
      businessId: args.businessId,
    });

    await ctx.scheduler.runAfter(0, internal.gamification.updateActivityStreak, {
      userId: identity.subject,
    });


    return saleId;
  },
});

export const addQuickExpense = mutation({
  args: {
    amount: v.number(),
    description: v.string(),
    category: v.optional(v.string()),
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
    date: v.optional(v.string()),
    businessId: v.optional(v.id("businesses")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const today = args.date || new Date().toISOString().split("T")[0];
    const month = today.substring(0, 7);
    const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    // Adiciona no cash flow
    await ctx.db.insert("cashFlow", {
      userId: identity.subject,
      businessId: args.businessId,
      type: "out",
      amount: args.amount,
      description: args.description,
      category: args.category,
      date: today,
      time,
      paymentMethod: args.paymentMethod,
      createdAt: Date.now(),
    });

    // Adiciona como gasto
    const expenseId = await ctx.db.insert("expenses", {
      userId: identity.subject,
      businessId: args.businessId,
      categoryName: args.category || "Outros",
      description: args.description,
      amount: args.amount,
      type: "one_time",
      paymentMethod: args.paymentMethod,
      paymentStatus: "paid",
      date: today,
      month,
      paidAt: Date.now(),
      createdAt: Date.now(),
    });

    // ✅ CORREÇÃO: Força a atualização do resumo diário
    await ctx.scheduler.runAfter(0, internal.profitCalculator.updateDailySummary, {
      userId: identity.subject,
      date: today,
      businessId: args.businessId,
    });

    // ✅ NOVO: Agenda a atualização do relatório mensal e metas
    await ctx.scheduler.runAfter(100, internal.profitCalculator.regenerateMonthlyReport, {
      userId: identity.subject,
      month: month,
      businessId: args.businessId,
    });

    return expenseId;
  },
});

export const getDailySummary = query({
  args: {
    date: v.optional(v.string()),
    businessId: v.optional(v.id("businesses")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const today = args.date || new Date().toISOString().split("T")[0];

    // Busca resumo existente
    const existingSummary = await ctx.db
      .query("dailySummaries")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", identity.subject).eq("date", today)
      )
      .first();

    if (existingSummary && (!args.businessId || existingSummary.businessId === args.businessId)) {
      return existingSummary;
    }

    // Calcula em tempo real se não existir
    const sales = await ctx.db
      .query("sales")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", identity.subject).eq("date", today)
      )
      .collect();

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", identity.subject).eq("month", today.substring(0, 7))
      )
      .filter((q) => q.eq(q.field("date"), today))
      .collect();

    const filteredSales = args.businessId
      ? sales.filter((s) => s.businessId === args.businessId)
      : sales;

    const filteredExpenses = args.businessId
      ? expenses.filter((e) => e.businessId === args.businessId)
      : expenses;

    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalRevenue, 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    return {
      userId: identity.subject,
      businessId: args.businessId,
      date: today,
      totalRevenue,
      totalExpenses,
      netProfit,
      salesCount: filteredSales.length,
      expensesCount: filteredExpenses.length,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  },
});

export const getCashFlow = query({
  args: {
    date: v.optional(v.string()),
    businessId: v.optional(v.id("businesses")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const today = args.date || new Date().toISOString().split("T")[0];

    const cashFlowQuery = ctx.db
      .query("cashFlow")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", identity.subject).eq("date", today)
      );

    let cashFlow = await cashFlowQuery.order("desc").collect();

    if (args.businessId) {
      cashFlow = cashFlow.filter((cf) => cf.businessId === args.businessId);
    }

    if (args.limit) {
      cashFlow = cashFlow.slice(0, args.limit);
    }

    return cashFlow;
  },
});

// Função interna para atualizar resumo diário
export const updateDailySummary = internalMutation({
  args: {
    userId: v.string(),
    date: v.string(),
    businessId: v.optional(v.id("businesses")),
  },
  handler: async (ctx, args) => {
    const sales = await ctx.db
      .query("sales")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .collect();

    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", args.userId).eq("month", args.date.substring(0, 7))
      )
      .filter((q) => q.eq(q.field("date"), args.date))
      .collect();

    const filteredSales = args.businessId
      ? sales.filter((s) => s.businessId === args.businessId)
      : sales;

    const filteredExpenses = args.businessId
      ? expenses.filter((e) => e.businessId === args.businessId)
      : expenses;

    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalRevenue, 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    // Busca resumo existente
    const existing = await ctx.db
      .query("dailySummaries")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .first();

    if (existing && (!args.businessId || existing.businessId === args.businessId)) {
      await ctx.db.patch(existing._id, {
        totalRevenue,
        totalExpenses,
        netProfit,
        salesCount: filteredSales.length,
        expensesCount: filteredExpenses.length,
        updatedAt: Date.now(),
      });
    } else if (!existing) {
      await ctx.db.insert("dailySummaries", {
        userId: args.userId,
        businessId: args.businessId,
        date: args.date,
        totalRevenue,
        totalExpenses,
        netProfit,
        salesCount: filteredSales.length,
        expensesCount: filteredExpenses.length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// =================================================================
// 🎯 METAS FINANCEIRAS
// =================================================================

export const addFinancialGoal = mutation({
  args: {
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
    period: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("yearly")
    ),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    return await ctx.db.insert("financialGoals", {
      userId: identity.subject,
      businessId: args.businessId,
      type: args.type,
      title: args.title,
      description: args.description,
      targetValue: args.targetValue,
      currentValue: 0,
      period: args.period,
      startDate: args.startDate,
      endDate: args.endDate,
      status: "active",
      createdAt: Date.now(),
    });
  },
});

export const updateFinancialGoal = mutation({
  args: {
    id: v.id("financialGoals"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    targetValue: v.optional(v.number()),
    currentValue: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("achieved"),
        v.literal("failed"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const goal = await ctx.db.get(args.id);
    if (!goal || goal.userId !== identity.subject) {
      throw new Error("Meta não encontrada");
    }

    const { id, ...updates } = args;

    // Se alcançou a meta
    if (args.status === "achieved" && goal.status !== "achieved") {
      await ctx.db.patch(id, {
        ...updates,
        achievedAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Criar alerta de conquista
      await ctx.db.insert("alerts", {
        userId: identity.subject,
        businessId: goal.businessId,
        type: "milestone",
        severity: "info",
        title: "🎉 Meta Alcançada!",
        message: `Parabéns! Você alcançou a meta: ${goal.title}`,
        relatedId: id,
        read: false,
        createdAt: Date.now(),
      });
    } else {
      await ctx.db.patch(id, {
        ...updates,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const deleteFinancialGoal = mutation({
  args: { id: v.id("financialGoals") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const goal = await ctx.db.get(args.id);
    if (!goal || goal.userId !== identity.subject) {
      throw new Error("Meta não encontrada");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const getFinancialGoals = query({
  args: {
    businessId: v.optional(v.id("businesses")),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("achieved"),
        v.literal("failed"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let results = await ctx.db
      .query("financialGoals")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    if (args.businessId) {
      results = results.filter((g) => g.businessId === args.businessId);
    }

    if (args.status) {
      results = results.filter((g) => g.status === args.status);
    }

    return results;
  },
});

// Atualiza progresso das metas automaticamente
export const updateGoalsProgress = action({
  args: {
    month: v.string(),
    businessId: v.optional(v.id("businesses")),
  },
  handler: async (ctx, args): Promise<{ updated: number }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    // Buscar metas ativas
    const goals: Doc<"financialGoals">[] = await ctx.runQuery(
      api.profitCalculator.getFinancialGoals,
      {
        businessId: args.businessId,
        status: "active",
      }
    );

    // Buscar relatório do mês
    const report = await ctx.runQuery(api.profitCalculator.getDashboard, {
      businessId: args.businessId,
    });

    if (!report) return { updated: 0 };

    let updatedCount = 0;

    for (const goal of goals) {
      let currentValue = 0;

      // Calcula valor atual baseado no tipo
      switch (goal.type) {
        case "revenue":
          currentValue = report.overview.totalRevenue;
          break;
        case "profit":
          currentValue = report.overview.netProfit;
          break;
        case "margin":
          currentValue = report.overview.profitMargin;
          break;
        case "sales_count":
          currentValue = report.overview.totalSales;
          break;
        case "expense_reduction":
          currentValue = report.overview.totalExpenses;
          break;
      }

      // Atualiza meta
      const newStatus = currentValue >= goal.targetValue ? "achieved" : "active";

      await ctx.runMutation(api.profitCalculator.updateFinancialGoal, {
        id: goal._id,
        currentValue,
        status: newStatus,
      });

      updatedCount++;
    }

    return { updated: updatedCount };
  },
});

// =================================================================
// 📊 DASHBOARD COMPLETO
// =================================================================

export const getDashboard = query({
  args: {
    businessId: v.optional(v.id("businesses")),
    period: v.optional(
      v.union(v.literal("week"), v.literal("month"), v.literal("year"))
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const allProducts = await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    const products = args.businessId
      ? allProducts.filter((p) => p.businessId === args.businessId)
      : allProducts;

    const activeProducts = products.filter((p) => p.active);

    const lowStockProducts = activeProducts.filter(
      (p) =>
        p.stock !== undefined &&
        p.minStock !== undefined &&
        p.stock <= p.minStock
    );

    const allSales = await ctx.db
      .query("sales")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", identity.subject).eq("month", currentMonth)
      )
      .collect();
    const sales = args.businessId
      ? allSales.filter((s) => s.businessId === args.businessId)
      : allSales;

    const allExpenses = await ctx.db
      .query("expenses")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", identity.subject).eq("month", currentMonth)
      )
      .collect();
    const expenses = args.businessId
      ? allExpenses.filter((e) => e.businessId === args.businessId)
      : allExpenses;

    const allPendingSales = await ctx.db
      .query("sales")
      .withIndex("by_payment_status", (q) =>
        q.eq("userId", identity.subject).eq("paymentStatus", "pending")
      )
      .collect();
    const pendingSales = args.businessId
      ? allPendingSales.filter((s) => s.businessId === args.businessId)
      : allPendingSales;

    const allOverdueExpenses = await ctx.db
      .query("expenses")
      .withIndex("by_payment_status", (q) =>
        q.eq("userId", identity.subject).eq("paymentStatus", "overdue")
      )
      .collect();
    const overdueExpenses = args.businessId
      ? allOverdueExpenses.filter((e) => e.businessId === args.businessId)
      : allOverdueExpenses;

    const allActiveGoals = await ctx.db
      .query("financialGoals")
      .withIndex("by_status", (q) =>
        q.eq("userId", identity.subject).eq("status", "active")
      )
      .collect();
    const activeGoals = args.businessId
      ? allActiveGoals.filter((g) => g.businessId === args.businessId)
      : allActiveGoals;

    // Alertas não lidos
    const allUnreadAlerts = await ctx.db
      .query("alerts")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", identity.subject).eq("read", false)
      )
      .collect();
    const unreadAlerts = args.businessId
      ? allUnreadAlerts.filter((a) => a.businessId === args.businessId)
      : allUnreadAlerts;

    const allCustomers = await ctx.db
      .query("customers")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    const customers = args.businessId
      ? allCustomers.filter((c) => c.businessId === args.businessId)
      : allCustomers;

    const vipCustomers = customers
      .filter((c) => c.tags?.includes("VIP"))
      .slice(0, 10);

    // Cálculos
    const totalRevenue = sales.reduce((sum, s) => sum + s.totalRevenue, 0);
    const totalCost = sales.reduce((sum, s) => sum + s.totalCost, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalCost - totalExpenses;
    const profitMargin =
      totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      overview: {
        totalRevenue,
        totalCost,
        totalExpenses,
        netProfit,
        profitMargin,
        totalSales: sales.length,
        totalProducts: products.length,
        totalCustomers: customers.length,
      },
      products: {
        total: products.length,
        lowStock: lowStockProducts.length,
        lowStockList: lowStockProducts.slice(0, 5),
      },
      sales: {
        total: sales.length,
        pending: pendingSales.length,
        pendingAmount: pendingSales.reduce((sum, s) => sum + s.totalRevenue, 0),
      },
      expenses: {
        total: expenses.length,
        overdue: overdueExpenses.slice(0, 50).length,
        overdueAmount: overdueExpenses.reduce((sum, e) => sum + e.amount, 0),
      },
      goals: {
        active: activeGoals.length,
        list: activeGoals.slice(0, 10),
      },
      alerts: {
        unread: unreadAlerts.length,
        critical: unreadAlerts.filter((a) => a.severity === "critical").length,
        list: unreadAlerts.slice(0, 5),
      },
      customers: {
        total: customers.length,
        vip: vipCustomers.length,
        vipList: vipCustomers,
      },
    };
  },
});

// =================================================================
// 🏢 EMPRESAS
// =================================================================

export const getBusinesses = query({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let query = ctx.db
      .query("businesses")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject));

    if (args.activeOnly) {
      query = ctx.db
        .query("businesses")
        .withIndex("by_user_active", (q) =>
          q.eq("userId", identity.subject).eq("active", true)
        );
    }

    return await query.order("desc").collect();
  },
});

export const getAllMonths = query({
  args: {
    businessId: v.optional(v.id("businesses")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let results = await ctx.db
      .query("monthlyReports")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    if (args.businessId) {
      results = results.filter((r) => r.businessId === args.businessId);
    }

    return results;
  },
});

// =================================================================
// 📦 PRODUTOS - CRUD COMPLETO
// =================================================================

export const getProducts = query({
  args: {
    businessId: v.optional(v.id("businesses")),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const productsQuery = ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject));

    let products = await productsQuery.order("desc").collect();

    if (args.businessId) {
      products = products.filter((p) => p.businessId === args.businessId);
    }
    if (args.activeOnly) {
      products = products.filter((p) => p.active);
    }
    return products;
  },
});

export const addProduct = mutation({
  args: {
    businessId: v.optional(v.id("businesses")),
    name: v.string(),
    costPrice: v.number(),
    salePrice: v.number(),
    sku: v.optional(v.string()),
    category: v.optional(v.string()),
    stock: v.optional(v.number()),
    minStock: v.optional(v.number()),
    unit: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    supplierId: v.optional(v.id("suppliers")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    return await ctx.db.insert("products", {
      userId: identity.subject,
      businessId: args.businessId,
      name: args.name,
      costPrice: args.costPrice,
      salePrice: args.salePrice,
      sku: args.sku,
      category: args.category,
      stock: args.stock,
      minStock: args.minStock,
      unit: args.unit,
      description: args.description,
      tags: args.tags,
      supplierId: args.supplierId,
      active: true,
      createdAt: Date.now(),
    });
  },
});

export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    costPrice: v.optional(v.number()),
    salePrice: v.optional(v.number()),
    sku: v.optional(v.string()),
    category: v.optional(v.string()),
    stock: v.optional(v.number()),
    minStock: v.optional(v.number()),
    unit: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    supplierId: v.optional(v.id("suppliers")),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const product = await ctx.db.get(args.id);
    if (!product || product.userId !== identity.subject) {
      throw new Error("Produto não encontrado");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const deleteProduct = mutation({
    args: {
      id: v.id("products"),
      permanent: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) throw new Error("Faça login para continuar");

      const product = await ctx.db.get(args.id);
      if (!product || product.userId !== identity.subject) {
        throw new Error("Produto não encontrado");
      }

      // BUSCAR VENDAS APENAS DO MESMO BUSINESSID
      let sales = await ctx.db
        .query("sales")
        .withIndex("by_user", (q) => q.eq("userId", identity.subject))
        .filter((q) => q.eq(q.field("productId"), args.id))
        .collect();

      // Se o produto tem businessId, filtrar vendas do mesmo business
      if (product.businessId) {
        sales = sales.filter((s) => s.businessId === product.businessId);
      }

      // Deletar vendas
      for (const sale of sales) {
        // ✅ RESTAURAR ESTOQUE, DADOS DO CLIENTE E REVERTER STREAK
        // É importante executar essas lógicas de limpeza antes de apagar a venda do banco.
        await ctx.runMutation(api.profitCalculator.deleteSale, { id: sale._id, permanent: true });
        // O deleteSale já fará a exclusão e ajuste de estoque/cliente/streak/gamification
      }

      // Recalcular relatórios mensais afetados
      const affectedMonths = [...new Set(sales.map((s) => s.month))];

      // 1. Deleta os relatórios existentes e 2. Agenda a regeneração
      for (const month of affectedMonths) {
        const reports = await ctx.db
          .query("monthlyReports")
          .withIndex("by_user_month", (q) =>
            q.eq("userId", identity.subject).eq("month", month)
          )
          .collect();

        for (const report of reports) {
          if (!product.businessId || report.businessId === product.businessId) {
            // Deleta o relatório (para ser recriado com novos dados)
            await ctx.db.delete(report._id);
          }
        }

        // ✅ CORREÇÃO CRÍTICA: Agenda a regeneração do relatório mensal
        await ctx.scheduler.runAfter(100, internal.profitCalculator.regenerateMonthlyReport, {
          userId: identity.subject,
          month,
          businessId: product.businessId,
        });
      }

      // Deletar ou desativar o produto
      if (args.permanent) {
        await ctx.db.delete(args.id);
      } else {
        await ctx.db.patch(args.id, {
          active: false,
          updatedAt: Date.now(),
        });
      }

      return {
        success: true,
        deletedSales: sales.length,
        affectedMonths: affectedMonths.length,
      };
    },
  });

// =================================================================
// 🗑️ LIMPEZA DE DADOS
// =================================================================

export const clearMonthData = mutation({
  args: {
    month: v.string(),
    businessId: v.optional(v.id("businesses")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");


    let deletedSalesCount = 0;
    let deletedExpensesCount = 0;
    let deletedSummariesCount = 0;
    let deletedCashFlowCount = 0;

    // 1️⃣ Deletar vendas do mês
    const sales = await ctx.db
      .query("sales")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", identity.subject).eq("month", args.month)
      )
      .collect();

    for (const sale of sales) {
      if (!args.businessId || sale.businessId === args.businessId) {
        // ✅ RESTAURAR ESTOQUE antes de deletar
        if (sale.productId) {
          const product = await ctx.db.get(sale.productId);
          if (product && product.stock !== undefined) {
            await ctx.db.patch(product._id, {
              stock: product.stock + sale.quantity,
              totalSold: Math.max(0, (product.totalSold ?? 0) - sale.quantity),
              totalRevenue: Math.max(0, (product.totalRevenue ?? 0) - sale.totalRevenue),
              totalProfit: Math.max(0, (product.totalProfit ?? 0) - sale.profit),
              updatedAt: Date.now(),
            });
          }
        }

        await ctx.db.delete(sale._id);
        deletedSalesCount++;
      }
    }

    // 2️⃣ Deletar gastos do mês
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", identity.subject).eq("month", args.month)
      )
      .collect();

    for (const expense of expenses) {
      if (!args.businessId || expense.businessId === args.businessId) {
        await ctx.db.delete(expense._id);
        deletedExpensesCount++;
      }
    }

    // 3️⃣ ✅ CRÍTICO: Deletar resumos diários do mês (ISSO ESTAVA FALTANDO!)
    const dailySummaries = await ctx.db
      .query("dailySummaries")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    for (const summary of dailySummaries) {
      if (summary.date.startsWith(args.month)) {
        if (!args.businessId || summary.businessId === args.businessId) {
          await ctx.db.delete(summary._id);
          deletedSummariesCount++;
        }
      }
    }

    // 4️⃣ ✅ CRÍTICO: Deletar cash flow do mês (ISSO ESTAVA FALTANDO!)
    const cashFlows = await ctx.db
      .query("cashFlow")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    for (const flow of cashFlows) {
      if (flow.date.startsWith(args.month)) {
        if (!args.businessId || flow.businessId === args.businessId) {
          await ctx.db.delete(flow._id);
          deletedCashFlowCount++;
        }
      }
    }

    // 5️⃣ Deletar relatórios mensais
    const reports = await ctx.db
      .query("monthlyReports")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", identity.subject).eq("month", args.month)
      )
      .collect();

    for (const report of reports) {
      if (!args.businessId || report.businessId === args.businessId) {
        await ctx.db.delete(report._id);
      }
    }

    return {
      success: true,
      deletedSales: deletedSalesCount,
      deletedExpenses: deletedExpensesCount,
      deletedSummaries: deletedSummariesCount,
      deletedCashFlow: deletedCashFlowCount,
    };
  },
});

export const deleteCashFlow = mutation({
  args: {
    id: v.id("cashFlow"),
    deleteRelatedRecord: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const flow = await ctx.db.get(args.id);
    if (!flow || flow.userId !== identity.subject) {
      throw new Error("Movimentação não encontrada");
    }

    const month = flow.date.substring(0, 7);

    // 1️⃣ DELETAR REGISTRO RELACIONADO (VENDA OU GASTO)
    if (args.deleteRelatedRecord) {
      if (flow.type === "in") {
        // Buscar venda relacionada
        const sales = await ctx.db
          .query("sales")
          .withIndex("by_user_date", (q) =>
            q.eq("userId", identity.subject).eq("date", flow.date)
          )
          .collect();

        const relatedSale = sales.find(s =>
          Math.abs(s.totalRevenue - flow.amount) < 0.01 &&
          s.isQuickSale === true
        );

        if (relatedSale) {
          await ctx.db.delete(relatedSale._id);
        }
      } else {
        // Buscar gasto relacionado
        const expenses = await ctx.db
          .query("expenses")
          .withIndex("by_user_month", (q) =>
            q.eq("userId", identity.subject).eq("month", month)
          )
          .filter((q) => q.eq(q.field("date"), flow.date))
          .collect();

        const relatedExpense = expenses.find(e =>
          Math.abs(e.amount - flow.amount) < 0.01 &&
          e.description === flow.description
        );

        if (relatedExpense) {
          await ctx.db.delete(relatedExpense._id);
        }
      }
    }

    // 2️⃣ DELETAR O CASHFLOW
    await ctx.db.delete(args.id);

    // ✅ CORREÇÃO: Força a atualização do resumo diário
    await ctx.scheduler.runAfter(0, internal.profitCalculator.updateDailySummary, {
      userId: identity.subject,
      date: flow.date,
      businessId: flow.businessId,
    });

    // 4️⃣ REGENERAR RELATÓRIO MENSAL (RESUMO DE NOVEMBRO 2025)
    await ctx.scheduler.runAfter(500, internal.profitCalculator.regenerateMonthlyReport, {
      userId: identity.subject,
      month: month,
      businessId: flow.businessId,
    });

    return { success: true };
  },
});


export const clearAllData = mutation({
  args: {
    businessId: v.optional(v.id("businesses")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const deletedCount = {
      products: 0,
      sales: 0,
      expenses: 0,
      reports: 0,
      customers: 0,
      suppliers: 0,
      goals: 0,
      dailySummaries: 0, // ✅ ADICIONADO
      cashFlow: 0,       // ✅ ADICIONADO
    };

    // Deletar produtos
    const products = await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    for (const product of products) {
      if (!args.businessId || product.businessId === args.businessId) {
        await ctx.db.delete(product._id);
        deletedCount.products++;
      }
    }

    // Deletar vendas
    const sales = await ctx.db
      .query("sales")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    for (const sale of sales) {
      if (!args.businessId || sale.businessId === args.businessId) {
        await ctx.db.delete(sale._id);
        deletedCount.sales++;
      }
    }

    // Deletar gastos
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    for (const expense of expenses) {
      if (!args.businessId || expense.businessId === args.businessId) {
        await ctx.db.delete(expense._id);
        deletedCount.expenses++;
      }
    }

    // Deletar relatórios
    const reports = await ctx.db
      .query("monthlyReports")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    for (const report of reports) {
      if (!args.businessId || report.businessId === args.businessId) {
        await ctx.db.delete(report._id);
        deletedCount.reports++;
      }
    }

    // Deletar clientes
    const customers = await ctx.db
      .query("customers")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    for (const customer of customers) {
      if (!args.businessId || customer.businessId === args.businessId) {
        await ctx.db.delete(customer._id);
        deletedCount.customers++;
      }
    }

    // Deletar fornecedores
    const suppliers = await ctx.db
      .query("suppliers")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    for (const supplier of suppliers) {
      if (!args.businessId || supplier.businessId === args.businessId) {
        await ctx.db.delete(supplier._id);
        deletedCount.suppliers++;
      }
    }

    // Deletar metas
    const goals = await ctx.db
      .query("financialGoals")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    for (const goal of goals) {
      if (!args.businessId || goal.businessId === args.businessId) {
        await ctx.db.delete(goal._id);
        deletedCount.goals++;
      }
    }

    // ✅ [INÍCIO DA CORREÇÃO] DELETAR DADOS DO MODO RÁPIDO
    const summaries = await ctx.db
      .query("dailySummaries")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    for (const summary of summaries) {
      if (!args.businessId || summary.businessId === args.businessId) {
        await ctx.db.delete(summary._id);
        deletedCount.dailySummaries++;
      }
    }

    const cashFlows = await ctx.db
      .query("cashFlow")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    for (const flow of cashFlows) {
      if (!args.businessId || flow.businessId === args.businessId) {
        await ctx.db.delete(flow._id);
        deletedCount.cashFlow++;
      }
    }
    // ✅ [FIM DA CORREÇÃO]

    return {
      success: true,
      ...deletedCount,
    };
  },
});

// =================================================================
// 💰 VENDAS
// =================================================================

export const getSalesByMonth = query({
  args: {
    month: v.string(),
    businessId: v.optional(v.id("businesses")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let sales = await ctx.db
      .query("sales")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", identity.subject).eq("month", args.month)
      )
      .order("desc")
      .collect();

    if (args.businessId) {
      sales = sales.filter((s) => s.businessId === args.businessId);
    }

    return sales;
  },
});

export const addSale = mutation({
  args: {
    productId: v.id("products"),
    customerId: v.optional(v.id("customers")),
    quantity: v.number(),
    discount: v.optional(v.number()),
    date: v.string(),
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
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Produto não encontrado");

    // ✅ VALIDAR SE PRODUTO ESTÁ ATIVO
    if (!product.active) {
      throw new Error("Produto inativo. Ative-o antes de vender.");
    }

    // Calcular totais
    const salePrice = product.salePrice;
    const totalRevenue = salePrice * args.quantity - (args.discount ?? 0);
    const totalCost = product.costPrice * args.quantity;
    const profit = totalRevenue - totalCost;
    const month = args.date.substring(0, 7);

    // ✅ VALIDAR ESTOQUE NEGATIVO
    if (product.stock !== undefined) {
      const newStock = product.stock - args.quantity;

      if (newStock < 0) {
        throw new Error(`Estoque insuficiente! Disponível: ${product.stock}`);
      }
    }

    // ✅ GUARDAR O ID DA VENDA
    const saleId = await ctx.db.insert("sales", {
      userId: identity.subject,
      businessId: product.businessId,
      customerId: args.customerId,
      productId: args.productId,
      productName: product.name,
      quantity: args.quantity,
      costPrice: product.costPrice,
      salePrice: salePrice,
      discount: args.discount,
      totalCost,
      totalRevenue,
      profit,
      paymentMethod: args.paymentMethod,
      paymentStatus: args.paymentStatus,
      date: args.date,
      month,
      notes: args.notes,
      createdAt: Date.now(),
    });

    // ✅ ATUALIZAR ESTOQUE E ESTATÍSTICAS DO PRODUTO
    if (product.stock !== undefined) {
      const newStock = product.stock - args.quantity;

      await ctx.db.patch(product._id, {
        stock: newStock,
        totalSold: (product.totalSold ?? 0) + args.quantity,
        totalRevenue: (product.totalRevenue ?? 0) + totalRevenue,
        totalProfit: (product.totalProfit ?? 0) + profit,
        updatedAt: Date.now(),
      });

      // ✅ CRIAR ALERTA SE ESTOQUE BAIXO
      if (product.minStock && newStock <= product.minStock) {
        await ctx.db.insert("alerts", {
          userId: identity.subject,
          businessId: product.businessId,
          type: "low_stock",
          severity: "warning",
          title: "⚠️ Estoque Baixo",
          message: `O produto "${product.name}" está com estoque baixo (${newStock} unidades).`,
          relatedId: args.productId,
          read: false,
          createdAt: Date.now(),
        });
      }
    }

    // ✅ ATUALIZAR DADOS DO CLIENTE (se fornecido)
    if (args.customerId) {
      const customer = await ctx.db.get(args.customerId);
      if (customer) {
        await ctx.db.patch(args.customerId, {
          totalSpent: customer.totalSpent + totalRevenue,
          totalOrders: customer.totalOrders + 1,
          lastPurchase: Date.now(),
          updatedAt: Date.now(),
        });
      }
    }

    await ctx.scheduler.runAfter(0, internal.gamification.updateActivityStreak, {
      userId: identity.subject,
    });

    // ✅ RETORNAR O ID DA VENDA
    return saleId;
  },
});

export const deleteSale = mutation({
  args: { id: v.id("sales"), permanent: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const sale = await ctx.db.get(args.id);
    if (!sale) {
      throw new Error("Venda não encontrada.");
    }
    if (sale.userId !== identity.subject) {
      throw new Error("Você não tem permissão para deletar esta venda.");
    }

    // ✅ RESTAURAR ESTOQUE E ATUALIZAR ESTATÍSTICAS DO PRODUTO
    if (sale.productId) {
      const product = await ctx.db.get(sale.productId);
      if (product && product.stock !== undefined) {
        await ctx.db.patch(product._id, {
          stock: product.stock + sale.quantity,
          totalSold: Math.max(0, (product.totalSold ?? 0) - sale.quantity),
          totalRevenue: Math.max(0, (product.totalRevenue ?? 0) - sale.totalRevenue),
          totalProfit: Math.max(0, (product.totalProfit ?? 0) - sale.profit),
          updatedAt: Date.now(),
        });
      }
    }

    // ✅ ATUALIZAR CLIENTE (se houver)
    if (sale.customerId) {
      const customer = await ctx.db.get(sale.customerId);
      if (customer) {
        await ctx.db.patch(sale.customerId, {
          totalSpent: Math.max(0, customer.totalSpent - sale.totalRevenue),
          totalOrders: Math.max(0, customer.totalOrders - 1),
          updatedAt: Date.now(),
        });
      }
    }

    // Soft delete ou permanent
    if (!args.permanent) {
      await ctx.db.insert("deletedRecords", {
        userId: identity.subject,
        recordType: "sale",
        recordId: sale._id,
        recordData: JSON.stringify(sale),
        deletedAt: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 dias
      });
    }

    await ctx.db.delete(args.id);

    // ✅ REVERTER STREAK E XP QUANDO VENDA É REMOVIDA
    await ctx.scheduler.runAfter(0, internal.gamification.revertActivityStreak, {
      userId: identity.subject,
      saleDate: sale.date,
    });

    return { success: true };
  },
});

// =================================================================
// 🧾 GASTOS
// =================================================================

export const getExpensesByMonth = query({
  args: {
    month: v.string(),
    businessId: v.optional(v.id("businesses")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", identity.subject).eq("month", args.month)
      )
      .order("desc")
      .collect();

    if (args.businessId) {
      expenses = expenses.filter((e) => e.businessId === args.businessId);
    }

    return expenses;
  },
});

export const addExpense = mutation({
  args: {
    description: v.string(),
    amount: v.number(),
    categoryName: v.string(),
    type: v.union(
      v.literal("fixed"),
      v.literal("variable"),
      v.literal("one_time")
    ),
    date: v.string(),
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
      v.union(v.literal("paid"), v.literal("pending"), v.literal("overdue"))
    ),
    notes: v.optional(v.string()),
    supplierId: v.optional(v.id("suppliers")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const month = args.date.substring(0, 7);

    // ✅ GUARDAR O ID DO GASTO
    const expenseId = await ctx.db.insert("expenses", {
      userId: identity.subject,
      description: args.description,
      amount: args.amount,
      categoryName: args.categoryName,
      type: args.type,
      date: args.date,
      month,
      paymentMethod: args.paymentMethod,
      paymentStatus: args.paymentStatus,
      supplierId: args.supplierId,
      notes: args.notes,
      createdAt: Date.now(),
    });

    // ✅ RETORNAR O ID DO GASTO
    return expenseId;
  },
});

export const deleteExpense = mutation({
  args: { id: v.id("expenses"), permanent: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const expense = await ctx.db.get(args.id);
    if (!expense || expense.userId !== identity.subject) {
      throw new Error("Gasto não encontrado ou sem permissão.");
    }

    if (args.permanent) {
      await ctx.db.delete(args.id);
    } else {
      await ctx.db.delete(args.id);
    }
  },
});

// =================================================================
// 👥 CLIENTES - CRUD COMPLETO
// =================================================================

export const getCustomers = query({
  args: {
    businessId: v.optional(v.id("businesses")),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let customers = await ctx.db
      .query("customers")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    if (args.businessId) {
      customers = customers.filter((c) => c.businessId === args.businessId);
    }

    if (args.activeOnly) {
      customers = customers.filter((c) => c.active !== false);
    }

    return customers;
  },
});

export const addCustomer = mutation({
  args: {
    businessId: v.optional(v.id("businesses")),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    return await ctx.db.insert("customers", {
      userId: identity.subject,
      businessId: args.businessId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      address: args.address,
      tags: args.tags,
      notes: args.notes,
      totalSpent: 0,
      totalOrders: 0,
      active: true,
      createdAt: Date.now(),
    });
  },
});

export const updateCustomer = mutation({
  args: {
    id: v.id("customers"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const customer = await ctx.db.get(args.id);
    if (!customer || customer.userId !== identity.subject) {
      throw new Error("Cliente não encontrado");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const deleteCustomer = mutation({
  args: {
    id: v.id("customers"),
    permanent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const customer = await ctx.db.get(args.id);
    if (!customer || customer.userId !== identity.subject) {
      throw new Error("Cliente não encontrado");
    }

    if (args.permanent) {
      await ctx.db.delete(args.id);
    } else {
      await ctx.db.patch(args.id, {
        active: false,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// =================================================================
// 🚚 FORNECEDORES - CRUD COMPLETO
// =================================================================

export const getSuppliers = query({
  args: {
    businessId: v.optional(v.id("businesses")),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let suppliers = await ctx.db
      .query("suppliers")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    if (args.businessId) {
      suppliers = suppliers.filter((s) => s.businessId === args.businessId);
    }

    if (args.activeOnly) {
      suppliers = suppliers.filter((s) => s.active !== false);
    }

    return suppliers;
  },
});

export const addSupplier = mutation({
  args: {
    businessId: v.optional(v.id("businesses")),
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    return await ctx.db.insert("suppliers", {
      userId: identity.subject,
      businessId: args.businessId,
      name: args.name,
      contact: {
        email: args.email,
        phone: args.phone,
        address: args.address,
      },
      notes: args.notes,
      active: true,
      createdAt: Date.now(),
    });
  },
});

export const updateSupplier = mutation({
  args: {
    id: v.id("suppliers"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const supplier = await ctx.db.get(args.id);
    if (!supplier || supplier.userId !== identity.subject) {
      throw new Error("Fornecedor não encontrado");
    }

    const { id, email, phone, address, ...otherUpdates } = args;

    await ctx.db.patch(id, {
      ...otherUpdates,
      contact: {
        ...supplier.contact,
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
      },
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const deleteSupplier = mutation({
  args: {
    id: v.id("suppliers"),
    permanent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const supplier = await ctx.db.get(args.id);
    if (!supplier || supplier.userId !== identity.subject) {
      throw new Error("Fornecedor não encontrado");
    }

    if (args.permanent) {
      await ctx.db.delete(args.id);
    } else {
      await ctx.db.patch(args.id, {
        active: false,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// =================================================================
// 📥 IMPORTAÇÃO DE DADOS (EXCEL/CSV)
// =================================================================

export const importProducts = mutation({
  args: {
    businessId: v.optional(v.id("businesses")),
    products: v.array(
      v.object({
        name: v.string(),
        costPrice: v.number(),
        salePrice: v.number(),
        sku: v.optional(v.string()),
        category: v.optional(v.string()),
        stock: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const imported: Id<"products">[] = [];
    const errors: Array<{ index: number; error: string }> = [];

    for (let i = 0; i < args.products.length; i++) {
      const product = args.products[i];

      try {
        const id = await ctx.db.insert("products", {
          userId: identity.subject,
          businessId: args.businessId,
          name: product.name,
          costPrice: product.costPrice,
          salePrice: product.salePrice,
          sku: product.sku,
          category: product.category,
          stock: product.stock,
          active: true,
          createdAt: Date.now(),
        });
        imported.push(id);
      } catch (error) {
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    }

    return {
      success: errors.length === 0,
      imported: imported.length,
      failed: errors.length,
      errors,
    };
  },
});

export const importSales = mutation({
  args: {
    businessId: v.optional(v.id("businesses")),
    sales: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
        date: v.string(),
        notes: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const imported: Id<"sales">[] = [];
    const errors: Array<{ index: number; error: string }> = [];

    for (let i = 0; i < args.sales.length; i++) {
      const sale = args.sales[i];

      try {
        const product = await ctx.db.get(sale.productId);
        if (!product) {
          throw new Error("Produto não encontrado");
        }

        const totalCost = product.costPrice * sale.quantity;
        const totalRevenue = product.salePrice * sale.quantity;
        const profit = totalRevenue - totalCost;
        const month = sale.date.substring(0, 7);

        const id = await ctx.db.insert("sales", {
          userId: identity.subject,
          businessId: args.businessId,
          productId: sale.productId,
          productName: product.name,
          quantity: sale.quantity,
          costPrice: product.costPrice,
          salePrice: product.salePrice,
          totalCost,
          totalRevenue,
          profit,
          paymentStatus: "paid",
          date: sale.date,
          month,
          notes: sale.notes,
          createdAt: Date.now(),
        });

        imported.push(id);

        // Atualiza estoque
        if (product.stock !== undefined) {
          await ctx.db.patch(sale.productId, {
            stock: Math.max(0, product.stock - sale.quantity),
            updatedAt: Date.now(),
          });
        }
      } catch (error) {
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    }

    return {
      success: errors.length === 0,
      imported: imported.length,
      failed: errors.length,
      errors,
    };
  },
});

export const importExpenses = mutation({
  args: {
    businessId: v.optional(v.id("businesses")),
    expenses: v.array(
      v.object({
        description: v.string(),
        amount: v.number(),
        categoryName: v.string(),
        date: v.string(),
        type: v.union(
          v.literal("fixed"),
          v.literal("variable"),
          v.literal("one_time")
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const imported: Id<"expenses">[] = [];
    const errors: Array<{ index: number; error: string }> = [];

    for (let i = 0; i < args.expenses.length; i++) {
      const expense = args.expenses[i];

      try {
        const month = expense.date.substring(0, 7);

        const id = await ctx.db.insert("expenses", {
          userId: identity.subject,
          businessId: args.businessId,
          categoryName: expense.categoryName,
          description: expense.description,
          amount: expense.amount,
          type: expense.type,
          paymentStatus: "paid",
          date: expense.date,
          month,
          paidAt: Date.now(),
          createdAt: Date.now(),
        });

        imported.push(id);
      } catch (error) {
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    }

    return {
      success: errors.length === 0,
      imported: imported.length,
      failed: errors.length,
      errors,
    };
  },
});

// =================================================================
// 📄 RELATÓRIOS
// =================================================================

export const getMonthlyReport = query({
  args: {
    month: v.string(),
    businessId: v.optional(v.id("businesses")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const report = await ctx.db
      .query("monthlyReports")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", identity.subject).eq("month", args.month)
      )
      .first();

    if (report && args.businessId && report.businessId !== args.businessId) {
      const businessReport = await ctx.db
        .query("monthlyReports")
        .withIndex("by_user_month", (q) =>
          q.eq("userId", identity.subject).eq("month", args.month)
        )
        .filter((q) => q.eq(q.field("businessId"), args.businessId))
        .first();
      return businessReport || null;
    }

    return report || null;
  },
});

export const createMonthlyReport = mutation({
  args: {
    month: v.string(),
    businessId: v.optional(v.id("businesses")),
    totalSales: v.number(),
    totalRevenue: v.number(),
    totalCost: v.number(),
    grossProfit: v.number(),
    totalExpenses: v.number(),
    fixedExpenses: v.number(),
    variableExpenses: v.number(),
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    await ctx.db.insert("monthlyReports", {
      ...args,
      userId: identity.subject,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const generateMonthlyReport = action({
  args: {
    month: v.string(),
    businessId: v.optional(v.id("businesses")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    try {
      // Buscar vendas
      const sales: Doc<"sales">[] = await ctx.runQuery(
        api.profitCalculator.getSalesByMonth,
        {
          month: args.month,
          businessId: args.businessId,
        }
      );

      // Buscar gastos
      const expenses: Doc<"expenses">[] = await ctx.runQuery(
        api.profitCalculator.getExpensesByMonth,
        {
          month: args.month,
          businessId: args.businessId,
        }
      );

      // ✅ VALIDAR SE HÁ DADOS
      if (sales.length === 0 && expenses.length === 0) {
        throw new Error("Nenhum dado encontrado para este mês");
      }

      // Calcular totais de vendas
      const totalSales = sales.reduce((sum, s) => sum + s.quantity, 0);
      const totalRevenue = sales.reduce((sum, s) => sum + s.totalRevenue, 0);
      const totalCost = sales.reduce((sum, s) => sum + s.totalCost, 0);
      const grossProfit = totalRevenue - totalCost;

      // Calcular totais de gastos
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const fixedExpenses = expenses
        .filter((e) => e.type === "fixed")
        .reduce((sum, e) => sum + e.amount, 0);
      const variableExpenses = expenses
        .filter((e) => e.type === "variable")
        .reduce((sum, e) => sum + e.amount, 0);

      // Gastos por categoria
      const expensesByCategory: {
        aluguel?: number;
        luz_agua?: number;
        internet?: number;
        transporte?: number;
        alimentacao?: number;
        marketing?: number;
        materiais?: number;
        funcionarios?: number;
        outros?: number;
      } = {};

      expenses.forEach((expense) => {
        const category = expense.categoryName.toLowerCase();
        if (category in expensesByCategory) {
          expensesByCategory[category as keyof typeof expensesByCategory] =
            (expensesByCategory[category as keyof typeof expensesByCategory] || 0) + expense.amount;
        } else {
          expensesByCategory.outros = (expensesByCategory.outros || 0) + expense.amount;
        }
      });

      // Lucro
      const netProfit = grossProfit - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      // Top produtos
      const productsMap = new Map<
        string,
        { name: string; quantity: number; revenue: number; profit: number }
      >();
      sales.forEach((sale) => {
        const productId = sale.productId || sale._id;
        const existing = productsMap.get(productId) || {
          name: sale.productName,
          quantity: 0,
          revenue: 0,
          profit: 0,
        };
        productsMap.set(productId, {
          name: sale.productName,
          quantity: existing.quantity + sale.quantity,
          revenue: existing.revenue + sale.totalRevenue,
          profit: existing.profit + sale.profit,
        });
      });
      const topProducts = Array.from(productsMap.entries())
        .map(([id, { name: productName, ...rest }]) => ({
          productId: id,
          productName,
          ...rest,
        }))
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 10);

      // ✅ DELETAR RELATÓRIO ANTIGO ANTES DE CRIAR NOVO
      const existingReport = await ctx.runQuery(
        api.profitCalculator.getMonthlyReport,
        { month: args.month, businessId: args.businessId }
      );

      if (existingReport) {
        await ctx.runMutation(internal.profitCalculator.deleteReport, {
          reportId: existingReport._id,
        });
      }

      // Salvar novo relatório
      await ctx.runMutation(api.profitCalculator.createMonthlyReport, {
        month: args.month,
        businessId: args.businessId,
        totalSales,
        totalRevenue,
        totalCost,
        grossProfit,
        totalExpenses,
        fixedExpenses,
        variableExpenses,
        expensesByCategory,
        netProfit,
        profitMargin,
        topProducts,
      });

      return {
        success: true,
        message: `Relatório de ${args.month} gerado com sucesso!`,
      };
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro ao gerar relatório",
      };
    }
  },
});

// ✅ INTERNAL ACTION PARA REGENERAR RELATÓRIO MENSAL
export const regenerateMonthlyReport = internalAction({
  args: {
    userId: v.string(),
    month: v.string(),
    businessId: v.optional(v.id("businesses")),
  },
  handler: async (ctx, args) => {
    // Chama a action generateMonthlyReport
    await ctx.runAction(api.profitCalculator.generateMonthlyReport, {
      month: args.month,
      businessId: args.businessId,
    });
  },
});

// ✅ MUTATION INTERNO PARA DELETAR RELATÓRIO
export const deleteReport = internalMutation({
  args: { reportId: v.id("monthlyReports") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.reportId);
  },
});

// =================================================================
// 📤 EXPORTAÇÃO DE DADOS
// =================================================================

export const createExport = mutation({
  args: {
    businessId: v.optional(v.id("businesses")),
    type: v.union(v.literal("excel"), v.literal("pdf"), v.literal("csv")),
    dataType: v.union(
      v.literal("sales"),
      v.literal("expenses"),
      v.literal("products"),
      v.literal("report"),
      v.literal("all")
    ),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    return await ctx.db.insert("exports", {
      userId: identity.subject,
      businessId: args.businessId,
      type: args.type,
      dataType: args.dataType,
      period:
        args.startDate && args.endDate
          ? {
              start: args.startDate,
              end: args.endDate,
            }
          : undefined,
      status: "processing",
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 dias
    });
  },
});

export const getExports = query({
  args: { businessId: v.optional(v.id("businesses")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let results = await ctx.db
      .query("exports")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(50);

    if (args.businessId) {
      results = results.filter((e) => e.businessId === args.businessId);
    }

    return results;
  },
});

// =================================================================
// 🔔 ALERTAS
// =================================================================

export const getAlerts = query({
  args: {
    businessId: v.optional(v.id("businesses")),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    let alertsQuery;
    if (args.unreadOnly) {
      alertsQuery = ctx.db
        .query("alerts")
        .withIndex("by_user_unread", (q) =>
          q.eq("userId", identity.subject).eq("read", false)
        );
    } else {
      alertsQuery = ctx.db
        .query("alerts")
        .withIndex("by_user", (q) => q.eq("userId", identity.subject));
    }

    let alerts = await alertsQuery.order("desc").collect();

    if (args.businessId) {
      alerts = alerts.filter((a) => a.businessId === args.businessId);
    }
    return alerts;
  },
});

export const markAlertAsRead = mutation({
  args: { id: v.id("alerts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { read: true, readAt: Date.now() });
  },
});

// =================================================================
// 🧮 CALCULADORA DE PREÇO (IA)
// =================================================================

export const calculateSuggestedPrice = action({
  args: {
    costPrice: v.number(),
    targetMargin: v.optional(v.number()),
    competitors: v.optional(v.array(v.number())),
    category: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    suggestedPrice: number;
    minPrice: number;
    maxPrice: number;
    targetProfit: number;
    analysis: string[];
  }> => {
    // Validação de entrada
    if (!args.costPrice || args.costPrice <= 0 || !isFinite(args.costPrice)) {
      throw new Error("Custo do produto deve ser um número positivo válido.");
    }

    // Validar e normalizar targetMargin (garantir que está entre 0 e 99.9)
    const originalTargetMargin = args.targetMargin ?? 40;
    let targetMargin = originalTargetMargin;
    let marginWasAdjusted = false;

    if (!isFinite(targetMargin) || targetMargin < 0) {
      targetMargin = 40;
    }

    // CRÍTICO: Margem de 100% é impossível matematicamente
    if (targetMargin >= 100) {
      targetMargin = 99.9; // Limite máximo sensato
      marginWasAdjusted = true;
    }

    // Fórmula correta de Margem sobre a Venda:
    // Preço Sugerido = Custo / (1 - Margem/100)
    const calculatePrice = (cost: number, margin: number): number => {
      // Garantir que a margem está no intervalo válido [0, 99.9]
      const safeMargin = Math.max(0, Math.min(99.9, margin));
      const divisor = 1 - safeMargin / 100;

      // Divisor deve ser positivo e maior que zero
      if (divisor <= 0 || !isFinite(divisor)) {
        // Fallback extremo: se divisor for inválido, usar margem de 99.9%
        return cost / (1 - 99.9 / 100);
      }

      const price = cost / divisor;

      // Validar resultado
      if (!isFinite(price) || price <= 0) {
        // Fallback: usar margem padrão de 40%
        return cost / (1 - 40 / 100);
      }

      return price;
    };

    // Calcular preços com precisão
    const suggestedPrice = calculatePrice(args.costPrice, targetMargin);
    const minPrice = calculatePrice(args.costPrice, 20);
    const maxPrice = calculatePrice(args.costPrice, 70);

    // targetProfit = suggestedPrice - costPrice (fórmula exata)
    const targetProfit = suggestedPrice - args.costPrice;

    // Garantir que todos os valores são números válidos e finitos
    const safeSuggestedPrice = isFinite(suggestedPrice) && suggestedPrice > 0
      ? suggestedPrice
      : args.costPrice / (1 - 40 / 100); // Fallback: 40% de margem
    const safeMinPrice = isFinite(minPrice) && minPrice > 0
      ? minPrice
      : args.costPrice / (1 - 20 / 100); // Fallback: 20% de margem
    const safeMaxPrice = isFinite(maxPrice) && maxPrice > 0
      ? maxPrice
      : args.costPrice / (1 - 70 / 100); // Fallback: 70% de margem
    const safeTargetProfit = isFinite(targetProfit) && targetProfit >= 0
      ? targetProfit
      : safeSuggestedPrice - args.costPrice;

    const analysis: string[] = [];

    // ALERTA CRÍTICO: Se a margem foi ajustada de >= 100% para 99.9%
    if (marginWasAdjusted) {
      analysis.push(
        "⚠️ Margem de 100% é impossível. O preço sugerido foi calculado com uma margem máxima de 99,9%."
      );
    }

    // Análise da margem (sempre adiciona uma mensagem)
    if (targetMargin < 20) {
      analysis.push(
        "⚠️ Margem muito baixa. Difícil cobrir custos operacionais."
      );
    } else if (targetMargin < 30) {
      analysis.push("⚡ Margem aceitável, mas pode ser otimizada.");
    } else if (targetMargin < 50) {
      analysis.push("✅ Margem saudável para a maioria dos negócios.");
    } else if (targetMargin < 80) {
      analysis.push("💎 Margem excelente! Produto de alto valor agregado.");
    } else {
      analysis.push("🚀 Margem muito alta! Certifique-se de que o preço é competitivo.");
    }

    // Análise de concorrentes (se fornecido)
    if (args.competitors && args.competitors.length > 0) {
      const validCompetitors = args.competitors.filter(
        (p) => isFinite(p) && p > 0
      );

      if (validCompetitors.length > 0) {
        const avgCompetitor =
          validCompetitors.reduce((sum, p) => sum + p, 0) /
          validCompetitors.length;
        const minCompetitor = Math.min(...validCompetitors);
        const maxCompetitor = Math.max(...validCompetitors);

        if (safeSuggestedPrice < minCompetitor) {
          analysis.push(
            `💰 Seu preço está abaixo da concorrência (mín: R$ ${minCompetitor.toFixed(2)}). Pode aumentar!`
          );
        } else if (safeSuggestedPrice > maxCompetitor) {
          analysis.push(
            `📊 Seu preço está acima da concorrência (máx: R$ ${maxCompetitor.toFixed(2)}). Certifique-se de ter diferenciais.`
          );
        } else {
          analysis.push(
            `🎯 Seu preço está competitivo (média: R$ ${avgCompetitor.toFixed(2)}).`
          );
        }
      }
    }

    // Análise de categoria (sempre adiciona mensagem, mesmo se categoria não estiver no dicionário)
    const categoryMargins: Record<string, { min: number; ideal: number }> = {
      roupas: { min: 50, ideal: 100 },
      alimentos: { min: 20, ideal: 40 },
      eletrônicos: { min: 15, ideal: 30 },
      cosméticos: { min: 100, ideal: 200 },
      serviços: { min: 50, ideal: 100 },
    };

    if (args.category && args.category.trim()) {
      const catKey = args.category.toLowerCase().trim();
      const catMargin = categoryMargins[catKey];

      if (catMargin) {
        if (targetMargin < catMargin.min) {
          analysis.push(
            `📈 Para ${args.category}, recomenda-se margem mínima de ${catMargin.min}%.`
          );
        } else if (targetMargin >= catMargin.ideal) {
          analysis.push(
            `🌟 Margem ideal para ${args.category}! Continue assim.`
          );
        } else {
          analysis.push(
            `📊 Para ${args.category}, margem atual está dentro do esperado.`
          );
        }
      } else {
        // Categoria não encontrada no dicionário, mas ainda adiciona análise
        analysis.push(
          `📦 Categoria "${args.category}" registrada. Use como referência para futuras análises.`
        );
      }
    } else {
      // Sem categoria, adiciona mensagem genérica
      analysis.push(
        "💼 Dica: Informar a categoria ajuda a calcular margens mais precisas."
      );
    }

    // Análise detalhada de custo, lucro e margem (sempre adiciona)
    const costPriceFormatted = args.costPrice.toFixed(2);
    const targetProfitFormatted = safeTargetProfit.toFixed(2);

    // Calcular margem real sobre a venda (para validação)
    const realMargin = (safeTargetProfit / safeSuggestedPrice) * 100;
    const realMarginFormatted = realMargin.toFixed(2);

    // Cálculos de volume
    const profit100Units = safeTargetProfit * 100;
    const profit1000Units = safeTargetProfit * 1000;

    analysis.push(
      `💰 Custo do Produto: R$ ${costPriceFormatted}`
    );
    analysis.push(
      `💵 Lucro por Unidade: R$ ${targetProfitFormatted}`
    );
    analysis.push(
      `📊 Margem Real sobre Venda: ${realMarginFormatted}%`
    );
    analysis.push(
      `💡 Projeção: 100 unidades = R$ ${profit100Units.toFixed(2)} | 1.000 unidades = R$ ${profit1000Units.toFixed(2)}`
    );

    // Garantir que analysis nunca está vazio
    if (analysis.length === 0) {
      analysis.push("✅ Cálculo realizado com sucesso!");
    }

    // Retornar valores com precisão de 2 casas decimais
    return {
      suggestedPrice: parseFloat(safeSuggestedPrice.toFixed(2)),
      minPrice: parseFloat(safeMinPrice.toFixed(2)),
      maxPrice: parseFloat(safeMaxPrice.toFixed(2)),
      targetProfit: parseFloat(safeTargetProfit.toFixed(2)),
      analysis,
    };
  },
});

// =================================================================
// 🔍 BUSCA GLOBAL
// =================================================================

export const globalSearch = query({
  args: {
    query: v.string(),
    businessId: v.optional(v.id("businesses")),
    types: v.optional(
      v.array(
        v.union(
          v.literal("products"),
          v.literal("sales"),
          v.literal("expenses"),
          v.literal("customers"),
          v.literal("suppliers")
        )
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity)
      return {
        products: [],
        sales: [],
        expenses: [],
        customers: [],
        suppliers: [],
      };

    const searchQuery = args.query.toLowerCase();
    const searchTypes = args.types ?? [
      "products",
      "sales",
      "expenses",
      "customers",
      "suppliers",
    ];

    const results: {
      products: Doc<"products">[];
      sales: Doc<"sales">[];
      expenses: Doc<"expenses">[];
      customers: Doc<"customers">[];
      suppliers: Doc<"suppliers">[];
    } = {
      products: [],
      sales: [],
      expenses: [],
      customers: [],
      suppliers: [],
    };

    if (searchTypes.includes("products")) {
      const products = await ctx.db
        .query("products")
        .withIndex("by_user", (q) => q.eq("userId", identity.subject))
        .collect();

      results.products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery) ||
          p.sku?.toLowerCase().includes(searchQuery) ||
          p.category?.toLowerCase().includes(searchQuery)
      );
    }

    if (searchTypes.includes("sales")) {
      const sales = await ctx.db
        .query("sales")
        .withIndex("by_user", (q) => q.eq("userId", identity.subject))
        .order("desc")
        .take(1000);

      results.sales = sales.filter(
        (s) =>
          s.productName.toLowerCase().includes(searchQuery) ||
          s.invoiceNumber?.toLowerCase().includes(searchQuery) ||
          s.notes?.toLowerCase().includes(searchQuery)
      );
    }

    if (searchTypes.includes("expenses")) {
      const expenses = await ctx.db
        .query("expenses")
        .withIndex("by_user", (q) => q.eq("userId", identity.subject))
        .order("desc")
        .take(1000);

      results.expenses = expenses.filter(
        (e) =>
          e.description.toLowerCase().includes(searchQuery) ||
          e.categoryName.toLowerCase().includes(searchQuery) ||
          e.notes?.toLowerCase().includes(searchQuery)
      );
    }

    if (searchTypes.includes("customers")) {
      const customers = await ctx.db
        .query("customers")
        .withIndex("by_user", (q) => q.eq("userId", identity.subject))
        .collect();

      results.customers = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery) ||
          c.email?.toLowerCase().includes(searchQuery) ||
          c.phone?.toLowerCase().includes(searchQuery)
      );
    }

    if (searchTypes.includes("suppliers")) {
      const suppliers = await ctx.db
        .query("suppliers")
        .withIndex("by_user", (q) => q.eq("userId", identity.subject))
        .collect();

      results.suppliers = suppliers.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery) ||
          s.contact?.email?.toLowerCase().includes(searchQuery) ||
          s.contact?.phone?.toLowerCase().includes(searchQuery)
      );
    }

    return results;
  },
});

// =================================================================
// 📈 ESTATÍSTICAS AVANÇADAS
// =================================================================

export const getAdvancedStats = query({
  args: {
    businessId: v.optional(v.id("businesses")),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const startMonth = args.startDate.substring(0, 7);
    const endMonth = args.endDate.substring(0, 7);

    const reports = await ctx.db
      .query("monthlyReports")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const periodReports = reports.filter(
      (r) => r.month >= startMonth && r.month <= endMonth
    );

    if (periodReports.length === 0) {
      return null;
    }

    const totalRevenue = periodReports.reduce(
      (sum, r) => sum + r.totalRevenue,
      0
    );
    const totalExpenses = periodReports.reduce(
      (sum, r) => sum + r.totalExpenses,
      0
    );
    const totalProfit = periodReports.reduce((sum, r) => sum + r.netProfit, 0);
    const avgMargin =
      periodReports.reduce((sum, r) => sum + r.profitMargin, 0) /
      periodReports.length;

    const firstMonth = periodReports[periodReports.length - 1];
    const lastMonth = periodReports[0];

    const revenueGrowth =
      firstMonth.totalRevenue > 0
        ? ((lastMonth.totalRevenue - firstMonth.totalRevenue) /
            firstMonth.totalRevenue) *
          100
        : 0;

    const profitGrowth =
      firstMonth.netProfit > 0
        ? ((lastMonth.netProfit - firstMonth.netProfit) /
            firstMonth.netProfit) *
          100
        : 0;

    const bestMonth = periodReports.reduce((best, current) =>
      current.netProfit > best.netProfit ? current : best
    );

    const worstMonth = periodReports.reduce((worst, current) =>
      current.netProfit < worst.netProfit ? current : worst
    );

    const allProducts = new Map<
      string,
      { name: string; quantity: number; revenue: number; profit: number }
    >();

    periodReports.forEach((report) => {
      report.topProducts.forEach((product) => {
        const existing = allProducts.get(product.productId) || {
          name: product.productName,
          quantity: 0,
          revenue: 0,
          profit: 0,
        };

        allProducts.set(product.productId, {
          name: product.productName,
          quantity: existing.quantity + product.quantity,
          revenue: existing.revenue + product.revenue,
          profit: existing.profit + product.profit,
        });
      });
    });

    const topProductsOverall = Array.from(allProducts.entries())
      .map(([id, data]) => ({
        productId: id,
        productName: data.name,
        quantity: data.quantity,
        revenue: data.revenue,
        profit: data.profit,
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);

    return {
      period: {
        start: startMonth,
        end: endMonth,
        months: periodReports.length,
      },
      totals: {
        revenue: totalRevenue,
        expenses: totalExpenses,
        profit: totalProfit,
        avgMargin,
      },
      growth: {
        revenue: parseFloat(revenueGrowth.toFixed(2)),
        profit: parseFloat(profitGrowth.toFixed(2)),
      },
      bestMonth: {
        month: bestMonth.month,
        profit: bestMonth.netProfit,
        revenue: bestMonth.totalRevenue,
      },
      worstMonth: {
        month: worstMonth.month,
        profit: worstMonth.netProfit,
        revenue: worstMonth.totalRevenue,
      },
      topProducts: topProductsOverall,
      monthlyData: periodReports.map((r) => ({
        month: r.month,
        revenue: r.totalRevenue,
        expenses: r.totalExpenses,
        profit: r.netProfit,
        margin: r.profitMargin,
      })),
    };
  },
});

// =================================================================
// 🎯 ANÁLISE PREDITIVA (IA)
// =================================================================

export const predictNextMonth = action({
  args: {
    businessId: v.optional(v.id("businesses")),
    currentMonth: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    predictedRevenue: number;
    predictedProfit: number;
    predictedMargin: number;
    confidence: number;
    insights: string[];
    recommendations: string[];
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const reports: Doc<"monthlyReports">[] =
      (await ctx.runQuery(api.profitCalculator.getAllMonths, {
        businessId: args.businessId,
      })) ?? [];

    if (reports.length < 2) {
      return {
        predictedRevenue: 0,
        predictedProfit: 0,
        predictedMargin: 0,
        confidence: 0,
        insights: ["Dados insuficientes para previsão. Registre mais meses."],
        recommendations: [],
      };
    }

    const recent = reports.slice(0, 3);

    const avgRevenue =
      recent.reduce((sum, r) => sum + r.totalRevenue, 0) / recent.length;
    const avgProfit =
      recent.reduce((sum, r) => sum + r.netProfit, 0) / recent.length;
    const avgMargin =
      recent.reduce((sum, r) => sum + r.profitMargin, 0) / recent.length;

    const trend =
      recent.length >= 2
        ? ((recent[0].totalRevenue - recent[recent.length - 1].totalRevenue) /
            recent[recent.length - 1].totalRevenue) *
          100
        : 0;

    const predictedRevenue = avgRevenue * (1 + trend / 100);
    const predictedProfit = avgProfit * (1 + trend / 100);
    const predictedMargin = avgMargin;

    const variance =
      recent.reduce((sum, r) => {
        const diff = r.totalRevenue - avgRevenue;
        return sum + diff * diff;
      }, 0) / recent.length;

    const confidence = Math.max(
      0,
      Math.min(100, 100 - (variance / avgRevenue) * 100)
    );

    const insights: string[] = [];
    const recommendations: string[] = [];

    if (trend > 10) {
      insights.push(
        `📈 Seu negócio está crescendo ${trend.toFixed(1)}% ao mês!`
      );
      recommendations.push("Continue investindo em marketing e aumente estoque.");
    } else if (trend > 0) {
      insights.push(`⚡ Crescimento leve de ${trend.toFixed(1)}% ao mês.`);
      recommendations.push("Identifique o que está funcionando e replique.");
    } else if (trend < -10) {
      insights.push(
        `📉 Queda de ${Math.abs(trend).toFixed(1)}% ao mês. Atenção!`
      );
      recommendations.push("Revise sua estratégia e reduza custos não essenciais.");
    } else {
      insights.push("📊 Receita estável nos últimos meses.");
      recommendations.push("Busque oportunidades de crescimento.");
    }

    if (avgMargin < 20) {
      insights.push(
        "⚠️ Margem de lucro baixa. Pode estar vendendo muito barato."
      );
      recommendations.push("Considere aumentar preços ou reduzir custos.");
    } else if (avgMargin > 50) {
      insights.push("💎 Margem excelente! Produto de alto valor.");
      recommendations.push("Mantenha a qualidade e considere expandir linha.");
    }

    const currentMonthNum = parseInt(args.currentMonth.split("-")[1]);
    if ([11, 12].includes(currentMonthNum)) {
      insights.push(
        "🎄 Período de fim de ano. Histórico mostra aumento de vendas."
      );
      recommendations.push("Aumente estoque e prepare promoções especiais.");
    }


    return {
      predictedRevenue: parseFloat(predictedRevenue.toFixed(2)),
      predictedProfit: parseFloat(predictedProfit.toFixed(2)),
      predictedMargin: parseFloat(predictedMargin.toFixed(2)),
      confidence: parseFloat(confidence.toFixed(2)),
      insights,
      recommendations,
    };
  },
});