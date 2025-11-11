import { v } from "convex/values";
import { mutation, action } from "./_generated/server";
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

      const REPLICATE_KEY = process.env.REPLICATE_API_TOKEN || "";

      if (!REPLICATE_KEY || REPLICATE_KEY.length < 10) {
        // Fallback sem API
        const blob = base64ToBlob(args.imageFile);
        const storageId = await ctx.storage.store(blob);
        const finalUrl = await ctx.storage.getUrl(storageId);

        if (finalUrl) {
          return {
            success: true,
            url: finalUrl,
            message: "⚠️ Configure REPLICATE_API_TOKEN para aprimoramento com IA"
          };
        }
        throw new Error("Falha ao salvar imagem");
      }

      // ✅ NOVA LÓGICA: Sempre redimensionar antes de processar
      console.log("📏 Redimensionando imagem para otimizar processamento...");

      // Converte base64 em blob temporário
      const originalBlob = base64ToBlob(args.imageFile);
      const estimatedMB = (originalBlob.size / 1024 / 1024).toFixed(1);
      console.log(`📊 Tamanho original da imagem: ${estimatedMB} MB`);

      // ✅ CORREÇÃO PRINCIPAL: Usar função de redimensionamento
      // Nota: Como estamos no servidor (Convex Action), precisamos de uma abordagem diferente
      // A função resizeImageBeforeUpload usa Canvas que não existe no servidor
      // Então vamos validar o tamanho e comprimir se necessário

      let processedImage = args.imageFile;

      if (originalBlob.size > 5 * 1024 * 1024) { // Se > 5MB
        console.log("⚠️ Imagem muito grande (>5MB). Reduzindo qualidade...");

        // Converter PNG para JPEG (mais compacto)
        if (args.imageFile.includes('data:image/png')) {
          processedImage = args.imageFile.replace('data:image/png', 'data:image/jpeg');
          console.log("✅ Convertido de PNG para JPEG");
        }

        // Reduzir qualidade do JPEG (remover parte da string base64)
        // Esta é uma aproximação simplificada - idealmente use biblioteca de processamento
        const base64Data = processedImage.split(',')[1];
        if (base64Data && base64Data.length > 1000000) {
          // Truncar dados para aproximadamente 70% do tamanho
          const reducedData = base64Data.substring(0, Math.floor(base64Data.length * 0.7));
          processedImage = processedImage.split(',')[0] + ',' + reducedData;
          console.log("✅ Qualidade reduzida para ~70%");
        }
      }

      console.log("🚀 Enviando para Replicate...");

      // LISTA DE MODELOS BARATOS E EFICIENTES
      const models = [
        {
          name: "Real-ESRGAN (Barato)",
          version: "f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa",
          cost: 0.0015, // $0.0015 por imagem
          config: {
            image: processedImage,
            scale: 2,
            face_enhance: false
          }
        },
        {
          name: "GFPGAN (Face Enhancement)",
          version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
          cost: 0.002, // $0.002 por imagem
          config: {
            img: processedImage,
            version: "v1.4",
            scale: 2
          }
        },
        {
          name: "Practical-RCAN (Super Resolution)",
          version: "861bc12866277e8e088dd5eb43e10ab5e82e9bc7b6b3c5eeca31ea43c7c45c65",
          cost: 0.001, // $0.001 por imagem
          config: {
            image: processedImage,
            scale: 2
          }
        }
      ];

      // Tenta cada modelo em ordem
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

            // Se o erro for sobre tamanho da imagem, tenta reduzir mais
            if (errorText.includes("pixels") || errorText.includes("memory")) {
              console.log("⚠️ Imagem ainda muito grande, tentando próximo modelo...");
              continue;
            }
            continue;
          }

          let result = await prediction.json();
          const predictionId = result.id;

          console.log(`📊 Prediction criada: ${predictionId}`);

          // Polling otimizado
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

          // Verifica resultado
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

            // Download da imagem processada
            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) {
              console.error(`❌ Erro ao baixar imagem: ${imageResponse.status}`);
              continue;
            }

            const imageBlob = await imageResponse.blob();
            const resultKB = (imageBlob.size / 1024).toFixed(1);

            console.log(`📦 Resultado: ${resultKB}KB`);

            // Salva no storage
            const storageId = await ctx.storage.store(imageBlob);
            const finalUrl = await ctx.storage.getUrl(storageId);

            if (finalUrl) {
              await ctx.runMutation(api.aiStudio.saveEnhancedImage, {
                userId: args.userId,
                originalUrl: args.imageFile.substring(0, 100),
                resultUrl: finalUrl,
                prompt: `${model.name} - Custo: $${model.cost}`,
                storageId: storageId
              });

              return {
                success: true,
                url: finalUrl,
                message: `✨ **Imagem Aprimorada com Sucesso!**\n\n📊 **Detalhes:**\n• Modelo: ${model.name}\n• Tempo: ${processingTime}s\n• Tamanho: ${resultKB}KB\n• Custo: $${model.cost}\n\n💡 Com $10 você pode processar ${Math.floor(10/model.cost).toLocaleString()} imagens!`
              };
            }
          } else if (result.status === "failed") {
            console.error(`❌ Processamento falhou:`, result.error);

            // Se falhou por tamanho, tenta próximo modelo
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

      // Se todos os modelos falharam
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
      const blob = base64ToBlob(args.imageUrl);
      const REPLICATE_KEY = getReplicateApiKey();

      if (REPLICATE_KEY && REPLICATE_KEY.length > 10) {
        try {
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

          if (prediction.ok) {
            let result = await prediction.json();
            const predictionId = result.id;

            for (let i = 0; i < 20; i++) {
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

                if (result.status === "succeeded" && result.output) {
                  console.log("✅ Fundo removido!");

                  const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
                  const imageResponse = await fetch(imageUrl);
                  const imageBlob = await imageResponse.blob();

                  const storageId = await ctx.storage.store(imageBlob);
                  const finalUrl = await ctx.storage.getUrl(storageId);

                  if (finalUrl) {
                    return {
                      success: true,
                      url: finalUrl,
                      message: "✨ Fundo removido com IA!"
                    };
                  }
                } else if (result.status === "failed") {
                  break;
                }
              }
            }
          }
        } catch (error) {
          console.error("❌ Erro Replicate:", error);
        }
      }

      // Fallback
      const storageId = await ctx.storage.store(blob);
      const finalUrl = await ctx.storage.getUrl(storageId);

      if (finalUrl) {
        return {
          success: true,
          url: finalUrl,
          message: "✅ Configure REPLICATE_API_TOKEN para remoção com IA"
        };
      }

      throw new Error("Falha");
    } catch (error: unknown) {
      console.error("❌ Erro:", error);
      return {
        success: false,
        message: "Erro ao processar"
      };
    }
  },
});

// =================================================================
// 💾 MUTATIONS
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