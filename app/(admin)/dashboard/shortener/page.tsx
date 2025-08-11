// Em app/dashboard/shortener/page.tsx
// (Substitua o arquivo inteiro)

"use client";

import { useState, useRef } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import Link from "next/link";
import dynamic from 'next/dynamic'; // <-- IMPORTAÇÃO CHAVE

import {
  Link as LinkIcon, Scissors, Copy, Check, Info, Loader2, BarChart2, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@clerk/nextjs";

type LinkFromQuery = {
  id: string;
  url: string;
  clicks: number;
};

function LinksSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg border flex items-center gap-4 animate-pulse">
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
                        <div className="h-9 w-9 bg-gray-200 rounded-md"></div>
                        <div className="h-9 w-9 bg-gray-200 rounded-md"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function LinkList() {
  const { user, isLoaded } = useUser();
  const links = useQuery(api.shortLinks.getLinksForUser, !isLoaded ? "skip" : undefined) as LinkFromQuery[] | undefined;
  const plan = (user?.publicMetadata?.subscriptionPlan as "free" | "pro" | "ultra") ?? "free";
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const handleCopy = (slug: string) => {
    const shortUrl = `${window.location.origin}/r/${slug}`;
    navigator.clipboard.writeText(shortUrl);
    setCopiedSlug(slug);
    toast.success("Link copiado!");
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  if (!isLoaded || links === undefined) return <LinksSkeleton />;
  if (links.length === 0) return (
      <div className="text-center text-gray-500 py-10 px-4 border-2 border-dashed rounded-xl">
        <Info className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <h3 className="font-semibold text-gray-700">Nenhum link encurtado.</h3>
        <p className="text-sm">Use o formulário para criar seu primeiro link.</p>
      </div>
    );

  return (
    <div className="space-y-4">
      {links.map((link) => (
        <div key={link.id} className="bg-white p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-purple-600 truncate">freelinnk.com/r/{link.id}</p>
            <p className="text-sm text-gray-500 truncate mt-1">{link.url}</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {plan === "ultra" ? (
              <Button asChild variant="outline" size="icon" className="h-9 w-9">
                <Link href={`/dashboard/shortener/${link.id}`}>
                  <BarChart2 className="w-4 h-4 text-purple-600" />
                </Link>
              </Button>
            ) : (
              <div className="relative group">
                <Button variant="outline" size="icon" className="h-9 w-9" disabled><Lock className="w-4 h-4" /></Button>
                <span className="absolute bottom-full mb-2 ...">Ver Cliques (Plano Ultra)</span>
              </div>
            )}
            <span className="text-sm font-medium ...">{link.clicks} cliques</span>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleCopy(link.id)}>
              {copiedSlug === link.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// =======================================================
// CORREÇÃO DEFINITIVA PARA HIDRATAÇÃO
// =======================================================
// Carregamos a LinkList dinamicamente, garantindo que ela NUNCA seja renderizada no servidor.
const DynamicLinkList = dynamic(() => Promise.resolve(LinkList), {
  ssr: false,
  loading: () => <LinksSkeleton />,
});

export default function ShortenerPage() {
  const createLink = useAction(api.shortLinks.createShortLink);
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const originalUrl = formData.get("originalUrl") as string;
    const customSlug = (formData.get("customSlug") as string) || undefined;

    setIsLoading(true);
    toast.promise(
      createLink({ originalUrl, customSlug }),
      {
        loading: "Encurtando seu link...",
        success: () => { formRef.current?.reset(); return "Link encurtado com sucesso!"; },
        error: (err) => (err instanceof Error ? err.message : "Ocorreu um problema."),
        finally: () => setIsLoading(false),
      }
    );
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="p-3 bg-green-100 rounded-xl"><Scissors className="w-7 h-7 text-green-600" /></div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Encurtador de Links</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Crie links curtos e rastreáveis.</p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border">
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col md:grid md:grid-cols-[2fr_1fr] gap-4 items-end">
          <div className="w-full">
            <Label htmlFor="longUrl" className="font-semibold">URL de Destino</Label>
            <Input id="longUrl" name="originalUrl" type="url" placeholder="https://exemplo-de-link-muito-longo.com/produto" required className="py-6 mt-1 w-full" disabled={isLoading} />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full md:w-auto py-6 font-bold">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><LinkIcon className="w-4 h-4 mr-2" /> Encurtar Link</>}
          </Button>
        </form>

        <div className="mt-4">
          <Label htmlFor="customSlug" className="font-semibold text-sm">Apelido Personalizado (Opcional)</Label>
          <div className="flex flex-col sm:flex-row sm:items-center mt-1">
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-3 rounded-t-md ...">freelinnk.com/r/</span>
            <Input id="customSlug" name="customSlug" placeholder="minha-promo" className="rounded-t-none ..." disabled={isLoading} />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Seus Links Encurtados</h2>
        <DynamicLinkList />
      </div>
    </div>
  );
}