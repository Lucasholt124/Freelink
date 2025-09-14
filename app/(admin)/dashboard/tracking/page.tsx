// Em app/dashboard/tracking/page.tsx
// (Substitua o arquivo inteiro)

import { currentUser } from "@clerk/nextjs/server";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { Lock, Target } from "lucide-react";
import Link from "next/link";
import { TrackingForm } from "@/components/TrackingForm";
import { Button } from "@/components/ui/button";

function LockedTrackingPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[60vh]">
        <div className="p-4 bg-purple-100 rounded-full mb-4">
            <Lock className="w-10 h-10 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
            Rastreamento Avançado (Plano Ultra)
        </h2>
        <p className="text-gray-600 mt-2 max-w-xl mx-auto">
          Conecte seus Pixels (Facebook, TikTok) e Google Analytics para otimizar suas campanhas, fazer retargeting e entender o ROI dos seus anúncios.
        </p>
        <Button asChild className="mt-8">
          <Link href="/dashboard/billing">
            Fazer Upgrade para o Ultra
          </Link>
        </Button>
    </div>
  );
}

export default async function TrackingPage() {
  const user = await currentUser();
  if (!user) return null;

  // `subscription` é o objeto { plan: '...', ... }
  const subscription = await getUserSubscriptionPlan(user.id);

  // =======================================================
  // CORREÇÃO APLICADA AQUI
  // =======================================================
  // Comparamos a propriedade `plan` de dentro do objeto.
  if (subscription.plan !== "ultra") {
    return <LockedTrackingPage />;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-purple-100 rounded-xl">
            <Target className="w-7 h-7 text-purple-600" />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações de Rastreamento</h1>
            <p className="text-gray-600 mt-1">Otimize suas campanhas de marketing conectando seus Pixels.</p>
        </div>
      </div>
      <div className="bg-white p-8 sm:p-10 rounded-2xl border border-gray-200/80 shadow-lg">
        <TrackingForm />
      </div>
    </div>
  );
}