"use client";

import { useState, useCallback } from "react";
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


import {
  Loader2, Sparkles, Wand2, Download, Share2, Heart, Maximize2,
   Grid3x3, Image as ImageIcon, Camera,
  Shapes, X, ArrowLeft, BookOpen, ShoppingBag, Instagram, TrendingUp,
  Video, Crown, Rocket, Film, Brain, Star, Eye,
  CheckCircle, Zap, Hash
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { ScrollArea } from "@radix-ui/react-scroll-area";

// ========== TIPOS ==========

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

// ========== CONFIGURAÇÕES ==========

const businessCategories = [
  { id: "ecommerce", name: "E-commerce", icon: ShoppingBag },
  { id: "content", name: "Conteúdo", icon: Video },
  { id: "social", name: "Social", icon: Instagram },
  { id: "marketing", name: "Marketing", icon: TrendingUp },
];

const stylePresets = [
  { id: "realistic", name: "Realista", icon: Camera },
  { id: "artistic", name: "Artístico", icon: Sparkles },
  { id: "3d", name: "3D", icon: Shapes },
  { id: "minimal", name: "Minimal", icon: Grid3x3 },
];

const videoStyles = [
  { id: "viral", name: "Viral", icon: TrendingUp, color: "from-pink-500 to-purple-500" },
  { id: "motivational", name: "Motivacional", icon: Rocket, color: "from-orange-500 to-red-500" },
  { id: "educational", name: "Educativo", icon: Brain, color: "from-blue-500 to-cyan-500" },
  { id: "funny", name: "Engraçado", icon: Star, color: "from-yellow-500 to-orange-500" }
];

// ========== COMPONENTE PRINCIPAL ==========

export function ImageGenerator() {
  // Estados principais
  const [activeTab, setActiveTab] = useState("create");
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("realistic");
  const [selectedBusiness, setSelectedBusiness] = useState("ecommerce");
  const [latestImage, setLatestImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para vídeo
  const [videoTopic, setVideoTopic] = useState("");
  const [selectedVideoStyle, setSelectedVideoStyle] = useState("viral");
  const [videoDuration, setVideoDuration] = useState(30);
  const [videoScript, setVideoScript] = useState<VideoScript | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  // Estados UI
  const [, setCopiedText] = useState<string | null>(null);
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set());
  const [showTutorial, setShowTutorial] = useState(false);

  // Hooks Convex
  const generate = useAction(api.imageGenerator.generateImage);
  const generateVideo = useAction(api.imageGenerator.generateVideoScript);
  const imageHistory = useQuery(api.imageGenerator.getImagesForUser) ?? [];
  const usageStats = useQuery(api.imageGenerator.getUsageStats);

  // ========== FUNÇÕES ==========

  const handleCopyText = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success("Copiado!");
    setTimeout(() => setCopiedText(null), 2000);
  }, []);

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `imagem-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Download iniciado!");
    } catch (error) {
      console.error("Erro ao baixar:", error);
      toast.error("Erro ao baixar");
    }
  };

  const handleShare = async (url: string, text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Criado com IA',
          text,
          url
        });
      } catch (error) {
        console.log('Share cancelado:', error);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  const toggleLikeImage = useCallback((imageId: string) => {
    setLikedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
        toast.success("Favoritado!");
      }
      return newSet;
    });
  }, []);

  // GERAR IMAGEM
  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Descreva sua imagem");
      return;
    }

    setIsLoading(true);
    try {
      const result = await generate({
        prompt: `${prompt} ${selectedStyle} style`
      }) as GenerateImageResponse;

      if (result && result.url) {
        setLatestImage(result.url);
        toast.success(result.message || "Imagem gerada com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      toast.error("Erro ao gerar imagem");
    } finally {
      setIsLoading(false);
    }
  };

  // GERAR ROTEIRO
  const handleGenerateVideo = async () => {
    if (!videoTopic.trim()) {
      toast.error("Descreva o tema do vídeo");
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
        toast.success(result.message || "Roteiro criado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao gerar roteiro:", error);
      toast.error("Erro ao gerar roteiro");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // ========== RENDERIZAÇÃO ==========

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-800">
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Voltar</span>
              </Link>

              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <Crown className="w-4 h-4 mr-1" />
                Premium
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              {usageStats && (
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <Badge variant="outline">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {usageStats.geminiImagesRemaining || 0} imagens
                  </Badge>
                  <Badge variant="outline">
                    <Film className="w-3 h-3 mr-1" />
                    {usageStats.geminiVideosRemaining || 0} roteiros
                  </Badge>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTutorial(true)}
              >
                <BookOpen className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tutorial */}
      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Como usar</DialogTitle>
            <DialogDescription>
              Crie conteúdo viral em minutos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Gere imagens profissionais</p>
                <p className="text-sm text-gray-600">Com IA avançada</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Crie roteiros virais</p>
                <p className="text-sm text-gray-600">Com instruções para Canva e CapCut</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-3">
            Crie Conteúdo Viral com IA
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Imagens profissionais e roteiros virais com tutoriais completos.
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="create">
              <Wand2 className="w-4 h-4 mr-2" />
              Criar
            </TabsTrigger>
            <TabsTrigger value="video">
              <Video className="w-4 h-4 mr-2" />
              Roteiro
            </TabsTrigger>
            <TabsTrigger value="gallery">
              <Grid3x3 className="w-4 h-4 mr-2" />
              Galeria
            </TabsTrigger>
          </TabsList>

          {/* TAB: CRIAR IMAGEM */}
          <TabsContent value="create" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Controles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    Gerador de Imagens
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleGenerateImage} className="space-y-4">
                    {/* Categoria */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Categoria</label>
                      <div className="grid grid-cols-2 gap-2">
                        {businessCategories.map((cat) => {
                          const Icon = cat.icon;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setSelectedBusiness(cat.id)}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                selectedBusiness === cat.id
                                  ? "border-purple-500 bg-purple-50"
                                  : "border-gray-200"
                              }`}
                            >
                              <Icon className="w-5 h-5 mx-auto mb-1" />
                              <span className="text-xs">{cat.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Prompt */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Descreva sua imagem</label>
                      <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Produto minimalista em fundo branco..."
                        className="min-h-[100px]"
                      />
                    </div>

                    {/* Estilo */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Estilo</label>
                      <div className="grid grid-cols-2 gap-2">
                        {stylePresets.map((style) => {
                          const Icon = style.icon;
                          return (
                            <button
                              key={style.id}
                              type="button"
                              onClick={() => setSelectedStyle(style.id)}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                selectedStyle === style.id
                                  ? "border-purple-500 bg-purple-50"
                                  : "border-gray-200"
                              }`}
                            >
                              <Icon className="w-5 h-5 mx-auto mb-1" />
                              <span className="text-xs">{style.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Botão */}
                    <Button
                      type="submit"
                      disabled={isLoading || !prompt.trim()}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Gerar Imagem
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Preview</CardTitle>
                    {latestImage && (
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDownload(latestImage)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleShare(latestImage, prompt)}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <AspectRatio ratio={1} className="bg-gray-100 rounded-lg overflow-hidden">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                      </div>
                    ) : latestImage ? (
                      <Image
                        src={latestImage}
                        alt={prompt}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                  </AspectRatio>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB: ROTEIRO DE VÍDEO */}
          <TabsContent value="video" className="mt-6">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-purple-500" />
                  Criador de Roteiros Virais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!videoScript ? (
                  <>
                    {/* Formulário */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tema do Vídeo</label>
                      <Textarea
                        value={videoTopic}
                        onChange={(e) => setVideoTopic(e.target.value)}
                        placeholder="Ex: 5 dicas para vender mais..."
                        className="min-h-[80px]"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Estilo</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {videoStyles.map((style) => {
                          const Icon = style.icon;
                          return (
                            <button
                              key={style.id}
                              onClick={() => setSelectedVideoStyle(style.id)}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                selectedVideoStyle === style.id
                                  ? `border-purple-500 bg-gradient-to-br ${style.color} text-white`
                                  : "border-gray-200"
                              }`}
                            >
                              <Icon className="w-5 h-5 mx-auto mb-1" />
                              <span className="text-xs font-medium">{style.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Duração: {videoDuration} segundos
                      </label>
                      <div className="flex gap-2">
                        {[15, 30, 45, 60].map((dur) => (
                          <Button
                            key={dur}
                            variant={videoDuration === dur ? "default" : "outline"}
                            size="sm"
                            onClick={() => setVideoDuration(dur)}
                          >
                            {dur}s
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={handleGenerateVideo}
                      disabled={isGeneratingVideo || !videoTopic.trim()}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      {isGeneratingVideo ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando roteiro viral...
                        </>
                      ) : (
                        <>
                          <Film className="mr-2 h-4 w-4" />
                          Criar Roteiro Viral
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  /* Roteiro Gerado */
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-6 pr-4">
                      {/* Header do Roteiro */}
                      <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg">
                        <h3 className="font-bold text-lg mb-2">{videoScript.title}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge><Zap className="w-3 h-3 mr-1" />{videoScript.duration}</Badge>
                          <Badge><Eye className="w-3 h-3 mr-1" />{videoScript.format}</Badge>
                          <Badge><Sparkles className="w-3 h-3 mr-1" />{videoScript.style}</Badge>
                        </div>
                      </div>

                      {/* Hook */}
                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                        <p className="font-semibold text-yellow-900 mb-1">🎯 GANCHO INICIAL:</p>
                        <p className="text-lg font-bold text-yellow-900">{videoScript.hook}</p>
                      </div>

                      {/* Cenas */}
                      <div>
                        <h4 className="font-semibold mb-3">📎 Roteiro Detalhado</h4>
                        {videoScript.scenes.map((scene) => (
                          <div key={scene.number} className="mb-4 p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Badge>Cena {scene.number}</Badge>
                              <span className="text-sm text-gray-500">{scene.duration}</span>
                            </div>
                            <p className="font-medium mb-1">{scene.text}</p>
                            <p className="text-sm text-gray-600 mb-2">{scene.visual}</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-gray-50 p-2 rounded">
                                <strong>Câmera:</strong> {scene.camera}
                              </div>
                              <div className="bg-gray-50 p-2 rounded">
                                <strong>Transição:</strong> {scene.transition}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Música */}
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">🎵 Música Recomendada</h4>
                        <p>{videoScript.music}</p>
                      </div>

                      {/* Tutorial Canva */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3 flex items-center">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Tutorial Completo - Canva
                        </h4>
                        <div className="space-y-1">
                          {videoScript.canvaSteps.map((step, i) => (
                            <p key={i} className="text-sm">{step}</p>
                          ))}
                        </div>
                      </div>

                      {/* Tutorial CapCut */}
                      <div className="bg-pink-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3 flex items-center">
                          <Video className="w-4 h-4 mr-2" />
                          Tutorial Completo - CapCut
                        </h4>
                        <div className="space-y-1">
                          {videoScript.capcutSteps.map((step, i) => (
                            <p key={i} className="text-sm">{step}</p>
                          ))}
                        </div>
                      </div>

                      {/* Hashtags */}
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <Hash className="w-4 h-4 mr-2" />
                          Hashtags Virais
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {videoScript.hashtags.map((tag, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="cursor-pointer hover:bg-gray-100"
                              onClick={() => handleCopyText(tag)}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Call to Action */}
                      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <p className="font-semibold text-green-900 mb-1">💬 CALL TO ACTION:</p>
                        <p className="text-green-900">{videoScript.cta}</p>
                      </div>

                      {/* Pro Tips */}
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">💡 Dicas Pro para Viralizar</h4>
                        <div className="space-y-2">
                          {videoScript.proTips.map((tip, i) => (
                            <p key={i} className="text-sm">{tip}</p>
                          ))}
                        </div>
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            const text = JSON.stringify(videoScript, null, 2);
                            const blob = new Blob([text], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `roteiro-${Date.now()}.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Baixar Roteiro
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setVideoScript(null)}
                        >
                          Criar Novo
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: GALERIA */}
          <TabsContent value="gallery" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Suas Criações</h2>
                <Badge variant="outline">{imageHistory.length} imagens</Badge>
              </div>

              {imageHistory.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">Nenhuma imagem ainda</p>
                    <Button
                      onClick={() => setActiveTab("create")}
                      className="mt-4"
                    >
                      Criar Primeira Imagem
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imageHistory.map((image: GeneratedImage) => (
                    <motion.div
                      key={image._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group relative"
                    >
                      <Card className="overflow-hidden">
                        <div className="relative aspect-square">
                          <Image
                            src={image.imageUrl}
                            alt={image.prompt}
                            fill
                            className="object-cover"
                          />

                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                            <div className="w-full">
                              <p className="text-white text-xs mb-2 line-clamp-2">
                                {image.prompt}
                              </p>
                              <div className="flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-white hover:bg-white/20"
                                  onClick={() => toggleLikeImage(image._id)}
                                >
                                  <Heart className={`w-4 h-4 ${likedImages.has(image._id) ? 'fill-current' : ''}`} />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-white hover:bg-white/20"
                                  onClick={() => handleDownload(image.imageUrl)}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-white hover:bg-white/20"
                                  onClick={() => setSelectedImage(image.imageUrl)}
                                >
                                  <Maximize2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Visualização */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl w-full">
              <Button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0"
                variant="ghost"
              >
                <X className="w-6 h-6 text-white" />
              </Button>
              <Image
                src={selectedImage}
                alt="Preview"
                width={1920}
                height={1080}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}