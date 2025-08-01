import type { LinkAnalyticsData } from "@/convex/lib/fetchLinkAnalytics";
import { Map } from "lucide-react";

/**
 * Dicionário para traduzir códigos de região para nomes legíveis.
 * Ele lida com três cenários:
 * 1. Códigos antigos da Vercel Edge (ex: "gru1") para manter compatibilidade com dados já salvos.
 * 2. Códigos de estado padrão (ISO 3166-2) que serão salvos pela API corrigida.
 * 3. Códigos de outros países para internacionalização.
 */
const regionCodeToName: { [key: string]: string } = {
  // Códigos antigos da Vercel (para compatibilidade)
  gru1: "São Paulo",
  rio1: "Rio de Janeiro",
  sfo1: "Califórnia, EUA",
  iad1: "Virgínia, EUA",
  lhr1: "Londres, UK",

  // Todos os Estados Brasileiros + Distrito Federal
  AC: "Acre",
  AL: "Alagoas",
  AP: "Amapá",
  AM: "Amazonas",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MT: "Mato Grosso",
  MS: "Mato Grosso do Sul",
  MG: "Minas Gerais",
  PA: "Pará",
  PB: "Paraíba",
  PR: "Paraná",
  PE: "Pernambuco",
  PI: "Piauí",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul",
  RO: "Rondônia",
  RR: "Roraima",
  SC: "Santa Catarina",
  SP: "São Paulo",
  SE: "Sergipe",
  TO: "Tocantins",

  // Exemplo de como adicionar outros países
  US: "Estados Unidos",
  PT: "Portugal",
  DE: "Alemanha",

  // Fallback
  Unknown: "Desconhecido",
};

/**
 * Função auxiliar que recebe um código de região (ex: "SP")
 * e retorna o nome completo (ex: "São Paulo").
 * Se o código não for encontrado, retorna o próprio código para depuração.
 */
function getRegionName(code: string | null | undefined): string {
  if (!code) return "Desconhecido";
  return regionCodeToName[code] || code;
}

export function RegionChart({ data }: { data: LinkAnalyticsData['regionData'] }) {
  // Calcula o total de cliques para poder definir a porcentagem de cada barra.
  const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-indigo-500 rounded-xl">
          <Map className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Principais Regiões</h3>
      </div>
      <div className="space-y-3">
        {data.slice(0, 7).map((regionData) => {
          const percentage = totalClicks > 0 ? (regionData.clicks / totalClicks) * 100 : 0;
          // Usa a função auxiliar para obter o nome legível
          const displayName = getRegionName(regionData.region);

          return (
            <div key={regionData.region} className="flex items-center gap-4">
              {/* Nome da Região: `truncate` corta o texto se for muito longo,
                  e `title` mostra o nome completo ao passar o mouse. */}
              <div className="w-36 text-sm font-medium text-gray-700 truncate" title={displayName}>
                {displayName}
              </div>

              {/* Barra de Progresso: `relative` é crucial para posicionar o texto sobre a barra. */}
              <div className="flex-1 bg-gray-200 h-6 rounded-full relative">
                <div
                  className="bg-gradient-to-r from-indigo-400 to-purple-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
                {/* Contagem de Cliques: `absolute` e `inset-0` posicionam sobre a barra. */}
                <span className="absolute inset-0 flex items-center px-2.5 text-xs font-bold text-white">
                  {regionData.clicks}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}