import { Suspense } from "react";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import {
   BrainCircuit, LinkIcon,
  Zap, Gift, Sparkles, Target,
  ChevronRight,  Rocket, Star,
  Crown, Flame, Heart,
  Trophy, Diamond, Infinity, ArrowRight, Play,
  Layers, Globe, Magnet, Workflow, Plus, Bolt,
  Type,
  Instagram,
  Palette,
  ImageIcon
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

// --- Componentes Otimizados para Responsividade ---

function MentorIaWidget({ userPlan }: { userPlan: string }) {
  const isLocked = userPlan === "free";

  return (
   <div className="relative group h-full">
  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
  {isLocked && (
    <div className="absolute -top-3 -right-3 z-20 animate-bounce">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-sm opacity-60"></div>
        <Badge className="relative bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0 px-3 py-1.5 sm:px-4 sm:py-2 font-bold shadow-2xl">
          <Crown className="w-4 h-4 mr-1.5 animate-spin" style={{ animationDuration: '3s' }} />
          ULTRA UNLOCK
        </Badge>
      </div>
    </div>
  )}
  <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6 sm:p-8 rounded-3xl shadow-2xl text-white transition-all duration-700 group-hover:shadow-blue-500/25 group-hover:shadow-2xl group-hover:-translate-y-2 group-hover:scale-105 flex flex-col h-full border border-blue-400/30 overflow-hidden">
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
    </div>
    <div className="relative z-10 flex-grow flex flex-col">
      <div className="flex items-center gap-4 sm:gap-6 mb-6">
        <div className="relative flex-shrink-0">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-purple-600 rounded-2xl blur opacity-60 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-white/20 to-white/10 p-3 sm:p-4 rounded-2xl backdrop-blur-sm border border-white/20">
            {/* Ícone atualizado para representar imagem/criação */}
            <ImageIcon className="w-7 h-7 sm:w-8 sm:h-8 animate-pulse" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">Mentor.IA</h2>
          <div className="flex items-center gap-2 mt-1">
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            {/* Subtítulo atualizado */}
            <p className="text-blue-200 font-medium text-xs sm:text-sm">Seu estúdio de criação visual</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-white/10 to-white/5 rounded-2xl p-4 sm:p-6 border border-white/10 backdrop-blur-sm mb-6 flex-grow">
        <h3 className="font-bold text-md sm:text-lg mb-4 flex items-center">
          <Bolt className="w-5 h-5 mr-2 text-yellow-400 animate-pulse" />
          {/* Título da lista atualizado */}
          Crie imagens únicas com IA
        </h3>
        <div className="space-y-3">
          {/* Lista de features atualizada para o Gerador de Imagens */}
          {[
            { icon: Type, text: "Transforme qualquer texto em arte", color: "text-blue-400" },
            { icon: Instagram, text: "Visuais para posts e stories", color: "text-purple-400" },
            { icon: Palette, text: "Estilos de arte ilimitados", color: "text-pink-400" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 group/item">
              <div className="bg-gradient-to-r from-white/20 to-white/10 p-2 rounded-xl group-hover/item:scale-110 transition-transform flex-shrink-0">
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <span className="font-medium text-sm sm:text-base group-hover/item:text-white transition-colors">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="relative z-10 mt-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-400 animate-pulse" />
          {/* Prova social atualizada */}
          <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            500.000+ imagens já criadas
          </span>
        </div>
        <Link href={isLocked ? "/dashboard/billing" : "/dashboard/mentor-ia"} className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto relative group/btn bg-gradient-to-r from-white to-blue-50 text-slate-900 hover:from-yellow-400 hover:to-orange-500 hover:text-white font-black px-6 py-3 rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-2xl text-sm sm:text-base">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur opacity-0 group-hover/btn:opacity-60 transition duration-300"></div>
            <span className="relative flex items-center justify-center gap-2">
              <Play className="w-4 h-4" />
              {isLocked ? "DESBLOQUEAR" : "CRIAR AGORA"}
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
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
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 via-cyan-600 to-emerald-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 animate-pulse"></div>
      <div className="absolute -top-3 -right-3 z-20">
        <div className="relative animate-bounce" style={{ animationDelay: '0.5s' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full blur-sm opacity-60"></div>
          <Badge className="relative bg-gradient-to-r from-emerald-500 to-cyan-600 text-white border-0 px-3 py-1.5 sm:px-4 sm:py-2 font-bold shadow-xl">
            <Sparkles className="w-4 h-4 mr-1.5 animate-spin" />
            VIRAL AI
          </Badge>
        </div>
      </div>
      <div className="relative bg-gradient-to-br from-slate-50 via-emerald-50 to-cyan-50 dark:from-slate-900 dark:via-emerald-950 dark:to-cyan-950 p-6 sm:p-8 rounded-3xl shadow-2xl transition-all duration-700 group-hover:shadow-emerald-500/25 group-hover:-translate-y-2 group-hover:scale-105 flex flex-col h-full border border-emerald-200 dark:border-emerald-800 overflow-hidden">
        {/* Efeito de partículas removido para melhor performance em mobile, substituído por gradiente sutil */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,128,128,0.05),transparent_40%)]"></div>
        <div className="relative z-10 flex-grow flex flex-col">
          <div className="flex items-center gap-4 sm:gap-6 mb-6">
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-cyan-600 rounded-2xl blur opacity-40 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-emerald-100 to-cyan-100 dark:from-emerald-900 dark:to-cyan-900 p-3 sm:p-4 rounded-2xl">
                <BrainCircuit className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black">
                <span className="bg-gradient-to-r from-slate-900 to-emerald-800 dark:from-white dark:to-emerald-200 bg-clip-text text-transparent">Freelink</span>
                <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">Brain</span>
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Infinity className="w-4 h-4 text-cyan-500 animate-spin" style={{ animationDuration: '3s' }} />
                <p className="text-emerald-700 dark:text-emerald-300 font-bold text-xs sm:text-sm">IA que pensa como viral</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 rounded-2xl p-4 sm:p-6 border border-emerald-200 dark:border-emerald-800 mb-6 flex-grow">
            <h3 className="font-bold text-md sm:text-lg mb-4 flex items-center text-slate-800 dark:text-slate-200">
              <Zap className="w-5 h-5 mr-2 text-emerald-500 animate-pulse" />
              Conteúdo viral em 3 cliques
            </h3>
            <div className="space-y-3">
              {[
                { icon: Magnet, text: "Títulos com 10x engajamento", color: "text-emerald-600" },
                { icon: Workflow, text: "Scripts de Reels virais", color: "text-cyan-600" },
                { icon: Diamond, text: "Prompts testados por 50k+", color: "text-purple-600" },
                { icon: Globe, text: "Gerador de Mensagens de Abordagem", color: "text-purple-600" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 group/item">
                  <div className="bg-white dark:bg-slate-700 p-2 rounded-xl shadow-md group-hover/item:scale-110 transition-transform flex-shrink-0">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <span className="font-semibold text-sm sm:text-base text-slate-700 dark:text-slate-300 group-hover/item:text-slate-900 dark:group-hover/item:text-white transition-colors">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10 mt-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500 animate-pulse" />
              <span className="text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Top #1 Brain AI
              </span>
            </div>
            <Link href={isLocked ? "/dashboard/billing" : "/dashboard/brain"} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto relative group/btn bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-black px-6 py-3 rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-2xl text-sm sm:text-base">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-2xl blur opacity-0 group-hover/btn:opacity-60 transition duration-300"></div>
                <span className="relative flex items-center justify-center gap-2">
                  <BrainCircuit className="w-4 h-4" />
                  {isLocked ? "ATIVAR" : "ENTRAR"}
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsageStatsCard({ clicksUsed = 0, maxClicks = 100, userPlan = "free" }: { clicksUsed: number; maxClicks: number; userPlan: string; }) {
  const percentUsed = userPlan === "free" ? Math.min(100, Math.round((clicksUsed / maxClicks) * 100)) : 100;

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 overflow-hidden relative group hover:shadow-2xl transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="text-lg sm:text-xl flex justify-between items-center">
          <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent font-black">Power Status</span>
          {userPlan === "ultra" ? (
            <Badge className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 font-black shadow-lg"><Crown className="w-4 h-4 mr-1.5" />ULTRA</Badge>
          ) : userPlan === "pro" ? (
            <Badge className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 font-black shadow-lg"><Rocket className="w-4 h-4 mr-1.5" />PRO</Badge>
          ) : (
            <Badge variant="outline" className="font-bold">Iniciante</Badge>
          )}
        </CardTitle>
        <CardDescription className="font-medium text-sm">Período: {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
        <div className="space-y-3">
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-slate-600 dark:text-slate-400">Poder Utilizado</span>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-black">
              {clicksUsed} / {userPlan !== "free" ? "∞" : maxClicks}
            </span>
          </div>
          <Progress value={percentUsed} className="h-3 bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 p-4 rounded-2xl border border-blue-200 dark:border-blue-800 hover:scale-105 transition-transform">
            <div className="flex gap-2 items-center text-blue-600 dark:text-blue-400 mb-2">
              <LinkIcon className="w-4 h-4" />
              <span className="font-bold text-sm">Links</span>
            </div>
            <p className="font-black text-md sm:text-lg">{userPlan !== "free" ? "Ilimitados" : "10"}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 p-4 rounded-2xl border border-purple-200 dark:border-purple-800 hover:scale-105 transition-transform">
            <div className="flex gap-2 items-center text-purple-600 dark:text-purple-400 mb-2">
              <Target className="w-4 h-4" />
              <span className="font-bold text-sm">Analytics</span>
            </div>
            <p className="font-black text-md sm:text-lg">{userPlan === "ultra" ? "Máximo" : userPlan === "pro" ? "Pro" : "Básico"}</p>
          </div>
        </div>
      </CardContent>
      {userPlan === "free" && (
        <CardFooter className="pt-0 relative z-10">
          <Link href="/dashboard/billing" className="w-full">
            <Button className="w-full group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black rounded-2xl py-5 text-md sm:text-lg transition-all duration-300 hover:scale-105">
              <span className="mr-2">🚀 Upgrade para</span>
              <span className="text-yellow-300 font-black">PRO</span>
              <ChevronRight className="w-5 h-5 ml-auto transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}

function QuickLinksCard({ userPlan }: { userPlan: string }) {
  const quickLinks = [
    { title: "Meus Links", href: "/dashboard/links", icon: Layers, desc: "Gerencie seu império", gradient: "from-blue-500 to-indigo-500", bgGradient: "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20" },
    { title: "Criar Link", href: "/dashboard/new-link", icon: Plus, desc: "Novo link viral", highlight: true, gradient: "from-emerald-500 to-cyan-500", bgGradient: "from-emerald-50 to-cyan-50 dark:from-emerald-950/20 dark:to-cyan-950/20" },
    { title: "Sorteios Ultra", href: "/dashboard/giveaway", icon: Gift, desc: "Monetize sua audiência", locked: userPlan !== "ultra", gradient: "from-purple-500 to-pink-500", bgGradient: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20" },
  ];

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent font-black">🚀 Ações Poderosas</CardTitle>
        <CardDescription className="font-semibold text-sm">Ferramentas que geram resultados</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickLinks.map((link, index) => (
          <Link key={index} href={link.locked ? "/dashboard/billing" : link.href}>
            <div className={`relative group p-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg border ${link.highlight ? `border-emerald-200 dark:border-emerald-800` : `border-slate-200 dark:border-slate-700`} ${link.bgGradient}`}>
              {link.locked && (
                <div className="absolute -top-2 -right-2 z-10">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold animate-pulse">ULTRA</Badge>
                </div>
              )}
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-r ${link.gradient} shadow-md group-hover:scale-110 transition-transform`}>
                  <link.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-grow">
                  <p className="font-black text-base">{link.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{link.desc}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

function ExclusiveFeaturesCard({ userPlan }: { userPlan: string }) {
    const features = {
        free: {
  title: "🎯 Desbloqueie o Poder ULTRA",
  description: "Transforme seu perfil com imagens profissionais",
  features: [
    "🖼️ Gerador de Imagens IA Ilimitado",
    "⚡ FreelinkBrain Premium",
    "📊 Analytics Profundos",
    "🎨 Marca Própria"
  ],
  cta: "ATIVAR SUPERPODERES",
  icon: <Rocket className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500" />,
  gradient: "from-blue-500 via-indigo-500 to-purple-500",
  bgGradient: "from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20"
},
        pro: { title: "👑 Evolua para ULTRA Master", description: "Domine completamente sua audiência", features: ["🤖 Automação Total", "🎁 Engine de Sorteios", "🎯 Tracking Avançado", "⭐ Suporte VIP 24/7"], cta: "VIRAR ULTRA MASTER", icon: <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500" />, gradient: "from-purple-500 via-pink-500 to-red-500", bgGradient: "from-purple-50 via-pink-50 to-red-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-red-950/20" },
        ultra: { title: "💎 Você É Um ULTRA Master!", description: "Status máximo desbloqueado", features: ["🌟 Acesso Total Premium", "🚀 Recursos Futuros", "💬 Canal VIP Direto", "🔥 API Exclusiva"], cta: null, icon: <Diamond className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500" />, gradient: "from-yellow-400 via-orange-500 to-red-500", bgGradient: "from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-950/20 dark:via-orange-950/20 dark:to-red-950/20" }
    };
    const currentFeatures = features[userPlan as keyof typeof features] || features.free;
    return (
        <div className="relative group">
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${currentFeatures.gradient} rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 animate-pulse`}></div>
            <Card className={`relative bg-gradient-to-br ${currentFeatures.bgGradient} border-0 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-700 group-hover:shadow-3xl group-hover:-translate-y-1`}>
                <div className="absolute inset-0 opacity-5"><div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-white to-transparent rounded-full blur-2xl"></div><div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-white to-transparent rounded-full blur-xl"></div></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                    <div className="relative flex-shrink-0">
                        <div className={`absolute -inset-2 bg-gradient-to-r ${currentFeatures.gradient} rounded-3xl blur opacity-40 animate-pulse`}></div>
                        <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl">{currentFeatures.icon}</div>
                    </div>
                    <div className="flex-grow text-center md:text-left">
                        <h3 className="text-2xl sm:text-3xl font-black mb-2 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">{currentFeatures.title}</h3>
                        <p className="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-300 mb-6">{currentFeatures.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-6">
                            {currentFeatures.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 group/feature">
                                    <div className={`w-7 h-7 rounded-xl bg-gradient-to-r ${currentFeatures.gradient} flex items-center justify-center shadow-lg group-hover/feature:scale-110 transition-transform flex-shrink-0`}><Zap className="w-4 h-4 text-white" /></div>
                                    <span className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200">{feature}</span>
                                </div>
                            ))}
                        </div>
                        {currentFeatures.cta && (
                            <Link href="/dashboard/billing">
                                <Button className={`w-full sm:w-auto bg-gradient-to-r ${currentFeatures.gradient} hover:opacity-90 text-white font-black px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-2xl`}>
                                    <span className="flex items-center justify-center gap-3"><Rocket className="w-5 h-5" />{currentFeatures.cta}<ArrowRight className="w-5 h-5" /></span>
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}


// --- Componente Principal com Layout Responsivo ---

export default async function DashboardOverviewPage() {
  const user = await currentUser();
  if (!user) return null;

  const [analytics, planDetails] = await Promise.all([
    fetchAnalytics(user.id),
    getUserSubscriptionPlan(user.id),
  ]);

  const userPlan = planDetails.plan || "free";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 md:w-96 md:h-96 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 md:w-96 md:h-96 bg-gradient-to-tl from-emerald-400/10 to-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 space-y-8 sm:space-y-12 p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
        <DashboardToast />

        <header className="text-center md:text-left">
          <div className="inline-flex flex-col md:flex-row items-center gap-4 mb-4">
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-60 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl">
                <Globe className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent leading-tight">
                Olá, {user.firstName || user.username}!
                <span className="inline-block animate-bounce ml-2 text-2xl sm:text-3xl lg:text-4xl via-black dark:via-white text-slate-600">🚀</span>
              </h1>
              <p className="text-lg sm:text-xl font-bold text-slate-600 dark:text-slate-400 mt-2">
                Seu império digital está
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600 ml-2">
                  revolucionando
                </span>
              </p>
            </div>
          </div>
        </header>

        <Suspense fallback={<SkeletonDashboard />}>
          <DashboardMetrics analytics={analytics} plan={userPlan} />
        </Suspense>

        {/* Grid principal adaptativo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Coluna principal (ocupa 2/3 em telas grandes) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <MentorIaWidget userPlan={userPlan} />
              <FreelinkBrainWidget userPlan={userPlan} />
            </div>
            <ExclusiveFeaturesCard userPlan={userPlan} />
          </div>

          {/* Sidebar (ocupa 1/3 em telas grandes, empilha em telas menores) */}
          <div className="space-y-8">
            <UsageStatsCard
              clicksUsed={analytics?.totalClicks || 0}
              maxClicks= {1000}
              userPlan={userPlan}
            />
            <QuickLinksCard userPlan={userPlan} />
            <Card className="bg-gradient-to-br from-slate-900 to-purple-900 text-white border-0 shadow-2xl">
              <CardContent className="p-6">
                <div className="text-center">
                  <Star className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-lg sm:text-xl font-black mb-2">Status Viral</h3>
                  <div className="text-2xl sm:text-3xl font-black text-yellow-400 mb-2">
                    {userPlan === "ultra" ? "LENDÁRIO" : userPlan === "pro" ? "ÉPICO" : "INICIANTE"}
                  </div>
                  <p className="text-sm opacity-80">
                    {userPlan === "ultra" ? "Você domina completamente o jogo!" : "Sua jornada épica está começando!"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <footer className="text-center py-8 sm:py-12">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-black text-base sm:text-lg shadow-2xl">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            <span>Sua revolução digital acontece HOJE!</span>
            <Bolt className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce" />
          </div>
        </footer>
      </div>
    </div>
  );
}
