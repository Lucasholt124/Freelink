import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* opções de configuração aqui */
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
    ],
  },
  serverExternalPackages: ["@node-rs/argon2"],

  // Adicione estas configurações para Vercel
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },

  // Otimizações adicionais
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
};

export default nextConfig;