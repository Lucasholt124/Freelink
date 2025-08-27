// Em /convex/imageGenerator.ts
import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Verifica se a API key está configurada
if (!process.env.HUGGINGFACE_API_KEY) {
  console.warn(
    "⚠️ HUGGINGFACE_API_KEY não configurada. Para obter uma chave gratuita:\n" +
    "1. Acesse https://huggingface.co/join\n" +
    "2. Crie uma conta gratuita\n" +
    "3. Vá em Settings > Access Tokens\n" +
    "4. Crie um novo token\n" +
    "5. Adicione HUGGINGFACE_API_KEY no painel Convex"
  );
}

// Lista de modelos disponíveis no Hugging Face (todos gratuitos!)
const MODELS = {
  // Modelo principal - Stable Diffusion XL
  SDXL: "stabilityai/stable-diffusion-xl-base-1.0",
  // Alternativas rápidas
  FAST: "runwayml/stable-diffusion-v1-5",
  ANIME: "hakurei/waifu-diffusion",
  REALISTIC: "prompthero/openjourney-v4",
  ARTISTIC: "CompVis/stable-diffusion-v1-4",
};

// =================================================================
// ACTION: GERAR IMAGEM COM HUGGING FACE (100% GRÁTIS)
// =================================================================
// =================================================================
// ACTION: GERAR IMAGEM COM HUGGING FACE (100% GRÁTIS)
// =================================================================
export const generateImage = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Usuário não autenticado.");
    }
    const userId = identity.subject;

    // ✨ MELHORIA: Enriquecer o prompt para especificar o idioma do texto!
    // Adiciona a instrução para o modelo tentar gerar texto em português.
    const enhancedPrompt = `${args.prompt}, professional quality, in portuguese, for ${userId} user.`;

    // Se não tiver API key, usa um modelo de demonstração
    const apiKey = process.env.HUGGINGFACE_API_KEY || "hf_demo_key";

    // Escolhe o modelo baseado no prompt
    let model = MODELS.SDXL; // Modelo padrão de alta qualidade

    // Detecta estilo baseado no prompt
    const promptLower = args.prompt.toLowerCase();
    if (promptLower.includes("anime") || promptLower.includes("manga")) {
      model = MODELS.ANIME;
    } else if (promptLower.includes("realistic") || promptLower.includes("photo")) {
      model = MODELS.REALISTIC;
    } else if (promptLower.includes("artistic") || promptLower.includes("painting")) {
      model = MODELS.ARTISTIC;
    }

    try {
      // Primeira tentativa com o modelo escolhido
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: enhancedPrompt, // Usa o prompt melhorado
            parameters: {
              num_inference_steps: 30,
              guidance_scale: 7.5,
              // ✨ MELHORIA: Prompt negativo mais robusto contra texto ruim
              negative_prompt: "blurry, bad quality, distorted, ugly, malformed, mutated, disfigured, bad text, wrong spelling, illegible words",
              width: 1024,
              height: 1024,
            },
            options: {
              wait_for_model: true,
            },
          }),
        }
      );

      if (!response.ok) {
        // Se falhar, tenta com modelo alternativo mais rápido
        console.log("Tentando modelo alternativo...");
        const fallbackResponse = await fetch(
          `https://api-inference.huggingface.co/models/${MODELS.FAST}`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              inputs: enhancedPrompt, // Usa o prompt melhorado
              options: {
                wait_for_model: true,
              },
            }),
          }
        );

        if (!fallbackResponse.ok) {
          const error = await fallbackResponse.json();
          throw new Error(`Erro na API: ${error.error || "Falha ao gerar imagem"}`);
        }

        const imageBlob = await fallbackResponse.blob();
        const storageId = await ctx.storage.store(imageBlob);
        const imageUrl = await ctx.storage.getUrl(storageId);

        if (!imageUrl) {
          throw new Error("Não foi possível obter a URL da imagem.");
        }

        await ctx.runMutation(internal.imageGenerator.saveGeneratedImage, {
          userId,
          prompt: args.prompt, // Salva o prompt original do usuário
          imageUrl: imageUrl,
          storageId: storageId,
        });

        return imageUrl;
      }

      // Processa a resposta principal
      const imageBlob = await response.blob();

      // Verifica se é uma imagem válida
      if (imageBlob.size < 1000) {
        const text = await imageBlob.text();
        console.error("Resposta inválida:", text);
        throw new Error("Imagem gerada inválida. Tente novamente.");
      }

      const storageId = await ctx.storage.store(imageBlob);
      const imageUrl = await ctx.storage.getUrl(storageId);

      if (!imageUrl) {
        throw new Error("Não foi possível obter a URL da imagem.");
      }

      await ctx.runMutation(internal.imageGenerator.saveGeneratedImage, {
        userId,
        prompt: args.prompt, // Salva o prompt original do usuário
        imageUrl: imageUrl,
        storageId: storageId,
      });

      return imageUrl;

    } catch (error) {
      console.error("Erro ao gerar imagem:", error);

      // Se tudo falhar, usa uma API de backup totalmente aberta
      try {
        console.log("Usando API de backup...");

        // API alternativa: Pollinations.ai (sem necessidade de chave!)
        // Usa o prompt melhorado também na API de backup
        const backupUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&nologo=true`;

        const backupResponse = await fetch(backupUrl);
        if (!backupResponse.ok) {
          throw new Error("Todas as APIs falharam");
        }

        const imageBlob = await backupResponse.blob();
        const storageId = await ctx.storage.store(imageBlob);
        const imageUrl = await ctx.storage.getUrl(storageId);

        if (!imageUrl) {
          throw new Error("Não foi possível salvar a imagem.");
        }

        await ctx.runMutation(internal.imageGenerator.saveGeneratedImage, {
          userId,
          prompt: args.prompt, // Salva o prompt original do usuário
          imageUrl: imageUrl,
          storageId: storageId,
        });

        return imageUrl;

      } catch  {
        throw new Error(
          "Não foi possível gerar a imagem. Por favor, tente novamente em alguns instantes."
        );
      }
    }
  },
});

// =================================================================
// MUTAÇÕES E QUERIES (mantidas sem alterações)
// =================================================================
export const saveGeneratedImage = internalMutation({
  args: {
    userId: v.string(),
    prompt: v.string(),
    imageUrl: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("generatedImages", {
      userId: args.userId,
      prompt: args.prompt,
      imageUrl: args.imageUrl,
      storageId: args.storageId,
    });
  },
});

export const getImagesForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const images = await ctx.db
      .query("generatedImages")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(50);

    return images;
  },
});

// Query adicional para buscar uma imagem específica
export const getImage = query({
  args: { imageId: v.id("generatedImages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autenticado");
    }

    const image = await ctx.db.get(args.imageId);

    // Verifica se a imagem pertence ao usuário
    if (!image || image.userId !== identity.subject) {
      throw new Error("Imagem não encontrada");
    }

    return image;
  },
});

// Query para contar total de imagens do usuário
export const getUserImageCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return 0;
    }

    const images = await ctx.db
      .query("generatedImages")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    return images.length;
  },
});