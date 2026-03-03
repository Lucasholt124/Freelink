"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { realPages } from "@/app/constants/landing-data";

export default function RealPagesShowcase() {
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const duplicatedPages = [...realPages, ...realPages, ...realPages];

  return (
    <div
      className="relative overflow-hidden py-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute left-0 top-0 bottom-0 w-10 md:w-40 bg-gradient-to-r from-gray-50 via-gray-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-10 md:w-40 bg-gradient-to-l from-gray-50 via-gray-50 to-transparent z-10 pointer-events-none" />

      <motion.div
        ref={containerRef}
        className="flex gap-6 md:gap-8"
        animate={{ x: isPaused ? undefined : [0, -1200] }}
        transition={{ x: { repeat: Infinity, repeatType: "loop", duration: 40, ease: "linear" } }}
        style={{ width: "fit-content" }}
      >
        {duplicatedPages.map((page, index) => (
          <motion.div
            key={`${page.id}-${index}`}
            className="relative flex-shrink-0 w-[240px] sm:w-[280px] md:w-[300px] group"
            whileHover={{ y: -20, scale: 1.05, zIndex: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.div className={`absolute -inset-4 bg-gradient-to-r ${page.color} rounded-[3rem] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />

            <div className="relative bg-gray-900 rounded-[2.5rem] p-2 shadow-xl group-hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-0 inset-x-0 h-5 flex justify-center z-10">
                <div className="w-20 h-5 bg-gray-900 rounded-b-xl" />
              </div>

              <div className="bg-gray-800 rounded-[2rem] overflow-hidden aspect-[9/18] relative">
                <motion.img
                  src={page.image}
                  alt={page.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/280x500/1a1a2e/6366f1?text=${encodeURIComponent(page.name)}`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4" />
                <motion.div
                  className="absolute bottom-0 left-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end items-center text-center z-20"
                  initial={{ y: 20 }}
                  whileHover={{ y: 0 }}
                >
                  <p className="text-white font-bold text-lg leading-tight mb-1 w-full break-words">{page.name}</p>
                  <p className="text-white/80 text-sm font-medium">{page.type}</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur rounded-full">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-white font-bold uppercase">Ver página</span>
                  </div>
                </motion.div>
              </div>
            </div>

            <motion.div className="mt-4 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <motion.p className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors" whileHover={{ scale: 1.05 }}>{page.name}</motion.p>
              <p className="text-xs text-gray-500 mt-0.5">{page.type}</p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      <div className="text-center mt-12">
        <p className="text-[10px] text-gray-400">* As páginas exibidas foram autorizadas pelos criadores para aparecer em nossa galeria pública.</p>
        <motion.p className="text-center text-sm text-gray-400 mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}>Passe o mouse para pausar ✨</motion.span>
        </motion.p>
      </div>
    </div>
  );
}