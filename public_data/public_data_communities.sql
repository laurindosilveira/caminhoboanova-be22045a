-- ARQUIVO: public_data_communities.sql

BEGIN;

INSERT INTO public.communities (
  id, area_id, name, created_at, created_by, church_id
)
VALUES
(
  '7737b8b9-69d2-4883-a4a9-00710361dfca', 'aeee264c-2e30-42b7-85f9-0bd539c3156b', 'Rincão Frente', '2026-04-09 14:10:59.171663+00', NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9d4ed9e6-21f7-4a56-8080-e0584a89b69f', 'aeee264c-2e30-42b7-85f9-0bd539c3156b', 'Rincão Fundo', '2026-04-09 14:10:59.171663+00', NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c250a178-a85b-4aad-9c02-0ce56256fb7e', 'aeee264c-2e30-42b7-85f9-0bd539c3156b', 'Bom Pastor', '2026-04-09 14:10:59.171663+00', NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '560c47af-68f4-4b56-a20c-e847798326e0', 'aeee264c-2e30-42b7-85f9-0bd539c3156b', 'Iriá Pira 1', '2026-04-09 14:10:59.171663+00', NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'abcaeb36-720e-43c7-bb4e-3343d8d4789b', 'beec4c09-21b6-40c1-84b3-3d42420c11d6', 'Martim Lutero', '2026-04-09 14:10:59.171663+00', NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '27efec49-f9d5-45ca-b260-154fc5cd5ca8', 'beec4c09-21b6-40c1-84b3-3d42420c11d6', 'Linha Brasil', '2026-04-09 14:10:59.171663+00', NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6d2b90c8-a512-404e-b567-902347ba681b', 'beec4c09-21b6-40c1-84b3-3d42420c11d6', 'Iriá Pira 2', '2026-04-09 14:10:59.171663+00', NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
)
ON CONFLICT DO NOTHING;

COMMIT;
