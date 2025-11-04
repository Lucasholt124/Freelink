// convex/notificationQueries.ts
// SEM "use node" - arquivo para queries e mutations
import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

// QUERY: PEGAR POSTS QUE PRECISAM DE NOTIFICAÇÃO
export const getPostsNeedingNotification = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const posts = await ctx.db
      .query("scheduledPosts")
      .withIndex("by_notification_pending", (q) =>
        q.eq("notificationSent", false)
      )
      .collect();

    return posts.filter((p) => p.scheduledTimestamp <= now && p.status === "scheduled");
  },
});

// QUERY: PEGAR SUBSCRIPTIONS DO USUÁRIO
export const getSubscriptionsByUserId = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// MUTATION: MARCAR POST COMO NOTIFICADO
export const markPostAsNotified = internalMutation({
  args: {
    postId: v.id("scheduledPosts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.postId, {
      notificationSent: true,
      notificationSentAt: Date.now(),
      status: "notified",
      updatedAt: Date.now(),
    });
  },
});

// MUTATION: SALVAR HISTÓRICO DE NOTIFICAÇÃO
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

// MUTATION: REMOVER SUBSCRIPTION INVÁLIDA
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