// Em /convex/analytics.ts
// (Substitua o arquivo inteiro)

import { action } from "./_generated/server";
import {  PrismaClient } from '@prisma/client';

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
      // =======================================================
      // CORREÇÃO FINAL: Usando SQL Bruto para a query complexa
      // =======================================================

      // Queries simples que o Prisma faz bem
      const totalClicksPromise = prisma.click.count({ where: { profileUserId: userId } });
      const uniqueVisitorsPromise = prisma.click.findMany({
        where: { profileUserId: userId },
        distinct: ['visitorId']
      });

      // A query complexa, agora em SQL puro para evitar erros de tipo
      const topCountryPromise: Promise<{ country: string, clicks: bigint }[]> = prisma.$queryRaw`
        SELECT "country", COUNT(*) as clicks
        FROM "clicks"
        WHERE "profileUserId" = ${userId} AND "country" IS NOT NULL
        GROUP BY "country"
        ORDER BY clicks DESC
        LIMIT 1;
      `;

      const [totalClicks, uniqueVisitorsResult, topCountryResult] = await Promise.all([
        totalClicksPromise,
        uniqueVisitorsPromise,
        topCountryPromise,
      ]);

      const uniqueVisitors = uniqueVisitorsResult.length;

      const topCountry = topCountryResult && topCountryResult.length > 0
        ? { name: topCountryResult[0].country, clicks: Number(topCountryResult[0].clicks) } // Convertemos BigInt para Number
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