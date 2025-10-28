// /convex/imageGenerator.ts - VERSÃO CORRIGIDA PARA ENTENDER SAAS/SOFTWARE/INTERFACES
import { action, mutation, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import Groq from 'groq-sdk';
import { internal } from "./_generated/api";

// ========================================================
// 🔥 CONFIGURAÇÃO DAS API KEYS
// ==========================================================
const huggingFaceApiKey = process.env.HUGGING_FACE_API_KEY;

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY, }) : null;

// ========================================================
// 🎯 MELHORADOR DE PROMPT INTELIGENTE
// ==========================================================
function enhancePromptIntelligently(originalPrompt: string): string {
  // Detectar o tipo de conteúdo que o usuário quer
  const isSoftware = /\b(saas|software|app|application|website|site|landing page|dashboard|interface|ui|ux|platform|sistema|plataforma|ferramenta|tool)\b/i.test(originalPrompt);
  const isLogo = /\b(logo|logotipo|brand|marca|branding)\b/i.test(originalPrompt);
  const isPerson = /\b(pessoa|person|people|homem|man|mulher|woman|retrato|portrait|rosto|face)\b/i.test(originalPrompt);
  const isProduct = /\b(produto|product|mockup|package|embalagem|packaging)\b/i.test(originalPrompt);

  let enhancedPrompt = originalPrompt;

  // 🔥 CORREÇÃO PRINCIPAL: Se for SaaS/Software, adicionar contexto correto
  if (isSoftware) {
    // Extrair o nome do software/saas
    const nameMatch = originalPrompt.match(/\b(?:nome|name|chamado|called)\s+(\w+)/i);
    const brandName = nameMatch ? nameMatch[1] : "";

    // Remover partes redundantes
    enhancedPrompt = originalPrompt.replace(/imagem do meu|image of my|imagem de um/gi, "");

    // Reconstruir o prompt de forma clara
    if (originalPrompt.toLowerCase().includes("saas")) {
      enhancedPrompt = `Modern SaaS dashboard interface for "${brandName || 'Freelinnk'}", professional web application UI design, clean minimalist layout with sidebar navigation, data visualization charts, user metrics, gradient purple and blue color scheme, glass morphism effects, dark mode, high resolution screenshot, Figma design, Dribbble quality, trending on Behance`;
    } else if (originalPrompt.toLowerCase().includes("landing")) {
      enhancedPrompt = `Modern landing page for "${brandName}" SaaS platform, hero section with gradient background, professional web design, call-to-action buttons, feature sections, testimonials, pricing cards, responsive design mockup, clean UI, trending web design 2025`;
    } else if (originalPrompt.toLowerCase().includes("app")) {
      enhancedPrompt = `Mobile app interface for "${brandName}", modern UI design, iPhone mockup, clean minimal design, professional app screens, user-friendly interface, trending on Dribbble`;
    } else if (originalPrompt.toLowerCase().includes("website")) {
      enhancedPrompt = `Professional website design for "${brandName}", modern web interface, homepage layout, clean UI/UX design, responsive design, high quality mockup`;
    } else {
      // Genérico para software
      enhancedPrompt = `Professional software interface design for "${brandName}", modern dashboard UI, clean layout, data visualization, sidebar navigation, user-friendly design, high resolution, trending UI design`;
    }

    // Adicionar especificações técnicas
    enhancedPrompt += ", UI/UX design, Figma, no people, no characters, interface only, software screenshot";

  } else if (isLogo) {
    // Para logos
    const nameMatch = originalPrompt.match(/\b(?:nome|name|chamado|called)\s+(\w+)/i);
    const brandName = nameMatch ? nameMatch[1] : "Brand";

    enhancedPrompt = `Professional logo design for "${brandName}", modern minimalist logo, vector design, clean typography, gradient colors, brand identity, logo mockup on white background, high quality, trending on Behance, no people`;

  } else if (isProduct) {
    // Para produtos
    enhancedPrompt = originalPrompt + ", product photography, professional studio lighting, clean background, high quality product shot, commercial photography, no people";

  } else if (!isPerson) {
    // Se não for pessoa, garantir que não gere pessoas
    enhancedPrompt = originalPrompt + ", no people, no characters, no portraits";
  }

  // Tradução básica de termos em português
  const translations: Record<string, string> = {
    "imagem": "image",
    "foto": "photo",
    "com": "with",
    "nome": "name",
    "chamado": "called",
    "meu": "my",
    "minha": "my",
    "para": "for",
    "de": "of",
    "e": "and",
    "ou": "or",
    "profissional": "professional",
    "moderno": "modern",
    "limpo": "clean",
    "minimalista": "minimalist"
  };

  Object.entries(translations).forEach(([pt, en]) => {
    const regex = new RegExp(`\\b${pt}\\b`, 'gi');
    enhancedPrompt = enhancedPrompt.replace(regex, en);
  });

  console.log("🎯 Prompt original:", originalPrompt);
  console.log("✨ Prompt melhorado:", enhancedPrompt);
  console.log("📊 Tipo detectado:", isSoftware ? "SOFTWARE/SAAS" : isLogo ? "LOGO" : isProduct ? "PRODUTO" : "GENÉRICO");

  return enhancedPrompt;
}

// ========================================================
// 🚀 HUGGING FACE - MELHORES MODELOS PARA CADA TIPO
// ==========================================================
async function generateWithHuggingFace(prompt: string, model: string): Promise<Blob | null> {
  if (!huggingFaceApiKey) {
    console.log("⚠️ Hugging Face API key não configurada");
    return null;
  }

  try {
    console.log(`🤗 Gerando com Hugging Face: ${model}...`);

    // Configurações específicas para interfaces/software
    const isInterface = /\b(dashboard|interface|ui|ux|saas|software|website|landing)\b/i.test(prompt);

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${huggingFaceApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            negative_prompt: isInterface ?
              "people, person, human, face, portrait, character, cartoon, anime, illustration, drawing, sketch, blurry, bad quality" :
              "blurry, bad quality, distorted, ugly, bad anatomy",
            num_inference_steps: isInterface ? 30 : 25,
            guidance_scale: isInterface ? 8.5 : 7.5,
            width: 1024,
            height: isInterface ? 768 : 1024  // Interfaces ficam melhor em 16:9
          },
          options: {
            wait_for_model: true
          }
        }),
      }
    );

    if (response.ok) {
      const blob = await response.blob();
      if (blob.size > 10000) {
        console.log(`✅ Hugging Face (${model}) gerou com sucesso!`);
        return blob;
      }
    } else {
      const errorText = await response.text();
      console.log(`⚠️ Erro no modelo ${model}:`, errorText);

      if (errorText.includes("loading")) {
        console.log("⏳ Modelo carregando, aguardando...");
        await new Promise(resolve => setTimeout(resolve, 15000));

        const retryResponse = await fetch(
          `https://api-inference.huggingface.co/models/${model}`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${huggingFaceApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              inputs: prompt,
              options: { wait_for_model: true }
            }),
          }
        );

        if (retryResponse.ok) {
          const retryBlob = await retryResponse.blob();
          if (retryBlob.size > 10000) {
            console.log(`✅ Funcionou na segunda tentativa!`);
            return retryBlob;
          }
        }
      }
    }
  } catch (error) {
    console.log(`❌ Erro Hugging Face (${model}):`, error);
  }
  return null;
}

// ========================================================
// 🌟 POLLINATIONS - OTIMIZADO PARA INTERFACES
// ==========================================================
async function generateWithPollinations(prompt: string): Promise<Blob | null> {
  try {
    console.log("🌟 Gerando com Pollinations...");

    // Detectar se é interface/software
    const isInterface = /\b(dashboard|interface|ui|ux|saas|software|website|landing)\b/i.test(prompt);

    const params = new URLSearchParams({
      width: isInterface ? '1280' : '1024',
      height: isInterface ? '720' : '1024',
      seed: Math.floor(Math.random() * 1000000).toString(),
      model: 'flux',
      nologo: 'true',
      enhance: 'true'
    });

    // Adicionar modificadores para interface
    let finalPrompt = prompt;
    if (isInterface) {
      finalPrompt = `${prompt}, high quality UI design, professional interface, no people`;
    }

    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?${params}`;

    const response = await fetch(url);
    if (response.ok) {
      const blob = await response.blob();
      if (blob.size > 30000) {
        console.log("✅ Pollinations gerou com sucesso!");
        return blob;
      }
    }
  } catch (error) {
    console.log("⚠️ Erro Pollinations:", error);
  }
  return null;
}

// ========================================================
// 🎨 LEONARDO AI - ESPECIALIZADO EM INTERFACES
// ==========================================================
async function generateWithLeonardoAI(prompt: string): Promise<Blob | null> {
  try {
    console.log("🎨 Gerando com Leonardo AI (especializado em UI)...");

    // Leonardo AI tem endpoint público para alguns usos
    const response = await fetch("https://cloud.leonardo.ai/api/rest/v1/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `${prompt}, professional UI/UX design, Figma quality`,
        negative_prompt: "people, person, human, face, cartoon, anime",
        modelId: "6bef9f1b-29cb-40c7-b9df-32b51c1f67d3", // Leonardo Creative
        width: 1024,
        height: 768,
        num_images: 1
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.url) {
        const imageResponse = await fetch(data.url);
        if (imageResponse.ok) {
          const blob = await imageResponse.blob();
          console.log("✅ Leonardo AI gerou!");
          return blob;
        }
      }
    }
  } catch (error) {
    console.log("⚠️ Leonardo AI não disponível:", error);
  }
  return null;
}

// ========================================================
// 🚀 FUNÇÃO PRINCIPAL - COM DETECÇÃO INTELIGENTE
// ==========================================================
async function generateImageWithAI(prompt: string): Promise<Blob> {
  console.log("🚀 Iniciando geração inteligente...");
  console.log("📝 PROMPT ORIGINAL:", prompt);

  // Melhorar o prompt de forma inteligente
  const enhancedPrompt = enhancePromptIntelligently(prompt);

  // Detectar o tipo de conteúdo
  const isInterface = /\b(dashboard|interface|ui|ux|saas|software|website|landing|app)\b/i.test(prompt);
  const isLogo = /\b(logo|logotipo|brand)\b/i.test(prompt);

  // Escolher os melhores modelos baseado no tipo de conteúdo
  let generators = [];

  if (isInterface || isLogo) {
    // Para interfaces e logos, usar modelos especializados
    generators = [
      {
        name: "Playground v2.5 (Melhor para UI)",
        fn: () => generateWithHuggingFace(enhancedPrompt, "playgroundai/playground-v2.5-1024px-aesthetic"),
        quality: 10
      },
      {
        name: "DreamShaper XL (UI/UX)",
        fn: () => generateWithHuggingFace(enhancedPrompt, "Lykon/dreamshaper-xl-turbo"),
        quality: 9
      },
      {
        name: "Leonardo AI (Especializado em UI)",
        fn: () => generateWithLeonardoAI(enhancedPrompt),
        quality: 9
      },
      {
        name: "SDXL Base (Versátil)",
        fn: () => generateWithHuggingFace(enhancedPrompt, "stabilityai/stable-diffusion-xl-base-1.0"),
        quality: 8.5
      },
      {
        name: "Pollinations (UI Mode)",
        fn: () => generateWithPollinations(enhancedPrompt),
        quality: 8
      }
    ];
  } else {
    // Para outros tipos de imagem
    generators = [
      {
        name: "FLUX.1 Dev",
        fn: () => generateWithHuggingFace(enhancedPrompt, "black-forest-labs/FLUX.1-dev"),
        quality: 10
      },
      {
        name: "Stable Diffusion XL",
        fn: () => generateWithHuggingFace(enhancedPrompt, "stabilityai/stable-diffusion-xl-base-1.0"),
        quality: 9
      },
      {
        name: "Realistic Vision v5",
        fn: () => generateWithHuggingFace(enhancedPrompt, "SG161222/Realistic_Vision_V5.1_noVAE"),
        quality: 8.5
      },
      {
        name: "Pollinations FLUX",
        fn: () => generateWithPollinations(enhancedPrompt),
        quality: 8
      }
    ];
  }

  // Tentar cada gerador
  for (const generator of generators) {
    try {
      console.log(`🔄 Tentando ${generator.name}...`);
      const blob = await generator.fn();

      if (blob && blob.size > 10000) {
        console.log(`✅ SUCESSO com ${generator.name}!`);
        console.log(`📊 Tipo de imagem: ${isInterface ? "INTERFACE/SOFTWARE" : isLogo ? "LOGO" : "GENÉRICO"}`);
        return blob;
      }
    } catch (error) {
      console.log(`❌ ${generator.name} erro:`, error);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Fallback final
  console.log("🔄 Tentativa final com Pollinations...");
  try {
    const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}`;
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

  throw new Error("Não foi possível gerar a imagem. Tente ser mais específico, por exemplo: 'Dashboard moderno para SaaS Freelinnk' ou 'Landing page para Freelinnk'");
}

// =========================================================
// TIPOS E INTERFACES
// ==========================================================
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

// ========================================================
// 🔥 GERAÇÃO DE ROTEIRO MEGA VIRAL
// ==========================================================
async function generateViralScript(topic: string, style: string, duration: number): Promise<VideoScript> {
  if (!groq) {
    throw new Error("GROQ_API_KEY não está configurada no backend.");
  }

  const prompt = `
    Você é o MELHOR criador de conteúdo viral do mundo.

    Crie um roteiro EXPLOSIVO sobre: "${topic}"
    Estilo: "${style}"
    Duração: ${duration} segundos

    ## FÓRMULA DE VIRALIZAÇÃO 2025:

    1. **GANCHO MATADOR (0-3s)**
       - Patterns virais: "PARE!", "99% não sabem", "REVELADO", "Você está fazendo ERRADO"

    2. **ESTRUTURA**
       - 0-3s: Gancho
       - 3-8s: Promessa
       - 8-15s: Conteúdo valor
       - 15-25s: Prova
       - 25-30s: CTA urgente

    3. **ELEMENTOS VIRAIS**
       - Loop viciante
       - Pattern interrupt
       - Plot twist
       - Emoção forte

    ## JSON:
    \`\`\`json
    {
      "title": "título",
      "hook": "gancho",
      "duration": "${duration} segundos",
      "format": "9:16 Vertical",
      "style": "${style}",
      "scenes": [...],
      "music": "trending audio",
      "hashtags": [...],
      "cta": "call to action",
      "canvaSteps": [...],
      "capcutSteps": [...],
      "proTips": [...]
    }
    \`\`\``;

  try {
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages: [
        { role: 'system', content: 'Responda APENAS com JSON válido.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.9,
      max_tokens: 4096,
    });

    const scriptText = chatCompletion.choices[0]?.message?.content;
    if (!scriptText) throw new Error("Erro ao gerar roteiro");

    return JSON.parse(scriptText) as VideoScript;

  } catch (error) {
    console.error("❌ Erro:", error);

    return {
      title: `🔥 ${topic}`,
      hook: `PARE! Sobre ${topic}...`,
      duration: `${duration} segundos`,
      format: "9:16 Vertical",
      style: style,
      scenes: [
        {
          number: 1,
          duration: "0-3s",
          text: `${topic} revelado`,
          visual: "Texto impactante",
          camera: "Zoom in",
          transition: "Cut"
        }
      ],
      music: "Trending audio",
      hashtags: ["#viral", "#fyp"],
      cta: "Salva e compartilha!",
      canvaSteps: ["Use template viral"],
      capcutSteps: ["Add auto captions"],
      proTips: ["Poste no horário nobre"]
    } as VideoScript;
  }
}

// ========================================================
// 🚀 AÇÃO PRINCIPAL - GERAR IMAGEM
// ==========================================================
export const generateImage = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para continuar");

    const userId = identity.subject;
    try {
      console.log("🎨 Processando seu pedido...");
      console.log("📝 PROMPT RECEBIDO:", args.prompt);

      const imageBlob = await generateImageWithAI(args.prompt);
      console.log("✅ Imagem gerada com sucesso!");

      const storageId = await ctx.storage.store(imageBlob);
      const imageUrl = await ctx.storage.getUrl(storageId);

      if (!imageUrl) {
        throw new Error("Erro ao salvar imagem");
      }

      await ctx.runMutation(internal.imageGenerator.saveGeneratedImage, {
        userId,
        prompt: args.prompt,
        imageUrl,
        storageId,
      });

      // Dica inteligente baseada no tipo de prompt
      let tip = "";
      if (/saas|software|app|dashboard/i.test(args.prompt)) {
        tip = "\n💡 Dica: Para melhores resultados com interfaces, especifique: 'dashboard', 'landing page', 'mobile app' ou 'website'";
      } else if (/logo/i.test(args.prompt)) {
        tip = "\n💡 Dica: Para logos, adicione o estilo desejado: 'minimalist', 'gradient', 'flat design', etc";
      }

      return {
        url: imageUrl,
        method: 'premium',
        remainingPremium: 999,
        message: `🎉 Imagem gerada com sucesso!${tip}`
      };
    } catch (error) {
      console.error("❌ Erro:", error);
      throw new Error("Erro ao gerar imagem. Tente ser mais específico: 'Dashboard para SaaS', 'Landing page moderna', 'Logo minimalista', etc.");
    }
  },
});

// ========================================================
// 🎬 AÇÃO - GERAR ROTEIRO VIRAL
// ==========================================================
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
      const script = await generateViralScript(
        args.topic,
        args.style,
        args.duration
      );
      return {
        script,
        method: 'premium',
        remainingPremium: 999,
        message: `🎬 Roteiro viral criado!`
      };
    } catch {
      throw new Error("Erro ao gerar roteiro");
    }
  },
});

// ========================================================
// OUTRAS FUNÇÕES (mantidas como estavam)
// ========================================================
export const deleteImage = mutation({
  args: {
    imageId: v.id("generatedImages"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const image = await ctx.db.get(args.imageId);
    if (!image) throw new Error("Imagem não encontrada");
    if (image.userId !== identity.subject) throw new Error("Sem permissão");

    await ctx.storage.delete(args.storageId);
    await ctx.db.delete(args.imageId);

    return { success: true };
  },
});

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

    return {
      geminiImagesRemaining: 999,
      geminiVideosRemaining: 999,
    };
  },
});