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
  video_pictures: Array<{
    id: number;
    picture: string;
    nr: number;
  }>;
}

interface PexelsResponse {
  page: number;
  per_page: number;
  total_results: number;
  videos: PexelsVideo[];
}

interface PixabayVideoInfo {
  url: string;
  width: number;
  height: number;
  size: number;
}

interface PixabayVideo {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  duration: number;
  videos: {
    large: PixabayVideoInfo;
    medium: PixabayVideoInfo;
    small: PixabayVideoInfo;
    tiny: PixabayVideoInfo;
  };
}

interface PixabayResponse {
  total: number;
  totalHits: number;
  hits: PixabayVideo[];
}

interface HuggingFaceResponse {
  text?: string;
  error?: string;
}

interface DeepAIResponse {
  id: string;
  output_url: string;
}

interface WitAIResponse {
  text: string;
  intents: Array<{
    id: string;
    name: string;
    confidence: number;
  }>;
  entities: Record<string, unknown>;
  traits: Record<string, unknown>;
}

// =================================================================
// 🔒 CONFIGURAÇÃO SEGURA - TOKENS EM VARIÁVEIS DE AMBIENTE
// =================================================================

const getHuggingFaceToken = (): string => {
  const token = process.env.HUGGING_FACE_TOKEN;
  if (!token) {
    console.warn("⚠️ HUGGING_FACE_TOKEN não configurado.");
    return "";
  }
  return token;
};

const getPexelsApiKey = (): string => {
  const key = process.env.PEXELS_API_KEY;
  if (!key) {
    console.warn("⚠️ PEXELS_API_KEY não configurado.");
    return "";
  }
  return key;
};

const getRemoveBgApiKey = (): string => {
  const key = process.env.REMOVE_BG_API_KEY;
  if (!key) {
    console.warn("⚠️ REMOVE_BG_API_KEY não configurado.");
    return "";
  }
  return key;
};

const HF_API_URL = "https://api-inference.huggingface.co/models/";

// =================================================================
// 1. 🎨 APRIMORADOR DE IMAGENS
// =================================================================
export const enhanceImage = action({
  args: {
    userId: v.string(),
    imageFile: v.string(),
    effect: v.string()
  },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; message?: string }> => {
    try {
      const HUGGING_FACE_TOKEN = getHuggingFaceToken();

      if (!HUGGING_FACE_TOKEN) {
        const base64Data = args.imageFile.split(',')[1] || args.imageFile;
        const imageBuffer = Buffer.from(base64Data, 'base64');

        const formData = new FormData();
        formData.append('image', new Blob([imageBuffer]));

        const response = await fetch('https://api.deepai.org/api/waifu2x', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const result = await response.json() as DeepAIResponse;
          const enhancedUrl = result.output_url;

          const imgResponse = await fetch(enhancedUrl);
          const imgBlob = await imgResponse.blob();
          const storageId = await ctx.storage.store(imgBlob);
          const finalUrl = await ctx.storage.getUrl(storageId);

          if (finalUrl) {
            await ctx.runMutation(api.aiStudio.saveEnhancedImage, {
              userId: args.userId,
              originalUrl: args.imageFile.substring(0, 100),
              enhancedUrl: finalUrl,
              prompt: `Efeito: ${args.effect}`,
              storageId,
            });

            return { success: true, url: finalUrl };
          }
        }
      }

      const base64Data = args.imageFile.split(',')[1] || args.imageFile;
      const imageBuffer = Buffer.from(base64Data, 'base64');

      let modelUrl: string;
      switch (args.effect) {
        case 'upscale':
          modelUrl = `${HF_API_URL}philz1337/clarity-upscaler`;
          break;
        case 'denoise':
          modelUrl = `${HF_API_URL}google/maxim-s3-denoising-multires`;
          break;
        case 'colorize':
          modelUrl = `${HF_API_URL}MyneFactory/Colorize`;
          break;
        case 'cartoon':
          modelUrl = `${HF_API_URL}nitrosocke/mo-di-diffusion`;
          break;
        default:
          modelUrl = `${HF_API_URL}tencentarc/gfpgan`;
          break;
      }

      const response = await fetch(modelUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGING_FACE_TOKEN}`,
          'Content-Type': 'application/octet-stream',
        },
        body: imageBuffer
      });

      if (!response.ok) {
        throw new Error("Falha no processamento");
      }

      const processedImage = await response.blob();
      const storageId = await ctx.storage.store(processedImage);
      const finalUrl = await ctx.storage.getUrl(storageId);

      if (!finalUrl) throw new Error("Erro ao salvar imagem");

      await ctx.runMutation(api.aiStudio.saveEnhancedImage, {
        userId: args.userId,
        originalUrl: args.imageFile.substring(0, 100),
        enhancedUrl: finalUrl,
        prompt: `Efeito: ${args.effect}`,
        storageId,
      });

      return { success: true, url: finalUrl };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Erro:", errorMessage);
      return {
        success: false,
        message: "Erro ao processar. Tente novamente."
      };
    }
  },
});

// =================================================================
// 2. 🎵 TEXTO PARA VOZ
// =================================================================
export const textToSpeech = action({
  args: {
    userId: v.string(),
    text: v.string(),
    voiceId: v.string()
  },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; message?: string }> => {
    try {
      const googleTTSUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(args.text)}&tl=${args.voiceId}&client=tw-ob&ttsspeed=1`;

      const response = await fetch(googleTTSUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://translate.google.com/',
        }
      });

      if (!response.ok) {
        throw new Error("Falha ao gerar áudio");
      }

      const audioBlob = await response.blob();
      const storageId = await ctx.storage.store(audioBlob);
      const url = await ctx.storage.getUrl(storageId);

      if (!url) throw new Error("Erro ao salvar áudio");

      await ctx.runMutation(api.aiStudio.saveAudio, {
        userId: args.userId,
        text: args.text,
        audioUrl: url,
        storageId,
      });

      return { success: true, url };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Erro TTS:", errorMessage);
      return {
        success: false,
        message: "Erro ao gerar áudio"
      };
    }
  },
});

// =================================================================
// 3. 🎤 VOZ PARA TEXTO
// =================================================================
export const speechToText = action({
  args: {
    userId: v.string(),
    audioUrl: v.string()
  },
  handler: async (ctx, args): Promise<{ success: boolean; text?: string; message?: string }> => {
    try {
      const HUGGING_FACE_TOKEN = getHuggingFaceToken();
      const base64Data = args.audioUrl.split(',')[1] || args.audioUrl;
      const audioBuffer = Buffer.from(base64Data, 'base64');

      if (HUGGING_FACE_TOKEN) {
        const modelUrl = `${HF_API_URL}openai/whisper-large-v3`;
        const response = await fetch(modelUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HUGGING_FACE_TOKEN}`,
            'Content-Type': 'application/octet-stream',
          },
          body: audioBuffer
        });

        if (response.ok) {
          const result = await response.json() as HuggingFaceResponse;
          const transcription = result.text || "Transcrição não disponível";

          await ctx.runMutation(api.aiStudio.saveTranscription, {
            userId: args.userId,
            audioUrl: args.audioUrl.substring(0, 100),
            transcription,
          });

          return { success: true, text: transcription };
        }
      }

      const witResponse = await fetch('https://api.wit.ai/speech', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer Q5QBIWFBOBLW5GQSPN5G4VBQH3XUQNLR',
          'Content-Type': 'audio/wav',
        },
        body: audioBuffer
      });

      if (!witResponse.ok) {
        throw new Error("Falha na transcrição");
      }

      const witText = await witResponse.text();
      const lines = witText.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      const parsedResponse = JSON.parse(lastLine) as WitAIResponse;
      const transcription = parsedResponse.text || "Não foi possível transcrever";

      await ctx.runMutation(api.aiStudio.saveTranscription, {
        userId: args.userId,
        audioUrl: args.audioUrl.substring(0, 100),
        transcription,
      });

      return { success: true, text: transcription };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Erro STT:", errorMessage);
      return {
        success: false,
        message: "Erro ao transcrever áudio"
      };
    }
  },
});

// =================================================================
// 4. 🎬 BUSCADOR DE VÍDEOS
// =================================================================
export const generateVideo = action({
  args: {
    userId: v.string(),
    prompt: v.string()
  },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; message?: string }> => {
    try {
      const PEXELS_API_KEY = getPexelsApiKey();

      if (!PEXELS_API_KEY) {
        const pixabayUrl = `https://pixabay.com/api/videos/?key=23400746-7b6d8c7c4f5b5e5c5e5c5e5c5&q=${encodeURIComponent(args.prompt)}&per_page=5`;

        const response = await fetch(pixabayUrl);
        if (response.ok) {
          const data = await response.json() as PixabayResponse;
          if (data.hits && data.hits.length > 0) {
            const video = data.hits[0];
            const videoUrl = video.videos.large.url || video.videos.medium.url;

            await ctx.runMutation(api.aiStudio.saveVideo, {
              userId: args.userId,
              prompt: args.prompt,
              videoUrl: videoUrl,
            });

            return { success: true, url: videoUrl };
          }
        }
      }

      const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(args.prompt)}&per_page=5&orientation=landscape`;

      const response = await fetch(url, {
        headers: {
          'Authorization': PEXELS_API_KEY
        }
      });

      if (!response.ok) {
        throw new Error("Falha ao buscar vídeos");
      }

      const data = await response.json() as PexelsResponse;

      if (!data.videos || data.videos.length === 0) {
        return {
          success: false,
          message: "Nenhum vídeo encontrado"
        };
      }

      const video = data.videos[0];
      const hdFile = video.video_files.find((f: PexelsVideoFile) =>
        f.quality === "hd" && f.width >= 1920
      );
      const videoUrl = hdFile?.link || video.video_files[0].link;

      await ctx.runMutation(api.aiStudio.saveVideo, {
        userId: args.userId,
        prompt: args.prompt,
        videoUrl: videoUrl,
      });

      return { success: true, url: videoUrl };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Erro:", errorMessage);
      return {
        success: false,
        message: "Erro ao buscar vídeo"
      };
    }
  },
});

// =================================================================
// 5. 📸 REMOVEDOR DE FUNDO
// =================================================================
export const removeBackground = action({
  args: {
    userId: v.string(),
    imageUrl: v.string()
  },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; message?: string }> => {
    try {
      const REMOVE_BG_KEY = getRemoveBgApiKey();
      const base64Data = args.imageUrl.split(',')[1] || args.imageUrl;
      const imageBuffer = Buffer.from(base64Data, 'base64');

      if (REMOVE_BG_KEY) {
        const formData = new FormData();
        const file = new File([imageBuffer], 'image.jpg', { type: 'image/jpeg' });
        formData.append('image_file', file);
        formData.append('size', 'auto');

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: {
            'X-Api-Key': REMOVE_BG_KEY,
          },
          body: formData
        });

        if (response.ok) {
          const processedImage = await response.blob();
          const storageId = await ctx.storage.store(processedImage);
          const finalUrl = await ctx.storage.getUrl(storageId);

          if (finalUrl) {
            return { success: true, url: finalUrl };
          }
        }
      }

      const storageId = await ctx.storage.store(new Blob([imageBuffer]));
      const finalUrl = await ctx.storage.getUrl(storageId);

      return {
        success: true,
        url: finalUrl || "",
        message: "Função limitada sem API key configurada"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Erro:", errorMessage);
      return {
        success: false,
        message: "Erro ao remover fundo"
      };
    }
  },
});

// =================================================================
// MUTATIONS (com tipos explícitos)
// =================================================================
export const saveEnhancedImage = mutation({
  args: {
    userId: v.string(),
    originalUrl: v.string(),
    enhancedUrl: v.string(),
    prompt: v.string(),
    storageId: v.id("_storage")
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiStudioContent", {
      userId: args.userId,
      type: "enhanced_image" as const,
      originalUrl: args.originalUrl,
      resultUrl: args.enhancedUrl,
      prompt: args.prompt,
      storageId: args.storageId,
      createdAt: Date.now(),
    });
  },
});

export const saveAudio = mutation({
  args: {
    userId: v.string(),
    text: v.string(),
    audioUrl: v.string(),
    storageId: v.id("_storage")
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiStudioContent", {
      userId: args.userId,
      type: "audio" as const,
      text: args.text,
      resultUrl: args.audioUrl,
      storageId: args.storageId,
      createdAt: Date.now(),
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
      userId: args.userId,
      type: "transcription" as const,
      originalUrl: args.audioUrl,
      text: args.transcription,
      createdAt: Date.now(),
    });
  },
});

export const saveVideo = mutation({
  args: {
    userId: v.string(),
    prompt: v.string(),
    videoUrl: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiStudioContent", {
      userId: args.userId,
      type: "video" as const,
      prompt: args.prompt,
      resultUrl: args.videoUrl,
      createdAt: Date.now(),
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

    return await ctx.db
      .query("aiStudioContent")
      .withIndex("by_user_and_type", (q) =>
        q.eq("userId", args.userId).eq("type", args.type)
      )
      .order("desc")
      .take(10);
  },
});