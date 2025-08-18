// app/api/mock-data.ts

export const MOCK_NOTIFICATIONS = [
  { id: "1", message: "Seu link 'campanha-verao' atingiu 1000 cliques!", isRead: false, timestamp: new Date(Date.now() - 3600000).toISOString(), link: "/dashboard/links" },
  { id: "2", message: "Novas ferramentas IA disponíveis no plano ULTRA!", isRead: false, timestamp: new Date(Date.now() - 7200000).toISOString(), link: "/dashboard/billing" },
  { id: "3", message: "Bem-vindo(a) ao Freelink! Conheça nosso encurtador de links.", isRead: true, timestamp: new Date(Date.now() - 10800000).toISOString(), link: "/dashboard/shortener" },
  { id: "4", message: "Seu plano PRO foi renovado com sucesso. Obrigado por ser nosso cliente!", isRead: false, timestamp: new Date().toISOString(), link: "/dashboard/billing" },
];

export const MOCK_SEARCH_RESULTS = [
  { label: "Visão Geral", href: "/dashboard", tags: ["dashboard", "visão geral", "início"] },
  { label: "Meus Links", href: "/dashboard/links", tags: ["links", "gerenciar links", "linktree"] },
  { label: "Mentor.IA", href: "/dashboard/mentor-ia", tags: ["mentor", "ia", "inteligência artificial"] },
  { label: "FreelinkBrain", href: "/dashboard/brain", tags: ["brain", "ia", "inteligência artificial"] },
  { label: "Encurtador", href: "/dashboard/shortener", tags: ["encurtar", "link", "url"] },
  { label: "Sorteios", href: "/dashboard/giveaway", tags: ["sorteio", "marketing", "promoção"] },
  { label: "Rastreamento", href: "/dashboard/tracking", tags: ["rastrear", "analytics", "dados"] },
  { label: "Configurações", href: "/dashboard/settings", tags: ["conta", "ajustes", "perfil"] },
  { label: "Plano e Cobrança", href: "/dashboard/billing", tags: ["plano", "assinatura", "preço", "upgrade"] },
  { label: "Suporte", href: "/dashboard/help", tags: ["ajuda", "suporte", "faq"] },
];