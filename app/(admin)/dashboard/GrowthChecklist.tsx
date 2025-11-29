"use client";

import { CheckCircle2, Circle, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import Link from "next/link";

export default function GrowthChecklist({ plan, clicks }: { plan: string, clicks: number }) {
  // Simulação de progresso real
  const tasks = [
    { label: "Criar seu primeiro link", done: true }, // Já fez
    { label: "Personalizar foto de perfil", done: true }, // Já fez
    { label: "Atingir 10 cliques únicos", done: clicks >= 10 },
     { label: "Compartilhar link no Instagram", done: false, action: "Copiar Link" },
    { label: "Conectar Pixel de Rastreamento", done: plan !== 'free', isUltra: true },

  ];

  const completed = tasks.filter(t => t.done).length;
  const progress = (completed / tasks.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Setup de Crescimento
        </h3>
        <span className="text-xs font-bold text-slate-500">{completed}/{tasks.length}</span>
      </div>

      <div className="mb-6">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-slate-400 mt-2 font-medium">
          Complete o setup para aumentar sua visibilidade em 3x.
        </p>
      </div>

      <div className="space-y-4">
        {tasks.map((task, i) => (
          <div key={i} className={`flex items-center gap-3 ${task.done ? 'opacity-50' : 'opacity-100'}`}>
            {task.done ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />
            )}

            <div className="flex-1">
              <p className={`text-sm font-medium ${task.done ? 'line-through decoration-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                {task.label}
              </p>
            </div>

            {task.isUltra && !task.done && (
              <Link href="/dashboard/billing">
                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold uppercase cursor-pointer hover:bg-purple-200">
                  Ultra
                </span>
              </Link>
            )}

            {!task.done && task.action && (
               <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-bold cursor-pointer hover:bg-slate-200">
                 {task.action}
               </span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}