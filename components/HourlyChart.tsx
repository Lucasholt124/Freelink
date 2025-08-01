"use client";

import { BarChart3 } from "lucide-react";

interface HourlyChartProps {
  data: { hour_of_day: number; total_clicks: number }[];
}

export function HourlyChart({ data }: HourlyChartProps) {
  // Cria um mapa de horas para acesso rápido aos dados de cliques.
  const clicksByHour = new Map(data.map(item => [item.hour_of_day, item.total_clicks]));

  // Encontra o valor máximo de cliques para normalizar a altura das barras.
  // Se não houver dados, o máximo é 0.
  const maxClicks = data.length > 0 ? Math.max(...data.map(d => d.total_clicks)) : 0;

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-orange-500 rounded-xl">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Distribuição por Hora</h3>
      </div>

      {/* Container do gráfico com altura fixa e padding para espaço */}
      <div className="flex gap-1 sm:gap-1.5 items-end h-48 pt-8">
        {/* Gera 24 barras, uma para cada hora do dia */}
        {Array.from({ length: 24 }).map((_, hour) => {
          const clicks = clicksByHour.get(hour) || 0;
          // Calcula a altura da barra em porcentagem, baseada no `maxClicks`
          const height = maxClicks > 0 ? (clicks / maxClicks) * 100 : 0;
          // Determina se a legenda da hora deve ser mostrada para evitar sobreposição em telas pequenas
          const showHourLabel = hour % 2 === 0;

          return (
            // **MUDANÇA 1: Adicionado `relative` para posicionar o tooltip e `group` para o hover**
            <div key={hour} className="relative flex-1 h-full flex flex-col justify-end items-center group">

              {/* **MUDANÇA 2: Tooltip customizado que aparece no hover** */}
              {/* Ele só é renderizado se houver cliques para aquela hora */}
              {clicks > 0 && (
                <div
                  className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs font-bold rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                >
                  {/* Lógica para mostrar "clique" ou "cliques" */}
                  {clicks} {clicks === 1 ? 'clique' : 'cliques'}
                </div>
              )}

              {/* A barra visual do gráfico */}
              <div
                className="w-full bg-orange-200 group-hover:bg-orange-400 rounded-t-md transition-all duration-200"
                // Garante que mesmo com 0 cliques, a barra tenha uma altura mínima para ser visível
                style={{ height: `${height}%`, minHeight: '2px' }}
              />

              {/* Legenda da hora (e.g., "00", "01", "02") */}
              {/* **MUDANÇA 3: Melhoria na responsividade das legendas** */}
              <div
                // Em telas pequenas (abaixo de `sm`), só mostra as legendas pares. Em telas maiores, mostra todas.
                className={`text-[10px] text-gray-500 mt-1.5 ${!showHourLabel && 'hidden sm:inline'}`}
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