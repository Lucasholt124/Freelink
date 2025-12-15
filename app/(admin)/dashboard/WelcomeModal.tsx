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

  const handleClose = () => setShowWelcomeModal(false);

  const getOriginalPrice = () => {
    if (selectedPlan === "pro") {
      return billingCycle === "monthly" ? "R$ 34,90" : "R$ 349,00";
    }
    return billingCycle === "monthly" ? "R$ 77,90" : "R$ 779,00";
  };

  const benefitsResults = {
    pro: ["Crie conteúdo viral todo dia", "Economize 3h/dia com IA", "Aumente seus seguidores", "Profissionalize sua página"],
    ultra: ["Conteúdo ILIMITADO com IA", "Fotos profissionais em 1 clique", "Saiba exatamente quem te visita", "Atendimento VIP exclusivo"],
  };

  return (
    <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
      <DialogContent className="w-[96vw] max-w-[440px] p-0 border-0 shadow-2xl bg-white dark:bg-slate-900 rounded-2xl overflow-hidden gap-0">

        {/* REMOVE X PADRÃO DO RADIX */}
        <style jsx global>{`
          [data-radix-dialog-content] > button { display: none !important; }
        `}</style>

        {/* ============ BARRA URGÊNCIA + BOTÃO X ============ */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="animate-pulse" />
            <span className="text-sm font-semibold">Oferta expira em</span>
            <span className="font-mono text-lg font-bold bg-black/20 px-3 py-1 rounded-lg">
              {formatTime(timeLeft)}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* ============ CONTEÚDO COM SCROLL ============ */}
        <div className="max-h-[70vh] overflow-y-auto">

          {/* HEADER */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-5">
            {/* PROVA SOCIAL */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-slate-900 flex items-center justify-center">
                    <Users size={12} className="text-white" />
                  </div>
                ))}
              </div>
              <span className="text-emerald-400 text-sm font-medium">+2.847 criadores ativos</span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={20} className="text-emerald-400" />
              <span className="text-white text-lg font-bold">Sua página está no ar! 🎉</span>
            </div>

            {/* LINK COPIÁVEL */}
            <div
              onClick={copyToClipboard}
              className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 p-4 rounded-xl cursor-pointer transition-all active:scale-[0.98]"
            >
              <p className="flex-1 text-white font-medium truncate text-base font-mono">
                {getDisplayUrl()}
              </p>
              <div className={clsx(
                "shrink-0 p-3 rounded-xl transition-all",
                copied ? "bg-emerald-500" : "bg-indigo-600"
              )}>
                {copied ? <Check size={20} className="text-white" /> : <Copy size={20} className="text-white" />}
              </div>
            </div>
            <p className="text-center text-sm text-slate-400 mt-2">👆 Toque para copiar</p>
          </div>

          {/* CONTEÚDO */}
          <div className="px-4 py-5 bg-slate-50 dark:bg-slate-950">

            {/* HEADLINE */}
            <div className="text-center mb-5">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                Não perca vendas por ter uma página
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500"> sem recursos</span>
              </h3>
              <p className="text-base text-slate-500 mt-2">
                Teste todos os recursos por 7 dias. <strong className="text-emerald-600">Grátis.</strong>
              </p>
            </div>

            {/* TOGGLE CICLO */}
            <div className="flex justify-center mb-5">
              <div className="inline-flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={clsx(
                    "px-5 py-3 rounded-lg text-sm font-bold transition-all",
                    billingCycle === "monthly" ? "bg-slate-900 text-white" : "text-slate-500"
                  )}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={clsx(
                    "px-5 py-3 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                    billingCycle === "yearly" ? "bg-slate-900 text-white" : "text-slate-500"
                  )}
                >
                  Anual
                  <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">-17%</span>
                </button>
              </div>
            </div>

            {/* CARDS PLANOS */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {/* PRO */}
              <button
                onClick={() => setSelectedPlan("pro")}
                className={clsx(
                  "p-4 rounded-xl border-2 text-left transition-all relative",
                  selectedPlan === "pro"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={clsx("p-2 rounded-lg", selectedPlan === "pro" ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-500")}>
                    <Zap size={16} />
                  </div>
                  <span className="font-bold text-base">Pro</span>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  R$ {billingCycle === "monthly" ? "34,90" : "349"}
                  <span className="text-sm font-normal text-slate-500">/{billingCycle === "monthly" ? "mês" : "ano"}</span>
                </p>
                {selectedPlan === "pro" && <CheckCircle2 size={20} className="absolute top-3 right-3 text-indigo-500" />}
              </button>

              {/* ULTRA */}
              <button
                onClick={() => setSelectedPlan("ultra")}
                className={clsx(
                  "p-4 rounded-xl border-2 text-left transition-all relative",
                  selectedPlan === "ultra"
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                )}
              >
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Star size={10} className="fill-white" /> POPULAR
                </span>
                <div className="flex items-center gap-2 mb-2 mt-2">
                  <div className={clsx("p-2 rounded-lg", selectedPlan === "ultra" ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white" : "bg-slate-100 text-slate-500")}>
                    <Crown size={16} />
                  </div>
                  <span className="font-bold text-base">Ultra</span>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  R$ {billingCycle === "monthly" ? "77,90" : "779"}
                  <span className="text-sm font-normal text-slate-500">/{billingCycle === "monthly" ? "mês" : "ano"}</span>
                </p>
                {selectedPlan === "ultra" && <CheckCircle2 size={20} className="absolute top-3 right-3 text-purple-500" />}
              </button>
            </div>

            {/* BENEFÍCIOS */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedPlan}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-5"
              >
                <p className="text-sm uppercase text-slate-400 font-bold mb-3 flex items-center gap-2">
                  <TrendingUp size={14} />
                  {selectedPlan === "pro" ? "Com o Pro você vai:" : "Com o Ultra você vai:"}
                </p>
                <div className="space-y-3">
                  {benefitsResults[selectedPlan].map((b, i) => (
                    <div key={i} className="flex items-center gap-3 text-base text-slate-700 dark:text-slate-300">
                      <CheckCircle2 size={18} className={selectedPlan === "ultra" ? "text-purple-500" : "text-indigo-500"} />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* PREÇO FINAL */}
            <div className="bg-slate-900 rounded-xl p-5 mb-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Você paga hoje:</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">R$ 0</span>
                    <span className="text-slate-500 text-base line-through">{getOriginalPrice()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 text-sm font-bold px-4 py-2 rounded-full">
                  <Shield size={16} />
                  7 dias grátis
                </div>
              </div>
              <div className="pt-3 border-t border-slate-700">
                <p className="text-sm text-slate-400 text-center">
                  ✓ Cancele quando quiser • ✓ Sem compromisso • ✓ 100% seguro
                </p>
              </div>
            </div>

            {/* CTA */}
            <Button
              onClick={handleStartTrial}
              disabled={loading}
              className={clsx(
                "w-full h-16 text-lg font-bold rounded-xl shadow-lg",
                selectedPlan === "ultra"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                  : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500"
              )}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={20} className="animate-spin" /> Processando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles size={20} />
                  Quero Testar Grátis por 7 Dias
                </span>
              )}
            </Button>

            {/* WHATSAPP */}
            <button
              onClick={handleWhatsApp}
              className="w-full mt-4 flex items-center justify-center gap-2 text-base text-slate-500 hover:text-emerald-600 py-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl"
            >
              <MessageCircle size={18} className="text-emerald-500" />
              Dúvidas? <strong>Fale comigo</strong>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* ============ FOOTER FIXO - SEMPRE VISÍVEL ============ */}
        <div className="px-4 py-4 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleClose}
            className="w-full py-3 text-base text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium flex items-center justify-center gap-2 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 transition-colors"
          >
            <X size={16} />
            Pular e ir para o Dashboard
          </button>
        </div>

      </DialogContent>
    </Dialog>
  );
}