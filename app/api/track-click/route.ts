import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

import { ClientTrackingData } from '@/lib/types';

export async function POST(request: NextRequest) {
  const data: ClientTrackingData = await request.json();

  const country = request.headers.get('x-vercel-ip-country') || 'Unknown';
  const region = request.headers.get('x-vercel-ip-country-region') || 'Unknown';
  const city = request.headers.get('x-vercel-ip-city') || 'Unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Responde imediatamente — zero espera pro usuário
  const response = NextResponse.json({ success: true });

  // Grava em background sem consultar o Convex
  (async () => {
    try {
      await sql`
        INSERT INTO clicks
          (slug, "linkId", "visitorId", country, region, city, referrer, "userAgent")
        VALUES
          (${data.profileUsername}, ${data.linkId}, ${data.visitorId}, ${country}, ${region}, ${city}, ${data.referrer}, ${userAgent});
      `;
    } catch (error) {
      console.error("Erro ao rastrear clique:", error);
    }
  })();

  return response;
}