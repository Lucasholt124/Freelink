// analytics-server.ts
// Click analytics was removed (Postgres removed).
// This file is kept as a stub to avoid breaking any remaining imports.

export interface AnalyticsData {
  totalClicks: number;
  uniqueVisitors: number;
  topReferrer: { source: string; clicks: number } | null;
  topLink: { title: string; clicks: number } | null;
  peakHour: { hour: number; clicks: number } | null;
  topCountry: { name: string; clicks: number } | null;
  lastActivity: string | null;
  growth?: string;
  dailyClicks: { date: string; count: number }[];
}

export async function fetchAnalytics(_userId: string): Promise<AnalyticsData> {
  return {
    totalClicks: 0,
    uniqueVisitors: 0,
    topReferrer: null,
    topLink: null,
    peakHour: null,
    topCountry: null,
    lastActivity: null,
    dailyClicks: [],
  };
}