"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Copy, X,
  Loader2, Shield, Crown, Zap, CheckCircle2,
  Clock, AlertTriangle, MessageCircle, ChevronRight
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

  // ESTADOS DE VENDA
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("ultra"); // Começa no Ultra (Ancoragem)
  const [billingCycle, setBillingCycle] = useState<CycleType>("monthly");

  // ESTADOS DE URGÊNCIA (Gatilhos Mentais)
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutos
  const [spotsLeft] = useState(3); // Escassez agressiva

  // SEU NÚMERO AQUI (Formato: 55 + DDD + Numero)
  const WHATSAPP_NUMBER = "5579999383543"; // <--- COLOQUE SEU NÚMERO AQUI

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const isWelcome = urlParams.get('welcome');

      if (isWelcome === 'true') {
        setShowWelcomeModal(true);
        window.history.replaceState({}, '', '/dashboard');
      }
    }
  }, []);

  // Timer Regressivo
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
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${username}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Link copiado! 📋");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  const handleWhatsApp = () => {
    const text = `Olá Lucas! Acabei de criar minha página no Freelinnk e quero aproveitar a oferta de 7 dias grátis, mas tenho uma dúvida sobre o pagamento. Pode me ajudar?`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleStartTrial = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          cycle: billingCycle
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Erro ao criar sessão");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar. Tente novamente ou chame no WhatsApp.");
      setLoading(false);
    }
  };

  // --- BENEFÍCIOS CORRIGIDOS E REAIS ---
  const benefits = {
    pro: [
      "6 Ideias Virais (IA) / dia 🧠",
      "3 Roteiros de Vídeo / dia 🎬",
      "Ferramenta de Sorteios 🎁",
      "Analytics Avançados 📊",
      "Remover Marca Freelinnk 🚫",
      "Suporte Prioritário ⚡"
    ],
    ultra: [
      "Ideias e Roteiros ILIMITADOS ♾️",
      "Aprimorador de Fotos (10/dia) ✨",
      "AI Studio (Chat + Audio2Text) 🤖",
      "Calculadora de Lucros IA 💰",
      "7 Imagens IA / dia + Remove BG 🖼️",
      "Pixel FB + Google GA4 (Tracking) 🎯",
      "WhatsApp Pessoal VIP 👑"
    ]
  };

  return (
    <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
      <DialogContent className="w-[95vw] max-w-md p-0 bg-transparent border-0 shadow-none outline-none overflow-hidden font-sans">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]"
        >
          {/* --- BARRA DE URGÊNCIA --- */}
          <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 flex items-center justify-between text-xs font-bold shadow-lg z-20">
            <span className="flex items-center gap-1 animate-pulse">
              <Clock size={12} /> OFERTA EXPIRA EM:
            </span>
            <span className="font-mono text-sm bg-red-800/30 px-2 rounded">{formatTime(timeLeft)}</span>
          </div>

          {/* --- HEADER --- */}
          <div className="relative bg-slate-950 p-5 text-center shrink-0 z-10">
             <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

             <div className="flex justify-between items-start mb-3 relative z-10">
               <div className="flex flex-col items-start">
                  <span className="text-[10px] font-bold text-yellow-300 border border-yellow-400/30 bg-yellow-400/10 px-2 py-0.5 rounded mb-1 flex items-center gap-1 animate-bounce">
                    <AlertTriangle size={10} /> RESTAM {spotsLeft} VAGAS VIP
                  </span>
                  <h2 className="text-xl font-black text-white leading-tight text-left">
                    Página Publicada! 🚀
                  </h2>
               </div>
               <button onClick={() => setShowWelcomeModal(false)} className="p-1.5 bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                  <X size={16} />
               </button>
             </div>

             {/* Link Rápido */}
             <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                <p className="flex-1 text-xs font-medium text-slate-300 truncate text-left select-all">
                  {profileUrl.replace(/^https?:\/\//, '')}
                </p>
                <button onClick={handleCopyLink} className="text-white hover:text-indigo-400 transition-colors p-1">
                  {copied ? <Check size={14} className="text-green-500"/> : <Copy size={14} />}
                </button>
             </div>
          </div>

          {/* --- CONTEÚDO PRINCIPAL (Scrollável) --- */}
          <div className="p-5 flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">

            {/* Título da Oferta */}
            <div className="text-center mb-5">
              <h3 className="text-base font-bold text-slate-600 dark:text-slate-300">
                Parabéns! Você ganhou:
              </h3>
              <div className="relative inline-block">
                 <div className="absolute -inset-1 bg-indigo-500 blur opacity-20 rounded-lg"></div>
                 <p className="relative text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 font-black text-3xl uppercase tracking-tighter transform scale-105">
                   7 DIAS GRÁTIS
                 </p>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                Teste o poder total. Cancele quando quiser.
              </p>
            </div>

            {/* SELETOR MENSAL / ANUAL */}
            <div className="flex justify-center mb-4">
              <div className="bg-white dark:bg-slate-800 p-1 rounded-xl flex text-xs font-bold relative border border-slate-200 dark:border-slate-700 shadow-sm">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={clsx("px-4 py-2 rounded-lg transition-all z-10", billingCycle === 'monthly' ? "bg-slate-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-300" : "text-slate-400")}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={clsx("px-4 py-2 rounded-lg transition-all z-10 flex items-center gap-1", billingCycle === 'yearly' ? "bg-green-100 text-green-700 shadow-sm ring-1 ring-green-200" : "text-slate-400")}
                >
                  Anual <span className="bg-green-600 text-white text-[9px] px-1.5 py-0.5 rounded-full">-20%</span>
                </button>
              </div>
            </div>

            {/* CARD DO PLANO */}
            <div className={clsx(
              "bg-white dark:bg-slate-900 rounded-2xl shadow-sm border p-1 mb-4 transition-all duration-300",
              selectedPlan === 'ultra' ? "border-purple-500/30 shadow-purple-500/10" : "border-slate-200 dark:border-slate-800"
            )}>
              {/* Toggle Pro/Ultra */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-3">
                <button
                  onClick={() => setSelectedPlan('pro')}
                  className={clsx("flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5", selectedPlan === 'pro' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400")}
                >
                  <Zap size={14} className={selectedPlan === 'pro' ? "fill-indigo-600 text-indigo-600" : ""} />
                  PRO
                </button>
                <button
                  onClick={() => setSelectedPlan('ultra')}
                  className={clsx("flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5", selectedPlan === 'ultra' ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md" : "text-slate-400")}
                >
                  <Crown size={14} className={selectedPlan === 'ultra' ? "fill-white text-white" : ""} />
                  ULTRA
                </button>
              </div>

              <div className="px-3 pb-2">
                <div className="mb-2">
                   <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                     {selectedPlan === 'pro' ? 'Incluso no Pro:' : 'Tudo do Pro, mais:'}
                   </p>
                   <AnimatePresence mode="wait">
                    <motion.div
                      key={`${selectedPlan}`}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="space-y-2.5 min-h-[160px]" // Altura mínima para não pular
                    >
                      {(selectedPlan === 'pro' ? benefits.pro : benefits.ultra).map((benefit, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                          <CheckCircle2 size={14} className={clsx("shrink-0 mt-0.5", selectedPlan === 'ultra' ? "text-purple-500 fill-purple-500/10" : "text-indigo-500 fill-indigo-500/10")} />
                          <span className="leading-tight">{benefit}</span>
                        </div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Preço Ancorado */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 -mx-3 px-4 py-2 rounded-b-xl">
                  <div>
                    <p className="text-[10px] text-slate-400 strike-through line-through">
                      De {selectedPlan === 'pro'
                        ? (billingCycle === 'monthly' ? 'R$ 34,90' : 'R$ 349,00')
                        : (billingCycle === 'monthly' ? 'R$ 77,90' : 'R$ 779,00')}
                    </p>
                    <div className="flex items-baseline gap-1">
                       <p className="text-xl font-black text-slate-900 dark:text-white leading-none">
                         R$ 0,00
                       </p>
                       <span className="text-[10px] text-slate-500 font-medium">/ hoje</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold border border-green-200">
                      <Shield size={10} className="fill-green-700" />
                      7 Dias Grátis
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTÃO PRINCIPAL */}
            <Button
              onClick={handleStartTrial}
              disabled={loading}
              className={clsx(
                "w-full h-14 text-lg font-bold rounded-xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group mb-3",
                selectedPlan === 'ultra'
                  ? "bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:to-orange-400 shadow-purple-500/25"
                  : "bg-gradient-to-r from-indigo-600 to-blue-600 shadow-indigo-500/25"
              )}
            >
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 -skew-x-12 -translate-x-full" />

              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" /> Processando...
                </div>
              ) : (
                <div className="flex flex-col items-center leading-none">
                  <span>ATIVAR TESTE GRÁTIS</span>
                  <span className="text-[10px] font-normal opacity-90 mt-1">Cancele quando quiser</span>
                </div>
              )}
            </Button>

            {/* BOTÃO WHATSAPP (A Salvação) */}
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-2 text-xs font-medium text-slate-500 hover:text-green-600 transition-colors py-2 group border border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10"
            >
              <MessageCircle size={16} className="text-green-500 fill-green-500/20" />
              <span>Dúvidas ou Parcelamento? <strong>Fale comigo</strong></span>
              <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </button>

          </div>

          {/* --- FOOTER (SAÍDA DISCRETA) --- */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center">
             <button
              onClick={() => setShowWelcomeModal(false)}
              className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors font-medium underline decoration-slate-200 underline-offset-2"
            >
              Pular oferta e ir para o plano grátis limitado
            </button>
          </div>

        </motion.div>
      </DialogContent>
    </Dialog>
  );
}