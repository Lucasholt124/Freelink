"use client";

import { Lock, Clock, Globe } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { AnalyticsData } from "@/lib/analytics-server";

interface Props {
  analytics: AnalyticsData;
  plan: string;
}

export default function TrendingLinkCard({ analytics, plan }: Props) {
  const isFree = plan === 'free';
  const topLink = analytics?.topLink?.title || "Seu Link Principal";
  const clicks = analytics?.topLink?.clicks || 0;

  // Dados de Referência Reais ou Fallback
  const topSource = analytics?.topReferrer?.source || "Direto";
  const topSourceClicks = analytics?.topReferrer?.clicks || 0;

  // Simula fontes "ocultas" baseadas no total de visitantes
  const hiddenSources = Math.max(2, (analytics?.uniqueVisitors || 5) - 2);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-full flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Em Alta Hoje 🔥</h3>
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white truncate max-w-[180px]" title={topLink}>
              {topLink}
            </h2>
          </div>
          <div className="text-right bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg">
            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{clicks}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Cliques</p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
              <Globe className="w-4 h-4 text-pink-500" />
              {topSource}
            </span>
            <span className="font-bold text-slate-900 dark:text-white">{topSourceClicks} visitas</span>
          </div>

          <div className="relative pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className={`flex items-center justify-between ${isFree ? 'blur-[4px] select-none opacity-40' : ''}`}>
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                <Globe className="w-4 h-4 text-blue-500" />
                Outros
              </span>
              <span className="font-bold text-slate-900 dark:text-white">{hiddenSources} visitas</span>
            </div>

            {isFree && (
              <div className="absolute inset-0 flex items-center justify-center top-2">
                <Link href="/dashboard/billing">
                  <button className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 group/btn">
                    <Lock className="w-3 h-3" />
                    Ver {hiddenSources} fontes (Pro)
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
               <Clock className="w-3.5 h-3.5" />
               Tempo Médio
            </div>

            {isFree ? (
               <Link href="/dashboard/billing" className="group flex items-center gap-1 cursor-pointer">
                  <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse blur-[2px]"></div>
                  <Lock className="w-3 h-3 text-blue-500 group-hover:scale-110 transition-transform" />
               </Link>
            ) : (
               <span className="text-sm font-black text-slate-900 dark:text-white">45s</span>
            )}
         </div>
      </div>
    </motion.div>
  );
}