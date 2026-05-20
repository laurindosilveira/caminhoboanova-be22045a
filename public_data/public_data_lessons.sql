-- ARQUIVO: public_data_lessons.sql

BEGIN;

INSERT INTO public.lessons (
  id, course_id, order_num, title, objective, topics, created_at, devotional_mode, church_id
)
VALUES
(
  '9158db48-16c3-468f-8c86-153999294c8f', '7334230a-3021-43fb-83fc-e11b624cf10c', 1, 'Quem é Jesus?', 'Cristologia básica: Filho de Deus e Salvador', ARRAY['Bloco 1 — O Evangelho']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd269baf3-5996-4b2a-8778-e1a3c748cbfd', '7334230a-3021-43fb-83fc-e11b624cf10c', 2, 'O que é o Evangelho?', 'Pecado, graça, cruz e ressurreição', ARRAY['Bloco 1 — O Evangelho']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '503f7331-95b3-42e3-a66b-10830d50aa8e', '7334230a-3021-43fb-83fc-e11b624cf10c', 3, 'Posso ter certeza da salvação?', 'Justificação pela fé (ênfase luterana)', ARRAY['Bloco 1 — O Evangelho']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '67a5341d-a934-4387-a16c-1802e3e7b092', '7334230a-3021-43fb-83fc-e11b624cf10c', 4, 'Graça, fé e nova vida', 'O que muda quando creio', ARRAY['Bloco 1 — O Evangelho']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b91ed895-87ca-4876-a954-947f301d2bbb', '7334230a-3021-43fb-83fc-e11b624cf10c', 5, 'A Bíblia: Palavra viva de Deus', 'Como ler, entender e aplicar', ARRAY['Bloco 2 — Vida com Deus']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '599ee650-8e31-4f6b-96e5-e03e2575c5bb', '7334230a-3021-43fb-83fc-e11b624cf10c', 6, 'Como conversar com Deus?', 'Oração prática (Pai Nosso como modelo)', ARRAY['Bloco 2 — Vida com Deus']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b17a5890-6d54-4c6d-a4ca-4b5f023670b9', '7334230a-3021-43fb-83fc-e11b624cf10c', 7, 'Tentação e pecado: como vencer?', 'Batalhas internas e dependência da graça', ARRAY['Bloco 2 — Vida com Deus']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '468c87a8-5373-4b1c-9e43-9816481f4e26', '7334230a-3021-43fb-83fc-e11b624cf10c', 8, 'O que é a Igreja?', 'Corpo de Cristo e comunidade de fé', ARRAY['Bloco 3 — Pertencer']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c3eda274-c1f2-4adf-8b4f-b93d9033ebd3', '7334230a-3021-43fb-83fc-e11b624cf10c', 9, 'Batismo: identidade e promessa', 'Significado e segurança da aliança', ARRAY['Bloco 3 — Pertencer']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'df47e9a4-91e0-4678-aef9-d81dc1619177', '7334230a-3021-43fb-83fc-e11b624cf10c', 10, 'Ceia do Senhor: alimento espiritual', 'Presença real e fortalecimento da fé', ARRAY['Bloco 3 — Pertencer']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a5320de3-b9ef-4ad8-aa9a-f9c818fccddb', '7334230a-3021-43fb-83fc-e11b624cf10c', 11, 'Comunhão cristã na prática', 'Amizade, cuidado mútuo e perdão', ARRAY['Bloco 3 — Pertencer']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '53e3484c-7b8c-4efe-ba9c-c90f7796224f', '7334230a-3021-43fb-83fc-e11b624cf10c', 12, 'Nova vida e santidade prática', 'Vivendo diferente no mundo', ARRAY['Bloco 4 — Viver como Discípulo']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '72552eda-8237-402a-acc1-8aec49830c48', '7334230a-3021-43fb-83fc-e11b624cf10c', 13, 'Os 3 Ts: tempo, talento e tesouro', 'Mordomia cristã', ARRAY['Bloco 4 — Viver como Discípulo']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'aafeed77-5e14-4a50-8f72-0be595b9d5cd', '7334230a-3021-43fb-83fc-e11b624cf10c', 14, 'Compartilhando minha fé', 'Evangelismo simples e natural', ARRAY['Bloco 4 — Viver como Discípulo']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '725a9760-296a-4477-a84f-4603d2046fe6', '66ee05a0-c250-4dc6-9c4e-f08bd09e56cc', 1, 'Criados à imagem de Deus', 'Dignidade e propósito', ARRAY['Bloco 1 — Identidade']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'afb407be-cc20-47bf-8714-d8a4a19d83cc', '66ee05a0-c250-4dc6-9c4e-f08bd09e56cc', 2, 'A queda e a identidade quebrada', 'Pecado e distorção', ARRAY['Bloco 1 — Identidade']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', '66ee05a0-c250-4dc6-9c4e-f08bd09e56cc', 3, 'Nova identidade em Cristo', 'Filhos de Deus', ARRAY['Bloco 1 — Identidade']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a988a6eb-6505-45b4-93b4-eb01f7940877', '66ee05a0-c250-4dc6-9c4e-f08bd09e56cc', 4, 'Cultura atual e identidade', 'Cosmovisão cristã e desafios contemporâneos', ARRAY['Bloco 1 — Identidade']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f2e4513b-c426-4fc6-9aa5-ff282218a9ed', '66ee05a0-c250-4dc6-9c4e-f08bd09e56cc', 5, 'Quem é Deus? (Trindade)', 'Pai, Filho e Espírito', ARRAY['Bloco 2 — Conhecendo Deus']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3b8cebbd-a61b-417e-8ca5-f0906222ee88', '66ee05a0-c250-4dc6-9c4e-f08bd09e56cc', 6, 'Os 7 "Eu Sou" de Jesus', 'Autorrevelação de Cristo', ARRAY['Bloco 2 — Conhecendo Deus']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b3df72e8-52ef-473f-a328-38b5b8093cc8', '66ee05a0-c250-4dc6-9c4e-f08bd09e56cc', 7, 'O Espírito Santo na vida do crente', 'Santificação e direção', ARRAY['Bloco 2 — Conhecendo Deus']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '116934e8-11a0-4b6e-a978-16da25b046b4', '66ee05a0-c250-4dc6-9c4e-f08bd09e56cc', 8, 'Relacionamentos saudáveis', 'Amizades e limites', ARRAY['Bloco 3 — Vida Prática']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a329150d-4bb9-48c9-a177-35550f607583', '66ee05a0-c250-4dc6-9c4e-f08bd09e56cc', 9, 'Santidade no mundo digital', 'Internet, sexualidade e pureza', ARRAY['Bloco 3 — Vida Prática']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'faddbfea-4925-4a89-920b-7da2905c747f', '66ee05a0-c250-4dc6-9c4e-f08bd09e56cc', 10, 'Descobrindo meus dons', 'Chamado pessoal', ARRAY['Bloco 3 — Vida Prática']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c868695c-b915-43b1-9247-9c6160fa6cf3', '66ee05a0-c250-4dc6-9c4e-f08bd09e56cc', 11, 'Serviço cristão e vocação', 'Onde Deus me quer', ARRAY['Bloco 3 — Vida Prática']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'eef65267-d505-446b-a34e-10d473f484d0', '66ee05a0-c250-4dc6-9c4e-f08bd09e56cc', 12, 'Sofrimento, dúvidas e fé', 'Como lidar com crises', ARRAY['Bloco 4 — Perseverança e Esperança']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9ae625cf-c913-4bf8-a059-37dbe1633dd6', '66ee05a0-c250-4dc6-9c4e-f08bd09e56cc', 13, 'Como discernir a vontade de Deus', 'Sabedoria e direção', ARRAY['Bloco 4 — Perseverança e Esperança']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '896052c1-3040-46cb-8515-236c7e2ce316', '66ee05a0-c250-4dc6-9c4e-f08bd09e56cc', 14, 'A vida futura e a esperança cristã', 'Ressurreição e eternidade', ARRAY['Bloco 4 — Perseverança e Esperança']::text[], '2026-02-24 21:31:04.31334+00', '10_days', '02f08580-80e5-4f57-8a2e-1b078d337278'
)
ON CONFLICT DO NOTHING;

COMMIT;
