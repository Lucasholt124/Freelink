// convex/analytics.ts
import { action } from "./_generated/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

export const getDashboardAnalytics = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { totalClicks: 0, uniqueVisitors: 0, topCountry: { name: "N/A", clicks: 0 } };
    }
    const userId = identity.subject;

    try {
      // Primeiro, buscar todos os links do usuário
      const userLinks = await prisma.link.findMany({
        where: { userId },
        select: { id: true }
      });

      const linkIds = userLinks.map(link => link.id);

      if (linkIds.length === 0) {
        return {
          totalClicks: 0,
          uniqueVisitors: 0,
          topCountry: { name: "N/A", clicks: 0 },
        };
      }

      // Queries usando os linkIds
      const totalClicksPromise = prisma.click.count({
        where: { linkId: { in: linkIds } }
      });

      const uniqueVisitorsPromise = prisma.click.findMany({
        where: { linkId: { in: linkIds } },
        distinct: ['visitorId'],
        select: { visitorId: true }
      });

      // Query para o país mais popular
      const topCountryPromise = prisma.click.groupBy({
        by: ['country'],
        where: {
          linkId: { in: linkIds },
          country: { not: null }
        },
        _count: {
          country: true
        },
        orderBy: {
          _count: {
            country: 'desc'
          }
        },
        take: 1
      });

      const [totalClicks, uniqueVisitorsResult, topCountryResult] = await Promise.all([
        totalClicksPromise,
        uniqueVisitorsPromise,
        topCountryPromise,
      ]);

      const uniqueVisitors = uniqueVisitorsResult.length;

      const topCountry = topCountryResult && topCountryResult.length > 0
        ? {
            name: topCountryResult[0].country || "N/A",
            clicks: topCountryResult[0]._count.country
          }
        : { name: "N/A", clicks: 0 };

      return {
        totalClicks,
        uniqueVisitors,
        topCountry,
      };
    } catch (error) {
      console.error("Erro ao buscar analytics agregados:", error);
      throw new Error("Falha ao carregar dados de análise.");
    } finally {
      await prisma.$disconnect();
    }
  },
});