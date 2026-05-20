-- public_data_part_03_courses_lessons.sql
-- Inclui dados completos de: courses, lessons, lesson_content, devotional_content, leader_guide, turma_lesson_content

-- courses
INSERT INTO public.courses (id, church_id, name, description, image_url, order_index, created_at, updated_at) VALUES
('a2631a50-5d29-465d-8b29-4e6bb6594f21', '02f08580-80e5-4f57-8a2e-1b078d337278', 'Identidade em Cristo', 'Curso sobre quem somos em Jesus.', NULL, 1, '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00'),
('157325ab-c5cb-4696-bdfc-e9b4c8120e1c', '02f08580-80e5-4f57-8a2e-1b078d337278', 'Discipulado 3M', 'Curso sobre Amar, Servir e Discípular.', NULL, 2, '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- lessons
INSERT INTO public.lessons (id, course_id, title, description, order_index, video_url, created_at, updated_at) VALUES
('c868695c-b915-43b1-9247-9c6160fa6cf3', 'a2631a50-5d29-465d-8b29-4e6bb6594f21', 'Lição 1: Criado à Imagem de Deus', 'Base bíblica sobre a criação.', 1, NULL, '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00'),
('725a9760-296a-4477-a84f-4603d2046fe6', 'a2631a50-5d29-465d-8b29-4e6bb6594f21', 'Lição 2: A Queda e a Identidade', 'Como o pecado afetou nossa visão.', 2, NULL, '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- lesson_content
INSERT INTO public.lesson_content (id, lesson_id, content_type, content_data, order_index, created_at, updated_at) VALUES
('1', 'c868695c-b915-43b1-9247-9c6160fa6cf3', 'text', '{"text": "Deus nos criou..."}', 1, '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- devotional_content
INSERT INTO public.devotional_content (id, lesson_id, day_index, title, passage, content, reflection_questions, created_at, updated_at) VALUES
('5e859f9e-3016-4482-96fd-1cae2e76f966', 'c868695c-b915-43b1-9247-9c6160fa6cf3', 1, 'Dia 1: O Espelho de Deus', 'Gênesis 1:27', 'Hoje vamos refletir sobre...', '["O que significa ser imagem de Deus?", "Como isso muda seu valor?"]', '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00'),
('9bf5b69c-d399-4266-9e14-57570672ef33', 'c868695c-b915-43b1-9247-9c6160fa6cf3', 2, 'Dia 2: Chamados pelo Nome', 'Isaías 43:1', 'Hoje vamos refletir sobre...', '["Como é saber que Deus te conhece?", "Você confia nesse chamado?"]', '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- leader_guide
INSERT INTO public.leader_guide (id, lesson_id, guide_content, created_at, updated_at) VALUES
('1', 'c868695c-b915-43b1-9247-9c6160fa6cf3', 'Orientações para o líder...', '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00')
ON CONFLICT (id) DO NOTHING;
