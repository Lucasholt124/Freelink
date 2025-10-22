"use client";

import UsernameForm from "@/components/UsernameForm";
import CustomizationForm from "@/components/CustomizationForm";

export default function SettingsPage() {
  return (
    <div className="space-y-8 sm:space-y-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Cabeçalho */}
      <header>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
          Configurações
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mt-2 max-w-3xl">
          Gerencie sua URL e a aparência da sua página pública.
        </p>
      </header>

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
            Adicione sua foto, descrição, cor da marca e fundo personalizado.
          </p>
        </aside>
        <div className="flex-1 bg-white p-6 sm:p-8 rounded-2xl border shadow-lg">
          <CustomizationForm />
        </div>
      </section>
    </div>
  );
}