// Em app/dashboard/new-link/page.tsx
// (Substitua o arquivo inteiro)

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import CreateLinkForm from "./CreateLinkForm";

export default function NewLinkPage() {
  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="ghost" className="-ml-4 text-gray-600 hover:bg-gray-200/50">
          <Link href="/dashboard/links" className="inline-flex items-center gap-2 font-medium">
            <ArrowLeft className="w-4 h-4" />
            Voltar para Meus Links
          </Link>
        </Button>
      </div>

      <div className="grid gap-12 grid-cols-1 lg:grid-cols-[1fr_2fr]">
        {/* Coluna de Informações (Esquerda) */}
        <aside className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Adicionar Novo Link
            </h1>
            <p className="text-lg text-gray-600">
              Adicione um novo destino à sua página. Você poderá reordená-los e personalizá-los facilmente depois.
            </p>

            <ul className="space-y-4 border-l-2 border-purple-200 pl-6 text-gray-700">
              {/* Itens da lista de benefícios... */}
               <li><strong className="font-semibold text-gray-800">Pré-visualização ao vivo:</strong> Veja como seu link ficará antes de salvar.</li>
               <li><strong className="font-semibold text-gray-800">URLs Inteligentes:</strong> Adicionamos `https://` automaticamente para você.</li>
               <li><strong className="font-semibold text-gray-800">Links Ilimitados:</strong> Todos os planos incluem links ilimitados!</li>
            </ul>
        </aside>

        {/* Coluna do Formulário (Direita) */}
        <section className="bg-white p-8 sm:p-10 rounded-2xl border border-gray-200/80 shadow-lg">
          <CreateLinkForm />
        </section>
      </div>
    </div>
  );
}