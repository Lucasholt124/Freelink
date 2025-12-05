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
  Camera, Sliders
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// --- TIPAGENS ---
type BackgroundType = "color" | "gradient" | "image";
type BackgroundStyle = "full" | "header";

interface CustomizationFormProps {
  onComplete?: () => void;
}

// --- PRESETS (CORES E GRADIENTES) ---
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

export default function CustomizationForm({ onComplete }: CustomizationFormProps) {
  const { user } = useUser();

  // Refs para inputs de arquivo e preview
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // --- CONVEX MUTATIONS & QUERIES ---
  const updateCustomizations = useMutation(api.lib.customizations.updateCustomizations);
  const generateUploadUrl = useMutation(api.lib.customizations.generateUploadUrl);
  const removeProfilePicture = useMutation(api.lib.customizations.removeProfilePicture);
  const removeBackgroundImage = useMutation(api.lib.customizations.removeBackgroundImage);

  // Busca dados existentes
  const existingCustomizations = useQuery(
    api.lib.customizations.getUserCustomizations,
    user ? { userId: user.id } : "skip",
  );

  // Busca o slug (username) para o link de compartilhamento
  const userSlug = useQuery(
    api.lib.usernames.getUserSlug,
    user ? { userId: user.id } : "skip"
  );

  // --- ESTADOS ---
  const [formData, setFormData] = useState({
    description: "",
    accentColor: "#6366f1",
  });

  const [bioError, setBioError] = useState("");

  // Estado completo do Background
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
  const [isUploading, startUploading] = useTransition(); // Perfil
  const [isUploadingBg, startUploadingBg] = useTransition(); // Background
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // --- CARREGAR DADOS INICIAIS ---
  useEffect(() => {
    if (existingCustomizations) {
      setFormData({
        description: existingCustomizations.description || "",
        accentColor: existingCustomizations.accentColor || "#6366f1",
      });

      setBackgroundConfig({
        type: (existingCustomizations.backgroundType as BackgroundType) || "color",
        style: (existingCustomizations.backgroundStyle as BackgroundStyle) || "full",
        color1: existingCustomizations.backgroundColor1 || "#f3f4f6",
        color2: existingCustomizations.backgroundColor2 || "#e5e7eb",
        imageUrl: existingCustomizations.backgroundImageUrl || "",
        imageBlur: existingCustomizations.backgroundImageBlur || 0,
        imageOpacity: existingCustomizations.backgroundImageOpacity || 100,
      });
    }
  }, [existingCustomizations]);

  // Monitora mudanças para mostrar o badge "Não salvo"
  useEffect(() => {
    setHasChanges(true);
    setJustSaved(false);
  }, [formData, backgroundConfig]);

  // --- FUNÇÕES AUXILIARES ---

  const validateBio = useCallback((text: string) => {
    if (text.length > 160) {
      setBioError("Máximo de 160 caracteres");
      return false;
    }
    setBioError("");
    return true;
  }, []);

  const celebrate = useCallback(() => {
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
  }, []);

  // --- HANDLERS ---

  // 1. Submit com Validação Amigável
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validação da Bio
    if (!formData.description || formData.description.trim().length === 0) {
      toast.warning("Ei, faltou a Bio! 📝", {
        description: "Seus visitantes querem te conhecer. Escreva algo breve sobre você antes de salvar.",
        duration: 5000,
      });
      document.getElementById('bio')?.focus();
      return;
    }

    if (bioError) {
      toast.error("Ops! Verifique os erros no formulário.");
      return;
    }

    startTransition(async () => {
      try {
        await updateCustomizations({
          description: formData.description,
          accentColor: formData.accentColor,
          backgroundType: backgroundConfig.type,
          backgroundStyle: backgroundConfig.style,
          backgroundColor1: backgroundConfig.color1,
          backgroundColor2: backgroundConfig.color2,
          backgroundImageBlur: backgroundConfig.imageBlur,
          backgroundImageOpacity: backgroundConfig.imageOpacity,
        });

        celebrate();
        setJustSaved(true);
        setHasChanges(false);
        onComplete?.();

        toast.success("Perfil atualizado! 🎉", {
          description: "Ficou incrível! Suas alterações já estão online.",
        });

      } catch (error) {
        console.error(error);
        toast.error("Erro ao salvar alterações. Tente novamente.");
      }
    });
  };

  // 2. Upload de Arquivos (Perfil e Background)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, isBackground: boolean) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Use uma menor que 5MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida.");
      return;
    }

    const transition = isBackground ? startUploadingBg : startUploading;

    transition(async () => {
      try {
        // Gera URL segura no Convex
        const uploadUrl = await generateUploadUrl();

        // Envia o arquivo
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) throw new Error("Upload failed");

        const { storageId } = await result.json();

        // Atualiza o banco com o ID do arquivo
        if (isBackground) {
          await updateCustomizations({
            backgroundType: "image",
            backgroundImageStorageId: storageId,
            backgroundStyle: backgroundConfig.style,
            backgroundImageBlur: backgroundConfig.imageBlur,
            backgroundImageOpacity: backgroundConfig.imageOpacity,
          });
          // Atualiza estado local
          setBackgroundConfig((prev) => ({ ...prev, type: "image" }));
          toast.success("🖼️ Fundo atualizado com sucesso!");
        } else {
          await updateCustomizations({ profilePictureStorageId: storageId });
          toast.success("📸 Foto de perfil atualizada!");
        }
      } catch (error) {
        console.error(error);
        toast.error("Erro no upload. Verifique sua conexão.");
      }
    });

    // Limpa o input
    event.target.value = "";
  };

  // 3. Compartilhar
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/${userSlug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Olha meu link no FreeLink! 🚀",
          text: "Criei minha página de links em 2 minutos!",
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
      toast.success("Link copiado para a área de transferência!");
    }
  };

  // Helpers de Estilo para o Preview
  const getPreviewBackgroundStyle = () => {
    switch (backgroundConfig.type) {
      case "color": return { background: backgroundConfig.color1 };
      case "gradient": return { background: `linear-gradient(180deg, ${backgroundConfig.color1}, ${backgroundConfig.color2})` };
      case "image": return { background: "#ffffff" };
      default: return { background: "#f3f4f6" };
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 xl:gap-12">
      {/* =================================================================
          LADO ESQUERDO: CONTROLES DO FORMULÁRIO
      ================================================================= */}
      <div className="flex-1 space-y-6 order-2 xl:order-1">

        {/* Header e Status Indicator */}
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
                Alterações não salvas
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

          {/* --- 1. FOTO DE PERFIL --- */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Camera className="w-4 h-4 text-gray-400" /> Foto de Perfil
            </Label>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="relative group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-white shadow-md ring-2 ring-white">
                  {existingCustomizations?.profilePictureUrl ? (
                    <Image src={existingCustomizations.profilePictureUrl} alt="Foto de perfil" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-white hover:bg-gray-50"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <><div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />Enviando...</>
                    ) : (
                      <><Upload className="w-4 h-4 mr-2" />Trocar Foto</>
                    )}
                  </Button>

                  {existingCustomizations?.profilePictureUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => removeProfilePicture()}
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

          {/* --- 2. BIO (DESCRIÇÃO) --- */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label htmlFor="bio" className="text-sm font-semibold text-gray-700">Bio / Descrição</Label>
              <span className={`text-xs font-medium transition-colors ${formData.description.length > 150 ? formData.description.length > 160 ? "text-red-500" : "text-orange-500" : "text-gray-400"}`}>
                {formData.description.length}/160
              </span>
            </div>

            <textarea
              id="bio"
              value={formData.description}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, description: e.target.value }));
                validateBio(e.target.value);
              }}
              className="w-full min-h-[100px] p-4 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all resize-none text-sm leading-relaxed"
              placeholder="Ex: Criador de conteúdo digital ajudando marcas a crescerem 🚀"
            />

            <AnimatePresence>
              {bioError && (
                <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {bioError}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* --- 3. COR PRINCIPAL --- */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Cor Principal</Label>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => setFormData((prev) => ({ ...prev, accentColor: e.target.value }))}
                  className="w-12 h-12 rounded-xl border-0 p-0 overflow-hidden cursor-pointer"
                />
                <div className="absolute inset-0 rounded-xl ring-1 ring-black/10 pointer-events-none" />
              </div>
              <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 font-mono text-xs text-gray-600 uppercase">{formData.accentColor}</div>

              <div className="flex gap-1.5 flex-wrap">
                {["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, accentColor: color }))}
                    className={`w-7 h-7 rounded-lg transition-transform hover:scale-110 ${formData.accentColor === color ? "ring-2 ring-offset-2 ring-gray-400" : ""}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* --- 4. ESTILO DE FUNDO --- */}
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-500" /> Estilo de Fundo</Label>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[{ id: "color", icon: Paintbrush, label: "Cor" }, { id: "gradient", icon: Layout, label: "Gradiente" }, { id: "image", icon: ImagePlus, label: "Imagem" }].map((type) => (
                <motion.button
                  key={type.id}
                  type="button"
                  onClick={() => setBackgroundConfig((prev) => ({ ...prev, type: type.id as BackgroundType }))}
                  className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border-2 transition-all ${backgroundConfig.type === type.id ? "border-purple-500 bg-purple-50 text-purple-700 shadow-sm" : "border-gray-100 hover:border-gray-200 text-gray-600"}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <type.icon className="w-5 h-5 mb-1.5" />
                  <span className="text-xs font-medium">{type.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Painéis de Configuração do Fundo */}
            <AnimatePresence mode="wait">
              <motion.div key={backgroundConfig.type} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 sm:p-5 bg-gray-50/80 rounded-xl border border-gray-100">

                {/* A) Cor Sólida */}
                {backgroundConfig.type === "color" && (
                  <div className="space-y-4">
                    <Label className="text-xs text-gray-500">Selecione a cor de fundo</Label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={backgroundConfig.color1} onChange={(e) => setBackgroundConfig((prev) => ({ ...prev, color1: e.target.value }))} className="w-full h-12 rounded-lg cursor-pointer" />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {COLOR_PRESETS.map((color) => (
                        <button key={color} type="button" onClick={() => setBackgroundConfig((prev) => ({ ...prev, color1: color }))} className={`w-8 h-8 rounded-lg border transition-transform hover:scale-110 ${backgroundConfig.color1 === color ? "ring-2 ring-purple-500 ring-offset-2" : "border-gray-200"}`} style={{ backgroundColor: color }} />
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
                        <input type="color" className="w-full h-10 rounded-lg cursor-pointer" value={backgroundConfig.color1} onChange={(e) => setBackgroundConfig((prev) => ({ ...prev, color1: e.target.value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-500">Cor Final</Label>
                        <input type="color" className="w-full h-10 rounded-lg cursor-pointer" value={backgroundConfig.color2} onChange={(e) => setBackgroundConfig((prev) => ({ ...prev, color2: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-2 block">Presets populares</Label>
                      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {GRADIENT_PRESETS.map((preset, i) => (
                          <button key={i} type="button" onClick={() => setBackgroundConfig((prev) => ({ ...prev, color1: preset.c1, color2: preset.c2 }))} className="flex-shrink-0 w-10 h-10 rounded-xl ring-2 ring-white shadow-md hover:scale-110 transition-transform" style={{ background: `linear-gradient(135deg, ${preset.c1}, ${preset.c2})` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* C) Imagem de Fundo */}
                {backgroundConfig.type === "image" && (
                  <div className="space-y-4">
                    {!backgroundConfig.imageUrl ? (
                      <motion.button type="button" onClick={() => backgroundInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-purple-400 hover:bg-purple-50/50 transition-all" disabled={isUploadingBg} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        {isUploadingBg ? <><div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" /><span className="text-sm text-purple-600">Enviando...</span></> : <><Upload className="w-8 h-8 text-gray-400" /><span className="text-sm text-gray-500">Clique para enviar imagem</span></>}
                      </motion.button>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative h-32 rounded-xl overflow-hidden group">
                          <img src={backgroundConfig.imageUrl} className="w-full h-full object-cover" alt="Preview" style={{ filter: `blur(${backgroundConfig.imageBlur}px)`, opacity: backgroundConfig.imageOpacity / 100 }} />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button type="button" size="sm" variant="secondary" onClick={() => backgroundInputRef.current?.click()}>Trocar</Button>
                            <Button type="button" size="sm" variant="destructive" onClick={() => { removeBackgroundImage(); setBackgroundConfig((prev) => ({ ...prev, imageUrl: "", type: "color" })); }}>Remover</Button>
                          </div>
                        </div>

                        {/* Controles de Imagem */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs"><span className="font-medium text-gray-600 flex items-center gap-1"><Sliders className="w-3 h-3" /> Desfoque</span><span className="text-purple-600 font-medium">{backgroundConfig.imageBlur}px</span></div>
                            <input type="range" min="0" max="20" value={backgroundConfig.imageBlur} onChange={(e) => setBackgroundConfig((prev) => ({ ...prev, imageBlur: Number(e.target.value) }))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs"><span className="font-medium text-gray-600 flex items-center gap-1"><Eye className="w-3 h-3" /> Opacidade</span><span className="text-purple-600 font-medium">{backgroundConfig.imageOpacity}%</span></div>
                            <input type="range" min="20" max="100" value={backgroundConfig.imageOpacity} onChange={(e) => setBackgroundConfig((prev) => ({ ...prev, imageOpacity: Number(e.target.value) }))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600" />
                          </div>
                        </div>
                      </div>
                    )}
                    <input ref={backgroundInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, true)} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Opções Avançadas (Toggle) */}
            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} /> Opções avançadas
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <Label className="text-xs text-gray-500 mb-3 block">Estilo do fundo</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setBackgroundConfig((prev) => ({ ...prev, style: "full" }))} className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${backgroundConfig.style === "full" ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 text-gray-600"}`}>Tela inteira</button>
                      <button type="button" onClick={() => setBackgroundConfig((prev) => ({ ...prev, style: "header" }))} className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${backgroundConfig.style === "header" ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 text-gray-600"}`}>Apenas header</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button type="submit" disabled={isLoading || !!bioError} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6 rounded-xl shadow-lg shadow-purple-200/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? (
                <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Criando magia...</span>
              ) : (
                <span className="flex items-center gap-2"><Sparkles className="w-5 h-5" /> Salvar e Publicar</span>
              )}
            </Button>
          </motion.div>

          {userSlug && (
            <Button type="button" variant="outline" onClick={handleShare} className="w-full py-5 rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all">
              <Share2 className="w-4 h-4 mr-2" /> Compartilhar meu Link
            </Button>
          )}
        </form>
      </div>

      {/* =================================================================
          LADO DIREITO: PREVIEW EM TEMPO REAL (MOCKUP)
      ================================================================= */}
      <div className="flex-1 xl:min-w-[320px] xl:max-w-[400px] order-1 xl:order-2">
        <div className="xl:sticky xl:top-24 space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500"><Smartphone className="w-4 h-4" /><span>Preview em tempo real</span></div>

          <motion.div ref={previewRef} className="relative mx-auto w-[280px] sm:w-[300px] h-[560px] sm:h-[600px] bg-gray-900 rounded-[2.5rem] sm:rounded-[3rem] p-2.5 sm:p-3 shadow-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ boxShadow: "0 50px 100px -20px rgba(0,0,0,0.25), 0 30px 60px -30px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(255,255,255,0.1)" }}>
            {/* Botões do Mockup */}
            <div className="absolute top-20 -left-0.5 w-0.5 h-6 bg-gray-700 rounded-l" />
            <div className="absolute top-32 -left-0.5 w-0.5 h-10 bg-gray-700 rounded-l" />
            <div className="absolute top-32 -left-0.5 w-0.5 h-10 bg-gray-700 rounded-l translate-y-12" />
            <div className="absolute top-28 -right-0.5 w-0.5 h-14 bg-gray-700 rounded-r" />
            <div className="absolute top-4 sm:top-5 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-6 bg-black rounded-full z-20"><div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-800" /></div>

            {/* TELA */}
            <div className="w-full h-full rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden relative" style={getPreviewBackgroundStyle()}>
              {/* Background Layer no Preview */}
              {backgroundConfig.type === "image" && backgroundConfig.imageUrl && (
                <div className="absolute inset-0">
                  {backgroundConfig.style === "full" ? (
                    <div className="w-full h-full transition-all duration-300" style={{ backgroundImage: `url(${backgroundConfig.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center", filter: `blur(${backgroundConfig.imageBlur}px)`, opacity: backgroundConfig.imageOpacity / 100, transform: "scale(1.1)" }} />
                  ) : (
                    <><div className="h-36 w-full transition-all duration-300" style={{ backgroundImage: `url(${backgroundConfig.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center", filter: `blur(${backgroundConfig.imageBlur}px)`, opacity: backgroundConfig.imageOpacity / 100 }} /><div className="absolute top-28 w-full h-16 bg-gradient-to-b from-transparent to-white" /></>
                  )}
                </div>
              )}

              {/* Conteúdo do Preview */}
              <div className="relative z-10 flex flex-col items-center pt-14 sm:pt-16 px-4 sm:px-6 h-full overflow-y-auto no-scrollbar">

                {/* Avatar Preview */}
                <motion.div className="mb-3 sm:mb-4 p-1 rounded-full shadow-lg" style={{ background: formData.accentColor }} animate={justSaved ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 0.3 }}>
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white bg-gray-100 overflow-hidden relative">
                    {existingCustomizations?.profilePictureUrl ? (
                      <img src={existingCustomizations.profilePictureUrl} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"><ImageIcon className="w-10 h-10 text-gray-300" /></div>
                    )}
                  </div>
                </motion.div>

                {/* Textos Preview */}
                <div className="text-center w-full mb-2">
                  {userSlug ? <p className="font-bold text-gray-900 text-sm sm:text-base">@{userSlug}</p> : <div className="h-4 w-24 bg-black/10 rounded mx-auto animate-pulse" />}
                </div>

                <div className="text-center w-full mb-6 px-2">
                  {formData.description ? (
                    <p className="text-xs text-gray-700 leading-relaxed bg-white/60 p-2.5 rounded-lg backdrop-blur-sm shadow-sm border border-white/30" style={{ maxHeight: "80px", overflow: "hidden" }}>{formData.description}</p>
                  ) : (
                    <div className="h-2 w-40 bg-black/5 rounded mx-auto" />
                  )}
                </div>

                {/* Links Simulados */}
                <div className="w-full space-y-2.5 pb-6">
                  {[1, 2, 3].map((i) => (
                    <motion.div key={i} className="w-full h-11 sm:h-12 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm flex items-center justify-between px-4" style={{ borderLeft: `4px solid ${formData.accentColor}` }} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}>
                      <span className="text-xs text-gray-600 font-medium">Meu Link {i}</span>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: formData.accentColor }} />
                    </motion.div>
                  ))}
                </div>

                <div className="mt-auto pb-4"><span className="text-[10px] text-gray-400/60">Feito com 💜 freelinnk.com</span></div>
              </div>
            </div>
          </motion.div>
          <p className="text-center text-xs text-gray-400">Arraste para ajustar os controles</p>
        </div>
      </div>
    </div>
  );
}