"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Vitrine from '@/components/Vitrine';
import BannerCarrossel, { Banner } from '@/components/BannerCarrossel';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function Home() {
  // Valores padrão de fallback do ecossistema iAlves Pneus
  const [configs, setConfigs] = useState({
    whatsapp_numero: '5511999999999',
    campanha_afiliados_ativa: false,
    hero_titulo: 'ROBUSTEZ EXTREMA',
    hero_subtitulo: 'Fornecimento direto de pneus novos de alta durabilidade e máxima tração. Desempenho profissional projetado para frotas de caminhões e implementos rodoviários. Preço à vista imbatível.',
    instagram_url: 'https://instagram.com/ialvespneus',
    facebook_url: 'https://facebook.com/ialvespneus',
    youtube_url: '',
    tiktok_url: '',
    texto_rodape: 'Valores anunciados sujeitos a alteração sem aviso prévio. Imagens meramente ilustrativas de catálogo.',
    aviso_topo_frete: 'OFERTA DE INAUGURAÇÃO — FRETE GRÁTIS PARA COMPRAS ACIMA DE 4 PNEUS',
    aviso_topo_frete_ativo: true,
    cnpj: '00.000.000/0001-00',
    direitos_reservados: 'iAlves Pneus'
  });

  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        if (typeof window !== 'undefined') {
          const cachedConfigs = localStorage.getItem('configs_demo');
          const cachedBanners = localStorage.getItem('banners_demo');
          if (cachedConfigs) {
            try {
              setConfigs(JSON.parse(cachedConfigs));
            } catch (e) {
              console.error('Erro ao ler configs_demo local:', e);
            }
          }
          if (cachedBanners) {
            try {
              setBanners(JSON.parse(cachedBanners));
            } catch (e) {
              console.error('Erro ao ler banners_demo local:', e);
            }
          }
        }

        if (!isSupabaseConfigured()) return;

        // 1. Busca configurações globais do banco
        const { data: configData } = await supabase
          .from('configuracoes')
          .select('*')
          .eq('id', 1)
          .single();
        
        if (configData) {
          setConfigs((prev) => {
            const next = { ...prev, ...configData };
            if (typeof window !== 'undefined') {
              localStorage.setItem('configs_demo', JSON.stringify(next));
            }
            return next;
          });
        }

        // 2. Busca banners rotativos ativos ordenados por exibição
        const { data: bannerData } = await supabase
          .from('banners')
          .select('*')
          .eq('ativo', true)
          .order('ordem', { ascending: true });

        if (bannerData && bannerData.length > 0) {
          const mappedBanners = bannerData.map((b: any) => ({
            id: b.id,
            imagem_url: b.imagem_url,
            link_redirecionamento: b.link_redirecionamento,
            ativo: b.ativo,
            ordem: b.ordem
          }));
          setBanners(mappedBanners);
          if (typeof window !== 'undefined') {
            localStorage.setItem('banners_demo', JSON.stringify(mappedBanners));
          }
        }
      } catch (err) {
        console.error('Erro ao buscar configurações no cliente:', err);
      }
    }

    loadData();
  }, []);

  return (
    <div className="text-white selection:bg-[#DC2626] selection:text-white w-full max-w-full">
      {/* ═══ DESKTOP HEADER (Fixo) ═══ */}
      <div className="hidden md:block fixed top-0 left-0 right-0 z-50 w-full">
        {/* Barra de Frete com Altura Fixa */}
        {configs.aviso_topo_frete_ativo && configs.aviso_topo_frete && (
          <div suppressHydrationWarning={true} className="bg-[#DC2626] text-white text-center h-8 px-3 text-[10px] font-black uppercase tracking-wider w-full flex items-center justify-center">
            <div className="flex items-center justify-center gap-1.5 max-w-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0"></span>
              <span className="leading-none truncate">{configs.aviso_topo_frete}</span>
            </div>
          </div>
        )}
        {/* Header */}
        <header className="w-full bg-black/40 backdrop-blur-md border-b border-gray-800/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Logo */}
            <img 
              src="/logoiAlves.png" 
              alt="iAlves Pneus" 
              className="h-14 w-auto object-contain shrink-0"
            />
            {/* Ações */}
            <div className="flex items-center gap-5">
              <div className="flex flex-col text-right">
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Suporte Comercial</span>
                <span suppressHydrationWarning={true} className="text-sm font-black text-white">({configs.whatsapp_numero.slice(2,4)}) {configs.whatsapp_numero.slice(4,9)}-{configs.whatsapp_numero.slice(9)}</span>
              </div>
              <a 
                href="#vitrine-produtos" 
                className="px-5 py-2.5 bg-[#DC2626] hover:bg-white text-white hover:text-black font-black text-xs uppercase tracking-wider rounded-none transition-colors"
              >
                Ver Estoque
              </a>
            </div>
          </div>
        </header>
      </div>

      {/* Spacer responsivo para o Desktop (evita overlap) — Mobile não precisa de spacer pois flui naturalmente */}
      <div className="hidden md:block h-[112px]"></div>

      {/* ═══ MOBILE HEADER (Nativo & Empilhado no fluxo, sem fixed/absolute, estilo TireShop) ═══ */}
      <div className="block md:hidden w-full bg-[#0B0B0C] border-b border-gray-900">
        
        {/* 1. Linha do Topo / Nav Slim */}
        <div className="bg-[#121214] h-10 px-4 flex items-center justify-between border-b border-gray-800/60">
          {/* Contatos / WhatsApp à esquerda */}
          <div className="flex items-center gap-4">
            {/* Link WhatsApp */}
            <a 
              suppressHydrationWarning={true}
              href={`https://wa.me/${configs.whatsapp_numero}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#22C55E] text-[11px] font-black tracking-wider transition-colors hover:text-[#4ADE80]"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.57 1.977 14.1 1.053 11.998 1.053c-5.444 0-9.87 4.372-9.874 9.802-.001 1.77.472 3.498 1.372 5.068L2.536 21.5l5.111-1.346zm10.748-5.321c-.281-.14-.165-.37-.842-.71-.165-.083-.289-.124-.413.062-.124.186-.48.601-.587.723-.107.122-.215.138-.496.002-.28-.138-1.185-.437-2.257-1.393-.834-.743-1.397-1.66-1.562-1.94-.165-.282-.018-.434.122-.573.126-.124.281-.328.422-.493.14-.166.187-.282.281-.469.094-.187.047-.352-.023-.493-.07-.14-.587-1.413-.805-1.942-.211-.515-.425-.443-.587-.451-.15-.008-.323-.01-.497-.01-.174 0-.458.065-.697.323-.24.258-.916.895-.916 2.182 0 1.287.937 2.531 1.068 2.707.13.176 1.84 2.809 4.459 3.941.623.27 1.11.43 1.488.55.627.2 1.2.172 1.65.105.503-.074 1.547-.633 1.765-1.246.219-.613.219-1.139.153-1.246-.067-.109-.244-.166-.525-.307z"/>
              </svg>
              <span className="leading-none">{configs.whatsapp_numero.slice(2,4) === '11' || configs.whatsapp_numero.slice(2,4) === '41' ? `(${configs.whatsapp_numero.slice(2,4)})` : ''} {configs.whatsapp_numero.slice(4,9)}-{configs.whatsapp_numero.slice(9)}</span>
            </a>
            {/* Link Telefone */}
            <a 
              suppressHydrationWarning={true}
              href={`tel:${configs.whatsapp_numero}`}
              className="flex items-center gap-1.5 text-white text-[11px] font-black tracking-wider transition-colors hover:text-gray-300"
            >
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              <span className="leading-none">{configs.whatsapp_numero.slice(2,4) === '11' || configs.whatsapp_numero.slice(2,4) === '41' ? `(${configs.whatsapp_numero.slice(2,4)})` : ''} {configs.whatsapp_numero.slice(4,9)}-{configs.whatsapp_numero.slice(9)}</span>
            </a>
          </div>
          {/* Botão de Menu Hambúrguer */}
          <button 
            type="button"
            className="flex flex-col gap-1.5 cursor-pointer group"
            onClick={() => {
              const el = document.getElementById('vitrine-produtos');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="w-6 h-0.5 bg-white transition-colors group-hover:bg-[#DC2626]"></span>
            <span className="w-6 h-0.5 bg-white transition-colors group-hover:bg-[#DC2626]"></span>
            <span className="w-6 h-0.5 bg-white transition-colors group-hover:bg-[#DC2626]"></span>
          </button>
        </div>

        {/* 2. Área do Logotipo */}
        <div className="py-6 px-4 flex items-center justify-center bg-[#0B0B0C]">
          <img 
            src="/logoiAlves.png" 
            alt="iAlves Pneus" 
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </div>
      </div>

      {/* 2. Banner Carrossel — Desktop only */}
      <div className="hidden md:block">
        <BannerCarrossel
          banners={banners}
          heroTitulo={configs.hero_titulo}
          heroSubtitulo={configs.hero_subtitulo}
        />
      </div>

      {/* 3. Vitrine de Produtos */}
      <main id="vitrine-produtos" className="bg-[#0B0B0C] w-full">
        <Vitrine avisoFreteAtivo={configs.aviso_topo_frete_ativo && !!configs.aviso_topo_frete} />
      </main>

      {/* 4. Campanha Indicação Premiada */}
      <section className="py-20 bg-black relative overflow-hidden w-full">
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#DC2626]/3 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="glass-panel p-8 sm:p-16 rounded-none grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-block bg-[#DC2626]/15 border border-[#DC2626]/30 text-[#DC2626] text-xs font-extrabold px-3 py-1.5 uppercase tracking-widest">
                Programa de Parcerias
              </div>
              <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none">
                INDICAÇÃO<br/>
                <span className="text-[#DC2626]">PREMIADA</span>
              </h2>
              <p className="text-xl font-bold text-gray-300">
                INDICOU — COMPROU — GANHOU
              </p>
              
              <div className="space-y-4 pt-2">
                <div className="p-6 bg-black/40 border border-gray-800 backdrop-blur-sm rounded-none">
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
                    Como funciona?
                  </p>
                  <p className="text-3xl font-black text-white">
                    Ganhe R$ 20,00 <span className="text-lg font-bold text-gray-400">por pneu indicado</span>
                  </p>
                </div>

                <div className="p-6 bg-[#DC2626]/5 border border-[#DC2626]/10 rounded-none">
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
                    Exemplo prático de ganhos:
                  </p>
                  <p className="text-gray-200 text-sm font-semibold">
                    Indicou um cliente que comprou <span className="text-[#DC2626] font-black">10 pneus</span> ={' '}
                    <span className="text-[#DC2626] font-black text-lg">R$ 200,00</span> de premiação via PIX!
                  </p>
                </div>
              </div>

              {/* Informação do Projeto Semear */}
              <div className="flex items-start gap-3 text-xs text-gray-500 pt-2 font-medium">
                <span className="text-[#DC2626] text-lg leading-none">●</span>
                <p>
                  <span className="font-bold text-white">PARTE DAS VENDAS AJUDA O PROJETO SEMEAR.</span> A cada indicação qualificada que resulta em compra, apoiamos projetos de alimentação e apoio social local.
                </p>
              </div>
            </div>

            {/* Imagem Ilustrativa com Botão Comercial */}
            <div className="lg:col-span-5 space-y-8 flex flex-col items-center lg:items-end justify-center">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 shrink-0 z-10">
                <div className="absolute inset-0 bg-[#DC2626]/5 blur-[60px] rounded-full z-0"></div>
                <div className="relative w-full h-full p-4 bg-black/30 border border-gray-800/40 backdrop-blur-sm flex items-center justify-center rounded-none shadow-xl">
                  <Image
                    src="/pneu_borrachudo.png"
                    alt="Pneu Indicado"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain"
                  />
                </div>
              </div>
              
              <a
                suppressHydrationWarning={true}
                href={`https://wa.me/${configs.whatsapp_numero}?text=Olá! Vi o banner de Indicação Premiada no site e gostaria de saber como me cadastrar para indicar clientes e ganhar R$20 por pneu.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center px-6 py-5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-extrabold uppercase text-xs tracking-widest transition-all duration-300 rounded-none shadow-lg shadow-[#DC2626]/15"
              >
                Quero Indicar Pneus
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Footer (Adaptado para o novo Logo Retangular Horizontal logoiAlves.png e novos campos globais) */}
      <footer className="bg-[#070708] border-t border-gray-855 py-16 text-gray-500 text-sm w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            
            <div className="flex items-center gap-4">
              <div className="relative w-56 h-14 shrink-0">
                <Image
                  src="/logoiAlves.png"
                  alt="iAlves Pneus Logo"
                  fill
                  sizes="(max-width: 768px) 200px, 250px"
                  className="object-contain"
                />
              </div>
              <div>
                <p suppressHydrationWarning={true} className="text-white font-extrabold text-sm uppercase tracking-wider">
                  {configs.direitos_reservados || 'iAlves Pneus'}
                </p>
                <p suppressHydrationWarning={true} className="text-[10px] tracking-wide uppercase mt-1">
                  © 2026 Todos os direitos reservados. {configs.cnpj && `| CNPJ: ${configs.cnpj}`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 font-extrabold text-xs uppercase tracking-wider text-gray-400 justify-center md:justify-end">
              <a href="#vitrine-produtos" className="hover:text-[#DC2626] transition-colors">Produtos</a>
              <a suppressHydrationWarning={true} href={`https://wa.me/${configs.whatsapp_numero}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#DC2626] transition-colors">WhatsApp</a>
              {configs.instagram_url && (
                <a suppressHydrationWarning={true} href={configs.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#DC2626] transition-colors">Instagram</a>
              )}
              {configs.facebook_url && (
                <a suppressHydrationWarning={true} href={configs.facebook_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#DC2626] transition-colors">Facebook</a>
              )}
              {configs.youtube_url && (
                <a suppressHydrationWarning={true} href={configs.youtube_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#DC2626] transition-colors">YouTube</a>
              )}
              {configs.tiktok_url && (
                <a suppressHydrationWarning={true} href={configs.tiktok_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#DC2626] transition-colors">TikTok</a>
              )}
              <a href="/central-diretoria" className="hover:text-white transition-colors">Diretoria</a>
            </div>

          </div>
          <div suppressHydrationWarning={true} className="border-t border-gray-900 mt-10 pt-8 text-center text-xs text-gray-600 font-bold uppercase tracking-wider">
            {configs.texto_rodape}
          </div>
        </div>
      </footer>

    </div>
  );
}
