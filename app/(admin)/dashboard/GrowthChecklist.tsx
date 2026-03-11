"use client";

import { CheckCircle2, Circle, Trophy, Copy, ExternalLink, Target, Star, ArrowRight } from "lucide-react";
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
    toast.success("Link copiado! Coloque na sua bio do Instagram.");
  };

  const tasks = [
    { label: "Cadastrar seu 1º Produto", done: true, xp: 10 },
    { label: "Personalizar as Cores da Vitrine", done: true, xp: 10 },
    { label: "Atrair os primeiros 10 leads", done: clicks >= 10, xp: 20 },
    { label: "Copiar e Colar na sua Bio", done: shared, action: "Copiar", isShare: true, xp: 15 },
    { label: "Conectar Pixel / Criar 1º Anúncio", done: plan !== 'free', isUltra: true, xp: 30 },
  ];

  const completed = tasks.filter(t => t.done).length;
  const progress = (completed / tasks.length) * 100;

  const allDone = completed === tasks.length;

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
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Setup de Lojista de Elite
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
            <Star className="w-2.5 h-2.5 mr-1" />
            Nível Empreendedor
          </Badge>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
            {completed}/{tasks.length}
          </span>
        </div>
      </div>

      <div className="mb-1">
        <Progress value={progress} className="h-2 bg-slate-100 dark:bg-slate-800" />
        <p className="text-xs text-slate-400 mt-2 font-medium">
          {allDone
            ? "🎉 Checklist completo! Você ativou as funções máximas de venda."
            : "Siga o passo a passo para transformar sua página numa máquina de conversão."
          }
        </p>
      </div>

      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl p-3 flex items-center gap-3"
          >
            <Target className="w-8 h-8 text-emerald-500" />
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                🚀 Máquina Ligada!
              </p>
              <p className="text-xs text-emerald-600/70">
                Seu ambiente comercial está pronto. Foco total em tráfego e análise!
              </p>
            </div>
            <button onClick={() => setShowReward(false)} className="text-emerald-500 font-bold hover:text-emerald-700 text-xs">
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
                <p className={`text-sm font-medium truncate ${task.done ?
                  'line-through decoration-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                  {task.label}
                </p>
              </div>

              {task.isUltra && !task.done && (
                <Link href="/dashboard/billing">
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold uppercase cursor-pointer hover:bg-purple-200 whitespace-nowrap flex items-center gap-1">
                    Pro/Ultra <ExternalLink className="w-2 h-2" />
                  </span>
                </Link>
              )}

              {task.isShare && !task.done && (
                <button
                  onClick={handleCopyLink}
                  className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold cursor-pointer hover:bg-blue-100 flex items-center gap-1 transition-colors whitespace-nowrap border border-blue-100"
                >
                  <Copy className="w-2 h-2" /> {task.action}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {completed >= 3 && plan === 'free' && !allDone && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Link href="/dashboard/billing" className="flex items-center justify-between group cursor-pointer">
            <p className="text-[11px] text-slate-500 font-medium">
              🔓 Complete destravando os recursos no <span className="text-purple-600 font-bold">Plano Pro</span>
            </p>
            <ArrowRight className="w-3 h-3 text-purple-500 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </motion.div>
  );
}