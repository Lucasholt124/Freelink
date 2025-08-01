// Em lib/analytics-server.ts

import { sql } from '@vercel/postgres';

export interface AnalyticsData {
  totalClicks: number;
  uniqueVisitors: number;
  topReferrer: { source: string; clicks: number } | null;
  // A propriedade 'title' agora pode ser apenas o ID do link
  topLink: { title: string; clicks: number } | null;
  peakHour: { hour: number; clicks: number } | null;
  topCountry: { name: string; clicks: number } | null;
}

export async function fetchAnalytics(userId: string): Promise<AnalyticsData> {
  const [
    clicksResult,
    uniqueUsersResult,
    topReferrerResult,
    topLinkResult, // Esta consulta foi corrigida
    peakHourResult,
    topCountryResult,
  ] = await Promise.all([
    sql`SELECT COUNT(*) FROM clicks WHERE "profileUserId" = ${userId};`,
    sql`SELECT COUNT(DISTINCT "visitorId") FROM clicks WHERE "profileUserId" = ${userId};`,
    sql`SELECT COALESCE(NULLIF(referrer, ''), 'Direto') as source, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} GROUP BY source ORDER BY clicks DESC LIMIT 1;`,

    // --- CORREÇÃO FINAL ---
    // Agora buscamos o ID do link mais popular diretamente da tabela 'clicks'
    sql`
      SELECT "linkId", COUNT(*) as clicks
      FROM clicks
      WHERE "profileUserId" = ${userId} AND "linkId" IS NOT NULL
      GROUP BY "linkId"
      ORDER BY clicks DESC
      LIMIT 1;
    `,

    sql`SELECT EXTRACT(HOUR FROM timestamp AT TIME ZONE 'America/Sao_Paulo') as hour, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} GROUP BY hour ORDER BY clicks DESC LIMIT 1;`,
    sql`SELECT country, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} AND country IS NOT NULL AND country != '' AND country != 'Unknown' GROUP BY country ORDER BY clicks DESC LIMIT 1;`,
  ]);

  return {
    totalClicks: parseInt(clicksResult.rows[0]?.count || '0', 10),
    uniqueVisitors: parseInt(uniqueUsersResult.rows[0]?.count || '0', 10),
    topReferrer: topReferrerResult.rows[0] ? {
      source: topReferrerResult.rows[0].source,
      clicks: parseInt(topReferrerResult.rows[0].clicks, 10),
    } : null,
    // Usamos o 'linkId' como 'title' para exibição
    topLink: topLinkResult.rows[0] ? {
      title: topLinkResult.rows[0].linkId,
      clicks: parseInt(topLinkResult.rows[0].clicks, 10),
    } : null,
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