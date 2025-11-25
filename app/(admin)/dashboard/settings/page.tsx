"use client";

import UsernameForm from "@/components/UsernameForm";
import CustomizationForm from "@/components/CustomizationForm";
import {
  Settings,
  Sparkles,
  Shield,
  Check,
  Rocket,
  Zap,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Animações reutilizáveis
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Simular progresso baseado no localStorage ou estado real
    const saved = localStorage.getItem('freelink_progress');
    if (saved) setCompletedSteps(parseInt(saved));
  }, []);

  // Atualizar progresso
  const updateProgress = (step: number) => {
    const newProgress = Math.max(completedSteps, step);
    setCompletedSteps(newProgress);
    localStorage.setItem('freelink_progress', newProgress.toString());
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 selection:bg-purple-100 selection:text-purple-900">

      {/* Background Decorativo Otimizado - Performance Mobile */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        {/* Gradientes suaves sem blur pesado */}
        <div
          className="absolute -top-[30%] -right-[20%] w-[80vw] h-[80vw] rounded-full opacity-30 animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(147,51,234,0.15) 0%, rgba(147,51,234,0.05) 40%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-[30%] -left-[20%] w-[70vw] h-[70vw] rounded-full opacity-30 animate-float-delayed"
          style={{
            background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(236,72,153,0.05) 40%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-[20%] left-[30%] w-[60vw] h-[60vw] rounded-full opacity-20 animate-float-slow"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.05) 40%, transparent 70%)',
          }}
        />

        {/* Grid sutil */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {/* Header Premium */}
        <motion.header className="relative mb-8 sm:mb-12" variants={fadeInUp}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl shadow-lg shadow-purple-200/50"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </motion.div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 tracking-tight">
                  Configurações
                </h1>
              </div>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl leading-relaxed">
                Transforme seu link em uma experiência única.
                <span className="hidden sm:inline"> Personalize cada detalhe e deixe com a </span>
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  sua identidade
                </span>.
              </p>
            </div>

            {/* Badge de status - Desktop */}
            <motion.div
              className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-700">Alterações salvas automaticamente</span>
            </motion.div>
          </div>

          {/* Barra de Progresso Gamificada */}
          <motion.div
            className="mt-6 sm:mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100"
            variants={fadeInUp}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Nível do Perfil
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                  {completedSteps >= 2 ? '✨ Completo!' : `Passo ${Math.min(completedSteps + 1, 2)} de 2`}
                </span>
              </div>
            </div>

            <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(completedSteps / 2) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              {/* Brilho animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>

            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-gray-500">
                {completedSteps === 0 && "Configure sua URL para começar 🚀"}
                {completedSteps === 1 && "Personalize o visual do seu link ✨"}
                {completedSteps >= 2 && "Parabéns! Seu perfil está completo 🎉"}
              </p>

              {/* Indicadores de etapa */}
              <div className="flex items-center gap-1">
                {[1, 2].map((step) => (
                  <motion.div
                    key={step}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      completedSteps >= step
                        ? 'bg-purple-500'
                        : 'bg-gray-200'
                    }`}
                    animate={completedSteps >= step ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.header>

        {/* === SEÇÃO 1: URL === */}
        <motion.section
          className="relative scroll-mt-20 mb-8 sm:mb-12"
          id="username"
          variants={fadeInUp}
        >
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">

            {/* Sidebar Info */}
            <aside className="lg:w-1/3 space-y-4 sm:space-y-6">
              <div className="lg:sticky lg:top-24">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm shadow-sm">
                    1
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Sua Identidade</h2>
                </div>

                <div className="space-y-4">
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Escolha um nome único e memorável. É assim que seus seguidores vão te encontrar.
                  </p>

                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-blue-600 mb-3 tracking-wide uppercase flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      Vantagens
                    </p>
                    <ul className="space-y-2.5">
                      {[
                        "Link curto e profissional",
                        "Melhor rankeamento no Google",
                        "Fácil de memorizar e compartilhar"
                      ].map((benefit, i) => (
                        <motion.li
                          key={i}
                          className="flex items-start gap-2.5 text-sm text-gray-700"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * i }}
                        >
                          <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                          {benefit}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </aside>

            {/* Form Container */}
            <div className="flex-1">
              <motion.div
                className="relative bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden group"
                whileHover={{ boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.15)" }}
                transition={{ duration: 0.3 }}
              >
                {/* Barra de cor superior */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 bg-[length:200%_auto] animate-gradient-x" />

                <div className="p-5 sm:p-6 lg:p-8">
                  <div className="flex items-center gap-2 mb-5 text-green-600 bg-green-50 w-fit px-3 py-1.5 rounded-full text-xs font-medium">
                    <Shield className="w-3.5 h-3.5" />
                    Alteração Segura
                  </div>

                  <UsernameForm onComplete={() => updateProgress(1)} />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Divider Elegante */}
        <div className="relative py-6 sm:py-8">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200/60" />
          </div>
          <div className="relative flex justify-center">
            <motion.span
              className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100"
              whileHover={{ scale: 1.1, rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <Sparkles className="w-5 h-5 text-purple-500" />
            </motion.span>
          </div>
        </div>

        {/* === SEÇÃO 2: APARÊNCIA === */}
        <motion.section
          className="relative scroll-mt-20"
          id="appearance"
          variants={fadeInUp}
        >
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">

            {/* Sidebar Info */}
            <aside className="lg:w-1/3 space-y-4 sm:space-y-6">
              <div className="lg:sticky lg:top-24">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-sm shadow-sm">
                    2
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Estilo Visual</h2>
                </div>

                <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4">
                  Crie uma página que prenda a atenção. Use cores, gradientes e imagens para se destacar.
                </p>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 sm:p-5 border border-purple-100/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Rocket className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">Dica Pro</span>
                  </div>
                  <p className="text-sm text-purple-900/80 leading-relaxed">
                    Páginas com fundo personalizado têm <span className="font-bold">3x mais engajamento</span>.
                    Use blur para um visual premium!
                  </p>
                </div>

                {/* Stats motivacionais - Mobile hidden */}
                <div className="hidden sm:grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                    <div className="text-2xl font-bold text-purple-600">40%</div>
                    <div className="text-xs text-gray-500">Mais retenção</div>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-gray-100 text-center">
                    <div className="text-2xl font-bold text-pink-600">2.5x</div>
                    <div className="text-xs text-gray-500">Mais cliques</div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Customization Form */}
            <div className="flex-1">
              <motion.div
                className="relative bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
                whileHover={{ boxShadow: "0 25px 50px -12px rgba(147, 51, 234, 0.15)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-[length:200%_auto] animate-gradient-x" />

                <div className="p-5 sm:p-6 lg:p-8">
                  <CustomizationForm onComplete={() => updateProgress(2)} />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Footer com dica */}
        <motion.footer
          className="mt-12 sm:mt-16 text-center pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>Dica: Compartilhe seu link nas redes sociais para ganhar mais visitas!</span>
          </div>
        </motion.footer>
      </motion.div>

      {/* CSS Global para animações */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-15px) translateX(-15px); }
          50% { transform: translateY(-25px) translateX(10px); }
          75% { transform: translateY(-5px) translateX(-5px); }
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-40px); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 30s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }

        /* Scrollbar customizada */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Mobile optimizations */
        @media (max-width: 640px) {
          .animate-float,
          .animate-float-delayed,
          .animate-float-slow {
            animation: none;
            opacity: 0.15;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .animate-float,
          .animate-float-delayed,
          .animate-float-slow,
          .animate-shimmer,
          .animate-gradient-x {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}