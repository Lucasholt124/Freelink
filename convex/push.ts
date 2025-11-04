// SEM "use node" aqui!
import { v } from "convex/values";
import { mutation, query, internalQuery, internalMutation } from "./_generated/server";

// ============================================
// SALVAR PUSH SUBSCRIPTION DO USUÁRIO
// ============================================
export const savePushSubscription = mutation({
  args: {
    endpoint: v.string(),
    keys: v.object({
      p256dh: v.string(),
      auth: v.string(),
    }),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const userId = identity.subject;

    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastUsedAt: Date.now(),
      });
      return { subscriptionId: existing._id };
    }

    const subscriptionId = await ctx.db.insert("pushSubscriptions", {
      userId,
      endpoint: args.endpoint,
      keys: args.keys,
      userAgent: args.userAgent,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
    });

    return { subscriptionId };
  },
});

// ============================================
// REMOVER PUSH SUBSCRIPTION
// ============================================
export const removePushSubscription = mutation({
  args: {
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();

    if (subscription) {
      await ctx.db.delete(subscription._id);
    }

    return { success: true };
  },
});

// ============================================
// PEGAR SUBSCRIPTIONS DO USUÁRIO
// ============================================
export const getUserSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const userId = identity.subject;

    return await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// ============================================
// QUERIES E MUTATIONS INTERNAS
// ============================================
export const getSubscriptionsByUserId = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const saveNotificationHistory = internalMutation({
  args: {
    userId: v.string(),
    postId: v.id("scheduledPosts"),
    title: v.string(),
    body: v.string(),
    success: v.boolean(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notificationHistory", {
      userId: args.userId,
      postId: args.postId,
      title: args.title,
      body: args.body,
      sentAt: Date.now(),
      success: args.success,
      error: args.error,
    });
  },
});

export const removeInvalidSubscription = internalMutation({
  args: {
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .first();

    if (subscription) {
      await ctx.db.delete(subscription._id);
    }
  },
});

// ============================================
// HISTÓRICO DE NOTIFICAÇÕES DO USUÁRIO
// ============================================
export const getNotificationHistory = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const userId = identity.subject;

    return await ctx.db
      .query("notificationHistory")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});