"use client";

import { Flame } from "lucide-react";

export const HotBadge = () => (
  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] font-bold rounded-full uppercase tracking-wide">
    <Flame size={9} />
    HOT
  </span>
);
