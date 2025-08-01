"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // <-- IMPORTANTE: para o botão de voltar
import { MapPin, BarChart3, Clock, Map, ChevronRight, ArrowLeft } from "lucide-react";

// Importações dos seus componentes
import type { LinkAnalyticsData } from "@/convex/lib/fetchLinkAnalytics";
import { MetricCard } from "./MetricCard";
import { DailyPerformanceChart } from "./DailyPerformanceChart";
import { CountryChart } from "./CountryChart";
import { CityChart } from "./CityChart";
import { RegionChart } from "./RegionChart";
import { HourlyChart } from "./HourlyChart";
import { LockedFeatureCard } from "./LockedFeatureCard";
import { UpgradeCallToAction } from "./UpgradeCallToAction";
import { NoDataState } from "./NoDataState";

// Função auxiliar para formatar a URL (mantida como está)
const formatUrl = (url: string) => { try { return new URL(url).hostname.replace("www.", "") } catch { return url } };

// --- NOVO COMPONENTE DE CABEÇALHO ---
// Este componente encapsula toda a lógica do cabeçalho,
// incluindo o botão de voltar e os detalhes do link.
function PageHeader({ linkTitle, linkUrl }: { linkTitle: string, linkUrl: string }) {
    const router = useRouter();

    return (
        <header className="space-y-4">
            <nav className="flex items-center text-sm text-gray-500">
                {/* Botão de voltar funcional */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                </button>
                <ChevronRight className="w-4 h-4 mx-2" />
                <Link href="/dashboard" className="hover:text-gray-900">Painel</Link>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span className="font-semibold text-gray-800 truncate">Análises</span>
            </nav>
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 truncate" title={linkTitle}>
                    {linkTitle}
                </h1>
                <a
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-blue-600 break-all"
                >
                    {formatUrl(linkUrl)}
                </a>
            </div>
        </header>
    );
}


// --- COMPONENTE PRINCIPAL ATUALIZADO ---
export default function LinkAnalytics({ analytics }: { analytics: LinkAnalyticsData }) {
  const { user, isLoaded } = useUser();
  const [plan, setPlan] = useState<"free" | "pro" | "ultra">("free");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      const userPlan = (user.publicMetadata.subscriptionPlan as "free" | "pro" | "ultra") || "free";
      setPlan(userPlan);
      // Certifique-se de que o seu ID de admin está correto aqui
      setIsAdmin(user.id === "user_301NTkVsE3v48SXkoCEp0XOXifI");
    }
  }, [isLoaded, user]);

  const hasAnalyticsAccess = plan === "pro" || plan === "ultra" || isAdmin;
  const hasUltraFeaturesAccess = plan === "ultra" || isAdmin;

  if (!isLoaded) { return <div className="p-8 text-center">Carregando dados...</div>; }
  if (!hasAnalyticsAccess) { return <UpgradeCallToAction />; }

  return (
    <div className="space-y-6">
      {/* **MUDANÇA PRINCIPAL:** Usando o novo componente PageHeader */}
      <PageHeader linkTitle={analytics.linkTitle} linkUrl={analytics.linkUrl} />

      {analytics.totalClicks === 0 ? <NoDataState /> : (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard title="Total de cliques" value={analytics.totalClicks} />
            <MetricCard title="Visitantes Únicos" value={analytics.uniqueUsers} />
            <MetricCard title="Países Alcançados" value={analytics.countriesReached} />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {analytics.dailyData && analytics.dailyData.length > 0 && <DailyPerformanceChart data={analytics.dailyData} />}
            {analytics.countryData && analytics.countryData.length > 0 && <CountryChart data={analytics.countryData} />}

            {hasUltraFeaturesAccess ? (
              <>
                {analytics.cityData && analytics.cityData.length > 0 && <CityChart data={analytics.cityData} />}
                {analytics.regionData && analytics.regionData.length > 0 && <RegionChart data={analytics.regionData} />}
                {analytics.hourlyData && analytics.hourlyData.length > 0 && <HourlyChart data={analytics.hourlyData} />}

                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-lg flex items-center gap-6">
                  <div className="p-4 bg-orange-100 rounded-xl"><Clock className="w-8 h-8 text-orange-600" /></div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Horário de Pico</h3>
                    <p className="text-4xl font-bold text-orange-500">{analytics.peakHour !== null ? `${String(analytics.peakHour).padStart(2, '0')}:00` : "N/A"}</p>
                    <p className="text-sm text-gray-500 mt-1">{analytics.peakHour !== null ? "Horário com o maior número de cliques." : "Dados insuficientes."}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <LockedFeatureCard title="Análise por Cidade" icon={<MapPin className="w-6 h-6 text-gray-600"/>} requiredPlan="Ultra" />
                <LockedFeatureCard title="Análise por Estado" icon={<Map className="w-6 h-6 text-gray-600"/>} requiredPlan="Ultra" />
                <LockedFeatureCard title="Análise de Horários" icon={<BarChart3 className="w-6 h-6 text-gray-600"/>} requiredPlan="Ultra" />
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}