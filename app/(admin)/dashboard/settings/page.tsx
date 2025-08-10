// Em app/dashboard/settings/page.tsx
// (Substitua o arquivo inteiro)

import { currentUser } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

import UsernameForm from "@/components/UsernameForm";
import CustomizationForm from "@/components/CustomizationForm";
import { InstagramConnection } from "@/components/InstagramConnection";

export default async function SettingsPage() {
  const user = await currentUser();
  if (!user) return null;

  // Busca a conexão com o Instagram no backend do Convex
  const instagramConnection = await fetchQuery(api.connections.get, { provider: "instagram" });

  return (
    // Container principal com espaçamento vertical
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Cabeçalho Geral da Página */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">Configurações</h1>
        <p className="text-lg text-gray-600 mt-2">
          Gerencie suas conexões, URL e a aparência da sua página pública.
        </p>
      </div>

      {/* --- Seção de Conexões de API --- */}
      {/* Layout responsivo: empilhado no mobile, colunas no desktop */}
      <section className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <aside className="lg:w-1/3">
          <h2 className="text-xl font-semibold text-gray-800">Conexões de Apps</h2>
          <p className="text-gray-500 mt-1">
            Conecte suas contas para habilitar funcionalidades de IA.
          </p>
        </aside>
        <div className="flex-1 bg-white p-6 rounded-2xl border shadow-lg">
          <InstagramConnection connection={instagramConnection} />
        </div>
      </section>

      <div className="w-full h-px bg-gray-200/80"></div>

      {/* --- Seção de URL Personalizada --- */}
      <section className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <aside className="lg:w-1/3">
          <h2 className="text-xl font-semibold text-gray-800">URL Personalizada</h2>
          <p className="text-gray-500 mt-1">
            Defina um nome de usuário único para sua página Freelinnk.
          </p>
        </aside>
        <div className="flex-1 bg-white p-8 rounded-2xl border shadow-lg">
          <UsernameForm />
        </div>
      </section>

      <div className="w-full h-px bg-gray-200/80"></div>

      {/* --- Seção de Aparência da Página --- */}
      <section className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <aside className="lg:w-1/3">
          <h2 className="text-xl font-semibold text-gray-800">Aparência da Página</h2>
          <p className="text-gray-500 mt-1">
            Adicione sua foto, descrição e a cor da sua marca.
          </p>
        </aside>
        <div className="flex-1 bg-white p-8 rounded-2xl border shadow-lg">
          <CustomizationForm />
        </div>
      </section>
    </div>
  );
}