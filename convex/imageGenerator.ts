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

interface PromptAnalysis {
  hasText: boolean;
  textContent: string;
  language: 'pt' | 'en' | 'other';
  isLogo: boolean;
  isUI: boolean;
  isProduct: boolean;
  isPhoto: boolean;
  style: string;
  needsTextClarity: boolean;
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
// 🧠 ANALISADOR DE PROMPT INTELIGENTE
// =================================================================
function analyzePrompt(prompt: string): PromptAnalysis {
  // Detecta se há requisição de texto/palavras específicas
  const textPatterns = [
    /com (?:o )?(?:texto|palavra|nome|título|escrito)/i,
    /with (?:the )?(?:text|word|name|title|written)/i,
    /"([^"]+)"/g, // Texto entre aspas
    /'([^']+)'/g, // Texto entre aspas simples
    /\b(?:logo|logotipo|logotype)\s+(?:com|with|de|of)\s+(\w+)/i,
    /\b(?:escreva|write|display|show)\s+(?:o texto|the text)?\s*"?([^",]+)"?/i
  ];

  let hasText = false;
  let textContent = '';

  for (const pattern of textPatterns) {
    const match = prompt.match(pattern);
    if (match) {
      hasText = true;
      textContent = match[1] || match[0];
      break;
    }
  }

  // Detecta idioma
  const portugueseWords = /\b(com|para|de|que|em|um|uma|seu|sua|este|esta|mais|muito|bem|bom|boa)\b/i;
  const englishWords = /\b(with|for|of|that|in|a|an|your|this|more|very|well|good)\b/i;

  const ptMatches = (prompt.match(portugueseWords) || []).length;
  const enMatches = (prompt.match(englishWords) || []).length;

  let language: 'pt' | 'en' | 'other' = 'en';
  if (ptMatches > enMatches) language = 'pt';
  else if (enMatches > 0) language = 'en';
  else language = 'other';

  // Detecta tipo de imagem
  const isLogo = /\b(logo|logotipo|logotype|brand|marca|símbolo|symbol)\b/i.test(prompt);
  const isUI = /\b(interface|ui|ux|dashboard|website|app|software|screen|tela)\b/i.test(prompt);
  const isProduct = /\b(product|produto|mockup|package|embalagem|packaging)\b/i.test(prompt);
  const isPhoto = /\b(photo|foto|portrait|retrato|photography|fotografia)\b/i.test(prompt);

  // Detecta estilo
  let style = 'realistic';
  if (/\b(minimal|minimalist|simple|clean|simples|limpo)\b/i.test(prompt)) style = 'minimal';
  if (/\b(3d|render|three.dimensional)\b/i.test(prompt)) style = '3d';
  if (/\b(cartoon|anime|illustration|ilustração)\b/i.test(prompt)) style = 'illustration';
  if (/\b(abstract|abstrato|artistic|artístico)\b/i.test(prompt)) style = 'artistic';

  const needsTextClarity = hasText || isLogo || isUI;

  return {
    hasText,
    textContent,
    language,
    isLogo,
    isUI,
    isProduct,
    isPhoto,
    style,
    needsTextClarity
  };
}

// =================================================================
// 🎯 OTIMIZADOR DE PROMPT AVANÇADO
// =================================================================
function optimizePromptAdvanced(original: string): {
  optimized: string;
  method: 'pollinations' | 'huggingface';
  params: Record<string, unknown>;
} {
  const analysis = analyzePrompt(original);

  // Remove caracteres problemáticos mas preserva texto importante
  let cleaned = original;

  // Se tem texto específico, preserva ele
  if (analysis.textContent) {
    // Marca o texto para preservação
    cleaned = original.replace(analysis.textContent, `[TEXT:${analysis.textContent}]`);
  }

  // Limpa caracteres especiais exceto os marcadores
  cleaned = cleaned.replace(/[^\w\s,.\-\[\]:'"]/gi, ' ').trim();

  // Restaura o texto marcado
  if (analysis.textContent) {
    cleaned = cleaned.replace(`[TEXT:${analysis.textContent}]`, `"${analysis.textContent}"`);
  }

  // Constrói o prompt otimizado baseado na análise
  let optimized = cleaned;
  let method: 'pollinations' | 'huggingface' = 'pollinations';
  const params: Record<string, unknown> = {};

  // CASO 1: LOGOS E TEXTOS - Usa HuggingFace (melhor com texto)
  if (analysis.isLogo || analysis.hasText) {
    method = 'huggingface';

    if (analysis.isLogo) {
      // Para logos, foca em clareza e simplicidade
      optimized = `${cleaned}, minimalist logo design, vector graphics, clean typography, professional branding, centered composition, high contrast, readable text, clear lettering`;
      params.num_inference_steps = 50; // Mais steps para melhor qualidade
      params.guidance_scale = 7.5; // Mais guidance para seguir o prompt
    } else if (analysis.hasText) {
      // Para texto geral, garante legibilidade
      optimized = `${cleaned}, clear readable text, typography focus, high quality lettering, sharp details, professional design`;
      params.num_inference_steps = 50;
      params.guidance_scale = 7.5;
    }

    // Adiciona instruções específicas para o idioma do texto
    if (analysis.language === 'pt' && analysis.textContent) {
      optimized += `, text in Portuguese language: "${analysis.textContent}", Brazilian Portuguese text`;
    } else if (analysis.textContent) {
      optimized += `, exact text: "${analysis.textContent}", clear typography`;
    }
  }

  // CASO 2: UI/UX - Usa HuggingFace
  else if (analysis.isUI) {
    method = 'huggingface';
    optimized = `${cleaned}, modern UI design, clean interface, professional dashboard, user-friendly layout, high fidelity mockup`;
    params.num_inference_steps = 40;
    params.guidance_scale = 6;
  }

  // CASO 3: PRODUTOS - Usa Pollinations (melhor para realismo)
  else if (analysis.isProduct) {
    method = 'pollinations';
    optimized = `${cleaned}, professional product photography, studio lighting, commercial quality, detailed textures, isolated on white background`;
    params.width = 1024;
    params.height = 1024;
    params.model = 'flux';
    params.enhance = true;
  }

  // CASO 4: FOTOGRAFIA - Usa Pollinations
  else if (analysis.isPhoto) {
    method = 'pollinations';
    optimized = `${cleaned}, professional photography, high resolution, detailed, photorealistic, cinematic lighting, sharp focus`;
    params.width = 1024;
    params.height = 1024;
    params.model = 'flux';
    params.enhance = true;
  }

  // CASO 5: ARTE GERAL - Escolhe baseado no estilo
  else {
    if (analysis.style === 'minimal' || analysis.style === 'illustration') {
      method = 'huggingface';
      optimized = `${cleaned}, ${analysis.style} style, artistic, creative, high quality`;
      params.num_inference_steps = 30;
      params.guidance_scale = 5;
    } else {
      method = 'pollinations';
      optimized = `${cleaned}, masterpiece, ultra detailed, professional quality, trending on artstation`;
      params.width = 1024;
      params.height = 1024;
      params.model = 'flux';
    }
  }

  // Adiciona negative prompts para evitar erros comuns
  if (method === 'huggingface') {
    params.negative_prompt = "blurry text, misspelled words, wrong letters, distorted text, unreadable, low quality, pixelated";
  }

  // Limita tamanho do prompt
  if (optimized.length > 400) {
    // Preserva texto importante no início
    const important = analysis.textContent ? `"${analysis.textContent}", ` : '';
    optimized = important + optimized.substring(important.length, 400);
  }

  console.log(`🧠 Análise: Tipo=${analysis.isLogo ? 'Logo' : analysis.isUI ? 'UI' : analysis.isProduct ? 'Produto' : 'Arte'}, Idioma=${analysis.language}, Texto="${analysis.textContent}", Método=${method}`);

  return { optimized, method, params };
}

// =================================================================
// 🎨 API 1: HUGGING FACE (MELHOR PARA TEXTO E LOGOS)
// =================================================================
async function tryHuggingFaceAdvanced(prompt: string, params: Record<string, unknown>): Promise<Blob | null> {
  const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

  if (!HF_TOKEN) {
    console.log("⚠️ HF Token não configurado");
    return null;
  }

  // Lista de modelos para tentar (em ordem de preferência para texto)
  const models = [
    "stabilityai/stable-diffusion-xl-base-1.0", // Melhor para texto
    "runwayml/stable-diffusion-v1-5", // Backup
    "black-forest-labs/FLUX.1-schnell" // Último recurso
  ];

  for (const model of models) {
    try {
      console.log(`🤗 Tentando ${model}...`);

      const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              num_inference_steps: params.num_inference_steps || 50,
              guidance_scale: params.guidance_scale || 7.5,
              negative_prompt: params.negative_prompt || "",
              width: 1024,
              height: 1024,
            }
          }),
          signal: AbortSignal.timeout(60000)
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        if (blob.size > 10000) {
          console.log(`✅ HuggingFace ${model} OK! ${(blob.size / 1024).toFixed(2)}KB`);
          return blob;
        }
      } else {
        const error = await response.json().catch(() => ({}));

        // Se modelo está carregando, espera
        if (error.estimated_time) {
          const waitTime = Math.min(error.estimated_time + 3, 30);
          console.log(`⏳ Aguardando ${waitTime}s para ${model}...`);
          await new Promise(resolve => setTimeout(resolve, waitTime * 1000));

          // Tenta novamente
          const retryResponse = await fetch(
            `https://api-inference.huggingface.co/models/${model}`,
            {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                inputs: prompt,
                parameters: {
                  num_inference_steps: params.num_inference_steps || 50,
                  guidance_scale: params.guidance_scale || 7.5,
                  negative_prompt: params.negative_prompt || "",
                  width: 1024,
                  height: 1024,
                }
              })
            }
          );

          if (retryResponse.ok) {
            const retryBlob = await retryResponse.blob();
            if (retryBlob.size > 10000) {
              console.log(`✅ HuggingFace ${model} OK (retry)!`);
              return retryBlob;
            }
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ Erro com ${model}:`, error);
      continue;
    }
  }

  return null;
}

// =================================================================
// 🎨 API 2: POLLINATIONS (MELHOR PARA REALISMO)
// =================================================================
async function tryPollinationsAdvanced(prompt: string, params: Record<string, unknown>): Promise<Blob | null> {
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🌟 Pollinations - Tentativa ${attempt}/${maxRetries}`);

      // Constrói parâmetros otimizados
      const urlParams = new URLSearchParams({
        width: params.width?.toString() || '1024',
        height: params.height?.toString() || '1024',
        seed: Math.floor(Math.random() * 1000000).toString(),
        model: params.model?.toString() || 'flux',
        nologo: 'true',
        enhance: params.enhance?.toString() || 'true',
        safe: 'true'
      });

      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${urlParams}`;

      const response = await fetch(url, {
        signal: AbortSignal.timeout(45000) // Mais tempo para qualidade
      });

      if (response.ok) {
        const blob = await response.blob();

        if (blob.size > 10000) {
          console.log(`✅ Pollinations OK! ${(blob.size / 1024).toFixed(2)}KB`);
          return blob;
        }
      }

      console.warn(`⚠️ Pollinations tentativa ${attempt} falhou: HTTP ${response.status}`);

      // Aguarda antes de tentar novamente
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

    } catch (error) {
      console.warn(`⚠️ Pollinations erro na tentativa ${attempt}:`, error);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }

  return null;
}

// =================================================================
// 🎨 GERADOR PRINCIPAL INTELIGENTE
// =================================================================
async function generateImageWithAI(originalPrompt: string): Promise<Blob> {
  console.log("🎨 Iniciando geração inteligente...");
  console.log("📝 Prompt original:", originalPrompt);

  // Analisa e otimiza o prompt
  const { optimized, method, params } = optimizePromptAdvanced(originalPrompt);

  console.log(`🎯 Prompt otimizado: ${optimized.substring(0, 150)}...`);
  console.log(`🎯 Método escolhido: ${method}`);

  let blob: Blob | null = null;

  // Estratégia baseada no tipo de conteúdo
  if (method === 'huggingface') {
    // Para texto/logos, tenta primeiro HuggingFace
    console.log("📝 Prioridade: HuggingFace (melhor para texto/logos)");
    blob = await tryHuggingFaceAdvanced(optimized, params);

    // Se falhar, tenta Pollinations como backup
    if (!blob) {
      console.log("🔄 Fallback: Tentando Pollinations...");
      blob = await tryPollinationsAdvanced(optimized, { ...params, enhance: true });
    }
  } else {
    // Para imagens realistas, tenta primeiro Pollinations
    console.log("📸 Prioridade: Pollinations (melhor para realismo)");
    blob = await tryPollinationsAdvanced(optimized, params);

    // Se falhar, tenta HuggingFace como backup
    if (!blob) {
      console.log("🔄 Fallback: Tentando HuggingFace...");
      blob = await tryHuggingFaceAdvanced(optimized, {
        num_inference_steps: 30,
        guidance_scale: 5
      });
    }
  }

  // Última tentativa com prompt simplificado
  if (!blob) {
    console.log("🔄 Última tentativa com prompt simplificado...");
    const simplified = originalPrompt.substring(0, 100) + ", high quality, professional";
    blob = await tryPollinationsAdvanced(simplified, { width: 1024, height: 1024 });
  }

  if (!blob) {
    throw new Error("❌ Serviço temporariamente indisponível. Tente novamente em alguns segundos!");
  }

  return blob;
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

      // Gera a imagem com IA inteligente
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
        method: 'intelligent-multi-api',
        remainingToday: remaining - 1,
        message: `🎉 Imagem perfeita criada! ${remaining - 1} restantes hoje.`
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
      method: "intelligent-multi-api",
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
        method: "IA Inteligente Multi-API",
        quality: "Ultra HD 1024x1024 com Análise de Contexto",
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
      method: "IA Inteligente Multi-API",
      quality: "Ultra HD 1024x1024 com Análise de Contexto",
      costPerImage: "$0.00 (GRÁTIS!)",
      monthlyCost: "$0.00 (SEMPRE GRÁTIS!)",
    };
  },
});