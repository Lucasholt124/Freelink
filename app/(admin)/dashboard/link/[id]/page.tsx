
import LinkAnalytics from "@/components/LinkAnalytics";
import { fetchDetailedAnalyticsForLink, LinkAnalyticsData } from "@/convex/lib/fetchLinkAnalytics";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";

// Importações necessárias para buscar os detalhes do link no Convex E PARA A TIPAGEM
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { Id } from "@/convex/_generated/dataModel"; // <-- IMPORTANTE

// Mantendo a estrutura que a Vercel exige no seu projeto
interface LinkAnalyticsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LinkAnalyticsPage({ params }: LinkAnalyticsPageProps) {
  const user = await currentUser();
  if (!user) {
    notFound();
  }

  const resolvedParams = await params;
  const { id } = resolvedParams;

  // CORREÇÃO: Usamos 'as Id<"links">' para dizer ao TypeScript para confiar em nós.
  const linkId = id as Id<"links">;

  // Agora, com o userId e o linkId em mãos, buscamos os dados de analytics
  // E os detalhes do link (título, url) do Convex, tudo em paralelo.
  const [analytics, linkDetails] = await Promise.all([
    fetchDetailedAnalyticsForLink(user.id, linkId),
    fetchQuery(api.lib.links.getLinkById, { linkId: linkId })
  ]);

  if (!analytics) {
    return (
       <div className="p-8 text-center bg-gray-50 min-h-screen">
        <div className="bg-white p-10 rounded-xl shadow-md max-w-lg mx-auto">
            <h2 className="text-xl font-bold text-gray-800">Dados Indisponíveis</h2>
            <p className="text-gray-600 mt-2">
              Não foi possível carregar as análises. Verifique se o link já recebeu cliques ou tente novamente.
            </p>
            <Link href="/dashboard" className="mt-6 inline-block text-blue-600 font-semibold hover:underline">
              Voltar ao Painel
            </Link>
        </div>
      </div>
    );
  }

  const finalAnalyticsData: LinkAnalyticsData = {
    ...analytics,
    linkTitle: linkDetails?.title || analytics.linkTitle,
    linkUrl: linkDetails?.url || analytics.linkUrl,
  };

  return <LinkAnalytics analytics={finalAnalyticsData} />;
}