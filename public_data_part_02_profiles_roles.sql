-- public_data_part_02_profiles_roles.sql
-- Inclui dados completos de: profiles, user_roles, authorized_system_admins, notification_preferences, push_subscriptions

INSERT INTO public.profiles (id, full_name, role, church_id, area_id, community_id, status, created_at, updated_at, avatar_url, bio, birth_date, points, xp, level, rank, address, email, enrollment_status, is_active, phone, turma_id) VALUES
('5b495266-ae82-4eb1-82f9-011b562ef441', 'Abraão Cruz', 'user', '02f08580-80e5-4f57-8a2e-1b078d337278', 'c868695c-b915-43b1-9247-9c6160fa6cf3', 'd2e94866-232e-4d55-b076-61347dd30000', 'active', '2026-03-03 19:18:22+00', '2026-05-12 23:08:27+00', '', '', '1989-07-05', 0, 0, 1, 0, '', 'abraao.santosc@gmail.com', 'active', true, '55984395293', NULL),
('f6e55eb7-cab8-4927-990a-847b556f1d61', 'Abraão Cruz', 'admin', '02f08580-80e5-4f57-8a2e-1b078d337278', 'c868695c-b915-43b1-9247-9c6160fa6cf3', 'd2e94866-232e-4d55-b076-61347dd30000', 'active', '2026-02-19 12:37:47+00', '2026-05-12 23:08:27+00', '', '', '1989-07-05', 0, 0, 1, 0, '', 'abraao.santos10@yahoo.com.br', 'active', true, '55984395293', NULL),
('3fbf97ef-eeb4-43b4-a8a7-71f30a44c0a8', 'Adriana Michels Radmann', 'user', '02f08580-80e5-4f57-8a2e-1b078d337278', '725a9760-296a-4477-a84f-4603d2046fe6', 'ccf9c550-5239-45b6-931b-c68da93497d5', 'active', '2026-03-07 18:36:53+00', '2026-05-12 23:08:27+00', 'https://hmmbspebnqkueqwcqinr.supabase.co/storage/v1/object/public/avatars/985bc110-c90a-4762-8b1b-7b081e0c6863/avatar.jpg', '', '1981-03-01', 0, 0, 1, 0, 'Rua Wilhelm Rotermund, 108', 'adriana.radmann@gmail.com', 'active', true, '55981253114', 'af9ec153-d2f8-49ce-acd4-16adafa37b66'),
('022515da-e0a8-4f1e-879f-9aa212317fe4', 'Ana Beatriz wahlbrink', 'user', '02f08580-80e5-4f57-8a2e-1b078d337278', '725a9760-296a-4477-a84f-4603d2046fe6', 'ccf9c550-5239-45b6-931b-c68da93497d5', 'active', '2026-03-07 18:38:10+00', '2026-05-12 23:08:27+00', '', '', '2014-04-10', 0, 0, 1, 0, 'Rua Henrique plegue número 50', 'carinewahlbrinkrischeter@gmail.com', 'active', true, '55991448003', 'af9ec153-d2f8-49ce-acd4-16adafa37b66'),
('eb14bcab-0de9-491e-a309-66686e6030e0', 'Arthur Ismael Reusch', 'user', '02f08580-80e5-4f57-8a2e-1b078d337278', '725a9760-296a-4477-a84f-4603d2046fe6', 'ccf9c550-5239-45b6-931b-c68da93497d5', 'active', '2026-03-07 22:47:55+00', '2026-05-12 23:08:27+00', 'https://hmmbspebnqkueqwcqinr.supabase.co/storage/v1/object/public/avatars/f753b131-e334-4645-95d6-dd7f3f1193fc/avatar.jpg', '', '2014-06-16', 0, 0, 1, 0, 'Rua Portugal número 47 zona norte', 'arthurismaelr@gmail.com', 'active', true, '55997325884', 'af9ec153-d2f8-49ce-acd4-16adafa37b66')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (id, user_id, role, created_at) VALUES
('4e0c3fed-3310-481e-8e1e-6bb075459687', '33334a32-895e-47f6-b1a8-81f079186a95', 'user', now()),
('2c639af4-8ba5-47e9-a2d3-f3505ab40c64', 'b77b3145-6a42-48d7-b9bd-f61be2db8cb4', 'admin', now()),
('e44e1de7-5ef4-416a-a516-a241755c3b2a', '33334a32-895e-47f6-b1a8-81f079186a95', 'admin', now()),
('04939b6a-a2b9-44ac-b6bd-51b3478e7815', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'user', now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.authorized_system_admins (id, email, created_at) VALUES
('1', 'contato@ieclb.org.br', now())
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.notification_preferences (id, user_id, email, push, whatsapp, created_at, updated_at) VALUES
('1', '33334a32-895e-47f6-b1a8-81f079186a95', true, true, true, now(), now()),
('2', 'b77b3145-6a42-48d7-b9bd-f61be2db8cb4', true, true, true, now(), now())
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.push_subscriptions (id, user_id, endpoint, p256dh, auth, church_id, created_at, updated_at) VALUES
('ec5c6001-5d90-4df0-a7a5-f95e80700831', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', 'https://fcm.googleapis.com/fcm/send/ef3IRbySNNg:APA91bFDBmpdIU37hFz4vMCSweU_t8pwQPAXJJ5M8eCn2A_itsqPxvyvk1E7stA90TMZ034USW2dGnLR14_BJljuSBK2vrZMjxq3zdHBUObeWJjjEhucnoWga18D0H1x9P_eVKOXx_Qh', 'BM-IFwA6qVGG6DfJ1YJacBCJ7OllRTXLlRhSZFQ4L1kgRarah2KphF8T-GayuxCjBiFtq_-Jty-NXm3ZcAJxRlI', 'tlD8Ur1eo5OJIkRCCcsKEQ', '02f08580-80e5-4f57-8a2e-1b078d337278', '2026-03-10 22:01:29+00', '2026-05-13 17:58:22+00')
ON CONFLICT (id) DO NOTHING;
