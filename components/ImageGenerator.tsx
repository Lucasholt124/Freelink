"use client";

import { useState, useCallback, useRef } from "react";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import confetti from 'canvas-confetti';
import {
  Loader2, Sparkles, Wand2, Download, Share2, Heart, Maximize2,
  Grid3x3, ImageIcon,  X, ArrowLeft, Star, Eye,
  Zap, Crown, Rocket, Trash2,  Palette, Lightbulb,
  TrendingUp, Image as ImageLucide,  ChevronRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// =================================================================
// 🎯 TIPOS TYPESCRIPT
// =================================================================
interface GenerateResponse {
  url: string;
  method: string;
  remainingToday: number;
  message: string;
}

interface ImageDocument {
  _id: Id<"generatedImages">;
  userId: string;
  prompt: string;
  imageUrl: string;
  storageId: Id<"_storage">;
  createdAt?: number;
  method?: string;
}

interface UsageStats {
  dailyLimit: number;
  usedToday: number;
  remainingToday: number;
  resetTime: string;
  method: string;
  quality: string;
  costPerImage: string;
  monthlyCost: string;
}

// =================================================================
// 🎨 CONFIGURAÇÕES E DADOS
// =================================================================
const STYLES = [
  {
    id: "realistic",
    name: "Realista",
    emoji: "📸",
    gradient: "from-blue-500 to-cyan-500",
    prompt: "photorealistic, professional photography, 8K, detailed"
  },
  {
    id: "artistic",
    name: "Artístico",
    emoji: "🎨",
    gradient: "from-purple-500 to-pink-500",
    prompt: "artistic, creative, unique style, vibrant colors"
  },
  {
    id: "3d",
    name: "3D Render",
    emoji: "🎮",
    gradient: "from-orange-500 to-red-500",
    prompt: "3D render, octane render, high quality, cinematic lighting"
  },
  {
    id: "anime",
    name: "Anime",
    emoji: "🌸",
    gradient: "from-pink-500 to-rose-500",
    prompt: "anime style, manga, vibrant, detailed illustration"
  },
  {
    id: "minimal",
    name: "Minimalista",
    emoji: "⚪",
    gradient: "from-gray-500 to-slate-500",
    prompt: "minimalist, clean, simple, modern design"
  },
  {
    id: "vintage",
    name: "Vintage",
    emoji: "📷",
    gradient: "from-amber-500 to-orange-500",
    prompt: "vintage, retro, film photography, nostalgic"
  }
];

const SUGGESTIONS = [
  "A futuristic city at sunset with flying cars",
  "Professional product photo of luxury watch",
  "Cozy coffee shop interior with warm lighting",
  "Abstract geometric shapes in vibrant colors",
  "Mountain landscape with aurora borealis",
  "Modern minimalist logo design",
  "Cyberpunk street scene at night",
  "Watercolor painting of blooming flowers"
];

// =================================================================
// 🎯 COMPONENTE PRINCIPAL
// =================================================================
export default function ImageGeneratorPage() {
  // Estados principais
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("realistic");
  const [activeTab, setActiveTab] = useState("create");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [latestImage, setLatestImage] = useState<string | null>(null);
  const [showPromptHelper, setShowPromptHelper] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Convex hooks
  const generate = useAction(api.imageGenerator.generateImage);
  const deleteImageMutation = useMutation(api.imageGenerator.deleteImage);
  const imageHistory = useQuery(api.imageGenerator.getImagesForUser) ?? [];
  const usageStats = useQuery(api.imageGenerator.getUsageStats) as UsageStats | undefined;

  // =================================================================
  // 🎊 FUNÇÕES AUXILIARES
  // =================================================================
  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6']
    });
  }, []);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("📋 Copiado!");
  }, []);

  const handleDownload = useCallback(async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("✅ Download concluído!");
      triggerConfetti();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao baixar");
    }
  }, [triggerConfetti]);

  const handleShare = useCallback(async (url: string, text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Imagem IA', text, url });
        toast.success("Compartilhado!");
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          handleCopy(url);
        }
      }
    } else {
      handleCopy(url);
    }
  }, [handleCopy]);

  const toggleLike = useCallback((id: string) => {
    setLikedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
        toast.success("Removido dos favoritos");
      } else {
        newSet.add(id);
        toast.success("❤️ Favoritado!");
        triggerConfetti();
      }
      return newSet;
    });
  }, [triggerConfetti]);

  const handleDelete = useCallback(async (imageId: Id<"generatedImages">, storageId: Id<"_storage">) => {
    try {
      await deleteImageMutation({ imageId, storageId });
      toast.success("🗑️ Imagem deletada!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao deletar");
    }
  }, [deleteImageMutation]);

  // Aplicar sugestão (CORRIGIDO: não é um hook)
  const applySuggestion = useCallback((suggestion: string) => {
    setPrompt(suggestion);
    toast.success("💡 Sugestão aplicada!");
    textareaRef.current?.focus();
  }, []);

  // =================================================================
  // 🎨 GERAR IMAGEM
  // =================================================================
  const handleGenerate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      toast.error("✍️ Descreva sua imagem!");
      textareaRef.current?.focus();
      return;
    }

    setIsGenerating(true);

    try {
      const style = STYLES.find(s => s.id === selectedStyle);
      const enhancedPrompt = `${prompt}, ${style?.prompt || ''}`;

      const result = await generate({ prompt: enhancedPrompt }) as GenerateResponse;

      if (result?.url) {
        setLatestImage(result.url);
        toast.success(
          <div className="flex flex-col gap-1">
            <p className="font-bold">🎉 Imagem criada!</p>
            <p className="text-xs">{result.message}</p>
          </div>
        );
        triggerConfetti();
        setActiveTab("gallery");
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao gerar imagem";
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, selectedStyle, generate, triggerConfetti]);

  // =================================================================
  // 🎯 RENDERIZAÇÃO
  // =================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      {/* Efeitos de fundo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="relative border-b border-white/10 bg-black/20 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Button>
              </Link>
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 border-0">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            </div>

            {usageStats && (
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-purple-500/50">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {usageStats.remainingToday} restantes
                </Badge>
                <Badge variant="outline" className="border-green-500/50">
                  <Zap className="w-3 h-3 mr-1" />
                  Grátis
                </Badge>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Conteúdo principal */}
      <div className="relative max-w-7xl mx-auto px-4 py-8">

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-block mb-4"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent bg-[length:200%_auto]">
              Gerador de Imagens IA
            </h1>
          </motion.div>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-6">
            Transforme suas ideias em <span className="text-purple-400 font-semibold">obras de arte visuais</span> com inteligência artificial de última geração
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Badge className="px-4 py-2 bg-purple-500/20 text-purple-300 border-purple-500/30">
              <Zap className="w-4 h-4 mr-2" />
              Resultado em 10s
            </Badge>
            <Badge className="px-4 py-2 bg-pink-500/20 text-pink-300 border-pink-500/30">
              <Star className="w-4 h-4 mr-2" />
              Qualidade 4K
            </Badge>
            <Badge className="px-4 py-2 bg-blue-500/20 text-blue-300 border-blue-500/30">
              <Rocket className="w-4 h-4 mr-2" />
              100% Grátis
            </Badge>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-2 max-w-md mx-auto bg-white/5 backdrop-blur-xl border border-white/10">
            <TabsTrigger value="create" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600">
              <Wand2 className="w-4 h-4 mr-2" />
              Criar
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-orange-600">
              <Grid3x3 className="w-4 h-4 mr-2" />
              Galeria
            </TabsTrigger>
          </TabsList>

          {/* TAB: CRIAR */}
          <TabsContent value="create">
            <div className="grid lg:grid-cols-5 gap-8">

              {/* Painel de controles */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-3"
              >
                <Card className="p-8 bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
                  <form onSubmit={handleGenerate} className="space-y-6">

                    {/* Prompt */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-semibold text-white flex items-center gap-2">
                          <Wand2 className="w-4 h-4 text-purple-400" />
                          Descreva sua visão
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPromptHelper(!showPromptHelper)}
                          className="text-xs"
                        >
                          {showPromptHelper ? 'Ocultar' : 'Ver'} sugestões
                        </Button>
                      </div>

                      <Textarea
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: A magical forest with glowing mushrooms and fireflies at twilight, fantasy art style, detailed, vibrant colors..."
                        className="min-h-[120px] bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 resize-none"
                        maxLength={500}
                      />

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {prompt.length}/500 caracteres
                        </span>
                        {prompt && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setPrompt("")}
                            className="text-xs h-6 px-2"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Limpar
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Sugestões */}
                    <AnimatePresence>
                      {showPromptHelper && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                            <p className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4" />
                              Sugestões de prompts:
                            </p>
                            <div className="grid gap-2">
                              {SUGGESTIONS.slice(0, 4).map((suggestion, i) => (
                                <motion.button
                                  key={i}
                                  type="button"
                                  whileHover={{ x: 4 }}
                                  onClick={() => applySuggestion(suggestion)}
                                  className="text-left text-sm text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-all flex items-center gap-2 group"
                                >
                                  <ChevronRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  {suggestion}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Estilos */}
                    <div>
                      <label className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Palette className="w-4 h-4 text-pink-400" />
                        Estilo visual
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {STYLES.map((style) => (
                          <motion.button
                            key={style.id}
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedStyle(style.id)}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              selectedStyle === style.id
                                ? `border-purple-500 bg-gradient-to-br ${style.gradient} bg-opacity-20`
                                : "border-white/10 bg-white/5 hover:border-white/20"
                            }`}
                          >
                            <div className="text-3xl mb-2">{style.emoji}</div>
                            <div className="text-sm font-medium text-white">{style.name}</div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Botão Gerar */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        disabled={isGenerating || !prompt.trim()}
                        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 shadow-2xl shadow-purple-500/50 disabled:opacity-50"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Criando magia...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Gerar Imagem Épica
                          </>
                        )}
                      </Button>
                    </motion.div>

                    {/* Info */}
                    {usageStats && (
                      <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-300">
                            ✨ {usageStats.remainingToday} gerações grátis hoje
                          </span>
                          <span className="text-xs text-gray-400">
                            {usageStats.costPerImage}
                          </span>
                        </div>
                      </div>
                    )}
                  </form>
                </Card>
              </motion.div>

              {/* Preview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2"
              >
                <Card className="p-6 bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl sticky top-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Eye className="w-4 h-4 text-pink-400" />
                      Preview
                    </h3>
                    {latestImage && (
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDownload(latestImage, `ai-image-${Date.now()}.png`)}
                          className="h-8 w-8"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setSelectedImage(latestImage)}
                          className="h-8 w-8"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl overflow-hidden relative">
                    {isGenerating ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="mb-4"
                        >
                          <Sparkles className="h-12 w-12 text-purple-400" />
                        </motion.div>
                        <p className="text-white font-medium">Criando algo incrível...</p>
                      </div>
                    ) : latestImage ? (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative w-full h-full"
                      >
                        <Image
                          src={latestImage}
                          alt="Generated"
                          fill
                          className="object-cover"
                        />
                      </motion.div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                        <ImageIcon className="w-16 h-16 mb-3" />
                        <p className="text-sm">Sua criação aparecerá aqui</p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* TAB: GALERIA */}
          <TabsContent value="gallery">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Header da galeria */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Sua Galeria de Arte
                  </h2>
                  <p className="text-gray-400">
                    {imageHistory.length} {imageHistory.length === 1 ? 'imagem' : 'imagens'} criadas
                  </p>
                </div>
                {likedImages.size > 0 && (
                  <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 px-4 py-2">
                    <Heart className="w-4 h-4 mr-2 fill-current" />
                    {likedImages.size} favoritas
                  </Badge>
                )}
              </div>

              {/* Grid de imagens */}
              {imageHistory.length === 0 ? (
                <Card className="p-20 bg-white/5 backdrop-blur-xl border-white/10 border-2 border-dashed text-center">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <ImageIcon className="w-20 h-20 mx-auto mb-6 text-gray-600" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Galeria vazia
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Comece criando sua primeira obra-prima!
                  </p>
                  <Button
                    onClick={() => setActiveTab("create")}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Criar Primeira Imagem
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {imageHistory.map((image: ImageDocument, index: number) => (
                      <motion.div
                        key={image._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -8 }}
                        className="group"
                      >
                        <Card className="overflow-hidden bg-white/5 backdrop-blur-xl border-white/10 hover:border-purple-500/50 transition-all">
                          <div className="relative aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                            <Image
                              src={image.imageUrl}
                              alt={image.prompt}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />

                            {/* Overlay com ações - CORRIGIDO PARA MOBILE */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent
                                          opacity-100 sm:opacity-0 sm:group-hover:opacity-100
                                          transition-all duration-300 flex flex-col justify-end p-4">
                              <p className="text-white text-xs mb-3 line-clamp-2 font-medium">
                                {image.prompt}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => toggleLike(image._id)}
                                    className="h-8 w-8 bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                                  >
                                    <Heart
                                      className={`w-4 h-4 ${
                                        likedImages.has(image._id)
                                          ? 'fill-red-500 text-red-500'
                                          : 'text-white'
                                      }`}
                                    />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleDownload(image.imageUrl, `ai-${image._id}.png`)}
                                    className="h-8 w-8 bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                                  >
                                    <Download className="w-4 h-4 text-white" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleShare(image.imageUrl, image.prompt)}
                                    className="h-8 w-8 bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                                  >
                                    <Share2 className="w-4 h-4 text-white" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleDelete(image._id, image.storageId)}
                                    className="h-8 w-8 bg-red-500/20 hover:bg-red-500/40 backdrop-blur-sm"
                                  >
                                    <Trash2 className="w-4 h-4 text-white" />
                                  </Button>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => setSelectedImage(image.imageUrl)}
                                  className="h-8 w-8 bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                                >
                                  <Maximize2 className="w-4 h-4 text-white" />
                                </Button>
                              </div>
                            </div>

                            {/* Badge de favorito */}
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
                  </AnimatePresence>
                </div>
              )}

              {/* Estatísticas */}
              {imageHistory.length > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
                >
                  {[
                    { label: 'Total', value: imageHistory.length, icon: ImageLucide, color: 'purple' },
                    { label: 'Favoritas', value: likedImages.size, icon: Heart, color: 'pink' },
                    { label: 'Esta semana', value: imageHistory.filter((img: ImageDocument) =>
                      img.createdAt && Date.now() - img.createdAt < 7 * 24 * 60 * 60 * 1000
                    ).length, icon: TrendingUp, color: 'blue' },
                    { label: 'Hoje', value: imageHistory.filter((img: ImageDocument) =>
                      img.createdAt && new Date(img.createdAt).toDateString() === new Date().toDateString()
                    ).length, icon: Zap, color: 'green' },
                  ].map((stat, i) => (
                    <Card key={i} className="p-4 bg-white/5 backdrop-blur-xl border-white/10 text-center">
                      <stat.icon className={`w-6 h-6 mx-auto mb-2 text-${stat.color}-400`} />
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-gray-400">{stat.label}</p>
                    </Card>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de visualização */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <Button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20"
              size="icon"
            >
              <X className="w-6 h-6" />
            </Button>

            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative rounded-2xl overflow-hidden">
                <Image
                  src={selectedImage}
                  alt="Full view"
                  width={1920}
                  height={1080}
                  className="w-full h-auto"
                />
              </div>

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 backdrop-blur-lg rounded-full p-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDownload(selectedImage, `image-${Date.now()}.png`)}
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
    </div>
  );
}