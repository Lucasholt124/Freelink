import { sql } from '@vercel/postgres';
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { format } from 'date-fns'; // Usaremos a função 'format'
import { ptBR } from 'date-fns/locale';

// --- INTERFACE DE DADOS ATUALIZADA ---
export interface AnalyticsData {
  totalClicks: number;
  uniqueVisitors: number;
  topReferrer: { source: string; clicks: number } | null;
  topLink: { title: string; clicks: number } | null;
  peakHour: { hour: number; clicks: number } | null;
  topCountry: { name: string; clicks: number } | null;
  lastActivity: string | null;
}

export async function fetchAnalytics(userId: string): Promise<AnalyticsData> {
  // 1. Buscamos todos os dados do Postgres E a lista de links do Convex em paralelo
  const [
    postgresResults,
    convexLinks,
  ] = await Promise.all([
    Promise.all([
      sql`SELECT COUNT(*) FROM clicks WHERE "profileUserId" = ${userId};`,
      sql`SELECT COUNT(DISTINCT "visitorId") FROM clicks WHERE "profileUserId" = ${userId};`,
      sql`SELECT COALESCE(NULLIF(referrer, ''), 'Direto') as source, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} GROUP BY source ORDER BY clicks DESC LIMIT 1;`,
      sql`SELECT "linkId", COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} AND "linkId" IS NOT NULL GROUP BY "linkId" ORDER BY clicks DESC LIMIT 1;`,
      sql`SELECT EXTRACT(HOUR FROM timestamp AT TIME ZONE 'America/Sao_Paulo') as hour, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} GROUP BY hour ORDER BY clicks DESC LIMIT 1;`,
      sql`SELECT country, COUNT(*) as clicks FROM clicks WHERE "profileUserId" = ${userId} AND country IS NOT NULL AND country != '' AND country != 'Unknown' GROUP BY country ORDER BY clicks DESC LIMIT 1;`,
      sql`SELECT MAX(timestamp) as last_click FROM clicks WHERE "profileUserId" = ${userId};`,
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
  ] = postgresResults;

  // 2. Criamos o mapa de links (como antes)
  const convexLinksMap = new Map(convexLinks.map(link => [link._id, link.title]));

  // 3. Processamos o link mais popular (como antes)
  const topLinkFromDb = topLinkResult.rows[0];
  const topLinkTitle = topLinkFromDb ? convexLinksMap.get(topLinkFromDb.linkId) : null;

  // 4. --- PROCESSAMENTO CORRIGIDO E FINAL PARA 'lastActivity' ---
  const lastClickTimestamp = lastActivityResult.rows[0]?.last_click;
  const lastActivityFormatted = lastClickTimestamp
    ? format(new Date(lastClickTimestamp), "dd 'de' MMM. yyyy, 'às' HH:mm", { locale: ptBR })
    : null;

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
    lastActivity: lastActivityFormatted, // <-- Adicionamos o novo dado formatado
  };
}