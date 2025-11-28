// convex/posts.ts - MUTATIONS PARA POSTS AGENDADOS
import { v } from "convex/values";
import {  mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";


// ============================================
// CRIAR POST AGENDADO
// ============================================
export const schedulePost = mutation({
  args: {
    campaignId: v.id("brainCampaigns"),
    contentType: v.union(
      v.literal("reel"),
      v.literal("carousel"),
      v.literal("image_post"),
      v.literal("story_sequence")
    ),
    contentData: v.string(),
    caption: v.string(),
    hashtags: v.array(v.string()),
    scheduledDate: v.string(),
    scheduledTime: v.string(),
    platform: v.union(
      v.literal("instagram"),
      v.literal("facebook"),
      v.literal("linkedin"),
      v.literal("twitter"),
      v.literal("tiktok")
    ),
    mediaStorageId: v.optional(v.id("_storage")),
    userTimezone: v.optional(v.string()), // NOVO: timezone do usuário
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const userId = identity.subject;

    // Criar data no formato ISO local do usuário
    const localDateTime = `${args.scheduledDate}T${args.scheduledTime}:00`;

    // Converter para timestamp UTC corretamente
    // O frontend já envia a data no timezone local, então só precisamos parsear
    const scheduledTimestamp = new Date(localDateTime).getTime();

    // Log para debug
    console.log(`📅 Agendamento criado:`, {
      dateInput: args.scheduledDate,
      timeInput: args.scheduledTime,
      localDateTime,
      timestamp: scheduledTimestamp,
      timestampISO: new Date(scheduledTimestamp).toISOString(),
      timezone: args.userTimezone || 'America/Fortaleza'
    });

    // Validação
    const now = Date.now();
    if (scheduledTimestamp < now - (5 * 60 * 1000)) { // 5min de tolerância
      throw new Error("Não é possível agendar para o passado");
    }

    const postId = await ctx.db.insert("scheduledPosts", {
      userId,
      campaignId: args.campaignId,
      contentType: args.contentType,
      contentData: args.contentData,
      caption: args.caption,
      hashtags: args.hashtags,
      scheduledDate: args.scheduledDate,
      scheduledTime: args.scheduledTime,
      scheduledTimestamp,
      platform: args.platform,
      status: "scheduled",
      notificationSent: false,
      mediaStorageId: args.mediaStorageId,
      createdAt: Date.now(),
    });

    return postId;
  },
});

// ============================================
// LISTAR POSTS AGENDADOS DO USUÁRIO
// ============================================
export const listScheduledPosts = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const posts = await ctx.db
      .query("scheduledPosts")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    return posts;
  },
});

// ============================================
// PEGAR POSTS POR CAMPANHA
// ============================================
export const getPostsByCampaign = query({
  args: { campaignId: v.id("brainCampaigns") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const posts = await ctx.db
      .query("scheduledPosts")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    return posts;
  },
});

// ============================================
// PEGAR POSTS POR PERÍODO (para calendário)
// ============================================
export const getPostsByDateRange = query({
  args: {
    startDate: v.string(), // YYYY-MM-DD
    endDate: v.string(),   // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const posts = await ctx.db
      .query("scheduledPosts")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.and(q.gte(q.field("scheduledDate"), args.startDate), q.lte(q.field("scheduledDate"), args.endDate)))
      .collect();

    return posts;
  },
});


// ============================================
// ATUALIZAR POST
// ============================================
export const updatePost = mutation({
  args: {
    postId: v.id("scheduledPosts"),
    caption: v.optional(v.string()),
    hashtags: v.optional(v.array(v.string())),
    scheduledDate: v.optional(v.string()),
    scheduledTime: v.optional(v.string()),
    mediaStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("scheduled"),
        v.literal("notified"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const post = await ctx.db.get(args.postId);
    if (!post || post.userId !== identity.subject) {
      throw new Error("Post não encontrado");
    }

    const updates: Partial<Doc<"scheduledPosts">> = {
      updatedAt: Date.now(),
    };

    if (args.caption !== undefined) updates.caption = args.caption;
    if (args.hashtags !== undefined) updates.hashtags = args.hashtags;
    if (args.status !== undefined) updates.status = args.status;

    // 🔥 NOVO: Permitir atualizar mídia
    if (args.mediaStorageId !== undefined) {
      updates.mediaStorageId = args.mediaStorageId || undefined;
    }

    if (args.scheduledDate || args.scheduledTime) {
      const date = args.scheduledDate || post.scheduledDate;
      const time = args.scheduledTime || post.scheduledTime;

      const localDateTime = `${date}T${time}:00`;
      const scheduledTimestamp = new Date(localDateTime).getTime();

      console.log(`📅 Post atualizado:`, {
        date,
        time,
        localDateTime,
        timestamp: scheduledTimestamp,
        timestampISO: new Date(scheduledTimestamp).toISOString()
      });

      updates.scheduledDate = date;
      updates.scheduledTime = time;
      updates.scheduledTimestamp = scheduledTimestamp;
      updates.notificationSent = false;
    }

    await ctx.db.patch(args.postId, updates);

    return { success: true };
  },
});

// ============================================
// DELETAR POST
// ============================================
export const deletePost = mutation({
  args: {
    postId: v.id("scheduledPosts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const userId = identity.subject;

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post não encontrado");
    if (post.userId !== userId) throw new Error("Sem permissão");

    await ctx.db.delete(args.postId);

    return { success: true };
  },
});

// ============================================
// MARCAR COMO COMPLETADO (usuário postou manualmente)
// ============================================
export const markAsCompleted = mutation({
  args: { postId: v.id("scheduledPosts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const post = await ctx.db.get(args.postId);
    if (!post || post.userId !== identity.subject) {
      throw new Error("Post não encontrado");
    }

    await ctx.db.patch(args.postId, {
      status: "completed",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// ============================================
// PEGAR POST INDIVIDUAL
// ============================================
export const getPost = query({
  args: { postId: v.id("scheduledPosts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const post = await ctx.db.get(args.postId);

    if (!post || post.userId !== identity.subject) {
      return null;
    }

    return post;
  },
});