// ===================================================================================
// ARQUIVO FINAL, COMPLETO E CORRETO: components/LinkAnalytics.tsx
// CORREÇÃO: AGORA ELE USA OS COMPONENTES QUE VOCÊ CRIOU
// ===================================================================================

"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, BarChart3 } from "lucide-react";

import type { LinkAnalyticsData } from "@/convex/lib/fetchLinkAnalytics";

import { MetricCard } from "./MetricCard";
import { DailyPerformanceChart } from "./DailyPerformanceChart";
import { CountryChart } from "./CountryChart";
import { CityChart } from "./CityChart";
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

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-[50vh]"><p>Carregando permissões...</p></div>;
  }

  if (!hasAnalyticsAccess) {
    return <UpgradeCallToAction />;
  }

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-50 min-h-screen">
      <header className="max-w-7xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"><ArrowLeft className="w-5 h-5" /><span className="font-medium">Voltar</span></Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">{analytics.linkTitle}</h1>
        <a href={analytics.linkUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-blue-600 break-all">{formatUrl(analytics.linkUrl)}</a>
      </header>

      {analytics.totalClicks === 0 ? (
        <NoDataState />
      ) : (
        <main className="max-w-7xl mx-auto space-y-8">
          {/* USANDO O COMPONENTE METRIC CARD */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard title="Total de cliques" value={analytics.totalClicks} />
            <MetricCard title="Visitantes Únicos" value={analytics.uniqueUsers} />
            <MetricCard title="Países Alcançados" value={analytics.countriesReached} />
          </section>

          {/* USANDO OS COMPONENTES DE GRÁFICOS */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DailyPerformanceChart data={analytics.dailyData} />
            <CountryChart data={analytics.countryData} />

            {/* LÓGICA CORRETA PARA MOSTRAR/BLOQUEAR FEATURES ULTRA */}
            {hasUltraFeaturesAccess ? (
              <CityChart data={analytics.cityData} />
            ) : (
              <LockedFeatureCard title="Análise por Cidade" icon={<MapPin className="w-6 h-6 text-gray-600"/>} requiredPlan="Ultra" />
            )}

            {hasUltraFeaturesAccess ? (
              <HourlyChart data={analytics.hourlyData} />
            ) : (
              <LockedFeatureCard title="Análise de Horários" icon={<BarChart3 className="w-6 h-6 text-gray-600"/>} requiredPlan="Ultra" />
            )}
          </section>
        </main>
      )}
    </div>
  );
}