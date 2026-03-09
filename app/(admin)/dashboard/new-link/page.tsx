"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, LogOut } from "lucide-react";
import CreateLinkForm from "./CreateLinkForm";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

// ID DO ADMIN MASTER (Mantendo a consistência)

export default function NewLinkPage() {
  const { user, isLoaded } = useUser();
  const [subAccount, setSubAccount] = useState<{subUserId: string, username: string} | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("freelinnk_active_subaccount");
    if (saved) {
      try { setSubAccount(JSON.parse(saved)); } catch  {}
    }
  }, []);

  const handleExitSubAccount = () => {
    localStorage.removeItem("freelinnk_active_subaccount");
    setSubAccount(null);
    window.location.reload();
  };

  if (!isLoaded || !mounted) return null;

  const effectiveUserId = subAccount?.subUserId || user?.id;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">

      {/* 🔥 BANNER FIXO DE SUB-CONTA 🔥 */}
      {subAccount && (
        <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between shadow-md relative z-50">
          <div className="flex items-center gap-2">
             <Sparkles className="w-4 h-4 text-indigo-300" />
             <span className="text-sm font-medium hidden sm:inline">
               Editando links da página: <strong className="bg-white/20 px-2 py-0.5 rounded-md tracking-wider">@{subAccount.username}</strong>
             </span>
             <span className="text-sm font-medium sm:hidden">
               Página: <strong className="bg-white/20 px-2 py-0.5 rounded-md">@{subAccount.username}</strong>
             </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExitSubAccount}
            className="h-8 text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-colors"
          >
             <LogOut className="w-3 h-3 sm:mr-2" />
             <span className="hidden sm:inline">Voltar para minha conta</span>
          </Button>
        </div>
      )}

      <div className="space-y-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Botão Voltar */}
        <div>
          <Button
            asChild
            variant="ghost"
            className="-ml-4 text-gray-600 hover:bg-gray-200/50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
            aria-label="Voltar para Meus Links"
          >
            <Link href="/dashboard/links" className="inline-flex items-center gap-2 font-medium">
              <ArrowLeft className="w-5 h-5" />
              Voltar para Meus Links
            </Link>
          </Button>
        </div>

        {/* Layout principal */}
        <div className="grid gap-14 grid-cols-1 lg:grid-cols-[1fr_2fr]">
          {/* Coluna de Informações (Esquerda) */}
          <aside className="space-y-8 bg-purple-50 p-8 rounded-3xl border border-purple-200 shadow-sm h-fit">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
              Adicionar Novo Link
            </h1>
            <p className="text-lg text-gray-700 max-w-md">
              Adicione um novo destino à sua página. Você poderá reordená-los e personalizá-los facilmente depois.
            </p>

            <ul className="space-y-5 border-l-4 border-purple-400 pl-6 text-gray-700 max-w-md">
              <li>
                <strong className="font-semibold text-gray-900">Pré-visualização ao vivo:</strong> Veja como seu link ficará antes de salvar.
              </li>
              <li>
                <strong className="font-semibold text-gray-900">URLs Inteligentes:</strong> Adicionamos <code>https://</code> automaticamente para você.
              </li>
              <li>
                <strong className="font-semibold text-gray-900">Links Ilimitados:</strong> Todos os planos incluem links ilimitados!
              </li>
            </ul>
          </aside>

          {/* Coluna do Formulário (Direita) - Passando o ID */}
          <section className="bg-white p-10 rounded-3xl border border-gray-200 shadow-lg">
            <CreateLinkForm effectiveUserId={effectiveUserId as string} />
          </section>
        </div>
      </div>
    </div>
  );
}