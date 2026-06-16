-- ═══════════════════════════════════════════════════════════════════
-- SCRIPT DE INICIALIZAÇÃO E CRIAÇÃO DAS TABELAS DO ECOSSISTEMA IALVES PNEUS
-- ═══════════════════════════════════════════════════════════════════
-- ⚠️  EXECUTE ESTE SCRIPT COMPLETO NO "SQL EDITOR" DO PAINEL DO SUPABASE.
-- ⚠️  Inclui DDL das tabelas, seeds de dados iniciais e policies de RLS
--     para resolver erros 401 (Unauthorized) na chave anônima pública.
-- ═══════════════════════════════════════════════════════════════════

-- Habilitar a extensão pgcrypto para UUID caso necessário
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABELA: administradores (E-mails autorizados a acessar a Central da Diretoria)
CREATE TABLE IF NOT EXISTS public.administradores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'ADMIN' CHECK (role IN ('SUPER_ADMIN', 'ADMIN')),
    status TEXT NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('ATIVO', 'BLOQUEADO', 'PENDENTE'))
);

-- Seed: Administrador principal autorizado como SUPER_ADMIN
INSERT INTO public.administradores (email, role, status) VALUES 
('nilson.brites@gmail.com', 'SUPER_ADMIN', 'ATIVO')
ON CONFLICT (email) DO UPDATE SET role = 'SUPER_ADMIN', status = 'ATIVO';


-- 2. TABELA: login_audits (Logs de auditoria e segurança de login)
CREATE TABLE IF NOT EXISTS login_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL CHECK (status IN ('sucesso', 'tentativa_bloqueada'))
);


-- 3. TABELA: afiliados (Parceiros com cupons de indicação ativos)
CREATE TABLE IF NOT EXISTS afiliados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_parceiro TEXT NOT NULL,
    codigo_ref TEXT UNIQUE NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed de Afiliados
INSERT INTO afiliados (nome_parceiro, codigo_ref, ativo) VALUES
('Marcos Caminhoneiro', 'marcos20', TRUE),
('Posto de Molas Rota Leste', 'rotaleste', TRUE)
ON CONFLICT (codigo_ref) DO NOTHING;


-- 4. TABELA: pneus (Catálogo de produtos da Vitrine)
CREATE TABLE IF NOT EXISTS pneus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    marca TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN ('Borrachudo', 'Liso')),
    medida TEXT NOT NULL,
    largura_mm INTEGER NOT NULL,
    perfil_proporcao INTEGER NOT NULL,
    aro_polegadas TEXT NOT NULL,
    sulco_mm NUMERIC NOT NULL,
    preco_vista NUMERIC NOT NULL,
    imagem_url TEXT NOT NULL,
    posicao_destaque INTEGER DEFAULT 0,
    visibilidade TEXT DEFAULT 'publico' CHECK (visibilidade IN ('publico', 'oculto')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed de Pneus (Dados idênticos ao ecossistema premium da iAlves)
INSERT INTO pneus (nome, marca, categoria, medida, largura_mm, perfil_proporcao, aro_polegadas, sulco_mm, preco_vista, imagem_url, posicao_destaque, visibilidade) VALUES
('ADVANCED', 'ADVANCED', 'Borrachudo', '295/80 R22.5', 295, 80, '22.5', 15.0, 1520.00, '/pneu_borrachudo.png', 10, 'publico'),
('WESTLAKE', 'WESTLAKE', 'Borrachudo', '295/80 R22.5', 295, 80, '22.5', 16.0, 1530.00, '/pneu_borrachudo.png', 9, 'publico'),
('DRC LS 741', 'DRC', 'Borrachudo', '295/80 R22.5', 295, 80, '22.5', 15.0, 1540.00, '/pneu_borrachudo.png', 8, 'publico'),
('XBRI FORZA PLUS F1', 'XBRI', 'Borrachudo', '295/80 R22.5', 295, 80, '22.5', 20.0, 1810.00, '/pneu_borrachudo.png', 7, 'publico'),
('ROYAL BLACK DV211', 'ROYAL BLACK', 'Borrachudo', '295/80 R22.5', 295, 80, '22.5', 20.0, 1850.00, '/pneu_borrachudo.png', 6, 'publico'),
('LINGLONG D960', 'LINGLONG', 'Borrachudo', '275/80 R22.5', 275, 80, '22.5', 18.0, 1390.00, '/pneu_borrachudo.png', 5, 'publico'),
('APLUS T605', 'APLUS', 'Borrachudo', '275/80 R22.5', 275, 80, '22.5', 17.0, 1420.00, '/pneu_borrachudo.png', 4, 'publico'),
('ROADONE HF768', 'ROADONE', 'Borrachudo', '315/80 R22.5', 315, 80, '22.5', 22.0, 2150.00, '/pneu_borrachudo.png', 3, 'publico'),
('SUPERCARGO', 'SUPERCARGO', 'Liso', '295/80 R22.5', 295, 80, '22.5', 15.0, 1380.00, '/pneu_liso.png', 10, 'publico'),
('APLUS T210', 'APLUS', 'Liso', '295/80 R22.5', 295, 80, '22.5', 16.0, 1390.00, '/pneu_liso.png', 9, 'publico'),
('WESTLAKE AZ570', 'WESTLAKE', 'Liso', '295/80 R22.5', 295, 80, '22.5', 15.0, 1410.00, '/pneu_liso.png', 8, 'publico'),
('XBRI FORZA IND2', 'XBRI', 'Liso', '295/80 R22.5', 295, 80, '22.5', 18.0, 1680.00, '/pneu_liso.png', 7, 'publico'),
('DRC D611', 'DRC', 'Liso', '295/80 R22.5', 295, 80, '22.5', 16.0, 1400.00, '/pneu_liso.png', 6, 'publico'),
('LINGLONG LFL812', 'LINGLONG', 'Liso', '275/80 R22.5', 275, 80, '22.5', 15.0, 1350.00, '/pneu_liso.png', 5, 'publico')
ON CONFLICT DO NOTHING;


-- 5. TABELA: banners (Banners promocionais rotativos do Carrossel)
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    imagem_url TEXT NOT NULL,
    link_redirecionamento TEXT DEFAULT '#',
    ativo BOOLEAN DEFAULT TRUE,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed de Banners Rotativos Iniciais
INSERT INTO banners (imagem_url, link_redirecionamento, ativo, ordem) VALUES
('/2.jpeg', '#vitrine-listagem', TRUE, 1),
('/3.jpeg', '#vitrine-listagem', TRUE, 2)
ON CONFLICT DO NOTHING;


-- 6. TABELA: configuracoes (Configurações globais da iAlves Pneus)
CREATE TABLE IF NOT EXISTS configuracoes (
    id INTEGER PRIMARY KEY,
    whatsapp_numero TEXT NOT NULL,
    gemini_api_key TEXT DEFAULT '',
    groq_api_key TEXT DEFAULT '',
    campanha_afiliados_ativa BOOLEAN DEFAULT FALSE,
    imagem_fallback_url TEXT DEFAULT '',
    horarios_postagem TEXT[] DEFAULT ARRAY['08:00', '14:00', '20:00']::TEXT[],
    hero_titulo TEXT DEFAULT 'ROBUSTEZ EXTREMA',
    hero_subtitulo TEXT DEFAULT 'Fornecimento direto de pneus novos de alta durabilidade e máxima tração. Desempenho profissional projetado para frotas de caminhões e implementos rodoviários. Preço à vista imbatível.',
    instagram_url TEXT DEFAULT '',
    facebook_url TEXT DEFAULT '',
    youtube_url TEXT DEFAULT '',
    tiktok_url TEXT DEFAULT '',
    texto_rodape TEXT DEFAULT 'Valores anunciados sujeitos a alteração sem aviso prévio. Imagens meramente ilustrativas de catálogo.',
    aviso_topo_frete TEXT DEFAULT 'OFERTA DE INAUGURAÇÃO — FRETE GRÁTIS PARA COMPRAS ACIMA DE 4 PNEUS',
    aviso_topo_frete_ativo BOOLEAN DEFAULT TRUE,
    cnpj TEXT DEFAULT '00.000.000/0001-00',
    direitos_reservados TEXT DEFAULT 'iAlves Pneus',
    logo_url TEXT DEFAULT '/logoiAlves.png',
    banner_tempo_transicao INTEGER DEFAULT 6,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed das Configurações Globais (ID 1 Único e Obrigatório)
INSERT INTO configuracoes (
    id, 
    whatsapp_numero, 
    gemini_api_key, 
    groq_api_key, 
    campanha_afiliados_ativa, 
    imagem_fallback_url, 
    horarios_postagem, 
    hero_titulo, 
    hero_subtitulo, 
    instagram_url, 
    facebook_url, 
    youtube_url, 
    tiktok_url, 
    texto_rodape, 
    aviso_topo_frete, 
    aviso_topo_frete_ativo, 
    cnpj, 
    direitos_reservados,
    logo_url,
    banner_tempo_transicao
) VALUES (
    1,
    '5511999999999',
    '',
    '',
    FALSE,
    'https://placehold.co/800x600/0B0B0C/white?text=iAlves+Pneus',
    ARRAY['08:00', '14:00', '20:00']::TEXT[],
    'ROBUSTEZ EXTREMA',
    'Fornecimento direto de pneus novos de alta durabilidade e máxima tração. Desempenho profissional projetado para frotas de caminhões e implementos rodoviários. Preço à vista imbatível.',
    'https://instagram.com/ialvespneus',
    'https://facebook.com/ialvespneus',
    '',
    '',
    'Valores anunciados sujeitos a alteração sem aviso prévio. Imagens meramente ilustrativas de catálogo.',
    'OFERTA DE INAUGURAÇÃO — FRETE GRÁTIS PARA COMPRAS ACIMA DE 4 PNEUS',
    TRUE,
    '00.000.000/0001-00',
    'iAlves Pneus',
    '/logoiAlves.png',
    6
)
ON CONFLICT (id) DO UPDATE SET
    whatsapp_numero = EXCLUDED.whatsapp_numero,
    hero_titulo = EXCLUDED.hero_titulo,
    hero_subtitulo = EXCLUDED.hero_subtitulo,
    banner_tempo_transicao = EXCLUDED.banner_tempo_transicao;


-- ═══════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) — POLÍTICAS DE ACESSO POR TABELA
-- ═══════════════════════════════════════════════════════════════════
-- CAUSA DO ERRO 401: O Supabase ativa RLS por padrão em tabelas novas.
-- Sem policies explícitas, a chave 'anon' (pública) não tem acesso a nada.
-- Abaixo: leitura pública liberada para o catálogo e escrita somente
-- para usuários autenticados (painel administrativo).
-- ═══════════════════════════════════════════════════════════════════

-- TABELA: pneus (leitura pública, escrita somente autenticados)
ALTER TABLE pneus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura publica de pneus" ON public.pneus;
CREATE POLICY "Leitura publica de pneus"
  ON pneus FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Escrita de pneus somente autenticados" ON public.pneus;
CREATE POLICY "Escrita de pneus somente autenticados"
  ON pneus FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- TABELA: banners (leitura pública, escrita somente autenticados)
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura publica de banners" ON public.banners;
CREATE POLICY "Leitura publica de banners"
  ON banners FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Escrita de banners somente autenticados" ON public.banners;
CREATE POLICY "Escrita de banners somente autenticados"
  ON banners FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- TABELA: configuracoes (leitura pública, escrita somente autenticados)
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura publica de configuracoes" ON public.configuracoes;
CREATE POLICY "Leitura publica de configuracoes"
  ON configuracoes FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Escrita de configuracoes somente autenticados" ON public.configuracoes;
CREATE POLICY "Escrita de configuracoes somente autenticados"
  ON configuracoes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- TABELA: afiliados (somente autenticados)
ALTER TABLE afiliados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso de afiliados somente autenticados" ON public.afiliados;
CREATE POLICY "Acesso de afiliados somente autenticados"
  ON afiliados FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- Função helper para verificar se o usuário logado é SUPER_ADMIN (evita recursão de RLS)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.administradores
    WHERE email = auth.jwt() ->> 'email' AND role = 'SUPER_ADMIN'
  );
END;
$$ LANGUAGE plpgsql;


-- TABELA: administradores (somente autenticados podem ler, apenas super admin pode gerenciar)
ALTER TABLE public.administradores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura de administradores somente autenticados" ON public.administradores;
CREATE POLICY "Leitura de administradores somente autenticados"
  ON public.administradores FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Super admins gerenciam a tabela" ON public.administradores;
CREATE POLICY "Super admins gerenciam a tabela"
  ON public.administradores FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "Permitir auto-registro de novos usuarios como PENDENTE" ON public.administradores;
CREATE POLICY "Permitir auto-registro de novos usuarios como PENDENTE"
  ON public.administradores FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'email') = email 
    AND role = 'ADMIN' 
    AND status = 'PENDENTE'
  );


-- TABELA: login_audits (somente autenticados, com insert para anon durante o fluxo de bloqueio)
ALTER TABLE login_audits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Insert de login_audits para todos" ON public.login_audits;
CREATE POLICY "Insert de login_audits para todos"
  ON login_audits FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Leitura de login_audits somente autenticados" ON public.login_audits;
CREATE POLICY "Leitura de login_audits somente autenticados"
  ON login_audits FOR SELECT
  TO authenticated
  USING (true);


-- ═══════════════════════════════════════════════════════════════════
-- STORAGE — BUCKETS PÚBLICOS PARA UPLOAD DE IMAGENS
-- ═══════════════════════════════════════════════════════════════════
-- Execute este bloco no SQL Editor do Supabase para criar os buckets
-- de Storage e configurar as policies de acesso.
-- ═══════════════════════════════════════════════════════════════════

-- Bucket para imagens de produtos (pneus)
INSERT INTO storage.buckets (id, name, public)
VALUES ('pneus', 'pneus', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Bucket para banners promocionais do carrossel
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy: qualquer pessoa pode VER imagens dos pneus
DROP POLICY IF EXISTS "Leitura publica storage pneus" ON storage.objects;
CREATE POLICY "Leitura publica storage pneus"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'pneus');

-- Policy: somente autenticados podem FAZER UPLOAD em pneus
DROP POLICY IF EXISTS "Upload storage pneus somente autenticados" ON storage.objects;
CREATE POLICY "Upload storage pneus somente autenticados"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'pneus');

-- Policy: somente autenticados podem DELETAR imagens de pneus
DROP POLICY IF EXISTS "Delete storage pneus somente autenticados" ON storage.objects;
CREATE POLICY "Delete storage pneus somente autenticados"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'pneus');

-- Policy: qualquer pessoa pode VER banners
DROP POLICY IF EXISTS "Leitura publica storage banners" ON storage.objects;
CREATE POLICY "Leitura publica storage banners"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'banners');

-- Policy: somente autenticados podem FAZER UPLOAD de banners
DROP POLICY IF EXISTS "Upload storage banners somente autenticados" ON storage.objects;
CREATE POLICY "Upload storage banners somente autenticados"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'banners');

-- Policy: somente autenticados podem DELETAR banners
DROP POLICY IF EXISTS "Delete storage banners somente autenticados" ON storage.objects;
CREATE POLICY "Delete storage banners somente autenticados"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'banners');


-- 7. TABELA: activity_logs (Registro detalhado de alterações do sistema)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario TEXT NOT NULL,
    acao TEXT NOT NULL,
    descricao TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para activity_logs
DROP POLICY IF EXISTS "Insert de activity_logs para todos autenticados" ON public.activity_logs;
CREATE POLICY "Insert de activity_logs para todos autenticados"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Leitura de activity_logs somente autenticados" ON public.activity_logs;
CREATE POLICY "Leitura de activity_logs somente autenticados"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (true);


-- 8. TABELA: afiliado_logs (Rastreio de conversão / cliques dos afiliados)
CREATE TABLE IF NOT EXISTS public.afiliado_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    afiliado_id UUID NOT NULL REFERENCES public.afiliados(id) ON DELETE CASCADE,
    evento TEXT NOT NULL CHECK (evento IN ('clique_link', 'clique_whatsapp')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS em afiliado_logs
ALTER TABLE public.afiliado_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para afiliado_logs
DROP POLICY IF EXISTS "Insercao publica de logs de afiliados" ON public.afiliado_logs;
DROP POLICY IF EXISTS "Inserção pública de logs de afiliados" ON public.afiliado_logs;
CREATE POLICY "Insercao publica de logs de afiliados"
  ON public.afiliado_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Leitura de logs de afiliados somente autenticados" ON public.afiliado_logs;
CREATE POLICY "Leitura de logs de afiliados somente autenticados"
  ON public.afiliado_logs FOR SELECT
  TO authenticated
  USING (true);

-- Política de leitura pública na tabela afiliados para permitir lookup de códigos ref
DROP POLICY IF EXISTS "Leitura publica de afiliados para lookup de codigo" ON public.afiliados;
DROP POLICY IF EXISTS "Leitura pública de afiliados para lookup de código" ON public.afiliados;
CREATE POLICY "Leitura publica de afiliados para lookup de codigo"
  ON public.afiliados FOR SELECT
  TO anon, authenticated
  USING (true);
