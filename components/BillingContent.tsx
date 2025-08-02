"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, Rocket, Star, CheckCircle, HelpCircle, ArrowRight, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import { Switch } from "./ui/switch";

// Tipos e constante 'plans' (sem alterações)
type PlanIdentifier = "free" | "pro" | "ultra";
type BillingCycle = "monthly" | "yearly";

interface Plan {
  name: string;
  tagline: string;
  monthlyPrice: string;
  yearlyPrice?: string;
  priceDetails: string;
  benefits: string[];
  icon: React.ReactNode;
  color: string;
  recommended?: boolean;
}

const plans: Record<PlanIdentifier, Plan> = {
  free: { name: "Free", tagline: "Para começar e organizar seus links.", monthlyPrice: "Grátis", priceDetails: "para sempre", benefits: ["Links ilimitados na sua página", "URL personalizada (seu_nome.freelinnk.com)", "Personalização de tema e aparência" ], icon: <CheckCircle className="w-5 h-5"/>, color: "gray" },
  pro: { name: "Pro", tagline: "Para criadores que querem entender e crescer sua audiência.", monthlyPrice: "R$14,90", yearlyPrice: "R$149", priceDetails: "/mês", benefits: ["Tudo do plano Free, e mais:", "Sua página, suas regras. Remova nossa marca.", "Painel de Análises Detalhadas", "Descubra de onde vêm seus visitantes (países e fontes)", "Entenda o comportamento dos seus usuários únicos", "Suporte prioritário via e-mail"], icon: <Zap className="w-5 h-5" />, color: "blue", recommended: true },
  ultra: { name: "Ultra", tagline: "Para negócios e influenciadores que usam tráfego pago.", monthlyPrice: "R$39,90", yearlyPrice: "R$399", priceDetails: "/mês", benefits: ["Tudo do plano Pro, e mais:", "Análises Geográficas Avançadas (cidades/estados)", "Otimize seus anúncios com rastreamento (Pixel e GA4)", "Identifique os melhores horários com Análise de Pico", "Suporte VIP via WhatsApp"], icon: <Rocket className="w-5 h-5" />, color: "purple" },
};

export default function BillingContent() {
  const { user } = useUser();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanIdentifier>("free");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    if (success) { toast.success("Assinatura realizada com sucesso! 🎉"); router.replace("/dashboard/billing"); }
    if (canceled) { toast.info("O processo de assinatura foi cancelado."); router.replace("/dashboard/billing"); }
    async function fetchPlan() {
      if (!user?.id) return;
      try {
        const res = await fetch("/api/subscription-plan");
        if (res.ok) {
          const data = await res.json();
          setCurrentPlan(data.plan || "free");
        }
      } catch (err) { console.error(err); }
    }
    fetchPlan();
  }, [user?.id, searchParams, router]);

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
      } else { throw new Error(data.error || "URL de checkout não recebida."); }
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
      await user?.reload(); // Força a atualização dos dados do Clerk
      setCurrentPlan("free"); // Atualização otimista
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
    <div className="bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">Planos feitos para o seu crescimento</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">Comece de graça. Evolua com ferramentas de análise e marketing quando estiver pronto para decolar.</p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-10">
          <span className={clsx("font-medium", billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500')}>Mensal</span>
          <Switch checked={billingCycle === 'yearly'} onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')} id="billing-cycle" />
          <span className={clsx("font-medium", billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500')}>Anual</span>
          <div className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">Economize 2 meses!</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <PlanCard plan={plans.free} currentPlan={currentPlan} billingCycle={billingCycle} />
          <PlanCard plan={plans.pro} currentPlan={currentPlan} billingCycle={billingCycle} loading={loading} onCheckout={handleCheckout} onCancel={handleCancel} />
          <PlanCard plan={plans.ultra} currentPlan={currentPlan} billingCycle={billingCycle} loading={loading} onCheckout={handleCheckout} onCancel={handleCancel} />
        </div>

        {currentPlan !== "free" && (
          <div className="text-center mt-16">
            <p className="text-gray-600 mb-4">Precisa atualizar seu cartão ou ver seu histórico de faturas?</p>
            <Button variant="outline" onClick={handleManageSubscription} disabled={loading === "portal"}>
              {loading === "portal" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Gerenciar Minha Assinatura
            </Button>
          </div>
        )}

        <FAQ />
      </div>
    </div>
  );
}

interface PlanCardProps {
    plan: Plan;
    currentPlan: PlanIdentifier;
    billingCycle: BillingCycle;
    loading?: string | null;
    onCheckout?: (plan: "pro" | "ultra") => void;
    onCancel?: () => void;
}

function PlanCard({ plan, currentPlan, billingCycle, loading, onCheckout, onCancel }: PlanCardProps) {
  const isCurrent = plan.name.toLowerCase() === currentPlan;
  const isFree = plan.name === "Free";
  const planIdentifier = plan.name.toLowerCase() as PlanIdentifier;
  const loadingId = `${planIdentifier}-${billingCycle}`;
  const colorClasses = {
    border: `border-${plan.color}-500`, text: `text-${plan.color}-600`, bg: `bg-${plan.color}-600`, hoverBg: `hover:bg-${plan.color}-700`,
  };
  const displayPrice = billingCycle === 'yearly' && plan.yearlyPrice ? plan.yearlyPrice : plan.monthlyPrice;
  const displayPriceDetails = billingCycle === 'yearly' && plan.yearlyPrice ? '/ano' : plan.priceDetails;

  return (
    <div className={clsx("rounded-2xl border bg-white p-8 flex flex-col h-full transition-transform duration-300",
      plan.recommended && "lg:scale-105 shadow-2xl z-10",
      isCurrent ? `${colorClasses.border} border-2` : "border-gray-200"
    )}>
      {plan.recommended && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center gap-1"><Star className="w-4 h-4"/> RECOMENDADO</div>}

      <div className="flex-grow">
        <div className={`flex items-center gap-3 mb-2 ${colorClasses.text}`}>{plan.icon}<h2 className="text-2xl font-bold">{plan.name}</h2></div>
        <p className="text-sm text-gray-500 mb-4 h-10">{plan.tagline}</p>
        <p className="text-gray-900 text-4xl font-bold mb-1">{displayPrice}<span className="text-base font-normal text-gray-500 ml-1">{displayPriceDetails}</span></p>
        <ul className="text-gray-600 text-sm space-y-3 mt-6">
          {plan.benefits.map((benefit, index) => (
            <li key={benefit} className="flex items-start gap-3">
              <CheckCircle className={`w-5 h-5 ${index === 0 && !isFree ? 'text-transparent' : 'text-green-500'} flex-shrink-0 mt-0.5`} />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-8">
        {isCurrent ? (
          isFree ? (
            <div className="w-full text-center py-2.5 rounded-lg font-semibold bg-gray-200 text-gray-700">Seu Plano Atual</div>
          ) : (
            <Button variant="destructive" className="w-full" onClick={onCancel} disabled={loading === 'cancel'}>
              {loading === 'cancel' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
              Cancelar Assinatura
            </Button>
          )
        ) : (
          !isFree && onCheckout && (
            <Button onClick={() => onCheckout(planIdentifier as "pro" | "ultra")} disabled={loading === loadingId} className={clsx(`w-full text-white ${colorClasses.bg} ${colorClasses.hoverBg}`)}>
              {loading === loadingId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
              {currentPlan === 'free' && `Assinar Plano ${plan.name}`}
              {currentPlan === 'pro' && plan.name === 'Ultra' && 'Fazer Upgrade'}
            </Button>
          )
        )}
      </div>
    </div>
  );
}

function FAQ() {
    const faqs = [
        { q: "Posso cancelar a qualquer momento?", a: "Sim! Você pode cancelar sua assinatura quando quiser no seu painel. Seu acesso aos recursos premium continuará até o final do seu ciclo de faturamento." },
        { q: "O pagamento é seguro?", a: "Com certeza. Usamos a Stripe, uma das maiores e mais seguras plataformas de pagamento do mundo. Seus dados estão protegidos." },
        { q: "Como funciona o upgrade?", a: "Ao fazer upgrade, você paga apenas a diferença proporcional pelo tempo restante no seu ciclo atual. A mudança é imediata e você não perde nada." },
    ];
    return (
        <div className="mt-24 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Ainda tem dúvidas?</h2>
            <div className="space-y-6">
                {faqs.map(faq => (
                    <div key={faq.q} className="bg-white p-6 rounded-xl border border-gray-200/80">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-gray-500"/>{faq.q}</h3>
                        <p className="text-gray-600 mt-2 pl-7">{faq.a}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}