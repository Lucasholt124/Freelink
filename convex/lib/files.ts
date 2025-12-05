import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Sua mutation de criar link deve ficar assim:
export const createLink = mutation({
  args: {
    title: v.string(),
    url: v.string(),
    thumbnailStorageId: v.optional(v.id("_storage")), // <--- IMPORTANTE: Adicione isso
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const userId = identity.subject;

    // Lógica para pegar a ordem (último + 1)
    const existingLinks = await ctx.db
      .query("links")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const newOrder = existingLinks.length;

    await ctx.db.insert("links", {
      userId,
      title: args.title,
      url: args.url,
      order: newOrder,
      thumbnailStorageId: args.thumbnailStorageId, // <--- Salvando o ID da imagem
    });
  },
});

// A query que a página pública usa (getLinksBySlug) precisa converter o ID em URL
export const getLinksBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", args.slug))
      .first();

    if (!user) return [];

    const links = await ctx.db
      .query("links")
      .withIndex("by_user", (q) => q.eq("userId", user.userId))
      .collect();

    // Mapear e adicionar a URL da imagem
    const linksWithUrl = await Promise.all(
      links.map(async (link) => {
        let thumbnailUrl = null;
        if (link.thumbnailStorageId) {
          thumbnailUrl = await ctx.storage.getUrl(link.thumbnailStorageId);
        }
        return { ...link, thumbnailUrl }; // <--- Retorna a URL pronta pro front
      })
    );

    return linksWithUrl.sort((a, b) => a.order - b.order);
  },
});