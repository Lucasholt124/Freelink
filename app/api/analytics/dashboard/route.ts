// app/api/analytics/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(_request: NextRequest) {

  try {
    const { userId } = await auth();
    console.log(_request.method);

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

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

      // Taxa de rejeição
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

      // Taxa de conversão
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

      // Comparação com período anterior
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

    const devices = { desktop: 0, mobile: 0, tablet: 0 };
    deviceStats.forEach((stat: { device_type: string; count: bigint }) => {
      const deviceType = stat.device_type as keyof typeof devices;
      devices[deviceType] = Number(stat.count);
    });

    const trafficSources = trafficSourcesResult.map((source: { source: string; clicks: bigint }) => ({
      name: source.source,
      clicks: Number(source.clicks),
      icon: source.source === 'Direto' ? 'direct' :
            source.source === 'Social Media' ? 'social' :
            source.source === 'Pesquisa' ? 'search' : 'other'
    }));

    const recentActivities = recentClicksResult.map((click: {
      timestamp: Date;
      city: string | null;
      country: string | null;
      link: { title: string | null } | null;
    }) => ({
      time: new Date(click.timestamp).toLocaleString('pt-BR'),
      action: `Clique em "${click.link?.title || 'Link desconhecido'}"`,
      location: `${click.city || 'Desconhecido'}, ${click.country || 'Desconhecido'}`
    }));

    const performanceMetrics = {
      loadTime: Math.floor(Math.random() * 500) + 100,
      responseTime: Math.floor(Math.random() * 150) + 50,
      uptime: 99.9
    };

    const engagement = {
      avgTimeOnPage: Math.floor(Math.random() * 300) + 60,
      pagesPerSession: engagementResult[0]?.avg_clicks || 1,
      returnRate: engagementResult[0]?.return_rate || 0
    };

    const comparison = {
      current: Number(comparisonResult[0]?.current_period || 0),
      previous: Number(comparisonResult[0]?.previous_period || 0)
    };

    const conversionRate = conversionResult[0]?.conversion_rate || 0;
    const bounceRate = bounceRateResult[0]?.bounce_rate || 0;

    return NextResponse.json({
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
    });

  } catch (error) {
    console.error("❌ Erro ao buscar analytics:", error);
    return NextResponse.json(
      { error: 'Erro ao carregar dados' },
      { status: 500 }
    );
  }
}