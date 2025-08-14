// Em /convex/mentor.ts
// (Substitua o arquivo inteiro por esta versão final e correta para Gemini)

import { action, internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
// <<< NOVA BIBLIOTECA DA GOOGLE >>>
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// <<< NOVA CONFIGURAÇÃO PARA O GEMINI >>>
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// <<< NOVA FUNÇÃO HELPER PARA CHAMADAS AO GEMINI (COM A SINTAXE CORRETA) >>>
async function callGemini(prompt: string, modelName: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: modelName,
    // Configurações de segurança para permitir uma ampla gama de conteúdo
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ],
  });

  // A CORREÇÃO ESTÁ AQUI: O prompt e a configuração de geração são passados
  // dentro de um único objeto de requisição.
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  return result.response.text();
}

// --- ACTION para GERAR uma nova análise (AGORA COM GEMINI CORRETO) ---
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

    const primaryModel = "gemini-1.5-pro-latest"; // O mais poderoso

    const promptForStrategy = `Você é "Athena", uma estrategista de conteúdo. Sua tarefa é gerar a estratégia, sugestões de bio e ideias para o grid para o cliente abaixo. - Cliente: @${args.username} - Oferece: ${args.offer} - Público: ${args.audience} 🚨 INSTRUÇÕES CRÍTICAS: - Sua resposta DEVE ser um objeto JSON. - Para 'suggestions', ESCREVA 3 bios completas e prontas para usar. - Para 'strategy' e 'grid', seja detalhado. Formato de saída JSON: { "suggestions": ["..."], "strategy": "...", "grid": ["..."] }`;
    const promptForContentPlan = `Você é 'Athena', uma diretora de criação. Sua tarefa é criar um plano de conteúdo tático para o cliente abaixo. - Cliente: @${args.username} - Duração: ${args.planDuration === "week" ? "7 dias" : "30 dias"} 🚨 INSTRUÇÕES CRÍTICAS: - Sua resposta DEVE ser um objeto JSON contendo APENAS a chave "content_plan". - A chave "content_plan" DEVE conter EXATAMENTE ${args.planDuration === "week" ? "7" : "30"} itens. Cada item DEVE ter todos os campos: tool_suggestion, step_by_step, script_or_copy, hashtags (como array), etc. Formato JSON de cada item: { "day": "...", "time": "...", "format": "...", "title": "...", "content_idea": "...", "status": "planejado", "tool_suggestion": "...", "step_by_step": "...", "script_or_copy": "...", "hashtags": ["..."], "creative_guidance": { "type": "image", ... } }`;

    try {
      console.log(`Gerando estratégia com ${primaryModel}...`);
      const strategyText = await callGemini(promptForStrategy, primaryModel);
      const strategyResult = JSON.parse(strategyText);

      console.log(`Gerando plano de conteúdo com ${primaryModel}...`);
      const contentPlanText = await callGemini(promptForContentPlan, primaryModel);
      const contentPlanResult = JSON.parse(contentPlanText);

      const finalAnalysisData = { ...strategyResult, ...contentPlanResult };

      await ctx.runMutation(internal.mentor.saveAnalysis, {
        analysisData: { ...finalAnalysisData, ...userData }
      });

      return { ...finalAnalysisData, ...userData };

    } catch (error: unknown) {
      console.error("Erro no processo de geração com Gemini:", error);
      if (error instanceof Error) {
        throw new Error(`A IA falhou em gerar uma resposta válida. Detalhes: ${error.message}`);
      }
      throw new Error("A IA falhou em gerar uma resposta válida. Por favor, tente novamente.");
    }
  },
});

// --- DEMAIS FUNÇÕES (sem alterações) ---
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