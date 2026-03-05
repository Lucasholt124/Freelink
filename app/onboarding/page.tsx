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
  Zap,
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
  name: { num: 1, total: 6, label: "Perfil", icon: <User className="w-4 h-4" />, estimatedTime: "30s" },
  niche: { num: 2, total: 6, label: "Área", icon: <Hash className="w-4 h-4" />, estimatedTime: "10s" },
  username: { num: 3, total: 6, label: "Link", icon: <LinkIcon className="w-4 h-4" />, estimatedTime: "15s" },
  links: { num: 4, total: 6, label: "Links", icon: <Layout className="w-4 h-4" />, estimatedTime: "45s" },
  template: { num: 5, total: 6, label: "Estilo", icon: <Palette className="w-4 h-4" />, estimatedTime: "15s" },
  review: { num: 6, total: 6, label: "Revisar", icon: <FileCheck className="w-4 h-4" />, estimatedTime: "10s" },
  launching: { num: 6, total: 6, label: "Lançando", icon: <Rocket className="w-4 h-4" /> },
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
                    ? "bg-gradient-to-r from-violet-500 to-indigo-500"
                    : isActive
                    ? "bg-gradient-to-r from-violet-400 to-indigo-400 animate-pulse"
                    : "bg-slate-100"
                )}
              />
              <span
                className={cn(
                  "text-[10px] mt-1 font-medium transition-colors",
                  isActive ? "text-violet-600" : isCompleted ? "text-indigo-500" : "text-slate-300"
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
    <div className="flex items-center gap-1.5 text-slate-400 text-xs">
      <Clock className="w-3 h-3" />
      <span>~{info.estimatedTime}</span>
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
    if (displayName) s += 15;
    if (profileImage.preview) s += 20;
    if (bio) s += 10;
    if (username) s += 15;
    const validLinks = links.filter((l) => l.title && l.url);
    s += Math.min(validLinks.length * 10, 30);
    if (selectedTemplate) s += 10;
    return Math.min(s, 100);
  }, [displayName, profileImage, bio, username, links, selectedTemplate]);

  const color = score < 40 ? "text-red-500" : score < 70 ? "text-amber-500" : "text-emerald-500";

  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 relative">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <path className="text-slate-100" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <motion.path
            className={color} stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            initial={{ strokeDasharray: "0, 100" }} animate={{ strokeDasharray: `${score}, 100` }} transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        <span className={cn("absolute inset-0 flex items-center justify-center text-[8px] font-black", color)}>{score}</span>
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
    // Se terminou de carregar (não é undefined) e achou um usuário (não é null)
    if (currentUser !== undefined && currentUser !== null) {
      toast.info("Você já configurou sua página! Redirecionando...");
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  const usernameSuggestions = useMemo(() => {
    if (!displayName) return [];
    const base = displayName.toLowerCase().replace(/[^a-z0-9\s]/g, "");
    return [base.replace(/\s+/g, ""), base.replace(/\s+/g, "."), base.replace(/\s+/g, "_"), `${base.replace(/\s+/g, "")}oficial`]
      .map((s) => s.slice(0, 30))
      .filter((s) => s.length >= 3);
  }, [displayName]);

  // Efeitos
  useEffect(() => {
    if (step !== "welcome") return;
    const interval = setInterval(() => setCurrentPhraseIndex((prev) => (prev + 1) % HERO_PHRASES.length), 3000);
    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => {
    return () => { if (profileImage.preview) URL.revokeObjectURL(profileImage.preview); };
  }, [profileImage.preview]);

  //  Lógica
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
        description: bio || `${selectedNiche?.emoji || ""} ${displayName || username}`,
        profilePictureStorageId: profileStorageId,
        accentColor: selectedTemplate.preview.accent,
        backgroundType: selectedTemplate.preview.bg.includes("gradient") ? "gradient" : "color",
        backgroundColor1: selectedTemplate.preview.bg.includes("gradient") ? selectedTemplate.preview.bg.match(/#[a-fA-F0-9]{6}/g)?.[0] || "#667eea" : selectedTemplate.preview.bg,
        backgroundColor2: selectedTemplate.preview.bg.includes("gradient") ? selectedTemplate.preview.bg.match(/#[a-fA-F0-9]{6}/g)?.[1] || "#764ba2" : undefined,
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

      setTimeout(() => { toast.success("Sua página está no ar! 🚀", { description: "Redirecionando para o dashboard..." }); }, 500);
      setTimeout(() => { router.push("/dashboard?welcome=true"); }, 3000);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao criar página. Tente novamente.");
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
      <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
        {/* Painel Esquerdo */}
        <div className="w-full lg:w-[55%] xl:w-[50%] min-h-screen flex flex-col relative z-10 bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-50 via-white to-white opacity-70" />

          {step !== "welcome" && step !== "launching" && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative p-4 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <FreelinnkLogo />
                <div className="flex items-center gap-3">
                  <EstimatedTime step={step} />
                  <CompletionScore displayName={displayName} profileImage={profileImage} bio={bio} username={username} links={links} selectedTemplate={selectedTemplate} />
                </div>
              </div>
              <StepProgressBar currentStep={step} />
              <div className="sm:hidden">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-violet-600 font-semibold">{STEP_INFO[step].label}</span>
                  <span className="text-xs text-slate-400">{STEP_INFO[step].num}/{STEP_INFO[step].total}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full" initial={{ width: "0%" }} animate={{ width: `${(STEP_INFO[step].num / STEP_INFO[step].total) * 100}%` }} transition={{ duration: 0.5 }} />
                </div>
              </div>
            </motion.div>
          )}

          <div className="relative flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="w-full max-w-lg">
              <AnimatePresence mode="wait">
                {step === "welcome" && <StepWelcome onNext={() => setStep("name")} currentPhraseIndex={currentPhraseIndex} />}

                {step === "name" && (
                  <StepName
                    displayName={displayName} setDisplayName={setDisplayName} bio={bio} setBio={setBio}
                    profileImage={profileImage} fileInputRef={fileInputRef}
                    onImageSelect={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) { toast.error("Máximo 5MB."); return; }
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
                      setLinks(niche.suggestedLinks.map((link, i) => ({ id: `suggested-${i}`, title: link.title, url: "" })));
                      celebrate("medium");
                      setTimeout(() => setStep("username"), 500);
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
                        const message =
                          e instanceof Error ? e.message : "Ocorreu um erro ao salvar o username.";
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
                    onSubmit={() => { celebrate("medium"); setStep("template"); }}
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative p-4 sm:p-6 pt-0">
              <button onClick={goBack} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                <ChevronLeft className="w-4 h-4" /> <span className="text-sm font-medium">Voltar</span>
              </button>
            </motion.div>
          )}
        </div>

        {/* Painel Direito (Preview) */}
        <div className="hidden lg:flex flex-1 items-center justify-center relative bg-slate-100 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:2rem_2rem]" />
          <motion.div className="absolute w-[500px] h-[500px] rounded-full blur-[150px] opacity-30" style={{ background: selectedTemplate.preview.accent }} animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.35, 0.2] }} transition={{ duration: 4, repeat: Infinity }} />

          {step !== "welcome" && step !== "launching" && (
            <PhonePreview username={username} template={selectedTemplate} links={links} profileImage={profileImage} displayName={displayName} bio={bio} />
          )}

          {step === "welcome" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
              <div className="relative">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="w-64 h-64 rounded-full border-4 border-dashed border-violet-200" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-violet-500/30">
                    <span className="text-7xl font-black text-white">F</span>
                  </div>
                </div>
              </div>
              <p className="text-slate-400 font-medium">Crie sua página em 2 minutos</p>
            </motion.div>
          )}

          {step === "launching" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <PhonePreview username={username} template={selectedTemplate} links={links} profileImage={profileImage} displayName={displayName} bio={bio} />
            </motion.div>
          )}

          {/* Decorativos */}
          <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-20 right-20 p-3 rounded-xl bg-white shadow-lg border border-slate-200"><Heart className="w-6 h-6 text-pink-500" /></motion.div>
          <motion.div animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }} className="absolute bottom-28 left-20 p-3 rounded-xl bg-white shadow-lg border border-slate-200"><Star className="w-6 h-6 text-amber-500" /></motion.div>
          <motion.div animate={{ y: [0, -8, 0], rotate: [0, 8, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} className="absolute top-36 left-28 p-3 rounded-xl bg-white shadow-lg border border-slate-200"><Sparkles className="w-6 h-6 text-violet-500" /></motion.div>
          <motion.div animate={{ y: [0, 8, 0], rotate: [0, -6, 0] }} transition={{ duration: 4.5, repeat: Infinity, delay: 0.8 }} className="absolute bottom-36 right-28 p-3 rounded-xl bg-white shadow-lg border border-slate-200"><Zap className="w-6 h-6 text-cyan-500" /></motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="absolute top-8 right-8 p-4 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-emerald-600" /></div>
              <div><p className="text-2xl font-black text-slate-900">50k+</p><p className="text-slate-500 text-xs">Criadores ativos</p></div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="absolute bottom-8 left-8 p-4 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center"><Globe className="w-6 h-6 text-violet-600" /></div>
              <div><p className="text-2xl font-black text-slate-900">2M+</p><p className="text-slate-500 text-xs">Cliques por mês</p></div>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showMobilePreview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4 lg:hidden" onClick={() => setShowMobilePreview(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="relative">
              <button onClick={() => setShowMobilePreview(false)} className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"><X className="w-5 h-5" /></button>
              <div className="absolute -top-12 left-0 flex items-center gap-2 text-white"><Smartphone className="w-4 h-4" /><span className="text-sm font-medium">Preview</span></div>
              <PhonePreview username={username} template={selectedTemplate} links={links} profileImage={profileImage} displayName={displayName} bio={bio} />
              <p className="text-center text-white/40 text-xs mt-4">Toque fora para fechar</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}