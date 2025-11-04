// convex/scheduledPosts.ts - CRUD Posts Agendados
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================
// MUTATIONS
// ============================================

export const createScheduledPost = mutation({
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
    autoPublish: v.optional(v.boolean()),
    mediaStorageId: v.optional(v.id("_storage")), // ✅ CORRIGIDO
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const scheduledTimestamp = new Date(`${args.scheduledDate}T${args.scheduledTime}`).getTime();

    const postId = await ctx.db.insert("scheduledPosts", {
      userId: identity.subject,
      campaignId: args.campaignId,
      contentType: args.contentType,
      contentData: args.contentData,
      caption: args.caption,
      hashtags: args.hashtags,
      scheduledDate: args.scheduledDate,
      scheduledTime: args.scheduledTime,
      scheduledTimestamp,
      platform: args.platform,
      status: args.autoPublish ? "queued" : "scheduled",
      autoPublish: args.autoPublish,
      mediaStorageId: args.mediaStorageId, // ✅ SALVA ID
      notificationSent: false,
      createdAt: Date.now(),
    });

    return postId;
  },
});

export const updateScheduledPost = mutation({
  args: {
    postId: v.id("scheduledPosts"),
    caption: v.optional(v.string()),
    hashtags: v.optional(v.array(v.string())),
    scheduledDate: v.optional(v.string()),
    scheduledTime: v.optional(v.string()),
    platform: v.optional(v.union(
      v.literal("instagram"),
      v.literal("facebook"),
      v.literal("linkedin"),
      v.literal("twitter")
    )),
    autoPublish: v.optional(v.boolean()),
    mediaStorageId: v.optional(v.id("_storage")),
    mediaUrl: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("queued"),
      v.literal("publishing"),
      v.literal("published"),
      v.literal("failed")
    )),
    bufferUpdateId: v.optional(v.string()),
    bufferProfileId: v.optional(v.string()),
    publishError: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const post = await ctx.db.get(args.postId);
    if (!post || post.userId !== identity.subject) {
      throw new Error("Post não encontrado");
    }

    const updates: Partial<typeof post> = {
      updatedAt: Date.now(),
    };

    if (args.caption !== undefined) updates.caption = args.caption;
    if (args.hashtags !== undefined) updates.hashtags = args.hashtags;
    if (args.platform !== undefined) updates.platform = args.platform;
    if (args.autoPublish !== undefined) updates.autoPublish = args.autoPublish;
    if (args.mediaStorageId !== undefined) updates.mediaStorageId = args.mediaStorageId;
    if (args.mediaUrl !== undefined) updates.mediaUrl = args.mediaUrl;
    if (args.status !== undefined) updates.status = args.status;
    if (args.bufferUpdateId !== undefined) updates.bufferUpdateId = args.bufferUpdateId;
    if (args.bufferProfileId !== undefined) updates.bufferProfileId = args.bufferProfileId;
    if (args.publishError !== undefined) updates.publishError = args.publishError;

    if (args.scheduledDate !== undefined || args.scheduledTime !== undefined) {
      const newDate = args.scheduledDate || post.scheduledDate;
      const newTime = args.scheduledTime || post.scheduledTime;
      const scheduledTimestamp = new Date(`${newDate}T${newTime}`).getTime();

      updates.scheduledDate = newDate;
      updates.scheduledTime = newTime;
      updates.scheduledTimestamp = scheduledTimestamp;
    }

    await ctx.db.patch(args.postId, updates);

    return args.postId;
  },
});

export const deleteScheduledPost = mutation({
  args: {
    postId: v.id("scheduledPosts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const post = await ctx.db.get(args.postId);
    if (!post || post.userId !== identity.subject) {
      throw new Error("Post não encontrado");
    }

    await ctx.db.delete(args.postId);

    return { success: true };
  },
});

// ============================================
// QUERIES
// ============================================

export const listPostsByCampaign = query({
  args: { campaignId: v.id("brainCampaigns") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const posts = await ctx.db
      .query("scheduledPosts")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    return posts.filter(p => p.userId === identity.subject);
  },
});

export const listAllPosts = query({
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

export const getPostsByDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const startTimestamp = new Date(args.startDate).getTime();
    const endTimestamp = new Date(args.endDate).getTime();

    const posts = await ctx.db
      .query("scheduledPosts")
      .withIndex("by_user_scheduled", (q) => q.eq("userId", identity.subject))
      .filter((q) =>
        q.and(
          q.gte(q.field("scheduledTimestamp"), startTimestamp),
          q.lte(q.field("scheduledTimestamp"), endTimestamp)
        )
      )
      .collect();

    return posts;
  },
});

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