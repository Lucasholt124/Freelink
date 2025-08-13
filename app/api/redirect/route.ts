// Em /app/api/redirect/route.ts
// (Substitua o arquivo inteiro)

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

// A função GET agora só precisa do 'request'.
export async function GET(request: Request) {
    // =======================================================
    // CORREÇÃO APLICADA AQUI
    // =======================================================
    // Lemos o 'slug' dos parâmetros de busca da URL, não dos `params` da rota.
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
        return new NextResponse("Slug não fornecido.", { status: 400 });
    }

    try {
        const link = await prisma.link.findUnique({ where: { id: slug } });

        if (!link) {
            return NextResponse.redirect(new URL('/404', request.url));
        }

        // Dispara o registro do clique em segundo plano
        registerClickInBackground(link);

        // Redireciona o usuário
        return NextResponse.redirect(new URL(link.url));

    } catch (error) {
        console.error(`[REDIRECT_API_ERROR] Slug: ${slug}`, error);
        return new NextResponse("Erro interno do servidor.", { status: 500 });
    }
}


async function registerClickInBackground(link: { id: string; userId: string }) {
    const prismaInstance = new PrismaClient();
    try {
        const headerList = await headers();
        const userAgent = headerList.get('user-agent');
        const referrer = headerList.get('referer');

        await prismaInstance.click.create({
            data: {
                linkId: link.id,
                visitorId: "anonymous_visitor",
                profileUserId: link.userId,
                userAgent: userAgent,
                referrer: referrer,
            }
        });
    } catch (error) {
        console.error("[REGISTER_CLICK_ERROR]", error);
    } finally {
        await prismaInstance.$disconnect();
    }
}