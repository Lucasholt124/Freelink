
import { NextRequest, NextResponse } from "next/server";
import { geolocation } from "@vercel/functions";
import { api } from "@/convex/_generated/api";
import { ClientTrackingData, ServerTrackingEvent } from "@/lib/types";
import { getClient } from "@/convex/client";

export async function POST(request: NextRequest) {
  try {
    const data: ClientTrackingData = await request.json();

    // --- LÓGICA DE GEOLOCALIZAÇÃO APRIMORADA ---
    const geo = geolocation(request);

    // Prioriza 'x-real-ip' e 'x-forwarded-for', que são mais confiáveis na Vercel para pegar o IP do visitante
    const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

    let country = geo?.country || "";
    let region = geo?.region || "";
    let city = geo?.city || "";

    // Só usa o fallback para ipapi.co se tivermos um IP público real e a geo da Vercel falhou
    const isVercelGeoInvalid = !country || region === 'dev1' || country === 'US' && city === 'Washington'; // Padrão da Vercel
    if (isVercelGeoInvalid && ip && ip !== '::1' && !ip.startsWith('192.168') && !ip.startsWith('10.') && !ip.startsWith('127.0')) {
      try {
        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
        if (geoRes.ok) {
            const geoJson = await geoRes.json();
            country = geoJson.country_code || country;
            region = geoJson.region_code || region;
            city = geoJson.city || city;
        }
      } catch (e) {
        console.error("Falha no fallback de geolocalização:", e)
      }
    }

    const convex = getClient();
    const userId = await convex.query(api.lib.usernames.getUserIdBySlug, {
      slug: data.profileUsername,
    });

    if (!userId) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

    const trackingEvent: ServerTrackingEvent = {
      ...data,
      timestamp: new Date().toISOString(),
      profileUserId: userId,
      location: { country, region, city, latitude: geo.latitude || "", longitude: geo.longitude || "" },
      userAgent: data.userAgent || request.headers.get("user-agent") || "unknown",
    };

    if (process.env.TINYBIRD_TOKEN && process.env.TINYBIRD_HOST) {
      const eventForTinybird = {
        timestamp: trackingEvent.timestamp,
        profileUsername: trackingEvent.profileUsername,
        profileUserId: trackingEvent.profileUserId,
        linkId: trackingEvent.linkId,
        linkTitle: trackingEvent.linkTitle,
        linkUrl: trackingEvent.linkUrl,
        userAgent: trackingEvent.userAgent,
        referrer: trackingEvent.referrer,
        visitorId: trackingEvent.visitorId,
        location: {
          country: trackingEvent.location.country || "",
          region: trackingEvent.location.region || "",
          city: trackingEvent.location.city || "",
        },
      };

      await fetch(
        `${process.env.TINYBIRD_HOST}/v0/events?name=link_clicks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.TINYBIRD_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventForTinybird),
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao rastrear clique:", error);
    return NextResponse.json({ error: "Falha ao rastrear o clique" }, { status: 500 });
  }
}