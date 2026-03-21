import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const getCurrentMonthString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

// 🔥 Gera um link seguro para o usuário subir o Vídeo/Imagem
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

// 🚀 CRIAR CAMPANHA
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

// 🎯 ROLETA PÚBLICA (VITRINE) - SISTEMA ANTI-CONCORRENTE COM IA GROQ
// A classificação de nicho feita pela Groq na criação do anúncio é usada aqui
// para garantir que NUNCA um anúncio apareça na página de um concorrente direto.
//
// COMO FUNCIONA O FLUXO COMPLETO:
// 1. Usuário cria anúncio → Frontend chama /api/analyze-niche com Groq
// 2. Groq analisa o nome do produto e texto → retorna nicho (ex: "calcados")
// 3. O nicho é salvo junto com a campanha no banco
// 4. Quando alguém visita uma página pública, o sistema sabe o nicho do DONO da página
// 5. O filtro abaixo BLOQUEIA qualquer anúncio do MESMO nicho do dono da página
// 6. Resultado: Quem vende tênis NUNCA vai ver anúncio de tênis na sua página
export const getAdForPublicPage = mutation({
  args: {
    pageOwnerNiche: v.string(),
    pageOwnerPlan: v.string(),
  },
  handler: async (ctx, args) => {
    // Regra de Ouro: Se a página é Ultra, NÃO EXIBE ANÚNCIO
    if (args.pageOwnerPlan === "ultra") return null;

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Busca campanhas ativas
    const activeCampaigns = await ctx.db
      .query("adCampaigns")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    // 🧠 O FILTRO INTELIGENTE ANTI-CONCORRÊNCIA:
    // Cada campanha tem um nicho classificado pela Groq (ex: "calcados", "beleza", "fitness")
    // Se o dono da página onde o anúncio vai aparecer vende no MESMO nicho,
    // o anúncio é BLOQUEADO para não beneficiar concorrentes.
    //
    // Exemplo prático:
    // - Loja "Nike Store SP" → nicho: "calcados"
    // - Anúncio "Adidas Ultraboost" → nicho: "calcados"
    // - RESULTADO: ❌ Bloqueado! Nunca vai aparecer na Nike Store SP.
    // - Mas vai aparecer na "Barbearia do João" (nicho: "beleza") ✅
    const validCampaigns = activeCampaigns.filter(camp => {
      const isNewMonth = camp.lastResetMonth !== currentMonth;
      const viewsCount = isNewMonth ? 0 : camp.views;

      // Bloqueio 1: Limite de views atingido
      if (viewsCount >= camp.maxViewsLimit) return false;

      // Bloqueio 2: ANTI-CONCORRÊNCIA - Mesmo nicho = bloqueado
      if (args.pageOwnerNiche !== "geral" && camp.niche !== "geral") {
        if (camp.niche === args.pageOwnerNiche) return false;
      }

      return true;
    });

    if (validCampaigns.length === 0) return null;

    // Sorteia um anúncio dos válidos
    const selectedAd = validCampaigns[Math.floor(Math.random() * validCampaigns.length)];

    // Atualiza as views
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

// 🖱️ REGISTRAR CLIQUE
export const registerAdClick = mutation({
  args: { id: v.id("adCampaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.id);
    if (campaign) {
      await ctx.db.patch(args.id, { clicks: campaign.clicks + 1 });
    }
  }
});