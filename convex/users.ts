import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ======================================================
// 🔍 QUERIES DE LEITURA
// ======================================================

// Query PÚBLICA: Busca o objeto de usuário completo pelo seu username
export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    return user;
  },
});

// Busca o username do usuário atualmente autenticado
export const getMyUsername = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const user = await ctx.db
      .query("usernames")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();
    return user;
  },
});

// Query para buscar o plano do usuário atualmente autenticado
export const getMyPlan = query({
  handler: async (ctx): Promise<"free" | "pro" | "ultra"> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return "free";
    }

    const plan = (identity.public as { plan?: "free" | "pro" | "ultra" })?.plan;

    if (plan === "pro" || plan === "ultra") {
      return plan;
    }

    return "free";
  },
});

// Obter nome de usuário/slug para um usuário (retorna nome de usuário personalizado ou ID)
export const getUserSlug = query({
  args: { userId: v.string() },
  handler: async ({ db }, args) => {
    const usernameRecord = await db
      .query("usernames")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .unique();

    return usernameRecord?.username || args.userId;
  },
});

// Obter ID do usuário por nome de usuário/slug (para roteamento)
export const getUserIdBySlug = query({
  args: { slug: v.string() },
  handler: async ({ db }, args) => {
    // Primeiro tenta encontrar um nome de usuário personalizado
    const usernameRecord = await db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", args.slug))
      .unique();

    if (usernameRecord) {
      return usernameRecord.userId;
    }

    // Se não encontrar, verifica se é um ID direto olhando se tem links
    const links = await db
      .query("links")
      .withIndex("by_user", (q) => q.eq("userId", args.slug))
      .first();

    return links ? args.slug : null;
  },
});

// Verifique se o nome de usuário está disponível
export const checkUsernameAvailability = query({
  args: { username: v.string() },
  handler: async ({ db }, args) => {
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(args.username)) {
      return {
        available: false,
        error: "O nome de usuário só pode conter letras, números, hifens e sublinhados",
      };
    }

    if (args.username.length < 3 || args.username.length > 30) {
      return {
        available: false,
        error: "O nome de usuário deve ter entre 3 e 30 caracteres",
      };
    }

    const existingUsername = await db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    return { available: !existingUsername };
  },
});

// ======================================================
// ✏️ MUTATION (SEM LÓGICA DE MARKETING)
// ======================================================

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
        error: "O nome de usuário só pode conter letras, números, hifens e sublinhados",
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

    // Verifique se o usuário já possui um registro
    const currentRecord = await db
      .query("usernames")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (currentRecord) {
      // Atualizar registro existente
      await db.patch(currentRecord._id, { username: args.username });
    } else {
      // Create new record (AQUI VOLTOU AO NORMAL, APENAS USERID E USERNAME)
      await db.insert("usernames", {
        userId: identity.subject,
        username: args.username,
      });
    }

    return { success: true };
  },
});