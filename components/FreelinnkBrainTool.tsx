"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Sparkles, Brain, Video, RefreshCcw, Layers, Camera,
  MessageSquare, Wand2, Calendar, Trash2, Menu,
  Crown, Clock, Loader2, ChevronDown, Bell,
  CheckCircle2, Search, Zap, ArrowRight,  TrendingUp,
  Film, Music, Scissors,
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
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useMutation, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useContentGeneration, useNotificationIntegration, useScheduledPosts } from "@/app/hooks/useBrain";
import PostScheduleModal from "./brain/PostScheduleModal";
import { BrainResults, ContentType, ScheduleModalData } from "@/app/types/brain";
import { ReelCardPro, ReelCardUltra, CarouselCard, ImagePostCard, StoryCard } from "./brain/ContentCards";
import SettingsModal from "./brain/SettingsModal";
import CalendarView from "./brain/CalendarView";
import Link from "next/link";

// =================================================================
// TIPOS
// =================================================================
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

// =================================================================
// COMPONENTES DE LOADING DIFERENCIADOS
// =================================================================
const LoadingSpinnerPro = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 px-4 text-center">
    <div className="relative">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-20 h-20 rounded-full border-4 border-purple-200 border-t-purple-600"
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Brain className="w-8 h-8 text-purple-600" />
      </motion.div>
    </div>
    <div className="space-y-2">
      <p className="text-lg font-bold text-gray-900 dark:text-white">
        Gerando suas ideias...
      </p>
      <p className="text-sm text-muted-foreground">
        Analisando tendências e criando conteúdo viral
      </p>
    </div>
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
          className="w-3 h-3 bg-purple-500 rounded-full"
        />
      ))}
    </div>
  </div>
);

const LoadingSpinnerUltra = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    { icon: Brain, text: "Analisando psicologia do público...", color: "text-purple-500" },
    { icon: Film, text: "Criando roteiro cinematográfico...", color: "text-pink-500" },
    { icon: Camera, text: "Definindo ângulos de câmera...", color: "text-blue-500" },
    { icon: Music, text: "Sincronizando com áudio viral...", color: "text-orange-500" },
    { icon: Scissors, text: "Otimizando cortes e transições...", color: "text-green-500" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] space-y-8 px-4">
      {/* Círculo animado com gradiente */}
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, #8B5CF6, #EC4899, #F59E0B, #10B981, #8B5CF6)",
            padding: "4px",
          }}
        >
          <div className="w-full h-full rounded-full bg-white dark:bg-gray-950 flex items-center justify-center">
            <motion.div
              key={currentStep}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              <CurrentIcon className={cn("w-12 h-12", steps[currentStep].color)} />
            </motion.div>
          </div>
        </motion.div>

        {/* Partículas */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            animate={{
              x: [0, Math.cos(i * 45 * Math.PI / 180) * 60],
              y: [0, Math.sin(i * 45 * Math.PI / 180) * 60],
              opacity: [1, 0],
              scale: [1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            style={{
              left: "50%",
              top: "50%",
              marginLeft: "-4px",
              marginTop: "-4px",
            }}
          />
        ))}
      </div>

      {/* Badge Ultra */}
      <Badge className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white px-4 py-1.5 text-sm font-bold animate-pulse">
        <Crown className="w-4 h-4 mr-2 fill-white" />
        MODO ULTRA ATIVADO
      </Badge>

      {/* Texto animado */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-center space-y-2"
        >
          <p className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
            {steps[currentStep].text}
          </p>
          <p className="text-sm text-muted-foreground">
            Criando roteiro frame-a-frame com direção profissional
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Progress bar */}
      <div className="w-64 space-y-2">
        <Progress value={(currentStep + 1) * 20} className="h-2" />
        <p className="text-xs text-center text-muted-foreground">
          Etapa {currentStep + 1} de {steps.length}
        </p>
      </div>
    </div>
  );
};

// =================================================================
// COMPONENTE DE CONTAGEM ANIMADA
// =================================================================
const AnimatedCounter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}{suffix}</span>;
};

// =================================================================
// CARD DE ESTATÍSTICAS VIRAL
// =================================================================
const ViralStatsCard = ({ results, userPlan }: { results: BrainResults; userPlan: string }) => {
  const totalContent =
    (results.content_pack?.reels?.length ?? 0) +
    (results.content_pack?.carousels?.length ?? 0) +
    (results.content_pack?.image_posts?.length ?? 0) +
    (results.content_pack?.story_sequences?.length ?? 0);

  const stats = [
    {
      icon: Video,
      label: "Reels",
      value: results.content_pack?.reels?.length ?? 0,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      icon: Layers,
      label: "Carrosséis",
      value: results.content_pack?.carousels?.length ?? 0,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      icon: Camera,
      label: "Posts",
      value: results.content_pack?.image_posts?.length ?? 0,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
    {
      icon: MessageSquare,
      label: "Stories",
      value: results.content_pack?.story_sequences?.length ?? 0,
      color: "from-orange-500 to-yellow-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className={cn(
        "p-4 sm:p-6 border-2 overflow-hidden relative",
        userPlan === 'ultra'
          ? "border-purple-500/50 bg-gradient-to-br from-purple-50/50 via-pink-50/50 to-orange-50/50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20"
          : "border-blue-500/30 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20"
      )}>
        {/* Background decoration */}
        {userPlan === 'ultra' && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-400/20 to-transparent rounded-bl-full" />
        )}

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl",
                userPlan === 'ultra'
                  ? "bg-gradient-to-br from-purple-600 to-pink-600"
                  : "bg-gradient-to-br from-blue-600 to-purple-600"
              )}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Campanha Gerada!</h3>
                <p className="text-sm text-muted-foreground">
                  {totalContent} conteúdos prontos para viralizar
                </p>
              </div>
            </div>

            {userPlan === 'ultra' && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 animate-pulse">
                <Crown className="w-3 h-3 mr-1 fill-white" />
                ULTRA
              </Badge>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "p-3 rounded-xl text-center transition-all hover:scale-105",
                  stat.bgColor
                )}
              >
                <div className={cn(
                  "w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center bg-gradient-to-br",
                  stat.color
                )}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-black">
                  <AnimatedCounter value={stat.value} />
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Viral Strategy Preview */}
          {results.viral_strategy && (
            <div className="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold">Estratégia Viral</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {results.viral_strategy.best_times.slice(0, 3).map((time, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {time}
                  </Badge>
                ))}
                <Badge variant="outline" className="text-xs text-purple-600">
                  +{results.viral_strategy.engagement_hacks.length} hacks
                </Badge>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

// =================================================================
// TELA INICIAL HERO
// =================================================================
const HeroSection = ({
  userPlan,
  theme,
  setTheme,
  onSubmit,
  isLoading,
  inputRef,
}: {
  userPlan: "pro" | "ultra";
  theme: string;
  setTheme: (theme: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) => {
  const examples = [
    { text: "Como ganhar seguidores no TikTok", icon: "🚀" },
    { text: "Receitas fitness em 60 segundos", icon: "🥗" },
    { text: "Dicas de investimento para iniciantes", icon: "💰" },
    { text: "Marketing digital para pequenos negócios", icon: "📱" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 mt-4 sm:mt-8 px-2">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className={cn(
          "relative overflow-hidden border-2 p-6 sm:p-10 md:p-12",
          userPlan === 'ultra'
            ? "border-purple-500/50 shadow-2xl shadow-purple-500/10"
            : "border-gray-200 shadow-xl"
        )}>
          {/* Background Effects */}
          {userPlan === 'ultra' && (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/10 via-pink-500/10 to-transparent rounded-bl-full" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-500/10 via-yellow-500/10 to-transparent rounded-tr-full" />
            </>
          )}

          <div className="relative z-10 text-center space-y-6">
            {/* Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Badge
                variant="secondary"
                className={cn(
                  "px-4 py-1.5 text-sm font-semibold",
                  userPlan === 'ultra' && "bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50"
                )}
              >
                {userPlan === 'ultra' ? (
                  <>
                    <Crown className="w-4 h-4 mr-2 text-yellow-500 fill-yellow-500" />
                    Modo Diretor Ativado
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                    Sua Máquina de Conteúdo
                  </>
                )}
              </Badge>
            </motion.div>

            {/* Título */}
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Freelinnk
              <span className={cn(
                "bg-clip-text text-transparent bg-gradient-to-r",
                userPlan === 'ultra'
                  ? "from-purple-600 via-pink-500 to-orange-500"
                  : "from-blue-600 via-purple-600 to-pink-600"
              )}>
                Brain
              </span>
              {userPlan === 'ultra' && (
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="inline-block ml-2"
                >
                  ⚡
                </motion.span>
              )}
            </motion.h1>

            {/* Subtítulo */}
            <motion.p
              className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {userPlan === 'ultra' ? (
                <>
                  Roteiros <span className="font-bold text-purple-600">frame-a-frame</span> com direção de câmera,
                  psicologia de atenção e <span className="font-bold text-pink-600">neuro-marketing</span> aplicado.
                </>
              ) : (
                <>
                  Transforme qualquer tema em uma <span className="font-bold text-purple-600">campanha completa</span> de
                  conteúdo viral em <span className="font-bold text-pink-600">30 segundos</span>.
                </>
              )}
            </motion.p>

            {/* Form */}
            <motion.form
              onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
              className="space-y-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="space-y-2">
                <Label className="flex items-center justify-center gap-2 text-sm sm:text-base font-semibold">
                  <Wand2 className="w-4 h-4 text-purple-500" />
                  Qual tema você quer dominar?
                </Label>
                <div className="relative max-w-xl mx-auto">
                  <Input
                    ref={inputRef}
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="Ex: Como vender pelo Instagram, Receitas fitness..."
                    className={cn(
                      "text-base sm:text-lg py-6 sm:py-7 px-4 sm:px-6 pr-12 rounded-xl border-2 transition-all",
                      "focus:ring-4 focus:ring-purple-500/20",
                      userPlan === 'ultra' && "border-purple-300 focus:border-purple-500"
                    )}
                    maxLength={150}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {theme.length}/150
                  </div>
                </div>
              </div>

              {/* Exemplos */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Experimente:</span>
                {examples.slice(0, 3).map((example, idx) => (
                  <motion.button
                    key={idx}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTheme(example.text)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                  >
                    <span>{example.icon}</span>
                    <span className="hidden sm:inline">{example.text.slice(0, 25)}...</span>
                    <span className="sm:hidden">{example.text.split(' ').slice(0, 3).join(' ')}...</span>
                  </motion.button>
                ))}
              </div>

              {/* Botão Principal */}
              <Button
                type="submit"
                size="lg"
                disabled={isLoading || !theme.trim()}
                className={cn(
                  "w-full max-w-md mx-auto h-14 sm:h-16 text-base sm:text-lg font-bold rounded-xl",
                  "transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                  "shadow-lg hover:shadow-xl",
                  userPlan === 'ultra'
                    ? "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                )}
              >
                {userPlan === 'ultra' ? (
                  <>
                    <Brain className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                    GERAR ROTEIRO ULTRA VIRAL
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 ml-2 fill-yellow-300 text-yellow-300" />
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Gerar Campanha Completa
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </motion.form>

            {/* Upgrade CTA para PRO */}
            {userPlan === 'pro' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="pt-4"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Quer roteiros <strong>frame-a-frame</strong> com direção de câmera?
                  </span>
                  <Link
                    href="/dashboard/billing"
                    className="text-sm font-bold text-purple-600 hover:text-purple-700 underline underline-offset-2"
                  >
                    Vire Ultra →
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

// =================================================================
// NAVEGAÇÃO MOBILE INFERIOR
// =================================================================
const MobileBottomNav = ({
  activeTab,
  setActiveTab,
  contentCounts,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  contentCounts: { reels: number; carousels: number; image_posts: number; story_sequences: number } | null;
}) => {
  if (!contentCounts) return null;

  const tabs = [
    { id: "reels", icon: Video, label: "Reels", count: contentCounts.reels, color: "text-blue-500" },
    { id: "carousels", icon: Layers, label: "Carrossel", count: contentCounts.carousels, color: "text-purple-500" },
    { id: "image_posts", icon: Camera, label: "Posts", count: contentCounts.image_posts, color: "text-green-500" },
    { id: "story_sequences", icon: MessageSquare, label: "Stories", count: contentCounts.story_sequences, color: "text-orange-500" },
  ];

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 px-2 pb-safe sm:hidden"
    >
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all min-w-[60px]",
                isActive
                  ? "bg-purple-100 dark:bg-purple-900/50"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <div className="relative">
                <tab.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? tab.color : "text-gray-400"
                )} />
                {tab.count > 0 && (
                  <span className={cn(
                    "absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold rounded-full flex items-center justify-center",
                    isActive
                      ? "bg-purple-600 text-white"
                      : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                  )}>
                    {tab.count}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                isActive ? "text-purple-600" : "text-gray-500"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

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
      const data = await generateIdeas({ theme, plan: userPlan });
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

      // Segundo burst para ultra
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
      toast.error("Erro ao carregar campanha");
    }
  };

  const handleCampaignDelete = async (id: Id<"brainCampaigns">) => {
    try {
      await deleteCampaign({ campaignId: id });
      toast.success("Campanha excluída!");
    } catch {
      toast.error("Erro ao excluir");
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
        <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col">
          <SheetHeader className="px-4 py-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Histórico de Campanhas
            </SheetTitle>
          </SheetHeader>

          <div className="px-4 py-3 border-b bg-gray-50/50 dark:bg-gray-900/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar campanha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {campaignsStatus === "LoadingFirstPage" ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                  <p className="text-sm text-muted-foreground mt-2">Carregando...</p>
                </div>
              ) : !campaigns || campaigns.length === 0 ? (
                <div className="text-center py-16">
                  <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium text-gray-600">Nenhuma campanha</p>
                  <p className="text-sm text-muted-foreground">Gere sua primeira estratégia</p>
                </div>
              ) : (
                <>
                  {campaigns
                    .filter(c => c.theme.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((campaign) => (
                      <motion.div
                        key={campaign._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="group flex items-stretch bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all overflow-hidden shadow-sm hover:shadow-md"
                      >
                        <button
                          onClick={() => handleCampaignSelect(campaign)}
                          className="flex-1 p-3 text-left flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg shrink-0">
                            <Brain className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm line-clamp-2 leading-tight">
                              {campaign.theme}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </button>
                        <button
                          onClick={() => handleCampaignDelete(campaign._id)}
                          className="px-3 border-l border-gray-100 dark:border-gray-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                </>
              )}
            </div>
          </ScrollArea>
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
                      <TabsList className="w-full justify-start bg-gray-100 dark:bg-gray-800/50 p-1 h-auto flex-wrap">
                        <TabsTrigger value="reels" className="flex-1 min-w-[100px] py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                          <Video className="w-4 h-4 mr-2" />
                          Reels ({contentCounts?.reels})
                        </TabsTrigger>
                        <TabsTrigger value="carousels" className="flex-1 min-w-[100px] py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                          <Layers className="w-4 h-4 mr-2" />
                          Carrosséis ({contentCounts?.carousels})
                        </TabsTrigger>
                        <TabsTrigger value="image_posts" className="flex-1 min-w-[100px] py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                          <Camera className="w-4 h-4 mr-2" />
                          Posts ({contentCounts?.image_posts})
                        </TabsTrigger>
                        <TabsTrigger value="story_sequences" className="flex-1 min-w-[100px] py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                          <MessageSquare className="w-4 h-4 mr-2" />
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