-- ARQUIVO: public_data_turmas.sql

BEGIN;

INSERT INTO public.turmas (
  id, name, area, year, description, is_active, created_by, created_at, church_id
)
VALUES
(
  'af9ec153-d2f8-49ce-acd4-16adafa37b66', 'Confirmatório 2026 - Área 2', 'Área 2', 2025, 'Turma de Ensino Confirmatório Área 2', 't', NULL, '2026-02-25 13:31:56.922388+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f29b8625-c980-4c74-9c41-cd28189d1c09', 'Confirmatório 2026 - Área 1', 'Área 1', 2025, 'Turma de Ensino Confirmatório Área 1', 't', NULL, '2026-02-25 13:31:56.922388+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
)
ON CONFLICT DO NOTHING;

COMMIT;
