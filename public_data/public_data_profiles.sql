-- ARQUIVO: public_data_profiles.sql

BEGIN;

INSERT INTO public.profiles (
  id, user_id, full_name, birth_date, phone, community, area, created_at, updated_at, father_name, mother_name, father_phone, mother_phone, address, turma_id, avatar_url, confirmation_year, email, whatsapp_number, whatsapp_validation_status, whatsapp_last_blocked_reason, whatsapp_last_blocked_at, role, enrollment_status, enrollment_status_updated_at, enrollment_status_updated_by, church_id, is_active
)
VALUES
(
  'f6e55eb7-cab8-4927-990a-847b556f1d61', 'b77b3145-6a42-48d7-b9bd-f61be2db8cb4', 'Abraão Cruz', '1989-07-05', 55984395293, 'Bom Pastor', 'Área 1', '2026-02-19 12:37:47.939889+00', '2026-05-12 23:08:27.331994+00', NULL, NULL, NULL, NULL, NULL, 'f29b8625-c980-4c74-9c41-cd28189d1c09', NULL, NULL, 'abraao.santos10@yahoo.com.br', NULL, NULL, NULL, NULL, 'admin', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  '69feb15a-903f-432f-8b9b-51788d61aa3b', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'Natalia Luiza herder', '2012-08-24', 55991849189, 'Martim Lutero', 'Área 2', '2026-03-07 19:04:33.777025+00', '2026-05-12 23:08:27.331994+00', 'Dilson Herder', 'Elise ledir feller Herder', 55996839347, 55991778578, 'Rua Osvaldo Cruz 144', 'f29b8625-c980-4c74-9c41-cd28189d1c09', 'https://hmmbspebnqkueqwcqinr.supabase.co/storage/v1/object/public/avatars/914b898d-24a3-46ad-a764-d2f24e5115d1/avatar.jpg?t=1773528495129', 2, 'eliseherder0@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  '4f71fa82-b5eb-437f-b776-769e1668f79e', '8745732c-55e9-488b-b638-960a6d9ea340', 'Evelin Daiane sidra', '2013-06-18', 991498783, 'Bom Pastor', 'Área 1', '2026-03-11 23:25:45.26923+00', '2026-05-12 23:08:27.331994+00', 'Gelson Paulo sidra', 'Miriam daine sidra', 91192298, 991262115, NULL, 'f29b8625-c980-4c74-9c41-cd28189d1c09', NULL, 2, 'evelinsidra@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  'ecd345ff-9256-4742-aa4f-243b1ad6d7ae', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'Cecília dettmer', '2014-07-21', '559116-6715', 'Martim Lutero', 'Área 2', '2026-03-14 01:50:27.041238+00', '2026-05-12 23:08:27.331994+00', 'Elias dettmer', 'Duza djulia da rosa dettmer', '559141-6097', 5591163959, NULL, 'af9ec153-d2f8-49ce-acd4-16adafa37b66', NULL, 1, 'ceciliadettmer@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  'd2dbb000-2e39-45e8-af8d-70db95382ed4', 'c8aacedf-66e2-4e17-9f97-2bc61aae7110', 'Fernando Eduardo krupp', '2013-02-12', 55996802813, 'Rincão Frente', 'Área 1', '2026-04-04 16:07:52.574736+00', '2026-05-12 23:08:27.331994+00', 'Ademar krupp', 'Adriane krupp', 55996908380, 55999302435, NULL, 'f29b8625-c980-4c74-9c41-cd28189d1c09', NULL, 1, 'fernandoeduardokrupp@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  '594c9da1-d37b-4d2d-8412-e223fe16f27f', '2f773751-38c2-45a1-8ee0-f5b856092730', 'Laurindo Manoel da Silveira', '1985-10-14', 51999085090, 'Martim Lutero', 'Área 2', '2026-02-19 11:15:45.399833+00', '2026-05-12 23:08:27.331994+00', NULL, NULL, NULL, NULL, NULL, 'af9ec153-d2f8-49ce-acd4-16adafa37b66', NULL, NULL, 'laurindosilveira@gmail.com', NULL, NULL, NULL, NULL, 'admin', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  'eb14bcab-0de9-491e-a309-66686e6030e0', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'Arthur Ismael Reusch', '2014-06-16', 55997325884, 'Martim Lutero', 'Área 2', '2026-03-07 22:47:55.640372+00', '2026-05-12 23:08:27.331994+00', 'Roberto Reusch', 'Eliane Pautz Reusch', 55991750274, 55991750257, 'Rua Portugal número 47 zona norte ', 'af9ec153-d2f8-49ce-acd4-16adafa37b66', 'https://hmmbspebnqkueqwcqinr.supabase.co/storage/v1/object/public/avatars/f753b131-e334-4645-95d6-dd7f3f1193fc/avatar.jpg?t=1774393372832', 1, 'arthurismaelr@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  '86c8082f-5be4-4291-ae9f-0c8b2c9b4a0d', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', 'Théo Loose de Moura', '2014-12-19', 55920002543, 'Bom Pastor', 'Área 1', '2026-03-08 01:52:27.702831+00', '2026-05-12 23:08:27.331994+00', 'Jonas Lima de Moura', 'Joice Graciele Loose ', NULL, 55992144333, 'Rua Gaspar Martins, 781', 'f29b8625-c980-4c74-9c41-cd28189d1c09', NULL, NULL, 'theoloosedemoura@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  '3f1a4c58-55a1-434a-ae01-7d19f70f7d5d', '66b31cf2-7782-4253-98ea-3b6d631703a4', 'Isadora Melissa tunnermann', '2014-12-22', 55991732680, 'Bom Pastor', 'Área 1', '2026-03-08 13:34:04.111027+00', '2026-05-12 23:08:27.331994+00', NULL, NULL, NULL, NULL, NULL, 'f29b8625-c980-4c74-9c41-cd28189d1c09', 'https://hmmbspebnqkueqwcqinr.supabase.co/storage/v1/object/public/avatars/66b31cf2-7782-4253-98ea-3b6d631703a4/avatar.jpeg?t=1776270706040', NULL, 'jonatantunnermann@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  '00729379-c587-4211-b1ab-481eac03a539', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'Gustavo Widthauper Breunig', '2014-06-23', 5596345683, 'Martim Lutero', 'Área 2', '2026-03-08 14:05:58.821898+00', '2026-05-12 23:08:27.331994+00', NULL, NULL, NULL, NULL, NULL, 'af9ec153-d2f8-49ce-acd4-16adafa37b66', 'https://hmmbspebnqkueqwcqinr.supabase.co/storage/v1/object/public/avatars/ebea6be2-1d97-4b43-a5bc-8f92af388061/avatar.jpg?t=1773504396574', 1, 'gustavowidthauperbreunig@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  '27ae5b94-73e0-498e-b2b9-38bc833cddf8', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', 'Mariana Luísa', '2013-03-28', 55996388828, 'Iriá Pira 1', 'Área 1', '2026-03-08 14:46:33.692987+00', '2026-05-12 23:08:27.331994+00', NULL, NULL, NULL, NULL, NULL, 'f29b8625-c980-4c74-9c41-cd28189d1c09', NULL, NULL, 'hanelmonica92@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  '4d046bd6-1a8e-4be2-bc49-15ee17b46f25', 'b486e185-6cb3-477c-936b-b204b143e329', 'Leonardo', '2014-05-13', '55 55 99116 0000', 'Bom Pastor', 'Área 1', '2026-03-08 14:50:47.119355+00', '2026-05-12 23:08:27.331994+00', NULL, NULL, NULL, NULL, NULL, 'f29b8625-c980-4c74-9c41-cd28189d1c09', NULL, NULL, 'wendlandleonardo90@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  'fb507b56-738a-4528-956b-b96b5d588f1e', '4d062445-4744-4007-a2ac-d7c4743fc979', 'Davi Lucas', '2014-08-29', 96562674, 'Martim Lutero', 'Área 2', '2026-03-08 18:26:35.64063+00', '2026-05-12 23:08:27.331994+00', NULL, NULL, NULL, NULL, NULL, 'af9ec153-d2f8-49ce-acd4-16adafa37b66', NULL, 1, 'davilucad512@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  '23f91a33-6142-48bc-82e7-dc4d7b57ad32', '8bf335ab-907e-497b-b08b-615ad716e722', 'Pyetro Ahlert Milhbeier', '2013-03-25', 55992295511, 'Bom Pastor', 'Área 1', '2026-03-08 20:52:09.259541+00', '2026-05-12 23:08:27.331994+00', NULL, NULL, NULL, NULL, NULL, 'f29b8625-c980-4c74-9c41-cd28189d1c09', NULL, NULL, 'pyetroahlert27@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  'a08f2576-6d13-49d4-8c85-a7004ad143d2', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', 'Erick Hagemann Queiroz', '2014-10-17', 55992113624, 'Rincão Frente', 'Área 1', '2026-03-10 23:06:29.087887+00', '2026-05-12 23:08:27.331994+00', 'Eferson Queiroz', 'Dorelise Hagemann', NULL, 55991892989, NULL, 'f29b8625-c980-4c74-9c41-cd28189d1c09', 'https://hmmbspebnqkueqwcqinr.supabase.co/storage/v1/object/public/avatars/af8a49dd-780a-419f-b967-a9c9e4b5837c/avatar.jpeg?t=1775603615614', 1, 'erickhagemannq@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  '3c41f07e-f96a-4e15-9f18-f50db7697028', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'Gabryel Mokan', '2014-09-29', 55996852645, 'Martim Lutero', 'Área 2', '2026-03-10 23:40:16.107397+00', '2026-05-12 23:08:27.331994+00', 'Elisier Mokan', 'Elisângela Calgaro Mokan', 55999058221, 55999739270, 'Rua da Palmeira 1490 zona norte ', 'af9ec153-d2f8-49ce-acd4-16adafa37b66', 'https://hmmbspebnqkueqwcqinr.supabase.co/storage/v1/object/public/avatars/a98f08aa-3bc2-409c-a398-b7eec0a28825/avatar.jpg?t=1773515727896', 1, 'gabryelmokan@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  '23b0c351-f565-42a3-a25d-9fd4daa8f313', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'Felipe Thön', '2013-10-14', '55 991429797', 'Martim Lutero', 'Área 2', '2026-03-12 22:18:44.725085+00', '2026-05-12 23:08:27.331994+00', 'Mario Thön', 'Mirian Reif Thön', '55 991429797', '55 991259560', 'Rua Porto Rico 275 Zona Norte Panambi RS ', 'af9ec153-d2f8-49ce-acd4-16adafa37b66', 'https://hmmbspebnqkueqwcqinr.supabase.co/storage/v1/object/public/avatars/d1157e70-4aa7-4e5c-8b78-4fbb2294702a/avatar.jpg?t=1774915941736', 2, 'felipe.thon14@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  '241a465a-9692-42d7-9bda-18917f227dce', 'e57ed6e7-953a-4210-965b-26b336ba7da1', 'Kaike Fischer da Veiga', '2026-09-05', 55999819761, 'Iriá Pira 1', 'Área 1', '2026-03-29 22:41:39.017666+00', '2026-05-12 23:08:27.331994+00', 'Jeferson Moraes da Veiga', 'Tatiane Fischer', NULL, 55999819761, NULL, 'f29b8625-c980-4c74-9c41-cd28189d1c09', NULL, 1, 'tatianefischer1611@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  '0ca5de58-762f-4e57-ad4d-31123880d3c9', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', 'Teste', '1985-10-14', 51999085090, 'Martim Lutero', 'Área 2', '2026-04-07 20:16:31.602513+00', '2026-05-12 23:08:27.331994+00', 'TESTE', NULL, NULL, NULL, NULL, 'af9ec153-d2f8-49ce-acd4-16adafa37b66', 'https://hmmbspebnqkueqwcqinr.supabase.co/storage/v1/object/public/avatars/f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc/avatar.png?t=1775609939795', 1, 'teste@teste.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  '5b495266-ae82-4eb1-82f9-011b562ef441', '33334a32-895e-47f6-b1a8-81f079186a95', 'Abraão Cruz', '1989-07-05', 55984395293, 'Bom Pastor', 'Área 1', '2026-03-03 19:18:22.399952+00', '2026-05-12 23:08:27.331994+00', NULL, NULL, NULL, NULL, NULL, 'f29b8625-c980-4c74-9c41-cd28189d1c09', NULL, NULL, 'abraao.santosc@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  '3fbf97ef-eeb4-43b4-a8a7-71f30a44c0a8', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'Adriana Michels Radmann', '1981-03-01', 55981253114, 'Martim Lutero', 'Área 2', '2026-03-07 18:36:53.922764+00', '2026-05-12 23:08:27.331994+00', 'Ernani Michels', 'Nilsa Michels', NULL, NULL, 'Rua Wilhelm Rotermund, 108', 'af9ec153-d2f8-49ce-acd4-16adafa37b66', 'https://hmmbspebnqkueqwcqinr.supabase.co/storage/v1/object/public/avatars/985bc110-c90a-4762-8b1b-7b081e0c6863/avatar.jpg?t=1773969943727', NULL, 'adriana.radmann@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  '022515da-e0a8-4f1e-879f-9aa212317fe4', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'Ana Beatriz wahlbrink', '2014-04-10', 55991448003, 'Martim Lutero', 'Área 2', '2026-03-07 18:38:10.118195+00', '2026-05-12 23:08:27.331994+00', 'Osmar rischeter ', 'Carine Wahlbrink Rischeter ', 55991515092, '55 991448003 ', 'Rua Henrique plegue número 50', 'af9ec153-d2f8-49ce-acd4-16adafa37b66', NULL, 1, 'carinewahlbrinkrischeter@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  'f90cb932-e8bb-4818-b25f-e98f008c5b86', '32a9f112-1192-4b2a-918f-c2895a76ade3', 'Betina hoerlle', '2026-10-22', 5596992536, 'Martim Lutero', 'Área 2', '2026-03-07 18:37:14.599931+00', '2026-05-12 23:08:27.331994+00', NULL, NULL, NULL, NULL, NULL, 'af9ec153-d2f8-49ce-acd4-16adafa37b66', 'https://hmmbspebnqkueqwcqinr.supabase.co/storage/v1/object/public/avatars/32a9f112-1192-4b2a-918f-c2895a76ade3/avatar.jpg?t=1773866406900', 1, 'betinahoerlle@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  'c2ac53c5-4d30-4d0e-a0f9-f7a7882b751f', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'Manuela Neumann de Freitas', '2014-05-03', 55996921814, 'Martim Lutero', 'Área 2', '2026-03-07 18:38:29.491365+00', '2026-05-12 23:08:27.331994+00', 'Renato Lima de Freitas', 'Aiana M. Neumann de Freitas', 55996828289, 55999431581, 'Languiru, 142, Zona Norte', 'af9ec153-d2f8-49ce-acd4-16adafa37b66', NULL, 1, 'manuelaneumanndefreitas0@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  '21f94be7-b3cd-4f4a-a10c-cc1d9c5c313e', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'Gabriely simon dos santos', '2014-05-22', '55 9154-5635', 'Martim Lutero', 'Área 2', '2026-03-07 18:39:26.565401+00', '2026-05-12 23:08:27.331994+00', 'Tiago dos Santos ', 'Evania Simon dos Santos', 5599266461, 55999490202, 'Rua esmeralda, n.56, Bairro italiana ', 'af9ec153-d2f8-49ce-acd4-16adafa37b66', 'https://hmmbspebnqkueqwcqinr.supabase.co/storage/v1/object/public/avatars/7c675f6a-f519-4d74-b86e-eb3032a30c4a/avatar.jpg?t=1773527058003', 1, 'simondossantosevania@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  '5bfc4b53-38a5-48e4-870c-60b6a3033aa8', '7640c7e4-6780-4c27-8a04-ae5ab375f580', 'Camila Dick', '2013-04-26', 55996583156, 'Martim Lutero', 'Área 2', '2026-03-07 18:41:47.405797+00', '2026-05-12 23:08:27.331994+00', 'Ivan Dick ', 'Débora Jungbeck Dick', 55996032691, 55999058587, 'Rua Castro Alves 340 morro do groos', 'af9ec153-d2f8-49ce-acd4-16adafa37b66', 'https://hmmbspebnqkueqwcqinr.supabase.co/storage/v1/object/public/avatars/7640c7e4-6780-4c27-8a04-ae5ab375f580/avatar.jpg?t=1773403658710', 2, 'dickcamila26@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  '6f146a1e-dadc-4824-9d3a-9b4d339b8f5e', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'Rafaela Luize Schemmer', '2013-02-21', 55991471864, 'Martim Lutero', 'Área 2', '2026-03-07 18:42:44.449068+00', '2026-05-12 23:08:27.331994+00', NULL, NULL, NULL, NULL, NULL, 'af9ec153-d2f8-49ce-acd4-16adafa37b66', 'https://hmmbspebnqkueqwcqinr.supabase.co/storage/v1/object/public/avatars/d92c04c7-9f6b-4093-ac69-7bdc4ad82f13/avatar.jpeg?t=1773438083296', 2, 'rafaela.schemmer21@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  'fd686fa6-d129-47f4-91e2-579bc16dfc57', '9289d1ce-a632-4cd7-930e-73023e549ec5', 'Lucas Datsch', '2013-10-25', '55-9657-5406', 'Martim Lutero', 'Área 2', '2026-03-07 18:57:13.427845+00', '2026-05-12 23:08:27.331994+00', 'Marcos Datsch', 'Berenice Datsch', '55 99921 1043', '55 99678 7275', 'Rua Venezuela. 62. Zona Norte', 'af9ec153-d2f8-49ce-acd4-16adafa37b66', 'https://hmmbspebnqkueqwcqinr.supabase.co/storage/v1/object/public/avatars/9289d1ce-a632-4cd7-930e-73023e549ec5/avatar.jpg?t=1773528176108', 2, 'datschlucas@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  'b7b215b9-decd-4caa-af91-8f80a07323e2', 'a608622c-4120-4d15-949f-235ca64db2cf', 'Bianca da Silva Simon', '2013-09-17', 55991488272, 'Linha Brasil', 'Área 2', '2026-03-07 19:54:29.922032+00', '2026-05-12 23:08:27.331994+00', 'Alexandre Junior Lambrecht simon', 'Patricia chicatte da Silva simon', 55999030172, 55996560397, 'Felicio Onofre sigas,Alvorada, panambi ', 'af9ec153-d2f8-49ce-acd4-16adafa37b66', 'https://hmmbspebnqkueqwcqinr.supabase.co/storage/v1/object/public/avatars/a608622c-4120-4d15-949f-235ca64db2cf/avatar.jpeg?t=1773579978488', 2, 'biancasilvasimon@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  'ea9375cc-f699-46c8-951c-cd62f9918e80', '9addbdbd-1d3f-4480-8931-9fc3acb92df4', 'Joice Graciele Loose', '1982-08-19', 55992144333, 'Bom Pastor', 'Área 1', '2026-03-08 00:03:00.72872+00', '2026-05-12 23:08:27.331994+00', NULL, NULL, NULL, NULL, NULL, 'f29b8625-c980-4c74-9c41-cd28189d1c09', NULL, NULL, 'loosejoice@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  '856b35e3-8c61-419a-a337-eeb3f41dea42', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', 'Augusto Breunig', '2013-07-19', 55991754654, 'Bom Pastor', 'Área 1', '2026-03-08 21:58:05.524657+00', '2026-05-12 23:08:27.331994+00', NULL, NULL, NULL, NULL, NULL, 'f29b8625-c980-4c74-9c41-cd28189d1c09', NULL, NULL, 'breunigaugusto33@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  '500bcafa-bc3a-4d97-80c7-8fb0cb5ca1d9', '9a0c5687-f135-4377-a410-58592ef8737a', 'Eduardo keske de Almeida', '2013-12-26', 55999298813, 'Bom Pastor', 'Área 1', '2026-03-10 01:07:56.268692+00', '2026-05-12 23:08:27.331994+00', NULL, NULL, NULL, NULL, NULL, 'f29b8625-c980-4c74-9c41-cd28189d1c09', NULL, NULL, 'eduardokeskealmeida@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  '137e200a-064c-43dd-b198-c752963bf410', '2dcc9a0e-accc-42df-8c78-5577fc2669db', 'Raissa Facco Becker', '2013-11-18', 91338652, 'Martim Lutero', 'Área 2', '2026-03-10 15:24:48.483025+00', '2026-05-12 23:08:27.331994+00', 'Valdecir Becker', 'Eliane Facco Becker', 91729697, 91938076, NULL, 'af9ec153-d2f8-49ce-acd4-16adafa37b66', 'https://hmmbspebnqkueqwcqinr.supabase.co/storage/v1/object/public/avatars/2dcc9a0e-accc-42df-8c78-5577fc2669db/avatar.jpg?t=1773246562746', 1, 'raissa-fbecker@estudante.rs.gov.br', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  '1ea28903-d652-498b-9b66-b48333968eb7', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'Heitor Meireles Proença', '2014-08-24', 55996258869, 'Martim Lutero', 'Área 2', '2026-03-10 15:58:37.087838+00', '2026-05-12 23:08:27.331994+00', 'Adelar José Salles Proença', 'Rafaela Teixeira Meireles', 51999665706, 51997816635, NULL, 'af9ec153-d2f8-49ce-acd4-16adafa37b66', 'https://hmmbspebnqkueqwcqinr.supabase.co/storage/v1/object/public/avatars/0051fdc1-7e85-4d26-b24c-a12d2dc41781/avatar.jpg', 1, 'heitormeirelespronca@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  'f6a9b565-fe27-4938-9965-120d43db8a34', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'Kamilly Gelatti Rodrigues', '2014-05-08', 55991778537, 'Martim Lutero', 'Área 2', '2026-03-10 16:08:18.673216+00', '2026-05-12 23:08:27.331994+00', 'Fernando Rodrigues', 'Francieli Maria Gelatti', 55991098351, 55999621380, NULL, 'af9ec153-d2f8-49ce-acd4-16adafa37b66', 'https://hmmbspebnqkueqwcqinr.supabase.co/storage/v1/object/public/avatars/aa7cfdb6-13b7-4988-8922-86de735eeab2/avatar.jpeg?t=1773687730788', 1, 'fra.gelatti@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  'c09f0438-4657-4640-bb29-8f4fe41f1f5b', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'Pyetra Adriele Diefenthaler', '2012-09-18', 55991091088, 'Martim Lutero', 'Área 2', '2026-03-10 18:21:18.908011+00', '2026-05-12 23:08:27.331994+00', 'Vilson Diefenthaleer', 'Adriele Novotny Diefenthaler', 55991091088, 55991942248, NULL, 'af9ec153-d2f8-49ce-acd4-16adafa37b66', NULL, 2, 'evellyn.panambi@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  '6a4dad29-8ed1-48ec-918f-54cb8d7014d6', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', 'Sarah Natiely Pinto', '2014-01-29', 55992320114, 'Linha Brasil', 'Área 2', '2026-03-10 19:22:02.347881+00', '2026-05-12 23:08:27.331994+00', 'Nilton', 'Luciana', 55991054898, 55999768959, NULL, 'af9ec153-d2f8-49ce-acd4-16adafa37b66', 'https://hmmbspebnqkueqwcqinr.supabase.co/storage/v1/object/public/avatars/c323dbd0-4856-47eb-82ca-6e2c3bc7917a/avatar.jpg?t=1773531304734', 1, 'lucianawesley2013@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  'c716742a-6ff1-46ef-8a98-24cbb0ae5a91', '1526dc8b-a92a-4a44-b358-b6a3083d0143', 'Vinícius Renan Thielke', '2012-09-04', 55991052291, 'Linha Brasil', 'Área 2', '2026-03-10 19:36:57.394119+00', '2026-05-12 23:08:27.331994+00', 'Carlos Thielke', 'Liane Heinrich Thielke', 55991473392, 55991473392, NULL, 'af9ec153-d2f8-49ce-acd4-16adafa37b66', 'https://hmmbspebnqkueqwcqinr.supabase.co/storage/v1/object/public/avatars/1526dc8b-a92a-4a44-b358-b6a3083d0143/avatar.jpg?t=1773951555345', 2, 'viniciusthielke4@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  '4e2edd71-a0b4-4df8-8afe-2ee1256953f3', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', 'Rafael Hartke Correa', '2014-04-25', 55991012550, 'Martim Lutero', 'Área 2', '2026-03-10 22:00:16.154633+00', '2026-05-12 23:08:27.331994+00', 'Sérgio Luiz Correa', 'Daise Hartke Correa', 55991571370, 55991399603, NULL, 'af9ec153-d2f8-49ce-acd4-16adafa37b66', NULL, 1, 'correasergioluiz7@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
),
(
  'b75017ff-7448-477d-b784-4329189e05c4', '84f87cda-6f3a-43ef-a265-93e7c3d15c23', 'Luciano Hagemann', '2012-04-18', 55991137711, 'Rincão Frente', 'Área 1', '2026-03-19 00:02:59.934981+00', '2026-05-12 23:08:27.331994+00', 'Ademir da Silva', 'Anelise Hagemann', NULL, 55991769204, NULL, 'f29b8625-c980-4c74-9c41-cd28189d1c09', NULL, 1, 'lucianohagemann1@gmail.com', NULL, NULL, NULL, NULL, 'user', 'active', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278', 't'
)
ON CONFLICT DO NOTHING;

COMMIT;
