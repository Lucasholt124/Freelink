"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { SignInButton } from "@clerk/nextjs";
import { Gift, Sparkles, Crown, CheckCircle, ArrowRight, Lock, Check } from "lucide-react";
import { BRAND, pricingPlans } from "@/app/constants/landing-data";
import { ScrollReveal } from "../Animaçoes/Animations";
import { HotBadge } from "../Animaçoes/Badges";


export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <section id="precos" className="py-14 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold mb-3">
              <Gift size={13} /> 7 Dias Grátis em Todos os Planos
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Escolha seu plano e{" "}
              <span className={BRAND.textGradient}>comece a crescer</span>
            </h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">
              Teste todas as ferramentas por 7 dias. Cancele quando quiser, sem compromisso.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="flex items-center justify-center mb-8">
            <div className="relative flex items-center gap-2 bg-gray-100 p-1 rounded-full">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={clsx(
                  "px-5 py-2 rounded-full text-sm font-semibold transition-all",
                  billingCycle === "monthly"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={clsx(
                  "px-5 py-2 rounded-full text-sm font-semibold transition-all",
                  billingCycle === "yearly"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                Anual
              </button>
              {billingCycle === "yearly" && (
                <span className="absolute -right-28 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg whitespace-nowrap">
                  <Sparkles size={11} /> 2 meses grátis
                </span>
              )}
            </div>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {pricingPlans.map((plan) => (
            <ScrollReveal key={plan.id}>
              <div
                className={clsx(
                  "relative rounded-2xl p-7 h-full flex flex-col overflow-hidden",
                  plan.id === "ultra"
                    ? "bg-gray-900 text-white border-2 border-purple-500 shadow-xl shadow-purple-500/10"
                    : "bg-white border-2 border-amber-200 shadow-md"
                )}
              >
                {plan.id === "ultra" && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
                )}

                <div className="mb-5">
                  <span
                    className={clsx(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                      `bg-gradient-to-r ${plan.badgeColor} text-white`
                    )}
                  >
                    {plan.id === "ultra" && <Crown size={12} className="fill-current" />}
                    {plan.badge}
                  </span>
                </div>

                <h3 className={clsx("text-lg font-bold mb-1.5", plan.id === "ultra" ? "text-white" : "text-gray-900")}>
                  {plan.name}
                </h3>
                <p className={clsx("text-xs mb-5 leading-relaxed", plan.id === "ultra" ? "text-gray-400" : "text-gray-500")}>
                  {plan.description}
                </p>

                <div
                  className={clsx(
                    "p-4 rounded-xl mb-5",
                    plan.id === "ultra" ? "bg-white/5 border border-white/10" : "bg-amber-50 border border-amber-100"
                  )}
                >
                  <div className="flex items-baseline gap-1">
                    <span className={clsx("text-3xl md:text-4xl font-bold", plan.id === "ultra" ? "text-white" : "text-gray-900")}>
                      R$ {billingCycle === "yearly"
                        ? plan.yearlyPrice
                        : plan.monthlyPrice.toFixed(2).replace(".", ",")}
                    </span>
                    <span className={clsx("text-sm", plan.id === "ultra" ? "text-gray-400" : "text-gray-500")}>
                      /{billingCycle === "yearly" ? "ano" : "mês"}
                    </span>
                  </div>
                  {billingCycle === "yearly" && (
                    <p className={clsx("text-xs font-semibold mt-1.5 flex items-center gap-1", plan.id === "ultra" ? "text-purple-400" : "text-green-600")}>
                      <CheckCircle size={11} /> Economia de R$ {((plan.monthlyPrice * 12) - plan.yearlyPrice).toFixed(0)} por ano
                    </p>
                  )}
                </div>

                <SignInButton mode="modal">
                  <button
                    className={clsx(
                      "w-full py-3 px-5 rounded-xl font-semibold text-sm mb-5 transition-all flex items-center justify-center gap-2 cursor-pointer",
                      plan.id === "ultra"
                        ? "bg-white text-gray-900 hover:bg-gray-100"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                    )}
                  >
                    <Gift size={16} /> {plan.cta} <ArrowRight size={15} />
                  </button>
                </SignInButton>

                <p className={clsx("text-center text-xs mb-5 pb-5 border-b", plan.id === "ultra" ? "text-gray-500 border-white/10" : "text-gray-400 border-gray-100")}>
                  <Lock size={11} className="inline mr-1" /> 7 dias grátis · Cancele quando quiser
                </p>

                <div className="flex-1">
                  <p className={clsx("text-xs font-semibold uppercase tracking-wide mb-3", plan.id === "ultra" ? "text-gray-500" : "text-gray-400")}>
                    {plan.id === "ultra" ? "Tudo do Pro, mais:" : "Tudo incluso:"}
                  </p>
                  <div className="space-y-2.5">
                    {plan.features.map((feature, i) => (
                      <div key={i} className={clsx("flex items-center gap-2.5 text-xs", plan.id === "ultra" ? "text-gray-300" : "text-gray-600")}>
                        <Check size={13} className={plan.id === "ultra" ? "text-purple-400 shrink-0" : "text-indigo-500 shrink-0"} />
                        <span className="font-medium flex items-center gap-1.5">
                          {feature.text}
                          {feature.isHot && <HotBadge />}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
