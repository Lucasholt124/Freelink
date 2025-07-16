import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// 🔍 Obter nome de usuário/slug para um usuário (retorna nome de usuário personalizado ou retorna para ID do funcionário)
export const getUserSlug = query({
  args: { userId: v.string() },
  returns: v.string(),
  handler: async ({ db }, args) => {
    const usernameRecord = await db
      .query("usernames")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .unique();

    // Retornar nome de usuário personalizado se existir, caso contrário, retornar ID do funcionário como fallback
    return usernameRecord?.username || args.userId;
  },
});

// 🌐 Obter ID do usuário por nome de usuário/slug (para roteamento de página pública)
export const getUserIdBySlug = query({
  args: { slug: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async ({ db }, args) => {
    // Primeiro tente encontrar um nome de usuário personalizado
    const usernameRecord = await db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", args.slug))
      .unique();

    if (usernameRecord) {
      return usernameRecord.userId;
    }
// Se nenhum nome de usuário personalizado for encontrado, trate o slug como um possível ID de funcionário
// Precisaremos verificar se este usuário realmente existe, verificando se ele possui links
    const links = await db
      .query("links")
      .withIndex("by_user", (q) => q.eq("userId", args.slug))
      .first();

    return links ? args.slug : null;
  },
});

// ✏️ Definir/atualizar nome de usuário para um usuário
export const setUsername = mutation({
  args: { username: v.string() },
  returns: v.object({ success: v.boolean(), error: v.optional(v.string()) }),
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(args.username)) {
      return {
        success: false,
        error:
          "O nome de usuário só pode conter letras, números, hifens e sublinhados",
      };
    }

    if (args.username.length < 3 || args.username.length > 30) {
      return {
        success: false,
        error: "O nome de usuário deve ter entre 3 e 30 caracteres",
      };
    }

    // Verifique se o nome de usuário já foi escolhido
    const existingUsername = await db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    if (existingUsername && existingUsername.userId !== identity.subject) {
      return { success: false, error: "O nome de usuário já foi escolhido" };
    }

    // Verifique se o usuário já possui um registro de nome de usuário
    const currentRecord = await db
      .query("usernames")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (currentRecord) {
      // Atualizar registro existente
      await db.patch(currentRecord._id, { username: args.username });
    } else {
      // Create new record
      await db.insert("usernames", {
        userId: identity.subject,
        username: args.username,
      });
    }

    return { success: true };
  },
});

// 🔍 Verifique se o nome de usuário está disponível
export const checkUsernameAvailability = query({
  args: { username: v.string() },
  returns: v.object({ available: v.boolean(), error: v.optional(v.string()) }),
  handler: async ({ db }, args) => {
    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(args.username)) {
      return {
        available: false,
        error:
          "O nome de usuário só pode conter letras, números, hifens e sublinhados",
      };
    }

    if (args.username.length < 3 || args.username.length > 30) {
      return {
        available: false,
        error: "O nome de usuário deve ter entre 3 e 30 caracteres",
      };
    }

    // Verifique se o nome de usuário já foi escolhido
    const existingUsername = await db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    return { available: !existingUsername };
  },
});