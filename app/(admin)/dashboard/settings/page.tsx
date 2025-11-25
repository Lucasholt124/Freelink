"use client";

import UsernameForm from "@/components/UsernameForm";
import CustomizationForm from "@/components/CustomizationForm";
import {
  Settings,

  Sparkles,
  Shield,

  Check,
  Rocket,

} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 selection:bg-purple-100 selection:text-purple-900">

      {/* Background Decorativo "Aurora" - Otimizado para performance */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] bg-purple-200/20 rounded-full blur-[100px] mix-blend-multiply animate-blob" />
        <div className="absolute top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-pink-200/20 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-2000" />
        <div className="absolute -bottom-[20%] left-[20%] w-[70vw] h-[70vw] bg-indigo-200/20 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 space-y-8 sm:space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Header Premium */}
        <header className="relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg shadow-purple-200">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
                  Configurações
                </h1>
              </div>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl leading-relaxed">
                Transforme seu link em uma experiência. Personalize cada detalhe e deixe com a <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">sua identidade única</span>.
              </p>
            </div>
          </div>

          {/* Barra de Progresso Gamificada */}
          <div className="mt-8 bg-white/60 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-white/50 ring-1 ring-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Nível do Perfil
              </span>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Passo 1 de 2</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full w-1/2 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full animate-gradient-x" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Complete as etapas para liberar recursos <span className="font-semibold text-purple-600">virais</span>.
            </p>
          </div>
        </header>

        {/* === SEÇÃO 1: URL === */}
        <section className="relative scroll-mt-20" id="username">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">

            {/* Sidebar Info */}
            <aside className="lg:w-1/3 space-y-6">
              <div className="sticky top-24">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">1</span>
                  <h2 className="text-2xl font-bold text-gray-800">Sua Identidade</h2>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    Escolha um nome curto. É assim que seus seguidores vão te encontrar.
                  </p>

                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/60 shadow-sm">
                    <p className="text-xs font-bold text-blue-600 mb-3 tracking-wide uppercase">Vantagens</p>
                    <ul className="space-y-2.5">
                      {[
                        "Link curto e profissional",
                        "Melhor rankeamento no Google",
                        "Fácil de memorizar"
                      ].map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
                          <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </aside>

            {/* Form Container */}
            <div className="flex-1">
              <div className="relative bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden group hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 bg-[length:200%_auto] animate-gradient-x" />

                <div className="p-6 sm:p-8 lg:p-10">
                  <div className="flex items-center gap-2 mb-6 text-green-600 bg-green-50 w-fit px-3 py-1 rounded-full text-xs font-medium">
                    <Shield className="w-3.5 h-3.5" />
                    Alteração Segura
                  </div>

                  <UsernameForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200/60" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-50 px-4 text-gray-400">
              <Sparkles className="w-5 h-5" />
            </span>
          </div>
        </div>

        {/* === SEÇÃO 2: APARÊNCIA === */}
        <section className="relative scroll-mt-20" id="appearance">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">

            {/* Sidebar Info */}
            <aside className="lg:w-1/3 space-y-6">
              <div className="sticky top-24">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-sm">2</span>
                  <h2 className="text-2xl font-bold text-gray-800">Estilo Visual</h2>
                </div>

                <p className="text-gray-600 leading-relaxed">
                  Crie uma página que prenda a atenção. Use fotos, cores e efeitos para se destacar da multidão.
                </p>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Rocket className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-purple-700 uppercase">Dica Pro</span>
                  </div>
                  <p className="text-sm text-purple-900/80 italic">
                    Páginas com foto de fundo desfocada aumentam a retenção em até 40%.
                  </p>
                </div>
              </div>
            </aside>

            {/* Customization Form (Com o iPhone Mockup) */}
            <div className="flex-1">
              <div className="relative bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden group hover:shadow-2xl hover:shadow-purple-900/5 transition-all duration-500">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-[length:200%_auto] animate-gradient-x" />

                <div className="p-6 sm:p-8 lg:p-10">
                  <CustomizationForm />
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}