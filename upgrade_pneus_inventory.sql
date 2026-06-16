-- EVOLUÇÃO DE SCHEMA: SISTEMA DE ESTOQUE PROFISSIONAL
-- Execute este script no SQL Editor do console Supabase.

-- 1. Adiciona as colunas de controle de estoque e status
ALTER TABLE public.pneus ADD COLUMN IF NOT EXISTS quantidade_estoque INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.pneus ADD COLUMN IF NOT EXISTS status_produto VARCHAR(20) NOT NULL DEFAULT 'ativo';

-- 2. Atualiza os produtos existentes para um estoque inicial positivo (ex: 10 unidades)
-- garantindo que não desapareçam da vitrine após a implantação.
UPDATE public.pneus 
SET quantidade_estoque = 10 
WHERE quantidade_estoque = 0;
