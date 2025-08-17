import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// 🚀 Criar um link
export const createLink = mutation({
  args: {
    title: v.string(),
    url: v.string(),
  },
  returns: v.id("links"),
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await db.insert("links", {
      userId: identity.subject,
      title: args.title,
      url: args.url,
      order: Date.now(),
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
    }),
  ),
  handler: async ({ db }, args) => {
    return await db
      .query("links")
      .withIndex("by_user_and_order", (q) => q.eq("userId", args.userId))
      .order("asc")
      .collect();
  },
});

// 🌐 Obter links pelo slug do usuário
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
    }),
  ),
  handler: async ({ db }, args) => {
    const usernameRecord = await db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", args.slug))
      .unique();

    let userId: string;
    if (usernameRecord) {
      userId = usernameRecord.userId;
    } else {
      userId = args.slug;
    }

    return await db
      .query("links")
      .withIndex("by_user_and_order", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();
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
    }),
  ),
  handler: async ({ db }, args) => {
    return await db
      .query("links")
      .withIndex("by_user_and_order", (q) => q.eq("userId", args.userId))
      .order("asc")
      .collect();
  },
});

// Obter número de links por ID do usuário
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

// ❌ Excluir link
export const deleteLink = mutation({
  args: { linkId: v.id("links") },
  returns: v.null(),
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const link = await db.get(args.linkId);
    if (!link || link.userId !== identity.subject)
      throw new Error("Unauthorized");

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
  },
  returns: v.null(),
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const link = await db.get(args.linkId);
    if (!link || link.userId !== identity.subject)
      throw new Error("Unauthorized");

    await db.patch(args.linkId, {
      title: args.title,
      url: args.url,
    });
    return null;
  },
});

// ✏️ Atualizar ordem
export const updateLinkOrder = mutation({
  args: { linkIds: v.array(v.id("links")) },
  returns: v.null(),
  handler: async ({ db, auth }, { linkIds }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const links = await Promise.all(linkIds.map((linkId) => db.get(linkId)));

    const validLinks = links
      .map((link, index) => ({ link, originalIndex: index }))
      .filter(({ link }) => link && link.userId === identity.subject)
      .map(({ link, originalIndex }) => ({
        link: link as NonNullable<typeof link>,
        originalIndex,
      }));

    await Promise.all(
      validLinks.map(({ link, originalIndex }) =>
        db.patch(link._id, { order: originalIndex }),
      ),
    );
    return null;
  },
});

// 🔍 Obter link por ID com validação aprimorada
export const getLinkById = query({
  args: {
    linkId: v.id("links"),
  },
  returns: v.union(
    v.object({
      _id: v.id("links"),
      _creationTime: v.number(),
      userId: v.string(),
      title: v.string(),
      url: v.string(),
      order: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    try {
      // Validação adicional do ID
      if (!args.linkId || typeof args.linkId !== 'string') {
        console.warn('Invalid linkId provided:', args.linkId);
        return null;
      }

      const link = await ctx.db.get(args.linkId);

      if (!link) {
        console.warn('Link not found:', args.linkId);
        return null;
      }

      return link;
    } catch (error) {
      console.error('Error fetching link:', error);
      return null;
    }
  },
});