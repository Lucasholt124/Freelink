"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, BarChart3, Clock, ChevronRight, ArrowLeft } from "lucide-react";

// --- CORREÇÃO #1: Importamos a interface da nossa fonte da verdade ---
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

const formatUrl = (url: string) => { try { return new URL(url).hostname.replace("www.", "") } catch { return url } };

function PageHeader({ linkTitle, linkUrl }: { linkTitle: string, linkUrl: string }) {
    const router = useRouter();
    return (
        <header className="space-y-4">
            <nav className="flex items-center text-sm text-gray-500">
                <button onClick={() => router.back()} className="flex items-center gap-1 hover:text-gray-900 transition-colors"><ArrowLeft className="w-4 h-4" /> Voltar</button>
                <ChevronRight className="w-4 h-4 mx-2" />
                <Link href="/dashboard" className="hover:text-gray-900">Painel</Link>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span className="font-semibold text-gray-800 truncate">Análises</span>
            </nav>
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 truncate" title={linkTitle}>{linkTitle}</h1>
                <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 break-all">{formatUrl(linkUrl)}</a>
            </div>
        </header>
    );
}

function PeakHourCard({ peakHour }: { peakHour: number | null }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-lg flex items-center gap-6">
            <div className="p-4 bg-orange-100 rounded-xl"><Clock className="w-8 h-8 text-orange-600" /></div>
            <div>
                <h3 className="text-lg font-bold text-gray-800">Horário de Pico</h3>
                <p className="text-4xl font-bold text-orange-500">{peakHour !== null ? `${String(peakHour).padStart(2, '0')}:00` : "N/A"}</p>
                <p className="text-sm text-gray-500 mt-1">{peakHour !== null ? "Horário com o maior número de cliques." : "Dados insuficientes."}</p>
            </div>
        </div>
    );
}

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

  if (!isLoaded) { return <div className="p-8 text-center">Carregando dados...</div>; }
  if (!hasAnalyticsAccess) { return <UpgradeCallToAction />; }

  return (
    <div className="space-y-8">
      <PageHeader linkTitle={analytics.linkTitle} linkUrl={analytics.linkUrl} />
      {analytics.totalClicks === 0 ? <NoDataState /> : (
        <div className="space-y-8">
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard title="Total de cliques" value={analytics.totalClicks} />
            <MetricCard title="Visitantes Únicos" value={analytics.uniqueUsers} />
            <MetricCard title="Países Alcançados" value={analytics.countriesReached} />
          </section>
          {analytics.dailyData?.length > 0 && (
            <section><DailyPerformanceChart data={analytics.dailyData} /></section>
          )}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
              {analytics.countryData?.length > 0 && <CountryChart data={analytics.countryData} />}
              {hasUltraFeaturesAccess ? (
                <>
                  {analytics.regionData?.length > 0 && <RegionChart data={analytics.regionData} />}
                  {analytics.cityData?.length > 0 && <CityChart data={analytics.cityData} />}
                </>
              ) : (
                <div className="p-6 bg-white rounded-2xl border border-gray-200/80 shadow-lg">
                  <LockedFeatureCard title="Análise Geográfica Detalhada" icon={<MapPin className="w-8 h-8 text-gray-400"/>} requiredPlan="Ultra" description="Desbloqueie para ver os cliques por cidade e estado."/>
                </div>
              )}
            </div>
            <div className="space-y-8">
              {hasUltraFeaturesAccess ? (
                <>
                  <PeakHourCard peakHour={analytics.peakHour} />
                  {/* Agora o erro de tipo desaparece aqui */}
                  {analytics.hourlyData?.length > 0 && <HourlyChart data={analytics.hourlyData} />}
                </>
              ) : (
                <div className="p-6 bg-white rounded-2xl border border-gray-200/80 shadow-lg">
                  <LockedFeatureCard title="Análise de Horários" icon={<BarChart3 className="w-8 h-8 text-gray-400"/>} requiredPlan="Ultra" description="Descubra os horários de pico de engajamento da sua audiência."/>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}