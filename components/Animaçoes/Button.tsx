
import React from "react";
import clsx from "clsx";
import { BRAND } from "@/app/constants/landing-data";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "white" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "default",
  size = "md",
  className,
  children,
  ...props
}) => {
  const base = "inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer active:scale-[0.98]";

  const variants = {
    default: `${BRAND.gradient} ${BRAND.gradientHover} text-white focus:ring-[#6366f1] shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5`,
    outline: "bg-white border-2 border-gray-200 text-gray-700 hover:border-[#6366f1] hover:text-[#6366f1] hover:bg-indigo-50/50",
    white: "bg-white text-gray-900 hover:bg-gray-50 shadow-xl hover:shadow-2xl hover:-translate-y-0.5",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  };

  const sizes = {
    sm: "px-4 py-2.5 text-sm gap-2",
    md: "px-6 py-3 text-sm gap-2",
    lg: "px-8 py-4 text-base gap-2",
    xl: "px-10 py-5 text-lg gap-3",
  };

  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
};