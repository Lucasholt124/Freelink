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
      order: Date.now(), // use isso para classificar por ordem padrão por hora de criação (mais recente primeiro)
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
    }),
  ),
  handler: async ({ db }, args) => {
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

// obter número de links por ID do usuário
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

// ✏️ Atualizar pedido
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

// 🔍 Obter link por ID com validação robusta
export const getLinkById = query({
  args: {
    linkId: v.id("links"),
  },
  handler: async (ctx, args) => {
    try {
      // Verificação de segurança adicional
      const linkIdStr = String(args.linkId);

      // Ignora requisições que pareçam ser arquivos estáticos
      if (linkIdStr.includes('.css') ||
          linkIdStr.includes('.map') ||
          linkIdStr.includes('.js') ||
          linkIdStr.includes('.png') ||
          linkIdStr.includes('.jpg') ||
          linkIdStr.includes('.svg')) {
        console.warn(`Ignorando requisição para arquivo estático: ${linkIdStr}`);
        return null;
      }

      // Busca no banco de dados o documento com o ID fornecido
      const link = await ctx.db.get(args.linkId);

      // Retorna o link encontrado. Se não encontrar, retorna null.
      return link;
    } catch (error) {
      console.error(`Erro ao buscar link: ${error}`);
      return null;
    }
  },
});