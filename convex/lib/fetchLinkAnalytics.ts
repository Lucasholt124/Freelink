import { sql, QueryResultRow } from '@vercel/postgres';

// Interface atualizada com os novos campos
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
  // Novos campos adicionados
  conversionRate: number;
  bounceRate: number;
  avgSessionDuration: string;
  devices: { desktop: number; mobile: number; tablet: number };
  trafficSources: Array<{ name: string; clicks: number; icon: string }>;
  recentActivities: Array<{ time: string; action: string; location: string }>;
  performanceMetrics: { loadTime: number; responseTime: number; uptime: number };
  engagement: { avgTimeOnPage: string; pagesPerSession: number; returnRate: number };
  browsers: Array<{ name: string; count: number; percentage: number }>;
  operatingSystems: Array<{ name: string; count: number; percentage: number }>;
  referrers: Array<{ source: string; count: number }>;
  comparison: { current: number; previous: number; percentageChange: number };
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
    // Queries paralelas otimizadas
    const [
      clicksResult,
      uniqueUsersResult,
      countryResult,
      cityResult,
      regionResult,
      hourlyResult,
      dailyResult,
      // Novas queries adicionadas
      deviceStatsResult,
      trafficSourcesResult,
      recentClicksResult,
      bounceRateResult,
      conversionRateResult,
      engagementResult,
      browserStatsResult,
      osStatsResult,
      referrerDetailsResult,
      comparisonResult,
    ] = await Promise.all([
      // Queries existentes
      sql`SELECT COUNT(*) FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId};`,
      sql`SELECT COUNT(DISTINCT "visitorId") FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId};`,
      sql`SELECT country, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId} AND country IS NOT NULL AND country != '' GROUP BY country ORDER BY clicks DESC LIMIT 7;`,
      sql`SELECT city, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId} AND city IS NOT NULL AND city != '' GROUP BY city ORDER BY clicks DESC LIMIT 7;`,
      sql`SELECT region, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId} AND region IS NOT NULL AND region != '' GROUP BY region ORDER BY clicks DESC LIMIT 7;`,
      sql`SELECT EXTRACT(HOUR FROM timestamp AT TIME ZONE 'America/Sao_Paulo') as hour_of_day, COUNT(*)::int as total_clicks FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId} GROUP BY hour_of_day ORDER BY hour_of_day;`,
      sql`SELECT DATE_TRUNC('day', timestamp AT TIME ZONE 'America/Sao_Paulo')::DATE as date, COUNT(*)::int as clicks FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId} GROUP BY date ORDER BY date DESC LIMIT 30;`,

      // Novas queries para funcionalidades adicionais

      // Estatísticas de dispositivos
      sql`
        SELECT
          CASE
            WHEN "userAgent" LIKE '%Mobile%' THEN 'mobile'
            WHEN "userAgent" LIKE '%Tablet%' OR "userAgent" LIKE '%iPad%' THEN 'tablet'
            ELSE 'desktop'
          END as device_type,
          COUNT(*)::int as count
        FROM clicks
        WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId}
        GROUP BY device_type;
      `,

      // Fontes de tráfego
      sql`
        SELECT
          CASE
            WHEN referrer = '' OR referrer IS NULL THEN 'Direto'
            WHEN referrer LIKE '%facebook%' OR referrer LIKE '%instagram%' OR referrer LIKE '%twitter%' THEN 'Social Media'
            WHEN referrer LIKE '%google%' OR referrer LIKE '%bing%' OR referrer LIKE '%yahoo%' THEN 'Pesquisa'
            WHEN referrer LIKE '%linkedin%' THEN 'LinkedIn'
            WHEN referrer LIKE '%youtube%' THEN 'YouTube'
            ELSE 'Outros'
          END as source,
          COUNT(*)::int as clicks
        FROM clicks
        WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId}
        GROUP BY source
        ORDER BY clicks DESC;
      `,

      // Cliques recentes para atividades
      sql`
        SELECT
          timestamp AT TIME ZONE 'America/Sao_Paulo' as timestamp,
          city,
          country,
          region
        FROM clicks
        WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId}
        ORDER BY timestamp DESC
        LIMIT 10;
      `,

      // Taxa de rejeição
      sql`
        WITH visitor_clicks AS (
          SELECT "visitorId", COUNT(*) as click_count
          FROM clicks
          WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId}
          GROUP BY "visitorId"
        )
        SELECT
          (COUNT(CASE WHEN click_count = 1 THEN 1 END)::float /
           NULLIF(COUNT(*), 0) * 100)::numeric(5,2) as bounce_rate
        FROM visitor_clicks;
      `,

      // Taxa de conversão
      sql`
        SELECT
          (COUNT(DISTINCT "visitorId")::float /
           NULLIF(COUNT(*), 0) * 100)::numeric(5,2) as conversion_rate
        FROM clicks
        WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId};
      `,

      // Métricas de engajamento
      sql`
        WITH visitor_stats AS (
          SELECT
            "visitorId",
            COUNT(*) as clicks,
            COUNT(DISTINCT DATE(timestamp)) as days_active
          FROM clicks
          WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId}
          GROUP BY "visitorId"
        )
        SELECT
          AVG(clicks)::numeric(5,2) as avg_clicks,
          (COUNT(CASE WHEN days_active > 1 THEN 1 END)::float /
           NULLIF(COUNT(*), 0) * 100)::numeric(5,2) as return_rate
        FROM visitor_stats;
      `,

      // Navegadores
      sql`
        SELECT
          CASE
            WHEN "userAgent" LIKE '%Chrome%' AND "userAgent" NOT LIKE '%Edge%' THEN 'Chrome'
            WHEN "userAgent" LIKE '%Safari%' AND "userAgent" NOT LIKE '%Chrome%' THEN 'Safari'
            WHEN "userAgent" LIKE '%Firefox%' THEN 'Firefox'
            WHEN "userAgent" LIKE '%Edge%' THEN 'Edge'
            WHEN "userAgent" LIKE '%Opera%' THEN 'Opera'
            ELSE 'Outros'
          END as browser,
          COUNT(*)::int as count
        FROM clicks
        WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId}
        GROUP BY browser
        ORDER BY count DESC;
      `,

      // Sistemas operacionais
      sql`
        SELECT
          CASE
            WHEN "userAgent" LIKE '%Windows%' THEN 'Windows'
            WHEN "userAgent" LIKE '%Mac OS%' THEN 'macOS'
            WHEN "userAgent" LIKE '%Linux%' AND "userAgent" NOT LIKE '%Android%' THEN 'Linux'
            WHEN "userAgent" LIKE '%Android%' THEN 'Android'
            WHEN "userAgent" LIKE '%iOS%' OR "userAgent" LIKE '%iPhone%' OR "userAgent" LIKE '%iPad%' THEN 'iOS'
            ELSE 'Outros'
          END as os,
          COUNT(*)::int as count
        FROM clicks
        WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId}
        GROUP BY os
        ORDER BY count DESC;
      `,

      // Top referrers
      sql`
        SELECT
          COALESCE(NULLIF(referrer, ''), 'Direto') as referrer,
          COUNT(*)::int as count
        FROM clicks
        WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId}
        GROUP BY referrer
        ORDER BY count DESC
        LIMIT 10;
      `,

      // Comparação de períodos
      sql`
        SELECT
          COUNT(CASE WHEN timestamp >= NOW() - INTERVAL '30 days' THEN 1 END)::int as current_period,
          COUNT(CASE WHEN timestamp < NOW() - INTERVAL '30 days'
                     AND timestamp >= NOW() - INTERVAL '60 days' THEN 1 END)::int as previous_period
        FROM clicks
        WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId};
      `,
    ]);

    const totalClicks = parseInt(clicksResult.rows[0].count as string, 10);

    // Retorna um objeto vazio se não houver cliques
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
        conversionRate: 0,
        bounceRate: 0,
        avgSessionDuration: '0s',
        devices: { desktop: 0, mobile: 0, tablet: 0 },
        trafficSources: [],
        recentActivities: [],
        performanceMetrics: { loadTime: 0, responseTime: 0, uptime: 99.9 },
        engagement: { avgTimeOnPage: '0s', pagesPerSession: 0, returnRate: 0 },
        browsers: [],
        operatingSystems: [],
        referrers: [],
        comparison: { current: 0, previous: 0, percentageChange: 0 },
      };
    }

    const totalUniqueUsers = parseInt(uniqueUsersResult.rows[0].count as string, 10);

    // Processar dados de países
    const countryData = countryResult.rows.map((row: QueryResultRow) => ({
      country: row.country,
      clicks: parseInt(row.clicks, 10),
      percentage: (parseInt(row.clicks, 10) / totalClicks) * 100,
    }));

    // Processar dados horários
    const hourlyData = hourlyResult.rows.map((row: QueryResultRow) => ({
      hour_of_day: parseInt(row.hour_of_day, 10),
      total_clicks: row.total_clicks,
    }));

    // Calcular horário de pico (mantendo sua otimização)
    let peakHour: number | null = null;
    if (hourlyData.length > 0) {
      const peakHourObject = hourlyData.reduce((prev, current) =>
        (prev.total_clicks > current.total_clicks) ? prev : current
      );
      peakHour = peakHourObject.hour_of_day;
    }

    // Processar dispositivos
    const devices = { desktop: 0, mobile: 0, tablet: 0 };
    deviceStatsResult.rows.forEach((row: QueryResultRow) => {
      const deviceType = row.device_type as keyof typeof devices;
      devices[deviceType] = row.count;
    });

    // Processar fontes de tráfego
    const trafficSources = trafficSourcesResult.rows.map((row: QueryResultRow) => ({
      name: row.source,
      clicks: row.clicks,
      icon: getTrafficSourceIcon(row.source),
    }));

    // Processar atividades recentes
    const recentActivities = recentClicksResult.rows.map((row: QueryResultRow) => ({
      time: formatRelativeTime(new Date(row.timestamp)),
      action: 'Clique no link',
      location: formatLocation(row.city, row.region, row.country),
    }));

    // Processar navegadores
    const browsers = browserStatsResult.rows.map((row: QueryResultRow) => ({
      name: row.browser,
      count: row.count,
      percentage: (row.count / totalClicks) * 100,
    }));

    // Processar sistemas operacionais
    const operatingSystems = osStatsResult.rows.map((row: QueryResultRow) => ({
      name: row.os,
      count: row.count,
      percentage: (row.count / totalClicks) * 100,
    }));

    // Processar referrers
    const referrers = referrerDetailsResult.rows.map((row: QueryResultRow) => ({
      source: row.referrer,
      count: row.count,
    }));

    // Processar comparação
    const comparisonRow = comparisonResult.rows[0];
    const currentPeriod = comparisonRow?.current_period || 0;
    const previousPeriod = comparisonRow?.previous_period || 0;
    const percentageChange = previousPeriod > 0
      ? ((currentPeriod - previousPeriod) / previousPeriod) * 100
      : 0;

    // Processar métricas de engajamento
    const engagementRow = engagementResult.rows[0];
    const engagement = {
      avgTimeOnPage: formatDuration(Math.floor(Math.random() * 300) + 60), // Mock por enquanto
      pagesPerSession: parseFloat(engagementRow?.avg_clicks || '1'),
      returnRate: parseFloat(engagementRow?.return_rate || '0'),
    };

    // Métricas de performance (mock por enquanto - você pode implementar medição real)
    const performanceMetrics = {
      loadTime: Math.floor(Math.random() * 500) + 100,
      responseTime: Math.floor(Math.random() * 150) + 50,
      uptime: 99.9,
    };

    return {
      linkId: linkId,
      linkTitle: '', // Será preenchido pela página que consome esta função
      linkUrl: '',   // Será preenchido pela página que consome esta função
      totalClicks,
      uniqueUsers: totalUniqueUsers,
      countriesReached: countryData.length,
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
      peakHour,
      // Novos campos
      conversionRate: parseFloat(conversionRateResult.rows[0]?.conversion_rate || '0'),
      bounceRate: parseFloat(bounceRateResult.rows[0]?.bounce_rate || '0'),
      avgSessionDuration: formatDuration(Math.floor(Math.random() * 300) + 60), // Mock
      devices,
      trafficSources,
      recentActivities,
      performanceMetrics,
      engagement,
      browsers,
      operatingSystems,
      referrers,
      comparison: {
        current: currentPeriod,
        previous: previousPeriod,
        percentageChange,
      },
    };
  } catch (err) {
    console.error('Erro em fetchDetailedAnalyticsForLink:', err);
    return null;
  }
}

// Funções auxiliares
function getTrafficSourceIcon(source: string): string {
  const iconMap: { [key: string]: string } = {
    'Direto': 'direct',
    'Social Media': 'social',
    'Pesquisa': 'search',
    'LinkedIn': 'linkedin',
    'YouTube': 'youtube',
    'Outros': 'other',
  };
  return iconMap[source] || 'other';
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora mesmo';
  if (diffMins < 60) return `Há ${diffMins} min`;
  if (diffHours < 24) return `Há ${diffHours}h`;
  if (diffDays < 7) return `Há ${diffDays} dias`;

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short'
  });
}

function formatLocation(city: string | null, region: string | null, country: string | null): string {
  const parts = [];
  if (city && city !== '') parts.push(city);
  if (region && region !== '' && region !== city) parts.push(region);
  if (country && country !== '') parts.push(country);

  return parts.length > 0 ? parts.join(', ') : 'Localização desconhecida';
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${hours}h`;
}