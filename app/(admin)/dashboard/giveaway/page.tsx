// Em app/dashboard/giveaway/page.tsx
// (Substitua o arquivo inteiro)

import { currentUser } from "@clerk/nextjs/server";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { Lock, Gift } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import GiveawayTool from "@/components/GiveawayTool";


function LockedGiveawayPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[60vh]">
        <div className="p-4 bg-purple-100 rounded-full mb-4">
            <Lock className="w-10 h-10 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
            Ferramenta de Sorteios (Plano Ultra)
        </h2>
        <p className="text-gray-600 mt-2 max-w-xl mx-auto">
          Realize sorteios justos e transparentes direto dos comentários de seus posts do Instagram. Filtre por menções, evite duplicatas e anuncie o vencedor com um clique.
        </p>
        <Button asChild className="mt-8">
          <Link href="/dashboard/billing">
            Fazer Upgrade para o Ultra
          </Link>
        </Button>
    </div>
  );
}

export default async function GiveawayPage() {
  const user = await currentUser();
  if (!user) return null;

  // `subscription` é o objeto { plan: '...', ... }
  const subscription = await getUserSubscriptionPlan(user.id);

  // =======================================================
  // CORREÇÃO APLICADA AQUI
  // =======================================================
  // Comparamos a propriedade `plan` de dentro do objeto.
  if (subscription.plan !== "ultra") {
    return <LockedGiveawayPage />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-purple-100 rounded-xl">
            <Gift className="w-7 h-7 text-purple-600" />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Ferramenta de Sorteio</h1>
            <p className="text-gray-600 mt-1">Selecione um vencedor de forma justa e transparente a partir de um post do Instagram.</p>
        </div>
      </div>
      <div className="bg-white p-8 sm:p-10 rounded-2xl border border-gray-200/80 shadow-lg">
        <GiveawayTool />
      </div>
    </div>
  );
}