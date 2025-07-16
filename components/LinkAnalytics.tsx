
import { LinkAnalyticsData } from "@/convex/lib/fetchLinkAnalytics";
import { auth } from "@clerk/nextjs/server";
import {
  Users,
  MousePointer,
  Globe,
  TrendingUp,
  ExternalLink,
  MapPin,
  ArrowLeft,
  BarChart3,
  Lock,
} from "lucide-react";
import Link from "next/link";

interface LinkAnalyticsProps {
  analytics: LinkAnalyticsData;
}



// Tipos auxiliares baseados no uso do objeto analytics
type DailyData = {
  date: string;
  clicks: number;
  uniqueUsers: number;
  countries: number;
};

type CountryData = {
  country: string;
  clicks: number;
  percentage: number;
};

const ADMIN_ID = "user_2zuoF42kpYWl095WqnSiP9eUcu3";
async function fetchUserPlanFromDB(userId: string): Promise<"free" | "pro" | "ultra"> {
  // Aqui você faz a consulta real no banco ou API para buscar o plano
  // Exemplo fictício:
  // const userRecord = await db.users.findUnique({ where: { id: userId } });
  // return userRecord?.subscriptionPlan || "free";

  // Para teste, vamos supor:
  if (userId === ADMIN_ID) return "ultra"; // admin tem ultra
  if (userId.endsWith("1")) return "pro"; // usuário terminado em 1 é pro
  return "free"; // padrão free
}

async function getUserSubscriptionPlan() {
  const { userId } = await auth();

  if (!userId) return { isPro: false, isUltra: false, isAdmin: false };

  const isAdmin = userId === ADMIN_ID;

  // Busca o plano real do usuário
  const userPlan = await fetchUserPlanFromDB(userId);

  const isPro = userPlan === "pro";
  const isUltra = userPlan === "ultra";

  return { isPro, isUltra, isAdmin };
}
async function LinkAnalytics({ analytics }: LinkAnalyticsProps) {
  const { isPro, isUltra, isAdmin } = await getUserSubscriptionPlan();

  // Define acessos
  const hasAnalyticsAccess = isPro || isUltra || isAdmin;
  const hasCountryAccess = isUltra || isAdmin;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      month: "short",
      day: "numeric",
    });
  };

  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  if (!hasAnalyticsAccess) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-2xl p-8 shadow-xl shadow-gray-200/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gray-400 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Análise de links
                </h2>
                <p className="text-gray-600">
                  🔒 Atualize para desbloquear insights poderosos
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4 text-gray-600">
                <MousePointer className="w-5 h-5" />
                <span>Acompanhe o total de cliques e engajamento</span>
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <Users className="w-5 h-5" />
                <span>Monitorar visitantes únicos</span>
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <Globe className="w-5 h-5" />
                <span>Veja distribuição geográfica</span>
              </div>
            </div>
            <div className="mt-8 bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-500">
                Obtenha insights detalhados sobre o desempenho do seu link com nossos planos Pro e Ultra
              </p>
              <Link
                href="/dashboard/billing"
                className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Atualize agora
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Cabeçalho com botão voltar */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl shadow-gray-200/50">
            <div className="flex items-center gap-4 mb-6">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Voltar ao painel</span>
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {analytics.linkTitle}
              </h1>
              <Link
                href={analytics.linkUrl}
                className="flex items-center gap-2 text-gray-600"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm">{formatUrl(analytics.linkUrl)}</span>
              </Link>
            </div>

            {/* Métricas resumidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total de cliques */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <MousePointer className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-blue-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">
                    Total de cliques
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {analytics.totalClicks.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Usuários Únicos */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500 rounded-xl">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-purple-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">
                    Usuários Únicos
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    {analytics.uniqueUsers.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Países Alcançados */}
              {hasCountryAccess ? (
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-500 rounded-xl">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-green-600">
                      <MapPin className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">
                      Países
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      {analytics.countriesReached.toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 opacity-75">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-500/50 rounded-xl">
                      <Globe className="w-6 h-6 text-white/75" />
                    </div>
                    <div className="text-green-600/75">
                      <Lock className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600/75 mb-1">
                      Países
                    </p>
                    <p className="text-3xl font-bold text-green-900/75">
                      Atualizar para Ultra
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de desempenho diário */}
      {analytics.dailyData.length > 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl shadow-gray-200/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-slate-500 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Desempenho diário
                  </h2>
                  <p className="text-gray-600">Atividade dos últimos 30 dias</p>
                </div>
              </div>

              {/* Representação simples de gráfico de barras */}
              <div className="space-y-4">
                {analytics.dailyData.slice(0, 10).map((day: DailyData) => {
                  const maxClicks = Math.max(
                    ...analytics.dailyData.map((d: DailyData) => d.clicks),
                  );
                  const width =
                    maxClicks > 0 ? (day.clicks / maxClicks) * 100 : 0;

                  return (
                    <div key={day.date} className="flex items-center gap-4">
                      <div className="w-16 text-sm text-gray-600 font-medium">
                        {formatDate(day.date)}
                      </div>
                      <div className="flex-1 relative">
                        <div className="bg-gray-200 rounded-full h-8 relative overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${width}%` }}
                          />
                          <div className="absolute inset-0 flex items-center px-3">
                            <span className="text-sm font-medium text-white">
                              {day.clicks} cliques
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{day.uniqueUsers}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          <span>{day.countries}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {analytics.dailyData.length > 10 && (
                <div className="mt-6 text-center">
                  <p className="text-gray-500 text-sm">
                    Exibindo os últimos 10 dias • {analytics.dailyData.length} dias total
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Análise de países */}
      {hasCountryAccess ? (
        analytics.countryData.length > 0 && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 mb-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl shadow-gray-200/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-green-500 rounded-xl">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Países
                    </h2>
                    <p className="text-gray-600">
                      Distribuição de cliques por país
                    </p>
                  </div>
                </div>

                {/* Lista de países */}
                <div className="space-y-3">
                  {analytics.countryData.map((country: CountryData) => {
                    const width = country.percentage || 0;

                    return (
                      <div
                        key={country.country}
                        className="flex items-center gap-4"
                      >
                        <div className="w-32 text-sm text-gray-900 font-medium truncate">
                          {country.country}
                        </div>
                        <div className="flex-1 relative">
                          <div className="bg-gray-200 rounded-full h-6 relative overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${width}%` }}
                            />
                            <div className="absolute inset-0 flex items-center px-3">
                              <span className="text-xs font-medium text-white">
                                {country.clicks} cliques
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="w-16 text-right">
                          <span className="text-sm font-medium text-gray-600">
                            {country.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {analytics.countryData.length >= 20 && (
                  <div className="mt-6 text-center">
                    <p className="text-gray-500 text-sm">
                      Mostrando os 20 principais países
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-2xl p-8 shadow-xl shadow-gray-200/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gray-400 rounded-xl">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Países
                  </h2>
                  <p className="text-gray-600">
                    🔒 Atualize para Ultra para desbloquear análises de países
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <div className="bg-gray-100 rounded-lg p-4 text-center w-full">
                  <p className="text-gray-500">
                    Este recurso está disponível apenas no plano Ultra
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nenhum estado de dados */}
      {analytics.dailyData.length === 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl shadow-gray-200/50 text-center">
              <div className="text-gray-400 mb-4">
                <BarChart3 className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum dado analítico ainda
              </h3>
              <p className="text-gray-600">
                As análises aparecerão aqui assim que este link começar a receber cliques.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LinkAnalytics;