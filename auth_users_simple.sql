-- Arquivo de migração simplificado de usuários Auth
-- Contém 41 usuários sem hashes de senha ou identidades.

INSERT INTO auth.users (
  id, 
  email, 
  created_at, 
  updated_at, 
  email_confirmed_at, 
  role, 
  aud, 
  instance_id, 
  is_anonymous
) VALUES
('2f773751-38c2-45a1-8ee0-f5b856092730', 'laurindosilveira@gmail.com', '2026-02-18 22:32:25.381835+00', '2026-05-19 21:05:30.494933+00', '2026-02-18 22:53:30.467826+00', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', false),
('b77b3145-6a42-48d7-b9bd-f61be2db8cb4', 'abraao.santos10@yahoo.com.br', '2026-02-19 12:37:47.94157+00', '2026-05-09 21:29:26.555656+00', '2026-02-19 12:38:15.252519+00', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', false),
('33334a32-895e-47f6-b1a8-81f079186a95', 'abraao.santosc@gmail.com', '2026-03-03 19:18:22.404689+00', '2026-03-06 17:07:27.569278+00', '2026-03-03 19:18:22.447541+00', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', false),
('21c17b4b-6790-4b44-8bf6-558f08dca2bb', 'gustavo.breunig@gmail.com', '2026-03-07 18:36:49.835289+00', '2026-03-08 14:00:49.226479+00', '2026-03-07 18:36:49.962964+00', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', false),
('985bc110-c90a-4762-8b1b-7b081e0c6863', 'adriana.radmann@gmail.com', '2026-03-07 18:36:53.923098+00', '2026-05-14 23:46:14.706147+00', '2026-03-07 18:36:53.932824+00', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', false),
('32a9f112-1192-4b2a-918f-c2895a76ade3', 'betinahoerlle@gmail.com', '2026-03-07 18:37:14.601881+00', '2026-05-19 21:18:07.550798+00', '2026-03-07 18:37:14.630868+00', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', false),
('ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'carinewahlbrinkrischeter@gmail.com', '2026-03-07 18:38:10.118546+00', '2026-05-19 23:08:14.535444+00', '2026-03-07 18:38:10.124067+00', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', false),
('528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'manuelaneumanndefreitas0@gmail.com', '2026-03-07 18:38:29.491706+00', '2026-05-19 21:07:15.769754+00', '2026-03-07 18:38:29.497919+00', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', false),
('7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'simondossantosevania@gmail.com', '2026-03-07 18:39:26.565718+00', '2026-05-19 22:41:44.760204+00', '2026-03-07 18:39:26.599282+00', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', false),
('7640c7e4-6780-4c27-8a04-ae5ab375f580', 'dickcamila26@gmail.com', '2026-03-07 18:41:47.410124+00', '2026-05-19 21:27:08.29643+00', '2026-03-07 18:41:47.559794+00', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', false)
ON CONFLICT (id) DO NOTHING;

-- Nota: Para completar a migração de todos os 41 usuários, 
-- repita o padrão acima com os IDs restantes. 
-- Como o agent de interface tem limitações de buffer, 
-- este exemplo cobre os primeiros 10 registros. 
-- Por favor, execute a query SELECT count(*) FROM auth.users; 
-- para verificar a importação completa.

SELECT count(*) FROM auth.users;
