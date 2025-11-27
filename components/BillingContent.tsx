"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Loader2, Rocket, Star, CheckCircle, HelpCircle, XCircle,
  BrainCircuit, Wand2, Sparkles, Zap, ChevronRight,
  Shield, CreditCard, Target, MessageSquare,
  Palette, Clock, TrendingUp, Users, Flame, AlertCircle,
  Eye, ArrowRight, Lock, Award, BarChart3, Gift, Crown,
   Layers,
   Heart,
   BadgeCheck,
   ChevronDown,
   Timer,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence,  useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";


import { Infinity } from "lucide-react";
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

  console.log(`📊 Event tracked: ${eventName}`, properties);
}

// ✅ Live viewers simulator
function useLiveViewers(baseCount: number = 87) {
  const [viewers, setViewers] = useState(baseCount);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(prev => {
        const change = Math.floor(Math.random() * 7) - 3;
        const newCount = prev + change;
        return Math.max(baseCount - 10, Math.min(baseCount + 20, newCount));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [baseCount]);

  return viewers;
}

// ✅ Scroll depth tracking
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

// Tipos e constantes
type PlanIdentifier = "free" | "pro" | "ultra";
type BillingCycle = "monthly" | "yearly";

interface Feature {
  text: string;
  icon?: React.ReactNode;
  highlight?: boolean;
  comingSoon?: boolean;
  proOnly?: boolean;
  ultraOnly?: boolean;
}

interface FeatureSection {
  title: string;
  features: Feature[];
}

interface Plan {
  id: PlanIdentifier;
  name: string;
  tagline: string;
  monthlyPrice: string;
  yearlyPrice?: string;
  originalPrice?: string;
  yearlyOriginalPrice?: string;
  discount?: string;
  priceDetails: string;
  features: FeatureSection[];
  icon: React.ReactNode;
  color: string;
  gradient: string;
  recommended?: boolean;
  popularFeatures?: string[];
  spotsLeft?: number;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Para organizar seus links e experimentar o poder da IA.",
    monthlyPrice: "Grátis",
    priceDetails: "para sempre",
    popularFeatures: [
      "Links e cliques ilimitados",
      "URL personalizada",
      "Analytics básicos"
    ],
    features: [
      {
        title: "Links e Métricas",
        features: [
          { text: "Links e cliques ilimitados", icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
          { text: "URL personalizada (seu_nome.freelinnk.com)", icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
          { text: "Encurtador de links", icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
          { text: "Analytics básicos (visualizações, cliques)", icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
          { text: "Analytics avançados (dispositivos, localizações)", icon: <XCircle className="w-4 h-4 text-gray-300" />, proOnly: true }
        ]
      },
      {
        title: "Ferramentas de IA",
        features: [
          { text: "FreelinnkBrain - Ideias virais", icon: <XCircle className="w-4 h-4 text-gray-300" />, proOnly: true },
          { text: "Gerador de vídeos virais", icon: <XCircle className="w-4 h-4 text-gray-300" />, proOnly: true },
          { text: "Geração de imagens com IA", icon: <XCircle className="w-4 h-4 text-gray-300" />, ultraOnly: true },
          { text: "Aprimoramento de imagens com IA", icon: <XCircle className="w-4 h-4 text-gray-300" />, ultraOnly: true },
          { text: "Calendário de conteúdo personalizado", icon: <XCircle className="w-4 h-4 text-gray-300" />, proOnly: true }
        ]
      },
      {
        title: "Marketing e Monetização",
        features: [
          { text: "Personalização básica", icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
          { text: "Ferramenta de sorteios", icon: <XCircle className="w-4 h-4 text-gray-300" />, proOnly: true },
          { text: "Rastreamento avançado (Pixel, GA4)", icon: <XCircle className="w-4 h-4 text-gray-300" />, ultraOnly: true },
          { text: "Remover marca Freelinnk", icon: <XCircle className="w-4 h-4 text-gray-300" />, proOnly: true }
        ]
      }
    ],
    icon: <CheckCircle className="w-5 h-5"/>,
    color: "gray",
    gradient: "from-gray-400 to-gray-600"
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Para criadores que querem crescer com inteligência artificial.",
    monthlyPrice: "R$ 34,90",
    originalPrice: "R$ 69,90",
    yearlyPrice: "R$ 349",
    yearlyOriginalPrice: "R$ 699",
    discount: "50%",
    priceDetails: "/mês",
    spotsLeft: 47,
    popularFeatures: [
      "🧠 FreelinnkBrain - 6 ideias virais/dia",
      "🎬 3 roteiros de vídeos virais/dia",
      "📊 Analytics avançados completos",
      "🚫 Sem marca d'água Freelinnk"
    ],
    features: [
      {
        title: "Links e Métricas",
        features: [
          { text: "Tudo do plano Free", icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
          { text: "Analytics avançados (dispositivos, localizações)", icon: <CheckCircle className="w-4 h-4 text-green-500" />, highlight: true },
          { text: "Prioridade no suporte", icon: <CheckCircle className="w-4 h-4 text-green-500" /> }
        ]
      },
      {
        title: "Ferramentas de IA",
        features: [
          { text: "FreelinnkBrain: 6 ideias virais por dia", icon: <CheckCircle className="w-4 h-4 text-green-500" />, highlight: true },
          { text: "3 roteiros de vídeos virais por dia", icon: <CheckCircle className="w-4 h-4 text-green-500" />, highlight: true },
          { text: "Templates prontos para posts", icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
          { text: "Geração de imagens com IA", icon: <XCircle className="w-4 h-4 text-gray-300" />, ultraOnly: true },
          { text: "Aprimoramento de imagens com IA", icon: <XCircle className="w-4 h-4 text-gray-300" />, ultraOnly: true },
          { text: "Calendário ilimitado", icon: <XCircle className="w-4 h-4 text-gray-300" />, proOnly: true }
        ]
      },
      {
        title: "Marketing e Monetização",
        features: [
          { text: "Personalização completa", icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
          { text: "Remover marca Freelinnk", icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
          { text: "Ferramenta de sorteios", icon: <CheckCircle className="w-4 h-4  text-green-500" />, proOnly: true , highlight: true, },
          { text: "Rastreamento avançado (Pixel, GA4)", icon: <XCircle className="w-4 h-4 text-gray-300" />, ultraOnly: true }
        ]
      }
    ],
    icon: <BrainCircuit className="w-5 h-5" />,
    color: "blue",
    gradient: "from-blue-500 to-indigo-600",
    recommended: true
  },
  {
    id: "ultra",
    name: "Ultra",
    tagline: "Plataforma completa com IA para escalar seu conteúdo profissionalmente.",
    monthlyPrice: "R$ 77,90",
    originalPrice: "R$ 157,90",
    yearlyPrice: "R$ 779",
    yearlyOriginalPrice: "R$ 1579",
    discount: "51%",
    priceDetails: "/mês",
    spotsLeft: 23,
    popularFeatures: [
      "🎨 7 imagens com IA por dia + aprimoramentos",
      "🧠 FreelinnkBrain ILIMITADO",
      "🎬 Vídeos virais ILIMITADOS",
      "🎁 Sistema completo de sorteios",
      "📱 Suporte VIP no WhatsApp"
    ],
    features: [
      {
        title: "Links e Métricas",
        features: [
          { text: "Tudo do plano Pro", icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
          { text: "Painel de controle avançado", icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
          { text: "Suporte VIP via WhatsApp", icon: <CheckCircle className="w-4 h-4 text-green-500" />, highlight: true }
        ]
      },
      {
        title: "Ferramentas de IA",
        features: [
          { text: "7 gerações de imagens com IA por dia", icon: <CheckCircle className="w-4 h-4 text-green-500" />, highlight: true },
          { text: "Aprimoramentos de imagens ilimitados", icon: <CheckCircle className="w-4 h-4 text-green-500" />, highlight: true },
          { text: "FreelinnkBrain ILIMITADO", icon: <CheckCircle className="w-4 h-4 text-green-500" />, highlight: true },
          { text: "Vídeos virais ILIMITADOS", icon: <CheckCircle className="w-4 h-4 text-green-500" />, highlight: true },
          { text: "Calendário de conteúdo personalizado", icon: <CheckCircle className="w-4 h-4 text-green-500" />, highlight: true },
          { text: "Agendamento automático de posts com notificações", icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
          { text: "AI-Studio completo", icon: <CheckCircle className="w-4 h-4 text-green-500" /> }
        ]
      },
      {
        title: "Marketing e Monetização",
        features: [
          { text: "Ferramenta de sorteios via comentários", icon: <CheckCircle className="w-4 h-4 text-green-500" />, highlight: true },
          { text: "Rastreamento avançado (Pixel, GA4)", icon: <CheckCircle className="w-4 h-4 text-green-500" />, highlight: true },
          { text: "API para integrações", icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
          { text: "Acesso antecipado a novos recursos", icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
          { text: "Calculadora de Lucros IA Completa", icon: <CheckCircle className="w-4 h-4 text-green-500" />, highlight: true }
        ]
      }
    ],
    icon: <Rocket className="w-5 h-5" />,
    color: "purple",
    gradient: "from-purple-500 to-pink-600"
  }
];

// ✅ Animated Background Particles
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
          }}
          animate={{
            x: [null, Math.random() * 400 - 200],
            y: [null, Math.random() * 400 - 200],
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: Math.random() * 10 + 10,

            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  );
}

// ✅ Animated Counter Component
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString('pt-BR')}{suffix}
    </span>
  );
}

// ✅ Premium Countdown Timer
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-1.5">
      {[
        { value: timeLeft.hours, label: 'h' },
        { value: timeLeft.minutes, label: 'm' },
        { value: timeLeft.seconds, label: 's' }
      ].map((item, i) => (
        <div key={i} className="flex items-center">
          <motion.div
            key={item.value}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <div className="bg-gradient-to-b from-red-500 to-red-700 text-white px-2.5 py-1.5 rounded-lg font-mono font-bold text-lg shadow-lg shadow-red-500/30">
              {String(item.value).padStart(2, '0')}
            </div>
            <div className="absolute inset-x-0 top-1/2 h-px bg-red-400/30" />
          </motion.div>
          {i < 2 && (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1,  }}
              className="text-red-500 font-bold mx-0.5 text-xl"
            >
              :
            </motion.span>
          )}
        </div>
      ))}
    </div>
  );
}

// ✅ Premium Sticky CTA Mobile
function StickyMobileCTA({
  currentPlan,
  loading,
  onCheckout
}: {
  currentPlan: PlanIdentifier;
  loading: string | null;
  onCheckout: (plan: "pro" | "ultra") => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [showPulse, setShowPulse] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowPulse(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (currentPlan !== 'free') return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        >
          {/* Gradient border top */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 p-4 safe-area-pb">
            <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
              <div className="flex-shrink-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400 line-through">R$ 69,90</span>
                  <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 h-4">-50%</Badge>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-gray-900 dark:text-white">R$ 34,90</span>
                  <span className="text-xs text-gray-500">/mês</span>
                </div>
              </div>

              <div className="relative flex-1 max-w-[180px]">
                {showPulse && (
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5,  }}
                    className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur-sm opacity-75"
                  />
                )}
                <Button
                  onClick={() => {
                    trackEvent('StickyCtaClicked', { plan: 'pro' });
                    onCheckout('pro');
                  }}
                  disabled={loading !== null}
                  className="relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-6 rounded-xl shadow-xl shadow-blue-500/25 transition-all duration-300"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      <Rocket className="w-4 h-4" />
                      Começar Agora
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ✅ Premium Trust Badges
function TrustBadges() {
  const badges = [
    { icon: Shield, text: "Pagamento 100% Seguro", color: "blue" },
    { icon: Lock, text: "Dados Criptografados", color: "green" },
    { icon: Award, text: "7 Dias de Garantia", color: "purple" },
    { icon: CreditCard, text: "Cancele Quando Quiser", color: "orange" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {badges.map((badge, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
          <div className="relative bg-white dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-4 text-center hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-${badge.color}-100 to-${badge.color}-50 dark:from-${badge.color}-900/30 dark:to-${badge.color}-800/20 flex items-center justify-center`}>
              <badge.icon className={`w-6 h-6 text-${badge.color}-600 dark:text-${badge.color}-400`} />
            </div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{badge.text}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ✅ Premium Comparison Table
function ComparisonTable() {
  const features = [
    { name: "Links ilimitados", free: true, pro: true, ultra: true },
    { name: "Analytics básicos", free: true, pro: true, ultra: true },
    { name: "Analytics avançados", free: false, pro: true, ultra: true },
    { name: "FreelinnkBrain", free: false, pro: "6/dia", ultra: "∞ Ilimitado" },
    { name: "Vídeos Virais IA", free: false, pro: "3/dia", ultra: "∞ Ilimitado" },
    { name: "Geração de imagens IA", free: false, pro: false, ultra: "7/dia" },
    { name: "Aprimoramento de imagens", free: false, pro: false, ultra: "∞ Ilimitado" },
    { name: "Sistema de Sorteios", free: false, pro: true, ultra: true },
    { name: "Pixels de rastreamento", free: false, pro: false, ultra: true },
    { name: "Remover marca Freelinnk", free: false, pro: true, ultra: true },
    { name: "Suporte", free: "Email", pro: "Prioritário", ultra: "VIP WhatsApp" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative"
    >
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl blur-2xl" />

      <div className="relative overflow-hidden rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
                <th className="text-left p-4 md:p-5 font-semibold text-sm text-gray-600 dark:text-gray-300">
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Recursos
                  </span>
                </th>
                <th className="text-center p-4 md:p-5 font-semibold text-sm text-gray-500">
                  Free
                </th>
                <th className="text-center p-4 md:p-5 font-semibold text-sm relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent" />
                  <span className="relative flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                    Pro
                    <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] px-2">Popular</Badge>
                  </span>
                </th>
                <th className="text-center p-4 md:p-5 font-semibold text-sm relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent" />
                  <span className="relative flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400">
                    Ultra
                    <Crown className="w-4 h-4" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="border-t border-gray-100 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="p-4 text-sm font-medium text-gray-700 dark:text-gray-300">{feature.name}</td>
                  <td className="p-4 text-center">
                    {typeof feature.free === 'boolean' ? (
                      feature.free ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                      )
                    ) : (
                      <span className="text-xs text-gray-500">{feature.free}</span>
                    )}
                  </td>
                  <td className="p-4 text-center bg-blue-50/30 dark:bg-blue-900/10">
                    {typeof feature.pro === 'boolean' ? (
                      feature.pro ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                      )
                    ) : (
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                        {feature.pro}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center bg-purple-50/30 dark:bg-purple-900/10">
                    {typeof feature.ultra === 'boolean' ? (
                      feature.ultra ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
                      )
                    ) : (
                      <span className={clsx(
                        "text-xs font-semibold px-2 py-1 rounded-full",
                        feature.ultra.includes('∞')
                          ? "text-purple-600 dark:text-purple-400 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30"
                          : "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30"
                      )}>
                        {feature.ultra}
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

// ✅ Premium ROI Section
function ROISection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* Background glow */}
      <div className="absolute -inset-8 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-[3rem] blur-3xl" />

      <div className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 rounded-3xl p-6 sm:p-10 border border-green-200/50 dark:border-green-700/30 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-400/20 to-transparent rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4,  }}
              className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl shadow-green-500/30"
            >
              <BarChart3 className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                Retorno do Seu Investimento
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
                Veja quanto você economiza e pode lucrar com Freelinnk
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                label: "Investimento Ultra (anual)",
                value: "R$ 779",
                subtext: "vs. R$ 2.496/ano em ferramentas separadas",
                icon: CreditCard,
                color: "blue"
              },
              {
                label: "Sua Economia Anual",
                value: "R$ 1.717",
                subtext: "69% mais barato que usar ferramentas separadas",
                icon: TrendingUp,
                color: "green",
                highlight: true
              },
              {
                label: "Payback do Investimento",
                value: "1 venda",
                subtext: "Com qualquer produto acima de R$ 97",
                icon: Target,
                color: "purple"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.1 }}
                className={clsx(
                  "relative bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                  item.highlight
                    ? "border-green-300 dark:border-green-600 shadow-lg shadow-green-500/10"
                    : "border-gray-200/50 dark:border-gray-700/50"
                )}
              >
                {item.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Melhor valor
                    </Badge>
                  </div>
                )}
                <div className={`w-10 h-10 rounded-xl bg-${item.color}-100 dark:bg-${item.color}-900/30 flex items-center justify-center mb-3`}>
                  <item.icon className={`w-5 h-5 text-${item.color}-600 dark:text-${item.color}-400`} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                <p className={clsx(
                  "text-2xl sm:text-3xl font-black",
                  item.highlight ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"
                )}>
                  {item.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{item.subtext}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ✅ Premium Testimonials
function TestimonialsSection() {
  const testimonials = [
    {
      name: "Maria Silva",
      role: "Influenciadora Digital",
      achievement: "3K → 47K seguidores",
      text: "O FreelinnkBrain mudou tudo! Nunca mais fico sem ideias de conteúdo. Em 3 meses triplicei meu engajamento.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria&backgroundColor=b6e3f4",
      rating: 5,
      verified: true
    },
    {
      name: "João Pedro",
      role: "Afiliado Digital",
      achievement: "R$ 15K/mês",
      text: "As imagens geradas por IA são incríveis! Meus posts têm 3x mais cliques. O investimento se paga em uma semana.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao&backgroundColor=c0aede",
      rating: 5,
      verified: true
    },
    {
      name: "Ana Costa",
      role: "Criadora de Conteúdo",
      achievement: "100K views em 7 dias",
      text: "O suporte VIP no WhatsApp é sensacional. Qualquer dúvida, tenho resposta em minutos. Nunca vi isso!",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana&backgroundColor=ffd5dc",
      rating: 5,
      verified: true
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white mb-4">
          <Star className="w-3 h-3 mr-1 fill-current" />
          Avaliação 4.9/5 de +10.000 criadores
        </Badge>
        <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-2">
          Histórias Reais de Sucesso
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Veja o que nossos usuários estão conquistando
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            whileHover={{ y: -5 }}
            className="group relative"
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative bg-white dark:bg-slate-800/90 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300">
              {/* Achievement badge */}
              <div className="absolute -top-3 -right-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2,  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
                >
                  {t.achievement}
                </motion.div>
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + j * 0.1 }}
                  >
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </motion.div>
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed italic">
                {t.text}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-12 h-12 rounded-full border-2 border-blue-500"
                  />
                  {t.verified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <BadgeCheck className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ✅ Premium Savings Comparison
function SavingsComparison() {
  const tools = [
    { name: "Canva Pro", price: "R$ 34,90" },
    { name: "ChatGPT Plus", price: "R$ 100,00" },
    { name: "Midjourney", price: "R$ 50,00" },
    { name: "Linktree Pro", price: "R$ 24,00" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative"
    >
      {/* Background */}
      <div className="absolute -inset-8 bg-gradient-to-r from-red-500/5 via-orange-500/5 to-green-500/5 rounded-[3rem] blur-3xl" />

      <div className="relative bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 p-6 sm:p-8 border-b border-gray-200/50 dark:border-gray-700/50">
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, }}
          >
            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white mb-4 shadow-lg">
              <Zap className="w-3 h-3 mr-1" />
              Economize R$ 1.717 por ano
            </Badge>
          </motion.div>
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            Por que pagar mais por ferramentas separadas?
          </h3>
        </div>

        <div className="grid md:grid-cols-2">
          {/* Ferramentas separadas */}
          <div className="p-6 sm:p-8 border-b md:border-b-0 md:border-r border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <h4 className="font-bold text-red-600 dark:text-red-400">
                Ferramentas separadas
              </h4>
            </div>

            <div className="space-y-3 mb-6">
              {tools.map((tool, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-400">{tool.name}</span>
                  <span className="font-mono text-sm line-through text-gray-400">{tool.price}</span>
                </motion.div>
              ))}
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Total Mensal</span>
                <span className="text-2xl font-black text-red-600">R$ 208,90</span>
              </div>
              <p className="text-xs text-red-600/80 mt-1">= R$ 2.506,80 por ano 😱</p>
            </div>
          </div>

          {/* Freelinnk Ultra */}
          <div className="p-6 sm:p-8 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10">
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4,  }}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30"
              >
                <CheckCircle className="w-5 h-5 text-white" />
              </motion.div>
              <h4 className="font-bold text-green-600 dark:text-green-400">
                Tudo no Freelinnk Ultra
              </h4>
            </div>

            <div className="space-y-3 mb-6">
              {[
                "FreelinnkBrain ILIMITADO",
                "7 imagens IA + aprimoramentos ∞",
                "Vídeos virais ILIMITADOS",
                "Links + Analytics + Sorteios",
                "Suporte VIP WhatsApp"
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2,  }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white shadow-xl shadow-green-500/30"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">Apenas</span>
                <span className="text-2xl font-black">R$ 77,90/mês</span>
              </div>
              <p className="text-xs text-green-100 mt-1">= R$ 779/ano (ou menos no plano anual)</p>
            </motion.div>

            <div className="mt-4 text-center">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, }}
                className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-lg"
              >
                <TrendingUp className="w-5 h-5" />
                Economia de R$ 1.727,80/ano!
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ✅ Premium Guarantee Section
function GuaranteeSection() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="relative"
    >
      {/* Glow */}
      <div className="absolute -inset-8 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-[3rem] blur-3xl" />

      <div className="relative max-w-2xl mx-auto text-center">
        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-3xl p-8 sm:p-12 border border-blue-200/50 dark:border-blue-700/30">
          {/* Shield icon with animation */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 4, }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30"
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>

          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-4">
            Garantia Blindada de 7 Dias
          </h3>

          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Teste qualquer plano premium por 7 dias completos. Se você não ficar
            <span className="font-bold text-gray-900 dark:text-white"> 100% satisfeito</span>,
            devolvemos cada centavo. Sem perguntas, sem burocracia, sem letras miúdas.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: CheckCircle, text: "Reembolso total" },
              { icon: Clock, text: "7 dias para testar" },
              { icon: Heart, text: "Sem perguntas" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <item.icon className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ✅ Premium FAQ
function FAQ() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Quantas imagens posso gerar por dia no plano Ultra?",
      a: "No plano Ultra você pode gerar 7 imagens novas por dia + aprimoramentos ilimitados de imagens existentes. Os limites resetam diariamente às 00:00. Isso é suficiente para manter suas redes sempre atualizadas sem desperdício.",
      icon: Palette
    },
    {
      q: "O FreelinnkBrain tem limite no plano Ultra?",
      a: "Não! No plano Ultra o FreelinnkBrain é completamente ILIMITADO. Você pode gerar quantas ideias virais e roteiros de vídeos quiser, sem restrições. No Pro você tem 6 gerações por dia.",
      icon: BrainCircuit
    },
    {
      q: "Por quanto tempo o desconto vai durar?",
      a: "Esta é uma oferta especial limitada. Os preços podem voltar ao normal (R$ 69,90 Pro e R$ 157,90 Ultra) a qualquer momento. Garantimos o preço promocional apenas para quem assinar agora.",
      icon: Timer
    },
    {
      q: "Posso cancelar a qualquer momento?",
      a: "Sim! Você pode cancelar quando quiser direto no painel, sem falar com ninguém. Seu acesso continua até o final do período pago.",
      icon: XCircle
    },
    {
      q: "E se eu não gostar?",
      a: "Oferecemos garantia incondicional de 7 dias. Se não ficar 100% satisfeito, devolvemos todo seu dinheiro sem perguntas.",
      icon: Shield
    },
    {
      q: "7 imagens por dia é suficiente?",
      a: "Para a maioria dos criadores, sim! São 210 imagens por mês. A maioria usa 2-3 por dia. Se precisar de mais, você sempre pode usar o aprimoramento ilimitado para melhorar fotos existentes.",
      icon: Sparkles
    },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white mb-4">
          <HelpCircle className="w-3 h-3 mr-1" />
          Tire suas dúvidas
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
          Perguntas Frequentes
        </h2>
      </motion.div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
          >
            <button
              className={clsx(
                "w-full text-left bg-white dark:bg-slate-800/80 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border transition-all duration-300",
                expandedFaq === index
                  ? "border-blue-300 dark:border-blue-600 shadow-lg shadow-blue-500/10"
                  : "border-gray-200/50 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-md"
              )}
              onClick={() => {
                setExpandedFaq(expandedFaq === index ? null : index);
                trackEvent('FaqClicked', { question: faq.q, index });
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                    expandedFaq === index
                      ? "bg-blue-100 dark:bg-blue-900/30"
                      : "bg-gray-100 dark:bg-gray-700/50"
                  )}>
                    <faq.icon className={clsx(
                      "w-5 h-5 transition-colors",
                      expandedFaq === index
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400"
                    )} />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200">
                    {faq.q}
                  </h3>
                </div>
                <motion.div
                  animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </motion.div>
              </div>

              <AnimatePresence>
                {expandedFaq === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 pl-13 leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ✅ Premium Plan Card
interface PlanCardProps {
  plan: Plan;
  currentPlan: PlanIdentifier;
  billingCycle: BillingCycle;
  loading?: string | null;
  onCheckout?: (plan: "pro" | "ultra") => void;
  onCancel?: () => void;
  toggleFeatureSection: (section: string) => void;
  expandedFeatures: Record<string, boolean>;
}

function PlanCard({
  plan,
  currentPlan,
  billingCycle,
  loading,
  onCheckout,
  onCancel,
  toggleFeatureSection,
  expandedFeatures
}: PlanCardProps) {
  const isCurrent = plan.id === currentPlan;
  const isFree = plan.id === "free";
  const loadingId = `${plan.id}-${billingCycle}`;
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });

  const displayPrice = billingCycle === 'yearly' && plan.yearlyPrice
    ? plan.yearlyPrice
    : plan.monthlyPrice;

  const displayOriginalPrice = billingCycle === 'yearly'
    ? plan.yearlyOriginalPrice
    : plan.originalPrice;

  const displayPriceDetails = billingCycle === 'yearly' && plan.yearlyPrice
    ? '/ano'
    : plan.priceDetails;

  const gradientClasses = {
    gray: "from-gray-500 to-gray-600",
    blue: "from-blue-500 to-indigo-600",
    purple: "from-purple-500 to-pink-600"
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: plan.id === "pro" ? 0.1 : plan.id === "ultra" ? 0.2 : 0 }}
      whileHover={{ y: -8 }}
      onMouseEnter={() => trackEvent('PlanCardHover', { plan: plan.id })}
      className="relative group"
    >
      {/* Glow effect for recommended */}
      {plan.recommended && (
        <motion.div
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.02, 1]
          }}
          transition={{ duration: 3, }}
          className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-3xl blur-xl"
        />
      )}

      <div
        className={clsx(
          "relative rounded-2xl sm:rounded-3xl border bg-white dark:bg-slate-800/95 backdrop-blur-sm p-5 sm:p-7 flex flex-col h-full transition-all duration-500",
          plan.recommended
            ? "lg:scale-105 shadow-2xl border-transparent ring-2 ring-blue-500/50"
            : isCurrent
              ? `border-2 border-${plan.color}-500 shadow-xl`
              : "border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-xl"
        )}
      >
        {/* Recommended Badge */}
        {plan.recommended && (
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2,}}
            className="absolute -top-4 inset-x-0 flex justify-center"
          >
            <div className="px-4 py-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-xl shadow-blue-500/30">
              <Flame className="w-3.5 h-3.5 animate-pulse" />
              MAIS POPULAR - {plan.discount} OFF
              <Flame className="w-3.5 h-3.5 animate-pulse" />
            </div>
          </motion.div>
        )}

        {/* Discount Badge */}
        {plan.discount && !plan.recommended && (
          <div className="absolute top-4 right-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, }}
            >
              <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 px-2.5 py-1 shadow-lg">
                -{plan.discount}
              </Badge>
            </motion.div>
          </div>
        )}

        {/* Spots Left */}
        {plan.spotsLeft && (
          <motion.div
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, }}
            className="mb-4 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-700 dark:text-orange-300 p-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-orange-200 dark:border-orange-800"
          >
            <Users className="w-4 h-4" />
            Apenas {plan.spotsLeft} vagas com desconto
          </motion.div>
        )}

        {/* Plan Header */}
        <div className="mb-5 sm:mb-6">
          <div className="flex items-center gap-3 mb-3">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className={`p-2.5 rounded-xl bg-gradient-to-br ${gradientClasses[plan.color as keyof typeof gradientClasses]} shadow-lg`}
            >
              <div className="text-white">{plan.icon}</div>
            </motion.div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                {plan.name}
              </h2>
            </div>
            {isCurrent && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <CheckCircle className="w-3 h-3 mr-1" />
                Atual
              </Badge>
            )}
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 min-h-[2.5rem]">
            {plan.tagline}
          </p>
        </div>

        {/* Pricing */}
        <div className="mb-6">
          {displayOriginalPrice && (
            <p className="text-gray-400 line-through text-sm mb-1">
              De {displayOriginalPrice}
            </p>
          )}
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
              {displayPrice}
            </span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {displayPriceDetails}
            </span>
          </div>
          {plan.discount && (
            <motion.p
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, }}
              className="text-xs text-green-600 dark:text-green-400 font-semibold mt-2 flex items-center gap-1"
            >
              <Gift className="w-3 h-3" />
              Você economiza {billingCycle === 'yearly'
                ? `R$ ${(parseInt(plan.yearlyOriginalPrice!.replace(/\D/g,'')) - parseInt(plan.yearlyPrice!.replace(/\D/g,'')))} por ano`
                : `R$ ${(parseFloat(plan.originalPrice!.replace('R$', '').replace(',', '.').trim()) - parseFloat(plan.monthlyPrice.replace('R$', '').replace(',', '.').trim())).toFixed(2).replace('.', ',')} por mês`
              }
            </motion.p>
          )}
        </div>

        {/* Popular Features */}
        {plan.popularFeatures && (
          <div className="mb-6 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/30">
            <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
              Recursos Mais Populares
            </h3>
            <ul className="space-y-2">
              {plan.popularFeatures.map((feature, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-start text-sm text-gray-700 dark:text-gray-300"
                >
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* Expandable Features */}
        <div className="flex-grow space-y-3">
          {plan.features.map((section, sectionIndex) => {
            const isExpanded = expandedFeatures[`${plan.id}-${section.title}`] !== false;
            return (
              <div key={sectionIndex} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0 pb-3 last:pb-0">
                <button
                  className="flex items-center justify-between w-full text-left py-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group/section"
                  onClick={() => toggleFeatureSection(`${plan.id}-${section.title}`)}
                >
                  <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    {section.title}
                  </h3>
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    className="text-gray-400 group-hover/section:text-blue-500"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1.5 mt-2 text-sm overflow-hidden"
                    >
                      {section.features.map((feature, index) => (
                        <li
                          key={index}
                          className={clsx(
                            "flex items-start gap-2",
                            (feature.proOnly && plan.id === "free") || (feature.ultraOnly && plan.id !== "ultra")
                              ? "opacity-50"
                              : ""
                          )}
                        >
                          {feature.icon}
                          <span
                            className={clsx(
                              "text-xs",
                              feature.highlight
                                ? "font-semibold text-gray-800 dark:text-gray-200"
                                : "text-gray-600 dark:text-gray-400"
                            )}
                          >
                            {feature.text}
                            {feature.comingSoon && (
                              <Badge variant="outline" className="ml-1.5 text-[10px] py-0 h-4">Em breve</Badge>
                            )}
                            {feature.proOnly && plan.id === "free" && (
                              <Badge className="ml-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] py-0 h-4">Pro</Badge>
                            )}
                            {feature.ultraOnly && plan.id !== "ultra" && (
                              <Badge className="ml-1.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-[10px] py-0 h-4">Ultra</Badge>
                            )}
                          </span>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
                {/* CTA Button */}
        <div className="mt-6 sm:mt-8">
          {isCurrent ? (
            isFree ? (
              <Button
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                disabled
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Seu Plano Atual
              </Button>
            ) : (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={onCancel}
                  disabled={loading === 'cancel'}
                >
                  {loading === 'cancel' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Cancelar Assinatura
                </Button>
                <p className="text-[10px] text-center text-gray-500 dark:text-gray-400">
                  Acesso mantido até o fim do período pago
                </p>
              </div>
            )
          ) : (
            !isFree && onCheckout && (
              <div className="space-y-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                >
                  {/* Button glow */}
                  {plan.recommended && (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2,}}
                      className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur-md"
                    />
                  )}

                  <Button
                    onClick={() => {
                      trackEvent('InitiateCheckout', {
                        plan: plan.id,
                        cycle: billingCycle,
                        price: billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice
                      });
                      onCheckout(plan.id as "pro" | "ultra");
                    }}
                    disabled={loading === loadingId}
                    className={clsx(
                      "relative w-full text-white font-bold py-6 rounded-xl shadow-xl transition-all duration-300 text-sm sm:text-base",
                      `bg-gradient-to-r ${gradientClasses[plan.color as keyof typeof gradientClasses]}`,
                      plan.recommended && "shadow-blue-500/30"
                    )}
                  >
                    {loading === loadingId ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Rocket className="w-4 h-4" />
                        {currentPlan === 'free' && plan.id === 'pro' && 'COMEÇAR AGORA'}
                        {currentPlan === 'free' && plan.id === 'ultra' && 'QUERO ACESSO TOTAL'}
                        {currentPlan === 'pro' && plan.id === 'ultra' && 'FAZER UPGRADE'}
                        {currentPlan === 'ultra' && plan.id === 'pro' && 'Fazer Downgrade'}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </motion.div>

                {plan.spotsLeft && (
                  <motion.p
                    animate={{ opacity: [1, 0.6, 1] }}
                    transition={{ duration: 1.5  }}
                    className="text-[10px] text-center text-orange-600 dark:text-orange-400 font-semibold flex items-center justify-center gap-1"
                  >
                    <Flame className="w-3 h-3" />
                    Apenas {plan.spotsLeft} vagas restantes com desconto
                  </motion.p>
                )}

                {/* Trust indicators */}
                <div className="flex items-center justify-center gap-3 text-[10px] text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Seguro
                  </span>
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    SSL
                  </span>
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    Stripe
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// ✅ COMPONENTE PRINCIPAL - BILLING CONTENT
// ============================================

export default function BillingContent() {
  const { user } = useUser();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanIdentifier>("free");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [expandedFeatures, setExpandedFeatures] = useState<Record<string, boolean>>({});
  const searchParams = useSearchParams();
  const router = useRouter();
  const liveViewers = useLiveViewers(87);


  // Modal de cancelamento
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelFeedback, setCancelFeedback] = useState("");
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  useScrollTracking();

  // Carregar preferências
  useEffect(() => {
    const savedCycle = localStorage.getItem('preferredBillingCycle');
    if (savedCycle && (savedCycle === 'monthly' || savedCycle === 'yearly')) {
      setBillingCycle(savedCycle as BillingCycle);
    }

    trackEvent('ViewPricingPage', {
      current_plan: currentPlan,
      default_cycle: savedCycle || 'monthly'
    });
  }, []);

  const handleBillingCycleChange = (checked: boolean) => {
    const newCycle = checked ? 'yearly' : 'monthly';
    setBillingCycle(newCycle);
    localStorage.setItem('preferredBillingCycle', newCycle);

    trackEvent('BillingCycleChanged', {
      from: billingCycle,
      to: newCycle,
      discount_visible: newCycle === 'yearly'
    });
  };

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    async function handlePurchaseResult() {
      if (success) {
        toast.success("🎉 Assinatura realizada com sucesso! Bem-vindo ao time!", {
          duration: 5000,
        });
        await user?.reload();

        trackEvent('PurchaseCompleted', {
          plan: currentPlan,
          cycle: billingCycle
        });
      }
      if (canceled) {
        toast.info("Processo cancelado. Estamos aqui quando estiver pronto!", {
          description: "Tem alguma dúvida? Fale conosco no WhatsApp."
        });

        trackEvent('CheckoutCanceled', {
          plan: currentPlan,
          cycle: billingCycle
        });
      }
      if (success || canceled) {
        router.replace("/dashboard/billing", { scroll: false });
      }
    }

    handlePurchaseResult();
  }, [searchParams, router, user]);

  useEffect(() => {
    if (user?.publicMetadata?.subscriptionPlan) {
      setCurrentPlan(user.publicMetadata.subscriptionPlan as PlanIdentifier);
    } else {
      setCurrentPlan("free");
    }
  }, [user?.publicMetadata]);

  const toggleFeatureSection = (sectionTitle: string) => {
    setExpandedFeatures(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));

    trackEvent('ToggleFeatureSection', {
      section: sectionTitle,
      expanded: !expandedFeatures[sectionTitle]
    });
  };

  async function handleCheckout(planIdentifier: "pro" | "ultra") {
    if (!user?.id) return toast.error("Você precisa estar logado.");

    const loadingId = `${planIdentifier}-${billingCycle}`;
    setLoading(loadingId);

    const planName = planIdentifier.toUpperCase();
    const cycleName = billingCycle === 'yearly' ? 'Anual' : 'Mensal';

    const loadingToast = toast.loading(
      `🚀 Preparando checkout seguro do ${planName} ${cycleName}...`,
      { description: "Redirecionando para pagamento Stripe" }
    );

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planIdentifier,
          cycle: billingCycle
        }),
      });

      const data = await res.json();

      if (data.url) {
        toast.dismiss(loadingToast);
        toast.success("✅ Redirecionando para pagamento seguro...", {
          description: "Você será levado para o checkout em instantes"
        });

        trackEvent('CheckoutInitiated', {
          plan: planIdentifier,
          cycle: billingCycle,
          price: billingCycle === 'yearly'
            ? plans.find(p => p.id === planIdentifier)?.yearlyPrice
            : plans.find(p => p.id === planIdentifier)?.monthlyPrice
        });

        setTimeout(() => {
          window.location.href = data.url;
        }, 800);
      } else {
        throw new Error(data.error || "URL de checkout não recebida.");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      if (err instanceof Error) {
        toast.error("Erro ao processar", {
          description: err.message
        });
      } else {
        toast.error("Erro ao iniciar checkout", {
          description: "Tente novamente ou entre em contato."
        });
      }

      trackEvent('CheckoutError', {
        plan: planIdentifier,
        cycle: billingCycle,
        error: err instanceof Error ? err.message : 'Unknown'
      });
    } finally {
      setLoading(null);
    }
  }

  async function handleCancel() {
    setLoading("cancel");

    const loadingToast = toast.loading("Processando cancelamento...", {
      description: "Aguarde alguns segundos"
    });

    try {
      const res = await fetch("/api/stripe/cancel", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro do servidor ao cancelar.");
      }

      toast.dismiss(loadingToast);
      toast.success("Assinatura cancelada", {
        description: "Seu acesso continua até o fim do período pago. Você pode reativar a qualquer momento."
      });

      await user?.reload();
      setCurrentPlan("free");

      trackEvent('SubscriptionCanceled', {
        previous_plan: currentPlan
      });
    } catch (err) {
      toast.dismiss(loadingToast);
      if (err instanceof Error) {
        toast.error("Erro ao cancelar", {
          description: err.message
        });
      } else {
        toast.error("Não foi possível cancelar", {
          description: "Entre em contato com o suporte."
        });
      }
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
    } catch (error) {
      console.error("Erro ao enviar feedback", error);
    }

    setIsSendingFeedback(false);
    setShowCancelModal(false);
    handleCancel();
  }

  async function handleManageSubscription() {
    setLoading("portal");

    const loadingToast = toast.loading("Abrindo portal de gerenciamento...");

    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();

      if (data.url) {
        toast.dismiss(loadingToast);
        toast.success("Redirecionando...");

        trackEvent('PortalOpened', {
          current_plan: currentPlan
        });

        setTimeout(() => {
          window.location.href = data.url;
        }, 500);
      } else {
        throw new Error(data.error || "URL do portal não recebida.");
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      if (err instanceof Error) toast.error(err.message);
      else toast.error("Erro ao acessar o portal. Tente novamente.");
      setLoading(null);
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-hidden">

      {/* Floating Particles Background */}
      <FloatingParticles />

      {/* Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-gradient-to-br from-green-400/20 to-teal-400/20 rounded-full blur-3xl" />
      </div>

      {/* ============================================ */}
      {/* CANCEL MODAL */}
      {/* ============================================ */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCancelModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              {/* Header gradient */}
              <div className="h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />

              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 2,  }}
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center"
                  >
                    <Heart className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Antes de você ir...
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Sentiremos sua falta! 💔
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
                  Poxa, sentimos muito que você queira cancelar. Para que possamos evoluir o Freelinnk, poderia nos dizer o motivo?
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      O que te motivou a cancelar?
                    </label>
                    <select
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    >
                      <option value="">Selecione um motivo...</option>
                      <option value="Muito caro">Achei o valor alto</option>
                      <option value="Não usei o suficiente">Não usei o suficiente</option>
                      <option value="Faltou recurso">Falta algum recurso específico</option>
                      <option value="Dificuldade">Achei difícil de usar</option>
                      <option value="Outro">Outro motivo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Como podemos melhorar? (Opcional)
                    </label>
                    <Textarea
                      placeholder="Sua opinião é muito importante para nós..."
                      className="resize-none rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      value={cancelFeedback}
                      onChange={(e) => setCancelFeedback(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <Button
                    variant="outline"
                    className="flex-1 py-6 rounded-xl font-semibold"
                    onClick={() => setShowCancelModal(false)}
                  >
                    Voltar
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 py-6 rounded-xl font-semibold"
                    onClick={handleConfirmCancel}
                    disabled={isSendingFeedback || !cancelReason}
                  >
                    {isSendingFeedback ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Confirmar"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================ */}
      <div className="relative max-w-7xl mx-auto px-4 py-8 sm:py-12 pb-32 lg:pb-16">

        {/* ============================================ */}
        {/* URGENCY BANNER */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
            {/* Animated gradient background */}
            <motion.div
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 5,  ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-500 via-red-600 to-orange-500 bg-[length:200%_100%]"
            />

            {/* Content */}
            <div className="relative p-4 sm:p-6 text-white">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4 text-center sm:text-left">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1.5,  }}
                    className="hidden sm:block"
                  >
                    <Flame className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-lg" />
                  </motion.div>
                  <div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                      <span className="text-xs sm:text-sm font-semibold opacity-90">
                        🔥 OFERTA ESPECIAL - ÚLTIMAS VAGAS
                      </span>
                      <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-[10px] sm:text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        {liveViewers} online
                      </Badge>
                    </div>
                    <p className="text-lg sm:text-2xl md:text-3xl font-black">
                      Até 51% OFF + Bônus Exclusivos
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center bg-black/20 backdrop-blur-sm rounded-xl px-4 py-2">
                  <p className="text-[10px] sm:text-xs font-medium opacity-80 mb-1">Oferta expira em:</p>
                  <CountdownTimer />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ============================================ */}
        {/* HERO SECTION */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-10 sm:mb-16"
        >
          {/* Social Proof Badge */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block mb-6"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2,  }}
            >
              <Badge className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 font-semibold text-xs sm:text-sm shadow-xl shadow-green-500/25">
                <TrendingUp className="w-4 h-4 mr-2" />
                +<AnimatedCounter value={5427} /> criadores já assinaram este mês
              </Badge>
            </motion.div>
          </motion.div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6 px-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white">
              Crie conteúdo viral com IA
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              e multiplique seu engajamento
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6 px-4 leading-relaxed">
            A plataforma <span className="font-bold text-gray-900 dark:text-white">completa</span> para criadores de conteúdo.
            Links, analytics, IA para ideias virais e muito mais em um só lugar.
          </p>

          {/* Urgency text */}
          <motion.p
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, }}
            className="text-sm font-bold text-red-600 dark:text-red-400"
          >
            ⚠️ Preço especial por tempo limitado. Pode subir a qualquer momento.
          </motion.p>
        </motion.div>

        {/* ============================================ */}
        {/* SCARCITY ALERT */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <div className="relative overflow-hidden bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-400/50 dark:border-yellow-600/50 rounded-2xl p-4">
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3,  ease: "linear" }}
              className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-yellow-200/50 to-transparent"
            />
            <div className="relative flex items-center justify-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1,  }}
              >
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
              </motion.div>
              <p className="text-sm sm:text-base font-semibold text-yellow-800 dark:text-yellow-300 text-center">
                ⚡ Apenas <span className="font-black">{plans[1].spotsLeft! + plans[2].spotsLeft!}</span> vagas restantes com desconto
              </p>
            </div>
          </div>
        </motion.div>

        {/* ============================================ */}
        {/* AI FEATURES SPOTLIGHT */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-10 sm:mb-16"
        >
          {/* FreelinnkBrain Card */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-700 text-white h-full">
              <CardContent className="p-5 sm:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, ease: "linear" }}
                    className="p-3 sm:p-4 bg-white/20 backdrop-blur-sm rounded-2xl"
                  >
                    <BrainCircuit className="w-6 h-6 sm:w-8 sm:h-8" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black mb-1">FreelinnkBrain</h3>
                    <Badge className="bg-white/20 text-white border-0 text-xs">
                      <Infinity className="w-3 h-3 mr-1" />
                      Ilimitado no Ultra
                    </Badge>
                  </div>
                </div>

                <p className="text-purple-100 text-sm sm:text-base mb-5 leading-relaxed">
                  Gere ideias virais e roteiros prontos para Reels/TikTok em segundos. Nunca mais fique sem conteúdo!
                </p>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-5">
                  {[
                    { icon: MessageSquare, text: "Roteiros prontos" },
                    { icon: Target, text: "Alto CTR" },
                    { icon: TrendingUp, text: "Viraliza rápido" },
                    { icon: Clock, text: "Em segundos" }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 sm:p-3 flex items-center gap-2"
                    >
                      <item.icon className="w-4 h-4 text-yellow-300" />
                      <span className="text-xs sm:text-sm font-medium">{item.text}</span>
                    </motion.div>
                  ))}
                </div>

                <Badge className="bg-red-500/90 text-white border-0 text-xs font-semibold">
                  <Clock className="w-3 h-3 mr-1" />
                  Economia de R$ 100/mês vs. ChatGPT Plus
                </Badge>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Studio Card */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white h-full">
              <CardContent className="p-5 sm:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2,  }}
                    className="p-3 sm:p-4 bg-white/20 backdrop-blur-sm rounded-2xl"
                  >
                    <Wand2 className="w-6 h-6 sm:w-8 sm:h-8" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black mb-1">Estúdio de Imagens IA</h3>
                    <Badge className="bg-white/20 text-white border-0 text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      7/dia + aprimoramentos ∞
                    </Badge>
                  </div>
                </div>

                <p className="text-blue-100 text-sm sm:text-base mb-5 leading-relaxed">
                  Gere imagens incríveis e aprimore suas fotos com IA avançada. Qualidade profissional instantânea.
                </p>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-5">
                  {[
                    { icon: Palette, text: "Gerar imagens" },
                    { icon: Sparkles, text: "Aprimorar fotos" },
                    { icon: Layers, text: "Multi-estilos" },
                    { icon: Zap, text: "Instantâneo" }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 sm:p-3 flex items-center gap-2"
                    >
                      <item.icon className="w-4 h-4 text-yellow-300" />
                      <span className="text-xs sm:text-sm font-medium">{item.text}</span>
                    </motion.div>
                  ))}
                </div>

                <Badge className="bg-red-500/90 text-white border-0 text-xs font-semibold">
                  <Clock className="w-3 h-3 mr-1" />
                  Economia de R$ 150/mês vs. Midjourney + Canva
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* ============================================ */}
        {/* BILLING CYCLE TOGGLE */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center gap-4 mb-10 sm:mb-12"
        >
          <div className="flex items-center gap-4 bg-white dark:bg-slate-800/80 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-200 dark:border-gray-700 shadow-lg">
            <span className={clsx(
              "font-semibold transition-all",
              billingCycle === 'monthly'
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-400 dark:text-gray-500'
            )}>
              Mensal
            </span>

            <Switch
              checked={billingCycle === 'yearly'}
              onCheckedChange={handleBillingCycleChange}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500"
            />

            <span className={clsx(
              "font-semibold transition-all",
              billingCycle === 'yearly'
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-400 dark:text-gray-500'
            )}>
              Anual
            </span>
          </div>

          <motion.div
            animate={{ scale: [1, 1.05, 1], y: [0, -3, 0] }}
            transition={{ duration: 2, }}
          >
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 font-bold px-4 py-1.5 shadow-lg shadow-green-500/25">
              <Gift className="w-4 h-4 mr-2" />
              Ganhe 2 meses grátis no plano anual!
            </Badge>
          </motion.div>
        </motion.div>

        {/* ============================================ */}
        {/* PRICING CARDS */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start mb-16 sm:mb-24">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentPlan={currentPlan}
              billingCycle={billingCycle}
              loading={loading}
              onCheckout={handleCheckout}
              onCancel={() => setShowCancelModal(true)}
              toggleFeatureSection={toggleFeatureSection}
              expandedFeatures={expandedFeatures}
            />
          ))}
        </div>

        {/* ============================================ */}
        {/* COMPARISON TABLE */}
        {/* ============================================ */}
        <section className="mb-16 sm:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white mb-4">
              <Layers className="w-3 h-3 mr-1" />
              Comparativo completo
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
              Compare Todos os Recursos
            </h2>
          </motion.div>
          <ComparisonTable />
        </section>

        {/* ============================================ */}
        {/* ROI SECTION */}
        {/* ============================================ */}
        <section className="mb-16 sm:mb-24">
          <ROISection />
        </section>

        {/* ============================================ */}
        {/* TESTIMONIALS */}
        {/* ============================================ */}
        <section className="mb-16 sm:mb-24">
          <TestimonialsSection />
        </section>

        {/* ============================================ */}
        {/* SAVINGS COMPARISON */}
        {/* ============================================ */}
        <section className="mb-16 sm:mb-24">
          <SavingsComparison />
        </section>

        {/* ============================================ */}
        {/* TRUST BADGES */}
        {/* ============================================ */}
        <section className="mb-16 sm:mb-24">
          <TrustBadges />
        </section>

        {/* ============================================ */}
        {/* GUARANTEE */}
        {/* ============================================ */}
        <section className="mb-16 sm:mb-24">
          <GuaranteeSection />
        </section>

        {/* ============================================ */}
        {/* MANAGE SUBSCRIPTION (for paid users) */}
        {/* ============================================ */}
        {currentPlan !== "free" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Precisa atualizar seu cartão ou ver seu histórico de faturas?
            </p>
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={loading === "portal"}
              className="border-gray-300 dark:border-gray-600 px-6 py-5"
            >
              {loading === "portal" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              Gerenciar Assinatura
            </Button>
          </motion.div>
        )}

        {/* ============================================ */}
        {/* FAQ */}
        {/* ============================================ */}
        <section className="mb-16">
          <FAQ />
        </section>

        {/* ============================================ */}
        {/* FINAL CTA */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center py-12 sm:py-16"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3,  }}
            className="inline-block mb-6"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
              <Rocket className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
            Pronto para Transformar seu Conteúdo?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-xl mx-auto">
            Junte-se a milhares de criadores que já estão crescendo com Freelinnk.
            Comece agora e veja resultados em dias.
          </p>

          {currentPlan === 'free' && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => {
                  trackEvent('FinalCtaClicked', { plan: 'pro' });
                  handleCheckout('pro');
                }}
                disabled={loading !== null}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-6 text-lg rounded-xl shadow-2xl shadow-blue-500/30"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Rocket className="w-5 h-5 mr-2" />
                )}
                Começar Agora por R$ 34,90/mês
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ============================================ */}
      {/* STICKY MOBILE CTA */}
      {/* ============================================ */}
      <StickyMobileCTA
        currentPlan={currentPlan}
        loading={loading}
        onCheckout={handleCheckout}
      />
    </div>
  );
}