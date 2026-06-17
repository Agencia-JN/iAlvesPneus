-- Migration: Adicionar Módulo de Localização & Mapa nas Configurações
-- Esta migration adiciona os campos necessários para gerenciar a exibição do mapa físico e endereços do e-commerce.

ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS mapa_ativo BOOLEAN DEFAULT false;
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS endereco_completo TEXT DEFAULT '';
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS link_google_maps TEXT DEFAULT '';
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS link_waze TEXT DEFAULT '';
