
import { sql, QueryResultRow } from '@vercel/postgres';

// A interface de dados que a sua UI espera receber.
export interface LinkAnalyticsData {
  linkId: string;
  linkTitle: string;
  linkUrl: string;
  totalClicks: number;
  uniqueUsers: number;
  countriesReached: number;
  dailyData: Array<{ date: string; clicks: number }>;
  countryData: Array<{ country: string; clicks: number; percentage: number }>;
  cityData: Array<{ city: string; clicks: number }>;
  regionData: Array<{ region: string; clicks: number }>;
  hourlyData: Array<{ hour_of_day: number; total_clicks: number }>;
  peakHour: number | null;
}

// NOTA: Esta função agora é independente do Convex.
// Ela só precisa do ID do usuário e do ID do link.
export async function fetchDetailedAnalyticsForLink(
  userId: string,
  linkId: string
): Promise<LinkAnalyticsData | null> {
  try {
    // --- QUERIES NO BANCO DE ANALYTICS (POSTGRES) ---
    const [
      clicksResult,
      uniqueUsersResult,
      countryResult,
      cityResult,
      regionResult,
      hourlyResult,
      peakHourResult,
      dailyResult
    ] = await Promise.all([
      sql`SELECT COUNT(*) FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId};`,
      sql`SELECT COUNT(DISTINCT "visitorId") FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId};`,
      sql`SELECT country, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId} AND country IS NOT NULL AND country != '' GROUP BY country ORDER BY clicks DESC LIMIT 7;`,
      sql`SELECT city, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId} AND city IS NOT NULL AND city != '' GROUP BY city ORDER BY clicks DESC LIMIT 7;`,
      sql`SELECT region, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId} AND region IS NOT NULL AND region != '' GROUP BY region ORDER BY clicks DESC LIMIT 7;`,
      sql`SELECT EXTRACT(HOUR FROM timestamp AT TIME ZONE 'America/Sao_Paulo') as hour_of_day, COUNT(*) as total_clicks FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId} GROUP BY hour_of_day ORDER BY hour_of_day;`,
      sql`SELECT EXTRACT(HOUR FROM timestamp AT TIME ZONE 'America/Sao_Paulo') as peak_hour FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId} GROUP BY peak_hour ORDER BY COUNT(*) DESC LIMIT 1;`,
      sql`SELECT DATE_TRUNC('day', timestamp AT TIME ZONE 'America/Sao_Paulo')::DATE as date, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId} GROUP BY date ORDER BY date DESC LIMIT 30;`,
    ]);

    const totalClicks = parseInt(clicksResult.rows[0].count as string, 10);

    // Se não há cliques, retornamos um objeto mínimo para a UI lidar com o estado vazio.
    // O título e a URL serão buscados na página container.
    if (totalClicks === 0) {
      return {
        linkId: linkId,
        linkTitle: "", // Será preenchido pela página
        linkUrl: "",   // Será preenchido pela página
        totalClicks: 0, uniqueUsers: 0, countriesReached: 0,
        dailyData: [], countryData: [], cityData: [], regionData: [], hourlyData: [], peakHour: null,
      };
    }

    const totalUniqueUsers = parseInt(uniqueUsersResult.rows[0].count as string, 10);

    // Adicionando tipagem explícita para as linhas dos resultados
    const countryData = countryResult.rows.map((row: QueryResultRow) => ({
      country: row.country,
      clicks: parseInt(row.clicks, 10),
      percentage: (parseInt(row.clicks, 10) / totalClicks) * 100
    }));

    const cityData = cityResult.rows.map((row: QueryResultRow) => ({ city: row.city, clicks: parseInt(row.clicks, 10) }));
    const regionData = regionResult.rows.map((row: QueryResultRow) => ({ region: row.region, clicks: parseInt(row.clicks, 10) }));

    return {
      linkId: linkId,
      linkTitle: "", // Será preenchido pela página
      linkUrl: "",   // Será preenchido pela página
      totalClicks,
      uniqueUsers: totalUniqueUsers,
      countriesReached: countryData.length,
      dailyData: dailyResult.rows.map((row: QueryResultRow) => ({ date: row.date.toISOString().split('T')[0], clicks: parseInt(row.clicks, 10) })).reverse(),
      countryData,
      cityData,
      regionData,
      hourlyData: hourlyResult.rows.map((row: QueryResultRow) => ({ hour_of_day: parseInt(row.hour_of_day, 10), total_clicks: parseInt(row.total_clicks, 10) })),
      peakHour: peakHourResult.rows.length > 0 ? parseInt(peakHourResult.rows[0].peak_hour, 10) : null,
    };

  } catch (err) {
    console.error("Erro em fetchDetailedAnalyticsForLink:", err);
    return null;
  }
}