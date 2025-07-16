"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, Rocket } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import clsx from "clsx";

export default function BillingPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState<"pro" | "ultra" | null>(null);

  async function handleCheckout(plan: "pro" | "ultra") {
    if (!user?.id) return;

    try {
      setLoading(plan);

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Erro ao redirecionar para o Stripe.");
      }
    } catch {
      toast.error("Erro ao iniciar o checkout.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-12 text-center">
        Escolha o seu plano
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Plano Pro */}
        <div className="rounded-2xl border bg-white shadow-lg p-6 flex flex-col justify-between transition hover:scale-[1.02] duration-300">
          <div>
            <div className="flex items-center gap-2 mb-4 text-purple-600">
              <Zap className="w-5 h-5" />
              <h2 className="text-xl font-bold">Plano Pro</h2>
            </div>
            <p className="text-gray-700 text-2xl font-semibold mb-2">
              R$9,90<span className="text-base font-normal">/mês</span>
            </p>
            <ul className="text-gray-600 text-sm space-y-2 mt-4">
              <li>✔ Acesso ao Analytics</li>
              <li>✔ Veja de onde vêm os visitantes</li>
              <li>✔ Adicione até 10 links</li>
            </ul>
          </div>
          <Button
            disabled={loading === "pro"}
            onClick={() => handleCheckout("pro")}
            className={clsx("w-full mt-6", {
              "opacity-50 cursor-not-allowed": loading === "pro",
            })}
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
        </div>

        {/* Plano Ultra */}
        <div className="rounded-2xl border border-purple-600 bg-purple-50 shadow-xl p-6 flex flex-col justify-between transition hover:scale-[1.02] duration-300">
          <div>
            <div className="flex items-center gap-2 mb-4 text-purple-800">
              <Rocket className="w-5 h-5" />
              <h2 className="text-xl font-bold">Plano Ultra</h2>
            </div>
            <p className="text-purple-800 text-2xl font-semibold mb-2">
              R$19,90<span className="text-base font-normal">/mês</span>
            </p>
            <ul className="text-purple-900 text-sm space-y-2 mt-4">
              <li>✔ Tudo do plano Pro</li>
              <li>✔ Links ilimitados</li>
              <li>✔ Geolocalização dos visitantes</li>
            </ul>
          </div>
          <Button
            disabled={loading === "ultra"}
            onClick={() => handleCheckout("ultra")}
            className={clsx(
              "w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white",
              { "opacity-50 cursor-not-allowed": loading === "ultra" }
            )}
          >
            {loading === "ultra" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecionando...
              </>
            ) : (
              "Assinar Ultra"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
