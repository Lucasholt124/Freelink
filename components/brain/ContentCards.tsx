"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Video, Layers, Camera, MessageSquare, Calendar, Zap,
  Activity, Flame, ChevronDown, Copy, Check,
  Clapperboard, MonitorPlay, Volume2, Type, Scissors,
  Lightbulb, Palette, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CarouselContent, ImagePostContent, ReelContent, StorySequenceContent } from "@/app/types/brain";

// ============================================
// HELPER: COPY BUTTON
// ============================================
function CopyButton({ textToCopy, className }: { textToCopy: string, className?: string }) {
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
      size="icon"
      variant="ghost"
      className={cn(
        "h-8 w-8 transition-all touch-manipulation hover:bg-purple-100 dark:hover:bg-purple-900/20 active:scale-95",
        copied && "text-emerald-600 bg-emerald-50",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check"
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
          >
            <Check className="w-4 h-4" />
          </motion.div>
        ) : (
          <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Copy className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}

// ============================================
// HELPER: SCORES
// ============================================
function getDeterministicScore(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return 70 + (Math.abs(hash) % 30);
}

// ============================================
// 1. REEL CARD
// ============================================
export function ReelCard({ reel, index, onSchedule }: {
  reel: ReelContent;
  index: number;
  onSchedule: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const isUltraDetail = reel.script_timeline && reel.script_timeline.length > 0;
  const viralScore = reel.viralScore || getDeterministicScore(reel.title + reel.hook);
  const estimatedReach = reel.estimatedReach || `${Math.floor(Math.random() * 50) + 10}k-${Math.floor(Math.random() * 100) + 50}k`;

  const fullTextToCopy = isUltraDetail
    ? `🎬 REEL TÉCNICO\n${reel.title}\n\nROTEIRO:\n${JSON.stringify(reel.script_timeline, null, 2)}`
    : `🎬 REEL\n${reel.title}\n\nHOOK: ${reel.hook}\n\nPONTOS:\n${reel.main_points.join('\n')}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="w-full"
    >
      <Card className={cn(
        "overflow-hidden group transition-all duration-300 border-2",
        isUltraDetail
          ? "border-purple-500/40 bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-950 dark:to-purple-900/10 shadow-lg shadow-purple-500/10"
          : "hover:border-purple-500/50 hover:shadow-xl"
      )}>
        <div className={cn(
          "h-1.5 w-full",
          isUltraDetail
            ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-gradient-x"
            : "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
        )} />

        <CardHeader className="pb-3 px-3 sm:px-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge className={cn(
                    "text-white shadow-md text-[10px] sm:text-xs px-1.5 py-0.5",
                    isUltraDetail ? "bg-gradient-to-r from-purple-700 to-indigo-600" : "bg-gradient-to-r from-purple-600 to-pink-600"
                  )}>
                    {isUltraDetail ? <Clapperboard className="w-3 h-3 mr-1" /> : <Video className="w-3 h-3 mr-1" />}
                    {isUltraDetail ? `Roteiro #${index + 1}` : `Reel #${index + 1}`}
                  </Badge>

                  {isUltraDetail && (
                    <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 text-[10px] sm:text-xs">
                      <Zap className="w-3 h-3 mr-1 fill-amber-500 text-amber-500" />
                      ULTRA
                    </Badge>
                  )}

                  {viralScore > 85 && (
                    <Badge className="bg-red-500 text-white animate-pulse text-[10px] sm:text-xs px-1.5 py-0.5">
                      <Flame className="w-3 h-3 mr-1" /> VIRAL
                    </Badge>
                  )}
                </div>

                <CardTitle className="text-base sm:text-xl font-bold leading-tight group-hover:text-purple-700 transition-colors line-clamp-2">
                  {reel.title}
                </CardTitle>
              </div>

              {/* Ações Rápidas Topo Mobile */}
              <div className="flex gap-1">
                <CopyButton textToCopy={fullTextToCopy} />
                <Button size="icon" onClick={onSchedule} className={cn("h-8 w-8 shadow-sm", isUltraDetail ? "bg-purple-900" : "bg-purple-600")}>
                  <Calendar className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground bg-white/50 dark:bg-black/20 p-2 rounded-lg w-fit">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-purple-500" />
                <span className="font-semibold">{viralScore}% Potencial</span>
              </div>
              <div className="w-px h-3 bg-gray-300" />
              <div className="truncate">Alcance: <span className="font-medium text-foreground">{estimatedReach}</span></div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-3 sm:px-6 pb-6 space-y-4 sm:space-y-6">
          {/* HOOK */}
          <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
             <p className="text-[10px] sm:text-xs font-bold text-purple-800 dark:text-purple-300 mb-1 uppercase tracking-wider flex items-center gap-2">
               <Zap className="w-3 h-3" /> Gancho (0-3s)
             </p>
             <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 leading-snug">{reel.hook}</p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full h-8 text-xs text-muted-foreground hover:bg-gray-100"
          >
            {isExpanded ? "Ocultar Detalhes" : "Ver Roteiro Completo"}
            <ChevronDown className={cn("w-3 h-3 ml-2 transition-transform", isExpanded && "rotate-180")} />
          </Button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                {isUltraDetail ? (
                  /* --- MODO ULTRA: TIMELINE --- */
                  <div className="space-y-6 pt-2">
                     <div className="relative pl-8 sm:pl-10 border-l-2 border-purple-200 dark:border-purple-800 space-y-6 sm:space-y-8 ml-2 sm:ml-0">
                        {reel.script_timeline?.map((scene, idx) => (
                           <div key={idx} className="relative">
                             {/* Bolinha do Tempo - Ajustado para mobile */}
                             <div className="absolute -left-[41px] sm:-left-[49px] top-0 bg-purple-600 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm z-10 w-[35px] text-center">
                               {scene.start_time}
                             </div>

                             <div className="bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
                                 <div>
                                   <div className="flex items-center gap-2 mb-1 text-purple-600 font-bold text-[10px] sm:text-xs uppercase">
                                     <MonitorPlay className="w-3.5 h-3.5" /> Ação / Visual
                                   </div>
                                   <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{scene.action}</p>
                                 </div>

                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                                       <span className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 uppercase mb-1">
                                         <Camera className="w-3 h-3" /> Câmera
                                       </span>
                                       <span className="text-xs text-gray-600 dark:text-gray-400 block">{scene.camera_angle}</span>
                                    </div>

                                    {scene.screen_text && (
                                      <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                                         <span className="flex items-center gap-1.5 text-[10px] font-bold text-pink-500 uppercase mb-1">
                                           <Type className="w-3 h-3" /> Texto Tela
                                         </span>
                                         <span className="text-xs text-gray-600 dark:text-gray-400 font-medium block">{scene.screen_text}</span>
                                      </div>
                                    )}

                                    <div className="sm:col-span-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                                       <span className="flex items-center gap-1.5 text-[10px] font-bold text-orange-500 uppercase mb-1">
                                         <Volume2 className="w-3 h-3" /> Áudio / SFX
                                       </span>
                                       <span className="text-xs text-gray-600 dark:text-gray-400 block">{scene.audio_note}</span>
                                    </div>
                                 </div>
                             </div>
                           </div>
                        ))}
                     </div>

                     <div className="bg-amber-50 dark:bg-amber-900/20 p-3 sm:p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                        <h4 className="text-xs font-bold text-amber-800 dark:text-amber-200 uppercase flex items-center gap-2 mb-2">
                           <Scissors className="w-3.5 h-3.5" /> Instruções de Edição
                        </h4>
                        <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-100 italic leading-relaxed">{reel.editing_notes}</p>
                     </div>
                  </div>
                ) : (
                  /* --- MODO PRO --- */
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      {reel.main_points.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                           <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] sm:text-xs font-bold">
                             {idx + 1}
                           </div>
                           <p className="text-sm text-gray-700 dark:text-gray-300">{point}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100">
                          <p className="text-xs font-bold text-blue-700 mb-1">Visual</p>
                          <p className="text-xs text-blue-900 dark:text-blue-100 leading-relaxed">{reel.visual_suggestion}</p>
                       </div>
                       <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100">
                          <p className="text-xs font-bold text-indigo-700 mb-1">Áudio</p>
                          <p className="text-xs text-indigo-900 dark:text-indigo-100 leading-relaxed">{reel.audio_suggestion}</p>
                       </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 flex items-start gap-3">
                   <div className="p-1.5 bg-green-200 rounded text-green-700 shrink-0">
                      <MessageSquare className="w-4 h-4" />
                   </div>
                   <div>
                      <p className="text-[10px] sm:text-xs font-bold text-green-800 uppercase mb-0.5">Chamada para Ação (CTA)</p>
                      <p className="text-sm text-green-900 font-medium leading-snug">{reel.cta}</p>
                   </div>
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
// 2. CAROUSEL CARD
// ============================================
export function CarouselCard({ carousel, index, onSchedule }: {
  carousel: CarouselContent;
  index: number;
  onSchedule: () => void;
}) {
  return (
    <Card className="overflow-hidden border-2 hover:border-pink-400 hover:shadow-lg transition-all">
      <CardHeader className="bg-gray-50/50 dark:bg-gray-900/50 pb-4 px-4 pt-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <Badge className="bg-pink-500 hover:bg-pink-600 mb-2 text-[10px] sm:text-xs">
              <Layers className="w-3 h-3 mr-1.5" /> Carrossel #{index + 1}
            </Badge>
            <CardTitle className="text-base sm:text-lg leading-tight line-clamp-2">{carousel.title}</CardTitle>
          </div>
          <Button size="icon" onClick={onSchedule} className="bg-pink-600 hover:bg-pink-700 h-8 w-8 shrink-0">
             <Calendar className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4 px-4 space-y-4">
         <ScrollArea className="h-[200px] w-full pr-3">
            <div className="space-y-3">
               {carousel.slides.map((slide) => (
                 <div key={slide.slide_number} className="relative pl-8">
                    <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-pink-100 text-pink-700 font-bold text-xs flex items-center justify-center border border-pink-200">
                      {slide.slide_number}
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
                       <p className="text-[10px] font-bold text-pink-600 uppercase mb-1 truncate">{slide.title}</p>
                       <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{slide.content}</p>
                    </div>
                 </div>
               ))}
               <div className="relative pl-8">
                  <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-gray-800 text-white font-bold text-[8px] flex items-center justify-center">
                    END
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                     <p className="text-[10px] font-bold text-gray-600 uppercase mb-1">Slide Final (CTA)</p>
                     <p className="text-sm font-medium leading-snug">{carousel.cta_slide}</p>
                  </div>
               </div>
            </div>
         </ScrollArea>

         {carousel.design_tips && carousel.design_tips.length > 0 && (
           <div className="p-3 bg-pink-50 dark:bg-pink-900/10 rounded-lg border border-dashed border-pink-200">
              <p className="text-xs font-bold text-pink-700 mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> Dicas de Design
              </p>
              <div className="flex flex-wrap gap-1.5">
                 {carousel.design_tips.map((tip, i) => (
                    <Badge key={i} variant="secondary" className="bg-white border-pink-100 text-pink-600 font-normal text-[10px]">
                      {tip}
                    </Badge>
                 ))}
              </div>
           </div>
         )}
      </CardContent>
    </Card>
  );
}

// ============================================
// 3. IMAGE POST CARD
// ============================================
export function ImagePostCard({ post, index, onSchedule }: {
  post: ImagePostContent;
  index: number;
  onSchedule: () => void;
}) {
  return (
    <Card className="border-2 hover:border-green-400 hover:shadow-lg transition-all">
      <CardHeader className="pb-3 px-4 pt-4">
         <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
               <Badge className="bg-green-600 hover:bg-green-700 mb-2 text-[10px] sm:text-xs">
                 <Camera className="w-3 h-3 mr-1.5" /> Post #{index + 1}
               </Badge>
               <CardTitle className="text-base sm:text-lg leading-tight line-clamp-2">{post.idea}</CardTitle>
               <div className="flex items-center gap-2 mt-2 text-[10px] sm:text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" /> Melhor Horário: {post.best_time}
               </div>
            </div>
            <Button size="icon" onClick={onSchedule} className="bg-green-600 hover:bg-green-700 h-8 w-8 shrink-0">
               <Calendar className="w-4 h-4" />
            </Button>
         </div>
      </CardHeader>

      <CardContent className="space-y-4 px-4 pb-4">
         <div className="bg-gray-900 text-gray-100 p-3 sm:p-4 rounded-xl relative group">
            <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
               <CopyButton textToCopy={post.image_prompt} className="text-white hover:bg-white/20 h-6 w-6" />
            </div>
            <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase mb-1">Prompt de Imagem (AI)</p>
            <p className="text-xs sm:text-sm font-mono leading-relaxed opacity-90 line-clamp-4 hover:line-clamp-none transition-all">{post.image_prompt}</p>
         </div>

         <div className="space-y-2">
            <div className="flex justify-between items-center">
               <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Legenda</p>
               <CopyButton textToCopy={post.caption} className="h-6 w-6" />
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm whitespace-pre-wrap border max-h-[150px] overflow-y-auto">
               {post.caption}
            </div>
         </div>

         <div className="flex flex-wrap gap-1">
            {post.hashtags.map((tag, i) => (
               <span key={i} className="text-[10px] sm:text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100">
                 {tag}
               </span>
            ))}
         </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// 4. STORY CARD
// ============================================
export function StoryCard({ story, index, onSchedule }: {
  story: StorySequenceContent;
  index: number;
  onSchedule: () => void;
}) {
  return (
    <Card className="border-2 hover:border-yellow-400 hover:shadow-lg transition-all">
       <CardHeader className="pb-3 px-4 pt-4">
          <div className="flex justify-between items-start gap-2">
             <div className="flex-1 min-w-0">
                <Badge className="bg-yellow-500 hover:bg-yellow-600 mb-2 text-[10px] sm:text-xs">
                  <MessageSquare className="w-3 h-3 mr-1.5" /> Story Sequence #{index + 1}
                </Badge>
                <CardTitle className="text-base sm:text-lg leading-tight line-clamp-2">{story.theme}</CardTitle>
             </div>
             <Button size="icon" onClick={onSchedule} className="bg-yellow-600 hover:bg-yellow-700 h-8 w-8 shrink-0">
                <Calendar className="w-4 h-4" />
             </Button>
          </div>
       </CardHeader>

       <CardContent className="space-y-4 px-4 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
             {story.slides.map((slide) => (
                <div key={slide.slide_number} className="aspect-[9/16] bg-gray-100 dark:bg-gray-800 rounded-lg p-2 sm:p-3 border-2 border-gray-200 dark:border-gray-700 flex flex-col relative overflow-hidden">
                   <Badge variant="outline" className="self-start text-[8px] sm:text-[9px] bg-white mb-2 max-w-full truncate">{slide.type}</Badge>
                   <p className="text-[10px] sm:text-xs font-medium text-center my-auto leading-tight">{slide.content}</p>
                   {slide.options && (
                      <div className="mt-2 flex flex-col gap-1 w-full">
                         {slide.options.map((opt, i) => (
                            <div key={i} className="text-[8px] sm:text-[9px] bg-white border rounded px-1 py-0.5 text-center truncate">{opt}</div>
                         ))}
                      </div>
                   )}
                   <div className="absolute bottom-1 right-2 text-[10px] text-gray-400 font-bold">{slide.slide_number}</div>
                </div>
             ))}
          </div>

          {story.engagement_tips && story.engagement_tips.length > 0 && (
             <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200">
                <p className="text-xs font-bold text-yellow-800 mb-1 flex items-center gap-1">
                   <Lightbulb className="w-3 h-3" /> Dicas de Engajamento
                </p>
                <ul className="list-disc pl-4 space-y-1">
                   {story.engagement_tips.map((tip, i) => (
                      <li key={i} className="text-[10px] sm:text-xs text-yellow-900 dark:text-yellow-100 leading-tight">{tip}</li>
                   ))}
                </ul>
             </div>
          )}
       </CardContent>
    </Card>
  );
}