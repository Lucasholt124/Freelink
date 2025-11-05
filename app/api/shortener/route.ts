import {  NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@vercel/postgres';
import { nanoid } from 'nanoid';

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse(JSON.stringify({ error: "Não autenticado" }), { status: 401 });
        }

        const result = await sql`
            SELECT
                sl.slug as id,
                sl."originalUrl" as url,
                sl.slug as title,
                sl.clicks,
                sl."createdAt"
            FROM "shortLinks" sl
            WHERE sl."userId" = ${userId}
            ORDER BY sl."createdAt" DESC
        `;

        const formattedLinks = result.rows.map((link) => ({
            id: link.id,
            url: link.url,
            title: link.title,
            clicks: parseInt(link.clicks) || 0,
            createdAt: new Date(link.createdAt || link.createdat).getTime(),
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

        // Gerar slug ou usar o personalizado
        const slug = customSlug || nanoid(8);

        // Verificar se slug já existe
        if (customSlug) {
            const existing = await sql`
                SELECT slug FROM "shortLinks"
                WHERE slug = ${customSlug}
                LIMIT 1
            `;

            if (existing.rows.length > 0) {
                return new NextResponse(JSON.stringify({ error: "Este apelido personalizado já está em uso." }), { status: 409 });
            }
        }

        // Criar novo link
        const result = await sql`
            INSERT INTO "shortLinks" ("userId", slug, "originalUrl", clicks)
            VALUES (${userId}, ${slug}, ${originalUrl}, 0)
            RETURNING slug as id, "originalUrl" as url, slug as title, clicks, "createdAt"
        `;

        const newLink = result.rows[0];

        return NextResponse.json({
            id: newLink.id,
            url: newLink.url,
            title: newLink.title,
            clicks: 0,
            createdAt: new Date(newLink.createdAt || newLink.createdat).getTime()
        });

    } catch (error) {
        console.error("[SHORTENER_POST_ERROR]", error);
        return new NextResponse(JSON.stringify({ error: "Erro interno do servidor ao criar link" }), { status: 500 });
    }
}