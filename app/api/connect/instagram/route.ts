// Em app/api/connect/instagram/route.ts
// (Substitua o arquivo inteiro)

import { NextResponse } from 'next/server';

// =======================================================
// CORREÇÃO APLICADA AQUI
// =======================================================
// Força a rota a rodar no ambiente Node.js da Vercel para ter acesso a `process.env`.
export const runtime = 'nodejs';

/**
 * Inicia o fluxo de autenticação OAuth com o Instagram (via Facebook).
 * Redireciona o usuário para a tela de autorização da Meta.
 */
export async function GET() {
    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

    if (!clientId || !redirectUri) {
        console.error("ERRO: Variáveis de ambiente INSTAGRAM_CLIENT_ID ou INSTAGRAM_REDIRECT_URI não configuradas.");
        return new NextResponse("Erro de configuração interna do servidor.", { status: 500 });
    }

    const scopes = [
        'instagram_basic',
        'pages_show_list',
        'instagram_manage_comments'
    ].join(',');

    const authUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', 'freelink_user_auth_flow');

    return NextResponse.redirect(authUrl);
}