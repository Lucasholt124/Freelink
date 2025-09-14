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

/**
 * Busca dados analíticos detalhados e otimizados para um link específico.
 * Utiliza o fuso horário 'America/Sao_Paulo' para agrupar dados por dia e hora.
 * Calcula o Horário de Pico (peakHour) no servidor para reduzir uma query ao banco de dados.
 */
export async function fetchDetailedAnalyticsForLink(
  userId: string,
  linkId: string
): Promise<LinkAnalyticsData | null> {
  try {
    // Promise.all foi otimizado para remover a query redundante de 'peakHour'.
    const [
      clicksResult,
      uniqueUsersResult,
      countryResult,
      cityResult,
      regionResult,
      hourlyResult, // Apenas uma query para os dados por hora
      dailyResult,
    ] = await Promise.all([
      sql`SELECT COUNT(*) FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId};`,
      sql`SELECT COUNT(DISTINCT "visitorId") FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId};`,
      sql`SELECT country, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId} AND country IS NOT NULL AND country != '' GROUP BY country ORDER BY clicks DESC LIMIT 7;`,
      sql`SELECT city, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId} AND city IS NOT NULL AND city != '' GROUP BY city ORDER BY clicks DESC LIMIT 7;`,
      sql`SELECT region, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId} AND region IS NOT NULL AND region != '' GROUP BY region ORDER BY clicks DESC LIMIT 7;`,
      sql`SELECT EXTRACT(HOUR FROM timestamp AT TIME ZONE 'America/Sao_Paulo') as hour_of_day, COUNT(*)::int as total_clicks FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId} GROUP BY hour_of_day ORDER BY hour_of_day;`,
      sql`SELECT DATE_TRUNC('day', timestamp AT TIME ZONE 'America/Sao_Paulo')::DATE as date, COUNT(*)::int as clicks FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId} GROUP BY date ORDER BY date DESC LIMIT 30;`,
    ]);

    const totalClicks = parseInt(clicksResult.rows[0].count as string, 10);

    // Retorna um objeto vazio se não houver cliques, evitando erros.
    if (totalClicks === 0) {
      return {
        linkId: linkId,
        linkTitle: '',
        linkUrl: '',
        totalClicks: 0,
        uniqueUsers: 0,
        countriesReached: 0,
        dailyData: [],
        countryData: [],
        cityData: [],
        regionData: [],
        hourlyData: [],
        peakHour: null,
      };
    }

    const totalUniqueUsers = parseInt(uniqueUsersResult.rows[0].count as string, 10);

    const countryData = countryResult.rows.map((row: QueryResultRow) => ({
      country: row.country,
      clicks: parseInt(row.clicks, 10),
      percentage: (parseInt(row.clicks, 10) / totalClicks) * 100,
    }));

    const hourlyData = hourlyResult.rows.map((row: QueryResultRow) => ({
      hour_of_day: parseInt(row.hour_of_day, 10),
      total_clicks: row.total_clicks, // Já é 'int' pela query
    }));

    // --- LÓGICA DE OTIMIZAÇÃO ---
    // Calcula o Horário de Pico a partir dos dados já buscados, em vez de fazer uma nova query.
    let peakHour: number | null = null;
    if (hourlyData.length > 0) {
      const peakHourObject = hourlyData.reduce((prev, current) =>
        (prev.total_clicks > current.total_clicks) ? prev : current
      );
      peakHour = peakHourObject.hour_of_day;
    }

    return {
      linkId: linkId,
      linkTitle: '', // Será preenchido pela página que consome esta função
      linkUrl: '',   // Será preenchido pela página que consome esta função
      totalClicks,
      uniqueUsers: totalUniqueUsers,
      countriesReached: countryData.length,
      // Formata a data para YYYY-MM-DD e inverte para ordem cronológica (bom para gráficos)
      dailyData: dailyResult.rows
        .map((row: QueryResultRow) => ({
          date: row.date.toISOString().split('T')[0],
          clicks: row.clicks,
        }))
        .reverse(),
      countryData,
      cityData: cityResult.rows.map((row: QueryResultRow) => ({
        city: row.city,
        clicks: parseInt(row.clicks, 10),
      })),
      regionData: regionResult.rows.map((row: QueryResultRow) => ({
        region: row.region,
        clicks: parseInt(row.clicks, 10),
      })),
      hourlyData,
      peakHour, // Usa o valor calculado
    };
  } catch (err) {
    console.error('Erro em fetchDetailedAnalyticsForLink:', err);
    // Retorna null em caso de erro para que a UI possa tratar a falha.
    return null;
  }
}