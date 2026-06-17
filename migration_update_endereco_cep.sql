-- Migration: Adicionar Campos de Endereço Estruturado (ViaCEP)
-- Esta migration adiciona os campos estruturados de endereço para automatizar a geração de links do Waze/Google Maps.

ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS cep TEXT DEFAULT '';
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS rua TEXT DEFAULT '';
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS numero TEXT DEFAULT '';
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS bairro TEXT DEFAULT '';
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS cidade TEXT DEFAULT '';
ALTER TABLE configuracoes ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT '';
