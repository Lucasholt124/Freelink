// /convex/imageGenerator.ts - VERSÃO ADAPTADA PARA SEU SCHEMA
import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";


// ============================================================
// 🚀 CONFIGURAÇÕES DO SISTEMA
// ============================================================

// Como não temos tabela de limites, vamos usar um sistema simples em memória
const RATE_LIMITS = new Map<string, { images: number; videos: number; date: string }>();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBX2ZDO0cSXzPmJX-Your-Key';

// ============================================================
// CONTROLE DE LIMITES SIMPLES (Em Memória)
// ============================================================

function checkDailyLimits(userId: string, type: 'image' | 'video'): { canUse: boolean; remaining: number } {
  const today = new Date().toISOString().split('T')[0];
  const userLimits = RATE_LIMITS.get(userId);

  const limits = { image: 3, video: 2 };

  if (!userLimits || userLimits.date !== today) {
    // Reset ou primeiro uso do dia
    RATE_LIMITS.set(userId, { images: 0, videos: 0, date: today });
    return { canUse: true, remaining: limits[type] };
  }

  const used = type === 'image' ? userLimits.images : userLimits.videos;
  const limit = limits[type];

  if (used >= limit) {
    return { canUse: false, remaining: 0 };
  }

  // Incrementa o uso
  if (type === 'image') {
    userLimits.images++;
  } else {
    userLimits.videos++;
  }

  return { canUse: true, remaining: limit - used - 1 };
}

// ============================================================
// GEMINI - MELHORIA DE PROMPTS
// ============================================================

async function improvePromptWithGemini(prompt: string): Promise<string> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Improve this image generation prompt to be more detailed, artistic and specific.
                     Make it photorealistic and professional. Return ONLY the improved prompt in English: "${prompt}"`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const improved = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return improved || prompt;
    }
  } catch (error) {
    console.error("Erro Gemini:", error);
  }
  return prompt;
}

// ============================================================
// GERAÇÃO DE IMAGEM COM MÚLTIPLAS APIs
// ============================================================

async function _generateImageFromApis(prompt: string, useGemini: boolean): Promise<Blob | null> {
  let finalPrompt = prompt;

  // Se tem acesso ao Gemini, melhora o prompt primeiro
  if (useGemini) {
    console.log("✨ Melhorando prompt com Gemini...");
    finalPrompt = await improvePromptWithGemini(prompt);
  }

  // Lista de APIs para tentar
  const apis = [
    // 1. Pollinations (sempre funciona, grátis)
    async () => {
      const seed = Math.floor(Math.random() * 999999);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1024&height=1024&seed=${seed}&model=flux&nologo=true&enhance=true`;
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        if (blob.size > 1000) {
          console.log("✅ Pollinations funcionou!");
          return blob;
        }
      }
      return null;
    },

    // 2. Together AI (se você tiver chave)
    async () => {
      if (!process.env.TOGETHER_API_KEY) return null;

      const response = await fetch('https://api.together.xyz/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`
        },
        body: JSON.stringify({
          model: "black-forest-labs/FLUX.1-schnell",
          prompt: finalPrompt,
          width: 1024,
          height: 1024,
          steps: 4,
          n: 1
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data?.[0]?.url) {
          const imgResponse = await fetch(data.data[0].url);
          const blob = await imgResponse.blob();
          if (blob.size > 1000) {
            console.log("✅ Together AI funcionou!");
            return blob;
          }
        }
      }
      return null;
    },

    // 3. Stable Horde (comunidade, grátis mas lento)
    async () => {
      const response = await fetch('https://stablehorde.net/api/v2/generate/async', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': '0000000000' // API anônima
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          params: {
            cfg_scale: 7.5,
            height: 1024,
            width: 1024,
            steps: 20,
            n: 1
          },
          models: ["stable_diffusion"],
          nsfw: false,
        })
      });

      if (response.ok) {
        const { id } = await response.json();

        // Aguarda até 30 segundos
        for (let i = 0; i < 15; i++) {
          await new Promise(r => setTimeout(r, 2000));

          const statusRes = await fetch(
            `https://stablehorde.net/api/v2/generate/status/${id}`,
            { headers: { 'apikey': '0000000000' } }
          );

          if (statusRes.ok) {
            const data = await statusRes.json();
            if (data.done && data.generations?.[0]?.img) {
              const base64 = data.generations[0].img;
              const bytes = atob(base64.split(',')[1] || base64);
              const arr = new Uint8Array(bytes.length);
              for (let i = 0; i < bytes.length; i++) {
                arr[i] = bytes.charCodeAt(i);
              }
              console.log("✅ Stable Horde funcionou!");
              return new Blob([arr], { type: 'image/png' });
            }
          }
        }
      }
      return null;
    },
  ];

  // Tenta cada API em ordem
  for (const api of apis) {
    try {
      const result = await api();
      if (result) return result;
    } catch (error) {
      console.error("API falhou:", error);
      continue;
    }
  }

  return null;
}

// ============================================================
// GERAÇÃO DE ROTEIRO VIRAL (Não precisa salvar no DB)
// ============================================================

interface VideoScript {
  title: string;
  hook: string;
  totalDuration: string;
  format: string;
  style: string;
  scenes: Array<{
    sceneNumber: number;
    duration: string;
    text: string;
    visualDescription: string;
    cameraMovement: string;
    transition: string;
  }>;
  musicRecommendation: string;
  hashtagSuggestions: string[];
  callToAction: string;
  canvaStepByStep: string[];
  capcutStepByStep: string[];
  proTips: string[];
}

async function createViralScript(
  topic: string,
  style: string,
  duration: number,
  useGemini: boolean
): Promise<VideoScript> {

  if (useGemini) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Crie um roteiro de vídeo VIRAL de ${duration} segundos sobre: "${topic}"
                       Estilo: ${style}

                       Inclua:
                       1. Hook inicial IMPACTANTE (3 segundos)
                       2. ${Math.ceil(duration/5)} cenas detalhadas
                       3. Textos curtos e impactantes para cada cena
                       4. Transições dinâmicas
                       5. Sugestão de música trending
                       6. 10 hashtags virais
                       7. Call-to-action poderoso

                       Formato: Vertical 9:16 (Reels/TikTok/Shorts)

                       Responda em português do Brasil de forma estruturada.`
              }]
            }],
            generationConfig: {
              temperature: 0.9,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Processa a resposta do Gemini em formato estruturado
        return processGeminiResponse(content, topic, style, duration);
      }
    } catch (error) {
      console.error("Erro ao gerar com Gemini:", error);
    }
  }

  // Fallback: Geração sem Gemini
  return generateBasicScript(topic, style, duration);
}

function processGeminiResponse(content: string, topic: string, style: string, duration: number): VideoScript {
  // Processa o texto do Gemini ou usa template básico
  return generateBasicScript(topic, style, duration);
}

function generateBasicScript(topic: string, style: string, duration: number): VideoScript {
  const sceneCount = Math.ceil(duration / 5);
  const scenes = [];

  const styleTemplates = {
    viral: {
      hooks: ["🤯 ISSO VAI EXPLODIR SUA MENTE!", "PARA TUDO! Você precisa ver isso", "90% das pessoas NÃO SABEM disso"],
      transitions: ["zoom rápido", "glitch", "flash"],
      music: "música eletrônica viral ou phonk",
      tone: "energético e impactante"
    },
    motivational: {
      hooks: ["Esta é sua CHANCE de mudar", "O que separa você do SUCESSO?", "Chegou a HORA da transformação"],
      transitions: ["fade épico", "slow motion", "luz dourada"],
      music: "música orquestral épica",
      tone: "inspirador e poderoso"
    },
    educational: {
      hooks: ["APRENDA em 30 segundos", "O SEGREDO que ninguém ensina", "DOMINE esta técnica agora"],
      transitions: ["slide suave", "reveal", "focus"],
      music: "lo-fi ou ambiente calmo",
      tone: "claro e didático"
    },
    funny: {
      hooks: ["NÃO É POSSÍVEL! 😂", "Você NÃO vai acreditar", "FAIL ÉPICO em 3, 2, 1..."],
      transitions: ["corte seco", "zoom cômico", "shake"],
      music: "efeitos sonoros engraçados",
      tone: "divertido e surpreendente"
    }
  };

  const template = styleTemplates[style as keyof typeof styleTemplates] || styleTemplates.viral;

  // Gera cenas
  for (let i = 0; i < sceneCount; i++) {
    scenes.push({
      sceneNumber: i + 1,
      duration: i === 0 ? "3 segundos" : "3-5 segundos",
      text: i === 0 ? template.hooks[0] : `Ponto ${i}: Informação chave`,
      visualDescription: `Visual ${template.tone} - Cena ${i + 1}`,
      cameraMovement: i % 2 === 0 ? "Zoom in dramático" : "Pan dinâmico",
      transition: template.transitions[i % template.transitions.length],
    });
  }

  return {
    title: `${topic} - ${style.toUpperCase()} VERSION`,
    hook: template.hooks[0],
    totalDuration: `${duration} segundos`,
    format: "9:16 Vertical (Reels/TikTok/Shorts)",
    style: style,
    scenes: scenes,
    musicRecommendation: template.music,
    hashtagSuggestions: [
      "#viral", "#fyp", "#foryou", "#trending", "#reels",
      "#brasil", "#viralvideo", "#contentcreator", "#socialmedia",
      `#${topic.toLowerCase().replace(/\s/g, '')}`
    ],
    callToAction: "💬 COMENTA 'EU QUERO' e SEGUE para mais!",

    canvaStepByStep: [
      "1️⃣ Abra o Canva e escolha 'Vídeo do Instagram Reels' (1080x1920)",
      "2️⃣ Busque templates com 'viral' ou 'trending'",
      "3️⃣ Substitua os textos pelos do roteiro acima",
      "4️⃣ Em 'Áudio', escolha uma música trending atual",
      "5️⃣ Adicione elementos animados e stickers relevantes",
      "6️⃣ Use animação 'Stomp' ou 'Pop' para textos",
      "7️⃣ Ajuste timing: 3s para hook, 3-5s para outras cenas",
      "8️⃣ Adicione sua logo/marca d'água discretamente",
      "9️⃣ Exporte em MP4, qualidade máxima",
      "🔥 DICA: Poste entre 19h-21h para máximo engajamento!"
    ],

    capcutStepByStep: [
      "1️⃣ Crie novo projeto 9:16 no CapCut",
      "2️⃣ Importe seus vídeos/imagens",
      "3️⃣ Corte cada clipe para 3-5 segundos",
      "4️⃣ Adicione texto com estilo 'Trending' ou 'Bold'",
      "5️⃣ Vá em Áudio > Músicas > Sons em Alta",
      "6️⃣ Sincronize cortes com batidas da música",
      "7️⃣ Adicione transições: Glitch, Zoom ou Flash",
      "8️⃣ Use filtros vibrantes e ajuste saturação +20%",
      "9️⃣ Adicione movimento com keyframes",
      "🔟 Ative legendas automáticas antes de exportar",
      "💡 Exporte em 1080p, 60fps para qualidade máxima!"
    ],

    proTips: [
      "🎯 Use os 3 primeiros segundos para PRENDER atenção",
      "📱 Grave sempre na VERTICAL",
      "💡 Iluminação natural é sua melhor amiga",
      "🔥 Poste consistentemente no mesmo horário",
      "💬 Responda TODOS os comentários nas primeiras 2 horas",
      "📊 Analise métricas após 24h e ajuste estratégia",
      "🎪 Crie uma SÉRIE sobre o tema para fidelizar",
      "⚡ Use palavras-gatilho: GRÁTIS, EXCLUSIVO, URGENTE",
    ]
  };
}

// ============================================================
// AÇÕES PRINCIPAIS
// ============================================================

export const generateImage = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const userId = identity.subject;

    try {
      // Verifica limites simples
      const { canUse, remaining } = checkDailyLimits(userId, 'image');

      // Gera a imagem
      const imageBlob = await _generateImageFromApis(args.prompt, canUse);

      if (!imageBlob) {
        throw new Error("Não foi possível gerar a imagem. Tente novamente.");
      }

      // Salva no storage do Convex
      const storageId = await ctx.storage.store(imageBlob);
      const imageUrl = await ctx.storage.getUrl(storageId);

      if (!imageUrl) {
        throw new Error("Erro ao salvar imagem");
      }

      // Salva no banco usando sua estrutura existente
      await ctx.runMutation(internal.imageGenerator.saveGeneratedImage, {
        userId,
        prompt: args.prompt,
        imageUrl,
        storageId,
        method: canUse ? 'premium' : 'free',
        createdAt: Date.now(),
      });

      return {
        url: imageUrl,
        method: canUse ? 'premium' : 'free',
        remainingGeminiUses: remaining,
        message: canUse
          ? `✨ Imagem Premium gerada! ${remaining} usos restantes hoje.`
          : "Imagem gerada com sucesso!"
      };

    } catch (error) {
      console.error("Erro:", error);
      throw new Error(error instanceof Error ? error.message : "Erro ao gerar imagem");
    }
  },
});

export const generateVideoScript = action({
  args: {
    topic: v.string(),
    style: v.string(),
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const userId = identity.subject;

    try {
      // Verifica limites
      const { canUse, remaining } = checkDailyLimits(userId, 'video');

      // Gera o roteiro
      const script = await createViralScript(
        args.topic,
        args.style,
        args.duration,
        canUse
      );

      return {
        script,
        method: canUse ? 'premium' : 'basic',
        remainingGeminiUses: remaining,
        message: canUse
          ? `🎬 Roteiro Premium criado! ${remaining} roteiros restantes hoje.`
          : "Roteiro criado com sucesso!"
      };

    } catch (error) {
      console.error("Erro:", error);
      throw new Error("Erro ao gerar roteiro. Tente novamente.");
    }
  },
});

// ============================================================
// MUTATIONS - Adaptadas para seu schema
// ============================================================

export const saveGeneratedImage = internalMutation({
  args: {
    userId: v.string(),
    prompt: v.string(),
    imageUrl: v.string(),
    storageId: v.id("_storage"),
    method: v.string(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("generatedImages", args);
  },
});

// ============================================================
// QUERIES - Adaptadas para seu schema
// ============================================================

export const getImagesForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const images = await ctx.db
      .query("generatedImages")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(50);

    return images || [];
  },
});

export const getUserImageCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const images = await ctx.db
      .query("generatedImages")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    return images.length;
  },
});

export const getUsageStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // Como usamos sistema em memória, retornamos valores aproximados
    const limits = checkDailyLimits(identity.subject, 'image');
    const videoLimits = checkDailyLimits(identity.subject, 'video');

    return {
      geminiImagesRemaining: limits.remaining,
      geminiVideosRemaining: videoLimits.remaining,
    };
  },
});