-- SCRIPT DE LIMPEZA E DEDUPLICAÇÃO DE PNEUS
-- Este script remove pneus duplicados (mesmo nome, marca, largura, perfil e aro)
-- mantendo apenas o registro mais antigo (primeiro a ser criado).

DELETE FROM public.pneus
WHERE id NOT IN (
  SELECT DISTINCT ON (nome, marca, largura_mm, perfil_proporcao, aro_polegadas) id
  FROM public.pneus
  ORDER BY nome, marca, largura_mm, perfil_proporcao, aro_polegadas, created_at ASC, id ASC
);
