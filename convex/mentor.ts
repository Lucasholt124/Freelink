// Em /convex/mentor.ts
// (Substitua o arquivo inteiro por esta versão com a arquitetura "Dividir para Conquistar")

import { action, internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import OpenAI from "openai";
import { Completions } from "openai/resources/chat";

// Configuração do Groq
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// <<< FUNÇÃO HELPER PARA CHAMADAS À IA COM FALLBACK >>>
async function callGroqWithFallback(prompt: string, model: string, fallbackModel: string): Promise<Completions.ChatCompletion> {
  try {
    return await groq.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Você é um assistente que responde apenas com o objeto JSON solicitado, sem exceções." },
        { role: "user", content: prompt },
      ],
    });
  } catch (error: unknown) {
    let errorMessage = "Erro desconhecido";
    if (error instanceof Error) errorMessage = error.message;

    if (errorMessage.includes("503")) {
      console.warn(`Modelo ${model} indisponível, tentando fallback com ${fallbackModel}`);
      return await groq.chat.completions.create({
        model: fallbackModel,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Você é um assistente que responde apenas com o objeto JSON solicitado, sem exceções." },
          { role: "user", content: prompt },
        ],
      });
    }
    // Para outros erros (como 400), jogue o erro para ser tratado pela função principal.
    throw error;
  }
}

// --- ACTION para GERAR uma nova análise (COM ESTRATÉGIA "DIVIDIR PARA CONQUISTAR") ---
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

    const primaryModel = "llama3-70b-8192";
    const fallbackModel = "mixtral-8x7b-32768";

    // <<< PASSO 1: PROMPT PARA GERAR A ESTRATÉGIA (JSON PEQUENO) >>>
    const promptForStrategy = `
      Você é "Athena", uma estrategista de conteúdo. Sua tarefa é gerar a estratégia, sugestões de bio e ideias para o grid para o cliente abaixo.
      - Cliente: @${args.username}
      - Oferece: ${args.offer}
      - Público: ${args.audience}

      🚨 INSTRUÇÕES CRÍTICAS:
      - Sua resposta DEVE ser um objeto JSON.
      - Para 'suggestions', ESCREVA 3 bios completas e prontas para usar.
      - Para 'strategy' e 'grid', seja detalhado.

      Formato de saída JSON:
      {
        "suggestions": ["✨ Ajudo [público-alvo] a alcançar [resultado]... | Baixe seu e-book! 👇", "Transformando [dor] em [solução]... | Clique no link!", "🚀 [Sua Profissão] | Apaixonado por [nicho]... | Vamos juntos?"],
        "strategy": "### Análise Estratégica Rápida\\n**Forças:** Análise detalhada...\\n**Fraquezas:** Análise detalhada...\\n...",
        "grid": ["Reels: Ideia detalhada sobre a dor do público...", "Carrossel: Ideia detalhada de tutorial...", "Foto: Ideia detalhada de frase de impacto..."]
      }
    `;

    // <<< PASSO 2: PROMPT PARA GERAR O PLANO DE CONTEÚDO (JSON MAIOR, MAS FOCADO) >>>
    const promptForContentPlan = `
      Você é "Athena", uma diretora de criação. Sua tarefa é criar um plano de conteúdo tático para o cliente abaixo.
      - Cliente: @${args.username}
      - Oferece: ${args.offer}
      - Público: ${args.audience}
      - Duração: ${args.planDuration === "week" ? "7 dias" : "30 dias"}

      🚨 INSTRUÇÕES CRÍTICAS:
      - Sua resposta DEVE ser um objeto JSON contendo APENAS a chave "content_plan".
      - A chave "content_plan" DEVE conter EXATAMENTE ${args.planDuration === "week" ? "7" : "30"} itens. Verifique sua resposta.
      - Cada item DEVE ter todos os detalhes: tool_suggestion, step_by_step, script_or_copy, hashtags, e creative_guidance.

      Formato de saída JSON:
      {
        "content_plan": [
          { "day": "Dia 1", "time": "19:00", "format": "Carrossel", "title": "...", "content_idea": "...", "status": "planejado", "details": { "tool_suggestion": "...", "step_by_step": "...", "script_or_copy": "...", "hashtags": "...", "creative_guidance": { "type": "image", "description": "...", "prompt": "...", "tool_link": "..." } } },
          { "day": "Dia 2", "time": "18:30", "format": "Reels", "title": "...", "content_idea": "...", "status": "planejado", "details": { "tool_suggestion": "...", "step_by_step": "...", "script_or_copy": "...", "hashtags": "...", "creative_guidance": { "type": "video", "description": "...", "prompt": "...", "tool_link": "..." } } }
        ]
      }
    `;

    try {
      console.log("Gerando estratégia...");
      const strategyResponse = await callGroqWithFallback(promptForStrategy, primaryModel, fallbackModel);
      const strategyResult = JSON.parse(strategyResponse.choices[0]!.message!.content!);

      console.log("Gerando plano de conteúdo...");
      const contentPlanResponse = await callGroqWithFallback(promptForContentPlan, primaryModel, fallbackModel);
      const contentPlanResult = JSON.parse(contentPlanResponse.choices[0]!.message!.content!);

      // <<< PASSO 3: COMBINAR OS RESULTADOS >>>
      const finalAnalysisData = {
        ...strategyResult,
        ...contentPlanResult,
      };

      await ctx.runMutation(internal.mentor.saveAnalysis, {
        analysisData: { ...finalAnalysisData, ...userData }
      });

      return { ...finalAnalysisData, ...userData };

    } catch (error: unknown) {
      console.error("Erro final no processo de geração:", error);
      if (error instanceof Error && error.message.includes("400")) {
        throw new Error("A IA falhou em gerar um JSON válido. O prompt pode ser muito complexo ou os dados de entrada confusos. Tente novamente.");
      }
      throw error; // Re-lança outros erros (como 503 se o fallback também falhar)
    }
  },
});

// --- MUTATION INTERNA para SALVAR a análise ---
export const saveAnalysis = internalMutation({
    args: {
      analysisData: v.any(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Não autenticado.");

        const existingAnalysis = await ctx.db.query("analyses").withIndex("by_user", q => q.eq("userId", identity.subject)).first();

        const dataToSave = {
            ...args.analysisData,
            userId: identity.subject,
            updatedAt: Date.now()
        };

        if (existingAnalysis) {
            await ctx.db.patch(existingAnalysis._id, dataToSave);
            return existingAnalysis._id;
        } else {
            return await ctx.db.insert("analyses", { ...dataToSave, createdAt: Date.now() });
        }
    }
});

// --- QUERY para BUSCAR a análise salva ---
export const getSavedAnalysis = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;
        return await ctx.db.query("analyses").withIndex("by_user", q => q.eq("userId", identity.subject)).order("desc").first();
    }
});

// --- MUTATION para ATUALIZAR o plano de conteúdo ---
export const updateContentPlan = mutation({
    args: {
        analysisId: v.id("analyses"),
        newPlan: v.array(v.object({
            day: v.string(),
            time: v.string(),
            format: v.string(),
            title: v.string(),
            content_idea: v.string(),
            status: v.union(v.literal("planejado"), v.literal("concluido")),
            details: v.optional(v.object({
                tool_suggestion: v.string(),
                step_by_step: v.string(),
                script_or_copy: v.string(),
                  hashtags: v.array(v.string()),
                creative_guidance: v.object({
                    type: v.string(),
                    description: v.string(),
                    prompt: v.string(),
                    tool_link: v.string(),
                }),
            })),
        }))
    },
    handler: async (ctx, { analysisId, newPlan }) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Não autenticado.");

        const analysis = await ctx.db.get(analysisId);
        if (!analysis || analysis.userId !== identity.subject) {
            throw new Error("Análise não encontrada ou permissão negada.");
        }

        await ctx.db.patch(analysisId, {
            content_plan: newPlan,
            updatedAt: Date.now(),
        });
    }
});