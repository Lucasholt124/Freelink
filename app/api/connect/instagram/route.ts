import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    console.error("ERRO: Variáveis INSTAGRAM_CLIENT_ID ou INSTAGRAM_REDIRECT_URI não configuradas.");
    return new NextResponse("Erro interno do servidor.", { status: 500 });
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
