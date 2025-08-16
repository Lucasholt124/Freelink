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

// Função para limpar e extrair apenas o JSON válido
function extractJsonFromText(text: string): string {
  // Remover texto markdown
  let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');

  // Encontrar o início do array JSON
  const arrayStart = cleaned.indexOf('[');
  const objectStart = cleaned.indexOf('{');

  // Determinar qual tipo de JSON estamos procurando
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

  // Extrair apenas o JSON
  if (start !== -1) {
    cleaned = cleaned.substring(start);

    // Encontrar o final correspondente
    let openBrackets = 0;
    let closeBracketIndex = -1;
    const openChar = isArray ? '[' : '{';
    const closeChar = isArray ? ']' : '}';

    for (let i = 0; i < cleaned.length; i++) {
      if (cleaned[i] === openChar) {
        openBrackets++;
      } else if (cleaned[i] === closeChar) {
        openBrackets--;
        if (openBrackets === 0) {
          closeBracketIndex = i;
          break;
        }
      }
    }

    if (closeBracketIndex !== -1) {
      cleaned = cleaned.substring(0, closeBracketIndex + 1);
    }
  }

  return cleaned;
}

// Função para limpar problemas comuns em JSON
function cleanAndFixJson(text: string): string {
  // Primeiro, extrair apenas o JSON da resposta
  const extracted = extractJsonFromText(text);

  // Remover caracteres invisíveis e espaços extras
  let cleaned = extracted
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

  // Normaliza tipos de aspas
  cleaned = cleaned
    .replace(/'/g, '"') // Converte aspas simples para duplas
    .replace(/([a-zA-Z0-9_]+):/g, '"$1":') // Adiciona aspas em nomes de propriedades sem aspas
    .replace(/:\s*"([^"]*)'/g, ':"$1"') // Fecha aspas duplas abertas
    .replace(/([^\```)"([a-zA-Z0-9_]+)":/g, '$1"$2":'); // Evita aspas duplicadas em nomes de propriedades

  return cleaned;
}

// Função helper para extrair JSON
function extractJson<T>(text: string): T {
  console.log("extractJson - Texto inicial:", text.substring(0, 100) + "...");

  try {
    // Limpar e extrair apenas o JSON válido
    const cleanedText = cleanAndFixJson(text);

    // Logar o JSON limpo para debug
    console.log("JSON limpo:", cleanedText.substring(0, 100) + "...");

    // Verificar se é um array direto
    if (cleanedText.startsWith('[')) {
      console.log("Detectado array direto");

      try {
        const arrayData = JSON.parse(cleanedText);
        return { content_plan: arrayData } as T;
      } catch (parseError) {
        console.error("Erro ao parsear array:", parseError);
        // Tentativa de último recurso: extrair manualmente os itens
        return { content_plan: fallbackParsing(cleanedText) } as T;
      }
    }

    // Tentar como objeto
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

// Função para parsing de fallback (último recurso)
function fallbackParsing(text: string): ContentPlanItem[] {
  // Implementação simplificada para casos extremos
  const items: ContentPlanItem[] = [];

  // Procurar por padrões como "day": "Dia X"
  const dayMatches = text.match(/"day"\s*:\s*"Dia \d+"/g) || [];

  if (dayMatches.length > 0) {
    // Temos pelo menos alguns dias que podemos extrair
    for (let i = 0; i < dayMatches.length; i++) {
      const dayMatch = dayMatches[i];
      const dayNumber = dayMatch.match(/\d+/)?.[0] || String(i + 1);

      items.push({
        day: `Dia ${dayNumber}`,
        time: "12:00",
        format: "reels",
        title: `Conteúdo do dia ${dayNumber}`,
        content_idea: "Extraído manualmente devido a erro de parsing",
        status: "planejado", // Status padrão válido
        details: {
          tool_suggestion: "Canva",
          step_by_step: "1. Criar 2. Publicar",
          script_or_copy: "Texto do post",
          hashtags: "#instagram #marketing #socialmedia #digital #conteudo #estrategia",
          creative_guidance: {
            type: "imagem",
            description: "Visual do post",
            prompt: "Criar imagem para Instagram",
            tool_link: "https://canva.com"
          }
        }
      });
    }
  }

  return items;
}

// Função helper para chamar o Groq1
async function callGroq1(prompt: string): Promise<string> {
  try {
    const response = await groq1.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content: `Você é um especialista em marketing digital para Instagram.
          REGRAS CRÍTICAS:
          1. Responda APENAS com JSON válido, sem texto introdutório
          2. Comece sua resposta diretamente com o caractere "[" (array JSON)
          3. NÃO inclua explicações, textos ou comentários, APENAS o array JSON
          4. NÃO inclua campos extras não especificados no exemplo abaixo
          5. O campo "status" deve ser SEMPRE "planejado" (nunca outro valor)
          6. Postagens apenas em dias úteis e sábado (NUNCA domingo)
          7. Use horários de pico reais: manhã (8h-10h), almoço (12h-14h) ou noite (18h-21h)
          8. Inclua 5-7 hashtags relevantes para cada post
          9. Escreva legendas específicas e persuasivas, não genéricas
          10. No guia criativo, forneça passos detalhados mas resumidos`
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const responseText = response.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error("Groq1 não retornou conteúdo.");
    }
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
        {
          role: "system",
          content: `Você é um especialista em marketing digital para Instagram.
          REGRAS CRÍTICAS:
          1. Responda APENAS com JSON válido, sem texto introdutório
          2. Comece sua resposta diretamente com o caractere "[" (array JSON)
          3. NÃO inclua explicações, textos ou comentários, APENAS o array JSON
          4. NÃO inclua campos extras não especificados no exemplo abaixo
          5. O campo "status" deve ser SEMPRE "planejado" (nunca outro valor)
          6. Postagens apenas em dias úteis e sábado (NUNCA domingo)
          7. Use horários de pico reais: manhã (8h-10h), almoço (12h-14h) ou noite (18h-21h)
          8. Inclua 5-7 hashtags relevantes para cada post
          9. Escreva legendas específicas e persuasivas, não genéricas
          10. No guia criativo, forneça passos detalhados mas resumidos`
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const responseText = response.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error("Groq2 não retornou conteúdo.");
    }
    return responseText;
  } catch (error) {
    console.error("Erro ao chamar Groq2:", error);
    throw error;
  }
}

// Função para melhorar textos genéricos
function improveContentItem(item: ContentPlanItem, offer: string, audience: string): ContentPlanItem {
  // Se for um dia de postagem (não atividade)
  if (item.format !== "atividade") {
    // Melhorar hashtags se estiver muito genérico
    if (item.details?.hashtags === "#instagram" ||
        item.details?.hashtags === "#marketing" ||
        item.details && item.details.hashtags.split(" ").length < 4) {

      const hashtags = `#${offer.replace(/\s+/g, '')} #${audience.replace(/\s+/g, '')} #marketing #socialmedia #contentcreator #estrategiadigital #growth`;

      if (item.details) {
        item.details.hashtags = hashtags;
      }
    }

    // Melhorar roteiro/legenda se estiver genérico
    if (item.details &&
        (item.details.script_or_copy === "Texto do post" ||
         item.details.script_or_copy === "Legenda do post" ||
         item.details.script_or_copy.length < 30)) {

      item.details.script_or_copy = `🔥 ${item.title}\n\nVocê sabia que ${offer} pode transformar a maneira como ${audience} alcança resultados?\n\nNeste post compartilhamos exatamente como implementar isso no seu negócio.\n\nComente 👇 se você já testou essa estratégia!\n\n#${offer.replace(/\s+/g, '')} #dicas`;
    }

    // Melhorar guia criativo se estiver muito básico
    if (item.details?.creative_guidance) {
      if (item.details.creative_guidance.description === "Visual do post" ||
          item.details.creative_guidance.description.length < 20) {

        item.details.creative_guidance.description = `${item.format === "reels" ? "Vídeo curto" : "Imagem profissional"} mostrando os benefícios de ${offer} para ${audience} com texto destacado e elementos visuais claros`;
      }

      if (item.details.creative_guidance.prompt === "Criar imagem para Instagram" ||
          item.details.creative_guidance.prompt.length < 20) {

        item.details.creative_guidance.prompt = `Criar ${item.format === "reels" ? "vídeo" : "imagem"} sobre ${offer} com foco em ${item.title}, estilo profissional e cores da marca`;
      }
    }

    // Melhorar passo a passo se estiver genérico
    if (item.details &&
        (item.details.step_by_step === "1. Criar 2. Publicar" ||
         item.details.step_by_step.length < 20)) {

      if (item.format === "reels") {
        item.details.step_by_step = "1. Gravar introdução com hook forte 2. Mostrar 3 pontos principais 3. Adicionar texto e música 4. Finalizar com CTA claro";
      } else if (item.format === "carrossel") {
        item.details.step_by_step = "1. Criar capa chamativa 2. Desenvolver 5-7 slides com dicas 3. Usar mesma identidade visual 4. Terminar com slide de CTA";
      } else {
        item.details.step_by_step = "1. Selecionar imagem de alta qualidade 2. Adicionar texto principal 3. Garantir contraste e legibilidade 4. Incluir elementos da marca";
      }
    }
  }

  return item;
}

// Sanitização para remover campos não esperados e garantir valores padrão
function sanitizeContentPlan(plan: ContentPlanItem[], offer?: string, audience?: string): ContentPlanItem[] {
  return plan.map(item => {
    // Garantir que status seja um valor válido
    let validStatus: "planejado" | "concluido" = "planejado";
    if (item.status === "planejado" || item.status === "concluido") {
      validStatus = item.status;
    }

    // Corrigir horários para horários de pico reais
    let time = item.time || "12:00";
    if (time !== "Flexível") {
      // Converter para horário de pico mais próximo
      const hour = parseInt(time.split(":")[0]);
      if (hour < 8) time = "09:00";
      else if (hour >= 8 && hour < 11) time = "09:00";
      else if (hour >= 11 && hour < 15) time = "12:30";
      else if (hour >= 15 && hour < 18) time = "18:30";
      else time = "19:30";
    }

    const sanitizedDetails = item.details ? {
      // Incluir APENAS os campos esperados pelo schema
      tool_suggestion: item.details.tool_suggestion || "Canva",
      step_by_step: item.details.step_by_step || "1. Criar 2. Revisar 3. Publicar",
      script_or_copy: item.details.script_or_copy || "Texto do post",
      hashtags: item.details.hashtags || "#instagram #marketing #socialmedia #digital #conteudo #estrategia",
      creative_guidance: {
        type: item.details.creative_guidance?.type || "imagem",
        description: item.details.creative_guidance?.description || "Visual do post",
        prompt: item.details.creative_guidance?.prompt || "Criar imagem para Instagram",
        tool_link: item.details.creative_guidance?.tool_link || "https://canva.com"
      }
    } : {
      // Valores padrão se details não existir
      tool_suggestion: "Canva",
      step_by_step: "1. Criar 2. Revisar 3. Publicar",
      script_or_copy: "Texto do post",
      hashtags: "#instagram #marketing #socialmedia #digital #conteudo #estrategia",
      creative_guidance: {
        type: "imagem",
        description: "Visual do post",
        prompt: "Criar imagem para Instagram",
        tool_link: "https://canva.com"
      }
    };

    // Retornar objeto com apenas os campos esperados
    const sanitizedItem = {
      day: item.day,
      time: time,
      format: item.format || "reels",
      title: item.title || "Título do post",
      content_idea: item.content_idea || "Conteúdo do post",
      status: validStatus, // Garante que status é válido
      completedAt: item.completedAt,
      details: sanitizedDetails
    };

    // Melhorar conteúdo se tiver parâmetros offer e audience
    if (offer && audience) {
      return improveContentItem(sanitizedItem, offer, audience);
    }

    return sanitizedItem;
  });
}

// Função para determinar dias estratégicos de postagem (sem domingos)
function getPostingDays(totalDays: number): number[] {
  if (totalDays === 7) {
    // Segunda, Quarta, Quinta, Sexta (sem domingo)
    return [1, 3, 4, 6];
  } else {
    const postingDays: number[] = [];
    // Aproximadamente 3-4 posts por semana para um mês
    const postsPerWeek = 3.5;
    const totalPosts = Math.floor((totalDays / 7) * postsPerWeek);

    // Distribuir uniformemente pelos dias disponíveis
    for (let week = 0; week < Math.ceil(totalDays / 7); week++) {
      // Segunda, Terça, Quarta, Quinta, Sexta, Sábado (sem domingo)
      const weekdays = [1, 2, 3, 4, 5, 6];

      // Selecionar 3-4 dias aleatoriamente dessa semana
      const shuffled = [...weekdays].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, week % 2 === 0 ? 4 : 3); // Alternar entre 3 e 4 posts

      for (const day of selected.sort((a, b) => a - b)) { // Ordenar dias
        const actualDay = week * 7 + day;
        if (actualDay <= totalDays) {
          postingDays.push(actualDay);
        }
      }
    }

    return postingDays.slice(0, totalPosts);
  }
}

// Função para gerar plano de conteúdo
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

  // Prompt para primeira metade - com Groq1
  const prompt1 = `
Crie calendário Instagram para ${username} sobre ${offer} para ${audience}.
Dias 1 a ${midPoint} (total ${midPoint} dias).

IMPORTANTE:
1. Postar apenas nos dias ${firstHalfDays.join(', ')} (nunca domingo)
2. Nos outros dias, sugira atividades como análise, pesquisa ou engajamento
3. Use horários de pico reais: manhã (9h), almoço (12:30) ou noite (19:30)
4. Inclua 5-7 hashtags relevantes e específicas em cada post
5. Escreva legendas específicas e persuasivas (não genéricas), com emoção e CTA
6. O campo "status" DEVE SER SEMPRE exatamente "planejado" (valor obrigatório)
7. No guia criativo, forneça um passo a passo detalhado mas resumido

Formato exato para cada dia:
[
  {
    "day": "Dia 1",
    "time": "09:00",
    "format": "reels",
    "title": "Título atrativo e específico",
    "content_idea": "Descrição clara e detalhada",
    "status": "planejado",
    "details": {
      "tool_suggestion": "Ferramenta específica para este tipo de conteúdo",
      "step_by_step": "1. Primeiro passo detalhado 2. Segundo passo detalhado 3. Terceiro passo detalhado 4. CTA final",
      "script_or_copy": "Legenda persuasiva e específica para este conteúdo, com emojis, quebras de linha e call-to-action claro no final",
      "hashtags": "#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5 #hashtag6",
      "creative_guidance": {
        "type": "tipo de conteúdo",
        "description": "Descrição detalhada do visual com elementos específicos",
        "prompt": "Prompt detalhado para gerar este visual específico",
        "tool_link": "https://canva.com"
      }
    }
  }
]`;

  // Prompt para segunda metade - com Groq2
  const prompt2 = `
Crie calendário Instagram para ${username} sobre ${offer} para ${audience}.
Dias ${midPoint + 1} a ${totalDays} (total ${totalDays - midPoint} dias).

IMPORTANTE:
1. Postar apenas nos dias ${secondHalfDays.join(', ')} (nunca domingo)
2. Nos outros dias, sugira atividades como análise, pesquisa ou engajamento
3. Use horários de pico reais: manhã (9h), almoço (12:30) ou noite (19:30)
4. Inclua 5-7 hashtags relevantes e específicas em cada post
5. Escreva legendas específicas e persuasivas (não genéricas), com emoção e CTA
6. O campo "status" DEVE SER SEMPRE exatamente "planejado" (valor obrigatório)
7. No guia criativo, forneça um passo a passo detalhado mas resumido

Formato exato para cada dia:
[
  {
    "day": "Dia 16",
    "time": "09:00",
    "format": "reels",
    "title": "Título atrativo e específico",
    "content_idea": "Descrição clara e detalhada",
    "status": "planejado",
    "details": {
      "tool_suggestion": "Ferramenta específica para este tipo de conteúdo",
      "step_by_step": "1. Primeiro passo detalhado 2. Segundo passo detalhado 3. Terceiro passo detalhado 4. CTA final",
      "script_or_copy": "Legenda persuasiva e específica para este conteúdo, com emojis, quebras de linha e call-to-action claro no final",
      "hashtags": "#hashtag1 #hashtag2 #hashtag3 #hashtag4 #hashtag5 #hashtag6",
      "creative_guidance": {
        "type": "tipo de conteúdo",
        "description": "Descrição detalhada do visual com elementos específicos",
        "prompt": "Prompt detalhado para gerar este visual específico",
        "tool_link": "https://canva.com"
      }
    }
  }
]`;

  try {
    // Chamar as duas APIs em paralelo
    const [response1, response2] = await Promise.all([
      callGroq1(prompt1),
      callGroq2(prompt2)
    ]);

    // Processar resultados
    let part1 = [], part2 = [];

    try {
      // Tentar parse direto primeiro
      try {
        const parsed1 = JSON.parse(response1);
        part1 = Array.isArray(parsed1) ? parsed1 : parsed1.content_plan || [];
      } catch {
        console.log("Erro ao parsear resposta 1, tentando extractJson");
        const extracted = extractJson<ContentPlanResult>(response1);
        part1 = extracted.content_plan || [];
      }

      try {
        const parsed2 = JSON.parse(response2);
        part2 = Array.isArray(parsed2) ? parsed2 : parsed2.content_plan || [];
      } catch  {
        console.log("Erro ao parsear resposta 2, tentando extractJson");
        const extracted = extractJson<ContentPlanResult>(response2);
        part2 = extracted.content_plan || [];
      }

      // Combinar os resultados
      const fullPlan = [...part1, ...part2];

      // Sanitizar o plano para remover campos extras e garantir valores válidos
      // Passar offer e audience para melhorar conteúdo genérico
      return { content_plan: sanitizeContentPlan(fullPlan, offer, audience) };
    } catch (parseError) {
      console.error("Erro ao processar respostas:", parseError);
      throw new Error("Falha ao processar respostas da IA");
    }

  } catch (error) {
    console.error("Erro ao gerar plano:", error);

    // Fallback: gerar plano simples mas com conteúdo melhorado
    const content_plan: ContentPlanItem[] = [];
    const formats = ["reels", "carrossel", "foto", "reels", "carrossel"];
    const times = ["09:00", "12:30", "19:30"];

    const topics = [
      `5 maneiras que ${offer} pode transformar os resultados de ${audience}`,
      `3 erros comuns que ${audience} comete ao implementar ${offer}`,
      `Case de sucesso: como ${offer} aumentou em 300% os resultados para ${audience}`,
      `Tutorial passo a passo: implementando ${offer} sem complicação`,
      `${offer} vs. métodos tradicionais: qual traz mais resultados para ${audience}`,
      `O segredo de ${offer} que ninguém conta para ${audience}`,
      `Como implementar ${offer} mesmo com orçamento limitado`,
      `Por que ${audience} precisa investir em ${offer} agora`,
      `${offer}: antes e depois real com resultados comprováveis`,
      `Prova social: depoimento de cliente satisfeito com ${offer}`
    ];

    for (let i = 1; i <= totalDays; i++) {
      // Pular domingos (dia 7, 14, 21, 28)
      if (i % 7 === 0) {
        continue;
      }

      // Verificar se é dia de post
      if (postingDays.includes(i)) {
        const postIndex = postingDays.indexOf(i);
        const topic = topics[postIndex % topics.length];
        const format = formats[postIndex % formats.length];
        const time = times[postIndex % times.length];

        let stepByStep = "";
        let scriptCopy = "";

        if (format === "reels") {
          stepByStep = "1. Gravar hook forte (5s) 2. Apresentar problema (10s) 3. Mostrar solução com ${offer} (20s) 4. Incluir resultados comprovados (15s) 5. Finalizar com CTA";
          scriptCopy = `🔥 ${topic}\n\nVocê sabia que 78% de ${audience} está perdendo oportunidades por não aproveitar ${offer} corretamente?\n\nNeste vídeo mostro exatamente como implementar para ver resultados em 30 dias.\n\n✅ Economia de tempo\n✅ Aumento de conversão\n✅ Crescimento sustentável\n\nSalve este post para não perder! 👇\nComente "QUERO" para mais conteúdos assim.`;
        } else if (format === "carrossel") {
          stepByStep = "1. Criar capa chamativa com título e problema 2. Slide 2-3: explicar desafios 3. Slides 4-6: apresentar soluções com ${offer} 4. Slide 7: mostrar resultados 5. Slide final: CTA para próximos passos";
          scriptCopy = `📊 ${topic}\n\nSwipe ➡️ para descobrir como ${offer} está revolucionando o mercado para ${audience}.\n\nNa última semana ajudamos 3 clientes a implementar esta estratégia e os resultados foram impressionantes!\n\nVocê está pronto para transformar seu negócio também?\n\nSalve este guia completo e marque um amigo que precisa ver isso! 👇`;
        } else {
          stepByStep = "1. Selecionar imagem impactante relacionada a ${offer} 2. Adicionar texto principal destacando benefícios-chave 3. Incluir elementos visuais da marca 4. Garantir alta qualidade e legibilidade";
          scriptCopy = `👀 ${topic}\n\nÉ isso que faz a diferença entre ${audience} que apenas sobrevive e os que prosperam no mercado atual.\n\nImplementando ${offer} corretamente, você pode:\n- Aumentar conversões\n- Reduzir custos\n- Escalar resultados\n\nQuer saber como? Deixe seu "SIM" nos comentários que te envio mais informações!`;
        }

        content_plan.push({
          day: `Dia ${i}`,
          time: time,
          format: format,
          title: topic,
          content_idea: `Conteúdo mostrando como ${offer} resolve problemas específicos de ${audience}, com foco em resultados práticos e implementação rápida.`,
          status: "planejado",
          details: {
            tool_suggestion: format === "reels" ? "CapCut" : "Canva",
            step_by_step: stepByStep,
            script_or_copy: scriptCopy,
            hashtags: `#${offer.replace(/\s+/g, '')} #${audience.replace(/\s+/g, '')} #marketingdigital #estrategia #resultados #crescimento #socialmedia`,
            creative_guidance: {
              type: format === "reels" ? "vídeo" : "imagem",
              description: `${format === "reels" ? "Vídeo curto" : format === "carrossel" ? "Sequência de slides" : "Imagem única"} profissional mostrando ${topic} com elementos visuais atraentes, cores da marca e texto destacado em pontos-chave.`,
              prompt: `Criar ${format} profissional sobre ${topic} para Instagram, com estética moderna, alta qualidade e elementos que destacam os benefícios de ${offer} para ${audience}.`,
              tool_link: format === "reels" ? "https://www.capcut.com" : "https://canva.com"
            }
          }
        });
      } else {
        // Dia sem postagem - atividade alternativa
        const activities = [
          {
            title: "📊 Análise de Métricas",
            idea: "Revisar engajamento, alcance e conversões dos posts anteriores",
            steps: "1. Analisar métricas de alcance e engajamento 2. Identificar padrões de sucesso 3. Documentar aprendizados 4. Ajustar estratégia"
          },
          {
            title: "🔍 Pesquisa de Concorrência",
            idea: `Estudar estratégias de outros perfis no nicho de ${offer}`,
            steps: "1. Identificar 5 concorrentes principais 2. Analisar posts mais engajados 3. Listar diferenciais competitivos 4. Identificar oportunidades"
          },
          {
            title: "💬 Engajamento com Audiência",
            idea: "Responder comentários e DMs, interagir com seguidores",
            steps: "1. Responder todos os comentários pendentes 2. Verificar e responder DMs 3. Engajar em perfis relevantes 4. Salvar perguntas frequentes para conteúdo"
          },
          {
            title: "📝 Planejamento de Conteúdo",
            idea: `Preparar roteiros e ideias sobre ${offer} para próxima semana`,
            steps: "1. Revisar calendário 2. Brainstorming de novos tópicos 3. Criar roteiros para próximos posts 4. Organizar banco de ideias"
          },
          {
            title: "🎨 Criação em Lote",
            idea: "Preparar imagens, templates e edições para próximos posts",
            steps: "1. Selecionar elementos visuais 2. Criar templates consistentes 3. Editar em lote materiais visuais 4. Organizar banco de mídia"
          }
        ];

        const activity = activities[i % activities.length];

        content_plan.push({
          day: `Dia ${i}`,
          time: "Flexível",
          format: "atividade",
          title: activity.title,
          content_idea: activity.idea,
          status: "planejado",
          details: {
            tool_suggestion: activity.title.includes("Métricas") ? "Instagram Insights" :
                            activity.title.includes("Pesquisa") ? "Instagram Explore" :
                            activity.title.includes("Engajamento") ? "Instagram App" :
                            activity.title.includes("Criação") ? "Canva" : "Notion",
            step_by_step: activity.steps,
            script_or_copy: "Atividade interna - sem conteúdo publicado",
            hashtags: "-",
            creative_guidance: {
              type: "atividade",
              description: activity.idea,
              prompt: "-",
              tool_link: activity.title.includes("Métricas") ? "https://business.instagram.com" : "https://instagram.com"
            }
          }
        });
      }
    }

    return { content_plan: sanitizeContentPlan(content_plan) };
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
    if (!identity) {
      throw new Error("Usuário não autenticado.");
    }

    // Gerar plano de conteúdo
    const contentPlanResult = await generateContentPlan(
      args.username,
      args.offer,
      args.audience,
      args.planDuration
    );

    // Sanitizar novamente para garantir que não há campos extras e valores inválidos
    // Passar offer e audience para melhorar conteúdo genérico
    const sanitizedPlan = sanitizeContentPlan(
      contentPlanResult.content_plan,
      args.offer,
      args.audience
    );

    // Verificação adicional de segurança - mostrar valores do campo status no log
    console.log("Status values check:", sanitizedPlan.map(item => item.status));

    // Montar dados finais
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

    // Salvar no banco
    await ctx.runMutation(internal.mentor.saveAnalysis, {
      analysisData
    });

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
    if (!identity) {
      throw new Error("Não autenticado.");
    }

    // Sanitizar novamente para garantir que não há valores inválidos
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
      content_plan: sanitizedPlan, // Usar o plano sanitizado
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

    // Sanitizar para garantir que não há campos extras e valores inválidos
    const sanitizedPlan = sanitizeContentPlan(newPlan, analysis.offer, analysis.audience);

    await ctx.db.patch(analysisId, {
      content_plan: sanitizedPlan,
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
      status, // Este status é validado pelos argumentos da função
      completedAt: status === "concluido" ? Date.now() : undefined
    };

    // Sanitizar para garantir que não há campos extras
    const sanitizedPlan = sanitizeContentPlan(contentPlan, analysis.offer, analysis.audience);

    await ctx.db.patch(analysisId, {
      content_plan: sanitizedPlan,
      updatedAt: Date.now()
    });

    return { success: true };
  }
});