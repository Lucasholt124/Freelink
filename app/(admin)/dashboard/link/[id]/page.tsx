import LinkAnalytics from "@/components/LinkAnalytics";
import { fetchDetailedAnalyticsForLink, LinkAnalyticsData } from "@/convex/lib/fetchLinkAnalytics";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";

// Importações necessárias para buscar os detalhes do link no Convex
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { Id } from "@/convex/_generated/dataModel";

interface LinkAnalyticsPageProps {
  params: Promise<{
    linkId: string;
  }>;
}

// Lista de extensões de arquivo conhecidas para ignorar
const INVALID_EXTENSIONS = ['.css', '.js', '.map', '.ico', '.png', '.jpg', '.jpeg', '.svg', '.xml', '.txt'];

// Função para validar se é um ID Convex válido
function isValidConvexId(id: string): boolean {
  // IDs do Convex geralmente começam com uma letra e têm um formato específico
  return /^[a-zA-Z0-9]{15,}$/.test(id) && !id.includes('.');
}

export default async function LinkAnalyticsPage({ params }: LinkAnalyticsPageProps) {
  const user = await currentUser();
  if (!user) {
    notFound();
  }

  const resolvedParams = await params;
  const { linkId } = resolvedParams;

  // Validação 1: Verifica se é um arquivo estático
  if (INVALID_EXTENSIONS.some(ext => linkId.toLowerCase().endsWith(ext))) {
    notFound();
  }

  // Validação 2: Verifica se contém caracteres inválidos
  if (linkId.includes('.') || linkId.includes('/') || linkId.includes('\\')) {
    notFound();
  }

  // Validação 3: Verifica se parece ser um ID Convex válido
  if (!isValidConvexId(linkId)) {
    notFound();
  }

  try {
    // Converte para o tipo correto do Convex
    const typedLinkId = linkId as Id<"links">;

    // Busca os dados em paralelo
    const [analytics, linkDetails] = await Promise.all([
      fetchDetailedAnalyticsForLink(user.id, typedLinkId),
      fetchQuery(api.lib.links.getLinkById, { linkId: typedLinkId })
    ]);

    // Verifica se o link existe e pertence ao usuário
    if (!linkDetails || linkDetails.userId !== user.id) {
      notFound();
    }

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
      linkTitle: linkDetails.title || analytics.linkTitle,
      linkUrl: linkDetails.url || analytics.linkUrl,
    };

    return <LinkAnalytics analytics={finalAnalyticsData} />;
  } catch (error) {
    console.error('Error loading link analytics:', error);
    notFound();
  }
}