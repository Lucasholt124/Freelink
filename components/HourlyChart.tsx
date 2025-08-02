"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { format, startOfHour } from "date-fns";


// A interface de dados que vem do backend
interface HourlyChartProps {
  data: { hour_of_day: number; total_clicks: number }[];
}

export function HourlyChart({ data }: HourlyChartProps) {
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  // 1. Cria um mapa de dados para acesso rápido: { 14 => 5 cliques, 15 => 2 cliques }
  const clicksByHour = new Map(data.map(item => [item.hour_of_day, item.total_clicks]));

  // 2. Encontra o clique máximo para normalizar a altura das barras
  const maxClicks = data.length > 0 ? Math.max(...data.map(d => d.total_clicks)) : 1;

  // 3. Gera a linha do tempo das últimas 24 horas
  const now = new Date();
  const last24Hours = Array.from({ length: 24 }).map((_, i) => {
    const date = new Date(now);
    date.setHours(now.getHours() - i);
    return startOfHour(date); // Garante que a hora está "zerada" (ex: 15:00:00)
  }).reverse(); // Reverte para ter a hora mais antiga primeiro

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

      {/* --- Contêiner com a BARRA DE ROLAGEM --- */}
      <div className="w-full overflow-x-auto pb-4">
        {/* O conteúdo interno tem uma largura mínima para forçar o scroll */}
        <div className="flex gap-1.5 items-end h-48 pt-8 min-w-[48rem]">
          {last24Hours.map((hourDate) => {
            const hourKey = hourDate.getHours();
            const clicks = clicksByHour.get(hourKey) || 0;
            const height = (clicks / maxClicks) * 100;
            const isSelected = selectedHour === hourKey;

            // Formatação para a legenda e tooltip
            const formattedLabel = format(hourDate, "HH'h'");
            const formattedTooltip = `${clicks} ${clicks === 1 ? 'clique' : 'cliques'} entre ${format(hourDate, "HH:00")} e ${format(hourDate, "HH:59")}`;

            const isCurrentHour = hourDate.getHours() === now.getHours();

            return (
              <div
                key={hourDate.toISOString()}
                onClick={() => handleBarClick(hourKey)}
                className="relative flex-1 h-full flex flex-col justify-end items-center group cursor-pointer"
              >
                {/* Tooltip */}
                {clicks > 0 && (
                  <div className={`absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs font-bold rounded-md shadow-lg transition-opacity duration-200 pointer-events-none z-10 ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    {formattedTooltip}
                  </div>
                )}

                {/* Barra do Gráfico */}
                <div
                  className={`w-full rounded-t-md transition-colors duration-200 ${
                    isSelected ? 'bg-orange-500' : (clicks > 0 ? 'bg-orange-300 group-hover:bg-orange-400' : 'bg-gray-100')
                  }`}
                  style={{ height: `${height}%`, minHeight: '3px' }}
                />

                {/* Legenda da Hora */}
                <div className={`text-center text-[10px] w-full mt-1.5 font-medium transition-colors ${
                  isSelected ? 'text-orange-600 font-bold' : (isCurrentHour ? 'text-orange-500' : 'text-gray-400')
                }`}>
                  {formattedLabel}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}