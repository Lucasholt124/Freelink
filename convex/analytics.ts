// convex/analytics.ts
// ⚠️ IMPORTANTE: Analytics agora usa Next.js API Routes
// Este arquivo é mantido apenas para compatibilidade de imports antigos

import { action } from "./_generated/server";
import { v } from "convex/values";

// Stub: retorna dados vazios e redireciona para API Routes
export const getDashboardAnalytics = action({
  args: {},
  handler: async () => {
    console.warn("⚠️ Use /api/analytics/dashboard em vez de Convex action");
    return {
      totalClicks: 0,
      uniqueVisitors: 0,
      topCountry: { name: "N/A", clicks: 0 },
      conversionRate: 0,
      bounceRate: 0,
      avgSessionDuration: 0,
      devices: { desktop: 0, mobile: 0, tablet: 0 },
      trafficSources: [],
      recentActivities: [],
      performanceMetrics: { loadTime: 0, responseTime: 0, uptime: 0 },
      engagement: { avgTimeOnPage: 0, pagesPerSession: 0, returnRate: 0 },
      comparison: { current: 0, previous: 0 }
    };
  },
});

export const getLinkDetailedAnalytics = action({
  args: { linkId: v.string() },
  handler: async () => {
    console.warn("⚠️ Use /api/analytics/link/[linkId] em vez de Convex action");
    return {
      hourlyDistribution: [],
      dailyTrend: [],
      browsers: [],
      operatingSystems: [],
      referrers: [],
      geoHeatmap: []
    };
  }
});