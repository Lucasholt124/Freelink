
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  Flame, Trophy
} from "lucide-react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export function GamificationBar() {
  const stats = useQuery(api.gamification.getUserStats);
  const unseenAchievements = useQuery(api.gamification.getUnseenAchievements);
  const [showAchievement, setShowAchievement] = useState(false);

  useEffect(() => {
    if (unseenAchievements && unseenAchievements.length > 0) {
      setShowAchievement(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [unseenAchievements]);

  if (!stats) return null;

  const xpProgress = (stats.xp % 100);

  return (
    <>
      {/* Barra de Gamificação Mobile */}
      <Card className="p-3 md:p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200 mb-4">
        <div className="flex items-center justify-between gap-3">
          {/* Streak */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Flame className={`w-8 h-8 ${stats.currentStreak >= 7 ? 'text-orange-500' : 'text-gray-400'}`} />
              {stats.currentStreak > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {stats.currentStreak}
                </span>
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs text-gray-600">Sequência</p>
              <p className="text-sm font-bold">{stats.currentStreak} dias</p>
            </div>
          </div>

          {/* Level e XP */}
          <div className="flex-1 max-w-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-purple-600">Nível {stats.level}</span>
              <span className="text-xs text-gray-600">{xpProgress}/100 XP</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Total de Vendas */}
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <div className="hidden sm:block">
              <p className="text-xs text-gray-600">Vendas</p>
              <p className="text-sm font-bold">{stats.totalSales}</p>
            </div>
            <span className="sm:hidden text-sm font-bold">{stats.totalSales}</span>
          </div>
        </div>
      </Card>

      {/* Popup de Achievement */}
      <AnimatePresence>
        {showAchievement && unseenAchievements && unseenAchievements[0] && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <Card className="p-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{unseenAchievements[0].icon}</div>
                <div>
                  <p className="font-bold text-lg">Nova Conquista!</p>
                  <p className="text-2xl font-black">{unseenAchievements[0].title}</p>
                  <p className="text-sm opacity-90">{unseenAchievements[0].description}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}