// Em /convex/mentor.ts
// (Substitua o arquivo inteiro por esta versão final, definitiva e correta)

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
    safetySettings: [
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

// --- ACTION para GERAR uma nova análise (COM CHAMADA ÚNICA E OTIMIZADA) ---
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

    // <<< PROMPT ÚNICO E BLINDADO QUE RESPEITA O SEU SCHEMA 'details' >>>
    const combinedPrompt = `
      Você é "Athena", uma estrategista de IA. Sua única tarefa é gerar um objeto JSON completo e perfeitamente formatado.

      Dados do Cliente:
      - Username: "@${args.username}"
      - Bio Atual: "${args.bio || 'Não informada.'}"
      - Oferece: "${args.offer}"
      - Público-Alvo: "${args.audience}"
      - Duração: ${args.planDuration === "week" ? "7 dias" : "30 dias"}

      🚨 INSTRUÇÕES CRÍTICAS E OBRIGATÓRIAS:
      1.  **JSON COMPLETO:** A resposta DEVE ser um único objeto JSON válido, contendo TODAS as chaves: 'suggestions', 'strategy', 'grid', e 'content_plan'.
      2.  **PLANO DE CONTEÚDO COMPLETO:** A chave 'content_plan' DEVE OBRIGATORIAMENTE conter exatamente ${args.planDuration === "week" ? "7" : "30"} itens.
      3.  **BIOS COMPLETAS:** Em 'suggestions', analise a bio atual e ESCREVA 3 bios completas e prontas para usar. NÃO dê dicas genéricas.
      4.  **ESTRUTURA 'details':** Dentro de cada item do 'content_plan', DEVE haver um objeto aninhado chamado 'details'. Este objeto 'details' DEVE conter os campos: tool_suggestion, step_by_step, script_or_copy, hashtags (como UMA ÚNICA string), e creative_guidance.
      5.  **QUALIDADE MÁXIMA:** Preencha todos os campos com conteúdo detalhado e acionável. Use horários de pico reais do Instagram (ex: 12:05, 18:35).

      Formato de Saída Exemplo:
      {
        "suggestions": ["Bio completa 1...", "Bio completa 2...", "Bio completa 3..."],
        "strategy": "### Pilares de Conteúdo...",
        "grid": ["Reels: Ideia...", "Carrossel: Ideia..."],
        "content_plan": [
          {
            "day": "Dia 1", "time": "18:35", "format": "Carrossel", "title": "...", "content_idea": "...", "status": "planejado",
            "details": {
              "tool_suggestion": "Canva, Adobe Express",
              "step_by_step": "1. Abra o Adobe Express e procure por 'Carrossel de Marketing'. 2. No slide 1...",
              "script_or_copy": "Legenda completa e persuasiva...",
              "hashtags": "#exemplo1 #exemplo2 #exemplo3",
              "creative_guidance": { "type": "image", "description": "...", "prompt": "...", "tool_link": "..." }
            }
          }
        ]
      }
    `;

    try {
      console.log(`Gerando análise completa com ${modelToUse}...`);
      const analysisText = await callGemini(combinedPrompt, modelToUse);
      const analysisResult = JSON.parse(analysisText);

      await ctx.runMutation(internal.mentor.saveAnalysis, {
        analysisData: { ...analysisResult, ...userData }
      });

      return { ...(analysisResult as object), ...userData };

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