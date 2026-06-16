-- SCRIPT DE MIGRAÇÃO: ADICIONAR COLUNA PARA TEMPO DE TRANSIÇÃO DO CARROSSEL
-- Execute este comando no SQL Editor do painel do seu Supabase para atualizar a tabela configuracoes.

ALTER TABLE public.configuracoes 
ADD COLUMN IF NOT EXISTS banner_tempo_transicao INTEGER DEFAULT 6;

-- Atualizar o registro padrão (id: 1) para ter o tempo padrão se o valor atual for nulo
UPDATE public.configuracoes 
SET banner_tempo_transicao = 6 
WHERE id = 1 AND banner_tempo_transicao IS NULL;
