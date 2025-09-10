import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// =================================================================
// 1. APRIMORADOR DE IMAGENS (com Cloudinary URL-based API)
// =================================================================
export const enhanceImage = action({
  args: { userId: v.string(), imageUrl: v.string(), prompt: v.string() },
  handler: async (ctx, args) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (!cloudName) throw new Error("Cloud Name do Cloudinary não configurado.");

    try {
      // O truque aqui é usar o serviço de "fetch" do Cloudinary para buscar uma imagem externa
      // e aplicar transformações nela, tudo via URL. É um método HTTPS direto.
      const transformations = "e_improve,w_800,h_800,c_fill,q_auto,f_auto"; // 'e_improve' melhora a imagem
      const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/fetch/${transformations}/${args.imageUrl}`;

      // Apenas para salvar, precisamos do blob
      const response = await fetch(cloudinaryUrl);
      const blob = await response.blob();
      const storageId = await ctx.storage.store(blob);
      const finalUrl = await ctx.storage.getUrl(storageId);
      if (!finalUrl) throw new Error("Não foi possível salvar a imagem aprimorada.");

      await ctx.runMutation(api.aiStudio.saveEnhancedImage, {
        userId: args.userId, originalUrl: args.imageUrl, enhancedUrl: finalUrl,
        prompt: "Imagem aprimorada", storageId,
      });

      return { success: true, url: finalUrl };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido ao aprimorar imagem.";
      console.error("Erro ao aprimorar imagem com Cloudinary:", message);
      return { success: false, message };
    }
  },
});

// =================================================================
// 2. TEXTO PARA ÁUDIO (com Endpoints Públicos)
// =================================================================
export const textToSpeech = action({
  args: { userId: v.string(), text: v.string(), voiceId: v.string() },
  handler: async (ctx, args) => {
    try {
      // Usamos o endpoint público e direto do Google Translate, que é robusto.
      // O voiceId aqui é a URL do endpoint.
      const ttsUrl = args.voiceId.replace('{text}', encodeURIComponent(args.text));

      const response = await fetch(ttsUrl, {
          headers: { // Alguns endpoints precisam de um User-Agent para não bloquear
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
      });
      if (!response.ok) throw new Error("Falha ao contatar o serviço de áudio.");

      const audioBlob = await response.blob();
      const storageId = await ctx.storage.store(audioBlob);
      const url = await ctx.storage.getUrl(storageId);
      if (!url) throw new Error("Não foi possível salvar o áudio.");

      await ctx.runMutation(api.aiStudio.saveAudio, {
        userId: args.userId, text: args.text, audioUrl: url, storageId,
      });

      return { success: true, url };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido ao gerar áudio.";
      console.error("Erro ao gerar áudio:", message);
      return { success: false, message };
    }
  },
});

// =================================================================
// 3. ÁUDIO PARA TEXTO (Mantendo Wit.ai - é o mais estável e gratuito)
// =================================================================
export const speechToText = action({
  args: { userId: v.string(), audioUrl: v.string() },
  handler: async (ctx, args) => {
    // Para transcrição, não há um "endpoint público" simples.
    // O Wit.ai com token de demo é a opção gratuita mais confiável e direta que existe.
    try {
      const witAiToken = 'Q5QBIWFBOBLW5GQSPN5G4VBQH3XUQNLR'; // Token público para demo
      const audioResponse = await fetch(args.audioUrl);
      const audioBlob = await audioResponse.blob();
      const response = await fetch('https://api.wit.ai/speech', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${witAiToken}`, 'Content-Type': audioBlob.type },
        body: audioBlob,
      });

      if (!response.ok) throw new Error(`Wit.ai falhou: ${await response.text()}`);

      const resultText = await response.text();
      const lines = resultText.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      const transcription = JSON.parse(lastLine).text;

      await ctx.runMutation(api.aiStudio.saveTranscription, {
        userId: args.userId, audioUrl: args.audioUrl, transcription,
      });
      return { success: true, text: transcription };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha na transcrição.";
      console.error("Erro ao transcrever:", message);
      return { success: false, message };
    }
  },
});

type PexelsVideoFile = {
  id: number;
  quality: "hd" | "sd" | "hls";
  file_type: string;
  width: number;
  height: number;
  link: string;
  fps?: number;
};

// =================================================================
// 4. BUSCADOR DE VÍDEOS (com Pexels API - estável e de alta qualidade)
// =================================================================
export const generateVideo = action({
  args: { userId: v.string(), prompt: v.string() },
  handler: async (ctx, args) => {
    const pexelsApiKey = process.env.PEXELS_API_KEY;
    if (!pexelsApiKey) throw new Error("API Key da Pexels não configurada.");

    try {
      const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(args.prompt)}&per_page=1&orientation=landscape`;
      const response = await fetch(url, { headers: { 'Authorization': pexelsApiKey } });

      if (!response.ok) throw new Error("Pexels API falhou.");

      const data = await response.json();
      if (data.videos.length === 0) return { success: false, message: "Nenhum vídeo encontrado." };

      const video = data.videos[0];
      const videoUrl = video.video_files.find((f: PexelsVideoFile) => f.quality === "hd")?.link || video.video_files[0].link;

      await ctx.runMutation(api.aiStudio.saveVideo, {
        userId: args.userId, prompt: args.prompt, videoUrl: videoUrl,
      });

      return { success: true, url: videoUrl };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido ao buscar vídeo.";
      console.error("Erro ao buscar vídeo:", message);
      return { success: false, message };
    }
  },
});

// =================================================================
// MUTATIONS E QUERIES (sem alterações)
// =================================================================
export const saveEnhancedImage = mutation({
  args: { userId: v.string(), originalUrl: v.string(), enhancedUrl: v.string(), prompt: v.string(), storageId: v.id("_storage") },
  handler: (ctx, args) => ctx.db.insert("aiStudioContent", { userId: args.userId, type: "enhanced_image", originalUrl: args.originalUrl, resultUrl: args.enhancedUrl, prompt: args.prompt, storageId: args.storageId, createdAt: Date.now() }),
});
export const saveAudio = mutation({
  args: { userId: v.string(), text: v.string(), audioUrl: v.string(), storageId: v.id("_storage") },
  handler: (ctx, args) => ctx.db.insert("aiStudioContent", { userId: args.userId, type: "audio", text: args.text, resultUrl: args.audioUrl, storageId: args.storageId, createdAt: Date.now() }),
});
export const saveTranscription = mutation({
  args: { userId: v.string(), audioUrl: v.string(), transcription: v.string() },
  handler: (ctx, args) => ctx.db.insert("aiStudioContent", { userId: args.userId, type: "transcription", originalUrl: args.audioUrl, text: args.transcription, createdAt: Date.now() }),
});
export const saveVideo = mutation({
  args: { userId: v.string(), prompt: v.string(), videoUrl: v.string() },
  handler: (ctx, args) => ctx.db.insert("aiStudioContent", { userId: args.userId, type: "video", prompt: args.prompt, resultUrl: args.videoUrl, createdAt: Date.now() }),
});
export const getUserContent = query({
  args: { userId: v.string(), type: v.union(
    v.literal("enhanced_image"),
    v.literal("audio"),
    v.literal("transcription"),
    v.literal("video")
  ) },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    return await ctx.db.query("aiStudioContent")
      .withIndex("by_user_and_type", (q) => q.eq("userId", args.userId).eq("type", args.type))
      .order("desc").take(10);
  },
});