"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Loader2, Rocket, Star, CheckCircle, HelpCircle, XCircle,
  BrainCircuit, Wand2, Sparkles, Zap, ChevronRight,
  Shield, CreditCard, Target, MessageSquare,
  Palette, Clock, TrendingUp, Users, Flame, AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

// Tipos e constante 'plans'
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

// Definição dos planos com novos preços e limites
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
      "🧠 FreelinnkBrain - 5 ideias virais/dia",
      "🎬 5 roteiros de vídeos virais/dia",
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
          { text: "FreelinnkBrain: 5 ideias virais por dia", icon: <CheckCircle className="w-4 h-4 text-green-500" />, highlight: true },
          { text: "5 roteiros de vídeos virais por dia", icon: <CheckCircle className="w-4 h-4 text-green-500" />, highlight: true },
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
          { text: "Ferramenta de sorteios", icon: <XCircle className="w-4 h-4 text-gray-300" />, proOnly: true },
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
      "🎨 7 imagens com IA por dia + aprimoramentos ",
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
          { text: "aprimoramentos de imagens por dia ilimitado", icon: <CheckCircle className="w-4 h-4 text-green-500" />, highlight: true },
          { text: "FreelinnkBrain ILIMITADO", icon: <CheckCircle className="w-4 h-4 text-green-500" />, highlight: true },
          { text: "Vídeos virais ILIMITADOS", icon: <CheckCircle className="w-4 h-4 text-green-500" />, highlight: true },
          { text: "Calendário de conteúdo personalizado", icon: <CheckCircle className="w-4 h-4 text-green-500" />, highlight: true },
          { text: "Agendamento automático de posts", icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
          { text: "AI-Studio completo", icon: <CheckCircle className="w-4 h-4 text-green-500" /> }
        ]
      },
      {
        title: "Marketing e Monetização",
        features: [
          { text: "Ferramenta de sorteios via comentários", icon: <CheckCircle className="w-4 h-4 text-green-500" />, highlight: true },
          { text: "Rastreamento avançado (Pixel, GA4)", icon: <CheckCircle className="w-4 h-4 text-green-500" />, highlight: true },
          { text: "API para integrações", icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
          { text: "Acesso antecipado a novos recursos", icon: <CheckCircle className="w-4 h-4 text-green-500" /> }
        ]
      }
    ],
    icon: <Rocket className="w-5 h-5" />,
    color: "purple",
    gradient: "from-purple-500 to-pink-600"
  }
];

// Timer Component
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
    <div className="flex items-center gap-1 text-sm font-mono">
      <div className="bg-red-600 text-white px-2 py-1 rounded">
        {String(timeLeft.hours).padStart(2, '0')}
      </div>
      <span className="text-red-600 font-bold">:</span>
      <div className="bg-red-600 text-white px-2 py-1 rounded">
        {String(timeLeft.minutes).padStart(2, '0')}
      </div>
      <span className="text-red-600 font-bold">:</span>
      <div className="bg-red-600 text-white px-2 py-1 rounded">
        {String(timeLeft.seconds).padStart(2, '0')}
      </div>
    </div>
  );
}

// Componente principal de billing
export default function BillingContent() {
  const { user } = useUser();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanIdentifier>("free");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [expandedFeatures, setExpandedFeatures] = useState<Record<string, boolean>>({});
  const searchParams = useSearchParams();
  const router = useRouter();


  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

     async function handlePurchaseResult() {
      if (success) {
        toast.success("Assinatura realizada com sucesso! 🎉");
        await user?.reload();
      }
      if (canceled) {
        toast.info("O processo de assinatura foi cancelado.");
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
  };

  async function handleCheckout(planIdentifier: "pro" | "ultra") {
    if (!user?.id) return toast.error("Você precisa estar logado.");

    const loadingId = `${planIdentifier}-${billingCycle}`;
    setLoading(loadingId);

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
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "URL de checkout não recebida.");
      }
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("Erro ao iniciar o checkout. Tente novamente.");
    } finally {
      setLoading(null);
    }
  }

  async function handleCancel() {
    if (!confirm("Tem certeza que deseja cancelar sua assinatura? Você manterá o acesso aos recursos premium até o final do seu ciclo de faturamento atual.")) return;

    setLoading("cancel");

    try {
      const res = await fetch("/api/stripe/cancel", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro do servidor ao cancelar.");
      }

      toast.success("Sua assinatura foi agendada para cancelamento. Você pode reativá-la a qualquer momento no portal do cliente.");
      await user?.reload();
      setCurrentPlan("free");
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("Não foi possível cancelar a assinatura. Tente novamente.");
    } finally {
      setLoading(null);
    }
  }

  async function handleManageSubscription() {
    setLoading("portal");

    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "URL do portal não recebida.");
      }
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("Erro ao acessar o portal de assinaturas. Tente novamente.");
      setLoading(null);
    }
  }

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-16">

        {/* Banner de Urgência - Mobile First */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-4 sm:p-6 text-white shadow-2xl"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="animate-pulse">
                <Flame className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium opacity-90">
                  🔥 OFERTA ESPECIAL - ÚLTIMAS VAGAS
                </p>
                <p className="text-lg sm:text-2xl font-bold">
                  Até 51% de desconto + Bônus Exclusivos
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-xs mb-1">Termina em:</p>
              <CountdownTimer />
            </div>
          </div>
        </motion.div>

        {/* Seção de cabeçalho com animação */}
        <motion.div
          className="text-center mb-8 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-4"
          >
            <Badge
              className="px-4 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 font-medium text-xs sm:text-sm"
            >
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              +5.427 criadores já assinaram este mês
            </Badge>
          </motion.div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-4 px-2">
            Crie conteúdo viral com IA e multiplique seu engajamento
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
            <span className="font-bold text-red-600 dark:text-red-400">⚠️ Preço especial por tempo limitado.</span>
            {" "}Escolha o plano ideal e economize centenas de reais por ano.
          </p>
        </motion.div>

        {/* Alert de Vagas Limitadas - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 mx-2 sm:mx-0"
        >
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                ⚡ Apenas <span className="font-bold">{plans[1].spotsLeft! + plans[2].spotsLeft!}</span> vagas restantes com desconto.
                {" "}Pessoas visualizando agora: <span className="font-bold">{Math.floor(Math.random() * 50) + 100}</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Spotlight para as ferramentas de IA - Mobile Optimized */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-16 px-2 sm:px-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4 mb-3">
                <div className="p-2 sm:p-3 bg-white/20 rounded-full">
                  <Wand2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">Estúdio de Imagens IA</h3>
                  <p className="text-blue-100 text-xs sm:text-sm">5 gerações + 5 aprimoramentos/dia</p>
                </div>
              </div>

              <p className="mb-3 sm:mb-4 text-blue-100 text-xs sm:text-sm">
                Gere imagens incríveis e aprimore suas fotos com IA avançada. Qualidade profissional em segundos.
              </p>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
                <div className="bg-white/10 rounded-lg p-2 sm:p-3 flex items-center gap-2">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
                  <span className="text-xs sm:text-sm">Profissional</span>
                </div>
                <div className="bg-white/10 rounded-lg p-2 sm:p-3 flex items-center gap-2">
                  <Palette className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
                  <span className="text-xs sm:text-sm">Aprimoramento IA</span>
                </div>
              </div>

              <Badge className="bg-red-600 text-white border-0 text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Economia de R$ 100/mês vs. Midjourney
              </Badge>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4 mb-3">
                <div className="p-2 sm:p-3 bg-white/20 rounded-full">
                  <BrainCircuit className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">FreelinnkBrain</h3>
                  <p className="text-purple-100 text-xs sm:text-sm">Ideias virais ilimitadas</p>
                </div>
              </div>

              <p className="mb-3 sm:mb-4 text-purple-100 text-xs sm:text-sm">
                Gere títulos impactantes e roteiros prontos para Reels e vídeos virais em segundos.
              </p>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
                <div className="bg-white/10 rounded-lg p-2 sm:p-3 flex items-center gap-2">
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
                  <span className="text-xs sm:text-sm">Roteiros prontos</span>
                </div>
                <div className="bg-white/10 rounded-lg p-2 sm:p-3 flex items-center gap-2">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
                  <span className="text-xs sm:text-sm">Alto CTR</span>
                </div>
              </div>

              <Badge className="bg-red-600 text-white border-0 text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Economia de R$ 100/mês vs. ChatGPT Plus
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        {/* Toggle de ciclo de cobrança - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 sm:mb-12">
          <div className="flex items-center gap-4">
            <span className={clsx(
              "font-medium transition-colors text-sm sm:text-base",
              billingCycle === 'monthly'
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400'
            )}>
              Mensal
            </span>

            <Switch
              checked={billingCycle === 'yearly'}
              onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
              id="billing-cycle"
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500"
            />

            <span className={clsx(
              "font-medium transition-colors text-sm sm:text-base",
              billingCycle === 'yearly'
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-gray-400'
            )}>
              Anual
            </span>
          </div>

          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 text-green-800 dark:text-green-300 text-xs font-bold px-3 py-1.5 rounded-full flex items-center"
          >
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            Economize 2 meses pagando anual!
          </motion.div>
        </div>

        {/* Cards de planos - Mobile Optimized */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start px-2 sm:px-0">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentPlan={currentPlan}
              billingCycle={billingCycle}
              loading={loading}
              onCheckout={handleCheckout}
              onCancel={handleCancel}
              toggleFeatureSection={toggleFeatureSection}
              expandedFeatures={expandedFeatures}
            />
          ))}
        </div>

        {/* Depoimentos com fotos - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 sm:mt-16 px-2 sm:px-0"
        >
          <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8 text-gray-900 dark:text-white">
            Junte-se a +10.000 criadores que já transformaram seus perfis
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: "Maria Silva",
                role: "De 3K para 47K seguidores",
                text: "5 imagens por dia é perfeito! Não desperdiço nada e economizo muito.",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
                verified: true
              },
              {
                name: "João Pedro",
                role: "R$ 15K/mês com afiliados",
                text: "O FreelinnkBrain ilimitado mudou meu jogo. Nunca mais fico sem ideias!",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
                verified: true
              },
              {
                name: "Ana Costa",
                role: "100K views em 7 dias",
                text: "O aprimoramento de imagens deixa tudo profissional. Vale cada centavo!",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
                verified: true
              }
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-12 h-12 rounded-full border-2 border-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{t.name}</p>
                      {t.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                    </div>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 italic">{t.text}</p>
                <div className="flex gap-1 mt-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Comparação de Economia - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 sm:mt-16 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 sm:p-8 rounded-2xl mx-2 sm:mx-0"
        >
          <Badge className="bg-red-600 text-white border-0 mb-4">
            💰 Economia de até R$ 1.561/ano
          </Badge>

          <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            Por que pagar mais por ferramentas separadas?
          </h3>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h4 className="font-semibold mb-4 text-red-600 dark:text-red-400 text-sm sm:text-base">
                ❌ Ferramentas separadas:
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Canva Pro</span>
                  <span className="font-mono line-through text-gray-500">R$ 34,00</span>
                </li>
                <li className="flex justify-between">
                  <span>ChatGPT Plus</span>
                  <span className="font-mono line-through text-gray-500">R$ 100,00</span>
                </li>
                <li className="flex justify-between">
                  <span>Midjourney</span>
                  <span className="font-mono line-through text-gray-500">R$ 50,00</span>
                </li>
                <li className="flex justify-between">
                  <span>Linktree Pro</span>
                  <span className="font-mono line-through text-gray-500">R$ 24,00</span>
                </li>
                <li className="flex justify-between border-t pt-2 font-bold">
                  <span>Total Mensal</span>
                  <span className="font-mono text-red-600 dark:text-red-400 text-base sm:text-lg">R$ 208,00</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-green-600 dark:text-green-400 text-sm sm:text-base">
                ✅ Tudo no Freelinnk Ultra:
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Tudo incluído + bônus</span>
                  <span className="font-mono text-green-600 font-bold">R$ 77,90</span>
                </li>
                <li className="flex justify-between mt-6 sm:mt-8 pt-6 sm:pt-8 border-t">
                  <span className="font-bold">Economia Mensal</span>
                  <span className="font-mono text-green-600 dark:text-green-400 font-bold">R$ 130,10</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-bold">Economia Anual</span>
                  <span className="font-mono text-green-600 dark:text-green-400 font-bold text-lg sm:text-xl">R$ 1.561,20</span>
                </li>
              </ul>

              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mt-4 bg-green-600 text-white p-3 rounded-lg text-center"
              >
                <p className="text-xs sm:text-sm font-bold">
                  🎁 BÔNUS: Suporte VIP no WhatsApp
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Portal de gerenciamento de assinatura */}
        {currentPlan !== "free" && (
          <div className="text-center mt-12 sm:mt-16">
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm sm:text-base">
              Precisa atualizar seu cartão ou ver seu histórico de faturas?
            </p>

            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={loading === "portal"}
              className="border-gray-300 dark:border-gray-600"
            >
              {loading === "portal" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
              Gerenciar Minha Assinatura
            </Button>
          </div>
        )}

        {/* Garantia de satisfação - Mobile Optimized */}
        <motion.div
          className="mt-16 sm:mt-20 text-center px-2 sm:px-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="inline-block bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 sm:p-8 rounded-2xl border border-blue-100 dark:border-blue-900/20 max-w-2xl">
            <div className="flex flex-col items-center">
              <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                Garantia de 7 dias ou seu dinheiro de volta
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Teste qualquer plano premium por 7 dias. Se não estiver 100% satisfeito,
                devolveremos todo seu dinheiro. Sem perguntas, sem burocracia.
              </p>
              <Badge className="mt-4 bg-blue-600 text-white">
                <CheckCircle className="w-4 h-4 mr-2" />
                Garantia incondicional
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* FAQs */}
        <FAQ />
      </div>
    </div>
  );
}

// Componente de card de plano
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

  const displayPrice = billingCycle === 'yearly' && plan.yearlyPrice
    ? plan.yearlyPrice
    : plan.monthlyPrice;

  const displayOriginalPrice = billingCycle === 'yearly'
    ? plan.yearlyOriginalPrice
    : plan.originalPrice;

  const displayPriceDetails = billingCycle === 'yearly' && plan.yearlyPrice
    ? '/ano'
    : plan.priceDetails;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: plan.id === "pro" ? 0.1 : plan.id === "ultra" ? 0.2 : 0 }}
      whileHover={{ y: -5 }}
      className={clsx(
        "rounded-2xl border bg-white dark:bg-slate-800 p-4 sm:p-6 flex flex-col h-full transition-all duration-300 relative",
        plan.recommended && "lg:scale-105 shadow-2xl z-10 border-2 border-blue-500",
        isCurrent && !plan.recommended
          ? `border-2 border-${plan.color}-500 dark:border-${plan.color}-400 shadow-lg`
          : !plan.recommended && "border-gray-200 dark:border-gray-700"
      )}
    >
      {/* Tag de recomendado ou desconto */}
      {plan.recommended && (
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-0 inset-x-0 -translate-y-1/2 flex justify-center"
        >
          <div className={`px-4 py-1 bg-gradient-to-r ${plan.gradient} text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg`}>
            <Flame className="w-3.5 h-3.5 animate-pulse" /> MAIS POPULAR - {plan.discount} OFF
          </div>
        </motion.div>
      )}

      {plan.discount && !plan.recommended && (
        <div className="absolute top-4 right-4">
          <Badge className="bg-red-600 text-white border-0 px-2 py-1">
            -{plan.discount}
          </Badge>
        </div>
      )}

      {/* Spots left indicator */}
      {plan.spotsLeft && (
        <div className="mb-3 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 p-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2">
          <Users className="w-3.5 h-3.5" />
          Apenas {plan.spotsLeft} vagas com desconto
        </div>
      )}

      {/* Cabeçalho do plano */}
      <div className="mb-4 sm:mb-6">
        <div className={`flex items-center gap-2 sm:gap-3 mb-2 text-${plan.color}-600 dark:text-${plan.color}-400`}>
          <div className={`p-1.5 sm:p-2 rounded-lg bg-${plan.color}-100 dark:bg-${plan.color}-900/30`}>
            {plan.icon}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">{plan.name}</h2>

          {isCurrent && (
            <Badge className="ml-auto bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs">
              Atual
            </Badge>
          )}
        </div>

        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 min-h-[2.5rem] sm:h-10">
          {plan.tagline}
        </p>

        <div className="mt-4">
          {displayOriginalPrice && (
            <p className="text-gray-400 line-through text-sm sm:text-base">
              De {displayOriginalPrice}
            </p>
          )}
          <div className="flex items-baseline gap-1">
            <p className="text-gray-900 dark:text-white text-2xl sm:text-4xl font-bold">
              {displayPrice}
            </p>
            <span className="text-sm sm:text-base font-normal text-gray-500 dark:text-gray-400">
              {displayPriceDetails}
            </span>
          </div>
          {plan.discount && (
            <motion.p
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-xs text-green-600 dark:text-green-400 font-medium mt-1"
            >
              Você economiza {billingCycle === 'yearly'
                ? `R$ ${(parseInt(plan.yearlyOriginalPrice!.replace(/\D/g,'')) - parseInt(plan.yearlyPrice!.replace(/\D/g,'')))} por ano`
                : `R$ ${(parseFloat(plan.originalPrice!.replace('R$', '').replace(',', '.').trim()) - parseFloat(plan.monthlyPrice.replace('R$', '').replace(',', '.').trim())).toFixed(2).replace('.', ',')} por mês`
              }
            </motion.p>
          )}
        </div>
      </div>

      {/* Recursos populares destacados */}
      {plan.popularFeatures && (
        <div className="mb-4 sm:mb-6">
          <h3 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
            Recursos mais pedidos:
          </h3>
          <ul className="space-y-1.5 sm:space-y-2">
            {plan.popularFeatures.map((feature, i) => (
              <li key={i} className="flex items-start text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lista de recursos detalhada */}
      <div className="flex-grow">
        {plan.features.map((section, sectionIndex) => {
          const isExpanded = expandedFeatures[section.title] !== false;
          return (
            <div key={sectionIndex} className="mb-3 sm:mb-4 last:mb-0">
              <button
                className="flex items-center justify-between w-full text-left mb-2"
                onClick={() => toggleFeatureSection(section.title)}
              >
                <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {section.title}
                </h3>
                <ChevronRight
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
              </button>

              {isExpanded && (
                <ul className="space-y-1.5 sm:space-y-2 pl-1 text-xs sm:text-sm">
                  {section.features.map((feature, index) => (
                    <li
                      key={index}
                      className={clsx(
                        "flex items-start gap-1.5 sm:gap-2",
                        (feature.proOnly && plan.id === "free") || (feature.ultraOnly && plan.id !== "ultra")
                          ? "opacity-60"
                          : "",
                        feature.highlight ? "font-medium" : ""
                      )}
                    >
                      {feature.icon}
                      <span
                        className={clsx(
                          "text-gray-700 dark:text-gray-300",
                          feature.highlight
                            ? "text-blue-700 dark:text-blue-300 font-medium"
                            : "text-gray-600 dark:text-gray-400"
                        )}
                      >
                        {feature.text}
                        {feature.comingSoon && (
                          <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">
                            Em breve
                          </span>
                        )}
                        {feature.proOnly && plan.id === "free" && (
                          <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                            Pro
                          </span>
                        )}
                        {feature.ultraOnly && plan.id !== "ultra" && (
                          <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded">
                            Ultra
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Botão de ação */}
      <div className="mt-6 sm:mt-8">
        {isCurrent ? (
          isFree ? (
            <Button
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
              disabled
            >
              Seu Plano Atual
            </Button>
          ) : (
            <Button
              variant="destructive"
              className="w-full"
              onClick={onCancel}
              disabled={loading === 'cancel'}
            >
              {loading === 'cancel'
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : <XCircle className="mr-2 h-4 w-4" />
              }
              Cancelar Assinatura
            </Button>
          )
        ) : (
          !isFree && onCheckout && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={() => onCheckout(plan.id as "pro" | "ultra")}
                disabled={loading === loadingId}
                className={clsx(
                  `w-full text-white bg-gradient-to-r ${plan.gradient} hover:brightness-110 transition-all group font-bold shadow-lg text-sm sm:text-base py-5 sm:py-6`
                )}
              >
                {loading === loadingId ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Rocket className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    {currentPlan === 'free' && plan.id === 'pro' && 'QUERO COMEÇAR AGORA'}
                    {currentPlan === 'free' && plan.id === 'ultra' && 'QUERO ACESSO COMPLETO'}
                    {currentPlan === 'pro' && plan.id === 'ultra' && 'FAZER UPGRADE AGORA'}
                    {currentPlan === 'ultra' && plan.id === 'pro' && 'Fazer Downgrade'}
                  </>
                )}
              </Button>

              {/* Urgency text */}
              {plan.spotsLeft && (
                <motion.p
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-xs text-center mt-2 text-orange-600 dark:text-orange-400 font-medium"
                >
                  ⚡ Apenas {plan.spotsLeft} vagas restantes com desconto
                </motion.p>
              )}
            </motion.div>
          )
        )}

        {/* Segurança */}
        {!isFree && !isCurrent && (
          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Pagamento seguro
            </span>
            <span className="flex items-center gap-1">
              <CreditCard className="w-3 h-3" />
              Cancele quando quiser
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Componente FAQ
function FAQ() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Quantas imagens posso gerar por dia no plano Ultra?",
      a: "No plano Ultra você pode gerar 5 imagens novas por dia + 5 aprimoramentos de imagens existentes. Os limites resetam diariamente às 00:00. Isso é suficiente para manter suas redes sempre atualizadas sem desperdício."
    },
    {
      q: "O FreelinnkBrain tem limite no plano Ultra?",
      a: "Não! No plano Ultra o FreelinnkBrain é completamente ILIMITADO. Você pode gerar quantas ideias virais e roteiros de vídeos quiser, sem restrições. No Pro você tem 5 gerações por dia."
    },
    {
      q: "Por quanto tempo o desconto vai durar?",
      a: "Esta é uma oferta especial limitada. Os preços podem voltar ao normal (R$ 69,90 Pro e R$ 157,90 Ultra) a qualquer momento. Garantimos o preço promocional apenas para quem assinar agora."
    },
    {
      q: "Posso cancelar a qualquer momento?",
      a: "Sim! Você pode cancelar quando quiser direto no painel, sem falar com ninguém. Seu acesso continua até o final do período pago."
    },
    {
      q: "E se eu não gostar?",
      a: "Oferecemos garantia incondicional de 7 dias. Se não ficar 100% satisfeito, devolvemos todo seu dinheiro sem perguntas."
    },
    {
      q: "5 imagens por dia é suficiente?",
      a: "Para a maioria dos criadores, sim! São 150 imagens por mês. A maioria usa 2-3 por dia. Se precisar de mais, você sempre pode usar o aprimoramento para melhorar fotos existentes."
    },
  ];

  return (
    <div className="mt-16 sm:mt-24 max-w-3xl mx-auto px-4">
      <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 dark:text-white mb-6 sm:mb-8">
        Perguntas Frequentes
      </h2>

      <div className="space-y-3 sm:space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={faq.q}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={clsx(
              "bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-xl border border-gray-200/80 dark:border-gray-700 transition-all",
              expandedFaq === index ? "shadow-md" : ""
            )}
          >
            <button
              className="w-full flex justify-between items-center text-left"
              onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
            >
              <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200 flex items-center gap-2 pr-2">
                <HelpCircle className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${expandedFaq === index ? 'text-blue-500' : 'text-gray-500'}`}/>
                {faq.q}
              </h3>
              <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform flex-shrink-0 ${expandedFaq === index ? 'rotate-90' : ''}`} />
            </button>

            {expandedFaq === index && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-3 pl-6 sm:pl-7"
              >
                {faq.a}
              </motion.p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}