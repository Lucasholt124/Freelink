"use client";
import { useState, useRef, useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Sparkles, Brain, Video, RefreshCcw, Layers, Camera,
  MessageSquare, Wand2, Calendar, Trash2, Menu,
  Crown, Flame, Clock, Loader2, ChevronDown, Bell,
  CheckCircle2, Search,  Zap, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useMutation, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useContentGeneration, useNotificationIntegration, useScheduledPosts } from "@/app/hooks/useBrain";
import PostScheduleModal from "./brain/PostScheduleModal";
import { BrainResults, ContentType, ScheduleModalData } from "@/app/types/brain";
import { CarouselCard, ImagePostCard, ReelCard, StoryCard } from "./brain/ContentCards";
import SettingsModal from "./brain/SettingsModal";
import CalendarView from "./brain/CalendarView";
import Link from "next/link";

// =================================================================
// COMPONENTES AUXILIARES
// =================================================================
const LoadingSpinner = ({ userPlan }: { userPlan: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 px-4 text-center">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <Loader2 className={cn("w-10 h-10 sm:w-12 sm:h-12", userPlan === 'ultra' ? "text-purple-500" : "text-blue-500")} />
    </motion.div>
    <p className="text-base sm:text-lg text-muted-foreground animate-pulse font-medium">
      {userPlan === 'ultra'
        ? "⚡ Acessando o Cérebro Neural Ultra (Modo Diretor)..."
        : "Gerando ideias criativas..."}
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
      if (progress === 1) { clearInterval(timer); }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{displayValue}</span>;
};

interface BrainCampaign {
  _id: Id<"brainCampaigns">;
  _creationTime: number;
  theme: string;
  themeSummary: string;
  targetAudience: string;
  viralStrategy: {
    best_times: string[];
    hashtag_strategy: string;
    engagement_hacks: string[];
  };
  contentPack: string;
  createdAt: number;
}

interface FreelinnkBrainToolProps {
  userPlan: "pro" | "ultra";
}

export default function FreelinnkBrainTool({ userPlan }: FreelinnkBrainToolProps) {
  const [theme, setTheme] = useState("");
  const [results, setResults] = useState<BrainResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("reels");
  const [mainView, setMainView] = useState<"generator" | "planner">("generator");
  const [showViralMode] = useState(true);

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
      const data = await generateIdeas({
        theme,
        plan: userPlan
      });

      setResults(data);
      const campaignId = await createCampaign({
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

      setCurrentCampaign({
        _id: campaignId,
        _creationTime: Date.now(),
        theme,
        themeSummary: data.theme_summary,
        targetAudience: data.target_audience_suggestion,
        viralStrategy: data.viral_strategy,
        contentPack: JSON.stringify(data.content_pack),
        createdAt: Date.now()
      });

      setActiveTab("reels");

      if (userPlan === 'ultra') {
        toast.success("⚡ Estratégia ULTRA VIRAL Gerada com Sucesso!");
      } else {
        toast.success("Campanha gerada com sucesso! 🎉");
      }

      confetti({
        particleCount: userPlan === 'ultra' ? 250 : 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: userPlan === 'ultra'
          ? ['#8B5CF6', '#F472B6', '#FFD700']
          : ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981']
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
    setCurrentCampaign(null);
    setActiveTab("reels");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleExampleClick = (exampleTheme: string) => {
    setTheme(exampleTheme);
    setTimeout(() => handleSubmit(), 100);
  };

  const handleScheduleContent = (contentType: ContentType, index: number) => {
    if (!currentCampaign || !results) return;
    const key = contentType === "image_post" ? "image_posts" : contentType === "story_sequence" ? "story_sequences" : `${contentType}s` as "reels" | "carousels";
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
    try {
      const parsedContent = JSON.parse(campaign.contentPack);
      setResults({
        theme_summary: campaign.themeSummary,
        target_audience_suggestion: campaign.targetAudience,
        content_pack: parsedContent,
        viral_strategy: campaign.viralStrategy,
      });
      setTheme(campaign.theme);
      setCurrentCampaign(campaign);
      setMainView("generator");
      setIsHistorySidebarOpen(false);
      toast.success("Campanha carregada!");
    } catch {
      toast.error("Erro ao carregar campanha antiga");
    }
  };

  const handleCampaignDelete = async (id: Id<"brainCampaigns">) => {
    try {
      await deleteCampaign({ campaignId: id });
      toast.success("Campanha excluída!");
    } catch {
      toast.error("Erro ao excluir campanha");
    }
  };

  const contentCounts = results ? {
    reels: results.content_pack?.reels?.length ?? 0,
    carousels: results.content_pack?.carousels?.length ?? 0,
    image_posts: results.content_pack?.image_posts?.length ?? 0,
    story_sequences: results.content_pack?.story_sequences?.length ?? 0,
    total: (results.content_pack?.reels?.length ?? 0) + (results.content_pack?.carousels?.length ?? 0) + (results.content_pack?.image_posts?.length ?? 0) + (results.content_pack?.story_sequences?.length ?? 0)
  } : null;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-50/30 via-pink-50/30 to-orange-50/30 dark:from-gray-950 dark:to-black pb-20 sm:pb-0">
      {/* HEADER */}
      <motion.div initial={{ y: -100 }} animate={{ y: 0 }} className="sticky top-0 z-30 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-purple-200/50 dark:border-white/10 shadow-lg">
        <div className="container px-2 sm:px-4">
          <div className="flex items-center justify-between gap-2 py-2 sm:py-3">
            {/* Logo e Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 min-w-0 flex-1">
              <h1 className="font-black text-lg sm:text-2xl lg:text-3xl truncate leading-tight">
                <span className={cn(
                  "bg-clip-text text-transparent",
                  userPlan === 'ultra' ? "bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500" : "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600"
                )}>
                  FreelinnkBrain
                </span>
              </h1>
              <div className="flex items-center gap-1.5">
                {userPlan === 'ultra' ? (
                  <Badge className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white shadow-lg text-[0.6rem] sm:text-xs px-1.5 py-0.5 animate-pulse border-0 shrink-0">
                    <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 fill-white" />
                    ULTRA
                  </Badge>
                ) : (
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg text-[0.6rem] sm:text-xs px-1.5 py-0.5 shrink-0">
                    <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 fill-yellow-400 text-yellow-400" />
                    PRO
                  </Badge>
                )}
                {showViralMode && (
                  <Badge variant="outline" className="hidden md:flex border-orange-200 bg-orange-50 text-orange-600 text-[0.6rem] sm:text-xs px-1.5 py-0.5 shrink-0">
                    <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                    VIRAL
                  </Badge>
                )}
              </div>
            </div>

            {/* Desktop Tabs */}
            <div className="hidden lg:flex items-center gap-2">
              <Tabs value={mainView} className="w-auto">
                <TabsList className="bg-gray-100 dark:bg-gray-800/50 h-9">
                  <TabsTrigger value="generator" onClick={() => setMainView("generator")} className="text-sm data-[state=active]:bg-purple-600 data-[state=active]:text-white"><Sparkles className="w-3.5 h-3.5 mr-1.5" />Gerador</TabsTrigger>
                  <TabsTrigger value="planner" onClick={() => setMainView("planner")} className="text-sm data-[state=active]:bg-purple-600 data-[state=active]:text-white"><Calendar className="w-3.5 h-3.5 mr-1.5" />Calendário</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Actions Mobile/Desktop */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant={hasAnyNotification ? "default" : "outline"} size="icon" onClick={() => setIsSettingsOpen(true)} className={cn("relative h-8 w-8 sm:h-9 sm:w-9", hasAnyNotification && "bg-green-600 hover:bg-green-700")}>
                      {hasAnyNotification ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>{hasAnyNotification ? "Notificações Ativas" : "Configurar Notificações"}</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button variant="outline" size="sm" onClick={() => setIsHistorySidebarOpen(true)} className="h-8 sm:h-9 px-2 sm:px-3">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline text-sm font-medium">Histórico</span>
              </Button>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden h-8 w-8 sm:h-9 sm:w-9"><Menu className="w-4 h-4" /></Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] sm:w-[300px]">
                  <SheetHeader><SheetTitle>Menu</SheetTitle></SheetHeader>
                  <div className="grid gap-3 mt-6">
                    <Button variant={mainView === "generator" ? "default" : "outline"} className="justify-start w-full" onClick={() => setMainView("generator")}><Sparkles className="w-4 h-4 mr-2" />Gerador</Button>
                    <Button variant={mainView === "planner" ? "default" : "outline"} className="justify-start w-full" onClick={() => setMainView("planner")}><Calendar className="w-4 h-4 mr-2" />Calendário</Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SIDEBAR HISTÓRICO - CORRIGIDA E MELHORADA */}
      <Sheet open={isHistorySidebarOpen} onOpenChange={setIsHistorySidebarOpen}>
        <SheetContent side="right" className="w-full sm:w-[450px] p-0 flex flex-col h-[100dvh] bg-white dark:bg-gray-950 shadow-2xl z-[100]">
          {/* Header do Sidebar - Removido o botão de X duplicado */}
          <SheetHeader className="px-5 py-4 border-b bg-white dark:bg-gray-950 flex flex-row items-center justify-between space-y-0">
            <SheetTitle className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Histórico de Campanhas
            </SheetTitle>
            {/* O SheetContent do shadcn já renderiza um X no canto direito, não precisamos de outro aqui */}
          </SheetHeader>

          {/* Barra de Busca - Melhorada */}
          <div className="px-5 py-4 bg-gray-50/50 dark:bg-gray-900/50 border-b relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar campanha por tema..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus-visible:ring-purple-500 transition-all"
              />
            </div>
          </div>

          {/* Lista de Campanhas - Layout Refeito */}
          <div className="flex-1 overflow-hidden w-full bg-gray-50/30 dark:bg-gray-950">
            <ScrollArea className="h-full w-full">
              <div className="p-4 space-y-3 pb-24">
                {campaignsStatus === "LoadingFirstPage" ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                    <p className="text-sm text-gray-500">Carregando histórico...</p>
                  </div>
                ) : !campaigns || campaigns.length === 0 ? (
                  <div className="text-center py-20 px-6">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Nenhuma campanha ainda</p>
                    <p className="text-sm text-gray-500 mt-1">Gere sua primeira estratégia para vê-la aqui.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {campaigns.filter(c => c.theme.toLowerCase().includes(searchTerm.toLowerCase())).map((campaign) => (
                        <div
                          key={campaign._id}
                          className="group relative flex items-stretch bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all overflow-hidden"
                        >
                          {/* Área clicável da campanha */}
                          <div
                            onClick={() => handleCampaignSelect(campaign)}
                            className="flex-1 p-3.5 cursor-pointer flex items-start gap-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg shrink-0 flex items-center justify-center h-fit">
                              <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 leading-snug break-words line-clamp-2">
                                {campaign.theme}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[10px] sm:text-xs font-medium text-gray-500 flex items-center bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                                <span className="text-[10px] sm:text-xs text-purple-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                  Abrir <ArrowRight className="w-3 h-3 ml-0.5" />
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Botão de Excluir - Separado e Melhorado */}
                          <div className="border-l border-gray-100 dark:border-gray-800 flex flex-col">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCampaignDelete(campaign._id);
                              }}
                              className="h-full px-4 flex items-center justify-center bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors cursor-pointer active:scale-95"
                              title="Excluir campanha"
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {(campaignsStatus === "CanLoadMore" || campaignsStatus === "LoadingMore") && !searchTerm && (
                      <Button
                        variant="ghost"
                        className="w-full mt-6 py-6 text-sm text-gray-500 border border-dashed border-gray-200"
                        onClick={() => loadMoreCampaigns(10)}
                        disabled={campaignsStatus === "LoadingMore"}
                      >
                        {campaignsStatus === "LoadingMore" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
                        Carregar campanhas antigas
                      </Button>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* MODALS */}
      {scheduleModalData.isOpen && scheduleModalData.campaignId && scheduleModalData.contentData && (
        <PostScheduleModal isOpen={scheduleModalData.isOpen} onClose={() => setScheduleModalData({ isOpen: false })} campaignId={scheduleModalData.campaignId} contentType={scheduleModalData.contentType!} contentData={scheduleModalData.contentData} initialCaption={scheduleModalData.initialCaption || ""} initialHashtags={scheduleModalData.initialHashtags || []} />
      )}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* CONTEÚDO PRINCIPAL */}
      <div className="container px-2 sm:px-4 py-4 sm:py-6 md:py-8">
        <AnimatePresence mode="wait">
          {mainView === "generator" && (
            <motion.div key="generator" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4 sm:space-y-6">
              {isLoading ? (
                <LoadingSpinner userPlan={userPlan} />
              ) : results && currentCampaign ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* CARD DE RESULTADOS */}
                  <Card className="shadow-lg p-3 sm:p-6 border-t-4 border-purple-500 overflow-hidden">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                      <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Campanha Pronta!</h2>
                        <p className="text-sm text-gray-500 font-medium mt-1 truncate">{theme}</p>
                      </div>
                      <Button onClick={handleGenerateNew} variant="outline" size="sm" className="w-full md:w-auto hover:bg-purple-50"><RefreshCcw className="mr-2 w-4 h-4" /> Nova Campanha</Button>
                    </div>

                    {contentCounts && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 mb-6">
                        <div className="col-span-2 sm:col-span-1 bg-gray-50 dark:bg-gray-800 p-2 sm:p-3 rounded-lg text-center border">
                          <p className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold">Total</p>
                          <p className="text-xl sm:text-2xl font-black text-purple-600"><AnimatedCounter value={contentCounts.total} /></p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 sm:p-3 rounded-lg text-center border">
                          <Video className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                          <p className="text-lg font-bold"><AnimatedCounter value={contentCounts.reels} /></p>
                          <p className="text-[10px] text-gray-400 sm:hidden">Reels</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 sm:p-3 rounded-lg text-center border">
                          <Layers className="w-4 h-4 mx-auto text-pink-500 mb-1" />
                          <p className="text-lg font-bold"><AnimatedCounter value={contentCounts.carousels} /></p>
                          <p className="text-[10px] text-gray-400 sm:hidden">Carrossel</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 sm:p-3 rounded-lg text-center border">
                          <Camera className="w-4 h-4 mx-auto text-green-500 mb-1" />
                          <p className="text-lg font-bold"><AnimatedCounter value={contentCounts.image_posts} /></p>
                          <p className="text-[10px] text-gray-400 sm:hidden">Posts</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-2 sm:p-3 rounded-lg text-center border">
                          <MessageSquare className="w-4 h-4 mx-auto text-yellow-500 mb-1" />
                          <p className="text-lg font-bold"><AnimatedCounter value={contentCounts.story_sequences} /></p>
                          <p className="text-[10px] text-gray-400 sm:hidden">Stories</p>
                        </div>
                      </div>
                    )}

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <ScrollArea className="w-full whitespace-nowrap pb-2">
                        <TabsList className="w-full sm:w-auto inline-flex h-auto p-1 bg-gray-100 dark:bg-gray-800/50">
                          <TabsTrigger value="reels" className="flex-1 min-w-[80px] py-2 text-xs md:text-sm"><Video className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />Reels</TabsTrigger>
                          <TabsTrigger value="carousels" className="flex-1 min-w-[90px] py-2 text-xs md:text-sm"><Layers className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />Carrossel</TabsTrigger>
                          <TabsTrigger value="image_posts" className="flex-1 min-w-[80px] py-2 text-xs md:text-sm"><Camera className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />Posts</TabsTrigger>
                          <TabsTrigger value="story_sequences" className="flex-1 min-w-[80px] py-2 text-xs md:text-sm"><MessageSquare className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />Stories</TabsTrigger>
                        </TabsList>
                      </ScrollArea>

                      <div className="mt-4 sm:mt-6 space-y-4">
                        <TabsContent value="reels" className="space-y-4 mt-0">
                          {results.content_pack?.reels?.map((reel, i) => (
                            <ReelCard key={i} reel={reel} index={i} onSchedule={() => handleScheduleContent("reel", i)} />
                          ))}
                        </TabsContent>
                        <TabsContent value="carousels" className="space-y-4 mt-0">
                          {results.content_pack?.carousels?.map((carousel, i) => (
                            <CarouselCard key={i} carousel={carousel} index={i} onSchedule={() => handleScheduleContent("carousel", i)} />
                          ))}
                        </TabsContent>
                        <TabsContent value="image_posts" className="space-y-4 mt-0">
                          {results.content_pack?.image_posts?.map((post, i) => (
                            <ImagePostCard key={i} post={post} index={i} onSchedule={() => handleScheduleContent("image_post", i)} />
                          ))}
                        </TabsContent>
                        <TabsContent value="story_sequences" className="space-y-4 mt-0">
                          {results.content_pack?.story_sequences?.map((story, i) => (
                            <StoryCard key={i} story={story} index={i} onSchedule={() => handleScheduleContent("story_sequence", i)} />
                          ))}
                        </TabsContent>
                      </div>
                    </Tabs>
                  </Card>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto space-y-4 sm:space-y-8 mt-2 sm:mt-8">
                  <Card className={cn("shadow-xl sm:shadow-2xl border-2 p-4 sm:p-8 md:p-12 transition-all duration-500", userPlan === 'ultra' ? "border-purple-500/50 shadow-purple-500/10" : "border-gray-200")}>
                    <div className="text-center space-y-4 sm:space-y-6">
                      <Badge variant="secondary" className="px-3 py-1 sm:px-4 sm:py-1.5 inline-flex items-center">
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-yellow-500" />
                        <span className="text-[10px] sm:text-sm uppercase tracking-wide">Sua Máquina de Conteúdo</span>
                      </Badge>
                      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight sm:leading-tight">
                        Freelinnk<span className={cn("bg-clip-text text-transparent bg-gradient-to-r", userPlan === 'ultra' ? "from-purple-600 via-pink-500 to-yellow-500" : "from-blue-600 via-purple-600 to-pink-600")}>Brain</span>
                      </h1>
                      <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2 leading-relaxed">
                        {userPlan === 'ultra'
                          ? "Modo ULTRA ativado: Roteiros frame-a-frame, direção de câmera e neuro-marketing."
                          : "Transforme um tema em uma campanha completa de conteúdo em 30 segundos."}
                      </p>
                    </div>
                    <form onSubmit={handleSubmit} className="mt-6 sm:mt-10 space-y-4 sm:space-y-6">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm sm:text-base font-semibold">
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
                      </div>

                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-500 font-medium w-full sm:w-auto text-center mb-1 sm:mb-0">Ou tente um exemplo:</span>
                        <Button type="button" size="sm" variant="outline" className="text-xs h-8" onClick={() => handleExampleClick("Como ganhar seguidores no TikTok")}>Ganhar seguidores</Button>
                        <Button type="button" size="sm" variant="outline" className="text-xs h-8" onClick={() => handleExampleClick("Ideias de conteúdo para nutricionistas")}>Nutrição</Button>
                        <Button type="button" size="sm" variant="outline" className="text-xs h-8" onClick={() => handleExampleClick("Como investir em ações do zero")}>Investimentos</Button>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className={cn(
                          "w-full h-12 sm:h-14 text-sm sm:text-lg font-bold transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99]",
                          userPlan === 'ultra'
                            ? "bg-gradient-to-r from-purple-700 via-pink-600 to-orange-500 hover:shadow-xl hover:shadow-purple-500/20"
                            : "bg-gradient-to-r from-blue-600 to-purple-600"
                        )}
                        disabled={isLoading || !theme.trim()}
                      >
                        {userPlan === 'ultra' ? (
                          <>
                            <Brain className="w-5 h-5 mr-2 animate-pulse" />
                            GERAR ESTRATÉGIA ULTRA VIRAL ⚡
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            Gerar Campanha Completa
                          </>
                        )}
                      </Button>

                      {userPlan === 'pro' && (
                        <div className="text-center bg-purple-50 p-2 sm:p-3 rounded-lg border border-purple-100">
                          <p className="text-xs sm:text-sm text-purple-800">
                            💡 Quer roteiros <strong>frame-a-frame</strong> com direção de câmera e psicologia?
                            <Link href="/dashboard/billing" className="font-bold underline ml-1">Vire Ultra</Link>
                          </p>
                        </div>
                      )}
                    </form>
                  </Card>
                </div>
              )}
            </motion.div>
          )}
          {mainView === "planner" && (
            <motion.div key="planner" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <CalendarView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="mt-8 sm:mt-16 py-6 border-t bg-white/50 dark:bg-black/20">
        <div className="container text-center px-4">
          <p className="text-xs sm:text-sm text-gray-500">FreelinnkBrain © {new Date().getFullYear()} - Criado com 💜</p>
        </div>
      </footer>
    </div>
  );
}