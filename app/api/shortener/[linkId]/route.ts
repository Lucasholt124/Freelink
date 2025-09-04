// app/api/shortener/[linkId]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Não autenticado", { status: 401 });
    }

    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const linkId = pathSegments.pop() || '';

    if (!linkId) {
      return new NextResponse("ID do link é obrigatório", { status: 400 });
    }

    const shortLink = await prisma.shortLink.findFirst({
    where: {
      id: linkId,
      userId: userId,
    },
  });

    if (!shortLink) {
    return new NextResponse("Link não encontrado", { status: 404 });
  }

    const clicks = await prisma.shortClick.findMany({
    where: { shortLinkId: linkId },
    orderBy: { timestamp: 'desc' },
  });
    const formattedData = {
      link: {
        id: link.id,
        url: link.url,
        createdAt: link.createdAt.getTime(),
      },
      clicks: clicks.map(click => ({
        id: click.id,
        timestamp: click.timestamp.getTime(),
        country: click.country,
        city: click.city,
        region: click.region,
        visitorId: click.visitorId,
        device: click.device,
        browser: click.browser,
        os: click.os,
        referrer: click.referrer,
      })),
    };

    return NextResponse.json(formattedData);

  } catch (error) {
    console.error(`[SHORTENER_LINKID_GET_ERROR]`, error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const linkId = pathSegments.pop() || '';

    if (!linkId) {
      return NextResponse.json({ error: "ID do link é obrigatório" }, { status: 400 });
    }

    // Verificar se o link pertence ao usuário
    const link = await prisma.link.findFirst({
      where: {
        id: linkId,
        userId: userId,
      },
    });

    if (!link) {
      return NextResponse.json(
        { error: "Link não encontrado ou acesso negado" },
        { status: 404 }
      );
    }

    // Excluir todos os cliques relacionados primeiro
    await prisma.click.deleteMany({
      where: { linkId: linkId }
    });

    // Excluir o link
    await prisma.link.delete({
      where: { id: linkId }
    });

    return NextResponse.json({
      success: true,
      message: "Link excluído com sucesso"
    });

  } catch (error) {
    console.error(`[SHORTENER_LINKID_DELETE_ERROR]`, error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}