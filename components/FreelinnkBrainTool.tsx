"use client";

import { useState, useRef, useCallback } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Sparkles, Brain, Video, RefreshCcw, Layers, Camera,
  MessageSquare, Calendar, Trash2, Menu,
  Crown, Clock, Loader2, ChevronDown, Bell,
  CheckCircle2, Search, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useMutation, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useContentGeneration, useNotificationIntegration, useScheduledPosts } from "@/app/hooks/useBrain";
import PostScheduleModal from "./brain/PostScheduleModal";
import {
  BrainResults,
  ContentType,
  ScheduleModalData,
  BrainCampaign,
  ViralStrategy
} from "@/app/types/brain";
import { ReelCardPro, ReelCardUltra, CarouselCard, ImagePostCard, StoryCard } from "./brain/ContentCards";
import SettingsModal from "./brain/SettingsModal";
import CalendarView from "./brain/CalendarView";
import { LoadingSpinnerPro, LoadingSpinnerUltra } from "./brain/LoadingSpinners";
import { HeroSection } from "./brain/HeroSection";
import { ViralStatsCard } from "./brain/ViralStatsCard";
import { MobileBottomNav } from "./brain/MobileBottomNav";

// =================================================================
// PROPS
// =================================================================
interface FreelinnkBrainToolProps {
  userPlan: "pro" | "ultra";
}

// =================================================================
// HELPER: Normalizar Viral Strategy
// =================================================================
function normalizeViralStrategy(strategy: Partial<ViralStrategy> | undefined): ViralStrategy {
  return {
    best_times: strategy?.best_times || [],
    hashtag_strategy: strategy?.hashtag_strategy || "",
    engagement_hacks: strategy?.engagement_hacks || strategy?.growth_hacks || [],
    content_pillars: strategy?.content_pillars,
    posting_frequency: strategy?.posting_frequency,
    best_times_detailed: strategy?.best_times_detailed,
    hashtag_sets: strategy?.hashtag_sets,
    engagement_tactics: strategy?.engagement_tactics,
    growth_hacks: strategy?.growth_hacks,
    collaboration_ideas: strategy?.collaboration_ideas,
    trend_adaptation_tips: strategy?.trend_adaptation_tips,
    algorithm_optimization: strategy?.algorithm_optimization,
    community_building: strategy?.community_building,
    monetization_path: strategy?.monetization_path,
  };
}

// =================================================================
// HELPER: Normalizar Brain Results
// =================================================================
function normalizeBrainResults(data: Partial<BrainResults>): BrainResults {
  return {
    theme_summary: data.theme_summary || "",
    target_audience_suggestion: data.target_audience_suggestion ||
      data.analysis?.target_audience_profile?.demographics || "",
    content_pack: {
      reels: data.content_pack?.reels || [],
      carousels: data.content_pack?.carousels || [],
      image_posts: data.content_pack?.image_posts || [],
      story_sequences: data.content_pack?.story_sequences || [],
    },
    viral_strategy: normalizeViralStrategy(data.viral_strategy),
    analysis: data.analysis,
    optimized_strategy: data.optimized_strategy,
    weekly_content_calendar: data.weekly_content_calendar,
    success_metrics: data.success_metrics,
    final_recommendations: data.final_recommendations,
  };
}

// =================================================================
// COMPONENTE PRINCIPAL
// =================================================================
export default function FreelinnkBrainTool({ userPlan }: FreelinnkBrainToolProps) {
  const [theme, setTheme] = useState("");
  const [results, setResults] = useState<BrainResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("reels");
  const [mainView, setMainView] = useState<"generator" | "planner">("generator");
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentCampaign, setCurrentCampaign] = useState<BrainCampaign | null>(null);
  const [scheduleModalData, setScheduleModalData] = useState<ScheduleModalData>({ isOpen: false });

  const inputRef = useRef<HTMLInputElement>(null);

  const { generateIdeas } = useContentGeneration();
  const { results: campaigns, status: campaignsStatus, loadMore: loadMoreCampaigns } = usePaginatedQuery(
    api.brainCampaigns.listCampaigns, {}, { initialNumItems: 20 }
  );
  const createCampaign = useMutation(api.brainCampaigns.createCampaign);
  const deleteCampaign = useMutation(api.brainCampaigns.deleteCampaign);
  useScheduledPosts();
  const { isConnected: hasAnyNotification } = useNotificationIntegration();

  // =================================================================
  // HANDLERS
  // =================================================================

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!theme.trim()) {
      toast.error("Por favor, insira um tema");
      inputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      // Gera o conteúdo via IA
      const rawData = await generateIdeas({ theme, plan: userPlan });

      // Normaliza os dados para garantir compatibilidade
      const normalizedData = normalizeBrainResults(rawData as Partial<BrainResults>);
      setResults(normalizedData);

      // Extrai target audience com fallbacks
      const targetAudience = normalizedData.target_audience_suggestion ||
        normalizedData.analysis?.target_audience_profile?.demographics ||
        "Público interessado no nicho";

      // Salva a campanha no banco
      const campaignId = await createCampaign({
        theme,
        themeSummary: normalizedData.theme_summary,
        targetAudience,
        viralStrategy: {
          best_times: normalizedData.viral_strategy.best_times,
          hashtag_strategy: normalizedData.viral_strategy.hashtag_strategy,
          engagement_hacks: normalizedData.viral_strategy.engagement_hacks,
        },
        contentPack: JSON.stringify(normalizedData.content_pack),
      });

      // Atualiza estado da campanha atual
      setCurrentCampaign({
        _id: campaignId,
        _creationTime: Date.now(),
        theme,
        themeSummary: normalizedData.theme_summary,
        targetAudience,
        viralStrategy: normalizedData.viral_strategy,
        contentPack: JSON.stringify(normalizedData.content_pack),
        createdAt: Date.now()
      });

      setActiveTab("reels");

      // Confetti celebration
      const colors = userPlan === 'ultra'
        ? ['#8B5CF6', '#EC4899', '#F59E0B', '#FFD700']
        : ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

      confetti({
        particleCount: userPlan === 'ultra' ? 300 : 150,
        spread: 100,
        origin: { y: 0.6 },
        colors,
      });

      if (userPlan === 'ultra') {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors,
          });
          confetti({
            particleCount: 100,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors,
          });
        }, 250);
      }

      toast.success(
        userPlan === 'ultra'
          ? "⚡ Roteiro ULTRA VIRAL Gerado!"
          : "🎉 Campanha gerada com sucesso!"
      );
    } catch (error) {
      console.error("Erro ao gerar conteúdo:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao gerar conteúdo");
    } finally {
      setIsLoading(false);
    }
  }, [theme, userPlan, generateIdeas, createCampaign]);

  const handleGenerateNew = () => {
    setResults(null);
    setTheme("");
    setCurrentCampaign(null);
    setActiveTab("reels");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleScheduleContent = (contentType: ContentType, index: number) => {
    if (!currentCampaign || !results) return;

    const key = contentType === "image_post"
      ? "image_posts"
      : contentType === "story_sequence"
        ? "story_sequences"
        : `${contentType}s` as "reels" | "carousels";

    const content = results.content_pack[key]?.[index];
    if (!content) return;

    let caption = "";
    let hashtags: string[] = [];

    if (contentType === "reel") {
      const reel = content as BrainResults["content_pack"]["reels"][0];
      const hook = reel.hook_text || reel.hook || "";
      const points = reel.key_messages || reel.main_points || [];
      const cta = reel.cta_text || reel.cta || "";
      caption = reel.posting_caption || `${reel.title}\n\n${hook}\n\n${points.join('\n')}\n\n${cta}`;
      hashtags = reel.hashtags || [];
    } else if (contentType === "carousel") {
      const carousel = content as BrainResults["content_pack"]["carousels"][0];
      const ctaSlide = carousel.final_cta_slide || carousel.cta_slide || "";
      const slidesText = carousel.slides.map(s => s.body_text || s.content || "").filter(Boolean).join('\n\n');
      caption = carousel.posting_caption || `${carousel.title}\n\n${slidesText}\n\n${ctaSlide}`;
      hashtags = carousel.hashtags || [];
    } else if (contentType === "image_post") {
      const post = content as BrainResults["content_pack"]["image_posts"][0];
      caption = post.full_caption || post.caption || "";
      hashtags = post.hashtags || [];
    } else if (contentType === "story_sequence") {
      const story = content as BrainResults["content_pack"]["story_sequences"][0];
      const slidesText = story.slides.map(s => s.content || s.main_text || "").filter(Boolean).join('\n');
      caption = `${story.theme}\n\n${slidesText}`;
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
    try {
      const parsedContent = JSON.parse(campaign.contentPack);

      const normalizedResults: BrainResults = {
        theme_summary: campaign.themeSummary,
        target_audience_suggestion: campaign.targetAudience,
        content_pack: parsedContent,
        viral_strategy: normalizeViralStrategy(campaign.viralStrategy),
      };

      setResults(normalizedResults);
      setTheme(campaign.theme);
      setCurrentCampaign(campaign);
      setMainView("generator");
      setIsHistorySidebarOpen(false);
      toast.success("Campanha carregada!");
    } catch (error) {
      console.error("Erro ao carregar campanha:", error);
      toast.error("Erro ao carregar campanha");
    }
  };

  const handleCampaignDelete = async (id: Id<"brainCampaigns">) => {
    try {
      await deleteCampaign({ campaignId: id });

      // Se a campanha deletada é a atual, limpa o estado
      if (currentCampaign?._id === id) {
        setResults(null);
        setCurrentCampaign(null);
        setTheme("");
      }

      toast.success("Campanha excluída!");
    } catch (error) {
      console.error("Erro ao excluir campanha:", error);
      toast.error("Erro ao excluir");
    }
  };

  // =================================================================
  // COMPUTED
  // =================================================================

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

  const filteredCampaigns = campaigns?.filter(c =>
    c.theme.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-50/30 via-pink-50/30 to-orange-50/30 dark:from-gray-950 dark:to-black pb-24 sm:pb-0">
      {/* HEADER */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-purple-200/50 dark:border-white/10 shadow-lg"
      >
        <div className="container px-3 sm:px-4">
          <div className="flex items-center justify-between gap-2 py-3">
            {/* Logo */}
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="font-black text-xl sm:text-2xl truncate">
                <span className={cn(
                  "bg-clip-text text-transparent bg-gradient-to-r",
                  userPlan === 'ultra'
                    ? "from-purple-600 via-pink-500 to-orange-500"
                    : "from-purple-600 via-pink-600 to-orange-600"
                )}>
                  FreelinnkBrain
                </span>
              </h1>

              {userPlan === 'ultra' ? (
                <Badge className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white text-[10px] px-2 py-0.5 animate-pulse border-0">
                  <Crown className="w-3 h-3 mr-1 fill-white" />
                  ULTRA
                </Badge>
              ) : (
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] px-2 py-0.5">
                  <Zap className="w-3 h-3 mr-1" />
                  PRO
                </Badge>
              )}
            </div>

            {/* Desktop Tabs */}
            <div className="hidden lg:flex items-center gap-2">
              <Tabs value={mainView} className="w-auto">
                <TabsList className="bg-gray-100 dark:bg-gray-800/50 h-10">
                  <TabsTrigger
                    value="generator"
                    onClick={() => setMainView("generator")}
                    className="text-sm data-[state=active]:bg-purple-600 data-[state=active]:text-white px-4"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerador
                  </TabsTrigger>
                  <TabsTrigger
                    value="planner"
                    onClick={() => setMainView("planner")}
                    className="text-sm data-[state=active]:bg-purple-600 data-[state=active]:text-white px-4"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Calendário
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={hasAnyNotification ? "default" : "outline"}
                      size="icon"
                      onClick={() => setIsSettingsOpen(true)}
                      className={cn(
                        "h-9 w-9",
                        hasAnyNotification && "bg-green-600 hover:bg-green-700"
                      )}
                    >
                      {hasAnyNotification ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {hasAnyNotification ? "Notificações Ativas" : "Configurar Notificações"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsHistorySidebarOpen(true)}
                className="h-9 px-3"
              >
                <Clock className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline text-sm font-medium">Histórico</span>
              </Button>

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden h-9 w-9">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px]">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="grid gap-3 mt-6">
                    <Button
                      variant={mainView === "generator" ? "default" : "outline"}
                      className="justify-start w-full"
                      onClick={() => { setMainView("generator"); }}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Gerador
                    </Button>
                    <Button
                      variant={mainView === "planner" ? "default" : "outline"}
                      className="justify-start w-full"
                      onClick={() => { setMainView("planner"); }}
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

      {/* SIDEBAR HISTÓRICO */}
      <Sheet open={isHistorySidebarOpen} onOpenChange={setIsHistorySidebarOpen}>
        <SheetContent
          side="right"
          className="w-full sm:w-[420px] max-w-full p-0 flex flex-col h-full border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
        >
          {/* Header Fixo */}
          <SheetHeader className="px-4 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 bg-white dark:bg-gray-950">
            <SheetTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Histórico de Campanhas
            </SheetTitle>
          </SheetHeader>

          {/* Busca Fixa */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar campanha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 bg-white dark:bg-black/50"
              />
            </div>
          </div>

          {/* Lista com Scroll */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                {campaignsStatus === "LoadingFirstPage" ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                    <p className="text-sm text-muted-foreground mt-2">Carregando...</p>
                  </div>
                ) : filteredCampaigns.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium text-gray-600">
                      {searchTerm ? "Nenhuma campanha encontrada" : "Nenhuma campanha ainda"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchTerm ? "Tente outro termo de busca" : "Gere sua primeira campanha!"}
                    </p>
                  </div>
                ) : (
                  <>
                    {filteredCampaigns.map((campaign) => (
                      <motion.div
                        key={campaign._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all overflow-hidden shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-stretch">
                          {/* Conteúdo Principal */}
                          <button
                            onClick={() => handleCampaignSelect(campaign as unknown as BrainCampaign)}
                            className="flex-1 flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors min-w-0"
                          >
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
                              <Brain className="w-4 h-4 text-purple-600" />
                            </div>

                            <div className="flex-1 min-w-0 overflow-hidden">
                              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                                {campaign.theme}
                              </p>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {new Date(campaign.createdAt).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </button>

                          {/* Botão de Excluir */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCampaignDelete(campaign._id);
                            }}
                            className="flex-shrink-0 w-12 flex items-center justify-center border-l border-gray-100 dark:border-gray-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 transition-colors"
                            title="Excluir campanha"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}

                    {campaignsStatus === "CanLoadMore" && !searchTerm && (
                      <Button
                        variant="ghost"
                        className="w-full mt-4"
                        onClick={() => loadMoreCampaigns(10)}
                      >
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Carregar mais
                      </Button>
                    )}

                    <div className="h-4" />
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* MODALS */}
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
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* CONTEÚDO PRINCIPAL */}
      <div className="container px-2 sm:px-4 py-4 sm:py-6">
        <AnimatePresence mode="wait">
          {mainView === "generator" && (
            <motion.div
              key="generator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {isLoading ? (
                userPlan === 'ultra' ? <LoadingSpinnerUltra /> : <LoadingSpinnerPro />
              ) : results && currentCampaign ? (
                <div className="space-y-4">
                  {/* Stats Card */}
                  <ViralStatsCard results={results} userPlan={userPlan} />

                  {/* Botão Nova Campanha */}
                  <div className="flex justify-end mb-4">
                    <Button onClick={handleGenerateNew} variant="outline" size="sm">
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      Nova Campanha
                    </Button>
                  </div>

                  {/* Tabs Desktop */}
                  <div className="hidden sm:block">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="w-full justify-start bg-gray-100 dark:bg-gray-800/50 p-1 h-auto flex-wrap gap-1">
                        <TabsTrigger
                          value="reels"
                          className="flex-1 min-w-[80px] py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 text-xs sm:text-sm"
                        >
                          <Video className="w-4 h-4 mr-1 sm:mr-2" />
                          Reels ({contentCounts?.reels})
                        </TabsTrigger>
                        <TabsTrigger
                          value="carousels"
                          className="flex-1 min-w-[80px] py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 text-xs sm:text-sm"
                        >
                          <Layers className="w-4 h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Carrosséis</span>
                          <span className="sm:hidden">Carr.</span> ({contentCounts?.carousels})
                        </TabsTrigger>
                        <TabsTrigger
                          value="image_posts"
                          className="flex-1 min-w-[80px] py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 text-xs sm:text-sm"
                        >
                          <Camera className="w-4 h-4 mr-1 sm:mr-2" />
                          Posts ({contentCounts?.image_posts})
                        </TabsTrigger>
                        <TabsTrigger
                          value="story_sequences"
                          className="flex-1 min-w-[80px] py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 text-xs sm:text-sm"
                        >
                          <MessageSquare className="w-4 h-4 mr-1 sm:mr-2" />
                          Stories ({contentCounts?.story_sequences})
                        </TabsTrigger>
                      </TabsList>

                      <div className="mt-6 space-y-4">
                        <TabsContent value="reels" className="space-y-4 mt-0">
                          {results.content_pack?.reels?.map((reel, i) => (
                            userPlan === 'ultra' ? (
                              <ReelCardUltra key={i} reel={reel} index={i} onSchedule={() => handleScheduleContent("reel", i)} />
                            ) : (
                              <ReelCardPro key={i} reel={reel} index={i} onSchedule={() => handleScheduleContent("reel", i)} />
                            )
                          ))}
                          {(!results.content_pack?.reels || results.content_pack.reels.length === 0) && (
                            <EmptyState type="reels" />
                          )}
                        </TabsContent>
                        <TabsContent value="carousels" className="space-y-4 mt-0">
                          {results.content_pack?.carousels?.map((carousel, i) => (
                            <CarouselCard key={i} carousel={carousel} index={i} onSchedule={() => handleScheduleContent("carousel", i)} />
                          ))}
                          {(!results.content_pack?.carousels || results.content_pack.carousels.length === 0) && (
                            <EmptyState type="carousels" />
                          )}
                        </TabsContent>
                        <TabsContent value="image_posts" className="space-y-4 mt-0">
                          {results.content_pack?.image_posts?.map((post, i) => (
                            <ImagePostCard key={i} post={post} index={i} onSchedule={() => handleScheduleContent("image_post", i)} />
                          ))}
                          {(!results.content_pack?.image_posts || results.content_pack.image_posts.length === 0) && (
                            <EmptyState type="posts" />
                          )}
                        </TabsContent>
                        <TabsContent value="story_sequences" className="space-y-4 mt-0">
                          {results.content_pack?.story_sequences?.map((story, i) => (
                            <StoryCard key={i} story={story} index={i} onSchedule={() => handleScheduleContent("story_sequence", i)} />
                          ))}
                          {(!results.content_pack?.story_sequences || results.content_pack.story_sequences.length === 0) && (
                            <EmptyState type="stories" />
                          )}
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>

                  {/* Conteúdo Mobile */}
                  <div className="sm:hidden space-y-4">
                    <AnimatePresence mode="wait">
                      {activeTab === "reels" && results.content_pack?.reels?.map((reel, i) => (
                        <motion.div
                          key={`reel-${i}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          {userPlan === 'ultra' ? (
                            <ReelCardUltra reel={reel} index={i} onSchedule={() => handleScheduleContent("reel", i)} />
                          ) : (
                            <ReelCardPro reel={reel} index={i} onSchedule={() => handleScheduleContent("reel", i)} />
                          )}
                        </motion.div>
                      ))}
                      {activeTab === "reels" && (!results.content_pack?.reels || results.content_pack.reels.length === 0) && (
                        <EmptyState type="reels" />
                      )}

                      {activeTab === "carousels" && results.content_pack?.carousels?.map((carousel, i) => (
                        <motion.div
                          key={`carousel-${i}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <CarouselCard carousel={carousel} index={i} onSchedule={() => handleScheduleContent("carousel", i)} />
                        </motion.div>
                      ))}
                      {activeTab === "carousels" && (!results.content_pack?.carousels || results.content_pack.carousels.length === 0) && (
                        <EmptyState type="carousels" />
                      )}

                      {activeTab === "image_posts" && results.content_pack?.image_posts?.map((post, i) => (
                        <motion.div
                          key={`post-${i}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <ImagePostCard post={post} index={i} onSchedule={() => handleScheduleContent("image_post", i)} />
                        </motion.div>
                      ))}
                      {activeTab === "image_posts" && (!results.content_pack?.image_posts || results.content_pack.image_posts.length === 0) && (
                        <EmptyState type="posts" />
                      )}

                      {activeTab === "story_sequences" && results.content_pack?.story_sequences?.map((story, i) => (
                        <motion.div
                          key={`story-${i}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <StoryCard story={story} index={i} onSchedule={() => handleScheduleContent("story_sequence", i)} />
                        </motion.div>
                      ))}
                      {activeTab === "story_sequences" && (!results.content_pack?.story_sequences || results.content_pack.story_sequences.length === 0) && (
                        <EmptyState type="stories" />
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <HeroSection
                  userPlan={userPlan}
                  theme={theme}
                  setTheme={setTheme}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  inputRef={inputRef}
                />
              )}
            </motion.div>
          )}

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

      {/* Navegação Mobile Inferior */}
      {results && mainView === "generator" && (
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          contentCounts={contentCounts}
        />
      )}

      {/* Footer */}
      <footer className="mt-16 py-6 border-t bg-white/50 dark:bg-black/20">
        <div className="container text-center px-4">
          <p className="text-sm text-gray-500">
            FreelinnkBrain © {new Date().getFullYear()} • Criado com 💜
          </p>
        </div>
      </footer>
    </div>
  );
}

// =================================================================
// EMPTY STATE COMPONENT
// =================================================================
function EmptyState({ type }: { type: string }) {
  const configs: Record<string, { icon: React.ElementType; text: string }> = {
    reels: { icon: Video, text: "Nenhum reel gerado" },
    carousels: { icon: Layers, text: "Nenhum carrossel gerado" },
    posts: { icon: Camera, text: "Nenhum post gerado" },
    stories: { icon: MessageSquare, text: "Nenhuma sequência de stories gerada" },
  };

  const config = configs[type] || configs.reels;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-muted-foreground">{config.text}</p>
    </motion.div>
  );
}