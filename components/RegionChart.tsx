// Este arquivo já está correto. Não precisa de alterações.

import type { LinkAnalyticsData } from "@/convex/lib/fetchLinkAnalytics";
import { Map } from "lucide-react";

const regionCodeToName: { [key: string]: string } = {
  // Códigos antigos (para compatibilidade)
  gru1: "Sergipe", rio1: "Rio de Janeiro",
  // Todos os Estados Brasileiros + DF
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia",
  CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás",
  MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul", MG: "Minas Gerais",
  PA: "Pará", PB: "Paraíba", PR: "Paraná", PE: "Pernambuco", PI: "Piauí",
  RJ: "Rio de Janeiro", RN: "Rio Grande do Norte", RS: "Rio Grande do Sul",
  RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina", SP: "São Paulo",
  SE: "Sergipe", TO: "Tocantins",
  Unknown: "Desconhecido",
};

function getRegionName(code: string | null | undefined): string {
  if (!code) return "Desconhecido";
  return regionCodeToName[code] || code;
}

export function RegionChart({ data }: { data: LinkAnalyticsData['regionData'] }) {
  const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-indigo-500 rounded-xl"><Map className="w-6 h-6 text-white" /></div>
        <h3 className="text-xl font-bold text-gray-800">Principais Regiões</h3>
      </div>
      <div className="space-y-3">
        {data.slice(0, 7).map((regionData) => {
          const percentage = totalClicks > 0 ? (regionData.clicks / totalClicks) * 100 : 0;
          const displayName = getRegionName(regionData.region);

          return (
            <div key={regionData.region} className="flex items-center gap-4">
              <div className="w-36 text-sm font-medium text-gray-700 truncate" title={displayName}>{displayName}</div>
              <div className="flex-1 bg-gray-200 h-6 rounded-full relative">
                <div
                  className="bg-gradient-to-r from-indigo-400 to-purple-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
                <span className="absolute inset-0 flex items-center px-2.5 text-xs font-bold text-white">{regionData.clicks}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}