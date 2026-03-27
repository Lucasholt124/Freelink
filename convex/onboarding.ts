import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the current onboarding status for the authenticated user.
 * If no record exists, it returns a default initial state.
 */
export const getOnboardingStatus = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let userId = args.userId;
    
    if (!userId) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) return null;
      userId = identity.subject;
    }

    const onboarding = await ctx.db
      .query("userOnboarding")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!onboarding) {
      return {
        completed: false,
        currentStep: 1,
        hasSeenWelcome: false,
      };
    }

    return onboarding;
  },
});

/**
 * Initialize or update the onboarding progress.
 */
export const updateOnboardingStep = mutation({
  args: {
    step: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("userOnboarding")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        currentStep: args.step,
      });
    } else {
      await ctx.db.insert("userOnboarding", {
        userId: identity.subject,
        currentStep: args.step,
        completed: false,
        hasSeenWelcome: false,
        steps: [
          { step: 1, name: "Username", completed: args.step > 1 },
          { step: 2, name: "Profile", completed: args.step > 2 },
          { step: 3, name: "Link", completed: args.step > 3 },
          { step: 4, name: "Success", completed: args.step > 4 },
        ],
        createdAt: Date.now(),
      });
    }
  },
});

/**
 * Mark the onboarding as completed.
 */
export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("userOnboarding")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        completed: true,
        currentStep: 4,
      });
    } else {
      await ctx.db.insert("userOnboarding", {
        userId: identity.subject,
        currentStep: 4,
        completed: true,
        hasSeenWelcome: false,
        steps: [
          { step: 1, name: "Username", completed: true },
          { step: 2, name: "Profile", completed: true },
          { step: 3, name: "Link", completed: true },
          { step: 4, name: "Success", completed: true },
        ],
        createdAt: Date.now(),
      });
    }
  },
});

/**
 * Mark the welcome modal as seen.
 */
export const dismissWelcome = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("userOnboarding")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        hasSeenWelcome: true,
      });
    } else {
      // Should not happen if they complete onboarding first, but for safety:
      await ctx.db.insert("userOnboarding", {
        userId: identity.subject,
        currentStep: 4,
        completed: true,
        hasSeenWelcome: true,
        steps: [],
        createdAt: Date.now(),
      });
    }
  },
});
