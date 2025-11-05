// Em /app/api/shortener/route.ts
// (Substitua o arquivo inteiro)

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Link as PrismaLink } from '@prisma/client';
import prisma from '@/lib/prisma'; // <<< A MUDANÇA CRUCIAL ESTÁ AQUI

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse(JSON.stringify({ error: "Não autenticado" }), { status: 401 });
        }

        const links = await prisma.link.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { clicks: true } } }
        });

        type LinkWithCount = PrismaLink & {
            _count: { clicks: number };
        };

        const formattedLinks = (links as LinkWithCount[]).map((link) => ({
            id: link.id,
            url: link.url,
            title: link.title,
            clicks: link._count.clicks,
            createdAt: link.createdAt.getTime(),
        }));

        return NextResponse.json(formattedLinks);
    } catch (error) {
        console.error("[SHORTENER_GET_ERROR]", error);
        return new NextResponse(JSON.stringify({ error: "Erro interno do servidor ao buscar links" }), { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse(JSON.stringify({ error: "Não autenticado" }), { status: 401 });
        }

        const { originalUrl, customSlug } = await req.json();

        if (!originalUrl) {
             return new NextResponse(JSON.stringify({ error: "URL de destino é obrigatória." }), { status: 400 });
        }

        if (customSlug) {
            const existing = await prisma.link.findUnique({ where: { id: customSlug } });
            if (existing) {
                return new NextResponse(JSON.stringify({ error: "Este apelido personalizado já está em uso." }), { status: 409 });
            }
        }

        const newLink = await prisma.link.create({
            data: {
                id: customSlug || undefined,
                url: originalUrl,
                userId: userId,
                title: "Link Encurtado",
            },
        });

        return NextResponse.json(newLink);

    } catch (error) {
        console.error("[SHORTENER_POST_ERROR]", error);
        return new NextResponse(JSON.stringify({ error: "Erro interno do servidor ao criar link" }), { status: 500 });
    }
}