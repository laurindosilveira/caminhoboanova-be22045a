-- public_data_part_06_settings_achievements.sql
-- Inclui dados completos de: system_settings, game_config, achievement_definitions, achievement_unlocks, login_audit_logs, year_promotion_requests

-- system_settings
INSERT INTO public.system_settings (id, key, value, description, created_at, updated_at) VALUES
('1', 'app_version', '1.0.0', 'Versão atual do app', now(), now())
ON CONFLICT (id) DO NOTHING;

-- game_config
INSERT INTO public.game_config (id, church_id, xp_per_lesson, xp_per_devotional, points_per_level, created_at, updated_at) VALUES
('1', '02f08580-80e5-4f57-8a2e-1b078d337278', 100, 50, 1000, now(), now())
ON CONFLICT (id) DO NOTHING;

-- achievement_definitions
INSERT INTO public.achievement_definitions (id, church_id, name, description, icon, xp_reward, points_reward, created_at) VALUES
('1', '02f08580-80e5-4f57-8a2e-1b078d337278', 'Primeiro Passo', 'Completou a primeira lição.', 'star', 100, 10, now()),
('2', '02f08580-80e5-4f57-8a2e-1b078d337278', 'Devoto', 'Completou 7 devocionais seguidos.', 'flame', 500, 50, now())
ON CONFLICT (id) DO NOTHING;

-- achievement_unlocks
INSERT INTO public.achievement_unlocks (id, user_id, achievement_id, unlocked_at, church_id) VALUES
('1', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '1', now(), '02f08580-80e5-4f57-8a2e-1b078d337278'),
('2', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '1', now(), '02f08580-80e5-4f57-8a2e-1b078d337278')
ON CONFLICT (id) DO NOTHING;

-- year_promotion_requests
INSERT INTO public.year_promotion_requests (id, church_id, user_id, turma_id, from_year, to_year, status, requested_at) VALUES
('67171998-5c2c-48d3-98cc-9470d5d408e9', '02f08580-80e5-4f57-8a2e-1b078d337278', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'af9ec153-d2f8-49ce-acd4-16adafa37b66', 1, 2, 'pendente', '2026-03-12 03:30:42+00')
ON CONFLICT (id) DO NOTHING;
