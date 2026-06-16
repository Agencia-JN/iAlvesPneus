"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Vitrine from '@/components/Vitrine';
import BannerCarrossel, { Banner } from '@/components/BannerCarrossel';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getWhatsappLink } from '@/lib/utils';
import type { Pneu } from '@/components/Vitrine';

// ─── Tipo de Configurações Globais ───────────────────────────────────────────
interface SiteConfigs {
  whatsapp_numero: string;
  header_config: {
    logo_url: string;
    aviso_topo: string;
    aviso_ativo: boolean;
  };
  hero_config: {
    titulo: string;
    subtitulo: string;
    background_url: string;
  };
  footer_config: {
    texto_rodape: string;
    cnpj: string;
    direitos_reservados: string;
    links_sociais: {
      instagram: string;
      facebook: string;
      youtube: string;
      tiktok: string;
    };
  };
  features_config: {
    afiliado_ativo: boolean;
    frete_ativo: boolean;
    blog_ia_ativo: boolean;
  };
  banner_tempo_transicao?: number;
}

// ─── Estado inicial — valores vazios para evitar flash no mount ────────────
const CONFIGS_DEFAULT: SiteConfigs = {
  whatsapp_numero: '5511999999999',
  header_config: {
    logo_url: '/logoiAlves.png',
    aviso_topo: '🔥 OFERTA DE INAUGURAÇÃO: FRETE GRÁTIS PARA COMPRAS ACIMA DE 4 PNEUS!',
    aviso_ativo: true,
  },
  hero_config: {
    titulo: 'ROBUSTEZ EXTREMA',
    subtitulo: 'Fornecimento direto de pneus novos de alta durabilidade e máxima tração. Desempenho profissional projetado para frotas de caminhões e implementos rodoviários. Preço à vista imbatível.',
    background_url: '',
  },
  footer_config: {
    texto_rodape: '',
    cnpj: '',
    direitos_reservados: '',
    links_sociais: { instagram: '', facebook: '', youtube: '', tiktok: '' },
  },
  features_config: {
    afiliado_ativo: false,
    frete_ativo: true,
    blog_ia_ativo: false,
  },
  banner_tempo_transicao: 6,
};

export default function Home() {
  const [configs, setConfigs] = useState<SiteConfigs>(CONFIGS_DEFAULT);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [pneus, setPneus] = useState<Pneu[]>([]);
  const [siteLoaded, setSiteLoaded] = useState(false);

  useEffect(() => {
    // ── Desativa restauração automática de scroll do browser (evita F5 abrir no meio da página) ──
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }

    if (!isSupabaseConfigured()) {
      setSiteLoaded(true);
      return;
    }

    // ── Todas as queries em paralelo — elimina latência em série ────────────
    Promise.all([
      supabase.from('configuracoes').select('*').eq('id', 1).maybeSingle(),
      supabase.from('banners').select('*').eq('ativo', true).order('ordem', { ascending: true }),
      supabase.from('pneus').select('*').eq('visibilidade', 'publico').eq('status_produto', 'ativo').gt('quantidade_estoque', 0).order('posicao_destaque', { ascending: false }),
    ])
      .then(([{ data: configData }, { data: bannerData }, { data: pneusData }]) => {
        // 1. Configs
        if (configData) {
          const h = configData.header_config || {};
          const he = configData.hero_config || {};
          const f = configData.footer_config || {};
          const ft = configData.features_config || {};

          setConfigs({
            whatsapp_numero: configData.whatsapp_numero || CONFIGS_DEFAULT.whatsapp_numero,
            header_config: {
              logo_url: h.logo_url || CONFIGS_DEFAULT.header_config.logo_url,
              aviso_topo: h.aviso_topo || CONFIGS_DEFAULT.header_config.aviso_topo,
              aviso_ativo: h.aviso_ativo !== false,
            },
            hero_config: {
              titulo: he.titulo || CONFIGS_DEFAULT.hero_config.titulo,
              subtitulo: he.subtitulo || CONFIGS_DEFAULT.hero_config.subtitulo,
              background_url: he.background_url || '',
            },
            footer_config: {
              texto_rodape: f.texto_rodape ?? '',
              cnpj: f.cnpj ?? '',
              direitos_reservados: f.direitos_reservados ?? '',
              links_sociais: {
                instagram: f.links_sociais?.instagram ?? '',
                facebook: f.links_sociais?.facebook ?? '',
                youtube: f.links_sociais?.youtube ?? '',
                tiktok: f.links_sociais?.tiktok ?? '',
              },
            },
            features_config: {
              afiliado_ativo: !!ft.afiliado_ativo,
              frete_ativo: ft.frete_ativo !== false,
              blog_ia_ativo: !!ft.blog_ia_ativo,
            },
            banner_tempo_transicao: configData.banner_tempo_transicao !== undefined && configData.banner_tempo_transicao !== null 
              ? Number(configData.banner_tempo_transicao) 
              : 6,
          });
        }

        // 2. Banners
        if (bannerData) {
          setBanners(bannerData.map((b: any) => ({
            id: b.id,
            imagem_url: b.imagem_url,
            link_redirecionamento: b.link_redirecionamento,
            ativo: b.ativo,
            ordem: b.ordem,
          })));
        } else {
          setBanners([]);
        }

        // 3. Pneus — passados diretamente para o componente Vitrine
        if (pneusData) {
          setPneus(pneusData as Pneu[]);
        } else {
          setPneus([]);
        }
      })
      .catch((err) => console.error('[iAlves] Erro ao carregar dados:', err))
      .finally(() => setSiteLoaded(true));
  }, []);

  // Derivados — evita recalcular no render
  const avisoFreteAtivo = useMemo(
    () => configs.header_config.aviso_ativo && !!configs.header_config.aviso_topo.trim(),
    [configs.header_config.aviso_ativo, configs.header_config.aviso_topo]
  );

  const telFormatada = useMemo(() => {
    const digits = configs.whatsapp_numero.replace(/\D/g, '');
    const cleanDigits = digits.startsWith('55') && (digits.length === 12 || digits.length === 13)
      ? digits.slice(2)
      : digits;
    
    if (cleanDigits.length === 11) {
      return `(${cleanDigits.slice(0, 2)}) ${cleanDigits.slice(2, 7)}-${cleanDigits.slice(7)}`;
    }
    if (cleanDigits.length === 10) {
      return `(${cleanDigits.slice(0, 2)}) ${cleanDigits.slice(2, 6)}-${cleanDigits.slice(6)}`;
    }
    return configs.whatsapp_numero;
  }, [configs.whatsapp_numero]);

  return (
    <div className="text-white selection:bg-[#DC2626] selection:text-white w-full max-w-full">

      {/* ═══ DESKTOP HEADER (Fixo) ═══ */}
      <div className="hidden md:block fixed top-0 left-0 right-0 z-50 w-full">
        {avisoFreteAtivo && (
          <div className="bg-[#DC2626] text-white text-center h-8 px-3 text-[10px] font-black uppercase tracking-wider w-full flex items-center justify-center">
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0"></span>
              <span className="leading-none truncate">{configs.header_config.aviso_topo}</span>
            </div>
          </div>
        )}
        <header className="w-full bg-black/40 backdrop-blur-md border-b border-gray-800/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <img
              src={configs.header_config.logo_url}
              alt="iAlves Pneus"
              className="h-14 w-auto object-contain shrink-0"
            />
            <div className="flex items-center gap-5">
              <div className="flex flex-col text-right">
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Suporte Comercial</span>
                <span className="text-sm font-black text-white">{telFormatada}</span>
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

      {/* Spacer Desktop */}
      <div className="hidden md:block h-[112px]"></div>

      {/* ═══ MOBILE HEADER ═══ */}
      <div className="block md:hidden w-full bg-[#0B0B0C] border-b border-gray-900">
        {avisoFreteAtivo && (
          <div className="bg-[#DC2626] text-white text-center py-2 px-3 text-[10px] font-black uppercase tracking-wider w-full flex items-center justify-center border-b border-red-700">
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0"></span>
              <span className="leading-none">{configs.header_config.aviso_topo}</span>
            </div>
          </div>
        )}
        <div className="bg-[#121214] h-10 px-4 flex items-center justify-between border-b border-gray-800/60">
          <div className="flex items-center gap-4">
            <a
              href={getWhatsappLink(configs.whatsapp_numero)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#22C55E] text-[11px] font-black tracking-wider transition-colors hover:text-[#4ADE80]"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.57 1.977 14.1 1.053 11.998 1.053c-5.444 0-9.87 4.372-9.874 9.802-.001 1.77.472 3.498 1.372 5.068L2.536 21.5l5.111-1.346zm10.748-5.321c-.281-.14-.165-.37-.842-.71-.165-.083-.289-.124-.413.062-.124.186-.48.601-.587.723-.107.122-.215.138-.496.002-.28-.138-1.185-.437-2.257-1.393-.834-.743-1.397-1.66-1.562-1.94-.165-.282-.018-.434.122-.573.126-.124.281-.328.422-.493.14-.166.187-.282.281-.469.094-.187.047-.352-.023-.493-.07-.14-.587-1.413-.805-1.942-.211-.515-.425-.443-.587-.451-.15-.008-.323-.01-.497-.01-.174 0-.458.065-.697.323-.24.258-.916.895-.916 2.182 0 1.287.937 2.531 1.068 2.707.13.176 1.84 2.809 4.459 3.941.623.27 1.11.43 1.488.55.627.2 1.2.172 1.65.105.503-.074 1.547-.633 1.765-1.246.219-.613.219-1.139.153-1.246-.067-.109-.244-.166-.525-.307z"/>
              </svg>
              <span className="leading-none">{telFormatada}</span>
            </a>
            <a
              href={`tel:${configs.whatsapp_numero}`}
              className="flex items-center gap-1.5 text-white text-[11px] font-black tracking-wider transition-colors hover:text-gray-300"
            >
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              <span className="leading-none">{telFormatada}</span>
            </a>
          </div>
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
        <div className="py-6 px-4 flex items-center justify-center bg-[#0B0B0C]">
          <img
            src={configs.header_config.logo_url}
            alt="iAlves Pneus"
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </div>
      </div>

      {/* ═══ BANNER CARROSSEL ═══ */}
      <BannerCarrossel
        banners={banners}
        heroBackgroundUrl={configs.hero_config.background_url}
        tempoTransicao={configs.banner_tempo_transicao}
      />

      {/* ═══ VITRINE DE PRODUTOS ═══ */}
      <main id="vitrine-produtos" className="bg-[#0B0B0C] w-full">
        <Vitrine
          avisoFreteAtivo={avisoFreteAtivo}
          whatsappNumero={configs.whatsapp_numero}
          pneusIniciais={pneus}
          campanhaAfiliado={configs.features_config.afiliado_ativo}
        />
      </main>

      {/* ═══ CAMPANHA INDICAÇÃO PREMIADA ═══ */}
      {configs.features_config.afiliado_ativo && (
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
                <p className="text-xl font-bold text-gray-300">INDICOU — COMPROU — GANHOU</p>
                <div className="space-y-4 pt-2">
                  <div className="p-6 bg-black/40 border border-gray-800 backdrop-blur-sm rounded-none">
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Como funciona?</p>
                    <p className="text-3xl font-black text-white">
                      Ganhe R$ 20,00 <span className="text-lg font-bold text-gray-400">por pneu indicado</span>
                    </p>
                  </div>
                  <div className="p-6 bg-[#DC2626]/5 border border-[#DC2626]/10 rounded-none">
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Exemplo prático de ganhos:</p>
                    <p className="text-gray-200 text-sm font-semibold">
                      Indicou um cliente que comprou <span className="text-[#DC2626] font-black">10 pneus</span> ={' '}
                      <span className="text-[#DC2626] font-black text-lg">R$ 200,00</span> de premiação via PIX!
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-xs text-gray-500 pt-2 font-medium">
                  <span className="text-[#DC2626] text-lg leading-none">●</span>
                  <p>
                    <span className="font-bold text-white">PARTE DAS VENDAS AJUDA O PROJETO SEMEAR.</span> A cada indicação qualificada que resulta em compra, apoiamos projetos de alimentação e apoio social local.
                  </p>
                </div>
              </div>
              <div className="lg:col-span-5 space-y-8 flex flex-col items-center lg:items-end justify-center">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 shrink-0 z-10">
                  <div className="absolute inset-0 bg-[#DC2626]/5 blur-[60px] rounded-full z-0"></div>
                  <div className="relative w-full h-full p-4 bg-black/30 border border-gray-800/40 backdrop-blur-sm flex items-center justify-center rounded-none shadow-xl">
                    <Image
                      src="/pneu_borrachudo.png"
                      alt="Pneu Indicado"
                      fill
                      sizes="(max-width: 768px) 192px, 224px"
                      className="object-contain"
                    />
                  </div>
                </div>
                <a
                  href={getWhatsappLink(configs.whatsapp_numero, 'Olá! Vi o banner de Indicação Premiada no site e gostaria de saber como me cadastrar para indicar clientes e ganhar R$20 por pneu.')}
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
      )}

      {/* ═══ FOOTER PREMIUM ═══ */}
      <footer className="bg-[#09090B] border-t border-gray-900 pt-16 pb-12 text-gray-500 text-xs w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-gray-900/60">

            {/* Marca & Bio */}
            <div className="space-y-4 col-span-1 md:col-span-2">
              <div className="relative w-56 h-12 flex items-center justify-start">
                <img
                  src={configs.header_config.logo_url}
                  alt="iAlves Pneus"
                  className="h-full w-auto object-contain"
                />
              </div>
              <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
                Distribuidor especializado em pneus novos de alta performance e robustez extrema. Soluções de tração máxima para frotas de caminhões, ônibus e implementos rodoviários com o melhor custo-benefício do mercado.
              </p>
            </div>

            {/* Navegação */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-3 bg-[#DC2626] shrink-0"></span>
                <span className="text-white font-black uppercase tracking-wider text-[10px]">Navegação</span>
              </div>
              <ul className="space-y-2 font-bold">
                <li><a href="#vitrine-produtos" className="hover:text-[#DC2626] transition-colors">Vitrine de Pneus</a></li>
                {configs.whatsapp_numero.trim() && (
                  <li>
                    <a href={getWhatsappLink(configs.whatsapp_numero)} target="_blank" rel="noopener noreferrer" className="hover:text-[#DC2626] transition-colors">
                      Suporte Comercial
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* Redes Sociais */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-3 bg-[#DC2626] shrink-0"></span>
                <span className="text-white font-black uppercase tracking-wider text-[10px]">Redes Sociais</span>
              </div>
              <div className="flex flex-col gap-2 font-bold">
                {configs.footer_config.links_sociais.instagram.trim() && (
                  <a href={configs.footer_config.links_sociais.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#DC2626] transition-colors">
                    <span className="w-1.5 h-1.5 bg-gray-700 rounded-full"></span>Instagram
                  </a>
                )}
                {configs.footer_config.links_sociais.facebook.trim() && (
                  <a href={configs.footer_config.links_sociais.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#DC2626] transition-colors">
                    <span className="w-1.5 h-1.5 bg-gray-700 rounded-full"></span>Facebook
                  </a>
                )}
                {configs.footer_config.links_sociais.youtube.trim() && (
                  <a href={configs.footer_config.links_sociais.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#DC2626] transition-colors">
                    <span className="w-1.5 h-1.5 bg-gray-700 rounded-full"></span>YouTube
                  </a>
                )}
                {configs.footer_config.links_sociais.tiktok.trim() && (
                  <a href={configs.footer_config.links_sociais.tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#DC2626] transition-colors">
                    <span className="w-1.5 h-1.5 bg-gray-700 rounded-full"></span>TikTok
                  </a>
                )}
              </div>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              {configs.footer_config.direitos_reservados.trim() && (
                <p className="text-white font-extrabold text-[11px] uppercase tracking-wider">
                  {configs.footer_config.direitos_reservados.trim()}
                </p>
              )}
              <p className="text-[10px] tracking-wide uppercase text-gray-500 font-semibold">
                © {new Date().getFullYear()} {configs.footer_config.texto_rodape.trim() || 'Todos os direitos reservados.'}{configs.footer_config.cnpj.trim() && ` | CNPJ: ${configs.footer_config.cnpj.trim()}`}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-[#121214] border border-gray-800/80 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#22C55E]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
              <span>Conexão Segura SSL</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
