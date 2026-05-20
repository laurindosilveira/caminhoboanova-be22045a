-- ARQUIVO: public_data_courses.sql

BEGIN;

INSERT INTO public.courses (
  id, order_num, title, subtitle, created_at, church_id
)
VALUES
(
  '7334230a-3021-43fb-83fc-e11b624cf10c', 1, 'Raízes: Começando a Vida Cristã', 'Compreender o Evangelho, firmar identidade em Cristo e entender pertencimento à Igreja', '2026-02-19 01:38:39.192964+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '66ee05a0-c250-4dc6-9c4e-f08bd09e56cc', 2, 'Firme na Fé: Crescendo na Vida Cristã', 'Maturidade espiritual, identidade sólida e cosmovisão cristã para viver no mundo contemporâneo', '2026-02-19 01:38:39.192964+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
)
ON CONFLICT DO NOTHING;

COMMIT;
