"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, Shield, Sparkles, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FreelinnkLogo } from "@/components/onboarding/FreelinnkLogo";
import { HERO_PHRASES, SOCIAL_PROOF } from "@/app/constants/onboarding-data";

interface StepWelcomeProps {
  onNext: () => void;
  currentPhraseIndex: number;
}

export function StepWelcome({ onNext, currentPhraseIndex }: StepWelcomeProps) {
  return (
    <motion.div
      key="welcome"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <FreelinnkLogo size="large" />
      </motion.div>

      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative h-24 sm:h-28"
        >
          <AnimatePresence mode="wait">
            <motion.h1
              key={currentPhraseIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight"
            >
              {HERO_PHRASES[currentPhraseIndex].text}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                {HERO_PHRASES[currentPhraseIndex].highlight}
              </span>
            </motion.h1>
          </AnimatePresence>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-slate-500 text-base sm:text-lg max-w-md"
        >
          Reúna seus links, redes sociais e conteúdo em uma página bonita e
          profissional. Grátis para sempre.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { icon: <Zap className="w-5 h-5" />, text: "Rápido", subtext: "2 min" },
          { icon: <Shield className="w-5 h-5" />, text: "Gratuito", subtext: "100%" },
          { icon: <Sparkles className="w-5 h-5" />, text: "Bonito", subtext: "20+ temas" },
        ].map((feature, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -2, scale: 1.02 }}
            className="p-3 sm:p-4 rounded-xl bg-white border border-slate-100 shadow-sm text-center cursor-default"
          >
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-violet-600">
              {feature.icon}
            </div>
            <p className="text-slate-900 font-semibold text-sm">{feature.text}</p>
            <p className="text-slate-400 text-xs">{feature.subtext}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          onClick={onNext}
          className="w-full h-14 sm:h-16 text-lg sm:text-xl font-bold rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-700 hover:via-indigo-700 hover:to-blue-700 border-0 shadow-xl shadow-violet-500/30 group relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-200%", "200%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
          <span className="relative flex items-center gap-2">
            Criar minha página grátis
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Button>

        <p className="text-center text-slate-400 text-xs mt-3">
          Sem cartão de crédito • Sem spam • Cancele quando quiser
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="pt-4 border-t border-slate-100"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="flex -space-x-2">
            {SOCIAL_PROOF.map((person, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 border-2 border-white flex items-center justify-center text-sm"
              >
                {person.avatar}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <span className="text-slate-500 text-sm font-medium">4.9/5</span>
        </div>

        <div className="flex overflow-hidden">
          <motion.div
            className="flex gap-4"
            animate={{ x: [0, -400] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          >
            {[...SOCIAL_PROOF, ...SOCIAL_PROOF].map((person, i) => (
              <div
                key={i}
                className="flex-shrink-0 p-3 rounded-xl bg-slate-50 border border-slate-100 w-56"
              >
                <p className="text-slate-600 text-xs italic mb-2">{person.text}</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{person.avatar}</span>
                  <div>
                    <p className="text-slate-900 text-xs font-semibold">{person.name}</p>
                    <p className="text-slate-400 text-[10px]">{person.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}