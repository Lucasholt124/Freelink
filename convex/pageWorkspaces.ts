import {
  action,
  internalMutation,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexError, v } from "convex/values";
import { usernameError } from "./lib/onboarding_utils";
import { publicLinkUrl, isContactLink } from "../lib/public-profile";
import { extraPageLimit, validColor } from "../lib/page-editor";

type ReadCtx = Pick<QueryCtx, "auth" | "db" | "storage">;
const ADMIN = "user_301NTkVsE3v48SXkoCEp0XOXifI";
async function requireOwner(ctx: Pick<QueryCtx, "auth">) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError("Entre na sua conta para continuar.");
  return identity.subject;
}
async function ownedPage(ctx: ReadCtx, userId: string) {
  const ownerId = await requireOwner(ctx);
  if (userId === ownerId) return null;
  const page = await ctx.db
    .query("subAccounts")
    .withIndex("by_sub_user", (q) => q.eq("subUserId", userId))
    .unique();
  if (!page || page.ownerUserId !== ownerId)
    throw new ConvexError("Esta página não pertence à sua conta.");
  return page;
}
async function getProfile(ctx: ReadCtx, userId: string) {
  const profile = await ctx.db
    .query("userCustomizations")
    .withIndex("by_user_id", (q) => q.eq("userId", userId))
    .unique();
  if (!profile) return null;
  return {
    ...profile,
    profilePictureUrl: profile.profilePictureStorageId
      ? (await ctx.storage.getUrl(profile.profilePictureStorageId)) || undefined
      : profile.profilePictureUrl,
    backgroundImageUrl: profile.backgroundImageStorageId
      ? (await ctx.storage.getUrl(profile.backgroundImageStorageId)) ||
        undefined
      : profile.backgroundImageUrl,
  };
}
async function available(
  ctx: ReadCtx,
  username: string,
  excludeUserId?: string,
) {
  const error = usernameError(username);
  if (error) return { available: false, error };
  const [name, sub] = await Promise.all([
    ctx.db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first(),
    ctx.db
      .query("subAccounts")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first(),
  ]);
  const free =
    (!name || name.userId === excludeUserId) &&
    (!sub || sub.subUserId === excludeUserId);
  return {
    available: free,
    error: free ? "" : "Este endereço já está em uso.",
  };
}

export const getMyPages = query({
  args: {},
  handler: async (ctx) => {
    const owner = await requireOwner(ctx);
    const children = await ctx.db
      .query("subAccounts")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", owner))
      .order("asc")
      .collect();
    return Promise.all(
      [
        {
          userId: owner,
          isMain: true,
          createdAt: 0,
          displayName: "",
          subAccountId: null,
        },
        ...children.map((p) => ({
          userId: p.subUserId,
          isMain: false,
          createdAt: p.createdAt,
          displayName: p.displayName || "",
          subAccountId: p._id,
        })),
      ].map(async (page) => {
        const [name, profile] = await Promise.all([
          ctx.db
            .query("usernames")
            .withIndex("by_user_id", (q) => q.eq("userId", page.userId))
            .first(),
          getProfile(ctx, page.userId),
        ]);
        return {
          ...page,
          username: name?.username || "",
          displayName:
            profile?.displayName ||
            page.displayName ||
            name?.username ||
            "Página principal",
          accentColor: profile?.accentColor || "#7144e8",
          avatar: profile?.profilePictureUrl || null,
        };
      }),
    );
  },
});

export const getEditorData = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    await ownedPage(ctx, userId);
    const [profile, links] = await Promise.all([
      getProfile(ctx, userId),
      ctx.db
        .query("links")
        .withIndex("by_user_and_order", (q) => q.eq("userId", userId))
        .order("asc")
        .collect(),
    ]);
    return {
      profile,
      links: await Promise.all(
        links.map(async (link) => ({
          ...link,
          thumbnailUrl: link.thumbnailStorageId
            ? (await ctx.storage.getUrl(link.thumbnailStorageId)) || undefined
            : undefined,
        })),
      ),
    };
  },
});

export const checkAddress = query({
  args: { username: v.string(), excludeUserId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireOwner(ctx);
    if (args.excludeUserId) await ownedPage(ctx, args.excludeUserId);
    return available(
      ctx,
      args.username.trim().toLowerCase(),
      args.excludeUserId,
    );
  },
});

export const renamePage = mutation({
  args: { userId: v.string(), username: v.string() },
  handler: async (ctx, { userId, username: raw }) => {
    const child = await ownedPage(ctx, userId);
    const username = raw.trim().toLowerCase();
    const result = await available(ctx, username, userId);
    if (!result.available) throw new ConvexError(result.error);
    const record = await ctx.db
      .query("usernames")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();
    if (record) await ctx.db.patch(record._id, { username });
    else await ctx.db.insert("usernames", { userId, username });
    if (child) await ctx.db.patch(child._id, { username });
    return { username };
  },
});

export const uploadUrl = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    await ownedPage(ctx, userId);
    return ctx.storage.generateUploadUrl();
  },
});
export const assetUrl = query({
  args: { userId: v.string(), storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await ownedPage(ctx, args.userId);
    return ctx.storage.getUrl(args.storageId);
  },
});

export const saveAppearance = mutation({
  args: {
    userId: v.string(),
    displayName: v.string(),
    bio: v.string(),
    status: v.string(),
    accentColor: v.string(),
    backgroundType: v.union(
      v.literal("color"),
      v.literal("gradient"),
      v.literal("image"),
    ),
    backgroundStyle: v.union(v.literal("full"), v.literal("header")),
    backgroundColor1: v.string(),
    backgroundColor2: v.string(),
    backgroundImageBlur: v.number(),
    backgroundImageOpacity: v.number(),
    photoId: v.optional(v.id("_storage")),
    clearPhoto: v.boolean(),
    backgroundId: v.optional(v.id("_storage")),
    clearBackground: v.boolean(),
  },
  handler: async (ctx, args) => {
    const child = await ownedPage(ctx, args.userId);
    const name = args.displayName.trim();
    if (!name || name.length > 80)
      throw new ConvexError("Informe um nome com até 80 caracteres.");
    if (args.bio.length > 160 || args.status.length > 80)
      throw new ConvexError("Revise o tamanho da bio e do aviso.");
    if (
      ![args.accentColor, args.backgroundColor1, args.backgroundColor2].every(
        validColor,
      )
    )
      throw new ConvexError("Escolha cores válidas.");
    if (
      !Number.isFinite(args.backgroundImageBlur) ||
      args.backgroundImageBlur < 0 ||
      args.backgroundImageBlur > 20 ||
      !Number.isFinite(args.backgroundImageOpacity) ||
      args.backgroundImageOpacity < 0 ||
      args.backgroundImageOpacity > 100
    )
      throw new ConvexError("Revise os ajustes da imagem de fundo.");
    const existing = await ctx.db
      .query("userCustomizations")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .unique();
    const update: Partial<
      import("./_generated/dataModel").Doc<"userCustomizations">
    > = {
      displayName: name,
      description: args.status.trim()
        ? `AVISO: ${args.status.trim()}\n${args.bio.trim()}`
        : args.bio.trim(),
      accentColor: args.accentColor,
      backgroundType: args.backgroundType,
      backgroundStyle: args.backgroundStyle,
      backgroundColor1: args.backgroundColor1,
      backgroundColor2: args.backgroundColor2,
      backgroundImageBlur: args.backgroundImageBlur,
      backgroundImageOpacity: args.backgroundImageOpacity,
    };
    if (args.clearPhoto) {
      update.profilePictureStorageId = undefined;
      update.profilePictureUrl = undefined;
    } else if (args.photoId) {
      const url = await ctx.storage.getUrl(args.photoId);
      if (!url) throw new ConvexError("Envie a foto novamente.");
      update.profilePictureStorageId = args.photoId;
      update.profilePictureUrl = url;
    }
    if (args.clearBackground) {
      update.backgroundImageStorageId = undefined;
      update.backgroundImageUrl = undefined;
    } else if (args.backgroundId) {
      const url = await ctx.storage.getUrl(args.backgroundId);
      if (!url) throw new ConvexError("Envie a imagem de fundo novamente.");
      update.backgroundImageStorageId = args.backgroundId;
      update.backgroundImageUrl = url;
    }
    const backgroundUrl = args.clearBackground
      ? null
      : update.backgroundImageUrl ||
        existing?.backgroundImageUrl ||
        (existing?.backgroundImageStorageId
          ? await ctx.storage.getUrl(existing.backgroundImageStorageId)
          : null);
    if (args.backgroundType === "image" && !backgroundUrl)
      throw new ConvexError("Escolha uma imagem para o fundo.");
    if (existing) await ctx.db.patch(existing._id, update);
    else
      await ctx.db.insert("userCustomizations", {
        userId: args.userId,
        ...update,
      });
    if (child) await ctx.db.patch(child._id, { displayName: name });
    return getProfile(ctx, args.userId);
  },
});

const badge = v.union(
  v.literal("new"),
  v.literal("hot"),
  v.literal("popular"),
  v.literal("limited"),
  v.null(),
);
export const saveLink = mutation({
  args: {
    userId: v.string(),
    linkId: v.optional(v.id("links")),
    title: v.string(),
    url: v.string(),
    isFeatured: v.optional(v.boolean()),
    badgeType: badge,
    thumbnailId: v.optional(v.id("_storage")),
    clearThumbnail: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ownedPage(ctx, args.userId);
    const title = args.title.trim();
    const url = publicLinkUrl(args.url);
    if (title.length < 3 || title.length > 100)
      throw new ConvexError("O título deve ter entre 3 e 100 caracteres.");
    if (!url) throw new ConvexError("Informe um endereço válido para o link.");
    const link = args.linkId ? await ctx.db.get(args.linkId) : null;
    if (args.linkId && (!link || link.userId !== args.userId))
      throw new ConvexError("Este link não pertence à página em edição.");
    if (args.thumbnailId && !(await ctx.storage.getUrl(args.thumbnailId)))
      throw new ConvexError("Envie a imagem do link novamente.");
    const values = {
      title,
      url,
      isFeatured:
        args.isFeatured ?? (link ? !!link.isFeatured : isContactLink(url)),
      badgeType: args.badgeType || undefined,
      ...(args.clearThumbnail
        ? { thumbnailStorageId: undefined }
        : args.thumbnailId
          ? { thumbnailStorageId: args.thumbnailId }
          : {}),
    };
    if (link) {
      await ctx.db.patch(link._id, values);
      return link._id;
    }
    const last = await ctx.db
      .query("links")
      .withIndex("by_user_and_order", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();
    return ctx.db.insert("links", {
      ...values,
      userId: args.userId,
      order: (last?.order ?? -1) + 1,
    });
  },
});

export const reorderLinks = mutation({
  args: { userId: v.string(), linkIds: v.array(v.id("links")) },
  handler: async (ctx, args) => {
    await ownedPage(ctx, args.userId);
    const current = await ctx.db
      .query("links")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const ids = new Set(args.linkIds);
    if (
      ids.size !== args.linkIds.length ||
      current.length !== ids.size ||
      current.some((link) => !ids.has(link._id))
    )
      throw new ConvexError("A lista mudou. Tente reorganizar novamente.");
    await Promise.all(
      args.linkIds.map((id, order) => ctx.db.patch(id, { order })),
    );
  },
});

export const deleteLink = mutation({
  args: { userId: v.string(), linkId: v.id("links") },
  handler: async (ctx, args) => {
    await ownedPage(ctx, args.userId);
    const link = await ctx.db.get(args.linkId);
    if (!link || link.userId !== args.userId)
      throw new ConvexError("Este link não pertence à página em edição.");
    await ctx.db.delete(link._id);
  },
});

export const createOwnedPage = internalMutation({
  args: {
    ownerId: v.string(),
    plan: v.string(),
    username: v.string(),
    displayName: v.string(),
    accentColor: v.string(),
    backgroundColor1: v.string(),
    backgroundColor2: v.string(),
  },
  handler: async (ctx, args) => {
    const limit = extraPageLimit(args.plan, args.ownerId === ADMIN);
    const existing = await ctx.db
      .query("subAccounts")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", args.ownerId))
      .collect();
    if (!limit || existing.length >= limit)
      throw new ConvexError(
        limit
          ? "Você atingiu o limite de páginas adicionais do seu plano."
          : "Páginas adicionais estão disponíveis nos planos Pro e Ultra.",
      );
    const username = args.username.trim().toLowerCase();
    const result = await available(ctx, username);
    if (!result.available) throw new ConvexError(result.error);
    if (
      !args.displayName.trim() ||
      args.displayName.trim().length > 80 ||
      ![args.accentColor, args.backgroundColor1, args.backgroundColor2].every(
        validColor,
      )
    )
      throw new ConvexError("Revise o nome e as cores da página.");
    const subAccountId = await ctx.db.insert("subAccounts", {
      ownerUserId: args.ownerId,
      subUserId: "pending",
      username,
      displayName: args.displayName.trim(),
      createdAt: Date.now(),
    });
    const userId = `sub_${subAccountId}`;
    await ctx.db.patch(subAccountId, { subUserId: userId });
    await ctx.db.insert("usernames", { userId, username });
    await ctx.db.insert("userCustomizations", {
      userId,
      displayName: args.displayName.trim(),
      accentColor: args.accentColor,
      backgroundType: "color",
      backgroundColor1: args.backgroundColor1,
      backgroundColor2: args.backgroundColor2,
    });
    return { userId, username };
  },
});

export const createPage = action({
  args: {
    username: v.string(),
    displayName: v.string(),
    accentColor: v.string(),
    backgroundColor1: v.string(),
    backgroundColor2: v.string(),
  },
  handler: async (ctx, args): Promise<{ userId: string; username: string }> => {
    const ownerId = await requireOwner(ctx);
    let plan = "free";
    if (ownerId === ADMIN) plan = "ultra";
    else {
      const key = process.env.CLERK_SECRET_KEY?.trim();
      if (!key)
        throw new ConvexError(
          "A criação de páginas está temporariamente indisponível. Fale com o suporte.",
        );
      const response = await fetch(
        `https://api.clerk.com/v1/users/${encodeURIComponent(ownerId)}`,
        { headers: { Authorization: `Bearer ${key}` } },
      );
      if (!response.ok)
        throw new ConvexError(
          "Não foi possível confirmar seu plano. Tente novamente em instantes.",
        );
      const user = await response.json();
      plan = String(
        user.public_metadata?.subscriptionPlan || "free",
      ).toLowerCase();
    }
    return ctx.runMutation(internal.pageWorkspaces.createOwnedPage, {
      ...args,
      ownerId,
      plan,
    });
  },
});
