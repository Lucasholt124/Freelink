// convex/brain.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from 'openai';

// =================================================================
// 1. ESTRUTURAS DE DADOS (NOMES PADRONIZADOS EM INGLÊS)
// =================================================================

interface ReelContent {
  title: string;
  hook: string;
  main_points: string[];
  cta: string;
  visual_suggestion: string;
  audio_suggestion: string;
}

interface CarouselContent {
  title: string;
  slides: {
    slide_number: number;
    title: string;
    content: string;
  }[];
  cta_slide: string;
  design_tips: string[];
}

interface ImagePostContent {
  idea: string;
  caption: string;
  image_prompt: string;
  hashtags: string[];
  best_time: string;
}

interface StorySequenceContent {
  theme: string;
  slides: {
    slide_number: number;
    type: "Poll" | "Quiz" | "Q&A" | "Link" | "Text"; // Tipos em Inglês
    content: string;
    options?: string[];
  }[];
  engagement_tips: string[];
}

// *** CORREÇÃO AQUI ***
// Nomes das propriedades em Inglês para bater com o frontend
interface BrainResults {
  theme_summary: string;
  target_audience_suggestion: string;
  content_pack: {
    reels: ReelContent[];
    carousels: CarouselContent[]; // Corrigido
    image_posts: ImagePostContent[]; // Corrigido
    story_sequences: StorySequenceContent[]; // Corrigido
  };
  viral_strategy: {
    best_times: string[];
    hashtag_strategy: string;
    engagement_hacks: string[];
  };
}

// =================================================================
// 2. CONFIGURAÇÃO DE MODELOS
// =================================================================

const GROQ_MODELS = {
  primary: 'llama-3.3-70b-versatile',
  default: 'llama-3.1-70b-versatile',
  fallback: 'mixtral-8x7b-32768',
  fast: 'llama-3.1-8b-instant',
};

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// =================================================================
// 3. PARSER JSON
// =================================================================

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

// =================================================================
// 4. PROMPT APRIMORADO E LÓGICA DE GERAÇÃO
// =================================================================

function enhancePrompt(prompt: string, theme: string): string {
  return `
# MISSÃO CRÍTICA: GERAR UMA CAMPANHA DE CONTEÚDO COMPLETA E VENCEDORA

## TEMA: "${theme}"

## SEU PAPEL:
Você é o "FreelinkBrain", um estrategista de marketing digital lendário. Você não dá "dicas", você entrega ESTRATÉGIAS PRONTAS. Seu objetivo é fazer o usuário dominar o tráfego orgânico sobre este tema.

${prompt}

Execute a missão. Gere o JSON completo e perfeito para o tema: "${theme}".
`;
}

async function generateWithGroq(theme: string): Promise<BrainResults> {
  const basePrompt = `
## MINDSET OBRIGATÓRIO:
1. **VALOR EXTREMO**: Cada peça deve ser tão boa que poderia ser vendida.
2. **EMOÇÃO PROFUNDA**: O conteúdo deve gerar esperança, urgência ou curiosidade.
3. **AÇÃO IMEDIATA**: Cada post deve ter um CTA claro e forte.
4. **COMPARTILHÁVEL**: O conteúdo deve fazer o usuário parecer inteligente ao compartilhá-lo.

## ESTRUTURA JSON OBRIGATÓRIA (DEVOLVA APENAS O JSON):
{
  "theme_summary": "Um ângulo único e provocativo para abordar o tema '${theme}'",

  "target_audience_suggestion": "Um ÚNICO PARÁGRAFO de texto descrevendo a persona ideal (dores, desejos, onde está). DEVE ser uma string, NÃO um objeto.",

  "content_pack": {
    "reels": [
      {
        "title": "Título magnético para o Reel",
        "hook": "Gancho de 3 segundos que paralisa o scroll (ex: 'Você está fazendo X errado')",
        "main_points": [
          "Ponto 1: A revelação/mito quebrado",
          "Ponto 2: A solução prática",
          "Ponto 3: O benefício/transformação"
        ],
        "cta": "CTA forte (ex: 'Comente 'EU QUERO' para receber o guia')",
        "visual_suggestion": "Descrição de 1-2 frases do B-roll (ex: 'Close no rosto, depois B-roll trabalhando no notebook')",
        "audio_suggestion": "Sugestão de áudio (ex: 'Áudio em alta: 'Nome da Música' ou 'Voz motivacional sobreposta')"
      }
      // ... (gere pelo menos 3 reels)
    ],
    "carousels": [
      {
        "title": "Título para Carrossel (ex: '5 Passos Infalíveis para X')",
        "slides": [
          { "slide_number": 1, "title": "CAPA (Hook Visual)", "content": "Título principal + Subtítulo de promessa" },
          { "slide_number": 2, "title": "Passo 1", "content": "Conteúdo denso e prático do passo 1" },
          { "slide_number": 6, "title": "CTA FINAL", "content": "Chamada para ação clara (Salvar, Compartilhar, Comentar)" }
        ],
        "cta_slide": "Não se esqueça: Salve este post para consultar depois e compartilhe com quem precisa!",
        "design_tips": ["Use fontes legíveis (ex: Montserrat Bold)", "Contraste alto entre fundo e texto", "Use um elemento gráfico (seta, ícone) em cada slide"]
      }
      // ... (gere pelo menos 2 carousels)
    ],
    "image_posts": [
      {
        "idea": "Ideia central do post (ex: 'Frase de impacto sobre ${theme}')",
        "caption": "Legenda completa: Hook + História/Contexto + 3-5 Tópicos Práticos + Pergunta de Engajamento + CTA",
        "image_prompt": "Prompt detalhado para DALL-E/Midjourney (ex: 'foto minimalista, fundo roxo, objeto X no centro, luz de estúdio, 4k')",
        "hashtags": ["#estrategia1", "#nicho", "#viral", "#${theme.replace(/\s+/g, '')}"],
        "best_time": "Ex: 11:45h (Pico de almoço) ou 20:15h (Pico noturno)"
      }
      // ... (gere pelo menos 3 image_posts)
    ],
    "story_sequences": [
      {
        "theme": "Sequência Interativa (ex: 'Diagnóstico Rápido sobre ${theme}')",
        "slides": [
          { "slide_number": 1, "type": "Text", "content": "Hook inicial (ex: '🚨 90% das pessoas erram nisso...')" },
          { "slide_number": 2, "type": "Quiz", "content": "Pergunta 1 (diagnóstico)", "options": ["Opção A", "Opção B"] },
          { "slide_number": 3, "type": "Poll", "content": "Pergunta 2 (engajamento)", "options": ["Sim", "Não"] },
          { "slide_number": 4, "type": "Q&A", "content": "Abra para dúvidas: 'Qual sua maior dificuldade em ${theme}?'" },
          { "slide_number": 5, "type": "Link", "content": "CTA Final: 'Clique aqui para [AÇÃO]!' (Link na bio)" }
        ],
        "engagement_tips": ["Use a figurinha 'Adicione o seu'", "Marque um criador parceiro", "Poste a sequência nos Melhores Amigos primeiro"]
      }
      // ... (gere pelo menos 2 story_sequences)
    ]
  },
  "viral_strategy": {
    "best_times": ["11h-13h (Almoço)", "19h-21h (Pós-jantar)"],
    "hashtag_strategy": "Use a regra 5/3/2: 5 hashtags de nicho (baixa concorrência), 3 de volume médio (relacionadas ao tema), 2 virais (alta concorrência, ex: #fyp)",
    "engagement_hacks": [
      "Responda TODOS os comentários na primeira hora com outra pergunta",
      "Faça um 'post-bomba': peça para todos comentarem uma palavra-chave específica",
      "Use CTAs de salvamento (ex: 'Salve para não perder')"
    ]
  }
}
`;

  const prompt = enhancePrompt(basePrompt, theme);

  const modelsToTry = [
    GROQ_MODELS.primary,
    GROQ_MODELS.fallback,
    GROQ_MODELS.fast
  ];

  let lastError: unknown = null;

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
      continue;
    }
  }

  if (openai) {
    try {
      console.log("🔄 Tentando gerar com OpenAI como fallback final...");
      return await generateWithOpenAI(theme);
    } catch (openaiError) {
      console.error("❌ Erro com OpenAI também:", openaiError);
    }
  }

  console.error("❌ Todos os modelos falharam. Usando fallback estático. Último erro:", lastError);
  return generateFallbackContent(theme);
}

// Fallback do OpenAI (mantido)
async function generateWithOpenAI(theme: string): Promise<BrainResults> {
  if (!openai) {
    throw new Error("OpenAI não está configurada.");
  }
  // No caso de falha, usar o fallback estático
  return generateFallbackContent(theme);
}

// *** CORREÇÃO AQUI ***
// Fallback estático APRIMORADO com os nomes de campos CORRETOS (Inglês)
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
                    cta: "Salve este post e comece a aplicar HOJE! Comenta 'EU' se você já cometeu algum desses erros",
                    visual_suggestion: "Close no rosto falando, com B-roll rápido mostrando gráficos de resultados caindo.",
                    audio_suggestion: "Áudio em alta: 'som de alerta' + música de suspense."
                }
            ],
            carousels: [ // Corrigido
                {
                    title: `5 passos para dominar ${theme} em 30 dias`,
                    slides: [
                        { slide_number: 1, title: "TRANSFORME SEU NEGÓCIO", content: `${theme} nunca mais será um problema` }, // Corrigido
                        { slide_number: 2, title: "Passo 1: Fundamentos", content: "Entenda os princípios básicos que 90% ignora" }, // Corrigido
                        { slide_number: 3, title: "Passo 2: Estratégia", content: "Monte seu plano de ação personalizado" }, // Corrigido
                        { slide_number: 6, title: "AÇÃO IMEDIATA", content: "Comece HOJE! Salve este post e compartilhe com quem precisa" }
                    ],
                    cta_slide: "Transforme sua realidade com estes 5 passos! 🚀",
                    design_tips: ["Use sua cor de marca principal em todos os slides", "Fonte grande na capa", "Use setas para guiar a leitura"]
                }
            ],
            image_posts: [ // Corrigido
                {
                    idea: `"O sucesso em ${theme} não é sobre talento, é sobre sistema"`,
                    caption: `Descobri isso da pior forma possível...\n\nDurante anos, achei que ${theme} era questão de dom natural. Até que percebi: os melhores não são os mais talentosos, são os mais sistemáticos.\n\n3 insights que mudaram tudo:\n\n1. Consistência > Perfeição\n2. Sistema > Inspiração\n3. Progresso > Resultado\n\nE você, ainda está esperando inspiração ou já está construindo seu sistema?\n\n#${theme.replace(/\s+/g, '')} #marketing #sucesso #consistencia #sistemas`,
                    image_prompt: "Quote minimalista com fundo gradiente roxo para azul, tipografia moderna bold, composição centralizada",
                    best_time: "19:30h (Horário nobre)",
                    hashtags: [`#${theme.replace(/\s+/g, '')}`, "#marketing", "#sucesso", "#sistemas"]
                }
            ],
            story_sequences: [ // Corrigido
                {
                    theme: `Quiz: Qual seu nível em ${theme}?`,
                    slides: [
                        { slide_number: 1, type: "Text", content: `Vamos descobrir seu nível real em ${theme}! Responda com sinceridade...` },
                        { slide_number: 2, type: "Quiz", content: "Com que frequência você pratica?", options: ["Diariamente", "Semanalmente", "Raramente"] },
                        { slide_number: 5, type: "Link", content: "Baixe o guia completo GRÁTIS! Link na bio 🎁" }
                    ],
                    engagement_tips: ["Use a figurinha 'Adicione o seu' no slide 4", "Reposte os melhores resultados do quiz"]
                }
            ]
        },
        viral_strategy: {
          best_times: ["12:00h", "20:00h"],
          hashtag_strategy: "Use 3 hashtags de nicho, 2 de volume médio, 1 viral",
          engagement_hacks: ["Responda comentários com perguntas", "Faça CTA para salvar o post"]
        }
    };
}

// =================================================================
// 5. ACTIONS PRINCIPAIS
// =================================================================

export const generateContentIdeas = action({
  args: {
    theme: v.string(),
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
        console.error("Estrutura de resultados da IA está inválida, usando fallback", results);
        return generateFallbackContent(args.theme);
      }

      return results;
    } catch (error) {
      console.error("❌ Erro final na geração de conteúdo, usando fallback estático:", error);
      return generateFallbackContent(args.theme);
    }
  },
});

// Ação de Vendas DM (mantida)
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
# IDIOMA: 100% em Português do Brasil
# FORMATO: JSON com "title" e "content"
# DADOS:
- Tipo de Mensagem: ${messageType}
- Público Alvo: ${businessType}
- Instrução: ${customization || "Mensagem padrão"}
# ESTRUTURA JSON:
{
  "title": "Assunto curto e atrativo",
  "content": "Corpo da mensagem completo e persuasivo, usando psicologia de vendas (urgência, exclusividade, entusiasmo, 3 sims, controle com perguntas).",
  "businessType": "${businessType}",
  "messageType": "${messageType}"
}
`;

    try {
      // Tentar com Groq primeiro
      if (process.env.GROQ_API_KEY) {
        try {
          const response = await groq.chat.completions.create({
            model: GROQ_MODELS.fast, // Usar modelo rápido para isso
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
          model: 'gpt-4-turbo-preview', // Usar um modelo bom para copy
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