import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ MOVIDO de experimental para raiz
  serverExternalPackages: ['@prisma/client', 'prisma'],

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
        hostname: "**", // Permite qualquer domínio
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Otimizações
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: false,
  },

  reactStrictMode: true,

  // ✅ Experimental features válidas
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