// Em /app/providers/Providers.tsx
// (Substitua o arquivo inteiro)

"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ptBR } from "@clerk/localizations";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: ReactNode }) {
  return (
    // =======================================================
    // A FONTE DA VERDADE ESTÁ AQUI
    // =======================================================
    // 1. O ÚNICO ClerkProvider, com a configuração de redirecionamento.
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      localization={ptBR}
      // Caminhos relativos para funcionar em todos os ambientes
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      appearance={{
        variables: { colorPrimary: "#6366f1" },
        elements: { formButtonPrimary: "bg-gradient-to-r from-blue-500 to-purple-600" },
      }}
    >
      {/* 2. O ConvexProvider vive DENTRO do ClerkProvider. */}
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}