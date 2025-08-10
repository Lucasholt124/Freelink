import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request, { params }: { params: { provider: string } }) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const provider = params.provider;

  if (!code) {
    return NextResponse.redirect(new URL("/dashboard/shortener?error=missing_code", req.url));
  }

  try {
    const session = await auth();
    if (!session.userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // trocar code pelo token de acesso
    const tokenResponse = await fetchAccessToken(provider, code);

    const accessToken = tokenResponse.access_token;
    const tokenExpiresAt = tokenResponse.expires_in
      ? Date.now() + tokenResponse.expires_in * 1000
      : undefined;  // <-- aqui, não null

    const providerAccountId = await fetchProviderAccountId(provider, accessToken);

    await fetchMutation(api.connections.createOrUpdate, {
      provider,
      providerAccountId,
      accessToken,
      tokenExpiresAt,
    });

    return NextResponse.redirect(new URL("/dashboard/shortener", req.url));
  } catch (error) {
    console.error("Erro no callback do provider:", error);
    return NextResponse.redirect(new URL("/dashboard/shortener?error=auth_failed", req.url));
  }
}

async function fetchAccessToken(provider: string, code: string) {
  if (provider === "instagram") {
    const response = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_CLIENT_ID!,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/connect/${provider}/callback`,
        code,
      }),
    });

    if (!response.ok) throw new Error("Erro ao obter token do Instagram");

    return response.json();
  }

  throw new Error(`Provider ${provider} não implementado`);
}

async function fetchProviderAccountId(provider: string, accessToken: string) {
  if (provider === "instagram") {
    const response = await fetch(`https://graph.instagram.com/me?fields=id&access_token=${accessToken}`);
    if (!response.ok) throw new Error("Erro ao buscar dados do Instagram");
    const data = await response.json();
    return data.id;
  }

  throw new Error(`Provider ${provider} não implementado`);
}
