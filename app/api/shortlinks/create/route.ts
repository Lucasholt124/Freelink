import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { originalUrl, customSlug } = body;

    if (!originalUrl) {
      return NextResponse.json(
        { error: 'URL original é obrigatória' },
        { status: 400 }
      );
    }

    // Verificar se o slug customizado já existe
    if (customSlug) {
      const existing = await prisma.link.findUnique({
        where: { id: customSlug }
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Este apelido personalizado já está em uso.' },
          { status: 409 }
        );
      }
    }

    // Criar o link
    const newLink = await prisma.link.create({
      data: {
        id: customSlug || undefined, // Se não tiver customSlug, Prisma gera automaticamente
        url: originalUrl,
        userId: userId,
        title: "Link Encurtado",
      },
    });

    return NextResponse.json(newLink, { status: 201 });

  } catch (error) {
    console.error("❌ Erro ao criar link:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao criar link' },
      { status: 500 }
    );
  }
}