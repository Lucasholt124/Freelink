"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { format, isSameHour, startOfHour } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HourlyChartProps {
  data: { hour_timestamp: string; total_clicks: number }[];
}

function TimeRangeSelector({ range, setRange }: { range: number; setRange: (r: number) => void }) {
  return (
    <div className="flex bg-gray-100 p-1 rounded-lg">
      <button onClick={() => setRange(24)} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${range === 24 ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Últimas 24h</button>
      <button onClick={() => setRange(48)} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${range === 48 ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Últimas 48h</button>
    </div>
  );
}

export function HourlyChart({ data }: HourlyChartProps) {
  const [range, setRange] = useState(24);
  // --- ADICIONADO DE VOLTA: Estado para a barra selecionada no mobile ---
  const [selectedHour, setSelectedHour] = useState<Date | null>(null);

  const now = new Date();
  const timelineHours = Array.from({ length: range }).map((_, i) => {
    const date = new Date(now);
    date.setHours(now.getHours() - i);
    return startOfHour(date);
  }).reverse();

  const clicksData = data.map(item => ({
    date: new Date(item.hour_timestamp),
    clicks: item.total_clicks,
  }));

  const maxClicks = clicksData.length > 0 ? Math.max(...clicksData.map(d => d.clicks)) : 1;

  const chartData = timelineHours.map(hour => {
    const dataPoint = clicksData.find(d => isSameHour(d.date, hour));
    return { date: hour, clicks: dataPoint?.clicks || 0 };
  });

  // --- ADICIONADO DE VOLTA: Função para lidar com o clique/toque ---
  const handleBarClick = (hour: Date) => {
    // Se a mesma barra for clicada, deseleciona. Senão, seleciona a nova.
    setSelectedHour(selectedHour && isSameHour(selectedHour, hour) ? null : hour);
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/80 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500 rounded-xl"><Clock className="w-6 h-6 text-white" /></div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Atividade por Hora</h3>
            <p className="text-sm text-gray-500">Cliques recebidos nas últimas {range} horas.</p>
          </div>
        </div>
        <TimeRangeSelector range={range} setRange={setRange} />
      </div>

      {chartData.every(d => d.clicks === 0) ? (
        <div className="h-48 flex items-center justify-center text-center text-gray-500">
          <p>Nenhuma atividade registrada nas últimas {range} horas.</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto pb-4">
          <div className="flex gap-1 items-end h-48 pt-8" style={{ width: `${range * 2.5}rem` }}>
            {chartData.map((item) => {
              const height = (item.clicks / maxClicks) * 100;
              const formattedHour = format(item.date, "HH'h'");
              const formattedTooltip = `${item.clicks} ${item.clicks === 1 ? 'clique' : 'cliques'} em ${format(item.date, "dd/MM 'às' HH:mm", { locale: ptBR })}`;
              const isCurrentHour = isSameHour(item.date, now);
              const showLabel = item.date.getHours() % 3 === 0;
              // Verifica se a barra atual está selecionada
              const isSelected = selectedHour && isSameHour(selectedHour, item.date);

              return (
                <div
                  key={item.date.toISOString()}
                  // --- ADICIONADO DE VOLTA: Evento onClick ---
                  onClick={() => handleBarClick(item.date)}
                  className="relative flex-1 h-full flex flex-col justify-end items-center group cursor-pointer"
                  // Não usamos mais o 'title' pois o tooltip customizado é melhor
                >
                  {/* Tooltip agora aparece no hover OU se estiver selecionado */}
                  {item.clicks > 0 && (
                    <div className={`absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs font-bold rounded-md shadow-lg transition-opacity duration-200 pointer-events-none z-10 ${
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      {formattedTooltip}
                    </div>
                  )}

                  {/* Barra agora fica mais escura se estiver selecionada */}
                  <div
                    className={`w-full rounded-t-md transition-colors duration-200 ${
                      isSelected ? 'bg-orange-500' : (item.clicks > 0 ? 'bg-orange-300 group-hover:bg-orange-500' : 'bg-gray-100')
                    }`}
                    style={{ height: `${height}%`, minHeight: '3px' }}
                  />

                  {/* Legenda agora fica destacada se estiver selecionada */}
                  <div className={`text-[10px] mt-1.5 font-medium ${
                    isSelected ? 'text-orange-600 font-bold' : (isCurrentHour ? 'text-orange-500' : 'text-gray-400')
                  } ${showLabel ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {formattedHour}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}