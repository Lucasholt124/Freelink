"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Palette, Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function CustomizationForm() {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    accentColor: "#6366f1", //Índigo padrão
  });

  const [isLoading, startTransition] = useTransition();
  const [isUploading, startUploading] = useTransition();

 // Atualizar dados do formulário quando as personalizações existentes forem carregadas
  useEffect(() => {
    if (existingCustomizations) {
      setFormData({
        description: existingCustomizations.description || "",
        accentColor: existingCustomizations.accentColor || "#6366f1",
      });
    }
  }, [existingCustomizations]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    startTransition(async () => {
      try {
        await updateCustomizations({
          description: formData.description || undefined,
          accentColor: formData.accentColor || undefined,
        });

        toast.success("Personalizações salvas com sucesso!");
      } catch (error) {
        console.error("Falha ao salvar personalizações:", error);
        toast.error("Falha ao salvar personalizações:");
      }
    });
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("O tamanho do arquivo deve ser inferior a 5 MB");
      return;
    }

    startUploading(async () => {
      try {
        // Obter URL de upload
        const uploadUrl = await generateUploadUrl();

       // Carregar arquivo
        const uploadResult = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!uploadResult.ok) {
          throw new Error("Falha no upload da imagem.");
        }

        const { storageId } = await uploadResult.json();

        // Atualizar personalizações com novo ID de armazenamento
        await updateCustomizations({
          profilePictureStorageId: storageId,
          description: formData.description || undefined,
          accentColor: formData.accentColor || undefined,
        });

        toast.success("Foto do perfil atualizada com sucesso!");
      } catch (error) {
        console.error("Falha ao carregar a imagem:", error);
        toast.error("Falha ao carregar a imagem:");
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
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
        toast.error("Falha ao remover a imagem:");
      }
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="w-full bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-xl shadow-gray-200/50">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
             Personalize sua página
            </h2>
            <p className="text-gray-600 text-sm">
              Personalize sua página de links públicos com foto de perfil,
descrição e cor de destaque personalizadas.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/*Carregar foto de perfil */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Foto de perfil
          </Label>

          {/* Current Image Display */}
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
                  Clique &ldquo;Remover&rdquo; para apagar esta imagem
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

          {/* Upload de arquivo */}
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
              Máximo de 5 MB. Suporta JPG, PNG, GIF, WebP
            </p>
          </div>
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <Label htmlFor="Descrição">Descrição</Label>
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

        {/* Seletor de cores de destaque */}
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
          <p className="text-sm text-gray-500">
            Esta cor será usada como um destaque no cabeçalho da sua página
          </p>
        </div>

        {/* Botão Salva */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isLoading || isUploading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isLoading ? "Salvando..." : "Salvar personalizações"}
          </Button>
        </div>
      </form>
    </div>
  );
}