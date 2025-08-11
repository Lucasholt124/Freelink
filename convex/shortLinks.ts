// Em convex/shortLinks.ts
// (Substitua o arquivo inteiro por esta versão)

import { action, query } from "./_generated/server";
import { v } from "convex/values";
import { Prisma, PrismaClient } from '@prisma/client';


// Prisma Client
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
        // CORREÇÃO: Removido o console.error para não poluir os logs, o throw já é suficiente.
        throw new Error(error instanceof Error ? error.message : "Falha ao criar link.");
    } finally {
        await prisma.$disconnect();
    }
  },
});

// --- ACTION para registrar clique ---
export const getAndRegisterClick = action({
  args: {
    slug: v.string(),
    visitorId: v.string(),
    userAgent: v.optional(v.string()),
    referrer: v.optional(v.string()),
  },
  handler: async (_, args) => {
    try {
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const link = await tx.link.findUnique({ where: { id: args.slug } });
        if (!link) return null;

        await tx.click.create({ data: {
          linkId: link.id,
          visitorId: args.visitorId,
          profileUserId: link.userId,
          userAgent: args.userAgent,
          referrer: args.referrer,
        }});
        return link.url;
      });
      return result;
    } catch (error) {
        // CORREÇÃO: Apenas console.error, sem o throw, para não quebrar o redirecionamento
        console.error("Erro na action getAndRegisterClick:", error);
        return null;
    } finally {
        await prisma.$disconnect();
    }
  },
});

// --- QUERY para buscar os links do usuário ---
export const getLinksForUser = query({
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
  _count: { clicks: number };
}) => ({
        id: link.id,
        url: link.url,
        title: link.title,
        clicks: link._count.clicks
      }));
    } catch (error) {
        console.error("Erro ao buscar links para o usuário:", error);
        return [];
    } finally {
        await prisma.$disconnect();
    }
  },
});

// --- QUERY para buscar os detalhes dos cliques de um link ---
export const getClicksForLink = query({
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

            // Retornamos os dados brutos. O frontend vai tipá-los.
            return { link, clicks };
        } catch (error) {
            console.error("Erro ao buscar cliques do link:", error);
            return null;
        } finally {
            await prisma.$disconnect();
        }
    },
});