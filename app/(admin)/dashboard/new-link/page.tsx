import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import CreateLinkForm from "./CreateLinkForm";

export default function NewLinkPage() {
  return (
    <div className="space-y-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <aside className="space-y-8 bg-purple-50 p-8 rounded-3xl border border-purple-200 shadow-sm">
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

        {/* Coluna do Formulário (Direita) */}
        <section className="bg-white p-10 rounded-3xl border border-gray-200 shadow-lg">
          <CreateLinkForm />
        </section>
      </div>
    </div>
  );
}