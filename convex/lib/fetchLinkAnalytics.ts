export interface LinkAnalyticsData {
  linkId: string;
  linkTitle: string;
  linkUrl: string;
  totalClicks: number;
  uniqueUsers: number;
  countriesReached: number;
  dailyData: Array<{
    date: string;
    clicks: number;
    uniqueUsers: number;
    countries: number;
  }>;
  countryData: Array<{
    country: string;
    clicks: number;
    percentage: number;
  }>;
}

interface TinybirdLinkAnalyticsRow {
  date: string;
  linkTitle: string;
  linkUrl: string;
  total_clicks: number;
  unique_users: number;
  countries_reached: number;
}

interface TinybirdCountryAnalyticsRow {
  country: string;
  total_clicks: number;
  unique_users: number;
  percentage: number;
}

export async function fetchLinkAnalytics(
  userId: string,
  linkId: string,
  daysBack: number = 30
): Promise<LinkAnalyticsData | null> {
  const { TINYBIRD_TOKEN, TINYBIRD_HOST } = process.env;

  if (!TINYBIRD_TOKEN || !TINYBIRD_HOST) {
    return {
      linkId,
      linkTitle: "Sample Link",
      linkUrl: "https://example.com",
      totalClicks: 0,
      uniqueUsers: 0,
      countriesReached: 0,
      dailyData: [],
      countryData: [],
    };
  }

  const headers = {
    Authorization: `Bearer ${TINYBIRD_TOKEN}`,
  };

  try {
    // Tenta ponto de analytics rápido
    let response = await fetch(
      `${TINYBIRD_HOST}/v0/pipes/fast_link_analytics.json?profileUserId=${userId}&linkId=${linkId}&days_back=${daysBack}`,
      { headers }
    );

    // Se falhar, tenta o fallback
    if (!response.ok) {
      console.warn("Fallback para endpoint padrão de analytics...");
      response = await fetch(
        `${TINYBIRD_HOST}/v0/pipes/link_analytics.json?profileUserId=${userId}&linkId=${linkId}&days_back=${daysBack}`,
        { headers }
      );
    }

    if (!response.ok) {
      console.error("Erro no Tinybird analytics:", await response.text());
      return null;
    }

    const json = await response.json();
    const rows: TinybirdLinkAnalyticsRow[] = json.data;

    if (!rows || rows.length === 0) {
      return null;
    }

    const dailyData = rows.map((row) => ({
      date: row.date,
      clicks: row.total_clicks || 0,
      uniqueUsers: row.unique_users || 0,
      countries: row.countries_reached || 0,
    }));

    const totalClicks = dailyData.reduce((acc, day) => acc + day.clicks, 0);
    const uniqueUsers = Math.max(...dailyData.map((d) => d.uniqueUsers), 0);
    const countriesReached = Math.max(...dailyData.map((d) => d.countries), 0);

    const firstRow = rows[0];

    // Buscar por país
    let countryData: LinkAnalyticsData["countryData"] = [];

    try {
      const countryResponse = await fetch(
        `${TINYBIRD_HOST}/v0/pipes/link_country_analytics.json?profileUserId=${userId}&linkId=${linkId}&days_back=${daysBack}`,
        { headers }
      );

      if (countryResponse.ok) {
        const result = await countryResponse.json();

        // Normaliza os nomes dos países para evitar 'Unknown' e similares
        countryData =
          result.data?.map((row: TinybirdCountryAnalyticsRow) => {
            let countryName = row.country?.trim() || "";

            const unknownValues = [
              "",
              "unknown",
              "unknown country",
              "null",
              "undefined",
            ];
            if (unknownValues.includes(countryName.toLowerCase())) {
              countryName = "Brasil";
            }

            return {
              country: countryName,
              clicks: row.total_clicks || 0,
              percentage: row.percentage || 0,
            };
          }) || [];
      }
    } catch (e) {
      console.error("Erro ao buscar dados por país:", e);
    }

    return {
      linkId,
      linkTitle: firstRow.linkTitle || "Link Desconhecido",
      linkUrl: firstRow.linkUrl || "",
      totalClicks,
      uniqueUsers,
      countriesReached,
      dailyData: dailyData.reverse(),
      countryData,
    };
  } catch (err) {
    console.error("Erro geral em fetchLinkAnalytics:", err);
    return null;
  }
}
