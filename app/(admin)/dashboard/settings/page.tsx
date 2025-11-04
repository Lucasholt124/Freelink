"use client";

import UsernameForm from "@/components/UsernameForm";
import CustomizationForm from "@/components/CustomizationForm";
import {
  Settings,
  Link2,
  Palette,
  Sparkles,
  Shield,
  Zap,

  ChevronRight,

  Rocket,
  Eye,
  Check,

} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-pink-50/20">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative space-y-6 sm:space-y-8 lg:space-y-12 max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">

        {/* Header Premium */}
        <header className="relative">
          {/* Título Principal */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl shadow-xl">
                  <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
                  Configurações
                </h1>
              </div>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl">
                Personalize sua página e deixe ela com a <span className="font-semibold text-purple-600">sua cara</span>
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Configure seu perfil</span>
              <span className="text-sm font-bold text-purple-600">Passo 1 de 2</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Complete as duas etapas para <span className="font-semibold text-purple-600">ativar sua página</span>
            </p>
          </div>
        </header>

        {/* Seção de URL Personalizada */}
        <section className="relative">
          {/* Indicador de Importância */}
          <div className="absolute -top-3 right-4 z-10">
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-full shadow-lg">
              <Zap className="w-3 h-3" />
              <span>ETAPA 1</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
            {/* Sidebar Info */}
            <aside className="lg:w-1/3 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                  <Link2 className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  URL Personalizada
                </h2>
              </div>

              <p className="text-sm sm:text-base text-gray-600">
                Escolha um nome único e <span className="font-semibold text-purple-600">memorável</span> para sua página.
              </p>

              {/* Benefits List */}
              <div className="space-y-2 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <p className="text-xs font-semibold text-purple-700 mb-2">POR QUE É IMPORTANTE:</p>
                {[
                  "URL curta e profissional",
                  "Fácil de compartilhar",
                  "Melhor para SEO",
                  "Aumenta credibilidade"
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Tips Card - Desktop */}
              <div className="hidden lg:block p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-yellow-800 mb-1">DICA:</p>
                    <p className="text-xs text-yellow-700">
                      Use seu @instagram ou nome da marca para facilitar a memorização!
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Form Card */}
            <div className="flex-1">
              <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Gradient Border Top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500" />

                <div className="p-6 sm:p-8">
                  {/* Security Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-gray-600">Alteração segura e instantânea</span>
                    </div>
                  </div>

                  <UsernameForm />

                  {/* Example URL Preview */}
                  <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Sua URL ficará assim:</p>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 bg-white rounded-lg border border-gray-300 shadow-sm">
                        <code className="text-sm font-mono text-purple-600">
                          freelinnk.com/seunome
                        </code>
                      </div>
                      <Check className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Tips */}
          <div className="lg:hidden mt-4 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-yellow-800 mb-1">DICA:</p>
                <p className="text-xs text-yellow-700">
                  Use seu @instagram ou nome da marca para facilitar a memorização!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Divider com Decoração */}
        <div className="relative">
          <hr className="border-gray-200/50" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-1 rounded-full">
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
        </div>

        {/* Seção de Aparência */}
        <section className="relative">
          {/* Badge de Etapa */}
          <div className="absolute -top-3 right-4 z-10">
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
              <Palette className="w-3 h-3" />
              <span>ETAPA 2</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
            {/* Sidebar Info */}
            <aside className="lg:w-1/3 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                  <Palette className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  Aparência da Página
                </h2>
              </div>

              <p className="text-sm sm:text-base text-gray-600">
                Crie uma página <span className="font-semibold text-purple-600">única e profissional</span> que represente você.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: "🎨", label: "Cores da marca" },
                  { icon: "📸", label: "Foto de perfil" },
                  { icon: "✍️", label: "Bio personalizada" },
                  { icon: "🖼️", label: "Fundo customizado" }
                ].map((feature, i) => (
                  <div key={i} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-xl mb-1">{feature.icon}</div>
                    <p className="text-xs text-gray-700">{feature.label}</p>
                  </div>
                ))}
              </div>

              {/* Importance Card */}
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2 mb-3">
                  <Rocket className="w-4 h-4 text-indigo-600" />
                  <p className="text-xs font-semibold text-indigo-700">POR QUE PERSONALIZAR</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-700">Páginas com foto convertem mais</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-700">Cores consistentes geram confiança</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-700">Bio completa aumenta cliques</p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Form Card */}
            <div className="flex-1">
              <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Gradient Border Top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500" />

                <div className="p-6 sm:p-8">
                  {/* Live Preview Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-gray-600">Salva automaticamente</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">Preview em tempo real</span>
                    </div>
                  </div>

                  <CustomizationForm />

                  {/* Quick Actions */}
                  <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <p className="text-xs font-semibold text-purple-700 mb-3">AÇÕES RÁPIDAS:</p>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-3 py-1.5 text-xs bg-white rounded-lg border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all">
                        Resetar cores
                      </button>
                      <button className="px-3 py-1.5 text-xs bg-white rounded-lg border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all">
                        Remover fundo
                      </button>
                      <button className="px-3 py-1.5 text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-md transition-all">
                        Ver página
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Success Message - Aparece quando tudo estiver configurado */}
        <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">Tudo pronto!</p>
              <p className="text-xs text-green-600 mt-0.5">
                Suas configurações estão salvas. Sua página está no ar!
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
}