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

            // ✅ CORREÇÃO: Removida a tipagem explícita incorreta e os campos inexistentes.
            // O tipo de `click` é inferido corretamente a partir do resultado do Prisma.
            const serializableClicks = clicks.map((click) => ({
                id: click.id,
                timestamp: click.timestamp.getTime(),
                country: click.country,
                visitorId: click.visitorId,
                // Os campos device, browser e os não existem no schema do Prisma.
                // A informação está contida em `userAgent`.
                userAgent: click.userAgent,
                referrer: click.referrer,
            }));

            // ✅ CORREÇÃO: Retornando o link completo com createdAt
            const serializableLink = {
                id: link.id,
                url: link.url,
                title: link.title,
                createdAt: link.createdAt.getTime(), // ← Adicionado
            };

            return {
                link: serializableLink,
                clicks: serializableClicks
            };
        } catch(error) {
            console.error("Erro ao buscar cliques do link:", error);
            throw new Error(error instanceof Error ? error.message : "Erro ao buscar dados do link");
        } finally {
            await prisma.$disconnect();
        }
    },
});

// --- ACTION para deletar um link ---
export const deleteShortLink = action({
  args: { shortLinkId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autenticado.");

    try {
      // Verificar se o link pertence ao usuário
      const link = await prisma.link.findFirst({
        where: {
          id: args.shortLinkId,
          userId: identity.subject
        },
      });

      if (!link) throw new Error("Link não encontrado ou acesso negado.");

      // Deletar todos os cliques primeiro
      await prisma.click.deleteMany({
        where: { linkId: args.shortLinkId }
      });

      // Deletar o link
      await prisma.link.delete({
        where: { id: args.shortLinkId }
      });

      return { success: true, message: "Link deletado com sucesso" };
    } catch(error) {
      console.error("Erro ao deletar link:", error);
      throw new Error(error instanceof Error ? error.message : "Erro ao deletar link");
    } finally {
      await prisma.$disconnect();
    }
  },
});