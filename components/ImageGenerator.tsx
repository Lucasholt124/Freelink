"use client";

import { useState, useRef } from "react";
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
  Loader2, Sparkles, Wand2, Download, Share2, Maximize2,
  Grid3x3, ImageIcon, X, ArrowLeft,
  Zap, Crown, Trash2, Lightbulb,
  ChevronRight, ChevronLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// =================================================================
// 🎨 DADOS VISUAIS
// =================================================================
const STYLES = [
  { id: "realistic", name: "Realista", emoji: "📸", gradient: "from-blue-500 to-cyan-500" },
  { id: "artistic", name: "Artístico", emoji: "🎨", gradient: "from-purple-500 to-pink-500" },
  { id: "3d", name: "3D Render", emoji: "🎮", gradient: "from-orange-500 to-red-500" },
  { id: "anime", name: "Anime", emoji: "🌸", gradient: "from-pink-500 to-rose-500" },
  { id: "minimal", name: "Minimalista", emoji: "⚪", gradient: "from-gray-500 to-slate-500" },
  { id: "vintage", name: "Vintage", emoji: "📷", gradient: "from-amber-500 to-orange-500" }
];

const SUGGESTIONS = [
  "Cidade futurista com carros voadores ao pôr do sol, neon",
  "Leão majestoso feito de fogo e fumaça, fundo escuro",
  "Design de tênis esportivo moderno, render 3D, cores vivas",
  "Astronauta meditando em um jardim zen em Marte"
];

const IMAGES_PER_PAGE = 12;

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("realistic");
  const [activeTab, setActiveTab] = useState("create");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [latestImage, setLatestImage] = useState<string | null>(null);
  const [enhancedPromptResult, setEnhancedPromptResult] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const generate = useAction(api.imageGenerator.generateImage);
  const deleteImageMutation = useMutation(api.imageGenerator.deleteImage);
  const imageHistory = useQuery(api.imageGenerator.getImagesForUser) ?? [];
  const usageStats = useQuery(api.imageGenerator.getUsageStats);

  // Paginação
  const totalPages = Math.ceil(imageHistory.length / IMAGES_PER_PAGE);
  const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
  const currentImages = imageHistory.slice(startIndex, startIndex + IMAGES_PER_PAGE);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("✍️ Escreva algo para criar!");
      textareaRef.current?.focus();
      return;
    }

    setIsGenerating(true);
    setEnhancedPromptResult("");

    try {
      const result = await generate({
        prompt: prompt,
        styleId: selectedStyle
      });

      if (result?.url) {
        setLatestImage(result.url);
        setEnhancedPromptResult(result.enhancedPrompt || "");
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        toast.success("🎉 Imagem criada!");
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Erro ao gerar");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Salvo na galeria!");
    } catch {
      toast.error("Erro no download. Tente segurar na imagem.");
    }
  };

  const handleShare = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Minha Arte IA', url });
      } catch {
        console.log('Compartilhamento cancelado');
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  const handleDelete = async (imageId: Id<"generatedImages">, storageId: Id<"_storage">) => {
    if (!confirm("Excluir esta imagem?")) return;
    try {
      await deleteImageMutation({ imageId, storageId });
      toast.success("Imagem removida.");
    } catch {
      toast.error("Erro ao remover.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500/30 pb-20">
      {/* Efeitos de Fundo (Ambient Light) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-900/10 to-transparent" />
      </div>

      {/* Navbar */}
      <div className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors p-2">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Voltar</span>
          </Link>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-300 px-3 py-1">
              <Crown className="w-3 h-3 mr-1" /> PRO
            </Badge>
            {usageStats && (
              <Badge variant="outline" className="border-white/10 bg-white/5 px-3 py-1">
                <Zap className="w-3 h-3 mr-1 text-yellow-400" />
                {usageStats.remainingToday}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10 relative z-10">
        {/* Hero Mobile-Friendly */}
        <div className="text-center mb-8 space-y-3">
          <h1 className="text-3xl md:text-6xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Gerador de Arte IA
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto text-sm md:text-base">
            Escreva em português. Nossa IA melhora seu prompt e cria imagens de cinema.
          </p>
        </div>

        {/* Tabs de Navegação */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-center sticky top-20 z-40">
            <TabsList className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-1 rounded-full shadow-xl">
              <TabsTrigger value="create" className="rounded-full px-6 py-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-sm transition-all">
                <Wand2 className="w-4 h-4 mr-2" /> Criar
              </TabsTrigger>
              <TabsTrigger value="gallery" className="rounded-full px-6 py-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-sm transition-all">
                <Grid3x3 className="w-4 h-4 mr-2" /> Galeria
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="create" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid lg:grid-cols-12 gap-8">

              {/* Área de Criação */}
              <div className="lg:col-span-7 space-y-6">
                <Card className="p-5 sm:p-6 bg-white/5 border-white/10 backdrop-blur-sm shadow-2xl rounded-2xl">
                  <form onSubmit={handleGenerate} className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-400" />
                          Sua ideia
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs text-purple-400 hover:text-purple-300 h-auto p-0 hover:bg-transparent"
                          onClick={() => setPrompt(SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)])}
                        >
                          🎲 Surpreenda-me
                        </Button>
                      </div>
                      <Textarea
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Um gato astronauta no espaço, estilo cyberpunk..."
                        className="min-h-[120px] bg-black/20 border-white/10 focus:border-purple-500 text-base md:text-lg resize-none rounded-xl p-4 leading-relaxed"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-200">Estilo Visual</label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {STYLES.map((style) => (
                          <button
                            key={style.id}
                            type="button"
                            onClick={() => setSelectedStyle(style.id)}
                            className={`p-2 py-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                              selectedStyle === style.id
                                ? `border-purple-500 bg-gradient-to-br ${style.gradient} bg-opacity-20 shadow-lg shadow-purple-900/20`
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                            }`}
                          >
                            <span className="text-xl md:text-2xl">{style.emoji}</span>
                            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-300">{style.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isGenerating || !prompt.trim()}
                      className="w-full h-14 text-base md:text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-900/30 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Criando Mágica...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Gerar Imagem
                        </>
                      )}
                    </Button>
                  </form>
                </Card>

                {/* Prompt Otimizado (Feedback) */}
                {enhancedPromptResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm"
                  >
                    <p className="text-purple-300 font-semibold mb-1 flex items-center gap-2 text-xs uppercase tracking-wide">
                      <Wand2 className="w-3 h-3" /> Prompt Melhorado pela IA
                    </p>
                    <p className="text-gray-300 italic leading-relaxed">{enhancedPromptResult}</p>
                  </motion.div>
                )}
              </div>

              {/* Preview Section */}
              <div className="lg:col-span-5">
                <Card className="bg-white/5 border-white/10 h-full min-h-[350px] lg:min-h-[500px] flex flex-col relative overflow-hidden group rounded-2xl shadow-2xl">
                  {latestImage ? (
                    <div className="relative flex-1 w-full h-full bg-black/40">
                      <Image
                        src={latestImage}
                        alt="Generated Art"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                         <div className="flex gap-3 justify-center">
                            <Button onClick={() => handleDownload(latestImage, `ai-${Date.now()}.png`)} className="bg-white text-black hover:bg-gray-200 rounded-full">
                              <Download className="w-4 h-4 mr-2" /> Salvar
                            </Button>
                            <Button onClick={() => setSelectedImage(latestImage)} variant="secondary" className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30 rounded-full">
                              <Maximize2 className="w-4 h-4" />
                            </Button>
                         </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center bg-grid-white/[0.02]">
                      <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                        {isGenerating ? (
                          <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
                        ) : (
                          <ImageIcon className="w-10 h-10 opacity-40" />
                        )}
                      </div>
                      <p className="text-lg font-medium text-gray-400">
                        {isGenerating ? "Pintando pixels..." : "Sua arte aparecerá aqui"}
                      </p>
                      {isGenerating && <p className="text-sm mt-2 animate-pulse text-purple-400">Aprimorando detalhes...</p>}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="animate-in fade-in duration-500">
            {currentImages.length === 0 ? (
              <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-300">Galeria Vazia</h3>
                <p className="text-gray-500 mb-6">Crie sua primeira obra de arte hoje.</p>
                <Button onClick={() => setActiveTab("create")} variant="outline" className="border-white/10 hover:bg-white/10">
                  Criar Agora
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                  {currentImages.map((img) => (
                    <motion.div
                      key={img._id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-white/5 cursor-pointer border border-white/5 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/20"
                      onClick={() => setSelectedImage(img.imageUrl)}
                    >
                      <Image
                        src={img.imageUrl}
                        alt={img.prompt}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-end">
                        <p className="text-xs text-white/90 line-clamp-2 mb-3 font-medium">{img.prompt}</p>
                        <div className="flex gap-2 justify-between">
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white"
                              onClick={(e) => { e.stopPropagation(); handleDownload(img.imageUrl, 'image.png'); }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8 rounded-full bg-red-500/20 backdrop-blur-md hover:bg-red-500/40 text-white"
                              onClick={(e) => { e.stopPropagation(); handleDelete(img._id, img.storageId); }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className="border-white/10 bg-white/5 hover:bg-white/10"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center px-4 text-sm font-medium text-gray-400 bg-white/5 rounded-md border border-white/10">
                      {currentPage} / {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className="border-white/10 bg-white/5 hover:bg-white/10"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Lightbox Modal (Full Screen View) */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-10"
            onClick={() => setSelectedImage(null)}
          >
            <div className="absolute top-4 right-4 z-[110]">
               <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-white w-12 h-12">
                 <X className="w-8 h-8" />
               </Button>
            </div>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="relative max-w-5xl w-full max-h-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Full view"
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl border border-white/10"
              />

              <div className="flex gap-4 mt-6">
                <Button onClick={() => handleDownload(selectedImage, `ai-art-${Date.now()}.png`)} className="bg-white text-black hover:bg-gray-200 rounded-full px-8 h-12 font-bold shadow-xl">
                  <Download className="w-5 h-5 mr-2" /> Baixar em 4K
                </Button>
                <Button onClick={() => handleShare(selectedImage)} variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-8 h-12">
                  <Share2 className="w-5 h-5 mr-2" /> Compartilhar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}