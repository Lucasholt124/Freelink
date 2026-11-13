import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
  type QueryCtx,
  type ActionCtx,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import {
  adNetworkMonth,
  businessSegments,
  competingSegments,
  networkCategory,
  safeAdDestination,
} from "../lib/ad-policy";

const ADMIN = "user_301NTkVsE3v48SXkoCEp0XOXifI";
const CACHE_MS = 3 * 60_000;
const PLACEMENT_MS = 30 * 60_000;
const limits = {
  pro: { campaigns: 2, media: 2, views: 1000 },
  ultra: { campaigns: 3, media: 10, views: 5000 },
};
type Plan = "free" | "pro" | "ultra";
async function requireUser(ctx: Pick<QueryCtx, "auth">) {
  const user = await ctx.auth.getUserIdentity();
  if (!user) throw new ConvexError("Entre na sua conta para continuar.");
  return user.subject;
}
async function page(ctx: Pick<QueryCtx, "db">, username: string) {
  const row = await ctx.db
    .query("usernames")
    .withIndex("by_username", (q) => q.eq("username", username))
    .first();
  if (!row) return null;
  const child = await ctx.db
    .query("subAccounts")
    .withIndex("by_sub_user", (q) => q.eq("subUserId", row.userId))
    .first();
  return { ...row, ownerId: child?.ownerUserId || row.userId };
}
async function segments(
  ctx: Pick<QueryCtx, "db">,
  row: { userId: string; niche?: string },
) {
  const profile = await ctx.db
    .query("userCustomizations")
    .withIndex("by_user_id", (q) => q.eq("userId", row.userId))
    .first();
  const links = await ctx.db
    .query("links")
    .withIndex("by_user", (q) => q.eq("userId", row.userId))
    .take(50);
  return businessSegments(
    row.niche,
    `${profile?.displayName || ""} ${profile?.description || ""} ${links.map((l) => l.title).join(" ")}`,
  );
}
function campaignSegments(row: Doc<"adCampaigns">) {
  return businessSegments(row.niche, `${row.title} ${row.adText}`);
}
export const entitlement = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) =>
    ctx.db
      .query("adEntitlements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique(),
});
export const cacheEntitlement = internalMutation({
  args: {
    userId: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("ultra")),
  },
  handler: async (ctx, args) => {
    const old = await ctx.db
      .query("adEntitlements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    const data = { ...args, expiresAt: Date.now() + CACHE_MS };
    if (old) await ctx.db.patch(old._id, data);
    else await ctx.db.insert("adEntitlements", data);
  },
});
async function verifiedPlan(ctx: ActionCtx, userId: string): Promise<Plan> {
  if (userId === ADMIN) return "ultra";
  const cached = await ctx.runQuery(internal.ads.entitlement, { userId });
  if (cached && cached.expiresAt > Date.now()) return cached.plan;
  const key = process.env.CLERK_SECRET_KEY?.trim();
  if (!key)
    throw new ConvexError(
      "A rede de anúncios está temporariamente indisponível. Falta configurar a verificação de planos no servidor.",
    );
  const response = await fetch(
    `https://api.clerk.com/v1/users/${encodeURIComponent(userId)}`,
    {
      headers: { Authorization: `Bearer ${key}` },
      signal:
        typeof AbortSignal !== "undefined" &&
        typeof AbortSignal.timeout === "function"
          ? AbortSignal.timeout(8000)
          : undefined,
    },
  );
  if (!response.ok)
    throw new ConvexError(
      "Não foi possível confirmar o plano. Tente novamente em instantes.",
    );
  const user = await response.json();
  const value = user.public_metadata?.subscriptionPlan;
  const plan: Plan = value === "ultra" || value === "pro" ? value : "free";
  await ctx.runMutation(internal.ads.cacheEntitlement, { userId, plan });
  return plan;
}
export const generateUploadUrl = mutation(async (ctx) => {
  await requireUser(ctx);
  return ctx.storage.generateUploadUrl();
});
export const getCampaigns = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    return ctx.db
      .query("adCampaigns")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});
const draftArgs = {
  title: v.string(),
  productLink: v.string(),
  adText: v.string(),
  mediaStorageIds: v.array(v.id("_storage")),
  mediaTypes: v.array(v.string()),
  userPlan: v.optional(v.string()),
  niche: v.optional(v.string()),
};
export const publishCampaign = action({
  args: draftArgs,
  handler: async (ctx, args): Promise<Id<"adCampaigns">> => {
    const userId = await requireUser(ctx);
    const plan = await verifiedPlan(ctx, userId);
    if (plan === "free")
      throw new ConvexError("Escolha um plano Pro ou Ultra para anunciar.");
    return ctx.runMutation(internal.ads.createVerifiedCampaign, {
      ...args,
      userId,
      plan,
    });
  },
});
export const createVerifiedCampaign = internalMutation({
  args: {
    ...draftArgs,
    userId: v.string(),
    plan: v.union(v.literal("pro"), v.literal("ultra")),
  },
  handler: async (ctx, args) => {
    const limit = limits[args.plan];
    const existing = await ctx.db
      .query("adCampaigns")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    if (existing.length >= limit.campaigns)
      throw new ConvexError("Você atingiu o limite de campanhas do plano.");
    const title = args.title.trim(),
      adText = args.adText.trim(),
      productLink = safeAdDestination(args.productLink),
      niche = networkCategory(args.niche);
    if (
      !title ||
      title.length > 100 ||
      !adText ||
      adText.length > 1000 ||
      !productLink ||
      niche === "geral"
    )
      throw new ConvexError(
        "Revise título, texto, endereço e segmento antes de publicar.",
      );
    if (
      !args.mediaStorageIds.length ||
      args.mediaStorageIds.length > limit.media ||
      new Set(args.mediaStorageIds).size !== args.mediaStorageIds.length
    )
      throw new ConvexError("Revise a quantidade de mídias da campanha.");
    const mediaUrls: string[] = [],
      mediaTypes: string[] = [];
    for (const id of args.mediaStorageIds) {
      const meta = await ctx.db.system.get(id);
      const mime = meta?.contentType || "";
      if (
        !meta ||
        meta.size <= 0 ||
        !/^(image\/(jpeg|png|webp|gif|avif)|video\/(mp4|webm|quicktime))$/.test(
          mime,
        ) ||
        meta.size > (mime.startsWith("video/") ? 50 : 10) * 1024 * 1024
      )
        throw new ConvexError(
          "Use imagens válidas de até 10 MB ou vídeos de até 50 MB.",
        );
      const url = await ctx.storage.getUrl(id);
      if (!url)
        throw new ConvexError(
          "Uma mídia não está disponível. Envie novamente.",
        );
      mediaUrls.push(url);
      mediaTypes.push(mime.startsWith("video/") ? "video" : "image");
    }
    return ctx.db.insert("adCampaigns", {
      userId: args.userId,
      title,
      adText,
      productLink,
      niche,
      mediaUrls,
      mediaTypes,
      status: "active",
      views: 0,
      clicks: 0,
      maxViewsLimit: limit.views,
      lastResetMonth: adNetworkMonth(),
      createdAt: Date.now(),
    });
  },
});
export const toggleCampaignStatus = mutation({
  args: {
    id: v.id("adCampaigns"),
    status: v.union(v.literal("active"), v.literal("paused")),
  },
  handler: async (ctx, args) => {
    const owner = await requireUser(ctx),
      campaign = await ctx.db.get(args.id);
    if (!campaign || campaign.userId !== owner)
      throw new ConvexError("Campanha não encontrada.");
    const views =
      campaign.lastResetMonth === adNetworkMonth() ? campaign.views : 0;
    if (args.status === "active" && views >= campaign.maxViewsLimit)
      throw new ConvexError("Limite do mês atingido. Reative no próximo mês.");
    if (args.status === "active" && networkCategory(campaign.niche) === "geral")
      throw new ConvexError("Defina o segmento da campanha antes de ativar.");
    await ctx.db.patch(args.id, {
      status: args.status,
      views,
      lastResetMonth: adNetworkMonth(),
      updatedAt: Date.now(),
    });
  },
});
export const deleteCampaign = mutation({
  args: { id: v.id("adCampaigns") },
  handler: async (ctx, { id }) => {
    const owner = await requireUser(ctx),
      campaign = await ctx.db.get(id);
    if (!campaign || campaign.userId !== owner)
      throw new ConvexError("Campanha não encontrada.");
    await ctx.db.delete(id);
  },
});
export const setCampaignCategory = mutation({
  args: { id: v.id("adCampaigns"), niche: v.string() },
  handler: async (ctx, args) => {
    const owner = await requireUser(ctx),
      row = await ctx.db.get(args.id),
      niche = networkCategory(args.niche);
    if (!row || row.userId !== owner)
      throw new ConvexError("Campanha não encontrada.");
    if (niche === "geral")
      throw new ConvexError("Escolha o segmento do negócio.");
    await ctx.db.patch(row._id, { niche, updatedAt: Date.now() });
  },
});
export const saveUserNiche = mutation({
  args: {
    niche: v.string(),
    username: v.string(),
    confirmed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const owner = await requireUser(ctx),
      row = await page(ctx, args.username);
    if (!row || row.ownerId !== owner)
      throw new ConvexError("Esta página não pertence à sua conta.");
    const niche = networkCategory(args.niche);
    if (row.nicheConfirmed && !args.confirmed)
      return { success: true, niche: row.niche || "geral" };
    await ctx.db.patch(row._id, {
      niche,
      ...(args.confirmed ? { nicheConfirmed: true } : {}),
    });
    return { success: true, niche };
  },
});
export const getMyPageCategories = query({
  args: {},
  handler: async (ctx) => {
    const owner = await requireUser(ctx);
    const children = await ctx.db
      .query("subAccounts")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", owner))
      .collect();
    const groups = await Promise.all(
      [owner, ...children.map((c) => c.subUserId)].map((userId) =>
        ctx.db
          .query("usernames")
          .withIndex("by_user_id", (q) => q.eq("userId", userId))
          .collect(),
      ),
    );
    return groups
      .flat()
      .map((row) => ({
        username: row.username,
        niche: networkCategory(row.niche),
      }));
  },
});
export const getPageOwnerNiche = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const row = await page(ctx, args.username);
    return { niche: row?.niche || "geral", userId: row?.userId || null };
  },
});
export const placementContext = internalQuery({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const row = await page(ctx, args.username);
    if (!row || networkCategory(row.niche) === "geral") return null;
    const campaigns = await ctx.db
      .query("adCampaigns")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    return {
      ownerId: row.ownerId,
      advertiserIds: [...new Set(campaigns.map((c) => c.userId))],
    };
  },
});
export const selectAdForPage = action({
  args: { username: v.string(), sessionId: v.string() },
  handler: async (
    ctx,
    args,
  ): Promise<{
    id: Id<"adCampaigns">;
    placementId: Id<"adPlacements">;
    title: string;
    text: string;
    link: string;
    mediaUrls: string[];
    mediaTypes: string[];
  } | null> => {
    if (
      !/^[a-zA-Z0-9-]{16,80}$/.test(args.sessionId) ||
      args.username.length > 100
    )
      return null;
    const context = await ctx.runQuery(internal.ads.placementContext, {
      username: args.username,
    });
    if (!context) return null;
    try {
      if ((await verifiedPlan(ctx, context.ownerId)) === "ultra") return null;
      const plans = await Promise.all(
        context.advertiserIds.map(async (userId) => {
          try {
            return (await verifiedPlan(ctx, userId)) !== "free" ? userId : null;
          } catch {
            return null;
          }
        }),
      );
      return await ctx.runMutation(internal.ads.reservePlacement, {
        ...args,
        advertiserIds: plans.filter((id): id is string => !!id),
      });
    } catch {
      return null;
    } // Fail closed: a provider outage must not interrupt a public profile.
  },
});
export const reservePlacement = internalMutation({
  args: {
    username: v.string(),
    sessionId: v.string(),
    advertiserIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const row = await page(ctx, args.username);
    if (!row || networkCategory(row.niche) === "geral") return null;
    const entitlement = await ctx.db
      .query("adEntitlements")
      .withIndex("by_user", (q) => q.eq("userId", row.ownerId))
      .unique();
    if (
      row.ownerId === ADMIN ||
      !entitlement ||
      entitlement.expiresAt <= Date.now() ||
      entitlement.plan === "ultra"
    )
      return null;
    const prior = await ctx.db
      .query("adPlacements")
      .withIndex("by_page_session", (q) =>
        q.eq("username", args.username).eq("sessionId", args.sessionId),
      )
      .collect();
    // One opportunity per page/session in this window; refreshes cannot consume the quota.
    if (prior.some((p) => p.expiresAt > Date.now())) return null;
    const pageSegments = await segments(ctx, row);
    const month = adNetworkMonth();
    const campaigns = await ctx.db
      .query("adCampaigns")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    const candidates = campaigns.filter(
      (c) =>
        c.userId !== row.ownerId &&
        args.advertiserIds.includes(c.userId) &&
        networkCategory(c.niche) !== "geral" &&
        safeAdDestination(c.productLink) &&
        c.mediaUrls.length &&
        (c.lastResetMonth !== month ? 0 : c.views) < c.maxViewsLimit &&
        !competingSegments(pageSegments, campaignSegments(c)),
    );
    // Rotate among the least-served campaigns, measured as a share of their monthly allowance.
    candidates.sort(
      (a, b) =>
        (a.lastResetMonth === month ? a.views : 0) / a.maxViewsLimit -
        (b.lastResetMonth === month ? b.views : 0) / b.maxViewsLimit,
    );
    if (!candidates.length) return null;
    const lowest = candidates[0];
    const score = (c: typeof lowest) =>
      (c.lastResetMonth === month ? c.views : 0) / c.maxViewsLimit;
    const tied = candidates.filter((c) => score(c) === score(lowest));
    const selected = tied[Math.floor(Math.random() * tied.length)];
    const placementId = await ctx.db.insert("adPlacements", {
      campaignId: selected._id,
      username: args.username,
      sessionId: args.sessionId,
      createdAt: Date.now(),
      expiresAt: Date.now() + PLACEMENT_MS,
      viewed: false,
      clicked: false,
    });
    await ctx.scheduler.runAfter(
      PLACEMENT_MS + 60_000,
      internal.ads.removePlacement,
      { id: placementId },
    );
    return {
      id: selected._id,
      placementId,
      title: selected.title,
      text: selected.adText,
      link: selected.productLink,
      mediaUrls: selected.mediaUrls,
      mediaTypes: selected.mediaTypes || [],
    };
  },
});
export const removePlacement = internalMutation({
  args: { id: v.id("adPlacements") },
  handler: async (ctx, { id }) => {
    if (await ctx.db.get(id)) await ctx.db.delete(id);
  },
});
export const confirmAdView = mutation({
  args: { placementId: v.id("adPlacements"), sessionId: v.string() },
  handler: async (ctx, args) => {
    const placement = await ctx.db.get(args.placementId);
    if (
      !placement ||
      placement.sessionId !== args.sessionId ||
      placement.expiresAt <= Date.now() ||
      Date.now() - placement.createdAt < 1000
    )
      return false;
    if (placement.viewed) return true;
    const campaign = await ctx.db.get(placement.campaignId),
      row = await page(ctx, placement.username);
    if (
      !campaign ||
      !row ||
      campaign.status !== "active" ||
      campaign.userId === row.ownerId ||
      networkCategory(row.niche) === "geral" ||
      competingSegments(await segments(ctx, row), campaignSegments(campaign))
    )
      return false;
    const plans = await Promise.all(
      [row.ownerId, campaign.userId].map((userId) =>
        ctx.db
          .query("adEntitlements")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .unique(),
      ),
    );
    if (
      row.ownerId === ADMIN ||
      !plans[0] ||
      plans[0].expiresAt <= Date.now() ||
      plans[0].plan === "ultra" ||
      (campaign.userId !== ADMIN &&
        (!plans[1] ||
          plans[1].expiresAt <= Date.now() ||
          plans[1].plan === "free"))
    )
      return false;
    const views =
      campaign.lastResetMonth === adNetworkMonth() ? campaign.views : 0;
    if (views >= campaign.maxViewsLimit) return false;
    await ctx.db.patch(campaign._id, {
      views: views + 1,
      lastResetMonth: adNetworkMonth(),
      status: views + 1 >= campaign.maxViewsLimit ? "completed" : "active",
    });
    await ctx.db.patch(placement._id, { viewed: true });
    return true;
  },
});
export const registerAdClick = mutation({
  // Optional legacy id never authorizes a click; retained for a graceful old-client transition.
  args: {
    id: v.optional(v.id("adCampaigns")),
    placementId: v.optional(v.id("adPlacements")),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.placementId || !args.sessionId) return false;
    const placement = await ctx.db.get(args.placementId);
    if (
      !placement ||
      placement.sessionId !== args.sessionId ||
      placement.expiresAt <= Date.now() ||
      !placement.viewed ||
      placement.clicked
    )
      return false;
    const campaign = await ctx.db.get(placement.campaignId);
    if (!campaign) return false;
    await ctx.db.patch(campaign._id, { clicks: campaign.clicks + 1 });
    await ctx.db.patch(placement._id, { clicked: true });
    return true;
  },
});

// Cached clients from the previous release fail closed, without losing campaign data.
export const createCampaign = mutation({
  args: draftArgs,
  handler: async () => {
    throw new ConvexError(
      "Atualize esta página para publicar com a nova proteção de anúncios.",
    );
  },
});
export const getAdForPublicPage = mutation({
  args: { pageOwnerNiche: v.string(), pageOwnerPlan: v.string() },
  handler: async () => null,
});
