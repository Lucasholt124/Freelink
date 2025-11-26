import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// ✅ CORREÇÃO: Usar { params } é a forma segura do Next.js pegar o ID
export async function GET(req: Request, { params }: { params: { linkId: string } }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Não autenticado", { status: 401 });
    }

    const linkId = params.linkId;

    if (!linkId) {
      return new NextResponse("ID do link é obrigatório", { status: 400 });
    }

    // Busca o Link
    const link = await prisma.link.findFirst({
      where: { id: linkId, userId: userId },
    });

    if (!link) {
      return new NextResponse("Link não encontrado", { status: 404 });
    }

    // Busca os Cliques
    const clicks = await prisma.click.findMany({
      where: { linkId: linkId },
      orderBy: { timestamp: 'desc' },
      // ✅ Trazemos tudo, mas tratamos nulos no retorno
      select: {
        id: true,
        timestamp: true,
        visitorId: true,
        userAgent: true,
        referrer: true,
        country: true,
        city: true,
        region: true,
      }
    });

    // ✅ Formatação Segura
    const formattedData = {
      link: {
        id: link.id,
        url: link.url,
        createdAt: link.createdAt.getTime(),
      },
      clicks: clicks.map(click => ({
        id: click.id,
        timestamp: click.timestamp.getTime(),
        visitorId: click.visitorId,
        userAgent: click.userAgent || 'Desconhecido',
        referrer: click.referrer || 'Direto',
        // Garante que não quebre se o campo for null no banco
        country: click.country || 'Desconhecido',
        city: click.city || 'Desconhecido',
        region: click.region || 'Desconhecido'
      })),
    };

    return NextResponse.json(formattedData);

  } catch (error) {
    console.error(`[GET_LINK_ERROR]`, error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { linkId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const linkId = params.linkId;
    if (!linkId) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    const link = await prisma.link.findFirst({
      where: { id: linkId, userId: userId },
    });

    if (!link) return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });

    // Transaction para garantir limpeza total
    await prisma.$transaction([
      prisma.click.deleteMany({ where: { linkId: linkId } }),
      prisma.link.delete({ where: { id: linkId } })
    ]);

    return NextResponse.json({ success: true, message: "Link excluído" });

  } catch (error) {
    console.error(`[DELETE_LINK_ERROR]`, error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}