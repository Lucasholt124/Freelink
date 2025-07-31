import { Lock } from "lucide-react";
import Link from "next/link";

interface LockedFeatureCardProps {
  title: string;
  icon: React.ReactNode;
  requiredPlan: "Pro" | "Ultra";
}

export function LockedFeatureCard({ title, icon, requiredPlan }: LockedFeatureCardProps) {
  return (
    <div className="bg-white/60 backdrop-blur-sm border border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-md">
      <div className="flex items-center gap-2 mb-2 text-gray-500">
        {icon}
        <Lock className="w-5 h-5" />
      </div>
      <p className="font-bold text-gray-800">{title}</p>
      <p className="text-sm text-gray-600 mb-4">Disponível no plano {requiredPlan}</p>
      <Link
        href="/dashboard/billing"
        className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
      >
        Fazer Upgrade
      </Link>
    </div>
  );
}