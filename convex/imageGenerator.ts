import { action, mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { ActionCtx} from "./_generated/server";

// =================================================================
// 🎯 CONFIGURAÇÃO - 100% GRATUITO COM POLLINATIONS
// =================================================================
const DAILY_LIMIT = 7;

console.log("🎉 GERADOR DE IMAGENS 100% GRATUITO ATIVADO!");
console.log("   API: Pollinations.ai (FLUX modelo)");
console.log("   Custo: $0.00 (COMPLETAMENTE GRÁTIS!)");
console.log("   Qualidade: ⭐⭐⭐⭐⭐ Excelente!");
console.log("   Velocidade: 3-8 segundos");

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
// 🎨 GERAÇÃO COM POLLINATIONS (100% GRÁTIS!)
// =================================================================
async function generateWithPollinations(prompt: string): Promise<Blob> {
  try {
    console.log("🌟 Gerando com Pollinations (100% GRÁTIS)...");
    console.log("📝 Prompt:", prompt.substring(0, 100) + "...");

    const enhancedPrompt = enhancePrompt(prompt);

    const params = new URLSearchParams({
      width: '1024',
      height: '1024',
      seed: Math.floor(Math.random() * 1000000).toString(),
      model: 'flux',
      nologo: 'true',
      enhance: 'true',
      private: 'true'
    });

    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?${params}`;

    console.log("🔗 Solicitando imagem...");

    const response = await fetch(url, {
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const blob = await response.blob();

    if (blob.size < 10000) {
      throw new Error("Imagem muito pequena");
    }

    console.log(`✅ SUCESSO! ${(blob.size / 1024).toFixed(2)}KB | Custo: $0.00 (GRÁTIS!) 🎉`);

    return blob;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("❌ Erro Pollinations:", errorMessage);
    throw new Error("Erro ao gerar imagem. Tente novamente!");
  }
}

// =================================================================
// 🎯 MELHORADOR DE PROMPT (CORRIGIDO)
// =================================================================
function enhancePrompt(original: string): string {
  // Detecta tipo de conteúdo (variável 'lower' REMOVIDA)
  const isLogo = /\b(logo|logotipo|brand|marca)\b/i.test(original);
  const isUI = /\b(interface|ui|ux|dashboard|website|app|software)\b/i.test(original);
  const isProduct = /\b(product|produto|mockup|package)\b/i.test(original);
  const isPhoto = /\b(photo|foto|portrait|retrato)\b/i.test(original);

  let enhanced = original;

  if (isLogo) {
    enhanced = `${original}, professional logo design, minimalist, vector art, clean, modern, high quality`;
  } else if (isUI) {
    enhanced = `${original}, modern UI design, professional interface, clean layout, Figma quality, high resolution, no people`;
  } else if (isProduct) {
    enhanced = `${original}, professional product photography, studio lighting, white background, commercial photo, ultra sharp, 8K`;
  } else if (isPhoto) {
    enhanced = `${original}, professional photography, high quality, detailed, 8K, award winning`;
  } else {
    enhanced = `${original}, masterpiece, best quality, highly detailed, professional, 8K`;
  }

  console.log("✨ Prompt melhorado:", enhanced.substring(0, 150) + "...");

  return enhanced;
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

      // Gera a imagem (100% GRÁTIS!)
      const imageBlob = await generateWithPollinations(args.prompt);

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
        method: 'pollinations-flux-free',
        remainingToday: remaining - 1,
        message: `🎉 Imagem criada 100% GRÁTIS! ${remaining - 1} restantes hoje. Custo: $0.00 🎉`
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao gerar imagem";
      console.error("❌ Erro:", errorMessage);
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
      method: "pollinations-flux-free",
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
        method: "Pollinations FLUX (100% Gratuito)",
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
      method: "Pollinations FLUX (100% Gratuito)",
      quality: "Ultra HD 1024x1024",
      costPerImage: "$0.00 (GRÁTIS!)",
      monthlyCost: "$0.00 (SEMPRE GRÁTIS!)",
    };
  },
});