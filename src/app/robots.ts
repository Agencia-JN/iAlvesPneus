import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/central-diretoria/',
    },
    sitemap: 'https://ialvespneus.com.br/sitemap.xml',
  };
}
