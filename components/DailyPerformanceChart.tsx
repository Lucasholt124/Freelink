import { LinkAnalyticsData } from "@/convex/lib/fetchLinkAnalytics";
import { Calendar, TrendingUp } from "lucide-react";

interface DailyPerformanceChartProps {
  data: LinkAnalyticsData['dailyData'];
}

export function DailyPerformanceChart({ data }: DailyPerformanceChartProps) {
  const maxClicks = data.length > 0 ? Math.max(...data.map(d => d.clicks)) : 0;
  const totalClicks = data.reduce((sum, d) => sum + d.clicks, 0);
  const avgClicks = Math.round(totalClicks / data.length);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-100">
      {/* Header com estatísticas */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Desempenho Diário</h3>
            <p className="text-gray-600">Últimos 7 dias</p>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Média</p>
            <p className="text-2xl font-bold text-gray-900">{avgClicks}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Pico</p>
            <p className="text-2xl font-bold text-purple-600">{maxClicks}</p>
          </div>
        </div>
      </div>

      {/* Gráfico de barras animado */}
      <div className="space-y-4">
        {data.slice(0, 7).map((day, index) => {
          const width = maxClicks > 0 ? (day.clicks / maxClicks) * 100 : 0;
          const isHighest = day.clicks === maxClicks;

          return (
            <div key={day.date} className="group">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-24 text-sm font-semibold text-gray-700">
                  {new Date(day.date).toLocaleDateString('pt-BR', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short',
                    timeZone: 'UTC'
                  })}
                </div>
                <div className="flex-1 relative">
                  <div className="h-10 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
                        isHighest
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                          : 'bg-gradient-to-r from-blue-400 to-purple-400'
                      }`}
                      style={{
                        width: `${width}%`,
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      {/* Efeito de brilho animado */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    </div>
                  </div>
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold ${
                    width > 20 ? 'text-white' : 'text-gray-700 left-full ml-3'
                  }`}>
                    {day.clicks} cliques
                  </span>
                </div>
                {isHighest && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                    <TrendingUp className="w-3 h-3" />
                    Pico
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}