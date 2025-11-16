// convex/shortLinks.ts
// ⚠️ IMPORTANTE: ShortLinks agora usa Next.js API Routes
// Este arquivo é mantido apenas para compatibilidade de imports antigos

import { action } from "./_generated/server";
import { v } from "convex/values";

export const createShortLink = action({
  args: {
    originalUrl: v.string(),
    customSlug: v.optional(v.string()),
  },
  handler: async () => {
    console.warn("⚠️ Use POST /api/shortlinks/create em vez de Convex action");
    throw new Error("Use API Route: POST /api/shortlinks/create");
  },
});

export const getLinksForUser = action({
  args: {},
  handler: async () => {
    console.warn("⚠️ Use GET /api/shortlinks/list em vez de Convex action");
    return [];
  },
});

export const getClicksForLink = action({
  args: { shortLinkId: v.string() },
  handler: async () => {
    console.warn("⚠️ Use GET /api/shortlinks/[linkId]/clicks em vez de Convex action");
    return {
      link: { id: "", url: "", title: "", createdAt: 0 },
      clicks: []
    };
  },
});

export const deleteShortLink = action({
  args: { shortLinkId: v.string() },
  handler: async () => {
    console.warn("⚠️ Use DELETE /api/shortlinks/[linkId]/delete em vez de Convex action");
    throw new Error("Use API Route: DELETE /api/shortlinks/[linkId]/delete");
  },
});