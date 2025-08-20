import { v } from "convex/values";
import { query } from "./_generated/server";

// Query PÚBLICA: Busca o objeto de usuário completo pelo seu username
export const getUserByUsername = query({
    args: { username: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("usernames")
            .withIndex("by_username", q => q.eq("username", args.username))
            .first();

        return user; // Retorna o objeto { _id, userId, username } ou null
    }
});

// --- NOVA FUNÇÃO ADICIONADA AQUI ---
// Busca o username do usuário atualmente autenticado.
export const getMyUsername = query({
  handler: async (ctx) => {
    // Pega a identidade do usuário logado
    const identity = await ctx.auth.getUserIdentity();

    // Se não houver usuário logado, retorna null
    if (!identity) {
      return null;
    }

    // Busca na tabela 'usernames' pelo userId correspondente
    const user = await ctx.db
      .query("usernames")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    // Retorna o objeto do usuário (que contém o username) ou null se não encontrar
    return user;
  },
});


// Query para buscar o plano do usuário atualmente autenticado.
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