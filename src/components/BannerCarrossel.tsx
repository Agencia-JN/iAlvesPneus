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
  heroBackgroundUrl?: string;
}

export default function BannerCarrossel({ banners, heroTitulo, heroSubtitulo, heroBackgroundUrl }: BannerCarrosselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesAtivos, setSlidesAtivos] = useState<Banner[]>([
    {
      id: 'db-hero-fallback',
      imagem_url: heroBackgroundUrl || '',
      link_redirecionamento: '#vitrine-produtos',
      ativo: true,
      ordem: 1,
      titulo_sobreposto: heroTitulo || 'ROBUSTEZ MÁXIMA',
      subtitulo_sobreposto: heroSubtitulo || 'Excelente relação custo-benefício em pneus comerciais de carga para rodovias federais e estaduais.',
      botao_texto: 'Ver Estoque Comercial'
    }
  ]);
  const [tituloSobreposto, setTituloSobreposto] = useState(heroTitulo || 'ROBUSTEZ MÁXIMA');
  const [subtituloSobreposto, setSubtituloSobreposto] = useState(heroSubtitulo || 'Excelente relação custo-benefício em pneus comerciais de carga para rodovias federais e estaduais.');

  // Sincroniza com as props vindas do Supabase
  useEffect(() => {
    if (banners && banners.length > 0) {
      const activeOnly = banners.filter(b => b.ativo);
      if (activeOnly.length > 0) {
        setSlidesAtivos(activeOnly);
        if (heroTitulo) setTituloSobreposto(heroTitulo);
        if (heroSubtitulo) setSubtituloSobreposto(heroSubtitulo);
        return;
      }
    }

    // Fallback dinâmico sem imagens estáticas locais (usa a configuração do Hero configurada no painel)
    setSlidesAtivos([
      {
        id: 'db-hero-fallback',
        imagem_url: heroBackgroundUrl || '',
        link_redirecionamento: '#vitrine-produtos',
        ativo: true,
        ordem: 1,
        titulo_sobreposto: heroTitulo || 'ROBUSTEZ MÁXIMA',
        subtitulo_sobreposto: heroSubtitulo || 'Excelente relação custo-benefício em pneus comerciais de carga para rodovias federais e estaduais.',
        botao_texto: 'Ver Estoque Comercial'
      }
    ]);

    if (heroTitulo) setTituloSobreposto(heroTitulo);
    if (heroSubtitulo) setSubtituloSobreposto(heroSubtitulo);
  }, [banners, heroTitulo, heroSubtitulo, heroBackgroundUrl]);

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
    <section className="relative h-[340px] sm:h-[400px] md:h-[450px] lg:h-[480px] w-full overflow-hidden border-b border-gray-800 bg-zinc-950">
      
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
                {banner.imagem_url && (
                  <Image
                    src={banner.imagem_url}
                    alt={`Banner Promocional ${index + 1}`}
                    fill
                    priority={index === 0}
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 100vw"
                    className="object-cover transition-transform duration-10000 scale-105"
                  />
                )}
                
                {/* Overlay Premium de Degradê Radial e Linear */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/20 z-10"></div>
                <div className="absolute inset-0 bg-black/40 z-10"></div>
 
                {/* Conteúdo do Banner (Letreiro Industrial Sobreposto Premium) */}
                <div className="absolute inset-0 z-20 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-3xl space-y-4 text-left bg-black/40 border border-white/5 backdrop-blur-md p-5 sm:p-8 shadow-2xl relative overflow-hidden">
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
