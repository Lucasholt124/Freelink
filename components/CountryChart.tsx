import { LinkAnalyticsData } from "@/convex/lib/fetchLinkAnalytics";



export function CountryChart({ data }: { data: LinkAnalyticsData['countryData'] }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Principais Países</h3>
      <div className="space-y-3">
        {data.slice(0, 7).map((c) => (
          <div key={c.country} className="flex items-center gap-4">
            <div className="w-28 text-sm font-medium text-gray-700 truncate">{c.country}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full" style={{ width: `${c.percentage}%` }}/>
              <span className="absolute inset-0 flex items-center px-2 text-xs font-bold text-white">{c.clicks}</span>
            </div>
            <div className="w-16 text-right text-sm font-medium text-gray-500">{c.percentage.toFixed(1)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}