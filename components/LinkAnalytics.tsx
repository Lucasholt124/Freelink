
"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import {  MapPin, BarChart3, Clock, Map, ChevronRight } from "lucide-react";

import type { LinkAnalyticsData } from "@/convex/lib/fetchLinkAnalytics";

// Importa TODOS os componentes de UI que você criou
import { MetricCard } from "./MetricCard";
import { DailyPerformanceChart } from "./DailyPerformanceChart";
import { CountryChart } from "./CountryChart";
import { CityChart } from "./CityChart";
import { RegionChart } from "./RegionChart";
import { HourlyChart } from "./HourlyChart";
import { LockedFeatureCard } from "./LockedFeatureCard";
import { UpgradeCallToAction } from "./UpgradeCallToAction";
import { NoDataState } from "./NoDataState";

interface LinkAnalyticsProps {
  analytics: LinkAnalyticsData;
}

const formatUrl = (url: string) => { try { return new URL(url).hostname.replace("www.", "") } catch { return url } };

export default function LinkAnalytics({ analytics }: LinkAnalyticsProps) {
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

  // ESTADO DE CARREGAMENTO
  if (!isLoaded) {
    // Aqui você pode usar seu componente SkeletonDashboard se quiser
    return <div className="p-8 text-center">Carregando dados...</div>;
  }

  // ESTADO DE ACESSO NEGADO
  if (!hasAnalyticsAccess) {
    return <UpgradeCallToAction />;
  }

  // ESTADO DE NENHUM DADO ENCONTRADO
  // Este estado agora é mais robusto e inclui o breadcrumb
  if (analytics.totalClicks === 0) {
    return (
      <div className="p-4 md:p-8 space-y-4 max-w-7xl mx-auto">
        <Breadcrumb linkTitle={analytics.linkTitle} />
        <NoDataState />
      </div>
    );
  }

  // ESTADO PRINCIPAL: PÁGINA COM DADOS
  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* HEADER E BREADCRUMB CORRIGIDOS */}
      <Breadcrumb linkTitle={analytics.linkTitle} />
      <div className="pt-2">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 truncate">{analytics.linkTitle}</h1>
        <a href={analytics.linkUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 break-all">{formatUrl(analytics.linkUrl)}</a>
      </div>

      {/* SEÇÕES DE ANÁLISE */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard title="Total de cliques" value={analytics.totalClicks} />
        <MetricCard title="Visitantes Únicos" value={analytics.uniqueUsers} />
        <MetricCard title="Países Alcançados" value={analytics.countriesReached} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DailyPerformanceChart data={analytics.dailyData} />
        <CountryChart data={analytics.countryData} />

        {hasUltraFeaturesAccess ? (
          <>
            <CityChart data={analytics.cityData} />
            <RegionChart data={analytics.regionData} />
            <HourlyChart data={analytics.hourlyData} />

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
    </div>
  );
}

// NOVO SUB-COMPONENTE PARA O BREADCRUMB
function Breadcrumb({ linkTitle }: { linkTitle: string }) {
    return (
        <nav className="flex items-center text-sm text-gray-500">
            <Link href="/dashboard" className="hover:text-gray-900">
                Painel
            </Link>
            <ChevronRight className="w-4 h-4 mx-1" />
            <span className="font-semibold text-gray-800 truncate">
                Análises: {linkTitle}
            </span>
        </nav>
    );
}