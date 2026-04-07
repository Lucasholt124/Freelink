"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Zap, BarChart3, Target } from "lucide-react";
import { BRAND } from "@/app/constants/landing-data";
import { ScrollReveal } from "../Animaçoes/Animations";

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
    <section className="py-14 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-semibold mb-3">
              <Play size={12} className="fill-red-600" /> Veja na Prática
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Veja como o Freelinnk{" "}
              <span className={BRAND.textGradient}>funciona</span>
            </h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">
              Em menos de 1 minuto, descubra como transformar sua Bio num funil automático de vendas.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="relative max-w-3xl mx-auto">
            <motion.div
              whileHover={{ scale: 1.005 }}
              className="relative bg-black rounded-2xl overflow-hidden shadow-xl border border-gray-800 aspect-video cursor-pointer group"
              onClick={handlePlay}
            >
              <video
                ref={videoRef}
                className={`w-full h-full object-contain bg-black transition-opacity duration-300 ${isPlaying ? "opacity-100" : "opacity-0 absolute inset-0"}`}
                src="/demo-freelinnk.mp4"
                controls={isPlaying}
                onEnded={() => setIsPlaying(false)}
                playsInline
              >
                Seu navegador não suporta vídeos.
              </video>

              {!isPlaying && (
                <div className="absolute inset-0 z-10 bg-gradient-to-br from-indigo-600 to-purple-700 flex flex-col items-center justify-center text-white p-8">
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.96 }}
                    className="w-16 h-16 md:w-20 md:h-20 bg-white/15 rounded-full flex items-center justify-center mb-5 border border-white/25 hover:bg-white/25 transition-colors"
                  >
                    <Play size={28} className="text-white fill-white ml-1" />
                  </motion.div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2">Assista ao Tour Completo</h3>
                  <p className="text-white/70 text-sm text-center max-w-sm">
                    Clique para ver a máquina de vendas em ação
                  </p>
                </div>
              )}
            </motion.div>

            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { icon: <Zap size={16} />, text: "Setup em 2 min" },
                { icon: <BarChart3 size={16} />, text: "Lucro Real" },
                { icon: <Target size={16} />, text: "Pixel de Ads" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="text-indigo-500">{item.icon}</div>
                  <span className="text-xs font-medium text-gray-600 text-center">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
