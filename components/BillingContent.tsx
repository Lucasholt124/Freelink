"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Loader2, CheckCircle,
  Zap, Shield,
  Crown, ArrowRight, Lock,
  Infinity as InfinityIcon, Check,
  BarChart3, LayoutDashboard, PlayCircle,
  Image as ImageIcon, Gift, Calculator, MessageSquare, Sparkles, AlertTriangle, Settings
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";

// ============================================
// LÓGICA & TRACKING (MANTIDO 100%)
// ============================================

declare global {
  interface Window {
    gtag?: (command: 'event', eventName: string, params?: Record<string, unknown>) => void;
    fbq?: (method: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, properties);
  }
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', eventName, properties);
  }
}

function useScrollTracking() {
  useEffect(() => {
    let maxScroll = 0;
    const trackScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if ([25, 50, 75, 100].includes(maxScroll)) {
          trackEvent('ScrollDepth', { depth: maxScroll });
        }
      }
    };
    window.addEventListener('scroll', trackScroll);
    return () => window.removeEventListener('scroll', trackScroll);
  }, []);
}

// ============================================
// TIPAGEM & DADOS
// ============================================

type PlanIdentifier = "free" | "pro" | "ultra";
type BillingCycle = "monthly" | "yearly";

interface PricingSectionProps {
  currentPlan: PlanIdentifier;
  billingCycle: BillingCycle;
  handleBillingCycleChange: (checked: boolean) => void;
  loading: string | null;
  handleCheckout: (plan: "pro" | "ultra") => void;
}

const plans = [
  {
    id: "pro",
    name: "Pro Creator",
    monthlyPrice: "R$ 34,90",
    yearlyPrice: "R$ 349",
    discount: "50% OFF",
    badge: "🔥 MAIS ESCOLHIDO",
    description: "Crescimento acelerado com IA essencial.",
    features: [
      { text: "6 Ideias Virais (IA) / dia", icon: <BrainIcon /> },
      { text: "3 Roteiros de Vídeo / dia", icon: <PlayCircle className="w-4 h-4" /> },
      { text: "Ferramenta de Sorteios", icon: <Gift className="w-4 h-4" /> },
      { text: "Analytics Avançados", icon: <BarChart3 className="w-4 h-4" /> },
      { text: "Remover Marca Freelinnk", icon: <CheckCircle className="w-4 h-4" /> },
      { text: "Suporte Prioritário", icon: <Zap className="w-4 h-4" /> },
    ],
    cta: "Desbloquear Pro Agora",
    color: "blue"
  },
  {
    id: "ultra",
    name: "Ultra Business",
    monthlyPrice: "R$ 77,90",
    yearlyPrice: "R$ 779",
    discount: "Melhor Valor",
    badge: "👑 PODER MÁXIMO",
    description: "Sua agência de marketing completa no bolso.",
    features: [
      { text: "Ideias e Roteiros ILIMITADOS", icon: <InfinityIcon className="w-4 h-4" /> },
      { text: "Aprimorador de Fotos (10/dia)", icon: <Sparkles className="w-4 h-4" /> },
      { text: "AI Studio (Chat + Audio2Text)", icon: <MessageSquare className="w-4 h-4" /> },
      { text: "Calculadora de Lucros IA", icon: <Calculator className="w-4 h-4" /> },
      { text: "7 Imagens IA / dia + Remove BG", icon: <ImageIcon className="w-4 h-4" /> },
      { text: "Pixel FB + Google GA4", icon: <TargetIcon /> },
      { text: "WhatsApp Pessoal VIP", icon: <Crown className="w-4 h-4" /> },
    ],
    cta: "Liberar Ultra — Crescimento Máximo",
    color: "purple"
  }
];

// Ícones customizados
function BrainIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>}
function TargetIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>}

// ============================================
// 1. HERO INTELIGENTE (DINÂMICO)
// ============================================
function PersonalHeader({ name, currentPlan }: { name: string, currentPlan: PlanIdentifier }) {

  // Lógica de texto baseada no plano
  const content = {
    free: {
      badge: "⚠️ Análise de Perfil: Recursos Bloqueados",
      badgeColor: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800",
      title: <>Seu perfil está operando abaixo do potencial. <br className="hidden md:block"/><span className="text-blue-600">Vamos destravar agora?</span></>,
      description: "Você já começou, mas para viralizar de verdade e transformar seu perfil em um negócio, você precisa das ferramentas certas.",
      statusColor: "bg-slate-100 dark:bg-slate-800 text-slate-600",
      statusText: "Free",
      viralStat: <span className="font-bold text-red-500 flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded"><Lock className="w-3 h-3" /> 0</span>
    },
    pro: {
      badge: "🚀 Você é Pro! Próximo passo: Escala",
      badgeColor: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800",
      title: <>Você já cresce rápido. <br className="hidden md:block"/><span className="text-purple-600">Hora de virar uma agência.</span></>,
      description: "O plano Pro é ótimo, mas o Ultra coloca automação total e ferramentas de agência na sua mão.",
      statusColor: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
      statusText: "Pro Creator",
      viralStat: <span className="font-bold text-blue-600">6/dia</span>
    },
    ultra: {
      badge: "👑 Membro Ultra Business",
      badgeColor: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-800",
      title: <>Você está no topo. <br className="hidden md:block"/><span className="text-green-500">Aproveite seu poder total.</span></>,
      description: "Você tem acesso ilimitado a todas as ferramentas. Use o painel para gerenciar sua assinatura.",
      statusColor: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300",
      statusText: "Ultra Business",
      viralStat: <span className="font-bold text-purple-600 flex items-center gap-1"><InfinityIcon className="w-3 h-3" /> Ilimitado</span>
    }
  };

  const activeContent = content[currentPlan] || content.free;

  return (
    <div className="w-full max-w-4xl mx-auto mb-16 pt-10">
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left"
       >
          <div className="flex-1">
             <div className={clsx("inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border animate-pulse", activeContent.badgeColor)}>
                {currentPlan === 'free' ? <AlertTriangle className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                {activeContent.badge}
             </div>

             <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                {activeContent.title}
             </h1>
             <p className="text-slate-600 dark:text-slate-300 text-lg max-w-xl leading-relaxed">
                Olá, <strong>{name || "Criador"}</strong>. {activeContent.description}
             </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 min-w-[280px] transform rotate-1 hover:rotate-0 transition-transform duration-500">
             <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Plano Atual</span>
                <Badge variant="secondary" className={clsx("border-0 font-bold px-3", activeContent.statusColor)}>{activeContent.statusText}</Badge>
             </div>
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4 text-blue-500" /> Links Ativos
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">3</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500 dark:text-slate-500 flex items-center gap-2">
                        <BrainIcon /> Ideias Virais
                    </span>
                    {activeContent.viralStat}
                </div>
             </div>
          </div>
       </motion.div>
    </div>
  );
}

// 2. SEÇÃO DE BLOQUEIOS (SÓ APARECE SE FOR FREE)
function LossAversionSection({ currentPlan }: { currentPlan: PlanIdentifier }) {
    if (currentPlan !== 'free') return null;

    return (
        <div className="max-w-4xl mx-auto mb-24">
            <div className="text-center mb-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">❌ O que você está <span className="text-red-500 underline decoration-red-200 decoration-4 underline-offset-4">perdendo</span> neste exato momento:</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Ideias Virais (IA)", icon: BrainIcon },
                    { label: "Roteiros Prontos", icon: PlayCircle },
                    { label: "Pixel / Analytics", icon: TargetIcon },
                    { label: "Imagens IA", icon: ImageIcon },
                ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 opacity-75 grayscale hover:grayscale-0 hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-100 transition-all duration-300 group cursor-not-allowed">
                         <div className="mb-3 p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm relative group-hover:scale-110 transition-transform">
                            <item.icon className="w-6 h-6 text-slate-400 group-hover:text-red-500" />
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-sm border-2 border-white dark:border-slate-900">
                                <Lock className="w-2.5 h-2.5" />
                            </div>
                         </div>
                         <span className="text-sm font-bold text-slate-500 group-hover:text-red-600 transition-colors text-center">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 3. PRICING CARDS (BOTÕES INTELIGENTES E RESPONSIVOS)
function PricingSection({ currentPlan, billingCycle, handleBillingCycleChange, loading, handleCheckout }: PricingSectionProps) {

    // Função auxiliar para renderizar o botão correto
    const renderButton = (planId: "pro" | "ultra", ctaText: string, variant: "blue" | "white") => {
        const isCurrent = currentPlan === planId;
        const isDisabled = loading !== null;

        if (isCurrent) {
            return (
                <Button disabled className="w-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 font-bold h-14 rounded-xl cursor-not-allowed">
                    Seu Plano Atual
                </Button>
            );
        }

        const baseClasses = "relative z-10 w-full font-bold h-auto py-4 min-h-[3.5rem] rounded-xl text-lg shadow-lg mb-8 transition-all hover:scale-[1.02] whitespace-normal leading-tight";
        const variantClasses = variant === "blue"
            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
            : "bg-white text-purple-900 hover:bg-slate-100";

        return (
            <Button
                onClick={() => handleCheckout(planId)}
                disabled={isDisabled}
                className={clsx(baseClasses, variantClasses)}
            >
                {loading === `${planId}-${billingCycle}` ? <Loader2 className="animate-spin" /> : ctaText}
            </Button>
        );
    };

    return (
        <div className="max-w-6xl mx-auto mb-24">
            {/* Toggle */}
            <div className="flex flex-col items-center justify-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-6 text-center">Escolha seu novo nível</h2>
                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm relative">
                    <span className={clsx("px-6 py-2.5 rounded-full text-sm font-bold cursor-pointer transition-all", billingCycle === 'monthly' ? "bg-slate-100 text-slate-900" : "text-slate-500")}>Mensal</span>
                    <Switch checked={billingCycle === 'yearly'} onCheckedChange={handleBillingCycleChange} />
                    <span className={clsx("px-6 py-2.5 rounded-full text-sm font-bold cursor-pointer transition-all", billingCycle === 'yearly' ? "bg-green-100 text-green-700" : "text-slate-500")}>Anual</span>

                    {billingCycle === 'monthly' && (
                        <div className="absolute -right-28 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-lg animate-bounce">
                            <ArrowRight className="w-3 h-3" /> -2 Meses Grátis
                        </div>
                    )}
                </div>
            </div>

            {/* Cards */}
            <div className="grid md:grid-cols-2 gap-6 lg:gap-10 items-start">

                {/* PRO CARD */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className={clsx(
                        "relative bg-white dark:bg-slate-900 rounded-[2rem] border-2 shadow-xl p-8 flex flex-col h-full overflow-hidden transition-all",
                        currentPlan === 'pro' ? "border-slate-200 opacity-80 scale-95" : "border-amber-400/50 dark:border-amber-500/30 shadow-amber-500/10"
                    )}
                >
                    <div className="mb-6 relative z-10">
                        {currentPlan !== 'pro' && (
                            <div className="inline-block bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-amber-500/20 mb-4 transform -rotate-1">
                                {plans[0].badge}
                            </div>
                        )}
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {plans[0].name}
                        </h3>
                        <p className="text-slate-500 mt-2 text-sm font-medium">{plans[0].description}</p>
                    </div>

                    <div className="mb-8 p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-slate-900 dark:text-white">{billingCycle === 'yearly' ? plans[0].yearlyPrice : plans[0].monthlyPrice}</span>
                            <span className="text-slate-500 font-medium">/{billingCycle === 'yearly' ? 'ano' : 'mês'}</span>
                        </div>
                        {currentPlan !== 'pro' && (
                            <div className="text-green-600 text-xs font-bold mt-2 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> {plans[0].discount} aplicado
                            </div>
                        )}
                    </div>

                    {renderButton("pro", plans[0].cta, "blue")}

                    <div className="space-y-4">
                        <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Tudo incluso:</p>
                        {plans[0].features.map((feat, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                                <div className="text-blue-500 shrink-0">
                                    <Check className="w-4 h-4" />
                                </div>
                                <span className="font-medium flex items-center gap-2">
                                    <span className="text-slate-400">{feat.icon}</span>
                                    {feat.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* ULTRA CARD */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className={clsx(
                        "relative bg-slate-950 text-white rounded-[2rem] border-2 border-purple-500 shadow-2xl shadow-purple-500/30 p-8 flex flex-col h-full overflow-hidden",
                        currentPlan === 'ultra' ? "opacity-90" : ""
                    )}
                >
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 h-2"></div>

                    <div className="mb-6 relative z-10">
                        {currentPlan !== 'ultra' && (
                            <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-purple-500/40 mb-4">
                                <Crown className="w-3 h-3 mr-1 inline-block mb-0.5 fill-current" />
                                {plans[1].badge}
                            </div>
                        )}
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            {plans[1].name}
                        </h3>
                        <p className="text-slate-400 mt-2 text-sm font-medium">{plans[1].description}</p>
                    </div>

                    <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-white">{billingCycle === 'yearly' ? plans[1].yearlyPrice : plans[1].monthlyPrice}</span>
                            <span className="text-slate-400 font-medium">/{billingCycle === 'yearly' ? 'ano' : 'mês'}</span>
                        </div>
                        {currentPlan !== 'ultra' && (
                            <p className="text-purple-300 text-xs font-bold mt-2">
                                 Melhor Custo-Benefício do Mercado
                            </p>
                        )}
                    </div>

                    {renderButton("ultra", plans[1].cta, "white")}

                    <div className="relative z-10 space-y-4">
                        <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Tudo do Pro, mais:</p>
                        {plans[1].features.map((feat, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm text-slate-200">
                                <div className="text-purple-400 shrink-0">
                                    <Check className="w-4 h-4" />
                                </div>
                                <span className="font-semibold flex items-center gap-2">
                                    <span className="text-purple-400/50">{feat.icon}</span>
                                    {feat.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

// 4. ROI DEVASTADOR
function DevastatingROI() {
    return (
        <div className="max-w-3xl mx-auto bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 mb-24">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">A conta não mente 💸</h3>
                <p className="text-slate-500 mt-2">Veja quanto custaria montar essa estrutura separadamente:</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                <div className="flex-1 w-full space-y-3">
                    {[
                        { name: "ChatGPT Plus (IA)", price: "R$ 100,00" },
                        { name: "Midjourney (Arte)", price: "R$ 50,00" },
                        { name: "Linktree Pro (Links)", price: "R$ 45,00" },
                        { name: "Analytics Pro", price: "R$ 40,00" },
                        { name: "App de Sorteios", price: "R$ 29,00" },
                    ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-2 last:border-0">
                            <span>{item.name}</span>
                            <span className="line-through">{item.price}</span>
                        </div>
                    ))}
                    <div className="pt-2 flex justify-between items-center font-bold text-red-500 border-t border-slate-300 dark:border-slate-700 mt-2">
                        <span>Total Mensal:</span>
                        <span>R$ 264,00</span>
                    </div>
                </div>

                <div className="hidden md:block">
                    <ArrowRight className="w-8 h-8 text-slate-300" />
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-green-100 dark:border-green-900/30 w-full md:w-auto min-w-[250px] text-center transform scale-105">
                    <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Freelinnk Ultra</p>
                    <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">R$ 77</p>
                    <p className="text-sm text-slate-500 mb-4">/mês</p>
                    <Badge className="bg-green-100 text-green-700 border-0 w-full justify-center py-1.5 font-bold">
                        💥 Economia: R$ 1.885/ano
                    </Badge>
                </div>
            </div>
        </div>
    )
}

// 5. GARANTIA PREMIUM
function GuaranteeSection() {
    return (
        <div className="max-w-2xl mx-auto text-center mb-20 bg-gradient-to-b from-transparent to-slate-50 dark:to-slate-900/50 p-8 rounded-3xl border border-transparent dark:border-slate-800">
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border border-slate-100 dark:border-slate-700 relative">
                <Shield className="w-8 h-8 text-green-500 fill-current opacity-20" />
                <Shield className="w-8 h-8 text-green-600 absolute" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Garantia Blindada de 7 Dias</h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-6">
                Use tudo: gere ideias, crie imagens, faça roteiros, organize seus links.
                Se em 7 dias você não sentir que o valor entregue é <strong>10x maior</strong> que o preço,
                nós devolvemos 100% do seu dinheiro. Sem perguntas.
            </p>
            <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Risco Zero</span>
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Cancelamento Fácil</span>
            </div>
        </div>
    )
}

// 6. FINAL CTA (EMOCIONAL & FORTE)
function FinalCTA({ handleCheckout, currentPlan }: { handleCheckout: (p: "pro" | "ultra") => void, currentPlan: PlanIdentifier }) {
    if (currentPlan !== 'free') return null;

    return (
        <div className="text-center pb-12">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6">
                Pronto para transformar seu perfil?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                    onClick={() => handleCheckout('pro')}
                    className="h-14 px-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl shadow-blue-500/30 hover:scale-105 transition-transform"
                >
                    Quero Crescer com o Plano Pro
                </Button>
            </div>
            <p className="mt-4 text-sm text-slate-500 font-medium">
                Junte-se a 5.427 criadores crescendo hoje.
            </p>
        </div>
    )
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function BillingContent() {
  const { user } = useUser();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanIdentifier>("free");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelFeedback, setCancelFeedback] = useState("");
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  useScrollTracking();

  useEffect(() => {
    const savedCycle = localStorage.getItem('preferredBillingCycle');
    if (savedCycle && (savedCycle === 'monthly' || savedCycle === 'yearly')) {
      setBillingCycle(savedCycle as BillingCycle);
    }
  }, []);

  const handleBillingCycleChange = (checked: boolean) => {
    const newCycle = checked ? 'yearly' : 'monthly';
    setBillingCycle(newCycle);
    localStorage.setItem('preferredBillingCycle', newCycle);
  };

  useEffect(() => {
    if (user?.publicMetadata?.subscriptionPlan) {
      setCurrentPlan(user.publicMetadata.subscriptionPlan as PlanIdentifier);
    } else {
      setCurrentPlan("free");
    }
  }, [user?.publicMetadata]);

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    if (success) {
        toast.success("🚀 Assinatura confirmada! Bem-vindo à elite.", { duration: 5000 });
        user?.reload();
        router.replace("/dashboard/billing", { scroll: false });
    }
    if (canceled) {
        toast.info("Pedido cancelado. Seus dados estão salvos caso queira tentar depois.");
        router.replace("/dashboard/billing", { scroll: false });
    }
  }, [searchParams, router, user]);

  async function handleCheckout(planIdentifier: PlanIdentifier) {
    if (planIdentifier === 'free') return;
    const planToBuy = planIdentifier as "pro" | "ultra";

    if (!user?.id) return toast.error("Você precisa estar logado.");
    setLoading(`${planToBuy}-${billingCycle}`);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planToBuy, cycle: billingCycle }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error || "Erro ao iniciar checkout");
    } catch  {
      toast.error("Erro no processamento. Tente novamente.");
    } finally {
      setLoading(null);
    }
  }

  async function handleCancel() {
    setLoading("cancel");
    try {
      const res = await fetch("/api/stripe/cancel", { method: "POST" });
      if (res.ok) {
        toast.success("Assinatura cancelada com sucesso.");
        await user?.reload();
        setCurrentPlan("free");
      } else throw new Error();
    } catch {
      toast.error("Erro ao cancelar. Contate o suporte.");
    } finally {
      setLoading(null);
    }
  }

  async function handleConfirmCancel() {
    setIsSendingFeedback(true);
    try {
        await fetch("/api/send-feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: user?.primaryEmailAddress?.emailAddress,
                userId: user?.id,
                reason: cancelReason,
                feedback: cancelFeedback
            })
        });
    } catch (e) { console.error(e); }
    setIsSendingFeedback(false);
    setShowCancelModal(false);
    handleCancel();
  }

  async function handleManageSubscription() {
    setLoading("portal");
    try {
        const res = await fetch("/api/stripe/portal", { method: "POST" });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
    } catch {
        toast.error("Erro ao abrir portal.");
    } finally {
        setLoading(null);
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-blue-100 selection:text-blue-900">

      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCancelModal(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl z-10 border border-slate-200 dark:border-slate-800">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ArrowRight className="w-8 h-8 text-red-500 fill-current" />
                    </div>
                    <h3 className="text-xl font-bold">Não vá embora ainda!</h3>
                    <p className="text-slate-500 text-sm mt-2">Você perderá acesso às ferramentas de IA e seus dados de analytics. Tem certeza?</p>
                </div>
                <div className="space-y-4 mb-6">
                     <select className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}>
                        <option value="">Por que está cancelando?</option>
                        <option value="expensive">Muito caro</option>
                        <option value="features">Faltam recursos</option>
                        <option value="usage">Não uso o suficiente</option>
                     </select>
                     <Textarea placeholder="Como podemos melhorar?" value={cancelFeedback} onChange={(e) => setCancelFeedback(e.target.value)} className="bg-slate-50" />
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowCancelModal(false)} className="flex-1 py-6">Voltar</Button>
                    <Button variant="destructive" onClick={handleConfirmCancel} disabled={!cancelReason || isSendingFeedback} className="flex-1 py-6 bg-red-500 hover:bg-red-600">
                        {isSendingFeedback ? <Loader2 className="animate-spin" /> : "Confirmar Cancelamento"}
                    </Button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-32">

        <PersonalHeader name={user?.firstName || "Criador"} currentPlan={currentPlan} />

        <LossAversionSection currentPlan={currentPlan} />

        <PricingSection
            currentPlan={currentPlan}
            billingCycle={billingCycle}
            handleBillingCycleChange={handleBillingCycleChange}
            loading={loading}
            handleCheckout={handleCheckout}
        />

        <DevastatingROI />

        <GuaranteeSection />

        <FinalCTA handleCheckout={handleCheckout} currentPlan={currentPlan} />

        {currentPlan !== "free" && (
            <div className="text-center border-t border-slate-200 pt-12 max-w-xl mx-auto pb-12">
                <Button variant="outline" onClick={handleManageSubscription} disabled={loading === "portal"} className="border-slate-300 w-full mb-6 h-12">
                     {loading === "portal" ? <Loader2 className="animate-spin mr-2" /> : <Settings className="mr-2 w-4 h-4" />}
                     Gerenciar Cartão e Faturas
                </Button>
                <Button variant="ghost" onClick={() => setShowCancelModal(true)} className="text-red-500 hover:text-red-600 hover:bg-red-50 w-full h-12 font-medium">
                    Cancelar assinatura
                </Button>
            </div>
        )}

      </div>

      {currentPlan === 'free' && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 right-0 z-50 p-4 lg:hidden bg-white/80 backdrop-blur-lg border-t border-slate-200">
            <Button onClick={() => handleCheckout('pro')} disabled={loading !== null} className="w-full bg-blue-600 text-white font-bold h-12 rounded-xl shadow-lg">
                Desbloquear Pro Agora
            </Button>
        </motion.div>
      )}

    </div>
  );
}