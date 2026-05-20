-- public_data_part_04_progress_attendance.sql
-- Inclui dados completos de: attendance, devotional_progress, devotional_responses, lesson_responses

-- attendance
INSERT INTO public.attendance (id, user_id, event_id, status, created_at, updated_at, church_id) VALUES
('bf2b4182-fd02-4eaa-a419-94674c37b509', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'present', '2026-04-21 22:09:36+00', '2026-05-13 12:53:51+00', '02f08580-80e5-4f57-8a2e-1b078d337278'),
('cc7398be-cbbe-47b3-8952-2bbaeff31635', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'present', '2026-04-21 22:12:40+00', '2026-05-13 12:53:51+00', '02f08580-80e5-4f57-8a2e-1b078d337278')
ON CONFLICT (id) DO NOTHING;

-- devotional_progress
INSERT INTO public.devotional_progress (id, user_id, devotional_id, completed_at, awarded_points, church_id) VALUES
('6cccfb4f-f9fd-42b4-8c3c-e9aaecee8132', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'acd52f9f-c877-46b5-a897-1a1c1638781a', '2026-04-24 15:53:17+00', 5, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('16ae6457-8c22-4fee-9693-2ba75c1cfa84', '1526dc8b-a92a-4a44-b358-b6a3083d0143', 'af440fb5-5112-4e54-bbb3-82812e917370', '2026-04-24 16:00:28+00', 5, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('eff919e0-e995-45f9-bd61-74fb562431e4', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'af440fb5-5112-4e54-bbb3-82812e917370', '2026-04-24 16:42:52+00', 5, '02f08580-80e5-4f57-8a2e-1b078d337278')
ON CONFLICT (id) DO NOTHING;

-- devotional_responses
INSERT INTO public.devotional_responses (id, user_id, devotional_id, question_index, response, created_at, updated_at, church_id) VALUES
('90565e9b-4a8c-485c-b873-0f7c68f6d65c', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '5e859f9e-3016-4482-96fd-1cae2e76f966', 2, 'Porque só Deus e Jesus são perfeitos.', '2026-05-13 01:29:01+00', '2026-05-13 17:58:22+00', '02f08580-80e5-4f57-8a2e-1b078d337278'),
('546a8b03-5448-4ac5-8062-af2b0985347d', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '5e859f9e-3016-4482-96fd-1cae2e76f966', 0, 'Viver longe de Deus', '2026-05-13 02:42:05+00', '2026-05-13 17:58:22+00', '02f08580-80e5-4f57-8a2e-1b078d337278'),
('db84ec31-0d8c-4e78-b864-bd661a1fe43c', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '5e859f9e-3016-4482-96fd-1cae2e76f966', 1, 'Ele afeta nossa identidade com Cristo', '2026-05-13 02:42:05+00', '2026-05-13 17:58:22+00', '02f08580-80e5-4f57-8a2e-1b078d337278'),
('a0a69f34-717a-427f-8238-0cfa067319bb', 'a608622c-4120-4d15-949f-235ca64db2cf', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'Jesus', '2026-05-13 09:45:03+00', '2026-05-13 17:58:22+00', '02f08580-80e5-4f57-8a2e-1b078d337278')
ON CONFLICT (id) DO NOTHING;

-- lesson_responses
INSERT INTO public.lesson_responses (id, user_id, lesson_id, question_key, response, created_at, updated_at, church_id) VALUES
('bf2b4182-fd02-4eaa-a419-94674c37b509', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q4', 'A diferença e de que me faz lembrar de que minha indentidade começa em Deus e não na aparência, popularidade etc...', '2026-04-21 22:09:36+00', '2026-05-13 12:53:51+00', '02f08580-80e5-4f57-8a2e-1b078d337278')
ON CONFLICT (id) DO NOTHING;
