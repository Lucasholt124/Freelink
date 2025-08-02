import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import CreateLinkForm from "./CreateLinkForm"; // Supondo que o formulário esteja no mesmo diretório

// A página agora é um Server Component simples, sem lógica de acesso complexa.
export default function NewLinkPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navegação de volta */}
        <div>
          <Button asChild variant="ghost" className="text-gray-600 hover:text-gray-900">
            <Link href="/dashboard" className="inline-flex items-center gap-2 font-medium">
              <ArrowLeft className="w-4 h-4" />
              Voltar para o Dashboard
            </Link>
          </Button>
        </div>

        {/* Layout de duas colunas */}
        <div className="grid gap-12 grid-cols-1 md:grid-cols-[1fr_2fr] lg:grid-cols-[1fr_1.5fr]">

          {/* Coluna de Informações (Esquerda) */}
          <aside className="md:sticky md:top-24 h-fit bg-white p-8 rounded-2xl border border-gray-200/80 shadow-lg">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Criar Novo Link
            </h1>
            <p className="text-gray-600 leading-relaxed mb-6">
              Adicione um novo destino à sua página. Você poderá reordená-los facilmente depois.
            </p>

            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 mt-2 bg-blue-500 rounded-full shrink-0" />
                <div>
                  <h3 className="font-semibold">Pré-visualização ao vivo</h3>
                  <p className="text-sm text-gray-500">Veja como seu link ficará antes de salvar.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 mt-2 bg-purple-500 rounded-full shrink-0" />
                <div>
                  <h3 className="font-semibold">URLs Inteligentes</h3>
                  <p className="text-sm text-gray-500">Adicionamos `https://` automaticamente para você.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 mt-2 bg-green-500 rounded-full shrink-0" />
                <div>
                  <h3 className="font-semibold">Links Ilimitados</h3>
                  <p className="text-sm text-gray-500">Todos os planos agora incluem links ilimitados!</p>
                </div>
              </li>
            </ul>
          </aside>

          {/* Coluna do Formulário (Direita) */}
          <section className="bg-white p-8 rounded-2xl border border-gray-200/80 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Detalhes do Link
            </h2>
            <p className="text-sm text-gray-500 mb-8">
              Preencha o título e a URL de destino abaixo.
            </p>

            {/* O componente do formulário agora tem `showPreview` por padrão,
                então não precisamos mais passar a prop. Apenas certifique-se
                que o default no componente CreateLinkForm seja true. */}
            <CreateLinkForm />
          </section>
        </div>
      </div>
    </div>
  );
}

