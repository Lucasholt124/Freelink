import { NextRequest, NextResponse } from 'next/server';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export const runtime = 'nodejs';

// Define a estrutura do comentário do Instagram para tipagem
interface InstagramComment {
  username: string;
  text: string;
  timestamp: string;
  like_count: number;
}

// Define a estrutura da resposta da API de comentários
interface InstagramCommentsResponse {
  data: InstagramComment[];
  paging?: { next?: string; previous?: string };
}

export async function POST(req: NextRequest) {
  try {
    const { postId } = await req.json();

    if (!postId) {
      return NextResponse.json(
        { success: false, error: 'ID do post é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar token do admin no Convex
    const adminToken = await fetchQuery(api.connections.getAdminInstagramToken);

    if (!adminToken || !adminToken.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sistema não conectado ao Instagram. Por favor, aguarde o administrador configurar a conexão.'
        },
        { status: 503 }
      );
    }

    // Primeiro, obter o media_id do post
    const mediaUrl = `https://graph.facebook.com/v19.0/${postId}?fields=id,media_type,caption&access_token=${adminToken.accessToken}`;
    const mediaCheckResponse = await fetch(mediaUrl);

    if (!mediaCheckResponse.ok) {
      const error = await mediaCheckResponse.json();
      console.error('Erro ao verificar mídia:', error);

      if (mediaCheckResponse.status === 404 || error.error?.code === 100) {
        return NextResponse.json(
          {
            success: false,
            error: 'Post não encontrado. Verifique se a URL está correta e se o post é público.'
          },
          { status: 404 }
        );
      }

      // Se for erro de permissão
      if (error.error?.code === 190 || error.error?.code === 10) {
        return NextResponse.json(
          {
            success: false,
            error: 'Token expirado ou sem permissão. Contate o administrador.'
          },
          { status: 401 }
        );
      }

      throw new Error(error.error?.message || 'Erro ao verificar post');
    }

    // Buscar comentários
    const commentsUrl = `https://graph.facebook.com/v19.0/${postId}/comments?fields=text,username,timestamp,like_count&limit=100&access_token=${adminToken.accessToken}`;
    const commentsResponse = await fetch(commentsUrl);

    if (!commentsResponse.ok) {
      const error = await commentsResponse.json();
      console.error('Erro ao buscar comentários:', error);

      // Se não houver permissão para ler comentários
      if (error.error?.code === 10 || error.error?.code === 200) {
        return NextResponse.json(
          {
            success: false,
            error: 'Sem permissão para ler comentários. O post pode ser privado ou de outra conta.'
          },
          { status: 403 }
        );
      }

      throw new Error(error.error?.message || 'Erro ao buscar comentários');
    }

    const data = (await commentsResponse.json()) as InstagramCommentsResponse;

    // Formatar comentários
    const comments = data.data?.map((comment: InstagramComment) => ({
      username: comment.username || 'usuario_desconhecido',
      text: comment.text || '',
      timestamp: comment.timestamp,
      likes: comment.like_count || 0,
    })) || [];

    // Buscar mais páginas se existirem (paginação)
    let nextPage = data.paging?.next;
    let totalFetched = comments.length;
    const maxComments = 5000; // Limite máximo de comentários

    while (nextPage && totalFetched < maxComments) {
      try {
        const nextResponse = await fetch(nextPage);
        if (nextResponse.ok) {
          const nextData = (await nextResponse.json()) as InstagramCommentsResponse;
          const moreComments = nextData.data?.map((comment: InstagramComment) => ({
            username: comment.username || 'usuario_desconhecido',
            text: comment.text || '',
            timestamp: comment.timestamp,
            likes: comment.like_count || 0,
          })) || [];

          comments.push(...moreComments);
          totalFetched += moreComments.length;
          nextPage = nextData.paging?.next;

          // Adicionar um pequeno delay para não sobrecarregar a API
          await new Promise(resolve => setTimeout(resolve, 100));
        } else {
          break;
        }
      } catch (pageError) {
        console.error('Erro ao buscar página adicional:', pageError);
        break;
      }
    }

    return NextResponse.json({
      success: true,
      comments,
      total: comments.length,
      hasMore: !!nextPage,
      message: comments.length === 0
        ? 'Nenhum comentário encontrado neste post.'
        : `${comments.length} comentários carregados com sucesso!`
    });

  } catch (error) {
    console.error('Erro geral ao buscar comentários:', error);

    // Mensagem de erro mais amigável
    let errorMessage = 'Erro ao buscar comentários. ';

    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        errorMessage += 'Problema de conexão com o Instagram.';
      } else {
        errorMessage += error.message;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}