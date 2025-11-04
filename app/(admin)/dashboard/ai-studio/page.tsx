import { currentUser } from "@clerk/nextjs/server";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import {
  Wand2,
  Sparkles,
  Crown,
  Star,
  Zap,
  ArrowRight,
  Check,
  Users,
  Award,
  Rocket,
  Image,
  Mic,
  Video,
  Search,
  Scissors,
  Volume2,
  FileText,
  Infinity,
  TrendingUp,
  Palette
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AIStudioClient } from '../../../../components/AIStudioClient';

function LockedPremiumFeature() {
  return (
    <div className="relative min-h-[600px] md:min-h-[700px] lg:h-[calc(100vh-200px)] overflow-hidden">
      {/* Background animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-pink-500/5 to-indigo-600/5 animate-pulse" />
      <div className="absolute -top-10 md:-top-20 -right-10 md:-right-20 w-40 h-40 md:w-72 md:h-72 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute -bottom-10 md:-bottom-20 -left-10 md:-left-20 w-40 h-40 md:w-72 md:h-72 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />

      <div className="relative flex items-center justify-center min-h-[600px] md:min-h-[700px] lg:h-full px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center max-w-7xl w-full">

          {/* Lado Esquerdo - Info e CTA */}
          <div className="text-center lg:text-left space-y-4 md:space-y-5 lg:space-y-6 px-2 sm:px-0">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-full">
              <Zap className="w-3 md:w-3.5 h-3 md:h-3.5 text-purple-600 animate-pulse flex-shrink-0" />
              <span className="text-[10px] md:text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent whitespace-nowrap">
                SUÍTE COMPLETA DE IA
              </span>
            </div>

            {/* Título */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight">
              <span className="block text-gray-900 mb-1 md:mb-2">Desbloqueie o</span>
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                  Estúdio IA Completo
                </span>
                <Sparkles className="absolute -top-2 md:-top-4 -right-2 md:-right-4 w-4 md:w-6 h-4 md:h-6 text-yellow-400 animate-sparkle" />
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 px-2 sm:px-0">
              <span className="font-semibold text-gray-900">+8.000 criadores</span> já usam o Estúdio IA para
              <span className="text-purple-600 font-semibold"> economizar 15h/semana</span> em edição
            </p>

            {/* Grid de Features Compacto */}
            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-1.5 md:gap-2 p-2 md:p-2.5 bg-white rounded-lg shadow-sm border border-gray-200">
                <Image className="w-3.5 md:w-4 h-3.5 md:h-4 text-blue-500 flex-shrink-0" />
                <span className="text-[10px] md:text-xs font-medium">Aprimore Imagens</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 p-2 md:p-2.5 bg-white rounded-lg shadow-sm border border-gray-200">
                <Mic className="w-3.5 md:w-4 h-3.5 md:h-4 text-green-500 flex-shrink-0" />
                <span className="text-[10px] md:text-xs font-medium">Gere Áudios</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 p-2 md:p-2.5 bg-white rounded-lg shadow-sm border border-gray-200">
                <FileText className="w-3.5 md:w-4 h-3.5 md:h-4 text-purple-500 flex-shrink-0" />
                <span className="text-[10px] md:text-xs font-medium">Transcreva Vídeos</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 p-2 md:p-2.5 bg-white rounded-lg shadow-sm border border-gray-200">
                <Search className="w-3.5 md:w-4 h-3.5 md:h-4 text-orange-500 flex-shrink-0" />
                <span className="text-[10px] md:text-xs font-medium">Encontre Virais</span>
              </div>
            </div>

            {/* Comparação Visual Compacta */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 md:p-4 border border-purple-100 max-w-md mx-auto lg:mx-0">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] md:text-xs text-gray-500">Free</p>
                  <p className="text-lg md:text-xl font-bold text-gray-400">0</p>
                  <p className="text-[10px] md:text-xs text-gray-400">ferramentas</p>
                </div>
                <div>
                  <p className="text-[10px] md:text-xs text-blue-600">Pro</p>
                  <p className="text-lg md:text-xl font-bold text-blue-600">Brain</p>
                  <p className="text-[10px] md:text-xs text-blue-500">apenas</p>
                </div>
                <div className="relative">
                  <Crown className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 md:w-4 h-3 md:h-4 text-yellow-500" />
                  <p className="text-[10px] md:text-xs bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold mt-3">Ultra</p>
                  <p className="text-lg md:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">∞</p>
                  <p className="text-[10px] md:text-xs text-purple-600 font-medium">Tudo!</p>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white flex items-center justify-center shadow-sm">
                    <Users className="w-2.5 md:w-3 h-2.5 md:h-3 text-white" />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-0.5 md:gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 md:w-3.5 h-3 md:h-3.5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-[10px] md:text-xs text-gray-600 ml-1">4.9/5 (3.241)</span>
              </div>
            </div>

            {/* CTA Principal */}
            <div className="space-y-3 pt-2">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto group bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 rounded-xl shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 h-11 md:h-12"
              >
                <Link href="/dashboard/billing" className="flex items-center justify-center gap-2 px-6 md:px-8">
                  <Rocket className="w-4 md:w-5 h-4 md:h-5 group-hover:rotate-12 transition-transform flex-shrink-0" />
                  <span className="font-bold text-sm md:text-base">Ativar Ultra Agora</span>
                  <ArrowRight className="w-4 md:w-5 h-4 md:h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </Link>
              </Button>

              {/* Garantias */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 md:gap-4 text-[10px] md:text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Check className="w-3 md:w-3.5 h-3 md:h-3.5 text-green-500 flex-shrink-0" />
                  <span className="whitespace-nowrap">7 dias grátis</span>
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-3 md:w-3.5 h-3 md:h-3.5 text-green-500 flex-shrink-0" />
                  <span className="whitespace-nowrap">Garantia 30 dias</span>
                </span>
                <span className="flex items-center gap-1">
                  <Infinity className="w-3 md:w-3.5 h-3 md:h-3.5 text-purple-500 flex-shrink-0" />
                  <span className="whitespace-nowrap">Uso ilimitado</span>
                </span>
              </div>
            </div>
          </div>

          {/* Lado Direito - Visual Desktop */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Cards de ferramentas sobrepostos */}
              <div className="absolute top-0 left-0 transform -rotate-3 z-10">
                <div className="bg-white rounded-xl shadow-xl p-3 border border-purple-100 w-44 xl:w-48">
                  <div className="flex items-center gap-2 mb-2">
                    <Image className="w-5 h-5 text-blue-500" />
                    <span className="text-xs font-bold">Aprimorador HD</span>
                  </div>
                  <div className="h-16 xl:h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg animate-pulse" />
                </div>
              </div>

              <div className="absolute top-14 right-0 transform rotate-2 z-20">
                <div className="bg-white rounded-xl shadow-xl p-3 border border-purple-100 w-44 xl:w-48">
                  <div className="flex items-center gap-2 mb-2">
                    <Mic className="w-5 h-5 text-green-500" />
                    <span className="text-xs font-bold">Gerador de Voz</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-10 xl:h-12 w-full bg-gradient-to-br from-green-100 to-green-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Card Central Principal */}
              <div className="relative z-30 mt-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-6 xl:p-8 text-white">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="p-4 xl:p-5 bg-white/20 backdrop-blur rounded-full">
                      <Wand2 className="w-12 xl:w-14 h-12 xl:h-14 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 animate-spin-slow">
                      <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full">
                        <Crown className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-lg xl:text-xl font-bold mb-1">Estúdio IA Ultra</p>
                    <p className="text-sm text-white/80">Todas as ferramentas premium</p>
                  </div>

                  {/* Mini grid de ícones */}
                  <div className="grid grid-cols-4 gap-2">
                    {[Image, Mic, FileText, Search, Scissors, Volume2, Video, Palette].map((Icon, i) => (
                      <div key={i} className="p-2 bg-white/10 backdrop-blur rounded-lg">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 text-center pt-2 border-t border-white/20">
                    <div>
                      <p className="text-xl font-bold">12+</p>
                      <p className="text-xs text-white/70">Ferramentas</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold">∞</p>
                      <p className="text-xs text-white/70">Usos/mês</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold">HD</p>
                      <p className="text-xs text-white/70">Qualidade</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card inferior */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-white rounded-xl shadow-xl p-3 border border-purple-100 w-44 xl:w-48">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="w-5 h-5 text-orange-500" />
                    <span className="text-xs font-bold">Finder Viral</span>
                  </div>
                  <div className="flex gap-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-gray-600">+500% alcance</span>
                  </div>
                </div>
              </div>

              {/* Decorações */}
              <Sparkles className="absolute -top-4 -right-4 w-5 xl:w-6 h-5 xl:h-6 text-yellow-400 animate-sparkle" />
              <Sparkles className="absolute -bottom-4 -left-4 w-4 xl:w-5 h-4 xl:h-5 text-pink-400 animate-sparkle animation-delay-1000" />
            </div>
          </div>

          {/* Visual Mobile */}
          <div className="lg:hidden flex justify-center">
            <div className="relative">
              <div className="p-4 md:p-5 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-xl">
                <Wand2 className="w-10 md:w-12 h-10 md:h-12 text-white" />
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

export default async function AIStudioPage() {
  const user = await currentUser();
  if (!user) return null;

  const subscription = await getUserSubscriptionPlan(user.id);
  const isAdmin = process.env.ADMIN_USER_IDS?.split(",").includes(user.id) || false;
  const hasAccess = subscription.plan === 'ultra' || isAdmin;

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Cabeçalho Compacto */}
      <div className="flex items-center gap-2 md:gap-3 px-3 sm:px-4 lg:px-0">
        <div className="p-2 md:p-2.5 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl shadow-md flex-shrink-0">
          <Wand2 className="w-5 md:w-6 h-5 md:h-6 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Estúdio IA
            </h1>
            {hasAccess && (
              <span className="inline-flex items-center px-2 md:px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow animate-pulse whitespace-nowrap">
                <Crown className="w-2.5 md:w-3 h-2.5 md:h-3 mr-0.5 md:mr-1" />
                {isAdmin ? 'ADMIN' : 'ULTRA'}
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-gray-600 mt-0.5 line-clamp-1">
            Suíte completa • <span className="font-semibold text-purple-600">12+ ferramentas de IA</span> • Uso ilimitado
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      {hasAccess ? (
        <div className="animate-fadeIn">
          <AIStudioClient />
        </div>
      ) : (
        <LockedPremiumFeature />
      )}
    </div>
  );
}