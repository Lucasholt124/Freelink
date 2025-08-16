"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  BarChart3,
  Clock,
  ChevronRight,
  ArrowLeft,
  Globe2,
  Users2,
  MousePointerClick,
  Activity,
} from "lucide-react";

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

const formatUrl = (url: string) => {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
};

// --- Cabeçalho Ultra Moderno ---
function PageHeader({ linkTitle, linkUrl }: { linkTitle: string; linkUrl: string }) {
  const router = useRouter();

  return (
    <header className="relative overflow-hidden">
      {/* Background gradient animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-blue-100/20 to-pink-100/20 animate-gradient-xy" />

      <div className="relative space-y-6">
        {/* Navegação elegante */}
        <nav className="flex items-center text-sm">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Voltar</span>
          </button>
        </nav>

        {/* Título e URL com design premium */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent">
                {linkTitle}
              </h1>
              <a
                href={linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors group"
              >
                <Globe2 className="w-4 h-4" />
                <span className="font-medium">{formatUrl(linkUrl)}</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </a>
            </div>

            {/* Badge de status */}
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
              <Activity className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-semibold">Ao vivo</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// --- Card de Horário de Pico Reimaginado ---
function PeakHourCard({ peakHour }: { peakHour: number | null }) {
  return (
    <div className="group relative bg-gradient-to-br from-orange-500 to-pink-500 p-[2px] rounded-3xl hover:shadow-2xl transition-all duration-500">
      <div className="relative bg-white rounded-3xl p-8 h-full">
        {/* Ícone flutuante */}
        <div className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
          <Clock className="w-8 h-8 text-white" />
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800">Horário de Pico</h3>

          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              {peakHour !== null ? `${String(peakHour).padStart(2, "0")}:00` : "--:--"}
            </span>
          </div>

          <p className="text-sm text-gray-600">
            {peakHour !== null
              ? "Momento de maior engajamento"
              : "Aguardando dados"}
          </p>

          {/* Indicador visual */}
          <div className="flex gap-1">
            {Array.from({ length: 24 }, (_, i) => (
              <div
                key={i}
                className={`h-8 flex-1 rounded-full transition-all duration-300 ${
                  i === peakHour
                    ? "bg-gradient-to-t from-orange-500 to-pink-500"
                    : "bg-gray-100"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Componente Principal Revolucionado ---
export default function LinkAnalytics({ analytics }: { analytics: LinkAnalyticsData }) {
  const { user, isLoaded } = useUser();
  const [plan, setPlan] = useState<"free" | "pro" | "ultra">("free");
  const [isAdmin, setIsAdmin] = useState(false);


  useEffect(() => {
    if (isLoaded && user) {
      const userPlan = (user.publicMetadata.subscriptionPlan as "free" | "pro" | "ultra") || "free";
      setPlan(userPlan);
      setIsAdmin(user.id === "user_301NTkVsE3v48SXkoCEp0XOXifI");
    }
  }, [isLoaded, user]);

  const hasAnalyticsAccess = plan === "pro" || plan === "ultra" || isAdmin;
  const hasUltraFeaturesAccess = plan === "ultra" || isAdmin;

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-spin" />
          <div className="absolute inset-0 w-20 h-20 border-4 border-purple-600 rounded-full animate-spin border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!hasAnalyticsAccess) {
    return <UpgradeCallToAction />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-12">
        <PageHeader linkTitle={analytics.linkTitle} linkUrl={analytics.linkUrl} />

        {analytics.totalClicks === 0 ? (
          <NoDataState />
        ) : (
          <div className="space-y-12">
            {/* Métricas Principais com Design Futurista */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Total de cliques"
                value={analytics.totalClicks}
                trend={12.5}
                icon={<MousePointerClick className="w-6 h-6" />}
                color="blue"
              />
              <MetricCard
                title="Visitantes Únicos"
                value={analytics.uniqueUsers}
                trend={8.3}
                icon={<Users2 className="w-6 h-6" />}
                color="purple"
              />
              <MetricCard
                title="Países Alcançados"
                value={analytics.countriesReached}
                trend={15.7}
                icon={<Globe2 className="w-6 h-6" />}
                color="green"
              />
            </section>

            {/* Gráfico de Performance com Animações */}
            {analytics.dailyData?.length > 0 && (
              <section className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-3xl blur-xl opacity-50" />
                <div className="relative">
                  <DailyPerformanceChart data={analytics.dailyData} />
                </div>
              </section>
            )}

            {/* Dashboard Grid Moderno */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Coluna Principal */}
              <div className="lg:col-span-2 space-y-8">
                {/* Mapa de Países */}
                {analytics.countryData?.length > 0 && (
                  <div className="group hover:scale-[1.02] transition-transform duration-300">
                    <CountryChart data={analytics.countryData} />
                  </div>
                )}

                {/* Features Premium */}
                {hasUltraFeaturesAccess ? (
                  <div className="space-y-8">
                    {analytics.regionData?.length > 0 && (
                      <div className="group hover:scale-[1.02] transition-transform duration-300">
                        <RegionChart data={analytics.regionData} />
                      </div>
                    )}
                    {analytics.cityData?.length > 0 && (
                      <div className="group hover:scale-[1.02] transition-transform duration-300">
                        <CityChart data={analytics.cityData} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-purple-200">
                      <LockedFeatureCard
                        title="Análise Geográfica Premium"
                        icon={<MapPin className="w-10 h-10" />}
                        requiredPlan="Ultra"
                        description="Desbloqueie insights detalhados por cidade e estado"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Coluna Lateral */}
              <div className="space-y-8">
                {hasUltraFeaturesAccess ? (
                  <>
                    <PeakHourCard peakHour={analytics.peakHour} />
                    {analytics.hourlyData?.length > 0 && (
                      <div className="group hover:scale-[1.02] transition-transform duration-300">
                        <HourlyChart data={analytics.hourlyData} />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-orange-200">
                      <LockedFeatureCard
                        title="Análise Temporal Avançada"
                        icon={<BarChart3 className="w-10 h-10" />}
                        requiredPlan="Ultra"
                        description="Descubra os melhores horários para engajamento"
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}