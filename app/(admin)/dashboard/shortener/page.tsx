// Em /app/dashboard/shortener/page.tsx
// (Substitua o arquivo inteiro)

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Link as LinkIcon, Scissors, Copy, Check, Info, Loader2, BarChart2, Lock, Globe, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@clerk/nextjs";
import clsx from "clsx";

// --- Tipos ---
type LinkFromAPI = {
  id: string;
  url: string;
  clicks: number;
  title: string | null;
  createdAt: number;
};
type AnalyticsData = {
  totalClicks: number;
  uniqueVisitors: number;
  topCountry: { name: string; clicks: number; };
};

// --- Componentes Filhos ---

function LinksSkeleton() {
    return (
        <div className="space-y-4 mt-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg border flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
                    <div className="flex-1 space-y-2 min-w-0"><div className="h-4 bg-gray-200 rounded w-3/4"></div><div className="h-3 bg-gray-200 rounded w-1/2"></div></div>
                    <div className="flex items-center gap-2 flex-shrink-0"><div className="h-8 w-20 bg-gray-200 rounded-full"></div><div className="h-9 w-9 bg-gray-200 rounded-md"></div></div>
                </div>
            ))}
        </div>
    );
}

function LinkList({ links, isLoading }: { links: LinkFromAPI[] | undefined; isLoading: boolean }) {
  const { user } = useUser();
  const isAdmin = user?.id === "user_301NTkVsE3v48SXkoCEp0XOXifI";
  const userPlan = (user?.publicMetadata?.subscriptionPlan as "free" | "pro" | "ultra") ?? "free";
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
  if (!links || links.length === 0) return (
      <div className="text-center text-gray-500 py-10 px-4 mt-4 border-2 border-dashed rounded-xl">
        <Info className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <h3 className="font-semibold text-gray-700">Nenhum link encurtado.</h3>
        <p className="text-sm">Use o formulário acima para criar seu primeiro link.</p>
      </div>
    );

  return (
    <div className="space-y-4 mt-4">
      {links.map((link) => (
        <div key={link.id} className="bg-white p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 overflow-hidden">
          <div className="flex-1 min-w-0"><p className="font-semibold text-purple-600 truncate break-all">freelinnk.com/r/{link.id}</p><p className="text-sm text-gray-500 truncate break-all mt-1">{link.url}</p></div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap sm:flex-nowrap">
            {plan === "ultra" ? (
              <Button asChild variant="outline" size="icon" className="h-9 w-9 flex-shrink-0"><Link href={`/dashboard/shortener/${link.id}`}><BarChart2 className="w-4 h-4 text-purple-600" /></Link></Button>
            ) : (
              <div className="relative group flex-shrink-0"><Button variant="outline" size="icon" className="h-9 w-9" disabled><Lock className="w-4 h-4" /></Button><span className="absolute bottom-full mb-2 -translate-x-1/2 left-1/2 w-max max-w-[150px] px-2 py-1 text-xs bg-gray-800 text-white rounded-md opacity-0 group-hover:opacity-100 text-center break-words">Ver Cliques (Plano Ultra)</span></div>
            )}
            <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">{link.clicks} cliques</span>
            <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0" onClick={() => handleCopy(link.id)}>{copiedSlug === link.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}</Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsMetrics() {
    const { user, isLoaded } = useUser();
    const [data, setData] = useState<AnalyticsData | undefined>(undefined);

    useEffect(() => {
        if (isLoaded) {
            fetch('/api/analytics')
                .then(res => res.json())
                .then(setData)
                .catch(err => {
                    console.error("Falha ao buscar analytics:", err);
                    toast.error("Não foi possível carregar as análises.");
                });
        }
    }, [isLoaded]);

    const isAdmin = user?.id === "user_301NTkVsE3v48SXkoCEp0XOXifI";
    const userPlan = (user?.publicMetadata?.subscriptionPlan as string) ?? "free";
    const plan = isAdmin ? "ultra" : userPlan;

    const Card = ({ title, value, color,  }: { title: string; value: string | number; color: string; icon: React.ElementType }) => (
        <div className={clsx("bg-white p-4 rounded-lg border-l-4", `border-${color}-500`, `shadow-sm`)}>
            <div className="flex items-center gap-3">
                <div><p className="text-sm text-gray-500">{title}</p><p className="text-2xl font-bold">{value}</p></div>
            </div>
        </div>
    );
    const LockedCard = ({ title, requiredPlan }: { title: string; requiredPlan: string }) => (
        <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center h-full">
            <Lock className="w-5 h-5 text-gray-400 mb-2" /><p className="text-sm font-semibold">{title}</p><p className="text-xs text-gray-500">Plano {requiredPlan}</p>
            <Button asChild size="sm" variant="link" className="h-auto p-0 mt-1 text-xs"><Link href="/dashboard/billing">Fazer Upgrade</Link></Button>
        </div>
    );

    if (!isLoaded || data === undefined) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
                <div className="h-24 bg-gray-200 rounded-lg"></div><div className="h-24 bg-gray-200 rounded-lg"></div><div className="h-24 bg-gray-200 rounded-lg"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card color="blue" title="Total de Cliques" icon={BarChart2} value={data.totalClicks} />
            {plan === 'pro' || plan === 'ultra' ? (
                <Card color="purple" title="Visitantes Únicos" icon={Users} value={data.uniqueVisitors} />
            ) : (<LockedCard title="Visitantes Únicos" requiredPlan="Pro" />)}
            {plan === 'ultra' ? (
                <Card color="green" title="Principal País" icon={Globe} value={data.topCountry.name} />
            ) : (<LockedCard title="Principal País" requiredPlan="Ultra" />)}
        </div>
    );
}

export default function ShortenerPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [formIsLoading, setFormIsLoading] = useState(false);
  const [links, setLinks] = useState<LinkFromAPI[] | undefined>(undefined);
  const [listIsLoading, setListIsLoading] = useState(true);

  const fetchLinks = useCallback(async () => {
    setListIsLoading(true);
    try {
      const response = await fetch('/api/shortener');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao buscar links");
      setLinks(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível carregar seus links.");
    } finally {
      setListIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const originalUrl = formData.get("originalUrl") as string;
    const customSlug = (formData.get("customSlug") as string) || undefined;

    try {
      const response = await fetch('/api/shortener', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      setFormIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-green-100 rounded-xl"><Scissors className="w-7 h-7 text-green-600" /></div>
        <div><h1 className="text-3xl font-bold">Encurtador de Links</h1><p className="text-gray-600 mt-1">Crie links curtos e rastreáveis.</p></div>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Análises Gerais do Encurtador</h2>
        <AnalyticsMetrics />
      </section>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div><Label htmlFor="longUrl" className="font-semibold">URL de Destino</Label><Input id="longUrl" name="originalUrl" type="url" placeholder="https://exemplo-de-link-muito-longo.com/produto" required className="py-6 mt-1" disabled={formIsLoading} /></div>
          <div><Label htmlFor="customSlug" className="font-semibold text-sm">Apelido Personalizado (Opcional)</Label><div className="mt-1 flex flex-col sm:flex-row items-stretch"><span className="flex items-center justify-center text-sm text-gray-500 bg-gray-100 px-3 py-2.5 rounded-t-md sm:rounded-l-md sm:rounded-tr-none border border-b-0 sm:border-b sm:border-r-0">freelinnk.com/r/</span><Input id="customSlug" name="customSlug" placeholder="minha-promo" className="rounded-t-none sm:rounded-l-none sm:rounded-r-md text-center sm:text-left" disabled={formIsLoading} /></div></div>
          <Button type="submit" disabled={formIsLoading} className="w-full sm:w-auto py-3 font-bold">{formIsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><LinkIcon className="w-4 h-4 mr-2" /> Encurtar Link</>}</Button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Seus Links Encurtados</h2>
        <LinkList links={links} isLoading={listIsLoading} />
      </div>
    </div>
  );
}