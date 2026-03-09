import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// ID DO ADMIN MASTER
const ADMIN_USER_ID = "user_301NTkVsE3v48SXkoCEp0XOXifI";

// ============================================
// LIMITES POR PLANO
// ============================================
function getSubAccountLimit(plan: string): number {
  if (plan === "ultra") return 30;
  if (plan === "pro") return 10;
  return 0;
}

// ============================================
// QUERY: Busca todas as sub-contas de um usuário
// ============================================
export const getSubAccounts = query({
  args: { ownerUserId: v.string() },
  handler: async (ctx, { ownerUserId }) => {
    return await ctx.db
      .query("subAccounts")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", ownerUserId))
      .order("desc")
      .collect();
  },
});

// ============================================
// QUERY: Verifica se um username de sub-conta está disponível
// ============================================
export const checkSubAccountUsername = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const existingSubAccount = await ctx.db
      .query("subAccounts")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();

    if (existingSubAccount) return { available: false };

    const existingUsername = await ctx.db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();

    return { available: !existingUsername };
  },
});

// ============================================
// QUERY: Busca dados de uma sub-conta pelo subUserId
// ============================================
export const getSubAccountBySubUserId = query({
  args: { subUserId: v.string() },
  handler: async (ctx, { subUserId }) => {
    return await ctx.db
      .query("subAccounts")
      .withIndex("by_sub_user", (q) => q.eq("subUserId", subUserId))
      .first();
  },
});

// ============================================
// MUTATION: Cria uma nova sub-conta
// ============================================
export const createSubAccount = mutation({
  args: {
    ownerUserId: v.string(),
    username: v.string(),
    displayName: v.optional(v.string()),
  },
  handler: async (ctx, { ownerUserId, username, displayName }) => {
    const usernameRegex = /^[a-z0-9_-]{3,30}$/;
    if (!usernameRegex.test(username)) {
      throw new Error("Username inválido. Use 3-30 caracteres: letras, números, hífen ou underscore.");
    }

    const existingSubAccount = await ctx.db
      .query("subAccounts")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();

    if (existingSubAccount) {
      throw new Error("Este username já está em uso por outra página.");
    }

    const existingUsername = await ctx.db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();

    if (existingUsername) {
      throw new Error("Este username já está em uso.");
    }

    const subUserId = `sub_${ownerUserId}_${username}_${Date.now()}`;

    const subAccountId = await ctx.db.insert("subAccounts", {
      ownerUserId,
      subUserId,
      username,
      displayName: displayName || username,
      createdAt: Date.now(),
    });

    await ctx.db.insert("usernames", {
      userId: subUserId,
      username,
    });

    return {
      success: true,
      subAccountId,
      subUserId,
      username,
    };
  },
});

// ============================================
// MUTATION: Deleta uma sub-conta
// ============================================
export const deleteSubAccount = mutation({
  args: {
    subAccountId: v.id("subAccounts"),
  },
  handler: async (ctx, { subAccountId }) => {
    const subAccount = await ctx.db.get(subAccountId);
    if (!subAccount) {
      throw new Error("Sub-conta não encontrada.");
    }

    const { subUserId, username } = subAccount;

    const usernameRecord = await ctx.db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();

    if (usernameRecord) {
      await ctx.db.delete(usernameRecord._id);
    }

    const links = await ctx.db
      .query("links")
      .withIndex("by_user", (q) => q.eq("userId", subUserId))
      .collect();

    for (const link of links) {
      await ctx.db.delete(link._id);
    }

    const customizations = await ctx.db
      .query("userCustomizations")
      .withIndex("by_user_id", (q) => q.eq("userId", subUserId))
      .first();

    if (customizations) {
      await ctx.db.delete(customizations._id);
    }

    await ctx.db.delete(subAccountId);

    return { success: true };
  },
});

// ============================================
// MUTATION: Verifica limite de plano antes de criar
// ============================================
export const validateSubAccountLimit = mutation({
  args: {
    ownerUserId: v.string(),
    plan: v.string(),
  },
  handler: async (ctx, { ownerUserId, plan }) => {

    // MAGICA DO ADMIN NO BACKEND
    if (ownerUserId === ADMIN_USER_ID) {
        return { allowed: true, current: 0, limit: 999, remaining: 999 };
    }

    const limit = getSubAccountLimit(plan);

    if (limit === 0) {
      throw new Error("Seu plano não permite criar páginas adicionais. Assine o Pro ou Ultra.");
    }

    const existing = await ctx.db
      .query("subAccounts")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", ownerUserId))
      .collect();

    if (existing.length >= limit) {
      throw new Error(
        `Limite de ${limit} páginas atingido para o plano ${plan}. Faça upgrade para criar mais.`
      );
    }

    return {
      allowed: true,
      current: existing.length,
      limit,
      remaining: limit - existing.length,
    };
  },
});

// ============================================
// QUERY: Verifica se um userId é sub-conta
// ============================================
export const getOwnerOfSubAccount = query({
  args: { subUserId: v.string() },
  handler: async (ctx, { subUserId }) => {
    const subAccount = await ctx.db
      .query("subAccounts")
      .withIndex("by_sub_user", (q) => q.eq("subUserId", subUserId))
      .first();

    if (!subAccount) return null;

    return {
      ownerUserId: subAccount.ownerUserId,
      username: subAccount.username,
      displayName: subAccount.displayName,
    };
  },
});