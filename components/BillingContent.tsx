"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, Rocket, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";

type PlanType = "free" | "pro" | "ultra";

export default function BillingContent() {
  const { user } = useUser();
  const [loading, setLoading] = useState<"pro" | "ultra" | "cancel" | null>(null);
  const [plan, setPlan] = useState<PlanType>("free");
  const searchParams = useSearchParams();
  const router = useRouter();

  // Buscar plano do usuário ao carregar
  useEffect(() => {
    async function fetchPlan() {
      if (!user?.id) return;
      try {
        const res = await fetch("/api/subscription-plan");
        if (!res.ok) throw new Error("Erro ao buscar plano");
        const data = await res.json();
        setPlan(data.plan || "free");
      } catch (error) {
        console.error(error);
        setPlan("free");
      }
    }
    fetchPlan();
  }, [user?.id]);

  // Toast de sucesso na assinatura
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      toast.success("Assinatura realizada com sucesso! 🎉");
      router.replace("/dashboard/billing");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCheckout(plan: "pro" | "ultra") {
    if (!user?.id) {
      toast.error("Você precisa estar logado.");
      return;
    }
    try {
      setLoading(plan);
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) {
        toast.error("Erro no servidor ao iniciar checkout.");
        setLoading(null);
        return;
      }
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("Erro ao redirecionar para o Stripe.");
        setLoading(null);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao iniciar o checkout.");
      setLoading(null);
    }
  }

  async function handleCancel() {
    setLoading("cancel");
    try {
      const res = await fetch("/api/stripe/cancel", { method: "POST" });
      if (!res.ok) throw new Error("Erro ao cancelar assinatura");
      toast.success("Assinatura cancelada. Você ainda terá acesso até o fim do período pago.");
      setPlan("free");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao cancelar assinatura.");
    } finally {
      setLoading(null);
    }
  }

  // Exibe badge do plano ativo
  function PlanBadge() {
    if (plan === "ultra")
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-bold">
          <Rocket className="w-4 h-4" /> Ultra (ativo)
        </span>
      );
    if (plan === "pro")
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">
          <Zap className="w-4 h-4" /> Pro (ativo)
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-300 text-gray-700 text-xs font-bold">
        Free
      </span>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-4xl font-bold mb-2 text-center">Seu plano</h1>
        <PlanBadge />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Plano Pro */}
        <div
          className={clsx(
            "rounded-2xl border bg-white shadow-lg p-6 flex flex-col justify-between transition hover:scale-[1.02] duration-300",
            plan === "pro" && "border-blue-600",
            plan === "ultra" && "opacity-60"
          )}
        >
          <div>
            <div className="flex items-center gap-2 mb-4 text-blue-600">
              <Zap className="w-5 h-5" />
              <h2 className="text-xl font-bold">Plano Pro</h2>
              {plan === "pro" && <CheckCircle className="w-5 h-5 text-blue-600" />}
            </div>
            <p className="text-gray-700 text-2xl font-semibold mb-2">
              R$9,90 <span className="text-base font-normal">/mês</span>
            </p>
            <ul className="text-gray-600 text-sm space-y-2 mt-4">
              <li>✔ Acesso ao Analytics</li>
              <li>✔ Veja de onde vêm os visitantes</li>
              <li>✔ Adicione até 10 links</li>
            </ul>
          </div>
          {plan === "pro" ? (
            <Button
              variant="destructive"
              disabled={loading === "cancel"}
              aria-busy={loading === "cancel"}
              onClick={handleCancel}
              className="w-full mt-6"
            >
              {loading === "cancel" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 w-4 h-4" />
                  Cancelar assinatura
                </>
              )}
            </Button>
          ) : plan === "ultra" ? (
            <Button disabled className="w-full mt-6 opacity-50 cursor-not-allowed">
              Incluído no Ultra
            </Button>
          ) : (
            <Button
              disabled={loading === "pro"}
              aria-busy={loading === "pro"}
              onClick={() => handleCheckout("pro")}
              className="w-full mt-6"
            >
              {loading === "pro" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecionando...
                </>
              ) : (
                "Assinar Pro"
              )}
            </Button>
          )}
        </div>

        {/* Plano Ultra */}
        <div
          className={clsx(
            "rounded-2xl border shadow-xl p-6 flex flex-col justify-between transition hover:scale-[1.02] duration-300",
            plan === "ultra"
              ? "border-purple-600 bg-purple-50"
              : "bg-white border-gray-200",
            plan === "pro" && "opacity-60"
          )}
        >
          <div>
            <div className="flex items-center gap-2 mb-4 text-purple-800">
              <Rocket className="w-5 h-5" />
              <h2 className="text-xl font-bold">Plano Ultra</h2>
              {plan === "ultra" && <CheckCircle className="w-5 h-5 text-purple-800" />}
            </div>
            <p
              className={clsx(
                "text-2xl font-semibold mb-2",
                plan === "ultra" ? "text-purple-800" : "text-gray-700"
              )}
            >
              R$19,90 <span className="text-base font-normal">/mês</span>
            </p>
            <ul
              className={clsx(
                "text-sm space-y-2 mt-4",
                plan === "ultra" ? "text-purple-900" : "text-gray-600"
              )}
            >
              <li>✔ Tudo do plano Pro</li>
              <li>✔ Links ilimitados</li>
              <li>✔ Geolocalização dos visitantes</li>
            </ul>
          </div>
          {plan === "ultra" ? (
            <Button
              variant="destructive"
              disabled={loading === "cancel"}
              aria-busy={loading === "cancel"}
              onClick={handleCancel}
              className="w-full mt-6"
            >
              {loading === "cancel" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 w-4 h-4" />
                  Cancelar assinatura
                </>
              )}
            </Button>
          ) : (
            <Button
              disabled={loading === "ultra" || plan === "pro"}
              aria-busy={loading === "ultra"}
              onClick={() => handleCheckout("ultra")}
              className={clsx(
                "w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white",
                { "opacity-50 cursor-not-allowed": loading === "ultra" || plan === "pro" }
              )}
            >
              {loading === "ultra" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecionando...
                </>
              ) : plan === "pro" ? (
                "Mude para Ultra"
              ) : (
                "Assinar Ultra"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}