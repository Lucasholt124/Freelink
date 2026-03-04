import React from "react";
import { cn } from "@/lib/utils";

export function FreelinnkLogo({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const sizes = {
    small: { container: "w-8 h-8", text: "text-base", letter: "text-sm" },
    default: { container: "w-10 h-10", text: "text-lg", letter: "text-base" },
    large: { container: "w-14 h-14", text: "text-2xl", letter: "text-xl" },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        s.container,
        "rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30"
      )}>
        <span className={cn("font-black text-white", s.letter)}>F</span>
      </div>
      <span className={cn("font-bold text-slate-900", s.text)}>Freelinnk</span>
    </div>
  );
}