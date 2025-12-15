"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Copy, X, Loader2, Shield, Crown, Zap, CheckCircle2,
  Clock, MessageCircle, ChevronRight, Sparkles, Users, TrendingUp, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import clsx from "clsx";

interface WelcomeModalProps {
  username: string;
}

type PlanType = "pro" | "ultra";
type CycleType = "monthly" | "yearly";

export default function WelcomeModal({ username }: WelcomeModalProps) {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("ultra");
  const [billingCycle, setBillingCycle] = useState<CycleType>("monthly");
  const [timeLeft, setTimeLeft] = useState(900);

  const WHATSAPP_NUMBER = "5579999383543";

  const getProfileUrl = useCallback(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/${username}`;
    }
    return `https://freelinnk.com/${username}`;
  }, [username]);

  const getDisplayUrl = useCallback(() => {
    return `freelinnk.com/${username}`;
  }, [username]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const isWelcome = urlParams.get("welcome");
      if (isWelcome === "true") {
        setShowWelcomeModal(true);
        window.history.replaceState({}, "", "/dashboard");
      }
    }
  }, []);

  useEffect(() => {
    if (!showWelcomeModal) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [showWelcomeModal]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const copyToClipboard = useCallback(async () => {
    const textToCopy = getProfileUrl();

    const showSuccess = () => {
      setCopied(true);
      toast.success("Link copiado! 🎉");
      setTimeout(() => setCopied(false), 2500);
    };

    const showFallback = () => {
      toast("Copie seu link:", { description: textToCopy, duration: 10000 });
    };

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        showSuccess();
        return;
      } catch {
        console.log("Clipboard API indisponível");
      }
    }

    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    textArea.style.cssText = `position:fixed;top:0;left:0;width:2em;height:2em;padding:0;border:none;outline:none;box-shadow:none;background:transparent;font-size:16px;z-index:99999;`;
    document.body.appendChild(textArea);

    try {
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, 999999);
      const success = document.execCommand("copy");
      if (success) showSuccess();
      else showFallback();
    } catch {
      showFallback();
    } finally {
      document.body.removeChild(textArea);
    }
  }, [getProfileUrl]);

  const handleWhatsApp = () => {
    const text = `Olá! Acabei de criar minha página no Freelinnk e quero aproveitar a oferta de 7 dias grátis. Pode me ajudar?`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleStartTrial = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan, cycle: billingCycle }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Erro ao criar sessão");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar. Tente novamente.");
      setLoading(false);
    }
  };

  const getOriginalPrice = () => {
    if (selectedPlan === "pro") {
      return billingCycle === "monthly" ? "R$ 34,90" : "R$ 349,00";
    }
    return billingCycle === "monthly" ? "R$ 77,90" : "R$ 779,00";
  };

  // BENEFÍCIOS FOCADOS EM RESULTADOS (não features)
  const benefitsResults = {
    pro: [
      "Crie conteúdo viral todo dia",
      "Economize 3h/dia com IA",
      "Aumente seus seguidores",
      "Profissionalize sua página",
    ],
    ultra: [
      "Conteúdo ILIMITADO com IA",
      "Fotos profissionais em 1 clique",
      "Saiba exatamente quem te visita",
      "Atendimento VIP exclusivo",
    ],
  };

  return (
    <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
      <DialogContent
        className="w-[94vw] max-w-[400px] p-0 border-0 shadow-2xl overflow-hidden bg-transparent gap-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <style jsx global>{`
          [data-radix-dialog-content] > button[type="button"] {
            display: none !important;
          }
        `}</style>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="relative w-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden"
        >
          {/* URGÊNCIA + ESCASSEZ */}
          <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-3 py-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold">
              <Clock size={12} className="animate-pulse" />
              Oferta exclusiva expira em
            </span>
            <span className="font-mono text-sm font-bold bg-black/20 px-2 py-0.5 rounded">
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* HEADER */}
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-4">
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/10 text-slate-400 hover:text-white transition-all"
            >
              <X size={14} />
            </button>

            {/* PROVA SOCIAL */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex -space-x-2">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-slate-900 flex items-center justify-center">
                    <Users size={10} className="text-white" />
                  </div>
                ))}
              </div>
              <span className="text-emerald-400 text-xs font-medium">
                +2.847 criadores ativos
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span className="text-white text-sm font-semibold">Sua página está no ar! 🎉</span>
            </div>

            {/* LINK COPIÁVEL */}
            <div
              onClick={copyToClipboard}
              className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 p-2.5 rounded-xl cursor-pointer transition-all active:scale-[0.98]"
            >
              <p className="flex-1 text-white font-medium truncate text-sm font-mono">
                {getDisplayUrl()}
              </p>
              <div className={clsx(
                "shrink-0 p-2 rounded-lg transition-all",
                copied ? "bg-emerald-500" : "bg-indigo-600 hover:bg-indigo-500"
              )}>
                {copied ? <Check size={14} className="text-white" /> : <Copy size={14} className="text-white" />}
              </div>
            </div>
          </div>

          {/* CONTEÚDO PRINCIPAL */}
          <div className="px-4 py-4 bg-slate-50 dark:bg-slate-950">

            {/* HEADLINE COM DOR */}
            <div className="text-center mb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Não perca vendas por ter uma página
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500"> sem recursos</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Teste todos os recursos por 7 dias. <strong>Grátis.</strong>
              </p>
            </div>

            {/* TOGGLE CICLO */}
            <div className="flex justify-center mb-3">
              <div className="inline-flex bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={clsx(
                    "px-3 py-1.5 rounded-md font-semibold transition-all",
                    billingCycle === "monthly" ? "bg-slate-900 text-white dark:bg-slate-600" : "text-slate-500"
                  )}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={clsx(
                    "px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1",
                    billingCycle === "yearly" ? "bg-slate-900 text-white dark:bg-slate-600" : "text-slate-500"
                  )}
                >
                  Anual <span className="text-[9px] bg-emerald-500 text-white px-1 rounded">2 MESES GRÁTIS</span>
                </button>
              </div>
            </div>

            {/* SELETOR DE PLANO */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => setSelectedPlan("pro")}
                className={clsx(
                  "p-3 rounded-xl border-2 text-left transition-all relative",
                  selectedPlan === "pro"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                    : "border-slate-200 dark:border-slate-700"
                )}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap size={12} className={selectedPlan === "pro" ? "text-indigo-600" : "text-slate-400"} />
                  <span className="font-bold text-xs">Pro</span>
                </div>
                <p className="text-base font-bold text-slate-900 dark:text-white">
                  R$ {billingCycle === "monthly" ? "34,90" : "349"}
                  <span className="text-[10px] font-normal text-slate-500">/{billingCycle === "monthly" ? "mês" : "ano"}</span>
                </p>
                {selectedPlan === "pro" && (
                  <CheckCircle2 size={16} className="absolute top-2 right-2 text-indigo-500" />
                )}
              </button>

              <button
                onClick={() => setSelectedPlan("ultra")}
                className={clsx(
                  "p-3 rounded-xl border-2 text-left transition-all relative",
                  selectedPlan === "ultra"
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30"
                    : "border-slate-200 dark:border-slate-700"
                )}
              >
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <Star size={8} className="fill-white" /> RECOMENDADO
                </span>
                <div className="flex items-center gap-1.5 mb-1 mt-1">
                  <Crown size={12} className={selectedPlan === "ultra" ? "text-purple-600" : "text-slate-400"} />
                  <span className="font-bold text-xs">Ultra</span>
                </div>
                <p className="text-base font-bold text-slate-900 dark:text-white">
                  R$ {billingCycle === "monthly" ? "77,90" : "779"}
                  <span className="text-[10px] font-normal text-slate-500">/{billingCycle === "monthly" ? "mês" : "ano"}</span>
                </p>
                {selectedPlan === "ultra" && (
                  <CheckCircle2 size={16} className="absolute top-2 right-2 text-purple-500" />
                )}
              </button>
            </div>

            {/* BENEFÍCIOS - FOCADOS EM RESULTADO */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedPlan}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 mb-3"
              >
                <p className="text-[10px] uppercase text-slate-400 font-semibold mb-2 flex items-center gap-1">
                  <TrendingUp size={10} />
                  {selectedPlan === "pro" ? "Com o Pro você vai:" : "Com o Ultra você vai:"}
                </p>
                <div className="space-y-1.5">
                  {benefitsResults[selectedPlan].map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 size={12} className={selectedPlan === "ultra" ? "text-purple-500" : "text-indigo-500"} />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* PREÇO + GARANTIA */}
            <div className="bg-slate-900 dark:bg-slate-800 rounded-xl p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-slate-400 text-[10px]">Você paga hoje:</p>
                  <span className="text-2xl font-bold text-white">R$ 0</span>
                  <span className="text-slate-500 text-xs line-through ml-1">{getOriginalPrice()}</span>
                </div>
                <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold px-2 py-1 rounded-full">
                  <Shield size={10} />
                  7 dias grátis
                </div>
              </div>
              {/* GARANTIA */}
              <div className="text-center pt-2 border-t border-slate-700">
                <p className="text-[10px] text-slate-400">
                  ✓ Cancele a qualquer momento • ✓ Sem compromisso • ✓ 100% seguro
                </p>
              </div>
            </div>

            {/* CTA */}
            <Button
              onClick={handleStartTrial}
              disabled={loading}
              className={clsx(
                "w-full h-12 text-sm font-bold rounded-xl shadow-lg transition-all",
                selectedPlan === "ultra"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-500/25"
                  : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-indigo-500/25"
              )}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Processando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles size={16} />
                  Quero Testar Grátis por 7 Dias
                </span>
              )}
            </Button>

            {/* MICRO COPY DE URGÊNCIA */}
            <p className="text-center text-[10px] text-slate-400 mt-2 flex items-center justify-center gap-1">
              <Clock size={10} />
              Essa oferta expira quando o timer zerar
            </p>

            {/* WHATSAPP */}
            <button
              onClick={handleWhatsApp}
              className="w-full mt-2 flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 transition-colors py-2"
            >
              <MessageCircle size={14} className="text-emerald-500" />
              Prefere tirar dúvidas antes? <strong>Fale comigo</strong>
              <ChevronRight size={12} />
            </button>
          </div>

          {/* FOOTER */}
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="w-full text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
            >
              Agora não, continuar limitado
            </button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}