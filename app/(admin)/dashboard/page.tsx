import { Suspense } from "react";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import {
  BrainCircuit, LinkIcon, Zap, Gift, Sparkles, Target,
  ChevronRight, Rocket, Crown, Flame, Heart,
  Trophy, Diamond, Infinity, ArrowRight, Play,
  Layers, Globe, Magnet, Workflow, Plus, Bolt,
  Type, Instagram, Palette, ImageIcon, TrendingUp,
  Eye, MousePointerClick, BarChart3, Sparkle, Award,
  PartyPopper, Sunrise, Moon, Coffee, Activity,
  Zap as Lightning, CheckCircle2, AlertCircle,
  BarChart2,
} from "lucide-react";
import { fetchAnalytics } from "@/lib/analytics-server";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import DashboardMetrics from "@/components/DashboardMetrics";
import SkeletonDashboard from "@/components/SkeletonDashboard";
import DashboardToast from "@/components/DashboardToast";
import RealTimeClock from "@/components/RealTimeClock";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardFooter,
  CardHeader, CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// === SISTEMA INTELIGENTE DE MENSAGENS DINÂMICAS ===
function getDynamicGreeting() {
  const sergipeTime = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Maceio" }));
  const hour = sergipeTime.getHours();

  if (hour >= 0 && hour < 6) {
    return {
      text: "Madrugada produtiva",
      icon: <Moon className="w-4 h-4 sm:w-5 sm:h-5" />,
      gradient: "from-indigo-600 to-purple-600"
    };
  } else if (hour >= 6 && hour < 12) {
    return {
      text: "Bom dia",
      icon: <Sunrise className="w-4 h-4 sm:w-5 sm:h-5" />,
      gradient: "from-orange-500 to-yellow-500"
    };
  } else if (hour >= 12 && hour < 18) {
    return {
      text: "Tarde produtiva",
      icon: <Coffee className="w-4 h-4 sm:w-5 sm:h-5" />,
      gradient: "from-blue-500 to-cyan-500"
    };
  } else {
    return {
      text: "Noite de conquistas",
      icon: <Sparkle className="w-4 h-4 sm:w-5 sm:h-5" />,
      gradient: "from-purple-600 to-pink-600"
    };
  }
}

function getMotivationalMessage(clicks: number, plan: string) {
  if (plan === "ultra") {
    if (clicks > 10000) return { text: "VOCÊ É IMPARÁVEL! 🔥", subtext: `${clicks.toLocaleString()} cliques dominados`, color: "from-yellow-400 via-orange-500 to-red-500", intensity: "🔥🔥🔥" };
    if (clicks > 5000) return { text: "LENDÁRIO ATIVADO! ⚡", subtext: "Performance extraordinária", color: "from-purple-500 via-pink-500 to-red-500", intensity: "⚡⚡⚡" };
    if (clicks > 1000) return { text: "MASTER LEVEL ALCANÇADO! 👑", subtext: "Você está no topo", color: "from-blue-500 via-purple-500 to-pink-500", intensity: "👑👑" };
    return { text: "ULTRA MODE ATIVO! 💎", subtext: "Potencial ilimitado liberado", color: "from-indigo-500 via-purple-500 to-pink-500", intensity: "💎" };
  }
  if (plan === "pro") {
    if (clicks > 5000) return { text: "CRESCIMENTO EXPLOSIVO! 🚀", subtext: "Próximo nivel: Ultra", color: "from-emerald-500 via-green-500 to-cyan-500", intensity: "🚀🚀" };
    if (clicks > 1000) return { text: "PERFORMANCE PRO DOMINANDO! 💪", subtext: "Continue assim, campeão", color: "from-blue-500 via-indigo-500 to-purple-500", intensity: "💪💪" };
    return { text: "PRO POWER ATIVADO! ⚡", subtext: "Evolução em progresso acelerado", color: "from-cyan-500 via-blue-500 to-indigo-500", intensity: "⚡" };
  }
  if (clicks > 500) return { text: "QUASE PRO! 🎯", subtext: `Faltam ${1000 - clicks} cliques`, color: "from-orange-500 via-amber-500 to-yellow-500", intensity: "🎯" };
  if (clicks > 100) return { text: "CRESCENDO RÁPIDO! 📈", subtext: "Momentum perfeito", color: "from-green-500 via-emerald-500 to-teal-500", intensity: "📈" };
  return { text: "INÍCIO FORTE!", subtext: "Sua jornada lendária começou", color: "from-blue-500 via-purple-500 to-pink-500", intensity: "💪" };
}

function getAchievementBadges(clicks: number, plan: string) {
    const badges = [];
    if (clicks > 100) badges.push({ icon: "🎯", text: "Primeira Centena" });
    if (clicks > 500) badges.push({ icon: "🔥", text: "Meio Milhar" });
    if (clicks > 1000) badges.push({ icon: "💎", text: "Mil Cliques" });
    if (clicks > 5000) badges.push({ icon: "👑", text: "5K Master" });
    if (clicks > 10000) badges.push({ icon: "⚡", text: "10K Legend" });
    if (plan === "ultra") badges.push({ icon: "🌟", text: "Ultra Elite" });
    if (plan === "pro") badges.push({ icon: "🚀", text: "Pro Power" });
    return badges.slice(-3);
}

function getClickStreak(clicks: number): { days: number; message: string; color: string } {
  const streakDays = Math.min(Math.floor(clicks / 50), 100);
  if (streakDays >= 30) return { days: streakDays, message: "Sequência épica!", color: "from-yellow-500 to-orange-500" };
  if (streakDays >= 7) return { days: streakDays, message: "Mantendo ritmo!", color: "from-green-500 to-emerald-500" };
  if (streakDays >= 3) return { days: streakDays, message: "Ganhando momentum!", color: "from-blue-500 to-cyan-500" };
  return { days: streakDays, message: "Começando forte!", color: "from-purple-500 to-pink-500" };
}

// === COMPONENTES ULTRA PREMIUM ===

function MentorIaWidget({ userPlan }: { userPlan: string }) {
  const isLocked = userPlan === "free";
  return (
    <div className="relative group h-full">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl blur-xl opacity-30 group-hover:opacity-75 transition-all duration-700 animate-pulse"></div>
      {isLocked && (
        <div className="absolute -top-3 -right-3 z-30 animate-bounce">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full blur-md opacity-80 animate-pulse"></div>
            <Badge className="relative bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 text-white border-0 px-2 sm:px-4 py-1 sm:py-2 font-black shadow-2xl text-[10px] sm:text-sm backdrop-blur-sm">
              <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 animate-spin" style={{ animationDuration: '3s' }} /> UNLOCK PRO
            </Badge>
          </div>
        </div>
      )}
      <div className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-2xl text-white transition-all duration-700 group-hover:shadow-blue-500/50 group-hover:-translate-y-2 group-hover:scale-[1.02] flex flex-col h-full border border-blue-400/30 overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(96,165,250,0.2),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.2),transparent_50%)]"></div>
        <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-gradient-to-bl from-pink-500/10 to-transparent rounded-full blur-3xl"></div>
        <div className="relative z-10 flex-grow flex flex-col">
          <div className="flex items-center gap-3 sm:gap-6 mb-4 sm:mb-6">
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-2 sm:-inset-3 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-xl sm:rounded-2xl blur-lg opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-500/40 to-purple-600/40 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-xl border border-white/30 shadow-2xl">
                <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white drop-shadow-lg" />
              </div>
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight truncate">Mentor.IA</h2>
                <Badge className="bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-blue-100 border border-blue-400/40 text-[10px] font-black px-1.5 sm:px-2 py-0.5 backdrop-blur-sm flex-shrink-0">NEW</Badge>
              </div>
              <div className="flex items-center gap-2 mt-1 sm:mt-2">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 animate-pulse drop-shadow-lg flex-shrink-0" />
                <p className="text-blue-200 font-black text-xs sm:text-sm md:text-base drop-shadow truncate">Gerador de Imagens IA</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-5 md:p-6 border border-white/20 backdrop-blur-md mb-4 sm:mb-6 flex-grow shadow-inner">
            <h3 className="font-black text-sm sm:text-base md:text-lg mb-3 sm:mb-5 flex items-center text-white drop-shadow">
              <Bolt className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-400 animate-pulse drop-shadow-lg flex-shrink-0" /> Crie Arte Profissional
            </h3>
            <div className="space-y-2 sm:space-y-4">
              {[
                { icon: Type, text: "Texto vira arte em 5 segundos", color: "text-blue-300", bg: "from-blue-500/30 to-blue-600/30", detail: "GPT-4 Vision" },
                { icon: Instagram, text: "Posts virais automaticamente", color: "text-purple-300", bg: "from-purple-500/30 to-purple-600/30", detail: "IA Treinada" },
                { icon: Palette, text: "Milhares de estilos únicos", color: "text-pink-300", bg: "from-pink-500/30 to-pink-600/30", detail: "Ilimitado" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3 group/item hover:translate-x-1 sm:hover:translate-x-2 transition-all duration-300">
                  <div className={`bg-gradient-to-r ${item.bg} p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl shadow-lg group-hover/item:scale-110 group-hover/item:rotate-3 transition-all duration-300 border border-white/20 flex-shrink-0`}>
                    <item.icon className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ${item.color} drop-shadow`} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <span className="font-bold text-xs sm:text-sm md:text-base text-white group-hover/item:text-white transition-colors drop-shadow block truncate">{item.text}</span>
                    <p className="text-[10px] sm:text-xs text-white/60 font-semibold mt-0.5 truncate">{item.detail}</p>
                  </div>
                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10 mt-auto flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 bg-gradient-to-r from-red-500/30 to-pink-500/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-red-400/40 backdrop-blur-sm shadow-lg">
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-300 animate-pulse drop-shadow flex-shrink-0" />
              <span className="text-[10px] sm:text-xs md:text-sm font-black text-white drop-shadow whitespace-nowrap"> +538k criadas </span>
            </div>
            <Link href={isLocked ? "/dashboard/billing" : "/dashboard/mentor-ia"} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto relative group/btn bg-gradient-to-r from-white via-blue-50 to-purple-50 text-slate-900 hover:from-yellow-400 hover:via-orange-500 hover:to-red-500 hover:text-white font-black px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-xl sm:rounded-2xl transition-all duration-500 transform hover:scale-110 shadow-2xl text-xs sm:text-sm md:text-base overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover/btn:opacity-80 transition-all duration-500"></div>
                <span className="relative flex items-center justify-center gap-1.5 sm:gap-2 font-black">
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover/btn:scale-110 transition-transform flex-shrink-0" />
                  <span className="truncate">{isLocked ? "DESBLOQUEAR AGORA" : "CRIAR IMAGEM"}</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover/btn:translate-x-2 transition-transform flex-shrink-0" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function FreelinkBrainWidget({ userPlan }: { userPlan: string }) {
  const isLocked = userPlan === "free";
  return (
    <div className="relative group h-full">
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-cyan-600 to-teal-600 rounded-2xl sm:rounded-3xl blur-xl opacity-30 group-hover:opacity-75 transition-all duration-700 animate-pulse"></div>
      <div className="absolute -top-3 -right-3 z-30 animate-bounce" style={{ animationDelay: '0.2s' }}>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-cyan-500 to-teal-500 rounded-full blur-md opacity-80 animate-pulse"></div>
          <Badge className="relative bg-gradient-to-r from-emerald-500 via-cyan-500 to-teal-600 text-white border-0 px-2 sm:px-4 py-1 sm:py-2 font-black shadow-2xl text-[10px] sm:text-sm backdrop-blur-sm">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 animate-spin" style={{ animationDuration: '2s' }} /> VIRAL AI
          </Badge>
        </div>
      </div>
      <div className="relative bg-white dark:bg-slate-950 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-2xl transition-all duration-700 group-hover:shadow-emerald-500/50 group-hover:-translate-y-2 group-hover:scale-[1.02] flex flex-col h-full border-2 border-emerald-200 dark:border-emerald-800 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.15),transparent_50%)]"></div>
        <div className="absolute bottom-0 left-0 w-32 sm:w-64 h-32 sm:h-64 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-full blur-3xl"></div>
        <div className="relative z-10 flex-grow flex flex-col">
          <div className="flex items-center gap-3 sm:gap-6 mb-4 sm:mb-6">
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-2 sm:-inset-3 bg-gradient-to-r from-emerald-400 via-cyan-500 to-teal-500 rounded-xl sm:rounded-2xl blur-lg opacity-60 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-emerald-100 to-cyan-100 dark:from-emerald-900 dark:to-cyan-900 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl border-2 border-emerald-300 dark:border-emerald-700">
                <BrainCircuit className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-emerald-600 dark:text-emerald-400 drop-shadow-lg" />
              </div>
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight truncate">
                  <span className="text-slate-900 dark:text-white">Freelinnk</span>
                  <span className="text-emerald-600">Brain</span>
                </h2>
                <Badge className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-400/40 text-[10px] font-black px-1.5 sm:px-2 py-0.5 flex-shrink-0">HOT</Badge>
              </div>
              <div className="flex items-center gap-2 mt-1 sm:mt-2">
                <Infinity className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-500 drop-shadow flex-shrink-0" style={{ animation: 'spin 4s linear infinite' }} />
                <p className="text-emerald-700 dark:text-emerald-300 font-black text-xs sm:text-sm md:text-base drop-shadow-sm truncate">IA Criadora de Virais</p>
              </div>
            </div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/40 rounded-xl sm:rounded-2xl p-3 sm:p-5 md:p-6 border-2 border-emerald-200 dark:border-emerald-800 mb-4 sm:mb-6 flex-grow shadow-lg">
            <h3 className="font-black text-sm sm:text-base md:text-lg mb-3 sm:mb-5 flex items-center text-slate-800 dark:text-white drop-shadow-sm">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-500 animate-pulse drop-shadow flex-shrink-0" /> Viral em 3 Cliques
            </h3>
            <div className="space-y-2 sm:space-y-4">
              {[
                { icon: Magnet, text: "Títulos com 10x+ engajamento", color: "text-emerald-600 dark:text-emerald-400", bg: "from-emerald-500/30 to-emerald-600/30", metric: "+1.234%" },
                { icon: Workflow, text: "Scripts de Reels que explodem", color: "text-cyan-600 dark:text-cyan-400", bg: "from-cyan-500/30 to-cyan-600/30", metric: "Testado" },
                { icon: Diamond, text: "Prompts validados por 50k+", color: "text-purple-600 dark:text-purple-400", bg: "from-purple-500/30 to-purple-600/30", metric: "50.847" },
                { icon: Globe, text: "Mensagens de alta conversão", color: "text-blue-600 dark:text-blue-400", bg: "from-blue-500/30 to-blue-600/30", metric: "Premium" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3 group/item hover:translate-x-1 sm:hover:translate-x-2 transition-all duration-300">
                  <div className={`bg-gradient-to-r ${item.bg} p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl shadow-lg group-hover/item:scale-110 group-hover/item:rotate-3 transition-all duration-300 border border-slate-300 dark:border-slate-600 flex-shrink-0`}>
                    <item.icon className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ${item.color} drop-shadow`} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <span className="font-bold text-xs sm:text-sm md:text-base text-slate-800 dark:text-white group-hover/item:text-slate-900 dark:group-hover/item:text-white transition-colors drop-shadow-sm block truncate">{item.text}</span>
                    <span className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-semibold truncate block">{item.metric}</span>
                  </div>
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10 mt-auto flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400/30 to-orange-500/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border-2 border-yellow-400/50 shadow-lg backdrop-blur-sm">
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 dark:text-yellow-400 animate-pulse drop-shadow flex-shrink-0" />
              <span className="text-[10px] sm:text-xs md:text-sm font-black text-yellow-700 dark:text-yellow-300 drop-shadow-sm whitespace-nowrap"> #1 Brain AI </span>
            </div>
            <Link href={isLocked ? "/dashboard/billing" : "/dashboard/brain"} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto relative group/btn bg-gradient-to-r from-emerald-500 via-cyan-500 to-teal-500 hover:from-emerald-600 hover:via-cyan-600 hover:to-teal-600 text-white font-black px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-xl sm:rounded-2xl transition-all duration-500 transform hover:scale-110 shadow-2xl text-xs sm:text-sm md:text-base overflow-hidden">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover/btn:opacity-80 transition-all duration-500"></div>
                <span className="relative flex items-center justify-center gap-1.5 sm:gap-2 font-black drop-shadow-lg">
                  <BrainCircuit className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover/btn:scale-110 transition-transform flex-shrink-0" />
                  <span className="truncate">{isLocked ? "ATIVAR BRAIN" : "ABRIR BRAIN"}</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover/btn:translate-x-2 transition-transform flex-shrink-0" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsageStatsCard({ clicksUsed = 0, maxClicks = 1000, userPlan = "free" }: { clicksUsed: number; maxClicks: number; userPlan: string }) {
  const percentUsed = userPlan === "free" ? Math.min(100, Math.round((clicksUsed / maxClicks) * 100)) : 100;
  const motivation = getMotivationalMessage(clicksUsed, userPlan);
  const streak = getClickStreak(clicksUsed);
  return (
    <Card className="shadow-2xl border-0 bg-white dark:bg-slate-950 overflow-hidden relative group hover:shadow-blue-500/40 transition-all duration-700 hover:-translate-y-2">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${motivation.color} shadow-lg`}></div>
      <CardHeader className="pb-3 sm:pb-4 relative z-10">
        <div className="flex justify-between items-start mb-2 sm:mb-3 gap-2">
          <CardTitle className="text-lg sm:text-xl md:text-2xl flex items-center gap-2 sm:gap-3 min-w-0">
            <div className={`p-2 sm:p-2.5 rounded-xl bg-gradient-to-r ${motivation.color} shadow-xl animate-pulse flex-shrink-0`}>
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-lg" />
            </div>
            <span className="text-slate-900 dark:text-white font-black truncate">Power Status</span>
          </CardTitle>
          {userPlan === "ultra" ? (
            <Badge className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white border-0 font-black shadow-xl px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-sm animate-pulse flex-shrink-0">
              <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />ULTRA
            </Badge>
          ) : userPlan === "pro" ? (
            <Badge className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white border-0 font-black shadow-xl px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-sm flex-shrink-0">
              <Rocket className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />PRO
            </Badge>
          ) : (
            <Badge variant="outline" className="font-bold border-2 text-[10px] sm:text-sm backdrop-blur-sm flex-shrink-0">Iniciante</Badge>
          )}
        </div>
        <div className={`bg-gradient-to-r ${motivation.color} bg-clip-text text-transparent space-y-1`}>
          <p className="font-black text-base sm:text-lg md:text-xl flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="truncate">{motivation.text}</span>
            <span className="text-xl sm:text-2xl flex-shrink-0">{motivation.intensity}</span>
          </p>
          <p className="text-xs sm:text-sm font-bold opacity-90 truncate">{motivation.subtext}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 relative z-10">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between text-xs sm:text-sm font-bold gap-2">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 sm:gap-2 truncate">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" /> Poder Utilizado
            </span>
            <span className={`bg-gradient-to-r ${motivation.color} bg-clip-text text-transparent font-black text-sm sm:text-base md:text-lg flex-shrink-0`}>
              {clicksUsed.toLocaleString()} / {userPlan !== "free" ? "∞" : maxClicks.toLocaleString()}
            </span>
          </div>
          <div className="relative">
            <Progress value={percentUsed} className="h-3 sm:h-4 bg-slate-200 dark:bg-slate-800 shadow-inner" />
            <div className={`absolute inset-0 bg-gradient-to-r ${motivation.color} opacity-20 rounded-full blur-sm pointer-events-none`}></div>
          </div>
          <div className="flex justify-between items-center flex-wrap gap-2">
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
              {userPlan === "free" ? `${(maxClicks - clicksUsed).toLocaleString()} restantes` : "Poder ilimitado ⚡"}
            </p>
            {percentUsed > 80 && userPlan === "free" && (
              <Badge className="bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30 text-[10px] font-bold animate-pulse flex-shrink-0">
                <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" /> Limite próximo
              </Badge>
            )}
          </div>
        </div>
        {streak.days > 0 && (
          <div className={`bg-gradient-to-r ${streak.color} p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg border border-white/20`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg sm:rounded-xl backdrop-blur-sm flex-shrink-0">
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-lg" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-black text-base sm:text-lg truncate">{streak.days} dias</p>
                  <p className="text-white/90 text-[10px] sm:text-xs font-bold truncate">{streak.message}</p>
                </div>
              </div>
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white/80 animate-pulse flex-shrink-0" />
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="bg-blue-50 dark:bg-blue-950/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-blue-200 dark:border-blue-800 hover:scale-105 transition-all duration-300 shadow-lg group">
            <div className="flex gap-1.5 sm:gap-2 items-center text-blue-600 dark:text-blue-400 mb-1.5 sm:mb-2">
              <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4 group-hover:rotate-12 transition-transform flex-shrink-0" />
              <span className="font-black text-[10px] sm:text-sm truncate">Links</span>
            </div>
            <p className="font-black text-lg sm:text-xl md:text-2xl text-blue-600 truncate">
              {userPlan !== "free" ? "∞" : "10"}
            </p>
            <p className="text-[10px] sm:text-xs text-blue-600/70 dark:text-blue-400/70 font-semibold mt-0.5 sm:mt-1 truncate">
              {userPlan !== "free" ? "Ilimitados" : "Grátis"}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-purple-200 dark:border-purple-800 hover:scale-105 transition-all duration-300 shadow-lg group">
            <div className="flex gap-1.5 sm:gap-2 items-center text-purple-600 dark:text-purple-400 mb-1.5 sm:mb-2">
              <BarChart2 className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform flex-shrink-0" />
              <span className="font-black text-[10px] sm:text-sm truncate">Analytics</span>
            </div>
            <p className="font-black text-lg sm:text-xl md:text-2xl text-purple-600 truncate">
              {userPlan === "ultra" ? "MAX" : userPlan === "pro" ? "PRO" : "Basic"}
            </p>
            <p className="text-[10px] sm:text-xs text-purple-600/70 dark:text-purple-400/70 font-semibold mt-0.5 sm:mt-1 truncate">
              {userPlan === "ultra" ? "Avançado" : userPlan === "pro" ? "Completo" : "Básico"}
            </p>
          </div>
        </div>
      </CardContent>
      {userPlan === "free" && (
        <CardFooter className="pt-0 relative z-10">
          <Link href="/dashboard/billing" className="w-full">
            <Button className="w-full group bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-black rounded-xl sm:rounded-2xl py-4 sm:py-6 text-sm sm:text-base md:text-lg transition-all duration-500 hover:scale-105 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <span className="relative flex items-center justify-center gap-1.5 sm:gap-2 drop-shadow-lg">
                <Rocket className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce flex-shrink-0" />
                <span className="truncate">Upgrade para <span className="text-yellow-300 font-black ml-1">PRO</span></span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-auto transition-transform group-hover:translate-x-2 flex-shrink-0" />
              </span>
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}

function QuickLinksCard({ userPlan }: { userPlan: string }) {
  const quickLinks = [
    { title: "Meus Links", href: "/dashboard/links", icon: Layers, desc: "Gerencie seu império", gradient: "from-blue-500 to-indigo-600", bgGradient: "from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30", borderColor: "border-blue-300 dark:border-blue-700", count: "Gerenciar" },
    { title: "Criar Link", href: "/dashboard/new-link", icon: Plus, desc: "Novo link viral agora", highlight: true, gradient: "from-emerald-500 to-cyan-600", bgGradient: "from-emerald-50 to-cyan-50 dark:from-emerald-950/30 dark:to-cyan-950/30", borderColor: "border-emerald-400 dark:border-emerald-600", count: "Popular" },
    { title: "Sorteios Ultra", href: "/dashboard/giveaway", icon: Gift, desc: "Monetize sua audiência", locked: userPlan !== "ultra", gradient: "from-purple-500 to-pink-600", bgGradient: "from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30", borderColor: "border-purple-300 dark:border-purple-700", count: "Premium" },
  ];
  return (
    <Card className="shadow-2xl border-0 bg-white dark:bg-slate-950 overflow-hidden hover:shadow-purple-500/30 transition-all duration-700">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-lg sm:text-xl md:text-2xl text-slate-900 dark:text-white font-black flex items-center gap-2">
          <Lightning className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 animate-pulse drop-shadow-lg flex-shrink-0" />
          <span className="truncate">Ações Rápidas</span>
        </CardTitle>
        <CardDescription className="font-bold text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">Ferramentas que geram resultados reais</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        {quickLinks.map((link, index) => (
          <Link key={index} href={link.locked ? "/dashboard/billing" : link.href}>
            <div className={`relative group/link p-3 sm:p-5 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-2 ${link.borderColor} ${link.bgGradient} overflow-hidden`}>
              <div className={`absolute inset-0 bg-gradient-to-r ${link.gradient} opacity-0 group-hover/link:opacity-10 transition-opacity duration-300`}></div>
              {link.locked && (
                <div className="absolute -top-2 -right-2 z-10 animate-bounce">
                  <Badge className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white text-[10px] font-black shadow-xl px-1.5 sm:px-2 py-0.5 sm:py-1">
                    <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" /> ULTRA
                  </Badge>
                </div>
              )}
              {link.highlight && (
                <div className="absolute -top-2 -right-2 z-10">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-black shadow-xl px-1.5 sm:px-2 py-0.5 sm:py-1 animate-pulse">
                    HOT 🔥
                  </Badge>
                </div>
              )}
              <div className="relative flex items-center gap-2 sm:gap-4">
                <div className={`p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r ${link.gradient} shadow-xl group-hover/link:scale-110 group-hover/link:rotate-6 transition-all duration-300 flex-shrink-0`}>
                  <link.icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white drop-shadow-lg" />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                    <p className="font-black text-sm sm:text-base md:text-lg text-slate-900 dark:text-white drop-shadow-sm truncate">{link.title}</p>
                    <Badge className="bg-slate-200/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-0 text-[10px] font-bold px-1.5 sm:px-2 py-0 flex-shrink-0">
                      {link.count}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold truncate">{link.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover/link:text-slate-900 dark:group-hover/link:text-white transition-all group-hover/link:translate-x-2 flex-shrink-0" />
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

function LiveStatsWidget({ analytics }: { analytics: { totalClicks?: number; uniqueVisitors?: number } }) {
  const estimatedViews = Math.round((analytics?.uniqueVisitors || 0) * 1.5);
  const clicksPerVisitor = analytics?.uniqueVisitors && analytics.uniqueVisitors > 0
    ? (analytics?.totalClicks || 0) / analytics.uniqueVisitors
    : 0;

  const stats = [
    {
      label: "Visualizações",
      value: estimatedViews,
      icon: Eye,
      color: "from-blue-500 to-indigo-600",
      change: estimatedViews > 0 ? "+12.5%" : "0%",
      trend: estimatedViews > 0 ? "up" : "stable" as "up" | "down" | "stable"
    },
    {
      label: "Cliques",
      value: analytics?.totalClicks || 0,
      icon: MousePointerClick,
      color: "from-emerald-500 to-cyan-600",
      change: (analytics?.totalClicks || 0) > 0 ? "+24.3%" : "0%",
      trend: (analytics?.totalClicks || 0) > 0 ? "up" : "stable" as "up" | "down" | "stable"
    },
    {
      label: "Taxa",
      value: clicksPerVisitor.toFixed(1),
      icon: TrendingUp,
      color: "from-purple-500 to-pink-600",
      change: clicksPerVisitor > 0 ? "+8.7%" : "0%",
      trend: clicksPerVisitor > 0 ? "up" : "stable" as "up" | "down" | "stable"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group bg-white dark:bg-slate-950">
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-15 transition-opacity duration-500`}></div>
          <CardContent className="p-4 sm:p-6 relative z-10">
            <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
              <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${stat.color} shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 flex-shrink-0`}>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-lg" />
              </div>
              <Badge className={`${stat.trend === 'up' ? 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30'} border font-black text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 flex-shrink-0`}>
                {stat.trend === 'up' ? <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 inline" /> : null}
                {stat.change}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2 truncate">{stat.label}</p>
            <p className={`text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white drop-shadow-sm truncate`}>
              {typeof stat.value === 'number' ? stat.value.toLocaleString('pt-BR') : stat.value}
            </p>
            <div className="mt-3 sm:mt-4 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000`} style={{ width: '70%' }}></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DailyMotivationCard({ userPlan, clicksUsed }: { userPlan: string; clicksUsed: number }) {
  const greeting = getDynamicGreeting();
  const badges = getAchievementBadges(clicksUsed, userPlan);

  return (
    <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 text-white">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)' }}></div>
      </div>

      <CardContent className="p-4 sm:p-6 md:p-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="text-center sm:text-left flex-grow w-full sm:w-auto">
            <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${greeting.gradient} shadow-xl flex-shrink-0`}>
                {greeting.icon}
              </div>
              <div className="min-w-0">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white truncate">{greeting.text}</h3>
                <p className="text-xs sm:text-sm md:text-base font-bold text-white/90 truncate">Continue sua revolução digital!</p>
              </div>
            </div>

            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center sm:justify-start">
                <span className="text-[10px] sm:text-xs font-bold text-white/80 flex items-center gap-1 flex-shrink-0">
                  <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                  Últimas conquistas:
                </span>
                {badges.map((badge, i) => (
                  <Badge key={i} className="bg-white/20 text-white border border-white/30 font-bold text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 hover:scale-110 transition-transform">
                    <span className="mr-1">{badge.icon}</span>
                    <span className="truncate">{badge.text}</span>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-lg opacity-60 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-yellow-400 to-orange-500 p-4 sm:p-6 rounded-full shadow-2xl">
                <PartyPopper className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white animate-bounce" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 flex justify-center sm:justify-start">
          <RealTimeClock />
        </div>
      </CardContent>
    </Card>
  );
}

// === COMPONENTE PRINCIPAL DO DASHBOARD ===

export default async function DashboardOverviewPage() {
  const user = await currentUser();
  if (!user) return null;

  const [analytics, planDetails] = await Promise.all([
    fetchAnalytics(user.id),
    getUserSubscriptionPlan(user.id),
  ]);

  const userPlan = planDetails.plan || "free";
  const clicksUsed = analytics?.totalClicks || 0;

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-gradient-to-tl from-emerald-400/10 via-cyan-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[1000px] h-[500px] sm:h-[1000px] bg-gradient-to-r from-yellow-400/5 via-orange-400/5 to-red-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 space-y-6 sm:space-y-8 md:space-y-12">
        <DashboardToast />

        <header className="text-center md:text-left px-2">
          <div className="inline-flex flex-col md:flex-row items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-1.5 sm:-inset-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl sm:rounded-2xl blur-lg opacity-70 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl">
                <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>
            <div className="min-w-0 text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight mb-1 sm:mb-2">
                <span className="block sm:inline truncate">Olá, {user.firstName || user.username}!</span>
                <span className="inline-block animate-bounce ml-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">🚀</span>
              </h1>
              <p className="text-base sm:text-xl md:text-2xl font-black text-slate-600 dark:text-slate-400">
                <span className="block sm:inline">Seu império digital está</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 ml-0 sm:ml-2 block sm:inline">
                  revolucionando tudo
                </span>
              </p>
            </div>
          </div>
        </header>

        <DailyMotivationCard userPlan={userPlan} clicksUsed={clicksUsed} />

        <LiveStatsWidget analytics={analytics} />

        <Suspense fallback={<SkeletonDashboard />}>
          <DashboardMetrics analytics={analytics} plan={userPlan} />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <MentorIaWidget userPlan={userPlan} />
              <FreelinkBrainWidget userPlan={userPlan} />
            </div>

            {/* Exclusive Features Card - Responsivo */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl sm:rounded-3xl blur-2xl opacity-30 group-hover:opacity-70 transition-all duration-1000 animate-pulse"></div>
              <Card className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-red-950/30 border-0 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-10 shadow-2xl transition-all duration-700 group-hover:shadow-3xl group-hover:-translate-y-3 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-10 right-10 w-20 sm:w-40 h-20 sm:h-40 bg-gradient-to-br from-white to-transparent rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-10 left-10 w-16 sm:w-32 h-16 sm:h-32 bg-gradient-to-br from-white to-transparent rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-10 items-center">
                  <div className="relative flex-shrink-0">
                    <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl sm:rounded-3xl blur-2xl opacity-60 animate-pulse"></div>
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl border-4 border-white/60 backdrop-blur-sm">
                      {userPlan === "ultra" ? (
                        <Diamond className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-purple-500" style={{ animation: 'spin 6s linear infinite' }} />
                      ) : userPlan === "pro" ? (
                        <Crown className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-purple-500 animate-pulse" />
                      ) : (
                        <Rocket className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-blue-500 animate-bounce" />
                      )}
                    </div>
                  </div>

                  <div className="flex-grow text-center lg:text-left w-full">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 sm:mb-3 leading-tight drop-shadow-sm">
                      {userPlan === "ultra" ? "💎 Você é ULTRA Master!" : userPlan === "pro" ? "👑 Evolua para ULTRA Elite" : "🚀 Desbloqueie Superpoderes"}
                    </h3>
                    <p className="text-sm sm:text-base md:text-xl font-bold text-slate-700 dark:text-slate-300 mb-6 sm:mb-8 drop-shadow-sm">
                      {userPlan === "ultra" ? "Status máximo desbloqueado - Você chegou ao topo absoluto!" : userPlan === "pro" ? "Domine completamente sua audiência digital" : "Transforme seu perfil em uma máquina de resultados"}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                      {(userPlan === "ultra" ? [
                        { icon: "🌟", text: "Acesso Total Premium Vitalício", detail: "Forever Access" },
                        { icon: "🚀", text: "Recursos Futuros em Preview", detail: "Beta Tester" },
                        { icon: "💬", text: "Canal VIP Direto com Fundador", detail: "WhatsApp Exclusivo" },
                        { icon: "🔥", text: "API Exclusiva Developers", detail: "Full Access" }
                      ] : userPlan === "pro" ? [
                        { icon: "🤖", text: "Automação Total Inteligente", detail: "Workflow Automático" },
                        { icon: "🎁", text: "Engine de Sorteios Viral", detail: "Sistema Completo" },
                        { icon: "🎯", text: "Tracking Real-Time Avançado", detail: "Live Updates" },
                        { icon: "⭐", text: "Suporte VIP Prioritário 24/7", detail: "Atendimento Exclusivo" }
                      ] : [
                        { icon: "🖼️", text: "Gerador de Imagens IA Ilimitado", detail: "DALL-E 3 + Stable Diffusion" },
                        { icon: "⚡", text: "FreelinnkBrain Premium Completo", detail: "1000+ Prompts Virais" },
                        { icon: "📊", text: "Analytics Ultra Profundos", detail: "Dashboard Avançado" },
                        { icon: "🎨", text: "White Label Personalizado", detail: "Sua Marca" }
                      ]).map((feature, i) => (
                        <div key={i} className="flex items-start gap-2 sm:gap-3 group/feature hover:translate-x-1 sm:hover:translate-x-2 transition-all duration-300">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 flex items-center justify-center shadow-xl group-hover/feature:scale-110 group-hover/feature:rotate-12 transition-all duration-300 flex-shrink-0">
                            <span className="text-base sm:text-lg">{feature.icon}</span>
                          </div>
                          <div className="text-left min-w-0">
                            <span className="font-black text-xs sm:text-sm md:text-base text-slate-800 dark:text-white block drop-shadow-sm break-words">{feature.text}</span>
                            <span className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-semibold truncate block">{feature.detail}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {userPlan !== "ultra" ? (
                      <Link href="/dashboard/billing">
                        <Button className="w-full lg:w-auto bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:opacity-90 text-white font-black px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 text-base sm:text-lg md:text-xl rounded-xl sm:rounded-2xl transition-all duration-500 transform hover:scale-110 shadow-2xl overflow-hidden group/btn">
                          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"></div>
                          <span className="relative flex items-center justify-center gap-2 sm:gap-3 drop-shadow-lg">
                            <Rocket className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce flex-shrink-0" />
                            <span className="truncate">{userPlan === "pro" ? "VIRAR ULTRA MASTER" : "ATIVAR PODER PRO AGORA"}</span>
                            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover/btn:translate-x-2 transition-transform flex-shrink-0" />
                          </span>
                        </Button>
                      </Link>
                    ) : (
                      <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3 bg-gradient-to-r from-yellow-400/30 to-orange-500/30 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-yellow-400/50 shadow-lg backdrop-blur-sm">
                        <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400 animate-bounce flex-shrink-0" />
                        <span className="font-black text-sm sm:text-base md:text-lg text-slate-800 dark:text-white drop-shadow-sm truncate"> Você alcançou o nível máximo! 🎉 </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <UsageStatsCard clicksUsed={clicksUsed} maxClicks={1000} userPlan={userPlan} />
            <QuickLinksCard userPlan={userPlan} />

            <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-300 dark:border-emerald-700 shadow-xl hover:shadow-2xl transition-all duration-500">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400 animate-pulse flex-shrink-0" />
                  <h3 className="font-black text-base sm:text-lg text-emerald-800 dark:text-emerald-200 truncate">
                    Desafio do Dia
                  </h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between p-2.5 sm:p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg sm:rounded-xl backdrop-blur-sm gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white truncate">Criar 3 links virais</span>
                    <Badge className="bg-emerald-500 text-white border-0 font-black text-[10px] sm:text-xs flex-shrink-0">+50 XP</Badge>
                  </div>
                  <Progress value={33} className="h-2 bg-slate-200 dark:bg-slate-700" />
                  <p className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 truncate">1/3 completo • 66% restante</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <footer className="text-center py-8 sm:py-12">
          <div className="relative inline-flex items-center gap-2 sm:gap-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 rounded-2xl sm:rounded-3xl font-black text-base sm:text-lg md:text-2xl shadow-2xl hover:scale-105 transition-all duration-500 group overflow-hidden">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 animate-pulse relative z-10 flex-shrink-0" />
            <span className="relative z-10 break-words">Sua revolução digital acontece HOJE!</span>
            <Bolt className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 animate-bounce relative z-10 flex-shrink-0" />
          </div>
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm md:text-base font-bold text-slate-600 dark:text-slate-400 px-4">
            Cada clique é um passo mais perto da sua meta 🎯
          </p>
        </footer>
      </div>
    </div>
  );
}