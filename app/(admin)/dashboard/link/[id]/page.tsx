
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
  // Primeiro, buscamos o usuário logado
  const user = await currentUser();
  if (!user) {
    notFound();
  }

  // Em seguida, resolvemos a Promise dos params para obter o 'id'
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // Agora, com o userId e o linkId em mãos, buscamos os dados de analytics
  const analytics = await fetchDetailedAnalyticsForLink(user.id, id);

  // Se a busca de analytics falhar ou não encontrar dados, mostramos a tela de erro
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

  // Se tudo deu certo, passamos os dados para o componente de UI
  return <LinkAnalytics analytics={analytics} />;
}