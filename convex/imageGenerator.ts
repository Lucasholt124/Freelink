// /convex/imageGenerator.ts - 100% GRATUITO COM FLUX SCHNELL 🎉
import { action, mutation, internalMutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import Groq from 'groq-sdk';
import { internal } from "./_generated/api";
import Replicate from "replicate";
import { Id } from "./_generated/dataModel";
import { ActionCtx } from "./_generated/server";

// ========================================================
// 🔥 CONFIGURAÇÃO DAS API KEYS
// ========================================================
const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

const replicate = REPLICATE_API_KEY ? new Replicate({
  auth: REPLICATE_API_KEY,
  fetch: (url, options) => {
    return fetch(url, {
      ...options,
      signal: AbortSignal.timeout(60000), // 60s timeout (Schnell é rápido!)
    });
  },
}) : null;

// ========================================================
// 💰 MODELO 100% GRATUITO!
// ========================================================
const FREE_MODEL = "black-forest-labs/flux-schnell"; // ✅ TOTALMENTE GRÁTIS!

console.log("🎉 MODO 100% GRATUITO ATIVADO!");
console.log("   Modelo: FLUX SCHNELL");
console.log("   Custo: $0.00 (COMPLETAMENTE GRÁTIS!)");
console.log("   Velocidade: 3-5 segundos");
console.log("   Qualidade: ⭐⭐⭐⭐ Excelente!");

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
  go_fast?: boolean;
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
  // Formato YYYY-MM-DD
  return now.toISOString().split('T')[0];
}

async function checkAndUpdateDailyLimit(
  ctx: ActionCtx,
  userId: string
): Promise<{ canGenerate: boolean; remaining: number }> {
  const today = getCurrentDate();
  const DAILY_LIMIT = 7;

  // Tenta obter o uso de hoje
  const dailyUsage = await ctx.runQuery(internal.imageGenerator.getDailyUsageInternal, {
    userId,
    date: today
  }) as DailyUsage | null;

  // Se não houver uso, pode gerar e resta o limite total
  if (!dailyUsage) {
    return { canGenerate: true, remaining: DAILY_LIMIT };
  }

  // Lógica de reset (necessária para garantir que o limite zere à meia-noite)
  // O Convex não tem Cron jobs nativos, então o reset é on-demand
  const lastResetDate = dailyUsage.lastResetAt
    ? new Date(dailyUsage.lastResetAt).toISOString().split('T')[0]
    : dailyUsage.date;

  if (lastResetDate !== today) {
    // Reseta o uso para hoje
    await ctx.runMutation(internal.imageGenerator.updateDailyUsage, {
      userId,
      imageId: null, // Null para não adicionar imagem
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
  // Atualiza a contagem e adiciona o ID da nova imagem
  await ctx.runMutation(internal.imageGenerator.updateDailyUsage, {
    userId,
    imageId,
    date: today,
  });
}

// ========================================================
// 🎯 MELHORADOR DE PROMPT PARA FLUX SCHNELL (GRÁTIS!)
// ========================================================
function enhancePromptForFluxSchnell(originalPrompt: string): {
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
  const model = FREE_MODEL; // FLUX SCHNELL - 100% GRÁTIS!

  // ✅ Parâmetros otimizados para FLUX SCHNELL (máximo 4 steps = grátis)
  const params: ReplicateParams = {
    num_outputs: 1,
    num_inference_steps: 4, // ✅ CRÍTICO: 4 steps = GRÁTIS! Mais que isso = PAGO!
    go_fast: true, // ✅ Ativa modo turbo (ainda grátis)
    output_format: "webp",
    output_quality: 90,
  };

  // 🔥 PROMPTS OTIMIZADOS POR TIPO
  if (isSoftware) {
    const nameMatch = originalPrompt.match(/\b(?:nome|name|chamado|called)\s+(\w+)/i);
    const brandName = nameMatch ? nameMatch[1] : "TechPro";

    if (originalPrompt.toLowerCase().includes("saas") || originalPrompt.toLowerCase().includes("dashboard")) {
      enhancedPrompt = `Professional modern SaaS dashboard UI for ${brandName}, clean interface, sidebar navigation, charts, widgets, gradient blue purple, dark mode, ultra sharp, 8K, no people`;
      params.width = 1344;
      params.height = 768;
    } else if (originalPrompt.toLowerCase().includes("landing") || originalPrompt.toLowerCase().includes("site") || originalPrompt.toLowerCase().includes("website")) {
      enhancedPrompt = `Modern landing page ${brandName}, hero section, gradient, web design 2025, CTA buttons, features, testimonials, pricing, clean UI, 8K, no people`;
      params.width = 1344;
      params.height = 768;
    } else if (originalPrompt.toLowerCase().includes("app") || originalPrompt.toLowerCase().includes("mobile")) {
      enhancedPrompt = `Mobile app interface ${brandName}, iOS Android UI, iPhone mockup, minimal design, professional screens, 8K, no people`;
      params.width = 768;
      params.height = 1344;
    } else {
      enhancedPrompt = `Professional software interface ${brandName}, modern UI, clean layout, 8K, no people`;
      params.width = 1344;
      params.height = 768;
    }

  } else if (isLogo) {
    const nameMatch = originalPrompt.match(/\b(?:nome|name|chamado|called)\s+(\w+)/i);
    const brandName = nameMatch ? nameMatch[1] : "Brand";

    enhancedPrompt = `Professional minimalist logo ${brandName}, modern geometric vector, clean typography, gradient colors, white background, ultra sharp, 8K`;
    params.width = 1024;
    params.height = 1024;

  } else if (isRealistic || isPerson) {
    enhancedPrompt = `${originalPrompt}, professional photography, Canon EOS R5 85mm, natural lighting, ultra sharp, award winning photo, 8K photorealistic`;
    params.width = 1024;
    params.height = 1024;

  } else if (isProduct) {
    enhancedPrompt = `${originalPrompt}, professional product photography, studio lighting, white background, commercial photo, ultra sharp, 8K`;
    params.width = 1024;
    params.height = 1024;

  } else {
    enhancedPrompt = `${originalPrompt}, masterpiece, best quality, ultra detailed, sharp focus, professional, 8K`;
    params.width = 1024;
    params.height = 1024;
  }

  console.log("🎯 Tipo:", isSoftware ? "UI/UX" : isLogo ? "LOGO" : isProduct ? "PRODUTO" : isRealistic ? "FOTO" : "GENÉRICO");
  console.log("💰 Modelo: FLUX SCHNELL (100% GRÁTIS!)");
  console.log("⚡ Steps: 4 (máximo gratuito)");
  console.log("✨ Prompt:", enhancedPrompt.substring(0, 100) + "...");

  return { prompt: enhancedPrompt, model, params };
}

// ========================================================
// 🌟 GERAÇÃO COM REPLICATE (FLUX SCHNELL - GRÁTIS!)
// ========================================================
async function generateWithReplicate(prompt: string): Promise<Blob | null> {
  if (!replicate) {
    console.log("⚠️ Replicate não configurado");
    return null;
  }

  try {
    console.log("🎉 Gerando com FLUX SCHNELL (100% GRATUITO!)...");

    const { prompt: enhancedPrompt, model, params } = enhancePromptForFluxSchnell(prompt);

    console.log("🔧 Config:", {
      model: "FLUX SCHNELL",
      custo: "$0.00 (GRÁTIS!)",
      width: params.width,
      height: params.height,
      steps: params.num_inference_steps
    });

    const input: Record<string, unknown> = {
      prompt: enhancedPrompt,
      ...params
    };

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout 60s')), 60000);
    });

    // Roda o modelo no Replicate
    const replicatePromise = replicate.run(
      model as `${string}/${string}` | `${string}/${string}:${string}`,
      { input }
    );

    const output = await Promise.race([replicatePromise, timeoutPromise]);

    console.log("📦 Output type:", typeof output, Array.isArray(output) ? 'array' : 'object');

    let imageUrl: string | null = null;

    // Lógica para extrair a URL de diferentes formatos de retorno do Replicate
    if (Array.isArray(output)) {
      const firstOutput = output[0];

      if (firstOutput && typeof firstOutput === 'object' && 'url' in firstOutput) {
        imageUrl = await (firstOutput as ReplicateFileOutput).url();
        console.log("✅ FileOutput URL extraída");
      } else if (typeof firstOutput === 'string') {
        imageUrl = firstOutput;
        console.log("✅ URL string direta");
      } else if (firstOutput && typeof firstOutput === 'object' && '_state' in firstOutput) {
        // Trata ReadableStream, comum em algumas APIs
        console.log("🔄 Convertendo ReadableStream...");
        try {
          const response = new Response(firstOutput as ReadableStream);
          const blob = await response.blob();
          if (blob.size > 20000) {
            console.log(`✅ Stream OK! ${(blob.size / 1024).toFixed(2)}KB | Custo: $0.00 (GRÁTIS!) 🎉`);
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
        console.log(`✅ SUCESSO! ${(blob.size / 1024).toFixed(2)}KB | Custo: $0.00 (100% GRÁTIS!) 🎉`);
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
    console.log("🌟 Fallback: Pollinations (GRÁTIS)...");

    const isInterface = /\b(dashboard|interface|ui|ux|saas|software|website|landing)\b/i.test(prompt);

    // Parâmetros otimizados para Pollinations
    const params = new URLSearchParams({
      width: isInterface ? '1280' : '1024',
      height: isInterface ? '720' : '1024',
      seed: Math.floor(Math.random() * 1000000).toString(),
      model: 'flux', // Pollinations também suporta o modelo Flux
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
      if (blob.size > 20000) {
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

  // Lógica de aprimoramento similar à do Flux Schnell
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
// 🚀 FUNÇÃO PRINCIPAL DE GERAÇÃO (100% GRÁTIS!)
// ========================================================
async function generateImageWithAI(prompt: string): Promise<Blob> {
  console.log("🎉 Iniciando geração 100% GRATUITA...");
  console.log("📝 Prompt:", prompt);

  // 1️⃣ FLUX SCHNELL (GRÁTIS!) - Primeira tentativa
  if (REPLICATE_API_KEY) {
    console.log("🎉 Usando FLUX SCHNELL - Custo: $0.00 (GRÁTIS!)");

    try {
      const replicateBlob = await generateWithReplicate(prompt);

      // Verifica o tamanho do Blob para garantir que não é uma imagem de erro/pequena
      if (replicateBlob && replicateBlob.size > 20000) {
        console.log("✅ FLUX SCHNELL gerou imagem perfeita!");
        console.log("💵 Custo desta imagem: $0.00 (100% GRATUITO!)");
        return replicateBlob;
      }
    } catch (error) {
      console.error("❌ Erro FLUX SCHNELL:", error);
    }
  }

  // 2️⃣ Pollinations (GRATUITO) - Fallback
  console.log("🔄 Fallback: Pollinations (GRÁTIS)");
  const enhancedPrompt = enhancePromptIntelligently(prompt);

  try {
    const pollinationsBlob = await generateWithPollinations(enhancedPrompt);

    if (pollinationsBlob && pollinationsBlob.size > 15000) {
      console.log("✅ Pollinations funcionou!");
      console.log("💵 Custo: $0.00 (100% GRATUITO)");
      return pollinationsBlob;
    }
  } catch (error) {
    console.error("❌ Erro Pollinations:", error);
  }

  // 3️⃣ Última tentativa (Pollinations com prompt simples, garantindo um resultado)
  console.log("🔄 Última tentativa: Pollinations (fallback simples)...");

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

  // Lança erro final se tudo falhar
  throw new Error("❌ Não foi possível gerar a imagem. Tente novamente com um prompt diferente.");
}

// ========================================================
// 🚀 AÇÃO PRINCIPAL
// ========================================================
export const generateImage = action({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Faça login para usar a geração de imagens.");

    const userId = identity.subject;

    try {
      // 1. Checa o limite diário
      const { canGenerate, remaining } = await checkAndUpdateDailyLimit(ctx, userId);

      if (!canGenerate) {
        throw new Error(`🚫 Limite diário atingido! Volte amanhã para mais ${7} imagens!`);
      }

      console.log(`📊 Imagens restantes para hoje: ${remaining - 1}`);

      // 2. Gera a imagem (FLUX SCHNELL ou Fallback)
      const imageBlob = await generateImageWithAI(args.prompt);
      console.log("✅ Imagem gerada com sucesso!");

      // 3. Salva no Convex Storage
      const storageId = await ctx.storage.store(imageBlob);
      const imageUrl = await ctx.storage.getUrl(storageId);

      if (!imageUrl) throw new Error("Erro ao salvar a imagem no Convex Storage.");

      // 4. Salva o registro no banco de dados
      const imageId = await ctx.runMutation(internal.imageGenerator.saveGeneratedImage, {
        userId,
        prompt: args.prompt,
        imageUrl,
        storageId,
      });

      // 5. Incrementa o uso diário
      await incrementDailyUsage(ctx, userId, imageId);

      return {
        url: imageUrl,
        method: 'flux-schnell-free',
        remainingToday: remaining - 1,
        message: `🎉 Imagem gerada 100% GRÁTIS! ${remaining - 1} restantes. Custo: $0.00 🎉`
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido na geração de imagem.";
      console.error("❌ Erro em generateImage:", errorMessage);
      throw new Error(errorMessage);
    }
  },
});

// ========================================================
// 🔥 GERAÇÃO DE ROTEIRO VIRAL
// ========================================================
async function generateViralScript(topic: string, style: string, duration: number): Promise<VideoScript> {
  if (!groq) {
    throw new Error("GROQ_API_KEY não configurada. Serviço de Roteiro Indisponível.");
  }

  const prompt = `Crie um roteiro EXPLOSIVO sobre: "${topic}", Estilo: "${style}", Duração: ${duration}s. Retorne APENAS o JSON válido no formato VideoScript.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages: [
        { role: 'system', content: 'Você é um roteirista viral de IA. Responda APENAS com JSON válido, seguindo estritamente o formato VideoScript. Não adicione nenhum texto antes ou depois do JSON.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.9,
      max_tokens: 4096,
    });

    const scriptText = chatCompletion.choices[0]?.message?.content;
    if (!scriptText) throw new Error("Erro ao gerar roteiro: resposta vazia.");

    // Tenta fazer o parse do JSON
    return JSON.parse(scriptText) as VideoScript;

  } catch (error) {
    console.error("❌ Erro ao gerar roteiro com Groq:", error);
    // Retorno de fallback em caso de falha na API ou no parse
    return {
      title: `🔥 Título Viral: ${topic}`,
      hook: `PARE! Você PRECISA saber isso sobre ${topic}...`,
      duration: `${duration}s`,
      format: "9:16",
      style: style,
      scenes: [{ number: 1, duration: "0-3s", text: topic, visual: "Gráfico Impactante", camera: "Zoom In Rápido", transition: "Corte Seco" }],
      music: "Música em Alta (Trending)",
      hashtags: ["#viral", "#${topic.replace(/ /g, '')}", "#crescimento"],
      cta: "Comenta 'EU QUERO'!",
      canvaSteps: ["Use template de vídeo curto", "Ajuste o texto da cena 1"],
      capcutSteps: ["Adicione legendas automáticas", "Acelere a música na parte 1"],
      proTips: ["Publique às 18h BR", "Responda os 3 primeiros comentários"]
    };
  }
}

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
    if (!identity) throw new Error("Faça login para usar o gerador de roteiros.");

    try {
      const script = await generateViralScript(args.topic, args.style, args.duration);
      return { script, method: 'groq-llama3.1-70b', message: `🎬 Roteiro viral criado em segundos!` };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao gerar roteiro.";
      throw new Error(errorMessage);
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
    if (!identity) throw new Error("Não autenticado. Faça login.");

    const image = await ctx.db.get(args.imageId);
    // Verifica se a imagem existe e pertence ao usuário
    if (!image || image.userId !== identity.subject) throw new Error("Sem permissão ou imagem não encontrada.");

    // Deleta do storage e do banco
    await ctx.storage.delete(args.storageId);
    await ctx.db.delete(args.imageId);
    return { success: true, message: "Imagem deletada com sucesso." };
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
      method: "flux-schnell-free",
      createdAt: Date.now(),
    });
  },
});

export const getDailyUsageInternal = internalQuery({
  args: { userId: v.string(), date: v.string() },
  handler: async (ctx, args): Promise<DailyUsage | null> => {
    // Busca o registro de uso diário
    return await ctx.db
      .query("dailyImageUsage")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId).eq("date", args.date))
      .first() as DailyUsage | null;
  },
});

export const getTodayImages = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const userId = identity.subject;
    const today = getCurrentDate();

    // 1. Pega o registro de uso diário
    const dailyUsage = await ctx.db
      .query("dailyImageUsage")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", today))
      .first() as DailyUsage | null;

    if (!dailyUsage || !dailyUsage.images || dailyUsage.images.length === 0) return [];

    // 2. Mapeia os IDs para buscas de documentos (aqui o erro foi corrigido)
    const imagePromises = dailyUsage.images.map(img => ctx.db.get(img.imageId));

    // 3. Aguarda todas as buscas e filtra nulls (imagens deletadas)
    const images = await Promise.all(imagePromises);
    return images.filter(Boolean);
  },
});

export const updateDailyUsage = internalMutation({
  args: {
    userId: v.string(),
    // Union permite passar o ID de uma nova imagem ou null/undefined para só resetar
    imageId: v.optional(v.union(v.id("generatedImages"), v.null())),
    date: v.string(),
    count: v.optional(v.number()),
    images: v.optional(v.array(v.object({ imageId: v.id("generatedImages"), createdAt: v.number() }))),
    lastResetAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.runQuery(internal.imageGenerator.getDailyUsageInternal, { userId: args.userId, date: args.date }) as DailyUsage | null;

    if (existing) {
      // Atualiza o registro existente
      const newCount = args.count !== undefined ? args.count : existing.count + 1;

      let newImages = existing.images || [];
      if (args.images !== undefined) {
        newImages = args.images;
      } else if (args.imageId) {
        newImages = [...newImages, { imageId: args.imageId, createdAt: Date.now() }];
      }

      await ctx.db.patch(existing._id, {
        count: newCount,
        images: newImages,
        lastResetAt: args.lastResetAt || existing.lastResetAt,
      });
    } else if (args.count === 0 || (args.imageId && args.count === undefined)) {
      // Cria um novo registro
      await ctx.db.insert("dailyImageUsage", {
        userId: args.userId,
        date: args.date,
        count: args.count === 0 ? 0 : 1,
        images: args.images || (args.imageId ? [{ imageId: args.imageId, createdAt: Date.now() }] : []),
        lastResetAt: args.lastResetAt || Date.now()
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

    // Busca as últimas 100 imagens geradas pelo usuário, em ordem decrescente de criação
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

    // Busca todas as imagens para contar o total
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
    if (!identity) {
        return {
            dailyLimit: 7,
            usedToday: 0,
            remainingToday: 7,
            resetTime: "00:00 UTC",
            method: "FLUX SCHNELL (100% Gratuito)",
            quality: "Ultra HD - $0.00 por imagem",
            costPerImage: "$0.00 (GRÁTIS!)",
            monthlyCost: "$0.00 (SEMPRE GRÁTIS!)",
        };
    }

    const userId = identity.subject;
    const today = getCurrentDate();
    const DAILY_LIMIT = 7;

    const dailyUsage = await ctx.db
      .query("dailyImageUsage")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", today))
      .first() as DailyUsage | null;

    const used = dailyUsage?.count || 0;
    const remaining = Math.max(0, DAILY_LIMIT - used);

    return {
        dailyLimit: DAILY_LIMIT,
        usedToday: used,
        remainingToday: remaining,
        resetTime: "00:00 UTC", // A informação de reset é aproximada, já que o reset é on-demand
        method: "FLUX SCHNELL (100% Gratuito)",
        quality: "Ultra HD - $0.00 por imagem",
        costPerImage: "$0.00 (GRÁTIS!)",
        monthlyCost: "$0.00 (SEMPRE GRÁTIS!)",
    };
  },
});