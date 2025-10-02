import { NextResponse } from 'next/server';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Verificar se existe token admin válido
    const adminToken = await fetchQuery(api.connections.getAdminInstagramToken);

    return NextResponse.json({
      connected: !!adminToken && !!adminToken.isValid,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error("Erro ao verificar status da conexão:", error);
    return NextResponse.json({
      connected: false,
      error: "Falha ao verificar status da conexão"
    }, { status: 500 });
  }
}