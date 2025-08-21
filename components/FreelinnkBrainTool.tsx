"use client";

import { useState, useRef, useEffect, Fragment } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Copy, Check, Brain, Video, RefreshCcw,
  Layers, Camera, MessageSquare, Wand2, ChevronRight, Download,
  Share2, Bookmark, TrendingUp, Zap, Target, Users, Hash,
  Clock, Eye, Heart, MessageCircle, Send, BarChart3, Palette,
  FileText, Image as ImageIcon, Mail, Calendar,
  MoreHorizontal, Trash2, Menu, ChevronLeft,
  Search,
  FolderOpen
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

// =================================================================
// 1. TIPOS DE DADOS
// =================================================================

interface ReelContent {
  title: string;
  hook: string;
  main_points: string[];
  cta: string;
}

interface CarouselContent {
  title: string;
  slides: {
    slide_number: number;
    title: string;
    content: string;
  }[];
  cta_slide: string;
}

interface ImagePostContent {
  idea: string;
  caption: string;
  image_prompt: string;
}

interface StorySequenceContent {
  theme: string;
  slides: {
    slide_number: number;
    type: "Poll" | "Quiz" | "Q&A" | "Link" | "Text";
    content: string;
    options?: string[];
  }[];
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
}

// Tipos adicionais para armazenamento local
interface SavedCampaign {
  id: string;
  theme: string;
  date: string;
  results: BrainResults;
  favorite?: boolean;
  notes?: string;
  scheduledItems?: ScheduledItem[];
}

interface ScheduledItem {
  id: string;
  contentType: "reel" | "carousel" | "image_post" | "story_sequence";
  contentIndex: number;
  date: string;
  time: string;
  posted: boolean;
  platform: string;
}

interface OutreachTemplate {
  id: string;
  title: string;
  content: string;
  tags: string[];
  lastUsed?: string;
}
interface OutreachMessageResult {
  title: string;
  content: string;
  businessType: string;
  messageType: string;
}


// =================================================================
// 2. UTILITÁRIOS DE PERSISTÊNCIA & DADOS
// =================================================================

// Funções de localStorage para persistência
const StorageKeys = {
  CAMPAIGNS: "freelink_brain_campaigns",
  CURRENT_CAMPAIGN: "freelink_brain_current_campaign",
  OUTREACH_TEMPLATES: "freelink_brain_outreach_templates"
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function saveCampaign(campaign: SavedCampaign): void {
  try {
    const existingCampaignsJSON = localStorage.getItem(StorageKeys.CAMPAIGNS) || "[]";
    const existingCampaigns: SavedCampaign[] = JSON.parse(existingCampaignsJSON);

    // Se já existe com esse ID, atualize
    const existingIndex = existingCampaigns.findIndex(c => c.id === campaign.id);
    if (existingIndex >= 0) {
      existingCampaigns[existingIndex] = campaign;
    } else {
      existingCampaigns.unshift(campaign); // Adiciona ao início
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

    // Se a campanha atual foi excluída, limpe-a
    const currentCampaign = getCurrentCampaign();
    if (currentCampaign && currentCampaign.id === id) {
      localStorage.removeItem(StorageKeys.CURRENT_CAMPAIGN);
    }

  } catch (error) {
    console.error("Erro ao excluir campanha:", error);
  }
}

// Templates de mensagens padrão
const DEFAULT_OUTREACH_TEMPLATES: OutreachTemplate[] = [
  {
    id: "cold-outreach-1",
    title: "Abordagem Inicial",
    content: `Olá {nome},

Percebi que você trabalha com {nicho} e gostaria de apresentar o FreelinkBrain, uma ferramenta de IA que tem ajudado profissionais como você a economizar até 5 horas por semana na criação de conteúdo para redes sociais.

Gostaria de oferecer um teste gratuito de 3 meses do nosso plano PRO para que você possa avaliar o impacto na sua estratégia de conteúdo.

Posso te mostrar como funciona em uma chamada rápida de 15 minutos?

Abraços,
{seu_nome}`,
    tags: ["frio", "apresentação", "teste gratuito"]
  },
  {
    id: "follow-up-1",
    title: "Follow-up Após Interesse",
    content: `Olá {nome},

Espero que esteja bem! Apenas um lembrete sobre nossa conversa anterior sobre o FreelinkBrain.

Preparei um plano personalizado para seu negócio que inclui:
• Geração automática de 20 ideias de conteúdo por mês
• 5 templates exclusivos para seu nicho
• Suporte prioritário

Quando seria um bom momento para uma demonstração rápida?

Atenciosamente,
{seu_nome}`,
    tags: ["follow-up", "personalizado"]
  },
  {
    id: "agency-pitch",
    title: "Proposta para Agências",
    content: `Olá {nome},

Como prometido, estou enviando a proposta de parceria entre sua agência e o FreelinkBrain.

Oferta exclusiva para agências:
• 30% de desconto em todos os planos
• White label da plataforma
• Dashboard de gerenciamento de clientes
• Treinamento da sua equipe

Nossa ferramenta está ajudando agências como a sua a escalar a produção de conteúdo em 10x com a mesma equipe.

Podemos conversar esta semana para finalizar os detalhes?

Abraços,
{seu_nome}`,
    tags: ["agência", "parceria", "proposta"]
  }
];

function getOutreachTemplates(): OutreachTemplate[] {
  try {
    const templatesJSON = localStorage.getItem(StorageKeys.OUTREACH_TEMPLATES);
    return templatesJSON ? JSON.parse(templatesJSON) : DEFAULT_OUTREACH_TEMPLATES;
  } catch (error) {
    console.error("Erro ao carregar templates:", error);
    return DEFAULT_OUTREACH_TEMPLATES;
  }
}

function saveOutreachTemplates(templates: OutreachTemplate[]): void {
  try {
    localStorage.setItem(StorageKeys.OUTREACH_TEMPLATES, JSON.stringify(templates));
  } catch (error) {
    console.error("Erro ao salvar templates:", error);
  }
}

// =================================================================
// 3. COMPONENTES AUXILIARES OTIMIZADOS
// =================================================================

function AnimatedCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
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
    <Button
      onClick={handleCopy}
      size="sm"
      variant={variant}
      className={cn(
        "h-8 px-3 gap-2 transition-all",
        copied && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
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
            <Check className="w-3.5 h-3.5" />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Copy className="w-3.5 h-3.5" />
          </motion.div>
        )}
      </AnimatePresence>
      <span className="text-xs font-medium">
        {copied ? "Copiado!" : "Copiar"}
      </span>
    </Button>
  );
}

function ShareButton({ content }: { content: string }) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Conteúdo do FreelinkBrain',
          text: content,
        });
      } catch  {
        console.log('Compartilhamento cancelado');
      }
    } else {
      navigator.clipboard.writeText(content);
      toast.success("Link copiado!");
    }
  };

  return (
    <Button onClick={handleShare} size="sm" variant="outline" className="h-8 px-3 gap-2">
      <Share2 className="w-3.5 h-3.5" />
      <span className="text-xs font-medium">Compartilhar</span>
    </Button>
  );
}

function ContentMetrics() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl">
      {[
        { icon: Eye, label: "Alcance", value: "+45%" },
        { icon: Heart, label: "Engajamento", value: "+72%" },
        { icon: MessageCircle, label: "Comentários", value: "+120%" },
        { icon: TrendingUp, label: "Conversão", value: "+38%" }
      ].map((metric, i) => (
        <div key={i} className="text-center p-3 bg-background/60 rounded-lg backdrop-blur-sm">
          <metric.icon className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{metric.label}</p>
          <p className="text-sm font-bold text-primary">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}

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
  }, []);

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
// 4. COMPONENTES DE CONTEÚDO REDESENHADOS
// =================================================================

const ReelCard = ({
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

  const handleSchedule = () => {
    if (onSchedule) {
      onSchedule("reel", index);
      setIsSaved(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-500/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10">
                  <Video className="w-4 h-4 text-blue-500" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  Reel #{index + 1}
                </Badge>
                {isSaved && (
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                    <Calendar className="w-3 h-3 mr-1" />
                    Agendado
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                {reel.title}
              </CardTitle>
            </div>
            <div className="flex gap-1">
              <CopyButton
                textToCopy={`🎬 REEL: ${reel.title}\n\n🪝 GANCHO (3s):\n${reel.hook}\n\n📝 ROTEIRO:\n${reel.main_points.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n📢 CTA:\n${reel.cta}`}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                  <DropdownMenuItem onClick={handleSchedule}>
                    <Calendar className="w-4 h-4 mr-2" />
                    {isSaved ? "Editar agendamento" : "Agendar publicação"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsSaved(!isSaved)}>
                    <Bookmark className="w-4 h-4 mr-2" />
                    {isSaved ? "Remover dos salvos" : "Salvar para depois"}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <motion.div
            className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-xl border border-yellow-200/50 dark:border-yellow-800/50"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Zap className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                  Gancho Viral (primeiros 3 segundos)
                </p>
                <p className="text-sm font-medium">{reel.hook}</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full justify-between hover:bg-muted/50"
            >
              <span className="text-sm font-medium">Ver roteiro completo</span>
              <ChevronRight className={cn(
                "w-4 h-4 transition-transform",
                isExpanded && "rotate-90"
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
                  <div className="pt-2 space-y-3">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Pontos Principais do Roteiro
                      </p>
                      {reel.main_points.map((point, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                        >
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">{idx + 1}</span>
                          </div>
                          <p className="text-sm">{point}</p>
                        </motion.div>
                      ))}
                    </div>

                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Send className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-1">
                            Call to Action
                          </p>
                          <p className="text-sm font-medium">{reel.cta}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                15-30s
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Alto potencial viral
              </span>
            </div>
            <Button
              size="sm"
              variant={isSaved ? "default" : "ghost"}
              className={cn("h-7 text-xs", isSaved && "bg-blue-500 hover:bg-blue-600")}
              onClick={handleSchedule}
            >
              {isSaved ? (
                <>
                  <Calendar className="w-3 h-3 mr-1" />
                  Agendado
                </>
              ) : (
                <>
                  <Calendar className="w-3 h-3 mr-1" />
                  Agendar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CarouselViewer = ({ carousel, index }: { carousel: CarouselContent; index: number }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10">
                  <Layers className="w-4 h-4 text-purple-500" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  Carrossel #{index + 1}
                </Badge>
              </div>
              <CardTitle className="mt-2">{carousel.title}</CardTitle>
              <CardDescription>
                {carousel.slides.length + 1} slides
              </CardDescription>
            </div>
            <div className="flex gap-1">
              <CopyButton
                textToCopy={`📱 CARROSSEL: ${carousel.title}\n\n${carousel.slides.map(s => `SLIDE ${s.slide_number}: ${s.title}\n${s.content}`).join('\n\n')}\n\nCTA: ${carousel.cta_slide}`}
              />
              <ShareButton content={`Confira essa ideia de carrossel: ${carousel.title}`} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-200/50 dark:border-purple-700/50 p-6 flex flex-col items-center justify-center">
            {currentSlide < carousel.slides.length ? (
              <div className="text-center space-y-4">
                <Badge className="bg-purple-500 text-white">
                  Slide {carousel.slides[currentSlide].slide_number}
                </Badge>
                <h3 className="text-2xl font-bold">
                  {carousel.slides[currentSlide].title}
                </h3>
                <p className="text-muted-foreground">
                  {carousel.slides[currentSlide].content}
                </p>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <Sparkles className="w-12 h-12 text-purple-500 mb-2" />
                <h3 className="text-2xl font-bold">Gostou do conteúdo?</h3>
                <p className="text-muted-foreground">
                  {carousel.cta_slide}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-between mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
            >
              Anterior
            </Button>
            <div className="flex justify-center gap-1 items-center">
              {[...Array(carousel.slides.length + 1)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all cursor-pointer",
                    i === currentSlide ? "w-6 bg-purple-500" : "bg-muted"
                  )}
                  onClick={() => setCurrentSlide(i)}
                />
              ))}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentSlide(Math.min(carousel.slides.length, currentSlide + 1))}
              disabled={currentSlide === carousel.slides.length}
            >
              Próximo
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ImagePostCard = ({ post, index }: { post: ImagePostContent; index: number }) => {
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-pink-500/10">
                  <Camera className="w-4 h-4 text-pink-500" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  Post #{index + 1}
                </Badge>
              </div>
              <CardTitle className="mt-2">{post.idea}</CardTitle>
            </div>
            <div className="flex gap-1">
              <CopyButton textToCopy={post.caption} />
              <ShareButton content={`Confira essa ideia de post: ${post.idea}`} />
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
                      PROMPT PARA MIDJOURNEY/DALL-E
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Legenda do Post</p>
              <Badge variant="outline" className="text-xs">
                <Hash className="w-3 h-3 mr-1" />
                Hashtags incluídas
              </Badge>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {post.caption}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const StorySequenceCard = ({ seq, index }: { seq: StorySequenceContent; index: number }) => {
  const iconMap = {
    Poll: { icon: BarChart3, color: "text-blue-500", bg: "bg-blue-500/10" },
    Quiz: { icon: Brain, color: "text-purple-500", bg: "bg-purple-500/10" },
    "Q&A": { icon: MessageCircle, color: "text-green-500", bg: "bg-green-500/10" },
    Link: { icon: Share2, color: "text-orange-500", bg: "bg-orange-500/10" },
    Text: { icon: FileText, color: "text-pink-500", bg: "bg-pink-500/10" }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10">
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  Story Sequence #{index + 1}
                </Badge>
              </div>
              <CardTitle className="mt-2">{seq.theme}</CardTitle>
              <CardDescription>
                {seq.slides.length} stories interativos
              </CardDescription>
            </div>
            <div className="flex gap-1">
              <CopyButton
                textToCopy={`📱 SEQUÊNCIA DE STORIES: ${seq.theme}\n\n${seq.slides.map(s => `${s.type.toUpperCase()}: ${s.content}${s.options ? '\nOpções: ' + s.options.join(' | ') : ''}`).join('\n\n')}`}
              />
              <ShareButton content={`Confira essa sequência de stories: ${seq.theme}`} />
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
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          slideConfig.bg
                        )}
                      >
                        <Icon className={cn("w-5 h-5", slideConfig.color)} />
                      </div>
                      {slide.slide_number < seq.slides.length && (
                        <div className="w-0.5 h-16 bg-gradient-to-b from-muted to-transparent mt-2" />
                      )}
                    </div>

                    <div className="flex-1 pb-4">
                      <div className="p-4 bg-muted/30 rounded-xl space-y-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Story {slide.slide_number}
                            </Badge>
                            <span className="text-xs font-medium text-muted-foreground">
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
        </CardContent>
      </Card>
    </motion.div>
  );
};

// =================================================================
// 5. COMPONENTES DE HISTÓRICO E PLANEJAMENTO
// =================================================================

const CampaignHistory = ({
  campaigns,
  onSelect,
  onDelete
}: {
  campaigns: SavedCampaign[];
  onSelect: (campaign: SavedCampaign) => void;
  onDelete: (id: string) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.theme.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Histórico de Campanhas</CardTitle>
        <CardDescription>
          Acesse e gerencie suas campanhas anteriores
        </CardDescription>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar campanhas..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-y-auto">
          {filteredCampaigns.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Nenhuma campanha encontrada</p>
              {searchTerm && (
                <Button
                  variant="link"
                  onClick={() => setSearchTerm("")}
                  className="mt-2"
                >
                  Limpar busca
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {filteredCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div
                    className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
                    onClick={() => onSelect(campaign)}
                  >
                    <div className="bg-primary/10 rounded-md p-2">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{campaign.theme}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {new Date(campaign.date).toLocaleDateString()}
                        </p>
                        {campaign.favorite && (
                          <Badge variant="secondary" className="text-[10px] py-0 px-1">
                            <Bookmark className="h-3 w-3 text-yellow-500 mr-1" />
                            Favorito
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] py-0 px-1">
                          {campaign.results.content_pack.reels.length +
                            campaign.results.content_pack.carousels.length +
                            campaign.results.content_pack.image_posts.length +
                            campaign.results.content_pack.story_sequences.length
                          } itens
                        </Badge>
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
                      <DropdownMenuItem onClick={() => onSelect(campaign)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="h-4 w-4 mr-2" />
                        Ver agendamentos
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDelete(campaign.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const OutreachMessageGenerator = () => {
  // ... (seus hooks useState, useEffect, etc. continuam aqui como antes)
  const [messageType, setMessageType] = useState("cold");
  const [businessType, setBusinessType] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<OutreachTemplate | null>(null);
  const [customizedMessage, setCustomizedMessage] = useState("");
  const [savedTemplates, setSavedTemplates] = useState<OutreachTemplate[]>([]);

  const generateOutreachMessage = useAction(api.brain.generateOutreachMessage)

  useEffect(() => {
    const saved = getOutreachTemplates();
    setSavedTemplates(saved);
  }, []);

  const handleTemplateSelect = (template: OutreachTemplate) => {
    setSelectedTemplate(template);
    setCustomizedMessage(template.content);
  };

  const handleSaveTemplate = () => {
    if (!customizedMessage.trim()) return;
    const newTemplate: OutreachTemplate = {
      id: selectedTemplate?.id || generateId(),
      title: selectedTemplate?.title || `Template ${savedTemplates.length + 1}`,
      content: customizedMessage,
      tags: selectedTemplate?.tags || [messageType],
      lastUsed: new Date().toISOString()
    };
    const updated = selectedTemplate
      ? savedTemplates.map(t => t.id === selectedTemplate.id ? newTemplate : t)
      : [...savedTemplates, newTemplate];
    setSavedTemplates(updated);
    saveOutreachTemplates(updated);
    toast.success("Template salvo com sucesso!");
  };

  const handleGenerateNew = async () => {
    if (!businessType) {
      toast.error("Selecione um tipo de negócio");
      return;
    }
    try {
      const result = await generateOutreachMessage({
        businessType,
        messageType,
        customization: customizedMessage
      }) as OutreachMessageResult;
      setCustomizedMessage(result.content);
      toast.success("Mensagem gerada com sucesso!");
    } catch {
      toast.error("Erro ao gerar mensagem");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Gerador de Mensagens de Abordagem
        </CardTitle>
        <CardDescription>
          Crie mensagens personalizadas para abordar potenciais clientes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ✅ CORREÇÃO 1: MUDADO DE 'md:grid-cols-2' PARA 'lg:grid-cols-2' */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna da Esquerda: Controles */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Mensagem</label>
              <Select value={messageType} onValueChange={setMessageType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de mensagem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cold">Abordagem Inicial (Cold)</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                  <SelectItem value="agency">Proposta para Agências</SelectItem>
                  <SelectItem value="offer">Oferta Especial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Negócio</label>
              <Select value={businessType} onValueChange={setBusinessType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de negócio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agency">Agência</SelectItem>
                  <SelectItem value="freelancer">Freelancer</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="local">Negócio Local</SelectItem>
                  <SelectItem value="saas">SaaS / Tech</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">Templates Salvos</h4>
              <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto">
                {savedTemplates.map(template => (
                  <Button
                    key={template.id}
                    variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                    className="justify-start h-auto py-2 px-3"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="text-left">
                      <p className="text-sm font-medium">{template.title}</p>
                      <p className="text-xs text-muted-foreground truncate w-full">
                        {template.content.substring(0, 50)}...
                      </p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna da Direita: Mensagem e Ações */}
          <div className="flex flex-col space-y-4">
            <label className="text-sm font-medium">Mensagem Personalizada</label>
            <Textarea
              value={customizedMessage}
              onChange={(e) => setCustomizedMessage(e.target.value)}
              placeholder="Sua mensagem personalizada aparecerá aqui..."
              // ✅ CORREÇÃO 2: Altura responsiva para o Textarea
              className="min-h-[200px] sm:min-h-[285px] flex-grow font-mono text-sm"
            />

            {/* ✅ CORREÇÃO 3: Layout dos botões agora é responsivo */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleSaveTemplate}>
                      <Bookmark className="h-4 w-4 mr-2" />
                      Salvar Template
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Salvar para usar novamente
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="flex flex-col-reverse sm:flex-row gap-2">
                <Button variant="outline" size="sm" onClick={handleGenerateNew}>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Regenerar
                </Button>
                <CopyButton textToCopy={customizedMessage} variant="default" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ContentCalendar = ({
  scheduledItems = [],
  onScheduleEdit,

}: {
  scheduledItems?: ScheduledItem[],
  onScheduleEdit?: (item: ScheduledItem) => void,
  onScheduleDelete?: (id: string) => void
}) => {

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Gera os dias do calendário
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];

    // Dias do mês anterior
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, isPreviousMonth: true });
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = date.toISOString().split('T')[0];

      // Verifica se há itens agendados para este dia
      const dayItems = scheduledItems.filter(item =>
        item.date === dateString
      );

      days.push({
        day,
        date: dateString,
        isToday:
          today.getDate() === day &&
          today.getMonth() === currentMonth &&
          today.getFullYear() === currentYear,
        items: dayItems
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Calendário de Conteúdo</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
              } else {
                setCurrentMonth(currentMonth - 1);
              }
            }}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <Button variant="outline" size="sm" onClick={() => {
              if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
              } else {
                setCurrentMonth(currentMonth + 1);
              }
            }}>
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
          {calendarDays.map((dayData, i) => (
            <div
              key={i}
              className={cn(
                "h-20 sm:h-24 p-1 border rounded-md relative overflow-hidden",
                dayData.isPreviousMonth && "opacity-30 bg-muted",
                dayData.isToday && "border-primary/50 bg-primary/5",
                !dayData.day && "bg-muted/50"
              )}
            >
              {dayData.day && (
                <>
                  <div className="text-xs text-right mb-1">{dayData.day}</div>
                  <div className="overflow-y-auto max-h-[calc(100%-20px)]">
                    {dayData.items?.map((item) => (
                      <div
                        key={item.id}
                        className="text-[10px] mb-1 px-1 py-0.5 rounded-sm bg-primary/10 text-primary truncate cursor-pointer"
                        onClick={() => onScheduleEdit?.(item)}
                      >
                        {item.time.substring(0, 5)} - {item.contentType}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t p-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>Reels</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span>Carrosséis</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-pink-500"></div>
            <span>Posts</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

// =================================================================
// 6. COMPONENTE PRINCIPAL OTIMIZADO
// =================================================================

export default function FreelinkBrainTool() {
  const [theme, setTheme] = useState("");
  const [results, setResults] = useState<BrainResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("reels");
  const [mainView, setMainView] = useState<"generator" | "planner" | "outreach" | "history">("generator");
  const [savedCampaigns, setSavedCampaigns] = useState<SavedCampaign[]>([]);
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(null);
  const [isNewCampaignSaved, setIsNewCampaignSaved] = useState(false);
  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState(false);
  const [scheduledItems, setScheduledItems] = useState<ScheduledItem[]>([]);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [currentScheduleItem, setCurrentScheduleItem] = useState<{
    type: "reel" | "carousel" | "image_post" | "story_sequence";
    index: number;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const generateIdeas = useAction(api.brain.generateContentIdeas);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const campaigns = getSavedCampaigns();
    setSavedCampaigns(campaigns);

    const currentCampaign = getCurrentCampaign();
    if (currentCampaign) {
      setResults(currentCampaign.results);
      setTheme(currentCampaign.theme);
      setCurrentCampaignId(currentCampaign.id);
      setIsNewCampaignSaved(true);

      if (currentCampaign.scheduledItems) {
        setScheduledItems(currentCampaign.scheduledItems);
      }
    }
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!theme || !theme.trim()) {
      toast.error("Por favor, insira um tema para gerar ideias.");
      inputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setResults(null);
    setIsNewCampaignSaved(false);

    try {
      const data = await generateIdeas({ theme });
      setResults(data);

      // Gera uma nova campanha e salva localmente
      const newCampaign: SavedCampaign = {
        id: generateId(),
        theme,
        date: new Date().toISOString(),
        results: data,
        scheduledItems: []
      };

      setCurrentCampaignId(newCampaign.id);
      saveCampaign(newCampaign);

      // Atualiza a lista de campanhas
      setSavedCampaigns(prev => [newCampaign, ...prev]);
      setIsNewCampaignSaved(true);

      setIsLoading(false);
      toast.success("Sua campanha de conteúdo está pronta! ✨");
    } catch (error) {
      setIsLoading(false);
      toast.error(error instanceof Error ? error.message : "Erro ao gerar conteúdo");
    }
  };

  const handleGenerateNew = () => {
    setResults(null);
    setTheme("");
    setActiveTab("reels");
    setCurrentCampaignId(null);
    setIsNewCampaignSaved(false);
    setScheduledItems([]);
    inputRef.current?.focus();
  };

  const handleExampleClick = (exampleTheme: string) => {
    setTheme(exampleTheme);
    setTimeout(() => handleSubmit(), 100);
  };

  const handleCampaignSelect = (campaign: SavedCampaign) => {
    setResults(campaign.results);
    setTheme(campaign.theme);
    setCurrentCampaignId(campaign.id);
    setIsNewCampaignSaved(true);
    setMainView("generator");
    setIsHistorySidebarOpen(false);

    if (campaign.scheduledItems) {
      setScheduledItems(campaign.scheduledItems);
    } else {
      setScheduledItems([]);
    }

    toast.success("Campanha carregada com sucesso!");
  };

  const handleCampaignDelete = (id: string) => {
    deleteCampaign(id);
    setSavedCampaigns(prev => prev.filter(c => c.id !== id));

    if (currentCampaignId === id) {
      setResults(null);
      setTheme("");
      setCurrentCampaignId(null);
      setIsNewCampaignSaved(false);
      setScheduledItems([]);
    }

    toast.success("Campanha excluída com sucesso!");
  };

  const handleScheduleContent = (type: "reel" | "carousel" | "image_post" | "story_sequence", index: number) => {
    setCurrentScheduleItem({ type, index });
    setIsScheduleDialogOpen(true);
  };

  const handleScheduleSave = (date: string, time: string, platform: string) => {
    if (!currentScheduleItem || !currentCampaignId) return;

    const newScheduledItem: ScheduledItem = {
      id: generateId(),
      contentType: currentScheduleItem.type,
      contentIndex: currentScheduleItem.index,
      date,
      time,
      posted: false,
      platform
    };

    const updatedScheduledItems = [...scheduledItems, newScheduledItem];
    setScheduledItems(updatedScheduledItems);

    // Atualiza a campanha no localStorage
    const campaign = savedCampaigns.find(c => c.id === currentCampaignId);
    if (campaign) {
      const updatedCampaign = {
        ...campaign,
        scheduledItems: updatedScheduledItems
      };

      saveCampaign(updatedCampaign);
      setSavedCampaigns(prev =>
        prev.map(c => c.id === currentCampaignId ? updatedCampaign : c)
      );
    }

    setIsScheduleDialogOpen(false);
    setCurrentScheduleItem(null);
    toast.success("Conteúdo agendado com sucesso!");
  };

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
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20">
      {/* Barra de navegação superior */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-lg border-b mb-6">
        <div className="container py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-xl sm:text-2xl flex items-center">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Freelink<span className="font-black">Brain</span>
              </span>
              <Badge variant="outline" className="ml-2 hidden sm:flex">PRO</Badge>
            </h1>

            <Tabs value={mainView} className="hidden sm:block">
              <TabsList>
                <TabsTrigger
                  value="generator"
                  onClick={() => setMainView("generator")}
                  className="flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gerador</span>
                </TabsTrigger>
                <TabsTrigger
                  value="planner"
                  onClick={() => setMainView("planner")}
                  className="flex items-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Planner</span>
                </TabsTrigger>
                <TabsTrigger
                  value="outreach"
                  onClick={() => setMainView("outreach")}
                  className="flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Mensagens</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2">
            <Sheet open={isHistorySidebarOpen} onOpenChange={setIsHistorySidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">Histórico</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-[400px] overflow-y-auto">
                <SheetHeader className="mb-4">
                  <SheetTitle>Histórico de Campanhas</SheetTitle>
                  <SheetDescription>
                    Acesse suas campanhas anteriores
                  </SheetDescription>
                </SheetHeader>
                <CampaignHistory
                  campaigns={savedCampaigns}
                  onSelect={handleCampaignSelect}
                  onDelete={handleCampaignDelete}
                />
              </SheetContent>
            </Sheet>

            <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Agendar Publicação</DialogTitle>
                  <DialogDescription>
                    Escolha quando este conteúdo será publicado
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data</label>
                      <Input
                        id="schedule-date"
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Horário</label>
                      <Input id="schedule-time" type="time" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Plataforma</label>
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
                  <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => {
                    const dateInput = document.getElementById('schedule-date') as HTMLInputElement;
                    const timeInput = document.getElementById('schedule-time') as HTMLInputElement;
                    const date = dateInput?.value;
                    const time = timeInput?.value;

                    if (!date || !time) {
                      toast.error("Por favor, selecione data e horário.");
                      return;
                    }

                    handleScheduleSave(date, time, "instagram");
                  }}>
                    Agendar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Menu móvel */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="sm:hidden">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader className="mb-4">
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="grid gap-2">
                  <Button
                    variant={mainView === "generator" ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setMainView("generator")}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerador de Conteúdo
                  </Button>
                  <Button
                    variant={mainView === "planner" ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setMainView("planner")}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Planejador de Conteúdo
                  </Button>
                  <Button
                    variant={mainView === "outreach" ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setMainView("outreach")}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Mensagens de Abordagem
                  </Button>
                  <Separator className="my-2" />
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => setIsHistorySidebarOpen(true)}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Histórico de Campanhas
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="px-4 pb-20">
        <AnimatePresence mode="wait">
          {/* Gerador de Conteúdo */}
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
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Header com métricas */}
                 <div className="lg:sticky top-[57px] z-10 bg-background/80 backdrop-blur-lg border-b">
                    <div className="py-4 space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              Campanha Pronta!
                            </h2>
                            {isNewCampaignSaved && (
                              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                                <Check className="w-3 h-3 mr-1" />
                                Salva
                              </Badge>
                            )}
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
                                className="flex-1 sm:flex-initial gap-2"
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
                              <DropdownMenuItem>
                                <Calendar className="w-4 h-4 mr-2" />
                                Agendar todos
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Contadores animados */}
                      <div className="grid grid-cols-5 gap-2">
                        <div className="text-center p-2 bg-muted/50 rounded-lg">
                          <p className="text-2xl font-bold text-primary">
                            <AnimatedCounter value={contentCounts?.total || 0} />
                          </p>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                        {[
                          { key: "reels", icon: Video, color: "text-blue-500" },
                          { key: "carousels", icon: Layers, color: "text-purple-500" },
                          { key: "image_posts", icon: Camera, color: "text-pink-500" },
                          { key: "story_sequences", icon: MessageSquare, color: "text-indigo-500" }
                        ].map(({ key, icon: Icon, color }) => (
                          <div key={key} className="text-center p-2 bg-muted/50 rounded-lg">
                            <Icon className={cn("w-4 h-4 mx-auto mb-1", color)} />
                            <p className="text-lg font-bold">
                              <AnimatedCounter value={contentCounts?.[key as keyof typeof contentCounts] || 0} />
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Cards de resumo */}
                  <div className="space-y-4">
                    <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Target className="w-5 h-5 text-blue-500" />
                          Estratégia da Campanha
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
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
    <div className="text-sm">
      {typeof results.target_audience_suggestion === 'string'
        ? results.target_audience_suggestion
        : (
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(results.target_audience_suggestion).map(([key, value]) => (
              <li key={key}>
                <strong className="capitalize">{key.replace(/_/g, ' ')}:</strong> {Array.isArray(value) ? value.join(', ') : String(value)}
              </li>
            ))}
          </ul>
        )
      }
    </div>
  </div>
</div>
                      </CardContent>
                    </Card>

                    <ContentMetrics />
                  </div>

                  {/* Tabs de conteúdo */}
                  <div>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <div className="overflow-x-auto scrollbar-hide">
                        <TabsList className="inline-flex w-full sm:w-auto h-auto p-1 bg-muted/50">
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
                                "flex-1 sm:flex-initial gap-2 data-[state=active]:text-white transition-all",
                                color
                              )}
                            >
                              <Icon className="w-4 h-4" />
                              <span className="hidden sm:inline">{label}</span>
                              <Badge variant="secondary" className="ml-1 text-xs">
                                {contentCounts?.[value as keyof typeof contentCounts]}
                              </Badge>
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </div>

                      <div className="mt-6 space-y-4">
                     <TabsContent value="reels" className="mt-0 space-y-4">
  {results.content_pack?.reels?.map((reel, i) => (
    <ReelCard
      key={i}
      reel={reel}
      index={i}
      onSchedule={handleScheduleContent}
    />
  ))}
</TabsContent>

                        <TabsContent value="carousels" className="mt-0 space-y-4">
  {results.content_pack?.carousels?.map((carousel, i) => (
    <CarouselViewer key={i} carousel={carousel} index={i} />
  ))}
</TabsContent>

                        <TabsContent value="image_posts" className="mt-0 space-y-4">
  {results.content_pack?.image_posts?.map((post, i) => (
    <ImagePostCard key={i} post={post} index={i} />
  ))}
</TabsContent>

                        <TabsContent value="story_sequences" className="mt-0 space-y-4">
  {results.content_pack?.story_sequences?.map((seq, i) => (
    <StorySequenceCard key={i} seq={seq} index={i} />
  ))}
</TabsContent>
                      </div>
                    </Tabs>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  {/* Hero Section */}
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-1">
                    <div className="relative bg-background rounded-[calc(1.5rem-4px)] p-8 sm:p-12">
                      <motion.div
                        className="absolute inset-0 opacity-10"
                        animate={{
                          backgroundPosition: ["0% 0%", "100% 100%"],
                        }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                        style={{
                          backgroundImage: "url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
                        }}
                      />

                      <div className="relative text-center space-y-6">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", duration: 0.8 }}
                        >
                          <Badge variant="secondary" className="gap-2 px-4 py-1.5">
                            <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                            Tudo-em-Um
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
                          De tema a estratégia completa em segundos: conteúdo,{" "}
                          <span className="font-semibold text-foreground">
                            calendário, mensagens de abordagem
                          </span>{" "}
                          e muito mais.
                        </motion.p>

                        <motion.div
                          className="flex flex-wrap items-center justify-center gap-4 pt-4"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Video className="w-4 h-4" />
                            <span>Reels Virais</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>Planejamento</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            <span>Mensagens</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Zap className="w-4 h-4" />
                            <span>Estratégia</span>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Input Section */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Card className="shadow-2xl border-2">
                      <CardContent className="p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="space-y-2">
                            <label htmlFor="theme-input" className="text-sm font-medium flex items-center gap-2">
                              <Wand2 className="w-4 h-4 text-purple-500" />
                              Qual tema você quer transformar em uma campanha completa?
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
                              Precisa de inspiração? Experimente estes temas em alta:
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                              {[
                                "Vendas B2B pelo LinkedIn",
                                "Fórmula de lançamento digital",
                                "Estratégia de conteúdo para e-commerce",
                                "Marketing para serviços locais",
                                "Automação de marketing"
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

                  {/* Features Grid */}
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    {[
                      {
                        icon: Brain,
                        title: "Geração Inteligente",
                        description: "Campanhas completas de conteúdo em segundos",
                        color: "from-blue-500 to-cyan-500"
                      },
                      {
                        icon: Calendar,
                        title: "Planejador Integrado",
                        description: "Organize, agende e mantenha consistência",
                        color: "from-purple-500 to-pink-500"
                      },
                      {
                        icon: Mail,
                        title: "Mensagens de Abordagem",
                        description: "Templates para conquistar clientes",
                        color: "from-orange-500 to-red-500"
                      },
                      {
                        icon: BarChart3,
                        title: "Analytics Avançado",
                        description: "Métricas e insights de desempenho",
                        color: "from-green-500 to-emerald-500"
                      }
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ y: -5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Card className="h-full hover:shadow-lg transition-shadow border-2">
                          <CardContent className="p-6 text-center space-y-3">
                            <div className={cn(
                              "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mx-auto",
                              feature.color
                            )}>
                              <feature.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-semibold">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {feature.description}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Planejador de Conteúdo */}
          {mainView === "planner" && (
            <motion.div
              key="planner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {currentCampaignId ? (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Planejador de Conteúdo</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMainView("generator")}
                      className="gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Voltar para Campanha
                    </Button>
                  </div>

                  <ContentCalendar
                    scheduledItems={scheduledItems}
                    onScheduleEdit={() => {}}
                    onScheduleDelete={() => {}}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                  <Calendar className="w-16 h-16 text-muted-foreground/20 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhuma campanha ativa</h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    Gere uma campanha de conteúdo primeiro para visualizar o planejador.
                  </p>
                  <Button
                    onClick={() => setMainView("generator")}
                    className="gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Gerar Campanha
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Mensagens de Abordagem */}
          {mainView === "outreach" && (
            <motion.div
              key="outreach"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Mensagens de Abordagem</h2>
                <Select defaultValue="cold">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo de abordagem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cold">Abordagem Inicial</SelectItem>
                    <SelectItem value="followup">Follow-up</SelectItem>
                    <SelectItem value="agency">Para Agências</SelectItem>
                    <SelectItem value="special">Ofertas Especiais</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <OutreachMessageGenerator />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}