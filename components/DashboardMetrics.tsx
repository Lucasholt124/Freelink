"use client";

import type { AnalyticsData } from "@/lib/analytics-server";
import {
  Users,
  MousePointerClick,
  Globe,
  Link as LinkIcon,
  Clock,
  MapPin,
  Lock,
  Activity,
  TrendingUp,
  Sparkles,
  Crown,
  Zap,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import type { ElementType } from "react";
import NextLink from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface DashboardMetricsProps {
  analytics: AnalyticsData;
  plan: "free" | "pro" | "ultra";
}

const colorClasses = {
  blue: {
    gradient: "from-blue-500 via-blue-600 to-indigo-700",
    bgGradient: "from-blue-50/50 via-blue-100/30 to-indigo-50/50",
    glowColor: "shadow-blue-500/20",
    iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
    iconGlow: "shadow-blue-400/50",
    textPrimary: "text-blue-950",
    textSecondary: "text-blue-700",
    border: "border-blue-200/50",
    hoverBorder: "hover:border-blue-400",
    ring: "ring-blue-500/20",
  },
  teal: {
    gradient: "from-teal-500 via-cyan-600 to-teal-700",
    bgGradient: "from-teal-50/50 via-cyan-100/30 to-teal-50/50",
    glowColor: "shadow-teal-500/20",
    iconBg: "bg-gradient-to-br from-teal-500 to-cyan-600",
    iconGlow: "shadow-teal-400/50",
    textPrimary: "text-teal-950",
    textSecondary: "text-teal-700",
    border: "border-teal-200/50",
    hoverBorder: "hover:border-teal-400",
    ring: "ring-teal-500/20",
  },
  purple: {
    gradient: "from-purple-500 via-violet-600 to-purple-700",
    bgGradient: "from-purple-50/50 via-violet-100/30 to-purple-50/50",
    glowColor: "shadow-purple-500/20",
    iconBg: "bg-gradient-to-br from-purple-500 to-violet-600",
    iconGlow: "shadow-purple-400/50",
    textPrimary: "text-purple-950",
    textSecondary: "text-purple-700",
    border: "border-purple-200/50",
    hoverBorder: "hover:border-purple-400",
    ring: "ring-purple-500/20",
  },
  green: {
    gradient: "from-green-500 via-emerald-600 to-green-700",
    bgGradient: "from-green-50/50 via-emerald-100/30 to-green-50/50",
    glowColor: "shadow-green-500/20",
    iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
    iconGlow: "shadow-green-400/50",
    textPrimary: "text-green-950",
    textSecondary: "text-green-700",
    border: "border-green-200/50",
    hoverBorder: "hover:border-green-400",
    ring: "ring-green-500/20",
  },
  orange: {
    gradient: "from-orange-500 via-amber-600 to-orange-700",
    bgGradient: "from-orange-50/50 via-amber-100/30 to-orange-50/50",
    glowColor: "shadow-orange-500/20",
    iconBg: "bg-gradient-to-br from-orange-500 to-amber-600",
    iconGlow: "shadow-orange-400/50",
    textPrimary: "text-orange-950",
    textSecondary: "text-orange-700",
    border: "border-orange-200/50",
    hoverBorder: "hover:border-orange-400",
    ring: "ring-orange-500/20",
  },
  red: {
    gradient: "from-red-500 via-rose-600 to-red-700",
    bgGradient: "from-red-50/50 via-rose-100/30 to-red-50/50",
    glowColor: "shadow-red-500/20",
    iconBg: "bg-gradient-to-br from-red-500 to-rose-600",
    iconGlow: "shadow-red-400/50",
    textPrimary: "text-red-950",
    textSecondary: "text-red-700",
    border: "border-red-200/50",
    hoverBorder: "hover:border-red-400",
    ring: "ring-red-500/20",
  },
  indigo: {
    gradient: "from-indigo-500 via-indigo-600 to-violet-700",
    bgGradient: "from-indigo-50/50 via-indigo-100/30 to-violet-50/50",
    glowColor: "shadow-indigo-500/20",
    iconBg: "bg-gradient-to-br from-indigo-500 to-violet-600",
    iconGlow: "shadow-indigo-400/50",
    textPrimary: "text-indigo-950",
    textSecondary: "text-indigo-700",
    border: "border-indigo-200/50",
    hoverBorder: "hover:border-indigo-400",
    ring: "ring-indigo-500/20",
  },
};

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <>{displayValue.toLocaleString("pt-BR")}</>;
}

function Card({
  color,
  title,
  icon: Icon,
  value,
  subtitle,
  isText = false,
  index,
  trend,
}: {
  color: keyof typeof colorClasses;
  title: string;
  icon: ElementType;
  value: string | number;
  subtitle?: string;
  isText?: boolean;
  index: number;
  trend?: number;
}) {
  const colors = colorClasses[color];
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative h-full"
    >
      {/* Glow effect */}
      <div
        className={clsx(
          "absolute inset-0 rounded-2xl blur-2xl opacity-0 transition-opacity duration-500",
          `bg-gradient-to-br ${colors.gradient}`,
          isHovered && "opacity-20"
        )}
      />

      {/* Card container */}
      <div
        className={clsx(
          "relative p-4 sm:p-5 lg:p-6 rounded-2xl border-2 flex flex-col justify-between h-full",
          "backdrop-blur-xl bg-gradient-to-br transition-all duration-300",
          "hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-1",
          colors.bgGradient,
          colors.border,
          colors.hoverBorder,
          colors.ring,
          "hover:ring-4"
        )}
      >
        {/* Sparkle decoration */}
        <motion.div
          className="absolute top-2 right-2"
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="w-4 h-4 text-yellow-400/60" />
        </motion.div>

        <div>
          <div className="flex items-start gap-3 sm:gap-4 mb-3">
            {/* Icon container with animation */}
            <motion.div
              className={clsx(
                "p-2.5 sm:p-3 rounded-xl flex-shrink-0 shadow-lg relative overflow-hidden",
                colors.iconBg,
                colors.iconGlow
              )}
              animate={isHovered ? { rotate: [0, -10, 10, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              {/* Icon shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "linear",
                  repeatDelay: 3
                }}
              />
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10" />
            </motion.div>

            <div className="min-w-0 flex-1">
              <p className={clsx(
                "text-xs sm:text-sm font-semibold tracking-wide uppercase",
                colors.textSecondary
              )}>
                {title}
              </p>

              <div className="flex items-baseline gap-2">
                <p
                  className={clsx(
                    "font-black truncate",
                    colors.textPrimary,
                    isText
                      ? "text-lg sm:text-xl lg:text-2xl whitespace-normal break-words"
                      : "text-2xl sm:text-3xl lg:text-4xl"
                  )}
                >
                  {isText ? (
                    value
                  ) : typeof value === "number" ? (
                    <AnimatedNumber value={value} />
                  ) : (
                    value
                  )}
                </p>

                {trend !== undefined && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={clsx(
                      "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold",
                      trend > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    )}
                  >
                    <TrendingUp className="w-3 h-3" />
                    {Math.abs(trend)}%
                  </motion.span>
                )}
              </div>
            </div>
          </div>
        </div>

        {subtitle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="mt-3 pt-3 border-t border-gray-200/30"
          >
            <p className="text-xs sm:text-sm text-gray-600 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              {subtitle}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function LockedCard({
  title,
  requiredPlan,
  index,
}: {
  title: string;
  requiredPlan: string;
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative h-full min-h-[150px]"
    >
      {/* Premium glow effect */}
      <div
        className={clsx(
          "absolute inset-0 rounded-2xl blur-2xl opacity-0 transition-opacity duration-500",
          "bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500",
          isHovered && "opacity-30"
        )}
      />

      <div className="relative h-full bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 p-4 sm:p-5 lg:p-6 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center backdrop-blur-xl hover:border-gray-400 transition-all">
        {/* Lock icon with animation */}
        <motion.div
          className="p-3 bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl mb-3 shadow-lg relative overflow-hidden"
          animate={isHovered ? { rotate: [-5, 5, -5] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          <Lock className="w-6 h-6 text-gray-700 relative z-10" />
        </motion.div>

        {/* Premium badge */}
        <div className="flex items-center gap-1 mb-2">
          {requiredPlan === "Ultra" ? (
            <Crown className="w-4 h-4 text-purple-600" />
          ) : (
            <Zap className="w-4 h-4 text-blue-600" />
          )}
          <h3 className="font-black text-sm sm:text-base lg:text-lg text-gray-800">
            {title}
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-gray-500 mb-4 font-medium">
          Disponível no plano
          <span className={clsx(
            "ml-1 font-bold",
            requiredPlan === "Ultra" ? "text-purple-600" : "text-blue-600"
          )}>
            {requiredPlan}
          </span>
        </p>

        <NextLink
          href="/dashboard/billing"
          className="group relative px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white font-bold rounded-xl text-xs sm:text-sm overflow-hidden shadow-lg hover:shadow-xl transform transition-all hover:-translate-y-0.5"
        >
          {/* Button shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 -skew-x-12 group-hover:animate-shimmer" />

          <span className="relative z-10 flex items-center gap-1.5">
            Fazer Upgrade
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </NextLink>
      </div>
    </motion.div>
  );
}

export default function DashboardMetrics({
  analytics,
  plan,
}: DashboardMetricsProps) {
  const formatReferrer = (
    referrerSource: string | null | undefined
  ): string => {
    if (!referrerSource || referrerSource.toLowerCase() === "direto") {
      return "Direto";
    }
    let hostname: string;
    try {
      hostname = new URL(referrerSource).hostname;
    } catch {
      hostname = referrerSource;
    }
    hostname = hostname.replace(/^(www\.|m\.|l\.|mobile\.|out\.|web\.)/, "");
    const friendlyNames: Record<string, string> = {
      "t.co": "Twitter (X)",
      "twitter.com": "Twitter (X)",
      "instagram.com": "Instagram",
      "facebook.com": "Facebook",
      "youtube.com": "YouTube",
      "linkedin.com": "LinkedIn",
      "pinterest.com": "Pinterest",
      "tiktok.com": "TikTok",
      "reddit.com": "Reddit",
      "whatsapp.com": "WhatsApp",
      "wa.me": "WhatsApp",
      "t.me": "Telegram",
      "discord.com": "Discord",
      "google.com": "Google",
      "bing.com": "Bing",
      "duckduckgo.com": "DuckDuckGo",
      "yahoo.com": "Yahoo!",
      "github.com": "GitHub",
      "substack.com": "Substack",
      "medium.com": "Medium",
      "behance.net": "Behance",
      "dribbble.com": "Dribbble",
      "twitch.tv": "Twitch",
      "notion.so": "Notion",
    };
    return (
      friendlyNames[hostname] || hostname.charAt(0).toUpperCase() + hostname.slice(1)
    );
  };

  const planConfig = {
    free: {
      badge: { icon: Activity, text: "Free", color: "from-gray-400 to-gray-600" },
      description: "Veja o total de cliques e libere análises avançadas com um upgrade"
    },
    pro: {
      badge: { icon: Zap, text: "Pro", color: "from-blue-500 to-indigo-600" },
      description: "Análises detalhadas e métricas avançadas dos seus links"
    },
    ultra: {
      badge: { icon: Crown, text: "Ultra", color: "from-purple-500 via-pink-500 to-indigo-600" },
      description: "Acesso completo a todas as métricas e insights poderosos"
    }
  };

  const config = planConfig[plan];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100/20 via-transparent to-blue-100/20 blur-3xl -z-10" />

      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl border-2 border-gray-200/50 dark:border-gray-700/50 rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl max-w-7xl mx-auto mb-8 hover:shadow-3xl transition-shadow duration-500">
        {/* Header with animated elements */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <motion.div
                className="flex items-center gap-3 mb-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  Visão Geral
                </h2>

                {/* Animated plan badge */}
                <motion.div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${config.badge.color} text-white text-xs sm:text-sm font-bold shadow-lg`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <config.badge.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  {config.badge.text}
                </motion.div>
              </motion.div>

              <motion.p
                className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {config.description}
              </motion.p>
            </div>

            {/* Live indicator */}
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <span className="text-xs font-semibold text-green-700 dark:text-green-400">
                Atualizado agora
              </span>
            </motion.div>
          </div>
        </div>

        {/* Metrics Grid with responsive design */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {/* Card available for ALL plans */}
          <Card
            color="blue"
            title="Cliques Totais"
            icon={MousePointerClick}
            value={analytics.totalClicks}
            index={0}
            trend={12}
          />

          {/* Cards available for PRO and ULTRA */}
          {plan === "pro" || plan === "ultra" ? (
            <>
              <Card
                color="teal"
                title="Última Atividade"
                icon={Activity}
                value={analytics.lastActivity || "Nenhuma"}
                subtitle="Último clique registrado"
                isText
                index={1}
              />
              <Card
                color="purple"
                title="Visitantes Únicos"
                icon={Users}
                value={analytics.uniqueVisitors}
                index={2}
                trend={8}
              />
              <Card
                color="green"
                title="Principal Origem"
                icon={Globe}
                value={formatReferrer(analytics.topReferrer?.source)}
                subtitle={`${analytics.topReferrer?.clicks || 0} cliques`}
                isText
                index={3}
              />
            </>
          ) : (
            <>
              <LockedCard title="Última Atividade" requiredPlan="Pro" index={1} />
              <LockedCard title="Visitantes Únicos" requiredPlan="Pro" index={2} />
              <LockedCard title="Principal Origem" requiredPlan="Pro" index={3} />
            </>
          )}

          {/* Cards exclusive for ULTRA plan */}
          {plan === "ultra" ? (
            <>
              <Card
                color="orange"
                title="Link Mais Popular"
                icon={LinkIcon}
                value={analytics.topLink?.title || "N/A"}
                subtitle={`${analytics.topLink?.clicks || 0} cliques`}
                isText
                index={4}
              />
              <Card
                color="red"
                title="Horário de Pico"
                icon={Clock}
                value={
                  analytics.peakHour
                    ? `${String(analytics.peakHour.hour).padStart(2, "0")}:00`
                    : "N/A"
                }
                subtitle={`${analytics.peakHour?.clicks || 0} cliques`}
                isText
                index={5}
              />
              <Card
                color="indigo"
                title="Principal País"
                icon={MapPin}
                value={analytics.topCountry?.name || "N/A"}
                subtitle={`${analytics.topCountry?.clicks || 0} cliques`}
                isText
                index={6}
                trend={15}
              />
            </>
          ) : (
            <>
              <LockedCard title="Link Mais Popular" requiredPlan="Ultra" index={4} />
              <LockedCard title="Horário de Pico" requiredPlan="Ultra" index={5} />
              <LockedCard title="Principal País" requiredPlan="Ultra" index={6} />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}