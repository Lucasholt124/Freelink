import { Clock, Zap } from "lucide-react";
import { useState } from "react";

interface HourlyChartProps {
  data: { hour_of_day: number; total_clicks: number }[];
}

export function HourlyChart({ data }: HourlyChartProps) {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  const clicksByHour = new Map(data.map(item => [item.hour_of_day, item.total_clicks]));
  const maxClicks = data.length > 0 ? Math.max(...data.map(d => d.total_clicks)) : 1;
  const hoursOfDay = Array.from({ length: 24 }, (_, i) => i);


  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-100">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Atividade por Hora</h3>
          <p className="text-sm text-gray-600">Padrão de engajamento diário</p>
        </div>
      </div>

      {/* Gráfico circular de 24 horas */}
      <div className="relative aspect-square max-w-sm mx-auto">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
          {hoursOfDay.map((hour) => {
            const clicks = clicksByHour.get(hour) || 0;
            const angle = (hour / 24) * 360;

            const innerRadius = 50;
            const outerRadius = innerRadius + (clicks / maxClicks) * 30;

            const x1 = 100 + innerRadius * Math.cos((angle * Math.PI) / 180);
            const y1 = 100 + innerRadius * Math.sin((angle * Math.PI) / 180);
            const x2 = 100 + outerRadius * Math.cos((angle * Math.PI) / 180);
            const y2 = 100 + outerRadius * Math.sin((angle * Math.PI) / 180);

            return (
              <g key={hour}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={hoveredHour === hour ? "#8B5CF6" : "#E5E7EB"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredHour(hour)}
                  onMouseLeave={() => setHoveredHour(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Centro do relógio */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            {hoveredHour !== null && (
              <>
                <p className="text-2xl font-bold text-gray-900">{hoveredHour}:00</p>
                <p className="text-sm text-gray-600">{clicksByHour.get(hoveredHour) || 0} cliques</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Legenda de horários */}
      <div className="grid grid-cols-6 gap-2 mt-6">
        {[0, 4, 8, 12, 16, 20].map(hour => (
          <div key={hour} className="text-center">
            <p className="text-xs font-semibold text-gray-700">{hour}:00</p>
            <p className="text-xs text-gray-500">{clicksByHour.get(hour) || 0} cliques</p>
          </div>
        ))}
      </div>
    </div>
  );
}