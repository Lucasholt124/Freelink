"use client";

import { motion } from "framer-motion";
import { Target, Zap, Share2, Megaphone, DollarSign, Calculator, Lock, Eye, Crown, AlertCircle } from "lucide-react";
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

  const extraInsightsCount = isFree ? 4 : isPro ? 2 : 0;

  const getSmartAdvice = () => {
    if (totalClicks > 5 && !hasSales) {
      return {
        icon: AlertCircle,
        title: "Tráfego sem conversão?",
        text: "Você teve cliques, mas zero vendas registradas hoje. Analise seus preços e custos no CRM.",
        stat: "15% de margem extra só gerenciando dados corretos.",
        action: "Acessar CRM",
        href: "/dashboard/profit-calculator"
      };
    }
    if (totalClicks > 50 && growthNum <= 0 && isFree) {
      return {
        icon: Megaphone,
        title: "A Estagnação Mata o Negócio",
        text: "Seu tráfego orgânico bateu num teto. Acione o Hub de Anúncios e roube tráfego da rede para a sua vitrine.",
        stat: "O AdsHub traz até +15k clientes/mês.",
        action: "Ativar AdsHub",
        href: "/dashboard/ads"
      };
    }
    if (growthNum > 20 && totalClicks > 100) {
      return {
        icon: Target,
        title: "Momento Escalável",
        text: "Você está bombando hoje! É vital que o seu Pixel esteja ativo para gravar as IDs desses visitantes no Facebook/Insta.",
        stat: "Remarketing custa 3x mais barato que anúncio comum.",
        action: "Conferir Pixel",
        href: "/dashboard/tracking"
      };
    }
    if (totalClicks === 0) {
      return {
        icon: Share2,
        title: "Link Parado Não Vende",
        text: "Copie seu link para o botão da Bio. É de lá que virão seus clientes mais quentes e gratuitos.",
        stat: "90% das compras começam pelo link do perfil.",
        action: "Configurar Vitrine",
        href: "/dashboard/links"
      };
    }
    if (totalClicks >= 200 && isFree) {
      return {
        icon: Calculator,
        title: "Lucro Escapando",
        text: `Com ${totalClicks} visitas, você precisa saber de onde elas vêm e onde estão desistindo da compra (Taxa de Saída).`,
        stat: `R$ ${(totalClicks * 0.4).toFixed(0)} perdidos sem gestão hoje.`,
        action: "Desbloquear Análises",
        href: "/dashboard/billing"
      };
    }
    return {
      icon: Zap,
      title: "Tráfego é Relacionamento",
      text: "Pessoas confiam em produtos ativos. Lance um sorteio relâmpago ou um desconto usando a nossa ferramenta interna.",
      stat: "Sorteios captam leads 4x mais rápido.",
      action: "Criar Sorteio",
      href: "/dashboard/giveaway"
    };
  };

  const advice = getSmartAdvice();

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1 shadow-sm flex flex-col"
      >
        <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-1">
          <div className="flex gap-4">
            <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-xl h-fit shadow-inner">
              <advice.icon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h4 className="font-bold text-slate-500 text-xs uppercase tracking-wide mb-1 flex items-center gap-1">
                🤖 Análise de Negócios (IA)
              </h4>
              <p className="text-slate-900 dark:text-white font-bold text-base leading-tight">
                {advice.title}: <span className="font-normal text-slate-600 dark:text-slate-300">{advice.text}</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded inline-block border border-slate-100 dark:border-slate-700">
                💡 Mercado: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{advice.stat}</span>
              </p>
            </div>
          </div>
          <Link href={advice.href}>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 whitespace-nowrap h-10 transition-transform hover:scale-105">
              {advice.action === "Desbloquear Análises" && <Lock className="w-3 h-3 mr-2" />}
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
                  <span className="text-purple-600 font-bold">+{extraInsightsCount} insights de funil</span> bloqueados.
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

      {/* Caixa Menor ao lado (Foco em FOMO Financeiro) */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="md:col-span-4 bg-gradient-to-br from-slate-900 to-black border border-slate-800 rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-emerald-400 font-black text-xs uppercase tracking-wider">
            <DollarSign className="w-4 h-4" /> Gestão Fina
          </div>
          <p className="text-white font-bold text-sm mb-3 leading-snug">
            Empreendedor amador não conta moedas. Profissional conta cada centavo.
          </p>

          <Link href={isFree ? "/dashboard/billing" : "/dashboard/profit-calculator"}>
             <Button variant="secondary" size="sm" className="w-full text-xs font-bold bg-white/10 text-white border-white/20 hover:bg-white/20">
                {isFree ? <Lock className="w-3 h-3 mr-2" /> : <Calculator className="w-3 h-3 mr-2" />}
                Configurar CRM de Lucro
             </Button>
          </Link>

          {isFree && (
            <p className="text-[9px] text-center text-slate-500 mt-3 font-medium">
               Disponível nos planos avançados.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}