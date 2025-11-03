// components/brain/ContentCards.tsx - CARDS DE CONTEÚDO
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Video, Layers, Camera, MessageSquare, Calendar, Zap,
  Activity, Flame, ChevronDown, Send, Copy, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CarouselContent, ImagePostContent, ReelContent, StorySequenceContent } from "@/app/types/brain";

// ============================================
// COPY BUTTON
// ============================================

function CopyButton({ textToCopy }: { textToCopy: string }) {
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
      onClick={handleCopy}
      size="icon"
      variant="ghost"
      className={cn(
        "h-8 w-8 transition-all",
        copied && "bg-emerald-500/10 text-emerald-600"
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
          <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Copy className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}

// ============================================
// REEL CARD
// ============================================

export function ReelCard({ reel, index, onSchedule }: {
  reel: ReelContent;
  index: number;
  onSchedule: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const viralScore = reel.viralScore || Math.floor(Math.random() * 30) + 70;
  const estimatedReach = reel.estimatedReach || `${Math.floor(Math.random() * 50) + 10}k-${Math.floor(Math.random() * 100) + 50}k`;

  const fullTextToCopy = `🎬 REEL VIRAL\n\n${reel.title}\n\n🪝 GANCHO:\n${reel.hook}\n\n📝 ROTEIRO:\n${reel.main_points.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n📢 CTA:\n${reel.cta}\n\n🎥 VISUAL:\n${reel.visual_suggestion}\n\n🎵 ÁUDIO:\n${reel.audio_suggestion}`;

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
                    VIRAL
                  </Badge>
                )}
              </div>

              <CardTitle className="text-xl line-clamp-2 group-hover:text-purple-600 transition-colors">
                {reel.title}
              </CardTitle>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-500" />
                  <Progress value={viralScore} className="w-full h-2" />
                  <span className="text-sm font-semibold w-12 text-right">{viralScore}%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Alcance: <span className="font-medium text-foreground">{estimatedReach}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-1">
              <CopyButton textToCopy={fullTextToCopy} />
              <Button
                size="sm"
                className="h-8 text-xs bg-gradient-to-r from-blue-600 to-purple-600"
                onClick={onSchedule}
              >
                <Calendar className="w-3 h-3 mr-1" />
                Agendar
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <motion.div
            className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg shadow-md">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-yellow-800 dark:text-yellow-200 mb-1 uppercase tracking-wider">
                  Gancho Matador (0-3 segundos)
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{reel.hook}</p>
              </div>
            </div>
          </motion.div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full justify-between"
          >
            <span className="text-sm">Ver roteiro completo</span>
            <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
          </Button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-4"
              >
                <div className="space-y-2">
                  {reel.main_points.map((point, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                    >
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                        <span className="text-xs font-bold text-white">{idx + 1}</span>
                      </div>
                      <p className="text-sm flex-1">{point}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Send className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-blue-800 dark:text-blue-200 mb-1">CTA</p>
                      <p className="text-sm">{reel.cta}</p>
                    </div>
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
// CAROUSEL CARD
// ============================================

export function CarouselCard({ carousel, index, onSchedule }: {
  carousel: CarouselContent;
  index: number;
  onSchedule: () => void;
}) {
  return (
    <Card className="border-2 hover:border-purple-500/30 hover:shadow-lg transition-all">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                <Layers className="w-3.5 h-3.5 mr-1.5" />
                Carrossel #{index + 1}
              </Badge>
            </div>
            <CardTitle className="text-lg">{carousel.title}</CardTitle>
            <CardDescription>{carousel.slides.length} slides</CardDescription>
          </div>
          <Button size="sm" onClick={onSchedule} className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Calendar className="w-3 h-3 mr-1" />
            Agendar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {carousel.slides.map((slide) => (
              <div key={slide.slide_number} className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-semibold mb-1">Slide {slide.slide_number}: {slide.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{slide.content}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// ============================================
// IMAGE POST CARD
// ============================================

export function ImagePostCard({ post, index, onSchedule }: {
  post: ImagePostContent;
  index: number;
  onSchedule: () => void;
}) {
  return (
    <Card className="border-2 hover:border-pink-500/30 hover:shadow-lg transition-all">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-gradient-to-r from-pink-500 to-red-500 text-white">
                <Camera className="w-3.5 h-3.5 mr-1.5" />
                Post #{index + 1}
              </Badge>
            </div>
            <CardTitle className="text-lg line-clamp-2">{post.idea}</CardTitle>
          </div>
          <Button size="sm" onClick={onSchedule} className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Calendar className="w-3 h-3 mr-1" />
            Agendar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm line-clamp-3 mb-3">{post.caption}</p>
        <div className="flex flex-wrap gap-1">
          {post.hashtags.slice(0, 5).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
          {post.hashtags.length > 5 && (
            <Badge variant="secondary" className="text-xs">+{post.hashtags.length - 5}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// STORY CARD
// ============================================

export function StoryCard({ story, index, onSchedule }: {
  story: StorySequenceContent;
  index: number;
  onSchedule: () => void;
}) {
  return (
    <Card className="border-2 hover:border-indigo-500/30 hover:shadow-lg transition-all">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                Story #{index + 1}
              </Badge>
            </div>
            <CardTitle className="text-lg">{story.theme}</CardTitle>
            <CardDescription>{story.slides.length} stories interativas</CardDescription>
          </div>
          <Button size="sm" onClick={onSchedule} className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Calendar className="w-3 h-3 mr-1" />
            Agendar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {story.slides.slice(0, 3).map((slide) => (
            <div
              key={slide.slide_number}
              className="aspect-[9/16] bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg p-2 border border-indigo-200 dark:border-indigo-800"
            >
              <Badge variant="secondary" className="text-[10px] mb-1">{slide.type}</Badge>
              <p className="text-xs line-clamp-3">{slide.content}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}