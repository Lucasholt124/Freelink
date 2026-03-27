"use client";

import { motion } from "framer-motion";
import { Rocket, PartyPopper, Check, Loader2, Globe, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepLaunchingProps {
  launchProgress: number;
  launchChecklist: {
    profile: boolean;
    customization: boolean;
    links: boolean;
    publishing: boolean;
  };
  validLinksCount: number;
  username: string;
}

const LaunchChecklistItem = ({ label, completed, active, delay }: { label: string; completed: boolean; active: boolean; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className={cn(
      "flex items-center gap-3 p-3 rounded-xl transition-all duration-500",
      completed
        ? "bg-emerald-50 border border-emerald-100"
        : active
          ? "bg-violet-50 border border-violet-200"
          : "bg-slate-50 border border-slate-100"
    )}
  >
    <div
      className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300",
        completed ? "bg-emerald-500" : active ? "bg-violet-500 animate-pulse" : "bg-slate-200"
      )}
    >
      {completed ? (
        <Check className="w-4 h-4 text-white" />
      ) : active ? (
        <Loader2 className="w-4 h-4 text-white animate-spin" />
      ) : (
        <div className="w-2 h-2 bg-slate-300 rounded-full" />
      )}
    </div>
    <span
      className={cn(
        "text-sm font-medium transition-colors",
        completed ? "text-emerald-700" : active ? "text-violet-700" : "text-slate-400"
      )}
    >
      {label}
    </span>
  </motion.div>
);

export function StepLaunching({
  launchProgress,
  launchChecklist,
  validLinksCount,
  username,
}: StepLaunchingProps) {
  return (
    <motion.div
      key="launching"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-8 py-4"
    >
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="relative mx-auto w-28 h-28"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full blur-2xl opacity-30 animate-pulse" />
        <div className="relative w-full h-full bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full flex items-center justify-center">
          {launchProgress >= 100 ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
              <PartyPopper className="w-14 h-14 text-violet-600" />
            </motion.div>
          ) : (
            <Rocket className="w-14 h-14 text-violet-600" />
          )}
        </div>

        {launchProgress < 100 &&
          [...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-violet-400 rounded-full"
              style={{ left: "50%", bottom: 0 }}
              animate={{
                y: [0, 60],
                x: [(i - 2.5) * 15, (i - 2.5) * 30],
                opacity: [1, 0],
                scale: [1, 0.5],
              }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.1, ease: "easeOut" }}
            />
          ))}
      </motion.div>

      <div className="space-y-2">
        <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl sm:text-3xl font-black text-slate-900">
          {launchProgress < 100 ? "Criando sua página..." : "Página criada! 🎉"}
        </motion.h2>
        <p className="text-slate-500 text-sm">
          {launchProgress < 100 ? "Isso leva apenas alguns segundos" : "Redirecionando para o dashboard..."}
        </p>
      </div>

      <div className="max-w-sm mx-auto space-y-2 text-left">
        <LaunchChecklistItem label="Salvando perfil e foto" completed={launchChecklist.profile} active={!launchChecklist.profile && launchProgress > 0} delay={0} />
        <LaunchChecklistItem label="Aplicando template e cores" completed={launchChecklist.customization} active={launchChecklist.profile && !launchChecklist.customization} delay={0.1} />
        <LaunchChecklistItem label={`Adicionando ${validLinksCount} link${validLinksCount !== 1 ? "s" : ""}`} completed={launchChecklist.links} active={launchChecklist.customization && !launchChecklist.links} delay={0.2} />
        <LaunchChecklistItem label="Publicando na web" completed={launchChecklist.publishing} active={launchChecklist.links && !launchChecklist.publishing} delay={0.3} />
      </div>

      <div className="max-w-xs mx-auto">
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${launchProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-slate-400 text-sm mt-2 font-medium">{launchProgress}%</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: launchProgress >= 100 ? 1 : 0.5, y: 0 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200"
      >
        <Globe className="w-4 h-4 text-emerald-600" />
        <span className="text-emerald-700 font-medium">freelinnk.com/{username}</span>
        <ExternalLink className="w-4 h-4 text-emerald-400" />
      </motion.div>
    </motion.div>
  );
}