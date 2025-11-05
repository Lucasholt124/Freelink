// components/brain/PostScheduleModal.tsx - COM NOTIFICAÇÕES RESTAURADAS
"use client";

import { useState, useRef } from "react";
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
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Clock,
  Upload,
  Image as ImageIcon,
  Video,
  Hash,
  Sparkles,
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
  AlertCircle,
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

function UploadFeedback({
  isUploading,
  uploadProgress,
  uploadSuccess,
}: {
  isUploading: boolean;
  uploadProgress: number;
  uploadSuccess: boolean;
}) {
  if (!isUploading && !uploadSuccess) return null;

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
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
          <div className="text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
            <h4 className="font-semibold text-lg">Upload concluído!</h4>
            <p className="text-sm text-muted-foreground">
              Arquivo enviado com sucesso
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

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
  const { isConnected } = useNotificationIntegration(); // ✅ RESTAURADO
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

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
      const reader = new FileReader();
      reader.onload = () => setMediaPreview(reader.result as string);
      reader.readAsDataURL(file);

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
      toast.success(isVideo ? "✅ Vídeo carregado!" : "✅ Imagem carregada!");

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
    if (hashtags.includes(formattedTag)) return;

    setHashtags([...hashtags, formattedTag]);
    setHashtagInput("");
    toast.success(`${formattedTag} adicionada!`);
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

    // ✅ VALIDAÇÃO DE NOTIFICAÇÃO RESTAURADA
    if (enableNotification && !isConnected) {
      toast.error("⚠️ Ative as notificações nas configurações para receber alertas!");
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
        mediaStorageId: mediaStorageId ?? undefined,
      });

      toast.dismiss(loadingToast);

      // ✅ MENSAGEM DIFERENCIADA RESTAURADA
      toast.success(
        enableNotification && isConnected
          ? "🔔 Post agendado! Você receberá uma notificação na hora certa."
          : "📅 Post adicionado ao calendário!",
        { duration: 3000 }
      );

      onClose();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error instanceof Error ? error.message : "Erro ao agendar post");
    }
  };

  const supportedPlatforms = Object.entries(PLATFORM_CONFIG).filter(([, config]) =>
    (config.supports as readonly string[]).includes(contentType)
  );

  const PlatformIcon = PLATFORM_CONFIG[platform].icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 gap-0 w-full h-[100dvh] max-h-[100dvh] sm:h-[90vh] sm:max-h-[90vh] md:w-[95vw] md:max-w-[1400px] flex flex-col">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-xl sm:text-2xl">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <span className="block">Agendar Publicação</span>
              <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                {contentType === "reel" ? "Vídeo Curto" : contentType === "carousel" ? "Carrossel" : contentType === "story_sequence" ? "Sequência de Stories" : "Imagem"}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* MOBILE */}
        <div className="md:hidden flex-1 overflow-hidden flex flex-col">
          <div className="w-full grid grid-cols-2 border-b flex-shrink-0">
            <button
              type="button"
              onClick={() => setMobileTab("config")}
              className={cn(
                "py-3 text-sm font-medium transition-colors border-b-2",
                mobileTab === "config"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              )}
            >
              <Edit className="w-4 h-4 inline mr-2" />
              Configurar
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("preview")}
              className={cn(
                "py-3 text-sm font-medium transition-colors border-b-2",
                mobileTab === "preview"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              )}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              Preview
            </button>
          </div>

          {mobileTab === "config" && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-5">
                {/* Plataforma */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Plataforma</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {supportedPlatforms.map(([key, config]) => {
                      const Icon = config.icon;
                      const isSelected = platform === key;
                      return (
                        <Button
                          key={key}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className={cn(
                            "justify-start text-xs py-5 transition-all",
                            isSelected && `bg-gradient-to-r ${config.color} text-white border-0`
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
                  <Label htmlFor="caption-input" className="text-sm font-semibold">
                    Legenda do Post
                  </Label>
                  <Textarea
                    id="caption-input"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Escreva uma legenda incrível..."
                    className="min-h-[120px] resize-none text-sm"
                    maxLength={2200}
                  />
                  <p className="text-xs text-muted-foreground">
                    {caption.length}/2200 caracteres
                  </p>
                </div>

                {/* Hashtags */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Hashtags
                  </Label>

                  <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border">
                    <p className="text-xs font-semibold mb-2 text-purple-800 dark:text-purple-200">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      Sugestões Virais
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {VIRAL_HASHTAGS.general.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="cursor-pointer text-xs"
                          onClick={() => handleAddHashtag(tag)}
                        >
                          + {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      id="hashtag-input"
                      value={hashtagInput}
                      onChange={(e) => setHashtagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddHashtag();
                        }
                      }}
                      placeholder="Digite uma hashtag"
                      className="text-sm"
                    />
                    <Button
                      type="button"
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
                        {hashtags.length} hashtag{hashtags.length > 1 ? "s" : ""}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {hashtags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer text-xs"
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
                    <Label htmlFor="date-input" className="text-sm font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Data
                    </Label>
                    <Input
                      id="date-input"
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time-input" className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Horário
                    </Label>
                    <Input
                      id="time-input"
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </div>

                <Separator />

                {/* ✅ NOTIFICAÇÃO RESTAURADA */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <Bell className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-sm font-semibold block mb-1">
                          Receber Notificação
                        </span>
                        <p className="text-xs text-muted-foreground">
                          Receba um alerta no horário agendado para postar seu conteúdo
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={enableNotification}
                      onCheckedChange={setEnableNotification}
                    />
                  </div>
                </div>

                {/* ✅ ALERTA DE NOTIFICAÇÃO DESATIVADA RESTAURADO */}
                {enableNotification && !isConnected && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
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
                  </div>
                )}

                <div className="h-20" />
              </div>
            </div>
          )}

          {mobileTab === "preview" && (
            <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
              <div className="p-4">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border-2">
                    <div className="p-3 flex items-center gap-3 border-b">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <PlatformIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Seu Perfil</p>
                        <p className="text-xs text-muted-foreground">
                          {PLATFORM_CONFIG[platform].name}
                        </p>
                      </div>
                    </div>

                    <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center relative">
                      <UploadFeedback
                        isUploading={isUploading}
                        uploadProgress={uploadProgress}
                        uploadSuccess={uploadSuccess}
                      />

                      {mediaPreview ? (
                        contentType === "reel" ? (
                          <video src={mediaPreview} className="w-full h-full object-cover" controls playsInline />
                        ) : (
                          <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                        )
                      ) : (
                        <div className="text-center p-8">
                          {contentType === "reel" ? (
                            <Video className="w-20 h-20 mx-auto mb-4 text-gray-400" />
                          ) : (
                            <ImageIcon className="w-20 h-20 mx-auto mb-4 text-gray-400" />
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Fazer Upload
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <p className="text-sm whitespace-pre-wrap">
                        {caption || <span className="text-muted-foreground italic">Sua legenda...</span>}
                      </p>
                      {hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t">
                          {hashtags.map((tag) => (
                            <span key={tag} className="text-xs text-blue-600">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {mediaFile && (
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-green-800 dark:text-green-200 truncate">
                            {mediaFile.name}
                          </p>
                          <p className="text-xs text-green-600">
                            {(mediaFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* DESKTOP */}
        <div className="hidden md:grid md:grid-cols-2 flex-1 overflow-hidden">
          <div className="border-r overflow-y-auto p-6 space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Plataforma</Label>
              <div className="grid grid-cols-2 gap-3">
                {supportedPlatforms.map(([key, config]) => {
                  const Icon = config.icon;
                  const isSelected = platform === key;
                  return (
                    <Button
                      key={key}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "justify-start",
                        isSelected && `bg-gradient-to-r ${config.color} text-white`
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

            <div className="space-y-3">
              <Label htmlFor="caption-desktop">Legenda do Post</Label>
              <Textarea
                id="caption-desktop"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Escreva uma legenda incrível..."
                className="min-h-[150px]"
                maxLength={2200}
              />
              <p className="text-xs text-muted-foreground">{caption.length}/2200</p>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Hashtags
              </Label>
              <div className="flex gap-2">
                <Input
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddHashtag())}
                  placeholder="Digite uma hashtag"
                />
                <Button type="button" onClick={() => handleAddHashtag()} size="icon">
                  <Check className="w-4 h-4" />
                </Button>
              </div>
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag) => (
                    <Badge key={tag} className="cursor-pointer" onClick={() => handleRemoveHashtag(tag)}>
                      {tag} <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-desktop">Data</Label>
                <Input
                  id="date-desktop"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time-desktop">Horário</Label>
                <Input
                  id="time-desktop"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* ✅ NOTIFICAÇÃO DESKTOP RESTAURADA */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <Bell className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-sm font-semibold block mb-1">
                      Receber Notificação
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Receba um alerta no horário agendado para postar seu conteúdo
                    </p>
                  </div>
                </div>
                <Switch
                  checked={enableNotification}
                  onCheckedChange={setEnableNotification}
                />
              </div>
            </div>

            {enableNotification && !isConnected && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
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
              </div>
            )}
          </div>

          <div className="overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
            <div className="max-w-md mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-4 flex items-center gap-3 border-b">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <PlatformIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Seu Perfil</p>
                    <p className="text-xs text-muted-foreground">{PLATFORM_CONFIG[platform].name}</p>
                  </div>
                </div>
                <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center relative">
                  {mediaPreview ? (
                    contentType === "reel" ? (
                      <video src={mediaPreview} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                    )
                  ) : (
                    <Button type="button" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-sm whitespace-pre-wrap">{caption || "Sua legenda..."}</p>
                  {hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t">
                      {hashtags.map((tag) => (
                        <span key={tag} className="text-xs text-blue-600">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex-row gap-3 flex-shrink-0">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSchedule}
            disabled={!caption.trim() || !scheduledDate || !scheduledTime}
            className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Agendar Post
          </Button>
        </DialogFooter>

        <input
          ref={fileInputRef}
          type="file"
          accept={contentType === "reel" ? "video/mp4,video/quicktime" : "image/*"}
          className="hidden"
          onChange={handleFileChange}
        />
      </DialogContent>
    </Dialog>
  );
}