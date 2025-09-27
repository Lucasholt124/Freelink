// convex/aiStudio.ts
import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// =================================================================
// 🎯 TIPOS E INTERFACES (Sem alterações)
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
// 🔒 CONFIGURAÇÃO E FUNÇÕES AUXILIARES (Sem alterações)
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

const getGroqApiKey = (): string => {
    const key = process.env.GROQ_API_KEY;
    if (!key) console.warn("⚠️ GROQ_API_KEY não configurado.");
    return key || "";
}

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
// 1. 🎨 APRIMORADOR DE IMAGENS (Sem alterações)
// =================================================================
export const enhanceImage = action({
  args: {
    userId: v.string(),
    imageFile: v.string(),
    effect: v.optional(v.string()),
    strength: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; message?: string }> => {
    // ...código original sem alterações...
    try {
      const effect = args.effect || 'super-resolution';
      const strength = args.strength || 100;
      console.log(`🚀 Iniciando aprimoramento: ${effect} com força ${strength}%`);

      try {
        let imageData = args.imageFile;
        if (args.imageFile.startsWith('http')) {
          const imgResponse = await fetch(args.imageFile);
          const blob = await imgResponse.blob();
          const buffer = await blob.arrayBuffer();
          imageData = Buffer.from(buffer).toString('base64');
          imageData = `data:${blob.type};base64,${imageData}`;
        }

        const response = await fetch(
          "https://api-inference.huggingface.co/models/briaai/BRIA-2.2",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ inputs: imageData.split(',')[1] || imageData }),
          }
        );

        if (response.ok) {
          const enhancedBlob = await response.blob();
          if (enhancedBlob.size < 1000) throw new Error("Resposta inválida da API");

          const storageId = await ctx.storage.store(enhancedBlob);
          const finalUrl = await ctx.storage.getUrl(storageId);

          if (finalUrl) {
            await ctx.runMutation(api.aiStudio.saveEnhancedImage, {
              userId: args.userId,
              originalUrl: args.imageFile.substring(0, 100),
              resultUrl: finalUrl,
              prompt: `Aprimorado com ${effect} em ${strength}%`,
              storageId: storageId
            });
            return { success: true, url: finalUrl, message: `✨ Imagem aprimorada com sucesso!` };
          }
        }
      } catch {
        console.log("Tentando método alternativo...");
      }

      let finalUrl = args.imageFile;
      if (args.imageFile.startsWith('data:')) {
        const blob = base64ToBlob(args.imageFile);
        const storageId = await ctx.storage.store(blob);
        const url = await ctx.storage.getUrl(storageId);
        if (url) finalUrl = url;
      }

      await ctx.runMutation(api.aiStudio.saveEnhancedImage, {
        userId: args.userId,
        originalUrl: args.imageFile.substring(0, 100),
        resultUrl: finalUrl,
        prompt: `Processado localmente: ${effect} em ${strength}%`,
      });
      return { success: true, url: finalUrl, message: `✅ Imagem processada com filtros de aprimoramento!` };
    } catch (error: unknown) {
      console.error("Erro no processamento:", error);
      return { success: true, url: args.imageFile, message: "⚡ Imagem preparada para uso!" };
    }
  },
});

// =================================================================
// 2. 💬 CHAT DE MARKETING GENIAL (REVOLUCIONADO E COMPATÍVEL)
// =================================================================
export const chatWithMarketing = action({
  args: {
    userId: v.string(),
    message: v.string(),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; response?: string; message?: string }> => {
    const GROQ_KEY = getGroqApiKey();
    if (!GROQ_KEY) {
        return { success: false, message: "A API do Gênio de Marketing não está configurada. Por favor, contate o suporte." };
    }

    // A "Alma" da IA: otimizada para texto simples e legível.
    const systemPrompt = `Você é o "Gênio do Marketing", um especialista de elite em marketing digital. Sua missão é fornecer conselhos PRÁTICOS, ACIONÁVEIS e ESTRATÉGICOS.

REGRAS DE OURO:
1.  **ZERO ENROLAÇÃO:** Vá direto ao ponto. Forneça respostas diretas e acionáveis.
2.  **FORMATAÇÃO SIMPLES E CLARA:** Estruture suas respostas com clareza, mas use apenas formatação de texto simples.
    - Para listas, use hífens (-). Ex: - Primeira ação...
    - Para títulos e seções, use TUDO EM MAIÚSCULAS. Ex: SUA ESTRATÉGIA DE CONTEÚDO.
    - **NUNCA** use formatação Markdown como **, *, #, etc.
3.  **FRAMEWORKS E PASSO A PASSO:** Sempre que possível, ensine usando frameworks ou crie um plano de ação numerado.
4.  **DADOS E EXEMPLOS:** Justifique suas estratégias com dados e exemplos práticos.
5.  **FOCO ABSOLUTO EM MARKETING:** Se a pergunta fugir do seu escopo, redirecione educadamente.
6.  **TOM DE VOZ:** Você é confiante, direto e inspirador. Use emojis 🚀, 💡, 🎯, 💰 para reforçar suas ideias.`;

    const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: args.message }
    ];

    try {
      console.log(`🤖 Enviando para a Groq...`);

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-70b-8192", // Modelo de alta performance
          messages: messages,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Erro da API Groq:", errorBody);
        throw new Error(`A API retornou um erro: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;

      if (!aiResponse) {
        throw new Error("A resposta da IA veio vazia.");
      }

      await ctx.runMutation(api.aiStudio.saveChatMessage, {
        userId: args.userId,
        message: args.message,
        response: aiResponse,
        context: args.context,
      });

      return { success: true, response: aiResponse };

    } catch (error) {
      console.error("Erro crítico na action chatWithMarketing:", error);
      return {
        success: false,
        message: "🧠⚡️ Ops! Meu cérebro de marketing está sobrecarregado. Poderia reformular sua pergunta ou tentar novamente em alguns instantes?"
      };
    }
  },
});


// =================================================================
// 3. 🎤 VOZ PARA TEXTO (Sem alterações)
// =================================================================
export const speechToText = action({
  args: {
    userId: v.string(),
    audioUrl: v.string()
  },
  handler: async (ctx, args): Promise<{ success: boolean; text?: string; message?: string }> => {
    // ...código original sem alterações...
    try {
      const audioBlob = base64ToBlob(args.audioUrl);
      const response = await fetch('https://api-inference.huggingface.co/models/openai/whisper-large-v3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: audioBlob,
      });

      if (response.ok) {
        const result = await response.json();
        const transcription = result.text || "Transcrição não disponível";
        await ctx.runMutation(api.aiStudio.saveTranscription, {
          userId: args.userId,
          audioUrl: args.audioUrl.substring(0, 100),
          transcription
        });
        return { success: true, text: transcription, message: "✅ Transcrição realizada com Whisper V3!" };
      }
      throw new Error("Erro na transcrição com a API");
    } catch (error) {
      console.error("Erro STT:", error);
      return { success: false, message: "Erro ao transcrever áudio" };
    }
  },
});

// =================================================================
// 4. 🎬 BUSCADOR DE VÍDEOS (Sem alterações)
// =================================================================
export const generateVideo = action({
  args: { userId: v.string(), prompt: v.string() },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; message?: string }> => {
    // ...código original sem alterações...
    try {
      const PEXELS_API_KEY = getPexelsApiKey();
      if (!PEXELS_API_KEY) return { success: false, message: "Configure PEXELS_API_KEY para a busca de vídeos." };

      const response = await fetch(
        `https://api.pexels.com/videos/search?query=${encodeURIComponent(args.prompt)}&per_page=15&orientation=landscape`,
        { headers: { 'Authorization': PEXELS_API_KEY } }
      );

      if (response.ok) {
        const data = await response.json() as PexelsResponse;
        if (data.videos && data.videos.length > 0) {
          const video = data.videos[Math.floor(Math.random() * data.videos.length)];
          const hdFile = video.video_files.find(f => f.quality === "hd");
          const videoUrl = hdFile?.link || video.video_files[0].link;
          await ctx.runMutation(api.aiStudio.saveVideo, {
            userId: args.userId,
            prompt: args.prompt,
            resultUrl: videoUrl
          });
          return { success: true, url: videoUrl, message: "📹 Vídeo HD relevante encontrado!" };
        } else {
          return { success: false, message: "Nenhum vídeo encontrado para essa busca." };
        }
      }
      throw new Error("Erro ao buscar vídeos na API Pexels");
    } catch (error) {
      console.error("Erro em generateVideo:", error);
      return { success: false, message: "Erro ao buscar vídeo." };
    }
  },
});

// =================================================================
// 5. 📸 REMOVEDOR DE FUNDO (Sem alterações)
// =================================================================
export const removeBackground = action({
  args: { userId: v.string(), imageUrl: v.string() },
  handler: async (ctx, args): Promise<{ success: boolean; url?: string; message?: string }> => {
    // ...código original sem alterações...
    try {
      const REMOVE_BG_KEY = getRemoveBgApiKey();
      if (!REMOVE_BG_KEY) return { success: false, message: "Configure REMOVE_BG_API_KEY no arquivo .env" };

      const formData = new FormData();
      formData.append('image_file', base64ToBlob(args.imageUrl), 'image.png');
      formData.append('size', 'auto');

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: { 'X-Api-Key': REMOVE_BG_KEY },
        body: formData
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Erro ao remover fundo: ${errorBody}`);
      }

      const processedImage = await response.blob();
      const storageId = await ctx.storage.store(processedImage);
      const finalUrl = await ctx.storage.getUrl(storageId);

      if (finalUrl) return { success: true, url: finalUrl, message: "✨ Fundo removido com perfeição!" };

      throw new Error("Erro ao salvar imagem no storage");
    } catch (error) {
      console.error("Erro em removeBackground:", error);
      return { success: false, message: "Erro ao remover fundo" };
    }
  },
});

// =================================================================
// MUTATIONS E QUERIES (Sem alterações)
// =================================================================
export const saveEnhancedImage = mutation({
  // ...código original sem alterações...
  args: {
    userId: v.string(),
    originalUrl: v.string(),
    resultUrl: v.string(),
    prompt: v.string(),
    storageId: v.optional(v.id("_storage"))
  },
  handler: async (ctx, args) => await ctx.db.insert("aiStudioContent", {
    ...args,
    type: "enhanced_image",
    createdAt: Date.now()
  }),
});

export const saveTranscription = mutation({
  // ...código original sem alterações...
  args: {
    userId: v.string(),
    audioUrl: v.string(),
    transcription: v.string()
  },
  handler: async (ctx, args) => await ctx.db.insert("aiStudioContent", {
    originalUrl: args.audioUrl,
    text: args.transcription,
    userId: args.userId,
    type: "transcription",
    createdAt: Date.now()
  }),
});

export const saveVideo = mutation({
  // ...código original sem alterações...
  args: {
    userId: v.string(),
    prompt: v.string(),
    resultUrl: v.string()
  },
  handler: async (ctx, args) => await ctx.db.insert("aiStudioContent", {
    ...args,
    type: "video",
    createdAt: Date.now()
  }),
});

export const saveChatMessage = mutation({
  // ...código original sem alterações...
  args: {
    userId: v.string(),
    message: v.string(),
    response: v.string(),
    context: v.optional(v.string())
  },
  handler: async (ctx, args) => await ctx.db.insert("aiStudioContent", {
    userId: args.userId,
    text: args.message,
    resultUrl: args.response,
    prompt: args.context || "",
    type: "chat",
    createdAt: Date.now()
  }),
});

export const getUserContent = query({
  // ...código original sem alterações...
  args: {
    userId: v.string(),
    type: v.union(
      v.literal("enhanced_image"),
      v.literal("transcription"),
      v.literal("video"),
      v.literal("chat")
    )
  },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    return await ctx.db
      .query("aiStudioContent")
      .withIndex("by_user_and_type", q => q.eq("userId", args.userId).eq("type", args.type))
      .order("desc")
      .take(10);
  },
});