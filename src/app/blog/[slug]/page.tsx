'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

interface PostData {
  id: string;
  titulo: string;
  conteudo: string;
  imagem_url: string;
  created_at: string;
  pneus: {
    id: string;
    nome: string;
    marca: string;
    medida: string;
    preco_vista: number;
    categoria: string;
    sulco_mm: number;
    imagem_url: string;
  } | null;
}

// Fallback de artigo de demonstração para testes rápidos
const DEMO_POSTS: Record<string, PostData> = {
  'pneu-xbri-forza-plus-f1-promocao-especial-9999': {
    id: 'm1',
    titulo: 'Vale a pena comprar o Pneu Xbri Forza Plus F1 295/80 R22.5? Análise Completa',
    conteudo: `
      <h2>O Pneu Xbri Forza Plus F1 é bom mesmo para o trabalho pesado?</h2>
      <p>Quem vive na estrada sabe: o pneu é o coração do caminhão. Se você é caminhoneiro autônomo ou frotista, sabe que cada centavo economizado em pneu representa mais lucro no frete. Hoje, vamos analisar de forma honesta o <strong>Pneu Xbri Forza Plus F1</strong> de medida <strong>295/80 R22.5</strong>, um modelo projetado especificamente para aguentar as condições desafiadoras das rodovias brasileiras.</p>
      
      <h2>Resistência de Sulco e Durabilidade de Carcaça</h2>
      <p>Com um sulco técnico de <strong>20 mm</strong> de profundidade, o Pneu Xbri Forza Plus F1 oferece excelente tração e alta resistência contra cortes e pancadas nas estradas. Essa profundidade reforçada reduz a taxa de desgaste regular e prolonga a vida útil da primeira vida do pneu, permitindo também excelentes índices de recapabilidade futura.</p>
      <p>A banda de rodagem com composto especial de alta aderência reduz o superaquecimento, um dos maiores inimigos da vida útil do pneu em rodagens pesadas com carga máxima em asfalto quente.</p>
      
      <h2>Custo-Benefício Imbatível: Oportunidade À Vista</h2>
      <p>No quesito economia, o Pneu Xbri Forza Plus F1 se destaca no mercado atual de carga pesada. Por apenas <strong>R$ 1.810,00 à vista</strong> por unidade, você adquire um pneu com alta tecnologia de carcaça e excelente resposta em frenagens em pistas secas e molhadas.</p>
    `,
    imagem_url: '/pneu_borrachudo.png',
    created_at: new Date().toISOString(),
    pneus: {
      id: 'b4',
      nome: 'FORZA PLUS F1',
      marca: 'XBRI',
      medida: '295/80 R22.5',
      preco_vista: 1810.00,
      categoria: 'Borrachudo',
      sulco_mm: 20,
      imagem_url: '/pneu_borrachudo.png',
    }
  },
  'pneu-supercargo-liso-promocao-especial-8888': {
    id: 'm2',
    titulo: 'Pneu Supercargo 295/80 R22.5: O campeão do asfalto à vista',
    conteudo: `
      <h2>Supercargo: Máximo Rendimento em Eixos Direcionais</h2>
      <p>Para caminhões pesados, a escolha do pneu do eixo liso/direcional determina a segurança e a economia de combustível da viagem. O pneu <strong>Supercargo 295/80 R22.5</strong> apresenta excelente resposta e dirigibilidade precisa.</p>
      <h2>Tecnologia de Banda Linear para Reduzir Atrito</h2>
      <p>Seus sulcos lineares de <strong>15 mm</strong> reduzem a resistência ao rolamento, contribuindo para uma economia de até 4% no consumo de óleo diesel. Seus ombros sólidos garantem estabilidade nas curvas mais difíceis das serras.</p>
    `,
    imagem_url: '/pneu_liso.png',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    pneus: {
      id: 'l1',
      nome: 'SUPERCARGO',
      marca: 'SUPERCARGO',
      medida: '295/80 R22.5',
      preco_vista: 1380.00,
      categoria: 'Liso',
      sulco_mm: 15,
      imagem_url: '/pneu_liso.png',
    }
  }
};

export default function BlogPostDetail() {
  const params = useParams();
  const slug = params?.slug as string;

  const [post, setPost] = useState<PostData | null>(null);
  const [whatsappNumero, setWhatsappNumero] = useState('5511999999999');
  const [refParceiro, setRefParceiro] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Carrega dados do artigo e configs do Supabase
  useEffect(() => {
    async function loadPostData() {
      try {
        // Rastro de afiliados no sessionStorage
        if (typeof window !== 'undefined') {
          const cachedRef = sessionStorage.getItem('ref_parceiro');
          if (cachedRef) setRefParceiro(cachedRef);
        }

        if (!isSupabaseConfigured()) {
          // Fallback para os dados de demonstração
          if (DEMO_POSTS[slug]) {
            setPost(DEMO_POSTS[slug]);
          }
          setLoading(false);
          return;
        }

        // Busca configurações do WhatsApp
        const { data: configData } = await supabase
          .from('configuracoes')
          .select('whatsapp_numero')
          .eq('id', 1)
          .single();

        if (configData) {
          setWhatsappNumero(configData.whatsapp_numero);
        }

        // Busca artigo e faz join com pneus
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select(`
            id,
            titulo,
            conteudo,
            imagem_url,
            created_at,
            pneus (
              id,
              nome,
              marca,
              medida,
              preco_vista,
              categoria,
              sulco_mm,
              imagem_url
            )
          `)
          .eq('slug', slug)
          .single();

        if (postData && !postError) {
          // Normaliza tipagens
          const normalized: PostData = {
            id: postData.id,
            titulo: postData.titulo,
            conteudo: postData.conteudo,
            imagem_url: postData.imagem_url,
            created_at: postData.created_at,
            pneus: postData.pneus ? {
              id: (postData.pneus as any).id,
              nome: (postData.pneus as any).nome,
              marca: (postData.pneus as any).marca,
              medida: (postData.pneus as any).medida,
              preco_vista: Number((postData.pneus as any).preco_vista),
              categoria: (postData.pneus as any).categoria,
              sulco_mm: Number((postData.pneus as any).sulco_mm),
              imagem_url: (postData.pneus as any).imagem_url,
            } : null,
          };
          setPost(normalized);
        } else {
          // Fallback adicional
          if (DEMO_POSTS[slug]) setPost(DEMO_POSTS[slug]);
        }
      } catch (err) {
        console.error('Erro ao buscar post:', err);
        if (DEMO_POSTS[slug]) setPost(DEMO_POSTS[slug]);
      } finally {
        setLoading(false);
      }
    }

    if (slug) loadPostData();
  }, [slug]);

  // Generador de CTA WhatsApp de alta conversão
  const getComprarLink = () => {
    if (!post || !post.pneus) return '#';
    const pneu = post.pneus;
    const nomePneu = `${pneu.marca} - ${pneu.nome}`;
    const valorPreco = formatCurrency(pneu.preco_vista);
    
    let pageUrl = '';
    if (typeof window !== 'undefined') {
      pageUrl = window.location.href;
    }

    let msg = `Olá! Tenho interesse no pneu ${nomePneu} de medida ${pneu.medida} pelo valor de ${valorPreco} que vi no blog.\nLink: ${pageUrl}`;

    if (refParceiro) {
      msg += `\n[Indicação: ${refParceiro}]`;
    }

    return `https://wa.me/${whatsappNumero}?text=${encodeURIComponent(msg)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#DC2626] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 mt-4 font-semibold uppercase tracking-wider text-xs">Acessando artigo no acervo...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] text-white flex flex-col items-center justify-center p-4">
        <div className="glass-panel p-8 text-center max-w-md rounded-none border-t-2 border-t-[#DC2626]">
          <h1 className="text-xl font-black uppercase text-white">Artigo não Encontrado</h1>
          <p className="text-gray-400 text-sm mt-3">O artigo solicitado pode ter sido arquivado ou removido da base.</p>
          <Link href="/blog" className="inline-block mt-6 px-6 py-2.5 bg-[#DC2626] text-white font-extrabold uppercase text-xs tracking-widest rounded-none">
            Voltar para o Blog
          </Link>
        </div>
      </div>
    );
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

      {/* Título Principal & Data */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-20 sm:pt-28 space-y-8">
        
        <div className="space-y-4 text-center sm:text-left">
          <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest">
            Publicado em: {new Date(post.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            {post.titulo}
          </h1>
          <div className="w-16 h-1 bg-[#DC2626] mt-4 mx-auto sm:mx-0"></div>
        </div>

        {/* Imagem de Capa */}
        <div className="relative w-full h-64 sm:h-96 bg-black border border-gray-800 flex items-center justify-center p-6">
          <Image
            src={post.imagem_url}
            alt={post.titulo}
            width={320}
            height={320}
            priority
            className="object-contain max-h-full drop-shadow-[0_0_40px_rgba(220,38,38,0.08)]"
          />
        </div>

        {/* Corpo do Post em HTML gerado por IA */}
        <div 
          className="prose prose-invert prose-red max-w-none 
          prose-h2:text-xl prose-h2:font-black prose-h2:uppercase prose-h2:tracking-wider prose-h2:text-white prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-l-4 prose-h2:border-l-[#DC2626] prose-h2:pl-4
          prose-h3:text-lg prose-h3:font-black prose-h3:uppercase prose-h3:text-gray-200 prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-base prose-p:mb-6
          prose-strong:text-[#DC2626] prose-strong:font-black"
          dangerouslySetInnerHTML={{ __html: post.conteudo }}
        />

        {/* 5. BANNER DE ALTÍSSIMA CONVERSÃO DO PNEU VINCULADO (ESTÉTICA EDITORIAL) */}
        {post.pneus && (
          <div className="glass-panel border-l-4 border-l-[#DC2626] p-6 sm:p-8 rounded-none mt-12 bg-black/60 relative overflow-hidden">
            <div className="absolute w-[200px] h-[200px] bg-[#DC2626]/3 blur-[80px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              
              <div className="flex items-center gap-6 text-center sm:text-left flex-col sm:flex-row">
                <div className="relative w-28 h-28 bg-black/80 border border-gray-800 p-2 flex items-center justify-center shrink-0">
                  <Image
                    src={post.pneus.imagem_url}
                    alt={post.pneus.nome}
                    width={90}
                    height={90}
                    className="object-contain max-h-full"
                  />
                </div>
                <div>
                  <span className="bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 font-bold tracking-widest uppercase">
                    {post.pneus.marca}
                  </span>
                  <h3 className="text-xl font-black text-white uppercase tracking-wider mt-1">
                    {post.pneus.nome}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Medida: <span className="text-white font-bold">{post.pneus.medida}</span> | Sulco: <span className="text-white font-bold">{post.pneus.sulco_mm} mm</span>
                  </p>
                </div>
              </div>

              {/* Preço e CTA */}
              <div className="flex flex-col items-center md:items-end justify-center shrink-0 w-full md:w-auto">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none">PREÇO À VISTA</span>
                <span className="text-2xl font-black text-[#DC2626] mt-1">
                  {formatCurrency(post.pneus.preco_vista)}
                </span>
                <span className="text-[9px] text-gray-500 font-bold uppercase mt-0.5 mb-4">POR UNIDADE</span>

                <a
                  href={getComprarLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:w-auto px-8 py-3.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-black uppercase text-xs tracking-widest transition-all duration-300 rounded-none text-center shadow-md hover:shadow-[#DC2626]/10"
                >
                  Garantir no WhatsApp
                </a>
              </div>

            </div>
          </div>
        )}

      </article>

    </div>
  );
}
