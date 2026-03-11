import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Providers } from "@/app/providers/Providers";
import { Toaster } from "@/components/ui/sonner";
import { getBaseUrl } from "@/convex/lib/getBaseUrl";
import clsx from "clsx";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: "Freelinnk - A Máquina de Vendas e Tráfego para o seu Link na Bio",
    template: "%s | Freelinnk",
  },
  description:
    "Transforme seu link na bio em uma máquina de conversão. Receba tráfego automático da nossa rede de anúncios, gerencie suas vendas com CRM integrado e conecte seu Pixel do Facebook. Mais barato e inteligente que ferramentas comuns de botões.",
  keywords: [
    "link na bio",
    "freelinnk",
    "linktree alternativa",
    "rede de anúncios",
    "gerar tráfego grátis",
    "crm para instagram",
    "calculadora de lucros",
    "pixel do facebook no link",
    "vender mais no instagram",
    "lojistas e afiliados",
  ],
  authors: [{ name: "Freelinnk", url: getBaseUrl() }],
  creator: "Freelinnk",
  publisher: "Freelinnk",
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: getBaseUrl(),
    siteName: "Freelinnk",
    title: "Freelinnk - O Link na Bio que Vende e Atrai Tráfego",
    description:
      "Pare de perder clientes. Use o Freelinnk para exibir seus produtos na nossa rede de anúncios, gerenciar lucros e instalar seu Pixel.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Freelinnk - A Máquina de Vendas para o seu Perfil",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Freelinnk - A Máquina de Vendas para sua Bio",
    description:
      "Tráfego Automático, CRM Financeiro e Rastreamento. O Link na Bio dos profissionais.",
    images: ["/twitter-image.png"],
  },
  applicationName: "Freelinnk",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Freelinnk",
  },
  category: "Business",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Freelinnk',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: [
    {
      '@type': 'Offer',
      name: 'Plano Free',
      price: '0',
      priceCurrency: 'BRL',
    },
    {
      '@type': 'Offer',
      name: 'Plano Pro',
      price: '34.90',
      priceCurrency: 'BRL',
    },
    {
      '@type': 'Offer',
      name: 'Plano Ultra',
      price: '77.90',
      priceCurrency: 'BRL',
    },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '2847',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5238589195477270"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={clsx(
          "antialiased bg-gray-50 text-gray-800 dark:bg-slate-900 dark:text-slate-200 flex flex-col min-h-screen overflow-x-hidden",
          `${GeistSans.variable} ${GeistMono.variable}`
        )}
        style={{ minHeight: "100dvh" }}
      >
        {/* ✅ INÍCIO: Meta Pixel Code */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '719697624058334');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=719697624058334&ev=PageView&noscript=1"
            alt="facebook pixel"
          />
        </noscript>
        {/* ✅ FIM: Meta Pixel Code */}

        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}