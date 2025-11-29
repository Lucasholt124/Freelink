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
  // NOVO: Array para o gráfico real
  dailyClicks: { date: string; count: number }[];
}

export async function fetchAnalytics(userId: string): Promise<AnalyticsData> {
  const [
    postgresResults,
    convexLinks,
  ] = await Promise.all([
    Promise.all([
      // 0. Total Cliques
      sql`SELECT COUNT(*) FROM clicks WHERE "profileUserId" = ${userId};`,
      // 1. Visitantes Únicos
      sql`SELECT COUNT(DISTINCT "visitorId") FROM clicks WHERE "profileUserId" = ${userId};`,
      // 2. Top Referrer
      sql`SELECT COALESCE(NULLIF(referrer, ''), 'Direto') as source, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} GROUP BY source ORDER BY clicks DESC LIMIT 1;`,
      // 3. Top Link
      sql`SELECT "linkId", COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" IS NOT NULL GROUP BY "linkId" ORDER BY clicks DESC LIMIT 1;`,
      // 4. Hora de Pico
      sql`SELECT EXTRACT(HOUR FROM timestamp AT TIME ZONE 'America/Sao_Paulo') as hour, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} GROUP BY hour ORDER BY clicks DESC LIMIT 1;`,
      // 5. Top País
      sql`SELECT country, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} AND country IS NOT NULL AND country != '' AND country != 'Unknown' GROUP BY country ORDER BY clicks DESC LIMIT 1;`,
      // 6. Última Atividade
      sql`SELECT MAX(timestamp) as last_click FROM clicks WHERE "profileUserId" = ${userId};`,
      // 7. NOVO: Histórico dos últimos 7 dias para o gráfico
      sql`
        SELECT to_char(timestamp AT TIME ZONE 'America/Sao_Paulo', 'DD/MM') as day, COUNT(*) as count
        FROM clicks
        WHERE "profileUserId" = ${userId}
        AND timestamp >= NOW() - INTERVAL '7 days'
        GROUP BY day
        ORDER BY MAX(timestamp) ASC;
      `,
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
    lastActivityResult,
    historyResult, // Novo resultado
  ] = postgresResults;

  const convexLinksMap = new Map(convexLinks.map(link => [link._id, link.title]));
  const topLinkFromDb = topLinkResult.rows[0];
  const topLinkTitle = topLinkFromDb ? convexLinksMap.get(topLinkFromDb.linkId) : null;

  const lastClickTimestamp = lastActivityResult.rows[0]?.last_click;
  const lastActivityFormatted = lastClickTimestamp
    ? formatInTimeZone(new Date(lastClickTimestamp), 'America/Sao_Paulo', "dd 'de' MMM. yyyy, 'às' HH:mm", { locale: ptBR })
    : null;

  // Processa o histórico para o gráfico
  const dailyClicks = historyResult.rows.map(row => ({
    date: row.day,
    count: parseInt(row.count, 10)
  }));

  return {
    totalClicks: parseInt(clicksResult.rows[0]?.count || '0', 10),
    uniqueVisitors: parseInt(uniqueUsersResult.rows[0]?.count || '0', 10),
    topReferrer: topReferrerResult.rows[0] ? {
      source: topReferrerResult.rows[0].source,
      clicks: parseInt(topReferrerResult.rows[0].clicks, 10),
    } : null,
    topLink: topLinkFromDb && topLinkTitle ? {
      title: topLinkTitle,
      clicks: parseInt(topLinkFromDb.clicks, 10),
    } : null,
    peakHour: peakHourResult.rows[0] ? {
      hour: parseInt(peakHourResult.rows[0].hour, 10),
      clicks: parseInt(peakHourResult.rows[0].clicks, 10),
    } : null,
    topCountry: topCountryResult.rows[0] ? {
      name: topCountryResult.rows[0].country,
      clicks: parseInt(topCountryResult.rows[0].clicks, 10),
    } : null,
    lastActivity: lastActivityFormatted,
    dailyClicks: dailyClicks, // Envia o histórico real
  };
}