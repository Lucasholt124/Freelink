import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchAnalytics } from "@/lib/analytics-server";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlusCircle, Crown, Star, Lightbulb, TrendingUp, Flame, Diamond, Zap } from "lucide-react";
import Link from "next/link";
import ImpactOverview from "./ImpactOverview";
import SmartInsights from "./SmartInsights";
import DashboardMetrics from "@/components/DashboardMetrics";
import { InstagramStrategyWidget, ViralScriptWidget } from "./ContextualWidgets";
import TrendingLinkCard from "./TrendingLinkCard";
import GrowthChecklist from "./GrowthChecklist";


// 1. INTELIGÊNCIA TEMPORAL (Fuso Brasil + Madrugada)
const getGreeting = () => {
  const date = new Date();
  // Força o fuso horário para America/Sao_Paulo para evitar erro de servidor UTC
  const brazilTime = new Date(date.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const h = brazilTime.getHours();

  if (h >= 0 && h < 5) return "Boa madrugada";
  if (h >= 5 && h < 12) return "Bom dia";
  if (h >= 12 && h < 18) return "Boa tarde";
  return "Boa noite";
};

// 2. INTELIGÊNCIA DE STATUS (Escada de 5 Níveis)
const getDailyPerformanceCard = (clicks: number) => {
  // Nível 1: Início (0-10 cliques) -> Foco: Dica Educativa
  if (clicks <= 10) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 h-full flex flex-col justify-center relative overflow-hidden shadow-sm">
        <Lightbulb className="absolute top-4 right-4 text-slate-300 dark:text-slate-600 w-16 h-16 rotate-12 opacity-20" />
        <div className="relative z-10">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Dica de Crescimento
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            Seu perfil está pronto. Para desbloquear o selo <strong>Em Ascensão</strong>, compartilhe seu link agora e consiga +10 cliques.
          </p>
          <Link href="/dashboard/links">
            <Button variant="outline" size="sm" className="w-full text-xs font-bold border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">
              Melhorar meu Link
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Nível 2: Crescimento (11-50 cliques) -> Foco: Motivação
  if (clicks <= 50) {
    const progress = (clicks / 50) * 100;
    return (
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg h-full flex flex-col justify-center relative overflow-hidden group">
        <TrendingUp className="absolute top-4 right-4 text-white/20 w-16 h-16 rotate-12 group-hover:scale-110 transition-transform" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 text-white border-0 px-2 py-0.5 rounded font-bold uppercase text-[10px]">
              Performance Acima da Média
            </span>
          </div>
          <h3 className="font-black text-2xl mb-1">Em Ascensão 🚀</h3>
          <p className="text-sm font-medium text-white/90 mb-4 leading-relaxed">
            Você está crescendo mais rápido que 50% dos criadores hoje. Continue assim!
          </p>
          <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
             <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-[10px] text-white/80 mt-1 font-bold text-right">Próximo: Elite ({50 - clicks} cliques)</p>
        </div>
      </div>
    );
  }

  // Nível 3: Elite (51-200 cliques) -> Foco: Status Social
  if (clicks <= 200) {
    const progress = ((clicks - 50) / 150) * 100;
    return (
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg h-full flex flex-col justify-center relative overflow-hidden group">
        <Star className="absolute top-4 right-4 text-white/20 w-16 h-16 rotate-12 group-hover:rotate-45 transition-transform duration-700" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 text-white border-0 px-2 py-0.5 rounded font-bold uppercase text-[10px]">
              Elite Diária
            </span>
          </div>
          <h3 className="font-black text-2xl mb-1">Top 20% ⭐</h3>
          <p className="text-sm font-medium text-white/90 mb-4 leading-relaxed">
            Excelente! Seu link está entre os mais visitados da plataforma hoje.
          </p>
          <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
             <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Nível 4: Viral (201-1000 cliques) -> Foco: Poder
  if (clicks <= 1000) {
    return (
      <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl h-full flex flex-col justify-center relative overflow-hidden group">
        <Flame className="absolute top-4 right-4 text-white/20 w-16 h-16 rotate-12 group-hover:scale-110 group-hover:animate-pulse" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 text-white border-0 px-2 py-0.5 rounded font-bold uppercase text-[10px]">
              Viral Alert
            </span>
          </div>
          <h3 className="font-black text-2xl mb-1">Top 5% 🔥</h3>
          <p className="text-sm font-medium text-white/90 mb-3 leading-relaxed">
            Seus números estão explodindo! Você atingiu o status de autoridade viral.
          </p>
          <Link href="/dashboard/tracking">
             <button className="text-xs bg-white text-red-600 px-3 py-1.5 rounded-lg font-bold hover:bg-red-50 transition-colors shadow-sm">
               Ver Analytics Avançado
             </button>
          </Link>
        </div>
      </div>
    );
  }

  // Nível 5: Lenda (1000+ cliques) -> Foco: Exclusividade
  return (
    <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-2xl h-full flex flex-col justify-center relative overflow-hidden group">
      <Diamond className="absolute top-4 right-4 text-white/20 w-16 h-16 rotate-12" />
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 border-0 px-2 py-0.5 rounded font-bold uppercase text-[10px] shadow-sm">
            Lenda Digital
          </span>
        </div>
        <h3 className="font-black text-2xl mb-1">Top 1% 💎</h3>
        <p className="text-sm font-medium text-white/90 mb-2 leading-relaxed">
          Você zerou o jogo hoje. Performance nível celebridade global.
        </p>
      </div>
    </div>
  );
};

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const [analytics, planDetails] = await Promise.all([
    fetchAnalytics(user.id),
    getUserSubscriptionPlan(user.id),
  ]);

  const userPlan = planDetails.plan || "free";
  const firstName = user.firstName || "Creator";
  const totalClicks = analytics.totalClicks || 0;

  // Lógica de Nível Visual (XP Acumulado Global)
  const currentLevel = Math.floor(totalClicks / 50) + 1;
  const nextLevelClicks = currentLevel * 50;
  const xpRemaining = Math.max(0, nextLevelClicks - totalClicks);
  const progressPercent = Math.min(100, (totalClicks / nextLevelClicks) * 100);

  // --- CORREÇÃO DO ERRO DO LINT ---
  // Agora usamos essa variável no className do ícone de nível
  const levelBadgeColor = userPlan === 'ultra' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                          userPlan === 'pro' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

  return (
    <div className="max-w-7xl mx-auto pb-24 pt-4 animate-in fade-in duration-500 space-y-8">

      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="w-full md:w-auto">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            {getGreeting()}, {firstName}.
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mb-4">
            Seu Freelinnk trabalhou por você enquanto você vivia sua vida. 🚀
          </p>

          <div className="bg-white dark:bg-slate-900 p-3 pr-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm inline-flex items-center gap-4">
             {/* AQUI ESTÁ A CORREÇÃO DA VARIÁVEL DE COR */}
             <div className={`p-2 rounded-lg ${levelBadgeColor}`}>
                {userPlan === 'ultra' ? <Crown className="w-5 h-5" /> :
                 userPlan === 'pro' ? <Zap className="w-5 h-5" /> :
                 <Star className="w-5 h-5" />}
             </div>

             <div>
                <div className="flex items-center gap-2 mb-1">
                   <span className="text-xs font-black uppercase text-slate-500">Nível {currentLevel}</span>
                   <span className="text-xs font-bold text-slate-300">•</span>
                   <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{totalClicks} XP</span>
                </div>
                <div className="w-48 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <p className="text-[10px] font-medium text-slate-400 mt-1">
                   Faltam <span className="text-purple-600 font-bold">{xpRemaining} XP</span> para subir.
                </p>
             </div>
          </div>
        </div>

        <Link href="/dashboard/new-link">
          <Button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-transform font-bold rounded-xl h-12 shadow-xl px-8 w-full md:w-auto">
            <PlusCircle className="w-4 h-4 mr-2" />
            Criar Link Viral
          </Button>
        </Link>
      </div>

      {/* 2. ÁREA DE IMPACTO + STATUS DINÂMICO (Ultra Inteligente) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <ImpactOverview analytics={analytics} plan={userPlan} />
        </div>
        <div className="lg:col-span-1">
           {/* Chama a função que decide qual card mostrar baseado nos cliques */}
           {getDailyPerformanceCard(totalClicks)}
        </div>
      </div>

      {/* 3. INSIGHTS IA */}
      <SmartInsights analytics={analytics} plan={userPlan} />

      {/* 4. DETALHES (Bento Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-6">
          <Suspense fallback={<Skeleton className="h-48 rounded-2xl" />}>
            <DashboardMetrics analytics={analytics} plan={userPlan} />
          </Suspense>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <InstagramStrategyWidget userPlan={userPlan} />
             <ViralScriptWidget userPlan={userPlan} />
          </div>
        </div>

        <div className="md:col-span-4 space-y-6">
          <TrendingLinkCard analytics={analytics} plan={userPlan} />
          <GrowthChecklist plan={userPlan} clicks={totalClicks} username={user.username || "meu-link"} />
        </div>
      </div>
    </div>
  );
}