
import { NextRequest, NextResponse } from "next/server";
import { geolocation } from "@vercel/functions";
import { api } from "@/convex/_generated/api";
import { ClientTrackingData, ServerTrackingEvent } from "@/lib/types";
import { getClient } from "@/convex/client";

export async function POST(request: NextRequest) {
  try {
    const data: ClientTrackingData = await request.json();

    // Tente pegar a geolocalização do Vercel
    const geo = geolocation(request);
    // Tente pegar o IP real do visitante
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";

    // ADICIONADO: Log de diagnóstico para ver o que a Vercel está fornecendo
    console.log("[GEOLOCATION DEBUG]", {
      geoFromVercel: geo,
      ipFromHeaders: ip
    });

    let country = geo?.country || "";
    let region = geo?.region || "";
    let city = geo?.city || "";
    let latitude = geo?.latitude || "";
    let longitude = geo?.longitude || "";

    // Fallback para ipapi.co se a geolocalização da Vercel falhar
    if (!country && ip) {
      try {
        console.log(`[GEOLOCATION DEBUG] Vercel geo vazio. Tentando fallback com IP: ${ip}`);
        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
        const geoJson: Record<string, string> = await geoRes.json();
        country = geoJson.country_code || "";
        region = geoJson.region_code || "";
        city = geoJson.city || "";
        latitude = geoJson.latitude || "";
        longitude = geoJson.longitude || "";
      } catch (e) {
        console.error("[GEOLOCATION DEBUG] Falha no fallback para ipapi.co", e);
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
      location: { country, region, city, latitude, longitude },
      userAgent: data.userAgent || request.headers.get("user-agent") || "unknown",
    };

    if (process.env.TINYBIRD_TOKEN && process.env.TINYBIRD_HOST) {
      try {
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
            latitude: trackingEvent.location.latitude || "",
            longitude: trackingEvent.location.longitude || "",
          },
        };

        const tinybirdResponse = await fetch(
          `${process.env.TINYBIRD_HOST}/v0/events?name=link_clicks`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.TINYBIRD_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(eventForTinybird),
          },
        );

        if (!tinybirdResponse.ok) {
          console.error("Falha ao enviar para o Tinybird:", await tinybirdResponse.text());
        } else {
          console.log("Enviado com sucesso para Tinybird:", await tinybirdResponse.json());
        }
      } catch (tinybirdError) {
        console.error("Falha na solicitação do Tinybird:", tinybirdError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao rastrear clique:", error);
    return NextResponse.json({ error: "Falha ao rastrear o clique" }, { status: 500 });
  }
}