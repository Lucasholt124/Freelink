// ===================================================================================
// ARQUIVO FINAL, COMPLETO E CORRIGIDO: components/LinkAnalytics.tsx
// CORREÇÃO: Removida a chamada redundante ao hook useAuth.
// ===================================================================================

"use client";

import {  ArrowLeft, BarChart3, Lock } from "lucide-react";
import Link from "next/link";
import type { LinkAnalyticsData } from "@/convex/lib/fetchLinkAnalytics";

// CORREÇÃO: Importar apenas useUser, que é tudo que precisamos aqui.
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

// Defina a interface das props que o componente recebe
interface LinkAnalyticsProps {
  analytics: LinkAnalyticsData;
}

// --- FUNÇÕES HELPER ---
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
const formatUrl = (url: string) => { try { return new URL(url).hostname.replace("www.", "") } catch { return url } };

// --- O COMPONENTE DE EXIBIÇÃO ---
export default function LinkAnalytics({ analytics }: LinkAnalyticsProps) {
  // CORREÇÃO: Usamos apenas useUser, que já nos dá o usuário completo e o estado de carregamento.
  const { user, isLoaded } = useUser();

  const [plan, setPlan] = useState<"free" | "pro" | "ultra">("free");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      const userPlan = (user.publicMetadata.subscriptionPlan as "free" | "pro" | "ultra") || "free";
      setPlan(userPlan);
      // Defina seu ADMIN_ID aqui
      setIsAdmin(user.id === "user_301NTkVsE3v48SXkoCEp0XOXifI");
    }
  }, [isLoaded, user]);

  const hasAnalyticsAccess = plan === "pro" || plan === "ultra" || isAdmin;
  const hasUltraFeaturesAccess = plan === "ultra" || isAdmin;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500">Carregando permissões...</p>
      </div>
    );
  }

  if (!hasAnalyticsAccess) {
    return (
      <div className="bg-white/80 border-2 border-dashed border-gray-300 rounded-2xl p-8 shadow-xl max-w-3xl mx-auto my-8">
        <div className="flex items-center gap-4 mb-6"><div className="p-3 bg-gray-400 rounded-xl"><Lock className="w-6 h-6 text-white" /></div><div><h2 className="text-2xl font-bold text-gray-900">Análise de links</h2><p className="text-gray-600">🔒 Atualize para desbloquear insights poderosos</p></div></div>
        <p className="text-center text-gray-700">Obtenha insights detalhados sobre o desempenho do seu link com nossos planos Pro e Ultra.</p>
        <div className="mt-6 text-center"><Link href="/dashboard/billing" className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">Fazer Upgrade Agora</Link></div>
      </div>
    );
  }

  const maxDailyClicks = analytics.dailyData.length > 0 ? Math.max(...analytics.dailyData.map(d => d.clicks)) : 0;
  const maxHourlyClicks = analytics.hourlyData.length > 0 ? Math.max(...analytics.hourlyData.map(d => d.total_clicks)) : 0;
  const hourlyDataForChart = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    clicks: analytics.hourlyData.find(d => d.hour_of_day === i)?.total_clicks || 0,
  }));
  const totalCityClicks = analytics.cityData.length > 0 ? analytics.cityData.reduce((sum, city) => sum + city.clicks, 0) : 0;

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-50 min-h-screen">
      <header className="max-w-7xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"><ArrowLeft className="w-5 h-5" /><span className="font-medium">Voltar</span></Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">{analytics.linkTitle}</h1>
        <a href={analytics.linkUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-blue-600 break-all">{formatUrl(analytics.linkUrl)}</a>
      </header>

      {analytics.totalClicks === 0 ? (
        <div className="text-center py-16 text-gray-500 max-w-7xl mx-auto bg-white rounded-2xl shadow-md"><BarChart3 className="w-16 h-16 mx-auto mb-4" /><h3 className="text-xl font-semibold">Nenhum dado analítico ainda</h3><p>As análises aparecerão aqui assim que seu link receber cliques.</p></div>
      ) : (
      <main className="max-w-7xl mx-auto space-y-8">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border"><p className="text-sm text-gray-600">Total de cliques</p><p className="text-3xl font-bold">{analytics.totalClicks.toLocaleString()}</p></div>
          <div className="bg-white p-6 rounded-xl border"><p className="text-sm text-gray-600">Visitantes Únicos</p><p className="text-3xl font-bold">{analytics.uniqueUsers.toLocaleString()}</p></div>
          <div className="bg-white p-6 rounded-xl border"><p className="text-sm text-gray-600">Países Alcançados</p><p className="text-3xl font-bold">{analytics.countriesReached.toLocaleString()}</p></div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl border shadow-sm"><h3 className="font-bold mb-4">Desempenho Diário</h3><div className="space-y-3">{analytics.dailyData.map(day => (<div key={day.date} className="flex items-center gap-4"><p className="w-20 text-sm text-gray-500">{formatDate(day.date)}</p><div className="flex-1 bg-gray-200 h-6 rounded-full"><div className="bg-blue-500 h-6 rounded-full" style={{width: `${maxDailyClicks > 0 ? (day.clicks / maxDailyClicks) * 100 : 0}%`}}></div></div></div>))}</div></div>
          <div className="bg-white p-6 rounded-xl border shadow-sm"><h3 className="font-bold mb-4">Principais Países</h3><div className="space-y-3">{analytics.countryData.map(c => <div key={c.country} className="flex items-center gap-4"><p className="w-28 text-sm truncate">{c.country}</p><div className="flex-1 bg-gray-200 h-6 rounded-full"><div className="bg-green-500 h-6 rounded-full" style={{width: `${c.percentage}%`}}></div></div><p className="text-sm w-12 text-right">{c.percentage.toFixed(1)}%</p></div>)}</div></div>

          {hasUltraFeaturesAccess ? (
            <>
              <div className="bg-white p-6 rounded-xl border shadow-sm"><h3 className="font-bold mb-4">Principais Cidades</h3><div className="space-y-3">{analytics.cityData.slice(0, 7).map(city => <div key={city.city} className="flex items-center gap-4"><p className="w-28 text-sm truncate">{city.city}</p><div className="flex-1 bg-gray-200 h-6 rounded-full"><div className="bg-teal-500 h-6 rounded-full" style={{width: `${totalCityClicks > 0 ? (city.clicks / totalCityClicks) * 100 : 0}%`}}></div></div></div>)}</div></div>
              <div className="bg-white p-6 rounded-xl border shadow-sm"><h3 className="font-bold mb-4">Horários de Pico</h3><div className="flex gap-1.5 items-end h-32">{hourlyDataForChart.map(h => <div key={h.hour} className="flex-1 h-full flex flex-col justify-end items-center"><div className="w-full bg-orange-300 rounded-t" style={{height: `${maxHourlyClicks > 0 ? (h.clicks / maxHourlyClicks) * 100 : 0}%`}}></div><p className="text-[10px] text-gray-500">{String(h.hour).padStart(2, '0')}</p></div>)}</div></div>
            </>
          ) : (
            <>
              <div className="bg-gray-100 border-dashed border-2 rounded-xl flex flex-col items-center justify-center p-6 text-center"><Lock className="w-8 h-8 text-gray-400 mb-2"/><p className="font-semibold">Análise por Cidade</p><p className="text-sm text-gray-500">Disponível no plano Ultra</p></div>
              <div className="bg-gray-100 border-dashed border-2 rounded-xl flex flex-col items-center justify-center p-6 text-center"><Lock className="w-8 h-8 text-gray-400 mb-2"/><p className="font-semibold">Gráfico de Horários</p><p className="text-sm text-gray-500">Disponível no plano Ultra</p></div>
            </>
          )}
        </section>
      </main>
      )}
    </div>
  );
}