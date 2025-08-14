// Em /app/api/shortener/[linkId]/route.ts
// (CRIE ESTE NOVO ARQUIVO)

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: Request, // req é necessário mas não usado
  { params }: { params: { linkId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse(JSON.stringify({ error: "Não autenticado" }), { status: 401 });
    }

    const { linkId } = params;

    if (!linkId) {
      return new NextResponse(JSON.stringify({ error: "ID do link é obrigatório" }), { status: 400 });
    }

    // Busca o link e VERIFICA se ele pertence ao usuário logado
    const link = await prisma.link.findFirst({
      where: {
        id: linkId,
        userId: userId, // <<< A VERIFICAÇÃO DE SEGURANÇA CRUCIAL
      },
    });

    if (!link) {
      // Se não encontrar, ou o link não existe ou não pertence ao usuário.
      // Em ambos os casos, negamos o acesso.
      return new NextResponse(JSON.stringify({ error: "Link não encontrado ou acesso negado" }), { status: 404 });
    }

    // Se o link foi encontrado, busca os cliques associados
    const clicks = await prisma.click.findMany({
      where: { linkId: linkId },
      orderBy: { timestamp: 'desc' },
    });

    // Formata os dados no formato que o seu frontend espera
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
    // A desconexão do Prisma é tratada automaticamente em ambientes serverless como Vercel,
    // mas mantê-la aqui é uma boa prática se você rodar em outros lugares.
    await prisma.$disconnect();
  }
}