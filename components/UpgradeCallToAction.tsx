import { Lock } from "lucide-react";
import Link from "next/link";

export function UpgradeCallToAction() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center bg-white p-10 rounded-2xl shadow-xl max-w-lg mx-auto">
        <div className="mx-auto w-fit p-4 bg-gray-200 rounded-full mb-6">
          <Lock className="w-8 h-8 text-gray-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Análise de links</h2>
        <p className="text-gray-600 mt-2 mb-6">🔒 Atualize para o plano Pro ou Ultra para desbloquear insights poderosos.</p>
        <Link href="/dashboard/billing" className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity">
          Ver Planos
        </Link>
      </div>
    </div>
  );
}