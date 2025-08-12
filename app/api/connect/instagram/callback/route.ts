// Em /app/api/connect/instagram/callback/route.ts
// (Substitua o arquivo inteiro)

import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/utils';
import { fetchAction } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const baseUrl = getBaseUrl();
  const errorRedirectUrl = new URL('/dashboard/settings?status=error', baseUrl);

  if (!code) {
    console.error("Callback do Instagram não retornou um código.");
    return NextResponse.redirect(errorRedirectUrl);
  }

  try {
    // =======================================================
    // CORREÇÃO DEFINITIVA: Autenticar PRIMEIRO na API Route
    // =======================================================
    const { userId } = await auth();
    if (!userId) {
      // Se o usuário não estiver logado, não podemos continuar.
      // Redirecionamos para a página de login.
      console.error("Usuário não autenticado no callback do Instagram.");
      return NextResponse.redirect(new URL('/sign-in', baseUrl));
    }

    // Agora chamamos a action do Convex, passando o `userId` que acabamos de validar.
    await fetchAction(api.connections.exchangeCodeForToken, {
      code,
      redirectUri: process.env.INSTAGRAM_REDIRECT_URI!,
      userId: userId, // <-- Passando o ID do usuário autenticado para a action
    });

    const successRedirectUrl = new URL('/dashboard/settings?status=connected', baseUrl);
    return NextResponse.redirect(successRedirectUrl);
  } catch (error) {
    console.error("Erro ao chamar a action do Convex para troca de token:", error);
    return NextResponse.redirect(errorRedirectUrl);
  }
}