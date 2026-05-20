-- ARQUIVO: public_data_lesson_responses.sql

BEGIN;

INSERT INTO public.lesson_responses (
  id, user_id, lesson_id, question_key, response, created_at, updated_at, awarded_points, override_release_id, church_id
)
VALUES
(
  '401fadb8-7959-4877-831e-d5cb035e790d', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'icebreaker', 'Pessoa,viver,ser com vida', '2026-05-14 15:06:09.044314+00', '2026-05-14 15:27:16.520651+00', NULL, NULL, NULL
),
(
  '5d10cd02-dfdf-4046-9d8d-b3963a01f314', '8bf335ab-907e-497b-b08b-615ad716e722', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'prayer', 'Me perdoe por aquele pecado.', '2026-05-18 17:17:09.17044+00', '2026-05-18 17:44:08.232142+00', 0, NULL, NULL
),
(
  '8b6f079d-79e9-47c6-845c-f012d32b9840', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'icebreaker', 'Amorosa preocupada ansiosa ', '2026-05-02 01:24:18.801949+00', '2026-05-19 23:11:23.819283+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9bd4e584-8731-4ed0-8b10-26bf93e893ea', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'practice', 'Ter mais tempo de oração ', '2026-05-02 01:31:17.704366+00', '2026-05-19 23:11:23.819283+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '052d878e-14d1-4da4-b4fb-5151e52705aa', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'prayer', 'Senhor obrigado pela minha família e por tudo que o senhor tem nos dado ', '2026-05-02 01:31:48.541212+00', '2026-05-19 23:11:23.819283+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a48c1e83-bbfe-4a57-9bf2-d5921f0b443f', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q0', 'Na Bíblia é em Deus ', '2026-05-02 01:27:06.608937+00', '2026-05-19 23:11:23.819283+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '95a540ff-078c-42bb-a19c-e97e56b7c0fc', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q1', 'Sim tem muita coisa errada nas redes sociais ', '2026-05-02 01:27:43.916815+00', '2026-05-19 23:11:23.819283+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e7460edc-769b-4557-b5f1-ac7c0da8658f', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q3', 'Éla fica mais calma ', '2026-05-02 01:29:33.981168+00', '2026-05-19 23:11:23.819283+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '04adcda8-33cd-4627-b43a-2dadde6b12f4', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q4', 'Escutar as opiniões das pessoas certas e não das pessoas erradas ', '2026-05-02 01:30:21.747789+00', '2026-05-19 23:11:23.819283+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '163f21e3-7e78-4f25-96c1-0d4b8d27ba63', '985bc110-c90a-4762-8b1b-7b081e0c6863', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'icebreaker', 'Professora, cristã, esposa', '2026-05-14 23:50:20.717456+00', '2026-05-14 23:57:31.982937+00', NULL, NULL, NULL
),
(
  '937a700d-8ea3-4075-b32a-8e642ca5ac6f', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'Em público mas não tanto', '2026-04-12 16:34:22.931208+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd45da0df-976f-4856-9927-71f2652b36ed', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Alegria, dedicação, engraçada ', '2026-03-30 14:50:43.27438+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5699f06b-a8d5-494d-b2a9-0084a0f5ad2f', '32a9f112-1192-4b2a-918f-c2895a76ade3', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Me sinto muito feliz', '2026-04-02 22:43:36.309462+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bc374c1a-f63c-41ba-9cc3-a0cdf51c6695', '8bf335ab-907e-497b-b08b-615ad716e722', '67a5341d-a934-4387-a16c-1802e3e7b092', 'icebreaker', 'Estaria com Deus dês de o início ', '2026-05-18 17:28:46.572555+00', '2026-05-18 17:28:49.910352+00', NULL, NULL, NULL
),
(
  '13d6e772-a6ce-4b6c-96ab-55e5ab79e4e0', '985bc110-c90a-4762-8b1b-7b081e0c6863', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q0', 'Nas drogas, na moda, nos bens materiais, na aparência ', '2026-05-14 23:52:53.832801+00', '2026-05-14 23:57:31.982937+00', NULL, NULL, NULL
),
(
  '1085ab92-89c8-4422-b0b6-98cc52fc93f8', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'icebreaker', 'Esperta, bonita e educada', '2026-05-11 21:10:52.550463+00', '2026-05-15 01:38:59.941264+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '612dff02-c5fe-4029-8560-a452684abc4d', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q0', 'Redes sociais ', '2026-05-11 21:11:59.559444+00', '2026-05-15 01:38:59.941264+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd652ffb4-307b-4ee2-981a-5a45c2945a84', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Alegre, forte e inteligente.', '2026-03-30 14:41:02.231341+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '53e69e7a-fa89-4d26-b68e-a1b2901249a2', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Eu me defino em personalidade, pelas coisas que eu faço, pelo meu respeito com as pessoas e a empatia com elas.', '2026-03-30 14:43:00.737403+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1cd24cb2-5ae7-4de6-b1b5-4d148dc9c387', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Alegria,grata e responsável ', '2026-03-30 15:18:14.680514+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4f3499cc-1fcb-4fb6-9234-f05930ca6bab', '8bf335ab-907e-497b-b08b-615ad716e722', '67a5341d-a934-4387-a16c-1802e3e7b092', 'q0', NULL, '2026-05-18 17:29:14.807121+00', '2026-05-18 17:29:14.807121+00', NULL, NULL, NULL
),
(
  '0bc7c8ba-8632-4fe0-8fd4-aafe13989e6b', '985bc110-c90a-4762-8b1b-7b081e0c6863', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q1', 'Atrapalham. Muitos vivem de aparência, e julgam os outros pelo que veem.', '2026-05-14 23:53:21.294617+00', '2026-05-14 23:57:31.982937+00', NULL, NULL, NULL
),
(
  '2c8216e9-9501-4a5c-822b-d293f963a4ea', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q2', 'Que meu valor não depende no que eu faço', '2026-05-13 21:47:51.824262+00', '2026-05-15 01:38:59.941264+00', NULL, NULL, NULL
),
(
  '57ed5785-c85a-4e4b-b189-54f0242451c4', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q0', 'Se comparando', '2026-05-14 15:06:47.508502+00', '2026-05-14 15:27:16.520651+00', NULL, NULL, NULL
),
(
  '9588b746-e4d3-4e4c-a899-1ba466269389', '9a0c5687-f135-4377-a410-58592ef8737a', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'icebreaker', 'Futebol, interior,família 
', '2026-03-24 01:04:55.590782+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8f9bd83e-c425-4de1-9f14-9c3a51a3c726', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q2', 'Só pensa em si mesmo ', '2026-04-22 02:07:17.972679+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f3159f6d-28a7-4bb0-aaca-d03544db0789', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'prayer', 'Senhor Deus, abençoe sempre aqueles que não tem a noção que o senhor existe e pode salvar,que eles sejam muito fogosos por ti,que era eu possa cada dia aprender sobre ti,amo-te,em nome de JESUS eu oro, amém ', '2026-05-11 20:56:11.072919+00', '2026-05-18 21:23:08.84368+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'af323908-1c3a-4909-8977-81f478730c79', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Teimosa preocupada ansiosa', '2026-04-02 22:26:14.046406+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '50312c58-7753-4208-8003-1d8a2b6749ac', '985bc110-c90a-4762-8b1b-7b081e0c6863', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q2', 'De que somos amados a ponto de sermos filhos de Deus', '2026-05-14 23:54:24.64232+00', '2026-05-14 23:57:31.982937+00', NULL, NULL, NULL
),
(
  '7a132504-9649-4200-ab3a-23ac8429c4e1', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q3', 'Vive com segurança sem medo de rejeição ', '2026-05-13 21:48:18.456935+00', '2026-05-15 01:38:59.941264+00', NULL, NULL, NULL
),
(
  'f2f5f34e-b367-4340-b567-90013b29c55c', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q1', 'Atrapalham ', '2026-05-14 15:06:53.552561+00', '2026-05-14 15:27:16.520651+00', NULL, NULL, NULL
),
(
  '192ed5d0-692c-4df2-8d7c-cd31ccc033b6', 'a608622c-4120-4d15-949f-235ca64db2cf', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Kpop,alegria e animais,rock

', '2026-03-21 12:18:10.958767+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c3b63668-5d4a-4c79-b7fd-296ee22faf54', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Personalidade ', '2026-03-30 14:55:27.212524+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'dc210180-29b5-4ff6-b2e0-ba0d469a173e', '985bc110-c90a-4762-8b1b-7b081e0c6863', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q3', 'Ela vive em paz, sem a necessidade de buscar seus valores em coisas passageiras
', '2026-05-14 23:55:21.08683+00', '2026-05-14 23:57:31.982937+00', NULL, NULL, NULL
),
(
  '2c9b3550-81ef-48e4-b748-1f63d569f743', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q4', 'Orar e ler a bíblia antes de ver as redes sociais ', '2026-05-13 21:48:39.557664+00', '2026-05-15 01:38:59.941264+00', NULL, NULL, NULL
),
(
  '803e5e09-f636-435c-be47-83d6a5c2a2b3', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q2', 'Viver por ele', '2026-05-14 15:07:02.855245+00', '2026-05-14 15:27:16.520651+00', NULL, NULL, NULL
),
(
  'a8ad16ab-d531-4570-94d6-6ab882135358', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'icebreaker', 'Preconceito', '2026-04-22 19:26:50.156423+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0716350a-3ec9-4d88-aeed-6152f8881345', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Estudiosa, tímida e amizade ', '2026-03-31 15:12:18.010625+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cf0b1e1f-162c-4d53-b8c3-8d822b43c109', '985bc110-c90a-4762-8b1b-7b081e0c6863', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q4', 'Focar no Senhor é não me importar com o que os outros pensam', '2026-05-14 23:55:54.439083+00', '2026-05-14 23:57:31.982937+00', NULL, NULL, NULL
),
(
  '98522e4b-d227-43bc-a24a-2af9d4b2c965', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'prayer', 'Senhor Deus obrigada que quando estou com você não consigo me comparar com ninguém. Amém.', '2026-05-13 21:50:56.676728+00', '2026-05-15 01:38:59.941264+00', NULL, NULL, NULL
),
(
  '69d975a8-8945-4f8f-a603-994d3f8db45e', '9289d1ce-a632-4cd7-930e-73023e549ec5', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'prayer', 'Senhor Deus,obrigado por nos amar e mandar Jesus para trazer a fé novamente,e nos dar uma identidade sem precisar buscar por outras coisas', '2026-05-12 19:29:53.939447+00', '2026-05-13 22:07:56.945718+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2b7d83d7-8066-4b23-8ee0-c65d65392a38', '9289d1ce-a632-4cd7-930e-73023e549ec5', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q0', 'Em notas,popularidade, aparência,status social', '2026-05-12 19:32:45.786432+00', '2026-05-13 22:07:56.945718+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a3147d37-d30f-44d0-8146-eb38dfc12741', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q3', 'Conqistas', '2026-05-14 15:07:15.957795+00', '2026-05-14 15:27:16.520651+00', NULL, NULL, NULL
),
(
  'da689ed9-fab8-499e-a63d-9d85abfa29e7', '9289d1ce-a632-4cd7-930e-73023e549ec5', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q2', 'Alguém que acha que é sempre o certo,e todos devem ama-lo e suas escolhas e desejos', '2026-04-20 20:00:49.645912+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '68730579-976c-49fe-b8be-747ecd304045', '2f773751-38c2-45a1-8ee0-f5b856092730', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Alegre , Grato e Determinado', '2026-03-13 21:27:31.431073+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cfa93a6d-d22a-4e7b-9d7a-075c78a9dee2', '985bc110-c90a-4762-8b1b-7b081e0c6863', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'practice', 'Focar meus pensamentos no Senhor', '2026-05-14 23:56:28.924414+00', '2026-05-14 23:57:31.982937+00', NULL, NULL, NULL
),
(
  '00e9ecfe-fe59-467a-9984-776ba735693b', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q4', 'N se compara', '2026-05-14 15:07:35.110257+00', '2026-05-14 15:27:16.520651+00', NULL, NULL, NULL
),
(
  '8046ab77-54fc-4858-998e-a3c72a1a854e', '9289d1ce-a632-4cd7-930e-73023e549ec5', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q1', 'Na maioria atrapalha porque as pessoas podem ver outras julgando você,ou mostrando onde vão e podem sentir inveja ou coisa do tipo', '2026-05-13 21:52:14.205352+00', '2026-05-13 22:07:56.945718+00', NULL, NULL, NULL
),
(
  '4e887a5a-5522-4c19-8ad2-737dfebd10d7', 'a608622c-4120-4d15-949f-235ca64db2cf', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'Cm fé, e Deus no comando ', '2026-03-21 12:29:45.597696+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7bd71356-4db8-462b-b0e9-10ff305ac9e9', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q3', 'Ela vive no caminho certo ', '2026-05-11 20:54:52.941912+00', '2026-05-18 21:23:08.84368+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e64469ac-a420-4da6-822e-e2a818dfd3e2', '985bc110-c90a-4762-8b1b-7b081e0c6863', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'prayer', '.', '2026-05-14 23:57:18.207188+00', '2026-05-14 23:57:31.982937+00', NULL, NULL, NULL
),
(
  '6db470ea-f30f-4718-a690-b2fd0b290261', 'a608622c-4120-4d15-949f-235ca64db2cf', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', 'Deus abençoe a todos ao meu redor ', '2026-03-21 12:30:01.734343+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a79b6da3-f919-4cb0-b05e-46c0d95c7e09', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'practice', 'Orar', '2026-05-14 15:07:50.130932+00', '2026-05-14 15:27:16.520651+00', NULL, NULL, NULL
),
(
  '598d0e6b-2165-4406-b36d-4c7d4a564dab', '9289d1ce-a632-4cd7-930e-73023e549ec5', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q2', 'De que nossa principal indentidade é ser a criação de Deus,e que precisamos amar ele', '2026-05-13 21:52:53.54223+00', '2026-05-13 22:07:56.945718+00', NULL, NULL, NULL
),
(
  '10134fb8-f85b-4755-9323-da98e7d7e1ce', '8745732c-55e9-488b-b638-960a6d9ea340', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'icebreaker', 'Preguiçosa, alta e queria ', '2026-04-18 14:35:22.910454+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a80cbc76-3877-475c-ae0f-b525120b999c', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q0', 'O pecado se tornando normal', '2026-04-20 12:11:03.722509+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b0442d37-0bdf-4452-b2a5-dab9580acb5f', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', 'Senhor Deus abrigado por me ensinar a tua palavra e que me continue a me ensinar Deus amém', '2026-04-02 00:08:30.219158+00', '2026-05-16 17:28:58.715396+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c5dd6719-ad4e-4e8b-a4f3-3c9a9f98e953', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Ter mais paciência ', '2026-03-31 00:16:57.042124+00', '2026-05-16 17:28:58.715396+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '928a3be4-f653-4f14-8e52-bbe50c81afb6', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'prayer', 'Pai nosso q estais no céu santificado seja o vosso nome seja feita nossa vontade assim na terá como no céu perdoar dos nossos pecados assim como podíamos qm nos tem ofendido ', '2026-05-14 15:08:07.934231+00', '2026-05-14 15:27:16.520651+00', NULL, NULL, NULL
),
(
  'f7d1c0e4-fa81-455a-ba44-2900694dec98', '9289d1ce-a632-4cd7-930e-73023e549ec5', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q3', 'Ela vive mais calma,sem sentir a pressão da sociedade pra criar sua própria indentidade', '2026-05-13 21:53:36.246935+00', '2026-05-13 22:07:56.945718+00', NULL, NULL, NULL
),
(
  '399f8154-1b0d-4f66-bf4d-cb88e55f6ae2', '2f773751-38c2-45a1-8ee0-f5b856092730', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'Aceitar que Deus me ama. ', '2026-03-14 17:27:21.359521+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '38386a24-a40e-4871-9467-54f7a026d184', '2f773751-38c2-45a1-8ee0-f5b856092730', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', 'Senhor, obrigado por me criar à Tua imagem. Me ajuda a viver isso no dia a dia.', '2026-03-14 17:27:38.922543+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '118009bf-e7f0-4c09-9cc0-c165e18e0af2', '9289d1ce-a632-4cd7-930e-73023e549ec5', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q4', 'Não me sentir pressionado ou inseguro pra provar meu valor pros outros', '2026-05-13 21:54:21.369518+00', '2026-05-13 22:07:56.945718+00', NULL, NULL, NULL
),
(
  'ea82bb5a-50dc-4e7b-8ff9-8b9b020d7626', '8bf335ab-907e-497b-b08b-615ad716e722', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'icebreaker', 'Humano , abençoado e amigo', '2026-05-18 17:12:27.319762+00', '2026-05-18 17:44:08.232142+00', 0, NULL, NULL
),
(
  '5d88a475-b7c7-41d3-a129-3b02203187de', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q0', 'Brigas', '2026-04-20 23:45:52.317649+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5b5a4eca-718c-4fb0-8d3c-20aacf9715ac', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Através do exemplo de Deus amar o próximo como ati mesmo ', '2026-04-03 20:56:13.75338+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5a2dd287-db70-4cac-a6c3-46d573765dd8', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'practice', 'Vou escrever 3 verdades no caderno, sou filha de Deus, sou perdoada, sou amada, e sempre quando levanto vou ler uma destas verdades antes de pegar o celular.', '2026-05-13 23:10:54.024375+00', '2026-05-15 01:38:59.941264+00', NULL, NULL, NULL
),
(
  '4e9b504a-f59b-42ed-829f-e23dfccf104a', '8bf335ab-907e-497b-b08b-615ad716e722', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q0', 'Em outras pessoas ou até em conquistas passageiras ', '2026-05-18 17:13:13.016939+00', '2026-05-18 17:44:08.232142+00', 0, NULL, NULL
),
(
  'c396fd56-6a2b-49e3-9171-54fcc75a502a', '1526dc8b-a92a-4a44-b358-b6a3083d0143', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q1', 'Porque ela mexe com a confiança entre o ser humano e Deus ', '2026-04-21 13:22:02.46557+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '26e135f3-41fb-4a4c-82ef-c0e93f4cb90b', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'icebreaker', 'A falta de empatia', '2026-04-11 14:28:31.644926+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '77642e52-2fb1-483e-b1cc-7dbef33640ac', '2f773751-38c2-45a1-8ee0-f5b856092730', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Geralmente olho se sou inteligente. ', '2026-03-14 17:27:45.126297+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e21bbf4b-de3e-490b-ae29-24a289b795f8', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Tímida, detalhista e autêntica ', '2026-03-30 15:26:59.123974+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '619b3015-bda5-4a1e-9d68-ea64d886f76a', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', 'Senhor me ajude a saber quem ajudar e me ajude a enxergar mais qualidades em outras pessoas ao envés de julgar', '2026-04-03 12:54:14.50356+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4d8caa2f-f814-433e-b273-83e61ae0bb90', '8bf335ab-907e-497b-b08b-615ad716e722', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q1', 'Os 2, porque nas redes a gente pode ter  vídeos que nós aproximam de Deus e falam a verdade mas também podem ter vídeos que falam que nós que construimos nossa indentidade ', '2026-05-18 17:13:46.017749+00', '2026-05-18 17:44:08.232142+00', 0, NULL, NULL
),
(
  '437fc382-b569-49a1-8a38-dd4cf29cf927', '8745732c-55e9-488b-b638-960a6d9ea340', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Que todos são a imagem de Deus então nao posso ser mal educada nao chamar ninguém de nada ofensivo ', '2026-04-03 18:38:15.957401+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6d3aa4f1-fc97-4d40-a62e-2890f9fab1e2', '914b898d-24a3-46ad-a764-d2f24e5115d1', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'prayer', 'Deus  obrigada pela semana que seja abençoada,pela minha família ', '2026-05-11 23:26:14.668768+00', '2026-05-19 23:35:48.583645+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c8c4b487-5904-4d84-a7f5-09e1169ae8d1', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', '“Deus, obrigado porque eu sei que fui criado por Ti e tenho valor.
Me ajuda a lembrar disso quando eu me sentir mal comigo mesmo.
Quero aprender a me ver como Tu me enxerga senhor , e tratar melhor as pessoas.
Me ensina a viver do jeito que Te agrada.
Amém.”', '2026-04-10 19:42:13.164356+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '023c4f44-67e8-4c1d-a31b-800a100854bc', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Personalidade ', '2026-03-30 15:29:43.25733+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9cb609f4-25c6-44e5-9d7e-e96b067bee55', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Família, humilde, atencioso', '2026-03-30 13:26:28.149158+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '289074fa-c29f-4402-b027-f27eebb17e57', '985bc110-c90a-4762-8b1b-7b081e0c6863', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Professora, cristã, aprendiz', '2026-03-20 01:08:15.808382+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '562f3037-dcf6-4d75-a8b8-cbc56fc48a25', '9a0c5687-f135-4377-a410-58592ef8737a', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'practice', 'Ler a bíblia ', '2026-03-24 01:19:21.134121+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '21046b2a-420c-496f-8f33-25193ab8a444', '985bc110-c90a-4762-8b1b-7b081e0c6863', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'Ter mais paciência', '2026-03-20 01:08:15.808382+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3d7ef4de-e659-4020-be3c-723551d0fc64', '985bc110-c90a-4762-8b1b-7b081e0c6863', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', '.', '2026-03-20 01:08:15.808382+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9580a3ae-2fa2-4887-a0ff-10e59afadba9', '985bc110-c90a-4762-8b1b-7b081e0c6863', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Profissão', '2026-03-20 01:08:15.808382+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '024d8440-73cd-4cc9-8686-c78fa357a659', '985bc110-c90a-4762-8b1b-7b081e0c6863', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Que Deus tem um grande amor por mim', '2026-03-20 01:08:15.808382+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a5fd0dc7-ec9a-4c68-b35f-f9d2c6186e05', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Personalidade ', '2026-03-30 13:36:08.190205+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '62979e17-a083-4914-9c2f-ac1ee9f4aef1', '9a0c5687-f135-4377-a410-58592ef8737a', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'prayer', 'Obrigado senhor porque o senhor me deu essa família, comida , casa.', '2026-03-24 01:22:16.430209+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6608a0c6-45eb-4a52-a305-a9d28d44cb33', '985bc110-c90a-4762-8b1b-7b081e0c6863', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Tenho valor', '2026-03-20 01:08:15.808382+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'abdf5c27-f1b4-4df0-9400-20e0b26b4109', '8bf335ab-907e-497b-b08b-615ad716e722', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q2', 'Que eu sou filho de quem criou tudo e todos ', '2026-05-18 17:14:41.530776+00', '2026-05-18 17:44:08.232142+00', 0, NULL, NULL
),
(
  '32ca652d-900c-4e52-9ab7-547c0eae48bc', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q4', 'Quando ouvir alguém falar que não é amado ', '2026-05-11 20:55:06.258794+00', '2026-05-18 21:23:08.84368+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5aa8df44-772c-4c78-a8d5-08d9472e07fa', '985bc110-c90a-4762-8b1b-7b081e0c6863', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'No trabalho', '2026-03-20 01:08:15.808382+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8ff95467-9f87-4025-98a1-07e407a72801', 'a608622c-4120-4d15-949f-235ca64db2cf', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Alegria,dança,história', '2026-03-21 12:25:52.330547+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'efa7b0e2-eb7f-463a-87d0-3f9a9cfed5f6', 'a608622c-4120-4d15-949f-235ca64db2cf', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Pra mim significa que eu sou importante e devo segui-lo', '2026-03-21 12:25:54.563021+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd808973e-ca9f-467e-bc05-68880b566160', 'a608622c-4120-4d15-949f-235ca64db2cf', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Me faz pensar mais sobre mim', '2026-03-21 12:27:47.514022+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd06cd3f4-9a52-4e49-b6e2-eea321c4fa12', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q3', 'Tem uma vida mais feliz e com um propósito a vida dela', '2026-04-03 17:03:58.144499+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '95a5d01e-2f39-4459-aab0-399cb89511fb', '4d062445-4744-4007-a2ac-d7c4743fc979', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q0', 'Os pecadores', '2026-04-20 21:58:02.293897+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'aff8ebc0-7875-4fd0-999f-744b35c2da4e', '4d062445-4744-4007-a2ac-d7c4743fc979', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q3', 'Pq elas pecao ', '2026-04-20 21:55:21.972339+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2e9e9174-de19-4919-acf6-367543365b3f', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q4', 'Orar, ler a bíblia e ir a igreja', '2026-04-03 17:04:40.824553+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2fabfca3-ab3d-45bb-a5d4-87467ea5506e', '9a0c5687-f135-4377-a410-58592ef8737a', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q2', 'Sim ', '2026-03-24 01:14:42.059302+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4751abdd-0fa8-4369-bd28-c6435dd9779b', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q1', 'Porque através disso a serpente (pessoas que nos levam para o mal caminho) tenta nos afastar de Deus, e as pessoas sem Deus se tornam pessoas indefesas', '2026-04-20 22:33:42.203103+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.lesson_responses (
  id, user_id, lesson_id, question_key, response, created_at, updated_at, awarded_points, override_release_id, church_id
)
VALUES
(
  'a567d961-b529-4ccd-9b49-74059922c04b', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'icebreaker', 'Comilão jogo futebol e Beach tennis ', '2026-04-15 23:42:49.972737+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '43c68345-3b07-4c17-9d89-52e02259ea9a', '8745732c-55e9-488b-b638-960a6d9ea340', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q0', 'No mundo como no trabalho, sucesso e aparência ', '2026-04-18 14:36:35.006457+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9d809864-d471-41b1-b4d0-25d83b077db0', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Responsável, Gentil, Educada', '2026-03-30 21:39:41.015926+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b543c244-407e-411e-9ddc-3f07c1065843', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Normal eu trato as pessoas como elas me tratam', '2026-04-12 16:34:39.453495+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '13efe586-3714-4173-b182-b7a674032a8d', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Cantar, vôlei,alegria e menina de Deus .', '2026-03-30 15:28:28.247407+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7d442277-32ed-4560-8268-98eda933b5a6', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Pessoa,feliz,mínimo
', '2026-03-30 18:00:45.020672+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ab8cc8c3-b189-47d2-983f-33c4ecce30fc', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Quando penso em mim eu normalmente me defino com uma pessoa apegada e amorosa ', '2026-03-30 23:01:41.740494+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'dd2b1f4f-4300-4218-a07d-0100442b4a2e', '32a9f112-1192-4b2a-918f-c2895a76ade3', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', 'Deus, obrigada por tudo, perdoe meus pecados eu me arrependo de todos, nos acompanhe está semana, em nome de Jesus, amém', '2026-04-02 22:46:28.744716+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e7f4ef5b-183a-4312-9374-b73c0f83a5c5', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q1', 'Por ser contra algo ', '2026-04-20 12:12:25.399762+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'aba5f1b8-1dc5-4920-8d65-55651c911a16', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Ansiosa curiosa ', '2026-04-02 22:36:09.819265+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8ef02d76-8e13-453b-a6e6-c30413b3167b', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'A cada dia quando me sentir sozinha,vou escrever.', '2026-03-30 15:33:59.052044+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f6930bd5-e312-446c-ad7d-15f9e26f41ad', '66b31cf2-7782-4253-98ea-3b6d631703a4', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q1', 'Sim. Pq assim as pessoas se comparam com famosos pessoas ou opiniões dos outros ', '2026-04-06 22:16:05.753735+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2890b916-d2ad-4b79-b108-f66907e0b629', '914b898d-24a3-46ad-a764-d2f24e5115d1', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Amiga,gentil e generosa', '2026-03-30 23:12:00.68756+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3907a637-e403-4a78-b8fe-8d898669ed66', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Me sinto feliz', '2026-03-30 13:36:48.523583+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '09b5e7c4-bc88-4230-b751-360affd7db7f', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Dedicada , amorosa e carinhosa ', '2026-03-30 22:49:44.764557+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fa8ad8af-af6c-4156-af4e-9b7181d7fde8', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Que com Deus tenho tudo', '2026-03-30 13:37:24.549088+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '296fbb6e-df8d-44fa-bca1-15d848fa7dd6', '9289d1ce-a632-4cd7-930e-73023e549ec5', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q3', 'Pois o mundo evolui e os padrões da sociedade mudam', '2026-04-20 20:01:27.401427+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '27821226-8d53-4554-a9dc-852f74dfe905', '914b898d-24a3-46ad-a764-d2f24e5115d1', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Alegre,ansiosa e as vezes teimosa
Adora musica', '2026-03-30 23:23:08.949066+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd6d19cca-cdf5-4c51-a501-3271e72ee763', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'Sim,qero ser mais pratica', '2026-03-30 18:06:23.77907+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '285a4604-0e74-4776-9a14-52c71219cc14', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', 'Pai nosso q estais no céu santificado seja vosso nome seja feita nossa vontade assim na terá como no céu nos perdoai dos nossos pecados assim como podíamos a qem nos tem ofendido não nos deixar cair em tentações o pão de cada dia nós dei hoje nós livrai do mal para todo sempre com poder e glória amém ', '2026-03-30 18:11:17.635942+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cd3783d6-2234-493d-89cc-b5364174ab76', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'Quando estou em dificuldade ', '2026-04-03 20:57:38.702029+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd1a3a6fb-d1f5-44e7-841e-482933026641', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', 'Deus te agradeço por ter me feito à sua imagem por me mostrar que tenho um grande valor ', '2026-03-30 23:17:50.138436+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd2f5cdb9-a206-4885-b0b8-b3cec82ebe95', '32a9f112-1192-4b2a-918f-c2895a76ade3', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Muda pois significa que fui criada com amor e sou importante para Deus', '2026-04-02 22:43:44.432969+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2e91c29c-c39b-4ef2-8280-caebff9ff36c', '4d062445-4744-4007-a2ac-d7c4743fc979', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'icebreaker', 'A fome

', '2026-04-20 21:58:29.651347+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '34b0689d-23d0-4bf5-8d1a-12a6d3d2387a', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Forte , alegre, amigável ', '2026-03-30 22:54:26.791493+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1836ac66-337a-4b1e-ae13-00013ebe08cd', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Aparência ', '2026-03-31 00:13:21.395694+00', '2026-05-16 17:28:58.715396+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '341897dd-34a9-4306-97c8-ebd534d6c74f', '4d062445-4744-4007-a2ac-d7c4743fc979', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'prayer', 'Senhor obrigado pelo dia de hoje obrigado também pelo mais um dia de vida amém 
', '2026-04-20 21:58:47.636683+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1eef11d3-eac0-40e8-ba8f-ba7ac5f6e04a', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'Cuidar como trato os outros ', '2026-03-30 23:17:04.968657+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ccc8c00d-907b-40cd-8250-0becdc54ed70', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Que sou uma pessoa alegre , quem muitas dúvidas e que adora fazer muitas amizades ', '2026-03-30 23:12:08.102987+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '871199cd-2f1f-4d51-b597-37ed24f48a41', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Significa que eu tenho um valor muito grande que Deus me acha especial do jeito que sou ', '2026-03-30 23:12:57.119606+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2660e9bd-887f-4915-96e1-697ef1547a0e', '8bf335ab-907e-497b-b08b-615ad716e722', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q3', 'Ela vive mais alegre e feliz.', '2026-05-18 17:15:03.86597+00', '2026-05-18 17:44:08.232142+00', 0, NULL, NULL
),
(
  '52926dec-298d-4b52-853e-bbd2f762291a', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'icebreaker', 'Verdadeiro, alto e confiante', '2026-04-03 16:51:01.903329+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0b4dc20a-967e-4c88-8503-eaafd4cb3cd8', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Que quem realmente me valoriza é Deus ', '2026-03-30 23:13:38.459595+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '80167dec-815d-4af6-89bd-abc656d70437', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'Quando faço uma prova ou algo que vale nota ou que mostra os meus talentos ', '2026-03-30 23:14:25.034929+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '36be3f47-16ce-4cdf-ae72-dee96cdbcc43', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', NULL, '2026-03-30 22:57:30.609074+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a8bbf861-18c7-4546-9bb4-1c2794c0ef4c', '66b31cf2-7782-4253-98ea-3b6d631703a4', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q3', 'Ela terá mais confiança orgulho de si mesma…', '2026-04-06 22:17:02.968207+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '626c938c-7a7e-4c7c-b453-29659e1e9557', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'icebreaker', 'Humildade amor medo', '2026-05-12 14:00:18.948638+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e113a61e-f1e4-4b15-bf2e-ccc8c4a950f7', '8745732c-55e9-488b-b638-960a6d9ea340', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'Eu sou a imagem de Deus, então tenho que ter uma alta estima. Eu sou a imagem de Deus, então fui muito amada por ele. Eu sou a imagem de Deus, então tenho que tratar ou outros com respeito.', '2026-04-03 18:47:28.19068+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7a9e3dab-4262-46b9-9324-73fab3a1ee97', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'No meu dia a dia', '2026-03-30 13:38:12.722354+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '65743d5b-07af-42fa-8299-8137074b8585', '4d062445-4744-4007-a2ac-d7c4743fc979', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q2', 'Que ele vive fazendo coisas erradas', '2026-04-20 21:55:50.707076+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5561d615-2e16-42df-ad8b-19450ef64add', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'Nesta semana todos os dias que acordar falarei "eu sou a imagem de Deus " completando com o que espero ', '2026-03-30 23:06:34.44751+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f45fbcd7-bbf3-4d5d-962c-8fec4ab959ed', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', 'Deus muito obrigada por mais um dia de vida , obrigada por pensar em cada detalhe meu , que nesta semana posso sempre me lembrar que o senhor foi quem me criou e me de sabedoria para viver essa identidade no dia a dia amém ', '2026-03-30 23:08:11.499462+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5d089795-1bba-46a5-b1a2-76fc3eff44e4', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Tendo compaixão com o próximo ', '2026-03-30 13:38:40.527931+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd372f45c-9de0-4271-9dd9-4af85e4b60f6', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Isso me faz entender que meu valor não depende do que os outros pensam ou do que eu faço, mas de quem me criou. ', '2026-04-10 19:27:46.472436+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '68c46385-0fcb-4e12-9c43-7edf32ebf70b', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', 'Deus obrigado por essa vida essa comida e essa opção de estar aqui com  a minha família ', '2026-04-12 16:36:44.85954+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7e0cd2e2-15d0-4e47-ad22-da6992a4c449', '4d062445-4744-4007-a2ac-d7c4743fc979', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q1', 'Pq ele sabe de tudo', '2026-04-20 21:56:27.932773+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1bd8b5dc-f855-44c8-841e-c58163786926', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Sinto feliz e valorizada', '2026-04-02 22:36:36.237627+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4f7b4611-9847-4875-8b0d-ef28ce23289b', '2f773751-38c2-45a1-8ee0-f5b856092730', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Sei que sou importante pra Deus e isso me dá valor. ', '2026-03-14 17:27:57.792091+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '52b90db6-17dc-4f98-8c7a-97fc47c65bf7', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'icebreaker', 'Humildade,caráter, bondade ', '2026-03-31 00:37:02.206009+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '65d5f5aa-e165-4223-9ce1-cacfedd170bf', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Legal,bom,obediente
', '2026-03-30 23:39:08.72261+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '72ea855e-50a7-4d35-affc-90be4493b92c', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'Fiel a Deus ', '2026-03-31 00:03:59.385695+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '291e06da-2047-4cb0-ac8f-f8605f5b399d', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', 'Muito obrigado Deus por me criar e quero te pedir que me ajude a cada vez conhecer mais da tua palavra', '2026-03-31 00:06:45.310709+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0c39d404-f806-4afe-bfa2-c738b2065006', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Amigo legal carinhoso ', '2026-03-31 00:07:40.049433+00', '2026-05-16 17:28:58.715396+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9247e8e5-000b-48b2-8b31-394848f50789', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Ser grato ', '2026-03-31 00:15:11.077046+00', '2026-05-16 17:28:58.715396+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cbfb4014-a769-49dd-95cf-56fcd8fb25b3', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Eu não sou acidente ', '2026-03-31 00:15:23.997529+00', '2026-05-16 17:28:58.715396+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '53cf8b03-986a-495e-8b4e-ee375e62a947', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Personalidade,talentos', '2026-03-30 23:40:26.950075+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a3857598-b4b6-4c6b-862d-256377d2ccce', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Que devo adorar a Deus ', '2026-03-30 23:59:28.888253+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6934308e-1440-4e40-a3b9-9b6b6b3d1c85', '2f773751-38c2-45a1-8ee0-f5b856092730', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'Quando as pessoas me críticam. ', '2026-03-14 17:28:05.734077+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b0833e9a-51a6-453d-ae19-e35e28de7872', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Parar de levar as coisas na brincadeira e prestar mais atenção no que eu falo , penso e faço ', '2026-03-30 23:16:16.033914+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '95a7e84a-814a-40a3-ae5e-ff036dfae897', '8bf335ab-907e-497b-b08b-615ad716e722', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q4', 'Não ligar pra opinião das pessoas sobre mim', '2026-05-18 17:15:21.710532+00', '2026-05-18 17:44:08.232142+00', 0, NULL, NULL
),
(
  '0e8f0b95-2236-4fbe-801f-2107e6944b96', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'practice', 'Vou fazer', '2026-05-11 20:55:48.743956+00', '2026-05-18 21:23:08.84368+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5f3ddfc5-8a22-4b8e-b31d-a7f1cb4b334d', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q0', 'O individualismo', '2026-04-11 14:31:42.500394+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c4c52be1-5053-46cb-a225-ef404404b18c', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Ter mais carinho e ter paciência para o próximo ', '2026-04-03 20:58:14.898074+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1e5bf18d-848d-4d05-b11f-3e1e01aab70c', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Eu se enxergo mais importante mais confiante ', '2026-03-31 00:26:23.486829+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7a9cb109-519b-4b64-87ca-5c023bb63641', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q0', 'Umas pela igreja e outras pela opinião dos outros', '2026-04-03 16:53:34.63338+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b2916491-09b9-4aa9-a87b-0250ef8802f3', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q1', 'Depende do conteúdo, mas geralmente atrapalham por causa de conteúdos inadequados a fé cristã ', '2026-04-03 16:54:35.369995+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7ddcca39-30e3-4fa0-9f55-e75ab85e2d46', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q1', 'Nenhum dos dois cada um tem o seu jeito de se definir', '2026-04-15 23:46:53.585964+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8095c8d1-1459-41d1-9e0e-7a80df036af8', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Filho de Deus', '2026-03-31 00:15:20.696983+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '22e93392-121a-4580-bc43-e0e1ee04fd3b', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'Praticar a leitura da Bíblia.', '2026-03-31 00:10:33.944743+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2b51b38d-e732-4f5e-95ee-65f249d29ef2', '66b31cf2-7782-4253-98ea-3b6d631703a4', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q2', 'Que nós não precisamos construir uma identidade  mas sim Deus nos dá uma identidade nova ', '2026-04-06 22:16:39.985991+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8a69136f-a694-4658-a700-48dadb7a4bda', '8745732c-55e9-488b-b638-960a6d9ea340', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q1', 'Prejudicam por que elas nao são algo real e nem fundamental ', '2026-04-18 14:37:08.859649+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fac98cba-4353-4585-a6fa-a097e1bb25a9', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Porquê eu me sinto importante', '2026-03-31 00:00:09.302939+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c5c333f9-b08a-43d5-adc7-c5864c759042', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Confiante, sério e inteligente ', '2026-04-08 03:10:01.897591+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'af82fe40-9334-4681-8e2f-ccafb967479b', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', 'Obrigada Deus por um dia cheio de bençãos e novas oportunidades que o senhor no guie e nos ilumine sempre. Amém.', '2026-03-31 00:17:56.951836+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'eced3c22-5211-43da-9ebd-0090768915bf', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Muda quando eu vejo que tudo oque Deus criou não é acidente,é intencionalmente feita,é maravilhoso.', '2026-03-30 15:31:30.945227+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '456af780-d9da-407a-8717-045aece30b2a', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q0', 'Se comparando com as outras pessoas', '2026-05-12 14:03:46.611351+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b1654db1-7d9d-4852-a49c-d9d59f08166f', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Alegria, amor e sentimentos ', '2026-03-31 00:29:50.570342+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2a9b6f9c-606e-454c-b2b7-a914446a32a9', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'Quando me perguntam sobre os meus sentimentos', '2026-03-31 00:01:12.468495+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3c69200f-248b-4291-8664-0836aa574023', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Como tratar os meus amigos ', '2026-03-31 00:02:54.597014+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c9cfb361-4ca7-470a-b8ea-c32be5be1651', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q2', 'Ficar pensando que,ele mesmo consegue sozinho,que ele sempre está sozinho e consegue mesmo assim,e ficar sempre nos mesmos pecados', '2026-04-20 12:17:53.051436+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '438e79a0-8264-4996-a85b-68c8fd87cebb', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Isso me ajuda a lembrar que meu valor não depende do que os outros pensam, mas do que Deus diz sobre mim', '2026-03-30 23:03:38.003568+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7f4d035f-6d8c-4348-b421-6db11b574f4a', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'Planejo me sentir mais templo do Espírito Santo ', '2026-03-31 00:36:44.435104+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1d0f3557-3a5e-4ecf-b1c0-14ad1c7b6597', '914b898d-24a3-46ad-a764-d2f24e5115d1', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'Valorizar mais minhas amizades', '2026-03-30 23:27:15.329847+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c0cb680c-4b41-4544-9324-722cb4793eb0', '914b898d-24a3-46ad-a764-d2f24e5115d1', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', 'Jesus, obrigada pelo dia de hj, proteja sempre minha família...', '2026-03-30 23:27:58.861432+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'be92dd46-8841-4fbf-967c-8269eb7cb926', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Personalidade alegre mas tímida, aparência baixa,bonita etc...,talento é o vôlei,erros ser MUITO preguiçosa,sentimentos carinhosa.', '2026-03-30 23:50:45.152283+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '315d8271-0ee9-400f-ae9d-d4d8678954d1', '8745732c-55e9-488b-b638-960a6d9ea340', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Alta, preguiçosa, determinada ', '2026-04-03 18:19:40.930199+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '23256b3b-9eba-4841-bf04-c91ec9e4b640', '8745732c-55e9-488b-b638-960a6d9ea340', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', 'Deus obrigado por tudo eu agradeço por ter me amado tanto tempo me fez a tua imagem e semelhança Amém. ', '2026-04-03 18:50:11.521399+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4f3c29ee-2c0c-4e5a-b993-a5073db59ed7', '8bf335ab-907e-497b-b08b-615ad716e722', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'practice', 'A felicidade de estar com Deus ', '2026-05-18 17:15:54.579352+00', '2026-05-18 17:44:08.232142+00', 0, NULL, NULL
),
(
  '241aa9fb-bd62-43ea-b9a1-385e0319698a', '914b898d-24a3-46ad-a764-d2f24e5115d1', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Por ser especial posso demonstrar quem sou mais facil', '2026-03-30 23:25:03.986958+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd872e79d-3504-42b7-bf07-2170b3863bdb', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Bom, pois Deus é bom é pretendo ser "igual" diríamos ', '2026-03-30 23:55:01.023637+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6e45645a-572f-4400-8113-fd569dc4888c', 'b486e185-6cb3-477c-936b-b204b143e329', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q0', 'No trabalho nas notas de escola aparência etc
', '2026-04-10 23:21:12.896338+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7ee32f92-c6f0-4fc7-9218-96842d72c92b', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Filho de Deus, feliz e educado ', '2026-04-12 16:24:28.918704+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ee8bb3ca-e875-4f11-a59c-320fa9f7b4bf', '66b31cf2-7782-4253-98ea-3b6d631703a4', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'prayer', 'Senho pai obrigada por tudo que o senhor já fez por nós que até quando o pecado apareceu no mundo você não nos deixou para trás. Obrigada por me ensinar que a opinião dos outros não importa mas sim oque vc pensa de mim em nome de Jesus amém.', '2026-04-06 22:27:06.651553+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8f10ffca-c337-4bd1-b4a7-458559be2442', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q2', 'Por que ele nos deu um propósito para cada um ', '2026-04-15 23:47:32.614885+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '202ca5ba-8ff3-4dcf-aea6-f9eff9802237', '32a9f112-1192-4b2a-918f-c2895a76ade3', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'Quando as pessoas dizem que eu não consigo', '2026-04-02 22:45:07.277821+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '50b3e1a6-8123-4839-961c-dbe4a3555ab5', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'practice', 'Lembrar todos os dias que Deus me ama do jeito que sou.', '2026-03-31 00:59:18.743738+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4bb8a941-cdd7-46cb-b113-1bee6f100a5d', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q0', 'A maioria nas redes sociais.', '2026-03-31 00:45:40.625883+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '522011f4-1015-4e07-af2c-3453c97a4fa0', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Eu sou filho,neto,cristão,irmão,estudante,gosto de jogar bola,eu se irrito fácil principalmente com as injustiças.Mas acima de tudo tenho um coração que se importa com os outros', '2026-03-31 00:37:48.003662+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b1aabed6-6d13-4979-be35-506d2f69ddd8', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q1', 'Atrapalham,pois nas redes sociais elas acham que são mais valorizadas.', '2026-03-31 00:47:41.401497+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '66856b4e-d52c-4145-9fba-201e82450f94', '8745732c-55e9-488b-b638-960a6d9ea340', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q2', 'Que então sempre podemos ser incríveis ', '2026-04-18 14:38:10.470463+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.lesson_responses (
  id, user_id, lesson_id, question_key, response, created_at, updated_at, awarded_points, override_release_id, church_id
)
VALUES
(
  '710e617f-e15f-469f-939a-83a00f7205cf', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Significa que eu sou muito importante pra Deus,que eu devo ajudar ao próximo pois ele também foi criado em semelhança e a imagem de Deus,e que eu devo cuidar da vida que ele me deu.', '2026-03-31 00:26:13.16309+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9d6f71ca-9ce3-4370-ab56-a376c56527f3', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Significa que tenho importância sim!,que eu não sou um acidente e que na verdade só tenho de ser grata.', '2026-03-30 15:28:32.185609+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bf9ed40d-de86-4f93-a011-0e8f1eb22b53', '2f773751-38c2-45a1-8ee0-f5b856092730', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'prayer', 'Obrigado Jesus por me dizer quem eu sou.', '2026-04-13 22:12:00.289898+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '71d898f6-af15-4e98-8918-32a12151ef59', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'prayer', 'Deus, obrigado pelo que aprendi hoje. Me ajuda a lembrar que minha identidade está em Ti e não nas coisas do mundo. Quero confiar mais em Ti e viver do jeito certo. Amém.', '2026-04-11 16:56:25.03867+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'acda1f8f-8014-4c27-bb87-35ed8241786a', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'Viver alegre e aguentar qualquer coisa que me deixa triste.', '2026-03-31 14:30:40.989823+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2a646c1a-af0c-4283-a77c-f48fe084440d', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', 'Para essa semana peço sabedoria pois estou na época de provas, proteção e saúde ', '2026-03-31 00:38:28.496547+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7f4c2dbd-4505-46b5-804b-8964e50addb4', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Preciso não guardar rancor das pessoas.', '2026-03-30 14:59:09.897484+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '29eee174-7185-4a6d-8b2d-8d4650594668', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Que eu sou filho de Deus e que ele me fez como eu sou', '2026-04-12 16:31:15.63237+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ec94c63f-ee8f-476a-aa03-fad88af6b8cc', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'Ser feliz', '2026-04-10 02:00:52.02108+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8e1f84cb-17a5-4c54-8ad5-d41888b16cb2', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q2', 'Por ter uma identidade importante a um Deus verdadeiro e único ', '2026-04-03 16:55:27.11938+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '65b8dd4f-19f5-4c99-8e65-06aa7df2c3bf', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Aparência ', '2026-04-10 01:57:31.173878+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b2dd6f8d-600a-488a-851b-38238a75fa31', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q3', 'Por não serem famosíssimas,ao invés de descansar no nosso Pai, Deus.', '2026-04-20 12:19:03.59406+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9130a1e6-aaaa-42e1-8215-abc110273677', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', 'Hoje Deus eu aprendi que eu tenho uma importância e um propósito nessa vida Deus, que daqui pra frente eu possa aprender muitas coisas assim como está Deus, amém.', '2026-03-31 14:32:03.729784+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2f485d73-4b2c-4037-ba47-64405d2f3fa2', '8745732c-55e9-488b-b638-960a6d9ea340', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Alta, preguiçosa, dedicada,...', '2026-04-03 18:35:07.080191+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'dbcc99b2-4be3-4448-af7c-75aa21075485', '9289d1ce-a632-4cd7-930e-73023e549ec5', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Introvertido, Pacífico e pensativo', '2026-03-31 01:43:57.35841+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fc93a626-39b6-461f-ab03-0dbbca8318cd', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q0', 'Em mim mesma', '2026-05-11 16:22:45.94978+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e7e199ab-5b54-4f2b-8647-95025d89cd21', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'No colégio ', '2026-03-31 00:16:44.715323+00', '2026-05-16 17:28:58.715396+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7a7f75ec-f094-4aa1-b6f9-741a0a56392a', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Que preciso ter empatia e amor ao próximo ', '2026-03-31 15:16:36.319494+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '86c63a45-a620-4d6b-bb1a-d0d586c126f8', 'b486e185-6cb3-477c-936b-b204b143e329', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q1', 'Não por que ensinam coisa que não vão prestar na vida ', '2026-04-10 23:24:40.706278+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '99b9045c-479f-4ef0-8bed-fd210c4ff0dd', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'practice', 'Demonstrar o amor de Deus através das minhas atitudes. ', '2026-04-11 14:36:48.17201+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6167ede5-994b-4e77-8a91-6cd9edfdde10', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'Essa semana eu planejo relembrar a morte de Cristo e relembrar a ressurreição ', '2026-04-03 20:58:48.771684+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6ba72164-921e-487b-8b2f-55dc2956ac13', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Significa que eu sou digno da minha vida e ainda tenho muitos propósitos pra conquistar.', '2026-03-31 14:14:19.362196+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2a708a6a-5a4d-4e59-a123-eb64306a20e7', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'Na escola quando tem prova para colar 
Quando alguém me ofende', '2026-04-02 22:40:54.640473+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4506d2a1-11da-4dfe-bdc9-26966a588862', '985bc110-c90a-4762-8b1b-7b081e0c6863', '9158db48-16c3-468f-8c86-153999294c8f', 'prayer', '. ', '2026-04-12 11:09:23.60488+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '30f31078-a27b-46eb-8996-e02a1e09056f', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Sou bastante intensa em tudo 
', '2026-03-31 00:31:33.343668+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'efde0029-0c3f-4665-aebf-0e107700d717', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Sentimento de importância ', '2026-03-31 00:39:04.452016+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0a1674db-8fac-454e-a585-ca38bd7a6307', '9289d1ce-a632-4cd7-930e-73023e549ec5', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'Viver mais alegre,tratar os outros melhor,com respeito,e com afeto', '2026-03-31 01:59:30.904565+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b0b33589-ab90-4dd2-9cff-3ed314700c40', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Muda que eu sei que sou filho de Deus, e posso contar com ele pra tudo.', '2026-03-31 14:20:44.748379+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '78be1071-a3ed-4b61-8f56-49971ec3107c', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q1', 'Ajudam e atrapalham, dependendo de como você usa', '2026-05-12 14:04:13.729458+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9fc68a52-a5d7-4ff1-b1ff-906cbb9715b5', '9289d1ce-a632-4cd7-930e-73023e549ec5', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', 'Deus,muito obrigado por ter nos criado com honra e glória,por sermos dignos,e espero que no futuro me dê bem,consiga viver normalmente,e feliz, amém.', '2026-03-31 01:58:20.287641+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '62e6e59e-6ae1-4ae3-84ef-e906e15cb0ce', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Me sinto semelhante a Deus ', '2026-03-31 00:34:21.160636+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '202d835e-99e1-4b4e-8fa1-9cde1b7d5dae', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'Quando eu tenho que mostrar meus talentos ', '2026-03-31 00:27:20.30161+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd377b0ea-bebd-470d-8377-8ade9e0d12b4', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', NULL, '2026-03-31 00:29:42.636947+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '436d4ed5-8391-40da-9f88-8e74bb10997e', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'Em momentos que eu tô chateado, e quando alguém acha que eu fiz algo errado e joga a culpa toda pra mim.', '2026-03-31 14:22:27.431579+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cc2f5cd9-7019-4ad7-a32f-cc58fb229db1', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'Que eu sou a imagem de deus', '2026-03-31 15:16:50.347941+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '09b49985-8dbd-428a-9c16-2525aa8ae917', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', 'Obrigado deus por tudo que você me deu e por ter me criado pra te representar ', '2026-03-31 15:17:28.201851+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2210f4c7-69f5-47ea-a440-b58510b12f51', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Que sou jogadora de futebol e que gosto de falar', '2026-03-31 15:14:28.692991+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '50472828-3b1d-4ef7-b6e4-9763d6e1164e', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Que eu sou única e não preciso pre comparar com os outros', '2026-03-31 15:15:13.967131+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4fcd560b-01ac-4d4f-97d6-c8394f6db952', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Muda que posso ser amada por deus', '2026-03-31 15:15:37.53202+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '38f4e331-8f96-4734-bd62-ccf8eeaa23d6', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'Na igreja ', '2026-03-31 15:15:58.395259+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1043fb00-3c67-4c3d-bf1d-2f52444d48a9', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'Eu sinto mais pressão quando estou com outras pessoas ou nas redes sociais, tentando mostrar quem eu sou.', '2026-03-30 23:04:13.682108+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '31e14c22-fc9d-459e-a4f2-0b90b0d651df', '914b898d-24a3-46ad-a764-d2f24e5115d1', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'Quando fico ansiosa ou nervosa', '2026-03-30 23:25:31.902676+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1c81a3be-527c-4b59-a63a-9fb6955ad34b', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', 'O senhor,hoje eu entendi,que não sou um acidente,obrigada,por nos criar á sua imagem ,meu Deus,me ajude a viver a identidade que você me entregou,no dia a dia, obrigada por tudo, em teu nome eu oro ,amém.', '2026-03-30 15:34:00.507297+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '91ee7209-be7e-46bc-bc93-ab87f7eb0be2', '8745732c-55e9-488b-b638-960a6d9ea340', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Que eu sou uma pessoa que foi muito amada por Deus que ate ele me criou a imagem e semelhança dele', '2026-04-03 18:36:23.304796+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '138887da-f079-4ff7-a023-da6f53b6fbe1', '9289d1ce-a632-4cd7-930e-73023e549ec5', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'Quando estou jogando na Educação Física,e preciso jogar bem,quando tiro nota ruim na prova,e preciso estudar mais', '2026-03-31 01:56:23.147954+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a219242d-7517-4bb1-8a9b-0f54d5415117', '914b898d-24a3-46ad-a764-d2f24e5115d1', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Ser menos nervosa,pensar mais antes de falar não reclamar tanto', '2026-03-30 23:26:17.343711+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2f26cc85-ff3d-4d30-a70b-11669d2218af', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q3', 'Vive com redenção sente mais fé ', '2026-04-15 23:48:15.454212+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4c015f2a-aab5-4795-ab86-887672e3a768', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'Eu planejo que passe minha febre e que essa semana seja uma semana abençoada ', '2026-04-12 16:37:09.362092+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0bb4afec-9d7c-4223-af01-3461f63f6b82', '8745732c-55e9-488b-b638-960a6d9ea340', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q3', 'Ela se sente mais importante mais alegre e com a alta estima alta ', '2026-04-18 14:38:30.132567+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c065a2d6-ff01-4ab0-a21c-17416335c2e6', '66b31cf2-7782-4253-98ea-3b6d631703a4', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'icebreaker', 'Amiga, cristã e bondosa ', '2026-04-06 20:59:05.659458+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b65edb25-a67f-4a3d-b9f4-7e44d98b9757', 'b486e185-6cb3-477c-936b-b204b143e329', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q2', 'Por que morreu na cruz para nos salvar
', '2026-04-10 23:29:52.355251+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '49746208-e09c-4c67-aaaf-2f519bdd06ce', 'e57ed6e7-953a-4210-965b-26b336ba7da1', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q3', 'tudo a convivência com as pessoas  ia forma que ela trata as pessoas 
', '2026-04-01 22:53:52.734143+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bb956875-e127-4f3b-9771-4071f51408db', '2f773751-38c2-45a1-8ee0-f5b856092730', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Significa que sou criado com capacidades semelhantes à de Deus, até de inteligencia. ', '2026-03-14 17:27:51.831713+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '721f246f-9a34-4d96-9583-3f5609477930', '9289d1ce-a632-4cd7-930e-73023e549ec5', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Preciso mudar meus pensamentos ruim sobre mim mesmo,e tratar as pessoas com mais respeito e educação', '2026-03-31 01:57:05.864761+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5148aed9-6d82-4385-b84c-02a8023e88f7', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'Quando me perguntam quem sou eu,quando estou "sozinha".', '2026-03-30 15:32:35.512165+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f3ff681c-3687-4244-9f7d-4d01da6556a3', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q2', 'Que ele transforma a nossa vida ', '2026-05-12 14:05:11.425113+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8ee55c51-0524-4b52-aad3-ced31779a434', '985bc110-c90a-4762-8b1b-7b081e0c6863', '9158db48-16c3-468f-8c86-153999294c8f', 'q0', 'A imagem de um homem, simples, usando sandálias, vestido de túnica branca. ', '2026-04-12 11:03:51.156718+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '82ef39e1-0e85-43da-b64f-4b6d61d59eaf', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'icebreaker', 'Seria a desigualdade', '2026-04-21 01:09:05.209918+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '71a3a23a-a9e7-451a-907f-24f03cac026d', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'Viver em paz, viver em harmonia com as pessoas que gosto e que convivo  no meu dia a dia , e ter saúde.', '2026-04-10 19:36:20.944357+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1ba33361-f831-4b99-a6c4-311bf4c4ee53', '2f773751-38c2-45a1-8ee0-f5b856092730', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Preciso tratar com respeito, pois sei se são filhas de Deus. ', '2026-03-14 17:28:13.650158+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7cf10d9b-05ca-4dc8-b470-8b2e883d46d1', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'Não busco ficar provando quem eu sou pois através das minhas atitudes as pessoas sabem quem eu sou', '2026-03-30 14:58:39.951328+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f3e81b50-51e3-49a4-a1d4-6161d3be461c', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'Tentar não brigar com os familiares ', '2026-04-02 22:45:16.670064+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2b0203ab-88a7-429f-823e-e56f0ab24847', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'prayer', 'Senhor, obrigado por esse dia maravilhoso ilumine o caminho de cada um, mostre o seu poder aos que não seguem ao senhor e nos de saúde', '2026-04-03 16:56:21.800635+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '72e6ecf8-f9c2-48b6-9018-94086f5e6ff5', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Preciso começar a me ver de forma mais positiva e tratar os outros com mais amor e respeito.', '2026-03-30 23:04:24.748382+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7040998d-a804-444e-b19d-b382c0fa9fad', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'Avaliações ', '2026-03-31 00:34:51.839632+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3479fec6-b923-428c-a5ba-e854788b899f', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'prayer', 'Senhor! Coloque em mim um coração sábio, tranquilo e pacificador. Que eu não viva falsamente, mas que minhas atitudes transmitam teu amor.', '2026-04-11 14:37:07.152898+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '47e5fd2c-82bd-4a0a-a031-b68e2e539c38', '66b31cf2-7782-4253-98ea-3b6d631703a4', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q4', 'Não dar bola para a opinião dos outros sobre mim ', '2026-04-06 22:17:37.108002+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2bb2fe58-4bf8-47dd-8fad-96ecba38e1d2', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Conforto', '2026-04-10 01:57:58.173012+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'da8022bf-5c8a-4c84-8c13-12314344165d', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q1', 'Porque Deus pode e sabe de tudo', '2026-04-20 23:46:22.35672+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c9513557-15c5-4dae-96d1-c8c1218a9a75', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Eu amo Deus ', '2026-04-03 20:50:18.226298+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '00931451-7ffe-48c5-aba4-97e1d3080b24', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', 'Deus me de sabedoria para continuar a caminhada no caminho correto que leva as pessoas ao céu ', '2026-04-03 20:59:55.98044+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '240793ba-6548-46e5-b888-1bd5f08626f4', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'practice', 'Eu vou tentar confiar mais em Deus, parar de me comparar com os outros e lembrar que minha identidade vem dEle.', '2026-04-11 16:40:01.925608+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3bcfe9a8-ab58-4b3e-98e8-1882cedc6e12', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Ser um pouco mais educada,tentar ne esforçar mais e mais.', '2026-03-30 15:33:26.491504+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e7eaa206-d2d4-4a42-85de-06230f1031a0', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Nos valorizar mais ', '2026-04-02 22:42:50.091787+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e73f8491-9ed6-451f-98dc-1fde4eb1aaf7', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Que todos somos templo do espírito ', '2026-03-31 00:35:55.468711+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '62c17408-d415-4535-8473-1be9f1bd16a3', '2dcc9a0e-accc-42df-8c78-5577fc2669db', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q1', 'Por que ele prepara tudo mas tem pessoas que se disvia do caminho', '2026-04-21 01:35:47.174567+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7c9a26ac-4f87-40b8-9717-5a762d930ddf', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q1', 'Pois o ser humano, em busca de poder, no seu egoísmo, quer ser como Deus; ou se seu um deus. ', '2026-04-11 14:32:22.154749+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fcaa55b3-cf3a-484b-ac79-791540587418', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Mais responsabilidade e tratar melhor os outros ', '2026-04-01 10:00:19.472261+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '35e5bd81-b193-4c2f-bcfb-cbb074e3be78', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'Quando preciso apresentar algo em público ', '2026-04-01 10:01:07.116003+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c1afce39-69ae-49f6-bae1-46fa3b0656f4', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Posso ser mais responsável ter mais respeito e ajudar os outros ', '2026-04-01 10:01:31.080895+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '74939f68-216f-462d-9def-8effcf90c223', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Aumenta meu valor', '2026-04-10 01:58:46.294018+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '64e78a8d-19a4-4651-8ed0-d3b5675ec3cb', '8bf335ab-907e-497b-b08b-615ad716e722', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Significa muito , ser criado a imagem e semelhança do ser que criou tudo , que criou a galáxia , o universo, ser criado a imagem e semelhança dele é muita gratidão e felicidade ', '2026-04-01 15:24:29.54464+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '23a4108c-d4dc-40d1-8d1b-46c730435b72', '9289d1ce-a632-4cd7-930e-73023e549ec5', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Gostar de ver filmes e séries,ser alto,criatividade, preguiça,feliz', '2026-03-31 01:50:49.447455+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '445fbda5-bd16-4aa9-beea-dda712e10c62', '8745732c-55e9-488b-b638-960a6d9ea340', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Muda que se eu me achar feia estou falando que Deus e feio então tenho que ter uma alto estima maior por mim ', '2026-04-03 18:37:44.242772+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b22876ae-4dac-4f5f-9e50-7a6a781605cd', '8bf335ab-907e-497b-b08b-615ad716e722', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Meu "valor" aumenta muito pois agora sei que fui criado a imagem semelhança do ser que criou tudo e que também me deu um propósito na Terra', '2026-04-01 15:26:23.709805+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fbfc4a09-bec9-4a26-aa82-265f6d21f823', '8745732c-55e9-488b-b638-960a6d9ea340', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q4', 'Nao se importar no que os outros alam e sim acreditar em Cristo ', '2026-04-18 14:39:38.689339+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ca61a4cd-982c-4668-b3ee-3e4d9f79d6c6', '32a9f112-1192-4b2a-918f-c2895a76ade3', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Sou boa em cozinhar e não tenho amor material', '2026-04-02 22:43:12.216184+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a83e0a30-4738-4b26-bd5d-b1feb70cb452', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Significa que eu tenho valor e fui criado com propósito, e que posso confiar em Deus em qualquer situação. ', '2026-03-30 23:02:38.463087+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2c5d76a6-449d-4429-a89a-0c7ddf96e9f9', '914b898d-24a3-46ad-a764-d2f24e5115d1', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Que sou especial pra Deus', '2026-03-30 23:23:59.289397+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c84cf8a3-8689-42e3-8d7f-7f355ecc95d9', '8bf335ab-907e-497b-b08b-615ad716e722', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'Quando eu preciso apresentar algo na frente de muita gente ', '2026-04-01 15:28:00.480111+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '18de545c-bda1-44c1-ace6-7f7b36d79777', '9a0c5687-f135-4377-a410-58592ef8737a', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q1', 'Atrapalham ,porque nas redes sociais é muita mentira ', '2026-03-24 01:14:00.08755+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '87610371-c435-4b44-a0a9-811a96c4a4c1', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'prayer', 'Obrigada Senhor! Por mais um dia,pela saúde, porque tu nos ama e cuida de nós! 
Te agradeço por poder ser tua filha e viver do teu amor!Abençoe este novo dia que se aproxima e nos dê uma noite de descanso.
Em nome de Jesus Amém. ', '2026-03-31 01:05:35.852666+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '911fb92b-3ea4-4e55-8833-5ca86681b435', '8bf335ab-907e-497b-b08b-615ad716e722', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Trata-las melhor , as vezes trato algumas pessoas mau...', '2026-04-01 15:29:17.543649+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b62ccb2a-0039-4314-ae20-e8b426c47eb7', '8bf335ab-907e-497b-b08b-615ad716e722', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'Vou aplicar no WhatsApp ', '2026-04-01 15:33:44.166138+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '243c9145-ae83-407f-bc50-84c595a44b64', '8bf335ab-907e-497b-b08b-615ad716e722', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', 'Agradeço pai , a ter me criado a sua imagem e semelhança, por isso sou muito grato , e não só a isso , a tudo que o senhor também fez a mim ', '2026-04-01 15:33:55.549431+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '44e2405d-5925-4550-afe1-b3f98c67f9a1', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Estudante caseiro quieto', '2026-04-01 09:56:51.809407+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7550a4fa-611f-4da1-b152-e5f00505147a', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'Vou começar ajudando todos na escola meus pais etc e também completando tarefas e fazendo os temas e trabalhos assim estou tendo mais responsabilidade ', '2026-04-01 10:02:18.72243+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0d21709a-2069-40c2-b7da-fae8cc0d86f8', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Uso personalidade talentos e sentimentos ', '2026-04-01 09:58:04.041143+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd90df53c-68d1-4e38-a1f7-92c653761ea9', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Significa que devo ter respeito por todos e fazer oque é certo', '2026-04-01 09:58:47.866289+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cb564a87-bec4-44d9-a4b0-b9ab8f321a57', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'icebreaker', 'Se eu pudesse eliminar um problema do mundo hoje seria o pecado', '2026-04-11 16:13:34.230229+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.lesson_responses (
  id, user_id, lesson_id, question_key, response, created_at, updated_at, awarded_points, override_release_id, church_id
)
VALUES
(
  '6d472275-bfff-4917-9339-a94d3cbd45af', 'b486e185-6cb3-477c-936b-b204b143e329', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q3', 'Ela vive sem se preocupar como que ela é, mas  se preocupa como Deus pensa dela', '2026-04-10 23:31:19.17068+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '47f75906-84ec-4773-98cb-e844bfe75abb', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q4', 'Que daí não preciso ser famosa pra ter a verdadeira indentidade, preciso lembrar que nossa indentidade não começa nas redes sociais e sim em Deus ', '2026-04-20 12:20:43.425215+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f0786b13-8d3c-4eb4-b695-8290aa71ad64', '8bf335ab-907e-497b-b08b-615ad716e722', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Determinado, feliz e abençoado ', '2026-04-01 15:10:43.47969+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c967556c-f846-4e57-ba0b-d69c61e40ab6', '8bf335ab-907e-497b-b08b-615ad716e722', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Personalidade e sentimentos ', '2026-04-01 15:24:16.503241+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e08bb3a7-f720-48fa-ab8c-2d3d8fd74c91', '985bc110-c90a-4762-8b1b-7b081e0c6863', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Amor', '2026-03-20 01:08:15.808382+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4cdf5988-bfb9-4f4c-8123-c9cef8c35d5b', '66b31cf2-7782-4253-98ea-3b6d631703a4', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q0', 'Redes sociais opiniões dos outros ou até mesmo seus sentimentos ', '2026-04-06 22:21:06.06021+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2b72718f-f472-4a00-b6a8-1b47e196f143', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q0', 'O desrespeito e o pecado.', '2026-04-20 22:06:41.53179+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ba25ebe2-2a27-4e66-b120-5979a889883b', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q2', 'Que o pecador, no caso as pessoas, pensam apenas em si, nos seus próprios desejos, vaidades, egoísmo. ', '2026-04-11 14:33:19.790547+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f806226f-28cb-44df-94fb-283f73126651', '985bc110-c90a-4762-8b1b-7b081e0c6863', '9158db48-16c3-468f-8c86-153999294c8f', 'q1', 'Que ele queria que os discípulos vissem além dessa imagem humana. ', '2026-04-12 11:04:44.717021+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fb8ccaf3-2729-4656-90d3-7184fc6be341', 'a608622c-4120-4d15-949f-235ca64db2cf', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'Na hr dos estudos, quando vou ter que fazer algo', '2026-03-21 12:28:34.557311+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '811b65ec-572b-412d-98f4-8ab686953ab0', '9a0c5687-f135-4377-a410-58592ef8737a', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q3', 'Mais alegre,mais confiante ', '2026-03-24 01:15:39.472612+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '35e58fd5-fce9-4377-94be-5b1e7a555be3', 'a608622c-4120-4d15-949f-235ca64db2cf', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Mudar a forma de pensar em mim e nas pessoas', '2026-03-21 12:29:13.157787+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '10be1876-58ba-4cb7-af7b-5c87e889104e', '32a9f112-1192-4b2a-918f-c2895a76ade3', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Ter mais paciência', '2026-04-02 22:45:26.4949+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd4010e31-8a2a-4f67-9197-2297f3e26ad1', '9289d1ce-a632-4cd7-930e-73023e549ec5', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Me sinto bem e somos dignos porque Deus fez para refletir Seu caráter e honrar', '2026-03-31 01:53:57.468989+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a60d98b3-bd1a-406b-a0ee-d55f90a18dea', '9a0c5687-f135-4377-a410-58592ef8737a', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q4', 'Ler a bíblia,  orar e ir na igreja ', '2026-03-24 01:18:58.509473+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cd7cb366-a442-489c-a8e9-5727d3445e63', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q2', 'É um orgulho saber que fomos criados a imagem e selhança de Deus.', '2026-03-31 00:49:59.953051+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fdea39e5-7039-44e1-bb96-347682a68293', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q3', 'Que Deus fica acima de tudo', '2026-05-12 14:06:52.050625+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f5d6d5c3-2ef9-402f-820f-17dcf896cbc3', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q3', 'O comportamento. ', '2026-03-31 00:50:47.47619+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '27b2037e-c8d4-4962-a92f-e40b9288d686', '9289d1ce-a632-4cd7-930e-73023e549ec5', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Muda que agora sei que tenho sim valor e honra,pois sou a imagem de Deus', '2026-03-31 01:55:06.313068+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cf75c46d-e6b9-4806-ba6b-d4b519456460', '4d062445-4744-4007-a2ac-d7c4743fc979', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Eu amo deus
', '2026-04-02 09:30:29.382881+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c5ac292b-4631-481e-badc-b008e4f0d1e3', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Uma coisa muito importante pra minha salvação ', '2026-04-03 20:55:15.594853+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1b773863-9141-427d-aab5-f5557b180092', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q3', 'Porque não traz felicidade ', '2026-04-21 01:36:08.431555+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a4241bb0-ca1f-45e3-bafd-d80182dcc6fd', 'e57ed6e7-953a-4210-965b-26b336ba7da1', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q0', ' na Bliblia', '2026-04-01 22:50:58.744857+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd251a020-6194-4211-bf4e-fb3b42a4ff5a', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q4', 'Lendo a Bíblia orando indo na igreja ', '2026-04-15 23:48:39.59703+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '77a5978a-300a-43b6-8ed3-68a9b4260f8d', '4d062445-4744-4007-a2ac-d7c4743fc979', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'Se encontra com deus ', '2026-04-02 09:31:58.753681+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3c5083c0-7695-48ff-9749-064a0ad24d71', 'e57ed6e7-953a-4210-965b-26b336ba7da1', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'prayer', 'Agradeço por esse ensino confirmatorio e abençoe cada integrante do grupo e também as pessoas que eu convivo em casa no trabalho e na escola amém ', '2026-04-01 22:59:07.613032+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5947ade0-2729-4022-8bbc-f12eb29988ee', '4d062445-4744-4007-a2ac-d7c4743fc979', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', 'Obrigado senhor pelo mais um dia de vida e por cuidar da minha família ', '2026-04-02 09:34:12.166234+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8d2e91f2-151f-4268-be84-546a6f437f7c', '4d062445-4744-4007-a2ac-d7c4743fc979', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Orando', '2026-04-02 09:31:02.821038+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c5817500-8ad1-4415-ad70-14e50a57526f', '4d062445-4744-4007-a2ac-d7c4743fc979', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Ter o valor do criador', '2026-04-02 09:31:17.745951+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7ece4f21-843d-4a76-bf84-6ab90aafe3c2', 'e57ed6e7-953a-4210-965b-26b336ba7da1', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'icebreaker', 'sou ágil rápido e esperto
', '2026-04-01 22:50:13.95831+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '402f986f-12fd-4713-ad28-a4e083d1f88b', 'e57ed6e7-953a-4210-965b-26b336ba7da1', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'practice', 'Ser mais responsável ', '2026-04-01 22:59:22.156533+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '480eb5f0-f4d4-40a5-93c3-45e46212eb6e', '4d062445-4744-4007-a2ac-d7c4743fc979', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Valor que deus me deu', '2026-04-02 09:31:43.472687+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '39f48bc5-24c3-4a3f-87ae-96ae7d4f1ece', '4d062445-4744-4007-a2ac-d7c4743fc979', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'Conversando', '2026-04-02 09:32:41.597758+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5808ce19-8069-404e-9f5f-68819f007c57', '4d062445-4744-4007-a2ac-d7c4743fc979', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Bem ', '2026-04-02 09:32:19.957732+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2a12b46f-6ab3-438b-92c9-af62b35cbac4', 'e57ed6e7-953a-4210-965b-26b336ba7da1', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q1', 'Depende de como as pessoas usam', '2026-04-01 22:51:43.262044+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4dcab39c-9841-493d-905f-6861d02f8991', 'e57ed6e7-953a-4210-965b-26b336ba7da1', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q2', 'Bom pois sou a imagem de Deus', '2026-04-01 22:52:36.815288+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '93b4021e-52fc-462d-b85e-7a99341c945b', 'e57ed6e7-953a-4210-965b-26b336ba7da1', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q4', 'falar de Deus com quem eu convivo ', '2026-04-01 22:56:06.180568+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3ce859c2-766f-4a0d-8cc3-55490634cd1d', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'Principalmente na escola', '2026-03-30 23:58:31.566558+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5c12b28d-cda6-4c9a-8fd7-9143d5f83823', 'b486e185-6cb3-477c-936b-b204b143e329', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'icebreaker', 'Sou cristão estudo no cep e gosto de música
', '2026-04-10 23:18:41.004786+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'dd43279e-43b5-44e7-ae0f-b88488f69977', 'e57ed6e7-953a-4210-965b-26b336ba7da1', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'Quando ficam me pedindo quem sou e o que eu gosto de fazer ', '2026-04-01 22:38:40.315478+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '48f5bf2f-9429-4ac9-891a-6257ce6d03ab', '8745732c-55e9-488b-b638-960a6d9ea340', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'practice', 'Eu sou filha de Deus. Eu sou amada por ele. Deus me ama. ', '2026-04-18 14:40:41.852256+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '96215e06-8b2b-40c7-9d8c-a538006df5ba', 'e57ed6e7-953a-4210-965b-26b336ba7da1', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Ágil,inteligente, estudioso', '2026-04-01 22:22:42.293048+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '94c789c7-4e50-4a64-a85a-4fb09e5df6be', 'e57ed6e7-953a-4210-965b-26b336ba7da1', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'Me esforçar mais na escola', '2026-04-01 22:40:49.836778+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '965b4f42-954d-44a6-a66d-506c57245f8a', 'e57ed6e7-953a-4210-965b-26b336ba7da1', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Mudar meu comportamento com as pessoas 9', '2026-04-01 22:39:55.823766+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9eeefc48-6811-43ce-906d-0a8b70bbc52e', '8745732c-55e9-488b-b638-960a6d9ea340', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'Na escola ', '2026-04-03 18:37:59.990818+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9172928e-039f-4f7d-82f1-de5b23635861', 'e57ed6e7-953a-4210-965b-26b336ba7da1', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', 'Obrigado  Deus por mi fazer a sua imagem  e semelhança  perdoa pelos meus erros meus pecados e gratidão pelo meu   aprendizado amém. ', '2026-04-01 22:41:34.877684+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '69f06559-4ea8-4d59-bdc4-4635e9982055', 'e57ed6e7-953a-4210-965b-26b336ba7da1', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Eu sou talentoso em algumas coisas não sou bom em outras coisas ....', '2026-04-01 22:36:14.999102+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '03c010f6-6f30-4bf5-b936-03f6e70ddc08', 'e57ed6e7-953a-4210-965b-26b336ba7da1', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Legal pois sou igual meu criador ', '2026-04-01 22:37:24.793185+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ec167abd-23dc-433b-abf8-54c85e9d7570', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'Na escola', '2026-04-10 01:59:43.021438+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4a4efb2e-dd70-4bc0-a3d4-4e0886922200', 'e57ed6e7-953a-4210-965b-26b336ba7da1', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Muda tudo por que isso mostra a verdade do meu valor', '2026-04-01 22:38:16.595825+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1e0c2128-d08b-41cf-8958-47b990691443', 'b486e185-6cb3-477c-936b-b204b143e329', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q4', 'Tendo fé nele e acreditando que jesus ama você do jeito que você é', '2026-04-10 23:33:09.803509+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '78265d74-a5ff-4a3b-a54a-7d600c5a4e8d', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Muda da forma em que posso me tornar uma pessoa melhor', '2026-03-30 23:57:17.505235+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '84757195-dc47-4f29-a75b-46214cd53490', '9289d1ce-a632-4cd7-930e-73023e549ec5', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q4', 'Que Deus não desiste de nós,e nossa verdadeira identidade é ser criação de Deus', '2026-04-20 20:02:59.2933+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b3da99d6-ae76-4c21-97cf-2958eeeb7f28', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'Ajudando lendo a bíblia ouvindo música de jesus e orando pelo próximo ', '2026-04-02 00:06:06.444234+00', '2026-05-16 17:28:58.715396+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b4b0ff78-1acb-4315-a62e-aef7ab6d3958', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q0', 'A discórdia entre os seres humanos , falta de caráter,  falta de humildade e respeito', '2026-04-11 16:15:52.667011+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9be7730d-8e2d-43d3-9689-0eee5815f847', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'Eu sinto mais pressão quando estou com outras pessoas, querendo ser aceita ou aprovada. 
Também acontece quando erro, e parece que preciso provar que sou melhor do que aquilo.', '2026-04-10 19:29:51.037707+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '02f172d0-83ff-45e4-bbfb-b36c7674c5e8', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'practice', 'Reservando alguns minutos para realizar ', '2026-04-20 12:23:02.906045+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '569a5657-f2e0-4d13-b6b4-bc0abf11d478', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Ter mais interação com as pessoas e ser mais calmo.', '2026-03-31 14:26:29.430709+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '65129573-cfe6-4e0b-afb6-082004f4dbc2', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q3', 'Porque são falsas e vazias. Estão longe daquilo que Deus planejou para o ser humano.', '2026-04-11 14:34:18.861463+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '473d6fd3-13c3-4d5a-accc-1c623a503917', '66b31cf2-7782-4253-98ea-3b6d631703a4', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'practice', 'Colocar em minha cabeça que sou filha de Deus, amada por ele e só oque ele pensa de mim importante ', '2026-04-06 22:26:46.346438+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '89dd97ea-455a-424f-989c-e61b336dabf9', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Talvez ser mais extrovertida,e tratar as outras pessoas com um pouco mais de educação ', '2026-03-31 00:03:42.85168+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '80b5ba69-ed6c-4760-8243-f19689b9a165', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q2', 'Você se culpando do pecados ', '2026-04-20 23:47:20.583155+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fb0e6b89-8be2-41e8-92e1-a1dafb5d47da', '32a9f112-1192-4b2a-918f-c2895a76ade3', '725a9760-296a-4477-a84f-4603d2046fe6', 'icebreaker', 'Criativa, inteligente e anciosa
', '2026-04-07 15:45:40.180132+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5e99b597-5d37-4e09-8a80-cd3ec8ef3aa5', '32a9f112-1192-4b2a-918f-c2895a76ade3', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'Eu planejo viver mais confiante e sentir que tenho muito mais valor', '2026-04-02 22:46:00.5122+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '00c5bd37-682c-45fd-9c99-547e54aa838a', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'prayer', 'Deus, obrigado que tu me deixaste estar aqui, aprendendo um pouco mais, entendo que não preciso ter a indentidade da Terra e sim,a la do céu,a da Terra o senhor sabe como é, popularidade,rede social,ser famosa,pedirem autógrafos para se sentir melhor,não,não preciso disso,só de ti,tu és o bastante para mim,eu te amo,em teu nome eu oro,amém .', '2026-04-20 12:23:48.989181+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2a2809cc-08f2-4ec1-830d-ada393f258b7', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q4', 'Que Deus me criou parecida com ele e é isso que importa.', '2026-03-31 00:55:45.673468+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b52e657c-f027-4acf-8918-fe3078a427f8', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'practice', 'Planejo viver com mais humildade ', '2026-04-21 01:38:00.033033+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '61838b29-b9eb-4871-8eda-f35dcf6f9242', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q3', 'Porque isso não e o que importa em uma boa comunhão com Deus ', '2026-04-20 23:48:15.08636+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3d5a663d-6da4-4197-b557-3171c693e283', '32a9f112-1192-4b2a-918f-c2895a76ade3', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'icebreaker', 'Poluição, guerra, desrespeito. ', '2026-04-23 00:40:58.399755+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd0b553f8-775a-440d-a59a-2fffb555fbac', '7640c7e4-6780-4c27-8a04-ae5ab375f580', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q3', 'Por que pessoas mudam de opinião e aparência fácil mente.', '2026-04-21 13:50:11.405953+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '51e5a3dd-4643-4060-aae0-9196ad7f7a93', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'prayer', 'Senhor me proteja de todo o mal e de todas as serpentes que possam tentar me levar para o caminho errado, me guie no caminho de fé, amém.', '2026-04-21 22:28:02.438446+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9a23dfb1-11e0-4a15-b0ca-eadade6fc842', '985bc110-c90a-4762-8b1b-7b081e0c6863', '9158db48-16c3-468f-8c86-153999294c8f', 'icebreaker', 'Jesus. Mesmo parecendo cliché. Gostaria de entender e perguntar o que ele sentiu ao se tornar carne e sentir na própria pele todas as angústias e mesmo assim aceitar morrer na cruz. Seria incrível estar diante de Deus filho e perceber um amor nunca antes visto em nenhum outro ser humano.', '2026-04-12 10:59:40.073575+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '73d9ec10-e3c4-4da9-8107-7e052ebb2260', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q0', 'O preconceito com as pessoas ', '2026-04-26 14:53:42.067351+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6402209d-5d24-4c86-8862-fec593763a61', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'prayer', 'Senhor Deus obrigada por esse dia maravilhoso, proteja nós de todo o mal quero muito realizar maus sonhos mas que seja feita a tua vontade. Amo você. Amém ', '2026-04-20 22:54:09.90014+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b7f609f6-9669-4e3f-8b79-c76c699d2ee1', '8745732c-55e9-488b-b638-960a6d9ea340', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'prayer', 'Deus obrigado por tudo obrigado por me criar assim tam incrível mesmo pecadora. Eu agradeço por estar viva e bem hoje. Em tam grandioso nome amém.', '2026-04-18 14:42:04.661616+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '15763e4f-2ddb-4031-a6a0-665c9b15cb87', '2dcc9a0e-accc-42df-8c78-5577fc2669db', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q2', 'Que ele vive nos próprios pecados', '2026-04-21 01:36:33.585542+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1c18021d-fec4-47fc-95e9-1a8b8673b5e3', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q4', 'Não se importando com o que as pessoas pensam sobre mim', '2026-05-12 14:07:45.994083+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '31b7d940-1ebb-44b4-959a-5c9b5d69d746', '9289d1ce-a632-4cd7-930e-73023e549ec5', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'practice', 'Encontrar minha identidade em Deus,e não nas coisas ao redor como aparência e notas da escola', '2026-04-20 20:05:11.955363+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a56e66f5-2dbd-4016-98d7-a938915e8e0f', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q4', 'A diferença de mudar', '2026-04-26 14:56:11.043316+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5c1a3688-1064-4afa-94e6-bc23e7eaace0', '1526dc8b-a92a-4a44-b358-b6a3083d0143', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'prayer', 'Querido Deus, obrigado pelo cuidado e carinho que tens comigo todos os dias,que me proteja de todo mal e me ensine a cada dia ser uma pessoa melhor! ', '2026-04-21 13:32:38.87884+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '32269cde-135e-4ec5-a547-55a0c05ceada', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '67a5341d-a934-4387-a16c-1802e3e7b092', 'prayer', 'Senhor!Ajuda nos a viver segundo a tua vontade,e sempre aprendendo mais sobre a sua palavra. Amém ', '2026-04-24 01:02:51.263194+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1b1e5eb6-d128-4a8a-b62c-37c8d43aa78c', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'icebreaker', 'Feminicidio , desigualdade social ', '2026-05-02 00:54:21.986155+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bed0e616-24d2-45b8-b99c-d32fcce4cb4f', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'prayer', 'Senhor Deus quero te agradecer por tudo que tens me ajudado, também quero pedir para me ajudar ter um relacionamento molhor', '2026-05-01 18:47:07.671453+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4ebe11bb-e87b-4acf-b028-f9b79fe4ee1e', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q4', 'Lembrar disso dá segurança, ajuda nas escolhas e melhora a forma de tratar os outros.', '2026-05-02 01:00:08.397298+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'af896645-8430-487e-881b-716863f9ec38', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q1', 'Porque a dúvida faz a pessoa deixar de confiar em Deus e começar a seguir a própria vontade', '2026-04-11 16:43:13.576803+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6c64067b-95e5-4a27-889b-6ff38613520b', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '67a5341d-a934-4387-a16c-1802e3e7b092', 'q2', 'Não entendi.', '2026-04-24 01:08:32.037494+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '02a85fd6-a8ab-4222-a82b-c7c69771bfa5', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q0', 'Hoje em dia todo mundo faz por trabalho e jeito de ser e agir', '2026-04-15 23:49:27.80971+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0d3b3deb-2eb5-4158-a6f5-e594195b36a4', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q3', 'Pois essa coisa são passageiras ', '2026-04-22 02:09:39.978708+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3082551e-702e-49a8-a19c-6473c8561ef9', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q0', 'A importância com o próximo ', '2026-04-21 01:32:41.120606+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '886e1f4e-2800-4d35-9281-22e3bb857000', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'practice', 'Tentar entender o que Deus quer para minha vida
', '2026-04-23 01:46:49.978755+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'dd92ef13-fd81-4ddc-997f-b6e3aeab9bb1', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q0', 'A falta de respeito ', '2026-05-02 01:59:37.419246+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fceb4aa2-e9bc-4a88-850a-ccb42fd235cb', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q2', 'Significa pensar só em si mesmo, colocando os próprios desejos acima de Deus e dos outros.', '2026-04-11 16:52:47.481844+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3968396f-4d52-4e3b-a35a-0762f4aa8c42', '32a9f112-1192-4b2a-918f-c2895a76ade3', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q3', 'Pois um dia acaba a popularidade, pois só é popular que segue a Deus', '2026-04-23 00:42:57.784479+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1265e769-4f26-446a-b4e4-978dc564e524', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'icebreaker', 'O desrespeito entre pessoas e as pessoas com más intenções.', '2026-04-20 22:04:38.911317+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b71fb150-180e-4e92-aa8d-4c33b442ee5e', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q4', 'A diferença começa quando a gente percebe que se confiar em Deus na semana, planos, dias e trabalhos podem todos dar certo.', '2026-04-20 23:12:53.106565+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '21fe08cd-94f9-40b5-8354-6e416eb92ac0', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q0', 'O respeito umas às outras ', '2026-04-21 19:20:11.086857+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '29a58196-f38b-4686-873c-9b2beb5aed25', '66b31cf2-7782-4253-98ea-3b6d631703a4', '67a5341d-a934-4387-a16c-1802e3e7b092', 'q0', 'Ter uma vida nova ', '2026-04-26 21:45:21.432686+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bf2b4182-fd02-4eaa-a419-94674c37b509', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q4', 'A diferença e de que me faz lembrar de que minha indentidade começa em Deus e não na aparência, popularidade etc...', '2026-04-21 22:09:36.643017+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '909f5087-0839-4a97-ad84-87b1433c33af', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q3', 'Por que são coisas passageiras', '2026-04-23 01:40:20.74101+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e47ba5ba-9f83-434b-9aa0-e3581e305fa8', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', 'Obrigado Deus por ter me feito a tua imagem, obrigado pelo oque você faz comigo, obrigado por tudo oque eu tenho', '2026-04-10 02:01:26.530485+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.lesson_responses (
  id, user_id, lesson_id, question_key, response, created_at, updated_at, awarded_points, override_release_id, church_id
)
VALUES
(
  'd01eb23a-a541-4d67-a88f-607cd31d434c', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Me cuidar', '2026-04-10 02:00:15.949759+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2b5e4f18-c4f3-4d81-bc28-eb925fd21805', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'practice', 'Que eu sou filho de Deus e de jesus Cristo foi no cruz por a gente que ele perdoa nossos pecados', '2026-04-15 23:52:44.114497+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f2f28e1c-7e4e-4aea-b566-12c1da5cef92', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q4', 'Nós lembra que não podemos nos desfiar de Deus e ir pro lado do pecado devemos lembrar que ele é o Senhor que cuida da nossa vida, e o pecado é algo ruim que nós faz nos afastar dele.', '2026-05-02 02:02:45.870565+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3dd0a1c6-408d-48f9-8068-2bb2faba7c43', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'prayer', 'Senhor me mostra o caminho que eu devo seguir ', '2026-04-23 01:47:53.713236+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ff6fcc57-0bbb-4b45-a002-7cfb628cdb23', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q2', 'A gente vive querendo fazer a nossas coisas e não a vontade de Deus ', '2026-04-23 01:43:40.978292+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a0776d6f-d214-4a44-a4ec-fc160f58ca06', '32a9f112-1192-4b2a-918f-c2895a76ade3', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q0', 'Guerra', '2026-04-23 00:41:25.553017+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5b33d351-5e2d-43a6-b929-ea5a4c1edc59', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'practice', 'Orando', '2026-04-26 14:56:42.664632+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a28e6e19-a29c-4859-919e-a5ffd2ed29c4', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q1', 'Por as pessoas n pensarem direito ', '2026-04-26 14:54:34.812919+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '581e56f8-356c-4e24-99dd-0e6643e2eca6', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Sentimentos e personalidade ', '2026-04-03 20:55:05.516787+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f78cc8e9-f52f-44ec-9cd0-bafe717c7ca1', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q4', 'Ajudando os outros e pedindo perdão por tudo sempre ', '2026-04-20 23:49:52.040595+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b9790a92-fc0b-4cac-95ed-8a5d0a25060e', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'practice', 'Vou refletir, orar e lembrar que meu valor vem de Deus, não dos outros.', '2026-05-02 01:03:21.756842+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a295f503-7727-4b80-94ab-455bf0941995', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'icebreaker', 'A necessidade de muitas famílias pelo mundo todo.', '2026-04-21 21:49:00.778949+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cc7398be-cbbe-47b3-8952-2bbaeff31635', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q1', 'A dúvida é poderosa por que ela abala a confiança que temos em Deus.', '2026-04-21 22:12:40.384418+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e3a0064f-b352-4831-bbf5-523110d63518', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '67a5341d-a934-4387-a16c-1802e3e7b092', 'icebreaker', 'Entra em um time de futebol.', '2026-04-24 01:02:54.099303+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e2dc352a-62a1-4f12-9015-0e3e01895e1e', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'practice', 'Tentar não cometer muitos pecados.', '2026-04-20 23:20:32.206896+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '24684e8a-aea3-4175-8bb5-5304d523cde6', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q1', 'Porque muitas das vezes desconfiamos dele e perdemos nossa fé ', '2026-05-02 02:00:37.176306+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e2eb59fe-6a10-4223-935e-117f88f42690', '2dcc9a0e-accc-42df-8c78-5577fc2669db', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q3', 'Por que cada pessoa pode estar fazendo algo de pecado e as pessoas não vem as uma hora isso aparece', '2026-04-21 01:36:50.563284+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2152937d-24ec-45aa-a498-786942ee874b', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '67a5341d-a934-4387-a16c-1802e3e7b092', 'practice', 'Viver com gratidão, alegria e sabedoria. ', '2026-04-24 01:09:51.886556+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8f6e8270-1fdc-44c5-982e-2240d434150f', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q1', 'A dúvida sobre Deus é poderosa porque afeta a confiança nele.', '2026-05-02 00:56:02.163361+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fdaa3528-dbae-46a9-a695-a13935aab449', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'practice', 'Voltar a ler a Bíblia todo o dia, me preparar para o passa dia, ter mais paciência ', '2026-04-20 22:57:01.890748+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f6032139-ff4a-4dda-abaf-174037fd0266', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q2', 'Em minha opinião o homem, após o pecado pensa apenas em si mesmo. ', '2026-04-20 22:43:24.983581+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0d6221bc-710c-4a48-b3d0-90cfab7854e8', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '67a5341d-a934-4387-a16c-1802e3e7b092', 'icebreaker', 'Me forçaria a me aproximar e aprender mais de Deus', '2026-05-01 20:27:23.81124+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1dab175d-4c2f-479f-8a1c-3c4557a6639e', '7640c7e4-6780-4c27-8a04-ae5ab375f580', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q0', 'A falta de fé e amor pelo próximo ', '2026-04-21 13:47:13.061225+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '025ac9cb-dd74-4f1e-84c6-2bd661fdbb07', '9289d1ce-a632-4cd7-930e-73023e549ec5', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'icebreaker', 'Fome', '2026-04-20 19:47:17.8376+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b71ed9f1-b25d-449b-97ad-05f2647eed48', '985bc110-c90a-4762-8b1b-7b081e0c6863', '9158db48-16c3-468f-8c86-153999294c8f', 'practice', 'Estar mais perto de Cristo, ser uma pessoa melhor e mais amorosa.', '2026-04-12 11:08:58.035686+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c673d223-263c-4284-af13-739a172f4fe6', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q3', 'Por que muitas vezes elas podem ter tudo mais não tem Deus na vida e sem Deus nada da certo 
', '2026-05-02 02:03:54.918481+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4138bc64-1223-4545-8002-dbbee2a9304a', '1526dc8b-a92a-4a44-b358-b6a3083d0143', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q3', 'Porque sempre estamos querendo se aparecer,ser melhor que o outro ', '2026-04-21 13:29:51.399405+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b004d9a3-13fd-45c2-a444-06df299a692d', '32a9f112-1192-4b2a-918f-c2895a76ade3', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q4', 'Que nos fomos criados por um ser muito bom', '2026-04-23 00:43:49.517309+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '61bc86c0-88d2-4676-b634-ac61ad32e6eb', '66b31cf2-7782-4253-98ea-3b6d631703a4', '67a5341d-a934-4387-a16c-1802e3e7b092', 'q1', 'Confiança ', '2026-04-26 21:45:33.513193+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5327ab95-e242-460d-85a9-f64989438041', '66b31cf2-7782-4253-98ea-3b6d631703a4', '67a5341d-a934-4387-a16c-1802e3e7b092', 'prayer', 'Senhor pai que essa semana sege uma semana muito abençoada e que todos possam orar e crer  em ti .Amém ', '2026-04-26 21:47:36.290701+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a5ebd8ec-ded4-421d-a2ee-c3821e653384', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'prayer', 'Senhor Deus obrigado pelos seus ensinamentos e cuidar tão bem de mim,prometo mudar meu jeito de pensar e agir amém!', '2026-04-21 01:38:11.757699+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3501ae83-1249-4b23-9de3-c101baad5681', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q1', 'Trazendo discordância', '2026-04-21 01:33:03.840454+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7ffb45ef-814d-4af2-8e68-02fc5f4dab33', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q1', 'Porque o mundo oferece conforto e poder, o que pode levar as pessoas achar que são melhores que Deus.', '2026-04-20 22:10:51.350543+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '94079c3f-a1c7-421c-81f4-0cab720083cf', '7640c7e4-6780-4c27-8a04-ae5ab375f580', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q4', 'Que posso perdoar e posso ser perdoado.', '2026-04-21 13:50:57.830178+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fbf2e078-0589-46b8-b951-e798afc0e5e8', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', 'Senhor muito obrigado por esse dia Obrigada pela minha casa e pela minha comida Obrigada por ter nos criado te agradeço por nos perdoar ', '2026-04-02 22:46:15.093677+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '38c56201-b87e-4dd2-9327-a3edb2f59a1d', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Não responder os outros tratar melhor os outros cuidar do próximo ', '2026-04-02 22:44:02.952015+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1a422c7e-d090-4c43-bc94-dfac46690394', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'icebreaker', 'Fome', '2026-04-22 02:02:56.68907+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '549cb96b-e174-41de-926e-3290bc77e12e', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q4', 'Faz bastante diferença pois lembramos que fomos escolhidos por Deus ', '2026-04-22 02:10:47.402326+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b6f92325-f314-466b-928a-1b5267ecdb6a', '9289d1ce-a632-4cd7-930e-73023e549ec5', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'prayer', 'Senhor Deus espero nunca duvidar de você, não pecar tanto,e não tentar construir uma identidade pra mim mesmo,pois minha identidade, está em você, amém', '2026-04-20 20:05:52.553737+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '87733334-805e-40e1-beee-d407cd7d38f6', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q1', 'Atrapalham pois geram comparação e máscaras ', '2026-05-11 21:12:16.128352+00', '2026-05-15 01:38:59.941264+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ee5b871a-0ec0-4cfa-82b1-759e26f683e7', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'practice', 'Planejo acreditar que sou filho e amado por deus', '2026-05-12 14:09:39.334107+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2b8847f6-f852-4873-87b3-e07872ec0934', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'prayer', 'Obrigado Deus por tudo obrigado pelo mais um dia obrigado por tudo amém ', '2026-04-15 23:53:58.095909+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '59372ad8-ff7d-4068-accd-e05e946f70e3', '32a9f112-1192-4b2a-918f-c2895a76ade3', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'practice', 'Ser bem em atividades, louvar a Deus, é viver sempre o melhor', '2026-04-23 00:44:10.604011+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '33130e89-be62-4729-bf8a-1a3e564cd77f', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Que eu sou uma obra dele uma imagem representada a obra dele', '2026-04-12 16:32:53.368241+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '79821c0d-15a7-47ae-a2e0-228d653ac759', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Pra mim, saber que fui criada à imagem de Deus significa que  tenho valor e propósito.', '2026-03-30 15:29:54.118311+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e692cc2c-bb1a-4b6f-a4ff-d8aff215b96a', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Eu preciso parar de me diminuir e lembrar que tenho valor em Deus.
Também quero tratar melhor as pessoas, com mais amor, respeito e paciência.', '2026-04-10 19:30:37.550097+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '99a1aba7-722b-4ad8-bd5a-b6a608338af9', '7640c7e4-6780-4c27-8a04-ae5ab375f580', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q1', 'Que eles não morreriam se comecem o fruto. Falta de fé , confiança e desvia do caminho. ', '2026-04-21 13:47:59.518981+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5e549f99-8ffc-45a3-9fd0-cb996ff8533b', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'prayer', 'Deus, obrigado por tudo que o Senhor me ensinou hoje. Me ajuda a lembrar que meu valor vem de Ti e não das outras coisas. Quero confiar mais em Ti e melhorar a cada dia. Amém.', '2026-05-02 01:04:11.80435+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2b16cac3-11cd-45ac-808f-333962c6a7dc', '2dcc9a0e-accc-42df-8c78-5577fc2669db', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'icebreaker', 'A pobreza ', '2026-04-21 01:34:48.438556+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2a52860e-54c8-4042-9186-38c38a66b1dc', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q4', 'Porque ele morreu por nossos pecados', '2026-04-21 01:37:10.601995+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3226d66c-e3d4-482f-ac45-5e7597edc6f4', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'icebreaker', 'Carinhosa alegre e gentil ', '2026-05-02 02:25:54.071941+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c5f97436-7ffa-46a7-bf15-187985239d1a', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'practice', 'Ficar mais atenta na escola e não ser tão teimosa ', '2026-04-20 23:51:05.057612+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a85fddf5-844d-4848-9b30-94bd838c22d3', '985bc110-c90a-4762-8b1b-7b081e0c6863', '9158db48-16c3-468f-8c86-153999294c8f', 'q2', 'Primeiro, algo que representa uma certa complexidade, que exige um pouco de esforço para compreensão. Mas também o fato de que ele é muito mais do que qualquer ser humano. ', '2026-04-12 11:05:07.523896+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8d774e05-a2a8-4c16-b73f-68a387ea8327', '985bc110-c90a-4762-8b1b-7b081e0c6863', '9158db48-16c3-468f-8c86-153999294c8f', 'q3', 'Que eu dependo totalmente dele, e não de mim. Porém, isso não afasta o meu comprometimento em buscar a este Senhor, e consequentemente querer fazer boas obras. Boas obras não por objetivo final, mass como consequência do grande amor de Cristo.', '2026-04-12 11:06:37.22112+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8de01fb4-9b39-448e-9ed0-f377b0713de3', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'icebreaker', 'Eu eliminaria as guerras', '2026-04-20 22:28:01.845811+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a41fd801-a024-467d-a358-efa63e56ec75', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'prayer', 'Oi Deus, hoje aprendi que seguir você é muito importante e se manter sempre longe do pecado.', '2026-04-20 23:20:53.777093+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a1b8dcd8-9094-497e-91b9-727789780a6a', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'icebreaker', 'Forte, alegre e amigável.
', '2026-05-11 21:37:31.992658+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '610a46fa-1e90-4438-b000-497630287378', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '67a5341d-a934-4387-a16c-1802e3e7b092', 'q0', 'Saber que Cristo esta em nós ', '2026-05-01 20:28:42.744048+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd7f3f055-f07b-4151-bf7a-53ae9d0fa69b', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'prayer', 'Pai nosso q estais no céu santificado seja o vosso nome seja feita nossa vontade assim na terá como no céu o pão nosso de cada nos daí hoje em nome de Jesus amém ', '2026-04-26 14:57:00.649611+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ca13ed6c-604a-4db9-8ee7-db8551ba8b6c', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q0', 'O problema das guerras sem nenhum motivo, poderíamos todos viver em paz e comunhão.', '2026-04-21 21:54:21.852354+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1b4bff52-2274-4949-87d8-a440ae9d2963', '985bc110-c90a-4762-8b1b-7b081e0c6863', '9158db48-16c3-468f-8c86-153999294c8f', 'q4', 'Procurar ser conforme ele nos ensinou com as pessoas ao meu redor. Desde as pequenas atitudes até às grandes decisões. ', '2026-04-12 11:07:58.941233+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '38ae82d9-2c5b-48eb-a219-ade8e474249b', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q3', 'Pois nada disso é para sempre, mas Deus, Deus sim é pra sempre, e as pessoas devem buscar se identificar por Deus não por outras coisas.', '2026-04-20 22:46:59.820253+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3fdaef1c-6fe7-46ae-b713-6c267df78371', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'practice', 'Vou tentar aplicar está prática essa semana', '2026-05-02 02:05:43.084165+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '89d59098-9f92-4e93-b628-2ba4e07bf32a', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'icebreaker', 'Doenças/gripe', '2026-05-02 10:58:14.833461+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '791fa58b-9c77-492c-8139-d9c065541395', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q2', 'As pessoas só pensam nelas mesmas', '2026-04-26 14:55:04.165149+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd8b36a50-73c8-4701-98dd-307ff72cc8d4', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'icebreaker', 'Drogas ', '2026-04-21 19:16:44.87505+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b46e690b-ff12-4bc4-90e2-62ab7937d069', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '67a5341d-a934-4387-a16c-1802e3e7b092', 'q0', 'Quer dizer que deixamos pra trás as coisas velhas ,os erros e vivemos coisas novas da maneira correta. ', '2026-04-24 01:04:07.052074+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '676c5b6c-e28f-4ec3-8780-62c4f21783b1', '2f773751-38c2-45a1-8ee0-f5b856092730', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'icebreaker', 'As brigas entre os seres humanos.', '2026-05-02 13:50:30.943685+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '881c1690-998c-41f4-81bb-1d5ed0904056', '4d062445-4744-4007-a2ac-d7c4743fc979', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'practice', 'Sim', '2026-04-20 21:53:32.070676+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f6529850-5c88-47a3-b115-988200a2e88e', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'prayer', 'Senhor Deus obrigado pelo seu imenso amor e por cuidar muito bem da minha vida amém. ', '2026-05-12 14:10:58.073546+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0305ab9e-f844-4b15-8c66-fa06a194e0bc', '9289d1ce-a632-4cd7-930e-73023e549ec5', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q0', 'Egoísmo e preconceito', '2026-04-20 19:59:36.643554+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd6907e17-85f7-4d09-8945-804306389fba', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '67a5341d-a934-4387-a16c-1802e3e7b092', 'icebreaker', 'Veria como seria essa vida nova
', '2026-04-24 21:22:48.651424+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1bbdda34-633d-4f5e-b559-f2a369b5647e', '32a9f112-1192-4b2a-918f-c2895a76ade3', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q1', 'Pois Deus é poderoso, pois se entendermos errado, podemos nos afastar dele', '2026-04-23 00:41:44.066104+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6ea7ce75-37a4-415a-9c4f-c86c56ac18af', '66b31cf2-7782-4253-98ea-3b6d631703a4', '67a5341d-a934-4387-a16c-1802e3e7b092', 'q2', 'Lendo a Bíblia ', '2026-04-26 21:46:26.564612+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9db3484d-0786-41fc-b20b-663682446aa3', '7640c7e4-6780-4c27-8a04-ae5ab375f580', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q2', 'Que isso é ser contra outras opiniões alheias e só concorda com si mesmo .', '2026-04-21 13:49:56.737697+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd0890456-3962-49fe-86a2-609f63492cfd', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'practice', 'Deus nunca me abandona, eu sou filho de Deus e sou amado por ele', '2026-04-03 16:58:20.9136+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a589cf8c-0694-414f-8015-18d7aaf743fb', '1526dc8b-a92a-4a44-b358-b6a3083d0143', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q4', 'O cuidado e a proteção que ele nos dá todos os dias', '2026-04-21 13:31:20.355025+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5d7ae464-aeab-4f94-bf4a-67d87b9308e7', '2dcc9a0e-accc-42df-8c78-5577fc2669db', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'practice', 'Encontrar minha identidade no mundo', '2026-04-21 01:38:27.517614+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e597716f-b555-4ada-9137-f8d11a10b11c', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q2', 'Que as pessoas acham que o mundo gira ao redor delas mesmas.', '2026-04-21 22:22:54.50068+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '157fe52d-beee-4fc2-aa9e-39ec51497df8', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'practice', 'Bem nisto ', '2026-04-22 02:12:37.740326+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '593caf93-bbf1-4537-8c96-91455020590c', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q0', 'O mundo está cada vez mais injusto ', '2026-04-22 02:04:41.431605+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cdcd9cad-0d31-4546-b397-aad1d37ce958', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q4', 'Fazer as escolhas de Deus ', '2026-04-23 01:45:08.127471+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '17cadd62-c190-4e49-89ab-2516608d560a', '2dcc9a0e-accc-42df-8c78-5577fc2669db', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q0', 'A pobreza ', '2026-04-21 01:35:25.583551+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd29653d8-6f68-4082-8e33-91c0d7a5d2c4', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Eu me enxergo bem por isso que eu sou a imagem representada a deus como ele me criou', '2026-04-12 16:33:21.635576+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f8c676fd-6120-435a-b28e-78114b0e21d1', '9289d1ce-a632-4cd7-930e-73023e549ec5', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q1', 'Porque desvia a pessoa ao caminho para Deus', '2026-04-20 20:00:04.610076+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ab97bb94-402c-4c47-bf1d-b5ad1e5b2199', '2f773751-38c2-45a1-8ee0-f5b856092730', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q0', 'O sofrimento das pessoas, morte, doenças.', '2026-05-02 13:52:06.36512+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'af6d5ad6-3d8d-49e3-ac7b-49f2a8c7f33a', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '725a9760-296a-4477-a84f-4603d2046fe6', 'q0', 'Muitos sentimentos personalidade ativa raiva feliz triste e ansiedade', '2026-03-30 18:02:21.549408+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '828ac945-9290-4257-834f-090ecf0e26e8', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Fomos criados por eles', '2026-03-30 18:02:39.717015+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0ae8d209-079d-48df-a4ad-7bda63b9aa68', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'icebreaker', 'As pessoas perdidas....queria que todas as pessoas crêem em meu Deus,e estivessem salvos', '2026-04-20 12:07:56.984075+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3f151ec1-9a6a-4188-b30a-25cfc1e949a7', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'N entendi', '2026-03-30 18:03:17.545984+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '185dee26-5dac-4842-9673-9197b58eae43', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '725a9760-296a-4477-a84f-4603d2046fe6', 'q3', 'Na ansedade', '2026-03-30 18:04:25.333895+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e595f672-8690-4c4c-a872-c65a6207b7fd', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '67a5341d-a934-4387-a16c-1802e3e7b092', 'q1', 'É ter a certeza de que Cristo sempre está comigo em todos os momentos da minha vida.', '2026-04-24 01:05:46.650385+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '208d0c98-670d-4702-a1e8-ce75bb64ed37', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q0', 'Violência ', '2026-05-02 00:54:13.230368+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c730131d-9856-4f3e-892d-de7cf96978c2', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'practice', 'Trabalhar minha timidez e conversar com outras pessoas.', '2026-04-21 22:25:46.533208+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '66e63734-2e2f-4129-b413-f8cc5d2f26f7', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '725a9760-296a-4477-a84f-4603d2046fe6', 'q4', 'Ser mais sociavel', '2026-03-30 18:05:22.225026+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4814cb18-3d63-4178-9d33-be0cbe21ea2f', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q4', 'Faz diferença porque nos lembra quem realmente somos, nos dá segurança e ajuda a viver melhor, confiando em Deus.', '2026-04-11 16:53:51.798549+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '64e30d0e-6bb4-4046-9371-3dc5280f3824', '9289d1ce-a632-4cd7-930e-73023e549ec5', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'icebreaker', 'Introvertido, engraçado, amigável', '2026-05-12 19:20:40.650679+00', '2026-05-13 22:07:56.945718+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7a1651ee-41df-4105-b5cf-5a55511b4372', '914b898d-24a3-46ad-a764-d2f24e5115d1', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'icebreaker', 'Gentil,teimosa e amiga ', '2026-05-11 23:18:20.496358+00', '2026-05-19 23:35:48.583645+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e5f577b5-a96e-4aa7-81f6-f7e591b2b3b6', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', 'Senhor Jesus obrigada por tudo que tu faz por mim e minha família, pela saúde, minha casa, o alimento, por mais um dia de vida, obrigada por esse dia maravilhoso, por favor nos dê muita saúde alegria, e que amanhã seja um dia tão bom quanto esse, que eu consiga realizar meus sonhos mas que seja feita a tua vontade, deixo tudo em tuas mãos, em teu nome que eu oro, Amém!', '2026-03-30 22:58:48.439631+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c94186df-301f-4ffc-90e1-2eb724fc51a7', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '725a9760-296a-4477-a84f-4603d2046fe6', 'q1', 'Para mim significa que por sermos criados a imagem de Deus, devemos sempre tentar melhorar, e buscar ser uma boa pessoa.', '2026-03-30 14:57:19.495535+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.lesson_responses (
  id, user_id, lesson_id, question_key, response, created_at, updated_at, awarded_points, override_release_id, church_id
)
VALUES
(
  '17d06f8b-4449-4299-b95e-4d30b4deffad', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '725a9760-296a-4477-a84f-4603d2046fe6', 'q2', 'Sei que sou muito valiosa para Deus por isso busco ter boas atitudes e ter uma postura cristã', '2026-03-30 14:58:13.674769+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4fbb43d8-5226-41d3-af9f-4133a988252f', '2dcc9a0e-accc-42df-8c78-5577fc2669db', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'prayer', 'Obrigado senhor por tudo oque você me da e cada pedaço de coloca que você me oferece amém ', '2026-04-21 01:38:45.448017+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f5cc174a-5033-4ad9-a47a-0abaab45e6fc', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'icebreaker', 'As guerras e a paz mundial ', '2026-05-02 01:59:12.684644+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0bc524d1-14dc-4022-8823-1273078a8da1', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q3', 'Por q isso n faz bem para uma pessoa ', '2026-04-26 14:55:41.852936+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '451f5e8f-fdc8-4fdd-86c7-e41e348480a2', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'prayer', 'Deus obrigado por ter misericórdia de nós e nos amar mesmo sendo falhos. Amém ', '2026-05-02 02:06:01.282587+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'db94598e-bd43-4d54-ae8f-be5abcc451c6', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q3', 'Porque essas práticas são formas temporaveis das pessoas máscarar seu caráter e caem em momentos de dificuldade.', '2026-04-20 23:12:32.843837+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'af2b4dc0-16f0-4012-a9ab-0b838bf8d8af', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '725a9760-296a-4477-a84f-4603d2046fe6', 'practice', 'Ter mais cuidado nas minhas ações ', '2026-03-30 13:44:27.084722+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e59d00df-22c0-42eb-b18f-ea192c3165cc', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '725a9760-296a-4477-a84f-4603d2046fe6', 'prayer', 'Obrigada meu Deus pelo seu imenso amor por mim e por cuidar da minha vida Amem.', '2026-03-30 13:49:13.125851+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ba08bbdd-9682-436e-ab2e-397a8714f1f8', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'icebreaker', 'Que o mundo acreditasse em só um DEUS ', '2026-05-02 15:07:03.735252+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '39e4ad8c-3b0f-42f9-a436-c0d2f1a7d926', '4d062445-4744-4007-a2ac-d7c4743fc979', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q4', 'orando e crendo nele', '2026-04-20 21:53:48.172242+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'af8e0927-92e3-47f2-b9d1-05a5ae890124', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'icebreaker', 'Tristeza ', '2026-04-20 23:36:11.377709+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '06e2544d-28a9-45ac-b1ad-54b329dce362', '66b31cf2-7782-4253-98ea-3b6d631703a4', '67a5341d-a934-4387-a16c-1802e3e7b092', 'icebreaker', 'Ter mais confiança ', '2026-04-26 21:44:37.27579+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '259b4167-4f07-40bb-a580-14a86edd25ea', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q0', 'Guerras, assassinatos, separação de pessoas...', '2026-04-20 22:31:08.544359+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9157bf79-7f9a-4760-b26c-372d8d576a22', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q4', 'A diferença é que quando lembramos de Deus nos arrependemos dos nossos pecados e tentamos não comete-los novamente ', '2026-04-20 22:50:16.79522+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9a6dd213-93ee-48e1-b7cd-7e38e855bf35', '66b31cf2-7782-4253-98ea-3b6d631703a4', '67a5341d-a934-4387-a16c-1802e3e7b092', 'practice', 'Tirar notas boas na prova ', '2026-04-26 21:47:09.844028+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5fbe03fa-d778-4191-a6c3-6cce343fb69a', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q2', 'O egoismo', '2026-04-21 01:35:31.361266+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '02737634-fb4f-469e-8e53-ddc36b472d85', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'prayer', 'Querido Deus muito obrigada por tudo
Que tu tem nos dado, continue nos protegendo e abençoando, nos livre de todo mal amém ', '2026-04-22 02:12:53.205872+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3e4541bb-f759-45e4-a21f-ccc544fecccc', '32a9f112-1192-4b2a-918f-c2895a76ade3', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'prayer', 'Querido Deus, obrigado por tudo, abençoe minha família , amigos, e que este dia seja muito bom, amém', '2026-04-23 00:44:43.625803+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bb52b846-6691-4290-869e-66e158dd186b', '7640c7e4-6780-4c27-8a04-ae5ab375f580', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'practice', 'Ser melhor com os outros mas ser eu mesma .', '2026-04-30 23:49:39.868537+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '738008a7-f93c-4ca0-96a9-01939ce05b36', '7640c7e4-6780-4c27-8a04-ae5ab375f580', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'icebreaker', 'A desigualdade social ', '2026-04-21 13:48:07.867083+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9ebd85ff-edf8-4ce9-be50-f6df64c734bc', '1526dc8b-a92a-4a44-b358-b6a3083d0143', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'practice', 'Ser uma pessoa melhor ', '2026-04-21 13:32:20.545893+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'abc10cbb-6934-4352-803e-d11f6cc4faa5', '1526dc8b-a92a-4a44-b358-b6a3083d0143', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q0', 'Com o relacionamento de  deus ', '2026-04-21 13:18:02.801057+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f6bb13b5-4a62-461d-920f-52562bbe1722', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q1', 'Não sei muito bem mas acho que é porque  está duvidando de Deus ', '2026-04-23 01:46:19.630039+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1cbab0ca-ac59-4ae4-b96e-90a88f6e9f48', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'prayer', 'Obrigada por tudo..pela dia de hoje e pela família 
Pella escola e amigos, professoras...', '2026-04-20 23:51:57.641128+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fd0642ef-bbee-4b8e-8b66-f549f5383e97', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q0', 'O relacionamento com Deus ', '2026-05-02 11:13:57.292821+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c4fcf20f-ff5b-477a-8559-35fa1316e04a', '32a9f112-1192-4b2a-918f-c2895a76ade3', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q2', 'Que nos somos pescadores mas temos que tentar não pecar', '2026-04-23 00:42:34.448654+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '31659016-772d-4fc8-b40a-6655b121d50a', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q3', 'Por que a aparência muda, tudo muda, e não podemos contar com isso.', '2026-04-21 22:02:16.833332+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7e5bb604-716d-44d4-acdd-01b7206be635', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q4', 'Essa semana eu posso lembrar disso lendo a Bíblia, orando e repetindo que minha identidade está em Cristo, não no que os outros pensam.', '2026-05-02 02:22:08.302172+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4302b3ef-f10d-4786-a19e-5f105d8cc2b3', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q2', 'Que todo mundo só faz a sua vontade e não a de Deus ', '2026-05-02 11:20:26.204679+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '94f51026-e627-427b-9dd4-9b95a94ef486', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q1', 'Porque a partir que não  confiarmos mais em Deus não teremos mais salvação
', '2026-05-02 11:14:19.656633+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'dc999d9f-2d83-49c0-9ba8-b633cbb50111', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q1', 'Pois o mal é muito tentador, deixando o mal prevalecer ', '2026-04-22 02:05:28.669558+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'db64c36d-a93a-4cfd-a94b-0bf09736775a', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q2', 'viver focado em si mesmo, colocando seus interesses acima de Deus e dos outros.', '2026-05-02 00:58:13.418494+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1af73683-9175-42a0-b67b-d876bc3215aa', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q3', 'Porque essas coisas mudam e acabam, então não conseguem manter a identidade por muito tempo.', '2026-05-02 00:59:55.806959+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8f49d36f-7d16-4ae3-ab3c-331c02d475a5', '2dcc9a0e-accc-42df-8c78-5577fc2669db', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q4', 'Que não preciso de fama para ser fiel a deus', '2026-04-21 01:37:50.057217+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0896cc7e-5bd5-4f85-a232-429c5ab7201e', '2f773751-38c2-45a1-8ee0-f5b856092730', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'practice', 'Minha identidade está muitas vezes na dependencia de ser bem sucedido.', '2026-05-02 13:55:06.882022+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e977cceb-11ca-4efd-9f25-764e161b3164', '2f773751-38c2-45a1-8ee0-f5b856092730', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q1', 'POrque duvidamos que Deus é bom. Duvidamos que ele nos ama.', '2026-05-02 13:52:50.632852+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0129c138-a7d8-4320-a4b2-b9d0e56e303c', '2f773751-38c2-45a1-8ee0-f5b856092730', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q2', 'Que só pensamos em nós mesmos.', '2026-05-02 13:53:18.448242+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '61675e82-e739-48f3-96ca-1dc81aaf2c12', '9289d1ce-a632-4cd7-930e-73023e549ec5', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'practice', 'Não se comparar,se sentir mais seguro,feliz,e menos pressionado pelos outros', '2026-05-12 19:28:58.561588+00', '2026-05-13 22:07:56.945718+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bac60ea8-9926-40df-8afc-31884cbc6d6c', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q2', 'O que mais me chamou atenção é que nossa identidade vem de Deus, não do que fazemos ou do que os outros pensam ', '2026-05-02 02:24:48.150321+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9cb4f7e9-1e1d-4a82-925e-fab677dc6414', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'practice', 'Quero conhecer mais sobre Deus ', '2026-05-02 11:28:16.89945+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '27d098ed-fb41-464f-b04b-49e9557ec180', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'practice', 'Não mentir ', '2026-05-02 15:21:30.154963+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1fc5664f-19d9-436d-963a-cf50bde1ea73', '2f773751-38c2-45a1-8ee0-f5b856092730', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q4', 'Não somos o que o mundo diz e nem precisamos tentar descobrir sozinhos quem somos, mas é Deus quem diz que somos. E ele sabe como nos criou e tem a melhor identidade .', '2026-05-02 13:54:13.337077+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b1573291-5e59-46f8-90e7-cd3c8ad0752e', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q0', 'Guerra ', '2026-05-02 15:13:34.28749+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '22693fde-a518-4f13-83f1-9599f9280e78', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q1', 'Por  Adão e Éva acreditarão no satanás e não em Deus ', '2026-05-02 15:19:02.830666+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c6a02ad4-07b2-4c7a-a750-f7fbef31a69d', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'practice', 'Essa semana eu vou escrever verdades sobre quem eu sou em Cristo e ler todos os dias. Quero lembrar que sou amado, perdoado e nova criação, e não deixar que a opinião dos outros defina quem eu sou', '2026-05-02 02:23:21.059573+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3a003086-0ba3-4940-b50b-c2a5e3adf589', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'prayer', 'Senhor Deus, Obrigado porque o Senhor nos criou, nos ama e não nos abandonou mesmo quando o pecado entrou no mundo. Obrigado porque Jesus veio para nos salvar, nos perdoar e nos dar uma nova identidade. Ajuda-nos a lembrar que não somos definidos pelo que os outros pensam, pelo que sentimos ou pelos nossos erros, mas pelo teu amor e pela tua graça. Ensina-nos a viver como teus filhos, confiando em quem somos em Cristo. Acompanha-nos nesta semana e fortalece nossa fé. Em nome de Jesus, Amém.

', '2026-05-02 02:20:31.37416+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '028b4026-7e5f-40c9-b684-ab9bf2799cfd', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q3', 'Porque só a identidade em Deus dura para sempre ', '2026-05-02 11:22:06.164074+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5abaf2fa-6bbd-48c7-b22b-9e9bae630d01', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q4', 'Que a nossa identidade foi Jesus Cristo que fez,só precisamos aceitar ela ', '2026-05-02 11:24:31.90928+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '984a2343-c9f4-4721-af0d-e20901664aa9', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q2', 'Como os reis e rainhas eles são seres humanos em e tem gente que se curva a eles', '2026-05-02 15:14:56.190817+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd24b4c56-93c9-4094-b505-9a48c3d48264', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q3', 'Por que ela vira famosa e depois tem outra igual a ela', '2026-05-02 15:17:05.56025+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9f6d079e-e793-4e6e-bd5a-eaef5a1e55d6', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q4', 'Que a gente comessa a praticar o amor de Deus ', '2026-05-02 15:18:10.568557+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f642a5aa-d174-4e2b-93bc-aca5d20e3da8', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q1', 'Acho que mais atrapalham, porque fazem a gente se comparar e buscar aprovação dos outros, em vez de entender quem somos de verdade.', '2026-05-02 02:24:46.335601+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1d398df9-f194-4b48-a250-0ad21cc89a3a', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q3', 'Porque essas coisas são passageiras e não mostram quem a pessoa realmente é, então não conseguem sustentar a identidade por muito tempo', '2026-04-11 16:47:19.839696+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b077d2c5-8aef-43fb-95ac-9f404cc0f610', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q2', 'Pessoas que só pensam em si e o próprio bem estar, ao invés de pensar em Deus e ao próximo.', '2026-04-20 23:07:33.347343+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e9de89b6-2794-492d-8f70-61f817980597', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q3', 'A pessoa passa a viver com mais segurança, paz e propósito, sem depender da opinião dos outros.', '2026-05-02 02:25:53.026979+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0e9f49f8-9872-4434-a837-77362ec102d0', '2f773751-38c2-45a1-8ee0-f5b856092730', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q3', 'POrque vamos ter que nos moldar o tempo todo a opinião das pessoas e cada pessoa tem uma opinião diferente.', '2026-05-02 13:53:28.875916+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '39e734ec-1ebf-46e4-bddf-04adb0ef1e00', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q0', 'As pessoas costumam buscar identidade na aparência, nas redes sociais, na opinião dos outros e no sucesso.', '2026-05-02 02:23:46.12977+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6da3ee65-2fe1-4908-977b-dac4e5ad7c4f', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q4', 'Para que possamos estar firmados em Deus e assim nos afastarmos do pecado o máximo possível. E quando percamos termos a oportunidade de reconhecer e clamar por perdão. ', '2026-04-11 14:35:17.582224+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '452c33cf-c46f-4c81-90d9-a538276eb371', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'prayer', 'Senhor me ajuda a não pecar ', '2026-05-02 15:21:45.554605+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c7e34b75-7130-4456-bf88-52238da61c6c', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q2', 'Quando  o ser humano vive curvado a si mesmo significa que ele vive fazendo só o que ele tem vontade e não seguindo o que é correto pra Deus', '2026-05-02 02:02:22.351929+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b9f0ea83-c9b8-4d6e-b6d9-2d867788e19a', '7640c7e4-6780-4c27-8a04-ae5ab375f580', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'prayer', NULL, '2026-05-02 19:25:38.685638+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b1ba7463-4c60-4b80-abb8-9a941906bd23', 'a608622c-4120-4d15-949f-235ca64db2cf', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'icebreaker', 'Qualquer tipo de maldade contra animais ou pessoas ', '2026-05-03 12:21:16.227723+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0de57811-577d-4f0b-9223-fdb5fcc2ac5f', 'a608622c-4120-4d15-949f-235ca64db2cf', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q0', 'A maldade das pessoas', '2026-05-03 12:28:56.702855+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '24fbd351-e191-48a7-abe6-9acf4d1af233', 'a608622c-4120-4d15-949f-235ca64db2cf', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q2', 'Que ele carrega o pecado', '2026-05-03 12:29:30.23156+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f9938d5b-a2ad-4558-a5a1-d85cfbfd727c', 'a608622c-4120-4d15-949f-235ca64db2cf', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q3', 'Pq a verdadeira identidade vc recebe de Deus', '2026-05-03 12:29:48.512974+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '46b627e8-c94d-435c-9aa4-4f9165bb178d', 'a608622c-4120-4d15-949f-235ca64db2cf', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q1', 'Por que quebra confiança ', '2026-05-03 12:29:08.314459+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '95cb70b1-0337-4db5-8022-bdb0f0fcb3a7', 'a608622c-4120-4d15-949f-235ca64db2cf', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q4', 'Faz nos refletir ', '2026-05-03 12:30:15.898234+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bbb886d4-edfb-406c-8260-6c1d6cbd139c', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '67a5341d-a934-4387-a16c-1802e3e7b092', 'q1', 'Mais amor, paz, mansidão, etc', '2026-05-02 19:33:49.866202+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e2eeff0f-8bc6-4857-88a8-5b3a50f23fc1', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '67a5341d-a934-4387-a16c-1802e3e7b092', 'q2', 'Levar a palavra com obediência e responsabilidade ', '2026-05-02 19:33:57.632207+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '16be23c8-7890-4c38-a271-bfd2f2a31166', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '67a5341d-a934-4387-a16c-1802e3e7b092', 'practice', 'Estarei mais disposto a seguir a palavra de Deus e aprender mais com ele', '2026-05-02 19:35:24.07353+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'eba8fce7-4a55-4c00-9352-967baa1e3bd5', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '67a5341d-a934-4387-a16c-1802e3e7b092', 'prayer', 'Senhor Deus, abençoe todos e os leve saúde. Que minha vida esteja disposta a fixar em ti. Amém ', '2026-05-02 19:34:53.776917+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f8324c1a-e957-4b1e-8fe6-325e99fde291', '1526dc8b-a92a-4a44-b358-b6a3083d0143', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'icebreaker', 'A discriminação racial a pobreza  pessoas passando fome ', '2026-04-21 13:12:04.640123+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '94805761-237a-4629-a254-fa1641566b41', '914b898d-24a3-46ad-a764-d2f24e5115d1', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q0', 'Nas atitudes', '2026-05-11 23:20:38.970262+00', '2026-05-19 23:35:48.583645+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5227de0e-7a69-4b99-8ba8-566392fe76dc', '914b898d-24a3-46ad-a764-d2f24e5115d1', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q1', 'Atrapalham...porque tem muita coisa errada', '2026-05-11 23:21:05.898029+00', '2026-05-19 23:35:48.583645+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '04932886-a9f4-4281-b564-d26c05f17f70', '914b898d-24a3-46ad-a764-d2f24e5115d1', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q2', 'Que fui salva', '2026-05-11 23:22:12.02683+00', '2026-05-19 23:35:48.583645+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5ca9bba5-9e5a-4dd3-b044-a1bf50cdfefb', '1526dc8b-a92a-4a44-b358-b6a3083d0143', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'q2', 'Isso atinge na nossa forma de viver,consumir e nós relacionar ', '2026-04-21 13:28:45.129637+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd8f5924d-51b6-4708-8035-e0e1d1f36cea', 'a608622c-4120-4d15-949f-235ca64db2cf', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'practice', 'Vou seguir melhor agr que aprendi cm essa lição ', '2026-05-03 12:31:29.574715+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '60ded4ee-c499-4cee-bc07-1ca90f435ac4', 'a608622c-4120-4d15-949f-235ca64db2cf', 'afb407be-cc20-47bf-8714-d8a4a19d83cc', 'prayer', 'Senhor, agr eu sei que minha identidade na vdd vem de vc', '2026-05-03 12:31:53.709577+00', '2026-05-13 12:53:51.627337+00', 0, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5a090415-6574-4011-ad58-b0ff44e38334', '9a0c5687-f135-4377-a410-58592ef8737a', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q0', 'Aparência,popularidade,sucesso,opinião dos outros e sentimentos 
', '2026-03-24 01:13:03.01547+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cdb3c029-8155-4020-a489-64cb2d591e47', '32a9f112-1192-4b2a-918f-c2895a76ade3', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'icebreaker', 'Bondosa, cozinheira, criativa', '2026-05-11 15:36:00.717045+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1f452e34-8aaf-4c72-a73b-62a0f261a679', '32a9f112-1192-4b2a-918f-c2895a76ade3', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q0', 'Na internet', '2026-05-11 15:36:32.760595+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ed8e99dd-6356-4b0a-8a79-3bf2eb8fff0f', '32a9f112-1192-4b2a-918f-c2895a76ade3', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q1', 'Sim, pois elas podem ser enganadas pelos seus seguidores e etc', '2026-05-11 15:36:44.219257+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cd4e2708-87b4-4ef5-a24b-b4eaf8a98ad5', '32a9f112-1192-4b2a-918f-c2895a76ade3', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q2', 'Me chamou a atenção de que eu sou filha de Deus e só isso basta para mim', '2026-05-11 15:37:18.584045+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '372cdb92-940a-4714-949f-fa6dc76c2e1c', '32a9f112-1192-4b2a-918f-c2895a76ade3', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q3', 'Ela vive com mais claresa', '2026-05-11 15:37:52.575852+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f8d1b757-d9f5-4d08-8ec2-4051217ecf02', '32a9f112-1192-4b2a-918f-c2895a76ade3', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q4', 'Posso não ligar para o que os outros dizem e orar mais para Deus', '2026-05-11 15:38:01.702321+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e82bae5d-98be-4622-8508-958306e533c3', '32a9f112-1192-4b2a-918f-c2895a76ade3', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'practice', 'Planejo viver uma semana de graça e felicidade', '2026-05-11 15:38:34.26839+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cb379852-688d-4e4e-98e4-2306b82e1680', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'icebreaker', 'Engraçada, legal, cristã ', '2026-05-11 20:41:03.760756+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '36861977-a829-4087-897b-7812a12078ee', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q0', 'Quando estão em alguma confusão, na escola...', '2026-05-11 20:43:37.455767+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a91cf981-923c-40e0-b52f-b1af309e8669', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q1', 'Atrapalham, pois ficam se comparando com pessoas "famosas" e tentam agir como elas, mas a maioria é tudo atuação', '2026-05-11 20:44:29.838186+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4fa30e38-19f7-414a-8b63-933e44904da4', '32a9f112-1192-4b2a-918f-c2895a76ade3', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'prayer', 'Querido Deus, abençoe todos que amo e quem nem conheço, obrigado por tudo, perdoe meus pecados amém', '2026-05-11 15:38:49.893901+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f5edb0cb-6de1-4722-9bb6-ee24d571d110', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q2', 'Faz com que a gente pare e pense, Deus criou a gente assim, não devemos nos encaixar no padrão do mundo e sim no padrão de Deus!', '2026-05-11 20:46:55.955433+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '376d4d5b-f711-4e39-9125-7f1ddbd7f1a5', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q3', 'Faz com que ela tente sempre fazer o melhor, e nos faz ter mais paz no coração ❤️ ', '2026-05-11 20:48:11.301509+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ff2f1b18-e107-482a-b1b8-fdd3e6ace446', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'icebreaker', 'Tímida,legal e esforçada ', '2026-05-11 16:21:54.555429+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e4b20788-b607-4c4c-83f2-ae8627bad840', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q1', 'Acho que atrapalha, por que as pessoas querem ficar se comparando com os outros', '2026-05-11 16:22:59.49689+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fd199a7f-ecc9-45ad-b310-d4c5b8903d6a', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q2', 'Que posso ser eu mesma', '2026-05-11 16:23:29.097824+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'edd6cf1e-f0c4-4d08-b431-40a6475183f3', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q3', 'Ela vive mais leve ', '2026-05-11 16:23:50.022341+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f5f7c8f0-3eba-46ef-a9dc-7537298453aa', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q4', 'Pensar que eu sou filho de deus', '2026-05-11 16:24:13.850228+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '84f74f37-bb5e-4a1d-a649-f9aab9c43345', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'practice', 'Pensar q sou filha de deus', '2026-05-11 16:24:44.999139+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f315186b-d646-49d6-b98c-d3794b1e2e30', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'prayer', 'Obrigada senhor por tudo que você me deu e abençoe a todos que são verdadeiros e me amam , amém ', '2026-05-11 16:24:56.450601+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3b566897-5d5b-4401-b529-9165bad42f31', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q4', 'Provar para as pessoas que sou filha de Deus e fui criada a imagem d''Ele', '2026-05-11 20:49:19.586131+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.lesson_responses (
  id, user_id, lesson_id, question_key, response, created_at, updated_at, awarded_points, override_release_id, church_id
)
VALUES
(
  'dcea1c7a-6f8b-4610-88a4-78bf6d5fdaf8', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'prayer', 'Senhor Deus obrigada por mais um dia maravilhoso, por essa semana abençoada e por mais um dia de vida, nos proteja de todo o mal, e que eu consiga realizar meu sonhos ! Mas que seja feita a tua vontade, amo você. Amém!', '2026-05-11 20:50:57.521941+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '244d2041-1490-44f3-9fff-d6883c302df6', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'practice', 'Sou feita a imagem dele, ele me criou desse jeito, e não devo me comparar com os outros porque quem me fez assim foi Deus.', '2026-05-11 20:50:53.613025+00', '2026-05-13 12:53:51.627337+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2c37d154-175f-495f-a155-eee67add2c5b', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'icebreaker', 'Amor,feliz e abençoada ', '2026-05-11 20:52:19.068937+00', '2026-05-18 21:23:08.84368+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4cac6f12-8651-4bda-843d-16ba3a744946', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q2', 'Por termos um pouco da aparência dele ', '2026-05-02 01:28:42.205387+00', '2026-05-19 23:11:23.819283+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a753acf4-1cbf-4d87-8a53-d4babada552b', '914b898d-24a3-46ad-a764-d2f24e5115d1', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'practice', 'Continuar firme na fé ', '2026-05-11 23:24:54.332966+00', '2026-05-19 23:35:48.583645+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b8d9d48a-59de-4619-afc1-a899738d08f5', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q0', 'Redes sociais ', '2026-05-11 20:53:30.479022+00', '2026-05-18 21:23:08.84368+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0c34a365-2896-4b34-bfa3-710e15f8a34c', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q1', 'Atrapalham', '2026-05-11 20:53:50.897729+00', '2026-05-18 21:23:08.84368+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0cadb5b0-c457-4c00-885f-babcf6ad6dcd', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q2', 'Por que mesmo se endo pecador podemos nos libertar e virar servos', '2026-05-11 20:54:10.317573+00', '2026-05-18 21:23:08.84368+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '871af462-ad53-4ed2-bf7d-0f6d7f514449', '914b898d-24a3-46ad-a764-d2f24e5115d1', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q3', 'Viver mais feliz e tranquila ', '2026-05-11 23:22:40.013911+00', '2026-05-19 23:35:48.583645+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1e28e69c-89cb-48f5-9933-5fbcab64dce3', '914b898d-24a3-46ad-a764-d2f24e5115d1', '3a71d37e-b366-41ca-b6ae-c8fc7f77b522', 'q4', 'Ajudar as pessoas com boas ações ', '2026-05-11 23:23:34.963361+00', '2026-05-19 23:35:48.583645+00', NULL, NULL, '02f08580-80e5-4f57-8a2e-1b078d337278'
)
ON CONFLICT DO NOTHING;

COMMIT;
