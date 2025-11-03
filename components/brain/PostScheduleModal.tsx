// components/brain/PostScheduleModal.tsx - MODAL DE AGENDAMENTO (MOBILE OPTIMIZED)
"use client";

import { useState, useRef, useEffect } from "react";
import { motion,  } from "framer-motion";
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
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { createPost } = useScheduledPosts(campaignId);
  const { isConnected } = useBufferIntegration();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black p-4 md:p-6 h-full overflow-y-auto">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-base md:text-xl font-semibold">
          <Eye className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
          Preview
        </h3>
      </div>

      <motion.div
        layout
        className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 max-w-sm mx-auto"
      >
        <div className="p-3 md:p-4 flex items-center gap-2 md:gap-3 border-b dark:border-gray-700">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <PlatformIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-xs md:text-sm">Seu Perfil</p>
            <p className="text-[10px] md:text-xs text-muted-foreground">
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
            <div className="text-center p-6 md:p-8">
              {contentType === "reel" ? (
                <Video className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-gray-400" />
              ) : (
                <ImageIcon className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-gray-400" />
              )}
              <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                {contentType === "reel" ? "Nenhum vídeo" : "Nenhuma imagem"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs"
              >
                <Upload className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                Upload
              </Button>
            </div>
          )}
        </div>

        <div className="p-3 md:p-4">
          <p className="text-xs md:text-sm whitespace-pre-wrap leading-relaxed line-clamp-4">
            {caption || (
              <span className="text-muted-foreground italic">
                Sua legenda aparecerá aqui...
              </span>
            )}
          </p>
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {hashtags.slice(0, 5).map((tag) => (
                <span key={tag} className="text-[10px] md:text-xs text-blue-600">
                  {tag}
                </span>
              ))}
              {hashtags.length > 5 && (
                <span className="text-[10px] md:text-xs text-muted-foreground">
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
    <div className="p-4 md:p-6 overflow-y-auto">
      <div className="mb-4 md:mb-6">
        <h3 className="flex items-center gap-2 text-base md:text-xl font-semibold">
          <Edit className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
          Configurar Post
        </h3>
      </div>

      <div className="space-y-4 md:space-y-6">
        {/* Plataforma */}
        <div className="space-y-2">
          <Label className="text-xs md:text-sm">Plataforma</Label>
          <div className="grid grid-cols-2 gap-2">
            {supportedPlatforms.map(([key, config]) => {
              const Icon = config.icon;
              const isSelected = platform === key;
              return (
                <Button
                  key={key}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "justify-start text-xs",
                    isSelected && `bg-gradient-to-r ${config.color} text-white border-0`
                  )}
                  onClick={() => setPlatform(key as keyof typeof PLATFORM_CONFIG)}
                >
                  <Icon className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                  {config.name}
                </Button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Legenda */}
        <div className="space-y-2">
          <Label htmlFor="caption" className="text-xs md:text-sm">
            Legenda
          </Label>
          <Textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Escreva uma legenda incrível..."
            className="min-h-[100px] md:min-h-[120px] resize-none text-xs md:text-sm"
            maxLength={2200}
          />
          <p className="text-[10px] md:text-xs text-muted-foreground text-right">
            {caption.length}/2200
          </p>
        </div>

        {/* Hashtags */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-xs md:text-sm">
            <Hash className="w-3 h-3 md:w-4 md:h-4" />
            Hashtags
          </Label>

          {/* Hashtags Virais Sugeridas */}
          <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-purple-600" />
              <span className="text-[10px] md:text-xs font-semibold text-purple-800 dark:text-purple-200">
                Hashtags Virais
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {VIRAL_HASHTAGS.general.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer text-[10px] md:text-xs hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
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
              className="text-xs md:text-sm"
            />
            <Button onClick={() => handleAddHashtag()} size="icon" className="h-8 w-8 md:h-10 md:w-10">
              <Check className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
          </div>

          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {hashtags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer text-[10px] md:text-xs hover:bg-destructive hover:text-white transition-colors"
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
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-1 text-xs md:text-sm">
              <Calendar className="w-3 h-3 md:w-4 md:h-4" />
              Data
            </Label>
            <Input
              id="date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="text-xs md:text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-1 text-xs md:text-sm">
              <Clock className="w-3 h-3 md:w-4 md:h-4" />
              Horário
            </Label>
            <Input
              id="time"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="text-xs md:text-sm"
            />
          </div>
        </div>

        <Separator />

        {/* Auto Publish */}
        <div className="p-3 md:p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-publish" className="flex items-center gap-2 cursor-pointer">
              <Zap className="w-3 h-3 md:w-4 md:h-4 text-yellow-500" />
              <div>
                <span className="text-xs md:text-sm font-semibold">Publicar Automaticamente</span>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
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
          <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-orange-800 dark:text-orange-200">
                  Buffer não conectado
                </p>
                <p className="text-[10px] text-orange-700 dark:text-orange-300 mt-0.5">
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
        "p-0",
        isMobile
          ? "max-w-full h-[100dvh] w-full rounded-none"
          : "max-w-5xl max-h-[90vh]"
      )}>
        {isMobile ? (
          // Mobile Layout
          <div className="flex flex-col h-full">
            <DialogHeader className="p-4 border-b">
              <DialogTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Agendar Post
              </DialogTitle>
            </DialogHeader>

            <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as "preview" | "config")} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-2 rounded-none">
                <TabsTrigger value="config" className="text-xs">
                  <Edit className="w-3 h-3 mr-1" />
                  Configurar
                </TabsTrigger>
                <TabsTrigger value="preview" className="text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="config" className="flex-1 m-0 overflow-hidden">
                <ConfigSection />
              </TabsContent>

              <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
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
        ) : (
          // Desktop Layout (mantém o original)
          <div className="grid grid-cols-2 h-full max-h-[90vh]">
            <PreviewSection />
            <ConfigSection />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}