// Em components/UpgradePaywall.tsx
import Link from "next/link";
import { Button } from "./ui/button";
import { Lock } from "lucide-react";

interface UpgradePaywallProps {
  title: string;
  description: string;
}

export default function UpgradePaywall({ title, description }: UpgradePaywallProps) {
  return (
    <div className="bg-gray-50 p-8 rounded-lg text-center flex flex-col items-center">
        <div className="bg-purple-100 p-3 rounded-full mb-4">
            <Lock className="w-6 h-6 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600 mt-2 max-w-md">
            {description}
        </p>
        <Button asChild className="mt-6">
            <Link href="/dashboard/billing">Fazer Upgrade Agora</Link>
        </Button>
    </div>
  );
}