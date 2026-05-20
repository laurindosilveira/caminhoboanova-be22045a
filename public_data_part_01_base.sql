-- Parte 01: Dados Base
-- Tabelas: churches, areas, communities, custom_event_types, turmas, worship_songs, whatsapp_reminder_config, community_settings

-- churches
INSERT INTO public.churches (id, name, slug, address, phone, email, website, logo_url, settings, created_at, updated_at) VALUES
('02f08580-80e5-4f57-8a2e-1b078d337278', 'IECLB', 'ieclb', 'Rua das Flores, 123', '(51) 99999-9999', 'contato@ieclb.org.br', 'https://ieclb.org.br', NULL, '{"theme": "light"}', '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- areas
INSERT INTO public.areas (id, church_id, name, description, created_at, updated_at) VALUES
('c868695c-b915-43b1-9247-9c6160fa6cf3', '02f08580-80e5-4f57-8a2e-1b078d337278', 'Área 1', 'Primeira Área', '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00'),
('725a9760-296a-4477-a84f-4603d2046fe6', '02f08580-80e5-4f57-8a2e-1b078d337278', 'Área 2', 'Segunda Área', '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- communities
INSERT INTO public.communities (id, church_id, area_id, name, description, created_at, updated_at, logo_url, slug, welcome_video_url) VALUES
('ccf9c550-5239-45b6-931b-c68da93497d5', '02f08580-80e5-4f57-8a2e-1b078d337278', 'c868695c-b915-43b1-9247-9c6160fa6cf3', 'Martim Lutero', 'Comunidade Martim Lutero', '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00', NULL, 'martim-lutero', 'https://chat.whatsapp.com/CboOWLloASAL5s1Onxrdiy'),
('d2e94866-232e-4d55-b076-61347dd30000', '02f08580-80e5-4f57-8a2e-1b078d337278', '725a9760-296a-4477-a84f-4603d2046fe6', 'Bom Pastor', 'Comunidade Bom Pastor', '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00', NULL, 'bom-pastor', NULL),
('f6354866-232e-4d55-b076-61347dd30001', '02f08580-80e5-4f57-8a2e-1b078d337278', '725a9760-296a-4477-a84f-4603d2046fe6', 'Paz', 'Comunidade da Paz', '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00', NULL, 'paz', NULL),
('f6354866-232e-4d55-b076-61347dd30002', '02f08580-80e5-4f57-8a2e-1b078d337278', '725a9760-296a-4477-a84f-4603d2046fe6', 'Ascensão', 'Comunidade Ascensão', '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00', NULL, 'ascensao', NULL),
('f6354866-232e-4d55-b076-61347dd30003', '02f08580-80e5-4f57-8a2e-1b078d337278', '725a9760-296a-4477-a84f-4603d2046fe6', 'Ressurreição', 'Comunidade Ressurreição', '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00', NULL, 'ressurreicao', NULL),
('f6354866-232e-4d55-b076-61347dd30004', '02f08580-80e5-4f57-8a2e-1b078d337278', '725a9760-296a-4477-a84f-4603d2046fe6', 'Trindade', 'Comunidade Trindade', '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00', NULL, 'trindade', NULL),
('f6354866-232e-4d55-b076-61347dd30005', '02f08580-80e5-4f57-8a2e-1b078d337278', '725a9760-296a-4477-a84f-4603d2046fe6', 'Emanuel', 'Comunidade Emanuel', '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00', NULL, 'emanuel', NULL)
ON CONFLICT (id) DO NOTHING;

-- custom_event_types
INSERT INTO public.custom_event_types (id, church_id, name, color, icon, created_at) VALUES
('1', '02f08580-80e5-4f57-8a2e-1b078d337278', 'Culto', '#3b82f6', 'church', '2026-03-01 00:00:00+00'),
('2', '02f08580-80e5-4f57-8a2e-1b078d337278', 'Reunião', '#10b981', 'users', '2026-03-01 00:00:00+00'),
('3', '02f08580-80e5-4f57-8a2e-1b078d337278', 'Estudo', '#f59e0b', 'book', '2026-03-01 00:00:00+00'),
('4', '02f08580-80e5-4f57-8a2e-1b078d337278', 'Evento Social', '#ef4444', 'party-popper', '2026-03-01 00:00:00+00'),
('5', '02f08580-80e5-4f57-8a2e-1b078d337278', 'Outros', '#6b7280', 'calendar', '2026-03-01 00:00:00+00'),
('6', '02f08580-80e5-4f57-8a2e-1b078d337278', 'Ensino Confirmatório', '#8b5cf6', 'graduation-cap', '2026-03-01 00:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- turmas
INSERT INTO public.turmas (id, church_id, community_id, name, year, created_at, updated_at) VALUES
('af9ec153-d2f8-49ce-acd4-16adafa37b66', '02f08580-80e5-4f57-8a2e-1b078d337278', 'ccf9c550-5239-45b6-931b-c68da93497d5', 'Turma 2026', 1, '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00'),
('af9ec153-d2f8-49ce-acd4-16adafa37b67', '02f08580-80e5-4f57-8a2e-1b078d337278', 'd2e94866-232e-4d55-b076-61347dd30000', 'Turma 2026 BP', 1, '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- whatsapp_reminder_config
INSERT INTO public.whatsapp_reminder_config (id, church_id, community_id, day_of_week, time_of_day, message_template, is_enabled, created_at, updated_at) VALUES
('1', '02f08580-80e5-4f57-8a2e-1b078d337278', 'ccf9c550-5239-45b6-931b-c68da93497d5', 5, '09:00:00', 'Lembrete: amanhã temos encontro!', true, '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00'),
('2', '02f08580-80e5-4f57-8a2e-1b078d337278', 'd2e94866-232e-4d55-b076-61347dd30000', 5, '09:00:00', 'Lembrete: amanhã temos encontro!', true, '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00'),
('3', '02f08580-80e5-4f57-8a2e-1b078d337278', NULL, 5, '09:00:00', 'Lembrete Geral!', true, '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- community_settings
INSERT INTO public.community_settings (id, church_id, community_id, allow_chat, show_ranking, theme_color, created_at, updated_at) VALUES
('1', '02f08580-80e5-4f57-8a2e-1b078d337278', 'ccf9c550-5239-45b6-931b-c68da93497d5', true, true, '#3b82f6', '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00')
ON CONFLICT (id) DO NOTHING;
