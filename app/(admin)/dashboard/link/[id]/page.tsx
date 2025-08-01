
import LinkAnalytics from "@/components/LinkAnalytics";

// Importe a função de backend com o NOME CORRETO e a tipagem
import { fetchDetailedAnalyticsForLink } from "@/convex/lib/fetchLinkAnalytics";

import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";


interface LinkAnalyticsPageProps {
  params: Promise<{
    id: string;
  }>;
}


export default async function LinkAnalyticsPage({ params }: LinkAnalyticsPageProps) {
  const user = await currentUser();
   const { id } = await params;

  if (!user) {
    notFound();
  }

  // CORREÇÃO: Chamando a função com o nome correto
   const analytics = await fetchDetailedAnalyticsForLink(user.id, id);

  // CORREÇÃO: Se 'analytics' for nulo (nenhum clique ou erro de fetch),
  // nós NÃO criamos um objeto falso. Nós passamos `null` para o componente.
  // O componente de UI vai decidir o que fazer.
  if (!analytics) {
    // Se a busca falhou completamente, podemos mostrar um erro genérico
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

  // Se 'analytics' existe, passamos para o componente de UI.
  return <LinkAnalytics analytics={analytics} />;
}