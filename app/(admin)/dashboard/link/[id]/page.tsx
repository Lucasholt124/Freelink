
import LinkAnalytics from "@/components/LinkAnalytics";
import { fetchDetailedAnalyticsForLink } from "@/convex/lib/fetchLinkAnalytics";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";

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

  console.log(`[DIAGNÓSTICO] Página carregada. Buscando dados para user: ${user.id}, link: ${id}`);

  const analytics = await fetchDetailedAnalyticsForLink(user.id, id);

  if (!analytics) {
    console.log("[DIAGNÓSTICO] fetchDetailedAnalyticsForLink retornou null. Renderizando tela de erro.");
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

  console.log("[DIAGNÓSTICO] Dados recebidos com sucesso. Renderizando componente LinkAnalytics.");
  return <LinkAnalytics analytics={analytics} />;
}