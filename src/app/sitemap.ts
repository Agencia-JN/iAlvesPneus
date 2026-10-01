import type { MetadataRoute } from 'next'
import { MEDIDAS, SITE } from '@/config/site'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.url,
      lastModified: new Date('2026-10-01'),
      changeFrequency: 'weekly',
      priority: 1,
      images: [`${SITE.url}/lp/og.jpg`],
    },
    ...MEDIDAS.map((m) => ({
      url: `${SITE.url}/${m.slug}`,
      lastModified: new Date('2026-10-01'),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
    { url: `${SITE.url}/privacidade`, lastModified: new Date('2026-10-01'), changeFrequency: 'yearly' as const, priority: 0.2 },
  ]
}
