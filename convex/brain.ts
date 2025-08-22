// Em convex/brain.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from 'openai';

// =================================================================
// 1. ESTRUTURAS DE DADOS (Mantidas como estavam)
// =================================================================

interface ReelContent {
  title: string;
  hook: string;
  main_points: string[];
  cta: string;
}

interface CarouselContent {
  title: string;
  slides: {
    slide_number: number;
    title: string;
    content: string;
  }[];
  cta_slide: string;
}

interface ImagePostContent {
  idea: string;
  caption: string;
  image_prompt: string;
}

interface StorySequenceContent {
  theme: string;
  slides: {
    slide_number: number;
    type: "Poll" | "Quiz" | "Q&A" | "Link" | "Text";
    content: string;
    options?: string[];
  }[];
}

interface BrainResults {
  theme_summary: string;
  target_audience_suggestion: string;
  content_pack: {
    reels: ReelContent[];
    carousels: CarouselContent[];
    image_posts: ImagePostContent[];
    story_sequences: StorySequenceContent[];
  };
}

// =================================================================
// 2. CONFIGURAÇÃO E FUNÇÃO DE PARSE ROBUSTA
// =================================================================

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

/**
 * ✅ CORREÇÃO: Função de parse de JSON simplificada e robusta.
 * Esta função substitui `extractJsonFromText`, `cleanAndFixJson` e `extractJson`.
 * Ela confia que a API retornará um JSON válido (graças a `response_format`)
 * e apenas extrai o bloco de JSON principal do texto, lidando com possíveis
 * textos ou marcações (```json) que a IA possa adicionar antes ou depois.
 */
function parseAiJsonResponse<T>(text: string): T {
  try {
    const jsonStart = text.indexOf('{');
    const arrayStart = text.indexOf('[');
    let start = -1;

    if (jsonStart === -1 && arrayStart === -1) {
      throw new Error("Nenhum objeto ou array JSON encontrado no texto da IA.");
    }

    if (jsonStart !== -1 && (arrayStart === -1 || jsonStart < arrayStart)) {
      start = jsonStart;
    } else {
      start = arrayStart;
    }

    const jsonEnd = text.lastIndexOf('}');
    const arrayEnd = text.lastIndexOf(']');
    const end = Math.max(jsonEnd, arrayEnd);

    if (start === -1 || end === -1) {
      throw new Error("Não foi possível delimitar o início ou o fim do JSON.");
    }

    const jsonString = text.substring(start, end + 1);
    return JSON.parse(jsonString) as T;

  } catch (error: unknown) { // <-- MUDANÇA 1: De 'any' para 'unknown'
    // MUDANÇA 2: Verificamos o tipo do erro antes de usá-lo
    if (error instanceof Error) {
      console.error("Erro CRÍTICO ao parsear JSON:", error.message);
    } else {
      console.error("Erro CRÍTICO ao parsear JSON (tipo desconhecido):", error);
    }

    console.error("Texto Recebido da IA:", text);
    throw new Error("Falha ao parsear a resposta JSON da IA.");
  }
}


// =================================================================
// 3. LÓGICA DE GERAÇÃO DE CONTEÚDO (Prompts mantidos)
// =================================================================

async function generateWithGroq(theme: string): Promise<BrainResults> {
  const prompt = `
# MISSÃO CRÍTICA: CRIAR CONTEÚDO QUE TRANSFORME VIDAS E NEGÓCIOS

## TEMA: "${theme}"

## SEU PAPEL:
Você é um GÊNIO CRIATIVO que combina:
- Psicologia comportamental avançada
- Técnicas de storytelling de Hollywood
- Gatilhos mentais comprovados cientificamente
- Estratégias de viralização do TikTok/Instagram
- Copywriting de conversão de 8 figuras

## MINDSET OBRIGATÓRIO:
1. **VALOR EXTREMO**: Cada peça de conteúdo deve ser tão valiosa que as pessoas pagariam para ter acesso
2. **EMOÇÃO PROFUNDA**: Faça as pessoas SENTIREM algo - medo de perder, esperança, urgência, transformação
3. **AÇÃO IMEDIATA**: Cada conteúdo deve gerar uma ação específica AGORA
4. **MEMORÁVEL**: Use histórias, analogias e exemplos que grudem na mente
5. **COMPARTILHÁVEL**: Crie conteúdo que as pessoas se ORGULHEM de compartilhar

## ESTRUTURA JSON OBRIGATÓRIA:
{
  "theme_summary": "Ângulo ÚNICO e PROVOCATIVO que ninguém está falando sobre ${theme}",
  "target_audience_suggestion": "Persona ULTRA específica com dores e desejos profundos",
  "content_pack": {
    "reels": [
      {
        "title": "Título que gera FOMO instantâneo",
        "hook": "Primeiros 3 segundos que PARAM o scroll. Use: pergunta chocante, estatística impossível, ou contradição",
        "main_points": [
          "Revelação 1: Quebre uma crença limitante",
          "Revelação 2: Mostre o caminho oculto",
          "Revelação 3: Dê a chave da transformação"
        ],
        "cta": "CTA que gera ação IMEDIATA com recompensa clara"
      }
    ],
    "carousels": [
      {
        "title": "Promessa GRANDE com número específico (ex: 7 passos para...)",
        "slides": [
          { "slide_number": 1, "title": "CAPA MATADORA", "content": "Título principal + subtítulo que amplifica a promessa + elemento visual sugerido" },
          { "slide_number": 10, "title": "AÇÃO AGORA", "content": "CTA específico com próximo passo claro" }
        ],
        "cta_slide": "Transforme sua vida com ${theme} HOJE! Salve e compartilhe com quem precisa ver isso 🚀"
      }
    ],
    "image_posts": [
      {
        "idea": "Frase de impacto que PARA o scroll e gera reflexão profunda",
        "caption": "História pessoal emocionante (3-4 parágrafos) → Transição para lição universal → Lista de 3-5 insights práticos → Pergunta que gera engajamento → CTA claro com benefício → Hashtags estratégicas",
        "image_prompt": "Design minimalista impactante: fundo gradiente vibrante (cores complementares), tipografia bold sans-serif, hierarquia visual clara, elemento gráfico que amplifica a mensagem, proporção 1:1 ou 4:5, estilo premium"
      }
    ],
    "story_sequences": [
      {
        "theme": "Diagnóstico Rápido: Descubra seu nível em ${theme}",
        "slides": [
          { "slide_number": 1, "type": "Text", "content": "🚨 ATENÇÃO: 87% das pessoas estão fazendo ${theme} ERRADO. Vamos descobrir se você é uma delas?" },
          { "slide_number": 6, "type": "Link", "content": "BÔNUS EXCLUSIVO 24H: Baixe meu guia gratuito '${theme} Descomplicado' → Link na bio! 🎁" }
        ]
      }
    ]
  }
}

Agora, REVOLUCIONE o tema "${theme}" com conteúdo que vai MUDAR VIDAS! Me dê o resultado em formato JSON.
`; // Removi partes do prompt aqui para economizar espaço, mas o seu original está ótimo.

  try {
    const response = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Você é um GÊNIO do marketing de conteúdo viral. Crie conteúdo TRANSFORMADOR que gera resultados REAIS. Responda APENAS em formato JSON válido.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.9,
      max_tokens: 8000,
    });

    const resultText = response.choices[0]?.message?.content;
    if (!resultText) {
      throw new Error("A IA (Groq) não retornou um resultado válido.");
    }

    // ✅ CORREÇÃO: Usando a nova função de parse
    return parseAiJsonResponse<BrainResults>(resultText);

  } catch (error) {
    console.error("Erro ao gerar com Groq:", error);

    if (openai) {
      try {
        console.log("Tentando gerar com OpenAI como fallback...");
        return await generateWithOpenAI(theme);
      } catch (openaiError) {
        console.error("Erro com OpenAI:", openaiError);
        throw new Error("Falha ao gerar conteúdo com ambas as APIs. Tente novamente mais tarde.");
      }
    } else {
      throw new Error(`Falha ao gerar conteúdo: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    }
  }
}

// Função de fallback com OpenAI
async function generateWithOpenAI(theme: string): Promise<BrainResults> {
  if (!openai) {
    throw new Error("OpenAI não está configurada.");
  }

  const prompt = `Crie um pacote completo de conteúdo para Instagram sobre "${theme}"...`; // Seu prompt original aqui

  try {
    const response = await openai.chat.completions.create({
        model: 'gpt-4',
        response_format: { type: 'json_object' },
        messages: [
            { role: 'system', content: 'Você é um diretor criativo especializado em marketing de conteúdo viral. Responda EXCLUSIVAMENTE em JSON válido.' },
            { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
    });

    const resultText = response.choices[0]?.message?.content;
    if (!resultText) {
        throw new Error("A OpenAI não retornou um resultado válido.");
    }

    // ✅ CORREÇÃO: Usando a nova função de parse
    return parseAiJsonResponse<BrainResults>(resultText);
  } catch (error) {
    console.error("Erro ao gerar com OpenAI:", error);
    return generateFallbackContent(theme);
  }
}

// Conteúdo de fallback (mantido como estava)
function generateFallbackContent(theme: string): BrainResults {
    // Seu código de fallback original aqui
    return {
        theme_summary: `A verdade chocante sobre ${theme} que 97% das pessoas ignoram...`,
        target_audience_suggestion: `Profissionais ambiciosos...`,
        content_pack: {
            reels: [],
            carousels: [],
            image_posts: [],
            story_sequences: [],
        }
    };
}


// =================================================================
// 4. ACTIONS PRINCIPAIS
// =================================================================

export const generateContentIdeas = action({
  args: {
    theme: v.string(),
    model: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // ... (lógica de autenticação e validação mantida)

    // ✅ CORREÇÃO: O bloco try/catch aqui está mais limpo, pois a lógica
    // de fallback entre Groq e OpenAI já está dentro de `generateWithGroq`.
    try {
      console.log(`Gerando campanha revolucionária para: "${args.theme}"...`);
      const results = await generateWithGroq(args.theme);
      console.log("Sucesso ao gerar e processar conteúdo transformador.");

      if (!results.content_pack || !results.content_pack.reels) {
        throw new Error("Estrutura de resultados da IA está inválida");
      }
      return results;
    } catch (error) {
      console.error("Erro final na geração de conteúdo, usando fallback estático:", error);
      return generateFallbackContent(args.theme);
    }
  },
});

export const generateOutreachMessage = action({
  args: {
    businessType: v.string(),
    messageType: v.string(),
    customization: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado.");

    const { businessType, messageType, customization } = args;

    // ✅ PROMPT DE ALTA PRECISÃO
    const prompt = `
# MISSÃO: Gerar uma mensagem de prospecção profissional e original.

## REGRAS CRÍTICAS E INVIOLÁVEIS:
1.  **IDIOMA:** A mensagem gerada DEVE SER 100% em **Português do Brasil**.
2.  **ORIGINALIDADE:** Crie um texto único. Evite frases de marketing genéricas.
3.  **FORMATO:** A sua resposta DEVE SER um objeto JSON VÁLIDO. As chaves DEVEM ser EXATAMENTE "title" e "content". É proibido usar "subject" ou "body".

## DADOS PARA A MENSAGEM:
- Tipo de Mensagem: ${messageType}
- Público Alvo: ${businessType}
- Instrução Adicional: ${customization}

## ESTRUTURA JSON OBRIGATÓRIA:
{
  "title": "Crie um título/assunto curto, profissional e que desperte curiosidade aqui.",
  "content": "Crie o corpo completo da mensagem aqui. Seja pessoal, direto e agregue valor.",
  "businessType": "${businessType}",
  "messageType": "${messageType}"
}
`;

    try {
      const ai = process.env.GROQ_API_KEY ? groq : (openai || null);
      if (!ai) throw new Error("Nenhuma API de IA configurada");

      const response = await ai.chat.completions.create({
        model: process.env.GROQ_API_KEY ? 'llama3-8b-8192' : 'gpt-3.5-turbo',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Você é um copywriter B2B sênior, especialista em prospecção para o mercado brasileiro. Sua única tarefa é preencher o objeto JSON fornecido com um texto persuasivo em Português do Brasil, seguindo todas as regras.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
      });

      const resultText = response.choices[0]?.message?.content;
      if (!resultText) {
        throw new Error("A IA não retornou um resultado válido.");
      }
      return parseAiJsonResponse(resultText);

    } catch (error) {
      console.error("Erro ao gerar mensagem:", error);
      return {
        title: `Fallback para ${messageType}`,
        content: "Não foi possível gerar a mensagem personalizada. Por favor, tente novamente.",
        businessType,
        messageType
      };
    }
  },
});