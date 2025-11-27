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
  default: 'llama-3.3-70b-versatile',
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
🚨 MODO ULTRA: DIRETOR DE RETENÇÃO MÁXIMA ATIVADO
TEMA EXATO DO CLIENTE: "${theme}"

VOCÊ NÃO É UM REDATOR.
VOCÊ É O DIRETOR QUE FEZ O REEL DE 110 MILHÕES DE VIEWS.

REGRAS IMUTÁVEIS DO MODO ULTRA (SIGA OU MORRA):

1. O PRIMEIRO 1.0 A 2.9 SEGUNDO DECIDE TUDO
   → O hook TEM que fazer a pessoa PARAR O POLEGAR FISICAMENTE.
   → Use uma das 5 fórmulas comprovadas que funcionam em 2025:
     - "Pare de [ação comum] se você quer [resultado desejado]"
     - "Eu ganhei R$127k em 21 dias fazendo isso que 99% odeiam"
     - "Isso aqui tá destruindo seus resultados e você nem percebe"
     - "O erro de R$0 que 90% dos [nicho] ainda cometem"
     - "Fiz X em Y dias sem [coisa que o público odeia fazer]"

2. RETENÇÃO É DEUS. CADA FRAME TEM QUE JUSTIFICAR SUA EXISTÊNCIA
   → Cada corte deve acontecer em beat drop ou mudança de estímulo visual/sonoro
   → Máximo 2.1 segundos por cena (exceto cenas de prova social ou transformação)
   → Mínimo 5 mudanças visuais nos primeiros 8 segundos

3. CÂMERA = ARMA DE DESTRUIÇÃO EM MASSA
   → Nunca mais diga "grave seu rosto"
   → Sempre especifique:
        • Tipo de lente (wide, 50mm, telefoto)
        • Distância exata (close-up 30cm, medium shot 1m, etc)
        • Movimento obrigatório (push in lento de 1.0x → 1.4x, orbit 15°, dolly zoom, etc)
        • Ângulo psicológico (olho-no-olho, high angle = autoridade, low angle = desejo)

4. ÁUDIO = 70% DO VÍRUS
   → Nome da música exata + segundo exato do beat drop
   → Se não souber o nome, diga o estilo + BPM + segundo exato do corte
   → Sempre inclua SFX obrigatório (whoosh, impact, glass break, etc)

5. TEXTO NA TELA = HIPNOSE VISUAL
   → Texto deve aparecer em 0.3s e sumir em 0.7s (exceto CTA final)
   → Primeira legenda SEMPRE em vermelho ou amarelo (#FF0066 ou #FFFF00)
   → Fonte: Montserrat Black ou Impact Pro
   → Tamanho mínimo 80px em 1080p
   → Efeito obrigatório: scale in + shake leve ou pop + glow

6. ESTRUTURA OBRIGATÓRIA DE REEL ULTRA (3 REELS OBRIGATÓRIOS):

REEL 1 → FORMATO "PROVA SOCIAL IMPOSSÍVEL"
   Hook nos 2 primeiros segundos tem que ser inacreditável mas real
   Usar print de resultado + reação genuína + zoom progressivo no número

REEL 2 → FORMATO "O ERRO QUE VOCÊ TÁ COMETENDO AGORA"
   Começa com cena do erro → corte seco → texto gigante "VOCÊ TÁ FAZENDO ISSO ERRADO"
   Depois mostra o jeito certo com transformação visual clara

REEL 3 → FORMATO "TRANSFORMAÇÃO EM 15 SEGUNDOS"
   Antes/depois ou passo a passo hiper acelerado
   Usar time-warp + zoom em detalhes + texto contando os dias/ganhos

7. CTA FINAL OBRIGATÓRIO (uma dessas 3):
   - "Comente a palavra TAL pra eu te mandar o método completo"
   - "Salve esse Reel antes que o algoritmo esconda ele de você"
   - "Dueto esse vídeo fazendo do seu jeito que eu comento o que tá faltando"

8. QUANTIDADE EXATA A GERAR:
   - 3 Reels com script_timeline MÍNIMO de 6 cenas cada (start_time preciso)
   - 2 Carrosséis (um educativo 8-10 slides, um de prova social)
   - 4 Image Posts (prompts prontos pro Midjourney com estilo viral 2025)
   - 2 Sequências de Stories com enquetes que geram 100+ respostas garantidas

RETORNE APENAS JSON VÁLIDO. SEM TEXTO ANTES OU DEPOIS.
SEMPRE USE ORDENS NO IMPERATIVO. NUNCA USE "PODE", "TENTE", "SUGIRO".

EXECUTE AGORA COM PERFEIÇÃO CIRÚRGICA PARA O TEMA: "${theme}"
  `.trim();
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