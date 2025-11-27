"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BarChart2,
  Clock,
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
  Activity
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

// 🎯 Componente de Click Individual com Animação
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
      className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-transparent dark:hover:from-purple-900/10 transition-all duration-300 border-b border-gray-100 dark:border-gray-800"
    >
      <td className="p-4">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
            className="w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm shadow-green-500/50"
          />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {click.id}
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
        <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/40 dark:to-violet-900/40 rounded-lg px-3 py-1.5 w-fit">
          <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-mono font-bold text-purple-700 dark:text-purple-300">
            {formatTime(click.timestamp)}
          </span>
        </div>
      </td>

      <td className="p-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{click.country || "Brasil"}</span>
        </div>
      </td>

      <td className="p-4">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1.5 w-fit">
          {getDeviceIcon(click.userAgent)}
          <span className="text-sm font-medium truncate max-w-[150px]" title={click.userAgent || "Desconhecido"}>
            {click.userAgent ? (
              click.userAgent.includes('Mobile') || click.userAgent.includes('iPhone') ? 'Mobile' : 'Desktop'
            ) : 'Desconhecido'}
          </span>
        </div>
      </td>

      <td className="p-4">
        <span className="text-xs text-muted-foreground font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded truncate max-w-[120px] block" title={click.visitorId}>
          {click.visitorId.substring(0, 12)}...
        </span>
      </td>

      <td className="p-4">
        <span className="text-xs text-muted-foreground truncate max-w-[150px] block" title={click.referrer || "Direto"}>
          {click.referrer || "Direto"}
        </span>
      </td>
    </motion.tr>
  );
}

// 🎯 Tabela Grande de Clicks com Animações
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
      <div className="text-center py-16 px-4">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-3xl flex items-center justify-center">
          <Activity className="w-10 h-10 text-purple-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Nenhum click registrado
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Compartilhe seu link para começar a rastrear clicks
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros e Exportação */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <Select defaultValue="all" onValueChange={setTimeFilter}>
          <SelectTrigger className="w-full sm:w-[180px] rounded-xl border-gray-200 dark:border-gray-700">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">Todos os clicks</SelectItem>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Últimos 7 dias</SelectItem>
            <SelectItem value="month">Últimos 30 dias</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-xl border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20"
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

              toast.success('Relatório exportado com sucesso!');
            } catch  {
              toast.error('Erro ao exportar dados');
            }
          }}
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Contador de Clicks */}
      <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-2xl p-5 text-white shadow-xl shadow-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">Total de Clicks</p>
              <p className="text-3xl font-bold">
                {filteredClicks.length}
              </p>
            </div>
          </div>

          {timeFilter !== 'all' && (
            <div className="text-right bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
              <p className="text-xs text-white/70">Do total de</p>
              <p className="text-xl font-bold">{clicks.length}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabela Desktop */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="text-left p-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Data
                </th>
                <th className="text-left p-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Horário Exato
                </th>
                <th className="text-left p-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  País
                </th>
                <th className="text-left p-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Dispositivo
                </th>
                <th className="text-left p-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Visitor ID
                </th>
                <th className="text-left p-4 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Referrer
                </th>
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
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-4 shadow-lg hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300"
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
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full font-medium">
                  {new Date(click.timestamp).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <div className="flex items-center gap-3 bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 rounded-xl p-4">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-lg font-mono font-bold text-purple-700 dark:text-purple-300">
                  {new Date(click.timestamp).toLocaleTimeString('pt-BR')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium">{click.country || "Brasil"}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                  {click.userAgent?.toLowerCase().includes('mobile') ? (
                    <Smartphone className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Laptop className="w-5 h-5 text-purple-500" />
                  )}
                  <span className="text-sm font-medium truncate">
                    {click.userAgent?.includes('Mobile') ? 'Mobile' : 'Desktop'}
                  </span>
                </div>
              </div>

              <div className="text-xs text-gray-500 space-y-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-600 dark:text-gray-400">Visitor:</span>
                  <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{click.visitorId.substring(0, 16)}...</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-600 dark:text-gray-400">Referrer:</span>
                  <span>{click.referrer || "Direto"}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Gráfico de Analytics - LÓGICA ORIGINAL, DESIGN MELHORADO
function AnalyticsChart({ data, labels, title }: { data: number[], labels: string[], title: string }) {
  const maxValue = Math.max(...data, 5);

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">{title}</h3>
      {/* Mobile: Horizontal scrollable */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div className="h-48 flex items-end gap-2 min-w-[400px] sm:min-w-0">
          {data.map((value, index) => (
            <div key={index} className="group relative flex flex-col items-center flex-1 min-w-[40px]">
              <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 pointer-events-none z-10 whitespace-nowrap shadow-lg">
                <span className="font-bold">{value}</span> {value === 1 ? 'clique' : 'cliques'}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max((value / maxValue) * 100, 4)}%` }}
                transition={{ delay: index * 0.1, duration: 0.5, type: "spring" }}
                className={clsx(
                  "w-full rounded-xl transition-all duration-300 cursor-pointer",
                  value > 0
                    ? "bg-gradient-to-t from-purple-600 to-violet-500 group-hover:from-purple-500 group-hover:to-violet-400 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40"
                    : "bg-gray-200 dark:bg-gray-700"
                )}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 whitespace-nowrap font-medium">
                {new Date(labels[index]).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Device Breakdown - LÓGICA ORIGINAL, DESIGN MELHORADO
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

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile'))
      return <Smartphone className="w-5 h-5 text-blue-500" />;
    if (device.toLowerCase().includes('tablet'))
      return <Smartphone className="w-5 h-5 text-green-500" />;
    return <Laptop className="w-5 h-5 text-purple-500" />;
  };

  const getDeviceColor = (device: string) => {
    if (device.toLowerCase().includes('mobile')) return 'blue';
    if (device.toLowerCase().includes('tablet')) return 'green';
    return 'purple';
  };

  return (
    <div className="space-y-4 mt-4">
      {deviceData.map((device, index) => {
        const color = getDeviceColor(device.name);
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
              color === 'blue' && "bg-blue-100 dark:bg-blue-900/30",
              color === 'green' && "bg-green-100 dark:bg-green-900/30",
              color === 'purple' && "bg-purple-100 dark:bg-purple-900/30"
            )}>
              {getDeviceIcon(device.name)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-900 dark:text-white">{device.name}</span>
                <span className="text-sm text-gray-500">{device.count} ({device.percentage}%)</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${device.percentage}%` }}
                  transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                  className={clsx(
                    "h-2.5 rounded-full",
                    color === 'blue' && "bg-gradient-to-r from-blue-400 to-blue-600",
                    color === 'green' && "bg-gradient-to-r from-green-400 to-green-600",
                    color === 'purple' && "bg-gradient-to-r from-purple-400 to-purple-600"
                  )}
                />
              </div>
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

// Country Map - LÓGICA ORIGINAL, DESIGN MELHORADO
function CountryMap({ clicks }: { clicks: ClickData[] }) {
  const validClicks = Array.isArray(clicks) ? clicks : [];

  const countries = validClicks.reduce((acc, click) => {
    const country = click.country || 'Brasil';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const countryData = Object.entries(countries)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Principais Países</h3>
        </div>
        <div className="p-2">
          {countryData.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {countryData.map((country, index) => (
                <motion.div
                  key={country.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between py-3 px-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center">
                      <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{country.name}</span>
                  </div>
                  <span className="text-sm font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">{country.count}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-gray-500">
              <Globe className="w-10 h-10 mx-auto mb-2 opacity-30" />
              Nenhum dado de país disponível
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Analytics Metrics - LÓGICA 100% ORIGINAL, DESIGN MELHORADO
function AnalyticsMetrics({ clicks, plan }: { clicks: ClickData[]; plan: string }) {
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

  const impressions = validClicks.length * 2.5;
  const ctr = impressions > 0 ? (validClicks.length / impressions) * 100 : 0;

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

  const MetricCard = ({
    title,
    value,
    subtitle,
    trend,
    icon: Icon,
    color,
    isPro = false,
    isUltra = false,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: { value: number; isPositive: boolean };
    icon: React.ElementType;
    color: string;
    isPro?: boolean;
    isUltra?: boolean;
  }) => {
    const isLocked = (isPro && plan === "free") || (isUltra && plan !== "ultra");

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={clsx(
          "bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300",
          isLocked && "opacity-70"
        )}
      >
        <div className={`h-1 bg-gradient-to-r ${color}`}></div>
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div className={clsx(
              "p-2.5 rounded-xl",
              color.includes('purple') ? 'bg-purple-100 dark:bg-purple-900/30' :
              color.includes('blue') ? 'bg-blue-100 dark:bg-blue-900/30' :
              color.includes('emerald') ? 'bg-emerald-100 dark:bg-emerald-900/30' :
              'bg-amber-100 dark:bg-amber-900/30'
            )}>
              <Icon className={clsx(
                "w-5 h-5",
                color.includes('purple') ? 'text-purple-600 dark:text-purple-400' :
                color.includes('blue') ? 'text-blue-600 dark:text-blue-400' :
                color.includes('emerald') ? 'text-emerald-600 dark:text-emerald-400' :
                'text-amber-600 dark:text-amber-400'
              )} />
            </div>

            {isLocked && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-2.5 py-1 text-xs font-bold">
                {isPro ? "Pro" : "Ultra"}
              </div>
            )}
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>

            {isLocked ? (
              <div className="mt-2 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            ) : (
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                {trend && (
                  <span className={clsx(
                    "text-xs px-2 py-1 rounded-full font-bold",
                    trend.isPositive ? "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30" : "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
                  )}>
                    {trend.isPositive ? "+" : "-"}{trend.value}%
                  </span>
                )}
              </div>
            )}

            {subtitle && !isLocked && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Cliques Totais"
        value={validClicks.length}
        subtitle={`${trend.value > 0 ? (trend.isPositive ? "Aumento" : "Redução") : "Sem mudança"} nos últimos 7 dias`}
        trend={trend}
        icon={BarChart2}
        color="from-blue-500 to-cyan-500"
      />

      <MetricCard
        title="Visitantes Únicos"
        value={plan === "free" ? "—" : uniqueVisitors}
        subtitle={plan !== "free" ? `${Math.round((uniqueVisitors / Math.max(validClicks.length, 1)) * 100)}% de retorno` : undefined}
        icon={Users}
        color="from-purple-500 to-pink-500"
        isPro={true}
      />

      <MetricCard
        title="Taxa de Cliques"
        value={plan === "ultra" ? `${ctr.toFixed(1)}%` : "—"}
        subtitle={plan === "ultra" ? `${Math.round(impressions)} impressões` : undefined}
        icon={MousePointer}
        color="from-emerald-500 to-teal-500"
        isUltra={true}
      />

      <MetricCard
        title="Principal País"
        value={plan === "ultra" ? topCountryName : "Brasil"}
        icon={Globe}
        color="from-amber-500 to-orange-500"
        isUltra={true}
      />
    </div>
  );
}

// Generate Chart Data - LÓGICA 100% ORIGINAL
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

// PÁGINA PRINCIPAL - LÓGICA 100% ORIGINAL, DESIGN MELHORADO
export default function ShortLinkDetailsPage() {
  const params = useParams();
  const linkId = params.linkId as string;
  const { user } = useUser();
  const [data, setData] = useState<PageData | undefined | null>(undefined);
  const [currentTab, setCurrentTab] = useState("overview");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // FETCH - 100% ORIGINAL
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

  // LÓGICA DE PLANOS - 100% ORIGINAL
  const isAdmin = user?.id === "user_2xQFGvNnpYHVJevgeCLWsnqdLqp";
  const userPlan = (user?.publicMetadata?.subscriptionPlan as string) ?? "free";
  const plan = isAdmin ? "ultra" : userPlan;

  const chartData = data?.clicks && Array.isArray(data.clicks) ? generateChartData(data.clicks) : null;

  // Loading State
  if (data === undefined) {
    return (
      <div className="flex flex-col justify-center items-center h-48 gap-3">
        <Loader2 className="animate-spin h-10 w-10 text-purple-500" />
        <p className="text-gray-500 text-sm">Carregando analytics...</p>
      </div>
    );
  }

  // Error State
  if (errorMessage || data === null) {
    return (
      <div className="text-center mt-12 px-4 max-w-md mx-auto">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-3xl flex items-center justify-center">
          <LinkIcon className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Link não encontrado</h2>
        <p className="text-gray-500 mb-6">
          {errorMessage || "O link que você está procurando não existe ou você não tem permissão para vê-lo."}
        </p>
        <Button asChild variant="link" className="inline-flex items-center text-purple-600">
          <Link href="/dashboard/shortener">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para a lista
          </Link>
        </Button>
      </div>
    );
  }

  const { link } = data;
  const shortUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/r/${link.id}`;
  const clicks = Array.isArray(data.clicks) ? data.clicks : [];

  return (
    <main className="max-w-6xl mx-auto w-full px-4 space-y-6 overflow-x-hidden pb-10">
      <div className="flex flex-col gap-2">
        <Button asChild variant="ghost" className="text-gray-500 hover:text-gray-900 dark:hover:text-white w-fit -ml-4 rounded-xl">
          <Link href="/dashboard/shortener" className="inline-flex items-center">
            <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
          </Link>
        </Button>

        {/* Header Card - Design Melhorado */}
        <header className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="flex items-start gap-4 min-w-0 max-w-full">
              <div className="p-3 bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 rounded-xl flex-shrink-0 text-white shadow-lg shadow-purple-500/30">
                <LinkIcon className="w-7 h-7" />
              </div>
              <div className="min-w-0 max-w-full">
                <div className="flex flex-wrap items-baseline gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate break-all">
                    freelinnk.com/r/{link.id}
                  </h1>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 text-xs rounded-lg border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        navigator.clipboard.writeText(shortUrl);
                        toast.success("Link copiado!");
                      }}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Copiar</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 text-xs rounded-lg border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Visitar</span>
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Criado em {new Date(link.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate max-w-full">
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate max-w-[200px] sm:max-w-[300px] md:max-w-sm hover:text-purple-600 hover:underline transition-colors"
                      title={link.url}
                    >
                      {link.url}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 self-stretch md:self-auto mt-4 md:mt-0 w-full md:w-auto">
              <Button
                variant="outline"
                className="gap-2 w-full md:w-auto rounded-xl border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  const shareUrl = `${shortUrl}?utm_source=freelink&utm_medium=share&utm_campaign=analytics`;
                  navigator.clipboard.writeText(shareUrl);
                  toast.success("Link de compartilhamento copiado!");
                }}
              >
                <Share2 className="w-4 h-4" />
                Compartilhar
              </Button>
            </div>
          </div>
        </header>
      </div>

      {/* Metrics Section */}
      <section>
        <AnalyticsMetrics clicks={clicks} plan={plan} />
      </section>

      {/* Tabs Section - Design Melhorado */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
        <Tabs defaultValue="overview" value={currentTab} onValueChange={setCurrentTab}>
          <div className="border-b border-gray-200 dark:border-gray-700 px-4 overflow-x-auto scrollbar-thin">
            <TabsList className="border-0 p-0 h-14 bg-transparent w-full justify-start">
              <TabsTrigger
                value="overview"
                className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:bg-transparent h-full whitespace-nowrap font-medium transition-colors"
              >
                Visão Geral
              </TabsTrigger>
              <TabsTrigger
                value="clicks"
                className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:bg-transparent h-full whitespace-nowrap font-medium transition-colors"
              >
                Todos os Clicks
              </TabsTrigger>
              <TabsTrigger
                value="devices"
                className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:bg-transparent h-full whitespace-nowrap font-medium transition-colors"
                disabled={plan === "free"}
              >
                Dispositivos
              </TabsTrigger>
              <TabsTrigger
                value="geo"
                className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:bg-transparent h-full whitespace-nowrap font-medium transition-colors"
                disabled={plan !== "ultra"}
              >
                Geografia
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4 sm:p-6">
            <TabsContent value="overview" className="m-0 p-0">
              <div className="space-y-6">
                {chartData && (
                  <Card className="rounded-2xl border-gray-200 dark:border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-purple-600" />
                        Desempenho nos últimos 7 dias
                      </CardTitle>
                      <CardDescription>
                        Total de {clicks.length} clique{clicks.length !== 1 ? 's' : ''} registrado{clicks.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AnalyticsChart
                        data={chartData.data}
                        labels={chartData.labels}
                        title="Cliques por dia"
                      />
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {plan !== "free" && (
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
                  )}

                  {plan === "ultra" && (
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
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Aba de Clicks */}
            <TabsContent value="clicks" className="m-0 p-0">
              <Card className="rounded-2xl border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    Histórico Completo de Clicks
                  </CardTitle>
                  <CardDescription>
                    Visualize todos os clicks com horário exato e detalhes completos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ClicksTable clicks={clicks} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="devices" className="m-0 p-0">
              {plan !== "free" ? (
                <div className="space-y-6">
                  <Card className="rounded-2xl border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-purple-600" />
                        Dispositivos
                      </CardTitle>
                      <CardDescription>
                        Distribuição detalhada por dispositivos, navegadores e sistemas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DeviceBreakdown clicks={clicks} />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center">
                    <Smartphone className="w-8 h-8 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Recurso disponível no plano Pro</h3>
                  <p className="text-gray-500 mb-4">
                    Faça upgrade para visualizar estatísticas detalhadas de dispositivos.
                  </p>
                  <Button asChild className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                    <Link href="/dashboard/billing">Ver Planos</Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="geo" className="m-0 p-0">
              {plan === "ultra" ? (
                <div className="space-y-6">
                  <Card className="rounded-2xl border-gray-200 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Globe className="w-5 h-5 text-purple-600" />
                        Geografia
                      </CardTitle>
                      <CardDescription>
                        Distribuição detalhada por país e região
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CountryMap clicks={clicks} />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl flex items-center justify-center">
                    <Globe className="w-8 h-8 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Recurso disponível no plano Ultra</h3>
                  <p className="text-gray-500 mb-4">
                    Faça upgrade para visualizar estatísticas geográficas detalhadas.
                  </p>
                  <Button asChild className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                    <Link href="/dashboard/billing">Ver Planos</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </section>
    </main>
  );
}