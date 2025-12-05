"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
   ArrowRight, Check, Rocket,
  User, Link as LinkIcon, Image as ImageIcon,
  Camera, Upload, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(1);

  // Dados do formulário
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  // Convex
  const currentSlug = useQuery(
    api.lib.usernames.getUserSlug,
    user ? { userId: user.id } : "skip"
  );
  const availabilityCheck = useQuery(
    api.lib.usernames.checkUsernameAvailability,
    username.length >= 3 ? { username: username.toLowerCase() } : "skip"
  );

  const setUsernameMutation = useMutation(api.lib.usernames.setUsername);
  const updateCustomizations = useMutation(api.lib.customizations.updateCustomizations);
  const generateUploadUrl = useMutation(api.lib.customizations.generateUploadUrl);
  const createLink = useMutation(api.lib.links.createLink);

  // Validações
  const isUsernameValid = username.length >= 3 && availabilityCheck?.available;
  const isDescriptionValid = description.length >= 10 && description.length <= 160;
  const isLinkValid = linkTitle.length >= 3 && linkUrl.length >= 5;

  // Handlers
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem muito grande (máx 5MB)");
        return;
      }
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const normalizeUrl = (url: string): string => {
    const formatted = url.trim();
    if (formatted && !/^(https?:\/\/|mailto:|tel:)/i.test(formatted)) {
      return `https://${formatted}`;
    }
    return formatted;
  };

  // Step 1: Username
  const handleStep1 = async () => {
    if (!isUsernameValid || !user) return;

    try {
      const result = await setUsernameMutation({ username: username.toLowerCase() });
      if (result.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast.success("Username configurado! ✅");
        setStep(2);
      } else {
        toast.error(result.error || "Erro ao salvar username");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar. Tente novamente.");
    }
  };

  // Step 2: Perfil
  const handleStep2 = async () => {
    if (!isDescriptionValid || !user) return;

    try {
      let storageId = undefined;

      // Upload da imagem se existir
      if (profileImage) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": profileImage.type },
          body: profileImage,
        });

        if (result.ok) {
          const data = await result.json();
          storageId = data.storageId;
        }
      }

      await updateCustomizations({
        description: description.trim(),
        ...(storageId && { profilePictureStorageId: storageId }),
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success("Perfil configurado! 📸");
      setStep(3);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar perfil");
    }
  };

  // Step 3: Primeiro Link
  const handleStep3 = async () => {
    if (!isLinkValid || !user) return;

    try {
      await createLink({
        title: linkTitle.trim(),
        url: normalizeUrl(linkUrl),
      });

      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 }
      });

      toast.success("Pronto! Seu link está no ar! 🎉");

      // Marca como completo
      localStorage.setItem("onboarding_completed", "true");

      // Redireciona para o dashboard
      setTimeout(() => {
        router.push("/dashboard?welcome=true");
      }, 1500);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar link");
    }
  };

  // Se já tem username configurado, redireciona
  useEffect(() => {
    if (currentSlug && step === 1) {
      setStep(2);
    }
  }, [currentSlug, step]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Decoração de fundo */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

      {/* Card Principal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 sm:p-12"
      >

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-bold text-gray-900">Passo {step} de 3</span>
            <span className="text-sm font-bold text-purple-600">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* STEP 1: USERNAME */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <User className="w-8 h-8 text-purple-600" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
                  Escolha seu nome único
                </h1>
                <p className="text-gray-600 text-lg">
                  Será sua identidade no Freelinnk
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 font-semibold mb-2 block">
                    Seu Username
                  </Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm pointer-events-none">
                      freelinnk.com/
                    </div>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      placeholder="seu-nome"
                      className="pl-[140px] h-14 text-lg font-medium"
                      autoFocus
                    />
                    {username.length >= 3 && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {availabilityCheck?.available ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>

                  {username.length >= 3 && (
                    <p className={`text-sm mt-2 ${availabilityCheck?.available ? 'text-green-600' : 'text-red-600'}`}>
                      {availabilityCheck?.available ? '✓ Disponível!' : '✗ Já está em uso'}
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Dica:</strong> Escolha algo curto e fácil de lembrar.
                    Você pode alterar depois, mas seus links antigos não redirecionarão.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleStep1}
                disabled={!isUsernameValid}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Continuar <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* STEP 2: PERFIL */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <Camera className="w-8 h-8 text-purple-600" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
                  Mostre quem você é
                </h1>
                <p className="text-gray-600 text-lg">
                  Adicione uma foto e uma bio
                </p>
              </div>

              <div className="space-y-6">
                {/* Upload de foto */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-xl">
                      {profileImagePreview ? (
                        <img src={profileImagePreview} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => document.getElementById('profile-upload')?.click()}
                      className="absolute bottom-0 right-0 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </div>
                  <p className="text-sm text-gray-500">Clique no botão para adicionar uma foto</p>
                </div>

                {/* Bio */}
                <div>
                  <Label className="text-gray-700 font-semibold mb-2 block">
                    Sua Bio (Apresentação)
                  </Label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Criador de conteúdo ajudando marcas a crescerem 🚀"
                    className="w-full h-28 p-4 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none resize-none"
                  />
                  <div className="flex justify-between mt-2">
                    <p className={`text-sm ${description.length < 10 ? 'text-red-500' : description.length > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                      {description.length < 10 ? 'Mínimo 10 caracteres' : 'Perfeito!'}
                    </p>
                    <span className="text-sm text-gray-400">{description.length}/160</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 h-14"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleStep2}
                  disabled={!isDescriptionValid}
                  className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Continuar <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PRIMEIRO LINK */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <LinkIcon className="w-8 h-8 text-purple-600" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
                  Adicione seu primeiro link
                </h1>
                <p className="text-gray-600 text-lg">
                  Pode ser seu Instagram, WhatsApp, loja...
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 font-semibold mb-2 block">
                    Título do Link
                  </Label>
                  <Input
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    placeholder="Ex: Meu Instagram, WhatsApp, Loja..."
                    className="h-14 text-lg"
                  />
                </div>

                <div>
                  <Label className="text-gray-700 font-semibold mb-2 block">
                    URL de Destino
                  </Label>
                  <Input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://instagram.com/seu-perfil"
                    className="h-14 text-lg"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Se não colocar https://, adicionamos automaticamente
                  </p>
                </div>

                {/* Preview do botão */}
                {linkTitle && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-2">Prévia:</p>
                    <div className="w-full bg-purple-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-between">
                      <span>{linkTitle}</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1 h-14"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleStep3}
                  disabled={!isLinkValid}
                  className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Finalizar <Rocket className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Levará menos de 60 segundos • Você pode editar tudo depois
          </p>
        </div>

      </motion.div>
    </div>
  );
}