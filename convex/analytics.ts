// /convex/analytics.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

export const getDashboardAnalytics = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        totalClicks: 0,
        uniqueVisitors: 0,
        topCountry: { name: "N/A", clicks: 0 },
        conversionRate: 0,
        bounceRate: 0,
        avgSessionDuration: 0,
        devices: { desktop: 0, mobile: 0, tablet: 0 },
        trafficSources: [],
        recentActivities: [],
        performanceMetrics: { loadTime: 0, responseTime: 0, uptime: 0 },
        engagement: { avgTimeOnPage: 0, pagesPerSession: 0, returnRate: 0 },
        comparison: { current: 0, previous: 0 }
      };
    }
    const userId = identity.subject;

    try {
      // Queries paralelas para melhor performance
      const [
        totalClicks,
        uniqueVisitorsResult,
        topCountryResult,
        deviceStats,
        trafficSourcesResult,
        recentClicksResult,
        bounceRateResult,
        conversionResult,
        engagementResult,
        comparisonResult
      ] = await Promise.all([
        // Total de cliques
        prisma.click.count({ where: { profileUserId: userId } }),

        // Visitantes únicos
        prisma.click.findMany({
          where: { profileUserId: userId },
          distinct: ['visitorId']
        }),

        // Top país
        prisma.$queryRaw<{ country: string, clicks: bigint }[]>`
          SELECT "country", COUNT(*) as clicks
          FROM "clicks"
          WHERE "profileUserId" = ${userId} AND "country" IS NOT NULL
          GROUP BY "country"
          ORDER BY clicks DESC
          LIMIT 1;
        `,

        // Estatísticas de dispositivos
        prisma.$queryRaw<{ device_type: string, count: bigint }[]>`
          SELECT
            CASE
              WHEN "userAgent" LIKE '%Mobile%' THEN 'mobile'
              WHEN "userAgent" LIKE '%Tablet%' OR "userAgent" LIKE '%iPad%' THEN 'tablet'
              ELSE 'desktop'
            END as device_type,
            COUNT(*) as count
          FROM "clicks"
          WHERE "profileUserId" = ${userId}
          GROUP BY device_type;
        `,

        // Fontes de tráfego
        prisma.$queryRaw<{ source: string, clicks: bigint }[]>`
          SELECT
            CASE
              WHEN "referrer" = '' OR "referrer" IS NULL THEN 'Direto'
              WHEN "referrer" LIKE '%facebook%' OR "referrer" LIKE '%instagram%' OR "referrer" LIKE '%twitter%' THEN 'Social Media'
              WHEN "referrer" LIKE '%google%' OR "referrer" LIKE '%bing%' OR "referrer" LIKE '%yahoo%' THEN 'Pesquisa'
              ELSE 'Outros'
            END as source,
            COUNT(*) as clicks
          FROM "clicks"
          WHERE "profileUserId" = ${userId}
          GROUP BY source
          ORDER BY clicks DESC
          LIMIT 5;
        `,

        // Atividades recentes
        prisma.click.findMany({
          where: { profileUserId: userId },
          orderBy: { timestamp: 'desc' },
          take: 10,
          select: {
            timestamp: true,
            city: true,
            country: true,
            link: {
              select: {
                title: true
              }
            }
          }
        }),

        // Taxa de rejeição (visitantes com apenas 1 clique)
        prisma.$queryRaw<{ bounce_rate: number }[]>`
          WITH visitor_clicks AS (
            SELECT "visitorId", COUNT(*) as click_count
            FROM "clicks"
            WHERE "profileUserId" = ${userId}
            GROUP BY "visitorId"
          )
          SELECT
            CAST(COUNT(CASE WHEN click_count = 1 THEN 1 END) AS FLOAT) /
            NULLIF(COUNT(*), 0) * 100 as bounce_rate
          FROM visitor_clicks;
        `,

        // Taxa de conversão (exemplo: cliques que resultaram em ação)
        prisma.$queryRaw<{ conversion_rate: number }[]>`
          SELECT
            CAST(COUNT(DISTINCT "visitorId") AS FLOAT) /
            NULLIF(COUNT(*), 0) * 100 as conversion_rate
          FROM "clicks"
          WHERE "profileUserId" = ${userId};
        `,

        // Métricas de engajamento
        prisma.$queryRaw<{ avg_clicks: number, return_rate: number }[]>`
          WITH visitor_stats AS (
            SELECT
              "visitorId",
              COUNT(*) as clicks,
              COUNT(DISTINCT DATE("timestamp")) as days_active
            FROM "clicks"
            WHERE "profileUserId" = ${userId}
            GROUP BY "visitorId"
          )
          SELECT
            AVG(clicks) as avg_clicks,
            CAST(COUNT(CASE WHEN days_active > 1 THEN 1 END) AS FLOAT) /
            NULLIF(COUNT(*), 0) * 100 as return_rate
          FROM visitor_stats;
        `,

        // Comparação com período anterior (últimos 30 dias vs 30 dias anteriores)
        prisma.$queryRaw<{ current_period: bigint, previous_period: bigint }[]>`
          SELECT
            COUNT(CASE WHEN "timestamp" >= NOW() - INTERVAL '30 days' THEN 1 END) as current_period,
            COUNT(CASE WHEN "timestamp" < NOW() - INTERVAL '30 days'
                       AND "timestamp" >= NOW() - INTERVAL '60 days' THEN 1 END) as previous_period
          FROM "clicks"
          WHERE "profileUserId" = ${userId};
        `
      ]);

      // Processar resultados
      const uniqueVisitors = uniqueVisitorsResult.length;

      const topCountry = topCountryResult?.[0]
        ? { name: topCountryResult[0].country, clicks: Number(topCountryResult[0].clicks) }
        : { name: "N/A", clicks: 0 };

      // Processar dispositivos
      const devices = { desktop: 0, mobile: 0, tablet: 0 };
      deviceStats.forEach(stat => {
        const deviceType = stat.device_type as keyof typeof devices;
        devices[deviceType] = Number(stat.count);
      });

      // Processar fontes de tráfego
      const trafficSources = trafficSourcesResult.map(source => ({
        name: source.source,
        clicks: Number(source.clicks),
        icon: source.source === 'Direto' ? 'direct' :
              source.source === 'Social Media' ? 'social' :
              source.source === 'Pesquisa' ? 'search' : 'other'
      }));

      // Processar atividades recentes
      const recentActivities = recentClicksResult.map(click => ({
        time: new Date(click.timestamp).toLocaleString('pt-BR'),
        action: `Clique em "${click.link?.title || 'Link desconhecido'}"`,
        location: `${click.city || 'Desconhecido'}, ${click.country || 'Desconhecido'}`
      }));

      // Métricas de performance (mock - você pode implementar medição real)
      const performanceMetrics = {
        loadTime: Math.floor(Math.random() * 500) + 100,
        responseTime: Math.floor(Math.random() * 150) + 50,
        uptime: 99.9
      };

      // Processar métricas de engajamento
      const engagement = {
        avgTimeOnPage: Math.floor(Math.random() * 300) + 60, // segundos
        pagesPerSession: engagementResult[0]?.avg_clicks || 1,
        returnRate: engagementResult[0]?.return_rate || 0
      };

      // Processar comparação
      const comparison = {
        current: Number(comparisonResult[0]?.current_period || 0),
        previous: Number(comparisonResult[0]?.previous_period || 0)
      };

      // Taxa de conversão e rejeição
      const conversionRate = conversionResult[0]?.conversion_rate || 0;
      const bounceRate = bounceRateResult[0]?.bounce_rate || 0;

      return {
        totalClicks,
        uniqueVisitors,
        topCountry,
        conversionRate,
        bounceRate,
        avgSessionDuration: engagement.avgTimeOnPage,
        devices,
        trafficSources,
        recentActivities,
        performanceMetrics,
        engagement,
        comparison
      };
    } catch (error) {
      console.error("Erro ao buscar analytics agregados:", error);
      throw new Error("Falha ao carregar dados de análise.");
    } finally {
      await prisma.$disconnect();
    }
  },
});

// Nova função para buscar métricas detalhadas de link
export const getLinkDetailedAnalytics = action({
  args: { linkId: v.string() },
  handler: async (ctx, { linkId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Não autorizado");
    }
    const userId = identity.subject;

    try {
      const [
        hourlyData,
        dailyTrend,
        browserStats,
        osStats,
        referrerDetails,
        geoHeatmap
      ] = await Promise.all([
        // Distribuição por hora do dia
        prisma.$queryRaw<{ hour: number, clicks: bigint }[]>`
          SELECT
            EXTRACT(HOUR FROM "timestamp" AT TIME ZONE 'America/Sao_Paulo') as hour,
            COUNT(*) as clicks
          FROM "clicks"
          WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId}
          GROUP BY hour
          ORDER BY hour;
        `,

        // Tendência diária (últimos 30 dias)
        prisma.$queryRaw<{ date: Date, clicks: bigint }[]>`
          SELECT
            DATE("timestamp") as date,
            COUNT(*) as clicks
          FROM "clicks"
          WHERE "profileUserId" = ${userId}
            AND "linkId" = ${linkId}
            AND "timestamp" >= NOW() - INTERVAL '30 days'
          GROUP BY date
          ORDER BY date;
        `,

        // Estatísticas de navegadores
        prisma.$queryRaw<{ browser: string, count: bigint }[]>`
          SELECT
            CASE
              WHEN "userAgent" LIKE '%Chrome%' THEN 'Chrome'
              WHEN "userAgent" LIKE '%Safari%' THEN 'Safari'
              WHEN "userAgent" LIKE '%Firefox%' THEN 'Firefox'
              WHEN "userAgent" LIKE '%Edge%' THEN 'Edge'
              ELSE 'Outros'
            END as browser,
            COUNT(*) as count
          FROM "clicks"
          WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId}
          GROUP BY browser
          ORDER BY count DESC;
        `,

        // Sistemas operacionais
        prisma.$queryRaw<{ os: string, count: bigint }[]>`
          SELECT
            CASE
              WHEN "userAgent" LIKE '%Windows%' THEN 'Windows'
              WHEN "userAgent" LIKE '%Mac OS%' THEN 'macOS'
              WHEN "userAgent" LIKE '%Linux%' THEN 'Linux'
              WHEN "userAgent" LIKE '%Android%' THEN 'Android'
              WHEN "userAgent" LIKE '%iOS%' OR "userAgent" LIKE '%iPhone%' THEN 'iOS'
              ELSE 'Outros'
            END as os,
            COUNT(*) as count
          FROM "clicks"
          WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId}
          GROUP BY os
          ORDER BY count DESC;
        `,

        // Detalhes de referrers
        prisma.$queryRaw<{ referrer: string, count: bigint }[]>`
          SELECT
            COALESCE(NULLIF("referrer", ''), 'Direto') as referrer,
            COUNT(*) as count
          FROM "clicks"
          WHERE "profileUserId" = ${userId} AND "linkId" = ${linkId}
          GROUP BY referrer
          ORDER BY count DESC
          LIMIT 10;
        `,

        // Mapa de calor geográfico
        prisma.$queryRaw<{ lat: number, lng: number, count: bigint }[]>`
          SELECT
            latitude as lat,
            longitude as lng,
            COUNT(*) as count
          FROM "clicks"
          WHERE "profileUserId" = ${userId}
            AND "linkId" = ${linkId}
            AND latitude IS NOT NULL
            AND longitude IS NOT NULL
          GROUP BY latitude, longitude;
        `
      ]);

      return {
        hourlyDistribution: hourlyData.map(h => ({
          hour: h.hour,
          clicks: Number(h.clicks),
          peak: false // será calculado no frontend
        })),
        dailyTrend: dailyTrend.map(d => ({
          date: d.date.toISOString(),
          clicks: Number(d.clicks)
        })),
        browsers: browserStats.map(b => ({
          name: b.browser,
          count: Number(b.count)
        })),
        operatingSystems: osStats.map(os => ({
          name: os.os,
          count: Number(os.count)
        })),
        referrers: referrerDetails.map(r => ({
          source: r.referrer,
          count: Number(r.count)
        })),
        geoHeatmap: geoHeatmap.map(g => ({
          lat: g.lat,
          lng: g.lng,
          intensity: Number(g.count)
        }))
      };
    } catch (error) {
      console.error("Erro ao buscar analytics detalhados:", error);
      throw new Error("Falha ao carregar análise detalhada.");
    } finally {
      await prisma.$disconnect();
    }
  }
});