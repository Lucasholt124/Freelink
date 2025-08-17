import { Suspense } from "react";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import {
  Wand2, BrainCircuit, TrendingUp, Users, LinkIcon,
  ExternalLink, ArrowUpRight, Zap, Gift, Sparkles, Target
  , ChevronRight, BarChart3, Award, Rocket, Star,
  Calendar
} from "lucide-react";
import { fetchAnalytics } from "@/lib/analytics-server";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import DashboardMetrics from "@/components/DashboardMetrics";
import SkeletonDashboard from "@/components/SkeletonDashboard";
import DashboardToast from "@/components/DashboardToast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Widget para destacar o Mentor IA
function MentorIaWidget({ userPlan }: { userPlan: string }) {
  const isLocked = userPlan === "free";

  return (
    <div className="relative group">
      {isLocked && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 px-3 py-1 font-semibold">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            PRO
          </Badge>
        </div>
      )}

      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 sm:p-8 rounded-2xl shadow-lg text-white transition-all group-hover:shadow-2xl group-hover:-translate-y-1 flex flex-col h-full border border-blue-400/20">
        <div className="flex-grow">
          <div className="flex items-center gap-4 mb-5">
            <div className="bg-white/20 p-3 rounded-full">
              <Wand2 className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Mentor.IA</h2>
              <p className="opacity-80 max-w-sm text-sm sm:text-base">Estratégias que viralizam seu perfil</p>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-medium text-sm mb-2 flex items-center">
                <Zap className="w-4 h-4 mr-1.5 text-yellow-300" />
                O que o Mentor.IA faz por você
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="bg-blue-400/20 p-1 rounded-full mt-0.5">
                    <TrendingUp className="w-3 h-3" />
                  </div>
                  <span>Análise completa do seu perfil e nicho</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-blue-400/20 p-1 rounded-full mt-0.5">
                    <BarChart3 className="w-3 h-3" />
                  </div>
                  <span>Estratégia personalizada de crescimento</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-blue-400/20 p-1 rounded-full mt-0.5">
                    <Calendar className="w-3 h-3" />
                  </div>
                  <span>Calendário de conteúdo para 7 ou 30 dias</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <Badge variant="outline" className="bg-white/10 border-white/20 text-white text-xs">
            <Users className="w-3 h-3 mr-1" />
            10.293 planos gerados
          </Badge>

          <Link href={isLocked ? "/dashboard/billing" : "/dashboard/mentor-ia"}>
            <Button className="bg-white text-blue-700 hover:bg-blue-100 font-semibold group relative px-6">
              <span className="group-hover:-translate-x-1 transition-transform inline-block">
                {isLocked ? "Desbloquear" : "Começar Análise"}
              </span>
              <ArrowUpRight className="w-4 h-4 ml-1.5 opacity-0 group-hover:opacity-100 absolute right-2 group-hover:right-3 transition-all" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Widget para destacar o FreelinkBrain
function FreelinkBrainWidget({ userPlan }: { userPlan: string }) {
  const isLocked = userPlan === "free";

  return (
    <div className="relative group">
      <div className="absolute -top-2 -right-2 z-10">
        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-3 py-1 font-semibold">
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          NOVO
        </Badge>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg transition-all group-hover:shadow-2xl group-hover:-translate-y-1 flex flex-col h-full border border-blue-100 dark:border-blue-900/20">
        <div className="flex-grow">
          <div className="flex items-center gap-4 mb-5">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
              <BrainCircuit className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Freelink<span className="text-blue-600">Brain</span></h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-sm text-sm sm:text-base">Ideias virais em segundos</p>
            </div>
          </div>

          <div className="mt-4 space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="font-medium text-sm mb-2 flex items-center text-slate-800 dark:text-slate-200">
                <Zap className="w-4 h-4 mr-1.5 text-blue-500" />
                Crie conteúdo viral rapidamente
              </h3>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <div className="bg-blue-100 dark:bg-blue-800/50 p-1 rounded-full mt-0.5">
                    <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>Títulos que geram alto engajamento</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-blue-100 dark:bg-blue-800/50 p-1 rounded-full mt-0.5">
                    <Award className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>Roteiros de Reels prontos para gravar</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-blue-100 dark:bg-blue-800/50 p-1 rounded-full mt-0.5">
                    <Target className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>Prompts e ideias otimizados pelo algoritmo</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <Badge variant="outline" className="border-blue-200 dark:border-blue-800 text-slate-600 dark:text-slate-400 text-xs">
            <Zap className="w-3 h-3 mr-1 text-blue-500" />
            Turbine seu conteúdo
          </Badge>

          <Link href={isLocked ? "/dashboard/billing" : "/dashboard/brain"}>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold group relative px-6">
              <span className="group-hover:-translate-x-1 transition-transform inline-block">
                {isLocked ? "Desbloquear" : "Acessar Brain"}
              </span>
              <ArrowUpRight className="w-4 h-4 ml-1.5 opacity-0 group-hover:opacity-100 absolute right-2 group-hover:right-3 transition-all" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Card que mostra estatísticas de uso
function UsageStatsCard({
  clicksUsed = 0,
  maxClicks = 100,
  userPlan = "free"
}: {
  clicksUsed: number;
  maxClicks: number;
  userPlan: string;
}) {
  const percentUsed = userPlan === "free" ? Math.min(100, Math.round((clicksUsed / maxClicks) * 100)) : 20;

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Utilização do Plano</span>
          {userPlan === "ultra" ? (
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <Rocket className="w-3.5 h-3.5 mr-1" />
              ULTRA
            </Badge>
          ) : userPlan === "pro" ? (
            <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <Star className="w-3.5 h-3.5 mr-1" />
              PRO
            </Badge>
          ) : (
            <Badge variant="outline">Gratuito</Badge>
          )}
        </CardTitle>
        <CardDescription>Período atual: {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Cliques utilizados</span>
            <span className="font-medium">{clicksUsed} / {userPlan !== "free" ? "Ilimitado" : maxClicks}</span>
          </div>
          <Progress value={percentUsed} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
            <div className="flex gap-1.5 items-center text-slate-500 dark:text-slate-400 mb-1">
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Links</span>
            </div>
            <p className="font-semibold">{userPlan !== "free" ? "Ilimitados" : "10 ativos"}</p>
          </div>
          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
            <div className="flex gap-1.5 items-center text-slate-500 dark:text-slate-400 mb-1">
              <Target className="w-3.5 h-3.5" />
              <span>Tracking</span>
            </div>
            <p className="font-semibold">{userPlan === "ultra" ? "Completo" : userPlan === "pro" ? "Avançado" : "Básico"}</p>
          </div>
        </div>
      </CardContent>
      {userPlan === "free" && (
        <CardFooter className="pt-0">
          <Link href="/dashboard/billing" className="w-full">
            <Button variant="outline" className="w-full group">
              <span className="mr-1.5">Upgrade para</span>
              <span className="text-blue-600 font-semibold group-hover:text-blue-700">PRO</span>
              <ChevronRight className="w-4 h-4 ml-auto transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}

// Card de links rápidos
function QuickLinksCard({ userPlan }: { userPlan: string }) {
  const quickLinks = [
    { title: "Meus Links", href: "/dashboard/links", icon: LinkIcon, desc: "Gerenciar todos seus links" },
    { title: "Criar Link", href: "/dashboard/new-link", icon: ExternalLink, desc: "Adicionar novo link", highlight: true },
    { title: "Sorteios", href: "/dashboard/giveaway", icon: Gift, desc: "Gerenciar promoções", locked: userPlan !== "ultra" },
  ];

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        <CardDescription>Acesse suas ferramentas principais</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {quickLinks.map((link, index) => (
          <Link key={index} href={link.locked ? "/dashboard/billing" : link.href}>
            <div className={`p-3 rounded-lg flex items-center gap-3 transition-colors relative ${link.highlight
              ? 'bg-blue-50 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <div className={`p-2 rounded-full ${link.highlight
                ? 'bg-blue-100 dark:bg-blue-800/50'
                : 'bg-slate-100 dark:bg-slate-800'}`}>
                <link.icon className={`w-4 h-4 ${link.highlight
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400'}`} />
              </div>
              <div className="flex-grow">
                <p className="font-medium text-sm">{link.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{link.desc}</p>
              </div>
              {link.locked && (
                <Badge className="absolute top-1 right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px]">
                  ULTRA
                </Badge>
              )}
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

// Card de recursos exclusivos
function ExclusiveFeaturesCard({ userPlan }: { userPlan: string }) {
  const features = {
    free: {
      title: "Desbloqueie recursos PRO",
      description: "Acesse ferramentas de IA e analytics avançados",
      features: ["Mentor.IA ilimitado", "FreelinkBrain", "Analytics avançados", "Remover marca Freelink"],
      cta: "Conhecer Plano PRO",
      icon: <Star className="w-10 h-10 text-blue-500" />,
      gradient: "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
      borderColor: "border-blue-100 dark:border-blue-900/20"
    },
    pro: {
      title: "Evolua para ULTRA",
      description: "Automatize seu conteúdo e monetize sua audiência",
      features: ["Calendário automático", "Ferramenta de sorteios", "Rastreamento avançado", "Suporte VIP"],
      cta: "Conhecer Plano ULTRA",
      icon: <Rocket className="w-10 h-10 text-purple-500" />,
      gradient: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
      borderColor: "border-purple-100 dark:border-purple-900/20"
    },
    ultra: {
      title: "Você tem o melhor plano!",
      description: "Aproveite todos os recursos premium do Freelink",
      features: ["Acesso total a todas as ferramentas", "Suporte VIP prioritário", "Novos recursos em primeira mão", "API para integrações"],
      cta: null,
      icon: <Award className="w-10 h-10 text-purple-500" />,
      gradient: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
      borderColor: "border-purple-100 dark:border-purple-900/20"
    }
  };

  const currentFeatures = features[userPlan as keyof typeof features] || features.free;

  return (
    <Card className={`p-6 bg-gradient-to-br ${currentFeatures.gradient} ${currentFeatures.borderColor} border`}>
      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        <div className="bg-white dark:bg-slate-700 rounded-full p-4 shadow-md">
          {currentFeatures.icon}
        </div>

        <div className="flex-grow text-center sm:text-left">
          <h3 className="text-lg font-semibold">{currentFeatures.title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 mt-1">
            {currentFeatures.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 text-sm mb-4">
            {currentFeatures.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-slate-700 dark:text-slate-300">{feature}</span>
              </div>
            ))}
          </div>

          {currentFeatures.cta && (
            <Link href="/dashboard/billing">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                {currentFeatures.cta}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}

export default async function DashboardOverviewPage() {
  const user = await currentUser();
  if (!user) return null;

  const [analytics, planDetails] = await Promise.all([
    fetchAnalytics(user.id),
    getUserSubscriptionPlan(user.id),
  ]);

  const userPlan = planDetails.plan || "free";

  return (
    <div className="space-y-8">
      <DashboardToast />

      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-white dark:to-slate-200">
          Olá, {user.firstName || user.username}! 👋
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mt-1">
          Bem-vindo(a) ao seu centro de comando no Freelink.
        </p>
      </div>

      <Suspense fallback={<SkeletonDashboard />}>
        <DashboardMetrics analytics={analytics} plan={userPlan} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MentorIaWidget userPlan={userPlan} />
            <FreelinkBrainWidget userPlan={userPlan} />
          </div>

                <ExclusiveFeaturesCard userPlan={userPlan} />
        </div>

        <div className="space-y-6">
          <UsageStatsCard
            clicksUsed={analytics?.totalClicks || 0}
            maxClicks={userPlan === "free" ? 1000 : Infinity}
            userPlan={userPlan}
          />
          <QuickLinksCard userPlan={userPlan} />
        </div>
      </div>
    </div>
  );
}