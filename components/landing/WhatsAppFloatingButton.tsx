"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";

export default function WhatsAppFloatingButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const whatsappMessage = encodeURIComponent(
    "Olá! Sou lojista e quero usar o Freelinnk para escalar minhas vendas. Como vocês podem me ajudar?"
  );
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  useEffect(() => {
    const t1 = setTimeout(() => setIsVisible(true), 3000);
    const t2 = setTimeout(() => setShowTooltip(true), 6000);
    const t3 = setTimeout(() => setShowTooltip(false), 14000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[85] flex flex-col items-end gap-3"
    >
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-3.5 max-w-[210px] relative"
          >
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200"
            >
              <X size={10} />
            </button>
            <p className="text-xs text-gray-700">
              👋 Precisa de ajuda?{" "}
              <span className="text-green-600 font-semibold">Fale com um especialista.</span>
            </p>
            <div className="absolute -bottom-1.5 right-7 w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="group"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-current">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          {/* Simple online dot, no pulsing rings */}
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
          </span>
        </motion.div>

        <div className="hidden lg:flex absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white px-3 py-2 rounded-lg shadow-md border border-gray-100 whitespace-nowrap items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs font-semibold text-gray-800">Falar com Especialista</span>
          <ArrowRight size={12} className="text-green-500" />
        </div>
      </a>
    </motion.div>
  );
}
