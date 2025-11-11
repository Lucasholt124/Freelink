import type { MetadataRoute } from 'next'

/**
 * Gera a URL base a partir das envs conhecidas:
 * - NEXT_PUBLIC_APP_URL (recomendado)
 * - VERCEL_URL (fallback em ambientes Vercel)
 * - localhost (fallback em dev)
 */
function getBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (explicit) return explicit.replace(/\/+$/, '')

  const vercelUrl = process.env.VERCEL_URL?.trim()
  if (vercelUrl) return `https://${vercelUrl.replace(/\/+$/, '')}`

  return 'http://localhost:3000'
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl()
  const now = new Date()

  // Inclua apenas rotas públicas canônicas. Evite rotas autenticadas/admin.
  // Mantemos uma lista mínima e segura, já que não temos o inventário completo de páginas públicas.
  const publicRoutes: Array<MetadataRoute.Sitemap[number]> = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  return publicRoutes
}


