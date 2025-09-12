"use client";

import { useState, useCallback, useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import confetti from 'canvas-confetti';

import {
  Loader2, Sparkles, Wand2, Download, Share2, Heart, Maximize2,
  Grid3x3, Image as ImageIcon, Camera, Shapes, X, ArrowLeft,
  BookOpen, ShoppingBag, Instagram, TrendingUp, Video, Crown,
  Rocket, Film, Brain, Star, Eye, CheckCircle, Zap, Hash,
  Copy, ChevronRight, PlayCircle, Timer, Music, Layers,
  Palette, Trophy, Target, Lightbulb, MessageCircle
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { ScrollArea } from "./scroll-area";

// ========== 🎯 TIPOS TYPESCRIPT ==========

interface VideoScriptScene {
  number: number;
  duration: string;
  text: string;
  visual: string;
  camera: string;
  transition: string;
}

interface VideoScript {
  title: string;
  hook: string;
  duration: string;
  format: string;
  style: string;
  scenes: VideoScriptScene[];
  music: string;
  hashtags: string[];
  cta: string;
  canvaSteps: string[];
  capcutSteps: string[];
  proTips: string[];
}

interface GenerateImageResponse {
  url: string;
  method: string;
  remainingPremium: number;
  message: string;
}

interface GenerateVideoResponse {
  script: VideoScript;
  method: string;
  remainingPremium: number;
  message: string;
}

interface GeneratedImage {
  _id: Id<"generatedImages">;
  userId: string;
  prompt: string;
  imageUrl: string;
  storageId: Id<"_storage">;
}

// ========== 🎨 CONFIGURAÇÕES VISUAIS ==========

const businessCategories = [
  { id: "ecommerce", name: "E-commerce", icon: ShoppingBag, color: "from-blue-500 to-indigo-500" },
  { id: "content", name: "Conteúdo", icon: Video, color: "from-purple-500 to-pink-500" },
  { id: "social", name: "Social", icon: Instagram, color: "from-pink-500 to-rose-500" },
  { id: "marketing", name: "Marketing", icon: TrendingUp, color: "from-green-500 to-emerald-500" },
];

const stylePresets = [
  { id: "realistic", name: "Realista", icon: Camera, description: "Fotografia profissional" },
  { id: "artistic", name: "Artístico", icon: Sparkles, description: "Criativo e único" },
  { id: "3d", name: "3D", icon: Shapes, description: "Renderização 3D" },
  { id: "minimal", name: "Minimal", icon: Grid3x3, description: "Limpo e moderno" },
];

const videoStyles = [
  { id: "viral", name: "Viral", icon: TrendingUp, color: "from-pink-500 to-purple-500", emoji: "🔥" },
  { id: "motivational", name: "Motivacional", icon: Rocket, color: "from-orange-500 to-red-500", emoji: "💪" },
  { id: "educational", name: "Educativo", icon: Brain, color: "from-blue-500 to-cyan-500", emoji: "🎓" },
  { id: "funny", name: "Engraçado", icon: Star, color: "from-yellow-500 to-orange-500", emoji: "😂" }
];

// ========== 🚀 COMPONENTE PRINCIPAL REVOLUCIONÁRIO ==========

export function ImageGenerator() {
  // Estados principais
  const [activeTab, setActiveTab] = useState("create");
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("realistic");
  const [selectedBusiness, setSelectedBusiness] = useState("ecommerce");
  const [latestImage, setLatestImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Estados para vídeo
  const [videoTopic, setVideoTopic] = useState("");
  const [selectedVideoStyle, setSelectedVideoStyle] = useState("viral");
  const [videoDuration, setVideoDuration] = useState(30);
  const [videoScript, setVideoScript] = useState<VideoScript | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  // Estados UI
  const [, setCopiedText] = useState<string | null>(null);
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set());
  const [showTutorial, setShowTutorial] = useState(false);
  const [showProTips, setShowProTips] = useState(false);

  // Hooks Convex
  const generate = useAction(api.imageGenerator.generateImage);
  const generateVideo = useAction(api.imageGenerator.generateVideoScript);
  const imageHistory = useQuery(api.imageGenerator.getImagesForUser) ?? [];
  const usageStats = useQuery(api.imageGenerator.getUsageStats);

  // ========== 📱 DETECTAR MOBILE ==========
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ========== 🎊 EFEITO CONFETTI ==========
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981']
    });
  };

  // ========== 🔧 FUNÇÕES MELHORADAS ==========

  const handleCopyText = useCallback((text: string, label?: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`${label || 'Texto'} copiado! 📋`);
    setTimeout(() => setCopiedText(null), 2000);
  }, []);

  const handleDownload = async (url: string, filename?: string) => {
    try {
      toast.loading("Preparando download...");
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename || `imagem-viral-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Download concluído! 🎉");
      triggerConfetti();
    } catch (error) {
      console.error("Erro ao baixar:", error);
      toast.error("Erro ao baixar. Tente novamente!");
    }
  };

  const handleShare = async (url: string, text: string) => {
    if (navigator.share && isMobile) {
      try {
        await navigator.share({
          title: '🚀 Criado com IA Revolucionária',
          text: `${text}\n\nCriado com a ferramenta mais incrível do mundo!`,
          url
        });
        toast.success("Compartilhado com sucesso! 🚀");
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          navigator.clipboard.writeText(url);
          toast.success("Link copiado! 📋");
        }
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copiado para compartilhar! 📋");
    }
  };

  const toggleLikeImage = useCallback((imageId: string) => {
    setLikedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
        toast.success("Removido dos favoritos");
      } else {
        newSet.add(imageId);
        toast.success("Adicionado aos favoritos! ❤️");
        triggerConfetti();
      }
      return newSet;
    });
  }, []);

  // ========== 🎨 GERAR IMAGEM ==========
  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("📝 Por favor, descreva sua imagem dos sonhos!");
      return;
    }

    setIsLoading(true);
    try {
      const enrichedPrompt = `${prompt}, ${selectedStyle} style, professional quality, trending on artstation`;
      const result = await generate({ prompt: enrichedPrompt }) as GenerateImageResponse;

      if (result && result.url) {
        setLatestImage(result.url);
        toast.success("🎨 Imagem INCRÍVEL gerada com sucesso!");
        triggerConfetti();

        // Auto-switch para preview
        if (isMobile) {
          setTimeout(() => {
            const previewSection = document.getElementById('preview-section');
            previewSection?.scrollIntoView({ behavior: 'smooth' });
          }, 500);
        }
      }
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      toast.error("❌ Erro ao gerar. Tente novamente!");
    } finally {
      setIsLoading(false);
    }
  };

  // ========== 🎬 GERAR ROTEIRO ==========
  const handleGenerateVideo = async () => {
    if (!videoTopic.trim()) {
      toast.error("📝 Descreva o tema do seu vídeo viral!");
      return;
    }

    setIsGeneratingVideo(true);
    setVideoScript(null);

    try {
      const result = await generateVideo({
        topic: videoTopic,
        style: selectedVideoStyle,
        duration: videoDuration
      }) as GenerateVideoResponse;

      if (result && result.script) {
        setVideoScript(result.script);
        toast.success("🎬 Roteiro VIRAL criado com sucesso!");
        triggerConfetti();
        setShowProTips(true);
      }
    } catch (error) {
      console.error("Erro ao gerar roteiro:", error);
      toast.error("❌ Erro ao gerar roteiro. Tente novamente!");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // ========== 🎯 RENDERIZAÇÃO PERFEITA ==========

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">

      {/* 🎯 HEADER REVOLUCIONÁRIO */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-purple-200 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-purple-600 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline font-medium">Voltar</span>
              </Link>

              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <Badge className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white border-0 shadow-lg">
                  <Crown className="w-4 h-4 mr-1" />
                  Premium
                </Badge>
              </motion.div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {usageStats && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="border-purple-300">
                    <Sparkles className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Imagens:</span> {usageStats.geminiImagesRemaining}
                  </Badge>
                  <Badge variant="outline" className="border-pink-300">
                    <Film className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Roteiros:</span> {usageStats.geminiVideosRemaining}
                  </Badge>
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowTutorial(true)}
                className="hover:bg-purple-100"
              >
                <BookOpen className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 🎓 TUTORIAL MODAL */}
      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🚀 Como Criar Conteúdo Viral
            </DialogTitle>
            <DialogDescription>
              Domine a ferramenta mais poderosa do mundo em 3 minutos!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex gap-3 p-3 bg-purple-50 rounded-lg"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
              </div>
              <div>
                <p className="font-semibold text-purple-900">Crie Imagens Impressionantes</p>
                <p className="text-sm text-purple-700 mt-1">
                  Digite sua ideia, escolha um estilo e veja a mágica acontecer!
                  Nossa IA avançada cria imagens profissionais em segundos.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex gap-3 p-3 bg-pink-50 rounded-lg"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <div>
                <p className="font-semibold text-pink-900">Gere Roteiros Virais</p>
                <p className="text-sm text-pink-700 mt-1">
                  Transforme qualquer ideia em um roteiro viral completo com tutoriais
                  passo a passo para Canva e CapCut. Tudo pronto para viralizar!
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-3 p-3 bg-orange-50 rounded-lg"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <div>
                <p className="font-semibold text-orange-900">Baixe e Compartilhe</p>
                <p className="text-sm text-orange-700 mt-1">
                  Baixe suas criações em alta qualidade, compartilhe diretamente nas redes
                  sociais e acompanhe seu sucesso. O mundo está esperando seu conteúdo!
                </p>
              </div>
            </motion.div>

            <div className="pt-4 border-t">
              <p className="text-center text-sm text-gray-600">
                💡 <strong>Dica Pro:</strong> Use prompts em inglês para resultados ainda melhores!
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 🌟 CONTEÚDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* 🎯 HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.h1
            className="text-4xl md:text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-4"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            Crie Conteúdo Viral com IA
          </motion.h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            A ferramenta mais revolucionária do mundo para criar imagens impressionantes
            e roteiros virais com tutoriais completos. <strong>Transforme ideias em sucesso!</strong>
          </p>

          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <Badge className="px-3 py-1 bg-purple-100 text-purple-700 border-purple-300">
              <Zap className="w-3 h-3 mr-1" /> Resultado Instantâneo
            </Badge>
            <Badge className="px-3 py-1 bg-pink-100 text-pink-700 border-pink-300">
              <Trophy className="w-3 h-3 mr-1" /> Qualidade Premium
            </Badge>
            <Badge className="px-3 py-1 bg-orange-100 text-orange-700 border-orange-300">
              <Target className="w-3 h-3 mr-1" /> 100% Viral
            </Badge>
          </div>
        </motion.div>

        {/* 🎨 TABS REVOLUCIONÁRIAS */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 max-w-lg mx-auto bg-white/80 backdrop-blur shadow-lg">
            <TabsTrigger
              value="create"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Criar
            </TabsTrigger>
            <TabsTrigger
              value="video"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-orange-500 data-[state=active]:text-white"
            >
              <Video className="w-4 h-4 mr-2" />
              Roteiro
            </TabsTrigger>
            <TabsTrigger
              value="gallery"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-yellow-500 data-[state=active]:text-white"
            >
              <Grid3x3 className="w-4 h-4 mr-2" />
              Galeria
            </TabsTrigger>
          </TabsList>

          {/* 🎨 TAB: CRIAR IMAGEM */}
          <TabsContent value="create" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">

              {/* Painel de Controles */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="shadow-xl border-purple-200 overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      Gerador de Imagens Virais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleGenerateImage} className="space-y-6">

                      {/* Categoria de Negócio */}
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4" />
                          Categoria do Seu Negócio
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {businessCategories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                              <motion.button
                                key={cat.id}
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedBusiness(cat.id)}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                  selectedBusiness === cat.id
                                    ? `border-purple-500 bg-gradient-to-br ${cat.color} text-white shadow-lg`
                                    : "border-gray-200 hover:border-purple-300 bg-white"
                                }`}
                              >
                                <Icon className="w-6 h-6 mx-auto mb-2" />
                                <span className="text-sm font-medium">{cat.name}</span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Prompt Textarea */}
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Wand2 className="w-4 h-4" />
                          Descreva Sua Visão
                          <Badge variant="outline" className="ml-auto text-xs">
                            Dica: Use inglês para melhor resultado
                          </Badge>
                        </label>
                        <Textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="Ex: Professional product photography of a luxury watch on marble surface with golden lighting..."
                          className="min-h-[120px] border-purple-200 focus:border-purple-500 transition-colors resize-none"
                          maxLength={500}
                        />
                        <div className="text-xs text-gray-500 mt-2 text-right">
                          {prompt.length}/500 caracteres
                        </div>
                      </div>

                      {/* Estilo Visual */}
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Palette className="w-4 h-4" />
                          Estilo Visual
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {stylePresets.map((style) => {
                            const Icon = style.icon;
                            return (
                              <motion.button
                                key={style.id}
                                type="button"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedStyle(style.id)}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                  selectedStyle === style.id
                                    ? "border-purple-500 bg-purple-50 shadow-lg"
                                    : "border-gray-200 hover:border-purple-300 bg-white"
                                }`}
                              >
                                <Icon className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                                <span className="text-sm font-medium block">{style.name}</span>
                                <span className="text-xs text-gray-500">{style.description}</span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Botão de Gerar */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="submit"
                          disabled={isLoading || !prompt.trim()}
                          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 shadow-xl"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Criando Sua Obra-Prima...
                            </>
                          ) : (
                            <>
                              <Wand2 className="mr-2 h-5 w-5" />
                              Gerar Imagem Viral
                            </>
                          )}
                        </Button>
                      </motion.div>

                      {/* Dicas Rápidas */}
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                        <p className="text-sm font-semibold text-purple-900 mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" />
                          Dicas para Viralizar:
                        </p>
                        <ul className="text-xs text-purple-700 space-y-1">
                          <li>• Use cores vibrantes e alto contraste</li>
                          <li>• Adicione elementos que chamam atenção</li>
                          <li>• Mantenha o foco no produto principal</li>
                          <li>• Use iluminação dramática para impacto</li>
                        </ul>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Preview da Imagem */}
              <motion.div
                id="preview-section"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="shadow-xl border-pink-200 overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500" />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Eye className="w-5 h-5 text-pink-500" />
                        Preview da Sua Criação
                      </CardTitle>
                      {latestImage && (
                        <div className="flex gap-2">
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDownload(latestImage, `viral-image-${Date.now()}.png`)}
                              className="hover:bg-pink-100"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleShare(latestImage, prompt)}
                              className="hover:bg-pink-100"
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setSelectedImage(latestImage)}
                              className="hover:bg-pink-100"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <AspectRatio ratio={1} className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl overflow-hidden">
                      {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles className="h-12 w-12 text-purple-500 mb-4" />
                          </motion.div>
                          <p className="text-purple-600 font-medium">Criando algo incrível...</p>
                          <p className="text-purple-500 text-sm mt-2">Isso vai ser épico! 🚀</p>
                        </div>
                      ) : latestImage ? (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring" }}
                          className="relative w-full h-full"
                        >
                          <Image
                            src={latestImage}
                            alt={prompt}
                            fill
                            className="object-cover"
                            priority
                          />
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-green-500 text-white">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Pronto!
                            </Badge>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <ImageIcon className="w-16 h-16 mb-4" />
                          <p className="font-medium">Sua imagem aparecerá aqui</p>
                          <p className="text-sm mt-2">Crie algo incrível agora!</p>
                        </div>
                      )}
                    </AspectRatio>

                    {latestImage && (
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl"
                      >
                        <p className="text-sm font-semibold text-green-800 mb-2">
                          ✨ Sua imagem está pronta para viralizar!
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyText(prompt, "Prompt")}
                            className="text-xs"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copiar Prompt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveTab("gallery")}
                            className="text-xs"
                          >
                            <Grid3x3 className="w-3 h-3 mr-1" />
                            Ver Galeria
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* 🎬 TAB: ROTEIRO DE VÍDEO REVOLUCIONÁRIO */}
          <TabsContent value="video" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="max-w-5xl mx-auto shadow-2xl border-pink-200 overflow-hidden">
                <div className="h-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Video className="w-6 h-6 text-pink-500" />
                    </motion.div>
                    Criador de Roteiros Virais
                    <Badge className="ml-auto bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Alta Demanda
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!videoScript ? (
                    <div className="space-y-6">
                      {/* Formulário de Criação */}
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Tema do Seu Vídeo Viral
                        </label>
                        <Textarea
                          value={videoTopic}
                          onChange={(e) => setVideoTopic(e.target.value)}
                          placeholder="Ex: 5 produtos que vão bombar em 2024 / Como conquistar 10k seguidores em 30 dias / Receita de bolo que viralizou..."
                          className="min-h-[100px] border-pink-200 focus:border-pink-500"
                          maxLength={200}
                        />
                        <div className="text-xs text-gray-500 mt-2 text-right">
                          {videoTopic.length}/200 caracteres
                        </div>
                      </div>

                      {/* Seleção de Estilo */}
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Estilo do Vídeo
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {videoStyles.map((style) => {
                            const Icon = style.icon;
                            return (
                              <motion.button
                                key={style.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedVideoStyle(style.id)}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                  selectedVideoStyle === style.id
                                    ? `border-pink-500 bg-gradient-to-br ${style.color} text-white shadow-xl`
                                    : "border-gray-200 hover:border-pink-300 bg-white"
                                }`}
                              >
                                <div className="text-2xl mb-2">{style.emoji}</div>
                                <Icon className="w-5 h-5 mx-auto mb-1" />
                                <span className="text-xs font-bold">{style.name}</span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Duração do Vídeo */}
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Timer className="w-4 h-4" />
                          Duração do Vídeo: <span className="text-pink-600">{videoDuration} segundos</span>
                        </label>
                        <div className="flex gap-2">
                          {[15, 30, 45, 60].map((dur) => (
                            <motion.div key={dur} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                variant={videoDuration === dur ? "default" : "outline"}
                                onClick={() => setVideoDuration(dur)}
                                className={videoDuration === dur ? "bg-gradient-to-r from-pink-500 to-purple-500" : ""}
                              >
                                {dur}s
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          💡 Dica: {videoDuration === 15 ? "Perfeito para Shorts" : videoDuration === 30 ? "Ideal para Reels" : videoDuration === 45 ? "Ótimo para Stories longos" : "Completo para IGTV"}
                        </p>
                      </div>

                      {/* Botão de Gerar Roteiro */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={handleGenerateVideo}
                          disabled={isGeneratingVideo || !videoTopic.trim()}
                          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-700 hover:via-purple-700 hover:to-indigo-700 shadow-xl"
                        >
                          {isGeneratingVideo ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Criando Roteiro Viral...
                            </>
                          ) : (
                            <>
                              <Film className="mr-2 h-5 w-5" />
                              Criar Roteiro Viral Agora
                            </>
                          )}
                        </Button>
                      </motion.div>

                      {/* Preview Cards */}
                      <div className="grid md:grid-cols-3 gap-4 mt-6">
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                          <PlayCircle className="w-8 h-8 text-purple-600 mb-2" />
                          <h4 className="font-semibold text-purple-900">Roteiro Completo</h4>
                          <p className="text-xs text-purple-700 mt-1">
                            Cena por cena com textos e visuais prontos
                          </p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-pink-50 to-orange-50 rounded-xl">
                          <Layers className="w-8 h-8 text-pink-600 mb-2" />
                          <h4 className="font-semibold text-pink-900">Tutorial Completo</h4>
                          <p className="text-xs text-pink-700 mt-1">
                            Passo a passo para Canva e CapCut
                          </p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl">
                          <Hash className="w-8 h-8 text-orange-600 mb-2" />
                          <h4 className="font-semibold text-orange-900">Hashtags Virais</h4>
                          <p className="text-xs text-orange-700 mt-1">
                            As melhores tags para bombar seu vídeo
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* 🎬 ROTEIRO GERADO - LAYOUT REVOLUCIONÁRIO */
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      {/* Header do Roteiro */}
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-2xl shadow-xl">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-2xl font-bold mb-3">{videoScript.title}</h3>
                            <div className="flex flex-wrap gap-2">
                              <Badge className="bg-white/20 backdrop-blur text-white border-white/30">
                                <Zap className="w-3 h-3 mr-1" />
                                {videoScript.duration}
                              </Badge>
                              <Badge className="bg-white/20 backdrop-blur text-white border-white/30">
                                <Eye className="w-3 h-3 mr-1" />
                                {videoScript.format}
                              </Badge>
                              <Badge className="bg-white/20 backdrop-blur text-white border-white/30">
                                <Sparkles className="w-3 h-3 mr-1" />
                                {videoScript.style}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setVideoScript(null)}
                            className="text-white hover:bg-white/20"
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>

                      {/* Hook Viral */}
                      <motion.div
                        initial={{ x: -20 }}
                        animate={{ x: 0 }}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-2xl shadow-xl"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                            <Target className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-white text-lg">GANCHO VIRAL - PRIMEIROS 3 SEGUNDOS</p>
                            <p className="text-white/80 text-sm">O momento mais importante do seu vídeo!</p>
                          </div>
                        </div>
                        <p className="text-2xl font-black text-white bg-black/20 p-4 rounded-xl">
                          {videoScript.hook}
                        </p>
                      </motion.div>

                      {/* Navegação do Roteiro */}
                      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="border-b bg-gray-50 p-4">
                          <h4 className="font-bold text-lg flex items-center gap-2">
                            <Film className="w-5 h-5 text-purple-600" />
                            Roteiro Completo - Cena por Cena
                          </h4>
                        </div>

                        <ScrollArea className="h-[400px] p-4">
                          <div className="space-y-4">
                            {videoScript.scenes.map((scene, index) => (
                              <motion.div
                                key={scene.number}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="border-l-4 border-purple-500 pl-4 py-3 hover:bg-purple-50 rounded-r-xl transition-colors"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                      {scene.number}
                                    </div>
                                    <Badge variant="outline">
                                      <Timer className="w-3 h-3 mr-1" />
                                      {scene.duration}
                                    </Badge>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleCopyText(scene.text, `Cena ${scene.number}`)}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>

                                <div className="space-y-2">
                                  <div className="bg-purple-100 p-3 rounded-lg">
                                    <p className="font-semibold text-purple-900 text-sm mb-1">📝 Texto/Narração:</p>
                                    <p className="text-purple-800">{scene.text}</p>
                                  </div>

                                  <div className="bg-pink-100 p-3 rounded-lg">
                                    <p className="font-semibold text-pink-900 text-sm mb-1">🎨 Visual:</p>
                                    <p className="text-pink-800">{scene.visual}</p>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-gray-100 p-2 rounded-lg">
                                      <p className="text-xs font-semibold text-gray-700">📹 Câmera:</p>
                                      <p className="text-xs text-gray-600">{scene.camera}</p>
                                    </div>
                                    <div className="bg-gray-100 p-2 rounded-lg">
                                      <p className="text-xs font-semibold text-gray-700">✨ Transição:</p>
                                      <p className="text-xs text-gray-600">{scene.transition}</p>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>

                      {/* Música Recomendada */}
                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl"
                      >
                        <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                          <Music className="w-5 h-5 text-purple-600" />
                          Trilha Sonora Viral
                        </h4>
                        <p className="text-purple-800 bg-white/50 p-3 rounded-lg">
                          {videoScript.music}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-3"
                          onClick={() => handleCopyText(videoScript.music, "Música recomendada")}
                        >
                          <Copy className="w-3 h-3 mr-2" />
                          Copiar Nome da Música
                        </Button>
                      </motion.div>

                      {/* TUTORIAL CANVA - EXPANDÍVEL */}
                      <motion.div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl overflow-hidden shadow-xl">
                        <button
                          onClick={() => setExpandedStep(expandedStep === 'canva' ? null : 'canva')}
                          className="w-full p-6 flex items-center justify-between hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                              <Sparkles className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                              <h4 className="font-bold text-xl">Tutorial Completo - Canva</h4>
                              <p className="text-sm text-white/80">Passo a passo detalhado para criar seu vídeo</p>
                            </div>
                          </div>
                          <ChevronRight className={`w-6 h-6 transition-transform ${expandedStep === 'canva' ? 'rotate-90' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {expandedStep === 'canva' && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-6 pt-0 space-y-3">
                                {videoScript.canvaSteps.map((step, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`${
                                      step.startsWith('1') || step.startsWith('2') || step.startsWith('3') ||
                                      step.includes('️⃣') ? 'bg-white/10 p-3 rounded-lg' :
                                      step.includes('DICA') ? 'bg-yellow-400/20 p-3 rounded-lg font-bold' :
                                      step === '' ? 'h-2' : 'pl-4'
                                    }`}
                                  >
                                    <p className="text-sm">{step}</p>
                                  </motion.div>
                                ))}
                                <Button
                                  variant="secondary"
                                  className="w-full mt-4"
                                  onClick={() => {
                                    const text = videoScript.canvaSteps.join('\n');
                                    handleCopyText(text, "Tutorial Canva");
                                  }}
                                >
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copiar Tutorial Completo
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* TUTORIAL CAPCUT - EXPANDÍVEL */}
                      <motion.div className="bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-2xl overflow-hidden shadow-xl">
                        <button
                          onClick={() => setExpandedStep(expandedStep === 'capcut' ? null : 'capcut')}
                          className="w-full p-6 flex items-center justify-between hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                              <Video className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                              <h4 className="font-bold text-xl">Tutorial Completo - CapCut</h4>
                              <p className="text-sm text-white/80">Edição profissional no celular</p>
                            </div>
                          </div>
                          <ChevronRight className={`w-6 h-6 transition-transform ${expandedStep === 'capcut' ? 'rotate-90' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {expandedStep === 'capcut' && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-6 pt-0 space-y-3">
                                {videoScript.capcutSteps.map((step, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`${
                                      step.startsWith('1') || step.startsWith('2') || step.startsWith('3') ||
                                      step.includes('️⃣') ? 'bg-white/10 p-3 rounded-lg' :
                                      step.includes('DICA') ? 'bg-yellow-400/20 p-3 rounded-lg font-bold' :
                                      step === '' ? 'h-2' : 'pl-4'
                                    }`}
                                  >
                                    <p className="text-sm">{step}</p>
                                  </motion.div>
                                ))}
                                <Button
                                  variant="secondary"
                                  className="w-full mt-4"
                                  onClick={() => {
                                    const text = videoScript.capcutSteps.join('\n');
                                    handleCopyText(text, "Tutorial CapCut");
                                  }}
                                >
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copiar Tutorial Completo
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* Hashtags Virais */}
                      <motion.div
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                        className="bg-gradient-to-r from-orange-100 to-pink-100 p-6 rounded-2xl"
                      >
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                          <Hash className="w-5 h-5 text-orange-600" />
                          Hashtags Virais Selecionadas
                        </h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {videoScript.hashtags.map((tag, i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Badge
                                variant="outline"
                                className="cursor-pointer hover:bg-orange-100 border-orange-300 px-3 py-1"
                                onClick={() => handleCopyText(tag, "Hashtag")}
                              >
                                {tag}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const allTags = videoScript.hashtags.join(' ');
                            handleCopyText(allTags, "Todas as hashtags");
                          }}
                        >
                          <Copy className="w-3 h-3 mr-2" />
                          Copiar Todas as Hashtags
                        </Button>
                      </motion.div>

                      {/* Call to Action */}
                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-xl"
                      >
                        <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                          <MessageCircle className="w-5 h-5" />
                          Call to Action Viral
                        </h4>
                        <p className="text-xl font-bold bg-white/20 p-4 rounded-xl">
                          {videoScript.cta}
                        </p>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="mt-3"
                          onClick={() => handleCopyText(videoScript.cta, "CTA")}
                        >
                          <Copy className="w-3 h-3 mr-2" />
                          Copiar CTA
                        </Button>
                      </motion.div>

                      {/* Pro Tips para Viralizar */}
                      {showProTips && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl p-6 shadow-xl"
                        >
                          <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                            <Trophy className="w-6 h-6" />
                            Dicas Pro para Viralizar (Segredo dos Experts!)
                          </h4>
                          <div className="grid md:grid-cols-2 gap-3">
                            {videoScript.proTips.map((tip, i) => (
                              <motion.div
                                key={i}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white/10 backdrop-blur p-3 rounded-lg"
                              >
                                <p className="text-sm">{tip}</p>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Botões de Ação */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={() => {
                            const fullScript = `
${videoScript.title}

GANCHO: ${videoScript.hook}

ROTEIRO COMPLETO:
${videoScript.scenes.map(s => `
Cena ${s.number} (${s.duration}):
Texto: ${s.text}
Visual: ${s.visual}
Câmera: ${s.camera}
Transição: ${s.transition}
`).join('\n')}

MÚSICA: ${videoScript.music}

HASHTAGS: ${videoScript.hashtags.join(' ')}

CTA: ${videoScript.cta}

TUTORIAL CANVA:
${videoScript.canvaSteps.join('\n')}

TUTORIAL CAPCUT:
${videoScript.capcutSteps.join('\n')}

DICAS PRO:
${videoScript.proTips.join('\n')}
`;
                            const blob = new Blob([fullScript], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `roteiro-viral-${Date.now()}.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                            toast.success("Roteiro baixado com sucesso! 📥");
                            triggerConfetti();
                          }}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Baixar Roteiro Completo
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => setShowProTips(!showProTips)}
                          className="flex-1"
                        >
                          <Lightbulb className="w-4 h-4 mr-2" />
                          {showProTips ? 'Ocultar' : 'Ver'} Dicas Pro
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => setVideoScript(null)}
                          className="flex-1"
                        >
                          <Rocket className="w-4 h-4 mr-2" />
                          Criar Novo Roteiro
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* 🖼️ TAB: GALERIA MELHORADA COM MOBILE PERFEITO */}
          <TabsContent value="gallery" className="mt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Header da Galeria */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                    Sua Galeria de Criações
                  </h2>
                  <p className="text-gray-600 mt-1">Todas as suas obras-primas em um só lugar</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="px-4 py-2">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    {imageHistory.length} {imageHistory.length === 1 ? 'imagem' : 'imagens'}
                  </Badge>
                  {likedImages.size > 0 && (
                    <Badge className="px-4 py-2 bg-pink-100 text-pink-700 border-pink-300">
                      <Heart className="w-4 h-4 mr-2 fill-current" />
                      {likedImages.size} {likedImages.size === 1 ? 'favorita' : 'favoritas'}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Grid de Imagens ou Estado Vazio */}
              {imageHistory.length === 0 ? (
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                >
                  <Card className="border-2 border-dashed border-gray-300">
                    <CardContent className="py-20 text-center">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <ImageIcon className="w-20 h-20 mx-auto mb-6 text-gray-300" />
                      </motion.div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Sua galeria está vazia
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Comece criando sua primeira imagem viral!
                      </p>
                      <Button
                        onClick={() => setActiveTab("create")}
                        className="bg-gradient-to-r from-purple-600 to-pink-600"
                      >
                        <Wand2 className="w-4 h-4 mr-2" />
                        Criar Primeira Imagem
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imageHistory.map((image: GeneratedImage, index) => (
                    <motion.div
                      key={image._id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -5 }}
                      className="group relative"
                    >
                      <Card className="overflow-hidden border-2 hover:border-purple-300 transition-all hover:shadow-xl">
                        <div className="relative aspect-square bg-gradient-to-br from-purple-100 to-pink-100">
                          <Image
                            src={image.imageUrl}
                            alt={image.prompt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />

                          {/* Overlay com ações - SEMPRE VISÍVEL NO MOBILE */}
                         <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-all duration-300 flex flex-col justify-end p-3`}>


                            {/* Texto do Prompt */}
                            <p className="text-white text-xs mb-3 line-clamp-2 font-medium">
                              {image.prompt}
                            </p>

                            {/* Botões de Ação - OTIMIZADOS PARA MOBILE */}
                            <div className="flex justify-between items-center">
                              <div className="flex gap-1">
                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => toggleLikeImage(image._id)}
                                  className="p-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-colors"
                                  aria-label="Favoritar"
                                >
                                  <Heart
                                    className={`w-4 h-4 ${likedImages.has(image._id) ? 'fill-red-500 text-red-500' : 'text-white'}`}
                                  />
                                </motion.button>

                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDownload(image.imageUrl, `viral-${image._id}.png`)}
                                  className="p-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-colors"
                                  aria-label="Download"
                                >
                                  <Download className="w-4 h-4 text-white" />
                                </motion.button>

                                <motion.button
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleShare(image.imageUrl, image.prompt)}
                                  className="p-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-colors"
                                  aria-label="Compartilhar"
                                >
                                  <Share2 className="w-4 h-4 text-white" />
                                </motion.button>
                              </div>

                              <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setSelectedImage(image.imageUrl)}
                                className="p-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-colors"
                                aria-label="Ampliar"
                              >
                                <Maximize2 className="w-4 h-4 text-white" />
                              </motion.button>
                            </div>
                          </div>

                          {/* Badge de Favorito */}
                          {likedImages.has(image._id) && (
                            <div className="absolute top-2 right-2">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                              >
                                <Heart className="w-4 h-4 text-white fill-current" />
                              </motion.div>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Estatísticas da Galeria */}

              {imageHistory.length > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mt-8 p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl"
                >
                  <h3 className="font-bold text-lg mb-4 text-purple-900">📊 Suas Estatísticas</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl text-center">
                      <p className="text-3xl font-bold text-purple-600">{imageHistory.length}</p>
                      <p className="text-sm text-gray-600">Total de Imagens</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl text-center">
                      <p className="text-3xl font-bold text-pink-600">{likedImages.size}</p>
                      <p className="text-sm text-gray-600">Favoritas</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl text-center">
                      <p className="text-3xl font-bold text-orange-600">
                        {Math.round((likedImages.size / imageHistory.length) * 100)}%
                      </p>
                      <p className="text-sm text-gray-600">Taxa de Favoritos</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl text-center">
                      <p className="text-3xl font-bold text-green-600">🔥</p>
                      <p className="text-sm text-gray-600">Em Alta!</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 🖼️ MODAL DE VISUALIZAÇÃO EM TELA CHEIA */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botão de Fechar */}
              <Button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-14 right-0 bg-white/10 backdrop-blur hover:bg-white/20"
                variant="ghost"
              >
                <X className="w-6 h-6 text-white" />
              </Button>

              {/* Imagem */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={selectedImage}
                  alt="Visualização em tela cheia"
                  width={1920}
                  height={1080}
                  className="w-full h-auto"
                  priority
                />
              </div>

              {/* Barra de Ações */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 backdrop-blur-lg rounded-full p-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDownload(selectedImage, `imagem-hd-${Date.now()}.png`)}
                  className="text-white hover:bg-white/20"
                >
                  <Download className="w-5 h-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleShare(selectedImage, "Imagem criada com IA")}
                  className="text-white hover:bg-white/20"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎉 FOOTER INSPIRACIONAL */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-20 py-8 border-t bg-gradient-to-r from-purple-50 to-pink-50"
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600 mb-2">
            Criado com 💜 para revolucionar o mundo do conteúdo digital
          </p>
          <p className="text-sm text-gray-500">
            © 2025 - A ferramenta mais incrível do universo
          </p>
        </div>
      </motion.footer>
    </div>
  );
}