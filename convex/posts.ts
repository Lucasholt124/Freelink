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
    mediaStorageId: v.optional(v.id("_storage")), // ✅ CORRIGIDO
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const userId = identity.subject;

    const [hours, minutes] = args.scheduledTime.split(':').map(Number);
    const scheduledDate = new Date(args.scheduledDate);
    scheduledDate.setHours(hours, minutes, 0, 0);
    const scheduledTimestamp = scheduledDate.getTime();

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
      mediaStorageId: args.mediaStorageId, // ✅ SALVA ID
      createdAt: Date.now(),
    });

    return postId;
  },
});

// ============================================
// LISTAR POSTS AGENDADOS DO USUÁRIO
// ============================================
export const listScheduledPosts = query({
  args: {
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
    if (!identity) return [];

    const userId = identity.subject;

    let posts = await ctx.db
      .query("scheduledPosts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    if (args.status) {
      posts = posts.filter((p) => p.status === args.status);
    }

    return posts;
  },
});

// ============================================
// PEGAR POSTS POR CAMPANHA
// ============================================
export const getPostsByCampaign = query({
  args: {
    campaignId: v.id("brainCampaigns"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const posts = await ctx.db
      .query("scheduledPosts")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .order("desc")
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

    const userId = identity.subject;

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post não encontrado");
    if (post.userId !== userId) throw new Error("Sem permissão");

    const updates: Partial<Doc<"scheduledPosts">> = {
      updatedAt: Date.now(),
    };

    if (args.caption !== undefined) updates.caption = args.caption;
    if (args.hashtags !== undefined) updates.hashtags = args.hashtags;
    if (args.status !== undefined) updates.status = args.status;

    // Se mudou data/hora, recalcular timestamp
    if (args.scheduledDate || args.scheduledTime) {
      const date = args.scheduledDate || post.scheduledDate;
      const time = args.scheduledTime || post.scheduledTime;

      const [hours, minutes] = time.split(':').map(Number);
      const scheduledDate = new Date(date);
      scheduledDate.setHours(hours, minutes, 0, 0);

      updates.scheduledDate = date;
      updates.scheduledTime = time;
      updates.scheduledTimestamp = scheduledDate.getTime();
      updates.notificationSent = false; // Reset notificação
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
  args: {
    postId: v.id("scheduledPosts"),
    performance: v.optional(
      v.object({
        views: v.optional(v.number()),
        likes: v.optional(v.number()),
        comments: v.optional(v.number()),
        shares: v.optional(v.number()),
        saves: v.optional(v.number()),
        reach: v.optional(v.number()),
        engagement: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const userId = identity.subject;

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post não encontrado");
    if (post.userId !== userId) throw new Error("Sem permissão");

    await ctx.db.patch(args.postId, {
      status: "completed",
      performance: args.performance,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// ============================================
// PEGAR POST INDIVIDUAL
// ============================================
export const getPost = query({
  args: {
    postId: v.id("scheduledPosts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const userId = identity.subject;

    const post = await ctx.db.get(args.postId);
    if (!post) return null;
    if (post.userId !== userId) return null;

    return post;
  },
});