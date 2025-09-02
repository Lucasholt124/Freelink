"use client";

import { useState, useRef, useCallback } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Doc } from "../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import {
  Loader2, Sparkles, Wand2, Download, Share2, Heart, Maximize2,
  Palette, Copy, Check, Grid3x3, Image as ImageIcon,
  Star, Lightbulb, Brush, Camera, Shapes, X, ArrowLeft, BookOpen,
  User, ShoppingBag, Instagram, TrendingUp, Edit, Upload, Video, Music,
   Crown, Rocket, Film, Eye,
   Scissors, Brain,
  AlertCircle
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Alert, AlertDescription } from "./ui/alert";

// ========== TIPOS ==========

interface VideoScene {
  duration: number;
  text: string;
  visualPrompt: string;
  transition: string;
  imageUrl?: string;
}

interface VideoScript {
  title: string;
  scenes: VideoScene[];
  music: string;
  voiceStyle: string;
  captions: {
    style: string;
    color: string;
    animation: string;
  };
  totalDuration: number;
  format: string;
  fps: number;
}

// ========== CONFIGURAÇÕES ==========

const businessCategories = [
  { id: "ecommerce", name: "E-commerce", icon: ShoppingBag },
  { id: "content", name: "Criador de Conteúdo", icon: Edit },
  { id: "social", name: "Redes Sociais", icon: Instagram },
  { id: "marketing", name: "Marketing", icon: TrendingUp },
  { id: "branding", name: "Branding", icon: Palette },
  { id: "product", name: "Produtos", icon: Star }
];

const stylePresets = [
  { id: "realistic", name: "Realista", icon: Camera },
  { id: "artistic", name: "Artístico", icon: Brush },
  { id: "3d", name: "3D Render", icon: Shapes },
  { id: "minimal", name: "Minimalista", icon: Grid3x3 },
  { id: "product", name: "Produto", icon: ShoppingBag },
  { id: "lifestyle", name: "Lifestyle", icon: User }
];

const businessPrompts: Record<string, string[]> = {
  ecommerce: [
    "produto elegante em fundo minimalista branco",
    "modelo exibindo roupas em cenário urbano moderno",
    "close detalhado do produto com iluminação suave"
  ],
  content: [
    "criador produzindo conteúdo em estúdio profissional",
    "setup de gravação com equipamentos modernos",
    "influencer criando conteúdo viral"
  ],
  social: [
    "foto instagramável com composição perfeita",
    "conteúdo viral para redes sociais",
    "post engajador com elementos visuais"
  ],
  marketing: [
    "campanha publicitária impactante",
    "material de marketing profissional",
    "anúncio criativo e persuasivo"
  ],
  branding: [
    "identidade visual moderna e consistente",
    "logo aplicado em mockup realista",
    "brand guidelines profissionais"
  ],
  product: [
    "produto em destaque com iluminação dramática",
    "packshot profissional em fundo neutro",
    "demonstração visual do produto"
  ]
};

const socialFormats = [
  { id: "instagram_post", name: "Post Instagram", ratio: "1:1", size: "1080x1080" },
  { id: "instagram_story", name: "Story Instagram", ratio: "9:16", size: "1080x1920" },
  { id: "instagram_reel", name: "Reels", ratio: "9:16", size: "1080x1920" },
  { id: "tiktok", name: "TikTok", ratio: "9:16", size: "1080x1920" },
  { id: "youtube_short", name: "YouTube Shorts", ratio: "9:16", size: "1080x1920" },
  { id: "facebook_post", name: "Post Facebook", ratio: "16:9", size: "1200x630" }
];

const videoStyles = [
  { id: "viral", name: "Viral/TikTok", icon: TrendingUp, color: "from-pink-500 to-purple-500" },
  { id: "motivational", name: "Motivacional", icon: Rocket, color: "from-orange-500 to-red-500" },
  { id: "educational", name: "Educativo", icon: Brain, color: "from-blue-500 to-cyan-500" },
  { id: "funny", name: "Engraçado", icon: Star, color: "from-yellow-500 to-orange-500" }
];

const musicOptions = [
  { id: "epic", name: "Épica Motivacional", bpm: 140 },
  { id: "upbeat", name: "Alegre e Animada", bpm: 120 },
  { id: "chill", name: "Lo-fi Relaxante", bpm: 80 },
  { id: "trap", name: "Trap Moderno", bpm: 160 },
  { id: "none", name: "Sem Música", bpm: 0 }
];

// ========== COMPONENTE PRINCIPAL ==========

export function ImageGenerator() {
  // Estados principais
  const [activeTab, setActiveTab] = useState("create");
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("realistic");
  const [selectedBusiness, setSelectedBusiness] = useState("ecommerce");
  const [selectedFormat, setSelectedFormat] = useState("instagram_post");
  const [imageQuality, setImageQuality] = useState([90]);
  const [latestImage, setLatestImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para aprimoramento
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Estados para vídeo
  const [videoTopic, setVideoTopic] = useState("");
  const [selectedVideoStyle, setSelectedVideoStyle] = useState("viral");
  const [selectedMusic, setSelectedMusic] = useState("epic");
  const [videoDuration, setVideoDuration] = useState([30]);
  const [videoScript, setVideoScript] = useState<VideoScript | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);

  // Estados UI
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set());
  const [showTutorial, setShowTutorial] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Hooks Convex
  const generate = useAction(api.imageGenerator.generateImage);
  const enhance = useAction(api.imageGenerator.enhanceImage);
  const generateVideo = useAction(api.imageGenerator.generateVideoScript);
  const imageHistory = useQuery(api.imageGenerator.getImagesForUser) || [];

  // ========== FUNÇÕES UTILITÁRIAS ==========

  const getRatioValue = (ratioStr: string) => {
    const ratios: Record<string, number> = {
      "1:1": 1,
      "16:9": 16/9,
      "9:16": 9/16,
      "2:3": 2/3
    };
    return ratios[ratioStr] || 1;
  };

  const getBusinessPrompts = useCallback(() => {
    return businessPrompts[selectedBusiness] || [];
  }, [selectedBusiness]);

  const handleCopyText = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success("Copiado para a área de transferência!");
    setTimeout(() => setCopiedText(null), 2000);
  }, []);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `mentor-ia-${filename}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Download iniciado!");
    } catch {
      toast.error("Erro ao baixar imagem");
    }
  };

  const handleShare = async (url: string, text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Conteúdo criado com Mentor.IA',
          text: text,
          url: url
        });
      } catch {
        console.log('Share cancelado');
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
        toast.success("Removido dos favoritos");
      } else {
        newSet.add(imageId);
        toast.success("Adicionado aos favoritos!");
      }
      return newSet;
    });
  }, []);

  // ========== GERAÇÃO DE IMAGEM ==========

  const handleGenerateImage = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!prompt.trim()) {
    toast.error("Por favor, descreva sua imagem");
    return;
  }

  setIsLoading(true);
  setError(null);
  setLatestImage(null);

  try {
    const format = socialFormats.find(f => f.id === selectedFormat);
    const fullPrompt = `${prompt}, ${selectedStyle} style, ${format?.ratio} aspect ratio, professional quality, for ${selectedBusiness} business, in Portuguese Brazil market`;

    const imageUrl = await generate({ prompt: fullPrompt });
    setLatestImage(imageUrl);
    toast.success("Imagem gerada com sucesso! 🎨");

    // Analytics removido - adicionar quando necessário

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Erro ao gerar imagem";
    setError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setIsLoading(false);
  }
};

  // ========== APRIMORAMENTO DE IMAGEM ==========

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Imagem muito grande. Máximo: 10MB");
        return;
      }

      setUploadedImage(file);
      const url = URL.createObjectURL(file);
      setUploadedImageUrl(url);
      setEnhancedImage(null);
      toast.success("Imagem carregada!");
    }
  };

  const handleEnhanceImage = async (enhancement: string) => {
    if (!uploadedImageUrl) {
      toast.error("Por favor, faça upload de uma imagem primeiro");
      return;
    }

    setIsEnhancing(true);
    try {
      let enhancementPrompt = "";

      switch(enhancement) {
        case "remove-bg":
          enhancementPrompt = "Remover fundo da imagem";
          toast.info("Removendo fundo...");
          break;
        case "upscale":
          enhancementPrompt = "Aumentar qualidade para 4K";
          toast.info("Melhorando qualidade...");
          break;
        case "fix-lighting":
          enhancementPrompt = "Corrigir iluminação";
          toast.info("Ajustando iluminação...");
          break;
        case "enhance-colors":
          enhancementPrompt = "Melhorar cores e contraste";
          toast.info("Otimizando cores...");
          break;
      }

      const result = await enhance({
        imageUrl: uploadedImageUrl,
        enhancement: enhancement
      });

      setEnhancedImage(result);
      toast.success(`✨ ${enhancementPrompt} concluído!`);

    } catch {
      toast.error("Erro ao aprimorar imagem");
    } finally {
      setIsEnhancing(false);
    }
  };

  // ========== GERAÇÃO DE VÍDEO ==========

  const handleGenerateVideo = async () => {
    if (!videoTopic.trim()) {
      toast.error("Por favor, descreva o tema do vídeo");
      return;
    }

    setIsGeneratingVideo(true);
    setVideoProgress(0);
    setFinalVideoUrl(null);

    try {
      // Simula progresso
      const progressInterval = setInterval(() => {
        setVideoProgress(prev => {
          if (prev >= 90) return 90;
          return prev + 10;
        });
      }, 500);

      // Gera script com cenas
      const script = await generateVideo({
        topic: videoTopic,
        style: selectedVideoStyle,
        duration: videoDuration[0]
      });

      setVideoScript(script);
      clearInterval(progressInterval);
      setVideoProgress(100);

      // Cria vídeo no browser
      await createVideoFromScript(script);

      toast.success("🎬 Vídeo viral criado com sucesso!");

    } catch {
      toast.error("Erro ao gerar vídeo");
    } finally {
      setIsGeneratingVideo(false);
      setVideoProgress(0);
    }
  };

  // Função para criar vídeo usando Canvas e MediaRecorder
  const createVideoFromScript = async (script: VideoScript) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configura canvas para formato vertical (9:16)
    canvas.width = 1080;
    canvas.height = 1920;

    // MediaRecorder para gravar o canvas
    const stream = canvas.captureStream(30); // 30 fps
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 5000000 // 5 Mbps
    });

    const chunks: BlobPart[] = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setFinalVideoUrl(url);
    };

    mediaRecorder.start();

    // Anima cada cena
    for (const scene of script.scenes) {
      await animateScene(ctx, scene, canvas.width, canvas.height);
    }

    mediaRecorder.stop();
  };

  // Anima uma cena no canvas
  const animateScene = async (
    ctx: CanvasRenderingContext2D,
    scene: VideoScene,
    width: number,
    height: number
  ) => {
    return new Promise<void>((resolve) => {
      const duration = scene.duration * 1000; // Converte para ms
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Limpa canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // Desenha imagem da cena (se houver)
        if (scene.imageUrl) {
          const img = new window.Image();
          img.onload = () => {
            // Efeito Ken Burns (zoom suave)
            const scale = 1 + (progress * 0.1);
            const x = (width - width * scale) / 2;
            const y = (height - height * scale) / 2;

            ctx.save();
            ctx.translate(width/2, height/2);
            ctx.scale(scale, scale);
            ctx.translate(-width/2, -height/2);
            ctx.drawImage(img, x, y, width, height);
            ctx.restore();
          };
          img.src = scene.imageUrl;
        }

        // Desenha legendas estilo Mr Beast
        ctx.save();

        // Sombra para o texto
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        // Configuração do texto
        ctx.font = 'bold 72px Arial';
        ctx.fillStyle = '#FFFF00';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Animação do texto (bounce)
        const textScale = 1 + Math.sin(progress * Math.PI) * 0.2;
        ctx.save();
        ctx.translate(width/2, height/2);
        ctx.scale(textScale, textScale);

        // Quebra o texto em linhas
        const words = scene.text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        words.forEach((word: string) => {
          const testLine = currentLine + word + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > width - 100 && currentLine !== '') {
            lines.push(currentLine);
            currentLine = word + ' ';
          } else {
            currentLine = testLine;
          }
        });
        lines.push(currentLine);

        // Desenha cada linha
        lines.forEach((line, i) => {
          const y = (i - lines.length/2) * 80;
          ctx.fillText(line.trim(), 0, y);
        });

        ctx.restore();
        ctx.restore();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  };

  // ========== RENDERIZAÇÃO ==========

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Canvas oculto para geração de vídeo */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header Premium */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur-sm opacity-50"></div>
                  <Badge className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-3 py-1">
                    <Crown className="w-4 h-4 mr-1" />
                    Mentor.IA Ultimate
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTutorial(true)}
                className="hidden sm:flex"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Tutorial
              </Button>

              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Eye className="w-4 h-4" />
                <span className="font-medium">{imageHistory.length}</span>
                <span className="hidden sm:inline">criações</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tutorial Dialog */}
      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Como usar o Mentor.IA Ultimate</DialogTitle>
            <DialogDescription>
              Aprenda a criar conteúdo viral em minutos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-purple-600">1</span>
              </div>
              <div>
                <h4 className="font-medium">Gere imagens profissionais</h4>
                <p className="text-sm text-gray-600">Descreva sua ideia e escolha o estilo visual</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-purple-600">2</span>
              </div>
              <div>
                <h4 className="font-medium">Aprimore suas imagens</h4>
                <p className="text-sm text-gray-600">Remova fundos, melhore qualidade e ajuste cores</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-purple-600">3</span>
              </div>
              <div>
                <h4 className="font-medium">Crie vídeos virais</h4>
                <p className="text-sm text-gray-600">Gere scripts e vídeos com legendas automáticas</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert de erro */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-3">
            Crie Conteúdo Viral com IA
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Gere imagens profissionais, remova fundos, crie vídeos virais com legendas e muito mais.
            Tudo com Inteligência Artificial de última geração.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">1M+</div>
              <div className="text-xs text-gray-500">Imagens Criadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">500K+</div>
              <div className="text-xs text-gray-500">Vídeos Virais</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">4.9★</div>
              <div className="text-xs text-gray-500">Avaliação</div>
            </div>
          </div>
        </motion.div>

        {/* Tabs Principais */}
        <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 max-w-2xl mx-auto mb-8 h-auto p-1 bg-gray-100">
            <TabsTrigger
              value="create"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-3"
            >
              <div className="flex flex-col items-center gap-1">
                <Wand2 className="w-5 h-5" />
                <span className="text-xs font-medium">Criar</span>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="enhance"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-3"
            >
              <div className="flex flex-col items-center gap-1">
                <Upload className="w-5 h-5" />
                <span className="text-xs font-medium">Aprimorar</span>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="video"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-3"
            >
              <div className="flex flex-col items-center gap-1">
                <Video className="w-5 h-5" />
                <span className="text-xs font-medium">Vídeo</span>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="gallery"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm py-3"
            >
              <div className="flex flex-col items-center gap-1">
                <Grid3x3 className="w-5 h-5" />
                <span className="text-xs font-medium">Galeria</span>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: CRIAR IMAGEM */}
          <TabsContent value="create" className="mt-0">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Controles */}
              <div className="space-y-5">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      Gerador de Imagens com IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleGenerateImage} className="space-y-5">
                      {/* Categoria de Negócio */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Seu Tipo de Negócio
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {businessCategories.map((category) => {
                            const Icon = category.icon;
                            return (
                              <button
                                key={category.id}
                                type="button"
                                onClick={() => setSelectedBusiness(category.id)}
                                className={`relative p-3 rounded-lg border-2 transition-all ${
                                  selectedBusiness === category.id
                                    ? "border-purple-500 bg-purple-50 text-purple-700 shadow-md"
                                    : "border-gray-200 hover:border-gray-300 bg-white"
                                }`}
                              >
                                <Icon className="w-5 h-5 mx-auto mb-1" />
                                <span className="text-xs font-medium">{category.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Formato */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Formato para Redes Sociais
                        </label>
                        <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {socialFormats.map(format => (
                              <SelectItem key={format.id} value={format.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{format.name}</span>
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {format.size}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Prompt */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Descreva sua Imagem
                        </label>
                        <Textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="Ex: Produto minimalista em fundo branco com iluminação suave..."
                          className="min-h-[100px] resize-none"
                          disabled={isLoading}
                        />
                      </div>

                      {/* Estilo */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Estilo Visual
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {stylePresets.map((style) => {
                            const Icon = style.icon;
                            return (
                              <button
                                key={style.id}
                                type="button"
                                onClick={() => setSelectedStyle(style.id)}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                  selectedStyle === style.id
                                    ? "border-purple-500 bg-purple-50 text-purple-700"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <Icon className="w-5 h-5 mx-auto mb-1" />
                                <span className="text-xs">{style.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Qualidade */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium">Qualidade</label>
                          <span className="text-sm font-bold text-purple-600">{imageQuality[0]}%</span>
                        </div>
                        <Slider
                          value={imageQuality}
                          onValueChange={setImageQuality}
                          max={100}
                          min={50}
                          step={10}
                        />
                      </div>

                      {/* Botão Gerar */}
                      <Button
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                        className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Criando sua obra-prima...
                          </>
                        ) : (
                          <>
                            <Wand2 className="mr-2 h-5 w-5" />
                            Gerar Imagem Profissional
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Templates Rápidos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      Ideias Rápidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {getBusinessPrompts().map((p, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          onClick={() => setPrompt(p)}
                          className="text-xs"
                        >
                          {p}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview */}
              <div>
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Preview</CardTitle>
                      {latestImage && (
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDownload(latestImage, "image")}
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
                    <AspectRatio
                      ratio={getRatioValue(socialFormats.find(f => f.id === selectedFormat)?.ratio || "1:1")}
                      className="bg-gray-100 rounded-lg overflow-hidden"
                    >
                      {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full">
                          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
                          <p className="text-gray-500 animate-pulse">Criando com IA...</p>
                        </div>
                      ) : latestImage ? (
                        <Image
                          src={latestImage}
                          alt={prompt}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <ImageIcon className="w-16 h-16 mb-3 opacity-20" />
                          <p className="text-sm">Sua imagem aparecerá aqui</p>
                        </div>
                      )}
                    </AspectRatio>

                    {latestImage && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Prompt usado:</p>
                        <p className="text-sm text-gray-700">{prompt}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyText(prompt)}
                          className="mt-2"
                        >
                          {copiedText === prompt ? (
                            <>
                              <Check className="w-3 h-3 mr-1" />
                              Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 mr-1" />
                              Copiar prompt
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: APRIMORAR IMAGEM */}
          <TabsContent value="enhance" className="mt-0">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-500" />
                    Aprimorador de Imagens com IA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Upload */}
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">
                      {uploadedImage ? uploadedImage.name : "Clique ou arraste uma imagem"}
                    </p>
                    <p className="text-sm text-gray-500">PNG, JPG até 10MB</p>
                  </div>

                  {/* Ações de Aprimoramento */}
                  {uploadedImageUrl && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Button
                        onClick={() => handleEnhanceImage("remove-bg")}
                        disabled={isEnhancing}
                        variant="outline"
                        className="h-auto py-4 flex-col gap-2"
                      >
                        <Scissors className="w-5 h-5" />
                        <span className="text-xs">Remover Fundo</span>
                      </Button>

                      <Button
                        onClick={() => handleEnhanceImage("upscale")}
                        disabled={isEnhancing}
                        variant="outline"
                        className="h-auto py-4 flex-col gap-2"
                      >
                        <Maximize2 className="w-5 h-5" />
                        <span className="text-xs">Aumentar Qualidade</span>
                      </Button>

                      <Button
                        onClick={() => handleEnhanceImage("fix-lighting")}
                        disabled={isEnhancing}
                        variant="outline"
                        className="h-auto py-4 flex-col gap-2"
                      >
                        <Lightbulb className="w-5 h-5" />
                        <span className="text-xs">Corrigir Iluminação</span>
                      </Button>

                      <Button
                        onClick={() => handleEnhanceImage("enhance-colors")}
                        disabled={isEnhancing}
                        variant="outline"
                        className="h-auto py-4 flex-col gap-2"
                      >
                        <Palette className="w-5 h-5" />
                        <span className="text-xs">Melhorar Cores</span>
                      </Button>
                    </div>
                  )}

                  {/* Comparação Antes/Depois */}
                  {uploadedImageUrl && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Original</h3>
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={uploadedImageUrl}
                            alt="Original"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-2">Aprimorada</h3>
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                          {isEnhancing ? (
                            <div className="flex items-center justify-center h-full">
                              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                            </div>
                          ) : enhancedImage ? (
                            <Image
                              src={enhancedImage}
                              alt="Aprimorada"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                              <ImageIcon className="w-12 h-12 opacity-20" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Download Aprimorada */}
                  {enhancedImage && (
                    <div className="flex justify-center">
                      <Button
                        onClick={() => handleDownload(enhancedImage, "enhanced")}
                        className="bg-gradient-to-r from-purple-600 to-pink-600"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar Imagem Aprimorada
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 3: CRIAR VÍDEO */}
          <TabsContent value="video" className="mt-0">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-purple-500" />
                    Criador de Vídeos Virais com IA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Input do Tema */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Tema do Vídeo
                    </label>
                    <Textarea
                      value={videoTopic}
                      onChange={(e) => setVideoTopic(e.target.value)}
                      placeholder="Ex: 5 dicas para vender mais no Instagram..."
                      className="min-h-[80px]"
                    />
                  </div>

                  {/* Estilo do Vídeo */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Estilo do Vídeo
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {videoStyles.map((style) => {
                        const Icon = style.icon;
                        return (
                          <button
                            key={style.id}
                            onClick={() => setSelectedVideoStyle(style.id)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              selectedVideoStyle === style.id
                                ? "border-purple-500 bg-gradient-to-br " + style.color + " text-white"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <Icon className="w-6 h-6 mx-auto mb-2" />
                            <span className="text-xs font-medium">{style.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Música */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Trilha Sonora
                    </label>
                    <Select value={selectedMusic} onValueChange={setSelectedMusic}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {musicOptions.map(music => (
                          <SelectItem key={music.id} value={music.id}>
                            <div className="flex items-center gap-2">
                              <Music className="w-4 h-4" />
                              <span>{music.name}</span>
                              {music.bpm > 0 && (
                                <Badge variant="outline" className="ml-auto text-xs">
                                  {music.bpm} BPM
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duração */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium">Duração</label>
                      <span className="text-sm font-bold text-purple-600">{videoDuration[0]}s</span>
                    </div>
                    <Slider
                      value={videoDuration}
                      onValueChange={setVideoDuration}
                      max={60}
                      min={15}
                      step={5}
                    />
                  </div>

                  {/* Botão Gerar Vídeo */}
                  <Button
                    onClick={handleGenerateVideo}
                    disabled={isGeneratingVideo || !videoTopic.trim()}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
                  >
                    {isGeneratingVideo ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Criando vídeo viral... {videoProgress}%
                      </>
                    ) : (
                      <>
                        <Film className="mr-2 h-5 w-5" />
                        Criar Vídeo Viral Agora
                      </>
                    )}
                  </Button>

                  {/* Progress Bar */}
                  {isGeneratingVideo && (
                    <Progress value={videoProgress} className="h-2" />
                  )}

                  {/* Preview do Script */}
                  {videoScript && (
                    <div className="space-y-4">
                      <h3 className="font-medium">Script Gerado</h3>
                      <div className="space-y-2">
                        {videoScript.scenes.map((scene: VideoScene, i: number) => (
                          <div key={i} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">Cena {i + 1}</Badge>
                              <span className="text-xs text-gray-500">{scene.duration}s</span>
                            </div>
                            <p className="text-sm">{scene.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Player do Vídeo Final */}
                  {finalVideoUrl && (
                    <div className="space-y-4">
                      <h3 className="font-medium">Vídeo Pronto!</h3>
                      <div className="relative aspect-[9/16] max-w-sm mx-auto rounded-lg overflow-hidden bg-black">
                        <video
                          ref={videoRef}
                          src={finalVideoUrl}
                          controls
                          className="w-full h-full"
                        />
                      </div>
                      <div className="flex justify-center">
                        <Button
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = finalVideoUrl;
                            a.download = `video-viral-${Date.now()}.webm`;
                            a.click();
                          }}
                          className="bg-gradient-to-r from-purple-600 to-pink-600"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Baixar Vídeo
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 4: GALERIA */}
          <TabsContent value="gallery" className="mt-0">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Suas Criações</h2>
                <Badge variant="outline">
                  {imageHistory.length} imagens
                </Badge>
              </div>

              {imageHistory.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold mb-2">Nenhuma criação ainda</h3>
                    <p className="text-gray-500 mb-4">Comece criando sua primeira imagem!</p>
                    <Button onClick={() => setActiveTab("create")}>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Criar Agora
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imageHistory.map((image: Doc<"generatedImages">) => (
                    <motion.div
                      key={image._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.05 }}
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

                          {/* Overlay com ações */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                            <p className="text-white text-xs mb-2 line-clamp-2">
                              {image.prompt}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                                onClick={() => toggleLikeImage(image._id)}
                              >
                                <Heart className={`w-4 h-4 ${likedImages.has(image._id) ? 'fill-current' : ''}`} />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                                onClick={() => handleDownload(image.imageUrl, image.prompt)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                                onClick={() => handleShare(image.imageUrl, image.prompt)}
                              >
                                <Share2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                                onClick={() => setSelectedImage(image.imageUrl)}
                              >
                                <Maximize2 className="w-4 h-4" />
                              </Button>
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
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 text-white"
                variant="ghost"
              >
                <X className="w-6 h-6" />
              </Button>

              <Image
                src={selectedImage}
                alt="Preview"
                width={1920}
                height={1080}
                className="w-full h-auto rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}