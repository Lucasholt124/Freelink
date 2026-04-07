"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, ChevronDown } from "lucide-react";

// --- Rotating Text (simpler, no spring bounce) ---
const words = ["Cartão de Visitas", "Agrupador de Botões", "Link Genérico", "Oportunidade Perdida"];
export const RotatingText = () => {
  return (
    <span className="inline-block relative text-red-400 line-through decoration-2">
      Agrupador de Botões
    </span>
  );
};

// --- Social Proof Toast (simpler, less disruptive) ---
const toasts = [
  { name: "Mariana Costa", action: "acabou de criar sua vitrine" },
  { name: "Ricardo Sales", action: "ativou o Hub de Anúncios" },
  { name: "Ana Paula", action: "fez o 1º sorteio no Instagram" },
];
export const SocialProofToast = () => {
  const [visible, setVisible] = React.useState(false);
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    const show = setTimeout(() => setVisible(true), 6000);
    return () => clearTimeout(show);
  }, []);
  React.useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % toasts.length);
        setVisible(true);
      }, 3000);
    }, 5000);
    return () => clearTimeout(t);
  }, [visible, idx]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-20 md:bottom-6 left-4 z-[95] bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 max-w-[260px]"
        >
          <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
            <CheckCircle size={14} className="text-indigo-600" />
          </div>
          <p className="text-xs text-gray-700 leading-snug">
            <span className="font-semibold">{toasts[idx].name}</span>{" "}
            {toasts[idx].action}
          </p>
          <button onClick={() => setVisible(false)} className="shrink-0 text-gray-300 hover:text-gray-500">
            <X size={12} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- FAQ Item ---
export const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-900 pr-4">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-gray-400 shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Feature Card ---
export const FeatureCard = ({
  icon,
  title,
  desc,
  tag,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  tag: string;
  color: string;
}) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-white`}>
        {icon}
      </div>
      <span
        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tag === "GRÁTIS"
          ? "bg-green-100 text-green-700"
          : tag === "PRO"
            ? "bg-indigo-100 text-indigo-700"
            : "bg-purple-100 text-purple-700"
          }`}
      >
        {tag}
      </span>
    </div>
    <h3 className="font-semibold text-sm text-gray-900 mb-1">{title}</h3>
    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
  </div>
);

// --- How It Works Step ---
export const HowItWorksStep = ({
  step,
  index,
  total,
}: {
  step: { icon: React.ReactNode; title: string; desc: string };
  index: number;
  total: number;
}) => (
  <div className="relative flex flex-col items-center text-center">
    {index < total - 1 && (
      <div className="hidden lg:block absolute top-7 left-[calc(50%+2.5rem)] right-0 h-px bg-gray-200 border-dashed" />
    )}
    <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 relative z-10">
      {step.icon}
      <span className="absolute -top-2 -right-2 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
        {index + 1}
      </span>
    </div>
    <h3 className="font-semibold text-sm text-gray-900 mb-1">{step.title}</h3>
    <p className="text-xs text-gray-500 leading-relaxed max-w-[160px]">{step.desc}</p>
  </div>
);

// --- Differential Card ---
export const DifferentialCard = ({
  item,
}: {
  item: { icon: React.ReactNode; title: string; desc: string };
}) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-colors">
    <div className="w-9 h-9 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-300 mb-3">
      {item.icon}
    </div>
    <h3 className="font-semibold text-sm text-white mb-1.5">{item.title}</h3>
    <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
  </div>
);

// --- Comparison Cell ---
export const ComparisonCell = ({
  value,
}: {
  value: true | false | "paid" | "partial";
}) => {
  if (value === true)
    return (
      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle size={14} className="text-indigo-600" />
      </div>
    );
  if (value === false)
    return (
      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
        <X size={14} className="text-gray-400" />
      </div>
    );
  if (value === "paid")
    return <span className="text-xs text-amber-600 font-medium">Pago</span>;
  return <span className="text-xs text-gray-400 font-medium">Parcial</span>;
};
