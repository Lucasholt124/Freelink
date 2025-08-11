// Em app/api/connect/instagram/callback/route.ts
// (Substitua o arquivo inteiro)

import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/utils';
import { fetchMutation } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const baseUrl = getBaseUrl();
    const errorRedirectUrl = new URL('/dashboard/settings?status=error', baseUrl);

    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
        console.error("ERRO: Variáveis de ambiente do Instagram não configuradas no callback.");
        return NextResponse.redirect(errorRedirectUrl);
    }

    if (!code) {
        console.error("Callback do Instagram não retornou um código de autorização.");
        return NextResponse.redirect(errorRedirectUrl);
    }

    try {
        const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUri}&code=${code}`;
        const tokenResponse = await fetch(tokenUrl);
        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok || !tokenData.access_token) {
            throw new Error(tokenData.error?.message || 'Falha ao obter o token de acesso de curta duração.');
        }

        const longTokenUrl = `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${tokenData.access_token}`;
        const longTokenResponse = await fetch(longTokenUrl);
        const longTokenData = await longTokenResponse.json();

        if (!longTokenResponse.ok || !longTokenData.access_token) {
            throw new Error(longTokenData.error?.message || 'Falha ao obter o token de longa duração.');
        }
        const accessToken = longTokenData.access_token;
        const tokenExpiresIn = longTokenData.expires_in; // Tempo em segundos

        const userInfoUrl = `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`;
        const userInfoResponse = await fetch(userInfoUrl);
        const userInfo = await userInfoResponse.json();

        if (!userInfoResponse.ok || !userInfo.id) {
            throw new Error(userInfo.error?.message || 'Falha ao buscar informações do usuário no Instagram.');
        }

        // =======================================================
        // CORREÇÃO APLICADA AQUI
        // =======================================================
        // O nome do campo foi corrigido de `tokenExpiresIn` para `tokenExpiresAt`.
        await fetchMutation(api.connections.createOrUpdate, {
            provider: 'instagram',
            providerAccountId: userInfo.id,
            accessToken: accessToken,
            tokenExpiresAt: Date.now() + (tokenExpiresIn * 1000), // Converte para timestamp em milissegundos
        });

        const successRedirectUrl = new URL('/dashboard/settings?status=connected', baseUrl);
        return NextResponse.redirect(successRedirectUrl);

    } catch (error) {
        console.error("Erro detalhado no callback de conexão:", error);
        return NextResponse.redirect(errorRedirectUrl);
    }
}