"use client";

import { motion } from "framer-motion";
import {
  Target, Zap, Share2,
  Instagram, Linkedin, DollarSign,
  RefreshCw, Calculator, Lock, Eye, Crown,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AnalyticsData } from "@/lib/analytics-server";

interface Props {
  analytics: AnalyticsData;
  plan: string;
  hasSales?: boolean;
}

export default function SmartInsights({ analytics, plan, hasSales = false }: Props) {
  const isFree = plan === 'free';
  const isPro = plan === 'pro';
  const totalClicks = analytics?.totalClicks || 0;
  const growthRaw = analytics?.growth || "+0%";
  const growthNum = parseFloat(growthRaw.replace('%', '').replace('+', ''));
  const topSource = analytics?.topReferrer?.source?.toLowerCase() || "direto";

  const peakHourNum = analytics?.peakHour?.hour || 19;
  const peakHourFmt = String(peakHourNum).padStart(2, '0');

  const extraInsightsCount = isFree ? 5 : isPro ? 2 : 0;

  const getSmartAdvice = () => {
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
    if (totalClicks === 0) {
      return {
        icon: Share2,
        title: "Primeiro Passo",
        text: "Seu link está pronto. Copie e cole na bio do Instagram agora para começar a receber cliques.",
        stat: "A bio é responsável por 90% do tráfego inicial.",
        action: "Ir para Meus Links",
        href: "/dashboard/links"
      };
    }
    if (totalClicks >= 200 && isFree) {
      return {
        icon: Target,
        title: "Perdendo Dados Valiosos",
        text: `Você passou de ${totalClicks} cliques! Sem o Pixel, você não consegue fazer remarketing. Cada visitante perdido é dinheiro no ralo.`,
        stat: `Estimativa: R$${(totalClicks * 0.3).toFixed(0)} em oportunidades perdidas hoje.`,
        action: "Ativar Pixel Pro",
        href: "/dashboard/tracking"
      };
    }
    return {
      icon: Zap,
      title: "Consistência é a Chave",
      text: "Mantenha seu link atualizado. Perfis ativos crescem mais rápido.",
      stat: "O algoritmo favorece atividade recente.",
      action: "Adicionar Novidade",
      href: "/dashboard/new-link"
    };
  };

  const advice = getSmartAdvice();

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1 shadow-sm flex flex-col"
      >
        <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-1">
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


        {extraInsightsCount > 0 && (
          <Link href="/dashboard/billing">
            <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
              <div className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-[11px] text-slate-500 font-medium">
                  <span className="text-purple-600 font-bold">+{extraInsightsCount} insights</span> disponíveis no {isFree ? 'Pro' : 'Ultra'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-[9px] font-bold border-0 text-white px-1.5">
                  {isFree ? <Zap className="w-2.5 h-2.5" /> : <Crown className="w-2.5 h-2.5" />}
                </Badge>
                <span className="text-[10px] text-purple-500 font-bold group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>
        )}
      </motion.div>

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
            Com base no histórico, seu pico de hoje será às{' '}
            <strong className="text-lg text-amber-600">{peakHourFmt}:00h</strong>.
            <br/>
            <span className="text-slate-500 dark:text-slate-400 font-normal text-xs mt-1 block">
              Prepare um story ou post para esse horário para maximizar o alcance.
            </span>
          </p>

          {(() => {
            const currentHour = new Date().getHours();
            const hoursUntilPeak = peakHourNum - currentHour;

            if (hoursUntilPeak > 0 && hoursUntilPeak <= 3) {
              return (
                <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-2 mb-2">
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1">
                    ⏰ Faltam {hoursUntilPeak}h para o seu pico! Prepare seu conteúdo agora.
                  </p>
                </div>
              );
            }

            if (hoursUntilPeak === 0) {
              return (
                <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-2 mb-2 animate-pulse">
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1">
                    🔥 SEU PICO É AGORA! Poste imediatamente para máximo alcance.
                  </p>
                </div>
              );
            }

            return null;
          })()}

          {isFree && (
            <Link href="/dashboard/billing" className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-100/50 dark:bg-amber-900/40 px-3 py-1.5 rounded-full cursor-pointer hover:bg-amber-200/50 transition-colors border border-amber-200/50">
              <Lock className="w-3 h-3 mr-1" />
              Ver análise de horários completa (PRO) <Zap className="w-3 h-3 ml-1" />
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}