import type { MetadataRoute } from 'next'

function getBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (explicit) return explicit.replace(/\/+$/, '')

  const vercelUrl = process.env.VERCEL_URL?.trim()
  if (vercelUrl) return `https://${vercelUrl.replace(/\/+$/, '')}`

  return 'http://localhost:3000'
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl()

  return {
    rules: [
      // 🤖 Bots principais (Google, Bing, etc)
      {
        userAgent: '*',
        allow: [
          '/',
          '/pricing',
          // '/features',
          // '/about',
          // '/contact',
        ],
        disallow: [
          // 🔒 Área autenticada - BLOQUEIO TOTAL
          '/dashboard',
          '/dashboard/*',

          // 🔐 Autenticação
          '/sign-in',
          '/sign-in/*',
          '/sign-up',
          '/sign-up/*',
          '/auth/*',

          // 🔧 APIs e sistema
          '/api',
          '/api/*',
          '/_next',
          '/_next/*',
          '/_vercel',
          '/_vercel/*',

          // 🗂️ Assets (opcional)
          '/static',
          '/static/*',
        ],
      },

      // 🎯 Googlebot específico (permite indexar assets importantes)
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/pricing',
          '/*.css',
          '/*.js',
          '/*.png',
          '/*.jpg',
          '/*.svg',
        ],
        disallow: [
          '/dashboard',
          '/dashboard/*',
          '/api',
          '/api/*',
        ],
      },

      // 🖼️ Googlebot para imagens
      {
        userAgent: 'Googlebot-Image',
        allow: ['/*'],
        disallow: ['/dashboard/*'],
      },

      // 🚫 Bloqueio de bots ruins/scrapers
      {
        userAgent: [
          'AhrefsBot',
          'SemrushBot',
          'DotBot',
          'MJ12bot',
          'BLEXBot',
          'DataForSeoBot',
        ],
        disallow: ['/'],
      },
    ],

    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}