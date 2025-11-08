import { action, mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";


// =================================================================
// 🎯 CONFIGURAÇÕES E TIPOS
// =================================================================

const BUSINESS_BENCHMARKS = {
  ecommerce: { avgMargin: 20, goodMargin: 35, excellentMargin: 50 },
  saas: { avgMargin: 75, goodMargin: 85, excellentMargin: 92 },
  freelancer: { avgMargin: 60, goodMargin: 75, excellentMargin: 85 },
  infoproducts: { avgMargin: 85, goodMargin: 92, excellentMargin: 97 },
  services: { avgMargin: 40, goodMargin: 60, excellentMargin: 75 },
  physical_store: { avgMargin: 30, goodMargin: 45, excellentMargin: 60 },
  dropshipping: { avgMargin: 15, goodMargin: 25, excellentMargin: 35 },
  consulting: { avgMargin: 65, goodMargin: 80, excellentMargin: 90 },
  other: { avgMargin: 30, goodMargin: 50, excellentMargin: 70 }
};

interface CalculationInput {
  businessName: string;
  businessType: keyof typeof BUSINESS_BENCHMARKS;
  revenue: {
    monthly: number;
    products?: Array<{
      name: string;
      price: number;
      quantity: number;
      total: number;
    }>;
  };
  fixedCosts: {
    rent?: number;
    salaries?: number;
    software?: number;
    marketing?: number;
    utilities?: number;
    insurance?: number;
    other?: number;
    total: number;
  };
  variableCosts: {
    materials?: number;
    shipping?: number;
    commissions?: number;
    packaging?: number;
    ads?: number;
    fees?: number;
    other?: number;
    total: number;
  };
}

// =================================================================
// 🧠 MOTOR DE ANÁLISE INTELIGENTE
// =================================================================

function calculateResults(data: CalculationInput) {
  const totalRevenue = data.revenue.monthly;
  const totalCosts = data.fixedCosts.total + data.variableCosts.total;
  const grossProfit = totalRevenue - data.variableCosts.total;
  const netProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const breakEvenPoint = data.fixedCosts.total / (1 - (data.variableCosts.total / totalRevenue));
  const roi = data.fixedCosts.total > 0 ? (netProfit / data.fixedCosts.total) * 100 : 0;

  return {
    totalRevenue,
    totalCosts,
    grossProfit,
    netProfit,
    profitMargin,
    breakEvenPoint: isFinite(breakEvenPoint) ? breakEvenPoint : 0,
    roi: isFinite(roi) ? roi : 0
  };
}

function generateAIAnalysis(data: CalculationInput, results: ReturnType<typeof calculateResults>) {
  const benchmark = BUSINESS_BENCHMARKS[data.businessType];
  const insights: string[] = [];
  const warnings: string[] = [];
  const opportunities: string[] = [];
  const recommendations: Array<{
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
    potentialSavings: number;
  }> = [];

  let score = 50;

  if (results.profitMargin >= benchmark.excellentMargin) {
    score += 30;
    insights.push(`🎉 Sua margem de ${results.profitMargin.toFixed(1)}% é EXCEPCIONAL para ${data.businessType}!`);
  } else if (results.profitMargin >= benchmark.goodMargin) {
    score += 20;
    insights.push(`✅ Margem de ${results.profitMargin.toFixed(1)}% está acima da média do setor.`);
  } else if (results.profitMargin >= benchmark.avgMargin) {
    score += 10;
    insights.push(`📊 Margem de ${results.profitMargin.toFixed(1)}% está na média do mercado.`);
  } else if (results.profitMargin > 0) {
    score -= 10;
    warnings.push(`⚠️ Margem de ${results.profitMargin.toFixed(1)}% está abaixo da média (${benchmark.avgMargin}%).`);
  } else {
    score -= 30;
    warnings.push(`🚨 PREJUÍZO! Você está perdendo R$ ${Math.abs(results.netProfit).toFixed(2)}/mês.`);
  }

  const fixedCostRatio = (data.fixedCosts.total / results.totalRevenue) * 100;
  if (fixedCostRatio > 50) {
    warnings.push(`🔴 Custos fixos representam ${fixedCostRatio.toFixed(1)}% da receita (ideal: <40%).`);
    recommendations.push({
      title: "Reduzir Custos Fixos",
      description: "Renegocie contratos, considere trabalho remoto, automatize processos.",
      impact: "high",
      potentialSavings: data.fixedCosts.total * 0.2
    });
    score -= 10;
  } else if (fixedCostRatio > 40) {
    insights.push(`⚡ Custos fixos: ${fixedCostRatio.toFixed(1)}% da receita (atenção).`);
    score += 5;
  } else {
    insights.push(`💚 Custos fixos controlados: ${fixedCostRatio.toFixed(1)}% da receita.`);
    score += 15;
  }

  const variableCostRatio = (data.variableCosts.total / results.totalRevenue) * 100;
  if (variableCostRatio > 60) {
    warnings.push(`🔴 Custos variáveis muito altos: ${variableCostRatio.toFixed(1)}% da receita.`);
    recommendations.push({
      title: "Otimizar Custos Variáveis",
      description: "Negocie com fornecedores, reduza frete, otimize anúncios.",
      impact: "high",
      potentialSavings: data.variableCosts.total * 0.15
    });
    score -= 15;
  } else if (variableCostRatio < 30) {
    insights.push(`💎 Custos variáveis otimizados: ${variableCostRatio.toFixed(1)}%.`);
    score += 10;
  }

  if (results.roi > 100) {
    insights.push(`🚀 ROI de ${results.roi.toFixed(1)}% - investimento muito rentável!`);
    score += 20;
  } else if (results.roi > 50) {
    insights.push(`📈 ROI positivo de ${results.roi.toFixed(1)}%.`);
    score += 10;
  } else if (results.roi < 0) {
    warnings.push(`📉 ROI negativo: você está perdendo dinheiro.`);
    score -= 20;
  }

  if (data.businessType === 'ecommerce' || data.businessType === 'dropshipping') {
    opportunities.push("💡 Considere upsell e cross-sell para aumentar ticket médio.");
    opportunities.push("📦 Negocie frete em volume para reduzir custos de envio.");
    if (data.variableCosts.ads && data.variableCosts.ads > results.totalRevenue * 0.3) {
      recommendations.push({
        title: "Otimizar Investimento em Anúncios",
        description: "Seus gastos com ads estão altos. Foque em orgânico e retenção.",
        impact: "high",
        potentialSavings: data.variableCosts.ads * 0.3
      });
    }
  }

  if (data.businessType === 'saas' || data.businessType === 'infoproducts') {
    opportunities.push("🎯 Implemente preços escalonados para capturar mais valor.");
    opportunities.push("🔄 Foque em reduzir churn e aumentar LTV.");
    if (results.profitMargin < 80) {
      recommendations.push({
        title: "Aumentar Margem (Típica de SaaS)",
        description: "SaaS tem custo marginal baixo. Otimize infraestrutura e automação.",
        impact: "medium",
        potentialSavings: results.totalRevenue * 0.1
      });
    }
  }

  if (data.businessType === 'services' || data.businessType === 'consulting' || data.businessType === 'freelancer') {
    opportunities.push("⏰ Venda seu tempo em pacotes de maior valor.");
    opportunities.push("📚 Crie produtos digitais para escalar sem tempo adicional.");
    recommendations.push({
      title: "Aumentar Precificação",
      description: "Serviços profissionais podem cobrar 20-30% a mais com melhor posicionamento.",
      impact: "high",
      potentialSavings: results.totalRevenue * 0.25
    });
  }

  score = Math.max(0, Math.min(100, score));

  const benchmarkComparison = {
    industry: data.businessType,
    yourMargin: results.profitMargin,
    industryAverage: benchmark.avgMargin,
    status: (results.profitMargin >= benchmark.goodMargin ? "above" :
             results.profitMargin >= benchmark.avgMargin ? "average" :
             "below") as "above" | "average" | "below"
  };

  return {
    score,
    insights,
    warnings,
    opportunities,
    benchmarkComparison,
    recommendations
  };
}

function generateScenarios(data: CalculationInput, baseResults: ReturnType<typeof calculateResults>) {
  const optimistic = {
    revenue: data.revenue.monthly * 1.2,
    costs: (data.fixedCosts.total + data.variableCosts.total) * 0.9,
    get profit() { return this.revenue - this.costs; },
    get margin() { return (this.profit / this.revenue) * 100; }
  };

  const realistic = {
    revenue: data.revenue.monthly,
    profit: baseResults.netProfit,
    margin: baseResults.profitMargin
  };

  const pessimistic = {
    revenue: data.revenue.monthly * 0.8,
    costs: (data.fixedCosts.total + data.variableCosts.total) * 1.1,
    get profit() { return this.revenue - this.costs; },
    get margin() { return this.revenue > 0 ? (this.profit / this.revenue) * 100 : 0; }
  };

  return {
    optimistic: {
      revenue: optimistic.revenue,
      profit: optimistic.profit,
      margin: optimistic.margin
    },
    realistic,
    pessimistic: {
      revenue: pessimistic.revenue,
      profit: pessimistic.profit,
      margin: pessimistic.margin
    }
  };
}

// =================================================================
// 🚀 ACTIONS & MUTATIONS
// =================================================================

export const calculateProfit = action({
  args: {
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
      products: v.optional(v.array(v.object({
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        total: v.number()
      })))
    }),
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
    variableCosts: v.object({
      materials: v.optional(v.number()),
      shipping: v.optional(v.number()),
      commissions: v.optional(v.number()),
      packaging: v.optional(v.number()),
      ads: v.optional(v.number()),
      fees: v.optional(v.number()),
      other: v.optional(v.number()),
      total: v.number()
    })
  },
  handler: async (ctx, args): Promise<{
    id: Id<"profitCalculations">;
    results: ReturnType<typeof calculateResults>;
    aiAnalysis: ReturnType<typeof generateAIAnalysis>;
    scenarios: ReturnType<typeof generateScenarios>;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const userId = identity.subject;

    const results = calculateResults(args);
    const aiAnalysis = generateAIAnalysis(args, results);
    const scenarios = generateScenarios(args, results);

    const calculationId = await ctx.runMutation(internal.profitCalculator.saveCalculation, {
      userId,
      businessName: args.businessName,
      businessType: args.businessType,
      revenue: args.revenue,
      fixedCosts: args.fixedCosts,
      variableCosts: args.variableCosts,
      results,
      aiAnalysis,
      scenarios
    });

    return {
      id: calculationId,
      results,
      aiAnalysis,
      scenarios
    };
  }
});

// ✅ CORREÇÃO: Adicionar internalMutation
export const saveCalculation = internalMutation({
  args: {
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
      products: v.optional(v.array(v.object({
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
        total: v.number()
      })))
    }),
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
    results: v.object({
      totalRevenue: v.number(),
      totalCosts: v.number(),
      grossProfit: v.number(),
      netProfit: v.number(),
      profitMargin: v.number(),
      breakEvenPoint: v.number(),
      roi: v.number()
    }),
    aiAnalysis: v.object({
      score: v.number(),
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
    }),
    scenarios: v.object({
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
    })
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("profitCalculations", {
      userId: args.userId,
      businessName: args.businessName,
      businessType: args.businessType,
      revenue: args.revenue,
      fixedCosts: args.fixedCosts,
      variableCosts: args.variableCosts,
      results: args.results,
      aiAnalysis: args.aiAnalysis,
      scenarios: args.scenarios,
      createdAt: Date.now()
    });
  }
});

export const getCalculations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("profitCalculations")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(50);
  }
});

export const deleteCalculation = mutation({
  args: { id: v.id("profitCalculations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const calc = await ctx.db.get(args.id);
    if (!calc || calc.userId !== identity.subject) {
      throw new Error("Sem permissão");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  }
});

export const toggleFavorite = mutation({
  args: {
    id: v.id("profitCalculations"),
    favorite: v.boolean()
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const calc = await ctx.db.get(args.id);
    if (!calc || calc.userId !== identity.subject) {
      throw new Error("Sem permissão");
    }

    await ctx.db.patch(args.id, {
      favorite: args.favorite,
      updatedAt: Date.now()
    });

    return { success: true };
  }
});