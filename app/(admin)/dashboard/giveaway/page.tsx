
import { currentUser } from "@clerk/nextjs/server";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

import { Lock, Gift, Instagram } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import GiveawayTool from "@/components/GiveawayTool";

// Componente para quando o usuário é Ultra mas não conectou o Instagram
function ConnectInstagramPrompt() {
  return (
    <div className="text-center p-8 border-2 border-dashed rounded-xl bg-gray-50">
      <Instagram className="w-10 h-10 mx-auto text-gray-400 mb-3" />
      <h3 className="text-xl font-semibold text-gray-800">Conecte seu Instagram para Começar</h3>
      <p className="text-gray-600 mt-2 max-w-md mx-auto">
        A ferramenta de sorteios precisa de acesso aos comentários do seu post. Conecte sua conta do Instagram nas configurações para continuar.
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard/settings">Conectar Conta do Instagram</Link>
      </Button>
    </div>
  );
}

// Componente para quando o plano não é Ultra
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
          Realize sorteios justos e transparentes direto dos comentários de seus posts do Instagram.
        </p>
        <Button asChild className="mt-8">
          <Link href="/dashboard/billing">Fazer Upgrade para o Ultra</Link>
        </Button>
    </div>
  );
}

export default async function GiveawayPage() {
  const user = await currentUser();
  if (!user) return null;

  // Busca os dados do plano E da conexão em paralelo
  const [subscription, instagramConnection] = await Promise.all([
    getUserSubscriptionPlan(user.id),
    fetchQuery(api.connections.get, { provider: "instagram" })
  ]);

  // Verificação 1: O plano é Ultra?
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
            <p className="text-gray-600 mt-1">Selecione um vencedor a partir de um post do Instagram.</p>
        </div>
      </div>

      {/*
        Verificação 2: O Instagram está conectado?
        Se o usuário for Ultra mas não tiver conectado, mostramos o convite.
        Se estiver conectado, mostramos a ferramenta.
      */}
      {instagramConnection ? (
        <div className="bg-white p-8 sm:p-10 rounded-2xl border border-gray-200/80 shadow-lg">
          <GiveawayTool />
        </div>
      ) : (
        <ConnectInstagramPrompt />
      )}
    </div>
  );
}