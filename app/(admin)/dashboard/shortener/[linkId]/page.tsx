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

// 🎯 NOVO: Componente de Click Individual com Animação
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
      className="hover:bg-muted/50 transition-colors border-b border-gray-100 dark:border-gray-800"
    >
      <td className="p-4">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
            className="w-2 h-2 bg-green-500 rounded-full"
          />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {click.id}
          </span>
        </div>
      </td>

      <td className="p-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{formatDate(click.timestamp)}</span>
        </div>
      </td>

      <td className="p-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-mono font-medium text-purple-600 dark:text-purple-400">
            {formatTime(click.timestamp)}
          </span>
        </div>
      </td>

      <td className="p-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{click.country || "Brasil"}</span>
        </div>
      </td>

      <td className="p-4">
        <div className="flex items-center gap-2">
          {getDeviceIcon(click.userAgent)}
          <span className="text-sm truncate max-w-[150px]" title={click.userAgent || "Desconhecido"}>
            {click.userAgent ? (
              click.userAgent.includes('Mobile') || click.userAgent.includes('iPhone') ? 'Mobile' : 'Desktop'
            ) : 'Desconhecido'}
          </span>
        </div>
      </td>

      <td className="p-4">
        <span className="text-xs text-muted-foreground font-mono truncate max-w-[120px] block" title={click.visitorId}>
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

// 🎯 NOVO: Tabela Grande de Clicks com Animações
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
      <div className="text-center py-12 px-4">
        <Activity className="w-12 h-12 mx-auto text-gray-400 mb-3 opacity-50" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Nenhum click registrado
        </h3>
        <p className="text-sm text-muted-foreground">
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
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os clicks</SelectItem>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Últimos 7 dias</SelectItem>
            <SelectItem value="month">Últimos 30 dias</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          className="gap-2"
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
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Clicks</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                {filteredClicks.length}
              </p>
            </div>
          </div>

          {timeFilter !== 'all' && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Do total de</p>
              <p className="text-lg font-semibold">{clicks.length}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabela Desktop */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Data
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Horário Exato
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  País
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Dispositivo
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Visitor ID
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
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
              className="bg-white dark:bg-gray-800 rounded-lg border p-4 space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
                    className="w-2 h-2 bg-green-500 rounded-full"
                  />
                  <span className="text-sm font-semibold">Click #{click.id}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(click.timestamp).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 rounded-md p-2">
                <Clock className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-mono font-medium text-purple-600 dark:text-purple-400">
                  {new Date(click.timestamp).toLocaleTimeString('pt-BR')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span>{click.country || "Brasil"}</span>
                </div>
                <div className="flex items-center gap-2">
                  {click.userAgent?.toLowerCase().includes('mobile') ? (
                    <Smartphone className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Laptop className="w-4 h-4 text-purple-500" />
                  )}
                  <span className="truncate">
                    {click.userAgent?.includes('Mobile') ? 'Mobile' : 'Desktop'}
                  </span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <div>
                  <span className="font-medium">Visitor: </span>
                  <span className="font-mono">{click.visitorId.substring(0, 16)}...</span>
                </div>
                <div>
                  <span className="font-medium">Referrer: </span>
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

// [Manter os outros componentes: AnalyticsChart, DeviceBreakdown, CountryMap, AnalyticsMetrics - sem alterações]

function AnalyticsChart({ data, labels, title }: { data: number[], labels: string[], title: string }) {
  const maxValue = Math.max(...data, 5);

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">{title}</h3>
      <div className="h-48 flex items-end gap-1">
        {data.map((value, index) => (
          <div key={index} className="group relative flex flex-col items-center flex-1">
            <div className="absolute bottom-full mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded px-2 py-1 pointer-events-none z-10">
              {value} {value === 1 ? 'clique' : 'cliques'}
            </div>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max((value / maxValue) * 100, 4)}%` }}
              transition={{ delay: index * 0.1, duration: 0.5, type: "spring" }}
              className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t"
              style={{ opacity: value ? 1 : 0.3 }}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
              {new Date(labels[index]).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

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
      return <Smartphone className="w-4 h-4 text-blue-500" />;
    if (device.toLowerCase().includes('tablet'))
      return <Smartphone className="w-4 h-4 text-green-500" />;
    return <Laptop className="w-4 h-4 text-purple-500" />;
  };

  return (
    <div className="space-y-3 mt-4">
      {deviceData.map((device, index) => (
        <motion.div
          key={device.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center"
        >
          <div className="mr-3">
            {getDeviceIcon(device.name)}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">{device.name}</span>
              <span className="text-xs text-gray-500">{device.count} ({device.percentage}%)</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${device.percentage}%` }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      ))}

      {deviceData.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          Nenhum dado de dispositivo disponível
        </div>
      )}
    </div>
  );
}

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
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="p-3 bg-muted/50">
          <h3 className="text-sm font-medium">Principais Países</h3>
        </div>
        <div className="p-1">
          {countryData.length > 0 ? (
            <div className="divide-y">
              {countryData.map((country, index) => (
                <motion.div
                  key={country.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between py-2 px-3"
                >
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{country.name}</span>
                  </div>
                  <span className="text-sm font-medium">{country.count}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-3 text-center text-sm text-muted-foreground">
              Nenhum dado de país disponível
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
          "bg-card rounded-xl border overflow-hidden",
          isLocked && "opacity-70"
        )}
      >
        <div className={`p-0.5 bg-gradient-to-r ${color}`}></div>
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div className={`p-2 rounded-lg ${color.includes('from-purple') ? 'bg-purple-100 dark:bg-purple-900/20' : color.includes('from-blue') ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-emerald-100 dark:bg-emerald-900/20'}`}>
              <Icon className={`w-5 h-5 ${color.includes('from-purple') ? 'text-purple-600 dark:text-purple-400' : color.includes('from-blue') ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
            </div>

            {isLocked && (
              <div className="bg-muted rounded-full px-2 py-0.5 text-xs text-muted-foreground">
                {isPro ? "Pro" : "Ultra"}
              </div>
            )}
          </div>

          <div className="mt-3">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>

            {isLocked ? (
              <div className="mt-1 h-7 bg-muted rounded animate-pulse"></div>
            ) : (
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-bold">{value}</p>
                {trend && (
                  <span className={clsx(
                    "text-xs px-1.5 py-0.5 rounded-full font-medium",
                    trend.isPositive ? "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20" : "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/20"
                  )}>
                    {trend.isPositive ? "+" : "-"}{trend.value}%
                  </span>
                )}
              </div>
            )}

            {subtitle && !isLocked && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard
        title="Cliques Totais"
        value={validClicks.length}
        subtitle={`${trend.value > 0 ? (trend.isPositive ? "Aumento" : "Redução") : "Sem mudança"} nos últimos 7 dias`}
        trend={trend}
        icon={BarChart2}
        color="from-blue-500 to-blue-600"
      />

      <MetricCard
        title="Visitantes Únicos"
        value={plan === "free" ? "—" : uniqueVisitors}
        subtitle={plan !== "free" ? `${Math.round((uniqueVisitors / Math.max(validClicks.length, 1)) * 100)}% de retorno` : undefined}
        icon={Users}
        color="from-purple-500 to-purple-600"
        isPro={true}
      />

      <MetricCard
        title="Taxa de Cliques"
        value={plan === "ultra" ? `${ctr.toFixed(1)}%` : "—"}
        subtitle={plan === "ultra" ? `${Math.round(impressions)} impressões` : undefined}
        icon={MousePointer}
        color="from-emerald-500 to-emerald-600"
        isUltra={true}
      />

      <MetricCard
        title="Principal País"
        value={plan === "ultra" ? topCountryName : "Brasil"}
        icon={Globe}
        color="from-amber-500 to-amber-600"
        isUltra={true}
      />
    </div>
  );
}

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

  const isAdmin = user?.id === "user_301NTkVsE3v48SXkoCEp0XOXifI";
  const userPlan = (user?.publicMetadata?.subscriptionPlan as string) ?? "free";
  const plan = isAdmin ? "ultra" : userPlan;

  const chartData = data?.clicks && Array.isArray(data.clicks) ? generateChartData(data.clicks) : null;

  if (data === undefined) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="animate-spin h-10 w-10 text-gray-400" />
      </div>
    );
  }

  if (errorMessage || data === null) {
    return (
      <div className="text-center mt-12 px-4 max-w-md mx-auto">
        <h2 className="text-2xl font-semibold mb-2">Link não encontrado</h2>
        <p className="text-muted-foreground mb-6">
          {errorMessage || "O link que você está procurando não existe ou você não tem permissão para vê-lo."}
        </p>
        <Button asChild variant="link" className="inline-flex items-center">
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
    <main className="max-w-6xl mx-auto w-full px-4 space-y-8 overflow-x-hidden pb-10">
      <div className="flex flex-col gap-2">
        <Button asChild variant="ghost" className="text-muted-foreground w-fit -ml-4">
          <Link href="/dashboard/shortener" className="inline-flex items-center">
            <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
          </Link>
        </Button>

        <header className="bg-white dark:bg-slate-800 rounded-xl border p-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="flex items-start gap-5 min-w-0 max-w-full">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex-shrink-0 text-white">
                <LinkIcon className="w-7 h-7" />
              </div>
              <div className="min-w-0 max-w-full">
                <div className="flex flex-wrap items-baseline gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-bold truncate break-all">
                    freelinnk.com/r/{link.id}
                  </h1>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 text-xs"
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
                      className="h-7 gap-1 text-xs"
                      onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Visitar</span>
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Criado em {new Date(link.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-1 truncate max-w-full">
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate max-w-[200px] sm:max-w-[300px] md:max-w-sm hover:underline"
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
                className="gap-1 w-full md:w-auto"
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

      <section>
        <AnalyticsMetrics clicks={clicks} plan={plan} />
      </section>

      <section className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <Tabs defaultValue="overview" value={currentTab} onValueChange={setCurrentTab}>
          <div className="border-b px-4 overflow-x-auto scrollbar-thin">
            <TabsList className="border-0 p-0 h-14 bg-transparent w-full justify-start">
              <TabsTrigger
                value="overview"
                className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent h-full whitespace-nowrap"
              >
                Visão Geral
              </TabsTrigger>
              <TabsTrigger
                value="clicks"
                className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent h-full whitespace-nowrap"
              >
                Todos os Clicks
              </TabsTrigger>
              <TabsTrigger
                value="devices"
                className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent h-full whitespace-nowrap"
                disabled={plan === "free"}
              >
                Dispositivos
              </TabsTrigger>
              <TabsTrigger
                value="geo"
                className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent h-full whitespace-nowrap"
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
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Desempenho nos últimos 7 dias</CardTitle>
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
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Dispositivos</CardTitle>
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
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Localização</CardTitle>
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

            {/* 🎯 NOVA ABA: Tabela Grande de Clicks */}
            <TabsContent value="clicks" className="m-0 p-0">
              <Card>
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Dispositivos</CardTitle>
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
                  <h3 className="text-lg font-medium mb-2">Recurso disponível no plano Pro</h3>
                  <p className="text-muted-foreground mb-4">
                    Faça upgrade para visualizar estatísticas detalhadas de dispositivos.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/billing">Ver Planos</Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="geo" className="m-0 p-0">
              {plan === "ultra" ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Geografia</CardTitle>
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
                  <h3 className="text-lg font-medium mb-2">Recurso disponível no plano Ultra</h3>
                  <p className="text-muted-foreground mb-4">
                    Faça upgrade para visualizar estatísticas geográficas detalhadas.
                  </p>
                  <Button asChild>
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