"use client";

import React from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

export const HotBadge = () => (
  <motion.span
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-black rounded-full uppercase tracking-wide"
  >
    <motion.span
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, -10, 10, 0]
      }}
      transition={{
        duration: 0.6,
        repeat: Infinity,
        repeatDelay: 1
      }}
    >
      <Flame size={10} />
    </motion.span>
    HOT
  </motion.span>
);

export const AnimatedCounter = ({ value, prefix = "", suffix = "" }: { value: string; prefix?: string; suffix?: string }) => (
  <span className="tabular-nums">
    {prefix}{value}{suffix}
  </span>
);