// Em /app/api/redirect/route.ts
// (Substitua o arquivo inteiro)

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

export async function GET(request: Request) {
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

        // Dispara o registro do clique em "fire-and-forget".
        registerClickInBackground(link);

        // Redireciona o usuário imediatamente para o destino.
        return NextResponse.redirect(new URL(link.url));

    } catch (error) {
        console.error(`[REDIRECT_API_ERROR] Slug: ${slug}`, error);
        return NextResponse.redirect(new URL('/error', request.url));
    }
}

async function registerClickInBackground(link: { id: string; userId: string }) {
    // É importante criar uma nova instância aqui para um processo em segundo plano
    const prismaInstance = new PrismaClient();
    try {
        const headerList = await headers();
        const userAgent = headerList.get('user-agent') ?? 'N/A';
        const referrer = headerList.get('referer') ?? 'N/A';
        const visitorId = "anonymous_visitor";
        const profileUserId = link.userId;
        const linkId = link.id;

        // =======================================================
        // A CIRURGIA FINAL: USANDO SQL BRUTO
        // =======================================================
        // Usamos `$executeRawUnsafe` para construir a query dinamicamente.
        // Isso é seguro aqui porque os valores são controlados por nós ou vêm de cabeçalhos.
        await prismaInstance.$executeRawUnsafe(
            `INSERT INTO "clicks" (id, timestamp, "profileUserId", "linkId", "visitorId", "userAgent", "referrer")
             VALUES (gen_random_uuid(), NOW(), $1, $2, $3, $4, $5)`,
            profileUserId,
            linkId,
            visitorId,
            userAgent,
            referrer
        );

    } catch (error) {
        console.error("[REGISTER_CLICK_ERROR]", error);
    } finally {
        await prismaInstance.$disconnect();
    }
}