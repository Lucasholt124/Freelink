"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useInView, useMotionValue, useSpring } from "framer-motion";
import { useRouter } from "next/navigation";
import { SignInButton, useAuth } from "@clerk/nextjs";
import {
  ArrowRight, CheckCircle, Star, Shield,
  Zap, TrendingUp, DollarSign, Wand2,
  Check, Instagram, Linkedin, Youtube,
  Target, Sparkles, MessageCircle,
  Palette, Calculator,
  Film, Flame, Link2, BarChart3,
  Globe, MapPin,
  Play, Users, Lock, ChevronDown,
  Menu, X, Eye, Heart,
  ShoppingBag, Briefcase, Music,
  Camera, BookOpen, Dumbbell, UtensilsCrossed,
  Building2, Megaphone, Store,
  QrCode, Bot, Fingerprint,
  Crown, Rocket, Gift,
  Settings, Share2, Cpu,
  Sun, Moon, BadgeCheck, Server
} from "lucide-react";
import clsx from "clsx";

// --- CONFIGURAÇÕES VISUAIS ---
const BRAND = {
  primary: "#6366f1",
  secondary: "#8b5cf6",
  gradient: "bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]",
  gradientHover: "hover:from-[#5558e3] hover:to-[#7c4fee]",
  textGradient: "bg-clip-text text-transparent bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]",
};

// --- DADOS ---
const nichos = [
  { icon: <Instagram size={18} />, name: "Criadores" },
  { icon: <ShoppingBag size={18} />, name: "Afiliados" },
  { icon: <Heart size={18} />, name: "Nutricionistas" },
  { icon: <Dumbbell size={18} />, name: "Personal Trainers" },
  { icon: <UtensilsCrossed size={18} />, name: "Restaurantes" },
  { icon: <BookOpen size={18} />, name: "Infoprodutores" },
  { icon: <Store size={18} />, name: "E-commerce" },
  { icon: <Building2 size={18} />, name: "Agências" },
  { icon: <Music size={18} />, name: "Artistas" },
  { icon: <Camera size={18} />, name: "Fotógrafos" },
  { icon: <Megaphone size={18} />, name: "Marketing" },
  { icon: <Briefcase size={18} />, name: "Freelancers" },
];

const features = [
  {
    icon: <Link2 size={24} />,
    title: "Página de Links",
    desc: "Totalmente customizável. Você escolhe cada detalhe.",
    tag: "GRÁTIS",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: <Zap size={24} />,
    title: "Encurtador de Links",
    desc: "Links curtos e memoráveis com analytics Básico.",
    tag: "GRÁTIS",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: <BarChart3 size={24} />,
    title: "Analytics Completo",
    desc: "Saiba de onde vem cada clique. Cidade, dispositivo, horário.",
    tag: "ULTRA",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: <QrCode size={24} />,
    title: "QR Code Dinâmico",
    desc: "QR Code em sua pagina de links",
    tag: "GRÁTIS",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: <Film size={24} />,
    title: "Brain Roteirista IA",
    desc: "Roteiros virais com 95% de chance de engajamento.",
    tag: "PRO",
    color: "from-red-500 to-rose-500"
  },
  {
    icon: <Calculator size={24} />,
    title: "Gestão Financeira",
    desc: "Controle vendas, custos e veja seu lucro real.",
    tag: "ULTRA",
    color: "from-indigo-500 to-violet-500"
  },
  {
    icon: <Bot size={24} />,
    title: "AI Studio",
    desc: "Chat IA, remoção de fundo, upscale de imagens.",
    tag: "ULTRA",
    color: "from-fuchsia-500 to-purple-500"
  },
  {
    icon: <Target size={24} />,
    title: "Pixel & UTM",
    desc: "Rastreie conversões com precisão cirúrgica.",
    tag: "ULTRA",
    color: "from-teal-500 to-cyan-500"
  },
];

const stats = [
  { value: "10.800", suffix: "+", label: "Criadores Ativos" },
  { value: "2.4", suffix: "M+", label: "Cliques Rastreados" },
  { value: "847", prefix: "R$", suffix: "k+", label: "Gerado para Usuários" },
  { value: "4.9", suffix: "/5", label: "Avaliação Média" },
];

const testimonials = [
  {
    text: "Saí do Linktree e nunca mais voltei. O Freelinnk me dá dados que eu pagava caro pra ter.",
    author: "Mariana Costa",
    role: "Criadora • 89k seguidores",
    avatar: "https://i.pravatar.cc/100?img=5",
    increase: "+312% vendas"
  },
  {
    text: "O Brain sugeriu um roteiro e meu vídeo fez 500k views. Nunca tinha acontecido antes.",
    author: "Lucas Mendes",
    role: "TikToker • 234k seguidores",
    avatar: "https://i.pravatar.cc/100?img=12",
    increase: "500k views"
  },
  {
    text: "Finalmente sei quanto realmente lucro por mês. A gestão financeira mudou meu negócio.",
    author: "Fernanda Lima",
    role: "Personal Trainer",
    avatar: "https://i.pravatar.cc/100?img=9",
    increase: "+487% consultas"
  },
  {
    text: "O encurtador com analytics me mostrou qual produto vender. Triplicou minha comissão.",
    author: "Pedro Henrique",
    role: "Afiliado Hotmart",
    avatar: "https://i.pravatar.cc/100?img=11",
    increase: "3x comissões"
  },
  {
    text: "Interface linda, customização total. Minha página ficou a cara da minha marca.",
    author: "Ana Paula",
    role: "Nutricionista Online",
    avatar: "https://i.pravatar.cc/100?img=23",
    increase: "+89 pacientes/mês"
  },
  {
    text: "Sai do zero e hoje faturo 5 dígitos. O Freelinnk foi parte essencial dessa jornada.",
    author: "Rafael Torres",
    role: "Infoprodutor",
    avatar: "https://i.pravatar.cc/100?img=15",
    increase: "5 dígitos/mês"
  },
];

const realPages = [
  {
    id: 1,
    image: "/ImpulsioneWeb.png",
    name: "@ImpulsioneWeb",
    type: "Agência Digital",
    color: "from-blue-600 to-indigo-600"
  },
  {
    id: 2,
    image: "/Glam-Fit.png",
    name: "@Glam-Fit",
    type: "Moda Fitness",
    color: "from-pink-500 to-rose-500"
  },
  {
    id: 3,
    image: "/Studio-Oliveira.png",
    name: "@Studio-Oliveira",
    type: "Nails Designer",
    color: "from-purple-500 to-violet-500"
  },
  {
    id: 4,
    image: "/Penelope-Variedades.png",
    name: "@Penelope-Variedades",
    type: "Loja Virtual",
    color: "from-orange-500 to-amber-500"
  },
];

// --- BUTTON COMPONENT ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "white" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = "default",
  size = "md",
  className,
  children,
  ...props
}) => {
  const base = "inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer active:scale-[0.98]";

  const variants = {
    default: `${BRAND.gradient} ${BRAND.gradientHover} text-white focus:ring-[#6366f1] shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5`,
    outline: "bg-white border-2 border-gray-200 text-gray-700 hover:border-[#6366f1] hover:text-[#6366f1] hover:bg-indigo-50/50",
    white: "bg-white text-gray-900 hover:bg-gray-50 shadow-xl hover:shadow-2xl hover:-translate-y-0.5",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  };

  const sizes = {
    sm: "px-4 py-2.5 text-sm gap-2",
    md: "px-6 py-3 text-sm gap-2",
    lg: "px-8 py-4 text-base gap-2",
    xl: "px-10 py-5 text-lg gap-3",
  };

  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
};

// --- SCROLL REVEAL ---
const ScrollReveal = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

// --- ANIMATED COUNTER ---
const AnimatedCounter = ({ value, prefix = "", suffix = "" }: { value: string; prefix?: string; suffix?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = numericValue / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setCount(numericValue);
          clearInterval(timer);
        } else {
          setCount(current);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, numericValue]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{isInView ? (Number.isInteger(numericValue) ? Math.floor(count) : count.toFixed(1)) : "0"}{suffix}
    </span>
  );
};

// --- FLOATING ELEMENTS ---
const FloatingElement = ({ children, delay = 0, duration = 4, y = 15 }: { children: React.ReactNode; delay?: number; duration?: number; y?: number }) => (
  <motion.div
    animate={{ y: [-y, y, -y] }}
    transition={{ repeat: Infinity, duration, delay, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

// --- MAGNETIC BUTTON EFFECT ---
const MagneticWrapper = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.1);
    y.set((e.clientY - centerY) * 0.1);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: xSpring, y: ySpring }}
    >
      {children}
    </motion.div>
  );
};

// --- HERO PHONE SIMULATOR ---
const HeroPhoneSimulator = () => {
  const [step, setStep] = useState(0);
  const [isDark, setIsDark] = useState(true);
  const [likes, setLikes] = useState<{[key: string]: number}>({
    instagram: 12,
    whatsapp: 8,
    mentoria: 47,
    ebook: 23,
  });

  useEffect(() => {
    const timer = setInterval(() => setStep(s => (s + 1) % 5), 3500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (step === 2) {
      const likeTimer = setInterval(() => {
        setLikes(prev => ({
          ...prev,
          mentoria: prev.mentoria + 1,
        }));
      }, 800);
      return () => clearInterval(likeTimer);
    }
  }, [step]);

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-[60px] scale-110" />

      <motion.div
        className="relative w-[280px] sm:w-[320px] h-[560px] sm:h-[640px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl border border-gray-800"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-20">
          <div className="w-28 h-6 bg-gray-900 rounded-b-2xl" />
        </div>

        <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="typing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white flex flex-col items-center justify-center p-8"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg"
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>

                <h3 className="text-xl font-black text-gray-900 mb-2">Freelinnk AI</h3>
                <p className="text-sm text-gray-500 mb-6">Descreva seu negócio...</p>

                <div className="w-full bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-0.5 h-5 bg-indigo-500 rounded-full"
                    />
                    <motion.span
                      className="text-sm text-gray-600"
                      initial={{ width: 0 }}
                      animate={{ width: "auto" }}
                    >
                      Sou criador de conteúdo digital...
                    </motion.span>
                  </div>
                </div>

                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3 }}
                  className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mt-6"
                />
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="creating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 flex flex-col items-center justify-center p-8 text-white"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="mb-6"
                >
                  <Wand2 className="w-16 h-16" />
                </motion.div>

                <h3 className="text-xl font-bold mb-8">Criando sua página...</h3>

                <div className="w-full space-y-3">
                  {[
                    { text: "Configurando perfil", delay: 0 },
                    { text: "Gerando layout", delay: 0.3 },
                    { text: "Adicionando links", delay: 0.6 },
                    { text: "Finalizando...", delay: 0.9 },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: item.delay }}
                      className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl p-3"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: item.delay + 0.3, type: "spring" }}
                        className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center"
                      >
                        <Check size={12} className="text-gray-900" />
                      </motion.div>
                      <span className="text-sm font-medium">{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="preview"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`absolute inset-0 overflow-hidden transition-colors duration-300 ${
                  isDark
                    ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
                    : "bg-gradient-to-br from-gray-50 to-white"
                }`}
              >
                <div className="flex items-center justify-between px-4 pt-8 pb-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setIsDark(!isDark)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isDark ? "bg-white/10 text-yellow-400" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {isDark ? <Sun size={14} /> : <Moon size={14} />}
                  </motion.button>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ scale: 1.1 }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isDark ? "bg-white/10 text-white" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <QrCode size={14} />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ scale: 1.1 }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isDark ? "bg-white/10 text-white" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Share2 size={14} />
                    </motion.button>
                  </div>
                </div>

                <div className="px-6 pt-2 pb-4 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                    className="relative w-20 h-20 mx-auto mb-3"
                  >
                    <img
                      src="https://i.pravatar.cc/200?img=32"
                      className="w-full h-full rounded-full object-cover border-4 border-white/20 shadow-xl"
                      alt="Profile"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"
                    >
                      <Check size={10} className="text-white" />
                    </motion.div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-center gap-1.5 mb-1"
                  >
                    <h3 className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                      @ana.creator
                    </h3>
                    <BadgeCheck size={16} className="text-gray-400" />
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={`text-xs mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Transformo seguidores em clientes! ✨
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className={`text-[10px] ${isDark ? "text-gray-500" : "text-gray-400"}`}
                  >
                    Desde 2025
                  </motion.p>
                </div>

                <div className="px-4 space-y-2.5 overflow-y-auto max-h-[280px] pb-4">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 ${
                      isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    Links
                  </motion.p>

                  {[
                    { icon: <Instagram size={16} />, text: "Instagram", likes: likes.instagram, color: "from-pink-500 to-purple-500" },
                    { icon: <MessageCircle size={16} />, text: "WhatsApp", likes: likes.whatsapp, color: "from-green-500 to-emerald-500" },
                    { icon: <Flame size={16} />, text: "🔥 Mentoria VIP", likes: likes.mentoria, color: "from-orange-500 to-red-500", highlight: true },
                    { icon: <BookOpen size={16} />, text: "📚 E-book Gratuito", likes: likes.ebook, color: "from-blue-500 to-cyan-500" },
                  ].map((link, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative rounded-2xl p-3.5 flex items-center justify-between cursor-pointer group overflow-hidden ${
                        link.highlight
                          ? `bg-gradient-to-r ${link.color} shadow-lg`
                          : isDark
                            ? "bg-white/5 hover:bg-white/10 border border-white/10"
                            : "bg-gray-100 hover:bg-gray-200 border border-gray-200"
                      }`}
                    >
                      {link.highlight && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        />
                      )}

                      <div className="flex items-center gap-3 relative z-10">
                        <span className={link.highlight ? "text-white" : isDark ? "text-white" : "text-gray-700"}>
                          {link.icon}
                        </span>
                        <span className={`text-sm font-semibold ${
                          link.highlight ? "text-white" : isDark ? "text-white" : "text-gray-800"
                        }`}>
                          {link.text}
                        </span>
                      </div>

                      <motion.div
                        whileTap={{ scale: 1.3 }}
                        className={`flex items-center gap-1 relative z-10 ${
                          link.highlight ? "text-white/80" : isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        <Heart size={12} className={link.highlight ? "fill-white/50" : ""} />
                        <motion.span
                          key={link.likes}
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="text-xs font-medium"
                        >
                          {link.likes}
                        </motion.span>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="absolute bottom-4 left-0 right-0 text-center"
                >
                  <p className={`text-[10px] ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                    Feito com 💜 no <span className="font-bold">Freelinnk</span>
                  </p>
                </motion.div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gray-50 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900">Analytics</h3>
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="flex items-center gap-1 text-xs text-green-600 font-bold"
                  >
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    LIVE
                  </motion.span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: "Cliques Hoje", value: "847", change: "+23%" },
                    { label: "Conversões", value: "12.4%", change: "+8%" },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                    >
                      <p className="text-[10px] text-gray-500 uppercase font-bold">{stat.label}</p>
                      <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                      <span className="text-xs text-green-600 font-bold">{stat.change}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                  <p className="text-xs font-bold text-gray-700 mb-3">Últimos cliques</p>
                  {[
                    { city: "São Paulo", time: "agora" },
                    { city: "Lisboa", time: "2min" },
                    { city: "Miami", time: "5min" },
                  ].map((click, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                        >
                          <MapPin size={12} className="text-indigo-500" />
                        </motion.div>
                        <span className="text-xs text-gray-700">{click.city}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{click.time}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-4 text-white"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <TrendingUp size={16} />
                    </motion.div>
                    <span className="text-xs font-bold uppercase">Insight IA</span>
                  </div>
                  <p className="text-sm">72% do seu público acessa pelo celular às 14h!</p>
                </motion.div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="sale"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-6"
              >
                <motion.div
                  initial={{ y: 30 }}
                  animate={{ y: 0 }}
                  className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 w-full text-center"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                  >
                    <DollarSign className="w-10 h-10 text-white" />
                  </motion.div>

                  <motion.h2
                    className="text-2xl font-black text-gray-900 mb-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Venda Aprovada!
                  </motion.h2>
                  <p className="text-sm text-gray-500 mb-6">Via Link na Bio • Agora</p>

                  <motion.div
                    className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Valor</p>
                    <motion.p
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring" }}
                      className="text-4xl font-black text-green-600"
                    >
                      R$ 497,00
                    </motion.p>
                  </motion.div>

                  <motion.div
                    className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.span
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-2 h-2 bg-green-500 rounded-full"
                    />
                    <span>+127 vendas este mês</span>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                animate={{
                  width: step === i ? 16 : 6,
                  backgroundColor: step === i ? "#6366f1" : "#d1d5db"
                }}
                className="h-1.5 rounded-full"
              />
            ))}
          </div>
        </div>
      </motion.div>

      <FloatingElement delay={0} duration={4} y={10}>
        <motion.div
          className="absolute -top-4 -left-4 sm:top-8 sm:-left-16 bg-white rounded-2xl p-3 shadow-xl border border-gray-100 hidden sm:flex items-center gap-3 z-10"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase">Conversão</p>
            <p className="text-lg font-black text-gray-900">+312%</p>
          </div>
        </motion.div>
      </FloatingElement>

      <FloatingElement delay={1} duration={5} y={12}>
        <motion.div
          className="absolute -bottom-4 -right-4 sm:bottom-20 sm:-right-16 bg-white rounded-2xl p-3 shadow-xl border border-gray-100 hidden sm:flex items-center gap-3 z-10"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Eye className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase">Visualizações</p>
            <p className="text-lg font-black text-gray-900">12.4k</p>
          </div>
        </motion.div>
      </FloatingElement>
    </div>
  );
};

// --- SOCIAL PROOF AVATARS ---
const SocialProofAvatars = () => {
  const avatars = [
    "https://i.pravatar.cc/80?img=1",
    "https://i.pravatar.cc/80?img=2",
    "https://i.pravatar.cc/80?img=3",
    "https://i.pravatar.cc/80?img=4",
    "https://i.pravatar.cc/80?img=5",
    "https://i.pravatar.cc/80?img=6",
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
      <div className="flex -space-x-3">
        {avatars.map((src, i) => (
          <motion.img
            key={i}
            initial={{ scale: 0, x: -10 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ delay: i * 0.08, type: "spring" }}
            whileHover={{ scale: 1.1, zIndex: 10 }}
            src={src}
            alt=""
            className="w-10 h-10 rounded-full border-[3px] border-white shadow-md object-cover relative"
          />
        ))}
      </div>
      <div className="text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-0.5 mb-0.5">
          {[1, 2, 3, 4, 5].map(i => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
            </motion.div>
          ))}
        </div>
        <p className="text-sm text-gray-600">
          <span className="font-bold text-gray-900">+10.800</span> criadores ativos
        </p>
      </div>
    </div>
  );
};

// --- PÁGINAS REAIS COM CARROSSEL ANIMADO ---
// --- SUBSTITUA O COMPONENTE RealPagesShowcase INTEIRO POR ESTE ---

const RealPagesShowcase = () => {
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Duplicar páginas para efeito infinito
  const duplicatedPages = [...realPages, ...realPages, ...realPages];

  return (
    <div
      className="relative overflow-hidden py-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Gradientes laterais */}
      <div className="absolute left-0 top-0 bottom-0 w-10 md:w-40 bg-gradient-to-r from-gray-50 via-gray-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-10 md:w-40 bg-gradient-to-l from-gray-50 via-gray-50 to-transparent z-10 pointer-events-none" />

      {/* Carrossel */}
      <motion.div
        ref={containerRef}
        className="flex gap-6 md:gap-8"
        animate={{
          x: isPaused ? undefined : [0, -1200],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 40, // Mais lento para facilitar a leitura
            ease: "linear",
          },
        }}
        style={{ width: "fit-content" }}
      >
        {duplicatedPages.map((page, index) => (
          <motion.div
            key={`${page.id}-${index}`}
            className="relative flex-shrink-0 w-[240px] sm:w-[280px] md:w-[300px] group"
            whileHover={{
              y: -20,
              scale: 1.05,
              zIndex: 20,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Glow effect no hover */}
            <motion.div
              className={`absolute -inset-4 bg-gradient-to-r ${page.color} rounded-[3rem] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}
            />

            {/* Phone Frame */}
            <div className="relative bg-gray-900 rounded-[2.5rem] p-2 shadow-xl group-hover:shadow-2xl transition-all duration-500">
              {/* Notch */}
              <div className="absolute top-0 inset-x-0 h-5 flex justify-center z-10">
                <div className="w-20 h-5 bg-gray-900 rounded-b-xl" />
              </div>

              {/* Screen */}
              <div className="bg-gray-800 rounded-[2rem] overflow-hidden aspect-[9/18] relative">
                {/* Imagem da página */}
                <motion.img
                  src={page.image}
                  alt={page.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/280x500/1a1a2e/6366f1?text=${encodeURIComponent(
                      page.name
                    )}`;
                  }}
                />

                {/* Overlay gradiente - Mais forte para leitura */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4" />

                {/* Info no hover - Corrigido tamanho e quebra */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end items-center text-center z-20"
                  initial={{ y: 20 }}
                  whileHover={{ y: 0 }}
                >
                  <p className="text-white font-bold text-lg leading-tight mb-1 w-full break-words">
                    {page.name}
                  </p>
                  <p className="text-white/80 text-sm font-medium">
                    {page.type}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur rounded-full">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-white font-bold uppercase">
                      Ver página
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Info abaixo do card (fora do celular) */}
            <motion.div
              className="mt-4 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.p
                className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                {page.name}
              </motion.p>
              <p className="text-xs text-gray-500 mt-0.5">{page.type}</p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Aviso LGPD obrigatório */}
      <div className="text-center mt-12">
        <p className="text-[10px] text-gray-400">
          * As páginas exibidas foram autorizadas pelos criadores para aparecer em nossa galeria pública.
        </p>
        <motion.p
          className="text-center text-sm text-gray-400 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            Passe o mouse para pausar ✨
          </motion.span>
        </motion.p>
      </div>
    </div>
  );
};

// --- FEATURE CARD COM MAIS ANIMAÇÕES ---
const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.6, type: "spring" }}
      whileHover={{
        y: -12,
        scale: 1.03,
        rotateY: 5,
        transition: { duration: 0.3 }
      }}
      className="relative bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-2xl hover:border-indigo-200 transition-all duration-500 cursor-pointer group overflow-hidden"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Background gradient animado */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
      />

      {/* Partículas decorativas */}
      <motion.div
        className="absolute top-4 right-4 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
      >
        <div className={`w-full h-full bg-gradient-to-br ${feature.color} opacity-10 rounded-full blur-xl`} />
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
            transition={{ duration: 0.5 }}
            className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}
          >
            {feature.icon}
          </motion.div>
          <motion.span
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${
              feature.tag === "GRÁTIS"
                ? "bg-green-100 text-green-700"
                : feature.tag === "PRO"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-purple-100 text-purple-700"
            }`}
          >
            {feature.tag}
          </motion.span>
        </div>

        <motion.h3
          className="font-bold text-lg text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors"
        >
          {feature.title}
        </motion.h3>
        <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
      </div>

      {/* Linha de progresso animada */}
      <motion.div
        className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.color}`}
        initial={{ width: 0 }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.5 }}
      />

      {/* Arrow indicator */}
      <motion.div
        className="absolute bottom-4 right-4 text-indigo-500 opacity-0 group-hover:opacity-100"
        initial={{ x: -10 }}
        whileHover={{ x: 0 }}
      >
        <ArrowRight size={18} />
      </motion.div>
    </motion.div>
  );
};

// --- TESTIMONIAL CARD COM MAIS ANIMAÇÕES ---
const TestimonialCard = ({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: index * 0.15, duration: 0.6, type: "spring" }}
      whileHover={{
        y: -10,
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.25)"
      }}
      className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden"
    >
      {/* Background decoration */}
      <motion.div
        className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-500 blur-2xl"
      />

      {/* Stars */}
      <div className="flex gap-1 mb-4 relative z-10">
        {[1, 2, 3, 4, 5].map(i => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
            transition={{ delay: index * 0.1 + i * 0.1, type: "spring" }}
            whileHover={{ scale: 1.2, rotate: 15 }}
          >
            <Star size={16} className="text-yellow-400 fill-yellow-400" />
          </motion.div>
        ))}
      </div>

      <motion.p
        className="text-gray-700 text-sm leading-relaxed mb-6 italic relative z-10"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: index * 0.15 + 0.2 }}
      >
        &quot;{testimonial.text}&quot;
      </motion.p>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.1 }}
          >
            <img
              src={testimonial.avatar}
              alt={testimonial.author}
              className="w-12 h-12 rounded-full border-2 border-gray-100 group-hover:border-indigo-200 transition-colors object-cover"
            />
            <motion.div
              className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </motion.div>
          <div>
            <p className="font-bold text-sm text-gray-900">{testimonial.author}</p>
            <p className="text-xs text-gray-500">{testimonial.role}</p>
          </div>
        </div>
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 text-xs font-bold px-3 py-2 rounded-full border border-green-100"
        >
          {testimonial.increase}
        </motion.div>
      </div>
    </motion.div>
  );
};

// --- HOW IT WORKS STEP ---
const HowItWorksStep = ({ step, index, total }: { step: { icon: React.ReactNode; title: string; desc: string }; index: number; total: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.2, duration: 0.6 }}
      className="relative"
    >
      {/* Connector Line */}
      {index < total - 1 && (
        <motion.div
          className="hidden lg:block absolute top-14 left-1/2 w-full h-1 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-400 to-purple-400"
            initial={{ width: 0 }}
            animate={isInView ? { width: "100%" } : {}}
            transition={{ delay: index * 0.2 + 0.5, duration: 0.8 }}
          />
        </motion.div>
      )}

      <div className="relative z-10 flex flex-col items-center text-center">
        <MagneticWrapper>
          <motion.div
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            whileTap={{ scale: 0.95 }}
            className="w-28 h-28 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 mb-4 cursor-pointer relative overflow-hidden"
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            />
            <span className="relative z-10">{step.icon}</span>
          </motion.div>
        </MagneticWrapper>

        <motion.div
          whileHover={{ scale: 1.1 }}
          className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-sm font-bold px-4 py-1.5 rounded-full mb-3"
        >
          Passo {index + 1}
        </motion.div>

        <h3 className="font-bold text-lg text-gray-900 mb-2">{step.title}</h3>
        <p className="text-sm text-gray-500 max-w-[200px]">{step.desc}</p>
      </div>
    </motion.div>
  );
};

// --- NICHO CARD ---
const NichoCard = ({ nicho, index }: { nicho: typeof nichos[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ delay: index * 0.05, duration: 0.4, type: "spring" }}
      whileHover={{
        y: -8,
        scale: 1.05,
        boxShadow: "0 20px 40px -15px rgba(99, 102, 241, 0.2)"
      }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-2xl p-4 border border-gray-100 hover:border-indigo-200 hover:bg-gradient-to-br hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300 cursor-pointer group text-center relative overflow-hidden"
    >
      {/* Animated background circle */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full scale-0 group-hover:scale-150 transition-transform duration-700"
      />

      <motion.div
        whileHover={{ rotate: [0, -15, 15, 0], scale: 1.2 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-gray-600 group-hover:text-indigo-600 group-hover:from-indigo-100 group-hover:to-purple-100 transition-all shadow-sm group-hover:shadow-md"
      >
        {nicho.icon}
      </motion.div>
      <p className="relative z-10 text-sm font-bold text-gray-700 group-hover:text-indigo-700 transition-colors">
        {nicho.name}
      </p>
    </motion.div>
  );
};

// --- DIFFERENTIAL CARD ---
const DifferentialCard = ({ item, index }: { item: { icon: React.ReactNode; title: string; desc: string }; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{
        y: -10,
        scale: 1.03,
        backgroundColor: "rgba(255,255,255,0.15)"
      }}
      className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10 hover:border-white/30 transition-all duration-500 group relative overflow-hidden"
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
      />

      <motion.div
        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl group-hover:shadow-indigo-500/30 transition-all"
      >
        {item.icon}
      </motion.div>
      <h3 className="relative z-10 font-bold text-xl mb-2 text-white">{item.title}</h3>
      <p className="relative z-10 text-gray-400 group-hover:text-gray-300 transition-colors">{item.desc}</p>
    </motion.div>
  );
};

// --- MAIN PAGE ---
// --- SUBSTITUA A FUNÇÃO export default function LandingPage INTEIRA POR ESTA ---

// --- SUBSTITUA APENAS A FUNÇÃO LandingPage POR ESTA ---

export default function LandingPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    if (isLoaded && isSignedIn) router.push("/dashboard");
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const howItWorks = [
    {
      icon: <Settings size={36} />,
      title: "Configure sua página",
      desc: "Personalize cada detalhe do seu jeito",
    },
    {
      icon: <Wand2 size={36} />,
      title: "Crie seus links",
      desc: "Organize seus links importantes",
    },
    {
      icon: <Share2 size={36} />,
      title: "Compartilhe",
      desc: "Coloque na bio e comece a rastrear",
    },
    {
      icon: <Rocket size={36} />,
      title: "Lucre mais",
      desc: "Veja seus resultados explodirem",
    },
  ];

  const differentials = [
    {
      icon: <Gift size={28} />,
      title: "Grátis de verdade",
      desc: "Página, encurtador e analytics básico. Sem pegadinhas.",
    },
    {
      icon: <Palette size={28} />,
      title: "100% customizável",
      desc: "Você escolhe cada cor, fonte e layout.",
    },
    {
      icon: <Bot size={28} />,
      title: "IA que trabalha por você",
      desc: "Brain Roteirista, Chat IA e muito mais.",
    },
    {
      icon: <BarChart3 size={28} />,
      title: "Analytics de verdade",
      desc: "Saiba cidade, dispositivo e horário de cada clique.",
    },
    {
      icon: <Calculator size={28} />,
      title: "Gestão Financeira",
      desc: "Nenhum concorrente tem. Veja seu lucro real.",
    },
    {
      icon: <Shield size={28} />,
      title: "Seguro e rápido",
      desc: "Criptografia, CDN global e 99.99% de uptime.",
    },
  ];

  return (
    <div className="bg-white text-gray-900 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 z-[100] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Mobile CTA (Barra fixa inferior) - CORRIGIDO O CLIQUE */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-[90] p-3 bg-white/95 backdrop-blur-lg border-t border-gray-200 md:hidden"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 1 }}
      >
        <SignInButton mode="modal">
          <Button className="w-full relative z-50 pointer-events-auto" size="lg">
            Começar Grátis <ArrowRight size={18} />
          </Button>
        </SignInButton>
      </motion.div>

      {/* Navigation */}
      <motion.nav
        className={`fixed top-0 w-full z-[80] transition-all duration-500 ${
          scrolled
            ? "bg-white/95 backdrop-blur-lg shadow-lg"
            : "bg-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2.5 cursor-pointer relative z-50"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl ${BRAND.gradient} shadow-lg shadow-indigo-500/30`}
            >
              F
            </div>
            <span className="text-xl font-bold tracking-tight">Freelinnk</span>
          </motion.div>

          <div className="hidden lg:flex items-center gap-8">
            {["Funcionalidades", "Como Funciona", "Preços", "Depoimentos"].map(
              (item, i) => (
                <motion.a
                  key={item}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  href={
                    item === "Preços"
                      ? "#diferenciais"
                      : `#${item.toLowerCase().replace(" ", "-")}`
                  }
                  className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors relative group"
                >
                  {item}
                  <motion.span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 group-hover:w-full transition-all duration-300" />
                </motion.a>
              )
            )}
          </div>

          <div className="flex items-center gap-3 relative z-50">
            {/* Desktop: Entrar */}
            <div className="hidden lg:block">
              <SignInButton mode="modal">
                <motion.button
                  className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors px-4 py-2 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Entrar
                </motion.button>
              </SignInButton>
            </div>

            {/* Desktop: Começar Grátis - CORRIGIDO ORDEM DE ANINHAMENTO */}
            <div className="hidden md:block">
              <MagneticWrapper>
                <SignInButton mode="modal">
                  <Button size="sm" className="cursor-pointer relative z-50">Começar Grátis</Button>
                </SignInButton>
              </MagneticWrapper>
            </div>

            {/* Mobile: Menu Toggle */}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 relative z-50"
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                  >
                    <X size={24} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                  >
                    <Menu size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-b border-gray-100 overflow-hidden relative z-40"
            >
              <div className="px-4 py-4 space-y-1">
                {[
                  "Funcionalidades",
                  "Como Funciona",
                  "Preços",
                  "Depoimentos",
                ].map((item, i) => (
                  <motion.a
                    key={item}
                    href={
                      item === "Preços"
                        ? "#diferenciais"
                        : `#${item.toLowerCase().replace(" ", "-")}`
                    }
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-xl font-medium"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {item}
                  </motion.a>
                ))}
                <div className="pt-2">
                  <SignInButton mode="modal">
                    <motion.button
                      className="block w-full py-3 px-4 text-center bg-gray-50 text-indigo-600 font-bold rounded-xl cursor-pointer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      Entrar na Plataforma
                    </motion.button>
                  </SignInButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-12 md:pt-32 lg:pt-40 lg:pb-24 overflow-hidden">
        {/* Background Blobs com pointer-events-none para não bloquear cliques */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <motion.div
            className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-indigo-100/50 to-purple-100/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-100/50 to-indigo-100/50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"
            animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="text-center lg:text-left">
              <ScrollReveal>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full text-sm font-bold text-green-700 mb-6 cursor-pointer relative z-20"
                >
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Gift size={16} />
                  </motion.div>
                  100% Grátis para começar
                </motion.div>

                <motion.h1
                  className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.1] mb-6 relative z-20"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  A página de links que{" "}
                  <motion.span
                    className={BRAND.textGradient}
                    animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                    transition={{ repeat: Infinity, duration: 5 }}
                  >
                    bota dinheiro
                  </motion.span>{" "}
                  no seu bolso.
                </motion.h1>

                <motion.p
                  className="text-lg sm:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed relative z-20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Página totalmente customizável, encurtador com analytics e
                  ferramentas de{" "}
                  <strong className="text-indigo-600">
                    IA exclusivas
                  </strong>{" "}
                  para você vender muito mais.
                </motion.p>

                {/* Input estilo Linktree - CORRIGIDO BOTÃO DE CRIAR */}
                <div className="max-w-md mx-auto lg:mx-0 bg-white p-2 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-200 flex flex-col sm:flex-row gap-2 transform hover:scale-[1.01] transition-transform mb-6 relative z-30">
                  <div className="flex-1 bg-gray-50 rounded-xl px-4 flex items-center h-12 sm:h-auto border border-transparent focus-within:border-[#6366f1] focus-within:bg-white transition-all">
                    <span className="text-gray-400 font-bold text-sm mr-1">
                      freelinnk.com/
                    </span>
                    <input
                      type="text"
                      placeholder="seunome"
                      className="bg-transparent border-none outline-none font-bold text-gray-900 w-full placeholder:text-gray-300"
                    />
                  </div>
                  <SignInButton mode="modal">
                    <Button className="w-full sm:w-auto whitespace-nowrap shadow-md cursor-pointer pointer-events-auto">
                      Criar Grátis
                    </Button>
                  </SignInButton>
                </div>

                {/* BOTÃO HERO PRINCIPAL - CORRIGIDO ORDEM ANINHAMENTO */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-6 relative z-30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <MagneticWrapper>
                    <SignInButton mode="modal">
                      <Button size="xl" className="w-full sm:w-auto group cursor-pointer pointer-events-auto">
                        Começar Agora — É Grátis
                        <span className="text-[10px] font-normal opacity-80 block sm:inline ml-1">
                          (leva só 30 segundos)
                        </span>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <ArrowRight size={20} />
                        </motion.div>
                      </Button>
                    </SignInButton>
                  </MagneticWrapper>
                </motion.div>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-[10px] sm:text-xs text-gray-500 font-medium mb-8 relative z-20">
                  <span className="flex items-center gap-1">
                    <Lock size={12} className="text-green-500" /> Conexão Segura
                  </span>
                  <span className="hidden sm:inline">·</span>
                  <span className="flex items-center gap-1">
                    <Shield size={12} className="text-blue-500" /> Dados Criptografados
                  </span>
                  <span className="hidden sm:inline">·</span>
                  <span className="flex items-center gap-1">
                    <Server size={12} className="text-purple-500" /> CDN Global
                  </span>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="relative z-20"
                >
                  <SocialProofAvatars />
                </motion.div>
              </ScrollReveal>
            </div>

            <div className="flex justify-center lg:justify-end relative z-10">
              <ScrollReveal delay={0.3}>
                <HeroPhoneSimulator />
              </ScrollReveal>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 z-20"
        >
          <span className="text-xs text-gray-400 font-medium">
            Role para explorar
          </span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronDown size={20} className="text-gray-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* STATS BAR */}
      <section className="py-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"
          animate={{ x: [0, 60], y: [0, 60] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <motion.p
                  className="text-3xl md:text-5xl font-black mb-1"
                  whileHover={{ scale: 1.1 }}
                >
                  <AnimatedCounter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </motion.p>
                <p className="text-sm text-white/70">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PÁGINAS REAIS */}
      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-12">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-sm font-bold mb-4 cursor-pointer"
              >
                <Crown size={16} />
                Páginas Reais
              </motion.div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4">
                Veja o que nossos usuários{" "}
                <span className={BRAND.textGradient}>criaram</span>
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                100% customizável. Você escolhe cores, fontes, layout e muito
                mais.
              </p>
            </div>
          </ScrollReveal>

          <RealPagesShowcase />

          <motion.div
            className="text-center mt-12 relative z-30"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* BOTÃO PÁGINAS REAIS - CORRIGIDO ORDEM */}
            <MagneticWrapper>
              <SignInButton mode="modal">
                <Button size="lg" className="group cursor-pointer pointer-events-auto">
                  Criar Minha Página
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <ArrowRight size={18} />
                  </motion.div>
                </Button>
              </SignInButton>
            </MagneticWrapper>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="funcionalidades" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-bold mb-4"
              >
                <Cpu size={16} />
                Funcionalidades
              </motion.div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4">
                Tudo que você precisa para{" "}
                <span className={BRAND.textGradient}>vender mais</span>
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Não somos só um link na bio. Somos seu sistema de vendas
                completo.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, i) => (
              <FeatureCard key={i} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="como-funciona"
        className="py-20 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold mb-4"
              >
                <Play size={16} />
                Como Funciona
              </motion.div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4">
                Simples assim
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Em menos de 5 minutos você está pronto para vender.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {howItWorks.map((step, i) => (
              <HowItWorksStep
                key={i}
                step={step}
                index={i}
                total={howItWorks.length}
              />
            ))}
          </div>

          <motion.div
            className="text-center mt-16 flex flex-col items-center justify-center gap-4 relative z-30"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* BOTÃO COMO FUNCIONA - CORRIGIDO ORDEM */}
            <MagneticWrapper>
              <SignInButton mode="modal">
                <Button
                  size="lg"
                  variant="default"
                  className="shadow-lg hover:shadow-xl cursor-pointer pointer-events-auto"
                >
                  Criar Minha Página Agora
                  <ArrowRight size={18} />
                </Button>
              </SignInButton>
            </MagneticWrapper>
          </motion.div>
        </div>
      </section>

      {/* PARA QUEM (Mantido igual) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-12">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-bold mb-4"
              >
                <Users size={16} />
                Para Todos
              </motion.div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4">
                Serve pra você?{" "}
                <span className={BRAND.textGradient}>Com certeza.</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {nichos.map((nicho, i) => (
              <NichoCard key={i} nicho={nicho} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS (Mantido igual) */}
      <section
        id="depoimentos"
        className="py-20 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="max-w-7xl mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-12">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold mb-4"
              >
                <Star size={16} />
                Depoimentos
              </motion.div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4">
                Quem usa, recomenda
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Mais de 10.800 criadores já transformaram seus resultados.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <TestimonialCard key={i} testimonial={testimonial} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* DIFFERENTIALS (Mantido igual) */}
      <section
        id="diferenciais"
        className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-[150px]"
            animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
            transition={{ repeat: Infinity, duration: 10 }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[150px]"
            animate={{ scale: [1, 1.3, 1], x: [0, -50, 0] }}
            transition={{ repeat: Infinity, duration: 12 }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4">
                Por que{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  Freelinnk
                </span>
                ?
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Não tiramos seu dinheiro. Botamos mais.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {differentials.map((item, i) => (
              <DifferentialCard key={i} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY (Mantido igual) */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {[
              { icon: <Lock size={22} />, text: "Criptografia AES-256" },
              { icon: <Shield size={22} />, text: "LGPD Compliant" },
              { icon: <Globe size={22} />, text: "CDN Global" },
              { icon: <Fingerprint size={22} />, text: "HTTPS Sempre" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="flex items-center gap-3 text-gray-600 cursor-pointer group"
              >
                <motion.div
                  className="text-green-500 group-hover:text-indigo-500 transition-colors"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {item.icon}
                </motion.div>
                <span className="text-sm font-semibold group-hover:text-gray-900 transition-colors">
                  {item.text}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ (Mantido igual) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                Perguntas Frequentes
              </h2>
            </div>
          </ScrollReveal>

          <div className="space-y-4">
            {[
              {
                q: "O Freelinnk é realmente grátis?",
                a: "Sim! Página de links, encurtador e analytics básico são 100% grátis para sempre. As ferramentas de IA avançadas são para assinantes Pro ou Ultra.",
              },
              {
                q: "Preciso saber programar ou design?",
                a: "Não! Nossa interface é super intuitiva. Você customiza tudo com cliques, sem código.",
              },
              {
                q: "Posso usar em qualquer rede social?",
                a: "Sim! Instagram, TikTok, YouTube, LinkedIn, Twitter, WhatsApp... Em qualquer lugar.",
              },
              {
                q: "Meus dados estão seguros?",
                a: "100%. Usamos criptografia AES-256, servidores globais e somos totalmente compatíveis com a LGPD.",
              },
              {
                q: "O que é o Brain Roteirista?",
                a: "É nossa IA que cria roteiros virais para seus vídeos, com sugestões de ângulos, cortes e timing perfeito para engajar.",
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02, y: -3 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all cursor-pointer group"
              >
                <h4 className="font-bold text-gray-900 mb-3 flex items-start gap-3">
                  <motion.span
                    whileHover={{ scale: 1.2, rotate: 15 }}
                    className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 rounded-full flex items-center justify-center text-sm flex-shrink-0 group-hover:from-indigo-500 group-hover:to-purple-500 group-hover:text-white transition-all"
                  >
                    ?
                  </motion.span>
                  <span className="group-hover:text-indigo-600 transition-colors">
                    {faq.q}
                  </span>
                </h4>
                <p className="text-gray-600 text-sm pl-11 leading-relaxed">
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-28 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        </div>

        {/* Floating shapes */}
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 border border-white/10 rounded-3xl z-0"
          animate={{ rotate: [0, 90, 180, 270, 360], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-24 h-24 bg-white/5 rounded-full z-0"
          animate={{ y: [0, -30, 0], scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 5 }}
        />
        <motion.div
          className="absolute top-1/2 right-20 w-16 h-16 bg-white/10 rounded-2xl hidden lg:block z-0"
          animate={{ rotate: [0, 45, 0], x: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 8 }}
        />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-20">
          <ScrollReveal>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur text-white border border-white/30 rounded-full px-6 py-3 text-sm font-bold mb-8 cursor-pointer"
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Flame className="w-5 h-5 text-orange-300" />
              </motion.div>
              +10.800 criadores já estão lucrando mais
            </motion.div>
            <motion.h2
              className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Pronto para colocar mais{" "}
              <br className="hidden sm:block" />
              <motion.span
                animate={{
                  textShadow: [
                    "0 0 20px rgba(255,255,255,0.3)",
                    "0 0 40px rgba(255,255,255,0.5)",
                    "0 0 20px rgba(255,255,255,0.3)",
                  ],
                }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                dinheiro no seu bolso?
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-xl text-white/80 mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Crie sua página grátis agora.
              <br />
              Sem cartão, sem compromisso, sem enrolação.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              {/* BOTÃO FINAL - CORRIGIDO ORDEM */}
              <MagneticWrapper>
                <SignInButton mode="modal">
                  <Button
                    size="xl"
                    variant="white"
                    className="shadow-2xl text-lg px-14 py-6 group cursor-pointer pointer-events-auto"
                  >
                    Começar Agora — É Grátis
                    <motion.div
                      animate={{ x: [0, 8, 0] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      <ArrowRight size={24} />
                    </motion.div>
                  </Button>
                </SignInButton>
              </MagneticWrapper>
            </motion.div>

            <motion.div
              className="mt-10 flex flex-col sm:flex-row justify-center gap-8 text-sm text-white/70"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              {[
                { icon: <CheckCircle size={18} />, text: "Grátis para sempre" },
                {
                  icon: <CheckCircle size={18} />,
                  text: "Sem cartão de crédito",
                },
                { icon: <CheckCircle size={18} />, text: "Pronto em 2 minutos" },
              ].map((item, i) => (
                <motion.span
                  key={i}
                  whileHover={{ scale: 1.1, y: -3 }}
                  className="flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="text-green-400">{item.icon}</span>
                  {item.text}
                </motion.span>
              ))}
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white pt-20 pb-28 md:pb-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <motion.div
                className="flex items-center gap-2.5 mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-2xl ${BRAND.gradient} shadow-lg`}
                >
                  F
                </div>
                <span className="text-2xl font-bold">Freelinnk</span>
              </motion.div>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                A página de links que bota dinheiro no seu bolso. Feito com 💜 no
                Brasil para criadores do mundo todo.
              </p>
              <div className="flex gap-4">
                {[
                  {
                    icon: <Instagram size={20} />,
                    color:
                      "hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500",
                  },
                  { icon: <Youtube size={20} />, color: "hover:bg-red-500" },
                  { icon: <Linkedin size={20} />, color: "hover:bg-blue-600" },
                  {
                    icon: <MessageCircle size={20} />,
                    color: "hover:bg-green-500",
                  },
                ].map((social, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    whileHover={{ scale: 1.15, y: -5, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gray-400 hover:text-white ${social.color} transition-all duration-300`}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Produto</h4>
              <ul className="space-y-4 text-gray-400">
                {[
                  { href: "#funcionalidades", text: "Funcionalidades" },
                  { href: "#como-funciona", text: "Como Funciona" },
                  { href: "#depoimentos", text: "Depoimentos" },
                ].map((link, i) => (
                  <li key={i}>
                    <motion.a
                      href={link.href}
                      className="hover:text-white transition-colors inline-flex items-center gap-2 group"
                      whileHover={{ x: 5 }}
                    >
                      <motion.span
                        initial={{ width: 0 }}
                        whileHover={{ width: 10 }}
                        className="h-0.5 bg-indigo-500"
                      />
                      {link.text}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Legal</h4>
              <ul className="space-y-4 text-gray-400">
                {[
                  { href: "/terms-of-service", text: "Termos de Uso" },
                  { href: "/privacy-policy", text: "Privacidade" },
                  { href: "/privacy-policy", text: "LGPD" },
                ].map((link, i) => (
                  <li key={i}>
                    <motion.a
                      href={link.href}
                      className="hover:text-white transition-colors inline-flex items-center gap-2 group"
                      whileHover={{ x: 5 }}
                    >
                      <motion.span
                        initial={{ width: 0 }}
                        whileHover={{ width: 10 }}
                        className="h-0.5 bg-indigo-500"
                      />
                      {link.text}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2025 Freelinnk. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex items-center gap-2 text-gray-500 text-sm"
              >
                <Lock size={16} className="text-green-500" />
                Conexão Segura
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex items-center gap-2 text-gray-500 text-sm"
              >
                <Shield size={16} className="text-green-500" />
                LGPD
              </motion.div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}