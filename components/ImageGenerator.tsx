"use client";

import { useState, useEffect } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Doc } from "../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

import { Badge } from "@/components/ui/badge";

import {
  Loader2,
  Sparkles,
  Wand2,
  Download,
  Share2,
  Heart,
  Maximize2,
  Zap,
  Palette,

  Copy,
  Check,
  Grid3x3,
  Image as ImageIcon,

  Settings2,
  ChevronRight,
  Star,

  Lightbulb,
  Brush,
  Camera,
  Shapes,

  X,
  Menu,
  BookOpen,
  User
} from "lucide-react";
import Image from "next/image";
import { Slider } from "@radix-ui/react-slider";

// Tipos de estilo predefinidos
const stylePresets = [
  { id: "realistic", name: "Realista", icon: Camera, gradient: "from-blue-500 to-cyan-500" },
  { id: "artistic", name: "Artístico", icon: Brush, gradient: "from-purple-500 to-pink-500" },
  { id: "3d", name: "3D Render", icon: Shapes, gradient: "from-orange-500 to-red-500" },
  { id: "anime", name: "Anime", icon: Star, gradient: "from-pink-500 to-rose-500" },
  { id: "minimal", name: "Minimalista", icon: Grid3x3, gradient: "from-gray-500 to-slate-500" },
  { id: "fantasy", name: "Fantasia", icon: Sparkles, gradient: "from-indigo-500 to-purple-500" }
];

// Templates de prompt
const promptTemplates = [
  { category: "Natureza", prompts: ["floresta mágica com luz dourada", "oceano cristalino ao pôr do sol", "montanhas nevadas sob aurora boreal"] },
  { category: "Futurista", prompts: ["cidade cyberpunk neon", "estação espacial orbital", "robô humanoide elegante"] },
  { category: "Fantasia", prompts: ["dragão de cristal", "castelo flutuante nas nuvens", "fênix renascendo das cinzas"] },
  { category: "Abstrato", prompts: ["explosão de cores líquidas", "geometria sagrada fractal", "ondas de energia quântica"] }
];

export function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("realistic");
  const [imageQuality, setImageQuality] = useState([80]);
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [latestImage, setLatestImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("create");

  const generate = useAction(api.imageGenerator.generateImage);
  const imageHistory = useQuery(api.imageGenerator.getImagesForUser) || [];

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animação de gradiente de fundo
  useEffect(() => {
    const interval = setInterval(() => {
      document.documentElement.style.setProperty('--gradient-rotation', `${Date.now() / 100}deg`);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setLatestImage(null);

    try {
      const fullPrompt = `${prompt}, ${selectedStyle} style, ${aspectRatio} aspect ratio, high quality`;
      const imageUrl = await generate({ prompt: fullPrompt });
      setLatestImage(imageUrl);
      setActiveTab("create");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Ocorreu um erro ao gerar a imagem.");
    } finally {
      setIsLoading(false);
    }
  };

  // Correção no método handleDownload
const handleDownload = async (imageUrl: string, prompt: string) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Agora usando o prompt para nomear o arquivo
    a.download = `ai-image-${prompt.slice(0, 20).replace(/[^\w\s]/gi, '')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao baixar imagem:', error);
  }
};

// Correção no método handleCopyPrompt
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

  const aspectRatios = [
    { value: "1:1", label: "Quadrado", icon: "□" },
    { value: "16:9", label: "Wide", icon: "▭" },
    { value: "9:16", label: "Portrait", icon: "▯" },
    { value: "4:3", label: "Clássico", icon: "▬" }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background animado */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 animate-gradient-shift" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 z-50">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => setActiveTab("create")}
            className={`flex flex-col items-center p-2 ${activeTab === "create" ? "text-purple-400" : "text-gray-400"}`}
          >
            <Wand2 className="w-5 h-5" />
            <span className="text-xs mt-1">Criar</span>
          </button>
          <button
            onClick={() => setActiveTab("gallery")}
            className={`flex flex-col items-center p-2 ${activeTab === "gallery" ? "text-purple-400" : "text-gray-400"}`}
          >
            <Grid3x3 className="w-5 h-5" />
            <span className="text-xs mt-1">Galeria</span>
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`flex flex-col items-center p-2 ${activeTab === "templates" ? "text-purple-400" : "text-gray-400"}`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-xs mt-1">Templates</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center p-2 text-gray-400"
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs mt-1">Menu</span>
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-gray-900/50 backdrop-blur-xl border-r border-gray-800 z-40">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold">AI Studio</h1>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("create")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "create" ? "bg-purple-500/20 text-purple-400" : "hover:bg-gray-800 text-gray-400"
              }`}
            >
              <Wand2 className="w-5 h-5" />
              <span>Criar Imagem</span>
            </button>
            <button
              onClick={() => setActiveTab("gallery")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "gallery" ? "bg-purple-500/20 text-purple-400" : "hover:bg-gray-800 text-gray-400"
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
              <span>Minha Galeria</span>
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "templates" ? "bg-purple-500/20 text-purple-400" : "hover:bg-gray-800 text-gray-400"
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>Templates</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 relative z-10">
        <div className="container mx-auto px-4 py-6 pb-24 lg:pb-6 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {activeTab === "create" && "Criar Nova Imagem"}
                  {activeTab === "gallery" && "Minha Galeria"}
                  {activeTab === "templates" && "Templates de Inspiração"}
                </h2>
                <p className="text-gray-400 mt-2">
                  {activeTab === "create" && "Transforme suas ideias em arte com IA"}
                  {activeTab === "gallery" && `${imageHistory.length} criações incríveis`}
                  {activeTab === "templates" && "Comece com ideias pré-definidas"}
                </p>
              </div>
              <div className="hidden lg:flex items-center gap-2">
                <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                  <Zap className="w-3 h-3 mr-1" />
                  AI Powered
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* Create Tab */}
          {activeTab === "create" && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left Column - Controls */}
              <div className="space-y-6">
                <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Prompt Input */}
                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-2 block">
                          Descreva sua imagem
                        </label>
                        <div className="relative">
                          <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                          <Input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ex: astronauta surfando em nebulosa colorida..."
                            disabled={isLoading}
                            className="pl-10 h-12 bg-gray-800/50 border-gray-700 focus:border-purple-500 text-white placeholder:text-gray-500"
                          />
                        </div>
                      </div>

                      {/* Style Selection */}
                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-3 block">
                          Estilo Visual
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {stylePresets.map((style) => {
                            const Icon = style.icon;
                            return (
                              <button
                                key={style.id}
                                type="button"
                                onClick={() => setSelectedStyle(style.id)}
                                className={`relative p-4 rounded-lg border-2 transition-all ${
                                  selectedStyle === style.id
                                    ? "border-purple-500 bg-purple-500/10"
                                    : "border-gray-700 hover:border-gray-600 bg-gray-800/30"
                                }`}
                              >
                                <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-10 rounded-lg`} />
                                <Icon className="w-6 h-6 mx-auto mb-2" />
                                                                <span className="text-xs font-medium">{style.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Aspect Ratio */}
                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-3 block">
                          Proporção
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {aspectRatios.map((ratio) => (
                            <button
                              key={ratio.value}
                              type="button"
                              onClick={() => setAspectRatio(ratio.value)}
                              className={`p-3 rounded-lg border-2 transition-all ${
                                aspectRatio === ratio.value
                                  ? "border-purple-500 bg-purple-500/10"
                                  : "border-gray-700 hover:border-gray-600 bg-gray-800/30"
                              }`}
                            >
                              <div className="text-2xl mb-1">{ratio.icon}</div>
                              <span className="text-xs">{ratio.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quality Slider */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-gray-300">
                            Qualidade
                          </label>
                          <span className="text-sm text-purple-400">{imageQuality[0]}%</span>
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
                        className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Criando sua obra-prima...
                          </>
                        ) : (
                          <>
                            <Wand2 className="mr-2 h-5 w-5" />
                            Gerar Imagem
                          </>
                        )}
                      </Button>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                        >
                          <p className="text-sm text-red-400">{error}</p>
                        </motion.div>
                      )}
                    </form>
                  </CardContent>
                </Card>

                {/* Quick Templates */}
                <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-400" />
                      Inspiração Rápida
                    </h3>
                    <div className="space-y-3">
                      {promptTemplates.slice(0, 2).map((template, idx) => (
                        <div key={idx}>
                          <p className="text-xs text-gray-500 mb-2">{template.category}</p>
                          <div className="flex flex-wrap gap-2">
                            {template.prompts.slice(0, 2).map((p, i) => (
                              <button
                                key={i}
                                onClick={() => setPrompt(p)}
                                className="text-xs px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded-full transition-colors"
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Preview */}
              <div>
                <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Visualização</h3>
                      {latestImage && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleLike(latestImage)}
                            className="text-gray-400 hover:text-pink-400"
                          >
                            <Heart className={`w-4 h-4 ${likedImages.has(latestImage) ? 'fill-pink-400 text-pink-400' : ''}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownload(latestImage, prompt)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedImage(latestImage)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <AspectRatio ratio={1} className="bg-gray-800/50 rounded-lg overflow-hidden">
                      {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl animate-pulse" />
                            <div className="relative bg-gray-900 rounded-full p-8">
                              <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
                            </div>
                          </div>
                          <p className="mt-4 text-gray-400 animate-pulse">Gerando arte incrível...</p>
                          <div className="mt-2 flex gap-1">
                            {[...Array(3)].map((_, i) => (
                              <div
                                key={i}
                                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.1}s` }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      {!isLoading && !latestImage && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                          <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                          <p>Sua criação aparecerá aqui</p>
                        </div>
                      )}
                      {latestImage && !isLoading && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
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

                    {latestImage && (
                      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Prompt usado:</p>
                        <p className="text-sm text-gray-300 line-clamp-2">{prompt}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === "gallery" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {imageHistory.length === 0 ? (
                <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
                  <CardContent className="py-16 text-center">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-xl font-semibold mb-2">Nenhuma imagem ainda</h3>
                    <p className="text-gray-400 mb-6">Comece criando sua primeira obra-prima!</p>
                    <Button
                      onClick={() => setActiveTab("create")}
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Criar Primeira Imagem
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {imageHistory.map((image: Doc<"generatedImages">, index) => (
                    <motion.div
                      key={image._id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg opacity-0 group-hover:opacity-50 blur transition-opacity duration-300" />
                      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                        <AspectRatio ratio={1}>
                          <Image
                            src={image.imageUrl}
                            alt={image.prompt}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <p className="text-xs text-white line-clamp-2 mb-2">{image.prompt}</p>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => toggleLike(image._id)}
                                  className="h-8 w-8 p-0 text-white hover:text-pink-400"
                                >
                                  <Heart className={`w-4 h-4 ${likedImages.has(image._id) ? 'fill-pink-400 text-pink-400' : ''}`} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDownload(image.imageUrl, image.prompt)}
                                  className="h-8 w-8 p-0 text-white hover:text-blue-400"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleCopyPrompt(image.prompt)}
                                  className="h-8 w-8 p-0 text-white hover:text-green-400"
                                >
                                  {copiedPrompt === image.prompt ? (
                                    <Check className="w-4 h-4" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setSelectedImage(image.imageUrl)}
                                  className="h-8 w-8 p-0 text-white hover:text-purple-400"
                                >
                                  <Maximize2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </AspectRatio>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Templates Tab */}
          {activeTab === "templates" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {promptTemplates.map((category, idx) => (
                <Card key={idx} className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-purple-400" />
                      {category.category}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {category.prompts.map((templatePrompt, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setPrompt(templatePrompt);
                            setActiveTab("create");
                          }}
                          className="p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500 transition-all text-left group"
                        >
                          <p className="text-sm text-gray-300 group-hover:text-white transition-colors">
                            {templatePrompt}
                          </p>
                          <div className="mt-2 flex items-center text-xs text-purple-400">
                            <span>Usar template</span>
                            <ChevronRight className="w-3 h-3 ml-1" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}
        </div>
            </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="absolute right-0 top-0 h-full w-80 bg-gray-900 border-l border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold">Menu</h2>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Estatísticas</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <p className="text-2xl font-bold text-purple-400">{imageHistory.length}</p>
                        <p className="text-xs text-gray-400">Imagens criadas</p>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <p className="text-2xl font-bold text-pink-400">{likedImages.size}</p>
                        <p className="text-xs text-gray-400">Favoritas</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Atalhos</h3>
                    <div className="space-y-2">
                      <button className="w-full flex items-center gap-3 px-3 py-2 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                        <Share2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">Compartilhar galeria</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                        <Settings2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">Configurações</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">Meu perfil</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-800">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">AI Studio Pro</p>
                        <p className="text-xs text-gray-400">Versão 2.0</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-purple-500/50 text-purple-400 text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      Powered by Advanced AI
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Viewer Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </Button>

              <div className="relative rounded-lg overflow-hidden">
                <Image
                  src={selectedImage}
                  alt="Visualização em tela cheia"
                  width={1920}
                  height={1920}
                  className="w-full h-auto"
                  quality={100}
                />
              </div>

              <div className="mt-4 flex justify-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(selectedImage, "imagem")}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar HD
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button for Mobile */}
      {activeTab !== "create" && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setActiveTab("create")}
          className="lg:hidden fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center z-40"
        >
          <Wand2 className="w-6 h-6 text-white" />
        </motion.button>
      )}

      <style jsx global>{`
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-10px) translateX(5px);
          }
          66% {
            transform: translateY(5px) translateX(-5px);
          }
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }

        /* Prevent body scroll on mobile when menu is open */
        body.menu-open {
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}