"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Palette, Upload, X, Image as ImageIcon, Paintbrush, ImagePlus, Layout } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function CustomizationForm() {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const updateCustomizations = useMutation(
    api.lib.customizations.updateCustomizations,
  );
  const generateUploadUrl = useMutation(
    api.lib.customizations.generateUploadUrl,
  );
  const removeProfilePicture = useMutation(
    api.lib.customizations.removeProfilePicture,
  );

  const existingCustomizations = useQuery(
    api.lib.customizations.getUserCustomizations,
    user ? { userId: user.id } : "skip",
  );

  const [formData, setFormData] = useState({
    description: "",
    accentColor: "#6366f1",
  });

  // Estado para configurações de background (localStorage)
  const [backgroundConfig, setBackgroundConfig] = useState({
    type: "color" as "color" | "gradient" | "image",
    style: "full" as "full" | "header", // full = fundo completo, header = apenas capa
    color1: "#f3f4f6",
    color2: "#e5e7eb",
    imageUrl: "",
    imageBlur: 0,
    imageOpacity: 100,
  });

  const [isLoading, startTransition] = useTransition();
  const [isUploading, startUploading] = useTransition();
  const [isUploadingBg, startUploadingBg] = useTransition();

  useEffect(() => {
    if (existingCustomizations) {
      setFormData({
        description: existingCustomizations.description || "",
        accentColor: existingCustomizations.accentColor || "#6366f1",
      });
    }

    // Carregar configurações de background do localStorage
    if (user) {
      const savedBg = localStorage.getItem(`bgConfig_${user.id}`);
      if (savedBg) {
        // === CORREÇÃO PREVENTIVA APLICADA AQUI ===
        try {
          const loadedConfig = JSON.parse(savedBg);
          // Mescla as configs salvas com as padrões
          setBackgroundConfig(prevConfig => ({
            ...prevConfig,
            ...loadedConfig,
          }));
        } catch (e) {
          console.error("Erro ao carregar configurações:", e);
        }
      }
    }
  }, [existingCustomizations, user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    startTransition(async () => {
      try {
        await updateCustomizations({
          description: formData.description || undefined,
          accentColor: formData.accentColor || undefined,
        });

        // Salvar configurações de background
        localStorage.setItem(`bgConfig_${user.id}`, JSON.stringify(backgroundConfig));

        toast.success("Personalizações salvas com sucesso!");
      } catch (error) {
        console.error("Falha ao salvar personalizações:", error);
        toast.error("Falha ao salvar personalizações");
      }
    });
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("O tamanho do arquivo deve ser inferior a 5 MB");
      return;
    }

    startUploading(async () => {
      try {
        const uploadUrl = await generateUploadUrl();

        const uploadResult = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!uploadResult.ok) {
          throw new Error("Falha no upload da imagem.");
        }

        const { storageId } = await uploadResult.json();

        await updateCustomizations({
          profilePictureStorageId: storageId,
          description: formData.description || undefined,
          accentColor: formData.accentColor || undefined,
        });

        toast.success("Foto do perfil atualizada com sucesso!");
      } catch (error) {
        console.error("Falha ao carregar a imagem:", error);
        toast.error("Falha ao carregar a imagem");
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    });
  };

  const handleBackgroundUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem");
      return;
    }

    // Limite maior para imagem de fundo
    if (file.size > 10 * 1024 * 1024) {
      toast.error("O tamanho do arquivo deve ser inferior a 10 MB");
      return;
    }

    startUploadingBg(async () => {
      try {
        // Converter para base64 para armazenar no localStorage
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;

          // Comprimir/redimensionar se necessário
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Redimensionar para no máximo 1920px de largura
            const maxWidth = 1920;
            const scale = img.width > maxWidth ? maxWidth / img.width : 1;
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Converter para JPEG com qualidade reduzida para economizar espaço
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);

            setBackgroundConfig(prev => ({
              ...prev,
              type: 'image',
              imageUrl: compressedBase64
            }));

            toast.success("Imagem de fundo carregada!");
          };
          img.src = base64;
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Erro ao processar imagem:", error);
        toast.error("Erro ao processar imagem");
      } finally {
        if (backgroundInputRef.current) {
          backgroundInputRef.current.value = "";
        }
      }
    });
  };

  const handleRemoveImage = async () => {
    startTransition(async () => {
      try {
        await removeProfilePicture();
        toast.success("Foto de perfil removida com sucesso!");
      } catch (error) {
        console.error("Falha ao remover a imagem:", error);
        toast.error("Falha ao remover a imagem");
      }
    });
  };

  const handleRemoveBackgroundImage = () => {
    setBackgroundConfig(prev => ({
      ...prev,
      type: 'color',
      imageUrl: ''
    }));
    toast.success("Imagem de fundo removida!");
 };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBgConfigChange = (field: string, value: string | number) => {
    setBackgroundConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const gradientPresets = [
    { name: "Oceano", color1: "#0093E9", color2: "#80D0C7" },
    { name: "Sunset", color1: "#FA8BFF", color2: "#2BD2FF" },
    { name: "Roxo", color1: "#8EC5FC", color2: "#E0C3FC" },
    { name: "Aurora", color1: "#00DBDE", color2: "#FC00FF" },
    { name: "Pêssego", color1: "#FFDEE9", color2: "#B5FFFC" },
    { name: "Lavanda", color1: "#E8D8FF", color2: "#FFDDF4" },
  ];

  return (
    <div className="w-full bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl shadow-gray-200/50">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
    S       <h2 className="text-xl font-semibold text-gray-900">
              Personalize sua página
            </h2>
            <p className="text-gray-600 text-sm">
              Personalize com foto, descrição, cores e imagem de fundo ou capa.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Foto de perfil */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Foto de perfil
          </Label>

          {existingCustomizations?.profilePictureUrl && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 rounded-lg overflow-hidden">
                <Image
                  src={existingCustomizations.profilePictureUrl}
                  alt="Foto de perfil atual"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700 font-medium">
                  Foto de perfil atual
                </p>
                <p className="text-xs text-gray-500">
                  Clique “Remover” para apagar
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemoveImage}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1" />
                Remover
              </Button>
            </div>
          )}

          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? "Enviando..." : "Carregar nova imagem"}
            </Button>
            <p className="text-sm text-gray-500">
              Máximo de 5 MB
            </p>
          </div>
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <textarea
            id="description"
            placeholder="Conte aos visitantes sobre você..."
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
            maxLength={200}
          />
          <p className="text-sm text-gray-500">
            {formData.description.length}/200 caracteres
          </p>
        </div>

        {/* Cor de destaque */}
        <div className="space-y-3">
          <Label htmlFor="accentColor">Cor de destaque</Label>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <input
                id="accentColor"
                type="color"
                value={formData.accentColor}
                onChange={(e) =>
                  handleInputChange("accentColor", e.target.value)
                }
                className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
              />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Escolha a cor da sua marca
                </p>
                <p className="text-xs text-gray-500">{formData.accentColor}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Configuração de Background */}
        <div className="space-y-4 border-t pt-6">
          <Label>Visual de Fundo</Label>

          {/* Seletor de tipo */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleBgConfigChange("type", "color")}
              className={`p-3 rounded-lg border-2 transition-all ${
                backgroundConfig.type === "color"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <Paintbrush className={`w-5 h-5 mx-auto mb-1 ${
                backgroundConfig.type === "color" ? "text-purple-600" : "text-gray-600"
              }`} />
              <span className={`text-xs ${
                backgroundConfig.type === "color" ? "text-purple-700 font-semibold" : "text-gray-700"
              }`}>
                Cor
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleBgConfigChange("type", "gradient")}
              className={`p-3 rounded-lg border-2 transition-all ${
                backgroundConfig.type === "gradient"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <Layout className={`w-5 h-5 mx-auto mb-1 ${
                backgroundConfig.type === "gradient" ? "text-purple-600" : "text-gray-600"
              }`} />
              <span className={`text-xs ${
                backgroundConfig.type === "gradient" ? "text-purple-700 font-semibold" : "text-gray-700"
              }`}>
                Gradiente
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleBgConfigChange("type", "image")}
              className={`p-3 rounded-lg border-2 transition-all ${
                backgroundConfig.type === "image"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <ImagePlus className={`w-5 h-5 mx-auto mb-1 ${
                backgroundConfig.type === "image" ? "text-purple-600" : "text-gray-600"
              }`} />
              <span className={`text-xs ${
                backgroundConfig.type === "image" ? "text-purple-700 font-semibold" : "text-gray-700"
              }`}>
                Imagem
              </span>
            </button>
          </div>

          {/* Configurações específicas de cada tipo */}
          {backgroundConfig.type === "color" && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={backgroundConfig.color1}
                  onChange={(e) => handleBgConfigChange("color1", e.target.value)}
                  className="w-10 h-10 rounded border-2 border-gray-300 cursor-pointer"
                />
                <div>
                  <p className="text-sm font-medium">Cor de Fundo</p>
                  <p className="text-xs text-gray-500">{backgroundConfig.color1}</p>
                </div>
              </div>
            </div>
          )}

          {backgroundConfig.type === "gradient" && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label className="text-sm">Cor Inicial</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={backgroundConfig.color1}
                      onChange={(e) => handleBgConfigChange("color1", e.target.value)}
                      className="w-10 h-10 rounded border-2 border-gray-300 cursor-pointer"
                    />
                    <span className="text-xs text-gray-500">{backgroundConfig.color1}</span>
                  </div>
                </div>
                <div className="flex-1">
               <Label className="text-sm">Cor Final</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={backgroundConfig.color2}
                      onChange={(e) => handleBgConfigChange("color2", e.target.value)}
                      className="w-10 h-10 rounded border-2 border-gray-300 cursor-pointer"
                    />
                    <span className="text-xs text-gray-500">{backgroundConfig.color2}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {gradientPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      handleBgConfigChange("color1", preset.color1);
                      handleBgConfigChange("color2", preset.color2);
                    }}
                    className="h-10 rounded-lg border-2 border-gray-200 hover:border-purple-500 transition-all relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${preset.color1}, ${preset.color2})`
                    }}
                  >
                    <span className="text-[10px] text-white font-medium drop-shadow-md">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {backgroundConfig.type === "image" && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              {/* Estilo da imagem */}
              <div className="space-y-2">
                <Label className="text-sm">Estilo da Imagem</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleBgConfigChange("style", "full")}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                      backgroundConfig.style === "full"
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    Fundo Completo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBgConfigChange("style", "header")}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                      backgroundConfig.style === "header"
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    Apenas Capa
                  </button>
                </div>
              </div>

              {backgroundConfig.imageUrl && (
                <div className="relative rounded-lg overflow-hidden h-32">
                  <img
                    src={backgroundConfig.imageUrl}
                    alt="Background"
                    className="w-full h-full object-cover"
                     style={{
                      filter: `blur(${backgroundConfig.imageBlur}px)`,
                      opacity: backgroundConfig.imageOpacity / 100
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveBackgroundImage}
                    className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remover
                  </Button>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <input
                    ref={backgroundInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundUpload}
                    className="hidden"
                    disabled={isUploadingBg}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => backgroundInputRef.current?.click()}
                    disabled={isUploadingBg}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                   {isUploadingBg ? "Enviando..." : "Carregar Imagem"}
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo 10MB. Recomendado: 1920x1080px
                  </p>
                </div>

                {backgroundConfig.imageUrl && (
                  <>
                    <div>
                      <Label className="text-sm">Desfoque</Label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={backgroundConfig.imageBlur}
                       onChange={(e) => handleBgConfigChange("imageBlur", parseInt(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-500">{backgroundConfig.imageBlur}px</span>
                    </div>

                    <div>
                      <Label className="text-sm">Opacidade</Label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={backgroundConfig.imageOpacity}
                        onChange={(e) => handleBgConfigChange("imageOpacity", parseInt(e.target.value))}
                       className="w-full"
                      />
                      <span className="text-xs text-gray-500">{backgroundConfig.imageOpacity}%</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm">Preview</Label>
            <div
              className="h-48 rounded-lg border-2 border-gray-300 overflow-hidden relative"
              style={{
                background: backgroundConfig.type === "color"
                  ? backgroundConfig.color1
                  : backgroundConfig.type === "gradient"
                  ? `linear-gradient(135deg, ${backgroundConfig.color1}, ${backgroundConfig.color2})`
                  : backgroundConfig.imageUrl ? 'transparent' : '#f3f4f6'
              }}
            >
              {backgroundConfig.type === "image" && backgroundConfig.imageUrl && (
                <>
                  {backgroundConfig.style === "full" ? (
                    <img
                      src={backgroundConfig.imageUrl}
                     alt="Preview"
                      className="w-full h-full object-cover absolute inset-0"
                      style={{
                        filter: `blur(${backgroundConfig.imageBlur}px)`,
                     opacity: backgroundConfig.imageOpacity / 100
                      }}
                    />
                  ) : (
                    <>
                      <div
                        className="absolute top-0 left-0 right-0 h-24"
                        style={{
                          background: `url(${backgroundConfig.imageUrl}) center/cover`,
                         filter: `blur(${backgroundConfig.imageBlur}px)`,
                          opacity: backgroundConfig.imageOpacity / 100
                        }}
                     />
                      <div className="absolute bottom-0 left-0 right-0 h-24 bg-white/90" />
                    </>
                  )}
                </>
              )}

              <div className="absolute inset-0 flex items-center justify-center">
Note             <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full"
                    style={{ background: formData.accentColor }}
                    />
                    <div>
                      <div className="h-2 w-20 bg-gray-300 rounded mb-1" />
                      <div className="h-2 w-24 bg-gray-200 rounded" />
                </div>
                  </div>
                  <div className="mt-3 space-y-1">
                <div className="h-6 bg-gray-200 rounded" />
                    <div className="h-6 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="pt-4">
          <Button
            type="submit"
           disabled={isLoading || isUploading || isUploadingBg}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isLoading ? "Salvando..." : "Salvar personalizações"}
          </Button>
        </div>
      </form>
    </div>
  );
}