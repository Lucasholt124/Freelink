    "use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import webpush from "web-push";

// ============================================
// ENVIAR NOTIFICAÇÃO PUSH (ACTION)
// ============================================
export const sendPushNotification = action({
  args: {
    userId: v.string(),
    title: v.string(),
    body: v.string(),
    url: v.optional(v.string()),
    postId: v.optional(v.id("scheduledPosts")),
  },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.runQuery(internal.push.getSubscriptionsByUserId, {
      userId: args.userId,
    });

    if (subscriptions.length === 0) {
      console.log(`Usuário ${args.userId} não tem push subscriptions`);
      return { sent: 0, failed: 0 };
    }

    const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY!;
    const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      throw new Error("VAPID keys não configuradas");
    }

    webpush.setVapidDetails(
      "mailto:suporte@freelink.com",
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );

    const payload = JSON.stringify({
      title: args.title,
      body: args.body,
      url: args.url || "/dashboard/brain",
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
    });

    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            },
          },
          payload
        );

        sent++;

        if (args.postId) {
          await ctx.runMutation(internal.push.saveNotificationHistory, {
            userId: args.userId,
            postId: args.postId,
            title: args.title,
            body: args.body,
            success: true,
          });
        }
      } catch (error: unknown) {
        failed++;
        console.error(`Erro ao enviar push para ${sub.endpoint}:`, error);

        if (typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 410) {
          await ctx.runMutation(internal.push.removeInvalidSubscription, {
            endpoint: sub.endpoint,
          });
        }

        if (args.postId) {
          await ctx.runMutation(internal.push.saveNotificationHistory, {
            userId: args.userId,
            postId: args.postId,
            title: args.title,
            body: args.body,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    return { sent, failed };
  },
});