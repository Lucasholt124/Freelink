"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Copy, X, Loader2, Shield, Crown, Zap, CheckCircle2,
  Clock, MessageCircle, ChevronRight, Sparkles, Star,
  ArrowRight, Gift
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import clsx from "clsx";
import { useClipboard } from "@/app/hooks/useClipboard";
import { usePersistentTimer } from "@/app/hooks/usePersistentTimer";


interface WelcomeModalProps {
  username: string;
}

type PlanType = "pro" | "ultra";
type CycleType = "monthly" | "yearly";


const WHATSAPP_NUMBER = "5579999383543";
const TIMER_SECONDS = 900; // 15 minutos

const BENEFITS = {
  pro: [
    { text: "Gerador de conteúdo com IA", highlight: false },
    { text: "Economize 3h por dia", highlight: true },
    { text: "Roteiros virais automáticos", highlight: false },
    { text: "Página sem branding Freelinnk", highlight: false },
  ],
  ultra: [
    { text: "Tudo do Pro + IA ilimitada", highlight: false },
    { text: "Fotos profissionais em 1 clique", highlight: true },
    { text: "Analytics completo de visitantes", highlight: false },
    { text: "Suporte VIP prioritário", highlight: false },
  ],
} as const;

const FEATURE_PREVIEW = [
  {
    icon: Sparkles,
    label: "IA para conteúdo",
    color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30",
  },
  {
    icon: Crown,
    label: "Analytics completo",
    color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30",
  },
  {
    icon: Shield,
    label: "Sem branding",
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    icon: Zap,
    label: "Suporte VIP",
    color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
  },
] as const;

const SOCIAL_PROOF_GRADIENTS = [
  "from-blue-400 to-indigo-500",
  "from-purple-400 to-pink-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
] as const;


export default function WelcomeModal({ username }: WelcomeModalProps) {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("ultra");
  const [billingCycle, setBillingCycle] = useState<CycleType>("monthly");
  const [step, setStep] = useState<"welcome" | "plans">("welcome");

  const { copied, copy } = useClipboard({ resetDelay: 2500 });
  const { formatted, timeLeft, isExpired } = usePersistentTimer({
    durationSeconds: TIMER_SECONDS,
    storageKey: "welcome_offer",
    enabled: showWelcomeModal,
  });

  const getProfileUrl = useCallback(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/${username}`;
    }
    return `https://freelinnk.com/${username}`;
  }, [username]);

  const getDisplayUrl = useCallback(() => {
    return `freelinnk.com/${username}`;
  }, [username]);

  const getOriginalPrice = () => {
    if (selectedPlan === "pro") {
      return billingCycle === "monthly" ? "R$ 34,90" : "R$ 349,00";
    }
    return billingCycle === "monthly" ? "R$ 77,90" : "R$ 779,00";
  };


  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("welcome") === "true") {
      setShowWelcomeModal(true);
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);


  useEffect(() => {
    if (showWelcomeModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showWelcomeModal]);


  const handleClose = () => setShowWelcomeModal(false);

  const handleCopyLink = useCallback(async () => {
    const url = getProfileUrl();
    const success = await copy(url);

    if (success) {
      toast.success("Link copiado! Cole na sua bio agora 🎉");
    } else {
      toast("Copie seu link manualmente:", {
        description: url,
        duration: 10000,
      });
    }
  }, [getProfileUrl, copy]);

  const handleWhatsApp = () => {
    const text =
      "Olá! Acabei de criar minha página no Freelinnk e quero aproveitar a oferta de 7 dias grátis. Pode me ajudar?";
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const handleStartTrial = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          cycle: billingCycle,
        }),
      });

      // Verifica se a resposta do servidor é válida
      if (!res.ok) {
        let errorMessage = `Erro do servidor (${res.status})`;
        try {
          const errorData = await res.json();
          if (errorData.error || errorData.message) {
            errorMessage = errorData.error || errorData.message;
          }
        } catch {
          console.warn(
            "[Stripe Checkout] Resposta não-JSON, status:",
            res.status
          );
        }
        throw new Error(errorMessage);
      }

      // Só parseia JSON depois de confirmar res.ok
      const data = await res.json();

      if (data.url && typeof data.url === "string") {
        window.location.href = data.url;
        return; // Não faz setLoading(false) pois vai redirecionar
      }

      throw new Error("Resposta inválida do servidor. Tente novamente.");
    } catch (error) {
      const message =
        error instanceof TypeError && error.message === "Failed to fetch"
          ? "Sem conexão. Verifique sua internet e tente novamente."
          : error instanceof Error
            ? error.message
            : "Erro inesperado. Tente novamente.";

      console.error("[Stripe Checkout] Erro:", error);
      toast.error(message);
      setLoading(false);
    }
  };


  if (!showWelcomeModal) return null;

  return (
    <AnimatePresence>
      {showWelcomeModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-[460px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden relative flex flex-col"
              style={{ maxHeight: "90vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-sm transition-all group"
                aria-label="Fechar modal"
              >
                <X
                  size={16}
                  className="text-white/80 group-hover:text-white transition-colors"
                />
              </button>

              <div className="overflow-y-auto overscroll-contain flex-1">
                <AnimatePresence mode="wait">
                  {step === "welcome" ? (
                    <WelcomeStep
                      username={username}
                      displayUrl={getDisplayUrl()}
                      copied={copied}
                      onCopy={handleCopyLink}
                      onNext={() => setStep("plans")}
                      onClose={handleClose}
                    />
                  ) : (
                    <PlansStep
                      selectedPlan={selectedPlan}
                      billingCycle={billingCycle}
                      loading={loading}
                      timerFormatted={formatted}
                      timeLeft={timeLeft}
                      isExpired={isExpired}
                      originalPrice={getOriginalPrice()}
                      onSelectPlan={setSelectedPlan}
                      onSelectCycle={setBillingCycle}
                      onStartTrial={handleStartTrial}
                      onWhatsApp={handleWhatsApp}
                      onBack={() => setStep("welcome")}
                      onClose={handleClose}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


interface WelcomeStepProps {
  username: string;
  displayUrl: string;
  copied: boolean;
  onCopy: () => void;
  onNext: () => void;
  onClose: () => void;
}

function WelcomeStep({
  username,
  displayUrl,
  copied,
  onCopy,
  onNext,
  onClose,
}: WelcomeStepProps) {
  return (
    <motion.div
      key="welcome"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.2 }}
    >
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-6 pt-8 pb-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{ y: [0, -10, 0], opacity: [0.2, 0.5, 0.2] }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
            className="flex items-center gap-2 mb-4"
          >
            <div className="p-2 bg-emerald-500/20 rounded-full">
              <CheckCircle2 size={20} className="text-emerald-400" />
            </div>
            <span className="text-emerald-400 text-sm font-semibold">
              Página criada com sucesso!
            </span>
          </motion.div>

          <h2 className="text-2xl font-black text-white mb-2 leading-tight">
            Bem-vindo ao Freelinnk,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              {username}
            </span>{" "}
            🎉
          </h2>

          <p className="text-slate-400 text-sm leading-relaxed">
            Sua página já está no ar. Copie o link e compartilhe agora.
          </p>
        </div>
      </div>

      <div className="px-6 relative z-10">
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={onCopy}
          className={clsx(
            "flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border-2 shadow-lg mt-[-20px]",
            copied
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
          )}
        >
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-slate-400 font-medium mb-0.5">
              Seu link exclusivo
            </p>
            <p className="text-slate-900 dark:text-white font-bold text-base truncate font-mono">
              {displayUrl}
            </p>
          </div>
          <div
            className={clsx(
              "shrink-0 p-3 rounded-xl transition-all shadow-lg",
              copied
                ? "bg-emerald-500 shadow-emerald-500/25"
                : "bg-indigo-600 shadow-indigo-500/25"
            )}
          >
            {copied ? (
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
              >
                <Check size={18} className="text-white" strokeWidth={3} />
              </motion.div>
            ) : (
              <Copy size={18} className="text-white" />
            )}
          </div>
        </motion.div>
      </div>

      <div className="px-6 mt-4">
        <div className="flex items-center justify-center gap-2 py-2">
          <div className="flex -space-x-1.5">
            {SOCIAL_PROOF_GRADIENTS.map((gradient, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-full bg-gradient-to-br ${gradient} border-2 border-white dark:border-slate-900`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500 font-medium">
            <span className="text-slate-700 dark:text-slate-300 font-bold">
              2.847
            </span>{" "}
            criadores ativos esta semana
          </span>
        </div>
      </div>

      <div className="px-6 my-4">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
      </div>

      <div className="px-6 pb-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Quer crescer{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              3x mais rápido
            </span>
            ?
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Teste todas as ferramentas por 7 dias. Grátis.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-5">
          {FEATURE_PREVIEW.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`flex items-center gap-2 p-2.5 rounded-xl ${feat.color}`}
            >
              <feat.icon size={14} />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {feat.label}
              </span>
            </motion.div>
          ))}
        </div>

        <Button
          onClick={onNext}
          className="w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-xl shadow-purple-500/20 transition-all hover:shadow-purple-500/30 hover:scale-[1.01]"
        >
          <Gift size={18} className="mr-2" />
          Quero testar 7 dias grátis
          <ArrowRight size={16} className="ml-2" />
        </Button>

        <button
          onClick={onClose}
          className="w-full mt-3 py-3 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors text-center"
        >
          Continuar com o plano gratuito →
        </button>
      </div>
    </motion.div>
  );
}


interface PlansStepProps {
  selectedPlan: PlanType;
  billingCycle: CycleType;
  loading: boolean;
  timerFormatted: string;
  timeLeft: number;
  isExpired: boolean;
  originalPrice: string;
  onSelectPlan: (plan: PlanType) => void;
  onSelectCycle: (cycle: CycleType) => void;
  onStartTrial: () => void;
  onWhatsApp: () => void;
  onBack: () => void;
  onClose: () => void;
}

function PlansStep({
  selectedPlan,
  billingCycle,
  loading,
  timerFormatted,
  timeLeft,
  isExpired,
  originalPrice,
  onSelectPlan,
  onSelectCycle,
  onStartTrial,
  onWhatsApp,
  onBack,
  onClose,
}: PlansStepProps) {
  return (
    <motion.div
      key="plans"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="text-slate-500 hover:text-white text-xs font-medium mb-1 flex items-center gap-1 transition-colors"
          >
            <ChevronRight size={12} className="rotate-180" />
            Voltar
          </button>
          <h3 className="text-white font-bold text-lg">Escolha seu plano</h3>
        </div>

        <div
          className={clsx(
            "flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors",
            isExpired
              ? "bg-red-500/10 border-red-500/20"
              : "bg-white/5 border-white/10"
          )}
        >
          <Clock
            size={14}
            className={clsx(
              isExpired ? "text-red-400" : "text-amber-400 animate-pulse"
            )}
          />
          <span
            className={clsx(
              "font-mono text-base font-bold tracking-wider",
              isExpired ? "text-red-400" : "text-white"
            )}
          >
            {isExpired ? "Expirado" : timerFormatted}
          </span>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {!isExpired && timeLeft <= 120 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3 text-center"
          >
            <p className="text-xs text-amber-700 dark:text-amber-400 font-bold">
              ⚡ Oferta expirando! Restam menos de 2 minutos.
            </p>
          </motion.div>
        )}

        {isExpired && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-xl p-3 text-center"
          >
            <p className="text-xs text-red-700 dark:text-red-400 font-bold">
              ⏰ A oferta especial expirou, mas você ainda pode testar por 7
              dias.
            </p>
          </motion.div>
        )}

        <div className="flex justify-center">
          <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => onSelectCycle("monthly")}
              className={clsx(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                billingCycle === "monthly"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => onSelectCycle("yearly")}
              className={clsx(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                billingCycle === "yearly"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              Anual
              <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                -17%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <PlanCard
            plan="pro"
            icon={Zap}
            label="Pro"
            price={billingCycle === "monthly" ? "34,90" : "349"}
            cycle={billingCycle}
            isSelected={selectedPlan === "pro"}
            onSelect={() => onSelectPlan("pro")}
            accentColor="indigo"
          />
          <PlanCard
            plan="ultra"
            icon={Crown}
            label="Ultra"
            price={billingCycle === "monthly" ? "77,90" : "779"}
            cycle={billingCycle}
            isSelected={selectedPlan === "ultra"}
            onSelect={() => onSelectPlan("ultra")}
            accentColor="purple"
            isPopular
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedPlan}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800"
          >
            <p className="text-[11px] uppercase text-slate-400 font-bold mb-3 tracking-wider">
              {selectedPlan === "pro"
                ? "Com o Pro você vai"
                : "Com o Ultra você vai"}
            </p>
            <div className="space-y-2.5">
              {BENEFITS[selectedPlan].map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2
                    size={16}
                    className={clsx(
                      "flex-shrink-0",
                      selectedPlan === "ultra"
                        ? "text-purple-500"
                        : "text-indigo-500"
                    )}
                  />
                  <span
                    className={clsx(
                      "text-sm",
                      b.highlight
                        ? "font-bold text-slate-900 dark:text-white"
                        : "text-slate-600 dark:text-slate-300"
                    )}
                  >
                    {b.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 border border-slate-700/50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-slate-500 text-xs font-medium mb-1">
                Você paga hoje
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">R$ 0</span>
                <span className="text-slate-500 text-sm line-through">
                  {originalPrice}
                </span>
              </div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Shield size={14} />
                <span className="text-xs font-bold">7 dias grátis</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-3 border-t border-slate-700/50">
            <span className="flex items-center gap-1">
              <Check size={12} className="text-slate-500" />
              Cancele quando quiser
            </span>
            <span className="flex items-center gap-1">
              <Check size={12} className="text-slate-500" />
              Sem compromisso
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onStartTrial}
            disabled={loading}
            className={clsx(
              "w-full h-14 text-base font-bold rounded-2xl shadow-xl transition-all hover:scale-[1.01]",
              selectedPlan === "ultra"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-500/20"
                : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-indigo-500/20"
            )}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Processando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles size={18} />
                Começar meu teste grátis
              </span>
            )}
          </Button>

          <button
            onClick={onWhatsApp}
            className="w-full flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 py-2.5 transition-colors"
          >
            <MessageCircle size={16} className="text-emerald-500" />
            Tem dúvidas?{" "}
            <strong className="text-slate-600 dark:text-slate-300">
              Fale comigo
            </strong>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors text-center"
          >
            Continuar com o plano gratuito
          </button>
        </div>
      </div>
    </motion.div>
  );
}


interface PlanCardProps {
  plan: PlanType;
  icon: typeof Zap;
  label: string;
  price: string;
  cycle: CycleType;
  isSelected: boolean;
  onSelect: () => void;
  accentColor: "indigo" | "purple";
  isPopular?: boolean;
}

function PlanCard({
  icon: Icon,
  label,
  price,
  cycle,
  isSelected,
  onSelect,
  accentColor,
  isPopular,
}: PlanCardProps) {
  const selectedStyles =
    accentColor === "purple"
      ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 shadow-lg shadow-purple-500/10"
      : "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-lg shadow-indigo-500/10";

  const iconSelectedStyles =
    accentColor === "purple"
      ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md"
      : "bg-indigo-500 text-white shadow-md";

  const checkColor =
    accentColor === "purple" ? "text-purple-500" : "text-indigo-500";

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={clsx(
        "p-4 rounded-2xl border-2 text-left transition-all relative group",
        isSelected
          ? selectedStyles
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300"
      )}
    >
      {isPopular && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
          <Star size={8} className="fill-white" /> POPULAR
        </span>
      )}

      <div className={clsx("flex items-center gap-2 mb-3", isPopular && "mt-1")}>
        <div
          className={clsx(
            "p-2 rounded-xl transition-all",
            isSelected
              ? iconSelectedStyles
              : "bg-slate-100 dark:bg-slate-700 text-slate-500"
          )}
        >
          <Icon size={16} />
        </div>
        <span className="font-bold text-sm text-slate-900 dark:text-white">
          {label}
        </span>
      </div>

      <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
        R$ {price}
      </p>
      <p className="text-[11px] text-slate-400 font-medium mt-1">
        /{cycle === "monthly" ? "mês" : "ano"}
      </p>

      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3"
        >
          <CheckCircle2 size={20} className={checkColor} />
        </motion.div>
      )}
    </motion.button>
  );
}