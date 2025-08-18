import { action, internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import OpenAI from "openai";

// Tipos TypeScript
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
if (!process.env.GROQ_API_KEY_1) {
  throw new Error("GROQ_API_KEY_1 não está configurada nas variáveis de ambiente");
}

if (!process.env.GROQ_API_KEY_2) {
  throw new Error("GROQ_API_KEY_2 não está configurada nas variáveis de ambiente");
}

// Configuração dos dois clientes Groq
const groq1 = new OpenAI({
  apiKey: process.env.GROQ_API_KEY_1,
  baseURL: "https://api.groq.com/openai/v1"
});

const groq2 = new OpenAI({
  apiKey: process.env.GROQ_API_KEY_2,
  baseURL: "https://api.groq.com/openai/v1"
});

// Funções de limpeza e extração de JSON (VERSÃO FINAL E ROBUSTA)
function extractJsonFromText(text: string): string {
  let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  const arrayStart = cleaned.indexOf('[');
  const objectStart = cleaned.indexOf('{');

  if (arrayStart === -1 && objectStart === -1) {
    throw new Error("Não foi possível encontrar JSON válido na resposta");
  }

  let start = -1;
  let isArray = false;

  if (arrayStart !== -1 && (objectStart === -1 || arrayStart < objectStart)) {
    start = arrayStart;
    isArray = true;
  } else {
    start = objectStart;
    isArray = false;
  }

  if (start !== -1) {
    cleaned = cleaned.substring(start);
    let openBrackets = 0;
    let closeBracketIndex = -1;
    const openChar = isArray ? '[' : '{';
    const closeChar = isArray ? ']' : '}';
    let inQuote = false;
    let escaped = false;

    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];
      if (char === '\\') {
        escaped = !escaped;
      } else if (char === '"' && !escaped) {
        inQuote = !inQuote;
      } else if (!inQuote) {
        if (char === openChar) openBrackets++;
        else if (char === closeChar) {
          openBrackets--;
          if (openBrackets === 0) {
            closeBracketIndex = i;
            break;
          }
        }
      }
      if (char !== '\\') escaped = false;
    }
    if (closeBracketIndex !== -1) {
      cleaned = cleaned.substring(0, closeBracketIndex + 1);
    }
  }
  return cleaned;
}

function cleanAndFixJson(text: string): string {
  let cleaned = extractJsonFromText(text);

  // Normaliza espaços e remove quebras de linha que quebram o parser
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Remove vírgulas traiçoeiras antes de fechar colchetes ou chaves
  cleaned = cleaned.replace(/,\s*([}```])/g, '$1');

  // Adiciona vírgula entre objetos que a IA esquece
  cleaned = cleaned.replace(/}\s*{/g, '},{');

  // **LÓGICA CORRIGIDA para aspas internas - SIMPLES E EFICAZ**
  // A regex foi corrigida para ser sintaticamente válida.
  // Ela encontra o conteúdo de uma string JSON, e a função callback escapa as aspas internas.
  cleaned = cleaned.replace(/:(\s*)"((?:\\.|[^"`]*)*)"/g, (match, whitespace, content) => {
      // Escapa todas as aspas duplas DENTRO do conteúdo da string
      const escapedContent = content.replace(/"/g, '\\"');
      // Reconstrói a string do valor JSON
      return `:${whitespace}"${escapedContent}"`;
  });

  return cleaned;
}

// Função helper para extrair JSON
function extractJson<T>(text: string): T {
  console.log("extractJson - Texto inicial:", text.substring(0, 100) + "...");

  try {
    const cleanedText = cleanAndFixJson(text);
    console.log("JSON limpo:", cleanedText.substring(0, 100) + "...");

    if (cleanedText.startsWith('[')) {
      console.log("Detectado array direto");
      try {
        const arrayData = JSON.parse(cleanedText);
        return { content_plan: arrayData } as T;
      } catch (parseError) {
        console.error("Erro ao parsear array:", parseError);
        return { content_plan: fallbackParsing(cleanedText) } as T;
      }
    }

    try {
      return JSON.parse(cleanedText) as T;
    } catch (parseError) {
      console.error("Erro ao parsear objeto:", parseError);
      throw new Error("Não foi possível parsear o JSON mesmo após limpeza");
    }
  } catch (error) {
    console.error("Erro no processo de extração:", error);
    throw new Error("Falha ao extrair JSON da resposta");
  }
}

// Função para parsing de fallback
function fallbackParsing(text: string): ContentPlanItem[] {
  const items: ContentPlanItem[] = [];
  const dayMatches = text.match(/"day"\s*:\s*"[^"]*"/g) || [];

  if (dayMatches.length > 0) {
    for (let i = 0; i < dayMatches.length; i++) {
        const dayNumber = String(i + 1);
        items.push({
            day: `Dia ${dayNumber}`,
            time: "12:00",
            format: "reels",
            title: `Conteúdo do dia ${dayNumber}`,
            content_idea: "Extraído manualmente devido a erro de parsing.",
            status: "planejado",
            details: {
            tool_suggestion: "Canva",
            step_by_step: "1. Criar conteúdo. 2. Revisar. 3. Publicar.",
            script_or_copy: "Texto do post gerado como fallback.",
            hashtags: "#marketingdigital #conteudo #fallback",
            creative_guidance: {
                type: "imagem",
                description: "Visual genérico para o post.",
                prompt: "Criar imagem para post do Instagram.",
                tool_link: "https://canva.com"
            }
            }
        });
    }
  }
  return items;
}

// Prompt do Sistema Compartilhado
const systemPromptContent = `Você é um especialista de elite em marketing digital para Instagram. Sua missão é gerar um plano de conteúdo ESTRATÉGICO e ACIONÁVEL, focado em crescimento orgânico.

REGRAS CRÍTICAS:
1. Responda APENAS com JSON válido, sem texto introdutório ou comentários.
2. Comece sua resposta DIRETAMENTE com o caractere "[".
3. Mantenha a estrutura exata do JSON do exemplo.
4. O campo "status" DEVE SER SEMPRE "planejado".
5. Poste apenas em dias úteis e sábado (NUNCA domingo).
6. Use horários de pico reais: manhã (09:00), almoço (12:30) ou noite (19:30).
7. Inclua 5-7 hashtags relevantes e específicas.
8. Escreva legendas persuasivas com um forte Call-To-Action (CTA). Use quebras de linha como \\\\n (duplo backslash) no JSON.
9. O "step_by_step" deve ser um mini-tutorial prático com 3-5 passos.
10. Títulos e ideias de conteúdo devem ser magnéticos e resolver um problema claro para a audiência.
11. Para dias de "atividade", sugira ações de otimização de tráfego orgânico (ex: Análise de concorrentes, Engajamento estratégico).`;

// Função helper para chamar o Groq1
async function callGroq1(prompt: string): Promise<string> {
  try {
    const response = await groq1.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: systemPromptContent },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 8000,
    });
    const responseText = response.choices[0]?.message?.content;
    if (!responseText) throw new Error("Groq1 não retornou conteúdo.");
    return responseText;
  } catch (error) {
    console.error("Erro ao chamar Groq1:", error);
    throw error;
  }
}

// Função helper para chamar o Groq2
async function callGroq2(prompt: string): Promise<string> {
  try {
    const response = await groq2.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: systemPromptContent },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 8000,
    });
    const responseText = response.choices[0]?.message?.content;
    if (!responseText) throw new Error("Groq2 não retornou conteúdo.");
    return responseText;
  } catch (error) {
    console.error("Erro ao chamar Groq2:", error);
    throw error;
  }
}

// Funções de melhoria e sanitização
function improveContentItem(item: ContentPlanItem, offer: string, audience: string): ContentPlanItem {
  if (item.format !== "atividade" && item.details) {
    if (item.details.hashtags.split(" ").length < 4) {
      item.details.hashtags = `#${offer.replace(/\s+/g, '')} #${audience.replace(/\s+/g, '')} #marketingdigital #conteudodevalor #estrategia`;
    }
    if (item.details.script_or_copy.length < 30) {
      item.details.script_or_copy = `🔥 ${item.title}\\n\\nDescubra como ${offer} pode transformar os resultados de ${audience}.\\n\\nComente 'EU QUERO' para saber mais!`;
    }
  }
  return item;
}

function sanitizeContentPlan(plan: ContentPlanItem[], offer?: string, audience?: string): ContentPlanItem[] {
  return plan.map(item => {
    let validStatus: "planejado" | "concluido" = "planejado";
    if (item.status === "planejado" || item.status === "concluido") {
      validStatus = item.status;
    }
    let sanitizedItem: ContentPlanItem = {
      day: item.day,
      time: item.time || "12:00",
      format: item.format || "reels",
      title: item.title || "Título do post",
      content_idea: item.content_idea || "Ideia de conteúdo",
      status: validStatus,
      completedAt: item.completedAt,
      details: item.details ? {
        tool_suggestion: item.details.tool_suggestion || "Canva",
        step_by_step: item.details.step_by_step || "1. Criar. 2. Publicar.",
        script_or_copy: item.details.script_or_copy || "Legenda do post.",
        hashtags: item.details.hashtags || "#marketing #conteudo",
        creative_guidance: {
          type: item.details.creative_guidance?.type || "imagem",
          description: item.details.creative_guidance?.description || "Visual do post.",
          prompt: item.details.creative_guidance?.prompt || "Criar imagem para Instagram.",
          tool_link: item.details.creative_guidance?.tool_link || "https://canva.com"
        }
      } : undefined
    };
    if (offer && audience) {
      sanitizedItem = improveContentItem(sanitizedItem, offer, audience);
    }
    return sanitizedItem;
  });
}

// Função para determinar dias de postagem
function getPostingDays(totalDays: number): number[] {
    if (totalDays === 7) return [1, 3, 5, 6]; // 4 posts na semana
    const postsPerWeek = 4;
    const totalWeeks = Math.ceil(totalDays / 7);
    const postingDays: number[] = [];

    for (let week = 0; week < totalWeeks; week++) {
        const weekDays = [1, 2, 3, 4, 5, 6]; // Seg a Sab
        const shuffled = [...weekDays].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, postsPerWeek);
        for (const day of selected) {
            const actualDay = week * 7 + day;
            if (actualDay <= totalDays) {
                postingDays.push(actualDay);
            }
        }
    }
    return postingDays.sort((a,b) => a-b);
}

// Função principal para gerar o plano de conteúdo
async function generateContentPlan(
  username: string,
  offer: string,
  audience: string,
  planDuration: "week" | "month"
): Promise<ContentPlanResult> {
  const totalDays = planDuration === "week" ? 7 : 30;
  const postingDays = getPostingDays(totalDays);
  const midPoint = Math.ceil(totalDays / 2);

  const firstHalfDays = postingDays.filter(d => d <= midPoint);
  const secondHalfDays = postingDays.filter(d => d > midPoint);

  const promptTemplate = (days: number[], startDay: number) => `
Crie um calendário de conteúdo para Instagram para @${username} sobre "${offer}" para "${audience}".
Postar apenas nos dias: ${days.join(', ')}. Nos outros dias, sugira atividades de otimização.
O primeiro dia deste bloco é o Dia ${startDay}.
Use quebras de linha como \\\\n no campo script_or_copy.
Exemplo de formato JSON EXATO:
[
  {
    "day": "Dia ${startDay}",
    "time": "09:00",
    "format": "reels",
    "title": "🔴 O ERRO que 99% de ${audience} Comete com ${offer}",
    "content_idea": "Reel rápido mostrando um erro comum e como corrigi-lo para obter resultados imediatos.",
    "status": "planejado",
    "details": {
      "tool_suggestion": "CapCut",
      "step_by_step": "1. Gancho visual forte (3s). 2. Mostrar o erro (5s). 3. Apresentar a solução (15s). 4. CTA para salvar.",
      "script_or_copy": "🚨 PARE AGORA! Você está perdendo clientes por causa disso.\\\\n\\\\nA solução é mais simples do que parece. Assista e transforme seus resultados!\\\\n\\\\n#SALVE para não esquecer!",
      "hashtags": "#dicasinstagram #${offer.replace(/\s+/g, '')} #${audience.replace(/\s+/g, '')} #marketingdeconteudo #crescimentoorganico",
      "creative_guidance": {
        "type": "vídeo",
        "description": "Vídeo dinâmico com texto grande e legendas claras. Foco em uma estética limpa e profissional.",
        "prompt": "Criar um vídeo curto para Instagram sobre um erro comum no nicho de ${offer}, mostrando a solução de forma visualmente clara.",
        "tool_link": "https://www.capcut.com"
      }
    }
  }
]`;

  try {
    const [response1, response2] = await Promise.all([
      callGroq1(promptTemplate(firstHalfDays, 1)),
      callGroq2(promptTemplate(secondHalfDays, midPoint + 1))
    ]);

    let part1: ContentPlanItem[] = [];
    let part2: ContentPlanItem[] = [];

    try {
      part1 = extractJson<ContentPlanResult>(response1).content_plan;
    } catch (e) {
      console.error("Falha ao processar resposta 1:", e);
      part1 = fallbackParsing(response1);
    }

    try {
      part2 = extractJson<ContentPlanResult>(response2).content_plan;
    } catch (e) {
      console.error("Falha ao processar resposta 2:", e);
      part2 = fallbackParsing(response2);
    }

    const fullPlan = [...part1, ...part2];
    return { content_plan: sanitizeContentPlan(fullPlan, offer, audience) };

  } catch (error) {
    console.error("Erro ao gerar plano:", error);
    return { content_plan: fallbackParsing("Erro geral na geração do plano.") };
  }
}

// Action principal para gerar plano
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
    if (!identity) throw new Error("Usuário não autenticado.");

    const contentPlanResult = await generateContentPlan(
      args.username,
      args.offer,
      args.audience,
      args.planDuration
    );

    const sanitizedPlan = sanitizeContentPlan(
      contentPlanResult.content_plan,
      args.offer,
      args.audience
    );

    const analysisData = {
      content_plan: sanitizedPlan,
      username: args.username,
      bio: args.bio || "",
      offer: args.offer,
      audience: args.audience,
      planDuration: args.planDuration,
      suggestions: [],
      strategy: "",
      grid: [],
      aiModel: "groq-dual"
    };

    await ctx.runMutation(internal.mentor.saveAnalysis, { analysisData });
    return analysisData;
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
    if (!identity) throw new Error("Não autenticado.");

    const sanitizedPlan = sanitizeContentPlan(
      args.analysisData.content_plan,
      args.analysisData.offer,
      args.analysisData.audience
    );

    const existingAnalysis = await ctx.db
      .query("analyses")
      .withIndex("by_user", q => q.eq("userId", identity.subject))
      .first();

    const dataToSave = {
      ...args.analysisData,
      content_plan: sanitizedPlan,
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

// Query para obter análise salva
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
      throw new Error("Análise não encontrada.");
    }

    const sanitizedPlan = sanitizeContentPlan(newPlan, analysis.offer, analysis.audience);
    await ctx.db.patch(analysisId, {
      content_plan: sanitizedPlan,
      updatedAt: Date.now()
    });
    return { success: true };
  }
});

// Mutation para marcar item como completo
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
      throw new Error("Análise não encontrada.");
    }

    const contentPlan = [...analysis.content_plan];
    if (dayIndex < 0 || dayIndex >= contentPlan.length) {
      throw new Error("Índice de dia inválido.");
    }

    contentPlan[dayIndex] = {
      ...contentPlan[dayIndex],
      status: status,
      completedAt: status === "concluido" ? Date.now() : undefined
    };

    const sanitizedPlan = sanitizeContentPlan(contentPlan, analysis.offer, analysis.audience);
    await ctx.db.patch(analysisId, {
      content_plan: sanitizedPlan,
      updatedAt: Date.now()
    });
    return { success: true };
  }
});