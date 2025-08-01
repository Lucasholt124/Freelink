import { NextRequest, NextResponse } from "next/server";
import { geolocation } from "@vercel/functions";
import { api } from "@/convex/_generated/api";
import { ClientTrackingData } from "@/lib/types";
import { getClient } from "@/convex/client";

export async function POST(request: NextRequest) {
  try {
    console.log("================ INÍCIO DO LOG DE RASTREAMENTO ================");
    const data: ClientTrackingData = await request.json();

    // --- ETAPA 1: DIAGNÓSTICO DE GEOLOCALIZAÇÃO ---
    const geo = geolocation(request);
    const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

    console.log("--- DADOS DE GEOLOCALIZAÇÃO BRUTOS ---");
    console.log("IP Detectado:", ip);
    console.log("Geo da Vercel:", geo);

    let country = geo?.country || "";
    let region = geo?.region || "";
    let city = geo?.city || "";
    let latitude = geo?.latitude?.toString() || "";
    let longitude = geo?.longitude?.toString() || "";

    // --- ETAPA 2: LÓGICA DE FALLBACK ---
    const isGenericVercelGeo = !country || region === 'dev1' || (country === 'US' && (city === 'Washington' || city === 'Ashburn'));
    if (isGenericVercelGeo && ip && ip !== '::1' && !ip.startsWith('192.168')) {
      console.log("Geolocalização da Vercel é genérica. TENTANDO FALLBACK com ipapi.co...");
      try {
        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
        if (geoRes.ok) {
            const geoJson = await geoRes.json();
            console.log("Resposta do ipapi.co:", geoJson);
            country = geoJson.country_code || country;
            region = geoJson.region_code || region;
            city = geoJson.city || city;
            // CORREÇÃO: Atribuindo os novos valores de lat/lon
            latitude = geoJson.latitude?.toString() || latitude;
            longitude = geoJson.longitude?.toString() || longitude;
        } else {
            console.error("ipapi.co respondeu com erro:", geoRes.status, await geoRes.text());
        }
      } catch (e) { console.error("Falha CRÍTICA no fallback de geolocalização:", e) }
    } else {
      console.log("Geolocalização da Vercel parece OK ou IP é local. Não usando fallback.");
    }

    // --- ETAPA 3: DADOS FINAIS ANTES DE ENVIAR ---
    const convex = getClient();
    const userId = await convex.query(api.lib.usernames.getUserIdBySlug, { slug: data.profileUsername });
    if (!userId) {
        console.error("ERRO: Perfil não encontrado para o slug:", data.profileUsername);
        return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

    const eventForTinybird = {
      timestamp: new Date().toISOString(),
      profileUsername: data.profileUsername,
      profileUserId: userId,
      linkId: data.linkId,
      linkTitle: data.linkTitle,
      linkUrl: data.linkUrl,
      userAgent: request.headers.get("user-agent") || "unknown",
      referrer: data.referrer,
      visitorId: data.visitorId,
      location: {
        country: country || "",
        region: region || "",
        city: city || "",
        latitude: latitude || "",
        longitude: longitude || "",
      },
    };

    console.log("--- OBJETO FINAL A SER ENVIADO PARA O TINYBIRD ---");
    console.log(JSON.stringify(eventForTinybird, null, 2));

    if (process.env.TINYBIRD_TOKEN && process.env.TINYBIRD_HOST) {
      const tinybirdResponse = await fetch(`${process.env.TINYBIRD_HOST}/v0/events?name=link_clicks`, {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.TINYBIRD_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify(eventForTinybird),
      });

      const responseBody = await tinybirdResponse.json();
      if (!tinybirdResponse.ok) {
        console.error("ERRO CRÍTICO: Falha ao enviar para o Tinybird. Resposta:", responseBody);
      } else {
        console.log("Sucesso! Resposta do Tinybird:", responseBody);
      }
    }

    console.log("================ FIM DO LOG DE RASTREAMENTO ================");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ERRO INESPERADO NA API:", error);
    return NextResponse.json({ error: "Falha ao rastrear o clique" }, { status: 500 });
  }
}