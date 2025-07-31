import { MousePointer, Users, Globe } from "lucide-react";

// Defina um tipo mais seguro para as chaves do objeto de ícones
type MetricTitle = "Total de cliques" | "Visitantes Únicos" | "Países Alcançados";

const icons: Record<MetricTitle, React.ReactNode> = {
  "Total de cliques": <MousePointer className="w-6 h-6 text-blue-600" />,
  "Visitantes Únicos": <Users className="w-6 h-6 text-purple-600" />,
  "Países Alcançados": <Globe className="w-6 h-6 text-green-600" />,
};

// Atualize as props para usar o tipo que definimos
export function MetricCard({ title, value }: { title: MetricTitle; value: number }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex items-start gap-4">
      {/* Ícone renderizado dinamicamente a partir da constante */}
      <div className="p-3 bg-gray-100 rounded-xl">
        {icons[title]}
      </div>

      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-4xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}