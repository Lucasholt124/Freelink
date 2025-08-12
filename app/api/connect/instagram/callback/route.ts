import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/utils";
import { fetchAction } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const baseUrl = getBaseUrl();
  const errorRedirectUrl = new URL("/dashboard/settings?status=error", baseUrl);

  if (!code) {
    return NextResponse.redirect(errorRedirectUrl);
  }

  try {
    await fetchAction(api.connections.exchangeCodeForToken, {
      code,
      redirectUri: process.env.INSTAGRAM_REDIRECT_URI!,
    });
    return NextResponse.redirect(new URL("/dashboard/settings?status=connected", baseUrl));
  } catch (error) {
    console.error("Erro ao chamar a action do Convex:", error);
    return NextResponse.redirect(errorRedirectUrl);
  }
}
