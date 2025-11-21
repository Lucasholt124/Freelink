"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import webPush from "web-push";

// Interface para tipagem dos resultados
interface NotificationResult {
  method: "whatsapp" | "sms" | "push" | "whatsapp_premium";
  success: boolean;
  error?: string;
  provider?: string;
}

// ============================================================================
// 🤖 CRON JOB: PROCESSADOR DE FILA
// ============================================================================

export const processScheduledPosts = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("🔄 [CRON] Iniciando processamento...");

    // ⚠️ ATENÇÃO: Certifique-se que o arquivo convex/notificationHelpers.ts existe!
    const posts = await ctx.runQuery(internal.notificationHelpers.getPostsToNotify);

    if (posts.length === 0) {
      return;
    }

    console.log(`📊 [CRON] Processando ${posts.length} posts...`);

    await Promise.all(
      posts.map(async (post) => {
        try {
          await ctx.runAction(internal.notificationSender.sendNotificationsForPost, {
            postId: post._id,
          });
        } catch (error) {
          console.error(`❌ [CRON] Erro no post ${post._id}:`, error);
        }
      })
    );
  },
});

// ============================================================================
// 🚀 ACTION: ENVIAR NOTIFICAÇÕES
// ============================================================================

export const sendNotificationsForPost = internalAction({
  args: { postId: v.id("scheduledPosts") },
  handler: async (ctx, args) => {
    // Busca post via helper
    const post = await ctx.runQuery(internal.notificationHelpers.getPostById, {
      postId: args.postId,
    });

    if (!post) {
      console.error(`❌ Post ${args.postId} não encontrado.`);
      return;
    }

    // Busca integrações via helper
    const integrations = await ctx.runQuery(
      internal.notificationHelpers.getUserIntegrations,
      { userId: post.userId }
    );

    const results: NotificationResult[] = [];
    let anySuccess = false;

    // --- CANAL 1: PUSH (Navegador) ---
    if (integrations.push && integrations.push.length > 0) {
      try {
        await sendPushNotification(integrations.push, post);
        results.push({ method: "push", success: true });
        anySuccess = true;
      } catch (error) {
        console.error("Erro no Push:", error);
        results.push({ method: "push", success: false, error: String(error) });
      }
    }

    // --- CANAL 2: WHATSAPP ---
    if (integrations.whatsapp?.active && integrations.whatsapp?.verified) {
      try {
        await sendWhatsApp(
          integrations.whatsapp.phoneNumber,
          post,
          integrations.whatsapp.provider || "evolution_api"
        );

        const postSummary = post.caption ? post.caption.slice(0, 20) + "..." : `Novo ${post.contentType}`;

        // Log de sucesso via helper
        await ctx.runMutation(internal.notificationHelpers.logNotification, {
          userId: post.userId,
          postId: args.postId,
          method: "whatsapp",
          recipient: integrations.whatsapp.phoneNumber,
          message: `Post: ${postSummary}`,
          status: "sent",
        });

        results.push({ method: "whatsapp", success: true });
        anySuccess = true;
      } catch (error) {
        console.error("Erro no WhatsApp:", error);

        // Log de erro via helper
        await ctx.runMutation(internal.notificationHelpers.logNotification, {
          userId: post.userId,
          postId: args.postId,
          method: "whatsapp",
          recipient: integrations.whatsapp.phoneNumber,
          message: "Falha no envio",
          status: "failed",
          error: String(error)
        });

        results.push({ method: "whatsapp", success: false, error: String(error) });
      }
    }

    // --- CANAL 3: SMS ---
    if (integrations.sms?.active && integrations.sms?.verified && (integrations.sms.creditsRemaining ?? 0) > 0) {
      try {
        await sendSMS(
          integrations.sms.phoneNumber,
          post,
          integrations.sms.provider
        );

        // Decrementa créditos via helper
        await ctx.runMutation(internal.notificationHelpers.decrementSmsCredits, {
          smsId: integrations.sms._id,
        });

        await ctx.runMutation(internal.notificationHelpers.logNotification, {
            userId: post.userId,
            postId: args.postId,
            method: "sms",
            recipient: integrations.sms.phoneNumber,
            message: "SMS enviado",
            status: "sent",
        });

        results.push({ method: "sms", success: true });
        anySuccess = true;
      } catch (error) {
        console.error("Erro no SMS:", error);
        results.push({ method: "sms", success: false, error: String(error) });
      }
    }

    // Atualiza status final via helper
    await ctx.runMutation(internal.notificationHelpers.updatePostStatus, {
      postId: args.postId,
      status: anySuccess ? "notified" : "failed",
    });

    console.log(`🏁 Post ${args.postId} processado. Resultados:`, JSON.stringify(results));
  },
});

// ============================================================================
// 🔌 FUNÇÕES DE ENVIO (NODE.JS)
// ============================================================================

async function sendWhatsApp(phoneNumber: string, post: Doc<"scheduledPosts">, provider: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://freelinnk.com";
  const postLink = `${appUrl}/dashboard/brain/post/${post._id}`;
  const captionSnippet = post.caption ? post.caption.slice(0, 100) : "Novo conteúdo";
  const message = `🔔 *Lembrete Freelinnk*\n\n🚀 Hora de postar no *${post.platform.toUpperCase()}*!\n\n📝 *Legenda:*\n${captionSnippet}...\n\n👇 *Clique para postar:*\n${postLink}`;

  if (provider === "evolution_api") {
    const apiUrl = process.env.EVOLUTION_API_URL;
    const apiKey = process.env.EVOLUTION_API_KEY;
    const instance = process.env.EVOLUTION_INSTANCE_NAME;

    if (!apiUrl || !apiKey || !instance) throw new Error("Evolution API não configurada");

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const response = await fetch(`${apiUrl}/message/sendText/${instance}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": apiKey },
      body: JSON.stringify({ number: cleanPhone, text: message }),
    });

    if (!response.ok) throw new Error(`Evolution API Falhou: ${response.status}`);
    return;
  }

  if (provider === "twilio") {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!accountSid || !authToken || !fromNumber) throw new Error("Twilio não configurado");

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ From: fromNumber, To: `whatsapp:${phoneNumber}`, Body: message }),
    });

    if (!response.ok) throw new Error("Twilio Error");
    return;
  }
}

async function sendPushNotification(subscriptions: Doc<"pushSubscriptions">[], post: Doc<"scheduledPosts">) {
  // ✅ AQUI ESTÁ A CORREÇÃO: Verifica os dois nomes possíveis para a chave
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail = process.env.VAPID_EMAIL || "mailto:admin@freelinnk.com";

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.error("CHAVES VAPID FALTANDO. Verifique o Dashboard do Convex.");
    return;
  }

  webPush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);

  const payload = JSON.stringify({
    title: "🚀 Hora de Postar!",
    body: `Seu post para ${post.platform} está pronto.`,
    icon: "/icon-192x192.png",
    url: `/dashboard/brain/post/${post._id}`,
  });

  const promises = subscriptions.map(async (sub) => {
    try {
      await webPush.sendNotification({
        endpoint: sub.endpoint,
        keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth }
      }, payload);
    } catch (error) {
      console.error("Falha push unitária", error);
    }
  });

  await Promise.all(promises);
}

async function sendSMS(phoneNumber: string, post: Doc<"scheduledPosts">, provider: string) {
  const message = `Freelinnk: Hora de postar! Acesse: bit.ly/flnk`;
  if (provider === "twilio") {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) return;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    await fetch(url, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ From: fromNumber, To: phoneNumber, Body: message }),
    });
  }
}