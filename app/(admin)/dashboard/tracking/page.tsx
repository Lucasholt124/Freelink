// Em app/dashboard/tracking/page.tsx

import { currentUser } from "@clerk/nextjs/server";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import {

  Target,
  Sparkles,

  ArrowRight,
  Check,
  Users,
  Award,
  Rocket,
  Crown,
  Star,

  TrendingUp,
  BarChart3,
  Eye,
  MousePointerClick,
  DollarSign,
  Share2,
  Infinity
} from "lucide-react";
import Link from "next/link";
import { TrackingForm } from "@/components/TrackingForm";
import { Button } from "@/components/ui/button";

function LockedTrackingPage() {
  return (
    <div className="relative min-h-[70vh] max-h-[85vh] overflow-hidden">
      {/* Background animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-indigo-500/5 to-blue-600/5 animate-pulse" />
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />

      <div className="relative flex items-center justify-center h-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 xl:gap-12 items-center max-w-7xl w-full">

          {/* Lado Esquerdo - Info e CTA */}
          <div className="text-center lg:text-left space-y-3 lg:space-y-4">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 rounded-full">
              <Target className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-purple-600 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                OTIMIZAÇÃO AVANÇADA
              </span>
            </div>

            {/* Título */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight">
              <span className="block text-gray-900 mb-1">Rastreamento</span>
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Profissional de Pixels
                </span>
                <Sparkles className="absolute -top-2 lg:-top-3 -right-2 lg:-right-3 w-4 lg:w-5 h-4 lg:h-5 text-yellow-400 animate-sparkle" />
              </span>
            </h1>

            <p className="text-sm lg:text-base text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              <span className="font-semibold text-gray-900">+2.000 anunciantes</span> já otimizam campanhas e <span className="text-purple-600 font-semibold">aumentam ROI em 300%</span>
            </p>

            {/* Features em Pills */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200">
                <Share2 className="w-3 h-3 text-blue-500" />
                <span className="text-[10px] sm:text-xs font-medium text-blue-700">Facebook</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-sm border border-purple-200">
                <MousePointerClick className="w-3 h-3 text-purple-500" />
                <span className="text-[10px] sm:text-xs font-medium text-purple-700">TikTok</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg shadow-sm border border-orange-200">
                <BarChart3 className="w-3 h-3 text-orange-500" />
                <span className="text-[10px] sm:text-xs font-medium text-orange-700">Analytics</span>
              </div>
            </div>

            {/* Benefits List Compacto */}
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-green-600" />
                  </div>
                  <span className="text-gray-700">Retargeting automático</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-green-600" />
                  </div>
                  <span className="text-gray-700">Métricas em tempo real</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-green-600" />
                  </div>
                  <span className="text-gray-700">Otimização de ROI e ROAS</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-green-600" />
                  </div>
                  <span className="text-gray-700">Audiências ilimitadas</span>
                </div>
              </div>
            </div>

            {/* Stats Rápidos */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-2 border border-purple-100">
                <p className="text-lg font-bold text-purple-600">+300%</p>
                <p className="text-[10px] text-gray-600">ROI</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-2 border border-blue-100">
                <p className="text-lg font-bold text-blue-600">-60%</p>
                <p className="text-[10px] text-gray-600">Custo</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-2 border border-green-100">
                <p className="text-lg font-bold text-green-600">5x</p>
                <p className="text-[10px] text-gray-600">Dados</p>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 border-2 border-white flex items-center justify-center">
                    <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-[10px] sm:text-xs text-gray-600 ml-1">4.9/5 (2.1k)</span>
              </div>
            </div>

            {/* CTA Principal */}
            <div className="space-y-2">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto group bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 rounded-xl shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 h-10"
              >
                <Link href="/dashboard/billing">
                  <Rocket className="w-4 h-4 mr-1.5 group-hover:rotate-12 transition-transform" />
                  <span className="font-bold text-sm">Ativar Ultra Agora</span>
                  <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              {/* Garantias */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 text-[10px] text-gray-500">
                <span className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-500" />
                  7 dias grátis
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3 text-green-500" />
                  Garantia 30d
                </span>
                <span className="flex items-center gap-1">
                  <Infinity className="w-3 h-3 text-purple-500" />
                  Pixels ilimitados
                </span>
              </div>
            </div>
          </div>

          {/* Lado Direito - Visual Desktop Only */}
          <div className="relative hidden lg:block">
            <div className="relative max-h-[70vh] flex items-center justify-center">
              {/* Cards de pixels - Reduzido */}
              <div className="absolute top-0 left-0 transform -rotate-3 z-10">
                <div className="bg-white rounded-lg shadow-lg p-3 border border-blue-100 w-48">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="p-1.5 bg-blue-100 rounded">
                      <Share2 className="w-3 h-3 text-blue-600" />
                    </div>
                    <span className="text-[10px] font-bold">Facebook Pixel</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-500">Eventos</span>
                      <span className="font-bold text-green-600">+1.2k</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 w-4/5 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute top-12 right-0 transform rotate-2 z-20">
                <div className="bg-white rounded-lg shadow-lg p-3 border border-purple-100 w-48">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="p-1.5 bg-purple-100 rounded">
                      <MousePointerClick className="w-3 h-3 text-purple-600" />
                    </div>
                    <span className="text-[10px] font-bold">TikTok Pixel</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-gray-500">Conversões</span>
                      <span className="font-bold text-green-600">+847</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-600 w-3/5 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Central - Compacto */}
              <div className="relative z-30 mt-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-2xl p-5 text-white max-w-sm">
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative">
                    <div className="p-3 bg-white/20 backdrop-blur rounded-full">
                      <Target className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 animate-spin-slow">
                      <div className="p-1.5 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full">
                        <Crown className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-base font-bold mb-0.5">Rastreamento Ultra</p>
                    <p className="text-xs text-white/80">Todos os pixels, um só lugar</p>
                  </div>

                  {/* Mini grid de métricas - Compacto */}
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <div className="bg-white/10 backdrop-blur rounded p-2">
                      <Eye className="w-3 h-3 mb-0.5" />
                      <p className="text-[9px] text-white/70">Views</p>
                      <p className="text-[10px] font-bold">Track</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded p-2">
                      <MousePointerClick className="w-3 h-3 mb-0.5" />
                      <p className="text-[9px] text-white/70">Clicks</p>
                      <p className="text-[10px] font-bold">Monitor</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded p-2">
                      <DollarSign className="w-3 h-3 mb-0.5" />
                      <p className="text-[9px] text-white/70">Sales</p>
                      <p className="text-[10px] font-bold">Atribuir</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded p-2">
                      <TrendingUp className="w-3 h-3 mb-0.5" />
                      <p className="text-[9px] text-white/70">ROI</p>
                      <p className="text-[10px] font-bold">Otimizar</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-3 text-center pt-2 border-t border-white/20 w-full">
                    <div className="flex-1">
                      <p className="text-base font-bold">∞</p>
                      <p className="text-[9px] text-white/70">Pixels</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold">24/7</p>
                      <p className="text-[9px] text-white/70">Track</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold">Real</p>
                      <p className="text-[9px] text-white/70">Time</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card inferior - Analytics - Compacto */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-white rounded-lg shadow-lg p-2.5 border border-orange-100 w-40">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="p-1 bg-orange-100 rounded">
                      <BarChart3 className="w-3 h-3 text-orange-600" />
                    </div>
                    <span className="text-[10px] font-bold">Analytics</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-2.5 h-2.5 text-green-500" />
                    <span className="text-[9px] text-gray-600">Conectado</span>
                  </div>
                </div>
              </div>

              <Sparkles className="absolute -top-2 -right-2 w-4 h-4 text-yellow-400 animate-sparkle" />
              <Sparkles className="absolute -bottom-2 -left-2 w-3 h-3 text-blue-400 animate-sparkle animation-delay-1000" />
            </div>
          </div>

          {/* Visual Mobile */}
          <div className="lg:hidden flex justify-center">
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-xl">
                <Target className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1.5 -right-1.5 p-1 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full">
                <Crown className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function TrackingPage() {
  const user = await currentUser();
  if (!user) return null;

  const subscription = await getUserSubscriptionPlan(user.id);

  if (subscription.plan !== "ultra") {
    return <LockedTrackingPage />;
  }

  return (
    <div className="space-y-3 sm:space-y-4 max-w-6xl mx-auto">
      {/* Cabeçalho Compacto */}
      <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-0">
        <div className="p-2 sm:p-2.5 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl shadow-md">
          <Target className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Rastreamento
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow animate-pulse">
              <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
              ULTRA
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
            Conecte seus pixels • <span className="font-semibold text-purple-600">Otimize campanhas</span>
          </p>
        </div>
      </div>

      {/* Formulário de Tracking */}
      <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-lg animate-fadeIn">
        <TrackingForm />
      </div>
    </div>
  );
}