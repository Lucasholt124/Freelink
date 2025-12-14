"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, Copy, X, Sparkles, Gift,
  Loader2, Shield, Crown, Zap, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import clsx from "clsx";

interface WelcomeModalProps {
  username: string;
}

type PlanType = "pro" | "ultra";

export default function WelcomeModal({ username }: WelcomeModalProps) {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("ultra"); // Começa no Ultra (Ancoragem de valor)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const isWelcome = urlParams.get('welcome');

      if (isWelcome === 'true') {
        setShowWelcomeModal(true);
        // Remove o parametro da URL limpo
        window.history.replaceState({}, '', '/dashboard');
      }
    }
  }, []);

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

  // --- FUNÇÃO DE CHECKOUT (INTEGRADA COM O SEU BACKEND) ---
  const handleStartTrial = async () => {
    setLoading(true);
    try {
      // Chama sua API exatamente como ela espera
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Envia o plano selecionado no Toggle
        body: JSON.stringify({ plan: selectedPlan, cycle: "monthly" }),
      });

      const data = await res.json();

      if (data.url) {
        // Redireciona para o Stripe (que mostrará "7 dias grátis")
        window.location.href = data.url;
      } else {
        throw new Error("Erro ao criar sessão");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao iniciar o presente. Tente novamente.");
      setLoading(false); // Só para loading se der erro
    }
  };

  const benefits = {
    pro: [
      "Sorteios Automáticos 🎁",
      "Financeiro Completo 💰",
      "6 Ideias Virais/dia 🧠",
      "Analytics Avançado 📊"
    ],
    ultra: [
      "Tudo do Pro +",
      "IA Ilimitada & Chat 🤖",
      "Remoção de Fundo (Fotos) ✨",
      "Atendimento VIP WhatsApp 👑"
    ]
  };

  return (
    <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
      <DialogContent className="w-[95vw] max-w-sm sm:max-w-md p-0 bg-transparent border-0 shadow-none outline-none overflow-hidden">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
          className="relative w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* --- HEADER DE CELEBRAÇÃO --- */}
          <div className="relative bg-slate-950 p-6 text-center overflow-hidden shrink-0">
             {/* Efeito de Confete/Luzes no fundo */}
             <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
             <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>

             {/* Ícone Animado */}
             <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg border border-white/10"
            >
               <Sparkles className="w-6 h-6 text-white" />
            </motion.div>

            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              Página Criada com Sucesso!
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1 flex items-center justify-center gap-1.5">
              <CheckCircle2 size={14} className="text-green-500" />
              Seu link: <span className="text-white underline decoration-slate-700 underline-offset-2">{profileUrl.replace(/^https?:\/\//, '')}</span>
              <button onClick={handleCopyLink} className="p-1 hover:bg-white/10 rounded-md transition-colors">
                {copied ? <Check size={12} className="text-green-500"/> : <Copy size={12} />}
              </button>
            </p>

            <button
              onClick={() => setShowWelcomeModal(false)}
              className="absolute top-3 right-3 p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* --- CORPO DA OFERTA (SCROLLÁVEL SE PRECISAR) --- */}
          <div className="p-5 flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">

            {/* Box de Presente */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-1 mb-5">
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl relative">
                {/* Fundo deslizante do Toggle */}
                <motion.div
                  className="absolute top-1 bottom-1 rounded-lg bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600"
                  initial={false}
                  animate={{
                    left: selectedPlan === 'pro' ? '4px' : '50%',
                    width: 'calc(50% - 4px)'
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />

                <button
                  onClick={() => setSelectedPlan('pro')}
                  className={clsx("flex-1 py-2.5 text-sm font-bold relative z-10 transition-colors flex items-center justify-center gap-2", selectedPlan === 'pro' ? "text-indigo-600" : "text-slate-500")}
                >
                  <Zap size={14} /> PRO
                </button>
                <button
                  onClick={() => setSelectedPlan('ultra')}
                  className={clsx("flex-1 py-2.5 text-sm font-bold relative z-10 transition-colors flex items-center justify-center gap-2", selectedPlan === 'ultra' ? "text-purple-600" : "text-slate-500")}
                >
                  <Crown size={14} /> ULTRA
                </button>
              </div>

              {/* Lista de Benefícios Dinâmica */}
              <div className="p-4">
                <div className="text-center mb-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">VOCÊ VAI DESBLOQUEAR:</p>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedPlan}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="grid grid-cols-2 gap-x-2 gap-y-3 text-left"
                    >
                      {(selectedPlan === 'pro' ? benefits.pro : benefits.ultra).map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                          <Check className={clsx("w-4 h-4 shrink-0", selectedPlan === 'ultra' ? "text-purple-500" : "text-indigo-500")} />
                          <span className="truncate">{benefit}</span>
                        </div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 rounded-xl p-3 flex items-center justify-center gap-3">
                   <Shield size={18} className="text-green-600" />
                   <div className="text-left">
                      <p className="text-[10px] font-bold text-green-800 dark:text-green-400 uppercase">Resumo do Pedido:</p>
                      <p className="text-sm font-bold text-green-700 dark:text-green-300">
                        Total hoje: <span className="text-lg">R$ 0,00</span>
                      </p>
                   </div>
                </div>
              </div>
            </div>

            {/* BOTÃO MÁGICO */}
            <Button
              onClick={handleStartTrial}
              disabled={loading}
              className={clsx(
                "w-full h-14 text-lg font-bold rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group",
                selectedPlan === 'ultra'
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:to-pink-500 shadow-purple-500/25"
                  : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:to-blue-500 shadow-indigo-500/25"
              )}
            >
              {/* Efeito de brilho no botão */}
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 -skew-x-12 -translate-x-full" />

              {loading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 animate-bounce" />
                  <span>Liberar 7 Dias Grátis</span>
                </div>
              )}
            </Button>

            <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">
              Após 7 dias, {selectedPlan === 'pro' ? 'R$ 34,90' : 'R$ 77,90'}/mês. Cancele a qualquer momento no painel.
            </p>
          </div>

          {/* --- FOOTER DISCRETO --- */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors underline decoration-slate-200 underline-offset-2"
            >
              Prefiro continuar com o plano básico limitado
            </button>
          </div>

        </motion.div>
      </DialogContent>
    </Dialog>
  );
}