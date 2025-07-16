import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Freelink - Sua página de links personalizada",
  description: "Crie uma página de links bonita e funcional com o Freelink",
  icons: {
    icon: "/convex.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider

          localization={{
            locale: "pt-BR",
            signIn: {
              start: {
                title: "Entrar na sua conta",
                subtitle: "Use o método de login preferido abaixo.",
              },
            },
            signUp: {
              start: {
                title: "Criar conta",
                subtitle: "Preencha os dados para continuar.",
              },
            },
            formFieldLabel__emailAddress: "E-mail",
            formFieldLabel__password: "Senha",
            formFieldLabel__confirmPassword: "Confirmar senha",
            formButtonPrimary: "Continuar",
            socialButtonsBlockButton: "Entrar com {{provider|titleize}}",
          }}
        >
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>

        <Toaster />
      </body>
    </html>
  );
}
