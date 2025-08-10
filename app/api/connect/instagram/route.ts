// Em app/api/connect/instagram/route.ts
// (Substitua o arquivo inteiro)

import { NextResponse } from 'next/server';

/**
 * Inicia o fluxo de autenticação OAuth com o Instagram (via Facebook).
 * Redireciona o usuário para a tela de autorização da Meta.
 */
export async function GET() {
    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

    // Validação de segurança: Garante que as variáveis de ambiente estão configuradas.
    if (!clientId || !redirectUri) {
        console.error("ERRO: Variáveis de ambiente INSTAGRAM_CLIENT_ID ou INSTAGRAM_REDIRECT_URI não configuradas.");
        // Não exponha o erro detalhado ao usuário.
        return new NextResponse("Erro de configuração interna do servidor.", { status: 500 });
    }

    // Escopos (permissões) que estamos solicitando ao usuário.
    // - instagram_basic: Acessa o perfil básico do usuário (ID, username).
    // - pages_show_list: Necessário para interagir com contas de criador/business.
    // - instagram_manage_comments: Essencial para a ferramenta de sorteios ler os comentários.
    const scopes = [
        'instagram_basic',
        'pages_show_list',
        'instagram_manage_comments'
    ].join(',');

    // Monta a URL de autorização oficial do Facebook.
    const authUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('response_type', 'code');
    // O parâmetro 'state' é uma medida de segurança para prevenir ataques CSRF.
    authUrl.searchParams.set('state', 'freelink_user_auth_flow');

    // Redireciona o navegador do usuário para a URL de autorização.
    return NextResponse.redirect(authUrl);
}