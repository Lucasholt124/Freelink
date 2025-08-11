
import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/utils';
import { fetchAction } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const baseUrl = getBaseUrl();
    const errorRedirectUrl = new URL('/dashboard/settings?status=error', baseUrl);

    if (!code) {
        console.error("Callback não retornou um código.");
        return NextResponse.redirect(errorRedirectUrl);
    }

    try {
        // CORREÇÃO: A action agora está em `api.connections`
        await fetchAction(api.connections.exchangeCodeForToken, {
            code,
            redirectUri: process.env.INSTAGRAM_REDIRECT_URI!,
        });

        const successRedirectUrl = new URL('/dashboard/settings?status=connected', baseUrl);
        return NextResponse.redirect(successRedirectUrl);
    } catch (error) {
        console.error("Erro ao chamar a action do Convex para troca de token:", error);
        return NextResponse.redirect(errorRedirectUrl);
    }
}