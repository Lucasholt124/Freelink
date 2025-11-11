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
      // Padrão para todos os user-agents
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Rotas internas/privadas
          '/dashboard',
          '/dashboard/*',
          '/api',
          '/api/*',
          // Build assets
          '/_next',
          '/_next/*',
          // Assets estáticos (normalmente não faz sentido indexar diretórios)
          '/static',
          '/static/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}


