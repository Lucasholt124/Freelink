"use client";

import { useState, useEffect, useRef } from "react";
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
  ChevronDown,
  Download,
  Calendar,
  MousePointer,
  Smartphone,
  Laptop,
  Share2,
  Copy
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import clsx from "clsx";
import { motion } from "framer-motion";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type LinkData = { id: string; url: string; createdAt: number; };
type ClickData = {
  id: number;
  timestamp: number;
  country: string | null;
  visitorId: string;
  device?: string;
  browser?: string;
  os?: string;
  referrer?: string;
};
type PageData = { link: LinkData; clicks: ClickData[] };

// Mock data for charts
const generateChartData = (clicks: ClickData[]) => {
  // Last 7 days data
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

function AnalyticsChart({ data, labels, title }: { data: number[], labels: string[], title: string }) {
  const maxValue = Math.max(...data, 5);

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">{title}</h3>
      <div className="h-48 flex items-end gap-1">
        {data.map((value, index) => (
          <div key={index} className="group relative flex flex-col items-center flex-1">
            <div className="absolute bottom-full mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-800 text-white text-xs rounded px-2 py-1 pointer-events-none">
              {value} {value === 1 ? 'clique' : 'cliques'}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-t-4 border-l-4 border-r-4 border-transparent border-t-gray-800 w-0 h-0"></div>
            </div>
            <div
              className="w-full bg-purple-500 dark:bg-purple-600 rounded-t"
              style={{
                height: `${Math.max((value / maxValue) * 100, 4)}%`,
                opacity: value ? 1 : 0.3
              }}
            ></div>
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
  const devices = clicks.reduce((acc, click) => {
    const device = click.device || 'Desconhecido';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = clicks.length;
  const deviceData = Object.entries(devices).map(([name, count]) => ({
    name,
    count,
    percentage: total ? Math.round((count / total) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile') || device.toLowerCase().includes('phone'))
      return <Smartphone className="w-4 h-4 text-blue-500" />;
    if (device.toLowerCase().includes('tablet'))
      return <Smartphone className="w-4 h-4 text-green-500" />;
    if (device.toLowerCase().includes('desktop') || device.toLowerCase().includes('laptop'))
      return <Laptop className="w-4 h-4 text-purple-500" />;
    return <MousePointer className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="space-y-3 mt-4">
      {deviceData.map(device => (
        <div key={device.name} className="flex items-center">
          <div className="mr-3">
            {getDeviceIcon(device.name)}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">{device.name}</span>
              <span className="text-xs text-gray-500">{device.count} ({device.percentage}%)</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-500 dark:bg-purple-600 h-2 rounded-full"
                style={{ width: `${device.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CountryMap({ clicks }: { clicks: ClickData[] }) {
  const countries = clicks.reduce((acc, click) => {
    const country = click.country || 'Desconhecido';
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
              {countryData.map(country => (
                <div key={country.name} className="flex items-center justify-between py-2 px-3">
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{country.name}</span>
                  </div>
                  <span className="text-sm font-medium">{country.count}</span>
                </div>
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

function ClicksList({ clicks, setFilteredClicks }: { clicks: ClickData[], setFilteredClicks: (clicks: ClickData[]) => void }) {
  const [timeFilter, setTimeFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');

  useEffect(() => {
    let filtered = [...clicks];

    // Apply time filter
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

    // Apply country filter
    if (countryFilter !== 'all') {
      filtered = filtered.filter(click => click.country === countryFilter);
    }

    setFilteredClicks(filtered);
  }, [timeFilter, countryFilter, clicks, setFilteredClicks]);

  // Get unique countries for filter
  const countries = Array.from(new Set(clicks.map(click => click.country))).filter(Boolean) as string[];

  if (clicks.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-10 px-4">
        <Globe className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-1">Sem cliques ainda</h3>
        <p className="max-w-sm mx-auto">
          Este link ainda não recebeu nenhum clique. Compartilhe-o para começar a rastrear as visitas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select defaultValue="all" onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo período</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Últimos 7 dias</SelectItem>
              <SelectItem value="month">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>

          {countries.length > 0 && (
            <Select defaultValue="all" onValueChange={setCountryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="País" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os países</SelectItem>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="w-4 h-4 mr-1" />
              Exportar
              <ChevronDown className="ml-1 w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0">
            <div className="p-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => {
                  // Create CSV content
                  const headers = ['Data', 'Hora', 'País', 'Dispositivo', 'Navegador'];
                  const rows = clicks.map(click => [
                    new Date(click.timestamp).toLocaleDateString('pt-BR'),
                    new Date(click.timestamp).toLocaleTimeString('pt-BR'),
                    click.country || 'Desconhecido',
                    click.device || 'Desconhecido',
                    click.browser || 'Desconhecido'
                  ]);

                  const csvContent = [
                    headers.join(','),
                    ...rows.map(row => row.join(','))
                  ].join('\n');

                  // Create and download file
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `clicks-${new Date().toISOString().split('T')[0]}.csv`;
                  link.click();
                  URL.revokeObjectURL(url);

                  toast.success('Relatório CSV baixado!');
                }}
              >
                Exportar como CSV
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => {
                  // Create JSON content
                  const jsonContent = JSON.stringify(clicks, null, 2);

                  // Create and download file
                  const blob = new Blob([jsonContent], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `clicks-${new Date().toISOString().split('T')[0]}.json`;
                  link.click();
                  URL.revokeObjectURL(url);

                  toast.success('Relatório JSON baixado!');
                }}
              >
                Exportar como JSON
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-xs font-medium text-muted-foreground text-left p-3">Data e Hora</th>
                <th className="text-xs font-medium text-muted-foreground text-left p-3">País</th>
                <th className="text-xs font-medium text-muted-foreground text-left p-3">Dispositivo</th>
                <th className="text-xs font-medium text-muted-foreground text-left p-3">Navegador</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {clicks.map((click) => (
                <tr key={click.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <time dateTime={new Date(click.timestamp).toISOString()}>
                        {new Date(click.timestamp).toLocaleString("pt-BR", {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </time>
                    </div>
                  </td>
                  <td className="p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span>{click.country || "Desconhecido"}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm">
                    {click.device ? (
                      <div className="flex items-center gap-2">
                        {click.device.toLowerCase().includes('mobile') ? (
                          <Smartphone className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Laptop className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span>{click.device}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Desconhecido</span>
                    )}
                  </td>
                  <td className="p-3 text-sm">
                    {click.browser || (
                      <span className="text-muted-foreground">Desconhecido</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AnalyticsMetrics({
  clicks,
  plan,
}: {
  clicks: ClickData[];
  plan: string;
}) {
  const uniqueVisitors = new Set(clicks.map((c) => c.visitorId)).size;

  const calculateTopCountry = () => {
    if (clicks.length === 0) return "N/A";
    const countryCounts = clicks.reduce((acc, click) => {
      if (click.country) {
        acc[click.country] = (acc[click.country] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topCountry = Object.entries(countryCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];
    return topCountry ? topCountry[0] : "N/A";
  };

  const topCountryName = calculateTopCountry();

  // Calculate click-through rate (mock data for demonstration)
  const impressions = clicks.length * 2.5; // Simulate impressions
  const ctr = impressions > 0 ? (clicks.length / impressions) * 100 : 0;

  // Get recent trend (% change from previous period)
  const calculateTrend = () => {
    if (clicks.length < 2) return { value: 0, isPositive: true };

    const now = Date.now();
    const halfPeriod = 7 * 24 * 60 * 60 * 1000 / 2; // Half of 7 days in ms

    const recentClicks = clicks.filter(c => (now - c.timestamp) < halfPeriod).length;
    const olderClicks = clicks.filter(c => (now - c.timestamp) >= halfPeriod && (now - c.timestamp) < halfPeriod * 2).length;

    if (olderClicks === 0) return { value: recentClicks > 0 ? 100 : 0, isPositive: true };

    const percentChange = ((recentClicks - olderClicks) / olderClicks) * 100;
    return {
      value: Math.abs(Math.round(percentChange)),
      isPositive: percentChange >= 0
    };
  };

  const trend = calculateTrend();

  const Card = ({
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
      <Card
        title="Cliques Totais"
        value={clicks.length}
        subtitle={`${trend.value > 0 ? (trend.isPositive ? "Aumento" : "Redução") : "Sem mudança"} nos últimos 7 dias`}
        trend={trend}
        icon={BarChart2}
        color="from-blue-500 to-blue-600"
      />

      <Card
        title="Visitantes Únicos"
        value={plan === "free" ? "—" : uniqueVisitors}
        subtitle={plan !== "free" ? `${Math.round((uniqueVisitors / Math.max(clicks.length, 1)) * 100)}% de retorno` : undefined}
        icon={Users}
        color="from-purple-500 to-purple-600"
        isPro={true}
      />

      <Card
        title="Taxa de Cliques"
        value={plan === "ultra" ? `${ctr.toFixed(1)}%` : "—"}
        subtitle={plan === "ultra" ? `${Math.round(impressions)} impressões` : undefined}
        icon={MousePointer}
        color="from-emerald-500 to-emerald-600"
        isUltra={true}
      />

      <Card
        title="Principal País"
        value={plan === "ultra" ? topCountryName : "—"}
        icon={Globe}
        color="from-amber-500 to-amber-600"
        isUltra={true}
      />
    </div>
  );
}

export default function ShortLinkDetailsPage() {
  const params = useParams();
  const linkId = params.linkId as string;
  const { user } = useUser();
  const [data, setData] = useState<PageData | undefined | null>(undefined);
  const [filteredClicks, setFilteredClicks] = useState<ClickData[]>([]);
  const [currentTab, setCurrentTab] = useState("overview");
  const chartRef = useRef<HTMLDivElement>(null);

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
          setFilteredClicks(data.clicks);
        })
        .catch((err) => {
          toast.error(
            err.message || "Não foi possível carregar os detalhes do link."
          );
          setData(null);
        });
    }
  }, [linkId]);

  const isAdmin = user?.id === "user_301NTkVsE3v48SXkoCEp0XOXifI";
  const userPlan = (user?.publicMetadata?.subscriptionPlan as string) ?? "free";
  const plan = isAdmin ? "ultra" : userPlan;

  // Generate chart data
  const chartData = data?.clicks ? generateChartData(data.clicks) : null;

  if (data === undefined) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="animate-spin h-10 w-10 text-gray-400" />
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="text-center mt-12 px-4 max-w-md mx-auto">
        <h2 className="text-2xl font-semibold mb-2">Link não encontrado</h2>
        <p className="text-muted-foreground mb-6">
          O link que você está procurando não existe ou você não tem permissão
          para vê-lo.
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

  return (
    <main className="max-w-6xl mx-auto w-full px-4 space-y-8 overflow-x-hidden">
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
                  <h1 className="text-2xl font-bold truncate break-all">
                    freelinnk.com/r/{link.id}
                  </h1>
                  <div className="flex gap-2">
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
                      Copiar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 text-xs"
                      onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Visitar
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Criado em {new Date(link.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ExternalLink className="w-4 h-4" />
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate max-w-md hover:underline"
                    >
                      {link.url}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 self-stretch md:self-auto">
              <Button
                variant="outline"
                className="gap-1"
                onClick={() => {
                  // Generate shareable URL with UTM parameters
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
        <AnalyticsMetrics clicks={filteredClicks} plan={plan} />
      </section>

      <section className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <Tabs defaultValue="overview" value={currentTab} onValueChange={setCurrentTab}>
          <div className="border-b px-4">
            <TabsList className="border-0 p-0 h-14 bg-transparent w-full justify-start">
              <TabsTrigger
                value="overview"
                className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent h-full"
              >
                Visão Geral
              </TabsTrigger>
              <TabsTrigger
                value="clicks"
                className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent h-full"
              >
                Registros de Cliques
              </TabsTrigger>
              <TabsTrigger
                value="devices"
                className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent h-full"
                disabled={plan === "free"}
              >
                Dispositivos
              </TabsTrigger>
              <TabsTrigger
                value="geo"
                className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent h-full"
                disabled={plan !== "ultra"}
              >
                Geografia
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="overview" className="m-0 p-0">
              <div className="space-y-6">
                {chartData && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Desempenho nos últimos 7 dias</CardTitle>
                      <CardDescription>
                        Total de {filteredClicks.length} clique{filteredClicks.length !== 1 ? 's' : ''} registrado{filteredClicks.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div ref={chartRef}>
                        <AnalyticsChart
                          data={chartData.data}
                          labels={chartData.labels}
                          title="Cliques por dia"
                        />
                      </div>
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
                        <DeviceBreakdown clicks={filteredClicks} />
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
                        <CountryMap clicks={filteredClicks} />
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="clicks" className="m-0 p-0">
              <ClicksList clicks={filteredClicks} setFilteredClicks={setFilteredClicks} />
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
                      <DeviceBreakdown clicks={filteredClicks} />
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
                      <CountryMap clicks={filteredClicks} />
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