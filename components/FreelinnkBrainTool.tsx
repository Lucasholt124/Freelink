"use client";

import { useState, useRef, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
  Sparkles, Copy, Check, Brain, Video, RefreshCcw,
  Layers, Camera, MessageSquare, Wand2, ChevronRight, Download,
  Share2, Bookmark, TrendingUp, Zap, Target, Users, Hash,
  Clock, Eye, Heart, MessageCircle, Send, BarChart3, Palette,
  FileText, Image as ImageIcon, Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Separator } from "@radix-ui/react-select";

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

// =================================================================
// 2. COMPONENTES AUXILIARES OTIMIZADOS
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
// 3. COMPONENTES DE CONTEÚDO REDESENHADOS
// =================================================================

const ReelCard = ({ reel, index }: { reel: ReelContent; index: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
              </div>
              <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                {reel.title}
              </CardTitle>
            </div>
            <div className="flex gap-1">
              <CopyButton
                textToCopy={`🎬 REEL: ${reel.title}\n\n🪝 GANCHO (3s):\n${reel.hook}\n\n📝 ROTEIRO:\n${reel.main_points.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n📢 CTA:\n${reel.cta}`}
              />
              <ShareButton content={`Confira essa ideia de Reel: ${reel.title}`} />
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
            <Button size="sm" variant="ghost" className="h-7 text-xs">
              <Bookmark className="w-3 h-3 mr-1" />
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CarouselViewer = ({ carousel, index }: { carousel: CarouselContent; index: number }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-500/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10">
                  <Layers className="w-4 h-4 text-purple-500" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  Carrossel #{index + 1}
                </Badge>
              </div>
              <CardTitle className="text-lg">{carousel.title}</CardTitle>
              <CardDescription className="text-xs">
                {carousel.slides.length + 1} slides • Deslize para navegar
              </CardDescription>
            </div>
            <div className="flex gap-1">
              <CopyButton
                textToCopy={`📱 CARROSSEL: ${carousel.title}\n\n${carousel.slides.map(s => `SLIDE ${s.slide_number}: ${s.title}\n${s.content}`).join('\n\n')}\n\nCTA: ${carousel.cta_slide}`}
              />
              <ShareButton content={`Confira essa ideia de Carrossel: ${carousel.title}`} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative">
            <div className="flex items-center justify-center">
              <motion.div
                className="w-full max-w-sm aspect-[4/5] relative"
                style={{ x, opacity }}
                drag="x"
                dragConstraints={{ left: -50, right: 50 }}
                onDragEnd={(e, { offset }) => {
                  if (offset.x > 50 && currentSlide > 0) {
                    setCurrentSlide(currentSlide - 1);
                  } else if (offset.x < -50 && currentSlide < carousel.slides.length) {
                    setCurrentSlide(currentSlide + 1);
                  }
                  x.set(0);
                }}
              >
                <AnimatePresence mode="wait">
                  {currentSlide < carousel.slides.length ? (
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl shadow-xl border-2 border-purple-200/50 dark:border-purple-700/50 p-6 flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-purple-500 text-white">
                          Slide {carousel.slides[currentSlide].slide_number}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {currentSlide + 1} de {carousel.slides.length + 1}
                        </span>
                      </div>

                      <div className="flex-1 flex flex-col justify-center space-y-4">
                        <h3 className="text-2xl font-bold text-center">
                          {carousel.slides[currentSlide].title}
                        </h3>
                        <p className="text-center text-muted-foreground leading-relaxed">
                          {carousel.slides[currentSlide].content}
                        </p>
                      </div>

                      <div className="flex justify-center gap-1 mt-4">
                        {[...Array(carousel.slides.length + 1)].map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-2 h-2 rounded-full transition-all",
                              i === currentSlide ? "w-6 bg-purple-500" : "bg-muted"
                            )}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="cta"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center text-white"
                    >
                      <Sparkles className="w-12 h-12 mb-4" />
                      <h3 className="text-2xl font-bold mb-4">Gostou do conteúdo?</h3>
                      <p className="text-center text-white/90 leading-relaxed">
                        {carousel.cta_slide}
                      </p>
                      <Button
                        variant="secondary"
                        className="mt-6"
                        onClick={() => setCurrentSlide(0)}
                      >
                        Ver novamente
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                disabled={currentSlide === 0}
              >
                Anterior
              </Button>

              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Arraste para navegar
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentSlide(Math.min(carousel.slides.length, currentSlide + 1))}
                disabled={currentSlide === carousel.slides.length}
              >
                Próximo
              </Button>
            </div>
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
      <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-pink-500/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-pink-500/10">
                  <Camera className="w-4 h-4 text-pink-500" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  Post #{index + 1}
                </Badge>
              </div>
              <CardTitle className="text-lg">{post.idea}</CardTitle>
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

          <div className="flex items-center gap-4 pt-2 border-t text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              Feed + Stories
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              Alto engajamento
            </span>
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
      <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-indigo-500/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10">
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  Story Sequence #{index + 1}
                </Badge>
              </div>
              <CardTitle className="text-lg">{seq.theme}</CardTitle>
              <CardDescription className="text-xs">
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
            {seq.slides.map((slide, slideIdx) => {
              const slideConfig = iconMap[slide.type];
              const Icon = slideConfig.icon;

              return (
                <motion.div
                  key={slide.slide_number}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: slideIdx * 0.1 }}
                  className="relative"
                >
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <motion.div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          slideConfig.bg
                        )}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon className={cn("w-5 h-5", slideConfig.color)} />
                      </motion.div>
                      {slideIdx < seq.slides.length - 1 && (
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
                </motion.div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 pt-4 mt-4 border-t text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              24h de duração
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              Alta interação
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// =================================================================
// 4. COMPONENTE PRINCIPAL OTIMIZADO
// =================================================================

export default function FreelinkBrainTool() {
  const [theme, setTheme] = useState("");
  const [results, setResults] = useState<BrainResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("reels");
  const inputRef = useRef<HTMLInputElement>(null);

  const generateIdeas = useAction(api.brain.generateContentIdeas);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!theme.trim()) {
      toast.error("Por favor, insira um tema para gerar ideias.");
      inputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const data = await generateIdeas({ theme });
      setResults(data);
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
    inputRef.current?.focus();
  };

  const handleExampleClick = (exampleTheme: string) => {
    setTheme(exampleTheme);
    setTimeout(() => handleSubmit(), 100);
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
      <AnimatePresence mode="wait">
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
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b">
              <div className="px-4 py-4 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Campanha Pronta!
                    </h2>
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
                    <Button
                      variant="default"
                      className="flex-1 sm:flex-initial gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Exportar
                    </Button>
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
            <div className="px-4 space-y-4">
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
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">
                        Público-Alvo
                      </p>
                      <p className="text-sm">{results.target_audience_suggestion}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <ContentMetrics />
            </div>

            {/* Tabs de conteúdo */}
            <div className="px-4">
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
                    {results.content_pack.reels.map((reel, i) => (
                      <ReelCard key={i} reel={reel} index={i} />
                    ))}
                  </TabsContent>

                  <TabsContent value="carousels" className="mt-0 space-y-4">
                    {results.content_pack.carousels.map((carousel, i) => (
                      <CarouselViewer key={i} carousel={carousel} index={i} />
                    ))}
                  </TabsContent>

                  <TabsContent value="image_posts" className="mt-0 space-y-4">
                    {results.content_pack.image_posts.map((post, i) => (
                      <ImagePostCard key={i} post={post} index={i} />
                    ))}
                  </TabsContent>

                  <TabsContent value="story_sequences" className="mt-0 space-y-4">
                    {results.content_pack.story_sequences.map((seq, i) => (
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
            className="px-4 space-y-8"
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
                      Powered by AI
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
                    Transforme qualquer tema em uma{" "}
                    <span className="font-semibold text-foreground">
                      campanha completa de conteúdo viral
                    </span>{" "}
                    para o Instagram em segundos.
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
                      <Layers className="w-4 h-4" />
                      <span>Carrosséis</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Camera className="w-4 h-4" />
                      <span>Posts</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageSquare className="w-4 h-4" />
                      <span>Stories</span>
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
                        Qual tema você quer transformar em conteúdo viral?
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
                          "Marketing de afiliados para iniciantes",
                          "Receitas saudáveis em 15 minutos",
                          "Como vencer a procrastinação",
                          "Dicas de economia doméstica",
                          "Mindfulness no trabalho"
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
                  icon: Zap,
                  title: "Geração Instantânea",
                  description: "Crie campanhas completas em segundos",
                  color: "from-yellow-500 to-orange-500"
                },
                {
                  icon: Target,
                  title: "Foco no Resultado",
                  description: "Conteúdo otimizado para engajamento",
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  icon: Brain,
                  title: "IA Avançada",
                  description: "Algoritmos treinados em conteúdo viral",
                  color: "from-purple-500 to-pink-500"
                },
                {
                  icon: TrendingUp,
                  title: "Sempre Atualizado",
                  description: "Tendências e formatos do momento",
                  color: "from-green-500 to-emerald-500"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
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

            {/* Stats Section */}
            <motion.div
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-sm text-muted-foreground mb-4">
                Junte-se a milhares de criadores que já transformaram suas ideias em conteúdo viral
              </p>
              <div className="flex items-center justify-center gap-8">
                <div>
                  <p className="text-3xl font-bold text-primary">
                    <AnimatedCounter value={10000} />+
                  </p>
                  <p className="text-xs text-muted-foreground">Campanhas criadas</p>
                </div>
                <Separator className="h-12" />
                <div>
                  <p className="text-3xl font-bold text-primary">
                    <AnimatedCounter value={98} />%
                  </p>
                  <p className="text-xs text-muted-foreground">Satisfação</p>
                </div>
                <Separator className="h-12" />
                <div>
                  <p className="text-3xl font-bold text-primary">
                    <AnimatedCounter value={5} />M+
                  </p>
                  <p className="text-xs text-muted-foreground">Alcance gerado</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}