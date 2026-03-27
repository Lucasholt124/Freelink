import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getOnboardingStatus = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let userId = args.userId;

    if (!userId) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) return null;
      userId = identity.subject;
    }

    // Busca o registro de onboarding
    const onboarding = await ctx.db
      .query("userOnboarding")
      .withIndex("by_user", (q) => q.eq("userId", userId!))
      .unique();

    // Se já completou, retorna direto
    if (onboarding?.completed === true) {
      return {
        ...onboarding,
        completed: true,
        hasSeenWelcome: onboarding.hasSeenWelcome ?? true,
      };
    }

    // Verifica se o usuário já tem links (usuário antigo)
    const userLinks = await ctx.db
      .query("links")
      .withIndex("by_user", (q) => q.eq("userId", userId!))
      .first();

    // Verifica se o usuário já tem username (usuário antigo)
    // CORRIGIDO: usa o índice correto "by_user_id"
    const userUsername = await ctx.db
      .query("usernames")
      .withIndex("by_user_id", (q) => q.eq("userId", userId!))
      .first();

    const isExistingUser = !!userLinks || !!userUsername;

    // Se NÃO tem registro de onboarding
    if (!onboarding) {
      if (isExistingUser) {
        return {
          completed: true,
          currentStep: 4,
          hasSeenWelcome: true,
          isExistingUser: true,
        };
      }

      return {
        completed: false,
        currentStep: 1,
        hasSeenWelcome: false,
        isExistingUser: false,
      };
    }

    // Tem registro mas NÃO completou
    if (!onboarding.completed) {
      if (isExistingUser) {
        return {
          ...onboarding,
          completed: true,
          currentStep: 4,
          hasSeenWelcome: true,
          isExistingUser: true,
        };
      }

      return {
        ...onboarding,
        completed: false,
        isExistingUser: false,
      };
    }

    return onboarding;
  },
});

export const updateOnboardingStep = mutation({
  args: {
    step: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;

    const existing = await ctx.db
      .query("userOnboarding")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        currentStep: args.step,
        ...(args.step >= 4 ? { completed: true, hasSeenWelcome: true } : {}),
      });
    } else {
      await ctx.db.insert("userOnboarding", {
        userId,
        currentStep: args.step,
        completed: args.step >= 4,
        hasSeenWelcome: args.step >= 4,
        steps: [
          { step: 1, name: "Username", completed: args.step > 1 },
          { step: 2, name: "Profile", completed: args.step > 2 },
          { step: 3, name: "Link", completed: args.step > 3 },
          { step: 4, name: "Success", completed: args.step >= 4 },
        ],
        createdAt: Date.now(),
      });
    }
  },
});

export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;

    const existing = await ctx.db
      .query("userOnboarding")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        completed: true,
        currentStep: 4,
        hasSeenWelcome: true,
      });
    } else {
      await ctx.db.insert("userOnboarding", {
        userId,
        currentStep: 4,
        completed: true,
        hasSeenWelcome: true,
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

export const dismissWelcome = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;

    const existing = await ctx.db
      .query("userOnboarding")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        hasSeenWelcome: true,
      });
    } else {
      await ctx.db.insert("userOnboarding", {
        userId,
        currentStep: 4,
        completed: true,
        hasSeenWelcome: true,
        steps: [],
        createdAt: Date.now(),
      });
    }
  },
});

export const ensureOnboardingComplete = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;

    const existing = await ctx.db
      .query("userOnboarding")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing?.completed) return { alreadyComplete: true };

    // Verifica se é usuário existente
    const userLinks = await ctx.db
      .query("links")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const userUsername = await ctx.db
      .query("usernames")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    const isExistingUser = !!userLinks || !!userUsername;

    if (isExistingUser) {
      if (existing) {
        await ctx.db.patch(existing._id, {
          completed: true,
          currentStep: 4,
          hasSeenWelcome: true,
        });
      } else {
        await ctx.db.insert("userOnboarding", {
          userId,
          currentStep: 4,
          completed: true,
          hasSeenWelcome: true,
          steps: [
            { step: 1, name: "Username", completed: true },
            { step: 2, name: "Profile", completed: true },
            { step: 3, name: "Link", completed: true },
            { step: 4, name: "Success", completed: true },
          ],
          createdAt: Date.now(),
        });
      }
      return { markedComplete: true };
    }

    return { isNewUser: true };
  },
});