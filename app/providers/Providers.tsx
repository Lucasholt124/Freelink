// app/providers/Providers.tsx
"use client";

import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations"; // Importação para a localização em português
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/dashboard"
      localization={ptBR} // Use o objeto de localização pré-definido, é mais completo
      appearance={{
        variables: {
          colorPrimary: "#6366f1", // Cor primária (índigo, para combinar com o gradiente)
          colorText: "#1f2937", // Cinza escuro para o texto
        },
        elements: {
          formButtonPrimary: "bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90",
          card: "shadow-2xl border-gray-200/80",
        }
      }}
    >
      <ConvexClientProvider>{children}</ConvexClientProvider>
      <Toaster richColors position="top-center" />
    </ClerkProvider>
  );
}