import { Globe2, Users } from "lucide-react";

interface CountryChartProps {
  data: { country: string; clicks: number }[];
}

export function CountryChart({ data }: CountryChartProps) {
  const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0);
  const topCountries = data.slice(0, 5);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl">
            <Globe2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Alcance Global</h3>
            <p className="text-gray-600">{data.length} países alcançados</p>
          </div>
        </div>
      </div>

      {/* Top países com design moderno */}
      <div className="space-y-6">
        {topCountries.map((country, index) => {
          const percentage = (country.clicks / totalClicks) * 100;

          return (
            <div key={country.country} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                    index === 0 ? 'from-yellow-400 to-orange-400' :
                    index === 1 ? 'from-gray-300 to-gray-400' :
                    index === 2 ? 'from-orange-300 to-orange-400' :
                    'from-green-300 to-emerald-300'
                  } flex items-center justify-center text-white font-bold text-sm`}>
                    {index + 1}
                  </div>
                  <span className="font-semibold text-gray-800">{country.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="font-bold text-gray-900">{country.clicks}</span>
                  <span className="text-sm text-gray-500">({percentage.toFixed(1)}%)</span>
                </div>
              </div>

              <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                    'bg-gradient-to-r from-green-400 to-emerald-400'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Outros países */}
      {data.length > 5 && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            E mais {data.length - 5} países com {totalClicks - topCountries.reduce((sum, c) => sum + c.clicks, 0)} cliques
          </p>
        </div>
      )}
    </div>
  );
}