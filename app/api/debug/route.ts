
import { NextRequest, NextResponse } from "next/server";
import { geolocation } from "@vercel/functions";

export async function GET(request: NextRequest) {
  console.log("================ INÍCIO DO LOG DE DIAGNÓSTICO ================");

  const now = new Date();
  const geo = geolocation(request);
  const ip = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const allHeaders = Object.fromEntries(request.headers.entries());

  const diagnosis = {
    message: "ESTE É UM TESTE DE DIAGNÓSTICO AO VIVO.",
    timestamp_utc: now.toISOString(),
    timestamp_brasilia: now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
    ip_detectado: ip,
    geo_da_vercel: geo,
    todos_os_headers: allHeaders,
  };

  console.log(JSON.stringify(diagnosis, null, 2));
  console.log("================ FIM DO LOG DE DIAGNÓSTICO ================");

  // Retorna os dados para a página de teste
  return NextResponse.json(diagnosis);
}