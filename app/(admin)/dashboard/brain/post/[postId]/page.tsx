// app/dashboard/brain/post/[postId]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
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

  const markAsCompleted = useMutation(api.posts.markAsCompleted);

  // Buscar dados do post
  const post = useQuery(api.posts.getPost, { postId });

  if (!post) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Carregando...</p>
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
    } catch  {
      toast.error("Erro ao copiar");
    }
  };

  const handleCopyHashtags = async () => {
    try {
      await navigator.clipboard.writeText(post.hashtags.join(" "));
      setHashtagsCopied(true);
      toast.success("Hashtags copiadas!");
      setTimeout(() => setHashtagsCopied(false), 2000);
    } catch  {
      toast.error("Erro ao copiar");
    }
  };

  const handleDownloadMedia = () => {
    if (!post.mediaUrl) {
      toast.error("Nenhuma mídia disponível");
      return;
    }

    // Criar link de download
    const link = document.createElement('a');
    link.href = post.mediaUrl;
    link.download = `freelinkbrain-${post.contentType}-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Download iniciado!");
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
    } catch  {
      toast.error("Erro ao marcar como concluído");
    }
  };

  const openInstagram = () => {
    // Abrir Instagram no navegador/app
    window.open("https://www.instagram.com/", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-950 dark:to-black">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/brain")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                🚀 Hora de Postar!
              </h1>
              <p className="text-muted-foreground mt-1">
                Tudo pronto para você publicar em 30 segundos
              </p>
            </div>

            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <Icon className="w-3.5 h-3.5 mr-1.5" />
              {contentTypeNames[post.contentType]}
            </Badge>
          </div>
        </div>

        {/* Card Principal */}
        <Card className="p-6 mb-6 shadow-lg">
          <div className="space-y-6">
            {/* Info do Agendamento */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>{new Date(post.scheduledDate).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>{post.scheduledTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-purple-600" />
                <span>{platformNames[post.platform]}</span>
              </div>
            </div>

            {/* Passo 1: Baixar Vídeo/Imagem */}
            {post.mediaUrl && (
              <div className="space-y-2">
                <h3 className="font-bold text-lg">1. Baixar Mídia</h3>
                <Button
                  onClick={handleDownloadMedia}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 h-12"
                  size="lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Baixar {post.contentType === "reel" ? "Vídeo" : "Imagem"}
                </Button>
              </div>
            )}

            {/* Passo 2: Copiar Legenda */}
            <div className="space-y-2">
              <h3 className="font-bold text-lg">2. Copiar Legenda</h3>
              <div className="relative">
                <Textarea
                  value={post.caption}
                  readOnly
                  className="min-h-[150px] pr-12 font-mono text-sm"
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
                <h3 className="font-bold text-lg">3. Copiar Hashtags</h3>
                <div className="relative">
                  <Textarea
                    value={post.hashtags.join(" ")}
                    readOnly
                    className="h-20 pr-12 font-mono text-sm"
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
              <h3 className="font-bold text-lg">4. Abrir {platformNames[post.platform]}</h3>
              <Button
                onClick={openInstagram}
                className="w-full bg-gradient-to-r from-pink-600 to-orange-600 h-12"
                size="lg"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Abrir {platformNames[post.platform]}
              </Button>
            </div>
          </div>
        </Card>

        {/* Card de Conclusão */}
        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <div className="text-center space-y-4">
            <h3 className="font-bold text-lg">✅ Já Postou?</h3>
            <p className="text-sm text-muted-foreground">
              Marque este post como concluído para acompanhar seu progresso
            </p>
            <Button
              onClick={handleMarkCompleted}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600"
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