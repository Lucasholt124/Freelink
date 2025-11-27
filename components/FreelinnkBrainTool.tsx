"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Sparkles, Brain, Video, RefreshCcw, Layers, Camera,
  MessageSquare, Wand2, Calendar, Trash2, Menu,
  Crown, Clock, Loader2, Bell,
  CheckCircle2, Search, Zap, ArrowRight, TrendingUp,
  Film, Music, Scissors, X, Plus,
  ChevronRight, Target, Flame, Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
// COMPONENTES DE PARTÍCULAS ANIMADAS
// =================================================================
const FloatingParticles = ({ count = 20, color = "purple" }: { count?: number; color?: string }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            "absolute w-1 h-1 rounded-full opacity-40",
            color === "purple" && "bg-purple-500",
            color === "pink" && "bg-pink-500",
            color === "orange" && "bg-orange-500",
            color === "multi" && i % 3 === 0 ? "bg-purple-500" : i % 3 === 1 ? "bg-pink-500" : "bg-orange-500"
          )}
          initial={{
            x: Math.random() * 100 + "%",
            y: "100%",
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: "-10%",
            x: `calc(${Math.random() * 100}% + ${Math.sin(i) * 50}px)`,
          }}
          transition={{
            duration: Math.random() * 10 + 15,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
};



// =================================================================
// COMPONENTES DE LOADING DIFERENCIADOS
// =================================================================
const LoadingSpinnerPro = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center min-h-[50vh] space-y-8 px-4 text-center"
  >
    {/* Círculo principal animado */}
    <div className="relative">
      {/* Anel externo */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="w-28 h-28 sm:w-32 sm:h-32 rounded-full"
        style={{
          background: "conic-gradient(from 0deg, #8B5CF6, #EC4899, #8B5CF6)",
          padding: "3px",
        }}
      >
        <div className="w-full h-full rounded-full bg-white dark:bg-gray-950 flex items-center justify-center">
          {/* Anel interno */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-dashed border-purple-300 dark:border-purple-700"
          />
        </div>
      </motion.div>

      {/* Ícone central */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [1, 1.1, 1], opacity: 1 }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg shadow-purple-500/30">
          <Brain className="w-8 h-8 text-white" />
        </div>
      </motion.div>

      {/* Órbitas */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2 + i * 0.5,
            repeat: Infinity,
            ease: "linear",
            delay: i * 0.3,
          }}
          style={{
            top: "50%",
            left: "50%",
            transformOrigin: `${-30 - i * 15}px 0px`,
          }}
        />
      ))}
    </div>

    {/* Texto */}
    <div className="space-y-3">
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
      >
        Gerando sua campanha...
      </motion.p>
      <p className="text-sm sm:text-base text-muted-foreground max-w-xs mx-auto">
        Analisando tendências e criando conteúdo viral para você
      </p>
    </div>

    {/* Barra de progresso animada */}
    <div className="w-64 sm:w-80 space-y-2">
      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-full"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: "50%" }}
        />
      </div>
    </div>
  </motion.div>
);

const LoadingSpinnerUltra = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    { icon: Brain, text: "Analisando psicologia viral...", color: "from-purple-500 to-violet-600" },
    { icon: Film, text: "Criando roteiro cinematográfico...", color: "from-pink-500 to-rose-600" },
    { icon: Camera, text: "Definindo ângulos de câmera...", color: "from-blue-500 to-cyan-600" },
    { icon: Music, text: "Sincronizando áudio trending...", color: "from-orange-500 to-amber-600" },
    { icon: Scissors, text: "Otimizando cortes e transições...", color: "from-green-500 to-emerald-600" },
    { icon: Target, text: "Maximizando engajamento...", color: "from-red-500 to-pink-600" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[55vh] space-y-8 px-4 relative"
    >
      <FloatingParticles count={30} color="multi" />

      {/* Container principal */}
      <div className="relative z-10">
        {/* Círculo animado com gradiente */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-36 h-36 sm:w-44 sm:h-44 rounded-full relative"
        >
          {/* Gradiente rotativo externo */}
          <div
            className="absolute inset-0 rounded-full opacity-50"
            style={{
              background: "conic-gradient(from 0deg, #8B5CF6, #EC4899, #F59E0B, #10B981, #3B82F6, #8B5CF6)",
              filter: "blur(8px)",
            }}
          />
          <div
            className="absolute inset-1 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, #8B5CF6, #EC4899, #F59E0B, #10B981, #3B82F6, #8B5CF6)",
              padding: "4px",
            }}
          >
            <div className="w-full h-full rounded-full bg-white dark:bg-gray-950 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ scale: 0, rotate: -180, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0, rotate: 180, opacity: 0 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className={cn(
                    "p-5 sm:p-6 rounded-2xl bg-gradient-to-br shadow-2xl",
                    steps[currentStep].color
                  )}
                >
                  <CurrentIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Partículas orbitais */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${['#8B5CF6', '#EC4899', '#F59E0B', '#10B981'][i % 4]}, transparent)`,
              top: "50%",
              left: "50%",
            }}
            animate={{
              x: [0, Math.cos(i * 30 * Math.PI / 180) * 80],
              y: [0, Math.sin(i * 30 * Math.PI / 180) * 80],
              opacity: [1, 0],
              scale: [1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Badge Ultra */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Badge className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white px-5 py-2 text-sm font-bold shadow-lg shadow-orange-500/30 border-0">
          <Crown className="w-4 h-4 mr-2 fill-white animate-pulse" />
          MODO ULTRA ATIVADO
          <Zap className="w-4 h-4 ml-2 fill-yellow-200" />
        </Badge>
      </motion.div>

      {/* Texto animado */}
      <div className="text-center space-y-3 relative z-10">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentStep}
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.4 }}
            className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent"
          >
            {steps[currentStep].text}
          </motion.p>
        </AnimatePresence>
        <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
          Criando roteiro frame-a-frame com direção profissional de Hollywood
        </p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2">
        {steps.map((_, idx) => (
          <motion.div
            key={idx}
            className={cn(
              "h-2 rounded-full transition-all duration-500",
              idx === currentStep ? "w-8 bg-gradient-to-r from-purple-600 to-pink-600" : "w-2 bg-gray-300 dark:bg-gray-700"
            )}
            animate={idx === currentStep ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>

      {/* Contador */}
      <p className="text-xs text-muted-foreground">
        Etapa {currentStep + 1} de {steps.length}
      </p>
    </motion.div>
  );
};

// =================================================================
// COMPONENTE DE CONTAGEM ANIMADA
// =================================================================
const AnimatedCounter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const steps = 40;
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
      bgLight: "bg-blue-50 dark:bg-blue-950/40",
      iconBg: "bg-blue-500",
    },
    {
      icon: Layers,
      label: "Carrosséis",
      value: results.content_pack?.carousels?.length ?? 0,
      color: "from-purple-500 to-pink-500",
      bgLight: "bg-purple-50 dark:bg-purple-950/40",
      iconBg: "bg-purple-500",
    },
    {
      icon: Camera,
      label: "Posts",
      value: results.content_pack?.image_posts?.length ?? 0,
      color: "from-green-500 to-emerald-500",
      bgLight: "bg-green-50 dark:bg-green-950/40",
      iconBg: "bg-green-500",
    },
    {
      icon: MessageSquare,
      label: "Stories",
      value: results.content_pack?.story_sequences?.length ?? 0,
      color: "from-orange-500 to-amber-500",
      bgLight: "bg-orange-50 dark:bg-orange-950/40",
      iconBg: "bg-orange-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6 sm:mb-8"
    >
      <Card className={cn(
        "relative overflow-hidden border-0 shadow-2xl",
        userPlan === 'ultra'
          ? "bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500"
          : "bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600"
      )}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }} />
        </div>

        <div className="relative z-10 p-5 sm:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="p-3 sm:p-4 bg-white/20 backdrop-blur-sm rounded-2xl"
              >
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </motion.div>
              <div className="text-white">
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-black text-xl sm:text-2xl flex items-center gap-2"
                >
                  Campanha Gerada!
                  {userPlan === 'ultra' && (
                    <span className="text-2xl">⚡</span>
                  )}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/80 text-sm sm:text-base"
                >
                  {totalContent} conteúdos prontos para viralizar
                </motion.p>
              </div>
            </div>

            {userPlan === 'ultra' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.5 }}
              >
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2 text-sm font-bold">
                  <Crown className="w-4 h-4 mr-2 fill-yellow-300 text-yellow-300" />
                  ULTRA QUALITY
                </Badge>
              </motion.div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.1, type: "spring" }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/20 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn("p-2.5 rounded-xl", stat.iconBg)}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white/90 font-medium text-sm sm:text-base">
                    {stat.label}
                  </span>
                </div>
                <p className="text-3xl sm:text-4xl font-black text-white">
                  <AnimatedCounter value={stat.value} />
                </p>
              </motion.div>
            ))}
          </div>

          {/* Viral Strategy Preview */}
          {results.viral_strategy && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">Estratégia Viral Ativa</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {results.viral_strategy.best_times.slice(0, 3).map((time, i) => (
                  <Badge key={i} className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    <Clock className="w-3 h-3 mr-1.5" />
                    {time}
                  </Badge>
                ))}
                <Badge className="bg-yellow-500/30 text-yellow-100 border-yellow-400/30">
                  <Flame className="w-3 h-3 mr-1.5" />
                  {results.viral_strategy.engagement_hacks.length} hacks
                </Badge>
                <Badge className="bg-purple-500/30 text-purple-100 border-purple-400/30">
                  <Hash className="w-3 h-3 mr-1.5" />
                  Hashtags otimizadas
                </Badge>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

// =================================================================
// TELA INICIAL HERO - COMPLETAMENTE REDESENHADA
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
    { text: "Como ganhar seguidores no TikTok", icon: "🚀", gradient: "from-pink-500 to-rose-500" },
    { text: "Receitas fitness em 60 segundos", icon: "🥗", gradient: "from-green-500 to-emerald-500" },
    { text: "Dicas de investimento para iniciantes", icon: "💰", gradient: "from-yellow-500 to-amber-500" },
    { text: "Marketing digital para negócios", icon: "📱", gradient: "from-blue-500 to-cyan-500" },
  ];

  const features = userPlan === 'ultra'
    ? [
        { icon: Film, text: "Roteiros Frame-a-Frame" },
        { icon: Camera, text: "Direção de Câmera" },
        { icon: Brain, text: "Neuro-Marketing" },
      ]
    : [
        { icon: Sparkles, text: "Ideias Virais" },
        { icon: Layers, text: "Multi-Formato" },
        { icon: TrendingUp, text: "Estratégia Viral" },
      ];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 sm:py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        {/* Background Card */}
        <Card className={cn(
          "relative overflow-hidden border-0 shadow-2xl",
          userPlan === 'ultra'
            ? "bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900"
            : "bg-white dark:bg-gray-900"
        )}>
          {/* Efeitos de Background para Ultra */}
          {userPlan === 'ultra' && (
            <>
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-purple-600/30 via-pink-600/20 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-orange-600/20 via-yellow-600/10 to-transparent rounded-full blur-3xl" />
              <FloatingParticles count={25} color="multi" />
            </>
          )}

          {/* Efeitos de Background para Pro */}
          {userPlan === 'pro' && (
            <>
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-100 to-transparent dark:from-purple-900/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-100 to-transparent dark:from-pink-900/20 rounded-full blur-3xl" />
            </>
          )}

          <div className="relative z-10 p-6 sm:p-10 lg:p-16">
            {/* Badge Superior */}
            <motion.div
              initial={{ scale: 0, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex justify-center mb-6 sm:mb-8"
            >
              <Badge
                className={cn(
                  "px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-bold border-0 shadow-lg",
                  userPlan === 'ultra'
                    ? "bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white shadow-orange-500/30"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/30"
                )}
              >
                {userPlan === 'ultra' ? (
                  <>
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-2 fill-white" />
                    Modo Diretor Cinematográfico
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 ml-2 fill-yellow-200" />
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Sua Máquina de Conteúdo Viral
                  </>
                )}
              </Badge>
            </motion.div>

            {/* Título Principal */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-center mb-6 sm:mb-8"
            >
              <h1 className={cn(
                "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight",
                userPlan === 'ultra' && "text-white"
              )}>
                Freelinnk
                <span className={cn(
                  "bg-clip-text text-transparent bg-gradient-to-r inline-block",
                  userPlan === 'ultra'
                    ? "from-purple-400 via-pink-400 to-orange-400"
                    : "from-purple-600 via-pink-600 to-orange-600"
                )}>
                  Brain
                </span>
                {userPlan === 'ultra' && (
                  <motion.span
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-block ml-3"
                  >
                    ⚡
                  </motion.span>
                )}
              </h1>
            </motion.div>

            {/* Subtítulo */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={cn(
                "text-center text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed",
                userPlan === 'ultra' ? "text-gray-300" : "text-muted-foreground"
              )}
            >
              {userPlan === 'ultra' ? (
                <>
                  Crie roteiros <span className="font-bold text-purple-400">profissionais</span> com direção de câmera,
                  psicologia de atenção e técnicas de <span className="font-bold text-pink-400">Hollywood</span>.
                </>
              ) : (
                <>
                  Transforme qualquer tema em uma <span className="font-bold text-purple-600">campanha completa</span> de
                  conteúdo viral em <span className="font-bold text-pink-600">segundos</span>.
                </>
              )}
            </motion.p>

            {/* Features Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-3 mb-8 sm:mb-10"
            >
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                    userPlan === 'ultra'
                      ? "bg-white/10 text-white border border-white/20 backdrop-blur-sm"
                      : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                  )}
                >
                  <feature.icon className="w-4 h-4" />
                  {feature.text}
                </motion.div>
              ))}
            </motion.div>

            {/* Form */}
            <motion.form
              onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              <div className="space-y-3">
                <Label className={cn(
                  "flex items-center justify-center gap-2 text-base sm:text-lg font-bold",
                  userPlan === 'ultra' && "text-white"
                )}>
                  <Wand2 className="w-5 h-5 text-purple-500" />
                  Qual tema você quer dominar?
                </Label>

                <div className="relative group">
                  {/* Glow effect */}
                  <div className={cn(
                    "absolute -inset-1 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity",
                    userPlan === 'ultra'
                      ? "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600"
                      : "bg-gradient-to-r from-purple-400 to-pink-400"
                  )} />

                  <div className="relative">
                    <Input
                      ref={inputRef}
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      placeholder="Ex: Como vender pelo Instagram, Receitas fitness..."
                      className={cn(
                        "text-base sm:text-lg py-7 sm:py-8 px-5 sm:px-6 pr-16 rounded-xl border-2 transition-all",
                        "focus:ring-4 focus:ring-purple-500/20 shadow-lg",
                        userPlan === 'ultra'
                          ? "bg-white/10 border-white/30 text-white placeholder:text-gray-400 focus:border-purple-400 backdrop-blur-sm"
                          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:border-purple-500"
                      )}
                      maxLength={150}
                    />
                    <div className={cn(
                      "absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium px-2 py-1 rounded-full",
                      userPlan === 'ultra'
                        ? "bg-white/10 text-gray-300"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                    )}>
                      {theme.length}/150
                    </div>
                  </div>
                </div>
              </div>

              {/* Exemplos */}
              <div className="space-y-3">
                <p className={cn(
                  "text-center text-sm font-medium",
                  userPlan === 'ultra' ? "text-gray-400" : "text-muted-foreground"
                )}>
                  ✨ Experimente um destes:
                </p>
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                  {examples.map((example, idx) => (
                    <motion.button
                      key={idx}
                      type="button"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setTheme(example.text)}
                      className={cn(
                        "flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm rounded-full transition-all font-medium",
                        userPlan === 'ultra'
                          ? "bg-white/5 hover:bg-white/15 text-white border border-white/10 hover:border-white/30"
                          : "bg-gray-100 dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-gray-700 dark:text-gray-300"
                      )}
                    >
                      <span className="text-base">{example.icon}</span>
                      <span className="hidden sm:inline">{example.text}</span>
                      <span className="sm:hidden">{example.text.split(' ').slice(0, 3).join(' ')}...</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Botão Principal */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading || !theme.trim()}
                  className={cn(
                    "w-full h-16 sm:h-18 text-base sm:text-lg font-bold rounded-xl",
                    "shadow-2xl transition-all duration-300",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    userPlan === 'ultra'
                      ? "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 shadow-purple-500/30"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-500/30"
                  )}
                >
                  {userPlan === 'ultra' ? (
                    <>
                      <Brain className="w-6 h-6 mr-3" />
                      GERAR ROTEIRO ULTRA VIRAL
                      <Zap className="w-6 h-6 ml-3 fill-yellow-300 text-yellow-300 animate-pulse" />
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Gerar Campanha Completa
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.form>

            {/* Upgrade CTA para PRO */}
            {userPlan === 'pro' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 sm:mt-10"
              >
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 p-4 sm:p-5 bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-orange-950/30 rounded-2xl border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500 animate-pulse" />
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                      Quer roteiros <strong>frame-a-frame</strong> com direção de câmera profissional?
                    </span>
                  </div>
                  <Link
                    href="/dashboard/billing"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-sm rounded-full shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all hover:-translate-y-0.5"
                  >
                    Upgrade para Ultra
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </Card>

        {/* Stats abaixo do card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-wrap justify-center gap-6 sm:gap-10 mt-8 px-4"
        >
          {[
            { value: "50K+", label: "Conteúdos Gerados" },
            { value: "98%", label: "Satisfação" },
            { value: "5x", label: "Mais Engajamento" },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

// =================================================================
// NAVEGAÇÃO MOBILE INFERIOR - REDESENHADA
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
    { id: "reels", icon: Video, label: "Reels", count: contentCounts.reels, color: "bg-blue-500", textColor: "text-blue-600" },
    { id: "carousels", icon: Layers, label: "Carrossel", count: contentCounts.carousels, color: "bg-purple-500", textColor: "text-purple-600" },
    { id: "image_posts", icon: Camera, label: "Posts", count: contentCounts.image_posts, color: "bg-green-500", textColor: "text-green-600" },
    { id: "story_sequences", icon: MessageSquare, label: "Stories", count: contentCounts.story_sequences, color: "bg-orange-500", textColor: "text-orange-600" },
  ];

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 20 }}
      className="fixed bottom-0 left-0 right-0 z-50 sm:hidden"
    >
      {/* Blur background */}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800" />

      <div className="relative flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "relative flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all",
                isActive && "bg-gray-100 dark:bg-gray-800"
              )}
            >
              {/* Indicador ativo */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className={cn("absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full", tab.color)}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              <div className="relative">
                <tab.icon className={cn(
                  "w-6 h-6 transition-all",
                  isActive ? tab.textColor : "text-gray-400"
                )} />
                {tab.count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      "absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] text-[10px] font-bold rounded-full flex items-center justify-center text-white",
                      tab.color
                    )}
                  >
                    {tab.count}
                  </motion.span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-semibold transition-colors",
                isActive ? tab.textColor : "text-gray-500"
              )}>
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

// =================================================================
// COMPONENTE DE TAB DESKTOP MELHORADO
// =================================================================
const DesktopTabButton = ({
  active,
  icon: Icon,
  label,
  count,
  color,
  onClick,
}: {
  active: boolean;
  icon: React.ElementType;
  label: string;
  count: number;
  color: string;
  onClick: () => void;
}) => (
  <motion.button
    onClick={onClick}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    className={cn(
      "relative flex items-center gap-3 px-5 py-3.5 rounded-xl font-semibold transition-all",
      active
        ? "bg-white dark:bg-gray-900 shadow-lg text-gray-900 dark:text-white"
        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-800/50"
    )}
  >
    {active && (
      <motion.div
        layoutId="activeDesktopTab"
        className={cn("absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full", color)}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    )}
    <Icon className={cn("w-5 h-5", active && color.replace("bg-", "text-"))} />
    <span>{label}</span>
    <span className={cn(
      "px-2 py-0.5 text-xs font-bold rounded-full",
      active ? `${color} text-white` : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
    )}>
      {count}
    </span>
  </motion.button>
);

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

      if (userPlan === 'ultra') {
        setTimeout(() => {
          confetti({ particleCount: 100, angle: 60, spread: 55, origin: { x: 0 }, colors });
          confetti({ particleCount: 100, angle: 120, spread: 55, origin: { x: 1 }, colors });
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

  const tabsConfig = [
    { id: "reels", icon: Video, label: "Reels", count: contentCounts?.reels ?? 0, color: "bg-blue-500" },
    { id: "carousels", icon: Layers, label: "Carrosséis", count: contentCounts?.carousels ?? 0, color: "bg-purple-500" },
    { id: "image_posts", icon: Camera, label: "Posts", count: contentCounts?.image_posts ?? 0, color: "bg-green-500" },
    { id: "story_sequences", icon: MessageSquare, label: "Stories", count: contentCounts?.story_sequences ?? 0, color: "bg-orange-500" },
  ];

  return (
    <div className={cn(
      "w-full min-h-screen pb-24 sm:pb-0",
      userPlan === 'ultra'
        ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-950 to-black"
        : "bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-orange-50/30 dark:from-gray-950 dark:via-purple-950/10 dark:to-gray-950"
    )}>
      {/* HEADER */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 20 }}
        className="sticky top-0 z-40"
      >
        <div className={cn(
          "backdrop-blur-xl border-b",
          userPlan === 'ultra'
            ? "bg-gray-950/80 border-white/10"
            : "bg-white/80 dark:bg-gray-950/80 border-gray-200 dark:border-gray-800"
        )}>
          <div className="container px-3 sm:px-4 lg:px-6">
            <div className="flex items-center justify-between gap-3 h-16 sm:h-18">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className={cn(
                    "p-2 rounded-xl",
                    userPlan === 'ultra'
                      ? "bg-gradient-to-br from-purple-600 to-pink-600"
                      : "bg-gradient-to-br from-purple-600 to-pink-600"
                  )}
                >
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </motion.div>

                <div className="flex items-center gap-2">
                  <h1 className={cn(
                    "font-black text-lg sm:text-xl",
                    userPlan === 'ultra' ? "text-white" : "text-gray-900 dark:text-white"
                  )}>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600">
                      FreelinnkBrain
                    </span>
                  </h1>

                  {userPlan === 'ultra' ? (
                    <Badge className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white text-[10px] px-2 py-0.5 border-0 shadow-lg shadow-orange-500/20">
                      <Crown className="w-3 h-3 mr-1 fill-white" />
                      ULTRA
                    </Badge>
                  ) : (
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] px-2 py-0.5 border-0">
                      <Zap className="w-3 h-3 mr-1" />
                      PRO
                    </Badge>
                  )}
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-2 bg-gray-100 dark:bg-gray-800/50 rounded-xl p-1">
                <motion.button
                  onClick={() => setMainView("generator")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
                    mainView === "generator"
                      ? "bg-white dark:bg-gray-900 shadow-md text-purple-600"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Sparkles className="w-4 h-4" />
                  Gerador
                </motion.button>
                <motion.button
                  onClick={() => setMainView("planner")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
                    mainView === "planner"
                      ? "bg-white dark:bg-gray-900 shadow-md text-purple-600"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Calendar className="w-4 h-4" />
                  Calendário
                </motion.button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsSettingsOpen(true)}
                        className={cn(
                          "p-2.5 rounded-xl transition-all",
                          hasAnyNotification
                            ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                            : userPlan === 'ultra'
                              ? "bg-white/10 text-white hover:bg-white/20"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                        )}
                      >
                        {hasAnyNotification ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Bell className="w-5 h-5" />
                        )}
                      </motion.button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {hasAnyNotification ? "Notificações Ativas" : "Configurar Notificações"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsHistorySidebarOpen(true)}
                  className={cn(
                    "hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all",
                    userPlan === 'ultra'
                      ? "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  )}
                >
                  <Clock className="w-4 h-4" />
                  Histórico
                </motion.button>

                {/* Mobile Menu */}
                <Sheet>
                  <SheetTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "lg:hidden p-2.5 rounded-xl",
                        userPlan === 'ultra'
                          ? "bg-white/10 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                      )}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] p-0">
                    <SheetHeader className="p-6 border-b">
                      <SheetTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-600" />
                        FreelinnkBrain
                      </SheetTitle>
                    </SheetHeader>
                    <div className="p-4 space-y-2">
                      <Button
                        variant={mainView === "generator" ? "default" : "ghost"}
                        className="w-full justify-start h-12"
                        onClick={() => setMainView("generator")}
                      >
                        <Sparkles className="w-5 h-5 mr-3" />
                        Gerador
                      </Button>
                      <Button
                        variant={mainView === "planner" ? "default" : "ghost"}
                        className="w-full justify-start h-12"
                        onClick={() => setMainView("planner")}
                      >
                        <Calendar className="w-5 h-5 mr-3" />
                        Calendário
                      </Button>
                      <hr className="my-4" />
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-12"
                        onClick={() => setIsHistorySidebarOpen(true)}
                      >
                        <Clock className="w-5 h-5 mr-3" />
                        Histórico
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* SIDEBAR HISTÓRICO */}
      <Sheet open={isHistorySidebarOpen} onOpenChange={setIsHistorySidebarOpen}>
        <SheetContent side="right" className="w-full sm:w-[420px] p-0 flex flex-col">
          <SheetHeader className="p-5 border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
            <SheetTitle className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-xl">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="block">Histórico</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {campaigns?.length ?? 0} campanhas salvas
                </span>
              </div>
            </SheetTitle>
          </SheetHeader>

          <div className="px-4 py-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar campanha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {campaignsStatus === "LoadingFirstPage" ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
                  <p className="text-sm text-muted-foreground mt-3">Carregando histórico...</p>
                </div>
              ) : !campaigns || campaigns.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Brain className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                  </div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">
                    Nenhuma campanha ainda
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Gere sua primeira campanha viral
                  </p>
                </div>
              ) : (
                <>
                  {campaigns
                    .filter(c => c.theme.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((campaign, idx) => (
                      <motion.div
                        key={campaign._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group"
                      >
                        <div className="flex items-stretch bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all overflow-hidden shadow-sm hover:shadow-lg">
                          <button
                            onClick={() => handleCampaignSelect(campaign)}
                            className="flex-1 p-4 text-left flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shrink-0">
                              <Brain className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm line-clamp-2 leading-snug text-gray-900 dark:text-white">
                                {campaign.theme}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                {new Date(campaign.createdAt).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors shrink-0 self-center" />
                          </button>
                          <button
                            onClick={() => handleCampaignDelete(campaign._id)}
                            className="px-4 border-l border-gray-100 dark:border-gray-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}

                  {campaignsStatus === "CanLoadMore" && !searchTerm && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Button
                        variant="ghost"
                        className="w-full mt-4 h-12"
                        onClick={() => loadMoreCampaigns(10)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Carregar mais campanhas
                      </Button>
                    </motion.div>
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
      <main className="container px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
        <AnimatePresence mode="wait">
          {mainView === "generator" && (
            <motion.div
              key="generator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {isLoading ? (
                userPlan === 'ultra' ? <LoadingSpinnerUltra /> : <LoadingSpinnerPro />
              ) : results && currentCampaign ? (
                <div className="max-w-5xl mx-auto space-y-6">
                  {/* Stats Card */}
                  <ViralStatsCard results={results} userPlan={userPlan} />

                  {/* Action Bar */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
                  >
                    <div>
                      <h2 className={cn(
                        "text-xl sm:text-2xl font-bold",
                        userPlan === 'ultra' && "text-white"
                      )}>
                        Seus Conteúdos
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {contentCounts?.total} peças de conteúdo geradas
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGenerateNew}
                      className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all",
                        userPlan === 'ultra'
                          ? "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                          : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50"
                      )}
                    >
                      <RefreshCcw className="w-4 h-4" />
                      Nova Campanha
                    </motion.button>
                  </motion.div>

                  {/* Tabs Desktop */}
                <div className="w-full overflow-x-auto pb-2 sm:pb-0">
                    <div className="flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-2xl mb-6 min-w-max">
                      {tabsConfig.map((tab) => (
                        <DesktopTabButton
                          key={tab.id}
                          active={activeTab === tab.id}
                          icon={tab.icon}
                          label={tab.label}
                          count={tab.count}
                          color={tab.color}
                          onClick={() => setActiveTab(tab.id)}
                        />
                      ))}
                    </div>


                   <div className="hidden sm:block space-y-4">
                    {activeTab === "reels" && results.content_pack?.reels?.map((reel, i) => (
                      <motion.div
                        key={`reel-${i}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
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
                        transition={{ delay: i * 0.1 }}
                      >
                        <StoryCard story={story} index={i} onSchedule={() => handleScheduleContent("story_sequence", i)} />
                      </motion.div>
                    ))}
                  </div>
                  </div>

                  {/* Conteúdo Mobile */}
                  <div className="sm:hidden space-y-4">
                    <AnimatePresence mode="wait">
                      {activeTab === "reels" && results.content_pack?.reels?.map((reel, i) => (
                        <motion.div
                          key={`reel-mobile-${i}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: i * 0.05 }}
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
                          key={`carousel-mobile-${i}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <CarouselCard carousel={carousel} index={i} onSchedule={() => handleScheduleContent("carousel", i)} />
                        </motion.div>
                      ))}
                      {activeTab === "image_posts" && results.content_pack?.image_posts?.map((post, i) => (
                        <motion.div
                          key={`post-mobile-${i}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <ImagePostCard post={post} index={i} onSchedule={() => handleScheduleContent("image_post", i)} />
                        </motion.div>
                      ))}
                      {activeTab === "story_sequences" && results.content_pack?.story_sequences?.map((story, i) => (
                        <motion.div
                          key={`story-mobile-${i}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: i * 0.05 }}
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
              transition={{ duration: 0.3 }}
            >
              <CalendarView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navegação Mobile Inferior */}
      {results && mainView === "generator" && (
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          contentCounts={contentCounts}
        />
      )}

      {/* Footer */}
      <footer className={cn(
        "mt-20 py-8 border-t",
        userPlan === 'ultra'
          ? "bg-gray-950/50 border-white/10"
          : "bg-white/50 dark:bg-black/20 border-gray-200 dark:border-gray-800"
      )}>
        <div className="container text-center px-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              FreelinnkBrain
            </span>
          </div>
          <p className={cn(
            "text-sm",
            userPlan === 'ultra' ? "text-gray-400" : "text-gray-500"
          )}>
            © {new Date().getFullYear()} • Criado com 💜 para criadores de conteúdo
          </p>
        </div>
      </footer>
    </div>
  );
}