import type { MetadataRoute } from 'next'
import { SITE } from '@/config/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // partes do site antigo que ficaram guardadas: fora do Google
      disallow: ['/central-diretoria', '/blog', '/api/'],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  }
}
