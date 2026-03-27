"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Crown, Star, Zap, DollarSign, Megaphone, Gift, ArrowRight, ShieldCheck, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfitStrategyWidget, AdsHubWidget } from "./ContextualWidgets";
import GrowthChecklist from "./GrowthChecklist";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface DashboardOverviewProps {
  userPlan: string;
  firstName: string;
  userSlug: string | null;
}

const useStreak = () => {
  const [streak, setStreak] = useState(0);

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
    } else {
      localStorage.setItem('freelinnk_streak', '1');
      localStorage.setItem('freelinnk_last_visit', today);
      setStreak(1);
    }
  }, []);

  return streak;
};

export default function DashboardOverview({ userPlan, firstName, userSlug }: DashboardOverviewProps) {
  const dailySummary = useQuery(api.profitCalculator.getDailySummary, {});
  const streak = useStreak();

  const isFree = userPlan === 'free';
  const isUltra = userPlan === 'ultra';

  const planBadgeColor =
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

  return (
    <div className="max-w-7xl mx-auto pb-24 pt-4 animate-in fade-in duration-500 space-y-8">

      {/* Cabeçalho do Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {getGreeting()}, {firstName}.
            </h1>
            {streak > 1 && (
              <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold px-2 py-1 shadow-sm border-0">
                  🔥 {streak} dias focados
                </Badge>
              </motion.div>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mb-4">
            Sua central de vendas e tráfego está pronta. O que vamos realizar hoje?
          </p>

          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-xl ${planBadgeColor} flex items-center gap-2 px-4 shadow-inner`}>
              {userPlan === 'ultra' ? <Crown className="w-5 h-5" /> :
                userPlan === 'pro' ? <Zap className="w-5 h-5" /> :
                  <Star className="w-5 h-5" />}
              <span className="font-bold uppercase tracking-wider text-xs">Plano {userPlan}</span>
            </div>
            {isFree && (
              <Link href="/dashboard/billing">
                <Button variant="outline" size="sm" className="h-9 font-bold text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-900/30">
                  Fazer Upgrade 🚀
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="relative z-10 w-full md:w-auto">
          <Link href="/dashboard/new-link">
            <Button size="lg" className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-2xl h-14 shadow-xl hover:scale-105 transition-all text-base px-8">
              <PlusCircle className="w-5 h-5 mr-2" /> Adicionar Produto/Link
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Coluna Esquerda (Ações Rápidas & Widgets) */}
        <div className="lg:col-span-8 space-y-6">

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <QuickActionCard href="/dashboard/settings" icon={<Settings />} label="Aparência" color="indigo" />
            <QuickActionCard href="/dashboard/giveaway" icon={<Gift />} label="Sorteios" color="orange" isPro={isFree} />
            <QuickActionCard href="/dashboard/ads" icon={<Megaphone />} label="Tráfego" color="blue" isPro={isFree} />
            <QuickActionCard href="/dashboard/tracking" icon={<ShieldCheck />} label="Pixel / GA4" color="emerald" isUltra={!isUltra} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdsHubWidget userPlan={userPlan} />
            <ProfitStrategyWidget userPlan={userPlan} totalClicks={0} />
          </div>

          <GrowthChecklist plan={userPlan} clicks={0} username={userSlug || "loja"} />
        </div>

        {/* Coluna Direita (Calculadora Resumo) */}
        <div className="lg:col-span-4 space-y-6">
          <Link href="/dashboard/profit-calculator">
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition-all h-[200px] flex flex-col justify-between cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="bg-white/20 p-3 rounded-2xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>

              <div>
                <p className="text-emerald-100 font-bold mb-1 uppercase tracking-wider text-xs">Faturamento do Dia</p>
                <h3 className="text-4xl font-black mb-2 tracking-tight">
                  {dailySummary ? formatCurrency(dailySummary.totalRevenue) : "R$ 0,00"}
                </h3>
                <div className="inline-flex items-center gap-1.5 bg-black/10 px-3 py-1.5 rounded-full">
                  <span className="text-xs font-bold text-white">
                    {dailySummary?.salesCount ? `${dailySummary.salesCount} vendas registradas` : "Nenhuma venda registrada hoje"}
                  </span>
                </div>
              </div>
            </motion.div>
          </Link>

          {/* Banner Opcional de Upgrade */}
          {isFree && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-lg border border-slate-700/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
              <div className="relative z-10 text-center space-y-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Crown className="w-6 h-6 text-yellow-400" />
                </div>
                <h4 className="font-black text-xl">Lojistas Sérios Não Vivem no Escuro</h4>
                <p className="text-sm text-slate-300 font-medium">Libere a Calculadora de Lucros, Pixel de Remarketing e Tráfego Automático da rede.</p>
                <Link href="/dashboard/billing">
                  <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-black rounded-xl h-12 mt-2">
                    Ver Planos Premium
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// Componente utilitário
function QuickActionCard({ href, icon, label, color, isPro, isUltra }: any) {
  const getColors = (c: string) => {
    const map: any = {
      indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:border-indigo-300 dark:bg-indigo-900/20 dark:border-indigo-800",
      orange: "bg-orange-50 text-orange-600 border-orange-100 group-hover:border-orange-300 dark:bg-orange-900/20 dark:border-orange-800",
      blue: "bg-blue-50 text-blue-600 border-blue-100 group-hover:border-blue-300 dark:bg-blue-900/20 dark:border-blue-800",
      emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:border-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-800",
    };
    return map[c] || map.indigo;
  };

  return (
    <Link href={href}>
      <motion.div whileHover={{ y: -4 }} className={`h-full bg-white dark:bg-slate-900 border p-5 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer group shadow-sm transition-all ${getColors(color)} relative`}>
        <div className="p-3 bg-white/60 dark:bg-slate-800/50 rounded-xl shadow-sm border border-black/5 flex-shrink-0">
          {icon}
        </div>
        <span className="font-bold text-sm text-slate-700 dark:text-slate-200 text-center leading-tight">{label}</span>

        {isPro && <Badge className="absolute top-2 right-2 bg-slate-200 text-slate-600 text-[9px] border-0 font-black">PRO</Badge>}
        {isUltra && <Badge className="absolute top-2 right-2 bg-slate-800 text-yellow-400 text-[9px] border-0 font-black">ULTRA</Badge>}
      </motion.div>
    </Link>
  );
}