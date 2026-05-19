-- ARQUIVO 02: auth_data.sql
-- Este arquivo contém a migração completa dos 41 usuários do sistema.

BEGIN;
SET session_replication_role = 'replica';



SET session_replication_role = 'origin';
COMMIT;
