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
  Youtube, Linkedin,  CheckCircle, Chrome, Crown
} from "lucide-react";

import type { LinkAnalyticsData } from "@/convex/lib/fetchLinkAnalytics";
import { DailyPerformanceChart } from "./DailyPerformanceChart";
import { CountryChart } from "./CountryChart";
import { CityChart } from "./CityChart";
import { RegionChart } from "./RegionChart";
import { HourlyChart } from "./HourlyChart";
import { LockedFeatureCard } from "./LockedFeatureCard";
import { UpgradeCallToAction } from "./UpgradeCallToAction";
import { NoDataState } from "./NoDataState";

// Tipos
interface TrafficSource {
  name: string;
  clicks: number;
  icon: string;
  percentage?: number;
}

interface DeviceData {
  desktop: number;
  mobile: number;
  tablet: number;
}

interface BrowserData {
  name: string;
  count: number;
  percentage: number;
}

interface RecentActivity {
  time: string;
  action: string;
  location: string;
  timestamp?: Date;
}

interface EngagementMetrics {
  clicksPerVisitor: number;
  returnRate: number;
  uniqueVisitorRate: number;
}

// Card de Métrica Customizado para aceitar string ou number
interface CustomMetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: "blue" | "purple" | "green" | "orange" | "pink" | "yellow";
}

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
      className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]} border`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {typeof value === 'number' ? formatNumber(value) : value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Formatadores
const formatUrl = (url: string): string => {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
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

// Header
function PageHeader({ linkTitle, linkUrl }: { linkTitle: string; linkUrl: string }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(linkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 mb-8"
    >
      <nav className="flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 hover:text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link
            href="/dashboard"
            className="hover:text-gray-900 transition-colors px-2 py-1 rounded hover:bg-gray-100"
          >
            Painel
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="font-semibold text-gray-800">Análises</span>
        </div>
      </nav>

      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          {linkTitle}
        </h1>
        <div className="flex items-center gap-2">
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            {formatUrl(linkUrl)}
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={handleCopyUrl}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <ExternalLink className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>
    </motion.header>
  );
}

// Card de Origem Social
function SocialOriginCard({ trafficSources }: { trafficSources: TrafficSource[] }) {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const getSocialIcon = (source: string): React.ReactNode => {
    const sourceLower = source.toLowerCase();
    if (sourceLower.includes('facebook')) return <Facebook className="w-5 h-5 text-blue-600" />;
    if (sourceLower.includes('instagram')) return <Instagram className="w-5 h-5 text-pink-600" />;
    if (sourceLower.includes('twitter')) return <Twitter className="w-5 h-5 text-sky-500" />;
    if (sourceLower.includes('linkedin')) return <Linkedin className="w-5 h-5 text-blue-700" />;
    if (sourceLower.includes('youtube')) return <Youtube className="w-5 h-5 text-red-600" />;
    if (sourceLower.includes('whatsapp')) return <MessageCircle className="w-5 h-5 text-green-600" />;
    if (source === 'Direto') return <ExternalLink className="w-5 h-5 text-gray-600" />;
    return <Globe className="w-5 h-5 text-gray-500" />;
  };

  const totalClicks = trafficSources.reduce((sum, source) => sum + source.clicks, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Fontes de Tráfego</h3>

      <div className="space-y-3">
        {trafficSources.map((source) => (
          <motion.div
            key={source.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setSelectedSource(selectedSource === source.name ? null : source.name)}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              selectedSource === source.name
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getSocialIcon(source.name)}
                <div>
                  <p className="font-medium text-sm text-gray-900">{source.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatPercentage(source.percentage || ((source.clicks / totalClicks) * 100))}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{formatNumber(source.clicks)}</p>
                <p className="text-xs text-gray-500">cliques</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Card de Dispositivos
function DevicesCard({ devices }: { devices: DeviceData }) {
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
      className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Dispositivos</h3>
      <div className="space-y-3">
        {deviceData.map((device) => {
          const Icon = device.icon;
          const percentage = (device.count / total) * 100;

          return (
            <motion.div
              key={device.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">{device.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{formatPercentage(percentage)}</span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
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

// Card de Atividades Recentes
function RecentActivityCard({ activities }: { activities: RecentActivity[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Atividade Recente</h3>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 bg-green-500 rounded-full"
        />
      </div>

      <div className="space-y-3">
        {activities.slice(0, 5).map((activity, idx) => (
          <motion.div
            key={`${activity.time}-${idx}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0"
          >
            <div className="p-1.5 bg-blue-100 rounded-full">
              <Activity className="w-3 h-3 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800">{activity.action}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <span>{activity.time}</span>
                <span>•</span>
                <span>{activity.location}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Card de Browsers
function BrowsersCard({ browsers }: { browsers: BrowserData[] }) {
  const getBrowserIcon = (): React.ReactNode => {
    return <Chrome className="w-4 h-4" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Navegadores</h3>
      <div className="space-y-2">
        {browsers.slice(0, 5).map((browser) => (
          <div key={browser.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getBrowserIcon()}
              <span className="text-sm text-gray-600">{browser.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">{formatNumber(browser.count)}</span>
              <span className="text-xs text-gray-500">
                ({formatPercentage(browser.percentage)})
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Card de Engajamento
function EngagementCard({ engagement }: { engagement: EngagementMetrics }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Engajamento</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <Eye className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <p className="text-xs text-gray-600">Cliques/Visitante</p>
          <p className="text-lg font-bold">{engagement.clicksPerVisitor.toFixed(1)}</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <Users className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <p className="text-xs text-gray-600">Taxa Retorno</p>
          <p className="text-lg font-bold">{formatPercentage(engagement.returnRate)}</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader linkTitle={analytics.linkTitle} linkUrl={analytics.linkUrl} />

        {analytics.totalClicks === 0 ? (
          <NoDataState />
        ) : (
          <div className="space-y-8">
            {/* Métricas Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <CustomMetricCard
                title="Total de Cliques"
                value={analytics.totalClicks}
                icon={<MousePointer className="w-5 h-5" />}
                color="blue"
              />
              <CustomMetricCard
                title="Visitantes Únicos"
                value={analytics.uniqueUsers}
                icon={<Users className="w-5 h-5" />}
                color="purple"
              />
              <CustomMetricCard
                title="Países"
                value={analytics.countriesReached}
                icon={<Globe className="w-5 h-5" />}
                color="green"
              />
              <CustomMetricCard
                title="Taxa de Conversão"
                value={`${analytics.conversionRate?.toFixed(1) || 0}%`}
                icon={<Target className="w-5 h-5" />}
                color="orange"
              />
            </div>

            {/* Taxa de Rejeição e Comparação */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomMetricCard
                title="Taxa de Rejeição"
                value={`${analytics.bounceRate?.toFixed(1) || 0}%`}
                icon={<RefreshCw className="w-5 h-5" />}
                color="yellow"
              />
              {analytics.comparison && (
                <CustomMetricCard
                  title="Crescimento Mensal"
                  value={`${analytics.comparison.percentageChange > 0 ? '+' : ''}${analytics.comparison.percentageChange.toFixed(1)}%`}
                  icon={<TrendingUp className="w-5 h-5" />}
                  color="pink"
                />
              )}
            </div>

            {/* Gráfico Principal */}
            {analytics.dailyData && analytics.dailyData.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <DailyPerformanceChart data={analytics.dailyData} />
              </div>
            )}

            {/* Grid de Análises */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coluna 1 */}
              <div className="space-y-6">
                {/* Fontes de Tráfego - PRO e ULTRA */}
                {analytics.trafficSources && analytics.trafficSources.length > 0 && (
                  <SocialOriginCard trafficSources={analytics.trafficSources} />
                )}

                {/* Dispositivos - PRO e ULTRA */}
                {analytics.devices && (
                  <DevicesCard devices={analytics.devices} />
                )}

                {/* Navegadores - ULTRA apenas */}
                {hasUltraFeaturesAccess && analytics.browsers && analytics.browsers.length > 0 && (
                  <BrowsersCard browsers={analytics.browsers} />
                )}
              </div>

              {/* Coluna 2 */}
              <div className="space-y-6">
                {/* Países */}
                {analytics.countryData && analytics.countryData.length > 0 && (
                  <CountryChart data={analytics.countryData} />
                )}

                {/* Horários - ULTRA apenas */}
                {hasUltraFeaturesAccess ? (
                  <>
                    {analytics.hourlyData && analytics.hourlyData.length > 0 && (
                      <HourlyChart data={analytics.hourlyData} />
                    )}
                    {analytics.peakHour !== null && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-orange-100 rounded-xl">
                            <Clock className="w-6 h-6 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-600">Horário de Pico</h3>
                            <p className="text-2xl font-bold text-gray-900">
                              {String(analytics.peakHour).padStart(2, "0")}:00
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <LockedFeatureCard
                    title="Análise de Horários"
                    icon={<Clock className="w-8 h-8 text-gray-400" />}
                    requiredPlan="Ultra"
                    description="Veja os horários de pico"
                  />
                )}
              </div>

              {/* Coluna 3 */}
              <div className="space-y-6">
                {/* Funcionalidades ULTRA */}
                {hasUltraFeaturesAccess ? (
                  <>
                    {/* Atividades Recentes */}
                    {analytics.recentActivities && analytics.recentActivities.length > 0 && (
                      <RecentActivityCard activities={analytics.recentActivities} />
                    )}

                    {/* Cidades */}
                    {analytics.cityData && analytics.cityData.length > 0 && (
                      <CityChart data={analytics.cityData} />
                    )}

                    {/* Regiões */}
                    {analytics.regionData && analytics.regionData.length > 0 && (
                      <RegionChart data={analytics.regionData} />
                    )}

                    {/* Engajamento */}
                    {analytics.engagement && (
                      <EngagementCard engagement={analytics.engagement} />
                    )}
                  </>
                ) : (
                  <>
                    <LockedFeatureCard
                      title="Atividade em Tempo Real"
                      icon={<Activity className="w-8 h-8 text-gray-400" />}
                      requiredPlan="Ultra"
                      description="Monitore atividades ao vivo"
                    />
                    <LockedFeatureCard
                      title="Análise Geográfica"
                      icon={<MapPin className="w-8 h-8 text-gray-400" />}
                      requiredPlan="Ultra"
                      description="Cidades e regiões detalhadas"
                    />
                    <LockedFeatureCard
                      title="Métricas de Engajamento"
                      icon={<Crown className="w-8 h-8 text-gray-400" />}
                      requiredPlan="Ultra"
                      description="Análise profunda de engajamento"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Sistemas Operacionais - ULTRA */}
            {hasUltraFeaturesAccess && analytics.operatingSystems && analytics.operatingSystems.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Sistemas Operacionais</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {analytics.operatingSystems.map((os) => (
                    <div key={os.name} className="text-center">
                      <p className="text-sm font-medium text-gray-900">{os.name}</p>
                      <p className="text-2xl font-bold text-gray-700">{formatNumber(os.count)}</p>
                      <p className="text-xs text-gray-500">{formatPercentage(os.percentage)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Referrers - ULTRA */}
            {hasUltraFeaturesAccess && analytics.referrers && analytics.referrers.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Referências</h3>
                <div className="space-y-2">
                  {analytics.referrers.slice(0, 10).map((referrer) => (
                    <div key={referrer.source} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-700 truncate max-w-[70%]">{referrer.source}</span>
                      <span className="text-sm font-bold text-gray-900">{formatNumber(referrer.count)}</span>
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