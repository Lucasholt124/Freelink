import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Evita redirects desnecessários em rotas de API
  skipTrailingSlashRedirect: true,

  // ✅ Pacotes do servidor (Prisma)
  serverExternalPackages: ['@prisma/client', 'prisma'],

  // ✅ Configuração de Imagens (Mantendo suas permissões originais)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "original-armadillo-999.convex.cloud", // Seu Convex
      },
      {
        protocol: "https",
        hostname: "api.qrserver.com",
      },
      {
        protocol: "https",
        hostname: "**", // Permite imagens externas (ex: Google, Facebook)
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 👇 A MÁGICA HÍBRIDA (Suporta Link Limpo E Link Antigo)
  async rewrites() {
return [
      {
        // Adicionei "r" na lista de exceções (?!u|r|api...)
        // Isso impede que o encurtador (/r/...) seja enviado para a pasta de usuários (/u/)
        source: '/:username((?!u|r|api|_next|static|public|dashboard|login|sign-in|sign-up|favicon.ico|.*\\..*).*)',
        destination: '/u/:username',
      },
    ];
  },

  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  typescript: {
    ignoreBuildErrors: false, // Mantendo padrão seguro
  },

  eslint: {
    ignoreDuringBuilds: false, // Mantendo padrão seguro
  },

  reactStrictMode: true,

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@clerk/nextjs",
      "react-icons",
    ],
  },
};

export default nextConfig;