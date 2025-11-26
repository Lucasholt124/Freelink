"use client";

import { useState, useEffect, JSX } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BarChart2,
  Clock,
  Globe,
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
  Sparkles,
  Filter
} from "lucide-react";
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

// 🎨 Componente de Número Animado
function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    const duration = 1000;
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
  }, [value]);

  return <span>{displayValue.toLocaleString('pt-BR')}</span>;
}

// 🎯 Click Row Component
function ClickRow({ click, index }: { click: ClickData; index: number }) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <Globe className="w-4 h-4 text-gray-400" />;
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) {
      return <Smartphone className="w-4 h-4 text-blue-500" />;
    }
    return <Laptop className="w-4 h-4 text-purple-500" />;
  };

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all duration-200 border-b border-gray-100 dark:border-gray-800"
    >
      <td className="p-4">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
            className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm shadow-green-500/50"
          />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            #{click.id}
          </span>
        </div>
      </td>

      <td className="p-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">{formatDate(click.timestamp)}</span>
        </div>
      </td>

      <td className="p-4">
        <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg px-3 py-1.5 w-fit">
          <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-mono font-bold text-purple-700 dark:text-purple-300">
            {formatTime(click.timestamp)}
          </span>
        </div>
      </td>

      <td className="p-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌍</span>
          <span className="text-sm font-medium">{click.country || "Brasil"}</span>
        </div>
      </td>

      <td className="p-4">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5 w-fit">
          {getDeviceIcon(click.userAgent)}
          <span className="text-sm font-medium">
            {click.userAgent ? (
              click.userAgent.includes('Mobile') || click.userAgent.includes('iPhone') ? 'Mobile' : 'Desktop'
            ) : 'Desconhecido'}
          </span>
        </div>
      </td>

      <td className="p-4">
        <span className="text-xs text-gray-500 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {click.visitorId.substring(0, 12)}...
        </span>
      </td>

      <td className="p-4">
        <span className="text-xs text-gray-500 truncate max-w-[150px] block">
          {click.referrer || "Acesso Direto"}
        </span>
      </td>
    </motion.tr>
  );
}

// 🎯 Clicks Table
function ClicksTable({ clicks }: { clicks: ClickData[] }) {
  const [timeFilter, setTimeFilter] = useState('all');
  const [filteredClicks, setFilteredClicks] = useState<ClickData[]>(clicks);

  useEffect(() => {
    let filtered = [...clicks];

    if (timeFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(click => new Date(click.timestamp) >= today);
    } else if (timeFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(click => new Date(click.timestamp) >= weekAgo);
    } else if (timeFilter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(click => new Date(click.timestamp) >= monthAgo);
    }

    setFilteredClicks(filtered);
  }, [timeFilter, clicks]);

  if (!clicks.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 px-4"
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-3xl flex items-center justify-center">
          <Activity className="w-10 h-10 text-purple-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Nenhum click registrado
        </h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Compartilhe seu link para começar a rastrear clicks em tempo real! 🚀
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros e Exportação */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Select defaultValue="all" onValueChange={setTimeFilter}>
          <SelectTrigger className="w-full sm:w-[200px] rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <Filter className="w-4 h-4 mr-2 text-purple-500" />
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">📊 Todos os clicks</SelectItem>
            <SelectItem value="today">📅 Hoje</SelectItem>
            <SelectItem value="week">📆 Últimos 7 dias</SelectItem>
            <SelectItem value="month">🗓️ Últimos 30 dias</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          className="rounded-xl gap-2 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          onClick={() => {
            try {
              const headers = ['ID', 'Data', 'Hora', 'País', 'Dispositivo', 'Visitor ID', 'Referrer'];
              const rows = filteredClicks.map(click => [
                click.id,
                new Date(click.timestamp).toLocaleDateString('pt-BR'),
                new Date(click.timestamp).toLocaleTimeString('pt-BR'),
                click.country || 'Brasil',
                click.userAgent || 'Desconhecido',
                click.visitorId,
                click.referrer || 'Direto',
              ]);

              const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
              ].join('\n');

              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `clicks-${new Date().toISOString().split('T')[0]}.csv`;
              link.click();
              URL.revokeObjectURL(url);

              toast.success('Relatório exportado com sucesso! 📊');
            } catch {
              toast.error('Erro ao exportar dados');
            }
          }}
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Contador de Clicks */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">Total de Clicks</p>
              <p className="text-4xl font-bold">
                <AnimatedNumber value={filteredClicks.length} />
              </p>
            </div>
          </div>

          {timeFilter !== 'all' && (
            <div className="text-right bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
              <p className="text-xs text-white/70">Do total de</p>
              <p className="text-2xl font-bold">{clicks.length}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Tabela Desktop */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg shadow-gray-200/50 dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">ID</th>
                <th className="text-left p-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Data</th>
                <th className="text-left p-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">⏰ Horário Exato</th>
                <th className="text-left p-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">País</th>
                <th className="text-left p-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Dispositivo</th>
                <th className="text-left p-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Visitor ID</th>
                <th className="text-left p-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Referrer</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredClicks.map((click, index) => (
                  <ClickRow key={click.id} click={click} index={index} />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cards Mobile */}
      <div className="md:hidden space-y-3">
        <AnimatePresence>
          {filteredClicks.map((click, index) => (
            <motion.div
              key={click.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4 shadow-lg shadow-gray-100/50 dark:shadow-none hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
                    className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg shadow-green-500/50"
                  />
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Click #{click.id}</span>
                </div>
                <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  {new Date(click.timestamp).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <div className="flex items-center gap-3 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl p-4">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-lg font-mono font-bold text-purple-700 dark:text-purple-300">
                  {new Date(click.timestamp).toLocaleTimeString('pt-BR')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                  <span className="text-xl">🌍</span>
                  <span className="text-sm font-medium">{click.country || "Brasil"}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                  {click.userAgent?.toLowerCase().includes('mobile') ? (
                    <Smartphone className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Laptop className="w-5 h-5 text-purple-500" />
                  )}
                  <span className="text-sm font-medium">
                    {click.userAgent?.includes('Mobile') ? 'Mobile' : 'Desktop'}
                  </span>
                </div>
              </div>

              <div className="text-xs text-gray-500 space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-600 dark:text-gray-400">Visitor:</span>
                  <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{click.visitorId.substring(0, 16)}...</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-600 dark:text-gray-400">Referrer:</span>
                  <span>{click.referrer || "Acesso Direto"}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// 📊 Analytics Chart
function AnalyticsChart({ data, labels, title }: { data: number[], labels: string[], title: string }) {
  const maxValue = Math.max(...data, 5);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">{title}</h3>
      <div className="h-56 flex items-end gap-2 p-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
        {data.map((value, index) => {
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={index}
              className="group relative flex flex-col items-center flex-1 h-full justify-end cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute -top-14 bg-gray-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl z-10 whitespace-nowrap"
                  >
                    <p className="font-bold text-sm">{value} {value === 1 ? 'clique' : 'cliques'}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(labels[index]).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </p>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max((value / maxValue) * 100, 4)}%` }}
                transition={{ delay: index * 0.1, duration: 0.5, type: "spring" }}
                className={clsx(
                  "w-full rounded-xl transition-all duration-200",
                  isHovered
                    ? "bg-gradient-to-t from-purple-600 to-violet-500 shadow-lg shadow-purple-500/30"
                    : value > 0
                      ? "bg-gradient-to-t from-purple-500/70 to-violet-400/70"
                      : "bg-gray-200 dark:bg-gray-700"
                )}
              />
              <span className={clsx(
                "text-xs mt-2 whitespace-nowrap font-medium transition-colors",
                isHovered ? "text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-gray-400"
              )}>
                {new Date(labels[index]).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 📱 Device Breakdown
function DeviceBreakdown({ clicks }: { clicks: ClickData[] }) {
  const validClicks = Array.isArray(clicks) ? clicks : [];

  const devices = validClicks.reduce((acc, click) => {
    const ua = click.userAgent?.toLowerCase() || '';
    if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) {
      acc['Mobile'] = (acc['Mobile'] || 0) + 1;
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      acc['Tablet'] = (acc['Tablet'] || 0) + 1;
    } else {
      acc['Desktop'] = (acc['Desktop'] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const total = validClicks.length;
  const deviceData = Object.entries(devices).map(([name, count]) => ({
    name,
    count,
    percentage: total ? Math.round((count / total) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  const getDeviceInfo = (device: string) => {
    if (device.toLowerCase().includes('mobile'))
      return { icon: Smartphone, color: 'blue' };
    if (device.toLowerCase().includes('tablet'))
      return { icon: Smartphone, color: 'green' };
    return { icon: Laptop, color: 'purple' };
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-center py-4">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {deviceData.reduce((acc, device, index) => {
              const previousTotal = acc.total;
              const strokeDasharray = (device.percentage / 100) * 283;
              const strokeDashoffset = -previousTotal * 2.83;
              const colors = { Mobile: '#3B82F6', Tablet: '#10B981', Desktop: '#8B5CF6' };

              acc.elements.push(
                <motion.circle
                  key={device.name}
                  initial={{ strokeDasharray: 0 }}
                  animate={{ strokeDasharray: `${strokeDasharray} 283` }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={colors[device.name as keyof typeof colors] || '#9CA3AF'}
                  strokeWidth="10"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              );
              acc.total += device.percentage;
              return acc;
            }, { elements: [] as JSX.Element[], total: 0 }).elements}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{total}</span>
            <span className="text-xs text-gray-500">total</span>
          </div>
        </div>
      </div>

      {deviceData.map((device, index) => {
        const info = getDeviceInfo(device.name);
        const Icon = info.icon;

        return (
          <motion.div
            key={device.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className={clsx(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              info.color === 'blue' && "bg-blue-100 dark:bg-blue-900/30",
              info.color === 'green' && "bg-green-100 dark:bg-green-900/30",
              info.color === 'purple' && "bg-purple-100 dark:bg-purple-900/30"
            )}>
              <Icon className={clsx(
                "w-6 h-6",
                info.color === 'blue' && "text-blue-600 dark:text-blue-400",
                info.color === 'green' && "text-green-600 dark:text-green-400",
                info.color === 'purple' && "text-purple-600 dark:text-purple-400"
              )} />
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-900 dark:text-white">{device.name}</span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{device.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${device.percentage}%` }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                  className={clsx(
                    "h-2 rounded-full",
                    info.color === 'blue' && "bg-gradient-to-r from-blue-400 to-blue-600",
                    info.color === 'green' && "bg-gradient-to-r from-green-400 to-green-600",
                    info.color === 'purple' && "bg-gradient-to-r from-purple-400 to-purple-600"
                  )}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{device.count} cliques</p>
            </div>
          </motion.div>
        );
      })}

      {deviceData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum dado de dispositivo disponível</p>
        </div>
      )}
    </div>
  );
}

// 🌍 Country Map
function CountryMap({ clicks }: { clicks: ClickData[] }) {
  const validClicks = Array.isArray(clicks) ? clicks : [];

  const countries = validClicks.reduce((acc, click) => {
    const country = click.country || 'Brasil';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const countryData = Object.entries(countries)
    .map(([name, count]) => ({ name, count, percentage: Math.round((count / validClicks.length) * 100) }))
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
    <div className="mt-4 space-y-3">
      {countryData.length > 0 ? (
        countryData.map((country, index) => (
          <motion.div
            key={country.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative overflow-hidden"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${country.percentage}%` }}
              transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-100 to-transparent dark:from-purple-900/30 dark:to-transparent rounded-xl"
            />

            <div className="relative flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{countryFlags[country.name] || '🌍'}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{country.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{country.count} cliques</span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-lg">
                  {country.percentage}%
                </span>
              </div>
            </div>
          </motion.div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum dado de país disponível</p>
        </div>
      )}
    </div>
  );
}

// 📊 Analytics Metrics
function AnalyticsMetrics({ clicks }: { clicks: ClickData[] }) {
  const validClicks = Array.isArray(clicks) ? clicks : [];
  const uniqueVisitors = new Set(validClicks.map((c) => c.visitorId)).size;

  const calculateTopCountry = () => {
    if (validClicks.length === 0) return "Brasil";
    const countryCounts = validClicks.reduce((acc, click) => {
      if (click.country) {
        acc[click.country] = (acc[click.country] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topCountry = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0];
    return topCountry ? topCountry[0] : "Brasil";
  };

  const topCountryName = calculateTopCountry();

  const calculateTrend = () => {
    if (validClicks.length < 2) return { value: 0, isPositive: true };

    const now = Date.now();
    const halfPeriod = 7 * 24 * 60 * 60 * 1000 / 2;

    const recentClicks = validClicks.filter(c => (now - c.timestamp) < halfPeriod).length;
    const olderClicks = validClicks.filter(c => (now - c.timestamp) >= halfPeriod && (now - c.timestamp) < halfPeriod * 2).length;

    if (olderClicks === 0) return { value: recentClicks > 0 ? 100 : 0, isPositive: true };

    const percentChange = ((recentClicks - olderClicks) / olderClicks) * 100;
    return {
      value: Math.abs(Math.round(percentChange)),
      isPositive: percentChange >= 0
    };
  };

  const trend = calculateTrend();

  const metrics = [
    {
      title: "Cliques Totais",
      value: validClicks.length,
      trend,
      icon: BarChart2,
      gradient: "from-blue-500 to-cyan-500",
      bgLight: "from-blue-50 to-cyan-50",
    },
    {
      title: "Visitantes Únicos",
      value: uniqueVisitors,
      icon: Users,
      gradient: "from-purple-500 to-pink-500",
      bgLight: "from-purple-50 to-pink-50",
    },
    {
      title: "Hoje",
      value: validClicks.filter(c => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return c.timestamp >= today.getTime();
      }).length,
      icon: MousePointer,
      gradient: "from-emerald-500 to-teal-500",
      bgLight: "from-emerald-50 to-teal-50",
    },
    {
      title: "Principal País",
      value: topCountryName,
      icon: Globe,
      gradient: "from-amber-500 to-orange-500",
      bgLight: "from-amber-50 to-orange-50",
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;

        return (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 hover:shadow-lg"
          >
            <div className={`h-1 bg-gradient-to-r ${metric.gradient}`} />

            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${metric.bgLight} dark:from-gray-700 dark:to-gray-600`}>
                  <Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </div>

                {metric.trend && (
                  <span className={clsx(
                    "text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1",
                    metric.trend.isPositive
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  )}>
                    {metric.trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {metric.trend.value}%
                  </span>
                )}
              </div>

              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{metric.title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {typeof metric.value === 'number' ? <AnimatedNumber value={metric.value} /> : metric.value}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// 🔧 Generate Chart Data
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

// 🏠 Main Page Component
export default function ShortLinkDetailsPage() {
  const params = useParams();
  const linkId = params.linkId as string;
  const [data, setData] = useState<PageData | undefined | null>(undefined);
  const [currentTab, setCurrentTab] = useState("overview");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
        .then((data) => {
          setData(data);
        })
        .catch((err) => {
          console.error("Error fetching link data:", err);
          setErrorMessage(err.message || "Não foi possível carregar os detalhes do link.");
          setData(null);
        });
    }
  }, [linkId]);

  const chartData = data?.clicks && Array.isArray(data.clicks) ? generateChartData(data.clicks) : null;

  // Loading State
  if (data === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600"
        />
        <p className="text-gray-500 font-medium">Carregando analytics...</p>
      </div>
    );
  }

  // Error State
  if (errorMessage || data === null) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20 px-4 max-w-md mx-auto"
      >
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-3xl flex items-center justify-center">
          <LinkIcon className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Link não encontrado</h2>
        <p className="text-gray-500 mb-8">
          {errorMessage || "O link que você está procurando não existe ou você não tem permissão para vê-lo."}
        </p>
        <Button asChild className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
          <Link href="/dashboard/shortener">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para a lista
          </Link>
        </Button>
      </motion.div>
    );
  }

  const { link } = data;
  const shortUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/r/${link.id}`;
  const clicks = Array.isArray(data.clicks) ? data.clicks : [];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    toast.success('Link copiado! 🎉');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="max-w-6xl mx-auto w-full px-4 space-y-6 overflow-x-hidden pb-12">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button asChild variant="ghost" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white -ml-2 rounded-xl">
          <Link href="/dashboard/shortener" className="inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
        </Button>
      </motion.div>

      {/* Header Card */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl shadow-gray-200/50 dark:shadow-none"
      >
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
          <div className="flex items-start gap-5 min-w-0 max-w-full">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="p-4 bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 rounded-2xl flex-shrink-0 text-white shadow-lg shadow-purple-500/30"
            >
              <LinkIcon className="w-8 h-8" />
            </motion.div>

            <div className="min-w-0 max-w-full">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  freelinnk.com/r/{link.id}
                </h1>
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Ativo
                </motion.span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Criado em {new Date(link.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center gap-2 max-w-full">
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate max-w-[200px] sm:max-w-[350px] hover:text-purple-600 transition-colors"
                    title={link.url}
                  >
                    {link.url}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full lg:w-auto">
            <Button
              onClick={handleCopy}
              className={clsx(
                "flex-1 lg:flex-none rounded-xl gap-2 font-semibold transition-all duration-300",
                copied
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
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
                  Copiar Link
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="rounded-xl gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ url: shortUrl, title: 'Meu Link Encurtado' });
                } else {
                  handleCopy();
                }
              }}
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Compartilhar</span>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Metrics Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <AnalyticsMetrics clicks={clicks} />
      </motion.section>

      {/* Tabs Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden"
      >
        <Tabs defaultValue="overview" value={currentTab} onValueChange={setCurrentTab}>
          {/* Tab List */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-4 overflow-x-auto scrollbar-hide">
            <TabsList className="border-0 p-0 h-16 bg-transparent w-full justify-start gap-1">
              <TabsTrigger
                value="overview"
                className="px-5 py-3 rounded-xl border-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25 h-11 transition-all duration-300 font-medium"
              >
                <BarChart2 className="w-4 h-4 mr-2" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger
                value="clicks"
                className="px-5 py-3 rounded-xl border-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25 h-11 transition-all duration-300 font-medium"
              >
                <Activity className="w-4 h-4 mr-2" />
                Clicks
              </TabsTrigger>
              <TabsTrigger
                value="devices"
                className="px-5 py-3 rounded-xl border-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25 h-11 transition-all duration-300 font-medium"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Dispositivos
              </TabsTrigger>
              <TabsTrigger
                value="geo"
                className="px-5 py-3 rounded-xl border-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25 h-11 transition-all duration-300 font-medium"
              >
                <Globe className="w-4 h-4 mr-2" />
                Geografia
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Overview Tab */}
              <TabsContent value="overview" className="m-0 p-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {chartData && (
                    <Card className="rounded-2xl border-gray-200 dark:border-gray-700 overflow-hidden">
                      <CardHeader className="pb-2 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-purple-600" />
                          Desempenho nos últimos 7 dias
                        </CardTitle>
                        <CardDescription>
                          Total de <span className="font-bold text-purple-600">{clicks.length}</span> clique{clicks.length !== 1 ? 's' : ''} registrado{clicks.length !== 1 ? 's' : ''}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <AnalyticsChart
                          data={chartData.data}
                          labels={chartData.labels}
                          title="Cliques por dia"
                        />
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="rounded-2xl border-gray-200 dark:border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Smartphone className="w-5 h-5 text-purple-600" />
                          Dispositivos
                        </CardTitle>
                        <CardDescription>
                          Distribuição de acessos por tipo de dispositivo
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <DeviceBreakdown clicks={clicks} />
                      </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-gray-200 dark:border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Globe className="w-5 h-5 text-purple-600" />
                          Localização
                        </CardTitle>
                        <CardDescription>
                          Distribuição geográfica dos cliques
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <CountryMap clicks={clicks} />
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              </TabsContent>

              {/* Clicks Tab */}
              <TabsContent value="clicks" className="m-0 p-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <ClicksTable clicks={clicks} />
                </motion.div>
              </TabsContent>

              {/* Devices Tab */}
              <TabsContent value="devices" className="m-0 p-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="rounded-2xl border-0 shadow-none">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-purple-600" />
                        Análise de Dispositivos
                      </CardTitle>
                      <CardDescription>
                        Distribuição detalhada por dispositivos
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                      <DeviceBreakdown clicks={clicks} />
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Geo Tab */}
              <TabsContent value="geo" className="m-0 p-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="rounded-2xl border-0 shadow-none">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Globe className="w-5 h-5 text-purple-600" />
                        Distribuição Geográfica
                      </CardTitle>
                      <CardDescription>
                        Distribuição detalhada por país
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
                      <CountryMap clicks={clicks} />
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </div>
        </Tabs>
      </motion.section>
    </main>
  );
}