"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon, QrCode, Share2, Star, Rocket, Lock,
  Monitor, ShoppingBag, ArrowLeft, MoreHorizontal,
  Link as LinkIcon, Heart, Zap, CheckCircle2
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function HeroPhoneSimulator() {
  const [scene, setScene] = useState(0);

  useEffect(() => {
    // Sequência de animação:
    // 0: Mostra Instagram (2s)
    // 1: Animação do Clique no Link (2s - Aumentado para animação mais realista)
    // 2: Mostra Página do Freelinnk e rola a tela (6.5s)
    const sequence = async () => {
      while (true) {
        setScene(0);
        await new Promise((r) => setTimeout(r, 2000));
        setScene(1);
        await new Promise((r) => setTimeout(r, 2000)); // Duração da animação de clique
        setScene(2);
        await new Promise((r) => setTimeout(r, 6500));
      }
    };
    sequence();
  }, []);

  return (
    <div className="relative">
      {/* Brilho de fundo */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-[60px] scale-110" />

      {/* Frame do Celular */}
      <motion.div
        className="relative w-[270px] sm:w-[300px] h-[550px] sm:h-[600px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl border border-gray-800 overflow-hidden"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
      >
        {/* Dynamic Island / Câmera notch */}
        <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-30">
          <div className="w-24 h-6 bg-gray-900 rounded-b-2xl" />
        </div>

        {/* Tela do Celular */}
        <div className="w-full h-full bg-[#000000] rounded-[2.5rem] overflow-hidden relative">
          <AnimatePresence mode="wait">

            {/* --- CENA 0 & 1: PERFIL DO INSTAGRAM --- */}
            {(scene === 0 || scene === 1) && (
              <motion.div
                key="instagram"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-[#000000] text-white p-4 pt-8 font-sans"
              >
                {/* Header Instagram */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <ArrowLeft size={22} className="text-white" />
                    <span className="font-bold text-[17px] tracking-tight">freelinnk_oficial</span>
                  </div>
                  <MoreHorizontal size={22} className="text-white" />
                </div>

                {/* Foto e Status */}
                <div className="flex items-center justify-between mb-4 pr-2">
                  <div className="w-16 h-16 rounded-full bg-[#7C3AED] flex items-center justify-center text-4xl font-black text-white shrink-0">
                    F
                  </div>
                  <div className="flex gap-5 text-center ml-4">
                    <div>
                      <div className="font-bold text-sm">5</div>
                      <div className="text-[11px] text-gray-300">posts</div>
                    </div>
                    <div>
                      <div className="font-bold text-sm">473</div>
                      <div className="text-[11px] text-gray-300">seguidores</div>
                    </div>
                    <div>
                      <div className="font-bold text-sm">196</div>
                      <div className="text-[11px] text-gray-300">seguindo</div>
                    </div>
                  </div>
                </div>

                {/* Bio do Instagram */}
                <div className="text-[13px] leading-[1.4] mb-3 text-gray-100 relative">
                  <div className="font-bold text-white mb-0.5">Freelinnk | Link na Bio</div>
                  <div className="text-gray-400 mb-1">Empresa de software</div>
                  <div>🚀 Transforme sua bio em uma máquina de vendas.</div>
                  <div>📲 Links•WhatsApp•clientes</div>
                  <div className="relative">
                    👇 Crie grátis
                    {/* Link Clicável - Atualizado para feedback de clique */}
                    <motion.div
                      animate={scene === 1 ? { backgroundColor: "rgba(30, 64, 175, 0.4)", color: "#93c5fd" } : { backgroundColor: "rgba(30, 64, 175, 0.2)", color: "#bfdbfe" }}
                      transition={{ duration: 0.1, delay: 1.6 }} // Feedback rápido após o toque
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[13px] font-medium mt-1"
                    >
                      <LinkIcon size={12} className="rotate-45" /> freelinnk.com/oficial
                    </motion.div>
                  </div>
                </div>

                {/* Animação do Dedo/Cursor clicando (Cena 1) - Atualizado e mais realista */}
                {scene === 1 && (
                  <motion.div
                    initial={{ y: 200, x: 150, opacity: 0 }}
                    animate={{
                      y: [200, 245, 245, 245], // Move para o link, clica, clica, clica (para dar tempo)
                      x: [150, 65, 65, 65],
                      opacity: [0, 1, 1, 1],
                      scale: [1, 1, 0.7, 1] // Sem escala no movimento, depois clica
                    }}
                    transition={{
                      duration: 1.8, // Duração total da animação de toque
                      times: [0, 0.7, 0.8, 1.0], // Movimento suave, clique rápido no final
                      ease: ["easeOut", "easeInOut", "easeInOut", "easeOut"]
                    }}
                    className="absolute z-20"
                  >
                    {/* Visual do Toque - Círculos que simulam o ponto de contato */}
                    <div className="relative flex items-center justify-center">
                      {/* Efeito de onda de choque no clique */}
                      <motion.div
                        animate={scene === 1 ? { scale: [0, 1.2, 0], opacity: [0, 0.3, 0] } : {}}
                        transition={{ duration: 0.3, delay: 1.5, repeat: 0 }}
                        className="absolute w-14 h-14 bg-white rounded-full"
                      />
                      {/* Círculo do ponto de toque principal com sombra */}
                      <motion.div
                        animate={scene === 1 ? { scale: [1, 0.7, 1] } : {}}
                        transition={{ duration: 0.2, delay: 1.5 }}
                        className="w-10 h-10 bg-white/40 rounded-full border-2 border-white/60 shadow-lg backdrop-blur-[2px]"
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* --- CENA 2: PÁGINA FREELINNK (Sua Landing Page de Link) --- */}
            {scene === 2 && (
              <motion.div
                key="freelinnk"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 bg-gradient-to-b from-[#6D28D9] via-[#9333EA] to-[#E9D5FF] overflow-hidden"
              >
                {/* Container de Rolagem Automática */}
                <motion.div
                  animate={{ y: [0, -400, -400, 0] }}
                  transition={{ duration: 5.5, delay: 0.5, ease: "easeInOut" }}
                  className="w-full pb-10"
                >
                  {/* Topo Roxo */}
                  <div className="p-4 pt-10 pb-12">
                    <div className="flex justify-between items-center text-white mb-6">
                      <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"><Moon size={14} /></div>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"><QrCode size={14} /></div>
                        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"><Share2 size={14} /></div>
                      </div>
                    </div>
                    <h1 className="text-center text-white text-3xl font-bold tracking-tight">Freelinnk</h1>
                  </div>

                  {/* Corpo Branco da Página de Links */}
                  <div className="bg-white rounded-t-[2.5rem] min-h-[600px] px-5 pb-10 mx-2 shadow-2xl relative">

                    {/* Foto de Perfil Centralizada com Bordas */}
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-[110px] h-[110px] bg-[#E9D5FF] rounded-full flex items-center justify-center z-10">
                      <div className="w-[90px] h-[90px] bg-white rounded-full flex items-center justify-center">
                        <div className="w-[80px] h-[80px] bg-[#7C3AED] rounded-full border-2 border-white flex items-center justify-center shadow-inner">
                          <span className="text-white text-[45px] font-black">F</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-[65px] text-center mb-6">
                      <h2 className="text-[#7C3AED] font-black text-xl mb-3">@oficial</h2>

                      <div className="inline-flex items-center gap-1.5 bg-white border border-gray-100 shadow-sm text-gray-700 text-[10px] font-semibold px-3 py-1.5 rounded-full mb-4">
                        <Star size={11} className="text-[#7C3AED]" /> Crie seu perfil grátis no <span className="text-[#7C3AED]">Freelinnk</span>
                      </div>

                      <p className="text-gray-700 text-[13px] leading-[1.6] px-1">
                        A solução brasileira para links na bio. 🇧🇷 <br />
                        Transforme seguidores em clientes com uma página rápida, bonita e 100% gratuita.
                      </p>

                      <div className="flex items-center justify-center gap-1.5 text-gray-400 text-[11px] mt-4">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        Desde 2025
                      </div>
                    </div>

                    {/* Título da Seção de Links */}
                    <div className="flex items-center gap-1.5 text-[#7C3AED] font-black text-sm mb-4">
                      <Star size={14} className="fill-[#7C3AED]" /> Links
                    </div>

                    {/* Botões Replicados */}
                    <div className="space-y-3 mb-6">
                      <LinkCard icon={<Rocket size={16} className="text-pink-500" />} text="Começar Gratuitamente" />
                      <LinkCard icon={<Lock size={16} className="text-orange-400" />} text="Já tenho conta (Fazer Login)" />
                      <LinkCard icon={<FaWhatsapp size={16} className="text-red-400" />} text="Preciso de Ajuda / Suporte" isWhatsapp />
                      <LinkCard icon={<Monitor size={16} className="text-cyan-500" />} text="Desenvolvido por Impulsione Web" subtitle />
                    </div>

                    {/* Anúncio / Ad Card Simulado */}
                    <div className="rounded-2xl bg-white border border-gray-100 shadow-md overflow-hidden mt-8 mb-4">
                      <div className="relative bg-gray-900 h-[220px]">
                        {/* Imagem Placeholder de Moda/Fitness que parece com o seu print */}
                        <img
                          src="https://images.unsplash.com/photo-1608228079968-c7681eaef81e?auto=format&fit=crop&q=80&w=400"
                          alt="Glam Fit"
                          className="w-full h-full object-cover opacity-90"
                        />
                        <div className="absolute top-3 left-3 bg-black/90 text-white text-[9px] font-bold px-2 py-1 rounded">
                          PATROCINADO
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-black text-[17px] text-gray-900 mb-1.5">Glam Fit</h3>
                        <p className="text-[12px] text-gray-600 mb-4 leading-relaxed">
                          ✨ Chegou o que você esperava! A Glam Fit é perfeita para o seu dia a dia. Qualidade premium que você merece. Toque aqui e saiba mais! 👇
                        </p>
                        <button className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl py-3 text-[13px] font-bold flex justify-center items-center gap-2 transition-colors">
                          <ShoppingBag size={14} /> Ver Oferta
                        </button>
                      </div>
                    </div>

                    {/* Banner Final CTA */}
                    <div className="bg-[#8B5CF6] rounded-2xl p-5 text-center mt-6 shadow-lg">
                      <div className="flex justify-center mb-1">
                        <Zap size={14} className="text-white fill-white" />
                      </div>
                      <h4 className="text-white font-black text-[15px] mb-1">Quer um perfil assim?</h4>
                      <p className="text-white/80 text-[10px] mb-3">Crie sua página com recursos exclusivos!</p>
                      <button className="bg-white text-[#7C3AED] font-bold text-[12px] py-2 px-6 rounded-full flex items-center justify-center gap-1.5 mx-auto">
                        <Star size={12} /> Começar Grátis
                      </button>
                    </div>

                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// --- Sub-componente para gerar os botões da página ---
function LinkCard({ icon, text, subtitle = false, isWhatsapp = false }: { icon: React.ReactNode, text: string, subtitle?: boolean, isWhatsapp?: boolean }) {
  return (
    <div className="w-full bg-[#E9D5FF]/40 border-[1.5px] border-[#8B5CF6] rounded-xl p-3 flex items-center justify-between hover:bg-[#E9D5FF]/60 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isWhatsapp ? 'bg-[#7C3AED]' : 'bg-[#7C3AED]'}`}>
          {isWhatsapp ? <FaWhatsapp size={18} className="text-white" /> : <div className="text-white font-black text-sm">F</div>}
        </div>
        <div className="flex items-center gap-2">
          {icon}
          <div className="flex flex-col">
            <span className="text-[13px] font-black text-gray-900 leading-tight">{text}</span>
            {subtitle && <span className="text-[10px] text-[#7C3AED] font-bold">Web</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded-full bg-[#8B5CF6] flex items-center justify-center">
          <Zap size={10} className="text-white fill-white" />
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <Heart size={10} /> <span className="text-[10px] font-medium">0</span>
        </div>
      </div>
    </div>
  );
}