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
};

type RawAnalysisData = {
  suggestions?: Array<string | { bio?: string }>;
  strategy?: string;
  grid?: string[];
  content_plan?: RawPlanItem[];
};

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
      Você é Athena, estrategista de conteúdo de marketing digital.
      Gere plano para ${args.planDuration === "week" ? "7" : "30"} dias.
      Inclua horários de pico para postagens, passo a passo detalhado para criação de conteúdo,
      instruções para Canva ou CapCut, textos e ideias visuais.

      Dados:
      - Username: "@${args.username}"
      - Bio: "${args.bio || "Não informada."}"
      - Oferta: "${args.offer}"
      - Público: "${args.audience}"

      Retorne APENAS um JSON:
      - suggestions: 3 bios otimizadas
      - strategy: análise detalhada
      - grid: 9 ideias curtas para o feed
      - content_plan: ${args.planDuration === "week" ? 7 : 30} itens com { day, time, format, title, content_idea, status }
    `;

    const response = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Responda apenas em JSON." },
        { role: "user", content: prompt },
      ],
    });

    const resultText = response.choices[0]?.message?.content;
    if (!resultText) throw new Error("IA não retornou resultado.");

    const rawData: RawAnalysisData = JSON.parse(resultText);

    const normalizedPlan = (rawData.content_plan || []).map<{
      day: string;
      time: string;
      format: string;
      title: string;
      content_idea: string;
      status: string;
    }>((item, idx) => ({
      day: String(item.day ?? idx + 1),
      time: String(item.time ?? "09:00"),
      format: String(item.format ?? "Story"),
      title: String(item.title ?? `Post ${idx + 1}`),
      content_idea: String(item.content_idea ?? ""),
      status: String(item.status ?? "planejado"),
    }));

    const normalizedSuggestions: string[] = (rawData.suggestions || []).map((s) =>
      typeof s === "string" ? s : s.bio ?? ""
    );

    const analysisDataToSave = {
      userId: identity.subject,
      content_plan: normalizedPlan,
      grid: rawData.grid ?? [],
      strategy: rawData.strategy ?? "",
      suggestions: normalizedSuggestions,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await ctx.runMutation(internal.mentor.saveAnalysis, { analysisData: analysisDataToSave });

    return analysisDataToSave;
  },
});

// Salva análise no Convex
export const saveAnalysis = internalMutation({
  args: {
    analysisData: v.object({
      userId: v.string(),
      content_plan: v.array(v.object({
        content_idea: v.string(),
        day: v.string(),
        format: v.string(),
        status: v.string(),
        time: v.string(),
        title: v.string(),
      })),
      grid: v.array(v.string()),
      strategy: v.string(),
      suggestions: v.array(v.string()),
      createdAt: v.float64(),
      updatedAt: v.float64(),
    })
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
