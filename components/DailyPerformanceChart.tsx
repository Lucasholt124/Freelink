import { LinkAnalyticsData } from "@/convex/lib/fetchLinkAnalytics";

interface DailyPerformanceChartProps {
  data: LinkAnalyticsData['dailyData'];
}

export function DailyPerformanceChart({ data }: DailyPerformanceChartProps) {
  // Verifica se há dados disponíveis
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Desempenho Diário</h3>
        <div className="text-center text-gray-500 py-8">
          Nenhum dado disponível para exibir
        </div>
      </div>
    );
  }

  // Encontra o valor máximo de cliques para normalizar a largura das barras
  const maxClicks = Math.max(...data.map(d => d.clicks));

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Desempenho Diário</h3>

      <div className="space-y-4">
        {/* Mostra os dados dos últimos 7 dias - CORREÇÃO: slice(-7) pega os últimos 7 */}
        {data.slice(-7).map((day) => {
          // Calcula a largura da barra em porcentagem
          const width = maxClicks > 0 ? (day.clicks / maxClicks) * 100 : 0;

          // CORREÇÃO: Parse correto da data
          const date = new Date(day.date + 'T00:00:00'); // Adiciona hora para evitar problemas de timezone

          return (
            <div key={day.date} className="flex items-center gap-4">
              {/* ÁREA DA CORREÇÃO - Formatação de data melhorada */}
              <div className="w-20 text-sm font-medium text-gray-600 shrink-0">
                {date.toLocaleDateString('pt-BR', {
                  month: 'short',
                  day: '2-digit'
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