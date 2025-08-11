// Em /components/InstagramConnection.tsx
// (Substitua o arquivo inteiro)

"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "./ui/button";
import { Instagram, CheckCircle } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

// Componente para o estado de carregamento
function ConnectionSkeleton() {
  return (
    <div className="bg-gray-100 p-4 rounded-lg animate-pulse">
      <div className="h-6 w-3/4 bg-gray-300 rounded-md"></div>
      <div className="h-4 w-1/2 bg-gray-200 rounded-md mt-2"></div>
    </div>
  );
}

export function InstagramConnection() {
  // 1. Busca os dados da conexão em tempo real.
  const connection = useQuery(api.connections.get, { provider: "instagram" });

  // 2. Acessa os parâmetros da URL e o roteador.
  const searchParams = useSearchParams();
  const router = useRouter();

  // 3. Efeito que reage às mudanças na URL (após o redirecionamento).
  useEffect(() => {
    const status = searchParams.get('status');

    if (status === 'connected') {
      toast.success("Instagram conectado com sucesso!");
      // Limpa os parâmetros da URL para evitar que o toast apareça em cada refresh.
      router.replace('/dashboard/settings', { scroll: false });
      // Força o Next.js a revalidar os dados para esta rota, fazendo com que `useQuery` busque novamente.
      router.refresh();
    } else if (status === 'error') {
      toast.error("Falha ao conectar com o Instagram. Tente novamente.");
      // Também limpa a URL em caso de erro.
      router.replace('/dashboard/settings', { scroll: false });
    }
  }, [searchParams, router]);

  // `connection` será `undefined` durante o carregamento inicial.
  if (connection === undefined) {
    return <ConnectionSkeleton />;
  }

  // Se a conexão existir, mostra o card de sucesso.
  if (connection) {
    return (
      <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-900">Instagram Conectado</p>
            <p className="text-sm text-green-700">
              Sua conta está vinculada e pronta para usar as ferramentas de IA.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" disabled>Desconectar (em breve)</Button>
      </div>
    );
  }

  // Se a conexão não existir, mostra o card com o botão para conectar.
  return (
    <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <p className="font-semibold text-gray-800">Conectar com Instagram</p>
        <p className="text-sm text-gray-600">
          Autorize o Freelinnk para análises automáticas e sorteios.
        </p>
      </div>
      <Button asChild>
        <Link href="/api/connect/instagram">
          <Instagram className="w-4 h-4 mr-2" /> Conectar Agora
        </Link>
      </Button>
    </div>
  );
}