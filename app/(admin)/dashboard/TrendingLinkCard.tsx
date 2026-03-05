"use client";

import { Lock, Clock, Globe, Eye, TrendingUp, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { AnalyticsData } from "@/lib/analytics-server";

interface Props {
  analytics: AnalyticsData;
  plan: string;
}

export default function TrendingLinkCard({ analytics, plan }: Props) {
  const isFree = plan === 'free';
  const topLink = analytics?.topLink?.title || "Seu Link Principal";
  const clicks = analytics?.topLink?.clicks || 0;

  const topSource = analytics?.topReferrer?.source || "Direto";
  const topSourceClicks = analytics?.topReferrer?.clicks || 0;

  const hiddenSources = Math.max(2, (analytics?.uniqueVisitors || 5) - 2);

  // Quantos dados estão ocultos
  const hiddenDataCount = isFree ? 5 : 0;

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
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
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
          {/* Fonte Principal (Visível para todos) */}
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
              <Globe className="w-4 h-4 text-pink-500" />
              {topSource}
            </span>
            <span className="font-bold text-slate-900 dark:text-white">{topSourceClicks} visitas</span>
          </div>

          {/* Fontes Ocultas (FOMO para FREE) */}
          <div className="relative pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className={`space-y-2 ${isFree ? 'blur-[4px] select-none opacity-40' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                  <Globe className="w-4 h-4 text-blue-500" />
                  Google
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{Math.round(hiddenSources * 0.6)} visitas</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                  <Globe className="w-4 h-4 text-purple-500" />
                  Outros
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{Math.round(hiddenSources * 0.4)} visitas</span>
              </div>
            </div>

            {isFree && (
              <div className="absolute inset-0 flex items-center justify-center top-2">
                <Link href="/dashboard/billing">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-full text-[11px] font-black shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2 group/btn"
                  >
                    <Lock className="w-3 h-3" />
                    Ver todas as {hiddenSources + 1} fontes
                    <Badge className="bg-white/20 text-[8px] border-0 text-white font-bold px-1">PRO</Badge>
                  </motion.button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* DADOS EXTRAS OCULTOS (CONVERSÃO) */}
        {isFree && (
          <div className="mt-3 space-y-1.5">
            {[
              { label: "Taxa de conversão", icon: TrendingUp },
              { label: "Dispositivos dos visitantes", icon: Eye },
              { label: "Cidades mais ativas", icon: Globe },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-slate-400">
                <item.icon className="w-3 h-3" />
                <span className="font-medium">{item.label}</span>
                <Lock className="w-2.5 h-2.5 text-slate-300 ml-auto" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RODAPÉ */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
            <Clock className="w-3.5 h-3.5" />
            Tempo Médio na Página
          </div>

          {isFree ? (
            <Link href="/dashboard/billing" className="group flex items-center gap-1 cursor-pointer">
              <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse blur-[2px]" />
              <Lock className="w-3 h-3 text-blue-500 group-hover:scale-110 transition-transform" />
            </Link>
          ) : (
            <span className="text-sm font-black text-slate-900 dark:text-white">45s</span>
          )}
        </div>

        {/* CTA FINAL DE CONVERSÃO */}
        {isFree && (
          <Link href="/dashboard/billing">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-100 dark:border-blue-900/30 rounded-lg p-2.5 flex items-center justify-between group cursor-pointer hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] text-blue-700 dark:text-blue-300 font-bold">
                  Desbloquear {hiddenDataCount} dados ocultos
                </span>
              </div>
              <ArrowRight className="w-3 h-3 text-blue-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        )}
      </div>
    </motion.div>
  );
}