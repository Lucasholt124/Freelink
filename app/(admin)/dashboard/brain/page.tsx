// Em app/dashboard/brain/page.tsx
// (Este arquivo já está correto e funcional)

import { currentUser } from "@clerk/nextjs/server";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { Lock, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FreelinnkBrainTool from "@/components/FreelinnkBrainTool";

// Componente de Paywall para quando o usuário é do plano Free
function LockedBrainPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[60vh] bg-gray-50 rounded-2xl">
        <div className="p-4 bg-purple-100 rounded-full mb-4">
            <Lock className="w-10 h-10 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
            Freelinnk Brain™ (Plano Pro e Ultra)
        </h2>
        <p className="text-gray-600 mt-2 max-w-xl mx-auto">
          Desbloqueie sua fábrica de conteúdo viral. Gere títulos, roteiros para Reels e ideias para carrosséis em segundos com o poder da nossa IA.
        </p>
        <Button asChild className="mt-8">
          <Link href="/dashboard/billing">
            Fazer Upgrade
          </Link>
        </Button>
    </div>
  );
}

export default async function BrainPage() {
  const user = await currentUser();
  if (!user) return null;

  // Busca o objeto de assinatura completo
  const subscription = await getUserSubscriptionPlan(user.id);

  // =======================================================
  // A LÓGICA DE ACESSO JÁ ESTÁ CORRETA
  // =======================================================
  // Libera o acesso para 'pro' E 'ultra', bloqueando apenas o 'free'.
  if (subscription.plan !== "pro" && subscription.plan !== "ultra") {
    return <LockedBrainPage />;
  }

  // Se o plano for Pro ou Ultra, renderiza a ferramenta.
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-purple-100 rounded-xl">
            <BrainCircuit className="w-7 h-7 text-purple-600" />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Freelinnk Brain™</h1>
            <p className="text-gray-600 mt-1">Sua fábrica de conteúdo viral. Fale um tema, e nós criamos o resto.</p>
        </div>
      </div>
      <FreelinnkBrainTool />
    </div>
  );
}