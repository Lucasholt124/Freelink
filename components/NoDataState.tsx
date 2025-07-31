import { BarChart3 } from "lucide-react";

export function NoDataState() {
  return (
    <div className="text-center py-16 text-gray-500 max-w-7xl mx-auto bg-white rounded-2xl shadow-md">
      <BarChart3 className="w-16 h-16 mx-auto mb-4" />
      <h3 className="text-xl font-semibold">Nenhum dado analítico ainda</h3>
      <p>As análises aparecerão aqui assim que seu link receber o primeiro clique.</p>
    </div>
  );
}