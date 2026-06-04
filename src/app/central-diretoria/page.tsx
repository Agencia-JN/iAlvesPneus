'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { maskCurrency, maskWhatsapp, sanitizeWhatsapp, parseCurrencyInput, formatCurrency } from '@/lib/utils';
import { compressImageToWebp } from '@/lib/image-compressor';
import { Pneu as TypePneu } from '@/components/Vitrine';
import { Banner } from '@/components/BannerCarrossel';

// Interfaces de apoio para o Painel
interface LoginAudit {
  id: string;
  email: string;
  attempted_at: string;
  status: 'sucesso' | 'tentativa_bloqueada';
}

interface Configuracoes {
  whatsapp_numero: string;
  gemini_api_key: string;
  groq_api_key: string;
  campanha_afiliados_ativa: boolean;
  imagem_fallback_url: string;
  horarios_postagem: string[];
  hero_titulo?: string;
  hero_subtitulo?: string;
  instagram_url?: string;
  facebook_url?: string;
  youtube_url?: string;
  tiktok_url?: string;
  texto_rodape?: string;
  aviso_topo_frete?: string;
  aviso_topo_frete_ativo?: boolean;
  cnpj?: string;
  direitos_reservados?: string;
}

interface Afiliado {
  id: string;
  nome_parceiro: string;
  codigo_ref: string;
  ativo: boolean;
}

export default function CentralDiretoria() {
  const router = useRouter();

  // Estados de carregamento e autenticação
  const [supabaseActive, setSupabaseActive] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  // Estados de dados da Diretoria
  const [activeTab, setActiveTab] = useState<'pneus' | 'banners' | 'configuracoes' | 'afiliados' | 'auditoria'>('pneus');
  const [pneus, setPneus] = useState<TypePneu[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [audits, setAudits] = useState<LoginAudit[]>([]);
  const [afiliados, setAfiliados] = useState<Afiliado[]>([]);
  
  const [configs, setConfigs] = useState<Configuracoes>({
    whatsapp_numero: '(11) 99999-9999',
    gemini_api_key: '',
    groq_api_key: '',
    campanha_afiliados_ativa: false,
    imagem_fallback_url: 'https://placehold.co/800x600/0B0B0C/white?text=iAlves+Pneus',
    horarios_postagem: ['08:00', '14:00', '20:00'],
    hero_titulo: 'ROBUSTEZ EXTREMA',
    hero_subtitulo: 'Fornecimento direto de pneus novos de alta durabilidade e máxima tração.',
    instagram_url: 'https://instagram.com/ialvespneus',
    facebook_url: 'https://facebook.com/ialvespneus',
    youtube_url: '',
    tiktok_url: '',
    texto_rodape: 'Valores anunciados sujeitos a alteração sem aviso prévio. Imagens meramente ilustrativas de catálogo.',
    aviso_topo_frete: '🔥 OFERTA DE INAUGURAÇÃO: FRETE GRÁTIS PARA COMPRAS ACIMA DE 4 PNEUS!',
    aviso_topo_frete_ativo: true,
    cnpj: '00.000.000/0001-00',
    direitos_reservados: 'iAlves Pneus'
  });

  // Estados de Modais e CRUD (Pneus)
  const [showPneuModal, setShowPneuModal] = useState(false);
  const [editingPneu, setEditingPneu] = useState<TypePneu | null>(null);
  const [pneuForm, setPneuForm] = useState({
    nome: '',
    marca: '',
    categoria: 'Borrachudo' as 'Borrachudo' | 'Liso',
    largura_mm: '295',
    perfil_proporcao: '80',
    aro_polegadas: '22.5',
    sulco_mm: '15.0',
    preco_vista: 'R$ 0,00',
    imagem_file: null as File | null,
    imagem_url: '',
    visibilidade: 'publico' as 'publico' | 'oculto',
    posicao_destaque: '0',
  });

  // Estados de Modais e CRUD (Banners)
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerForm, setBannerForm] = useState({
    imagem_file: null as File | null,
    imagem_url: '',
    link_redirecionamento: '',
    ativo: true,
    ordem: '0',
  });

  // Estado para adicionar Afiliado rápido
  const [novoAfiliado, setNovoAfiliado] = useState({ nome_parceiro: '', codigo_ref: '' });

  // Mensagens de status
  const [statusMsg, setStatusMsg] = useState<{ type: 'sucesso' | 'erro'; text: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Referências dos inputs de arquivos
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  // Mapeia chaves reais configuradas
  useEffect(() => {
    const isConfigured = isSupabaseConfigured();
    setSupabaseActive(isConfigured);
    
    if (!isConfigured) {
      setLoading(false);
    } else {
      checkAuth();
    }
  }, []);

  // Sincroniza estados modificados no Modo Demo diretamente no localStorage
  useEffect(() => {
    if (isDemo && typeof window !== 'undefined' && pneus.length > 0) {
      localStorage.setItem('pneus_demo', JSON.stringify(pneus));
    }
  }, [pneus, isDemo]);

  useEffect(() => {
    if (isDemo && typeof window !== 'undefined' && banners.length > 0) {
      localStorage.setItem('banners_demo', JSON.stringify(banners));
    }
  }, [banners, isDemo]);

  useEffect(() => {
    if (isDemo && typeof window !== 'undefined' && afiliados.length > 0) {
      localStorage.setItem('afiliados_demo', JSON.stringify(afiliados));
    }
  }, [afiliados, isDemo]);

  // 1. Fluxo de Autenticação Rígido com Google OAuth + Auditoria
  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      const email = session.user?.email;
      if (!email) {
        handleLogout();
        return;
      }

      setUserEmail(email);

      // Consulta se o e-mail consta na lista autorizada
      const { data: allowedUser, error: allowedError } = await supabase
        .from('allowed_users')
        .select('*')
        .eq('email', email)
        .single();

      if (allowedError || !allowedUser) {
        // Bloqueio Rígido: Registra tentativa suspeita
        await supabase.from('login_audits').insert({
          email: email,
          status: 'tentativa_bloqueada',
        });
        
        await supabase.auth.signOut();
        router.push('/central-diretoria/bloqueado');
      } else {
        // Acesso Permitido: Registra auditoria de sucesso
        await supabase.from('login_audits').insert({
          email: email,
          status: 'sucesso',
        });
        setAuthorized(true);
        loadDatabaseData();
      }
    } catch (e) {
      console.error('Falha de verificação de segurança:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!supabaseActive) {
      alert('Supabase não configurado no .env.local.');
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/central-diretoria`,
      },
    });
  };

  const handleDemoMode = () => {
    setIsDemo(true);
    setAuthorized(true);
    setUserEmail('diretoria.demonstracao@ialves.com');
    loadMockData();
  };

  const loadMockData = () => {
    let mockPneus: TypePneu[] = [
      {
        id: '1',
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
        posicao_destaque: 10,
      },
      {
        id: '2',
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
        posicao_destaque: 5,
      }
    ];

    let mockBanners: Banner[] = [
      {
        id: '1',
        imagem_url: '/2.jpeg',
        link_redirecionamento: '#vitrine-produtos',
        ativo: true,
        ordem: 1,
        titulo_sobreposto: 'ROBUSTEZ INDUSTRIAL EXTREMA',
        subtitulo_sobreposto: 'Pneus novos de alta performance e máxima tração para frotas pesadas.',
        botao_texto: 'Ver Estoque Comercial'
      },
      {
        id: '2',
        imagem_url: '/3.jpeg',
        link_redirecionamento: '#vitrine-produtos',
        ativo: true,
        ordem: 2,
        titulo_sobreposto: 'DESCONTOS AGRESSIVOS NO PIX',
        subtitulo_sobreposto: 'Parcerias diretas para transportadoras e grandes frotistas.',
        botao_texto: 'Cotar WhatsApp'
      }
    ];

    let mockAudits: LoginAudit[] = [
      { id: '1', email: 'nilson.brites@gmail.com', attempted_at: new Date().toISOString(), status: 'sucesso' },
      { id: '2', email: 'invasor.desconhecido@yahoo.com', attempted_at: new Date().toISOString(), status: 'tentativa_bloqueada' }
    ];

    let mockAfiliados: Afiliado[] = [
      { id: 'a1', nome_parceiro: 'Marcos Caminhoneiro', codigo_ref: 'marcos20', ativo: true },
      { id: 'a2', nome_parceiro: 'Posto de Molas Rota Leste', codigo_ref: 'rotaleste', ativo: true }
    ];

    if (typeof window !== 'undefined') {
      const cachedPneus = localStorage.getItem('pneus_demo');
      const cachedBanners = localStorage.getItem('banners_demo');
      const cachedConfigs = localStorage.getItem('configs_demo');
      const cachedAfiliados = localStorage.getItem('afiliados_demo');

      if (cachedPneus) {
        try { mockPneus = JSON.parse(cachedPneus); } catch (e) { console.error(e); }
      } else {
        localStorage.setItem('pneus_demo', JSON.stringify(mockPneus));
      }

      if (cachedBanners) {
        try { mockBanners = JSON.parse(cachedBanners); } catch (e) { console.error(e); }
      } else {
        localStorage.setItem('banners_demo', JSON.stringify(mockBanners));
      }

      if (cachedAfiliados) {
        try { mockAfiliados = JSON.parse(cachedAfiliados); } catch (e) { console.error(e); }
      } else {
        localStorage.setItem('afiliados_demo', JSON.stringify(mockAfiliados));
      }

      if (cachedConfigs) {
        try {
          const conf = JSON.parse(cachedConfigs);
          setConfigs(conf);
        } catch (e) { console.error(e); }
      } else {
        localStorage.setItem('configs_demo', JSON.stringify(configs));
      }
    }

    setPneus(mockPneus);
    setBanners(mockBanners);
    setAudits(mockAudits);
    setAfiliados(mockAfiliados);
    setLoading(false);
  };

  const loadDatabaseData = async () => {
    try {
      // 1. Pneus
      const { data: pneusData } = await supabase.from('pneus').select('*').order('posicao_destaque', { ascending: false });
      if (pneusData) {
        setPneus(pneusData.map((p: any) => ({
          ...p,
          largura_mm: p.largura_mm ? Number(p.largura_mm) : 295,
          perfil_proporcao: p.perfil_proporcao ? Number(p.perfil_proporcao) : 80,
          aro_polegadas: p.aro_polegadas || '22.5',
          sulco_mm: Number(p.sulco_mm),
          preco_vista: Number(p.preco_vista),
        })));
      }

      // 2. Banners
      const { data: bannersData } = await supabase.from('banners').select('*').order('ordem', { ascending: true });
      if (bannersData) {
        setBanners(bannersData);
      }
      
      // 3. Auditoria
      const { data: auditsData } = await supabase.from('login_audits').select('*').order('attempted_at', { ascending: false }).limit(20);
      if (auditsData) setAudits(auditsData);

      // 4. Afiliados
      const { data: afiliadosData } = await supabase.from('afiliados').select('*').order('nome_parceiro', { ascending: true });
      if (afiliadosData) setAfiliados(afiliadosData);

      // 5. Configurações
      const { data: configData } = await supabase.from('configuracoes').select('*').eq('id', 1).single();
      if (configData) {
        setConfigs({
          whatsapp_numero: maskWhatsapp(configData.whatsapp_numero),
          gemini_api_key: configData.gemini_api_key || '',
          groq_api_key: configData.groq_api_key || '',
          campanha_afiliados_ativa: configData.campanha_afiliados_ativa,
          imagem_fallback_url: configData.imagem_fallback_url,
          horarios_postagem: configData.horarios_postagem || [],
          hero_titulo: configData.hero_titulo || 'ROBUSTEZ EXTREMA',
          hero_subtitulo: configData.hero_subtitulo || '',
          instagram_url: configData.instagram_url || '',
          facebook_url: configData.facebook_url || '',
          youtube_url: configData.youtube_url || '',
          tiktok_url: configData.tiktok_url || '',
          texto_rodape: configData.texto_rodape || '',
          aviso_topo_frete: configData.aviso_topo_frete || '',
          aviso_topo_frete_ativo: configData.aviso_topo_frete_ativo !== undefined ? configData.aviso_topo_frete_ativo : true,
          cnpj: configData.cnpj || '',
          direitos_reservados: configData.direitos_reservados || '',
        });
      }
    } catch (e) {
      console.error('Erro ao carregar dados do Supabase:', e);
    }
  };

  const handleLogout = async () => {
    if (supabaseActive) {
      await supabase.auth.signOut();
    }
    setUserEmail(null);
    setAuthorized(false);
    setIsDemo(false);
  };

  // 2. Manipulação de Inputs de Formulário
  const handlePneuPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPneuForm({ ...pneuForm, preco_vista: maskCurrency(e.target.value) });
  };

  const handleConfigPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfigs({ ...configs, whatsapp_numero: maskWhatsapp(e.target.value) });
  };

  // Compressão Nativa WebP (Pneu)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatusMsg(null);

    try {
      const compressedBlob = await compressImageToWebp(file, 0.85);
      const compressedFile = new File([compressedBlob], `compressed_${Date.now()}.webp`, {
        type: 'image/webp',
      });

      setPneuForm({
        ...pneuForm,
        imagem_file: compressedFile,
        imagem_url: URL.createObjectURL(compressedBlob),
      });

      setStatusMsg({ type: 'sucesso', text: `Foto comprimida para WebP! (${(compressedFile.size / 1024).toFixed(1)} KB)` });
    } catch (err: any) {
      setStatusMsg({ type: 'erro', text: err.message || 'Erro ao comprimir imagem.' });
    } finally {
      setIsUploading(false);
    }
  };

  // Compressão Nativa WebP (Banner)
  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatusMsg(null);

    try {
      const compressedBlob = await compressImageToWebp(file, 0.85);
      const compressedFile = new File([compressedBlob], `banner_${Date.now()}.webp`, {
        type: 'image/webp',
      });

      setBannerForm({
        ...bannerForm,
        imagem_file: compressedFile,
        imagem_url: URL.createObjectURL(compressedBlob),
      });

      setStatusMsg({ type: 'sucesso', text: `Banner comprimido para WebP! (${(compressedFile.size / 1024).toFixed(1)} KB)` });
    } catch (err: any) {
      setStatusMsg({ type: 'erro', text: err.message || 'Erro ao comprimir banner.' });
    } finally {
      setIsUploading(false);
    }
  };

  // 3. Salvamento de Pneus
  const savePneu = async (e: React.FormEvent) => {
    e.preventDefault();

    const nomeClean = pneuForm.nome.trim();
    const marcaClean = pneuForm.marca.trim();
    const larguraClean = parseInt(pneuForm.largura_mm) || 295;
    const perfilClean = parseInt(pneuForm.perfil_proporcao) || 80;
    const aroClean = pneuForm.aro_polegadas.trim();
    const sulcoClean = parseFloat(pneuForm.sulco_mm);
    const precoClean = parseCurrencyInput(pneuForm.preco_vista);
    const destaqueClean = parseInt(pneuForm.posicao_destaque) || 0;

    // Medida combinada para manter compatibilidade e exibição fallback
    const medidaClean = `${larguraClean}/${perfilClean} R${aroClean}`;

    if (nomeClean.length < 3 || nomeClean.length > 100) {
      alert('Nome/Marca deve conter entre 3 e 100 caracteres.');
      return;
    }
    if (precoClean <= 0) {
      alert('O preço à vista deve ser maior que R$ 0,00.');
      return;
    }
    if (sulcoClean <= 0 || isNaN(sulcoClean)) {
      alert('A profundidade de sulco deve ser maior que 0 mm.');
      return;
    }
    if (!aroClean) {
      alert('O aro polegadas é obrigatório.');
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = pneuForm.imagem_url || '/pneu_borrachudo.png';

      if (supabaseActive && !isDemo && pneuForm.imagem_file) {
        const fileExt = 'webp';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `produtos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('pneus')
          .upload(filePath, pneuForm.imagem_file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('pneus').getPublicUrl(filePath);
        finalImageUrl = publicUrlData.publicUrl;
      }

      const pneuData = {
        nome: nomeClean,
        marca: marcaClean,
        categoria: pneuForm.categoria,
        medida: medidaClean,
        largura_mm: larguraClean,
        perfil_proporcao: perfilClean,
        aro_polegadas: aroClean,
        sulco_mm: sulcoClean,
        preco_vista: precoClean,
        imagem_url: finalImageUrl,
        visibilidade: pneuForm.visibilidade,
        posicao_destaque: destaqueClean,
      };

      if (isDemo) {
        if (editingPneu) {
          setPneus(pneus.map((p) => (p.id === editingPneu.id ? { ...p, ...pneuData, id: p.id, largura_cm: '24 cm' } : p)));
        } else {
          setPneus([...pneus, { ...pneuData, id: String(Date.now()), largura_cm: '24 cm' }]);
        }
      } else {
        if (editingPneu) {
          const { error } = await supabase.from('pneus').update(pneuData).eq('id', editingPneu.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('pneus').insert(pneuData);
          if (error) throw error;
        }
        await loadDatabaseData();
      }

      setShowPneuModal(false);
      setEditingPneu(null);
      resetPneuForm();
      setStatusMsg({ type: 'sucesso', text: 'Pneu gravado com sucesso no estoque!' });
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: 'erro', text: 'Falha ao salvar produto no estoque real.' });
    } finally {
      setLoading(false);
    }
  };

  const deletePneu = async (id: string) => {
    if (!confirm('Deseja realmente excluir este pneu permanentemente? Isso removerá o arquivo do Storage.')) return;

    setLoading(true);

    try {
      const pneuToDelete = pneus.find((p) => p.id === id);

      if (isDemo) {
        setPneus(pneus.filter((p) => p.id !== id));
      } else {
        if (pneuToDelete?.imagem_url && pneuToDelete.imagem_url.includes('/storage/v1/object/public/pneus/')) {
          const relativePath = pneuToDelete.imagem_url.split('/pneus/')[1];
          if (relativePath) {
            await supabase.storage.from('pneus').remove([relativePath]);
          }
        }

        const { error } = await supabase.from('pneus').delete().eq('id', id);
        if (error) throw error;

        await loadDatabaseData();
      }

      setStatusMsg({ type: 'sucesso', text: 'Pneu eliminado com sucesso!' });
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: 'erro', text: 'Erro ao remover pneu de forma sincronizada.' });
    } finally {
      setLoading(false);
    }
  };

  // 4. CRUD de Banners Rotativos
  const saveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = bannerForm.imagem_url;

      if (supabaseActive && !isDemo && bannerForm.imagem_file) {
        const fileExt = 'webp';
        const fileName = `${Date.now()}_banner_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `banners/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('pneus')
          .upload(filePath, bannerForm.imagem_file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('pneus').getPublicUrl(filePath);
        finalImageUrl = publicUrlData.publicUrl;
      }

      if (!finalImageUrl) {
        alert('Carregue uma imagem para o banner promocional.');
        setLoading(false);
        return;
      }

      const bannerData = {
        imagem_url: finalImageUrl,
        link_redirecionamento: bannerForm.link_redirecionamento.trim(),
        ativo: bannerForm.ativo,
        ordem: parseInt(bannerForm.ordem) || 0,
      };

      if (isDemo) {
        if (editingBanner) {
          setBanners(banners.map((b) => (b.id === editingBanner.id ? { ...b, ...bannerData } : b)));
        } else {
          setBanners([...banners, { ...bannerData, id: String(Date.now()) }]);
        }
      } else {
        if (editingBanner) {
          const { error } = await supabase.from('banners').update(bannerData).eq('id', editingBanner.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('banners').insert(bannerData);
          if (error) throw error;
        }
        await loadDatabaseData();
      }

      setShowBannerModal(false);
      setEditingBanner(null);
      resetBannerForm();
      setStatusMsg({ type: 'sucesso', text: 'Banner rotativo gravado com sucesso!' });
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: 'erro', text: 'Erro ao salvar banner promocional.' });
    } finally {
      setLoading(false);
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('Excluir este banner rotativo permanentemente?')) return;
    setLoading(true);

    try {
      const bannerToDelete = banners.find((b) => b.id === id);

      if (isDemo) {
        setBanners(banners.filter((b) => b.id !== id));
      } else {
        if (bannerToDelete?.imagem_url && bannerToDelete.imagem_url.includes('/storage/v1/object/public/pneus/')) {
          const relativePath = bannerToDelete.imagem_url.split('/pneus/')[1];
          if (relativePath) {
            await supabase.storage.from('pneus').remove([relativePath]);
          }
        }

        const { error } = await supabase.from('banners').delete().eq('id', id);
        if (error) throw error;

        await loadDatabaseData();
      }

      setStatusMsg({ type: 'sucesso', text: 'Banner rotativo deletado da base e do Storage!' });
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'erro', text: 'Erro ao remover banner.' });
    } finally {
      setLoading(false);
    }
  };

  const toggleBannerStatus = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      if (isDemo) {
        setBanners(banners.map((b) => (b.id === id ? { ...b, ativo: !currentStatus } : b)));
      } else {
        const { error } = await supabase.from('banners').update({ ativo: !currentStatus }).eq('id', id);
        if (error) throw error;
        await loadDatabaseData();
      }
      setStatusMsg({ type: 'sucesso', text: 'Status de ativação do banner alterado!' });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Salvar configurações gerais (incluindo novos campos do site)
  const saveConfigs = async (e: React.FormEvent) => {
    e.preventDefault();

    const numericPhone = sanitizeWhatsapp(configs.whatsapp_numero);
    if (numericPhone.length !== 13) {
      alert('Número deve conter 11 dígitos com DDD. Ex: (11) 99999-9999.');
      return;
    }

    setLoading(true);

    try {
      if (isDemo) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('configs_demo', JSON.stringify(configs));
        }
        setStatusMsg({ type: 'sucesso', text: 'Configurações simuladas gravadas localmente!' });
      } else {
        // Tenta fazer o update completo com os novos campos
        const payload: any = {
          whatsapp_numero: numericPhone,
          gemini_api_key: configs.gemini_api_key.trim(),
          groq_api_key: configs.groq_api_key.trim(),
          campanha_afiliados_ativa: configs.campanha_afiliados_ativa,
          imagem_fallback_url: configs.imagem_fallback_url.trim(),
          hero_titulo: configs.hero_titulo?.trim(),
          hero_subtitulo: configs.hero_subtitulo?.trim(),
          instagram_url: configs.instagram_url?.trim(),
          facebook_url: configs.facebook_url?.trim(),
          youtube_url: configs.youtube_url?.trim(),
          tiktok_url: configs.tiktok_url?.trim(),
          texto_rodape: configs.texto_rodape?.trim(),
          aviso_topo_frete: configs.aviso_topo_frete?.trim(),
          aviso_topo_frete_ativo: configs.aviso_topo_frete_ativo,
          cnpj: configs.cnpj?.trim(),
          direitos_reservados: configs.direitos_reservados?.trim(),
        };

        let { error } = await supabase.from('configuracoes').update(payload).eq('id', 1);
        
        // Se der erro de coluna ausente (código 42703 no PostgreSQL)
        if (error && (error.code === '42703' || error.message?.includes('column') || error.message?.includes('does not exist'))) {
          console.warn('Novas colunas ausentes no Supabase. Atualizando apenas campos padrão...');
          const legacyPayload = {
            whatsapp_numero: numericPhone,
            gemini_api_key: configs.gemini_api_key.trim(),
            groq_api_key: configs.groq_api_key.trim(),
            campanha_afiliados_ativa: configs.campanha_afiliados_ativa,
            imagem_fallback_url: configs.imagem_fallback_url.trim(),
            hero_titulo: configs.hero_titulo?.trim(),
            hero_subtitulo: configs.hero_subtitulo?.trim(),
            instagram_url: configs.instagram_url?.trim(),
            facebook_url: configs.facebook_url?.trim(),
            texto_rodape: configs.texto_rodape?.trim(),
            aviso_topo_frete: configs.aviso_topo_frete?.trim(),
          };
          const { error: retryError } = await supabase.from('configuracoes').update(legacyPayload).eq('id', 1);
          if (retryError) throw retryError;
          
          setStatusMsg({ 
            type: 'sucesso', 
            text: 'Configurações salvas! Nota: Para pleno aproveitamento, crie as novas colunas (youtube_url, tiktok_url, cnpj, direitos_reservados, aviso_topo_frete_ativo) no seu painel do Supabase.' 
          });
        } else if (error) {
          throw error;
        } else {
          setStatusMsg({ type: 'sucesso', text: 'Configurações globais salvas no banco Supabase!' });
        }
        await loadDatabaseData();
      }
    } catch (e) {
      console.error(e);
      setStatusMsg({ type: 'erro', text: 'Erro ao salvar configurações.' });
    } finally {
      setLoading(false);
    }
  };

  // Salvar Afiliado
  const addAfiliado = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = novoAfiliado.nome_parceiro.trim();
    const code = novoAfiliado.codigo_ref.trim().toLowerCase().replace(/\s+/g, '-');

    if (!name || !code) {
      alert('Preencha o nome do parceiro e o código da indicação.');
      return;
    }

    setLoading(true);

    try {
      if (isDemo) {
        setAfiliados([...afiliados, { id: String(Date.now()), nome_parceiro: name, codigo_ref: code, ativo: true }]);
      } else {
        const { error } = await supabase.from('afiliados').insert({
          nome_parceiro: name,
          codigo_ref: code,
        });
        if (error) throw error;
        await loadDatabaseData();
      }

      setNovoAfiliado({ nome_parceiro: '', codigo_ref: '' });
      setStatusMsg({ type: 'sucesso', text: 'Afiliado cadastrado com sucesso!' });
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: 'erro', text: 'Código de afiliado já existente.' });
    } finally {
      setLoading(false);
    }
  };

  const toggleAfiliado = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      if (isDemo) {
        setAfiliados(afiliados.map((a) => (a.id === id ? { ...a, ativo: !currentStatus } : a)));
      } else {
        const { error } = await supabase.from('afiliados').update({ ativo: !currentStatus }).eq('id', id);
        if (error) throw error;
        await loadDatabaseData();
      }
      setStatusMsg({ type: 'sucesso', text: 'Status do afiliado alterado!' });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Resets e Modais
  const resetPneuForm = () => {
    setPneuForm({
      nome: '',
      marca: '',
      categoria: 'Borrachudo',
      largura_mm: '295',
      perfil_proporcao: '80',
      aro_polegadas: '22.5',
      sulco_mm: '15.0',
      preco_vista: 'R$ 0,00',
      imagem_file: null,
      imagem_url: '',
      visibilidade: 'publico',
      posicao_destaque: '0',
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetBannerForm = () => {
    setBannerForm({
      imagem_file: null,
      imagem_url: '',
      link_redirecionamento: '',
      ativo: true,
      ordem: '0',
    });
    if (bannerFileInputRef.current) bannerFileInputRef.current.value = '';
  };

  const openEditModal = (pneu: TypePneu) => {
    setEditingPneu(pneu);
    setPneuForm({
      nome: pneu.nome,
      marca: pneu.marca,
      categoria: pneu.categoria,
      largura_mm: String(pneu.largura_mm || 295),
      perfil_proporcao: String(pneu.perfil_proporcao || 80),
      aro_polegadas: String(pneu.aro_polegadas || '22.5'),
      sulco_mm: String(pneu.sulco_mm),
      preco_vista: pneu.preco_vista.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      imagem_file: null,
      imagem_url: pneu.imagem_url,
      visibilidade: pneu.visibilidade || 'publico',
      posicao_destaque: String(pneu.posicao_destaque || 0),
    });
    setShowPneuModal(true);
  };

  const openBannerEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setBannerForm({
      imagem_file: null,
      imagem_url: banner.imagem_url,
      link_redirecionamento: banner.link_redirecionamento || '',
      ativo: banner.ativo,
      ordem: String(banner.ordem || 0),
    });
    setShowBannerModal(true);
  };

  // Interface de Login caso não esteja autenticado
  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex flex-col items-center justify-center p-4 relative selection:bg-[#E11D48] selection:text-white">
        <div className="absolute w-[400px] h-[400px] bg-[#E11D48]/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="glass-panel max-w-md w-full p-8 sm:p-10 rounded-none border-t-4 border-t-[#E11D48] relative z-10 text-center space-y-8">
          <div className="space-y-2">
            <div className="relative w-64 h-16 overflow-hidden bg-black mx-auto">
              <Image src="/logoiAlves.png" alt="iAlves Pneus Logo" fill className="object-contain" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-white mt-4">
              CENTRAL DA <span className="text-[#E11D48]">DIRETORIA</span>
            </h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Ecossistema iAlves Pneus</p>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="w-8 h-8 border-4 border-[#E11D48] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <button
                  onClick={handleGoogleLogin}
                  className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-white hover:bg-gray-100 text-black font-extrabold uppercase text-xs tracking-wider transition-all duration-300 rounded-none cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.03-5.136 4.03-3.324 0-6.028-2.704-6.028-6.028s2.704-6.028 6.028-6.028c1.554 0 2.964.593 4.03 1.554l3.11-3.11C19.066.822 15.855 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c6.82 0 12.24-5.42 12.24-12.24 0-.74-.08-1.46-.22-2.155H12.24z"
                    />
                  </svg>
                  Entrar com o Google
                </button>

                <div className="relative flex items-center justify-center py-2">
                  <div className="absolute w-full h-[1px] bg-gray-900"></div>
                  <span className="relative z-10 bg-[#0B0B0C] px-3 text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                    Ou teste localmente
                  </span>
                </div>

                <button
                  onClick={handleDemoMode}
                  className="w-full py-3.5 border border-gray-800 hover:border-gray-600 bg-white/5 hover:bg-white/10 text-white font-extrabold uppercase text-[11px] tracking-widest transition-all duration-300 rounded-none cursor-pointer"
                >
                  Ativar Modo Demonstrativo
                </button>
              </>
            )}
          </div>

          <div className="text-[10px] text-gray-600 font-bold uppercase tracking-wide leading-relaxed pt-4 border-t border-gray-950">
            Apenas e-mails autenticados e permitidos possuem acesso a este painel administrativo.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] flex flex-col selection:bg-[#E11D48] selection:text-white">
      
      {/* Topbar do Administrador */}
      <header className="border-b border-gray-900 bg-black/60 backdrop-blur-md px-6 py-4 flex items-center justify-between z-40 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="relative w-44 h-11 overflow-hidden bg-black shrink-0">
            <Image src="/logoiAlves.png" alt="iAlves Logo" fill className="object-contain" />
          </div>
          <div>
            <h1 className="text-base font-black uppercase tracking-widest text-white leading-none">
              Diretoria <span className="text-[#E11D48]">iAlves</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
              PAINEL ADMINISTRATIVO {isDemo && <span className="text-amber-500 font-black">[MODO DEMO]</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-block text-xs text-gray-400 font-bold">
            Conectado: <span className="text-white">{userEmail}</span>
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-red-950 bg-red-950/20 hover:bg-[#E11D48] text-white hover:text-white text-xs font-black uppercase tracking-widest transition-all duration-300 rounded-none cursor-pointer"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Grid Principal do Painel */}
      <div className="flex flex-col lg:flex-row flex-1 font-sans">
        
        {/* Barra Lateral de Menus */}
        <aside className="w-full lg:w-64 bg-black/20 border-r border-gray-900 shrink-0 p-6 space-y-2 lg:space-y-4">
          <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-4 px-3">Navegação Geral</p>
          
          <button
            onClick={() => setActiveTab('pneus')}
            className={`w-full text-left px-4 py-3 text-xs font-extrabold uppercase tracking-widest transition-all duration-300 rounded-none flex items-center gap-3 cursor-pointer ${
              activeTab === 'pneus' ? 'bg-[#E11D48] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            📊 Gerenciar Estoque
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className={`w-full text-left px-4 py-3 text-xs font-extrabold uppercase tracking-widest transition-all duration-300 rounded-none flex items-center gap-3 cursor-pointer ${
              activeTab === 'banners' ? 'bg-[#E11D48] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🖼 Banners Rotativos
          </button>

          <button
            onClick={() => setActiveTab('configuracoes')}
            className={`w-full text-left px-4 py-3 text-xs font-extrabold uppercase tracking-widest transition-all duration-300 rounded-none flex items-center gap-3 cursor-pointer ${
              activeTab === 'configuracoes' ? 'bg-[#E11D48] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            ⚙ Configurações Globais
          </button>

          <button
            onClick={() => setActiveTab('afiliados')}
            className={`w-full text-left px-4 py-3 text-xs font-extrabold uppercase tracking-widest transition-all duration-300 rounded-none flex items-center gap-3 cursor-pointer ${
              activeTab === 'afiliados' ? 'bg-[#E11D48] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🤝 Rede de Afiliados
          </button>

          <button
            onClick={() => setActiveTab('auditoria')}
            className={`w-full text-left px-4 py-3 text-xs font-extrabold uppercase tracking-widest transition-all duration-300 rounded-none flex items-center gap-3 cursor-pointer ${
              activeTab === 'auditoria' ? 'bg-[#E11D48] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🛡 Auditoria de Segurança
          </button>
        </aside>

        {/* Área Central de Conteúdo */}
        <main className="flex-1 p-6 sm:p-10 bg-gradient-to-br from-[#0B0B0C] to-[#121215]">
          
          {statusMsg && (
            <div
              className={`p-4 mb-6 text-sm font-bold uppercase tracking-wider flex items-center justify-between rounded-none ${
                statusMsg.type === 'sucesso'
                  ? 'bg-green-950/20 border border-green-800/30 text-green-400'
                  : 'bg-red-950/20 border border-red-800/30 text-red-400'
              }`}
            >
              <span>{statusMsg.text}</span>
              <button onClick={() => setStatusMsg(null)} className="font-black text-xs hover:opacity-75">[X]</button>
            </div>
          )}

          {loading && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-[#E11D48] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* ABA 1: GERENCIAR ESTOQUE (PNEUS) */}
          {activeTab === 'pneus' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-wider text-white">Catálogo de Pneus</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase mt-1">Gerencie a vitrine dinâmica de pneus com filtros por tamanho</p>
                </div>
                <button
                  onClick={() => { resetPneuForm(); setShowPneuModal(true); }}
                  className="px-6 py-3.5 bg-[#E11D48] hover:bg-[#F43F5E] text-white font-extrabold uppercase text-xs tracking-wider transition-all duration-300 rounded-none cursor-pointer"
                >
                  ➕ Adicionar Pneu
                </button>
              </div>

              <div className="glass-panel rounded-none overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-white/5 text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-900">
                      <th className="p-4">Foto</th>
                      <th className="p-4">Marca / Nome</th>
                      <th className="p-4">Categoria</th>
                      <th className="p-4">Medida Nominal</th>
                      <th className="p-4">Largura</th>
                      <th className="p-4">Perfil</th>
                      <th className="p-4">Aro</th>
                      <th className="p-4">Preço à Vista</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900 text-xs">
                    {pneus.map((pneu) => (
                      <tr key={pneu.id} className="hover:bg-white/2 transition-colors">
                        <td className="p-4">
                          <div className="relative w-12 h-12 bg-black border border-gray-800 p-1 flex items-center justify-center">
                            <Image src={pneu.imagem_url} alt={pneu.nome} width={40} height={40} className="object-contain max-h-full" />
                          </div>
                        </td>
                        <td className="p-4 font-extrabold text-white">
                          <span className="block text-[9px] text-gray-500 font-bold uppercase">{pneu.marca}</span>
                          {pneu.nome}
                        </td>
                        <td className="p-4 font-semibold text-gray-300">{pneu.categoria}</td>
                        <td className="p-4 font-black text-[#E11D48]">{pneu.medida}</td>
                        <td className="p-4 font-semibold text-gray-300">{pneu.largura_mm || 295} mm</td>
                        <td className="p-4 font-semibold text-gray-300">{pneu.perfil_proporcao || 80}%</td>
                        <td className="p-4 font-semibold text-gray-300">R{pneu.aro_polegadas || '22.5'}</td>
                        <td className="p-4 font-black text-white">{formatCurrency(pneu.preco_vista)}</td>
                        <td className="p-4">
                          <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 border ${
                            pneu.visibilidade === 'oculto' ? 'bg-red-950/20 border-red-900/30 text-red-500' : 'bg-green-950/20 border-green-900/30 text-green-500'
                          }`}>
                            {pneu.visibilidade || 'publico'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditModal(pneu)}
                              className="px-3 py-1.5 border border-gray-800 hover:border-gray-600 bg-white/5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => deletePneu(pneu.id)}
                              className="px-3 py-1.5 border border-red-950 bg-red-950/10 hover:bg-red-900/30 text-red-400 text-xs font-bold uppercase tracking-wider cursor-pointer"
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pneus.length === 0 && (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-gray-500 font-bold uppercase tracking-wide">
                          Estoque físico vazio no momento.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ABA 2: BANNERS ROTATIVOS (CARROSSEL) */}
          {activeTab === 'banners' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-wider text-white">Banners Rotativos</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase mt-1">Adicione ou ordene as imagens promocionais gigantes do topo da Home</p>
                </div>
                <button
                  onClick={() => { resetBannerForm(); setEditingBanner(null); setShowBannerModal(true); }}
                  className="px-6 py-3.5 bg-[#E11D48] hover:bg-[#F43F5E] text-white font-extrabold uppercase text-xs tracking-wider transition-all duration-300 rounded-none cursor-pointer"
                >
                  ➕ Novo Banner
                </button>
              </div>

              {/* Nota Informativa sobre Banner Desktop e Mobile */}
              <div className="bg-blue-950/20 border border-blue-900/30 p-5 rounded-none">
                <p className="text-xs text-blue-400 font-black uppercase tracking-widest flex items-center gap-2">
                  <span>💡</span> DIRETRIZ RECOMENDADA DE UPLOAD & UX:
                </p>
                <p className="text-[11px] text-gray-300 font-bold mt-1.5 uppercase leading-relaxed">
                  1. TAMANHO IDEAL DESKTOP: O formato recomendado para as artes e banners rotativos é de exatamente <strong className="text-[#E11D48]">1920x650 px</strong>.
                </p>
                <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase leading-relaxed">
                  2. COMPORTAMENTO MÓVEL: Para assegurar a maior velocidade de carregamento e foco absoluto nas vendas, os banners promocionais são ocultados em smartphones. A página pública abre o buscador por medidas de pneus no topo de imediato na tela do cliente.
                </p>
              </div>

              <div className="glass-panel rounded-none overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-white/5 text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-900">
                      <th className="p-4 w-40">Miniatura</th>
                      <th className="p-4">Link de Destino</th>
                      <th className="p-4">Ordem</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900 text-xs">
                    {banners.map((banner) => (
                      <tr key={banner.id} className="hover:bg-white/2 transition-colors">
                        <td className="p-4">
                          <div className="relative w-32 h-16 bg-black border border-gray-800 overflow-hidden flex items-center justify-center">
                            <Image src={banner.imagem_url} alt="Banner" fill className="object-cover" />
                          </div>
                        </td>
                        <td className="p-4 font-mono text-gray-300 max-w-xs truncate">
                          {banner.link_redirecionamento || <span className="text-gray-600 font-sans uppercase font-bold text-[10px]">Sem Link</span>}
                        </td>
                        <td className="p-4 font-bold text-white text-sm">{banner.ordem}</td>
                        <td className="p-4">
                          <button
                            onClick={() => toggleBannerStatus(banner.id, banner.ativo)}
                            className={`px-3 py-1 font-black uppercase text-[9px] border transition-colors ${
                              banner.ativo
                                ? 'bg-green-950/20 border-green-900/30 text-green-500 hover:bg-green-900/10'
                                : 'bg-red-950/20 border-red-900/30 text-red-500 hover:bg-red-900/10'
                            }`}
                          >
                            {banner.ativo ? 'Ativo na Home' : 'Pausado'}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openBannerEditModal(banner)}
                              className="px-3 py-1.5 border border-gray-800 hover:border-gray-600 bg-white/5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => deleteBanner(banner.id)}
                              className="px-3 py-1.5 border border-red-950 bg-red-950/10 hover:bg-red-900/30 text-red-400 text-xs font-bold uppercase tracking-wider cursor-pointer"
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {banners.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500 font-bold uppercase tracking-wide">
                          Nenhum banner rotativo cadastrado. A Home mostrará o Hero elegante clássico.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ABA 3: CONFIGURAÇÕES GERAIS */}
          {activeTab === 'configuracoes' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-wider text-white">Configurações Globais</h2>
                <p className="text-xs text-gray-500 font-bold uppercase mt-1">Gerencie textos de impacto comercial, redes sociais, telefones e APIs</p>
              </div>

              <form onSubmit={saveConfigs} className="glass-panel p-6 sm:p-8 rounded-none space-y-6">
                
                {/* 1. SEÇÃO DE IMPACTO E CONVERSÃO (HERO E HOME) */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#E11D48] border-b border-gray-900 pb-2">
                    🚩 Textos Globais da Página Inicial (Hero)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-400">Título Principal do Hero</label>
                      <input
                        type="text"
                        value={configs.hero_titulo || ''}
                        onChange={(e) => setConfigs({ ...configs, hero_titulo: e.target.value })}
                        className="w-full bg-black border border-gray-800 px-4 py-2.5 rounded-none text-white focus:outline-none focus:border-[#E11D48]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-400">Aviso Superior (Frete/Oferta)</label>
                      <input
                        type="text"
                        value={configs.aviso_topo_frete || ''}
                        onChange={(e) => setConfigs({ ...configs, aviso_topo_frete: e.target.value })}
                        className="w-full bg-black border border-gray-800 px-4 py-2.5 rounded-none text-white focus:outline-none focus:border-[#E11D48]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase text-gray-400">Subtítulo de Detalhes do Hero</label>
                    <textarea
                      rows={3}
                      value={configs.hero_subtitulo || ''}
                      onChange={(e) => setConfigs({ ...configs, hero_subtitulo: e.target.value })}
                      className="w-full bg-black border border-gray-800 px-4 py-2.5 rounded-none text-white focus:outline-none focus:border-[#E11D48] text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* 2. SEÇÃO DE REDES SOCIAIS E CONTATO */}
                <div className="space-y-4 pt-4 border-t border-gray-900">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#E11D48] border-b border-gray-900 pb-2">
                    🤝 Canais de Atendimento & Rodapé Institucional
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-400">WhatsApp de Vendas</label>
                      <input
                        type="text"
                        value={configs.whatsapp_numero}
                        onChange={handleConfigPhoneChange}
                        placeholder="(XX) XXXXX-XXXX"
                        className="w-full bg-black border border-gray-800 px-4 py-2.5 rounded-none text-white focus:outline-none focus:border-[#E11D48]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-400">Texto Legal de Rodapé</label>
                      <input
                        type="text"
                        value={configs.texto_rodape || ''}
                        onChange={(e) => setConfigs({ ...configs, texto_rodape: e.target.value })}
                        className="w-full bg-black border border-gray-800 px-4 py-2.5 rounded-none text-white focus:outline-none focus:border-[#E11D48]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-400">CNPJ da Empresa</label>
                      <input
                        type="text"
                        value={configs.cnpj || ''}
                        onChange={(e) => setConfigs({ ...configs, cnpj: e.target.value })}
                        placeholder="00.000.000/0001-00"
                        className="w-full bg-black border border-gray-800 px-4 py-2.5 rounded-none text-white focus:outline-none focus:border-[#E11D48]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-400">Direitos Reservados (Nome)</label>
                      <input
                        type="text"
                        value={configs.direitos_reservados || ''}
                        onChange={(e) => setConfigs({ ...configs, direitos_reservados: e.target.value })}
                        placeholder="iAlves Pneus"
                        className="w-full bg-black border border-gray-800 px-4 py-2.5 rounded-none text-white focus:outline-none focus:border-[#E11D48]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-900/60 pt-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-400">Link do Instagram</label>
                      <input
                        type="url"
                        value={configs.instagram_url || ''}
                        onChange={(e) => setConfigs({ ...configs, instagram_url: e.target.value })}
                        placeholder="https://instagram.com/..."
                        className="w-full bg-black border border-gray-800 px-4 py-2.5 rounded-none text-white focus:outline-none focus:border-gray-500 font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-400">Link do Facebook</label>
                      <input
                        type="url"
                        value={configs.facebook_url || ''}
                        onChange={(e) => setConfigs({ ...configs, facebook_url: e.target.value })}
                        placeholder="https://facebook.com/..."
                        className="w-full bg-black border border-gray-800 px-4 py-2.5 rounded-none text-white focus:outline-none focus:border-gray-500 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-400">Link do YouTube</label>
                      <input
                        type="url"
                        value={configs.youtube_url || ''}
                        onChange={(e) => setConfigs({ ...configs, youtube_url: e.target.value })}
                        placeholder="https://youtube.com/..."
                        className="w-full bg-black border border-gray-800 px-4 py-2.5 rounded-none text-white focus:outline-none focus:border-gray-500 font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-400">Link do TikTok</label>
                      <input
                        type="url"
                        value={configs.tiktok_url || ''}
                        onChange={(e) => setConfigs({ ...configs, tiktok_url: e.target.value })}
                        placeholder="https://tiktok.com/..."
                        className="w-full bg-black border border-gray-800 px-4 py-2.5 rounded-none text-white focus:outline-none focus:border-gray-500 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. CREDENCIAIS DE APIS */}
                <div className="space-y-4 pt-4 border-t border-gray-900">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#E11D48] border-b border-gray-900 pb-2">
                    🤖 Credenciais de Inteligência Artificial (Blog Autônomo)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-400">Gemini API Key</label>
                      <input
                        type="password"
                        value={configs.gemini_api_key}
                        onChange={(e) => setConfigs({ ...configs, gemini_api_key: e.target.value })}
                        placeholder="AIzaSy..."
                        className="w-full bg-black border border-gray-800 px-4 py-2.5 rounded-none text-white focus:outline-none focus:border-gray-500 font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-400">Groq API Key (Llama 3)</label>
                      <input
                        type="password"
                        value={configs.groq_api_key}
                        onChange={(e) => setConfigs({ ...configs, groq_api_key: e.target.value })}
                        placeholder="gsk_..."
                        className="w-full bg-black border border-gray-800 px-4 py-2.5 rounded-none text-white focus:outline-none focus:border-gray-500 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. CHAVES DE ATIVAÇÃO DE RECURSOS */}
                <div className="space-y-4 pt-4 border-t border-gray-900">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#E11D48] border-b border-gray-900 pb-2">
                    🔌 Ativação de Recursos Visuais e Campanha
                  </h3>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-white">Barra de Frete Grátis (Topo)</label>
                      <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Exibe ou oculta a tarja de frete promocional no topo do site</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={configs.aviso_topo_frete_ativo || false}
                        onChange={(e) => setConfigs({ ...configs, aviso_topo_frete_ativo: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E11D48]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-2 border-t border-gray-900/60">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-white">Rede de Afiliados (PIX)</label>
                      <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Habilita ou pausa a campanha geral de comissão no Pix para parceiros</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={configs.campanha_afiliados_ativa}
                        onChange={(e) => setConfigs({ ...configs, campanha_afiliados_ativa: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E11D48]"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-900">
                  <button
                    type="submit"
                    className="w-full px-6 py-4 bg-[#E11D48] hover:bg-[#F43F5E] text-white font-extrabold uppercase text-xs tracking-wider transition-all duration-300 rounded-none cursor-pointer"
                  >
                    Gravar Configurações Gerais
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* ABA 4: REDE DE AFILIADOS */}
          {activeTab === 'afiliados' && (
            <div className="space-y-8">
              <div className="max-w-xl space-y-4">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-wider text-white">Parceiros de Indicação</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase mt-1">Crie códigos e gere links de comissão inteligentes para sua rede comercial</p>
                </div>

                <form onSubmit={addAfiliado} className="glass-panel p-6 rounded-none space-y-4">
                  <p className="text-xs font-black uppercase tracking-widest text-[#E11D48]">Cadastrar Novo Afiliado</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Nome do Parceiro</label>
                      <input
                        type="text"
                        value={novoAfiliado.nome_parceiro}
                        onChange={(e) => setNovoAfiliado({ ...novoAfiliado, nome_parceiro: e.target.value })}
                        placeholder="Ex: João Borracharia"
                        className="w-full bg-black border border-gray-800 px-3 py-2 text-xs rounded-none text-white focus:outline-none focus:border-[#E11D48]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Código REF</label>
                      <input
                        type="text"
                        value={novoAfiliado.codigo_ref}
                        onChange={(e) => setNovoAfiliado({ ...novoAfiliado, codigo_ref: e.target.value })}
                        placeholder="Ex: joao5"
                        className="w-full bg-black border border-gray-800 px-3 py-2 text-xs rounded-none text-white focus:outline-none focus:border-[#E11D48] font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#E11D48] hover:bg-[#F43F5E] text-white font-extrabold uppercase text-xs tracking-wider transition-all duration-300 rounded-none cursor-pointer"
                  >
                    Gerar Link de Afiliado
                  </button>
                </form>
              </div>

              <div className="glass-panel rounded-none overflow-hidden max-w-4xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-white/5 text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-900">
                      <th className="p-4">Nome do Parceiro</th>
                      <th className="p-4">Código Referência</th>
                      <th className="p-4">Link Exclusivo de Vendas</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900 text-sm">
                    {afiliados.map((afil) => (
                      <tr key={afil.id} className="hover:bg-white/2">
                        <td className="p-4 font-bold text-white">{afil.nome_parceiro}</td>
                        <td className="p-4 font-mono font-bold text-[#E11D48]">{afil.codigo_ref}</td>
                        <td className="p-4 text-xs">
                          <input
                            type="text"
                            readOnly
                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${afil.codigo_ref}`}
                            className="bg-black/60 border border-gray-900 px-2.5 py-1 text-gray-400 font-mono rounded-none w-full max-w-[320px] select-all cursor-pointer"
                          />
                        </td>
                        <td className="p-4">
                          <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 border ${
                            afil.ativo ? 'bg-green-950/20 border-green-900/30 text-green-500' : 'bg-red-950/20 border-red-900/30 text-red-500'
                          }`}>
                            {afil.ativo ? 'ativo' : 'inativo'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => toggleAfiliado(afil.id, afil.ativo)}
                            className="px-2.5 py-1.5 border border-gray-800 hover:border-gray-600 bg-white/5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                          >
                            {afil.ativo ? 'Pausar' : 'Ativar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {afiliados.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500 font-bold uppercase tracking-wide">
                          Nenhum parceiro de indicação ativo.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ABA 5: AUDITORIA DE SEGURANÇA */}
          {activeTab === 'auditoria' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-wider text-white">Auditoria de Segurança</h2>
                <p className="text-xs text-gray-500 font-bold uppercase mt-1">Histórico em tempo real de logs de acesso e tentativas de intrusão</p>
              </div>

              <div className="glass-panel rounded-none overflow-hidden max-w-4xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-white/5 text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-900">
                      <th className="p-4">E-mail Tentado</th>
                      <th className="p-4">Data / Hora do Evento</th>
                      <th className="p-4">Status da Tentativa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900 text-sm">
                    {audits.map((aud) => (
                      <tr key={aud.id} className="hover:bg-white/2">
                        <td className="p-4 font-bold text-white">{aud.email}</td>
                        <td className="p-4 text-gray-400 font-mono text-xs">
                          {new Date(aud.attempted_at).toLocaleString('pt-BR')}
                        </td>
                        <td className="p-4">
                          <span className={`inline-block text-[10px] font-black uppercase px-3 py-1 border ${
                            aud.status === 'tentativa_bloqueada' ? 'bg-red-950/40 border-red-800/40 text-red-500 font-black animate-pulse' : 'bg-green-950/20 border-green-800/30 text-green-500'
                          }`}>
                            {aud.status === 'tentativa_bloqueada' ? '❌ BLOQUEADO' : '✔ SUCESSO'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ----------------------------------------------------------------------
          MODAL DE CADASTRO / EDIÇÃO DE PNEUS
          ---------------------------------------------------------------------- */}
      {showPneuModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 sm:p-8 rounded-none border-t-4 border-t-[#E11D48] relative max-h-[95vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-gray-900 pb-4 mb-6">
              <h3 className="text-lg font-black uppercase tracking-widest text-white">
                {editingPneu ? 'Editar Pneu' : 'Cadastrar Pneu'}
              </h3>
              <button
                onClick={() => { setShowPneuModal(false); setEditingPneu(null); }}
                className="text-gray-500 hover:text-white font-black text-xs uppercase"
              >
                [Fechar]
              </button>
            </div>

            <form onSubmit={savePneu} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] text-gray-400 font-black uppercase tracking-wider">Modelo do Pneu</label>
                  <input
                    type="text"
                    required
                    value={pneuForm.nome}
                    onChange={(e) => setPneuForm({ ...pneuForm, nome: e.target.value })}
                    placeholder="Ex: FORZA PLUS F1"
                    className="w-full bg-black border border-gray-800 px-3 py-2 text-xs rounded-none text-white focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] text-gray-400 font-black uppercase tracking-wider">Marca</label>
                  <input
                    type="text"
                    required
                    value={pneuForm.marca}
                    onChange={(e) => setPneuForm({ ...pneuForm, marca: e.target.value })}
                    placeholder="Ex: XBRI"
                    className="w-full bg-black border border-gray-800 px-3 py-2 text-xs rounded-none text-white focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] text-gray-400 font-black uppercase tracking-wider">Categoria</label>
                  <select
                    value={pneuForm.categoria}
                    onChange={(e) => setPneuForm({ ...pneuForm, categoria: e.target.value as 'Borrachudo' | 'Liso' })}
                    className="w-full bg-black border border-gray-800 px-3 py-2 text-xs rounded-none text-white focus:outline-none focus:border-[#E11D48]"
                  >
                    <option value="Borrachudo">Borrachudo</option>
                    <option value="Liso">Liso</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] text-gray-400 font-black uppercase tracking-wider">Visibilidade</label>
                  <select
                    value={pneuForm.visibilidade}
                    onChange={(e) => setPneuForm({ ...pneuForm, visibilidade: e.target.value as 'publico' | 'oculto' })}
                    className="w-full bg-black border border-gray-800 px-3 py-2 text-xs rounded-none text-white focus:outline-none focus:border-[#E11D48]"
                  >
                    <option value="publico">Público na Vitrine</option>
                    <option value="oculto">Oculto</option>
                  </select>
                </div>
              </div>

              {/* TRÊS NOVAS COLUNAS DE BUSCA TÉCNICA SEPARADAS */}
              <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-black/40 border border-gray-900 rounded-none">
                <div className="space-y-1">
                  <label className="block text-[9px] text-[#E11D48] font-black uppercase tracking-wider">Largura (mm)</label>
                  <input
                    type="number"
                    required
                    value={pneuForm.largura_mm}
                    onChange={(e) => setPneuForm({ ...pneuForm, largura_mm: e.target.value })}
                    placeholder="Ex: 295"
                    className="w-full bg-black border border-gray-800 px-2.5 py-1.5 text-xs rounded-none text-white focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] text-[#E11D48] font-black uppercase tracking-wider">Perfil (%)</label>
                  <input
                    type="number"
                    required
                    value={pneuForm.perfil_proporcao}
                    onChange={(e) => setPneuForm({ ...pneuForm, perfil_proporcao: e.target.value })}
                    placeholder="Ex: 80"
                    className="w-full bg-black border border-gray-800 px-2.5 py-1.5 text-xs rounded-none text-white focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] text-[#E11D48] font-black uppercase tracking-wider">Aro (pol)</label>
                  <input
                    type="text"
                    required
                    value={pneuForm.aro_polegadas}
                    onChange={(e) => setPneuForm({ ...pneuForm, aro_polegadas: e.target.value })}
                    placeholder="Ex: 22.5"
                    className="w-full bg-black border border-gray-800 px-2.5 py-1.5 text-xs rounded-none text-white focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1 col-span-2">
                  <label className="block text-[9px] text-gray-400 font-black uppercase tracking-wider">Preço à Vista</label>
                  <input
                    type="text"
                    required
                    value={pneuForm.preco_vista}
                    onChange={handlePneuPriceChange}
                    className="w-full bg-black border border-gray-800 px-3 py-2 text-xs rounded-none text-[#E11D48] font-black focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] text-gray-400 font-black uppercase tracking-wider">Prof. Sulco (mm)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={pneuForm.sulco_mm}
                    onChange={(e) => setPneuForm({ ...pneuForm, sulco_mm: e.target.value })}
                    placeholder="Ex: 15"
                    className="w-full bg-black border border-gray-800 px-3 py-2 text-xs rounded-none text-white focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] text-gray-400 font-black uppercase tracking-wider">Destaque (Ordem)</label>
                <input
                  type="number"
                  required
                  value={pneuForm.posicao_destaque}
                  onChange={(e) => setPneuForm({ ...pneuForm, posicao_destaque: e.target.value })}
                  placeholder="Ex: 10 (Maior aparece primeiro)"
                  className="w-full bg-black border border-gray-800 px-3 py-2 text-xs rounded-none text-white focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div className="space-y-2 border-t border-gray-900 pt-4 text-left">
                <label className="block text-[9px] text-gray-400 font-black uppercase tracking-wider">Foto do Pneu (Auto WebP)</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border file:border-gray-850 file:bg-white/5 file:text-white file:text-[10px] file:font-bold file:uppercase file:cursor-pointer"
                />
                {isUploading && <p className="text-[10px] text-amber-500 font-bold animate-pulse">Comprimindo...</p>}
                {pneuForm.imagem_url && (
                  <div className="mt-2 relative w-16 h-16 bg-black border border-gray-900 p-1 flex items-center justify-center">
                    <Image src={pneuForm.imagem_url} alt="Previa" width={55} height={55} className="object-contain max-h-full" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-900">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 px-4 py-3 bg-[#E11D48] hover:bg-[#F43F5E] text-white font-extrabold uppercase text-xs tracking-wider transition-all rounded-none cursor-pointer text-center disabled:opacity-50"
                >
                  Confirmar Cadastro
                </button>
                <button
                  type="button"
                  onClick={() => { setShowPneuModal(false); setEditingPneu(null); }}
                  className="px-4 py-3 border border-gray-800 hover:border-gray-600 bg-white/5 text-white font-extrabold uppercase text-xs tracking-wider transition-all rounded-none cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          MODAL DE CADASTRO / EDIÇÃO DE BANNERS ROTATIVOS
          ---------------------------------------------------------------------- */}
      {showBannerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-none border-t-4 border-t-[#E11D48] relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-gray-900 pb-4 mb-6">
              <h3 className="text-lg font-black uppercase tracking-widest text-white">
                {editingBanner ? 'Editar Banner Promocional' : 'Novo Banner Promocional'}
              </h3>
              <button
                onClick={() => { setShowBannerModal(false); setEditingBanner(null); }}
                className="text-gray-500 hover:text-white font-black text-xs uppercase"
              >
                [Fechar]
              </button>
            </div>

            <form onSubmit={saveBanner} className="space-y-4">
              
              <div className="space-y-1">
                <label className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Link de Redirecionamento (Opcional)</label>
                <input
                  type="text"
                  value={bannerForm.link_redirecionamento}
                  onChange={(e) => setBannerForm({ ...bannerForm, link_redirecionamento: e.target.value })}
                  placeholder="Ex: #vitrine-produtos ou url do WhatsApp"
                  className="w-full bg-black border border-gray-800 px-3 py-2.5 text-xs rounded-none text-white focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Ordem de Exibição</label>
                  <input
                    type="number"
                    required
                    value={bannerForm.ordem}
                    onChange={(e) => setBannerForm({ ...bannerForm, ordem: e.target.value })}
                    placeholder="Ex: 1 (Menor aparece primeiro)"
                    className="w-full bg-black border border-gray-800 px-3 py-2.5 text-xs rounded-none text-white focus:outline-none focus:border-[#E11D48]"
                  />
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <label className="relative inline-flex items-center cursor-pointer mb-2.5">
                    <input
                      type="checkbox"
                      checked={bannerForm.ativo}
                      onChange={(e) => setBannerForm({ ...bannerForm, ativo: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E11D48]"></div>
                    <span className="ml-2 text-[10px] font-black uppercase tracking-wider text-gray-400">Ativo</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2 border-t border-gray-900 pt-4 text-left">
                <label className="block text-[10px] text-gray-400 font-black uppercase tracking-wider">Imagem Gigante do Banner (1920x600 px)</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={bannerFileInputRef}
                  onChange={handleBannerImageUpload}
                  disabled={isUploading}
                  className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border file:border-gray-850 file:bg-white/5 file:text-white file:text-[10px] file:font-bold file:uppercase file:cursor-pointer"
                />
                {isUploading && <p className="text-[10px] text-amber-500 font-bold animate-pulse">Processando imagem em tempo real...</p>}
                {bannerForm.imagem_url && (
                  <div className="mt-2 relative w-full h-24 bg-black border border-gray-900 overflow-hidden flex items-center justify-center">
                    <Image src={bannerForm.imagem_url} alt="Previa Banner" fill className="object-cover" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-900">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 px-4 py-3 bg-[#E11D48] hover:bg-[#F43F5E] text-white font-extrabold uppercase text-xs tracking-wider transition-all rounded-none cursor-pointer text-center disabled:opacity-50"
                >
                  Confirmar Banner
                </button>
                <button
                  type="button"
                  onClick={() => { setShowBannerModal(false); setEditingBanner(null); }}
                  className="px-4 py-3 border border-gray-800 hover:border-gray-600 bg-white/5 text-white font-extrabold uppercase text-xs tracking-wider transition-all rounded-none cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
