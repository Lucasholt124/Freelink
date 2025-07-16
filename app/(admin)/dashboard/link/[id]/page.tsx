import LinkAnalytics from "@/components/LinkAnalytics";
import { fetchLinkAnalytics } from "@/convex/lib/fetchLinkAnalytics";

import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

interface LinkAnalyticsPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function LinkAnalyticsPage({ params }: LinkAnalyticsPageProps) {
  const user = await currentUser();
  const { id } = await params;

  if (!user) {
    notFound();
  }

  // Obter análises para o link específico
  const analytics = await fetchLinkAnalytics(user.id, id);

  // Se nenhum dado analítico for encontrado, mostrar o componente com estado vazio
// O componente LinkAnalytics lida com o caso de "nenhum dado" com elegância
  if (!analytics) {
    // Retorna um objeto analítico vazio para que o componente possa mostrar o estado "sem dados"
    const emptyAnalytics = {
      linkId: id,
      linkTitle: "Este link não possui análises",
      linkUrl: "Aguarde a geração da análise ou verifique novamente mais tarde.",
      totalClicks: 0,
      uniqueUsers: 0,
      countriesReached: 0,
      dailyData: [],
      countryData: [],
    };
    return <LinkAnalytics analytics={emptyAnalytics} />;
  }

  return <LinkAnalytics analytics={analytics} />;
}

export default LinkAnalyticsPage;