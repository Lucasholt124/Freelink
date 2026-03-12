"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  X,
  Smartphone,
  Heart,
  Star,
  Sparkles,
  TrendingUp,
  Globe,
  Rocket,
  User,
  Hash,
  Link as LinkIcon,
  Layout,
  Palette,
  FileCheck,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDebounce } from "../hooks/use-debounce";
import {
  HERO_PHRASES,
  LinkItem,
  NicheOption,
  NICHES,
  Step,
  TemplateOption,
  TEMPLATES,
} from "../constants/onboarding-data";
import { celebrate } from "../constants/onboarding-utils";
import { FreelinnkLogo } from "@/components/onboarding/FreelinnkLogo";
import { PhonePreview } from "@/components/onboarding/PhonePreview";
import { StepWelcome } from "@/components/onboarding/steps/StepWelcome";
import { StepName } from "@/components/onboarding/steps/StepName";
import { StepNiche } from "@/components/onboarding/steps/StepNiche";
import { StepUsername } from "@/components/onboarding/steps/StepUsername";
import { StepLinks } from "@/components/onboarding/steps/StepLinks";
import { StepTemplate } from "@/components/onboarding/steps/StepTemplate";
import { StepReview } from "@/components/onboarding/steps/StepReview";
import { StepLaunching } from "@/components/onboarding/steps/StepLaunching";

type ExtendedStep = Step | "review";

interface StepInfo {
  num: number;
  total: number;
  label: string;
  icon: React.ReactNode;
  estimatedTime?: string;
}

const STEP_INFO: Record<ExtendedStep, StepInfo> = {
  welcome: { num: 0, total: 6, label: "Início", icon: <Rocket className="w-4 h-4" /> },
  name: { num: 1, total: 6, label: "Loja/Perfil", icon: <User className="w-4 h-4" />, estimatedTime: "15s" },
  niche: { num: 2, total: 6, label: "Nicho", icon: <Hash className="w-4 h-4" />, estimatedTime: "10s" },
  username: { num: 3, total: 6, label: "Seu Link", icon: <LinkIcon className="w-4 h-4" />, estimatedTime: "10s" },
  links: { num: 4, total: 6, label: "Produtos", icon: <Layout className="w-4 h-4" />, estimatedTime: "Pular" },
  template: { num: 5, total: 6, label: "Visual", icon: <Palette className="w-4 h-4" />, estimatedTime: "Pular" },
  review: { num: 6, total: 6, label: "Lançar", icon: <FileCheck className="w-4 h-4" />, estimatedTime: "5s" },
  launching: { num: 6, total: 6, label: "Construindo Máquina...", icon: <Rocket className="w-4 h-4" /> },
};

const StepProgressBar = ({ currentStep }: { currentStep: ExtendedStep }) => {
  const steps: ExtendedStep[] = ["name", "niche", "username", "links", "template", "review"];
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="hidden sm:flex items-center gap-1 w-full">
      {steps.map((s, i) => {
        const info = STEP_INFO[s];
        const isActive = i === currentIndex;
        const isCompleted = i < currentIndex;

        return (
          <div key={s} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "w-full h-1.5 rounded-full transition-all duration-500",
                  isCompleted
                    ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                    : isActive
                    ? "bg-gradient-to-r from-emerald-300 to-emerald-400 animate-pulse"
                    : "bg-slate-100"
                )}
              />
              <span
                className={cn(
                  "text-[10px] mt-1 font-bold uppercase tracking-wider transition-colors",
                  isActive ? "text-emerald-600" : isCompleted ? "text-emerald-500" : "text-slate-300"
                )}
              >
                {info.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const EstimatedTime = ({ step }: { step: ExtendedStep }) => {
  const info = STEP_INFO[step];
  if (!info.estimatedTime) return null;

  return (
    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium bg-slate-50 px-2 py-1 rounded-md">
      <Clock className="w-3 h-3 text-slate-500" />
      <span>{info.estimatedTime}</span>
    </div>
  );
};

interface CompletionScoreProps {
  displayName: string;
  profileImage: { file: File | null; preview: string | null };
  bio: string;
  username: string;
  links: LinkItem[];
  selectedTemplate: TemplateOption | null;
}

const CompletionScore = ({
  displayName,
  profileImage,
  bio,
  username,
  links,
  selectedTemplate,
}: CompletionScoreProps) => {
  const score = useMemo(() => {
    let s = 0;
    if (displayName) s += 25; // Peso maior para o nome
    if (username) s += 45; // Peso vital para o @
    if (profileImage.preview) s += 10;
    if (bio) s += 5;
    const validLinks = links.filter((l) => l.title && l.url);
    s += Math.min(validLinks.length * 5, 10);
    if (selectedTemplate) s += 5;
    return Math.min(s, 100);
  }, [displayName, profileImage, bio, username, links, selectedTemplate]);

  const color = score < 50 ? "text-amber-500" : score < 90 ? "text-emerald-400" : "text-emerald-500";

  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 relative group cursor-help">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <path className="text-slate-100" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <motion.path
            className={color} stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            initial={{ strokeDasharray: "0, 100" }} animate={{ strokeDasharray: `${score}, 100` }} transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        <span className={cn("absolute inset-0 flex items-center justify-center text-[9px] font-black", color)}>{score}%</span>
      </div>
    </div>
  );
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<ExtendedStep>("welcome");
  const [loading, setLoading] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [selectedNiche, setSelectedNiche] = useState<NicheOption | null>(null);
  const [username, setUsername] = useState("");
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateOption>(TEMPLATES[0]);
  const [profileImage, setProfileImage] = useState<{ file: File | null; preview: string | null }>({ file: null, preview: null });
  const [bio, setBio] = useState("");
  const [nicheSearch, setNicheSearch] = useState("");

  const currentUser = useQuery(api.users.getMyUsername);

  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [templateFilter, setTemplateFilter] = useState<"all" | "light" | "dark" | "colorful" | "gradient">("all");
  const [launchProgress, setLaunchProgress] = useState(0);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [launchChecklist, setLaunchChecklist] = useState({ profile: false, customization: false, links: false, publishing: false });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const debouncedUsername = useDebounce(username, 500);

  const checkAvailability = useQuery(api.lib.usernames.checkUsernameAvailability, debouncedUsername.length >= 3 ? { username: debouncedUsername } : "skip");
  const setUsernameMutation = useMutation(api.lib.usernames.setUsername);
  const updateCustomizations = useMutation(api.lib.customizations.updateCustomizations);
  const generateUploadUrl = useMutation(api.lib.customizations.generateUploadUrl);
  const createLink = useMutation(api.lib.links.createLink);

  const isUsernameValid = username.length >= 3 && checkAvailability?.available;

  const filteredTemplates = useMemo(() => {
    if (templateFilter === "all") return TEMPLATES;
    return TEMPLATES.filter((t) => t.category === templateFilter);
  }, [templateFilter]);

  const filteredNiches = useMemo(() => {
    if (!nicheSearch) return NICHES;
    return NICHES.filter((n) => n.name.toLowerCase().includes(nicheSearch.toLowerCase()) || n.description.toLowerCase().includes(nicheSearch.toLowerCase()));
  }, [nicheSearch]);

  const validLinksCount = useMemo(() => links.filter((l) => l.title && l.url).length, [links]);

  useEffect(() => {
    if (currentUser !== undefined && currentUser !== null) {
      toast.info("Máquina de vendas identificada! Redirecionando...");
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  const usernameSuggestions = useMemo(() => {
    if (!displayName) return [];
    const base = displayName.toLowerCase().replace(/[^a-z0-9\s]/g, "");
    return [base.replace(/\s+/g, ""), base.replace(/\s+/g, "."), base.replace(/\s+/g, "_"), `${base.replace(/\s+/g, "")}oficial`, `loja${base.replace(/\s+/g, "")}`]
      .map((s) => s.slice(0, 30))
      .filter((s) => s.length >= 3);
  }, [displayName]);

  useEffect(() => {
    if (step !== "welcome") return;
    const interval = setInterval(() => setCurrentPhraseIndex((prev) => (prev + 1) % HERO_PHRASES.length), 3000);
    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => {
    return () => { if (profileImage.preview) URL.revokeObjectURL(profileImage.preview); };
  }, [profileImage.preview]);

  const handleLaunch = async () => {
    setStep("launching");
    setLaunchProgress(0);
    setLaunchChecklist({ profile: false, customization: false, links: false, publishing: false });

    try {
      setLaunchProgress(10);
      await new Promise((r) => setTimeout(r, 400));
      let profileStorageId = undefined;

      if (profileImage.file) {
        setLaunchProgress(15);
        const uploadUrl = await generateUploadUrl({});
        const res = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": profileImage.file.type }, body: profileImage.file });
        const json = await res.json();
        profileStorageId = json.storageId;
      }
      setLaunchProgress(30);
      setLaunchChecklist((prev) => ({ ...prev, profile: true }));
      await new Promise((r) => setTimeout(r, 300));

      await updateCustomizations({
        description: bio || `${selectedNiche?.emoji || "🚀"} Construindo presença digital`,
        profilePictureStorageId: profileStorageId,
        accentColor: selectedTemplate.preview.accent,
        backgroundType: selectedTemplate.preview.bg.includes("gradient") ? "gradient" : "color",
        backgroundColor1: selectedTemplate.preview.bg.includes("gradient") ? selectedTemplate.preview.bg.match(/#[a-fA-F0-9]{6}/g)?.[0] || "#0f172a" : selectedTemplate.preview.bg,
        backgroundColor2: selectedTemplate.preview.bg.includes("gradient") ? selectedTemplate.preview.bg.match(/#[a-fA-F0-9]{6}/g)?.[1] || "#1e1b4b" : undefined,
      });

      setLaunchProgress(55);
      setLaunchChecklist((prev) => ({ ...prev, customization: true }));
      await new Promise((r) => setTimeout(r, 300));

      const validLinks = links.filter((l) => l.title && l.url);
      for (let i = 0; i < validLinks.length; i++) {
        await createLink({ title: validLinks[i].title, url: validLinks[i].url, isFeatured: false, badgeType: "new" });
        setLaunchProgress(55 + ((i + 1) / validLinks.length) * 30);
      }

      setLaunchChecklist((prev) => ({ ...prev, links: true }));
      await new Promise((r) => setTimeout(r, 300));

      setLaunchProgress(95);
      await new Promise((r) => setTimeout(r, 500));
      setLaunchProgress(100);
      setLaunchChecklist((prev) => ({ ...prev, publishing: true }));
      celebrate("epic");

      setTimeout(() => { toast.success("Máquina Ligada! 🚀", { description: "Indo para o painel..." }); }, 500);
      setTimeout(() => { router.push("/dashboard?welcome=true"); }, 3000);
    } catch (e) {
      console.error(e);
      toast.error("Erro na conexão. Tente novamente.");
      setStep("review");
    }
  };

  const goBack = () => {
    const order: ExtendedStep[] = ["welcome", "name", "niche", "username", "links", "template", "review"];
    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row overflow-hidden font-sans">

        {/* Painel Esquerdo (Formulários) */}
        <div className="w-full lg:w-[55%] xl:w-[50%] min-h-screen flex flex-col relative z-10 bg-white border-r border-slate-200 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white pointer-events-none" />

          {step !== "welcome" && step !== "launching" && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative p-4 sm:p-6 space-y-3 bg-white/80 backdrop-blur-md border-b border-slate-100 z-20">
              <div className="flex items-center justify-between">
                <FreelinnkLogo />
                <div className="flex items-center gap-3">
                  <EstimatedTime step={step} />
                  <CompletionScore displayName={displayName} profileImage={profileImage} bio={bio} username={username} links={links} selectedTemplate={selectedTemplate} />
                </div>
              </div>
              <StepProgressBar currentStep={step} />

              {/* Barra Mobile */}
              <div className="sm:hidden">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider">{STEP_INFO[step].label}</span>
                  <span className="text-xs font-bold text-slate-400">{STEP_INFO[step].num}/{STEP_INFO[step].total}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-emerald-500 rounded-full" initial={{ width: "0%" }} animate={{ width: `${(STEP_INFO[step].num / STEP_INFO[step].total) * 100}%` }} transition={{ duration: 0.5 }} />
                </div>
              </div>
            </motion.div>
          )}

          <div className="relative flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="w-full max-w-md">
              <AnimatePresence mode="wait">
                {step === "welcome" && <StepWelcome onNext={() => setStep("name")} currentPhraseIndex={currentPhraseIndex} />}

                {step === "name" && (
                  <StepName
                    displayName={displayName} setDisplayName={setDisplayName} bio={bio} setBio={setBio}
                    profileImage={profileImage} fileInputRef={fileInputRef}
                    onImageSelect={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) { toast.error("A foto deve ter no máximo 5MB."); return; }
                        setProfileImage({ file, preview: URL.createObjectURL(file) });
                      }
                    }}
                    onNext={() => setStep("niche")}
                  />
                )}

                {step === "niche" && (
                  <StepNiche
                    nicheSearch={nicheSearch} setNicheSearch={setNicheSearch} filteredNiches={filteredNiches}
                    onNicheSelect={(niche) => {
                      setSelectedNiche(niche);
                      // Dica: Não criamos links vazios sugeridos se ele não tiver colocado, deixamos para adicionar no painel se quiser.
                      setLinks(niche.suggestedLinks.slice(0, 2).map((link, i) => ({ id: `suggested-${i}`, title: link.title, url: "" })));
                      celebrate("small");
                      setTimeout(() => setStep("username"), 400);
                    }}
                  />
                )}

                {step === "username" && (
                  <StepUsername
                    selectedNiche={selectedNiche} username={username} setUsername={setUsername}
                    debouncedUsername={debouncedUsername} checkAvailability={checkAvailability}
                    isUsernameValid={!!isUsernameValid} loading={loading}
                    usernameSuggestions={usernameSuggestions} onShowPreview={() => setShowMobilePreview(true)}
                    onSubmit={async () => {
                      setLoading(true);
                      try {
                        await setUsernameMutation({ username });
                        celebrate("medium");
                        setStep("links");
                      } catch (e: unknown) {
                        const message = e instanceof Error ? e.message : "Esse nome já está em uso.";
                        toast.error(message);
                      } finally {
                        setLoading(false);
                      }
                    }}
                  />
                )}

                {step === "links" && (
                  <StepLinks
                    username={username} links={links} selectedNiche={selectedNiche}
                    updateLinkTitle={(id, title) => setLinks(p => p.map(l => l.id === id ? { ...l, title } : l))}
                    updateLinkUrl={(id, url) => setLinks(p => p.map(l => l.id === id ? { ...l, url: url.startsWith("http") ? url : url ? `https://${url}` : "" } : l))}
                    removeLink={(id) => setLinks(p => p.filter(l => l.id !== id))}
                    addCustomLink={() => setLinks(p => [...p, { id: `custom-${Date.now()}`, title: "", url: "" }])}
                    validLinksCount={validLinksCount} onShowPreview={() => setShowMobilePreview(true)}
                    onSubmit={() => { celebrate("small"); setStep("template"); }}
                  />
                )}

                {step === "template" && (
                  <StepTemplate
                    selectedTemplate={selectedTemplate} setSelectedTemplate={(t) => { setSelectedTemplate(t); celebrate("small"); }}
                    templateFilter={templateFilter} setTemplateFilter={setTemplateFilter} filteredTemplates={filteredTemplates}
                    templatesLength={TEMPLATES.length} templatesLightCount={TEMPLATES.filter(t => t.category === "light").length}
                    templatesDarkCount={TEMPLATES.filter(t => t.category === "dark").length} templatesColorfulCount={TEMPLATES.filter(t => t.category === "colorful").length}
                    templatesGradientCount={TEMPLATES.filter(t => t.category === "gradient").length}
                    onNext={() => { celebrate("medium"); setStep("review"); }} onShowPreview={() => setShowMobilePreview(true)}
                  />
                )}

                {step === "review" && (
                  <StepReview
                    displayName={displayName} bio={bio} username={username} profileImage={profileImage} selectedNiche={selectedNiche}
                    links={links} validLinksCount={validLinksCount} selectedTemplate={selectedTemplate} loading={loading}
                    onEditStep={(s) => setStep(s)} onLaunch={handleLaunch} onShowPreview={() => setShowMobilePreview(true)}
                  />
                )}

                {step === "launching" && (
                  <StepLaunching launchProgress={launchProgress} launchChecklist={launchChecklist} validLinksCount={validLinksCount} username={username} />
                )}
              </AnimatePresence>
            </div>
          </div>

          {step !== "welcome" && step !== "launching" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative p-4 sm:p-6 bg-white border-t border-slate-100 z-20">
              <button onClick={goBack} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-900 transition-colors font-bold px-3 py-2 rounded-lg hover:bg-slate-100">
                <ChevronLeft className="w-4 h-4" /> <span className="text-sm">Voltar</span>
              </button>
            </motion.div>
          )}
        </div>

        {/* Painel Direito (Preview do Celular) */}
        <div className="hidden lg:flex flex-1 items-center justify-center relative bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem]" />

          <motion.div className="absolute w-[600px] h-[600px] rounded-full blur-[150px] opacity-20" style={{ background: selectedTemplate.preview.accent }} animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 5, repeat: Infinity }} />

          {step !== "welcome" && step !== "launching" && (
            <PhonePreview username={username} template={selectedTemplate} links={links} profileImage={profileImage} displayName={displayName} bio={bio} />
          )}

          {step === "welcome" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 z-10">
              <div className="relative">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="w-64 h-64 rounded-full border-4 border-dashed border-slate-700/50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 border border-white/10">
                    <span className="text-7xl font-black text-white">F</span>
                  </div>
                </div>
              </div>
              <p className="text-slate-400 font-bold tracking-widest uppercase text-sm">Central de Negócios</p>
            </motion.div>
          )}

          {step === "launching" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center z-10">
              <PhonePreview username={username} template={selectedTemplate} links={links} profileImage={profileImage} displayName={displayName} bio={bio} />
            </motion.div>
          )}

          {/* Decorativos Flutuantes no Painel Escuro */}
          <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-20 right-20 p-3 rounded-2xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/10"><Heart className="w-6 h-6 text-pink-400" /></motion.div>
          <motion.div animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }} className="absolute bottom-32 left-20 p-3 rounded-2xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/10"><Star className="w-6 h-6 text-amber-400" /></motion.div>
          <motion.div animate={{ y: [0, -8, 0], rotate: [0, 8, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} className="absolute top-40 left-24 p-3 rounded-2xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/10"><Sparkles className="w-6 h-6 text-emerald-400" /></motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="absolute top-8 right-8 p-4 rounded-2xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-white" /></div>
              <div><p className="text-2xl font-black text-white">Pixel</p><p className="text-slate-300 text-xs font-medium uppercase">Pronto p/ Ativar</p></div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="absolute bottom-12 left-8 p-4 rounded-2xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center"><Globe className="w-6 h-6 text-white" /></div>
              <div><p className="text-2xl font-black text-white">Tráfego</p><p className="text-slate-300 text-xs font-medium uppercase">Rede Conectada</p></div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Preview Mobile Overlay */}
      <AnimatePresence>
        {showMobilePreview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4 lg:hidden" onClick={() => setShowMobilePreview(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="relative">
              <button onClick={() => setShowMobilePreview(false)} className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"><X className="w-5 h-5" /></button>
              <div className="absolute -top-12 left-0 flex items-center gap-2 text-white"><Smartphone className="w-4 h-4" /><span className="text-sm font-bold uppercase tracking-wider">Preview de Vendas</span></div>
              <PhonePreview username={username} template={selectedTemplate} links={links} profileImage={profileImage} displayName={displayName} bio={bio} />
              <p className="text-center text-white/40 text-xs mt-4 font-medium uppercase tracking-widest">Toque fora para voltar</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}