"use client";

import { motion } from "framer-motion";
import { Sparkles, Instagram, Play, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface WidgetProps {
  userPlan: string;
}

export function InstagramStrategyWidget({ userPlan }: WidgetProps) {
  const isLocked = userPlan !== 'ultra';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-pink-50 to-white dark:from-slate-900 dark:to-slate-800 border border-pink-200 dark:border-pink-900/30 rounded-2xl p-5 shadow-sm relative overflow-hidden group h-full flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center gap-2 mb-2 text-pink-600 font-bold text-xs uppercase tracking-wider">
          <Instagram className="w-3 h-3" /> Estratégia de Crescimento
        </div>
        <h4 className="font-bold text-slate-900 dark:text-white mb-2">Potencialize seu tráfego do Instagram</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
          A IA detectou tráfego vindo do social. Crie um post visual agora para aumentar a conversão em até 28%.
        </p>
      </div>

      <Link href={isLocked ? "/dashboard/billing" : "/dashboard/mentor-ia"}>
        <Button size="sm" className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-lg shadow-pink-500/20">
          <Sparkles className="w-3 h-3 mr-2" />
          {isLocked ? "Desbloquear Gerador Visual" : "Gerar Imagem para Post"}
        </Button>
      </Link>
    </motion.div>
  );
}

export function ViralScriptWidget({ userPlan }: WidgetProps) {
  const isLocked = userPlan === 'free';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-emerald-50 to-white dark:from-slate-900 dark:to-slate-800 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-5 shadow-sm relative overflow-hidden group h-full flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center gap-2 mb-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
          <Play className="w-3 h-3" /> Roteiro Automático
        </div>
        <h4 className="font-bold text-slate-900 dark:text-white mb-2">Transforme cliques em seguidores</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
          Não sabe o que postar? A IA criou 3 roteiros baseados no seu nicho para viralizar hoje.
        </p>
      </div>

      <Link href={isLocked ? "/dashboard/billing" : "/dashboard/brain"}>
        <Button size="sm" variant="outline" className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-bold text-xs">
          {isLocked ? (
             <span className="flex items-center"><Lock className="w-3 h-3 mr-2"/> Liberar Roteiros (Pro)</span>
          ) : (
             "Ver Roteiros Prontos"
          )}
        </Button>
      </Link>
    </motion.div>
  );
}