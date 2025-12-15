"use client";

import { TrendingUp, TrendingDown, Users, Globe, Minus } from "lucide-react"; // Adicionei TrendingDown
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AnalyticsData } from "@/lib/analytics-server";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  YAxis
} from "recharts";

interface Props {
  analytics: AnalyticsData;
  plan?: string; // Coloquei opcional pois não estava sendo usado
}

interface ChartDataPoint {
  date: string;
  count: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    payload: ChartDataPoint;
    value?: number;
  }[];
  label?: string;
}

// Tooltip Personalizado
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs p-2 rounded-lg shadow-xl border border-slate-700">
        <p className="font-bold mb-1">{label}</p>
        <p className="text-emerald-400 font-bold">
          {payload[0].value} cliques
        </p>
      </div>
    );
  }
  return null;
};

export default function ImpactOverview({ analytics }: Props) {
  // Dados Reais
  const clicks = analytics?.totalClicks || 0;
  const visitors = analytics?.uniqueVisitors || 0;
  const topCountryName = analytics?.topCountry?.name || "Brasil";

  // Tratamento do Histórico
  const rawHistory = analytics?.dailyClicks || [];
  const chartData = rawHistory.length > 0
    ? rawHistory
    : [
        { date: 'Seg', count: 0 }, { date: 'Ter', count: 0 },
        { date: 'Qua', count: 0 }, { date: 'Qui', count: 0 },
        { date: 'Sex', count: 0 }, { date: 'Sab', count: 0 },
        { date: 'Dom', count: 0 }
      ];

  // --- LÓGICA DE CRESCIMENTO INTELIGENTE ---
  let growthValue = 0;
  const growthString = analytics?.growth;

  // Se o backend não mandou growth, ou mandou "0%", tentamos calcular pelo gráfico
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
    // Se o backend mandou string (ex: "+15%"), convertemos para número
    growthValue = parseFloat(growthString.replace('%', '').replace('+', ''));
  }

  // Definição dos Estados Visuais (Positivo, Negativo, Neutro)
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
      icon: <TrendingDown className="w-3 h-3 mr-1" />, // Icone de queda
      color: "bg-red-100 text-red-700 border-red-200" // Cor de alerta
    };
  }

  return (
    <Card className="flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm h-full overflow-hidden">

      {/* Cabeçalho do Card */}
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
             <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
             </div>
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Impacto de Hoje</h3>
          </div>

          {/* Badge Dinâmico */}
          <Badge variant="secondary" className={`${growthConfig.color} font-bold px-3 py-1 border`}>
            {growthConfig.icon} {growthConfig.label}
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row items-baseline gap-3 mb-2">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white">{clicks}</h2>
          <span className="text-lg font-bold text-slate-400">cliques</span>
        </div>

        <p className="text-xs text-slate-500 font-medium">
          Você está acima de <span className="text-purple-600 font-bold">68%</span> dos novos criadores.
        </p>
      </div>

      {/* ÁREA DO GRÁFICO RESPONSIVO */}
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

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
            />

            <Area
              type="monotone"
              dataKey="count"
              stroke="#2563eb"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorCount)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Rodapé com Stats Secundários */}
      <div className="p-6 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-700 dark:text-slate-300">
               {visitors} pessoas reais
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400" />
            <span className="font-bold text-slate-700 dark:text-slate-300">
               {topCountryName}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}