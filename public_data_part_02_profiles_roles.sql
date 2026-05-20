-- Parte 02: Profiles e Roles
-- Tabelas: profiles, user_roles, authorized_system_admins, notification_preferences, push_subscriptions

-- profiles
INSERT INTO public.profiles (id, full_name, role, church_id, area_id, community_id, status, created_at, updated_at, avatar_url, bio, birth_date, points, xp, level, rank) VALUES
('2f773751-38c2-45a1-8ee0-f5b856092730', 'Laurindo Manoel da Silveira', 'admin', '02f08580-80e5-4f57-8a2e-1b078d337278', 'c868695c-b915-43b1-9247-9c6160fa6cf3', 'ccf9c550-5239-45b6-931b-c68da93497d5', 'active', '2026-03-01 10:00:00+00', '2026-03-01 10:00:00+00', NULL, NULL, '1980-01-01', 0, 0, 1, 0),
('68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', 'Rafael Hartke Correa', 'student', '02f08580-80e5-4f57-8a2e-1b078d337278', 'c868695c-b915-43b1-9247-9c6160fa6cf3', 'ccf9c550-5239-45b6-931b-c68da93497d5', 'active', '2026-03-01 10:00:00+00', '2026-03-01 10:00:00+00', NULL, NULL, '2010-01-01', 50, 500, 5, 1),
('aa7cfdb6-13b7-4988-8922-86de735eeab2', 'Kamilly Gelatti Rodrigues', 'student', '02f08580-80e5-4f57-8a2e-1b078d337278', 'c868695c-b915-43b1-9247-9c6160fa6cf3', 'ccf9c550-5239-45b6-931b-c68da93497d5', 'active', '2026-03-01 10:00:00+00', '2026-03-01 10:00:00+00', NULL, NULL, '2010-01-01', 45, 450, 4, 2),
('d92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'Rafaela Luize Schemmer', 'student', '02f08580-80e5-4f57-8a2e-1b078d337278', 'c868695c-b915-43b1-9247-9c6160fa6cf3', 'ccf9c550-5239-45b6-931b-c68da93497d5', 'active', '2026-03-01 10:00:00+00', '2026-03-01 10:00:00+00', NULL, NULL, '2010-01-01', 40, 400, 4, 3),
('ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'Ana Beatriz wahlbrink', 'student', '02f08580-80e5-4f57-8a2e-1b078d337278', 'c868695c-b915-43b1-9247-9c6160fa6cf3', 'ccf9c550-5239-45b6-931b-c68da93497d5', 'active', '2026-03-01 10:00:00+00', '2026-03-01 10:00:00+00', NULL, NULL, '2010-01-01', 35, 350, 3, 4),
('f753b131-e334-4645-95d6-dd7f3f1193fc', 'Arthur Ismael Reusch', 'student', '02f08580-80e5-4f57-8a2e-1b078d337278', 'c868695c-b915-43b1-9247-9c6160fa6cf3', 'ccf9c550-5239-45b6-931b-c68da93497d5', 'active', '2026-03-01 10:00:00+00', '2026-03-01 10:00:00+00', NULL, NULL, '2010-01-01', 30, 300, 3, 5),
('7c2a671d-0f04-463e-ab89-d0e4fae6d165', 'Théo Loose de Moura', 'student', '02f08580-80e5-4f57-8a2e-1b078d337278', '725a9760-296a-4477-a84f-4603d2046fe6', 'd2e94866-232e-4d55-b076-61347dd30000', 'active', '2026-03-01 10:00:00+00', '2026-03-01 10:00:00+00', NULL, NULL, '2010-01-01', 25, 250, 2, 6)
-- ... [Resto dos 41 profiles]
ON CONFLICT (id) DO NOTHING;

-- user_roles
INSERT INTO public.user_roles (id, user_id, role, created_at) VALUES
(gen_random_uuid(), '2f773751-38c2-45a1-8ee0-f5b856092730', 'admin', now()),
(gen_random_uuid(), '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', 'student', now()),
(gen_random_uuid(), 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'student', now()),
(gen_random_uuid(), 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'student', now()),
(gen_random_uuid(), 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'student', now()),
(gen_random_uuid(), 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'student', now()),
(gen_random_uuid(), '7c2a671d-0f04-463e-ab89-d0e4fae6d165', 'student', now())
-- ... [Resto dos user_roles]
ON CONFLICT (user_id, role) DO NOTHING;

-- authorized_system_admins
INSERT INTO public.authorized_system_admins (id, email, created_at) VALUES
('1', 'contato@ieclb.org.br', now())
ON CONFLICT (email) DO NOTHING;

-- notification_preferences
INSERT INTO public.notification_preferences (id, user_id, email, push, whatsapp, created_at, updated_at) VALUES
('1', '2f773751-38c2-45a1-8ee0-f5b856092730', true, true, true, now(), now()),
('2', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', true, true, true, now(), now())
ON CONFLICT (user_id) DO NOTHING;

-- push_subscriptions
INSERT INTO public.push_subscriptions (id, user_id, endpoint, p256dh, auth, church_id, created_at, updated_at) VALUES
('ec5c6001-5d90-4df0-a7a5-f95e80700831', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', 'https://fcm.googleapis.com/fcm/send/ef3IRbySNNg:APA91bFDBmpdIU37hFz4vMCSweU_t8pwQPAXJJ5M8eCn2A_itsqPxvyvk1E7stA90TMZ034USW2dGnLR14_BJljuSBK2vrZMjxq3zdHBUObeWJjjEhucnoWga18D0H1x9P_eVKOXx_Qh', 'BM-IFwA6qVGG6DfJ1YJacBCJ7OllRTXLlRhSZFQ4L1kgRarah2KphF8T-GayuxCjBiFtq_-Jty-NXm3ZcAJxRlI', 'tlD8Ur1eo5OJIkRCCcsKEQ', '02f08580-80e5-4f57-8a2e-1b078d337278', '2026-03-10 22:01:29.2947+00', '2026-05-13 17:58:22.190502+00'),
('3721c375-fb1a-4965-ba04-eec82d3d14a5', '32a9f112-1192-4b2a-918f-c2895a76ade3', 'https://fcm.googleapis.com/fcm/send/eYIoepQphY0:APA91bHwaD8_7Dy5c8V9ps6eXD2Y_EvvbICHMhmAXptXLUN2YtxIqn13bG9QE2cU0KmdKaO8-v8kQpcklgAokZg64QrMELVYZBFJ1IUQ2rCDYREV1ae27ga-pxP16hFvOpaDSyzZRJvo', 'BGESxttoTjX9ZAiNshhr_hr8DNXohsYVXxojSUkj-KadmV2dUtpCwGINN6HHPkUGh208E1G8D04KtpoLb5yQarA', 'jOkn5G0oysOZhndNoiJxBA', '02f08580-80e5-4f57-8a2e-1b078d337278', '2026-03-07 18:38:15.921123+00', '2026-05-13 17:58:22.190502+00')
ON CONFLICT (id) DO NOTHING;
