"use client";

import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { NicheOption } from "@/app/constants/onboarding-data";


interface StepNicheProps {
  nicheSearch: string;
  setNicheSearch: (val: string) => void;
  filteredNiches: NicheOption[];
  onNicheSelect: (niche: NicheOption) => void;
}

export function StepNiche({
  nicheSearch,
  setNicheSearch,
  filteredNiches,
  onNicheSelect,
}: StepNicheProps) {
  return (
    <motion.div
      key="niche"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-5"
    >
      <div className="space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900"
        >
          O que você{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
            faz?
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500"
        >
          Vamos personalizar sua página para sua área 🎯
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="relative">
          <Input
            className="h-11 rounded-xl border-slate-200 pl-10 placeholder:text-slate-300 focus-visible:ring-violet-500"
            placeholder="Buscar sua área..."
            value={nicheSearch}
            onChange={(e) => setNicheSearch(e.target.value)}
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {nicheSearch && (
            <button
              onClick={() => setNicheSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar pb-2"
      >
        {filteredNiches.length === 0 ? (
          <div className="col-span-full py-8 text-center">
            <p className="text-slate-400 text-sm">Nenhuma área encontrada.</p>
            <button
              onClick={() => setNicheSearch("")}
              className="text-violet-600 text-sm font-medium mt-2 hover:underline"
            >
              Limpar busca
            </button>
          </div>
        ) : (
          filteredNiches.map((niche, i) => (
            <motion.button
              key={niche.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.02 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNicheSelect(niche)}
              className="relative p-4 rounded-xl bg-white border-2 border-slate-100 hover:border-violet-300 hover:shadow-lg text-left group transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{niche.emoji}</span>
                <div
                  className={cn(
                    "p-1.5 rounded-lg bg-gradient-to-br text-white",
                    niche.gradient
                  )}
                >
                  {niche.icon}
                </div>
              </div>
              <p className="text-slate-900 font-bold text-sm mb-0.5">
                {niche.name}
              </p>
              <p className="text-slate-400 text-xs line-clamp-1">
                {niche.description}
              </p>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/0 to-indigo-500/0 group-hover:from-violet-500/5 group-hover:to-indigo-500/5 transition-all pointer-events-none" />
            </motion.button>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}