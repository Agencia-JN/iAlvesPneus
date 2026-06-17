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
    <section className="relative h-[200px] sm:h-[260px] md:h-[340px] lg:h-[400px] w-full overflow-hidden border-b border-gray-800 bg-zinc-950">
      
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

      {/* Setas de Navegação Super Visíveis de Vidro Fosco */}
      {slidesAtivos.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-black/60 hover:bg-[#DC2626] text-white border border-white/10 hover:border-[#DC2626] transition-all duration-300 rounded-none backdrop-blur-md cursor-pointer text-sm font-black"
            aria-label="Slide anterior"
          >
            ❮
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-black/60 hover:bg-[#DC2626] text-white border border-white/10 hover:border-[#DC2626] transition-all duration-300 rounded-none backdrop-blur-md cursor-pointer text-sm font-black"
            aria-label="Próximo slide"
          >
            ❯
          </button>
        </>
      )}

      {/* Indicadores de Slide Ativo */}
      {slidesAtivos.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slidesAtivos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 border transition-all duration-300 cursor-pointer ${
                index === currentSlide
                  ? 'bg-[#DC2626] border-[#DC2626] w-6 sm:w-8'
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
