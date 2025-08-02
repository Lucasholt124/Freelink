// Em app/dashboard/tracking/page.tsx

import { currentUser } from "@clerk/nextjs/server";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { Lock, Target } from "lucide-react";
import Link from "next/link";
import { TrackingForm } from "@/components/TrackingForm";

// Componente para quando a funcionalidade está bloqueada
function LockedTrackingPage() {
  return (
    <div className="max-w-4xl mx-auto text-center mt-12">
      <div className="bg-white p-10 rounded-2xl border border-gray-200/80 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          <div className="p-4 bg-gray-200 rounded-xl">
            <Lock className="w-8 h-8 text-gray-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Rastreamento de Anúncios Avançado
            </h2>
            <p className="text-gray-600 mt-1">
              🔒 Esta funcionalidade está disponível apenas no plano <strong>Ultra</strong>.
            </p>
          </div>
        </div>
        <p className="mt-6 text-gray-600 max-w-xl mx-auto">
          Faça o upgrade para o plano Ultra e conecte seus Pixels (Facebook, TikTok) e Google Analytics para otimizar suas campanhas, fazer retargeting e entender o ROI dos seus anúncios.
        </p>
        <div className="mt-8">
          <Link
            href="/dashboard/billing"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Ver Planos e Preços
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function TrackingPage() {
  const user = await currentUser();
  if (!user) return null;

  const plan = await getUserSubscriptionPlan(user.id);

  // A funcionalidade só é acessível para usuários do plano Ultra
  if (plan !== "ultra") {
    return <LockedTrackingPage />;
  }

  // Se for Ultra, renderiza o formulário
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Configurações de Rastreamento
          </h1>
        </div>
        <p className="text-gray-600">
          Conecte seus Pixels de rastreamento e Google Analytics para otimizar suas campanhas de marketing.
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-200/80 shadow-lg">
        <TrackingForm />
      </div>
    </div>
  );
}