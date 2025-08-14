import { action, internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import OpenAI from "openai";
import { Completions } from "openai/resources/chat";

const groq = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" });

function extractJson(text: string): unknown {
  const match = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (!match || !match[1]) {
    try { return JSON.parse(text); } catch  { throw new Error("Não foi possível encontrar um bloco JSON na resposta da IA e o texto não é um JSON válido."); }
  }
  try { return JSON.parse(match[1]); } catch (e) { console.error("Erro ao parsear o JSON extraído:", e, "JSON Bruto:", match[1]); throw new Error("A IA retornou um JSON com sintaxe inválida."); }
}

async function callGroqWithFallback(prompt: string, model: string, fallbackModel: string): Promise<Completions.ChatCompletion> {
  try {
    return await groq.chat.completions.create({ model, messages: [{ role: "system", content: "Você é um assistente prestativo. Coloque sua resposta JSON dentro de um bloco de código markdown ```json ... ```" }, { role: "user", content: prompt }] });
  } catch (error: unknown) {
    let errorMessage = "Erro desconhecido";
    if (error instanceof Error) errorMessage = error.message;
    if (errorMessage.includes("503")) {
      console.warn(`Modelo ${model} indisponível, tentando fallback com ${fallbackModel}`);
      return await groq.chat.completions.create({ model: fallbackModel, messages: [{ role: "system", content: "Você é um assistente prestativo. Coloque sua resposta JSON dentro de um bloco de código markdown ```json ... ```" }, { role: "user", content: prompt }] });
    }
    throw error;
  }
}

export const generateAnalysis = action({
  args: { username: v.string(), bio: v.optional(v.string()), offer: v.string(), audience: v.string(), planDuration: v.union(v.literal("week"), v.literal("month")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado.");
    const userData = { username: args.username, bio: args.bio || "", offer: args.offer, audience: args.audience, planDuration: args.planDuration };
    const primaryModel = "llama3-70b-8192";
    const fallbackModel = "llama3-8b-8192";

    const promptForStrategy = `Você é 'Athena', uma estrategista de conteúdo. Gere a estratégia, bios e grid para: @${args.username}, que oferece '${args.offer}' para '${args.audience}'. 🚨 INSTRUÇÕES CRÍTICAS: Sua resposta DEVE conter um único bloco de código JSON. Para 'suggestions', ESCREVA 3 bios completas. Para 'strategy' e 'grid', seja detalhado. Formato: \`\`\`json { "suggestions": ["..."], "strategy": "...", "grid": ["..."] } \`\`\``;
    const promptForContentPlan = `Você é 'Athena', uma diretora de criação. Crie um plano de conteúdo de ${args.planDuration === "week" ? "7" : "30"} dias para @${args.username}. 🚨 INSTRUÇÕES CRÍTICAS: Responda com um único bloco de código JSON com a chave 'content_plan' contendo EXATAMENTE ${args.planDuration === "week" ? "7" : "30"} itens. CADA ITEM DEVE TER TODOS OS CAMPOS A SEGUIR, sem aninhar em um objeto 'details'. Formato de cada item: { "day": "...", "time": "...", "format": "...", "title": "...", "content_idea": "...", "status": "planejado", "tool_suggestion": "...", "step_by_step": "...", "script_or_copy": "...", "hashtags": ["..."], "creative_guidance": { "type": "image", "description": "...", "prompt": "...", "tool_link": "..." } }`;

    try {
      console.log("Gerando estratégia...");
      const strategyResponse = await callGroqWithFallback(promptForStrategy, primaryModel, fallbackModel);
      const strategyText = strategyResponse.choices[0]!.message!.content!;
      const strategyResult = extractJson(strategyText);
      if (typeof strategyResult !== 'object' || strategyResult === null || !('suggestions' in strategyResult)) { throw new Error("Resposta de estratégia da IA está em um formato inválido."); }

      console.log("Gerando plano de conteúdo...");
      const contentPlanResponse = await callGroqWithFallback(promptForContentPlan, primaryModel, fallbackModel);
      const contentPlanText = contentPlanResponse.choices[0]!.message!.content!;
      const contentPlanResult = extractJson(contentPlanText);
      if (typeof contentPlanResult !== 'object' || contentPlanResult === null || !('content_plan' in contentPlanResult)) { throw new Error("Resposta do plano de conteúdo da IA está em um formato inválido."); }

      const finalAnalysisData = { ...(strategyResult as object), ...(contentPlanResult as object) };

      await ctx.runMutation(internal.mentor.saveAnalysis, { analysisData: { ...finalAnalysisData, ...userData } });
      return { ...finalAnalysisData, ...userData };
    } catch (error: unknown) {
      console.error("Erro final no processo de geração:", error);
      if (error instanceof Error) throw error;
      throw new Error("Ocorreu um erro inesperado no processo de geração.");
    }
  },
});

export const saveAnalysis = internalMutation({
    args: { analysisData: v.any() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Não autenticado.");
        const existingAnalysis = await ctx.db.query("analyses").withIndex("by_user", q => q.eq("userId", identity.subject)).first();
        const dataToSave = { ...args.analysisData, userId: identity.subject, updatedAt: Date.now() };
        if (existingAnalysis) { await ctx.db.patch(existingAnalysis._id, dataToSave); return existingAnalysis._id; }
        else { return await ctx.db.insert("analyses", { ...dataToSave, createdAt: Date.now() }); }
    }
});

export const getSavedAnalysis = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;
        return await ctx.db.query("analyses").withIndex("by_user", q => q.eq("userId", identity.subject)).order("desc").first();
    }
});

export const updateContentPlan = mutation({
    args: {
        analysisId: v.id("analyses"),
        newPlan: v.array(v.object({
            day: v.string(), time: v.string(), format: v.string(), title: v.string(), content_idea: v.string(), status: v.union(v.literal("planejado"), v.literal("concluido")),
            tool_suggestion: v.string(), step_by_step: v.string(), script_or_copy: v.string(), hashtags: v.array(v.string()),
            creative_guidance: v.object({ type: v.string(), description: v.string(), prompt: v.string(), tool_link: v.string() }),
        }))
    },
    handler: async (ctx, { analysisId, newPlan }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Não autenticado.");
        const analysis = await ctx.db.get(analysisId);
        if (!analysis || analysis.userId !== identity.subject) throw new Error("Análise não encontrada.");
        await ctx.db.patch(analysisId, { content_plan: newPlan, updatedAt: Date.now() });
    }
});