"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, Globe, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AnalyticsData } from "@/lib/analytics-server";
import { useMemo, useState } from "react";

interface Props {
  analytics: AnalyticsData;
  plan: string;
}

export default function ImpactOverview({ analytics,  }: Props) {
  const clicks = analytics?.totalClicks || 0;
  const visitors = analytics?.uniqueVisitors || 0;
  const topCountryName = analytics?.topCountry?.name || "Brasil";
  const growth = analytics?.growth || "+0%";
  const history = analytics?.dailyClicks || [];

  // --- LÓGICA MATEMÁTICA DO GRÁFICO REAL ---
  const { pathData, areaPath, points } = useMemo(() => {
    // Se não tiver dados, mostra linha reta
    if (!history || history.length === 0) {
      return { pathData: "M0,50 L320,50", areaPath: "M0,50 L320,50 V60 H0 Z", points: [] };
    }

    const width = 320;
    const height = 60;
    const padding = 5;

    // Encontrar o valor máximo para escalar o gráfico
    const counts = history.map(d => d.count);
    const maxCount = Math.max(...counts, 1); // Evita divisão por zero

    // Calcular coordenadas X e Y para cada ponto
    const dataPoints = history.map((d, index) => {
      const x = (index / (history.length - 1 || 1)) * width;
      // Inverte Y porque SVG 0 é topo (height - valor escalado)
      const y = height - ((d.count / maxCount) * (height - padding * 2)) - padding;
      return { x, y, count: d.count, date: d.date };
    });

    // Criar o caminho SVG (Smooth Curve - Catmull-Rom ou Line)
    // Para simplificar e garantir precisão, usaremos linhas retas conectadas (L) ou curva simples
    let d = `M ${dataPoints[0].x},${dataPoints[0].y}`;

    // Algoritmo de suavização simples (Bézier quadrática)
    for (let i = 1; i < dataPoints.length; i++) {
        const prev = dataPoints[i - 1];
        const curr = dataPoints[i];
        // Ponto de controle para curva suave
        const cpX = (prev.x + curr.x) / 2;
        d += ` Q ${cpX},${prev.y} ${cpX},${curr.y} T ${curr.x},${curr.y}`;
    }

    return {
      pathData: d,
      areaPath: `${d} V 60 H 0 Z`,
      points: dataPoints // Pontos para o tooltip
    };
  }, [history]);

  // Tratamento visual para "0%"
  const isStable = growth === "+0%" || growth === "0%";
  const growthLabel = isStable ? "Estável" : growth;
  const growthIcon = isStable ? <Minus className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1" />;
  const growthColor = isStable ? "bg-slate-100 text-slate-600" : "bg-emerald-100 text-emerald-700";

  // Estado para Tooltip Interativo
  const [hoveredPoint, setHoveredPoint] = useState<{x: number, y: number, count: number, date: string} | null>(null);

  return (
    <Card className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm h-full flex flex-col justify-between group">
      <div className="p-6 pb-0 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
             <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
             </div>
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Impacto de Hoje</h3>
          </div>
          <Badge variant="secondary" className={`${growthColor} font-bold px-3 py-1`}>
            {growthIcon} {growthLabel}
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row items-baseline gap-3 mb-2">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white">{clicks}</h2>
          <span className="text-lg font-bold text-slate-400">cliques</span>
        </div>

        <p className="text-xs text-slate-500 font-medium mb-6">
          Você está acima de <span className="text-purple-600 font-bold">68%</span> dos novos criadores.
        </p>

        <div className="flex items-center gap-6 text-sm border-t border-slate-100 dark:border-slate-800 pt-4">
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

      {/* ÁREA DO GRÁFICO REAL */}
      <div className="relative h-16 w-full mt-4">
        {/* Tooltip Flutuante */}
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-20 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{ left: hoveredPoint.x, top: hoveredPoint.y - 10 }}
          >
            {hoveredPoint.date}: {hoveredPoint.count} clicks
          </motion.div>
        )}

        <svg className="w-full h-full" viewBox="0 0 320 60" preserveAspectRatio="none">
          <defs>
            <linearGradient id="impactGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Área preenchida */}
          <path d={areaPath} fill="url(#impactGradient)" stroke="none" />

          {/* Linha do Gráfico */}
          <motion.path
            d={pathData}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          {/* Pontos Interativos (Invisíveis até hover) */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="transparent"
              className="cursor-pointer hover:fill-blue-600 transition-colors"
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>
      </div>
    </Card>
  );
}