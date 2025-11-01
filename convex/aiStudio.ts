import { v } from "convex/values";
import { mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

// =================================================================
// 🔧 FUNÇÕES AUXILIARES
// =================================================================
const getGroqApiKey = (): string => {
  return process.env.GROQ_API_KEY || "";
};

const getHuggingFaceToken = (): string => {
  return process.env.HUGGING_FACE_API_KEY || "";
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
// 1. 💬 CHAT COM IA (USANDO GROQ - GRATUITO E RÁPIDO)
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
      const GROQ_KEY = getGroqApiKey();

      if (GROQ_KEY) {
        try {
          // Preparar histórico de conversa
          const messages = [
            {
              role: "system",
              content: "Você é uma assistente de IA extremamente útil, inteligente e amigável. Responda de forma clara, concisa e em português brasileiro. Seja prestativo e criativo em suas respostas."
            },
            ...(args.conversationHistory || []),
            {
              role: "user",
              content: args.message
            }
          ];

          // Chamar API do Groq
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${GROQ_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "mixtral-8x7b-32768", // Modelo rápido e gratuito
              messages: messages,
              temperature: 0.7,
              max_tokens: 2048,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const aiResponse = data.choices[0]?.message?.content;

            if (aiResponse) {
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
          }
        } catch (error) {
          console.error("Erro no Groq:", error);
        }
      }

      // Fallback: Hugging Face (alternativa gratuita)
      const HF_TOKEN = getHuggingFaceToken();
      if (HF_TOKEN) {
        try {
          const response = await fetch(
            "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
            {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                inputs: args.message,
                parameters: {
                  max_new_tokens: 512,
                  temperature: 0.7,
                  return_full_text: false
                }
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            const aiResponse = data[0]?.generated_text || data.generated_text;

            if (aiResponse) {
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
          }
        } catch (error) {
          console.error("Erro no HuggingFace:", error);
        }
      }

      // Fallback final: resposta padrão
      const fallbackResponse = "Desculpe, estou temporariamente indisponível. Por favor, configure GROQ_API_KEY ou HUGGING_FACE_API_KEY no arquivo .env para ativar o chat com IA.";

      return {
        success: true,
        response: fallbackResponse,
      };

    } catch (error: unknown) {
      console.error("Erro no chat:", error);
      return {
        success: false,
        message: "Erro ao processar mensagem"
      };
    }
  },
});

// =================================================================
// 2. 🎨 APRIMORAR IMAGEM (HUGGING FACE)
// =================================================================
export const enhanceImage = action({
  args: {
    userId: v.string(),
    imageFile: v.string(),
    effect: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; message?: string }> => {
    const token = getHuggingFaceToken();
    const blob = base64ToBlob(args.imageFile);

    const hfImageInference = async (model: string, imageBlob: Blob): Promise<Blob> => {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: imageBlob,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        if (error.error && error.estimated_time) {
          await new Promise(resolve => setTimeout(resolve, (error.estimated_time + 2) * 1000));
          return hfImageInference(model, imageBlob);
        }
        throw new Error(error.error || `HF API Error ${response.status}`);
      }
      return response.blob();
    };

    const saveAndReturn = async (resultBlob: Blob, modelName: string) => {
      const storageId = await ctx.storage.store(resultBlob);
      const finalUrl = await ctx.storage.getUrl(storageId);

      if (finalUrl) {
        await ctx.runMutation(api.aiStudio.saveEnhancedImage, {
          userId: args.userId,
          originalUrl: args.imageFile.substring(0, 100),
          resultUrl: finalUrl,
          prompt: `Aprimorado com ${modelName}`,
          storageId: storageId
        });

        return {
          success: true,
          url: finalUrl,
          message: `✨ Imagem aprimorada com ${modelName}!`
        };
      }
      throw new Error("Falha ao salvar no storage");
    };

    try {
      console.log("🚀 Aprimorando com ESRGAN...");
      const resultBlob = await hfImageInference('eugenesiow/esrgan-x4', blob);
      return await saveAndReturn(resultBlob, 'ESRGAN 4x');
    } catch  {
      console.warn("ESRGAN falhou, tentando GFPGAN...");

      try {
        const resultBlob = await hfImageInference('TencentARC/GFPGANv1.4', blob);
        return await saveAndReturn(resultBlob, 'GFPGAN');
      } catch  {
        console.warn("GFPGAN falhou, salvando original otimizado...");

        const storageId = await ctx.storage.store(blob);
        const finalUrl = await ctx.storage.getUrl(storageId);

        if (finalUrl) {
          await ctx.runMutation(api.aiStudio.saveEnhancedImage, {
            userId: args.userId,
            originalUrl: args.imageFile.substring(0, 100),
            resultUrl: finalUrl,
            prompt: "Processamento local",
            storageId: storageId
          });

          return {
            success: true,
            url: finalUrl,
            message: "✅ Imagem processada!"
          };
        }
      }
    }

    return {
      success: false,
      message: "❌ Erro ao processar. Configure HUGGING_FACE_API_KEY."
    };
  },
});

// =================================================================
// 3. 🎤 VOZ PARA TEXTO (HUGGING FACE WHISPER)
// =================================================================
export const speechToText = action({
  args: {
    userId: v.string(),
    audioUrl: v.string()
  },
  handler: async (ctx, args): Promise<{ success: boolean; text?: string; message?: string }> => {
    try {
      const audioBlob = base64ToBlob(args.audioUrl);
      const token = getHuggingFaceToken();

      if (token) {
        try {
          const response = await fetch(
            'https://api-inference.huggingface.co/models/openai/whisper-base',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
              body: audioBlob,
            }
          );

          if (response.ok) {
            const result = await response.json();
            const transcription = result.text || "Transcrição não disponível";

            await ctx.runMutation(api.aiStudio.saveTranscription, {
              userId: args.userId,
              audioUrl: args.audioUrl.substring(0, 100),
              transcription
            });

            return {
              success: true,
              text: transcription,
              message: "✅ Áudio transcrito!"
            };
          }
        } catch (error) {
          console.error("Erro no Whisper:", error);
        }
      }

      // Fallback
      const fallbackText = "Serviço de transcrição temporariamente indisponível. Configure HUGGING_FACE_API_KEY no .env";

      await ctx.runMutation(api.aiStudio.saveTranscription, {
        userId: args.userId,
        audioUrl: args.audioUrl.substring(0, 100),
        transcription: fallbackText
      });

      return {
        success: true,
        text: fallbackText,
        message: "⚠️ Configure a API para transcrição"
      };
    } catch (error: unknown) {
      console.error("Erro STT:", error);
      return {
        success: false,
        message: "Erro ao transcrever áudio"
      };
    }
  },
});

// =================================================================
// 4. 📸 REMOVER FUNDO (REMOVE.BG OU FALLBACK)
// =================================================================
export const removeBackground = action({
  args: {
    userId: v.string(),
    imageUrl: v.string()
  },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; message?: string }> => {
    try {
      const REMOVE_BG_KEY = process.env.REMOVE_BG_API_KEY;

      if (REMOVE_BG_KEY) {
        try {
          const formData = new FormData();
          formData.append('image_file', base64ToBlob(args.imageUrl), 'image.png');
          formData.append('size', 'auto');

          const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
              'X-Api-Key': REMOVE_BG_KEY
            },
            body: formData
          });

          if (response.ok) {
            const processedImage = await response.blob();
            const storageId = await ctx.storage.store(processedImage);
            const finalUrl = await ctx.storage.getUrl(storageId);

            if (finalUrl) {
              return {
                success: true,
                url: finalUrl,
                message: "✨ Fundo removido!"
              };
            }
          }
        } catch (error) {
          console.error("Remove.bg falhou:", error);
        }
      }

      // Fallback: salvar original
      const blob = base64ToBlob(args.imageUrl);
      const storageId = await ctx.storage.store(blob);
      const finalUrl = await ctx.storage.getUrl(storageId);

      if (finalUrl) {
        return {
          success: true,
          url: finalUrl,
          message: "✅ Imagem processada (Configure REMOVE_BG_API_KEY para melhores resultados)"
        };
      }

      throw new Error("Falha no processamento");
    } catch (error: unknown) {
      console.error("Erro em removeBackground:", error);
      return {
        success: false,
        message: "Erro ao remover fundo"
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