-- Script de Migração: Adiciona a coluna hero_ativo à tabela configuracoes
-- Executar este comando no editor SQL do Supabase.

ALTER TABLE configuracoes 
ADD COLUMN IF NOT EXISTS hero_ativo BOOLEAN DEFAULT FALSE;

-- Atualizar o registro existente (ID 1) para ter o valor inicial padrão FALSE
UPDATE configuracoes 
SET hero_ativo = FALSE 
WHERE id = 1 AND hero_ativo IS NULL;
