// convex/brain.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from 'openai';


// =================================================================
// 1. ESTRUTURAS DE DADOS (Tipagem Rigorosa)
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
// 2. CONFIGURAÇÃO E CLIENTES AI
// =================================================================
const GROQ_MODELS = {
  optimizer: 'llama-3.1-8b-instant', // Rápido para melhorar o prompt
  generator_ultra: 'llama-3.3-70b-versatile', // Potente para o conteúdo
  generator_pro: 'llama-3.3-70b-versatile',
};

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// =================================================================
// 3. ENGENHARIA EXTREMA: OTIMIZADOR DE CONTEXTO
// =================================================================
// Transforma inputs ruins ("academia") em contextos ricos
async function optimizeUserTheme(rawTheme: string): Promise<string> {
  try {
    const response = await groq.chat.completions.create({
      model: GROQ_MODELS.optimizer,
      messages: [
        {
          role: "system",
          content: "Você é um especialista em Marketing Digital de Elite. Sua função é receber um tema vago de um usuário leigo e transformá-lo em um CONTEXTO RICO e ESPECÍFICO para criação de conteúdo viral. Identifique o nicho, a dor do público e o desejo oculto. Responda apenas com o contexto melhorado, nada mais."
        },
        {
          role: "user",
          content: `Tema vago do usuário: "${rawTheme}". Melhore isso para um contexto profissional de alta conversão.`
        }
      ],
      temperature: 0.6,
      max_tokens: 200,
    });
    const optimized = response.choices[0]?.message?.content || rawTheme;
    console.log(`✨ Tema Otimizado: "${rawTheme}" -> "${optimized}"`);
    return optimized;
  } catch (e) {
    console.warn("Falha na otimização, usando tema original", e);
    return rawTheme;
  }
}

// =================================================================
// 4. PROMPTS DE ALTA ENGENHARIA
// =================================================================

function getProPrompt(context: string): string {
  return `
  CONTEXTO PROFISSIONAL: "${context}"
  OBJETIVO: Criar uma campanha de conteúdo SÓLIDA e EDUCACIONAL (Nível PRO).

  Você é um estrategista de conteúdo sênior. Gere:
  1. Roteiros que educam e constroem autoridade.
  2. Ganchos claros (sem clickbait excessivo).
  3. Estrutura lógica (Problema -> Agitação -> Solução).

  Mantenha o tom útil, inspirador e direto.
  `;
}

function getUltraPrompt(context: string): string {
  return `
🚨 MODO ULTRA: ENGENHARIA DE ATENÇÃO & NEURO-MARKETING
CONTEXTO OTIMIZADO: "${context}"

VOCÊ É O DIRETOR CRIATIVO POR TRÁS DOS VÍDEOS MAIS VIRAIS DO MUNDO.
Esqueça o marketing tradicional. Aqui usamos PSICOLOGIA DE RETENÇÃO.

REGRAS ABSOLUTAS DO MODO ULTRA (FALHAR NISSO É INACEITÁVEL):

1. A LEI DOS 3 SEGUNDOS (O HOOK VISUAL/SONORO):
   - Não use "Olá pessoal". Comece com uma QUEBRA DE PADRÃO.
   - Use gatilhos: Curiosidade, Medo de Perder (FOMO), Ganância ou Controvérsia.
   - Ex: "Pare de jogar dinheiro fora fazendo X", "O segredo que os gurus de ${context} escondem".

2. EDIÇÃO DOPAMINÉRGICA (Script Timeline):
   - Mude o estímulo visual a cada 2.5 segundos.
   - O roteiro deve ditar: "Zoom in violento", "Corte seco no beat", "Texto piscando em vermelho".
   - O áudio é 50% do vídeo: Especifique SFX (woosh, pop, camera shutter) em momentos chave.

3. ROTEIRO HIPNÓTICO:
   - Use loops abertos (fale algo no início que só se resolve no final).
   - Use palavras sensoriais (crocante, brilhante, ensurdecedor, macio).
   - O Call to Action (CTA) deve ser irresistível e específico.

4. ESTRUTURA DOS 3 REELS OBRIGATÓRIOS:
   - REEL 1 (Topo de Funil): Viralização Pura. Polêmico ou "Mito x Verdade".
   - REEL 2 (Meio de Funil): Conexão/História. "Como eu superei X" ou "Bastidores".
   - REEL 3 (Fundo de Funil): Autoridade Técnica. Tutorial rápido e denso.

RETORNE APENAS JSON PURO. SEM MARKDOWN. SEM INTRODUÇÕES.
SEJA AGRESSIVO NA QUALIDADE.
  `.trim();
}

function getJsonStructureInstruction(): string {
  return `
  SAÍDA OBRIGATÓRIA EM JSON VÁLIDO:
  {
    "theme_summary": "Resumo estratégico em 1 frase curta.",
    "target_audience_suggestion": "Perfil psicológico do comprador ideal.",
    "content_pack": {
      "reels": [
        {
          "title": "Nome interno do vídeo",
          "hook": "Texto exato do gancho verbal/escrito",
          "main_points": ["Ponto 1", "Ponto 2"],
          "cta": "Chamada para ação final",
          "visual_suggestion": "Cenário e iluminação",
          "audio_suggestion": "Estilo musical + SFX",
          "script_timeline": [
            {
              "start_time": "00:00",
              "end_time": "00:03",
              "action": "Ação física do ator/cena",
              "camera_angle": "Direção técnica (Ex: Close-up, Dolly Zoom)",
              "screen_text": "Texto na tela (se houver)",
              "audio_note": "Efeitos sonoros (Ex: Boom sound)"
            }
            // Mínimo 5 cenas por Reel
          ],
          "camera_angles_summary": ["Lista de ângulos"],
          "transitions": ["Lista de transições"],
          "editing_notes": "Instruções para o editor de vídeo"
        }
        // Exatamente 3 Reels
      ],
      "carousels": [
         {
           "title": "Título",
           "slides": [
             { "slide_number": 1, "title": "Headline", "content": "Texto do slide" }
           ],
           "cta_slide": "Texto final",
           "design_tips": ["Cores", "Estilo"]
         }
         // 2 Carrosséis
      ],
      "image_posts": [
         { "idea": "Conceito", "caption": "Legenda completa", "image_prompt": "Prompt Midjourney v6", "hashtags": [], "best_time": "00:00" }
         // 3 Posts
      ],
      "story_sequences": [
         { "theme": "Tema", "slides": [{ "slide_number": 1, "type": "Poll", "content": "Pergunta", "options": ["A", "B"] }], "engagement_tips": ["Dica"] }
         // 2 Sequências
      ]
    },
    "viral_strategy": {
      "best_times": ["Horário 1", "Horário 2"],
      "hashtag_strategy": "Explicação da escolha de tags",
      "engagement_hacks": ["Hack 1", "Hack 2"]
    }
  }
  `;
}

// =================================================================
// 5. PARSER JSON RESILIENTE
// =================================================================
function parseAiJsonResponse<T>(text: string): T {
  try {
    // Remove blocos de código markdown se existirem (```json ... ```)
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}');

    if (jsonStart === -1 || jsonEnd === -1) throw new Error("JSON não encontrado na resposta");

    const jsonString = cleanText.substring(jsonStart, jsonEnd + 1);
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Erro fatal no parse do JSON:", error);
    console.error("Texto recebido:", text);
    throw new Error("A IA gerou um formato inválido. Tente novamente.");
  }
}

// =================================================================
// 6. ACTION PRINCIPAL (O CÉREBRO)
// =================================================================
export const generateContentIdeas = action({
  args: {
    theme: v.string(),
    plan: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autorizado");

    if (!args.theme || args.theme.trim().length < 2) {
      throw new Error("Tema inválido.");
    }

    const userPlan = args.plan === 'ultra' ? 'ultra' : 'pro';

    // 1. Otimização do Tema (A Mágica da Engenharia Extrema)
    // Transforma "sapato" em "Estratégia de e-commerce para calçados confortáveis focada em público feminino 40+"
    const optimizedContext = await optimizeUserTheme(args.theme);

    // 2. Seleção do Prompt e Modelo
    const specificInstructions = userPlan === 'ultra'
      ? getUltraPrompt(optimizedContext)
      : getProPrompt(optimizedContext);

    const prompt = `${specificInstructions}\n\n${getJsonStructureInstruction()}`;
    const model = userPlan === 'ultra' ? GROQ_MODELS.generator_ultra : GROQ_MODELS.generator_pro;

    try {
      console.log(`🧠 Gerando [${userPlan.toUpperCase()}] | Contexto: "${optimizedContext}"`);

      const response = await groq.chat.completions.create({
        model: model,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'Você é uma API JSON estrita. Você gera estratégias de conteúdo viral.'
          },
          { role: 'user', content: prompt },
        ],
        temperature: userPlan === 'ultra' ? 0.75 : 0.85,
        max_tokens: 7000,
      });

      const resultText = response.choices[0]?.message?.content;
      if (!resultText) throw new Error("Resposta vazia da IA");

      return parseAiJsonResponse<BrainResults>(resultText);

    } catch (error) {
      console.error("Erro na geração:", error);
      // Fallback simples para não deixar o usuário na mão
      return {
        theme_summary: "Erro na geração inteligente. Modo de segurança ativado.",
        target_audience_suggestion: "Público geral.",
        content_pack: { reels: [], carousels: [], image_posts: [], story_sequences: [] },
        viral_strategy: { best_times: [], hashtag_strategy: "Erro", engagement_hacks: [] }
      };
    }
  },
});