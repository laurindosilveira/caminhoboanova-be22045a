-- ARQUIVO: public_data_areas.sql

BEGIN;

INSERT INTO public.areas (
  id, name, description, created_at, created_by, church_id
)
VALUES
(
  'aeee264c-2e30-42b7-85f9-0bd539c3156b', 'Área 1', 'Área criada para organização geográfica da igreja', '2026-04-09 14:10:59.171663+00', NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'beec4c09-21b6-40c1-84b3-3d42420c11d6', 'Área 2', 'Área criada para organização geográfica da igreja', '2026-04-09 14:10:59.171663+00', NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
)
ON CONFLICT DO NOTHING;

COMMIT;
