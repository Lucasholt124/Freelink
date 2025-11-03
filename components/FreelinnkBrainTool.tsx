// components/brain/FreelinkBrainTool.tsx - VERSÃO MOBILE-FIRST
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

const AnimatedCounter = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 500;
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

  const { generateIdeas } = useContentGeneration();
  const {
    campaigns,
    currentCampaign,
    createCampaign,
    deleteCampaign,
  } = useBrainCampaigns();

  useScheduledPosts();
  const { isConnected: isBufferConnected } = useBufferIntegration();

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

      {/* ================= HEADER MOBILE-OPTIMIZED ================= */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-purple-200/50 dark:border-white/10 shadow-lg"
      >
        <div className="container">
          {/* Linha Principal - MOBILE FIRST */}
          <div className="flex items-center justify-between gap-2 py-2 sm:py-3 px-2 sm:px-4">

            {/* Logo + Badges */}
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
              <h1 className="font-black text-base sm:text-xl md:text-2xl lg:text-3xl truncate">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                  FreelinkBrain
                </span>
              </h1>

              {/* Badges - Versão Mini para Mobile */}
              <div className="flex items-center gap-1">
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg text-[0.6rem] sm:text-xs px-1 py-0 sm:px-2 sm:py-0.5">
                  <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 sm:mr-1" />
                  <span className="hidden sm:inline">PRO</span>
                </Badge>
                {showViralMode && (
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white animate-pulse text-[0.6rem] sm:text-xs px-1 py-0 sm:px-2 sm:py-0.5">
                    <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 sm:mr-1" />
                    <span className="hidden sm:inline">VIRAL</span>
                  </Badge>
                )}
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              <Tabs value={mainView} className="w-auto">
                <TabsList className="bg-gray-100 dark:bg-gray-800/50 h-9">
                  <TabsTrigger
                    value="generator"
                    onClick={() => setMainView("generator")}
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Gerador
                  </TabsTrigger>
                  <TabsTrigger
                    value="planner"
                    onClick={() => setMainView("planner")}
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-sm"
                  >
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    Calendário
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Action Buttons - Compacto */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Settings/Buffer Status - Smaller on Mobile */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isBufferConnected ? "default" : "outline"}
                      size="icon"
                      onClick={() => setIsSettingsOpen(true)}
                      className={cn(
                        "relative h-8 w-8 sm:h-9 sm:w-9",
                        isBufferConnected && "bg-green-600 hover:bg-green-700"
                      )}
                    >
                      {isBufferConnected ? (
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                      {isBufferConnected && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isBufferConnected ? "Buffer Conectado" : "Configurar Buffer"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Histórico - Menor no Mobile */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsHistorySidebarOpen(true)}
                className="h-8 sm:h-9 px-2 sm:px-3"
              >
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline text-sm">Histórico</span>
              </Button>

              {/* Menu Mobile */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden h-8 w-8 sm:h-9 sm:w-9">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] sm:w-[300px]">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      Menu
                    </SheetTitle>
                    <SheetDescription>
                      Navegue pelas funcionalidades
                    </SheetDescription>
                  </SheetHeader>
                  <div className="grid gap-3 mt-6">
                    <Button
                      variant={mainView === "generator" ? "default" : "outline"}
                      className="justify-start w-full"
                      onClick={() => setMainView("generator")}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Gerador de Conteúdo
                    </Button>
                    <Button
                      variant={mainView === "planner" ? "default" : "outline"}
                      className="justify-start w-full"
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
        <SheetContent side="right" className="w-full sm:w-[400px] p-0">
          <SheetHeader className="px-4 sm:px-6 py-4 border-b">
            <SheetTitle className="text-lg">Histórico de Campanhas</SheetTitle>
            <SheetDescription className="text-sm">
              Acesse suas campanhas anteriores
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-100px)]">
            {campaigns?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Nenhuma campanha encontrada</p>
              </div>
            ) : (
              <div className="divide-y">
                {campaigns?.map((campaign) => (
                  <div
                    key={campaign._id}
                    className="flex items-center justify-between p-3 sm:p-4 hover:bg-muted/50 transition-colors cursor-pointer active:bg-muted"
                    onClick={() => handleCampaignSelect(campaign)}
                  >
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                      <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm truncate">{campaign.theme}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(campaign.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCampaignDelete(campaign._id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* ================= MODALS ================= */}
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

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* ================= CONTEÚDO PRINCIPAL ================= */}
      <div className="container px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <AnimatePresence mode="wait">

          {/* ================= VIEW: GERADOR ================= */}
          {mainView === "generator" && (
            <motion.div
              key="generator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 sm:space-y-6"
            >
              {isLoading ? (
                <LoadingSpinner />
              ) : results && currentCampaign ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Header dos Resultados - Mobile Optimized */}
                  <Card className="shadow-lg p-4 sm:p-6">
                    <div className="flex flex-col gap-3 sm:gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Campanha Pronta!
                          </h2>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                            <span className="font-semibold">{theme}</span>
                          </p>
                        </div>
                        <Button
                          onClick={handleGenerateNew}
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0"
                        >
                          <RefreshCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                          <span className="hidden sm:inline">Novo</span>
                        </Button>
                      </div>

                      {/* Stats - Grid Responsivo */}
                      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                        <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
                          <p className="text-lg sm:text-2xl font-bold text-primary">
                            <AnimatedCounter value={contentCounts?.total || 0} />
                          </p>
                          <p className="text-[0.65rem] sm:text-xs text-muted-foreground mt-0.5">Total</p>
                        </div>

                        {[
                          { key: "reels", Icon: Video, label: "Reels" },
                          { key: "carousels", Icon: Layers, label: "Carr." },
                          { key: "image_posts", Icon: Camera, label: "Posts" },
                          { key: "story_sequences", Icon: MessageSquare, label: "Stories" },
                        ].map(({ key, Icon, label }) => {
                          const typedKey = key as "reels" | "carousels" | "image_posts" | "story_sequences";
                          return (
                            <div key={key} className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
                              <Icon className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1 text-primary" />
                              <p className="text-sm sm:text-lg font-bold">
                                <AnimatedCounter value={contentCounts?.[typedKey] || 0} />
                              </p>
                              <p className="text-[0.65rem] hidden sm:block text-muted-foreground mt-0.5">{label}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Card>

                  {/* Tabs de Conteúdo - Mobile Friendly */}
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-4 w-full h-auto gap-1 bg-transparent sm:bg-muted p-0 sm:p-1">
                      <TabsTrigger
                        value="reels"
                        className="flex-col sm:flex-row h-auto py-2 sm:py-2.5 px-2 gap-1 text-xs sm:text-sm"
                      >
                        <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline sm:ml-1.5">Reels</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="carousels"
                        className="flex-col sm:flex-row h-auto py-2 sm:py-2.5 px-2 gap-1 text-xs sm:text-sm"
                      >
                        <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline sm:ml-1.5">Carr.</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="image_posts"
                        className="flex-col sm:flex-row h-auto py-2 sm:py-2.5 px-2 gap-1 text-xs sm:text-sm"
                      >
                        <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline sm:ml-1.5">Posts</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="story_sequences"
                        className="flex-col sm:flex-row h-auto py-2 sm:py-2.5 px-2 gap-1 text-xs sm:text-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline sm:ml-1.5">Stories</span>
                      </TabsTrigger>
                    </TabsList>

                    <div className="mt-4 sm:mt-6">
                      <TabsContent value="reels" className="space-y-3 sm:space-y-4 mt-0">
                        {results.content_pack?.reels?.map((reel, i) => (
                          <ReelCard
                            key={i}
                            reel={reel}
                            index={i}
                            onSchedule={() => handleScheduleContent("reel", i)}
                          />
                        ))}
                      </TabsContent>

                      <TabsContent value="carousels" className="space-y-3 sm:space-y-4 mt-0">
                        {results.content_pack?.carousels?.map((carousel, i) => (
                          <CarouselCard
                            key={i}
                            carousel={carousel}
                            index={i}
                            onSchedule={() => handleScheduleContent("carousel", i)}
                          />
                        ))}
                      </TabsContent>

                      <TabsContent value="image_posts" className="space-y-3 sm:space-y-4 mt-0">
                        {results.content_pack?.image_posts?.map((post, i) => (
                          <ImagePostCard
                            key={i}
                            post={post}
                            index={i}
                            onSchedule={() => handleScheduleContent("image_post", i)}
                          />
                        ))}
                      </TabsContent>

                      <TabsContent value="story_sequences" className="space-y-3 sm:space-y-4 mt-0">
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
                <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
                  <Card className="shadow-2xl border-2 p-6 sm:p-8 md:p-12">
                    <div className="text-center space-y-4 sm:space-y-6">
                      <Badge variant="secondary" className="px-3 py-1 sm:px-4 sm:py-1.5">
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-yellow-500" />
                        <span className="text-xs sm:text-sm">Sua Máquina de Conteúdo</span>
                      </Badge>

                      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
                        Freelink<span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Brain</span>
                      </h1>

                      <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
                        Transforme um tema em uma campanha completa de conteúdo em 30 segundos
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm sm:text-base">
                          <Wand2 className="w-4 h-4 text-purple-500" />
                          Qual tema você quer dominar?
                        </Label>
                        <Input
                          ref={inputRef}
                          value={theme}
                          onChange={(e) => setTheme(e.target.value)}
                          placeholder="Ex: Como vender pelo Instagram"
                          className="text-base sm:text-lg py-5 sm:py-6"
                          maxLength={150}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                          {theme.length}/150
                        </p>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 h-12 sm:h-14 text-base sm:text-lg"
                        disabled={isLoading || !theme.trim()}
                      >
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Gerar Campanha Completa
                      </Button>
                    </form>

                    <div className="mt-6 sm:mt-8">
                      <p className="text-xs sm:text-sm text-muted-foreground text-center mb-3">
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
                            className="text-xs sm:text-sm h-8 sm:h-9"
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CalendarView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer - Compacto no Mobile */}
      <footer className="mt-12 sm:mt-20 py-6 sm:py-8 border-t">
        <div className="container text-center px-4">
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Criado com 💜 para revolucionar o seu conteúdo
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            © 2025 Freelinnk - A melhor ferramenta do universo
          </p>
        </div>
      </footer>
    </div>
  );
}