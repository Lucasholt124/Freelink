// Em /convex/mentor.ts
// (Substitua o arquivo inteiro por esta versão final para o seu schema com Gemini)

import { action, internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Configuração do Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Função Helper para chamar o Gemini
async function callGemini(prompt: string, modelName: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: modelName,
    safetySettings: [ // Configurações de segurança
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ],
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  return result.response.text();
}

// --- ACTION para GERAR uma nova análise ---
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

    const userData = {
      username: args.username,
      bio: args.bio || "",
      offer: args.offer,
      audience: args.audience,
      planDuration: args.planDuration,
    };

    const modelToUse = "gemini-1.5-flash-latest";

    // <<< PROMPTS ATUALIZADOS PARA FORÇAR A ESTRUTURA 'details' >>>
    const promptForStrategy = `Você é "Athena". Gere a estratégia, 3 bios completas e o grid para @${args.username}. Responda APENAS com um objeto JSON. Formato: { "suggestions": ["..."], "strategy": "...", "grid": ["..."] }`;

    const promptForContentPlan = `
      Você é "Athena". Crie um plano de conteúdo de ${args.planDuration === "week" ? "7" : "30"} dias para @${args.username}.
      🚨 INSTRUÇÕES CRÍTICAS:
      1.  Responda APENAS com um objeto JSON com a chave 'content_plan'.
      2.  'content_plan' DEVE ter EXATAMENTE ${args.planDuration === "week" ? "7" : "30"} itens.
      3.  CADA item DEVE ter um objeto aninhado chamado 'details'.
      4.  O objeto 'details' DEVE conter os campos: tool_suggestion, step_by_step, script_or_copy, hashtags (como UMA ÚNICA string), e creative_guidance.

      Formato de Saída Exemplo para cada item:
      {
        "day": "Dia 1", "time": "19:00", "format": "Carrossel", "title": "...", "content_idea": "...", "status": "planejado",
        "details": {
          "tool_suggestion": "Canva",
          "step_by_step": "1. Crie...",
          "script_or_copy": "Legenda...",
          "hashtags": "#exemplo1 #exemplo2 #exemplo3",
          "creative_guidance": { "type": "image", "description": "...", "prompt": "...", "tool_link": "..." }
        }
      }
    `;

    try {
      console.log(`Gerando estratégia com ${modelToUse}...`);
      const strategyText = await callGemini(promptForStrategy, modelToUse);
      const strategyResult = JSON.parse(strategyText);

      console.log(`Gerando plano de conteúdo com ${modelToUse}...`);
      const contentPlanText = await callGemini(promptForContentPlan, modelToUse);
      const contentPlanResult = JSON.parse(contentPlanText);

      const finalAnalysisData = { ...strategyResult, ...contentPlanResult };

      await ctx.runMutation(internal.mentor.saveAnalysis, {
        analysisData: { ...finalAnalysisData, ...userData }
      });

      return { ...(finalAnalysisData as object), ...userData };

    } catch (error: unknown) {
      console.error("Erro no processo de geração com Gemini:", error);
      if (error instanceof Error) { throw new Error(`A IA falhou. Detalhes: ${error.message}`); }
      throw new Error("A IA falhou em gerar uma resposta válida. Tente novamente.");
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
            details: v.optional(v.object({
                tool_suggestion: v.string(), step_by_step: v.string(), script_or_copy: v.string(), hashtags: v.string(),
                creative_guidance: v.object({ type: v.string(), description: v.string(), prompt: v.string(), tool_link: v.string() }),
            })),
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