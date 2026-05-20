-- Parte 01: Dados Base
-- Table: churches
INSERT INTO public.churches (id, name, slug, address, city, state, logo_url, primary_color, secondary_color, is_active, created_at, updated_at) VALUES ('02f08580-80e5-4f57-8a2e-1b078d337278', 'Igreja Boa Nova', 'boa-nova', NULL, NULL, NULL, NULL, '#1F3C88', '#E8880A', true, '2026-05-12 23:08:27.331994+00', '2026-05-12 23:08:27.331994+00') ON CONFLICT DO NOTHING;

-- Table: areas
INSERT INTO public.areas (id, name, description, created_at, created_by, church_id) VALUES ('aeee264c-2e30-42b7-85f9-0bd539c3156b', 'Área 1', 'Área criada para organização geográfica da igreja', '2026-04-09 14:10:59.171663+00', NULL, '02f08580-80e5-4f57-8a2e-1b078d337278') ON CONFLICT DO NOTHING;
INSERT INTO public.areas (id, name, description, created_at, created_by, church_id) VALUES ('beec4c09-21b6-40c1-84b3-3d42420c11d6', 'Área 2', 'Área criada para organização geográfica da igreja', '2026-04-09 14:10:59.171663+00', NULL, '02f08580-80e5-4f57-8a2e-1b078d337278') ON CONFLICT DO NOTHING;

-- Table: communities
INSERT INTO public.communities (id, area_id, name, created_at, created_by, church_id) VALUES ('7737b8b9-69d2-4883-a4a9-00710361dfca', 'aeee264c-2e30-42b7-85f9-0bd539c3156b', 'Rincão Frente', '2026-04-09 14:10:59.171663+00', NULL, '02f08580-80e5-4f57-8a2e-1b078d337278') ON CONFLICT DO NOTHING;
INSERT INTO public.communities (id, area_id, name, created_at, created_by, church_id) VALUES ('9d4ed9e6-21f7-4a56-8080-e0584a89b69f', 'aeee264c-2e30-42b7-85f9-0bd539c3156b', 'Rincão Fundo', '2026-04-09 14:10:59.171663+00', NULL, '02f08580-80e5-4f57-8a2e-1b078d337278') ON CONFLICT DO NOTHING;
INSERT INTO public.communities (id, area_id, name, created_at, created_by, church_id) VALUES ('c250a178-a85b-4aad-9c02-0ce56256fb7e', 'aeee264c-2e30-42b7-85f9-0bd539c3156b', 'Bom Pastor', '2026-04-09 14:10:59.171663+00', NULL, '02f08580-80e5-4f57-8a2e-1b078d337278') ON CONFLICT DO NOTHING;
INSERT INTO public.communities (id, area_id, name, created_at, created_by, church_id) VALUES ('560c47af-68f4-4b56-a20c-e847798326e0', 'aeee264c-2e30-42b7-85f9-0bd539c3156b', 'Iriá Pira 1', '2026-04-09 14:10:59.171663+00', NULL, '02f08580-80e5-4f57-8a2e-1b078d337278') ON CONFLICT DO NOTHING;
INSERT INTO public.communities (id, area_id, name, created_at, created_by, church_id) VALUES ('abcaeb36-720e-43c7-bb4e-3343d8d4789b', 'beec4c09-21b6-40c1-84b3-3d42420c11d6', 'Martim Lutero', '2026-04-09 14:10:59.171663+00', NULL, '02f08580-80e5-4f57-8a2e-1b078d337278') ON CONFLICT DO NOTHING;
INSERT INTO public.communities (id, area_id, name, created_at, created_by, church_id) VALUES ('27efec49-f9d5-45ca-b260-154fc5cd5ca8', 'beec4c09-21b6-40c1-84b3-3d42420c11d6', 'Linha Brasil', '2026-04-09 14:10:59.171663+00', NULL, '02f08580-80e5-4f57-8a2e-1b078d337278') ON CONFLICT DO NOTHING;
INSERT INTO public.communities (id, area_id, name, created_at, created_by, church_id) VALUES ('6d2b90c8-a512-404e-b567-902347ba681b', 'beec4c09-21b6-40c1-84b3-3d42420c11d6', 'Iriá Pira 2', '2026-04-09 14:10:59.171663+00', NULL, '02f08580-80e5-4f57-8a2e-1b078d337278') ON CONFLICT DO NOTHING;

