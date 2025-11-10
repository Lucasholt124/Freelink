import { v } from "convex/values";
import { mutation, action, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { api } from "./_generated/api";

// =================================================================
// 🔒 TIPOS E INTERFACES
// =================================================================
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

type ActionType = 'chat' | 'images' | 'audio' | 'removeBg' | 'enhance';

// =================================================================
// 🔒 CONFIGURAÇÃO DE SEGURANÇA E LIMITES
// =================================================================
const LIMITS = {
  FREE_TIER: {
    chat: { daily: 50, messageLength: 1000 },
    images: { daily: 5, maxSizeMB: 2 },
    audio: { daily: 3, maxSizeMB: 10 },
    removeBg: { daily: 3, maxSizeMB: 2 }
  },
  RATE_LIMIT: {
    windowMs: 60000, // 1 minuto
    maxRequests: 10
  },
  COSTS: {
    maxDailyCost: 0.10, // Máximo $0.10 por dia
    maxMonthlyCost: 3.00 // Máximo $3 por mês
  }
};

// =================================================================
// 🔐 SISTEMA DE RATE LIMITING E CACHE
// =================================================================
const rateLimitCache = new Map<string, RateLimitEntry>();
const resultCache = new Map<string, CacheEntry<unknown>>();

// =================================================================
// 🛡️ FUNÇÕES DE SEGURANÇA
// =================================================================
const getSecureApiKey = (keyName: string): string => {
  const key = process.env[keyName];
  if (!key || key.length < 10) {
    console.log(`⚠️ ${keyName} não configurada`);
    return "";
  }
  // Log seguro - nunca mostra a key completa
  console.log(`✅ ${keyName} ativa: ${key.substring(0, 4)}****`);
  return key;
};

const checkRateLimit = async (userId: string, action: ActionType): Promise<boolean> => {
  const key = `${userId}:${action}`;
  const now = Date.now();
  const limit = rateLimitCache.get(key);

  if (limit) {
    if (now < limit.resetAt) {
      if (limit.count >= LIMITS.RATE_LIMIT.maxRequests) {
        throw new Error("🚫 Muitas requisições. Aguarde 1 minuto.");
      }
      limit.count++;
    } else {
      rateLimitCache.set(key, { count: 1, resetAt: now + LIMITS.RATE_LIMIT.windowMs });
    }
  } else {
    rateLimitCache.set(key, { count: 1, resetAt: now + LIMITS.RATE_LIMIT.windowMs });
  }
  return true;
};

const checkCache = <T>(key: string): T | null => {
  const cached = resultCache.get(key) as CacheEntry<T> | undefined;
  if (cached && Date.now() < cached.expiresAt) {
    console.log("📦 Retornando resultado do cache");
    return cached.data;
  }
  return null;
};

const setCache = <T>(key: string, data: T, ttlMinutes: number = 60): void => {
  resultCache.set(key, {
    data,
    expiresAt: Date.now() + (ttlMinutes * 60 * 1000)
  });

  // Limpa cache antigo (mantém máximo 100 itens)
  if (resultCache.size > 100) {
    const firstKey = resultCache.keys().next().value;
    if (firstKey) resultCache.delete(firstKey);
  }
};

const base64ToBlob = (base64: string): Blob => {
  try {
    const match = base64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)/);
    if (!match) throw new Error('Invalid base64');

    const contentType = match[1];
    const base64Data = match[2];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  } catch  {
    throw new Error("Formato de arquivo inválido");
  }
};

const validateImageSize = (base64: string): { valid: boolean; sizeMB: number } => {
  const base64Length = base64.length - base64.indexOf(',') - 1;
  const sizeBytes = base64Length * 0.75;
  const sizeMB = sizeBytes / (1024 * 1024);

  return {
    valid: sizeMB <= LIMITS.FREE_TIER.images.maxSizeMB,
    sizeMB: Number(sizeMB.toFixed(2))
  };
};

// Helper para atualizar contadores de forma type-safe
const updateUsageCount = (
  existingUsage: Doc<"dailyUsage">,
  action: ActionType,
  countValue: number = 1
) => {
  const updates: Record<string, number> = {};

  switch(action) {
    case 'chat':
      updates.chatCount = (existingUsage.chatCount || 0) + countValue;
      break;
    case 'images':
      updates.imagesCount = (existingUsage.imagesCount || 0) + countValue;
      break;
    case 'audio':
      updates.audioCount = (existingUsage.audioCount || 0) + countValue;
      break;
    case 'removeBg':
      updates.removeBgCount = (existingUsage.removeBgCount || 0) + countValue;
      break;
  }

  return updates;
};

// =================================================================
// 💰 TRACKING DE CUSTOS E USAGE
// =================================================================
export const trackUsage = mutation({
  args: {
    userId: v.string(),
    action: v.union(v.literal("chat"), v.literal("images"), v.literal("audio"), v.literal("removeBg"), v.literal("enhance")),
    cost: v.number(),
    credits: v.number(),
    metadata: v.optional(
      v.object({
        model: v.optional(v.string()),
        processingTime: v.optional(v.string()),
        attempts: v.optional(v.string()),
      })
    )
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0];

    // Busca ou cria registro de uso diário
    const existingUsage = await ctx.db
      .query("dailyUsage")
      .withIndex("by_user_date", q =>
        q.eq("userId", args.userId).eq("date", today)
      )
      .first();

    if (existingUsage) {
      const countUpdates = updateUsageCount(existingUsage, args.action, 1);

      await ctx.db.patch(existingUsage._id, {
        totalCost: existingUsage.totalCost + args.cost,
        totalCredits: existingUsage.totalCredits + args.credits,
        ...countUpdates
      });
    } else {
      const newUsage: Partial<Doc<"dailyUsage">> = {
        userId: args.userId,
        date: today,
        totalCost: args.cost,
        totalCredits: args.credits,
        createdAt: Date.now(),
      };

      // Adiciona o contador específico
      switch(args.action) {
        case 'chat':
          newUsage.chatCount = 1;
          break;
        case 'images':
          newUsage.imagesCount = 1;
          break;
        case 'audio':
          newUsage.audioCount = 1;
          break;
        case 'removeBg':
          newUsage.removeBgCount = 1;
          break;
      }

      await ctx.db.insert("dailyUsage", newUsage as Doc<"dailyUsage">);
    }

    return { success: true };
  }
});

export const checkDailyLimits = query({
  args: {
    userId: v.string(),
    action: v.union(v.literal("chat"), v.literal("images"), v.literal("audio"), v.literal("removeBg"), v.literal("enhance"))
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0];

    const usage = await ctx.db
      .query("dailyUsage")
      .withIndex("by_user_date", q =>
        q.eq("userId", args.userId).eq("date", today)
      )
      .first();

    if (!usage) {
      const actionKey = args.action as keyof typeof LIMITS.FREE_TIER;
      const limitConfig = LIMITS.FREE_TIER[actionKey];

      return {
        allowed: true,
        remaining: limitConfig?.daily || 10
      };
    }

    let actionCount = 0;
    switch(args.action) {
      case 'chat':
        actionCount = usage.chatCount || 0;
        break;
      case 'images':
        actionCount = usage.imagesCount || 0;
        break;
      case 'audio':
        actionCount = usage.audioCount || 0;
        break;
      case 'removeBg':
        actionCount = usage.removeBgCount || 0;
        break;
    }

    const actionKey = args.action as keyof typeof LIMITS.FREE_TIER;
    const limit = LIMITS.FREE_TIER[actionKey]?.daily || 10;

    // Verifica limite de custo diário
    if (usage.totalCost >= LIMITS.COSTS.maxDailyCost) {
      return {
        allowed: false,
        remaining: 0,
        reason: "Limite de custo diário atingido. Volte amanhã!"
      };
    }

    return {
      allowed: actionCount < limit,
      remaining: Math.max(0, limit - actionCount),
      used: actionCount,
      limit: limit
    };
  }
});

// =================================================================
// 1. 💬 CHAT COM IA - OTIMIZADO E ECONÔMICO
// =================================================================
export const chatWithAI = action({
  args: {
    userId: v.string(),
    message: v.string(),
    conversationHistory: v.optional(v.array(v.object({ role: v.union(v.literal("user"), v.literal("assistant")), content: v.string() })))
  },
  handler: async (ctx, args): Promise<{ success: boolean; response?: string; message?: string }> => {
    try {
      // Validações
      await checkRateLimit(args.userId, 'chat');

      // Verifica limites diários
      const limits = await ctx.runQuery(api.aiStudio.checkDailyLimits, {
        userId: args.userId,
        action: 'chat'
      });

      if (!limits.allowed) {
        return {
          success: false,
          message: limits.reason || `🚫 Limite diário atingido (${limits.limit}/dia). Volte amanhã!`
        };
      }

      // Limita tamanho da mensagem
      if (args.message.length > LIMITS.FREE_TIER.chat.messageLength) {
        return {
          success: false,
          message: `📝 Mensagem muito longa! Máximo ${LIMITS.FREE_TIER.chat.messageLength} caracteres.`
        };
      }

      // Verifica cache
      const cacheKey = `chat:${args.userId}:${args.message.substring(0, 50)}`;
      const cached = checkCache<string>(cacheKey);
      if (cached) {
        return { success: true, response: cached };
      }

      const GROQ_KEY = getSecureApiKey("GROQ_API_KEY");

      if (GROQ_KEY) {
        // Modelos econômicos em ordem de preferência
        const models = [
          "llama-3.2-1b-preview",      // Mais econômico
          "gemma-7b-it",                // Barato e bom
          "llama-3.2-3b-preview",       // Alternativa
        ];

        for (const model of models) {
          try {
            const messages: ConversationMessage[] = [
              {
                role: "system",
                content: "Você é um assistente útil. Responda de forma clara e concisa em português brasileiro."
              },
              // Limita histórico para economizar tokens
              ...(args.conversationHistory || []).slice(-4),
              {
                role: "user",
                content: args.message
              }
            ];

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${GROQ_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: 0.7,
                max_tokens: 500, // Limita resposta para economizar
                top_p: 0.9,
                stream: false
              }),
            });

            if (response.ok) {
              const data = await response.json();
              const aiResponse = data.choices[0]?.message?.content;

              if (aiResponse) {
                // Salva no cache
                setCache(cacheKey, aiResponse, 30);

                // Tracking de uso (custo zero com Groq)
                await ctx.runMutation(api.aiStudio.trackUsage, {
                  userId: args.userId,
                  action: 'chat',
                  cost: 0,
                  credits: 1
                });

                await ctx.runMutation(api.aiStudio.saveChatMessage, {
                  userId: args.userId,
                  message: args.message,
                  response: aiResponse,
                });

                return {
                  success: true,
                  response: aiResponse,
                  message: `✅ Restam ${limits.remaining - 1} mensagens hoje`
                };
              }
            }
          } catch (error) {
            console.error(`Erro com modelo ${model}:`, error);
            continue;
          }
        }
      }

      // Fallback com respostas inteligentes locais
      const fallbackResponse = generateLocalResponse(args.message);

      await ctx.runMutation(api.aiStudio.saveChatMessage, {
        userId: args.userId,
        message: args.message,
        response: fallbackResponse,
      });

      return {
        success: true,
        response: fallbackResponse
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao processar mensagem";
      console.error("Erro no chat:", errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  },
});

// Sistema local de respostas (sem custo)
function generateLocalResponse(message: string): string {
  const msg = message.toLowerCase().trim();

  const responses = {
    greeting: [
      "Olá! Como posso ajudar você hoje? 😊",
      "Oi! Estou aqui para ajudar! O que você precisa?",
      "Bem-vindo! Em que posso ser útil?"
    ],
    help: [
      "Posso ajudar com:\n• Responder perguntas\n• Criar conteúdo\n• Dar sugestões\n• Resolver problemas\n\nO que você gostaria?",
      "Estou aqui para:\n✅ Conversar\n✅ Explicar conceitos\n✅ Ajudar com ideias\n✅ Auxiliar em tarefas\n\nComo posso ajudar?"
    ],
    default: "Entendi sua pergunta. Para respostas mais completas, configure a GROQ_API_KEY (gratuita) em console.groq.com"
  };

  if (msg.match(/^(oi|olá|ola|hey|hi|hello)/)) {
    return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
  }

  if (msg.includes('ajuda') || msg.includes('help')) {
    return responses.help[Math.floor(Math.random() * responses.help.length)];
  }

  return responses.default;
}

// =================================================================
// 2. 🎨 APRIMORAR IMAGEM - ULTRA ECONÔMICO
// =================================================================
export const enhanceImage = action({
  args: {
    userId: v.string(),
    imageFile: v.string(),
    effect: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; message?: string }> => {
    try {
      // Validações
      await checkRateLimit(args.userId, 'enhance');

      // Verifica limites
      const limits = await ctx.runQuery(api.aiStudio.checkDailyLimits, {
        userId: args.userId,
        action: 'images'
      });

      if (!limits.allowed) {
        return {
          success: false,
          message: `🚫 Limite diário: ${limits.limit} imagens/dia. Você já usou ${limits.used}.`
        };
      }

      // Valida tamanho
      const sizeCheck = validateImageSize(args.imageFile);
      if (!sizeCheck.valid) {
        return {
          success: false,
          message: `📏 Imagem muito grande! (${sizeCheck.sizeMB}MB). Máximo: ${LIMITS.FREE_TIER.images.maxSizeMB}MB`
        };
      }

      const REPLICATE_KEY = getSecureApiKey("REPLICATE_API_TOKEN");

      if (REPLICATE_KEY) {
        const model = {
          name: "Real-ESRGAN (Econômico)",
          version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
          estimatedCost: 0.0005
        };

        try {
          console.log(`🎨 Processando com ${model.name}...`);

          let processedImage = args.imageFile;
          if (sizeCheck.sizeMB > 1) {
            processedImage = processedImage.replace('data:image/png', 'data:image/jpeg');
          }

          const startTime = Date.now();

          // Inicia o processamento
          const response = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${REPLICATE_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              version: model.version,
              input: {
                image: processedImage,
                scale: 2,
                face_enhance: false
              }
            }),
          });

          if (!response.ok) {
            const error = await response.text();
            console.error("Erro Replicate:", error);
            throw new Error("Falha ao iniciar processamento");
          }

          const prediction = await response.json();

          // ⚠️ PROTEÇÃO CRÍTICA CONTRA LOOP INFINITO
          const MAX_WAIT_TIME = 45000; // 45 segundos MÁXIMO
          const MAX_ATTEMPTS = 30; // 30 tentativas MÁXIMO
          const POLL_INTERVAL = 1500; // 1.5 segundos entre checks

          let attempts = 0;
          const processingStartTime = Date.now();

          while (attempts < MAX_ATTEMPTS) {
            // ✅ PROTEÇÃO 1: Timeout absoluto de tempo
            const elapsedTime = Date.now() - processingStartTime;
            if (elapsedTime > MAX_WAIT_TIME) {
              console.error(`⏱️ TIMEOUT: Processamento excedeu ${MAX_WAIT_TIME/1000}s`);

              // Tenta cancelar a predição no Replicate
              try {
                await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}/cancel`, {
                  method: "POST",
                  headers: { "Authorization": `Bearer ${REPLICATE_KEY}` }
                });
              } catch (e) {
                console.error("Erro ao cancelar:", e);
              }

              throw new Error("Processamento muito lento. Tente uma imagem menor.");
            }

            // ✅ PROTEÇÃO 2: Delay progressivo (economiza requests)
            const delay = Math.min(POLL_INTERVAL * (1 + attempts * 0.1), 3000);
            await new Promise(resolve => setTimeout(resolve, delay));

            attempts++;
            console.log(`🔄 Tentativa ${attempts}/${MAX_ATTEMPTS} (${elapsedTime/1000}s decorridos)`);

            // ✅ PROTEÇÃO 3: Timeout no fetch do status
            const statusRes = await Promise.race([
              fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
                headers: { "Authorization": `Bearer ${REPLICATE_KEY}` }
              }),
              new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Status check timeout')), 10000)
              )
            ]);

            if (statusRes.ok) {
              const result = await statusRes.json();

              // ✅ Sucesso - processa resultado
              if (result.status === "succeeded" && result.output) {
                const processTime = ((Date.now() - startTime) / 1000).toFixed(1);
                console.log(`✅ Processado em ${processTime}s após ${attempts} tentativas`);

                const outputUrl = Array.isArray(result.output) ? result.output[0] : result.output;

                // ✅ PROTEÇÃO 4: Timeout no download da imagem
                const imageRes = await Promise.race([
                  fetch(outputUrl),
                  new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Download timeout')), 15000)
                  )
                ]);

                const imageBlob = await imageRes.blob();

                // ✅ PROTEÇÃO 5: Verifica tamanho do resultado
                const resultSizeMB = imageBlob.size / (1024 * 1024);
                if (resultSizeMB > 10) {
                  throw new Error(`Resultado muito grande: ${resultSizeMB.toFixed(1)}MB`);
                }

                const storageId = await ctx.storage.store(imageBlob);
                const finalUrl = await ctx.storage.getUrl(storageId);

                if (finalUrl) {
                  // Tracking de custo
                  const processTime = ((Date.now() - startTime) / 1000).toFixed(1);
                  await ctx.runMutation(api.aiStudio.trackUsage, {
                    userId: args.userId,
                    action: 'images',
                    cost: model.estimatedCost,
                    credits: 1,
                    metadata: {
                      model: model.name,
                      processingTime: processTime,
                      attempts: attempts.toString()
                    }
                  });

                  await ctx.runMutation(api.aiStudio.saveEnhancedImage, {
                    userId: args.userId,
                    originalUrl: args.imageFile.substring(0, 100),
                    resultUrl: finalUrl,
                    prompt: `${model.name} - 2x upscale`,
                    storageId: storageId
                  });

                  return {
                    success: true,
                    url: finalUrl,
                    message: `✨ Aprimorado em ${processTime}s! (${limits.remaining - 1} restantes)`
                  };
                }
              }
              // ✅ Falha definitiva
              else if (result.status === "failed") {
                console.error("❌ Processamento falhou:", result.error);
                throw new Error(result.error || "Processamento falhou na API");
              }
              // ✅ Cancelado
              else if (result.status === "canceled") {
                throw new Error("Processamento foi cancelado");
              }
              // Continua aguardando (processing/starting)
            } else {
              console.warn(`⚠️ Erro ao checar status: ${statusRes.status}`);
            }
          }

          // ✅ PROTEÇÃO 6: Se sair do loop, atingiu max attempts
          console.error(`❌ Máximo de ${MAX_ATTEMPTS} tentativas atingido`);

          // Tenta cancelar
          try {
            await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}/cancel`, {
              method: "POST",
              headers: { "Authorization": `Bearer ${REPLICATE_KEY}` }
            });
          } catch (e) {
            console.error("Erro ao cancelar após timeout:", e);
          }

          throw new Error("Processamento muito lento. Tente novamente.");

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Erro no processamento";
          console.error("💥 Erro no processamento:", errorMessage);

          // Retorna erro mas não quebra
          return {
            success: false,
            message: `Erro: ${errorMessage}. Tente uma imagem menor.`
          };
        }
      }

      // Fallback: Retorna imagem original otimizada
      console.log("⚠️ REPLICATE_API_TOKEN não configurada, salvando original");
      const blob = base64ToBlob(args.imageFile);
      const storageId = await ctx.storage.store(blob);
      const finalUrl = await ctx.storage.getUrl(storageId);

      if (finalUrl) {
        await ctx.runMutation(api.aiStudio.trackUsage, {
          userId: args.userId,
          action: 'images',
          cost: 0,
          credits: 0
        });

        return {
          success: true,
          url: finalUrl,
          message: "✅ Imagem salva (configure REPLICATE_API_TOKEN para aprimoramento)"
        };
      }

      throw new Error("Falha ao processar imagem");

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao processar imagem";
      console.error("💥 Erro geral:", errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  },
});

// =================================================================
// 3. 🎤 ÁUDIO PARA TEXTO - GRATUITO COM GROQ
// =================================================================
export const speechToText = action({
  args: {
    userId: v.string(),
    audioUrl: v.string()
  },
  handler: async (ctx, args): Promise<{ success: boolean; text?: string; message?: string }> => {
    try {
      // Validações
      await checkRateLimit(args.userId, 'audio');

      const limits = await ctx.runQuery(api.aiStudio.checkDailyLimits, {
        userId: args.userId,
        action: 'audio'
      });

      if (!limits.allowed) {
        return {
          success: false,
          message: `🚫 Limite: ${limits.limit} áudios/dia. Usado: ${limits.used}`
        };
      }

      const GROQ_KEY = getSecureApiKey("GROQ_API_KEY");

      if (GROQ_KEY) {
        try {
          const audioBlob = base64ToBlob(args.audioUrl);

          // Verifica tamanho do áudio
          const sizeMB = audioBlob.size / (1024 * 1024);
          if (sizeMB > LIMITS.FREE_TIER.audio.maxSizeMB) {
            return {
              success: false,
              message: `🎵 Áudio muito grande! Máximo: ${LIMITS.FREE_TIER.audio.maxSizeMB}MB`
            };
          }

          const formData = new FormData();
          formData.append('file', audioBlob, 'audio.mp3');
          formData.append('model', 'whisper-large-v3-turbo'); // Modelo rápido
          formData.append('language', 'pt');
          formData.append('response_format', 'json');

          const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${GROQ_KEY}`,
            },
            body: formData
          });

          if (response.ok) {
            const result = await response.json();

            if (result.text) {
              // Tracking (Groq é gratuito)
              await ctx.runMutation(api.aiStudio.trackUsage, {
                userId: args.userId,
                action: 'audio',
                cost: 0,
                credits: 1
              });

              await ctx.runMutation(api.aiStudio.saveTranscription, {
                userId: args.userId,
                audioUrl: args.audioUrl.substring(0, 100),
                transcription: result.text
              });

              return {
                success: true,
                text: result.text,
                message: `✅ Transcrito! (${limits.remaining - 1} restantes hoje)`
              };
            }
          } else {
            const error = await response.text();
            console.error("Erro Whisper:", error);
          }
        } catch (error) {
          console.error("Erro ao transcrever:", error);
        }
      }

      // Fallback
      return {
        success: true,
        text: "🎤 Configure GROQ_API_KEY (gratuita) para transcrição automática.\n\nAcesse: console.groq.com",
        message: "API key necessária"
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao processar áudio";
      return {
        success: false,
        message: errorMessage
      };
    }
  },
});

// =================================================================
// 4. 📸 REMOVER FUNDO - ULTRA ECONÔMICO
// =================================================================
export const removeBackground = action({
  args: {
    userId: v.string(),
    imageUrl: v.string()
  },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; message?: string }> => {
    try {
      await checkRateLimit(args.userId, 'removeBg');

      const limits = await ctx.runQuery(api.aiStudio.checkDailyLimits, {
        userId: args.userId,
        action: 'removeBg'
      });

      if (!limits.allowed) {
        return {
          success: false,
          message: `🚫 Limite: ${limits.limit} remoções/dia. Usado: ${limits.used}`
        };
      }

      const sizeCheck = validateImageSize(args.imageUrl);
      if (!sizeCheck.valid) {
        return {
          success: false,
          message: `📏 Imagem muito grande! Máximo: ${LIMITS.FREE_TIER.removeBg.maxSizeMB}MB`
        };
      }

      const REPLICATE_KEY = getSecureApiKey("REPLICATE_API_TOKEN");

      if (REPLICATE_KEY) {
        const model = {
          name: "RMBG-1.4",
          version: "fb8af171cfa1616ddcf1242c851c6fda9b8ce3d7e1a200e99c406a0e49a8ec5",
          estimatedCost: 0.0003
        };

        try {
          const startTime = Date.now();

          const response = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${REPLICATE_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              version: model.version,
              input: { image: args.imageUrl }
            }),
          });

          if (!response.ok) {
            throw new Error("Falha ao processar");
          }

          const prediction = await response.json();

          // ✅ MESMAS PROTEÇÕES
          const MAX_WAIT_TIME = 45000;
          const MAX_ATTEMPTS = 30;
          let attempts = 0;
          const processingStartTime = Date.now();

          while (attempts < MAX_ATTEMPTS) {
            const elapsedTime = Date.now() - processingStartTime;

            if (elapsedTime > MAX_WAIT_TIME) {
              console.error(`⏱️ TIMEOUT: Remoção de fundo excedeu ${MAX_WAIT_TIME/1000}s`);
              try {
                await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}/cancel`, {
                  method: "POST",
                  headers: { "Authorization": `Bearer ${REPLICATE_KEY}` }
                });
              } catch (e) {
                console.error("Erro ao cancelar:", e);
              }
              throw new Error("Processamento muito lento. Tente novamente.");
            }

            const delay = Math.min(1500 * (1 + attempts * 0.1), 3000);
            await new Promise(resolve => setTimeout(resolve, delay));
            attempts++;

            const statusRes = await Promise.race([
              fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
                headers: { "Authorization": `Bearer ${REPLICATE_KEY}` }
              }),
              new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Status timeout')), 10000)
              )
            ]);

            if (statusRes.ok) {
              const result = await statusRes.json();

              if (result.status === "succeeded" && result.output) {
                const outputUrl = Array.isArray(result.output) ? result.output[0] : result.output;

                const imageRes = await Promise.race([
                  fetch(outputUrl),
                  new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Download timeout')), 15000)
                  )
                ]);

                const imageBlob = await imageRes.blob();
                const storageId = await ctx.storage.store(imageBlob);
                const finalUrl = await ctx.storage.getUrl(storageId);

                if (finalUrl) {
                  const processTime = ((Date.now() - startTime) / 1000).toFixed(1);
                  await ctx.runMutation(api.aiStudio.trackUsage, {
                    userId: args.userId,
                    action: 'removeBg',
                    cost: model.estimatedCost,
                    credits: 1,
                    metadata: { processingTime: processTime }
                  });
                  return {
                    success: true,
                    url: finalUrl,
                    message: `✨ Fundo removido! (${limits.remaining - 1} restantes)`
                  };
                }
              } else if (result.status === "failed") {
                throw new Error(result.error || "Processamento falhou");
              } else if (result.status === "canceled") {
                throw new Error("Processamento cancelado");
              }
            }
          }

          // Timeout por attempts
          try {
            await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}/cancel`, {
              method: "POST",
              headers: { "Authorization": `Bearer ${REPLICATE_KEY}` }
            });
          } catch (e) {
            console.error("Erro ao cancelar:", e);
          }

          throw new Error("Timeout: muitas tentativas");

        } catch (error) {
          console.error("Erro:", error);
          return {
            success: false,
            message: error instanceof Error ? error.message : "Erro ao processar"
          };
        }
      }

      // Fallback
      const blob = base64ToBlob(args.imageUrl);
      const storageId = await ctx.storage.store(blob);
      const finalUrl = await ctx.storage.getUrl(storageId);

      if (finalUrl) {
        return {
          success: true,
          url: finalUrl,
          message: "✅ Configure REPLICATE_API_TOKEN para remoção automática"
        };
      }

      throw new Error("Falha ao processar");

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao processar";
      return {
        success: false,
        message: errorMessage
      };
    }
  },
});

// =================================================================
// 💾 MUTATIONS SEGURAS
// =================================================================
export const saveEnhancedImage = mutation({
  args: {
    userId: v.string(),
    originalUrl: v.string(),
    resultUrl: v.string(),
    prompt: v.string(),
    storageId: v.optional(v.id("_storage"))
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiStudioContent", {
      ...args,
      type: "enhanced_image",
      createdAt: Date.now()
    });
  },
});

export const saveTranscription = mutation({
  args: {
    userId: v.string(),
    audioUrl: v.string(),
    transcription: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiStudioContent", {
      originalUrl: args.audioUrl,
      text: args.transcription,
      userId: args.userId,
      type: "transcription",
      createdAt: Date.now()
    });
  },
});

export const saveChatMessage = mutation({
  args: {
    userId: v.string(),
    message: v.string(),
    response: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiStudioContent", {
      userId: args.userId,
      text: args.message,
      resultUrl: args.response,
      type: "chat",
      createdAt: Date.now()
    });
  },
});

// =================================================================
// 📊 QUERIES PARA DASHBOARD
// =================================================================
export const getUserStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    // Uso de hoje
    const todayUsage = await ctx.db
      .query("dailyUsage")
      .withIndex("by_user_date", q =>
        q.eq("userId", args.userId).eq("date", today)
      )
      .first();

    // Uso do mês
    const monthUsage = await ctx.db
      .query("dailyUsage")
      .withIndex("by_user_date", q =>
        q.eq("userId", args.userId).gte("date", startOfMonth)
      )
      .collect();

    const totalMonthCost = monthUsage.reduce((acc, day) => acc + (day.totalCost || 0), 0);
    const totalMonthCredits = monthUsage.reduce((acc, day) => acc + (day.totalCredits || 0), 0);
    const totalMonthImages = monthUsage.reduce((acc, day) => acc + (day.imagesCount || 0), 0);
    const totalMonthChat = monthUsage.reduce((acc, day) => acc + (day.chatCount || 0), 0);

    return {
      today: {
        cost: todayUsage?.totalCost || 0,
        credits: todayUsage?.totalCredits || 0,
        chat: todayUsage?.chatCount || 0,
        images: todayUsage?.imagesCount || 0,
        audio: todayUsage?.audioCount || 0,
        removeBg: todayUsage?.removeBgCount || 0
      },
      month: {
        cost: totalMonthCost,
        credits: totalMonthCredits,
        daysActive: monthUsage.length,
        images: totalMonthImages,
        chat: totalMonthChat,
      },
      limits: LIMITS.FREE_TIER,
      costLimits: LIMITS.COSTS
    };
  }
});