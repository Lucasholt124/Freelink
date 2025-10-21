"use client";

import { useState, useRef, useEffect, Fragment } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import confetti from 'canvas-confetti';
import {
  Sparkles, Copy, Check, Brain, Video, RefreshCcw,
  Layers, Camera, MessageSquare, Wand2, ChevronRight, Download,
  Share2, Bookmark, TrendingUp, Zap, Target, Users, Hash,
  Clock, Eye,  MessageCircle, Send, BarChart3, Palette,
  FileText, Image as ImageIcon, Calendar, Music,
  MoreHorizontal, Trash2, Menu, ChevronLeft,
  Search, FolderOpen,  Crown,
  Flame,
  CheckCircle2, ChevronDown, Activity
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@radix-ui/react-scroll-area";


// =================================================================
// TIPOS DE CONTEÚDO (SINCRONIZADOS COM O NOVO BACKEND)
// =================================================================

interface ReelContent {
  title: string;
  hook: string;
  main_points: string[];
  cta: string;
  visual_suggestion: string;
  audio_suggestion: string;
  viralScore?: number; // Mantido para frontend
  estimatedReach?: string; // Mantido para frontend
}

interface CarouselContent {
  title: string;
  slides: {
    slide_number: number;
    title: string;
    content: string;
  }[];
  cta_slide: string;
  design_tips: string[];
}

interface ImagePostContent {
  idea: string;
  caption: string;
  image_prompt: string;
  hashtags: string[];
  best_time: string;
}

interface StorySequenceContent {
  theme: string;
  slides: {
    slide_number: number;
    type: "Poll" | "Quiz" | "Q&A" | "Link" | "Text";
    content: string;
    options?: string[];
  }[];
  engagement_tips: string[];
}

interface BrainResults {
  theme_summary: string;
  target_audience_suggestion: string;
  content_pack: {
    reels: ReelContent[];
    carousels: CarouselContent[];
    image_posts: ImagePostContent[];
    story_sequences: StorySequenceContent[];
  };
  viral_strategy: { // NOVO PLAYBOOK
    best_times: string[];
    hashtag_strategy: string;
    engagement_hacks: string[];
  };
}

interface SavedCampaign {
  id: string;
  theme: string;
  date: string;
  results: BrainResults;
  favorite?: boolean;
  notes?: string;
  scheduledItems?: ScheduledItem[];
  performance?: {
    views: number;
    engagement: number;
    conversions: number;
  };
}

interface ScheduledItem {
  id: string;
  contentType: "reel" | "carousel" | "image_post" | "story_sequence";
  contentIndex: number;
  date: string;
  time: string;
  posted: boolean;
  platform: string;
  performance?: {
    reach: number;
    engagement: number;
  };
}

// =================================================================
// UTILITÁRIOS DE PERSISTÊNCIA (Mantidos)
// =================================================================

const StorageKeys = {
  CAMPAIGNS: "freelink_brain_campaigns",
  CURRENT_CAMPAIGN: "freelink_brain_current_campaign",
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function saveCampaign(campaign: SavedCampaign): void {
  try {
    const existingCampaignsJSON = localStorage.getItem(StorageKeys.CAMPAIGNS) || "[]";
    const existingCampaigns: SavedCampaign[] = JSON.parse(existingCampaignsJSON);

    const existingIndex = existingCampaigns.findIndex(c => c.id === campaign.id);
    if (existingIndex >= 0) {
      existingCampaigns[existingIndex] = campaign;
    } else {
      existingCampaigns.unshift(campaign);
    }

    localStorage.setItem(StorageKeys.CAMPAIGNS, JSON.stringify(existingCampaigns));
    localStorage.setItem(StorageKeys.CURRENT_CAMPAIGN, JSON.stringify(campaign));

  } catch (error) {
    console.error("Erro ao salvar campanha:", error);
    toast.error("Não foi possível salvar sua campanha. Tente novamente.");
  }
}

function getSavedCampaigns(): SavedCampaign[] {
  try {
    const campaignsJSON = localStorage.getItem(StorageKeys.CAMPAIGNS) || "[]";
    return JSON.parse(campaignsJSON);
  } catch (error) {
    console.error("Erro ao carregar campanhas:", error);
    return [];
  }
}

function getCurrentCampaign(): SavedCampaign | null {
  try {
    const campaignJSON = localStorage.getItem(StorageKeys.CURRENT_CAMPAIGN);
    return campaignJSON ? JSON.parse(campaignJSON) : null;
  } catch (error) {
    console.error("Erro ao carregar campanha atual:", error);
    return null;
  }
}

function deleteCampaign(id: string): void {
  try {
    const existingCampaignsJSON = localStorage.getItem(StorageKeys.CAMPAIGNS) || "[]";
    const existingCampaigns: SavedCampaign[] = JSON.parse(existingCampaignsJSON);
    const updatedCampaigns = existingCampaigns.filter(c => c.id !== id);
    localStorage.setItem(StorageKeys.CAMPAIGNS, JSON.stringify(updatedCampaigns));

    const currentCampaign = getCurrentCampaign();
    if (currentCampaign && currentCampaign.id === id) {
      localStorage.removeItem(StorageKeys.CURRENT_CAMPAIGN);
    }

  } catch (error) {
    console.error("Erro ao excluir campanha:", error);
  }
}

// =================================================================
// COMPONENTES AUXILIARES (Mantidos e Aprimorados)
// =================================================================

function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{count}</span>;
}

function CopyButton({ textToCopy, className, variant = "ghost" }: {
  textToCopy: string;
  className?: string;
  variant?: "ghost" | "outline" | "default";
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success("Copiado com sucesso! 📋");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleCopy}
            size="icon"
            variant={variant}
            className={cn(
              "h-8 w-8 transition-all",
              copied && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20",
              className
            )}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                >
                  <Check className="w-4 h-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                	exit={{ scale: 0 }}
                >
                  <Copy className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? "Copiado!" : "Copiar conteúdo"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ShareButton({ content, title }: { content: string, title: string }) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ideia de Conteúdo: ${title}`,
          text: content,
        });
      } catch {
        console.log('Compartilhamento cancelado');
      }
    } else {
      navigator.clipboard.writeText(content);
      toast.success("Conteúdo copiado!");
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={handleShare} size="icon" variant="ghost" className="h-8 w-8">
            <Share2 className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Compartilhar</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Spinner de loading (mantido, é excelente)
function EnhancedLoadingSpinner() {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: Brain, text: "Analisando seu tema...", color: "text-blue-500" },
    { icon: Users, text: "Mapeando a persona ideal...", color: "text-purple-500" },
    { icon: Video, text: "Criando roteiros virais...", color: "text-pink-500" },
    { icon: Layers, text: "Estruturando carrosséis...", color: "text-indigo-500" },
    { icon: Sparkles, text: "Finalizando sua campanha...", color: "text-emerald-500" }
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 100);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [steps.length]);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="min-h-[500px] flex items-center justify-center p-6"
    >
      <div className="w-full max-w-md space-y-8">
        <div className="relative">
          <motion.div
            className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <CurrentIcon className={cn("w-16 h-16", steps[currentStep].color)} />
            </motion.div>
          </motion.div>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FreelinkBrain está criando...
          </h3>

          <AnimatePresence mode="wait">
            <motion.p
              key={currentStep}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            	exit={{ y: -20, opacity: 0 }}
            	className="text-center text-muted-foreground"
            >
              {steps[currentStep].text}
            </motion.p>
          </AnimatePresence>

          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-center text-xs text-muted-foreground">
              {progress}% completo
            </p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className={cn(
                "h-1 rounded-full bg-muted transition-colors duration-500",
                i <= currentStep && "bg-primary"
              )}
            	initial={{ scaleX: 0 }}
            	animate={{ scaleX: i <= currentStep ? 1 : 0 }}
            	transition={{ duration: 0.5, delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// =================================================================
// COMPONENTES DE CONTEÚDO (APRIMORADOS COM NOVOS DADOS)
// =================================================================

const EnhancedReelCard = ({
  reel,
  index,
  onSchedule
}: {
  reel: ReelContent;
  index: number;
  onSchedule?: (type: "reel", index: number) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const viralScore = reel.viralScore || Math.floor(Math.random() * 30) + 70;
  const estimatedReach = reel.estimatedReach || `${Math.floor(Math.random() * 50) + 10}k-${Math.floor(Math.random() * 100) + 50}k`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-500/50">
        <div className="h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />

        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md">
                  <Video className="w-3.5 h-3.5 mr-1.5" />
                  Reel #{index + 1}
                </Badge>
                {viralScore > 85 && (
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white animate-pulse shadow-md">
                    <Flame className="w-3 h-3 mr-1" />
                    POTENCIAL VIRAL
                  </Badge>
                )}
                {isSaved && (
                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-300">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Salvo
                  </Badge>
                )}
              </div>

              <CardTitle className="text-xl line-clamp-2 group-hover:text-purple-600 transition-colors">
                {reel.title}
              </CardTitle>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Activity className="w-4 h-4 text-purple-500" />
                      </TooltipTrigger>
                      <TooltipContent>Potencial de Viralização</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Progress value={viralScore} className="w-full h-2" />
                  <span className="text-sm font-semibold w-12 text-right">{viralScore}%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Alcance Estimado: <span className="font-medium text-foreground">{estimatedReach}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-1">
              <CopyButton
                textToCopy={`🎬 REEL VIRAL\n\n${reel.title}\n\n🪝 GANCHO:\n${reel.hook}\n\n📝 ROTEIRO:\n${reel.main_points.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n📢 CTA:\n${reel.cta}\n\n🎥 VISUAL:\n${reel.visual_suggestion}\n\n🎵 ÁUDIO:\n${reel.audio_suggestion}`}
              />
              <ShareButton content={reel.hook} title={reel.title} />
            	<DropdownMenu>
              	<DropdownMenuTrigger asChild>
              	<Button variant="ghost" size="icon" className="h-8 w-8">
              	<MoreHorizontal className="w-4 h-4" />
              	</Button>
              	</DropdownMenuTrigger>
              	<DropdownMenuContent align="end" className="w-48">
              	<DropdownMenuLabel>Ações Rápidas</DropdownMenuLabel>
              	<DropdownMenuSeparator />
              	<DropdownMenuItem onClick={() => onSchedule?.("reel", index)}>
              	<Calendar className="w-4 h-4 mr-2" />
              	Agendar publicação
              	</DropdownMenuItem>
              	<DropdownMenuItem onClick={() => setIsSaved(!isSaved)}>
              	<Bookmark className="w-4 h-4 mr-2" />
              	{isSaved ? "Remover dos salvos" : "Salvar para depois"}
              	</DropdownMenuItem>
              	<DropdownMenuSeparator />
              	<DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-700">
              	<Trash2 className="w-4 h-4 mr-2" />
              	Excluir
              	</DropdownMenuItem>
              	</DropdownMenuContent>
            	</DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <motion.div
            className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200"
          	whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg shadow-md">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-yellow-800 mb-1 uppercase tracking-wider">
                  Gancho Matador (0-3 segundos)
                </p>
                <p className="text-sm font-semibold text-gray-900">{reel.hook}</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-2">
            <Button
            	variant="ghost"
            	size="sm"
            	onClick={() => setIsExpanded(!isExpanded)}
            	className="w-full justify-between hover:bg-purple-50 text-purple-700"
            >
            	<span className="text-sm font-medium">Ver roteiro completo e estratégia</span>
            	<ChevronDown className={cn(
            	"w-4 h-4 transition-transform",
            	isExpanded && "rotate-180"
            	)} />
            </Button>

            <AnimatePresence>
            	{isExpanded && (
            	<motion.div
            	initial={{ height: 0, opacity: 0 }}
            	animate={{ height: "auto", opacity: 1 }}
            	exit={{ height: 0, opacity: 0 }}
            	className="overflow-hidden"
            	>
            	<div className="pt-2 space-y-4">
            	{/* Roteiro */}
            	<div className="space-y-2">
            	<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            	Sequência do Roteiro
            	</p>
            	{reel.main_points.map((point, idx) => (
            	<motion.div
            	key={idx}
            	initial={{ x: -20, opacity: 0 }}
            	animate={{ x: 0, opacity: 1 }}
            	transition={{ delay: idx * 0.1 }}
            	className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
            	>
            	<div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
            	<span className="text-xs font-bold text-white">{idx + 1}</span>
            	</div>
            	<p className="text-sm flex-1">{point}</p>
            	</motion.div>
            	))}
            	</div>

            	{/* CTA */}
            	<div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            	<div className="flex items-start gap-3">
            	<div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-md">
            	<Send className="w-4 h-4 text-white" />
            	</div>
            	<div className="flex-1">
            	<p className="text-xs font-bold text-blue-800 mb-1">
            	CALL TO ACTION PODEROSO
            	</p>
            	<p className="text-sm font-medium">{reel.cta}</p>
            	</div>
            	</div>
            	</div>
           
            	{/* NOVAS DICAS DE ESTRATÉGIA */}
            	<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            	<div className="p-3 bg-gray-50 rounded-lg border">
            	<p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1.5">
            	<Camera className="w-3 h-3" /> SUGESTÃO VISUAL
            	</p>
            	<p className="text-xs">{reel.visual_suggestion}</p>
            	</div>
            	<div className="p-3 bg-gray-50 rounded-lg border">
            	<p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1.5">
            	<Music className="w-3 h-3" /> SUGESTÃO DE ÁUDIO
            	</p>
            	<p className="text-xs">{reel.audio_suggestion}</p>
            	</div>
            	</div>

            	</div>
            	</motion.div>
            	)}
            </AnimatePresence>
          </div>
        </CardContent>
       
        <CardFooter className="flex items-center justify-between pt-3 border-t bg-gray-50/50">
        	<div className="flex items-center gap-4 text-xs text-muted-foreground">
        	<span className="flex items-center gap-1">
        	<Clock className="w-3 h-3" />
        	7-15s
        	</span>
        	<span className="flex items-center gap-1">
        	<TrendingUp className="w-3 h-3" />
        	Alto Engajamento
        	</span>
        	</div>
        	<div className="flex gap-2">
        	<Button
        	size="sm"
        	variant={isSaved ? "default" : "outline"}
        	className={cn(
        	"h-8 text-xs",
        	isSaved && "bg-gradient-to-r from-purple-600 to-pink-600"
        	)}
        	onClick={() => {
        	setIsSaved(!isSaved);
        	if (!isSaved) {
        	confetti({ particleCount: 50, spread: 50, origin: { y: 0.8 } });
        	toast.success("Reel salvo com sucesso! 🎉");
        	}
        	}}
        	>
        	{isSaved ? (
        	<> <CheckCircle2 className="w-3 h-3 mr-1" /> Salvo </>
        	) : (
        	<> <Bookmark className="w-3 h-3 mr-1" /> Salvar </>
        	)}
        	</Button>
        	<Button
        	size="sm"
        	className="h-8 text-xs bg-gradient-to-r from-blue-600 to-purple-600"
        	onClick={() => onSchedule?.("reel", index)}
        	>
        	<Calendar className="w-3 h-3 mr-1" />
        	Agendar
        	</Button>
        	</div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const CarouselViewer = ({
  carousel,
  index,
  onSchedule
}: {
  carousel: CarouselContent;
  index: number;
  onSchedule?: (type: "carousel", index: number) => void;
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const allSlides = [
    ...carousel.slides,
    {
      slide_number: carousel.slides.length + 1,
      title: "Gostou do conteúdo?",
      content: carousel.cta_slide
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    	transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden border-2 hover:border-purple-500/30 hover:shadow-xl transition-all">
      	<CardHeader>
      	<div className="flex items-start justify-between">
      	<div>
      	<div className="flex items-center gap-2">
      	<Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md">
      	<Layers className="w-3.5 h-3.5 mr-1.5" />
      	Carrossel #{index + 1}
      	</Badge>
      	</div>
      	<CardTitle className="mt-2 text-xl">{carousel.title}</CardTitle>
      	<CardDescription>
      	{allSlides.length} slides
      	</CardDescription>
      	</div>
      	<div className="flex gap-1">
      	<CopyButton
      	textToCopy={`📱 CARROSSEL: ${carousel.title}\n\n${carousel.slides.map(s => `SLIDE ${s.slide_number}: ${s.title}\n${s.content}`).join('\n\n')}\n\nCTA: ${carousel.cta_slide}`}
      	/>
      	<ShareButton content={carousel.title} title={carousel.title} />
      	<Button
      	size="sm"
      	className="h-8 text-xs bg-gradient-to-r from-blue-600 to-purple-600"
      	onClick={() => onSchedule?.("carousel", index)}
      	>
      	<Calendar className="w-3 h-3 mr-1" />
      	Agendar
      	</Button>
      	</div>
      	</div>
      	</CardHeader>
      	<CardContent>
      	<div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-200/50 dark:border-purple-700/50 p-6 flex flex-col items-center justify-center relative overflow-hidden">
      	<AnimatePresence mode="wait">
      	<motion.div
      	key={currentSlide}
      	initial={{ x: 50, opacity: 0 }}
      	animate={{ x: 0, opacity: 1 }}
      	exit={{ x: -50, opacity: 0 }}
      	transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      	className="text-center space-y-4"
      	>
      	<Badge className="bg-purple-500 text-white shadow-md">
      	Slide {allSlides[currentSlide].slide_number}
      	</Badge>
      	<h3 className="text-xl sm:text-2xl font-bold max-w-xs">
      	{allSlides[currentSlide].title}
      	</h3>
      	<p className="text-sm sm:text-base text-muted-foreground max-w-sm">
      	{allSlides[currentSlide].content}
      	</p>
      	</motion.div>
      	</AnimatePresence>
      	</div>
      	<div className="flex justify-between items-center mt-4">
      	<Button
      	size="sm"
      	variant="outline"
      	onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
      	disabled={currentSlide === 0}
      	>
      	<ChevronLeft className="w-4 h-4 mr-1" />
      	Anterior
      	</Button>
      	<div className="flex justify-center gap-1.5 items-center">
      	{allSlides.map((_, i) => (
      	<div
      	key={i}
      	className={cn(
      	"h-2 rounded-full transition-all cursor-pointer",
      	i === currentSlide ? "w-6 bg-purple-500" : "w-2 bg-muted hover:bg-purple-200"
      	)}
      	onClick={() => setCurrentSlide(i)}
      	/>
      	))}
      	</div>
      	<Button
      	size="sm"
      	variant="outline"
      	onClick={() => setCurrentSlide(Math.min(allSlides.length - 1, currentSlide + 1))}
      	disabled={currentSlide === allSlides.length - 1}
      	>
      	Próximo
      	<ChevronRight className="w-4 h-4 ml-1" />
      	</Button>
      	</div>
     
      	{/* DICAS DE DESIGN */}
      	<div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
      	<p className="text-xs font-bold text-indigo-800 mb-2 flex items-center gap-1.5">
      	<Palette className="w-3 h-3" /> DICAS DE DESIGN
      	</p>
      	<ul className="space-y-1 list-disc list-inside">
      	{carousel.design_tips.map((tip, i) => (
      	<li key={i} className="text-xs text-indigo-700">{tip}</li>
      	))}
      	</ul>
      	</div>
     
      	</CardContent>
      </Card>
    </motion.div>
  );
};

const ImagePostCard = ({
  post,
  index,
  onSchedule
}: {
  post: ImagePostContent;
  index: number;
  onSchedule?: (type: "image_post", index: number) => void;
}) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const fullTextToCopy = `📱 POST ÚNICO\n\n${post.idea}\n\n${post.caption}\n\n${post.hashtags.join(' ')}\n\n💡 PROMPT DE IMAGEM:\n${post.image_prompt}\n\n⏰ MELHOR HORÁRIO:\n${post.best_time}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
    	animate={{ opacity: 1, y: 0 }}
    	transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden border-2 hover:border-pink-500/30 hover:shadow-xl transition-all">
      	<CardHeader>
      	<div className="flex items-start justify-between">
      	<div>
      	<div className="flex items-center gap-2">
      	<Badge className="bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-md">
      	<Camera className="w-3.5 h-3.5 mr-1.5" />
      	Post #{index + 1}
      	</Badge>
      	</div>
      	<CardTitle className="mt-2 text-xl">{post.idea}</CardTitle>
      	<CardDescription className="flex items-center gap-1.5">
      	<Clock className="w-3 h-3" /> Melhor horário: <span className="font-medium text-foreground">{post.best_time}</span>
      	</CardDescription>
      	</div>
      	<div className="flex gap-1">
      	<CopyButton textToCopy={fullTextToCopy} />
      	<ShareButton content={post.caption} title={post.idea} />
      	<Button
      	size="sm"
      	className="h-8 text-xs bg-gradient-to-r from-blue-600 to-purple-600"
      	onClick={() => onSchedule?.("image_post", index)}
      	>
      	<Calendar className="w-3 h-3 mr-1" />
      	Agendar
      	</Button>
      	</div>
      	</div>
      	</CardHeader>
      	<CardContent className="space-y-4">
      	<div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl flex items-center justify-center p-8">
      	<div className="text-center space-y-4">
      	<ImageIcon className="w-16 h-16 mx-auto text-pink-500/50" />
      	<p className="text-sm text-muted-foreground">
      	Visualização da imagem será gerada com IA
      	</p>
      	<Button
      	variant="outline"
      	size="sm"
      	onClick={() => setShowPrompt(!showPrompt)}
      	className="gap-2"
      	>
      	<Palette className="w-4 h-4" />
      	{showPrompt ? "Ocultar" : "Ver"} prompt de imagem
      	</Button>
      	</div>
      	</div>

      	<AnimatePresence>
      	{showPrompt && (
      	<motion.div
      	initial={{ height: 0, opacity: 0 }}
      	animate={{ height: "auto", opacity: 1 }}
      	exit={{ height: 0, opacity: 0 }}
      	className="overflow-hidden"
      	>
      	<div className="p-4 bg-gray-900 rounded-lg">
      	<div className="flex items-center justify-between mb-2">
      	<p className="text-xs font-semibold text-gray-400">
      	PROMPT PARA IA DE IMAGEM
      	</p>
      	<CopyButton textToCopy={post.image_prompt} variant="outline" />
      	</div>
      	<p className="text-sm text-gray-200 font-mono leading-relaxed">
      	{post.image_prompt}
      	</p>
      	</div>
      	</motion.div>
      	)}
      	</AnimatePresence>

      	<div className="space-y-3">
      	<p className="text-sm font-semibold">Legenda do Post</p>
      	<div className="p-4 bg-muted/30 rounded-lg max-h-60 overflow-y-auto">
      	<p className="text-sm whitespace-pre-wrap leading-relaxed">
      	{post.caption}
      	</p>
      	</div>
      	</div>
     
      	{/* HASHTAGS */}
      	<div className="space-y-2">
      	<p className="text-sm font-semibold">Hashtags Estratégicas</p>
      	<div className="flex flex-wrap gap-2">
      	{post.hashtags.map((tag) => (
      	<Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
      	))}
      	</div>
      	</div>
     
      	</CardContent>
      </Card>
    </motion.div>
  );
};

const StorySequenceCard = ({
  seq,
  index,
  onSchedule
}: {
  seq: StorySequenceContent;
  index: number;
  onSchedule?: (type: "story_sequence", index: number) => void;
}) => {
  const iconMap = {
    Poll: { icon: BarChart3, color: "text-blue-500", bg: "bg-blue-500/10" },
    Quiz: { icon: Brain, color: "text-purple-500", bg: "bg-purple-500/10" },
    "Q&A": { icon: MessageCircle, color: "text-green-500", bg: "bg-green-500/10" },
    Link: { icon: Share2, color: "text-orange-500", bg: "bg-orange-500/10" },
    Text: { icon: FileText, color: "text-pink-500", bg: "bg-pink-500/10" }
  };
  const fullTextToCopy = `📱 SEQUÊNCIA DE STORIES: ${seq.theme}\n\n${seq.slides.map(s => `${s.type.toUpperCase()}: ${s.content}${s.options ? '\nOpções: ' + s.options.join(' | ') : ''}`).join('\n\n')}\n\n💡 DICAS:\n${seq.engagement_tips.join('\n')}`;

  return (
  	<motion.div
  	initial={{ opacity: 0, y: 20 }}
  	animate={{ opacity: 1, y: 0 }}
  	transition={{ delay: index * 0.1 }}
  	>
  	<Card className="overflow-hidden border-2 hover:border-indigo-500/30 hover:shadow-xl transition-all">
  	<CardHeader>
  	<div className="flex items-start justify-between">
  	<div>
  	<div className="flex items-center gap-2">
  	<Badge className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md">
  	<MessageSquare className="w-3.5 h-3.5 mr-1.5" />
  	Story Sequence #{index + 1}
  	</Badge>
  	</div>
  	<CardTitle className="mt-2 text-xl">{seq.theme}</CardTitle>
  	<CardDescription>
  	{seq.slides.length} stories interativos
  	</CardDescription>
  	</div>
  	<div className="flex gap-1">
  	<CopyButton textToCopy={fullTextToCopy} />
  	<ShareButton content={seq.theme} title={seq.theme} />
  	<Button
  	size="sm"
  	className="h-8 text-xs bg-gradient-to-r from-blue-600 to-purple-600"
  	onClick={() => onSchedule?.("story_sequence", index)}
  	>
  	<Calendar className="w-3 h-3 mr-1" />
  	Agendar
  	</Button>
  	</div>
  	</div>
  	</CardHeader>
  	<CardContent>
  	<div className="space-y-3">
  	{seq.slides.map((slide) => {
  	const slideConfig = iconMap[slide.type];
  	const Icon = slideConfig.icon;

  	return (
  	<div key={slide.slide_number} className="relative">
  	<div className="flex gap-3">
  	<div className="flex flex-col items-center">
  	<div
  	className={cn(
  	"w-10 h-10 rounded-full flex items-center justify-center shadow-md",
  	slideConfig.bg
  	)}
  	>
  	<Icon className={cn("w-5 h-5", slideConfig.color)} />
  	</div>
  	{slide.slide_number < seq.slides.length && (
  	<div className="w-0.5 grow bg-gradient-to-b from-muted to-transparent mt-2" />
  	)}
  	</div>

  	<div className="flex-1 pb-4">
  	<div className="p-4 bg-muted/30 rounded-xl space-y-3 hover:bg-muted/50 transition-colors">
  	<div className="flex items-center justify-between">
  	<div className="flex items-center gap-2">
  	<Badge variant="outline" className="text-xs">
  	Story {slide.slide_number}
  	</Badge>
  	<span className={cn("text-xs font-medium", slideConfig.color)}>
  	{slide.type}
  	</span>
  	</div>
  	<CopyButton textToCopy={slide.content} className="h-6" />
  	</div>

  	<p className="text-sm leading-relaxed">{slide.content}</p>

  	{slide.options && (
  	<div className="flex flex-wrap gap-2 pt-2">
  	{slide.options.map((option, optIdx) => (
  	<Badge
  	key={optIdx}
  	variant="secondary"
  	className="text-xs"
  	>
  	{option}
  	</Badge>
  	))}
  	</div>
  	)}
  	</div>
  	</div>
  	</div>
  	</div>
  	);
  	})}
  	</div>
 
  	{/* DICAS DE ENGAJAMENTO */}
  	<div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
  	<p className="text-xs font-bold text-green-800 mb-2 flex items-center gap-1.5">
  	<Zap className="w-3 h-3" /> HACKS DE ENGAJAMENTO
  	</p>
  	<ul className="space-y-1 list-disc list-inside">
  	{seq.engagement_tips.map((tip, i) => (
  	<li key={i} className="text-xs text-green-700">{tip}</li>
  	))}
  	</ul>
  	</div>
 
  	</CardContent>
  	</Card>
  	</motion.div>
  );
};

// =================================================================
// COMPONENTE PRINCIPAL (Simplificado e Focado)
// =================================================================

export default function FreelinkBrainTool() {
  const [theme, setTheme] = useState("");
  const [results, setResults] = useState<BrainResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("reels");
  const [mainView, setMainView] = useState<"generator" | "planner">("generator"); // Simplificado
  const [savedCampaigns, setSavedCampaigns] = useState<SavedCampaign[]>([]);
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(null);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);
  const [scheduledItems, setScheduledItems] = useState<ScheduledItem[]>([]);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [currentScheduleItem, setCurrentScheduleItem] = useState<{
    type: "reel" | "carousel" | "image_post" | "story_sequence";
    index: number;
  } | null>(null);
  const [showViralMode, setShowViralMode] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const generateIdeas = useAction(api.brain.generateContentIdeas);

  // Carrega campanhas salvas e a campanha atual no início
  useEffect(() => {
    const campaigns = getSavedCampaigns();
    setSavedCampaigns(campaigns);

    const currentCampaign = getCurrentCampaign();
    if (currentCampaign) {
      setResults(currentCampaign.results);
      setTheme(currentCampaign.theme);
      setCurrentCampaignId(currentCampaign.id);
      setScheduledItems(currentCampaign.scheduledItems || []);
    }
  }, []);

  // Função principal para gerar a campanha
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!theme || !theme.trim()) {
      toast.error("Por favor, insira um tema para gerar ideias.");
      inputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const data = await generateIdeas({ theme });
      setResults(data);

      const newCampaign: SavedCampaign = {
        id: generateId(),
        theme,
        date: new Date().toISOString(),
        results: data,
        scheduledItems: []
      };

      setCurrentCampaignId(newCampaign.id);
      saveCampaign(newCampaign); // Salva nova campanha
      setSavedCampaigns(prev => [newCampaign, ...prev]);
      setScheduledItems([]); // Limpa agendamentos
      setActiveTab("reels"); // Reseta para a aba de Reels

      setIsLoading(false);
      toast.success("Sua campanha de conteúdo está pronta! ✨");
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981']
      });
    } catch (error) {
      setIsLoading(false);
      toast.error(error instanceof Error ? error.message : "Erro ao gerar conteúdo");
    }
  };

  // Limpa tudo para uma nova geração
  const handleGenerateNew = () => {
    setResults(null);
    setTheme("");
    setActiveTab("reels");
    setCurrentCampaignId(null);
    setScheduledItems([]);
    localStorage.removeItem(StorageKeys.CURRENT_CAMPAIGN);
    inputRef.current?.focus();
  };

  // Gera a partir de um exemplo
  const handleExampleClick = (exampleTheme: string) => {
    setTheme(exampleTheme);
    setTimeout(() => handleSubmit(), 100); // Pequeno delay para o estado atualizar
  };

  // Carrega uma campanha do histórico
  const handleCampaignSelect = (campaign: SavedCampaign) => {
    setResults(campaign.results);
    setTheme(campaign.theme);
    setCurrentCampaignId(campaign.id);
    setMainView("generator");
    setIsHistorySidebarOpen(false);
    setScheduledItems(campaign.scheduledItems || []);
    localStorage.setItem(StorageKeys.CURRENT_CAMPAIGN, JSON.stringify(campaign));
    toast.success("Campanha carregada com sucesso!");
  };

  // Deleta uma campanha
  const handleCampaignDelete = (id: string) => {
    deleteCampaign(id);
    setSavedCampaigns(prev => prev.filter(c => c.id !== id));

    if (currentCampaignId === id) {
      handleGenerateNew(); // Limpa a view atual se ela foi deletada
    }

  	toast.success("Campanha excluída!");
  };

  // Abre o modal de agendamento
  const handleScheduleContent = (type: "reel" | "carousel" | "image_post" | "story_sequence", index: number) => {
    setCurrentScheduleItem({ type, index });
    setIsScheduleDialogOpen(true);
  };

  // Salva o agendamento
  const handleScheduleSave = (date: string, time: string, platform: string) => {
  	if (!currentScheduleItem || !currentCampaignId) return;

  	const newScheduledItem: ScheduledItem = {
  	id: generateId(),
  	contentType: currentScheduleItem.type,
  	contentIndex: currentScheduleItem.index,
  	date,
  	time,
  	posted: false,
  	platform,
  	};

  	const updatedScheduledItems = [...scheduledItems, newScheduledItem];
  	setScheduledItems(updatedScheduledItems);

  	const campaign = savedCampaigns.find(c => c.id === currentCampaignId);
  	if (campaign) {
  	const updatedCampaign = {
  	...campaign,
  	scheduledItems: updatedScheduledItems,
  	};
  	saveCampaign(updatedCampaign); // Salva a campanha atualizada
  	setSavedCampaigns(prev =>
  	prev.map(c => c.id === currentCampaignId ? updatedCampaign : c)
  	);
  	}

  	setIsScheduleDialogOpen(false);
  	setCurrentScheduleItem(null);
  	toast.success("Conteúdo agendado com sucesso! 🎉");
  	confetti({
  	particleCount: 50,
  	spread: 50,
  	origin: { y: 0.6 },
  	});
  };

  // Contagem de conteúdo para os badges
  const contentCounts = results ? {
    reels: results.content_pack.reels.length,
    carousels: results.content_pack.carousels.length,
    image_posts: results.content_pack.image_posts.length,
    story_sequences: results.content_pack.story_sequences.length,
    total: results.content_pack.reels.length +
           results.content_pack.carousels.length +
          	results.content_pack.image_posts.length +
          	results.content_pack.story_sequences.length
  } : null;

  return (
  	// Fundo gradiente sutil para a página inteira
  	<div className="w-full min-h-screen bg-gradient-to-br from-purple-50/30 via-pink-50/30 to-orange-50/30 dark:from-gray-950 dark:to-black">
 
  	{/* ================= HEADER ================= */}
  	<motion.div
  	initial={{ y: -100 }}
  	animate={{ y: 0 }}
  	className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/80 backdrop-blur-xl border-b border-purple-200/50 dark:border-white/10 shadow-lg"
  	>
  	<div className="container py-3 px-4">
  	<div className="flex flex-col sm:flex-row items-center justify-between gap-3">
  	<div className="flex items-center gap-2 sm:gap-3">
  	<motion.div
  	animate={{ rotate: [0, 5, -5, 0] }}
  	transition={{ repeat: Infinity, duration: 4 }}
  	>
  	<h1 className="font-black text-xl sm:text-2xl md:text-3xl flex items-center">
  	<span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
  	Freelink<span className="text-purple-800 dark:text-purple-300">Brain</span>
  	</span>
  	</h1>
  	</motion.div>

  	<div className="flex items-center gap-2">
  	<Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg text-xs sm:text-sm">
  	<Crown className="w-3 h-3 mr-1" />
  	PRO
  	</Badge>
  	{showViralMode && (
  	<Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white animate-pulse text-xs sm:text-sm">
  	<Flame className="w-3 h-3 mr-1" />
  	MODO VIRAL
  	</Badge>
  	)}
  	</div>
  	</div>

  	{/* Menu Desktop Simplificado */}
  	<div className="hidden lg:flex items-center gap-2">
  	<Tabs value={mainView} className="w-auto">
  	<TabsList className="bg-gray-100 dark:bg-gray-800/50">
  	<TabsTrigger
  	value="generator"
  	onClick={() => setMainView("generator")}
  	className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-md"
  	>
  	<Sparkles className="w-4 h-4 mr-2" />
  	Gerador
  	</TabsTrigger>
  	<TabsTrigger
  	value="planner"
  	onClick={() => setMainView("planner")}
  	disabled={!currentCampaignId} // Desabilitado se não houver campanha
  	className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-md disabled:opacity-50"
  	>
  	<Calendar className="w-4 h-4 mr-2" />
  	Planner
  	</TabsTrigger>
  	</TabsList>
  	</Tabs>
  	</div>

  	{/* Botões de Ação */}
  	<div className="flex items-center gap-2">
  	<TooltipProvider>
  	<Tooltip>
  	<TooltipTrigger asChild>
  	<Button
  	variant="ghost"
  	size="icon"
  	onClick={() => setShowViralMode(!showViralMode)}
  	className={cn(
  	"relative",
  	showViralMode && "text-orange-500"
  	)}
  	>
  	<Flame className="w-5 h-5" />
  	{showViralMode && (
  	<span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
  	)}
  	</Button>
  	</TooltipTrigger>
  	<TooltipContent>
  	<p>{showViralMode ? "Desativar" : "Ativar"} Modo Viral</p>
  	</TooltipContent>
  	</Tooltip>
  	</TooltipProvider>

  	<Button
  	variant="outline"
  	size="sm"
  	onClick={() => setIsHistorySidebarOpen(true)}
  	className="gap-2 dark:bg-gray-800/50 dark:border-white/10 dark:hover:bg-gray-800"
  	>
  	<Clock className="w-4 h-4" />
  	<span className="hidden sm:inline">Histórico</span>
  	</Button>

  	{/* Menu Mobile Simplificado */}
  	<Sheet>
  	<SheetTrigger asChild>
  	<Button variant="outline" size="icon" className="lg:hidden dark:bg-gray-800/50 dark:border-white/10">
  	<Menu className="w-4 h-4" />
  	</Button>
  	</SheetTrigger>
  	<SheetContent side="left" className="w-[300px] dark:bg-gray-900 dark:border-r-white/10">
  	<SheetHeader>
  	<SheetTitle>Menu FreelinkBrain</SheetTitle>
  	</SheetHeader>
  	<div className="grid gap-2 mt-4">
  	<Button
  	variant={mainView === "generator" ? "default" : "outline"}
  	className="justify-start data-[variant=default]:bg-gradient-to-r data-[variant=default]:from-purple-500 data-[variant=default]:to-pink-500"
  	onClick={() => {
  	setMainView("generator");
  	}}
  	>
  	<Sparkles className="w-4 h-4 mr-2" />
  	Gerador de Conteúdo
  	</Button>
  	<Button
  	variant={mainView === "planner" ? "default" : "outline"}
  	className="justify-start data-[variant=default]:bg-gradient-to-r data-[variant=default]:from-purple-500 data-[variant=default]:to-pink-500"
  	onClick={() => {
  	setMainView("planner");
  	}}
  	disabled={!currentCampaignId}
  	>
  	<Calendar className="w-4 h-4 mr-2" />
  	Planejador
  	</Button>
  	</div>
  	</SheetContent>
  	</Sheet>
  	</div>
  	</div>
  	</div>
  	</motion.div>

  	{/* ================= SIDEBAR DE HISTÓRICO ================= */}
  	<Sheet open={isHistorySidebarOpen} onOpenChange={setIsHistorySidebarOpen}>
  	<SheetContent side="right" className="w-full sm:w-[450px] overflow-y-auto dark:bg-gray-900 dark:border-l-white/10">
  	<SheetHeader className="mb-4">
  	<SheetTitle>Histórico de Campanhas</SheetTitle>
  	<SheetDescription>
  	Acesse, recarregue ou exclua suas campanhas anteriores.
  	</SheetDescription>
  	</SheetHeader>

  	<div className="space-y-4">
  	<div className="relative">
  	<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  	<Input
  	placeholder="Buscar campanhas..."
  	className="pl-10"
  	/>
  	</div>

  	<div className="max-h-[70vh] overflow-y-auto">
  	{savedCampaigns.length === 0 ? (
  	<div className="p-6 text-center text-muted-foreground">
  	<FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-20" />
  	<p>Nenhuma campanha encontrada</p>
  	<p className="text-xs">Gere sua primeira campanha!</p>
  	</div>
  	) : (
  	<div className="divide-y dark:divide-white/10">
  	{savedCampaigns.map((campaign) => (
  	<motion.div
  	key={campaign.id}
  	initial={{ opacity: 0, x: 50 }}
  	animate={{ opacity: 1, x: 0 }}
  	transition={{ delay: 0.1 }}
  	className="flex items-center justify-between p-4 hover:bg-muted/50 dark:hover:bg-white/5 transition-colors"
  	>
  	<div
  	className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
  	onClick={() => handleCampaignSelect(campaign)}
  	>
  	<div className="bg-primary/10 dark:bg-primary/20 rounded-md p-2">
  	<Brain className="h-5 w-5 text-primary" />
  	</div>
  	<div className="flex-1 min-w-0">
  	<h4 className="font-medium text-sm truncate">{campaign.theme}</h4>
  	<div className="flex items-center gap-2 mt-1">
  	<p className="text-xs text-muted-foreground">
  	{new Date(campaign.date).toLocaleDateString()}
  	</p>
  	<Badge variant="outline" className="text-[10px] py-0 px-1.5">
  	{campaign.results.content_pack.reels.length +
  	campaign.results.content_pack.carousels.length +
  	campaign.results.content_pack.image_posts.length +
  	campaign.results.content_pack.story_sequences.length
  	} itens
  	</Badge>
  	{campaign.scheduledItems && campaign.scheduledItems.length > 0 && (
  	<Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-blue-500/10 text-blue-600">
  	<Calendar className="h-3 w-3 mr-1" />
  	{campaign.scheduledItems.length}
  	</Badge>
  	)}
  	</div>
  	</div>
  	</div>
  	<DropdownMenu>
  	<DropdownMenuTrigger asChild>
  	<Button variant="ghost" size="icon" className="h-8 w-8">
  	<MoreHorizontal className="h-4 w-4" />
  	</Button>
  	</DropdownMenuTrigger>
  	<DropdownMenuContent align="end">
  	<DropdownMenuItem onClick={() => handleCampaignSelect(campaign)}>
  	<Eye className="h-4 w-4 mr-2" />
  	Visualizar
  	</DropdownMenuItem>
  	<DropdownMenuItem onClick={() => {
  	handleCampaignSelect(campaign);
  	setMainView("planner");
  	}}>
  	<Calendar className="h-4 w-4 mr-2" />
  	Ver agendamentos
  	</DropdownMenuItem>
  	<DropdownMenuSeparator />
  	<DropdownMenuItem
  	className="text-destructive focus:text-destructive focus:bg-red-50"
  	onClick={() => handleCampaignDelete(campaign.id)}
  	>
  	<Trash2 className="h-4 w-4 mr-2" />
  	Excluir
  	</DropdownMenuItem>
  	</DropdownMenuContent>
  	</DropdownMenu>
  	</motion.div>
  	))}
  	</div>
  	)}
  	</div>
  	</div>
  	</SheetContent>
  	</Sheet>

  	{/* ================= MODAL DE AGENDAMENTO ================= */}
  	<Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
  	<DialogContent className="sm:max-w-md dark:bg-gray-900">
  	<DialogHeader>
  	<DialogTitle>Agendar Publicação</DialogTitle>
  	<DialogDescription>
  	Escolha quando este conteúdo será publicado
  	</DialogDescription>
  	</DialogHeader>
  	<div className="grid gap-4 py-4">
  	<div className="grid grid-cols-2 gap-4">
  	<div className="space-y-2">
  	<Label htmlFor="schedule-date">Data</Label>
  	<Input
  	id="schedule-date"
  	type="date"
  	min={new Date().toISOString().split('T')[0]}
  	/>
  	</div>
  	<div className="space-y-2">
  	<Label htmlFor="schedule-time">Horário</Label>
  	<Input id="schedule-time" type="time" />
  	</div>
  	</div>
  	<div className="space-y-2">
  	<Label htmlFor="schedule-platform">Plataforma</Label>
  	<Select defaultValue="instagram">
  <SelectTrigger>
    <SelectValue placeholder="Selecione a plataforma" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="instagram">Instagram</SelectItem>
    <SelectItem value="tiktok">TikTok</SelectItem>
    <SelectItem value="facebook">Facebook</SelectItem>
    <SelectItem value="linkedin">LinkedIn</SelectItem>
  </SelectContent>
</Select>
  	</div>
  	</div>
  	<DialogFooter>
  	<Button variant="ghost" onClick={() => setIsScheduleDialogOpen(false)}>
  	Cancelar
  	</Button>
  	<Button
  	className="bg-gradient-to-r from-blue-600 to-purple-600"
  	onClick={() => {
  	const dateInput = document.getElementById('schedule-date') as HTMLInputElement;
  	const timeInput = document.getElementById('schedule-time') as HTMLInputElement;
  	const platformInput = document.getElementById('schedule-platform')?.querySelector('[role="combobox"] span');
 
  	const date = dateInput?.value;
  	const time = timeInput?.value;
  	const platform = platformInput?.textContent || "instagram";

  	if (!date || !time) {
  	toast.error("Por favor, selecione data e horário.");
  	return;
  	}

  	handleScheduleSave(date, time, platform);
  	}}>
  	Agendar
  	</Button>
  	</DialogFooter>
  	</DialogContent>
  	</Dialog>

  	{/* ================= CONTEÚDO PRINCIPAL (Gerador ou Planner) ================= */}
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
  	<EnhancedLoadingSpinner key="loading" />
  	) : results ? (
 
  	// ================= TELA DE RESULTADOS =================
  	<motion.div
  	key="results"
  	initial={{ opacity: 0 }}
  	animate={{ opacity: 1 }}
  	className="space-y-6"
  	>
  	{/* Header dos Resultados */}
  	<div className="bg-white dark:bg-gray-900/50 backdrop-blur-lg border dark:border-white/10 rounded-xl shadow-lg p-4 sm:p-6">
  	<div className="py-4 space-y-4">
  	<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
  	<div className="flex-1">
  	<div className="flex items-center gap-2">
  	<h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
  	Campanha Pronta! </h2> <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
  	<Check className="w-3 h-3 mr-1" />
  	Salva
  	</Badge>
  	</div>
  	<p className="text-sm text-muted-foreground mt-1">
  	Tema: <span className="font-semibold text-foreground">{theme}</span>
  	</p>
  	</div>
  	<div className="flex gap-2 w-full sm:w-auto">
  	<Button
  	onClick={handleGenerateNew}
  	variant="outline"
  	className="flex-1 sm:flex-initial gap-2"
  	>
  	<RefreshCcw className="w-4 h-4" />
  	Novo Tema
  	</Button>
  	<DropdownMenu>
  	<DropdownMenuTrigger asChild>
  	<Button
  	variant="default"
  	className="flex-1 sm:flex-initial gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
  	>
  	<Download className="w-4 h-4" />
  	Exportar
  	</Button>
  	</DropdownMenuTrigger>
  	<DropdownMenuContent align="end">
  	<DropdownMenuItem>
  	<FileText className="w-4 h-4 mr-2" />
  	Exportar como PDF
  	</DropdownMenuItem>
  	<DropdownMenuItem>
  	<Share2 className="w-4 h-4 mr-2" />
  	Compartilhar link
  	</DropdownMenuItem>
  	<DropdownMenuItem onClick={() => setMainView('planner')}>
  	<Calendar className="w-4 h-4 mr-2" />
  	Agendar todos
  	</DropdownMenuItem>
  	</DropdownMenuContent>
  	</DropdownMenu>
  	</div>
  	</div>
 
  	{/* Stats da Campanha (Responsivo) */}
  	<div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
  	<div className="text-center p-2 bg-muted/50 rounded-lg">
  	<p className="text-2xl font-bold text-primary">
  	<AnimatedCounter value={contentCounts?.total || 0} />
  	</p>
  	<p className="text-xs text-muted-foreground">Total</p>
  	</div>
  	<div className="text-center p-2 bg-muted/50 rounded-lg">
  	<Video className="w-4 h-4 mx-auto mb-1 text-blue-500" />
  	<p className="text-lg font-bold">
  	<AnimatedCounter value={contentCounts?.reels || 0} />
  	</p>
  	</div>
  	<div className="text-center p-2 bg-muted/50 rounded-lg">
  	<Layers className="w-4 h-4 mx-auto mb-1 text-purple-500" />
  	<p className="text-lg font-bold">
  	<AnimatedCounter value={contentCounts?.carousels || 0} />
  	</p>
  	</div>
  	<div className="text-center p-2 bg-muted/50 rounded-lg">
  	<Camera className="w-4 h-4 mx-auto mb-1 text-pink-500" />
  	<p className="text-lg font-bold">
  	<AnimatedCounter value={contentCounts?.image_posts || 0} />
  	</p>
  	</div>
  	<div className="text-center p-2 bg-muted/50 rounded-lg">
  	<MessageSquare className="w-4 h-4 mx-auto mb-1 text-indigo-500" />
  	<p className="text-lg font-bold">
  	<AnimatedCounter value={contentCounts?.story_sequences || 0} />
  	</p>
  	</div>
  	</div>
  	</div>
  	</div>

  	<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  	{/* Coluna de Estratégia */}
  	<div className="lg:col-span-1 space-y-6">
 
  	{/* Card de Estratégia */}
  	<Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
  	<CardHeader className="pb-3">
  	<CardTitle className="flex items-center gap-2 text-lg">
  	<Target className="w-5 h-5 text-blue-500" />
  	Estratégia da Campanha
  	</CardTitle>
  	</CardHeader>
  	<CardContent className="space-y-4">
  	<div className="flex items-start gap-3">
  	<Brain className="w-4 h-4 text-muted-foreground mt-0.5" />
  	<div className="flex-1">
  	<p className="text-xs font-semibold text-muted-foreground uppercase">
  	Ângulo Criativo
  	</p>
  	<p className="text-sm">{results.theme_summary}</p>
  	</div>
  	</div>
  	<Separator className="my-2 h-px bg-muted" />
  	<div className="flex items-start gap-3">
  	<Users className="w-4 h-4 text-muted-foreground mt-0.5" />
  	<div className="flex-1">
  	<p className="text-xs font-semibold text-muted-foreground uppercase">
  	Público-Alvo
  	</p>
  	<p className="text-sm">
  	{results.target_audience_suggestion}
  	</p>
  	</div>
  	</div>
  	</CardContent>
  	</Card>

  	{/* NOVO: Card de Estratégia Viral */}
  	<Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
  	<CardHeader className="pb-3">
  	<CardTitle className="flex items-center gap-2 text-lg">
  	<Zap className="w-5 h-5 text-purple-500" />
  	Playbook de Viralização
  	</CardTitle>
  	</CardHeader>
  	<CardContent className="space-y-4">
  	{/* Melhores Horários */}
  	<div>
  	<p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
  	Melhores Horários para Postar
  	</p>
  	<div className="flex flex-wrap gap-2">
  	{results.viral_strategy.best_times.map(time => (
  	<Badge key={time} variant="secondary" className="bg-purple-100 text-purple-800">
  	<Clock className="w-3 h-3 mr-1.5" />
  	{time}
  	</Badge>
  	))}
  	</div>
  	</div>

  	{/* Estratégia de Hashtag */}
  	<div className="flex items-start gap-3">
  	<Hash className="w-4 h-4 text-muted-foreground mt-0.5" />
  	<div className="flex-1">
  	<p className="text-xs font-semibold text-muted-foreground uppercase">
  	Estratégia de Hashtag
  	</p>
  	<p className="text-sm">{results.viral_strategy.hashtag_strategy}</p>
  	</div>
  	</div>
 
  	{/* Hacks de Engajamento */}
  	<div>
  	<p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
  	Hacks de Engajamento
  	</p>
  	<ul className="space-y-1 list-disc list-inside">
  	{results.viral_strategy.engagement_hacks.map((hack, i) => (
  	<li key={i} className="text-sm">{hack}</li>
  	))}
  	</ul>
  	</div>
  	</CardContent>
  	</Card>
 
  	</div>

  	{/* Coluna de Conteúdo */}
  	<div className="lg:col-span-2">
  	<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  	<div className="overflow-x-auto scrollbar-hide">
  	<TabsList className="inline-flex h-auto p-1 bg-muted/50 dark:bg-gray-800/50">
  	{[
  	{ value: "reels", icon: Video, label: "Reels", color: "data-[state=active]:bg-blue-500" },
  	{ value: "carousels", icon: Layers, label: "Carrosséis", color: "data-[state=active]:bg-purple-500" },
  	{ value: "image_posts", icon: Camera, label: "Posts", color: "data-[state=active]:bg-pink-500" },
  	{ value: "story_sequences", icon: MessageSquare, label: "Stories", color: "data-[state=active]:bg-indigo-500" }
  	].map(({ value, icon: Icon, label, color }) => (
  	<TabsTrigger
  	key={value}
  	value={value}
  	className={cn(
  	"flex-1 sm:flex-initial gap-2 data-[state=active]:text-white transition-all data-[state=active]:shadow-md",
  	color
  	)}
  	>
  	<Icon className="w-4 h-4" />
  	<span className="hidden sm:inline">{label}</span>
  	<Badge variant="secondary" className="ml-1 text-xs data-[state=active]:bg-white/20 data-[state=active]:text-white">
  	{contentCounts?.[value as keyof typeof contentCounts]}
  	</Badge>
  	</TabsTrigger>
  	))}
  	</TabsList>
  	</div>

  	<div className="mt-6 space-y-4">
  	<TabsContent value="reels" className="mt-0 space-y-4">
  	{results.content_pack?.reels?.map((reel, i) => (
  	<EnhancedReelCard
  	key={i}
  	reel={reel}
  	index={i}
  	onSchedule={handleScheduleContent}
  	/>
  	))}
  	</TabsContent>

  	<TabsContent value="carousels" className="mt-0 space-y-4">
  	{results.content_pack?.carousels?.map((carousel, i) => (
  	<CarouselViewer
  	key={i}
  	carousel={carousel}
  	index={i}
  	onSchedule={handleScheduleContent}
  	/>
  	))}
  	</TabsContent>

  	<TabsContent value="image_posts" className="mt-0 space-y-4">
  	{results.content_pack?.image_posts?.map((post, i) => (
  	<ImagePostCard
  	key={i}
  	post={post}
  	index={i}
  	onSchedule={handleScheduleContent}
  	/>
  	))}
  	</TabsContent>

  	<TabsContent value="story_sequences" className="mt-0 space-y-4">
  	{results.content_pack?.story_sequences?.map((seq, i) => (
  	<StorySequenceCard
  	key={i}
  	seq={seq}
  	index={i}
  	onSchedule={handleScheduleContent}
  	/>
  	))}
  	</TabsContent>
  	</div>
  	</Tabs>
  	</div>
  	</div>
  	</motion.div>
 
  	) : (
 
  	// ================= TELA DE BOAS-VINDAS =================
  	<motion.div
  	key="welcome"
  	initial={{ opacity: 0 }}
  	animate={{ opacity: 1 }}
  	className="space-y-8 max-w-4xl mx-auto"
  	>
  	{/* Card Principal */}
  	<div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-1 shadow-2xl">
  	<div className="relative bg-white dark:bg-gray-900 rounded-[calc(1.5rem-4px)] p-8 sm:p-12">
  	<motion.div
  	className="absolute inset-0 opacity-[.03] dark:opacity-[.02]"
  	animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
  	transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
  	style={{
  	backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
  	}}
  	/>

  	<div className="relative text-center space-y-6">
  	<motion.div
  	initial={{ scale: 0 }}
  	animate={{ scale: 1 }}
  	transition={{ type: "spring", duration: 0.8 }}
  	>
  	<Badge variant="secondary" className="gap-2 px-4 py-1.5 shadow-md">
  	<Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
  	Sua Máquina de Conteúdo Pessoal
  	</Badge>
  	</motion.div>

  	<motion.h1
  	className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight"
  	initial={{ y: 20, opacity: 0 }}
  	animate={{ y: 0, opacity: 1 }}
  	transition={{ delay: 0.2 }}
  	>
  	Freelink
  	<span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
  	Brain
  	</span>
  	</motion.h1>

  	<motion.p
  	className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
  	initial={{ y: 20, opacity: 0 }}
  	animate={{ y: 0, opacity: 1 }}
  	transition={{ delay: 0.3 }}
  	>
  	Transforme um simples tema em uma campanha de conteúdo completa em 30 segundos. Roteiros, legendas, estratégia e calendário.
  	</motion.p>
  	</div>
  	</div>
  	</div>

  	{/* Input Principal */}
  	<motion.div
  	initial={{ y: 20, opacity: 0 }}
  	animate={{ y: 0, opacity: 1 }}
  	transition={{ delay: 0.5 }}
  	>
  	<Card className="shadow-2xl border-2 dark:border-white/10">
  	<CardContent className="p-6 sm:p-8">
  	<form onSubmit={handleSubmit} className="space-y-6">
  	<div className="space-y-2">
  	<label htmlFor="theme-input" className="text-sm font-medium flex items-center gap-2">
  	<Wand2 className="w-4 h-4 text-purple-500" />
  	Qual tema você quer dominar hoje?
  	</label>
  	<div className="relative">
  	<Input
  	id="theme-input"
  	ref={inputRef}
  	value={theme}
  	onChange={(e) => setTheme(e.target.value)}
  	placeholder="Ex: Como criar hábitos de estudo eficientes"
  	className="pr-24 py-6 text-base sm:text-lg"
  	maxLength={150}
  	/>
  	<div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
  	{theme.length}/150
  	</div>
  	</div>
  	</div>

  	<Button
  	type="submit"
  	size="lg"
  	className="w-full font-bold text-base sm:text-lg h-12 sm:h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
  	>
  	<Sparkles className="w-5 h-5 mr-2" />
  	Gerar Campanha Completa
  	</Button>
  	</form>

  	<div className="mt-8 space-y-4">
  	<div className="text-center">
  	<p className="text-sm text-muted-foreground mb-3">
  	Precisa de inspiração? Experimente estes temas:
  	</p>
  	<div className="flex flex-wrap gap-2 justify-center">
  	{[
  	"Vendas B2B pelo LinkedIn",
  	"Fórmula de lançamento digital",
  	"Estratégia de conteúdo para e-commerce",
  	"Marketing para serviços locais",
  	].map((example) => (
  	<motion.div
  	key={example}
  	whileHover={{ scale: 1.05 }}
  	whileTap={{ scale: 0.95 }}
  	>
  	<Button
  	type="button"
  	size="sm"
  	variant="outline"
  	onClick={() => handleExampleClick(example)}
  	className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
  	>
  	{example}
  	</Button>
  	</motion.div>
  	))}
  	</div>
  	</div>
  	</div>
  	</CardContent>
  	</Card>
  	</motion.div>
  	</motion.div>
  	)}
  	</motion.div>
  	)}

  	{/* ================= VIEW: PLANNER ================= */}
  	{mainView === "planner" && (
  	<motion.div
  	key="planner"
  	initial={{ opacity: 0 }}
  	animate={{ opacity: 1 }}
  	exit={{ opacity: 0 }}
  	className="space-y-6"
  	>
  	{currentCampaignId && results ? ( // Só mostra se houver campanha ativa
  	<>
  	<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
  	<div>
  	<h2 className="text-2xl font-bold">Planejador de Conteúdo</h2>
  	<p className="text-muted-foreground">Campanha: <span className="font-semibold text-foreground">{theme}</span></p>
  	</div>
  	<Button
  	variant="outline"
  	size="sm"
  	onClick={() => setMainView("generator")}
  	className="gap-2 w-full sm:w-auto"
  	>
  	<ChevronLeft className="w-4 h-4" />
  	Voltar para Campanha
  	</Button>
  	</div>

  	<Card className="w-full shadow-lg">
  	<CardHeader className="pb-3">
  	<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
  	<CardTitle>Calendário de Conteúdo</CardTitle>
  	<div className="flex items-center gap-2">
  	<Button variant="outline" size="sm">
  	<ChevronLeft className="h-4 w-4" />
  	</Button>
  	<span className="text-sm font-medium">
  	{new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
  	</span>
  	<Button variant="outline" size="sm">
  	<ChevronRight className="h-4 w-4" />
  	</Button>
  	</div>
  	</div>
  	</CardHeader>
  	<CardContent>
  	<div className="grid grid-cols-7 gap-1">
  	{["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
  	<div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
  	{day}
  	</div>
  	))}
  	{Array(35).fill(0).map((_, i) => {
  	const date = new Date();
  	const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  	const startingDay = firstDayOfMonth.getDay();
  	const day = i - startingDay + 1;
  	const isCurrentMonth = day > 0 && day <= new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  	const dayString = isCurrentMonth ? `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}` : null;
  	const scheduledForDay = scheduledItems.filter(item => item.date === dayString);

  	return (
  	<div
  	key={i}
  	className={cn(
  	"h-24 sm:h-32 p-1.5 border dark:border-white/10 rounded-md relative overflow-hidden",
  	isCurrentMonth ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-950 text-muted-foreground/50",
  	new Date().getDate() === day && isCurrentMonth && "border-primary/50 bg-primary/5"
  	)}
  	>
  	<div className="text-xs text-right mb-1 font-medium">
  	{isCurrentMonth ? day : ""}
  	</div>
  	{isCurrentMonth && (
  	<ScrollArea className="h-[calc(100%-24px)]">
  	<div className="space-y-1">
  	{scheduledForDay.map(item => {
  	let icon = null;
  	let bgColor = "bg-gray-200";
  	let textColor = "text-gray-800";
  	let itemLabel = '';
  	switch (item.contentType) {
  	case "reel":
  	icon = <Video className="w-3 h-3" />;
  	bgColor = "bg-blue-500/10";
  	textColor = "text-blue-600 dark:text-blue-300";
  	itemLabel = 'Reel';
  	break;
  	case "carousel":
  	icon = <Layers className="w-3 h-3" />;
  	bgColor = "bg-purple-500/10";
  	textColor = "text-purple-600 dark:text-purple-300";
  	itemLabel = 'Carrossel';
  	break;
  	case "image_post":
  	icon = <Camera className="w-3 h-3" />;
  	bgColor = "bg-pink-500/10";
  	textColor = "text-pink-600 dark:text-pink-300";
  	itemLabel = 'Post';
  	break;
  	case "story_sequence":
  	icon = <MessageSquare className="w-3 h-3" />;
  	bgColor = "bg-indigo-500/10";
  	textColor = "text-indigo-600 dark:text-indigo-300";
  	itemLabel = 'Story';
  	break;
  	}
  	return (
  	<motion.div
  	key={item.id}
  	initial={{ opacity: 0, y: 10 }}
  	animate={{ opacity: 1, y: 0 }}
  	className={cn("text-[10px] mb-1 px-1.5 py-1 rounded-md truncate cursor-pointer", bgColor, textColor)}
  	>
  	<span className="flex items-center gap-1 font-medium">
  	{icon} {item.time} - {itemLabel}
  	</span>
  	</motion.div>
  	);
  	})}
  	</div>
  	</ScrollArea>
  	)}
  	</div>
  	);
  	})}
  	</div>
  	</CardContent>
  	</Card>
  	</>
  	) : (
  	// Tela de "Nenhuma Campanha" para o Planner
  	<div className="flex flex-col items-center justify-center min-h-[400px] text-center">
  	<Calendar className="w-16 h-16 text-muted-foreground/20 mb-4" />
  	<h3 className="text-xl font-semibold mb-2">Nenhuma campanha ativa</h3>
  	<p className="text-muted-foreground max-w-md mb-6">
  	Gere ou carregue uma campanha de conteúdo primeiro para visualizar o planejador.
  	</p>
  	<Button
  	onClick={() => setMainView("generator")}
  	className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
  	>
  	<Sparkles className="w-4 h-4" />
  	Gerar Campanha
  	</Button>
  	</div>
  	)}
  	</motion.div>
  	)}
  	</AnimatePresence>
  	</div>
 
  	{/* ================= FOOTER ================= */}
  	<motion.footer
  	initial={{ opacity: 0 }}
  	animate={{ opacity: 1 }}
  	className="mt-20 py-8 border-t dark:border-white/10"
  	>
  	<div className="container px-4 text-center">
  	<p className="text-gray-600 dark:text-gray-400 mb-2">
  	Criado com 💜 para revolucionar o seu conteúdo
  	</p>
  	<p className="text-sm text-gray-500 dark:text-gray-500">
  	© 2025 Freelinnk - A solução completa para criadores.
  	</p>
  	</div>
  	</motion.footer>
  	</div>
  );
}