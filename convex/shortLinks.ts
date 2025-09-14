// Em convex/shortLinks.ts
// (Substitua o arquivo inteiro)

import { action } from "./_generated/server";
import { v } from "convex/values";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

// --- ACTION para criar link ---
export const createShortLink = action({
  args: {
    originalUrl: v.string(),
    customSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Usuário não autenticado.");

    try {
      if (args.customSlug) {
        const existing = await prisma.link.findUnique({ where: { id: args.customSlug } });
        if (existing) throw new Error("Este apelido personalizado já está em uso.");
      }

      const newLink = await prisma.link.create({
        data: {
          id: args.customSlug,
          url: args.originalUrl,
          userId: identity.subject,
          title: "Link Encurtado",
        },
      });
      return newLink;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : "Falha ao criar link.");
    } finally {
        await prisma.$disconnect();
    }
  },
});

// --- ACTION para buscar os links do usuário ---
export const getLinksForUser = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    try {
      const links = await prisma.link.findMany({
        where: { userId: identity.subject },
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { clicks: true } } }
      });

      return links.map((link: {
        id: string;
        url: string;
        title: string | null;
        createdAt: Date;
        _count: { clicks: number };
      }) => ({
        id: link.id,
        url: link.url,
        title: link.title,
        clicks: link._count.clicks,
        createdAt: link.createdAt.getTime(),
      }));
    } catch (error) {
        console.error("Erro ao buscar links para o usuário:", error);
        return [];
    } finally {
        await prisma.$disconnect();
    }
  },
});

// --- ACTION para buscar os detalhes dos cliques de um link ---
export const getClicksForLink = action({
    args: { shortLinkId: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Não autenticado.");

        try {
            const link = await prisma.link.findFirst({
                where: { id: args.shortLinkId, userId: identity.subject },
            });
            if (!link) throw new Error("Acesso negado ou link não encontrado.");

            const clicks = await prisma.click.findMany({
                where: { linkId: args.shortLinkId },
                orderBy: { timestamp: "desc" },
            });

            // =======================================================
            // CORREÇÃO DEFINITIVA DO TIPO APLICADA AQUI
            // =======================================================
            const serializableClicks = clicks.map((click: {
                id: number; // <-- O ID agora é um NÚMERO
                timestamp: Date;
                country: string | null;
                // Adicione outros campos se precisar deles no frontend
            }) => ({
                id: click.id,
                timestamp: click.timestamp.getTime(),
                country: click.country,
            }));

            return { link, clicks: serializableClicks };
        } catch(error) {
            console.error("Erro ao buscar cliques do link:", error);
            return null;
        } finally {
            await prisma.$disconnect();
        }
    },
});