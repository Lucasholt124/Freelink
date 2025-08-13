import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import OpenAI from "openai";

// Configuração do OpenAI/Groq
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// Tipos
type RawPlanItem = {
  day?: string | number;
  time?: string;
  format?: string;
  title?: string;
  content_idea?: string;
  status?: string;
  details?: string | { passo_a_passo?: string };
};

type RawAnalysisData = {
  suggestions?: Array<string | { bio?: string }>;
  strategy?: string | object;
  grid?: Array<string | object>;
  content_plan?: RawPlanItem[];
};

// Utilitário para limpar a resposta e garantir que seja JSON válido
function extractJson(text: string): string {
  const match = text.match(/\{[\s\S]*\}$/); // pega de "{" até o último "}"
  if (!match) throw new Error("Resposta não contém JSON válido.");
  return match[0].trim();
}

// Gera análise completa
export const generateAnalysis = action({
  args: {
    username: v.string(),
    bio: v.optional(v.string()),
    offer: v.string(),
    audience: v.string(),
    planDuration: v.union(v.literal("week"), v.literal("month")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado.");

    const prompt = `
Você é Athena, estrategista de conteúdo digital.
Gere plano para ${args.planDuration === "week" ? "7" : "30"} dias.
Inclua horários de pico, passo a passo detalhado, instruções para Canva/CapCut, textos e ideias visuais.

⚠️ IMPORTANTE:
- Responda APENAS com JSON válido, sem explicações fora do JSON.
- Use o seguinte formato:

{
  "suggestions": ["bio 1", "bio 2", "bio 3"],
  "strategy": { "objective": "...", "target_audience": "...", "analysis": { "strengths": [], "weaknesses": [], "opportunities": [], "threats": [] } },
  "grid": ["ideia 1", "ideia 2", "..."],
  "content_plan": [
    {
      "day": "YYYY-MM-DD",
      "time": "HH:MM",
      "format": "Story" | "Reels" | "Post",
      "title": "Título",
      "content_idea": "Ideia",
      "status": "planejado" | "concluido",
      "details": { "passo_a_passo": "..." }
    }
  ]
}
`;

    const response = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Responda apenas em JSON válido." },
        { role: "user", content: prompt },
      ],
    });

    const resultText = response.choices[0]?.message?.content;
    if (!resultText) throw new Error("IA não retornou resultado.");

    let rawData: RawAnalysisData = {};
    try {
      const cleanJson = extractJson(resultText);
      rawData = JSON.parse(cleanJson);
    } catch {
      throw new Error(`Erro ao parsear JSON da IA: ${resultText}`);
    }

    // Normaliza o plano com datas reais
    const today = new Date();
    const normalizedPlan = (rawData.content_plan || []).map((item, idx) => {
      const planDate = new Date(today);
      planDate.setDate(today.getDate() + idx);

      const statusLiteral: "planejado" | "concluido" =
        item.status === "concluido" ? "concluido" : "planejado";

      let detailsObj: { passo_a_passo: string } | undefined;

      if (item.details) {
        if (typeof item.details === "string") {
          detailsObj = { passo_a_passo: item.details };
        } else if ("passo_a_passo" in item.details && typeof item.details.passo_a_passo === "string") {
          detailsObj = { passo_a_passo: item.details.passo_a_passo };
        }
      }

      return {
        day: planDate.toISOString().split("T")[0],
        time: String(item.time ?? "09:00"),
        format: String(item.format ?? "Story"),
        title: String(item.title ?? `Post ${idx + 1}`),
        content_idea: String(item.content_idea ?? ""),
        status: statusLiteral,
        ...(detailsObj ? { details: detailsObj } : {}),
      };
    });

    const normalizedSuggestions: string[] = (rawData.suggestions || []).map((s) =>
      typeof s === "string" ? s : s.bio ?? ""
    );

    const normalizedGrid: string[] = (rawData.grid || []).map((g) =>
      typeof g === "string" ? g : JSON.stringify(g)
    );

    const normalizedStrategy =
      typeof rawData.strategy === "string"
        ? rawData.strategy
        : JSON.stringify(rawData.strategy, null, 2);

    const analysisDataToSave = {
      userId: identity.subject,
      content_plan: normalizedPlan,
      grid: normalizedGrid,
      strategy: normalizedStrategy,
      suggestions: normalizedSuggestions,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await ctx.runMutation(internal.mentor.saveAnalysis, {
      analysisData: analysisDataToSave,
    });

    return analysisDataToSave;
  },
});

// Salva análise no Convex
export const saveAnalysis = internalMutation({
  args: {
    analysisData: v.object({
      userId: v.string(),
      content_plan: v.array(
        v.object({
          content_idea: v.string(),
          day: v.string(),
          format: v.string(),
          status: v.union(v.literal("planejado"), v.literal("concluido")),
          time: v.string(),
          title: v.string(),
          details: v.optional(
            v.object({
              passo_a_passo: v.string(),
            })
          ),
        })
      ),
      grid: v.array(v.string()),
      strategy: v.string(),
      suggestions: v.array(v.string()),
      createdAt: v.float64(),
      updatedAt: v.float64(),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("analyses")
      .withIndex("by_user", (q) => q.eq("userId", args.analysisData.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args.analysisData,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("analyses", args.analysisData);
    }
  },
});

// Busca última análise
export const getSavedAnalysis = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("analyses")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();
  },
});
