// app/dashboard/brain/post/[postId]/page.tsx - VERSÃO COMPLETA CORRIGIDA
"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Download,
  Copy,
  Check,
  Instagram,
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  Image as ImageIcon,
  Layers,
  MessageSquare,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import confetti from "canvas-confetti";

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.postId as Id<"scheduledPosts">;

  const [captionCopied, setCaptionCopied] = useState(false);
  const [hashtagsCopied, setHashtagsCopied] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  const post = useQuery(api.posts.getPost, { postId });
  const markAsCompleted = useMutation(api.posts.markAsCompleted);
  const getFileUrl = useQuery(api.files.getFileUrl,
    post?.mediaStorageId ? { storageId: post.mediaStorageId } : "skip"
  );

  // ✅ CARREGAR URL DA MÍDIA
  useEffect(() => {
    if (getFileUrl) {
      setMediaUrl(getFileUrl);
    }
  }, [getFileUrl]);

  if (!post) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-600" />
          <p className="text-muted-foreground">Carregando post...</p>
        </div>
      </div>
    );
  }

  const contentTypeIcons = {
    reel: Video,
    carousel: Layers,
    image_post: ImageIcon,
    story_sequence: MessageSquare,
  };

  const contentTypeNames = {
    reel: "Reel",
    carousel: "Carrossel",
    image_post: "Post",
    story_sequence: "Stories",
  };

  const platformNames = {
    instagram: "Instagram",
    tiktok: "TikTok",
    facebook: "Facebook",
    linkedin: "LinkedIn",
    twitter: "Twitter",
  };

  const Icon = contentTypeIcons[post.contentType];

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(post.caption);
      setCaptionCopied(true);
      toast.success("Legenda copiada!");
      setTimeout(() => setCaptionCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  const handleCopyHashtags = async () => {
    try {
      await navigator.clipboard.writeText(post.hashtags.join(" "));
      setHashtagsCopied(true);
      toast.success("Hashtags copiadas!");
      setTimeout(() => setHashtagsCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  // ✅ CORRIGIDO: Download funcional
  const handleDownloadMedia = async () => {
    if (!mediaUrl) {
      toast.error("Nenhuma mídia disponível para download");
      return;
    }

    setIsLoadingMedia(true);

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

      toast.success("Download iniciado! 📥");
    } catch (error) {
      console.error("Erro no download:", error);
      toast.error("Erro ao baixar arquivo. Tente novamente.");
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const handleMarkCompleted = async () => {
    try {
      await markAsCompleted({ postId });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#EC4899', '#F59E0B'],
      });

      toast.success("Post marcado como concluído! 🎉");

      setTimeout(() => {
        router.push("/dashboard/brain");
      }, 1500);
    } catch {
      toast.error("Erro ao marcar como concluído");
    }
  };

  const openInstagram = () => {
    window.open("https://www.instagram.com/", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-950 dark:to-black">
      <div className="container max-w-4xl mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/brain")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                🚀 Hora de Postar!
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Tudo pronto para você publicar em 30 segundos
              </p>
            </div>

            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white self-start sm:self-auto">
              <Icon className="w-3.5 h-3.5 mr-1.5" />
              {contentTypeNames[post.contentType]}
            </Badge>
          </div>
        </div>

        {/* Card Principal */}
        <Card className="p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg">
          <div className="space-y-4 sm:space-y-6">
            {/* Info do Agendamento */}
            <div className="flex flex-wrap gap-3 sm:gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="text-xs sm:text-sm">{new Date(post.scheduledDate).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="text-xs sm:text-sm">{post.scheduledTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-purple-600" />
                <span className="text-xs sm:text-sm">{platformNames[post.platform]}</span>
              </div>
            </div>

            {/* Preview da Mídia (se houver) */}
            {mediaUrl && (
              <div className="space-y-3">
                <h3 className="font-bold text-base sm:text-lg">📸 Preview da Mídia</h3>
                <div className="relative aspect-square max-w-sm mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
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

            {/* Passo 1: Baixar Vídeo/Imagem */}
            {post.mediaStorageId && (
              <div className="space-y-2">
                <h3 className="font-bold text-base sm:text-lg">1. Baixar Mídia</h3>
                <Button
                  onClick={handleDownloadMedia}
                  disabled={isLoadingMedia || !mediaUrl}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 h-11 sm:h-12"
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

            {/* Passo 2: Copiar Legenda */}
            <div className="space-y-2">
              <h3 className="font-bold text-base sm:text-lg">
                {post.mediaStorageId ? "2" : "1"}. Copiar Legenda
              </h3>
              <div className="relative">
                <Textarea
                  value={post.caption}
                  readOnly
                  className="min-h-[120px] sm:min-h-[150px] pr-12 font-mono text-xs sm:text-sm"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={handleCopyCaption}
                >
                  {captionCopied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Passo 3: Copiar Hashtags */}
            {post.hashtags.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-bold text-base sm:text-lg">
                  {post.mediaStorageId ? "3" : "2"}. Copiar Hashtags
                </h3>
                <div className="relative">
                  <Textarea
                    value={post.hashtags.join(" ")}
                    readOnly
                    className="h-16 sm:h-20 pr-12 font-mono text-xs sm:text-sm"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={handleCopyHashtags}
                  >
                    {hashtagsCopied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Passo 4: Abrir Instagram */}
            <div className="space-y-2">
              <h3 className="font-bold text-base sm:text-lg">
                {post.mediaStorageId ? "4" : "3"}. Abrir {platformNames[post.platform]}
              </h3>
              <Button
                onClick={openInstagram}
                className="w-full bg-gradient-to-r from-pink-600 to-orange-600 h-11 sm:h-12"
                size="lg"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Abrir {platformNames[post.platform]}
              </Button>
            </div>
          </div>
        </Card>

        {/* Card de Conclusão */}
        <Card className="p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-200 dark:border-green-800">
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="text-4xl sm:text-5xl">✅</div>
            <h3 className="font-bold text-lg sm:text-xl">Já Postou?</h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Marque este post como concluído para acompanhar seu progresso
            </p>
            <Button
              onClick={handleMarkCompleted}
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 h-11 sm:h-12"
            >
              <Check className="w-5 h-5 mr-2" />
              Marcar como Concluído
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}