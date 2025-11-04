// components/brain/PostScheduleModal.tsx - VERSÃO COMPLETA CORRIGIDA
"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  Bell,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Loader2,
  TrendingUp,
  Eye,
  Edit,
  X,
  CheckCircle2,
  FileVideo,
  FileImage,
  MessageSquare,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useScheduledPosts, useNotificationIntegration } from "@/app/hooks/useBrain";
import { ContentData } from "@/app/types/brain";

interface PostScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: Id<"brainCampaigns">;
  contentType: "reel" | "carousel" | "image_post" | "story_sequence";
  contentData: ContentData;
  initialCaption: string;
  initialHashtags: string[];
}

const VIRAL_HASHTAGS = {
  general: ["#viral", "#fyp", "#trending", "#explore", "#foryou", "#foryoupage"],
  business: ["#empreendedorismo", "#marketing", "#sucesso", "#vendas", "#negócios", "#dinheiro"],
  lifestyle: ["#lifestyle", "#motivação", "#mindset", "#produtividade", "#crescimento", "#inspiração"],
  tech: ["#tecnologia", "#inovação", "#digital", "#startup", "#tech", "#futuro"],
};

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
  tiktok: {
    icon: Video,
    name: "TikTok",
    color: "from-black to-gray-900",
    supports: ["reel"],
  },
} as const;

const UploadFeedback = ({
  isUploading,
  uploadProgress,
  uploadSuccess,
}: {
  isUploading: boolean;
  uploadProgress: number;
  uploadSuccess: boolean;
}) => {
  return (
    <AnimatePresence>
      {(isUploading || uploadSuccess) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl max-w-xs w-full mx-4">
            {isUploading ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">Fazendo upload...</h4>
                    <p className="text-xs text-muted-foreground">
                      {uploadProgress}% concluído
                    </p>
                  </div>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-center space-y-3"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
                </motion.div>
                <h4 className="font-semibold text-lg">Upload concluído!</h4>
                <p className="text-sm text-muted-foreground">
                  Arquivo enviado com sucesso
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

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
  const [enableNotification, setEnableNotification] = useState(true);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaStorageId, setMediaStorageId] = useState<Id<"_storage"> | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [hashtagInput, setHashtagInput] = useState("");
  const [mobileTab, setMobileTab] = useState<"preview" | "config">("config");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { createPost } = useScheduledPosts(campaignId);
  const { isConnected } = useNotificationIntegration();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  // ✅ CORRIGIDO: Upload real de arquivo
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);

    try {
      // Preview local
      const reader = new FileReader();
      reader.onload = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload real para Convex
      setUploadProgress(25);
      const uploadUrl = await generateUploadUrl();

      setUploadProgress(50);
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) throw new Error("Erro ao fazer upload");

      const { storageId } = (await result.json()) as { storageId: Id<"_storage"> };
      setMediaStorageId(storageId);
      setMediaFile(file);

      setUploadProgress(100);
      setUploadSuccess(true);

      toast.success(isVideo ? "✅ Vídeo carregado!" : "✅ Imagem carregada!", { duration: 2000 });

      setTimeout(() => {
        setIsUploading(false);
        setUploadSuccess(false);
      }, 2000);
    } catch (error) {
      setIsUploading(false);
      console.error("Erro no upload:", error);
      toast.error("Erro ao fazer upload. Tente novamente.");
    }
  };

  const handleAddHashtag = (tag?: string) => {
    const newTag = tag || hashtagInput.trim();
    if (!newTag) return;

    const formattedTag = newTag.startsWith("#") ? newTag : `#${newTag}`;

    if (!hashtags.includes(formattedTag)) {
      setHashtags([...hashtags, formattedTag]);
      toast.success(`Hashtag ${formattedTag} adicionada!`, { duration: 1000 });
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
    if (enableNotification && !isConnected) {
      toast.error("Ative as notificações nas configurações para receber alertas");
      return;
    }

    const loadingToast = toast.loading("Salvando post...");

    try {
      await createPost({
        campaignId,
        contentType,
        contentData: JSON.stringify(contentData),
        caption,
        hashtags,
        scheduledDate,
        scheduledTime,
        platform,
        mediaStorageId: mediaStorageId ?? undefined, // ✅ CORRIGIDO: Converte null para undefined
      });

      toast.dismiss(loadingToast);
      toast.success(
        enableNotification && isConnected
          ? "🔔 Post agendado! Você receberá uma notificação na hora certa."
          : "📅 Post adicionado ao calendário!",
        { duration: 3000 }
      );

      onClose();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Erro ao agendar:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao agendar post");
    }
  };

  const supportedPlatforms = Object.entries(PLATFORM_CONFIG).filter(([, config]) =>
    (config.supports as readonly string[]).includes(contentType)
  );

  const PlatformIcon = PLATFORM_CONFIG[platform].icon;

  const PreviewSection = () => (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <div className="flex-shrink-0 p-4 sm:p-6 border-b dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <h3 className="flex items-center gap-2 text-lg sm:text-xl font-semibold">
          <Eye className="w-5 h-5 text-purple-500" />
          Preview do Post
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Veja como ficará nas redes sociais
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-md mx-auto space-y-4">
          <motion.div
            layout
            className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700"
          >
            <div className="p-3 sm:p-4 flex items-center gap-3 border-b dark:border-gray-700">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <PlatformIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm sm:text-base truncate">Seu Perfil</p>
                <p className="text-xs text-muted-foreground">
                  {PLATFORM_CONFIG[platform].name}
                </p>
              </div>
            </div>

            <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center relative overflow-hidden">
              <UploadFeedback
                isUploading={isUploading && !uploadSuccess}
                uploadProgress={uploadProgress}
                uploadSuccess={uploadSuccess}
              />

              {mediaPreview ? (
                contentType === "reel" ? (
                  <div className="relative w-full h-full group">
                    <video
                      src={mediaPreview}
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                    />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full p-2">
                      <FileVideo className="w-4 h-4 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full group">
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full p-2">
                      <FileImage className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center p-6 sm:p-8">
                  {contentType === "reel" ? (
                    <Video className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-gray-400" />
                  ) : (
                    <ImageIcon className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-gray-400" />
                  )}
                  <p className="text-sm text-muted-foreground mb-4">
                    {contentType === "reel" ? "Adicione um vídeo" : "Adicione uma imagem"}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Fazer Upload
                  </Button>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-5">
              <div className="space-y-3">
                <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
                  {caption || (
                    <span className="text-muted-foreground italic">
                      Sua legenda aparecerá aqui...
                    </span>
                  )}
                </p>

                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t">
                    {hashtags.map((tag) => (
                      <span key={tag} className="text-xs sm:text-sm text-blue-600 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t text-muted-foreground">
                <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <div className="w-5 h-5 rounded-full border-2 border-current" />
                  <span className="text-xs">Curtir</span>
                </button>
                <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-xs">Comentar</span>
                </button>
                <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span className="text-xs">Compartilhar</span>
                </button>
              </div>
            </div>
          </motion.div>

          {mediaFile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-green-800 dark:text-green-200 truncate">
                    {mediaFile.name}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {(mediaFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

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
  );

  const ConfigSection = () => (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 p-4 sm:p-6 border-b dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <h3 className="flex items-center gap-2 text-lg sm:text-xl font-semibold">
          <Edit className="w-5 h-5 text-blue-500" />
          Configurar Publicação
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Personalize seu conteúdo
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="space-y-5 sm:space-y-6">
          {/* Plataforma */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Plataforma</Label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {supportedPlatforms.map(([key, config]) => {
                const Icon = config.icon;
                const isSelected = platform === key;
                return (
                  <Button
                    key={key}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "justify-start text-xs sm:text-sm py-5 sm:py-6 transition-all",
                      isSelected && `bg-gradient-to-r ${config.color} text-white border-0 shadow-lg`
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

          {/* Legenda */}
          <div className="space-y-3">
            <Label htmlFor="caption" className="text-sm font-semibold">
              Legenda do Post
            </Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Escreva uma legenda incrível que vai engajar seu público..."
              className="min-h-[120px] sm:min-h-[150px] resize-none text-sm"
              maxLength={2200}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {caption.length}/2200 caracteres
              </p>
              {caption.length > 1900 && (
                <Badge variant="secondary" className="text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Próximo do limite
                </Badge>
              )}
            </div>
          </div>

          {/* Hashtags */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold">
              <Hash className="w-4 h-4" />
              Hashtags Estratégicas
            </Label>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-semibold text-purple-800 dark:text-purple-200">
                  Tags Virais Sugeridas
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {VIRAL_HASHTAGS.general.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer text-xs hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                    onClick={() => handleAddHashtag(tag)}
                  >
                    + {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddHashtag();
                  }
                }}
                placeholder="Digite uma hashtag e pressione Enter"
                className="text-sm"
              />
              <Button
                onClick={() => handleAddHashtag()}
                size="icon"
                disabled={!hashtagInput.trim()}
              >
                <Check className="w-4 h-4" />
              </Button>
            </div>

            {hashtags.length > 0 && (
              <div className="p-3 bg-muted/50 rounded-lg border">
                <p className="text-xs font-semibold mb-2">
                  {hashtags.length} hashtag{hashtags.length > 1 ? "s" : ""} adicionada{hashtags.length > 1 ? "s" : ""}
                </p>
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer text-xs hover:bg-destructive hover:text-white transition-colors px-3 py-1"
                      onClick={() => handleRemoveHashtag(tag)}
                    >
                      {tag} <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Data e Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2 text-sm font-semibold">
                <Calendar className="w-4 h-4" />
                Data
              </Label>
              <Input
                id="date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2 text-sm font-semibold">
                <Clock className="w-4 h-4" />
                Horário
              </Label>
              <Input
                id="time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          <Separator />

          {/* Notificação */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-start justify-between gap-3">
              <Label htmlFor="enable-notification" className="flex items-start gap-3 cursor-pointer flex-1">
                <Bell className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-sm font-semibold block mb-1">
                    Receber Notificação
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Receba um alerta no horário agendado para postar seu conteúdo
                  </p>
                </div>
              </Label>
              <Switch
                id="enable-notification"
                checked={enableNotification}
                onCheckedChange={setEnableNotification}
                className="flex-shrink-0"
              />
            </div>
          </div>

          {enableNotification && !isConnected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                    Notificações desativadas
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Ative as notificações nas configurações (⚙️) para receber alertas
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="h-20" />
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "p-0 gap-0 overflow-hidden flex flex-col",
          "w-full h-[100dvh] max-h-[100dvh]",
          "sm:h-[90vh] sm:max-h-[90vh]",
          "md:w-[95vw] md:max-w-[1400px]"
        )}
      >
        <DialogHeader className="px-4 sm:px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-3 text-xl sm:text-2xl">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <span className="block">Agendar Publicação</span>
              <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                {contentType === "reel"
                  ? "Vídeo Curto"
                  : contentType === "carousel"
                  ? "Carrossel"
                  : contentType === "story_sequence"
                  ? "Sequência de Stories"
                  : "Imagem"}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Mobile Tabs */}
        <div className="md:hidden">
          <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as "preview" | "config")}>
            <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
              <TabsTrigger value="config" className="gap-2">
                <Edit className="w-4 h-4" />
                Configurar
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="config" className="h-[calc(100dvh-200px)] mt-0">
              <ConfigSection />
            </TabsContent>
            <TabsContent value="preview" className="h-[calc(100dvh-200px)] mt-0">
              <PreviewSection />
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-2 flex-1 overflow-hidden">
          <div className="border-r overflow-y-auto">
            <ConfigSection />
          </div>
          <div className="overflow-y-auto">
            <PreviewSection />
          </div>
        </div>

        <DialogFooter className="px-4 sm:px-6 py-4 border-t bg-muted/30 flex-row gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUploading}
            className="flex-1 sm:flex-none"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={isUploading || !caption.trim() || !scheduledDate || !scheduledTime}
            className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Agendar Post
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}