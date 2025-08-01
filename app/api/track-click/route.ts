import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
// import { geolocation } from '@vercel/functions'; // Não precisamos mais disso
import { api } from '@/convex/_generated/api';
import { getClient } from '@/convex/client';
import { ClientTrackingData } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const data: ClientTrackingData = await request.json();

    // <<< MUDANÇA PRINCIPAL: Usando os headers da Vercel diretamente >>>
    // Esta é a forma mais confiável de obter a localização do usuário na Vercel.
    const country = request.headers.get('x-vercel-ip-country') || 'Unknown';
    const region = request.headers.get('x-vercel-ip-country-region') || 'Unknown'; // Isso retornará "SE"
    const city = request.headers.get('x-vercel-ip-city') || 'Unknown';

    const convex = getClient();
    const profileUserId = await convex.query(api.lib.usernames.getUserIdBySlug, {
      slug: data.profileUsername,
    });
    if (!profileUserId) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

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