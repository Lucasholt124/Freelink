// /convex/imageGenerator.ts - VERSÃO CORRIGIDA COM STABILITY AI

import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// ============================================================
// 🔥 CONFIGURAÇÃO DA API KEY
// ============================================================

// Adicione sua API key da Stability AI no painel do Convex em Settings > Environment Variables
// Nome da variável: STABILITY_API_KEY
// Para obter uma key grátis: https://platform.stability.ai/account/keys (25 créditos grátis ao criar conta)

// ============================================================
// 🎯 TRADUÇÃO E MELHORAMENTO DE PROMPT INTELIGENTE
// ============================================================

function enhancePrompt(originalPrompt: string): string {
  // Traduções comuns PT -> EN
  const translations: Record<string, string> = {
    // Objetos e conceitos
    "cachorro": "dog",
    "gato": "cat",
    "pessoa": "person",
    "mulher": "woman",
    "homem": "man",
    "criança": "child",
    "bebê": "baby",
    "rosto": "face",
    "retrato": "portrait",
    "paisagem": "landscape",
    "cidade": "city",
    "praia": "beach",
    "montanha": "mountain",
    "floresta": "forest",
    "oceano": "ocean",
    "carro": "car",
    "casa": "house",
    "prédio": "building",
    "escritório": "office",
    "loja": "shop",
    "produto": "product",
    "comida": "food",
    "natureza": "nature",
    "animais": "animals",
    "flores": "flowers",
    "árvore": "tree",
    "céu": "sky",
    "nuvens": "clouds",
    "sol": "sun",
    "lua": "moon",
    "estrelas": "stars",

    // Estilos
    "realista": "realistic",
    "foto realista": "photorealistic",
    "desenho": "drawing",
    "pintura": "painting",
    "arte digital": "digital art",
    "ilustração": "illustration",
    "cartoon": "cartoon",
    "anime": "anime style",
    "minimalista": "minimalist",
    "moderno": "modern",
    "vintage": "vintage",
    "futurista": "futuristic",
    "abstrato": "abstract",
    "3d": "3d render",

    // Qualidades
    "alta qualidade": "high quality",
    "detalhado": "detailed",
    "profissional": "professional",
    "cinematográfico": "cinematic",
    "épico": "epic",
    "dramático": "dramatic",
    "vibrante": "vibrant",
    "colorido": "colorful",
    "escuro": "dark",
    "claro": "bright",
    "iluminado": "illuminated",
    "sombrio": "shadowy",
    "bonito": "beautiful",
    "lindo": "gorgeous",

    // Ações
    "correndo": "running",
    "pulando": "jumping",
    "sorrindo": "smiling",
    "chorando": "crying",
    "sentado": "sitting",
    "em pé": "standing",
    "voando": "flying",
    "nadando": "swimming",
    "caminhando": "walking",
    "dançando": "dancing",

    // Cores
    "vermelho": "red",
    "azul": "blue",
    "verde": "green",
    "amarelo": "yellow",
    "roxo": "purple",
    "laranja": "orange",
    "rosa": "pink",
    "preto": "black",
    "branco": "white",
    "cinza": "gray",
    "dourado": "golden",
    "prateado": "silver",
    "marrom": "brown",

    // Contextos de negócio
    "logo": "logo",
    "logotipo": "logo design",
    "marca": "brand",
    "empresa": "company",
    "negócio": "business",
    "venda": "sale",
    "promoção": "promotion",
    "desconto": "discount",
    "oferta": "offer",
    "anúncio": "advertisement",
    "banner": "banner",
    "post": "social media post",
    "story": "story",
    "thumbnail": "thumbnail",
    "capa": "cover",

    // Comandos especiais
    "imagem de atenção": "attention grabbing image, eye catching visual",
    "chamativo": "eye catching",
    "viral": "viral trending",
    "tendência": "trending",
    "popular": "popular",
    "urgente": "urgent",
    "importante": "important"
  };

  let enhancedPrompt = originalPrompt.toLowerCase();

  // Aplica traduções
  Object.entries(translations).forEach(([pt, en]) => {
    const regex = new RegExp(`\\b${pt}\\b`, 'gi');
    enhancedPrompt = enhancedPrompt.replace(regex, en);
  });

  // Se ainda tiver caracteres especiais portugueses, adiciona contexto
  if (/[àáâãèéêìíîòóôõùúûç]/i.test(enhancedPrompt)) {
    // Remove acentos mas mantém o sentido
    enhancedPrompt = enhancedPrompt
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  // Adiciona qualidade se não especificado
  if (!enhancedPrompt.includes('quality') && !enhancedPrompt.includes('detailed')) {
    enhancedPrompt += ", high quality, ultra detailed, sharp focus, professional";
  }

  // Adiciona estilo se não especificado
  if (!enhancedPrompt.includes('style') && !enhancedPrompt.includes('realistic') && !enhancedPrompt.includes('art')) {
    enhancedPrompt += ", professional photography style, best quality";
  }

  // Remove espaços duplos e limpa
  enhancedPrompt = enhancedPrompt.replace(/\s+/g, ' ').trim();

  console.log("✨ Prompt melhorado:", enhancedPrompt);
  return enhancedPrompt;
}

// ============================================================
// 🎨 STABILITY AI - MELHOR QUALIDADE (STABLE DIFFUSION XL)
// ============================================================

async function generateWithStabilityAI(prompt: string, apiKey: string | undefined): Promise<Blob | null> {
  if (!apiKey || apiKey === "not_configured") {
    console.log("⚠️ Stability AI não configurada");
    return null;
  }

  try {
    console.log("🎨 Gerando com Stability AI (Qualidade Premium)...");

    const response = await fetch("https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1
          },
          {
            text: "blurry, bad quality, ugly, distorted, disfigured, low resolution, bad anatomy, worst quality, low quality",
            weight: -1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
        style_preset: "photographic"
      })
    });

    if (response.ok) {
      const data = await response.json();

      if (data.artifacts && data.artifacts[0]) {
        // Stability retorna base64
        const base64 = data.artifacts[0].base64;
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });

        console.log("✅ Stability AI gerou com sucesso! (Alta Qualidade)");
        return blob;
      }
    } else {
      const error = await response.text();
      console.error("❌ Erro Stability AI:", error);

      // Se for erro de créditos, continua para próxima API
      if (response.status === 402) {
        console.log("⚠️ Créditos Stability AI esgotados, tentando alternativa...");
      }
    }
  } catch (error) {
    console.error("❌ Erro ao conectar com Stability AI:", error);
  }

  return null;
}

// ============================================================
// 🌟 POLLINATIONS AI - MODELO FLUX (GRÁTIS E BOM)
// ============================================================

async function generateWithPollinations(prompt: string, model: 'flux' | 'turbo' = 'flux'): Promise<Blob | null> {
  try {
    console.log(`🌟 Gerando com Pollinations ${model.toUpperCase()}...`);

    // Pollinations com modelo Flux (melhor) ou Turbo (mais rápido)
    const params = new URLSearchParams({
      width: '1024',
      height: '1024',
      seed: Math.floor(Math.random() * 1000000).toString(),
      model: model,
      nologo: 'true'
    });

    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params}`;

    console.log("📍 Gerando imagem baseada no prompt...");

    // Primeira requisição para iniciar geração
    const response1 = await fetch(url);

    // Se a primeira já retornar a imagem
    if (response1.ok) {
      const blob1 = await response1.blob();
      if (blob1.size > 50000) { // Imagens reais são maiores que 50KB
        console.log(`✅ Pollinations ${model.toUpperCase()} gerou na primeira tentativa!`);
        return blob1;
      }
    }

    // Aguarda processamento
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Segunda tentativa
    const response2 = await fetch(url);

    if (response2.ok) {
      const blob = await response2.blob();

      if (blob.size > 50000) { // Garante que é uma imagem real
        console.log(`✅ Pollinations ${model.toUpperCase()} funcionou!`);
        return blob;
      }
    }

    // Se Flux falhar, tenta Turbo
    if (model === 'flux') {
      console.log("⚠️ Flux não respondeu, tentando Turbo...");
      return generateWithPollinations(prompt, 'turbo');
    }

  } catch (error) {
    console.log(`⚠️ Erro Pollinations ${model}:`, error);
  }

  return null;
}

// ============================================================
// 🤖 CRAIYON - DALL-E MINI (BACKUP - ENTENDE BEM PROMPTS)
// ============================================================

async function generateWithCraiyon(prompt: string): Promise<Blob | null> {
  try {
    console.log("🤖 Gerando com Craiyon (pode demorar 20-30s)...");

    const response = await fetch("https://backend.craiyon.com/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        version: "c4ue22fb7kb6wlac",
        token: null
      })
    });

    if (response.ok) {
      const data = await response.json();

      if (data.images && data.images.length > 0) {
        // Pega a primeira imagem (melhor qualidade)
        const base64 = data.images[0];

        // Remove prefixo se houver
        const cleanBase64 = base64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

        // Converte base64 para blob
        const byteCharacters = atob(cleanBase64);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });

        console.log("✅ Craiyon gerou com sucesso!");
        return blob;
      }
    }
  } catch (error) {
    console.log("⚠️ Craiyon erro:", error);
  }

  return null;
}

// ============================================================
// 🚀 FUNÇÃO PRINCIPAL - APENAS AS MELHORES IAs
// ============================================================

async function generateImageWithAI(prompt: string): Promise<Blob> {
  console.log("🚀 Iniciando geração com as MELHORES IAs...");
  console.log("📝 Prompt original:", prompt);

  // Melhora o prompt
  const enhancedPrompt = enhancePrompt(prompt);

  // Pega a API key do environment
  const stabilityApiKey = process.env.STABILITY_API_KEY;

  // Lista de geradores em ordem de qualidade
  const generators = [
    {
      name: "Stability AI (Premium Quality)",
      fn: () => generateWithStabilityAI(enhancedPrompt, stabilityApiKey),
      quality: 10
    },
    {
      name: "Pollinations Flux (High Quality)",
      fn: () => generateWithPollinations(enhancedPrompt, 'flux'),
      quality: 8
    },
    {
      name: "Pollinations Turbo (Fast)",
      fn: () => generateWithPollinations(enhancedPrompt, 'turbo'),
      quality: 7
    },
    {
      name: "Craiyon (DALL-E Mini)",
      fn: () => generateWithCraiyon(enhancedPrompt),
      quality: 6
    }
  ];

  // Tenta cada gerador
  for (const generator of generators) {
    try {
      console.log(`🔄 Tentando ${generator.name}...`);

      const blob = await generator.fn();

      if (blob && blob.size > 10000) { // Mínimo 10KB para ser válida
        console.log(`✅ SUCESSO com ${generator.name}! Qualidade: ${generator.quality}/10`);
        return blob;
      }

      console.log(`⚠️ ${generator.name} não retornou imagem válida`);
    } catch (error) {
      console.log(`❌ ${generator.name} erro:`, error);
    }
  }

  // Última tentativa com Pollinations simplificado
  console.log("🔄 Última tentativa com Pollinations básico...");

  try {
    const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
    const fallbackResponse = await fetch(fallbackUrl);

    if (fallbackResponse.ok) {
      const fallbackBlob = await fallbackResponse.blob();
      if (fallbackBlob.size > 5000) {
        console.log("✅ Fallback funcionou!");
        return fallbackBlob;
      }
    }
  } catch (error) {
    console.log("❌ Fallback falhou:", error);
  }

  throw new Error("Não foi possível gerar a imagem. Por favor, tente novamente em alguns instantes.");
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
// 🚀 AÇÃO PRINCIPAL - GERAR IMAGEM (SEM LIMITES)
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
      console.log("🎨 Iniciando geração para:", userId);
      console.log("📝 Prompt recebido:", args.prompt);

      // Gera a imagem com as MELHORES IAs
      const imageBlob = await generateImageWithAI(args.prompt);

      console.log("✅ Imagem gerada com sucesso! Tamanho:", imageBlob.size);

      // Salva no storage
      const storageId = await ctx.storage.store(imageBlob);
      const imageUrl = await ctx.storage.getUrl(storageId);

      if (!imageUrl) {
        throw new Error("Erro ao salvar imagem");
      }

      console.log("💾 Imagem salva:", imageUrl);

      // Salva no banco
      await ctx.runMutation(internal.imageGenerator.saveGeneratedImage, {
        userId,
        prompt: args.prompt,
        imageUrl,
        storageId,
      });

      return {
        url: imageUrl,
        method: 'premium',
        remainingPremium: 999, // Sem limites
        message: `🎉 Imagem gerada com sucesso usando IA de alta qualidade!`
      };

    } catch (error) {
      console.error("❌ Erro:", error);

      if (error instanceof Error) {
        throw error;
      }

      throw new Error("Erro ao gerar imagem. Tente novamente!");
    }
  },
});

// ============================================================
// 🎬 AÇÃO - GERAR ROTEIRO DE VÍDEO (SEM LIMITES)
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

    try {
      console.log("🎬 Gerando roteiro para:", args.topic);

      const script = generateViralScript(
        args.topic,
        args.style,
        args.duration
      );

      console.log("✅ Roteiro gerado!");

      return {
        script,
        method: 'premium',
        remainingPremium: 999, // Sem limites
        message: `🎬 Roteiro viral criado com sucesso!`
      };

    } catch (error) {
      console.error("❌ Erro:", error);
      throw new Error("Erro ao gerar roteiro. Tente novamente!");
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
      .take(100);

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

    // Sem limites - sempre retorna 999
    return {
      geminiImagesRemaining: 999,
      geminiVideosRemaining: 999,
    };
  },
});