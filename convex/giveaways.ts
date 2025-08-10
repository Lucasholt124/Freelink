// Em convex/giveaways.ts
// (Substitua o arquivo inteiro)

import { mutation } from "./_generated/server";
import { v } from "convex/values";

// --- Tipagem para a resposta da API do Instagram ---
interface InstagramComment {
  id: string;
  text: string;
  username: string;
  profile_pic?: string; // profile_pic é opcional
}

interface InstagramOembedResponse {
  media_id?: string;
  error?: { message: string };
}

interface InstagramCommentResponse {
  data: InstagramComment[];
  paging?: { next?: string };
  error?: { message: string };
}

// --- Função auxiliar para buscar comentários ---
async function fetchAllComments(mediaId: string, accessToken: string): Promise<InstagramComment[]> {
    const allComments: InstagramComment[] = [];
    let nextUrl: string | undefined = `https://graph.facebook.com/v19.0/${mediaId}/comments?fields=id,text,username,profile_pic&access_token=${accessToken}&limit=100`;

    while (nextUrl) {
        const response: Response = await fetch(nextUrl);
        const data: InstagramCommentResponse = await response.json();

        if (!response.ok || data.error) {
            throw new Error(data.error?.message || "Falha ao buscar comentários do Instagram.");
        }

        if (data.data) {
          allComments.push(...data.data);
        }
        nextUrl = data.paging?.next;
    }

    return allComments;
}

// --- Mutação Principal ---
export const runGiveaway = mutation({
  args: {
    postUrl: v.string(),
    unique: v.boolean(),
    mentions: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Usuário não autenticado.");
    }
    const userId = identity.subject;

    // =======================================================================
    // CORREÇÃO APLICADA AQUI: Usando os nomes corretos do seu schema.ts
    // Tabela: "connections"
    // Índice: "by_user_provider"
    // =======================================================================
    const instagramConnection = await ctx.db
      .query("connections")
      .withIndex("by_user_provider", (q) => q.eq("userId", userId).eq("provider", "instagram"))
      .unique();

    const instagramAccessToken = instagramConnection?.accessToken;

    if (!instagramAccessToken) {
      throw new Error("Conta do Instagram não conectada. Por favor, conecte-a nas configurações.");
    }

    // Usamos o oEmbed para converter a URL do post em um ID de mídia
    const oembedUrl = `https://graph.facebook.com/v19.0/instagram_oembed?url=${encodeURIComponent(args.postUrl)}&access_token=${instagramAccessToken}`;
    const oembedResponse = await fetch(oembedUrl);
    const oembedData: InstagramOembedResponse = await oembedResponse.json();

    if (!oembedResponse.ok || !oembedData.media_id) {
        throw new Error("URL do post inválida. Certifique-se de que é um link público de um post do Instagram.");
    }
    const mediaId = oembedData.media_id;

    // Buscamos todos os comentários
    const allComments = await fetchAllComments(mediaId, instagramAccessToken);

    if (allComments.length === 0) {
      throw new Error("Nenhum comentário encontrado neste post.");
    }

    // Aplicamos os filtros
    let eligibleComments = allComments;
    if (args.mentions > 0) {
      eligibleComments = eligibleComments.filter(c => (c.text.match(/@/g) || []).length >= args.mentions);
    }
    if (args.unique) {
      const uniqueUsernames = new Set<string>();
      eligibleComments = eligibleComments.filter(c => {
        if (!uniqueUsernames.has(c.username)) {
          uniqueUsernames.add(c.username);
          return true;
        }
        return false;
      });
    }

    if (eligibleComments.length === 0) {
      throw new Error("Nenhum comentário elegível encontrado com esses filtros.");
    }

    // Sorteamos o vencedor
    const winnerIndex = Math.floor(Math.random() * eligibleComments.length);
    const winner = eligibleComments[winnerIndex];

    return {
      username: winner.username,
      commentText: winner.text,
      profilePicUrl: winner.profile_pic || `https://i.pravatar.cc/150?u=${winner.username}`,
    };
  },
});