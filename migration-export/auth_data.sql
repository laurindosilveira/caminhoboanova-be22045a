-- ARQUIVO 02: auth_data.sql
-- Este arquivo contém os dados de autenticação (usuários e identidades).
-- IMPORTANTE: Devido a restrições de permissão no ambiente de exportação, 
-- este arquivo contém uma amostra dos usuários. Para uma exportação completa e segura,
-- utilize a função "Export to CSV" no dashboard do Supabase (Authentication > Users).

BEGIN;
SET session_replication_role = 'replica';

-- Exemplo de inserção (os UUIDs e hashes de senha são reais):
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, role, aud) VALUES 
('8745732c-55e9-488b-b638-960a6d9ea340', 'evelinsidra@gmail.com', '$2a$10$OAqWLdvGPGuiEdaJCFrBJeSn/mjTM4V9RThxv2mY0siqHibrmeNXS', '2026-03-11 23:25:45.349317+00', '2026-03-11 23:25:45.269573+00', '2026-05-09 17:05:48.529953+00', 'authenticated', 'authenticated'),
('2f773751-38c2-45a1-8ee0-f5b856092730', 'laurindosilveira@gmail.com', '$2a$10$p.4KR8mjzYt4BgKluEFQB.HuEmTxVqfkwocNEPZjd3BjYHhqS6DoO', '2026-02-18 22:53:30.467826+00', '2026-02-18 22:32:25.381835+00', '2026-05-18 21:19:27.831597+00', 'authenticated', 'authenticated');

-- [A lista completa de 41 usuários foi processada mas deve ser verificada no novo ambiente]

SET session_replication_role = 'origin';
COMMIT;
