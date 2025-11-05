import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@vercel/postgres";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Aguardar a Promise dos params
    const { linkId } = await params;

    // Buscar informações do link
    const linkResult = await sql`
      SELECT * FROM "shortLinks"
      WHERE id = ${linkId} AND "userId" = ${userId}
      LIMIT 1
    `;

    if (linkResult.rows.length === 0) {
      return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });
    }

    const link = linkResult.rows[0];

    // Buscar todos os cliques com dados completos
    const clicksResult = await sql`
      SELECT
        id,
        timestamp,
        country,
        city,
        region,
        "visitorId",
        "userAgent",
        referrer,
        CASE
          WHEN "userAgent" ILIKE '%mobile%' OR "userAgent" ILIKE '%android%' OR "userAgent" ILIKE '%iphone%' THEN 'Mobile'
          WHEN "userAgent" ILIKE '%tablet%' OR "userAgent" ILIKE '%ipad%' THEN 'Tablet'
          ELSE 'Desktop'
        END as device,
        CASE
          WHEN "userAgent" ILIKE '%edg%' THEN 'Edge'
          WHEN "userAgent" ILIKE '%chrome%' AND "userAgent" NOT ILIKE '%edg%' THEN 'Chrome'
          WHEN "userAgent" ILIKE '%safari%' AND "userAgent" NOT ILIKE '%chrome%' THEN 'Safari'
          WHEN "userAgent" ILIKE '%firefox%' THEN 'Firefox'
          WHEN "userAgent" ILIKE '%opera%' OR "userAgent" ILIKE '%opr%' THEN 'Opera'
          ELSE 'Outro'
        END as browser,
        CASE
          WHEN "userAgent" ILIKE '%windows%' THEN 'Windows'
          WHEN "userAgent" ILIKE '%mac%' THEN 'macOS'
          WHEN "userAgent" ILIKE '%android%' THEN 'Android'
          WHEN "userAgent" ILIKE '%iphone%' OR "userAgent" ILIKE '%ipad%' OR "userAgent" ILIKE '%ios%' THEN 'iOS'
          WHEN "userAgent" ILIKE '%linux%' THEN 'Linux'
          ELSE 'Outro'
        END as os
      FROM clicks
      WHERE "linkId" = ${linkId}
      ORDER BY timestamp DESC
    `;

    const clicks = clicksResult.rows.map(row => ({
      id: row.id,
      timestamp: new Date(row.timestamp).getTime(),
      country: row.country || null,
      city: row.city || null,
      region: row.region || null,
      visitorId: row.visitorid,
      device: row.device,
      browser: row.browser,
      os: row.os,
      referrer: row.referrer || null
    }));

    return NextResponse.json({
      link: {
        id: link.slug,
        url: link.originalurl,
        clicks: parseInt(link.clicks),
        title: link.slug,
        createdAt: new Date(link.createdat).getTime()
      },
      clicks
    });

  } catch (error) {
    console.error("Erro ao buscar analytics:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Aguardar a Promise dos params
    const { linkId } = await params;

    // Deletar cliques associados
    await sql`DELETE FROM clicks WHERE "linkId" = ${linkId}`;

    // Deletar o link
    const result = await sql`
      DELETE FROM "shortLinks"
      WHERE slug = ${linkId} AND "userId" = ${userId}
      RETURNING *
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Erro ao deletar link:", error);
    return NextResponse.json(
      { error: "Erro ao deletar link" },
      { status: 500 }
    );
  }
}