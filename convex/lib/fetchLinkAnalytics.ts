// fetchLinkAnalytics.ts
// Click analytics (Postgres) was removed. This file is kept as a typed stub
// to avoid breaking any imports. All functions return empty data.

export interface LinkAnalyticsData {
  linkId: string;
  linkTitle: string;
  linkUrl: string;
  totalClicks: number;
  uniqueUsers: number;
  countriesReached: number;
  dailyData: DailyData[];
  hourlyData: HourlyData[];
  peakHour: number | null;
  countryData: GeoData[];
  cityData: CityData[];
  regionData: RegionData[];
  conversionRate: number;
  bounceRate: number;
  devices: DeviceStats;
  browsers: BrowserStats[];
  operatingSystems: OSStats[];
  trafficSources: TrafficSource[];
  referrers: ReferrerData[];
  recentActivities: RecentActivity[];
  engagement: EngagementMetrics;
  comparison: PeriodComparison;
  lastUpdated: string;
  dataQuality: {
    hasEnoughData: boolean;
    minimumDataThreshold: number;
    currentDataPoints: number;
  };
}

export async function fetchDetailedAnalyticsForLink(
  _userId: string,
  linkId: string
): Promise<LinkAnalyticsData | null> {
  return {
    linkId,
    linkTitle: '',
    linkUrl: '',
    totalClicks: 0,
    uniqueUsers: 0,
    countriesReached: 0,
    dailyData: [],
    hourlyData: [],
    peakHour: null,
    countryData: [],
    cityData: [],
    regionData: [],
    conversionRate: 0,
    bounceRate: 0,
    devices: { desktop: 0, mobile: 0, tablet: 0 },
    trafficSources: [],
    recentActivities: [],
    engagement: { clicksPerVisitor: 0, returnRate: 0, uniqueVisitorRate: 0 },
    browsers: [],
    operatingSystems: [],
    referrers: [],
    comparison: { current: 0, previous: 0, percentageChange: 0, trend: 'stable' },
    lastUpdated: new Date().toISOString(),
    dataQuality: { hasEnoughData: false, minimumDataThreshold: 10, currentDataPoints: 0 },
  };
}

export type DeviceStats = { desktop: number; mobile: number; tablet: number };
export type TrafficSource = { name: string; clicks: number; icon: string; percentage: number };
export type RecentActivity = { time: string; exactTime: string; action: string; location: string; timestamp: Date };
export type EngagementMetrics = { clicksPerVisitor: number; returnRate: number; uniqueVisitorRate: number };
export type BrowserStats = { name: string; count: number; percentage: number };
export type OSStats = { name: string; count: number; percentage: number };
export type ReferrerData = { source: string; count: number; percentage: number };
export type PeriodComparison = { current: number; previous: number; percentageChange: number; trend: 'up' | 'down' | 'stable' };
export type GeoData = { country: string; clicks: number; percentage: number };
export type CityData = { city: string; clicks: number; percentage: number };
export type RegionData = { region: string; clicks: number; percentage: number };
export type DailyData = { date: string; clicks: number; uniqueVisitors: number };
export type HourlyData = { hour_of_day: number; total_clicks: number; percentage: number };