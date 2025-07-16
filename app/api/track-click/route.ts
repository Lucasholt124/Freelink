import { NextRequest, NextResponse } from "next/server";
import { geolocation } from "@vercel/functions";
import { api } from "@/convex/_generated/api";
import { ClientTrackingData, ServerTrackingEvent } from "@/lib/types";
import { getClient } from "@/convex/client";


export async function POST(request: NextRequest) {
  try {
    const data: ClientTrackingData = await request.json();

    const geo = geolocation(request);

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
        ...geo,
      },
      userAgent:
        data.userAgent || request.headers.get("user-agent") || "unknown",
    };

   // Enviar para a API de eventos do Tinybird
    console.log("Enviando evento para o Tinybird:", trackingEvent);

    if (process.env.TINYBIRD_TOKEN && process.env.TINYBIRD_HOST) {
      try {
        // Envia a localização como objeto aninhado para corresponder aos caminhos do esquema json
        const eventForTinybird = {
          timestamp: trackingEvent.timestamp,
          profileUsername: trackingEvent.profileUsername,
          profileUserId: trackingEvent.profileUserId,
          linkId: trackingEvent.linkId,
          linkTitle: trackingEvent.linkTitle,
          linkUrl: trackingEvent.linkUrl,
          userAgent: trackingEvent.userAgent,
          referrer: trackingEvent.referrer,
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
          // Não falhe na solicitação se o Tinybird estiver inativo - apenas registre o erro
        } else {
          const responseBody = await tinybirdResponse.json();
          console.log("Enviado com sucesso para Tinybird:", responseBody);

          if (responseBody.quarantined_rows > 0) {
            console.warn("Algumas linhas foram colocadas em quarentena:", responseBody);
          }
        }
      } catch (tinybirdError) {
        console.error("Falha na solicitação do Tinybird:", tinybirdError);
        // Não falhe na solicitação se o Tinybird estiver inativo
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