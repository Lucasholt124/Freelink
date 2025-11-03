// components/brain/FreelinkBrainTool.tsx - FERRAMENTA COMPLETA (CORRIGIDA)
"use client";

import { useState, useRef, useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Sparkles, Brain, Video, RefreshCcw, Layers, Camera,
  MessageSquare, Wand2, Calendar, Trash2, Menu, FolderOpen,
  Crown, Flame, Settings, Clock, Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

import { useBrainCampaigns, useBufferIntegration, useContentGeneration, useScheduledPosts } from "@/app/hooks/useBrain";
import PostScheduleModal from "./brain/PostScheduleModal";
import SettingsModal from "./brain/SettingsModal";
import CalendarView from "./brain/CalendarView";
import { BrainResults, ContentType, ScheduleModalData } from "@/app/types/brain";
import { CarouselCard, ImagePostCard, ReelCard, StoryCard } from "./brain/ContentCards";

// =================================================================
// COMPONENTES AUXILIARES
// =================================================================

// Componente de Loading Spinner
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <Loader2 className="w-12 h-12 text-primary" />
    </motion.div>
    <p className="text-lg text-muted-foreground animate-pulse">
      Gerando conteúdo incrível...
    </p>
  </div>
);

// Componente de Contador Animado
const AnimatedCounter = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 500; // ms
    const timer = setInterval(() => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const currentValue = Math.floor(progress * value);
      setDisplayValue(currentValue);

      if (progress === 1) {
        clearInterval(timer);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}</span>;
};

// Tipos auxiliares
interface BrainCampaign {
  _id: Id<"brainCampaigns">;
  _creationTime: number;
  updatedAt?: number;
  favorite?: boolean;
  notes?: string;
  userId: string;
  createdAt: number;
  theme: string;
  themeSummary: string;
  targetAudience: string;
  viralStrategy: {
    best_times: string[];
    hashtag_strategy: string;
    engagement_hacks: string[];
  };
  contentPack: string;
}

// =================================================================
// COMPONENTE PRINCIPAL
// =================================================================

export default function FreelinkBrainTool() {
  // =================================================================
  // STATES
  // =================================================================
  const [theme, setTheme] = useState("");
  const [results, setResults] = useState<BrainResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("reels");
  const [mainView, setMainView] = useState<"generator" | "planner">("generator");
  const [showViralMode] = useState(true);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [scheduleModalData, setScheduleModalData] = useState<ScheduleModalData>({
    isOpen: false
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // =================================================================
  // HOOKS CONVEX
  // =================================================================
  const { generateIdeas } = useContentGeneration();
  const {
    campaigns,
    currentCampaign,
    createCampaign,
    deleteCampaign,
  } = useBrainCampaigns();

  useScheduledPosts();
  const { isConnected: isBufferConnected } = useBufferIntegration();

  // =================================================================
  // FUNÇÕES
  // =================================================================

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!theme.trim()) {
      toast.error("Por favor, insira um tema");
      inputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const data = await generateIdeas({ theme });
      setResults(data);

      await createCampaign({
        theme,
        themeSummary: data.theme_summary,
        targetAudience: data.target_audience_suggestion,
        viralStrategy: {
          best_times: data.viral_strategy.best_times,
          hashtag_strategy: data.viral_strategy.hashtag_strategy,
          engagement_hacks: data.viral_strategy.engagement_hacks,
        },
        contentPack: JSON.stringify(data.content_pack),
      });

      setActiveTab("reels");
      toast.success("Campanha gerada com sucesso! 🎉");

      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981']
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao gerar conteúdo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNew = () => {
    setResults(null);
    setTheme("");
    setActiveTab("reels");
    inputRef.current?.focus();
  };

  const handleExampleClick = (exampleTheme: string) => {
    setTheme(exampleTheme);
    setTimeout(() => handleSubmit(), 100);
  };

  const handleScheduleContent = (
    contentType: ContentType,
    index: number
  ) => {
    if (!currentCampaign || !results) return;

    const key = contentType === "image_post" ? "image_posts" :
      contentType === "story_sequence" ? "story_sequences" :
        `${contentType}s` as "reels" | "carousels";

    const content = results.content_pack[key][index];
    if (!content) return;

    // Extrair caption e hashtags
    let caption = "";
    let hashtags: string[] = [];

    if (contentType === "reel" && 'hook' in content) {
      caption = `${content.title}\n\n${content.hook}\n\n${content.main_points.join('\n')}\n\n${content.cta}`;
    } else if (contentType === "carousel" && 'slides' in content && 'cta_slide' in content) {
      caption = `${content.title}\n\n${content.slides.map(s => s.content).join('\n\n')}\n\n${content.cta_slide}`;
    } else if (contentType === "image_post" && 'caption' in content && 'hashtags' in content) {
      caption = content.caption;
      hashtags = content.hashtags;
    } else if (contentType === "story_sequence" && 'theme' in content && 'slides' in content) {
      caption = `${content.theme}\n\n${content.slides.map(s => s.content).join('\n')}`;
    }

    setScheduleModalData({
      isOpen: true,
      campaignId: currentCampaign._id,
      contentType,
      contentData: content,
      initialCaption: caption,
      initialHashtags: hashtags,
    });
  };

  const handleCampaignSelect = (campaign: BrainCampaign) => {
    const parsedContent = JSON.parse(campaign.contentPack);
    setResults({
      theme_summary: campaign.themeSummary,
      target_audience_suggestion: campaign.targetAudience,
      content_pack: parsedContent,
      viral_strategy: campaign.viralStrategy,
    });
    setTheme(campaign.theme);
    setMainView("generator");
    setIsHistorySidebarOpen(false);
    toast.success("Campanha carregada!");
  };

  const handleCampaignDelete = async (id: Id<"brainCampaigns">) => {
    try {
      await deleteCampaign({ campaignId: id });
      toast.success("Campanha excluída!");
    } catch (error) {
      console.error("Erro ao excluir campanha:", error);
      toast.error("Erro ao excluir campanha");
    }
  };

  // Contagem de conteúdo
  const contentCounts = results ? {
    reels: results.content_pack?.reels?.length ?? 0,
    carousels: results.content_pack?.carousels?.length ?? 0,
    image_posts: results.content_pack?.image_posts?.length ?? 0,
    story_sequences: results.content_pack?.story_sequences?.length ?? 0,
    total: (results.content_pack?.reels?.length ?? 0) +
      (results.content_pack?.carousels?.length ?? 0) +
      (results.content_pack?.image_posts?.length ?? 0) +
      (results.content_pack?.story_sequences?.length ?? 0)
  } : null;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-50/30 via-pink-50/30 to-orange-50/30 dark:from-gray-950 dark:to-black">

      {/* ================= HEADER ================= */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/80 backdrop-blur-xl border-b border-purple-200/50 dark:border-white/10 shadow-lg"
      >
        <div className="container py-3 px-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
              >
                <h1 className="font-black text-lg sm:text-xl md:text-2xl lg:text-3xl">
                  <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                    FreelinkBrain
                  </span>
                </h1>
              </motion.div>

              <div className="hidden sm:flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg text-xs">
                  <Crown className="w-3 h-3 mr-1" />
                  PRO
                </Badge>
                {showViralMode && (
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white animate-pulse text-xs">
                    <Flame className="w-3 h-3 mr-1" />
                    VIRAL
                  </Badge>
                )}
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <Tabs value={mainView} className="w-auto">
                <TabsList className="bg-gray-100 dark:bg-gray-800/50">
                  <TabsTrigger
                    value="generator"
                    onClick={() => setMainView("generator")}
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerador
                  </TabsTrigger>
                  <TabsTrigger
                    value="planner"
                    onClick={() => setMainView("planner")}
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Calendário
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isBufferConnected ? "default" : "outline"}
                      size="icon"
                      onClick={() => setIsSettingsOpen(true)}
                      className={cn(
                        "relative",
                        isBufferConnected && "bg-green-600 hover:bg-green-700"
                      )}
                    >
                      {isBufferConnected ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Settings className="w-4 h-4" />
                      )}
                      {isBufferConnected && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isBufferConnected ? "Buffer Conectado" : "Configurar Buffer"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsHistorySidebarOpen(true)}
                className="gap-2"
              >
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Histórico</span>
              </Button>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px]">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="grid gap-2 mt-4">
                    <Button
                      variant={mainView === "generator" ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setMainView("generator")}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Gerador
                    </Button>
                    <Button
                      variant={mainView === "planner" ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setMainView("planner")}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Calendário
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ================= SIDEBAR HISTÓRICO ================= */}
      <Sheet open={isHistorySidebarOpen} onOpenChange={setIsHistorySidebarOpen}>
        <SheetContent side="right" className="w-full sm:w-[450px] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Histórico de Campanhas</SheetTitle>
            <SheetDescription>
              Acesse suas campanhas anteriores
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-150px)]">
            {campaigns?.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>Nenhuma campanha encontrada</p>
              </div>
            ) : (
              <div className="divide-y">
                {campaigns?.map((campaign) => (
                  <div
                    key={campaign._id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleCampaignSelect(campaign)}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <Brain className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">{campaign.theme}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCampaignDelete(campaign._id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* ================= MODAL DE AGENDAMENTO ================= */}
      {scheduleModalData.isOpen && scheduleModalData.campaignId && scheduleModalData.contentData && (
        <PostScheduleModal
          isOpen={scheduleModalData.isOpen}
          onClose={() => setScheduleModalData({ isOpen: false })}
          campaignId={scheduleModalData.campaignId}
          contentType={scheduleModalData.contentType!}
          contentData={scheduleModalData.contentData}
          initialCaption={scheduleModalData.initialCaption || ""}
          initialHashtags={scheduleModalData.initialHashtags || []}
        />
      )}

      {/* ================= MODAL DE CONFIGURAÇÕES ================= */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* ================= CONTEÚDO PRINCIPAL ================= */}
      <div className="container px-4 py-8">
        <AnimatePresence mode="wait">

          {/* ================= VIEW: GERADOR ================= */}
          {mainView === "generator" && (
            <motion.div
              key="generator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {isLoading ? (
                <LoadingSpinner />
              ) : results && currentCampaign ? (
                <div className="space-y-6">
                  {/* Header dos Resultados */}
                  <Card className="shadow-lg p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          Campanha Pronta!
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          Tema: <span className="font-semibold">{theme}</span>
                        </p>
                      </div>
                      <Button onClick={handleGenerateNew} variant="outline">
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Novo Tema
                      </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-6">
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold text-primary">
                          <AnimatedCounter value={contentCounts?.total || 0} />
                        </p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>

                      {[
                        { key: "reels", Icon: Video },
                        { key: "carousels", Icon: Layers },
                        { key: "image_posts", Icon: Camera },
                        { key: "story_sequences", Icon: MessageSquare },
                      ].map(({ key, Icon }) => {
                        const typedKey = key as "reels" | "carousels" | "image_posts" | "story_sequences";
                        return (
                          <div key={key} className="text-center p-2 bg-muted/50 rounded-lg">
                            <Icon className="w-4 h-4 mx-auto mb-1 text-primary" />
                            <p className="text-lg font-bold">
                              <AnimatedCounter value={contentCounts?.[typedKey] || 0} />
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* Tabs de Conteúdo */}
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
                      <TabsTrigger value="reels">
                        <Video className="w-4 h-4 mr-2" />
                        Reels
                      </TabsTrigger>
                      <TabsTrigger value="carousels">
                        <Layers className="w-4 h-4 mr-2" />
                        Carrosséis
                      </TabsTrigger>
                      <TabsTrigger value="image_posts">
                        <Camera className="w-4 h-4 mr-2" />
                        Posts
                      </TabsTrigger>
                      <TabsTrigger value="story_sequences">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Stories
                      </TabsTrigger>
                    </TabsList>

                    <div className="mt-6">
                      <TabsContent value="reels" className="space-y-4">
                        {results.content_pack?.reels?.map((reel, i) => (
                          <ReelCard
                            key={i}
                            reel={reel}
                            index={i}
                            onSchedule={() => handleScheduleContent("reel", i)}
                          />
                        ))}
                      </TabsContent>

                      <TabsContent value="carousels" className="space-y-4">
                        {results.content_pack?.carousels?.map((carousel, i) => (
                          <CarouselCard
                            key={i}
                            carousel={carousel}
                            index={i}
                            onSchedule={() => handleScheduleContent("carousel", i)}
                          />
                        ))}
                      </TabsContent>

                      <TabsContent value="image_posts" className="space-y-4">
                        {results.content_pack?.image_posts?.map((post, i) => (
                          <ImagePostCard
                            key={i}
                            post={post}
                            index={i}
                            onSchedule={() => handleScheduleContent("image_post", i)}
                          />
                        ))}
                      </TabsContent>

                      <TabsContent value="story_sequences" className="space-y-4">
                        {results.content_pack?.story_sequences?.map((story, i) => (
                          <StoryCard
                            key={i}
                            story={story}
                            index={i}
                            onSchedule={() => handleScheduleContent("story_sequence", i)}
                          />
                        ))}
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto space-y-8">
                  <Card className="shadow-2xl border-2 p-8 sm:p-12">
                    <div className="text-center space-y-6">
                      <Badge variant="secondary" className="px-4 py-1.5">
                        <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                        Sua Máquina de Conteúdo
                      </Badge>

                      <h1 className="text-4xl sm:text-5xl font-extrabold">
                        Freelink<span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Brain</span>
                      </h1>

                      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Transforme um tema em uma campanha completa de conteúdo em 30 segundos
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Wand2 className="w-4 h-4 text-purple-500" />
                          Qual tema você quer dominar?
                        </Label>
                        <Input
                          ref={inputRef}
                          value={theme}
                          onChange={(e) => setTheme(e.target.value)}
                          placeholder="Ex: Como vender pelo Instagram"
                          className="text-lg py-6"
                          maxLength={150}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                          {theme.length}/150
                        </p>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                        disabled={isLoading || !theme.trim()}
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Gerar Campanha Completa
                      </Button>
                    </form>

                    <div className="mt-8">
                      <p className="text-sm text-muted-foreground text-center mb-3">
                        Precisa de inspiração? Experimente:
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[
                          "Vendas B2B pelo LinkedIn",
                          "Lançamento digital",
                          "Marketing para e-commerce",
                          "Consultoria online",
                        ].map((example) => (
                          <Button
                            key={example}
                            variant="outline"
                            size="sm"
                            onClick={() => handleExampleClick(example)}
                          >
                            {example}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </motion.div>
          )}

          {/* ================= VIEW: CALENDÁRIO ================= */}
          {mainView === "planner" && (
            <motion.div
              key="planner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CalendarView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="mt-20 py-8 border-t">
        <div className="container text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Criado com 💜 para revolucionar o seu conteúdo
          </p>
          <p className="text-sm text-gray-500 mt-2">
            © 2025 Freelinnk - A melhor ferramenta do universo
          </p>
        </div>
      </footer>
    </div>
  );
}