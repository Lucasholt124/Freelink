import type { LinkAnalyticsData } from "@/convex/lib/fetchLinkAnalytics";
import { Map } from "lucide-react";

export function RegionChart({ data }: { data: LinkAnalyticsData['regionData'] }) {
  const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0);
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-indigo-500 rounded-xl"><Map className="w-6 h-6 text-white" /></div>
        <h3 className="text-xl font-bold text-gray-800">Principais Estados</h3>
      </div>
      <div className="space-y-3">
        {data.slice(0, 7).map((region) => {
          const width = totalClicks > 0 ? (region.clicks / totalClicks) * 100 : 0;
          return (
            <div key={region.region} className="flex items-center gap-4">
              <div className="w-28 text-sm font-medium text-gray-700 truncate">{region.region}</div>
              <div className="flex-1 bg-gray-200 h-6 rounded-full">
                <div className="bg-gradient-to-r from-indigo-400 to-purple-500 h-full rounded-full" style={{ width: `${width}%` }} />
                <span className="absolute inset-0 flex items-center px-2 text-xs font-bold text-white">{region.clicks}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}