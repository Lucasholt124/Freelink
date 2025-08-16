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
  Share2,
  ExternalLink,
  QrCode,
  ClipboardCheck,
  Clock,
  X,
  ChevronRight,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@clerk/nextjs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import confetti from 'canvas-confetti';

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
          className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-5 animate-pulse"
        >
          <div className="flex-1 space-y-3 min-w-0">
            <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="h-10 w-24 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
            <div className="h-10 w-10 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
            <div className="h-10 w-10 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function QRCodePopover({ url }: { url: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 flex-shrink-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        >
          <QrCode className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-medium">QR Code</h3>
            <p className="text-xs text-muted-foreground">Escaneie para acessar o link</p>
          </div>
          <div className="bg-white p-2 rounded-lg border border-gray-200 inline-block">
            <img
  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`}
  alt="QR Code"
  width={150}
  height={150}
  className="rounded-md"
/>
          </div>
          <div className="flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                const canvas = document.createElement('canvas');
                const img = document.createElement('img');
                img.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
                img.onload = () => {
                  canvas.width = img.width;
                  canvas.height = img.height;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob((blob) => {
                      if (blob) {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'qrcode.png';
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success("QR Code baixado!");
                      }
                    });
                  }
                };
              }}
            >
              Baixar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                navigator.clipboard.writeText(url);
                toast.success("Link copiado!");
              }}
            >
              Copiar Link
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SharePopover({ url }: { url: string }) {
  const socialNetworks = [
    { name: "WhatsApp", url: `https://wa.me/?text=${encodeURIComponent(url)}`, color: "bg-green-500" },
    { name: "Twitter", url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, color: "bg-blue-400" },
    { name: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, color: "bg-blue-600" },
    { name: "LinkedIn", url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, color: "bg-blue-700" },
    { name: "Telegram", url: `https://t.me/share/url?url=${encodeURIComponent(url)}`, color: "bg-blue-500" },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 flex-shrink-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        >
          <Share2 className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <div className="grid gap-1">
          {socialNetworks.map((network) => (
            <Button
              key={network.name}
              variant="ghost"
              size="sm"
              className="justify-start text-sm"
              onClick={() => {
                window.open(network.url, '_blank', 'noopener,noreferrer');
                toast.success(`Compartilhado no ${network.name}!`);
              }}
            >
              <div className={`w-4 h-4 rounded-full mr-2 ${network.color}`}></div>
              {network.name}
            </Button>
          ))}
          <hr className="my-1" />
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-sm"
            onClick={() => {
              navigator.clipboard.writeText(url);
              toast.success("Link copiado!");
            }}
          >
            <ClipboardCheck className="w-4 h-4 mr-2 text-gray-500" />
            Copiar Link
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function LinkCard({ link, copiedSlug, handleCopy, plan, onDeleteLink }: { link: LinkFromAPI; copiedSlug: string | null; handleCopy: (slug: string) => void; plan: string; onDeleteLink: (id: string) => void; }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const linkUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/r/${link.id}`;
  const formattedDate = new Date(link.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });

  const timeAgo = () => {
    const seconds = Math.floor((new Date().getTime() - link.createdAt) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} ano${Math.floor(interval) !== 1 ? 's' : ''}`;

    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} mês${Math.floor(interval) !== 1 ? 'es' : ''}`;

    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} dia${Math.floor(interval) !== 1 ? 's' : ''}`;

    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} hora${Math.floor(interval) !== 1 ? 's' : ''}`;

    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} minuto${Math.floor(interval) !== 1 ? 's' : ''}`;

    return `${Math.floor(seconds)} segundo${Math.floor(seconds) !== 1 ? 's' : ''}`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 flex flex-col gap-4 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-purple-700 dark:text-purple-400 text-lg truncate break-all">
              freelinnk.com/r/{link.id}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {link.clicks} {link.clicks === 1 ? 'clique' : 'cliques'}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate break-all mt-1">
            {link.url}
          </p>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Excluir link</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {showDeleteConfirm ? (
        <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg mt-1">
          <p className="text-sm text-red-600 dark:text-red-400">Confirmar exclusão?</p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                onDeleteLink(link.id);
                setShowDeleteConfirm(false);
              }}
            >
              Excluir
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Criado há {timeAgo()}</span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span>{formattedDate}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/30 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              onClick={() => handleCopy(link.id)}
            >
              {copiedSlug === link.id ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span>Copiar</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-2"
              onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
            >
              <ExternalLink className="w-4 h-4" />
              <span>Visitar</span>
            </Button>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
            <div className="flex items-center gap-2">
              {plan === "ultra" ? (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-9 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  <Link href={`/dashboard/shortener/${link.id}`}>
                    <BarChart2 className="w-4 h-4 mr-1.5" />
                    Estatísticas
                  </Link>
                </Button>
              ) : (
                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 cursor-not-allowed opacity-70"
                    disabled
                  >
                    <Lock className="w-4 h-4 mr-1.5" />
                    Estatísticas
                  </Button>
                  <span className="absolute bottom-full mb-2 left-0 w-max max-w-[160px] px-3 py-1 text-xs bg-gray-900 text-white rounded-md opacity-0 group-hover:opacity-100 text-center shadow-lg transition-opacity duration-200 pointer-events-none">
                    Disponível no Plano Ultra
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <QRCodePopover url={linkUrl} />
              <SharePopover url={linkUrl} />
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

function LinkList({
  links,
  isLoading,
  onDeleteLink
}: {
  links: LinkFromAPI[] | undefined;
  isLoading: boolean;
  onDeleteLink: (id: string) => void;
}) {
  const { user } = useUser();
  const isAdmin = user?.id === "user_301NTkVsE3v48SXkoCEp0XOXifI";
  const userPlan = (user?.publicMetadata?.subscriptionPlan as "free" | "pro" | "ultra") ?? "free";
  const plan = isAdmin ? "ultra" : userPlan;
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState("all");

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
      <div className="text-center text-gray-500 py-12 px-6 mt-6 border-2 border-dashed rounded-2xl bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
        <Info className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-lg">
          Nenhum link encurtado
        </h3>
        <p className="text-sm mt-1">
          Use o formulário acima para criar seu primeiro link
        </p>
      </div>
    );

  // Filter links based on tab
  const filteredLinks = links.filter(link => {
    if (filterTab === "all") return true;
    if (filterTab === "recent") return (Date.now() - link.createdAt) < 604800000; // 7 days
    if (filterTab === "popular") return link.clicks > 10;
    return true;
  });

  // Sort links based on tab
  const sortedLinks = [...filteredLinks].sort((a, b) => {
    if (filterTab === "recent") return b.createdAt - a.createdAt;
    if (filterTab === "popular") return b.clicks - a.clicks;
    return b.createdAt - a.createdAt; // Default sort by most recent
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tabs
          defaultValue="all"
          value={filterTab}
          onValueChange={setFilterTab}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="recent">Recentes</TabsTrigger>
            <TabsTrigger value="popular">Populares</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <AnimatePresence>
        <div className="space-y-4">
          {sortedLinks.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              copiedSlug={copiedSlug}
              handleCopy={handleCopy}
              plan={plan}
              onDeleteLink={onDeleteLink}
            />
          ))}
        </div>
      </AnimatePresence>

      {filterTab !== "all" && sortedLinks.length === 0 && (
        <div className="text-center py-8 px-4">
          <p className="text-gray-500 dark:text-gray-400">
            Nenhum link encontrado nesta categoria
          </p>
        </div>
      )}
    </div>
  );
}

function LinkPreview({ originalUrl, customSlug }: { originalUrl: string; customSlug: string }) {
  const [domainInfo, setDomainInfo] = useState<{ favicon?: string; title?: string }>({});
  const slug = customSlug || "link-aleatorio";

  useEffect(() => {
    if (!originalUrl) return;

    try {
      const url = new URL(originalUrl);
      const domain = url.hostname;

      // Simular a obtenção de informações do domínio
      // Em produção, você pode usar uma API para isso
      setDomainInfo({
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
        title: domain.replace(/^www\./, '')
      });
    } catch {
      // URL inválida, não faz nada
    }
  }, [originalUrl]);

  if (!originalUrl) return null;

  return (
    <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
          {domainInfo.favicon ? (
            <img src={domainInfo.favicon} alt="" className="w-6 h-6" />
          ) : (
            <Globe className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100">Pré-visualização</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Seu link ficará assim
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 flex flex-col gap-2">
        <div className="flex items-center">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-md mr-3">
            <LinkIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="font-medium text-purple-700 dark:text-purple-400">
            freelinnk.com/r/{slug}
          </p>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400 pl-10 truncate">
          Direciona para: {originalUrl}
        </div>
      </div>
    </div>
  );
}

export default function ShortenerPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [links, setLinks] = useState<LinkFromAPI[] | undefined>(undefined);
  const [formValues, setFormValues] = useState({ originalUrl: "", customSlug: "" });
  const [showNewLinkCard, setShowNewLinkCard] = useState(false);
  const [newLink, setNewLink] = useState<LinkFromAPI | null>(null);

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

const handleFormChange = (e: React.ChangeEvent<HTMLFormElement>) => {

    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const triggerConfetti = () => {
    const end = Date.now() + 1000;

    const colors = ['#6d28d9', '#8b5cf6', '#a855f7'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0.1, y: 0.6 },
        colors: colors,
        disableForReducedMotion: true
      });

      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 0.9, y: 0.6 },
        colors: colors,
        disableForReducedMotion: true
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
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

      // Adicionar o novo link ao topo da lista
      setNewLink(data);
      setShowNewLinkCard(true);
      fetchLinks();

      // Limpar o formulário
      formRef.current?.reset();
      setFormValues({ originalUrl: "", customSlug: "" });

      toast.success("Link encurtado com sucesso!");

      // Trigger confetti for some fun
      triggerConfetti();

      // Scroll to the new link card
      setTimeout(() => {
        const newLinkElement = document.getElementById("new-link-card");
        if (newLinkElement) {
          newLinkElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 500);

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ocorreu um problema.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      const response = await fetch(`/api/shortener/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao excluir link");
      }

      // Remove link from state
      setLinks(links => links?.filter(link => link.id !== id));
      toast.success("Link excluído com sucesso!");

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ocorreu um problema.");
    }
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-8 md:p-12 shadow-xl text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="p-4 bg-white/20 backdrop-blur-xl rounded-2xl shadow-inner">
              <Scissors className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
                Encurtador de Links
              </h1>
              <p className="text-lg md:text-xl text-purple-100 max-w-2xl">
                Transforme URLs longas em links curtos, elegantes e rastreáveis. Compartilhe com facilidade e monitore resultados.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 relative">
        <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full shadow-lg">
            <LinkIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Crie seu link curto
        </h2>

        <form
  ref={formRef}
  onSubmit={handleSubmit}
  className="space-y-6"
  noValidate
  onChange={(e: React.ChangeEvent<HTMLFormElement>) => handleFormChange(e)}
>
          <div>
            <Label
              htmlFor="longUrl"
              className="font-semibold text-gray-800 dark:text-gray-200 text-base"
            >
              URL de Destino
            </Label>
            <div className="mt-2 relative">
              <Input
                id="longUrl"
                name="originalUrl"
                type="url"
                placeholder="https://exemplo-de-link-muito-longo.com/produto"
                required
                className="py-6 pl-12 pr-4 text-base shadow-sm focus:ring-purple-500 focus:border-purple-500"
                disabled={isSubmitting}
                autoComplete="off"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Globe className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label
                htmlFor="customSlug"
                className="font-semibold text-gray-700 dark:text-gray-300 text-sm"
              >
                Apelido Personalizado (Opcional)
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-purple-600 dark:text-purple-400"
                onClick={() => {
                  // Generate random slug
                  const randomSlug = Math.random().toString(36).substring(2, 8);
                  setFormValues(prev => ({ ...prev, customSlug: randomSlug }));
                  if (formRef.current) {
                    const input = formRef.current.querySelector('input[name="customSlug"]') as HTMLInputElement;
                    if (input) input.value = randomSlug;
                  }
                }}
              >
                Gerar aleatório
              </Button>
            </div>
            <div className="mt-2 flex flex-col sm:flex-row items-stretch max-w-md">
              <span className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-t-md sm:rounded-l-md sm:rounded-tr-none border border-b-0 sm:border-b sm:border-r-0 select-text">
                freelinnk.com/r/
              </span>
              <Input
                id="customSlug"
                name="customSlug"
                placeholder="minha-promo"
                className="rounded-t-none sm:rounded-l-none sm:rounded-r-md text-center sm:text-left text-base"
                disabled={isSubmitting}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto py-6 px-8 text-base font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
              aria-live="polite"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin h-5 w-5 text-white" />
              ) : (
                <>
                  <Scissors className="w-5 h-5" /> Encurtar Link
                </>
              )}
            </Button>

            <p className="text-sm text-gray-500 dark:text-gray-400 flex-1">
              Links encurtados permanecem ativos por tempo ilimitado
            </p>
          </div>
        </form>

        <LinkPreview
          originalUrl={formValues.originalUrl}
          customSlug={formValues.customSlug}
        />
      </section>

      {/* New Link Card */}
      <AnimatePresence>
        {showNewLinkCard && newLink && (
          <motion.div
            id="new-link-card"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800 relative overflow-hidden"
          >
            <button
              onClick={() => setShowNewLinkCard(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                <Check className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Link criado com sucesso!
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Seu novo link curto está pronto para compartilhamento
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-purple-700 dark:text-purple-400 truncate break-all">
                  freelinnk.com/r/{newLink.id}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2 flex-shrink-0"
                  onClick={() => {
                    const shortUrl = `${window.location.origin}/r/${newLink.id}`;
                    navigator.clipboard.writeText(shortUrl);
                    toast.success("Link copiado!");
                  }}
                >
                  <Copy className="w-4 h-4 mr-1.5" /> Copiar
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Compartilhe agora mesmo
              </p>

              <div className="flex gap-2">
                <QRCodePopover url={`${window.location.origin}/r/${newLink.id}`} />
                <SharePopover url={`${window.location.origin}/r/${newLink.id}`} />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 flex-shrink-0"
                  onClick={() => window.open(newLink.url, '_blank', 'noopener,noreferrer')}
                >
                  <ExternalLink className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Links List Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Seus Links
          </h2>

          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={fetchLinks}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Atualizar
              </>
            )}
          </Button>
        </div>

        <LinkList
          links={links}
          isLoading={isLoading}
          onDeleteLink={handleDeleteLink}
        />
      </section>

      {/* Pro Features Banner */}
      <section className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Potencialize seus links</h2>
            <p className="text-indigo-100 max-w-md">
              Desbloqueie recursos avançados de rastreamento, estatísticas detalhadas e ferramentas de marketing.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg"
          >
            <Link href="/dashboard/billing">
              <span>Conhecer Planos Premium</span>
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}