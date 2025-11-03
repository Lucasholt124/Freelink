// convex/brainCampaigns.ts - CRUD Campanhas
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================
// MUTATIONS
// ============================================

export const createCampaign = mutation({
  args: {
    theme: v.string(),
    themeSummary: v.string(),
    targetAudience: v.string(),
    viralStrategy: v.object({
      best_times: v.array(v.string()),
      hashtag_strategy: v.string(),
      engagement_hacks: v.array(v.string()),
    }),
    contentPack: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const campaignId = await ctx.db.insert("brainCampaigns", {
      userId: identity.subject,
      theme: args.theme,
      themeSummary: args.themeSummary,
      targetAudience: args.targetAudience,
      viralStrategy: args.viralStrategy,
      contentPack: args.contentPack,
      favorite: false,
      createdAt: Date.now(),
    });

    return campaignId;
  },
});

export const updateCampaign = mutation({
  args: {
    campaignId: v.id("brainCampaigns"),
    favorite: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.userId !== identity.subject) {
      throw new Error("Campanha não encontrada");
    }

    await ctx.db.patch(args.campaignId, {
      favorite: args.favorite,
      notes: args.notes,
      updatedAt: Date.now(),
    });

    return args.campaignId;
  },
});

export const deleteCampaign = mutation({
  args: {
    campaignId: v.id("brainCampaigns"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado");

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.userId !== identity.subject) {
      throw new Error("Campanha não encontrada");
    }

    // Deletar posts associados
    const posts = await ctx.db
      .query("scheduledPosts")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    for (const post of posts) {
      await ctx.db.delete(post._id);
    }

    await ctx.db.delete(args.campaignId);

    return { success: true };
  },
});

// ============================================
// QUERIES
// ============================================

export const listCampaigns = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const campaigns = await ctx.db
      .query("brainCampaigns")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    return campaigns;
  },
});

export const getCampaign = query({
  args: { campaignId: v.id("brainCampaigns") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign || campaign.userId !== identity.subject) {
      return null;
    }

    return campaign;
  },
});

export const getCurrentCampaign = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const campaigns = await ctx.db
      .query("brainCampaigns")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(1);

    return campaigns[0] || null;
  },
});