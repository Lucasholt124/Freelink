"use client";

import { TrendingUp, TrendingDown, Users, Globe, Minus, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { AnalyticsData } from "@/lib/analytics-server";
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, YAxis
} from "recharts";

interface Props {
  analytics: AnalyticsData;
  plan?: string;
}

interface ChartDataPoint {
  date: string;
  count: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: ChartDataPoint; value?: number; }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs p-2 rounded-lg shadow-xl border border-slate-700">
        <p className="font-bold mb-1">{label}</p>
        <p className="text-emerald-400 font-bold">{payload[0].value} cliques</p>
      </div>
    );
  }
  return null;
};

export default function ImpactOverview({ analytics, plan = 'free' }: Props) {
  const isFree = plan === 'free';
  const clicks = analytics?.totalClicks || 0;
  const visitors = analytics?.uniqueVisitors || 0;
  const topCountryName = analytics?.topCountry?.name || "Brasil";

  const rawHistory = analytics?.dailyClicks || [];
  const chartData = rawHistory.length > 0
    ? rawHistory
    : [
        { date: 'Seg', count: 0 }, { date: 'Ter', count: 0 },
        { date: 'Qua', count: 0 }, { date: 'Qui', count: 0 },
        { date: 'Sex', count: 0 }, { date: 'Sab', count: 0 },
        { date: 'Dom', count: 0 }
      ];

  let growthValue = 0;
  const growthString = analytics?.growth;

  if (!growthString || growthString === "+0%" || growthString === "0%") {
    if (rawHistory.length >= 2) {
      const today = rawHistory[rawHistory.length - 1].count;
      const yesterday = rawHistory[rawHistory.length - 2].count;
      if (yesterday === 0) {
        growthValue = today > 0 ? 100 : 0;
      } else {
        growthValue = ((today - yesterday) / yesterday) * 100;
      }
    }
  } else {
    growthValue = parseFloat(growthString.replace('%', '').replace('+', ''));
  }

  const isPositive = growthValue > 0;
  const isNegative = growthValue < 0;

  let growthConfig = {
    label: "Estável",
    icon: <Minus className="w-3 h-3 mr-1" />,
    color: "bg-slate-100 text-slate-600 border-slate-200"
  };

  if (isPositive) {
    growthConfig = {
      label: `+${growthValue.toFixed(0)}%`,
      icon: <TrendingUp className="w-3 h-3 mr-1" />,
      color: "bg-emerald-100 text-emerald-700 border-emerald-200"
    };
  } else if (isNegative) {
    growthConfig = {
      label: `${growthValue.toFixed(0)}%`,
      icon: <TrendingDown className="w-3 h-3 mr-1" />,
      color: "bg-red-100 text-red-700 border-red-200"
    };
  }

  return (
    <Card className="flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm h-full overflow-hidden">

      <div className="p-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tráfego da Vitrine</h3>
          </div>

          <Badge variant="secondary" className={`${growthConfig.color} font-bold px-3 py-1 border`}>
            {growthConfig.icon} {growthConfig.label}
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row items-baseline gap-3 mb-2">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white">{clicks}</h2>
          <span className="text-lg font-bold text-slate-400">leads potenciais</span>
        </div>

        {clicks > 0 ? (
          <p className="text-xs text-slate-500 font-medium">
            Mantenha a consistência. Cada lead não convertido é dinheiro deixado na mesa.
          </p>
        ) : (
          <p className="text-xs text-slate-500 font-medium">
            Coloque a loja para rodar. Ative o Hub ou espalhe seu link na Bio!
          </p>
        )}
      </div>

      <div className="h-[120px] w-full mt-4 -mb-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" hide />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" animationDuration={1500} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="p-6 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {visitors} {visitors === 1 ? 'visitante único' : 'visitantes únicos'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {topCountryName}
              </span>
            </div>
          </div>

          {isFree && clicks > 0 && (
            <Link href="/dashboard/billing">
              <Badge variant="secondary" className="bg-purple-50 text-purple-600 text-[9px] font-bold cursor-pointer hover:bg-purple-100 transition-colors border border-purple-100">
                <Eye className="w-2.5 h-2.5 mr-1" />
                Desbloquear Taxa de Saída
              </Badge>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}