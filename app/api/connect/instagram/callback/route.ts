
import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/utils';
import { fetchMutation } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

// =======================================================
// CORREÇÃO FINAL: A assinatura da função agora corresponde
// ao que o build da Vercel está exigindo para esta rota.
// =======================================================
export async function GET(
    req: NextRequest
    // Não precisamos do segundo argumento, pois o 'code' vem do `req.url`.
    // Vamos omiti-lo completamente para evitar qualquer tipo de conflito.
) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const baseUrl = getBaseUrl();
    const errorRedirectUrl = new URL('/dashboard/settings?status=error', baseUrl);

    // O resto da sua lógica já está correto.
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
        // ETAPA 1: Trocar o 'code' por um access_token de curta duração
        const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUri}&code=${code}`;
        const tokenResponse = await fetch(tokenUrl);
        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok || !tokenData.access_token) {
            throw new Error(tokenData.error?.message || 'Falha ao obter o token de acesso de curta duração.');
        }

        // ETAPA 2: Trocar o token de curta duração por um de longa duração
        const longTokenUrl = `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${tokenData.access_token}`;
        const longTokenResponse = await fetch(longTokenUrl);
        const longTokenData = await longTokenResponse.json();

        if (!longTokenResponse.ok || !longTokenData.access_token) {
            throw new Error(longTokenData.error?.message || 'Falha ao obter o token de longa duração.');
        }
        const accessToken = longTokenData.access_token;
        const tokenExpiresIn = longTokenData.expires_in;

        // ETAPA 3: Usar o token para buscar o ID do usuário no Instagram
        const userInfoUrl = `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`;
        const userInfoResponse = await fetch(userInfoUrl);
        const userInfo = await userInfoResponse.json();

        if (!userInfoResponse.ok || !userInfo.id) {
            throw new Error(userInfo.error?.message || 'Falha ao buscar informações do usuário no Instagram.');
        }

        // ETAPA 4: Salvar a conexão no Convex
        await fetchMutation(api.connections.createOrUpdate, {
            provider: 'instagram',
            providerAccountId: userInfo.id,
            accessToken: accessToken,
            tokenExpiresAt: Date.now() + (tokenExpiresIn * 1000),
        });

        // ETAPA 5: Redirecionar para o dashboard com sucesso
        const successRedirectUrl = new URL('/dashboard/settings?status=connected', baseUrl);
        return NextResponse.redirect(successRedirectUrl);

    } catch (error) {
        console.error("Erro detalhado no callback de conexão:", error);
        return NextResponse.redirect(errorRedirectUrl);
    }
}