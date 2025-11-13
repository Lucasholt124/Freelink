import type { MetadataRoute } from 'next'

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

  // ✅ APENAS páginas públicas que você TEM
  const publicRoutes: Array<MetadataRoute.Sitemap[number]> = [
    // 🏠 Homepage - Máxima prioridade
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },

    // 💰 Pricing - Alta prioridade (conversão)
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },

    // 📝 Páginas institucionais (adicione SOMENTE se existirem)
    // Descomente conforme você criar essas páginas:

    // {
    //   url: `${baseUrl}/features`,
    //   lastModified: now,
    //   changeFrequency: 'weekly',
    //   priority: 0.8,
    // },
    // {
    //   url: `${baseUrl}/about`,
    //   lastModified: now,
    //   changeFrequency: 'monthly',
    //   priority: 0.6,
    // },
    // {
    //   url: `${baseUrl}/contact`,
    //   lastModified: now,
    //   changeFrequency: 'monthly',
    //   priority: 0.6,
    // },
    // {
    //   url: `${baseUrl}/privacy`,
    //   lastModified: now,
    //   changeFrequency: 'yearly',
    //   priority: 0.3,
    // },
    // {
    //   url: `${baseUrl}/terms`,
    //   lastModified: now,
    //   changeFrequency: 'yearly',
    //   priority: 0.3,
    // },
  ]

  return publicRoutes
}