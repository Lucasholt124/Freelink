"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Interface de props
interface HourlyChartProps {
  data: { hour_timestamp: string; total_clicks: number }[];
}

// Sub-componente para o seletor de período (24h / 48h)
function TimeRangeSelector({ range, setRange }: { range: number; setRange: (r: number) => void }) {
  return (
    <div className="flex bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => setRange(24)}
        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
          range === 24 ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Últimas 24h
      </button>
      <button
        onClick={() => setRange(48)}
        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
          range === 48 ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Últimas 48h
      </button>
    </div>
  );
}

export function HourlyChart({ data }: HourlyChartProps) {
  const [range, setRange] = useState(24);

  const clicksByTimestamp = new Map(data.map(item => [new Date(item.hour_timestamp).getTime(), item.total_clicks]));

  const now = new Date();
  const hoursToShow = Array.from({ length: range }).map((_, i) => {
    const date = new Date(now);
    date.setHours(now.getHours() - i);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }).reverse();

  const maxClicks = data.length > 0 ? Math.max(...data.map(d => d.total_clicks)) : 1;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500 rounded-xl">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Atividade por Hora</h3>
            <p className="text-sm text-gray-500">Cliques recebidos nas últimas {range} horas.</p>
          </div>
        </div>
        <TimeRangeSelector range={range} setRange={setRange} />
      </div>

      <div className="w-full overflow-x-auto pb-4">
        <div className="flex gap-1 items-end h-48 pt-8" style={{ width: `${range * 2.5}rem` }}>
          {hoursToShow.map((hourDate) => {
            const clicks = clicksByTimestamp.get(hourDate.getTime()) || 0;
            const height = (clicks / maxClicks) * 100;

            const formattedHour = format(hourDate, "HH'h'");
            const formattedTooltip = `${clicks} ${clicks === 1 ? 'clique' : 'cliques'} em ${format(hourDate, "dd/MM 'às' HH:mm", { locale: ptBR })}`;

            const isCurrentHour = hourDate.getHours() === now.getHours() && hourDate.getDate() === now.getDate();
            const showLabel = hourDate.getHours() % 3 === 0;

            return (
              <div key={hourDate.toISOString()} className="relative flex-1 h-full flex flex-col justify-end items-center group cursor-pointer" title={formattedTooltip}>
                <div
                  className={`absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs font-bold rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10`}
                >
                  {formattedTooltip}
                </div>

                <div
                  className={`w-full rounded-t-md transition-colors duration-200 ${
                    clicks > 0 ? 'bg-orange-300 group-hover:bg-orange-500' : 'bg-gray-100'
                  }`}
                  style={{ height: `${height}%`, minHeight: '3px' }}
                />

                <div
                  className={`text-[10px] mt-1.5 font-medium ${isCurrentHour ? 'text-orange-600' : 'text-gray-400'} ${showLabel ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                  {formattedHour}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}