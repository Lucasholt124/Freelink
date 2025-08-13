// Em /convex/giveaways.ts
// (Substitua o arquivo inteiro)

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// --- Tipagens ---
interface InstagramComment { id: string; text: string; username: string; profile_pic?: string; }
interface InstagramOembedResponse { media_id?: string; error?: { message: string }; }
interface InstagramCommentResponse { data: InstagramComment[]; paging?: { next?: string }; error?: { message: string }; }

async function fetchAllComments(mediaId: string, accessToken: string): Promise<InstagramComment[]> {
    const allComments: InstagramComment[] = [];
    let nextUrl: string | undefined = `https://graph.facebook.com/v19.0/${mediaId}/comments?fields=id,text,username,profile_pic&access_token=${accessToken}&limit=100`;
    while (nextUrl) {
        const response = await fetch(nextUrl);
        const data: InstagramCommentResponse = await response.json();
        if (!response.ok || data.error) throw new Error(data.error?.message || "Falha ao buscar comentários.");
        if (data.data) allComments.push(...data.data);
        nextUrl = data.paging?.next;
    }
    return allComments;
}

// --- ACTION para o sorteio do Instagram ---
export const runInstagramGiveaway = action({
  args: {
    postUrl: v.string(),
    unique: v.boolean(),
    mentions: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Usuário não autenticado.");

    const instagramConnection = await ctx.runQuery(api.connections.get, { provider: "instagram" });
    const instagramAccessToken = instagramConnection?.accessToken;
    if (!instagramAccessToken) throw new Error("Conta do Instagram não conectada. Conecte-a nas configurações.");

    const oembedUrl = `https://graph.facebook.com/v19.0/instagram_oembed?url=${encodeURIComponent(args.postUrl)}&access_token=${instagramAccessToken}`;
    const oembedResponse = await fetch(oembedUrl);
    const oembedData: InstagramOembedResponse = await oembedResponse.json();
    if (!oembedResponse.ok || !oembedData.media_id) throw new Error("URL do post inválida ou não foi possível obter o ID da mídia.");

    const mediaId = oembedData.media_id;
    const allComments = await fetchAllComments(mediaId, instagramAccessToken);
    if (allComments.length === 0) throw new Error("Nenhum comentário encontrado neste post.");

    let eligibleComments = allComments;
    if (args.mentions > 0) {
      eligibleComments = eligibleComments.filter(c => (c.text.match(/@/g) || []).length >= args.mentions);
    }
    if (args.unique) {
      const uniqueUsernames = new Set<string>();
      eligibleComments = eligibleComments.filter(c => {
        if (!uniqueUsernames.has(c.username)) { uniqueUsernames.add(c.username); return true; }
        return false;
      });
    }

    if (eligibleComments.length === 0) throw new Error("Nenhum comentário elegível com esses filtros.");
    const winner = eligibleComments[Math.floor(Math.random() * eligibleComments.length)];

    return {
      username: winner.username,
      commentText: winner.text,
      profilePicUrl: winner.profile_pic || `https://i.pravatar.cc/150?u=${encodeURIComponent(winner.username)}`,
    };
  },
});

// --- ACTION para sorteio de Lista ---
export const runListGiveaway = action({
    args: {
        participants: v.array(v.string()),
        unique: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Usuário não autenticado.");

        let participantsList = args.participants.map(p => p.trim()).filter(p => p.length > 0);
        if (participantsList.length === 0) throw new Error("A lista de participantes está vazia.");
        if (args.unique) {
            participantsList = [...new Set(participantsList)];
        }
        if (participantsList.length === 0) throw new Error("A lista de participantes ficou vazia após remover duplicatas.");


        const winnerName = participantsList[Math.floor(Math.random() * participantsList.length)];
        return {
            username: winnerName,
            commentText: "Selecionado(a) da lista",
            profilePicUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(winnerName)}`
        };
    }
});