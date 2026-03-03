"use client";

import React from "react";
import { motion } from "framer-motion";

export const ScrollReveal = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "0px 0px -50px 0px" }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

export const FloatingElement = ({ children, delay = 0, y = 10, duration = 6 }: { children: React.ReactNode; delay?: number; y?: number; duration?: number }) => (
  <motion.div
    animate={{ y: [-y, y, -y] }}
    transition={{ repeat: Infinity, duration, delay, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

export const MagneticWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="relative inline-block">{children}</div>
);