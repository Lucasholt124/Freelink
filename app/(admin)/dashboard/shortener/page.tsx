"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Link as LinkIcon,
  Scissors,
  Copy,
  Check,
  Info,
  Loader2,
  BarChart2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@clerk/nextjs";

type LinkFromAPI = {
  id: string;
  url: string;
  clicks: number;
  title: string | null;
  createdAt: number;
};

function LinksSkeleton() {
  return (
    <div className="space-y-5 mt-6">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-5 animate-pulse"
        >
          <div className="flex-1 space-y-3 min-w-0">
            <div className="h-5 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="h-10 w-24 bg-gray-200 rounded-full"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-md"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LinkList({
  links,
  isLoading,
}: {
  links: LinkFromAPI[] | undefined;
  isLoading: boolean;
}) {
  const { user } = useUser();
  const isAdmin = user?.id === "user_301NTkVsE3v48SXkoCEp0XOXifI";
  const userPlan = (user?.publicMetadata?.subscriptionPlan as
    | "free"
    | "pro"
    | "ultra") ?? "free";
  const plan = isAdmin ? "ultra" : userPlan;
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const handleCopy = (slug: string) => {
    const shortUrl = `${window.location.origin}/r/${slug}`;
    navigator.clipboard.writeText(shortUrl);
    setCopiedSlug(slug);
    toast.success("Link copiado!");
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  if (isLoading) return <LinksSkeleton />;
  if (!links || links.length === 0)
    return (
      <div className="text-center text-gray-500 py-12 px-6 mt-6 border-2 border-dashed rounded-2xl bg-gray-50">
        <Info className="w-10 h-10 mx-auto text-gray-400 mb-3" />
        <h3 className="font-semibold text-gray-700 text-lg">
          Nenhum link encurtado.
        </h3>
        <p className="text-sm mt-1">
          Use o formulário acima para criar seu primeiro link.
        </p>
      </div>
    );

  return (
    <div className="space-y-5 mt-6">
      {links.map((link) => (
        <div
          key={link.id}
          className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-purple-700 truncate break-all text-lg">
              freelinnk.com/r/{link.id}
            </p>
            <p className="text-sm text-gray-500 truncate break-all mt-1">
              {link.url}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap sm:flex-nowrap">
            {plan === "ultra" ? (
              <Button
                asChild
                variant="outline"
                size="icon"
                className="h-10 w-10 flex-shrink-0"
                aria-label={`Ver estatísticas do link ${link.id}`}
              >
                <Link href={`/dashboard/shortener/${link.id}`}>
                  <BarChart2 className="w-5 h-5 text-purple-700" />
                </Link>
              </Button>
            ) : (
              <div className="relative group flex-shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 cursor-not-allowed"
                  disabled
                  aria-label="Ver cliques (Plano Ultra)"
                >
                  <Lock className="w-5 h-5" />
                </Button>
                <span className="absolute bottom-full mb-2 -translate-x-1/2 left-1/2 w-max max-w-[160px] px-3 py-1 text-xs bg-gray-900 text-white rounded-md opacity-0 group-hover:opacity-100 text-center break-words shadow-lg transition-opacity duration-200 pointer-events-none select-none">
                  Ver Cliques (Plano Ultra)
                </span>
              </div>
            )}
            <span className="text-sm font-medium text-gray-700 bg-gray-100 px-4 py-1 rounded-full whitespace-nowrap select-text">
              {link.clicks} clique{link.clicks !== 1 ? "s" : ""}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 flex-shrink-0"
              onClick={() => handleCopy(link.id)}
              aria-label={`Copiar link freelinnk.com/r/${link.id}`}
            >
              {copiedSlug === link.id ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ShortenerPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [links, setLinks] = useState<LinkFromAPI[] | undefined>(undefined);

  const fetchLinks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/shortener");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao buscar links");
      setLinks(data);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar seus links."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const originalUrl = formData.get("originalUrl") as string;
    const customSlug = (formData.get("customSlug") as string) || undefined;

    try {
      const response = await fetch("/api/shortener", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalUrl, customSlug }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro desconhecido");
      toast.success("Link encurtado com sucesso!");
      formRef.current?.reset();
      fetchLinks();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ocorreu um problema.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="flex items-center gap-5">
        <div className="p-4 bg-green-100 rounded-2xl shadow-inner">
          <Scissors className="w-9 h-9 text-green-600" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">
            Encurtador de Links
          </h1>
          <p className="text-gray-600 mt-1 text-lg">
            Crie links curtos e rastreáveis.
          </p>
        </div>
      </header>

      <section className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-6 max-w-3xl mx-auto"
          noValidate
        >
          <div>
            <Label
              htmlFor="longUrl"
              className="font-semibold text-gray-800 text-base"
            >
              URL de Destino
            </Label>
            <Input
              id="longUrl"
              name="originalUrl"
              type="url"
              placeholder="https://exemplo-de-link-muito-longo.com/produto"
              required
              className="py-5 mt-2 text-lg"
              disabled={isLoading}
              autoComplete="off"
            />
          </div>

          <div>
            <Label
              htmlFor="customSlug"
              className="font-semibold text-gray-700 text-sm"
            >
              Apelido Personalizado (Opcional)
            </Label>
            <div className="mt-2 flex flex-col sm:flex-row items-stretch max-w-md">
              <span className="flex items-center justify-center text-sm text-gray-500 bg-gray-100 px-4 py-3 rounded-t-md sm:rounded-l-md sm:rounded-tr-none border border-b-0 sm:border-b sm:border-r-0 select-text">
                freelinnk.com/r/
              </span>
              <Input
                id="customSlug"
                name="customSlug"
                placeholder="minha-promo"
                className="rounded-t-none sm:rounded-l-none sm:rounded-r-md text-center sm:text-left text-lg"
                disabled={isLoading}
                autoComplete="off"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto py-4 text-lg font-bold flex items-center justify-center gap-2"
            aria-live="polite"
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5 text-white" />
            ) : (
              <>
                <LinkIcon className="w-5 h-5" /> Encurtar Link
              </>
            )}
          </Button>
        </form>
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-6 text-gray-900">
          Seus Links Encurtados
        </h2>
        <LinkList links={links} isLoading={isLoading} />
      </section>
    </div>
  );
}