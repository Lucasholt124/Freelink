import { BarChart3 } from "lucide-react";

interface HourlyChartProps {
  data: { hour_of_day: number; total_clicks: number }[];
}

export function HourlyChart({ data }: HourlyChartProps) {
  const maxClicks = data.length > 0 ? Math.max(...data.map(d => d.total_clicks)) : 0;
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hourData = data.find(d => d.hour_of_day === i);
    return {
      hour: i,
      clicks: hourData?.total_clicks || 0,
    };
  });

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl shadow-gray-200/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-orange-500 rounded-xl"><BarChart3 className="w-6 h-6 text-white" /></div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Horários de Pico</h2>
          <p className="text-gray-600">Distribuição de cliques ao longo do dia</p>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="text-center text-gray-500 py-8">Nenhum dado de horário disponível.</div>
      ) : (
        <div className="flex gap-1.5 items-end h-40 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 pb-4">
          {hours.map(({ hour, clicks }) => {
            const height = maxClicks > 0 ? (clicks / maxClicks) * 100 : 0;
            return (
              <div key={hour} className="flex flex-col items-center flex-1 min-w-[24px] group">
                <div
                  className="rounded-t w-full bg-orange-300 group-hover:bg-orange-500 transition-all duration-300"
                  style={{ height: `${height}%`, minHeight: '2px' }}
                  title={`${clicks} cliques`}
                />
                <span className="text-[10px] mt-1 text-gray-500">{String(hour).padStart(2, '0')}h</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}