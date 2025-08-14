import { action, internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import OpenAI from "openai";

// Tipos TypeScript
interface StrategyResult {
  suggestions: string[];
  strategy: string;
  grid: string[];
}

interface ContentPlanItem {
  day: string;
  time: string;
  format: string;
  title: string;
  content_idea: string;
  status: "planejado" | "concluido";
  completedAt?: number;
  details?: {
    tool_suggestion: string;
    step_by_step: string;
    script_or_copy: string;
    hashtags: string;
    creative_guidance: {
      type: string;
      description: string;
      prompt: string;
      tool_link: string;
    };
  };
}

interface ContentPlanResult {
  content_plan: ContentPlanItem[];
}

// Verificação de variáveis de ambiente
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY não está configurada nas variáveis de ambiente");
}

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY não está configurada nas variáveis de ambiente");
}

// Configuração dos motores de IA
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

// Função helper para chamar o Gemini com resiliência
async function callGeminiWithRetry(
  prompt: string,
  modelName: string = "gemini-1.5-flash",
  retries = 3
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: modelName,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE
      },
    ],
  });

  let lastError: Error = new Error("Falha ao chamar a IA após todas as tentativas.");

  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      });

      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error("Gemini retornou uma resposta vazia");
      }

      return text;
    } catch (error: unknown) {
      if (error instanceof Error) {
        lastError = error;
        console.error(`Tentativa ${i + 1} falhou:`, error.message);

        if (error.message.includes("503") ||
            error.message.includes("overloaded") ||
            error.message.includes("429")) {
          const waitTime = Math.min(1000 * Math.pow(2, i), 10000);
          console.warn(`Aguardando ${waitTime}ms antes da próxima tentativa...`);
          await new Promise(res => setTimeout(res, waitTime));
          continue;
        }

        if (error.message.includes("quota") ||
            error.message.includes("API key")) {
          throw error;
        }
      }

      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, 1000));
      }
    }
  }

  throw lastError;
}

// Função helper para chamar o Groq
async function callGroq(prompt: string, modelName: string = "llama3-8b-8192"): Promise<string> {
  try {
    const response = await groq.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em estratégia de conteúdo. Responda APENAS com objetos JSON válidos, sem texto adicional."
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    const responseText = response.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error("Groq não retornou nenhum conteúdo.");
    }

    return responseText;
  } catch (error) {
    console.error("Erro ao chamar Groq:", error);
    throw error;
  }
}

// Função helper para extrair JSON com tipagem
function extractJson<T>(text: string): T {
  const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);

  if (!jsonMatch || !jsonMatch[0]) {
    throw new Error("Não foi possível encontrar um objeto JSON na resposta da IA.");
  }

  try {
    return JSON.parse(jsonMatch[0]) as T;
  } catch (error) {
    console.error("Erro ao fazer parse do JSON:", error);
    console.error("Texto recebido:", jsonMatch[0]);
    throw new Error("A IA retornou um JSON com sintaxe inválida.");
  }
}

// Função para gerar estratégia de fallback
function generateFallbackStrategy(username: string, offer: string, audience: string): StrategyResult {
  return {
    suggestions: [
      `✨ Especialista em ${offer} | Ajudando ${audience} a alcançar resultados | Criador de conteúdo digital | DM para consultoria`,
      `Transformando ${audience} através de ${offer} | 🚀 Estratégias que funcionam | Conteúdo exclusivo toda semana | Link na bio`,
      `${offer.charAt(0).toUpperCase() + offer.slice(1)} para ${audience} | 💡 Dicas práticas | 🔥 Resultados comprovados | Entre em contato para mais informações`
    ],
    strategy: `# Estratégia de Conteúdo para @${username}\n\n## Análise de Público\nSeu público-alvo (${audience}) está buscando soluções práticas relacionadas a ${offer}. Eles valorizam conteúdo que entrega valor imediato e demonstra sua expertise.\n\n## Pilares de Conteúdo\n1. **Educação**: Compartilhe conhecimentos sobre ${offer} que ajudem seu público a resolver problemas\n2. **Autoridade**: Mostre resultados e cases de sucesso para estabelecer credibilidade\n3. **Engajamento**: Crie conteúdo que gere interação e construa relacionamento\n\n## Recomendações\n- Poste pelo menos 3-4 vezes por semana para manter consistência\n- Alterne entre formatos (carrossel, reels, stories) para variedade\n- Use storytelling para criar conexão emocional com ${audience}\n- Inclua chamadas para ação claras direcionando para sua oferta\n\n## Estratégia de Crescimento\nFoque em hashtags relevantes, parcerias com criadores complementares, e responda ativamente nos comentários para aumentar seu alcance orgânico.`,
    grid: [
      "Carrossel: 5 mitos sobre " + offer,
      "Reels: Como implementar " + offer + " em 60 segundos",
      "Foto: Resultado de cliente usando " + offer,
      "Carrossel: Guia passo-a-passo de " + offer,
      "Reels: Erros comuns que " + audience + " comete",
      "Foto: Bastidores do trabalho",
      "Carrossel: Comparação antes/depois",
      "Reels: Perguntas frequentes sobre " + offer,
      "Foto: Testemunho de cliente"
    ]
  };
}

// Função para gerar plano de conteúdo de fallback
function generateFallbackPlan(username: string, offer: string, audience: string, planDuration: "week" | "month"): ContentPlanResult {
  const days = planDuration === "week" ? 7 : 30;
  const formats = ["reels", "carrossel", "foto", "story"];
  const times = ["09:00", "12:00", "15:00", "18:00", "20:00"];

  const content_plan = Array.from({ length: days }, (_, i) => ({
    day: `Dia ${i + 1}`,
    time: times[Math.floor(Math.random() * times.length)],
    format: formats[Math.floor(Math.random() * formats.length)],
    title: `Conteúdo sobre ${offer} para ${audience}`,
    content_idea: `Compartilhe sua experiência ou dica sobre ${offer} que ajude ${audience}.`,
    status: "planejado" as const,
    details: {
      tool_suggestion: "Canva (gratuito)",
      step_by_step: "1. Escreva o roteiro\n2. Grave o vídeo\n3. Edite\n4. Publique",
      script_or_copy: `Quer transformar seu perfil em uma máquina de vendas? Hoje vou te mostrar como usar ${offer} para atrair mais ${audience}!\n\nComente abaixo se você já tentou isso!`,
      hashtags: "#marketing #instagram #conteúdo",
      creative_guidance: {
        type: "image",
        description: "Imagem profissional relacionada ao seu nicho",
        prompt: `Crie uma imagem profissional mostrando ${offer} para ${audience}`,
        tool_link: "https://www.canva.com/"
      }
    }
  }));

  return { content_plan };
}

// Action principal para gerar análise
export const generateAnalysis = action({
  args: {
    username: v.string(),
    bio: v.optional(v.string()),
    offer: v.string(),
    audience: v.string(),
    planDuration: v.union(v.literal("week"), v.literal("month"))
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Usuário não autenticado.");
    }

    // Prompt simplificado para a estratégia
    const strategyPrompt = `
    Crie uma estratégia de conteúdo para Instagram para @${args.username}.

    Oferta: ${args.offer}
    Público: ${args.audience}
    Bio atual: ${args.bio || "Não fornecida"}

    Retorne apenas um objeto JSON simples:
    {
      "suggestions": ["Bio sugestão 1", "Bio sugestão 2", "Bio sugestão 3"],
      "strategy": "Estratégia de conteúdo detalhada...",
      "grid": ["Ideia 1", "Ideia 2", "Ideia 3", "Ideia 4", "Ideia 5", "Ideia 6", "Ideia 7", "Ideia 8", "Ideia 9"]
    }
    `;

    // Prompt simplificado para o plano de conteúdo
    const contentPlanPrompt = `
    Crie um plano de conteúdo para Instagram de ${args.planDuration === "week" ? "7" : "30"} dias para @${args.username}.

    Oferta: ${args.offer}
    Público: ${args.audience}

    Responda com um objeto JSON simples:
    {
      "content_plan": [
        {
          "day": "Dia 1",
          "time": "09:00",
          "format": "reels",
          "title": "Título do post",
          "content_idea": "Breve descrição",
          "status": "planejado",
          "details": {
            "tool_suggestion": "Canva",
            "step_by_step": "Passo 1...",
            "script_or_copy": "Texto da legenda",
            "hashtags": "#instagram #marketing",
            "creative_guidance": {
              "type": "image",
              "description": "Descrição visual",
              "prompt": "Prompt para IA",
              "tool_link": "https://www.canva.com"
            }
          }
        }
      ]
    }

    IMPORTANTE: Inclua EXATAMENTE ${args.planDuration === "week" ? "7" : "30"} itens no array.
    `;

    let strategyResult: StrategyResult;
    let contentPlanResult: ContentPlanResult;
    let usedModel = "";

    // Gerar estratégia (com fallback)
    try {
      console.log("Gerando estratégia com Groq...");
      const strategyText = await callGroq(strategyPrompt);
      try {
        strategyResult = JSON.parse(strategyText) as StrategyResult;
      } catch {
        strategyResult = extractJson<StrategyResult>(strategyText);
      }
      usedModel = "groq-llama3";
    } catch (groqError) {
      console.warn("Groq falhou, tentando com Gemini...", groqError);
      try {
        const strategyText = await callGeminiWithRetry(strategyPrompt);
        try {
          strategyResult = JSON.parse(strategyText) as StrategyResult;
        } catch {
          strategyResult = extractJson<StrategyResult>(strategyText);
        }
        usedModel = "gemini-1.5-flash";
      } catch {
        console.error("Ambos os modelos falharam, usando estratégia de fallback...");
        strategyResult = generateFallbackStrategy(
          args.username,
          args.offer,
          args.audience
        );
        usedModel = "fallback";
      }
    }

    // Gerar plano de conteúdo (com fallback)
    let contentModel = "";
    try {
      console.log("Gerando plano de conteúdo com Gemini...");
      const contentPlanText = await callGeminiWithRetry(contentPlanPrompt);
      try {
        contentPlanResult = JSON.parse(contentPlanText) as ContentPlanResult;
      } catch {
        contentPlanResult = extractJson<ContentPlanResult>(contentPlanText);
      }
      contentModel = "gemini";
    } catch {
      console.error("Gemini falhou para plano de conteúdo, tentando Groq...");
      try {
        console.log("Tentando plano de conteúdo com Groq...");
        const contentPlanText = await callGroq(contentPlanPrompt);
        try {
          contentPlanResult = JSON.parse(contentPlanText) as ContentPlanResult;
        } catch {
          contentPlanResult = extractJson<ContentPlanResult>(contentPlanText);
        }
        contentModel = "groq";
      } catch {
        console.error("Ambos os modelos falharam, usando plano de fallback...");
        contentPlanResult = generateFallbackPlan(
          args.username,
          args.offer,
          args.audience,
          args.planDuration
        );
        contentModel = "fallback";
      }
    }

    // Atualizar o modelo usado
    if (contentModel === "fallback") {
      usedModel = usedModel === "fallback" ? "total-fallback" : `${usedModel}+content-fallback`;
    }

    // Validações e correções para garantir formato correto
    if (!strategyResult.suggestions || !Array.isArray(strategyResult.suggestions)) {
      strategyResult.suggestions = generateFallbackStrategy(args.username, args.offer, args.audience).suggestions;
    }

    if (!strategyResult.strategy || typeof strategyResult.strategy !== 'string') {
      strategyResult.strategy = generateFallbackStrategy(args.username, args.offer, args.audience).strategy;
    }

    if (!strategyResult.grid || !Array.isArray(strategyResult.grid) || strategyResult.grid.length < 9) {
      strategyResult.grid = generateFallbackStrategy(args.username, args.offer, args.audience).grid;
    }

    if (!contentPlanResult.content_plan || !Array.isArray(contentPlanResult.content_plan) ||
        contentPlanResult.content_plan.length !== (args.planDuration === "week" ? 7 : 30)) {
      contentPlanResult = generateFallbackPlan(args.username, args.offer, args.audience, args.planDuration);
    }

    // Combinar resultados
    const finalAnalysisData = {
      ...strategyResult,
      ...contentPlanResult,
      username: args.username,
      bio: args.bio || "",
      offer: args.offer,
      audience: args.audience,
      planDuration: args.planDuration,
      aiModel: usedModel
    };

    // Salvar no banco
    await ctx.runMutation(internal.mentor.saveAnalysis, {
      analysisData: finalAnalysisData
    });

    return finalAnalysisData;
  },
});

// Mutation interna para salvar análise
export const saveAnalysis = internalMutation({
  args: {
    analysisData: v.object({
      suggestions: v.array(v.string()),
      strategy: v.string(),
      grid: v.array(v.string()),
      content_plan: v.array(v.object({
        day: v.string(),
        time: v.string(),
        format: v.string(),
        title: v.string(),
        content_idea: v.string(),
        status: v.union(v.literal("planejado"), v.literal("concluido")),
        completedAt: v.optional(v.number()),
        details: v.optional(v.object({
          tool_suggestion: v.string(),
          step_by_step: v.string(),
          script_or_copy: v.string(),
          hashtags: v.string(),
          creative_guidance: v.object({
            type: v.string(),
            description: v.string(),
            prompt: v.string(),
            tool_link: v.string(),
          }),
        })),
      })),
      username: v.string(),
      bio: v.string(),
      offer: v.string(),
      audience: v.string(),
      planDuration: v.union(v.literal("week"), v.literal("month")),
      aiModel: v.optional(v.string()),
    })
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado.");
    }

    const existingAnalysis = await ctx.db
      .query("analyses")
      .withIndex("by_user", q => q.eq("userId", identity.subject))
      .first();

    const dataToSave = {
      ...args.analysisData,
      userId: identity.subject,
      updatedAt: Date.now()
    };

    if (existingAnalysis) {
      await ctx.db.patch(existingAnalysis._id, dataToSave);
      return existingAnalysis._id;
    } else {
      return await ctx.db.insert("analyses", {
        ...dataToSave,
        createdAt: Date.now()
      });
    }
  }
});

// Query para buscar análise salva
export const getSavedAnalysis = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("analyses")
      .withIndex("by_user", q => q.eq("userId", identity.subject))
      .order("desc")
      .first();
  }
});

// Mutation para atualizar plano de conteúdo
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
      completedAt: v.optional(v.number()),
      details: v.optional(v.object({
        tool_suggestion: v.string(),
        step_by_step: v.string(),
        script_or_copy: v.string(),
        hashtags: v.string(),
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
      throw new Error("Análise não encontrada ou você não tem permissão para modificá-la.");
    }

    await ctx.db.patch(analysisId, {
      content_plan: newPlan,
      updatedAt: Date.now()
    });

    return { success: true };
  }
});

// Mutation para marcar item como concluído
export const markContentItemComplete = mutation({
  args: {
    analysisId: v.id("analyses"),
    dayIndex: v.number(),
    status: v.union(v.literal("planejado"), v.literal("concluido")),
  },
  handler: async (ctx, { analysisId, dayIndex, status }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado.");

    const analysis = await ctx.db.get(analysisId);
    if (!analysis || analysis.userId !== identity.subject) {
      throw new Error("Análise não encontrada ou você não tem permissão para modificá-la.");
    }

    const contentPlan = [...analysis.content_plan];
    if (dayIndex < 0 || dayIndex >= contentPlan.length) {
      throw new Error("Índice de dia inválido.");
    }

    contentPlan[dayIndex] = {
      ...contentPlan[dayIndex],
      status,
      completedAt: status === "concluido" ? Date.now() : undefined
    };

    await ctx.db.patch(analysisId, {
      content_plan: contentPlan,
      updatedAt: Date.now()
    });

    return { success: true };
  }
});