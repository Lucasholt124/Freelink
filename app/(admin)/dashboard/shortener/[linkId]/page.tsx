"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Globe, Loader2, Users, ExternalLink,
  Link as LinkIcon, Download, Smartphone, Laptop, Share2, Copy,
  MapPin, Zap, MousePointer,
} from "lucide-react";

// Imports de UI (Mantenha seus caminhos atuais)
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import clsx from "clsx";

// ==========================================
// 🧠 TIPAGEM ESTRITA (Zero 'any')
// ==========================================

interface ClickData {
  id: string;
  timestamp: number;
  country: string | null;
  region: string | null;
  city: string | null;
  visitorId: string;
  userAgent?: string | null;
  referrer?: string | null;
}

interface LinkData {
  id: string;
  url: string;
  createdAt: number;
}

interface PageData {
  link: LinkData;
  clicks: ClickData[];
}

interface GeoBarProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  delay: number;
}

// ==========================================
// 🧩 COMPONENTES VISUAIS
// ==========================================

// 1. HEATMAP (Com Tipagem Correta e Scroll Mobile)
function TimeHeatmap({ clicks }: { clicks: ClickData[] }) {
  const data = useMemo(() => {
    // Inicializa grid 7x24 com zeros
    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    let max = 0;

    clicks.forEach((c) => {
      const d = new Date(c.timestamp);
      const day = d.getDay(); // 0-6
      const hour = d.getHours(); // 0-23
      grid[day][hour]++;
      if (grid[day][hour] > max) max = grid[day][hour];
    });

    return { grid, max };
  }, [clicks]);

  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="w-full overflow-x-auto pb-4">
      {/* min-w define que em telas pequenas ele vai scrollar em vez de esmagar */}
      <div className="min-w-[600px] flex flex-col gap-1.5">
        <div className="flex pl-8 mb-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex-1 text-[10px] text-muted-foreground text-center border-l border-dashed border-gray-200 dark:border-gray-800 h-2">
              {i * 2}h
            </div>
          ))}
        </div>
        {data.grid.map((row, d) => (
          <div key={d} className="flex items-center gap-1">
            <span className="w-8 text-[10px] font-bold text-muted-foreground uppercase">{days[d]}</span>
            {row.map((val, h) => (
              <div
                key={`${d}-${h}`}
                className="flex-1 aspect-square rounded-[2px] relative group transition-all hover:scale-110 hover:z-10"
                style={{
                  backgroundColor: val === 0
                    ? 'var(--muted)'
                    : `rgba(124, 58, 237, ${Math.min(Math.max(val / (data.max || 1), 0.2), 1)})`,
                  opacity: val === 0 ? 0.2 : 1
                }}
                title={`${val} clicks às ${h}h`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. RANKING GEO (Tipado)
function GeoBar({ label, count, total, color }: GeoBarProps) {
  return (
    <div className="mb-3 last:mb-0 group">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[70%]">{label}</span>
        <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500">{count}</span>
      </div>
      <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(count / Math.max(total, 1)) * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={clsx("h-full rounded-full shadow-sm", color)}
        />
      </div>
    </div>
  );
}

// 3. TABELA RESPONSIVA (Tipada)
function ClicksTable({ clicks }: { clicks: ClickData[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return clicks.filter(c =>
      (c.city || "").toLowerCase().includes(lowerSearch) ||
      (c.country || "").toLowerCase().includes(lowerSearch) ||
      (c.referrer || "").toLowerCase().includes(lowerSearch)
    );
  }, [clicks, searchTerm]);

  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const exportCsv = () => {
    const headers = ["Data", "Hora", "País", "Cidade", "Origem", "Dispositivo"];
    const rows = filtered.map(c => [
      new Date(c.timestamp).toLocaleDateString(),
      new Date(c.timestamp).toLocaleTimeString(),
      c.country || "N/A",
      c.city || "N/A",
      c.referrer || "Direto",
      c.userAgent || "N/A"
    ]);
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "relatorio_clicks.csv");
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(url); // Limpeza de memória
    toast.success("Download iniciado!");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <Input
          placeholder="Pesquisar cidade, país..."
          className="max-w-xs bg-white dark:bg-slate-900"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
        />
        <Button variant="outline" size="sm" onClick={exportCsv} className="w-full sm:w-auto">
          <Download className="w-4 h-4 mr-2"/> CSV
        </Button>
      </div>

      <div className="rounded-xl border bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 font-medium">
              <tr>
                <th className="p-4 w-[140px]">Data</th>
                <th className="p-4">Local</th>
                <th className="p-4 hidden md:table-cell">Origem</th>
                <th className="p-4 text-center">Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paginated.map((click) => (
                <tr key={click.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{new Date(click.timestamp).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-400">{new Date(click.timestamp).toLocaleTimeString()}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <span className="text-lg">{click.country === 'Brasil' || click.country === 'Brazil' ? '🇧🇷' : '🌍'}</span>
                       <div>
                         <div className="font-medium truncate max-w-[100px] sm:max-w-[200px]">{click.city || "Desconhecido"}</div>
                         <div className="text-xs text-gray-400">{click.region || click.country}</div>
                       </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="truncate block max-w-[150px] text-gray-500" title={click.referrer || "Direto"}>
                      {(click.referrer && click.referrer.replace('https://', '')) || 'Direto'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center text-gray-500">
                      {(click.userAgent || "").toLowerCase().includes('mobile') ? <Smartphone className="w-4 h-4 text-blue-500"/> : <Laptop className="w-4 h-4 text-purple-500"/>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paginated.length === 0 && <div className="p-8 text-center text-gray-500">Nenhum dado encontrado.</div>}
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
        <span className="text-xs text-gray-500">Pág {page} de {totalPages || 1}</span>
        <Button variant="ghost" size="sm" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}>Próxima</Button>
      </div>
    </div>
  );
}

// 4. CARD MÉTRICA (Tipado)
function MetricCard({ title, value, icon: Icon, color, delay }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border p-5 shadow-sm group hover:shadow-md transition-shadow"
    >
      <div className={`absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity ${color}`}>
        <Icon className="w-24 h-24" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-800 ${color.replace('text-', 'text-opacity-80 ')}`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <span className="text-sm font-medium text-gray-500">{title}</span>
        </div>
        <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {value}
        </div>
      </div>
    </motion.div>
  );
}

// ==========================================
// 🚀 PÁGINA PRINCIPAL (Tipada)
// ==========================================

export default function ShortLinkDetailsPage() {
  const params = useParams();
  const linkId = params.linkId as string;
  const router = useRouter();

  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!linkId) return;

    fetch(`/api/shortener/${linkId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao buscar dados");
        return res.json();
      })
      .then((d: PageData) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        // Opcional: toast.error("Erro ao carregar link");
      });
  }, [linkId]);

  if (loading) return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      <span className="text-sm text-gray-500 animate-pulse">Carregando analytics...</span>
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-xl font-bold">Link não encontrado</h2>
      <Button onClick={() => router.back()} variant="outline"><ArrowLeft className="mr-2 w-4 h-4"/> Voltar</Button>
    </div>
  );

  const { link, clicks } = data;
  const shortUrl = typeof window !== 'undefined' ? `${window.location.origin}/r/${link.id}` : '';

  // Métricas Calculadas
  const uniqueVisitors = new Set(clicks.map(c => c.visitorId)).size;
  const mobileCount = clicks.filter(c => (c.userAgent || "").toLowerCase().includes('mobile')).length;
  const desktopCount = clicks.length - mobileCount;

  // Agrupamento Geo (Tipado)
  const cities = clicks.reduce<Record<string, number>>((acc, c) => {
    const k = c.city || 'Desconhecido';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  // Converte objeto para array de tuplas [string, number] para ordenar
  const topCities = Object.entries(cities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const states = clicks.reduce<Record<string, number>>((acc, c) => {
    const k = c.region || 'Desconhecido';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  const topStates = Object.entries(states)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8 pb-20">

      {/* 1. HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border shadow-sm p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5 overflow-hidden w-full md:w-auto">
            <div className="p-4 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl text-white shadow-lg shadow-purple-500/20 shrink-0">
              <LinkIcon className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">/{link.id}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-green-100 text-green-700 border border-green-200">
                  Ativo
                </span>
              </div>
              <a href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 transition-colors truncate">
                {link.url} <ExternalLink className="w-3 h-3"/>
              </a>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <Button variant="outline" className="flex-1 md:flex-none h-11" onClick={() => { navigator.clipboard.writeText(shortUrl); toast.success("Copiado!"); }}>
              <Copy className="w-4 h-4 mr-2"/> Copiar
            </Button>
            <Button className="flex-1 md:flex-none h-11 bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20" onClick={() => { navigator.clipboard.writeText(`${shortUrl}?source=share`); toast.success("Link de share copiado!"); }}>
              <Share2 className="w-4 h-4 mr-2"/> Compartilhar
            </Button>
          </div>
        </div>
      </div>

      {/* 2. GRID MÉTRICAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Cliques Totais" value={clicks.length} icon={MousePointer} color="text-blue-600" delay={0} />
        <MetricCard title="Visitantes Únicos" value={uniqueVisitors} icon={Users} color="text-purple-600" delay={0.1} />
        <MetricCard title="Acessos Mobile" value={mobileCount} icon={Smartphone} color="text-pink-600" delay={0.2} />
        <MetricCard title="Top Cidade" value={topCities[0]?.[0] || '-'} icon={MapPin} color="text-emerald-600" delay={0.3} />
      </div>

      {/* 3. TABS DE ANÁLISE */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="w-full overflow-x-auto pb-1">
          <TabsList className="bg-transparent h-auto p-0 space-x-2 w-max">
            {['overview', 'geo', 'list'].map(tab => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-full border border-transparent data-[state=active]:border-purple-200 data-[state=active]:bg-purple-50 dark:data-[state=active]:bg-purple-900/20 data-[state=active]:text-purple-700 px-5 py-2.5 text-sm font-medium transition-all"
              >
                {tab === 'overview' ? 'Visão Geral' : tab === 'geo' ? 'Geografia' : 'Histórico'}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          {/* ABA 1: VISÃO GERAL */}
          <TabsContent value="overview" className="space-y-6 focus:outline-none">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="grid lg:grid-cols-3 gap-6">

              {/* Heatmap */}
              <Card className="lg:col-span-2 shadow-sm border-0 ring-1 ring-gray-100 dark:ring-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="w-5 h-5 text-amber-500 fill-amber-500"/> Horários de Pico
                  </CardTitle>
                  <CardDescription>Intensidade de cliques por horário</CardDescription>
                </CardHeader>
                <CardContent>
                  {clicks.length > 0 ? <TimeHeatmap clicks={clicks} /> : <div className="py-12 text-center text-gray-400 bg-gray-50 rounded-lg">Sem dados suficientes</div>}
                </CardContent>
              </Card>

              {/* Devices */}
              <Card className="shadow-sm border-0 ring-1 ring-gray-100 dark:ring-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg">Dispositivos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-pink-500"/> Mobile</span>
                      <span className="font-bold">{clicks.length ? Math.round((mobileCount/clicks.length)*100) : 0}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-pink-500 rounded-full" style={{ width: `${(mobileCount/(clicks.length||1))*100}%` }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-2"><Laptop className="w-4 h-4 text-purple-500"/> Desktop</span>
                      <span className="font-bold">{clicks.length ? Math.round((desktopCount/clicks.length)*100) : 0}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(desktopCount/(clicks.length||1))*100}%` }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ABA 2: GEOGRAFIA */}
          <TabsContent value="geo" className="focus:outline-none">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-sm border-0 ring-1 ring-gray-100 dark:ring-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-emerald-500"/> Top Cidades</CardTitle>
                </CardHeader>
                <CardContent>
                  {topCities.length > 0 ? topCities.map(([name, count]) => (
                    <GeoBar key={name} label={name} count={count} total={topCities[0][1]} color="bg-emerald-500" />
                  )) : <div className="text-center py-8 text-gray-400">Sem dados de cidade</div>}
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 ring-1 ring-gray-100 dark:ring-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-blue-500"/> Top Estados</CardTitle>
                </CardHeader>
                <CardContent>
                  {topStates.length > 0 ? topStates.map(([name, count]) => (
                    <GeoBar key={name} label={name} count={count} total={topStates[0][1]} color="bg-blue-500" />
                  )) : <div className="text-center py-8 text-gray-400">Sem dados de estado</div>}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ABA 3: HISTÓRICO */}
          <TabsContent value="list" className="focus:outline-none">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="shadow-sm border-0 ring-1 ring-gray-100 dark:ring-gray-800">
                <CardHeader>
                  <CardTitle>Histórico de Cliques</CardTitle>
                  <CardDescription>Registro detalhado de todos os acessos</CardDescription>
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