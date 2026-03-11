"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Check,
  ChevronDown,
  Minus,
  Sparkles,
  Star,
} from "lucide-react";
import { BRAND, features, nichos, testimonials } from "../../app/constants/landing-data";
import { MagneticWrapper, ScrollReveal } from "@/components/Animaçoes/Animations";

export const RotatingText = () => {
  const words = ["Tráfego", "Vendas", "Lucro", "Leads Quentes"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-flex overflow-hidden h-[1.15em] align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ y: 40, opacity: 0, rotateX: -45 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          exit={{ y: -40, opacity: 0, rotateX: 45 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className={`${BRAND.textGradient} inline-block`}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

export const SocialProofToast = () => {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);

  const notifications = [
    { name: "Maria", city: "São Paulo", action: "vendeu um infoproduto" },
    { name: "João", city: "Rio de Janeiro", action: "ativou a Rede de Ads" },
    { name: "Ana", city: "Belo Horizonte", action: "instalou o Pixel na Vitrine" },
    { name: "Carlos", city: "Curitiba", action: "conseguiu +200 views no link" },
    { name: "Juliana", city: "Salvador", action: "assinou o plano Ultra" },
  ];

  useEffect(() => {
    const showNotification = () => {
      setVisible(true);
      setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          setCurrent((prev) => (prev + 1) % notifications.length);
        }, 500);
      }, 4000);
    };

    const timeout = setTimeout(showNotification, 5000);
    const interval = setInterval(showNotification, 12000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [notifications.length]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-24 md:bottom-6 left-4 z-[85] bg-white rounded-2xl shadow-2xl border border-gray-100 px-4 py-3 flex items-center gap-3 max-w-xs"
        >
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">
              {notifications[current].name}{" "}
              <span className="font-normal text-gray-500">
                de {notifications[current].city}
              </span>
            </p>
            <p className="text-xs text-green-600 font-medium">
              {notifications[current].action} agora mesmo
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ScrollReveal>
      <div
        className="bg-gray-50 rounded-2xl border border-gray-100 hover:border-indigo-100 transition-all duration-300 overflow-hidden cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between p-6">
          <h4 className="font-bold text-gray-900 flex items-start gap-3 flex-1 pr-4">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm flex-shrink-0 font-black">
              ?
            </span>
            <span>{q}</span>
          </h4>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
          </motion.div>
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-gray-600 text-sm px-6 pb-6 pl-[4.25rem] leading-relaxed">
                {a}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ScrollReveal>
  );
};

export const FeatureCard = ({ feature }: { feature: (typeof features)[0] }) => (
  <ScrollReveal className="h-full">
    <div className="relative bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all duration-300 h-full overflow-hidden group">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white shadow-sm`}
          >
            {feature.icon}
          </div>
          <span
            className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${
              feature.tag === "GRÁTIS"
                ? "bg-green-100 text-green-700"
                : feature.tag === "PRO"
                ? "bg-blue-100 text-blue-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {feature.tag}
          </span>
        </div>
        <h3 className="font-bold text-lg text-gray-900 mb-2">
          {feature.title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
      </div>
    </div>
  </ScrollReveal>
);

export const TestimonialCard = ({
  testimonial,
}: {
  testimonial: (typeof testimonials)[0];
}) => (
  <ScrollReveal className="h-full">
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-full flex flex-col justify-between hover:border-indigo-100 hover:shadow-md transition-all">
      <div>
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              size={16}
              className="text-yellow-400 fill-yellow-400"
            />
          ))}
        </div>
        <p className="text-gray-700 text-sm leading-relaxed mb-6 italic">
          &quot;{testimonial.text}&quot;
        </p>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={testimonial.avatar}
            alt={testimonial.author}
            className="w-10 h-10 rounded-full border border-gray-100 object-cover"
          />
          <div>
            <p className="font-bold text-sm text-gray-900">
              {testimonial.author}
            </p>
            <p className="text-xs text-gray-500">{testimonial.role}</p>
          </div>
        </div>
        <div className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full border border-green-100">
          {testimonial.increase}
        </div>
      </div>
    </div>
  </ScrollReveal>
);

export const HowItWorksStep = ({
  step,
  index,
  total,
}: {
  step: { icon: React.ReactNode; title: string; desc: string };
  index: number;
  total: number;
}) => {
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

export const NichoCard = ({ nicho }: { nicho: (typeof nichos)[0] }) => (
  <ScrollReveal>
    <div className="bg-white rounded-2xl p-4 border border-gray-100 hover:border-indigo-200 transition-all duration-300 cursor-pointer text-center group h-full hover:shadow-md">
      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3 text-gray-600 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
        {nicho.icon}
      </div>
      <p className="text-xs sm:text-sm font-bold text-gray-700 group-hover:text-indigo-700 transition-colors">
        {nicho.name}
      </p>
    </div>
  </ScrollReveal>
);

export const DifferentialCard = ({
  item,
}: {
  item: { icon: React.ReactNode; title: string; desc: string };
}) => (
  <ScrollReveal>
    <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 h-full hover:border-white/20">
      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
        {item.icon}
      </div>
      <h3 className="font-bold text-xl mb-2 text-white">{item.title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
    </div>
  </ScrollReveal>
);

export const ComparisonCell = ({
  value,
}: {
  value: boolean | "paid" | "partial";
}) => {
  if (value === true)
    return (
      <div className="flex justify-center">
        <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center">
          <Check size={16} className="text-green-600" />
        </div>
      </div>
    );
  if (value === false)
    return (
      <div className="flex justify-center">
        <div className="w-7 h-7 bg-red-50 rounded-full flex items-center justify-center">
          <Minus size={16} className="text-red-300" />
        </div>
      </div>
    );
  if (value === "paid")
    return (
      <span className="text-xs text-yellow-600 font-bold bg-yellow-50 px-2 py-1 rounded-full">
        💰 Caro
      </span>
    );
  if (value === "partial")
    return (
      <span className="text-xs text-yellow-600 font-bold bg-yellow-50 px-2 py-1 rounded-full">
        ⚠️ Limitado
      </span>
    );
  return null;
};