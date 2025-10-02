import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ID do admin - defina aqui ou use variável de ambiente
const ADMIN_USER_ID = "user_2pDsdfaGFASDFasd"; // SUBSTITUA pelo seu ID de admin do Clerk

export const saveInstagramToken = mutation({
  args: {
    userId: v.string(),
    accessToken: v.string(),
    providerAccountId: v.string(),
    expiresIn: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verificar se é o admin
    const isAdmin = args.userId === ADMIN_USER_ID;

    if (!isAdmin) {
      throw new Error("Apenas o administrador pode conectar o Instagram");
    }

    // Deletar conexão antiga do Instagram se existir
    const existingConnection = await ctx.db
      .query("connections")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", ADMIN_USER_ID).eq("provider", "instagram")
      )
      .first();

    if (existingConnection) {
      await ctx.db.delete(existingConnection._id);
    }

    // Salvar nova conexão
    await ctx.db.insert("connections", {
      userId: ADMIN_USER_ID,
      provider: "instagram",
      providerAccountId: args.providerAccountId,
      accessToken: args.accessToken,
      tokenExpiresAt: args.expiresIn ? Date.now() + (args.expiresIn * 1000) : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getAdminInstagramToken = query({
  args: {},
  handler: async (ctx) => {
    const connection = await ctx.db
      .query("connections")
      .withIndex("by_user_provider", (q) =>
        q.eq("userId", ADMIN_USER_ID).eq("provider", "instagram")
      )
      .first();

    if (!connection) {
      return null;
    }

    // Verificar se o token expirou
    if (connection.tokenExpiresAt && connection.tokenExpiresAt < Date.now()) {
      return null;
    }

    return {
      accessToken: connection.accessToken,
      userId: connection.userId,
      isValid: true,
    };
  },
});

export const isUserAdmin = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return args.userId === ADMIN_USER_ID;
  },
});