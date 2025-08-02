

import Link from "next/link";
import { ReactElement } from "react";
import { Button } from "./ui/button";

interface LockedFeatureCardProps {
  icon: ReactElement;
  title: string;
  requiredPlan: "Pro" | "Ultra";
  description?: string;
}

export function LockedFeatureCard({
  icon,
  title,
  requiredPlan,
  description,
}: LockedFeatureCardProps) {
  return (
    <div className="text-center p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 h-full flex flex-col items-center justify-center">

      {/* --- CORREÇÃO APLICADA AQUI --- */}
      {/* Em vez de 'cloneElement', criamos um contêiner estilizado para o ícone. */}
      <div className="p-3 bg-gray-200 rounded-full mb-4 w-14 h-14 flex items-center justify-center">
        {/* O ícone que você passa como prop será renderizado aqui dentro.
            Para um bom resultado, garanta que ele tenha classes como "w-8 h-8 text-gray-400".
            No entanto, mesmo que não tenha, o contêiner já dá um bom visual. */}
        {icon}
      </div>

      <h3 className="text-xl font-bold text-gray-800">{title}</h3>

      {description && (
        <p className="text-gray-500 mt-2 max-w-xs mx-auto">
          {description}
        </p>
      )}

      <p className="mt-4 text-sm font-medium text-gray-600 mb-6">
        🔒 Disponível no plano <strong>{requiredPlan}</strong>.
      </p>

      <Button asChild>
        <Link href="/dashboard/billing">Fazer Upgrade</Link>
      </Button>
    </div>
  );
}