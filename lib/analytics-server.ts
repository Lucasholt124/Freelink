export interface AnalyticsData {
  totalClicks: number;
  uniqueVisitors: number;
  countriesReached: number;
  totalLinksClicked: number;
  topLinkTitle: string | null;
  topReferrer: string | null;
  firstClick: string | null;
  lastClick: string | null;
}

export async function fetchAnalytics(
  userId: string,
  daysBack: number = 30,
): Promise<AnalyticsData> {
  // Verifique se o Tinybird está configurado
  if (!process.env.TINYBIRD_TOKEN || !process.env.TINYBIRD_HOST) {
    // Retorna dados vazios quando o Tinybird não está configurado
    return {
      totalClicks: 0,
      uniqueVisitors: 0,
      countriesReached: 0,
      totalLinksClicked: 0,
      topLinkTitle: null,
      topReferrer: null,
      firstClick: null,
      lastClick: null,
    };
  }

  try {
   // Use o endpoint profile_summary original para manter a funcionalidade topK
    const tinybirdResponse = await fetch(
      `${process.env.TINYBIRD_HOST}/v0/pipes/profile_summary.json?profileUserId=${userId}&days_back=${daysBack}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TINYBIRD_TOKEN}`,
        },
        next: { revalidate: 0 }, // Cache por 0 segundos
      },
    );

    if (!tinybirdResponse.ok) {
      console.error("Falha na solicitação do Tinybird:", await tinybirdResponse.text());
      throw new Error("Falha ao buscar análise");
    }

    const data = await tinybirdResponse.json();

    // Handle empty response
    if (!data.data || data.data.length === 0) {
      return {
        totalClicks: 0,
        uniqueVisitors: 0,
        countriesReached: 0,
        totalLinksClicked: 0,
        topLinkTitle: null,
        topReferrer: null,
        firstClick: null,
        lastClick: null,
      };
    }

    const analytics = data.data[0];

    return {
      totalClicks: analytics.total_clicks || 0,
      uniqueVisitors: analytics.unique_users || 0,
      countriesReached: analytics.countries_reached || 0,
      totalLinksClicked: analytics.total_links_clicked || 0,
      topLinkTitle: analytics.top_link_title?.[0] || null,
      topReferrer: analytics.top_referrer?.[0] || null,
      firstClick: analytics.first_click || null,
      lastClick: analytics.last_click || null,
    };
  } catch (tinybirdError) {
    console.error("Erro do Tinybird:", tinybirdError);
   // Retorna dados vazios se o Tinybird falhar
    return {
      totalClicks: 0,
      uniqueVisitors: 0,
      countriesReached: 0,
      totalLinksClicked: 0,
      topLinkTitle: null,
      topReferrer: null,
      firstClick: null,
      lastClick: null,
    };
  }
}