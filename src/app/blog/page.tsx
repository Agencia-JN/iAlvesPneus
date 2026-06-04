import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface Post {
  id: string;
  titulo: string;
  slug: string;
  conteudo: string;
  imagem_url: string;
  created_at: string;
}

const MOCK_POSTS: Post[] = [
  {
    id: 'm1',
    titulo: 'Vale a pena comprar o Pneu Xbri Forza Plus F1 295/80 R22.5? Análise Completa',
    slug: 'pneu-xbri-forza-plus-f1-promocao-especial-9999',
    conteudo: '<p>Quem vive na estrada sabe: o pneu é o coração do caminhão...</p>',
    imagem_url: '/pneu_borrachudo.png',
    created_at: new Date().toISOString(),
  },
  {
    id: 'm2',
    titulo: 'Pneu Supercargo 295/80 R22.5: O campeão do asfalto à vista',
    slug: 'pneu-supercargo-liso-promocao-especial-8888',
    conteudo: '<p>O campeão do custo-benefício nas estradas federais...</p>',
    imagem_url: '/pneu_liso.png',
    created_at: new Date(Date.now() - 86400000).toISOString(), // Ontem
  }
];

export const revalidate = 60; // Revalida a cada 60 segundos (ISR)

export default async function BlogPage() {
  let posts: Post[] = MOCK_POSTS;
  let isDemoMode = true;

  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error && data.length > 0) {
        posts = data;
        isDemoMode = false;
      }
    }
  } catch (err) {
    console.error('Falha ao carregar posts do Supabase:', err);
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white selection:bg-[#DC2626] selection:text-white">
      
      {/* Header Fixo Translúcido */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-black/40 backdrop-blur-md border-b border-gray-800/40 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-20 md:h-24 flex items-center justify-between">
          
          <Link href="/" className="w-36 h-9 sm:w-48 sm:h-12 md:w-64 md:h-16 relative block shrink-0">
            <img 
              src="/logoiAlves.png" 
              alt="iAlves Pneus" 
              className="w-full h-full object-contain"
            />
          </Link>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Suporte Comercial</span>
              <span className="text-sm font-black text-white">(11) 99999-9999</span>
            </div>
            <Link 
              href="/#vitrine-produtos" 
              className="px-3 py-2 sm:px-5 sm:py-3 bg-[#DC2626] hover:bg-white text-white hover:text-black font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-none transition-colors"
            >
              Ver Estoque
            </Link>
          </div>

        </div>
      </header>

      {/* Hero do Blog */}
      <section className="bg-black py-16 border-b border-gray-900 relative pt-20 sm:pt-28">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#DC2626]/3 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
          <span className="bg-[#DC2626]/10 text-[#DC2626] text-xs font-black px-3 py-1.5 uppercase tracking-widest border border-[#DC2626]/20">
            Artigos e Análises Comerciais
          </span>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-wider text-white">
            PÉ NA <span className="text-[#DC2626]">ESTRADA</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto font-medium">
            Fique por dentro das análises técnicas de pneus de carga, comparativos de rendimento quilométrico e oportunidades exclusivas de frete.
          </p>
        </div>
      </section>

      {/* Grid de Artigos */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {isDemoMode && (
          <div className="mb-8 p-3 text-center text-xs font-black bg-amber-500/10 border border-amber-500/20 text-amber-500 uppercase tracking-widest rounded-none">
            Modo de Demonstração: Exibindo artigos fictícios simulados.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="glass-panel rounded-none overflow-hidden flex flex-col sm:flex-row hover:border-gray-700 transition-all duration-300 relative"
            >
              {/* Capa do post */}
              <div className="relative w-full sm:w-48 h-48 sm:h-auto bg-black/60 border-r border-gray-900 shrink-0 p-4 flex items-center justify-center">
                <Image
                  src={post.imagem_url}
                  alt={post.titulo}
                  width={140}
                  height={140}
                  className="object-contain max-h-full"
                />
              </div>

              {/* Corpo informativo */}
              <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] text-gray-500 font-bold font-mono">
                    {new Date(post.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  <h2 className="text-lg font-black text-white hover:text-[#DC2626] transition-colors uppercase tracking-wide line-clamp-3">
                    <Link href={`/blog/${post.slug}`}>
                      {post.titulo}
                    </Link>
                  </h2>
                </div>

                <div className="pt-4 border-t border-gray-900/60 flex items-center justify-between">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-xs font-extrabold uppercase text-[#DC2626] hover:text-[#B91C1C] tracking-widest transition-colors"
                  >
                    Ler Artigo Completo
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

    </div>
  );
}
