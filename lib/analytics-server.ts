import { sql } from '@vercel/postgres';
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { ptBR } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';

export interface AnalyticsData {
  totalClicks: number;
  uniqueVisitors: number;
  topReferrer: { source: string; clicks: number } | null;
  topLink: { title: string; clicks: number } | null;
  peakHour: { hour: number; clicks: number } | null;
  topCountry: { name: string; clicks: number } | null;
  lastActivity: string | null;
  growth?: string;
  dailyClicks: { date: string; count: number }[];
}

export async function fetchAnalytics(userId: string, slug: string): Promise<AnalyticsData> {
  const [aggregatedResult, convexLinks] = await Promise.all([
    sql`
      SELECT
        COUNT(*) AS total_clicks,
        COUNT(DISTINCT "visitorId") AS unique_visitors,
        MAX(timestamp) AS last_click,

        -- Top Referrer
        (SELECT COALESCE(NULLIF(referrer, ''), 'Direto')
         FROM clicks c2
         WHERE (c2.slug = ${slug} OR c2."profileUserId" = ${userId})
         GROUP BY COALESCE(NULLIF(referrer, ''), 'Direto')
         ORDER BY COUNT(*) DESC LIMIT 1
        ) AS top_referrer_source,
        (SELECT COUNT(*)
         FROM clicks c2
         WHERE (c2.slug = ${slug} OR c2."profileUserId" = ${userId})
         GROUP BY COALESCE(NULLIF(referrer, ''), 'Direto')
         ORDER BY COUNT(*) DESC LIMIT 1
        ) AS top_referrer_clicks,

        -- Top Link
        (SELECT "linkId"
         FROM clicks c2
         WHERE (c2.slug = ${slug} OR c2."profileUserId" = ${userId}) AND "linkId" IS NOT NULL
         GROUP BY "linkId"
         ORDER BY COUNT(*) DESC LIMIT 1
        ) AS top_link_id,
        (SELECT COUNT(*)
         FROM clicks c2
         WHERE (c2.slug = ${slug} OR c2."profileUserId" = ${userId}) AND "linkId" IS NOT NULL
         GROUP BY "linkId"
         ORDER BY COUNT(*) DESC LIMIT 1
        ) AS top_link_clicks,

        -- Peak Hour
        (SELECT EXTRACT(HOUR FROM timestamp AT TIME ZONE 'America/Sao_Paulo')
         FROM clicks c2
         WHERE (c2.slug = ${slug} OR c2."profileUserId" = ${userId})
         GROUP BY EXTRACT(HOUR FROM timestamp AT TIME ZONE 'America/Sao_Paulo')
         ORDER BY COUNT(*) DESC LIMIT 1
        ) AS peak_hour,
        (SELECT COUNT(*)
         FROM clicks c2
         WHERE (c2.slug = ${slug} OR c2."profileUserId" = ${userId})
         GROUP BY EXTRACT(HOUR FROM timestamp AT TIME ZONE 'America/Sao_Paulo')
         ORDER BY COUNT(*) DESC LIMIT 1
        ) AS peak_hour_clicks,

        -- Top Country
        (SELECT country
         FROM clicks c2
         WHERE (c2.slug = ${slug} OR c2."profileUserId" = ${userId})
           AND country IS NOT NULL AND country != '' AND country != 'Unknown'
         GROUP BY country
         ORDER BY COUNT(*) DESC LIMIT 1
        ) AS top_country,
        (SELECT COUNT(*)
         FROM clicks c2
         WHERE (c2.slug = ${slug} OR c2."profileUserId" = ${userId})
           AND country IS NOT NULL AND country != '' AND country != 'Unknown'
         GROUP BY country
         ORDER BY COUNT(*) DESC LIMIT 1
        ) AS top_country_clicks

      FROM clicks
      WHERE (slug = ${slug} OR "profileUserId" = ${userId});
    `,
    fetchQuery(api.lib.links.getLinksByUserId, { userId }),
  ]);

  const historyResult = await sql`
    SELECT to_char(timestamp AT TIME ZONE 'America/Sao_Paulo', 'DD/MM') as day, COUNT(*) as count
    FROM clicks
    WHERE (slug = ${slug} OR "profileUserId" = ${userId})
    AND timestamp >= NOW() - INTERVAL '7 days'
    GROUP BY day
    ORDER BY MAX(timestamp) ASC;
  `;

  const row = aggregatedResult.rows[0];

  const convexLinksMap = new Map(convexLinks.map(link => [link._id, link.title]));
  const topLinkTitle = row?.top_link_id ? convexLinksMap.get(row.top_link_id) : null;

  const lastActivityFormatted = row?.last_click
    ? formatInTimeZone(new Date(row.last_click), 'America/Sao_Paulo', "dd 'de' MMM. yyyy, 'às' HH:mm", { locale: ptBR })
    : null;

  const dailyClicks = historyResult.rows.map(r => ({
    date: r.day,
    count: parseInt(r.count, 10),
  }));

  return {
    totalClicks: parseInt(row?.total_clicks || '0', 10),
    uniqueVisitors: parseInt(row?.unique_visitors || '0', 10),
    topReferrer: row?.top_referrer_source ? {
      source: row.top_referrer_source,
      clicks: parseInt(row.top_referrer_clicks, 10),
    } : null,
    topLink: row?.top_link_id && topLinkTitle ? {
      title: topLinkTitle,
      clicks: parseInt(row.top_link_clicks, 10),
    } : null,
    peakHour: row?.peak_hour != null ? {
      hour: parseInt(row.peak_hour, 10),
      clicks: parseInt(row.peak_hour_clicks, 10),
    } : null,
    topCountry: row?.top_country ? {
      name: row.top_country,
      clicks: parseInt(row.top_country_clicks, 10),
    } : null,
    lastActivity: lastActivityFormatted,
    dailyClicks,
  };
}