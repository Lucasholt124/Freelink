"use client";

import { CheckCircle2, Circle, Trophy, Copy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner"; // Assumindo que você usa sonner ou use seu toast preferido

export default function GrowthChecklist({ plan, clicks, username }: { plan: string, clicks: number, username: string }) {
  // Estado local para simular a conclusão imediata do compartilhamento
  const [shared, setShared] = useState(false);

  const handleCopyLink = () => {
    // 1. Gera o link público (ajuste a URL base conforme seu domínio real)
    const url = `https://freelinnk.com/${username}`;

    // 2. Copia para o clipboard
    navigator.clipboard.writeText(url);

    // 3. Marca como feito (UX de "Intenção")
    setShared(true);

    // 4. Feedback visual
    toast.success("Link copiado! Poste no seu Story agora.");
  };

  const tasks = [
    { label: "Criar seu primeiro link", done: true },
    { label: "Personalizar foto de perfil", done: true },
    { label: "Atingir 10 cliques únicos", done: clicks >= 10 },
    // A mágica: se shared for true (clicou no botão) OU se o plano não for free (já é pro), marca feito
    { label: "Compartilhar link no Instagram", done: shared, action: "Copiar Link", isShare: true },
    { label: "Conectar Pixel de Rastreamento", done: plan !== 'free', isUltra: true },
  ];

  const completed = tasks.filter(t => t.done).length;
  const progress = (completed / tasks.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Setup de Crescimento
        </h3>
        <span className="text-xs font-bold text-slate-500">{completed}/{tasks.length}</span>
      </div>

      <div className="mb-6">
        <Progress value={progress} className="h-2 bg-slate-100 dark:bg-slate-800" />
        <p className="text-xs text-slate-400 mt-2 font-medium">
          Complete o setup para aumentar sua visibilidade em 3x.
        </p>
      </div>

      <div className="space-y-4 flex-1">
        {tasks.map((task, i) => (
          <div key={i} className={`flex items-center gap-3 ${task.done ? 'opacity-50' : 'opacity-100'}`}>
            {task.done ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${task.done ? 'line-through decoration-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                {task.label}
              </p>
            </div>

            {/* Lógica do Botão PRO */}
            {task.isUltra && !task.done && (
              <Link href="/dashboard/billing">
                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold uppercase cursor-pointer hover:bg-purple-200 whitespace-nowrap">
                  Ultra
                </span>
              </Link>
            )}

            {/* Lógica do Botão COMPARTILHAR (Ação Real) */}
            {task.isShare && !task.done && (
               <button
                 onClick={handleCopyLink}
                 className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-lg font-bold cursor-pointer hover:bg-slate-200 hover:text-slate-900 flex items-center gap-1 transition-colors whitespace-nowrap"
               >
                 <Copy className="w-3 h-3" /> Copiar
               </button>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}