"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { SignInButton } from "@clerk/nextjs";
import { Gift, Sparkles, Crown, CheckCircle, ArrowRight, Lock, Check } from "lucide-react";
import { ScrollReveal } from "../Animaçoes/Animations";
import { BRAND, pricingPlans } from "@/app/constants/landing-data";
import { HotBadge } from "../Animaçoes/Badges";


export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <section id="precos" className="py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold mb-4">
              <Gift size={16} /> 7 Dias Grátis em Todos os Planos
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              Escolha seu plano e <span className={BRAND.textGradient}>comece a crescer</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Teste todas as ferramentas por 7 dias. Cancele quando quiser, sem compromisso.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="flex items-center justify-center mb-12">
            <div className="relative flex items-center gap-4 bg-white p-1.5 rounded-full border border-gray-200 shadow-sm">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={clsx(
                  "px-6 py-2.5 rounded-full text-sm font-bold transition-all",
                  billingCycle === "monthly" ? "bg-gray-900 text-white shadow-md" : "text-gray-500 hover:text-gray-700"
                )}
              >
                Mensal
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={clsx(
                  "px-6 py-2.5 rounded-full text-sm font-bold transition-all",
                  billingCycle === "yearly" ? "bg-green-500 text-white shadow-md" : "text-gray-500 hover:text-gray-700"
                )}
              >
                Anual
              </button>
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute -right-32 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg"
              >
                <Sparkles size={12} /> 2 meses grátis!
              </motion.div>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => (
            <ScrollReveal key={plan.id}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={clsx(
                  "relative rounded-[2rem] p-8 h-full flex flex-col overflow-hidden",
                  plan.id === "ultra" ? "bg-gray-900 text-white border-2 border-purple-500 shadow-2xl shadow-purple-500/20" : "bg-white border-2 border-amber-300 shadow-xl"
                )}
              >
                {plan.id === "ultra" && (
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
                )}
                <div className="mb-6">
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className={clsx("inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg", `bg-gradient-to-r ${plan.badgeColor} text-white`)}
                  >
                    {plan.id === "ultra" && <Crown size={14} className="fill-current" />}
                    {plan.badge}
                  </motion.div>
                </div>

                <h3 className={clsx("text-2xl font-bold mb-2", plan.id === "ultra" ? "text-white" : "text-gray-900")}>{plan.name}</h3>
                <p className={clsx("text-sm mb-6", plan.id === "ultra" ? "text-gray-400" : "text-gray-500")}>{plan.description}</p>

                <div className={clsx("p-5 rounded-2xl mb-6", plan.id === "ultra" ? "bg-white/5 border border-white/10" : "bg-amber-50 border border-amber-100")}>
                  <div className="flex items-baseline gap-1">
                    <span className={clsx("text-4xl md:text-5xl font-black", plan.id === "ultra" ? "text-white" : "text-gray-900")}>
                      R$ {billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice.toFixed(2).replace(".", ",")}
                    </span>
                    <span className={clsx("font-medium", plan.id === "ultra" ? "text-gray-400" : "text-gray-500")}>
                      /{billingCycle === "yearly" ? "ano" : "mês"}
                    </span>
                  </div>
                  {billingCycle === "yearly" && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={clsx("text-xs font-bold mt-2 flex items-center gap-1", plan.id === "ultra" ? "text-purple-400" : "text-green-600")}>
                      <CheckCircle size={12} /> Economia de R$ {((plan.monthlyPrice * 12) - plan.yearlyPrice).toFixed(0)} por ano
                    </motion.p>
                  )}
                </div>

                <SignInButton mode="modal">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={clsx(
                      "w-full py-4 px-6 rounded-xl font-bold text-lg mb-8 transition-all flex items-center justify-center gap-2 cursor-pointer",
                      plan.id === "ultra" ? "bg-white text-gray-900 hover:bg-gray-100 shadow-xl" : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30"
                    )}
                  >
                    <Gift size={20} /> {plan.cta} <ArrowRight size={18} />
                  </motion.button>
                </SignInButton>

                <div className={clsx("text-center text-xs font-medium mb-6 pb-6 border-b", plan.id === "ultra" ? "text-gray-500 border-white/10" : "text-gray-400 border-gray-100")}>
                  <Lock size={12} className="inline mr-1" /> 7 dias grátis • Cancele quando quiser • Sem cartão para testar
                </div>

                <div className="flex-1">
                  <p className={clsx("text-xs font-bold uppercase tracking-wider mb-4", plan.id === "ultra" ? "text-gray-500" : "text-gray-400")}>
                    {plan.id === "ultra" ? "Tudo do Pro, mais:" : "Tudo incluso:"}
                  </p>
                  <div className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className={clsx("flex items-center gap-3 text-sm", plan.id === "ultra" ? "text-gray-200" : "text-gray-700")}>
                        <div className={clsx("shrink-0", plan.id === "ultra" ? "text-purple-400" : "text-blue-500")}>
                          <Check size={16} />
                        </div>
                        <span className="font-medium flex items-center gap-2">
                          <span className={clsx(plan.id === "ultra" ? "text-purple-400/50" : "text-gray-400")}>{feature.icon}</span>
                          {feature.text}
                          {feature.isHot && <HotBadge />}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}