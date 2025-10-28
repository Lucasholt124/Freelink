"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function MovingBorder({
  children,
  duration = 2000,
  className,
  containerClassName,
  borderClassName,
  ...otherProps
}: {
  children: React.ReactNode;
  duration?: number;
  className?: string;
  containerClassName?: string;
  borderClassName?: string;
  [key: string]: any;
}) {
  return (
    <div
      className={cn("relative p-[1px] overflow-hidden", containerClassName)}
      {...otherProps}
    >
      <div
        className={cn(
          "absolute inset-0",
          borderClassName
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 animate-spin-slow" />
      </div>
      <div className={cn("relative bg-black rounded-lg", className)}>
        {children}
      </div>
    </div>
  );
}