"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Video, Layers, Camera, MessageSquare, Clock, TrendingUp, Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BrainResults } from "@/app/types/brain";

// Contador Animado
const AnimatedCounter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}{suffix}</span>;
};

interface ViralStatsCardProps {
  results: BrainResults;
  userPlan: string;
}

export const ViralStatsCard = ({ results, userPlan }: ViralStatsCardProps) => {
  const totalContent =
    (results.content_pack?.reels?.length ?? 0) +
    (results.content_pack?.carousels?.length ?? 0) +
    (results.content_pack?.image_posts?.length ?? 0) +
    (results.content_pack?.story_sequences?.length ?? 0);

  const stats = [
    {
      icon: Video,
      label: "Reels",
      value: results.content_pack?.reels?.length ?? 0,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      icon: Layers,
      label: "Carrosséis",
      shortLabel: "Carrossel",
      value: results.content_pack?.carousels?.length ?? 0,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      icon: Camera,
      label: "Posts",
      value: results.content_pack?.image_posts?.length ?? 0,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
    {
      icon: MessageSquare,
      label: "Stories",
      value: results.content_pack?.story_sequences?.length ?? 0,
      color: "from-orange-500 to-yellow-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className={cn(
        "p-4 sm:p-6 border-2 overflow-hidden relative",
        userPlan === 'ultra'
          ? "border-purple-500/50 bg-gradient-to-br from-purple-50/50 via-pink-50/50 to-orange-50/50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20"
          : "border-blue-500/30 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20"
      )}>
        {userPlan === 'ultra' && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-400/20 to-transparent rounded-bl-full" />
        )}

        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 sm:p-2.5 rounded-xl flex-shrink-0",
                userPlan === 'ultra'
                  ? "bg-gradient-to-br from-purple-600 to-pink-600"
                  : "bg-gradient-to-br from-blue-600 to-purple-600"
              )}>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base sm:text-lg">Campanha Gerada!</h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {totalContent} conteúdos prontos para viralizar
                </p>
              </div>
            </div>

            {userPlan === 'ultra' && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 animate-pulse self-start sm:self-center">
                <Crown className="w-3 h-3 mr-1 fill-white" />
                ULTRA
              </Badge>
            )}
          </div>

          {/* Stats Grid - Responsivo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "p-2 sm:p-3 rounded-xl text-center transition-all hover:scale-105",
                  stat.bgColor
                )}
              >
                <div className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1 sm:mb-2 rounded-lg flex items-center justify-center bg-gradient-to-br",
                  stat.color
                )}>
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <p className="text-xl sm:text-2xl font-black">
                  <AnimatedCounter value={stat.value} />
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">
                  <span className="hidden sm:inline">{stat.label}</span>
                  <span className="sm:hidden">{stat.shortLabel || stat.label}</span>
                </p>
              </motion.div>
            ))}
          </div>

          {/* Viral Strategy Preview */}
          {results.viral_strategy && (
            <div className="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-semibold">Estratégia Viral</span>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {results.viral_strategy.best_times_detailed?.slice(0, 2).map((day, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px] sm:text-xs">
                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                    {day.day}: {day.times[0]}
                  </Badge>
                ))}
                {results.viral_strategy.growth_hacks && results.viral_strategy.growth_hacks.length > 0 && (
                  <Badge variant="outline" className="text-[10px] sm:text-xs text-purple-600">
                    +{results.viral_strategy.growth_hacks.length} hacks
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};