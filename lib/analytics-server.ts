
import { sql } from '@vercel/postgres';

export interface AnalyticsData {
  totalClicks: number;
  uniqueVisitors: number;
  countriesReached: number;
  topReferrer: string | null;
}

export async function fetchAnalytics(userId: string): Promise<AnalyticsData> {
  try {
    const [
      clicksResult,
      uniqueVisitorsResult,
      countriesResult,
      referrerResult
    ] = await Promise.all([
      // CORREÇÃO: Usando "profileUserId" com aspas
      sql`SELECT COUNT(*) FROM clicks WHERE "profileUserId" = ${userId};`,

      // CORREÇÃO: Usando "visitorId" e "profileUserId" com aspas
      sql`SELECT COUNT(DISTINCT "visitorId") FROM clicks WHERE "profileUserId" = ${userId};`,

      // CORREÇÃO: Usando "profileUserId" com aspas
      sql`SELECT COUNT(DISTINCT country) FROM clicks WHERE "profileUserId" = ${userId} AND country IS NOT NULL AND country != '';`,

      // CORREÇÃO: Usando "profileUserId" com aspas
      sql`SELECT referrer, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} AND referrer IS NOT NULL AND referrer != 'direct' GROUP BY referrer ORDER BY clicks DESC LIMIT 1;`,
    ]);

    return {
      totalClicks: parseInt(clicksResult.rows[0].count, 10) || 0,
      uniqueVisitors: parseInt(uniqueVisitorsResult.rows[0].count, 10) || 0,
      countriesReached: parseInt(countriesResult.rows[0].count, 10) || 0,
      topReferrer: referrerResult.rows.length > 0 ? referrerResult.rows[0].referrer : null,
    };

  } catch (error) {
    console.error("Erro ao buscar dados de análise geral:", error);
    return { totalClicks: 0, uniqueVisitors: 0, countriesReached: 0, topReferrer: null };
  }
}