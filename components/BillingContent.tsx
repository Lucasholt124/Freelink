"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Loader2, Rocket, Star, CheckCircle, HelpCircle, ArrowRight, XCircle,
  BrainCircuit, Wand2, Sparkles, Zap,  ChevronRight,
   Shield, CreditCard, Target,  MessageSquare,
  Palette
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
  priceDetails: string;
  features: FeatureSection[];
  icon: React.ReactNode;
  color: string;
  gradient: string;
  recommended?: boolean;
  popularFeatures?: string[];
}

// Definição atualizada dos planos com seções de recursos organizadas
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
          { text: "Geração básica de imagens (3 por mês)", icon: <XCircle className="w-4 h-4 text-gray-300" />, proOnly: true },
          { text: "Geração ilimitada de imagens com IA", icon: <XCircle className="w-4 h-4 text-gray-300" />, proOnly: true },
          { text: "Acesso ao FreelinkBrain (gerador de ideias)", icon: <XCircle className="w-4 h-4 text-gray-300" />, proOnly: true },
          { text: "Calendário de conteúdo personalizado", icon: <XCircle className="w-4 h-4 text-gray-300" />, ultraOnly: true }
        ]
      },
      {
        title: "Marketing e Monetização",
        features: [
          { text: "Personalização básica", icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
          { text: "Ferramenta de sorteios", icon: <XCircle className="w-4 h-4 text-gray-300" />, ultraOnly: true },
          { text: "Rastreamento avançado (Pixel, GA4)", icon: <XCircle className="w-4 h-4 text-gray-300" />, ultraOnly: true },
          { text: "Remover marca Freelink", icon: <XCircle className="w-4 h-4 text-gray-300" />, proOnly: true }
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
    tagline: "Para criadores que querem impulsionar seu engajamento com o poder da IA.",
    monthlyPrice: "R$19,90",
    yearlyPrice: "R$199",
    priceDetails: "/mês",
    popularFeatures: [
      "Geração ilimitada de imagens",
      "FreelinkBrain para ideias virais",
      "Analytics avançados"
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
          { text: "Geração ilimitada de imagens profissionais", icon: <CheckCircle className="w-4 h-4 text-green-500" />, highlight: true },
          { text: "Formatos otimizados para todas as redes sociais", icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
          { text: "FreelinkBrain: Gerador de ideias virais", icon: <CheckCircle className="w-4 h-4 text-green-500" />, highlight: true },
          { text: "Roteiros prontos para Reels e Posts",  icon: <XCircle className="w-4 h-4 text-gray-300" />, ultraOnly: true },
          { text: "Plano estratégico de conteúdo completo", icon: <XCircle className="w-4 h-4 text-gray-300" />, ultraOnly: true }
        ]
      },
      {
        title: "Marketing e Monetização",
        features: [
          { text: "Personalização completa", icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
          { text: "Remover marca Freelink", icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
          { text: "Ferramenta de sorteios", icon: <XCircle className="w-4 h-4 text-gray-300" />, ultraOnly: true },
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
    tagline: "A plataforma completa para automatizar seu conteúdo e monetizar sua audiência.",
    monthlyPrice: "R$39,90",
    yearlyPrice: "R$399",
    priceDetails: "/mês",
    popularFeatures: [
      "Estúdio de imagens IA avançado",
      "Calendário de posts automático",
      "Ferramentas de monetização"
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
          { text: "Todas as ferramentas do plano Pro", icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
          { text: "Estúdio de imagens IA avançado", icon: <CheckCircle className="w-4 h-4 text-green-500" />, highlight: true },
          { text: "Calendário de conteúdo personalizado", icon: <CheckCircle className="w-4 h-4 text-green-500" />, highlight: true },
          { text: "Agendamento automático de posts", icon: <CheckCircle className="w-4 h-4 text-green-500" /> }
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

    if (success) {
      toast.success("Assinatura realizada com sucesso! 🎉");
      router.replace("/dashboard/billing");
    }

    if (canceled) {
      toast.info("O processo de assinatura foi cancelado.");
      router.replace("/dashboard/billing");
    }

    async function fetchPlan() {
      if (!user?.id) return;
      try {
        const res = await fetch("/api/subscription-plan");
        if (res.ok) {
          const data = await res.json();
          setCurrentPlan(data.plan || "free");
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchPlan();
  }, [user?.id, searchParams, router]);

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
        body: JSON.stringify({ plan: planIdentifier, cycle: billingCycle }),
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
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
        {/* Seção de cabeçalho com animação */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge
            className="mb-4 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 font-medium"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Impulsione seu crescimento com IA
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-4">
            Desbloqueie o poder das imagens para seu perfil
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
           Escolha o plano ideal para criar imagens profissionais e automatizar seu crescimento com inteligência artificial.
          </p>
        </motion.div>

        {/* Spotlight para as ferramentas de IA */}
       <motion.div
  className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.2 }}
>
  <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
    <CardContent className="p-6">
      <div className="flex items-center gap-4 mb-3">
        <div className="p-3 bg-white/20 rounded-full">
          <Wand2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Estúdio de Imagens IA</h3>
          <p className="text-blue-100">Crie imagens profissionais em segundos</p>
        </div>
      </div>

      <p className="mb-4 text-blue-100 text-sm">
        Gere imagens incríveis para suas redes sociais com IA avançada. Escolha estilos, formatos e proporções específicas para cada plataforma.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white/10 rounded-lg p-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span className="text-sm">Imagens profissionais</span>
        </div>
        <div className="bg-white/10 rounded-lg p-3 flex items-center gap-2">
          <Palette className="w-4 h-4 text-yellow-300" />
          <span className="text-sm">Múltiplos estilos</span>
        </div>
      </div>

      <div className="mt-1 text-xs text-blue-200 flex items-center">
        <Shield className="w-3.5 h-3.5 mr-1.5" />
        Incluído nos planos Pro e Ultra
      </div>
    </CardContent>
  </Card>

  <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white">
    <CardContent className="p-6">
      <div className="flex items-center gap-4 mb-3">
        <div className="p-3 bg-white/20 rounded-full">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold">FreelinkBrain</h3>
          <p className="text-purple-100">Ideias virais em segundos</p>
        </div>
      </div>

      <p className="mb-4 text-purple-100 text-sm">
        Gere títulos impactantes e roteiros prontos para Reels com nossa IA especializada em conteúdo viral.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white/10 rounded-lg p-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-yellow-300" />
          <span className="text-sm">Roteiros prontos</span>
        </div>
        <div className="bg-white/10 rounded-lg p-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-yellow-300" />
          <span className="text-sm">Títulos de alto CTR</span>
        </div>
      </div>

      <div className="mt-1 text-xs text-purple-200 flex items-center">
        <Shield className="w-3.5 h-3.5 mr-1.5" />
        Incluído nos planos Pro e Ultra
      </div>
    </CardContent>
  </Card>
</motion.div>

        {/* Toggle de ciclo de cobrança */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={clsx(
            "font-medium transition-colors",
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
            "font-medium transition-colors",
            billingCycle === 'yearly'
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400'
          )}>
            Anual
          </span>

          <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 text-green-800 dark:text-green-300 text-xs font-bold px-3 py-1.5 rounded-full flex items-center">
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            Economize 2 meses!
          </div>
        </div>

        {/* Cards de planos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
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

        {/* Portal de gerenciamento de assinatura */}
        {currentPlan !== "free" && (
          <div className="text-center mt-16">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
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

        {/* Garantia de satisfação */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="inline-block bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-2xl border border-blue-100 dark:border-blue-900/20 max-w-2xl">
            <div className="flex flex-col items-center">
              <Shield className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Garantia de 7 dias
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Teste qualquer plano premium por 7 dias. Se não estiver satisfeito,
                devolveremos 100% do seu dinheiro. Sem perguntas.
              </p>
            </div>
          </div>
        </motion.div>

        {/* FAQs */}
        <FAQ />
      </div>
    </div>
  );
}

// Componente de card de plano aprimorado
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

  const displayPriceDetails = billingCycle === 'yearly' && plan.yearlyPrice
    ? '/ano'
    : plan.priceDetails;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: plan.id === "pro" ? 0.1 : plan.id === "ultra" ? 0.2 : 0 }}
      className={clsx(
        "rounded-2xl border bg-white dark:bg-slate-800 p-6 flex flex-col h-full transition-all duration-300 relative",
        plan.recommended && "lg:scale-105 shadow-xl z-10",
        isCurrent
          ? `border-2 border-${plan.color}-500 dark:border-${plan.color}-400 shadow-lg`
          : "border-gray-200 dark:border-gray-700"
      )}
    >
      {/* Tag de recomendado */}
      {plan.recommended && (
        <div className="absolute top-0 inset-x-0 -translate-y-1/2 flex justify-center">
          <div className={`px-4 py-1 bg-gradient-to-r ${plan.gradient} text-white text-xs font-bold rounded-full flex items-center gap-1`}>
            <Star className="w-3.5 h-3.5" /> RECOMENDADO
          </div>
        </div>
      )}

      {/* Cabeçalho do plano */}
      <div className="mb-6">
        <div className={`flex items-center gap-3 mb-2 text-${plan.color}-600 dark:text-${plan.color}-400`}>
          <div className={`p-2 rounded-lg bg-${plan.color}-100 dark:bg-${plan.color}-900/30`}>
            {plan.icon}
          </div>
          <h2 className="text-2xl font-bold">{plan.name}</h2>

          {isCurrent && (
            <Badge className="ml-auto bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              Atual
            </Badge>
          )}
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 h-10">
          {plan.tagline}
        </p>

        <div className="mt-4">
          <p className="text-gray-900 dark:text-white text-4xl font-bold">
            {displayPrice}
            <span className="text-base font-normal text-gray-500 dark:text-gray-400 ml-1">
              {displayPriceDetails}
            </span>
          </p>
        </div>
      </div>

      {/* Recursos populares destacados */}
      {plan.popularFeatures && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Recursos mais populares:
          </h3>
          <ul className="space-y-2">
            {plan.popularFeatures.map((feature, i) => (
              <li key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lista de recursos detalhada */}
      <div className="flex-grow">
        {plan.features.map((section, sectionIndex) => {
          const isExpanded = expandedFeatures[section.title] !== false; // Por padrão expandido
          return (
            <div key={sectionIndex} className="mb-4 last:mb-0">
              <button
                className="flex items-center justify-between w-full text-left mb-2"
                onClick={() => toggleFeatureSection(section.title)}
              >
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {section.title}
                </h3>
                <ChevronRight
                  className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
              </button>

              {isExpanded && (
                <ul className="space-y-2 pl-1 text-sm">
                  {section.features.map((feature, index) => (
                    <li
                      key={index}
                      className={clsx(
                        "flex items-start gap-2",
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
      <div className="mt-8">
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
            <Button
              onClick={() => onCheckout(plan.id as "pro" | "ultra")}
              disabled={loading === loadingId}
              className={clsx(
                `w-full text-white bg-gradient-to-r ${plan.gradient} hover:brightness-105 transition-all group`
              )}
            >
              {loading === loadingId
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : <ArrowRight className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              }
              {currentPlan === 'free' && `Assinar ${plan.name}`}
              {currentPlan === 'pro' && plan.id === 'ultra' && 'Fazer Upgrade'}
              {currentPlan === 'ultra' && plan.id === 'pro' && 'Fazer Downgrade'}
            </Button>
          )
        )}
      </div>
    </motion.div>
  );
}

// Componente FAQ aprimorado
function FAQ() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
  q: "As imagens geradas pela IA realmente parecem profissionais?",
  a: "Sim! Nosso gerador de imagens utiliza os modelos de IA mais avançados disponíveis, otimizados especificamente para marketing digital e redes sociais. Milhares de criadores já estão utilizando nossas imagens de alta qualidade em seus perfis."
},
    {

      q: "Posso cancelar a qualquer momento?",
      a: "Sim! Você pode cancelar sua assinatura quando quiser no seu painel. Seu acesso aos recursos premium continuará até o final do seu ciclo de faturamento."
    },
    {
      q: "O pagamento é seguro?",
      a: "Com certeza. Usamos a Stripe, uma das maiores e mais seguras plataformas de pagamento do mundo. Seus dados de cartão nunca são armazenados em nossos servidores."
    },
    {
      q: "Como funciona o upgrade?",
      a: "Ao fazer upgrade, você paga apenas a diferença proporcional pelo tempo restante no seu ciclo atual. A mudança é imediata e você não perde nada."
    },
    {
      q: "Preciso fornecer cartão de crédito para o plano gratuito?",
      a: "Não! O plano gratuito é totalmente grátis e você pode usá-lo pelo tempo que quiser sem fornecer informações de pagamento."
    },
    {
      q: "As ferramentas de IA realmente funcionam?",
      a: "Sim! Nossas ferramentas de IA são treinadas com os melhores modelos disponíveis e otimizadas especificamente para marketing digital e Instagram. Milhares de criadores já transformaram seus perfis usando nossa tecnologia."
    },
  ];

  return (
    <div className="mt-24 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
        Perguntas Frequentes
      </h2>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={faq.q}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={clsx(
              "bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700 transition-all",
              expandedFaq === index ? "shadow-md" : ""
            )}
          >
            <button
              className="w-full flex justify-between items-center text-left"
              onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
            >
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <HelpCircle className={`w-5 h-5 ${expandedFaq === index ? 'text-blue-500' : 'text-gray-500'}`}/>
                {faq.q}
              </h3>
              <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedFaq === index ? 'rotate-90' : ''}`} />
            </button>

            {expandedFaq === index && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-gray-600 dark:text-gray-300 mt-3 pl-7"
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