"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Rocket, User, Link as LinkIcon, CheckCircle2, ArrowRight, Copy, Check, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDebounce } from "../hooks/use-debounce";
import { FreelinnkLogo } from "@/components/onboarding/FreelinnkLogo";
import confetti from "canvas-confetti";

type Step = "username" | "profile" | "link" | "success";

const STEPS: Record<Step, { num: number; total: number; label: string; icon: React.ReactNode }> = {
  username: { num: 1, total: 4, label: "Boas-vindas", icon: <Rocket className="w-4 h-4" /> },
  profile: { num: 2, total: 4, label: "Personalização", icon: <User className="w-4 h-4" /> },
  link: { num: 3, total: 4, label: "Primeiro Link", icon: <LinkIcon className="w-4 h-4" /> },
  success: { num: 4, total: 4, label: "Pronto!", icon: <CheckCircle2 className="w-4 h-4" /> },
};

const triggerConfetti = () => {
  const duration = 3000;
  const end = Date.now() + duration;
  const colors = ["#10b981", "#3b82f6", "#8b5cf6"];

  (function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors });
    confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("username");
  const [loading, setLoading] = useState(false);

  // Form State
  const [username, setUsername] = useState("");
  const debouncedUsername = useDebounce(username, 500);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState<{ file: File | null; preview: string | null }>({ file: null, preview: null });
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Queries/Mutations
  const currentUser = useQuery(api.users.getMyUsername);
  const checkAvailability = useQuery(api.lib.usernames.checkUsernameAvailability, debouncedUsername.length >= 3 ? { username: debouncedUsername } : "skip");
  const setUsernameMutation = useMutation(api.lib.usernames.setUsername);
  const updateCustomizations = useMutation(api.lib.customizations.updateCustomizations);
  const generateUploadUrl = useMutation(api.lib.customizations.generateUploadUrl);
  const createLink = useMutation(api.lib.links.createLink);

  const isUsernameValid = username.length >= 3 && checkAvailability?.available;
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser !== undefined && currentUser !== null) {
      toast.info("Você já está na plataforma! Redirecionando...");
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  useEffect(() => {
    return () => { if (profileImage.preview) URL.revokeObjectURL(profileImage.preview); };
  }, [profileImage.preview]);

  const handleUsernameNext = async () => {
    if (!isUsernameValid) return toast.error("Por favor, escolha um link válido e disponível.");
    setLoading(true);
    try {
      await setUsernameMutation({ username });
      toast.success("Link garantido!");
      setStep("profile");
    } catch (e: any) {
      toast.error(e.message || "Erro ao garantir o link.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileNext = async () => {
    setLoading(true);
    try {
      let profileStorageId = undefined;
      if (profileImage.file) {
        const uploadUrl = await generateUploadUrl({});
        const res = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": profileImage.file.type }, body: profileImage.file });
        const json = await res.json();
        profileStorageId = json.storageId;
      }
      await updateCustomizations({ description: bio, profilePictureStorageId: profileStorageId });
      setStep("link");
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar perfil.");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkNext = async () => {
    setLoading(true);
    try {
      if (linkTitle && linkUrl) {
        let finalUrl = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
        await createLink({ title: linkTitle, url: finalUrl, isFeatured: false, badgeType: undefined });
      }
      setStep("success");
      triggerConfetti();
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar link.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`freelinnk.com/${username}`);
    setCopied(true);
    toast.success("Link copiado para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  const stepOrder: Step[] = ["username", "profile", "link", "success"];
  const currentStepInfo = STEPS[step];
  const progressPercent = (currentStepInfo.num / currentStepInfo.total) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col relative min-h-[500px]">
        {/* Progress Header */}
        <div className="p-6 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <FreelinnkLogo />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Passo {currentStepInfo.num} de {currentStepInfo.total}</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">{currentStepInfo.icon}</div>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === "username" && (
              <motion.div key="username" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Bem-vindo ao FreeLinnk! 🎉</h1>
                  <p className="text-slate-500">Vamos configurar seu perfil de vendas em menos de 2 minutos.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-slate-900 mb-1.5 block">Meu Link Pessoal</label>
                    <div className={cn("flex flex-col sm:flex-row items-center bg-white border-2 rounded-xl transition-all p-1", isUsernameValid ? "border-emerald-500 ring-4 ring-emerald-500/10" : "border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10")}>
                      <span className="px-4 py-3 sm:py-0 text-slate-400 font-bold bg-slate-50 self-stretch flex items-center rounded-lg border border-slate-100 hidden sm:flex">
                        freelinnk.com/
                      </span>
                      <input type="text" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))} placeholder="nomedaloja" className="w-full bg-transparent px-4 py-3 font-bold text-slate-900 text-lg sm:text-base outline-none placeholder:text-slate-300" autoFocus />
                    </div>
                    {debouncedUsername.length >= 3 && checkAvailability && (
                      <p className={cn("text-xs font-bold mt-2", checkAvailability.available ? "text-emerald-600" : "text-red-500")}>
                        {checkAvailability.available ? "✅ Nome disponível!" : "❌ Este nome já está em uso."}
                      </p>
                    )}
                  </div>
                </div>
                <button onClick={handleUsernameNext} disabled={!isUsernameValid || loading} className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                  {loading ? "Verificando..." : "Continuar"} <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Sua Identidade Visual</h1>
                  <p className="text-slate-500">Adicione uma foto e uma bio que chame a atenção.</p>
                </div>
                <div className="space-y-5">
                  <div className="flex flex-col items-center">
                    <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setProfileImage({ file: f, preview: URL.createObjectURL(f) }); }} />
                    <button onClick={() => fileInputRef.current?.click()} className="group relative w-24 h-24 rounded-full bg-indigo-50 border-2 border-dashed border-indigo-200 flex items-center justify-center overflow-hidden hover:border-indigo-400 hover:bg-indigo-100 transition-colors">
                      {profileImage.preview ? (
                        <img src={profileImage.preview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center text-indigo-400 group-hover:text-indigo-600">
                          <Upload className="w-6 h-6 mb-1" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">Upload</span>
                        </div>
                      )}
                    </button>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-900 mb-1.5 block">Nome de Exibição</label>
                    <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Ex: Minha Loja Oficial" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" />
                  </div>
                  <div>
                    <label className="flex items-center justify-between text-sm font-bold text-slate-900 mb-1.5">
                      Bio Curta <span className="text-xs text-slate-400 font-medium">{bio.length}/80</span>
                    </label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 80))} placeholder="Uma frase de impacto sobre seu negócio..." rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none" />
                  </div>
                </div>
                <button onClick={handleProfileNext} disabled={loading} className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]">
                  {loading ? "Salvando..." : "Continuar"} <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === "link" && (
              <motion.div key="link" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Adicione seu primeiro link!</h1>
                  <p className="text-slate-500">Pode ser o link do seu WhatsApp, Loja ou Site.</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl space-y-4">
                  <div>
                    <label className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-1.5 block">Título do Botão</label>
                    <input type="text" value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} placeholder="Ex: Falar no WhatsApp" className="w-full bg-white border border-indigo-200 rounded-lg px-4 py-3 font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-1.5 block">URL / Link</label>
                    <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="Ex: wa.me/5511999999999" className="w-full bg-white border border-indigo-200 rounded-lg px-4 py-3 font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => setStep("success")} className="py-4 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl flex items-center justify-center transition-all w-full sm:w-1/3">
                    Pular
                  </button>
                  <button onClick={handleLinkNext} disabled={loading || (!linkTitle && !linkUrl)} className="py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/25 w-full sm:w-2/3 disabled:opacity-50">
                    {loading ? "Adicionando..." : "Adicionar Link"} <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 text-center py-6">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-900 mb-2">Seu FreeLinnk está pronto! 🚀</h1>
                  <p className="text-slate-500 text-lg">Comece a compartilhar seu link na bio.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 inline-flex items-center gap-3">
                  <span className="text-slate-900 font-bold sm:text-lg select-all">freelinnk.com/{username}</span>
                  <button onClick={copyToClipboard} className="p-2 bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-200 shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/20 active:scale-95">
                    {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <div className="pt-4">
                  <button onClick={() => router.push("/dashboard")} className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
                    Ir para o Dashboard
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Back Button (Footer) */}
        {step !== "username" && step !== "success" && (
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <button onClick={() => setStep(stepOrder[stepOrder.indexOf(step) - 1])} disabled={loading} className="text-slate-500 hover:text-slate-900 text-sm font-bold flex items-center gap-1 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}