import type { MetadataRoute } from 'next'
import { SITE } from '@/config/site'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.url,
      lastModified: new Date('2026-10-01'),
      changeFrequency: 'weekly',
      priority: 1,
      images: [`${SITE.url}/lp/og.jpg`],
    },
  ]
}
