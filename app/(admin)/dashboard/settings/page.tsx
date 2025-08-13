// Em /app/dashboard/settings/page.tsx
// (Substitua o arquivo inteiro)

"use client";

import { Suspense } from 'react';

import UsernameForm from "@/components/UsernameForm";
import CustomizationForm from "@/components/CustomizationForm";
import { InstagramConnection } from "@/components/InstagramConnection";

// Componente de Skeleton para o fallback do Suspense
function ConnectionSectionSkeleton() {
    return (
        <div className="bg-white p-6 rounded-2xl border shadow-lg animate-pulse">
            <div className="h-8 w-3/4 bg-gray-200 rounded-md"></div>
            <div className="h-5 w-1/2 bg-gray-200 rounded-md mt-2"></div>
        </div>
    );
}

export default function SettingsPage() {
  return (
    // =======================================================
    // CORREÇÃO DE RESPONSIVIDADE APLICADA AQUI
    // =======================================================
    // `space-y-8 sm:space-y-12` -> Espaçamento menor no mobile
    <div className="space-y-8 sm:space-y-12">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
          Configurações
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mt-2">
          Gerencie suas conexões, URL e a aparência da sua página pública.
        </p>
      </div>

      {/* --- Seção de Conexões de API --- */}
      {/* `gap-4 sm:gap-8` -> Espaçamento menor entre a descrição e o card no mobile */}
      <section className="flex flex-col lg:flex-row gap-4 sm:gap-8 lg:gap-12">
        <aside className="lg:w-1/3">
          <h2 className="text-xl font-semibold text-gray-800">Conexões de Apps</h2>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Conecte suas contas para habilitar funcionalidades de IA.
          </p>
        </aside>
        <div className="flex-1">
          <Suspense fallback={<ConnectionSectionSkeleton />}>
            <InstagramConnection />
          </Suspense>
        </div>
      </section>

      <div className="w-full h-px bg-gray-200/80"></div>

      {/* --- Seção de URL Personalizada --- */}
      <section className="flex flex-col lg:flex-row gap-4 sm:gap-8 lg:gap-12">
        <aside className="lg:w-1/3">
          <h2 className="text-xl font-semibold text-gray-800">URL Personalizada</h2>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Defina um nome de usuário único para sua página Freelinnk.
          </p>
        </aside>
        {/* `p-6 sm:p-8` -> Padding menor no mobile */}
        <div className="flex-1 bg-white p-6 sm:p-8 rounded-2xl border shadow-lg">
          <UsernameForm />
        </div>
      </section>

      <div className="w-full h-px bg-gray-200/80"></div>

      {/* --- Seção de Aparência da Página --- */}
      <section className="flex flex-col lg:flex-row gap-4 sm:gap-8 lg:gap-12">
        <aside className="lg:w-1/3">
          <h2 className="text-xl font-semibold text-gray-800">Aparência da Página</h2>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Adicione sua foto, descrição e a cor da sua marca.
          </p>
        </aside>
        <div className="flex-1 bg-white p-6 sm:p-8 rounded-2xl border shadow-lg">
          <CustomizationForm />
        </div>
      </section>
    </div>
  );
}