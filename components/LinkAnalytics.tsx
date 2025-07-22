import { LinkAnalyticsData } from "@/convex/lib/fetchLinkAnalytics";
import clerkClient from "@clerk/clerk-sdk-node";
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

const ADMIN_ID = "user_301NTkVsE3v48SXkoCEp0XOXifI";

async function fetchUserPlanFromDB(userId: string): Promise<"free" | "pro" | "ultra"> {
  if (userId === ADMIN_ID) return "ultra";
  try {
    const user = await clerkClient.users.getUser(userId);
    const plan = user.publicMetadata.subscriptionPlan as
      | "free"
      | "pro"
      | "ultra"
      | undefined;
    if (plan === "free" || plan === "pro" || plan === "ultra") {
      return plan;
    }
    return "free";
  } catch (error) {
    console.error("Erro ao buscar plano no Clerk:", error);
    return "free";
  }
}

async function getUserSubscriptionPlan() {
  const { userId } = await auth();
  if (!userId) return { isPro: false, isUltra: false, isAdmin: false };
  const isAdmin = userId === ADMIN_ID;
  const userPlan = await fetchUserPlanFromDB(userId);
  return {
    isPro: userPlan === "pro",
    isUltra: userPlan === "ultra",
    isAdmin,
  };
}

function getDayPeriod(dateString: string) {
  const date = new Date(dateString);
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Manhã";
  if (hour >= 12 && hour < 18) return "Tarde";
  return "Noite";
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })} ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
};

const formatUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace("www.", "");
  } catch {
    return url;
  }
};

export default async function LinkAnalytics({ analytics }: LinkAnalyticsProps) {
  const { isPro, isUltra, isAdmin } = await getUserSubscriptionPlan();

  const hasAnalyticsAccess = isPro || isUltra || isAdmin;
  const hasCountryAccess = isUltra || isAdmin;

  // Horário de pico real (timestamp do backend ou dia de maior movimento)
  // Se vier do backend, use, senão calcule o dia de maior clique
  let peakClickTime = analytics.peakClickTime;
  if (!peakClickTime && analytics.dailyData.length > 0) {
    // Pega o dia com mais cliques
    const peakDay = analytics.dailyData.reduce((max, day) => day.clicks > max.clicks ? day : max, analytics.dailyData[0]);
    peakClickTime = peakDay.date;
  }

  const maxClicks = analytics.dailyData.length > 0
    ? Math.max(...analytics.dailyData.map(d => d.clicks))
    : 0;

  const topLinkTitle = analytics.linkTitle || "Nenhum link mais clicado ainda.";

  const countryDataToShow = analytics.countryData.length > 0
    ? analytics.countryData.map((c) => ({
        ...c,
        country: c.country === "Desconhecido" || c.country === "Unknown" ? "Brasil" : c.country,
      }))
    : analytics.countriesReached > 0
      ? [{ country: "Brasil", clicks: analytics.totalClicks, percentage: 100 }]
      : [];

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
                <h2 className="text-2xl font-bold text-gray-900">Análise de links</h2>
                <p className="text-gray-600">🔒 Atualize para desbloquear insights poderosos</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{analytics.linkTitle}</h1>
              <Link href={analytics.linkUrl} className="flex items-center gap-2 text-gray-600">
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
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Total de cliques</p>
                  <p className="text-3xl font-bold text-blue-900">{analytics.totalClicks.toLocaleString()}</p>
                </div>
              </div>

              {/* Usuários Únicos */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500 rounded-xl">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">Usuários Únicos</p>
                  <p className="text-3xl font-bold text-purple-900">{analytics.uniqueUsers.toLocaleString()}</p>
                </div>
              </div>

              {/* Países Alcançados */}
              {hasCountryAccess ? (
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-500 rounded-xl">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">Países</p>
                    <p className="text-3xl font-bold text-green-900">{analytics.countriesReached.toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 opacity-75 flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-6 h-6 text-green-600/75" />
                    <Lock className="w-5 h-5 text-green-600/75" />
                  </div>
                  <p className="text-green-600/75 font-medium">Países</p>
                  <p className="text-green-900/75">Disponível só no Ultra</p>
                </div>
              )}
            </div>

            {/* PRO: Desempenho diário (atividade dos últimos 30 dias) */}
            {isPro && (
              <div className="mt-8">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 mb-8">
                  <div className="max-w-7xl mx-auto">
                    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl shadow-gray-200/50">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-slate-500 rounded-xl">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">Desempenho diário</h2>
                          <p className="text-gray-600">Atividade dos últimos 30 dias</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {analytics.dailyData.slice(0, 10).map((day) => {
                          const width = maxClicks > 0 ? (day.clicks / maxClicks) * 100 : 0;
                          return (
                            <div key={day.date} className="flex items-center gap-4">
                              <div className="w-16 text-sm text-gray-600 font-medium">{formatDate(day.date)}</div>
                              <div className="flex-1 relative">
                                <div className="bg-gray-200 rounded-full h-8 relative overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-700"
                                    style={{ width: `${width}%`, minWidth: 8 }}
                                  />
                                  <div className="absolute inset-0 flex items-center px-3">
                                    <span className="text-sm font-medium text-white">{day.clicks} cliques</span>
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
                {/* Gráficos detalhados e horário de pico bloqueados */}
                <div className="flex flex-col gap-6">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200 opacity-75 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-5 h-5 text-orange-600/75" />
                      <Lock className="w-5 h-5 text-orange-600/75" />
                    </div>
                    <p className="text-orange-600/75 font-medium">Horário de pico</p>
                    <p className="text-orange-900/75">Disponível só no Ultra</p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200 opacity-75 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-5 h-5 text-indigo-600/75" />
                      <Lock className="w-5 h-5 text-indigo-600/75" />
                    </div>
                    <p className="text-indigo-600/75 font-medium">Gráfico de cliques por dia detalhado</p>
                    <p className="text-indigo-900/75">Disponível só no Ultra</p>
                  </div>
                </div>
              </div>
            )}

            {/* ULTRA/ADMIN: GRÁFICOS E HORÁRIO DE PICO LIBERADOS */}
            {(isUltra || isAdmin) && (
              <div className="mt-8 flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200">
                    <h3 className="text-lg font-bold text-indigo-900 mb-2 flex items-center gap-2">
                      <ExternalLink className="w-5 h-5" /> Link Mais Clicado
                    </h3>
                    <p className="text-indigo-700 text-base">
                      {topLinkTitle}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
                    <h3 className="text-lg font-bold text-orange-900 mb-2 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" /> Horário de pico
                    </h3>
                    <p className="text-orange-700 text-base">
                      {peakClickTime
                        ? `${formatDateTime(peakClickTime)} (${getDayPeriod(peakClickTime)})`
                        : "Ainda não há cliques suficientes para calcular o horário de pico."}
                    </p>
                  </div>
                </div>
                {/* Gráfico de barras por dia detalhado */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" /> Gráfico de cliques por dia
                  </h3>
                  {analytics.dailyData.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      Nenhum dado de horário disponível ainda.
                    </div>
                  ) : (
                    <div className="flex gap-2 items-end h-32 overflow-x-auto">
                      {analytics.dailyData.map((h) => {
                        const height = maxClicks > 0 ? (h.clicks / maxClicks) * 100 : 0;
                        return (
                          <div
                            key={h.date}
                            className="flex flex-col items-center min-w-[40px] transition-all duration-700"
                          >
                            <div
                              className={`rounded-t w-6 ${h.clicks === maxClicks ? "bg-indigo-700" : "bg-indigo-500"}`}
                              style={{
                                height: `${height}%`,
                                minHeight: "8px",
                                transition: "height 0.7s cubic-bezier(0.4,0,0.2,1)",
                              }}
                            />
                            <span className="text-xs mt-1">{formatDate(h.date)}</span>
                            <span className="text-xs text-gray-500">{h.clicks} cliques</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gráfico de países (sempre visível para Ultra/Admin, mesmo se vazio) */}
      {hasCountryAccess && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-8 mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl shadow-gray-200/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-500 rounded-xl">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Países</h2>
                  <p className="text-gray-600">Distribuição de cliques por país</p>
                </div>
              </div>
              {countryDataToShow.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Nenhum dado de país disponível ainda.
                </div>
              ) : (
                <div className="space-y-3">
                  {countryDataToShow.map((country) => {
                    const width = country.percentage || 0;
                    return (
                      <div key={country.country} className="flex items-center gap-4">
                        <div className="w-32 text-sm text-gray-900 font-medium truncate">{country.country}</div>
                        <div className="flex-1 relative">
                          <div className="bg-gray-200 rounded-full h-6 relative overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${width}%` }}
                            />
                            <div className="absolute inset-0 flex items-center px-3">
                              <span className="text-xs font-medium text-white">{country.clicks} cliques</span>
                            </div>
                          </div>
                        </div>
                        <div className="w-16 text-right">
                          <span className="text-sm font-medium text-gray-600">{country.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum dado analítico ainda</h3>
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