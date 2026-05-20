-- public_data_part_05_events_chat_notifications.sql
-- Inclui dados completos de: events, event_photos, community_chat, messages, notifications, prayer_requests, prayer_diary, prayer_pairs, polls

-- events
INSERT INTO public.events (id, church_id, community_id, title, description, start_time, end_time, location, event_type, created_at, updated_at) VALUES
('afb407be-cc20-47bf-8714-d8a4a19d83cc', '02f08580-80e5-4f57-8a2e-1b078d337278', 'ccf9c550-5239-45b6-931b-c68da93497d5', 'Encontro de Jovens', 'Debate sobre identidade.', '2026-04-21 19:00:00+00', '2026-04-21 21:00:00+00', 'Salão Paroquial', 'Reunião', '2026-04-01 00:00:00+00', '2026-04-01 00:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- prayer_pairs
INSERT INTO public.prayer_pairs (id, church_id, community_id, user_a_id, user_b_id, user_a_name, user_b_name, week_start, created_at) VALUES
('313af9b0-265e-40f1-aca0-37f94205e07b', '02f08580-80e5-4f57-8a2e-1b078d337278', 'ccf9c550-5239-45b6-931b-c68da93497d5', '914b898d-24a3-46ad-a764-d2f24e5115d1', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'Natalia Luiza herder', 'Cecília dettmer', '2026-03-16', '2026-03-16 18:13:33+00'),
('76635029-ac6e-4a0d-8acd-d9bf2eb55903', '02f08580-80e5-4f57-8a2e-1b078d337278', 'ccf9c550-5239-45b6-931b-c68da93497d5', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'Gustavo Widthauper Breunig', 'Pyetra Adriele Diefenthaler', '2026-03-16', '2026-03-16 18:13:33+00')
ON CONFLICT (id) DO NOTHING;

-- community_chat
INSERT INTO public.community_chat (id, community_id, user_id, content, created_at, church_id) VALUES
('ecb43c7d-8301-4b16-a7ac-260c2637d6e1', 'ccf9c550-5239-45b6-931b-c68da93497d5', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'Esperanças', '2026-04-05 14:24:32+00', '02f08580-80e5-4f57-8a2e-1b078d337278'),
('0cb003b5-9bea-4b9e-940d-ea1d2e54d3b1', 'ccf9c550-5239-45b6-931b-c68da93497d5', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', 'Forças', '2026-04-07 01:25:09+00', '02f08580-80e5-4f57-8a2e-1b078d337278')
ON CONFLICT (id) DO NOTHING;
