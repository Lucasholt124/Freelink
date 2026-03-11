"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   Megaphone, Check, Target, Crosshair, QrCode, Share2,
  BadgeCheck, Instagram, Store, ShoppingBag, BookOpen,
   DollarSign, Calculator
} from "lucide-react";
import { FloatingElement } from "../Animaçoes/Animations";

export default function HeroPhoneSimulator() {
  const [step, setStep] = useState(0);
  const [isDark] = useState(false);
  const [likes, setLikes] = useState<{ [key: string]: number }>({
    instagram: 12, loja: 8, oferta: 47, ebook: 23,
  });

  useEffect(() => {
    // Muda de tela a cada 4 segundos para dar tempo de ler
    const timer = setInterval(() => setStep(s => (s + 1) % 5), 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (step === 2) {
      const likeTimer = setInterval(() => {
        setLikes(prev => ({ ...prev, oferta: prev.oferta + 1 }));
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
              <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white flex flex-col items-center justify-center p-8">
                <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                  <Target className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Setup de Vendas</h3>
                <p className="text-sm text-gray-500 mb-6 text-center">Conectando sua loja...</p>
                <div className="w-full bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-2">
                    <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-0.5 h-5 bg-indigo-500 rounded-full" />
                    <motion.span className="text-sm text-gray-600 font-medium" initial={{ width: 0 }} animate={{ width: "auto" }}>
                      Instalando Pixel do Facebook...
                    </motion.span>
                  </div>
                </div>
                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 3 }} className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mt-6" />
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="creating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-700 flex flex-col items-center justify-center p-8 text-white">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="mb-6">
                  <Megaphone className="w-16 h-16 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold mb-8 text-center">Ativando o<br/>Hub de Anúncios</h3>
                <div className="w-full space-y-3">
                  {[
                    { text: "Buscando o seu nicho", delay: 0 },
                    { text: "Procurando páginas parceiras", delay: 0.4 },
                    { text: "Distribuindo seus produtos", delay: 0.8 },
                    { text: "Tráfego Automático Ligado!", delay: 1.2 },
                  ].map((item, i) => (
                    <motion.div key={i} initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: item.delay }} className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl p-3">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: item.delay + 0.3, type: "spring" }} className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-gray-900 font-bold" />
                      </motion.div>
                      <span className="text-sm font-bold text-white">{item.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="preview" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className={`absolute inset-0 overflow-hidden transition-colors duration-300 ${isDark ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" : "bg-gradient-to-br from-gray-50 to-white"}`}>
                <div className="flex items-center justify-between px-4 pt-8 pb-2">
                  <motion.button whileTap={{ scale: 0.9 }} className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-600">
                     <Target size={14} />
                  </motion.button>
                  <div className="flex items-center gap-2">
                    <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }} className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-600">
                      <QrCode size={14} />
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.1 }} className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-600">
                      <Share2 size={14} />
                    </motion.button>
                  </div>
                </div>

                <div className="px-6 pt-2 pb-4 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", bounce: 0.5 }} className="relative w-20 h-20 mx-auto mb-3">
                    <img src="https://i.pravatar.cc/200?img=32" className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl" alt="Profile" />
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                      <BadgeCheck size={10} className="text-white" />
                    </motion.div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex items-center justify-center gap-1.5 mb-1">
                    <h3 className="font-black text-lg text-gray-900">@loja.exemplo</h3>
                  </motion.div>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-xs mb-2 text-gray-500 font-medium">As melhores ofertas, envio para todo Brasil 🚀</motion.p>
                </div>

                <div className="px-4 space-y-2.5 overflow-y-auto max-h-[280px] pb-4">
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-[10px] font-black uppercase tracking-wider px-2 text-gray-400">Produtos</motion.p>
                  {[
                    { icon: <Store size={16} />, text: "Acessar Loja Completa", likes: likes.loja, color: "from-blue-500 to-indigo-500" },
                    { icon: <ShoppingBag size={16} />, text: "🔥 Oferta do Dia (50% OFF)", likes: likes.oferta, color: "from-orange-500 to-red-500", highlight: true },
                    { icon: <Instagram size={16} />, text: "Nosso Instagram", likes: likes.instagram, color: "from-pink-500 to-purple-500" },
                    { icon: <BookOpen size={16} />, text: "Catálogo PDF", likes: likes.ebook, color: "from-teal-500 to-emerald-500" },
                  ].map((link, i) => (
                    <motion.div key={i} initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.7 + i * 0.1 }} whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }} className={`relative rounded-2xl p-3.5 flex items-center justify-between cursor-pointer group overflow-hidden ${link.highlight ? `bg-gradient-to-r ${link.color} shadow-lg` : "bg-gray-100 hover:bg-gray-200 border border-gray-200"}`}>
                      {link.highlight && (
                        <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" animate={{ x: ["-100%", "100%"] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} />
                      )}
                      <div className="flex items-center gap-3 relative z-10">
                        <span className={link.highlight ? "text-white" : "text-gray-700"}>{link.icon}</span>
                        <span className={`text-sm font-bold ${link.highlight ? "text-white" : "text-gray-800"}`}>{link.text}</span>
                      </div>
                      <motion.div whileTap={{ scale: 1.3 }} className={`flex items-center gap-1 relative z-10 ${link.highlight ? "text-white/90" : "text-gray-500"}`}>
                        <Crosshair size={12} className={link.highlight ? "" : "text-indigo-500"} />
                        <motion.span key={link.likes} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-xs font-bold">{link.likes}</motion.span>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-gray-900 text-lg">Analytics Live</h3>
                  <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="flex items-center gap-1 text-[10px] text-green-600 font-bold bg-green-100 px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> AO VIVO
                  </motion.span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: "Visitas Hub", value: "1.240", change: "+45%" },
                    { label: "Conversão", value: "8.4%", change: "+2%" },
                  ].map((stat, i) => (
                    <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                      <p className="text-[10px] text-gray-400 uppercase font-black">{stat.label}</p>
                      <p className="text-2xl font-black text-indigo-600 my-1">{stat.value}</p>
                      <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded">{stat.change} hoje</span>
                    </motion.div>
                  ))}
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                  <p className="text-xs font-bold text-gray-700 mb-3">Origem do Tráfego</p>
                  {[
                    { city: "Campanha Hub #1", time: "agora" },
                    { city: "Remarketing Pixel FB", time: "2min" },
                    { city: "Campanha Hub #2", time: "5min" },
                  ].map((click, i) => (
                    <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}>
                          <Megaphone size={12} className="text-purple-500" />
                        </motion.div>
                        <span className="text-xs font-medium text-gray-700">{click.city}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">{click.time}</span>
                    </motion.div>
                  ))}
                </div>
                <motion.div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 text-white shadow-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Calculator size={14} />
                    <span className="text-[10px] font-black uppercase">Calculadora de Lucro</span>
                  </div>
                  <p className="text-sm font-bold mt-1">Margem líquida hoje: <span className="text-xl">32%</span> 📈</p>
                </motion.div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="sale" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-6">
                <motion.div initial={{ y: 30 }} animate={{ y: 0 }} className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 w-full text-center">
                  <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", bounce: 0.5 }} className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <DollarSign className="w-10 h-10 text-white" />
                  </motion.div>
                  <motion.h2 className="text-2xl font-black text-gray-900 mb-1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>Nova Venda!</motion.h2>
                  <p className="text-sm text-gray-500 font-medium mb-6">Origem: Hub de Anúncios</p>
                  <motion.div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100" initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
                    <p className="text-xs text-green-700 uppercase font-black mb-1">LUCRO LÍQUIDO</p>
                    <motion.p initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: "spring" }} className="text-4xl font-black text-green-600">R$ 147,90</motion.p>
                  </motion.div>
                  <motion.div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-gray-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Seu funil automático está rodando.</span>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div key={i} animate={{ width: step === i ? 16 : 6, backgroundColor: step === i ? "#4f46e5" : "#d1d5db" }} className="h-1.5 rounded-full" />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Floating Badges laterais */}
      <FloatingElement delay={0} duration={4} y={10}>
        <motion.div className="absolute -top-4 -left-4 sm:top-8 sm:-left-16 bg-white rounded-2xl p-3 shadow-xl border border-gray-100 hidden sm:flex items-center gap-3 z-10" whileHover={{ scale: 1.05 }}>
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase">Pixel Ativo</p>
            <p className="text-lg font-black text-gray-900">Rastreando</p>
          </div>
        </motion.div>
      </FloatingElement>

      <FloatingElement delay={1} duration={5} y={12}>
        <motion.div className="absolute -bottom-4 -right-4 sm:bottom-20 sm:-right-16 bg-white rounded-2xl p-3 shadow-xl border border-gray-100 hidden sm:flex items-center gap-3 z-10" whileHover={{ scale: 1.05 }}>
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase">Hub de Anúncios</p>
            <p className="text-lg font-black text-gray-900">Online</p>
          </div>
        </motion.div>
      </FloatingElement>
    </div>
  );
}