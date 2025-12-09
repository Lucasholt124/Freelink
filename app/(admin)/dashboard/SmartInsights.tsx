"use client";

import { motion } from "framer-motion";
import {
  Target, Zap, Share2,
  Instagram, Linkedin, DollarSign,
   RefreshCw,
  Calculator, Lock
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { AnalyticsData } from "@/lib/analytics-server";

interface Props {
  analytics: AnalyticsData;
  plan: string;
  hasSales?: boolean;
}

export default function SmartInsights({ analytics, plan, hasSales = false }: Props) {
  const isFree = plan === 'free';
  const totalClicks = analytics?.totalClicks || 0;
  const growthRaw = analytics?.growth || "+0%";
  const growthNum = parseFloat(growthRaw.replace('%', '').replace('+', ''));
  const topSource = analytics?.topReferrer?.source?.toLowerCase() || "direto";

  // Dados para o Timing de Ouro
  const peakHourNum = analytics?.peakHour?.hour || 19;
  const peakHourFmt = String(peakHourNum).padStart(2, '0');

  // --- ENGINE DE INTELIGÊNCIA ARTIFICIAL ---
  const getSmartAdvice = () => {
    // 1. PRIORIDADE: ATIVAÇÃO FINANCEIRA
    if (totalClicks > 5 && !hasSales) {
        return {
            icon: Calculator,
            title: "Você está perdendo dinheiro?",
            text: "Você teve visitas hoje, mas não registrou vendas. Use o Gestor Financeiro para calcular seu lucro real.",
            stat: "Gestão aumenta o lucro em 30%.",
            action: "Registrar Venda",
            href: "/dashboard/profit-calculator"
        };
    }
    // 2. ESTAGNAÇÃO
    if (totalClicks > 50 && growthNum <= 0) {
      return {
        icon: RefreshCw,
        title: "Reativação de Audiência",
        text: "Seu tráfego estagnou. Trocar a foto de perfil e a cor de fundo renova o interesse.",
        stat: "Perfis atualizados recuperam +18% de atenção.",
        action: "Renovar Design",
        href: "/dashboard/settings"
      };
    }
    // 3. CRESCIMENTO EXPLOSIVO
    if (growthNum > 20 && totalClicks > 100) {
      return {
        icon: DollarSign,
        title: "Momento Viral Detectado",
        text: "Você está crescendo rápido! É a hora perfeita para adicionar um link de produto ou afiliado.",
        stat: "Sua taxa de conversão está no pico.",
        action: "Adicionar Link de Venda",
        href: "/dashboard/new-link"
      };
    }
    // 4. TRÁFEGO DO INSTAGRAM
    if (topSource.includes("instagram")) {
      return {
        icon: Instagram,
        title: "Estratégia de Stories",
        text: "O Instagram é sua maior força. Crie um destaque 'Links' no seu perfil apontando pra cá.",
        stat: "Isso aumenta a retenção do link em 3x.",
        action: "Ver Roteiro de Story",
        href: "/dashboard/brain"
      };
    }
    // 5. TRÁFEGO DO LINKEDIN
    if (topSource.includes("linkedin")) {
      return {
        icon: Linkedin,
        title: "Autoridade Profissional",
        text: "Seu público vem do LinkedIn. Destaque sua 'Headline' profissional na bio.",
        stat: "Visitantes do LinkedIn buscam credibilidade.",
        action: "Editar Bio",
        href: "/dashboard/settings"
      };
    }
    // 6. INICIANTE ZERO
    if (totalClicks === 0) {
      return {
        icon: Share2,
        title: "Primeiro Passo",
        text: "Seu link está pronto. Copie e cole na bio do Instagram agora.",
        stat: "A bio é responsável por 90% do tráfego inicial.",
        action: "Ir para Meus Links",
        href: "/dashboard/links"
      };
    }
    // 7. POWER USER (Upsell Pixel)
    if (totalClicks >= 200 && isFree) {
      return {
        icon: Target,
        title: "Perdendo Dados?",
        text: "Você passou de 200 cliques! Ative o Pixel para fazer remarketing.",
        stat: "Não deixe esse público escapar.",
        action: "Ativar Pixel Pro",
        href: "/dashboard/tracking"
      };
    }
    // Padrão
    return {
      icon: Zap,
      title: "Consistência",
      text: "Mantenha seu link atualizado. Perfis ativos crescem mais rápido.",
      stat: "O algoritmo favorece atividade recente.",
      action: "Adicionar Novidade",
      href: "/dashboard/new-link"
    };
  };

  const advice = getSmartAdvice();

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
      {/* 1. IA COACH (7 colunas) */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1 shadow-sm flex flex-col justify-center"
      >
        <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 h-full">
          <div className="flex gap-4">
            <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-xl h-fit shadow-inner">
              <advice.icon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h4 className="font-bold text-slate-500 text-xs uppercase tracking-wide mb-1 flex items-center gap-1">
                🤖 IA Growth Coach
              </h4>
              <p className="text-slate-900 dark:text-white font-bold text-base leading-tight">
                {advice.title}: <span className="font-normal text-slate-600 dark:text-slate-300">{advice.text}</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded inline-block border border-slate-100 dark:border-slate-700">
                💡 Insight: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{advice.stat}</span>
              </p>
            </div>
          </div>
          <Link href={advice.href}>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 whitespace-nowrap h-10 transition-transform hover:scale-105">
                {advice.action === "Ativar Pixel Pro" && <Lock className="w-3 h-3 mr-2" />}
                {advice.action}
              </Button>
          </Link>
        </div>
      </motion.div>

      {/* 2. TIMING DE OURO (5 colunas) - RESTAURADO! */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="md:col-span-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden group"
      >
        <Zap className="absolute -right-4 -top-4 w-24 h-24 text-amber-500/5 rotate-12 group-hover:rotate-45 transition-transform duration-700" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-500 font-black text-xs uppercase tracking-wider">
            <Zap className="w-3 h-3" /> Timing de Ouro
          </div>
          <p className="text-slate-800 dark:text-slate-200 font-bold text-sm mb-3 leading-snug">
            Com base no histórico, seu pico de hoje será às <strong className="text-lg text-amber-600">{peakHourFmt}:00h</strong>.
            <br/>
            <span className="text-slate-500 dark:text-slate-400 font-normal text-xs mt-1 block">
              Prepare um story ou post para esse horário.
            </span>
          </p>

          {isFree && (
            <Link href="/dashboard/billing" className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-100/50 dark:bg-amber-900/40 px-3 py-1.5 rounded-full cursor-pointer hover:bg-amber-200/50 transition-colors border border-amber-200/50">
              Ver análise completa (PRO) <Zap className="w-3 h-3 ml-1" />
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}