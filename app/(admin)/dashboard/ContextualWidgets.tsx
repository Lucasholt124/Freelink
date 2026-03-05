"use client";

import { motion } from "framer-motion";
import { Sparkles, Instagram, Play, Lock, TrendingUp, Users, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface WidgetProps {
  userPlan: string;
  totalClicks?: number;
}

export function InstagramStrategyWidget({ userPlan, totalClicks = 0 }: WidgetProps) {
  const isLocked = userPlan !== 'ultra';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-pink-50 to-white dark:from-slate-900 dark:to-slate-800 border border-pink-200 dark:border-pink-900/30 rounded-2xl p-5 shadow-sm relative overflow-hidden group h-full flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-pink-600 font-bold text-xs uppercase tracking-wider">
            <Instagram className="w-3 h-3" /> Estratégia de Crescimento
          </div>
          <Badge variant="secondary" className="bg-pink-100 text-pink-700 text-[9px] font-bold border-0 px-1.5">
            <Users className="w-2.5 h-2.5 mr-1" />
            324 usaram hoje
          </Badge>
        </div>

        <h4 className="font-bold text-slate-900 dark:text-white mb-2">
          Potencialize seu tráfego do Instagram
        </h4>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
          A IA detectou tráfego vindo do social. Crie um post visual agora para aumentar a conversão em até 28%.
        </p>

        {totalClicks > 0 && (
          <div className="bg-pink-50 dark:bg-pink-900/10 border border-pink-100 dark:border-pink-900/20 rounded-lg p-2 mb-3">
            <p className="text-[10px] text-pink-700 dark:text-pink-400 font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Com {totalClicks} cliques, um post pode gerar +{Math.round(totalClicks * 0.28)} visitas extras
            </p>
          </div>
        )}
      </div>

      <Link href={isLocked ? "/dashboard/billing" : "/dashboard/mentor-ia"}>
        <Button
          size="sm"
          className={`w-full font-bold text-xs shadow-lg ${
            isLocked
              ? "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-pink-500/20"
              : "bg-pink-600 hover:bg-pink-700 text-white shadow-pink-500/20"
          }`}
        >
          {isLocked ? (
            <span className="flex items-center gap-2">
              <Lock className="w-3 h-3" />
              Desbloquear Gerador Visual
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px]">ULTRA</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Gerar Imagem para Post
            </span>
          )}
        </Button>
      </Link>


      {isLocked && (
        <p className="text-[9px] text-center text-pink-500 mt-2 font-medium">
          ⚡ Criadores Ultra geraram +2.847 posts essa semana
        </p>
      )}
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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
            <Play className="w-3 h-3" /> Roteiro Automático
          </div>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[9px] font-bold border-0 px-1.5 animate-pulse">
            <Eye className="w-2.5 h-2.5 mr-1" />
            3 prontos agora
          </Badge>
        </div>

        <h4 className="font-bold text-slate-900 dark:text-white mb-2">
          Transforme cliques em seguidores
        </h4>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
          Não sabe o que postar? A IA criou 3 roteiros baseados no seu nicho para viralizar hoje.
        </p>

        {isLocked && (
          <div className="relative mb-3">
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-lg p-3 blur-[3px] select-none">
              <p className="text-[10px] text-emerald-700 font-medium">
                Roteiro 1: Comece com uma pergunta polêmica sobre...
              </p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        )}
      </div>

      <Link href={isLocked ? "/dashboard/billing" : "/dashboard/brain"}>
        <Button
          size="sm"
          variant={isLocked ? "default" : "outline"}
          className={`w-full font-bold text-xs ${
            isLocked
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20"
              : "border-emerald-500 text-emerald-600 hover:bg-emerald-50"
          }`}
        >
          {isLocked ? (
            <span className="flex items-center gap-2">
              <Lock className="w-3 h-3" />
              Liberar Roteiros
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px]">PRO</span>
            </span>
          ) : (
            "Ver Roteiros Prontos"
          )}
        </Button>
      </Link>

      {isLocked && (
        <p className="text-[9px] text-center text-emerald-500 mt-2 font-medium">
          📈 Membros Pro tiveram +42% de engajamento com roteiros IA
        </p>
      )}
    </motion.div>
  );
}