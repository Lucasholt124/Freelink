"use client";

import { useState, useRef, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Copy, Check, Loader2, Brain,
  Lightbulb, Video, Share2, ArrowRight,
  Zap, Bookmark, TrendingUp, RefreshCcw,
  ChevronDown, ThumbsUp, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// --- Tipagem para os Resultados ---
type ReelScript = { title: string; script: string; };
type BrainResults = {
  viral_titles?: string[];
  reel_scripts?: ReelScript[];
};

// --- Sub-componentes ---
function CopyButton({ textToCopy, large = false }: { textToCopy: string; large?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Copiado para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      onClick={handleCopy}
      size={large ? "default" : "icon"}
      variant="ghost"
      className={cn(
        "flex-shrink-0 group transition-all",
        large ? "gap-2" : "h-8 w-8"
      )}
    >
      {copied ? (
        <>
          {large && <span>Copiado!</span>}
          <Check className={cn("text-green-500", large ? "w-5 h-5" : "w-4 h-4")} />
        </>
      ) : (
        <>
          {large && <span>Copiar</span>}
          <Copy className={cn(
            "group-hover:scale-110 transition-transform",
            large ? "w-5 h-5" : "w-4 h-4"
          )} />
        </>
      )}
    </Button>
  );
}

function ShareButton({ content, title }: { content: string; title: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'FreelinkBrain - Ideias de Conteúdo',
          text: `${title}\n\n${content}\n\nGerado com FreelinkBrain ✨`,
          url: 'https://freelink.io',
        });
      } catch  {
        setIsOpen(true);
        navigator.clipboard.writeText(`${title}\n\n${content}\n\nGerado com FreelinkBrain ✨`);
        toast.success("Conteúdo copiado para compartilhamento!");
      }
    } else {
      setIsOpen(true);
      navigator.clipboard.writeText(`${title}\n\n${content}\n\nGerado com FreelinkBrain ✨`);
      toast.success("Conteúdo copiado para compartilhamento!");
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
          <Share2 className="w-4 h-4" />
          Compartilhar
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-4">
        <div className="space-y-2">
          <h3 className="font-medium text-sm">Compartilhar via:</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${title}\n\n${content}\n\nGerado com FreelinkBrain ✨\nhttps://freelink.io`)}`, '_blank')}
              className="justify-start text-xs h-8"
            >
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title}\n\n${content}\n\nGerado com FreelinkBrain ✨`)}&url=${encodeURIComponent('https://freelink.io')}`, '_blank')}
              className="justify-start text-xs h-8"
            >
              Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="col-span-2 text-xs h-8"
            >
              Fechar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function PulseEffect() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="absolute w-12 h-12 rounded-full bg-blue-500 opacity-20 animate-ping" />
      <div className="absolute w-16 h-16 rounded-full bg-blue-500 opacity-10 animate-pulse" />
      <div className="absolute w-20 h-20 rounded-full bg-blue-500 opacity-5 animate-pulse" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

function ResultSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-8"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          {icon}
        </div>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

function LoadingSpinner() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[300px] flex flex-col items-center justify-center p-8"
    >
      <div className="relative">
        <PulseEffect />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, ease: "linear", repeat: Infinity }}
        >
          <Brain className="w-12 h-12 text-blue-500" />
        </motion.div>
      </div>
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-xl font-semibold"
      >
        O FreelinkBrain está pensando...
      </motion.h3>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-3 text-center text-muted-foreground max-w-xs"
      >
        Gerando ideias virais de conteúdo com base no seu tema
      </motion.div>
    </motion.div>
  );
}

// --- Componente Principal ---
export default function FreelinkBrainTool() {
  const [theme, setTheme] = useState("");
  const [results, setResults] = useState<BrainResults>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("titles");
  const [recentThemes, setRecentThemes] = useState<string[]>([]);
  const [showRecentThemes, setShowRecentThemes] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Hook para action do Convex
  const generateIdeas = useAction(api.brain.generateContentIdeas);

  // Carregar temas recentes do localStorage
  useEffect(() => {
    const savedThemes = localStorage.getItem("freelink-brain-themes");
    if (savedThemes) {
      try {
        const parsed = JSON.parse(savedThemes);
        if (Array.isArray(parsed)) {
          setRecentThemes(parsed.slice(0, 5));
        }
      } catch (e) {
        console.error("Erro ao carregar temas recentes:", e);
      }
    }
  }, []);

  // Salvar tema atual como recente
  const saveThemeAsRecent = (newTheme: string) => {
    if (!newTheme.trim()) return;

    setRecentThemes(prev => {
      const updated = [newTheme, ...prev.filter(t => t !== newTheme)].slice(0, 5);
      localStorage.setItem("freelink-brain-themes", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim()) {
      toast.error("Por favor, insira um tema para gerar ideias.");
      inputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setResults({});
    saveThemeAsRecent(theme);

    // Chamada à action com toast.promise
    toast.promise(generateIdeas({ theme }), {
      loading: "O FreelinkBrain está gerando ideias virais...",
      success: (data: BrainResults) => {
        setResults(data);
        setIsLoading(false);
        return "Suas ideias de conteúdo estão prontas!";
      },
      error: (err) => {
        setIsLoading(false);
        return `Erro: ${err instanceof Error ? err.message : 'Tente novamente.'}`
      }
    });
  };

  const handleSelectRecentTheme = (selectedTheme: string) => {
    setTheme(selectedTheme);
    setShowRecentThemes(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleGenerateNew = () => {
    setResults({});
    setTheme("");
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Cabeçalho */}
      <div className="text-center mb-8">
        <Badge variant="outline" className="mb-2 px-3 py-1 font-medium bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
          FERRAMENTA PREMIUM
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2">
          Freelink<span className="text-blue-600">Brain</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          IA que transforma temas simples em ideias virais de conteúdo em segundos
        </p>
      </div>

      {/* Formulário de entrada */}
      <Card className="border-blue-200 dark:border-blue-800/50 shadow-xl shadow-blue-500/5">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>Gerador de Ideias Virais</CardTitle>
              <CardDescription>Insira um tema e receba ideias prontas para usar</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme" className="font-medium">
                  Sobre o que você quer criar conteúdo?
                </Label>
                {recentThemes.length > 0 && (
                  <Popover open={showRecentThemes} onOpenChange={setShowRecentThemes}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                        Temas recentes
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-64 p-0">
                      <div className="py-1">
                        {recentThemes.map((item, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            className="w-full justify-start text-sm h-9 rounded-none font-normal"
                            onClick={() => handleSelectRecentTheme(item)}
                          >
                            {item}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <div className="flex">
                <div className="relative flex-grow">
                  <Input
                    id="theme"
                    ref={inputRef}
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="Ex: Dicas para aumentar a produtividade trabalhando home office"
                    className="pr-24 py-6 text-base"
                    disabled={isLoading}
                  />
                  {theme && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8"
                      onClick={() => setTheme("")}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-6 font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Gerando Ideias Virais...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Gerar Ideias de Conteúdo
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-muted/50 p-3 flex justify-center border-t">
          <p className="text-xs text-muted-foreground">
            Usado por mais de 10.000 criadores de conteúdo em todo o mundo
          </p>
        </CardFooter>
      </Card>

      {/* Área de Resultados */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingSpinner key="loading" />
        ) : Object.keys(results).length > 0 ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Resultados para: <span className="text-blue-600">{theme}</span>
              </h2>
              <Button
                onClick={handleGenerateNew}
                variant="outline"
                className="gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Novo Tema
              </Button>
            </div>

            {/* Abas de navegação */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
                <TabsTrigger
                  value="titles"
                  className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30 flex gap-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  Títulos Virais
                </TabsTrigger>
                <TabsTrigger
                  value="scripts"
                  className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30 flex gap-2"
                >
                  <Video className="w-4 h-4" />
                  Roteiros para Reels
                </TabsTrigger>
              </TabsList>

              <TabsContent value="titles" className="mt-6">
                {results.viral_titles && (
                  <ResultSection title="Títulos Virais" icon={<Lightbulb className="w-5 h-5 text-amber-500" />}>
                    <motion.div
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      initial="hidden"
                      animate="show"
                      variants={{
                        hidden: {},
                        show: {
                          transition: {
                            staggerChildren: 0.1
                          }
                        }
                      }}
                    >
                      {results.viral_titles.map((title, i) => (
                        <motion.div
                          key={i}
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            show: { opacity: 1, y: 0 }
                          }}
                          className="bg-white dark:bg-gray-800 p-4 rounded-lg border hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-2">
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 shrink-0">
                              #{i+1}
                            </Badge>
                            <p className="flex-1">{title}</p>
                            <div className="flex gap-1">
                              <CopyButton textToCopy={title} />
                              <ShareButton content={title} title="Ideia de Título Viral" />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 mt-3">
                            <Badge variant="outline" className="text-xs">
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              <span>{80 + Math.floor(Math.random() * 15)}%</span>
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              <span>Potencial Viral</span>
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>

                    <div className="mt-6 flex justify-center">
                      <Button
                        onClick={() => {
                          const allTitles = results.viral_titles?.join('\n\n');
                          if (allTitles) {
                            navigator.clipboard.writeText(allTitles);
                            toast.success("Todos os títulos copiados!");
                          }
                        }}
                        variant="outline"
                        className="gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copiar Todos os Títulos
                      </Button>
                    </div>
                  </ResultSection>
                )}
              </TabsContent>

              <TabsContent value="scripts" className="mt-6">
                {results.reel_scripts && (
                  <ResultSection title="Roteiros para Reels" icon={<Video className="w-5 h-5 text-red-500" />}>
                    <motion.div
                      className="space-y-6"
                      initial="hidden"
                      animate="show"
                      variants={{
                        hidden: {},
                        show: {
                          transition: {
                            staggerChildren: 0.15
                          }
                        }
                      }}
                    >
                      {results.reel_scripts.map((reel, i) => (
                        <motion.div
                          key={i}
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            show: { opacity: 1, y: 0 }
                          }}
                          className="bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/10 p-6 rounded-lg border shadow-sm"
                        >
                          <div className="flex justify-between items-start gap-2 mb-4">
                            <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
                              Reel #{i+1}
                            </Badge>
                            <div className="flex gap-1">
                              <CopyButton textToCopy={`${reel.title}\n\n${reel.script}`} />
                              <ShareButton content={reel.script} title={reel.title} />
                            </div>
                          </div>

                          <h3 className="text-xl font-semibold mb-3">{reel.title}</h3>

                          <div className="bg-white/80 dark:bg-gray-900/50 p-4 rounded-md border border-blue-100 dark:border-blue-900/50">
                            <p className="text-sm whitespace-pre-line">{reel.script}</p>
                          </div>

                          <div className="mt-4 flex justify-between items-center">
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-xs">
                                <Zap className="w-3 h-3 mr-1" />
                                <span>Engajamento Alto</span>
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                <span>{40 + Math.floor(Math.random() * 60)}% Conversão</span>
                              </Badge>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7 gap-1"
                              onClick={() => {
                                navigator.clipboard.writeText(`${reel.title}\n\n${reel.script}`);
                                toast.success("Roteiro copiado!");
                              }}
                            >
                              <Bookmark className="w-3 h-3" />
                              Salvar
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </ResultSection>
                )}
              </TabsContent>
            </Tabs>

            {/* Chamada para Ação */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-xl shadow-lg"
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h3 className="text-xl font-bold">Transforme suas ideias em conteúdo viral</h3>
                  <p className="mt-2 text-blue-100">Use o FreelinkBrain diariamente para nunca faltar ideias de conteúdo.</p>
                </div>
                <Button
                  variant="secondary"
                  onClick={handleGenerateNew}
                  className="whitespace-nowrap"
                >
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Gerar Novas Ideias
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}