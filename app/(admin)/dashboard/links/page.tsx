import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

import { Eye, LayoutGrid, Sparkles, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ManageLinks from "@/components/ManageLinks";

export default async function LinksPage() {
  const user = await currentUser();
  if (!user) return null;

  const userSlug = await fetchQuery(api.lib.usernames.getUserSlug, {
    userId: user.id,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      {/* Background decorativo */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="relative px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">

          {/* Cabeçalho aprimorado */}
          <header className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-white/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">

                {/* Título com ícone */}
                <div className="flex items-start sm:items-center gap-4">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                    <div className="relative p-3.5 sm:p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                      <LayoutGrid className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                        Meus Links
                      </h1>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-semibold rounded-full">
                        <Sparkles className="w-3 h-3" />
                        PREMIUM
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1.5 text-sm sm:text-base font-medium">
                      Arraste para reordenar sua página
                    </p>
                  </div>
                </div>

                {/* Botão Página Pública melhorado */}
                {userSlug && (
                  <Button
                    asChild
                    className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 h-12 sm:h-11 px-6 rounded-xl font-semibold"
                  >
                    <Link
                      href={`/u/${userSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 justify-center"
                      aria-label="Ver Página Pública em nova aba"
                    >
                      <Eye className="w-5 h-5 transition-transform group-hover:scale-110" />
                      <span className="hidden sm:inline">Ver Página Pública</span>
                      <span className="sm:hidden">Ver Página</span>
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </header>

          {/* Container de Gerenciamento aprimorado */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
              {/* Header decorativo do card */}
              <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />

              <div className="p-4 sm:p-8 lg:p-10">
                <ManageLinks />
              </div>
            </div>
          </section>

          {/* Footer com dica aprimorado */}
          <footer className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <div className="bg-gradient-to-r from-purple-100/80 via-pink-100/80 to-purple-100/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-purple-200/50 shadow-md">
              <div className="flex items-center justify-center gap-3 text-center">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
                    <div className="absolute inset-0 w-6 h-6 bg-purple-400 blur-xl opacity-40" />
                  </div>
                </div>
                <p className="text-sm sm:text-base text-gray-700 font-medium">
                  <span className="font-bold text-purple-700">Dica:</span> As alterações são salvas automaticamente em tempo real
                </p>
              </div>
            </div>
          </footer>

        </div>
      </div>
    </div>
  );
}