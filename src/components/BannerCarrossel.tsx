'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export interface Banner {
  id: string;
  imagem_url: string;
  link_redirecionamento?: string;
  ativo: boolean;
  ordem: number;
  titulo_sobreposto?: string;
  subtitulo_sobreposto?: string;
  botao_texto?: string;
}

interface BannerCarrosselProps {
  banners: Banner[];
  heroTitulo?: string;
  heroSubtitulo?: string;
}

// Banners Fictícios de Carga Pesada Ultra Premium caso o Supabase não possua dados cadastrados
const BANNER_FALLBACKS: Banner[] = [
  {
    id: 'f1',
    imagem_url: '/2.jpeg',
    link_redirecionamento: '#vitrine-produtos',
    ativo: true,
    ordem: 1,
    titulo_sobreposto: 'ROBUSTEZ INDUSTRIAL EXTREMA',
    subtitulo_sobreposto: 'Pneus novos de alta performance e máxima tração para frotas pesadas. Desempenho garantido nas estradas mais severas.',
    botao_texto: 'Ver Estoque Comercial'
  },
  {
    id: 'f2',
    imagem_url: '/3.jpeg',
    link_redirecionamento: '#vitrine-produtos',
    ativo: true,
    ordem: 2,
    titulo_sobreposto: 'DIRETO DA IMPORTADORA NO PIX',
    subtitulo_sobreposto: 'Negociação exclusiva para frotistas e transportadoras com descontos agressivos de pagamento à vista.',
    botao_texto: 'Falar com Consultor no WhatsApp'
  },
  {
    id: 'f3',
    imagem_url: '/2.jpeg',
    link_redirecionamento: '#vitrine-produtos',
    ativo: true,
    ordem: 3,
    titulo_sobreposto: 'INDICAÇÃO PREMIADA: GANHE PIX',
    subtitulo_sobreposto: 'Indique motoristas ou frotistas e fature R$ 20,00 por pneu comercializado. Rápido, fácil e sem burocracia.',
    botao_texto: 'Quero Participar da Campanha'
  }
];

export default function BannerCarrossel({ banners, heroTitulo, heroSubtitulo }: BannerCarrosselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesAtivos, setSlidesAtivos] = useState<Banner[]>(banners && banners.length > 0 ? banners : BANNER_FALLBACKS);
  const [tituloSobreposto, setTituloSobreposto] = useState(heroTitulo || 'ROBUSTEZ MÁXIMA');
  const [subtituloSobreposto, setSubtituloSobreposto] = useState(heroSubtitulo || 'Excelente relação custo-benefício em pneus comerciais de carga para rodovias federais e estaduais.');

  // Sincroniza com as edições do LocalStorage se estiver rodando localmente/demo no cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cachedBanners = localStorage.getItem('banners_demo');
      const cachedConfigs = localStorage.getItem('configs_demo');

      if (cachedBanners) {
        try {
          const parsed = JSON.parse(cachedBanners) as Banner[];
          const activeOnly = parsed.filter(b => b.ativo);
          if (activeOnly.length > 0) {
            setSlidesAtivos(activeOnly);
          } else {
            setSlidesAtivos(BANNER_FALLBACKS);
          }
        } catch (e) {
          console.error('Erro ao ler banners do cache local:', e);
          setSlidesAtivos(banners && banners.length > 0 ? banners : BANNER_FALLBACKS);
        }
      } else {
        setSlidesAtivos(banners && banners.length > 0 ? banners : BANNER_FALLBACKS);
      }

      if (cachedConfigs) {
        try {
          const parsedConf = JSON.parse(cachedConfigs);
          if (parsedConf.hero_titulo) setTituloSobreposto(parsedConf.hero_titulo);
          if (parsedConf.hero_subtitulo) setSubtituloSobreposto(parsedConf.hero_subtitulo);
        } catch (e) {
          console.error('Erro ao ler configs do cache local:', e);
        }
      } else {
        if (heroTitulo) setTituloSobreposto(heroTitulo);
        if (heroSubtitulo) setSubtituloSobreposto(heroSubtitulo);
      }
    }
  }, [banners, heroTitulo, heroSubtitulo]);

  // Autoplay a cada 6 segundos
  useEffect(() => {
    if (slidesAtivos.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesAtivos.length);
    }, 6500);

    return () => clearInterval(interval);
  }, [slidesAtivos.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slidesAtivos.length) % slidesAtivos.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slidesAtivos.length);
  };

  return (
    <section className="relative h-[420px] sm:h-[500px] md:h-[550px] lg:h-[620px] w-full overflow-hidden border-b border-gray-800 bg-black">
      
      {/* Container dos Slides */}
      <div className="relative w-full h-full">
        {slidesAtivos.map((banner, index) => {
          const isFictitious = banner.id.startsWith('f');
          
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Imagem de Fundo do Banner com Next.js Image fill e priority */}
              <div className="relative w-full h-full">
                <Image
                  src={banner.imagem_url}
                  alt={`Banner Promocional ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 100vw"
                  className="object-cover transition-transform duration-10000 scale-105"
                />
                
                {/* Overlay Premium de Degradê Radial e Linear */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/20 z-10"></div>
                <div className="absolute inset-0 bg-black/40 z-10"></div>

                {/* Conteúdo do Banner (Letreiro Industrial Sobreposto Premium) */}
                <div className="absolute inset-0 z-20 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-3xl space-y-5 text-left bg-black/40 border border-white/5 backdrop-blur-md p-6 sm:p-10 shadow-2xl relative overflow-hidden">
                      {/* Borda Decorativa Vermelha Industrial lateral */}
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-[#DC2626]"></div>
                      
                      {/* Badge Comercial */}
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#DC2626]/10 border border-[#DC2626]/35 text-[#DC2626] text-[10px] font-black uppercase tracking-widest">
                        <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-ping"></span>
                        {isFictitious ? 'PRONTA ENTREGA' : 'PREÇO ESPECIAL'}
                      </div>

                      {/* Título de Impacto (Prioriza o título configurado se for o primeiro slide) */}
                      <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-none">
                        {index === 0 ? tituloSobreposto : (banner.titulo_sobreposto || 'ROBUSTEZ MÁXIMA')}
                      </h2>

                      {/* Subtítulo */}
                      <p className="text-sm sm:text-base text-gray-300 font-medium leading-relaxed max-w-2xl">
                        {index === 0 ? subtituloSobreposto : (banner.subtitulo_sobreposto || 'Excelente relação custo-benefício em pneus comerciais de carga para rodovias federais e estaduais.')}
                      </p>

                      {/* Ações/Botão de Clique */}
                      <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                        <a
                          href={banner.link_redirecionamento || '#vitrine-produtos'}
                          className="px-6 py-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-extrabold uppercase text-[10px] sm:text-xs tracking-widest transition-all duration-300 w-full sm:w-auto text-center cursor-pointer shadow-lg shadow-[#DC2626]/15"
                        >
                          {banner.botao_texto || 'Garantir Cotação'}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Setas de Navegação Super Visíveis de Vidro Fosco */}
      {slidesAtivos.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-35 w-12 h-12 flex items-center justify-center bg-black/60 hover:bg-[#DC2626] text-white border border-white/10 hover:border-[#DC2626] transition-all duration-300 rounded-none backdrop-blur-md cursor-pointer text-sm font-black uppercase tracking-widest"
            aria-label="Slide anterior"
          >
            ❮
          </button>
          <button
            onClick={handleNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-35 w-12 h-12 flex items-center justify-center bg-black/60 hover:bg-[#DC2626] text-white border border-white/10 hover:border-[#DC2626] transition-all duration-300 rounded-none backdrop-blur-md cursor-pointer text-sm font-black uppercase tracking-widest"
            aria-label="Próximo slide"
          >
            ❯
          </button>
        </>
      )}

      {/* Indicadores de Slide Ativo */}
      {slidesAtivos.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-35 flex gap-2.5">
          {slidesAtivos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3.5 h-3.5 border transition-all duration-300 cursor-pointer ${
                index === currentSlide
                  ? 'bg-[#DC2626] border-[#DC2626] w-8'
                  : 'bg-black/60 border-white/20 hover:border-white'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            ></button>
          ))}
        </div>
      )}
    </section>
  );
}
