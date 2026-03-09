import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// ============================================
// 🔍 QUERIES
// ============================================

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
    let profilePictureUrl: string | undefined = customizations.profilePictureUrl;
    if (customizations.profilePictureStorageId && !profilePictureUrl) {
      const url = await storage.getUrl(customizations.profilePictureStorageId);
      profilePictureUrl = url || undefined;
    }

    // Obtenha a URL da imagem de background se o ID de armazenamento existir
    let backgroundImageUrl: string | undefined = customizations.backgroundImageUrl;
    if (customizations.backgroundImageStorageId && !backgroundImageUrl) {
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
      // Tratar slug como ID de usuário em potencial
      userId = args.slug;
    }

    const customizations = await db
      .query("userCustomizations")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!customizations) return null;

    // Obtenha a URL da foto do perfil
    let profilePictureUrl: string | undefined = customizations.profilePictureUrl;
    if (customizations.profilePictureStorageId && !profilePictureUrl) {
      const url = await storage.getUrl(customizations.profilePictureStorageId);
      profilePictureUrl = url || undefined;
    }

    // Obtenha a URL da imagem de background
    let backgroundImageUrl: string | undefined = customizations.backgroundImageUrl;
    if (customizations.backgroundImageStorageId && !backgroundImageUrl) {
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

// ============================================
// ✏️ MUTATIONS
// ============================================

// 📤 Gerar URL de upload
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
    userId: v.optional(v.string()), // 🔥 NOVO: Suporte a Sub-contas
    profilePictureStorageId: v.optional(v.id("_storage")),
    description: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    backgroundType: v.optional(v.union(v.literal("color"), v.literal("gradient"), v.literal("image"))),
    backgroundStyle: v.optional(v.union(v.literal("full"), v.literal("header"))),
    backgroundColor1: v.optional(v.string()),
    backgroundColor2: v.optional(v.string()),
    backgroundImageStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    backgroundImageBlur: v.optional(v.number()),
    backgroundImageOpacity: v.optional(v.number()),
    clearBackgroundImage: v.optional(v.boolean()),
  },
  returns: v.id("userCustomizations"),
  handler: async ({ db, auth, storage }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // 🔥 Define o ID alvo (Sub-conta ou Conta Principal)
    const targetUserId = args.userId || identity.subject;

    // 🛡️ TRAVA DE SEGURANÇA: Garante que ninguém altere contas de terceiros
    if (targetUserId !== identity.subject && identity.subject !== "user_301NTkVsE3v48SXkoCEp0XOXifI") {
      const subAccount = await db.query("subAccounts")
        .withIndex("by_sub_user", (q) => q.eq("subUserId", targetUserId))
        .first();

      if (!subAccount || subAccount.ownerUserId !== identity.subject) {
        throw new Error("Acesso negado: Você não tem permissão para alterar esta conta.");
      }
    }

    // 🔥 VALIDAÇÃO FLEXÍVEL DA DESCRIÇÃO
    if (args.description !== undefined && args.description !== null) {
      const trimmedDescription = args.description.trim();

      if (trimmedDescription.length > 0) {
        // Extrair apenas a bio (sem o status) para validação
        let bioOnly = trimmedDescription;

        if (trimmedDescription.startsWith("AVISO:") || trimmedDescription.startsWith("STATUS:")) {
          const parts = trimmedDescription.split("\n");
          bioOnly = parts.slice(1).join("\n").trim();
        }

        // Validar tamanho da bio (máximo 160)
        if (bioOnly.length > 160) {
          throw new Error("A bio deve ter no máximo 160 caracteres");
        }

        // Validar tamanho total (status + bio) máximo 300
        if (trimmedDescription.length > 300) {
          throw new Error("O texto total deve ter no máximo 300 caracteres");
        }

        // Verificar excesso de exclamações
        const exclamationCount = (bioOnly.match(/!/g) || []).length;
        if (exclamationCount > 5) {
          throw new Error("Evite excesso de exclamações");
        }
      }
    }

    // Buscar registro existente usando o targetUserId
    const existing = await db
      .query("userCustomizations")
      .withIndex("by_user_id", (q) => q.eq("userId", targetUserId))
      .unique();

    // 🔥 Preparar objeto de atualização
    const updateData: Record<string, unknown> = {};

    // Campos simples
    if (args.description !== undefined) {
      updateData.description = args.description?.trim() || "";
    }
    if (args.accentColor !== undefined) {
      updateData.accentColor = args.accentColor;
    }
    if (args.backgroundType !== undefined) {
      updateData.backgroundType = args.backgroundType;
    }
    if (args.backgroundStyle !== undefined) {
      updateData.backgroundStyle = args.backgroundStyle;
    }
    if (args.backgroundColor1 !== undefined) {
      updateData.backgroundColor1 = args.backgroundColor1;
    }
    if (args.backgroundColor2 !== undefined) {
      updateData.backgroundColor2 = args.backgroundColor2;
    }
    if (args.backgroundImageBlur !== undefined) {
      updateData.backgroundImageBlur = args.backgroundImageBlur;
    }
    if (args.backgroundImageOpacity !== undefined) {
      updateData.backgroundImageOpacity = args.backgroundImageOpacity;
    }

    // 🔥 FOTO DE PERFIL
    if (args.profilePictureStorageId !== undefined) {
      if (existing?.profilePictureStorageId) {
        try {
          await storage.delete(existing.profilePictureStorageId);
        } catch (e) {
          console.warn("Falha ao deletar foto antiga:", e);
        }
      }
      updateData.profilePictureStorageId = args.profilePictureStorageId;

      if (args.profilePictureStorageId) {
        const url = await storage.getUrl(args.profilePictureStorageId);
        updateData.profilePictureUrl = url || undefined;
      }
    }

    // 🔥 IMAGEM DE FUNDO
    if (args.clearBackgroundImage === true) {
      if (existing?.backgroundImageStorageId) {
        try {
          await storage.delete(existing.backgroundImageStorageId);
        } catch (e) {
          console.warn("Falha ao deletar imagem de fundo:", e);
        }
      }
      updateData.backgroundImageStorageId = undefined;
      updateData.backgroundImageUrl = undefined;
    } else if (args.backgroundImageStorageId !== undefined) {
      if (args.backgroundImageStorageId === null) {
        if (existing?.backgroundImageStorageId) {
          try {
            await storage.delete(existing.backgroundImageStorageId);
          } catch (e) {
            console.warn("Falha ao deletar imagem de fundo:", e);
          }
        }
        updateData.backgroundImageStorageId = undefined;
        updateData.backgroundImageUrl = undefined;
      } else {
        if (existing?.backgroundImageStorageId) {
          try {
            await storage.delete(existing.backgroundImageStorageId);
          } catch (e) {
            console.warn("Falha ao deletar imagem antiga:", e);
          }
        }
        updateData.backgroundImageStorageId = args.backgroundImageStorageId;

        const url = await storage.getUrl(args.backgroundImageStorageId);
        updateData.backgroundImageUrl = url || undefined;
      }
    }

    if (existing) {
      await db.patch(existing._id, updateData);
      return existing._id;
    } else {
      return await db.insert("userCustomizations", {
        userId: targetUserId,
        ...updateData,
      });
    }
  },
});

// 🗑️ Remover foto do perfil
export const removeProfilePicture = mutation({
  args: { userId: v.optional(v.string()) }, // 🔥 NOVO
  returns: v.null(),
  handler: async ({ db, auth, storage }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const targetUserId = args.userId || identity.subject;

    // 🛡️ TRAVA DE SEGURANÇA
    if (targetUserId !== identity.subject && identity.subject !== "user_301NTkVsE3v48SXkoCEp0XOXifI") {
      const subAccount = await db.query("subAccounts").withIndex("by_sub_user", (q) => q.eq("subUserId", targetUserId)).first();
      if (!subAccount || subAccount.ownerUserId !== identity.subject) throw new Error("Acesso negado.");
    }

    const existing = await db
      .query("userCustomizations")
      .withIndex("by_user_id", (q) => q.eq("userId", targetUserId))
      .unique();

    if (existing && existing.profilePictureStorageId) {
      try {
        await storage.delete(existing.profilePictureStorageId);
      } catch (e) {
        console.warn("Falha ao deletar foto:", e);
      }

      await db.patch(existing._id, {
        profilePictureStorageId: undefined,
        profilePictureUrl: undefined,
      });
    }

    return null;
  },
});

// 🗑️ Remover imagem de background
export const removeBackgroundImage = mutation({
  args: { userId: v.optional(v.string()) }, // 🔥 NOVO
  returns: v.null(),
  handler: async ({ db, auth, storage }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const targetUserId = args.userId || identity.subject;

    // 🛡️ TRAVA DE SEGURANÇA
    if (targetUserId !== identity.subject && identity.subject !== "user_301NTkVsE3v48SXkoCEp0XOXifI") {
      const subAccount = await db.query("subAccounts").withIndex("by_sub_user", (q) => q.eq("subUserId", targetUserId)).first();
      if (!subAccount || subAccount.ownerUserId !== identity.subject) throw new Error("Acesso negado.");
    }

    const existing = await db
      .query("userCustomizations")
      .withIndex("by_user_id", (q) => q.eq("userId", targetUserId))
      .unique();

    if (existing && existing.backgroundImageStorageId) {
      try {
        await storage.delete(existing.backgroundImageStorageId);
      } catch (e) {
        console.warn("Falha ao deletar imagem de fundo:", e);
      }

      await db.patch(existing._id, {
        backgroundImageStorageId: undefined,
        backgroundImageUrl: undefined,
        backgroundType: "color",
      });
    }

    return null;
  },
});