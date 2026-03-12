"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2, Check, X, ArrowRight, Eye, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { NicheOption } from "@/app/constants/onboarding-data";

interface StepUsernameProps {
  selectedNiche: NicheOption | null;
  username: string;
  setUsername: (val: string) => void;
  debouncedUsername: string;
  checkAvailability?: {
    available: boolean;
  };
  isUsernameValid: boolean;
  loading: boolean;
  onSubmit: () => void;
  usernameSuggestions: string[];
  onShowPreview: () => void;
}

export function StepUsername({
  selectedNiche,
  username,
  setUsername,
  debouncedUsername,
  checkAvailability,
  isUsernameValid,
  loading,
  onSubmit,
  usernameSuggestions,
  onShowPreview,
}: StepUsernameProps) {
  return (
    <motion.div
      key="username"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {selectedNiche && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl border border-slate-100 bg-slate-50"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedNiche.emoji}</span>
            <div>
              <p className="text-slate-900 font-bold">{selectedNiche.name}</p>
              <p className="text-slate-500 text-sm">O Hub de Ads focará nesse nicho.</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900"
        >
          Garanta seu{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
            @link
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 font-medium"
        >
          O endereço profissional da sua vitrine.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <div className="relative">
          <div className="bg-white rounded-2xl border-2 border-slate-200 focus-within:border-emerald-500 transition-colors overflow-hidden shadow-sm">
            <div className="flex items-center">
              <span className="px-4 py-4 text-slate-400 font-bold text-sm whitespace-nowrap border-r border-slate-200 bg-slate-50">
                freelinnk.com/
              </span>
              <Input
                className="flex-1 h-14 bg-transparent border-0 text-slate-900 text-lg font-bold placeholder:text-slate-300 focus-visible:ring-0 px-4"
                placeholder="sua-loja"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 30)
                  )
                }
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (isUsernameValid && !loading) {
                      onSubmit();
                    }
                  }
                }}
              />
              <div className="pr-4">
                <AnimatePresence mode="wait">
                  {username.length >= 3 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        debouncedUsername !== username
                          ? "bg-slate-100"
                          : checkAvailability?.available
                          ? "bg-emerald-500"
                          : checkAvailability === undefined
                          ? "bg-slate-100"
                          : "bg-red-500"
                      )}
                    >
                      {debouncedUsername !== username || checkAvailability === undefined ? (
                        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                      ) : checkAvailability?.available ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <X className="w-5 h-5 text-white" />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {username.length >= 3 && debouncedUsername === username && checkAvailability && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold",
                checkAvailability.available
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              )}
            >
              {checkAvailability.available ? (
                <>
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Esse nome está livre! Garanta agora.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Já existe alguém usando esse nome. Tente outro!</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {usernameSuggestions.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 pt-2">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Zap size={12} className="text-emerald-500" /> Sugestões Rápidas:
            </p>
            <div className="flex flex-wrap gap-2">
              {usernameSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setUsername(suggestion.slice(0, 30))}
                  className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-emerald-100 hover:text-emerald-700 transition-colors shadow-sm"
                >
                  {suggestion.slice(0, 20)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          onClick={onSubmit}
          disabled={!isUsernameValid || loading}
          className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 disabled:opacity-50 group"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Garantir Link
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </motion.div>

      <button
        onClick={onShowPreview}
        className="lg:hidden w-full flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <Eye className="w-4 h-4" />
        <span className="text-sm font-bold uppercase">Ver preview</span>
      </button>
    </motion.div>
  );
}