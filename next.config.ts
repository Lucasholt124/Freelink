/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desabilita source maps em produção para evitar requisições desnecessárias
  productionBrowserSourceMaps: false,

  // Configuração de imagens
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

  // Configurações adicionais para melhor performance
  poweredByHeader: false,
  compress: true,

  // Ignora erros de build relacionados a ESLint em produção
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;