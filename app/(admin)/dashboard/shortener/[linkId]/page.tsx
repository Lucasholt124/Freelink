"use client";

import { useState, useEffect, useMemo, ElementType } from "react";
import { useParams, useRouter } from "next/navigation";

import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,  Clock, Globe, Loader2, Users,
  ExternalLink, Link as LinkIcon, Download, Smartphone,
  Laptop, Share2, Copy, MapPin, Search, Zap, MousePointer
} from "lucide-react";

// Componentes UI (Assumindo que você usa Shadcn/UI, se não, adapte os imports)
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import clsx from "clsx";

// ==========================================
// 🧠 TIPOS E DADOS
// ==========================================

type ClickData = {
  id: string;
  timestamp: number;
  country: string | null;
  region: string | null; // Estado
  city: string | null;   // Cidade
  visitorId: string;
  userAgent?: string;
  referrer?: string;
};

type PageData = {
  link: { id: string; url: string; createdAt: number };
  clicks: ClickData[];
};

// ==========================================
// 🎨 COMPONENTES DE VISUALIZAÇÃO (MODULARES)
// ==========================================

// 1. MAPA DE CALOR (Horários de Pico)
function TimeHeatmap({ clicks }: { clicks: ClickData[] }) {
  const data = useMemo(() => {
    const grid = Array(7).fill(0).map(() => Array(24).fill(0));
    let max = 0;
    clicks.forEach(c => {
      const d = new Date(c.timestamp);
      const day = d.getDay();
      const hour = d.getHours();
      grid[day][hour]++;
      if (grid[day][hour] > max) max = grid[day][hour];
    });
    return { grid, max };
  }, [clicks]);

  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-thin">
      <div className="min-w-[600px] flex flex-col gap-1">
        <div className="flex pl-10 mb-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex-1 text-[10px] text-muted-foreground text-center border-l border-dashed border-gray-200 dark:border-gray-800">
              {i * 2}h
            </div>
          ))}
        </div>
        {data.grid.map((row, d) => (
          <div key={d} className="flex items-center gap-1">
            <span className="w-10 text-[10px] font-semibold text-muted-foreground uppercase">{days[d]}</span>
            {row.map((val, h) => (
              <motion.div
                key={`${d}-${h}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: d * 0.05 + h * 0.005 }}
                className="flex-1 aspect-square rounded-[2px] relative group cursor-help"
                style={{
                  backgroundColor: val === 0
                    ? 'rgba(128, 128, 128, 0.05)'
                    : `rgba(124, 58, 237, ${Math.min(Math.max(val / data.max, 0.15) + 0.1, 1)})`,
                }}
              >
                {val > 0 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-50">
                    {val} clicks às {h}:00
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-end items-center mt-2 gap-2 text-[10px] text-muted-foreground px-2">
        <span>Baixa Intensidade</span>
        <div className="w-16 h-2 rounded-full bg-gradient-to-r from-purple-100 to-purple-600 dark:from-purple-900/20 dark:to-purple-500"></div>
        <span>Alta Intensidade</span>
      </div>
    </div>
  );
}

// 2. RANKING GEOGRÁFICO (Cidades e Estados)
function GeoRanking({ clicks, type }: { clicks: ClickData[], type: 'city' | 'region' | 'country' }) {
  const ranking = useMemo(() => {
    const counts: Record<string, number> = {};
    clicks.forEach(c => {
      let key = c[type] || 'Desconhecido';
      if (key === 'Desconhecido' && type === 'country') key = 'Outros';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6); // Top 6
  }, [clicks, type]);

  const maxVal = ranking[0]?.[1] || 1;

  return (
    <div className="space-y-3">
      {ranking.map(([name, count], i) => (
        <motion.div
          key={name}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="relative"
        >
          <div className="flex justify-between text-sm mb-1 z-10 relative">
            <span className="font-medium flex items-center gap-2 truncate max-w-[80%]">
              {i === 0 && <span className="text-yellow-500 text-xs">🥇</span>}
              {i === 1 && <span className="text-gray-400 text-xs">🥈</span>}
              {i === 2 && <span className="text-amber-700 text-xs">🥉</span>}
              <span className="truncate" title={name}>{name}</span>
            </span>
            <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{count}</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(count / maxVal) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={clsx(
                "h-full rounded-full",
                type === 'city' ? "bg-pink-500" : type === 'region' ? "bg-blue-500" : "bg-emerald-500"
              )}
            />
          </div>
        </motion.div>
      ))}
      {ranking.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">Sem dados suficientes ainda.</div>
      )}
    </div>
  );
}

// 3. TABELA COMPLETA (Filtro e Exportação)
function ClicksTable({ clicks }: { clicks: ClickData[] }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = useMemo(() => {
    return clicks.filter(c =>
      c.city?.toLowerCase().includes(search.toLowerCase()) ||
      c.country?.toLowerCase().includes(search.toLowerCase()) ||
      c.referrer?.toLowerCase().includes(search.toLowerCase()) ||
      c.userAgent?.toLowerCase().includes(search.toLowerCase())
    );
  }, [clicks, search]);

  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const exportCSV = () => {
    const headers = ['ID', 'Data', 'Hora', 'País', 'Estado', 'Cidade', 'Dispositivo', 'Referrer'];
    const rows = filtered.map(c => [
      c.id, new Date(c.timestamp).toLocaleDateString(), new Date(c.timestamp).toLocaleTimeString(),
      c.country || '-', c.region || '-', c.city || '-',
      c.userAgent?.includes('Mobile') ? 'Mobile' : 'Desktop', c.referrer || 'Direto'
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clicks_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Relatório baixado!");
  };

  const getDeviceIcon = (ua?: string) => {
    if (!ua) return <Globe className="w-4 h-4 text-gray-400" />;
    return ua.toLowerCase().includes('mobile')
      ? <Smartphone className="w-4 h-4 text-pink-500" />
      : <Laptop className="w-4 h-4 text-purple-500" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cidade, origem..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
          <Download className="w-4 h-4" /> Exportar CSV
        </Button>
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-900 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
            <tr>
              <th className="p-3 pl-4">Data</th>
              <th className="p-3">Localização</th>
              <th className="p-3">Origem</th>
              <th className="p-3 text-center">Dispositivo</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <AnimatePresence>
              {paginated.map((click) => (
                <motion.tr
                  key={click.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="p-3 pl-4">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{new Date(click.timestamp).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3"/> {new Date(click.timestamp).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                       <span className="text-lg" title={click.country || ''}>
                         {click.country === 'Brazil' || click.country === 'Brasil' ? '🇧🇷' : '🌍'}
                       </span>
                       <div>
                         <div className="font-medium truncate max-w-[120px]">{click.city || 'Desconhecido'}</div>
                         <div className="text-xs text-muted-foreground">{click.region || click.country}</div>
                       </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="truncate max-w-[150px] text-xs font-mono bg-muted/50 p-1 rounded" title={click.referrer || ''}>
                      {click.referrer ? click.referrer.replace('https://', '').replace('http://', '').split('/')[0] : 'Direto'}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center">{getDeviceIcon(click.userAgent)}</div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {paginated.length === 0 && <div className="p-8 text-center text-muted-foreground">Nenhum clique encontrado.</div>}
      </div>

      {/* Paginação Simples */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Página {page} de {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Próxima</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// 4. CARD DE MÉTRICA PRINCIPAL
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ElementType;
  color: string;
  trend?: number;
}

function MetricCard({ title, value, icon: Icon, color, trend }: MetricCardProps) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="bg-card border rounded-xl p-5 shadow-sm relative overflow-hidden group"
        >
            <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                <Icon className="w-16 h-16" />
            </div>
            <div className="flex flex-col justify-between h-full relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-md bg-white dark:bg-slate-800 shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-gray-700`}>
                        <Icon className={`w-4 h-4 ${color.replace('bg-', 'text-')}`} />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{title}</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight">{value}</span>
                    {trend && (
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {trend > 0 ? '+' : ''}{trend}%
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

// ==========================================
// 🚀 PÁGINA PRINCIPAL
// ==========================================

export default function ShortLinkDetailsPage() {
  const params = useParams();
  const linkId = params.linkId as string;
  const router = useRouter();
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("overview");

  useEffect(() => {
    if (!linkId) return;
    fetch(`/api/shortener/${linkId}`)
      .then(res => {
          if(!res.ok) throw new Error("Erro");
          return res.json();
      })
      .then(data => { setData(data); setLoading(false); })
      .catch(() => { toast.error("Erro ao carregar link"); setLoading(false); });
  }, [linkId]);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-purple-600"/>
      <p className="text-muted-foreground animate-pulse">Analisando cliques...</p>
    </div>
  );

  if (!data || !data.link) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-2xl font-bold">Link não encontrado</h2>
        <Button onClick={() => router.back()} variant="outline"><ArrowLeft className="mr-2 w-4 h-4"/> Voltar</Button>
    </div>
  );

  const { link, clicks } = data;
  const shortUrl = typeof window !== 'undefined' ? `${window.location.origin}/r/${link.id}` : '';

  // Cálculos Rápidos
  const uniqueVisitors = new Set(clicks.map(c => c.visitorId)).size;
  const mobileCount = clicks.filter(c => c.userAgent?.toLowerCase().includes('mobile')).length;
  const desktopCount = clicks.length - mobileCount;
  const topCountry = clicks.length > 0 ? (clicks.sort((a,b) =>
      clicks.filter(v => v.country === a.country).length - clicks.filter(v => v.country === b.country).length
  ).pop()?.country || '—') : '—';

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8 pb-24">

      {/* 1. HEADER HERO */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-5 w-full md:w-auto overflow-hidden">
          <div className="relative group">
            <div className="absolute inset-0 bg-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative p-3.5 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl text-white shadow-xl">
              <LinkIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
             <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold tracking-tight truncate">/{link.id}</h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                  Ativo
                </span>
             </div>
             <a href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-purple-600 transition-colors truncate group">
                {link.url} <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100"/>
             </a>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
             <Button variant="outline" className="flex-1 md:flex-none shadow-sm" onClick={() => {
                 navigator.clipboard.writeText(shortUrl);
                 toast.success("Link encurtado copiado!");
             }}>
                 <Copy className="w-4 h-4 mr-2"/> <span className="hidden sm:inline">Copiar</span>
             </Button>
             <Button className="flex-1 md:flex-none bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-500/20" onClick={() => {
                 navigator.clipboard.writeText(`${shortUrl}?source=share`);
                 toast.success("Link pronto para compartilhar!");
             }}>
                 <Share2 className="w-4 h-4 mr-2"/> Compartilhar
             </Button>
        </div>
      </div>

      {/* 2. GRID DE MÉTRICAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Cliques Totais" value={clicks.length} icon={MousePointer} color="text-blue-500" trend={12} />
        <MetricCard title="Visitantes Únicos" value={uniqueVisitors} icon={Users} color="text-purple-500" />
        <MetricCard title="Taxa Mobile" value={`${Math.round((mobileCount / (clicks.length || 1)) * 100)}%`} icon={Smartphone} color="text-pink-500" />
        <MetricCard title="Principal País" value={topCountry} icon={Globe} color="text-emerald-500" />
      </div>

      {/* 3. CONTEÚDO PRINCIPAL (ABAS) */}
      <Tabs defaultValue="overview" value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <div className="flex items-center justify-between border-b pb-1 overflow-x-auto">
            <TabsList className="bg-transparent h-auto p-0 space-x-6">
                {['overview', 'geo', 'list'].map((tab) => (
                    <TabsTrigger
                        key={tab}
                        value={tab}
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:bg-transparent px-2 py-3 text-sm font-medium capitalize hover:text-purple-500 transition-colors"
                    >
                        {tab === 'overview' ? 'Visão Geral & Horários' : tab === 'geo' ? 'Geolocalização Detalhada' : 'Histórico Completo'}
                    </TabsTrigger>
                ))}
            </TabsList>
        </div>

        <AnimatePresence mode="wait">
            {/* --- ABA 1: VISÃO GERAL --- */}
            <TabsContent value="overview" className="space-y-6 focus-visible:outline-none">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="grid lg:grid-cols-3 gap-6">
                    {/* HEATMAP (2 Colunas) */}
                    <Card className="lg:col-span-2 shadow-sm border-purple-100 dark:border-purple-900/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Zap className="w-5 h-5 text-amber-500 fill-amber-500"/>
                                Melhores Horários
                            </CardTitle>
                            <CardDescription>Mapa de calor mostrando a intensidade de cliques por dia e hora.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             {clicks.length > 0 ? <TimeHeatmap clicks={clicks} /> : <div className="h-40 flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg">Sem dados suficientes</div>}
                        </CardContent>
                    </Card>

                    {/* DISPOSITIVOS (1 Coluna) */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Dispositivos</CardTitle>
                            <CardDescription>Mobile vs Desktop</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col justify-center h-[200px]">
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-pink-500"/> Mobile</span>
                                        <span className="font-bold">{Math.round((mobileCount/(clicks.length||1))*100)}%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-pink-500 rounded-full" style={{ width: `${(mobileCount/(clicks.length||1))*100}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="flex items-center gap-2"><Laptop className="w-4 h-4 text-purple-500"/> Desktop</span>
                                        <span className="font-bold">{Math.round((desktopCount/(clicks.length||1))*100)}%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(desktopCount/(clicks.length||1))*100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </TabsContent>

            {/* --- ABA 2: GEOLOCALIZAÇÃO --- */}
            <TabsContent value="geo" className="focus-visible:outline-none">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-pink-500"/> Cidades Principais</CardTitle>
                            <CardDescription>De onde vêm exatamente seus cliques</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GeoRanking clicks={clicks} type="city" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-blue-500"/> Estados / Regiões</CardTitle>
                            <CardDescription>Concentração regional do tráfego</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GeoRanking clicks={clicks} type="region" />
                        </CardContent>
                    </Card>
                </motion.div>
            </TabsContent>

            {/* --- ABA 3: LISTA COMPLETA --- */}
            <TabsContent value="list" className="focus-visible:outline-none">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Registro de Tráfego</CardTitle>
                            <CardDescription>Visualize, filtre e exporte cada clique recebido.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ClicksTable clicks={clicks} />
                        </CardContent>
                    </Card>
                </motion.div>
            </TabsContent>
        </AnimatePresence>
      </Tabs>
    </main>
  );
}