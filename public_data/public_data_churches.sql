-- ARQUIVO: public_data_churches.sql

BEGIN;

INSERT INTO public.churches (
  id, name, slug, address, city, state, logo_url, primary_color, secondary_color, is_active, created_at, updated_at
)
VALUES
(
  '02f08580-80e5-4f57-8a2e-1b078d337278', 'Igreja Boa Nova', 'boa-nova', NULL, NULL, NULL, NULL, '#1F3C88', '#E8880A', 't', '2026-05-12 23:08:27.331994+00', '2026-05-12 23:08:27.331994+00'
)
ON CONFLICT DO NOTHING;

COMMIT;
