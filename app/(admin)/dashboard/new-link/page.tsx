import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import CreateLinkForm from "./CreateLinkForm";

async function NewLinkPage() {
  const { has } = await auth();
  const hasPro = has({ feature: "pro_capacity" });
  const hasUltra = has({ feature: "ultra_capacity" });

  const user = await currentUser();

  // Substitua abaixo com seu ID real do Clerk:
  const IS_ADMIN = user?.id === "user_301NTkVsE3v48SXkoCEp0XOXifI"; // 🔁 substitua "user_123abc" pelo seu ID

  const linkCount = await fetchQuery(api.lib.links.getLinkCountByUserId, {
    userId: user?.id || "",
  });

  const access = {
    canCreate: IS_ADMIN
      ? true
      : hasUltra
        ? true
        : hasPro
          ? linkCount < 10
          : linkCount < 3,
    limit: IS_ADMIN ? "∞" : hasUltra ? "∞" : hasPro ? 10 : 3,
    currentCount: linkCount,
  };

  if (!access.canCreate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-100 to-neutral-200 p-6 flex items-center justify-center">
        <div className="max-w-lg w-full">
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Limite de links atingido
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Você já criou {access.currentCount} de {access.limit} links permitidos no seu plano atual.
              {!hasUltra && !IS_ADMIN && " Atualize seu plano para criar links ilimitados."}
            </p>

            <div className="flex justify-center gap-6">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-indigo-600 hover:underline font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </Link>

              {!hasUltra && !IS_ADMIN && (
                <Link
                  href="/dashboard/billing"
                  className="bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700 transition font-semibold"
                >
                  Atualizar Plano
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-10">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-indigo-600 hover:underline font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar aos meus links
          </Link>
        </div>

        <div
          className="
            grid
            gap-12
            grid-cols-1
            md:grid-cols-[minmax(280px,350px)_1fr]
          "
        >
          <section
            className="
              relative
              md:sticky md:top-20
              p-6 bg-white rounded-xl border border-gray-200 shadow-md
              text-gray-900
            "
          >
            <h1 className="text-4xl font-extrabold leading-tight mb-4">
              Criar novo link
            </h1>
            <p className="text-gray-600 text-lg max-w-xs leading-relaxed mb-8">
              Adicione um novo link à sua página. Você poderá reordená-los facilmente depois e conferir a pré-visualização em tempo real.
            </p>

            <ul className="space-y-5 text-gray-700 text-base">
              <li className="flex items-center gap-3">
                <span className="w-3 h-3 bg-blue-500 rounded-full shrink-0" />
                Reordenação simples por arrastar e soltar
              </li>
              <li className="flex items-center gap-3">
                <span className="w-3 h-3 bg-purple-600 rounded-full shrink-0" />
                Validação automática e segura de URLs
              </li>
              <li className="flex items-center gap-3">
                <span className="w-3 h-3 bg-green-500 rounded-full shrink-0" />
                Análise de cliques exclusiva para planos Pro e Ultra
              </li>
              <li className="flex items-center gap-3">
                <span className="w-3 h-3 bg-yellow-400 rounded-full shrink-0" />
                Pré-visualização ao vivo do link durante a criação
              </li>
            </ul>
          </section>

          <section className="bg-white border border-gray-200 rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Detalhes do link
            </h2>
            <p className="text-sm text-gray-500 mb-8">
              Preencha os campos abaixo para criar seu link.
            </p>

            <CreateLinkForm showPreview />
          </section>
        </div>
      </div>
    </div>
  );
}

export default NewLinkPage;
