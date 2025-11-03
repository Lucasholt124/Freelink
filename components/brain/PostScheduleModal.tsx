// components/brain/PostScheduleModal.tsx - MODAL DE AGENDAMENTO (CORRIGIDO E TIPADO)
"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Calendar,
  Clock,
  Upload,
  Image as ImageIcon,
  Video,
  Hash,
  Sparkles,
  AlertCircle,
  Check,
  Zap,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useBufferIntegration, useScheduledPosts } from "@/app/hooks/useBrain";
import { ContentData } from "@/app/types/brain";


// ============================================
// TIPOS
// ============================================

interface PostScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: Id<"brainCampaigns">;
  contentType: "reel" | "carousel" | "image_post" | "story_sequence";
  contentData: ContentData;
  initialCaption: string;
  initialHashtags: string[];
}

// ============================================
// MAPA DE PLATAFORMAS
// ============================================

const PLATFORM_CONFIG = {
  instagram: {
    icon: Instagram,
    name: "Instagram",
    color: "from-purple-600 to-pink-600",
    supports: ["reel", "carousel", "image_post", "story_sequence"],
  },
  facebook: {
    icon: Facebook,
    name: "Facebook",
    color: "from-blue-600 to-blue-700",
    supports: ["image_post", "carousel"],
  },
  linkedin: {
    icon: Linkedin,
    name: "LinkedIn",
    color: "from-blue-700 to-blue-800",
    supports: ["image_post"],
  },
  twitter: {
    icon: Twitter,
    name: "Twitter/X",
    color: "from-gray-900 to-black",
    supports: ["image_post"],
  },
} as const;

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function PostScheduleModal({
  isOpen,
  onClose,
  campaignId,
  contentType,
  contentData,
  initialCaption,
  initialHashtags,
}: PostScheduleModalProps) {
  const [caption, setCaption] = useState(initialCaption);
  const [hashtags, setHashtags] = useState<string[]>(initialHashtags);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [platform, setPlatform] = useState<keyof typeof PLATFORM_CONFIG>("instagram");
  const [autoPublish, setAutoPublish] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hashtagInput, setHashtagInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { createPost } = useScheduledPosts(campaignId);
  const { isConnected } = useBufferIntegration();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = contentType === "reel";
    const validTypes = isVideo
      ? ["video/mp4", "video/quicktime", "video/x-msvideo"]
      : ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (!validTypes.includes(file.type)) {
      toast.error(`Formato inválido. Use ${isVideo ? "vídeo" : "imagem"}.`);
      return;
    }

    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`Arquivo muito grande. Máximo: ${isVideo ? "50MB" : "10MB"}`);
      return;
    }

    setMediaFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddHashtag = () => {
    if (!hashtagInput.trim()) return;

    const newTag = hashtagInput.startsWith("#")
      ? hashtagInput.trim()
      : `#${hashtagInput.trim()}`;

    if (!hashtags.includes(newTag)) {
      setHashtags([...hashtags, newTag]);
    }
    setHashtagInput("");
  };

  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag));
  };

  const handleSchedule = async () => {
    if (!caption.trim()) {
      toast.error("Escreva uma legenda para o post");
      return;
    }
    if (!scheduledDate || !scheduledTime) {
      toast.error("Escolha data e horário");
      return;
    }
    if (autoPublish && !isConnected) {
      toast.error("Buffer não conectado. Configure em Configurações.");
      return;
    }

    setIsUploading(true);
    try {
      let mediaStorageId: Id<"_storage"> | undefined;
      let mediaUrl: string | undefined;

      if (mediaFile) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": mediaFile.type },
          body: mediaFile,
        });

        if (!result.ok) throw new Error("Erro ao fazer upload");

        const { storageId } = (await result.json()) as { storageId: Id<"_storage"> };
        mediaStorageId = storageId;
      }

      await createPost({
        campaignId,
        contentType,
        contentData: JSON.stringify(contentData),
        caption,
        hashtags,
        scheduledDate,
        scheduledTime,
        platform,
        autoPublish,
        mediaStorageId,
        mediaUrl,
      });

      toast.success(
        autoPublish
          ? "🎉 Post agendado para publicação automática!"
          : "📅 Post adicionado ao calendário!"
      );
      onClose();
    } catch (error) {
      console.error("Erro ao agendar:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao agendar post");
    } finally {
      setIsUploading(false);
    }
  };

  const supportedPlatforms = Object.entries(PLATFORM_CONFIG).filter(([, config]) =>
  (config.supports as readonly string[]).includes(contentType)
);

  const PlatformIcon = PLATFORM_CONFIG[platform].icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full max-h-[90vh]">
          {/* ========== COLUNA ESQUERDA: PREVIEW DO POST ========== */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black p-6 overflow-y-auto">
            <DialogHeader className="mb-4">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Preview do Post
              </DialogTitle>
              <DialogDescription>
                Veja como ficará na {PLATFORM_CONFIG[platform].name}
              </DialogDescription>
            </DialogHeader>

            <motion.div
              layout
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700"
            >
              <div className="p-4 flex items-center gap-3 border-b dark:border-gray-700">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <PlatformIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Seu Perfil</p>
                  <p className="text-xs text-muted-foreground">
                    {PLATFORM_CONFIG[platform].name}
                  </p>
                </div>
              </div>

              <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center relative overflow-hidden">
                {mediaPreview ? (
                  contentType === "reel" ? (
                    <video
                      src={mediaPreview}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : (
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="text-center p-8">
                    {contentType === "reel" ? (
                      <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    ) : (
                      <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    )}
                    <p className="text-sm text-muted-foreground mb-4">
                      {contentType === "reel" ? "Nenhum vídeo" : "Nenhuma imagem"}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Fazer Upload
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={
                        contentType === "reel"
                          ? "video/mp4,video/quicktime"
                          : "image/jpeg,image/png,image/webp"
                      }
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                )}
                {mediaPreview && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-4 right-4"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Trocar
                  </Button>
                )}
              </div>

              <div className="p-4">
                <div className="space-y-2">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {caption || (
                      <span className="text-muted-foreground italic">
                        Sua legenda aparecerá aqui...
                      </span>
                    )}
                  </p>
                  {hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {hashtags.map((tag) => (
                        <span key={tag} className="text-blue-600 text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ========== COLUNA DIREITA: FORMULÁRIO ========== */}
          <div className="p-6 overflow-y-auto">
            <DialogHeader className="mb-6">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Calendar className="w-5 h-5 text-blue-500" />
                Agendar Publicação
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <PlatformIcon className="w-4 h-4" />
                  Plataforma
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {supportedPlatforms.map(([key, config]) => {
                    const Icon = config.icon;
                    const isSelected = platform === key;
                    return (
                      <Button
                        key={key}
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "justify-start",
                          isSelected &&
                            `bg-gradient-to-r ${config.color} text-white border-0`
                        )}
                        onClick={() => setPlatform(key as keyof typeof PLATFORM_CONFIG)}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {config.name}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="caption">Legenda</Label>
                <Textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Escreva uma legenda incrível..."
                  className="min-h-[120px] resize-none"
                  maxLength={2200}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {caption.length}/2200 caracteres
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hashtag" className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Hashtags
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="hashtag"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddHashtag();
                      }
                    }}
                    placeholder="digite e pressione Enter"
                  />
                  <Button onClick={handleAddHashtag} size="icon">
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {hashtags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-white transition-colors"
                        onClick={() => handleRemoveHashtag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Horário
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border">
                  <Label
                    htmlFor="auto-publish"
                    className="flex-1 flex items-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <div className="flex-1">
                      <span className="font-semibold">Publicar Automaticamente</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        Post será publicado no horário agendado.
                      </p>
                    </div>
                  </Label>
                  <Switch
                    id="auto-publish"
                    checked={autoPublish}
                    onCheckedChange={setAutoPublish}
                  />
                </div>

                <AnimatePresence>
                  {autoPublish && !isConnected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                              Buffer não conectado
                            </p>
                            <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                              Configure o Buffer para ativar a publicação automática.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <DialogFooter className="mt-6 gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleSchedule}
                disabled={isUploading || !caption.trim() || !scheduledDate || !scheduledTime}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : autoPublish ? (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Agendar Publicação
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Adicionar ao Calendário
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}