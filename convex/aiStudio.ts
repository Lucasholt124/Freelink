import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";



// =================================================================
// 🎯 TIPOS E INTERFACES
// =================================================================
interface PexelsVideoFile {
  id: number;
  quality: "hd" | "sd" | "hls";
  file_type: string;
  width: number;
  height: number;
  link: string;
  fps?: number;
}

interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  duration: number;
  video_files: PexelsVideoFile[];
  video_pictures: Array<{ id: number; picture: string; nr: number }>;
}

interface PexelsResponse {
  page: number;
  per_page: number;
  total_results: number;
  videos: PexelsVideo[];
}

// =================================================================
// 🔒 CONFIGURAÇÃO
// =================================================================
const getRemoveBgApiKey = (): string => {
  const key = process.env.REMOVE_BG_API_KEY;
  if (!key) console.warn("⚠️ REMOVE_BG_API_KEY não configurado.");
  return key || "";
};

const getPexelsApiKey = (): string => {
  const key = process.env.PEXELS_API_KEY;
  if (!key) console.warn("⚠️ PEXELS_API_KEY não configurado.");
  return key || "";
};

// --- NOVAS FUNÇÕES DE CONFIGURAÇÃO ---
const getReplicateApiKey = (): string => {
  const key = process.env.REPLICATE_API_KEY;
  if (!key) console.warn("⚠️ REPLICATE_API_KEY não configurado.");
  return key || "";
};

const getElevenLabsApiKey = (): string => {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) console.warn("⚠️ ELEVENLABS_API_KEY não configurado.");
  return key || "";
};

// Função auxiliar para converter base64 em Blob
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
// 1. 🎨 APRIMORADOR DE IMAGENS (COM REPLICATE)
// =================================================================
export const enhanceImage = action({
  args: {
    userId: v.string(),
    imageFile: v.string(), // Imagem em base64 data URL
  },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; message?: string }> => {
    try {
      const REPLICATE_KEY = getReplicateApiKey();
      if (!REPLICATE_KEY) {
        return { success: false, message: "Replicate API Key não configurada." };
      }

      console.log("🚀 Iniciando aprimoramento de imagem com Replicate...");

      // 1. Iniciar a predição
      const startResponse = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          "Authorization": `Token ${REPLICATE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Modelo GFPGAN para restauração geral de imagens
          version: "9283608cc6b7be6b65a8e44983a0d59579ed491c05de5fbac35349a6d3d87465",
          input: {
            img: args.imageFile, // Replicate aceita data URL diretamente
            version: "v1.4",
            scale: 2
          },
        }),
      });

      const prediction = await startResponse.json();
      if (startResponse.status !== 201) {
        throw new Error(`Erro ao iniciar predição: ${prediction.detail}`);
      }

      let finalPrediction;
      const statusUrl = prediction.urls.get;

      // 2. Aguardar o resultado (polling)
      while (true) {
        console.log("⏳ Verificando status da imagem...");
        const statusResponse = await fetch(statusUrl, {
          headers: { "Authorization": `Token ${REPLICATE_KEY}` },
        });
        const currentStatus = await statusResponse.json();

        if (currentStatus.status === "succeeded") {
          finalPrediction = currentStatus;
          break;
        } else if (currentStatus.status === "failed") {
          throw new Error(`Processamento falhou: ${currentStatus.error}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const enhancedImageUrl = finalPrediction.output;

      const imageResponse = await fetch(enhancedImageUrl);
      const imageBlob = await imageResponse.blob();
      const storageId = await ctx.storage.store(imageBlob);
      const finalUrl = await ctx.storage.getUrl(storageId);

      await ctx.runMutation(api.aiStudio.saveEnhancedImage, {
        userId: args.userId,
        originalUrl: args.imageFile.substring(0, 100),
        resultUrl: finalUrl!,
        prompt: "Aprimorado com Replicate/GFPGAN",
        storageId: storageId
      });

      return { success: true, url: finalUrl!, message: "✨ Imagem aprimorada com Replicate!" };

    } catch (error) {
      console.error("Erro no enhanceImage (Replicate):", error);
      return { success: false, message: "Erro ao aprimorar imagem com Replicate." };
    }
  },
});

// =================================================================
// 2. 🎵 TEXTO PARA VOZ (COM ELEVENLABS)
// =================================================================
export const textToSpeech = action({
  args: {
    userId: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; message?: string }> => {
    try {
      const ELEVENLABS_KEY = getElevenLabsApiKey();
      if (!ELEVENLABS_KEY) {
        return { success: false, message: "ElevenLabs API Key não configurada." };
      }

      console.log("🎤 Gerando áudio de alta qualidade com ElevenLabs...");

      // ID da voz "Rachel" (uma das mais populares e versáteis)
      const voiceId = "21m00Tcm4TlvDq8ikWAM";
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_KEY,
        },
        body: JSON.stringify({
          text: args.text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro da API ElevenLabs: ${errorText}`);
      }

      const audioBlob = await response.blob();
      const storageId = await ctx.storage.store(audioBlob);
      const finalUrl = await ctx.storage.getUrl(storageId);

      await ctx.runMutation(api.aiStudio.saveAudio, {
        userId: args.userId,
        text: args.text,
        resultUrl: finalUrl!,
        storageId: storageId,
      });

      return {
        success: true,
        url: finalUrl!,
        message: "🔥 Voz neural da ElevenLabs gerada!",
      };

    } catch (error) {
      console.error("Erro no textToSpeech (ElevenLabs):", error);
      return { success: false, message: "Erro ao gerar áudio com ElevenLabs." };
    }
  },
});

// =================================================================
// 3. 🎤 VOZ PARA TEXTO (WHISPER LARGE V3) - MANTIDO
// =================================================================
export const speechToText = action({
  args: {
    userId: v.string(),
    audioUrl: v.string()
  },
  handler: async (ctx, args): Promise<{ success: boolean; text?: string; message?: string }> => {
    try {
      const audioBlob = base64ToBlob(args.audioUrl);

      const response = await fetch(
        'https://api-inference.huggingface.co/models/openai/whisper-large-v3',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream'
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
          message: "✅ Transcrição realizada com Whisper V3!"
        };
      }

      throw new Error("Erro na transcrição");
    } catch (error) {
      console.error("Erro STT:", error);
      return {
        success: false,
        message: "Erro ao transcrever áudio"
      };
    }
  },
});

// =================================================================
// 4. 🎬 GERADOR DE VÍDEOS COM IA - MANTIDO
// =================================================================
export const generateVideo = action({
  args: {
    userId: v.string(),
    prompt: v.string()
  },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; message?: string }> => {
    try {
      console.log(`🎬 Gerando vídeo sobre: ${args.prompt}`);

      // OPÇÃO 1: Stable Video Diffusion
      const videoGenResponse = await fetch(
        'https://api-inference.huggingface.co/models/stabilityai/stable-video-diffusion-img2vid-xt',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inputs: args.prompt,
            options: { wait_for_model: true }
          })
        }
      );

      if (videoGenResponse.ok) {
        const videoBlob = await videoGenResponse.blob();
        const storageId = await ctx.storage.store(videoBlob);
        const videoUrl = await ctx.storage.getUrl(storageId);

        await ctx.runMutation(api.aiStudio.saveVideo, {
          userId: args.userId,
          prompt: args.prompt,
          resultUrl: videoUrl!
        });

        return { success: true, url: videoUrl!, message: "🚀 Vídeo gerado com IA!" };
      }

      // OPÇÃO 2: Pexels
      const PEXELS_API_KEY = getPexelsApiKey();
      if (PEXELS_API_KEY) {
        const response = await fetch(
          `https://api.pexels.com/videos/search?query=${encodeURIComponent(args.prompt)}&per_page=10`,
          { headers: { 'Authorization': PEXELS_API_KEY } }
        );

        if (response.ok) {
          const data = await response.json() as PexelsResponse;
          if (data.videos && data.videos.length > 0) {
            const video = data.videos[0];
            const hdFile = video.video_files.find(f => f.quality === "hd");
            const videoUrl = hdFile?.link || video.video_files[0].link;

            await ctx.runMutation(api.aiStudio.saveVideo, {
              userId: args.userId,
              prompt: args.prompt,
              resultUrl: videoUrl
            });

            return { success: true, url: videoUrl, message: "📹 Vídeo HD relevante encontrado!" };
          }
        }
      }

      return { success: false, message: "Configure PEXELS_API_KEY para melhores resultados" };
    } catch (error) {
      console.error("Erro em generateVideo:", error);
      return { success: false, message: "Erro ao gerar vídeo" };
    }
  },
});

// =================================================================
// 5. 📸 REMOVEDOR DE FUNDO - MANTIDO
// =================================================================
export const removeBackground = action({
  args: {
    userId: v.string(),
    imageUrl: v.string()
  },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; message?: string }> => {
    try {
      const imageBlob = base64ToBlob(args.imageUrl);
      const REMOVE_BG_KEY = getRemoveBgApiKey();

      if (!REMOVE_BG_KEY) {
        return { success: false, message: "Configure REMOVE_BG_API_KEY no arquivo .env" };
      }

      const formData = new FormData();
      formData.append('image_file', imageBlob, 'image.png');
      formData.append('size', 'auto');

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: { 'X-Api-Key': REMOVE_BG_KEY },
        body: formData
      });

      if (!response.ok) throw new Error("Erro ao remover fundo");

      const processedImage = await response.blob();
      const storageId = await ctx.storage.store(processedImage);
      const finalUrl = await ctx.storage.getUrl(storageId);

      if (finalUrl) {
        return { success: true, url: finalUrl, message: "✨ Fundo removido com perfeição!" };
      }

      throw new Error("Erro ao salvar imagem");
    } catch (error) {
      console.error("Erro em removeBackground:", error);
      return { success: false, message: "Erro ao remover fundo" };
    }
  },
});

// =================================================================
// MUTATIONS E QUERIES - MANTIDAS
// =================================================================
export const saveEnhancedImage = mutation({
  args: {
    userId: v.string(),
    originalUrl: v.string(),
    resultUrl: v.string(),
    prompt: v.string(),
    storageId: v.optional(v.id("_storage"))
  },
  handler: async (ctx, args) => await ctx.db.insert("aiStudioContent", {
    userId: args.userId,
    originalUrl: args.originalUrl,
    resultUrl: args.resultUrl,
    prompt: args.prompt,
    storageId: args.storageId,
    type: "enhanced_image",
    createdAt: Date.now()
  }),
});

export const saveAudio = mutation({
  args: {
    userId: v.string(),
    text: v.string(),
    resultUrl: v.string(),
    storageId: v.id("_storage")
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiStudioContent", {
      userId: args.userId,
      text: args.text,
      resultUrl: args.resultUrl,
      storageId: args.storageId,
      type: "audio",
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
  handler: async (ctx, args) => await ctx.db.insert("aiStudioContent", {
    userId: args.userId,
    type: "transcription",
    originalUrl: args.audioUrl,
    text: args.transcription,
    createdAt: Date.now()
  }),
});

export const saveVideo = mutation({
  args: {
    userId: v.string(),
    prompt: v.string(),
    resultUrl: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiStudioContent", {
      userId: args.userId,
      prompt: args.prompt,
      resultUrl: args.resultUrl,
      type: "video",
      createdAt: Date.now()
    });
  },
});

export const getUserContent = query({
  args: {
    userId: v.string(),
    type: v.union(
      v.literal("enhanced_image"),
      v.literal("audio"),
      v.literal("transcription"),
      v.literal("video")
    )
  },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    return await ctx.db.query("aiStudioContent")
      .withIndex("by_user_and_type", (q) =>
        q.eq("userId", args.userId).eq("type", args.type)
      )
      .order("desc")
      .take(10);
  },
});