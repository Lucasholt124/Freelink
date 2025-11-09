"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Trophy, Award, X } from "lucide-react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Doc } from "@/convex/_generated/dataModel";

// Define the type for a single achievement document
type Achievement = Doc<"achievements">;

export function GamificationBar() {
  const stats = useQuery(api.gamification.getUserStats);
  const unseenAchievements = useQuery(api.gamification.getUnseenAchievements);
  const markSeen = useMutation(api.gamification.markAchievementSeen);

  const [showAchievement, setShowAchievement] = useState(false);
  // Use the explicit Achievement type for the state
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    if (unseenAchievements && unseenAchievements.length > 0 && !showAchievement) {
      setCurrentAchievement(unseenAchievements[0]);
      setShowAchievement(true);

      // 🎉 Confetti animado
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347']
      });

      // ✅ Fechar automaticamente após 5 segundos
      const timer = setTimeout(async () => {
        setShowAchievement(false);
        if (unseenAchievements[0]) {
          await markSeen({ id: unseenAchievements[0]._id });
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [unseenAchievements, markSeen, showAchievement]);

  if (!stats) return null;

  const xpProgress = (stats.xp % 100);

  return (
    <>
      {/* ✅ Barra de Gamificação Responsiva */}
      <Card className="p-3 md:p-4 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border-2 border-purple-200/50 mb-4 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between gap-3">

          {/* 🔥 Streak Counter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Flame
                className={`w-8 h-8 transition-all ${
                  stats.currentStreak >= 7
                    ? 'text-orange-500 animate-pulse drop-shadow-lg'
                    : stats.currentStreak > 0
                    ? 'text-orange-400'
                    : 'text-gray-400'
                }`}
              />
              {stats.currentStreak > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                >
                  {stats.currentStreak}
                </motion.span>
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-gray-600">Sequência</p>
              <p className="text-sm font-bold text-gray-800">
                {stats.currentStreak} {stats.currentStreak === 1 ? 'dia' : 'dias'}
              </p>
              {stats.longestStreak > stats.currentStreak && (
                <p className="text-[10px] text-gray-500">Melhor: {stats.longestStreak}</p>
              )}
            </div>
          </div>

          {/* 📊 Level e XP com animação */}
          <div className="flex-1 max-w-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-purple-600 flex items-center gap-1">
                <Award className="w-3 h-3" />
                Nível {stats.level}
              </span>
              <span className="text-xs text-gray-600">{xpProgress}/100 XP</span>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full shadow-lg"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-1 text-center">
              Próximo nível: {100 - xpProgress} XP
            </p>
          </div>

          {/* 🏆 Total de Vendas */}
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500 drop-shadow-md" />
            <div className="hidden sm:block">
              <p className="text-xs text-gray-600">Vendas</p>
              <p className="text-sm font-bold text-gray-800">{stats.totalSales}</p>
            </div>
            <span className="sm:hidden text-sm font-bold text-gray-800">
              {stats.totalSales}
            </span>
          </div>
        </div>

        {/* ✅ Badges Conquistadas (opcional) */}
        {stats.badges.length > 0 && (
          <div className="mt-3 pt-3 border-t border-purple-200/50">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-600">Conquistas:</span>
              {stats.badges.slice(0, 5).map((badge, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold"
                >
                  {badge === 'streak_7' && '🔥 7 Dias'}
                  {badge === 'streak_30' && '🚀 30 Dias'}
                  {badge === 'sales_10' && '🎯 10 Vendas'}
                  {badge === 'sales_100' && '💎 100 Vendas'}
                </span>
              ))}
              {stats.badges.length > 5 && (
                <span className="text-xs text-gray-500">+{stats.badges.length - 5}</span>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* ✅ Popup de Nova Conquista com Botão de Fechar */}
      <AnimatePresence>
        {showAchievement && currentAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
          >
            <Card className="p-6 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white shadow-2xl border-4 border-yellow-300 relative overflow-hidden">
              {/* Background animado */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] animate-pulse" />

              {/* Botão de fechar */}
              <Button
                size="icon"
                variant="ghost"
                onClick={async () => {
                  setShowAchievement(false);
                  if (currentAchievement) {
                    await markSeen({ id: currentAchievement._id });
                  }
                }}
                className="absolute top-2 right-2 text-white hover:bg-white/20 rounded-full h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>

              <div className="relative z-10 flex items-center gap-4">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-6xl drop-shadow-2xl"
                >
                  {currentAchievement.icon}
                </motion.div>
                <div className="flex-1">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="font-bold text-lg drop-shadow-md"
                  >
                    🎉 Nova Conquista!
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl font-black drop-shadow-lg"
                  >
                    {currentAchievement.title}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-sm opacity-90 mt-1"
                  >
                    {currentAchievement.description}
                  </motion.p>
                </div>
              </div>

              {/* Barra de progresso de fechamento */}
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
                className="absolute bottom-0 left-0 h-1 bg-white/50"
              />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}