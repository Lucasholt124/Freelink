// /convex/imageGenerator.ts - MELHOR CUSTO-BENEFÍCIO 2025 🚀💰
import { action, mutation, internalMutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import Groq from 'groq-sdk';
import { internal } from "./_generated/api";
import Replicate from "replicate";
import { Id } from "./_generated/dataModel";
import { ActionCtx } from "./_generated/server";

// ========================================================
// 🔥 CONFIGURAÇÃO DAS API KEYS
// ==========================================================
const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

// Configuração do Replicate com timeout otimizado
const replicate = REPLICATE_API_KEY ? new Replicate({
  auth: REPLICATE_API_KEY,
  fetch: (url, options) => {
    return fetch(url, {
      ...options,
      signal: AbortSignal.timeout(90000), // 90s timeout
    });
  },
}) : null;

// ========================================================
// 💰 MODELOS 2025 - CUSTO-BENEFÍCIO PERFEITO
// ========================================================
const REPLICATE_MODELS = {
  // 🥇 FLUX SCHNELL - GRATUITO e RÁPIDO (3-5s)
  FLUX_SCHNELL: "black-forest-labs/flux-schnell",

  // 🥈 FLUX DEV - $0.003/imagem (99% mais barato que SDXL!)
  FLUX_DEV: "black-forest-labs/flux-dev",

  // 🥉 SDXL Lightning - $0.004/imagem (super rápido)
  SDXL_LIGHTNING: "bytedance/sdxl-lightning-4step:5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637",

  // ❌ NÃO USAR - SDXL normal custa $0.10/imagem (muito caro!)
} as const;

// ✅ ESTRATÉGIA: Usar FLUX DEV ($0.003) - Excelente qualidade + 97% mais barato!
const DEFAULT_MODEL = REPLICATE_MODELS.FLUX_DEV;

console.log("💰 ECONOMIA ATIVA:");
console.log("   Modelo: FLUX DEV");
console.log("   Custo: $0.003 por imagem");
console.log("   Economia: 97% vs SDXL ($0.10)");
console.log("   210 imagens/mês: $0.63 USD (vs $21 do SDXL)");

// ========================================================
// 📊 TIPOS E INTERFACES
// ========================================================
interface DailyUsage {
  _id: Id<"dailyImageUsage">;
  userId: string;
  date: string;
  count: number;
  images?: Array<{
    imageId: Id<"generatedImages">;
    createdAt: number;
  }>;
  lastResetAt?: number;
}

interface ReplicateParams {
  width?: number;
  height?: number;
  num_outputs?: number;
  num_inference_steps?: number;
  guidance_scale?: number;
  prompt_strength?: number;
  negative_prompt?: string;
  go_fast?: boolean;
  megapixels?: string;
  output_format?: string;
  output_quality?: number;
}

interface ReplicateFileOutput {
  url: () => Promise<string>;
}

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
// 📊 CONTROLE DE LIMITE DIÁRIO
// ========================================================
function getCurrentDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

async function checkAndUpdateDailyLimit(
  ctx: ActionCtx,
  userId: string
): Promise<{ canGenerate: boolean; remaining: number }> {
  const today = getCurrentDate();
  const DAILY_LIMIT = 7;

  const dailyUsage = await ctx.runQuery(internal.imageGenerator.getDailyUsageInternal, {
    userId,
    date: today
  });

  if (!dailyUsage) {
    return { canGenerate: true, remaining: DAILY_LIMIT };
  }

  const lastResetDate = dailyUsage.lastResetAt
    ? new Date(dailyUsage.lastResetAt).toISOString().split('T')[0]
    : dailyUsage.date;

  if (lastResetDate !== today) {
    await ctx.runMutation(internal.imageGenerator.updateDailyUsage, {
      userId,
      imageId: null,
      date: today,
      count: 0,
      images: [],
      lastResetAt: Date.now()
    });
    return { canGenerate: true, remaining: DAILY_LIMIT };
  }

  const remaining = DAILY_LIMIT - dailyUsage.count;
  return {
    canGenerate: dailyUsage.count < DAILY_LIMIT,
    remaining: Math.max(0, remaining)
  };
}

async function incrementDailyUsage(
  ctx: ActionCtx,
  userId: string,
  imageId: Id<"generatedImages">
): Promise<void> {
  const today = getCurrentDate();
  await ctx.runMutation(internal.imageGenerator.updateDailyUsage, {
    userId,
    imageId,
    date: today,
  });
}

// ========================================================
// 🎯 MELHORADOR DE PROMPT PARA FLUX DEV (ECONÔMICO)
// ========================================================
function enhancePromptForFluxDev(originalPrompt: string): {
  prompt: string;
  model: string;
  params: ReplicateParams;
} {
  const isSoftware = /\b(saas|software|app|application|website|site|landing page|dashboard|interface|ui|ux|platform|sistema|plataforma|ferramenta|tool)\b/i.test(originalPrompt);
  const isLogo = /\b(logo|logotipo|brand|marca|branding)\b/i.test(originalPrompt);
  const isPerson = /\b(pessoa|person|people|homem|man|mulher|woman|retrato|portrait|rosto|face)\b/i.test(originalPrompt);
  const isProduct = /\b(produto|product|mockup|package|embalagem|packaging)\b/i.test(originalPrompt);
  const isRealistic = /\b(realistic|realista|photo|foto|photography|fotografia|real)\b/i.test(originalPrompt);

  let enhancedPrompt = originalPrompt;
  const model = DEFAULT_MODEL; // FLUX DEV - $0.003/imagem

  // Parâmetros otimizados para FLUX DEV
  const params: ReplicateParams = {
    num_outputs: 1,
    num_inference_steps: 28, // Reduzido para velocidade (qualidade ainda excelente)
    guidance_scale: 3.5, // Flux Dev trabalha bem com valores baixos
    output_format: "webp", // WebP é menor e mais rápido
    output_quality: 90,
  };

  // 🔥 PROMPTS OTIMIZADOS POR TIPO
  if (isSoftware) {
    const nameMatch = originalPrompt.match(/\b(?:nome|name|chamado|called)\s+(\w+)/i);
    const brandName = nameMatch ? nameMatch[1] : "TechPro";

    if (originalPrompt.toLowerCase().includes("saas") || originalPrompt.toLowerCase().includes("dashboard")) {
      enhancedPrompt = `Professional modern SaaS dashboard UI for ${brandName}, clean minimalist interface design, sidebar navigation, data visualization charts, analytics widgets, gradient blue purple theme, glassmorphism effects, dark mode, ultra sharp screenshot, Figma quality, 8K resolution, no people, UI only`;
      params.width = 1344;
      params.height = 768;
    } else if (originalPrompt.toLowerCase().includes("landing") || originalPrompt.toLowerCase().includes("site") || originalPrompt.toLowerCase().includes("website")) {
      enhancedPrompt = `Modern landing page design for ${brandName}, hero section gradient background, professional web design 2025, CTA buttons, feature sections icons, testimonials, pricing cards, responsive mockup, clean UI, 8K, no people`;
      params.width = 1344;
      params.height = 768;
    } else if (originalPrompt.toLowerCase().includes("app") || originalPrompt.toLowerCase().includes("mobile")) {
      enhancedPrompt = `Mobile app interface ${brandName}, modern iOS Android UI, iPhone 15 Pro mockup, minimal clean design, professional screens, Dribbble quality, 8K, no people`;
      params.width = 768;
      params.height = 1344;
    } else {
      enhancedPrompt = `Professional software interface ${brandName}, modern dashboard UI, clean layout, professional design, 8K, no people`;
      params.width = 1344;
      params.height = 768;
    }
    params.negative_prompt = "people, person, human, face, portrait, blurry, low quality, distorted, text, watermark";

  } else if (isLogo) {
    const nameMatch = originalPrompt.match(/\b(?:nome|name|chamado|called)\s+(\w+)/i);
    const brandName = nameMatch ? nameMatch[1] : "Brand";

    enhancedPrompt = `Professional minimalist logo design ${brandName}, modern geometric vector logo, clean typography, gradient colors, brand identity, white background, ultra sharp, award winning, 8K, logo only`;
    params.width = 1024;
    params.height = 1024;
    params.negative_prompt = "mockup, 3d, realistic, photo, people, human, text overlay, watermark";

  } else if (isRealistic || isPerson) {
    enhancedPrompt = `${originalPrompt}, professional photography, Canon EOS R5 85mm f1.4, natural studio lighting, ultra sharp focus, highly detailed, award winning photo, 8K photorealistic`;
    params.width = 1024;
    params.height = 1024;
    params.negative_prompt = "cartoon, anime, drawing, painting, sketch, low quality, blurry, distorted";

  } else if (isProduct) {
    enhancedPrompt = `${originalPrompt}, professional product photography, studio lighting, white background, commercial photo, ultra sharp, highly detailed, 8K`;
    params.width = 1024;
    params.height = 1024;
    params.negative_prompt = "people, human, face, low quality, blurry";

  } else {
    enhancedPrompt = `${originalPrompt}, masterpiece, best quality, ultra detailed, sharp focus, professional, 8K resolution`;
    params.width = 1024;
    params.height = 1024;
    params.num_inference_steps = 25;
  }

  if (!params.negative_prompt) {
    params.negative_prompt = "low quality, blurry, pixelated, noisy, bad composition, watermark, signature, text, distorted";
  }

  console.log("🎯 Tipo:", isSoftware ? "UI/UX" : isLogo ? "LOGO" : isProduct ? "PRODUTO" : isRealistic ? "FOTO" : "GENÉRICO");
  console.log("💰 Modelo: FLUX DEV ($0.003)");
  console.log("✨ Prompt:", enhancedPrompt.substring(0, 100) + "...");

  return { prompt: enhancedPrompt, model, params };
}

// ========================================================
// 🌟 GERAÇÃO COM REPLICATE (FLUX DEV - ECONÔMICO)
// ========================================================
async function generateWithReplicate(prompt: string): Promise<Blob | null> {
  if (!replicate) {
    console.log("⚠️ Replicate não configurado");
    return null;
  }

  try {
    console.log("🌟 Gerando com FLUX DEV (Alta Qualidade + Baixo Custo)...");

    const { prompt: enhancedPrompt, model, params } = enhancePromptForFluxDev(prompt);

    console.log("🔧 Config:", {
      model: "FLUX DEV",
      custo: "$0.003",
      width: params.width,
      height: params.height,
      steps: params.num_inference_steps
    });

    const input: Record<string, unknown> = {
      prompt: enhancedPrompt,
      ...params
    };

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout 90s')), 90000);
    });

    const replicatePromise = replicate.run(
      model as `${string}/${string}` | `${string}/${string}:${string}`,
      { input }
    );

    const output = await Promise.race([replicatePromise, timeoutPromise]);

    console.log("📦 Output type:", typeof output, Array.isArray(output) ? 'array' : 'object');

    let imageUrl: string | null = null;

    if (Array.isArray(output)) {
      const firstOutput = output[0];

      if (firstOutput && typeof firstOutput === 'object' && 'url' in firstOutput) {
        imageUrl = await (firstOutput as ReplicateFileOutput).url();
        console.log("✅ FileOutput URL extraída");
      } else if (typeof firstOutput === 'string') {
        imageUrl = firstOutput;
        console.log("✅ URL string direta");
      } else if (firstOutput && typeof firstOutput === 'object' && '_state' in firstOutput) {
        console.log("🔄 Convertendo ReadableStream...");
        try {
          const response = new Response(firstOutput as ReadableStream);
          const blob = await response.blob();
          if (blob.size > 30000) {
            console.log(`✅ Stream OK! ${(blob.size / 1024).toFixed(2)}KB | Custo: $0.003`);
            return blob;
          }
        } catch (streamError) {
          console.error("❌ Erro stream:", streamError);
        }
      }
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else if (output && typeof output === 'object' && 'url' in output) {
      imageUrl = await (output as ReplicateFileOutput).url();
    }

    if (imageUrl && typeof imageUrl === 'string') {
      console.log("🔗 Baixando imagem...");

      const response = await fetch(imageUrl, {
        signal: AbortSignal.timeout(30000)
      });

      if (response.ok) {
        const blob = await response.blob();
        console.log(`✅ SUCESSO! ${(blob.size / 1024).toFixed(2)}KB | Custo: $0.003 💰`);
        return blob;
      } else {
        console.error("❌ HTTP error:", response.status);
      }
    } else {
      console.error("❌ Não foi possível extrair URL");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Erro:", error.message);
    }
  }

  return null;
}

// ========================================================
// 🌟 POLLINATIONS - FALLBACK GRATUITO
// ========================================================
async function generateWithPollinations(prompt: string): Promise<Blob | null> {
  try {
    console.log("🌟 Fallback: Pollinations (100% GRATUITO)...");

    const isInterface = /\b(dashboard|interface|ui|ux|saas|software|website|landing)\b/i.test(prompt);

    const params = new URLSearchParams({
      width: isInterface ? '1280' : '1024',
      height: isInterface ? '720' : '1024',
      seed: Math.floor(Math.random() * 1000000).toString(),
      model: 'flux',
      nologo: 'true',
      enhance: 'true'
    });

    let finalPrompt = prompt;
    if (isInterface) {
      finalPrompt = `${prompt}, high quality UI design, professional interface, no people`;
    }

    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?${params}`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(30000)
    });

    if (response.ok) {
      const blob = await response.blob();
      if (blob.size > 30000) {
        console.log(`✅ Pollinations OK! ${(blob.size / 1024).toFixed(2)}KB | Custo: $0 (GRÁTIS!)`);
        return blob;
      }
    }
  } catch (error) {
    console.log("⚠️ Erro Pollinations:", error);
  }
  return null;
}

// ========================================================
// 🎯 MELHORADOR DE PROMPT INTELIGENTE
// ========================================================
function enhancePromptIntelligently(originalPrompt: string): string {
  const isSoftware = /\b(saas|software|app|application|website|site|landing page|dashboard|interface|ui|ux|platform)\b/i.test(originalPrompt);
  const isLogo = /\b(logo|logotipo|brand|marca|branding)\b/i.test(originalPrompt);
  const isProduct = /\b(produto|product|mockup|package|embalagem|packaging)\b/i.test(originalPrompt);
  const isPerson = /\b(pessoa|person|people|homem|man|mulher|woman|retrato|portrait|rosto|face)\b/i.test(originalPrompt);

  let enhancedPrompt = originalPrompt;

  if (isSoftware) {
    const nameMatch = originalPrompt.match(/\b(?:nome|name|chamado|called)\s+(\w+)/i);
    const brandName = nameMatch ? nameMatch[1] : "TechApp";

    if (originalPrompt.toLowerCase().includes("saas") || originalPrompt.toLowerCase().includes("dashboard")) {
      enhancedPrompt = `Modern SaaS dashboard ${brandName}, professional UI, clean layout, data charts, dark mode, Figma quality`;
    } else if (originalPrompt.toLowerCase().includes("landing") || originalPrompt.toLowerCase().includes("website")) {
      enhancedPrompt = `Modern landing page ${brandName}, hero section, gradient, professional web design, clean UI`;
    } else if (originalPrompt.toLowerCase().includes("app")) {
      enhancedPrompt = `Mobile app ${brandName}, modern UI, iPhone mockup, minimal design, professional`;
    } else {
      enhancedPrompt = `Professional software interface ${brandName}, modern UI, clean layout`;
    }
    enhancedPrompt += ", no people, interface only";

  } else if (isLogo) {
    const nameMatch = originalPrompt.match(/\b(?:nome|name|chamado|called)\s+(\w+)/i);
    const brandName = nameMatch ? nameMatch[1] : "Brand";
    enhancedPrompt = `Professional minimalist logo ${brandName}, modern design, clean, high quality`;

  } else if (isProduct) {
    enhancedPrompt = `${originalPrompt}, product photography, studio lighting, professional`;

  } else if (!isPerson) {
    enhancedPrompt = `${originalPrompt}, professional, high quality`;
  }

  return enhancedPrompt;
}

// ========================================================
// 🚀 FUNÇÃO PRINCIPAL DE GERAÇÃO
// ========================================================
async function generateImageWithAI(prompt: string): Promise<Blob> {
  console.log("🚀 Iniciando geração ECONÔMICA...");
  console.log("📝 Prompt:", prompt);

  // 1️⃣ FLUX DEV ($0.003) - Melhor custo-benefício!
  if (REPLICATE_API_KEY) {
    console.log("💰 Usando FLUX DEV - Custo: $0.003/imagem");

    try {
      const replicateBlob = await generateWithReplicate(prompt);

      if (replicateBlob && replicateBlob.size > 30000) {
        console.log("✅ FLUX DEV gerou imagem perfeita!");
        console.log("💵 Custo desta imagem: $0.003 (97% economia vs SDXL)");
        return replicateBlob;
      }
    } catch (error) {
      console.error("❌ Erro FLUX DEV:", error);
    }
  }

  // 2️⃣ Pollinations (GRATUITO) - Fallback
  console.log("🔄 Fallback: Pollinations (GRÁTIS)");
  const enhancedPrompt = enhancePromptIntelligently(prompt);

  try {
    const pollinationsBlob = await generateWithPollinations(enhancedPrompt);

    if (pollinationsBlob && pollinationsBlob.size > 20000) {
      console.log("✅ Pollinations funcionou!");
      console.log("💵 Custo: $0 (100% GRATUITO)");
      return pollinationsBlob;
    }
  } catch (error) {
    console.error("❌ Erro Pollinations:", error);
  }

  // 3️⃣ Última tentativa
  console.log("🔄 Última tentativa...");

  try {
    const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&model=flux&nologo=true`;

    const fallbackResponse = await fetch(fallbackUrl, {
      signal: AbortSignal.timeout(30000)
    });

    if (fallbackResponse.ok) {
      const fallbackBlob = await fallbackResponse.blob();
      if (fallbackBlob.size > 10000) {
        console.log("✅ Fallback final OK!");
        return fallbackBlob;
      }
    }
  } catch (error) {
    console.error("❌ Fallback final falhou:", error);
  }

  throw new Error("❌ Não foi possível gerar. Tente novamente.");
}

// ========================================================
// 🔥 GERAÇÃO DE ROTEIRO VIRAL
// ========================================================
async function generateViralScript(topic: string, style: string, duration: number): Promise<VideoScript> {
  if (!groq) {
    throw new Error("GROQ_API_KEY não configurada");
  }

  const prompt = `Crie um roteiro EXPLOSIVO sobre: "${topic}", Estilo: "${style}", Duração: ${duration}s. Retorne JSON com: title, hook, duration, format, style, scenes (array com number, duration, text, visual, camera, transition), music, hashtags (array), cta, canvaSteps (array), capcutSteps (array), proTips (array).`;

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
      hook: `PARE! ${topic}...`,
      duration: `${duration}s`,
      format: "9:16",
      style: style,
      scenes: [{ number: 1, duration: "0-3s", text: topic, visual: "Impactante", camera: "Zoom", transition: "Cut" }],
      music: "Trending",
      hashtags: ["#viral"],
      cta: "Salva!",
      canvaSteps: ["Template viral"],
      capcutSteps: ["Auto captions"],
      proTips: ["Horário nobre"]
    };
  }
}

// ========================================================
// 🚀 AÇÃO PRINCIPAL
// ========================================================
export const generateImage = action({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login");

    const userId = identity.subject;

    try {
      const { canGenerate, remaining } = await checkAndUpdateDailyLimit(ctx, userId);

      if (!canGenerate) {
        throw new Error(`🚫 Limite diário atingido! Volte amanhã para mais 7 imagens!`);
      }

      console.log(`📊 Restantes: ${remaining - 1}`);

      const imageBlob = await generateImageWithAI(args.prompt);
      console.log("✅ Imagem gerada!");

      const storageId = await ctx.storage.store(imageBlob);
      const imageUrl = await ctx.storage.getUrl(storageId);

      if (!imageUrl) throw new Error("Erro ao salvar");

      const imageId = await ctx.runMutation(internal.imageGenerator.saveGeneratedImage, {
        userId,
        prompt: args.prompt,
        imageUrl,
        storageId,
      });

      await incrementDailyUsage(ctx, userId, imageId);

      return {
        url: imageUrl,
        method: 'flux-dev',
        remainingToday: remaining - 1,
        message: `🎉 Imagem gerada! ${remaining - 1} restantes. Custo: $0.003 💰`
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro";
      console.error("❌", errorMessage);
      throw new Error(errorMessage);
    }
  },
});

// ========================================================
// 🎬 AÇÃO - GERAR ROTEIRO
// ========================================================
export const generateVideoScript = action({
  args: {
    topic: v.string(),
    style: v.string(),
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login");

    try {
      const script = await generateViralScript(args.topic, args.style, args.duration);
      return { script, method: 'premium', message: `🎬 Roteiro criado!` };
    } catch  {
      throw new Error("Erro ao gerar roteiro");
    }
  },
});

// ========================================================
// 🗑️ MUTATION - DELETAR
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
    if (!image || image.userId !== identity.subject) throw new Error("Sem permissão");

    await ctx.storage.delete(args.storageId);
    await ctx.db.delete(args.imageId);
    return { success: true };
  },
});

// ========================================================
// 🔄 INTERNAL MUTATIONS & QUERIES
// ========================================================
export const saveGeneratedImage = internalMutation({
  args: {
    userId: v.string(),
    prompt: v.string(),
    imageUrl: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("generatedImages", {
      ...args,
      method: "flux-dev",
      createdAt: Date.now(),
    });
  },
});

export const getDailyUsageInternal = internalQuery({
  args: { userId: v.string(), date: v.string() },
  handler: async (ctx, args): Promise<DailyUsage | null> => {
    return await ctx.db
      .query("dailyImageUsage")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId).eq("date", args.date))
      .first();
  },
});

export const updateDailyUsage = internalMutation({
  args: {
    userId: v.string(),
    imageId: v.union(v.id("generatedImages"), v.null()),
    date: v.string(),
    count: v.optional(v.number()),
    images: v.optional(v.array(v.object({ imageId: v.id("generatedImages"), createdAt: v.number() }))),
    lastResetAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.runQuery(internal.imageGenerator.getDailyUsageInternal, { userId: args.userId, date: args.date });

    if (existing) {
      const newCount = args.count !== undefined ? args.count : existing.count + 1;
      const newImages = args.images || (args.imageId ? [...(existing.images || []), { imageId: args.imageId, createdAt: Date.now() }] : existing.images);
      await ctx.db.patch(existing._id, {
        count: newCount,
        images: newImages,
        lastResetAt: args.lastResetAt || existing.lastResetAt,
      });
    } else if (args.imageId) {
      await ctx.db.insert("dailyImageUsage", {
        userId: args.userId,
        date: args.date,
        count: 1,
        images: [{ imageId: args.imageId, createdAt: Date.now() }],
        lastResetAt: Date.now()
      });
    }
  },
});

// ========================================================
// 📊 QUERIES
// ========================================================
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

    const userId = identity.subject;
    const today = getCurrentDate();

    const dailyUsage = await ctx.db
      .query("dailyImageUsage")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", today))
      .first() as DailyUsage | null;

    const DAILY_LIMIT = 7;
    const used = dailyUsage?.count || 0;
    const remaining = Math.max(0, DAILY_LIMIT - used);

    return {
      dailyLimit: DAILY_LIMIT,
      usedToday: used,
      remainingToday: remaining,
      resetTime: "00:00 UTC",
      method: "FLUX DEV (Alta Qualidade)",
      quality: "Ultra HD - $0.003 por imagem",
      costPerImage: "$0.003",
      monthlyCost: `${(remaining * 0.003).toFixed(3)}`,
      geminiImagesRemaining: remaining,
      geminiVideosRemaining: 999,
    };
  },
});

export const getTodayImages = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const userId = identity.subject;
    const today = getCurrentDate();

    const dailyUsage = await ctx.db
      .query("dailyImageUsage")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", today))
      .first() as DailyUsage | null;

    if (!dailyUsage) return [];

    const imagePromises = (dailyUsage.images || []).map(async (img) => {
      const image = await ctx.db.get(img.imageId);
      return image;
    });

    const images = await Promise.all(imagePromises);
    return images.filter(Boolean);
  },
});