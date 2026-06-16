-- Execute este script no SQL Editor do seu console Supabase
-- para habilitar o monitoramento de uso de armazenamento do banco no Painel Admin.

CREATE OR REPLACE FUNCTION get_db_size() 
RETURNS text AS $$ 
  SELECT pg_size_pretty(pg_database_size(current_database())); 
$$ LANGUAGE sql SECURITY DEFINER;
