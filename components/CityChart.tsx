import { MapPin } from "lucide-react";

interface CityChartProps {
  data: { city: string; clicks: number }[];
}

export function CityChart({ data }: CityChartProps) {
  const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0);

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl shadow-gray-200/50">
       <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-teal-500 rounded-xl"><MapPin className="w-6 h-6 text-white" /></div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Cidades</h2>
          <p className="text-gray-600">Distribuição de cliques por cidade</p>
        </div>
      </div>
       {data.length === 0 ? (
        <div className="text-center text-gray-500 py-8">Nenhum dado de cidade disponível.</div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
          {data.map((city) => {
             const width = totalClicks > 0 ? (city.clicks / totalClicks) * 100 : 0;
            return (
              <div key={city.city} className="flex items-center gap-4 text-sm">
                <div className="w-32 font-medium text-gray-800 truncate">{city.city}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                   <div
                    className="bg-gradient-to-r from-teal-400 to-cyan-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${width}%` }}
                  />
                  <span className="absolute inset-0 flex items-center px-3 text-xs font-bold text-white">{city.clicks}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}