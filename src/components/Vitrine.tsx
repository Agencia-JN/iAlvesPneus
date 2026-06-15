'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getWhatsappLink } from '@/lib/utils';

// Tipo de dados técnica do pneu
export interface Pneu {
  id: string;
  nome: string;
  marca: string;
  categoria: 'Borrachudo' | 'Liso';
  medida: string;
  largura_mm: number;
  perfil_proporcao: number;
  aro_polegadas: string;
  sulco_mm: number;
  largura_cm: string;
  preco_vista: number;
  imagem_url: string;
  posicao_destaque: number;
  visibilidade?: 'publico' | 'oculto';
}

const MOCK_PNEUS: Pneu[] = [
  // ══════════════════════════════════════════════
  // Categoria Borrachudo — Medidas Variadas
  // ══════════════════════════════════════════════
  {
    id: 'b1',
    nome: 'ADVANCED',
    marca: 'ADVANCED',
    categoria: 'Borrachudo',
    medida: '295/80 R22.5',
    largura_mm: 295,
    perfil_proporcao: 80,
    aro_polegadas: '22.5',
    sulco_mm: 15,
    largura_cm: '23 cm',
    preco_vista: 1520.00,
    imagem_url: '/pneu_borrachudo.png',
    posicao_destaque: 10,
  },
  {
    id: 'b2',
    nome: 'WESTLAKE',
    marca: 'WESTLAKE',
    categoria: 'Borrachudo',
    medida: '295/80 R22.5',
    largura_mm: 295,
    perfil_proporcao: 80,
    aro_polegadas: '22.5',
    sulco_mm: 16,
    largura_cm: '23 cm',
    preco_vista: 1530.00,
    imagem_url: '/pneu_borrachudo.png',
    posicao_destaque: 9,
  },
  {
    id: 'b3',
    nome: 'DRC LS 741',
    marca: 'DRC',
    categoria: 'Borrachudo',
    medida: '295/80 R22.5',
    largura_mm: 295,
    perfil_proporcao: 80,
    aro_polegadas: '22.5',
    sulco_mm: 15,
    largura_cm: '23 cm',
    preco_vista: 1540.00,
    imagem_url: '/pneu_borrachudo.png',
    posicao_destaque: 8,
  },
  {
    id: 'b4',
    nome: 'XBRI FORZA PLUS F1',
    marca: 'XBRI',
    categoria: 'Borrachudo',
    medida: '295/80 R22.5',
    largura_mm: 295,
    perfil_proporcao: 80,
    aro_polegadas: '22.5',
    sulco_mm: 20,
    largura_cm: '26 cm',
    preco_vista: 1810.00,
    imagem_url: '/pneu_borrachudo.png',
    posicao_destaque: 7,
  },
  {
    id: 'b5',
    nome: 'ROYAL BLACK DV211',
    marca: 'ROYAL BLACK',
    categoria: 'Borrachudo',
    medida: '295/80 R22.5',
    largura_mm: 295,
    perfil_proporcao: 80,
    aro_polegadas: '22.5',
    sulco_mm: 20,
    largura_cm: '26,5 cm',
    preco_vista: 1850.00,
    imagem_url: '/pneu_borrachudo.png',
    posicao_destaque: 6,
  },
  // Borrachudos com medidas alternativas para demonstrar o filtro
  {
    id: 'b6',
    nome: 'LINGLONG D960',
    marca: 'LINGLONG',
    categoria: 'Borrachudo',
    medida: '275/80 R22.5',
    largura_mm: 275,
    perfil_proporcao: 80,
    aro_polegadas: '22.5',
    sulco_mm: 18,
    largura_cm: '22 cm',
    preco_vista: 1390.00,
    imagem_url: '/pneu_borrachudo.png',
    posicao_destaque: 5,
  },
  {
    id: 'b7',
    nome: 'APLUS T605',
    marca: 'APLUS',
    categoria: 'Borrachudo',
    medida: '275/80 R22.5',
    largura_mm: 275,
    perfil_proporcao: 80,
    aro_polegadas: '22.5',
    sulco_mm: 17,
    largura_cm: '22 cm',
    preco_vista: 1420.00,
    imagem_url: '/pneu_borrachudo.png',
    posicao_destaque: 4,
  },
  {
    id: 'b8',
    nome: 'ROADONE HF768',
    marca: 'ROADONE',
    categoria: 'Borrachudo',
    medida: '315/80 R22.5',
    largura_mm: 315,
    perfil_proporcao: 80,
    aro_polegadas: '22.5',
    sulco_mm: 22,
    largura_cm: '28 cm',
    preco_vista: 2150.00,
    imagem_url: '/pneu_borrachudo.png',
    posicao_destaque: 3,
  },
  // ══════════════════════════════════════════════
  // Categoria Liso — Medidas Variadas
  // ══════════════════════════════════════════════
  {
    id: 'l1',
    nome: 'SUPERCARGO',
    marca: 'SUPERCARGO',
    categoria: 'Liso',
    medida: '295/80 R22.5',
    largura_mm: 295,
    perfil_proporcao: 80,
    aro_polegadas: '22.5',
    sulco_mm: 15,
    largura_cm: '23 cm',
    preco_vista: 1380.00,
    imagem_url: '/pneu_liso.png',
    posicao_destaque: 10,
  },
  {
    id: 'l2',
    nome: 'SUNFULL 688',
    marca: 'SUNFULL',
    categoria: 'Liso',
    medida: '295/80 R22.5',
    largura_mm: 295,
    perfil_proporcao: 80,
    aro_polegadas: '22.5',
    sulco_mm: 16,
    largura_cm: '25 cm',
    preco_vista: 1430.00,
    imagem_url: '/pneu_liso.png',
    posicao_destaque: 9,
  },
  {
    id: 'l3',
    nome: 'DURABLE',
    marca: 'DURABLE',
    categoria: 'Liso',
    medida: '295/80 R22.5',
    largura_mm: 295,
    perfil_proporcao: 80,
    aro_polegadas: '22.5',
    sulco_mm: 16,
    largura_cm: '24 cm',
    preco_vista: 1450.00,
    imagem_url: '/pneu_liso.png',
    posicao_destaque: 8,
  },
  {
    id: 'l4',
    nome: 'XBRI ECOPLUS',
    marca: 'XBRI',
    categoria: 'Liso',
    medida: '295/80 R22.5',
    largura_mm: 295,
    perfil_proporcao: 80,
    aro_polegadas: '22.5',
    sulco_mm: 15,
    largura_cm: '23 cm',
    preco_vista: 1480.00,
    imagem_url: '/pneu_liso.png',
    posicao_destaque: 7,
  },
  {
    id: 'l5',
    nome: 'DRIVEFORCE',
    marca: 'DRIVEFORCE',
    categoria: 'Liso',
    medida: '295/80 R22.5',
    largura_mm: 295,
    perfil_proporcao: 80,
    aro_polegadas: '22.5',
    sulco_mm: 15,
    largura_cm: '23 cm',
    preco_vista: 1540.00,
    imagem_url: '/pneu_liso.png',
    posicao_destaque: 6,
  },
  {
    id: 'l6',
    nome: 'XBRI NEO CURVE',
    marca: 'XBRI',
    categoria: 'Liso',
    medida: '295/80 R22.5',
    largura_mm: 295,
    perfil_proporcao: 80,
    aro_polegadas: '22.5',
    sulco_mm: 16,
    largura_cm: '24 cm',
    preco_vista: 1680.00,
    imagem_url: '/pneu_liso.png',
    posicao_destaque: 5,
  },
  {
    id: 'l7',
    nome: 'XBRI CURVE PLUS',
    marca: 'XBRI',
    categoria: 'Liso',
    medida: '295/80 R22.5',
    largura_mm: 295,
    perfil_proporcao: 80,
    aro_polegadas: '22.5',
    sulco_mm: 17,
    largura_cm: '24 cm',
    preco_vista: 1690.00,
    imagem_url: '/pneu_liso.png',
    posicao_destaque: 4,
  },
  // Lisos com medidas alternativas para demonstrar o filtro
  {
    id: 'l8',
    nome: 'WINDFORCE WH1020',
    marca: 'WINDFORCE',
    categoria: 'Liso',
    medida: '275/80 R22.5',
    largura_mm: 275,
    perfil_proporcao: 80,
    aro_polegadas: '22.5',
    sulco_mm: 14,
    largura_cm: '22 cm',
    preco_vista: 1280.00,
    imagem_url: '/pneu_liso.png',
    posicao_destaque: 3,
  },
  {
    id: 'l9',
    nome: 'AEOLUS NEO ALLROADS S',
    marca: 'AEOLUS',
    categoria: 'Liso',
    medida: '315/80 R22.5',
    largura_mm: 315,
    perfil_proporcao: 80,
    aro_polegadas: '22.5',
    sulco_mm: 18,
    largura_cm: '27 cm',
    preco_vista: 1980.00,
    imagem_url: '/pneu_liso.png',
    posicao_destaque: 2,
  },
  {
    id: 'l10',
    nome: 'DOUBLE COIN RT500',
    marca: 'DOUBLE COIN',
    categoria: 'Liso',
    medida: '275/80 R22.5',
    largura_mm: 275,
    perfil_proporcao: 80,
    aro_polegadas: '22.5',
    sulco_mm: 15,
    largura_cm: '22 cm',
    preco_vista: 1350.00,
    imagem_url: '/pneu_liso.png',
    posicao_destaque: 1,
  },
];

const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export interface VitrineProps {
  avisoFreteAtivo?: boolean;
  // Dados passados pelo page.tsx (carregados em paralelo — sem query dupla)
  whatsappNumero?: string;
  pneusIniciais?: Pneu[];
  campanhaAfiliado?: boolean;
}

export default function Vitrine({
  avisoFreteAtivo = true,
  whatsappNumero: whatsappProp = '5511999999999',
  pneusIniciais = [],
  campanhaAfiliado = false,
}: VitrineProps) {
  const [categoria, setCategoria] = useState<'Borrachudo' | 'Liso'>('Borrachudo');
  // Usa pneus recebidos do parent; fallback para MOCK apenas se não foram passados
  const [pneus, setPneus] = useState<Pneu[]>(pneusIniciais.length > 0 ? pneusIniciais : MOCK_PNEUS);
  const whatsappNumero = whatsappProp;
  const campanhaAtiva = campanhaAfiliado;
  const [refParceiro, setRefParceiro] = useState<string | null>(null);

  // Sincroniza pneus quando o parent carrega dados do banco
  useEffect(() => {
    if (pneusIniciais && pneusIniciais.length > 0) {
      setPneus(pneusIniciais);
    }
  }, [pneusIniciais]);

  // Filtros de busca técnica aplicados
  const [buscaLargura, setBuscaLargura] = useState<string>('Todos');
  const [buscaPerfil, setBuscaPerfil] = useState<string>('Todos');
  const [buscaAro, setBuscaAro] = useState<string>('Todos');

  // Estados temporários para os seletores
  const [tempLargura, setTempLargura] = useState<string>('Todos');
  const [tempPerfil, setTempPerfil] = useState<string>('Todos');
  const [tempAro, setTempAro] = useState<string>('Todos');

  // 2. Captura o código de indicação do parceiro (?ref=) via client-side
  useEffect(() => {
    async function trackAffiliate() {
      if (typeof window === 'undefined') return;
      if (!campanhaAtiva) {
        setRefParceiro(null);
        return;
      }

      const params = new URLSearchParams(window.location.search);
      let ref = params.get('ref');

      // Se não há parâmetro na URL, tenta recuperar dos cookies/localStorage
      if (!ref) {
        ref = getCookie('afiliado_ref') || localStorage.getItem('afiliado_ref');
      }

      if (ref) {
        setRefParceiro(ref);
        sessionStorage.setItem('ref_parceiro', ref);

        if (isSupabaseConfigured()) {
          try {
            // Busca o afiliado correspondente ao código
            const { data: afiliado } = await supabase
              .from('afiliados')
              .select('id, ativo')
              .eq('codigo_ref', ref)
              .maybeSingle();

            if (afiliado && afiliado.ativo) {
              // Salva nos cookies e localStorage por 30 dias
              document.cookie = `afiliado_ref=${ref}; max-age=2592000; path=/; SameSite=Lax`;
              document.cookie = `afiliado_id=${afiliado.id}; max-age=2592000; path=/; SameSite=Lax`;
              localStorage.setItem('afiliado_ref', ref);
              localStorage.setItem('afiliado_id', afiliado.id);

              // Verifica se já registramos esse clique de link nesta sessão
              const jaRegistrado = sessionStorage.getItem(`clique_link_registrado_${ref}`);
              if (!jaRegistrado) {
                // Registra o evento de clique no link
                await supabase.from('afiliado_logs').insert({
                  afiliado_id: afiliado.id,
                  evento: 'clique_link'
                });
                sessionStorage.setItem(`clique_link_registrado_${ref}`, 'true');
              }
            }
          } catch (err) {
            console.error('Erro ao processar afiliado:', err);
          }
        }
      }
    }

    trackAffiliate();
  }, [campanhaAtiva]);

  // Extrai filtros disponíveis unicamente da base de pneus atual + opções padrão comerciais de carga pesada
  const largurasDisponiveis = Array.from(new Set([275, 295, 315, ...pneus.map((p) => p.largura_mm).filter(Boolean)])).sort((a, b) => a - b);
  const perfisDisponiveis = Array.from(new Set([70, 80, 85, ...pneus.map((p) => p.perfil_proporcao).filter(Boolean)])).sort((a, b) => a - b);
  const arosDisponiveis = Array.from(new Set(['22.5', ...pneus.map((p) => p.aro_polegadas).filter(Boolean)])).sort();

  // Filtra pneus por categoria e busca técnica
  const pneusFiltrados = pneus
    .filter((p) => p.categoria === categoria)
    .filter((p) => buscaLargura === 'Todos' || p.largura_mm === Number(buscaLargura))
    .filter((p) => buscaPerfil === 'Todos' || p.perfil_proporcao === Number(buscaPerfil))
    .filter((p) => buscaAro === 'Todos' || p.aro_polegadas === buscaAro)
    .sort((a, b) => b.posicao_destaque - a.posicao_destaque);

  // Função para aplicar os filtros de busca
  const handleAplicarFiltros = () => {
    setBuscaLargura(tempLargura);
    setBuscaPerfil(tempPerfil);
    setBuscaAro(tempAro);
  };

  // Limpa todos os filtros de busca
  const handleLimparFiltros = () => {
    setTempLargura('Todos');
    setTempPerfil('Todos');
    setTempAro('Todos');
    setBuscaLargura('Todos');
    setBuscaPerfil('Todos');
    setBuscaAro('Todos');
  };

  // 3. Função para gerar o link do WhatsApp parametrizado com indicações
  const handleComprarLink = (pneu: Pneu) => {
    const nomePneu = `${pneu.marca} - ${pneu.nome}`;
    const pneuMedida = pneu.largura_mm && pneu.perfil_proporcao && pneu.aro_polegadas
      ? `${pneu.largura_mm}/${pneu.perfil_proporcao} R${pneu.aro_polegadas}`
      : pneu.medida;
    const valorPreco = pneu.preco_vista.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    
    let pageUrl = '';
    if (typeof window !== 'undefined') {
      pageUrl = window.location.href;
    }

    let msg = `Olá! Tenho interesse no pneu ${nomePneu} de medida ${pneuMedida} pelo valor de ${valorPreco} que vi no site.\nLink: ${pageUrl}`;

    if (refParceiro) {
      msg += `\n[Indicação: ${refParceiro}]`;
    }

    return getWhatsappLink(whatsappNumero, msg);
  };

  return (
    <section className="pt-0 pb-8 sm:pb-16 md:pb-20 bg-[#0B0B0C]">
      {campanhaAtiva && refParceiro && (
        <div className="bg-[#DC2626]/10 border-b border-[#DC2626]/30 px-4 py-3 text-center text-xs font-black text-[#DC2626] uppercase tracking-wider flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-ping shrink-0"></span>
          <span>Navegando com indicação do parceiro: <strong className="text-white underline">{refParceiro}</strong></span>
        </div>
      )}
      
      {/* ═══ BUSCADOR POR MEDIDA MOBILE (Empilhado Nativo no fluxo, Estilo TireShop) ═══ */}
      <div className="block md:hidden w-full bg-[#121214] border-b border-gray-800/60 p-4 space-y-3">
        {/* Título do Buscador */}
        <h3 className="text-xs font-black uppercase tracking-wider text-white">
          BUSCA POR MEDIDA:
        </h3>
        
        {/* Grid de exatamente 3 colunas para os selects */}
        <div className="grid grid-cols-3 gap-2">
          {/* Largura */}
          <select
            value={tempLargura}
            onChange={(e) => setTempLargura(e.target.value)}
            className="w-full bg-black/40 border border-gray-700/40 text-white text-[11px] font-bold py-2.5 px-2 uppercase rounded-none focus:outline-none focus:border-[#DC2626] transition-colors cursor-pointer h-10"
          >
            <option value="Todos">Largura</option>
            {largurasDisponiveis.map((larg) => (
              <option key={larg} value={String(larg)}>{larg} mm</option>
            ))}
          </select>

          {/* Perfil */}
          <select
            value={tempPerfil}
            onChange={(e) => setTempPerfil(e.target.value)}
            className="w-full bg-black/40 border border-gray-700/40 text-white text-[11px] font-bold py-2.5 px-2 uppercase rounded-none focus:outline-none focus:border-[#DC2626] transition-colors cursor-pointer h-10"
          >
            <option value="Todos">Altura</option>
            {perfisDisponiveis.map((perf) => (
              <option key={perf} value={String(perf)}>{perf}%</option>
            ))}
          </select>

          {/* Aro */}
          <select
            value={tempAro}
            onChange={(e) => setTempAro(e.target.value)}
            className="w-full bg-black/40 border border-gray-700/40 text-white text-[11px] font-bold py-2.5 px-2 uppercase rounded-none focus:outline-none focus:border-[#DC2626] transition-colors cursor-pointer h-10"
          >
            <option value="Todos">Aro</option>
            {arosDisponiveis.map((aro) => (
              <option key={aro} value={String(aro)}>Aro {aro}</option>
            ))}
          </select>
        </div>

        {/* Botão Buscar w-full em Vermelho Industrial */}
        <button
          onClick={() => {
            handleAplicarFiltros();
            const el = document.getElementById('vitrine-listagem');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="w-full py-3 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-black uppercase text-xs tracking-wider transition-all rounded-none cursor-pointer flex items-center justify-center gap-2 border-0"
        >
          <span>Buscar</span>
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </button>
      </div>

      {/* ═══ BUSCADOR POR MEDIDA DESKTOP (Elegante Faixa Horizontal) ═══ */}
      <div className="hidden md:block w-full bg-[#121214]/65 backdrop-blur-md border-b border-gray-800/40 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 xl:px-24 w-full flex items-center justify-center">
          <div className="flex items-center justify-between gap-6 w-full">
            
            {/* Título inline no desktop */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-1 h-3.5 bg-[#DC2626]"></span>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                BUSCAR PNEUS POR MEDIDA
              </h3>
            </div>

            {/* Filtros: flex inline */}
            <div className="flex items-center gap-4 flex-1 justify-end w-full">
              
              {/* Largura */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Largura</label>
                <select
                  value={tempLargura}
                  onChange={(e) => setTempLargura(e.target.value)}
                  className="w-32 bg-black/40 border border-gray-700/40 text-white text-xs font-bold py-2 px-2 uppercase rounded-none focus:outline-none focus:border-[#DC2626] transition-colors cursor-pointer h-10"
                >
                  <option value="Todos">Todas</option>
                  {largurasDisponiveis.map((larg) => (
                    <option key={larg} value={String(larg)}>{larg} mm</option>
                  ))}
                </select>
              </div>

              {/* Perfil */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Perfil</label>
                <select
                  value={tempPerfil}
                  onChange={(e) => setTempPerfil(e.target.value)}
                  className="w-24 bg-black/40 border border-gray-700/40 text-white text-xs font-bold py-2 px-2 uppercase rounded-none focus:outline-none focus:border-[#DC2626] transition-colors cursor-pointer h-10"
                >
                  <option value="Todos">Todos</option>
                  {perfisDisponiveis.map((perf) => (
                    <option key={perf} value={String(perf)}>{perf}%</option>
                  ))}
                </select>
              </div>

              {/* Aro */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Aro</label>
                <select
                  value={tempAro}
                  onChange={(e) => setTempAro(e.target.value)}
                  className="w-24 bg-black/40 border border-gray-700/40 text-white text-xs font-bold py-2 px-2 uppercase rounded-none focus:outline-none focus:border-[#DC2626] transition-colors cursor-pointer h-10"
                >
                  <option value="Todos">Todos</option>
                  {arosDisponiveis.map((aro) => (
                    <option key={aro} value={String(aro)}>Aro {aro}</option>
                  ))}
                </select>
              </div>

              {/* Botão de busca / limpar */}
              <div className="self-end">
                <button
                  onClick={() => {
                    const alterado = tempLargura !== buscaLargura || tempPerfil !== buscaPerfil || tempAro !== buscaAro;
                    const temFiltroAtivo = buscaLargura !== 'Todos' || buscaPerfil !== 'Todos' || buscaAro !== 'Todos';
                    if (alterado || !temFiltroAtivo) {
                      handleAplicarFiltros();
                    } else {
                      handleLimparFiltros();
                    }
                  }}
                  className="py-2 px-5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-black uppercase text-xs tracking-wider transition-all rounded-none cursor-pointer h-10 flex items-center justify-center border-0"
                >
                  {tempLargura !== buscaLargura || tempPerfil !== buscaPerfil || tempAro !== buscaAro || (buscaLargura === 'Todos' && buscaPerfil === 'Todos' && buscaAro === 'Todos') ? 'BUSCAR' : 'LIMPAR FILTROS'}
                </button>
              </div>

            </div>

          </div>
        </div>
      </div>

      <div id="vitrine-listagem" className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 xl:px-24 mt-4 sm:mt-6 md:mt-8">

        {/* Seletor de Categoria + Contagem */}
        <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex gap-1.5 sm:gap-3">
            <button
              onClick={() => { setCategoria('Borrachudo'); handleLimparFiltros(); }}
              className={`px-3 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-wider cursor-pointer transition-all rounded-none border ${
                categoria === 'Borrachudo'
                  ? 'bg-[#DC2626] border-[#DC2626] text-white'
                  : 'bg-transparent border-gray-800 text-gray-500 hover:text-white hover:border-gray-600'
              }`}
            >
              Borrachudo
            </button>
            <button
              onClick={() => { setCategoria('Liso'); handleLimparFiltros(); }}
              className={`px-3 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-wider cursor-pointer transition-all rounded-none border ${
                categoria === 'Liso'
                  ? 'bg-[#DC2626] border-[#DC2626] text-white'
                  : 'bg-transparent border-gray-800 text-gray-500 hover:text-white hover:border-gray-600'
              }`}
            >
              Liso
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {(buscaLargura !== 'Todos' || buscaPerfil !== 'Todos' || buscaAro !== 'Todos') && (
              <button
                onClick={handleLimparFiltros}
                className="md:hidden text-[9px] text-[#DC2626] font-black uppercase tracking-wider bg-[#DC2626]/10 border border-[#DC2626]/20 px-2 py-1 cursor-pointer"
              >
                Limpar
              </button>
            )}
            <span className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase">
              <span className="text-[#DC2626]">{pneusFiltrados.length}</span> itens
            </span>
          </div>
        </div>

        {/* Título */}
        <h2 className="text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-4 sm:mb-6">
          {categoria.toUpperCase()}S{' '}
          <span className="text-[#DC2626]">
            {buscaLargura !== 'Todos' ? buscaLargura : '295'}/{buscaPerfil !== 'Todos' ? buscaPerfil : '80'} R{buscaAro !== 'Todos' ? buscaAro : '22.5'}
          </span>
        </h2>

        {pneusFiltrados.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-none border border-gray-800 max-w-2xl mx-auto my-8">
            <p className="text-lg text-[#DC2626] font-extrabold uppercase tracking-wider mb-2">
              Nenhum pneu encontrado para esta medida
            </p>
            <p className="text-gray-400 text-xs font-bold uppercase mb-6 leading-relaxed">
              Fale com nossos consultores no WhatsApp para consultar outras opções ou encomendar a medida desejada.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <a
                href={getWhatsappLink(whatsappNumero, `Olá! Estava buscando pneus na medida ${buscaLargura !== 'Todos' ? buscaLargura : '295'}/${buscaPerfil !== 'Todos' ? buscaPerfil : '80'} R${buscaAro !== 'Todos' ? buscaAro : '22.5'} e não encontrei no estoque. Vocês têm disponível para encomenda?`)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  const afiliadoId = getCookie('afiliado_id') || localStorage.getItem('afiliado_id');
                  if (campanhaAtiva && afiliadoId && isSupabaseConfigured()) {
                    supabase
                      .from('afiliado_logs')
                      .insert({ afiliado_id: afiliadoId, evento: 'clique_whatsapp' })
                      .then(() => {});
                  }
                }}
                className="px-6 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-white font-black uppercase text-xs tracking-widest transition-colors flex items-center gap-2 rounded-none"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.57 1.977 14.1 1.053 11.998 1.053c-5.444 0-9.87 4.372-9.874 9.802-.001 1.77.472 3.498 1.372 5.068L2.536 21.5l5.111-1.346zm10.748-5.321c-.281-.14-.165-.37-.842-.71-.165-.083-.289-.124-.413.062-.124.186-.48.601-.587.723-.107.122-.215.138-.496.002-.28-.138-1.185-.437-2.257-1.393-.834-.743-1.397-1.66-1.562-1.94-.165-.282-.018-.434.122-.573.126-.124.281-.328.422-.493.14-.166.187-.282.281-.469.094-.187.047-.352-.023-.493-.07-.14-.587-1.413-.805-1.942-.211-.515-.425-.443-.587-.451-.15-.008-.323-.01-.497-.01-.174 0-.458.065-.697.323-.24.258-.916.895-.916 2.182 0 1.287.937 2.531 1.068 2.707.13.176 1.84 2.809 4.459 3.941.623.27 1.11.43 1.488.55.627.2 1.2.172 1.65.105.503-.074 1.547-.633 1.765-1.246.219-.613.219-1.139.153-1.246-.067-.109-.244-.166-.525-.307z"/>
                </svg>
                <span>Falar no WhatsApp</span>
              </a>
              <button
                onClick={handleLimparFiltros}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-black uppercase text-xs tracking-widest transition-colors cursor-pointer rounded-none border border-gray-700"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-full overflow-hidden">
            {pneusFiltrados.map((pneu) => {
              // Regras de negócio de valores para alta conversão (estilo TireShop)
              const precoPix = pneu.preco_vista;
              const precoOriginal = precoPix * 1.15; // 15% de markup de tabela/cartão
              const valorParcelado = precoOriginal / 12; // Dividido em 12x
              
              const precoPixFormatado = precoPix.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              });
              const precoOriginalFormatado = precoOriginal.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              });
              const valorParceladoFormatado = valorParcelado.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              });

              return (
                <div
                  key={pneu.id}
                  className="glass-panel glass-panel-hover p-6 rounded-none flex flex-col justify-between relative group overflow-hidden border border-gray-800 hover:border-[#DC2626]/50 transition-all duration-300 w-full max-w-full"
                >
                  {/* Tag de Desconto Dinâmica Flutuante */}
                  <div className="absolute top-4 left-4 z-20 bg-[#DC2626] text-white text-[9px] font-black tracking-widest px-3 py-1.5 uppercase shadow-md shadow-[#DC2626]/20 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                    <span>15% OFF NO PIX</span>
                  </div>

                  {/* Glow decorativo de fundo no hover */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#DC2626]/5 blur-[60px] rounded-full group-hover:bg-[#DC2626]/10 transition-colors duration-500"></div>

                  <div>
                    {/* Categoria e Marca */}
                    <div className="flex items-center justify-between mb-4 mt-6 relative z-10">
                      <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest bg-white/5 px-2.5 py-1 border border-white/10">
                        {pneu.marca}
                      </span>
                      <span className="bg-[#DC2626]/10 text-[#DC2626] text-[9px] font-black tracking-widest px-2.5 py-1 uppercase border border-[#DC2626]/20">
                        {pneu.categoria}
                      </span>
                    </div>

                    {/* Imagem Técnica com Efeito de Flutuação */}
                    <div className="relative w-full h-56 bg-black/40 border border-white/5 flex items-center justify-center mb-6 overflow-hidden">
                      <Image
                        src={pneu.imagem_url}
                        alt={pneu.nome}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain p-6 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-2"
                      />
                    </div>

                    {/* Nome do Produto */}
                    <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2 leading-none">
                      {pneu.nome}
                    </h3>
                    
                    {/* Medida em Evidência (Estilo TireShop) */}
                    <div className="inline-block bg-white/5 border border-white/10 px-3 py-1.5 mb-4 w-full">
                      <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-wider">
                        Medida de Carga Altamente Recomendada:
                      </p>
                      <p className="text-sm text-white font-black uppercase mt-0.5 tracking-widest">
                        {pneu.largura_mm && pneu.perfil_proporcao && pneu.aro_polegadas
                          ? `${pneu.largura_mm}/${pneu.perfil_proporcao} R${pneu.aro_polegadas}`
                          : pneu.medida}
                      </p>
                    </div>

                    {/* Ficha Técnica */}
                    <div className="border-t border-white/5 pt-3 pb-4">
                      <table className="w-full text-xs font-bold uppercase text-gray-300">
                        <tbody>
                          <tr className="border-b border-white/5">
                            <td className="text-gray-500 py-1.5 font-bold">LARGURA NOMINAL</td>
                            <td className="text-white text-right py-1.5 font-black text-xs">
                              {pneu.largura_mm ? `${pneu.largura_mm} MM` : 'COMERCIAL'}
                            </td>
                          </tr>
                          <tr>
                            <td className="text-gray-500 py-1.5 font-bold">PROFUNDIDADE SULCO</td>
                            <td className="text-[#DC2626] text-right py-1.5 font-black text-xs">{pneu.sulco_mm} MM</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Preços Conversivos e Botão WhatsApp */}
                  <div className="border-t border-white/5 pt-4 mt-2">
                    <div className="space-y-1 mb-4">
                      <p suppressHydrationWarning={true} className="text-[10px] text-gray-500 font-bold uppercase tracking-wider line-through">
                        De: {precoOriginalFormatado}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[11px] text-[#DC2626] font-black uppercase tracking-wider">Por:</span>
                        <span suppressHydrationWarning={true} className="text-3xl font-black text-white tracking-tight leading-none">
                          {precoPixFormatado}
                        </span>
                        <span className="text-[9px] text-green-400 font-black uppercase tracking-widest bg-green-950/30 border border-green-900/30 px-1.5 py-0.5">
                          PIX
                        </span>
                      </div>
                      <p suppressHydrationWarning={true} className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                        ou <strong suppressHydrationWarning={true} className="text-white">12x de {valorParceladoFormatado}</strong> sem juros no cartão
                      </p>
                    </div>

                    <a
                      suppressHydrationWarning={true}
                      href={handleComprarLink(pneu)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        const afiliadoId = getCookie('afiliado_id') || localStorage.getItem('afiliado_id');
                        if (campanhaAtiva && afiliadoId && isSupabaseConfigured()) {
                          supabase
                            .from('afiliado_logs')
                            .insert({ afiliado_id: afiliadoId, evento: 'clique_whatsapp' })
                            .then(() => {});
                        }
                      }}
                      className="flex items-center justify-center w-full py-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-black uppercase text-xs tracking-widest transition-all duration-300 rounded-none shadow-lg shadow-[#DC2626]/10 group-hover:shadow-[#DC2626]/20 cursor-pointer border border-[#DC2626] hover:scale-[1.02]"
                    >
                      COMPRAR NO WHATSAPP
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Banner Inferior Informativo Sólido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-16">
          <div className="border border-gray-800/80 bg-black/40 p-6 flex items-center gap-4 rounded-none backdrop-blur-md">
            <div className="flex items-center justify-center w-12 h-12 border border-gray-850 bg-black text-[#DC2626] shrink-0 rounded-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p className="text-white font-black uppercase text-xs tracking-wider">Pronta Entrega</p>
              <p className="text-gray-400 text-xs mt-1 font-bold">Estoque local pronto para carregamento imediato.</p>
            </div>
          </div>

          <div className="border border-gray-800/80 bg-black/40 p-6 flex items-center gap-4 rounded-none backdrop-blur-md">
            <div className="flex items-center justify-center w-12 h-12 border border-gray-850 bg-black text-amber-500 shrink-0 rounded-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <div>
              <p className="text-white font-black uppercase text-xs tracking-wider">Sujeito a Disponibilidade</p>
              <p className="text-gray-400 text-xs mt-1 font-bold">Valores válidos enquanto durarem os estoques físicos.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
