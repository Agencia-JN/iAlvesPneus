'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export interface Banner {
  id: string;
  imagem_url: string;
  link_redirecionamento?: string;
  ativo: boolean;
  ordem: number;
}

interface BannerCarrosselProps {
  banners: Banner[];
  heroBackgroundUrl?: string;
  tempoTransicao?: number; // em segundos
}

export default function BannerCarrossel({ banners, heroBackgroundUrl, tempoTransicao }: BannerCarrosselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesAtivos, setSlidesAtivos] = useState<Banner[]>([
    {
      id: 'db-hero-fallback',
      imagem_url: heroBackgroundUrl || '',
      link_redirecionamento: '#vitrine-produtos',
      ativo: true,
      ordem: 1,
    }
  ]);

  // Sincroniza com as props vindas do Supabase
  useEffect(() => {
    if (banners && banners.length > 0) {
      const activeOnly = banners.filter(b => b.ativo);
      if (activeOnly.length > 0) {
        setSlidesAtivos(activeOnly);
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
      }
    ]);
  }, [banners, heroBackgroundUrl]);

  // Autoplay dinâmico com base no tempo de transição (em segundos, padrão 6s)
  useEffect(() => {
    if (slidesAtivos.length <= 1) return;
    
    const intervalMs = (tempoTransicao || 6) * 1000;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesAtivos.length);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [slidesAtivos.length, tempoTransicao]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slidesAtivos.length) % slidesAtivos.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slidesAtivos.length);
  };

  return (
    <section
      className="relative w-full overflow-hidden border-b border-gray-800 bg-zinc-950 hidden md:block"
      style={{ aspectRatio: '1920 / 600' }}
    >
      
      {/* Container dos Slides */}
      <div className="relative w-full h-full">
        {slidesAtivos.map((banner, index) => {
          const redirectUrl = banner.link_redirecionamento && banner.link_redirecionamento !== '#' ? banner.link_redirecionamento : undefined;
          
          const imgElement = banner.imagem_url ? (
            <Image
              src={banner.imagem_url}
              alt={`Banner Promocional ${index + 1}`}
              fill
              priority={index === 0}
              unoptimized
              sizes="100vw"
              className="object-cover object-center"
            />
          ) : null;

          return (
            <div
              key={banner.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {redirectUrl ? (
                  <a
                    href={redirectUrl}
                    className="relative block w-full h-full cursor-pointer z-20"
                    {...(redirectUrl.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {imgElement}
                  </a>
                ) : (
                  <div className="relative w-full h-full">
                    {imgElement}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Setas de Navegação — nas extremidades com fundo semi-transparente e backdrop-blur */}
      {slidesAtivos.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-black/50 hover:bg-[#DC2626] text-white/80 hover:text-white border border-white/10 hover:border-[#DC2626] transition-all duration-300 rounded-full backdrop-blur-sm cursor-pointer"
            aria-label="Slide anterior"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-black/50 hover:bg-[#DC2626] text-white/80 hover:text-white border border-white/10 hover:border-[#DC2626] transition-all duration-300 rounded-full backdrop-blur-sm cursor-pointer"
            aria-label="Próximo slide"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          </button>
        </>
      )}

      {/* Indicadores de Slide Ativo — posicionados fora da zona de conteúdo */}
      {slidesAtivos.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
          {slidesAtivos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full border transition-all duration-300 cursor-pointer ${
                index === currentSlide
                  ? 'bg-[#DC2626] border-[#DC2626] w-5'
                  : 'bg-white/30 border-white/10 hover:bg-white/50 w-2'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            ></button>
          ))}
        </div>
      )}
    </section>
  );
}
