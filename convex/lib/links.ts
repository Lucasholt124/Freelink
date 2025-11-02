import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// 🚀 Criar um link
export const createLink = mutation({
  args: {
    title: v.string(),
    url: v.string(),
    thumbnailStorageId: v.optional(v.id("_storage")),
    isFeatured: v.optional(v.boolean()),
    badgeType: v.optional(v.union(v.literal("new"), v.literal("hot"), v.literal("popular"), v.literal("limited"))),
  },
  returns: v.id("links"),
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // ✅ Validação de título
    if (args.title.trim().length < 3) {
      throw new Error("O título deve ter no mínimo 3 caracteres");
    }

    if (args.title.trim().length > 100) {
      throw new Error("O título deve ter no máximo 100 caracteres");
    }

    // ✅ Validação de URL
    try {
      new URL(args.url);
    } catch {
      throw new Error("URL inválida. Use o formato completo (ex: https://exemplo.com)");
    }

    return await db.insert("links", {
      userId: identity.subject,
      title: args.title.trim(),
      url: args.url.trim(),
      order: Date.now(),
      thumbnailStorageId: args.thumbnailStorageId,
      isFeatured: args.isFeatured || false,
      badgeType: args.badgeType,
    });
  },
});

// 🗂️ Obter todos os links de um usuário (usado no painel)
export const getLinks = query({
  args: { userId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("links"),
      _creationTime: v.number(),
      userId: v.string(),
      title: v.string(),
      url: v.string(),
      order: v.number(),
      thumbnailStorageId: v.optional(v.id("_storage")),
      thumbnailUrl: v.optional(v.string()),
      isFeatured: v.optional(v.boolean()),
      badgeType: v.optional(v.union(v.literal("new"), v.literal("hot"), v.literal("popular"), v.literal("limited"))),
    }),
  ),
  handler: async ({ db, storage }, args) => {
    const links = await db
      .query("links")
      .withIndex("by_user_and_order", (q) => q.eq("userId", args.userId))
      .order("asc")
      .collect();

    // ✅ Adiciona URLs de thumbnails quando existirem
    const linksWithThumbnails = await Promise.all(
      links.map(async (link) => {
        let thumbnailUrl: string | undefined;
        if (link.thumbnailStorageId) {
          const url = await storage.getUrl(link.thumbnailStorageId);
          thumbnailUrl = url || undefined;
        }
        return {
          ...link,
          thumbnailUrl,
        };
      })
    );

    return linksWithThumbnails;
  },
});

// 🌐 Obter links pelo slug do usuário (nome de usuário ou ID do funcionário)
export const getLinksBySlug = query({
  args: { slug: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("links"),
      _creationTime: v.number(),
      userId: v.string(),
      title: v.string(),
      url: v.string(),
      order: v.number(),
      thumbnailStorageId: v.optional(v.id("_storage")),
      thumbnailUrl: v.optional(v.string()),
      isFeatured: v.optional(v.boolean()),
      badgeType: v.optional(v.union(v.literal("new"), v.literal("hot"), v.literal("popular"), v.literal("limited"))),
    }),
  ),
  handler: async ({ db, storage }, args) => {
    // Primeiro tente encontrar um nome de usuário personalizado
    const usernameRecord = await db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", args.slug))
      .unique();

    let userId: string;
    if (usernameRecord) {
      userId = usernameRecord.userId;
    } else {
      // Tratar slug como ID de funcionário em potencial
      userId = args.slug;
    }

    const links = await db
      .query("links")
      .withIndex("by_user_and_order", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();

    // ✅ Adiciona URLs de thumbnails quando existirem
    const linksWithThumbnails = await Promise.all(
      links.map(async (link) => {
        let thumbnailUrl: string | undefined;
        if (link.thumbnailStorageId) {
          const url = await storage.getUrl(link.thumbnailStorageId);
          thumbnailUrl = url || undefined;
        }
        return {
          ...link,
          thumbnailUrl,
        };
      })
    );

    return linksWithThumbnails;
  },
});

// 🔍 Obter links por ID de usuário
export const getLinksByUserId = query({
  args: { userId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("links"),
      _creationTime: v.number(),
      userId: v.string(),
      title: v.string(),
      url: v.string(),
      order: v.number(),
      thumbnailStorageId: v.optional(v.id("_storage")),
      thumbnailUrl: v.optional(v.string()),
      isFeatured: v.optional(v.boolean()),
      badgeType: v.optional(v.union(v.literal("new"), v.literal("hot"), v.literal("popular"), v.literal("limited"))),
    }),
  ),
  handler: async ({ db, storage }, args) => {
    const links = await db
      .query("links")
      .withIndex("by_user_and_order", (q) => q.eq("userId", args.userId))
      .order("asc")
      .collect();

    // ✅ Adiciona URLs de thumbnails quando existirem
    const linksWithThumbnails = await Promise.all(
      links.map(async (link) => {
        let thumbnailUrl: string | undefined;
        if (link.thumbnailStorageId) {
          const url = await storage.getUrl(link.thumbnailStorageId);
          thumbnailUrl = url || undefined;
        }
        return {
          ...link,
          thumbnailUrl,
        };
      })
    );

    return linksWithThumbnails;
  },
});

// 📊 Obter número de links por ID do usuário
export const getLinkCountByUserId = query({
  args: { userId: v.string() },
  returns: v.number(),
  handler: async ({ db }, args) => {
    const links = await db
      .query("links")
      .withIndex("by_user_and_order", (q) => q.eq("userId", args.userId))
      .collect();
    return links.length;
  },
});

// 🔍 Obter link por ID
export const getLinkById = query({
  args: { linkId: v.id("links") },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("links"),
      _creationTime: v.number(),
      userId: v.string(),
      title: v.string(),
      url: v.string(),
      order: v.number(),
      thumbnailStorageId: v.optional(v.id("_storage")),
      thumbnailUrl: v.optional(v.string()),
      isFeatured: v.optional(v.boolean()),
      badgeType: v.optional(v.union(v.literal("new"), v.literal("hot"), v.literal("popular"), v.literal("limited"))),
    }),
  ),
  handler: async ({ db, storage }, args) => {
    const link = await db.get(args.linkId);
    if (!link) return null;

    let thumbnailUrl: string | undefined;
    if (link.thumbnailStorageId) {
      const url = await storage.getUrl(link.thumbnailStorageId);
      thumbnailUrl = url || undefined;
    }

    return {
      ...link,
      thumbnailUrl,
    };
  },
});

// ❌ Excluir link
export const deleteLink = mutation({
  args: { linkId: v.id("links") },
  returns: v.null(),
  handler: async ({ db, auth, storage }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const link = await db.get(args.linkId);
    if (!link || link.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // ✅ Remove thumbnail do storage se existir
    if (link.thumbnailStorageId) {
      await storage.delete(link.thumbnailStorageId);
    }

    await db.delete(args.linkId);
    return null;
  },
});

// ✏️ Atualizar link
export const updateLink = mutation({
  args: {
    linkId: v.id("links"),
    title: v.string(),
    url: v.string(),
    thumbnailStorageId: v.optional(v.id("_storage")),
    isFeatured: v.optional(v.boolean()),
    badgeType: v.optional(v.union(v.literal("new"), v.literal("hot"), v.literal("popular"), v.literal("limited"))),
  },
  returns: v.null(),
  handler: async ({ db, auth, storage }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const link = await db.get(args.linkId);
    if (!link || link.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // ✅ Validação de título
    if (args.title.trim().length < 3) {
      throw new Error("O título deve ter no mínimo 3 caracteres");
    }

    if (args.title.trim().length > 100) {
      throw new Error("O título deve ter no máximo 100 caracteres");
    }

    // ✅ Validação de URL
    try {
      new URL(args.url);
    } catch {
      throw new Error("URL inválida. Use o formato completo (ex: https://exemplo.com)");
    }

    // ✅ Se atualizando thumbnail, remove o antigo
    if (args.thumbnailStorageId && link.thumbnailStorageId && args.thumbnailStorageId !== link.thumbnailStorageId) {
      await storage.delete(link.thumbnailStorageId);
    }

    await db.patch(args.linkId, {
      title: args.title.trim(),
      url: args.url.trim(),
      thumbnailStorageId: args.thumbnailStorageId,
      isFeatured: args.isFeatured,
      badgeType: args.badgeType,
    });
    return null;
  },
});

// 🗑️ Remover thumbnail de um link
export const removeLinkThumbnail = mutation({
  args: { linkId: v.id("links") },
  returns: v.null(),
  handler: async ({ db, auth, storage }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const link = await db.get(args.linkId);
    if (!link || link.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    if (link.thumbnailStorageId) {
      await storage.delete(link.thumbnailStorageId);
      await db.patch(args.linkId, {
        thumbnailStorageId: undefined,
      });
    }

    return null;
  },
});

// ✏️ Atualizar ordem dos links
export const updateLinkOrder = mutation({
  args: { linkIds: v.array(v.id("links")) },
  returns: v.null(),
  handler: async ({ db, auth }, { linkIds }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Obtenha todos os links e filtre os inválidos
    const links = await Promise.all(linkIds.map((linkId) => db.get(linkId)));

    const validLinks = links
      .map((link, index) => ({ link, originalIndex: index }))
      .filter(({ link }) => link && link.userId === identity.subject)
      .map(({ link, originalIndex }) => ({
        link: link as NonNullable<typeof link>,
        originalIndex,
      }));

    // Atualiza apenas links válidos com seu novo pedido
    await Promise.all(
      validLinks.map(({ link, originalIndex }) =>
        db.patch(link._id, { order: originalIndex }),
      ),
    );
    return null;
  },
});

// ⭐ Alternar status de destaque de um link (recurso PRO)
export const toggleLinkFeatured = mutation({
  args: { linkId: v.id("links") },
  returns: v.boolean(),
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const link = await db.get(args.linkId);
    if (!link || link.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    const newFeaturedStatus = !link.isFeatured;

    await db.patch(args.linkId, {
      isFeatured: newFeaturedStatus,
    });

    return newFeaturedStatus;
  },
});

// 🏷️ Atualizar badge de um link (recurso PRO)
export const updateLinkBadge = mutation({
  args: {
    linkId: v.id("links"),
    badgeType: v.optional(v.union(v.literal("new"), v.literal("hot"), v.literal("popular"), v.literal("limited"))),
  },
  returns: v.null(),
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const link = await db.get(args.linkId);
    if (!link || link.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await db.patch(args.linkId, {
      badgeType: args.badgeType,
    });

    return null;
  },
});