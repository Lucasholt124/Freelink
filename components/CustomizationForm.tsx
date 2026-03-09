"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Upload, X, Image as ImageIcon, Paintbrush,
  ImagePlus, Layout, AlertCircle, Sparkles, Smartphone,
  Palette, Share2, Check, Eye, ChevronDown,
  Camera, Sliders, Megaphone, RefreshCw, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { compressImageBeforeUpload } from "@/lib/imageCompression";
import { usePerformanceMode } from "@/app/hooks/usePerformanceMode";

// --- TIPAGENS ---
type BackgroundType = "color" | "gradient" | "image";
type BackgroundStyle = "full" | "header";

interface CustomError extends Error {
  message: string;
}
interface CustomizationFormProps {
  onComplete?: () => void;
  simplifiedMode?: boolean;
  effectiveUserId?: string; // ID da sub-conta (se estiver em uma)
}

// --- PRESETS ---
const GRADIENT_PRESETS = [
  { name: "Oceano", c1: "#0093E9", c2: "#80D0C7" },
  { name: "Sunset", c1: "#FA8BFF", c2: "#2BD2FF" },
  { name: "Lavanda", c1: "#8EC5FC", c2: "#E0C3FC" },
  { name: "Aurora", c1: "#00DBDE", c2: "#FC00FF" },
  { name: "Pêssego", c1: "#FFE53B", c2: "#FF2525" },
  { name: "Menta", c1: "#74EBD5", c2: "#9FACE6" },
  { name: "Roxo Pro", c1: "#667eea", c2: "#764ba2" },
  { name: "Dark", c1: "#232526", c2: "#414345" },
];

const COLOR_PRESETS = [
  "#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0",
  "#fef3c7", "#fce7f3", "#e0e7ff", "#d1fae5",
  "#1a1a2e", "#16213e", "#0f3460", "#533483",
];

export default function CustomizationForm({ onComplete, effectiveUserId }: CustomizationFormProps) {
  const { user } = useUser();
  const performanceConfig = usePerformanceMode();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Define de quem são os dados: da sub-conta ou da conta principal
  const targetUserId = effectiveUserId || user?.id;

  // --- CONVEX ---
  const updateCustomizations = useMutation(api.lib.customizations.updateCustomizations);
  const generateUploadUrl = useMutation(api.lib.customizations.generateUploadUrl);
  const removeProfilePicture = useMutation(api.lib.customizations.removeProfilePicture);
  const removeBackgroundImage = useMutation(api.lib.customizations.removeBackgroundImage);

  const existingCustomizations = useQuery(
    api.lib.customizations.getUserCustomizations,
    targetUserId ? { userId: targetUserId } : "skip",
  );

  const userSlug = useQuery(
    api.lib.usernames.getUserSlug,
    targetUserId ? { userId: targetUserId } : "skip"
  );

  // --- ESTADOS ---
  const [cleanBio, setCleanBio] = useState("");
  const [statusEnabled, setStatusEnabled] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [accentColor, setAccentColor] = useState("#6366f1");
  const [bioError, setBioError] = useState("");

  const [backgroundConfig, setBackgroundConfig] = useState({
    type: "color" as BackgroundType,
    style: "full" as BackgroundStyle,
    color1: "#f3f4f6",
    color2: "#e5e7eb",
    imageUrl: "",
    imageBlur: 0,
    imageOpacity: 100,
  });

  const [isLoading, startTransition] = useTransition();
  const [isUploading, startUploading] = useTransition();
  const [isUploadingBg, startUploadingBg] = useTransition();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Estado para controlar refresh do iframe
  const [iframeKey, setIframeKey] = useState(0);
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  // --- CARREGAR DADOS INICIAIS ---
  useEffect(() => {
    if (existingCustomizations) {
      setAccentColor(existingCustomizations.accentColor || "#6366f1");

      const fullDesc = existingCustomizations.description || "";
      if (fullDesc.startsWith("AVISO:") || fullDesc.startsWith("STATUS:")) {
        const parts = fullDesc.split("\n");
        const extractedStatus = parts[0].replace(/^(AVISO:|STATUS:)\s*/i, "").trim();
        const extractedBio = parts.slice(1).join("\n").trim();
        setStatusEnabled(true);
        setStatusText(extractedStatus);
        setCleanBio(extractedBio);
      } else {
        setStatusEnabled(false);
        setStatusText("");
        setCleanBio(fullDesc);
      }

      setBackgroundConfig({
        type: (existingCustomizations.backgroundType as BackgroundType) || "color",
        style: (existingCustomizations.backgroundStyle as BackgroundStyle) || "full",
        color1: existingCustomizations.backgroundColor1 || "#f3f4f6",
        color2: existingCustomizations.backgroundColor2 || "#e5e7eb",
        imageUrl: existingCustomizations.backgroundImageUrl || "",
        imageBlur: existingCustomizations.backgroundImageBlur ?? 0,
        imageOpacity: existingCustomizations.backgroundImageOpacity ?? 100,
      });

      setInitialLoadDone(true);
      setHasChanges(false);
    }
  }, [existingCustomizations]);

  // Monitora mudanças
  useEffect(() => {
    if (initialLoadDone) {
      setHasChanges(true);
      setJustSaved(false);
    }
  }, [cleanBio, statusEnabled, statusText, accentColor, backgroundConfig, initialLoadDone]);

  // --- VALIDAÇÃO ---
  const validateBio = useCallback((text: string) => {
    if (text.length > 160) {
      setBioError("Máximo de 160 caracteres na bio");
      return false;
    }
    setBioError("");
    return true;
  }, []);

  const celebrate = useCallback(() => {
    if (!performanceConfig.canUseParticles) return;

    const count = 200;
    const defaults = { origin: { y: 0.7 }, zIndex: 9999 };
    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
    }
    fire(0.25, { spread: 26, startVelocity: 55, colors: ['#a855f7', '#ec4899', '#6366f1'] });
    fire(0.2, { spread: 60, colors: ['#a855f7', '#ec4899', '#6366f1'] });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ['#a855f7', '#ec4899', '#6366f1'] });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ['#a855f7', '#ec4899', '#6366f1'] });
    fire(0.1, { spread: 120, startVelocity: 45, colors: ['#a855f7', '#ec4899', '#6366f1'] });
  }, [performanceConfig.canUseParticles]);

  // FUNÇÃO PARA RECARREGAR O IFRAME
  const refreshPreview = useCallback(() => {
    setIsIframeLoading(true);
    setIframeKey(prev => prev + 1);
  }, []);

  // --- HANDLERS ---

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetUserId) return;

    if (bioError) {
      toast.error("Verifique os erros no formulário.");
      return;
    }

    let finalDescription = cleanBio.trim();
    if (statusEnabled && statusText.trim().length > 0) {
      finalDescription = `AVISO: ${statusText.trim()}\n${cleanBio.trim()}`;
    }

    startTransition(async () => {
      try {
        // 🔥 Correção do tipo de updateData para satisfazer o TypeScript
        const updateData: Parameters<typeof updateCustomizations>[0] = {
          userId: targetUserId,
          description: finalDescription,
          accentColor: accentColor,
          backgroundType: backgroundConfig.type,
          backgroundStyle: backgroundConfig.style,
          backgroundColor1: backgroundConfig.color1,
          backgroundColor2: backgroundConfig.color2,
          backgroundImageBlur: backgroundConfig.imageBlur,
          backgroundImageOpacity: backgroundConfig.imageOpacity,
        };

        if (backgroundConfig.type !== "image" && existingCustomizations?.backgroundImageStorageId) {
          updateData.clearBackgroundImage = true;
        }

        await updateCustomizations(updateData);

        celebrate();
        setJustSaved(true);
        setHasChanges(false);

        // ATUALIZAR PREVIEW APÓS SALVAR
        setTimeout(() => {
          refreshPreview();
        }, 500);

        onComplete?.();

        toast.success("Perfil atualizado! 🎉", {
          description: "Suas alterações já estão online.",
        });

      } catch (error: unknown) {
        console.error(error);
        const errorMessage = (error as CustomError)?.message || "Erro ao salvar alterações.";
        toast.error(errorMessage);
      }
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, isBackground: boolean) => {
    const file = event.target.files?.[0];
    if (!file || !targetUserId) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida.");
      return;
    }

    const transition = isBackground ? startUploadingBg : startUploading;

    transition(async () => {
      try {
        let uploadFile = file;

        if (file.size > 500 * 1024) {
          toast.info("Otimizando imagem...", { duration: 1500 });

          const result = await compressImageBeforeUpload(
            file,
            isBackground ? 'background' : 'profile'
          );

          uploadFile = result.file;

          if (result.savings > 0) {
            console.log(`✅ Economizou ${result.savings}% no tamanho da imagem`);
          }
        }

        const uploadUrl = await generateUploadUrl();

        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": uploadFile.type },
          body: uploadFile,
        });

        if (!result.ok) throw new Error("Upload failed");

        const { storageId } = await result.json();

        if (isBackground) {
          await updateCustomizations({
            userId: targetUserId,
            backgroundType: "image",
            backgroundImageStorageId: storageId,
            backgroundStyle: backgroundConfig.style,
            backgroundImageBlur: backgroundConfig.imageBlur,
            backgroundImageOpacity: backgroundConfig.imageOpacity,
          });

          setBackgroundConfig((prev) => ({ ...prev, type: "image" }));
          toast.success("🖼️ Fundo atualizado com sucesso!");
        } else {
          await updateCustomizations({
            userId: targetUserId,
            profilePictureStorageId: storageId
          });
          toast.success("📸 Foto de perfil atualizada!");
        }

        // ATUALIZAR PREVIEW APÓS UPLOAD
        setTimeout(() => {
          refreshPreview();
        }, 500);

      } catch (error) {
        console.error(error);
        toast.error("Erro no upload. Verifique sua conexão.");
      }
    });

    event.target.value = "";
  };

  const handleRemoveBackgroundImage = async () => {
    if (!targetUserId) return;
    try {
      await removeBackgroundImage({ userId: targetUserId });
      setBackgroundConfig((prev) => ({
        ...prev,
        imageUrl: "",
        type: "color",
      }));
      toast.success("Imagem de fundo removida!");

      setTimeout(() => {
        refreshPreview();
      }, 500);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao remover imagem.");
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/${userSlug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Olha meu link no Freelinnk! 🚀",
          text: "Criei minha página de links!",
          url: shareUrl,
        });
        toast.success("Compartilhado!");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          await navigator.clipboard.writeText(shareUrl);
          toast.success("Link copiado!");
        }
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copiado!");
    }
  };

  // URL DO PREVIEW (sua página pública)
  const previewUrl = userSlug ? `${window.location.origin}/${userSlug}?preview=true&t=${iframeKey}` : null;

  const currentBackgroundImageUrl = backgroundConfig.imageUrl || existingCustomizations?.backgroundImageUrl;

  return (
    <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 xl:gap-12">
      {/* LADO ESQUERDO: CONTROLES */}
      <div className="flex-1 space-y-6 order-2 xl:order-1">

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Palette className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Editor Visual</h3>
              <p className="text-sm text-gray-500 hidden sm:block">Personalize a aparência do seu link</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {hasChanges && !justSaved && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full flex items-center gap-1"
              >
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                Não salvo
              </motion.span>
            )}
            {justSaved && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Salvo!
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <form id="customization-form" onSubmit={handleSubmit} className="space-y-6">

          {/* 1. FOTO DE PERFIL */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Camera className="w-4 h-4 text-gray-400" /> Foto de Perfil
            </Label>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="relative group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-white shadow-md ring-2 ring-white relative">
                  {existingCustomizations?.profilePictureUrl ? (
                    <Image src={existingCustomizations.profilePictureUrl} alt="Foto" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <><div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />Enviando...</>
                    ) : (
                      <><Upload className="w-4 h-4 mr-2" />Trocar</>
                    )}
                  </Button>

                  {existingCustomizations?.profilePictureUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => removeProfilePicture({ userId: targetUserId })}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-400">JPG, PNG ou GIF. Max 5MB.</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, false)}
              />
            </div>
          </div>

          {/* 2. BIO */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label htmlFor="bio" className="text-sm font-semibold text-gray-700">Bio / Descrição</Label>
              <span className={`text-xs font-medium ${cleanBio.length > 150 ? cleanBio.length > 160 ? "text-red-500" : "text-orange-500" : "text-gray-400"}`}>
                {cleanBio.length}/160
              </span>
            </div>

            <textarea
              id="bio"
              value={cleanBio}
              onChange={(e) => {
                setCleanBio(e.target.value);
                validateBio(e.target.value);
              }}
              className="w-full min-h-[100px] p-4 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all resize-none text-sm"
              placeholder="Ex: Criador de conteúdo digital ajudando marcas a crescerem 🚀"
            />

            <AnimatePresence>
              {bioError && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xs text-red-500 flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" /> {bioError}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* 3. STATUS */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-orange-500" /> Aviso de Status
                <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">Novo</span>
              </Label>
              <button
                type="button"
                onClick={() => setStatusEnabled(!statusEnabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${statusEnabled ? 'bg-orange-500' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${statusEnabled ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
            </div>

            <AnimatePresence>
              {statusEnabled && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <input
                    type="text"
                    value={statusText}
                    onChange={(e) => setStatusText(e.target.value)}
                    maxLength={50}
                    placeholder="Ex: 🎄 Promoção de Natal Ativa!"
                    className="w-full p-3 rounded-lg border border-orange-200 bg-orange-50 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm text-orange-800 font-medium placeholder:text-orange-300"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Cria uma barra colorida no topo. Max 50 caracteres.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. COR PRINCIPAL */}
          <div className="space-y-3 pt-2">
            <Label className="text-sm font-semibold text-gray-700">Cor Principal</Label>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-12 h-12 rounded-xl border-0 p-0 cursor-pointer"
                />
              </div>
              <div className="px-3 py-2 bg-gray-50 rounded-lg border font-mono text-xs text-gray-600 uppercase">{accentColor}</div>

              <div className="flex gap-1.5 flex-wrap">
                {["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAccentColor(color)}
                    className={`w-7 h-7 rounded-lg transition-transform hover:scale-110 ${accentColor === color ? "ring-2 ring-offset-2 ring-gray-400" : ""}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 5. ESTILO DE FUNDO */}
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" /> Estilo de Fundo
            </Label>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { id: "color", icon: Paintbrush, label: "Cor" },
                { id: "gradient", icon: Layout, label: "Gradiente" },
                { id: "image", icon: ImagePlus, label: "Imagem" }
              ].map((type) => (
                <motion.button
                  key={type.id}
                  type="button"
                  onClick={() => setBackgroundConfig((prev) => ({ ...prev, type: type.id as BackgroundType }))}
                  className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border-2 transition-all ${
                    backgroundConfig.type === type.id
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-100 hover:border-gray-200 text-gray-600"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <type.icon className="w-5 h-5 mb-1.5" />
                  <span className="text-xs font-medium">{type.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Painéis de Configuração */}
            <AnimatePresence mode="wait">
              <motion.div
                key={backgroundConfig.type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 sm:p-5 bg-gray-50/80 rounded-xl border border-gray-100"
              >

                {/* A) Cor Sólida */}
                {backgroundConfig.type === "color" && (
                  <div className="space-y-4">
                    <Label className="text-xs text-gray-500">Selecione a cor de fundo</Label>
                    <input
                      type="color"
                      value={backgroundConfig.color1}
                      onChange={(e) => setBackgroundConfig((prev) => ({ ...prev, color1: e.target.value }))}
                      className="w-full h-12 rounded-lg cursor-pointer"
                    />
                    <div className="flex gap-2 flex-wrap">
                      {COLOR_PRESETS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setBackgroundConfig((prev) => ({ ...prev, color1: color }))}
                          className={`w-8 h-8 rounded-lg border transition-transform hover:scale-110 ${
                            backgroundConfig.color1 === color ? "ring-2 ring-purple-500 ring-offset-2" : "border-gray-200"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* B) Gradiente */}
                {backgroundConfig.type === "gradient" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-500">Cor Inicial</Label>
                        <input
                          type="color"
                          className="w-full h-10 rounded-lg cursor-pointer"
                          value={backgroundConfig.color1}
                          onChange={(e) => setBackgroundConfig((prev) => ({ ...prev, color1: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-500">Cor Final</Label>
                        <input
                          type="color"
                          className="w-full h-10 rounded-lg cursor-pointer"
                          value={backgroundConfig.color2}
                          onChange={(e) => setBackgroundConfig((prev) => ({ ...prev, color2: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-2 block">Presets populares</Label>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {GRADIENT_PRESETS.map((preset, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setBackgroundConfig((prev) => ({ ...prev, color1: preset.c1, color2: preset.c2 }))}
                            className="flex-shrink-0 w-10 h-10 rounded-xl ring-2 ring-white shadow-md hover:scale-110 transition-transform"
                            style={{ background: `linear-gradient(135deg, ${preset.c1}, ${preset.c2})` }}
                            title={preset.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* C) Imagem de Fundo */}
                {backgroundConfig.type === "image" && (
                  <div className="space-y-4">
                    {!currentBackgroundImageUrl ? (
                      <motion.button
                        type="button"
                        onClick={() => backgroundInputRef.current?.click()}
                        className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-purple-400 hover:bg-purple-50/50 transition-all"
                        disabled={isUploadingBg}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {isUploadingBg ? (
                          <>
                            <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                            <span className="text-sm text-purple-600">Enviando...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400" />
                            <span className="text-sm text-gray-500">Clique para enviar imagem</span>
                            <span className="text-xs text-gray-400">JPG, PNG ou GIF. Max 5MB.</span>
                          </>
                        )}
                      </motion.button>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative h-32 rounded-xl overflow-hidden group">
                          <img
                            src={currentBackgroundImageUrl}
                            className="w-full h-full object-cover transition-all"
                            alt="Preview"
                            style={{
                              filter: `blur(${backgroundConfig.imageBlur}px)`,
                              opacity: backgroundConfig.imageOpacity / 100
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => backgroundInputRef.current?.click()}
                              disabled={isUploadingBg}
                            >
                              {isUploadingBg ? "..." : "Trocar"}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={handleRemoveBackgroundImage}
                            >
                              Remover
                            </Button>
                          </div>
                        </div>

                        {/* Controles de Imagem */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium text-gray-600 flex items-center gap-1">
                                <Sliders className="w-3 h-3" /> Desfoque
                              </span>
                              <span className="text-purple-600 font-medium">{backgroundConfig.imageBlur}px</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="20"
                              value={backgroundConfig.imageBlur}
                              onChange={(e) => setBackgroundConfig((prev) => ({ ...prev, imageBlur: Number(e.target.value) }))}
                              className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-purple-600"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium text-gray-600 flex items-center gap-1">
                                <Eye className="w-3 h-3" /> Opacidade
                              </span>
                              <span className="text-purple-600 font-medium">{backgroundConfig.imageOpacity}%</span>
                            </div>
                            <input
                              type="range"
                              min="20"
                              max="100"
                              value={backgroundConfig.imageOpacity}
                              onChange={(e) => setBackgroundConfig((prev) => ({ ...prev, imageOpacity: Number(e.target.value) }))}
                              className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-purple-600"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <input
                      ref={backgroundInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, true)}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Opções Avançadas */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              Opções avançadas
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <Label className="text-xs text-gray-500 mb-3 block">Estilo do fundo</Label>
                    <div className="grid grid-cols-2 gap-3">

                      <button
                        type="button"
                        onClick={() => setBackgroundConfig((prev) => ({ ...prev, style: "header" }))}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          backgroundConfig.style === "header"
                            ? "border-purple-500 bg-purple-50 text-purple-700"
                            : "border-gray-200 text-gray-600"
                        }`}
                      >
                        Apenas header
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-3">
                      {backgroundConfig.style === "full"
                        ? "A imagem/cor cobrirá toda a tela."
                        : "A imagem/cor aparecerá apenas no topo."}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* BOTÃO SALVAR (Desktop) */}
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="hidden xl:block">
            <Button
              type="submit"
              disabled={isLoading || !!bioError}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6 rounded-xl shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {hasChanges ? "Salvar e Publicar" : "Tudo salvo!"}
                </span>
              )}
            </Button>
          </motion.div>

          {userSlug && (
            <Button
              type="button"
              variant="outline"
              onClick={handleShare}
              className="w-full py-5 rounded-xl border-2 border-dashed hidden xl:flex"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar meu Link
            </Button>
          )}
        </form>
      </div>

      {/* 🔥 LADO DIREITO: PREVIEW REAL COM IFRAME 🔥 */}
      <div className="flex-1 xl:min-w-[320px] xl:max-w-[400px] order-1 xl:order-2">
        <div className="xl:sticky xl:top-24 space-y-4">

          {/* Header do Preview */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Smartphone className="w-4 h-4" />
              <span>Preview da sua página</span>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={refreshPreview}
                disabled={isIframeLoading}
                className="h-8 px-2"
              >
                <RefreshCw className={`w-4 h-4 ${isIframeLoading ? 'animate-spin' : ''}`} />
              </Button>

              {userSlug && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`/${userSlug}`, '_blank')}
                  className="h-8 px-2"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Moldura do Celular */}
          <motion.div
            className="relative mx-auto w-[280px] sm:w-[300px] h-[560px] sm:h-[600px] bg-gray-900 rounded-[2.5rem] sm:rounded-[3rem] p-2.5 sm:p-3 shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Botões físicos */}
            <div className="absolute top-20 -left-0.5 w-0.5 h-6 bg-gray-700 rounded-l" />
            <div className="absolute top-32 -left-0.5 w-0.5 h-10 bg-gray-700 rounded-l" />
            <div className="absolute top-44 -left-0.5 w-0.5 h-10 bg-gray-700 rounded-l" />
            <div className="absolute top-28 -right-0.5 w-0.5 h-14 bg-gray-700 rounded-r" />

            {/* Notch */}
            <div className="absolute top-4 sm:top-5 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-6 bg-black rounded-full z-20">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-800" />
            </div>

            {/* 🔥 TELA COM IFRAME REAL 🔥 */}
            <div className="w-full h-full rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden relative bg-white">

              {/* Loading State */}
              <AnimatePresence>
                {isIframeLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center gap-3"
                  >
                    <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                    <span className="text-xs text-gray-400">Carregando preview...</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Estado quando não tem slug */}
              {!userSlug ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">Configure seu username primeiro</p>
                </div>
              ) : (
                /* 🔥 IFRAME DA PÁGINA REAL 🔥 */
                <iframe
                  ref={iframeRef}
                  key={iframeKey}
                  src={previewUrl || undefined}
                  className="w-full h-full border-0"
                  onLoad={() => setIsIframeLoading(false)}
                  title="Preview da página"
                  sandbox="allow-same-origin allow-scripts"
                  style={{
                    transform: 'scale(1)',
                    transformOrigin: 'top left',
                  }}
                />
              )}
            </div>
          </motion.div>

          {/* Info */}
          <div className="text-center space-y-1">
            <p className="text-xs text-gray-400">
              Salve para atualizar o preview
            </p>
            {userSlug && (
              <p className="text-[10px] text-gray-300">
                freelinnk.com/{userSlug}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 🔥 BOTÃO SALVAR FLUTUANTE - MOBILE */}
      <AnimatePresence>
        {hasChanges && !justSaved && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-lg border-t border-gray-200 z-50 xl:hidden"
            style={{
              boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
              paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'
            }}
          >
            <Button
              type="submit"
              form="customization-form"
              disabled={isLoading || !!bioError}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 rounded-xl shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Salvar Alterações
                </span>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}