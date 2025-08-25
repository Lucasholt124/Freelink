// Em /convex/imageGenerator.ts
import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

if (!process.env.DEEPAI_API_KEY) {
  throw new Error("DEEPAI_API_KEY não configurada no painel Convex.");
}

export const generateImage = action({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Usuário não autenticado.");
    }
    const userId = identity.subject;

    // ===============================================================
    // ▼▼▼ LÓGICA DE VERIFICAÇÃO DE PLANO (SIMPLIFICADA) ▼▼▼
    // ===============================================================
    // No futuro, você irá consultar seu banco de dados aqui para buscar o plano do usuário.
    // Por enquanto, vamos deixar esta lógica pendente para não causar erros.
    // Exemplo de como seria:
    // const user = await ctx.db.query("users").withIndex("by_clerk_id", q => q.eq("clerkId", userId)).unique();
    // if (user?.plan === 'free') {
    //   throw new Error("Acesso negado. Esta é uma funcionalidade premium.");
    // }
    // ===============================================================

    const response = await fetch("https://api.deepai.org/api/text2img", {
      method: "POST",
      headers: {
        "api-key": process.env.DEEPAI_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: args.prompt,
        grid_size: "1",
        width: "1024",
        height: "1024",
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Falha na API da DeepAI: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    const imageUrl = data.output_url;

    if (!imageUrl) {
      throw new Error("A API da DeepAI não retornou uma URL de imagem.");
    }

    // A chamada para a mutação interna está correta e vai funcionar após a sincronização
    await ctx.runMutation(internal.imageGenerator.saveGeneratedImage, {
      userId,
      prompt: args.prompt,
      imageUrl: imageUrl,
    });

    return imageUrl;
  },
});

export const saveGeneratedImage = internalMutation({
  args: {
    userId: v.string(),
    prompt: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("generatedImages", {
      userId: args.userId,
      prompt: args.prompt,
      imageUrl: args.imageUrl,
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