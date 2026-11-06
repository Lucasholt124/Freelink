import { mutation, query, type MutationCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import {
  onboardingSteps,
  resolveOnboardingStatus,
  normalizeLinkUrl,
  usernameError,
} from "./lib/onboarding_utils";
import type { Doc } from "./_generated/dataModel";

async function requireUser(ctx: { auth: MutationCtx["auth"] }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError("Entre na sua conta para continuar.");
  return identity.subject;
}

async function progressFor(ctx: Pick<MutationCtx, "db">, userId: string) {
  return ctx.db
    .query("userOnboarding")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
}

async function saveProgress(
  ctx: MutationCtx,
  userId: string,
  nextStep: number,
  existing: Doc<"userOnboarding"> | null,
) {
  const currentStep = Math.max(existing?.currentStep ?? 1, nextStep);
  const values = {
    currentStep,
    completed: existing?.completed ?? false,
    hasSeenWelcome: existing?.hasSeenWelcome ?? false,
    steps: onboardingSteps(currentStep, existing?.completed),
  };
  if (existing) {
    await ctx.db.patch(existing._id, values);
    return existing._id;
  }
  return ctx.db.insert("userOnboarding", {
    userId,
    ...values,
    createdAt: Date.now(),
  });
}

function requireEditable(progress: Doc<"userOnboarding"> | null) {
  if (progress?.completed)
    throw new ConvexError(
      "Sua configuração já foi concluída. Edite sua página pelo painel.",
    );
}

export const getOnboardingStatus = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = args.userId ?? (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) return null;
    const progress = await ctx.db
      .query("userOnboarding")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (progress) return resolveOnboardingStatus(progress, false);
    const [username, link] = await Promise.all([
      ctx.db
        .query("usernames")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .first(),
      ctx.db
        .query("links")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first(),
    ]);
    return resolveOnboardingStatus(null, !!username || !!link);
  },
});

export const getOnboardingData = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = identity.subject;
    const [progress, profile, username, firstLink] = await Promise.all([
      ctx.db
        .query("userOnboarding")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .unique(),
      ctx.db
        .query("userCustomizations")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .unique(),
      ctx.db
        .query("usernames")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .unique(),
      ctx.db
        .query("links")
        .withIndex("by_user_and_order", (q) => q.eq("userId", userId))
        .order("asc")
        .first(),
    ]);
    const photoUrl = profile?.profilePictureStorageId
      ? await ctx.storage.getUrl(profile.profilePictureStorageId)
      : profile?.profilePictureUrl;
    return {
      status: resolveOnboardingStatus(progress, !!username || !!firstLink),
      profile: profile
        ? {
            displayName: profile.displayName ?? "",
            bio: profile.description ?? "",
            photoUrl: photoUrl ?? null,
          }
        : null,
      username: username?.username ?? "",
      firstLink: firstLink
        ? { title: firstLink.title, url: firstLink.url }
        : null,
    };
  },
});

export const saveProfile = mutation({
  args: {
    displayName: v.string(),
    bio: v.string(),
    photoStorageId: v.optional(v.id("_storage")),
    photoUrl: v.optional(v.string()),
    removePhoto: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const name = args.displayName.trim();
    if (!name || name.length > 80)
      throw new ConvexError("Informe um nome com até 80 caracteres.");
    if (args.bio.trim().length > 150)
      throw new ConvexError("A bio deve ter até 150 caracteres.");
    if (args.photoUrl && !args.photoUrl.startsWith("https://"))
      throw new ConvexError(
        "A foto de perfil precisa usar um endereço seguro.",
      );
    const [progress, existing] = await Promise.all([
      progressFor(ctx, userId),
      ctx.db
        .query("userCustomizations")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .unique(),
    ]);
    requireEditable(progress);
    const updates: Partial<Doc<"userCustomizations">> = {
      displayName: name,
      description: args.bio.trim(),
    };
    if (args.removePhoto) {
      updates.profilePictureStorageId = undefined;
      updates.profilePictureUrl = undefined;
    } else if (args.photoStorageId) {
      updates.profilePictureStorageId = args.photoStorageId;
      updates.profilePictureUrl =
        (await ctx.storage.getUrl(args.photoStorageId)) ?? undefined;
    } else if (!existing?.profilePictureStorageId && args.photoUrl) {
      updates.profilePictureUrl = args.photoUrl;
    }
    if (existing) await ctx.db.patch(existing._id, updates);
    else await ctx.db.insert("userCustomizations", { userId, ...updates });
    await saveProgress(ctx, userId, 2, progress);
    const photoUrl = args.removePhoto
      ? null
      : args.photoStorageId
        ? (updates.profilePictureUrl ?? null)
        : existing?.profilePictureStorageId
          ? await ctx.storage.getUrl(existing.profilePictureStorageId)
          : (updates.profilePictureUrl ?? existing?.profilePictureUrl ?? null);
    return { photoUrl };
  },
});

export const saveUsername = mutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const username = args.username.trim().toLowerCase();
    const error = usernameError(username);
    if (error) throw new ConvexError(error);
    const [progress, profile, taken, current] = await Promise.all([
      progressFor(ctx, userId),
      ctx.db
        .query("userCustomizations")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .unique(),
      ctx.db
        .query("usernames")
        .withIndex("by_username", (q) => q.eq("username", username))
        .unique(),
      ctx.db
        .query("usernames")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .unique(),
    ]);
    requireEditable(progress);
    if (!profile?.displayName?.trim())
      throw new ConvexError("Salve seu perfil antes de escolher o endereço.");
    if (taken && taken.userId !== userId)
      throw new ConvexError(
        "Esse endereço acabou de ser escolhido. Tente outro.",
      );
    if (current) await ctx.db.patch(current._id, { username });
    else await ctx.db.insert("usernames", { userId, username });
    await saveProgress(ctx, userId, 3, progress);
    return username;
  },
});

export const saveFirstLink = mutation({
  args: {
    title: v.optional(v.string()),
    url: v.optional(v.string()),
    skip: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const [progress, username] = await Promise.all([
      progressFor(ctx, userId),
      ctx.db
        .query("usernames")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .unique(),
    ]);
    requireEditable(progress);
    if (!username)
      throw new ConvexError("Escolha seu endereço antes de adicionar um link.");
    let firstLinkId = progress?.firstLinkId;
    if (!args.skip) {
      const title = args.title?.trim() ?? "";
      const url = normalizeLinkUrl(args.url ?? "");
      if (title.length < 3 || title.length > 100)
        throw new ConvexError("O título deve ter entre 3 e 100 caracteres.");
      if (!url)
        throw new ConvexError(
          "Informe um endereço válido de site, com http ou https.",
        );
      const existing = firstLinkId ? await ctx.db.get(firstLinkId) : null;
      if (existing?.userId === userId)
        await ctx.db.patch(existing._id, { title, url });
      else
        firstLinkId = await ctx.db.insert("links", {
          userId,
          title,
          url,
          order: Date.now(),
          isFeatured: false,
        });
    }
    const progressId = await saveProgress(ctx, userId, 4, progress);
    if (firstLinkId) await ctx.db.patch(progressId, { firstLinkId });
  },
});

export const updateOnboardingStep = mutation({
  args: { step: v.number() },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    if (!Number.isInteger(args.step) || args.step < 1 || args.step > 4)
      throw new ConvexError("Etapa inválida.");
    const progress = await progressFor(ctx, userId);
    requireEditable(progress);
    await saveProgress(ctx, userId, args.step, progress);
  },
});

export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const [progress, username, profile] = await Promise.all([
      progressFor(ctx, userId),
      ctx.db
        .query("usernames")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .unique(),
      ctx.db
        .query("userCustomizations")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .unique(),
    ]);
    if (progress?.completed) return;
    if (
      !username ||
      !profile?.displayName?.trim() ||
      progress?.currentStep !== 4
    )
      throw new ConvexError(
        "Conclua as etapas da sua página antes de abrir o painel.",
      );
    await ctx.db.patch(progress._id, {
      completed: true,
      hasSeenWelcome: true,
      currentStep: 4,
      steps: onboardingSteps(4, true),
    });
  },
});

export const dismissWelcome = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const existing = await progressFor(ctx, userId);
    if (existing) await ctx.db.patch(existing._id, { hasSeenWelcome: true });
    else
      await ctx.db.insert("userOnboarding", {
        userId,
        currentStep: 4,
        completed: true,
        hasSeenWelcome: true,
        steps: onboardingSteps(4, true),
        createdAt: Date.now(),
      });
  },
});

export const ensureOnboardingComplete = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const existing = await progressFor(ctx, userId);
    if (existing?.completed) return { alreadyComplete: true };
    if (existing) return { inProgress: true };
    const [username, link] = await Promise.all([
      ctx.db
        .query("usernames")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .first(),
      ctx.db
        .query("links")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first(),
    ]);
    if (!username && !link) return { isNewUser: true };
    await ctx.db.insert("userOnboarding", {
      userId,
      currentStep: 4,
      completed: true,
      hasSeenWelcome: true,
      steps: onboardingSteps(4, true),
      createdAt: Date.now(),
    });
    return { markedComplete: true };
  },
});
