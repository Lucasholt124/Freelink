import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

// =================================================================
// 📦 PRODUTOS
// =================================================================

export const addProduct = mutation({
  args: {
    name: v.string(),
    costPrice: v.number(),
    salePrice: v.number(),
    category: v.optional(v.string()),
    stock: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    return await ctx.db.insert("products", {
      userId: identity.subject,
      name: args.name,
      costPrice: args.costPrice,
      salePrice: args.salePrice,
      category: args.category,
      stock: args.stock,
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
    category: v.optional(v.string()),
    stock: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const product = await ctx.db.get(args.id);
    if (!product || product.userId !== identity.subject) {
      throw new Error("Produto não encontrado");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...updates } = args;
    await ctx.db.patch(args.id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const product = await ctx.db.get(args.id);
    if (!product || product.userId !== identity.subject) {
      throw new Error("Produto não encontrado");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const getProducts = query({
  args: { activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    if (args.activeOnly) {
      return await ctx.db
        .query("products")
        .withIndex("by_user_active", (q) =>
          q.eq("userId", identity.subject).eq("active", true)
        )
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

// =================================================================
// 💰 VENDAS
// =================================================================

export const addSale = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    date: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const product = await ctx.db.get(args.productId);
    if (!product || product.userId !== identity.subject) {
      throw new Error("Produto não encontrado");
    }

    const totalCost = product.costPrice * args.quantity;
    const totalRevenue = product.salePrice * args.quantity;
    const profit = totalRevenue - totalCost;

    const month = args.date.substring(0, 7); // YYYY-MM

    const saleId = await ctx.db.insert("sales", {
      userId: identity.subject,
      productId: args.productId,
      productName: product.name,
      quantity: args.quantity,
      costPrice: product.costPrice,
      salePrice: product.salePrice,
      totalCost,
      totalRevenue,
      profit,
      date: args.date,
      month,
      notes: args.notes,
      createdAt: Date.now(),
    });

    // Atualizar estoque (se existir)
    if (product.stock !== undefined && product.stock !== null) {
      await ctx.db.patch(args.productId, {
        stock: Math.max(0, product.stock - args.quantity),
        updatedAt: Date.now(),
      });
    }

    return { success: true, saleId };
  },
});

export const deleteSale = mutation({
  args: { id: v.id("sales") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const sale = await ctx.db.get(args.id);
    if (!sale || sale.userId !== identity.subject) {
      throw new Error("Venda não encontrada");
    }

    // Restaurar estoque
    const product = await ctx.db.get(sale.productId);
    if (product && product.stock !== undefined) {
      await ctx.db.patch(sale.productId, {
        stock: product.stock + sale.quantity,
        updatedAt: Date.now(),
      });
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const getSalesByMonth = query({
  args: { month: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("sales")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", identity.subject).eq("month", args.month)
      )
      .order("desc")
      .collect();
  },
});

// =================================================================
// 💸 GASTOS
// =================================================================

export const addExpense = mutation({
  args: {
    description: v.string(),
    amount: v.number(),
    category: v.union(
      v.literal("aluguel"),
      v.literal("luz_agua"),
      v.literal("internet"),
      v.literal("transporte"),
      v.literal("alimentacao"),
      v.literal("marketing"),
      v.literal("materiais"),
      v.literal("funcionarios"),
      v.literal("outros")
    ),
    date: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const month = args.date.substring(0, 7);

    return await ctx.db.insert("expenses", {
      userId: identity.subject,
      description: args.description,
      amount: args.amount,
      category: args.category,
      date: args.date,
      month,
      notes: args.notes,
      createdAt: Date.now(),
    });
  },
});

export const deleteExpense = mutation({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const expense = await ctx.db.get(args.id);
    if (!expense || expense.userId !== identity.subject) {
      throw new Error("Gasto não encontrado");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const getExpensesByMonth = query({
  args: { month: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("expenses")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", identity.subject).eq("month", args.month)
      )
      .order("desc")
      .collect();
  },
});

// =================================================================
// 📊 RELATÓRIO MENSAL
// =================================================================

type ExpenseCategory =
  | "aluguel"
  | "luz_agua"
  | "internet"
  | "transporte"
  | "alimentacao"
  | "marketing"
  | "materiais"
  | "funcionarios"
  | "outros";

export const generateMonthlyReport = action({
  args: { month: v.string() },
  handler: async (ctx, args): Promise<{
    month: string;
    totalSales: number;
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    totalExpenses: number;
    expensesByCategory: Record<ExpenseCategory, number>;
    netProfit: number;
    profitMargin: number;
    topProducts: Array<{
      productId: string;
      productName: string;
      quantity: number;
      revenue: number;
      profit: number;
    }>;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    // Buscar vendas
    const sales: Doc<"sales">[] = await ctx.runQuery(api.profitCalculator.getSalesByMonth, {
      month: args.month,
    });

    // Buscar gastos
    const expenses: Doc<"expenses">[] = await ctx.runQuery(api.profitCalculator.getExpensesByMonth, {
      month: args.month,
    });

    // Calcular totais de vendas
    const totalSales = sales.reduce((sum, s) => sum + s.quantity, 0);
    const totalRevenue: number = sales.reduce((sum: number, s: Doc<"sales">) => sum + s.totalRevenue, 0);
    const totalCost: number = sales.reduce((sum: number, s: Doc<"sales">) => sum + s.totalCost, 0);
    const grossProfit: number = totalRevenue - totalCost;

    // Calcular gastos por categoria
    const expensesByCategory: Record<ExpenseCategory, number> = {
      aluguel: 0,
      luz_agua: 0,
      internet: 0,
      transporte: 0,
      alimentacao: 0,
      marketing: 0,
      materiais: 0,
      funcionarios: 0,
      outros: 0,
    };

    expenses.forEach((exp: Doc<"expenses">) => {
      expensesByCategory[exp.category] += exp.amount;
    });

    const totalExpenses: number = Object.values(expensesByCategory).reduce(
      (sum: number, val: number) => sum + val,
      0
    );

    // Lucro líquido
    const netProfit: number = grossProfit - totalExpenses;
    const profitMargin: number = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Produtos mais vendidos
    const productMap = new Map<
      string,
      { name: string; quantity: number; revenue: number; profit: number }
    >();

    sales.forEach((sale: Doc<"sales">) => {
      const key = sale.productId;
      const existing = productMap.get(key) || {
        name: sale.productName,
        quantity: 0,
        revenue: 0,
        profit: 0,
      };

      productMap.set(key, {
        name: sale.productName,
        quantity: existing.quantity + sale.quantity,
        revenue: existing.revenue + sale.totalRevenue,
        profit: existing.profit + sale.profit,
      });
    });

    const topProducts = Array.from(productMap.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        quantity: data.quantity,
        revenue: data.revenue,
        profit: data.profit,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Salvar relatório
    const existing = await ctx.runQuery(api.profitCalculator.getMonthlyReport, {
      month: args.month,
    });

    if (existing) {
      await ctx.runMutation(api.profitCalculator.updateMonthlyReport, {
        id: existing._id,
        totalSales,
        totalRevenue,
        totalCost,
        grossProfit,
        totalExpenses,
        expensesByCategory,
        netProfit,
        profitMargin,
        topProducts,
      });
    } else {
      await ctx.runMutation(api.profitCalculator.createMonthlyReport, {
        month: args.month,
        totalSales,
        totalRevenue,
        totalCost,
        grossProfit,
        totalExpenses,
        expensesByCategory,
        netProfit,
        profitMargin,
        topProducts,
      });
    }

    return {
      month: args.month,
      totalSales,
      totalRevenue,
      totalCost,
      grossProfit,
      totalExpenses,
      expensesByCategory,
      netProfit,
      profitMargin,
      topProducts,
    };
  },
});

export const getMonthlyReport = query({
  args: { month: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("monthlyReports")
      .withIndex("by_user_month", (q) =>
        q.eq("userId", identity.subject).eq("month", args.month)
      )
      .first();
  },
});

export const createMonthlyReport = mutation({
  args: {
    month: v.string(),
    totalSales: v.number(),
    totalRevenue: v.number(),
    totalCost: v.number(),
    grossProfit: v.number(),
    totalExpenses: v.number(),
    expensesByCategory: v.object({
      aluguel: v.number(),
      luz_agua: v.number(),
      internet: v.number(),
      transporte: v.number(),
      alimentacao: v.number(),
      marketing: v.number(),
      materiais: v.number(),
      funcionarios: v.number(),
      outros: v.number(),
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

    return await ctx.db.insert("monthlyReports", {
      userId: identity.subject,
      month: args.month,
      totalSales: args.totalSales,
      totalRevenue: args.totalRevenue,
      totalCost: args.totalCost,
      grossProfit: args.grossProfit,
      totalExpenses: args.totalExpenses,
      expensesByCategory: args.expensesByCategory,
      netProfit: args.netProfit,
      profitMargin: args.profitMargin,
      topProducts: args.topProducts,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateMonthlyReport = mutation({
  args: {
    id: v.id("monthlyReports"),
    totalSales: v.number(),
    totalRevenue: v.number(),
    totalCost: v.number(),
    grossProfit: v.number(),
    totalExpenses: v.number(),
    expensesByCategory: v.object({
      aluguel: v.number(),
      luz_agua: v.number(),
      internet: v.number(),
      transporte: v.number(),
      alimentacao: v.number(),
      marketing: v.number(),
      materiais: v.number(),
      funcionarios: v.number(),
      outros: v.number(),
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...updates } = args;
    await ctx.db.patch(args.id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const getAllMonths = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const reports = await ctx.db
      .query("monthlyReports")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    return reports.map((r) => ({
      month: r.month,
      netProfit: r.netProfit,
      totalRevenue: r.totalRevenue,
      profitMargin: r.profitMargin,
    }));
  },
});