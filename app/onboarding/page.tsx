"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Rocket, User, Link as LinkIcon, CheckCircle2,
  ArrowRight, Copy, Check, Upload, X, Globe, ExternalLink,
  Sparkles, Share2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDebounce } from "../hooks/use-debounce";
import { FreelinnkLogo } from "@/components/onboarding/FreelinnkLogo";
import confetti from "canvas-confetti";
import { useUser } from "@clerk/nextjs";

type Step = "profile" | "username" | "link" | "success";

const STEPS: Record<Step, { num: number; total: number; label: string }> = {
  profile: { num: 1, total: 4, label: "Perfil" },
  username: { num: 2, total: 4, label: "Username" },
  link: { num: 3, total: 4, label: "Primeiro Link" },
  success: { num: 4, total: 4, label: "Pronto!" },
};

const triggerConfetti = () => {
  const duration = 3000;
  const end = Date.now() + duration;
  const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b"];

  (function frame() {
    confetti({ particleCount: 7, angle: 60, spread: 55, origin: { x: 0 }, colors });
    confetti({ particleCount: 7, angle: 120, spread: 55, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const [step, setStep] = useState<Step>("profile");
  const [loading, setLoading] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  const [isReady, setIsReady] = useState(false);
  const hasInitialized = useRef(false);

  // Form State
  const [username, setUsername] = useState("");
  const debouncedUsername = useDebounce(username, 500);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState<{ file: File | null; preview: string | null }>({
    file: null,
    preview: null,
  });
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Queries/Mutations
  const onboardingStatus = useQuery(api.onboarding.getOnboardingStatus, {});
  const checkAvailability = useQuery(
    api.lib.usernames.checkUsernameAvailability,
    debouncedUsername.length >= 3 ? { username: debouncedUsername } : "skip"
  );

  const setUsernameMutation = useMutation(api.lib.usernames.setUsername);
  const updateCustomizations = useMutation(api.lib.customizations.updateCustomizations);
  const generateUploadUrl = useMutation(api.lib.customizations.generateUploadUrl);
  const createLink = useMutation(api.lib.links.createLink);
  const updateStepMutation = useMutation(api.onboarding.updateOnboardingStep);
  const completeOnboardingMutation = useMutation(api.onboarding.completeOnboarding);

  const isUsernameValid = username.length >= 3 && checkAvailability?.available && /^[a-z0-9_.]+$/.test(username);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (onboardingStatus === undefined) return;
    if (onboardingStatus === null) return;

    if (onboardingStatus.completed === true) {
      router.replace("/dashboard");
      return;
    }

    if (!hasInitialized.current) {
      hasInitialized.current = true;

      const stepOrder: Step[] = ["profile", "username", "link", "success"];
      const currentStep = onboardingStatus.currentStep;

      if (currentStep && currentStep >= 1 && currentStep <= 4) {
        setStep(stepOrder[currentStep - 1]);
      }
      setIsReady(true);
    }
  }, [onboardingStatus, router]);

  useEffect(() => {
    if (isClerkLoaded && clerkUser) {
      if (!displayName) setDisplayName(clerkUser.fullName || "");
      if (!profileImage.preview && clerkUser.imageUrl) {
        setProfileImage((prev) => ({ ...prev, preview: clerkUser.imageUrl }));
      }
    }
  }, [isClerkLoaded, clerkUser, displayName, profileImage.preview]);

  useEffect(() => {
    return () => {
      if (profileImage.preview && profileImage.file) URL.revokeObjectURL(profileImage.preview);
    };
  }, [profileImage.preview, profileImage.file]);

  const handleProfileNext = async () => {
    setLoading(true);
    try {
      let profileStorageId = undefined;

      if (profileImage.file) {
        const uploadUrl = await generateUploadUrl({});
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": profileImage.file.type },
          body: profileImage.file,
        });
        const json = await res.json();
        profileStorageId = json.storageId;
      }

      await updateCustomizations({ description: bio, profilePictureStorageId: profileStorageId });
      await updateStepMutation({ step: 2 });
      setStep("username");
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar perfil.");
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameNext = async () => {
    if (!isUsernameValid) return toast.error("Por favor, escolha um username válido e disponível.");
    setLoading(true);
    try {
      await setUsernameMutation({ username });
      await updateStepMutation({ step: 3 });
      setStep("link");
    } catch (e: any) {
      toast.error(e.message || "Erro ao garantir o username.");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkNext = async () => {
    setLoading(true);
    try {
      if (linkTitle && linkUrl) {
        const finalUrl = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
        await createLink({ title: linkTitle, url: finalUrl, isFeatured: false, badgeType: undefined });
      }
      await updateStepMutation({ step: 4 });
      setStep("success");
      triggerConfetti();
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar link.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkipLink = async () => {
    setLoading(true);
    try {
      await updateStepMutation({ step: 4 });
      setStep("success");
      triggerConfetti();
    } catch (e: any) {
      toast.error(e.message || "Erro ao pular etapa.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinishOnboarding = async () => {
    setIsMarkingComplete(true);
    try {
      await completeOnboardingMutation({});
      toast.success("Bem-vindo ao FreeLinnk!");
      router.replace("/dashboard");
    } catch (e) {
      toast.error("Erro ao finalizar onboarding.");
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`freelinnk.com/${username}`);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    const url = `https://freelinnk.com/${username}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu FreeLinnk',
          text: 'Confira todos os meus links em um só lugar!',
          url: url,
        });
      } catch (err) {
        console.log('Erro ao compartilhar', err);
      }
    } else {
      copyToClipboard();
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  const currentStepInfo = STEPS[step];
  const isLinkReady = linkTitle && linkUrl && linkUrl.startsWith("http");
  const isLinkPartiallyFilled = !!(linkTitle || linkUrl) && !isLinkReady;

  const LinkPreviewCard = () => (
    <div className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
        <Globe className="w-6 h-6" />
      </div>
      <div className="flex-1 overflow-hidden">
        <h4 className="font-bold text-slate-900 truncate">{linkTitle || "Título do seu link"}</h4>
        <p className="text-xs text-slate-400 truncate tracking-tight">{linkUrl || "https://seulink.com"}</p>
      </div>
      <ExternalLink className="w-4 h-4 text-slate-300" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative">

        {/* Progress Navigation */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <FreelinnkLogo />
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                    currentStepInfo.num === num
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110"
                      : currentStepInfo.num > num
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-400"
                  )}
                >
                  {currentStepInfo.num > num ? <Check className="w-4 h-4" /> : num}
                </div>
                {num < 4 && (
                  <div
                    className={cn(
                      "w-4 sm:w-8 h-0.5 mx-1 rounded-full bg-slate-100",
                      currentStepInfo.num > num && "bg-emerald-500"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Content */}
        <div className="p-8 pb-12">
          <AnimatePresence mode="wait">

            {/* STEP 1: PROFILE */}
            {step === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">👋 Qual é o seu nome?</h1>
                  <p className="text-slate-500 text-lg">Vamos começar com o básico. Como as pessoas conhecem você?</p>
                </div>

                <div className="space-y-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                      <div
                        className="w-32 h-32 rounded-full border-4 border-slate-50 bg-slate-100 flex items-center justify-center overflow-hidden shadow-inner cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {profileImage.preview ? (
                          <img src={profileImage.preview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <Upload className="w-8 h-8 text-slate-400" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setProfileImage({ file: f, preview: URL.createObjectURL(f) });
                        }}
                      />
                      {profileImage.preview && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfileImage({ file: null, preview: null });
                          }}
                          className="absolute -top-1 -right-1 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <span className="text-xs font-medium text-slate-400">Foto de perfil (Opcional)</span>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-bold text-slate-700 mb-2 block ml-1">Nome de exibição</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Seu nome ou marca"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 h-16 font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="flex items-center justify-between text-sm font-bold text-slate-700 mb-2 px-1">
                        Bio <span className="text-slate-400 font-normal">Opcional - {bio.length}/150</span>
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value.slice(0, 150))}
                        placeholder="Conte um pouco sobre você ou seu negócio em uma frase..."
                        rows={2}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleProfileNext}
                  disabled={loading || !displayName}
                  className="w-full h-16 bg-slate-900 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Continuar"
                  )}{" "}
                  <ArrowRight className="w-6 h-6" />
                </button>
              </motion.div>
            )}

            {/* STEP 2: USERNAME */}
            {step === "username" && (
              <motion.div
                key="username"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">🎯 Seu link exclusivo</h1>
                  <p className="text-slate-500 text-lg">Como você quer ser encontrado na internet?</p>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 block ml-1">Escolha seu endereço</label>
                  <div
                    className={cn(
                      "flex items-center bg-slate-50 border-2 rounded-2xl transition-all h-16 px-4 group",
                      username.length >= 3
                        ? isUsernameValid
                          ? "border-emerald-500 bg-emerald-50/30"
                          : "border-red-500 bg-red-50/30"
                        : "border-slate-100 focus-within:border-indigo-500 focus-within:bg-white"
                    )}
                  >
                    <span className="text-slate-400 font-bold select-none pr-1">freelinnk.com/</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""))}
                      placeholder="seuusername"
                      className="flex-1 bg-transparent font-black text-slate-900 text-xl outline-none placeholder:text-slate-300 w-full"
                      autoFocus
                    />
                    <div className="flex items-center justify-center w-8 h-8 shrink-0">
                      {loading && <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />}
                      {!loading && username.length >= 3 && (
                        isUsernameValid
                          ? <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                          : <X className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                  </div>

                  <div className="px-1 text-sm font-medium h-6">
                    {username.length > 0 && username.length < 3 && (
                      <p className="text-slate-400">Pelo menos 3 caracteres</p>
                    )}
                    {username.length >= 3 && checkAvailability && (
                      <p className={checkAvailability.available ? "text-emerald-600" : "text-red-500"}>
                        {checkAvailability.available ? "🎉 Nome disponível!" : "Já está em uso, tente outro"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-3 text-indigo-700">
                  <Rocket className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium leading-relaxed">
                    Esse será o seu link público único. Perfis com links simples e fáceis de ler recebem mais visitas!
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep("profile")}
                    className="flex-1 h-16 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleUsernameNext}
                    disabled={!isUsernameValid || loading}
                    className="flex-[2] h-16 bg-slate-900 hover:bg-slate-800 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:grayscale shadow-xl shadow-slate-200"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Reservar Link"
                    )}{" "}
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: LINK */}
            {step === "link" && (
              <motion.div
                key="link"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">🔗 Adicione seu primeiro link</h1>
                  <p className="text-slate-500 text-lg">Perfis com pelo menos um link configurado têm 3x mais cliques e engajamento. <span className="text-sm bg-slate-100 px-2 py-1 rounded-md ml-1 font-medium">Opcional</span></p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-bold text-slate-700 mb-2 block ml-1">Título do link</label>
                      <input
                        type="text"
                        value={linkTitle}
                        onChange={(e) => setLinkTitle(e.target.value)}
                        placeholder="Ex: Meu Instagram, WhatsApp..."
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 h-14 font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-700 mb-2 block ml-1">URL de destino</label>
                      <input
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://instagram.com/seuuser"
                        className={cn(
                          "w-full bg-slate-50 border-2 rounded-2xl px-6 h-14 font-bold text-slate-900 outline-none transition-all",
                          linkUrl && !linkUrl.startsWith("http")
                            ? "border-red-200 focus:border-red-500"
                            : "border-slate-100 focus:border-indigo-500 focus:bg-white"
                        )}
                      />
                      {linkUrl && !linkUrl.startsWith("http") && (
                        <p className="text-xs text-red-500 mt-1.5 font-bold ml-1">
                          Insira uma URL válida (começando com https://)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                      Preview em tempo real
                    </label>
                    <div className="bg-slate-50 rounded-3xl p-6 border-2 border-dashed border-slate-200 flex flex-col items-center">
                      <LinkPreviewCard />
                      <div className="mt-4 flex gap-3 opacity-30 grayscale pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-indigo-100" />
                        <div className="w-10 h-10 rounded-full bg-indigo-100" />
                        <div className="w-10 h-10 rounded-full bg-indigo-100" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <button
                    onClick={isLinkReady ? handleLinkNext : handleSkipLink}
                    disabled={loading || isLinkPartiallyFilled}
                    className={cn(
                      "w-full h-16 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50",
                      isLinkReady
                        ? "bg-slate-900 shadow-xl shadow-slate-200 hover:bg-slate-800"
                        : "bg-slate-300 hover:bg-slate-400 text-slate-600"
                    )}
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      isLinkReady ? "Adicionar e continuar" : "Pular sem link"
                    )}
                    {isLinkReady && <ArrowRight className="w-6 h-6" />}
                  </button>
                  {isLinkPartiallyFilled && (
                    <p className="text-center text-sm text-slate-500">
                      Preencha o título e a URL correta, ou apague os campos para pular.
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8 text-center"
              >
                <div className="space-y-2">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">🚀 Tudo pronto! 🎊</h1>
                  <p className="text-slate-500 text-lg">Seu perfil FreeLinnk já está disponível para o mundo.</p>
                </div>

                <div className="flex justify-center perspective-1000">
                  <motion.div
                    initial={{ rotateY: 15, rotateX: 5 }}
                    animate={{ rotateY: 0, rotateX: 0 }}
                    className="w-64 bg-white rounded-[2.5rem] p-4 shadow-2xl border-8 border-slate-900 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-indigo-500/10 to-transparent" />
                    <div className="flex flex-col items-center pt-4 relative z-10">
                      <div className="w-20 h-20 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-lg mb-3">
                        {profileImage.preview ? (
                          <img src={profileImage.preview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                            <User className="w-10 h-10 text-indigo-300" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-black text-slate-900 text-sm truncate w-full px-2">
                        {displayName || "Seu Nome"}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-medium line-clamp-2 px-4 mt-1 min-h-[1.5rem]">
                        {bio || "Sua bio profissional"}
                      </p>

                      <div className="w-full space-y-2 mt-6">
                        <div className="w-full h-8 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-slate-400">
                            {linkTitle || "Seu primeiro link"}
                          </span>
                        </div>
                        <div className="w-full h-8 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center opacity-50">
                          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                        </div>
                      </div>

                      <div className="mt-8 flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100" />
                        <div className="w-6 h-6 rounded-full bg-slate-100" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="bg-indigo-50 rounded-2xl p-6 space-y-4">
                  <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">SEU LINK EXCLUSIVO</p>
                  <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                    <span className="flex-1 font-black text-indigo-600 text-lg sm:text-xl truncate text-left">
                      freelinnk.com/{username}
                    </span>
                    <button
                      onClick={copyToClipboard}
                      className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center hover:bg-indigo-200 transition-all active:scale-90 shrink-0"
                      title="Copiar link"
                    >
                      {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={shareLink}
                    className="w-full h-16 bg-slate-100 text-slate-900 font-black text-lg rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-all"
                  >
                    <Share2 className="w-5 h-5" /> Compartilhar
                  </button>
                  <button
                    onClick={handleFinishOnboarding}
                    disabled={isMarkingComplete}
                    className="w-full h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
                  >
                    {isMarkingComplete ? "Processando..." : "Ir pro Dashboard"}{" "}
                    <Sparkles className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}