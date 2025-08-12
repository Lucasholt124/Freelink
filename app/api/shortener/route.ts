// Em /app/api/shortener/route.ts
// (Crie esta pasta e arquivo)

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

// É seguro inicializar o Prisma aqui, pois as rotas de API são ambientes de servidor.
const prisma = new PrismaClient();

// --- Rota para buscar os links do usuário (método GET) ---
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

        // Garantimos que os dados enviados são seguros para JSON
        const formattedLinks = links.map(link => ({
            id: link.id,
            url: link.url,
            title: link.title,
            clicks: link._count.clicks,
            createdAt: link.createdAt.getTime(), // Enviamos como timestamp
        }));

        return NextResponse.json(formattedLinks);
    } catch (error) {
        console.error("[SHORTENER_GET_ERROR]", error);
        return new NextResponse(JSON.stringify({ error: "Erro interno do servidor ao buscar links" }), { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

// --- Rota para criar um novo link (método POST) ---
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
                return new NextResponse(JSON.stringify({ error: "Este apelido personalizado já está em uso." }), { status: 409 }); // 409 Conflict
            }
        }

        const newLink = await prisma.link.create({
            data: {
                id: customSlug || undefined, // Deixa o Prisma/CUID gerar se for undefined
                url: originalUrl,
                userId: userId,
                title: "Link Encurtado",
            },
        });

        return NextResponse.json(newLink);

    } catch (error) {
        console.error("[SHORTENER_POST_ERROR]", error);
        return new NextResponse(JSON.stringify({ error: "Erro interno do servidor ao criar link" }), { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}