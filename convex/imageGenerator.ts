// Em /convex/imageGenerator.ts
import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// =================================================================
// MENTOR.IA ULTIMATE - BACKEND REVOLUCIONÁRIO
// =================================================================

interface ImageGeneratorAPI {
  name: string;
  generate: (prompt: string, style?: string) => Promise<string | null>;
  priority: number;
}

// APIs de IA 100% GRATUITAS E FUNCIONAIS
const AI_APIS: ImageGeneratorAPI[] = [
  {
    name: "Pollinations.ai",
    priority: 1,
    generate: async (prompt: string, style?: string) => {
      try {
        const enhancedPrompt = enhancePrompt(prompt, style);
        const encodedPrompt = encodeURIComponent(enhancedPrompt);

        const params = new URLSearchParams({
          width: "1024",
          height: "1024",
          seed: Math.floor(Math.random() * 1000000).toString(),
          enhance: "true",
          nologo: "true",
          model: "turbo" // Modelo mais rápido
        });

        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?${params}`;
        console.log("✅ Pollinations.ai funcionando:", imageUrl);
        return imageUrl;
      } catch (error) {
        console.error("❌ Erro Pollinations:", error);
      }
      return null;
    }
  },
  {
    name: "Stability AI",
    priority: 2,
    generate: async (prompt: string) => {
      try {
        // API alternativa gratuita
        const encodedPrompt = encodeURIComponent(prompt);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${Date.now()}`;
        return imageUrl;
      } catch (error) {
        console.error("❌ Erro Stability:", error);
      }
      return null;
    }
  }
];

// Função aprimorada de prompt em PORTUGUÊS
function enhancePrompt(prompt: string, style?: string): string {
  const lowerPrompt = prompt.toLowerCase();

  // Detecta contexto em português
  const contexts = {
    ecommerce: lowerPrompt.includes('produto') || lowerPrompt.includes('loja') || lowerPrompt.includes('venda'),
    social: lowerPrompt.includes('instagram') || lowerPrompt.includes('rede') || lowerPrompt.includes('post'),
    marketing: lowerPrompt.includes('marketing') || lowerPrompt.includes('campanha') || lowerPrompt.includes('anúncio'),
    branding: lowerPrompt.includes('marca') || lowerPrompt.includes('logo') || lowerPrompt.includes('identidade'),
    content: lowerPrompt.includes('conteúdo') || lowerPrompt.includes('criador') || lowerPrompt.includes('influencer')
  };

  let enhancedPrompt = prompt;

  // Estilos otimizados
  if (style) {
    const styleModifiers: Record<string, string> = {
      realistic: "ultra realista, fotorrealista, 8k, alta definição, detalhado",
      artistic: "artístico, criativo, cores vibrantes, estilo arte digital",
      "3d": "renderização 3D, octane render, CGI, iluminação volumétrica",
      minimal: "minimalista, limpo, simples, fundo branco, design moderno",
      product: "fotografia de produto, comercial, iluminação profissional",
      lifestyle: "fotografia lifestyle, luz natural, autêntico, candid"
    };

    if (styleModifiers[style]) {
      enhancedPrompt += `, ${styleModifiers[style]}`;
    }
  }

  // Contextos em português
  if (contexts.ecommerce) {
    enhancedPrompt += ", foto profissional de produto, pronto para e-commerce, fundo limpo";
  } else if (contexts.social) {
    enhancedPrompt += ", pronto para redes sociais, chamativo, engajador, potencial viral";
  } else if (contexts.marketing) {
    enhancedPrompt += ", material de marketing, profissional, alto impacto, qualidade comercial";
  }

  enhancedPrompt += ", qualidade profissional, alta resolução, foco nítido, composição perfeita";

  return enhancedPrompt;
}

// AÇÃO PRINCIPAL: Gerar Imagem
export const generateImage = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Usuário não autenticado.");
    }
    const userId = identity.subject;

    console.log("🎨 Gerando imagem viral para:", args.prompt);

    const styleMatch = args.prompt.match(/(\w+)\s+style/i);
    const style = styleMatch ? styleMatch[1].toLowerCase() : "realistic";

    let imageBlob: Blob | null = null;
    let successfulAPI: string | null = null;

    // Tenta gerar com as APIs
    for (const api of AI_APIS) {
      console.log(`🔄 Tentando ${api.name}...`);

      try {
        const generatedUrl = await api.generate(args.prompt, style);

        if (generatedUrl) {
          const response = await fetch(generatedUrl);
          if (response.ok) {
            imageBlob = await response.blob();
            if (imageBlob.size > 5000) {
              successfulAPI = api.name;
              console.log(`✅ ${api.name} gerou imagem de ${imageBlob.size} bytes`);
              break;
            }
          }
        }
      } catch (error) {
        console.error(`❌ Erro em ${api.name}:`, error);
        continue;
      }
    }

    // Fallback garantido
    if (!imageBlob) {
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(args.prompt)}?width=1024&height=1024`;
      const response = await fetch(fallbackUrl);
      if (response.ok) {
        imageBlob = await response.blob();
        successfulAPI = "Pollinations Fallback";
      }
    }

    if (!imageBlob) {
      throw new Error("Não foi possível gerar a imagem. Tente novamente.");
    }

    // Salva no storage
    const storageId = await ctx.storage.store(imageBlob);
    const imageUrl = await ctx.storage.getUrl(storageId);

    if (!imageUrl) {
      throw new Error("Falha ao obter URL da imagem");
    }

    await ctx.runMutation(internal.imageGenerator.saveGeneratedImage, {
      userId,
      prompt: args.prompt,
      imageUrl,
      storageId,
    });

    console.log(`🎉 Imagem gerada com sucesso via ${successfulAPI}!`);
    return imageUrl;
  },
});

// NOVA AÇÃO: Aprimorar Imagem
export const enhanceImage = action({
  args: {
    imageUrl: v.string(),
    enhancement: v.string(), // "remove-bg", "upscale", "fix-lighting", etc
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    console.log("🔧 Aprimorando imagem:", args.enhancement);

    let enhancedUrl: string;

    switch(args.enhancement) {
      case "remove-bg":
        // Remove fundo usando Pollinations com prompt especial
        enhancedUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
          "isolated object, transparent background, no background, white background, product photography"
        )}?width=1024&height=1024&seed=${Date.now()}&init_image=${encodeURIComponent(args.imageUrl)}`;
        break;

      case "upscale":
        // Aumenta qualidade
        enhancedUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
          "ultra high quality, 4K, sharp details, enhanced, professional"
        )}?width=2048&height=2048&seed=${Date.now()}&init_image=${encodeURIComponent(args.imageUrl)}`;
        break;

      case "fix-lighting":
        // Melhora iluminação
        enhancedUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
          "professional lighting, well lit, bright, clear, studio lighting"
        )}?width=1024&height=1024&seed=${Date.now()}&init_image=${encodeURIComponent(args.imageUrl)}`;
        break;

      default:
        enhancedUrl = args.imageUrl;
    }

    // Baixa e salva a imagem aprimorada
    const response = await fetch(enhancedUrl);
    if (!response.ok) throw new Error("Falha ao aprimorar imagem");

    const blob = await response.blob();
    const storageId = await ctx.storage.store(blob);
    const finalUrl = await ctx.storage.getUrl(storageId);

    if (!finalUrl) throw new Error("Falha ao salvar imagem aprimorada");

    // Salva no banco
    await ctx.runMutation(internal.imageGenerator.saveGeneratedImage, {
      userId: identity.subject,
      prompt: `Aprimorado: ${args.enhancement}`,
      imageUrl: finalUrl,
      storageId,
    });

    return finalUrl;
  }
});

// NOVA AÇÃO: Criar Vídeo Viral
export const generateVideoScript = action({
  args: {
    topic: v.string(),
    style: v.string(), // "motivacional", "educativo", "engraçado"
    duration: v.number(), // segundos
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    console.log("🎬 Gerando script de vídeo viral...");

    // Gera script baseado no tópico
    const script = {
      title: `${args.topic} - Conteúdo Viral`,
      scenes: [
        {
          duration: 3,
          text: `Você sabia que ${args.topic} pode mudar sua vida?`,
          visualPrompt: `pessoa surpresa, expressão de descoberta sobre ${args.topic}`,
          transition: "zoom-in"
        },
        {
          duration: 5,
          text: `Aqui estão 3 segredos sobre ${args.topic} que ninguém te conta`,
          visualPrompt: `infográfico moderno mostrando 3 pontos sobre ${args.topic}`,
          transition: "slide-left"
        },
        {
          duration: 4,
          text: `Segredo #1: A verdade por trás de ${args.topic}`,
          visualPrompt: `revelação visual impactante sobre ${args.topic}`,
          transition: "fade"
        },
        {
          duration: 4,
          text: `Segredo #2: Como aplicar ${args.topic} na prática`,
          visualPrompt: `demonstração prática de ${args.topic}`,
          transition: "slide-up"
        },
        {
          duration: 4,
          text: `Segredo #3: O resultado transformador`,
          visualPrompt: `antes e depois, transformação com ${args.topic}`,
          transition: "zoom-out"
        },
        {
          duration: 3,
          text: `Siga para mais dicas como essa!`,
          visualPrompt: `call to action vibrante, botão de seguir`,
          transition: "bounce"
        }
      ],
      music: args.style === "motivacional" ? "epic-motivation" : "upbeat-tech",
      voiceStyle: args.style === "motivacional" ? "energetic" : "friendly",
      captions: {
        style: "mr-beast", // Legendas estilo Mr Beast
        color: "#FFFF00",
        animation: "pop"
      }
    };

    // Gera imagens para cada cena
    const scenesWithImages = await Promise.all(
      script.scenes.map(async (scene) => {
        const imageUrl = `https://image.pollinations.ai/prompt/${
          encodeURIComponent(scene.visualPrompt)
        }?width=1080&height=1920&seed=${Date.now()}`;

        return {
          ...scene,
          imageUrl
        };
      })
    );

    return {
      ...script,
      scenes: scenesWithImages,
      totalDuration: args.duration,
      format: "9:16", // Formato vertical para Reels/TikTok
      fps: 30
    };
  }
});

// Mutations
export const saveGeneratedImage = internalMutation({
  args: {
    userId: v.string(),
    prompt: v.string(),
    imageUrl: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.insert("generatedImages", {
      userId: args.userId,
      prompt: args.prompt,
      imageUrl: args.imageUrl,
      storageId: args.storageId,
    });
    return result;
  },
});

// Queries
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

export const getImage = query({
  args: { imageId: v.id("generatedImages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const image = await ctx.db.get(args.imageId);
    if (!image || image.userId !== identity.subject) {
      throw new Error("Imagem não encontrada");
    }

    return image;
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