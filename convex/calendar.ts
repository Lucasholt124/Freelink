// convex/calendar.ts - CALENDÁRIO CUSTOMIZÁVEL COM TUDO
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================
// 📅 EVENTOS CUSTOMIZÁVEIS
// ============================================

export const createCustomEvent = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("meeting"),
      v.literal("task"),
      v.literal("reminder"),
      v.literal("deadline"),
      v.literal("custom")
    ),
    date: v.string(),
    time: v.optional(v.string()),
    duration: v.optional(v.number()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    reminderBefore: v.optional(v.number()),
    notificationMethods: v.array(
      v.union(
        v.literal("push"),
        v.literal("whatsapp"),
        v.literal("sms"),
        v.literal("email")
      )
    ),
    recurring: v.optional(v.boolean()),
    recurrenceRule: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const eventId = await ctx.db.insert("customCalendarEvents", {
      userId: identity.subject,
      title: args.title,
      description: args.description,
      type: args.type,
      date: args.date,
      time: args.time,
      duration: args.duration,
      color: args.color || "#8B5CF6",
      icon: args.icon || "📅",
      reminderBefore: args.reminderBefore,
      notificationMethods: args.notificationMethods,
      status: "pending",
      recurring: args.recurring,
      recurrenceRule: args.recurrenceRule,
      tags: args.tags,
      createdAt: Date.now(),
    });

    return eventId;
  },
});

export const updateCustomEvent = mutation({
  args: {
    eventId: v.id("customCalendarEvents"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    duration: v.optional(v.number()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    reminderBefore: v.optional(v.number()),
    notificationMethods: v.optional(
      v.array(
        v.union(
          v.literal("push"),
          v.literal("whatsapp"),
          v.literal("sms"),
          v.literal("email")
        )
      )
    ),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const event = await ctx.db.get(args.eventId);
    if (!event || event.userId !== identity.subject) {
      throw new Error("Evento não encontrado");
    }

    const { eventId, ...updates } = args;
    await ctx.db.patch(eventId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const deleteCustomEvent = mutation({
  args: { eventId: v.id("customCalendarEvents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const event = await ctx.db.get(args.eventId);
    if (!event || event.userId !== identity.subject) {
      throw new Error("Evento não encontrado");
    }

    await ctx.db.delete(args.eventId);
    return { success: true };
  },
});

export const getEventsByDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const events = await ctx.db
      .query("customCalendarEvents")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();

    return events;
  },
});

export const getEventsByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const events = await ctx.db
      .query("customCalendarEvents")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", identity.subject).eq("date", args.date)
      )
      .collect();

    return events;
  },
});

export const toggleEventStatus = mutation({
  args: {
    eventId: v.id("customCalendarEvents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const event = await ctx.db.get(args.eventId);
    if (!event || event.userId !== identity.subject) {
      throw new Error("Evento não encontrado");
    }

    const newStatus = event.status === "completed" ? "pending" : "completed";

    await ctx.db.patch(args.eventId, {
      status: newStatus,
      updatedAt: Date.now(),
    });

    return { success: true, newStatus };
  },
});

// ============================================
// ✏️ EDITAR POSTS AGENDADOS
// ============================================

export const updateScheduledPost = mutation({
  args: {
    postId: v.id("scheduledPosts"),
    caption: v.optional(v.string()),
    hashtags: v.optional(v.array(v.string())),
    scheduledDate: v.optional(v.string()),
    scheduledTime: v.optional(v.string()),
    platform: v.optional(
      v.union(
        v.literal("instagram"),
        v.literal("facebook"),
        v.literal("linkedin"),
        v.literal("twitter"),
        v.literal("tiktok")
      )
    ),
    mediaStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const post = await ctx.db.get(args.postId);
    if (!post || post.userId !== identity.subject) {
      throw new Error("Post não encontrado");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };

    // Registra histórico de edições
    if (args.caption && args.caption !== post.caption) {
      await ctx.db.insert("postEditHistory", {
        postId: args.postId,
        userId: identity.subject,
        fieldChanged: "caption",
        oldValue: post.caption,
        newValue: args.caption,
        editedAt: Date.now(),
      });
      updates.caption = args.caption;
    }

    if (args.hashtags) {
      await ctx.db.insert("postEditHistory", {
        postId: args.postId,
        userId: identity.subject,
        fieldChanged: "hashtags",
        oldValue: JSON.stringify(post.hashtags),
        newValue: JSON.stringify(args.hashtags),
        editedAt: Date.now(),
      });
      updates.hashtags = args.hashtags;
    }

    if (args.scheduledDate && args.scheduledDate !== post.scheduledDate) {
      updates.scheduledDate = args.scheduledDate;
    }

    if (args.scheduledTime && args.scheduledTime !== post.scheduledTime) {
      updates.scheduledTime = args.scheduledTime;
    }

    if (args.scheduledDate || args.scheduledTime) {
      const date = args.scheduledDate || post.scheduledDate;
      const time = args.scheduledTime || post.scheduledTime;
      updates.scheduledTimestamp = new Date(`${date}T${time}:00`).getTime();
    }

    if (args.platform) {
      updates.platform = args.platform;
    }

    if (args.mediaStorageId) {
      updates.mediaStorageId = args.mediaStorageId;
    }

    await ctx.db.patch(args.postId, updates);

    return { success: true };
  },
});

export const getPostEditHistory = query({
  args: { postId: v.id("scheduledPosts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const history = await ctx.db
      .query("postEditHistory")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("desc")
      .collect();

    return history;
  },
});

export const deleteScheduledPost = mutation({
  args: { postId: v.id("scheduledPosts") },
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
// 📊 ESTATÍSTICAS DO CALENDÁRIO
// ============================================

export const getCalendarStats = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // Posts agendados
    const posts = await ctx.db
      .query("scheduledPosts")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) =>
        q.and(
          q.gte(q.field("scheduledDate"), args.startDate),
          q.lte(q.field("scheduledDate"), args.endDate)
        )
      )
      .collect();

    // Eventos customizados
    const events = await ctx.db
      .query("customCalendarEvents")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();

    return {
      totalPosts: posts.length,
      totalEvents: events.length,
      byStatus: {
        scheduled: posts.filter((p) => p.status === "scheduled").length,
        completed: posts.filter((p) => p.status === "completed").length,
        notified: posts.filter((p) => p.status === "notified").length,
      },
      byPlatform: posts.reduce((acc, post) => {
        acc[post.platform] = (acc[post.platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      eventsByType: events.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  },
});