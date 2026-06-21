-- ============================================================
-- MIGRATION: Atualização Completa de Estoque - iAlves Pneus
-- Data: 2026-06-21
-- Descrição: Zera o estoque atual e insere a nova tabela 
--            oficial do cliente com todos os modelos atualizados.
-- ============================================================

-- 1. ZERAR O ESTOQUE ATUAL
DELETE FROM pneus;

-- 2. INSERIR O NOVO ESTOQUE OFICIAL (Baseado na tabela atualizada)
INSERT INTO pneus (nome, marca, categoria, medida, largura_mm, perfil_proporcao, aro_polegadas, sulco_mm, preco_vista, imagem_url, posicao_destaque, visibilidade, status_produto, quantidade_estoque) VALUES
-- MEDIDA 215/75 R17.5
('NP128', 'NEUPAR', 'Liso', '215/75 R17.5', 215, 75, '17.5', 15.0, 650.00, '/pneu_liso.png', 15, 'publico', 'ativo', 10),

-- MEDIDA 235/75 R17.5
('DRB111', 'DERUIBO', 'Liso', '235/75 R17.5', 235, 75, '17.5', 15.0, 790.00, '/pneu_liso.png', 14, 'publico', 'ativo', 10),
('HS205', 'KAPSEN', 'Liso', '235/75 R17.5', 235, 75, '17.5', 15.0, 790.00, '/pneu_liso.png', 13, 'publico', 'ativo', 10),

-- MEDIDA 275/80 R22.5 (LISO)
('ECOWAY B1', 'XBRI', 'Liso', '275/80 R22.5', 275, 80, '22.5', 15.0, 1410.00, '/pneu_liso.png', 12, 'publico', 'ativo', 10),
('DR919', 'DURABLE', 'Liso', '275/80 R22.5', 275, 80, '22.5', 15.0, 1450.00, '/pneu_liso.png', 11, 'publico', 'ativo', 10),
('NEO CURVE P1', 'XBRI', 'Liso', '275/80 R22.5', 275, 80, '22.5', 15.0, 1520.00, '/pneu_liso.png', 10, 'publico', 'ativo', 10),

-- MEDIDA 275/80 R22.5 (BORRACHUDO)
('ROBUSTO B6', 'XBRI', 'Borrachudo', '275/80 R22.5', 275, 80, '22.5', 20.0, 1590.00, '/pneu_borrachudo.png', 9, 'publico', 'ativo', 10),

-- MEDIDA 295/80 R22.5 (LISO)
('DLT919', 'DOUBLESTAR', 'Liso', '295/80 R22.5', 295, 80, '22.5', 15.0, 1440.00, '/pneu_liso.png', 8, 'publico', 'ativo', 10),
('DR919', 'DURABLE', 'Liso', '295/80 R22.5', 295, 80, '22.5', 15.0, 1450.00, '/pneu_liso.png', 7, 'publico', 'ativo', 10),
('DRB662', 'DERUIBO', 'Liso', '295/80 R22.5', 295, 80, '22.5', 15.0, 1480.00, '/pneu_liso.png', 6, 'publico', 'ativo', 10),
('ECOWAY P2', 'XBRI', 'Liso', '295/80 R22.5', 295, 80, '22.5', 15.0, 1520.00, '/pneu_liso.png', 5, 'publico', 'ativo', 10),
('NEO CURVE P1', 'XBRI', 'Liso', '295/80 R22.5', 295, 80, '22.5', 15.0, 1710.00, '/pneu_liso.png', 4, 'publico', 'ativo', 10),
('CURVE PLUS F1', 'XBRI', 'Liso', '295/80 R22.5', 295, 80, '22.5', 15.0, 1710.00, '/pneu_liso.png', 3, 'publico', 'ativo', 10),

-- MEDIDA 295/80 R22.5 (BORRACHUDO)
('NEW VISION M2', 'NEUPAR', 'Borrachudo', '295/80 R22.5', 295, 80, '22.5', 20.0, 1650.00, '/pneu_borrachudo.png', 2, 'publico', 'ativo', 10),
('NEOFORZA', 'XBRI', 'Borrachudo', '295/80 R22.5', 295, 80, '22.5', 20.0, 1850.00, '/pneu_borrachudo.png', 1, 'publico', 'ativo', 10);
