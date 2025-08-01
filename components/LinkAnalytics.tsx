
"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, BarChart3, Clock, Map } from "lucide-react";

import type { LinkAnalyticsData } from "@/convex/lib/fetchLinkAnalytics";

// Importa TODOS os componentes de UI
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

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-[50vh]"><p>Carregando permissões...</p></div>;
  }

  if (!hasAnalyticsAccess) {
    return <UpgradeCallToAction />;
  }

  // Tratamento para o caso de a página container passar um objeto "vazio"
  if (analytics.totalClicks === 0) {
    return (
        <div className="p-4 md:p-8 space-y-8 bg-gray-50 min-h-screen">
            <header className="max-w-7xl mx-auto">
                <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Voltar</span>
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">{analytics.linkTitle}</h1>
            </header>
            <NoDataState />
        </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-50 min-h-screen">
      <header className="max-w-7xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"><ArrowLeft className="w-5 h-5" /><span className="font-medium">Voltar</span></Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">{analytics.linkTitle}</h1>
        <a href={analytics.linkUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-blue-600 break-all">{formatUrl(analytics.linkUrl)}</a>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
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
      </main>
    </div>
  );
}