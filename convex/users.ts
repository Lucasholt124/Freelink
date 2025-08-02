// Em convex/users.ts (VERSÃO CORRETA E SIMPLES)

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