import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// 🎨 Obtenha personalizações do usuário
export const getUserCustomizations = query({
  args: { userId: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("userCustomizations"),
      _creationTime: v.number(),
      userId: v.string(),
      profilePictureStorageId: v.optional(v.id("_storage")),
      profilePictureUrl: v.optional(v.string()), // Campo calculado para a URL atual
      description: v.optional(v.string()),
      accentColor: v.optional(v.string()),
    }),
  ),
  handler: async ({ db, storage }, args) => {
    const customizations = await db
      .query("userCustomizations")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .unique();

    if (!customizations) return null;

    // Obtenha a URL da foto do perfil se o ID de armazenamento existir
    let profilePictureUrl: string | undefined;
    if (customizations.profilePictureStorageId) {
      const url = await storage.getUrl(customizations.profilePictureStorageId);
      profilePictureUrl = url || undefined;
    }

    return {
      ...customizations,
      profilePictureUrl,
    };
  },
});

// 🎨 Obtenha personalizações por slug (para páginas públicas)
export const getCustomizationsBySlug = query({
  args: { slug: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("userCustomizations"),
      _creationTime: v.number(),
      userId: v.string(),
      profilePictureStorageId: v.optional(v.id("_storage")),
      profilePictureUrl: v.optional(v.string()), // Campo calculado para a URL atual
      description: v.optional(v.string()),
      accentColor: v.optional(v.string()),
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

    const customizations = await db
      .query("userCustomizations")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!customizations) return null;

   // Obtenha a URL da foto do perfil se o ID de armazenamento existir
    let profilePictureUrl: string | undefined;
    if (customizations.profilePictureStorageId) {
      const url = await storage.getUrl(customizations.profilePictureStorageId);
      profilePictureUrl = url || undefined;
    }

    return {
      ...customizations,
      profilePictureUrl,
    };
  },
});

// 📤 Gerar URL de upload para foto de perfil
export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async ({ storage, auth }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await storage.generateUploadUrl();
  },
});

// ✏️ Atualizar personalizações do usuário
export const updateCustomizations = mutation({
  args: {
    profilePictureStorageId: v.optional(v.id("_storage")),
    description: v.optional(v.string()),
    accentColor: v.optional(v.string()),
  },
  returns: v.id("userCustomizations"),
  handler: async ({ db, auth, storage }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Verifique se já existem personalizações
    const existing = await db
      .query("userCustomizations")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (existing) {
      // Se estivermos atualizando com uma nova foto de perfil, exclua a antiga
      if (args.profilePictureStorageId && existing.profilePictureStorageId) {
        await storage.delete(existing.profilePictureStorageId);
      }

      // Atualizar personalizações existentes
      await db.patch(existing._id, {
        ...(args.profilePictureStorageId !== undefined && {
          profilePictureStorageId: args.profilePictureStorageId,
        }),
        ...(args.description !== undefined && {
          description: args.description,
        }),
        ...(args.accentColor !== undefined && {
          accentColor: args.accentColor,
        }),
      });
      return existing._id;
    } else {
      // Criar novas personalizações
      return await db.insert("userCustomizations", {
        userId: identity.subject,
        ...(args.profilePictureStorageId !== undefined && {
          profilePictureStorageId: args.profilePictureStorageId,
        }),
        ...(args.description !== undefined && {
          description: args.description,
        }),
        ...(args.accentColor !== undefined && {
          accentColor: args.accentColor,
        }),
      });
    }
  },
});

// 🗑️ Remover foto do perfil
export const removeProfilePicture = mutation({
  args: {},
  returns: v.null(),
  handler: async ({ db, auth, storage }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await db
      .query("userCustomizations")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (existing && existing.profilePictureStorageId) {
      // Exclua o arquivo do armazenamento
      await storage.delete(existing.profilePictureStorageId);

      // Atualizar o registro para remover o ID de armazenamento
      await db.patch(existing._id, {
        profilePictureStorageId: undefined,
      });
    }

    return null;
  },
});