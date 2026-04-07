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
  const base =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer active:scale-[0.98]";

  const variants = {
    default: `${BRAND.gradient} ${BRAND.gradientHover} text-white focus:ring-indigo-500 shadow-md hover:shadow-lg hover:-translate-y-px`,
    outline:
      "bg-white border border-gray-200 text-gray-700 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50",
    white:
      "bg-white text-gray-900 hover:bg-gray-50 shadow-md hover:shadow-lg hover:-translate-y-px",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  };

  const sizes = {
    sm: "px-3.5 py-2 text-xs gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-sm gap-2",
    xl: "px-8 py-3.5 text-base gap-2",
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};
