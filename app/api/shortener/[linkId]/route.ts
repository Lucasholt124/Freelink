// Em /app/api/shortener/[linkId]/route.ts
// (Substitua o arquivo inteiro por esta versão corrigida)

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  context: { params: { linkId: string } } // <<< A CORREÇÃO ESTÁ AQUI
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse(JSON.stringify({ error: "Não autenticado" }), { status: 401 });
    }

    const { linkId } = context.params; // <<< E AQUI

    if (!linkId) {
      return new NextResponse(JSON.stringify({ error: "ID do link é obrigatório" }), { status: 400 });
    }

    const link = await prisma.link.findFirst({
      where: {
        id: linkId,
        userId: userId,
      },
    });

    if (!link) {
      return new NextResponse(JSON.stringify({ error: "Link não encontrado ou acesso negado" }), { status: 404 });
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
    return new NextResponse(JSON.stringify({ error: "Erro interno do servidor" }), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}