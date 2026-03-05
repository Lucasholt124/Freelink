"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Link as LinkIcon,
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
  Rocket,
  PartyPopper,
  Camera,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Globe,
  ExternalLink,
  Palette,
  Gift,
  Shield,
  Clock,
  Lightbulb,
  User,
  Layout,
  FileCheck,
  Hash,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDebounce } from "../hooks/use-debounce";
import {
  HERO_PHRASES,
  LinkItem,
  NicheOption,
  NICHES,
  SOCIAL_PROOF,
  Step,
  TemplateOption,
  TEMPLATES,
} from "../constants/onboarding-data";
import { celebrate, getLinkIcon } from "../constants/onboarding-utils";
import { FreelinnkLogo } from "@/components/onboarding/FreelinnkLogo";
import { PhonePreview } from "@/components/onboarding/PhonePreview";


type ExtendedStep = Step | "review";

interface StepInfo {
  num: number;
  total: number;
  label: string;
  icon: React.ReactNode;
  estimatedTime?: string;
}

const STEP_INFO: Record<ExtendedStep, StepInfo> = {
  welcome: {
    num: 0,
    total: 6,
    label: "Início",
    icon: <Rocket className="w-4 h-4" />,
  },
  name: {
    num: 1,
    total: 6,
    label: "Perfil",
    icon: <User className="w-4 h-4" />,
    estimatedTime: "30s",
  },
  niche: {
    num: 2,
    total: 6,
    label: "Área",
    icon: <Hash className="w-4 h-4" />,
    estimatedTime: "10s",
  },
  username: {
    num: 3,
    total: 6,
    label: "Link",
    icon: <LinkIcon className="w-4 h-4" />,
    estimatedTime: "15s",
  },
  links: {
    num: 4,
    total: 6,
    label: "Links",
    icon: <Layout className="w-4 h-4" />,
    estimatedTime: "45s",
  },
  template: {
    num: 5,
    total: 6,
    label: "Estilo",
    icon: <Palette className="w-4 h-4" />,
    estimatedTime: "15s",
  },
  review: {
    num: 6,
    total: 6,
    label: "Revisar",
    icon: <FileCheck className="w-4 h-4" />,
    estimatedTime: "10s",
  },
  launching: {
    num: 6,
    total: 6,
    label: "Lançando",
    icon: <Rocket className="w-4 h-4" />,
  },
};


const STEP_TIPS: Partial<Record<ExtendedStep, { text: string; icon: React.ReactNode }>> = {
  name: {
    text: "Perfis com foto recebem 3x mais cliques!",
    icon: <Camera className="w-4 h-4" />,
  },
  username: {
    text: "Use algo fácil de lembrar e compartilhar",
    icon: <Lightbulb className="w-4 h-4" />,
  },
  links: {
    text: "Comece com 2-3 links principais. Você pode adicionar mais depois!",
    icon: <Lightbulb className="w-4 h-4" />,
  },
  template: {
    text: "Você pode mudar o template a qualquer momento no dashboard",
    icon: <Palette className="w-4 h-4" />,
  },
};

const detectPlatform = (url: string): { name: string; color: string } | null => {
  const lower = url.toLowerCase();
  if (lower.includes("instagram")) return { name: "Instagram", color: "text-pink-500" };
  if (lower.includes("tiktok")) return { name: "TikTok", color: "text-slate-900" };
  if (lower.includes("youtube")) return { name: "YouTube", color: "text-red-500" };
  if (lower.includes("twitter") || lower.includes("x.com"))
    return { name: "X/Twitter", color: "text-blue-400" };
  if (lower.includes("linkedin")) return { name: "LinkedIn", color: "text-blue-600" };
  if (lower.includes("whatsapp") || lower.includes("wa.me"))
    return { name: "WhatsApp", color: "text-green-500" };
  if (lower.includes("spotify")) return { name: "Spotify", color: "text-green-400" };
  if (lower.includes("github")) return { name: "GitHub", color: "text-slate-700" };
  return null;
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
                  isActive
                    ? "text-violet-600"
                    : isCompleted
                    ? "text-indigo-500"
                    : "text-slate-300"
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

const ContextualTip = ({ step }: { step: ExtendedStep }) => {
  const tip = STEP_TIPS[step];
  if (!tip) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-100"
    >
      <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0 mt-0.5">
        {tip.icon}
      </div>
      <p className="text-amber-700 text-xs font-medium leading-relaxed">{tip.text}</p>
    </motion.div>
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

const CompletionScore = ({
  displayName,
  profileImage,
  bio,
  username,
  links,
  selectedTemplate,
}: {
  displayName: string;
  profileImage: { file: File | null; preview: string | null };
  bio: string;
  username: string;
  links: LinkItem[];
  selectedTemplate: TemplateOption;
}) => {
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

  const color =
    score < 40 ? "text-red-500" : score < 70 ? "text-amber-500" : "text-emerald-500";

  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 relative">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-slate-100"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <motion.path
            className={color}
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            initial={{ strokeDasharray: "0, 100" }}
            animate={{ strokeDasharray: `${score}, 100` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        <span className={cn("absolute inset-0 flex items-center justify-center text-[8px] font-black", color)}>
          {score}
        </span>
      </div>
    </div>
  );
};

const LaunchChecklistItem = ({
  label,
  completed,
  active,
  delay,
}: {
  label: string;
  completed: boolean;
  active: boolean;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className={cn(
      "flex items-center gap-3 p-3 rounded-xl transition-all duration-500",
      completed
        ? "bg-emerald-50 border border-emerald-100"
        : active
        ? "bg-violet-50 border border-violet-200"
        : "bg-slate-50 border border-slate-100"
    )}
  >
    <div
      className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300",
        completed
          ? "bg-emerald-500"
          : active
          ? "bg-violet-500 animate-pulse"
          : "bg-slate-200"
      )}
    >
      {completed ? (
        <Check className="w-4 h-4 text-white" />
      ) : active ? (
        <Loader2 className="w-4 h-4 text-white animate-spin" />
      ) : (
        <div className="w-2 h-2 bg-slate-300 rounded-full" />
      )}
    </div>
    <span
      className={cn(
        "text-sm font-medium transition-colors",
        completed
          ? "text-emerald-700"
          : active
          ? "text-violet-700"
          : "text-slate-400"
      )}
    >
      {label}
    </span>
  </motion.div>
);

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<ExtendedStep>("welcome");
  const [loading, setLoading] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [selectedNiche, setSelectedNiche] = useState<NicheOption | null>(null);
  const [username, setUsername] = useState("");
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateOption>(TEMPLATES[0]);
  const [profileImage, setProfileImage] = useState<{
    file: File | null;
    preview: string | null;
  }>({ file: null, preview: null });
  const [bio, setBio] = useState("");

  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [templateFilter, setTemplateFilter] = useState<
    "all" | "light" | "dark" | "colorful" | "gradient"
  >("all");
  const [launchProgress, setLaunchProgress] = useState(0);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [nicheSearch, setNicheSearch] = useState("");
  const [launchChecklist, setLaunchChecklist] = useState({
    profile: false,
    customization: false,
    links: false,
    publishing: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const debouncedUsername = useDebounce(username, 500);

  const checkAvailability = useQuery(
    api.lib.usernames.checkUsernameAvailability,
    debouncedUsername.length >= 3 ? { username: debouncedUsername } : "skip"
  );
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
    return NICHES.filter(
      (n) =>
        n.name.toLowerCase().includes(nicheSearch.toLowerCase()) ||
        n.description.toLowerCase().includes(nicheSearch.toLowerCase())
    );
  }, [nicheSearch]);

  const validLinksCount = useMemo(
    () => links.filter((l) => l.title && l.url).length,
    [links]
  );

  useEffect(() => {
    if (step !== "welcome") return;
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % HERO_PHRASES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => {
    return () => {
      if (profileImage.preview) {
        URL.revokeObjectURL(profileImage.preview);
      }
    };
  }, [profileImage.preview]);


  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem muito grande. Máximo 5MB.");
        return;
      }
      setProfileImage({
        file,
        preview: URL.createObjectURL(file),
      });
      celebrate("small");
    }
  };

  const handleNicheSelect = (niche: NicheOption) => {
    setSelectedNiche(niche);
    const suggestedLinks = niche.suggestedLinks.map((link, i) => ({
      id: `suggested-${i}`,
      title: link.title,
      url: "",
    }));
    setLinks(suggestedLinks);
    celebrate("medium");
    toast.success(`${niche.emoji} Perfeito!`, {
      description: "Área selecionada com sucesso!",
    });
    setTimeout(() => setStep("username"), 500);
  };

  const handleUsernameSubmit = async () => {
    if (!isUsernameValid) return;
    setLoading(true);

    try {
      await setUsernameMutation({ username });
      celebrate("medium");
      toast.success("Nome reservado! 🎉", {
        description: `freelinnk.com/${username} é seu!`,
      });
      setStep("links");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Erro ao salvar. Tente outro nome."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateLinkUrl = (id: string, url: string) => {
    setLinks((prev) =>
      prev.map((link) =>
        link.id === id
          ? {
              ...link,
              url: url.startsWith("http") ? url : url ? `https://${url}` : "",
            }
          : link
      )
    );
  };

  const addCustomLink = () => {
    setLinks((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, title: "", url: "" },
    ]);
  };

  const updateLinkTitle = (id: string, title: string) => {
    setLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, title } : link))
    );
  };

  const removeLink = (id: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
  };

  const handleLinksSubmit = () => {
    if (validLinksCount === 0) {
      toast.error("Adicione pelo menos 1 link com título e URL");
      return;
    }
    celebrate("medium");
    setStep("template");
  };

  const handleTemplateSelect = (template: TemplateOption) => {
    setSelectedTemplate(template);
    celebrate("small");
  };

  const handleGoToReview = () => {
    celebrate("medium");
    setStep("review");
  };

  const handleLaunch = async () => {
    setStep("launching");
    setLaunchProgress(0);
    setLaunchChecklist({
      profile: false,
      customization: false,
      links: false,
      publishing: false,
    });

    try {
      setLaunchProgress(10);
      await new Promise((r) => setTimeout(r, 400));

      let profileStorageId = undefined;

      if (profileImage.file) {
        setLaunchProgress(15);
        const uploadUrl = await generateUploadUrl({});
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": profileImage.file.type },
          body: profileImage.file,
        });
        const json = await res.json();
        profileStorageId = json.storageId;
      }

      setLaunchProgress(30);
      setLaunchChecklist((prev) => ({ ...prev, profile: true }));
      await new Promise((r) => setTimeout(r, 300));

      await updateCustomizations({
        description:
          bio ||
          `${selectedNiche?.emoji || ""} ${displayName || username}`,
        profilePictureStorageId: profileStorageId,
        accentColor: selectedTemplate.preview.accent,
        backgroundType: selectedTemplate.preview.bg.includes("gradient")
          ? "gradient"
          : "color",
        backgroundColor1: selectedTemplate.preview.bg.includes("gradient")
          ? selectedTemplate.preview.bg.match(/#[a-fA-F0-9]{6}/g)?.[0] ||
            "#667eea"
          : selectedTemplate.preview.bg,
        backgroundColor2: selectedTemplate.preview.bg.includes("gradient")
          ? selectedTemplate.preview.bg.match(/#[a-fA-F0-9]{6}/g)?.[1] ||
            "#764ba2"
          : undefined,
      });

      setLaunchProgress(55);
      setLaunchChecklist((prev) => ({ ...prev, customization: true }));
      await new Promise((r) => setTimeout(r, 300));

      const validLinks = links.filter((l) => l.title && l.url);
      for (let i = 0; i < validLinks.length; i++) {
        const link = validLinks[i];
        await createLink({
          title: link.title,
          url: link.url,
          isFeatured: false,
          badgeType: "new",
        });
        setLaunchProgress(55 + ((i + 1) / validLinks.length) * 30);
      }

      setLaunchChecklist((prev) => ({ ...prev, links: true }));
      await new Promise((r) => setTimeout(r, 300));

      setLaunchProgress(95);
      await new Promise((r) => setTimeout(r, 500));
      setLaunchProgress(100);
      setLaunchChecklist((prev) => ({ ...prev, publishing: true }));

      celebrate("epic");

      setTimeout(() => {
        toast.success("Sua página está no ar! 🚀", {
          description: "Redirecionando para o dashboard...",
        });
      }, 500);

      setTimeout(() => {
        router.push("/dashboard?welcome=true");
      }, 3000);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao criar página. Tente novamente.");
      setStep("review");
    }
  };

  const goBack = () => {
    const order: ExtendedStep[] = [
      "welcome",
      "name",
      "niche",
      "username",
      "links",
      "template",
      "review",
    ];
    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
  };

  const usernameSuggestions = useMemo(() => {
    if (!displayName) return [];
    const base = displayName.toLowerCase().replace(/[^a-z0-9\s]/g, "");
    return [
      base.replace(/\s+/g, ""),
      base.replace(/\s+/g, "."),
      base.replace(/\s+/g, "_"),
      `${base.replace(/\s+/g, "")}oficial`,
    ]
      .map((s) => s.slice(0, 30))
      .filter((s) => s.length >= 3);
  }, [displayName]);



  return (
    <>
      <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">

        <div className="w-full lg:w-[55%] xl:w-[50%] min-h-screen flex flex-col relative z-10 bg-white">

          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-50 via-white to-white opacity-70" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-violet-100/50 to-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-100/50 to-purple-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />


          {step !== "welcome" && step !== "launching" && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative p-4 sm:p-6 space-y-3"
            >

              <div className="flex items-center justify-between">
                <FreelinnkLogo />
                <div className="flex items-center gap-3">
                  <EstimatedTime step={step} />
                  <CompletionScore
                    displayName={displayName}
                    profileImage={profileImage}
                    bio={bio}
                    username={username}
                    links={links}
                    selectedTemplate={selectedTemplate}
                  />
                </div>
              </div>


              <StepProgressBar currentStep={step} />


              <div className="sm:hidden">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-violet-600 font-semibold">
                    {STEP_INFO[step].label}
                  </span>
                  <span className="text-xs text-slate-400">
                    {STEP_INFO[step].num}/{STEP_INFO[step].total}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{
                      width: `${(STEP_INFO[step].num / STEP_INFO[step].total) * 100}%`,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </motion.div>
          )}


          <div className="relative flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="w-full max-w-lg">
              <AnimatePresence mode="wait">

                {step === "welcome" && (
                  <motion.div
                    key="welcome"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <FreelinnkLogo size="large" />
                    </motion.div>

                    <div className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative h-24 sm:h-28"
                      >
                        <AnimatePresence mode="wait">
                          <motion.h1
                            key={currentPhraseIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight"
                          >
                            {HERO_PHRASES[currentPhraseIndex].text}{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                              {HERO_PHRASES[currentPhraseIndex].highlight}
                            </span>
                          </motion.h1>
                        </AnimatePresence>
                      </motion.div>

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-slate-500 text-base sm:text-lg max-w-md"
                      >
                        Reúna seus links, redes sociais e conteúdo em uma página
                        bonita e profissional. Grátis para sempre.
                      </motion.p>
                    </div>


                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="grid grid-cols-3 gap-3"
                    >
                      {[
                        {
                          icon: <Zap className="w-5 h-5" />,
                          text: "Rápido",
                          subtext: "2 min",
                        },
                        {
                          icon: <Shield className="w-5 h-5" />,
                          text: "Gratuito",
                          subtext: "100%",
                        },
                        {
                          icon: <Sparkles className="w-5 h-5" />,
                          text: "Bonito",
                          subtext: "20+ temas",
                        },
                      ].map((feature, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ y: -2, scale: 1.02 }}
                          className="p-3 sm:p-4 rounded-xl bg-white border border-slate-100 shadow-sm text-center cursor-default"
                        >
                          <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-violet-600">
                            {feature.icon}
                          </div>
                          <p className="text-slate-900 font-semibold text-sm">
                            {feature.text}
                          </p>
                          <p className="text-slate-400 text-xs">
                            {feature.subtext}
                          </p>
                        </motion.div>
                      ))}
                    </motion.div>


                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Button
                        onClick={() => setStep("name")}
                        className="w-full h-14 sm:h-16 text-lg sm:text-xl font-bold rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-700 hover:via-indigo-700 hover:to-blue-700 border-0 shadow-xl shadow-violet-500/30 group relative overflow-hidden"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ["-200%", "200%"] }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        <span className="relative flex items-center gap-2">
                          Criar minha página grátis
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </Button>

                      <p className="text-center text-slate-400 text-xs mt-3">
                        Sem cartão de crédito • Sem spam • Cancele quando quiser
                      </p>
                    </motion.div>


                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="pt-4 border-t border-slate-100"
                    >
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="flex -space-x-2">
                          {SOCIAL_PROOF.map((person, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 border-2 border-white flex items-center justify-center text-sm"
                            >
                              {person.avatar}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
                            />
                          ))}
                        </div>
                        <span className="text-slate-500 text-sm font-medium">
                          4.9/5
                        </span>
                      </div>

                      <div className="flex overflow-hidden">
                        <motion.div
                          className="flex gap-4"
                          animate={{ x: [0, -400] }}
                          transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          {[...SOCIAL_PROOF, ...SOCIAL_PROOF].map(
                            (person, i) => (
                              <div
                                key={i}
                                className="flex-shrink-0 p-3 rounded-xl bg-slate-50 border border-slate-100 w-56"
                              >
                                <p className="text-slate-600 text-xs italic mb-2">
                                  {person.text}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">
                                    {person.avatar}
                                  </span>
                                  <div>
                                    <p className="text-slate-900 text-xs font-semibold">
                                      {person.name}
                                    </p>
                                    <p className="text-slate-400 text-[10px]">
                                      {person.role}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}


                {step === "name" && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-5"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg">
                          <Gift className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-slate-900 font-bold">
                            Bem-vindo! 👋
                          </p>
                          <p className="text-slate-500 text-sm">
                            Vamos criar algo incrível juntos
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <div className="space-y-2">
                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900"
                      >
                        Como você se{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                          chama?
                        </span>
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500"
                      >
                        Este nome aparecerá na sua página
                      </motion.p>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-4"
                    >

                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => fileInputRef.current?.click()}
                          className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 border-2 border-dashed border-violet-300 flex items-center justify-center overflow-hidden group"
                        >
                          {profileImage.preview ? (
                            <>
                              <img
                                src={profileImage.preview}
                                className="w-full h-full object-cover"
                                alt=""
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Camera className="w-6 h-6 text-white" />
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <Camera className="w-6 h-6 text-violet-400" />
                              <span className="text-[10px] text-violet-400 font-medium">
                                Foto
                              </span>
                            </div>
                          )}
                        </motion.button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageSelect}
                        />
                        <div className="flex-1">
                          <p className="text-slate-900 font-semibold mb-1">
                            Foto de Perfil
                          </p>
                          <p className="text-slate-400 text-sm">
                            {profileImage.preview
                              ? "✅ Foto adicionada! Clique para trocar"
                              : "Adicionar foto (opcional)"}
                          </p>
                          <div className="flex items-center gap-1 mt-1 text-violet-600 text-xs font-medium">
                            <TrendingUp className="w-3 h-3" />
                            <span>+300% mais cliques com foto</span>
                          </div>
                        </div>
                      </div>


                      <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">
                          Seu nome ou marca
                        </Label>
                        <Input
                          className="h-14 rounded-xl border-slate-200 text-lg font-medium placeholder:text-slate-300 focus-visible:ring-violet-500"
                          placeholder="Ex: João Silva"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (!displayName.trim()) {
                                toast.error("Digite seu nome para continuar");
                                return;
                              }
                              celebrate("small");
                              setStep("niche");
                            }
                          }}
                        />
                        <p className="text-slate-400 text-xs flex items-center gap-1">
                          <span className="text-violet-500">↵</span> Pressione
                          Enter para continuar
                        </p>
                      </div>


                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-slate-700 font-medium">
                            Bio curta (opcional)
                          </Label>
                          <span className="text-slate-400 text-xs">
                            {bio.length}/80
                          </span>
                        </div>
                        <Input
                          className="h-12 rounded-xl border-slate-200 placeholder:text-slate-300 focus-visible:ring-violet-500"
                          placeholder="Ex: Criador de conteúdo | Empreendedor"
                          value={bio}
                          onChange={(e) =>
                            setBio(e.target.value.slice(0, 80))
                          }
                          maxLength={80}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              celebrate("small");
                              setStep("niche");
                            }
                          }}
                        />
                      </div>
                    </motion.div>

                    <ContextualTip step="name" />

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Button
                        onClick={() => {
                          if (!displayName.trim()) {
                            toast.error("Digite seu nome para continuar");
                            return;
                          }
                          celebrate("small");
                          setStep("niche");
                        }}
                        className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 group"
                      >
                        Continuar
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                  </motion.div>
                )}


                {step === "niche" && (
                  <motion.div
                    key="niche"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900"
                      >
                        O que você{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                          faz?
                        </span>
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-500"
                      >
                        Vamos personalizar sua página para sua área 🎯
                      </motion.p>
                    </div>


                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <div className="relative">
                        <Input
                          className="h-11 rounded-xl border-slate-200 pl-10 placeholder:text-slate-300 focus-visible:ring-violet-500"
                          placeholder="Buscar sua área..."
                          value={nicheSearch}
                          onChange={(e) => setNicheSearch(e.target.value)}
                        />
                        <svg
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        {nicheSearch && (
                          <button
                            onClick={() => setNicheSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar pb-2"
                    >
                      {filteredNiches.length === 0 ? (
                        <div className="col-span-full py-8 text-center">
                          <p className="text-slate-400 text-sm">
                            Nenhuma área encontrada.
                          </p>
                          <button
                            onClick={() => setNicheSearch("")}
                            className="text-violet-600 text-sm font-medium mt-2 hover:underline"
                          >
                            Limpar busca
                          </button>
                        </div>
                      ) : (
                        filteredNiches.map((niche, i) => (
                          <motion.button
                            key={niche.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + i * 0.02 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleNicheSelect(niche)}
                            className="relative p-4 rounded-xl bg-white border-2 border-slate-100 hover:border-violet-300 hover:shadow-lg text-left group transition-all"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">{niche.emoji}</span>
                              <div
                                className={cn(
                                  "p-1.5 rounded-lg bg-gradient-to-br text-white",
                                  niche.gradient
                                )}
                              >
                                {niche.icon}
                              </div>
                            </div>
                            <p className="text-slate-900 font-bold text-sm mb-0.5">
                              {niche.name}
                            </p>
                            <p className="text-slate-400 text-xs line-clamp-1">
                              {niche.description}
                            </p>
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/0 to-indigo-500/0 group-hover:from-violet-500/5 group-hover:to-indigo-500/5 transition-all pointer-events-none" />
                          </motion.button>
                        ))
                      )}
                    </motion.div>
                  </motion.div>
                )}


                {step === "username" && (
                  <motion.div
                    key="username"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-5"
                  >
                    {selectedNiche && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3"
                      >
                        <span className="text-2xl">{selectedNiche.emoji}</span>
                        <div>
                          <p className="text-slate-900 font-bold text-sm">
                            {selectedNiche.name}
                          </p>
                          <p className="text-slate-400 text-xs">
                            Ótima escolha!
                          </p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
                      </motion.div>
                    )}

                    <div className="space-y-2">
                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900"
                      >
                        Escolha seu{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                          link único
                        </span>
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500"
                      >
                        Este será o endereço da sua página 🔗
                      </motion.p>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-3"
                    >
                      <div className="relative">
                        <div className="bg-white rounded-2xl border-2 border-slate-200 focus-within:border-violet-500 transition-colors overflow-hidden shadow-sm">
                          <div className="flex items-center">
                            <span className="px-4 py-4 text-slate-400 font-medium text-sm whitespace-nowrap border-r border-slate-200 bg-slate-50">
                              freelinnk.com/
                            </span>
                            <Input
                              className="flex-1 h-14 bg-transparent border-0 text-slate-900 text-lg font-bold placeholder:text-slate-300 focus-visible:ring-0 px-4"
                              placeholder="seu-nome"
                              value={username}
                              onChange={(e) =>
                                setUsername(
                                  e.target.value
                                    .toLowerCase()
                                    .replace(/[^a-z0-9_-]/g, "")
                                    .slice(0, 30)
                                )
                              }
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  if (isUsernameValid && !loading) {
                                    handleUsernameSubmit();
                                  }
                                }
                              }}
                            />
                            <div className="pr-4">
                              <AnimatePresence mode="wait">
                                {username.length >= 3 && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className={cn(
                                      "w-10 h-10 rounded-xl flex items-center justify-center",
                                      debouncedUsername !== username
                                        ? "bg-slate-100"
                                        : checkAvailability?.available
                                        ? "bg-emerald-500"
                                        : checkAvailability === undefined
                                        ? "bg-slate-100"
                                        : "bg-red-500"
                                    )}
                                  >
                                    {debouncedUsername !== username ||
                                    checkAvailability === undefined ? (
                                      <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
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


                      <AnimatePresence>
                        {username.length >= 3 &&
                          debouncedUsername === username &&
                          checkAvailability && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, height: 0 }}
                              animate={{ opacity: 1, y: 0, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className={cn(
                                "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium",
                                checkAvailability.available
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-red-50 text-red-700 border border-red-200"
                              )}
                            >
                              {checkAvailability.available ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                  <span>
                                    Perfeito! Este nome está disponível 🎉
                                  </span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                  <span>
                                    Este nome já está em uso. Tente outro!
                                  </span>
                                </>
                              )}
                            </motion.div>
                          )}
                      </AnimatePresence>

                      {/* Sugestões de username */}
                      {username.length < 3 && usernameSuggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-2"
                        >
                          <p className="text-slate-500 text-xs font-medium">
                            Sugestões baseadas no seu nome:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {usernameSuggestions.map((suggestion) => (
                              <button
                                key={suggestion}
                                onClick={() =>
                                  setUsername(suggestion.slice(0, 30))
                                }
                                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium hover:bg-violet-100 hover:text-violet-700 transition-colors"
                              >
                                {suggestion.slice(0, 20)}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>

                    <ContextualTip step="username" />

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Button
                        onClick={handleUsernameSubmit}
                        disabled={!isUsernameValid || loading}
                        className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 disabled:opacity-50 group"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            Reservar meu link
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </motion.div>

                    <button
                      onClick={() => setShowMobilePreview(true)}
                      className="lg:hidden w-full flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">Ver preview</span>
                    </button>
                  </motion.div>
                )}


                {step === "links" && (
                  <motion.div
                    key="links"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-5"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 text-sm font-semibold">
                        freelinnk.com/{username} é seu!
                      </span>
                    </motion.div>

                    <div className="space-y-2">
                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900"
                      >
                        Adicione seus{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                          links
                        </span>
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-500"
                      >
                        Preencha os links que aparecem no seu perfil
                      </motion.p>
                    </div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-3 max-h-[45vh] overflow-y-auto pr-1 custom-scrollbar"
                    >
                      <AnimatePresence mode="popLayout">
                        {links.map((link, index) => {
                          const suggestedLink =
                            selectedNiche?.suggestedLinks[index];
                          const platform = link.url
                            ? detectPlatform(link.url)
                            : null;

                          return (
                            <motion.div
                              key={link.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: index * 0.05 }}
                              className="p-4 rounded-xl bg-white border-2 border-slate-100 hover:border-violet-200 transition-colors shadow-sm"
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                                  {suggestedLink?.icon ||
                                    getLinkIcon(link.url, link.title)}
                                </div>
                                <div className="flex-1">
                                  {link.id.startsWith("suggested-") ? (
                                    <p className="text-slate-900 font-semibold">
                                      {link.title}
                                    </p>
                                  ) : (
                                    <Input
                                      value={link.title}
                                      onChange={(e) =>
                                        updateLinkTitle(
                                          link.id,
                                          e.target.value
                                        )
                                      }
                                      placeholder="Título do link"
                                      className="h-8 border-0 p-0 text-slate-900 font-semibold placeholder:text-slate-300 focus-visible:ring-0"
                                    />
                                  )}
                                  <p className="text-slate-400 text-xs">
                                    {platform ? (
                                      <span
                                        className={cn(
                                          "font-medium",
                                          platform.color
                                        )}
                                      >
                                        {platform.name} detectado ✓
                                      </span>
                                    ) : suggestedLink ? (
                                      "Cole seu link abaixo"
                                    ) : (
                                      "Link personalizado"
                                    )}
                                  </p>
                                </div>
                                <button
                                  onClick={() => removeLink(link.id)}
                                  className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <Input
                                value={link.url.replace("https://", "")}
                                onChange={(e) =>
                                  updateLinkUrl(link.id, e.target.value)
                                }
                                placeholder={
                                  suggestedLink?.placeholder ||
                                  "https://seulink.com"
                                }
                                className="h-11 rounded-lg border-slate-200 placeholder:text-slate-300 focus-visible:ring-violet-500"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    if (validLinksCount > 0) {
                                      handleLinksSubmit();
                                    } else {
                                      toast.error("Preencha o link antes de continuar");
                                    }
                                  }
                                }}
                              />

                              {link.url && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="mt-2 flex items-center gap-2 text-emerald-600"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span className="text-xs font-medium">
                                    Link adicionado
                                  </span>
                                </motion.div>
                              )}
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>

                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={addCustomLink}
                        className="w-full p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-violet-400 hover:bg-violet-50/50 transition-all flex items-center justify-center gap-2 text-slate-500 hover:text-violet-600"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">
                          Adicionar outro link
                        </span>
                      </motion.button>
                    </motion.div>


                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-500">
                        <LinkIcon className="w-4 h-4" />
                        <span>
                          {validLinksCount} link
                          {validLinksCount !== 1 && "s"} preenchido
                          {validLinksCount !== 1 && "s"}
                        </span>
                      </div>
                      {validLinksCount === 0 && (
                        <span className="text-amber-600 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-4 h-4" />
                          Mínimo 1 link
                        </span>
                      )}
                    </div>

                    <ContextualTip step="links" />

                    <Button
                      onClick={handleLinksSubmit}
                      disabled={validLinksCount === 0}
                      className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 disabled:opacity-50 group"
                    >
                      Continuar
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <button
                      onClick={() => setShowMobilePreview(true)}
                      className="lg:hidden w-full flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">Ver preview</span>
                    </button>
                  </motion.div>
                )}


                {step === "template" && (
                  <motion.div
                    key="template"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-5"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200"
                    >
                      <Sparkles className="w-4 h-4 text-violet-600" />
                      <span className="text-violet-700 text-sm font-semibold">
                        Quase lá! 🎉
                      </span>
                    </motion.div>

                    <div className="space-y-2">
                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900"
                      >
                        Escolha seu{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                          estilo
                        </span>
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-500"
                      >
                        Mais de 20 templates gratuitos para você escolher ✨
                      </motion.p>
                    </div>


                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex gap-2 overflow-x-auto pb-2 no-scrollbar"
                    >
                      {[
                        {
                          id: "all",
                          label: "Todos",
                          count: TEMPLATES.length,
                        },
                        {
                          id: "light",
                          label: "Claros",
                          count: TEMPLATES.filter(
                            (t) => t.category === "light"
                          ).length,
                        },
                        {
                          id: "dark",
                          label: "Escuros",
                          count: TEMPLATES.filter(
                            (t) => t.category === "dark"
                          ).length,
                        },
                        {
                          id: "colorful",
                          label: "Coloridos",
                          count: TEMPLATES.filter(
                            (t) => t.category === "colorful"
                          ).length,
                        },
                        {
                          id: "gradient",
                          label: "Gradientes",
                          count: TEMPLATES.filter(
                            (t) => t.category === "gradient"
                          ).length,
                        },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() =>
                            setTemplateFilter(
                              tab.id as typeof templateFilter
                            )
                          }
                          className={cn(
                            "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all",
                            templateFilter === tab.id
                              ? "bg-violet-600 text-white shadow-lg"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          )}
                        >
                          {tab.label}
                          <span
                            className={cn(
                              "ml-1.5 text-xs",
                              templateFilter === tab.id
                                ? "text-white/70"
                                : "text-slate-400"
                            )}
                          >
                            {tab.count}
                          </span>
                        </button>
                      ))}
                    </motion.div>


                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar pb-2"
                    >
                      <AnimatePresence mode="popLayout">
                        {filteredTemplates.map((template, index) => {
                          const isSelected =
                            selectedTemplate.id === template.id;

                          return (
                            <motion.button
                              key={template.id}
                              layout
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ delay: index * 0.02 }}
                              whileHover={{ scale: 1.03, y: -2 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleTemplateSelect(template)}
                              className={cn(
                                "relative p-2 rounded-xl border-2 transition-all overflow-hidden",
                                isSelected
                                  ? "border-violet-500 shadow-lg ring-2 ring-violet-500/20"
                                  : "border-slate-100 hover:border-slate-200 bg-white"
                              )}
                            >
                              {template.popular && (
                                <div className="absolute top-1 right-1 z-10">
                                  <div className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                                    <Star className="w-2.5 h-2.5 text-white fill-white" />
                                  </div>
                                </div>
                              )}
                              {template.new && (
                                <div className="absolute top-1 right-1 z-10">
                                  <div className="px-1.5 py-0.5 bg-emerald-500 rounded text-[8px] text-white font-bold">
                                    NEW
                                  </div>
                                </div>
                              )}

                              <div
                                className="w-full h-16 sm:h-20 rounded-lg mb-2 overflow-hidden"
                                style={{
                                  background: template.preview.bg,
                                }}
                              >
                                <div className="w-full h-full flex flex-col items-center justify-center p-2">
                                  <div
                                    className="w-4 h-4 rounded-full mb-1"
                                    style={{
                                      background: template.preview.cardBg,
                                    }}
                                  />
                                  <div className="w-full space-y-1">
                                    {[1, 2].map((i) => (
                                      <div
                                        key={i}
                                        className="w-full h-2 rounded"
                                        style={{
                                          background:
                                            template.preview.buttonBg,
                                        }}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <p className="text-slate-700 text-[10px] sm:text-xs font-semibold text-center truncate">
                                {template.name}
                              </p>

                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="absolute top-1 left-1 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center"
                                >
                                  <Check className="w-3 h-3 text-white" />
                                </motion.div>
                              )}
                            </motion.button>
                          );
                        })}
                      </AnimatePresence>
                    </motion.div>

                    <div className="flex items-center justify-center gap-2 py-1 text-sm text-slate-500">
                      <Palette className="w-4 h-4" />
                      <span>
                        Template selecionado:{" "}
                        <strong className="text-slate-700">
                          {selectedTemplate.name}
                        </strong>
                      </span>
                    </div>

                    <ContextualTip step="template" />

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Button
                        onClick={handleGoToReview}
                        className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 group"
                      >
                        Revisar e Lançar
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>

                    <button
                      onClick={() => setShowMobilePreview(true)}
                      className="lg:hidden w-full flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Ver preview final
                      </span>
                    </button>
                  </motion.div>
                )}


                {step === "review" && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-5"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 text-sm font-semibold">
                        Tudo pronto para lançar! 🚀
                      </span>
                    </motion.div>

                    <div className="space-y-2">
                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900"
                      >
                        Revise sua{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                          página
                        </span>
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-500"
                      >
                        Confira se tudo está certo antes de publicar
                      </motion.p>
                    </div>


                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-3"
                    >

                      <div className="p-4 rounded-xl bg-white border-2 border-slate-100 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {profileImage.preview ? (
                            <img
                              src={profileImage.preview}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          ) : (
                            <User className="w-7 h-7 text-violet-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-900 font-bold text-lg truncate">
                            {displayName}
                          </p>
                          {bio && (
                            <p className="text-slate-500 text-sm truncate">
                              {bio}
                            </p>
                          )}
                          <p className="text-violet-600 text-xs font-medium mt-0.5">
                            freelinnk.com/{username}
                          </p>
                        </div>
                        <button
                          onClick={() => setStep("name")}
                          className="text-xs text-violet-600 font-medium hover:underline flex-shrink-0"
                        >
                          Editar
                        </button>
                      </div>


                      {selectedNiche && (
                        <div className="p-4 rounded-xl bg-white border-2 border-slate-100 flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl flex-shrink-0">
                            {selectedNiche.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                              Área
                            </p>
                            <p className="text-slate-900 font-bold">
                              {selectedNiche.name}
                            </p>
                          </div>
                          <button
                            onClick={() => setStep("niche")}
                            className="text-xs text-violet-600 font-medium hover:underline flex-shrink-0"
                          >
                            Mudar
                          </button>
                        </div>
                      )}


                      <div className="p-4 rounded-xl bg-white border-2 border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-slate-400" />
                            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                              Links ({validLinksCount})
                            </p>
                          </div>
                          <button
                            onClick={() => setStep("links")}
                            className="text-xs text-violet-600 font-medium hover:underline"
                          >
                            Editar
                          </button>
                        </div>
                        <div className="space-y-2">
                          {links
                            .filter((l) => l.title && l.url)
                            .slice(0, 4)
                            .map((link) => (
                              <div
                                key={link.id}
                                className="flex items-center gap-3 p-2 rounded-lg bg-slate-50"
                              >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                                  {getLinkIcon(link.url, link.title)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-slate-900 text-sm font-medium truncate">
                                    {link.title}
                                  </p>
                                  <p className="text-slate-400 text-xs truncate">
                                    {link.url.replace("https://", "")}
                                  </p>
                                </div>
                              </div>
                            ))}
                          {validLinksCount > 4 && (
                            <p className="text-slate-400 text-xs text-center py-1">
                              +{validLinksCount - 4} mais
                            </p>
                          )}
                        </div>
                      </div>


                      <div className="p-4 rounded-xl bg-white border-2 border-slate-100 flex items-center gap-4">
                        <div
                          className="w-14 h-14 rounded-2xl flex-shrink-0 overflow-hidden"
                          style={{
                            background: selectedTemplate.preview.bg,
                          }}
                        >
                          <div className="w-full h-full flex flex-col items-center justify-center p-2">
                            <div
                              className="w-3 h-3 rounded-full mb-1"
                              style={{
                                background: selectedTemplate.preview.cardBg,
                              }}
                            />
                            <div className="w-full space-y-0.5">
                              {[1, 2].map((i) => (
                                <div
                                  key={i}
                                  className="w-full h-1.5 rounded"
                                  style={{
                                    background:
                                      selectedTemplate.preview.buttonBg,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                            Template
                          </p>
                          <p className="text-slate-900 font-bold">
                            {selectedTemplate.name}
                          </p>
                        </div>
                        <button
                          onClick={() => setStep("template")}
                          className="text-xs text-violet-600 font-medium hover:underline flex-shrink-0"
                        >
                          Mudar
                        </button>
                      </div>
                    </motion.div>


                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/80 border border-blue-100"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
                        <Lightbulb className="w-4 h-4" />
                      </div>
                      <p className="text-blue-700 text-xs font-medium leading-relaxed">
                        Relaxa! Você pode editar <strong>tudo</strong> isso
                        depois no dashboard. Cores, links, bio, foto — tudo é
                        customizável a qualquer momento.
                      </p>
                    </motion.div>


                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Button
                        onClick={handleLaunch}
                        disabled={loading}
                        className="w-full h-16 text-xl font-black rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-700 hover:via-indigo-700 hover:to-blue-700 shadow-xl shadow-violet-500/30 group relative overflow-hidden"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ["-200%", "200%"] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        <motion.span className="relative flex items-center gap-3">
                          <Rocket className="w-6 h-6" />
                          Publicar minha página!
                          <PartyPopper className="w-5 h-5" />
                        </motion.span>
                      </Button>

                      <p className="text-center text-slate-400 text-xs mt-3">
                        Sua página estará no ar em segundos
                      </p>
                    </motion.div>

                    <button
                      onClick={() => setShowMobilePreview(true)}
                      className="lg:hidden w-full flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Ver preview final
                      </span>
                    </button>
                  </motion.div>
                )}


                {step === "launching" && (
                  <motion.div
                    key="launching"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-8 py-4"
                  >

                    <motion.div
                      animate={{ y: [0, -20, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="relative mx-auto w-28 h-28"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                      <div className="relative w-full h-full bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full flex items-center justify-center">
                        {launchProgress >= 100 ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <PartyPopper className="w-14 h-14 text-violet-600" />
                          </motion.div>
                        ) : (
                          <Rocket className="w-14 h-14 text-violet-600" />
                        )}
                      </div>

                      {launchProgress < 100 &&
                        [...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-violet-400 rounded-full"
                            style={{ left: "50%", bottom: 0 }}
                            animate={{
                              y: [0, 60],
                              x: [(i - 2.5) * 15, (i - 2.5) * 30],
                              opacity: [1, 0],
                              scale: [1, 0.5],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.1,
                              ease: "easeOut",
                            }}
                          />
                        ))}
                    </motion.div>


                    <div className="space-y-2">
                      <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-2xl sm:text-3xl font-black text-slate-900"
                      >
                        {launchProgress < 100
                          ? "Criando sua página..."
                          : "Página criada! 🎉"}
                      </motion.h2>
                      <p className="text-slate-500 text-sm">
                        {launchProgress < 100
                          ? "Isso leva apenas alguns segundos"
                          : "Redirecionando para o dashboard..."}
                      </p>
                    </div>


                    <div className="max-w-sm mx-auto space-y-2 text-left">
                      <LaunchChecklistItem
                        label="Salvando perfil e foto"
                        completed={launchChecklist.profile}
                        active={!launchChecklist.profile && launchProgress > 0}
                        delay={0}
                      />
                      <LaunchChecklistItem
                        label="Aplicando template e cores"
                        completed={launchChecklist.customization}
                        active={
                          launchChecklist.profile &&
                          !launchChecklist.customization
                        }
                        delay={0.1}
                      />
                      <LaunchChecklistItem
                        label={`Adicionando ${validLinksCount} link${validLinksCount !== 1 ? "s" : ""}`}
                        completed={launchChecklist.links}
                        active={
                          launchChecklist.customization &&
                          !launchChecklist.links
                        }
                        delay={0.2}
                      />
                      <LaunchChecklistItem
                        label="Publicando na web"
                        completed={launchChecklist.publishing}
                        active={
                          launchChecklist.links && !launchChecklist.publishing
                        }
                        delay={0.3}
                      />
                    </div>


                    <div className="max-w-xs mx-auto">
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: `${launchProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-slate-400 text-sm mt-2 font-medium">
                        {launchProgress}%
                      </p>
                    </div>


                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: launchProgress >= 100 ? 1 : 0.5,
                        y: 0,
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200"
                    >
                      <Globe className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">
                        freelinnk.com/{username}
                      </span>
                      <ExternalLink className="w-4 h-4 text-emerald-400" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>


          {step !== "welcome" && step !== "launching" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative p-4 sm:p-6 pt-0"
            >
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Voltar</span>
              </button>
            </motion.div>
          )}
        </div>


        <div className="hidden lg:flex flex-1 items-center justify-center relative bg-slate-100 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:2rem_2rem]" />

          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full blur-[150px] opacity-30"
            style={{ background: selectedTemplate.preview.accent }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.35, 0.2],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />


          {step !== "welcome" && step !== "launching" && (
            <PhonePreview
              username={username}
              template={selectedTemplate}
              links={links}
              profileImage={profileImage}
              displayName={displayName}
              bio={bio}
            />
          )}


          {step === "welcome" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-64 h-64 rounded-full border-4 border-dashed border-violet-200"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-violet-500/30">
                    <span className="text-7xl font-black text-white">F</span>
                  </div>
                </div>
              </div>
              <p className="text-slate-400 font-medium">
                Crie sua página em 2 minutos
              </p>
            </motion.div>
          )}


          {step === "launching" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <PhonePreview
                username={username}
                template={selectedTemplate}
                links={links}
                profileImage={profileImage}
                displayName={displayName}
                bio={bio}
              />
            </motion.div>
          )}


          <motion.div
            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-20 right-20 p-3 rounded-xl bg-white shadow-lg border border-slate-200"
          >
            <Heart className="w-6 h-6 text-pink-500" />
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
            className="absolute bottom-28 left-20 p-3 rounded-xl bg-white shadow-lg border border-slate-200"
          >
            <Star className="w-6 h-6 text-amber-500" />
          </motion.div>

          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            className="absolute top-36 left-28 p-3 rounded-xl bg-white shadow-lg border border-slate-200"
          >
            <Sparkles className="w-6 h-6 text-violet-500" />
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0], rotate: [0, -6, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, delay: 0.8 }}
            className="absolute bottom-36 right-28 p-3 rounded-xl bg-white shadow-lg border border-slate-200"
          >
            <Zap className="w-6 h-6 text-cyan-500" />
          </motion.div>


          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute top-8 right-8 p-4 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg border border-slate-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">50k+</p>
                <p className="text-slate-500 text-xs">Criadores ativos</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="absolute bottom-8 left-8 p-4 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg border border-slate-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                <Globe className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">2M+</p>
                <p className="text-slate-500 text-xs">Cliques por mês</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>


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
              <button
                onClick={() => setShowMobilePreview(false)}
                className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute -top-12 left-0 flex items-center gap-2 text-white">
                <Smartphone className="w-4 h-4" />
                <span className="text-sm font-medium">Preview</span>
              </div>

              <PhonePreview
                username={username}
                template={selectedTemplate}
                links={links}
                profileImage={profileImage}
                displayName={displayName}
                bio={bio}
              />

              <p className="text-center text-white/40 text-xs mt-4">
                Toque fora para fechar
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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