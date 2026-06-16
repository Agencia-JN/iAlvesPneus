-- ═══════════════════════════════════════════════════════════════════
-- FIX: CRIAÇÃO DOS BUCKETS DE STORAGE E POLICIES DE RLS
-- iAlves Pneus — Supabase Storage
-- ═══════════════════════════════════════════════════════════════════
-- Execute este script completo no SQL Editor do painel do Supabase.
-- Painel > SQL Editor > New Query > Cole tudo > Run
-- ═══════════════════════════════════════════════════════════════════

-- PASSO 1: Criar bucket 'pneus' (público para leitura)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pneus',
  'pneus',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- PASSO 2: Criar bucket 'banners' (público para leitura)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'banners',
  'banners',
  true,
  10485760, -- 10 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];


-- ═══════════════════════════════════════════════════════════════════
-- PASSO 3: Policies de RLS para o bucket 'pneus'
-- ═══════════════════════════════════════════════════════════════════

-- Remove policies antigas (para evitar conflito ao re-executar)
DROP POLICY IF EXISTS "Leitura publica storage pneus" ON storage.objects;
DROP POLICY IF EXISTS "Upload storage pneus somente autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Update storage pneus somente autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Delete storage pneus somente autenticados" ON storage.objects;

-- Qualquer pessoa pode VER imagens de pneus (necessário para exibição na vitrine)
CREATE POLICY "Leitura publica storage pneus"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'pneus');

-- Somente usuários autenticados (admin) podem fazer UPLOAD
CREATE POLICY "Upload storage pneus somente autenticados"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'pneus');

-- Somente usuários autenticados (admin) podem SUBSTITUIR (upsert)
CREATE POLICY "Update storage pneus somente autenticados"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'pneus');

-- Somente usuários autenticados (admin) podem DELETAR imagens
CREATE POLICY "Delete storage pneus somente autenticados"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'pneus');


-- ═══════════════════════════════════════════════════════════════════
-- PASSO 4: Policies de RLS para o bucket 'banners'
-- ═══════════════════════════════════════════════════════════════════

-- Remove policies antigas (para evitar conflito ao re-executar)
DROP POLICY IF EXISTS "Leitura publica storage banners" ON storage.objects;
DROP POLICY IF EXISTS "Upload storage banners somente autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Update storage banners somente autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Delete storage banners somente autenticados" ON storage.objects;

-- Qualquer pessoa pode VER banners (necessário para exibição no carrossel)
CREATE POLICY "Leitura publica storage banners"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'banners');

-- Somente usuários autenticados (admin) podem fazer UPLOAD
CREATE POLICY "Upload storage banners somente autenticados"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'banners');

-- Somente usuários autenticados (admin) podem SUBSTITUIR (upsert)
CREATE POLICY "Update storage banners somente autenticados"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'banners');

-- Somente usuários autenticados (admin) podem DELETAR banners
CREATE POLICY "Delete storage banners somente autenticados"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'banners');


-- ═══════════════════════════════════════════════════════════════════
-- VERIFICAÇÃO FINAL: Confirmar que os buckets foram criados
-- ═══════════════════════════════════════════════════════════════════
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id IN ('pneus', 'banners');
