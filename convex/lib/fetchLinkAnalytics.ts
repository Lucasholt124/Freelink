// ===================================================================================
// ARQUIVO FINAL E CORRIGIDO: convex/lib/fetchLinkAnalytics.ts
// CORREÇÃO: Adicionada a chamada para o pipe get_peak_hour.
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
  peakHour: number | null; // <-- NOVO CAMPO PARA GUARDAR A HORA DE PICO
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
interface TinybirdHourlyAnalyticsRow {
  hour_of_day: number;
  total_clicks: number;
}
// NOVA INTERFACE PARA A RESPOSTA DO get_peak_hour
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
    if (!dailyResponse.ok) return null;

    const dailyJson = await dailyResponse.json();
    const dailyRows: TinybirdLinkAnalyticsRow[] = dailyJson.data;
    if (!dailyRows || dailyRows.length === 0) return null;

    const dailyData = dailyRows.map(row => ({ date: row.date, clicks: row.total_clicks || 0 }));
    const totalClicks = dailyData.reduce((sum, day) => sum + day.clicks, 0);
    const totalUniqueUsers = dailyRows.reduce((sum, row) => sum + (row.unique_users || 0), 0);

    // CORREÇÃO: Adicionamos a chamada para get_peak_hour aqui
    const [countryData, cityData, hourlyData, peakHourData] = await Promise.all([
      fetchDataFromPipe<TinybirdCountryAnalyticsRow[]>(`${baseUrl}/link_country_analytics.json?profileUserId=${userId}&linkId=${linkId}&days_back=${daysBack}`, headers),
      fetchDataFromPipe<TinybirdCityAnalyticsRow[]>(`${baseUrl}/link_city_analytics.json?profileUserId=${userId}&linkId=${linkId}&days_back=${daysBack}`, headers),
      fetchDataFromPipe<TinybirdHourlyAnalyticsRow[]>(`${baseUrl}/link_hourly_analytics.json?profileUserId=${userId}&linkId=${linkId}&days_back=${daysBack}`, headers),
      fetchDataFromPipe<TinybirdPeakHourRow[]>(`${baseUrl}/get_peak_hour.json?profileUserId=${userId}&linkId=${linkId}&days_back=${daysBack}`, headers)
    ]);

    // Extrai o valor da hora de pico da resposta
    const peakHour = peakHourData.length > 0 ? peakHourData[0].peak_hour : null;

    return {
      linkId,
      linkTitle: dailyRows[0].linkTitle,
      linkUrl: dailyRows[0].linkUrl,
      totalClicks,
      uniqueUsers: totalUniqueUsers,
      countriesReached: countryData.length,
      dailyData: dailyData.reverse(),
      countryData: countryData.map(c => ({ country: c.country || "Desconhecido", clicks: c.total_clicks, percentage: c.percentage })),
      cityData: cityData.map(c => ({ city: c.city || "Desconhecido", clicks: c.total_clicks })),
      hourlyData,
      peakHour, // <-- ADICIONAMOS O RESULTADO AQUI
    };

  } catch (err) {
    console.error("Erro em fetchDetailedAnalyticsForLink:", err);
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