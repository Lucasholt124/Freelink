import { sql, QueryResultRow } from '@vercel/postgres';
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

// --- INTERFACE DE DADOS PARA O DASHBOARD (Visão Geral) ---
export interface AnalyticsData {
  totalClicks: number;
  uniqueVisitors: number;
  topReferrer: { source: string; clicks: number } | null;
  topLink: { title: string; clicks: number } | null;
  peakHour: { hour: number; clicks: number } | null;
  topCountry: { name: string; clicks: number } | null;
}

// --- FUNÇÃO PARA O DASHBOARD (NÃO MUDA) ---
export async function fetchAnalytics(userId: string): Promise<AnalyticsData> {
  const [
    postgresResults,
    convexLinks,
  ] = await Promise.all([
    Promise.all([
      sql`SELECT COUNT(*) FROM clicks WHERE "profileUserId" = ${userId};`,
      sql`SELECT COUNT(DISTINCT "visitorId") FROM clicks WHERE "profileUserId" = ${userId};`,
      sql`SELECT COALESCE(NULLIF(referrer, ''), 'Direto') as source, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} GROUP BY source ORDER BY clicks DESC LIMIT 1;`,
      sql`SELECT "linkId", COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" IS NOT NULL GROUP BY "linkId" ORDER BY clicks DESC LIMIT 1;`,
      sql`SELECT EXTRACT(HOUR FROM timestamp AT TIME ZONE 'America/Sao_Paulo') as hour, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} GROUP BY hour ORDER BY clicks DESC LIMIT 1;`,
      sql`SELECT country, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} AND country IS NOT NULL AND country != '' AND country != 'Unknown' GROUP BY country ORDER BY clicks DESC LIMIT 1;`,
    ]),
    fetchQuery(api.lib.links.getLinksByUserId, { userId }),
  ]);

  const [
    clicksResult,
    uniqueUsersResult,
    topReferrerResult,
    topLinkResult,
    peakHourResult,
    topCountryResult,
  ] = postgresResults;

  const convexLinksMap = new Map(convexLinks.map(link => [link._id, link.title]));
  const topLinkFromDb = topLinkResult.rows[0];
  const topLinkTitle = topLinkFromDb ? convexLinksMap.get(topLinkFromDb.linkId) : null;

  return {
    totalClicks: parseInt(clicksResult.rows[0]?.count || '0', 10),
    uniqueVisitors: parseInt(uniqueUsersResult.rows[0]?.count || '0', 10),
    topReferrer: topReferrerResult.rows[0] ? { source: topReferrerResult.rows[0].source, clicks: parseInt(topReferrerResult.rows[0].clicks, 10) } : null,
    topLink: topLinkFromDb && topLinkTitle ? { title: topLinkTitle, clicks: parseInt(topLinkFromDb.clicks, 10) } : null,
    peakHour: peakHourResult.rows[0] ? { hour: parseInt(peakHourResult.rows[0].hour, 10), clicks: parseInt(peakHourResult.rows[0].clicks, 10) } : null,
    topCountry: topCountryResult.rows[0] ? { name: topCountryResult.rows[0].country, clicks: parseInt(topCountryResult.rows[0].clicks, 10) } : null,
  };
}


// ----------------------------------------------------------------------------------
// --- FUNÇÃO PARA A PÁGINA DE ANÁLISES DETALHADAS (ATUALIZADA) ---
// ----------------------------------------------------------------------------------

// --- NOVA INTERFACE DE DADOS DETALHADOS ---
export interface LinkAnalyticsData {
  linkId: string;
  linkTitle: string;
  linkUrl: string;
  totalClicks: number;
  uniqueUsers: number;
  countriesReached: number;
  dailyData: { date: string; clicks: number }[];
  countryData: { country: string; clicks: number; percentage: number }[];
  cityData: { city: string; clicks: number }[];
  regionData: { region: string; clicks: number }[];
  // O tipo de 'hourlyData' foi atualizado
  hourlyData: { hour_timestamp: string; total_clicks: number }[];
  peakHour: number | null;
}

export async function fetchDetailedAnalyticsForLink(
  userId: string,
  linkId: string
): Promise<LinkAnalyticsData | null> {
  try {
    const [
      clicksResult,
      uniqueUsersResult,
      countryResult,
      cityResult,
      regionResult,
      hourlyResult, // <-- ESTA CONSULTA VAI MUDAR
      peakHourResult,
      dailyResult
    ] = await Promise.all([
      sql`SELECT COUNT(*) FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId};`,
      sql`SELECT COUNT(DISTINCT "visitorId") FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId};`,
      sql`SELECT country, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId} AND country IS NOT NULL AND country != '' GROUP BY country ORDER BY clicks DESC LIMIT 7;`,
      sql`SELECT city, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId} AND city IS NOT NULL AND city != '' GROUP BY city ORDER BY clicks DESC LIMIT 7;`,
      sql`SELECT region, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId} AND region IS NOT NULL AND region != '' GROUP BY region ORDER BY clicks DESC LIMIT 7;`,

      // --- CONSULTA ATUALIZADA PARA O GRÁFICO DE HORAS ---
      sql`
        SELECT
          DATE_TRUNC('hour', timestamp AT TIME ZONE 'America/Sao_Paulo') as hour_timestamp,
          COUNT(*) as total_clicks
        FROM clicks
        WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId} AND timestamp > NOW() - INTERVAL '48 hours'
        GROUP BY hour_timestamp
        ORDER BY hour_timestamp ASC;
      `,

      sql`SELECT EXTRACT(HOUR FROM timestamp AT TIME ZONE 'America/Sao_Paulo') as peak_hour FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId} GROUP BY peak_hour ORDER BY COUNT(*) DESC LIMIT 1;`,
      sql`SELECT DATE_TRUNC('day', timestamp AT TIME ZONE 'America/Sao_Paulo')::DATE as date, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId} GROUP BY date ORDER BY date DESC LIMIT 30;`,
    ]);

    const totalClicks = parseInt(clicksResult.rows[0].count as string, 10);
    if (totalClicks === 0) {
      // Retorna um objeto vazio se não houver cliques
      return {
        linkId, linkTitle: "", linkUrl: "", totalClicks: 0, uniqueUsers: 0, countriesReached: 0,
        dailyData: [], countryData: [], cityData: [], regionData: [], hourlyData: [], peakHour: null,
      };
    }

    const totalUniqueUsers = parseInt(uniqueUsersResult.rows[0].count as string, 10);
    const countryData = countryResult.rows.map((row: QueryResultRow) => ({
      country: row.country, clicks: parseInt(row.clicks, 10),
      percentage: (parseInt(row.clicks, 10) / totalClicks) * 100
    }));

    return {
      linkId,
      linkTitle: "", // Será preenchido na página
      linkUrl: "",   // Será preenchido na página
      totalClicks,
      uniqueUsers: totalUniqueUsers,
      countriesReached: countryData.length,
      dailyData: dailyResult.rows.map((row: QueryResultRow) => ({ date: row.date.toISOString().split('T')[0], clicks: parseInt(row.clicks, 10) })).reverse(),
      countryData,
      cityData: cityResult.rows.map((row: QueryResultRow) => ({ city: row.city, clicks: parseInt(row.clicks, 10) })),
      regionData: regionResult.rows.map((row: QueryResultRow) => ({ region: row.region, clicks: parseInt(row.clicks, 10) })),
      // O mapeamento de 'hourlyData' foi atualizado
      hourlyData: hourlyResult.rows.map((row: QueryResultRow) => ({
        hour_timestamp: row.hour_timestamp.toISOString(),
        total_clicks: parseInt(row.total_clicks, 10)
      })),
      peakHour: peakHourResult.rows.length > 0 ? parseInt(peakHourResult.rows[0].peak_hour, 10) : null,
    };

  } catch (err) {
    console.error("Erro em fetchDetailedAnalyticsForLink:", err);
    return null;
  }
}