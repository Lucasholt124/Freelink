// app/api/shortener/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Não autenticado", { status: 401 });
    }

    const links = await prisma.link.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { clicks: true }
        }
      }
    });

    const formattedLinks = links.map(link => ({
      id: link.id,
      url: link.url,
      title: link.title,
      createdAt: link.createdAt.getTime(),
      clicks: link._count.clicks
    }));

    return NextResponse.json(formattedLinks);
  } catch (error) {
    console.error('[SHORTENER_GET_ERROR]', error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Não autenticado", { status: 401 });
    }

    const { url, customSlug } = await req.json();

    if (!url) {
      return new NextResponse("URL é obrigatória", { status: 400 });
    }

    // Validar URL
    try {
      new URL(url);
    } catch {
      return new NextResponse("URL inválida", { status: 400 });
    }

    let slug = customSlug;

    // Se tem slug personalizado, verificar se está disponível
    if (slug) {
      const existing = await prisma.link.findUnique({
        where: { id: slug }
      });

      if (existing) {
        return new NextResponse("Este apelido personalizado já está em uso.", { status: 409 });
      }
    } else {
      // Gerar slug aleatório se não foi fornecido
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        slug = nanoid(7);
        const existing = await prisma.link.findUnique({
          where: { id: slug }
        });

        if (!existing) {
          break;
        }

        attempts++;
      }

      if (attempts === maxAttempts) {
        return new NextResponse("Não foi possível gerar um link único", { status: 500 });
      }
    }

    // Criar o link
    const link = await prisma.link.create({
      data: {
        id: slug,
        url,
        userId,
        title: new URL(url).hostname || "Link Encurtado",
      },
      include: {
        _count: {
          select: { clicks: true }
        }
      }
    });

    return NextResponse.json({
      id: link.id,
      url: link.url,
      title: link.title,
      createdAt: link.createdAt.getTime(),
      clicks: link._count.clicks
    });

  } catch (error) {
    console.error('[SHORTENER_POST_ERROR]', error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Não autenticado", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const linkId = searchParams.get('id');

    if (!linkId) {
      return new NextResponse("ID do link é obrigatório", { status: 400 });
    }

    // Verificar se o link pertence ao usuário
    const link = await prisma.link.findFirst({
      where: {
        id: linkId,
        userId
      }
    });

    if (!link) {
      return new NextResponse("Link não encontrado", { status: 404 });
    }

    // Deletar o link (os cliques serão deletados em cascata)
    await prisma.link.delete({
      where: { id: linkId }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[SHORTENER_DELETE_ERROR]', error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}