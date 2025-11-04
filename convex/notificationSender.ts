"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import webpush from "web-push";

export const processScheduledPosts = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("🔔 [CRON] Verificando posts agendados...");

    const posts = await ctx.runQuery(internal.notificationQueries.getPostsNeedingNotification);

    if (posts.length === 0) {
      console.log("✅ [CRON] Nenhum post agendado para agora");
      return { processed: 0 };
    }

    console.log(`📬 [CRON] Enviando ${posts.length} notificações...`);

    let processed = 0;

    for (const post of posts) {
      try {
        const platformNames: Record<string, string> = {
          instagram: "Instagram",
          tiktok: "TikTok",
          facebook: "Facebook",
          linkedin: "LinkedIn",
          twitter: "Twitter",
        };

        const contentTypeNames: Record<string, string> = {
          reel: "Reel",
          carousel: "Carrossel",
          image_post: "Post",
          story_sequence: "Stories",
        };

        const platformName = platformNames[post.platform] || post.platform;
        const contentTypeName = contentTypeNames[post.contentType] || post.contentType;

        const title = `🚀 Hora de Postar no ${platformName}!`;
        const body = `Seu ${contentTypeName} está pronto para ser publicado.`;
        const url = `/dashboard/brain/post/${post._id}`;

        const result = await ctx.runAction(internal.notificationSender.sendNotificationAction, {
          userId: post.userId,
          title,
          body,
          url,
          postId: post._id,
        });

        await ctx.runMutation(internal.notificationQueries.markPostAsNotified, {
          postId: post._id,
        });

        processed++;

        console.log(`✅ Notificação enviada: ${result.sent} sucesso, ${result.failed} falhas`);
      } catch (error: unknown) {
        console.error(`❌ Erro ao processar post ${post._id}:`, error);
      }
    }

    return { processed };
  },
});

export const sendNotificationAction = internalAction({
  args: {
    userId: v.string(),
    title: v.string(),
    body: v.string(),
    url: v.string(),
    postId: v.id("scheduledPosts"),
  },
  handler: async (ctx, args) => {
    const subscriptions = await ctx.runQuery(internal.notificationQueries.getSubscriptionsByUserId, {
      userId: args.userId,
    });

    if (subscriptions.length === 0) {
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
      url: args.url,
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

        await ctx.runMutation(internal.notificationQueries.saveNotificationHistory, {
          userId: args.userId,
          postId: args.postId,
          title: args.title,
          body: args.body,
          success: true,
        });
      } catch (error: unknown) {
        failed++;

        if (typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 410) {
          await ctx.runMutation(internal.notificationQueries.removeInvalidSubscription, {
            endpoint: sub.endpoint,
          });
        }

        await ctx.runMutation(internal.notificationQueries.saveNotificationHistory, {
          userId: args.userId,
          postId: args.postId,
          title: args.title,
          body: args.body,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return { sent, failed };
  },
});