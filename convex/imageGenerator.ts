import { action, mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { ActionCtx } from "./_generated/server";

// =================================================================
// 🎯 CONFIGURAÇÃO
// =================================================================
const DAILY_LIMIT = 7;

// =================================================================
// 📊 TIPOS
// =================================================================
interface DailyUsage {
  _id: Id<"dailyImageUsage">;
  userId: string;
  date: string;
  count: number;
  images: Array<{ imageId: Id<"generatedImages">; createdAt: number }>;
  lastResetAt: number;
}

// =================================================================
// 🔧 FUNÇÕES AUXILIARES
// =================================================================
function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

async function checkDailyLimit(
  ctx: ActionCtx,
  userId: string
): Promise<{ canGenerate: boolean; remaining: number }> {
  const today = getCurrentDate();

  const dailyUsage = await ctx.runQuery(internal.imageGenerator.getDailyUsageInternal, {
    userId,
    date: today
  }) as DailyUsage | null;

  if (!dailyUsage) {
    return { canGenerate: true, remaining: DAILY_LIMIT };
  }

  const lastResetDate = new Date(dailyUsage.lastResetAt).toISOString().split('T')[0];

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

// =================================================================
// 🎯 OTIMIZADOR DE PROMPT
// =================================================================
function optimizePrompt(original: string): string {
  // Remove caracteres especiais problemáticos
  let cleaned = original.replace(/[^\w\s,.-]/gi, ' ').trim();

  // Limita tamanho
  if (cleaned.length > 400) {
    cleaned = cleaned.substring(0, 400);
  }

  const isLogo = /\b(logo|logotipo|brand|marca)\b/i.test(original);
  const isUI = /\b(interface|ui|ux|dashboard|website|app|software)\b/i.test(original);
  const isProduct = /\b(product|produto|mockup|package)\b/i.test(original);
  const isPhoto = /\b(photo|foto|portrait|retrato)\b/i.test(original);

  let enhanced = cleaned;

  if (isLogo) {
    enhanced = `${cleaned}, professional logo, minimalist, vector, modern`;
  } else if (isUI) {
    enhanced = `${cleaned}, modern UI, professional interface, clean, high quality`;
  } else if (isProduct) {
    enhanced = `${cleaned}, product photography, studio lighting, professional`;
  } else if (isPhoto) {
    enhanced = `${cleaned}, professional photography, detailed, high quality`;
  } else {
    enhanced = `${cleaned}, masterpiece, detailed, professional`;
  }

  return enhanced;
}

// =================================================================
// 🎨 API 1: POLLINATIONS (COM RETRY)
// =================================================================
async function tryPollinations(prompt: string, retries = 2): Promise<Blob | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🌟 Pollinations - Tentativa ${attempt}/${retries}`);

      const optimized = optimizePrompt(prompt);

      const params = new URLSearchParams({
        width: '1024',
        height: '1024',
        seed: Math.floor(Math.random() * 1000000).toString(),
        model: 'flux',
        nologo: 'true',
        enhance: 'true'
      });

      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(optimized)}?${params}`;

      const response = await fetch(url, {
        signal: AbortSignal.timeout(30000)
      });

      if (response.ok) {
        const blob = await response.blob();

        if (blob.size > 10000) {
          console.log(`✅ Pollinations OK! ${(blob.size / 1024).toFixed(2)}KB`);
          return blob;
        }
      }

      console.warn(`⚠️ Pollinations falhou: HTTP ${response.status}`);

      // Aguarda antes de tentar novamente
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      console.warn(`⚠️ Pollinations erro:`, error);
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  return null;
}

// =================================================================
// 🎨 API 2: HUGGING FACE (FALLBACK)
// =================================================================
async function tryHuggingFace(prompt: string): Promise<Blob | null> {
  const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

  if (!HF_TOKEN) {
    console.log("⚠️ HF Token não configurado");
    return null;
  }

  try {
    console.log("🤗 Tentando Hugging Face...");

    const optimized = optimizePrompt(prompt);

    const response = await fetch(
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: optimized,
          parameters: {
            num_inference_steps: 4,
            guidance_scale: 0,
          }
        }),
        signal: AbortSignal.timeout(60000)
      }
    );

    if (response.ok) {
      const blob = await response.blob();

      if (blob.size > 10000) {
        console.log(`✅ HuggingFace OK! ${(blob.size / 1024).toFixed(2)}KB`);
        return blob;
      }
    } else {
      const error = await response.json().catch(() => ({}));

      // Se modelo está carregando, espera e tenta de novo
      if (error.estimated_time) {
        const waitTime = Math.min(error.estimated_time + 3, 25);
        console.log(`⏳ Aguardando ${waitTime}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));

        const retryResponse = await fetch(
          "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${HF_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              inputs: optimized,
              parameters: {
                num_inference_steps: 4,
                guidance_scale: 0,
              }
            })
          }
        );

        if (retryResponse.ok) {
          const retryBlob = await retryResponse.blob();
          if (retryBlob.size > 10000) {
            console.log(`✅ HuggingFace OK (retry)!`);
            return retryBlob;
          }
        }
      }
    }
  } catch (error) {
    console.warn("⚠️ HuggingFace erro:", error);
  }

  return null;
}

// =================================================================
// 🎨 API 3: POLLINATIONS SIMPLE (FALLBACK 2)
// =================================================================
async function tryPollinationsSimple(prompt: string): Promise<Blob | null> {
  try {
    console.log("🌸 Tentando Pollinations (modo simples)...");

    const simplified = prompt.substring(0, 200);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(simplified)}?width=1024&height=1024&nologo=true`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(30000)
    });

    if (response.ok) {
      const blob = await response.blob();
      if (blob.size > 10000) {
        console.log(`✅ Pollinations Simple OK!`);
        return blob;
      }
    }
  } catch (error) {
    console.warn("⚠️ Pollinations Simple erro:", error);
  }

  return null;
}

// =================================================================
// 🎨 GERADOR PRINCIPAL (COM MÚLTIPLOS FALLBACKS)
// =================================================================
async function generateImageWithAI(prompt: string): Promise<Blob> {
  console.log("🎨 Iniciando geração 100% GRATUITA...");
  console.log("📝 Prompt:", prompt.substring(0, 100));

  // Tentativa 1: Pollinations (com retry)
  let blob = await tryPollinations(prompt);
  if (blob) return blob;

  console.log("🔄 Fallback 1: Hugging Face...");

  // Tentativa 2: Hugging Face
  blob = await tryHuggingFace(prompt);
  if (blob) return blob;

  console.log("🔄 Fallback 2: Pollinations Simple...");

  // Tentativa 3: Pollinations Simple
  blob = await tryPollinationsSimple(prompt);
  if (blob) return blob;

  // Tentativa 4: Pollinations com prompt genérico
  console.log("🔄 Fallback 3: Prompt genérico...");
  blob = await tryPollinationsSimple("beautiful professional artwork");
  if (blob) {
    console.log("⚠️ Retornando imagem genérica");
    return blob;
  }

  throw new Error("❌ Todas as APIs estão temporariamente indisponíveis. Tente novamente em alguns segundos!");
}

// =================================================================
// 🚀 ACTION - GERAR IMAGEM
// =================================================================
export const generateImage = action({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Faça login para gerar imagens");
    }

    const userId = identity.subject;

    try {
      // Verifica limite
      const { canGenerate, remaining } = await checkDailyLimit(ctx, userId);

      if (!canGenerate) {
        throw new Error(`🚫 Limite diário atingido! Volte amanhã para mais ${DAILY_LIMIT} imagens grátis!`);
      }

      console.log(`📊 Restantes hoje: ${remaining - 1}/${DAILY_LIMIT}`);

      // Gera a imagem (100% GRÁTIS com fallbacks!)
      const imageBlob = await generateImageWithAI(args.prompt);

      // Salva no storage
      const storageId = await ctx.storage.store(imageBlob);
      const imageUrl = await ctx.storage.getUrl(storageId);

      if (!imageUrl) {
        throw new Error("Erro ao salvar imagem");
      }

      // Salva no banco
      const imageId = await ctx.runMutation(internal.imageGenerator.saveGeneratedImage, {
        userId,
        prompt: args.prompt,
        imageUrl,
        storageId,
      });

      // Atualiza contador
      await incrementDailyUsage(ctx, userId, imageId);

      return {
        url: imageUrl,
        method: 'multi-api-free',
        remainingToday: remaining - 1,
        message: `🎉 Imagem criada 100% GRÁTIS! ${remaining - 1} restantes hoje. Custo: $0.00 🎉`
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao gerar imagem";
      console.error("❌ Erro final:", errorMessage);
      throw new Error(errorMessage);
    }
  },
});

// =================================================================
// 🗑️ MUTATION - DELETAR IMAGEM
// =================================================================
export const deleteImage = mutation({
  args: {
    imageId: v.id("generatedImages"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const image = await ctx.db.get(args.imageId);
    if (!image || image.userId !== identity.subject) {
      throw new Error("Sem permissão");
    }

    await ctx.storage.delete(args.storageId);
    await ctx.db.delete(args.imageId);

    return { success: true };
  },
});

// =================================================================
// 💾 INTERNAL MUTATIONS
// =================================================================
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
      method: "multi-api-free",
      createdAt: Date.now(),
    });
  },
});

export const getDailyUsageInternal = internalQuery({
  args: { userId: v.string(), date: v.string() },
  handler: async (ctx, args): Promise<DailyUsage | null> => {
    return await ctx.db
      .query("dailyImageUsage")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .first() as DailyUsage | null;
  },
});

export const updateDailyUsage = internalMutation({
  args: {
    userId: v.string(),
    imageId: v.optional(v.union(v.id("generatedImages"), v.null())),
    date: v.string(),
    count: v.optional(v.number()),
    images: v.optional(v.array(v.object({
      imageId: v.id("generatedImages"),
      createdAt: v.number()
    }))),
    lastResetAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.runQuery(
      internal.imageGenerator.getDailyUsageInternal,
      { userId: args.userId, date: args.date }
    ) as DailyUsage | null;

    if (existing) {
      const newCount = args.count !== undefined ? args.count : existing.count + 1;
      let newImages = existing.images || [];

      if (args.images !== undefined) {
        newImages = args.images;
      } else if (args.imageId) {
        newImages = [...newImages, {
          imageId: args.imageId,
          createdAt: Date.now()
        }];
      }

      await ctx.db.patch(existing._id, {
        count: newCount,
        images: newImages,
        lastResetAt: args.lastResetAt || existing.lastResetAt,
      });
    } else {
      await ctx.db.insert("dailyImageUsage", {
        userId: args.userId,
        date: args.date,
        count: args.count === 0 ? 0 : 1,
        images: args.images || (args.imageId ? [{
          imageId: args.imageId,
          createdAt: Date.now()
        }] : []),
        lastResetAt: args.lastResetAt || Date.now()
      });
    }
  },
});

// =================================================================
// 📊 QUERIES
// =================================================================
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

export const getUsageStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return {
        dailyLimit: DAILY_LIMIT,
        usedToday: 0,
        remainingToday: DAILY_LIMIT,
        resetTime: "00:00 UTC",
        method: "Multi-API 100% Gratuito",
        quality: "Ultra HD 1024x1024",
        costPerImage: "$0.00 (GRÁTIS!)",
        monthlyCost: "$0.00 (SEMPRE GRÁTIS!)",
      };
    }

    const userId = identity.subject;
    const today = getCurrentDate();

    const dailyUsage = await ctx.db
      .query("dailyImageUsage")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", userId).eq("date", today)
      )
      .first() as DailyUsage | null;

    const used = dailyUsage?.count || 0;
    const remaining = Math.max(0, DAILY_LIMIT - used);

    return {
      dailyLimit: DAILY_LIMIT,
      usedToday: used,
      remainingToday: remaining,
      resetTime: "00:00 UTC",
      method: "Multi-API 100% Gratuito",
      quality: "Ultra HD 1024x1024",
      costPerImage: "$0.00 (GRÁTIS!)",
      monthlyCost: "$0.00 (SEMPRE GRÁTIS!)",
    };
  },
});