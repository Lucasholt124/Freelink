"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin, BarChart3, Clock, ChevronRight, ArrowLeft, MousePointer,
  Users, Globe, TrendingUp, Eye, Smartphone, Monitor, Tablet,
   Activity,  Share2, Timer, Target,
  Zap,  RefreshCw, ExternalLink, Wifi, Signal
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

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};

// --- Cabeçalho da Página ---
function PageHeader({ linkTitle, linkUrl }: { linkTitle: string; linkUrl: string }) {
  const router = useRouter();
  return (
    <header className="space-y-4">
      <nav className="flex items-center text-sm text-gray-500 select-none">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <ChevronRight className="w-4 h-4 mx-2" aria-hidden="true" />
        <Link
          href="/dashboard"
          className="hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
        >
          Painel
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" aria-hidden="true" />
        <span className="font-semibold text-gray-800 truncate">{`Análises`}</span>
      </nav>
      <div>
        <h1
          className="text-3xl md:text-4xl font-bold text-gray-900 truncate"
          title={linkTitle}
        >
          {linkTitle}
        </h1>
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-blue-600 break-all transition-colors"
          aria-label={`Abrir link ${formatUrl(linkUrl)} em nova aba`}
        >
          {formatUrl(linkUrl)}
        </a>
      </div>
    </header>
  );
}

// --- Card de Taxa de Conversão ---
function ConversionRateCard({ rate, trend }: { rate: number; trend: number }) {
  const isPositive = trend >= 0;
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-xl">
            <Target className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">Taxa de Conversão</h3>
            <p className="text-2xl font-bold text-gray-900">{formatPercentage(rate)}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className={`w-4 h-4 ${!isPositive && 'rotate-180'}`} />
          <span>{Math.abs(trend)}%</span>
        </div>
      </div>
    </div>
  );
}

// --- Card de Taxa de Rejeição ---
function BounceRateCard({ rate, avgTime }: { rate: number; avgTime: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-yellow-100 rounded-xl">
          <RefreshCw className="w-6 h-6 text-yellow-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600">Taxa de Rejeição</h3>
          <p className="text-2xl font-bold text-gray-900">{formatPercentage(rate)}</p>
          <p className="text-xs text-gray-500 mt-1">Tempo médio: {avgTime}</p>
        </div>
      </div>
    </div>
  );
}

// --- Card de Dispositivos ---
function DevicesCard({ devices }: { devices: { desktop: number; mobile: number; tablet: number } }) {
  const total = devices.desktop + devices.mobile + devices.tablet;
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Dispositivos</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Desktop</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">{formatPercentage((devices.desktop / total) * 100)}</span>
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `${(devices.desktop / total) * 100}%` }} />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Mobile</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">{formatPercentage((devices.mobile / total) * 100)}</span>
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500" style={{ width: `${(devices.mobile / total) * 100}%` }} />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tablet className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Tablet</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">{formatPercentage((devices.tablet / total) * 100)}</span>
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${(devices.tablet / total) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Card de Fontes de Tráfego ---
function TrafficSourcesCard({ sources }: { sources: Array<{ name: string; clicks: number; icon: string }> }) {
  const total = sources.reduce((acc, source) => acc + source.clicks, 0);

  const getIcon = (icon: string) => {
    switch(icon) {
      case 'direct': return <ExternalLink className="w-4 h-4" />;
      case 'social': return <Share2 className="w-4 h-4" />;
      case 'search': return <Globe className="w-4 h-4" />;
      default: return <Wifi className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Fontes de Tráfego</h3>
      <div className="space-y-3">
        {sources.map((source, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getIcon(source.icon)}
              <span className="text-sm text-gray-600">{source.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{formatNumber(source.clicks)}</span>
              <span className="text-xs text-gray-500">({formatPercentage((source.clicks / total) * 100)})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Card de Performance por Hora ---
function HourlyPerformanceCard({ data }: { data: Array<{ hour_of_day: number; total_clicks: number }> }) {
  // Encontrar o horário de pico
  const maxClicks = Math.max(...data.map(item => item.total_clicks));

  // Criar array completo de 24 horas
  const fullDayData = Array.from({ length: 24 }, (_, hour) => {
    const hourData = data.find(d => d.hour_of_day === hour);
    return {
      hour: `${hour.toString().padStart(2, '0')}h`,
      clicks: hourData?.total_clicks || 0,
      peak: hourData?.total_clicks === maxClicks
    };
  });

  // Mostrar apenas algumas horas representativas (0h, 4h, 8h, 12h, 16h, 20h)
  const representativeHours = fullDayData.filter((_, index) => index % 4 === 0);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance por Hora</h3>
      <div className="grid grid-cols-6 gap-1">
        {representativeHours.map((item, index) => (
          <div
            key={index}
            className={`p-2 rounded text-center ${
              item.peak ? 'bg-purple-500 text-white' : 'bg-gray-100'
            }`}
          >
            <div className="text-xs font-medium">{item.hour}</div>
            <div className="text-xs">{item.clicks}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


// --- Card de Últimas Atividades ---
function RecentActivityCard({ activities }: { activities: Array<{ time: string; action: string; location: string }> }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Atividade Recente</h3>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
            <div className="p-1.5 bg-blue-100 rounded-full">
              <Activity className="w-3 h-3 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800">{activity.action}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{activity.time}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">{activity.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Card de Velocidade de Carregamento ---
function PerformanceMetricsCard({ metrics }: { metrics: { loadTime: number; responseTime: number; uptime: number } }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Métricas de Performance</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-600">Tempo de Carregamento</span>
          </div>
          <span className="text-sm font-bold text-gray-900">{metrics.loadTime}ms</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">Tempo de Resposta</span>
          </div>
          <span className="text-sm font-bold text-gray-900">{metrics.responseTime}ms</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Signal className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-600">Uptime</span>
          </div>
          <span className="text-sm font-bold text-gray-900">{formatPercentage(metrics.uptime)}</span>
        </div>
      </div>
    </div>
  );
}

// --- Card de Comparação com Período Anterior ---
function ComparisonCard({ current, previous, metric }: { current: number; previous: number; metric: string }) {
  const change = ((current - previous) / previous) * 100;
  const isPositive = change >= 0;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{metric}</h3>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{formatNumber(current)}</p>
          <p className="text-sm text-gray-500 mt-1">vs {formatNumber(previous)} anterior</p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
          isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          <TrendingUp className={`w-4 h-4 ${!isPositive && 'rotate-180'}`} />
          <span className="text-sm font-semibold">{formatPercentage(Math.abs(change))}</span>
        </div>
      </div>
    </div>
  );
}

// --- Card de Engajamento ---
function EngagementCard({ metrics }: { metrics: { avgTimeOnPage: string; pagesPerSession: number; returnRate: number } }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Métricas de Engajamento</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-xs text-gray-600">Tempo Médio</p>
          <p className="text-lg font-bold">{metrics.avgTimeOnPage}</p>
        </div>
        <div className="text-center">
          <Eye className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <p className="text-xs text-gray-600">Páginas/Sessão</p>
          <p className="text-lg font-bold">{metrics.pagesPerSession}</p>
        </div>
        <div className="text-center">
          <Users className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-xs text-gray-600">Taxa de Retorno</p>
          <p className="text-lg font-bold">{formatPercentage(metrics.returnRate)}</p>
        </div>
      </div>
    </div>
  );
}

// --- Card de Horário de Pico ---
function PeakHourCard({ peakHour }: { peakHour: number | null }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md flex items-center gap-6">
      <div className="p-4 bg-orange-100 rounded-xl">
        <Clock className="w-8 h-8 text-orange-600" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-800">Horário de Pico</h3>
        <p className="text-4xl font-extrabold text-orange-500">
          {peakHour !== null ? `${String(peakHour).padStart(2, "0")}:00` : "N/A"}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {peakHour !== null
            ? "Horário com o maior número de cliques."
            : "Dados insuficientes."}
        </p>
      </div>
    </div>
  );
}

// --- Componente Principal ---
export default function LinkAnalytics({
  analytics,
}: {
  analytics: LinkAnalyticsData;
}) {
  const { user, isLoaded } = useUser();
  const [plan, setPlan] = useState<"free" | "pro" | "ultra">("free");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      const userPlan =
        (user.publicMetadata.subscriptionPlan as "free" | "pro" | "ultra") ||
        "free";
      setPlan(userPlan);
      setIsAdmin(user.id === "user_301NTkVsE3v48SXkoCEp0XOXifI");
    }
  }, [isLoaded, user]);

  const hasAnalyticsAccess = plan === "pro" || plan === "ultra" || isAdmin;
  const hasUltraFeaturesAccess = plan === "ultra" || isAdmin;

  // Mock data para demonstração - substitua com dados reais do backend
  const mockData = {
    conversionRate: 3.5,
    conversionTrend: 0.8,
    bounceRate: 45.2,
    avgSessionTime: "2m 45s",
    devices: { desktop: 450, mobile: 320, tablet: 80 },
    trafficSources: [
      { name: "Direto", clicks: 420, icon: "direct" },
      { name: "Social Media", clicks: 280, icon: "social" },
      { name: "Pesquisa", clicks: 150, icon: "search" }
    ],
    recentActivities: [
      { time: "Há 2 min", action: "Clique no link", location: "São Paulo, BR" },
      { time: "Há 5 min", action: "Clique no link", location: "Rio de Janeiro, BR" },
      { time: "Há 12 min", action: "Clique no link", location: "Lisboa, PT" }
    ],
    performanceMetrics: { loadTime: 245, responseTime: 89, uptime: 99.9 },
    engagement: { avgTimeOnPage: "3m 12s", pagesPerSession: 2.4, returnRate: 28.5 },
    hourlyData: [
      { hour: "00h", clicks: 12, peak: false },
      { hour: "04h", clicks: 5, peak: false },
      { hour: "08h", clicks: 45, peak: false },
      { hour: "12h", clicks: 78, peak: true },
      { hour: "16h", clicks: 62, peak: false },
      { hour: "20h", clicks: 54, peak: false }
    ],
    comparison: { current: 850, previous: 720 }
  };

  if (!isLoaded) {
    return (
      <div className="p-8 text-center text-gray-600 animate-pulse">
        Carregando dados...
      </div>
    );
  }

  if (!hasAnalyticsAccess) {
    return <UpgradeCallToAction />;
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <PageHeader linkTitle={analytics.linkTitle} linkUrl={analytics.linkUrl} />

      {analytics.totalClicks === 0 ? (
        <NoDataState />
      ) : (
        <div className="space-y-10">
          {/* Métricas principais */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total de cliques"
              value={analytics.totalClicks}
              icon={<MousePointer className="w-6 h-6" />}
              color="blue"
            />
            <MetricCard
              title="Visitantes Únicos"
              value={analytics.uniqueUsers}
              icon={<Users className="w-6 h-6" />}
              color="purple"
            />
            <MetricCard
              title="Países Alcançados"
              value={analytics.countriesReached}
              icon={<Globe className="w-6 h-6" />}
              color="green"
            />
            <ComparisonCard
              current={mockData.comparison.current}
              previous={mockData.comparison.previous}
              metric="Crescimento Mensal"
            />
          </section>

          {/* Cards de Performance e Conversão */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ConversionRateCard
              rate={mockData.conversionRate}
              trend={mockData.conversionTrend}
            />
            <BounceRateCard
              rate={mockData.bounceRate}
              avgTime={mockData.avgSessionTime}
            />
            <EngagementCard metrics={mockData.engagement} />
          </section>

          {/* Gráfico de tendência diária */}
          {analytics.dailyData?.length > 0 && (
            <section>
              <DailyPerformanceChart data={analytics.dailyData} />
            </section>
          )}

          {/* Análises detalhadas - 3 colunas */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna 1: Dispositivos e Fontes */}
            <div className="space-y-6">
              <DevicesCard devices={mockData.devices} />
              <TrafficSourcesCard sources={mockData.trafficSources} />
              <PerformanceMetricsCard metrics={mockData.performanceMetrics} />
            </div>

            {/* Coluna 2: Geografia e Horários */}
            <div className="space-y-6">
              {analytics.countryData?.length > 0 && (
                <CountryChart data={analytics.countryData} />
              )}

              {hasUltraFeaturesAccess ? (
                <>
                  <PeakHourCard peakHour={analytics.peakHour} />
                  <HourlyPerformanceCard data={analytics.hourlyData} />
                  {analytics.hourlyData?.length > 0 && (
                    <HourlyChart data={analytics.hourlyData} />
                  )}
                </>
              ) : (
                <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-md">
                  <LockedFeatureCard
                    title="Análise de Horários"
                    icon={<BarChart3 className="w-8 h-8 text-gray-400" />}
                    requiredPlan="Ultra"
                    description="Descubra os horários de pico de engajamento."
                  />
                </div>
              )}
            </div>

            {/* Coluna 3: Localização e Atividades */}
            <div className="space-y-6">
              {hasUltraFeaturesAccess ? (
                <>
                  {analytics.regionData?.length > 0 && (
                    <RegionChart data={analytics.regionData} />
                  )}
                  {analytics.cityData?.length > 0 && (
                    <CityChart data={analytics.cityData} />
                  )}
                  <RecentActivityCard activities={mockData.recentActivities} />
                </>
              ) : (
                <>
                  <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-md">
                    <LockedFeatureCard
                      title="Análise Geográfica Detalhada"
                      icon={<MapPin className="w-8 h-8 text-gray-400" />}
                      requiredPlan="Ultra"
                      description="Veja cliques por cidade e estado."
                    />
                  </div>
                  <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-md">
                    <LockedFeatureCard
                      title="Atividade em Tempo Real"
                      icon={<Activity className="w-8 h-8 text-gray-400" />}
                      requiredPlan="Ultra"
                      description="Monitore atividades em tempo real."
                    />
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}