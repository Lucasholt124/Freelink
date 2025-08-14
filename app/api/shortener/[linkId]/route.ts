// Em /app/api/shortener/[linkId]/route.ts
// (Substitua o arquivo inteiro por esta versão final com o workaround do bug do Next.js 15)

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// A assinatura da função foi simplificada para contornar o bug de tipo.
// Extraímos o linkId diretamente da URL da requisição, ignorando o segundo argumento problemático.
export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Não autenticado", { status: 401 });
    }

    // <<< WORKAROUND DEFINITIVO: Extração manual do ID da URL >>>
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const linkId = pathSegments.pop() || ''; // Pega o último segmento da URL, que é o [linkId]

    if (!linkId) {
      return new NextResponse("ID do link é obrigatório", { status: 400 });
    }

    // O resto do código permanece o mesmo, usando o linkId que extraímos manualmente.
    const link = await prisma.link.findFirst({
      where: {
        id: linkId,
        userId: userId,
      },
    });

    if (!link) {
      return new NextResponse("Link não encontrado ou acesso negado", { status: 404 });
    }

    const clicks = await prisma.click.findMany({
      where: { linkId: linkId },
      orderBy: { timestamp: 'desc' },
    });

    const formattedData = {
      link: {
        id: link.id,
        url: link.url,
      },
      clicks: clicks.map(click => ({
        id: click.id,
        timestamp: click.timestamp.getTime(),
        country: click.country,
        visitorId: click.visitorId,
      })),
    };

    return NextResponse.json(formattedData);

  } catch (error) {
    console.error(`[SHORTENER_LINKID_GET_ERROR]`, error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}