import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import OpenAI from "openai";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// ACTION — Gera e salva análise
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
      Você é "Athena", a estrategista de conteúdo mais brilhante do mundo para criadores brasileiros no Instagram.
      Gere plano para ${args.planDuration === "week" ? "7" : "30"} dias, ultra detalhado.

      Dados:
      - Username: "@${args.username}"
      - Bio: "${args.bio || "Não informada."}"
      - Oferta: "${args.offer}"
      - Público: "${args.audience}"

      Responda APENAS com um objeto JSON com:
      - suggestions: array de 3 bios otimizadas
      - strategy: string com análise e plano estratégico
      - grid: array de 9 ideias curtas
      - content_plan: array de ${args.planDuration === "week" ? 7 : 30} objetos { day, time, format, title, content_idea, status }
    `;

    const response = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Responda somente no JSON solicitado." },
        { role: "user", content: prompt },
      ],
    });

    const resultText = response.choices[0]?.message?.content;
    if (!resultText) throw new Error("A IA não retornou um resultado.");

    const analysisData = JSON.parse(resultText);

    await ctx.runMutation(internal.mentor.saveAnalysis, {
      analysisData: {
        ...analysisData,
        username: args.username,
        bio: args.bio || "",
        offer: args.offer,
        audience: args.audience,
        planDuration: args.planDuration,
      },
    });

    return analysisData;
  },
});

// MUTATION — Salva/atualiza
export const saveAnalysis = internalMutation({
  args: { analysisData: v.any() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado.");

    const existing = await ctx.db
      .query("analyses")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args.analysisData,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("analyses", {
        userId: identity.subject,
        ...args.analysisData,
        createdAt: Date.now(),
      });
    }
  },
});

// QUERY — Busca a última análise
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
