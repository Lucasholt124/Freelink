
"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, Rocket, Star, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";

// Tipos claros para o nosso sistema de planos
type PlanIdentifier = "free" | "pro" | "ultra";
interface Plan {
  name: string;
  price: string;
  priceDetails: string;
  features: string[];
  icon?: React.ReactNode;
  color?: string;
  recommended?: boolean;
}

// Objeto de configuração dos planos - A ÚNICA FONTE DA VERDADE
const plans: Record<PlanIdentifier, Plan> = {
  free: {
    name: "Free",
    price: "Grátis",
    priceDetails: "para sempre",
    features: [
      "Links ilimitados",
      "Personalização de aparência",
      "Análise de cliques totais",
    ],
    icon: <CheckCircle className="w-5 h-5"/>,
    color: "gray",
  },
  pro: {
    name: "Pro",
    price: "R$14,90",
    priceDetails: "/mês",
    features: [
      "Tudo do plano Free",
      "Análise de Visitantes Únicos",
      "Análise de Fontes de Tráfego (Referrers)",
      "Análise de Países",
      "Remoção da marca Freelinnk",
      "Suporte via e-mail",
    ],
    icon: <Zap className="w-5 h-5" />,
    color: "blue",
  },
  ultra: {
    name: "Ultra",
    price: "R$39,90",
    priceDetails: "/mês",
    features: [
      "Tudo do plano Pro",
      "Análise de Cidades e Estados",
      "Análise de Horários de Pico",
      "Análise de Dispositivos (Mobile/Desktop)",
      "Integração com Pixel (Facebook/TikTok)",
      "Integração com Google Analytics (GA4)",
      "Suporte prioritário via WhatsApp",
    ],
    icon: <Rocket className="w-5 h-5" />,
    color: "purple",
    recommended: true,
  },
};

export default function BillingContent() {
  const { user } = useUser();
  const [loading, setLoading] = useState<PlanIdentifier | "cancel" | "portal" | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanIdentifier>("free");
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
        console.error("Erro ao buscar plano de assinatura:", err);
      }
    }
    fetchPlan();
  }, [user?.id, searchParams, router]);

  async function handleCheckout(plan: "pro" | "ultra") {
    if (!user?.id) return toast.error("Você precisa estar logado.");

    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL de checkout não recebida.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao iniciar o checkout. Tente novamente.");
      setLoading(null);
    }
  }

  async function handleCancel() {
    if (!confirm("Tem certeza que deseja cancelar sua assinatura? Você perderá o acesso aos recursos premium no final do seu ciclo de faturamento.")) return;

    setLoading("cancel");
    try {
      const res = await fetch("/api/stripe/cancel", { method: "POST" });
      if (!res.ok) throw new Error("Erro do servidor ao cancelar.");

      toast.success("Assinatura cancelada com sucesso.");
      setCurrentPlan("free"); // Atualiza a UI otimisticamente
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível cancelar a assinatura. Tente novamente.");
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
        throw new Error("URL do portal não recebida.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao acessar o portal de assinaturas. Tente novamente.");
      setLoading(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">Planos e Faturamento</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Gerencie sua assinatura e escolha o plano ideal para suas necessidades.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        <PlanCard plan={plans.free} currentPlan={currentPlan} />
        <PlanCard plan={plans.pro} currentPlan={currentPlan} loading={loading} onCheckout={handleCheckout} onCancel={handleCancel} />
        <PlanCard plan={plans.ultra} currentPlan={currentPlan} loading={loading} onCheckout={handleCheckout} onCancel={handleCancel} />
      </div>

      {currentPlan !== "free" && (
        <div className="text-center mt-12">
          <Button
            variant="ghost"
            onClick={handleManageSubscription}
            disabled={loading === "portal"}
          >
            {loading === "portal" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Acessar portal do cliente (alterar pagamento)
          </Button>
        </div>
      )}
    </div>
  );
}

// Tipagem explícita para as props do PlanCard
interface PlanCardProps {
    plan: Plan;
    currentPlan: PlanIdentifier;
    loading?: PlanIdentifier | "cancel" | "portal" | null;
    onCheckout?: (plan: "pro" | "ultra") => void;
    onCancel?: () => void;
}

function PlanCard({ plan, currentPlan, loading, onCheckout, onCancel }: PlanCardProps) {
  const isCurrent = plan.name.toLowerCase() === currentPlan;
  const isFree = plan.name === "Free";
  const planIdentifier = plan.name.toLowerCase() as PlanIdentifier;

  const colorClasses = {
    border: `border-${plan.color}-500`,
    text: `text-${plan.color}-600`,
    bg: `bg-${plan.color}-600`,
    hoverBg: `hover:bg-${plan.color}-700`,
  };

  return (
    <div className={clsx(
      "rounded-2xl border bg-white p-8 flex flex-col transition-all duration-300 transform hover:scale-105",
      isCurrent ? `${colorClasses.border} border-2 shadow-2xl` : "border-gray-200",
      plan.recommended && "relative"
    )}>
      {plan.recommended && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center gap-1"><Star className="w-4 h-4"/> RECOMENDADO</div>}

      <div className="flex-grow">
        <div className={`flex items-center gap-2 mb-4 ${colorClasses.text}`}>
          {plan.icon}
          <h2 className="text-2xl font-bold">{plan.name}</h2>
        </div>
        <p className="text-gray-900 text-4xl font-bold mb-1">
          {plan.price}
          <span className="text-base font-normal text-gray-500 ml-1">{plan.priceDetails}</span>
        </p>
        <ul className="text-gray-600 text-sm space-y-3 mt-6">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
          {isCurrent ? (
            !isFree && onCancel ? (
              // SE FOR O PLANO ATIVO, MOSTRA O BOTÃO DE CANCELAR
              <Button
                variant="destructive"
                onClick={onCancel}
                disabled={loading === "cancel"}
                className="w-full"
              >
                {loading === "cancel" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                Cancelar Assinatura
              </Button>
            ) : (
              <div className={clsx(
                "w-full text-center py-2.5 rounded-lg font-semibold",
                isFree ? 'bg-gray-200 text-gray-700' : `${colorClasses.bg} text-white`
              )}>
                Plano Ativo
              </div>
            )
          ) : (
            // SE NÃO FOR O PLANO ATIVO, MOSTRA O BOTÃO DE ASSINAR/UPGRADE
            !isFree && onCheckout && (
                <Button
                onClick={() => onCheckout(planIdentifier as "pro" | "ultra")}
                disabled={loading === planIdentifier}
                className={clsx(
                    `w-full text-white ${colorClasses.bg} ${colorClasses.hoverBg}`,
                    // Oculta o botão de downgrade para o plano Pro se o usuário já for Ultra
                    (currentPlan === 'ultra' && plan.name === 'Pro') && 'hidden'
                )}
                >
                {loading === planIdentifier ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {currentPlan === 'pro' && plan.name === 'Ultra' ? 'Fazer Upgrade para Ultra' : `Assinar ${plan.name}`}
                </Button>
            )
          )}
        </div>
    </div>
  );
}