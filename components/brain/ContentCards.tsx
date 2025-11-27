// components/brain/ContentCards.tsx - CARDS PRO vs ULTRA DIFERENCIADOS
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Video, Layers, Camera, MessageSquare, Calendar, Zap,
   Flame, ChevronDown, Copy, Check,
  Clapperboard, MonitorPlay, Volume2, Type, Scissors,
  Lightbulb, Palette, Clock,  Eye,
  Crown, Target, TrendingUp, Sparkles,
   CheckCircle2, Film,
  Music,  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CarouselContent, ImagePostContent, ReelContent, StorySequenceContent } from "@/app/types/brain";

// ============================================
// HELPER: COPY BUTTON
// ============================================
function CopyButton({ textToCopy, className, label }: { textToCopy: string; className?: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success("Copiado! 📋");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  return (
    <Button
      onClick={(e) => { e.stopPropagation(); handleCopy(); }}
      size={label ? "sm" : "icon"}
      variant="ghost"
      className={cn(
        "transition-all touch-manipulation hover:bg-purple-100 dark:hover:bg-purple-900/20 active:scale-95",
        copied && "text-emerald-600 bg-emerald-50",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1">
            <Check className="w-4 h-4" />
            {label && <span>Copiado!</span>}
          </motion.div>
        ) : (
          <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1">
            <Copy className="w-4 h-4" />
            {label && <span>{label}</span>}
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}

// ============================================
// HELPER: VIRAL SCORE
// ============================================
function getViralScore(content: ReelContent): number {
  let score = 70;

  // Hook forte
  if (content.hook && content.hook.length > 20) score += 5;
  if (content.hook?.includes("?") || content.hook?.includes("!")) score += 3;

  // Estrutura completa
  if (content.main_points && content.main_points.length >= 3) score += 5;
  if (content.cta && content.cta.length > 10) score += 3;

  // Direção técnica (ULTRA)
  if (content.script_timeline && content.script_timeline.length > 0) score += 10;
  if (content.editing_notes) score += 4;

  return Math.min(score, 100);
}

function ViralScoreBadge({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 90) return "from-green-500 to-emerald-500";
    if (score >= 80) return "from-blue-500 to-cyan-500";
    if (score >= 70) return "from-yellow-500 to-orange-500";
    return "from-gray-500 to-gray-600";
  };

  const getLabel = () => {
    if (score >= 90) return "VIRAL 🔥";
    if (score >= 80) return "Alto Potencial";
    if (score >= 70) return "Bom";
    return "Médio";
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full bg-gradient-to-r", getColor())}
        />
      </div>
      <Badge className={cn("bg-gradient-to-r text-white text-xs px-2", getColor())}>
        {score}%
      </Badge>
      <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
        {getLabel()}
      </span>
    </div>
  );
}

// ============================================
// 1. REEL CARD PRO
// ============================================
export function ReelCardPro({ reel, index, onSchedule }: {
  reel: ReelContent;
  index: number;
  onSchedule: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const viralScore = getViralScore(reel);

  const fullTextToCopy = `🎬 REEL: ${reel.title}\n\n` +
    `🎣 HOOK: ${reel.hook}\n\n` +
    `📝 PONTOS:\n${reel.main_points.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n` +
    `📣 CTA: ${reel.cta}\n\n` +
    `🎨 Visual: ${reel.visual_suggestion}\n` +
    `🎵 Áudio: ${reel.audio_suggestion}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden border-2 hover:border-blue-400 transition-all hover:shadow-lg group">
        {/* Header com gradiente */}
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <CardHeader className="pb-3 px-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <Video className="w-3 h-3 mr-1" />
                  Reel #{index + 1}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Zap className="w-3 h-3 mr-1 text-blue-500" />
                  PRO
                </Badge>
              </div>
              <CardTitle className="text-lg sm:text-xl leading-tight line-clamp-2">
                {reel.title}
              </CardTitle>
            </div>

            <div className="flex gap-1.5 shrink-0">
              <CopyButton textToCopy={fullTextToCopy} className="h-9 w-9" />
              <Button
                size="icon"
                onClick={onSchedule}
                className="h-9 w-9 bg-blue-600 hover:bg-blue-700"
              >
                <Calendar className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Viral Score */}
          <div className="mt-3">
            <ViralScoreBadge score={viralScore} />
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 pb-6 space-y-4">
          {/* Hook Section */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-blue-500 rounded-lg">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                Hook (0-3 segundos)
              </span>
            </div>
            <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-snug">
              {reel.hook}
            </p>
          </div>

          {/* Pontos Principais */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-500" />
              Pontos Principais
            </p>
            <div className="space-y-2">
              {reel.main_points.map((point, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border"
                >
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {point}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Toggle Detalhes */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full justify-center text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? "Ocultar detalhes" : "Ver sugestões visuais e áudio"}
            <ChevronDown className={cn("w-4 h-4 ml-2 transition-transform", isExpanded && "rotate-180")} />
          </Button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase">Visual</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {reel.visual_suggestion}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-100 dark:border-purple-900">
                    <div className="flex items-center gap-2 mb-2">
                      <Music className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase">Áudio</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {reel.audio_suggestion}
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-bold text-green-700 dark:text-green-300 uppercase">Call to Action</span>
                  </div>
                  <p className="text-base font-semibold text-green-900 dark:text-green-100">
                    {reel.cta}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================
// 2. REEL CARD ULTRA (COM TIMELINE)
// ============================================
// components/brain/ContentCards.tsx - CONTINUAÇÃO

// ============================================
// 2. REEL CARD ULTRA (COM TIMELINE) - CONTINUAÇÃO
// ============================================
export function ReelCardUltra({ reel, index, onSchedule }: {
  reel: ReelContent;
  index: number;
  onSchedule: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeScene, setActiveScene] = useState(0);
  const viralScore = getViralScore(reel);
  const hasTimeline = reel.script_timeline && reel.script_timeline.length > 0;

  const fullTextToCopy = `🎬 ROTEIRO ULTRA: ${reel.title}\n\n` +
    `🎣 HOOK: ${reel.hook}\n\n` +
    (hasTimeline ? `📋 TIMELINE:\n${reel.script_timeline!.map((scene) =>
      `[${scene.start_time}-${scene.end_time}]\n` +
      `  📍 Ação: ${scene.action}\n` +
      `  📷 Câmera: ${scene.camera_angle}\n` +
      (scene.screen_text ? `  📝 Texto: ${scene.screen_text}\n` : '') +
      (scene.audio_note ? `  🔊 Áudio: ${scene.audio_note}\n` : '')
    ).join('\n')}\n\n` : '') +
    `📣 CTA: ${reel.cta}\n\n` +
    (reel.editing_notes ? `✂️ Edição: ${reel.editing_notes}` : '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={cn(
        "overflow-hidden border-2 transition-all",
        "border-purple-500/50 bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-950 dark:to-purple-950/10",
        "shadow-xl shadow-purple-500/10 hover:shadow-2xl hover:shadow-purple-500/20"
      )}>
        {/* Header Gradiente Animado */}
        <div className="h-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 animate-gradient-x" />

        <CardHeader className="pb-3 px-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-gradient-to-r from-purple-700 to-pink-600 text-white shadow-lg">
                  <Clapperboard className="w-3 h-3 mr-1" />
                  Roteiro #{index + 1}
                </Badge>
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 animate-pulse">
                  <Crown className="w-3 h-3 mr-1 fill-white" />
                  ULTRA
                </Badge>
                {viralScore >= 85 && (
                  <Badge className="bg-red-500 text-white animate-bounce">
                    <Flame className="w-3 h-3 mr-1" />
                    VIRAL
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg sm:text-xl font-black leading-tight line-clamp-2 bg-gradient-to-r from-gray-900 to-purple-900 dark:from-white dark:to-purple-200 bg-clip-text text-transparent">
                {reel.title}
              </CardTitle>
            </div>

            <div className="flex gap-1.5 shrink-0">
              <CopyButton textToCopy={fullTextToCopy} className="h-9 w-9" />
              <Button
                size="icon"
                onClick={onSchedule}
                className="h-9 w-9 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
              >
                <Calendar className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Viral Score com mais destaque */}
          <div className="mt-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Potencial Viral
              </span>
              <span className="text-xs text-muted-foreground">
                {hasTimeline ? `${reel.script_timeline!.length} cenas` : "Estrutura básica"}
              </span>
            </div>
            <ViralScoreBadge score={viralScore} />
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 pb-6 space-y-5">
          {/* Hook Ultra Destacado */}
          <div className="relative p-5 bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 dark:from-purple-950/50 dark:via-pink-950/50 dark:to-orange-950/50 rounded-2xl border-2 border-purple-200 dark:border-purple-800 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-yellow-400/20 to-transparent rounded-bl-full" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-xs font-black text-purple-800 dark:text-purple-200 uppercase tracking-wider block">
                    GANCHO VIRAL
                  </span>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400">
                    Primeiros 3 segundos críticos
                  </span>
                </div>
              </div>
              <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-white leading-snug">
                {reel.hook}
              </p>
            </div>
          </div>

          {/* Toggle Timeline */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full justify-center border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950/50"
          >
            <Film className="w-4 h-4 mr-2 text-purple-600" />
            {isExpanded ? "Ocultar Roteiro Técnico" : "Ver Roteiro Frame-a-Frame"}
            <ChevronDown className={cn("w-4 h-4 ml-2 transition-transform", isExpanded && "rotate-180")} />
          </Button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-5"
              >
                {hasTimeline ? (
                  <>
                    {/* Timeline Visual */}
                    <div className="relative">
                      {/* Linha conectora */}
                      <div className="absolute left-[19px] sm:left-[23px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-purple-500 via-pink-500 to-orange-500" />

                      <div className="space-y-4">
                        {reel.script_timeline!.map((scene, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={cn(
                              "relative pl-12 sm:pl-14",
                              activeScene === idx && "scale-[1.02]"
                            )}
                            onClick={() => setActiveScene(idx)}
                          >
                            {/* Marcador de tempo */}
                            <div className={cn(
                              "absolute left-0 top-0 w-10 sm:w-12 h-10 sm:h-12 rounded-xl flex flex-col items-center justify-center text-white font-bold shadow-lg transition-all cursor-pointer",
                              activeScene === idx
                                ? "bg-gradient-to-br from-purple-600 to-pink-600 scale-110"
                                : "bg-gradient-to-br from-gray-700 to-gray-800 hover:from-purple-600 hover:to-pink-600"
                            )}>
                              <span className="text-[10px] leading-none">{scene.start_time}</span>
                              <div className="w-3 h-px bg-white/50 my-0.5" />
                              <span className="text-[10px] leading-none">{scene.end_time}</span>
                            </div>

                            {/* Card da Cena */}
                            <div className={cn(
                              "bg-white dark:bg-gray-900 rounded-xl border-2 p-4 transition-all",
                              activeScene === idx
                                ? "border-purple-400 dark:border-purple-600 shadow-lg"
                                : "border-gray-200 dark:border-gray-800 hover:border-purple-300"
                            )}>
                              {/* Ação Principal */}
                              <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <MonitorPlay className="w-4 h-4 text-purple-600" />
                                  <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase">
                                    Ação / Visual
                                  </span>
                                </div>
                                <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                                  {scene.action}
                                </p>
                              </div>

                              {/* Grid de Detalhes Técnicos */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {/* Câmera */}
                                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg border border-indigo-100 dark:border-indigo-900">
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <Camera className="w-3.5 h-3.5 text-indigo-600" />
                                    <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase">
                                      Câmera
                                    </span>
                                  </div>
                                  <p className="text-xs text-indigo-900 dark:text-indigo-100 leading-relaxed">
                                    {scene.camera_angle}
                                  </p>
                                </div>

                                {/* Texto na Tela */}
                                {scene.screen_text && (
                                  <div className="p-2.5 bg-pink-50 dark:bg-pink-950/30 rounded-lg border border-pink-100 dark:border-pink-900">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <Type className="w-3.5 h-3.5 text-pink-600" />
                                      <span className="text-[10px] font-bold text-pink-700 dark:text-pink-300 uppercase">
                                        Texto Tela
                                      </span>
                                    </div>
                                    <p className="text-xs text-pink-900 dark:text-pink-100 font-semibold leading-relaxed">
                                      {scene.screen_text}
                                    </p>
                                  </div>
                                )}

                                {/* Áudio */}
                                {scene.audio_note && (
                                  <div className={cn(
                                    "p-2.5 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-100 dark:border-orange-900",
                                    !scene.screen_text && "sm:col-span-2"
                                  )}>
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <Volume2 className="w-3.5 h-3.5 text-orange-600" />
                                      <span className="text-[10px] font-bold text-orange-700 dark:text-orange-300 uppercase">
                                        Áudio / SFX
                                      </span>
                                    </div>
                                    <p className="text-xs text-orange-900 dark:text-orange-100 leading-relaxed">
                                      {scene.audio_note}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Notas de Edição */}
                    {reel.editing_notes && (
                      <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-xl border-2 border-amber-200 dark:border-amber-800">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1.5 bg-amber-500 rounded-lg">
                            <Scissors className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-bold text-amber-800 dark:text-amber-200 uppercase">
                            Instruções de Edição
                          </span>
                        </div>
                        <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed italic">
                          {reel.editing_notes}
                        </p>
                      </div>
                    )}

                    {/* Transições */}
                    {reel.transitions && reel.transitions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-bold text-gray-500 uppercase">Transições:</span>
                        {reel.transitions.map((transition, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            <RotateCcw className="w-3 h-3 mr-1" />
                            {transition}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  /* Fallback para conteúdo sem timeline */
                  <div className="space-y-3">
                    {reel.main_points.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                        <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-bold shrink-0">
                          {idx + 1}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{point}</p>
                      </div>
                    ))}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <p className="text-xs font-bold text-blue-700 mb-1">Visual</p>
                        <p className="text-xs text-blue-900 dark:text-blue-100">{reel.visual_suggestion}</p>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                        <p className="text-xs font-bold text-purple-700 mb-1">Áudio</p>
                        <p className="text-xs text-purple-900 dark:text-purple-100">{reel.audio_suggestion}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* CTA Final */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-green-500 rounded-lg">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-bold text-green-800 dark:text-green-200 uppercase">
                      Call to Action Final
                    </span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-green-900 dark:text-green-100">
                    {reel.cta}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================
// 3. CAROUSEL CARD (Melhorado)
// ============================================
export function CarouselCard({ carousel, index, onSchedule }: {
  carousel: CarouselContent;
  index: number;
  onSchedule: () => void;
}) {
  const [activeSlide, setActiveSlide] = useState(0);

  const fullTextToCopy = `📱 CARROSSEL: ${carousel.title}\n\n` +
    carousel.slides.map(s => `Slide ${s.slide_number}: ${s.title}\n${s.content}`).join('\n\n') +
    `\n\n📣 CTA: ${carousel.cta_slide}` +
    (carousel.design_tips?.length ? `\n\n🎨 Dicas: ${carousel.design_tips.join(', ')}` : '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden border-2 hover:border-pink-400 hover:shadow-lg transition-all">
        <div className="h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

        <CardHeader className="pb-3 px-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1 min-w-0">
              <Badge className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">
                <Layers className="w-3 h-3 mr-1" />
                Carrossel #{index + 1}
              </Badge>
              <CardTitle className="text-lg sm:text-xl leading-tight line-clamp-2">
                {carousel.title}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {carousel.slides.length} slides + CTA
              </p>
            </div>

            <div className="flex gap-1.5 shrink-0">
              <CopyButton textToCopy={fullTextToCopy} className="h-9 w-9" />
              <Button
                size="icon"
                onClick={onSchedule}
                className="h-9 w-9 bg-pink-600 hover:bg-pink-700"
              >
                <Calendar className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 pb-6 space-y-4">
          {/* Preview Visual dos Slides */}
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
              {carousel.slides.map((slide, idx) => (
                <motion.div
                  key={slide.slide_number}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveSlide(idx)}
                  className={cn(
                    "flex-shrink-0 w-32 sm:w-40 aspect-[4/5] rounded-xl border-2 p-3 cursor-pointer snap-center transition-all",
                    activeSlide === idx
                      ? "border-pink-500 bg-pink-50 dark:bg-pink-950/30"
                      : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-pink-300"
                  )}
                >
                  <div className="h-full flex flex-col">
                    <Badge variant="outline" className="self-start text-[10px] mb-2">
                      {slide.slide_number}
                    </Badge>
                    <p className="text-[10px] font-bold text-pink-700 dark:text-pink-300 mb-1 line-clamp-1">
                      {slide.title}
                    </p>
                    <p className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-4 flex-1">
                      {slide.content}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Slide CTA */}
              <div className="flex-shrink-0 w-32 sm:w-40 aspect-[4/5] rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900 snap-center">
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-2">
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">CTA</p>
                  <p className="text-[10px] text-gray-400 mt-1 line-clamp-3">
                    {carousel.cta_slide}
                  </p>
                </div>
              </div>
            </div>

            {/* Indicadores */}
            <div className="flex justify-center gap-1.5 mt-3">
              {carousel.slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    activeSlide === idx ? "w-6 bg-pink-500" : "bg-gray-300 dark:bg-gray-700"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Slide Ativo Expandido */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 rounded-xl border border-pink-200 dark:border-pink-800"
            >
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-pink-600 text-white">
                  Slide {carousel.slides[activeSlide]?.slide_number || activeSlide + 1}
                </Badge>
                <CopyButton
                  textToCopy={carousel.slides[activeSlide]?.content || ''}
                  className="h-7 w-7"
                />
              </div>
              <p className="text-xs font-bold text-pink-700 dark:text-pink-300 mb-1">
                {carousel.slides[activeSlide]?.title}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {carousel.slides[activeSlide]?.content}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Dicas de Design */}
          {carousel.design_tips && carousel.design_tips.length > 0 && (
            <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-dashed border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase">
                  Dicas de Design
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {carousel.design_tips.map((tip, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px] bg-white dark:bg-gray-800">
                    {tip}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================
// 4. IMAGE POST CARD (Melhorado)
// ============================================
export function ImagePostCard({ post, index, onSchedule }: {
  post: ImagePostContent;
  index: number;
  onSchedule: () => void;
}) {
  const [showPrompt, setShowPrompt] = useState(false);

  const fullTextToCopy = `📸 POST: ${post.idea}\n\n` +
    `📝 Legenda:\n${post.caption}\n\n` +
    `#️⃣ Hashtags:\n${post.hashtags.join(' ')}\n\n` +
    `🖼️ Prompt de Imagem:\n${post.image_prompt}\n\n` +
    `⏰ Melhor horário: ${post.best_time}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden border-2 hover:border-green-400 hover:shadow-lg transition-all">
        <div className="h-1.5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />

        <CardHeader className="pb-3 px-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                  <Camera className="w-3 h-3 mr-1" />
                  Post #{index + 1}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {post.best_time}
                </Badge>
              </div>
              <CardTitle className="text-lg sm:text-xl leading-tight line-clamp-2">
                {post.idea}
              </CardTitle>
            </div>

            <div className="flex gap-1.5 shrink-0">
              <CopyButton textToCopy={fullTextToCopy} className="h-9 w-9" />
              <Button
                size="icon"
                onClick={onSchedule}
                className="h-9 w-9 bg-green-600 hover:bg-green-700"
              >
                <Calendar className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 pb-6 space-y-4">
          {/* Legenda */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Type className="w-4 h-4 text-green-600" />
                Legenda
              </span>
              <CopyButton textToCopy={post.caption} label="Copiar" className="h-7 text-xs" />
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto">
              {post.caption}
            </div>
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Hashtags ({post.hashtags.length})
              </span>
              <CopyButton textToCopy={post.hashtags.join(' ')} label="Copiar" className="h-7 text-xs" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {post.hashtags.map((tag, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Prompt de Imagem (Toggle) */}
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPrompt(!showPrompt)}
              className="w-full justify-center border-green-200 hover:bg-green-50 dark:border-green-800"
            >
              <Sparkles className="w-4 h-4 mr-2 text-green-600" />
              {showPrompt ? "Ocultar Prompt de IA" : "Ver Prompt para gerar imagem"}
              <ChevronDown className={cn("w-4 h-4 ml-2 transition-transform", showPrompt && "rotate-180")} />
            </Button>

            <AnimatePresence>
              {showPrompt && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-gray-900 rounded-xl relative group">
                    <div className="absolute top-2 right-2">
                      <CopyButton textToCopy={post.image_prompt} className="h-7 w-7 text-white hover:bg-white/20" />
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">
                      Prompt para Midjourney / DALL-E
                    </p>
                    <p className="text-sm text-gray-100 font-mono leading-relaxed">
                      {post.image_prompt}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================
// 5. STORY CARD (Melhorado)
// ============================================
export function StoryCard({ story, index, onSchedule }: {
  story: StorySequenceContent;
  index: number;
  onSchedule: () => void;
}) {
  const fullTextToCopy = `📱 STORIES: ${story.theme}\n\n` +
    story.slides.map(s => `Story ${s.slide_number} (${s.type}):\n${s.content}${s.options ? '\nOpções: ' + s.options.join(', ') : ''}`).join('\n\n') +
    (story.engagement_tips?.length ? `\n\n💡 Dicas: ${story.engagement_tips.join(' | ')}` : '');

  const getSlideIcon = (type: string) => {
    switch (type) {
      case "Poll": return "📊";
      case "Quiz": return "❓";
      case "Q&A": return "💬";
      case "Link": return "🔗";
      default: return "📝";
    }
  };

  const getSlideColor = (type: string) => {
    switch (type) {
      case "Poll": return "from-blue-500 to-cyan-500";
      case "Quiz": return "from-purple-500 to-pink-500";
      case "Q&A": return "from-green-500 to-emerald-500";
      case "Link": return "from-orange-500 to-red-500";
      default: return "from-gray-500 to-gray-600";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden border-2 hover:border-orange-400 hover:shadow-lg transition-all">
        <div className="h-1.5 bg-gradient-to-r from-orange-500 via-yellow-500 to-amber-500" />

        <CardHeader className="pb-3 px-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1 min-w-0">
              <Badge className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white">
                <MessageSquare className="w-3 h-3 mr-1" />
                Story Sequence #{index + 1}
              </Badge>
              <CardTitle className="text-lg sm:text-xl leading-tight line-clamp-2">
                {story.theme}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {story.slides.length} stories interativos
              </p>
            </div>

            <div className="flex gap-1.5 shrink-0">
              <CopyButton textToCopy={fullTextToCopy} className="h-9 w-9" />
              <Button
                size="icon"
                onClick={onSchedule}
                className="h-9 w-9 bg-orange-600 hover:bg-orange-700"
              >
                <Calendar className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 pb-6 space-y-4">
          {/* Grid de Stories */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {story.slides.map((slide) => (
              <motion.div
                key={slide.slide_number}
                whileHover={{ scale: 1.03 }}
                className="aspect-[9/16] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl p-3 border-2 border-gray-200 dark:border-gray-700 flex flex-col relative overflow-hidden group"
              >
                {/* Faixa colorida do tipo */}
                <div className={cn(
                  "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
                  getSlideColor(slide.type)
                )} />

                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-[9px] h-5 bg-white dark:bg-gray-800">
                    {getSlideIcon(slide.type)} {slide.type}
                  </Badge>
                  <span className="text-[10px] font-bold text-gray-400">
                    {slide.slide_number}
                  </span>
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <p className="text-[11px] sm:text-xs font-medium text-center leading-snug px-1">
                    {slide.content}
                  </p>
                </div>

                {/* Opções (para Poll/Quiz) */}
                {slide.options && (
                  <div className="mt-auto space-y-1">
                    {slide.options.slice(0, 2).map((opt, i) => (
                      <div
                        key={i}
                        className="text-[9px] bg-white dark:bg-gray-800 border rounded px-1.5 py-1 text-center truncate"
                      >
                        {opt}
                      </div>
                    ))}
                    {slide.options.length > 2 && (
                      <p className="text-[8px] text-center text-gray-400">
                        +{slide.options.length - 2} opções
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Dicas de Engajamento */}
          {story.engagement_tips && story.engagement_tips.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-yellow-500 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-yellow-800 dark:text-yellow-200 uppercase">
                  Dicas de Engajamento
                </span>
              </div>
              <ul className="space-y-2">
                {story.engagement_tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-yellow-900 dark:text-yellow-100">
                    <CheckCircle2 className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================
// EXPORTS ADICIONAIS PARA COMPATIBILIDADE
// ============================================
export { ReelCardPro as ReelCard };