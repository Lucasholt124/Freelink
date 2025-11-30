"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { SignInButton, useAuth } from "@clerk/nextjs";
import {
  ArrowRight, CheckCircle, Star, Shield,
  Zap, ImagePlus, TrendingUp, DollarSign, Wand2,
  Check, Instagram, Linkedin,
  Target, Sparkles, MessageCircle,
  Scissors, Palette, Calculator,
  Film, Flame, Bell, Link2, BarChart3,
  Globe, MousePointerClick, Clock, MapPin,
  Smartphone, Monitor, Copy, ExternalLink
} from "lucide-react";
import clsx from "clsx";

// --- CONFIGURAÇÕES VISUAIS ---
const BRAND = {
  primary: "#4745d9",
  secondary: "#7c3aed",
  gradient: "bg-gradient-to-r from-[#4745d9] to-[#7c3aed]",
  textGradient: "bg-clip-text text-transparent bg-gradient-to-r from-[#4745d9] to-[#7c3aed]",
};

// --- DADOS DO COMPARATIVO ---
interface CompetitorRow {
  f: string;
  fl: string;
  lt: string;
  bc: string;
}

const competitors: CompetitorRow[] = [
  { f: "Página de Links", fl: "✅ Grátis", lt: "✅ Grátis", bc: "✅ Grátis" },
  { f: "Encurtador de Links", fl: "✅ Grátis", lt: "❌", bc: "Limitado" },
  { f: "Analytics Básico", fl: "✅ Grátis", lt: "✅ Grátis", bc: "✅ Grátis" },
  { f: "IA para Criar Bio", fl: "⭐⭐ Ultra", lt: "❌", bc: "❌" },
  { f: "Brain Roteirista", fl: "⭐ Pro", lt: "❌", bc: "❌" },
  { f: "Analytics Avançado", fl: "⭐ Pro", lt: "💰 Pago", bc: "💰 Pago" },
  { f: "Geolocalização", fl: "⭐⭐ Ultra", lt: "💰 Pago", bc: "❌" },
  { f: "Gestão Financeira", fl: "⭐⭐ Ultra", lt: "❌", bc: "❌" },
  { f: "Remoção de Fundo IA", fl: "⭐⭐ Ultra", lt: "❌", bc: "❌" },
  { f: "Preço Plano Ultra", fl: "R$ 77,90/mês", lt: "R$ 45/mês", bc: "R$ 50/mês" },
];

// --- COMPONENTE BUTTON CUSTOMIZADO ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "white" | "ghost" | "destructive" | "secondary" | "link";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = "default",
  size = "md",
  className,
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    default: `${BRAND.gradient} text-white hover:opacity-90 focus:ring-[#4745d9] shadow-lg shadow-purple-500/25`,
    outline: "bg-transparent border-2 border-gray-200 text-gray-700 hover:border-[#4745d9] hover:text-[#4745d9]",
    white: "bg-white text-gray-900 hover:bg-gray-100 shadow-xl",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    link: "bg-transparent text-[#4745d9] underline-offset-4 hover:underline",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};

// --- COMPONENTES DE ANIMAÇÃO ---
const ScrollReveal = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, type: "spring", bounce: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

// --- SIMULADORES ---

// 1. HERO IPHONE
const HeroSimulator = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setStep((s) => (s + 1) % 4), 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto w-[300px] h-[620px] bg-white rounded-[3.5rem] p-3 shadow-[0_30px_60px_-15px_rgba(71,69,217,0.3)] border-[8px] border-gray-900 ring-1 ring-gray-200 z-10 overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
      <div className="absolute top-0 inset-x-0 h-7 bg-white z-20 flex justify-center"><div className="w-24 h-5 bg-black rounded-b-xl"></div></div>

      <div className="w-full h-full pt-8 relative font-sans bg-gray-50 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full p-6 space-y-6">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center animate-bounce">
                <Sparkles className="w-10 h-10 text-[#4745d9]" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-black text-2xl text-gray-900">Freelinnk AI</h3>
                <p className="text-sm text-gray-500">Qual seu objetivo hoje?</p>
              </div>
              <div className="w-full bg-white p-4 rounded-2xl border-2 border-[#4745d9]/20 shadow-lg flex items-center gap-3">
                <div className="w-1 h-5 bg-[#4745d9] animate-pulse"></div>
                <span className="text-sm text-gray-600 font-medium">Link para Vender Curso...</span>
              </div>
              <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} className="h-1.5 bg-[#4745d9] rounded-full w-full mt-4"></motion.div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#4745d9] flex flex-col items-center justify-center text-white p-6">
              <Wand2 className="w-16 h-16 animate-spin mb-6 opacity-80" />
              <h3 className="font-bold text-2xl mb-8">Criando Página...</h3>
              <div className="space-y-4 w-full">
                <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                    <div className="bg-green-400 p-1 rounded-full"><Check size={12} className="text-black"/></div>
                    <span className="font-bold text-sm">Gerando Copywriting</span>
                </motion.div>
                <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                    <div className="bg-green-400 p-1 rounded-full"><Check size={12} className="text-black"/></div>
                    <span className="font-bold text-sm">Design Mobile-First</span>
                </motion.div>
                <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="flex items-center gap-3 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                    <div className="bg-green-400 p-1 rounded-full"><Check size={12} className="text-black"/></div>
                    <span className="font-bold text-sm">Configurando Pixel</span>
                </motion.div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="absolute inset-0 bg-slate-50 flex flex-col overflow-hidden">
              <div className="h-40 bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809')] bg-cover relative">
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                  <div className="p-1 bg-white rounded-full">
                    <img src="https://i.pravatar.cc/150?img=32" className="w-24 h-24 rounded-full object-cover border-4 border-white" alt="User"/>
                  </div>
                </div>
              </div>
              <div className="mt-12 text-center px-6">
                <h3 className="font-black text-xl text-gray-900">Ana Creator 🇧🇷</h3>
                <p className="text-xs text-gray-500 mt-1">Ensino você a monetizar sua audiência.</p>
                <div className="mt-6 space-y-3">
                    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="w-full p-4 bg-gradient-to-r from-[#4745d9] to-[#7c3aed] text-white rounded-2xl shadow-lg shadow-purple-500/20 text-sm font-bold flex justify-between items-center transform hover:scale-105 transition-transform cursor-pointer">
                        <span>🔥 Mentoria VIP</span>
                        <ArrowRight size={16}/>
                    </motion.div>
                    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 }} className="w-full p-4 bg-white border border-gray-200 text-gray-700 rounded-2xl text-sm font-bold flex justify-between items-center shadow-sm">
                        <span>📚 E-book Gratuito</span>
                        <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full">Free</span>
                    </motion.div>
                    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.6 }} className="flex justify-center gap-4 mt-2">
                        <div className="p-2 bg-white rounded-full shadow-sm border border-gray-100"><Instagram size={20} className="text-pink-600"/></div>
                        <div className="p-2 bg-white rounded-full shadow-sm border border-gray-100"><MessageCircle size={20} className="text-green-600"/></div>
                    </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/80 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6">
              <motion.div initial={{ scale: 0.5, y: 50 }} animate={{ scale: 1, y: 0 }} className="bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 w-full text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-1">Venda Aprovada!</h2>
                <p className="text-gray-500 text-xs mb-6">Há 2 minutos via Link na Bio</p>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">Valor Líquido</p>
                    <p className="text-4xl font-black text-[#4745d9]">R$ 97,00</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// 2. BRAIN DIRECTOR SIMULATOR
const BrainDirectorSimulator = () => {
  return (
    <div className="bg-[#0f0f12] text-white rounded-3xl overflow-hidden shadow-2xl border border-gray-800 font-sans relative aspect-[16/10]">
      <div className="flex items-center justify-between p-4 bg-[#18181b] border-b border-gray-800">
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Modo Diretor: ATIVO ⚡</span>
        </div>
        <div className="bg-[#7c3aed] text-[10px] font-bold px-2 py-1 rounded text-white">95% VIRAL 🔥</div>
      </div>

      <div className="flex h-full">
        <div className="w-1/2 p-4 border-r border-gray-800 space-y-4">
            <div className="bg-[#1f1f23] p-3 rounded-xl border border-gray-700">
                <div className="flex justify-between mb-2">
                    <span className="text-[10px] text-gray-400">00:00 - 00:03</span>
                    <span className="text-[10px] text-red-400 font-bold">Gancho Viral</span>
                </div>
                <p className="text-xs font-bold text-white leading-relaxed">Pare de perder tempo com código ruim e aprenda como criar aplicações escaláveis!</p>
                <div className="mt-2 flex gap-2">
                    <span className="text-[9px] bg-black/50 px-2 py-1 rounded text-gray-300">📹 Lente Wide</span>
                    <span className="text-[9px] bg-black/50 px-2 py-1 rounded text-gray-300">🔊 SFX: Relógio</span>
                </div>
            </div>
            <div className="bg-[#1f1f23] p-3 rounded-xl border border-gray-700 opacity-50">
                <div className="flex justify-between mb-2">
                    <span className="text-[10px] text-gray-400">00:03 - 00:10</span>
                    <span className="text-[10px] text-yellow-400 font-bold">Conteúdo</span>
                </div>
                <p className="text-xs text-white">Mostre a tela do computador...</p>
            </div>
        </div>

        <div className="w-1/2 p-4 bg-[#18181b]">
            <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-gray-300">Novembro 2025</span>
                <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-500/20">9 Agendados</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center border ${i === 3 ? 'bg-[#4745d9] border-[#4745d9]' : 'bg-[#27272a] border-gray-700'}`}
                    >
                        <span className="text-[10px] font-bold">{i + 10}</span>
                        {i === 3 ? <Instagram size={10} className="mt-1"/> : <div className="w-1 h-1 bg-gray-500 rounded-full mt-1"></div>}
                    </motion.div>
                ))}
            </div>
            <div className="mt-4 p-2 bg-[#27272a] rounded-lg border border-gray-700">
                <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">Timing de Ouro</p>
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">Hoje às 14:00</span>
                    <Bell size={10} className="text-yellow-400"/>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// 3. FINANCE PRO SIMULATOR
const FinanceProSimulator = () => {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 font-sans p-6 relative overflow-hidden group hover:shadow-2xl transition-shadow duration-300">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="font-black text-xl text-gray-900">Gestão PRO</h4>
          <p className="text-xs text-gray-500">Acabou papel e caneta! 🚀</p>
        </div>
        <div className="text-right">
          <div className="bg-[#4745d9] text-white text-[10px] font-bold px-3 py-1 rounded-full inline-block shadow-lg shadow-blue-500/30">Nível 2 • 15/100 XP</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-center">
            <span className="text-[10px] text-gray-500 uppercase font-bold">Vendas</span>
            <p className="text-lg font-black text-blue-600">R$ 14k</p>
        </div>
        <div className="bg-red-50 p-3 rounded-2xl border border-red-100 text-center">
            <span className="text-[10px] text-gray-500 uppercase font-bold">Gastos</span>
            <p className="text-lg font-black text-red-500">R$ 2k</p>
        </div>
        <div className="bg-green-50 p-3 rounded-2xl border border-green-100 text-center">
            <span className="text-[10px] text-gray-500 uppercase font-bold">Lucro</span>
            <p className="text-lg font-black text-green-600">R$ 12k</p>
        </div>
      </div>

      <div className="relative h-32 bg-gray-50 rounded-2xl border border-gray-100 p-4 flex items-end gap-2 overflow-hidden">
         {[20, 35, 60, 40, 75, 50, 90].map((h, i) => (
            <motion.div
                key={i}
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className="flex-1 bg-gradient-to-t from-[#4745d9] to-[#7c3aed] rounded-t-md opacity-80 hover:opacity-100 transition-opacity relative group"
            >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">R${h}0</div>
            </motion.div>
         ))}
      </div>
    </div>
  );
};

// 4. MENTOR IA
const MentorSimulator = () => {
  return (
    <div className="bg-gray-900 rounded-3xl p-5 border border-gray-800 text-white relative overflow-hidden">
        <div className="mb-4">
            <h4 className="font-bold">Gerador de Arte IA</h4>
            <p className="text-xs text-gray-400">Digite em português e crie.</p>
        </div>
        <div className="bg-gray-800 p-3 rounded-xl border border-gray-700 mb-3 flex justify-between items-center">
            <span className="text-xs text-gray-300">Gato astronauta cyberpunk...</span>
            <div className="w-2 h-2 bg-[#7c3aed] rounded-full animate-pulse"></div>
        </div>
        <div className="flex gap-2 mb-4 overflow-hidden">
            {["Realista", "3D", "Anime", "Vintage"].map((tag, i) => (
                <span key={i} className={`text-[9px] px-2 py-1 rounded border ${i === 0 ? 'bg-[#4745d9] border-[#4745d9]' : 'border-gray-600 text-gray-400'}`}>{tag}</span>
            ))}
        </div>
        <div className="aspect-video bg-black rounded-xl relative overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" alt="AI Art"/>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs font-bold border border-white/20 group-hover:opacity-0 transition-opacity">Gerando...</div>
            </div>
        </div>
    </div>
  )
}

// 5. AI STUDIO PRO SIMULATOR
const AiStudioSimulator = () => {
    const [tab, setTab] = useState(0);
    const tabs = [
        { id: 0, icon: <MessageCircle size={14}/>, label: "Chat" },
        { id: 1, icon: <ImagePlus size={14}/>, label: "Upscale" },
        { id: 2, icon: <Scissors size={14}/>, label: "Remove BG" },
    ];

    useEffect(() => {
        const i = setInterval(() => setTab(t => (t + 1) % 3), 3000);
        return () => clearInterval(i);
    }, []);

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 aspect-[4/3] flex flex-col">
            <div className="flex justify-around mb-4 bg-gray-50 p-1 rounded-xl">
                {tabs.map((t) => (
                    <div key={t.id} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === t.id ? 'bg-white text-[#4745d9] shadow-sm' : 'text-gray-400'}`}>
                        {t.icon} {t.label}
                    </div>
                ))}
            </div>
            <div className="flex-1 bg-gray-50 rounded-2xl relative overflow-hidden border border-gray-200">
                <AnimatePresence mode="wait">
                    {tab === 0 && (
                        <motion.div key="chat" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="p-4 space-y-2">
                            <div className="bg-white p-2 rounded-lg rounded-tl-none text-xs text-gray-600 w-3/4 shadow-sm">Crie uma legenda para vender...</div>
                            <div className="bg-[#4745d9] p-2 rounded-lg rounded-tr-none text-xs text-white w-3/4 ml-auto shadow-sm">Aqui está: Desbloqueie seu potencial...</div>
                        </motion.div>
                    )}
                    {tab === 1 && (
                        <motion.div key="upscale" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?q=80&w=400')] bg-cover blur-[2px]"></div>
                            <motion.div initial={{width:0}} animate={{width:"100%"}} transition={{duration:2}} className="absolute left-0 h-full bg-[url('https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?q=80&w=400')] bg-cover border-r-2 border-white"></motion.div>
                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded">4K Ready</div>
                        </motion.div>
                    )}
                    {tab === 2 && (
                        <motion.div key="bg" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                            <img src="https://pngimg.com/d/sneakers_PNG98664.png" className="w-2/3 drop-shadow-xl" alt="Remove BG"/>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

// 6. URL SHORTENER SIMULATOR (NOVO!)
const UrlShortenerSimulator = () => {
    const [copied, setCopied] = useState(false);
    const [showStats, setShowStats] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setShowStats(s => !s);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-xl">
                    <Link2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900">Encurtador de Links</h4>
                    <p className="text-xs text-gray-500">Links curtos + Analytics completo</p>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {!showStats ? (
                    <motion.div
                        key="shortener"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        {/* Input URL */}
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">URL Original</p>
                            <p className="text-xs text-gray-600 truncate">https://meusite.com/produto/curso-marketing-digital-completo-2025</p>
                        </div>

                        {/* Output URL */}
                        <div className="bg-[#4745d9]/5 rounded-xl p-3 border-2 border-[#4745d9]/20">
                            <p className="text-[10px] text-[#4745d9] uppercase font-bold mb-1">Link Encurtado</p>
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-black text-[#4745d9]">frlnk.io/curso25</p>
                                <button
                                    onClick={handleCopy}
                                    className={`p-2 rounded-lg transition-all ${copied ? 'bg-green-100 text-green-600' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {copied ? <Check size={14}/> : <Copy size={14}/>}
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats Preview */}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-gray-50 p-2 rounded-lg text-center">
                                <p className="text-lg font-black text-gray-900">1.2k</p>
                                <p className="text-[9px] text-gray-500">Cliques</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-lg text-center">
                                <p className="text-lg font-black text-gray-900">4.2%</p>
                                <p className="text-[9px] text-gray-500">CTR</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-lg text-center">
                                <p className="text-lg font-black text-green-600">+23%</p>
                                <p className="text-[9px] text-gray-500">vs ontem</p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="stats"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-3"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-700">Últimos cliques em tempo real</span>
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        </div>

                        {[
                            { city: "São Paulo, BR", device: "iPhone", time: "agora" },
                            { city: "Lisboa, PT", device: "Android", time: "2min" },
                            { city: "Miami, US", device: "Desktop", time: "5min" },
                        ].map((click, i) => (
                            <motion.div
                                key={i}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: i * 0.15 }}
                                className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
                            >
                                <div className="flex items-center gap-2">
                                    <MapPin size={12} className="text-gray-400"/>
                                    <span className="text-xs font-medium text-gray-700">{click.city}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {click.device === "iPhone" || click.device === "Android" ?
                                        <Smartphone size={10} className="text-gray-400"/> :
                                        <Monitor size={10} className="text-gray-400"/>
                                    }
                                    <span className="text-[10px] text-gray-500">{click.time}</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// 7. ANALYTICS SIMULATOR (NOVO!)
const AnalyticsSimulator = () => {
    const [activeMetric, setActiveMetric] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveMetric(m => (m + 1) % 3);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#4745d9]/30 rounded-full blur-[60px]"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#7c3aed]/20 rounded-full blur-[40px]"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-xl backdrop-blur">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h4 className="font-bold">Analytics em Tempo Real</h4>
                            <p className="text-xs text-gray-400">Dados precisos de cada clique</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="text-[10px] text-green-400 font-bold">LIVE</span>
                    </div>
                </div>

                {/* Main Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                        { label: "Visualizações", value: "12.4k", change: "+18%", icon: <Globe size={14}/> },
                        { label: "Cliques", value: "3.2k", change: "+24%", icon: <MousePointerClick size={14}/> },
                        { label: "Conversões", value: "847", change: "+31%", icon: <Target size={14}/> },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: activeMetric === i ? 1.05 : 1,
                                borderColor: activeMetric === i ? '#4745d9' : 'transparent'
                            }}
                            className="bg-white/5 backdrop-blur p-3 rounded-xl border-2 border-transparent transition-all"
                        >
                            <div className="flex items-center gap-1 text-gray-400 mb-1">
                                {stat.icon}
                                <span className="text-[10px]">{stat.label}</span>
                            </div>
                            <p className="text-xl font-black">{stat.value}</p>
                            <span className="text-[10px] text-green-400 font-bold">{stat.change}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Geographic Distribution */}
                <div className="bg-white/5 backdrop-blur rounded-xl p-4 mb-4">
                    <p className="text-xs font-bold text-gray-400 mb-3">📍 Top Localizações</p>
                    <div className="space-y-2">
                        {[
                            { country: "🇧🇷 Brasil", percent: 68 },
                            { country: "🇵🇹 Portugal", percent: 15 },
                            { country: "🇺🇸 EUA", percent: 10 },
                        ].map((loc, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-xs w-20">{loc.country}</span>
                                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${loc.percent}%` }}
                                        transition={{ duration: 1, delay: i * 0.2 }}
                                        className="h-full bg-gradient-to-r from-[#4745d9] to-[#7c3aed] rounded-full"
                                    />
                                </div>
                                <span className="text-xs font-bold w-10 text-right">{loc.percent}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Device & Time */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 backdrop-blur rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 mb-2">📱 Dispositivos</p>
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <div className="flex justify-between text-[10px] mb-1">
                                    <span>Mobile</span>
                                    <span className="font-bold">72%</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-[72%] bg-blue-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur rounded-xl p-3">
                        <p className="text-[10px] text-gray-400 mb-2">⏰ Melhor Horário</p>
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-yellow-400"/>
                            <span className="font-bold">14h - 16h</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- PÁGINA PRINCIPAL ---

export default function LandingPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) router.push("/dashboard");
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="bg-white text-gray-900 font-sans selection:bg-[#4745d9] selection:text-white overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 h-20 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-2xl font-black shadow-lg ${BRAND.gradient} group-hover:scale-105 transition-transform`}>F</div>
            <span className="text-xl font-bold tracking-tight text-gray-900">Freelinnk</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium text-gray-600 text-sm">
            <a href="#features" className="hover:text-[#4745d9] transition-colors">Funcionalidades</a>
            <a href="#analytics" className="hover:text-[#4745d9] transition-colors">Analytics</a>
            <a href="#comparison" className="hover:text-[#4745d9] transition-colors">Comparativo</a>
          </div>
          <div className="flex items-center gap-3">
            <SignInButton mode="modal">
              <button className="font-bold text-gray-600 hover:text-[#4745d9] px-4 py-2 text-sm transition-colors">Entrar</button>
            </SignInButton>
            <SignInButton mode="modal">
              <Button size="sm" variant="default" className="hidden sm:inline-flex">Começar Grátis</Button>
            </SignInButton>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-blue-50/80 rounded-full blur-[100px]" />
            <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] bg-purple-50/80 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                <div className="text-center lg:text-left">
                    <ScrollReveal>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs font-bold text-green-700 mb-6 shadow-sm">
                            <CheckCircle className="w-3 h-3" />
                            100% Grátis • Sem cartão de crédito
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6 text-slate-900">
                            O Link na Bio que <br />
                            <span className={BRAND.textGradient}>
                                Trabalha por você.
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-600 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
                            Pare de perder dinheiro com páginas estáticas. O Freelinnk usa <strong>IA</strong> para criar sua bio em 30s, gerar conteúdo viral e multiplicar seus lucros.
                        </p>

                        <div className="max-w-md mx-auto lg:mx-0 bg-white p-2 rounded-2xl shadow-xl border border-gray-100 flex flex-col sm:flex-row gap-2 transform hover:scale-[1.01] transition-transform">
                            <div className="flex-1 bg-gray-50 rounded-xl px-4 flex items-center h-12 sm:h-auto border border-transparent focus-within:border-[#4745d9] transition-colors">
                                <span className="text-gray-400 font-bold text-sm mr-1">freelinnk.com/</span>
                                <input type="text" placeholder="seu-nome" className="bg-transparent border-none outline-none font-bold text-gray-900 w-full placeholder:text-gray-300" />
                            </div>
                            <SignInButton mode="modal">
                                <Button className="w-full sm:w-auto whitespace-nowrap shadow-md">Criar Grátis</Button>
                            </SignInButton>
                        </div>
                        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-xs text-gray-500 font-medium">
                            <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-500"/> Página Grátis para sempre</span>
                            <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-500"/> Analytics completo</span>
                            <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-500"/> Encurtador incluso</span>
                        </div>
                    </ScrollReveal>
                </div>

                <div className="relative flex justify-center">
                    <ScrollReveal delay={0.2}>
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-gradient-to-tr from-[#4745d9]/20 to-[#7c3aed]/20 rounded-full blur-[80px] -z-10 animate-pulse"></div>
                       <HeroSimulator />

                       <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute top-24 -left-10 bg-white p-3 rounded-2xl shadow-xl border border-gray-100 hidden md:flex items-center gap-3 z-20">
                          <div className="bg-green-100 p-2 rounded-xl"><TrendingUp className="text-green-600 w-5 h-5"/></div>
                          <div><p className="text-[10px] text-gray-500 font-bold uppercase">Conversão</p><p className="text-sm font-black text-gray-900">+127%</p></div>
                       </motion.div>

                       <motion.div animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="absolute bottom-32 -right-10 bg-white p-3 rounded-2xl shadow-xl border border-gray-100 hidden md:flex items-center gap-3 z-20">
                          <div className="bg-purple-100 p-2 rounded-xl"><Sparkles className="text-purple-600 w-5 h-5"/></div>
                          <div><p className="text-[10px] text-gray-500 font-bold uppercase">IA Ativa</p><p className="text-sm font-black text-gray-900">Otimizando</p></div>
                       </motion.div>
                    </ScrollReveal>
                </div>
            </div>
        </div>
      </section>

      {/* PROVA SOCIAL */}
      <section className="py-12 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Usado por +10.000 criadores</p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 mb-12">
               <div className="flex items-center gap-2 font-bold text-xl"><Instagram size={24}/> Instagram</div>
               <div className="flex items-center gap-2 font-bold text-xl"><span className="font-serif">TikTok</span></div>
               <div className="flex items-center gap-2 font-bold text-xl text-[#0A66C2]"><Linkedin size={24}/> LinkedIn</div>
               <div className="flex items-center gap-2 font-bold text-xl text-green-600">WhatsApp</div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {[
                    { text: "Eu pagava Designer e Copywriter. Agora o Freelinnk faz tudo de graça.", author: "Júlia Mendes", role: "Influencer", img: "https://i.pravatar.cc/150?img=5" },
                    { text: "O Analytics me mostrou que 70% dos cliques vinham do celular. Otimizei e vendi mais.", author: "Carlos E.", role: "Afiliado", img: "https://i.pravatar.cc/150?img=11" },
                    { text: "O encurtador de links me dá dados que antes eu pagava caro pra ter.", author: "Ana P.", role: "Nutricionista", img: "https://i.pravatar.cc/150?img=9" }
                ].map((t, i) => (
                    <motion.div key={i} whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                        <div className="flex gap-1 mb-4">{[1,2,3,4,5].map(s => <Star key={s} size={14} className="text-yellow-400 fill-yellow-400"/>)}</div>
                        <p className="text-gray-700 text-sm italic mb-4 leading-relaxed">&quot;{t.text}&quot;</p>
                        <div className="flex items-center gap-3">
                            <img src={t.img} alt={t.author} className="w-10 h-10 rounded-full border border-gray-100"/>
                            <div><p className="font-bold text-sm">{t.author}</p><p className="text-xs text-gray-500">{t.role}</p></div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 space-y-32">

            {/* ENCURTADOR DE LINKS (NOVO!) */}
            <ScrollReveal>
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold mb-4"><Link2 size={14}/> Encurtador Profissional</div>
                      <h2 className="text-3xl md:text-4xl font-black mb-4 text-gray-900">Links curtos. <br/>Dados completos.</h2>
                      <p className="text-gray-600 text-lg mb-6">Transforme URLs gigantes em links memoráveis. Cada clique é rastreado com precisão cirúrgica: localização, dispositivo, horário e muito mais.</p>
                      <ul className="space-y-3 mb-6">
                          <li className="flex gap-3 text-sm text-gray-700 items-center"><CheckCircle className="text-green-500 w-5 h-5"/> Links ilimitados grátis</li>
                          <li className="flex gap-3 text-sm text-gray-700 items-center"><CheckCircle className="text-green-500 w-5 h-5"/> Domínio personalizado (frlnk.io/seu-link)</li>
                          <li className="flex gap-3 text-sm text-gray-700 items-center"><CheckCircle className="text-green-500 w-5 h-5"/> QR Code automático</li>
                          <li className="flex gap-3 text-sm text-gray-700 items-center"><CheckCircle className="text-green-500 w-5 h-5"/> Rastreamento em tempo real</li>
                      </ul>
                      <SignInButton mode="modal">
                        <Button variant="outline">Criar Link Agora <ExternalLink size={14} className="ml-2"/></Button>
                      </SignInButton>
                  </div>
                  <div className="flex justify-center w-full">
                      <UrlShortenerSimulator />
                  </div>
              </div>
            </ScrollReveal>

            {/* ANALYTICS (NOVO!) */}
            <ScrollReveal>
              <div id="analytics" className="grid lg:grid-cols-2 gap-16 items-center">
                  <div className="order-2 lg:order-1">
                      <AnalyticsSimulator />
                  </div>
                  <div className="order-1 lg:order-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold mb-4"><BarChart3 size={14}/> Analytics Avançado</div>
                      <h2 className="text-3xl md:text-4xl font-black mb-4 text-gray-900">Saiba exatamente <br/>de onde vem cada clique.</h2>
                      <p className="text-gray-600 text-lg mb-6">Chega de achismo. Veja em tempo real quem acessa sua página, de qual cidade, dispositivo e horário. Dados que outras plataformas cobram caro.</p>
                      <ul className="space-y-3 mb-6">
                          <li className="flex gap-3 text-sm text-gray-700 items-center"><CheckCircle className="text-green-500 w-5 h-5"/> Geolocalização precisa (cidade/país)</li>
                          <li className="flex gap-3 text-sm text-gray-700 items-center"><CheckCircle className="text-green-500 w-5 h-5"/> Dispositivo e navegador</li>
                          <li className="flex gap-3 text-sm text-gray-700 items-center"><CheckCircle className="text-green-500 w-5 h-5"/> Horários de pico de acesso</li>
                          <li className="flex gap-3 text-sm text-gray-700 items-center"><CheckCircle className="text-green-500 w-5 h-5"/> Taxa de conversão por link</li>
                          <li className="flex gap-3 text-sm text-gray-700 items-center"><CheckCircle className="text-green-500 w-5 h-5"/> Exportar relatórios em PDF</li>
                      </ul>
                      <SignInButton mode="modal">
                        <Button variant="outline">Ver Meus Dados <BarChart3 size={14} className="ml-2"/></Button>
                      </SignInButton>
                  </div>
              </div>
            </ScrollReveal>

            {/* BRAIN DIRECTOR */}
            <ScrollReveal>
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div className="order-2 lg:order-1 relative group">
                      <div className="absolute inset-0 bg-red-500/10 blur-3xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity"></div>
                      <BrainDirectorSimulator />
                  </div>
                  <div className="order-1 lg:order-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold mb-4"><Film size={14}/> Modo Diretor de Cinema</div>
                      <h2 className="text-3xl md:text-4xl font-black mb-4 text-gray-900">Brain Freelinnk: <br/>Sua IA Roteirista.</h2>
                      <p className="text-gray-600 text-lg mb-6">O Brain não apenas dá ideias. Ele cria roteiros técnicos (ângulo, luz, copy) e organiza seu calendário. Receba notificações push para nunca perder o timing.</p>
                      <ul className="space-y-3 mb-6">
                          <li className="flex gap-3 text-sm text-gray-700 items-center"><CheckCircle className="text-green-500 w-5 h-5"/> Sugestões de Roteiro Viral</li>
                          <li className="flex gap-3 text-sm text-gray-700 items-center"><CheckCircle className="text-green-500 w-5 h-5"/> Calendário Visual com Drag & Drop</li>
                          <li className="flex gap-3 text-sm text-gray-700 items-center"><CheckCircle className="text-green-500 w-5 h-5"/> Notificações Push no Navegador</li>
                      </ul>
                      <SignInButton mode="modal">
                        <Button variant="outline">Experimentar Grátis</Button>
                      </SignInButton>
                  </div>
              </div>
            </ScrollReveal>

            {/* FINANCEIRO */}
            <ScrollReveal>
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold mb-4"><Calculator size={14}/> Gestão Financeira Completa</div>
                      <h2 className="text-3xl md:text-4xl font-black mb-4 text-gray-900">Jogue fora o Excel.</h2>
                      <p className="text-gray-600 text-lg mb-6">Substitua o caderninho. Cadastre produtos, custos e veja seu lucro líquido real. Gamificação com Níveis e XP para te motivar a vender mais todo dia.</p>
                      <SignInButton mode="modal">
                        <Button variant="outline">Começar Grátis</Button>
                      </SignInButton>
                  </div>
                  <div className="flex justify-center w-full"><FinanceProSimulator /></div>
              </div>
            </ScrollReveal>

            {/* AI STUDIO & MENTOR */}
            <div className="grid lg:grid-cols-2 gap-8">
                <ScrollReveal delay={0.2}>
                    <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 h-full hover:border-[#4745d9] transition-colors group">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-purple-100 p-2 rounded-lg"><Zap className="text-purple-600 w-5 h-5"/></div>
                            <h3 className="font-bold text-xl">AI Studio Pro</h3>
                        </div>
                        <p className="text-gray-600 mb-6 text-sm">4 ferramentas em 1. Chat Inteligente, Aprimorador de Imagens 4K, Transcrição de Áudio e Removedor de Fundo.</p>
                        <div className="flex justify-center"><AiStudioSimulator/></div>
                    </div>
                </ScrollReveal>

                <ScrollReveal delay={0.4}>
                    <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 h-full text-white hover:shadow-2xl transition-shadow relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-4 relative z-10">
                            <div className="bg-pink-500/20 p-2 rounded-lg"><Palette className="text-pink-500 w-5 h-5"/></div>
                            <h3 className="font-bold text-xl">Mentor.ia</h3>
                        </div>
                        <p className="text-gray-400 mb-6 text-sm relative z-10">Gere imagens profissionais para seus posts. Escolha o estilo (Anime, 3D, Realista) e crie.</p>
                        <div className="flex justify-center relative z-10"><MentorSimulator/></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px]"></div>
                    </div>
                </ScrollReveal>
            </div>
        </div>
      </section>

      {/* COMPARATIVO */}
      <section id="comparison" className="py-20 bg-slate-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-black text-gray-900">Por que somos a escolha óbvia?</h2>
                <p className="text-gray-600">Tudo grátis. Compare e veja.</p>
            </div>
            <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                                <th className="p-5 pl-8 font-bold">Recurso</th>
                                <th className="p-5 text-center text-[#4745d9] bg-blue-50/50 font-black text-sm border-x border-gray-100">Freelinnk ⚡</th>
                                <th className="p-5 text-center font-bold">Linktree</th>
                                <th className="p-5 text-center font-bold">Beacons</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-700">
                            {competitors.map((row, i) => (
                                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="p-5 pl-8 font-bold">{row.f}</td>
                                    <td className="p-5 text-center font-bold bg-blue-50/30 text-gray-900 border-x border-gray-100">{row.fl}</td>
                                    <td className="p-5 text-center text-gray-500">{row.lt}</td>
                                    <td className="p-5 text-center text-gray-500">{row.bc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
            <ScrollReveal>
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 border border-green-200 rounded-full px-4 py-2 text-sm font-bold mb-6">
                    <Flame className="w-4 h-4" /> Já são +10.000 criadores usando
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-6 text-gray-900">
                    Pronto para multiplicar seus resultados?
                </h2>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    Crie sua página grátis em menos de 30 segundos. Sem cartão, sem compromisso.
                </p>

                <SignInButton mode="modal">
                    <Button size="lg" className="px-12 text-lg">
                        Criar Minha Página Grátis <ArrowRight className="ml-2"/>
                    </Button>
                </SignInButton>

                <p className="mt-6 text-sm text-gray-500 flex justify-center gap-6">
                    <span className="flex items-center gap-2"><Shield size={14}/> Seus dados seguros</span>
                    <span className="flex items-center gap-2"><Target size={14}/> Cancele quando quiser</span>
                </p>
            </ScrollReveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white pt-16 pb-10">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12 text-sm">
            <div className="col-span-1">
                <div className="flex items-center gap-2 mb-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold ${BRAND.gradient}`}>F</div>
                    <span className="font-bold text-xl">Freelinnk</span>
                </div>
                <p className="text-gray-500 mb-4">O sistema operacional do criador moderno. Feito com 💜 no Brasil.</p>
                <div className="flex gap-4 opacity-60">
                    <Instagram className="cursor-pointer hover:text-[#4745d9]"/>
                    <Linkedin className="cursor-pointer hover:text-[#0A66C2]"/>
                    <MessageCircle className="cursor-pointer hover:text-green-500"/>
                </div>
            </div>

            <div>
                <h4 className="font-bold text-white mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-500">
                    <li><a href="terms-of-service" className="hover:text-white">Termos de Uso</a></li>
                    <li><a href="privacy-policy" className="hover:text-white">Política de Privacidade</a></li>
                    <li><a href="privacy-policy" className="hover:text-white">LGPD</a></li>
                </ul>
            </div>

            <div>
                <h4 className="font-bold text-white mb-4">Produto</h4>
                <ul className="space-y-2 text-gray-500">
                    <li><a href="#" className="hover:text-white">Brain AI</a></li>
                    <li><a href="#" className="hover:text-white">Analytics</a></li>
                    <li><a href="#" className="hover:text-white">Encurtador</a></li>
                </ul>
            </div>

            <div className="col-span-1">
                <h4 className="font-bold text-white mb-4">Segurança</h4>
                <div className="flex items-center gap-2 text-gray-500 mb-2"><Shield size={16} className="text-green-500"/> Dados Criptografados</div>
                <div className="flex items-center gap-2 text-gray-500 mb-4"><Globe size={16} className="text-blue-500"/> CDN Global</div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-xs text-gray-600">
            © 2025 Freelinnk Tecnologia Ltda. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}