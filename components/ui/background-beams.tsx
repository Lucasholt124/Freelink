"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden",
        className
      )}
    >
      <svg
        className="absolute h-full w-full"
        viewBox="0 0 1000 1000"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="beam1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0" />
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="beam2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0" />
            <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[...Array(5)].map((_, i) => (
          <motion.line
            key={i}
            x1="0"
            y1="0"
            x2="1000"
            y2="1000"
            stroke={`url(#beam${i % 2 + 1})`}
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              transform: `rotate(${i * 20}deg) translateX(${i * 100}px)`,
              transformOrigin: "center",
            }}
          />
        ))}
      </svg>
    </div>
  );
};