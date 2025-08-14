// Em /convex/mentor.ts
// (Substitua o arquivo inteiro por esta versão final, definitiva e correta)

import { action, internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// <<< FUNÇÃO HELPER PARA CHAMADAS AO HUGGING FACE (COM LÓGICA BLINDADA) >>>
async function callHuggingFace(prompt: string, model: string): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error("A variável de ambiente HUGGINGFACE_API_KEY não está definida.");
  }

  const response = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        "inputs": prompt,
        "parameters": {
          "return_full_text": false,
          "max_new_tokens": 8192, // Limite máximo para respostas longas
        }
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Erro da API Hugging Face (status ${response.status}):`, errorText);

    if (errorText.includes("is currently loading")) {
      const timeMatch = errorText.match(/estimated_time":\s*(\d+\.?\d*)/);
      const estimatedTime = timeMatch ? Math.round(parseFloat(timeMatch[1])) : 30;
      throw new Error(`O modelo de IA está sendo iniciado. Por favor, tente novamente em ${estimatedTime} segundos.`);
    }

    throw new Error(`A API do Hugging Face retornou um erro ${response.status}: ${errorText}`);
  }

  const result = await response.json();

  if (Array.isArray(result) && result[0] && result[0].generated_text) {
    return result[0].generated_text;
  }

  throw new Error("A resposta da IA do Hugging Face veio em um formato inesperado.");
}

// <<< FUNÇÃO HELPER À PROVA DE BALAS PARA EXTRAIR JSON (TYPE-SAFE) >>>
function extractJson(text: string): unknown {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match || !match[0]) {
        throw new Error("Não foi possível encontrar um objeto JSON na resposta da IA. Resposta recebida: " + text);
    }
    try {
        return JSON.parse(match[0]);
    } catch (e) {
        console.error("Erro ao parsear JSON da resposta:", e, "Texto Bruto Tentado:", match[0]);
        throw new Error("A IA retornou um JSON com sintaxe inválida.");
    }
}


// --- ACTION para GERAR uma nova análise (COM MODELO CORRETO E TYPE-SAFE) ---
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

    // <<< MODELO FINAL, CORRETO E VERIFICADO >>>
    const model = "mistralai/Mistral-7B-Instruct-v0.2";

    // O formato de instrução do Mistral é [INST]...[/INST]
    const promptForStrategy = `[INST] Você é "Athena", uma estrategista de conteúdo. Sua tarefa é gerar a estratégia, 3 bios completas e o grid para: @${args.username}, que oferece '${args.offer}' para '${args.audience}'. Responda APENAS com o objeto JSON solicitado, sem nenhum texto adicional. Formato JSON: { "suggestions": ["..."], "strategy": "...", "grid": ["..."] } [/INST]`;
    const promptForContentPlan = `[INST] Você é "Athena", uma diretora de criação. Crie um plano de conteúdo de ${args.planDuration === "week" ? "7" : "30"} dias para @${args.username}. Responda APENAS com um objeto JSON com a chave 'content_plan' contendo EXATAMENTE ${args.planDuration === "week" ? "7" : "30"} itens. Cada item deve ter todos os campos (day, time, format, title, content_idea, status, tool_suggestion, step_by_step, script_or_copy, hashtags, creative_guidance). [/INST]`;

    try {
      console.log(`Gerando estratégia com ${model}...`);
      const strategyText = await callHuggingFace(promptForStrategy, model);
      const strategyResult = extractJson(strategyText);

      if (typeof strategyResult !== 'object' || strategyResult === null || !('suggestions' in strategyResult)) {
        throw new Error("Resposta de estratégia da IA está em um formato inválido.");
      }

      console.log(`Gerando plano de conteúdo com ${model}...`);
      const contentPlanText = await callHuggingFace(promptForContentPlan, model);
      const contentPlanResult = extractJson(contentPlanText);

      if (typeof contentPlanResult !== 'object' || contentPlanResult === null || !('content_plan' in contentPlanResult)) {
        throw new Error("Resposta do plano de conteúdo da IA está em um formato inválido.");
      }

      const finalAnalysisData = { ...(strategyResult as object), ...(contentPlanResult as object) };

      await ctx.runMutation(internal.mentor.saveAnalysis, {
        analysisData: { ...finalAnalysisData, ...userData }
      });

      return { ...finalAnalysisData, ...userData };

    } catch (error: unknown) {
      console.error("Erro no processo de geração com Hugging Face:", error);
      if (error instanceof Error) { throw error; }
      throw new Error("A IA falhou em gerar uma resposta válida. Por favor, tente novamente.");
    }
  },
});

// --- DEMAIS FUNÇÕES (saveAnalysis, getSavedAnalysis, updateContentPlan) ---
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