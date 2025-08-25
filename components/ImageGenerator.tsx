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

import {
  Loader2,
  Sparkles,
  Wand2,
  Download,
  Share2,
  Heart,
  Maximize2,
  Palette,
  Clock,
  Copy,
  Check,
  Grid3x3,
  Image as ImageIcon,
  ChevronRight,
  Lightbulb,
  Brush,
  Camera,
  Shapes,
  X,
  ArrowLeft,
  BookOpen,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Tipos de estilo predefinidos
const stylePresets = [
  { id: "realistic", name: "Realista", icon: Camera, gradient: "from-blue-400 to-cyan-400" },
  { id: "artistic", name: "Artístico", icon: Brush, gradient: "from-purple-400 to-pink-400" },
  { id: "3d", name: "3D Render", icon: Shapes, gradient: "from-orange-400 to-red-400" },
  { id: "anime", name: "Anime", icon: Star, gradient: "from-pink-400 to-rose-400" },
  { id: "minimal", name: "Minimalista", icon: Grid3x3, gradient: "from-gray-400 to-slate-400" },
  { id: "fantasy", name: "Fantasia", icon: Sparkles, gradient: "from-indigo-400 to-purple-400" }
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
  const [activeView, setActiveView] = useState("create");

  const generate = useAction(api.imageGenerator.generateImage);
  const imageHistory = useQuery(api.imageGenerator.getImagesForUser) || [];

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      a.download = `ai-image-${prompt.slice(0, 20).replace(/[^\w\s]/gi, '')}.png`;
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

  const aspectRatios = [
    { value: "1:1", label: "1:1", icon: "□" },
    { value: "16:9", label: "16:9", icon: "▭" },
    { value: "9:16", label: "9:16", icon: "▯" },
    { value: "4:3", label: "4:3", icon: "▬" }
  ];

  return (
    <div className="w-full bg-gradient-to-b from-slate-950 to-slate-900 text-white rounded-xl overflow-hidden border border-slate-800">
      {/* Header with navigation */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
        <Link href="/dashboard" className="flex items-center text-slate-300 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Voltar ao Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-slate-800/50 border-purple-500/20 text-purple-300">
            <Sparkles className="w-3 h-3 mr-1 text-purple-400" />
            AI Studio
          </Badge>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Tabs for navigation */}
        <Tabs
          defaultValue="create"
          value={activeView}
          onValueChange={setActiveView}
          className="w-full"
        >
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-3 mb-6">
            <TabsTrigger value="create" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
              <Wand2 className="w-4 h-4 mr-2" />
              Criar
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
              <Grid3x3 className="w-4 h-4 mr-2" />
              Galeria
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
              <BookOpen className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>

          {/* Create View */}
          <TabsContent value="create" className="mt-0">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Controls */}
              <div className="space-y-5">
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardContent className="p-5">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Prompt Input */}
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">
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
                            className="pl-10 h-12 bg-slate-800/50 border-slate-700 focus:border-purple-500 text-white placeholder:text-slate-500"
                          />
                        </div>
                      </div>

                      {/* Style Selection */}
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-3 block">
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
                                    ? "border-purple-500 bg-purple-500/10"
                                    : "border-slate-700 hover:border-slate-600 bg-slate-800/30"
                                }`}
                              >
                                <Icon className="w-5 h-5 mx-auto mb-1.5" />
                                <span className="text-xs font-medium">{style.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Aspect Ratio */}
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">
                          Proporção
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {aspectRatios.map((ratio) => (
                            <button
                              key={ratio.value}
                              type="button"
                              onClick={() => setAspectRatio(ratio.value)}
                              className={`p-2 rounded-lg border transition-all ${
                                aspectRatio === ratio.value
                                  ? "border-purple-500 bg-purple-500/10"
                                  : "border-slate-700 hover:border-slate-600 bg-slate-800/30"
                              }`}
                            >
                              <div className="text-lg mb-1">{ratio.icon}</div>
                              <span className="text-xs">{ratio.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quality Slider */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-slate-300">
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
                        className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Criando...
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
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardContent className="p-5">
                    <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      Inspiração Rápida
                    </h3>
                    <div className="space-y-3">
                      {promptTemplates.slice(0, 2).map((template, idx) => (
                        <div key={idx}>
                          <p className="text-xs text-slate-500 mb-1.5">{template.category}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {template.prompts.map((p, i) => (
                              <button
                                key={i}
                                onClick={() => setPrompt(p)}
                                className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors"
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
                <Card className="bg-slate-900/50 border-slate-800 h-full">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold">Visualização</h3>
                      {latestImage && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleLike(latestImage)}
                            className="text-slate-400 hover:text-pink-400"
                          >
                            <Heart className={`w-4 h-4 ${likedImages.has(latestImage) ? 'fill-pink-400 text-pink-400' : ''}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownload(latestImage, prompt)}
                            className="text-slate-400 hover:text-white"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedImage(latestImage)}
                            className="text-slate-400 hover:text-white"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <AspectRatio ratio={aspectRatio === "1:1" ? 1 : aspectRatio === "16:9" ? 16/9 : aspectRatio === "9:16" ? 9/16 : 4/3}
                      className="bg-slate-800/50 rounded-lg overflow-hidden">
                      {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full blur-lg opacity-40 animate-pulse" />
                            <div className="relative bg-slate-900 rounded-full p-6">
                              <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
                            </div>
                          </div>
                          <p className="mt-4 text-slate-400 animate-pulse">Gerando sua imagem...</p>
                        </div>
                      )}
                      {!isLoading && !latestImage && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                          <ImageIcon className="w-14 h-14 mb-3 opacity-20" />
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
                      <div className="mt-3 p-2.5 bg-slate-800/50 rounded-lg">
                        <p className="text-xs text-slate-400 mb-1">Prompt usado:</p>
                        <p className="text-sm text-slate-300 line-clamp-2">{prompt}</p>
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
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="py-12 text-center">
                  <ImageIcon className="w-14 h-14 mx-auto mb-4 text-slate-700" />
                  <h3 className="text-xl font-semibold mb-2">Nenhuma imagem ainda</h3>
                  <p className="text-slate-400 mb-5">Comece criando sua primeira obra-prima!</p>
                  <Button
                    onClick={() => setActiveView("create")}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Criar Primeira Imagem
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-purple-400" />
                    Suas Criações
                  </h3>
                  <p className="text-sm text-slate-400">{imageHistory.length} imagens</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {imageHistory.map((image: Doc<"generatedImages">, index) => (
                    <motion.div
                      key={image._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="group relative"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg opacity-0 group-hover:opacity-40 blur transition-opacity duration-300" />
                      <div className="relative bg-slate-900 rounded-lg overflow-hidden">
                        <AspectRatio ratio={1}>
                          <Image
                            src={image.imageUrl}
                            alt={image.prompt}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="absolute bottom-0 left-0 right-0 p-2.5">
                              <p className="text-xs text-white line-clamp-2 mb-1.5">{image.prompt}</p>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => toggleLike(image._id)}
                                  className="h-7 w-7 p-0 text-white hover:text-pink-400"
                                >
                                  <Heart className={`w-3.5 h-3.5 ${likedImages.has(image._id) ? 'fill-pink-400 text-pink-400' : ''}`} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDownload(image.imageUrl, image.prompt)}
                                  className="h-7 w-7 p-0 text-white hover:text-blue-400"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleCopyPrompt(image.prompt)}
                                  className="h-7 w-7 p-0 text-white hover:text-green-400"
                                >
                                  {copiedPrompt === image.prompt ? (
                                    <Check className="w-3.5 h-3.5" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setSelectedImage(image.imageUrl)}
                                  className="h-7 w-7 p-0 text-white hover:text-purple-400"
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
            <div className="space-y-5">
              {promptTemplates.map((category, idx) => (
                <Card key={idx} className="bg-slate-900/50 border-slate-800">
                  <CardContent className="p-5">
                    <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-purple-400" />
                      {category.category}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {category.prompts.map((templatePrompt, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setPrompt(templatePrompt);
                            setActiveView("create");
                          }}
                          className="p-3 bg-slate-800/70 hover:bg-slate-800 rounded-lg border border-slate-700 hover:border-purple-500/50 transition-all text-left group"
                        >
                          <p className="text-sm text-slate-300 group-hover:text-white transition-colors">
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
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-slate-300"
              >
                <X className="w-6 h-6" />
              </Button>

              <div className="relative rounded-lg overflow-hidden">
                <Image
                  src={selectedImage}
                  alt="Visualização em tela cheia"
                  width={1200}
                  height={1200}
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
    </div>
  );
}