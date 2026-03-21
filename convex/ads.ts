import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const getCurrentMonthString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const getCampaigns = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autorizado");

    const currentMonth = getCurrentMonthString();
    const campaigns = await ctx.db
      .query("adCampaigns")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    return campaigns.map(camp => {
      if (camp.lastResetMonth !== currentMonth) {
        return { ...camp, views: 0 };
      }
      return camp;
    });
  },
});

export const createCampaign = mutation({
  args: {
    title: v.string(),
    productLink: v.string(),
    adText: v.string(),
    mediaStorageIds: v.array(v.id("_storage")),
    mediaTypes: v.array(v.string()),
    userPlan: v.string(),
    niche: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autorizado");

    const mediaUrls = [];
    for (const storageId of args.mediaStorageIds) {
      const url = await ctx.storage.getUrl(storageId);
      if (url) mediaUrls.push(url);
    }

    const limit = args.userPlan === "ultra" ? 5000 : 1000;
    const currentMonth = getCurrentMonthString();

    return await ctx.db.insert("adCampaigns", {
      userId: identity.subject,
      title: args.title,
      productLink: args.productLink,
      adText: args.adText,
      mediaUrls: mediaUrls,
      mediaTypes: args.mediaTypes,
      niche: args.niche || "geral",
      status: "active",
      views: 0,
      clicks: 0,
      maxViewsLimit: limit,
      lastResetMonth: currentMonth,
      createdAt: Date.now(),
    });
  },
});

export const toggleCampaignStatus = mutation({
  args: {
    id: v.id("adCampaigns"),
    status: v.union(v.literal("active"), v.literal("paused")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autorizado");

    const campaign = await ctx.db.get(args.id);
    if (!campaign || campaign.userId !== identity.subject) throw new Error("Campanha não encontrada");

    const currentMonth = getCurrentMonthString();
    let currentViews = campaign.views;

    if (campaign.lastResetMonth !== currentMonth) {
      currentViews = 0;
      await ctx.db.patch(args.id, { views: 0, lastResetMonth: currentMonth });
    }

    if (args.status === "active" && currentViews >= campaign.maxViewsLimit) {
      throw new Error("Limite de visualizações do mês atingido. Faça upgrade para o Ultra!");
    }

    await ctx.db.patch(args.id, { status: args.status, updatedAt: Date.now() });
    return { success: true };
  },
});

export const deleteCampaign = mutation({
  args: { id: v.id("adCampaigns") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autorizado");

    const campaign = await ctx.db.get(args.id);
    if (!campaign || campaign.userId !== identity.subject) throw new Error("Campanha não encontrada");

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// ============================================================
// 🧠 SALVAR NICHO DO DONO DA PÁGINA NA TABELA USERNAMES
// ============================================================
// Chamado UMA ÚNICA VEZ quando o usuário salva/edita seu perfil.
// Grava o nicho direto na tabela "usernames" que já existe.
// Na visita pública: ZERO chamadas de IA, só leitura de string.
// ============================================================
export const saveUserNiche = mutation({
  args: {
    niche: v.string(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autorizado");

    const usernameRecord = await ctx.db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    // 🔥 Removido o bloqueio estrito de userId para permitir atualizações via sub-contas
    if (usernameRecord) {
      await ctx.db.patch(usernameRecord._id, { niche: args.niche });
    }

    return { success: true, niche: args.niche };
  },
});

// ============================================================
// 🔍 BUSCAR NICHO DO DONO DA PÁGINA (LEITURA PURA, SEM IA)
// ============================================================
// Quando alguém visita freelinnk.com/nike-store, o sistema busca
// o nicho SALVO na tabela usernames. Sem IA, sem API externa.
// ============================================================
export const getPageOwnerNiche = query({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const usernameRecord = await ctx.db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!usernameRecord) {
      return { niche: "geral", plan: "free", userId: null };
    }

    // Busca o plano do usuário (se você tiver uma tabela de planos/subscriptions)
    // Por enquanto retorna o que temos na tabela usernames
    return {
      niche: usernameRecord.niche || "geral",
      userId: usernameRecord.userId,
      // Se o plano estiver em outra tabela, busque aqui
      plan: "free", // TODO: buscar plano real do usuário
    };
  },
});

// ============================================================
// 🎯 ROLETA PÚBLICA - ZERO IA, SÓ COMPARAÇÃO DE STRINGS
// ============================================================
// FLUXO:
// 1. Anunciante cria campanha → IA classifica → salva niche em adCampaigns (1x)
// 2. Dono da página salva perfil → IA classifica → salva niche em usernames (1x)
// 3. Visitante entra → lê usernames.niche + compara com adCampaigns.niche
//    → ZERO chamadas de IA ✅
//
// EXEMPLO:
// - "nike-store" tem niche="calcados" em usernames
// - Anúncio "Adidas Ultra" tem niche="calcados" em adCampaigns
// - Visita em /nike-store → "calcados" === "calcados" → BLOQUEADO ❌
// - Visita em /barbearia-joao (niche="beleza") → LIBERADO ✅
// ============================================================
export const getAdForPublicPage = mutation({
  args: {
    pageOwnerNiche: v.string(),
    pageOwnerPlan: v.string(),
  },
  handler: async (ctx, args) => {
    // Ultra não vê anúncio
    if (args.pageOwnerPlan === "ultra") return null;

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const activeCampaigns = await ctx.db
      .query("adCampaigns")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    // 🧠 FILTRO ANTI-CONCORRÊNCIA: Só comparação de strings salvas
    const validCampaigns = activeCampaigns.filter(camp => {
      const isNewMonth = camp.lastResetMonth !== currentMonth;
      const viewsCount = isNewMonth ? 0 : camp.views;

      // Bloqueio 1: Limite de views
      if (viewsCount >= camp.maxViewsLimit) return false;

      // Bloqueio 2: ANTI-CONCORRÊNCIA
      // Se ambos têm nicho definido e são iguais → BLOQUEIA
      if (args.pageOwnerNiche !== "geral" && camp.niche !== "geral") {
        if (camp.niche === args.pageOwnerNiche) return false;
      }

      return true;
    });

    if (validCampaigns.length === 0) return null;

    const selectedAd = validCampaigns[Math.floor(Math.random() * validCampaigns.length)];

    const isNewMonth = selectedAd.lastResetMonth !== currentMonth;
    const newViewsCount = isNewMonth ? 1 : selectedAd.views + 1;

    await ctx.db.patch(selectedAd._id, {
      views: newViewsCount,
      lastResetMonth: currentMonth,
      status: newViewsCount >= selectedAd.maxViewsLimit ? "completed" : "active"
    });

    return {
      id: selectedAd._id,
      title: selectedAd.title,
      text: selectedAd.adText,
      mediaUrls: selectedAd.mediaUrls,
      mediaTypes: selectedAd.mediaTypes || [],
      link: selectedAd.productLink
    };
  }
});

export const registerAdClick = mutation({
  args: { id: v.id("adCampaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.id);
    if (campaign) {
      await ctx.db.patch(args.id, { clicks: campaign.clicks + 1 });
    }
  }
});