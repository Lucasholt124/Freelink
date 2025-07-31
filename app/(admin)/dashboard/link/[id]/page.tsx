
import LinkAnalytics from "@/components/LinkAnalytics";

// Importe a função de backend com o NOME CORRETO e a tipagem
import { fetchDetailedAnalyticsForLink, LinkAnalyticsData } from "@/convex/lib/fetchLinkAnalytics";

import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

interface LinkAnalyticsPageProps {
  params: {
    id: string;
  };
}

export default async function LinkAnalyticsPage({ params }: LinkAnalyticsPageProps) {
  const user = await currentUser();
  const { id } = params;

  if (!user) {
    notFound();
  }

  // CORREÇÃO: Chamando a função com o nome correto
  const analytics = await fetchDetailedAnalyticsForLink(user.id, id);

  // Se a busca falhar ou não retornar dados, mostramos um estado vazio/erro
  if (!analytics) {
    const emptyAnalytics: LinkAnalyticsData = {
      linkId: id,
      linkTitle: "Link não encontrado ou sem dados",
      linkUrl: "Por favor, verifique o ID do link ou aguarde os primeiros cliques.",
      totalClicks: 0,
      uniqueUsers: 0,
      countriesReached: 0,
      dailyData: [],
      countryData: [],
      cityData: [],
      hourlyData: [],
    };
    return <LinkAnalytics analytics={emptyAnalytics} />;
  }

  // Se a busca for bem-sucedida, passamos os dados completos para o componente de exibição
  return <LinkAnalytics analytics={analytics} />;
}