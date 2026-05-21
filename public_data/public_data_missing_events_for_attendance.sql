BEGIN;

-- Eventos faltantes referenciados em attendance

INSERT INTO public.events (
  id, title, description, event_date, location, area, community, type, created_by, created_at, linked_lesson_id, target_user_id, released_devotional_days, turma_id, church_id
)
VALUES
('1375e832-9f52-4427-9b63-b9883786dbb7', 'Ensino Confirmatório', NULL, '2026-04-11T19:00:00+00:00', NULL, 'Área 2', NULL, 'confirmatorio', NULL, '2026-02-25T12:20:14.613483+00:00', '725a9760-296a-4477-a84f-4603d2046fe6', NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('65168b49-f986-42e0-82b0-9450fa66d163', 'JEMIAC', NULL, '2026-04-04T20:00:00+00:00', NULL, 'Área 2', NULL, 'jemiac', NULL, '2026-04-14T10:51:01.284908+00:00', NULL, NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('49f29e5f-6db5-40e0-84af-79ed0a826963', 'JEMIAC', NULL, '2026-04-11T20:00:00+00:00', NULL, 'Área 2', NULL, 'jemiac', NULL, '2026-04-14T10:51:01.284908+00:00', NULL, NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('f7462770-e8db-45d9-a940-d1161307e880', 'JEMIAC', NULL, '2026-04-18T20:00:00+00:00', NULL, 'Área 2', NULL, 'jemiac', NULL, '2026-04-14T10:51:01.284908+00:00', NULL, NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('6a58b55a-0baa-4fa2-bdec-24bcad3aa101', 'JEMIAC', NULL, '2026-04-25T20:00:00+00:00', NULL, 'Área 2', NULL, 'jemiac', NULL, '2026-04-14T10:51:01.284908+00:00', NULL, NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('afbf7ccb-f9ac-43d8-ab10-06283476eb4c', 'JEMIAC', NULL, '2026-05-02T20:00:00+00:00', NULL, 'Área 2', NULL, 'jemiac', NULL, '2026-04-14T10:51:01.284908+00:00', NULL, NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('f68f0b7a-e2ac-4217-8cbc-fc24dfd84399', 'ensino confirmatório', NULL, '2026-03-21T19:00:00+00:00', 'Bom pastor', 'Área 1', 'Bom Pastor', 'confirmatorio', '2f773751-38c2-45a1-8ee0-f5b856092730', '2026-03-14T23:43:02.654355+00:00', NULL, NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('ff889c74-a764-4afa-8e4a-539d600699dd', 'JEMIAC', NULL, '2026-05-09T20:00:00+00:00', NULL, 'Área 2', NULL, 'jemiac', NULL, '2026-04-14T10:51:01.284908+00:00', NULL, NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('28b19977-7389-4d97-a434-b8b59bd36151', 'JEMIAC', NULL, '2026-05-16T20:00:00+00:00', NULL, 'Área 2', NULL, 'jemiac', NULL, '2026-04-14T10:51:01.284908+00:00', NULL, NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('daca087a-4a9f-4760-9094-161b9d0a7fcd', 'Raízes da Fé', 'Curso Raízes 1ª Edição - Para Pais e Confirmandos', '2026-04-11T17:30:00+00:00', 'Comunidade Martim Lutero', 'Área 2', 'Martim Lutero', 'encontro', NULL, '2026-03-05T18:26:40.422989+00:00', NULL, NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('4053d9ce-322b-44ce-8e86-14c0908710d2', 'Raízes Luterana', 'Curso Raízes 1ª Edição - Para Pais e Confirmandos', '2026-04-18T17:30:00+00:00', 'Comunidade Martim Lutero', 'Área 2', 'Martim Lutero', 'encontro', NULL, '2026-03-05T18:26:40.422989+00:00', NULL, NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('4979d556-fc2e-45d2-bc6f-88669bf5d98f', 'Raízes da Igreja', 'Curso Raízes 1ª Edição - Para Pais e Confirmandos', '2026-05-02T17:30:00+00:00', 'Comunidade Martim Lutero', 'Área 2', 'Martim Lutero', 'encontro', NULL, '2026-03-05T18:26:40.422989+00:00', NULL, NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('4290ec1d-373b-452f-8150-8358537944b9', 'Raízes da Igreja', 'Curso Raízes 1ª Edição - Para Pais e Confirmandos', '2026-05-09T17:30:00+00:00', 'Comunidade Martim Lutero', 'Área 2', 'Martim Lutero', 'encontro', NULL, '2026-03-05T18:26:40.422989+00:00', NULL, NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('03c6cccf-b824-4931-aa22-7bd8c96d6bf4', 'Ensino Confirmatório', NULL, '2026-05-02T20:00:00+00:00', NULL, 'Área 2', NULL, 'confirmatorio', '2f773751-38c2-45a1-8ee0-f5b856092730', '2026-03-14T23:53:37.331151+00:00', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('5a642c7d-0307-44c4-9f69-9efdb82d6106', 'Ensino confirmatório', NULL, '2026-04-11T20:00:00+00:00', 'Bom Pastor', 'Área 1', 'Bom Pastor', 'confirmatorio', '2f773751-38c2-45a1-8ee0-f5b856092730', '2026-03-14T23:00:57.953337+00:00', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', NULL, '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]', NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('b2eb8185-6857-412f-8836-310099e3c483', 'Culto Sexta-feira Santa', NULL, '2026-04-03T12:30:00+00:00', NULL, 'Área 2', 'Martim Lutero', 'culto', NULL, '2026-04-14T16:46:57.822614+00:00', NULL, NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('f64711df-10aa-4642-a11f-c03b99dc0ae5', 'Culto de Páscoa', NULL, '2026-04-05T10:00:00+00:00', NULL, 'Área 2', 'Martim Lutero', 'culto', NULL, '2026-04-14T16:46:57.822614+00:00', NULL, NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('56ea4154-3f3e-4542-a30b-6ec4f1b1b1a0', 'Culto', NULL, '2026-04-12T22:30:00+00:00', NULL, 'Área 2', 'Martim Lutero', 'culto', NULL, '2026-04-14T16:46:57.822614+00:00', NULL, NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('a64383a8-e112-422f-88fc-1aa14549ce0b', 'Culto', NULL, '2026-04-19T22:30:00+00:00', NULL, 'Área 2', 'Martim Lutero', 'culto', NULL, '2026-04-14T16:46:57.822614+00:00', NULL, NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('3f665d0f-fa61-4fa5-8cce-c2db9fa4b94f', 'Culto', NULL, '2026-04-26T22:30:00+00:00', NULL, 'Área 2', 'Martim Lutero', 'culto', NULL, '2026-04-14T16:46:57.822614+00:00', NULL, NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('db739f0c-d4fd-4dcb-979b-172afbdfc704', 'Culto', NULL, '2026-05-03T22:30:00+00:00', NULL, 'Área 2', 'Martim Lutero', 'culto', NULL, '2026-04-14T16:46:57.822614+00:00', NULL, NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('92ec2d93-b4ad-4cba-af09-37bf409d38b1', 'Culto', NULL, '2026-05-10T22:30:00+00:00', NULL, 'Área 2', 'Martim Lutero', 'culto', NULL, '2026-04-14T16:46:57.822614+00:00', NULL, NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('5dbf994c-ce7c-4523-ba90-f95f6a52bc8c', 'Culto', NULL, '2026-05-17T22:30:00+00:00', NULL, 'Área 2', 'Martim Lutero', 'culto', NULL, '2026-04-14T16:46:57.822614+00:00', NULL, NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('5a29081f-a6d0-4b7b-b7b7-3ce7147920fe', 'Ensino confirmatorio', NULL, '2026-05-09T22:00:00+00:00', NULL, 'Área 1', NULL, 'confirmatorio', '2f773751-38c2-45a1-8ee0-f5b856092730', '2026-04-16T22:19:35.00841+00:00', '67a5341d-a934-4387-a16c-1802e3e7b092', NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278')
ON CONFLICT (id) DO NOTHING;

COMMIT;