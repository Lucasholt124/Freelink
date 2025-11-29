import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchAnalytics } from "@/lib/analytics-server";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlusCircle, Crown, Star, Lightbulb } from "lucide-react"; // Importei Lightbulb
import Link from "next/link";
import ImpactOverview from "./ImpactOverview";
import SmartInsights from "./SmartInsights";
import DashboardMetrics from "@/components/DashboardMetrics";
import TrendingLinkCard from "./TrendingLinkCard";
import { InstagramStrategyWidget, ViralScriptWidget } from "./ContextualWidgets";
import GrowthChecklist from "./GrowthChecklist";

const getGreeting = () => {
  const date = new Date();
  const h = date.getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
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

  const currentLevel = Math.floor(totalClicks / 50) + 1;
  const nextLevelClicks = currentLevel * 50;
  const xpRemaining = Math.max(0, nextLevelClicks - totalClicks);
  const progressPercent = Math.min(100, (totalClicks / nextLevelClicks) * 100);

  const levelBadgeColor = userPlan === 'ultra' ? 'bg-purple-100 text-purple-700' :
                          userPlan === 'pro' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700';

  // LÓGICA REAL: Só mostra Elite se tiver mais de 20 cliques
  const isElite = totalClicks > 20;

  return (
    <div className="max-w-7xl mx-auto pb-24 pt-4 animate-in fade-in duration-500 space-y-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="w-full md:w-auto">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            {getGreeting()}, {firstName}.
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg mb-4">
            Seu Freelinnk trabalhou por você enquanto você vivia sua vida. 🚀
          </p>

          <div className="bg-white dark:bg-slate-900 p-3 pr-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm inline-flex items-center gap-4">
             <div className={`p-2 rounded-lg ${levelBadgeColor}`}>
                <Crown className="w-5 h-5 text-slate-700 dark:text-slate-300" />
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

      {/* ÁREA DE IMPACTO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <ImpactOverview analytics={analytics} plan={userPlan} />
        </div>
        <div className="lg:col-span-1">
           {/* LOGICA CONDICIONAL: Mostra Elite ou Dica */}
           {isElite ? (
             <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg h-full flex flex-col justify-center relative overflow-hidden group">
                <Star className="absolute top-4 right-4 text-white/20 w-16 h-16 rotate-12" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-white/20 text-white border-0 px-2 py-0.5 rounded font-bold uppercase text-[10px]">
                      Elite Diária
                    </span>
                  </div>
                  <h3 className="font-black text-2xl mb-1">Top 20%</h3>
                  <p className="text-sm font-medium text-white/90 mb-4 leading-relaxed">
                    Seu link performou melhor que a maioria dos criadores hoje.
                  </p>
                  <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                     <div className="bg-white w-[80%] h-full rounded-full animate-pulse"></div>
                  </div>
                </div>
             </div>
           ) : (
             <div className="bg-gradient-to-br from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 h-full flex flex-col justify-center relative overflow-hidden">
                <Lightbulb className="absolute top-4 right-4 text-slate-200 dark:text-slate-700 w-16 h-16 rotate-12" />
                <div className="relative z-10">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">Dica de Crescimento</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                    Para entrar no Top 20% e ganhar o selo Elite, compartilhe seu link em 3 stories hoje.
                  </p>
                  <Link href="/dashboard/links">
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold">
                      Melhorar meu Link
                    </Button>
                  </Link>
                </div>
             </div>
           )}
        </div>
      </div>

      <SmartInsights analytics={analytics} plan={userPlan} />

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
          {/* Passamos o ID do user para gerar o link dele */}
          <GrowthChecklist plan={userPlan} clicks={totalClicks} username={user.username || "meu-link"} />
        </div>
      </div>
    </div>
  );
}