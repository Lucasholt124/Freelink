// Em app/layout.tsx

import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from "@/app/providers/Providers";
import { getBaseUrl } from "@/convex/lib/getBaseUrl";


export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: "Freelinnk - Sua página de links com analytics avançado",
    template: "%s | Freelinnk",
  },
  description: "Crie uma página de links na bio com analytics, personalização total e suporte em português. A alternativa ao Linktree feita para o mercado brasileiro.",

  // --- CORREÇÃO FINAL E DEFINITIVA PARA OS ÍCONES ---
  // Apontamos diretamente para os arquivos físicos na pasta /public
  icons: {
    icon: "/favicon.svg", // <-- Aponta para o novo SVG
    apple: "/apple-touch-icon.svg", // <-- Aponta para o novo SVG para Apple
  },

  openGraph: {
    title: "Freelinnk - Sua página de links com analytics avançado",
    description: "Crie sua página de links na bio com analytics, personalização total e suporte humano.",
    url: getBaseUrl(),
    siteName: "Freelinnk",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Freelinnk - Sua Página de Links Inteligente" }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Freelinnk - Sua página de links com analytics avançado",
    description: "Crie sua página de links na bio com analytics, personalização total e suporte humano.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased bg-gray-50 text-gray-800">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}