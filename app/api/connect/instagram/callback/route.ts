import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { fetchMutation } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!code) {
    console.error("Callback do Instagram não retornou um código.");
    return NextResponse.redirect(new URL('/dashboard/settings?status=error', baseUrl));
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      console.error("Usuário não autenticado no callback do Instagram.");
      return NextResponse.redirect(new URL('/sign-in', baseUrl));
    }

    // Trocar código por token usando a Graph API
    const tokenUrl = 'https://graph.facebook.com/v19.0/oauth/access_token';
    const tokenParams = new URLSearchParams({
      client_id: process.env.INSTAGRAM_CLIENT_ID!,
      client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
      code: code,
    });

    const tokenResponse = await fetch(`${tokenUrl}?${tokenParams}`);

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('Erro ao trocar código por token:', error);
      throw new Error('Falha ao trocar código por token');
    }

    const tokenData = await tokenResponse.json();

    // Obter ID da conta do Instagram
    const meResponse = await fetch(
      `https://graph.facebook.com/v19.0/me?access_token=${tokenData.access_token}`
    );

    const meData = await meResponse.json();

    // Salvar token no Convex
    await fetchMutation(api.connections.saveInstagramToken, {
      userId: userId,
      accessToken: tokenData.access_token,
      providerAccountId: meData.id || 'unknown',
      expiresIn: tokenData.expires_in,
    });

    return NextResponse.redirect(new URL('/admin/instagram?status=connected', baseUrl));
  } catch (error) {
    console.error("Erro ao processar callback do Instagram:", error);
    return NextResponse.redirect(new URL('/admin/instagram?status=error', baseUrl));
  }
}