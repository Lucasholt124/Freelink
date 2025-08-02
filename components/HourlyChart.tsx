"use client";

import { useState } from "react";
import { Clock } from "lucide-react";

interface HourlyChartProps {
  data: { hour_of_day: number; total_clicks: number }[];
}

export function HourlyChart({ data }: HourlyChartProps) {
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  // Cria um mapa de horas para acesso rápido aos dados de cliques das últimas 24h
  const clicksByHour = new Map(data.map(item => [item.hour_of_day, item.total_clicks]));
  const maxClicks = data.length > 0 ? Math.max(...data.map(d => d.total_clicks)) : 1;

  // Gera as 24 horas do dia, que servirão como nosso eixo X fixo
  const hoursOfDay = Array.from({ length: 24 }, (_, i) => i);

  const handleBarClick = (hour: number) => {
    setSelectedHour(selectedHour === hour ? null : hour);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-orange-500 rounded-xl">
          <Clock className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Atividade nas Últimas 24 Horas</h3>
          <p className="text-sm text-gray-500">Distribuição de cliques ao longo do dia.</p>
        </div>
      </div>

      <div className="flex gap-1.5 items-end h-48 pt-8">
        {hoursOfDay.map((hour) => {
          const clicks = clicksByHour.get(hour) || 0;
          const height = (clicks / maxClicks) * 100;
          const isSelected = selectedHour === hour;

          // Mostra a legenda a cada 3 horas para um visual mais limpo
          const showHourLabel = hour % 3 === 0;

          return (
            <div
              key={hour}
              onClick={() => handleBarClick(hour)}
              className="relative flex-1 h-full flex flex-col justify-end items-center group cursor-pointer"
            >
              {/* Tooltip aparece no hover OU se estiver selecionado */}
              {clicks > 0 && (
                <div className={`absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs font-bold rounded-md shadow-lg transition-opacity duration-200 pointer-events-none z-10 ${
                  isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  {clicks} {clicks === 1 ? 'clique' : 'cliques'} às {String(hour).padStart(2, '0')}h
                </div>
              )}

              <div
                className={`w-full rounded-t-md transition-colors duration-200 ${
                  isSelected ? 'bg-orange-500' : (clicks > 0 ? 'bg-orange-300 group-hover:bg-orange-400' : 'bg-gray-100')
                }`}
                style={{ height: `${height}%`, minHeight: '2px' }}
              />

              <div className={`text-[10px] mt-1.5 font-medium transition-colors ${
                isSelected ? 'text-orange-600 font-bold' : 'text-gray-400'
              } ${showHourLabel ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {String(hour).padStart(2, '0')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}