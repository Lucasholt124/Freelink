"use client";

import { useState, useEffect, JSX } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BarChart2,
  Globe,
  Loader2,
  Users,
  ExternalLink,
  LinkIcon,
  Download,
  Calendar,
  MousePointer,
  Smartphone,
  Laptop,
  Share2,
  Copy,
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Eye,
  Sparkles,
  ChevronRight,
  Filter,
  MoreHorizontal,
  RefreshCw
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type LinkData = { id: string; url: string; createdAt: number; };
type ClickData = {
  id: number;
  timestamp: number;
  country: string | null;
  visitorId: string;
  userAgent?: string;
  referrer?: string;
};
type PageData = { link: LinkData; clicks: ClickData[] };

// 🎨 Animated Counter Component
function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    const startValue = displayValue;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(startValue + (value - startValue) * easeOut));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString('pt-BR')}</span>;
}

// 🎯 Hero Stats Card - Instagram/TikTok Style
function HeroStatsCard({ clicks, plan }: { clicks: ClickData[]; plan: string }) {
  const uniqueVisitors = new Set(clicks.map((c) => c.visitorId)).size;

  const getTrend = () => {
    if (clicks.length < 2) return { value: 0, isPositive: true };
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const todayClicks = clicks.filter(c => c.timestamp > dayAgo).length;
    const yesterdayClicks = clicks.filter(c => c.timestamp <= dayAgo && c.timestamp > dayAgo - 24 * 60 * 60 * 1000).length;

    if (yesterdayClicks === 0) return { value: todayClicks > 0 ? 100 : 0, isPositive: true };
    const change = ((todayClicks - yesterdayClicks) / yesterdayClicks) * 100;
    return { value: Math.abs(Math.round(change)), isPositive: change >= 0 };
  };

  const trend = getTrend();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-3xl" />

      <div className="relative p-6 sm:p-8">
        {/* Main Stat */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4"
          >
            <Zap className="w-4 h-4 text-yellow-300" />
            <span className="text-white/90 text-sm font-medium">Estatísticas em Tempo Real</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-6xl sm:text-7xl font-bold text-white mb-2"
          >
            <AnimatedNumber value={clicks.length} />
          </motion.h2>
          <p className="text-white/70 text-lg">cliques totais</p>

          {/* Trend Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={clsx(
              "inline-flex items-center gap-1 mt-4 px-3 py-1.5 rounded-full text-sm font-medium",
              trend.isPositive
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-red-500/20 text-red-300"
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {trend.value}% vs ontem
          </motion.div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl"
          >
            <Users className="w-5 h-5 text-white/70 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {plan !== "free" ? <AnimatedNumber value={uniqueVisitors} /> : "—"}
            </p>
            <p className="text-xs text-white/60">Visitantes</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl"
          >
            <Eye className="w-5 h-5 text-white/70 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              <AnimatedNumber value={clicks.filter(c => Date.now() - c.timestamp < 24 * 60 * 60 * 1000).length} />
            </p>
            <p className="text-xs text-white/60">Hoje</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl"
          >
            <Globe className="w-5 h-5 text-white/70 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              <AnimatedNumber value={new Set(clicks.map(c => c.country || 'BR')).size} />
            </p>
            <p className="text-xs text-white/60">Países</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// 📊 Modern Chart Component
function ModernChart({ data, labels }: { data: number[], labels: string[] }) {
  const maxValue = Math.max(...data, 1);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {/* Chart Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Últimos 7 dias</h3>
          <p className="text-sm text-gray-500">Performance do seu link</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-500" />
          <span className="text-gray-600 dark:text-gray-400">Cliques</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-52 flex items-end gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
        {data.map((value, index) => {
          const isHovered = hoveredIndex === index;
          const height = Math.max((value / maxValue) * 100, 8);

          return (
            <div
              key={index}
              className="relative flex-1 flex flex-col items-center justify-end h-full cursor-pointer group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute -top-12 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-10"
                  >
                    <p className="font-bold">{value} cliques</p>
                    <p className="text-gray-400">
                      {new Date(labels[index]).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' })}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bar */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: index * 0.1, duration: 0.5, type: "spring" }}
                className={clsx(
                  "w-full rounded-xl transition-all duration-200",
                  isHovered
                    ? "bg-gradient-to-t from-violet-600 to-purple-500 shadow-lg shadow-purple-500/30"
                    : "bg-gradient-to-t from-violet-500/60 to-purple-400/60"
                )}
              />

              {/* Label */}
              <span className={clsx(
                "text-xs mt-2 transition-colors",
                isHovered ? "text-purple-600 font-medium" : "text-gray-400"
              )}>
                {new Date(labels[index]).toLocaleDateString('pt-BR', { weekday: 'short' })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 📱 Click Card for Mobile - Instagram Story Style
function ClickCard({ click, index }: { click: ClickData; index: number }) {
  const getDeviceInfo = (userAgent?: string) => {
    if (!userAgent) return { type: 'Desconhecido', icon: Globe, color: 'gray' };
    const ua = userAgent.toLowerCase();
    if (ua.includes('iphone')) return { type: 'iPhone', icon: Smartphone, color: 'blue' };
    if (ua.includes('android')) return { type: 'Android', icon: Smartphone, color: 'green' };
    if (ua.includes('ipad')) return { type: 'iPad', icon: Smartphone, color: 'purple' };
    if (ua.includes('mac')) return { type: 'Mac', icon: Laptop, color: 'gray' };
    if (ua.includes('windows')) return { type: 'Windows', icon: Laptop, color: 'blue' };
    return { type: 'Desktop', icon: Laptop, color: 'purple' };
  };

  const device = getDeviceInfo(click.userAgent);
  const DeviceIcon = device.icon;

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'agora';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 group"
    >
      {/* Device Icon */}
      <div className={clsx(
        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110",
        device.color === 'blue' && "bg-blue-100 dark:bg-blue-900/30",
        device.color === 'green' && "bg-green-100 dark:bg-green-900/30",
        device.color === 'purple' && "bg-purple-100 dark:bg-purple-900/30",
        device.color === 'gray' && "bg-gray-100 dark:bg-gray-700"
      )}>
        <DeviceIcon className={clsx(
          "w-6 h-6",
          device.color === 'blue' && "text-blue-600 dark:text-blue-400",
          device.color === 'green' && "text-green-600 dark:text-green-400",
          device.color === 'purple' && "text-purple-600 dark:text-purple-400",
          device.color === 'gray' && "text-gray-600 dark:text-gray-400"
        )} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 dark:text-white">{device.type}</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">{click.country || "Brasil"}</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {new Date(click.timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          })} — {click.referrer || "Acesso direto"}
        </p>
      </div>

      {/* Time */}
      <div className="text-right flex-shrink-0">
        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
          {timeAgo(click.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}

// 📊 Device Breakdown - Pie Chart Style
function ModernDeviceBreakdown({ clicks }: { clicks: ClickData[] }) {
  const devices = clicks.reduce((acc, click) => {
    const ua = click.userAgent?.toLowerCase() || '';
    if (ua.includes('iphone') || ua.includes('android') || ua.includes('mobile')) {
      acc['Mobile'] = (acc['Mobile'] || 0) + 1;
    } else if (ua.includes('ipad') || ua.includes('tablet')) {
      acc['Tablet'] = (acc['Tablet'] || 0) + 1;
    } else {
      acc['Desktop'] = (acc['Desktop'] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const total = clicks.length;
  const deviceData = Object.entries(devices).map(([name, count]) => ({
    name,
    count,
    percentage: total ? Math.round((count / total) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  const colors = {
    Mobile: { bg: 'bg-blue-500', light: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    Tablet: { bg: 'bg-green-500', light: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
    Desktop: { bg: 'bg-purple-500', light: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' }
  };

  return (
    <div className="space-y-4">
      {/* Visual Pie Alternative */}
      <div className="flex items-center justify-center py-6">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {deviceData.reduce((acc, device) => {
              const previousTotal = acc.total;
              const strokeDasharray = (device.percentage / 100) * 283;
              const strokeDashoffset = -previousTotal * 2.83;

              acc.elements.push(
                <circle
                  key={device.name}
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={device.name === 'Mobile' ? '#3B82F6' : device.name === 'Tablet' ? '#10B981' : '#8B5CF6'}
                  strokeWidth="10"
                  strokeDasharray={`${strokeDasharray} 283`}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500"
                />
              );
              acc.total += device.percentage;
              return acc;
            }, { elements: [] as JSX.Element[], total: 0 }).elements}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{total}</span>
            <span className="text-xs text-gray-500">total</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {deviceData.map((device, index) => (
          <motion.div
            key={device.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className={clsx("w-4 h-4 rounded-full", colors[device.name as keyof typeof colors]?.bg || 'bg-gray-400')} />
              <span className="font-medium text-gray-900 dark:text-white">{device.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{device.count} cliques</span>
              <span className={clsx(
                "text-sm font-bold",
                colors[device.name as keyof typeof colors]?.text || 'text-gray-600'
              )}>
                {device.percentage}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// 🌍 Country List - Modern Style
function ModernCountryList({ clicks }: { clicks: ClickData[] }) {
  const countries = clicks.reduce((acc, click) => {
    const country = click.country || 'Brasil';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const countryData = Object.entries(countries)
    .map(([name, count]) => ({ name, count, percentage: Math.round((count / clicks.length) * 100) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const countryFlags: Record<string, string> = {
    'Brasil': '🇧🇷',
    'Portugal': '🇵🇹',
    'United States': '🇺🇸',
    'Spain': '🇪🇸',
    'Argentina': '🇦🇷',
    'Mexico': '🇲🇽',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'Italy': '🇮🇹',
    'United Kingdom': '🇬🇧',
  };

  return (
    <div className="space-y-3">
      {countryData.map((country, index) => (
        <motion.div
          key={country.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative overflow-hidden"
        >
          {/* Background Bar */}
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500/10 to-transparent rounded-xl transition-all duration-500"
            style={{ width: `${country.percentage}%` }}
          />

          <div className="relative flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{countryFlags[country.name] || '🌍'}</span>
              <span className="font-medium text-gray-900 dark:text-white">{country.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{country.count}</span>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                {country.percentage}%
              </span>
            </div>
          </div>
        </motion.div>
      ))}

      {countryData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum dado disponível</p>
        </div>
      )}
    </div>
  );
}

// 📋 Clicks Table - Full Featured
function FullClicksTable({ clicks }: { clicks: ClickData[] }) {
  const [timeFilter, setTimeFilter] = useState('all');
  const [filteredClicks, setFilteredClicks] = useState<ClickData[]>(clicks);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let filtered = [...clicks];
    const now = Date.now();

    if (timeFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(click => click.timestamp >= today.getTime());
    } else if (timeFilter === 'week') {
      filtered = filtered.filter(click => now - click.timestamp < 7 * 24 * 60 * 60 * 1000);
    } else if (timeFilter === 'month') {
      filtered = filtered.filter(click => now - click.timestamp < 30 * 24 * 60 * 60 * 1000);
    }

    setFilteredClicks(filtered);
  }, [timeFilter, clicks]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const exportCSV = () => {
    const headers = ['ID', 'Data', 'Hora', 'País', 'Dispositivo', 'Referrer'];
    const rows = filteredClicks.map(click => [
      click.id,
      new Date(click.timestamp).toLocaleDateString('pt-BR'),
      new Date(click.timestamp).toLocaleTimeString('pt-BR'),
      click.country || 'Brasil',
      click.userAgent?.includes('Mobile') ? 'Mobile' : 'Desktop',
      click.referrer || 'Direto',
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clicks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Relatório exportado! 📊');
  };

  if (clicks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-3xl flex items-center justify-center">
          <MousePointer className="w-10 h-10 text-purple-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Nenhum click ainda
        </h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          Compartilhe seu link nas redes sociais para começar a rastrear seus clicks em tempo real
        </p>
        <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
          <Share2 className="w-4 h-4 mr-2" />
          Compartilhar Link
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[160px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
              <Filter className="w-4 h-4 mr-2 text-gray-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Últimos 7 dias</SelectItem>
              <SelectItem value="month">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={handleRefresh}
          >
            <RefreshCw className={clsx("w-4 h-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>

        <Button
          variant="outline"
          className="rounded-xl gap-2"
          onClick={exportCSV}
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/50">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Filtrados</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{filteredClicks.length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/50">
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Total</p>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{clicks.length}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-800/50">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Únicos</p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {new Set(filteredClicks.map(c => c.visitorId)).size}
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/50">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Países</p>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
            {new Set(filteredClicks.map(c => c.country || 'BR')).size}
          </p>
        </div>
      </div>

      {/* Mobile List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filteredClicks.slice(0, 50).map((click, index) => (
            <ClickCard key={click.id} click={click} index={index} />
          ))}
        </AnimatePresence>

        {filteredClicks.length > 50 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">
              Mostrando 50 de {filteredClicks.length} clicks
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// 🔗 Link Header Component
function LinkHeader({ link, shortUrl }: { link: LinkData; shortUrl: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    toast.success('Link copiado! 🎉');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
            <LinkIcon className="w-7 h-7 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
              freelinnk.com/r/{link.id}
            </h1>
            <p className="text-sm text-gray-500 truncate max-w-[250px] sm:max-w-md">
              {link.url}
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={handleCopy}
            className={clsx(
              "flex-1 sm:flex-none rounded-xl gap-2 transition-all",
              copied
                ? "bg-emerald-500 hover:bg-emerald-600"
                : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            )}
          >
            {copied ? (
              <>
                <Sparkles className="w-4 h-4" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar
              </>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-xl">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={() => window.open(link.url, '_blank')}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Visitar Original
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(shortUrl, '_blank')}>
                <Eye className="w-4 h-4 mr-2" />
                Testar Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                navigator.share?.({ url: shortUrl, title: 'Meu Link' });
              }}>
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Criado em {new Date(link.createdAt).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </motion.div>
  );
}

// 🏠 Main Page Component
export default function ShortLinkDetailsPage() {
  const params = useParams();
  const linkId = params.linkId as string;
  const { user } = useUser();
  const [data, setData] = useState<PageData | undefined | null>(undefined);
  const [currentTab, setCurrentTab] = useState("overview");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (linkId) {
      fetch(`/api/shortener/${linkId}`)
        .then((res) => {
          if (!res.ok) {
            return res.json().then((err) => {
              throw new Error(err.error || "Falha ao buscar dados");
            });
          }
          return res.json();
        })
        .then((data) => setData(data))
        .catch((err) => {
          setErrorMessage(err.message);
          setData(null);
        });
    }
  }, [linkId]);

  const isAdmin = user?.id === "user_301NTkVsE3v48SXkoCEp0XOXifI";
  const userPlan = (user?.publicMetadata?.subscriptionPlan as string) ?? "free";
  const plan = isAdmin ? "ultra" : userPlan;

  const generateChartData = (clicks: ClickData[]) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const clicksByDay = clicks.reduce((acc, click) => {
      const date = new Date(click.timestamp).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: last7Days,
      data: last7Days.map(day => clicksByDay[day] || 0)
    };
  };

  // Loading State
  if (data === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-10 h-10 text-purple-500" />
        </motion.div>
        <p className="text-gray-500">Carregando analytics...</p>
      </div>
    );
  }

  // Error State
  if (errorMessage || data === null) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20 px-4"
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-3xl flex items-center justify-center">
          <LinkIcon className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Link não encontrado</h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          {errorMessage || "O link que você está procurando não existe ou você não tem permissão para acessá-lo."}
        </p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/dashboard/shortener">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Links
          </Link>
        </Button>
      </motion.div>
    );
  }

  const { link } = data;
  const shortUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/r/${link.id}`;
  const clicks = Array.isArray(data.clicks) ? data.clicks : [];
  const chartData = generateChartData(clicks);

  return (
    <main className="max-w-5xl mx-auto w-full px-4 pb-20 space-y-6">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button asChild variant="ghost" className="rounded-xl -ml-2 text-gray-600 hover:text-gray-900">
          <Link href="/dashboard/shortener">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </Button>
      </motion.div>

      {/* Link Header */}
      <LinkHeader link={link} shortUrl={shortUrl} />

      {/* Hero Stats */}
      <HeroStatsCard clicks={clicks} plan={plan} />

      {/* Tabs Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          {/* Tab List - Scrollable on Mobile */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-1.5 border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <TabsList className="bg-transparent w-full sm:w-auto inline-flex min-w-max">
              <TabsTrigger
                value="overview"
                className="rounded-xl px-4 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
              >
                <BarChart2 className="w-4 h-4 mr-2" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger
                value="clicks"
                className="rounded-xl px-4 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
              >
                <Activity className="w-4 h-4 mr-2" />
                Clicks
              </TabsTrigger>
              <TabsTrigger
                value="devices"
                className="rounded-xl px-4 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                disabled={plan === "free"}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Dispositivos
                {plan === "free" && <span className="ml-1 text-xs opacity-60">Pro</span>}
              </TabsTrigger>
              <TabsTrigger
                value="geo"
                className="rounded-xl px-4 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                disabled={plan !== "ultra"}
              >
                <Globe className="w-4 h-4 mr-2" />
                Geografia
                {plan !== "ultra" && <span className="ml-1 text-xs opacity-60">Ultra</span>}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Contents */}
          <AnimatePresence mode="wait">
            <TabsContent value="overview" className="m-0 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Chart Card */}
                <Card className="rounded-3xl border-gray-200 dark:border-gray-700 overflow-hidden">
                  <CardContent className="p-6">
                    <ModernChart data={chartData.data} labels={chartData.labels} />
                  </CardContent>
                </Card>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {plan !== "free" && (
                    <Card className="rounded-3xl border-gray-200 dark:border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Smartphone className="w-5 h-5 text-purple-500" />
                          Dispositivos
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ModernDeviceBreakdown clicks={clicks} />
                      </CardContent>
                    </Card>
                  )}

                  {plan === "ultra" && (
                    <Card className="rounded-3xl border-gray-200 dark:border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Globe className="w-5 h-5 text-purple-500" />
                          Países
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ModernCountryList clicks={clicks} />
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Recent Clicks Preview */}
                <Card className="rounded-3xl border-gray-200 dark:border-gray-700 mt-6">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-500" />
                        Clicks Recentes
                      </CardTitle>
                      <CardDescription>Últimos acessos ao seu link</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => setCurrentTab("clicks")}
                    >
                      Ver todos
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {clicks.slice(0, 5).map((click, index) => (
                      <ClickCard key={click.id} click={click} index={index} />
                    ))}
                    {clicks.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <MousePointer className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p>Nenhum click registrado ainda</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="clicks" className="m-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="rounded-3xl border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-500" />
                      Histórico Completo
                    </CardTitle>
                    <CardDescription>
                      Todos os clicks com detalhes completos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FullClicksTable clicks={clicks} />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="devices" className="m-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {plan !== "free" ? (
                  <Card className="rounded-3xl border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-purple-500" />
                        Análise de Dispositivos
                      </CardTitle>
                      <CardDescription>
                        Veja quais dispositivos seus visitantes usam
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ModernDeviceBreakdown clicks={clicks} />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-3xl flex items-center justify-center">
                      <Smartphone className="w-10 h-10 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Recurso Pro</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                      Faça upgrade para ver análises detalhadas de dispositivos
                    </p>
                    <Button asChild className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600">
                      <Link href="/dashboard/billing">Ver Planos</Link>
                    </Button>
                  </div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="geo" className="m-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {plan === "ultra" ? (
                  <Card className="rounded-3xl border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Globe className="w-5 h-5 text-purple-500" />
                        Distribuição Geográfica
                      </CardTitle>
                      <CardDescription>
                        Veja de onde vêm seus visitantes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ModernCountryList clicks={clicks} />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-3xl flex items-center justify-center">
                      <Globe className="w-10 h-10 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Recurso Ultra</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                      Faça upgrade para ver análises geográficas detalhadas
                    </p>
                    <Button asChild className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600">
                      <Link href="/dashboard/billing">Ver Planos</Link>
                    </Button>
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </main>
  );
}