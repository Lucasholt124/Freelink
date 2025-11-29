"use client";

import { motion } from "framer-motion";
import { Trophy, Zap, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ViralBannerProps {
  clicksUsed: number;
  plan: string;
}

export default function ViralLevelUpBanner({ clicksUsed, plan }: ViralBannerProps) {
  // Gamificação: Define níveis baseados em cliques
  const getLevel = (clicks: number) => {
    if (clicks < 100) return { current: "Novato Digital", next: "Creator Iniciante", max: 100, icon: Star };
    if (clicks < 1000) return { current: "Creator Iniciante", next: "Influencer em Ascensão", max: 1000, icon: Zap };
    if (clicks < 5000) return { current: "Influencer", next: "Autoridade Digital", max: 5000, icon: Trophy };
    return { current: "Lenda Digital", next: "Ícone Global", max: 10000, icon: Crown };
  };

  const level = getLevel(clicksUsed);
  const progress = Math.min(100, (clicksUsed / level.max) * 100);
  const clicksLeft = level.max - clicksUsed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl mb-8 group"
    >
      {/* Background Animado Premium */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-900 via-slate-900 to-indigo-900"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      {/* Padrão de Grid Sutil (Estilo Linear) */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>

      <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Lado Esquerdo: Status e Progresso */}
        <div className="flex-1 w-full">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30 backdrop-blur-md">
              <level.icon className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Nível Atual</h3>
              <p className="text-xl sm:text-2xl font-black text-white">{level.current}</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <span>{clicksUsed.toLocaleString()} XP (Cliques)</span>
              <span className="text-purple-300">Próximo: {level.next}</span>
            </div>
            <div className="relative h-4 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              {/* Brilho na ponta da barra */}
              <motion.div
                className="absolute top-0 h-full w-1 bg-white blur-[2px]"
                initial={{ left: 0 }}
                animate={{ left: `${progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Faltam apenas <span className="text-white font-bold">{clicksLeft.toLocaleString()} cliques</span> para evoluir.
              {plan === 'free' && <span className="text-pink-400 ml-1 font-bold">O plano Pro acelera 3x mais.</span>}
            </p>
          </div>
        </div>

        {/* Lado Direito: CTA de Ação (Activation) */}
        <div className="flex-shrink-0 w-full md:w-auto">
          <Link href="/dashboard/new-link">
            <Button className="w-full md:w-auto bg-white text-slate-950 hover:bg-slate-100 hover:scale-105 transition-all font-black text-base py-6 px-8 rounded-xl shadow-xl shadow-purple-500/10 group-hover:shadow-purple-500/20">
              <Zap className="w-5 h-5 mr-2 text-purple-600 fill-purple-600" />
              Criar Link Viral
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}