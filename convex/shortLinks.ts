// convex/shortLinks.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

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
      let slug = args.customSlug;

      // Se tem slug personalizado, verificar se está disponível
      if (slug) {
        const existing = await prisma.link.findUnique({ where: { id: slug } });
        if (existing) throw new Error("Este apelido personalizado já está em uso.");
      } else {
        // Gerar slug aleatório se não foi fornecido
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
          slug = nanoid(7); // Gera um ID de 7 caracteres
          const existing = await prisma.link.findUnique({ where: { id: slug } });

          if (!existing) {
            break;
          }

          attempts++;
        }

        if (!slug || attempts === maxAttempts) {
          throw new Error("Não foi possível gerar um link único.");
        }
      }

      const newLink = await prisma.link.create({
        data: {
          id: slug, // Agora slug nunca será undefined
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

      return links.map((link) => ({
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

      const serializableClicks = clicks.map((click) => ({
        id: click.id,
        timestamp: click.timestamp.getTime(),
        country: click.country,
        visitorId: click.visitorId,
        device: click.device,
        browser: click.browser,
        os: click.os,
        referrer: click.referrer,
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