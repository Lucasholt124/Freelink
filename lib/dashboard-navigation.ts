export type DashboardPlan = "free" | "pro" | "ultra";

export const dashboardNavigation = [
  {
    group: "Seu espaço",
    href: "/dashboard",
    label: "Visão geral",
    icon: "home",
    description: "Sua página e próximos passos",
    keywords: "inicio painel resumo",
  },
  {
    group: "Seu espaço",
    href: "/dashboard/links",
    label: "Meus links",
    icon: "links",
    description: "Organize os links da sua página",
    keywords: "botoes editar ordenar destaque",
  },
  {
    group: "Seu espaço",
    href: "/dashboard/settings",
    label: "Aparência e perfil",
    icon: "palette",
    description: "Personalize sua página pública",
    keywords: "configuracoes nome foto bio cores tema",
  },
  {
    group: "Crescimento",
    href: "/dashboard/ads",
    label: "Hub de anúncios",
    icon: "ads",
    plan: "pro",
    description: "Crie e gerencie suas campanhas",
    keywords: "marketing trafego campanha",
  },
  {
    group: "Crescimento",
    href: "/dashboard/giveaway",
    label: "Sorteios",
    icon: "gift",
    plan: "pro",
    description: "Organize seus sorteios",
    keywords: "engajamento instagram",
  },
  {
    group: "Gestão",
    href: "/dashboard/profit-calculator",
    label: "Financeiro e CRM",
    icon: "calculator",
    plan: "ultra",
    description: "Vendas, despesas e clientes",
    keywords: "calculadora lucro receita custos negocios",
  },
  {
    group: "Gestão",
    href: "/dashboard/tracking",
    label: "Pixel e Analytics",
    icon: "tracking",
    plan: "ultra",
    description: "Configure seus identificadores de rastreamento",
    keywords: "rastreamento facebook google",
  },
  {
    group: "Sua conta",
    href: "/dashboard/billing",
    label: "Plano e cobrança",
    icon: "billing",
    description: "Consulte sua assinatura",
    keywords: "pagamento upgrade pro ultra",
  },
  {
    group: "Sua conta",
    href: "/dashboard/help",
    label: "Central de ajuda",
    icon: "help",
    description: "Encontre orientação e suporte",
    keywords: "duvidas suporte tutorial",
  },
] as const;

export type DashboardNavItem = (typeof dashboardNavigation)[number];
export function normalizePlan(plan: string): DashboardPlan {
  return plan === "ultra" || plan === "pro" ? plan : "free";
}
export function hasPlan(plan: string, required: string = "free") {
  const ranks = { free: 0, pro: 1, ultra: 2 };
  return ranks[normalizePlan(plan)] >= ranks[normalizePlan(required)];
}
export function activeDashboardHref(pathname: string) {
  if (pathname === "/dashboard/new-link") return "/dashboard/links";
  return [...dashboardNavigation]
    .sort((a, b) => b.href.length - a.href.length)
    .find(
      ({ href }) =>
        pathname === href ||
        (href !== "/dashboard" && pathname.startsWith(`${href}/`)),
    )?.href;
}
export function dashboardTitle(pathname: string) {
  if (pathname === "/dashboard/new-link") return "Novo link";
  return (
    dashboardNavigation.find(
      ({ href }) => href === activeDashboardHref(pathname),
    )?.label ?? "Painel"
  );
}
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function searchDashboard(query: string) {
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  return dashboardNavigation.filter((item) =>
    terms.every((term) =>
      normalize(`${item.label} ${item.description} ${item.keywords}`).includes(
        term,
      ),
    ),
  );
}
