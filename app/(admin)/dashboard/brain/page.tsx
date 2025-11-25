import { currentUser } from "@clerk/nextjs/server";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import {
  BrainCircuit,
  Sparkles,
  Zap,
  Star,
  Users,
  ArrowRight,
  Check,
  Rocket,
  Crown,
  FileVideo,
  Type,
  Layout,
  Award,
  Clock,
  Infinity,
  Brain
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FreelinnkBrainTool from "@/components/FreelinnkBrainTool";

function LockedBrainPage() {
  return (
    <div className="relative min-h-[600px] md:min-h-[700px] lg:h-[calc(100vh-200px)] overflow-hidden">
      {/* Background animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-violet-500/5 to-indigo-600/5 animate-pulse" />
      <div className="absolute -top-10 md:-top-20 -right-10 md:-right-20 w-40 h-40 md:w-72 md:h-72 bg-gradient-to-br from-purple-400/20 to-violet-400/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute -bottom-10 md:-bottom-20 -left-10 md:-left-20 w-40 h-40 md:w-72 md:h-72 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />

      <div className="relative flex items-center justify-center min-h-[600px] md:min-h-[700px] lg:h-full px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center max-w-7xl w-full">

          {/* Lado Esquerdo - Info e CTA */}
          <div className="text-center lg:text-left space-y-4 md:space-y-5 lg:space-y-6 px-2 sm:px-0">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-purple-100 to-violet-100 border border-purple-200 rounded-full">
              <Brain className="w-3 md:w-3.5 h-3 md:h-3.5 text-purple-600 animate-pulse flex-shrink-0" />
              <span className="text-[10px] md:text-xs font-semibold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent whitespace-nowrap">
                CONTEÚDO VIRAL EM SEGUNDOS
              </span>
            </div>

            {/* Título */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight">
              <span className="block text-gray-900 mb-1 md:mb-2">Ative o</span>
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Freelinnk Brain™
                </span>
                <Sparkles className="absolute -top-2 md:-top-4 -right-2 md:-right-4 w-4 md:w-6 h-4 md:h-6 text-yellow-400 animate-sparkle" />
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 px-2 sm:px-0">
              <span className="font-semibold text-gray-900">+5.000 criadores</span> já economizam{" "}
              <span className="text-purple-600 font-semibold">10h por semana</span> criando conteúdo viral com IA
            </p>

            {/* Features em Pills */}
            <div className="flex flex-wrap gap-2 md:gap-3 justify-center lg:justify-start max-w-lg mx-auto lg:mx-0">
              <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg shadow-sm border border-purple-200">
                <Type className="w-3 md:w-4 h-3 md:h-4 text-purple-500 flex-shrink-0" />
                <span className="text-[10px] md:text-xs font-medium text-purple-700 whitespace-nowrap">Títulos Virais</span>
              </div>
              <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg shadow-sm border border-purple-200">
                <FileVideo className="w-3 md:w-4 h-3 md:h-4 text-purple-500 flex-shrink-0" />
                <span className="text-[10px] md:text-xs font-medium text-purple-700 whitespace-nowrap">Roteiros Reels</span>
              </div>
              <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg shadow-sm border border-purple-200">
                <Layout className="w-3 md:w-4 h-3 md:h-4 text-purple-500 flex-shrink-0" />
                <span className="text-[10px] md:text-xs font-medium text-purple-700 whitespace-nowrap">Carrosséis</span>
              </div>
              <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg shadow-sm border border-purple-200">
                <Infinity className="w-3 md:w-4 h-3 md:h-4 text-purple-500 flex-shrink-0" />
                <span className="text-[10px] md:text-xs font-medium text-purple-700 whitespace-nowrap">Ilimitado</span>
              </div>
            </div>

            {/* Comparação Rápida */}
            <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-200 shadow-lg max-w-md mx-auto lg:mx-0">
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-300 rounded-full flex-shrink-0" />
                    <span className="text-xs md:text-sm text-gray-500">Plano Free</span>
                  </div>
                  <span className="text-[10px] md:text-xs text-gray-400 line-through whitespace-nowrap">Brain bloqueado</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0" />
                    <span className="text-xs md:text-sm font-medium text-blue-600">Plano Pro</span>
                  </div>
                  <span className="text-[10px] md:text-xs font-bold text-blue-600 whitespace-nowrap">Brain completo</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse flex-shrink-0" />
                    <span className="text-xs md:text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Plano Ultra</span>
                  </div>
                  <span className="text-[10px] md:text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent whitespace-nowrap">Brain + Estúdio IA</span>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-purple-400 to-violet-400 border-2 border-white flex items-center justify-center shadow-sm">
                    <Users className="w-2.5 md:w-3 h-2.5 md:h-3 text-white" />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-0.5 md:gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 md:w-3.5 h-3 md:h-3.5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-[10px] md:text-xs text-gray-600 ml-1">4.8/5 (1.523)</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center lg:justify-start pt-2">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 h-11 md:h-12"
              >
                <Link href="/dashboard/billing" className="flex items-center justify-center gap-2 px-6 md:px-8">
                  <Rocket className="w-4 md:w-5 h-4 md:h-5 group-hover:rotate-12 transition-transform flex-shrink-0" />
                  <span className="font-bold text-sm md:text-base">Ativar Pro</span>
                  <ArrowRight className="w-4 md:w-5 h-4 md:h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto group border-purple-200 hover:bg-purple-50 rounded-xl h-11 md:h-12"
              >
                <Link href="/dashboard/billing" className="flex items-center justify-center gap-2 px-6 md:px-8">
                  <Crown className="w-4 md:w-5 h-4 md:h-5 text-purple-600 flex-shrink-0" />
                  <span className="font-bold text-purple-600 text-sm md:text-base">Ver Ultra</span>
                </Link>
              </Button>
            </div>

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
                <Clock className="w-3 md:w-3.5 h-3 md:h-3.5 text-purple-500 flex-shrink-0" />
                <span className="whitespace-nowrap">Ative em 1 min</span>
              </span>
            </div>
          </div>

          {/* Lado Direito - Visual Desktop */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Cards representando o conteúdo gerado */}
              <div className="absolute top-0 left-0 transform -rotate-6 translate-x-8">
                <div className="bg-white rounded-xl shadow-xl p-4 border border-purple-100 w-52 xl:w-56">
                  <Type className="w-5 h-5 text-purple-500 mb-2" />
                  <p className="text-xs font-bold text-gray-900">10 Títulos Virais</p>
                  <p className="text-xs text-gray-500">Em 3 segundos</p>
                </div>
              </div>

              <div className="absolute top-16 right-0 transform rotate-3">
                <div className="bg-white rounded-xl shadow-xl p-4 border border-purple-100 w-52 xl:w-56">
                  <FileVideo className="w-5 h-5 text-blue-500 mb-2" />
                  <p className="text-xs font-bold text-gray-900">Roteiro Completo</p>
                  <p className="text-xs text-gray-500">Pronto pra gravar</p>
                </div>
              </div>

              {/* Card Central - Brain */}
              <div className="relative z-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl shadow-2xl p-6 xl:p-8 text-white">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="p-5 xl:p-6 bg-white/20 backdrop-blur rounded-full">
                      <BrainCircuit className="w-14 xl:w-16 h-14 xl:h-16 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 animate-spin-slow">
                      <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-lg xl:text-xl font-bold mb-1">Freelinnk Brain™</p>
                    <p className="text-sm text-white/80">IA treinada para viralizar</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 w-full pt-4 border-t border-white/20">
                    <div className="text-center">
                      <p className="text-2xl font-bold">50+</p>
                      <p className="text-xs text-white/70">Templates</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">∞</p>
                      <p className="text-xs text-white/70">Gerações</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">3s</p>
                      <p className="text-xs text-white/70">Resposta</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card inferior */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-white rounded-xl shadow-xl p-4 border border-purple-100 w-52 xl:w-56">
                  <Layout className="w-5 h-5 text-green-500 mb-2" />
                  <p className="text-xs font-bold text-gray-900">Carrossel Pronto</p>
                  <p className="text-xs text-gray-500">10 slides otimizados</p>
                </div>
              </div>

              {/* Decorações */}
              <Sparkles className="absolute -top-4 -right-4 w-5 xl:w-6 h-5 xl:h-6 text-yellow-400 animate-sparkle" />
              <Sparkles className="absolute -bottom-4 -left-4 w-4 xl:w-5 h-4 xl:h-5 text-purple-400 animate-sparkle animation-delay-1000" />
            </div>
          </div>

          {/* Visual Mobile */}
          <div className="lg:hidden flex justify-center">
            <div className="relative">
              <div className="p-4 md:p-5 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl shadow-xl">
                <BrainCircuit className="w-10 md:w-12 h-10 md:h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 p-1.5 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full">
                <Zap className="w-3 md:w-4 h-3 md:h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function BrainPage() {
  const user = await currentUser();
  if (!user) return null;

  const subscription = await getUserSubscriptionPlan(user.id);

  if (subscription.plan !== "pro" && subscription.plan !== "ultra") {
    return <LockedBrainPage />;
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Cabeçalho Compacto */}
      <div className="flex items-center gap-2 md:gap-3 px-3 sm:px-4 lg:px-0">
        <div className="p-2 md:p-2.5 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl shadow-md flex-shrink-0">
          <BrainCircuit className="w-5 md:w-6 h-5 md:h-6 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Freelinnk Brain™
            </h1>
            <span className="inline-flex items-center px-2 md:px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-bold bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow animate-pulse whitespace-nowrap">
              {subscription.plan === 'ultra' ? (
                <>
                  <Crown className="w-2.5 md:w-3 h-2.5 md:h-3 mr-0.5 md:mr-1" />
                  ULTRA
                </>
              ) : (
                <>
                  <Zap className="w-2.5 md:w-3 h-2.5 md:h-3 mr-0.5 md:mr-1" />
                  PRO
                </>
              )}
            </span>
          </div>
          <p className="text-xs md:text-sm text-gray-600 mt-0.5 line-clamp-1">
            Sua fábrica de conteúdo viral • <span className="font-semibold text-purple-600">Fale um tema, criamos o resto</span>
          </p>
        </div>
      </div>

      {/* Ferramenta */}
      <div className="animate-fadeIn">
        <FreelinnkBrainTool userPlan={subscription.plan} />
      </div>
    </div>
  );
}