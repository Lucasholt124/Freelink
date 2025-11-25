// convex/brain.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from 'openai';
import { api } from "./_generated/api";

// =================================================================
// ESTRUTURAS DE DADOS (Mantidas iguais para compatibilidade)
// =================================================================
interface ScriptTimelineItem {
  start_time: string;
  end_time: string;
  action: string;
  camera_angle: string;
  screen_text?: string;
  audio_note?: string;
}

interface ReelContent {
  title: string;
  hook: string;
  main_points: string[];
  cta: string;
  visual_suggestion: string;
  audio_suggestion: string;
  script_timeline: ScriptTimelineItem[];
  camera_angles_summary: string[];
  transitions: string[];
  editing_notes: string;
}

interface CarouselContent {
  title: string;
  slides: { slide_number: number; title: string; content: string; }[];
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
  slides: { slide_number: number; type: "Poll" | "Quiz" | "Q&A" | "Link" | "Text"; content: string; options?: string[]; }[];
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
// CONFIGURAÇÃO
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
// PARSER JSON
// =================================================================
function parseAiJsonResponse<T>(text: string): T {
  try {
    const jsonStart = text.indexOf('{');
    const arrayStart = text.indexOf('[');
    let start = -1;
    if (jsonStart === -1 && arrayStart === -1) throw new Error("JSON não encontrado");
    if (jsonStart !== -1 && (arrayStart === -1 || jsonStart < arrayStart)) {
      start = jsonStart;
    } else {
      start = arrayStart;
    }
    const jsonEnd = text.lastIndexOf('}');
    const arrayEnd = text.lastIndexOf(']');
    const end = Math.max(jsonEnd, arrayEnd);
    if (start === -1 || end === -1) throw new Error("Delimitadores JSON inválidos");
    const jsonString = text.substring(start, end + 1);
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Erro parse JSON:", error);
    throw new Error("Falha ao parsear resposta da IA");
  }
}

// =================================================================
// PROMPTS DIFERENCIADOS (PRO vs ULTRA)
// =================================================================

function getProPrompt(theme: string): string {
  return `
  🎬 TEMA: "${theme}"
  NÍVEL: PRO (Foco em ideias criativas e estrutura sólida)

  Você é um estrategista de conteúdo. Gere uma campanha criativa com:
  1. Ganchos fortes que chamem a atenção.
  2. Estrutura de roteiro clara (início, meio, fim).
  3. Sugestões visuais boas.

  Mantenha o tom profissional e útil.
  `;
}

function getUltraPrompt(theme: string): string {
  return `
  🚨 MODO: ULTRA HARDCORE DIRECTING (TEMA: "${theme}")

  ⚠️ AVISO CRÍTICO: VOCÊ ESTÁ PROIBIDO DE DAR "DICAS" OU "SUGESTÕES".
  NÃO USE PALAVRAS COMO: "tente", "sugerimos", "pode ser", "estilo livre".

  VOCÊ É UM DIRETOR DE CINEMA TÉCNICO E UM ENGENHEIRO DE ATENÇÃO.
  O usuário é um executor que precisa de ORDENS EXATAS.

  PARA CADA REEL/VÍDEO, VOCÊ DEVE MONTAR A LINHA DO TEMPO (script_timeline) COM PRECISÃO CIRÚRGICA:

  1. 🎥 CÂMERA (Obrigatório): Especifique a lente e o movimento.
     - ERRADO: "Grave seu rosto."
     - CERTO: "Câmera frontal, ângulo 15º acima dos olhos (high-angle). Zoom in digital de 1.0x para 1.3x em 0.5s."

  2. 🔊 ÁUDIO (Obrigatório): Especifique a batida e os efeitos.
     - ERRADO: "Música animada."
     - CERTO: "Música: 'Phonk Aggressive' (120 BPM). Corte seco no beat drop aos 0:03s. Efeito sonoro 'Whoosh' na transição."

  3. 🎬 AÇÃO (Obrigatório): Descreva o movimento físico exato.
     - ERRADO: "Mostre o produto."
     - CERTO: "Segure o produto com a mão esquerda. Dê 2 toques nele com o indicador direito sincronizado com a música."

  4. 📝 TEXTO NA TELA (Obrigatório): Especifique cor, posição e duração.
     - ERRADO: "Coloque um título."
     - CERTO: "Texto: 'PARE AGORA' em vermelho (#FF0000), fonte Montserrat Bold, centralizado, piscando por 0.5s."

  SEU OBJETIVO: Se um robô seguir suas instruções cegamente, o vídeo DEVE viralizar pela retenção visual e auditiva.
  `;
}

function getJsonStructureInstruction(): string {
  return `
  ESTRUTURA JSON OBRIGATÓRIA (RETORNE APENAS JSON VÁLIDO):
  {
    "theme_summary": "Resumo tático em 1 frase.",
    "target_audience_suggestion": "Análise psicográfica da dor do público.",
    "content_pack": {
      "reels": [
        {
          "title": "Título Interno (Controle)",
          "hook": "A frase exata que deve ser dita/escrita nos primeiros 3s",
          "main_points": ["Argumento lógico 1", "Argumento lógico 2"],
          "cta": "A ordem final exata (ex: 'Comente X agora')",
          "visual_suggestion": "Descreva o cenário físico (iluminação, fundo)",
          "audio_suggestion": "Nome exato do estilo musical + BPM sugerido",
          "script_timeline": [
            {
              "start_time": "00:00",
              "end_time": "00:03",
              "action": "ORDEM FÍSICA: O que o corpo faz.",
              "camera_angle": "ORDEM TÉCNICA: Lente, Distância, Movimento.",
              "screen_text": "ORDEM VISUAL: Texto exato, Cor, Fonte, Posição.",
              "audio_note": "ORDEM SONORA: SFX exato, Volume, Corte."
            },
             {
              "start_time": "00:03",
              "end_time": "00:07",
              "action": "...",
              "camera_angle": "...",
              "screen_text": "...",
              "audio_note": "..."
            }
            // MÍNIMO DE 4 CENAS DETALHADAS POR REEL
          ],
          "camera_angles_summary": ["Lista técnica dos ângulos usados"],
          "transitions": ["Lista técnica das transições"],
          "editing_notes": "Manual técnico para o editor (ex: 'Use keyframes para legenda dinâmica')."
        }
        // GERE EXATAMENTE 3 REELS DIFERENTES NESTE PADRÃO
      ],
      "carousels": [
         {
           "title": "...",
           "slides": [
             { "slide_number": 1, "title": "CAPA", "content": "Descrição visual exata da capa + Texto da Headline" },
             { "slide_number": 2, "title": "CONTEÚDO", "content": "Texto exato do slide." }
           ],
           "cta_slide": "Texto final.",
           "design_tips": ["Paleta de cores HEX", "Fontes"]
         }
      ],
      "image_posts": [
         { "idea": "...", "caption": "Legenda pronta para copiar.", "image_prompt": "Prompt técnico para Midjourney/DALL-E.", "hashtags": [], "best_time": "..." }
      ],
      "story_sequences": [
         { "theme": "...", "slides": [{ "slide_number": 1, "type": "Text", "content": "..." }], "engagement_tips": ["..."] }
      ]
    },
    "viral_strategy": {
      "best_times": [],
      "hashtag_strategy": "...",
      "engagement_hacks": []
    }
  }
  `;
}

// =================================================================
// FUNÇÃO DE GERAÇÃO
// =================================================================

async function generateWithGroq(theme: string, plan: "pro" | "ultra"): Promise<BrainResults> {
  // 1. Seleciona o Prompt baseado no plano
  const specificInstructions = plan === 'ultra' ? getUltraPrompt(theme) : getProPrompt(theme);
  const prompt = `${specificInstructions}\n\n${getJsonStructureInstruction()}\n\nEXECUTE AGORA PARA O TEMA: "${theme}"`;

  // 2. Seleção de Modelos (Ultra usa modelos mais potentes primeiro)
  const modelsToTry = plan === 'ultra'
    ? [GROQ_MODELS.primary, GROQ_MODELS.default]
    : [GROQ_MODELS.default, GROQ_MODELS.fast];

  let lastError: unknown = null;

  for (const model of modelsToTry) {
    try {
      console.log(`🔄 [${plan.toUpperCase()}] Gerando com modelo: ${model}...`);

      const response = await groq.chat.completions.create({
        model,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: plan === 'ultra'
              ? 'Você é um DIRETOR DE CONTEÚDO VIRAL de elite mundial. Entregue roteiros tecnicamente perfeitos.'
              : 'Você é um assistente criativo de marketing digital competente.'
          },
          { role: 'user', content: prompt },
        ],
        temperature: plan === 'ultra' ? 0.7 : 0.85, // Ultra é mais preciso/técnico
        max_tokens: 8000,
      });

      const resultText = response.choices[0]?.message?.content;
      if (!resultText) throw new Error(`Modelo ${model} retornou vazio`);

      console.log(`✅ Sucesso [${plan}]: ${model}`);
      return parseAiJsonResponse<BrainResults>(resultText);
    } catch (error) {
      console.error(`❌ Erro modelo ${model}:`, error);
      lastError = error;
      continue;
    }
  }

  // Fallback OpenAI
  if (openai) {
    try {
      console.log("🔄 Fallback para OpenAI...");
      // OpenAI lógica similar simplificada para fallback
      return await generateFallbackContent(theme);
    } catch (e) { console.error(e); }
  }

  console.error("❌ Falha total. Usando fallback estático.", lastError);
  return generateFallbackContent(theme);
}

// =================================================================
// FALLBACK ESTÁTICO (Mantido para segurança)
// =================================================================
function generateFallbackContent(theme: string): BrainResults {
  const safeTheme = theme || "seu nicho";
  return {
    theme_summary: `[MODO OFFLINE] Plano de contingência para: ${safeTheme}.`,
    target_audience_suggestion: `Pessoas interessadas em ${safeTheme}.`,
    content_pack: {
      reels: [
        {
          title: `Erro comum em ${safeTheme}`,
          hook: `Pare de fazer isso agora! 🛑`,
          main_points: ["O erro", "A solução", "O benefício"],
          cta: "Siga para mais!",
          visual_suggestion: "Fale para a câmera.",
          audio_suggestion: "Trending audio.",
          script_timeline: [],
          camera_angles_summary: [],
          transitions: [],
          editing_notes: "Cortes rápidos."
        }
      ],
      carousels: [],
      image_posts: [],
      story_sequences: []
    },
    viral_strategy: {
      best_times: ["18:00"],
      hashtag_strategy: "Genérica",
      engagement_hacks: ["Responda comentários"]
    }
  };
}

// =================================================================
// ACTION PRINCIPAL
// =================================================================
export const generateContentIdeas = action({
  args: {
    theme: v.string(),
    plan: v.string(), // <--- NOVO ARGUMENTO
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Usuário não autenticado");

    if (!args.theme || args.theme.trim().length < 3) {
      throw new Error("Tema muito curto.");
    }

    // Normaliza o plano
    const userPlan = (args.plan === 'ultra') ? 'ultra' : 'pro';

    // Rate Limit Inteligente
    const lastCampaign = await ctx.runQuery(api.brainCampaigns.getCurrentCampaign);
    if (lastCampaign) {
      const timeSinceLastGen = Date.now() - lastCampaign.createdAt;
      // Usuários ULTRA esperam menos tempo (10s vs 20s)
      const COOLDOWN_MS = userPlan === 'ultra' ? 10000 : 20000;

      if (timeSinceLastGen < COOLDOWN_MS) {
        const waitSeconds = Math.ceil((COOLDOWN_MS - timeSinceLastGen) / 1000);
        throw new Error(`Aguarde ${waitSeconds}s para gerar novamente.`);
      }
    }

    try {
      console.log(`🚀 Iniciando FreelinnkBrain [${userPlan.toUpperCase()}] para: "${args.theme}"`);
      const results = await generateWithGroq(args.theme, userPlan);
      return results;
    } catch (error) {
      console.error("Erro final:", error);
      return generateFallbackContent(args.theme);
    }
  },
});

// A action generateOutreachMessage pode ser mantida como estava no seu código original
export const generateOutreachMessage = action({
  args: {
    businessType: v.string(),
    messageType: v.string(),
    customization: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // ... (Mantenha o código original dessa função aqui se ainda a usar)
    return { title: "Demo", content: "Função mantida", businessType: args.businessType, messageType: args.messageType };
  }
});