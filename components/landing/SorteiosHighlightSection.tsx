"use client";

import React from "react";
import { motion } from "framer-motion";
import { SignInButton } from "@clerk/nextjs";
import { Gift, Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import { ScrollReveal } from "../Animaçoes/Animations";
import { HotBadge } from "../Animaçoes/Badges";


export default function SorteiosHighlightSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-orange-50 via-red-50 to-pink-50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <ScrollReveal>
          <div className="relative">
            <motion.div
              className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 rounded-[3rem] blur-2xl"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <div className="relative bg-white rounded-[2.5rem] p-8 md:p-12 border-2 border-orange-200 shadow-2xl overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
              />

              <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                <motion.div whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }} className="flex-shrink-0">
                  <motion.div
                    className="w-28 h-28 md:w-36 md:h-36 bg-gradient-to-br from-orange-500 to-red-500 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-orange-500/40"
                    animate={{ boxShadow: ["0 25px 50px -12px rgba(249, 115, 22, 0.4)", "0 25px 50px -12px rgba(239, 68, 68, 0.6)", "0 25px 50px -12px rgba(249, 115, 22, 0.4)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                      <Gift size={50} className="text-white" />
                    </motion.div>
                  </motion.div>
                </motion.div>

                <div className="flex-1 text-center lg:text-left">
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
                    <h3 className="text-3xl md:text-4xl font-black text-gray-900">Ferramenta de Sorteios</h3>
                    <HotBadge />
                    <motion.span
                      initial={{ scale: 0, rotate: -12 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-black rounded-full uppercase"
                    >
                      <Sparkles size={12} /> NOVO
                    </motion.span>
                  </div>

                  <p className="text-gray-600 text-lg md:text-xl mb-6 max-w-2xl">
                    Crie sorteios incríveis no Instagram em segundos! Aumente seu engajamento, ganhe seguidores e conecte-se com sua audiência de forma viral.
                    <strong className="text-orange-600"> Exclusivo do Plano PRO.</strong>
                  </p>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8">
                    {[
                      { icon: <CheckCircle size={16} />, text: "Sorteio automático" },
                      { icon: <CheckCircle size={16} />, text: "Filtros avançados" },
                      { icon: <CheckCircle size={16} />, text: "Resultado transparente" },
                      { icon: <CheckCircle size={16} />, text: "Sem limite de participantes" },
                    ].map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
                        <span className="text-green-500">{item.icon}</span> {item.text}
                      </motion.div>
                    ))}
                  </div>

                  <SignInButton mode="modal">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-orange-500/30 cursor-pointer">
                      <Gift size={22} /> Quero Criar Sorteios Agora <ArrowRight size={20} />
                    </motion.button>
                  </SignInButton>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}