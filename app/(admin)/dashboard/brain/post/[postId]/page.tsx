// app/dashboard/brain/post/[postId]/page.tsx - VERSÃO MELHORADA
"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Download,
  Copy,
  Check,
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  Image as ImageIcon,
  Layers,
  MessageSquare,
  ExternalLink,
  Loader2,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.postId as Id<"scheduledPosts">;

  const [captionCopied, setCaptionCopied] = useState(false);
  const [hashtagsCopied, setHashtagsCopied] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const markAsCompleted = useMutation(api.posts.markAsCompleted);
  const post = useQuery(api.posts.getPost, { postId });
  const getFileUrl = useQuery(
    api.files.getFileUrl,
    post?.mediaStorageId ? { storageId: post.mediaStorageId } : "skip"
  );

  useEffect(() => {
    if (getFileUrl) {
      setMediaUrl(getFileUrl);
    }
  }, [getFileUrl]);

  // Loading State
  if (post === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-950 dark:to-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-600" />
          </motion.div>
          <p className="text-muted-foreground">Carregando seu post...</p>
        </motion.div>
      </div>
    );
  }

  // Not Found
  if (post === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-950 dark:to-black flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Post não encontrado</h2>
          <p className="text-muted-foreground mb-6">
            Este post pode ter sido excluído ou você não tem permissão para acessá-lo.
          </p>
          <Button onClick={() => router.push("/dashboard/brain")} className="bg-purple-600 hover:bg-purple-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o Brain
          </Button>
        </motion.div>
      </div>
    );
  }

  const contentTypeConfig = {
    reel: { icon: Video, label: "Reel", color: "from-blue-500 to-cyan-500" },
    carousel: { icon: Layers, label: "Carrossel", color: "from-purple-500 to-pink-500" },
    image_post: { icon: ImageIcon, label: "Post", color: "from-green-500 to-emerald-500" },
    story_sequence: { icon: MessageSquare, label: "Stories", color: "from-orange-500 to-yellow-500" },
  };

  const platformConfig = {
    instagram: { name: "Instagram", color: "from-purple-600 to-pink-600" },
    tiktok: { name: "TikTok", color: "from-black to-gray-800" },
    facebook: { name: "Facebook", color: "from-blue-600 to-blue-700" },
    linkedin: { name: "LinkedIn", color: "from-blue-700 to-blue-800" },
    twitter: { name: "Twitter/X", color: "from-gray-900 to-black" },
  };

  const config = contentTypeConfig[post.contentType];
  const platform = platformConfig[post.platform] || platformConfig.instagram;
  const Icon = config.icon;

  const totalSteps = post.mediaStorageId ? 4 : 3;

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(post.caption);
      setCaptionCopied(true);
      toast.success("✅ Legenda copiada!");
      setCurrentStep(Math.max(currentStep, post.mediaStorageId ? 3 : 2));
      setTimeout(() => setCaptionCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  const handleCopyHashtags = async () => {
    try {
      await navigator.clipboard.writeText(post.hashtags.join(" "));
      setHashtagsCopied(true);
      toast.success("✅ Hashtags copiadas!");
      setCurrentStep(Math.max(currentStep, post.mediaStorageId ? 4 : 3));
      setTimeout(() => setHashtagsCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  const handleDownloadMedia = async () => {
    if (!mediaUrl) {
      toast.error("Nenhuma mídia disponível");
      return;
    }

    setIsLoadingMedia(true);

    const isIOS =
      (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
      !(window as unknown as { MSStream: unknown }).MSStream;

    if (isIOS) {
      window.open(mediaUrl, '_blank');
      toast.success("📱 Aberto em nova aba! Pressione e segure para salvar.");
      setCurrentStep(Math.max(currentStep, 2));
      setIsLoadingMedia(false);
      return;
    }

    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const extension = post.contentType === "reel" ? "mp4" : "jpg";
      link.download = `freelinkbrain-${post.contentType}-${Date.now()}.${extension}`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("✅ Download iniciado!");
      setCurrentStep(Math.max(currentStep, 2));
    } catch (error) {
      console.error("Erro:", error);
      window.open(mediaUrl, '_blank');
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const handleMarkCompleted = async () => {
    try {
      await markAsCompleted({ postId });

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981'],
      });

      toast.success("🎉 Parabéns! Post marcado como concluído!");

      setTimeout(() => {
        router.push("/dashboard/brain");
      }, 2000);
    } catch {
      toast.error("Erro ao marcar como concluído");
    }
  };

  const openPlatform = () => {
    const urls: Record<string, string> = {
      instagram: "https://www.instagram.com/",
      tiktok: "https://www.tiktok.com/",
      facebook: "https://www.facebook.com/",
      linkedin: "https://www.linkedin.com/",
      twitter: "https://twitter.com/",
    };
    window.open(urls[post.platform] || urls.instagram, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-950 dark:to-black">
      <div className="container max-w-2xl mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/brain")}
            className="mb-4 hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Brain
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                🚀 Hora de Postar!
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Siga os passos abaixo para publicar
              </p>
            </div>

            <Badge className={cn("bg-gradient-to-r text-white self-start sm:self-auto py-1.5 px-3", config.color)}>
              <Icon className="w-4 h-4 mr-1.5" />
              {config.label}
            </Badge>
          </div>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso</span>
            <span className="text-sm text-muted-foreground">
              {currentStep - 1} de {totalSteps} passos
            </span>
          </div>
          <Progress value={((currentStep - 1) / totalSteps) * 100} className="h-2" />
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 sm:p-6 mb-6 shadow-xl border-2 overflow-hidden">
            {/* Agendamento Info */}
            <div className="flex flex-wrap gap-3 mb-6 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">
                  {new Date(post.scheduledDate).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">{post.scheduledTime}</span>
              </div>
              <Badge className={cn("bg-gradient-to-r text-white", platform.color)}>
                {platform.name}
              </Badge>
            </div>

            <div className="space-y-6">
              {/* PASSO 1: Download (se tiver mídia) */}
              {post.mediaStorageId && (
                <div className={cn(
                  "p-4 rounded-xl border-2 transition-all",
                  currentStep >= 1 ? "border-purple-300 bg-purple-50/50 dark:bg-purple-950/20" : "border-gray-200"
                )}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      currentStep > 1 ? "bg-green-500 text-white" : "bg-purple-600 text-white"
                    )}>
                      {currentStep > 1 ? <Check className="w-4 h-4" /> : "1"}
                    </div>
                    <h3 className="font-bold text-lg">Baixar Mídia</h3>
                  </div>

                  {mediaUrl && (
                    <div className="mb-4 max-w-xs mx-auto">
                      <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
                        {post.contentType === "reel" ? (
                          <video
                            src={mediaUrl}
                            controls
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={mediaUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleDownloadMedia}
                    disabled={isLoadingMedia || !mediaUrl}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    size="lg"
                  >
                    {isLoadingMedia ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Baixando...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Baixar {post.contentType === "reel" ? "Vídeo" : "Imagem"}
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* PASSO 2: Legenda */}
              <div className={cn(
                "p-4 rounded-xl border-2 transition-all",
                currentStep >= (post.mediaStorageId ? 2 : 1)
                  ? "border-purple-300 bg-purple-50/50 dark:bg-purple-950/20"
                  : "border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    currentStep > (post.mediaStorageId ? 2 : 1)
                      ? "bg-green-500 text-white"
                      : "bg-purple-600 text-white"
                  )}>
                    {currentStep > (post.mediaStorageId ? 2 : 1) ? <Check className="w-4 h-4" /> : post.mediaStorageId ? "2" : "1"}
                  </div>
                  <h3 className="font-bold text-lg">Copiar Legenda</h3>
                </div>

                <div className="relative">
                  <Textarea
                    value={post.caption}
                    readOnly
                    className="min-h-[120px] pr-12 font-mono text-sm resize-none bg-white dark:bg-gray-900"
                  />
                  <Button
                    size="icon"
                    variant={captionCopied ? "default" : "ghost"}
                    className={cn(
                      "absolute top-2 right-2 h-8 w-8",
                      captionCopied && "bg-green-500 hover:bg-green-600"
                    )}
                    onClick={handleCopyCaption}
                  >
                    {captionCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                <Button
                  onClick={handleCopyCaption}
                  variant="outline"
                  className="w-full mt-3 h-11"
                >
                  {captionCopied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Legenda Completa
                    </>
                  )}
                </Button>
              </div>

              {/* PASSO 3: Hashtags */}
              {post.hashtags.length > 0 && (
                <div className={cn(
                  "p-4 rounded-xl border-2 transition-all",
                  currentStep >= (post.mediaStorageId ? 3 : 2)
                    ? "border-purple-300 bg-purple-50/50 dark:bg-purple-950/20"
                    : "border-gray-200"
                )}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      currentStep > (post.mediaStorageId ? 3 : 2)
                        ? "bg-green-500 text-white"
                        : "bg-purple-600 text-white"
                    )}>
                      {currentStep > (post.mediaStorageId ? 3 : 2) ? <Check className="w-4 h-4" /> : post.mediaStorageId ? "3" : "2"}
                    </div>
                    <h3 className="font-bold text-lg">Copiar Hashtags</h3>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3 p-3 bg-white dark:bg-gray-900 rounded-lg">
                    {post.hashtags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    onClick={handleCopyHashtags}
                    variant="outline"
                    className="w-full h-11"
                  >
                    {hashtagsCopied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar {post.hashtags.length} Hashtags
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* PASSO 4: Abrir Plataforma */}
              <div className={cn(
                "p-4 rounded-xl border-2 transition-all",
                currentStep >= totalSteps
                  ? "border-purple-300 bg-purple-50/50 dark:bg-purple-950/20"
                  : "border-gray-200"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">
                    {totalSteps}
                  </div>
                  <h3 className="font-bold text-lg">Publicar no {platform.name}</h3>
                </div>

                <Button
                  onClick={openPlatform}
                  className={cn("w-full h-12 bg-gradient-to-r text-white", platform.color)}
                  size="lg"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Abrir {platform.name}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Card de Conclusão */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800 shadow-xl">
            <div className="text-center space-y-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl"
              >
                ✅
              </motion.div>
              <h3 className="font-bold text-xl">Já Postou?</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Marque como concluído para acompanhar seu progresso e manter seu calendário organizado!
              </p>
              <Button
                onClick={handleMarkCompleted}
                size="lg"
                className="w-full sm:w-auto h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Marcar como Concluído
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}