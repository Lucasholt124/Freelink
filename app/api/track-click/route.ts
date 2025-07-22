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
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      (request as unknown as { ip?: string }).ip || // Corrigido para evitar 'any'
      "";

    // Use o país do geo, ou busque via ipapi.co se não vier
    let country = geo?.country || "";
    let region = geo?.region || "";
    let city = geo?.city || "";
    let latitude = geo?.latitude || "";
    let longitude = geo?.longitude || "";

    if (!country && ip) {
      try {
        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
        const geoJson: Record<string, string> = await geoRes.json();
        country = geoJson.country || "";
        region = geoJson.region || "";
        city = geoJson.city || "";
        latitude = geoJson.latitude || "";
        longitude = geoJson.longitude || "";
      } catch {
        country = "";
      }
    }

    const convex = getClient();

    // obter id do usuário a partir do nome de usuário
    const userId = await convex.query(api.lib.usernames.getUserIdBySlug, {
      slug: data.profileUsername,
    });

    if (!userId) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

    // Adicionar dados do lado do servidor
    const trackingEvent: ServerTrackingEvent = {
      ...data,
      timestamp: new Date().toISOString(),
      profileUserId: userId,
      location: {
        country,
        region,
        city,
        latitude,
        longitude,
      },
      userAgent:
        data.userAgent || request.headers.get("user-agent") || "unknown",
    };

    // Enviar para a API de eventos do Tinybird
    console.log("Enviando evento para o Tinybird:", trackingEvent);

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

        console.log(
          "Enviando evento para o Tinybird:",
          JSON.stringify(eventForTinybird, null, 2),
        );

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
          const errorText = await tinybirdResponse.text();
          console.error("Falha ao enviar para o Tinybird:", errorText);
        } else {
          const responseBody = await tinybirdResponse.json();
          console.log("Enviado com sucesso para Tinybird:", responseBody);

          if (responseBody.quarantined_rows > 0) {
            console.warn("Algumas linhas foram colocadas em quarentena:", responseBody);
          }
        }
      } catch (tinybirdError) {
        console.error("Falha na solicitação do Tinybird:", tinybirdError);
      }
    } else {
      console.log("Tinybird não configurado - somente eventos registrados");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao rastrear clique:", error);
    return NextResponse.json(
      { error: "Falha ao rastrear o clique" },
      { status: 500 },
    );
  }
}