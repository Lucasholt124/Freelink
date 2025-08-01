
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

// Interfaces de retorno do Tinybird
interface TinybirdLinkAnalyticsRow {
  date: string;
  linkTitle: string;
  linkUrl: string;
  total_clicks: number;
  unique_users: number;
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
interface TinybirdRegionAnalyticsRow {
  region: string;
  total_clicks: number;
}
interface TinybirdHourlyAnalyticsRow {
  hour_of_day: number;
  total_clicks: number;
}
interface TinybirdPeakHourRow {
  peak_hour: number;
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
    const dailyUrl = `${baseUrl}/fast_link_analytics.json?profileUserId=${userId}&linkId=${linkId}&days_back=${daysBack}`;
    const dailyResponse = await fetch(dailyUrl, { headers });
    if (!dailyResponse.ok) {
      console.error(`Falha ao buscar dados diários: ${dailyResponse.status}`);
      return null;
    }

    const dailyJson = await dailyResponse.json();
    const dailyRows: TinybirdLinkAnalyticsRow[] = dailyJson.data;
    if (!dailyRows || dailyRows.length === 0) return null;

    const dailyData = dailyRows.map(row => ({ date: row.date, clicks: row.total_clicks || 0 }));
    const totalClicks = dailyData.reduce((sum, day) => sum + day.clicks, 0);
    const totalUniqueUsers = dailyRows.reduce((sum, row) => sum + (row.unique_users || 0), 0);

    // CORREÇÃO: Usando Promise.allSettled para que a página não quebre se um pipe falhar.
    const results = await Promise.allSettled([
      fetchDataFromPipe<TinybirdCountryAnalyticsRow[]>(`${baseUrl}/link_country_analytics.json?profileUserId=${userId}&linkId=${linkId}&days_back=${daysBack}`, headers),
      fetchDataFromPipe<TinybirdCityAnalyticsRow[]>(`${baseUrl}/link_city_analytics.json?profileUserId=${userId}&linkId=${linkId}&days_back=${daysBack}`, headers),
      fetchDataFromPipe<TinybirdRegionAnalyticsRow[]>(`${baseUrl}/link_region_analytics.json?profileUserId=${userId}&linkId=${linkId}&days_back=${daysBack}`, headers),
      fetchDataFromPipe<TinybirdHourlyAnalyticsRow[]>(`${baseUrl}/link_hourly_analytics.json?profileUserId=${userId}&linkId=${linkId}&days_back=${daysBack}`, headers),
      fetchDataFromPipe<TinybirdPeakHourRow[]>(`${baseUrl}/get_peak_hour.json?profileUserId=${userId}&linkId=${linkId}&days_back=${daysBack}`, headers)
    ]);

    // Extrai os dados com segurança, retornando um array vazio em caso de falha.
    const countryData = results[0].status === 'fulfilled' ? results[0].value.map(c => ({ country: c.country || "Desconhecido", clicks: c.total_clicks, percentage: c.percentage })) : [];
    const cityData = results[1].status === 'fulfilled' ? results[1].value.map(c => ({ city: c.city || "Desconhecido", clicks: c.total_clicks })) : [];
    const regionData = results[2].status === 'fulfilled' ? results[2].value.map(r => ({ region: r.region || "Desconhecido", clicks: r.total_clicks })) : [];
    const hourlyData = results[3].status === 'fulfilled' ? results[3].value : [];
    const peakHourData = results[4].status === 'fulfilled' ? results[4].value : [];
    const peakHour = peakHourData.length > 0 ? peakHourData[0].peak_hour : null;

    return {
      linkId,
      linkTitle: dailyRows[0].linkTitle,
      linkUrl: dailyRows[0].linkUrl,
      totalClicks,
      uniqueUsers: totalUniqueUsers,
      countriesReached: countryData.length,
      dailyData: dailyData.reverse(),
      countryData,
      cityData,
      regionData,
      hourlyData,
      peakHour,
    };
  } catch (err) {
    console.error("Erro em fetchDetailedAnalyticsForLink:", err);
    return null;
  }
}

async function fetchDataFromPipe<T>(url: string, headers: HeadersInit): Promise<T> {
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(`Aviso: Falha na chamada ao pipe ${url.split('/').pop()?.split('?')[0]}. Status: ${res.status}`);
      return [] as T;
    }
    const json = await res.json();
    return json.data || ([] as T);
  } catch (e){
    console.error(`Erro crítico no fetch do pipe ${url.split('/').pop()?.split('?')[0]}.`, e);
    return [] as T;
  }
}