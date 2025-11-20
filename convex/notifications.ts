// convex/notifications.ts - SISTEMA DE NOTIFICAÇÕES MULTI-CANAL
import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// ============================================
// 📱 WHATSAPP INTEGRATION
// ============================================

export const addWhatsAppIntegration = mutation({
  args: {
    phoneNumber: v.string(),
    provider: v.union(
      v.literal("twilio"),
      v.literal("wppconnect"),
      v.literal("evolution_api")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    // Gera código de verificação
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutos

    const integrationId = await ctx.db.insert("whatsappIntegrations", {
      userId: identity.subject,
      phoneNumber: args.phoneNumber,
      verified: false,
      verificationCode: code,
      verificationExpiry: expiry,
      provider: args.provider,
      active: false,
      messagesCount: 0,
      createdAt: Date.now(),
    });

    // TODO: Enviar código via provider escolhido
    // Por enquanto, retorna código para teste
    return { integrationId, verificationCode: code };
  },
});

export const verifyWhatsApp = mutation({
  args: {
    integrationId: v.id("whatsappIntegrations"),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const integration = await ctx.db.get(args.integrationId);
    if (!integration || integration.userId !== identity.subject) {
      throw new Error("Integração não encontrada");
    }

    if (!integration.verificationCode || !integration.verificationExpiry) {
      throw new Error("Código não gerado");
    }

    if (Date.now() > integration.verificationExpiry) {
      throw new Error("Código expirado");
    }

    if (integration.verificationCode !== args.code) {
      throw new Error("Código inválido");
    }

    await ctx.db.patch(args.integrationId, {
      verified: true,
      active: true,
      verificationCode: undefined,
      verificationExpiry: undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getWhatsAppIntegration = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const integration = await ctx.db
      .query("whatsappIntegrations")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", identity.subject).eq("active", true)
      )
      .first();

    return integration;
  },
});

export const toggleWhatsApp = mutation({
  args: { active: v.boolean() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const integration = await ctx.db
      .query("whatsappIntegrations")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.eq(q.field("verified"), true))
      .first();

    if (!integration) {
      throw new Error("Configure o WhatsApp primeiro");
    }

    await ctx.db.patch(integration._id, {
      active: args.active,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// ============================================
// 📲 SMS INTEGRATION
// ============================================

export const addSmsIntegration = mutation({
  args: {
    phoneNumber: v.string(),
    provider: v.union(
      v.literal("twilio"),
      v.literal("zenvia"),
      v.literal("total_voice")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000;

    const integrationId = await ctx.db.insert("smsIntegrations", {
      userId: identity.subject,
      phoneNumber: args.phoneNumber,
      verified: false,
      verificationCode: code,
      verificationExpiry: expiry,
      provider: args.provider,
      active: false,
      creditsRemaining: 10, // 10 SMS grátis
      smsCount: 0,
      createdAt: Date.now(),
    });

    return { integrationId, verificationCode: code };
  },
});

export const verifySms = mutation({
  args: {
    integrationId: v.id("smsIntegrations"),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const integration = await ctx.db.get(args.integrationId);
    if (!integration || integration.userId !== identity.subject) {
      throw new Error("Integração não encontrada");
    }

    if (!integration.verificationCode || !integration.verificationExpiry) {
      throw new Error("Código não gerado");
    }

    if (Date.now() > integration.verificationExpiry) {
      throw new Error("Código expirado");
    }

    if (integration.verificationCode !== args.code) {
      throw new Error("Código inválido");
    }

    await ctx.db.patch(args.integrationId, {
      verified: true,
      active: true,
      verificationCode: undefined,
      verificationExpiry: undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const getSmsIntegration = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const integration = await ctx.db
      .query("smsIntegrations")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", identity.subject).eq("active", true)
      )
      .first();

    return integration;
  },
});

export const toggleSms = mutation({
  args: { active: v.boolean() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const integration = await ctx.db
      .query("smsIntegrations")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.eq(q.field("verified"), true))
      .first();

    if (!integration) {
      throw new Error("Configure o SMS primeiro");
    }

    await ctx.db.patch(integration._id, {
      active: args.active,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// ============================================
// 🔔 ENVIO DE NOTIFICAÇÕES
// ============================================

export const sendPostNotification = action({
  args: {
    postId: v.id("scheduledPosts"),
    methods: v.array(
      v.union(
        v.literal("push"),
        v.literal("whatsapp"),
        v.literal("sms")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const post = await ctx.runQuery(api.posts.getPost, {
      postId: args.postId
    });

    if (!post) throw new Error("Post não encontrado");

    const message = `🔔 *FreelinkBrain*\n\n⏰ Hora de postar!\n\n📝 *${post.caption.slice(0, 50)}...*\n\n📱 Plataforma: ${post.platform}\n🕒 ${post.scheduledTime}\n\n👉 Acesse: https://app.freelink.com/brain/post/${post._id}`;

    const results = [];

    for (const method of args.methods) {
      try {
        if (method === "whatsapp") {
          const whatsapp = await ctx.runQuery(
            api.notifications.getWhatsAppIntegration,
            {}
          );

          if (whatsapp?.active) {
            // TODO: Integração real com provider
            await ctx.runMutation(api.notifications.logNotification, {
              postId: args.postId,
              method: "whatsapp",
              recipient: whatsapp.phoneNumber,
              message,
              status: "sent",
            });
            results.push({ method: "whatsapp", success: true });
          }
        }

        if (method === "sms") {
          const sms = await ctx.runQuery(
            api.notifications.getSmsIntegration,
            {}
          );

          if (sms?.active && (sms.creditsRemaining ?? 0) > 0) {
            // TODO: Integração real com provider
            await ctx.runMutation(api.notifications.logNotification, {
              postId: args.postId,
              method: "sms",
              recipient: sms.phoneNumber,
              message: message.slice(0, 160), // Limita SMS
              status: "sent",
            });
            results.push({ method: "sms", success: true });
          }
        }

        if (method === "push") {
          // Usa sistema existente de push
          results.push({ method: "push", success: true });
        }
      } catch (error) {
        results.push({
          method,
          success: false,
          error: error instanceof Error ? error.message : "Erro desconhecido"
        });
      }
    }

    return results;
  },
});

export const logNotification = mutation({
  args: {
    postId: v.id("scheduledPosts"),
    method: v.union(
      v.literal("push"),
      v.literal("whatsapp"),
      v.literal("sms"),
      v.literal("email")
    ),
    recipient: v.string(),
    message: v.string(),
    status: v.union(
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("failed"),
      v.literal("read")
    ),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    await ctx.db.insert("notificationLogs", {
      userId: identity.subject,
      postId: args.postId,
      method: args.method,
      recipient: args.recipient,
      message: args.message,
      status: args.status,
      error: args.error,
      sentAt: Date.now(),
    });
  },
});

export const getNotificationStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const whatsapp = await ctx.db
      .query("whatsappIntegrations")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    const sms = await ctx.db
      .query("smsIntegrations")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    const logs = await ctx.db
      .query("notificationLogs")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(100);

    return {
      whatsapp: {
        active: whatsapp?.active ?? false,
        verified: whatsapp?.verified ?? false,
        messagesCount: whatsapp?.messagesCount ?? 0,
      },
      sms: {
        active: sms?.active ?? false,
        verified: sms?.verified ?? false,
        creditsRemaining: sms?.creditsRemaining ?? 0,
        smsCount: sms?.smsCount ?? 0,
      },
      logs,
    };
  },
});