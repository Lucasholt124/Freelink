"use client";

import { motion } from "framer-motion";
import { Sparkles, Megaphone, Lock, TrendingUp, Activity, BarChart3, ArrowRight, MousePointerClick, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface WidgetProps {
  userPlan: string;
  totalClicks?: number;
}

export function ProfitStrategyWidget({ userPlan, totalClicks = 0 }: WidgetProps) {
  const isLocked = userPlan !== 'ultra';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-800 border border-indigo-200 dark:border-indigo-900/30 rounded-2xl p-5 shadow-sm relative overflow-hidden group h-full flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <BarChart3 className="w-3 h-3" /> Gestão Inteligente
          </div>
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 text-[9px] font-bold border-0 px-1.5">
            <Activity className="w-2.5 h-2.5 mr-1" />
            CRM Ativo
          </Badge>
        </div>

        <h4 className="font-bold text-slate-900 dark:text-white mb-2">
          Para onde está indo o seu lucro?
        </h4>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
          Acesse a calculadora financeira e o CRM Inteligente para descobrir exatamente sua margem de lucro e estancar os vazamentos de caixa.
        </p>

        {totalClicks > 0 && (
          <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 rounded-lg p-2 mb-3">
            <p className="text-[10px] text-indigo-700 dark:text-indigo-400 font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Baseado nos seus {totalClicks} cliques, calcule sua conversão real!
            </p>
          </div>
        )}
      </div>

      <Link href={isLocked ? "/dashboard/billing" : "/dashboard/profit-calculator"}>
        <Button
          size="sm"
          className={`w-full font-bold text-xs shadow-lg ${
            isLocked
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-500/20"
              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
          }`}
        >
          {isLocked ? (
            <span className="flex items-center gap-2">
              <Lock className="w-3 h-3" />
              Desbloquear Calculadora e CRM
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px]">ULTRA</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Acessar Gestão Financeira
            </span>
          )}
        </Button>
      </Link>

      {isLocked && (
        <p className="text-[9px] text-center text-indigo-500 mt-2 font-medium">
          ⚡ Lojistas Ultra economizam até 15% usando a calculadora.
        </p>
      )}
    </motion.div>
  );
}

export function AdsHubWidget({ userPlan }: WidgetProps) {
  const isLocked = userPlan === 'free';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-emerald-50 to-white dark:from-slate-900 dark:to-slate-800 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-5 shadow-sm relative overflow-hidden group h-full flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
            <Megaphone className="w-3 h-3" /> Tráfego em Rede
          </div>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[9px] font-bold border-0 px-1.5 animate-pulse">
            <TrendingUp className="w-2.5 h-2.5 mr-1" />
            Em Alta
          </Badge>
        </div>

        <h4 className="font-bold text-slate-900 dark:text-white mb-2">
          Multiplique suas Vendas com Ads
        </h4>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
          Configure seu anúncio em vídeo ou imagem. A nossa rede vai mostrar seu produto na página de milhares de pessoas sem cobrar por clique.
        </p>

        {isLocked && (
          <div className="relative mb-3">
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-lg p-3 blur-[3px] select-none">
              <p className="text-[10px] text-emerald-700 font-medium">
                Sua Campanha: Oferta (0/1000 views) [Pausado]
              </p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        )}
      </div>

      <Link href={isLocked ? "/dashboard/billing" : "/dashboard/ads"}>
        <Button
          size="sm"
          variant={isLocked ? "default" : "outline"}
          className={`w-full font-bold text-xs ${
            isLocked
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20"
              : "border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          }`}
        >
          {isLocked ? (
            <span className="flex items-center gap-2">
              <Lock className="w-3 h-3" />
              Ativar Máquina de Tráfego
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px]">PRO</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
               Ir para o Hub de Anúncios <ArrowRight className="w-3 h-3" />
            </span>
          )}
        </Button>
      </Link>

      {isLocked && (
        <p className="text-[9px] text-center text-emerald-500 mt-2 font-medium">
          📈 Plano PRO ganha até 2.000 visualizações grátis no mês.
        </p>
      )}
    </motion.div>
  );
}

export function PixelStrategyWidget({ userPlan }: WidgetProps) {
  const isLocked = userPlan === 'free';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 border border-blue-200 dark:border-blue-900/30 rounded-2xl p-5 shadow-sm relative overflow-hidden group h-full flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <Shield className="w-3 h-3" /> Rastreamento Pro
          </div>
        </div>

        <h4 className="font-bold text-slate-900 dark:text-white mb-2">
          Não perca nenhum cliente.
        </h4>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
          Conecte o Pixel do Facebook e o Google Analytics. Rastrei quem visitou sua página para fazer anúncios de remarketing que convertem barato.
        </p>
      </div>

      <Link href={isLocked ? "/dashboard/billing" : "/dashboard/tracking"}>
        <Button
          size="sm"
          variant={isLocked ? "default" : "outline"}
          className={`w-full font-bold text-xs ${
            isLocked
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
              : "border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
          }`}
        >
          {isLocked ? (
            <span className="flex items-center gap-2">
              <Lock className="w-3 h-3" />
              Liberar Integração Pixel
            </span>
          ) : (
             <span className="flex items-center gap-2">
               Configurar Rastreamento <MousePointerClick className="w-3 h-3" />
             </span>
          )}
        </Button>
      </Link>
    </motion.div>
  );
}