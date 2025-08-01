// Em lib/analytics-server.ts

import { sql } from '@vercel/postgres';

export interface AnalyticsData {
  totalClicks: number;
  uniqueVisitors: number;
  topReferrer: { source: string; clicks: number } | null;
  topLink: { title: string; clicks: number } | null; // Mantemos o tipo, mas retornaremos null
  peakHour: { hour: number; clicks: number } | null;
  topCountry: { name: string; clicks: number } | null;
}

export async function fetchAnalytics(userId: string): Promise<AnalyticsData> {
  // A consulta que estava causando o erro foi REMOVIDA temporariamente do Promise.all
  const [
    clicksResult,
    uniqueUsersResult,
    topReferrerResult,
    peakHourResult,
    topCountryResult,
  ] = await Promise.all([
    sql`SELECT COUNT(*) FROM clicks WHERE "profileUserId" = ${userId};`,
    sql`SELECT COUNT(DISTINCT "visitorId") FROM clicks WHERE "profileUserId" = ${userId};`,
    sql`SELECT referrer, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} AND referrer IS NOT NULL AND referrer != '' AND referrer != 'direct' GROUP BY referrer ORDER BY clicks DESC LIMIT 1;`,
    // A consulta do 'topLink' foi removida daqui para evitar o erro.
    sql`SELECT EXTRACT(HOUR FROM timestamp AT TIME ZONE 'America/Sao_Paulo') as hour, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} GROUP BY hour ORDER BY clicks DESC LIMIT 1;`,
    sql`SELECT country, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} AND country IS NOT NULL AND country != '' AND country != 'Unknown' GROUP BY country ORDER BY clicks DESC LIMIT 1;`,
  ]);

  return {
    totalClicks: parseInt(clicksResult.rows[0]?.count || '0', 10),
    uniqueVisitors: parseInt(uniqueUsersResult.rows[0]?.count || '0', 10),
    topReferrer: topReferrerResult.rows[0] ? {
      source: topReferrerResult.rows[0].referrer,
      clicks: parseInt(topReferrerResult.rows[0].clicks, 10),
    } : null,
    // Retornamos null para o topLink, já que não fizemos a consulta
    topLink: null,
    peakHour: peakHourResult.rows[0] ? {
      hour: parseInt(peakHourResult.rows[0].hour, 10),
      clicks: parseInt(peakHourResult.rows[0].clicks, 10),
    } : null,
    topCountry: topCountryResult.rows[0] ? {
      name: topCountryResult.rows[0].country,
      clicks: parseInt(topCountryResult.rows[0].clicks, 10),
    } : null,
  };
}