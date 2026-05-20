BEGIN;

-- Bloco 1: Eventos (Registros 1-100)
INSERT INTO public.events (
  id,
  title,
  description,
  event_date,
  location,
  area,
  community,
  type,
  created_by,
  created_at,
  linked_lesson_id,
  target_user_id,
  released_devotional_days,
  turma_id,
  church_id
)
VALUES
('fce1f65d-945f-4fdd-a228-ddb99df3401d', 'Ensino Confirmatório', NULL, '2026-08-01 19:00:00+00', NULL, NULL, NULL, 'confirmatorio', NULL, '2026-02-25 12:20:14.613483+00', '116934e8-11a0-4b6e-a978-16da25b046b4', NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('4ed7e20d-9009-458e-9c88-b1ebc6822c8b', 'Passa Dia Ens. Confirmatório', 'Casa de Retiros - Cruz Alta', '2026-04-25 11:00:00+00', NULL, 'Área 1', NULL, 'confirmatorio', NULL, '2026-02-25 12:20:14.613483+00', NULL, NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('e68ee036-28dc-4cae-a1d3-6450877e6b8e', 'Culto de Confirmação', NULL, '2026-11-07 22:00:00+00', NULL, NULL, NULL, 'culto', NULL, '2026-02-25 12:20:14.613483+00', NULL, NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('f25617a2-07e1-4a05-ac09-c475f10ee6bb', 'Ensino Confirmatório', NULL, '2026-09-19 19:00:00+00', NULL, NULL, NULL, 'confirmatorio', NULL, '2026-02-25 12:20:14.613483+00', 'c868695c-b915-43b1-9247-9c6160fa6cf3', NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('399f22a1-2da4-47cd-bbef-1073404f75b6', 'Ensino Confirmatório', NULL, '2026-08-15 19:00:00+00', NULL, NULL, NULL, 'confirmatorio', NULL, '2026-02-25 12:20:14.613483+00', 'a329150d-4bb9-48c9-a177-35550f607583', NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('5b93ba53-1e8b-4b36-9213-c06f67826dd1', 'Ensino Confirmatório', NULL, '2026-06-20 19:00:00+00', NULL, NULL, NULL, 'confirmatorio', NULL, '2026-02-25 12:20:14.613483+00', 'f2e4513b-c426-4fc6-9aa5-ff282218a9ed', NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('3188c95d-490c-499d-a5ed-68d3db7c35c3', 'Ensino Confirmatório', NULL, '2026-07-04 19:00:00+00', NULL, NULL, NULL, 'confirmatorio', NULL, '2026-02-25 12:20:14.613483+00', '3b8cebbd-a61b-417e-8ca5-f0906222ee88', NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('f7ac9ff5-c57b-4cbf-8290-410d6edda46c', 'Ensino Confirmatório', NULL, '2026-10-17 19:00:00+00', NULL, NULL, NULL, 'confirmatorio', NULL, '2026-02-25 12:20:14.613483+00', '9ae625cf-c913-4bf8-a059-37dbe1633dd6', NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('3264e720-fc64-41b0-b982-00d8827b8ad0', 'Ensino Confirmatório', NULL, '2026-09-05 19:00:00+00', NULL, NULL, NULL, 'confirmatorio', NULL, '2026-02-25 12:20:14.613483+00', 'faddbfea-4925-4a89-920b-7da2905c747f', NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('8d052a90-4563-45dd-be94-ccce202141d1', 'Ensino Confirmatório', NULL, '2026-06-06 19:00:00+00', NULL, NULL, NULL, 'confirmatorio', NULL, '2026-02-25 12:20:14.613483+00', 'a988a6eb-6505-45b4-93b4-eb01f7940877', NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('8c2fb46e-cb17-4d97-9f53-a9edcdab3a01', 'Ensino Confirmatório', NULL, '2026-07-11 19:00:00+00', NULL, NULL, NULL, 'confirmatorio', NULL, '2026-02-25 12:20:14.613483+00', 'b3df72e8-52ef-473f-a328-38b5b8093cc8', NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'),
('4873fb77-4df2-436a-8c4b-7210f5348a9d', 'Ensino Confirmatório', NULL, '2026-03-21 19:00:00+00', NULL, 'Área 2', 'Martim Lutero', 'confirmatorio', NULL, '2026-02-25 12:20:14.613483+00', NULL, NULL, NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278')
ON CONFLICT (id) DO NOTHING;

COMMIT;
