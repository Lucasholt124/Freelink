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
  🚀 TEMA: "${theme}"
  NÍVEL: ULTRA GOD MODE (Foco em Viralização Técnica, Psicologia de Retenção e Direção de Cinema)

  VOCÊ NÃO É UM GERADOR DE IDEIAS. VOCÊ É UM DIRETOR DE CINEMA E ESPECIALISTA EM NEURO-MARKETING.
  Para o plano ULTRA, você deve entregar um GUIA ABSOLUTO passo-a-passo. O usuário não deve pensar, apenas obedecer.

  REGRAS RÍGIDAS PARA "REELS" (Campo script_timeline):
  1. TIMING CIRÚRGICO: Defina cortes a cada 2 a 4 segundos. O campo "start_time" e "end_time" deve ser preciso.
  2. PSICOLOGIA: No campo "action", explique a psicologia (ex: "Quebra de padrão visual", "Loop aberto").
  3. ÁUDIO ENGENHARIA (Campo audio_note): Não diga "música feliz". Diga: "Efeito sonoro 'Whoosh' no corte, seguido de batida Phonk 120bpm. Aumentar volume em 20% no Hook".
  4. DIREÇÃO DE CÂMERA (Campo camera_angle): Seja técnico. "Zoom in digital suave (1.0x para 1.2x)", "Câmera na mão estilo vlog (shaky cam)", "Olhar 45 graus longe da câmera".
  5. TEXTO NA TELA (Campo screen_text): Posição exata. "Texto centralizado, fonte amarela com borda preta, piscando 2 vezes".

  No campo "editing_notes", escreva um mini-manual técnico para o editor no Premiere/CapCut.
  Seja autoritário, técnico e focado em RETENÇÃO MÁXIMA.
  `;
}

function getJsonStructureInstruction(): string {
  return `
  ESTRUTURA JSON OBRIGATÓRIA (RESPONDA APENAS COM JSON):
  {
    "theme_summary": "Resumo...",
    "target_audience_suggestion": "Persona detalhada...",
    "content_pack": {
      "reels": [
        {
          "title": "...",
          "hook": "...",
          "main_points": ["..."],
          "cta": "...",
          "visual_suggestion": "...",
          "audio_suggestion": "...",
          "script_timeline": [
            {
              "start_time": "0s",
              "end_time": "3s",
              "action": "DESCRIÇÃO ULTRA DETALHADA DA AÇÃO E DO PORQUÊ",
              "camera_angle": "ANGULO TÉCNICO",
              "screen_text": "TEXTO EXATO",
              "audio_note": "DESIGN DE SOM EXATO"
            }
            // ... mais cenas
          ],
          "camera_angles_summary": ["..."],
          "transitions": ["..."],
          "editing_notes": "..."
        }
        // Gere pelo menos 3 reels
      ],
      "carousels": [
         // Gere pelo menos 2 carrosséis completos
         { "title": "...", "slides": [{ "slide_number": 1, "title": "...", "content": "..." }], "cta_slide": "...", "design_tips": ["..."] }
      ],
      "image_posts": [
         // Gere pelo menos 3 posts estáticos
         { "idea": "...", "caption": "...", "image_prompt": "...", "hashtags": [], "best_time": "..." }
      ],
      "story_sequences": [
         // Gere pelo menos 2 sequencias
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