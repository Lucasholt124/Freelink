"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { realPages } from "@/app/constants/landing-data";

export default function RealPagesShowcase() {
  const [isPaused, setIsPaused] = useState(false);
  const duplicatedPages = [...realPages, ...realPages, ...realPages];

  return (
    <div
      className="relative overflow-hidden py-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="absolute left-0 top-0 bottom-0 w-10 md:w-32 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-10 md:w-32 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex gap-5 md:gap-6"
        animate={{ x: isPaused ? undefined : [0, -1200] }}
        transition={{ x: { repeat: Infinity, repeatType: "loop", duration: 40, ease: "linear" } }}
        style={{ width: "fit-content" }}
      >
        {duplicatedPages.map((page, index) => (
          <div
            key={`${page.id}-${index}`}
            className="relative flex-shrink-0 w-[200px] sm:w-[230px] md:w-[260px] group"
          >
            <div className="relative bg-gray-900 rounded-[2rem] p-1.5 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <div className="absolute top-0 inset-x-0 h-4 flex justify-center z-10">
                <div className="w-16 h-4 bg-gray-900 rounded-b-lg" />
              </div>

              <div className="bg-gray-800 rounded-[1.7rem] overflow-hidden aspect-[9/18] relative">
                <img
                  src={page.image}
                  alt={page.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/260x460/1a1a2e/6366f1?text=${encodeURIComponent(page.name)}`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <p className="text-white font-bold text-sm leading-tight">{page.name}</p>
                  <p className="text-white/70 text-xs">{page.type}</p>
                  <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 rounded-full w-fit">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-[9px] text-white font-semibold uppercase">Ver página</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 text-center">
              <p className="font-semibold text-gray-800 text-xs group-hover:text-indigo-600 transition-colors">{page.name}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{page.type}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <p className="text-center mt-8 text-[10px] text-gray-400">
        * Páginas autorizadas pelos criadores para aparecer em nossa galeria.
      </p>
    </div>
  );
}
