import { LinkAnalyticsData } from "@/convex/lib/fetchLinkAnalytics";

// Interface para garantir que os dados de entrada estejam corretos.
interface DailyPerformanceChartProps {
  data: LinkAnalyticsData['dailyData'];
}

export function DailyPerformanceChart({ data }: DailyPerformanceChartProps) {
  // Encontra o valor máximo de cliques para normalizar a largura das barras.
  const maxClicks = data.length > 0 ? Math.max(...data.map(d => d.clicks)) : 0;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Desempenho Diário</h3>
      <div className="space-y-4">
        {/* Mostra os dados dos últimos 7 dias */}
        {data.slice(0, 7).map((day) => {
          // Calcula a largura da barra em porcentagem.
          const width = maxClicks > 0 ? (day.clicks / maxClicks) * 100 : 0;

          return (
            <div key={day.date} className="flex items-center gap-4">

              {/* ÁREA DA CORREÇÃO */}
              <div className="w-20 text-sm font-medium text-gray-600 shrink-0">
                {/*
                  Adicionamos timeZone: 'UTC' para que a data seja formatada
                  considerando o fuso horário UTC, evitando o problema de
                  "voltar um dia" em fusos como o do Brasil (UTC-3).
                */}
                {new Date(day.date).toLocaleDateString('pt-BR', {
                  month: 'short',
                  day: '2-digit',
                  timeZone: 'UTC'
                })}
              </div>

              <div className="flex-1 bg-gray-200 rounded-full h-7 relative">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${width}%` }}
                />
                {/* Mostra o número de cliques sobre a barra */}
                <span className="absolute inset-0 flex items-center px-3 text-sm font-bold text-white shadow-sm">
                  {day.clicks}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}