"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin,  Clock, ChevronRight, ArrowLeft, MousePointer,
  Users, Globe, TrendingUp, Eye, Smartphone, Monitor, Tablet,
  Activity,  Target, Instagram, Facebook, Twitter,
   RefreshCw, ExternalLink,  MessageCircle,
  Youtube, Linkedin,  CheckCircle, Chrome, Crown,
  Menu, X
} from "lucide-react";

import type { LinkAnalyticsData, TrafficSource, DeviceStats, BrowserStats, RecentActivity, EngagementMetrics } from "@/convex/lib/fetchLinkAnalytics";
import { DailyPerformanceChart } from "./DailyPerformanceChart";
import { CountryChart } from "./CountryChart";
import { CityChart } from "./CityChart";
import { RegionChart } from "./RegionChart";
import { HourlyChart } from "./HourlyChart";
import { LockedFeatureCard } from "./LockedFeatureCard";
import { UpgradeCallToAction } from "./UpgradeCallToAction";
import { NoDataState } from "./NoDataState";

// IMPORTANDO O NOVO COMPONENTE DE COMPARTILHAMENTO
import ViralLinkShareBanner from "@/components/ViralLinkShareBanner";

interface CustomMetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: "blue" | "purple" | "green" | "orange" | "pink" | "yellow";
}

// Formatadores
const formatUrl = (url: string): string => {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    // Truncar URLs muito longas em mobile
    if (typeof window !== 'undefined' && window.innerWidth < 640 && hostname.length > 20) {
      return hostname.substring(0, 20) + '...';
    }
    return hostname;
  } catch {
    return url.length > 20 ? url.substring(0, 20) + '...' : url;
  }
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return new Intl.NumberFormat('pt-BR').format(num);
};

const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Card de Métrica Responsivo
function CustomMetricCard({ title, value, icon, color }: CustomMetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
    purple: 'bg-purple-100 text-purple-600 border-purple-200',
    green: 'bg-green-100 text-green-600 border-green-200',
    orange: 'bg-orange-100 text-orange-600 border-orange-200',
    pink: 'bg-pink-100 text-pink-600 border-pink-200',
    yellow: 'bg-yellow-100 text-yellow-600 border-yellow-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${colorClasses[color]} border flex-shrink-0`}>
          <div className="w-4 h-4 sm:w-5 sm:h-5">
            {icon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 truncate">
            {title}
          </h3>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-0.5 sm:mt-1 truncate">
            {typeof value === 'number' ? formatNumber(value) : value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Header Responsivo
function PageHeader({ linkTitle, linkUrl }: { linkTitle: string; linkUrl: string }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(linkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 sm:space-y-4 mb-6 sm:mb-8"
    >
      {/* Navigation - Mobile optimized */}
      <nav className="flex items-center justify-between">
        <div className="flex items-center text-xs sm:text-sm text-gray-500 overflow-x-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 hover:text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-1.5 sm:px-2 py-1 flex-shrink-0"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2 flex-shrink-0" />
          <Link
            href="/dashboard"
            className="hover:text-gray-900 transition-colors px-1.5 sm:px-2 py-1 rounded hover:bg-gray-100"
          >
            Painel
          </Link>
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2 flex-shrink-0" />
          <span className="font-semibold text-gray-800 truncate">Análises</span>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </nav>

      {/* Title Section - Mobile optimized */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2 truncate pr-2">
          {linkTitle}
        </h1>
        <div className="flex items-center gap-2 overflow-x-auto">
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1 truncate"
          >
            <span className="truncate">{formatUrl(linkUrl)}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
          <button
            onClick={handleCopyUrl}
            className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
          >
            {copied ? (
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
            ) : (
              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>
    </motion.header>
  );
}

// Card de Origem Social Responsivo
function SocialOriginCard({ trafficSources }: { trafficSources: TrafficSource[] }) {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const getSocialIcon = (source: string): React.ReactNode => {
    const sourceLower = source.toLowerCase();
    const iconClass = "w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0";
    if (sourceLower.includes('facebook')) return <Facebook className={`${iconClass} text-blue-600`} />;
    if (sourceLower.includes('instagram')) return <Instagram className={`${iconClass} text-pink-600`} />;
    if (sourceLower.includes('twitter')) return <Twitter className={`${iconClass} text-sky-500`} />;
    if (sourceLower.includes('linkedin')) return <Linkedin className={`${iconClass} text-blue-700`} />;
    if (sourceLower.includes('youtube')) return <Youtube className={`${iconClass} text-red-600`} />;
    if (sourceLower.includes('whatsapp')) return <MessageCircle className={`${iconClass} text-green-600`} />;
    if (source === 'Direto') return <ExternalLink className={`${iconClass} text-gray-600`} />;
    return <Globe className={`${iconClass} text-gray-500`} />;
  };

  const totalClicks = trafficSources.reduce((sum, source) => sum + source.clicks, 0);
  const displayedSources = showAll ? trafficSources : trafficSources.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm"
    >
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Fontes de Tráfego</h3>

      <div className="space-y-2 sm:space-y-3">
        {displayedSources.map((source) => (
          <motion.div
            key={source.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setSelectedSource(selectedSource === source.name ? null : source.name)}
            className={`p-2.5 sm:p-3 rounded-lg border cursor-pointer transition-all ${
              selectedSource === source.name
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                {getSocialIcon(source.name)}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-xs sm:text-sm text-gray-900 truncate">
                    {truncateText(source.name, 15)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatPercentage(source.percentage || ((source.clicks / totalClicks) * 100))}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-sm sm:text-base text-gray-900">
                  {formatNumber(source.clicks)}
                </p>
                <p className="text-xs text-gray-500">cliques</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {trafficSources.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 py-2 text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          {showAll ? 'Ver menos' : `Ver mais ${trafficSources.length - 3} fontes`}
        </button>
      )}
    </motion.div>
  );
}

// Card de Dispositivos Responsivo
function DevicesCard({ devices }: { devices: DeviceStats }) {
  const total = devices.desktop + devices.mobile + devices.tablet;

  if (total === 0) return null;

  const deviceData = [
    { name: 'Desktop', count: devices.desktop, icon: Monitor, color: '#3B82F6' },
    { name: 'Mobile', count: devices.mobile, icon: Smartphone, color: '#8B5CF6' },
    { name: 'Tablet', count: devices.tablet, icon: Tablet, color: '#10B981' }
  ].filter(d => d.count > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm"
    >
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Dispositivos</h3>
      <div className="space-y-2.5 sm:space-y-3">
        {deviceData.map((device) => {
          const Icon = device.icon;
          const percentage = (device.count / total) * 100;

          return (
            <motion.div
              key={device.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-600">{device.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs sm:text-sm font-bold">
                  {formatPercentage(percentage)}
                </span>
                <div className="w-16 sm:w-24 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full"
                    style={{ backgroundColor: device.color }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// Card de Atividades Recentes Responsivo
function RecentActivityCard({ activities }: { activities: RecentActivity[] }) {
  const [showAll, setShowAll] = useState(false);
  const displayedActivities = showAll ? activities : activities.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">Atividade Recente</h3>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"
        />
      </div>

      <div className="space-y-2.5 sm:space-y-3">
        {displayedActivities.map((activity, idx) => (
          <motion.div
            key={`${activity.time}-${idx}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-start gap-2 sm:gap-3 pb-2.5 sm:pb-3 border-b border-gray-100 last:border-0"
          >
            <div className="p-1 sm:p-1.5 bg-blue-100 rounded-full flex-shrink-0">
              <Activity className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-800 truncate">
                {truncateText(activity.action, 30)}
              </p>
              <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1 text-xs text-gray-500">
                {/* ✅ Mostra data/hora exata ou tempo relativo como fallback */}
                <span className="truncate max-w-[150px] sm:max-w-none font-medium text-gray-700">
                  {activity.exactTime || activity.time}
                </span>
                <span>•</span>
                <span className="truncate max-w-[100px] sm:max-w-[150px]">
                  {activity.location}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {activities.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 py-2 text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          {showAll ? 'Ver menos' : `Ver mais ${activities.length - 3} atividades`}
        </button>
      )}
    </motion.div>
  );
}

// Card de Browsers Responsivo
function BrowsersCard({ browsers }: { browsers: BrowserStats[] }) {
  const [showAll, setShowAll] = useState(false);
  const displayedBrowsers = showAll ? browsers : browsers.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm"
    >
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Navegadores</h3>
      <div className="space-y-2">
        {displayedBrowsers.map((browser) => (
          <div key={browser.name} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Chrome className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600 truncate">
                {truncateText(browser.name, 15)}
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <span className="text-xs sm:text-sm font-bold">
                {formatNumber(browser.count)}
              </span>
              <span className="text-xs text-gray-500">
                ({formatPercentage(browser.percentage)})
              </span>
            </div>
          </div>
        ))}
      </div>

      {browsers.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 py-2 text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          {showAll ? 'Ver menos' : `Ver mais ${browsers.length - 3} navegadores`}
        </button>
      )}
    </motion.div>
  );
}

// Card de Engajamento Responsivo
function EngagementCard({ engagement }: { engagement: EngagementMetrics }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm"
    >
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Engajamento</h3>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="text-center p-2.5 sm:p-3 bg-blue-50 rounded-lg">
          <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mx-auto mb-1" />
          <p className="text-xs text-gray-600">Cliques/Visitante</p>
          <p className="text-base sm:text-lg font-bold mt-1">
            {engagement.clicksPerVisitor.toFixed(1)}
          </p>
        </div>
        <div className="text-center p-2.5 sm:p-3 bg-green-50 rounded-lg">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mx-auto mb-1" />
          <p className="text-xs text-gray-600">Taxa Retorno</p>
          <p className="text-base sm:text-lg font-bold mt-1">
            {formatPercentage(engagement.returnRate)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Card de Horário de Pico Responsivo
function PeakHourCard({ peakHour }: { peakHour: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 sm:p-3 bg-orange-100 rounded-lg sm:rounded-xl flex-shrink-0">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
        </div>
        <div className="min-w-0">
          <h3 className="text-xs sm:text-sm font-medium text-gray-600">Horário de Pico</h3>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">
            {String(peakHour).padStart(2, "0")}:00
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Componente Principal
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
      <div className="p-8 text-center text-gray-600 animate-pulse">
        Carregando dados...
      </div>
    );
  }

  if (!hasAnalyticsAccess) {
    return <UpgradeCallToAction />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <PageHeader linkTitle={analytics.linkTitle} linkUrl={analytics.linkUrl} />

        {analytics.totalClicks === 0 ? (
          <NoDataState />
        ) : (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">

            {/* NOVO BANNER DE COMPARTILHAMENTO VIRAL - ESPECÍFICO DO LINK */}
            <ViralLinkShareBanner
              data={{
                linkTitle: analytics.linkTitle,
                totalClicks: analytics.totalClicks,
                uniqueUsers: analytics.uniqueUsers
              }}
            />

            {/* Métricas Principais - Grid Responsivo */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <CustomMetricCard
                title="Total de Cliques"
                value={analytics.totalClicks}
                icon={<MousePointer />}
                color="blue"
              />
              <CustomMetricCard
                title="Visitantes Únicos"
                value={analytics.uniqueUsers}
                icon={<Users />}
                color="purple"
              />
              <CustomMetricCard
                title="Países"
                value={analytics.countriesReached}
                icon={<Globe />}
                color="green"
              />
              <CustomMetricCard
                title="Taxa de Conversão"
                value={`${analytics.conversionRate?.toFixed(1) || 0}%`}
                icon={<Target />}
                color="orange"
              />
            </div>

            {/* Taxa de Rejeição e Comparação - Grid Responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <CustomMetricCard
                title="Taxa de Rejeição"
                value={`${analytics.bounceRate?.toFixed(1) || 0}%`}
                icon={<RefreshCw />}
                color="yellow"
              />
              {analytics.comparison && (
                <CustomMetricCard
                  title="Crescimento Mensal"
                  value={`${analytics.comparison.percentageChange > 0 ? '+' : ''}${analytics.comparison.percentageChange.toFixed(1)}%`}
                  icon={<TrendingUp />}
                  color="pink"
                />
              )}
            </div>

            {/* Gráfico Principal - Scrollável em mobile */}
            {analytics.dailyData && analytics.dailyData.length > 0 && (
              <div className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
                <div className="min-w-[400px]">
                  <DailyPerformanceChart data={analytics.dailyData} />
                </div>
              </div>
            )}

            {/* Grid de Análises - Stack em mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Coluna 1 */}
              <div className="space-y-4 sm:space-y-6">
                {/* Fontes de Tráfego */}
                {analytics.trafficSources && analytics.trafficSources.length > 0 && (
                  <SocialOriginCard trafficSources={analytics.trafficSources} />
                )}

                {/* Dispositivos */}
                {analytics.devices && analytics.devices.desktop + analytics.devices.mobile + analytics.devices.tablet > 0 && (
                  <DevicesCard devices={analytics.devices} />
                )}

                {/* Navegadores - ULTRA apenas */}
                {hasUltraFeaturesAccess && analytics.browsers && analytics.browsers.length > 0 && (
                  <BrowsersCard browsers={analytics.browsers} />
                )}
              </div>

              {/* Coluna 2 */}
              <div className="space-y-4 sm:space-y-6">
                {/* Países */}
                {analytics.countryData && analytics.countryData.length > 0 && (
                  <div className="overflow-x-auto">
                    <CountryChart data={analytics.countryData} />
                  </div>
                )}

                {/* Horários - ULTRA apenas */}
                {hasUltraFeaturesAccess ? (
                  <>
                    {analytics.hourlyData && analytics.hourlyData.length > 0 && (
                      <div className="overflow-x-auto">
                        <HourlyChart data={analytics.hourlyData} />
                      </div>
                    )}
                    {analytics.peakHour !== null && (
                      <PeakHourCard peakHour={analytics.peakHour} />
                    )}
                  </>
                ) : (
                  <LockedFeatureCard
                    title="Análise de Horários"
                    icon={<Clock className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />}
                    requiredPlan="Ultra"
                    description="Veja os horários de pico"
                  />
                )}
              </div>

              {/* Coluna 3 */}
              <div className="space-y-4 sm:space-y-6">
                {/* Funcionalidades ULTRA */}
                {hasUltraFeaturesAccess ? (
                  <>
                    {/* Atividades Recentes */}
                    {analytics.recentActivities && analytics.recentActivities.length > 0 && (
                      <RecentActivityCard activities={analytics.recentActivities} />
                    )}

                    {/* Cidades */}
                    {analytics.cityData && analytics.cityData.length > 0 && (
                      <div className="overflow-x-auto">
                        <CityChart data={analytics.cityData} />
                      </div>
                    )}

                    {/* Regiões */}
                    {analytics.regionData && analytics.regionData.length > 0 && (
                      <div className="overflow-x-auto">
                        <RegionChart data={analytics.regionData} />
                      </div>
                    )}

                    {/* Engajamento */}
                    {analytics.engagement && (
                      <EngagementCard engagement={analytics.engagement} />
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <LockedFeatureCard
                      title="Atividade em Tempo Real"
                      icon={<Activity className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />}
                      requiredPlan="Ultra"
                      description="Monitore atividades ao vivo"
                    />
                    <LockedFeatureCard
                      title="Análise Geográfica"
                      icon={<MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />}
                      requiredPlan="Ultra"
                      description="Cidades e regiões detalhadas"
                    />
                    <LockedFeatureCard
                      title="Métricas de Engajamento"
                      icon={<Crown className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />}
                      requiredPlan="Ultra"
                      description="Análise profunda de engajamento"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Sistemas Operacionais - ULTRA - Mobile Optimized */}
            {hasUltraFeaturesAccess && analytics.operatingSystems && analytics.operatingSystems.length > 0 && (
              <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                  Sistemas Operacionais
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  {analytics.operatingSystems.map((os) => (
                    <div key={os.name} className="text-center">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                        {truncateText(os.name, 10)}
                      </p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-700 mt-1">
                        {formatNumber(os.count)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatPercentage(os.percentage)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Referrers - ULTRA - Mobile Optimized */}
            {hasUltraFeaturesAccess && analytics.referrers && analytics.referrers.length > 0 && (
              <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                  Top Referências
                </h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {analytics.referrers.slice(0, 10).map((referrer) => (
                    <div
                      key={referrer.source}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 gap-2"
                    >
                      <span className="text-xs sm:text-sm text-gray-700 truncate flex-1">
                        {truncateText(referrer.source, 30)}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 flex-shrink-0">
                        {formatNumber(referrer.count)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}