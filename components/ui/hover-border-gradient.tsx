"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type HoverBorderGradientProps = {
  containerClassName?: string;
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
  [key: string]: unknown;
};

export const HoverBorderGradient = ({
  containerClassName,
  className,
  children,
  as: Component = "div",
  ...props
}: HoverBorderGradientProps) => {
  const [hovered, setHovered] = useState(false);
  const [, setDirection] = useState<"top" | "bottom" | "left" | "right">("top");

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setHovered(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    const horizontal = x < width / 2 ? "left" : "right";
    const vertical = y < height / 2 ? "top" : "bottom";

    if (Math.abs(x - width / 2) > Math.abs(y - height / 2)) {
      setDirection(horizontal);
    } else {
      setDirection(vertical);
    }
  };

  return (
    <Component
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
      className={cn("relative p-[2px] overflow-hidden", containerClassName)}
      {...props}
    >
      <motion.div // Alterado para usar a direção
        variants={{
          initial: {
            x: "100%",
            opacity: 0,
          },
          animate: {
            x: "0%",
            opacity: 1,
          },
          exit: {
            x: "-100%",
            opacity: 0,
          },
        }}
        initial="initial"
        animate={hovered ? "animate" : "exit"}
        transition={{
          duration: 0.5,
          ease: "backOut",
        }}
        className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500"
      />
      <div className={cn("relative z-10 bg-black rounded-[inherit]", className)}>
        {children}
      </div>
    </Component>
  );
};