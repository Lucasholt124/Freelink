"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Upload, X, Image as ImageIcon, Paintbrush,
  ImagePlus, Layout, AlertCircle, Sparkles, Smartphone,
  Palette
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

// Tipos para configuração do fundo
type BackgroundType = "color" | "gradient" | "image";
type BackgroundStyle = "full" | "header";

export default function CustomizationForm() {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  // Mutations e Queries
  const updateCustomizations = useMutation(api.lib.customizations.updateCustomizations);
  const generateUploadUrl = useMutation(api.lib.customizations.generateUploadUrl);
  const removeProfilePicture = useMutation(api.lib.customizations.removeProfilePicture);
  const removeBackgroundImage = useMutation(api.lib.customizations.removeBackgroundImage);

  const existingCustomizations = useQuery(
    api.lib.customizations.getUserCustomizations,
    user ? { userId: user.id } : "skip",
  );

  // States
  const [formData, setFormData] = useState({
    description: "",
    accentColor: "#6366f1",
  });

  const [bioError, setBioError] = useState("");
  const [backgroundConfig, setBackgroundConfig] = useState({
    type: "color" as "color" | "gradient" | "image",
    style: "full" as "full" | "header",
    color1: "#f3f4f6",
    color2: "#e5e7eb",
    imageUrl: "",
    imageBlur: 0,
    imageOpacity: 100,
  });

  const [isLoading, startTransition] = useTransition();
  const [isUploading, startUploading] = useTransition();
  const [isUploadingBg, startUploadingBg] = useTransition();

  // Effects e Validação
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

  const validateBio = (text: string) => {
    if (text.length > 160) {
      setBioError("Máximo de 160 caracteres");
      return false;
    }
    setBioError("");
    return true;
  };

  // Handlers (Mantendo a lógica original robusta)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || bioError) return;

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
        toast.success("✨ Perfil atualizado com sucesso!");
      } catch {
        toast.error("Erro ao salvar alterações");
      }
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, isBackground: boolean) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const transition = isBackground ? startUploadingBg : startUploading;

    transition(async () => {
      try {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) throw new Error("Upload failed");
        const { storageId } = await result.json();

        if (isBackground) {
           await updateCustomizations({
            backgroundType: "image",
            backgroundImageStorageId: storageId,
            // Mantém configs atuais
            backgroundStyle: backgroundConfig.style,
            backgroundImageBlur: backgroundConfig.imageBlur,
            backgroundImageOpacity: backgroundConfig.imageOpacity
           });
           toast.success("Fundo atualizado!");
        } else {
           await updateCustomizations({ profilePictureStorageId: storageId });
           toast.success("Foto de perfil atualizada!");
        }
      } catch  {
        toast.error("Erro no upload");
      }
    });
  };

  // UI Helpers
  const gradientPresets = [
    { name: "Oceano", c1: "#0093E9", c2: "#80D0C7" },
    { name: "Sunset", c1: "#FA8BFF", c2: "#2BD2FF" },
    { name: "Roxo", c1: "#8EC5FC", c2: "#E0C3FC" },
    { name: "Aurora", c1: "#00DBDE", c2: "#FC00FF" },
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-8 lg:gap-12">
      {/* LADO ESQUERDO: Controles */}
      <div className="flex-1 space-y-8">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Palette className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Editor Visual</h3>
            <p className="text-sm text-gray-500">Personalize a aparência do seu link</p>
          </div>
        </div>

        <form id="customization-form" onSubmit={handleSubmit} className="space-y-8">

          {/* 1. Foto de Perfil */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-gray-700">Foto de Perfil</Label>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white shadow-md ring-2 ring-white">
                {existingCustomizations?.profilePictureUrl ? (
                  <Image src={existingCustomizations.profilePictureUrl} alt="Profile" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-white"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? "Enviando..." : "Trocar Foto"}
                </Button>
                {existingCustomizations?.profilePictureUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => removeProfilePicture()}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, false)} />
            </div>
          </div>

          {/* 2. Descrição / Bio */}
          <div className="space-y-3">
            <div className="flex justify-between">
               <Label htmlFor="bio" className="text-sm font-semibold text-gray-700">Bio / Descrição</Label>
               <span className={`text-xs ${formData.description.length > 150 ? 'text-orange-500' : 'text-gray-400'}`}>
                 {formData.description.length}/160
               </span>
            </div>
            <textarea
              id="bio"
              value={formData.description}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, description: e.target.value }));
                validateBio(e.target.value);
              }}
              className="w-full min-h-[100px] p-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none text-sm"
              placeholder="Ex: Criador de conteúdo digital ajudando marcas a crescerem 🚀"
            />
            {bioError && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {bioError}</p>}
          </div>

          {/* 3. Cor da Marca */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">Cor Principal</Label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
                  className="w-10 h-10 rounded-lg border-0 p-0 overflow-hidden cursor-pointer"
                />
                <div className="absolute inset-0 rounded-lg ring-1 ring-black/10 pointer-events-none" />
              </div>
              <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 font-mono text-xs text-gray-600 uppercase">
                {formData.accentColor}
              </div>
            </div>
          </div>

          {/* 4. Configurações de Fundo (Avançado) */}
          <div className="pt-6 border-t border-gray-100 space-y-6">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Estilo de Fundo
            </Label>

            {/* Seletor de Tipo */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'color', icon: Paintbrush, label: 'Cor Sólida' },
                { id: 'gradient', icon: Layout, label: 'Gradiente' },
                { id: 'image', icon: ImagePlus, label: 'Imagem' },
              ].map((type) => (
                <button
                  key={type.id as BackgroundType}
                  type="button"
                  onClick={() => setBackgroundConfig(prev => ({ ...prev, type: type.id as BackgroundType }))}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
                    backgroundConfig.type === type.id
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-100 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <type.icon className="w-5 h-5 mb-2" />
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              ))}
            </div>

            {/* Controles Específicos do Fundo */}
            <div className="p-5 bg-gray-50/80 rounded-xl border border-gray-100/80 animate-in fade-in slide-in-from-top-2">

              {/* Opção: Cor */}
              {backgroundConfig.type === 'color' && (
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Selecione a cor</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={backgroundConfig.color1}
                      onChange={(e) => setBackgroundConfig(prev => ({ ...prev, color1: e.target.value }))}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Opção: Gradiente */}
              {backgroundConfig.type === 'gradient' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Cor Inicial</Label>
                        <input type="color" className="w-full h-8 rounded cursor-pointer" value={backgroundConfig.color1} onChange={(e) => setBackgroundConfig(prev => ({...prev, color1: e.target.value}))} />
                     </div>
                     <div className="space-y-1">
                        <Label className="text-xs text-gray-500">Cor Final</Label>
                        <input type="color" className="w-full h-8 rounded cursor-pointer" value={backgroundConfig.color2} onChange={(e) => setBackgroundConfig(prev => ({...prev, color2: e.target.value}))} />
                     </div>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {gradientPresets.map((p, i) => (
                      <button key={i} type="button"
                        onClick={() => setBackgroundConfig(prev => ({ ...prev, color1: p.c1, color2: p.c2 }))}
                        className="w-8 h-8 rounded-full flex-shrink-0 ring-2 ring-white shadow-sm hover:scale-110 transition-transform"
                        style={{ background: `linear-gradient(135deg, ${p.c1}, ${p.c2})` }}
                        title={p.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Opção: Imagem (O Diferencial Viral) */}
              {backgroundConfig.type === 'image' && (
                <div className="space-y-4">
                  {!backgroundConfig.imageUrl ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => backgroundInputRef.current?.click()}
                      className="w-full h-24 border-dashed border-2 flex flex-col gap-2 hover:bg-gray-100"
                      disabled={isUploadingBg}
                    >
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-gray-500">Clique para enviar imagem de fundo</span>
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative h-32 rounded-lg overflow-hidden group">
                        <img src={backgroundConfig.imageUrl} className="w-full h-full object-cover" alt="bg-preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                           <Button type="button" size="sm" variant="secondary" onClick={() => backgroundInputRef.current?.click()}>Trocar</Button>
                           <Button type="button" size="sm" variant="destructive" onClick={() => removeBackgroundImage()}>Remover</Button>
                        </div>
                      </div>

                      {/* Sliders de Ajuste Fino */}
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-gray-600">Desfoque (Blur)</span>
                            <span className="text-purple-600">{backgroundConfig.imageBlur}px</span>
                          </div>
                          <input
                            type="range" min="0" max="20"
                            value={backgroundConfig.imageBlur}
                            onChange={(e) => setBackgroundConfig(prev => ({ ...prev, imageBlur: Number(e.target.value) }))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-gray-600">Opacidade</span>
                            <span className="text-purple-600">{backgroundConfig.imageOpacity}%</span>
                          </div>
                          <input
                            type="range" min="0" max="100"
                            value={backgroundConfig.imageOpacity}
                            onChange={(e) => setBackgroundConfig(prev => ({ ...prev, imageOpacity: Number(e.target.value) }))}
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <input ref={backgroundInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, true)} />
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6 rounded-xl shadow-lg shadow-purple-200 transition-all hover:scale-[1.02]"
          >
            {isLoading ? <span className="animate-pulse">Salvando...</span> : "✨ Salvar e Publicar"}
          </Button>
        </form>
      </div>

      {/* LADO DIREITO: O MOCKUP DE IPHONE (O Segredo Viral) */}
      <div className="flex-1 lg:min-w-[400px] flex flex-col items-center justify-start pt-4 lg:pt-0">
         <div className="sticky top-28 space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-2">
              <Smartphone className="w-4 h-4" />
              <span>Preview em tempo real</span>
            </div>

            {/* A Moldura do Celular */}
            <div className="relative w-[300px] h-[600px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl ring-4 ring-gray-100 transform transition-all hover:scale-[1.01]">
              {/* Botões laterais do iPhone */}
              <div className="absolute top-24 -left-1 w-1 h-8 bg-gray-700 rounded-l" />
              <div className="absolute top-36 -left-1 w-1 h-12 bg-gray-700 rounded-l" />
              <div className="absolute top-28 -right-1 w-1 h-16 bg-gray-700 rounded-r" />

              {/* Dynamic Island */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />

              {/* A Tela */}
              <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative"
                style={{
                    background: backgroundConfig.type === "color"
                      ? backgroundConfig.color1
                      : backgroundConfig.type === "gradient"
                      ? `linear-gradient(180deg, ${backgroundConfig.color1}, ${backgroundConfig.color2})`
                      : "#ffffff"
                }}
              >
                {/* Lógica de Background Image no Preview */}
                {backgroundConfig.type === 'image' && backgroundConfig.imageUrl && (
                   <div className="absolute inset-0 w-full h-full">
                      {backgroundConfig.style === 'full' ? (
                        <div className="w-full h-full" style={{
                          backgroundImage: `url(${backgroundConfig.imageUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          filter: `blur(${backgroundConfig.imageBlur}px)`,
                          opacity: backgroundConfig.imageOpacity / 100
                        }} />
                      ) : (
                        <>
                          <div className="h-40 w-full" style={{
                            backgroundImage: `url(${backgroundConfig.imageUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: `blur(${backgroundConfig.imageBlur}px)`,
                            opacity: backgroundConfig.imageOpacity / 100
                          }} />
                          <div className="absolute top-32 w-full h-16 bg-gradient-to-b from-transparent to-white/90" />
                        </>
                      )}
                   </div>
                )}

                {/* Conteúdo Simulado do Usuário */}
                <div className="relative z-10 flex flex-col items-center pt-16 px-6 h-full overflow-y-auto no-scrollbar">
                   {/* Avatar */}
                   <div className="mb-4 p-1 rounded-full shadow-lg" style={{ background: formData.accentColor }}>
                      <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-100 overflow-hidden relative">
                         {existingCustomizations?.profilePictureUrl ? (
                           <img src={existingCustomizations.profilePictureUrl} className="w-full h-full object-cover" />
                         ) : (
                           <UserPlaceholder />
                         )}
                      </div>
                   </div>

                   {/* Username e Bio */}
                   <div className="text-center w-full mb-8">
                     <div className="h-4 w-32 bg-black/10 rounded mx-auto mb-2 animate-pulse-slow backdrop-blur-sm" />
                     {formData.description ? (
                       <p className="text-xs text-gray-700 font-medium leading-relaxed bg-white/40 p-2 rounded-lg backdrop-blur-md shadow-sm border border-white/20">
                         {formData.description}
                       </p>
                     ) : (
                       <div className="h-2 w-48 bg-black/5 rounded mx-auto" />
                     )}
                   </div>

                   {/* Links Simulados */}
                   <div className="w-full space-y-3 pb-8">
                     {[1, 2, 3].map(i => (
                       <div key={i} className="w-full h-12 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm flex items-center justify-between px-4"
                            style={{ borderLeft: `4px solid ${formData.accentColor}` }}>
                         <span className="text-xs text-gray-500 font-medium">Link Exemplo {i}</span>
                         <div className="w-2 h-2 rounded-full bg-gray-200" />
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400">Mockup ilustrativo</p>
         </div>
      </div>
    </div>
  );
}

function UserPlaceholder() {
  return (
    <svg className="w-full h-full text-gray-300" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}