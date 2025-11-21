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
// 🎨 TIPOS DE DADOS
// =================================================================
interface ImageType {
  _id: Id<"generatedImages"> | "temp";
  imageUrl: string;
  prompt: string;
  storageId?: Id<"_storage">; // Opcional para a imagem temporária
}

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

export default function ImageGeneratorTool() {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("realistic");
  const [activeTab, setActiveTab] = useState("create");

  // CORREÇÃO 1: Agora guardamos o objeto COMPLETO da imagem, não só a URL string
  // Isso permite acessar o _id e storageId dentro do Modal/Lightbox. Usando um tipo específico.
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);

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
      } catch  {
        console.log('Compartilhamento cancelado');
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  const handleDelete = async (imageId: Id<"generatedImages">, storageId: Id<"_storage">) => {
    if (!confirm("Excluir esta imagem permanentemente?")) return;
    try {
      await deleteImageMutation({ imageId, storageId });
      toast.success("Imagem removida.");
      // Se estivermos no modal, fecha ele após deletar
      if (selectedImage?._id === imageId) {
        setSelectedImage(null);
      }
    } catch {
      toast.error("Erro ao remover.");
    }
  };

  // Função wrapper para garantir que temos os IDs corretos antes de deletar
  const handleDeleteWrapper = () => {
    // Garante que a imagem selecionada não é a temporária e tem os IDs necessários
    if (selectedImage && selectedImage._id !== "temp" && selectedImage.storageId) {
      handleDelete(selectedImage._id, selectedImage.storageId);
    } else {
      toast.error("Não é possível deletar esta imagem.");
    }
  };

  return (
    // FUNDO CLARO (CLEAN SAAS STYLE)
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">

      {/* Background Decorativo Suave */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-100/50 rounded-full blur-[100px]" />
      </div>

      {/* CORREÇÃO 3: Navbar Clean
         Mudei z-50 para z-30. Isso deve resolver o conflito com o menu lateral (que geralmente é z-40 ou z-50).
      */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors p-2">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Voltar</span>
          </Link>

          <div className="flex items-center gap-3">
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 px-3 py-1 shadow-md">
              <Crown className="w-3 h-3 mr-1 fill-white" /> ULTRA
            </Badge>
            {usageStats && (
              <Badge variant="outline" className="border-slate-200 bg-white text-slate-600 px-3 py-1 shadow-sm">
                <Zap className="w-3 h-3 mr-1 text-yellow-500 fill-yellow-500" />
                {usageStats.remainingToday}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">

        {/* Hero Section */}
        <div className="text-center mb-10 space-y-3">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
            Gerador de <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Arte IA</span>
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto text-base md:text-lg">
            Crie imagens profissionais em segundos. Digite em português e nossa IA faz a mágica.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center sticky top-20 z-40">
            <TabsList className="bg-white border border-slate-200 p-1 rounded-full shadow-lg shadow-slate-200/50">
              <TabsTrigger
                value="create"
                className="rounded-full px-6 py-2.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-600 font-medium transition-all"
              >
                <Wand2 className="w-4 h-4 mr-2" /> Criar
              </TabsTrigger>
              <TabsTrigger
                value="gallery"
                className="rounded-full px-6 py-2.5 data-[state=active]:bg-slate-900 data-[state=active]:text-white text-slate-600 font-medium transition-all"
              >
                <Grid3x3 className="w-4 h-4 mr-2" /> Galeria
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="create" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid lg:grid-cols-12 gap-8">

              {/* Área de Input */}
              <div className="lg:col-span-7 space-y-6">
                <Card className="p-6 bg-white border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl">
                  <form onSubmit={handleGenerate} className="space-y-6">

                    {/* Campo de Texto */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-500" />
                          Sua ideia
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-auto p-1"
                          onClick={() => setPrompt(SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)])}
                        >
                          🎲 Ideia Aleatória
                        </Button>
                      </div>
                      <Textarea
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Um gato astronauta no espaço, estilo cyberpunk..."
                        className="min-h-[140px] bg-slate-50 border-slate-200 focus:border-purple-500 focus:ring-purple-500 text-slate-900 text-lg resize-none rounded-xl p-4 leading-relaxed shadow-inner placeholder:text-slate-400"
                      />
                    </div>

                    {/* Seleção de Estilo */}
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-700">Estilo Visual</label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {STYLES.map((style) => (
                          <button
                            key={style.id}
                            type="button"
                            onClick={() => setSelectedStyle(style.id)}
                            className={`p-2 py-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                              selectedStyle === style.id
                                ? `border-purple-600 bg-purple-50 shadow-inner`
                                : "border-slate-200 bg-white hover:border-purple-300 hover:shadow-md"
                            }`}
                          >
                            <span className="text-2xl">{style.emoji}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                              selectedStyle === style.id ? "text-purple-700" : "text-slate-500"
                            }`}>{style.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isGenerating || !prompt.trim()}
                      className="w-full h-14 text-lg font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Criando Mágica...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2 text-yellow-400 fill-yellow-400" />
                          Gerar Imagem
                        </>
                      )}
                    </Button>
                  </form>
                </Card>

                {/* Feedback do Prompt */}
                {enhancedPromptResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-purple-50 border border-purple-100 text-sm"
                  >
                    <p className="text-purple-700 font-bold mb-1 flex items-center gap-2 text-xs uppercase tracking-wide">
                      <Wand2 className="w-3 h-3" /> Prompt Melhorado pela IA
                    </p>
                    <p className="text-slate-600 italic leading-relaxed">{enhancedPromptResult}</p>
                  </motion.div>
                )}
              </div>

              {/* Preview Section */}
              <div className="lg:col-span-5">
                <Card className="bg-white border-slate-200 h-full min-h-[350px] lg:min-h-[500px] flex flex-col relative overflow-hidden group rounded-2xl shadow-2xl shadow-slate-200/50">
                  {latestImage ? (
                    <div className="relative flex-1 w-full h-full bg-slate-100">
                      <Image
                        src={latestImage}
                        alt="Generated Art"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                      {/* Botões de ação sobrepostos no Preview */}
                      {/* CORREÇÃO: Botões sempre visíveis no preview gerado para facilitar */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent flex justify-center gap-3">
                          <Button onClick={() => handleDownload(latestImage, `ai-${Date.now()}.png`)} className="bg-white text-slate-900 hover:bg-slate-100 rounded-full shadow-lg font-semibold">
                            <Download className="w-4 h-4 mr-2" /> Salvar
                          </Button>
                          {/* Para o preview da geração, passamos um objeto temporário simulado apenas com a URL para o modal funcionar se for clicado */}
                          <Button onClick={() => setSelectedImage({ imageUrl: latestImage, _id: "temp", prompt: "Nova imagem" })} className="bg-white/20 backdrop-blur-md border border-white/40 text-white hover:bg-white/30 rounded-full shadow-lg">
                            <Maximize2 className="w-4 h-4" />
                          </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50">
                      <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-6 border border-slate-200 shadow-sm">
                        {isGenerating ? (
                          <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                        ) : (
                          <ImageIcon className="w-10 h-10 text-slate-300" />
                        )}
                      </div>
                      <p className="text-lg font-medium text-slate-600">
                        {isGenerating ? "Pintando pixels..." : "Sua arte aparecerá aqui"}
                      </p>
                      {isGenerating && <p className="text-sm mt-2 animate-pulse text-purple-500">Aprimorando detalhes...</p>}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="animate-in fade-in duration-500">
            {currentImages.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700">Galeria Vazia</h3>
                <p className="text-slate-500 mb-6">Crie sua primeira obra de arte hoje.</p>
                <Button onClick={() => setActiveTab("create")} variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
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
                      className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 cursor-pointer border border-slate-200 shadow-md hover:shadow-xl transition-all"
                      // CORREÇÃO: Passamos o objeto img inteiro aqui
                      onClick={() => setSelectedImage(img)}
                    >
                      <Image
                        src={img.imageUrl}
                        alt={img.prompt}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />

                      {/* CORREÇÃO 2: Visibilidade dos botões em Mobile/Tablet
                          Antes: opacity-100 sm:opacity-0 (escondia em tablets que são > sm)
                          Agora: opacity-100 lg:opacity-0 (só esconde em DESKTOP/Laptop grande).
                          Em celulares e tablets, a barra preta ficará sempre visível.
                      */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent
                                    opacity-100 lg:opacity-0 lg:group-hover:opacity-100
                                    transition-opacity duration-300 p-3 flex flex-col justify-end">

                        <p className="text-xs text-white font-medium line-clamp-2 mb-3 drop-shadow-md">{img.prompt}</p>

                        <div className="flex gap-2 justify-between items-center">
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8 rounded-full bg-white/90 text-slate-900 shadow-lg hover:bg-white"
                              onClick={(e) => { e.stopPropagation(); handleDownload(img.imageUrl, 'image.png'); }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8 rounded-full bg-white/90 text-slate-900 shadow-lg hover:bg-red-50 hover:text-red-600"
                              onClick={(e) => { e.stopPropagation(); handleDelete(img._id, img.storageId); }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-full bg-white/90 text-slate-900 shadow-lg hover:bg-white hidden sm:flex"
                            onClick={(e) => { e.stopPropagation(); handleShare(img.imageUrl); }}
                          >
                            <Share2 className="w-4 h-4" />
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
                      className="border-slate-300 text-slate-700 hover:bg-slate-100"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center px-4 text-sm font-medium text-slate-600 bg-white rounded-md border border-slate-300 shadow-sm">
                      {currentPage} / {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className="border-slate-300 text-slate-700 hover:bg-slate-100"
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

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center bg-slate-900/50 rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >

              <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 z-[120] bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 backdrop-blur-sm border border-white/20 shadow-lg transition-all hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(null);
                  }}
                >
                  <X className="w-5 h-5" />
              </Button>

              {/* Imagem */}
              <div className="relative w-full h-full flex items-center justify-center bg-black/20">
                {/* CORREÇÃO: selectedImage agora é um objeto, então acessamos .imageUrl */}
                <img
                  src={selectedImage.imageUrl}
                  alt="Full view"
                  className="max-w-full max-h-[70vh] md:max-h-[75vh] object-contain"
                />
              </div>

              {/* Barra de Ações Inferior */}
              <div className="w-full p-4 md:p-6 bg-slate-900/80 backdrop-blur-md border-t border-white/10 flex flex-wrap justify-center gap-3 md:gap-4">
                <Button
                  onClick={() => handleDownload(selectedImage.imageUrl, `ai-art-${Date.now()}.png`)}
                  className="bg-white text-slate-900 hover:bg-slate-200 rounded-full px-6 h-12 text-base font-bold shadow-xl flex-1 sm:flex-none min-w-[140px]"
                >
                  <Download className="w-4 h-4 mr-2" /> Baixar
                </Button>

                <Button
                  onClick={() => handleShare(selectedImage.imageUrl)}
                  className="bg-white/10 border border-white/20 text-white hover:bg-white/20 rounded-full px-6 h-12 text-base font-bold shadow-xl flex-1 sm:flex-none min-w-[140px]"
                >
                  <Share2 className="w-4 h-4 mr-2" /> Compartilhar
                </Button>

                {/* CORREÇÃO 1B: Botão de Excluir no Lightbox agora FUNCIONA
                   Verifica se o selectedImage tem _id (pra não quebrar se for o preview temporário)
                */}
                {selectedImage._id !== "temp" && (
                  <Button
                    variant="destructive"
                    onClick={handleDeleteWrapper}
                    className="rounded-full px-4 h-12 shadow-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}