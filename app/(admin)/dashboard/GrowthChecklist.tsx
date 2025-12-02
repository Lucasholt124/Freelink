"use client";

import { CheckCircle2, Circle, Trophy, Copy, ExternalLink } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function GrowthChecklist({ plan, clicks, username }: { plan: string, clicks: number, username: string }) {
  // Inicializa false para evitar erro de hidratação (server vs client)
  const [shared, setShared] = useState(false);

  // 1. Efeito para carregar a memória do navegador ao abrir a página
  useEffect(() => {
    const hasShared = localStorage.getItem(`freelinnk_shared_${username}`);
    if (hasShared === 'true') {
      setShared(true);
    }
  }, [username]);

  const handleCopyLink = () => {
    const url = `https://freelinnk.com/${username}`;
    navigator.clipboard.writeText(url);

    // 2. Marca como feito visualmente
    setShared(true);

    // 3. Salva na memória permanente do navegador
    localStorage.setItem(`freelinnk_shared_${username}`, 'true');

    toast.success("Link copiado! Tarefa concluída.");
  };

  const tasks = [
    { label: "Criar seu primeiro link", done: true },
    { label: "Personalizar foto de perfil", done: true },
    { label: "Atingir 10 cliques únicos", done: clicks >= 10 },
    // Agora verifica o estado persistente 'shared'
    { label: "Compartilhar link no Instagram", done: shared, action: "Copiar Link", isShare: true },
    { label: "Conectar Pixel de Rastreamento", done: plan !== 'free', isUltra: true },
  ];

  const completed = tasks.filter(t => t.done).length;
  const progress = (completed / tasks.length) * 100;

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
           <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{completed}/{tasks.length}</span>
        </div>
      </div>

      <div className="mb-5">
        <Progress value={progress} className="h-2 bg-slate-100 dark:bg-slate-800" />
        <p className="text-xs text-slate-400 mt-2 font-medium">
          Complete o setup para aumentar sua visibilidade em 3x.
        </p>
      </div>

      {/* Grid responsivo para aproveitar a largura quando estiver na coluna principal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
        {tasks.map((task, i) => (
          <div key={i} className={`flex items-center gap-3 ${task.done ? 'opacity-50' : 'opacity-100'}`}>
            {task.done ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />
            )}

            <div className="flex-1 min-w-0 flex items-center gap-2">
              <p className={`text-sm font-medium truncate ${task.done ? 'line-through decoration-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                {task.label}
              </p>

              {/* Botões de Ação Imediata */}
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
          </div>
        ))}
      </div>
    </motion.div>
  );
}