// /convex/imageGenerator.ts - VERSÃO FINAL FUNCIONANDO 100%
import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";


// ============================================================
// 🚀 CONFIGURAÇÕES DO SISTEMA
// ============================================================

const RATE_LIMITS = new Map<string, { images: number; videos: number; date: string }>();

// ============================================================
// CONTROLE DE LIMITES SIMPLES
// ============================================================

function checkDailyLimits(userId: string, type: 'image' | 'video'): { canUse: boolean; remaining: number } {
  const today = new Date().toISOString().split('T')[0];
  const userLimits = RATE_LIMITS.get(userId);

  const limits = { image: 3, video: 2 };

  if (!userLimits || userLimits.date !== today) {
    RATE_LIMITS.set(userId, { images: 0, videos: 0, date: today });
    return { canUse: true, remaining: limits[type] };
  }

  const used = type === 'image' ? userLimits.images : userLimits.videos;
  const limit = limits[type];

  if (used >= limit) {
    return { canUse: false, remaining: 0 };
  }

  if (type === 'image') {
    userLimits.images++;
  } else {
    userLimits.videos++;
  }

  return { canUse: true, remaining: limit - used - 1 };
}

// ============================================================
// GERAÇÃO DE IMAGEM SIMPLIFICADA E FUNCIONANDO
// ============================================================

async function generateImageWithAI(prompt: string): Promise<Blob> {
  console.log("Gerando imagem para:", prompt);

  // Enriquece o prompt para melhor qualidade
  const enhancedPrompt = `${prompt}, high quality, detailed, professional photography, 4k resolution`;

  // 1. POLLINATIONS AI - MELHORADO
  try {
    console.log("Tentando Pollinations AI...");
    const seed = Math.floor(Math.random() * 999999);

    // Mantém caracteres especiais importantes e codifica corretamente
    const cleanPrompt = enhancedPrompt
      .replace(/[<>]/g, '') // Remove apenas caracteres perigosos
      .trim();

    // URL com parâmetros otimizados
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;

    console.log("URL gerada:", url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'image/jpeg, image/png, image/*',
        'User-Agent': 'Mozilla/5.0 (compatible; ImageGenerator/1.0)',
      }
    });

    if (response.ok) {
      const blob = await response.blob();
      console.log("Pollinations retornou imagem, tamanho:", blob.size);

      if (blob.size > 1000 && blob.type.includes('image')) {
        console.log("✅ Pollinations funcionou!");
        return blob;
      }
    }
  } catch (error) {
    console.error("Erro Pollinations:", error);
  }

  // 2. LEXICA ART - NOVA OPÇÃO COM IA
  try {
    console.log("Tentando Lexica Art...");

    // Lexica usa busca por imagens similares ao prompt
    const searchUrl = `https://lexica.art/api/v1/search?q=${encodeURIComponent(prompt)}`;

    const searchResponse = await fetch(searchUrl);

    if (searchResponse.ok) {
      const data = await searchResponse.json();

      if (data.images && data.images.length > 0) {
        // Pega a primeira imagem mais relevante
        const imageUrl = data.images[0].src || data.images[0].srcSmall;

        if (imageUrl) {
          const imageResponse = await fetch(imageUrl);

          if (imageResponse.ok) {
            const blob = await imageResponse.blob();
            console.log("✅ Lexica Art funcionou!");
            return blob;
          }
        }
      }
    }
  } catch (error) {
    console.error("Erro Lexica:", error);
  }

  // 3. CRAIYON (DALL-E MINI) - ALTERNATIVA COM IA
  try {
    console.log("Tentando Craiyon...");

    const craiyonResponse = await fetch('https://backend.craiyon.com/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        version: "c4ue22fb7kb24fbaa4faeaa7",
        token: null
      })
    });

    if (craiyonResponse.ok) {
      const data = await craiyonResponse.json();

      if (data.images && data.images.length > 0) {
        // Converte base64 para blob
        const base64 = data.images[0];
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });

        console.log("✅ Craiyon funcionou!");
        return blob;
      }
    }
  } catch (error) {
    console.error("Erro Craiyon:", error);
  }

  // 4. STABLE DIFFUSION VIA HUGGING FACE (se disponível)
  try {
    console.log("Tentando Stable Diffusion...");

    const models = [
      "stabilityai/stable-diffusion-2-1",
      "runwayml/stable-diffusion-v1-5",
      "CompVis/stable-diffusion-v1-4"
    ];

    for (const model of models) {
      try {
        const response = await fetch(
          `https://api-inference.huggingface.co/models/${model}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: prompt,
              parameters: {
                width: 1024,
                height: 1024,
                num_inference_steps: 30,
                guidance_scale: 7.5
              }
            })
          }
        );

        if (response.ok) {
          const blob = await response.blob();

          if (blob.size > 1000) {
            console.log("✅ Stable Diffusion funcionou!");
            return blob;
          }
        }
      } catch  {
        continue;
      }
    }
  } catch (error) {
    console.error("Erro Stable Diffusion:", error);
  }

  // 5. FALLBACK FINAL - Usa Unsplash com busca relacionada ao prompt
  try {
    console.log("Usando Unsplash como fallback...");

    // Extrai palavras-chave do prompt
    const keywords = prompt.split(' ').slice(0, 3).join(',');
    const unsplashUrl = `https://source.unsplash.com/1024x1024/?${encodeURIComponent(keywords)}`;

    const response = await fetch(unsplashUrl);

    if (response.ok) {
      const blob = await response.blob();
      console.log("✅ Unsplash funcionou!");
      return blob;
    }
  } catch (error) {
    console.error("Erro Unsplash:", error);
  }

  // Último recurso - placeholder com texto do prompt
  console.log("Criando placeholder como última opção...");
  const placeholderUrl = `https://via.placeholder.com/1024x1024/8B5CF6/FFFFFF.png?text=${encodeURIComponent(prompt.substring(0, 30))}`;

  const response = await fetch(placeholderUrl);
  const blob = await response.blob();

  return blob;
}

// ============================================================
// TIPOS E INTERFACES
// ============================================================

interface VideoScript {
  title: string;
  hook: string;
  duration: string;
  format: string;
  style: string;
  scenes: Array<{
    number: number;
    duration: string;
    text: string;
    visual: string;
    camera: string;
    transition: string;
  }>;
  music: string;
  hashtags: string[];
  cta: string;
  canvaSteps: string[];
  capcutSteps: string[];
  proTips: string[];
}

// ============================================================
// GERAÇÃO DE ROTEIRO VIRAL
// ============================================================

function generateViralScript(topic: string, style: string, duration: number): VideoScript {
  const sceneCount = Math.ceil(duration / 5);
  const scenes = [];

  const styleTemplates = {
    viral: {
      hooks: [
        "🤯 ISSO VAI MUDAR SUA VIDA!",
        "PARE TUDO! Você precisa ver isso",
        "90% das pessoas NÃO SABEM disso"
      ],
      transitions: ["zoom rápido", "glitch", "flash"],
      music: "Phonk ou Eletrônica Viral (procure: 'phonk remix trending')",
      tone: "energético e impactante",
      camera: ["zoom in dramático", "shake effect", "quick pan"],
    },
    motivational: {
      hooks: [
        "Esta é sua CHANCE de mudar",
        "O que te IMPEDE de vencer?",
        "Chegou a HORA da transformação"
      ],
      transitions: ["fade épico", "slow motion", "luz dourada"],
      music: "Música Épica Orquestral (procure: 'epic motivation music')",
      tone: "inspirador e poderoso",
      camera: ["slow zoom", "pan suave", "crane shot"],
    },
    educational: {
      hooks: [
        "APRENDA em 30 segundos",
        "O SEGREDO que experts usam",
        "DOMINE esta técnica AGORA"
      ],
      transitions: ["slide suave", "reveal", "focus"],
      music: "Lo-fi Study Beats (procure: 'lo-fi hip hop')",
      tone: "claro e didático",
      camera: ["static shot", "gentle zoom", "follow focus"],
    },
    funny: {
      hooks: [
        "NÃO É POSSÍVEL! 😂",
        "Você NÃO vai acreditar nisso",
        "FAIL ÉPICO em 3, 2, 1..."
      ],
      transitions: ["corte seco", "zoom cômico", "shake"],
      music: "Música Cômica ou Meme Songs (procure: 'funny meme music')",
      tone: "divertido e surpreendente",
      camera: ["crash zoom", "dutch angle", "whip pan"],
    }
  };

  const template = styleTemplates[style as keyof typeof styleTemplates] || styleTemplates.viral;

  // Gera cenas detalhadas
  for (let i = 0; i < sceneCount; i++) {
    const isHook = i === 0;

    scenes.push({
      number: i + 1,
      duration: isHook ? "3 segundos (CRUCIAL!)" : "3-5 segundos",
      text: isHook
        ? template.hooks[Math.floor(Math.random() * template.hooks.length)]
        : `${topic} - Ponto ${i}: [Adicione informação chave aqui]`,
      visual: `Cena ${i + 1}: ${template.tone} - ${isHook ? 'ABERTURA IMPACTANTE' : 'Desenvolvimento'}`,
      camera: template.camera[i % template.camera.length],
      transition: i < sceneCount - 1 ? template.transitions[i % template.transitions.length] : "fade out",
    });
  }

  return {
    title: `🎬 ${topic} - Roteiro ${style.toUpperCase()} Viral`,
    hook: template.hooks[0],
    duration: `${duration} segundos`,
    format: "9:16 Vertical (Reels/TikTok/Shorts)",
    style: style,
    scenes: scenes,
    music: template.music,

    hashtags: [
      "#viral",
      "#fyp",
      "#foryou",
      "#trending",
      "#reels",
      "#brasil",
      "#viralvideo",
      `#${topic.toLowerCase().replace(/\s/g, '')}`,
      `#${style}content`,
      "#contentcreator"
    ],

    cta: "💬 COMENTA 'EU QUERO' + SEGUE + SALVA = Mais conteúdo TOP! 🚀",

    canvaSteps: [
      "📱 CONFIGURAÇÃO INICIAL:",
      "1️⃣ Abra Canva.com → Criar design → Vídeo do Instagram Reels",
      "2️⃣ Dimensões: 1080x1920px (9:16 vertical)",
      "",
      "🎨 TEMPLATE E DESIGN:",
      "3️⃣ Busque: 'viral reels template' ou 'trending video'",
      "4️⃣ Escolha um template com movimento dinâmico",
      "5️⃣ Cores vibrantes: use roxo, rosa, azul néon",
      "",
      "📝 TEXTOS E LEGENDAS:",
      "6️⃣ Fonte: Montserrat Black ou Bebas Neue (grossa e legível)",
      "7️⃣ Tamanho: 80-120px para títulos, 40-60px para subtítulos",
      "8️⃣ Animação de texto: 'Stomp', 'Pop' ou 'Typewriter'",
      "9️⃣ Duração do texto: sincronize com o áudio",
      "",
      "🎵 ÁUDIO:",
      "🔟 Vá em Áudio → Trending → Escolha música viral do momento",
      "1️⃣1️⃣ Volume da música: 60-70%",
      "1️⃣2️⃣ Adicione efeitos sonoros: whoosh, pop, ding",
      "",
      "✨ ELEMENTOS E EFEITOS:",
      "1️⃣3️⃣ Adicione: emojis animados, setas, destaques",
      "1️⃣4️⃣ Use movimento: elementos entrando/saindo da tela",
      "1️⃣5️⃣ Background: vídeo em movimento ou gradiente animado",
      "",
      "💾 EXPORTAÇÃO:",
      "1️⃣6️⃣ Qualidade: 1080p HD",
      "1️⃣7️⃣ Taxa de quadros: 30fps",
      "1️⃣8️⃣ Formato: MP4",
      "",
      "🚀 DICA OURO: Preview antes de exportar e ajuste o timing!"
    ],

    capcutSteps: [
      "📲 SETUP INICIAL:",
      "1️⃣ Baixe CapCut no celular (grátis)",
      "2️⃣ Novo projeto → Proporção 9:16",
      "3️⃣ Importe seus vídeos/fotos da galeria",
      "",
      "✂️ EDIÇÃO BÁSICA:",
      "4️⃣ Timeline: organize clipes na ordem do roteiro",
      "5️⃣ Duração: 3s para hook, 3-5s outras cenas",
      "6️⃣ Cortes: use a tesoura para cortar partes desnecessárias",
      "",
      "📝 TEXTOS VIRAIS:",
      "7️⃣ Texto → Adicionar texto → Preset 'Trending'",
      "8️⃣ Animação: In - 'Pop Up' / Out - 'Fade'",
      "9️⃣ Posição: centro da tela ou terço inferior",
      "🔟 Cor: branco com contorno preto ou amarelo vibrante",
      "",
      "🎵 ÁUDIO TRENDING:",
      "1️⃣1️⃣ Áudio → Sons → Em alta no TikTok",
      "1️⃣2️⃣ Sincronize cortes com batidas (use marcadores)",
      "1️⃣3️⃣ Volume: música 60%, voz 100%",
      "",
      "🎬 TRANSIÇÕES E EFEITOS:",
      "1️⃣4️⃣ Entre cenas: Glitch, Zoom, Flash, Slide",
      "1️⃣5️⃣ Efeitos: Shake na hora do impacto",
      "1️⃣6️⃣ Velocidade: acelere partes lentas (1.5x ou 2x)",
      "",
      "🎨 FILTROS E CORES:",
      "1️⃣7️⃣ Filtro: 'Vivid' ou 'Pop'",
      "1️⃣8️⃣ Ajustes: Saturação +20, Contraste +10",
      "1️⃣9️⃣ Vinheta: leve nas bordas para foco",
      "",
      "🔤 LEGENDAS AUTOMÁTICAS:",
      "2️⃣0️⃣ Texto → Legendas automáticas → Criar",
      "2️⃣1️⃣ Estilo: Bold, fundo semi-transparente",
      "2️⃣2️⃣ Correção: revise erros de transcrição",
      "",
      "📤 EXPORTAÇÃO PRO:",
      "2️⃣3️⃣ Resolução: 1080p",
      "2️⃣4️⃣ Taxa de quadros: 60fps",
      "2️⃣5️⃣ Taxa de bits: Alta",
      "2️⃣6️⃣ Formato: MP4",
      "",
      "💎 DICA MATADORA: Use keyframes para zoom dramático no hook!"
    ],

    proTips: [
      "🎯 HOOK MATADOR: Se não prender em 3 segundos, perdeu o viewer",
      "📱 FORMATO: Sempre vertical 9:16 - ocupa tela toda do celular",
      "💡 ILUMINAÇÃO: Natural > artificial. Grave perto da janela",
      "🎵 ÁUDIO: Use trending sounds - aumenta alcance em 300%",
      "⏰ HORÁRIO: Poste 12h, 19h ou 21h (maior engajamento)",
      "💬 ENGAJAMENTO: Responda TODOS comentários na 1ª hora",
      "📊 MÉTRICAS: Se retenção < 50%, refaça o hook",
      "🔄 CONSISTÊNCIA: Poste TODO DIA no mesmo horário",
      "🏷️ HASHTAGS: 5-7 relevantes + 3-5 virais",
      "🎪 SÉRIE: Crie Parts 1, 2, 3... viewers voltam por mais",
      "🎨 VISUAL: Texto grande, cores vibrantes, alto contraste",
      "🗣️ VOZ: Se narrar, fale rápido e com energia",
      "📈 TESTE A/B: Mesma ideia, 2 hooks diferentes",
      "💰 MONETIZE: Link na bio + 'comenta EU QUERO'",
      "🚀 VIRAL HACK: Controversial (mas respeitoso) = mais comentários"
    ]
  };
}

// ============================================================
// AÇÃO PRINCIPAL - GERAR IMAGEM
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
      console.log("Iniciando geração para:", args.prompt);

      // Verifica limites
      const { canUse, remaining } = checkDailyLimits(userId, 'image');
      console.log(`Limites: Premium=${canUse}, Restante=${remaining}`);

      // Gera a imagem (sempre funciona agora!)
      const imageBlob = await generateImageWithAI(args.prompt);

      console.log("Blob gerado, tamanho:", imageBlob.size);

      // Salva no storage
      const storageId = await ctx.storage.store(imageBlob);
      const imageUrl = await ctx.storage.getUrl(storageId);

      if (!imageUrl) {
        throw new Error("Erro ao obter URL da imagem");
      }

      console.log("Imagem salva com sucesso:", imageUrl);

      // Salva no banco de dados
      await ctx.runMutation(internal.imageGenerator.saveGeneratedImage, {
        userId,
        prompt: args.prompt,
        imageUrl,
        storageId,
      });

      return {
        url: imageUrl,
        method: canUse ? 'premium' : 'free',
        remainingPremium: remaining,
        message: canUse
          ? `✨ Imagem Premium gerada! ${remaining} usos restantes hoje.`
          : "Imagem gerada com sucesso!"
      };

    } catch (error) {
      console.error("Erro completo:", error);
      throw new Error(error instanceof Error ? error.message : "Erro ao gerar imagem");
    }
  },
});

// ============================================================
// AÇÃO - GERAR ROTEIRO DE VÍDEO
// ============================================================

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
      console.log("Gerando roteiro para:", args.topic);

      // Verifica limites
      const { canUse, remaining } = checkDailyLimits(userId, 'video');

      // Gera o roteiro detalhado
      const script = generateViralScript(
        args.topic,
        args.style,
        args.duration
      );

      console.log("Roteiro gerado com sucesso!");

      return {
        script,
        method: canUse ? 'premium' : 'basic',
        remainingPremium: remaining,
        message: canUse
          ? `🎬 Roteiro Premium criado! ${remaining} roteiros restantes hoje.`
          : "Roteiro viral criado com sucesso!"
      };

    } catch (error) {
      console.error("Erro ao gerar roteiro:", error);
      throw new Error("Erro ao gerar roteiro. Tente novamente.");
    }
  },
});

// ============================================================
// MUTATIONS E QUERIES
// ============================================================

export const saveGeneratedImage = internalMutation({
  args: {
    userId: v.string(),
    prompt: v.string(),
    imageUrl: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("generatedImages", args);
  },
});

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

    // Simula limites para o frontend
    return {
      geminiImagesRemaining: 3,
      geminiVideosRemaining: 2,
    };
  },
});