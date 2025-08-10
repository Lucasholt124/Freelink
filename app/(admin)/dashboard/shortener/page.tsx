// app/dashboard/shortener/page.tsx

"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import {
  Link as LinkIcon,
  Scissors,
  Copy,
  Check,
  Info,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LinkList() {
  const links = useQuery(api.shortLinks.getLinksForUser);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const handleCopy = (slug: string) => {
    const shortUrl = `${window.location.origin}/r/${slug}`;
    navigator.clipboard.writeText(shortUrl);
    setCopiedSlug(slug);
    toast.success("Link copiado!");
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  if (links === undefined) {
    return (
      <div className="text-center py-10 text-gray-500">
        Carregando seus links...
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10 px-4 border-2 border-dashed border-gray-300 rounded-xl">
        <Info className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <h3 className="font-semibold text-gray-700">
          Nenhum link encurtado ainda.
        </h3>
        <p className="text-sm">
          Use o formulário acima para criar seu primeiro link curto.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {links.map((link) => (
        <div
          key={link._id}
          className="bg-white p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-shadow hover:shadow-md"
        >
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-purple-600 truncate">
              freelinnk.com/r/{link.slug}
            </p>
            <p className="text-sm text-gray-500 truncate mt-1">
              {link.originalUrl}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap bg-gray-100 px-3 py-1 rounded-full">
              {link.clicks} cliques
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(link.slug)}
            >
              {copiedSlug === link.slug ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ShortenerPage() {
  const createLink = useMutation(api.shortLinks.createShortLink);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const originalUrl = formData.get("originalUrl") as string;
    const customSlug = formData.get("customSlug") as string;

    try {
      await createLink({
        originalUrl,
        customSlug: customSlug || undefined,
      });
      toast.success("Link encurtado com sucesso!");
      event.currentTarget.reset();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Ocorreu um problema.";
      toast.error("Erro ao criar link", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-10">
      {/* Título */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="p-3 bg-green-100 rounded-xl">
          <Scissors className="w-7 h-7 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Encurtador de Links
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Crie links curtos e rastreáveis para usar em qualquer lugar.
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:grid md:grid-cols-[2fr_1fr] gap-4 items-end"
        >
          <div className="w-full">
            <Label htmlFor="longUrl" className="font-semibold">
              URL de Destino
            </Label>
            <Input
              id="longUrl"
              name="originalUrl"
              type="url"
              placeholder="https://exemplo-de-link-muito-longo.com/produto"
              required
              className="py-6 mt-1 w-full"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto py-6 font-bold"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <LinkIcon className="w-4 h-4 mr-2" /> Encurtar Link
              </>
            )}
          </Button>
        </form>

        {/* Campo slug personalizado */}
        <div className="mt-4">
          <Label htmlFor="customSlug" className="font-semibold text-sm">
            Apelido Personalizado (Opcional)
          </Label>
          <div className="flex flex-col sm:flex-row sm:items-center mt-1">
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-3 rounded-t-md sm:rounded-l-md sm:rounded-tr-none border border-gray-300 border-b-0 sm:border-b sm:border-r-0">
              freelinnk.com/r/
            </span>
            <Input
              id="customSlug"
              name="customSlug"
              placeholder="minha-promo"
              className="rounded-t-none sm:rounded-l-none sm:rounded-r-md"
            />
          </div>
        </div>
      </div>

      {/* Lista de links */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Seus Links</h2>
        <LinkList />
      </div>
    </div>
  );
}
