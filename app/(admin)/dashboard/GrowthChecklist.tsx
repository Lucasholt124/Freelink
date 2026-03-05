"use client";

import { CheckCircle2, Circle, Trophy, Copy, ExternalLink, Gift, Star, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function GrowthChecklist({ plan, clicks, username }: { plan: string, clicks: number, username: string }) {
  const [shared, setShared] = useState(false);
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    const hasShared = localStorage.getItem(`freelinnk_shared_${username}`);
    if (hasShared === 'true') {
      setShared(true);
    }
  }, [username]);

  const handleCopyLink = () => {
    const url = `https://freelinnk.com/${username}`;
    navigator.clipboard.writeText(url);
    setShared(true);
    localStorage.setItem(`freelinnk_shared_${username}`, 'true');
    toast.success("Link copiado! Tarefa concluída. ✅");
  };

  const tasks = [
    { label: "Criar seu primeiro link", done: true, xp: 10 },
    { label: "Personalizar foto de perfil", done: true, xp: 10 },
    { label: "Atingir 10 cliques únicos", done: clicks >= 10, xp: 20 },
    { label: "Compartilhar link no Instagram", done: shared, action: "Copiar Link", isShare: true, xp: 15 },
    { label: "Conectar Pixel de Rastreamento", done: plan !== 'free', isUltra: true, xp: 30 },
  ];

  const completed = tasks.filter(t => t.done).length;
  const progress = (completed / tasks.length) * 100;
  const totalXP = tasks.filter(t => t.done).reduce((sum, t) => sum + t.xp, 0);
  const maxXP = tasks.reduce((sum, t) => sum + t.xp, 0);
  const allDone = completed === tasks.length;

  // Mostra reward quando completar tudo
  useEffect(() => {
    if (allDone) {
      const hasSeenReward = localStorage.getItem(`freelinnk_checklist_reward_${username}`);
      if (!hasSeenReward) {
        setShowReward(true);
        localStorage.setItem(`freelinnk_checklist_reward_${username}`, 'true');
      }
    }
  }, [allDone, username]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Setup de Crescimento
        </h3>
        <div className="flex items-center gap-2">
          {/* GAMIFICAÇÃO: Mostra XP ganho */}
          <Badge variant="secondary" className="bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-100">
            <Star className="w-2.5 h-2.5 mr-1" />
            {totalXP}/{maxXP} XP
          </Badge>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
            {completed}/{tasks.length}
          </span>
        </div>
      </div>

      <div className="mb-5">
        <Progress value={progress} className="h-2 bg-slate-100 dark:bg-slate-800" />
        <p className="text-xs text-slate-400 mt-2 font-medium">
          {allDone
            ? "🎉 Setup completo! Você desbloqueou visibilidade máxima."
            : `Complete o setup para aumentar sua visibilidade em 3x e ganhar ${maxXP - totalXP} XP.`
          }
        </p>
      </div>

      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-3 flex items-center gap-3"
          >
            <Gift className="w-8 h-8 text-amber-500" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                🎁 Recompensa Desbloqueada!
              </p>
              <p className="text-xs text-amber-600/70">
                Você ganhou {maxXP} XP bônus. Seu perfil tem prioridade no destaque.
              </p>
            </div>
            <button onClick={() => setShowReward(false)} className="text-amber-400 hover:text-amber-600 text-xs font-bold">
              OK
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
        {tasks.map((task, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-3 ${task.done ? 'opacity-50' : 'opacity-100'}`}
          >
            {task.done ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              </motion.div>
            ) : (
              <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />
            )}

            <div className="flex-1 min-w-0 flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${task.done ? 'line-through decoration-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                  {task.label}
                </p>
                {!task.done && (
                  <p className="text-[9px] text-purple-500 font-bold">+{task.xp} XP</p>
                )}
              </div>

              {task.isUltra && !task.done && (
                <Link href="/dashboard/billing">
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold uppercase cursor-pointer hover:bg-purple-200 whitespace-nowrap flex items-center gap-1">
                    Ultra <ExternalLink className="w-2 h-2" />
                  </span>
                </Link>
              )}

              {task.isShare && !task.done && (
                <button
                  onClick={handleCopyLink}
                  className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold cursor-pointer hover:bg-blue-100 flex items-center gap-1 transition-colors whitespace-nowrap border border-blue-100"
                >
                  <Copy className="w-2 h-2" /> Copiar
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA PARA UPGRADE quando checklist quase completo */}
      {completed >= 3 && plan === 'free' && !allDone && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Link href="/dashboard/billing" className="flex items-center justify-between group cursor-pointer">
            <p className="text-[11px] text-slate-500 font-medium">
              🔓 Complete com o <span className="text-purple-600 font-bold">Plano Pro</span> e ganhe +30 XP
            </p>
            <ArrowRight className="w-3 h-3 text-purple-500 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </motion.div>
  );
}