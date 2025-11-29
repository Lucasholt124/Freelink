"use client";

import { motion } from "framer-motion";
import { MousePointerClick, Users, MapPin, Lock, Zap } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import clsx from "clsx";
import { ElementType } from "react";
import type { AnalyticsData } from "@/lib/analytics-server";

interface Props {
  analytics: AnalyticsData;
  plan: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ElementType;
  subtitle: string;
  color: string;
  locked: boolean;
  planRequired?: "PRO" | "ULTRA";
  detail?: string;
  unlockColor?: "pro" | "ultra";
}

const MetricCard = ({
  title, value, icon: Icon, subtitle, color, locked, planRequired, detail, unlockColor
}: MetricCardProps) => {
  return (
    <motion.div whileHover={{ y: -4 }} className="h-full">
      <Card className={clsx(
        "relative h-full overflow-hidden border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all p-5 rounded-2xl group",
        locked && "cursor-pointer border-slate-200"
      )}>
        {locked && (
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/70 backdrop-blur-[4px] z-20 flex flex-col items-center justify-center text-center p-4">
             <div className={`p-2 rounded-full shadow-lg mb-2 ${unlockColor === 'ultra' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
               <Lock className="w-4 h-4" />
             </div>
             <h4 className="font-bold text-slate-900 dark:text-white mb-1 text-sm">
               {unlockColor === 'ultra' ? 'Ultra Insights' : 'Detalhe Premium'}
             </h4>
             <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3 font-medium px-1 leading-tight">
               {detail}
             </p>
             <button className={clsx(
               "text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg transition-transform hover:scale-105",
               unlockColor === 'ultra' ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
             )}>
               Desbloquear {planRequired}
             </button>
          </div>
        )}

        <div className="flex justify-between items-start mb-3 relative z-10">
          <div className={clsx("p-2.5 rounded-lg bg-gradient-to-br shadow-sm text-white", color)}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="relative z-10">
          <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wide mb-1">{title}</h3>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
            {locked ? "••••" : value}
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium truncate">
            {subtitle}
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

export default function DashboardMetrics({ analytics, plan }: Props) {
  const isFree = plan === 'free';

  // Tratamento de Dados Reais
  const peakHourDisplay = analytics.peakHour ? `${analytics.peakHour.hour}:00` : "--:--";
  const topCountryDisplay = analytics.topCountry ? analytics.topCountry.name : "Global";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

      {/* 1. CLIQUES (Sempre Aberto) */}
      <MetricCard
        title="Interações"
        value={analytics.totalClicks}
        icon={MousePointerClick}
        color="from-blue-500 to-indigo-600"
        subtitle="Total de cliques hoje"
        locked={false}
      />

      {/* 2. VISITANTES (Sempre Aberto) */}
      <MetricCard
        title="Alcance Real"
        value={analytics.uniqueVisitors}
        icon={Users}
        color="from-emerald-500 to-teal-600"
        subtitle="Pessoas únicas"
        locked={false}
      />

      {/* 3. HORÁRIO (Bloqueio PRO) */}
      <Link href="/dashboard/billing">
        <MetricCard
          title="Horário Exato"
          value={peakHourDisplay}
          icon={Zap}
          color="from-blue-400 to-blue-600"
          subtitle="Melhor hora para postar"
          locked={isFree}
          planRequired="PRO"
          unlockColor="pro"
          detail="Saiba a hora exata que seu público engaja."
        />
      </Link>

      {/* 4. LOCALIZAÇÃO (Bloqueio ULTRA) */}
      <Link href="/dashboard/billing">
        <MetricCard
          title="Geolocalização"
          value={topCountryDisplay}
          icon={MapPin}
          color="from-purple-500 to-pink-600"
          subtitle="Cidades e Regiões"
          locked={plan !== 'ultra'}
          planRequired="ULTRA"
          unlockColor="ultra"
          detail="Veja cidades, estados e dispositivos detalhados."
        />
      </Link>
    </div>
  );
}