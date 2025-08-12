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

  const userSlug = await fetchQuery(api.lib.usernames.getUserSlug, {
    userId: user.id,
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 min-h-full flex flex-col">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Título */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-xl flex-shrink-0">
            <LayoutGrid className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Meus Links</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Arraste para reordenar sua página.</p>
          </div>
        </div>

        {/* Botão Página Pública */}
        {userSlug && (
          <Button asChild variant="outline" className="w-full sm:w-auto flex-shrink-0">
            <Link
              href={`/u/${userSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 justify-center"
            >
              <Eye className="w-4 h-4" /> Ver Página Pública
            </Link>
          </Button>
        )}
      </div>

      {/* Container principal */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl border border-gray-200 shadow-lg flex-grow min-h-0 overflow-auto">
        <ManageLinks />
      </div>

      {/* Dica */}
      <div className="text-center text-sm text-gray-500">
        <p>
          ✨ <span className="font-medium">Dica:</span> As alterações são salvas automaticamente.
        </p>
      </div>
    </div>
  );
}
