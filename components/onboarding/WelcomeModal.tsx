"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Sparkles, Rocket, Target, Zap,
  ArrowRight, CheckCircle2, Star,
  ShieldCheck, Share2
} from "lucide-react";
import confetti from "canvas-confetti";

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const status = useQuery(api.onboarding.getOnboardingStatus, {});
  const dismiss = useMutation(api.onboarding.dismissWelcome);

  useEffect(() => {
    // Show modal if onboarding is completed but welcome hasn't been seen
    if (status?.completed && !status?.hasSeenWelcome) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        triggerSuccessConfetti();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const triggerSuccessConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#6366f1", "#a855f7", "#10b981"]
    });
  };

  const handleDismiss = async () => {
    setIsOpen(false);
    await dismiss({});
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl shadow-indigo-500/20 overflow-hidden border border-slate-100"
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 lg:top-6 lg:right-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all z-20"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col lg:flex-row h-full">
            {/* Left side: Visuals */}
            <div className="lg:w-2/5 bg-slate-900 p-6 lg:p-10 flex flex-col justify-between relative overflow-hidden">
              {/* Abstract deco */}
              <div className="absolute top-0 left-0 w-full h-full opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-64 h-64 rounded-full bg-indigo-500 blur-3xl animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 rounded-full bg-purple-500 blur-3xl" />
              </div>

              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-black text-white leading-tight">
                  Bem-vindo à elite do <span className="text-indigo-400 font-black italic">FreeLinnk</span>.
                </h2>
              </div>

              <div className="relative z-10 pt-8 mt-auto">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2">Dica Pro</p>
                  <p className="text-white/80 text-sm">Personalize suas cores e fontes no menu <span className="text-white font-bold">Personalização</span> para converter mais.</p>
                </div>
              </div>
            </div>

            {/* Right side: Content */}
            <div className="lg:w-3/5 p-6 lg:p-12 space-y-6 lg:space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-black uppercase tracking-widest">Acesso Liberado</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">O que você pode fazer agora?</h3>
              </div>

              <div className="space-y-6">
                <FeatureItem
                  icon={<Zap className="w-5 h-5 text-amber-500" />}
                  title="Gestão de Links"
                  desc="Adicione links ilimitados, botões de WhatsApp e sites."
                />
                <FeatureItem
                  icon={<Target className="w-5 h-5 text-indigo-500" />}
                  title="Otimização de Vendas"
                  desc="Organize seus clientes com o CRM integrado (Gestão PRO)."
                />
                <FeatureItem
                  icon={<ShieldCheck className="w-5 h-5 text-emerald-500" />}
                  title="Segurança Máxima"
                  desc="Seu perfil está protegido e otimizado para carregamento instantâneo."
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={handleDismiss}
                  className="w-full h-16 bg-indigo-600 hover:bg-slate-900 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-100 group"
                >
                  Bora começar! <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              <p className="text-center text-xs text-slate-400 font-medium">
                Você pode rever suas configurações no menu lateral a qualquer momento.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex gap-4 group">
      <div className="w-12 h-12 shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center transition-colors group-hover:bg-indigo-50">
        {icon}
      </div>
      <div>
        <h4 className="font-black text-slate-900 text-sm tracking-tight">{title}</h4>
        <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
