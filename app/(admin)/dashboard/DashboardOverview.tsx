"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PlusCircle, Crown, Star, Zap,
  DollarSign, Gift, ArrowRight, Lightbulb, Diamond,
  Calendar, Target, Lock, Eye, BarChart3, AlertTriangle, Share2, Megaphone,
  Calculator
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ImpactOverview from "./ImpactOverview";
import SmartInsights from "./SmartInsights";
import DashboardMetrics from "@/components/DashboardMetrics";
import { ProfitStrategyWidget, AdsHubWidget } from "./ContextualWidgets";
import TrendingLinkCard from "./TrendingLinkCard";
import GrowthChecklist from "./GrowthChecklist";
import WelcomeModal from "./WelcomeModal";
import type { AnalyticsData } from "@/lib/analytics-server";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface DashboardOverviewProps {
  analytics: AnalyticsData;
  userPlan: string;
  firstName: string;
  userSlug: string | null;
}

const useStreak = () => {
  const [streak, setStreak] = useState(0);
  const [isNewDay, setIsNewDay] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('freelinnk_last_visit');
    const currentStreak = parseInt(localStorage.getItem('freelinnk_streak') || '0');

    if (lastVisit === today) {
      setStreak(currentStreak);
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastVisit === yesterday.toDateString()) {
      const newStreak = currentStreak + 1;
      localStorage.setItem('freelinnk_streak', String(newStreak));
      localStorage.setItem('freelinnk_last_visit', today);
      setStreak(newStreak);
      setIsNewDay(true);
    } else {
      localStorage.setItem('freelinnk_streak', '1');
      localStorage.setItem('freelinnk_last_visit', today);
      setStreak(1);
      setIsNewDay(lastVisit !== null);
    }
  }, []);

  return { streak, isNewDay };
};

const getDailyMission = () => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );

  const missions = [
    { text: "Compartilhe seu link para gerar novas vendas", reward: "+10 XP", icon: Share2, href: "/dashboard/links", color: "blue" },
    { text: "Destaque seu produto principal no topo", reward: "+15 XP", icon: PlusCircle, href: "/dashboard/new-link", color: "emerald" },
    { text: "Configure uma nova campanha de Ads", reward: "+20 XP", icon: Megaphone, href: "/dashboard/ads", color: "violet" },
    { text: "Descubra quem clicou, mas não comprou", reward: "+15 XP", icon: Target, href: "#smart-insights", color: "amber" },
    { text: "Calcule a margem de lucro de um produto", reward: "+10 XP", icon: Calculator, href: "/dashboard/profit-calculator", color: "pink" },
    { text: "Analise o mapa de calor de ontem", reward: "+5 XP", icon: BarChart3, href: "#impact-overview", color: "cyan" },
    { text: "Crie um sorteio para captar leads", reward: "+20 XP", icon: Gift, href: "/dashboard/giveaway", color: "orange" },
  ];

  return missions[dayOfYear % missions.length];
};

const DailyPerformanceCard = ({ clicks, plan }: { clicks: number; plan: string }) => {
  const isFree = plan === 'free';

  if (clicks <= 10) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 h-full flex flex-col justify-center relative overflow-hidden shadow-sm">
        <Lightbulb className="absolute top-4 right-4 text-slate-300 dark:text-slate-600 w-16 h-16 rotate-12 opacity-20" />
        <div className="relative z-10">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Meta de Vendas
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            Tráfego baixo. Compartilhe seu link no Instagram ou ative uma <strong className="text-emerald-600">Campanha de Tráfego</strong> para alcançar a meta de hoje.
          </p>

          <div className="mb-3">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
              <span>Aquecimento</span>
              <span>{clicks}/10 cliques</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (clicks / 10) * 100)}%` }}
              />
            </div>
          </div>

          <Link href={isFree ? "/dashboard/billing" : "/dashboard/ads"}>
            <Button variant="outline" size="sm" className="w-full text-xs font-bold border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">
              <Megaphone className="w-3 h-3 mr-2 text-blue-500" />
              Ativar Rede de Tráfego
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (clicks <= 100) {
    return (
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg h-full flex flex-col justify-center relative overflow-hidden group">
        <Target className="absolute top-4 right-4 text-white/20 w-16 h-16 rotate-12 group-hover:scale-110 transition-transform" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 text-white border-0 px-2 py-0.5 rounded font-bold uppercase text-[10px]">
              Vendas Potenciais
            </span>
          </div>
          <h3 className="font-black text-2xl mb-1">Escalando 📈</h3>
          <p className="text-sm font-medium text-white/90 mb-4 leading-relaxed">
            Excelente tráfego! Registre suas vendas agora na calculadora para saber a taxa de conversão.
          </p>

          <Link href="/dashboard/profit-calculator">
            <div className="mt-3 bg-white/10 rounded-lg p-2.5 flex items-center justify-between hover:bg-white/20 transition-colors cursor-pointer border border-white/20">
              <div className="flex items-center gap-2">
                 <DollarSign className="w-4 h-4 text-green-300" />
                 <p className="text-xs text-white font-bold">
                   Calcular Lucro
                 </p>
              </div>
              <ArrowRight className="w-3 h-3 text-white/50" />
            </div>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-2xl h-full flex flex-col justify-center relative overflow-hidden group">
      <Diamond className="absolute top-4 right-4 text-white/20 w-16 h-16 rotate-12" />
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 border-0 px-2 py-0.5 rounded font-bold uppercase text-[10px] shadow-sm">
            Top Seller
          </span>
        </div>
        <h3 className="font-black text-2xl mb-1">Líder de Tráfego 💎</h3>
        <p className="text-sm font-medium text-white/90 mb-4 leading-relaxed">
          Você está recebendo uma avalanche de visitas! Conecte seu Pixel para reter todo esse público.
        </p>

        {isFree && (
            <Link href="/dashboard/billing">
              <div className="bg-white/10 rounded-lg p-2 flex items-center gap-2 hover:bg-white/20 transition-colors cursor-pointer border border-white/20">
                <Lock className="w-3 h-3 text-yellow-300" />
                <p className="text-[10px] text-white font-medium">
                  Ative o plano Ultra para conectar o Pixel de remarketing.
                </p>
              </div>
            </Link>
        )}
      </div>
    </div>
  );
};


export default function DashboardOverview({ analytics, userPlan, firstName, userSlug }: DashboardOverviewProps) {
  const dailySummary = useQuery(api.profitCalculator.getDailySummary, {});
  const { streak } = useStreak();
  const dailyMission = getDailyMission();

  const totalClicks = analytics.totalClicks || 0;
  const currentLevel = Math.floor(totalClicks / 50) + 1;
  const nextLevelClicks = currentLevel * 50;
  const progressPercent = Math.min(100, (totalClicks / nextLevelClicks) * 100);

  const isFree = userPlan === 'free';
  const isPro = userPlan === 'pro';

  const levelBadgeColor =
    userPlan === 'ultra' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
    userPlan === 'pro' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h >= 0 && h < 5) return "Boa madrugada";
    if (h >= 5 && h < 12) return "Bom dia";
    if (h >= 12 && h < 18) return "Boa tarde";
    return "Boa noite";
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const lockedFeaturesCount = isFree ? 8 : isPro ? 4 : 0;

  return (
    <div className="max-w-7xl mx-auto pb-24 pt-4 animate-in fade-in duration-500 space-y-6">

      <WelcomeModal username={userSlug || ""} />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="w-full md:w-auto">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {getGreeting()}, {firstName}.
            </h1>

             {streak > 1 && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
              >
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs px-2.5 py-1 border-0 shadow-lg shadow-emerald-500/25">
                  💵 {streak} dias vendendo
                </Badge>
              </motion.div>
            )}
          </div>

          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mb-4">
            {totalClicks > 0
              ? `Acompanhe seu funil. Sua vitrine recebeu ${totalClicks} visitas hoje.`
              : "Pronto para as vendas! Compartilhe ou impulsione seu link para trazer tráfego."
            }
          </p>

          <div className="bg-white dark:bg-slate-900 p-3 pr-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm inline-flex items-center gap-4">
            <div className={`p-2 rounded-lg ${levelBadgeColor}`}>
              {userPlan === 'ultra' ? <Crown className="w-5 h-5" /> :
               userPlan === 'pro' ? <Zap className="w-5 h-5" /> :
               <Star className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black uppercase text-slate-500">Nível {currentLevel}</span>
                <span className="text-xs font-bold text-slate-300">•</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{totalClicks} Cliques</span>
                {lockedFeaturesCount > 0 && (
                  <Link href="/dashboard/billing">
                    <Badge variant="secondary" className="bg-red-50 text-red-600 text-[9px] font-bold border border-red-100 cursor-pointer hover:bg-red-100 transition-colors">
                      <Lock className="w-2.5 h-2.5 mr-1" />
                      {lockedFeaturesCount} ferramentas bloqueadas
                    </Badge>
                  </Link>
                )}
              </div>
              <div className="w-48 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto">
            <Link href="/dashboard/new-link">
            <Button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-transform font-bold rounded-xl h-12 shadow-xl px-8 w-full">
                <PlusCircle className="w-4 h-4 mr-2" />
                Adicionar Produto/Link
            </Button>
            </Link>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-4 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 bg-${dailyMission.color}-100 dark:bg-${dailyMission.color}-900/20 rounded-xl`}>
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Ação Diária de Vendas</span>
                <Badge className="bg-amber-100 text-amber-700 text-[9px] font-bold border-0 px-1.5">
                  Importante
                </Badge>
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                {dailyMission.text}
              </p>
            </div>
          </div>
          <Link href={dailyMission.href}>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-md whitespace-nowrap">
              Executar Ação
              <ArrowRight className="w-3 h-3 ml-2" />
            </Button>
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Link href="/dashboard/profit-calculator">
          <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/20 p-4 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 cursor-pointer group hover:border-emerald-200 h-full">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="font-bold text-sm text-slate-700 dark:text-slate-200 text-center leading-tight">CRM & Lucros</span>
            {userPlan === 'free' && <Badge className="bg-slate-100 text-slate-400 text-[8px] border-0">ULTRA</Badge>}
          </motion.div>
        </Link>

        <Link href="/dashboard/ads">
          <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/20 p-4 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 cursor-pointer group hover:border-blue-200 h-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/30 to-transparent animate-[shimmer_3s_infinite] skew-x-12" />
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full group-hover:scale-110 transition-transform relative z-10">
              <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-bold text-sm text-slate-700 dark:text-slate-200 text-center leading-tight relative z-10">Hub Anúncios</span>
            {userPlan === 'free' && <Badge className="absolute top-2 right-2 bg-blue-100 text-[8px] border-0 text-blue-600 font-bold z-10">PRO</Badge>}
          </motion.div>
        </Link>

        <Link href="/dashboard/giveaway">
          <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-slate-900 border border-orange-100 dark:border-orange-900/20 p-4 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 cursor-pointer group hover:border-orange-200 h-full">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full group-hover:scale-110 transition-transform">
              <Gift className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="font-bold text-sm text-slate-700 dark:text-slate-200 text-center leading-tight">Sorteios</span>
            {userPlan === 'free' && <Badge className="bg-slate-100 text-slate-400 text-[8px] border-0">PRO</Badge>}
          </motion.div>
        </Link>

        <Link href="/dashboard/tracking">
          <motion.div whileHover={{ y: -2 }} className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-xl shadow-md flex flex-col items-center justify-center gap-2 cursor-pointer text-white h-full relative overflow-hidden">
            <div className="p-2 bg-white/20 rounded-full relative z-10">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-sm relative z-10 text-center leading-tight">Pixel & Analytics</span>
            {userPlan !== 'ultra' && (
              <Badge className="absolute top-2 right-2 bg-white/20 text-[8px] border-0 text-white font-bold">ULTRA</Badge>
            )}
          </motion.div>
        </Link>
      </div>

      {isFree && totalClicks > 5 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden"
        >
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-900/30 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-bold text-red-800 dark:text-red-300 text-sm">
                    ⚠️ Atenção: Perda de Vendas Detectada
                  </h4>
                  <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-0.5">
                    Com {totalClicks} cliques hoje, você está descartando leads. Libere o Analytics para mapear horários e crie uma campanha de Ads para fisgar eles de volta.
                  </p>
                </div>
              </div>
              <Link href="/dashboard/billing">
                <Button size="sm" className="bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-xs whitespace-nowrap shadow-lg">
                  <Lock className="w-3 h-3 mr-2" />
                  Destravar Gestão Pro
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2" id="impact-overview">
          <ImpactOverview analytics={analytics} plan={userPlan} />
        </div>

        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="flex-1">
            <DailyPerformanceCard clicks={totalClicks} plan={userPlan} />
          </div>

          <Link href="/dashboard/profit-calculator">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-emerald-300 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Faturamento Hoje</p>
                  <p className="font-bold text-slate-800 dark:text-white">
                    {dailySummary ? formatCurrency(dailySummary.totalRevenue) : "R$ 0,00"}
                  </p>
                  {dailySummary && dailySummary.salesCount > 0 && (
                    <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                      ✅ {dailySummary.salesCount} venda(s) pelo CRM
                    </p>
                  )}
                  {(!dailySummary || dailySummary.salesCount === 0) && (
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Nenhuma venda no CRM ainda
                    </p>
                  )}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          </Link>
        </div>
      </div>

      <div id="smart-insights">
        <SmartInsights
          analytics={analytics}
          plan={userPlan}
          hasSales={(dailySummary && dailySummary.salesCount > 0) ?? false}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-6">
          <DashboardMetrics analytics={analytics} plan={userPlan} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdsHubWidget userPlan={userPlan} />
            <ProfitStrategyWidget userPlan={userPlan} totalClicks={totalClicks} />
          </div>

          <GrowthChecklist plan={userPlan} clicks={totalClicks} username={userSlug || "loja"} />
        </div>

        <div className="md:col-span-4 space-y-6">
          <TrendingLinkCard analytics={analytics} plan={userPlan} />

          {isFree && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 rounded-2xl p-5 text-white shadow-lg border border-slate-700/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_3s_infinite] skew-x-12" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-4 h-4 text-purple-400" />
                  <h4 className="font-bold text-sm">A Caixa Preta das Vendas</h4>
                </div>

                <div className="space-y-2 mb-4">
                  {[
                    "De onde as vendas vêm (Origem)",
                    "Calculadora de Lucro Líquido Real",
                    "Hub de Anúncios na Bio",
                    "Conexão do Pixel FB para Ads",
                    "Páginas ilimitadas",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Lock className="w-3 h-3 text-slate-500" />
                      <span className="text-xs text-slate-400 font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                <Link href="/dashboard/billing">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs shadow-lg hover:scale-[1.02] transition-transform">
                    <Zap className="w-3 h-3 mr-2" />
                    Mudar para o Nível Profissional
                  </Button>
                </Link>

                <p className="text-[9px] text-slate-500 text-center mt-2">
                  ✨ Lojistas sérios não vivem no escuro
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}