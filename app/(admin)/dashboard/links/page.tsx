import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

import { Eye, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import ManageLinks from "@/components/ManageLinks";

export default async function LinksPage() {
  const user = await currentUser();
  if (!user) return null;

  // Busca o slug do usuário para montar o link da página pública
  const userSlug = await fetchQuery(api.lib.usernames.getUserSlug, {
    userId: user.id,
  });

  return (
    <div className="space-y-8 sm:space-y-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Cabeçalho */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        {/* Título */}
        <div className="flex items-center gap-5">
          <div className="p-3 bg-purple-100 rounded-2xl flex-shrink-0 shadow-inner">
            <LayoutGrid className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
              Meus Links
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Arraste para reordenar sua página.
            </p>
          </div>
        </div>

        {/* Botão Página Pública */}
        {userSlug && (
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto flex-shrink-0 transition-colors duration-200 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
          >
            <Link
              href={`/u/${userSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 justify-center"
              aria-label="Ver Página Pública em nova aba"
            >
              <Eye className="w-5 h-5" /> Ver Página Pública
            </Link>
          </Button>
        )}
      </header>

      {/* Container de Gerenciamento */}
      <section className="bg-white p-6 sm:p-10 rounded-3xl border border-gray-200 shadow-lg">
        <ManageLinks />
      </section>

      {/* Dica */}
      <footer className="text-center text-sm text-gray-500 select-none">
        <p>
          ✨ <span className="font-semibold">Dica:</span> As alterações são salvas automaticamente.
        </p>
      </footer>
    </div>
  );
}