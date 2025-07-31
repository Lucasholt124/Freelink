// ===================================================================================
// ARQUIVO 1: SUA FUNÇÃO DE BUSCA DE DADOS - CORREÇÃO FINAL DE TIPAGEM
// ===================================================================================

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
  hourlyData: Array<{ hour_of_day: number; total_clicks: number }>;
}

// Interfaces de retorno do Tinybird (como estão no JSON)
interface TinybirdLinkAnalyticsRow {
  date: string;
  linkTitle: string;
  linkUrl: string;
  total_clicks: number;
}
interface TinybirdCountryAnalyticsRow {
  country: string;
  total_clicks: number;
  percentage: number;
}
interface TinybirdCityAnalyticsRow {
  city: string;
  total_clicks: number;
}
interface TinybirdHourlyAnalyticsRow {
  hour_of_day: number;
  total_clicks: number;
}

export async function fetchDetailedAnalyticsForLink(
  userId: string,
  linkId: string,
  daysBack: number = 30
): Promise<LinkAnalyticsData | null> {
  const { TINYBIRD_TOKEN, TINYBIRD_HOST } = process.env;
  if (!TINYBIRD_TOKEN || !TINYBIRD_HOST) return null;

  const headers = { Authorization: `Bearer ${TINYBIRD_TOKEN}` };
  const baseUrl = `${TINYBIRD_HOST}/v0/pipes`;

  try {
    const dailyResponse = await fetch(`${baseUrl}/link_analytics.json?profileUserId=${userId}&linkId=${linkId}&days_back=${daysBack}`, { headers });
    if (!dailyResponse.ok) return null;

    const dailyJson = await dailyResponse.json();
    const dailyRows: TinybirdLinkAnalyticsRow[] = dailyJson.data;
    if (!dailyRows || dailyRows.length === 0) return null;

    const dailyData = dailyRows.map((row) => ({
      date: row.date,
      clicks: row.total_clicks || 0,
    }));
    const totalClicks = dailyData.reduce((acc, day) => acc + day.clicks, 0);

    const [countryData, cityData, hourlyData] = await Promise.all([
      fetchDataFromPipe<TinybirdCountryAnalyticsRow[]>(`${baseUrl}/link_country_analytics.json?profileUserId=${userId}&linkId=${linkId}&days_back=${daysBack}`, headers),
      fetchDataFromPipe<TinybirdCityAnalyticsRow[]>(`${baseUrl}/link_city_analytics.json?profileUserId=${userId}&linkId=${linkId}&days_back=${daysBack}`, headers),
      fetchDataFromPipe<TinybirdHourlyAnalyticsRow[]>(`${baseUrl}/link_hourly_analytics.json?profileUserId=${userId}&linkId=${linkId}&days_back=${daysBack}`, headers)
    ]);

    return {
      linkId,
      linkTitle: dailyRows[0].linkTitle,
      linkUrl: dailyRows[0].linkUrl,
      totalClicks,
      uniqueUsers: dailyJson.meta.statistics.rows_read || 0,
      countriesReached: countryData.length,
      dailyData: dailyData.reverse(),
      // AQUI A CORREÇÃO: Mapeamos de 'total_clicks' para 'clicks'
      countryData: countryData.map(c => ({
        country: c.country || "Desconhecido",
        clicks: c.total_clicks, // <-- CORREÇÃO
        percentage: c.percentage
      })),
      // AQUI A CORREÇÃO: Mapeamos de 'total_clicks' para 'clicks'
      cityData: cityData.map(c => ({
        city: c.city || "Desconhecido",
        clicks: c.total_clicks // <-- CORREÇÃO
      })),
      hourlyData,
    };

  } catch (err) {
    console.error("Erro geral em fetchDetailedAnalyticsForLink:", err);
    return null;
  }
}

async function fetchDataFromPipe<T>(url: string, headers: HeadersInit): Promise<T> {
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return [] as T;
    const json = await res.json();
    return json.data || ([] as T);
  } catch {
    return [] as T;
  }
}