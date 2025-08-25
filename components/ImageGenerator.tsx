"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Doc } from "../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  Loader2,
  Sparkles,
  Wand2,
  Download,
  Share2,
  Heart,
  Maximize2,
  Palette,
  Copy,
  Check,
  Grid3x3,
  Image as ImageIcon,
  ChevronRight,
  Star,
  Lightbulb,
  Brush,
  Camera,
  Shapes,
  X,
  ArrowLeft,
  BookOpen,
  User,
  ShoppingBag,
  Instagram,
  Facebook,
  Linkedin,
  TrendingUp,
  MessageSquare,
  Edit,
  Info
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Categorias de negócios
const businessCategories = [
  { id: "ecommerce", name: "E-commerce", icon: ShoppingBag },
  { id: "content", name: "Criador de Conteúdo", icon: Edit },
  { id: "social", name: "Redes Sociais", icon: Instagram },
  { id: "marketing", name: "Marketing", icon: TrendingUp },
  { id: "branding", name: "Branding", icon: Palette },
  { id: "product", name: "Produtos", icon: Star }
];

// Tipos de estilo predefinidos
const stylePresets = [
  { id: "realistic", name: "Realista", icon: Camera, gradient: "from-slate-400 to-slate-300" },
  { id: "artistic", name: "Artístico", icon: Brush, gradient: "from-slate-400 to-slate-300" },
  { id: "3d", name: "3D Render", icon: Shapes, gradient: "from-slate-400 to-slate-300" },
  { id: "minimal", name: "Minimalista", icon: Grid3x3, gradient: "from-slate-400 to-slate-300" },
  { id: "product", name: "Produto", icon: ShoppingBag, gradient: "from-slate-400 to-slate-300" },
  { id: "lifestyle", name: "Lifestyle", icon: User, gradient: "from-slate-400 to-slate-300" }
];

// Templates de prompt por categoria de negócio
const businessPrompts = {
  ecommerce: [
    "produto elegante em fundo minimalista branco",
    "modelo exibindo roupas em cenário urbano",
    "close em detalhes do produto com iluminação suave"
  ],
  content: [
    "pessoa criando conteúdo em setup moderno de home office",
    "laptop em mesa de café com notebook e canetas",
    "smartphone exibindo feed de rede social em ambiente aconchegante"
  ],
  social: [
    "composição instagramável com produto e elementos decorativos",
    "pessoa sorrindo segurando smartphone em café moderno",
    "flatlay de produtos em arranjo estético com iluminação natural"
  ],
  marketing: [
    "outdoor digital exibindo campanha em centro urbano",
    "pessoas reagindo positivamente a anúncio em tablet",
    "gráfico de crescimento com elementos visuais modernos"
  ],
  branding: [
    "logo aplicado em mockup realista de papelaria",
    "identidade visual em múltiplas aplicações",
    "elementos de marca em composição harmônica"
  ],
  product: [
    "produto em explosão 3D mostrando componentes",
    "conjunto de produtos da mesma linha em exposição elegante",
    "close detalhado em textura e acabamento do produto"
  ]
};

// Formatos para redes sociais
const socialFormats = [
  { id: "instagram_post", name: "Post Instagram", ratio: "1:1", size: "1080x1080" },
  { id: "instagram_story", name: "Story Instagram", ratio: "9:16", size: "1080x1920" },
  { id: "facebook_post", name: "Post Facebook", ratio: "16:9", size: "1200x630" },
  { id: "pinterest", name: "Pinterest", ratio: "2:3", size: "1000x1500" },
  { id: "linkedin", name: "LinkedIn", ratio: "16:9", size: "1200x627" },
  { id: "twitter", name: "Twitter", ratio: "16:9", size: "1200x675" }
];

export function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("realistic");
  const [selectedBusiness, setSelectedBusiness] = useState("ecommerce");
  const [selectedFormat, setSelectedFormat] = useState("instagram_post");
  const [imageQuality, setImageQuality] = useState([80]);
  const [latestImage, setLatestImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set());
  const [activeView, setActiveView] = useState("create");

  const generate = useAction(api.imageGenerator.generateImage);
  const imageHistory = useQuery(api.imageGenerator.getImagesForUser) || [];

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Definir aspect ratio com base no formato selecionado
  const getAspectRatio = () => {
    const format = socialFormats.find(f => f.id === selectedFormat);
    return format ? format.ratio : "1:1";
  };

  // Converter ratio string para número (para o componente AspectRatio)
  const getRatioValue = (ratioStr: string) => {
    if (ratioStr === "1:1") return 1;
    if (ratioStr === "16:9") return 16/9;
    if (ratioStr === "9:16") return 9/16;
    if (ratioStr === "2:3") return 2/3;
    return 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setLatestImage(null);

    try {
      const format = socialFormats.find(f => f.id === selectedFormat);
      const aspectRatio = format ? format.ratio : "1:1";

      const fullPrompt = `${prompt}, ${selectedStyle} style, ${aspectRatio} aspect ratio, professional quality, for ${selectedBusiness} business`;
      const imageUrl = await generate({ prompt: fullPrompt });
      setLatestImage(imageUrl);
      setActiveView("create");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Ocorreu um erro ao gerar a imagem.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `content-studio-${prompt.slice(0, 20).replace(/[^\w\s]/gi, '')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
    }
  };

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(prompt);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const toggleLike = (imageId: string) => {
    setLikedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  // Pegar prompts baseados na categoria de negócio selecionada
  const getBusinessPrompts = () => {
    return businessPrompts[selectedBusiness as keyof typeof businessPrompts] || [];
  };

  return (
    <div className="w-full bg-white text-gray-800 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Header with navigation */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
        <Link href="/dashboard" className="flex items-center text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Voltar ao Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-600">
            <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
            Content Studio
          </Badge>
        </div>
      </div>

      <div className="p-4 md:p-6 bg-gray-50">
        {/* Tabs for navigation */}
        <Tabs
          defaultValue="create"
          value={activeView}
          onValueChange={setActiveView}
          className="w-full"
        >
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-3 mb-6 bg-gray-100">
            <TabsTrigger value="create" className="data-[state=active]:bg-white data-[state=active]:text-gray-800">
              <Wand2 className="w-4 h-4 mr-2" />
              Criar
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-white data-[state=active]:text-gray-800">
              <Grid3x3 className="w-4 h-4 mr-2" />
              Galeria
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-white data-[state=active]:text-gray-800">
              <BookOpen className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>

          {/* Create View */}
          <TabsContent value="create" className="mt-0">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Controls */}
              <div className="space-y-5">
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-5">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Business Category Selection */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Seu tipo de negócio
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {businessCategories.map((category) => {
                            const Icon = category.icon;
                            return (
                              <button
                                key={category.id}
                                type="button"
                                onClick={() => setSelectedBusiness(category.id)}
                                className={`relative p-3 rounded-lg border transition-all ${
                                  selectedBusiness === category.id
                                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                    : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
                                }`}
                              >
                                <Icon className="w-5 h-5 mx-auto mb-1.5" />
                                <span className="text-xs font-medium">{category.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Format Selection */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block text-center">
                          <span>Formato para redes sociais</span>
                          <Badge variant="outline" className="font-normal text-xs bg-gray-50">
                            <Info className="w-3 h-3 mr-1" />
                            Dimensões otimizadas
                          </Badge>
                        </label>
                        <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                          <SelectTrigger className="bg-white border-gray-200">
                            <SelectValue placeholder="Selecione um formato" />
                          </SelectTrigger>
                          <SelectContent>
                            {socialFormats.map(format => (
                              <SelectItem key={format.id} value={format.id} className="text-sm">
                                <div className="flex items-center justify-between w-full">
                                  <span>{format.name}</span>
                                  <span className="text-xs text-gray-500">{format.size}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Prompt Input */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Descreva sua imagem
                        </label>
                        <div className="relative">
                          <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
                          <Input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Descreva o que você quer mostrar..."
                            disabled={isLoading}
                            className="pl-10 h-12 bg-white border-gray-200 focus:border-indigo-500 text-gray-800 placeholder:text-gray-400"
                          />
                        </div>
                      </div>

                      {/* Style Selection */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-3 block">
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
                                className={`relative p-3 rounded-lg border transition-all ${
                                  selectedStyle === style.id
                                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                    : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
                                }`}
                              >
                                <Icon className="w-5 h-5 mx-auto mb-1.5" />
                                <span className="text-xs font-medium">{style.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Quality Slider */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">
                            Qualidade da imagem
                          </label>
                          <span className="text-sm text-indigo-600 font-medium">{imageQuality[0]}%</span>
                        </div>
                        <Slider
                          value={imageQuality}
                          onValueChange={setImageQuality}
                          max={100}
                          min={50}
                          step={10}
                          className="w-full"
                        />
                      </div>

                      {/* Generate Button */}
                      <Button
                        type="submit"
                        disabled={isLoading || !prompt.trim()}
                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Gerando conteúdo...
                          </>
                        ) : (
                          <>
                            <Wand2 className="mr-2 h-5 w-5" />
                            Criar Imagem Profissional
                          </>
                        )}
                      </Button>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-3 bg-red-50 border border-red-100 rounded-lg"
                        >
                          <p className="text-sm text-red-600">{error}</p>
                        </motion.div>
                      )}
                    </form>
                  </CardContent>
                </Card>

                {/* Quick Templates */}
                <Card className="bg-white border-gray-200">
                  <CardContent className="p-5">
                    <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-gray-800">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      Ideias para {businessCategories.find(b => b.id === selectedBusiness)?.name || "seu negócio"}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1.5">
                        {getBusinessPrompts().map((p, i) => (
                          <button
                            key={i}
                            onClick={() => setPrompt(p)}
                            className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                          >
                            {p}
                          </button>
                        ))}
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center text-xs text-gray-500">
                          <div className="flex items-center gap-1 mr-3">
                            <Instagram className="w-3.5 h-3.5" />
                            <span>Instagram</span>
                          </div>
                          <div className="flex items-center gap-1 mr-3">
                            <Facebook className="w-3.5 h-3.5" />
                            <span>Facebook</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Linkedin className="w-3.5 h-3.5" />
                            <span>LinkedIn</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Preview */}
              <div>
                <Card className="bg-white border-gray-200 h-full">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-indigo-500" />
                        Prévia do conteúdo
                      </h3>
                      {latestImage && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleLike(latestImage)}
                            className="text-gray-500 hover:text-rose-500"
                          >
                            <Heart className={`w-4 h-4 ${likedImages.has(latestImage) ? 'fill-rose-500 text-rose-500' : ''}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownload(latestImage, prompt)}
                            className="text-gray-500 hover:text-indigo-600"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedImage(latestImage)}
                            className="text-gray-500 hover:text-indigo-600"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="relative rounded-lg border border-gray-200 p-1 bg-gray-50">
                      <AspectRatio
                        ratio={getRatioValue(getAspectRatio())}
                        className="bg-white rounded-md overflow-hidden"
                      >
                        {isLoading && (
                          <div className="flex flex-col items-center justify-center h-full">
                            <div className="relative">
                              <div className="relative bg-gray-100 rounded-full p-6">
                                <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                              </div>
                            </div>
                            <p className="mt-4 text-gray-500 animate-pulse">Gerando sua imagem profissional...</p>
                          </div>
                        )}
                        {!isLoading && !latestImage && (
                          <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <ImageIcon className="w-14 h-14 mb-3 opacity-30" />
                            <p className="text-sm">Sua imagem profissional aparecerá aqui</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Formato: {socialFormats.find(f => f.id === selectedFormat)?.name || "Padrão"}
                            </p>
                          </div>
                        )}
                        {latestImage && !isLoading && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative w-full h-full"
                          >
                            <Image
                              src={latestImage}
                              alt={prompt}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          </motion.div>
                        )}
                      </AspectRatio>
                    </div>

                    {latestImage && (
                      <div className="mt-4 space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Descrição da imagem:</p>
                          <p className="text-sm text-gray-700">{prompt}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className="text-xs font-normal bg-gray-50 text-gray-600">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Ideal para posts
                          </Badge>
                          <Badge variant="outline" className="text-xs font-normal bg-gray-50 text-gray-600">
                            {selectedBusiness === "ecommerce" ? (
                              <ShoppingBag className="w-3 h-3 mr-1" />
                            ) : selectedBusiness === "social" ? (
                              <Instagram className="w-3 h-3 mr-1" />
                            ) : (
                              <Palette className="w-3 h-3 mr-1" />
                            )}
                            {businessCategories.find(b => b.id === selectedBusiness)?.name}
                          </Badge>
                          <Badge variant="outline" className="text-xs font-normal bg-gray-50 text-gray-600">
                            <Instagram className="w-3 h-3 mr-1" />
                            {socialFormats.find(f => f.id === selectedFormat)?.name || "Padrão"}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Gallery View */}
          <TabsContent value="gallery" className="mt-0">
            {imageHistory.length === 0 ? (
              <Card className="bg-white border-gray-200">
                <CardContent className="py-12 text-center">
                  <ImageIcon className="w-14 h-14 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">Sua galeria está vazia</h3>
                  <p className="text-gray-500 mb-5">Comece criando imagens profissionais para seu negócio!</p>
                  <Button
                    onClick={() => setActiveView("create")}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Criar primeira imagem
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold flex items-center text-gray-800">
                    <Grid3x3 className="w-5 h-5 mr-2 text-indigo-500" />
                    Sua Biblioteca de Conteúdo
                  </h3>
                  <p className="text-sm text-gray-500">{imageHistory.length} imagens</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imageHistory.map((image: Doc<"generatedImages">, index) => (
                    <motion.div
                      key={image._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="group relative"
                    >
                      <div className="relative bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm transition-all duration-200 group-hover:shadow-md">
                        <AspectRatio ratio={1}>
                          <Image
                            src={image.imageUrl}
                            alt={image.prompt}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <p className="text-xs text-white line-clamp-2 mb-2">{image.prompt}</p>
                              <div className="flex gap-1.5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleLike(image._id)}
                                  className="h-7 w-7 p-0 text-white border-white/30 bg-black/20 backdrop-blur-sm hover:bg-black/30"
                                >
                                  <Heart className={`w-3.5 h-3.5 ${likedImages.has(image._id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDownload(image.imageUrl, image.prompt)}
                                  className="h-7 w-7 p-0 text-white border-white/30 bg-black/20 backdrop-blur-sm hover:bg-black/30"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCopyPrompt(image.prompt)}
                                  className="h-7 w-7 p-0 text-white border-white/30 bg-black/20 backdrop-blur-sm hover:bg-black/30"
                                >
                                  {copiedPrompt === image.prompt ? (
                                    <Check className="w-3.5 h-3.5" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedImage(image.imageUrl)}
                                  className="h-7 w-7 p-0 text-white border-white/30 bg-black/20 backdrop-blur-sm hover:bg-black/30"
                                >
                                  <Maximize2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </AspectRatio>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Templates View */}
          <TabsContent value="templates" className="mt-0">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Object.entries(businessPrompts).map(([businessId, prompts] ) => {
                const category = businessCategories.find(b => b.id === businessId);
                const Icon = category?.icon || Lightbulb;

                return (
                  <Card key={businessId} className="bg-white border-gray-200">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-indigo-600" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-800">
                          {category?.name || "Templates"}
                        </h3>
                      </div>

                      <div className="space-y-2">
                        {prompts.map((templatePrompt, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setPrompt(templatePrompt);
                              setSelectedBusiness(businessId);
                              setActiveView("create");
                            }}
                            className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-all text-left group"
                          >
                            <p className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                              {templatePrompt}
                            </p>
                            <div className="mt-1.5 flex items-center text-xs text-indigo-600">
                              <span>Usar template</span>
                              <ChevronRight className="w-3 h-3 ml-1" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Image Viewer Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-4xl w-full bg-white rounded-xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Visualização em alta resolução</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-4 bg-gray-50">
                <div className="relative rounded-lg overflow-hidden">
                  <Image
                    src={selectedImage}
                    alt="Visualização em alta resolução"
                    width={1200}
                    height={1200}
                    className="w-full h-auto"
                    quality={100}
                  />
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <Badge variant="outline" className="font-normal bg-gray-50 text-gray-700">
                    <Instagram className="w-3 h-3 mr-1" />
                    Pronto para redes sociais
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(selectedImage, "imagem-profissional")}
                    className="bg-white text-gray-700 border-gray-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar HD
                  </Button>
                  <Button
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}