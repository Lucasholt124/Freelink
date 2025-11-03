// components/brain/PostScheduleModal.tsx - MODAL DE AGENDAMENTO (RESPONSIVO)
"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
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
  TrendingUp,
  Eye,
  Edit,
  X,
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
// HASHTAGS VIRAIS SUGERIDAS
// ============================================

const VIRAL_HASHTAGS = {
  general: ["#viral", "#fyp", "#trending", "#explore", "#foryou", "#foryoupage"],
  business: ["#empreendedorismo", "#marketing", "#sucesso", "#vendas", "#negócios", "#dinheiro"],
  lifestyle: ["#lifestyle", "#motivação", "#mindset", "#produtividade", "#crescimento", "#inspiração"],
  tech: ["#tecnologia", "#inovação", "#digital", "#startup", "#tech", "#futuro"],
};

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
  const [mobileTab, setMobileTab] = useState<"preview" | "config">("config");
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

  const handleAddHashtag = (tag?: string) => {
    const newTag = tag || hashtagInput.trim();
    if (!newTag) return;

    const formattedTag = newTag.startsWith("#") ? newTag : `#${newTag}`;

    if (!hashtags.includes(formattedTag)) {
      setHashtags([...hashtags, formattedTag]);
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

  // Preview Component
  const PreviewSection = () => (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <div className="mb-4 sm:mb-6">
        <h3 className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl font-semibold">
          <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
          Preview
        </h3>
      </div>

      <motion.div
        layout
        className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 w-full max-w-[280px] sm:max-w-sm lg:max-w-md mx-auto"
      >
        <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3 border-b dark:border-gray-700">
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <PlatformIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-xs sm:text-sm lg:text-base">Seu Perfil</p>
            <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">
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
            <div className="text-center p-4 sm:p-6 lg:p-8">
              {contentType === "reel" ? (
                <Video className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto mb-3 sm:mb-4 text-gray-400" />
              ) : (
                <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto mb-3 sm:mb-4 text-gray-400" />
              )}
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mb-3 sm:mb-4">
                {contentType === "reel" ? "Nenhum vídeo" : "Nenhuma imagem"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs sm:text-sm"
              >
                <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Upload
              </Button>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 lg:p-5">
          <p className="text-xs sm:text-sm lg:text-base whitespace-pre-wrap leading-relaxed line-clamp-4">
            {caption || (
              <span className="text-muted-foreground italic">
                Sua legenda aparecerá aqui...
              </span>
            )}
          </p>
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 sm:mt-3">
              {hashtags.slice(0, 5).map((tag) => (
                <span key={tag} className="text-[10px] sm:text-xs lg:text-sm text-blue-600">
                  {tag}
                </span>
              ))}
              {hashtags.length > 5 && (
                <span className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">
                  +{hashtags.length - 5} mais
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>

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

  // Configuration Component
  const ConfigSection = () => (
    <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto h-full">
      <div className="mb-4 sm:mb-6">
        <h3 className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl font-semibold">
          <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
          Configurar Post
        </h3>
      </div>

      <div className="space-y-4 sm:space-y-5 lg:space-y-6">
        {/* Plataforma */}
        <div className="space-y-2 sm:space-y-3">
          <Label className="text-xs sm:text-sm lg:text-base">Plataforma</Label>
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
                    "justify-start text-xs sm:text-sm py-2 sm:py-3",
                    isSelected && `bg-gradient-to-r ${config.color} text-white border-0`
                  )}
                  onClick={() => setPlatform(key as keyof typeof PLATFORM_CONFIG)}
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  {config.name}
                </Button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Legenda */}
        <div className="space-y-2 sm:space-y-3">
          <Label htmlFor="caption" className="text-xs sm:text-sm lg:text-base">
            Legenda
          </Label>
          <Textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Escreva uma legenda incrível..."
            className="min-h-[100px] sm:min-h-[120px] lg:min-h-[150px] resize-none text-xs sm:text-sm lg:text-base"
            maxLength={2200}
          />
          <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground text-right">
            {caption.length}/2200
          </p>
        </div>

        {/* Hashtags */}
        <div className="space-y-2 sm:space-y-3">
          <Label className="flex items-center gap-2 text-xs sm:text-sm lg:text-base">
            <Hash className="w-3 h-3 sm:w-4 sm:h-4" />
            Hashtags
          </Label>

          {/* Hashtags Virais Sugeridas */}
          <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
              <span className="text-[10px] sm:text-xs lg:text-sm font-semibold text-purple-800 dark:text-purple-200">
                Hashtags Virais
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {VIRAL_HASHTAGS.general.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer text-[10px] sm:text-xs lg:text-sm hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors px-2 sm:px-3 py-0.5 sm:py-1"
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
              placeholder="Digite e pressione Enter"
              className="text-xs sm:text-sm lg:text-base"
            />
            <Button onClick={() => handleAddHashtag()} size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>

          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
              {hashtags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer text-[10px] sm:text-xs lg:text-sm hover:bg-destructive hover:text-white transition-colors px-2 sm:px-3 py-0.5 sm:py-1"
                  onClick={() => handleRemoveHashtag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Data e Hora */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-1 text-xs sm:text-sm lg:text-base">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              Data
            </Label>
            <Input
              id="date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="text-xs sm:text-sm lg:text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-1 text-xs sm:text-sm lg:text-base">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              Horário
            </Label>
            <Input
              id="time"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="text-xs sm:text-sm lg:text-base"
            />
          </div>
        </div>

        <Separator />

        {/* Auto Publish */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-publish" className="flex items-center gap-2 cursor-pointer">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
              <div>
                <span className="text-xs sm:text-sm lg:text-base font-semibold">Publicar Automaticamente</span>
                <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground mt-0.5">
                  Via Buffer no horário agendado
                </p>
              </div>
            </Label>
            <Switch
              id="auto-publish"
              checked={autoPublish}
              onCheckedChange={setAutoPublish}
            />
          </div>
        </div>

        {autoPublish && !isConnected && (
          <div className="p-3 sm:p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-semibold text-orange-800 dark:text-orange-200">
                  Buffer não conectado
                </p>
                <p className="text-[10px] sm:text-xs text-orange-700 dark:text-orange-300 mt-0.5">
                  Configure nas configurações
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "p-0 max-h-[100vh] overflow-hidden",
        // Mobile
        "w-full h-full sm:h-auto",
        // Tablet
        "sm:max-w-[600px] sm:rounded-lg",
        // Desktop
        "lg:max-w-[900px] xl:max-w-[1100px]",
        // Height control
        "sm:max-h-[90vh] lg:max-h-[85vh]"
      )}>
        {/* Close button sempre visível */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-2 top-2 z-50 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm sm:right-4 sm:top-4"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Mobile Layout - Tabs */}
        <div className="flex flex-col h-full sm:hidden">
          <DialogHeader className="p-4 pb-0 pt-12">
            <DialogTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Agendar Post
            </DialogTitle>
          </DialogHeader>

          <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as "preview" | "config")} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2 rounded-none mx-4 mr-8">
              <TabsTrigger value="config" className="text-xs">
                <Edit className="w-3 h-3 mr-1" />
                Configurar
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs">
                <Eye className="w-3 h-3 mr-1" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="flex-1 m-0 overflow-auto">
              <ConfigSection />
            </TabsContent>

            <TabsContent value="preview" className="flex-1 m-0 overflow-auto">
              <PreviewSection />
            </TabsContent>
          </Tabs>

          <DialogFooter className="p-4 border-t flex-row gap-2">
            <Button variant="ghost" onClick={onClose} className="flex-1 text-xs">
              Cancelar
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={isUploading || !caption.trim() || !scheduledDate || !scheduledTime}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-xs"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Calendar className="w-3 h-3 mr-1" />
                  Agendar
                </>
              )}
            </Button>
          </DialogFooter>
        </div>

        {/* Tablet/Desktop Layout - Split View */}
        <div className="hidden sm:grid sm:grid-cols-1 lg:grid-cols-2 h-full">
          <div className="lg:hidden">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Agendar Post
              </DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="config" className="p-6 pt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="config">Configurar</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="config" className="mt-4">
                <ConfigSection />
              </TabsContent>
              <TabsContent value="preview" className="mt-4">
                <PreviewSection />
              </TabsContent>
            </Tabs>
            <DialogFooter className="p-6 pt-0 flex-row sm:flex-row gap-2">
              <Button variant="ghost" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleSchedule}
                disabled={isUploading || !caption.trim() || !scheduledDate || !scheduledTime}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Agendar
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>

          {/* Desktop Only - Split View */}
          <PreviewSection />
          <div className="border-l dark:border-gray-700 overflow-hidden flex flex-col">
            <ConfigSection />
            <DialogFooter className="p-6 border-t mt-auto">
              <Button variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleSchedule}
                disabled={isUploading || !caption.trim() || !scheduledDate || !scheduledTime}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}