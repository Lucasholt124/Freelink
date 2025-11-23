import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ======================================================
// 🔍 QUERIES DE LEITURA
// ======================================================

// Busca usuário por username (Pública)
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

// Busca o usuário logado atualmente
export const getMyUsername = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("usernames")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();
    return user;
  },
});

// Busca o plano do usuário logado
export const getMyPlan = query({
  handler: async (ctx): Promise<"free" | "pro" | "ultra"> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return "free";

    const plan = (identity.public as { plan?: "free" | "pro" | "ultra" })?.plan;
    if (plan === "pro" || plan === "ultra") return plan;

    return "free";
  },
});

// Busca slug/username ou retorna ID (Fallback)
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

// Busca ID pelo slug (Roteamento)
export const getUserIdBySlug = query({
  args: { slug: v.string() },
  handler: async ({ db }, args) => {
    const usernameRecord = await db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", args.slug))
      .unique();

    if (usernameRecord) return usernameRecord.userId;

    // Fallback: verifica se é um ID direto
    const links = await db
      .query("links")
      .withIndex("by_user", (q) => q.eq("userId", args.slug))
      .first();

    return links ? args.slug : null;
  },
});

// Verifica disponibilidade do username
export const checkUsernameAvailability = query({
  args: { username: v.string() },
  handler: async ({ db }, args) => {
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(args.username) || args.username.length < 3 || args.username.length > 30) {
      return { available: false, error: "Formato inválido" };
    }

    const existingUsername = await db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    return { available: !existingUsername };
  },
});

// ======================================================
// ✏️ MUTATION PRINCIPAL (COM CAPTURA DE MARKETING)
// ======================================================

export const setUsername = mutation({
  args: { username: v.string() },
  returns: v.object({ success: v.boolean(), error: v.optional(v.string()) }),
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // 1. Validações
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(args.username)) {
      return { success: false, error: "O nome de usuário só pode conter letras, números, hifens e sublinhados" };
    }
    if (args.username.length < 3 || args.username.length > 30) {
      return { success: false, error: "O nome de usuário deve ter entre 3 e 30 caracteres" };
    }

    // 2. Verifica se já existe (exceto se for do próprio usuário)
    const existingUsername = await db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    if (existingUsername && existingUsername.userId !== identity.subject) {
      return { success: false, error: "O nome de usuário já foi escolhido" };
    }

    // 3. Busca registro atual
    const currentRecord = await db
      .query("usernames")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (currentRecord) {
      // ✅ ATUALIZAÇÃO: Salva o novo nome E garante que temos o email salvo
      await db.patch(currentRecord._id, {
        username: args.username,
        email: currentRecord.email || identity.email,
      });
    } else {
      // ✅ CRIAÇÃO: Aqui configuramos a Automação de Marketing
      await db.insert("usernames", {
        userId: identity.subject,
        username: args.username,

        // CAPTURA DE DADOS PARA O RESEND:
        email: identity.email,        // Email do Clerk
        plan: "free",                 // Começa Free
        createdAt: Date.now(),        // Data de hoje
        marketingStage: 0,            // Inicia funil
      });
    }

    return { success: true };
  },
});