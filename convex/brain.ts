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
// 2. CONFIGURAÇÃO ATUALIZADA COM MODELOS CORRETOS
// =================================================================

// Modelos disponíveis no Groq (atualizados)
const GROQ_MODELS = {
  primary: 'llama-3.3-70b-versatile',     // Modelo principal mais recente
  fallback: 'llama-3.1-70b-versatile',    // Fallback se o principal falhar
  fast: 'llama-3.1-8b-instant',           // Modelo rápido para respostas simples
  alternative: 'mixtral-8x7b-32768'       // Alternativa Mixtral
};

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

/**
 * Função de parse de JSON robusta
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

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Erro CRÍTICO ao parsear JSON:", error.message);
    } else {
      console.error("Erro CRÍTICO ao parsear JSON (tipo desconhecido):", error);
    }

    console.error("Texto Recebido da IA:", text);
    throw new Error("Falha ao parsear a resposta JSON da IA.");
  }
}

// Função para melhorar o prompt
function enhancePrompt(prompt: string, theme: string): string {
  return `
# MISSÃO CRÍTICA: CRIAR CONTEÚDO QUE TRANSFORME VIDAS E NEGÓCIOS

## TEMA: "${theme}"

## SEU PAPEL:
Você é um GÊNIO CRIATIVO que combina:
- Psicologia comportamental avançada
- Técnicas de storytelling de Hollywood
- Gatilhos mentais comprovados cientificamente
- Estratégias de viralização do TikTok/Instagram
- Copywriting de conversão de 8 figuras

${prompt}

Agora, REVOLUCIONE o tema "${theme}" com conteúdo que vai MUDAR VIDAS! Me dê o resultado em formato JSON.
`;
}

// =================================================================
// 3. LÓGICA DE GERAÇÃO ATUALIZADA COM MÚLTIPLOS MODELOS
// =================================================================

async function generateWithGroq(theme: string): Promise<BrainResults> {
  const basePrompt = `
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
          { "slide_number": 1, "title": "CAPA MATADORA", "content": "Título principal + subtítulo que amplifica a promessa" },
          { "slide_number": 2, "title": "Passo 1", "content": "Conteúdo detalhado do passo 1" },
          { "slide_number": 3, "title": "Passo 2", "content": "Conteúdo detalhado do passo 2" },
          { "slide_number": 10, "title": "AÇÃO AGORA", "content": "CTA específico com próximo passo claro" }
        ],
        "cta_slide": "Transforme sua vida com ${theme} HOJE! Salve e compartilhe com quem precisa ver isso 🚀"
      }
    ],
    "image_posts": [
      {
        "idea": "Frase de impacto que PARA o scroll e gera reflexão profunda",
        "caption": "História pessoal emocionante (3-4 parágrafos) → Transição para lição universal → Lista de 3-5 insights práticos → Pergunta que gera engajamento → CTA claro com benefício → Hashtags estratégicas",
        "image_prompt": "Design minimalista impactante: fundo gradiente vibrante, tipografia bold sans-serif, hierarquia visual clara, proporção 1:1, estilo premium"
      }
    ],
    "story_sequences": [
      {
        "theme": "Diagnóstico Rápido: Descubra seu nível em ${theme}",
        "slides": [
          { "slide_number": 1, "type": "Text", "content": "🚨 ATENÇÃO: 87% das pessoas estão fazendo ${theme} ERRADO. Vamos descobrir se você é uma delas?" },
          { "slide_number": 2, "type": "Quiz", "content": "Você já tentou X e não funcionou?", "options": ["Sim, várias vezes", "Não, nunca tentei"] },
          { "slide_number": 6, "type": "Link", "content": "BÔNUS EXCLUSIVO 24H: Baixe meu guia gratuito '${theme} Descomplicado' → Link na bio! 🎁" }
        ]
      }
    ]
  }
}`;

  const prompt = enhancePrompt(basePrompt, theme);

  // Lista de modelos para tentar em ordem
  const modelsToTry = [
    GROQ_MODELS.primary,
    GROQ_MODELS.fallback,
    GROQ_MODELS.alternative,
    GROQ_MODELS.fast
  ];

  let lastError: unknown = null;

  // Tenta cada modelo em sequência
  for (const model of modelsToTry) {
    try {
      console.log(`🔄 Tentando gerar com modelo: ${model}...`);

      const response = await groq.chat.completions.create({
        model,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'Você é um GÊNIO do marketing de conteúdo viral. Crie conteúdo TRANSFORMADOR que gera resultados REAIS. Responda APENAS em formato JSON válido.'
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.9,
        max_tokens: 8000,
      });

      const resultText = response.choices[0]?.message?.content;
      if (!resultText) {
        throw new Error(`Modelo ${model} não retornou resultado válido`);
      }

      console.log(`✅ Sucesso com modelo: ${model}`);
      return parseAiJsonResponse<BrainResults>(resultText);

    } catch (error) {
      console.error(`❌ Erro com modelo ${model}:`, error);
      lastError = error;

      // Se for erro de modelo descontinuado, tenta o próximo
      if (error instanceof Error && error.message.includes('decommissioned')) {
        console.log(`⚠️ Modelo ${model} foi descontinuado, tentando próximo...`);
        continue;
      }

      // Para outros erros, também tenta o próximo modelo
      continue;
    }
  }

  // Se todos os modelos Groq falharem, tenta OpenAI
  if (openai) {
    try {
      console.log("🔄 Tentando gerar com OpenAI como fallback final...");
      return await generateWithOpenAI(theme);
    } catch (openaiError) {
      console.error("❌ Erro com OpenAI também:", openaiError);
    }
  }

  // Se tudo falhar, usa fallback estático
  console.error("❌ Todos os modelos falharam. Último erro:", lastError);
  throw new Error(`Falha ao gerar conteúdo com todos os modelos disponíveis`);
}

// Função de fallback com OpenAI
async function generateWithOpenAI(theme: string): Promise<BrainResults> {
  if (!openai) {
    throw new Error("OpenAI não está configurada.");
  }

  const prompt = `Crie um pacote completo de conteúdo para Instagram sobre "${theme}".

  Retorne um JSON com:
  - theme_summary: resumo estratégico do tema
  - target_audience_suggestion: público-alvo específico
  - content_pack com arrays de:
    - reels (mínimo 3)
    - carousels (mínimo 2)
    - image_posts (mínimo 3)
    - story_sequences (mínimo 2)

  Cada item deve seguir a estrutura específica de seu tipo.`;

  try {
    const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview', // Modelo mais recente
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

    return parseAiJsonResponse<BrainResults>(resultText);
  } catch (error) {
    console.error("Erro ao gerar com OpenAI:", error);
    return generateFallbackContent(theme);
  }
}

// Conteúdo de fallback melhorado
function generateFallbackContent(theme: string): BrainResults {
    return {
        theme_summary: `Estratégia revolucionária para dominar ${theme} e se destacar no mercado`,
        target_audience_suggestion: `Profissionais e empreendedores que buscam resultados rápidos e sustentáveis em ${theme}`,
        content_pack: {
            reels: [
                {
                    title: `3 erros fatais em ${theme} que destroem seus resultados`,
                    hook: `Se você está fazendo isso em ${theme}, pare AGORA! O #2 é chocante...`,
                    main_points: [
                        "Erro #1: Focar apenas em táticas sem estratégia",
                        "Erro #2: Ignorar a psicologia do seu público",
                        "Erro #3: Não medir os resultados corretos"
                    ],
                    cta: "Salve este post e comece a aplicar HOJE! Comenta 'EU' se você já cometeu algum desses erros"
                }
            ],
            carousels: [
                {
                    title: `5 passos para dominar ${theme} em 30 dias`,
                    slides: [
                        { slide_number: 1, title: "TRANSFORME SEU NEGÓCIO", content: `${theme} nunca mais será um problema` },
                        { slide_number: 2, title: "Passo 1: Fundamentos", content: "Entenda os princípios básicos que 90% ignora" },
                        { slide_number: 3, title: "Passo 2: Estratégia", content: "Monte seu plano de ação personalizado" },
                        { slide_number: 4, title: "Passo 3: Execução", content: "Implemente com o método comprovado" },
                        { slide_number: 5, title: "Passo 4: Otimização", content: "Ajuste fino para resultados máximos" },
                        { slide_number: 6, title: "Passo 5: Escala", content: "Multiplique seus resultados" },
                        { slide_number: 7, title: "AÇÃO IMEDIATA", content: "Comece HOJE! Salve este post e compartilhe com quem precisa" }
                    ],
                    cta_slide: "Transforme sua realidade com estes 5 passos! 🚀"
                }
            ],
            image_posts: [
                {
                    idea: `"O sucesso em ${theme} não é sobre talento, é sobre sistema"`,
                    caption: `Descobri isso da pior forma possível...\n\nDurante anos, achei que ${theme} era questão de dom natural. Até que percebi: os melhores não são os mais talentosos, são os mais sistemáticos.\n\n3 insights que mudaram tudo:\n\n1. Consistência > Perfeição\n2. Sistema > Inspiração\n3. Progresso > Resultado\n\nE você, ainda está esperando inspiração ou já está construindo seu sistema?\n\n#${theme.replace(/\s+/g, '')} #marketing #sucesso`,
                    image_prompt: "Quote minimalista com fundo gradiente roxo para azul, tipografia moderna bold, composição centralizada"
                }
            ],
            story_sequences: [
                {
                    theme: `Quiz: Qual seu nível em ${theme}?`,
                    slides: [
                        { slide_number: 1, type: "Text", content: `Vamos descobrir seu nível real em ${theme}! Responda com sinceridade...` },
                        { slide_number: 2, type: "Quiz", content: "Com que frequência você pratica?", options: ["Diariamente", "Semanalmente", "Raramente"] },
                        { slide_number: 3, type: "Poll", content: "Qual sua maior dificuldade?", options: ["Começar", "Manter consistência"] },
                        { slide_number: 4, type: "Q&A", content: "Me conta: qual seu maior desafio?" },
                        { slide_number: 5, type: "Link", content: "Baixe o guia completo GRÁTIS! Link na bio 🎁" }
                    ]
                }
            ]
        }
    };
}

// =================================================================
// 4. ACTIONS PRINCIPAIS ATUALIZADAS
// =================================================================

export const generateContentIdeas = action({
  args: {
    theme: v.string(),
    model: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Usuário não autenticado");
    }

    if (!args.theme || args.theme.trim().length < 3) {
      throw new Error("Por favor, forneça um tema válido com pelo menos 3 caracteres");
    }

    try {
      console.log(`🚀 Gerando campanha revolucionária para: "${args.theme}"...`);
      const results = await generateWithGroq(args.theme);
      console.log("✅ Sucesso ao gerar e processar conteúdo transformador.");

      if (!results.content_pack || !results.content_pack.reels) {
        throw new Error("Estrutura de resultados da IA está inválida");
      }

      return results;
    } catch (error) {
      console.error("❌ Erro final na geração de conteúdo, usando fallback estático:", error);
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

    const prompt = `
# MISSÃO: Gerar uma mensagem de prospecção profissional e original.

## REGRAS CRÍTICAS:
1. **IDIOMA:** A mensagem DEVE SER 100% em Português do Brasil
2. **ORIGINALIDADE:** Crie um texto único e personalizado
3. **FORMATO:** Retorne um JSON com "title" e "content"

## DADOS:
- Tipo de Mensagem: ${messageType}
- Público Alvo: ${businessType}
- Instrução: ${customization || "Mensagem padrão"}

## ESTRUTURA JSON:
{
  "title": "Assunto curto e atrativo",
  "content": "Corpo da mensagem completo e persuasivo",
  "businessType": "${businessType}",
  "messageType": "${messageType}"
}`;

    try {
      // Tenta com Groq primeiro usando o modelo rápido
      if (process.env.GROQ_API_KEY) {
        try {
          const response = await groq.chat.completions.create({
            model: GROQ_MODELS.fast, // Usa modelo rápido para mensagens
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'system',
                content: 'Você é um copywriter B2B especialista em prospecção. Responda APENAS em JSON válido com textos em Português do Brasil.'
              },
              { role: 'user', content: prompt },
            ],
            temperature: 0.8,
          });

          const resultText = response.choices[0]?.message?.content;
          if (resultText) {
            return parseAiJsonResponse(resultText);
          }
        } catch (groqError) {
          console.error("Erro com Groq, tentando OpenAI:", groqError);
        }
      }

      // Fallback para OpenAI
      if (openai) {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: 'Você é um copywriter B2B. Responda em JSON com textos em Português do Brasil.'
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.8,
        });

        const resultText = response.choices[0]?.message?.content;
        if (resultText) {
          return parseAiJsonResponse(resultText);
        }
      }

      throw new Error("Nenhuma API disponível");

    } catch (error) {
      console.error("Erro ao gerar mensagem:", error);
      return {
        title: `Proposta para ${businessType}`,
        content: `Olá! Gostaria de apresentar uma solução que pode ajudar seu negócio. Podemos conversar?`,
        businessType,
        messageType
      };
    }
  },
});