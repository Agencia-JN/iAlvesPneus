-- ═══════════════════════════════════════════════════════════════════
-- SCRIPT DE INICIALIZAÇÃO E CRIAÇÃO DAS TABELAS DO ECOSSISTEMA IALVES PNEUS
-- ═══════════════════════════════════════════════════════════════════
-- ⚠️  EXECUTE ESTE SCRIPT COMPLETO NO "SQL EDITOR" DO PAINEL DO SUPABASE.
-- ⚠️  Inclui DDL das tabelas, seeds de dados iniciais e policies de RLS
--     para resolver erros 401 (Unauthorized) na chave anônima pública.
-- ═══════════════════════════════════════════════════════════════════

-- Habilitar a extensão pgcrypto para UUID caso necessário
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABELA: allowed_users (Usuários autorizados a entrar na diretoria)
CREATE TABLE IF NOT EXISTS allowed_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed de Usuários Permitidos (Ajuste o e-mail se necessário)
INSERT INTO allowed_users (email) VALUES 
('nilson.brites@gmail.com'),
('diretoria.demonstracao@ialves.com')
ON CONFLICT (email) DO NOTHING;


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
    direitos_reservados
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
    'iAlves Pneus'
)
ON CONFLICT (id) DO UPDATE SET
    whatsapp_numero = EXCLUDED.whatsapp_numero,
    hero_titulo = EXCLUDED.hero_titulo,
    hero_subtitulo = EXCLUDED.hero_subtitulo;


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

CREATE POLICY "Leitura publica de pneus"
  ON pneus FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Escrita de pneus somente autenticados"
  ON pneus FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- TABELA: banners (leitura pública, escrita somente autenticados)
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura publica de banners"
  ON banners FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Escrita de banners somente autenticados"
  ON banners FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- TABELA: configuracoes (leitura pública, escrita somente autenticados)
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura publica de configuracoes"
  ON configuracoes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Escrita de configuracoes somente autenticados"
  ON configuracoes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- TABELA: afiliados (somente autenticados)
ALTER TABLE afiliados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso de afiliados somente autenticados"
  ON afiliados FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- TABELA: allowed_users (somente autenticados)
ALTER TABLE allowed_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura de allowed_users somente autenticados"
  ON allowed_users FOR SELECT
  TO authenticated
  USING (true);


-- TABELA: login_audits (somente autenticados, com insert para anon durante o fluxo de bloqueio)
ALTER TABLE login_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Insert de login_audits para todos"
  ON login_audits FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Leitura de login_audits somente autenticados"
  ON login_audits FOR SELECT
  TO authenticated
  USING (true);
