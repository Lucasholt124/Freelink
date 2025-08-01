"use client";

import { useState } from "react"; // <-- IMPORTANTE: para guardar o estado
import { BarChart3 } from "lucide-react";

interface HourlyChartProps {
  data: { hour_of_day: number; total_clicks: number }[];
}

export function HourlyChart({ data }: HourlyChartProps) {
  // Estado para armazenar qual hora está selecionada (para mobile)
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  const clicksByHour = new Map(data.map(item => [item.hour_of_day, item.total_clicks]));
  const maxClicks = data.length > 0 ? Math.max(...data.map(d => d.total_clicks)) : 0;

  // Função para lidar com o clique/toque na barra
  const handleBarClick = (hour: number) => {
    // Se a barra já estiver selecionada, deselecione. Senão, selecione-a.
    setSelectedHour(selectedHour === hour ? null : hour);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-orange-500 rounded-xl">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Distribuição por Hora</h3>
      </div>

      <div className="flex gap-1 sm:gap-1.5 items-end h-48 pt-8">
        {Array.from({ length: 24 }).map((_, hour) => {
          const clicks = clicksByHour.get(hour) || 0;
          const height = maxClicks > 0 ? (clicks / maxClicks) * 100 : 0;
          const showHourLabel = hour % 2 === 0;

          // Verifica se a barra atual está selecionada
          const isSelected = selectedHour === hour;

          return (
            <div
              key={hour}
              // **MUDANÇA MOBILE:** Adicionamos o onClick
              onClick={() => handleBarClick(hour)}
              className="relative flex-1 h-full flex flex-col justify-end items-center group cursor-pointer"
            >
              {clicks > 0 && (
                <div
                  // **MUDANÇA MOBILE:** O tooltip agora aparece se a barra estiver selecionada OU no hover
                  className={`absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs font-bold rounded-md shadow-lg transition-opacity duration-200 pointer-events-none ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {clicks} {clicks === 1 ? 'clique' : 'cliques'}
                </div>
              )}

              <div
                // **MUDANÇA MOBILE:** A barra fica mais escura se estiver selecionada
                className={`w-full rounded-t-md transition-all duration-200 ${
                  isSelected ? 'bg-orange-500' : 'bg-orange-200 group-hover:bg-orange-400'
                }`}
                style={{ height: `${height}%`, minHeight: '2px' }}
              />

              <div
                className={`text-[10px] mt-1.5 ${
                  isSelected ? 'text-orange-600 font-bold' : 'text-gray-500'
                } ${!showHourLabel && 'hidden sm:inline'}`}
              >
                {String(hour).padStart(2, '0')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}