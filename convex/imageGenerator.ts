import { action, mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import {  Doc } from "./_generated/dataModel";
import { ActionCtx } from "./_generated/server";
import Groq from "groq-sdk";

// =================================================================
// 🎯 CONFIGURAÇÃO
// =================================================================
const DAILY_LIMIT = 10;

// Modelos Oficiais (URL Atualizada para o novo Router da Hugging Face)
const MODEL_FLUX = "black-forest-labs/FLUX.1-dev";
const MODEL_SDXL = "stabilityai/stable-diffusion-xl-base-1.0";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "chave_temporaria_apenas_para_o_build" });

// =================================================================
// 🛠️ HELPERS
// =================================================================

function getHuggingFaceToken(): string {
  const token =
    process.env.HUGGINGFACE_API_TOKEN ||
    process.env.HUGGING_FACE_TOKEN ||
    process.env.HUGGING_FACE_API_KEY;

  if (!token) throw new Error("Chave Hugging Face não encontrada.");
  return token;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// =================================================================
// 🎨 ENGINE DE GERAÇÃO (URL CORRIGIDA: ROUTER)
// =================================================================

async function queryHuggingFace(modelId: string, prompt: string): Promise<Blob> {
  const token = getHuggingFaceToken();

  // 🚨 CORREÇÃO CRÍTICA: URL atualizada conforme mensagem de erro 410
  const apiUrl = `https://router.huggingface.co/hf-inference/models/${modelId}`;

  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    attempts++;
    console.log(`🚀 [${attempts}/${maxAttempts}] Requisitando ${modelId}...`);

    try {
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "x-use-cache": "false"
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
             width: 1024,
             height: 1024,
             num_inference_steps: 25,
             guidance_scale: 7.5
          }
        }),
      });

      // Se o modelo estiver "carregando" (Status 503)
      if (response.status === 503) {
        const errorData = await response.json().catch(() => ({}));
        const waitTime = errorData.estimated_time ? Math.ceil(errorData.estimated_time * 1000) : 10000;
        console.warn(`⏳ Modelo aquecendo. Aguarde ${(waitTime/1000).toFixed(1)}s...`);
        await delay(waitTime);
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Erro API HF (${response.status}): ${errText}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
         throw new Error("API retornou JSON em vez de imagem. Tente novamente.");
      }

      return await response.blob();

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Erro tentativa ${attempts}:`, errorMessage);
      if (attempts === maxAttempts) throw error;
      await delay(2000);
    }
  }
  throw new Error("Falha na comunicação com Hugging Face.");
}

async function generateWithFallback(prompt: string): Promise<{ blob: Blob, model: string }> {
  // 1. Tenta FLUX
  try {
    const blob = await queryHuggingFace(MODEL_FLUX, prompt);
    return { blob, model: "FLUX.1-dev" };
  } catch  {
    console.warn("⚠️ Flux falhou. Tentando SDXL...");
  }

  // 2. Tenta SDXL
  try {
    const blob = await queryHuggingFace(MODEL_SDXL, prompt);
    return { blob, model: "SDXL-1.0" };
  } catch  {
    throw new Error("Serviço indisponível. Tente em 2 minutos.");
  }
}

// =================================================================
// 🧠 PROMPT OTIMIZADO
// =================================================================
async function enhancePrompt(userPrompt: string, style: string): Promise<string> {
  if (!process.env.GROQ_API_KEY) return userPrompt;
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Expert Prompt Engineer.
          1. Translate to English.
          2. Add: 8k, masterpiece, cinematic lighting.
          3. Style: "${style}".
          4. Output ONLY the raw prompt.`
        },
        { role: "user", content: userPrompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 250,
    });
    return completion.choices[0]?.message?.content?.trim() || userPrompt;
  } catch  {
    return userPrompt;
  }
}

// =================================================================
// 🛡️ LIMITES
// =================================================================
function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

async function checkDailyLimit(ctx: ActionCtx, userId: string) {
  const today = getCurrentDate();
  const dailyUsage = await ctx.runQuery(internal.imageGenerator.getDailyUsageInternal, {
    userId,
    date: today
  }) as Doc<"dailyImageUsage"> | null;

  if (!dailyUsage) return { canGenerate: true, remaining: DAILY_LIMIT };

  const lastResetDate = new Date(dailyUsage.lastResetAt ?? Date.now()).toISOString().split('T')[0];
  if (lastResetDate !== today) {
    await ctx.runMutation(internal.imageGenerator.resetDailyUsage, { userId, date: today });
    return { canGenerate: true, remaining: DAILY_LIMIT };
  }
  const remaining = DAILY_LIMIT - dailyUsage.count;
  return { canGenerate: remaining > 0, remaining: Math.max(0, remaining) };
}

// =================================================================
// 🚀 ACTION PRINCIPAL
// =================================================================
export const generateImage = action({
  args: { prompt: v.string(), styleId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Login necessário.");
    const userId = identity.subject;

    const { canGenerate, remaining } = await checkDailyLimit(ctx, userId);
    if (!canGenerate) throw new Error("Limite diário atingido.");

    const styleMap: Record<string, string> = {
      "realistic": "Photorealistic, 8k, cinematic lighting",
      "artistic": "Digital art, vibrant, masterpiece",
      "3d": "3D render, octane render, unreal engine 5",
      "anime": "Anime style, studio ghibli, detailed",
      "minimal": "Minimalist, vector art, clean background",
      "vintage": "Vintage photo, polaroid, film grain"
    };

    const enhancedPrompt = await enhancePrompt(args.prompt, styleMap[args.styleId] || "High quality");
    const { blob, model } = await generateWithFallback(enhancedPrompt);

    const storageId = await ctx.storage.store(blob);
    const imageUrl = await ctx.storage.getUrl(storageId);
    if (!imageUrl) throw new Error("Erro ao salvar imagem.");

    const imageId = await ctx.runMutation(internal.imageGenerator.saveGeneratedImage, {
      userId,
      prompt: args.prompt,
      enhancedPrompt,
      imageUrl,
      storageId,
      style: args.styleId,
    });

    const today = getCurrentDate();
    await ctx.runMutation(internal.imageGenerator.updateDailyUsage, { userId, imageId, date: today });

    return {
      url: imageUrl,
      enhancedPrompt,
      remainingToday: remaining - 1,
      message: "Imagem criada com sucesso!",
      usedModel: model
    };
  },
});

// =================================================================
// 💾 DATABASE (MANTENHA)
// =================================================================
export const saveGeneratedImage = internalMutation({
  args: {
    userId: v.string(),
    prompt: v.string(),
    enhancedPrompt: v.optional(v.string()),
    imageUrl: v.string(),
    storageId: v.id("_storage"),
    style: v.optional(v.string()),
  },
  handler: async (ctx, args) => ctx.db.insert("generatedImages", { ...args, method: "hf-router", createdAt: Date.now() }),
});

export const getDailyUsageInternal = internalQuery({
  args: { userId: v.string(), date: v.string() },
  handler: async (ctx, args) => ctx.db.query("dailyImageUsage").withIndex("by_user_date", (q) => q.eq("userId", args.userId).eq("date", args.date)).first(),
});

export const resetDailyUsage = internalMutation({
  args: { userId: v.string(), date: v.string() },
  handler: async (ctx, args) => {
    const ex = await ctx.db.query("dailyImageUsage").withIndex("by_user_date", (q) => q.eq("userId", args.userId)).first();
    if (ex) await ctx.db.patch(ex._id, { count: 0, date: args.date, lastResetAt: Date.now() });
  }
});

export const updateDailyUsage = internalMutation({
  args: { userId: v.string(), imageId: v.id("generatedImages"), date: v.string() },
  handler: async (ctx, args) => {
    const ex = await ctx.db.query("dailyImageUsage").withIndex("by_user_date", (q) => q.eq("userId", args.userId).eq("date", args.date)).first();
    if (ex) await ctx.db.patch(ex._id, { count: ex.count + 1, lastResetAt: Date.now() });
    else await ctx.db.insert("dailyImageUsage", { userId: args.userId, date: args.date, count: 1, lastResetAt: Date.now(), images: [] });
  },
});

export const deleteImage = mutation({
  args: { imageId: v.id("generatedImages"), storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Auth required");
    const img = await ctx.db.get(args.imageId);
    if (!img || img.userId !== identity.subject) throw new Error("Permission denied");
    await ctx.storage.delete(args.storageId);
    await ctx.db.delete(args.imageId);
    return { success: true };
  },
});

export const getImagesForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db.query("generatedImages").withIndex("by_user", (q) => q.eq("userId", identity.subject)).order("desc").take(50);
  },
});

export const getUsageStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const today = getCurrentDate();
    const daily = await ctx.db.query("dailyImageUsage").withIndex("by_user_date", (q) => q.eq("userId", identity.subject).eq("date", today)).first();
    const used = daily ? daily.count : 0;
    return { dailyLimit: DAILY_LIMIT, remainingToday: Math.max(0, DAILY_LIMIT - used), usedToday: used };
  },
});