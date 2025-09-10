import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// =================================================================
// 🎯 TIPOS E INTERFACES
// =================================================================
interface PexelsVideoFile { id: number; quality: "hd" | "sd" | "hls"; file_type: string; width: number; height: number; link: string; fps?: number; }
interface PexelsVideo { id: number; width: number; height: number; duration: number; video_files: PexelsVideoFile[]; video_pictures: Array<{ id: number; picture: string; nr: number }>; }
interface PexelsResponse { page: number; per_page: number; total_results: number; videos: PexelsVideo[]; }
interface HuggingFaceResponse { text?: string; error?: string; } // Esta interface será usada agora

// =================================================================
// 🔒 CONFIGURAÇÃO SEGURA - TOKENS EM VARIÁVEIS DE AMBIENTE
// =================================================================
const getHuggingFaceToken = (): string => { const token = process.env.HUGGING_FACE_TOKEN; if (!token) console.warn("⚠️ HUGGING_FACE_TOKEN não configurado."); return token || ""; };
const getRemoveBgApiKey = (): string => { const key = process.env.REMOVE_BG_API_KEY; if (!key) console.warn("⚠️ REMOVE_BG_API_KEY não configurado."); return key || ""; };
const getPexelsApiKey = (): string => { const key = process.env.PEXELS_API_KEY; if (!key) console.warn("⚠️ PEXELS_API_KEY não configurado."); return key || ""; };

// Função auxiliar para converter base64 em Blob
const base64ToBlob = (base64: string): Blob => {
  const match = base64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)/);
  if (!match) { throw new Error('Invalid base64 string'); }
  const contentType = match[1];
  const base64Data = match[2];
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) { byteNumbers[i] = byteCharacters.charCodeAt(i); }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
};

// =================================================================
// 1. 🎨 APRIMORADOR DE IMAGENS (COM AUTENTICAÇÃO OBRIGATÓRIA)
// =================================================================
export const enhanceImage = action({
  args: { userId: v.string(), imageFile: v.string(), effect: v.string() },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; message?: string }> => {
    try {
      const imageBlob = base64ToBlob(args.imageFile);
      const HUGGING_FACE_TOKEN = getHuggingFaceToken();

      if (!HUGGING_FACE_TOKEN) {
        return { success: false, message: "A chave de API da Hugging Face não foi configurada. Esta função requer autenticação." };
      }

      let modelUrl: string;
      switch (args.effect) {
        case 'upscale': modelUrl = `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-refiner-1.0`; break;
        case 'cartoon': modelUrl = `https://api-inference.huggingface.co/models/AstroCorp/Astro-Toonify`; break;
        default: modelUrl = `https://api-inference.huggingface.co/models/tencentarc/gfpgan`; break;
      }

      const response = await fetch(modelUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Authorization': `Bearer ${HUGGING_FACE_TOKEN}`
        },
        body: imageBlob
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Hugging Face falhou com status ${response.status}:`, errorBody);
        throw new Error("Erro de processamento com a API da Hugging Face. Verifique sua chave de API ou o status do modelo.");
      }

      const processedImage = await response.blob();
      const storageId = await ctx.storage.store(processedImage);
      const finalUrl = await ctx.storage.getUrl(storageId);
      if (!finalUrl) throw new Error("Erro ao salvar imagem processada.");

      await ctx.runMutation(api.aiStudio.saveEnhancedImage, { userId: args.userId, originalUrl: args.imageFile.substring(0, 100), enhancedUrl: finalUrl, prompt: `Efeito: ${args.effect}`, storageId });
      return { success: true, url: finalUrl };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Erro em enhanceImage:", errorMessage);
      return { success: false, message: errorMessage };
    }
  },
});

// =================================================================
// 2. 🎵 TEXTO PARA VOZ (ALTA QUALIDADE E GRATUITO DA META/FACEBOOK)
// =================================================================
export const textToSpeech = action({
  args: { userId: v.string(), text: v.string() },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; message?: string }> => {
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/facebook/mms-tts-por",
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inputs: args.text }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Erro da API de Áudio da Hugging Face:", errorBody);
        throw new Error("O modelo de áudio está sobrecarregado. Tente novamente.");
      }

      const audioBlob = await response.blob();
      const storageId = await ctx.storage.store(audioBlob);
      const url = await ctx.storage.getUrl(storageId);
      if (!url) throw new Error("Erro ao salvar o áudio.");

      await ctx.runMutation(api.aiStudio.saveAudio, { userId: args.userId, text: args.text, resultUrl: url, storageId });
      return { success: true, url };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Erro TTS:", errorMessage);
      return { success: false, message: errorMessage };
    }
  },
});

// =================================================================
// 3. 🎤 VOZ PARA TEXTO
// =================================================================
export const speechToText = action({
  args: { userId: v.string(), audioUrl: v.string() },
  handler: async (ctx, args): Promise<{ success: boolean; text?: string; message?: string }> => {
    try {
      const audioBlob = base64ToBlob(args.audioUrl);
      const HUGGING_FACE_TOKEN = getHuggingFaceToken();
      if (!HUGGING_FACE_TOKEN) { return { success: false, message: "A chave da API da Hugging Face é necessária para transcrição." }; }

      const response = await fetch(`https://api-inference.huggingface.co/models/openai/whisper-large-v3`, { method: 'POST', headers: { 'Authorization': `Bearer ${HUGGING_FACE_TOKEN}`, 'Content-Type': 'application/octet-stream' }, body: audioBlob });
      if (response.ok) {
        // ▼▼▼ AQUI ESTÁ A CORREÇÃO ▼▼▼
        const result = await response.json() as HuggingFaceResponse;
        const transcription = result.text || "Transcrição não disponível";
        await ctx.runMutation(api.aiStudio.saveTranscription, { userId: args.userId, audioUrl: args.audioUrl.substring(0, 100), transcription });
        return { success: true, text: transcription };
      }
      throw new Error("API de transcrição indisponível.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Erro STT:", errorMessage);
      return { success: false, message: "Erro ao transcrever áudio" };
    }
  },
});

// =================================================================
// 4. 🎬 BUSCADOR DE VÍDEOS
// =================================================================
export const generateVideo = action({
  args: { userId: v.string(), prompt: v.string() },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; message?: string }> => {
    try {
      const PEXELS_API_KEY = getPexelsApiKey();
      if (!PEXELS_API_KEY) { return { success: false, message: "A chave da API da Pexels não está configurada." }; }
      const response = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(args.prompt)}&per_page=5&orientation=landscape`, { headers: { 'Authorization': PEXELS_API_KEY } });
      if (response.ok) {
        const data = await response.json() as PexelsResponse;
        if (data.videos?.length > 0) {
          const video = data.videos[0];
          const hdFile = video.video_files.find(f => f.quality === "hd" && f.width >= 1920);
          const videoUrl = hdFile?.link || video.video_files[0].link;
          await ctx.runMutation(api.aiStudio.saveVideo, { userId: args.userId, prompt: args.prompt, resultUrl: videoUrl });
          return { success: true, url: videoUrl };
        }
      }
      return { success: false, message: "Nenhum vídeo encontrado." };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Erro em generateVideo:", errorMessage);
      return { success: false, message: "Erro ao buscar vídeo" };
    }
  },
});

// =================================================================
// 5. 📸 REMOVEDOR DE FUNDO
// =================================================================
export const removeBackground = action({
  args: { userId: v.string(), imageUrl: v.string() },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; message?: string }> => {
    try {
      const imageBlob = base64ToBlob(args.imageUrl);
      const REMOVE_BG_KEY = getRemoveBgApiKey();
      if (!REMOVE_BG_KEY) { return { success: false, message: "A chave da API Remove.bg não está configurada." }; }
      const formData = new FormData();
      formData.append('image_file', imageBlob, 'image.png');
      formData.append('size', 'auto');
      const response = await fetch('https://api.remove.bg/v1.0/removebg', { method: 'POST', headers: { 'X-Api-Key': REMOVE_BG_KEY }, body: formData });
      if (!response.ok) {
        console.error("Erro da API remove.bg:", await response.text());
        throw new Error("Falha ao remover o fundo da imagem");
      }
      const processedImage = await response.blob();
      const storageId = await ctx.storage.store(processedImage);
      const finalUrl = await ctx.storage.getUrl(storageId);
      if (finalUrl) { return { success: true, url: finalUrl }; }
      throw new Error("Falha ao salvar a imagem processada.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Erro em removeBackground:", errorMessage);
      return { success: false, message: "Erro ao remover fundo" };
    }
  },
});

// =================================================================
// MUTATIONS E QUERIES
// =================================================================
export const saveEnhancedImage = mutation({ args: { userId: v.string(), originalUrl: v.string(), enhancedUrl: v.string(), prompt: v.string(), storageId: v.id("_storage") }, handler: async (ctx, args) => await ctx.db.insert("aiStudioContent", { ...args, type: "enhanced_image", resultUrl: args.enhancedUrl, createdAt: Date.now() }), });
export const saveAudio = mutation({ args: { userId: v.string(), text: v.string(), resultUrl: v.string(), storageId: v.id("_storage") }, handler: async (ctx, args) => { return await ctx.db.insert("aiStudioContent", { ...args, type: "audio", createdAt: Date.now() }); }, });
export const saveTranscription = mutation({ args: { userId: v.string(), audioUrl: v.string(), transcription: v.string() }, handler: async (ctx, args) => await ctx.db.insert("aiStudioContent", { userId: args.userId, type: "transcription", originalUrl: args.audioUrl, text: args.transcription, createdAt: Date.now() }), });
export const saveVideo = mutation({ args: { userId: v.string(), prompt: v.string(), resultUrl: v.string() }, handler: async (ctx, args) => { return await ctx.db.insert("aiStudioContent", { ...args, type: "video", createdAt: Date.now() }); }, });
export const getUserContent = query({ args: { userId: v.string(), type: v.union(v.literal("enhanced_image"), v.literal("audio"), v.literal("transcription"), v.literal("video")) }, handler: async (ctx, args) => { if (!args.userId) return []; return await ctx.db.query("aiStudioContent").withIndex("by_user_and_type", (q) => q.eq("userId", args.userId).eq("type", args.type)).order("desc").take(10); }, });