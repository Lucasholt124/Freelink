"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Check,
  Link as LinkIcon,
  User,
  Palette,
  Layout,

  Loader2,
  Sparkles,
  Plus,
  Trash2,
  ArrowRight,
  Zap,

  Star,
  Heart,

  X,
  Smartphone,
  Eye,
  ChevronLeft,
  Wand2,
  Rocket,
  PartyPopper,
  Camera,
  Type,

  CheckCircle2,
  AlertCircle,

} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  FaInstagram,
  FaWhatsapp,
  FaTiktok,
  FaYoutube,
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaGlobe,
  FaSpotify,
  FaTelegram,
  FaDiscord,
  FaPinterest,
  FaTwitch,
  FaFacebook
} from "react-icons/fa6";

// --- TIPOS ---
type Step = "username" | "links" | "identity" | "style";

interface LinkItem {
  id: string;
  title: string;
  url: string;
}

// --- TEMAS DISPONÍVEIS (EXPANDIDO) ---
const THEMES = [
  {
    name: "Clean",
    emoji: "⚪",
    bg: "bg-slate-50",
    bgHex: "#f8fafc",
    btn: "bg-slate-900",
    btnHex: "#0f172a",
    text: "text-slate-900",
    textMuted: "text-slate-500",
    preview: "from-slate-100 to-slate-200",
    popular: true
  },
  {
    name: "Midnight",
    emoji: "🌙",
    bg: "bg-slate-950",
    bgHex: "#020617",
    btn: "bg-white",
    btnHex: "#ffffff",
    text: "text-white",
    textMuted: "text-slate-400",
    preview: "from-slate-900 to-slate-800"
  },
  {
    name: "Roxo",
    emoji: "💜",
    bg: "bg-purple-50",
    bgHex: "#faf5ff",
    btn: "bg-purple-600",
    btnHex: "#9333ea",
    text: "text-purple-900",
    textMuted: "text-purple-500",
    preview: "from-purple-100 to-purple-200"
  },
  {
    name: "Sunset",
    emoji: "🌅",
    bg: "bg-orange-50",
    bgHex: "#fff7ed",
    btn: "bg-gradient-to-r from-orange-500 to-pink-500",
    btnHex: "#f97316",
    text: "text-orange-900",
    textMuted: "text-orange-500",
    preview: "from-orange-100 to-pink-100"
  },
  {
    name: "Ocean",
    emoji: "🌊",
    bg: "bg-cyan-50",
    bgHex: "#ecfeff",
    btn: "bg-gradient-to-r from-cyan-500 to-blue-500",
    btnHex: "#06b6d4",
    text: "text-cyan-900",
    textMuted: "text-cyan-500",
    preview: "from-cyan-100 to-blue-100"
  },
  {
    name: "Forest",
    emoji: "🌲",
    bg: "bg-emerald-50",
    bgHex: "#ecfdf5",
    btn: "bg-gradient-to-r from-emerald-500 to-teal-500",
    btnHex: "#10b981",
    text: "text-emerald-900",
    textMuted: "text-emerald-500",
    preview: "from-emerald-100 to-teal-100"
  },
  {
    name: "Neon",
    emoji: "💖",
    bg: "bg-fuchsia-950",
    bgHex: "#4a044e",
    btn: "bg-gradient-to-r from-fuchsia-500 to-pink-500",
    btnHex: "#d946ef",
    text: "text-white",
    textMuted: "text-fuchsia-300",
    preview: "from-fuchsia-900 to-pink-900"
  },
  {
    name: "Gold",
    emoji: "✨",
    bg: "bg-amber-50",
    bgHex: "#fffbeb",
    btn: "bg-gradient-to-r from-amber-500 to-yellow-500",
    btnHex: "#f59e0b",
    text: "text-amber-900",
    textMuted: "text-amber-600",
    preview: "from-amber-100 to-yellow-100"
  },
  {
    name: "Rose",
    emoji: "🌸",
    bg: "bg-rose-50",
    bgHex: "#fff1f2",
    btn: "bg-gradient-to-r from-rose-500 to-pink-500",
    btnHex: "#f43f5e",
    text: "text-rose-900",
    textMuted: "text-rose-500",
    preview: "from-rose-100 to-pink-100"
  },
  {
    name: "Lavender",
    emoji: "💐",
    bg: "bg-violet-50",
    bgHex: "#f5f3ff",
    btn: "bg-gradient-to-r from-violet-500 to-purple-500",
    btnHex: "#8b5cf6",
    text: "text-violet-900",
    textMuted: "text-violet-500",
    preview: "from-violet-100 to-purple-100"
  },
  {
    name: "Coral",
    emoji: "🪸",
    bg: "bg-red-50",
    bgHex: "#fef2f2",
    btn: "bg-gradient-to-r from-red-400 to-orange-400",
    btnHex: "#f87171",
    text: "text-red-900",
    textMuted: "text-red-500",
    preview: "from-red-100 to-orange-100"
  },
  {
    name: "Sky",
    emoji: "☁️",
    bg: "bg-sky-50",
    bgHex: "#f0f9ff",
    btn: "bg-gradient-to-r from-sky-500 to-indigo-500",
    btnHex: "#0ea5e9",
    text: "text-sky-900",
    textMuted: "text-sky-500",
    preview: "from-sky-100 to-indigo-100"
  },
];

// --- ÍCONE INTELIGENTE ---
function getLinkIcon(url: string) {
  const u = url.toLowerCase();
  if (u.includes('instagram')) return <FaInstagram className="w-4 h-4" />;
  if (u.includes('whatsapp') || u.includes('wa.me')) return <FaWhatsapp className="w-4 h-4" />;
  if (u.includes('tiktok')) return <FaTiktok className="w-4 h-4" />;
  if (u.includes('youtube') || u.includes('youtu.be')) return <FaYoutube className="w-4 h-4" />;
  if (u.includes('linkedin')) return <FaLinkedin className="w-4 h-4" />;
  if (u.includes('github')) return <FaGithub className="w-4 h-4" />;
  if (u.includes('twitter') || u.includes('x.com')) return <FaTwitter className="w-4 h-4" />;
  if (u.includes('spotify')) return <FaSpotify className="w-4 h-4" />;
  if (u.includes('telegram') || u.includes('t.me')) return <FaTelegram className="w-4 h-4" />;
  if (u.includes('discord')) return <FaDiscord className="w-4 h-4" />;
  if (u.includes('pinterest')) return <FaPinterest className="w-4 h-4" />;
  if (u.includes('twitch')) return <FaTwitch className="w-4 h-4" />;
  if (u.includes('facebook') || u.includes('fb.com')) return <FaFacebook className="w-4 h-4" />;
  return <FaGlobe className="w-4 h-4" />;
}

// --- DEBOUNCE HOOK ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// --- COMPONENTE DO CELULAR PREVIEW ---
function PhonePreview({
  preview,
  className = ""
}: {
  preview: {
    username: string;
    links: LinkItem[];
    bio: string;
    imagePreview: string | null;
    selectedTheme: typeof THEMES[0];
  };
  className?: string;
}) {
  return (
    <div className={cn("relative w-[280px] h-[580px] sm:w-[320px] sm:h-[660px]", className)}>
      {/* Sombra */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[240px] h-[30px] bg-black/10 blur-2xl rounded-full" />

      {/* O CELULAR */}
      <div className="relative w-full h-full bg-slate-950 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl border-[8px] sm:border-[10px] border-slate-800 overflow-hidden">

        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-6 sm:h-7 bg-slate-950 rounded-b-2xl z-20" />

        {/* Barra Superior */}
        <div className="absolute top-1.5 sm:top-2 left-6 sm:left-8 right-6 sm:right-8 flex justify-between items-center z-20">
          <span className="text-white/50 text-[10px] sm:text-xs font-medium">9:41</span>
          <div className="flex gap-1">
            <div className="w-3 sm:w-4 h-1.5 sm:h-2 bg-white/50 rounded-sm" />
          </div>
        </div>

        {/* Conteúdo da Tela */}
        <div
          className={cn(
            "absolute inset-0 overflow-y-auto transition-colors duration-500 no-scrollbar",
            preview.selectedTheme.bg
          )}
        >
          <div className="pt-14 sm:pt-16 pb-6 sm:pb-8 px-4 sm:px-5 flex flex-col items-center min-h-full">

            {/* Foto de Perfil */}
            <motion.div
              layout
              className={cn(
                "w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-3 sm:mb-4 shadow-lg border-4 transition-colors",
                preview.selectedTheme.bg === 'bg-slate-950' || preview.selectedTheme.bg === 'bg-fuchsia-950'
                  ? "border-white/20 bg-white/10"
                  : "border-white bg-white"
              )}
            >
              {preview.imagePreview ? (
                <img src={preview.imagePreview} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <div className={cn(
                  "w-full h-full flex items-center justify-center",
                  preview.selectedTheme.textMuted
                )}>
                  <User size={36} />
                </div>
              )}
            </motion.div>

            {/* Nome */}
            <motion.h2
              layout
              className={cn(
                "font-bold text-lg sm:text-xl mb-1 transition-colors",
                preview.selectedTheme.text
              )}
            >
              @{preview.username || "seu-nome"}
            </motion.h2>

            {/* Bio */}
            <motion.p
              layout
              className={cn(
                "text-xs sm:text-sm text-center mb-5 sm:mb-6 px-3 sm:px-4 transition-colors line-clamp-3",
                preview.selectedTheme.textMuted
              )}
            >
              {preview.bio || "Sua bio aparecerá aqui..."}
            </motion.p>

            {/* Links */}
            <div className="w-full space-y-2 sm:space-y-3">
              <AnimatePresence mode="popLayout">
                {preview.links.length > 0 ? (
                  preview.links.slice(0, 5).map((link, index) => (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "w-full py-3 sm:py-3.5 px-4 sm:px-5 rounded-xl shadow-md flex items-center gap-2 sm:gap-3 transition-colors",
                        preview.selectedTheme.btn
                      )}
                    >
                      <span className={cn(
                        preview.selectedTheme.name === 'Midnight'
                          ? "text-slate-900"
                          : "text-white"
                      )}>
                        {getLinkIcon(link.url)}
                      </span>
                      <span className={cn(
                        "font-medium text-xs sm:text-sm truncate",
                        preview.selectedTheme.name === 'Midnight'
                          ? "text-slate-900"
                          : "text-white"
                      )}>
                        {link.title}
                      </span>
                    </motion.div>
                  ))
                ) : (
                  [...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      className={cn(
                        "w-full h-10 sm:h-12 rounded-xl border-2 border-dashed",
                        preview.selectedTheme.bg === 'bg-slate-950' || preview.selectedTheme.bg === 'bg-fuchsia-950'
                          ? "border-white/20"
                          : "border-slate-300"
                      )}
                    />
                  ))
                )}
              </AnimatePresence>

              {preview.links.length > 5 && (
                <p className={cn("text-center text-xs", preview.selectedTheme.textMuted)}>
                  +{preview.links.length - 5} mais links
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="mt-auto pt-6 sm:pt-8">
              <motion.div
                className={cn(
                  "flex items-center gap-1 text-[9px] sm:text-[10px] font-medium uppercase tracking-widest",
                  preview.selectedTheme.textMuted
                )}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                Criado com Freelinnk
              </motion.div>
            </div>
          </div>
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2 w-28 sm:w-32 h-1 bg-white/30 rounded-full" />
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("username");
  const [loading, setLoading] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // --- DADOS DO PREVIEW ---
  const [preview, setPreview] = useState({
    username: "",
    links: [] as LinkItem[],
    bio: "",
    imagePreview: null as string | null,
    imageFile: null as File | null,
    selectedTheme: THEMES[0],
  });

  // --- LINK TEMPORÁRIO ---
  const [newLink, setNewLink] = useState({ title: "", url: "" });

  // --- DEBOUNCE PARA USERNAME ---
  const debouncedUsername = useDebounce(preview.username, 500);

  // --- CONVEX ---
  const checkAvailability = useQuery(
    api.lib.usernames.checkUsernameAvailability,
    debouncedUsername.length >= 3 ? { username: debouncedUsername } : "skip"
  );

  const setUsernameMutation = useMutation(api.lib.usernames.setUsername);
  const updateCustomizations = useMutation(api.lib.customizations.updateCustomizations);
  const generateUploadUrl = useMutation(api.lib.customizations.generateUploadUrl);
  const createLink = useMutation(api.lib.links.createLink);

  // --- VALIDAÇÕES ---
  const isUsernameValid = preview.username.length >= 3 && checkAvailability?.available;
  const isLinksValid = preview.links.length >= 1;
  const isBioValid = preview.bio.length >= 10 && preview.bio.length <= 160;

  // --- AÇÕES ---

  const handleStep1 = async () => {
    if (!isUsernameValid) return;
    setLoading(true);
    try {
      await setUsernameMutation({ username: preview.username });
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      setStep("links");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar nome.");
    } finally {
      setLoading(false);
    }
  };

const addLink = () => {
  if (newLink.title.length < 3) { // <--- Alinhado com o Backend
    toast.error("Título precisa ter pelo menos 3 caracteres");
    return;
  }
    if (newLink.url.length < 5) {
      toast.error("URL precisa ter pelo menos 5 caracteres");
      return;
    }

    const url = newLink.url.startsWith("http") ? newLink.url : `https://${newLink.url}`;

    setPreview(prev => ({
      ...prev,
      links: [...prev.links, { id: Date.now().toString(), title: newLink.title, url }]
    }));
    setNewLink({ title: "", url: "" });

    confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });
    toast.success("Link adicionado!", { icon: "🔗" });
  };

  const removeLink = (id: string) => {
    setPreview(prev => ({
      ...prev,
      links: prev.links.filter(l => l.id !== id)
    }));
  };

  const handleStep2 = async () => {
    if (!isLinksValid) return;
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    setStep("identity");
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem muito grande. Máximo 5MB.");
        return;
      }
      setPreview(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      }));
      toast.success("Foto carregada!", { icon: "📸" });
    }
  };

  const handleStep3 = async () => {
    // Se o usuário começou a escrever uma bio, ela deve ser válida.
    if (preview.bio.length > 0 && !isBioValid) {
      toast.error("Sua bio precisa ter entre 10 e 160 caracteres.");
      return;
    }

    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    setStep("style");
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      let storageId = undefined;

      if (preview.imageFile) {
        const uploadUrl = await generateUploadUrl({});
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": preview.imageFile.type },
          body: preview.imageFile,
        });
        const json = await res.json();
        storageId = json.storageId;
      }

      await updateCustomizations({
        description: preview.bio,
        profilePictureStorageId: storageId,
        accentColor: preview.selectedTheme.btnHex,
        backgroundType: "color",
        backgroundColor1: preview.selectedTheme.bgHex,
      });

      for (const link of preview.links) {
        await createLink({
          title: link.title,
          url: link.url,
          isFeatured: false,
          badgeType: "new"
        });
      }

      // Confetti épico
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#9333ea', '#ec4899', '#f59e0b', '#10b981']
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#9333ea', '#ec4899', '#f59e0b', '#10b981']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      toast.success("Sua página está no ar! 🚀", {
        description: "Redirecionando para o dashboard..."
      });

      setTimeout(() => {
        router.push("/dashboard?welcome=true");
      }, 2500);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao finalizar.");
      setLoading(false);
    }
  };

  // --- STEP CONFIG ---
  const steps: Record<Step, { number: number; title: string; icon: typeof Layout; color: string; gradient: string }> = {
    username: { number: 1, title: "Endereço", icon: Layout, color: "text-blue-600", gradient: "from-blue-500 to-cyan-500" },
    links: { number: 2, title: "Links", icon: LinkIcon, color: "text-purple-600", gradient: "from-purple-500 to-pink-500" },
    identity: { number: 3, title: "Perfil", icon: User, color: "text-orange-600", gradient: "from-orange-500 to-red-500" },
    style: { number: 4, title: "Estilo", icon: Palette, color: "text-emerald-600", gradient: "from-emerald-500 to-teal-500" },
  };

  const currentStep = steps[step];
  const StepIcon = currentStep.icon;

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">

        {/* ========================================
            PAINEL ESQUERDO: WIZARD
        ======================================== */}
        <div className="w-full lg:w-[55%] min-h-screen flex flex-col relative z-10 bg-white">

          {/* Background sutil */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-100 to-cyan-100 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2" />

          {/* Header */}
          <div className="relative p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 sm:gap-3"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-slate-900 font-bold text-xl">Freelinnk</span>
                  <p className="text-slate-400 text-xs">Crie sua página em segundos</p>
                </div>
              </motion.div>

              {/* Progress Pills */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1 sm:gap-2"
              >
                {Object.entries(steps).map(([key, info], index) => {
                  const isActive = step === key;
                  const isPast = Object.keys(steps).indexOf(step) > index;

                  return (
                    <motion.div
                      key={key}
                      className={cn(
                        "flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full transition-all duration-300",
                        isActive
                          ? "bg-slate-900 text-white shadow-lg"
                          : isPast
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-slate-100 text-slate-400"
                      )}
                    >
                      <span className="text-xs sm:text-sm font-bold">{info.number}</span>
                      {isActive && (
                        <motion.span
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: "auto", opacity: 1 }}
                          className="text-xs font-medium hidden sm:inline overflow-hidden"
                        >
                          {info.title}
                        </motion.span>
                      )}
                      {isPast && <Check className="w-3 h-3" />}
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{
                  width: `${((Object.keys(steps).indexOf(step) + 1) / 4) * 100}%`
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="relative flex-1 flex items-start sm:items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="w-full max-w-lg">
              <AnimatePresence mode="wait">

                {/* ========== PASSO 1: USERNAME ========== */}
                {step === "username" && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100"
                    >                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">                        <StepIcon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-blue-600 text-sm font-semibold">Passo 1 de 4</span>
                    </motion.div>

                    {/* Título */}
                    <div className="space-y-2">
                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight"
                      >
                        Escolha seu{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                          link único
                        </span>
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-slate-500 text-base sm:text-lg"
                      >
                        Este será o endereço da sua página de links ✨
                      </motion.p>
                    </div>

                    {/* Input */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="space-y-3"
                    >
                      <Label className="text-slate-700 font-semibold">Seu endereço</Label>
                      <div className="relative group">
                        <div className={cn(
                          "absolute inset-0 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300",
                          "bg-gradient-to-r from-blue-500/20 to-cyan-500/20"
                        )} />
                        <div className="relative bg-slate-50 rounded-2xl border-2 border-slate-200 focus-within:border-blue-500 transition-colors overflow-hidden">
                          <div className="flex items-center">
                            <span className="px-4 py-4 text-slate-400 font-medium text-sm sm:text-base whitespace-nowrap border-r border-slate-200 bg-slate-100/50">
                              freelinnk.com/
                            </span>
                            <Input
                              className="flex-1 h-14 bg-transparent border-0 text-slate-900 text-lg sm:text-xl font-bold placeholder:text-slate-300 focus-visible:ring-0 px-4"
                              placeholder="seu-nome"
                              value={preview.username}
                              onChange={(e) => setPreview({
                                ...preview,
                                username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 30)
                              })}
                              autoFocus
                            />
                            <div className="pr-4">
                              <AnimatePresence mode="wait">
                                {preview.username.length >= 3 && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className={cn(
                                      "w-10 h-10 rounded-xl flex items-center justify-center",
                                      debouncedUsername !== preview.username
                                        ? "bg-slate-200"
                                        : checkAvailability?.available
                                          ? "bg-emerald-500"
                                          : checkAvailability === undefined
                                            ? "bg-slate-200"
                                            : "bg-red-500"
                                    )}
                                  >
                                    {debouncedUsername !== preview.username || checkAvailability === undefined ? (
                                      <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                                    ) : checkAvailability?.available ? (
                                      <Check className="w-5 h-5 text-white" />
                                    ) : (
                                      <X className="w-5 h-5 text-white" />
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Feedback */}
                      <AnimatePresence>
                        {preview.username.length >= 3 && debouncedUsername === preview.username && checkAvailability && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={cn(
                              "flex items-center gap-2 px-4 py-3 rounded-xl",
                              checkAvailability.available
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                : "bg-red-50 text-red-600 border border-red-200"
                            )}
                          >
                            {checkAvailability.available ? (
                              <>
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-medium">Perfeito! Este nome está disponível</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-5 h-5" />
                                <span className="font-medium">Este nome já está em uso</span>
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Botão */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Button
                        onClick={handleStep1}
                        disabled={!isUsernameValid || loading}
                        className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 border-0 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed group transition-all duration-300"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            Reservar este nome
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </motion.div>

                    {/* Preview Mobile Button */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      onClick={() => setShowMobilePreview(true)}
                      className="lg:hidden w-full flex items-center justify-center gap-2 py-3 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">Ver preview</span>
                    </motion.button>
                  </motion.div>
                )}

                {/* ========== PASSO 2: LINKS ========== */}
                {step === "links" && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-5"
                  >
                    {/* Badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100"
                    >                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">                        <StepIcon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-purple-600 text-sm font-semibold">Passo 2 de 4</span>
                    </motion.div>

                    {/* Título */}
                    <div className="space-y-2">
                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight"
                      >
                        Adicione seus{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                          links
                        </span>
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-slate-500 text-base sm:text-lg"
                      >
                        Adicione quantos quiser - você pode editar depois 🔗
                      </motion.p>
                    </div>

                    {/* Lista de Links */}
                    {preview.links.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar"
                      >
                        <AnimatePresence>
                          {preview.links.map((link, index) => (
                            <motion.div
                              key={link.id}
                              initial={{ opacity: 0, x: -20, height: 0 }}
                              animate={{ opacity: 1, x: 0, height: "auto" }}
                              exit={{ opacity: 0, x: 20, height: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 group hover:border-purple-300 transition-colors"
                            >
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shrink-0 shadow-md">
                                {getLinkIcon(link.url)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-slate-900 font-semibold truncate text-sm">{link.title}</p>
                                <p className="text-slate-400 text-xs truncate">{link.url}</p>
                              </div>
                              <button
                                onClick={() => removeLink(link.id)}
                                className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    )}

                    {/* Formulário */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="space-y-3 p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Plus className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-semibold text-purple-700">Novo link</span>
                      </div>
                      <Input
                        placeholder="Título (ex: Meu Instagram)"
                        className="h-12 bg-white border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus-visible:ring-purple-500"
                        value={newLink.title}
                        onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                      />
                      <Input
                        type="url"
                        inputMode="url"
                        placeholder="URL (ex: instagram.com/seu-user)"
                        className="h-12 bg-white border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus-visible:ring-purple-500"
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && addLink()}
                      />
                      <Button
                        onClick={addLink}
                        className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Link
                      </Button>
                    </motion.div>

                    {/* Contador */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <LinkIcon className="w-4 h-4" />
                        <span>
                          {preview.links.length} link{preview.links.length !== 1 && 's'}
                        </span>
                      </div>
                      {preview.links.length === 0 && (
                        <span className="text-amber-600 text-sm flex items-center gap-1 font-medium">
                          <AlertCircle className="w-4 h-4" />
                          Adicione ao menos 1 link
                        </span>
                      )}
                    </div>

                    {/* Botão */}
                    <Button
                      onClick={handleStep2}
                      disabled={!isLinksValid}
                      className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 shadow-lg shadow-purple-500/25 disabled:opacity-50 group transition-all duration-300"
                    >
                      Continuar
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    {/* Preview Mobile */}
                    <button
                      onClick={() => setShowMobilePreview(true)}
                      className="lg:hidden w-full flex items-center justify-center gap-2 py-3 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">Ver preview</span>
                    </button>
                  </motion.div>
                )}

                {/* ========== PASSO 3: IDENTIDADE ========== */}
                {step === "identity" && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-5"
                  >
                    {/* Badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100"
                    >                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">                        <StepIcon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-orange-600 text-sm font-semibold">Passo 3 de 4</span>
                    </motion.div>

                    {/* Título */}
                    <div className="space-y-2">
                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight"
                      >
                        Quem é{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                          você?
                        </span>
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-slate-500 text-base sm:text-lg"
                      >
                        Adicione uma foto e bio para personalizar 📸
                      </motion.p>
                    </div>

                    {/* Upload */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => document.getElementById("photo-upload")?.click()}
                        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 border-2 border-dashed border-orange-300 flex items-center justify-center cursor-pointer hover:border-orange-500 transition-colors overflow-hidden group shrink-0"
                      >
                        {preview.imagePreview ? (
                          <>
                            <img src={preview.imagePreview} className="w-full h-full object-cover" alt="Preview" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Camera className="w-6 h-6 text-white" />
                            </div>
                          </>
                        ) : (
                          <Camera className="w-8 h-8 text-orange-400 group-hover:scale-110 transition-transform" />
                        )}
                        <input
                          id="photo-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageSelect}
                        />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-900 font-semibold mb-1">Foto de Perfil</p>
                        <p className="text-slate-500 text-sm">
                          {preview.imagePreview ? "Clique para trocar" : "Toque para enviar (opcional)"}
                        </p>
                      </div>
                    </motion.div>

                    {/* Bio */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <Label className="text-slate-700 font-semibold flex items-center gap-2">
                          <Type className="w-4 h-4" />
                          Sua Bio
                        </Label>
                        <span className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full",
                          preview.bio.length === 0
                            ? "bg-slate-100 text-slate-400"
                            : preview.bio.length < 10
                              ? "bg-amber-100 text-amber-600"
                              : preview.bio.length > 150
                                ? "bg-amber-100 text-amber-600"
                                : "bg-emerald-100 text-emerald-600"
                        )}>
                          {preview.bio.length}/160
                        </span>
                      </div>
                      <textarea
                        className="w-full h-28 p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:border-orange-500 transition-colors"
                        placeholder="Conte um pouco sobre você ou seu negócio..."
                        value={preview.bio}
                        onChange={(e) => setPreview({ ...preview, bio: e.target.value.slice(0, 160) })}
                        maxLength={160}
                      />
                      {preview.bio.length > 0 && preview.bio.length < 10 && (
                        <p className="text-amber-600 text-sm flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          Mínimo de 10 caracteres
                        </p>
                      )}
                    </motion.div>

                    {/* Botão */}
                    <Button
                      onClick={handleStep3}
                      className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 border-0 shadow-lg shadow-orange-500/25 group transition-all duration-300"
                    >
                      {preview.bio.length === 0 && !preview.imagePreview ? "Pular por agora" : "Continuar"}
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    {/* Preview Mobile */}
                    <button
                      onClick={() => setShowMobilePreview(true)}
                      className="lg:hidden w-full flex items-center justify-center gap-2 py-3 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">Ver preview</span>
                    </button>
                  </motion.div>
                )}

                {/* ========== PASSO 4: ESTILO ========== */}
                {step === "style" && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-5"
                  >
                    {/* Badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100"
                    >                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">                        <StepIcon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-emerald-600 text-sm font-semibold">Passo Final! 🎉</span>
                    </motion.div>

                    {/* Título */}
                    <div className="space-y-2">
                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight"
                      >
                        Qual seu{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                          estilo?
                        </span>
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-slate-500 text-base sm:text-lg"
                      >
                        Escolha um tema - você pode mudar depois 🎨
                      </motion.p>
                    </div>

                    {/* Grid de Temas */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar"
                    >
                      {THEMES.map((theme, index) => (
                        <motion.button
                          key={theme.name}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.03 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setPreview({ ...preview, selectedTheme: theme })}
                          className={cn(
                            "relative p-2 sm:p-3 rounded-xl border-2 transition-all overflow-hidden group",
                            preview.selectedTheme.name === theme.name
                              ? "border-slate-900 shadow-lg bg-slate-50"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          )}
                        >
                          {/* Popular Badge */}
                          {theme.popular && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center z-10">
                              <Star className="w-3 h-3 text-white fill-white" />
                            </div>
                          )}

                          {/* Preview */}
                          <div className={cn("w-full h-12 sm:h-14 rounded-lg bg-gradient-to-br mb-2", theme.preview)} />

                          {/* Botão Preview */}
                          <div className={cn("w-full h-5 sm:h-6 rounded-md", theme.btn)} />

                          {/* Nome */}
                          <div className="flex items-center justify-center gap-1 mt-2">
                            <span className="text-base">{theme.emoji}</span>
                            <span className="text-slate-700 text-[10px] sm:text-xs font-semibold truncate">
                              {theme.name}
                            </span>
                          </div>

                          {/* Check */}
                          {preview.selectedTheme.name === theme.name && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-1 left-1 w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center"
                            >
                              <Check className="w-3 h-3 text-white" />
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </motion.div>

                    {/* Tema Selecionado */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-2 py-2 text-sm text-slate-600"
                    >
                      <Wand2 className="w-4 h-4" />
                      <span>Tema selecionado: <strong>{preview.selectedTheme.emoji} {preview.selectedTheme.name}</strong></span>
                    </motion.div>

                    {/* Botão Final */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <Button
                        onClick={handleFinish}
                        disabled={loading}
                        className="w-full h-16 text-xl font-black rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 border-0 shadow-xl shadow-emerald-500/30 disabled:opacity-50 group relative overflow-hidden transition-all duration-300"
                      >
                        {loading ? (
                          <div className="flex items-center gap-3">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Criando sua página...</span>
                          </div>
                        ) : (
                          <>
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                              animate={{ x: ['-100%', '100%'] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                            <span className="relative flex items-center gap-2">
                              <Rocket className="w-6 h-6" />
                              Lançar Minha Página!
                              <PartyPopper className="w-5 h-5" />
                            </span>
                          </>
                        )}
                      </Button>
                    </motion.div>

                    {/* Preview Mobile */}
                    <button
                      onClick={() => setShowMobilePreview(true)}
                      className="lg:hidden w-full flex items-center justify-center gap-2 py-3 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">Ver preview final</span>
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>

          {/* Voltar */}
          {step !== "username" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative p-4 sm:p-6 lg:p-8 pt-0"
            >
              <button
                onClick={() => {
                  const stepOrder: Step[] = ["username", "links", "identity", "style"];
                  const currentIndex = stepOrder.indexOf(step);
                  if (currentIndex > 0) {
                    setStep(stepOrder[currentIndex - 1]);
                  }
                }}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Voltar</span>
              </button>
            </motion.div>
          )}
        </div>

        {/* ========================================
            PAINEL DIREITO: PREVIEW (Desktop)
        ======================================== */}
        <div className="hidden lg:flex flex-1 items-center justify-center relative bg-slate-100 overflow-hidden">

          {/* Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:2rem_2rem]" />

          {/* Glow */}
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full blur-[150px] opacity-30"
            style={{ background: preview.selectedTheme.btnHex }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          {/* Celular */}
          <motion.div
            initial={{ y: 50, opacity: 0, rotateY: 15 }}
            animate={{ y: 0, opacity: 1, rotateY: 0 }}
            transition={{ delay: 0.3, type: "spring" }}
            style={{ perspective: "1000px" }}
          >
            <PhonePreview preview={preview} />
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-20 right-20 p-3 rounded-2xl bg-white shadow-xl border border-slate-200"
          >
            <Heart className="w-6 h-6 text-pink-500" />
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            className="absolute bottom-32 left-20 p-3 rounded-2xl bg-white shadow-xl border border-slate-200"
          >
            <Star className="w-6 h-6 text-amber-500" />
          </motion.div>

          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            className="absolute top-40 left-32 p-3 rounded-2xl bg-white shadow-xl border border-slate-200"
          >
            <Sparkles className="w-6 h-6 text-purple-500" />
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0], rotate: [0, -8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, delay: 0.8 }}
            className="absolute bottom-40 right-32 p-3 rounded-2xl bg-white shadow-xl border border-slate-200"
          >
            <Zap className="w-6 h-6 text-cyan-500" />
          </motion.div>
        </div>
      </div>

      {/* ========================================
          MODAL PREVIEW MOBILE
      ======================================== */}
      <AnimatePresence>
        {showMobilePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4 lg:hidden"
            onClick={() => setShowMobilePreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowMobilePreview(false)}
                className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Title */}
              <div className="absolute -top-12 left-0 flex items-center gap-2 text-white">
                <Smartphone className="w-5 h-5" />
                <span className="font-semibold">Preview</span>
              </div>

              {/* Phone */}
              <PhonePreview preview={preview} />

              {/* Hint */}
              <p className="text-center text-white/50 text-sm mt-4">
                Toque fora para fechar
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}