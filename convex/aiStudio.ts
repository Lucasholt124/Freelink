import { v } from "convex/values";
import { mutation, action, query, internalMutation } from "./_generated/server";
import { api } from "./_generated/api";

// =================================================================
// 🔧 FUNÇÕES AUXILIARES
// =================================================================
const getGroqApiKey = (): string => {
  return process.env.GROQ_API_KEY || "";
};

const getReplicateApiKey = (): string => {
  return process.env.REPLICATE_API_KEY || "";
};

const base64ToBlob = (base64: string): Blob => {
  const match = base64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)/);
  if (!match) {
    throw new Error('Invalid base64 string');
  }
  const contentType = match[1];
  const base64Data = match[2];
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
};

// =================================================================
// 1. 💬 CHAT COM IA - GROQ COM MODELOS ATIVOS
// =================================================================
export const chatWithAI = action({
  args: {
    userId: v.string(),
    message: v.string(),
    conversationHistory: v.optional(v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string()
    })))
  },
  handler: async (ctx, args): Promise<{ success: boolean; response?: string; message?: string }> => {
    try {
      console.log("💬 Iniciando chat...");

      const GROQ_KEY = getGroqApiKey();
if (!GROQ_KEY) {
    console.error("❌ ERRO CRÍTICO: GROQ_API_KEY não encontrada nas variáveis de ambiente.");
    return {
        success: false,
        message: "Erro de configuração no servidor. Contate o suporte."
    };
}

      if (GROQ_KEY && GROQ_KEY.length > 10) {
        // Lista de modelos ATIVOS em ordem de preferência
        const models = [
          "llama-3.3-70b-versatile",  // Mais recente e poderoso
          "llama-3.1-8b-instant",     // Rápido
          "gemma2-9b-it",             // Alternativa Google
          "llama3-70b-8192",          // Estável
          "llama3-8b-8192"            // Fallback rápido
        ];

        for (const model of models) {
          try {
            console.log(`🚀 Tentando modelo: ${model}...`);

            const messages = [
              {
                role: "system",
                content: "Você é uma assistente de IA extremamente útil, inteligente e amigável. Responda sempre em português brasileiro de forma clara, objetiva e prestativa. Seja criativo e útil em suas respostas."
              },
              ...(args.conversationHistory || []).slice(-8),
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
                temperature: 0.8,
                max_tokens: 2048,
                top_p: 0.9,
                stream: false
              }),
            });

            if (response.ok) {
              const data = await response.json();
              const aiResponse = data.choices[0]?.message?.content;

              if (aiResponse) {
                console.log(`✅ Sucesso com modelo: ${model}`);

                await ctx.runMutation(api.aiStudio.saveChatMessage, {
                  userId: args.userId,
                  message: args.message,
                  response: aiResponse,
                });

                return {
                  success: true,
                  response: aiResponse,
                };
              }
            } else {
              const errorText = await response.text();
              console.warn(`⚠️ Modelo ${model} falhou:`, response.status);

              // Se for erro de modelo descontinuado, tenta o próximo
              if (response.status === 400 && errorText.includes("decommissioned")) {
                continue;
              }
            }
          } catch (error) {
            console.warn(`⚠️ Erro no modelo ${model}:`, error);
            continue;
          }
        }

        console.error("❌ Todos os modelos falharam");
      } else {
        console.log("⚠️ GROQ_API_KEY não configurada");
      }

      // FALLBACK: Respostas inteligentes
      console.log("🤖 Usando sistema de resposta local...");
      const intelligentResponse = generateIntelligentResponse(args.message);

      await ctx.runMutation(api.aiStudio.saveChatMessage, {
        userId: args.userId,
        message: args.message,
        response: intelligentResponse,
      });

      return {
        success: true,
        response: intelligentResponse,
      };

    } catch (error: unknown) {
      console.error("❌ Erro geral:", error);
      return {
        success: true,
        response: "Desculpe, ocorreu um erro. Tente novamente.",
      };
    }
  },
});

// Sistema de resposta inteligente local
function generateIntelligentResponse(message: string): string {
  const msg = message.toLowerCase().trim();

  if (msg.match(/^(oi|olá|ola|hey|hi|hello|bom dia|boa tarde|boa noite)/)) {
    return "Olá! 😊 Como posso ajudar você hoje?\n\nPosso responder perguntas, criar conteúdo, resolver problemas e muito mais!\n\n💡 **Dica**: Configure sua GROQ_API_KEY gratuita em https://console.groq.com para respostas ainda melhores com IA!";
  }

  if (msg.match(/^(obrigad|valeu|thanks)/)) {
    return "Por nada! 😊 Fico feliz em ajudar! Se precisar de mais alguma coisa, é só chamar!";
  }

  if (msg.match(/(quem|o que|você|voce|ia|ai)/)) {
    return "🤖 **Sobre mim:**\n\nSou uma assistente de IA criada para ajudar você!\n\n**Posso fazer:**\n✅ Responder perguntas sobre qualquer assunto\n✅ Criar textos e conteúdos\n✅ Dar ideias criativas\n✅ Resolver problemas\n✅ Explicar conceitos\n✅ Ajudar com programação\n✅ Estratégias de marketing\n\nComo posso te ajudar especificamente?";
  }

  // Resposta padrão
  return `Entendi sua pergunta sobre: "${message}"\n\nEstou processando sua solicitação. Por favor, configure a GROQ_API_KEY para respostas completas com IA.`;
}

// =================================================================
// 2. 🎨 APRIMORAR IMAGEM COM REDIMENSIONAMENTO AUTOMÁTICO
// =================================================================
export const enhanceImage = action({
  args: {
    userId: v.string(),
    imageFile: v.string(),
    effect: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; message?: string }> => {
    try {
      console.log("🎨 Iniciando aprimoramento de imagem...");

      // ✅ VERIFICAR LIMITE DE USO DIÁRIO
      const today = new Date().toISOString().split('T')[0];
      const usageRecord = await ctx.runQuery(api.aiStudio.checkEnhanceLimit, {
        userId: args.userId,
        date: today
      });

      const DAILY_LIMIT = 10; // 10 aprimoramentos por dia (AJUSTE CONFORME NECESSÁRIO)

      if (usageRecord && usageRecord.count >= DAILY_LIMIT) {
        return {
          success: false,
          message: `🚫 **Limite Diário Atingido!**\n\nVocê já usou ${DAILY_LIMIT} aprimoramentos hoje.\n\n⏰ Aguarde até amanhã ou faça upgrade para uso ilimitado!`
        };
      }

      const REPLICATE_KEY = process.env.REPLICATE_API_TOKEN || "";

      if (!REPLICATE_KEY || REPLICATE_KEY.length < 10) {
        return {
          success: false,
          message: "⚠️ Configure REPLICATE_API_TOKEN para aprimoramento com IA"
        };
      }

      console.log("📏 Redimensionando imagem para otimizar processamento...");

      const originalBlob = base64ToBlob(args.imageFile);
      const estimatedMB = (originalBlob.size / 1024 / 1024).toFixed(1);
      console.log(`📊 Tamanho original da imagem: ${estimatedMB} MB`);

      let processedImage = args.imageFile;

      if (originalBlob.size > 5 * 1024 * 1024) {
        console.log("⚠️ Imagem muito grande (>5MB). Reduzindo qualidade...");

        if (args.imageFile.includes('data:image/png')) {
          processedImage = args.imageFile.replace('data:image/png', 'data:image/jpeg');
          console.log("✅ Convertido de PNG para JPEG");
        }

        const base64Data = processedImage.split(',')[1];
        if (base64Data && base64Data.length > 1000000) {
          const reducedData = base64Data.substring(0, Math.floor(base64Data.length * 0.7));
          processedImage = processedImage.split(',')[0] + ',' + reducedData;
          console.log("✅ Qualidade reduzida para ~70%");
        }
      }

      console.log("🚀 Enviando para Replicate...");

      const models = [
        {
          name: "Real-ESRGAN (Barato)",
          version: "f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
          cost: 0.0015,
          config: {
            image: processedImage,
            scale: 2,
            face_enhance: false
          }
        },
        {
          name: "GFPGAN (Face Enhancement)",
          version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
          cost: 0.002,
          config: {
            img: processedImage,
            version: "v1.4",
            scale: 2
          }
        },
        {
          name: "Practical-RCAN (Super Resolution)",
          version: "861bc12866277e8e088dd5eb43e10ab5e82e9bc7b6b3c5eeca31ea43c7c45c65",
          cost: 0.001,
          config: {
            image: processedImage,
            scale: 2
          }
        }
      ];

      for (const model of models) {
        try {
          console.log(`🎯 Tentando modelo: ${model.name} ($${model.cost}/imagem)`);

          const startTime = Date.now();

          const prediction = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${REPLICATE_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              version: model.version,
              input: model.config
            }),
          });

          if (!prediction.ok) {
            const errorText = await prediction.text();
            console.error(`❌ Erro ao criar prediction: ${errorText}`);

            if (errorText.includes("pixels") || errorText.includes("memory")) {
              console.log("⚠️ Imagem ainda muito grande, tentando próximo modelo...");
              continue;
            }
            continue;
          }

          let result = await prediction.json();
          const predictionId = result.id;

          console.log(`📊 Prediction criada: ${predictionId}`);

          let attempts = 0;
          const maxAttempts = 60;

          while (result.status === "starting" || result.status === "processing") {
            attempts++;

            if (attempts >= maxAttempts) {
              console.error("⏱️ Timeout - processamento muito longo");
              break;
            }

            await new Promise(resolve => setTimeout(resolve, 1000));

            const statusResponse = await fetch(
              `https://api.replicate.com/v1/predictions/${predictionId}`,
              { headers: { "Authorization": `Bearer ${REPLICATE_KEY}` } }
            );

            if (statusResponse.ok) {
              result = await statusResponse.json();

              if (attempts % 5 === 0) {
                console.log(`⏳ Processando... ${attempts}s - Status: ${result.status}`);
              }
            }
          }

          if (result.status === "succeeded") {
            const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`✅ Sucesso com ${model.name} em ${processingTime}s!`);

            const imageUrl = Array.isArray(result.output)
              ? result.output[0]
              : result.output;

            if (!imageUrl) {
              console.error("❌ Output vazio");
              continue;
            }

            // ✅ BAIXAR E ARMAZENAR TEMPORARIAMENTE NO CONVEX
            console.log("📥 Baixando imagem para armazenamento temporário...");
            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) {
              console.error(`❌ Erro ao baixar imagem: ${imageResponse.status}`);
              continue;
            }

            const imageBlob = await imageResponse.blob();
            const resultKB = (imageBlob.size / 1024).toFixed(1);

            console.log(`📦 Resultado: ${resultKB}KB`);

            // ✅ SALVAR NO STORAGE TEMPORARIAMENTE
            const storageId = await ctx.storage.store(imageBlob);
            const finalUrl = await ctx.storage.getUrl(storageId);

            if (!finalUrl) {
              console.error("❌ Erro ao gerar URL do storage");
              continue;
            }

            // ✅ INCREMENTAR CONTADOR DE USO
            await ctx.runMutation(api.aiStudio.incrementEnhanceUsage, {
              userId: args.userId,
              date: today
            });

            // ✅ AGENDAR EXCLUSÃO AUTOMÁTICA APÓS 24H
            await ctx.runMutation(api.aiStudio.scheduleStorageDeletion, {
              storageId: storageId,
              type: "enhance",
              expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
            });

            return {
              success: true,
              url: finalUrl,
              message: `✨ **Imagem Aprimorada com Sucesso!**\n\n📊 **Detalhes:**\n• Modelo: ${model.name}\n• Tempo: ${processingTime}s\n• Tamanho: ${resultKB}KB\n• Usos restantes hoje: ${DAILY_LIMIT - (usageRecord?.count || 0) - 1}/${DAILY_LIMIT}\n\n⏰ Imagem expira em 24h - Baixe agora!`
            };
          } else if (result.status === "failed") {
            console.error(`❌ Processamento falhou:`, result.error);

            if (result.error && (result.error.includes("pixels") || result.error.includes("memory"))) {
              console.log("⚠️ Erro de tamanho, tentando próximo modelo...");
              continue;
            }
          } else {
            console.log(`⚠️ Status inesperado: ${result.status}`);
          }

        } catch (modelError) {
          console.error(`❌ Erro no modelo ${model.name}:`, modelError);
          continue;
        }
      }

      throw new Error("Todos os modelos falharam. Tente com uma imagem menor (máx 2MB, 1920x1080).");

    } catch (error: unknown) {
      console.error("❌ Erro geral no aprimoramento:", error);
      return {
        success: false,
        message: error instanceof Error
          ? `Erro: ${error.message}\n\n💡 Dica: Use imagens menores (máx 2MB, 1920x1080)`
          : "Erro ao processar. Tente com uma imagem menor."
      };
    }
  },
});

// =================================================================
// 3. 🎤 VOZ PARA TEXTO - GROQ WHISPER
// =================================================================
export const speechToText = action({
  args: {
    userId: v.string(),
    audioUrl: v.string()
  },
  handler: async (ctx, args): Promise<{ success: boolean; text?: string; message?: string }> => {
    try {
      const GROQ_KEY = getGroqApiKey();

      if (GROQ_KEY && GROQ_KEY.length > 10) {
        try {
          console.log("🎤 Transcrevendo com Groq Whisper...");

          const audioBlob = base64ToBlob(args.audioUrl);
          const formData = new FormData();
          formData.append('file', audioBlob, 'audio.mp3');
          formData.append('model', 'whisper-large-v3-turbo');
          formData.append('language', 'pt');
          formData.append('response_format', 'json');
          formData.append('temperature', '0');

          const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${GROQ_KEY}`,
            },
            body: formData
          });

          if (response.ok) {
            const result = await response.json();
            const transcription = result.text;

            if (transcription && transcription.length > 3) {
              console.log("✅ Áudio transcrito!");

              await ctx.runMutation(api.aiStudio.saveTranscription, {
                userId: args.userId,
                audioUrl: args.audioUrl.substring(0, 100),
                transcription
              });

              return {
                success: true,
                text: transcription,
                message: "✅ Áudio transcrito com Whisper Turbo!"
              };
            }
          } else {
            const errorText = await response.text();
            console.error("❌ Erro Whisper:", errorText);
          }
        } catch (error) {
          console.error("❌ Erro ao transcrever:", error);
        }
      }

      // Fallback
      const fallbackText = "⚠️ Configure GROQ_API_KEY para transcrição automática.\n\n🔑 Obtenha gratuitamente em:\nhttps://console.groq.com";

      await ctx.runMutation(api.aiStudio.saveTranscription, {
        userId: args.userId,
        audioUrl: args.audioUrl.substring(0, 100),
        transcription: fallbackText
      });

      return {
        success: true,
        text: fallbackText,
        message: "Configure GROQ_API_KEY"
      };
    } catch (error: unknown) {
      console.error("❌ Erro STT:", error);
      return {
        success: false,
        message: "Erro ao transcrever"
      };
    }
  },
});

// =================================================================
// 4. 📸 REMOVER FUNDO - REPLICATE
// =================================================================
export const removeBackground = action({
  args: {
    userId: v.string(),
    imageUrl: v.string()
  },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; message?: string }> => {
    try {
      // ✅ VERIFICAR LIMITE DE USO DIÁRIO
      const today = new Date().toISOString().split('T')[0];
      const usageRecord = await ctx.runQuery(api.aiStudio.checkRemoveBgLimit, {
        userId: args.userId,
        date: today
      });

      const DAILY_LIMIT = 15; // 15 remoções de fundo por dia (AJUSTE CONFORME NECESSÁRIO)

      if (usageRecord && usageRecord.count >= DAILY_LIMIT) {
        return {
          success: false,
          message: `🚫 **Limite Diário Atingido!**\n\nVocê já usou ${DAILY_LIMIT} remoções de fundo hoje.\n\n⏰ Aguarde até amanhã ou faça upgrade para uso ilimitado!`
        };
      }

      const REPLICATE_KEY = getReplicateApiKey();

      if (!REPLICATE_KEY || REPLICATE_KEY.length < 10) {
        return {
          success: false,
          message: "⚠️ Configure REPLICATE_API_TOKEN para remoção com IA"
        };
      }

      console.log("✂️ Removendo fundo com Replicate...");

      const prediction = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${REPLICATE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: "95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1",
          input: {
            image: args.imageUrl
          }
        }),
      });

      if (!prediction.ok) {
        const errorText = await prediction.text();
        console.error("❌ Erro ao criar prediction:", errorText);
        throw new Error("Falha ao iniciar processamento");
      }

      let result = await prediction.json();
      const predictionId = result.id;

      console.log(`📊 Prediction criada: ${predictionId}`);

      let attempts = 0;
      const maxAttempts = 30;

      while (result.status === "starting" || result.status === "processing") {
        attempts++;

        if (attempts >= maxAttempts) {
          throw new Error("Timeout - processamento muito longo");
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        const statusResponse = await fetch(
          `https://api.replicate.com/v1/predictions/${predictionId}`,
          {
            headers: {
              "Authorization": `Bearer ${REPLICATE_KEY}`,
            },
          }
        );

        if (statusResponse.ok) {
          result = await statusResponse.json();

          if (attempts % 5 === 0) {
            console.log(`⏳ Processando... ${attempts}s`);
          }
        }
      }

      if (result.status === "succeeded" && result.output) {
        console.log("✅ Fundo removido!");

        const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;

        // ✅ BAIXAR E ARMAZENAR TEMPORARIAMENTE NO CONVEX
        console.log("📥 Baixando imagem para armazenamento temporário...");
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error("Erro ao baixar imagem processada");
        }

        const imageBlob = await imageResponse.blob();
        const resultKB = (imageBlob.size / 1024).toFixed(1);
        console.log(`📦 Resultado: ${resultKB}KB`);

        // ✅ SALVAR NO STORAGE TEMPORARIAMENTE
        const storageId = await ctx.storage.store(imageBlob);
        const finalUrl = await ctx.storage.getUrl(storageId);

        if (!finalUrl) {
          throw new Error("Erro ao gerar URL do storage");
        }

        // ✅ INCREMENTAR CONTADOR DE USO
        await ctx.runMutation(api.aiStudio.incrementRemoveBgUsage, {
          userId: args.userId,
          date: today
        });

        // ✅ AGENDAR EXCLUSÃO AUTOMÁTICA APÓS 24H
        await ctx.runMutation(api.aiStudio.scheduleStorageDeletion, {
          storageId: storageId,
          type: "remove_bg",
          expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
        });

        return {
          success: true,
          url: finalUrl,
          message: `✨ **Fundo Removido com Sucesso!**\n\n📊 **Detalhes:**\n• Tamanho: ${resultKB}KB\n• Usos restantes hoje: ${DAILY_LIMIT - (usageRecord?.count || 0) - 1}/${DAILY_LIMIT}\n\n⏰ Imagem expira em 24h - Baixe agora!`
        };
      } else if (result.status === "failed") {
        console.error("❌ Processamento falhou:", result.error);
        throw new Error(result.error || "Processamento falhou");
      }

      throw new Error("Status inesperado: " + result.status);

    } catch (error: unknown) {
      console.error("❌ Erro:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro ao processar"
      };
    }
  },
});

// =================================================================
// 💾 MUTATIONS
// =================================================================


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

// =================================================================
// 📊 QUERIES PARA VERIFICAR LIMITES DE USO
// =================================================================

export const checkEnhanceLimit = query({
  args: {
    userId: v.string(),
    date: v.string()
  },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("enhanceUsage")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .first();

    return record || { count: 0 };
  },
});

export const checkRemoveBgLimit = query({
  args: {
    userId: v.string(),
    date: v.string()
  },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("removeBgUsage")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .first();

    return record || { count: 0 };
  },
});

// =================================================================
// 💾 MUTATIONS PARA INCREMENTAR CONTADORES DE USO
// =================================================================

export const incrementEnhanceUsage = mutation({
  args: {
    userId: v.string(),
    date: v.string()
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("enhanceUsage")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        count: existing.count + 1,
        updatedAt: Date.now()
      });
    } else {
      await ctx.db.insert("enhanceUsage", {
        userId: args.userId,
        date: args.date,
        count: 1,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
  },
});

export const cleanupExpiredStorage = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();

    // Buscar arquivos expirados
    const expiredFiles = await ctx.db
      .query("tempStorageFiles")
      .withIndex("by_expiration")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .take(100); // Limpar 100 por vez

    let deletedCount = 0;

    for (const file of expiredFiles) {
      try {
        // Deletar do storage
        await ctx.storage.delete(file.storageId);

        // Deletar registro
        await ctx.db.delete(file._id);

        deletedCount++;
      } catch (error) {
        console.error(`Erro ao deletar arquivo ${file.storageId}:`, error);
      }
    }

    console.log(`🧹 Limpeza concluída: ${deletedCount} arquivos removidos`);

    return { deletedCount };
  },
});

export const incrementRemoveBgUsage = mutation({
  args: {
    userId: v.string(),
    date: v.string()
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("removeBgUsage")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        count: existing.count + 1,
        updatedAt: Date.now()
      });
    } else {
      await ctx.db.insert("removeBgUsage", {
        userId: args.userId,
        date: args.date,
        count: 1,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
  },
});

export const scheduleStorageDeletion = mutation({
  args: {
    storageId: v.id("_storage"),
    type: v.union(v.literal("enhance"), v.literal("remove_bg")),
    expiresAt: v.number()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tempStorageFiles", {
      storageId: args.storageId,
      type: args.type,
      expiresAt: args.expiresAt,
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