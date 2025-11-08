import { currentUser } from "@clerk/nextjs/server";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import {
  Calculator,
  Lock,
  Sparkles,
  Crown,
  Star,
  Zap,
  ArrowRight,
  Check,
  Award,
  Rocket,
  TrendingUp,
  DollarSign,
  Target,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProfitCalculatorComponent from "@/components/ProfitCalculator";

function LockedPremiumFeature() {
  return (
    <div className="relative min-h-[600px] md:min-h-[700px] lg:h-[calc(100vh-200px)] overflow-hidden">
      {/* Background animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 via-blue-500/5 to-purple-600/5 animate-pulse" />
      <div className="absolute -top-10 md:-top-20 -right-10 md:-right-20 w-40 h-40 md:w-72 md:h-72 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute -bottom-10 md:-bottom-20 -left-10 md:-left-20 w-40 h-40 md:w-72 md:h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />

      <div className="relative flex items-center justify-center min-h-[600px] md:min-h-[700px] lg:h-full px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center max-w-7xl w-full">

          {/* Lado Esquerdo - Info e CTA */}
          <div className="text-center lg:text-left space-y-4 md:space-y-5 lg:space-y-6 px-2 sm:px-0">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-emerald-100 to-blue-100 border border-emerald-200 rounded-full">
              <Zap className="w-3 md:w-3.5 h-3 md:h-3.5 text-emerald-600 animate-pulse" />
              <span className="text-[10px] md:text-xs font-semibold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent whitespace-nowrap">
                EXCLUSIVO ULTRA
              </span>
            </div>

            {/* Título */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight">
              <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Calculadora Inteligente
              </span>
              <br />
              <span className="text-gray-900">de Lucros</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 px-2 sm:px-0">
              <span className="font-semibold text-gray-900">+5.000 empreendedores</span> já descobriram onde estão{" "}
              <span className="text-emerald-600 font-semibold">perdendo dinheiro</span> e como{" "}
              <span className="text-blue-600 font-semibold">aumentar lucros em até 300%</span>
            </p>

            {/* Features compactas */}
            <div className="flex flex-wrap gap-2 md:gap-3 justify-center lg:justify-start max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-white rounded-lg shadow-sm border border-gray-200">
                <TrendingUp className="w-3 md:w-4 h-3 md:h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-[10px] md:text-xs font-medium whitespace-nowrap">Análise IA</span>
              </div>
              <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-emerald-50 rounded-lg shadow-sm border border-emerald-200">
                <BarChart3 className="w-3 md:w-4 h-3 md:h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-[10px] md:text-xs font-medium text-emerald-700 whitespace-nowrap">Benchmarks</span>
              </div>
              <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-white rounded-lg shadow-sm border border-gray-200">
                <Target className="w-3 md:w-4 h-3 md:h-4 text-blue-500 flex-shrink-0" />
                <span className="text-[10px] md:text-xs font-medium whitespace-nowrap">3 Cenários</span>
              </div>
              <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-white rounded-lg shadow-sm border border-gray-200">
                <Sparkles className="w-3 md:w-4 h-3 md:h-4 text-purple-500 flex-shrink-0" />
                <span className="text-[10px] md:text-xs font-medium whitespace-nowrap">Insights</span>
              </div>
            </div>

            {/* Social Proof Compacto */}
            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-emerald-400 to-blue-400 border-2 border-white shadow-sm"
                  />
                ))}
              </div>
              <div className="flex items-center gap-0.5 md:gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 md:w-3.5 h-3 md:h-3.5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-[10px] md:text-xs text-gray-600 ml-1">4.9/5 (1.543)</span>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-2">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto group bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 hover:from-emerald-700 hover:via-blue-700 hover:to-purple-700 rounded-xl shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 h-11 md:h-12"
              >
                <Link href="/dashboard/billing" className="flex items-center justify-center gap-2 px-6 md:px-8">
                  <Rocket className="w-4 md:w-5 h-4 md:h-5 group-hover:rotate-12 transition-transform flex-shrink-0" />
                  <span className="font-bold text-sm md:text-base">Ativar Ultra Agora</span>
                  <ArrowRight className="w-4 md:w-5 h-4 md:h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </Link>
              </Button>
            </div>

            {/* Garantias */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 md:gap-4 text-[10px] md:text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Check className="w-3 md:w-3.5 h-3 md:h-3.5 text-green-500 flex-shrink-0" />
                <span className="whitespace-nowrap">Cálculos ilimitados</span>
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-3 md:w-3.5 h-3 md:h-3.5 text-green-500 flex-shrink-0" />
                <span className="whitespace-nowrap">Histórico completo</span>
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5 text-purple-500 flex-shrink-0" />
                <span className="whitespace-nowrap">IA avançada</span>
              </span>
            </div>
          </div>

          {/* Lado Direito - Visual Desktop */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Cards sobrepostos */}
              <div className="absolute top-0 right-0 transform rotate-6 translate-x-4">
                <div className="w-56 xl:w-64 h-36 xl:h-40 bg-gradient-to-br from-emerald-400 to-blue-400 rounded-2xl shadow-xl opacity-20"></div>
              </div>
              <div className="absolute top-4 right-4 transform rotate-3">
                <div className="w-56 xl:w-64 h-36 xl:h-40 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl shadow-xl opacity-40"></div>
              </div>

              {/* Card principal */}
              <div className="relative bg-white rounded-2xl shadow-2xl p-6 xl:p-8 border border-emerald-100">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <div className="p-5 xl:p-6 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full">
                      <Lock className="w-14 xl:w-16 h-14 xl:h-16 text-emerald-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 p-2 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full animate-spin-slow">
                      <Crown className="w-4 xl:w-5 h-4 xl:h-5 text-white" />
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-lg xl:text-xl font-bold text-gray-900 mb-2">Ferramenta Premium</p>
                    <p className="text-sm text-gray-500">Desbloqueie análises avançadas</p>
                  </div>

                  {/* Mini preview de recursos */}
                  <div className="w-full space-y-2 pt-4 border-t">
                    <div className="flex items-center gap-3 text-xs xl:text-sm text-gray-700">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      <span>Cálculo automático de margem</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs xl:text-sm text-gray-700">
                      <PieChart className="w-4 h-4 text-blue-500" />
                      <span>Análise de custos detalhada</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs xl:text-sm text-gray-700">
                      <LineChart className="w-4 h-4 text-purple-500" />
                      <span>Simulação de 3 cenários</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs xl:text-sm font-bold text-emerald-600">
                      <Sparkles className="w-4 h-4" />
                      <span>IA que sugere otimizações</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sparkles decorativos */}
              <Sparkles className="absolute -top-4 -left-4 w-5 xl:w-6 h-5 xl:h-6 text-yellow-400 animate-sparkle" />
              <Sparkles className="absolute -bottom-4 -right-4 w-4 xl:w-5 h-4 xl:h-5 text-emerald-400 animate-sparkle animation-delay-1000" />
            </div>
          </div>

          {/* Visual Mobile */}
          <div className="lg:hidden flex justify-center">
            <div className="relative">
              <div className="p-4 md:p-5 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-2xl">
                <Calculator className="w-10 md:w-12 h-10 md:h-12 text-emerald-600" />
              </div>
              <div className="absolute -top-2 -right-2 p-1.5 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full">
                <Crown className="w-3 md:w-4 h-3 md:h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ProfitCalculatorPage() {
  const user = await currentUser();
  if (!user) return null;

  const subscription = await getUserSubscriptionPlan(user.id);
  const isAdmin = user.id === "user_301NTkVsE3v48SXkoCEp0XOXifI";
  const hasAccess = subscription.plan === 'ultra' || isAdmin;

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Cabeçalho Compacto */}
      <div className="flex items-center gap-2 md:gap-3 px-3 sm:px-4 lg:px-0">
        <div className="p-2 md:p-2.5 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-xl shadow-md flex-shrink-0">
          <Calculator className="w-5 md:w-6 h-5 md:h-6 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Calculadora de Lucros
            </h1>
            {hasAccess && (
              <span className="inline-flex items-center px-2 md:px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-bold bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow animate-pulse whitespace-nowrap">
                <Crown className="w-2.5 md:w-3 h-2.5 md:h-3 mr-0.5 md:mr-1" />
                {isAdmin ? 'ADMIN' : 'ULTRA'}
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-gray-600 mt-0.5 line-clamp-1">
            <span className="font-semibold text-emerald-600">Análise IA</span> •
            <span className="font-semibold text-blue-600"> Benchmarks</span>
            <span className="hidden sm:inline"> • Cenários inteligentes</span>
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      {hasAccess ? (
        <div className="animate-fadeIn">
          <ProfitCalculatorComponent />
        </div>
      ) : (
        <LockedPremiumFeature />
      )}
    </div>
  );
}