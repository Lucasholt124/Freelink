import { LinkAnalyticsData } from "@/convex/lib/fetchLinkAnalytics";


export function DailyPerformanceChart({ data }: { data: LinkAnalyticsData['dailyData'] }) {
  const maxClicks = data.length > 0 ? Math.max(...data.map(d => d.clicks)) : 0;
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Desempenho Diário</h3>
      <div className="space-y-4">
        {data.slice(0, 7).map((day) => {
          const width = maxClicks > 0 ? (day.clicks / maxClicks) * 100 : 0;
          return (
            <div key={day.date} className="flex items-center gap-4">
              <div className="w-20 text-sm font-medium text-gray-600">{new Date(day.date).toLocaleDateString('pt-BR', {month: 'short', day: '2-digit'})}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-7 relative">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all" style={{ width: `${width}%` }} />
                <span className="absolute inset-0 flex items-center px-3 text-xs font-bold text-white">{day.clicks}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}