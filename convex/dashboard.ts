import { query } from "./_generated/server";

// This overview only reads the authenticated account. No client-supplied user ID.
export const getOverview = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = identity.subject;
    const [profile, username, links, campaigns, tracking] = await Promise.all([
      ctx.db
        .query("userCustomizations")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .unique(),
      ctx.db
        .query("usernames")
        .withIndex("by_user_id", (q) => q.eq("userId", userId))
        .first(),
      ctx.db
        .query("links")
        .withIndex("by_user_and_order", (q) => q.eq("userId", userId))
        .order("asc")
        .collect(),
      ctx.db
        .query("adCampaigns")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("tracking")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique(),
    ]);
    const avatar =
      profile?.profilePictureUrl ||
      (profile?.profilePictureStorageId
        ? await ctx.storage.getUrl(profile.profilePictureStorageId)
        : null);
    return {
      displayName: profile?.displayName?.trim() || null,
      description: profile?.description?.trim() || null,
      avatar: avatar || null,
      username: username?.username || null,
      linkCount: links.length,
      featuredCount: links.filter((link) => link.isFeatured).length,
      links: links
        .slice(0, 4)
        .map(({ _id, title, url, isFeatured }) => ({
          id: _id,
          title,
          url,
          featured: !!isFeatured,
        })),
      campaignCount: campaigns.length,
      activeCampaignCount: campaigns.filter(
        (campaign) => campaign.status === "active",
      ).length,
      trackingCount: [
        tracking?.facebookPixelId,
        tracking?.googleAnalyticsId,
      ].filter((id) => id?.trim()).length,
      setup: {
        profile: !!(
          profile?.description?.trim() &&
          (profile.displayName?.trim() || avatar)
        ),
        firstLink: links.length > 0,
        appearance: !!(
          profile?.accentColor ||
          profile?.backgroundColor1 ||
          profile?.backgroundImageStorageId ||
          profile?.backgroundImageUrl
        ),
      },
    };
  },
});
