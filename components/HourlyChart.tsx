"use client";

import { BarChart3 } from "lucide-react";

interface HourlyChartProps {
  data: { hour_of_day: number; total_clicks: number }[];
}

export function HourlyChart({ data }: HourlyChartProps) {
  // Cria um mapa de horas para fácil e rápido acesso
  const clicksByHour = new Map(data.map(item => [item.hour_of_day, item.total_clicks]));
  const maxClicks = data.length > 0 ? Math.max(...data.map(d => d.total_clicks)) : 0;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-orange-500 rounded-xl"><BarChart3 className="w-6 h-6 text-white" /></div>
        <h3 className="text-xl font-bold text-gray-800">Distribuição por Hora</h3>
      </div>

      <div className="flex gap-1.5 items-end h-40 pt-4">
        {Array.from({ length: 24 }).map((_, hour) => {
          const clicks = clicksByHour.get(hour) || 0;
          const height = maxClicks > 0 ? (clicks / maxClicks) * 100 : 0;
          return (
            <div key={hour} className="flex-1 h-full flex flex-col justify-end items-center group" title={`${clicks} cliques`}>
              <div
                className="w-full bg-orange-200 group-hover:bg-orange-400 rounded-t-md transition-colors"
                style={{ height: `${height}%`, minHeight: '2px' }}
              />
              <div className="text-[10px] text-gray-500 mt-1">{String(hour).padStart(2, '0')}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}