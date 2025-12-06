import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Evita redirects desnecessários em rotas de API
  skipTrailingSlashRedirect: true,

  // ✅ Pacotes do servidor (Prisma)
  serverExternalPackages: ['@prisma/client', 'prisma'],

  // ✅ Configuração de Imagens
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "original-armadillo-999.convex.cloud",
      },
      {
        protocol: "https",
        hostname: "api.qrserver.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 👇 AQUI ESTAVA O ERRO!
  async rewrites() {
    return [
      {
        // ADICIONEI "giveaway" NA LISTA ABAIXO (veja o |giveaway|)
        // Isso diz ao Next: "Não trate a rota /giveaway como um nome de usuário"
        source: '/:username((?!u|r|api|_next|static|public|dashboard|login|sign-in|sign-up|favicon.ico|giveaway|.*\\..*).*)',
        destination: '/u/:username',
      },
    ];
  },

  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  typescript: {
    ignoreBuildErrors: false,
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