// Em convex/users.ts

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

// --- QUERY 'getMyPlan' CORRIGIDA ---
// Busca o plano do usuário atualmente autenticado.
export const getMyPlan = query({
  handler: async (ctx): Promise<"free" | "pro" | "ultra"> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Se não houver usuário logado, o plano é 'free' por padrão.
      return "free";
    }

    // --- CORREÇÃO PRINCIPAL AQUI ---
    // Usamos uma "afirmação de tipo" para informar ao TypeScript a estrutura de `public`.
    // Dizemos a ele que esperamos um objeto que PODE ter uma propriedade `plan`.
    const plan = (identity.public as { plan?: "free" | "pro" | "ultra" })?.plan;

    // Se o 'plan' for um dos valores válidos, retorna ele. Senão, retorna 'free'.
    if (plan === "pro" || plan === "ultra") {
      return plan;
    }

    return "free";
  },
});