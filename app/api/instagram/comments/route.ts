import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export const runtime = "nodejs";

// Util: converte shortcode (ex: C0dExemplo123) para media_id
async function getMediaIdFromShortcode(shortcode: string, accessToken: string) {
  const url = `https://graph.facebook.com/v18.0/instagram_oembed?url=https://www.instagram.com/p/${shortcode}/&access_token=${accessToken}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Erro ao converter shortcode para media_id: ${resp.statusText}`);
  }
  const data = await resp.json();
  return data.media_id;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
    }

    const { postId } = await req.json();
    if (!postId) {
      return NextResponse.json({ error: "postId é obrigatório" }, { status: 400 });
    }

    // Recupera token salvo em Convex (action que você implementou em exchangeCodeForToken deve salvar em conexões)
    const connection = await fetchQuery(api.connections.get, { provider: "instagram" });
    if (!connection || !connection.accessToken) {
      return NextResponse.json({ error: "Token do Instagram não encontrado. Conecte novamente." }, { status: 403 });
    }
    const accessToken = connection.accessToken;

    // Converte shortcode em media_id
    const mediaId = await getMediaIdFromShortcode(postId, accessToken);

    // Busca comentários do post
    const url = `https://graph.facebook.com/v18.0/${mediaId}/comments?fields=username,text&limit=100&access_token=${accessToken}`;
    const resp = await fetch(url);

    if (!resp.ok) {
      const err = await resp.json();
      return NextResponse.json({ error: "Erro ao buscar comentários", details: err }, { status: 500 });
    }

    const data = await resp.json();

    // Normaliza saída para frontend
    const comments = (data.data || []).map((c: { username: string; text: string }) => ({
      username: c.username,
      text: c.text,
    }));

    return NextResponse.json({ comments });
  } catch (err) {
  console.error("Erro em /api/instagram/comments:", err);

  let message = "Erro desconhecido";
  if (err instanceof Error) {
    message = err.message;
  }

  return NextResponse.json(
    { error: "Erro interno", details: message },
    { status: 500 }
  );
}
}