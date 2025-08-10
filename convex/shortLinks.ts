// Crie este novo arquivo em: convex/shortLinks.ts

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Função para gerar um slug aleatório e curto.
 * @returns Uma string aleatória de 6 caracteres.
 */
function generateRandomSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// --- MUTATION para criar um novo link encurtado ---
export const createShortLink = mutation({
  args: {
    originalUrl: v.string(),
    customSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Usuário não autenticado.");
    }
    const userId = identity.subject;

    let slugToUse: string;

    // 1. Lida com o slug (personalizado ou aleatório)
    if (args.customSlug) {
      // Se o usuário forneceu um slug personalizado
      slugToUse = args.customSlug;
      // Verifica se este slug já está em uso
      const existing = await ctx.db
        .query("shortLinks")
        .withIndex("by_slug", (q) => q.eq("slug", slugToUse))
        .unique();

      if (existing) {
        // Se o slug já existe, lança um erro que podemos tratar no frontend
        throw new Error("Este apelido personalizado já está em uso. Por favor, escolha outro.");
      }
    } else {
      // Se nenhum slug foi fornecido, gera um aleatório e garante que ele seja único
      let isUnique = false;
      let newSlug = "";
      while (!isUnique) {
        newSlug = generateRandomSlug();
        const existing = await ctx.db
          .query("shortLinks")
          .withIndex("by_slug", (q) => q.eq("slug", newSlug))
          .unique();
        if (!existing) {
          isUnique = true;
        }
      }
      slugToUse = newSlug;
    }

    // 2. Valida a URL original (simples, mas útil)
    if (!args.originalUrl.startsWith("http://") && !args.originalUrl.startsWith("https://")) {
        throw new Error("URL inválida. Por favor, inclua http:// ou https://");
    }

    // 3. Insere o novo link no banco de dados
    const newLinkId = await ctx.db.insert("shortLinks", {
      userId,
      slug: slugToUse,
      originalUrl: args.originalUrl,
      clicks: 0, // Começa com zero cliques
    });

    return { success: true, linkId: newLinkId, slug: slugToUse };
  },
});
export const getAndIncrement = mutation({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Encontra o link pelo slug
    const link = await ctx.db
      .query("shortLinks")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    // 2. Se o link não for encontrado, retorna null
    if (link === null) {
      return null;
    }

    // 3. Incrementa o contador de cliques
    await ctx.db.patch(link._id, {
      clicks: link.clicks + 1,
    });

    // 4. Retorna a URL original para o redirecionamento
    return link.originalUrl;
  },
});

// --- QUERY para buscar os links de um usuário ---
export const getLinksForUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return []; // Retorna um array vazio se o usuário não estiver logado
    }
    const userId = identity.subject;

    // Busca todos os links do usuário, ordenados pelo mais recente primeiro
    return await ctx.db
      .query("shortLinks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});