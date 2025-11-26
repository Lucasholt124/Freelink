import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

import { Eye, LayoutGrid, Sparkles, ArrowUpRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import ManageLinks from "@/components/ManageLinks";

export default async function LinksPage() {
  const user = await currentUser();
  if (!user) return null;

  const userSlug = await fetchQuery(api.lib.usernames.getUserSlug, {
    userId: user.id,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/40">
      {/* Background decorativo otimizado */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 sm:w-80 sm:h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 sm:w-80 sm:h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" />

        {/* Grid pattern sutil */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Cabeçalho - Mobile First */}
          <header className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/70 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg shadow-purple-500/5 border border-white/60 ring-1 ring-black/[0.02]">
              {/* Mobile Layout */}
              <div className="flex flex-col gap-4 sm:hidden">
                {/* Top row - Icon + Title */}
                <div className="flex items-center gap-3">
                  <div className="relative group flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl blur-md opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
                    <div className="relative p-2.5 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg">
                      <LayoutGrid className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-black bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent truncate">
                        Meus Links
                      </h1>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold rounded-full shadow-sm flex-shrink-0">
                        <Sparkles className="w-2.5 h-2.5" />
                        PRO
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs font-medium mt-0.5">
                      Arraste para reordenar
                    </p>
                  </div>
                </div>

                {/* Button - Full width on mobile */}
                {userSlug && (
                  <Button
                    asChild
                    className="w-full group relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-600 to-pink-600 hover:from-purple-700 hover:via-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 active:scale-[0.98] transition-all duration-200 h-11 px-5 rounded-xl font-semibold text-sm"
                  >
                    <Link
                      href={`/u/${userSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 justify-center"
                      aria-label="Ver Página Pública em nova aba"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Minha Página Pública</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </Button>
                )}
              </div>

              {/* Desktop/Tablet Layout */}
              <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-between gap-4 lg:gap-6">
                {/* Left side - Icon + Text */}
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
                    <div className="relative p-3.5 lg:p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                      <LayoutGrid className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5">
                      <h1 className="text-2xl lg:text-3xl xl:text-4xl font-black bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                        Meus Links
                      </h1>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-md">
                        <Sparkles className="w-3 h-3" />
                        PREMIUM
                      </span>
                    </div>
                    <p className="text-gray-500 mt-1 text-sm lg:text-base font-medium">
                      Arraste para reordenar sua página
                    </p>
                  </div>
                </div>

                {/* Right side - Button */}
                {userSlug && (
                  <Button
                    asChild
                    className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-600 to-pink-600 hover:from-purple-700 hover:via-purple-700 hover:to-pink-700 text-white border-0 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 h-11 lg:h-12 px-5 lg:px-6 rounded-xl font-semibold"
                  >
                    <Link
                      href={`/u/${userSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 justify-center"
                      aria-label="Ver Página Pública em nova aba"
                    >
                      <Eye className="w-4.5 h-4.5 lg:w-5 lg:h-5 transition-transform group-hover:scale-110" />
                      <span>Ver Página Pública</span>
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </header>

          {/* Container de Gerenciamento */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            <div className="bg-white/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-xl shadow-purple-500/5 border border-white/60 ring-1 ring-black/[0.02] overflow-hidden">
              {/* Header decorativo com gradiente */}
              <div className="h-1 sm:h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />

              <div className="p-4 sm:p-6 lg:p-8">
                <ManageLinks />
              </div>
            </div>
          </section>

          {/* Footer com dica - Compacto no mobile */}
          <footer className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-purple-100/80 shadow-sm">
              <div className="flex items-center justify-center gap-2 sm:gap-3 text-center">
                <div className="flex-shrink-0">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  <span className="font-bold text-purple-700">Dica:</span>{" "}
                  <span className="hidden sm:inline">
                    As alterações são salvas automaticamente em tempo real
                  </span>
                  <span className="sm:hidden">Salvo automaticamente</span>
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}