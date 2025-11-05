import { sql, QueryResultRow } from '@vercel/postgres';

// Types e Interfaces
interface DeviceStats {
  desktop: number;
  mobile: number;
  tablet: number;
}

interface TrafficSource {
  name: string;
  clicks: number;
  icon: string;
  percentage: number;
}

interface RecentActivity {
  time: string;
  exactTime: string;
  action: string;
  location: string;
  timestamp: Date;
}

interface EngagementMetrics {
  clicksPerVisitor: number;
  returnRate: number;
  uniqueVisitorRate: number;
}

interface BrowserStats {
  name: string;
  count: number;
  percentage: number;
}

interface OSStats {
  name: string;
  count: number;
  percentage: number;
}

interface ReferrerData {
  source: string;
  count: number;
  percentage: number;
}

interface PeriodComparison {
  current: number;
  previous: number;
  percentageChange: number;
  trend: 'up' | 'down' | 'stable';
}

interface GeoData {
  country: string;
  clicks: number;
  percentage: number;
}

interface CityData {
  city: string;
  clicks: number;
  percentage: number;
}

interface RegionData {
  region: string;
  clicks: number;
  percentage: number;
}

interface DailyData {
  date: string;
  clicks: number;
  uniqueVisitors: number;
}

interface HourlyData {
  hour_of_day: number;
  total_clicks: number;
  percentage: number;
}

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

enum TrafficSourceIcon {
  DIRECT = 'direct',
  SOCIAL = 'social',
  SEARCH = 'search',
  LINKEDIN = 'linkedin',
  YOUTUBE = 'youtube',
  EMAIL = 'email',
  OTHER = 'other'
}

export async function fetchDetailedAnalyticsForLink(
  userId: string,
  linkId: string
): Promise<LinkAnalyticsData | null> {
  try {
    const queryResults = await executeAnalyticsQueries(userId, linkId);
    const processedData = processQueryResults(queryResults, linkId);
    return processedData;
  } catch (error) {
    console.error('Erro em fetchDetailedAnalyticsForLink:', error);
    return null;
  }
}

async function executeAnalyticsQueries(userId: string, linkId: string) {
  return await Promise.all([
    // 0. Total de cliques
    sql<{ count: string }>`
      SELECT COUNT(*)::text as count
      FROM clicks
      WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId};
    `,

    // 1. Visitantes únicos
    sql<{ count: string }>`
      SELECT COUNT(DISTINCT "visitorId")::text as count
      FROM clicks
      WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId};
    `,

    // 2. Países com dados
    sql<{ country: string; clicks: string }>`
      SELECT country, COUNT(*)::text as clicks
      FROM clicks
      WHERE "profileUserId" = ${userId}
        AND "linkId" = ${linkId}
        AND country IS NOT NULL
        AND country != ''
      GROUP BY country
      ORDER BY COUNT(*) DESC
      LIMIT 10;
    `,

    // 3. Cidades com dados
    sql<{ city: string; clicks: string }>`
      SELECT city, COUNT(*)::text as clicks
      FROM clicks
      WHERE "profileUserId" = ${userId}
        AND "linkId" = ${linkId}
        AND city IS NOT NULL
        AND city != ''
      GROUP BY city
      ORDER BY COUNT(*) DESC
      LIMIT 10;
    `,

    // 4. Regiões com dados
    sql<{ region: string; clicks: string }>`
      SELECT region, COUNT(*)::text as clicks
      FROM clicks
      WHERE "profileUserId" = ${userId}
        AND "linkId" = ${linkId}
        AND region IS NOT NULL
        AND region != ''
      GROUP BY region
      ORDER BY COUNT(*) DESC
      LIMIT 10;
    `,

    // 5. Distribuição horária
    sql<{ hour_of_day: number; total_clicks: number }>`
      SELECT
        EXTRACT(HOUR FROM timestamp AT TIME ZONE 'America/Sao_Paulo')::int as hour_of_day,
        COUNT(*)::int as total_clicks
      FROM clicks
      WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId}
      GROUP BY hour_of_day
      ORDER BY hour_of_day;
    `,

    // 6. Dados diários com visitantes únicos
    sql<{ date: Date; clicks: number; unique_visitors: number }>`
      SELECT
        DATE_TRUNC('day', timestamp AT TIME ZONE 'America/Sao_Paulo')::DATE as date,
        COUNT(*)::int as clicks,
        COUNT(DISTINCT "visitorId")::int as unique_visitors
      FROM clicks
      WHERE "profileUserId" = ${userId}
        AND "linkId" = ${linkId}
        AND timestamp >= NOW() - INTERVAL '30 days'
      GROUP BY date
      ORDER BY date DESC;
    `,

    // 7. Estatísticas de dispositivos
    sql<{ device_type: string; count: number }>`
      SELECT
        CASE
          WHEN "userAgent" ILIKE '%mobile%' THEN 'mobile'
          WHEN "userAgent" ILIKE '%tablet%' OR "userAgent" ILIKE '%ipad%' THEN 'tablet'
          ELSE 'desktop'
        END as device_type,
        COUNT(*)::int as count
      FROM clicks
      WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId}
      GROUP BY device_type;
    `,

    // 8. Fontes de tráfego detalhadas
    sql<{ source: string; clicks: number }>`
      SELECT
        CASE
          WHEN referrer = '' OR referrer IS NULL THEN 'Direto'
          WHEN referrer ILIKE '%facebook%' OR referrer ILIKE '%fb.%' THEN 'Facebook'
          WHEN referrer ILIKE '%instagram%' THEN 'Instagram'
          WHEN referrer ILIKE '%twitter%' OR referrer ILIKE '%t.co%' THEN 'Twitter'
          WHEN referrer ILIKE '%linkedin%' THEN 'LinkedIn'
          WHEN referrer ILIKE '%youtube%' THEN 'YouTube'
          WHEN referrer ILIKE '%google%' THEN 'Google'
          WHEN referrer ILIKE '%bing%' THEN 'Bing'
          WHEN referrer ILIKE '%yahoo%' THEN 'Yahoo'
          WHEN referrer ILIKE '%duckduckgo%' THEN 'DuckDuckGo'
          WHEN referrer ILIKE '%whatsapp%' THEN 'WhatsApp'
          WHEN referrer ILIKE '%telegram%' THEN 'Telegram'
          WHEN referrer ILIKE '%reddit%' THEN 'Reddit'
          WHEN referrer ILIKE '%pinterest%' THEN 'Pinterest'
          ELSE 'Outros'
        END as source,
        COUNT(*)::int as clicks
      FROM clicks
      WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId}
      GROUP BY source
      ORDER BY clicks DESC;
    `,

    // 9. Atividades recentes detalhadas - ✅ CORRIGIDO
    sql<{
      timestamp: Date;
      city: string | null;
      country: string | null;
      region: string | null;
      referrer: string | null;
    }>`
      SELECT
        timestamp as timestamp,
        city,
        country,
        region,
        referrer
      FROM clicks
      WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId}
      ORDER BY timestamp DESC
      LIMIT 20;
    `,

    // 10. Taxa de rejeição calculada
    sql<{ bounce_rate: number }>`
      WITH visitor_clicks AS (
        SELECT "visitorId", COUNT(*) as click_count
        FROM clicks
        WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId}
        GROUP BY "visitorId"
      )
      SELECT
        COALESCE(
          (COUNT(CASE WHEN click_count = 1 THEN 1 END)::float /
           NULLIF(COUNT(*), 0) * 100)::numeric(5,2),
          0
        ) as bounce_rate
      FROM visitor_clicks;
    `,

    // 11. Métricas de engajamento
    sql<{
      avg_clicks: number;
      return_rate: number;
      unique_visitor_rate: number;
    }>`
      WITH visitor_stats AS (
        SELECT
          "visitorId",
          COUNT(*) as clicks,
          COUNT(DISTINCT DATE(timestamp)) as days_active
        FROM clicks
        WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId}
        GROUP BY "visitorId"
      ),
      totals AS (
        SELECT
          COUNT(*) as total_clicks,
          COUNT(DISTINCT "visitorId") as unique_visitors
        FROM clicks
        WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId}
      )
      SELECT
        COALESCE(AVG(clicks)::numeric(5,2), 0) as avg_clicks,
        COALESCE(
          (COUNT(CASE WHEN days_active > 1 THEN 1 END)::float /
           NULLIF(COUNT(*), 0) * 100)::numeric(5,2),
          0
        ) as return_rate,
        COALESCE(
          (MAX(t.unique_visitors)::float /
           NULLIF(MAX(t.total_clicks), 0) * 100)::numeric(5,2),
          0
        ) as unique_visitor_rate
      FROM visitor_stats, totals t
      GROUP BY t.total_clicks, t.unique_visitors;
    `,

    // 12. Navegadores detalhados
    sql<{ browser: string; count: number }>`
      SELECT
        CASE
          WHEN "userAgent" ILIKE '%edg%' THEN 'Edge'
          WHEN "userAgent" ILIKE '%chrome%' AND "userAgent" NOT ILIKE '%edg%' THEN 'Chrome'
          WHEN "userAgent" ILIKE '%safari%' AND "userAgent" NOT ILIKE '%chrome%' THEN 'Safari'
          WHEN "userAgent" ILIKE '%firefox%' THEN 'Firefox'
          WHEN "userAgent" ILIKE '%opera%' OR "userAgent" ILIKE '%opr%' THEN 'Opera'
          WHEN "userAgent" ILIKE '%brave%' THEN 'Brave'
          ELSE 'Outros'
        END as browser,
        COUNT(*)::int as count
      FROM clicks
      WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId}
      GROUP BY browser
      ORDER BY count DESC;
    `,

    // 13. Sistemas operacionais
    sql<{ os: string; count: number }>`
      SELECT
        CASE
          WHEN "userAgent" ILIKE '%windows nt 10%' THEN 'Windows 10'
          WHEN "userAgent" ILIKE '%windows nt 11%' THEN 'Windows 11'
          WHEN "userAgent" ILIKE '%windows%' THEN 'Windows (outros)'
          WHEN "userAgent" ILIKE '%mac os x%' THEN 'macOS'
          WHEN "userAgent" ILIKE '%android%' THEN 'Android'
          WHEN "userAgent" ILIKE '%iphone%' OR "userAgent" ILIKE '%ipad%' OR "userAgent" ILIKE '%ios%' THEN 'iOS'
          WHEN "userAgent" ILIKE '%linux%' AND "userAgent" NOT ILIKE '%android%' THEN 'Linux'
          WHEN "userAgent" ILIKE '%chromeos%' THEN 'Chrome OS'
          ELSE 'Outros'
        END as os,
        COUNT(*)::int as count
      FROM clicks
      WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId}
      GROUP BY os
      ORDER BY count DESC;
    `,

    // 14. Top referrers completos
    sql<{ referrer: string; count: number }>`
      SELECT
        COALESCE(NULLIF(referrer, ''), 'Direto') as referrer,
        COUNT(*)::int as count
      FROM clicks
      WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId}
      GROUP BY referrer
      ORDER BY count DESC
      LIMIT 15;
    `,

    // 15. Comparação de períodos
    sql<{ current_period: number; previous_period: number }>`
      SELECT
        COUNT(CASE
          WHEN timestamp >= NOW() - INTERVAL '30 days'
          THEN 1
        END)::int as current_period,
        COUNT(CASE
          WHEN timestamp < NOW() - INTERVAL '30 days'
          AND timestamp >= NOW() - INTERVAL '60 days'
          THEN 1
        END)::int as previous_period
      FROM clicks
      WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId};
    `,

    // 16. Taxa de conversão
    sql<{ conversion_rate: number }>`
      WITH stats AS (
        SELECT
          COUNT(DISTINCT "visitorId")::float as unique_visitors,
          COUNT(*)::float as total_clicks
        FROM clicks
        WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId}
      )
      SELECT
        COALESCE(
          (unique_visitors / NULLIF(total_clicks, 0) * 100)::numeric(5,2),
          0
        ) as conversion_rate
      FROM stats;
    `,
  ]);
}

function processQueryResults(
  results: { rows: QueryResultRow[] }[],
  linkId: string
): LinkAnalyticsData {
  const [
    clicksResult,
    uniqueUsersResult,
    countryResult,
    cityResult,
    regionResult,
    hourlyResult,
    dailyResult,
    deviceStatsResult,
    trafficSourcesResult,
    recentClicksResult,
    bounceRateResult,
    engagementResult,
    browserStatsResult,
    osStatsResult,
    referrerDetailsResult,
    comparisonResult,
    conversionRateResult,
  ] = results;

  const totalClicks = parseInt(clicksResult.rows[0]?.count || '0', 10);

  if (totalClicks === 0) {
    return createEmptyAnalyticsData(linkId);
  }

  const totalUniqueUsers = parseInt(uniqueUsersResult.rows[0]?.count || '0', 10);

  const countryData = countryResult.rows.map((row: QueryResultRow): GeoData => ({
    country: row.country,
    clicks: parseInt(row.clicks, 10),
    percentage: (parseInt(row.clicks, 10) / totalClicks) * 100,
  }));

  const cityData = cityResult.rows.map((row: QueryResultRow): CityData => ({
    city: row.city,
    clicks: parseInt(row.clicks, 10),
    percentage: (parseInt(row.clicks, 10) / totalClicks) * 100,
  }));

  const regionData = regionResult.rows.map((row: QueryResultRow): RegionData => ({
    region: row.region,
    clicks: parseInt(row.clicks, 10),
    percentage: (parseInt(row.clicks, 10) / totalClicks) * 100,
  }));

  const hourlyData = hourlyResult.rows.map((row: QueryResultRow): HourlyData => ({
    hour_of_day: row.hour_of_day,
    total_clicks: row.total_clicks,
    percentage: (row.total_clicks / totalClicks) * 100,
  }));

  const peakHour = calculatePeakHour(hourlyData);

  const dailyData = dailyResult.rows
    .map((row: QueryResultRow): DailyData => ({
      date: row.date.toISOString().split('T')[0],
      clicks: row.clicks,
      uniqueVisitors: row.unique_visitors,
    }))
    .reverse();

  const devices = processDeviceStats(deviceStatsResult.rows);
  const trafficSources = processTrafficSources(trafficSourcesResult.rows, totalClicks);
  const recentActivities = processRecentActivities(recentClicksResult.rows);
  const browsers = processBrowserStats(browserStatsResult.rows, totalClicks);
  const operatingSystems = processOSStats(osStatsResult.rows, totalClicks);
  const referrers = processReferrers(referrerDetailsResult.rows, totalClicks);
  const comparison = processComparison(comparisonResult.rows[0]);
  const engagement = processEngagement(engagementResult.rows[0]);

  const bounceRate = parseFloat(bounceRateResult.rows[0]?.bounce_rate || '0');
  const conversionRate = parseFloat(conversionRateResult.rows[0]?.conversion_rate || '0');

  return {
    linkId,
    linkTitle: '',
    linkUrl: '',
    totalClicks,
    uniqueUsers: totalUniqueUsers,
    countriesReached: countryData.length,
    dailyData,
    hourlyData,
    peakHour,
    countryData,
    cityData,
    regionData,
    conversionRate,
    bounceRate,
    devices,
    trafficSources,
    recentActivities,
    engagement,
    browsers,
    operatingSystems,
    referrers,
    comparison,
    lastUpdated: new Date().toISOString(),
    dataQuality: {
      hasEnoughData: totalClicks >= 10,
      minimumDataThreshold: 10,
      currentDataPoints: totalClicks,
    },
  };
}

function calculatePeakHour(hourlyData: HourlyData[]): number | null {
  if (hourlyData.length === 0) return null;
  const peak = hourlyData.reduce((prev, current) =>
    prev.total_clicks > current.total_clicks ? prev : current
  );
  return peak.hour_of_day;
}

function processDeviceStats(rows: QueryResultRow[]): DeviceStats {
  const devices: DeviceStats = { desktop: 0, mobile: 0, tablet: 0 };
  rows.forEach(row => {
    const deviceType = row.device_type as keyof DeviceStats;
    devices[deviceType] = row.count;
  });
  return devices;
}

function processTrafficSources(
  rows: QueryResultRow[],
  totalClicks: number
): TrafficSource[] {
  return rows.map(row => ({
    name: row.source,
    clicks: row.clicks,
    icon: getTrafficSourceIcon(row.source),
    percentage: (row.clicks / totalClicks) * 100,
  }));
}

function getTrafficSourceIcon(source: string): string {
  const iconMap: Record<string, string> = {
    'Direto': TrafficSourceIcon.DIRECT,
    'Facebook': TrafficSourceIcon.SOCIAL,
    'Instagram': TrafficSourceIcon.SOCIAL,
    'Twitter': TrafficSourceIcon.SOCIAL,
    'LinkedIn': TrafficSourceIcon.LINKEDIN,
    'YouTube': TrafficSourceIcon.YOUTUBE,
    'WhatsApp': TrafficSourceIcon.SOCIAL,
    'Telegram': TrafficSourceIcon.SOCIAL,
    'Reddit': TrafficSourceIcon.SOCIAL,
    'Pinterest': TrafficSourceIcon.SOCIAL,
    'Google': TrafficSourceIcon.SEARCH,
    'Bing': TrafficSourceIcon.SEARCH,
    'Yahoo': TrafficSourceIcon.SEARCH,
    'DuckDuckGo': TrafficSourceIcon.SEARCH,
  };
  return iconMap[source] || TrafficSourceIcon.OTHER;
}

function processRecentActivities(rows: QueryResultRow[]): RecentActivity[] {
  return rows.map(row => ({
    time: formatRelativeTime(new Date(row.timestamp)),
    exactTime: formatExactTime(new Date(row.timestamp)),
    action: 'Clique no link',
    location: formatLocation(row.city, row.region, row.country),
    timestamp: row.timestamp,
  }));
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora mesmo';
  if (diffMins === 1) return 'Há 1 minuto';
  if (diffMins < 60) return `Há ${diffMins} minutos`;
  if (diffHours === 1) return 'Há 1 hora';
  if (diffHours < 24) return `Há ${diffHours} horas`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;
  if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semanas`;

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

// ✅ CORRIGIDO - Função que formata horário exato no timezone do Brasil
function formatExactTime(date: Date): string {
  const dateString = typeof date === 'string' ? date : date.toISOString();

  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
    hour12: false
  });
}

function formatLocation(
  city: string | null,
  region: string | null,
  country: string | null
): string {
  const parts: string[] = [];
  if (city && city !== '') parts.push(city);
  if (region && region !== '' && region !== city) parts.push(region);
  if (country && country !== '') parts.push(country);
  return parts.length > 0 ? parts.join(', ') : 'Localização desconhecida';
}

function processBrowserStats(
  rows: QueryResultRow[],
  totalClicks: number
): BrowserStats[] {
  return rows.map(row => ({
    name: row.browser,
    count: row.count,
    percentage: (row.count / totalClicks) * 100,
  }));
}

function processOSStats(
  rows: QueryResultRow[],
  totalClicks: number
): OSStats[] {
  return rows.map(row => ({
    name: row.os,
    count: row.count,
    percentage: (row.count / totalClicks) * 100,
  }));
}

function processReferrers(
  rows: QueryResultRow[],
  totalClicks: number
): ReferrerData[] {
  return rows.map(row => ({
    source: row.referrer,
    count: row.count,
    percentage: (row.count / totalClicks) * 100,
  }));
}

function processComparison(row: QueryResultRow | undefined): PeriodComparison {
  const current = row?.current_period || 0;
  const previous = row?.previous_period || 0;

  let percentageChange = 0;
  let trend: 'up' | 'down' | 'stable' = 'stable';

  if (previous > 0) {
    percentageChange = ((current - previous) / previous) * 100;
    trend = percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'stable';
  } else if (current > 0) {
    percentageChange = 100;
    trend = 'up';
  }

  return {
    current,
    previous,
    percentageChange,
    trend,
  };
}

function processEngagement(row: QueryResultRow | undefined): EngagementMetrics {
  return {
    clicksPerVisitor: parseFloat(row?.avg_clicks || '1'),
    returnRate: parseFloat(row?.return_rate || '0'),
    uniqueVisitorRate: parseFloat(row?.unique_visitor_rate || '0'),
  };
}

function createEmptyAnalyticsData(linkId: string): LinkAnalyticsData {
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
    engagement: {
      clicksPerVisitor: 0,
      returnRate: 0,
      uniqueVisitorRate: 0,
    },
    browsers: [],
    operatingSystems: [],
    referrers: [],
    comparison: {
      current: 0,
      previous: 0,
      percentageChange: 0,
      trend: 'stable',
    },
    lastUpdated: new Date().toISOString(),
    dataQuality: {
      hasEnoughData: false,
      minimumDataThreshold: 10,
      currentDataPoints: 0,
    },
  };
}

export type {
  DeviceStats,
  TrafficSource,
  RecentActivity,
  EngagementMetrics,
  BrowserStats,
  OSStats,
  ReferrerData,
  PeriodComparison,
  GeoData,
  CityData,
  RegionData,
  DailyData,
  HourlyData,
};