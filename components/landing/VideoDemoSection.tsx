"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Zap, BarChart3, Target } from "lucide-react";
import { ScrollReveal } from "../Animaçoes/Animations";
import { BRAND } from "@/app/constants/landing-data";

export default function VideoDemoSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-bold mb-4">
              <Play size={16} className="fill-red-700" /> Veja na Prática
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              Veja como o Freelinnk <span className={BRAND.textGradient}>funciona</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Em menos de 1 minuto, descubra como transformar sua Bio num funil automático de vendas.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl opacity-50" />

            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-800 aspect-video cursor-pointer group"
              onClick={handlePlay}
            >
              <video
                ref={videoRef}
                className={`w-full h-full object-contain bg-black transition-opacity duration-500 ${isPlaying ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
                src="/demo-freelinnk.mp4"
                controls={isPlaying}
                onEnded={() => setIsPlaying(false)}
                playsInline
              >
                Seu navegador não suporta vídeos.
              </video>

              {!isPlaying && (
                <div className="absolute inset-0 z-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-90" />
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')]" />
                  </div>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-24 h-24 md:w-32 md:h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 border-2 border-white/30 group-hover:bg-white/30 transition-colors relative"
                    >
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-white/50"
                        animate={{ scale: [1, 1.3, 1.3], opacity: [0.5, 0, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <Play size={40} className="text-white fill-white ml-2" />
                    </motion.div>

                    <h3 className="text-2xl md:text-3xl font-black mb-2 text-center">
                      Assista ao Tour Completo
                    </h3>
                    <p className="text-white/80 text-sm md:text-base text-center max-w-md">
                      Clique para ver a máquina de vendas em ação
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { icon: <Zap size={20} />, text: "Setup em 2 min" },
                { icon: <BarChart3 size={20} />, text: "Lucro Real" },
                { icon: <Target size={20} />, text: "Pixel de Ads" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
                >
                  <div className="text-indigo-500">{item.icon}</div>
                  <span className="text-sm font-bold text-gray-700 text-center">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}