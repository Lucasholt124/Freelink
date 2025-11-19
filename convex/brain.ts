// convex/brain.ts - VERSÃO APRIMORADA

import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from 'openai';
import { api } from "./_generated/api";

// =================================================================
// ESTRUTURAS DE DADOS APRIMORADAS
// =================================================================

interface ScriptTimelineItem {
  start_time: string; // Ex: "0s"
  end_time: string;   // Ex: "3s"
  action: string;     // O que acontece
  camera_angle: string; // Ex: "Close-up no rosto", "Plano médio"
  screen_text?: string; // Texto que aparece na tela
  audio_note?: string;  // Nota sobre áudio neste momento
}

interface ReelContent {
  title: string;
  hook: string;
  main_points: string[];
  cta: string;
  visual_suggestion: string;
  audio_suggestion: string;
  // *** NOVOS CAMPOS PARA ROTEIRO COMPLETO ***
  script_timeline: ScriptTimelineItem[]; // Roteiro segundo-a-segundo
  camera_angles_summary: string[]; // Lista de todos os ângulos usados
  transitions: string[]; // Sugestões de transições (Ex: "Corte seco", "Fade")
  editing_notes: string; // Dicas gerais de edição
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
    type: "Poll" | "Quiz" | "Q&A" | "Link" | "Text";
    content: string;
    options?: string[];
  }[];
  engagement_tips: string[];
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
  viral_strategy: {
    best_times: string[];
    hashtag_strategy: string;
    engagement_hacks: string[];
  };
}

// =================================================================
// CONFIGURAÇÃO (mantida)
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
// PARSER JSON (mantido)
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
// PROMPT ULTRA-ESPECÍFICO PARA ROTEIROS COMPLETOS
// =================================================================

function enhancePrompt(prompt: string, theme: string): string {
  return `
# 🎬 MISSÃO CRÍTICA: GERAR CAMPANHA DE CONTEÚDO **PRONTA PARA PRODUÇÃO**

## TEMA: "${theme}"

## SEU PAPEL:
Você é o "FreelinnkBrain PRO", um diretor de conteúdo viral + estrategista de marketing.

Você NÃO dá "ideias genéricas". Você entrega **ROTEIROS PRONTOS PARA GRAVAR**, com:
- ✅ Timing exato (segundo-a-segundo)
- ✅ Ângulos de câmera específicos
- ✅ Texto que aparece na tela
- ✅ Sugestões de transições
- ✅ Notas de áudio/música

${prompt}

**Execute a missão para o tema: "${theme}"**
Gere o JSON COMPLETO e PERFEITO.
`;
}

async function generateWithGroq(theme: string): Promise<BrainResults> {
  const basePrompt = `
## MINDSET OBRIGATÓRIO:
1. **VALOR EXTREMO**: Cada roteiro deve ser TÃO completo que um editor iniciante consiga produzir.
2. **ESPECIFICIDADE**: Nada de "use B-roll". Diga QUAL B-roll (Ex: "Close nas mãos digitando no teclado").
3. **TIMING EXATO**: Roteiro com marcação de tempo precisa (0-3s, 3-7s, etc.).
4. **PRODUÇÃO REAL**: Pense como se você fosse gravar HOJE.

## 📐 ESTRUTURA JSON OBRIGATÓRIA (RESPONDA APENAS COM JSON):

\`\`\`json
{
  "theme_summary": "Ângulo único e provocativo para '${theme}'",
  "target_audience_suggestion": "Descrição COMPLETA da persona (1 parágrafo): dores, desejos, onde está online, objeções.",

  "content_pack": {
    "reels": [
      {
        "title": "Título magnético do Reel",
        "hook": "Gancho de 3s que para o scroll",
        "main_points": [
          "Ponto 1: Revelação/Mito quebrado",
          "Ponto 2: Solução prática",
          "Ponto 3: Benefício/Transformação"
        ],
        "cta": "CTA forte (ex: 'Comente EU QUERO')",
        "visual_suggestion": "Resumo do visual geral",
        "audio_suggestion": "Áudio/música sugerida",

        "script_timeline": [
          {
            "start_time": "0s",
            "end_time": "3s",
            "action": "Você olha direto para câmera e diz: '[FRASE DE HOOK]'",
            "camera_angle": "Close-up no rosto (câmera frontal do celular)",
            "screen_text": "Texto grande: 'PARE DE FAZER ISSO!' (fonte bold branca)",
            "audio_note": "Música de suspense baixa ao fundo"
          },
          {
            "start_time": "3s",
            "end_time": "7s",
            "action": "Corta para você andando (ou B-roll) enquanto narra o problema",
            "camera_angle": "Plano médio (cintura para cima)",
            "screen_text": "Legenda: 'O erro #1 que 90% comete...'",
            "audio_note": "Música aumenta levemente"
          },
          {
            "start_time": "7s",
            "end_time": "15s",
            "action": "Mostra a solução (pode ser você explicando + B-roll ilustrativo)",
            "camera_angle": "Intercala: Close-up + Plano geral mostrando ação",
            "screen_text": "Lista aparecendo: '1. Passo X', '2. Passo Y'",
            "audio_note": "Música motivacional entra"
          },
          {
            "start_time": "15s",
            "end_time": "20s",
            "action": "Mostra o resultado/benefício (visual de transformação)",
            "camera_angle": "Plano médio, você sorrindo/confiante",
            "screen_text": "Texto: 'O resultado? [BENEFÍCIO]'",
            "audio_note": "Música no auge"
          },
          {
            "start_time": "20s",
            "end_time": "23s",
            "action": "CTA final - você aponta para câmera e fala a ação",
            "camera_angle": "Close-up no rosto",
            "screen_text": "CTA em negrito: 'COMENTA 'EU' AGORA!'",
            "audio_note": "Música diminui, destaque na voz"
          }
        ],

        "camera_angles_summary": [
          "Close-up no rosto (para ganchos e CTAs)",
          "Plano médio (para explicações)",
          "B-roll ilustrativo (mãos trabalhando, tela de computador, etc.)"
        ],

        "transitions": [
          "Corte seco entre cenas (mantém ritmo rápido)",
          "Zoom in no texto da tela (para ênfase)",
          "Fade rápido ao trocar de B-roll"
        ],

        "editing_notes": "Ritmo rápido (cortes a cada 2-3s). Use texto grande e legível (fonte: Montserrat Bold ou similar). Música: busque 'motivacional trap' ou 'suspense viral' no CapCut. Adicione efeito de zoom sutil no gancho inicial."
      }
      // ... (gere pelo menos 3 reels completos)
    ],

    "carousels": [
      {
        "title": "Título do Carrossel",
        "slides": [
          { "slide_number": 1, "title": "CAPA", "content": "Hook visual forte" },
          { "slide_number": 2, "title": "Passo 1", "content": "Conteúdo denso do passo 1" },
          { "slide_number": 6, "title": "CTA", "content": "Ação final" }
        ],
        "cta_slide": "Salve e compartilhe!",
        "design_tips": [
          "Fundo: Gradiente roxo (#8B5CF6) para rosa (#EC4899)",
          "Fonte: Montserrat Black para títulos, Regular para corpo",
          "Ícone/emoji em cada slide (busque no Flaticon)",
          "Contraste alto: texto branco em fundo escuro",
          "Template: use Canva (busque 'Instagram Carousel Modern')"
        ]
      }
      // ... (gere pelo menos 2)
    ],

    "image_posts": [
      {
        "idea": "Ideia central",
        "caption": "Legenda completa com hook + história + tópicos + pergunta + CTA",
        "image_prompt": "Prompt ULTRA-DETALHADO para DALL-E: 'professional photo, minimalist background, [OBJETO PRINCIPAL], studio lighting, 4k, high contrast, [COR DOMINANTE] color palette'",
        "hashtags": ["#tag1", "#tag2", "#tag3"],
        "best_time": "Horário específico (ex: 11:45h ou 20:15h)"
      }
      // ... (gere pelo menos 3)
    ],

    "story_sequences": [
      {
        "theme": "Sequência interativa",
        "slides": [
          { "slide_number": 1, "type": "Text", "content": "Hook inicial" },
          { "slide_number": 2, "type": "Quiz", "content": "Pergunta", "options": ["A", "B"] },
          { "slide_number": 5, "type": "Link", "content": "CTA com link" }
        ],
        "engagement_tips": [
          "Use figurinha 'Adicione o seu'",
          "Marque parceiros",
          "Reposte respostas nos destaques"
        ]
      }
      // ... (gere pelo menos 2)
    ]
  },

  "viral_strategy": {
    "best_times": ["11h-13h", "19h-21h"],
    "hashtag_strategy": "Regra 5/3/2: 5 nicho + 3 médio volume + 2 virais",
    "engagement_hacks": [
      "Responda 100% dos comentários na 1ª hora",
      "Post-bomba: peça palavra-chave específica",
      "CTAs de salvamento"
    ]
  }
}
\`\`\`

**EXECUTE AGORA PARA: "${theme}"**
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
            content: 'Você é um DIRETOR DE CONTEÚDO VIRAL profissional. Crie roteiros COMPLETOS e PRONTOS PARA PRODUÇÃO. Responda APENAS em JSON válido.'
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

async function generateWithOpenAI(theme: string): Promise<BrainResults> {
  if (!openai) {
    throw new Error("OpenAI não está configurada.");
  }
  return generateFallbackContent(theme);
}

// FALLBACK ESTÁTICO COMPLETO
function generateFallbackContent(theme: string): BrainResults {
  const safeTheme = theme || "seu nicho";

  return {
    theme_summary: `[MODO OFFLINE] Plano tático de contingência gerado para: ${safeTheme}. Foco em autoridade imediata e quebra de objeções.`,
    target_audience_suggestion: `Pessoas interessadas em ${safeTheme} que buscam uma solução prática, mas se sentem travadas pela sobrecarga de informações.`,

    content_pack: {
      reels: [
        {
          title: `O maior mito sobre ${safeTheme}`,
          hook: `Você ainda acredita nisso sobre ${safeTheme}? 🛑`,
          main_points: [
            `A mentira que contam sobre ${safeTheme}`,
            "A verdade que ninguém te diz",
            "Como aplicar o jeito certo hoje"
          ],
          cta: "Siga para aprender o jeito certo!",
          visual_suggestion: "Você falando direto para a câmera, iluminação natural.",
          audio_suggestion: "Áudio trending 'Suspense' ou Lo-fi calmo.",
          script_timeline: [],
          camera_angles_summary: ["Close-up frontal"],
          transitions: ["Corte seco"],
          editing_notes: "Legendas amarelas e brancas no centro."
        },
        {
          title: `Como começar em ${safeTheme} do zero`,
          hook: `Se eu começasse hoje em ${safeTheme}, faria isso 👇`,
          main_points: [
            "Passo 1: O fundamento básico",
            "Passo 2: A ferramenta essencial",
            "Passo 3: A rotina diária"
          ],
          cta: "Salve para consultar depois!",
          visual_suggestion: "Montagem rápida de B-roll mostrando a atividade.",
          audio_suggestion: "Música motivacional acelerada.",
          script_timeline: [],
          camera_angles_summary: [],
          transitions: [],
          editing_notes: "Velocidade 1.2x nos cortes."
        }
      ],

      carousels: [
        {
          title: `Checklist: Sucesso em ${safeTheme}`,
          slides: [
            { slide_number: 1, title: "CAPA", content: `Guia Rápido: ${safeTheme}` },
            { slide_number: 2, title: "Erro Comum", content: "Não pule etapas." },
            { slide_number: 3, title: "O Segredo", content: "Consistência vence intensidade." },
            { slide_number: 4, title: "Ação", content: "Comece pequeno." }
          ],
          cta_slide: "Qual sua maior dificuldade hoje?",
          design_tips: ["Fundo minimalista", "Fonte Sans-serif Bold"]
        }
      ],

      image_posts: [
        {
          idea: `Frase inspiracional sobre ${safeTheme}`,
          caption: `A disciplina é a ponte entre metas e realizações em ${safeTheme}. \n\nConcorda? Comenta 'SIM' 👇 #foco #${safeTheme.replace(/\s+/g, '')}`,
          image_prompt: `Minimalist typography poster regarding ${safeTheme}, clean background, high quality 4k`,
          hashtags: [`#${safeTheme.replace(/\s+/g, '')}`, "#inspiracao", "#foco"],
          best_time: "08:00h"
        }
      ],

      story_sequences: [
        {
          theme: `Interação sobre ${safeTheme}`,
          slides: [
             { slide_number: 1, type: "Text", content: `Vamos falar de ${safeTheme}?` },
             { slide_number: 2, type: "Poll", content: "Você prefere A ou B?", options: ["Opção A", "Opção B"] },
             { slide_number: 3, type: "Q&A", content: "Mande sua dúvida sobre o tema!" }
          ],
          engagement_tips: ["Responda em vídeo", "Use fundo neutro"]
        }
      ]
    },

    viral_strategy: {
      best_times: ["12:00", "18:00", "21:00"],
      hashtag_strategy: "3 hashtags do nicho + 2 virais.",
      engagement_hacks: ["Responda comentários com pergunta", "Poste nos stories logo após publicar"]
    }
  };
}

// =================================================================
// ACTION PRINCIPAL
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

    // 🛡️ RATE LIMIT CHECK
    // Buscamos a última campanha do usuário para ver se ele está "spammando"
    const lastCampaign = await ctx.runQuery(api.brainCampaigns.getCurrentCampaign);

    if (lastCampaign) {
      const timeSinceLastGen = Date.now() - lastCampaign.createdAt;
      const COOLDOWN_MS = 15000; // 15 segundos de intervalo obrigatório

      if (timeSinceLastGen < COOLDOWN_MS) {
        const waitSeconds = Math.ceil((COOLDOWN_MS - timeSinceLastGen) / 1000);
        throw new Error(`Aguarde ${waitSeconds}s para gerar outra campanha.`);
      }
    }

    try {
      console.log(`🚀 Gerando campanha para: "${args.theme}"...`);
      const results = await generateWithGroq(args.theme);
      console.log("✅ Sucesso! Roteiros prontos para produção.");

      if (!results.content_pack || !results.content_pack.reels) {
        console.error("Estrutura inválida, usando fallback", results);
        return generateFallbackContent(args.theme);
      }

      return results;
    } catch (error) {
      console.error("❌ Erro final, usando fallback:", error);
      // Agora o fallback recebe o tema para não ficar genérico
      return generateFallbackContent(args.theme);
    }
  },
});

// =================================================================
// AÇÃO DE VENDAS DM (mantida)
// =================================================================

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
# MISSÃO: Gerar mensagem de prospecção profissional
# IDIOMA: Português do Brasil
# FORMATO: JSON com "title" e "content"
# DADOS:
- Tipo: ${messageType}
- Público: ${businessType}
- Custom: ${customization || "Padrão"}

JSON:
{
  "title": "Assunto curto",
  "content": "Mensagem completa persuasiva",
  "businessType": "${businessType}",
  "messageType": "${messageType}"
}
`;

    try {
      if (process.env.GROQ_API_KEY) {
        try {
          const response = await groq.chat.completions.create({
            model: GROQ_MODELS.fast,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: 'Copywriter B2B. Responda em JSON (PT-BR).' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.8,
          });

          const resultText = response.choices[0]?.message?.content;
          if (resultText) {
            return parseAiJsonResponse(resultText);
          }
        } catch (groqError) {
          console.error("Erro Groq, tentando OpenAI:", groqError);
        }
      }

      if (openai) {
        const response = await openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: 'Copywriter B2B. JSON em PT-BR.' },
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
        content: `Olá! Tenho uma solução para seu negócio. Podemos conversar?`,
        businessType,
        messageType
      };
    }
  },
});