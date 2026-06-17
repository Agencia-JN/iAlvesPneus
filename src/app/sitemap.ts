import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ialvespneus.com.br';

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }
  ];

  try {
    const { data: pneusData } = await supabase
      .from('pneus')
      .select('id')
      .eq('visibilidade', 'publico')
      .eq('status_produto', 'ativo')
      .gt('quantidade_estoque', 0);

    if (pneusData) {
      pneusData.forEach((pneu: { id: string | number }) => {
        routes.push({
          url: `${baseUrl}/#pneu-${pneu.id}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      });
    }
  } catch (error) {
    console.error('Erro ao gerar sitemap dinâmico:', error);
  }

  return routes;
}
