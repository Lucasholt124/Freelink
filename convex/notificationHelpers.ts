import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// ============================================================================
// 📨 QUERIES (LEITURA)
// ============================================================================

export const getPostsToNotify = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    // Busca posts 'scheduled' onde o horário JÁ PASSOU
    const posts = await ctx.db
      .query("scheduledPosts")
      .withIndex("by_status", (q) => q.eq("status", "scheduled"))
      .filter((q) => q.lte(q.field("scheduledTimestamp"), now))
      .take(20);
    return posts;
  },
});

export const getPostById = internalQuery({
  args: { postId: v.id("scheduledPosts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.postId);
  },
});

export const getUserIntegrations = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const whatsapp = await ctx.db
      .query("whatsappIntegrations")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", args.userId).eq("active", true)
      )
      .first();

    const sms = await ctx.db
      .query("smsIntegrations")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", args.userId).eq("active", true)
      )
      .first();

    const push = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return { whatsapp, sms, push };
  },
});

// ============================================================================
// 🛠️ MUTATIONS (GRAVAÇÃO)
// ============================================================================

export const logNotification = internalMutation({
  args: {
    userId: v.string(),
    postId: v.id("scheduledPosts"),
    method: v.union(v.literal("whatsapp"), v.literal("sms"), v.literal("push"), v.literal("email")),
    recipient: v.string(),
    message: v.string(),
    status: v.union(v.literal("sent"), v.literal("failed"), v.literal("delivered"), v.literal("read")),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notificationLogs", {
      userId: args.userId,
      postId: args.postId,
      method: args.method,
      recipient: args.recipient,
      message: args.message,
      status: args.status,
      error: args.error,
      sentAt: Date.now(),
    });

    if (args.method === "whatsapp" && args.status === "sent") {
       const wpp = await ctx.db.query("whatsappIntegrations")
         .withIndex("by_user", (q) => q.eq("userId", args.userId))
         .first();
       if (wpp) {
         await ctx.db.patch(wpp._id, {
            messagesCount: (wpp.messagesCount || 0) + 1,
            lastMessageSent: Date.now()
         });
       }
    }
  },
});

export const updatePostStatus = internalMutation({
  args: {
    postId: v.id("scheduledPosts"),
    status: v.union(v.literal("notified"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.postId, {
      status: args.status,
      notificationSent: args.status === "notified",
      notificationSentAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const decrementSmsCredits = internalMutation({
  args: { smsId: v.id("smsIntegrations") },
  handler: async (ctx, args) => {
    const sms = await ctx.db.get(args.smsId);
    if (!sms) return;

    await ctx.db.patch(args.smsId, {
      creditsRemaining: Math.max(0, (sms.creditsRemaining ?? 0) - 1),
      smsCount: (sms.smsCount || 0) + 1,
      lastSmsSent: Date.now(),
      updatedAt: Date.now(),
    });
  },
});