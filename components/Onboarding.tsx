
"use client";

import { useState,  } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Rocket, ChevronRight, Package, ShoppingCart,
  TrendingUp,
} from "lucide-react";
import confetti from "canvas-confetti";

interface OnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Rocket className="w-16 h-16 text-blue-600" />,
      title: "Bem-vindo ao Gestão PRO! 🎉",
      description: "Chega de papel e caneta! Vamos revolucionar suas vendas em 3 passos simples.",
      action: "Vamos lá!",
      color: "from-blue-500 to-purple-600",
    },
    {
      icon: <Package className="w-16 h-16 text-purple-600" />,
      title: "1️⃣ Cadastre seus produtos",
      description: "É só colocar o nome, quanto você paga e por quanto vende. Simples assim!",
      action: "Entendi!",
      color: "from-purple-500 to-pink-600",
    },
    {
      icon: <ShoppingCart className="w-16 h-16 text-emerald-600" />,
      title: "2️⃣ Registre suas vendas",
      description: "Vendeu? Clica no botão de venda rápida e pronto! Lucro calculado na hora.",
      action: "Show!",
      color: "from-emerald-500 to-green-600",
    },
    {
      icon: <TrendingUp className="w-16 h-16 text-orange-600" />,
      title: "3️⃣ Acompanhe seus lucros",
      description: "Veja quanto você está ganhando em tempo real. Dashboard completo e visual!",
      action: "Começar agora!",
      color: "from-orange-500 to-red-600",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
      });
      setTimeout(onComplete, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-lg"
        >
          <Card className="p-8 bg-white shadow-2xl">
            <div className="text-center space-y-6">
              {/* Ícone com gradiente */}
              <div className="relative mx-auto w-24 h-24">
                <div className={`absolute inset-0 bg-gradient-to-br ${steps[currentStep].color} rounded-3xl blur-xl opacity-50 animate-pulse`} />
                <div className="relative flex items-center justify-center w-full h-full">
                  {steps[currentStep].icon}
                </div>
              </div>

              {/* Conteúdo */}
              <div>
                <h2 className="text-2xl md:text-3xl font-black mb-3">
                  {steps[currentStep].title}
                </h2>
                <p className="text-gray-600 text-base md:text-lg">
                  {steps[currentStep].description}
                </p>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-2">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      i === currentStep
                        ? "w-8 bg-gradient-to-r from-blue-600 to-purple-600"
                        : i < currentStep
                        ? "w-2 bg-emerald-500"
                        : "w-2 bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={onSkip}
                  className="flex-1"
                >
                  Pular tutorial
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {steps[currentStep].action}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}