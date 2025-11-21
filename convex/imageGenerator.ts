import { action, mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id, Doc } from "./_generated/dataModel";
import { ActionCtx } from "./_generated/server";
import Groq from "groq-sdk";

// =================================================================
// 🎯 CONFIGURAÇÃO & TIPOS
// =================================================================
const DAILY_LIMIT = 10;

// Interface explícita para o retorno da geração
interface GenerateImageResult {
  url: string;
  enhancedPrompt: string;
  remainingToday: number;
  message: string;
}

// Interface para o retorno da checagem de limite
interface LimitCheckResult {
  canGenerate: boolean;
  remaining: number;
}

// Inicializa Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// =================================================================
// 🧠 ENGENHARIA DE PROMPT COM IA (GROQ)
// =================================================================
async function enhancePromptWithGroq(userPrompt: string, style: string): Promise<string> {
  try {
    console.log("🧠 Groq: Otimizando prompt...");

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert AI Image Prompt Engineer using Flux.1 models.
          YOUR MISSION:
          1. Translate to English if needed.
          2. Enhance with professional descriptors (lighting, texture, camera, render engine).
          3. Apply the style: ${style}.
          4. Keep it under 300 chars.
          5. OUTPUT ONLY THE RAW PROMPT.`
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      model: "llama-3.1-70b-versatile",
      temperature: 0.7,
      max_tokens: 200,
    });

    return completion.choices[0]?.message?.content?.trim() || userPrompt;
  } catch (error) {
    console.error("⚠️ Erro no Groq, usando original:", error);
    return `${userPrompt}, ${style}, high quality, 8k`;
  }
}

// =================================================================
// 🎨 API DE IMAGEM (POLLINATIONS - FLUX)
// =================================================================
async function generateWithPollinations(prompt: string): Promise<Blob> {
  const seed = Math.floor(Math.random() * 1000000);
  const params = new URLSearchParams({
    prompt: prompt,
    width: '1024',
    height: '1024',
    seed: seed.toString(),
    model: 'flux',
    nologo: 'true',
    enhance: 'false'
  });

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    signal: AbortSignal.timeout(40000) // 40s timeout para segurança
  });

  if (!response.ok) throw new Error(`Erro API Imagem: ${response.statusText}`);

  const blob = await response.blob();
  if (blob.size < 1000) throw new Error("Imagem gerada inválida (tamanho incorreto)");

  return blob;
}

// =================================================================
// 🛠️ HELPERS (COM TIPAGEM EXPLÍCITA PARA CORRIGIR 'ANY')
// =================================================================

function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

async function checkDailyLimit(ctx: ActionCtx, userId: string): Promise<LimitCheckResult> {
  const today = getCurrentDate();

  // Casting explícito para Doc<"dailyImageUsage"> ou null
  const dailyUsage = await ctx.runQuery(internal.imageGenerator.getDailyUsageInternal, {
    userId,
    date: today
  }) as Doc<"dailyImageUsage"> | null;

  if (!dailyUsage) {
    return { canGenerate: true, remaining: DAILY_LIMIT };
  }

  const lastResetDate = new Date(dailyUsage.lastResetAt ?? Date.now()).toISOString().split('T')[0];

  if (lastResetDate !== today) {
    await ctx.runMutation(internal.imageGenerator.resetDailyUsage, { userId, date: today });
    return { canGenerate: true, remaining: DAILY_LIMIT };
  }

  const remaining = DAILY_LIMIT - dailyUsage.count;
  return {
    canGenerate: remaining > 0,
    remaining: Math.max(0, remaining)
  };
}

async function incrementDailyUsage(ctx: ActionCtx, userId: string, imageId: Id<"generatedImages">): Promise<void> {
  const today = getCurrentDate();
  await ctx.runMutation(internal.imageGenerator.updateDailyUsage, {
    userId,
    imageId,
    date: today,
  });
}

// =================================================================
// 🚀 ACTION PRINCIPAL
// =================================================================
export const generateImage = action({
  args: {
    prompt: v.string(),
    styleId: v.string()
  },
  handler: async (ctx, args): Promise<GenerateImageResult> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Login necessário");

    const userId = identity.subject;

    // 1. Verifica limites
    const { canGenerate, remaining } = await checkDailyLimit(ctx, userId);
    if (!canGenerate) {
      throw new Error(`🚫 Limite diário atingido! Volte amanhã.`);
    }

    // 2. Otimiza Prompt
    const styleMap: Record<string, string> = {
      "realistic": "Photorealistic, 8k, cinematic lighting, raw photo",
      "artistic": "Digital art, creative, vibrant colors, masterpiece",
      "3d": "3D render, octane render, unreal engine 5, isometric",
      "anime": "Anime style, studio ghibli, detailed illustration",
      "minimal": "Minimalist, vector art, flat design, clean background",
      "vintage": "Vintage photo, grain, polaroid, 90s aesthetic"
    };

    const styleDesc = styleMap[args.styleId] || "High quality";
    const enhancedPrompt = await enhancePromptWithGroq(args.prompt, styleDesc);

    // 3. Gera Imagem
    let imageBlob: Blob;
    try {
      imageBlob = await generateWithPollinations(enhancedPrompt);
    } catch (error) {
      console.error("Erro na geração:", error);
      throw new Error("Serviço instável. Tente em alguns segundos.");
    }

    // 4. Salva
    const storageId = await ctx.storage.store(imageBlob);
    const imageUrl = await ctx.storage.getUrl(storageId);
    if (!imageUrl) throw new Error("Erro ao salvar URL");

    const imageId = await ctx.runMutation(internal.imageGenerator.saveGeneratedImage, {
      userId,
      prompt: args.prompt,
      enhancedPrompt,
      imageUrl,
      storageId,
      style: args.styleId
    });

    await incrementDailyUsage(ctx, userId, imageId);

    return {
      url: imageUrl,
      enhancedPrompt,
      remainingToday: remaining - 1,
      message: "Imagem criada com sucesso!"
    };
  },
});

// =================================================================
// 💾 INTERNAL MUTATIONS & QUERIES (TIPADAS)
// =================================================================

export const saveGeneratedImage = internalMutation({
  args: {
    userId: v.string(),
    prompt: v.string(),
    enhancedPrompt: v.optional(v.string()),
    imageUrl: v.string(),
    storageId: v.id("_storage"),
    style: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"generatedImages">> => {
    return await ctx.db.insert("generatedImages", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getDailyUsageInternal = internalQuery({
  args: { userId: v.string(), date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dailyImageUsage")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId).eq("date", args.date))
      .first();
  },
});

export const resetDailyUsage = internalMutation({
  args: { userId: v.string(), date: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("dailyImageUsage")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { count: 0, date: args.date, lastResetAt: Date.now() });
    }
  }
});

export const updateDailyUsage = internalMutation({
  args: {
    userId: v.string(),
    imageId: v.id("generatedImages"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("dailyImageUsage")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId).eq("date", args.date))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        count: existing.count + 1,
        lastResetAt: Date.now()
      });
    } else {
      await ctx.db.insert("dailyImageUsage", {
        userId: args.userId,
        date: args.date,
        count: 1,
        lastResetAt: Date.now(),
        images: []
      });
    }
  },
});

export const deleteImage = mutation({
  args: { imageId: v.id("generatedImages"), storageId: v.id("_storage") },
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

// =================================================================
// 📊 PUBLIC QUERIES
// =================================================================
export const getImagesForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("generatedImages")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(50);
  },
});

export const getUsageStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const today = new Date().toISOString().split('T')[0];
    const daily = await ctx.db
      .query("dailyImageUsage")
      .withIndex("by_user_date", (q) => q.eq("userId", identity.subject).eq("date", today))
      .first();

    const used = daily ? daily.count : 0;
    return {
      dailyLimit: DAILY_LIMIT,
      remainingToday: Math.max(0, DAILY_LIMIT - used),
      usedToday: used
    };
  },
});