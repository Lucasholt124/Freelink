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

    const shortLinks = await prisma.shortLink.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { clicks: true }
        }
      }
    });

    const formattedLinks = shortLinks.map(link => ({
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

    let slug = customSlug;

    if (slug) {
      const existing = await prisma.shortLink.findUnique({
        where: { id: slug }
      });

      if (existing) {
        return new NextResponse("Este apelido personalizado já está em uso.", { status: 409 });
      }
    } else {
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        slug = nanoid(7);
        const existing = await prisma.shortLink.findUnique({
          where: { id: slug }
        });

        if (!existing) break;
        attempts++;
      }

      if (!slug || attempts === maxAttempts) {
        return new NextResponse("Não foi possível gerar um link único", { status: 500 });
      }
    }

    const shortLink = await prisma.shortLink.create({
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
      id: shortLink.id,
      url: shortLink.url,
      title: shortLink.title,
      createdAt: shortLink.createdAt.getTime(),
      clicks: shortLink._count.clicks
    });

  } catch (error) {
    console.error('[SHORTENER_POST_ERROR]', error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}