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
      profilePictureUrl: v.optional(v.string()),
      description: v.optional(v.string()),
      accentColor: v.optional(v.string()),
      // CAMPOS PARA BACKGROUND
      backgroundType: v.optional(v.union(v.literal("color"), v.literal("gradient"), v.literal("image"))),
      backgroundStyle: v.optional(v.union(v.literal("full"), v.literal("header"))),
      backgroundColor1: v.optional(v.string()),
      backgroundColor2: v.optional(v.string()),
      backgroundImageStorageId: v.optional(v.id("_storage")),
      backgroundImageUrl: v.optional(v.string()),
      backgroundImageBlur: v.optional(v.number()),
      backgroundImageOpacity: v.optional(v.number()),
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

    // Obtenha a URL da imagem de background se o ID de armazenamento existir
    let backgroundImageUrl: string | undefined;
    if (customizations.backgroundImageStorageId) {
      const url = await storage.getUrl(customizations.backgroundImageStorageId);
      backgroundImageUrl = url || undefined;
    }

    return {
      ...customizations,
      profilePictureUrl,
      backgroundImageUrl,
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
      profilePictureUrl: v.optional(v.string()),
      description: v.optional(v.string()),
      accentColor: v.optional(v.string()),
      // CAMPOS PARA BACKGROUND
      backgroundType: v.optional(v.union(v.literal("color"), v.literal("gradient"), v.literal("image"))),
      backgroundStyle: v.optional(v.union(v.literal("full"), v.literal("header"))),
      backgroundColor1: v.optional(v.string()),
      backgroundColor2: v.optional(v.string()),
      backgroundImageStorageId: v.optional(v.id("_storage")),
      backgroundImageUrl: v.optional(v.string()),
      backgroundImageBlur: v.optional(v.number()),
      backgroundImageOpacity: v.optional(v.number()),
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

    // Obtenha a URL da imagem de background se o ID de armazenamento existir
    let backgroundImageUrl: string | undefined;
    if (customizations.backgroundImageStorageId) {
      const url = await storage.getUrl(customizations.backgroundImageStorageId);
      backgroundImageUrl = url || undefined;
    }

    return {
      ...customizations,
      profilePictureUrl,
      backgroundImageUrl,
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
    // ARGUMENTOS PARA BACKGROUND
    backgroundType: v.optional(v.union(v.literal("color"), v.literal("gradient"), v.literal("image"))),
    backgroundStyle: v.optional(v.union(v.literal("full"), v.literal("header"))),
    backgroundColor1: v.optional(v.string()),
    backgroundColor2: v.optional(v.string()),
    backgroundImageStorageId: v.optional(v.id("_storage")),
    backgroundImageBlur: v.optional(v.number()),
    backgroundImageOpacity: v.optional(v.number()),
  },
  returns: v.id("userCustomizations"),
  handler: async ({ db, auth, storage }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // ✅ VALIDAÇÃO: Bio obrigatória com mínimo de 20 caracteres
    if (args.description !== undefined) {
      const trimmedDescription = args.description.trim();

      if (trimmedDescription.length === 0) {
        throw new Error("A descrição é obrigatória");
      }

      if (trimmedDescription.length < 20) {
        throw new Error("A descrição deve ter no mínimo 20 caracteres");
      }

      if (trimmedDescription.length > 160) {
        throw new Error("A descrição deve ter no máximo 160 caracteres");
      }

      // Lista de termos proibidos (case insensitive)
      const forbiddenPhrases = [
        "bem vindo",
        "bem-vindo",
        "perfil oficial",
        "clique aqui",
        "link na bio"
      ];

      const lowerDescription = trimmedDescription.toLowerCase();
      for (const phrase of forbiddenPhrases) {
        if (lowerDescription.includes(phrase)) {
          throw new Error(`Evite frases genéticas como "${phrase}". Seja mais específico sobre sua proposta de valor.`);
        }
      }

      // Verifica excesso de exclamações
      const exclamationCount = (trimmedDescription.match(/!/g) || []).length;
      if (exclamationCount > 2) {
        throw new Error("Evite excesso de exclamações. Seja objetivo e profissional.");
      }
    }

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

      // Se estivermos atualizando com uma nova imagem de background, exclua a antiga
      if (args.backgroundImageStorageId && existing.backgroundImageStorageId) {
        await storage.delete(existing.backgroundImageStorageId);
      }

      // Atualizar personalizações existentes
      await db.patch(existing._id, {
        ...(args.profilePictureStorageId !== undefined && {
          profilePictureStorageId: args.profilePictureStorageId,
        }),
        ...(args.description !== undefined && {
          description: args.description.trim(),
        }),
        ...(args.accentColor !== undefined && {
          accentColor: args.accentColor,
        }),
        ...(args.backgroundType !== undefined && {
          backgroundType: args.backgroundType,
        }),
        ...(args.backgroundStyle !== undefined && {
          backgroundStyle: args.backgroundStyle,
        }),
        ...(args.backgroundColor1 !== undefined && {
          backgroundColor1: args.backgroundColor1,
        }),
        ...(args.backgroundColor2 !== undefined && {
          backgroundColor2: args.backgroundColor2,
        }),
        ...(args.backgroundImageStorageId !== undefined && {
          backgroundImageStorageId: args.backgroundImageStorageId,
        }),
        ...(args.backgroundImageBlur !== undefined && {
          backgroundImageBlur: args.backgroundImageBlur,
        }),
        ...(args.backgroundImageOpacity !== undefined && {
          backgroundImageOpacity: args.backgroundImageOpacity,
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
          description: args.description.trim(),
        }),
        ...(args.accentColor !== undefined && {
          accentColor: args.accentColor,
        }),
        ...(args.backgroundType !== undefined && {
          backgroundType: args.backgroundType,
        }),
        ...(args.backgroundStyle !== undefined && {
          backgroundStyle: args.backgroundStyle,
        }),
        ...(args.backgroundColor1 !== undefined && {
          backgroundColor1: args.backgroundColor1,
        }),
        ...(args.backgroundColor2 !== undefined && {
          backgroundColor2: args.backgroundColor2,
        }),
        ...(args.backgroundImageStorageId !== undefined && {
          backgroundImageStorageId: args.backgroundImageStorageId,
        }),
        ...(args.backgroundImageBlur !== undefined && {
          backgroundImageBlur: args.backgroundImageBlur,
        }),
        ...(args.backgroundImageOpacity !== undefined && {
          backgroundImageOpacity: args.backgroundImageOpacity,
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

// 🗑️ Remover imagem de background
export const removeBackgroundImage = mutation({
  args: {},
  returns: v.null(),
  handler: async ({ db, auth, storage }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await db
      .query("userCustomizations")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (existing && existing.backgroundImageStorageId) {
      // Exclua o arquivo do armazenamento
      await storage.delete(existing.backgroundImageStorageId);

      // Atualizar o registro para remover o ID de armazenamento e resetar para cor
      await db.patch(existing._id, {
        backgroundImageStorageId: undefined,
        backgroundType: "color",
      });
    }

    return null;
  },
});