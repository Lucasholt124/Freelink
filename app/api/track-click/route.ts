import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { geolocation } from '@vercel/functions';
import { api } from '@/convex/_generated/api';
import { getClient } from '@/convex/client';
import { ClientTrackingData } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const data: ClientTrackingData = await request.json();
    const geo = geolocation(request);
    const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

    let country = geo?.country || "";
    let region = geo?.region || "";
    let city = geo?.city || "";

    const isGenericVercelGeo = !country || region === 'dev1' || (country === 'US' && (city === 'Washington' || city === 'Ashburn'));
    if (isGenericVercelGeo && ip && ip !== '::1' && !ip.startsWith('192.168')) {
      try {
        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
        if (geoRes.ok) {
            const geoJson = await geoRes.json();
            country = geoJson.country_code || country;
            region = geoJson.region_code || region;
            city = geoJson.city || city;
        }
      } catch (e) { console.error("Falha no fallback de geolocalização:", e) }
    }

    const convex = getClient();
    const profileUserId = await convex.query(api.lib.usernames.getUserIdBySlug, {
      slug: data.profileUsername,
    });
    if (!profileUserId) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

    // CORREÇÃO: Usando aspas duplas nos nomes das colunas para bater com a nova tabela
    await sql`
      INSERT INTO clicks
        ("profileUserId", "linkId", "visitorId", country, region, city, referrer, "userAgent")
      VALUES
        (${profileUserId}, ${data.linkId}, ${data.visitorId}, ${country}, ${region}, ${city}, ${data.referrer}, ${request.headers.get("user-agent") || "unknown"});
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Erro ao rastrear clique:", error);
    return NextResponse.json({ error: "Falha ao rastrear o clique" }, { status: 500 });
  }
}