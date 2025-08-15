"use client";

import { Suspense } from "react";

import UsernameForm from "@/components/UsernameForm";
import CustomizationForm from "@/components/CustomizationForm";
import { InstagramConnection } from "@/components/InstagramConnection";

// Skeleton para fallback do Suspense
function ConnectionSectionSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl border shadow-lg animate-pulse">
      <div className="h-8 w-3/4 bg-gray-200 rounded-md mb-3"></div>
      <div className="h-5 w-1/2 bg-gray-200 rounded-md"></div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-8 sm:space-y-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Cabeçalho */}
      <header>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
          Configurações
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mt-2 max-w-3xl">
          Gerencie suas conexões, URL e a aparência da sua página pública.
        </p>
      </header>

      {/* Seção de Conexões de API */}
      <section
        aria-labelledby="connections-title"
        className="flex flex-col lg:flex-row gap-4 sm:gap-8 lg:gap-12"
      >
        <aside className="lg:w-1/3">
          <h2
            id="connections-title"
            className="text-xl font-semibold text-gray-800"
          >
            Conexões de Apps
          </h2>
          <p className="text-gray-500 mt-1 text-sm sm:text-base max-w-md">
            Conecte suas contas para habilitar funcionalidades de IA.
          </p>
        </aside>
        <div className="flex-1">
          <Suspense fallback={<ConnectionSectionSkeleton />}>
            <InstagramConnection />
          </Suspense>
        </div>
      </section>

      <hr className="border-gray-200/80 my-8" />

      {/* Seção de URL Personalizada */}
      <section
        aria-labelledby="custom-url-title"
        className="flex flex-col lg:flex-row gap-4 sm:gap-8 lg:gap-12"
      >
        <aside className="lg:w-1/3">
          <h2
            id="custom-url-title"
            className="text-xl font-semibold text-gray-800"
          >
            URL Personalizada
          </h2>
          <p className="text-gray-500 mt-1 text-sm sm:text-base max-w-md">
            Defina um nome de usuário único para sua página Freelinnk.
          </p>
        </aside>
        <div className="flex-1 bg-white p-6 sm:p-8 rounded-2xl border shadow-lg">
          <UsernameForm />
        </div>
      </section>

      <hr className="border-gray-200/80 my-8" />

      {/* Seção de Aparência da Página */}
      <section
        aria-labelledby="appearance-title"
        className="flex flex-col lg:flex-row gap-4 sm:gap-8 lg:gap-12"
      >
        <aside className="lg:w-1/3">
          <h2
            id="appearance-title"
            className="text-xl font-semibold text-gray-800"
          >
            Aparência da Página
          </h2>
          <p className="text-gray-500 mt-1 text-sm sm:text-base max-w-md">
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