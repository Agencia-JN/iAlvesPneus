'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { maskCurrency, maskWhatsapp, sanitizeWhatsapp, parseCurrencyInput, formatCurrency, maskCNPJ, validateSocialLink } from '@/lib/utils';
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

interface HeaderConfig {
  logo_url: string;
  aviso_topo: string;
  aviso_ativo: boolean;
}

interface HeroConfig {
  titulo: string;
  subtitulo: string;
  background_url: string;
}

interface FooterConfig {
  texto_rodape: string;
  cnpj: string;
  direitos_reservados: string;
  links_sociais: {
    instagram: string;
    facebook: string;
    youtube: string;
    tiktok: string;
  };
}

interface FeaturesConfig {
  afiliado_ativo: boolean;
  frete_ativo: boolean;
  blog_ia_ativo: boolean;
}

interface Configuracoes {
  whatsapp_numero: string;
  gemini_api_key: string;
  groq_api_key: string;
  horarios_postagem: string[];
  header_config?: HeaderConfig;
  hero_config?: HeroConfig;
  footer_config?: FooterConfig;
  features_config?: FeaturesConfig;
  banner_tempo_transicao?: number;
}

interface Afiliado {
  id: string;
  nome_parceiro: string;
  codigo_ref: string;
  ativo: boolean;
}

interface AfiliadoLog {
  id?: string;
  afiliado_id: string;
  evento: 'clique_link' | 'clique_whatsapp';
}

interface AdminUser {
  id?: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  status?: 'ATIVO' | 'BLOQUEADO' | 'PENDENTE';
}

interface ActivityLog {
  id: string;
  usuario: string;
  acao: string;
  descricao: string;
  created_at: string;
}

export default function CentralDiretoria() {
  const router = useRouter();

  // Estados de carregamento e autenticação
  const [supabaseActive, setSupabaseActive] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isLoading = loading;
  const [authLoading, setAuthLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [authMsg, setAuthMsg] = useState<string | null>(null);


  // Estados de dados da Diretoria
  const [activeTab, setActiveTab] = useState<'pneus' | 'banners' | 'configuracoes' | 'afiliados' | 'auditoria' | 'acessos'>('pneus');
  const [pneus, setPneus] = useState<TypePneu[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [audits, setAudits] = useState<LoginAudit[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [afiliados, setAfiliados] = useState<Afiliado[]>([]);
  const [afiliadoLogs, setAfiliadoLogs] = useState<AfiliadoLog[]>([]);
  const [listaAdmins, setListaAdmins] = useState<AdminUser[]>([]);
  const [novoAdminEmail, setNovoAdminEmail] = useState('');

  // Toast e Confirmação customizados
  interface Toast {
    id: string;
    type: 'sucesso' | 'erro' | 'info';
    text: string;
  }
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Estados de role e controle de privilégios via banco
  const [userRole, setUserRole] = useState<'SUPER_ADMIN' | 'ADMIN' | null>(null);
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  
  const [configs, setConfigs] = useState<Configuracoes>({
    whatsapp_numero: '(11) 99999-9999',
    gemini_api_key: '',
    groq_api_key: '',
    horarios_postagem: ['08:00', '14:00', '20:00'],
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
      links_sociais: {
        instagram: '',
        facebook: '',
        youtube: '',
        tiktok: '',
      },
    },
    features_config: {
      afiliado_ativo: false,
      frete_ativo: true,
      blog_ia_ativo: false,
    },
    banner_tempo_transicao: 6,
  });

  const [socialErrors, setSocialErrors] = useState({
    instagram: '',
    facebook: '',
    youtube: '',
    tiktok: '',
    cnpj: '',
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
    quantidade_estoque: '10',
    status_produto: 'ativo',
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

  // Monitor de recursos
  const [dbSize, setDbSize] = useState<string>('Calculando...');
  const [removingLogo, setRemovingLogo] = useState(false);

  const getStoragePathFromUrl = (url: string, bucketName: string): string | null => {
    if (!url) return null;
    const cleanUrl = url.split('?')[0];
    const matchStr = `/${bucketName}/`;
    const index = cleanUrl.indexOf(matchStr);
    if (index !== -1) {
      return cleanUrl.substring(index + matchStr.length);
    }
    return null;
  };

  // Referências dos inputs de arquivos
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  // ─── Fluxo de Autenticação ────────────────────────────────────────────────
  // Estratégia dual para máxima confiabilidade em ambiente Netlify/Next.js:
  // 1) getSession() verifica a sessão existente imediatamente (lê do localStorage)
  // 2) onAuthStateChange ouve apenas eventos futuros (novo login / logout)
  // checkAuth recebe a sessão como parâmetro para evitar chamada dupla a getSession().
  useEffect(() => {
    const isConfigured = isSupabaseConfigured();
    setSupabaseActive(isConfigured);

    if (!isConfigured) {
      setAuthLoading(false);
      return;
    }

    // Fallback de segurança absoluto: libera o loading após 10s em qualquer cenário
    const timer = setTimeout(() => {
      console.warn('[Auth] Timeout de 10s atingido. Liberando authLoading.');
      setAuthLoading(false);
    }, 10000);

    // PASSO 1: Verifica sessão existente (F5, reload, navegação direta)
    // getSession() lê do localStorage — não faz chamada de rede para tokens válidos
    supabase.auth.getSession()
      .then(({ data }: { data: { session: any } }) => {
        if (data.session?.user) {
          checkAuth(data.session, false).finally(() => clearTimeout(timer));
        } else {
          clearTimeout(timer);
          setAuthLoading(false);
        }
      })
      .catch(() => {
        clearTimeout(timer);
        setAuthLoading(false);
      });

    // PASSO 2: Ouve eventos futuros de autenticação (novo login via OAuth, logout)
    // INITIAL_SESSION já foi tratado pelo getSession() acima — ignorado aqui
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, session: any) => {
        if (event === 'SIGNED_IN' && session?.user) {
          checkAuth(session, true).finally(() => clearTimeout(timer));
        } else if (event === 'SIGNED_OUT') {
          clearTimeout(timer);
          setUserEmail(null);
          setAuthorized(false);
          setUserRole(null);
          setAuthLoading(false);
        }
        // INITIAL_SESSION, TOKEN_REFRESHED, USER_UPDATED: ignorados
      }
    );

    return () => {
      subscription?.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // Recupera a aba ativa do localStorage no client-side para evitar perda no F5
  useEffect(() => {
    const savedTab = localStorage.getItem('admin_active_tab');
    if (savedTab) {
      const validTabs = ['pneus', 'banners', 'configuracoes', 'afiliados', 'auditoria', 'acessos'];
      if (validTabs.includes(savedTab)) {
        setActiveTab(savedTab as any);
      }
    }
  }, []);

  const changeTab = (tab: 'pneus' | 'banners' | 'configuracoes' | 'afiliados' | 'auditoria' | 'acessos') => {
    setActiveTab(tab);
    localStorage.setItem('admin_active_tab', tab);
  };

  const showToast = (text: string, type: 'sucesso' | 'erro' | 'info' = 'sucesso') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const askConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(null);
      }
    });
  };

  const logActivity = async (acao: string, descricao: string) => {
    try {
      let email = userEmail;
      if (!email) {
        const { data: { session } } = await supabase.auth.getSession();
        email = session?.user?.email || null;
      }
      if (!email) return;

      await supabase.from('activity_logs').insert({
        usuario: email,
        acao,
        descricao
      });

      // Recarrega logs em segundo plano
      const { data: activityLogsData } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(40);
      if (activityLogsData) setActivityLogs(activityLogsData);
    } catch (e) {
      console.warn('[logActivity] Falha ao registrar atividade (tabela pode não ter sido criada):', e);
    }
  };

  // 1. Verificação de Admin
  // Recebe a sessão como parâmetro (não chama getSession() internamente)
  // para evitar deadlock quando chamado logo após getSession() no useEffect.
  const checkAuth = async (session: any, isNewLogin: boolean = false): Promise<void> => {
    try {
      setAuthMsg(null);

      if (!session?.user?.email) {
        setAuthorized(false);
        setUserRole(null);
        return;
      }

      const email: string = session.user.email;
      setUserEmail(email);

      const isPrincipalAdmin = email === 'nilson.brites@gmail.com';

      // Consulta permissão na tabela de administradores
      const { data: adminUser, error: adminError } = await supabase
        .from('administradores')
        .select('email, role, status')
        .eq('email', email)
        .maybeSingle();

      if (adminError) {
        if (isPrincipalAdmin) {
          if (isNewLogin) {
            try {
              await supabase.from('login_audits').insert({ email, status: 'sucesso' });
            } catch (err) {
              console.error('[checkAuth] Erro ao registrar audit sucesso:', err);
            }
          }
          setUserRole('SUPER_ADMIN');
          setAuthorized(true);
          loadDatabaseData().catch(e => console.error('[checkAuth]', e));
        } else {
          await supabase.auth.signOut();
          setUserRole(null);
          setAuthorized(false);
          setAuthMsg('Erro ao verificar permissões. Fale com a diretoria.');
        }
        return;
      }

      if (!adminUser) {
        // Auto-cadastro como PENDENTE
        try {
          await supabase.from('administradores').insert({ email, role: 'ADMIN', status: 'PENDENTE' });
        } catch (err) {
          console.error('[checkAuth] Erro ao registrar admin pendente:', err);
        }
        try {
          await supabase.from('login_audits').insert({ email, status: 'tentativa_bloqueada' });
        } catch (err) {
          console.error('[checkAuth] Erro ao registrar audit tentativa bloqueada:', err);
        }
        await supabase.auth.signOut();
        setUserRole(null);
        setAuthorized(false);
        setAuthMsg('Fale com a diretoria para liberar seu acesso.');
        return;
      }

      const status = adminUser.status || 'PENDENTE';

      if (status !== 'ATIVO') {
        try {
          await supabase.from('login_audits').insert({ email, status: 'tentativa_bloqueada' });
        } catch (err) {
          console.error('[checkAuth] Erro ao registrar audit tentativa bloqueada:', err);
        }
        await supabase.auth.signOut();
        setUserRole(null);
        setAuthorized(false);
        setAuthMsg(status === 'BLOQUEADO'
          ? 'Seu acesso está bloqueado. Fale com a diretoria.'
          : 'Fale com a diretoria para liberar seu acesso.');
      } else {
        const resolvedRole = (adminUser.role || (isPrincipalAdmin ? 'SUPER_ADMIN' : 'ADMIN')) as 'SUPER_ADMIN' | 'ADMIN';
        if (isNewLogin) {
          try {
            await supabase.from('login_audits').insert({ email, status: 'sucesso' });
          } catch (err) {
            console.error('[checkAuth] Erro ao registrar audit sucesso:', err);
          }
        }
        setUserRole(resolvedRole);
        setAuthorized(true);
        loadDatabaseData().catch(e => console.error('[checkAuth]', e));
      }
    } catch (e) {
      console.error('[checkAuth] Erro inesperado:', e);
      setAuthorized(false);
      setUserRole(null);
      setAuthMsg('Erro inesperado. Tente novamente.');
    } finally {
      setAuthLoading(false);
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





  const loadDatabaseData = async () => {
    try {
      const results = await Promise.allSettled([
        supabase.from('pneus').select('*').order('posicao_destaque', { ascending: false }),
        supabase.from('banners').select('*').order('ordem', { ascending: true }),
        supabase.from('login_audits').select('*').order('attempted_at', { ascending: false }).limit(20),
        supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(40),
        supabase.from('afiliados').select('*').order('nome_parceiro', { ascending: true }),
        supabase.from('afiliado_logs').select('afiliado_id, evento'),
        supabase.from('configuracoes').select('*').eq('id', 1).maybeSingle(),
        supabase.from('administradores').select('id, email, role, status')
      ]);

      // 1. Pneus
      const pneusRes = results[0];
      if (pneusRes.status === 'fulfilled' && pneusRes.value.data) {
        const pneusData = pneusRes.value.data;
        setPneus(pneusData.map((p: any) => ({
          ...p,
          largura_mm: p.largura_mm ? Number(p.largura_mm) : 295,
          perfil_proporcao: p.perfil_proporcao ? Number(p.perfil_proporcao) : 80,
          aro_polegadas: p.aro_polegadas || '22.5',
          sulco_mm: Number(p.sulco_mm),
          preco_vista: Number(p.preco_vista),
        })));
      } else if (pneusRes.status === 'rejected') {
        console.error('Erro ao carregar pneus:', pneusRes.reason);
      }

      // 2. Banners
      const bannersRes = results[1];
      if (bannersRes.status === 'fulfilled' && bannersRes.value.data) {
        setBanners(bannersRes.value.data);
      } else if (bannersRes.status === 'rejected') {
        console.error('Erro ao carregar banners:', bannersRes.reason);
      }

      // 3. Auditoria
      const auditsRes = results[2];
      if (auditsRes.status === 'fulfilled' && auditsRes.value.data) {
        setAudits(auditsRes.value.data);
      }

      // 3b. Logs de Alterações (Atividades)
      const activityRes = results[3];
      if (activityRes.status === 'fulfilled' && activityRes.value.data) {
        setActivityLogs(activityRes.value.data);
      }

      // 4. Afiliados
      const afiliadosRes = results[4];
      if (afiliadosRes.status === 'fulfilled' && afiliadosRes.value.data) {
        setAfiliados(afiliadosRes.value.data);
      }

      // 4b. Logs de Afiliados
      const afiliadoLogsRes = results[5];
      if (afiliadoLogsRes.status === 'fulfilled' && afiliadoLogsRes.value.data) {
        setAfiliadoLogs(afiliadoLogsRes.value.data as AfiliadoLog[]);
      }

      // 5. Configurações
      const configRes = results[6];
      if (configRes.status === 'fulfilled' && configRes.value.data) {
        const configData = configRes.value.data;
        setConfigs({
          whatsapp_numero: maskWhatsapp(configData.whatsapp_numero || ''),
          gemini_api_key: configData.gemini_api_key || '',
          groq_api_key: configData.groq_api_key || '',
          horarios_postagem: configData.horarios_postagem || [],
          header_config: {
            logo_url: configData.header_config?.logo_url || '/logoiAlves.png',
            aviso_topo: configData.header_config?.aviso_topo || '🔥 OFERTA DE INAUGURAÇÃO: FRETE GRÁTIS PARA COMPRAS ACIMA DE 4 PNEUS!',
            aviso_ativo: configData.header_config?.aviso_ativo !== false,
          },
          hero_config: {
            titulo: configData.hero_config?.titulo || 'ROBUSTEZ EXTREMA',
            subtitulo: configData.hero_config?.subtitulo || 'Fornecimento direto de pneus novos de alta durabilidade e máxima tração. Desempenho profissional projetado para frotas de caminhões e implementos rodoviários. Preço à vista imbatível.',
            background_url: configData.hero_config?.background_url || '',
          },
          footer_config: {
            texto_rodape: configData.footer_config?.texto_rodape || '',
            cnpj: maskCNPJ(configData.footer_config?.cnpj || ''),
            direitos_reservados: configData.footer_config?.direitos_reservados !== undefined ? configData.footer_config.direitos_reservados : 'iAlves Pneus',
            links_sociais: {
              instagram: configData.footer_config?.links_sociais?.instagram || '',
              facebook: configData.footer_config?.links_sociais?.facebook || '',
              youtube: configData.footer_config?.links_sociais?.youtube || '',
              tiktok: configData.footer_config?.links_sociais?.tiktok || '',
            },
          },
          features_config: {
            afiliado_ativo: !!configData.features_config?.afiliado_ativo,
            frete_ativo: configData.features_config?.frete_ativo !== false,
            blog_ia_ativo: !!configData.features_config?.blog_ia_ativo,
          },
          banner_tempo_transicao: configData.banner_tempo_transicao !== undefined && configData.banner_tempo_transicao !== null 
            ? Number(configData.banner_tempo_transicao) 
            : 6,
        });
      }
      // 6. Administradores
      const adminsRes = results[7];
      if (adminsRes && adminsRes.status === 'fulfilled' && adminsRes.value.data) {
        setListaAdmins(adminsRes.value.data.map((a: any) => ({
          id: a.id,
          email: a.email,
          role: a.role || 'ADMIN',
          status: a.status
        })));
      }

      // 9. Tamanho do banco de dados (RPC get_db_size)
      try {
        const { data: sizeData, error: sizeErr } = await supabase.rpc('get_db_size');
        if (!sizeErr && sizeData) {
          setDbSize(sizeData);
        } else {
          setDbSize('N/A');
        }
      } catch (rpcErr) {
        console.error('Erro ao executar RPC get_db_size:', rpcErr);
        setDbSize('N/A');
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
  };

  // 2. Manipulação de Inputs de Formulário
  const handlePneuPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPneuForm({ ...pneuForm, preco_vista: maskCurrency(e.target.value) });
  };

  const handleConfigPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfigs({ ...configs, whatsapp_numero: maskWhatsapp(e.target.value) });
  };

  const handleCNPJBlur = (value: string) => {
    const raw = value.replace(/\D/g, '');
    if (raw && raw.length !== 14) {
      setSocialErrors(prev => ({ ...prev, cnpj: 'O CNPJ deve conter exatamente 14 números.' }));
    } else {
      setSocialErrors(prev => ({ ...prev, cnpj: '' }));
    }
  };

  const handleSocialBlur = (platform: 'instagram' | 'facebook' | 'youtube' | 'tiktok', value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setSocialErrors(prev => ({ ...prev, [platform]: '' }));
      return;
    }

    let finalUrl = trimmed;
    // Auto-convert handles/usernames if they don't contain slashes or dots
    if (!trimmed.includes('.') && !trimmed.includes('/')) {
      const handle = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
      if (platform === 'instagram') finalUrl = `https://instagram.com/${handle}`;
      if (platform === 'facebook') finalUrl = `https://facebook.com/${handle}`;
      if (platform === 'youtube') finalUrl = `https://youtube.com/@${handle}`;
      if (platform === 'tiktok') finalUrl = `https://tiktok.com/@${handle}`;
    } else if (!trimmed.startsWith('http')) {
      finalUrl = `https://${trimmed}`;
    }

    const isValid = validateSocialLink(finalUrl, platform);
    
    setConfigs(prev => ({
      ...prev,
      footer_config: {
        ...prev.footer_config!,
        links_sociais: {
          ...prev.footer_config!.links_sociais,
          [platform]: finalUrl
        }
      }
    }));

    setSocialErrors(prev => ({
      ...prev,
      [platform]: isValid ? '' : `Por favor, insira um link válido do ${platform.charAt(0).toUpperCase() + platform.slice(1)}.`
    }));
  };

  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isSupabaseConfigured()) {
      showToast('O Supabase não está configurado para realizar uploads.', 'erro');
      return;
    }

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `logo_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `logo/${fileName}`;

      // Exclui o logo antigo se ele existia no bucket 'banners' (subpasta logo/)
      const oldLogoUrl = configs.header_config?.logo_url;
      if (oldLogoUrl && oldLogoUrl.includes('/banners/logo/')) {
        const parts = oldLogoUrl.split('/banners/');
        if (parts.length > 1) {
          const oldPath = parts[1].split('?')[0]; // Remove query string (?v=...)
          await supabase.storage.from('banners').remove([oldPath]);
        }
      }

      // Faz o upload para o bucket 'banners' (subpasta logo/)
      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      // Obtém a URL pública do novo logotipo
      const { data: publicUrlData } = supabase.storage.from('banners').getPublicUrl(filePath);
      const publicUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;

      // Monta o novo header_config com a URL atualizada (garante todos os campos obrigatórios)
      const currentHeader = configs.header_config;
      const newHeaderConfig: HeaderConfig = {
        logo_url: publicUrl,
        aviso_topo: currentHeader?.aviso_topo ?? '',
        aviso_ativo: currentHeader?.aviso_ativo ?? true,
      };

      // Persiste imediatamente no banco de dados (configuracoes.header_config)
      const { error: dbError } = await supabase
        .from('configuracoes')
        .update({ header_config: newHeaderConfig })
        .eq('id', 1);

      if (dbError) throw new Error(`Upload OK, mas falha ao salvar no banco: ${dbError.message}`);

      // Atualiza o estado local apenas após confirmação do banco
      setConfigs((prev) => ({
        ...prev,
        header_config: newHeaderConfig
      }));

      await logActivity('Configurações', `Atualizou o logotipo da empresa via upload direto.`);
      showToast('Logotipo atualizado com sucesso!');
    } catch (err: any) {
      console.error(err);
      showToast(`Erro ao realizar upload do logotipo: ${err.message || err}`, 'erro');
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = async () => {
    const logoUrl = configs.header_config?.logo_url;
    if (!logoUrl || logoUrl === '/logoiAlves.png') {
      showToast('Nenhum logotipo customizado para remover.', 'info');
      return;
    }

    askConfirmation(
      'Remover Logotipo',
      'Deseja realmente remover o logotipo customizado e restaurar o logotipo padrão? O arquivo antigo será excluído do Storage.',
      async () => {
        setRemovingLogo(true);
        try {
          const path = getStoragePathFromUrl(logoUrl, 'banners');
          if (path) {
            await supabase.storage.from('banners').remove([path]);
          }

          const newHeaderConfig = {
            logo_url: '/logoiAlves.png',
            aviso_topo: configs.header_config?.aviso_topo ?? '',
            aviso_ativo: configs.header_config?.aviso_ativo ?? true,
          };

          const { error } = await supabase
            .from('configuracoes')
            .update({ header_config: newHeaderConfig })
            .eq('id', 1);

          if (error) throw error;

          setConfigs((prev) => ({
            ...prev,
            header_config: newHeaderConfig
          }));

          showToast('Logotipo removido e restaurado para o padrão!');
          await logActivity('Configurações', 'Removeu o logotipo personalizado.');
        } catch (err: any) {
          console.error(err);
          showToast(err.message || 'Erro ao remover logotipo.', 'erro');
        } finally {
          setRemovingLogo(false);
        }
      }
    );
  };

  // Compressão Nativa WebP (Pneu)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatusMsg(null);

    try {
      if (file.size < 300 * 1024 && (file.type === 'image/webp' || file.type === 'image/png' || file.type === 'image/jpeg')) {
        setPneuForm({
          ...pneuForm,
          imagem_file: file,
          imagem_url: URL.createObjectURL(file),
        });
        setStatusMsg({ type: 'sucesso', text: `Imagem carregada diretamente! (${(file.size / 1024).toFixed(1)} KB)` });
      } else {
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
      }
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
      if (file.size < 500 * 1024 && (file.type === 'image/webp' || file.type === 'image/png' || file.type === 'image/jpeg')) {
        setBannerForm({
          ...bannerForm,
          imagem_file: file,
          imagem_url: URL.createObjectURL(file),
        });
        setStatusMsg({ type: 'sucesso', text: `Banner carregado diretamente! (${(file.size / 1024).toFixed(1)} KB)` });
      } else {
        const compressedBlob = await compressImageToWebp(file, 0.85, 1920);
        const compressedFile = new File([compressedBlob], `banner_${Date.now()}.webp`, {
          type: 'image/webp',
        });

        setBannerForm({
          ...bannerForm,
          imagem_file: compressedFile,
          imagem_url: URL.createObjectURL(compressedBlob),
        });

        setStatusMsg({ type: 'sucesso', text: `Banner comprimido para WebP! (${(compressedFile.size / 1024).toFixed(1)} KB)` });
      }
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
    let saveSuccess = false;

    try {
      let finalImageUrl = pneuForm.imagem_url || '/pneu_borrachudo.png';

      if (pneuForm.imagem_file) {
        // Remove antiga se estiver editando e se for do storage
        if (editingPneu?.imagem_url) {
          const oldRelativePath = getStoragePathFromUrl(editingPneu.imagem_url, 'pneus');
          if (oldRelativePath) {
            await supabase.storage.from('pneus').remove([oldRelativePath]);
          }
        }

        const fileExt = 'webp';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `produtos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('pneus')
          .upload(filePath, pneuForm.imagem_file);

        if (uploadError) {
          throw new Error(`Falha no upload da imagem (tentando acessar o bucket 'pneus'): ${uploadError.message}. Verifique se o bucket 'pneus' existe no Supabase e se possui políticas públicas de RLS.`);
        }

        const { data: publicUrlData } = supabase.storage.from('pneus').getPublicUrl(filePath);
        finalImageUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;
      }

      const estoqueClean = parseInt(pneuForm.quantidade_estoque) || 0;
      let statusClean = pneuForm.status_produto || 'ativo';
      if (estoqueClean <= 0) {
        statusClean = 'inativo';
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
        quantidade_estoque: estoqueClean,
        status_produto: statusClean,
      };

      if (editingPneu) {
        const { error } = await supabase.from('pneus').update(pneuData).eq('id', editingPneu.id);
        if (error) throw new Error(`Erro ao atualizar pneu: ${error.message}`);
        await logActivity('Estoque', `Atualizou o pneu "${pneuData.nome}" (${pneuData.marca}) - Medida: ${pneuData.medida}, Preço: R$ ${pneuData.preco_vista.toFixed(2)}.`);
      } else {
        const { error } = await supabase.from('pneus').insert(pneuData);
        if (error) throw new Error(`Erro ao inserir pneu: ${error.message}`);
        await logActivity('Estoque', `Cadastrou o pneu "${pneuData.nome}" (${pneuData.marca}) - Medida: ${pneuData.medida}, Preço: R$ ${pneuData.preco_vista.toFixed(2)}.`);
      }
      setShowPneuModal(false);
      setEditingPneu(null);
      resetPneuForm();
      showToast('Pneu gravado com sucesso no estoque!');
      saveSuccess = true;
    } catch (err: any) {
      console.error('[savePneu] Erro:', err);
      showToast(err.message || 'Falha ao salvar produto no estoque.', 'erro');
    } finally {
      // SEMPRE desativa o loading; recarrega dados apenas se a opção foi bem-sucedida
      setLoading(false);
      if (saveSuccess) {
        loadDatabaseData().catch(loadErr => console.error('[savePneu] Erro ao recarregar dados:', loadErr));
      }
    }
  };

  const toggleStatusPneu = async (pneu: TypePneu) => {
    const novoStatus = pneu.status_produto === 'ativo' ? 'inativo' : 'ativo';
    const novoEstoque = novoStatus === 'ativo' && (pneu.quantidade_estoque ?? 0) <= 0 ? 10 : (pneu.quantidade_estoque ?? 0);
    setLoading(true);
    try {
      const { error } = await supabase
        .from('pneus')
        .update({ status_produto: novoStatus, quantidade_estoque: novoEstoque })
        .eq('id', pneu.id);
      if (error) throw new Error(`Erro ao alterar status: ${error.message}`);

      await logActivity('Estoque', `${novoStatus === 'ativo' ? 'Ativou' : 'Desativou'} o pneu "${pneu.nome}" (${pneu.marca}).`);
      showToast(`Pneu ${novoStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso!`);
      loadDatabaseData().catch(loadErr => console.error('[toggleStatusPneu] Erro ao recarregar dados:', loadErr));
    } catch (err: any) {
      console.error('[toggleStatusPneu] Erro:', err);
      showToast(err.message || 'Erro ao alterar status.', 'erro');
    } finally {
      setLoading(false);
    }
  };

  const deletePneu = async (id: string) => {
    const pneuToDelete = pneus.find((p) => p.id === id);
    // Confirmação Nível 1
    askConfirmation(
      'EXCLUSÃO FISICA - CONFIRMAÇÃO 1/2',
      `Deseja realmente excluir permanentemente o pneu "${pneuToDelete?.nome || 'este pneu'}"? Recomendamos apenas desativar o produto para não quebrar históricos. Se prosseguir, a imagem será apagada do Storage.`,
      () => {
        // Confirmação Nível 2 (Rigorosa)
        askConfirmation(
          '⚠️ ALERTA CRÍTICO - CONFIRMAÇÃO 2/2',
          `Esta ação é IRREVERSÍVEL! O pneu "${pneuToDelete?.nome}" será apagado do banco de dados definitivamente. Confirmar exclusão permanente?`,
          async () => {
            setLoading(true);
            try {
              if (pneuToDelete?.imagem_url) {
                const path = getStoragePathFromUrl(pneuToDelete.imagem_url, 'pneus');
                if (path) {
                  await supabase.storage.from('pneus').remove([path]);
                }
              }

              const { error } = await supabase.from('pneus').delete().eq('id', id);
              if (error) throw new Error(`Erro ao deletar pneu: ${error.message}`);

              await logActivity('Estoque', `Removeu permanentemente o pneu "${pneuToDelete?.nome || id}" (${pneuToDelete?.marca || 'Desconhecida'}).`);
              showToast('Pneu eliminado definitivamente com sucesso!');
              loadDatabaseData().catch(loadErr => console.error('[deletePneu] Erro ao recarregar dados:', loadErr));
            } catch (err: any) {
              console.error('[deletePneu] Erro:', err);
              showToast(err.message || 'Erro ao remover pneu.', 'erro');
            } finally {
              setLoading(false);
            }
          }
        );
      }
    );
  };

  // 4. CRUD de Banners Rotativos
  const saveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let saveSuccess = false;

    try {
      let finalImageUrl = bannerForm.imagem_url;

      if (bannerForm.imagem_file) {
        // Remove antiga se estiver editando e se for do storage
        if (editingBanner?.imagem_url) {
          const oldRelativePath = getStoragePathFromUrl(editingBanner.imagem_url, 'banners');
          if (oldRelativePath) {
            await supabase.storage.from('banners').remove([oldRelativePath]);
          }
        }

        const fileExt = 'webp';
        const fileName = `${Date.now()}_banner_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('banners')
          .upload(fileName, bannerForm.imagem_file, { upsert: false });

        if (uploadError) {
          throw new Error(`Falha no upload da imagem (tentando acessar o bucket 'banners'): ${uploadError.message}. Verifique se o bucket 'banners' existe no Supabase e se possui políticas públicas de RLS.`);
        }

        const { data: publicUrlData } = supabase.storage.from('banners').getPublicUrl(fileName);
        finalImageUrl = `${publicUrlData.publicUrl}?v=${Date.now()}`;
      }

      if (!finalImageUrl) {
        throw new Error('Carregue uma imagem para o banner promocional.');
      }

      const bannerData = {
        imagem_url: finalImageUrl,
        link_redirecionamento: bannerForm.link_redirecionamento.trim(),
        ativo: bannerForm.ativo,
        ordem: parseInt(bannerForm.ordem) || 0,
      };

      if (editingBanner) {
        const { error } = await supabase.from('banners').update(bannerData).eq('id', editingBanner.id);
        if (error) throw new Error(`Erro ao atualizar banner no banco: ${error.message}`);
        await logActivity('Banners', `Atualizou o banner rotativo (Ordem: ${bannerData.ordem}, Ativo: ${bannerData.ativo ? 'Sim' : 'Não'}).`);
      } else {
        const { error } = await supabase.from('banners').insert(bannerData);
        if (error) throw new Error(`Erro ao inserir banner no banco: ${error.message}`);
        await logActivity('Banners', `Criou novo banner rotativo (Ordem: ${bannerData.ordem}, Ativo: ${bannerData.ativo ? 'Sim' : 'Não'}).`);
      }
      setShowBannerModal(false);
      setEditingBanner(null);
      resetBannerForm();
      showToast('Banner rotativo gravado com sucesso!');
      saveSuccess = true;
    } catch (err: any) {
      console.error('[saveBanner] Erro:', err);
      showToast(err.message || 'Erro desconhecido ao salvar banner.', 'erro');
    } finally {
      // SEMPRE desativa o loading; recarrega dados apenas se a operação foi bem-sucedida
      setLoading(false);
      if (saveSuccess) {
        loadDatabaseData().catch(loadErr => console.error('[saveBanner] Erro ao recarregar dados:', loadErr));
      }
    }
  };


  const deleteBanner = async (id: string) => {
    askConfirmation(
      'Confirmar Exclusão',
      'Excluir este banner rotativo permanentemente?',
      async () => {
        setLoading(true);
        try {
          const bannerToDelete = banners.find((b) => b.id === id);

          // 1. Delete row from the database first
          const { error } = await supabase.from('banners').delete().eq('id', id);
          if (error) throw new Error(`Erro ao deletar banner do banco: ${error.message}`);

          // 2. Only if DB deletion succeeds, remove the file from Storage
          if (bannerToDelete?.imagem_url) {
            const path = getStoragePathFromUrl(bannerToDelete.imagem_url, 'banners');
            if (path) {
              await supabase.storage.from('banners').remove([path]);
            }
          }

          await logActivity('Banners', `Removeu o banner rotativo (ID: ${id}).`);
          showToast('Banner rotativo deletado com sucesso!');
          loadDatabaseData().catch(loadErr => console.error('[deleteBanner] Erro ao recarregar dados:', loadErr));
        } catch (err: any) {
          console.error('[deleteBanner] Erro:', err);
          showToast(err.message || 'Erro ao remover banner.', 'erro');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const toggleBannerStatus = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      {
        const { error } = await supabase.from('banners').update({ ativo: !currentStatus }).eq('id', id);
        if (error) throw error;
        await logActivity('Banners', `Alterou status do banner ID "${id}" para ${!currentStatus ? 'ATIVO' : 'INATIVO'}.`);
      }
      showToast('Status de ativação do banner alterado!');
      loadDatabaseData().catch(loadErr => console.error('[toggleBannerStatus] Erro ao recarregar dados:', loadErr));
    } catch (e) {
      console.error(e);
      showToast('Erro ao alterar status do banner.', 'erro');
    } finally {
      setLoading(false);
    }
  };

  const saveConfigs = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Verificação de integridade (RN.CONT.02)
    const numericPhone = sanitizeWhatsapp(configs.whatsapp_numero);
    if (numericPhone.length !== 10 && numericPhone.length !== 11) {
      showToast('O número de WhatsApp deve conter o DDD + número (ex: 11 99999-9999).', 'erro');
      return;
    }
    if (!configs.hero_config?.titulo?.trim()) {
      showToast('O título principal do Hero não pode estar vazio.', 'erro');
      return;
    }

    // Validação de CNPJ
    const rawCNPJ = configs.footer_config?.cnpj?.replace(/\D/g, '') || '';
    if (rawCNPJ.length > 0 && rawCNPJ.length !== 14) {
      showToast('O CNPJ deve conter exatamente 14 números (ex: 00.000.000/0001-00).', 'erro');
      return;
    }

    const soc = configs.footer_config?.links_sociais;
    if (soc) {
      if (soc.instagram && !validateSocialLink(soc.instagram, 'instagram')) {
        showToast('O Link do Instagram deve pertencer à rede do Instagram (ex: instagram.com/usuario).', 'erro');
        return;
      }
      if (soc.facebook && !validateSocialLink(soc.facebook, 'facebook')) {
        showToast('O Link do Facebook deve pertencer à rede do Facebook (ex: facebook.com/usuario).', 'erro');
        return;
      }
      if (soc.youtube && !validateSocialLink(soc.youtube, 'youtube')) {
        showToast('O Link do YouTube deve pertencer à rede do YouTube (ex: youtube.com/canal).', 'erro');
        return;
      }
      if (soc.tiktok && !validateSocialLink(soc.tiktok, 'tiktok')) {
        showToast('O Link do TikTok deve pertencer à rede do TikTok (ex: tiktok.com/@usuario).', 'erro');
        return;
      }
    }

    setLoading(true);

    try {
      // 2. Validação se o ID da configuração existe no banco para evitar duplicatas (RN.CONT.01)
      const { data: existingConfig, error: fetchError } = await supabase
        .from('configuracoes')
        .select('id')
        .eq('id', 1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const payload: any = {
        whatsapp_numero: numericPhone,
        gemini_api_key: configs.gemini_api_key.trim(),
        groq_api_key: configs.groq_api_key.trim(),
        header_config: configs.header_config,
        hero_config: configs.hero_config,
        footer_config: configs.footer_config,
        features_config: configs.features_config,
        horarios_postagem: configs.horarios_postagem,
        banner_tempo_transicao: configs.banner_tempo_transicao || 6,
      };

      let saveError;
      if (!existingConfig) {
        // Se não existir, insere com ID 1
        const { error: insertError } = await supabase.from('configuracoes').insert({ id: 1, ...payload });
        saveError = insertError;
      } else {
        // Se existir, atualiza o registro único
        const { error: updateError } = await supabase.from('configuracoes').update(payload).eq('id', 1);
        saveError = updateError;
      }

      if (saveError) {
        throw saveError;
      } else {
        showToast('Configurações globais salvas no banco Supabase!');
      }

      await logActivity('Configurações', 'Atualizou as configurações globais do site.');
    } catch (e: any) {
      console.error(e);
      showToast(e.message || 'Erro ao salvar configurações.', 'erro');
      alert(`Erro ao salvar configurações:\n${e.message || e.details || JSON.stringify(e)}`);
    } finally {
      // SEMPRE desativa o loading, depois recarrega dados em background
      setLoading(false);
      loadDatabaseData().catch(loadErr => console.error('[saveConfigs] Erro ao recarregar dados:', loadErr));
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
      {
        const { error } = await supabase.from('afiliados').insert({
          nome_parceiro: name,
          codigo_ref: code,
        });
        if (error) throw error;
        await logActivity('Afiliados', `Cadastrou o afiliado "${name}" com o cupom de desconto "${code}".`);
      }

      setNovoAfiliado({ nome_parceiro: '', codigo_ref: '' });
      showToast('Afiliado cadastrado com sucesso!');
      loadDatabaseData().catch(loadErr => console.error('[addAfiliado] Erro ao recarregar dados:', loadErr));
    } catch (err: any) {
      console.error(err);
      showToast('Código de afiliado já existente.', 'erro');
    } finally {
      setLoading(false);
    }
  };

  const toggleAfiliado = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      {
        const { error } = await supabase.from('afiliados').update({ ativo: !currentStatus }).eq('id', id);
        if (error) throw error;
        const partner = afiliados.find(a => a.id === id);
        await logActivity('Afiliados', `Alterou o status do afiliado "${partner?.nome_parceiro || id}" para ${!currentStatus ? 'ATIVO' : 'INATIVO'}.`);
      }
      showToast('Status do afiliado alterado!');
      loadDatabaseData().catch(loadErr => console.error('[toggleAfiliado] Erro ao recarregar dados:', loadErr));
    } catch (e) {
      console.error(e);
      showToast('Erro ao alterar status do afiliado.', 'erro');
    } finally {
      setLoading(false);
    }
  };

  const deleteAfiliado = async (id: string) => {
    const partner = afiliados.find((a) => a.id === id);
    askConfirmation(
      'Confirmar Exclusão de Parceiro',
      `Deseja realmente excluir permanentemente o parceiro de indicação "${partner?.nome_parceiro || 'este parceiro'}"? O código de referência deixará de pontuar.`,
      async () => {
        setLoading(true);
        try {
          const { error } = await supabase.from('afiliados').delete().eq('id', id);
          if (error) throw error;

          await logActivity('Afiliados', `Excluiu o parceiro de indicação "${partner?.nome_parceiro || id}" (código: ${partner?.codigo_ref}).`);
          showToast('Parceiro de indicação excluído!');
          loadDatabaseData().catch(loadErr => console.error('[deleteAfiliado] Erro ao recarregar dados:', loadErr));
        } catch (err: any) {
          console.error('[deleteAfiliado] Erro:', err);
          showToast(err.message || 'Erro ao remover parceiro de indicação.', 'erro');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const saveNivel = async (adminId: string, email: string, role: 'SUPER_ADMIN' | 'ADMIN') => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('administradores')
        .update({ role })
        .eq('id', adminId);
      if (error) throw error;
      
      await logActivity('Gestão de Acesso', `Alterou o nível de acesso do administrador "${email}" para "${role}".`);
      setListaAdmins(prev => prev.map(a => a.id === adminId ? { ...a, role } : a));
      showToast(`Nível de ${email} atualizado para ${role}`);
    } catch (err: any) {
      console.error('[saveNivel] Erro:', err);
      showToast(`Erro ao atualizar nível: ${err.message}`, 'erro');
    } finally {
      setLoading(false);
    }
  };

  const saveStatus = async (adminId: string, email: string, status: 'ATIVO' | 'BLOQUEADO' | 'PENDENTE') => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('administradores')
        .update({ status })
        .eq('id', adminId);
      if (error) throw error;
      
      await logActivity('Gestão de Acesso', `Alterou o status de acesso do administrador "${email}" para "${status}".`);
      setListaAdmins(prev => prev.map(a => a.id === adminId ? { ...a, status } : a));
      showToast(`Status de ${email} alterado para ${status}`);
    } catch (err: any) {
      console.error('[saveStatus] Erro:', err);
      showToast(`Erro ao alterar status: ${err.message}`, 'erro');
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
      quantidade_estoque: '10',
      status_produto: 'ativo',
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
      quantidade_estoque: String(pneu.quantidade_estoque !== undefined ? pneu.quantidade_estoque : 10),
      status_produto: pneu.status_produto || 'ativo',
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

  // Tela de carregamento de autenticação — exibida enquanto verifica a sessão
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-48 h-12 flex items-center justify-center">
            <img src="/logoiAlves.png" alt="iAlves Pneus" className="h-full w-auto object-contain" />
          </div>
          <div className="w-8 h-8 border-2 border-[#E11D48] border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Interface de Login caso não esteja autenticado
  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex flex-col items-center justify-center p-4 relative selection:bg-[#E11D48] selection:text-white">
        <div className="absolute w-[400px] h-[400px] bg-[#E11D48]/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="glass-panel max-w-md w-full p-8 sm:p-10 rounded-none border-t-4 border-t-[#E11D48] relative z-10 text-center space-y-8">
          <div className="space-y-2">
            <div className="relative w-64 h-16 flex items-center justify-center mx-auto">
              <img src={configs.header_config?.logo_url || "/logoiAlves.png"} alt="iAlves Pneus Logo" className="h-full w-auto object-contain" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-white mt-4">
              CENTRAL DA <span className="text-[#E11D48]">DIRETORIA</span>
            </h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Ecossistema iAlves Pneus</p>
          </div>

          <div className="space-y-4">
            {authMsg && (
              <div className="p-4 bg-red-950/20 border border-red-900/30 text-red-400 text-xs font-bold uppercase tracking-wider rounded-none leading-relaxed">
                {authMsg}
              </div>
            )}
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
          <div className="relative w-44 h-11 shrink-0 flex items-center justify-start">
            <img src={configs.header_config?.logo_url || "/logoiAlves.png"} alt="iAlves Logo" className="h-full w-auto object-contain" />
          </div>
          <div>
            <h1 className="text-base font-black uppercase tracking-widest text-white leading-none">
              Diretoria <span className="text-[#E11D48]">iAlves</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
              PAINEL ADMINISTRATIVO
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
            onClick={() => changeTab('pneus')}
            className={`w-full text-left px-4 py-3 text-xs font-extrabold uppercase tracking-widest transition-all duration-300 rounded-none flex items-center gap-3 cursor-pointer ${
              activeTab === 'pneus' ? 'bg-[#E11D48] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            📊 Gerenciar Estoque
          </button>

          <button
            onClick={() => changeTab('banners')}
            className={`w-full text-left px-4 py-3 text-xs font-extrabold uppercase tracking-widest transition-all duration-300 rounded-none flex items-center gap-3 cursor-pointer ${
              activeTab === 'banners' ? 'bg-[#E11D48] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🖼 Banners Rotativos
          </button>

          <button
            onClick={() => changeTab('configuracoes')}
            className={`w-full text-left px-4 py-3 text-xs font-extrabold uppercase tracking-widest transition-all duration-300 rounded-none flex items-center gap-3 cursor-pointer ${
              activeTab === 'configuracoes' ? 'bg-[#E11D48] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            ⚙ Configurações Globais
          </button>

          <button
            onClick={() => changeTab('afiliados')}
            className={`w-full text-left px-4 py-3 text-xs font-extrabold uppercase tracking-widest transition-all duration-300 rounded-none flex items-center gap-3 cursor-pointer ${
              activeTab === 'afiliados' ? 'bg-[#E11D48] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🤝 Rede de Afiliados
          </button>

          <button
            onClick={() => changeTab('auditoria')}
            className={`w-full text-left px-4 py-3 text-xs font-extrabold uppercase tracking-widest transition-all duration-300 rounded-none flex items-center gap-3 cursor-pointer ${
              activeTab === 'auditoria' ? 'bg-[#E11D48] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🛡 Auditoria de Segurança
          </button>

          <button
            onClick={() => changeTab('acessos')}
            className={`w-full text-left px-4 py-3 text-xs font-extrabold uppercase tracking-widest transition-all duration-300 rounded-none flex items-center gap-3 cursor-pointer ${
              activeTab === 'acessos' ? 'bg-[#E11D48] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            🔐 Gestão de Acesso
          </button>

          {/* Monitor de Uso de Recursos */}
          <div className="pt-6 border-t border-gray-900 space-y-4">
            <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest px-3">Monitor de Recursos</p>
            <div className="glass-panel p-4 rounded-none border-l-2 border-l-[#E11D48] bg-black/40 space-y-3">
              <div>
                <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-gray-400">
                  <span>Banco de Dados</span>
                  <span className="text-white font-mono">{dbSize}</span>
                </div>
                <div className="w-full bg-gray-900 h-1.5 mt-1 relative overflow-hidden">
                  <div 
                    className="bg-[#E11D48] h-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (parseFloat(dbSize) || 0.1) / 500 * 100)}%` }}
                  />
                </div>
                <p className="text-[8px] text-gray-500 font-bold uppercase mt-1">Limite Plano Free: 500 MB</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center border-t border-gray-900/60 pt-2.5">
                <div>
                  <p className="text-[15px] font-black text-white leading-none">{pneus.length}</p>
                  <p className="text-[7.5px] text-gray-500 font-black uppercase tracking-wider mt-1">Cadastrados</p>
                </div>
                <div>
                  <p className="text-[15px] font-black text-green-400 leading-none">
                    {pneus.filter(p => p.status_produto === 'ativo' && (p.quantidade_estoque ?? 0) > 0).length}
                  </p>
                  <p className="text-[7.5px] text-gray-500 font-black uppercase tracking-wider mt-1">Ativos</p>
                </div>
                <div>
                  <p className="text-[15px] font-black text-red-400 leading-none">
                    {pneus.filter(p => (p.quantidade_estoque ?? 0) === 0).length}
                  </p>
                  <p className="text-[7.5px] text-gray-500 font-black uppercase tracking-wider mt-1">Esgotados</p>
                </div>
                <div>
                  <p className="text-[15px] font-black text-white leading-none">{banners.length}</p>
                  <p className="text-[7.5px] text-gray-500 font-black uppercase tracking-wider mt-1">Banners</p>
                </div>
              </div>

              <div className="text-[8px] text-gray-500 font-medium leading-normal border-t border-gray-900/60 pt-2.5">
                <span className="text-amber-500 font-bold">⚠️ Nota:</span> O limite do plano gratuito do Supabase é de 500MB de banco de dados e 1GB de armazenamento de arquivos (Storage).
              </div>
            </div>
          </div>
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

          {/* Overlay de loading removido: cada botão de ação gerencia seu próprio estado */}

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
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-white/5 text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-900">
                      <th className="p-4 w-12 text-center">#</th>
                      <th className="p-4">Foto</th>
                      <th className="p-4">Marca / Nome</th>
                      <th className="p-4">Categoria</th>
                      <th className="p-4">Medida Nominal</th>
                      <th className="p-4">Largura</th>
                      <th className="p-4">Perfil</th>
                      <th className="p-4">Aro</th>
                      <th className="p-4">Preço à Vista</th>
                      <th className="p-4 text-center">Estoque</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900 text-xs">
                    {pneus.map((pneu, index) => {
                      const isProductActive = pneu.status_produto === 'ativo' && (pneu.quantidade_estoque ?? 0) > 0;
                      return (
                        <tr key={pneu.id} className="hover:bg-white/2 transition-colors">
                          <td className="p-4 text-center text-gray-500 font-bold">{index + 1}</td>
                          <td className="p-4">
                            <div className="relative w-12 h-12 bg-black border border-gray-800 p-1 flex items-center justify-center">
                              <Image src={pneu.imagem_url} alt={pneu.nome} width={40} height={40} unoptimized className="object-contain max-h-full" />
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
                          <td className="p-4 text-center font-bold text-gray-200">
                            {pneu.quantidade_estoque !== undefined ? pneu.quantidade_estoque : 10}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 border ${
                              isProductActive 
                                ? 'bg-green-950/20 border-green-900/30 text-green-500' 
                                : 'bg-red-950/20 border-red-900/30 text-red-500'
                            }`}>
                              {isProductActive ? 'Ativo' : (pneu.quantidade_estoque ?? 0) === 0 ? 'Esgotado' : 'Inativo'}
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
                                onClick={() => toggleStatusPneu(pneu)}
                                className={`px-3 py-1.5 border text-xs font-bold uppercase tracking-wider cursor-pointer ${
                                  pneu.status_produto === 'ativo'
                                    ? 'border-amber-950 bg-amber-950/10 hover:bg-amber-900/30 text-amber-400'
                                    : 'border-green-950 bg-green-950/10 hover:bg-green-900/30 text-green-400'
                                }`}
                              >
                                {pneu.status_produto === 'ativo' ? 'Desativar' : 'Ativar'}
                              </button>
                              <button
                                onClick={() => deletePneu(pneu.id)}
                                className="px-2 py-1.5 text-gray-600 hover:text-red-500 text-[10px] font-bold uppercase tracking-wider cursor-pointer border border-transparent hover:border-red-900/20 rounded-none bg-transparent"
                                title="Excluir permanentemente do banco e storage"
                              >
                                Excluir Físico
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {pneus.length === 0 && (
                      <tr>
                        <td colSpan={12} className="p-8 text-center text-gray-500 font-bold uppercase tracking-wide">
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
                            <Image src={banner.imagem_url} alt="Banner" fill unoptimized sizes="128px" className="object-cover" />
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

              <form onSubmit={saveConfigs} className="glass-panel p-6 sm:p-8 rounded-none space-y-8">
                
                {/* BLOCO 1: HEADER CONFIG */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#E11D48] border-b border-gray-900 pb-2">
                    Header Config (Cabeçalho do Site)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-400">Logotipo da Empresa</label>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-4 bg-black border border-gray-800 px-4 py-2">
                          {configs.header_config?.logo_url && (
                            <div className="relative w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                              <img src={configs.header_config.logo_url} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                            </div>
                          )}
                          <div className="flex-1 text-xs text-gray-500 font-mono truncate">
                            {configs.header_config?.logo_url || "Nenhum logotipo enviado"}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <label className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-800 hover:border-gray-600 bg-white/5 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors text-center w-full">
                            <span>{uploadingLogo ? 'Enviando...' : 'Fazer Upload'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              disabled={uploadingLogo}
                              className="hidden"
                            />
                          </label>
                          {configs.header_config?.logo_url && configs.header_config.logo_url !== '/logoiAlves.png' && (
                            <button
                              type="button"
                              onClick={removeLogo}
                              disabled={removingLogo}
                              className="px-4 py-2 border border-red-950/60 hover:border-red-600 bg-red-950/20 hover:bg-red-950/40 text-red-400 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              {removingLogo ? 'Removendo...' : 'Remover Logo'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase text-gray-400">Texto de Aviso do Topo (Barra de Frete)</label>
                        <input
                          type="text"
                          value={configs.header_config?.aviso_topo || ''}
                          onChange={(e) => setConfigs({
                            ...configs,
                            header_config: {
                              ...configs.header_config!,
                              aviso_topo: e.target.value
                            }
                          })}
                          className="w-full bg-black border border-gray-800 px-4 py-2.5 rounded-none text-white focus:outline-none focus:border-[#E11D48]"
                        />
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-gray-400">Ativar Barra de Aviso</label>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={configs.header_config?.aviso_ativo || false}
                            onChange={(e) => setConfigs({
                              ...configs,
                              header_config: {
                                ...configs.header_config!,
                                aviso_ativo: e.target.checked
                              }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E11D48]"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BLOCO 1.5: CARROSSEL CONFIG */}
                <div className="space-y-4 pt-4 border-t border-gray-900">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#E11D48] border-b border-gray-900 pb-2">
                    Carrossel Config (Tempo de Transição)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-400">Tempo de Exibição do Slide (segundos)</label>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        required
                        value={configs.banner_tempo_transicao || 6}
                        onChange={(e) => setConfigs({
                          ...configs,
                          banner_tempo_transicao: parseInt(e.target.value) || 6
                        })}
                        placeholder="Ex: 6"
                        className="w-full bg-black border border-gray-800 px-4 py-2.5 rounded-none text-white focus:outline-none focus:border-[#E11D48]"
                      />
                      <p className="text-[9px] text-gray-500 font-bold uppercase">Define o tempo em segundos que cada banner promocional é exibido antes de mudar automaticamente.</p>
                    </div>
                  </div>
                </div>

                {/* BLOCO 2: HERO CONFIG */}
                <div className="space-y-4 pt-4 border-t border-gray-900">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#E11D48] border-b border-gray-900 pb-2">
                    Hero Config (Banner de Entrada da Vitrine)
                  </h3>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase text-gray-400">Título Principal do Hero</label>
                    <input
                      type="text"
                      value={configs.hero_config?.titulo || ''}
                      onChange={(e) => setConfigs({
                        ...configs,
                        hero_config: {
                          ...configs.hero_config!,
                          titulo: e.target.value
                        }
                      })}
                      className="w-full bg-black border border-gray-800 px-4 py-2.5 rounded-none text-white focus:outline-none focus:border-[#E11D48]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase text-gray-400">Subtítulo do Hero</label>
                    <textarea
                      rows={2}
                      value={configs.hero_config?.subtitulo || ''}
                      onChange={(e) => setConfigs({
                        ...configs,
                        hero_config: {
                          ...configs.hero_config!,
                          subtitulo: e.target.value
                        }
                      })}
                      className="w-full bg-black border border-gray-800 px-4 py-2.5 rounded-none text-white focus:outline-none focus:border-[#E11D48] text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* BLOCO 3: FOOTER CONFIG */}
                <div className="space-y-4 pt-4 border-t border-gray-900">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#E11D48] border-b border-gray-900 pb-2">
                    Footer Config (Rodapé Institucional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-400">CNPJ da Empresa</label>
                      <input
                        type="text"
                        value={configs.footer_config?.cnpj || ''}
                        onChange={(e) => setConfigs({
                          ...configs,
                          footer_config: {
                            ...configs.footer_config!,
                            cnpj: maskCNPJ(e.target.value)
                          }
                        })}
                        onBlur={(e) => handleCNPJBlur(e.target.value)}
                        placeholder="00.000.000/0001-00"
                        className={`w-full bg-black border ${socialErrors.cnpj ? 'border-red-600 focus:border-red-500' : 'border-gray-800 focus:border-[#E11D48]'} px-4 py-2.5 rounded-none text-white focus:outline-none text-xs font-semibold`}
                      />
                      {socialErrors.cnpj && (
                        <p className="text-[10px] font-bold text-red-500 uppercase">{socialErrors.cnpj}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-400">Direitos Reservados (Nome)</label>
                      <input
                        type="text"
                        value={configs.footer_config?.direitos_reservados || ''}
                        onChange={(e) => setConfigs({
                          ...configs,
                          footer_config: {
                            ...configs.footer_config!,
                            direitos_reservados: e.target.value
                          }
                        })}
                        placeholder="iAlves Pneus"
                        className="w-full bg-black border border-gray-800 px-4 py-2.5 rounded-none text-white focus:outline-none focus:border-[#E11D48] text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-400">Texto Legal de Rodapé</label>
                      <input
                        type="text"
                        value={configs.footer_config?.texto_rodape || ''}
                        onChange={(e) => setConfigs({
                          ...configs,
                          footer_config: {
                            ...configs.footer_config!,
                            texto_rodape: e.target.value
                          }
                        })}
                        className="w-full bg-black border border-gray-800 px-4 py-2.5 rounded-none text-white focus:outline-none focus:border-[#E11D48] text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-400">Link do Instagram</label>
                      <input
                        type="text"
                        value={configs.footer_config?.links_sociais?.instagram || ''}
                        onChange={(e) => setConfigs({
                          ...configs,
                          footer_config: {
                            ...configs.footer_config!,
                            links_sociais: {
                              ...configs.footer_config!.links_sociais,
                              instagram: e.target.value
                            }
                          }
                        })}
                        onBlur={(e) => handleSocialBlur('instagram', e.target.value)}
                        placeholder="https://instagram.com/..."
                        className={`w-full bg-black border ${socialErrors.instagram ? 'border-red-600 focus:border-red-500' : 'border-gray-800 focus:border-gray-500'} px-4 py-2.5 rounded-none text-white focus:outline-none font-mono text-xs`}
                      />
                      {socialErrors.instagram && (
                        <p className="text-[10px] font-bold text-red-500 uppercase">{socialErrors.instagram}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-400">Link do Facebook</label>
                      <input
                        type="text"
                        value={configs.footer_config?.links_sociais?.facebook || ''}
                        onChange={(e) => setConfigs({
                          ...configs,
                          footer_config: {
                            ...configs.footer_config!,
                            links_sociais: {
                              ...configs.footer_config!.links_sociais,
                              facebook: e.target.value
                            }
                          }
                        })}
                        onBlur={(e) => handleSocialBlur('facebook', e.target.value)}
                        placeholder="https://facebook.com/..."
                        className={`w-full bg-black border ${socialErrors.facebook ? 'border-red-600 focus:border-red-500' : 'border-gray-800 focus:border-gray-500'} px-4 py-2.5 rounded-none text-white focus:outline-none font-mono text-xs`}
                      />
                      {socialErrors.facebook && (
                        <p className="text-[10px] font-bold text-red-500 uppercase">{socialErrors.facebook}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-400">Link do YouTube</label>
                      <input
                        type="text"
                        value={configs.footer_config?.links_sociais?.youtube || ''}
                        onChange={(e) => setConfigs({
                          ...configs,
                          footer_config: {
                            ...configs.footer_config!,
                            links_sociais: {
                              ...configs.footer_config!.links_sociais,
                              youtube: e.target.value
                            }
                          }
                        })}
                        onBlur={(e) => handleSocialBlur('youtube', e.target.value)}
                        placeholder="https://youtube.com/..."
                        className={`w-full bg-black border ${socialErrors.youtube ? 'border-red-600 focus:border-red-500' : 'border-gray-800 focus:border-gray-500'} px-4 py-2.5 rounded-none text-white focus:outline-none font-mono text-xs`}
                      />
                      {socialErrors.youtube && (
                        <p className="text-[10px] font-bold text-red-500 uppercase">{socialErrors.youtube}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase text-gray-400">Link do TikTok</label>
                      <input
                        type="text"
                        value={configs.footer_config?.links_sociais?.tiktok || ''}
                        onChange={(e) => setConfigs({
                          ...configs,
                          footer_config: {
                            ...configs.footer_config!,
                            links_sociais: {
                              ...configs.footer_config!.links_sociais,
                              tiktok: e.target.value
                            }
                          }
                        })}
                        onBlur={(e) => handleSocialBlur('tiktok', e.target.value)}
                        placeholder="https://tiktok.com/..."
                        className={`w-full bg-black border ${socialErrors.tiktok ? 'border-red-600 focus:border-red-500' : 'border-gray-800 focus:border-gray-500'} px-4 py-2.5 rounded-none text-white focus:outline-none font-mono text-xs`}
                      />
                      {socialErrors.tiktok && (
                        <p className="text-[10px] font-bold text-red-500 uppercase">{socialErrors.tiktok}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* BLOCO 4: FEATURES CONFIG */}
                <div className="space-y-4 pt-4 border-t border-gray-900">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#E11D48] border-b border-gray-900 pb-2">
                    Features Config (Ativação de Recursos)
                  </h3>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-white">Barra de Frete Grátis Ativa</label>
                      <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Exibe/oculta a barra promocional do frete</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={configs.features_config?.frete_ativo || false}
                        onChange={(e) => setConfigs({
                          ...configs,
                          features_config: {
                            ...configs.features_config!,
                            frete_ativo: e.target.checked
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E11D48]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-2 border-t border-gray-900/60">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-white">Rede de Afiliados Ativa</label>
                      <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Habilita/desabilita o programa de afiliados (Indicação Premiada)</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={configs.features_config?.afiliado_ativo || false}
                        onChange={(e) => setConfigs({
                          ...configs,
                          features_config: {
                            ...configs.features_config!,
                            afiliado_ativo: e.target.checked
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E11D48]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-2 border-t border-gray-900/60">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-white">Blog com IA Autônomo Ativo</label>
                      <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">Permite a geração e publicação automática de posts via inteligência artificial</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={configs.features_config?.blog_ia_ativo || false}
                        onChange={(e) => setConfigs({
                          ...configs,
                          features_config: {
                            ...configs.features_config!,
                            blog_ia_ativo: e.target.checked
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E11D48]"></div>
                    </label>
                  </div>
                </div>

                {/* API KEYS / CONTATOS GERAIS */}
                <div className="space-y-4 pt-4 border-t border-gray-900">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-gray-900 pb-2">
                    ⚙️ Chaves de API e Contato WhatsApp
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
                      <label className="block text-[10px] font-bold uppercase text-gray-400">Gemini API Key</label>
                      <input
                        type="password"
                        value={configs.gemini_api_key}
                        onChange={(e) => setConfigs({ ...configs, gemini_api_key: e.target.value })}
                        placeholder="AIzaSy..."
                        className="w-full bg-black border border-gray-800 px-4 py-2.5 rounded-none text-white focus:outline-none focus:border-gray-500 font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="pt-4 border-t border-gray-900">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-4 bg-[#E11D48] hover:bg-[#F43F5E] text-white font-extrabold uppercase text-xs tracking-wider transition-all duration-300 rounded-none cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                        Salvando...
                      </>
                    ) : (
                      'Gravar Configurações Gerais'
                    )}
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
                    disabled={loading}
                    className="w-full py-3 bg-[#E11D48] hover:bg-[#F43F5E] text-white font-extrabold uppercase text-xs tracking-wider transition-all duration-300 rounded-none cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                        Gerando...
                      </>
                    ) : (
                      'Gerar Link de Afiliado'
                    )}
                  </button>
                </form>
              </div>

              <div className="glass-panel rounded-none overflow-x-auto max-w-5xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-white/5 text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-900">
                      <th className="p-4">Nome do Parceiro</th>
                      <th className="p-4">Código Referência</th>
                      <th className="p-4">Link Exclusivo de Vendas</th>
                      <th className="p-4 text-center">Cliques (Link)</th>
                      <th className="p-4 text-center">WhatsApps</th>
                      <th className="p-4 text-center">Conversão</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900 text-sm">
                    {afiliados.map((afil) => {
                      const clicks = afiliadoLogs.filter((l) => l.afiliado_id === afil.id && l.evento === 'clique_link').length;
                      const wpp = afiliadoLogs.filter((l) => l.afiliado_id === afil.id && l.evento === 'clique_whatsapp').length;
                      const conversionRate = clicks > 0 ? ((wpp / clicks) * 100).toFixed(1) + '%' : '0.0%';
                      return (
                        <tr key={afil.id} className="hover:bg-white/2">
                          <td className="p-4 font-bold text-white">{afil.nome_parceiro}</td>
                          <td className="p-4 font-mono font-bold text-[#E11D48]">{afil.codigo_ref}</td>
                          <td className="p-4 text-xs">
                            <input
                              type="text"
                              readOnly
                              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${afil.codigo_ref}`}
                              className="bg-black/60 border border-gray-900 px-2.5 py-1 text-gray-400 font-mono rounded-none w-full max-w-[240px] select-all cursor-pointer"
                            />
                          </td>
                          <td className="p-4 text-center font-bold text-white">{clicks}</td>
                          <td className="p-4 text-center font-bold text-green-400">{wpp}</td>
                          <td className="p-4 text-center font-bold text-amber-500">{conversionRate}</td>
                          <td className="p-4">
                            <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 border ${
                              afil.ativo ? 'bg-green-950/20 border-green-900/30 text-green-500' : 'bg-red-950/20 border-red-900/30 text-red-500'
                            }`}>
                              {afil.ativo ? 'ativo' : 'inativo'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => toggleAfiliado(afil.id, afil.ativo)}
                                className="px-2.5 py-1.5 border border-gray-800 hover:border-gray-600 bg-white/5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                              >
                                {afil.ativo ? 'Pausar' : 'Ativar'}
                              </button>
                              <button
                                onClick={() => deleteAfiliado(afil.id)}
                                className="px-2.5 py-1.5 border border-red-900/30 hover:border-red-600 bg-red-950/10 text-[#EF4444] text-xs font-bold uppercase tracking-wider cursor-pointer"
                              >
                                Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {afiliados.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-gray-500 font-bold uppercase tracking-wide">
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
            <div className="space-y-10">
              {/* Seção 1: Histórico de Alterações */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-wider text-white">Histórico de Alterações</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase mt-1">Registro em tempo real de modificações realizadas no painel</p>
                </div>

                <div className="glass-panel rounded-none overflow-x-auto max-w-5xl">
                  <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                    <thead>
                      <tr className="bg-white/5 text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-900">
                        <th className="p-4 w-1/4">Usuário</th>
                        <th className="p-4 w-1/6">Ação</th>
                        <th className="p-4">Descrição da Alteração</th>
                        <th className="p-4 w-1/5">Data / Hora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-900 text-sm">
                      {activityLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/2 transition-colors">
                          <td className="p-4 font-bold text-white break-all">{log.usuario}</td>
                          <td className="p-4">
                            <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 border ${
                              log.acao === 'Estoque' ? 'bg-indigo-950/20 border-indigo-800/30 text-indigo-400' :
                              log.acao === 'Banners' ? 'bg-pink-950/20 border-pink-800/30 text-pink-400' :
                              log.acao === 'Configurações' ? 'bg-orange-950/20 border-orange-800/30 text-orange-400' :
                              log.acao === 'Afiliados' ? 'bg-teal-950/20 border-teal-800/30 text-teal-400' :
                              'bg-rose-950/20 border-rose-800/30 text-rose-400'
                            }`}>
                              {log.acao}
                            </span>
                          </td>
                          <td className="p-4 text-gray-300 font-medium">{log.descricao}</td>
                          <td className="p-4 text-gray-500 font-mono text-xs">
                            {new Date(log.created_at).toLocaleString('pt-BR')}
                          </td>
                        </tr>
                      ))}
                      {activityLogs.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-gray-500 font-bold uppercase tracking-wider">
                            Nenhuma alteração registrada ainda.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Seção 2: Registro de Acessos (Logins) */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-wider text-white">Registro de Acessos (Login)</h2>
                  <p className="text-xs text-gray-500 font-bold uppercase mt-1">Logs de autenticação de administradores</p>
                </div>

                <div className="glass-panel rounded-none overflow-x-auto max-w-4xl">
                  <table className="w-full text-left border-collapse text-xs min-w-[500px]">
                    <thead>
                      <tr className="bg-white/5 text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-900">
                        <th className="p-4">E-mail Tentado</th>
                        <th className="p-4">Data / Hora do Evento</th>
                        <th className="p-4">Status da Tentativa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-900 text-sm">
                      {audits.map((aud) => (
                        <tr key={aud.id} className="hover:bg-white/2 transition-colors">
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
                      {audits.length === 0 && (
                        <tr>
                          <td colSpan={3} className="p-8 text-center text-gray-500 font-bold uppercase tracking-wider">
                            Nenhum registro de acesso encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* ABA: GESTÃO DE ACESSO (Visível apenas para o Super Admin)         */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'acessos' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-wider text-white">Gestão de Acesso</h2>
                <p className="text-xs text-gray-500 font-bold uppercase mt-1">Controle de e-mails autorizados a acessar a Central da Diretoria</p>
              </div>

              {/* Formulário para Conceder Acesso */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const email = novoAdminEmail.trim().toLowerCase();
                  if (!email || !email.includes('@')) {
                    showToast('Informe um e-mail válido.', 'erro');
                    return;
                  }
                  if (listaAdmins.some((a) => a.email === email)) {
                    showToast('Este e-mail já possui acesso.', 'erro');
                    return;
                  }
                  setLoading(true);
                  try {
                    const { data, error } = await supabase
                      .from('administradores')
                      .insert({ email, role: 'ADMIN', status: 'ATIVO' })
                      .select('id, email, role, status')
                      .single();
                    if (error) throw new Error(`Erro ao conceder acesso: ${error.message}`);
                    await logActivity('Gestão de Acesso', `Concedeu novo acesso de administrador para o e-mail "${email}".`);
                    if (data) {
                      setListaAdmins([...listaAdmins, { id: data.id, email: data.email, role: data.role, status: data.status }]);
                    }
                    setNovoAdminEmail('');
                    showToast(`Acesso concedido para ${email}`);
                  } catch (err: any) {
                    console.error('[addAdmin]', err);
                    showToast(err.message || 'Falha ao conceder acesso.', 'erro');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="glass-panel p-6 rounded-none max-w-2xl space-y-4"
              >
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Conceder Novo Acesso</h3>
                <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                  <div className="flex-1 w-full space-y-1">
                    <label className="block text-[9px] text-gray-400 font-black uppercase tracking-wider">E-mail do Administrador</label>
                    <input
                      type="email"
                      required
                      value={novoAdminEmail}
                      onChange={(e) => setNovoAdminEmail(e.target.value)}
                      placeholder="exemplo@gmail.com"
                      className="w-full bg-black border border-gray-800 px-3 py-2.5 text-xs rounded-none text-white focus:outline-none focus:border-[#E11D48] placeholder:text-gray-700"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#22C55E] hover:bg-[#16A34A] text-white font-extrabold uppercase text-[10px] tracking-wider transition-all rounded-none cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    + Conceder Acesso
                  </button>
                </div>
              </form>

              {/* Lista de Administradores Cadastrados */}
              <div className="glass-panel rounded-none overflow-x-auto max-w-4xl">
                <table className="w-full min-w-[700px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-white/5 text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-900">
                      <th className="p-4">E-mail Autorizado</th>
                      <th className="p-4">Nível</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900 text-sm">
                    {listaAdmins.map((admin) => (
                      <tr key={admin.email} className="hover:bg-white/2 transition-colors">
                        <td className="p-4 font-bold text-white">{admin.email}</td>
                        <td className="p-4">
                          {isSuperAdmin ? (
                            <select
                              value={admin.role}
                              disabled={loading || admin.email === userEmail}
                              onChange={(e) => saveNivel(admin.id!, admin.email, e.target.value as 'SUPER_ADMIN' | 'ADMIN')}
                              className="bg-black border border-gray-800 text-white text-xs px-2.5 py-1 rounded-none focus:outline-none focus:border-[#E11D48] cursor-pointer disabled:opacity-50"
                            >
                              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          ) : (
                            <span className="inline-block text-[10px] font-black uppercase px-3 py-1 border bg-blue-950/20 border-blue-800/30 text-blue-400">
                              {admin.role}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {admin.status === 'ATIVO' && (
                            <span className="inline-block text-[9px] font-black uppercase px-2.5 py-0.5 border bg-green-950/20 border-green-800/30 text-green-400">
                              ATIVO
                            </span>
                          )}
                          {admin.status === 'BLOQUEADO' && (
                            <span className="inline-block text-[9px] font-black uppercase px-2.5 py-0.5 border bg-red-950/20 border-red-800/30 text-red-400">
                              BLOQUEADO
                            </span>
                          )}
                          {(admin.status === 'PENDENTE' || !admin.status) && (
                            <span className="inline-block text-[9px] font-black uppercase px-2.5 py-0.5 border bg-yellow-950/20 border-yellow-800/30 text-yellow-400">
                              PENDENTE
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right flex items-center justify-end gap-3">
                          {isSuperAdmin && admin.email !== userEmail && (
                            <>
                              {admin.status !== 'ATIVO' ? (
                                <button
                                  type="button"
                                  onClick={() => saveStatus(admin.id!, admin.email, 'ATIVO')}
                                  disabled={loading}
                                  className="px-2.5 py-1.5 bg-green-950/40 hover:bg-green-900/60 border border-green-800/40 text-green-400 hover:text-green-300 font-extrabold uppercase text-[9px] tracking-wider transition-all rounded-none cursor-pointer disabled:opacity-50"
                                >
                                  Liberar Acesso
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => saveStatus(admin.id!, admin.email, 'BLOQUEADO')}
                                  disabled={loading}
                                  className="px-2.5 py-1.5 bg-yellow-950/40 hover:bg-yellow-900/60 border border-yellow-800/40 text-yellow-400 hover:text-yellow-300 font-extrabold uppercase text-[9px] tracking-wider transition-all rounded-none cursor-pointer disabled:opacity-50"
                                >
                                  Bloquear
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  askConfirmation(
                                    'Revogar Acesso',
                                    `Revogar acesso de ${admin.email}? Este usuário não poderá mais acessar a Central da Diretoria.`,
                                    async () => {
                                      setLoading(true);
                                      try {
                                        const { error } = await supabase.from('administradores').delete().eq('email', admin.email);
                                        if (error) throw new Error(`Erro ao revogar acesso: ${error.message}`);
                                        await logActivity('Gestão de Acesso', `Revogou o acesso do administrador "${admin.email}".`);
                                        setListaAdmins(listaAdmins.filter(a => a.email !== admin.email));
                                        showToast(`Acesso revogado para ${admin.email}`);
                                      } catch (err: any) {
                                        console.error('[removeAdmin]', err);
                                        showToast(err.message || 'Falha ao revogar acesso.', 'erro');
                                      } finally {
                                        setLoading(false);
                                      }
                                    }
                                  );
                                }}
                                disabled={loading}
                                className="px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-400 hover:text-red-300 font-extrabold uppercase text-[9px] tracking-wider transition-all rounded-none cursor-pointer disabled:opacity-50"
                              >
                                Remover Acesso
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    {listaAdmins.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-600 font-bold uppercase text-xs">
                          Nenhum administrador encontrado. Execute o script SQL de inicialização.
                        </td>
                      </tr>
                    )}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] text-gray-400 font-black uppercase tracking-wider">Quantidade em Estoque</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={pneuForm.quantidade_estoque}
                    onChange={(e) => setPneuForm({ ...pneuForm, quantidade_estoque: e.target.value })}
                    className="w-full bg-black border border-gray-800 px-3 py-2 text-xs rounded-none text-white focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] text-gray-400 font-black uppercase tracking-wider">Status do Produto</label>
                  <select
                    value={pneuForm.status_produto}
                    onChange={(e) => setPneuForm({ ...pneuForm, status_produto: e.target.value })}
                    className="w-full bg-black border border-gray-800 px-3 py-2 text-xs rounded-none text-white focus:outline-none focus:border-[#E11D48]"
                  >
                    <option value="ativo">Ativo na Vitrine</option>
                    <option value="inativo">Inativo / Oculto</option>
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
                    <Image src={pneuForm.imagem_url} alt="Previa" width={55} height={55} unoptimized className="object-contain max-h-full" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-900">
                <button
                  type="submit"
                  disabled={isUploading || loading}
                  className="flex-1 px-4 py-3 bg-[#E11D48] hover:bg-[#F43F5E] text-white font-extrabold uppercase text-xs tracking-wider transition-all rounded-none cursor-pointer text-center disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                      Salvando...
                    </>
                  ) : (
                    'Confirmar Cadastro'
                  )}
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
                    <Image src={bannerForm.imagem_url} alt="Previa Banner" fill unoptimized sizes="(max-width: 768px) 100vw, 500px" className="object-cover" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-900">
                <button
                  type="submit"
                  disabled={isUploading || isLoading}
                  className="flex-1 px-4 py-3 bg-[#E11D48] hover:bg-[#F43F5E] text-white font-extrabold uppercase text-xs tracking-wider transition-all rounded-none cursor-pointer text-center disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                      Salvando...
                    </>
                  ) : (
                    'Confirmar Banner'
                  )}
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



      {/* Confirmação customizada */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-panel max-w-sm w-full p-6 border-t-4 border-t-[#E11D48] space-y-6 animate-scale-up">
            <div className="space-y-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-[#E11D48]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {confirmDialog.title}
              </h3>
              <p className="text-xs text-gray-400 font-bold uppercase leading-relaxed">{confirmDialog.message}</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 bg-transparent hover:bg-white/5 border border-gray-800 text-gray-400 hover:text-white font-extrabold uppercase text-[10px] tracking-wider transition-all duration-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 bg-[#E11D48] hover:bg-[#F43F5E] text-white font-extrabold uppercase text-[10px] tracking-wider transition-all duration-200 cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Container de Toasts de Notificação */}
      <div className="fixed bottom-6 right-6 z-[100] space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto glass-panel p-4 border-l-4 flex items-start justify-between gap-3 shadow-2xl transition-all duration-300 animate-slide-in ${
              t.type === 'sucesso' ? 'border-l-green-500 bg-green-950/20' :
              t.type === 'erro' ? 'border-l-red-500 bg-red-950/20' :
              'border-l-blue-500 bg-blue-950/20'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {t.type === 'sucesso' && (
                <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {t.type === 'erro' && (
                <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {t.type === 'info' && (
                <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">
                  {t.type === 'sucesso' ? 'Sucesso' : t.type === 'erro' ? 'Erro' : 'Notificação'}
                </p>
                <p className="text-xs text-white font-bold uppercase mt-0.5 leading-tight">{t.text}</p>
              </div>
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
              className="text-gray-500 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
