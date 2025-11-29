"use client";

import UsernameForm from "@/components/UsernameForm";
import CustomizationForm from "@/components/CustomizationForm";
import {
  Sparkles,
  Check,
  Zap,
  MessageCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Share2,
  Layout,
  Palette
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// === ANIMAÇÕES SUAVES ===
const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
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
    const saved = localStorage.getItem('freelink_progress');
    if (saved) setCompletedSteps(parseInt(saved));
  }, []);

  const updateProgress = (step: number) => {
    const newProgress = Math.max(completedSteps, step);
    setCompletedSteps(newProgress);
    localStorage.setItem('freelink_progress', newProgress.toString());
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] selection:bg-purple-100 selection:text-purple-900 font-sans text-gray-900 overflow-x-hidden">

      <motion.div
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {/* === HEADER PRINCIPAL === */}
        <motion.header className="mb-10 lg:mb-14" variants={fadeInUp}>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-3">
                Configurações
              </h1>
              <p className="text-gray-500 text-sm sm:text-[15px] leading-relaxed">
                Transforme sua página em uma experiência única. Personalize cada detalhe para refletir sua identidade e aumentar suas conversões.
              </p>
            </div>

            {/* Badge de Salvamento Automático */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50/80 border border-green-200 rounded-full shrink-0 w-fit">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[11px] font-semibold text-green-700 uppercase tracking-wide">
                Alterações salvas automaticamente.
              </span>
            </div>
          </div>

          {/* === PROGRESSO DO PERFIL === */}
          <div className="mt-8 sm:mt-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Nível do Perfil <span className="text-gray-400 font-normal hidden sm:inline">—</span> <span className="text-gray-500 font-normal text-xs sm:text-sm bg-gray-100 px-2 py-0.5 rounded-full">Passo {Math.min(completedSteps + 1, 2)} de 2</span>
              </span>
            </div>

            <div className="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gray-900"
                initial={{ width: 0 }}
                animate={{ width: `${(completedSteps / 2) * 100}%` }}
                transition={{ duration: 0.8, ease: "circOut" }}
              />
            </div>

            <p className="text-xs text-gray-500 mt-2 font-medium">
              {completedSteps === 0 && "🏁 Configure sua URL personalizada"}
              {completedSteps === 1 && "🎨 Defina seu estilo visual"}
              {completedSteps >= 2 && "🚀 Perfil configurado com sucesso!"}
            </p>
          </div>
        </motion.header>

        {/* Divisor */}
        <div className="w-full h-px bg-gray-200 mb-10 lg:mb-16" />

        {/* === SEÇÃO 1: URL E IDENTIDADE === */}
        <motion.section
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 mb-16 lg:mb-24 scroll-mt-24"
          id="identity"
          variants={fadeInUp}
        >
          {/* Sidebar (Texto + Dicas) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded bg-gray-100 text-gray-700 font-bold text-xs border border-gray-200">1</span>
                  <h2 className="text-lg font-bold text-gray-900">Sua Identidade</h2>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Escolha um nome curto, único e fácil de lembrar. É assim que seus seguidores vão encontrar — e clicar — no seu link.
                </p>
              </div>

              {/* Box: Por que isso importa? */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Layout className="w-3 h-3" /> Por que isso importa?
                </p>
                <ul className="space-y-3">
                  {[
                    "URL curta e profissional",
                    "Melhor posicionamento nas buscas",
                    "Fácil de memorizar e compartilhar"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13px] text-gray-600 font-medium">
                      <Check className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Conteúdo Principal (Formulário) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Seu Link Ativo</h3>
                  <div className="flex gap-2">
                     <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors">
                        <Copy className="w-3.5 h-3.5" /> Copiar
                     </button>
                     <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" /> Visitar
                     </button>
                     <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors">
                        <Share2 className="w-3.5 h-3.5" /> Compartilhar
                     </button>
                  </div>
                </div>

                {/* Input Wrapper */}
                <div className="mb-6">
                   <UsernameForm onComplete={() => updateProgress(1)} />
                </div>

                {/* Aviso */}
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100/60 text-xs text-amber-800 leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <p>
                    <span className="font-bold">Observação:</span> você pode alterar sua URL quando quiser, mas links antigos <strong className="text-amber-900">não</strong> serão redirecionados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* === SEÇÃO 2: ESTILO VISUAL === */}
        <motion.section
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 scroll-mt-24"
          id="style"
          variants={fadeInUp}
        >
          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded bg-gray-100 text-gray-700 font-bold text-xs border border-gray-200">2</span>
                  <h2 className="text-lg font-bold text-gray-900">Estilo Visual</h2>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Sua página é o seu cartão de visitas. Crie algo marcante para capturar a atenção — e converter muito mais.
                </p>
              </div>

              {/* Box: Dica Pro (Dark Theme) */}
              <div className="bg-gray-900 rounded-xl p-5 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-300">Dica Pro</span>
                </div>

                <p className="text-[13px] text-gray-300 mb-5 leading-relaxed">
                  Páginas com fundo personalizado e identidade visual forte registram:
                </p>

                <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-4">
                  <div>
                    <span className="block text-xl font-bold text-white tracking-tight">+40%</span>
                    <span className="text-[10px] uppercase text-gray-500 font-bold">de retenção</span>
                  </div>
                  <div>
                    <span className="block text-xl font-bold text-white tracking-tight">2.5x</span>
                    <span className="text-[10px] uppercase text-gray-500 font-bold">mais cliques</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Conteúdo Principal (Editor) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 sm:p-8">
                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                  <Palette className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Editor Visual</h3>
                </div>

                <div className="space-y-6">
                   <p className="text-sm text-gray-600">Personalize toda a aparência do seu link.</p>

                   {/* Customization Form */}
                   <CustomizationForm onComplete={() => updateProgress(2)} />
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* === FOOTER === */}
        <motion.footer
          className="mt-20 border-t border-gray-200 pt-8 pb-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 shadow-sm hover:shadow-md transition-all cursor-default group">
            <MessageCircle className="w-3.5 h-3.5 text-purple-600 group-hover:scale-110 transition-transform" />
            <span>Dica: Compartilhe seu link nas redes sociais para maximizar seu alcance.</span>
          </div>
          <p className="mt-6 text-[11px] font-medium text-gray-400">
            Feito com 💜 <span className="text-gray-600">freelinnk.com</span>
          </p>
        </motion.footer>

      </motion.div>
    </div>
  );
}