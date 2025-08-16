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

if (!process.env.GROQ_API_KEY_1) {
  throw new Error("GROQ_API_KEY_1 não está configurada nas variáveis de ambiente");
}

if (!process.env.GROQ_API_KEY_2) {
  throw new Error("GROQ_API_KEY_2 não está configurada nas variáveis de ambiente");
}

// Configuração dos motores de IA
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configuração dos dois clientes Groq com chaves diferentes
const groq1 = new OpenAI({
  apiKey: process.env.GROQ_API_KEY_1,
  baseURL: "https://api.groq.com/openai/v1"
});

const groq2 = new OpenAI({
  apiKey: process.env.GROQ_API_KEY_2,
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

function cleanAndFixJson(text: string): string {
  // Remove caracteres invisíveis e espaços extras
  let cleaned = text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove caracteres de controle
    .replace(/\r\n/g, '\n') // Normaliza quebras de linha
    .replace(/\r/g, '\n')
    .trim();

  // Corrige problemas comuns de formatação
  cleaned = cleaned
    .replace(/,\s*}/g, '}') // Remove vírgulas antes de }
    .replace(/,\s*]/g, ']') // Remove vírgulas antes de ]
    .replace(/}\s*{/g, '},{') // Adiciona vírgula entre objetos
    .replace(/]\s*{/g, '],{') // Adiciona vírgula entre array e objeto
    .replace(/}\s*]/g, '}]') // Garante que arrays fechem corretamente
    .replace(/"\s+"/g, '","') // Corrige espaços entre propriedades
    .replace(/:\s*"([^"]*)"([^,}])/g, ':"$1"$2'); // Garante formatação correta de valores

  return cleaned;
}

// Função helper para chamar o Groq com a primeira chave (para estratégia)
async function callGroq1(prompt: string, modelName: string = "llama3-8b-8192"): Promise<string> {
  try {
    // Adicionando log para debug
    console.log("Enviando prompt para estratégia:", prompt.substring(0, 200) + "...");

    const response = await groq1.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: "system",
          content: `Você é um especialista em estratégia de Instagram.
          Gere OBRIGATORIAMENTE os três campos: suggestions, strategy e grid.
          Mantenha o formato JSON válido sem exceções.
          Cada sugestão de bio deve ter até 150 caracteres.
          A estratégia deve ter pelo menos 300 caracteres.
          O grid deve ter EXATAMENTE 9 ideias variadas.`
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const responseText = response.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error("Groq não retornou nenhum conteúdo.");
    }

    // Verificação para garantir que o resultado tem os campos necessários
    try {
      const parsed = JSON.parse(responseText);
      if (!parsed.suggestions || !parsed.strategy || !parsed.grid) {
        console.error("Resposta da IA não contém todos os campos necessários:", responseText);
        throw new Error("Resposta incompleta");
      }

      return responseText;
    } catch (e) {
      console.error("Erro ao verificar resposta da IA:", e);
      throw e;
    }

  } catch (error) {
    console.error("Erro ao chamar Groq1:", error);
    // Simplesmente propagamos o erro, em vez de criar um fallback aqui
    throw error;
  }
}




// Função helper para chamar o Groq com a segunda chave (para plano de conteúdo)
async function callGroq2(prompt: string, modelName: string = "llama3-70b-8192"): Promise<string> {
  try {
    const response = await groq2.chat.completions.create({
      model: modelName, // Modelo mais poderoso
      messages: [
        {
          role: "system",
          content: `Você é um especialista em marketing digital para Instagram.
          REGRAS:
          1. Responda APENAS com array JSON válido
          2. Máximo 25 palavras por campo
          3. Conteúdo ESPECÍFICO para o nicho e audiência
          4. Cada post deve entregar VALOR REAL
          5. Foque em resultados e benefícios, não recursos`
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 6000,
    });

    const responseText = response.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error("Groq não retornou nenhum conteúdo.");
    }

    return responseText;
  } catch (error) {
    console.error("Erro ao chamar Groq2:", error);
    throw error;
  }
}
// Função helper para extrair JSON com tipagem
// Função extractJson usando cleanAndFixJson
function extractJson<T>(text: string): T {
  console.log("extractJson - Texto inicial:", text.substring(0, 100) + "...");

  // Usar cleanAndFixJson aqui
  let cleanedText = cleanAndFixJson(
    text.replace(/```json\n?/g, '').replace(/```\n?/g, '')
  );

  // Primeiro, verificar se é um array direto
  if (cleanedText.startsWith('[')) {
    console.log("Detectado array direto, envolvendo em objeto content_plan");

    try {
      // Aplicar limpeza adicional específica para arrays
      cleanedText = cleanedText
        .replace(/'/g, "'") // Normalizar aspas
        .replace(/(\w)'s/g, "$1s") // Remover apóstrofos problemáticos
        .replace(/\\'/g, "'"); // Corrigir escapes

      const arrayData = JSON.parse(cleanedText);
      return { content_plan: arrayData } as T;
    } catch (error) {
      console.error("Erro ao parsear array direto:", error);

      // Tentar uma limpeza mais agressiva
      try {
        const arrayData = JSON.parse(cleanedText);
        return { content_plan: arrayData } as T;
      } catch (secondError) {
        console.error("Segunda tentativa de parse do array falhou:", secondError);
      }
    }
  }

  // Se não for array, tentar como objeto
  const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);

  if (!jsonMatch || !jsonMatch[0]) {
    throw new Error("Não foi possível encontrar um objeto JSON ou array na resposta da IA.");
  }

  try {
    return JSON.parse(jsonMatch[0]) as T;
  } catch (error) {
    console.error("Erro ao fazer parse do JSON:", error);
    throw new Error("A IA retornou um JSON com sintaxe inválida.");
  }
}


// Sanitização para evitar nulls em campos obrigatórios
function sanitizeContentPlan(plan: ContentPlanItem[]): ContentPlanItem[] {
  return plan.map(item => {
    if (item.details?.creative_guidance) {
      item.details.creative_guidance.prompt = item.details.creative_guidance.prompt ?? "";
      item.details.creative_guidance.description = item.details.creative_guidance.description ?? "";
      item.details.creative_guidance.tool_link = item.details.creative_guidance.tool_link ?? "";
      item.details.creative_guidance.type = item.details.creative_guidance.type ?? "";
    }
    return item;
  });
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
  const formats = ["reels", "story", "foto", "carrossel"];
  const times = ["09:00", "12:00", "15:00", "18:00", "20:00"];

  const content_plan = Array.from({ length: days }, (_, i) => ({
    day: `Dia ${i + 1}`,
    time: times[i % times.length],
    format: formats[i % formats.length],
    title: `${offer} #${i + 1}`,
    content_idea: `Dica ${offer} para ${audience}`,
    status: "planejado" as const,
    details: {
      tool_suggestion: "Canva",
      step_by_step: "1.Planejar 2.Criar 3.Publicar",
      script_or_copy: `${offer} transforma negócios! 🚀`,
      hashtags: `#${offer.replace(/\s+/g, '')} #dia${i + 1}`,
      creative_guidance: {
        type: "imagem",
        description: `Visual ${offer}`,
        prompt: `${offer} profissional`,
        tool_link: "https://canva.com"
      }
    }
  }));

  return { content_plan };
}

// Função para gerar plano de conteúdo em lotes
async function generateContentPlanInBatches(
  username: string,
  offer: string,
  audience: string,
  planDuration: "week" | "month",
  aiFunction: (prompt: string) => Promise<string>
): Promise<ContentPlanResult> {
  const totalDays = planDuration === "week" ? 7 : 30;
  const batchSize = planDuration === "week" ? 7 : 10;
  const batches = Math.ceil(totalDays / batchSize);
  let allContentPlan: ContentPlanItem[] = [];

  for (let i = 0; i < batches; i++) {
    const startDay = i * batchSize + 1;
    const endDay = Math.min((i + 1) * batchSize, totalDays);
    const daysInBatch = endDay - startDay + 1;

    // Prompt específico para conteúdo de valor
    const batchPrompt = `
Crie ${daysInBatch} posts Instagram de alta conversão sobre ${offer} para ${audience}.

REQUISITOS:
- Cada post deve focar em um BENEFÍCIO ou SOLUÇÃO ESPECÍFICA de ${offer}
- Títulos que capturam atenção e geram cliques
- Conteúdo que realmente ajuda ${audience}
- Calls-to-action claros em cada post
- Máximo 25 palavras por campo para manter concisão

Retorne apenas JSON array:
[
  {
    "day": "Dia ${startDay}",
    "time": "09:00",
    "format": "reels",
    "title": "Título específico sobre benefício de ${offer}",
    "content_idea": "Ideia prática e útil para ${audience}",
    "status": "planejado",
    "details": {
      "tool_suggestion": "Ferramenta específica",
      "step_by_step": "3 passos práticos e acionáveis",
      "script_or_copy": "Legenda persuasiva com CTA claro",
      "hashtags": "Hashtags estratégicas para ${offer}",
      "creative_guidance": {
        "type": "Tipo de visual",
        "description": "Descrição específica do visual",
        "prompt": "Prompt para IA gerar visual",
        "tool_link": "https://canva.com"
      }
    }
  }
]

TEMAS PARA DISTRIBUIR ENTRE OS POSTS:
- Benefícios específicos de ${offer}
- Problemas que ${offer} resolve para ${audience}
- Resultados que ${audience} pode alcançar
- Comparativo com concorrentes/alternativas
- Provas sociais/depoimentos
- Tutorial passo-a-passo
- Mitos e verdades sobre ${offer}
- Perguntas frequentes de ${audience}
- Histórias de sucesso com ${offer}`;

    try {
      console.log(`Gerando lote ${i + 1}/${batches} (dias ${startDay}-${endDay})...`);
      const batchText = await aiFunction(batchPrompt);

      console.log(`Resposta bruta do lote ${i + 1}:`, batchText.substring(0, 200) + "...");

      let batchResult: ContentPlanResult;

      // Tentar parse direto primeiro
      try {
        const parsed = JSON.parse(batchText);

        // Se for um array, criar a estrutura esperada
        if (Array.isArray(parsed)) {
          console.log("Array parseado diretamente, criando estrutura content_plan");
          batchResult = { content_plan: parsed };
        } else if (parsed.content_plan) {
          batchResult = parsed;
        } else {
          throw new Error("Estrutura inesperada");
        }
      } catch {
        console.log("Parse direto falhou, tentando extractJson...");
        batchResult = extractJson<ContentPlanResult>(batchText);
      }

      // Debug da estrutura
      console.log(`Estrutura do resultado:`, {
        hasContentPlan: !!batchResult.content_plan,
        isArray: Array.isArray(batchResult.content_plan),
        length: batchResult.content_plan?.length || 0,
        keys: Object.keys(batchResult)
      });

      // Validar e processar o content_plan
      if (!batchResult.content_plan || !Array.isArray(batchResult.content_plan)) {
        throw new Error("content_plan não é um array válido");
      }

      // Limitar tamanho dos textos - equilibrado
       batchResult.content_plan = batchResult.content_plan.slice(0, daysInBatch).map((item, idx) => ({
        day: item.day || `Dia ${startDay + idx}`,
        time: item.time || "09:00",
        format: item.format || "reels",
        title: (item.title || "Post").substring(0, 80), // Aumentado para títulos mais descritivos
        content_idea: (item.content_idea || "Conteúdo").substring(0, 120), // Aumentado para ideias mais completas
        status: "planejado" as const,
        details: {
          tool_suggestion: (item.details?.tool_suggestion || "Canva").substring(0, 40),
          step_by_step: (item.details?.step_by_step || "1.Criar 2.Postar").substring(0, 120),
          script_or_copy: (item.details?.script_or_copy || "Legenda").substring(0, 200),
          hashtags: (item.details?.hashtags || "#instagram").substring(0, 80),
          creative_guidance: {
            type: (item.details?.creative_guidance?.type || "video").substring(0, 30),
            description: (item.details?.creative_guidance?.description || "Visual").substring(0, 120),
            prompt: (item.details?.creative_guidance?.prompt || "Prompt").substring(0, 120),
            tool_link: item.details?.creative_guidance?.tool_link || "https://canva.com"
          }
        }
      }));
      allContentPlan = [...allContentPlan, ...batchResult.content_plan];

    } catch (error) {
      console.error(`Erro no lote ${i + 1}:`, error);

      // Fallback específico mas conciso
      const fallbackItems = Array.from({ length: daysInBatch }, (_, idx) => {
        const dayNum = startDay + idx;
        const formats = ["reels", "carrossel", "foto", "story"];
        const times = ["09:00", "12:00", "15:00", "18:00", "20:00"];

        // Temas específicos mas curtos
        const themes = [
          `Benefícios de ${offer}`,
          `${offer} para ${audience}`,
          `Erros ao usar ${offer}`,
          `Resultados com ${offer}`,
          `Depoimento sobre ${offer}`,
          `Antes/depois com ${offer}`,
          `Dicas sobre ${offer}`,
          `Tutorial de ${offer}`,
          `FAQ sobre ${offer}`,
          `Novidades em ${offer}`
        ];

        const theme = themes[dayNum % themes.length];

        return {
          day: `Dia ${dayNum}`,
          time: times[dayNum % times.length],
          format: formats[dayNum % formats.length],
          title: theme,
          content_idea: `${theme} específico para ${audience}`,
          status: "planejado" as const,
          details: {
            tool_suggestion: "Canva",
            step_by_step: `1. Preparar ${theme} 2. Criar visual 3. Publicar`,
            script_or_copy: `${theme}! Descubra como ${offer} ajuda ${audience}. Comente abaixo!`,
            hashtags: `#${offer.replace(/\s+/g, '')} #${audience.replace(/\s+/g, '')} #dicas`,
            creative_guidance: {
              type: formats[dayNum % formats.length] === "reels" ? "vídeo" : "imagem",
              description: `Visual sobre ${theme} para ${audience}`,
              prompt: `Imagem profissional de ${theme} para ${audience}`,
              tool_link: "https://canva.com"
            }
          }
        };
      });

      allContentPlan = [...allContentPlan, ...fallbackItems];
    }

    if (i < batches - 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  return { content_plan: allContentPlan };
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

    // Prompt específico para a estratégia
    const strategyPrompt = `
    Crie uma estratégia de conteúdo para Instagram para @${args.username}.

    Oferta: ${args.offer}
    Público: ${args.audience}
    Bio atual: ${args.bio || "Não fornecida"}

    IMPORTANTE: Você DEVE retornar EXATAMENTE este formato JSON sem alterações:
    {
      "suggestions": [
        "Sugestão de bio 1 específica para ${args.offer}",
        "Sugestão de bio 2 específica para ${args.audience}",
        "Sugestão de bio 3 combinando ${args.offer} e ${args.audience}"
      ],
      "strategy": "Estratégia detalhada sobre como criar conteúdo para ${args.audience} sobre ${args.offer}. Inclua frequência de postagem, tipos de conteúdo e abordagens específicas.",
      "grid": [
        "Reels: Dica específica sobre ${args.offer}",
        "Carrossel: Tutorial de ${args.offer} para ${args.audience}",
        "Foto: Depoimento de cliente sobre ${args.offer}",
        "Reels: Erro comum que ${args.audience} comete",
        "Carrossel: 5 benefícios de ${args.offer}",
        "Foto: Bastidores do trabalho com ${args.offer}",
        "Reels: Comparativo antes/depois de ${args.offer}",
        "Carrossel: Perguntas frequentes sobre ${args.offer}",
        "Foto: Resultado específico alcançado por ${args.audience}"
      ]
    }

    NÃO modifique a estrutura do JSON. Mantenha EXATAMENTE os três campos principais acima.
    `;

    let strategyResult: StrategyResult;
    let contentPlanResult: ContentPlanResult;
    let usedModel = "";

    // Gerar estratégia usando Groq1 (primeira chave)
    try {
      console.log("Gerando estratégia com Groq (primeira chave)...");
      const strategyText = await callGroq1(strategyPrompt);
      try {
        strategyResult = JSON.parse(strategyText) as StrategyResult;
      } catch {
        strategyResult = extractJson<StrategyResult>(strategyText);
      }
      usedModel = "groq1-llama3";
    } catch (groq1Error) {
      console.warn("Groq1 falhou, tentando com Gemini...", groq1Error);
      try {
        const strategyText = await callGeminiWithRetry(strategyPrompt);
        try {
          strategyResult = JSON.parse(strategyText) as StrategyResult;
        } catch {
          strategyResult = extractJson<StrategyResult>(strategyText);
        }
        usedModel = "gemini-1.5-flash";
      } catch {
        console.error("Todos os modelos falharam, usando estratégia de fallback...");
        // Aqui usamos os argumentos corretos
        strategyResult = generateFallbackStrategy(
          args.username,
          args.offer,
          args.audience
        );
        usedModel = "fallback";
      }
    }

    // Verificação extra para garantir que todas as seções estão preenchidas com dados corretos
    console.log("Verificando e corrigindo dados da estratégia se necessário...");

    // Sempre substituir se falhar ou tiver conteúdo padrão
    if (!strategyResult.suggestions ||
        !Array.isArray(strategyResult.suggestions) ||
        strategyResult.suggestions.length === 0 ||
        strategyResult.suggestions[0].includes("oferta") || // Detecta fallback incorreto
        strategyResult.suggestions[0].includes("público")) { // Detecta fallback incorreto
      console.log("Gerando sugestões de fallback personalizadas");
      strategyResult.suggestions = generateFallbackStrategy(args.username, args.offer, args.audience).suggestions;
    }

    if (!strategyResult.strategy ||
        typeof strategyResult.strategy !== 'string' ||
        strategyResult.strategy.length < 50 ||
        strategyResult.strategy.includes("público")) { // Detecta fallback incorreto
      console.log("Gerando estratégia de fallback personalizada");
      strategyResult.strategy = generateFallbackStrategy(args.username, args.offer, args.audience).strategy;
    }

    if (!strategyResult.grid ||
        !Array.isArray(strategyResult.grid) ||
        strategyResult.grid.length < 9 ||
        strategyResult.grid[0].includes("oferta")) { // Detecta fallback incorreto
      console.log("Gerando grid de fallback personalizado");
      strategyResult.grid = generateFallbackStrategy(args.username, args.offer, args.audience).grid;
    }

    // Gerar plano de conteúdo usando Groq2 (segunda chave) com sistema de lotes
    let contentModel = "";
    try {
      console.log("Gerando plano de conteúdo com Groq (segunda chave)...");
      contentPlanResult = await generateContentPlanInBatches(
        args.username,
        args.offer,
        args.audience,
        args.planDuration,
        callGroq2
      );
      contentModel = "groq2";
    } catch (groq2Error) {
      console.error("Groq2 falhou para plano de conteúdo, tentando Gemini...", groq2Error);
      try {
        contentPlanResult = await generateContentPlanInBatches(
          args.username,
          args.offer,
          args.audience,
          args.planDuration,
          callGeminiWithRetry
        );
        contentModel = "gemini";
      } catch {
        console.error("Todos os modelos falharam, usando plano de fallback...");
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
    if (contentModel !== "groq2") {
      usedModel = usedModel === "fallback" ?
        "total-fallback" :
        `${usedModel}+${contentModel === "fallback" ? "content-fallback" : contentModel}`;
    } else if (usedModel === "groq1-llama3") {
      usedModel = "groq-dual"; // Indica que ambas as chaves Groq foram usadas com sucesso
    }

    // Sanitizar o plano de conteúdo para evitar nulls
    contentPlanResult.content_plan = sanitizeContentPlan(contentPlanResult.content_plan);

    // Verificações finais para garantir que todos os dados estão corretos
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
      throw new Error("Análise não encontrada ou você não tem permissão para modificá-la.");
    }

    await ctx.db.patch(analysisId, {
      content_plan: newPlan,
      updatedAt: Date.now()
    });

    return { success: true };
  }
});

// Mutation para marcar item de conteúdo como completo
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