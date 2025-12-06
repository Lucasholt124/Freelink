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
  Upload,
  Loader2,
  Sparkles,
  Plus,
  Trash2,
  ArrowRight,
  Zap,
  Crown,
  Star,
  Heart,
  ExternalLink,

  X
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
  FaGlobe
} from "react-icons/fa6";

// --- TIPOS ---
type Step = "username" | "links" | "identity" | "style";

interface LinkItem {
  id: string;
  title: string;
  url: string;
}

// --- TEMAS DISPONÍVEIS ---
const THEMES = [
  {
    name: "Minimal",
    bg: "bg-slate-50",
    bgHex: "#f8fafc",
    btn: "bg-slate-900",
    btnHex: "#0f172a",
    text: "text-slate-900",
    textMuted: "text-slate-500",
    preview: "from-slate-100 to-slate-200"
  },
  {
    name: "Dark Mode",
    bg: "bg-slate-950",
    bgHex: "#020617",
    btn: "bg-white",
    btnHex: "#ffffff",
    text: "text-white",
    textMuted: "text-slate-400",
    preview: "from-slate-900 to-slate-800"
  },
  {
    name: "Roxo Vibes",
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
    bg: "bg-emerald-50",
    bgHex: "#ecfdf5",
    btn: "bg-gradient-to-r from-emerald-500 to-teal-500",
    btnHex: "#10b981",
    text: "text-emerald-900",
    textMuted: "text-emerald-500",
    preview: "from-emerald-100 to-teal-100"
  },
  {
    name: "Neon Pink",
    bg: "bg-fuchsia-950",
    bgHex: "#4a044e",
    btn: "bg-gradient-to-r from-fuchsia-500 to-pink-500",
    btnHex: "#d946ef",
    text: "text-white",
    textMuted: "text-fuchsia-300",
    preview: "from-fuchsia-900 to-pink-900"
  },
  {
    name: "Gold Premium",
    bg: "bg-amber-50",
    bgHex: "#fffbeb",
    btn: "bg-gradient-to-r from-amber-500 to-yellow-500",
    btnHex: "#f59e0b",
    text: "text-amber-900",
    textMuted: "text-amber-600",
    preview: "from-amber-100 to-yellow-100"
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
  return <FaGlobe className="w-4 h-4" />;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("username");
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // --- DADOS DO PREVIEW ---
  const [preview, setPreview] = useState({
    username: "",
    links: [] as LinkItem[],
    bio: "",
    imagePreview: null as string | null,
    imageFile: null as File | null,
    selectedTheme: THEMES[0],
  });

  // --- LINK TEMPORÁRIO SENDO EDITADO ---
  const [newLink, setNewLink] = useState({ title: "", url: "" });

  // --- CONVEX ---
  const checkAvailability = useQuery(
    api.lib.usernames.checkUsernameAvailability,
    preview.username.length >= 3 ? { username: preview.username } : "skip"
  );

  const setUsernameMutation = useMutation(api.lib.usernames.setUsername);
  const updateCustomizations = useMutation(api.lib.customizations.updateCustomizations);
  const generateUploadUrl = useMutation(api.lib.customizations.generateUploadUrl);
  const createLink = useMutation(api.lib.links.createLink);

  // --- VALIDAÇÕES ---
  const isUsernameValid = preview.username.length >= 3 && checkAvailability?.available;
  const isLinksValid = preview.links.length >= 1;
  const isBioValid = preview.bio.length >= 10 && preview.bio.length <= 160;

  // --- CONFETTI AUTOMÁTICO ---
  useEffect(() => {
    if (showConfetti) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#9333ea', '#ec4899', '#f59e0b']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#9333ea', '#ec4899', '#f59e0b']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [showConfetti]);

  // --- AÇÕES DO WIZARD ---

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
    if (newLink.title.length < 2 || newLink.url.length < 5) {
      toast.error("Preencha título (min 2) e URL (min 5)");
      return;
    }

    const url = newLink.url.startsWith("http") ? newLink.url : `https://${newLink.url}`;

    setPreview(prev => ({
      ...prev,
      links: [...prev.links, { id: Date.now().toString(), title: newLink.title, url }]
    }));
    setNewLink({ title: "", url: "" });

    confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });
  };

  const removeLink = (id: string) => {
    setPreview(prev => ({
      ...prev,
      links: prev.links.filter(l => l.id !== id)
    }));
  };

  const handleStep2 = async () => {
    if (!isLinksValid) return;
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
    }
  };

  const handleStep3 = async () => {
    if (!isBioValid) return;
    setStep("style");
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      let storageId = undefined;

      // Upload da imagem
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

      // Salva customizações
      await updateCustomizations({
        description: preview.bio,
        profilePictureStorageId: storageId,
        accentColor: preview.selectedTheme.btnHex,
        backgroundType: "color",
        backgroundColor1: preview.selectedTheme.bgHex,
      });

      // Salva todos os links
      for (const link of preview.links) {
        await createLink({
          title: link.title,
          url: link.url,
          isFeatured: false,
          badgeType: "new"
        });
      }

      setShowConfetti(true);
      toast.success("Sua página está no ar! 🚀");

      setTimeout(() => {
        router.push("/dashboard?welcome=true");
      }, 2500);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao finalizar.");
      setLoading(false);
    }
  };

  // --- STEP INFO ---
  const stepInfo = {
    username: { number: 1, title: "Endereço", icon: Layout, color: "from-blue-500 to-cyan-500" },
    links: { number: 2, title: "Links", icon: LinkIcon, color: "from-purple-500 to-pink-500" },
    identity: { number: 3, title: "Perfil", icon: User, color: "from-orange-500 to-red-500" },
    style: { number: 4, title: "Estilo", icon: Palette, color: "from-emerald-500 to-teal-500" },
  };

  const currentStep = stepInfo[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col lg:flex-row overflow-hidden">

      {/* ========================================
          PARTÍCULAS ANIMADAS DE FUNDO
      ======================================== */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              y: [null, -20, 20],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              repeatType: "reverse",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* ========================================
          PAINEL ESQUERDO: WIZARD
      ======================================== */}
      <div className="w-full lg:w-[55%] min-h-screen flex flex-col relative z-10">

        {/* Header com Logo e Progresso */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-xl hidden sm:block">Freelinnk</span>
            </motion.div>

            {/* Indicador de Passo */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm"
            >
              <div className={cn("w-6 h-6 rounded-full bg-gradient-to-r flex items-center justify-center text-white text-xs font-bold", currentStep.color)}>
                {currentStep.number}
              </div>
              <span className="text-white/80 text-sm font-medium hidden sm:block">
                Passo {currentStep.number} de 4
              </span>
            </motion.div>
          </div>

          {/* Barra de Progresso Premium */}
          <div className="flex gap-2">
            {Object.entries(stepInfo).map(([key, info], index) => (
              <motion.div
                key={key}
                className="flex-1 h-2 rounded-full overflow-hidden bg-white/10"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  className={cn(
                    "h-full rounded-full bg-gradient-to-r",
                    info.color
                  )}
                  initial={{ width: "0%" }}
                  animate={{
                    width:
                      (step === key) ? "50%" :
                      (Object.keys(stepInfo).indexOf(step) > index) ? "100%" : "0%"
                  }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
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
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30"
                  >
                    <Layout className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300 text-sm font-medium">Passo 1 • Seu Endereço Único</span>
                  </motion.div>

                  {/* Título */}
                  <div className="space-y-2">
                    <motion.h1
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight"
                    >
                      Escolha seu{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                        link único
                      </span>
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-white/60 text-lg"
                    >
                      Este será o endereço da sua página de links
                    </motion.p>
                  </div>

                  {/* Input */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-3"
                  >
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-20 group-focus-within:opacity-40 transition-opacity" />
                      <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-1">
                        <div className="flex items-center">
                          <span className="px-4 text-white/50 font-medium text-sm sm:text-base whitespace-nowrap">
                            freelinnk.com/
                          </span>
                          <Input
                            className="flex-1 h-14 bg-transparent border-0 text-white text-lg sm:text-xl font-bold placeholder:text-white/30 focus-visible:ring-0"
                            placeholder="seu-nome"
                            value={preview.username}
                            onChange={(e) => setPreview({
                              ...preview,
                              username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 30)
                            })}
                            autoFocus
                          />
                          <div className="pr-4">
                            {preview.username.length >= 3 && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center",
                                  checkAvailability?.available
                                    ? "bg-green-500"
                                    : checkAvailability === undefined
                                      ? "bg-white/20"
                                      : "bg-red-500"
                                )}
                              >
                                {checkAvailability?.available ? (
                                  <Check className="w-4 h-4 text-white" />
                                ) : checkAvailability === undefined ? (
                                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                                ) : (
                                  <X className="w-4 h-4 text-white" />
                                )}
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Feedback */}
                    <AnimatePresence>
                      {preview.username.length >= 3 && checkAvailability && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={cn(
                            "text-sm font-medium flex items-center gap-2",
                            checkAvailability.available ? "text-green-400" : "text-red-400"
                          )}
                        >
                          {checkAvailability.available ? (
                            <>
                              <Sparkles className="w-4 h-4" />
                              Perfeito! Este nome está disponível
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4" />
                              Este nome já está em uso
                            </>
                          )}
                        </motion.p>
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
                      className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-0 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed group"
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
                </motion.div>
              )}

              {/* ========== PASSO 2: LINKS ========== */}
              {step === "links" && (
                <motion.div
                  key="step2"
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
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30"
                  >
                    <LinkIcon className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300 text-sm font-medium">Passo 2 • Adicione seus Links</span>
                  </motion.div>

                  {/* Título */}
                  <div className="space-y-2">
                    <motion.h1
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight"
                    >
                      Adicione seus{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        links
                      </span>
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-white/60 text-lg"
                    >
                      Coloque quantos quiser - você pode editar depois
                    </motion.p>
                  </div>

                  {/* Lista de Links Adicionados */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar"
                  >
                    <AnimatePresence>
                      {preview.links.map((link, index) => (
                        <motion.div
                          key={link.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20, height: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shrink-0">
                            {getLinkIcon(link.url)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{link.title}</p>
                            <p className="text-white/40 text-sm truncate">{link.url}</p>
                          </div>
                          <button
                            onClick={() => removeLink(link.id)}
                            className="p-2 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  {/* Formulário para Novo Link */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <div className="grid gap-3">
                      <Input
                        placeholder="Título (ex: Meu Instagram)"
                        className="h-12 bg-white/10 border-white/10 text-white placeholder:text-white/30 rounded-xl"
                        value={newLink.title}
                        onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                      />
                      <Input
                        placeholder="URL (ex: instagram.com/seu-user)"
                        className="h-12 bg-white/10 border-white/10 text-white placeholder:text-white/30 rounded-xl"
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && addLink()}
                      />
                    </div>
                    <Button
                      onClick={addLink}
                      variant="outline"
                      className="w-full h-12 rounded-xl border-dashed border-white/20 text-white hover:bg-white/10 hover:text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Link
                    </Button>
                  </motion.div>

                  {/* Contador */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/40">
                      {preview.links.length} link{preview.links.length !== 1 && 's'} adicionado{preview.links.length !== 1 && 's'}
                    </span>
                    {preview.links.length === 0 && (
                      <span className="text-amber-400 flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Adicione ao menos 1 link
                      </span>
                    )}
                  </div>

                  {/* Botão */}
                  <Button
                    onClick={handleStep2}
                    disabled={!isLinksValid}
                    className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0 shadow-lg shadow-purple-500/25 disabled:opacity-50 group"
                  >
                    Continuar
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              )}

              {/* ========== PASSO 3: IDENTIDADE ========== */}
              {step === "identity" && (
                <motion.div
                  key="step3"
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
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30"
                  >
                    <User className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-300 text-sm font-medium">Passo 3 • Seu Perfil</span>
                  </motion.div>

                  {/* Título */}
                  <div className="space-y-2">
                    <motion.h1
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight"
                    >
                      Quem é{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                        você?
                      </span>
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-white/60 text-lg"
                    >
                      Adicione uma foto e uma bio para personalizar
                    </motion.p>
                  </div>

                  {/* Upload de Foto */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-4"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => document.getElementById("photo-upload")?.click()}
                      className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-orange-500/50 transition-colors overflow-hidden group"
                    >
                      {preview.imagePreview ? (
                        <>
                          <img src={preview.imagePreview} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Upload className="w-6 h-6 text-white" />
                          </div>
                        </>
                      ) : (
                        <Upload className="w-8 h-8 text-white/40 group-hover:text-orange-400 transition-colors" />
                      )}
                      <input
                        id="photo-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                    </motion.div>
                    <div className="flex-1">
                      <p className="text-white font-medium mb-1">Foto de Perfil</p>
                      <p className="text-white/40 text-sm">
                        {preview.imagePreview ? "Clique para trocar" : "Clique para enviar (opcional)"}
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
                    <Label className="text-white/60">Sua Bio</Label>
                    <div className="relative">
                      <textarea
                        className="w-full h-28 p-4 rounded-2xl bg-white/10 border border-white/10 text-white placeholder:text-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                        placeholder="Conte um pouco sobre você ou seu negócio..."
                        value={preview.bio}
                        onChange={(e) => setPreview({ ...preview, bio: e.target.value.slice(0, 160) })}
                        maxLength={160}
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-white/30">
                        <span className={cn(
                          preview.bio.length < 10 ? "text-amber-400" :
                          preview.bio.length > 150 ? "text-amber-400" : "text-green-400"
                        )}>
                          {preview.bio.length}
                        </span>
                        /160
                      </div>
                    </div>
                    {preview.bio.length > 0 && preview.bio.length < 10 && (
                      <p className="text-amber-400 text-sm flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Mínimo de 10 caracteres
                      </p>
                    )}
                  </motion.div>

                  {/* Botão */}
                  <Button
                    onClick={handleStep3}
                    disabled={!isBioValid && preview.bio.length > 0}
                    className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-0 shadow-lg shadow-orange-500/25 disabled:opacity-50 group"
                  >
                    {preview.bio.length === 0 ? "Pular por agora" : "Continuar"}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              )}

              {/* ========== PASSO 4: ESTILO ========== */}
              {step === "style" && (
                <motion.div
                  key="step4"
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
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30"
                  >
                    <Palette className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300 text-sm font-medium">Passo Final • Escolha o Visual</span>
                  </motion.div>

                  {/* Título */}
                  <div className="space-y-2">
                    <motion.h1
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight"
                    >
                      Qual seu{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                        estilo?
                      </span>
                    </motion.h1>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-white/60 text-lg"
                    >
                      Escolha um tema - você pode mudar depois
                    </motion.p>
                  </div>

                  {/* Grid de Temas */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                  >
                    {THEMES.map((theme, index) => (
                      <motion.button
                        key={theme.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPreview({ ...preview, selectedTheme: theme })}
                        className={cn(
                          "relative p-3 rounded-xl border-2 transition-all overflow-hidden group",
                          preview.selectedTheme.name === theme.name
                            ? "border-white shadow-lg"
                            : "border-white/10 hover:border-white/30"
                        )}
                      >
                        {/* Preview do Tema */}
                        <div className={cn("w-full h-16 rounded-lg bg-gradient-to-br mb-2", theme.preview)} />

                        {/* Botão Preview */}
                        <div className={cn("w-full h-6 rounded-md", theme.btn)} />

                        {/* Nome */}
                        <p className="text-white/80 text-xs font-medium mt-2 text-center truncate">
                          {theme.name}
                        </p>

                        {/* Check */}
                        {preview.selectedTheme.name === theme.name && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center"
                          >
                            <Check className="w-3 h-3 text-emerald-500" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </motion.div>

                  {/* Botão Final */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Button
                      onClick={handleFinish}
                      disabled={loading}
                      className="w-full h-16 text-xl font-black rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 border-0 shadow-xl shadow-emerald-500/30 disabled:opacity-50 group relative overflow-hidden"
                    >
                      {loading ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Criando sua página...
                        </div>
                      ) : (
                        <>
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          />
                          <span className="relative flex items-center gap-2">
                            <Crown className="w-6 h-6" />
                            Lançar Minha Página!
                            <Sparkles className="w-5 h-5" />
                          </span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ========================================
          PAINEL DIREITO: PREVIEW DO CELULAR
      ======================================== */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative p-8">

        {/* Glow de Fundo */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-30 transition-colors duration-500"
          style={{ background: preview.selectedTheme.btnHex }}
        />

        {/* Container do Celular */}
        <motion.div
          initial={{ y: 50, opacity: 0, rotateY: 15 }}
          animate={{ y: 0, opacity: 1, rotateY: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="relative"
          style={{ perspective: "1000px" }}
        >
          {/* Reflexo/Sombra */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[280px] h-[40px] bg-black/40 blur-2xl rounded-full" />

          {/* O CELULAR */}
          <div className="relative w-[320px] h-[660px] bg-slate-950 rounded-[3rem] shadow-2xl border-[10px] border-slate-800 overflow-hidden">

            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-slate-950 rounded-b-2xl z-20" />

            {/* Barra Superior Fake */}
            <div className="absolute top-2 left-8 right-8 flex justify-between items-center z-20">
              <span className="text-white/50 text-xs font-medium">9:41</span>
              <div className="flex gap-1">
                <div className="w-4 h-2 bg-white/50 rounded-sm" />
              </div>
            </div>

            {/* Conteúdo da Tela */}
            <div
              className={cn(
                "absolute inset-0 overflow-y-auto transition-colors duration-500",
                preview.selectedTheme.bg
              )}
            >
              <div className="pt-16 pb-8 px-5 flex flex-col items-center min-h-full">

                {/* Foto de Perfil */}
                <motion.div
                  layout
                  className={cn(
                    "w-24 h-24 rounded-full overflow-hidden mb-4 shadow-lg border-4",
                    preview.selectedTheme.bg === 'bg-slate-950' || preview.selectedTheme.bg === 'bg-fuchsia-950'
                      ? "border-white/20 bg-white/10"
                      : "border-white bg-white"
                  )}
                >
                  {preview.imagePreview ? (
                    <img src={preview.imagePreview} className="w-full h-full object-cover" />
                  ) : (
                    <div className={cn(
                      "w-full h-full flex items-center justify-center",
                      preview.selectedTheme.textMuted
                    )}>
                      <User size={40} />
                    </div>
                  )}
                </motion.div>

                {/* Nome */}
                <motion.h2
                  layout
                  className={cn(
                    "font-bold text-xl mb-1 transition-colors",
                    preview.selectedTheme.text
                  )}
                >
                  @{preview.username || "seu-nome"}
                </motion.h2>

                {/* Bio */}
                <motion.p
                  layout
                  className={cn(
                    "text-sm text-center mb-6 px-4 transition-colors line-clamp-3",
                    preview.selectedTheme.textMuted
                  )}
                >
                  {preview.bio || "Sua bio aparecerá aqui..."}
                </motion.p>

                {/* Links */}
                <div className="w-full space-y-3">
                  <AnimatePresence mode="popLayout">
                    {preview.links.length > 0 ? (
                      preview.links.slice(0, 4).map((link, index) => (
                        <motion.div
                          key={link.id}
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: index * 0.1 }}
                          className={cn(
                            "w-full py-3.5 px-5 rounded-xl shadow-md flex items-center gap-3 transition-colors",
                            preview.selectedTheme.btn
                          )}
                        >
                          <span className={cn(
                            preview.selectedTheme.name === 'Dark Mode'
                              ? "text-slate-900"
                              : "text-white"
                          )}>
                            {getLinkIcon(link.url)}
                          </span>
                          <span className={cn(
                            "font-medium text-sm truncate",
                            preview.selectedTheme.name === 'Dark Mode'
                              ? "text-slate-900"
                              : "text-white"
                          )}>
                            {link.title}
                          </span>
                        </motion.div>
                      ))
                    ) : (
                      // Placeholders
                      [...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.3 }}
                          className={cn(
                            "w-full h-12 rounded-xl border-2 border-dashed",
                            preview.selectedTheme.bg === 'bg-slate-950' || preview.selectedTheme.bg === 'bg-fuchsia-950'
                              ? "border-white/20"
                              : "border-slate-300"
                          )}
                        />
                      ))
                    )}
                  </AnimatePresence>

                  {/* Mostrar quantos links a mais */}
                  {preview.links.length > 4 && (
                    <p className={cn("text-center text-sm", preview.selectedTheme.textMuted)}>
                      +{preview.links.length - 4} mais links
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-auto pt-8">
                  <motion.div
                    className={cn(
                      "flex items-center gap-1 text-[10px] font-medium uppercase tracking-widest",
                      preview.selectedTheme.textMuted
                    )}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap className="w-3 h-3" />
                    Criado com Freelinnk
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full" />
          </div>
        </motion.div>

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-20 right-20 p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg"
        >
          <Heart className="w-5 h-5 text-white" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, 10, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          className="absolute bottom-32 left-20 p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg"
        >
          <Star className="w-5 h-5 text-white" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, -8, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute top-40 left-32 p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg"
        >
          <Sparkles className="w-5 h-5 text-white" />
        </motion.div>
      </div>

      {/* ========================================
          PREVIEW MOBILE (Aparece só no mobile)
      ======================================== */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg flex items-center justify-center text-white"
          onClick={() => {
            toast.info("Seu preview está sendo construído!", {
              description: "Veja o resultado final no desktop ou continue configurando.",
              icon: <Sparkles className="w-4 h-4" />
            });
          }}
        >
          <ExternalLink className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}