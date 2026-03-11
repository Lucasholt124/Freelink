import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


const getCurrentMonthString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};


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

// 🚀 CRIAR UMA NOVA CAMPANHA
export const createCampaign = mutation({
  args: {
    title: v.string(),
    productLink: v.string(),
    adText: v.string(),
    mediaUrls: v.array(v.string()),
    userPlan: v.string(),
    niche: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autorizado");


    const limit = args.userPlan === "ultra" ? 5000 : 1000;
    const currentMonth = getCurrentMonthString();

    return await ctx.db.insert("adCampaigns", {
      userId: identity.subject,
      title: args.title,
      productLink: args.productLink,
      adText: args.adText,
      mediaUrls: args.mediaUrls,
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
    if (!campaign || campaign.userId !== identity.subject) {
      throw new Error("Campanha não encontrada");
    }

    const currentMonth = getCurrentMonthString();
    let currentViews = campaign.views;

    // Se o mês virou, reseta as views de verdade no banco antes de verificar o limite
    if (campaign.lastResetMonth !== currentMonth) {
      currentViews = 0;
      await ctx.db.patch(args.id, { views: 0, lastResetMonth: currentMonth });
    }

    if (args.status === "active" && currentViews >= campaign.maxViewsLimit) {
      throw new Error("Limite de visualizações do mês atingido. Faça upgrade para o Ultra!");
    }

    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// 🗑️ DELETAR UMA CAMPANHA
export const deleteCampaign = mutation({
  args: { id: v.id("adCampaigns") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Não autorizado");

    const campaign = await ctx.db.get(args.id);
    if (!campaign || campaign.userId !== identity.subject) {
      throw new Error("Campanha não encontrada");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// 🎯 ROLETA PÚBLICA (VITRINE) - A MÁGICA ANTI-CONCORRENTE ACONTECE AQUI
export const getAdForPublicPage = mutation({
  args: {
    pageOwnerNiche: v.string(), // O nicho da página que está sendo visitada
    pageOwnerPlan: v.string(),  // Plano de quem é dono do link
  },
  handler: async (ctx, args) => {
    // 1. Regra de Ouro: Se a página é Ultra, NÃO EXIBE ANÚNCIO (Whitelabel)
    if (args.pageOwnerPlan === "ultra") return null;

    const currentMonth = getCurrentMonthString();

    // 2. Busca campanhas ativas
    const activeCampaigns = await ctx.db
      .query("adCampaigns")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    // 3. O Filtro Inteligente:
    const validCampaigns = activeCampaigns.filter(camp => {
      // A. Se o mês virou, considerar que tem 0 views e deixar rodar
      const isNewMonth = camp.lastResetMonth !== currentMonth;
      const viewsCount = isNewMonth ? 0 : camp.views;

      // B. Cortar se bateu o limite
      if (viewsCount >= camp.maxViewsLimit) return false;

      // C. A REGRA DE OURO ANTI-CONCORRENTE: O nicho do anúncio não pode ser o mesmo da página
      if (camp.niche === args.pageOwnerNiche) return false;

      return true;
    });

    if (validCampaigns.length === 0) return null;

    // Sorteia um anúncio aleatório entre os válidos
    const selectedAd = validCampaigns[Math.floor(Math.random() * validCampaigns.length)];

    // Atualiza as views daquele anúncio (cobrança de exibição)
    const isNewMonth = selectedAd.lastResetMonth !== currentMonth;
    await ctx.db.patch(selectedAd._id, {
      views: isNewMonth ? 1 : selectedAd.views + 1,
      lastResetMonth: currentMonth,
      // Se bateu o limite neste exato momento, já pausa a campanha
      status: (isNewMonth ? 1 : selectedAd.views + 1) >= selectedAd.maxViewsLimit ? "completed" : "active"
    });

    // Retorna apenas o que a página pública precisa ver (segurança)
    return {
      id: selectedAd._id,
      title: selectedAd.title,
      text: selectedAd.adText,
      mediaUrls: selectedAd.mediaUrls,
      link: selectedAd.productLink
    };
  }
});

// 🖱️ REGISTRAR O CLIQUE DO USUÁRIO FINAL
export const registerAdClick = mutation({
  args: { id: v.id("adCampaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.id);
    if (campaign) {
      await ctx.db.patch(args.id, { clicks: campaign.clicks + 1 });
    }
  }
});