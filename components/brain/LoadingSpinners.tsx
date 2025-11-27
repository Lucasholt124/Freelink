"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Film, Camera, Music, Scissors, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const LoadingSpinnerPro = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 px-4 text-center">
    <div className="relative">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-20 h-20 rounded-full border-4 border-purple-200 border-t-purple-600"
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Brain className="w-8 h-8 text-purple-600" />
      </motion.div>
    </div>
    <div className="space-y-2">
      <p className="text-lg font-bold text-gray-900 dark:text-white">
        Gerando suas ideias...
      </p>
      <p className="text-sm text-muted-foreground">
        Analisando tendências e criando conteúdo viral
      </p>
    </div>
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
          className="w-3 h-3 bg-purple-500 rounded-full"
        />
      ))}
    </div>
  </div>
);

export const LoadingSpinnerUltra = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    { icon: Brain, text: "Analisando psicologia do público...", color: "text-purple-500" },
    { icon: Film, text: "Criando roteiro cinematográfico...", color: "text-pink-500" },
    { icon: Camera, text: "Definindo ângulos de câmera...", color: "text-blue-500" },
    { icon: Music, text: "Sincronizando com áudio viral...", color: "text-orange-500" },
    { icon: Scissors, text: "Otimizando cortes e transições...", color: "text-green-500" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [steps.length]);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] space-y-8 px-4">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, #8B5CF6, #EC4899, #F59E0B, #10B981, #8B5CF6)",
            padding: "4px",
          }}
        >
          <div className="w-full h-full rounded-full bg-white dark:bg-gray-950 flex items-center justify-center">
            <motion.div
              key={currentStep}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              <CurrentIcon className={cn("w-12 h-12", steps[currentStep].color)} />
            </motion.div>
          </div>
        </motion.div>

        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            animate={{
              x: [0, Math.cos(i * 45 * Math.PI / 180) * 60],
              y: [0, Math.sin(i * 45 * Math.PI / 180) * 60],
              opacity: [1, 0],
              scale: [1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            style={{
              left: "50%",
              top: "50%",
              marginLeft: "-4px",
              marginTop: "-4px",
            }}
          />
        ))}
      </div>

      <Badge className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white px-4 py-1.5 text-sm font-bold animate-pulse">
        <Crown className="w-4 h-4 mr-2 fill-white" />
        MODO ULTRA ATIVADO
      </Badge>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-center space-y-2"
        >
          <p className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
            {steps[currentStep].text}
          </p>
          <p className="text-sm text-muted-foreground">
            Criando roteiro frame-a-frame com direção profissional
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="w-64 space-y-2">
        <Progress value={(currentStep + 1) * 20} className="h-2" />
        <p className="text-xs text-center text-muted-foreground">
          Etapa {currentStep + 1} de {steps.length}
        </p>
      </div>
    </div>
  );
};