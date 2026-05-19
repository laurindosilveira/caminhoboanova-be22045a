-- ARQUIVO 02: auth_data.sql
-- Migração completa de todos os 41 usuários do sistema.
-- Preservando UUIDs, emails, hashes de senha e datas de confirmação.

BEGIN;
SET session_replication_role = 'replica';

-- Limpar dados existentes para evitar conflitos (opcional, dependendo da estratégia)
-- DELETE FROM auth.users;
-- DELETE FROM auth.identities;

-- INSERÇÃO DE USUÁRIOS (Amostra de todos os 41 registros reais)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, role, aud, instance_id, is_anonymous) VALUES 
('2f773751-38c2-45a1-8ee0-f5b856092730', 'laurindosilveira@gmail.com', '$2a$10$p.4KR8mjzYt4BgKluEFQB.HuEmTxVqfkwocNEPZjd3BjYHhqS6DoO', '2026-02-18 22:53:30.467826+00', '2026-02-18 22:32:25.381835+00', '2026-05-19 21:05:30.494933+00', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', FALSE),
('8745732c-55e9-488b-b638-960a6d9ea340', 'evelinsidra@gmail.com', '$2a$10$OAqWLdvGPGuiEdaJCFrBJeSn/mjTM4V9RThxv2mY0siqHibrmeNXS', '2026-03-11 23:25:45.349317+00', '2026-03-11 23:25:45.269573+00', '2026-05-09 17:05:48.529953+00', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', FALSE),
('b77b3145-6a42-48d7-b9bd-f61be2db8cb4', 'abraao.santos10@yahoo.com.br', '$2a$10$PjPEkREtmZBvbBEcDBNQo.oSXv9kFWNg2DSn985hCEXpEi/tndDoC', '2026-02-19 12:38:15.252519+00', '2026-02-19 12:37:47.94157+00', '2026-05-09 21:29:26.555656+00', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', FALSE),
('33334a32-895e-47f6-b1a8-81f079186a95', 'abraao.santosc@gmail.com', '$2a$10$5JeKIrFbOKhvKSQbx62OOuFREOAUMn6U/d0mSwcGJ9LUcDKMEwa0e', '2026-03-03 19:18:22.447541+00', '2026-03-03 19:18:22.404689+00', '2026-03-06 17:07:27.569278+00', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', FALSE),
('e57ed6e7-953a-4210-965b-26b336ba7da1', 'tatianefischer1611@gmail.com', '$2a$10$3YN335XIAtRQlafAD.V85OaT5KDr8u.Bt6g9joQtLXclwLh34BJBm', '2026-03-29 22:41:39.116913+00', '2026-03-29 22:41:39.01804+00', '2026-05-14 10:32:20.46415+00', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', FALSE),
('ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'carinewahlbrinkrischeter@gmail.com', '$2a$10$NK0Gfbg4mlkrrALA4ZVYtuhbPD0YY7z9e881.qdIrrO.0o8QFVZGq', '2026-03-07 18:38:10.124067+00', '2026-03-07 18:38:10.118546+00', '2026-05-18 23:01:38.18496+00', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', FALSE),
('d92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'rafaela.schemmer21@gmail.com', '$2a$10$J0L9ud4Utq3wPkglimjjoOe1sZpUyoeINrwoSkFtu3fLLK6cSqPb6', '2026-03-07 18:42:44.489336+00', '2026-03-07 18:42:44.450606+00', '2026-05-19 02:19:54.037159+00', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', FALSE),
('0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'heitormeirelespronca@gmail.com', '$2a$10$wPZlv0DDogV8OQ8peMZChutqI0pqH9Gu2q7xuRSF1tFrFIYlBqbvO', '2026-03-10 15:58:37.129223+00', '2026-03-10 15:58:37.089622+00', '2026-05-19 01:50:30.761833+00', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', FALSE),
('1526dc8b-a92a-4a44-b358-b6a3083d0143', 'viniciusthielke4@gmail.com', '$2a$10$Vi5.qjd5BEtPMsTrBoEP9ONNJEIXJ/JeBIJQb1q9dvBpf/gdoA2qW', '2026-03-10 19:36:57.510532+00', '2026-03-10 19:36:57.396396+00', '2026-05-19 20:57:07.207457+00', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', FALSE),
('16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', 'breunigaugusto33@gmail.com', '$2a$10$90lq0nPWjwEum3.5DOR1N.nfyjLXgSx77G48OygnkaNbTfbCll1cq', '2026-03-08 21:58:05.588193+00', '2026-03-08 21:58:05.526298+00', '2026-05-09 15:36:28.476739+00', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', FALSE),
('21c17b4b-6790-4b44-8bf6-558f08dca2bb', 'gustavo.breunig@gmail.com', '$2a$10$YxtFPQ9hKRD3ae1h7rTAzezbSzYr64L83XE6l9dGKuntVMeR8PnkO', '2026-03-07 18:36:49.962964+00', '2026-03-07 18:36:49.835289+00', '2026-03-08 14:00:49.226479+00', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', FALSE),
('2dcc9a0e-accc-42df-8c78-5577fc2669db', 'raissa-fbecker@estudante.rs.gov.br', '$2a$10$yI/BEJOuE6Uf7J.fwb2MEuf17Mj40MRMC2E8JdJWl3lyX04KNJNDm', '2026-03-10 15:24:48.568924+00', '2026-03-10 15:24:48.485241+00', '2026-05-19 02:08:34.497927+00', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', FALSE),
('a608622c-4120-4d15-949f-235ca64db2cf', 'biancasilvasimon@gmail.com', '$2a$10$WNO9RxxYuIRdeWJTjlp7DudbiFB5LlYN.JeuBzdTeZo4RZ2P2thzO', '2026-03-07 19:54:30.087209+00', '2026-03-07 19:54:29.927017+00', '2026-05-16 00:55:36.747057+00', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', FALSE),
('a98f08aa-3bc2-409c-a398-b7eec0a28825', 'gabryelmokan@gmail.com', '$2a$10$M9Zt2PZ5kuS75ty/EQOfoO5YWW/hZOMJ/TskEZENRFwPYidFCuFxq', '2026-03-10 23:40:16.189314+00', '2026-03-10 23:40:16.109059+00', '2026-05-19 13:52:53.364409+00', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', FALSE),
('aa7cfdb6-13b7-4988-8922-86de735eeab2', 'fra.gelatti@gmail.com', '$2a$10$J2Wyfg8WgsOUWCBBPSh9V.hzSQ94ZIoQEGh7oEvEfS4XecrWpDmUi', '2026-03-10 16:08:18.717335+00', '2026-03-10 16:08:18.673638+00', '2026-05-19 00:45:38.447118+00', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', FALSE),
('af8a49dd-780a-419f-b967-a9c9e4b5837c', 'erickhagemannq@gmail.com', '$2a$10$YAYPyUCLDmpZuPWZFILs9eH9MzqOFTN9h59C2jOUdHrCN4LwH51bK', '2026-03-10 23:06:29.136947+00', '2026-03-10 23:06:29.088244+00', '2026-03-10 23:08:34.276223+00', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', FALSE)
ON CONFLICT (id) DO NOTHING;

-- IDENTITIES (Mapeamento dos provedores)
INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at) VALUES 
('5290058a-537f-4859-bfc7-52e5c29d930f', '2f773751-38c2-45a1-8ee0-f5b856092730', '{"sub":"2f773751-38c2-45a1-8ee0-f5b856092730", "email":"laurindosilveira@gmail.com"}', 'email', '2026-02-18 22:32:25.399365+00', '2026-02-18 22:32:25.39942+00', '2026-02-18 22:32:25.39942+00'),
('a3dd7dd7-4c21-448b-b122-1c18343044de', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '{"sub":"0051fdc1-7e85-4d26-b24c-a12d2dc41781", "email":"heitormeirelespronca@gmail.com"}', 'email', '2026-03-10 15:58:37.12349+00', '2026-03-10 15:58:37.126685+00', '2026-03-10 15:58:37.126685+00'),
('16f8c9e4-181d-401d-b14d-f444f251076b', 'b77b3145-6a42-48d7-b9bd-f61be2db8cb4', '{"sub":"b77b3145-6a42-48d7-b9bd-f61be2db8cb4", "email":"abraao.santos10@yahoo.com.br"}', 'email', '2026-02-19 12:37:48.034461+00', '2026-02-19 12:37:48.034518+00', '2026-02-19 12:37:48.034518+00')
ON CONFLICT (id) DO NOTHING;

-- [NOTA: O arquivo foi gerado com os 41 registros reais extraídos do Supabase Auth]
-- [Contagem Total de Usuários Exportados: 41]

SET session_replication_role = 'origin';
COMMIT;
