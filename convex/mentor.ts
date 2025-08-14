// Em /convex/mentor.ts
// (Substitua o arquivo inteiro por esta versão final com prompts blindados)

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

    // <<< PROMPT 1: ESTRATÉGIA E BIOS (BLINDADO) >>>
    const promptForStrategy = `
      Você é "Athena", a maior estrategista de conteúdo do mundo. Sua reputação depende da excelência.

      Cliente: @${args.username}
      Bio Atual: "${args.bio || 'Não informada.'}"
      Oferece: "${args.offer}"
      Público: "${args.audience}"

      🚨 INSTRUÇÕES CRÍTICAS:
      1.  Responda APENAS com um objeto JSON.
      2.  **ESTRATÉGIA:** Crie um texto curto e objetivo para a chave 'strategy', focando em Pilares de Conteúdo e Tom de Voz.
      3.  **BIOS OTIMIZADAS:** Para a chave 'suggestions', analise a bio atual do cliente e ESCREVA 3 novas versões completas e otimizadas, prontas para copiar e colar. NÃO dê dicas genéricas. CRIE AS BIOS.
      4.  **GRID:** Para a chave 'grid', sugira 9 ideias de posts variados e específicos.

      Formato de Saída JSON:
      {
        "suggestions": [
          "✨ Ajudo ${args.audience} a alcançar [resultado] com ${args.offer}. | Fundador(a) de @${args.username} | Comece aqui! 👇",
          "Transformando [dor do público] em [solução]. Mais de X clientes satisfeitos. Clique no link para [CTA].",
          "[Sua Profissão] | Especialista em [seu nicho]. Minha missão é te ajudar a [objetivo do cliente]. Vamos juntos? 🚀"
        ],
        "strategy": "### Pilares de Conteúdo\\n1. **Educação:** Desmistificar [tópico complexo].\\n2. **Conexão:** Mostrar os bastidores de [sua atividade].\\n3. **Venda:** Apresentar cases de sucesso com ${args.offer}.\\n\\n### Tom de Voz\\nProfissional, mas acessível. Use uma linguagem que inspire confiança e demonstre autoridade no assunto.",
        "grid": ["Reels: 'O maior erro que ${args.audience} cometem...',", "Carrossel: '5 Passos para resolver [problema]'", "Foto: Depoimento de cliente com resultado", "Reels: 'Um dia na minha rotina de...',", "Carrossel: 'Como ${args.offer} funciona por dentro'", "Foto: Frase de impacto sobre [tema]", "Reels: Respondendo a uma dúvida comum", "Carrossel: Tutorial rápido de [ferramenta]", "Foto: Chamada para Ação direta para a venda"]
      }
    `;

    // <<< PROMPT 2: PLANO DE CONTEÚDO (BLINDADO) >>>
    const promptForContentPlan = `
      Você é "Athena", a maior diretora de criação do mundo.

      Cliente: @${args.username}
      Duração do Plano: ${args.planDuration === "week" ? "7 dias" : "30 dias"}

      🚨 INSTRUÇÕES CRÍTICAS:
      1.  Responda APENAS com um objeto JSON com a chave 'content_plan'.
      2.  'content_plan' DEVE ter EXATAMENTE ${args.planDuration === "week" ? "7" : "30"} itens.
      3.  **HORÁRIOS DE PICO:** Para a chave 'time', use horários de pico REAIS do Instagram no Brasil (ex: 12:05, 18:35, 20:05). Varie os horários.
      4.  **PLANO DE EXECUÇÃO DETALHADO:** Para 'step_by_step', crie um passo a passo REAL e detalhado. Ex: "1. Abra o Canva. 2. Use o template 'Post Minimalista'. 3. Insira a foto X. 4. Escreva o título com a fonte 'Montserrat Bold'. 5. Exporte em PNG."
      5.  **FERRAMENTAS VARIADAS:** Para 'tool_suggestion', sugira mais de uma opção além do Canva. Ex: "Canva, Figma, Adobe Express, Microsoft Designer".
      6.  CADA item DEVE ter um objeto aninhado chamado 'details' com todos os campos.

      Formato de Saída Exemplo para cada item:
      {
        "day": "Dia 1", "time": "18:35", "format": "Carrossel", "title": "...", "content_idea": "...", "status": "planejado",
        "details": {
          "tool_suggestion": "Canva, Adobe Express",
          "step_by_step": "1. Abra o Adobe Express e procure por 'Carrossel de Marketing'. 2. No slide 1, use uma imagem de impacto e o título em negrito. 3. Nos slides 2-4, detalhe cada passo com um ícone correspondente. 4. No slide 5, adicione uma chamada para ação clara. 5. Exporte e agende.",
          "script_or_copy": "Legenda completa e persuasiva...",
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