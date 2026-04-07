"use client";

import React from "react";
import { motion } from "framer-motion";
import { SignInButton } from "@clerk/nextjs";
import { Gift, Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import { HotBadge } from "../Animaçoes/Badges";
import { ScrollReveal } from "../Animaçoes/Animations";

export default function SorteiosHighlightSection() {
  return (
    <section className="py-14 bg-orange-50 border-y border-orange-100">
      <div className="max-w-5xl mx-auto px-4">
        <ScrollReveal>
          <div className="bg-white rounded-2xl p-7 md:p-10 border border-orange-100 shadow-sm overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Gift size={36} className="text-white" />
                </div>
              </div>

              <div className="flex-1 text-center lg:text-left">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-3">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">Ferramenta de Sorteios</h3>
                  <HotBadge />
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full uppercase">
                    <Sparkles size={10} /> NOVO
                  </span>
                </div>

                <p className="text-gray-500 text-sm mb-5 max-w-xl leading-relaxed">
                  Crie sorteios incríveis no Instagram em segundos. Aumente seu engajamento, ganhe seguidores e conecte-se com sua audiência de forma viral.{" "}
                  <strong className="text-orange-600">Exclusivo do Plano PRO.</strong>
                </p>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-6">
                  {[
                    "Sorteio automático",
                    "Filtros avançados",
                    "Resultado transparente",
                    "Sem limite de participantes",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 text-xs text-gray-600">
                      <CheckCircle size={11} className="text-green-500" /> {item}
                    </div>
                  ))}
                </div>

                <SignInButton mode="modal">
                  <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-sm rounded-xl shadow-md shadow-orange-500/20 cursor-pointer transition-all">
                    <Gift size={16} /> Quero Criar Sorteios <ArrowRight size={15} />
                  </button>
                </SignInButton>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
