export const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    message: "💰 Você teve 24 visitas no link sem registrar lucro. Calcule seu caixa agora!",
    isRead: false,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    link: "/dashboard/profit-calculator"
  },
  {
    id: "2",
    message: "🚀 Seu produto foi distribuído na Rede de Anúncios e gerou +15 visualizações.",
    isRead: false,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    link: "/dashboard/ads"
  },
  {
    id: "3",
    message: "Dica: Você está perdendo dados! Instale o Pixel do Facebook na sua página.",
    isRead: false,
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    link: "/dashboard/tracking"
  },
  {
    id: "4",
    message: "Seu plano PRO foi ativado com sucesso. Sua vitrine agora está rastreada!",
    isRead: true,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    link: "/dashboard/billing"
  },
];

export const MOCK_SEARCH_RESULTS = [
  { label: "Visão Geral", href: "/dashboard", tags: ["dashboard", "visão geral", "início", "home"] },
  { label: "Minhas Vitrines", href: "/dashboard/links", tags: ["links", "gerenciar links", "linktree", "produtos", "botões"] },
  { label: "Hub de Anúncios", href: "/dashboard/ads", tags: ["anúncio", "ads", "tráfego", "campanha", "impulsionar"] },
  { label: "Calculadora e CRM", href: "/dashboard/profit-calculator", tags: ["lucro", "dinheiro", "crm", "financeiro", "vendas"] },
  { label: "Encurtador PRO", href: "/dashboard/shortener", tags: ["encurtar", "link", "url", "rastrear"] },
  { label: "Sorteador Automático", href: "/dashboard/giveaway", tags: ["sorteio", "marketing", "promoção", "instagram", "comentários"] },
  { label: "Pixel e Rastreamento", href: "/dashboard/tracking", tags: ["rastrear", "analytics", "dados", "pixel", "facebook", "google"] },
  { label: "Configurações de Conta", href: "/dashboard/settings", tags: ["conta", "ajustes", "perfil", "senha", "dados"] },
  { label: "Plano e Cobrança", href: "/dashboard/billing", tags: ["plano", "assinatura", "preço", "upgrade", "fatura", "cartão"] },
  { label: "Central de Suporte", href: "/dashboard/help", tags: ["ajuda", "suporte", "faq", "dúvida", "whatsapp", "email"] },
];