// components/brain/ContentCards.tsx

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video, Layers, Camera, MessageSquare, Clock, Copy, Check,
  ChevronDown, ChevronUp, Calendar, Play, Volume2,
  Film, Lightbulb, Target, Zap, Crown, Music, Scissors,
  Eye, TrendingUp, Hash, Sparkles, Timer, Clapperboard,
  MonitorPlay, Palette, Type, ImageIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ReelContent,
  CarouselContent,
  ImagePostContent,
  StorySequenceContent,

} from "@/app/types/brain";

// =================================================================
// UTILS
// =================================================================

const copyToClipboard = async (text: string, label: string = "Texto") => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  } catch {
    toast.error("Erro ao copiar");
  }
};

// Helper para pegar valores com fallback
const getReelHook = (reel: ReelContent): string => {
  return reel.hook_text || reel.hook || "";
};

const getReelMainPoints = (reel: ReelContent): string[] => {
  return reel.key_messages || reel.main_points || [];
};

const getReelCta = (reel: ReelContent): string => {
  return reel.cta_text || reel.cta || "";
};

const getCarouselCtaSlide = (carousel: CarouselContent): string => {
  return carousel.final_cta_slide || carousel.cta_slide || "";
};

const getCarouselDesignTips = (carousel: CarouselContent): string[] => {
  return carousel.design_tips || [];
};

const getSlideContent = (slide: { content?: string; body_text?: string; title?: string; headline?: string }): string => {
  return slide.body_text || slide.content || "";
};

const getSlideTitle = (slide: { title?: string; headline?: string }): string => {
  return slide.headline || slide.title || "";
};

const getImageCaption = (post: ImagePostContent): string => {
  return post.full_caption || post.caption || "";
};

const getImagePrompt = (post: ImagePostContent): string => {
  return post.image_generation_prompt || post.image_prompt || "";
};

const getImageIdea = (post: ImagePostContent): string => {
  return post.concept || post.idea || "";
};

const getImageBestTime = (post: ImagePostContent): string => {
  return post.best_posting_time || post.best_time || "";
};

const getStoryEngagementTips = (story: StorySequenceContent): string[] => {
  return story.engagement_hooks || story.engagement_tips || [];
};

// =================================================================
// REEL CARD PRO (Simplificado)
// =================================================================

interface ReelCardProProps {
  reel: ReelContent;
  index: number;
  onSchedule: () => void;
}

export const ReelCardPro = ({ reel, index, onSchedule }: ReelCardProProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    await copyToClipboard(text, field);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const hook = getReelHook(reel);
  const mainPoints = getReelMainPoints(reel);
  const cta = getReelCta(reel);

  const fullScript = `
GANCHO: ${hook}

PONTOS PRINCIPAIS:
${mainPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

CTA: ${cta}

VISUAL: ${reel.visual_suggestion || 'Não especificado'}
ÁUDIO: ${reel.audio_suggestion || 'Não especificado'}
  `.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 hover:shadow-lg">
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shrink-0">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base sm:text-lg font-bold truncate">
                  {reel.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    <Play className="w-3 h-3 mr-1" />
                    Reel #{index + 1}
                  </Badge>
                  {reel.total_duration && (
                    <Badge variant="outline" className="text-xs">
                      <Timer className="w-3 h-3 mr-1" />
                      {reel.total_duration}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Hook */}
          {hook && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  GANCHO
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(hook, "Gancho")}
                  className="h-6 px-2"
                >
                  {copiedField === "Gancho" ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
              <p className="text-sm font-medium">&ldquo;{hook}&rdquo;</p>
            </div>
          )}

          {/* Pontos Principais */}
          {mainPoints.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                PONTOS PRINCIPAIS
              </span>
              <ul className="space-y-2">
                {mainPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="w-5 h-5 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-xs font-bold text-purple-600 shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="flex-1">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          {cta && (
            <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <span className="text-xs font-semibold text-green-700 dark:text-green-400 flex items-center gap-1 mb-1">
                <Target className="w-3 h-3" />
                CALL TO ACTION
              </span>
              <p className="text-sm">{cta}</p>
            </div>
          )}

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <Separator />

                {/* Sugestões */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {reel.visual_suggestion && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                        <Eye className="w-3 h-3" />
                        Visual
                      </span>
                      <p className="text-sm">{reel.visual_suggestion}</p>
                    </div>
                  )}
                  {reel.audio_suggestion && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                        <Volume2 className="w-3 h-3" />
                        Áudio
                      </span>
                      <p className="text-sm">{reel.audio_suggestion}</p>
                    </div>
                  )}
                </div>

                {/* Transições e Ângulos */}
                {((reel.transitions && reel.transitions.length > 0) || (reel.camera_angles_summary && reel.camera_angles_summary.length > 0)) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {reel.camera_angles_summary && reel.camera_angles_summary.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-2">
                          <Camera className="w-3 h-3" />
                          Ângulos
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {reel.camera_angles_summary.map((angle, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {angle}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {reel.transitions && reel.transitions.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-2">
                          <Film className="w-3 h-3" />
                          Transições
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {reel.transitions.map((trans, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {trans}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {reel.editing_notes && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1 block">
                      📝 Notas de Edição
                    </span>
                    <p className="text-sm">{reel.editing_notes}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(fullScript, "Roteiro")}
              className="flex-1 min-w-[120px]"
            >
              {copiedField === "Roteiro" ? (
                <Check className="w-4 h-4 mr-2 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              Copiar Roteiro
            </Button>
            <Button
              size="sm"
              onClick={onSchedule}
              className="flex-1 min-w-[120px] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Agendar
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// =================================================================
// REEL CARD ULTRA (Completo com Timeline)
// =================================================================

interface ReelCardUltraProps {
  reel: ReelContent;
  index: number;
  onSchedule: () => void;
}

export const ReelCardUltra = ({ reel, index, onSchedule }: ReelCardUltraProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTimelineIndex, setActiveTimelineIndex] = useState(0);

  const handleCopy = async (text: string, field: string) => {
    await copyToClipboard(text, field);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const hook = getReelHook(reel);
  const mainPoints = getReelMainPoints(reel);
  const cta = getReelCta(reel);

  // Construir script completo
  const buildFullScript = () => {
    let script = `🎬 ${reel.title}\n\n`;

    if (reel.concept) script += `📝 CONCEITO: ${reel.concept}\n\n`;
    if (hook) script += `🎯 GANCHO: "${hook}"\n`;
    if (reel.hook_visual) script += `👁️ VISUAL DO GANCHO: ${reel.hook_visual}\n\n`;

    if (mainPoints.length > 0) {
      script += `📌 PONTOS PRINCIPAIS:\n`;
      mainPoints.forEach((p, i) => script += `${i + 1}. ${p}\n`);
      script += '\n';
    }

    if (cta) script += `🎯 CTA: ${cta}\n\n`;

    if (reel.script_timeline && reel.script_timeline.length > 0) {
      script += `⏱️ TIMELINE DETALHADA:\n`;
      script += `${'─'.repeat(40)}\n`;
      reel.script_timeline.forEach((item) => {
        const timestamp = item.timestamp || `${item.start_time || '00:00'}-${item.end_time || '00:00'}`;
        script += `\n[${timestamp}]\n`;
        if (item.spoken_text) script += `🎤 Fala: "${item.spoken_text}"\n`;
        if (item.action_description || item.action) script += `🎬 Ação: ${item.action_description || item.action}\n`;
        if (item.camera_angle) script += `📷 Câmera: ${item.camera_angle}\n`;
        if (item.camera_movement) script += `🎥 Movimento: ${item.camera_movement}\n`;
        if (item.screen_text_overlay || item.screen_text) script += `📝 Texto na tela: ${item.screen_text_overlay || item.screen_text}\n`;
        if (item.sound_effect) script += `🔊 Efeito: ${item.sound_effect}\n`;
        if (item.visual_effect) script += `✨ Transição: ${item.visual_effect}\n`;
        if (item.retention_technique) script += `💡 Técnica: ${item.retention_technique}\n`;
      });
      script += '\n';
    }

    if (reel.posting_caption) {
      script += `📱 LEGENDA:\n${reel.posting_caption}\n\n`;
    }

    if (reel.hashtags && reel.hashtags.length > 0) {
      script += `#️⃣ HASHTAGS:\n${reel.hashtags.join(' ')}\n`;
    }

    return script.trim();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden border-2 border-purple-300 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-xl shadow-purple-500/10">
        {/* Header Ultra */}
        <CardHeader className="pb-3 bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 dark:from-purple-950/50 dark:via-pink-950/50 dark:to-orange-950/50">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2.5 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-xl shadow-lg shrink-0">
                <Clapperboard className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base sm:text-lg font-bold truncate flex items-center gap-2">
                  {reel.title}
                  <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />
                </CardTitle>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    ULTRA #{index + 1}
                  </Badge>
                  {reel.total_duration && (
                    <Badge variant="outline" className="text-xs">
                      <Timer className="w-3 h-3 mr-1" />
                      {reel.total_duration}
                    </Badge>
                  )}
                  {reel.viral_score_prediction && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Score: {reel.viral_score_prediction}/10
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Conceito */}
          {reel.concept && (
            <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3" />
                CONCEITO
              </span>
              <p className="text-sm">{reel.concept}</p>
            </div>
          )}

          {/* Hook Ultra */}
          {hook && (
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 rounded-lg border border-yellow-300 dark:border-yellow-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    GANCHO DESTRUIDOR
                  </span>
                  {reel.hook_type && (
                    <Badge variant="outline" className="text-xs">
                      {reel.hook_type}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(hook, "Gancho")}
                  className="h-6 px-2"
                >
                  {copiedField === "Gancho" ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
              <p className="text-base font-bold">&ldquo;{hook}&rdquo;</p>
              {reel.hook_visual && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Visual: {reel.hook_visual}
                </p>
              )}
            </div>
          )}

          {/* Timeline Toggle */}
          {reel.script_timeline && reel.script_timeline.length > 0 && (
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTimeline(!showTimeline)}
                className="w-full justify-between bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-300 dark:border-purple-700"
              >
                <span className="flex items-center gap-2">
                  <MonitorPlay className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold">Timeline Frame-a-Frame</span>
                  <Badge className="bg-purple-600 text-white text-xs">
                    {reel.script_timeline.length} momentos
                  </Badge>
                </span>
                {showTimeline ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>

              <AnimatePresence>
                {showTimeline && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 overflow-hidden"
                  >
                    {/* Timeline Horizontal Scrollable */}
                    <ScrollArea className="w-full pb-4">
                      <div className="flex gap-3 pb-2" style={{ minWidth: 'max-content' }}>
                        {reel.script_timeline.map((item, i) => {
                          const timestamp = item.timestamp || `${item.start_time || '00:00'}-${item.end_time || '00:00'}`;
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              onClick={() => setActiveTimelineIndex(i)}
                              className={cn(
                                "w-[280px] sm:w-[320px] p-4 rounded-xl border-2 cursor-pointer transition-all shrink-0",
                                activeTimelineIndex === i
                                  ? "border-purple-500 bg-purple-50 dark:bg-purple-950/50 shadow-lg"
                                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-purple-300"
                              )}
                            >
                              {/* Timestamp Header */}
                              <div className="flex items-center justify-between mb-3">
                                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {timestamp}
                                </Badge>
                                {item.duration_seconds && (
                                  <span className="text-xs text-muted-foreground">
                                    {item.duration_seconds}s
                                  </span>
                                )}
                              </div>

                              {/* Content */}
                              <div className="space-y-2 text-sm">
                                {(item.spoken_text) && (
                                  <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                    <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 mb-1">
                                      <Volume2 className="w-3 h-3" />
                                      Fala
                                    </span>
                                    <p className="text-xs font-medium line-clamp-2">&ldquo;{item.spoken_text}&rdquo;</p>
                                  </div>
                                )}

                                {(item.action_description || item.action) && (
                                  <div className="flex items-start gap-2">
                                    <Play className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                                    <span className="text-xs line-clamp-2">{item.action_description || item.action}</span>
                                  </div>
                                )}

                                {item.camera_angle && (
                                  <div className="flex items-center gap-2">
                                    <Camera className="w-3 h-3 text-purple-500 shrink-0" />
                                    <span className="text-xs truncate">{item.camera_angle}</span>
                                  </div>
                                )}

                                {(item.screen_text_overlay || item.screen_text) && (
                                  <div className="flex items-center gap-2">
                                    <Type className="w-3 h-3 text-orange-500 shrink-0" />
                                    <span className="text-xs truncate">{item.screen_text_overlay || item.screen_text}</span>
                                  </div>
                                )}

                                {item.retention_technique && (
                                  <Badge variant="outline" className="text-xs w-full justify-center mt-2 bg-green-50 text-green-700 border-green-300">
                                    💡 {item.retention_technique}
                                  </Badge>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>

                    {/* Timeline Detail for Selected */}
                    {reel.script_timeline[activeTimelineIndex] && (
                      <motion.div
                        key={activeTimelineIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-200 dark:border-purple-800"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Clapperboard className="w-4 h-4 text-purple-600" />
                          <span className="font-bold text-sm">Detalhes do Momento {activeTimelineIndex + 1}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          {reel.script_timeline[activeTimelineIndex].camera_movement && (
                            <div className="p-2 bg-white dark:bg-black/20 rounded-lg">
                              <span className="text-xs text-muted-foreground">Movimento de Câmera</span>
                              <p className="font-medium">{reel.script_timeline[activeTimelineIndex].camera_movement}</p>
                            </div>
                          )}
                          {reel.script_timeline[activeTimelineIndex].sound_effect && (
                            <div className="p-2 bg-white dark:bg-black/20 rounded-lg">
                              <span className="text-xs text-muted-foreground">Efeito Sonoro</span>
                              <p className="font-medium">{reel.script_timeline[activeTimelineIndex].sound_effect}</p>
                            </div>
                          )}
                          {reel.script_timeline[activeTimelineIndex].music_cue && (
                            <div className="p-2 bg-white dark:bg-black/20 rounded-lg">
                              <span className="text-xs text-muted-foreground">Música</span>
                              <p className="font-medium">{reel.script_timeline[activeTimelineIndex].music_cue}</p>
                            </div>
                          )}
                          {reel.script_timeline[activeTimelineIndex].visual_effect && (
                            <div className="p-2 bg-white dark:bg-black/20 rounded-lg">
                              <span className="text-xs text-muted-foreground">Efeito Visual</span>
                              <p className="font-medium">{reel.script_timeline[activeTimelineIndex].visual_effect}</p>
                            </div>
                          )}
                          {reel.script_timeline[activeTimelineIndex].emotion_tone && (
                            <div className="p-2 bg-white dark:bg-black/20 rounded-lg">
                              <span className="text-xs text-muted-foreground">Tom Emocional</span>
                              <p className="font-medium">{reel.script_timeline[activeTimelineIndex].emotion_tone}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <Separator />

                {/* Pontos Principais */}
                {mainPoints.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      MENSAGENS CHAVE
                    </span>
                    <ul className="space-y-2">
                      {mainPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="flex-1">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Especificações Técnicas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {reel.format && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                        <Film className="w-3 h-3" />
                        Formato
                      </span>
                      <p className="text-sm font-medium">{reel.format}</p>
                    </div>
                  )}
                  {reel.lighting_setup && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                        <Lightbulb className="w-3 h-3" />
                        Iluminação
                      </span>
                      <p className="text-sm">{reel.lighting_setup}</p>
                    </div>
                  )}
                  {reel.audio_track_style && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                        <Music className="w-3 h-3" />
                        Estilo Musical
                      </span>
                      <p className="text-sm">{reel.audio_track_style}</p>
                      {reel.audio_bpm_suggestion && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {reel.audio_bpm_suggestion} BPM
                        </Badge>
                      )}
                    </div>
                  )}
                  {reel.color_grading && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                        <Palette className="w-3 h-3" />
                        Color Grading
                      </span>
                      <p className="text-sm">{reel.color_grading}</p>
                    </div>
                  )}
                </div>

                {/* Equipamentos */}
                {reel.camera_equipment && reel.camera_equipment.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-2">
                      <Camera className="w-3 h-3" />
                      EQUIPAMENTO
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {reel.camera_equipment.map((eq, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {eq}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transições e Efeitos */}
                {((reel.transitions_used && reel.transitions_used.length > 0) || (reel.text_animations && reel.text_animations.length > 0)) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {reel.transitions_used && reel.transitions_used.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-2">
                          <Scissors className="w-3 h-3" />
                          Transições
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {reel.transitions_used.map((trans, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {trans}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {reel.text_animations && reel.text_animations.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-2">
                          <Type className="w-3 h-3" />
                          Animações de Texto
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {reel.text_animations.map((anim, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {anim}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Legenda e Hashtags */}
                {reel.posting_caption && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                        📱 LEGENDA COMPLETA
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(reel.posting_caption!, "Legenda")}
                        className="h-6 px-2"
                      >
                        {copiedField === "Legenda" ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{reel.posting_caption}</p>
                  </div>
                )}

                {reel.hashtags && reel.hashtags.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        HASHTAGS ({reel.hashtags.length})
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(reel.hashtags!.join(' '), "Hashtags")}
                        className="h-6 px-2"
                      >
                        {copiedField === "Hashtags" ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {reel.hashtags.slice(0, 15).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs text-blue-600">
                          {tag}
                        </Badge>
                      ))}
                      {reel.hashtags.length > 15 && (
                        <Badge variant="secondary" className="text-xs">
                          +{reel.hashtags.length - 15} mais
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Retenção e Melhorias */}
                {(reel.expected_retention_curve || reel.improvement_notes) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {reel.expected_retention_curve && (
                      <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <span className="text-xs font-semibold text-green-700 dark:text-green-400 flex items-center gap-1 mb-1">
                          <TrendingUp className="w-3 h-3" />
                          Curva de Retenção Esperada
                        </span>
                        <p className="text-sm">{reel.expected_retention_curve}</p>
                      </div>
                    )}
                    {reel.improvement_notes && (
                      <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                        <span className="text-xs font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-1 mb-1">
                          <Lightbulb className="w-3 h-3" />
                          Sugestões de Melhoria
                        </span>
                        <p className="text-sm">{reel.improvement_notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Best Time */}
                {reel.best_posting_time && (
                  <div className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">
                      <strong>Melhor horário:</strong> {reel.best_posting_time}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(buildFullScript(), "Roteiro Completo")}
              className="flex-1 min-w-[140px]"
            >
              {copiedField === "Roteiro Completo" ? (
                <Check className="w-4 h-4 mr-2 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              Copiar Tudo
            </Button>
            <Button
              size="sm"
              onClick={onSchedule}
              className="flex-1 min-w-[140px] bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Agendar
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// =================================================================
// CAROUSEL CARD
// =================================================================

interface CarouselCardProps {
  carousel: CarouselContent;
  index: number;
  onSchedule: () => void;
}

export const CarouselCard = ({ carousel, index, onSchedule }: CarouselCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    await copyToClipboard(text, field);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const ctaSlide = getCarouselCtaSlide(carousel);
  const designTips = getCarouselDesignTips(carousel);

  const fullContent = `
${carousel.title}

${carousel.slides.map((slide) => {
  const title = getSlideTitle(slide);
  const content = getSlideContent(slide);
  return `Slide ${slide.slide_number}: ${title}\n${content}`;
}).join('\n\n')}

CTA: ${ctaSlide}

${designTips.length > 0 ? `Dicas de Design:\n${designTips.join('\n')}` : ''}
  `.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 hover:shadow-lg">
        <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg shrink-0">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base sm:text-lg font-bold truncate">
                  {carousel.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    <Layers className="w-3 h-3 mr-1" />
                    {carousel.slides.length} slides
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Slide Navigator */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Slide {activeSlide + 1} de {carousel.slides.length}
              </span>
              <div className="flex gap-1">
                {carousel.slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      i === activeSlide
                        ? "bg-purple-600 w-6"
                        : "bg-gray-300 dark:bg-gray-600 hover:bg-purple-400"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Active Slide Preview */}
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-200 dark:border-purple-800 min-h-[120px]"
            >
              <Badge className="mb-2 bg-purple-600 text-white">
                Slide {carousel.slides[activeSlide].slide_number}
              </Badge>
              <h4 className="font-bold text-lg mb-2">
                {getSlideTitle(carousel.slides[activeSlide])}
              </h4>
              <p className="text-sm text-muted-foreground">
                {getSlideContent(carousel.slides[activeSlide])}
              </p>

              {/* Slide details for Ultra */}
              {carousel.slides[activeSlide].visual_description && (
                <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    Visual: {carousel.slides[activeSlide].visual_description}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Navigation Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
                disabled={activeSlide === 0}
                className="flex-1"
              >
                ← Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSlide(Math.min(carousel.slides.length - 1, activeSlide + 1))}
                disabled={activeSlide === carousel.slides.length - 1}
                className="flex-1"
              >
                Próximo →
              </Button>
            </div>
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <Separator />

                {/* CTA Slide */}
                {ctaSlide && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                    <span className="text-xs font-semibold text-green-700 dark:text-green-400 flex items-center gap-1 mb-1">
                      <Target className="w-3 h-3" />
                      SLIDE CTA
                    </span>
                    <p className="text-sm">{ctaSlide}</p>
                  </div>
                )}

                {/* Design Tips */}
                {designTips.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Palette className="w-3 h-3" />
                      DICAS DE DESIGN
                    </span>
                    <ul className="space-y-1">
                      {designTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Design Style and Colors (Ultra) */}
                {(carousel.design_style || carousel.brand_colors_suggestion) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {carousel.design_style && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <span className="text-xs font-semibold text-muted-foreground">Estilo de Design</span>
                        <p className="text-sm font-medium">{carousel.design_style}</p>
                      </div>
                    )}
                    {carousel.brand_colors_suggestion && carousel.brand_colors_suggestion.length > 0 && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <span className="text-xs font-semibold text-muted-foreground">Cores Sugeridas</span>
                        <div className="flex gap-2 mt-1">
                          {carousel.brand_colors_suggestion.map((color, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full border-2 border-white shadow"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Posting Caption */}
                {carousel.posting_caption && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                        📱 LEGENDA
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(carousel.posting_caption!, "Legenda")}
                        className="h-6 px-2"
                      >
                        {copiedField === "Legenda" ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{carousel.posting_caption}</p>
                  </div>
                )}

                {/* All Slides List */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    TODOS OS SLIDES
                  </span>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {carousel.slides.map((slide, i) => (
                      <div
                        key={i}
                        onClick={() => setActiveSlide(i)}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-all",
                          i === activeSlide
                            ? "bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700"
                            : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-purple-300"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {slide.slide_number}
                          </Badge>
                          <span className="font-medium text-sm truncate">
                            {getSlideTitle(slide)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {getSlideContent(slide)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(fullContent, "Carrossel")}
              className="flex-1 min-w-[120px]"
            >
              {copiedField === "Carrossel" ? (
                <Check className="w-4 h-4 mr-2 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              Copiar Tudo
            </Button>
            <Button
              size="sm"
              onClick={onSchedule}
              className="flex-1 min-w-[120px] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Agendar
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Importar CheckCircle2 que faltou
import { CheckCircle2 } from "lucide-react";

// =================================================================
// IMAGE POST CARD
// =================================================================

interface ImagePostCardProps {
  post: ImagePostContent;
  index: number;
  onSchedule: () => void;
}

export const ImagePostCard = ({ post, index, onSchedule }: ImagePostCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    await copyToClipboard(text, field);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const caption = getImageCaption(post);
  const imagePrompt = getImagePrompt(post);
  const idea = getImageIdea(post);
  const bestTime = getImageBestTime(post);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden border-2 hover:border-green-300 dark:hover:border-green-700 transition-all duration-300 hover:shadow-lg">
        <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shrink-0">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base sm:text-lg font-bold truncate">
                  {idea || `Post #${index + 1}`}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    <ImageIcon className="w-3 h-3 mr-1" />
                    Post de Imagem
                  </Badge>
                  {bestTime && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {bestTime}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Caption Preview */}
          {caption && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground">LEGENDA</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(caption, "Legenda")}
                  className="h-6 px-2"
                >
                  {copiedField === "Legenda" ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
              <p className="text-sm whitespace-pre-wrap line-clamp-4">{caption}</p>
            </div>
          )}

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  HASHTAGS
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(post.hashtags.join(' '), "Hashtags")}
                  className="h-6 px-2"
                >
                  {copiedField === "Hashtags" ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {post.hashtags.slice(0, 10).map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs text-green-600">
                    {tag}
                  </Badge>
                ))}
                {post.hashtags.length > 10 && (
                  <Badge variant="secondary" className="text-xs">
                    +{post.hashtags.length - 10}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <Separator />

                {/* Image Prompt */}
                {imagePrompt && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        PROMPT PARA GERAR IMAGEM (IA)
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(imagePrompt, "Prompt")}
                        className="h-6 px-2"
                      >
                        {copiedField === "Prompt" ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm">{imagePrompt}</p>
                  </div>
                )}

                {/* Visual Description */}
                {post.visual_description && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                      <Eye className="w-3 h-3" />
                      DESCRIÇÃO VISUAL
                    </span>
                    <p className="text-sm">{post.visual_description}</p>
                  </div>
                )}

                {/* Style and Composition (Ultra) */}
                {(post.style_reference || post.composition) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {post.style_reference && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <span className="text-xs font-semibold text-muted-foreground">Referência de Estilo</span>
                        <p className="text-sm">{post.style_reference}</p>
                      </div>
                    )}
                    {post.composition && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <span className="text-xs font-semibold text-muted-foreground">Composição</span>
                        <p className="text-sm">{post.composition}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Color Palette */}
                {post.color_palette && post.color_palette.length > 0 && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-2">
                                            <Palette className="w-3 h-3" />
                      PALETA DE CORES
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {post.color_palette.map((color, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-2 py-1 bg-white dark:bg-black/20 rounded-lg border"
                        >
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-xs font-mono">{color}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Text Overlay */}
                {post.text_overlay && (
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                    <span className="text-xs font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-1 mb-1">
                      <Type className="w-3 h-3" />
                      TEXTO NA IMAGEM
                    </span>
                    <p className="text-sm font-medium">{post.text_overlay}</p>
                  </div>
                )}

                {/* Caption Parts (Ultra) */}
                {(post.caption_hook || post.caption_body || post.caption_cta) && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground">ESTRUTURA DA LEGENDA</span>
                    <div className="space-y-2">
                      {post.caption_hook && (
                        <div className="p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border-l-4 border-yellow-500">
                          <span className="text-xs font-semibold text-yellow-700">Gancho</span>
                          <p className="text-sm">{post.caption_hook}</p>
                        </div>
                      )}
                      {post.caption_body && (
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg border-l-4 border-blue-500">
                          <span className="text-xs font-semibold text-blue-700">Corpo</span>
                          <p className="text-sm">{post.caption_body}</p>
                        </div>
                      )}
                      {post.caption_cta && (
                        <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded-lg border-l-4 border-green-500">
                          <span className="text-xs font-semibold text-green-700">CTA</span>
                          <p className="text-sm">{post.caption_cta}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Engagement Triggers */}
                {post.engagement_triggers && post.engagement_triggers.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-2">
                      <Zap className="w-3 h-3" />
                      GATILHOS DE ENGAJAMENTO
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {post.engagement_triggers.map((trigger, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Alt Text */}
                {post.alt_text && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                      <Eye className="w-3 h-3" />
                      TEXTO ALTERNATIVO (SEO)
                    </span>
                    <p className="text-sm text-muted-foreground">{post.alt_text}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(`${caption}\n\n${post.hashtags.join(' ')}`, "Post Completo")}
              className="flex-1 min-w-[120px]"
            >
              {copiedField === "Post Completo" ? (
                <Check className="w-4 h-4 mr-2 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              Copiar Tudo
            </Button>
            <Button
              size="sm"
              onClick={onSchedule}
              className="flex-1 min-w-[120px] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Agendar
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// =================================================================
// STORY CARD
// =================================================================

interface StoryCardProps {
  story: StorySequenceContent;
  index: number;
  onSchedule: () => void;
}

export const StoryCard = ({ story, index, onSchedule }: StoryCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeStory, setActiveStory] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    await copyToClipboard(text, field);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const engagementTips = getStoryEngagementTips(story);

  const getStoryTypeIcon = (type: string) => {
    switch (type) {
      case "Poll": return "📊";
      case "Quiz": return "❓";
      case "Question":
      case "Q&A": return "💬";
      case "Countdown": return "⏰";
      case "Link": return "🔗";
      case "Mention": return "@";
      case "Music": return "🎵";
      case "GIF": return "🎬";
      default: return "📝";
    }
  };

  const getStoryTypeColor = (type: string) => {
    switch (type) {
      case "Poll": return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400";
      case "Quiz": return "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400";
      case "Question":
      case "Q&A": return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400";
      case "Countdown": return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";
      case "Link": return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const fullContent = `
${story.theme}

${story.slides.map((slide) => {
  let content = `Story ${slide.slide_number} (${slide.type}): ${slide.content || slide.main_text || ''}`;
  if (slide.poll_question) content += `\nEnquete: ${slide.poll_question}\nOpções: ${(slide.poll_options || slide.options || []).join(', ')}`;
  if (slide.quiz_question) content += `\nQuiz: ${slide.quiz_question}\nOpções: ${(slide.quiz_options || []).join(', ')}`;
  return content;
}).join('\n\n')}

${engagementTips.length > 0 ? `\nDicas de Engajamento:\n${engagementTips.join('\n')}` : ''}
  `.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden border-2 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300 hover:shadow-lg">
        <CardHeader className="pb-3 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2.5 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-xl shadow-lg shrink-0">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base sm:text-lg font-bold truncate">
                  {story.theme}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {story.slides.length} stories
                  </Badge>
                  {story.highlight_worthy && (
                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                      ⭐ Destaque
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="shrink-0"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Story Navigator */}
          <div className="space-y-3">
            {/* Progress Bar */}
            <div className="flex gap-1">
              {story.slides.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setActiveStory(i)}
                  className={cn(
                    "h-1 flex-1 rounded-full cursor-pointer transition-all",
                    i === activeStory
                      ? "bg-gradient-to-r from-orange-500 to-yellow-500"
                      : i < activeStory
                        ? "bg-orange-300"
                        : "bg-gray-200 dark:bg-gray-700"
                  )}
                />
              ))}
            </div>

            {/* Active Story Preview */}
            <motion.div
              key={activeStory}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative p-4 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30 rounded-xl border border-orange-200 dark:border-orange-800 min-h-[150px]"
            >
              {/* Story Type Badge */}
              <div className="flex items-center justify-between mb-3">
                <Badge className={cn("text-xs", getStoryTypeColor(story.slides[activeStory].type))}>
                  {getStoryTypeIcon(story.slides[activeStory].type)} {story.slides[activeStory].type}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {activeStory + 1}/{story.slides.length}
                </span>
              </div>

              {/* Story Content */}
              <div className="space-y-3">
                <p className="text-sm font-medium">
                  {story.slides[activeStory].content || story.slides[activeStory].main_text}
                </p>

                {/* Poll */}
                {story.slides[activeStory].type === "Poll" && (story.slides[activeStory].poll_options || story.slides[activeStory].options) && (
                  <div className="space-y-2">
                    {story.slides[activeStory].poll_question && (
                      <p className="text-sm font-semibold">{story.slides[activeStory].poll_question}</p>
                    )}
                    {(story.slides[activeStory].poll_options || story.slides[activeStory].options)?.map((option, i) => (
                      <div
                        key={i}
                        className="p-2 bg-white dark:bg-black/20 rounded-lg border text-sm text-center"
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}

                {/* Quiz */}
                {story.slides[activeStory].type === "Quiz" && story.slides[activeStory].quiz_options && (
                  <div className="space-y-2">
                    {story.slides[activeStory].quiz_question && (
                      <p className="text-sm font-semibold">{story.slides[activeStory].quiz_question}</p>
                    )}
                    {story.slides[activeStory].quiz_options?.map((option, i) => (
                      <div
                        key={i}
                        className={cn(
                          "p-2 rounded-lg border text-sm text-center",
                          i === (story.slides[activeStory].quiz_correct_answer || 0)
                            ? "bg-green-100 dark:bg-green-950 border-green-300"
                            : "bg-white dark:bg-black/20"
                        )}
                      >
                        {option}
                        {i === (story.slides[activeStory].quiz_correct_answer || 0) && " ✓"}
                      </div>
                    ))}
                  </div>
                )}

                {/* Question */}
                {(story.slides[activeStory].type === "Question" || story.slides[activeStory].type === "Q&A") && story.slides[activeStory].question_prompt && (
                  <div className="p-3 bg-white dark:bg-black/20 rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground text-center">
                      {story.slides[activeStory].question_prompt}
                    </p>
                  </div>
                )}

                {/* Link */}
                {story.slides[activeStory].type === "Link" && story.slides[activeStory].link_label && (
                  <div className="p-3 bg-blue-100 dark:bg-blue-950/50 rounded-lg text-center">
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                      🔗 {story.slides[activeStory].link_label}
                    </span>
                  </div>
                )}

                {/* Duration */}
                {story.slides[activeStory].duration_seconds && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Timer className="w-3 h-3" />
                    {story.slides[activeStory].duration_seconds}s
                  </div>
                )}

                {/* Engagement Goal */}
                {story.slides[activeStory].engagement_goal && (
                  <Badge variant="outline" className="text-xs">
                    🎯 {story.slides[activeStory].engagement_goal}
                  </Badge>
                )}
              </div>
            </motion.div>

            {/* Navigation */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveStory(Math.max(0, activeStory - 1))}
                disabled={activeStory === 0}
                className="flex-1"
              >
                ← Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveStory(Math.min(story.slides.length - 1, activeStory + 1))}
                disabled={activeStory === story.slides.length - 1}
                className="flex-1"
              >
                Próximo →
              </Button>
            </div>
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4 overflow-hidden"
              >
                <Separator />

                {/* Narrative Arc (Ultra) */}
                {story.narrative_arc && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                    <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-1 mb-1">
                      <Film className="w-3 h-3" />
                      ARCO NARRATIVO
                    </span>
                    <p className="text-sm">{story.narrative_arc}</p>
                  </div>
                )}

                {/* Engagement Tips */}
                {engagementTips.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      DICAS DE ENGAJAMENTO
                    </span>
                    <ul className="space-y-1">
                      {engagementTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Response Strategy (Ultra) */}
                {story.response_strategy && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <span className="text-xs font-semibold text-green-700 dark:text-green-400 flex items-center gap-1 mb-1">
                      <MessageSquare className="w-3 h-3" />
                      ESTRATÉGIA DE RESPOSTA
                    </span>
                    <p className="text-sm">{story.response_strategy}</p>
                  </div>
                )}

                {/* Posting Schedule */}
                {story.posting_schedule && (
                  <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm">
                      <strong>Quando postar:</strong> {story.posting_schedule}
                    </span>
                  </div>
                )}

                {/* Highlight Cover Idea */}
                {story.highlight_worthy && story.highlight_cover_idea && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 flex items-center gap-1 mb-1">
                      ⭐ CAPA DO DESTAQUE
                    </span>
                    <p className="text-sm">{story.highlight_cover_idea}</p>
                  </div>
                )}

                {/* All Stories List */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    TODOS OS STORIES
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {story.slides.map((slide, i) => (
                      <div
                        key={i}
                        onClick={() => setActiveStory(i)}
                        className={cn(
                          "p-2 rounded-lg border cursor-pointer transition-all text-center",
                          i === activeStory
                            ? "bg-orange-100 dark:bg-orange-950/30 border-orange-300 dark:border-orange-700"
                            : "bg-gray-50 dark:bg-gray-800/50 hover:border-orange-300"
                        )}
                      >
                        <span className="text-lg">{getStoryTypeIcon(slide.type)}</span>
                        <p className="text-xs font-medium mt-1">{slide.type}</p>
                        <p className="text-xs text-muted-foreground">#{slide.slide_number}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(fullContent, "Stories")}
              className="flex-1 min-w-[120px]"
            >
              {copiedField === "Stories" ? (
                <Check className="w-4 h-4 mr-2 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              Copiar Tudo
            </Button>
            <Button
              size="sm"
              onClick={onSchedule}
              className="flex-1 min-w-[120px] bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Agendar
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};