-- ARQUIVO: public_data_devotional_responses.sql

BEGIN;

INSERT INTO public.devotional_responses (
  id, user_id, devotional_id, question_index, response, created_at, updated_at, church_id
)
VALUES
(
  'f8bb4721-587b-40aa-af9f-96ad4867a04a', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '9bf5b69c-d399-4266-9e14-57570672ef33', 0, 'Se reder', '2026-05-13 19:55:04.678604+00', '2026-05-13 19:55:04.678604+00', NULL
),
(
  '0f001846-62da-4247-8e72-df4d6606657b', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'JESUSSSS', '2026-05-13 19:55:04.678604+00', '2026-05-13 19:55:04.678604+00', NULL
),
(
  'e31fcd96-7959-434d-a284-7fd132b35a4f', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '9bf5b69c-d399-4266-9e14-57570672ef33', 2, 'Poder ser reder', '2026-05-13 19:55:04.678604+00', '2026-05-13 19:55:04.678604+00', NULL
),
(
  'e0a92575-32e1-4838-babb-159d681f3c39', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 0, 'Ser nova criação é ter uma nova vida e identidade em Cristo.', '2026-05-15 00:15:45.507078+00', '2026-05-15 00:15:45.507078+00', NULL
),
(
  '184b1c3c-d208-4f9b-8751-2783ceb43fc6', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 1, 'Nosso passado não nos define porque Jesus nos perdoa e dá um novo começo.', '2026-05-15 00:15:45.507078+00', '2026-05-15 00:15:45.507078+00', NULL
),
(
  'dd538557-e85e-4592-8f0e-505c3a2c57fa', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 2, 'Cristo mudou nossa identidade, nos tornando filhos de Deus e perdoados.', '2026-05-15 00:15:45.507078+00', '2026-05-15 00:15:45.507078+00', NULL
),
(
  '04a814eb-ecc9-4307-bd07-1b25fd7d33ed', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 0, 'Teste ', '2026-05-16 14:23:36.924239+00', '2026-05-16 14:23:36.924239+00', NULL
),
(
  'def13d75-424e-4707-a4fe-a75fd0c57254', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 1, 'Teate', '2026-05-16 14:23:36.924239+00', '2026-05-16 14:23:36.924239+00', NULL
),
(
  '78605362-317f-4caa-835c-6efecee5ea43', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 2, 'Yes ', '2026-05-16 14:23:36.924239+00', '2026-05-16 14:23:36.924239+00', NULL
),
(
  '4d28724c-33ca-4678-b8e3-d72daddd584f', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '4923904c-0624-414c-a226-c0e44bf04174', 0, 'Ser filho de Deus significa saber que Ele me ama, cuida de mim e nunca me abandona.', '2026-05-19 01:22:42.284937+00', '2026-05-19 01:22:42.284937+00', NULL
),
(
  '25bec106-3c00-4e7a-986b-97062e5b4034', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '4923904c-0624-414c-a226-c0e44bf04174', 1, 'Um pai ama, protege, ensina, ajuda e acompanha o filho em todos os momentos.', '2026-05-19 01:22:42.284937+00', '2026-05-19 01:22:42.284937+00', NULL
),
(
  '5a4c1ca7-48ca-414a-8fdb-07217105370a', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '4923904c-0624-414c-a226-c0e44bf04174', 2, 'Isso muda nossa relação com Deus porque passamos a confiar mais nEle e saber que nunca estamos sozinhos.', '2026-05-19 01:22:42.284937+00', '2026-05-19 01:22:42.284937+00', NULL
),
(
  '130afabb-e835-4bd8-a011-9264b9d4f223', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 0, 'Identidade ', '2026-05-20 10:54:07.846055+00', '2026-05-20 10:54:07.846055+00', NULL
),
(
  '75df7ba0-3522-4779-b02a-3623d426c6cf', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 1, 'Ok', '2026-05-20 10:54:07.846055+00', '2026-05-20 10:54:07.846055+00', NULL
),
(
  '1814f13d-5204-402a-b4cc-4853df3334f1', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 2, 'De forma a agradar a Deus ', '2026-05-20 10:54:07.846055+00', '2026-05-20 10:54:07.846055+00', NULL
),
(
  '05434a0e-43fd-4c55-957a-0a37a5d61975', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '9bf5b69c-d399-4266-9e14-57570672ef33', 0, 'Significa tipo libertação ', '2026-05-13 20:47:23.071692+00', '2026-05-13 20:47:23.071692+00', NULL
),
(
  '912eee40-0c88-460c-9140-dda26d6326d5', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'Jesus', '2026-05-13 20:47:23.071692+00', '2026-05-13 20:47:23.071692+00', NULL
),
(
  'd8992dfc-e8ba-4b0c-bf6d-6abe1cfd6c0f', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '9bf5b69c-d399-4266-9e14-57570672ef33', 2, 'Viver com ele pertencendo a ele dar sua vida pra ele', '2026-05-13 20:47:23.071692+00', '2026-05-13 20:47:23.071692+00', NULL
),
(
  '0d08769b-77db-4500-b0ac-4609e465da39', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 0, 'Significa que Deus nos dá uma nova identidade e uma nova vida ', '2026-05-15 00:20:50.751584+00', '2026-05-15 00:20:50.751584+00', NULL
),
(
  '93cef754-38fd-4654-a5c0-c8ef7fe79815', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 1, 'Porque só o que nos define quem somos é o amor de Deus e a obra de Cristo ', '2026-05-15 00:20:50.751584+00', '2026-05-15 00:20:50.751584+00', NULL
),
(
  'b1ebe5fa-6393-4e27-a9a1-2217f7e478d3', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 2, 'Sim, antes vivíamos sem esperança e agora vivemos com esperança vivíamos culpados e agora vivemos perdoados', '2026-05-15 00:20:50.751584+00', '2026-05-15 00:20:50.751584+00', NULL
),
(
  '794134d3-0029-49a7-8238-ba0a3d98a078', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 0, 'Significa que Deus nos ama.', '2026-05-16 15:25:18.000716+00', '2026-05-16 15:25:18.000716+00', NULL
),
(
  'd284ded6-327e-4e56-81c9-95230b86b40a', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 1, 'Pois nós só podemos encontrar a salvação por meio de Jesus.', '2026-05-16 15:25:18.000716+00', '2026-05-16 15:25:18.000716+00', NULL
),
(
  'fe3fe0a1-9666-48be-8055-b9458e60190b', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 2, 'Traz descanso não preciso provar meu valor pra ninguém.', '2026-05-16 15:25:18.000716+00', '2026-05-16 15:25:18.000716+00', NULL
),
(
  '39cf712e-9b82-4776-8dc1-6ca16140db2a', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '4923904c-0624-414c-a226-c0e44bf04174', 0, 'Nunca ficar sozinho que ele cuida de nossa vida e nossa vida tem valor e propósito ', '2026-05-19 01:56:38.335175+00', '2026-05-19 01:56:38.335175+00', NULL
),
(
  '1c59c5a1-aeb1-417a-af60-893062505c8f', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '4923904c-0624-414c-a226-c0e44bf04174', 1, 'Cuida e acolhe', '2026-05-19 01:56:38.335175+00', '2026-05-19 01:56:38.335175+00', NULL
),
(
  '19d88bd9-37d1-472c-901a-fb12618d0168', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '4923904c-0624-414c-a226-c0e44bf04174', 2, 'Que Deus é uma das maiores coisas que a bíblia fala sobre nós.isso significa que Deus não é apenas um Deus distante,mas um Pai que nos ama, cuida de nós,perdoa e nos acompanha ', '2026-05-19 01:56:38.335175+00', '2026-05-19 01:56:38.335175+00', NULL
),
(
  'b5b85625-62f7-491e-a17f-8670c4f5511b', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 0, 'A identidade', '2026-05-20 12:46:24.86338+00', '2026-05-20 12:46:24.86338+00', NULL
),
(
  'dac131ee-29ca-482f-a264-a48a7abab41d', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 1, 'Com compaixão humildade e paciência ', '2026-05-20 12:46:24.86338+00', '2026-05-20 12:46:24.86338+00', NULL
),
(
  'c1a25265-b80c-4735-a0dd-63ac37192678', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 2, 'Viver tendo fé a ele', '2026-05-20 12:46:24.86338+00', '2026-05-20 12:46:24.86338+00', NULL
),
(
  'cd54b0c2-f271-4179-85ca-0d951483e920', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '9bf5b69c-d399-4266-9e14-57570672ef33', 0, 'A palavra redenção significa resgatar, libertar, comprar de volta.', '2026-05-13 20:51:55.957922+00', '2026-05-13 20:51:55.957922+00', NULL
),
(
  'b6e2f28d-9b73-4a16-8f7d-26a06c11741d', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'Nós éramos escravos do pecado, mas Jesus pagou o preço com sua própria vida na cruz para nos libertar.', '2026-05-13 20:51:55.957922+00', '2026-05-13 20:51:55.957922+00', NULL
),
(
  '39098991-3b71-4ef7-bc9c-399c7f02ac84', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '9bf5b69c-d399-4266-9e14-57570672ef33', 2, 'Viver sabendo que foi ele que nos salvou do pecado .
', '2026-05-13 20:51:55.957922+00', '2026-05-13 20:51:55.957922+00', NULL
),
(
  '09ee5a7b-aee5-4442-9819-9cea7b05ede1', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 0, 'isso não significa que a pessoa nunca mais vai errar ou que tudo muda de um dia para o outro', '2026-05-15 00:30:47.156441+00', '2026-05-15 00:30:47.156441+00', NULL
),
(
  'd32b51c8-2255-46e5-8d68-e05438776ff3', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 1, 'Ser nova criação significa que nossa história não é definida pelo nosso passado, mas por aquilo que Cristo fez por nós. ', '2026-05-15 00:30:47.156441+00', '2026-05-15 00:30:47.156441+00', NULL
),
(
  '23c1c969-90a4-47cd-8936-82ee1aa0d202', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 2, 'Que nos somos perdoados ', '2026-05-15 00:30:47.156441+00', '2026-05-15 00:30:47.156441+00', NULL
),
(
  '17cdf3e0-6bd8-42f3-ac5d-7f3672f024ba', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 0, 'Ser diferente dos que preferem seguir o mundo ', '2026-05-16 16:08:18.807568+00', '2026-05-16 16:08:18.807568+00', NULL
),
(
  'cdcb28cb-1bb1-44cf-a006-10a7a5606086', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 1, 'Porque oque passou passou ', '2026-05-16 16:08:18.807568+00', '2026-05-16 16:08:18.807568+00', NULL
),
(
  '63ff7b9f-57c3-4250-a762-e43c16d40bd3', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 2, 'Morreu para vivermos perto de Deus ', '2026-05-16 16:08:18.807568+00', '2026-05-16 16:08:18.807568+00', NULL
),
(
  '85ec8cb5-d1b5-4485-a33d-9c06919308e4', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '4923904c-0624-414c-a226-c0e44bf04174', 0, 'Significa que sou única e vim pra representar ele', '2026-05-19 02:10:44.5202+00', '2026-05-19 02:10:44.5202+00', NULL
),
(
  'd9613ec2-2df0-4649-8a4f-074eea48852e', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '4923904c-0624-414c-a226-c0e44bf04174', 1, 'Qualquer coisa', '2026-05-19 02:10:44.5202+00', '2026-05-19 02:10:44.5202+00', NULL
),
(
  '13dc2c5d-3840-4bc5-9ed0-3e014878c930', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '4923904c-0624-414c-a226-c0e44bf04174', 2, 'Muda que sabemos que nos somos filhos de deus e viemos ao mundo para representar ele', '2026-05-19 02:10:44.5202+00', '2026-05-19 02:10:44.5202+00', NULL
),
(
  '461e4286-cd73-446b-ba44-597c155d9661', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 0, 'Oq a pessoa qiser', '2026-05-20 15:21:57.677996+00', '2026-05-20 15:21:57.677996+00', NULL
),
(
  '0933eee0-a6a9-4188-b029-cd6da97e0433', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 1, 'Para n se desviar', '2026-05-20 15:21:57.677996+00', '2026-05-20 15:21:57.677996+00', NULL
),
(
  '530aadb2-5538-459f-bd23-974bda98bd65', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 2, 'Com fē', '2026-05-20 15:21:57.677996+00', '2026-05-20 15:21:57.677996+00', NULL
),
(
  '89a059f5-ae26-4824-ae38-6c50ba6b73af', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '9bf5b69c-d399-4266-9e14-57570672ef33', 0, 'Resgatar libertar', '2026-05-13 21:20:08.131716+00', '2026-05-13 21:20:08.131716+00', NULL
),
(
  '615c207e-1b27-4215-8a3c-a52e5327e904', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'Jesus Cristo ', '2026-05-13 21:20:08.131716+00', '2026-05-13 21:20:08.131716+00', NULL
),
(
  '21064858-f11c-4948-a533-ec43d19417e7', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '9bf5b69c-d399-4266-9e14-57570672ef33', 2, 'Graça ', '2026-05-13 21:20:08.131716+00', '2026-05-13 21:20:08.131716+00', NULL
),
(
  '1e113755-c0fb-4df0-9f86-5b0f0b41b534', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 0, 'Significa que Deus nos dá uma nova vida e identidade ', '2026-05-15 01:43:27.758527+00', '2026-05-15 01:43:27.758527+00', NULL
),
(
  'f9669ad7-4457-4b0c-99ae-9e9772da967e', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 1, 'Pois quem decide quem somos é Deus ', '2026-05-15 01:43:27.758527+00', '2026-05-15 01:43:27.758527+00', NULL
),
(
  '2e633ceb-a600-4917-b344-5f97d133d829', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 2, 'Cristo nos fez filhos de Deus ', '2026-05-15 01:43:27.758527+00', '2026-05-15 01:43:27.758527+00', NULL
),
(
  '847aaeb2-8f29-4bcb-80d1-e568e692d768', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 0, 'Ser salvo pela misericórdia ', '2026-05-16 16:09:56.965698+00', '2026-05-16 16:09:56.965698+00', NULL
),
(
  'bd3daf0b-cc23-4237-a478-2913538d9e80', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 1, 'Porque não tem como salvar-se ,é preciso ter alguém para facilitar,e nesse caso foi JESUS ', '2026-05-16 16:09:56.965698+00', '2026-05-16 16:09:56.965698+00', NULL
),
(
  '1d7c4dc7-c80e-4161-8102-edf67f9bce85', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 2, 'Muda saber que não precisamos morreu mais na cruz ', '2026-05-16 16:09:56.965698+00', '2026-05-16 16:09:56.965698+00', NULL
),
(
  '99a05be5-2795-44bf-9011-046ef56c5029', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '4923904c-0624-414c-a226-c0e44bf04174', 0, 'Que ele nos ama e nos cuida ', '2026-05-19 02:22:30.802401+00', '2026-05-19 02:22:30.802401+00', NULL
),
(
  '87e84bce-e85f-4852-8e33-31e9d4a9f904', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '4923904c-0624-414c-a226-c0e44bf04174', 1, 'Ele cuida ama e protege ', '2026-05-19 02:22:30.802401+00', '2026-05-19 02:22:30.802401+00', NULL
),
(
  '463d3d62-affa-4afa-b279-852e2b97ece1', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '4923904c-0624-414c-a226-c0e44bf04174', 2, 'E temos um propósito ', '2026-05-19 02:22:30.802401+00', '2026-05-19 02:22:30.802401+00', NULL
),
(
  'bce4c09a-dfb3-4306-9e25-854833f6bb8a', '2dcc9a0e-accc-42df-8c78-5577fc2669db', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 0, 'Identidade ', '2026-05-20 17:19:55.839629+00', '2026-05-20 17:19:55.839629+00', NULL
),
(
  '81ade501-cfe4-42bd-a447-f3f07d0f72bf', '2dcc9a0e-accc-42df-8c78-5577fc2669db', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 1, 'Que a vida cristã não começa com regras e sim por identidade', '2026-05-20 17:19:55.839629+00', '2026-05-20 17:19:55.839629+00', NULL
),
(
  '431cc122-8374-42da-bb95-c469cf41fdaa', '2dcc9a0e-accc-42df-8c78-5577fc2669db', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 2, 'Agradecendo a Deus ', '2026-05-20 17:19:55.839629+00', '2026-05-20 17:19:55.839629+00', NULL
),
(
  '6845013e-e893-4d4b-a4a3-1084adb62319', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '9bf5b69c-d399-4266-9e14-57570672ef33', 0, 'Significa resgatar,libertar e comprar de volta.', '2026-05-13 21:36:46.234951+00', '2026-05-13 21:36:46.234951+00', NULL
),
(
  'a3621446-404b-4f55-a103-28902b08c528', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'Jesus!', '2026-05-13 21:36:46.234951+00', '2026-05-13 21:36:46.234951+00', NULL
),
(
  '8bf260db-cbee-40ac-b570-ea0c765adaf0', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '9bf5b69c-d399-4266-9e14-57570672ef33', 2, 'Viver sabendo que ele morreu por nós', '2026-05-13 21:36:46.234951+00', '2026-05-13 21:36:46.234951+00', NULL
),
(
  '1816342f-28aa-4e27-868f-a9cb7455bf2c', '32a9f112-1192-4b2a-918f-c2895a76ade3', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 0, 'Ter muita graça', '2026-05-15 10:23:39.620152+00', '2026-05-15 10:23:39.620152+00', NULL
),
(
  '96b7c722-8ef5-4c48-8577-269b6cfd40f1', '32a9f112-1192-4b2a-918f-c2895a76ade3', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 1, 'Pois não iremos conseguir', '2026-05-15 10:23:39.620152+00', '2026-05-15 10:23:39.620152+00', NULL
),
(
  '90d306d5-65a3-4298-970d-6bc44316164e', '32a9f112-1192-4b2a-918f-c2895a76ade3', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 2, 'Muda pois nos sentimos abençoados', '2026-05-15 10:23:39.620152+00', '2026-05-15 10:23:39.620152+00', NULL
),
(
  '4147550f-e62f-49a5-bce5-5fcb77d51bd9', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 0, 'Que Deus antes não perdoava e agora nossos pecados são perdoados ', '2026-05-17 00:08:12.065651+00', '2026-05-17 00:08:12.065651+00', NULL
),
(
  'a6011487-4621-4390-9120-cb04da219217', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 1, 'Por que o passado já passou e agora somos novas pessoas ', '2026-05-17 00:08:12.065651+00', '2026-05-17 00:08:12.065651+00', NULL
),
(
  'c7a1519a-3fa5-476f-8d31-0d4561406bee', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 2, 'Perdoa nossos pecados', '2026-05-17 00:08:12.065651+00', '2026-05-17 00:08:12.065651+00', NULL
),
(
  'db730ee7-6d4d-44e6-9d1f-7b987afc3bdd', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'e3645858-1004-4f31-8d73-708e1749c4bd', 0, 'Para muitas vezes não serem excluídas ', '2026-05-19 10:22:47.476405+00', '2026-05-19 10:22:47.476405+00', NULL
),
(
  '4bfe3163-4ce2-4301-9066-77818c32d24e', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'e3645858-1004-4f31-8d73-708e1749c4bd', 1, 'Que eu tenho grande valor em Cristo ', '2026-05-19 10:22:47.476405+00', '2026-05-19 10:22:47.476405+00', NULL
),
(
  '3ac62787-330c-4f91-8910-5d5f2a1b1b27', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'e3645858-1004-4f31-8d73-708e1749c4bd', 2, 'Que devemos fazer todas as coisas para ele', '2026-05-19 10:22:47.476405+00', '2026-05-19 10:22:47.476405+00', NULL
),
(
  'bea8edad-3b40-46af-9c04-b5b950a1a2e0', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '9bf5b69c-d399-4266-9e14-57570672ef33', 0, 'Resgatar, libertar, comprar de volta ', '2026-05-13 21:44:40.169888+00', '2026-05-13 21:44:40.169888+00', NULL
),
(
  'b408616a-743c-499f-adc2-61cfcc972940', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'Jesus', '2026-05-13 21:44:40.169888+00', '2026-05-13 21:44:40.169888+00', NULL
),
(
  '4bb5062a-67e2-4e61-aa7b-05bb3b450df2', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '9bf5b69c-d399-4266-9e14-57570672ef33', 2, 'É viver livre obedecendo a Jesus por que "ele nos comprou"', '2026-05-13 21:44:40.169888+00', '2026-05-13 21:44:40.169888+00', NULL
),
(
  'e6d5e14b-5fb3-4209-b50c-4fecf5c226c6', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 0, 'Significa que Deus nos ama', '2026-05-15 13:56:09.679424+00', '2026-05-15 13:56:09.679424+00', NULL
),
(
  '057fe9f2-89b4-4a8d-bca5-1635b3826e16', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 1, 'N podemos nos salvar sozinhos pois só Deus consegue nos salvar', '2026-05-15 13:56:09.679424+00', '2026-05-15 13:56:09.679424+00', NULL
),
(
  'd8f2e184-24cf-4372-823b-980c82ab42fb', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 2, 'Muda que traz descanso ', '2026-05-15 13:56:09.679424+00', '2026-05-15 13:56:09.679424+00', NULL
),
(
  'a389ca46-1d9b-4a08-ad19-ae52d7ab8efc', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '9bf5b69c-d399-4266-9e14-57570672ef33', 0, 'Redenção significa ser salvo e libertado do pecado por amor e graça de Deus.', '2026-05-17 00:13:22.646818+00', '2026-05-17 00:13:22.646818+00', NULL
),
(
  '686d0efc-203d-4183-896b-e670bccbce39', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'Quem pagou o preço pela nossa redenção foi Jesus, morrendo na cruz por nós.', '2026-05-17 00:13:22.646818+00', '2026-05-17 00:13:22.646818+00', NULL
),
(
  '40a2ebb3-ef42-4b14-a471-fc2a99ceb4a3', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '9bf5b69c-d399-4266-9e14-57570672ef33', 2, 'Viver pertencendo a Jesus significa seguir Seus ensinamentos, confiar nEle e viver fazendo o bem.', '2026-05-17 00:13:22.646818+00', '2026-05-17 00:13:22.646818+00', NULL
),
(
  '605de321-8212-4739-8628-58a64f2c437b', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'e3645858-1004-4f31-8d73-708e1749c4bd', 0, 'Porque elas querem ser aceitas admiraveis ', '2026-05-19 13:55:04.520078+00', '2026-05-19 13:55:04.520078+00', NULL
),
(
  'a87ddb89-c949-4adb-8b9e-1b1e6aa2d2bb', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'e3645858-1004-4f31-8d73-708e1749c4bd', 1, 'Mostra que nosso valor já foi provado', '2026-05-19 13:55:04.520078+00', '2026-05-19 13:55:04.520078+00', NULL
),
(
  '9bc12e78-e68c-412c-83c7-ad0447376801', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'e3645858-1004-4f31-8d73-708e1749c4bd', 2, 'Muda que o amor de Deus é mais que tudo', '2026-05-19 13:55:04.520078+00', '2026-05-19 13:55:04.520078+00', NULL
),
(
  'a7f7a968-a3b9-4943-8dcd-19d3ef5e46d1', '9289d1ce-a632-4cd7-930e-73023e549ec5', '9bf5b69c-d399-4266-9e14-57570672ef33', 0, 'Resgatar,libertar,conseguir de volta algo', '2026-05-13 21:51:15.385852+00', '2026-05-13 21:51:15.385852+00', NULL
),
(
  '71d90faa-9702-4c63-8c2d-9f4d9337a866', '9289d1ce-a632-4cd7-930e-73023e549ec5', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'Jesus pagou o preço pelos nossos pecados sendo crucificado na cruz', '2026-05-13 21:51:15.385852+00', '2026-05-13 21:51:15.385852+00', NULL
),
(
  'c17aa794-da56-49ed-96e3-2fd38c6d904b', '9289d1ce-a632-4cd7-930e-73023e549ec5', '9bf5b69c-d399-4266-9e14-57570672ef33', 2, 'Praticar a fé,amar Jesus,ser uma boa pessoa', '2026-05-13 21:51:15.385852+00', '2026-05-13 21:51:15.385852+00', NULL
),
(
  '78d9f712-ff29-4ca8-b06a-a1f01af67250', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 0, 'Que Jesus nos salvou pela graça de Deus e foi de graça ', '2026-05-15 15:26:30.433846+00', '2026-05-15 15:26:30.433846+00', NULL
),
(
  '3a19e807-c3ea-4df2-9683-ab88caf3673b', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 1, 'Porque só Jesus pode nos salvar', '2026-05-15 15:26:30.433846+00', '2026-05-15 15:26:30.433846+00', NULL
),
(
  '987f426e-1a72-4f24-9bfa-a25b7d97d03f', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 2, 'Que ele sem a graça nos não teríamos acesso a ele 
', '2026-05-15 15:26:30.433846+00', '2026-05-15 15:26:30.433846+00', NULL
),
(
  '8dd364ca-7c41-4ca6-a7dc-968baad12b9d', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 0, 'Uma nova identidade ', '2026-05-17 02:55:48.207677+00', '2026-05-17 02:55:48.207677+00', NULL
),
(
  'df835d9e-ef8f-4d30-9a7f-b18ba611c08e', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 1, 'Porque o q nos define é Deus ', '2026-05-17 02:55:48.207677+00', '2026-05-17 02:55:48.207677+00', NULL
),
(
  'de9f8686-ddd4-4fdd-a2ab-58fa86cda3d7', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 2, 'Morreu na cruz ', '2026-05-17 02:55:48.207677+00', '2026-05-17 02:55:48.207677+00', NULL
),
(
  '21e660cb-9844-46be-8445-a56533e625b0', '32a9f112-1192-4b2a-918f-c2895a76ade3', 'e3645858-1004-4f31-8d73-708e1749c4bd', 0, 'Para aceitarem elas', '2026-05-19 16:04:45.027658+00', '2026-05-19 16:04:45.027658+00', NULL
),
(
  '7ed3b16b-0080-47c7-9b5b-efa7fcecb9cb', '32a9f112-1192-4b2a-918f-c2895a76ade3', 'e3645858-1004-4f31-8d73-708e1749c4bd', 1, 'Mostra que somos amados', '2026-05-19 16:04:45.027658+00', '2026-05-19 16:04:45.027658+00', NULL
),
(
  '9247fd50-a578-47df-967f-f64b817701db', '32a9f112-1192-4b2a-918f-c2895a76ade3', 'e3645858-1004-4f31-8d73-708e1749c4bd', 2, 'Muda pois nos sentimos melhor', '2026-05-19 16:04:45.027658+00', '2026-05-19 16:04:45.027658+00', NULL
),
(
  '6322c421-3b5e-42e6-9baa-62de166807ea', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '9bf5b69c-d399-4266-9e14-57570672ef33', 0, 'Resgatar, liberar,comprar de volta', '2026-05-13 22:56:19.315491+00', '2026-05-13 22:56:19.315491+00', NULL
),
(
  '1d3ba5ea-b24b-40c3-8dd3-4b4bda52b4af', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'Jesus', '2026-05-13 22:56:19.315491+00', '2026-05-13 22:56:19.315491+00', NULL
),
(
  '1db0aa42-6328-42aa-98d6-da2007c8e376', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '9bf5b69c-d399-4266-9e14-57570672ef33', 2, 'Que somos filhos dele e somos únicos ', '2026-05-13 22:56:19.315491+00', '2026-05-13 22:56:19.315491+00', NULL
),
(
  '91edcfea-b349-43b9-ac40-ed5094864463', '9289d1ce-a632-4cd7-930e-73023e549ec5', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 0, 'Que Deus nos ama,e nos salva,mesmo nós sendo pecadores,Ele nos salva porque Ele é bom,e nos ama mesmo assim', '2026-05-15 16:24:11.386808+00', '2026-05-15 16:24:11.386808+00', NULL
)
ON CONFLICT DO NOTHING;

INSERT INTO public.devotional_responses (
  id, user_id, devotional_id, question_index, response, created_at, updated_at, church_id
)
VALUES
(
  '9fa33364-47f5-4ab6-b02d-014db1cf890b', '9289d1ce-a632-4cd7-930e-73023e549ec5', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 1, 'Porque nós somos de Deus,e precisamos ser salvos por Ele', '2026-05-15 16:24:11.386808+00', '2026-05-15 16:24:11.386808+00', NULL
),
(
  '6f57d6da-6666-4611-b004-b493edb2a04d', '9289d1ce-a632-4cd7-930e-73023e549ec5', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 2, 'Que não precisamos ser perfeitos ou provar nosso valor,pois Ele nos ama mesmo nós não sendo perfeitos', '2026-05-15 16:24:11.386808+00', '2026-05-15 16:24:11.386808+00', NULL
),
(
  '0b4ed99b-8751-4896-acbc-4016b67036d3', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 0, 'Deus nos ama', '2026-05-17 02:58:00.288816+00', '2026-05-17 02:58:00.288816+00', NULL
),
(
  '40ff7174-399c-432d-b4ac-fd153589edb8', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 1, 'Pois Jesus já nos salvou ', '2026-05-17 02:58:00.288816+00', '2026-05-17 02:58:00.288816+00', NULL
),
(
  '9f12df0a-48bb-4767-8345-bf0028b8cd8e', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 2, 'E q nos não precisamos ser perfeitos ', '2026-05-17 02:58:00.288816+00', '2026-05-17 02:58:00.288816+00', NULL
),
(
  '845251fc-856a-4059-86af-164d4a976a2c', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'e3645858-1004-4f31-8d73-708e1749c4bd', 0, 'Para serem a seita ', '2026-05-19 19:33:00.681069+00', '2026-05-19 19:33:00.681069+00', NULL
),
(
  '4c1963ec-51ad-4598-ae33-6a46f11255a8', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'e3645858-1004-4f31-8d73-708e1749c4bd', 1, 'Sim', '2026-05-19 19:33:00.681069+00', '2026-05-19 19:33:00.681069+00', NULL
),
(
  '6ac63bc7-3564-426a-9a1c-1e1c4779c295', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'e3645858-1004-4f31-8d73-708e1749c4bd', 2, 'Não fazendo seu valor mas sim recebendo do Pai ', '2026-05-19 19:33:00.681069+00', '2026-05-19 19:33:00.681069+00', NULL
),
(
  'f23c0c17-c0cf-406c-b999-8bc5e7901ad9', '914b898d-24a3-46ad-a764-d2f24e5115d1', '9bf5b69c-d399-4266-9e14-57570672ef33', 0, 'Resgatar ', '2026-05-13 23:09:43.777524+00', '2026-05-13 23:09:43.777524+00', NULL
),
(
  'a2fd0b18-e168-4b82-a377-bee7ae0f4139', '914b898d-24a3-46ad-a764-d2f24e5115d1', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'Jesus ', '2026-05-13 23:09:43.777524+00', '2026-05-13 23:09:43.777524+00', NULL
),
(
  '0f281688-f600-4671-9768-87d1dee9194a', '914b898d-24a3-46ad-a764-d2f24e5115d1', '9bf5b69c-d399-4266-9e14-57570672ef33', 2, 'Que Ele te conhece e te ama', '2026-05-13 23:09:43.777524+00', '2026-05-13 23:09:43.777524+00', NULL
),
(
  '2ddc3660-7381-421e-9356-510424863fe1', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 0, 'Viver pra ele', '2026-05-15 19:47:24.073092+00', '2026-05-15 19:47:24.073092+00', NULL
),
(
  'a3fe0d5a-abdd-43f9-a481-1fb86e16b628', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 1, 'Porq ele e ele', '2026-05-15 19:47:24.073092+00', '2026-05-15 19:47:24.073092+00', NULL
),
(
  'd40f6a41-e6de-459d-87fd-8d5788bb2720', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 2, 'Vivemos livres', '2026-05-15 19:47:24.073092+00', '2026-05-15 19:47:24.073092+00', NULL
),
(
  '6ed1a4b2-38ac-409c-b20c-6d87ada48683', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '4923904c-0624-414c-a226-c0e44bf04174', 0, 'Isso significa que Deus não é apenas um Deus distante, mas um Pai que nos ama, cuida de nós, perdoa e nos acompanha.', '2026-05-18 09:34:37.26989+00', '2026-05-18 09:34:37.26989+00', NULL
),
(
  'b354650a-5461-4bed-aa22-0e3b40d37a3d', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '4923904c-0624-414c-a226-c0e44bf04174', 1, 'Ama , cuida , perdoa , ensina e protege ', '2026-05-18 09:34:37.26989+00', '2026-05-18 09:34:37.26989+00', NULL
),
(
  '0dd81697-c642-48b2-8e5b-3a01ec284d18', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '4923904c-0624-414c-a226-c0e44bf04174', 2, 'Que mesmo ele la no céu ele está nos acompanhando e cuidando ', '2026-05-18 09:34:37.26989+00', '2026-05-18 09:34:37.26989+00', NULL
),
(
  '3efd0ce0-1d6b-4e1e-8c67-d2f635ae013c', '1526dc8b-a92a-4a44-b358-b6a3083d0143', 'e3645858-1004-4f31-8d73-708e1749c4bd', 0, 'Porque elas querem ser aceitas elogiadas e admirada ', '2026-05-19 20:59:40.703384+00', '2026-05-19 20:59:40.703384+00', NULL
),
(
  '5beba486-c83f-4eda-aeef-50955efa7c75', '1526dc8b-a92a-4a44-b358-b6a3083d0143', 'e3645858-1004-4f31-8d73-708e1749c4bd', 1, 'Mas a cruz mostra que nosso calor já foi provado ', '2026-05-19 20:59:40.703384+00', '2026-05-19 20:59:40.703384+00', NULL
),
(
  '14059f59-6338-4a33-ada5-51835ad84930', '1526dc8b-a92a-4a44-b358-b6a3083d0143', 'e3645858-1004-4f31-8d73-708e1749c4bd', 2, 'Isso significa que o amor de deus não depende do nosso desempenho ', '2026-05-19 20:59:40.703384+00', '2026-05-19 20:59:40.703384+00', NULL
),
(
  '5e004c96-33e8-4cdb-be2a-190558ea6dc2', '4d062445-4744-4007-a2ac-d7c4743fc979', '9bf5b69c-d399-4266-9e14-57570672ef33', 0, 'Resgatar e libertar', '2026-05-13 23:11:48.929485+00', '2026-05-13 23:11:48.929485+00', NULL
),
(
  '4ba3591f-7f57-4eb5-beca-96ed6c8b3c9f', '4d062445-4744-4007-a2ac-d7c4743fc979', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'Jesus', '2026-05-13 23:11:48.929485+00', '2026-05-13 23:11:48.929485+00', NULL
),
(
  'c1436ebc-255d-45f3-bf2c-b3c90a508799', '4d062445-4744-4007-a2ac-d7c4743fc979', '9bf5b69c-d399-4266-9e14-57570672ef33', 2, 'Ser grato a ele 
', '2026-05-13 23:11:48.929485+00', '2026-05-13 23:11:48.929485+00', NULL
),
(
  '3ac8c6ca-f81d-4d02-bace-ae2f3f1b4d9c', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 0, 'Deus nos salva por amor, não por merecimento.', '2026-05-15 20:17:48.322949+00', '2026-05-15 20:17:48.322949+00', NULL
),
(
  '5545aaad-47e2-4321-b8e4-6bd8076acc88', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 1, 'Não conseguimos nos salvar porque todos pecam.', '2026-05-15 20:17:48.322949+00', '2026-05-15 20:17:48.322949+00', NULL
),
(
  '51c2a4b4-d1c5-4600-baa2-5fb8b4bf8bdc', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 2, 'A graça de Deus traz paz e segurança, porque já somos aceitos em Cristo.', '2026-05-15 20:17:48.322949+00', '2026-05-15 20:17:48.322949+00', NULL
),
(
  'c76fe711-6871-4919-aa74-ea7b10fc2589', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '4923904c-0624-414c-a226-c0e44bf04174', 0, 'Alegria', '2026-05-18 14:46:42.358802+00', '2026-05-18 14:46:42.358802+00', NULL
),
(
  '7a5c2f74-2b74-4f0a-8132-b7f74b1f41e4', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '4923904c-0624-414c-a226-c0e44bf04174', 1, 'Da a vida', '2026-05-18 14:46:42.358802+00', '2026-05-18 14:46:42.358802+00', NULL
),
(
  '31915018-c5ff-4212-bd25-2f07810c5c5c', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '4923904c-0624-414c-a226-c0e44bf04174', 2, 'Ficamos leves', '2026-05-18 14:46:42.358802+00', '2026-05-18 14:46:42.358802+00', NULL
),
(
  'bde8664a-7b67-45f6-ab33-80a848500918', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'e3645858-1004-4f31-8d73-708e1749c4bd', 0, 'Para tentarem se mostra uma pessoa maravilhosa ', '2026-05-19 21:11:58.719192+00', '2026-05-19 21:11:58.719192+00', NULL
),
(
  '2478063d-a153-4f06-be2c-3dca6778c1bc', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'e3645858-1004-4f31-8d73-708e1749c4bd', 1, 'Mostra que Deus deu seu único filho para morrer por nós pecadores', '2026-05-19 21:11:58.719192+00', '2026-05-19 21:11:58.719192+00', NULL
),
(
  '950efe67-c71f-4c1a-9f2f-26487ddd6d5b', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'e3645858-1004-4f31-8d73-708e1749c4bd', 2, 'Faz nós nos sentirmos mais amados ', '2026-05-19 21:11:58.719192+00', '2026-05-19 21:11:58.719192+00', NULL
),
(
  '1d82d6e2-026a-4b3c-9c41-652219f61e95', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '9bf5b69c-d399-4266-9e14-57570672ef33', 0, 'Libertação ', '2026-05-13 23:26:32.394243+00', '2026-05-13 23:26:32.394243+00', NULL
),
(
  '2e55df91-ea5b-4a2e-8332-0b2a276bb4e9', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'Jesus', '2026-05-13 23:26:32.394243+00', '2026-05-13 23:26:32.394243+00', NULL
),
(
  'ad2809c3-61ac-43d5-beca-735fd04d7395', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '9bf5b69c-d399-4266-9e14-57570672ef33', 2, 'Viver na caminhada com ele ', '2026-05-13 23:26:32.394243+00', '2026-05-13 23:26:32.394243+00', NULL
),
(
  '6a68941a-5e17-4def-aef9-1e83d4357f92', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 0, 'Significa que Deus nos ama ', '2026-05-15 21:34:22.772948+00', '2026-05-15 21:34:22.772948+00', NULL
),
(
  '8666d4c2-a176-4d3b-9cfe-5de727832e49', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 1, 'Da morte', '2026-05-15 21:34:22.772948+00', '2026-05-15 21:34:22.772948+00', NULL
),
(
  'e2e8b648-fc55-400f-a145-ed17d20ce221', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 2, 'Muda os nossos coportamentos', '2026-05-15 21:34:22.772948+00', '2026-05-15 21:34:22.772948+00', NULL
),
(
  '7ac600c9-0939-4a16-ac3d-8d7803178cf4', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '4923904c-0624-414c-a226-c0e44bf04174', 0, 'Significa que Deus sempre cuida de nos', '2026-05-18 16:05:21.838033+00', '2026-05-18 16:05:21.838033+00', NULL
),
(
  '1ed818a4-b879-4b37-956c-3684d67a271f', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '4923904c-0624-414c-a226-c0e44bf04174', 1, 'Cuida e nos protege ', '2026-05-18 16:05:21.838033+00', '2026-05-18 16:05:21.838033+00', NULL
),
(
  'd4967171-566b-469e-a079-56c3c7e5df10', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '4923904c-0624-414c-a226-c0e44bf04174', 2, 'Muda que nuca estaremos sozinhos', '2026-05-18 16:05:21.838033+00', '2026-05-18 16:05:21.838033+00', NULL
),
(
  'bde6a5fe-7011-4cbd-b0d7-4acb9b90435a', '7640c7e4-6780-4c27-8a04-ae5ab375f580', 'e3645858-1004-4f31-8d73-708e1749c4bd', 0, 'Querem ser aceitas, admiradas, elogiadas. ', '2026-05-19 21:29:03.280663+00', '2026-05-19 21:29:03.280663+00', NULL
),
(
  '6dd02bbe-338d-411f-bbb8-f92cd27f21f0', '7640c7e4-6780-4c27-8a04-ae5ab375f580', 'e3645858-1004-4f31-8d73-708e1749c4bd', 1, 'Jesus morreu por nós quando ainda éramos pecadores. ', '2026-05-19 21:29:03.280663+00', '2026-05-19 21:29:03.280663+00', NULL
),
(
  '19c20c09-8294-45bb-87f9-6b1b99eb883e', '7640c7e4-6780-4c27-8a04-ae5ab375f580', 'e3645858-1004-4f31-8d73-708e1749c4bd', 2, 'Muda que assim sabemos que Deus nos ama ', '2026-05-19 21:29:03.280663+00', '2026-05-19 21:29:03.280663+00', NULL
),
(
  '67395cef-8e9f-4e52-8238-59aeb251fcea', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '9bf5b69c-d399-4266-9e14-57570672ef33', 0, 'Resgatar, libetar, comprar de volta ', '2026-05-14 01:47:10.838762+00', '2026-05-14 01:47:10.838762+00', NULL
),
(
  'f1567693-1fbe-42ab-9a06-ed68c3802b13', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'Jesus', '2026-05-14 01:47:10.838762+00', '2026-05-14 01:47:10.838762+00', NULL
),
(
  '2ae03ac4-ba0a-4b1c-8a87-fffdf8ffa9fc', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '9bf5b69c-d399-4266-9e14-57570672ef33', 2, 'Que nós fomos resgatados por ele', '2026-05-14 01:47:10.838762+00', '2026-05-14 01:47:10.838762+00', NULL
),
(
  'e36ab4bf-198b-4fc8-8352-653891f3b989', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 0, 'Ser salvo pela graça significa que Deus nos salva pelo amor e misericórdia dEle, e não porque merecemos.', '2026-05-15 21:49:33.167313+00', '2026-05-15 21:49:33.167313+00', NULL
),
(
  '606cc8a2-ae13-4744-b2fe-8e679431da55', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 1, 'Não podemos nos salvar sozinhos porque todos erramos e precisamos do perdão e da ajuda de Deus.', '2026-05-15 21:49:33.167313+00', '2026-05-15 21:49:33.167313+00', NULL
),
(
  '694c7958-27be-410d-854e-9aac6cf08b24', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 2, 'Saber que Deus nos aceita pela graça traz paz ao coração e nos ajuda a viver com mais confiança e fé.', '2026-05-15 21:49:33.167313+00', '2026-05-15 21:49:33.167313+00', NULL
),
(
  'ab119a3b-b450-4bb3-ba6b-7ca4f54002af', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '4923904c-0624-414c-a226-c0e44bf04174', 0, 'Que eu posso confiar me Deus ', '2026-05-18 16:48:48.198376+00', '2026-05-18 16:48:48.198376+00', NULL
),
(
  '44ffc2c5-2553-475d-8ef2-54a91e6aae82', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '4923904c-0624-414c-a226-c0e44bf04174', 1, 'Ajuda, ensina, disciplina ', '2026-05-18 16:48:48.198376+00', '2026-05-18 16:48:48.198376+00', NULL
),
(
  '9565692c-0ad7-4ff2-b0aa-21d219daa800', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '4923904c-0624-414c-a226-c0e44bf04174', 2, 'Que ele ajuda nos a se aproximar de Deus ', '2026-05-18 16:48:48.198376+00', '2026-05-18 16:48:48.198376+00', NULL
),
(
  'a967f0e1-ae05-4153-9263-be9ad3e91f3a', '9289d1ce-a632-4cd7-930e-73023e549ec5', 'e3645858-1004-4f31-8d73-708e1749c4bd', 0, 'Por conta da pressão da sociedade falando que ela precisa provar seu valor', '2026-05-19 21:44:32.436964+00', '2026-05-19 21:44:32.436964+00', NULL
),
(
  'a8718674-4959-4759-8abe-0ee84776d8ef', '9289d1ce-a632-4cd7-930e-73023e549ec5', 'e3645858-1004-4f31-8d73-708e1749c4bd', 1, 'Que Jesus morreu por nós quando ainda éramos pecadores,isso significa que Jesus e Deus nos amam pelo o que nós somos,sem nós precisarmos provar nosso valor', '2026-05-19 21:44:32.436964+00', '2026-05-19 21:44:32.436964+00', NULL
),
(
  '9265d3cc-f40c-40fa-9ff3-4b31deedf1d7', '9289d1ce-a632-4cd7-930e-73023e549ec5', 'e3645858-1004-4f31-8d73-708e1749c4bd', 2, 'Sem tentar provar seu valor toda hora,e aceita que Deus já nos ama do jeito que somos', '2026-05-19 21:44:32.436964+00', '2026-05-19 21:44:32.436964+00', NULL
),
(
  '4550862f-0553-41f4-85d6-ba9f74fa9d89', 'b486e185-6cb3-477c-936b-b204b143e329', '40f39a0c-eb00-4646-8f8f-e79d0f2e782e', 1, 'Na sei ', '2026-04-21 16:03:12.242722+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b89a87ca-cdf8-4145-9673-91f59dfa41ae', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '9bf5b69c-d399-4266-9e14-57570672ef33', 0, 'O ato de resgatar, libertar ou salvar alguém de uma situação de cativeiro, escravidão ou pecado.', '2026-05-14 02:24:18.742811+00', '2026-05-14 02:24:18.742811+00', NULL
),
(
  'f1944382-1532-4420-bbe8-fe42e1430a66', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'Jesus Cristo através do seu sacrifício na cruz.', '2026-05-14 02:24:18.742811+00', '2026-05-14 02:24:18.742811+00', NULL
),
(
  'f0d46a94-3bdb-41e8-be09-2b84b0cb5e86', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '9bf5b69c-d399-4266-9e14-57570672ef33', 2, 'Significa ter seu propósito e significa.', '2026-05-14 02:24:18.742811+00', '2026-05-14 02:24:18.742811+00', NULL
),
(
  '0580fffe-d447-4124-8dc7-f60b8c5b1dc6', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 0, 'Que fomos salvos por jesus', '2026-05-15 21:54:21.439972+00', '2026-05-15 21:54:21.439972+00', NULL
),
(
  '51cdf8c8-34f2-4faa-9267-da39fa92884d', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 1, 'Por que sozinhos não somos nada e com Jesus nos sentimos mais leves', '2026-05-15 21:54:21.439972+00', '2026-05-15 21:54:21.439972+00', NULL
),
(
  '91fb5789-a15f-4b9f-8ce9-51fb1a754757', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 2, 'Faz percebermos que ele nos deu importância', '2026-05-15 21:54:21.439972+00', '2026-05-15 21:54:21.439972+00', NULL
),
(
  '4f933834-d23e-4797-8436-4fa21c1022a6', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '4923904c-0624-414c-a226-c0e44bf04174', 0, 'Ser filha de Deus,  é ser amada e cuidada por ele .', '2026-05-18 21:18:25.613356+00', '2026-05-18 21:18:25.613356+00', NULL
),
(
  'bda4e5d7-6cf2-4f15-88ba-132d101e7b2a', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '4923904c-0624-414c-a226-c0e44bf04174', 1, 'Um pai ama, protege e cuida do filho ', '2026-05-18 21:18:25.613356+00', '2026-05-18 21:18:25.613356+00', NULL
),
(
  'a4f17305-5725-4b73-8635-9f012b4c35ff', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '4923904c-0624-414c-a226-c0e44bf04174', 2, 'Isso nos faz confiar mais em Deus como pai .', '2026-05-18 21:18:25.613356+00', '2026-05-18 21:18:25.613356+00', NULL
),
(
  'fbc1a949-6fa6-41bb-990a-2e6411b8ee4e', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'e3645858-1004-4f31-8d73-708e1749c4bd', 0, 'As pessoas tentam provar seu valor para serem aceitas e reconhecidas ', '2026-05-19 22:03:01.957438+00', '2026-05-19 22:03:01.957438+00', NULL
),
(
  '6f2b24ce-d059-4aed-8640-5f03549c29fa', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'e3645858-1004-4f31-8d73-708e1749c4bd', 1, 'A cruz mostra que Deus nos ama e que temos valor para ele ', '2026-05-19 22:03:01.957438+00', '2026-05-19 22:03:01.957438+00', NULL
),
(
  '81e40ba6-32c3-4f32-a56e-f57e70a1a39e', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'e3645858-1004-4f31-8d73-708e1749c4bd', 2, 'Isso nos faz viver com mas paz e confiança sem precisar provar seu valor ', '2026-05-19 22:03:01.957438+00', '2026-05-19 22:03:01.957438+00', NULL
),
(
  'bf275970-7d49-47d7-8504-824101995b37', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 0, 'Ser nova criação significa ter uma vida transformada por Cristo, deixando para trás os erros do passado e vivendo de uma forma melhor.', '2026-05-14 03:34:53.743797+00', '2026-05-14 03:34:53.743797+00', NULL
),
(
  '084b1200-0944-4fec-887e-de11ab1064c0', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 1, 'Nosso passado não define quem somos porque Deus nos dá uma nova chance e nos vê com amor e perdão.', '2026-05-14 03:34:53.743797+00', '2026-05-14 03:34:53.743797+00', NULL
),
(
  '3445783b-3cc9-4f2b-9331-fec89c60fe12', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 2, 'Cristo muda nossa identidade porque, através do Seu amor e sacrifício, passamos a ser filhos de Deus e uma nova criação.', '2026-05-14 03:34:53.743797+00', '2026-05-14 03:34:53.743797+00', NULL
),
(
  '1a7586ba-2c4e-4fc1-9711-ba741c5f5e2b', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 0, 'Isso significa que Deus nos ama, nos perdoa e nos salva não porque somos bons, mas porque Ele é bom. ', '2026-05-15 22:36:02.506275+00', '2026-05-15 22:36:02.506275+00', NULL
),
(
  '374df975-eead-4b44-be05-1c69aa7ec639', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 1, 'Por que precisamos de Deus ', '2026-05-15 22:36:02.506275+00', '2026-05-15 22:36:02.506275+00', NULL
),
(
  '24f51a33-ecfb-49c5-9194-5a1e9c4c0eb5', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 2, 'Que assim sabemos que Deus nos ama do jeito que somos.
', '2026-05-15 22:36:02.506275+00', '2026-05-15 22:36:02.506275+00', NULL
),
(
  'd40b3db1-b800-4769-9028-afd7bdc5c18d', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '4923904c-0624-414c-a226-c0e44bf04174', 0, 'Ter um pai que não abandona ', '2026-05-18 21:21:55.752754+00', '2026-05-18 21:21:55.752754+00', NULL
),
(
  'cf7f9492-1884-498d-892d-a60b50c21e0b', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '4923904c-0624-414c-a226-c0e44bf04174', 1, 'TUDO O QUE É POSSÍVEL! ', '2026-05-18 21:21:55.752754+00', '2026-05-18 21:21:55.752754+00', NULL
),
(
  '451230eb-1c95-4521-8d7e-c31d79c2fcc2', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '4923904c-0624-414c-a226-c0e44bf04174', 2, 'Percebendo que não preciso achar que ele é distante ', '2026-05-18 21:21:55.752754+00', '2026-05-18 21:21:55.752754+00', NULL
),
(
  'd1339a3d-f2ad-47ad-9597-e4fc262d33ed', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'e3645858-1004-4f31-8d73-708e1749c4bd', 0, 'Para todos gostarem delas', '2026-05-19 22:04:13.997595+00', '2026-05-19 22:04:13.997595+00', NULL
),
(
  '59aacb1e-f4d4-4d92-8e9d-e6e21baca225', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'e3645858-1004-4f31-8d73-708e1749c4bd', 1, 'Nossos pecados
', '2026-05-19 22:04:13.997595+00', '2026-05-19 22:04:13.997595+00', NULL
),
(
  '0dd896ce-d7a4-4295-b597-fa647149c14a', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'e3645858-1004-4f31-8d73-708e1749c4bd', 2, 'Pensando', '2026-05-19 22:04:13.997595+00', '2026-05-19 22:04:13.997595+00', NULL
),
(
  '3ab5e704-bdd4-470d-b546-80a81e1ae8a7', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 0, 'Que Deus me fez de novo', '2026-05-14 15:00:47.045221+00', '2026-05-14 15:00:47.045221+00', NULL
),
(
  'abc8cf04-f470-4f48-ac84-89f17fd46416', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 1, 'Porque o importa e o presente
', '2026-05-14 15:00:47.045221+00', '2026-05-14 15:00:47.045221+00', NULL
),
(
  '6304d94e-9b41-4b26-b34d-1f15f551df45', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 2, 'Sim', '2026-05-14 15:00:47.045221+00', '2026-05-14 15:00:47.045221+00', NULL
),
(
  '8951aabf-4e66-41c8-a2c3-ecb0dc3d8f1d', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 0, 'Significa que Deus nos dá a salvação de graça basta a gente querer ', '2026-05-15 22:39:52.118807+00', '2026-05-15 22:39:52.118807+00', NULL
),
(
  '4dbe9e8d-dc50-4341-b3fc-0146f5d61400', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 1, 'Precisamos do perdão de Deus ', '2026-05-15 22:39:52.118807+00', '2026-05-15 22:39:52.118807+00', NULL
),
(
  '951de8be-45ad-451c-a389-e059eff9e1ea', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 2, 'Saber que podemos ter uma vida eterna com Deus ', '2026-05-15 22:39:52.118807+00', '2026-05-15 22:39:52.118807+00', NULL
),
(
  'ad52d94a-4251-443d-aa3b-101e29aa84d1', '4d062445-4744-4007-a2ac-d7c4743fc979', '4923904c-0624-414c-a226-c0e44bf04174', 0, 'Um pai que cuida de nós e que nossa vida tem valor e propósito ', '2026-05-18 21:25:46.851299+00', '2026-05-18 21:25:46.851299+00', NULL
),
(
  '13bc9d0e-5765-402c-8644-52cb1333547e', '4d062445-4744-4007-a2ac-d7c4743fc979', '4923904c-0624-414c-a226-c0e44bf04174', 1, 'Carinho amor cuida entre outros ', '2026-05-18 21:25:46.851299+00', '2026-05-18 21:25:46.851299+00', NULL
),
(
  'c9a8ebdb-dae3-400b-82e0-18b4db6df9e3', '4d062445-4744-4007-a2ac-d7c4743fc979', '4923904c-0624-414c-a226-c0e44bf04174', 2, 'Que deus não é apenas um deus e também um pai distante que nos ama ', '2026-05-18 21:25:46.851299+00', '2026-05-18 21:25:46.851299+00', NULL
),
(
  '54a00991-da97-4c9b-aed9-8aef533b0835', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'e3645858-1004-4f31-8d73-708e1749c4bd', 0, 'Para provar ser bons', '2026-05-19 22:44:33.361369+00', '2026-05-19 22:44:33.361369+00', NULL
),
(
  '7ddb148f-ac36-4946-abed-999369983d07', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'e3645858-1004-4f31-8d73-708e1749c4bd', 1, 'Que podemos ser discípulos', '2026-05-19 22:44:33.361369+00', '2026-05-19 22:44:33.361369+00', NULL
),
(
  '9448aa15-7c28-426d-b99b-55c67e19bd74', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'e3645858-1004-4f31-8d73-708e1749c4bd', 2, 'Vivendo para Cristo ', '2026-05-19 22:44:33.361369+00', '2026-05-19 22:44:33.361369+00', NULL
),
(
  '2618b39b-2da3-4fdc-b12d-feaa6b706fc1', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 0, 'Isso significa que a pessoa nunca mais vai errar ou que tudo muda de um dia para o outro ', '2026-05-14 16:06:29.065938+00', '2026-05-14 16:06:29.065938+00', NULL
),
(
  '2affe3e3-77eb-4961-a9db-49359b37dd03', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 1, 'Errar não define quem nós somos ', '2026-05-14 16:06:29.065938+00', '2026-05-14 16:06:29.065938+00', NULL
),
(
  'c5b82bdd-cdd9-4059-bb45-fe4bc60568f3', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 2, 'Isso significa que Deus nos dá nova identidade e uma nova vida ', '2026-05-14 16:06:29.065938+00', '2026-05-14 16:06:29.065938+00', NULL
),
(
  '4420c398-83d8-4f56-8e15-d6b87ca09905', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 0, 'Que Deus nos ama mesmo pecando', '2026-05-15 23:48:33.909101+00', '2026-05-15 23:48:33.909101+00', NULL
),
(
  'de798a7f-18be-416b-a3b7-03e98755feae', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 1, 'Por que nós não podemos perdoar nossos próprios pecados', '2026-05-15 23:48:33.909101+00', '2026-05-15 23:48:33.909101+00', NULL
),
(
  '04d17b4e-2c61-4883-a379-07add1d101dc', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 2, 'Que não posso pecar ', '2026-05-15 23:48:33.909101+00', '2026-05-15 23:48:33.909101+00', NULL
),
(
  'a836dca3-9e85-4378-a776-12e10b360434', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '4923904c-0624-414c-a226-c0e44bf04174', 0, 'Isso significa que Deus não e apenas um deus de distância mas e um pai que nos ama ', '2026-05-18 21:37:26.241237+00', '2026-05-18 21:37:26.241237+00', NULL
)
ON CONFLICT DO NOTHING;

INSERT INTO public.devotional_responses (
  id, user_id, devotional_id, question_index, response, created_at, updated_at, church_id
)
VALUES
(
  '9dda0c00-744b-4658-8811-5facf302d5ec', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '4923904c-0624-414c-a226-c0e44bf04174', 1, 'Pai que cuida de nós e que nossa vida tem valor e propósito ', '2026-05-18 21:37:26.241237+00', '2026-05-18 21:37:26.241237+00', NULL
),
(
  '7d87e912-7925-4bfc-8f78-c1a5e6c672d2', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '4923904c-0624-414c-a226-c0e44bf04174', 2, 'Deus não significa que nossa vida vai ser perfeita mas significa que nunca estarmos sozinhos ', '2026-05-18 21:37:26.241237+00', '2026-05-18 21:37:26.241237+00', NULL
),
(
  'cc9b808c-a5dc-458d-b2b3-7a620169cda4', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'e3645858-1004-4f31-8d73-708e1749c4bd', 0, 'Para parecerem melhores ', '2026-05-19 22:48:46.161302+00', '2026-05-19 22:48:46.161302+00', NULL
),
(
  'cab3bf3a-4b30-41b4-934a-55abdfaff582', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'e3645858-1004-4f31-8d73-708e1749c4bd', 1, 'Salvação porque Jesus morreu na cruz pra nós salvar ', '2026-05-19 22:48:46.161302+00', '2026-05-19 22:48:46.161302+00', NULL
),
(
  '36df9209-33b4-41d5-9991-adc8571eb8b7', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'e3645858-1004-4f31-8d73-708e1749c4bd', 2, 'Percebemos o valor real de Cristo ', '2026-05-19 22:48:46.161302+00', '2026-05-19 22:48:46.161302+00', NULL
),
(
  'e8c03f7a-4ed5-4f78-8d92-ad18e50588b9', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 0, 'Significa que Deus nos da uma nova identidade é uma nova vida ', '2026-05-14 16:08:14.902356+00', '2026-05-14 16:08:14.902356+00', NULL
),
(
  'd264032b-c677-443a-828f-c0b1f392416d', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 1, 'Pq nos somos uma obra de Cristo ', '2026-05-14 16:08:14.902356+00', '2026-05-14 16:08:14.902356+00', NULL
),
(
  'd2ed0743-c8f4-4a49-bcb6-a1ac37aa692b', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 2, 'Porque ele nos deu perdão pelos nossos pecados', '2026-05-14 16:08:14.902356+00', '2026-05-14 16:08:14.902356+00', NULL
),
(
  '26da8ab1-a633-4dde-84ff-0fe9d193cdc3', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 0, 'Isso significa que Deus nos ama ', '2026-05-16 00:03:06.913943+00', '2026-05-16 00:03:06.913943+00', NULL
),
(
  '2ba3a186-6c12-4129-b510-61e06d057aa0', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 1, 'Não porque merecemos mas porque jesus morreu por nós ', '2026-05-16 00:03:06.913943+00', '2026-05-16 00:03:06.913943+00', NULL
),
(
  '16c029d3-f134-4824-aaa7-18ffa40e408f', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 2, 'Deus nos ama mesmo sendo pecadores e por isso ele  nos transforma ', '2026-05-16 00:03:06.913943+00', '2026-05-16 00:03:06.913943+00', NULL
),
(
  'efdef4ab-17ac-4678-aea0-b2e288acd310', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '4923904c-0624-414c-a226-c0e44bf04174', 0, 'Significa que somos importantes e filhos do todo poderoso', '2026-05-18 21:48:23.11945+00', '2026-05-18 21:48:23.11945+00', NULL
),
(
  '695c5b7d-2c8a-4096-9ea4-51d8286a0497', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '4923904c-0624-414c-a226-c0e44bf04174', 1, 'Tudo !', '2026-05-18 21:48:23.11945+00', '2026-05-18 21:48:23.11945+00', NULL
),
(
  '72842c68-8901-49f4-8dac-254f532559fc', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '4923904c-0624-414c-a226-c0e44bf04174', 2, 'Muda em toda nossa vida, desde a menor coisa até maior', '2026-05-18 21:48:23.11945+00', '2026-05-18 21:48:23.11945+00', NULL
),
(
  '8753b402-779e-4b40-8b49-47c9f36c15ab', '4d062445-4744-4007-a2ac-d7c4743fc979', 'e3645858-1004-4f31-8d73-708e1749c4bd', 0, 'Para ser aceitas edmiradas', '2026-05-19 22:51:57.836932+00', '2026-05-19 22:51:57.836932+00', NULL
),
(
  'f5753012-9fc8-4fd0-beb0-fed5f6448b9b', '4d062445-4744-4007-a2ac-d7c4743fc979', 'e3645858-1004-4f31-8d73-708e1749c4bd', 1, 'Mostra o valor que jesus morreu por nós salvar ', '2026-05-19 22:51:57.836932+00', '2026-05-19 22:51:57.836932+00', NULL
),
(
  '5cae375e-9de9-4896-9ed9-fe6068047403', '4d062445-4744-4007-a2ac-d7c4743fc979', 'e3645858-1004-4f31-8d73-708e1749c4bd', 2, 'Isso significa que o amor de Deus não dependendo nosso desempenho ', '2026-05-19 22:51:57.836932+00', '2026-05-19 22:51:57.836932+00', NULL
),
(
  'f38bb4cc-8dfd-4c4b-921e-9f07ad275013', '32a9f112-1192-4b2a-918f-c2895a76ade3', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 0, 'Ser criado com amor?? ', '2026-05-14 18:12:58.739623+00', '2026-05-14 18:12:58.739623+00', NULL
),
(
  '2b379b00-cb80-4940-af1e-492e8ec40dc1', '32a9f112-1192-4b2a-918f-c2895a76ade3', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 1, 'Pois podemos ser melhor agora', '2026-05-14 18:12:58.739623+00', '2026-05-14 18:12:58.739623+00', NULL
),
(
  '75d5d246-dfdb-46cb-8b6c-932bd8895ab5', '32a9f112-1192-4b2a-918f-c2895a76ade3', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 2, 'Nos amou', '2026-05-14 18:12:58.739623+00', '2026-05-14 18:12:58.739623+00', NULL
),
(
  '0b4c6bc2-1eff-4afe-8013-5afe40650339', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 0, 'Ser salvo pela bondade de Deus', '2026-05-16 00:18:12.434336+00', '2026-05-16 00:18:12.434336+00', NULL
),
(
  'd667d501-8ff5-416d-88c6-bce86d145a1f', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 1, 'Porque precisamos de Deus para sermos salvos', '2026-05-16 00:18:12.434336+00', '2026-05-16 00:18:12.434336+00', NULL
),
(
  '0b323b2c-c62d-4e19-8242-2c02293ab84d', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 2, 'Traz descanso para o coração ', '2026-05-16 00:18:12.434336+00', '2026-05-16 00:18:12.434336+00', NULL
),
(
  'e9a162bc-8239-4984-8886-4e9d9d16e24c', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '4923904c-0624-414c-a226-c0e44bf04174', 0, 'Significa que eu tenho um propósito pra vida, que eu não nasci acidentalmente.', '2026-05-18 21:57:34.134131+00', '2026-05-18 21:57:34.134131+00', NULL
),
(
  '9c995827-6f81-4847-a2cf-8ba012951e56', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '4923904c-0624-414c-a226-c0e44bf04174', 1, 'Talvez salvar ele de um acidente, não só isso como dar a vida por ele, como Jesus fez por nós.', '2026-05-18 21:57:34.134131+00', '2026-05-18 21:57:34.134131+00', NULL
),
(
  'a5d5e97f-b3c6-4926-9eb4-f7ad60887d26', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '4923904c-0624-414c-a226-c0e44bf04174', 2, 'Muda saber que Deus deu seu filho para nós salvar, e isso significa que nós temos uma longa vida pra viver, muitas conquistas para conquistar.', '2026-05-18 21:57:34.134131+00', '2026-05-18 21:57:34.134131+00', NULL
),
(
  '3c325eed-75df-483d-9fd0-64439c690c45', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'e3645858-1004-4f31-8d73-708e1749c4bd', 0, 'Para mostrar do que elas são possíveis, para que elas mostram que são melhores que todos.', '2026-05-19 22:54:56.229271+00', '2026-05-19 22:54:56.229271+00', NULL
),
(
  '60274e4b-4121-43e3-bda0-cd014b22e009', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'e3645858-1004-4f31-8d73-708e1749c4bd', 1, 'Isso significa que o amor de Deus por nós não depende de quem somos ou do nosso valor, e sim mostrando o nosso amor por ele.', '2026-05-19 22:54:56.229271+00', '2026-05-19 22:54:56.229271+00', NULL
),
(
  '565bf9a6-dbec-498e-9f35-c7d044273471', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'e3645858-1004-4f31-8d73-708e1749c4bd', 2, 'Na minha opinião muda saber que Deus nos adora, e não sobre como mostramos nossos valor tentando ser o melhor de todos, e sim mostrando o quanto tem fé nele.', '2026-05-19 22:54:56.229271+00', '2026-05-19 22:54:56.229271+00', NULL
),
(
  '597d2c9c-5156-45c6-86c8-daa62f67fee5', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 0, 'Que a gente se renova ', '2026-05-14 19:09:12.084641+00', '2026-05-14 19:09:12.084641+00', NULL
),
(
  '4e522c9b-44ac-4dab-b6ac-5f370660e661', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 1, ' Por que quem define é o Deus Pai', '2026-05-14 19:09:12.084641+00', '2026-05-14 19:09:12.084641+00', NULL
),
(
  '681e04c8-17f7-4a12-aeba-541bde57fa06', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 2, 'Ele por nos', '2026-05-14 19:09:12.084641+00', '2026-05-14 19:09:12.084641+00', NULL
),
(
  '72342d46-bd1e-4c85-8c64-cd4d81593964', '914b898d-24a3-46ad-a764-d2f24e5115d1', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 0, 'Foi perdoada ', '2026-05-16 00:39:46.652887+00', '2026-05-16 00:39:46.652887+00', NULL
),
(
  'f1333e79-4fa2-4768-b5c6-2913623a7824', '914b898d-24a3-46ad-a764-d2f24e5115d1', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 1, 'Porque deve ser Jesus ', '2026-05-16 00:39:46.652887+00', '2026-05-16 00:39:46.652887+00', NULL
),
(
  '3dc65e8a-6032-428e-84b7-eff267ff3332', '914b898d-24a3-46ad-a764-d2f24e5115d1', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 2, 'Viver em paz e alegria ', '2026-05-16 00:39:46.652887+00', '2026-05-16 00:39:46.652887+00', NULL
),
(
  '7481ee91-ecef-4fd0-8901-51988c78093a', '9289d1ce-a632-4cd7-930e-73023e549ec5', '4923904c-0624-414c-a226-c0e44bf04174', 0, 'Nunca estar sozinho,ter uma pessoa de confiança que te ama pelo que você é, não o que faz', '2026-05-18 22:24:36.943219+00', '2026-05-18 22:24:36.943219+00', NULL
),
(
  'be6b6fc2-3c97-40ca-9cb4-25627f857a0b', '9289d1ce-a632-4cd7-930e-73023e549ec5', '4923904c-0624-414c-a226-c0e44bf04174', 1, 'Ama,aconselha,protege,sempre está junto nunca deixando o filho sozinho,vira um modelo de pessoas que o filho quer virar no futuro', '2026-05-18 22:24:36.943219+00', '2026-05-18 22:24:36.943219+00', NULL
),
(
  '2eff539c-3f6f-42a4-bbcf-df190f990cd2', '9289d1ce-a632-4cd7-930e-73023e549ec5', '4923904c-0624-414c-a226-c0e44bf04174', 2, 'Que Deus não é uma autoridade que você tem medo,mas uma pessoa próxima como um pai mesmo que você conversa e vive junto', '2026-05-18 22:24:36.943219+00', '2026-05-18 22:24:36.943219+00', NULL
),
(
  '6eeb28c3-868d-46ef-a49a-369dda2ba787', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'e3645858-1004-4f31-8d73-708e1749c4bd', 0, 'Para ser elogiadas e adimiradas', '2026-05-19 23:11:11.075691+00', '2026-05-19 23:11:11.075691+00', NULL
),
(
  'b7caad34-39d1-430c-87a2-4324463967f5', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'e3645858-1004-4f31-8d73-708e1749c4bd', 1, 'Que Deus Deus seu filho unigênito para morrer na cruz pornós', '2026-05-19 23:11:11.075691+00', '2026-05-19 23:11:11.075691+00', NULL
),
(
  '9fae2468-b132-4068-82d4-b2d84b18a83c', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'e3645858-1004-4f31-8d73-708e1749c4bd', 2, 'Muda aqui é a gente é filho de Deus ', '2026-05-19 23:11:11.075691+00', '2026-05-19 23:11:11.075691+00', NULL
),
(
  'cb12ee97-f734-4b94-b0c4-6a4fd97d3f80', '9289d1ce-a632-4cd7-930e-73023e549ec5', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 0, 'É ser uma nova pessoa,com pensamentos e valores diferentes', '2026-05-14 21:30:50.410279+00', '2026-05-14 21:30:50.410279+00', NULL
),
(
  '4bc0cea2-b745-40d7-b2a5-29fda436fd4c', '9289d1ce-a632-4cd7-930e-73023e549ec5', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 1, 'Pois o que nos define é ser a criação de Deus,e pertencer a Ele', '2026-05-14 21:30:50.410279+00', '2026-05-14 21:30:50.410279+00', NULL
),
(
  '709d4c4b-be74-4192-9a2f-276f6822b328', '9289d1ce-a632-4cd7-930e-73023e549ec5', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 2, 'Agora somos perdoados,temos esperança, fé,respeito e educação pelos outros', '2026-05-14 21:30:50.410279+00', '2026-05-14 21:30:50.410279+00', NULL
),
(
  '6aee0a02-c0f7-48f7-9e8f-4620670eb1d6', 'a608622c-4120-4d15-949f-235ca64db2cf', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 0, 'Significa que Deus nos ama', '2026-05-16 00:57:46.267059+00', '2026-05-16 00:57:46.267059+00', NULL
),
(
  'bc0a6ab2-198f-4778-a5f2-f5377cfcbcb0', 'a608622c-4120-4d15-949f-235ca64db2cf', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 1, 'Por que é Deus que nos ajuda', '2026-05-16 00:57:46.267059+00', '2026-05-16 00:57:46.267059+00', NULL
),
(
  'd0dc4867-e778-43aa-9d56-873ac74f7761', 'a608622c-4120-4d15-949f-235ca64db2cf', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 2, 'Muda meu ponto de vista de ver a vida ', '2026-05-16 00:57:46.267059+00', '2026-05-16 00:57:46.267059+00', NULL
),
(
  '8597b218-5637-4163-9832-235e2845ba52', '914b898d-24a3-46ad-a764-d2f24e5115d1', '4923904c-0624-414c-a226-c0e44bf04174', 0, 'Viver com alegria ', '2026-05-18 23:07:31.756506+00', '2026-05-18 23:07:31.756506+00', NULL
),
(
  '78aaaf68-56d6-4ae6-b68a-3008cda22a88', '914b898d-24a3-46ad-a764-d2f24e5115d1', '4923904c-0624-414c-a226-c0e44bf04174', 1, 'Tudo', '2026-05-18 23:07:31.756506+00', '2026-05-18 23:07:31.756506+00', NULL
),
(
  '7f98a073-d4f1-4e7f-89ff-e10f6c440660', '914b898d-24a3-46ad-a764-d2f24e5115d1', '4923904c-0624-414c-a226-c0e44bf04174', 2, 'Saber que estamos protegidos ', '2026-05-18 23:07:31.756506+00', '2026-05-18 23:07:31.756506+00', NULL
),
(
  '0a5da23f-d60b-43e0-97fc-e56d47a14fd7', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'e3645858-1004-4f31-8d73-708e1749c4bd', 0, 'Pra ser lembrada ', '2026-05-19 23:34:17.349209+00', '2026-05-19 23:34:17.349209+00', NULL
),
(
  'af5a8493-d439-48b6-8903-0387d6112a6b', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'e3645858-1004-4f31-8d73-708e1749c4bd', 1, 'Que Ele morreu por nós ', '2026-05-19 23:34:17.349209+00', '2026-05-19 23:34:17.349209+00', NULL
),
(
  '4b201164-d884-45e6-bf79-dd41558dce02', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'e3645858-1004-4f31-8d73-708e1749c4bd', 2, 'Saber que fomos perdoados e que Jesus mora no nosso coração ', '2026-05-19 23:34:17.349209+00', '2026-05-19 23:34:17.349209+00', NULL
),
(
  '0c35db6d-a61e-435c-ae0e-42d602f0d50d', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 0, 'Significa que nossa história não é formada pelos erros do passado, e sim por o que Jesus fez por nós, nossos pecados não define quem nós somos.', '2026-05-14 22:50:59.678418+00', '2026-05-14 22:50:59.678418+00', NULL
),
(
  'fde2aa10-4e3e-47c7-96a8-f7792ad72031', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 1, 'Porque Deus veio e restaurou todos nossos erros e pecados, e isso faz refletir de como podemos ter cada vez mais esperança, e os nossos erros, não podem definir todos, e sim o nossos caráter.', '2026-05-14 22:50:59.678418+00', '2026-05-14 22:50:59.678418+00', NULL
),
(
  'dc84ed56-5455-4e9f-af0e-3d1194d9d0ee', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 2, 'Mudou a forma como nós vemos o mundo, tendo mais esperança, crendo mais em Deus, tentando não cometer muitos erros.', '2026-05-14 22:50:59.678418+00', '2026-05-14 22:50:59.678418+00', NULL
),
(
  '83f98a68-0821-42d0-91f3-99b87acbff35', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 0, 'Isso significa, que Deus ama todos, perdoa-os pelos pecados, e ele não salva porque nós somos bons, e sim porque ele é.', '2026-05-16 01:15:16.090203+00', '2026-05-16 01:15:16.090203+00', NULL
),
(
  '92508a82-893a-44bb-acae-4353fdd672f0', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 1, 'Porque o pecado nos separa de Deus e nenhum esforço, obra ou dinheiro humano é capaz de pagar o preço por nossas falhas.', '2026-05-16 01:15:16.090203+00', '2026-05-16 01:15:16.090203+00', NULL
),
(
  '6f40c7a9-96a2-4337-a57b-7e51b9fbbd34', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 2, 'muda tudo, pois substitui a ansiedade de tentar "merecer" o amor divino por uma paz profunda e transformadora.', '2026-05-16 01:15:16.090203+00', '2026-05-16 01:15:16.090203+00', NULL
),
(
  'adc7a577-c2f4-4a18-b86c-26626d56932e', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '4923904c-0624-414c-a226-c0e44bf04174', 0, 'Significa servir servir a apenas um Deus um Deus que é pai filho e espírito santo ', '2026-05-18 23:23:29.342229+00', '2026-05-18 23:23:29.342229+00', NULL
),
(
  '8d3e5c18-562a-4fd5-a7ad-961e27e1eb01', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '4923904c-0624-414c-a226-c0e44bf04174', 1, 'Cuida, ama, MORRE ', '2026-05-18 23:23:29.342229+00', '2026-05-18 23:23:29.342229+00', NULL
),
(
  '537a915f-7259-4395-a88d-6104f63f51cb', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '4923904c-0624-414c-a226-c0e44bf04174', 2, 'Nos temos que ser gratos ', '2026-05-18 23:23:29.342229+00', '2026-05-18 23:23:29.342229+00', NULL
),
(
  'ee0f9ed9-0aac-41dc-90a2-23cc5355fd62', 'a608622c-4120-4d15-949f-235ca64db2cf', 'e3645858-1004-4f31-8d73-708e1749c4bd', 0, 'Para serem valorizadas', '2026-05-19 23:51:25.073481+00', '2026-05-19 23:51:25.073481+00', NULL
),
(
  'd7c0787a-facc-45dd-b33b-54337facdb8a', 'a608622c-4120-4d15-949f-235ca64db2cf', 'e3645858-1004-4f31-8d73-708e1749c4bd', 1, 'Que o nosso valor já foi provado', '2026-05-19 23:51:25.073481+00', '2026-05-19 23:51:25.073481+00', NULL
),
(
  'd8462186-5d65-4996-9373-7d1b07acd614', 'a608622c-4120-4d15-949f-235ca64db2cf', 'e3645858-1004-4f31-8d73-708e1749c4bd', 2, 'Muda saber da sua importância ', '2026-05-19 23:51:25.073481+00', '2026-05-19 23:51:25.073481+00', NULL
),
(
  '336be6a4-af71-4441-8b9a-9a1bf845f252', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 0, 'Ser totalmente renovado por Deus ', '2026-05-14 23:21:33.139611+00', '2026-05-14 23:21:33.139611+00', NULL
),
(
  '16253d15-e404-45ad-8419-f46264f4668e', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 1, 'Por que oque nos define é aquilo que Cristo fez por nós', '2026-05-14 23:21:33.139611+00', '2026-05-14 23:21:33.139611+00', NULL
),
(
  '83478039-63fd-4eb5-9ad3-864804b68d02', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 2, 'Simmm', '2026-05-14 23:21:33.139611+00', '2026-05-14 23:21:33.139611+00', NULL
),
(
  'ba28fb26-bc81-4766-8a98-ea96643bd97d', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', '5e859f9e-3016-4482-96fd-1cae2e76f966', 0, 'Teste', '2026-05-16 14:22:11.547563+00', '2026-05-16 14:22:11.547563+00', NULL
),
(
  'e57e0cd4-59bb-4950-b552-2322cfd7d5e2', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', '5e859f9e-3016-4482-96fd-1cae2e76f966', 1, 'Teste', '2026-05-16 14:22:11.547563+00', '2026-05-16 14:22:11.547563+00', NULL
),
(
  '333a2c91-07ce-4121-b0ea-4d8cba10bf3f', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', '5e859f9e-3016-4482-96fd-1cae2e76f966', 2, 'Teate', '2026-05-16 14:22:11.547563+00', '2026-05-16 14:22:11.547563+00', NULL
),
(
  '4daf2129-c4eb-430c-a013-04bc8caab505', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '4923904c-0624-414c-a226-c0e44bf04174', 0, 'Servir a Deus ', '2026-05-19 00:24:28.005091+00', '2026-05-19 00:24:28.005091+00', NULL
),
(
  'ad21058d-120e-4ff1-848c-9e706d5b461d', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '4923904c-0624-414c-a226-c0e44bf04174', 1, 'Ajuda ama ...', '2026-05-19 00:24:28.005091+00', '2026-05-19 00:24:28.005091+00', NULL
),
(
  'c1e05ce9-7ce3-4d42-82d4-b9f73adc8666', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '4923904c-0624-414c-a226-c0e44bf04174', 2, 'Que agente não vai como um servo mas sim como um filho ', '2026-05-19 00:24:28.005091+00', '2026-05-19 00:24:28.005091+00', NULL
),
(
  'b8604f89-49ef-4292-abd3-98db5f6808e8', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'e3645858-1004-4f31-8d73-708e1749c4bd', 0, 'Pois não sabem que o seu valor verdadeiro vem de Deus', '2026-05-20 01:16:18.547444+00', '2026-05-20 01:16:18.547444+00', NULL
),
(
  'c5155bba-2799-4934-ad24-c4ac054a38e7', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'e3645858-1004-4f31-8d73-708e1749c4bd', 1, 'Mostra quem meu valos vem de Deus e não preciso provar nada', '2026-05-20 01:16:18.547444+00', '2026-05-20 01:16:18.547444+00', NULL
),
(
  '1b4659fb-0ffd-4c5b-a601-0c232cfd895f', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'e3645858-1004-4f31-8d73-708e1749c4bd', 2, 'Se meu valos está em Deus vivo sem precisar provar nada pra ninguém ', '2026-05-20 01:16:18.547444+00', '2026-05-20 01:16:18.547444+00', NULL
),
(
  '64db140c-020e-4a0d-8d03-835e8004931a', '914b898d-24a3-46ad-a764-d2f24e5115d1', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 0, 'Que foi renovada', '2026-05-14 23:26:20.785163+00', '2026-05-14 23:26:20.785163+00', NULL
),
(
  '72c1d932-36ce-4ca4-a3e0-d7950839687e', '914b898d-24a3-46ad-a764-d2f24e5115d1', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 1, 'Porque o passado passou e temos que cuidar do hoje ', '2026-05-14 23:26:20.785163+00', '2026-05-14 23:26:20.785163+00', NULL
),
(
  'a0f74d08-3389-442e-9f22-f3616290e6cf', '914b898d-24a3-46ad-a764-d2f24e5115d1', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 2, 'Sim... pois nos purificando ', '2026-05-14 23:26:20.785163+00', '2026-05-14 23:26:20.785163+00', NULL
),
(
  '11743b8b-7e9c-4e17-b462-34e316f3f47d', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'eee167c1-76e1-4241-8703-83ef9c38e895', 0, 'Em situações quando falam mal do meu potencial, mais isso não pode me abalar e nessa situação tenho que mostrar do que sou capaz.', '2026-03-31 14:40:06.138296+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '79073de9-7740-4132-9314-584ed2972fea', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'eee167c1-76e1-4241-8703-83ef9c38e895', 1, 'Sabendo que eu sou capaz e não preciso ficar provando que tenho potencial para as outras pessoas e que eu tenho que tar em paz comigo mesmo, pois não tenho que viver de aprovações.', '2026-03-31 14:40:06.138296+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7f0bac2e-f8f0-4a10-998c-f4c86c86a08f', '2dcc9a0e-accc-42df-8c78-5577fc2669db', 'eee167c1-76e1-4241-8703-83ef9c38e895', 0, 'Quando estou triste', '2026-03-31 14:56:33.153761+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '49729406-bf55-48fe-bbb2-30e3ded941d4', '2dcc9a0e-accc-42df-8c78-5577fc2669db', 'eee167c1-76e1-4241-8703-83ef9c38e895', 1, 'Me sentindo melhor por que Deus me criou', '2026-03-31 14:56:33.153761+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'aa78763d-f0de-40e9-a947-cb0ec0dec55b', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'eee167c1-76e1-4241-8703-83ef9c38e895', 0, 'Nas mais difíceis ', '2026-03-31 15:20:29.789284+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7be5138f-c249-4354-aa02-6f2b623880e8', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'eee167c1-76e1-4241-8703-83ef9c38e895', 1, 'Parando pra pensar ', '2026-03-31 15:20:29.789284+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1a993292-0e27-4c25-9803-778a5bb8b48f', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'eee167c1-76e1-4241-8703-83ef9c38e895', 0, 'Quando me questionam e quando eu me sinto "sem valor"', '2026-03-31 15:22:02.736883+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7436a1b7-6061-4fe9-8553-4504bbafbca7', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'eee167c1-76e1-4241-8703-83ef9c38e895', 1, 'Através de Deus ', '2026-03-31 15:22:02.736883+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e1a32790-a231-41a8-9c7d-76b6f15cd83a', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'eee167c1-76e1-4241-8703-83ef9c38e895', 0, 'Situações como jogos e atividades de competição ', '2026-03-31 15:36:37.233341+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2fd1de8d-930e-44f1-a3a7-e936765c5728', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'eee167c1-76e1-4241-8703-83ef9c38e895', 1, 'Traz descanso de inúmeras formas mas principalmente de que EU saiba que Deus me ama e não preciso mostrar meu valor pra ninguém ', '2026-03-31 15:36:37.233341+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '82bbb6b9-ac6b-4c38-83bf-cbf41c17c4f7', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'eee167c1-76e1-4241-8703-83ef9c38e895', 0, 'Em ambientes competitivos como ( escola , apresentações, provas. ', '2026-03-31 15:54:06.278555+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2126cbab-c0c3-4357-bc3d-69ffa09cad17', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'eee167c1-76e1-4241-8703-83ef9c38e895', 1, 'Pensando que a prova mede o que eu aprendi no momento, não o meu valor como pessoa ', '2026-03-31 15:54:06.278555+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0b261a79-6843-42c8-9f84-6edaa1110e7c', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'eee167c1-76e1-4241-8703-83ef9c38e895', 0, 'No colégio ', '2026-03-31 16:06:14.830251+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4117a0fc-219a-4c04-b54e-2080f7436a2a', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'eee167c1-76e1-4241-8703-83ef9c38e895', 1, 'Que eu não preciso me preocupar pois eu não preciso da aprovação dos outros ', '2026-03-31 16:06:14.830251+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c616665f-fc81-43f1-bc56-e0d7d4010e03', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', 'eee167c1-76e1-4241-8703-83ef9c38e895', 0, 'No meu estudo e na minha vida pessoal ', '2026-03-31 19:57:25.795021+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '39c73f30-67c6-4342-a22f-e77acd76aa3b', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', 'eee167c1-76e1-4241-8703-83ef9c38e895', 1, 'Sabendo que Deus amou a todos nós da mesma maneira ', '2026-03-31 19:57:25.795021+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '306709a4-552b-47ec-90b7-ede120854be0', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'eee167c1-76e1-4241-8703-83ef9c38e895', 0, 'Quando me escluem de algumas coisas
', '2026-03-31 20:47:39.473133+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'eec96694-e357-4647-ae87-07bbba6a5923', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'eee167c1-76e1-4241-8703-83ef9c38e895', 1, 'Pois sei que as outras pessoas sabem como eu sou e como sou bom em algumas
', '2026-03-31 20:47:39.473133+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8fdf8035-37f6-471c-94c1-d969171f2ef1', '2f773751-38c2-45a1-8ee0-f5b856092730', '67371245-6041-4df2-987e-05ea6fd6a427', 0, 'Que sou criado com para me relacionar e amar as pessoas.', '2026-03-31 22:08:17.106766+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ecfc693d-7e81-4c86-8073-98a94b22c9ea', '2f773751-38c2-45a1-8ee0-f5b856092730', '67371245-6041-4df2-987e-05ea6fd6a427', 1, 'Em coisas, em bens, no estudo.', '2026-03-31 22:08:17.106766+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.devotional_responses (
  id, user_id, devotional_id, question_index, response, created_at, updated_at, church_id
)
VALUES
(
  '5d336c19-c047-48fb-9542-58741d9f862b', '2f773751-38c2-45a1-8ee0-f5b856092730', 'eee167c1-76e1-4241-8703-83ef9c38e895', 0, 'Quando as pessoas me criticam', '2026-03-31 22:09:41.924155+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5a4bfef4-92f7-470f-8837-21f60803bd92', '2f773751-38c2-45a1-8ee0-f5b856092730', 'eee167c1-76e1-4241-8703-83ef9c38e895', 1, 'Saber que Deus se alegra comigo, me tras paz.', '2026-03-31 22:09:41.924155+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '10fea9a0-0c74-46de-9c37-99d0b7e6639c', 'a608622c-4120-4d15-949f-235ca64db2cf', 'eee167c1-76e1-4241-8703-83ef9c38e895', 0, 'Em trabalhos', '2026-03-31 22:19:49.768639+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '74be4a33-413e-43e3-965f-a4f2083053e7', 'a608622c-4120-4d15-949f-235ca64db2cf', 'eee167c1-76e1-4241-8703-83ef9c38e895', 1, ' Entender que seu valor vem de Deus', '2026-03-31 22:19:49.768639+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c72d7244-378a-4fb6-b584-2055b8931726', '7640c7e4-6780-4c27-8a04-ae5ab375f580', 'eee167c1-76e1-4241-8703-83ef9c38e895', 0, 'Em uma prova , competição ou algo que quero que vejam que sou capas ', '2026-03-31 22:30:40.368717+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fb302d8c-b874-4b95-9131-d0a583a63c7d', '7640c7e4-6780-4c27-8a04-ae5ab375f580', 'eee167c1-76e1-4241-8703-83ef9c38e895', 1, 'Que eu posso ter valor aos olhos do pai ', '2026-03-31 22:30:40.368717+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'da26ec3e-5d46-4c29-980e-ea35af74b18f', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'eee167c1-76e1-4241-8703-83ef9c38e895', 0, 'Não preciso provar meu valor pois Deus ja me conhece. O que Deus espera de mim é que eu demonstre meus valores através de minhas atitudes.', '2026-03-31 23:06:43.555666+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '07e4ce8d-1ada-49bc-bbeb-b44c7f06696f', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'eee167c1-76e1-4241-8703-83ef9c38e895', 1, 'Ela me traz descanso pois acredito que estou fazendo o que agrada a Deus.', '2026-03-31 23:06:43.555666+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9529258d-5fd1-4cfa-b2cd-c620490afc0a', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', 'eee167c1-76e1-4241-8703-83ef9c38e895', 0, 'No momento  que quero passar de ano.', '2026-03-31 23:39:35.487348+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '48bd71c7-47a6-4bf9-aa88-4ed9d2147906', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', 'eee167c1-76e1-4241-8703-83ef9c38e895', 1, 'Pedindo ajuda para Deus  e me esforçando. ', '2026-03-31 23:39:35.487348+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1e3d2580-4544-4363-b133-6da5ee95510b', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'eee167c1-76e1-4241-8703-83ef9c38e895', 0, 'Quando duvidam de mim', '2026-03-31 23:39:52.544494+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5ef22974-bc55-4a56-82c7-4a4897586cc9', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'eee167c1-76e1-4241-8703-83ef9c38e895', 1, 'Confiando em deus', '2026-03-31 23:39:52.544494+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '54aef24c-41f9-4b1a-9c7c-f61cde6c7665', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'eee167c1-76e1-4241-8703-83ef9c38e895', 0, 'Quando eu estou na frente de muitas pessoas ', '2026-04-01 01:38:35.258672+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e14501c7-931d-4a66-87a1-66579379f425', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'eee167c1-76e1-4241-8703-83ef9c38e895', 1, 'Por que nós se sentimos mais confiantes ', '2026-04-01 01:38:35.258672+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ac0ef340-b53c-4853-91cc-e6aaccc99163', '2f773751-38c2-45a1-8ee0-f5b856092730', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 0, 'A muito tempo decidi ser quem Deus sonhou. ', '2026-04-01 11:25:43.895132+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5c441a3e-f4bf-44b9-9b32-437bfa378474', '2f773751-38c2-45a1-8ee0-f5b856092730', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 1, 'Isso trás paz, pois sei que ele me ama e tem o melhor pra mim. ', '2026-04-01 11:25:43.895132+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '586bb01f-81bf-4050-aefc-a413bffcae52', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 0, 'Não ', '2026-04-01 12:34:34.518001+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c093f0cf-022d-4caf-89be-1591cc5a6b90', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 1, 'Porque ele esta presente sempre ', '2026-04-01 12:34:34.518001+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e08777ea-e3e4-4daa-b45f-2feb15672df3', '8bf335ab-907e-497b-b08b-615ad716e722', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 0, 'Não, sempre com Deus, familiares ou até com amigos ', '2026-04-01 15:04:04.417015+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '001310a8-5439-4413-8af8-1fc7f2f4388f', '8bf335ab-907e-497b-b08b-615ad716e722', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 1, 'É gratificante, por que eu tenho um propósito para cumprir, que Deus me deu ', '2026-04-01 15:04:04.417015+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a09ba322-cec9-430e-95c7-44331f77623a', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 0, 'As vezes sim ', '2026-04-01 17:04:49.821312+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '99ebe3d5-3937-4b1e-82e3-bf0faab76ce9', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 1, 'Meio estranho saber que Deus já tem um propósito preparado para mim', '2026-04-01 17:04:49.821312+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '30945500-abcf-42bf-b312-22343b180e14', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 0, 'As vezes sim ', '2026-04-01 17:35:41.06493+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '870547fb-55ad-44fe-8e58-2c003f8bc892', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 1, 'Bom pois sei que não preciso me preocupar com isso', '2026-04-01 17:35:41.06493+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5f8efd2c-84b9-49b4-9771-265bf2dc4eb0', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 0, 'Não ', '2026-04-01 21:02:31.389231+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '53fcf784-6b2d-4967-8a63-d247f3c76262', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 1, 'Muito bom', '2026-04-01 21:02:31.389231+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'eef38d0e-f6df-4e70-82b0-1dcfc6e1c0ff', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 0, 'Teste', '2026-05-16 14:23:22.648261+00', '2026-05-16 14:23:22.648261+00', NULL
),
(
  '90c2e6ba-de8d-422d-a9cd-f859a6b0e7d7', '9289d1ce-a632-4cd7-930e-73023e549ec5', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 0, 'Sim,pois quero ser agradável para os outros', '2026-04-01 22:00:02.31212+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '48044c98-d01a-420c-9d94-aca3592c55ea', '9289d1ce-a632-4cd7-930e-73023e549ec5', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 1, 'Bom,porque confio nele,e quero ter um propósito na vida,que seja algo bom', '2026-04-01 22:00:02.31212+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1f156e6a-fcea-453e-8f4c-089218b5e270', '7640c7e4-6780-4c27-8a04-ae5ab375f580', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 0, 'As vezes sim ', '2026-04-01 22:01:26.300139+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f45d0d99-b9fb-4f2c-80ec-a73217e493d8', '7640c7e4-6780-4c27-8a04-ae5ab375f580', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 1, 'É saber que minha vida vai dar certo por que Deus organizou ela pra mim ', '2026-04-01 22:01:26.300139+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2148a416-3467-4064-8578-8985e3d6054f', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 0, 'Não.', '2026-04-01 22:10:12.146673+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '064eb1d6-ebfa-4bc6-be4c-8140532ac1bd', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 1, 'É um sentimento bom saber que Deus está cuidando da minha vida .', '2026-04-01 22:10:12.146673+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fd61ecfb-bae0-4670-8058-9df10386a686', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 0, 'Sim', '2026-04-01 22:12:21.292966+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '548a0429-1a78-431d-9e15-0ebff42512d6', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 1, 'Bom , mas fico um pouco aflita em não saber o que pode acontecer no amanhã ', '2026-04-01 22:12:21.292966+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3d624ce3-adfe-43bb-b237-6f19558ef4f3', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 0, 'Não, minha identidade é criada pela experiência de vida, minhas culturas e religiões.', '2026-04-01 22:22:16.512553+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f8a43ec5-788f-49d2-ad8c-f7e1e868cbd5', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 1, 'Eu acredito que Deus sempre tem um propósito pra todas as coisas.', '2026-04-01 22:22:16.512553+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2c0538ec-5961-48b6-853a-7315e70778d4', 'a608622c-4120-4d15-949f-235ca64db2cf', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 0, 'Sim', '2026-04-01 22:26:43.929632+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1f3d0890-4818-4b92-9189-b6f2f6589833', 'a608622c-4120-4d15-949f-235ca64db2cf', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 1, 'É bom', '2026-04-01 22:26:43.929632+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '77c6ff7b-7a9c-4837-b7ff-1d0991ab8205', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 0, 'Sim', '2026-04-01 22:49:55.724182+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4480df53-4603-49c3-8686-e2da5e4a4a6c', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 1, 'Bem curioso para nós ', '2026-04-01 22:49:55.724182+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '751beae4-3043-4904-96e1-94d907b20358', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 0, 'Não ', '2026-04-01 23:23:02.868521+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '05863e5d-3b47-452e-8096-36f48458ac8d', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 1, 'Bom porque Deus sabe o que a gente precisa ', '2026-04-01 23:23:02.868521+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f1e8a576-61bf-4893-b189-fb0d2174e218', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 0, 'Não ', '2026-04-01 23:29:37.581526+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9e06dcad-e799-4c1f-b48f-2a3e4867b04c', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 1, 'Que será tudo para o meu bem', '2026-04-01 23:29:37.581526+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4829236d-abd5-43aa-bffe-c6918016818e', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 0, 'Já tentei algumas vezes ', '2026-04-02 00:55:18.650602+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '44c28aaa-37ea-46e9-a5f2-001a63404f82', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 1, 'Maravilhoso!!!', '2026-04-02 00:55:18.650602+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '03d871bf-9ef5-467a-8677-4de543e88f70', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 0, 'Normalmente não peço ajuda a Deus e a outros familiares ', '2026-04-02 02:45:17.11634+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3101286b-16af-43eb-b18e-fc05a5498b63', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 1, 'É bom por um lado saber que ele já tem algum propósito pra me dar mais é meio estranho pensar nisso', '2026-04-02 02:45:17.11634+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '565a82d2-51a3-45c2-acc8-8b6db5d0c33d', '4d062445-4744-4007-a2ac-d7c4743fc979', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Nao', '2026-04-02 09:38:04.392089+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '94055af3-9c32-4bc6-b803-8bb1a95b2438', '4d062445-4744-4007-a2ac-d7c4743fc979', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'O valor de deus', '2026-04-02 09:38:04.392089+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '596590e0-173e-402e-ad6a-946bbdebecf2', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Não ', '2026-04-02 12:48:03.462801+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3594cf48-7cb7-4dc0-956d-ca6cad02c38a', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'Ela diz q eu n preciso me comparar aos outros ', '2026-04-02 12:48:03.462801+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '746b58cc-856c-4dee-ac5a-a6e87f6b4cfa', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Não presisa', '2026-04-02 13:16:01.496127+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '87afdd50-b610-449c-aca0-7bac1bad6643', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'Diz que Deus se sacrificou por nós ', '2026-04-02 13:16:01.496127+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '81e68893-0e2c-4e39-bced-c51a6f03763f', '2f773751-38c2-45a1-8ee0-f5b856092730', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Não. ', '2026-04-02 14:02:17.673829+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5523af40-6ebe-47d7-85aa-5b17251abd74', '2f773751-38c2-45a1-8ee0-f5b856092730', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'Deus me ama mesmo sem eu fazer nada para ele. ', '2026-04-02 14:02:17.673829+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'facf4356-e02e-4880-b4c4-7d5481daa419', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Não ', '2026-04-02 15:05:39.676065+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c7ed0827-6968-4453-bbeb-91e170e59e9c', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'Todo o peso do pecado', '2026-04-02 15:05:39.676065+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd0190acc-9145-4ca2-9c59-8dd22f33791e', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Não ', '2026-04-02 16:10:19.228141+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ff4e3bac-6e59-4cb7-8eeb-92eb8e5bff22', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'Que eu sou importante para Deus ', '2026-04-02 16:10:19.228141+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bc39e1b7-651c-4360-9c64-20716a907c6b', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Nao', '2026-04-02 16:54:31.098175+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4cfc7751-c8c7-42de-9a3b-4d3dcee36ece', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'Que ele nos ama,quando entregou seu único filho que nunca tinha pecado,para me salvar,logo eu uma pecadora', '2026-04-02 16:54:31.098175+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '257a2ca1-8f65-4735-a1dc-d13d76539d02', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Não Deus ama qualquer um do mesmo jeito ', '2026-04-02 17:56:55.707913+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '12f0b751-ef06-4b30-8c85-ef12750439a6', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'A crus revela que Deus nos ama antes do nosso desempenho ', '2026-04-02 17:56:55.707913+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b4340cd7-35ab-4b6c-b991-5bb46581340f', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Não,  pois Deus nos aceita do jeito que somos ', '2026-04-02 19:06:44.801116+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '40e8d956-0564-47be-aeeb-d3191a1b5706', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'A cruz diz que Deus nos ama antes do nosso desempenho ', '2026-04-02 19:06:44.801116+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6eb8595c-8bbd-4c78-a1e7-7803fb13fbac', 'a608622c-4120-4d15-949f-235ca64db2cf', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Nn,ninguém é perfeito', '2026-04-02 20:29:58.533791+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fdcef31e-f5bc-48a1-88eb-b1940d1535cf', 'a608622c-4120-4d15-949f-235ca64db2cf', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'Que Deus nos ama antes do nosso desempenho,  que nossa identidade é sustentada pelo amor de Deus revelado em Jesus ', '2026-04-02 20:29:58.533791+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '40d2e2c5-986e-4188-9841-35a3c194b61c', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Não ', '2026-04-02 20:30:28.583334+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3037c41b-7f1d-486e-bc5e-bba9e5c24793', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'Que eu tenho grande valor para Deus', '2026-04-02 20:30:28.583334+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0155fe35-172d-4882-bed6-6bbab2cd5402', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Não', '2026-04-02 20:34:54.76347+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '38e7e8ec-a71b-44df-87d8-d21b9f8e4551', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'O meu valor é grande', '2026-04-02 20:34:54.76347+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6c2b0af4-f1f1-4409-96b5-ff9a02af609b', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Nao', '2026-04-02 22:30:36.794382+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '62eb3ba4-ae92-46e8-828b-c76f25329243', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'Não precisamos ser perfeito para ser salvo', '2026-04-02 22:30:36.794382+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f493a6e5-1e08-433f-9f33-c443f493e874', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Não, pois Deus nos aceita como somos.', '2026-04-02 22:35:45.486428+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '852668b0-a41a-4c14-8a98-2c0f84a7d117', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'Que mesmo não sendo perfeito Deus nos ama.', '2026-04-02 22:35:45.486428+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '174c4dce-e6e5-4d6f-b96b-3c6c55d1ed90', '32a9f112-1192-4b2a-918f-c2895a76ade3', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Ser como ele', '2026-04-02 22:48:09.025689+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '72a31be6-93ab-4f7d-a261-6cde9593d752', '32a9f112-1192-4b2a-918f-c2895a76ade3', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'Diz que mesmo pecando somos amados', '2026-04-02 22:48:09.025689+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '227d7ae9-3ff1-497f-ad9a-5a6bd8b315e5', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Não pois Deus me ama do jeito que sou ', '2026-04-02 23:05:14.767108+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '600f18aa-9915-4a1b-bad2-25daee38b8ab', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'Que Deus acredita em mim mesmo pecando e não sendo perfeita ', '2026-04-02 23:05:14.767108+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '931e6bae-d88a-42e9-ab48-13b515ef3ef7', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Acho que não precisamos ser perfeitos, pois ninguém é perfeito, indiferente de quem seja, mas para ser aceito por Deus precisamos ser boas pessoas, que espalham o amor de Deus para os outros', '2026-04-02 23:07:05.956686+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'eeae7d70-308f-49e8-9cf2-844a887c3596', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'A cruz nos mostra o quanto Deus nos ama, pois entregou seu único filho para morrer por nós pecadores, e essa é maior forma de amor', '2026-04-02 23:07:05.956686+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ffb31e94-7a67-4097-885e-ad02ea9a23ba', '914b898d-24a3-46ad-a764-d2f24e5115d1', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Não ', '2026-04-02 23:27:23.084539+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f1d29427-0e19-4a76-bf05-35cc450d8ee7', '914b898d-24a3-46ad-a764-d2f24e5115d1', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'Jesus morreu para nós salvar ', '2026-04-02 23:27:23.084539+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '83886f53-7664-4885-90f0-d1932bebb52c', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Não ', '2026-04-02 23:33:13.915618+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a0d2c5f0-0cef-4f86-83bd-b9e93b809830', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'Eu sou amada de forma incondicionalmente 
Eu sou muito importante 
Eu tenho valor mesmo quando acho que não tenho ', '2026-04-02 23:33:13.915618+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'de5a303c-7471-433a-b61e-295770a92e5c', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Não, por que na humanidade não existe perfeição.', '2026-04-02 23:41:43.354042+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ce24a0fd-866b-41ce-b654-f75cc8b66e38', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'Onde Jesus pagou com sua vida para o perdão de nossos pecados.', '2026-04-02 23:41:43.354042+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0b40042f-7732-4aab-8d7c-fcc20b481fb4', 'b486e185-6cb3-477c-936b-b204b143e329', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Não
', '2026-04-03 00:15:56.410906+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6b791b4c-7170-4a58-90dc-06abd7cda489', 'b486e185-6cb3-477c-936b-b204b143e329', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'Muita coisa ', '2026-04-03 00:15:56.410906+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '82dc787e-dbd7-45c0-ae52-126c4dab1a86', 'e57ed6e7-953a-4210-965b-26b336ba7da1', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Perfeito não, mas devemos nos arepender dos pecados e não fazer errado novamente ', '2026-04-03 00:22:19.336844+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a23fee8f-0c46-49e9-b9d7-1dd9208fc639', 'e57ed6e7-953a-4210-965b-26b336ba7da1', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'Que somos amados por Deus ', '2026-04-03 00:22:19.336844+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3989f105-7ee0-42c4-9140-2b99b173e3e3', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Não ', '2026-04-03 00:23:38.877899+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6c4311e7-9166-423a-abec-9d9f4b84e061', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'A cruz revela que Deus nos ama antes no nosso desempenho.', '2026-04-03 00:23:38.877899+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5fb221da-f4e9-4218-9f12-342bc25ff287', '9a0c5687-f135-4377-a410-58592ef8737a', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Deus ama todos nos ', '2026-04-03 00:30:01.941487+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f44f5349-40ac-4dcd-8420-4bbdcbb67dbe', '9a0c5687-f135-4377-a410-58592ef8737a', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'Deus nos ama antes do desempenho ', '2026-04-03 00:30:01.941487+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '24134e7c-fe6e-4cbb-aba5-70f42b80b7f6', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Não ', '2026-04-03 00:41:16.85931+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cdf05bff-ddb9-4e63-b813-1be4022f4560', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'Que Deus me ama ', '2026-04-03 00:41:16.85931+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c2e23cca-c7f3-4b3f-b8ee-8122d32578a3', '9289d1ce-a632-4cd7-930e-73023e549ec5', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Não,pois ninguém é perfeito,todos tem defeitos,e erram,e Deus ama nós do jeito que somos', '2026-04-03 00:56:36.030662+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.devotional_responses (
  id, user_id, devotional_id, question_index, response, created_at, updated_at, church_id
)
VALUES
(
  'f7172f39-92c2-4e85-8480-6d9b4cb9a846', '9289d1ce-a632-4cd7-930e-73023e549ec5', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'A cruz diz que nos ama,mesmo quando erramos,porque nosso valor não desaparece assim,pois ainda temos fé', '2026-04-03 00:56:36.030662+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '79c63086-3661-4e77-a18b-ebd2f9b8e92a', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Não ', '2026-04-03 02:13:27.290758+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '72a8e2b0-e588-4842-9059-45b553e3abc7', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'Diz q Jesus morreu por nós para que nós não fôssemos pecadores ', '2026-04-03 02:13:27.290758+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5c602f66-8a4c-411b-87ec-9650791507a5', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Acho que não ele nos ama do jeito que somos', '2026-04-03 02:27:40.588219+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5e733b06-6bb2-4f8a-8c25-7be210b0259f', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'A cruz significa que que mesmo no pecado Deus enviou seu filho para nos salvar dos pecados ', '2026-04-03 02:27:40.588219+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '314936a5-3f20-4ce6-98bf-284a636f4dcf', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 0, 'Ajudar os outros', '2026-04-03 10:42:43.576549+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '52a3404d-8f21-4f3e-ac2d-b5d67ea33f9d', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 1, 'Me chamando a cada vez aprender mais da palavra de Deus ', '2026-04-03 10:42:43.576549+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '39bc0a74-ef26-4103-813c-d7d3177474e5', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 0, 'Orando toda noite ', '2026-04-03 11:41:07.226823+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1f925fa3-8379-437b-9890-46968578a4b5', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 1, 'Me dando fé ', '2026-04-03 11:41:07.226823+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8a7f0292-8571-43f0-9abf-d381eef3fc0c', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 0, 'Falando sobre a palavra de Deus para as outras pessoas. ', '2026-04-03 12:23:02.045176+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0caacf6c-5e58-4b36-bd0c-5b06c4d6b1aa', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 1, 'Pedindo perdão e me arrependendo.  ', '2026-04-03 12:23:02.045176+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '18b2b906-d523-473e-ba8a-8966c68945f0', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 0, 'Em nossas atitudes ', '2026-04-03 12:28:26.444542+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd586dccf-22ce-41c0-b210-53041f5b83a9', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 1, 'Cristo restaura em nós aquilo que foi afetado pelo pecado ', '2026-04-03 12:28:26.444542+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '537d388c-4370-446b-bfea-d47e8c7bb008', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 0, 'Bondade amor respeito ', '2026-04-03 12:47:43.835239+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f6386858-5940-4951-bc2c-96f2ca24d2fa', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 1, 'Quando pedimos perdão ', '2026-04-03 12:47:43.835239+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '95a1d5dd-ccd3-4c90-b1af-fc7df91b0955', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 0, 'As atitudes boas', '2026-04-03 15:38:29.127927+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '71aa1d72-1fbe-48dd-acd7-bbef21d63ec9', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 1, 'Me tornando uma pessoa melhor', '2026-04-03 15:38:29.127927+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2d377f1c-6487-41a0-b5e1-2e03d57bbab5', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 0, 'Ser fiel', '2026-04-03 16:18:09.789973+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '99665b52-5fea-417e-ab5e-50595ea36a67', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 1, 'Quando nos temos fé e acreditamos nele', '2026-04-03 16:18:09.789973+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5cf063c8-767c-4131-aa5c-fa91b5c765d8', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 0, 'Perdão ', '2026-04-03 16:20:59.195491+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '58f8f952-7cac-4b45-ae58-dfbe70c69aa7', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 1, 'Quando pedimos perdão pelos nossos pecados', '2026-04-03 16:20:59.195491+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '16d75db2-9903-4601-ab0a-a9f7c5d36d49', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 0, 'perdoar alguém que me magoou.
ajudar quem precisa.
ter paciência em vez de agir com raiva.
ser honesto mesmo quando ninguém está vendo.
tratar todos com respeito.', '2026-04-03 16:43:22.581924+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd8fc8d50-5665-4caf-8fbe-cfd4fd094839', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 1, 'Me lembra do meu valor .
Me chama de filha.
Me dá um novo começo .
Transforma meu interior .', '2026-04-03 16:43:22.581924+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fa651888-9e90-49b0-bcb3-61af88789ef5', '32a9f112-1192-4b2a-918f-c2895a76ade3', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 0, 'Sou muito gentil', '2026-04-03 16:55:42.836795+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'dd7221eb-83fa-4b5a-bc46-eea35e0f22fd', '32a9f112-1192-4b2a-918f-c2895a76ade3', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 1, 'Ele me deixa todo dia bem', '2026-04-03 16:55:42.836795+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'dfc14aff-8a2a-4417-b1f8-88f4f85e810d', '2f773751-38c2-45a1-8ee0-f5b856092730', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 0, 'Paciencia com as pessoas', '2026-04-03 17:09:00.07343+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c37818c0-143c-4a22-ba7d-46f494e387c0', '2f773751-38c2-45a1-8ee0-f5b856092730', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 1, 'Ele tem me feito ser novamente parecido com Jesus.', '2026-04-03 17:09:00.07343+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '302aee77-0f32-4d07-bc34-0a2691aa2bdc', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 0, 'Amando o próximo ', '2026-04-03 18:15:11.340479+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7dd35f68-070c-46b2-971e-18310fc08584', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 1, 'Quando eu leio a Bíblia ', '2026-04-03 18:15:11.340479+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6f4d2160-7082-4358-92c6-20a2d14ac111', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', 'd860c7de-47c9-4665-bf9d-315cd5cd4e6f', 0, 'Sim, muitas vezes', '2026-04-03 19:54:25.487577+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ef136719-24aa-448f-8762-829fbdf49d96', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', 'd860c7de-47c9-4665-bf9d-315cd5cd4e6f', 1, 'Me sinto mais feliz por me sentir importante e amado', '2026-04-03 19:54:25.487577+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '70401655-ad3a-461a-9d90-4daed19ec7bc', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 0, 'Ir à igreja ', '2026-04-03 20:35:36.161942+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f3444bda-78df-42ab-bc03-3a0d759dcd6a', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 1, 'Restaura quando vou à igreja ', '2026-04-03 20:35:36.161942+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e8ee2c82-4c63-47d6-abc2-6dd701269adc', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 0, 'Ser honesto ir a igreja e respeitar os outros ', '2026-04-03 20:54:19.832722+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '56f2927c-494c-46c3-bfbe-ad977222754c', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 1, 'Através da salvação ', '2026-04-03 20:54:19.832722+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b328360e-a0bb-4b69-ac24-86219711c28c', 'a608622c-4120-4d15-949f-235ca64db2cf', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 0, 'Sem bom, ter atitudes boas
', '2026-04-03 21:53:32.458125+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4c77e1b6-b573-49a4-bd5d-30a8deb329fc', 'a608622c-4120-4d15-949f-235ca64db2cf', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 1, 'Ele restaura oque foi afetado pelo pecado', '2026-04-03 21:53:32.458125+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2df316c9-5568-45d1-9904-c42bc1f89cd2', '914b898d-24a3-46ad-a764-d2f24e5115d1', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 0, 'Orando', '2026-04-03 21:57:17.547725+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c45f870a-2dc4-48e5-9a52-673a3f8219c2', '914b898d-24a3-46ad-a764-d2f24e5115d1', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 1, 'Em boas atitudes ', '2026-04-03 21:57:17.547725+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '16784cf5-9960-4bcb-ba0d-3cd62ac18c6f', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 0, 'Ser fiel e não mentir ', '2026-04-03 22:01:47.205323+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c36b0484-66c1-4faf-9bce-bddb9534a683', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 1, 'Quando pesso perdão ', '2026-04-03 22:01:47.205323+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1517ad9f-699d-4c98-8d56-4488386b1ce6', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 0, 'Segundo a imagem que ele criou', '2026-04-03 22:19:37.395668+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0b1661e8-005e-422a-85e7-65253cdb1dac', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 1, 'Em Cristo nossa indentidade é renovada ', '2026-04-03 22:19:37.395668+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3d47810c-be8b-415a-aa02-879f1c12eca0', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 0, 'Honestidade amorosa ', '2026-04-03 22:33:02.969593+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3e4cdb67-ae20-4391-a76d-0bca7f2a9e7e', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 1, 'Tentar agir como Jesus iria agir no dia a dia', '2026-04-03 22:33:02.969593+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '65a485d1-8246-4ac2-a4d7-2d5a320c9186', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'd860c7de-47c9-4665-bf9d-315cd5cd4e6f', 0, 'Sim', '2026-04-03 22:37:24.369752+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5f86d40b-5f18-454d-bbef-58c20adcad67', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'd860c7de-47c9-4665-bf9d-315cd5cd4e6f', 1, 'Me sinto honrada e grata por Deus me criar ', '2026-04-03 22:37:24.369752+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fe342367-89b1-458f-a6fd-7228893079dc', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 0, 'Ajudar ao próximo, ter amor ao próximo e ter respeito ao próximo.', '2026-04-03 22:39:05.080581+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3ff650ed-9dc9-4c62-aabb-7d05e3cd5462', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 1, 'Pedir perdão a Deus, perdoar o próximo e trocar mentiras por verdades.', '2026-04-03 22:39:05.080581+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5d44b8aa-7271-4067-a526-1877a9cf8059', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 0, 'Ajudando os outros ', '2026-04-03 22:44:00.488793+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '10b3b8e7-9129-4fae-905a-ebfb4beba64a', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 1, '"Ele preenche aquilo que o pecado abre"diriamos', '2026-04-03 22:44:00.488793+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9da5113b-f249-4c5a-9768-a9a6ccfd7b18', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 0, 'Ajudar o próximo, ter comunhão com as pessoas ', '2026-04-03 23:05:17.421632+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4c434855-53ea-4b00-8d45-685bf05824af', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 1, 'A partir do perdão, quando se arrependemos verdadeiramente por algo ', '2026-04-03 23:05:17.421632+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a0070bb5-397a-4f1c-9c8a-b42e652fd809', '9289d1ce-a632-4cd7-930e-73023e549ec5', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 0, 'Quando peço desculpa à alguém, ajudo por querer,empresto meus materiais e lanche', '2026-04-03 23:20:31.442339+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '141e78a0-d0ba-482c-817a-94a4af87439a', '9289d1ce-a632-4cd7-930e-73023e549ec5', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 1, 'Faz a pessoa ter mais fé,bondade,paz,respeito, educação, entre outras coisas,e fazendo a pessoa não ser mais afetada pelos pecados', '2026-04-03 23:20:31.442339+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '031042c2-70da-4d2f-94d5-46c403bd83f4', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 0, 'Ajudar as pessoas em minha volta.
', '2026-04-04 01:38:08.656446+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '471eb052-381e-4705-87b9-e5a4580c55bd', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 1, 'Quando magoou alguém da minha família por exemplo eu reflito e depois peço perdão pela minha atitude ', '2026-04-04 01:38:08.656446+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3ac57ad9-d5bd-4d2c-a64b-ab9d9cc25c03', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'Em dinheiro e fama', '2026-04-04 16:32:37.041331+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f10db23d-7e69-41d5-9630-5ceb72077f1a', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Por que são coisas materiais', '2026-04-04 16:32:37.041331+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6d185f5a-ecf4-4ce5-9756-479053f9109e', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Muda que eu sei quem Deus é e sei seu poder ', '2026-04-04 16:32:37.041331+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '559173b4-0116-48a0-8fd6-bfe7184951e4', '66b31cf2-7782-4253-98ea-3b6d631703a4', 'd860c7de-47c9-4665-bf9d-315cd5cd4e6f', 0, 'Sim ', '2026-04-05 20:07:08.153155+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '57d1f5ea-e7ce-4101-9d50-760743147a3c', '66b31cf2-7782-4253-98ea-3b6d631703a4', 'd860c7de-47c9-4665-bf9d-315cd5cd4e6f', 1, 'Ter mais segurança e mais confiança na minha vida ', '2026-04-05 20:07:08.153155+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f0883da5-91a7-4492-a409-901d3e008807', '66b31cf2-7782-4253-98ea-3b6d631703a4', 'eee167c1-76e1-4241-8703-83ef9c38e895', 0, 'Quando as pessoas duvidam de mim ', '2026-04-05 20:15:49.257447+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c8b5126d-de48-439d-9ce2-eedf20145a36', '66b31cf2-7782-4253-98ea-3b6d631703a4', 'eee167c1-76e1-4241-8703-83ef9c38e895', 1, 'Não precisar da aprovação dos outros por que Deus me conhece melhor q todo mundo', '2026-04-05 20:15:49.257447+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '83ef1634-738b-4bfa-b0e5-fccf2b0c8314', '66b31cf2-7782-4253-98ea-3b6d631703a4', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 0, 'Não. Todos precisam de Deus ', '2026-04-05 20:19:08.919347+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c57fd66f-e986-4c63-afd4-10627a9556cc', '66b31cf2-7782-4253-98ea-3b6d631703a4', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 1, 'Saber que ele me ama ', '2026-04-05 20:19:08.919347+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8c94565e-95c6-4415-97c6-718ffb71ee58', '66b31cf2-7782-4253-98ea-3b6d631703a4', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 0, 'Não Deus me aceita  como eu sou ', '2026-04-05 20:21:36.609791+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0623f16f-a372-453e-9a14-bea1e008d336', '66b31cf2-7782-4253-98ea-3b6d631703a4', '786f53fd-8bef-4bf7-b1ff-b4f170ecd688', 1, 'Jesus morreu por mim e por você para nos salvar isso significa que ele nos ama ', '2026-04-05 20:21:36.609791+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '96df22a7-fb27-4af3-b399-1927a42c1799', '66b31cf2-7782-4253-98ea-3b6d631703a4', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 0, 'Honesta, justa, bondosa e leal a amizade ', '2026-04-05 20:25:54.418506+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '978f68d8-eabe-4ec7-a856-9c74ddc2aa85', '66b31cf2-7782-4253-98ea-3b6d631703a4', '79dd94fa-8eb6-4523-88c4-6079b71c1e6e', 1, 'Me tornando uma pessoa melhor ', '2026-04-05 20:25:54.418506+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7137d5a7-7615-407d-ab8d-5ffb20dd341e', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '5e859f9e-3016-4482-96fd-1cae2e76f966', 0, 'Trair à Deus ', '2026-04-06 00:37:09.01511+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ac1c03aa-ad00-4877-b22f-520049b0ba2e', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '5e859f9e-3016-4482-96fd-1cae2e76f966', 1, 'Pode afetar pela vida espiritual conexão com Deus ou até na vida profissional como mentir em algo importante e a mentira ser descoberta', '2026-04-06 00:37:09.01511+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cf2cde80-5264-4beb-990a-7eacf7364627', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '5e859f9e-3016-4482-96fd-1cae2e76f966', 2, 'Por que assim sabemos que devemos pedir perdão a Deus e que ninguém é perfeito ', '2026-04-06 00:37:09.01511+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8090ad59-76bd-4231-a7f2-4c717a7afce0', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'Redes sociais e opinião de pessoas ', '2026-04-06 02:07:55.741649+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7c6ab7ad-3cc2-4813-9bdd-2a9baeb0aa77', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Pois somente Deus sabe nos definir ', '2026-04-06 02:07:55.741649+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '80653088-404a-4a87-801b-7a86c40e962c', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Muda tudo em mim, me deixa mais feliz', '2026-04-06 02:07:55.741649+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '915ba05a-986a-4288-8a12-c64086e65c0e', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '12f627ce-ad3a-45d1-b90a-6282070e9524', 0, 'Bem ', '2026-04-06 09:38:35.649422+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f827edb5-ddd2-4341-95b3-c21569d62d3e', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '12f627ce-ad3a-45d1-b90a-6282070e9524', 1, 'Sim ', '2026-04-06 09:38:35.649422+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b272c152-805e-46fd-8458-b1ac2c407c2d', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '12f627ce-ad3a-45d1-b90a-6282070e9524', 0, 'Bom,tenho amigos ', '2026-04-06 10:09:25.900685+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ade8884c-1150-49c8-8039-2ef95432e79d', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '12f627ce-ad3a-45d1-b90a-6282070e9524', 1, 'Sim ', '2026-04-06 10:09:25.900685+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '08ccd7d3-ae95-499b-a4cc-7aa6b4dd66c2', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '12f627ce-ad3a-45d1-b90a-6282070e9524', 0, 'Estão bons', '2026-04-06 12:02:22.586428+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0a150827-a79f-43ba-b05b-8e4eb7586110', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '12f627ce-ad3a-45d1-b90a-6282070e9524', 1, 'Sim, até demais', '2026-04-06 12:02:22.586428+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f634fe15-59f1-460a-b89a-3b703ccc887f', '2f773751-38c2-45a1-8ee0-f5b856092730', '12f627ce-ad3a-45d1-b90a-6282070e9524', 0, 'Tenho bons amigos e confiáveis. ', '2026-04-06 12:33:30.000911+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '35f01038-0922-4693-9c57-80aa77251da7', '2f773751-38c2-45a1-8ee0-f5b856092730', '12f627ce-ad3a-45d1-b90a-6282070e9524', 1, 'Sim. Todos os dias. ', '2026-04-06 12:33:30.000911+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4847b2b5-f917-4fb0-a074-f799b528d0da', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '12f627ce-ad3a-45d1-b90a-6282070e9524', 0, 'São bons', '2026-04-06 13:34:14.251155+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '90f1684e-9b91-4c50-b21b-f08545fb20b0', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '12f627ce-ad3a-45d1-b90a-6282070e9524', 1, 'Sim, indo a igreja e fazendo os devocionais', '2026-04-06 13:34:14.251155+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fd15aa38-321f-4e0d-b76b-afc86139e4be', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '12f627ce-ad3a-45d1-b90a-6282070e9524', 0, 'Bem.', '2026-04-06 14:09:35.050828+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0a49bf25-9f8c-4ab5-b078-3e442d59a2dd', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '12f627ce-ad3a-45d1-b90a-6282070e9524', 1, 'Simmm.', '2026-04-06 14:09:35.050828+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c6ec7e07-5c25-4801-8aee-193f79cb5c53', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '12f627ce-ad3a-45d1-b90a-6282070e9524', 0, 'Bem', '2026-04-06 14:21:04.271682+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3a091ac0-5c28-4725-8a92-fe5a470c3e7b', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '12f627ce-ad3a-45d1-b90a-6282070e9524', 1, 'Sim todos os dias', '2026-04-06 14:21:04.271682+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6587e556-b83f-4d25-b49f-197a74cf3c9b', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '12f627ce-ad3a-45d1-b90a-6282070e9524', 0, 'Saudáveis ', '2026-04-06 15:11:28.337702+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cf8c3e4a-4c5d-4a41-81b1-1c0862056a08', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '12f627ce-ad3a-45d1-b90a-6282070e9524', 1, 'Sim,muito.', '2026-04-06 15:11:28.337702+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8bdfa609-6dc8-460f-8756-78281b8a0183', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '12f627ce-ad3a-45d1-b90a-6282070e9524', 0, 'Meus relacionamentos estão indo bem, pois tenho buscado viver em comunhão com as pessoas ao meu redor.', '2026-04-06 15:36:15.926456+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '75e705c5-fc14-44d4-a2e0-08472fc24797', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '12f627ce-ad3a-45d1-b90a-6282070e9524', 1, 'Sim, muito .', '2026-04-06 15:36:15.926456+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1c1bfa55-46a4-4490-8e07-d16473c9f738', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '12f627ce-ad3a-45d1-b90a-6282070e9524', 0, 'Sempre me dou bem e respeito a todos ', '2026-04-06 15:39:18.106976+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f5946016-523a-4b88-acc1-01715d9aa92e', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '12f627ce-ad3a-45d1-b90a-6282070e9524', 1, 'Sim, através das orações e da fé ', '2026-04-06 15:39:18.106976+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '64c52a16-11d8-4979-bfe9-881d52033795', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '12f627ce-ad3a-45d1-b90a-6282070e9524', 0, 'Bons ', '2026-04-06 19:59:09.701405+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '04949d7a-89db-497f-8dfe-abbdaf8418c8', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '12f627ce-ad3a-45d1-b90a-6282070e9524', 1, 'Sim ,toda noite eu faço uma oração ', '2026-04-06 19:59:09.701405+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd4f5f35a-5d17-42c6-8503-65208826e05f', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '12f627ce-ad3a-45d1-b90a-6282070e9524', 0, 'Bens', '2026-04-06 20:44:41.699213+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '65d59592-ffbf-4dcc-8379-a679049b633f', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '12f627ce-ad3a-45d1-b90a-6282070e9524', 1, 'Sim t9do dia', '2026-04-06 20:44:41.699213+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.devotional_responses (
  id, user_id, devotional_id, question_index, response, created_at, updated_at, church_id
)
VALUES
(
  'fe6a12cd-405b-418e-b57e-18426978167c', '9289d1ce-a632-4cd7-930e-73023e549ec5', '12f627ce-ad3a-45d1-b90a-6282070e9524', 0, 'Com minha família e meus amigos estão bons', '2026-04-06 21:07:22.792984+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1053327f-0b7d-4956-ba8e-5d1dd9e7ed20', '9289d1ce-a632-4cd7-930e-73023e549ec5', '12f627ce-ad3a-45d1-b90a-6282070e9524', 1, 'Sim,para ter uma vida com mais fé,e respeito', '2026-04-06 21:07:22.792984+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f1986e52-22c2-43a1-bb25-fbfc3dac251e', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '12f627ce-ad3a-45d1-b90a-6282070e9524', 0, 'Eu acredito que esteja bem.', '2026-04-06 22:15:50.230771+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd802d06e-5e36-4635-b5fd-2586530cb6a5', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '12f627ce-ad3a-45d1-b90a-6282070e9524', 1, 'Sim todo dia tento me aproximar mais, lendo a bíblia, falando de Deus pras pessoas...', '2026-04-06 22:15:50.230771+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '14657530-2c2b-45c8-916b-ca3b83c09dae', '66b31cf2-7782-4253-98ea-3b6d631703a4', '4923904c-0624-414c-a226-c0e44bf04174', 0, 'Ser filha do criador do mundo ', '2026-04-06 22:52:28.602875+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c1321cea-4cd7-435c-bf3d-3f8c79365dae', '66b31cf2-7782-4253-98ea-3b6d631703a4', '4923904c-0624-414c-a226-c0e44bf04174', 1, 'Cuidar dele ', '2026-04-06 22:52:28.602875+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1e2ef8f8-9a08-471b-9232-1efdea3f951e', '66b31cf2-7782-4253-98ea-3b6d631703a4', '4923904c-0624-414c-a226-c0e44bf04174', 2, 'Tendo mais conhecimento sobre ele e confiando cada vez mais ', '2026-04-06 22:52:28.602875+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '35f1b27c-2c59-4db4-8c7b-19aa3b79e88b', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '12f627ce-ad3a-45d1-b90a-6282070e9524', 0, 'Estão muito bons, sempre tento ter muito amor com todos e ser uma pessoa legal e amigável.', '2026-04-06 22:52:35.210107+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c9823a27-7d66-40b2-9749-8368c747a423', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '12f627ce-ad3a-45d1-b90a-6282070e9524', 1, 'Sim, sempre busco me aproximar o mais próximo de Deus, não falar muitos palavrões, respeitar o próximo e orar bastante sempre.', '2026-04-06 22:52:35.210107+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5f3f19ea-0bf6-46df-9c57-929c7466efe9', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '482eee64-b951-46f1-a0b9-612a02013992', 0, 'Eu apenas deixo Ele me definir.', '2026-04-10 13:02:45.703269+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a48c3294-a775-4e7e-9bd9-1895061fa773', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '5e859f9e-3016-4482-96fd-1cae2e76f966', 0, 'Blasfêmia, ir contra a palavra de Deus e brincar ou usar o nome de Deus para besteiras', '2026-04-06 22:55:20.451564+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '13d01fd3-cb36-473c-acf5-d3c16f2f5558', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '5e859f9e-3016-4482-96fd-1cae2e76f966', 1, 'Por pessoas', '2026-04-06 22:55:20.451564+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '26f78a05-f7cd-40bd-911a-0a270846a398', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '5e859f9e-3016-4482-96fd-1cae2e76f966', 2, 'Que todos nós falhamos, erramos e nos afastamos de Deus', '2026-04-06 22:55:20.451564+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6f513da3-9eaa-44da-8aed-1c8164f99a00', '914b898d-24a3-46ad-a764-d2f24e5115d1', '12f627ce-ad3a-45d1-b90a-6282070e9524', 0, 'Bem ', '2026-04-06 23:10:26.396573+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ce0cce58-44ce-4ef7-9777-9b2d7f347e03', '914b898d-24a3-46ad-a764-d2f24e5115d1', '12f627ce-ad3a-45d1-b90a-6282070e9524', 1, 'Sim ', '2026-04-06 23:10:26.396573+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '95ab3e7b-4f4e-4f7f-82ea-dd0ba45fc1a9', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '12f627ce-ad3a-45d1-b90a-6282070e9524', 0, 'Estão muito bem ', '2026-04-06 23:31:46.035053+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2670c068-20e9-4559-bcfd-e73a51db952f', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '12f627ce-ad3a-45d1-b90a-6282070e9524', 1, 'Sim', '2026-04-06 23:31:46.035053+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'da949a73-5a7c-4e37-9e82-cd0e152ae4f6', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'Nas redes sociais, o que nós fazemos,ou o que sentimos.', '2026-04-06 23:55:37.275058+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'af122fa2-dc79-46d2-80f0-2025d57c4554', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Porque se não, seremos sempre inseguros.
Deus sabe quem somos e isso já basta,não precisamos mostrar quem somos pra ninguém. ', '2026-04-06 23:55:37.275058+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ee6eb92b-daf1-4304-8631-bcc64b7add91', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Me sinto amada e cuidada por Deus.', '2026-04-06 23:55:37.275058+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '63cecdc7-e39d-410d-84b4-7b33ca8d287c', '9a0c5687-f135-4377-a410-58592ef8737a', '4923904c-0624-414c-a226-c0e44bf04174', 0, 'Significa q nunca estaremos sozinhos, que temos um propósito ', '2026-04-07 00:12:01.590376+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '16858691-fb33-4316-91fc-af25b570508b', '9a0c5687-f135-4377-a410-58592ef8737a', '4923904c-0624-414c-a226-c0e44bf04174', 1, 'Ama,cuida e protege ', '2026-04-07 00:12:01.590376+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4ca30205-a4d4-45e4-a2ae-fe239e9a85eb', '9a0c5687-f135-4377-a410-58592ef8737a', '4923904c-0624-414c-a226-c0e44bf04174', 2, 'Que podemos ficar confiante que sempre Deus 
 estará conosco ', '2026-04-07 00:12:01.590376+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1eb443e3-16cc-4e61-a5c7-1a15505646b5', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '12f627ce-ad3a-45d1-b90a-6282070e9524', 0, 'As vezes estão bem e as vezes não estão bem ', '2026-04-07 00:24:34.315907+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '997b4f5b-01dd-46d9-8e81-6a1d0860964e', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '12f627ce-ad3a-45d1-b90a-6282070e9524', 1, 'Sim ', '2026-04-07 00:24:34.315907+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c9ef0b36-8602-4891-aacf-891034c83ae4', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '12f627ce-ad3a-45d1-b90a-6282070e9524', 0, 'Bons ', '2026-04-07 00:46:35.742575+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '500c3f2d-6bb5-430e-a9a6-50ff69e3d0d4', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '12f627ce-ad3a-45d1-b90a-6282070e9524', 1, 'Sim bastante ', '2026-04-07 00:46:35.742575+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bd4b88ef-f80a-4aec-bc9a-59da612e54c0', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '12f627ce-ad3a-45d1-b90a-6282070e9524', 0, 'Bons, fluindo bem e legais ', '2026-04-07 01:12:34.668131+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '12fde9a6-fce5-4406-ab34-01ea4a32c71e', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '12f627ce-ad3a-45d1-b90a-6282070e9524', 1, 'Sim', '2026-04-07 01:12:34.668131+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1f6e3a67-abe2-4b64-bc90-176d545f0670', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 0, 'Sim', '2026-04-07 03:09:24.703293+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '795a6e9c-af92-4f6b-8a62-1d4073be9dee', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 1, 'Não machucar meu corpo', '2026-04-07 03:09:24.703293+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0ae9eb73-e85e-4856-8236-14eeb350a8fe', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 0, 'Sim', '2026-04-07 10:03:40.789522+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0ec49dae-2421-4adc-8651-cbf3bff87715', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 1, 'Parando pra pensar', '2026-04-07 10:03:40.789522+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ed815f69-5a5c-4c9e-90af-60e5ece674f2', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 0, 'Sim pois eu sou único e Jesus pagou um alto preço ', '2026-04-07 10:04:14.700361+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '853a7109-727f-43b0-962d-72f332587431', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 1, 'Porque tudo o que eu faço devo fazer para Deus ', '2026-04-07 10:04:14.700361+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bebf4fdb-01bd-4b64-9110-2e4ca349021f', '4d062445-4744-4007-a2ac-d7c4743fc979', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 0, 'Sim', '2026-04-07 13:41:10.006439+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '619024fe-1a5d-4e39-aafa-592911a9acd4', '4d062445-4744-4007-a2ac-d7c4743fc979', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 1, 'Sim', '2026-04-07 13:41:10.006439+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'db3b4cd7-cec9-40e8-93ce-3fbc069aab46', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 0, 'Sim', '2026-04-07 14:41:36.272607+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e8c9793e-6494-473e-806f-3b97ee0669f0', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 1, 'Pensando nas minhas atitudes', '2026-04-07 14:41:36.272607+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4691a707-1682-444b-bc08-efb298b35496', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 0, 'Sim', '2026-04-07 15:25:49.794178+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fd585ea6-fc08-4625-bf88-81e87de6b803', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 1, 'Muda vendo com o ver de Deus,e começar a se era transformado por Jesus.', '2026-04-07 15:25:49.794178+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3fe448b6-d306-4b6d-b3ed-95eff4830e0f', '32a9f112-1192-4b2a-918f-c2895a76ade3', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 0, 'Sim, muito', '2026-04-07 15:45:18.156587+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ca92a6e6-c633-47a4-8bbb-ef7688f17001', '32a9f112-1192-4b2a-918f-c2895a76ade3', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 1, 'Muda pois penso que Deus me fez por vontade própria', '2026-04-07 15:45:18.156587+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9fb54bee-38a0-4258-bae7-bf41d452c4ec', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '9bf5b69c-d399-4266-9e14-57570672ef33', 0, 'Libertar, resgatar e comprar de volta', '2026-04-07 16:04:28.95857+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fb35e8d4-3a4f-4d47-9b1b-f83729c7acf9', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'Jesus Cristo', '2026-04-07 16:04:28.95857+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a20d051d-58fa-41a8-bab5-d2982d3967a4', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '9bf5b69c-d399-4266-9e14-57570672ef33', 2, 'É viver sabendo que fomos resgatados por ele', '2026-04-07 16:04:28.95857+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '90a84e8c-0674-4d06-a4ae-46c15645d935', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 0, 'Sim', '2026-04-07 17:29:49.97443+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e7d7594d-5f6b-4503-b144-c2673d56513a', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 1, 'Fazendo escolhas melhores', '2026-04-07 17:29:49.97443+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2a2f787f-c097-4b82-bcf9-bf6aef88b148', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', 'e3645858-1004-4f31-8d73-708e1749c4bd', 0, 'Para serem reconhecidas pelas outras ', '2026-04-07 18:23:36.156326+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '48f8e217-362a-4771-ab91-7c874e78bf99', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', 'e3645858-1004-4f31-8d73-708e1749c4bd', 1, 'Que todos temos o mesmo valor por que Deus nos ama do jeito que a gente é ', '2026-04-07 18:23:36.156326+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8147bd98-6d02-423a-95fe-0ca8d0acc73c', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', 'e3645858-1004-4f31-8d73-708e1749c4bd', 2, 'Começar a pensar oque Deus pensaria de nossas atitudes ', '2026-04-07 18:23:36.156326+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a20a5a14-63a1-40c2-8667-d27f3c919679', '2f773751-38c2-45a1-8ee0-f5b856092730', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 0, 'Estou tentando.', '2026-04-07 18:49:50.462744+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd37316dd-220d-4b66-af3d-ffebc46636bf', '2f773751-38c2-45a1-8ee0-f5b856092730', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 1, 'Preciso me alimentar melhor e ter uma rotina de sono melhor.', '2026-04-07 18:49:50.462744+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'acd6669f-34d8-4375-b9f6-40935b9e125e', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 0, 'Sim ', '2026-04-07 19:00:01.929354+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e935a866-3885-4e29-bfac-d04488bd4ea9', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 1, 'Porque Deus cuida de nós sempre que precisar ', '2026-04-07 19:00:01.929354+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd8c93601-0ac8-4749-9183-acfd635cf4f3', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 0, 'Sim', '2026-04-07 19:45:08.941841+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6b4d26d3-d6e0-4206-97e8-0b49142c7ff3', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 1, 'Entende que meu corpo não é “qualquer coisa”, mas algo precioso', '2026-04-07 19:45:08.941841+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4bce73e4-f4a6-401d-b35f-3627ae16dd46', '9289d1ce-a632-4cd7-930e-73023e549ec5', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 0, 'Eu tomo banho,tomo cuidados pra não me machucar, não cuido mal', '2026-04-07 20:10:34.999001+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7b514208-9468-4f33-ac51-6db7f228f2a2', '9289d1ce-a632-4cd7-930e-73023e549ec5', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 1, 'Começar a tratar meu corpo melhor,dar valor, não falar que é feio e coisa do tipo', '2026-04-07 20:10:34.999001+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '88148b6c-acd8-4e79-a1fa-e9f20bb51b37', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 0, 'Sim, isso significa pra mim um ato de gratidão a vida.', '2026-04-07 20:35:06.66101+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3b060e84-7be1-40b9-ab44-0dd5d54157fd', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 1, 'Isso muda como faço minhas escolhas, por exemplo como cuido do meu alimento, descanso e respeito ao próximo.', '2026-04-07 20:35:06.66101+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'de9f9880-ced4-4e87-9bf4-8ab0c953cecc', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 0, 'Não ', '2026-04-07 21:38:36.293758+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bdafa750-2fd6-4eab-9c87-fb0fe0969636', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 1, 'Sou grata por Deus ter algo preparado pra mim', '2026-04-07 21:38:36.293758+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '283f5ef4-29fb-4d2d-8211-719be32b68e1', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '5e859f9e-3016-4482-96fd-1cae2e76f966', 0, 'É se afastar de Deus.', '2026-04-07 21:55:57.032234+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fd581192-308b-4ed9-8d9b-98106e7745e2', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '5e859f9e-3016-4482-96fd-1cae2e76f966', 1, 'Com o pecado vivemos com medo e culpa.', '2026-04-07 21:55:57.032234+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cf38c16b-3ec2-42b0-a12b-76e2c3e7cb2d', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '5e859f9e-3016-4482-96fd-1cae2e76f966', 2, 'Para que nós nos arrependamos dos nossos pecados e depois de se arrepender não cometer mais este mesmo pecado .', '2026-04-07 21:55:57.032234+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c1efcd38-5ba6-4ac6-8bfc-0936425f4eb6', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 0, 'Sim ', '2026-04-07 22:27:16.545697+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '87ac3851-6295-4ee4-ab08-756f4a29e20a', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 1, 'Não querer fazer tatuagem fura a orelha ', '2026-04-07 22:27:16.545697+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '984af987-f4fd-4197-9f09-0c857808bb1a', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 0, 'Sim ', '2026-04-07 22:30:14.619042+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '093f937f-e7ab-4001-8be6-acffc1e0a6c8', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 1, 'Muda que eu me privo de certas coisas ', '2026-04-07 22:30:14.619042+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3d7bd51e-4929-4cfe-9d3c-110ac34b3764', '66b31cf2-7782-4253-98ea-3b6d631703a4', 'e3645858-1004-4f31-8d73-708e1749c4bd', 0, 'Por que não sabem que para Deus o nosso valor já foi provado ', '2026-04-07 22:33:22.343335+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '69faa3b8-cca0-4a84-872a-799c56882fe6', '66b31cf2-7782-4253-98ea-3b6d631703a4', 'e3645858-1004-4f31-8d73-708e1749c4bd', 1, 'Que o valor já foi provado ', '2026-04-07 22:33:22.343335+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd4eec4c2-d2b4-42c8-ad80-88c3b876ba83', '66b31cf2-7782-4253-98ea-3b6d631703a4', 'e3645858-1004-4f31-8d73-708e1749c4bd', 2, 'Muda por que a gente passa a pensar que o nosso valor não precisa ser provado mas sim, Deus já provou nosso valor ', '2026-04-07 22:33:22.343335+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'dafc3ae2-a9c3-45ca-ab66-f7837b4d2959', '914b898d-24a3-46ad-a764-d2f24e5115d1', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 0, 'Sim ', '2026-04-07 22:44:06.40943+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e2beb21d-6363-4e1b-b18e-e20b6087196f', '914b898d-24a3-46ad-a764-d2f24e5115d1', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 1, 'Seguindo a Jesus ', '2026-04-07 22:44:06.40943+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ba01654e-390a-45e5-b792-1d3cfeb0baeb', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 0, 'Sim', '2026-04-08 00:50:53.489118+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c31c7ae8-6021-4afa-8e1c-b56c987c1743', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 1, 'Sou mais cuidadoso com o grande presente que Deus me deu ', '2026-04-08 00:50:53.489118+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bbd14539-1247-412e-81bb-2e0d5eddb1c4', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 0, 'As vezes', '2026-04-08 03:08:48.634428+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e0767212-aa0a-468b-9394-e60197417f0e', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 1, 'Pelo amor', '2026-04-08 03:08:48.634428+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '23b6a30b-16eb-4631-9050-19566ae83518', '2dcc9a0e-accc-42df-8c78-5577fc2669db', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 0, 'Não ', '2026-04-08 09:14:46.417654+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '26d67453-1a6f-4c5a-9ae6-aaf05e0efcd7', '2dcc9a0e-accc-42df-8c78-5577fc2669db', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 1, 'Que estou protegida por deus', '2026-04-08 09:14:46.417654+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6c4eb9c5-19c4-4148-96e0-052c2be40cfd', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 0, 'Não ', '2026-04-08 10:11:47.399132+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9d907b2b-15d2-466d-8990-d9f1bceffb91', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 1, 'Sabendo que sou amado por Deus ', '2026-04-08 10:11:47.399132+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f8900380-ccfe-46ce-b855-6dd8e2f33f96', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 0, 'As vezes sim, quando faço algo errado ', '2026-04-08 10:45:40.189567+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b7ab97f4-b1d1-45a4-ba30-f0aca4419265', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 1, 'Porque através de Jesus temos a certeza de nossa salvação ', '2026-04-08 10:45:40.189567+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3e6a3fab-0b05-4856-a93d-b78ff7eb215e', '1526dc8b-a92a-4a44-b358-b6a3083d0143', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 0, 'Sim pelos erros que eu já cometi ', '2026-04-08 15:03:38.351059+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6a905bb3-acc7-40fe-8963-734d96eceb38', '1526dc8b-a92a-4a44-b358-b6a3083d0143', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 1, 'Trás segurança de viver com o amor de Deus em ser aceito por ele ', '2026-04-08 15:03:38.351059+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a85ccf42-6aa3-47f6-b5fd-6ecff10a7165', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 0, 'Não ', '2026-04-08 15:11:30.347675+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '49b23133-89f9-475d-9712-4ced0fed974f', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 1, 'Porque ela vai foi comprida', '2026-04-08 15:11:30.347675+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd1e6d31a-e781-4cb1-9469-642b7096fd81', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 0, 'Não ', '2026-04-08 15:29:02.793134+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1831ef50-baca-4376-be40-22831c0bf250', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 1, 'Prestando a atenção nela', '2026-04-08 15:29:02.793134+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a6aa5b4a-f41c-498f-825b-3483a2fbedc5', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 0, 'Sim', '2026-04-08 15:46:54.223739+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7cf966fc-0dea-4a7c-b395-26f97422833e', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 1, 'Porque Jesus não mente,nem Deus.', '2026-04-08 15:46:54.223739+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '934800a5-e71f-4bdf-8c5a-c9ed23a08bf9', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 0, 'Às vezes sinto medo, mas lembro que Deus me aceita pela graça, não pelos meus erros.', '2026-04-08 17:27:15.59439+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5cb7c8c5-701b-42c7-9dc5-8eac2397d8e7', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 1, 'Isso me traz paz, pois sei que Cristo já pagou por tudo e não preciso viver na culpa.', '2026-04-08 17:27:15.59439+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e597e7b1-fe18-4c2b-9948-d62d573af76c', '32a9f112-1192-4b2a-918f-c2895a76ade3', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 0, 'Não', '2026-04-08 18:19:48.469589+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2a1d382a-e7cd-427f-a6e4-01c68c32046b', '32a9f112-1192-4b2a-918f-c2895a76ade3', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 1, 'Traz segurança pois sei que sou assento por ele', '2026-04-08 18:19:48.469589+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bb36ec8d-3bf3-440e-abc5-59597dfcad88', '2f773751-38c2-45a1-8ee0-f5b856092730', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 0, 'Não! Sei que sou profundamente amado por Deus!
', '2026-04-08 19:28:54.818785+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c7287760-c8b5-4a10-952a-c78042b9f8e1', '2f773751-38c2-45a1-8ee0-f5b856092730', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 1, 'Saber que não há condenação, me faz viver sem medo de Deus me castigar e livre para tentar viver e acertar e mesmo que eu errar não serei castigado.', '2026-04-08 19:28:54.818785+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '49361a19-d4be-4d99-b1ab-09c2152b4d6c', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 0, 'Não, pois eu fui criado crendo nele, e sei que sou digno da minha vida, e todos tem um propósito especial de Cristo.', '2026-04-08 21:37:06.741818+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.devotional_responses (
  id, user_id, devotional_id, question_index, response, created_at, updated_at, church_id
)
VALUES
(
  'fb35d559-cb1e-4df7-b829-a582119606f6', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 1, 'Traz segurança sabendo que Deus tem um propósito pra mim e um futuro lindo, e sempre passo a ter alívio quando penso que Deus sabe e guarda meu futuro.', '2026-04-08 21:37:06.741818+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0b192205-37fa-49ec-96ad-555eee3b628f', '9289d1ce-a632-4cd7-930e-73023e549ec5', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 0, 'Sim,porque as vezes acabo pecando', '2026-04-08 21:41:33.421898+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a900bc61-23b0-4be4-ae4a-3598c028e438', '9289d1ce-a632-4cd7-930e-73023e549ec5', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 1, 'Porque Cristo perdoa os que erram,e isso significa que não precisa ser perfeito,que alguma hora vamos acabar pecando,mas com Cristo, não há condenação,e sim graça,e confiar que Ele já foi pago na cruz por nós', '2026-04-08 21:41:33.421898+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'af482809-1eed-4512-ae11-0aee1de6ba40', '66b31cf2-7782-4253-98ea-3b6d631703a4', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 0, 'Identidade ', '2026-04-08 22:10:48.832943+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c4f048a9-8099-4f90-9c79-7993be1b8dc9', '66b31cf2-7782-4253-98ea-3b6d631703a4', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 1, 'Bondade, humildade, mansidão e paciência ', '2026-04-08 22:10:48.832943+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0cdd3177-5a74-4981-9780-9e1757e46e95', '66b31cf2-7782-4253-98ea-3b6d631703a4', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 2, 'Sempre junto com ele e sendo uma boa pessoa para o próximo ', '2026-04-08 22:10:48.832943+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fada45d7-facf-4309-bb2b-a16d1581543b', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 0, 'Sim', '2026-04-08 22:14:29.510299+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '98044c44-7dc3-48ec-91a0-6c4e399f29a1', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 1, 'Essa promessa assegura que Ele já foi pago os pecados na cruz ', '2026-04-08 22:14:29.510299+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a97bb4ef-89a6-4573-9262-dfa504afb94f', '7640c7e4-6780-4c27-8a04-ae5ab375f580', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 0, 'Não ', '2026-04-08 22:14:43.141972+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '636f1734-31d3-48a9-86f4-7682bff83017', '7640c7e4-6780-4c27-8a04-ae5ab375f580', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 1, 'Que ele me ama do jeito que sou ', '2026-04-08 22:14:43.141972+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8068a789-a0d3-435f-8f75-2ddfcf745b2a', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 0, 'Sim ', '2026-04-08 22:17:12.434272+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5c957e52-5648-4fcc-8f3a-f1624b38ac63', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 1, 'Trás segurança por que eu não vou precisar morrer na cruz coma Ele morreu Ele já pagou os meus pecados mas eu tenho que seguir a Ele ', '2026-04-08 22:17:12.434272+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '628131c3-3ec8-4a13-a38f-c0b5a7ad7dc2', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 0, 'Não ', '2026-04-08 22:27:44.989239+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '485bd0a4-3755-4265-9e9a-161e1fc72aa2', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 1, 'Para mim será como viver em cristo', '2026-04-08 22:27:44.989239+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c9f686bf-4207-422c-ab23-ae6f2ea1618c', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 0, 'As vezes.', '2026-04-08 22:36:17.943447+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ec662d26-34a9-4676-a886-c10e6dc5e8f0', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 1, 'Traz segurança nos faz confiar que em Cristo,somos perdoados e não vivemos em culpa constante ', '2026-04-08 22:36:17.943447+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '21be9c35-9b15-4542-ba38-b695bdce11c2', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 0, 'Uma nova pessoa ', '2026-04-08 23:03:13.289489+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a10587e8-b44f-4dfe-bab1-556c927b09de', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 1, 'Por que podemos mudar ', '2026-04-08 23:03:13.289489+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '87b2f0dc-d7c7-408c-9b5e-e39434cac1b7', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 2, 'Sim por que assim podemos ser perdoados', '2026-04-08 23:03:13.289489+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8331e71e-794f-4c0a-9bae-a0e1dacea9b0', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 0, 'Não ', '2026-04-08 23:05:13.270366+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7e7b5ea0-f6c0-4e17-b8d8-df77bfa9efbc', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 1, 'Viver de coração puro e livre do pecado', '2026-04-08 23:05:13.270366+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '513809df-e693-4077-8254-d8d73b1541c8', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 0, 'Nao', '2026-04-08 23:27:18.785228+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8e8464d3-5fbd-4e7e-9ef2-eba3e92a9c7a', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 1, 'Por que vem de Deus ', '2026-04-08 23:27:18.785228+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1a80762b-f9a1-4eac-aeb7-e700815b0b31', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '9bf5b69c-d399-4266-9e14-57570672ef33', 0, 'Resgatar, libertar ou compra de volta.', '2026-04-09 00:08:49.496163+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd3f3d3fd-a0c9-450c-ae8d-9ec910a83887', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'Jesus.', '2026-04-09 00:08:49.496163+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5df81da1-53e4-44bc-bfc4-75d38a067048', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '9bf5b69c-d399-4266-9e14-57570672ef33', 2, 'Vivendo nossa vida sobre os planos dele.', '2026-04-09 00:08:49.496163+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd9771b8d-a011-4696-b4b7-2a241f4c2977', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 0, 'Identidade ', '2026-04-09 00:12:03.107585+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4d658dfe-d0ee-4f67-8e52-f8fe8248e27e', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 1, 'Mantendo limpo e organizado, isso é importante pois é a casa do único e verdadeiro superior ', '2026-04-09 00:12:03.107585+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5eb47844-d5de-4f81-8fcd-4960311c9925', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 2, 'Vivemos de forma diferente não para Deus nos amar, mas porque Deus ja nos ama', '2026-04-09 00:12:03.107585+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8f6c5fe2-dd16-4780-a1a4-12116e80b02e', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 0, 'Sim', '2026-04-09 09:11:18.034538+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '224909aa-af1f-4145-b887-7ba8366fef7f', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 1, 'Que tudo vai dar certo no final 
', '2026-04-09 09:11:18.034538+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b7806be7-d267-4319-b1d6-ee55994749a7', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 0, 'Ser salvo pela vontade de Deus ', '2026-04-09 10:01:45.317669+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '09a59236-31dc-4d36-aeef-8616bd341be2', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 1, 'Por que somos pecadores', '2026-04-09 10:01:45.317669+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '71cb64e9-34fc-450f-b7a6-819cb2688833', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 2, 'Que podemos pedir perdão pelos nossos pecados', '2026-04-09 10:01:45.317669+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'afbc71a4-e497-4923-8739-df5d57db86a9', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 0, 'Sim', '2026-04-09 10:20:30.855843+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f8c0408b-f825-4efc-9614-6d9195c7cec7', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 1, 'Isso influencia em minhas decisões pq dai eu penso 2 vezes antes de tomar a decisão ', '2026-04-09 10:20:30.855843+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cdc79079-5f30-4bd5-a4ae-02991d50561e', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 0, 'Sim ', '2026-04-09 10:32:41.921002+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '400a16dd-0347-40ea-96fe-437029d3ef10', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 1, 'Que eu tenho que pensar o que Deus gostaria que eu fizesse ', '2026-04-09 10:32:41.921002+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8603123b-81ed-44b4-aaae-2a25684f42a3', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 0, 'Sim', '2026-04-09 12:10:27.553929+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'aee80b09-bbfa-4b3c-8f80-7790529be0fd', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 1, 'Penso que Deus ja tem planejado minha vida por isso não devo me preocupar, e seguir com fé conforme os planos de Deus', '2026-04-09 12:10:27.553929+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '396141c8-26cd-4003-bf92-520eec47aadd', 'a608622c-4120-4d15-949f-235ca64db2cf', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 0, 'Sim
', '2026-04-11 14:34:28.100054+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7cc016d2-095c-462c-af37-c1e5ce05c558', '2f773751-38c2-45a1-8ee0-f5b856092730', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 0, 'Sim. Mas é dificil entender com clareza os planos.', '2026-04-09 12:29:59.282958+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fd22fd2e-4b5a-4a67-bf8b-148b528a0351', '2f773751-38c2-45a1-8ee0-f5b856092730', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 1, 'Precio aprender a ouvir a Deus para conseguir viver seus planos.', '2026-04-09 12:29:59.282958+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3b28dd02-0614-4f64-a394-a93c5a058b55', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 0, 'Sim ', '2026-04-09 14:14:24.699914+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a6b09ffc-a2f1-407c-945f-17770087efca', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 1, 'Influência porque Deus sempre sabe o que nós vamo fazer ', '2026-04-09 14:14:24.699914+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0ed53f6d-cd37-4965-b624-a956e9af2734', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 0, 'Sim todo mundo tem um propósito ', '2026-04-09 14:51:39.439107+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3016e13f-4968-4a8b-8516-e9afcbc22a37', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 1, 'Eu tenho que cuidar das minhas decisões ', '2026-04-09 14:51:39.439107+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '23e2a1aa-42b5-41eb-b883-6ed58a121c35', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 0, 'Sim, acredito que Deus tem planos para mim. Isso me dá segurança, mesmo quando não entendo tudo o que está acontecendo.', '2026-04-09 15:18:21.792968+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b7c65ae6-f0b5-4f9c-96a0-5ea10370a198', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 1, 'Acreditar que Deus tem um propósito para mim muda a forma como tomo minhas decisões. Em vez de agir só pelo impulso ou pelo que eu sinto na hora, procuro pensar no que é certo e no que agrada a Deus. Isso me traz mais calma e segura , porque sei que Ele está no controle, mesmo quando as coisas não saem como eu esperava.', '2026-04-09 15:18:21.792968+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5fd2cf11-cf9c-4417-9b47-8cb58f23457d', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 0, 'Simmm.', '2026-04-09 15:37:11.104858+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '76aa341d-d530-4c6e-a659-105f824df42a', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 1, 'Eu faço oque eu aprendi que ele quer que eu faça.', '2026-04-09 15:37:11.104858+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0b7e32b9-23d3-49d9-8a4b-ddc2e8961838', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 0, 'Sem dúvidas, sim', '2026-04-09 15:48:17.170568+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9da86f56-23a4-4893-9337-e4292fffd234', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 1, 'Penso em Deus primeiro antes das minhas decisões ', '2026-04-09 15:48:17.170568+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7d3c2b7c-9848-4931-8256-b43967f54488', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 0, 'Sim', '2026-04-09 16:23:44.540014+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c4bab54e-7495-497c-905c-dd04ed45f98e', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 1, 'Que tudo já está planejado e não preciso me preocupar ', '2026-04-09 16:23:44.540014+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '690cd383-54ba-4b48-a151-91513f1cd0d3', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 0, 'Sim', '2026-04-09 18:35:39.918532+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a4f08950-4e7c-4db4-8a20-8edafcf927e7', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 1, 'Parando para pensar', '2026-04-09 18:35:39.918532+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '42649e04-b300-4e35-8694-06a63bf22b0a', '66b31cf2-7782-4253-98ea-3b6d631703a4', '45298ff1-59ff-43f1-9b93-69068582bdd0', 0, 'Pedir perdão para Deus ', '2026-04-09 19:32:07.472185+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9d6bc5ed-19b6-4cc5-8a81-0cb806177d50', '66b31cf2-7782-4253-98ea-3b6d631703a4', '45298ff1-59ff-43f1-9b93-69068582bdd0', 1, 'Sim ', '2026-04-09 19:32:07.472185+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f8f8a381-36a4-43de-b5bd-2ea27f196b99', '66b31cf2-7782-4253-98ea-3b6d631703a4', '45298ff1-59ff-43f1-9b93-69068582bdd0', 2, 'Por  se errarmos Deus nos perdoa ', '2026-04-09 19:32:07.472185+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '29196602-657e-42da-ab92-87f826d5956f', '9289d1ce-a632-4cd7-930e-73023e549ec5', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 0, 'Acredito que sim, já que todos nós temos e vamos ter um propósito na vida', '2026-04-09 20:05:40.756412+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '79bbeda3-bdd2-46af-91e2-6364bd7e1bd3', '9289d1ce-a632-4cd7-930e-73023e549ec5', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 1, 'Começo a pensar mais nas minhas decisões,e no que vou fazer', '2026-04-09 20:05:40.756412+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7e7ac8d4-fc3f-482f-80f9-0a765e4e250e', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 0, 'Sim ', '2026-04-09 21:07:21.176343+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6a49386f-74e7-47e7-914b-ad87d4726908', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 1, 'Não praticar o mal ', '2026-04-09 21:07:21.176343+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c6f76dc3-176a-4b83-871f-1610b15608d1', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '45298ff1-59ff-43f1-9b93-69068582bdd0', 0, 'Pedir perdão e não cometer o mesmo erro. ', '2026-04-09 22:06:07.822234+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a2dcd012-959f-478a-8ac4-48029be2b75c', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '45298ff1-59ff-43f1-9b93-69068582bdd0', 1, 'Quando realmente nos arrependemos,sim.', '2026-04-09 22:06:07.822234+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1fa08a2a-cc5e-4462-8612-127d105b8b59', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '45298ff1-59ff-43f1-9b93-69068582bdd0', 2, 'Porque sabemos que mesmo quando erramos Deus nos ama.', '2026-04-09 22:06:07.822234+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e76badf5-5b6c-44bf-a2e2-39c4d82d2818', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 0, 'Sim, Deus sempre tem propósitos e planos para o futuro e pra vida.', '2026-04-09 22:33:50.714317+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4e7aa92b-5078-49a6-92db-99216b739dce', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 1, 'Sempre orando e crendo que Deus está a frente de todas as nossas decisões, orar e confiar.', '2026-04-09 22:33:50.714317+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3730562d-08d0-46fe-9f60-7de59d789105', 'a608622c-4120-4d15-949f-235ca64db2cf', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 0, 'Sim', '2026-04-09 22:50:40.27913+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '01ad4126-d6a1-49ed-b10f-536f87a31128', 'a608622c-4120-4d15-949f-235ca64db2cf', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 1, 'Que tudo irá dar certo
', '2026-04-09 22:50:40.27913+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '04229265-5a6d-464f-aeb0-eb8f8046f6da', '914b898d-24a3-46ad-a764-d2f24e5115d1', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 0, 'Sim', '2026-04-09 22:52:01.351034+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2213805a-e26a-4c29-87e5-d5c3928202e9', '914b898d-24a3-46ad-a764-d2f24e5115d1', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 1, 'Andar no caminho certo...não tomar decisões erradas...e que Deus está sempre me protegendo ', '2026-04-09 22:52:01.351034+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '85a25167-30a3-4bd4-8a3a-55559cc9ec78', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 0, 'Sim ', '2026-04-09 22:53:00.270616+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6eca7a12-d68d-48b4-ab6b-8f2372b38192', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 1, 'Seguir a o caminho que Ele está me levando ', '2026-04-09 22:53:00.270616+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8c877848-b665-47d9-909c-4403429d2958', '4d062445-4744-4007-a2ac-d7c4743fc979', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 0, 'Sim', '2026-04-09 23:09:10.206691+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6409deb7-be18-4b9e-8e27-7acd2ae1e508', '4d062445-4744-4007-a2ac-d7c4743fc979', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 1, 'Orando ', '2026-04-09 23:09:10.206691+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2097a0e5-a359-4e7a-b2ba-974604025411', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 0, 'Sim', '2026-04-10 00:24:51.768313+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5a7242db-3d1d-4545-8831-ad955467b38e', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 1, 'Influência para acreditar mais em Deus ', '2026-04-10 00:24:51.768313+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c14d47e9-48ab-4911-8dcb-13619af81bd5', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 0, 'Sim acredito ', '2026-04-10 00:36:25.451326+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '99bddde5-905e-4658-b643-e16c365041fd', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '3d5b77c0-2b4f-420c-b42a-f2006c7e0973', 1, 'Todas as minhas decisões de hoje irão refletir no meu futuro ', '2026-04-10 00:36:25.451326+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '23face80-dc6e-4f48-9e26-ab6a2c44dc3d', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '482eee64-b951-46f1-a0b9-612a02013992', 0, 'Deus ', '2026-04-10 10:36:45.335819+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f78901c3-0f9c-499c-b0c6-7d3044778919', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '482eee64-b951-46f1-a0b9-612a02013992', 1, 'Feliz pois Jesus se entregou por mim ', '2026-04-10 10:36:45.335819+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3843bdcd-ed72-4a49-b251-8d729627a7a0', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '482eee64-b951-46f1-a0b9-612a02013992', 0, 'Atitudes', '2026-04-10 11:58:58.450664+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8f535b99-3bec-4815-a9e6-79cd8c07d9d5', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '482eee64-b951-46f1-a0b9-612a02013992', 1, 'Lembrando do que Jesus fez por nós !', '2026-04-10 11:58:58.450664+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3e65e597-9b5a-43f0-b8ce-99e7a7bd4d09', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '482eee64-b951-46f1-a0b9-612a02013992', 1, 'Ao escolher diariamente encontrar minha indentidade em Cristo e não nos meus erros', '2026-04-10 13:02:45.703269+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fd7bcded-8881-4b94-a966-288675152cea', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '482eee64-b951-46f1-a0b9-612a02013992', 0, 'As minhas atitudes ', '2026-04-10 13:39:06.141085+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '64d60ce9-707e-4e20-89e5-669648a541df', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '482eee64-b951-46f1-a0b9-612a02013992', 1, 'Porque sigo a palavra de Deus ', '2026-04-10 13:39:06.141085+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '72ad3aaa-dc1b-44dc-ae95-d0ab6c4d70a9', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '482eee64-b951-46f1-a0b9-612a02013992', 0, 'Nós erros que eu já cometi ', '2026-04-10 14:39:44.527447+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4cf36185-e87b-4070-97a9-6338fa2c9286', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '482eee64-b951-46f1-a0b9-612a02013992', 1, 'Não fazendo mal a Deus e não pecando ', '2026-04-10 14:39:44.527447+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '865089fe-bbd1-447f-b845-1ce8699dcd44', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '482eee64-b951-46f1-a0b9-612a02013992', 0, 'Às vezes deixo meus erros e a opinião dos outros me definirem, mas minha identidade está em Cristo.', '2026-04-10 14:53:30.011173+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '45a30010-71e3-4c63-858c-0d9302edb880', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '482eee64-b951-46f1-a0b9-612a02013992', 1, 'Vivo como nova criatura buscando a Deus e lembrando que fui transformada por Ele.', '2026-04-10 14:53:30.011173+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '73341216-648c-4b7d-95ef-76ffd3a04b41', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '482eee64-b951-46f1-a0b9-612a02013992', 0, 'Minha personalidade ', '2026-04-10 14:54:16.517613+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ad6dbe73-1ad9-45c9-8f7b-503df65ce25d', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '482eee64-b951-46f1-a0b9-612a02013992', 1, 'Viver sabendo que Deus tem planos para cada um', '2026-04-10 14:54:16.517613+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '77ff7030-ab3f-4fbe-b074-7e1211f1f2c1', '66b31cf2-7782-4253-98ea-3b6d631703a4', 'a2b6f9a0-d031-4841-871b-280512b684eb', 0, 'Que Deus  os chamou das trevas para sua maravilhosa luz ', '2026-04-10 16:09:36.611385+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '66d9390c-ecc0-48ba-a15c-8ef9b8def9e0', '66b31cf2-7782-4253-98ea-3b6d631703a4', 'a2b6f9a0-d031-4841-871b-280512b684eb', 1, 'Ser um aparte dele ', '2026-04-10 16:09:36.611385+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '793d4832-0777-48d0-b69e-65034a7df024', '66b31cf2-7782-4253-98ea-3b6d631703a4', 'a2b6f9a0-d031-4841-871b-280512b684eb', 2, 'Sempre sendo uma boa pessoa ', '2026-04-10 16:09:36.611385+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1a311644-f72e-44f4-82e3-9078cad2b7e3', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '482eee64-b951-46f1-a0b9-612a02013992', 0, '
Eu não me defino pelos meus erros mas sim pela obra de Cristo ', '2026-04-10 17:36:50.391269+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '02e31382-0aae-4b04-9cb8-7f72994190c2', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '482eee64-b951-46f1-a0b9-612a02013992', 1, 'Lendo a bíblia e sempre lembrando que não me defino pelos meus erros mas pela obra de cristo', '2026-04-10 17:36:50.391269+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f8d38184-d202-412e-b7e9-7c1fa3966c42', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '482eee64-b951-46f1-a0b9-612a02013992', 0, 'Dificil', '2026-04-10 18:28:55.406542+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.devotional_responses (
  id, user_id, devotional_id, question_index, response, created_at, updated_at, church_id
)
VALUES
(
  '3c5f46c4-b37b-4450-815b-ea6d0a7c1a13', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '482eee64-b951-46f1-a0b9-612a02013992', 1, 'Complicado ', '2026-04-10 18:28:55.406542+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ee31d0d0-ecce-4301-90da-5bed7a84d742', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '482eee64-b951-46f1-a0b9-612a02013992', 0, 'Não entendi muito bem isso ', '2026-04-10 19:03:35.175275+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '47c7747a-9c3f-41b6-a212-8aed3c9ffbd7', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '482eee64-b951-46f1-a0b9-612a02013992', 1, 'Todos os dias pedir perdão pelos pecados e tentar novamente ', '2026-04-10 19:03:35.175275+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '081f0d8d-d7e2-4db5-8fb3-29958006a2d6', '2f773751-38c2-45a1-8ee0-f5b856092730', '482eee64-b951-46f1-a0b9-612a02013992', 0, 'Luto contra as criticas e afirmações negativas sobre atitudes minhas.', '2026-04-10 19:03:36.111322+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1cbea905-b9a0-44a9-ae5b-b1ccdbed7c25', '2f773751-38c2-45a1-8ee0-f5b856092730', '482eee64-b951-46f1-a0b9-612a02013992', 1, 'Reafirmando o que esse texto biblico diz.', '2026-04-10 19:03:36.111322+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '19727993-a248-49b3-b401-9201e9085379', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '4923904c-0624-414c-a226-c0e44bf04174', 0, 'Ser criação dele', '2026-04-10 21:42:28.169639+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ab22f9f1-69ff-4182-b4fa-51d5d60ca67e', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '4923904c-0624-414c-a226-c0e44bf04174', 1, 'Protege e ensina', '2026-04-10 21:42:28.169639+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5f4c4852-fe6b-4b96-9af6-e4dc6cf750d0', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '4923904c-0624-414c-a226-c0e44bf04174', 2, 'Muda que podemos pedir para ele nos ensinar algo', '2026-04-10 21:42:28.169639+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1a43673e-348e-4508-9d94-b6cf6fe6a181', '9289d1ce-a632-4cd7-930e-73023e549ec5', '482eee64-b951-46f1-a0b9-612a02013992', 0, 'Personalidade,gostos e desgostos,amizades, família', '2026-04-10 22:17:11.748996+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '461676b2-4883-4ff2-81ec-23a5b1e10de7', '9289d1ce-a632-4cd7-930e-73023e549ec5', '482eee64-b951-46f1-a0b9-612a02013992', 1, 'Não me preocupar tanto em agradar os outros,e agradar a mim mesmo, não buscar uma identidade toda hora,viver mais tranquilamente', '2026-04-10 22:17:11.748996+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f1328ae4-3cb9-4100-93a9-b7fd865d0f41', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '482eee64-b951-46f1-a0b9-612a02013992', 0, 'Tudo que sou hoje dou graças aos ensinamentos que meus pais me fazem entender que sem Deus não somos nada', '2026-04-10 22:27:55.43218+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '95af5343-79f6-4380-be47-ee0b854a140e', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '482eee64-b951-46f1-a0b9-612a02013992', 1, 'Focar no propósito que Deus tem para o presente e o futuro não no passado', '2026-04-10 22:27:55.43218+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '53df67bb-1f93-43cb-a178-713bd4c162d9', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 0, 'Isso significa que Deus nos ama e que ele é bom.', '2026-04-10 22:29:17.008219+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6ab017d3-4842-4221-a1c5-028ff3d586d4', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 1, 'Porque dependemos de Deus.', '2026-04-10 22:29:17.008219+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9c30b86e-77ea-4bb0-b41b-b241498dcb72', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '3d64d377-9892-4d7d-a17c-aaf074fe9de6', 2, 'Que mesmo sendo pecadores Deus nos ama.', '2026-04-10 22:29:17.008219+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fd6a3aa3-c11b-4936-ad50-aa88af0c5515', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '482eee64-b951-46f1-a0b9-612a02013992', 0, 'A opinião dos outros ', '2026-04-10 22:31:43.561369+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b30d02a2-210c-4f99-a550-27c8a438859c', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '482eee64-b951-46f1-a0b9-612a02013992', 1, 'Que os seus erros ficam no passado ', '2026-04-10 22:31:43.561369+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e914c188-faa6-4c90-a80b-79a95bf8f3ff', 'b486e185-6cb3-477c-936b-b204b143e329', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'As pessoas procuram no seu trabalho nas suas notas suas conquistas', '2026-04-10 23:08:09.777659+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '222c10c1-ad40-4bb7-af14-d876a17d4c1b', 'b486e185-6cb3-477c-936b-b204b143e329', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Por que as pessoas mudam com o tempo aparência,corpo,modo de falar etc
', '2026-04-10 23:08:09.777659+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '135ca39a-5fdd-4a08-bda7-775be52e1bce', 'b486e185-6cb3-477c-936b-b204b143e329', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Muda minha autoestima de cada dia ', '2026-04-10 23:08:09.777659+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8a804815-6d7b-4119-bec5-8a3f8af1c630', '914b898d-24a3-46ad-a764-d2f24e5115d1', '482eee64-b951-46f1-a0b9-612a02013992', 0, 'Uma pessoa criada por Deus,amiga e especial ', '2026-04-10 23:18:24.208648+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ea4de2c8-1a2d-419d-9805-5526344d9e86', '914b898d-24a3-46ad-a764-d2f24e5115d1', '482eee64-b951-46f1-a0b9-612a02013992', 1, 'Sempre sendo verdadeira ', '2026-04-10 23:18:24.208648+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '84a3d4d6-9bb6-4e63-b4f7-69bc84863fa6', '9a0c5687-f135-4377-a410-58592ef8737a', 'a2b6f9a0-d031-4841-871b-280512b684eb', 0, 'Q nos somos o povo exclusivo de Deus.', '2026-04-10 23:24:43.656512+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '31d32a39-a5b8-418f-89da-fef36f80737d', '9a0c5687-f135-4377-a410-58592ef8737a', 'a2b6f9a0-d031-4841-871b-280512b684eb', 1, 'Crer na palavra de Deus.', '2026-04-10 23:24:43.656512+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a663d2e1-92eb-4670-a1a4-1e9cefc008ce', '9a0c5687-f135-4377-a410-58592ef8737a', 'a2b6f9a0-d031-4841-871b-280512b684eb', 2, 'Viver em comunhão,paz e amor ao próximo. ', '2026-04-10 23:24:43.656512+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8b11b8b6-378b-4a08-81b4-f017aeb3efee', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '482eee64-b951-46f1-a0b9-612a02013992', 0, 'Eu sendo eu ', '2026-04-11 00:53:35.948466+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '92846d70-e909-4294-ae5b-1bd425f85542', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '482eee64-b951-46f1-a0b9-612a02013992', 1, 'Bom porque quem criou uma nova criatura foi Deus ', '2026-04-11 00:53:35.948466+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '498ce5d2-3caa-4221-81af-6747c3ab0ac4', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '482eee64-b951-46f1-a0b9-612a02013992', 0, 'Só Deus me define ', '2026-04-11 01:03:18.910276+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ec73eb6a-43cb-4d48-959f-41540a73b3c4', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '482eee64-b951-46f1-a0b9-612a02013992', 1, 'Fazendo o que agrada o coração do pai, atitudes e sentimentos ', '2026-04-11 01:03:18.910276+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a7d4075c-a2b0-445e-a185-15f47516c22d', '32a9f112-1192-4b2a-918f-c2895a76ade3', '482eee64-b951-46f1-a0b9-612a02013992', 0, 'Eu deixava meus erros me definirem', '2026-04-11 01:13:33.94314+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '170c1f2e-ad83-41b0-b690-dbc7cae5717d', '32a9f112-1192-4b2a-918f-c2895a76ade3', '482eee64-b951-46f1-a0b9-612a02013992', 1, 'Eu vivo lembrando disso muito bem', '2026-04-11 01:13:33.94314+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e6cb52cf-5f1f-4cfe-9437-10f21a66be2b', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '4923904c-0624-414c-a226-c0e44bf04174', 0, 'Ser amado e muito especial por ser único e criado por um Deus supremo', '2026-04-11 01:38:17.503038+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '42460285-cde3-4ebb-bb4e-b265c6a4f801', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '4923904c-0624-414c-a226-c0e44bf04174', 1, 'Ama, orienta e esta presente!', '2026-04-11 01:38:17.503038+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '82b09a0b-ea53-4c34-8258-30237c434404', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '4923904c-0624-414c-a226-c0e44bf04174', 2, 'Pois somos filhos de Deus e como um pai ama e orienta o seu filho, Deus faz o melhor por nós sempre!', '2026-04-11 01:38:17.503038+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'aa4824e0-ca25-43ce-b979-51bddb803bd5', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '482eee64-b951-46f1-a0b9-612a02013992', 0, 'Timidez', '2026-04-11 01:55:13.173124+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0645da7c-cec1-4d64-bd36-6e97cb9d7d41', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '482eee64-b951-46f1-a0b9-612a02013992', 1, 'Ter uma vida boa', '2026-04-11 01:55:13.173124+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c2023564-dcd0-4cc3-a388-652590b3baeb', '4d062445-4744-4007-a2ac-d7c4743fc979', '12f627ce-ad3a-45d1-b90a-6282070e9524', 0, 'Bom
', '2026-04-11 11:23:19.69384+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '35252caa-ab80-481d-9608-e4323c789ccc', '4d062445-4744-4007-a2ac-d7c4743fc979', '12f627ce-ad3a-45d1-b90a-6282070e9524', 1, 'Sim', '2026-04-11 11:23:19.69384+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6a467032-b9bf-4b07-bd4f-c8c7788adb48', '4d062445-4744-4007-a2ac-d7c4743fc979', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 0, 'Sim', '2026-04-11 11:23:53.697611+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c5bfd163-a671-41f2-8b53-c083f239dcd1', '4d062445-4744-4007-a2ac-d7c4743fc979', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 1, 'Orando ', '2026-04-11 11:23:53.697611+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9e14bbf8-0f17-4662-8447-856e73d6b54b', '4d062445-4744-4007-a2ac-d7c4743fc979', '482eee64-b951-46f1-a0b9-612a02013992', 0, 'Ajudando as pessoas ', '2026-04-11 11:24:38.801749+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b4812f91-40b1-4122-b6ab-43a5cb738235', '4d062445-4744-4007-a2ac-d7c4743fc979', '482eee64-b951-46f1-a0b9-612a02013992', 1, 'Definindo pelos erros', '2026-04-11 11:24:38.801749+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fbe6dc84-e9e9-4b8e-af99-ca9a15c071ec', '32a9f112-1192-4b2a-918f-c2895a76ade3', '12f627ce-ad3a-45d1-b90a-6282070e9524', 0, 'Estão bons', '2026-04-11 12:40:53.843076+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ec83973f-3564-4bcd-8f8e-684b43e85a08', '32a9f112-1192-4b2a-918f-c2895a76ade3', '12f627ce-ad3a-45d1-b90a-6282070e9524', 1, 'Sim', '2026-04-11 12:40:53.843076+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '879a40c4-61b7-43d4-b29c-0448939d5ffb', 'a608622c-4120-4d15-949f-235ca64db2cf', 'ba0f8dfe-02e3-4c8a-8bfc-16a9ce1afde9', 1, 'Que eu posso ser eu mesma independente do que os outros acham
', '2026-04-11 14:34:28.100054+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '69433cc9-d5bb-4d2a-86d4-b82c9d9b30f0', 'a608622c-4120-4d15-949f-235ca64db2cf', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 0, 'Sim
', '2026-04-11 14:35:02.546172+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0ec9ad1c-3826-47be-8c9a-85c9099ace32', 'a608622c-4120-4d15-949f-235ca64db2cf', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 1, 'Que eu tenho que fazer escolhas que ele faria', '2026-04-11 14:35:02.546172+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b2227860-e942-48a0-8f16-0a20f6aa959c', 'a608622c-4120-4d15-949f-235ca64db2cf', '12f627ce-ad3a-45d1-b90a-6282070e9524', 0, 'Bem, alguns distantes', '2026-04-11 14:35:31.38865+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b20b322f-a2db-4ab0-9c2b-af4599f18c30', 'a608622c-4120-4d15-949f-235ca64db2cf', '12f627ce-ad3a-45d1-b90a-6282070e9524', 1, 'Sim', '2026-04-11 14:35:31.38865+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '49fabd2b-b5d3-447b-8115-56aa608b1e6e', 'a608622c-4120-4d15-949f-235ca64db2cf', '482eee64-b951-46f1-a0b9-612a02013992', 0, 'Escolhas, e Deus ', '2026-04-11 14:36:19.401696+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '957d9d68-92b6-407a-ada2-467035c37a98', 'a608622c-4120-4d15-949f-235ca64db2cf', '482eee64-b951-46f1-a0b9-612a02013992', 1, 'Cm fé', '2026-04-11 14:36:19.401696+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd8e094a8-5245-44f5-a8d0-7286c3ed30c5', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'Trabalho jeito de agir 
', '2026-04-11 15:07:43.815436+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ae2db7b6-7dc7-49c7-bfca-fe67f0dce62c', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Por que ninguém pode decidir que a gente é só nos memos', '2026-04-11 15:07:43.815436+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '181d0ed4-1882-4475-97ac-5302f142690f', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Somos filhos de deus isso significa que nossa indentidade não precisa ser conquistada', '2026-04-11 15:07:43.815436+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cd329370-01a3-46f1-b8c6-b037594994f4', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '4923904c-0624-414c-a226-c0e44bf04174', 0, 'Significa que eu tenho um pai para cuidar de mim,e que confio nele.', '2026-04-11 15:26:00.27609+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0ac89ff7-8945-4a3e-9a0e-589893af457b', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '4923904c-0624-414c-a226-c0e44bf04174', 1, 'Cuida dele,ajuda,e quando precisar ele estará pronto para ajudar.', '2026-04-11 15:26:00.27609+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3afb8c77-cc5d-4aba-933c-cf3ac19e6a85', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '4923904c-0624-414c-a226-c0e44bf04174', 2, 'Muda quando sabemos que Deus tem um propósito para nossas vidas.', '2026-04-11 15:26:00.27609+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7531a858-410c-4049-9521-f16fabcae1c1', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', 'e3645858-1004-4f31-8d73-708e1749c4bd', 0, 'Por que elas querem ser aceitas e admiradas.', '2026-04-11 15:29:37.528971+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1fe68476-63cb-44c5-bb44-c594b426fc45', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', 'e3645858-1004-4f31-8d73-708e1749c4bd', 1, 'Que o nosso valor já foi provado. ', '2026-04-11 15:29:37.528971+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2872fd5b-3369-40da-a26d-8ea37892b5e2', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', 'e3645858-1004-4f31-8d73-708e1749c4bd', 2, 'Não precisamos provar nada a ninguém, em Cristo já somos amados.', '2026-04-11 15:29:37.528971+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'dfed19f0-bc88-4723-b53b-46af44a474ca', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 0, 'Identidade.', '2026-04-11 15:35:37.169971+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '63319ada-0d07-42b4-9467-5336b3433fb1', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 1, 'Cuidar com amor e carinho, pois ali é o templo do senhor.', '2026-04-11 15:35:37.169971+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fbe5bdaf-59d3-4706-8d5c-e5cea7f2a025', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 2, 'Deve viver segundo a vontade de Deus.', '2026-04-11 15:35:37.169971+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '60176305-0aa4-4592-973b-282fd502c2fb', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', 'a2b6f9a0-d031-4841-871b-280512b684eb', 0, 'Que Deus nos tira das trevas e mostra a sua luz.', '2026-04-11 15:39:09.375127+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '571c1796-0a18-47a1-8cd3-376e5e0a0a0f', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', 'a2b6f9a0-d031-4841-871b-280512b684eb', 1, 'Ser filho dele.', '2026-04-11 15:39:09.375127+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e0b4dce1-93df-4b3d-a1bd-1e2a274d878e', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', 'a2b6f9a0-d031-4841-871b-280512b684eb', 2, 'Com propósito e direção.', '2026-04-11 15:39:09.375127+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8fcd024a-610e-46a9-a3e6-e4928435eee1', '985bc110-c90a-4762-8b1b-7b081e0c6863', '67371245-6041-4df2-987e-05ea6fd6a427', 0, 'Que sou importante para Deus, e que fui criada para viver em comunhão ', '2026-04-11 15:59:19.470857+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bed9ac08-0b4c-4a14-bf78-a3ace47da00c', '985bc110-c90a-4762-8b1b-7b081e0c6863', '67371245-6041-4df2-987e-05ea6fd6a427', 1, 'Nas redes sociais, modismos impostos pela mídia, aprovação dos outros', '2026-04-11 15:59:19.470857+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2f20fe56-3bb8-4d57-aaec-b3809a328787', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 0, 'Porque faz com que o ser humano queira se parecer com Deus, não compreendendo sua necessidade de estar sob o olhar e cuidado do Pai', '2026-04-11 16:00:48.796032+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd6109900-2645-4ea8-8e1f-633e25ee279f', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 1, 'Nos momentos de dor, perda, frustração ', '2026-04-11 16:00:48.796032+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2178dea6-ccdd-44cc-83f1-cd0250976b3c', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 0, 'Em que possam tirar proveito, nas dificuldades...', '2026-04-11 16:01:46.527635+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bb334d1d-3003-49c7-89d5-10bf1846fc58', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 1, 'Confiar sempre nele e pensar coletivamente ', '2026-04-11 16:01:46.527635+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a537257d-76dc-4c57-80e6-05c2ee3c98f3', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'af440fb5-5112-4e54-bbb3-82812e917370', 0, 'Por vergonha, por acreditar que isto é possível e assim viver uma mentira', '2026-04-11 16:02:45.762213+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b2216609-d4d3-4706-afcc-7a6bd0f6d136', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'af440fb5-5112-4e54-bbb3-82812e917370', 1, 'Confiando no Pai', '2026-04-11 16:02:45.762213+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '502bc3e8-9af1-420d-bfde-8ad4c09134b5', '985bc110-c90a-4762-8b1b-7b081e0c6863', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 0, 'Por medo, vergonha ou até extrema auto confiança ', '2026-04-11 16:03:41.794889+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3dcd6a66-d279-491d-a2e9-f37026915cff', '985bc110-c90a-4762-8b1b-7b081e0c6863', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 1, 'Com seu grande amor', '2026-04-11 16:03:41.794889+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ac2e55a8-bfdb-4a55-b77d-e6800f692cfa', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 0, 'Para maquiar quem realmente são,  tendo medo de rejeição ', '2026-04-11 16:05:39.565681+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3636c896-675e-4b4c-81a7-4e82f6d70429', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 1, 'Que todos somos pecadores e não devemos nada para as outras pessoas, sendo um acerto entre nós e Deus... apenas isso', '2026-04-11 16:05:39.565681+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b85afd0b-41e7-46a8-98d6-169eed3c5ffe', '985bc110-c90a-4762-8b1b-7b081e0c6863', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 0, 'Generosidade e perdão ', '2026-04-11 16:06:26.637857+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '661daf64-a279-4528-aa0e-e89a023d7dc1', '985bc110-c90a-4762-8b1b-7b081e0c6863', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 1, 'Por que venceu a morte e o pecado', '2026-04-11 16:06:26.637857+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '744890c9-7a8d-44a4-bc3b-447c9e1164ef', '985bc110-c90a-4762-8b1b-7b081e0c6863', '2e26fe88-3337-4504-a083-c448326f0210', 0, 'Pois não conseguem compreender o perdão.  Estas pessoas não conseguem se perdoar, vivendo em constante culpa e dor', '2026-04-11 16:07:54.682232+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '790d50b1-5053-4c94-953d-c042a99599f8', '985bc110-c90a-4762-8b1b-7b081e0c6863', '2e26fe88-3337-4504-a083-c448326f0210', 1, 'Ser uma pessoa nova, diferente', '2026-04-11 16:07:54.682232+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6f8adc50-b1bd-45e4-9a47-f5771832bb38', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 0, 'Estar em sua constante presença do pai, colocando tudo diante do Pai... cada momento...', '2026-04-11 16:09:46.257352+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '29db497e-03d0-4d87-bfb8-e1f1de5a932b', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 1, 'Tendo fé no Senhor, procurando fazer o que nos ensina através da palavra ', '2026-04-11 16:09:46.257352+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a36af4c3-7238-4e6d-8ffa-af4f0714b495', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 0, 'Sim', '2026-04-11 16:12:56.19546+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f5b6a9db-a4c5-429c-9b01-fb1a67a6b355', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 1, 'Isso pode mudar em minhas escolhas por lembrar o valor que Deus da  a nossa existência comoleta', '2026-04-11 16:12:56.19546+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '630049ff-d7db-4c20-aa97-16f651e7fe94', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '482eee64-b951-46f1-a0b9-612a02013992', 0, 'O jeito de ser na escola ', '2026-04-11 16:41:57.551091+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd5d66318-175c-4a58-92a1-57b282782684', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '482eee64-b951-46f1-a0b9-612a02013992', 1, 'Orando,e tento o compromisso Cristão ', '2026-04-11 16:41:57.551091+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '34a3e714-0f26-4fc8-b9d6-e2074f6f8d1f', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 0, 'A discórdia entre as pessoas, a falta de respeito, humildade e amor mostram que algo está quebrado na humanidade', '2026-04-11 17:00:12.375582+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3dbe921d-fb0d-49be-a369-55786f92bcad', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 1, 'Porque a dúvida faz a pessoa deixar de confiar em Deus e começar a seguir a própria vontade.', '2026-04-11 17:00:12.375582+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bc9c70c9-36a3-4137-ad5b-78bcdd5256b6', 'b486e185-6cb3-477c-936b-b204b143e329', '4923904c-0624-414c-a226-c0e44bf04174', 0, 'Muitas coisas como saber que lê morreu na cruz por nós e ser mais fiel a ele 
', '2026-04-11 17:06:13.682502+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a8ba407c-8977-42c0-9575-a0f84793100e', 'b486e185-6cb3-477c-936b-b204b143e329', '4923904c-0624-414c-a226-c0e44bf04174', 1, 'Traz o pão de cada dia nos da o estudo de cada dia e nos ajuda em qualquer coisa', '2026-04-11 17:06:13.682502+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f9cd01e7-172e-4cf6-a304-1dd6c040962e', 'b486e185-6cb3-477c-936b-b204b143e329', '4923904c-0624-414c-a226-c0e44bf04174', 2, 'Muda em tudo como crer mais nele acredita que um dia ele vai nos buscar para o céu ', '2026-04-11 17:06:13.682502+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5dbb9141-d861-4188-8e07-75fe1c3aa003', 'b486e185-6cb3-477c-936b-b204b143e329', 'e3645858-1004-4f31-8d73-708e1749c4bd', 0, 'Para se achar mais importante que os outros', '2026-04-11 17:09:27.40365+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e3da9563-4a6c-410c-b172-838966ecd636', 'b486e185-6cb3-477c-936b-b204b143e329', 'e3645858-1004-4f31-8d73-708e1749c4bd', 1, 'A cruz mostra que nosso valor já foi provado pois Deus morreu por nós na cruz', '2026-04-11 17:09:27.40365+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'eb391e4b-cfd9-422f-baa0-807d81f9d452', 'b486e185-6cb3-477c-936b-b204b143e329', 'e3645858-1004-4f31-8d73-708e1749c4bd', 2, 'Muda que nos sabemos que já provamos para deus nosso valor', '2026-04-11 17:09:27.40365+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7e7fa6b1-9d14-4502-9289-a81dc20bd5ac', 'b486e185-6cb3-477c-936b-b204b143e329', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 0, 'Indentidade', '2026-04-11 17:17:28.966556+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cad56d35-75ad-4f17-b892-4d365e42bf00', 'b486e185-6cb3-477c-936b-b204b143e329', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 1, 'Cuidar do templo quer dizer cuidar do nosso corpo para o templo não desabar ', '2026-04-11 17:17:28.966556+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '02a0ce22-2201-4ed5-a8e8-591bde0badc5', 'b486e185-6cb3-477c-936b-b204b143e329', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 2, 'Viver de profunda compaixão bondade, humildade,mansidão, paciência etc', '2026-04-11 17:17:28.966556+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ec362fc2-b445-4e70-82e2-56338ef31564', 'b486e185-6cb3-477c-936b-b204b143e329', '45298ff1-59ff-43f1-9b93-69068582bdd0', 0, 'Pedir perdão a deus', '2026-04-11 17:19:00.469594+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.devotional_responses (
  id, user_id, devotional_id, question_index, response, created_at, updated_at, church_id
)
VALUES
(
  '5e01e4de-21ec-4a28-8fad-9507b56882d2', 'b486e185-6cb3-477c-936b-b204b143e329', '45298ff1-59ff-43f1-9b93-69068582bdd0', 1, 'Sempre', '2026-04-11 17:19:00.469594+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f5dff43f-fe5d-4a53-9fce-2f4c9750e332', 'b486e185-6cb3-477c-936b-b204b143e329', '45298ff1-59ff-43f1-9b93-69068582bdd0', 2, 'Esperança de voltar a ter uma relação com ele', '2026-04-11 17:19:00.469594+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '545abf9d-572d-4449-bf69-bf7cbba2802e', 'b486e185-6cb3-477c-936b-b204b143e329', 'a2b6f9a0-d031-4841-871b-280512b684eb', 0, 'Que somos o povo exclusivo de deus', '2026-04-11 17:21:50.093709+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1566f32e-9423-4d63-9ddb-4f85b1aa1597', 'b486e185-6cb3-477c-936b-b204b143e329', 'a2b6f9a0-d031-4841-871b-280512b684eb', 1, 'Ser dele para sempre', '2026-04-11 17:21:50.093709+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cd38dca4-dc04-40ac-9313-583fb7f3ad02', 'b486e185-6cb3-477c-936b-b204b143e329', 'a2b6f9a0-d031-4841-871b-280512b684eb', 2, 'Com humildade, mansidão, paciência etc', '2026-04-11 17:21:50.093709+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bbfbc86d-04a8-44d8-bcc1-30fdfa19e27c', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 0, 'Sim ', '2026-04-11 18:32:33.118706+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c03e7b13-3737-49cd-8c86-ad8d42b8f152', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 1, 'Muda que eu sou o templo do Espírito Santo ', '2026-04-11 18:32:33.118706+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0e669db0-d415-4305-9a5b-25d97d56a7d5', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'af72e9fc-4ffc-4ecc-9fe4-732e059f947e', 0, 'Que ele é o filho de Deus, o salvador', '2026-04-12 11:23:49.749397+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8d8a0e4f-38e7-4df6-b2e5-f3a63c082249', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'af72e9fc-4ffc-4ecc-9fe4-732e059f947e', 1, 'Atualmente, vem de mim. Mas muitas vezes apenas repetia o que havia aprendido.', '2026-04-12 11:23:49.749397+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b01c0049-296d-4633-bc92-a1502300d38e', '84f87cda-6f3a-43ef-a265-93e7c3d15c23', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'Nas sua notas, aparência, trabalho ou sua popularidade.', '2026-04-12 14:30:32.686995+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bb17d382-288d-4d27-8e0f-7226ac5bd74f', '84f87cda-6f3a-43ef-a265-93e7c3d15c23', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Nossa indentidade principal não está no que fazemos mas em quem somos diante de Deus.', '2026-04-12 14:30:32.686995+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd2b80641-594a-4c72-8207-1b3f32a0e551', '84f87cda-6f3a-43ef-a265-93e7c3d15c23', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Muda a forma como vemos a vida, porque não vivemos mais tentando ser aceitos, mas vivemos porque já fomos aceitos por Deus ', '2026-04-12 14:30:32.686995+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'dcc578b5-f42c-46b2-bada-48858b6cf574', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', 'd860c7de-47c9-4665-bf9d-315cd5cd4e6f', 0, 'Sempre que Deus me criou e cada um tem a sua importância ', '2026-04-12 16:46:24.443125+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '289d7389-efd8-4a10-a644-43fc11426c40', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', 'd860c7de-47c9-4665-bf9d-315cd5cd4e6f', 1, 'Que Deus me criou para eu refletir alguma coisa sobre ele', '2026-04-12 16:46:24.443125+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9acb6007-5bb0-4035-9832-beec1e91601c', '66b31cf2-7782-4253-98ea-3b6d631703a4', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'Com outras pessoas ', '2026-04-12 17:14:27.228349+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ff00a880-a9f0-454d-b1da-380c0818b8ae', '66b31cf2-7782-4253-98ea-3b6d631703a4', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Por que as opiniões podem mudar ', '2026-04-12 17:14:27.228349+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ff25595a-fcdd-4dd2-aa4d-3ea753aefb1a', '66b31cf2-7782-4253-98ea-3b6d631703a4', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Não procurar a opinião dos outros pq em Deus já somos aceitos ', '2026-04-12 17:14:27.228349+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4e21614b-d799-4166-a07a-f7b7ab5111d1', '84f87cda-6f3a-43ef-a265-93e7c3d15c23', '5e859f9e-3016-4482-96fd-1cae2e76f966', 0, 'Viver longe de Deus, confiar mais em nós mesmos do que nele e tentar viver sem ele.', '2026-04-14 00:15:16.131822+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '591305d4-fb15-468e-adb9-6834fb5e9e77', '84f87cda-6f3a-43ef-a265-93e7c3d15c23', '5e859f9e-3016-4482-96fd-1cae2e76f966', 1, 'O pecado afetou não só nossas atitudes, mas também nossa indentidade. Em vez de vivermos como filhos que confiam em Deus, passamos a viver com medo, culpa, comparação e orgulho.', '2026-04-14 00:15:16.131822+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2508374e-0263-4f8a-8b3f-f9567905c289', '84f87cda-6f3a-43ef-a265-93e7c3d15c23', '5e859f9e-3016-4482-96fd-1cae2e76f966', 2, 'A Bíblia diz que todos pecaram. Isso significa que todos nós falhamos, erramos e nos afastamos de Deus ', '2026-04-14 00:15:16.131822+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '72cb18ee-b3d8-40ba-8d27-56b29d55e304', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', 'e3645858-1004-4f31-8d73-708e1749c4bd', 0, 'Para serem aceitas e mais populares ou amadas', '2026-04-14 00:34:51.829851+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '62278571-907b-4c00-8e89-48c3bee6c177', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', 'e3645858-1004-4f31-8d73-708e1749c4bd', 1, 'Na cruz mostra que o nosso valor ja foi provado. Jesus morreu por nós quando ainda éramos pecadores ', '2026-04-14 00:34:51.829851+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '151db414-edef-4769-b0d9-739060ea9e1c', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', 'e3645858-1004-4f31-8d73-708e1749c4bd', 2, 'Saber que ja somos amados pelo ser mais importante ', '2026-04-14 00:34:51.829851+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a323c5a2-bfc9-4ae4-ad9f-f31ae980ee68', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 0, 'Sim', '2026-04-14 00:59:42.690073+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9f7f9097-8ad7-40d0-9262-2a567b7044fc', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '534f7bd1-d3ce-4cf0-888d-87951209aba1', 1, 'Ter uma vida saudável não se drogar não machucar o próprio corpo', '2026-04-14 00:59:42.690073+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3883a9ce-fcb7-433d-87ff-c5655b6a650b', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 0, 'Tento me indentificar como filho de Deus então sim ', '2026-04-14 14:48:29.676339+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ae12f069-9cd0-4b0c-9829-018ccc6fae43', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', 'e6008830-87f7-4b01-865f-30595ccb5a7d', 1, 'Bom pq deus da um propósito para cada im', '2026-04-14 14:48:29.676339+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7a29bc5e-5e4b-434a-9cd4-437f4f314169', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '9bf5b69c-d399-4266-9e14-57570672ef33', 0, 'A palavra redenção significa resgatar e libertar
', '2026-04-14 14:54:06.948334+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8f80decf-2746-4754-9def-8edf7c11874b', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'Jesus ele libertou a gente da morte da cruz ele morreu por a gente', '2026-04-14 14:54:06.948334+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '19ee80f9-5123-4dac-82b5-232fa83d4b94', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '9bf5b69c-d399-4266-9e14-57570672ef33', 2, 'Gratidão porque ele que salvou a gente ', '2026-04-14 14:54:06.948334+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6855a635-ec79-4929-9c14-b5472cbb3332', '84f87cda-6f3a-43ef-a265-93e7c3d15c23', '9bf5b69c-d399-4266-9e14-57570672ef33', 0, 'Redenção significa resgatar, libertar, comprar de volta. ', '2026-04-14 21:34:13.25581+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7e01a85f-f80c-4496-bda3-04357c264caa', '84f87cda-6f3a-43ef-a265-93e7c3d15c23', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'Jesus pagou preço com sua própria vida na cruz para nos lebertar.', '2026-04-14 21:34:13.25581+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a946ba77-2272-4d09-977d-2b4de62ddd4c', '84f87cda-6f3a-43ef-a265-93e7c3d15c23', '9bf5b69c-d399-4266-9e14-57570672ef33', 2, 'É viver sabendo que fomos resgatados por Jesus e agora pertencemos a ele.', '2026-04-14 21:34:13.25581+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '73e32ef4-8bbb-4ff4-8d29-ee2e1cc0e381', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 0, 'Nova criação significa uma nova vida', '2026-04-15 23:35:31.880174+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a44cf2d8-32d1-41b4-90ce-00cf71f7dfa4', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 1, 'Nosso passado na define quem por que deus nos da u.a nova o dentidade', '2026-04-15 23:35:31.880174+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ed03a633-84e8-4757-9740-c78c3ef33e37', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 2, 'Ele perdoa nossos pecados ', '2026-04-15 23:35:31.880174+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bbc58e2b-a18f-45fd-a5c5-d10bd8778fb9', '84f87cda-6f3a-43ef-a265-93e7c3d15c23', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 0, 'Não significa que a pessoa nunca mais vai errar o que tudo muda de um dia para o outro.', '2026-04-16 01:49:41.23023+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7d2bd93f-66b7-4084-88a0-f855840f5809', '84f87cda-6f3a-43ef-a265-93e7c3d15c23', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 1, 'Porque antes vivíamos longe de Deus, agora pertencemos a ele.', '2026-04-16 01:49:41.23023+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '984eef4a-55e0-4d32-a7af-1a7dd4f89fa5', '84f87cda-6f3a-43ef-a265-93e7c3d15c23', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 2, 'Nos perdoando dos pecados.', '2026-04-16 01:49:41.23023+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1e523e37-4675-467d-b838-83ab5e883aa9', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '4923904c-0624-414c-a226-c0e44bf04174', 0, 'Significa que nos temos um pai que cuida de nós ', '2026-04-17 17:27:57.198586+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '56192731-bc33-433f-8cf6-0e1bb91752eb', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '4923904c-0624-414c-a226-c0e44bf04174', 1, 'Cuida', '2026-04-17 17:27:57.198586+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '69cfd68b-ed12-42d0-bec3-7be4e006ee63', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '4923904c-0624-414c-a226-c0e44bf04174', 2, 'Que a gente tem mais fé se aproxima de Deus ', '2026-04-17 17:27:57.198586+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'eb898eac-83b3-428c-84c3-a73e3ce20411', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '12f627ce-ad3a-45d1-b90a-6282070e9524', 0, 'Estão bem, tenho muitos amigos', '2026-04-17 22:02:38.314854+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e0adaab6-27c2-4b44-b209-23cd3436e9fa', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '12f627ce-ad3a-45d1-b90a-6282070e9524', 1, 'Sim todos os dias', '2026-04-17 22:02:38.314854+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8c0535c3-e460-4604-9b10-aecaf409ae5d', '8bf335ab-907e-497b-b08b-615ad716e722', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'Nas coisas temporárias da vida , como a sua aparência e popularidade ', '2026-04-17 22:08:48.940948+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8de999ff-0703-4663-9bb0-8d14c3c572bd', '8bf335ab-907e-497b-b08b-615ad716e722', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Porque nossa indentidade é recebida de Deus e não formada por coisas temporárias ', '2026-04-17 22:08:48.940948+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9361aa48-5f6a-4b66-919e-c9f90317c0e0', '8bf335ab-907e-497b-b08b-615ad716e722', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Muda muito , agora eu sei que sou filho de quem criou tudo e todos , fico muito mais feliz ao ler a bíblia e ao pensar nisso ', '2026-04-17 22:08:48.940948+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '45dce1fc-dfc0-4cb0-b47e-9b5d89089c22', '8745732c-55e9-488b-b638-960a6d9ea340', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'Nos sentimentos, ações da vida, trabalho, aparência e sucesso ', '2026-04-18 14:34:55.099947+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8d8be60c-f726-4738-a0b5-627b8d542720', '8745732c-55e9-488b-b638-960a6d9ea340', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Pois tudo muda cada dia ', '2026-04-18 14:34:55.099947+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bf3e59a3-73bc-49c7-bf24-049a96fb62a6', '8745732c-55e9-488b-b638-960a6d9ea340', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Que eu sou uma pessoa incrível cria pelo homem mais perfeito do mundo ', '2026-04-18 14:34:55.099947+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b38b9d59-7430-42f7-a8e5-a7668bde4915', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 0, 'As próprias pessoas "más",podem ser concertadas,mais quando inda permanecem no pecado,vemos que ela parece quebrada,com defeito,por não estar nos braços de Deus ', '2026-04-20 12:07:34.440985+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fadd6b8b-2c83-43c1-b70a-c240ba9bf5b5', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 1, 'Porque noa querem permanecer nele', '2026-04-20 12:07:34.440985+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '97e0d401-54b8-45bb-9909-05643ce4e7a1', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 0, 'Violência e mentira ', '2026-04-20 13:18:13.240358+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9c5f131f-13f9-466c-af9c-1314a751c370', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 1, 'Porque os humanos mentem declarão guerra', '2026-04-20 13:18:13.240358+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f8e517db-e7b7-4c60-813b-7e08e4bad41f', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 0, 'Porque há muita falta de amor, injustiça e violência, mostrando que algo está errado nas pessoas.', '2026-04-20 18:42:18.681463+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '92def5b8-714f-478b-8ec2-b6d728829cd3', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 1, 'Porque é da natureza humana errar e pensar em si mesmo, por isso precisamos de Deus.', '2026-04-20 18:42:18.681463+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a9fc40a9-8be0-41b0-a665-326fff726fc1', '2f773751-38c2-45a1-8ee0-f5b856092730', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 0, 'As guerras,corrupão no pais, a morte fisica, as familias brigadas.', '2026-04-20 18:44:10.882333+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'da89c544-ece9-4b22-8bee-c92dab930e1e', '2f773751-38c2-45a1-8ee0-f5b856092730', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 1, 'POrque todos os seres humanos fazem coisas ruins.', '2026-04-20 18:44:10.882333+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f0e470a9-a80c-4bc6-a7c3-01c27683535e', '9289d1ce-a632-4cd7-930e-73023e549ec5', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 0, 'Guerras,crimes, violência e poluição', '2026-04-20 20:11:04.645447+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '062ed516-8920-4b0e-ba2e-5791d5dd217c', '9289d1ce-a632-4cd7-930e-73023e549ec5', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 1, 'Pois alguns tentam lutar contra o pecado para tentar ser uma pessoa melhor,e outras colocam "eu" no centro da vida,assim pecando e se afastando de Deus', '2026-04-20 20:11:04.645447+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '46e090ab-4d96-49b3-86db-bcd447122764', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 0, 'A deseducacao na pessoas', '2026-04-20 21:53:10.286963+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c3a7565c-78ac-4a1f-909f-682effecb7fb', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 1, 'As coisas q fazemos', '2026-04-20 21:53:10.286963+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '31687c0c-1866-49dc-af8f-f1062c5cbb4d', '4d062445-4744-4007-a2ac-d7c4743fc979', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 0, 'As pessoas pecadoras', '2026-04-20 21:53:11.177487+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3dca792d-d587-4bf5-a207-899d1d03e73b', '4d062445-4744-4007-a2ac-d7c4743fc979', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 1, 'Pq nimguem é perfeito ', '2026-04-20 21:53:11.177487+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '179a401b-94da-4e84-8ca7-3d6c3f8f5a9c', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 0, 'O egoísmo ', '2026-04-20 21:54:28.198489+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd8cd34f3-edd6-4ada-92ed-b6211954f554', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 1, 'Por que sempre vai ter algo que não faz bem ao outro', '2026-04-20 21:54:28.198489+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c4f36270-6e24-4706-b9d4-a49598b4646e', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 0, 'Pessoas com mal intenções, desrespeitos e pessoas que não tem mais amor ao próximo.', '2026-04-20 22:04:10.925069+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd5a41d5e-7504-4a74-a6db-4f4cc05eab4a', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 1, 'Sempre em algum momento o humano falha, e isso é considerado pecado.', '2026-04-20 22:04:10.925069+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cfda76d6-b444-4e58-96a8-97621f67b13d', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 0, 'Como as pessoas agem ', '2026-04-20 22:11:09.830856+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fc321c6a-07cb-4997-a7e2-a04c01a5884d', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 1, 'Porque todos peçam
', '2026-04-20 22:11:09.830856+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7c5b6310-4a08-4800-a000-8caf7fe7cfbb', 'a608622c-4120-4d15-949f-235ca64db2cf', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 0, 'As pessoas', '2026-04-20 22:13:25.989743+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b3ef52d6-c87f-4648-8eea-bd059fe575b1', 'a608622c-4120-4d15-949f-235ca64db2cf', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 1, 'Pq o pecado consome as pessoas', '2026-04-20 22:13:25.989743+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fe422044-c4b1-4b65-8adb-a6f246354649', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 0, 'A falta de gentileza com os outros ', '2026-04-20 22:13:43.124506+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '75b95a4c-9db5-40e8-afce-480103b8df91', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 1, 'Porque todo momento nos erros a cometemos pescada ', '2026-04-20 22:13:43.124506+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a3cc37c6-6646-4561-af1c-ae8dc47eb1e1', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 0, 'O amor', '2026-04-20 22:14:05.515314+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7ce02408-1854-4b4a-9db5-0c14d86b2e1d', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 1, 'Porque todos tem pecados', '2026-04-20 22:14:05.515314+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c835a445-3d20-468f-83ab-718ae0dae6e2', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 0, 'As brigas, e menas pessoas acreditando em Deus', '2026-04-20 23:02:57.893578+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5f80d9b1-6593-49e2-8203-11310cc54dbd', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 1, 'Porque o pecado nunca é bom, e todos sabem disso', '2026-04-20 23:02:57.893578+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6344a958-338a-4a1a-8d3e-e7d1235c2d26', '914b898d-24a3-46ad-a764-d2f24e5115d1', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 0, 'Egoísmo,raiva 
', '2026-04-20 23:34:40.7617+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '82411ca1-48fd-46c0-9a7d-24370fdec8b0', '914b898d-24a3-46ad-a764-d2f24e5115d1', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 1, 'Porque pecado e ruim', '2026-04-20 23:34:40.7617+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ab4573b0-3aa8-4785-b84b-6f9e0b53a8d7', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 0, 'As próprias pessoas ', '2026-04-21 00:18:13.608718+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '68c3e29a-4877-42e9-a2a5-13af8863d278', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 1, 'Eles lutam pra n pecarem ', '2026-04-21 00:18:13.608718+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ac73ec7f-1cf8-4925-8189-8e6316f9e6ec', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 0, 'O amor pelo próximo ', '2026-04-21 00:58:15.072051+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '415795ba-a886-4c0e-97b9-b39fc7ce7b31', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 1, 'Porque todos fizemos coisas erradas', '2026-04-21 00:58:15.072051+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6114a5da-7cc2-4b9b-ae55-8cb6dba5477c', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 0, 'Como as pessoas tratam e cuidam do mundo', '2026-04-21 01:34:22.436709+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7a0f4a60-4fdf-4292-9cd5-4f9977aa73f7', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 1, 'Por que todo ser humano erra alguma vez', '2026-04-21 01:34:22.436709+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9e6f6965-629c-4366-9c78-0ad5e1a155f7', '985bc110-c90a-4762-8b1b-7b081e0c6863', '849aea28-5c96-4994-8eee-52648971230b', 0, 'Saber que ele é real me faz acreditar que ele realmente sabe como me sinto', '2026-04-21 02:22:42.319179+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '898a1378-350d-4e1f-b1e9-e679088a209d', '985bc110-c90a-4762-8b1b-7b081e0c6863', '849aea28-5c96-4994-8eee-52648971230b', 1, 'Real.', '2026-04-21 02:22:42.319179+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0d3dd2c5-8091-448c-bf1b-6f88b73aa000', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 1, 'Quando eu peso para ele me ajudar em alguma coisa e ele deixa que eu faça ', '2026-04-22 10:23:10.502052+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '277f92e5-cba2-41a1-a84d-c0769846b5cc', '985bc110-c90a-4762-8b1b-7b081e0c6863', '33c931a8-3267-4d0f-90e8-229c9b56fd39', 0, 'Além de entender que ele sofreu dores quando se fez carne, é ter a certeza que ele compreende exatamente meus sentimentos, lutas e aflições ', '2026-04-21 02:29:14.154809+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '52136e00-bd4a-4836-a0d1-77bd9f5acfc4', '985bc110-c90a-4762-8b1b-7b081e0c6863', '33c931a8-3267-4d0f-90e8-229c9b56fd39', 1, 'Sim. Isto alivia as lutas, batalhas e dores.', '2026-04-21 02:29:14.154809+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3bc9a93c-c943-4e65-ab7f-49d40b16af5d', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 0, 'Mostra que Deus é cheio de amor e misericórdia, porque mesmo depois do pecado Ele já oferece esperança e um plano de salvação.', '2026-04-21 12:10:23.10878+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1a4ec07a-0caa-436c-84bd-df04cdf62d6f', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 1, 'Porque Ele venceu o pecado e a morte, dando a nós a chance de uma nova vida e de nos reconciliarmos com Deus.', '2026-04-21 12:10:23.10878+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7b95571f-8640-4668-850d-ffad8982357d', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '67371245-6041-4df2-987e-05ea6fd6a427', 0, 'Significa que eu tenho grande valor para Deus pois ele me criou a imagem dele', '2026-04-21 13:05:53.379037+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0c9ac199-9c19-4a62-aff6-605b238c30ed', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '67371245-6041-4df2-987e-05ea6fd6a427', 1, 'Em documentos ', '2026-04-21 13:05:53.379037+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '918b3f04-4ae2-4958-aba6-cf1752c5c2c8', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '67371245-6041-4df2-987e-05ea6fd6a427', 0, 'Por nós termos valor a vida e dignidade ', '2026-04-21 13:09:07.208269+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a6e7a125-1e00-420c-84c6-5db3d829ee75', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '67371245-6041-4df2-987e-05ea6fd6a427', 1, 'Nas aparências a nas popularidade dela se mesmo ', '2026-04-21 13:09:07.208269+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '70740ec7-4a4e-44f8-a416-a55029781ec6', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '67371245-6041-4df2-987e-05ea6fd6a427', 0, 'Que sou importante ', '2026-04-21 13:46:41.241543+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '57ba1b28-f15a-489c-8ca2-67b344a3bbfe', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '67371245-6041-4df2-987e-05ea6fd6a427', 1, 'Em pessoas que se inspiram como famosos,  Deus, em sua família e outros ', '2026-04-21 13:46:41.241543+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6641a8f8-2940-4b41-bf09-6af4dc4c308f', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '67371245-6041-4df2-987e-05ea6fd6a427', 0, 'Significa que fomos criados para agirmos conforme a vontade de Deus, buscando fazer oque lhe agrada.', '2026-04-21 14:24:20.184068+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.devotional_responses (
  id, user_id, devotional_id, question_index, response, created_at, updated_at, church_id
)
VALUES
(
  '539aa135-e239-452c-9b40-9fc75f842817', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '67371245-6041-4df2-987e-05ea6fd6a427', 1, 'Hoje em dia muitas pessoas buscam sua identidade através do que a maioria faz, através das redes sociais e da Internet, na maioria das vezes não buscando na palavra de Deus.', '2026-04-21 14:24:20.184068+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fefc4017-64d2-4c2e-8e18-20a00d03143c', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '40f39a0c-eb00-4646-8f8f-e79d0f2e782e', 0, 'A graça de Deus me surpreende que ele sempre está feliz e realiza nossos sonho', '2026-04-21 14:59:25.059307+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cdee81cc-0374-4fa3-9a81-a604db65b2f7', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '40f39a0c-eb00-4646-8f8f-e79d0f2e782e', 1, 'A graça torna uma coisa especial que cada um ajuda o próximo ', '2026-04-21 14:59:25.059307+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'eeef97c6-2e2a-4556-a015-f3c05658f755', 'b486e185-6cb3-477c-936b-b204b143e329', '40f39a0c-eb00-4646-8f8f-e79d0f2e782e', 0, 'Já me surpreendeu com muitas coisas ', '2026-04-21 16:03:12.242722+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b4bc2218-18cb-4e76-8a90-81f76826b147', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '67371245-6041-4df2-987e-05ea6fd6a427', 0, 'Que minha vida tem valor e propósito, porque fui criada por Deus.', '2026-04-21 18:06:08.865943+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2b87a56a-c00b-4f03-9c6f-feb77b0c3227', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '67371245-6041-4df2-987e-05ea6fd6a427', 1, 'As pessoas buscam identidade na aparência, opinião dos outros.', '2026-04-21 18:06:08.865943+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ff21c273-a723-4d28-be39-37abd7c6e96b', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 0, 'Os valores estão distorcidos', '2026-04-21 19:15:01.623988+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b338e663-50b8-4575-946e-efdb785f1f03', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 1, 'Para receber a salvação de Cristo ', '2026-04-21 19:15:01.623988+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b7f557b2-fa58-4d82-b195-a520b0dc2f36', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '67371245-6041-4df2-987e-05ea6fd6a427', 0, 'Que eu tenho valor e um propósito ', '2026-04-21 19:35:34.288878+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2d415cd0-bf20-46dc-af16-15c482d557c8', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '67371245-6041-4df2-987e-05ea6fd6a427', 1, 'Se comparado com os outros ', '2026-04-21 19:35:34.288878+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5cc3cbd6-a6ea-41dc-a705-48c311388927', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'b7fa9652-410e-4468-8ee5-5e002fe936fe', 0, 'Creio que sim, mas não posso esquecer que algumas vezes posso não perceber o pecador, como por exemplo, ofender alguém sem querer. Sendo assim, preciso pedir perdão por aquilo que não foi intencional também. ', '2026-04-21 19:44:55.967797+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '938dc0c8-265e-44f3-b2e3-eb3da4400898', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'b7fa9652-410e-4468-8ee5-5e002fe936fe', 1, 'Creio que sim.', '2026-04-21 19:44:55.967797+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '36d2d5ac-4d2c-454c-baa8-9af9ee7cfb45', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'e86967ef-d9c3-44a3-a7cf-91cdef287d66', 0, 'Sim. Ele sabe até mesmo quantos fios de cabelo possuo.', '2026-04-21 19:46:02.508355+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3cb146b9-ae42-4386-ac07-003d3a570688', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'e86967ef-d9c3-44a3-a7cf-91cdef287d66', 1, 'Algumas vezes, acredito que sim.', '2026-04-21 19:46:02.508355+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c261fba8-d2f9-40eb-877d-c668b75aa171', '9289d1ce-a632-4cd7-930e-73023e549ec5', '67371245-6041-4df2-987e-05ea6fd6a427', 0, 'Que minha vida tem valor,dignidade e propósito', '2026-04-21 19:59:32.247518+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '26a4936e-c352-4b31-8029-9d54bb024766', '9289d1ce-a632-4cd7-930e-73023e549ec5', '67371245-6041-4df2-987e-05ea6fd6a427', 1, 'Aparência,desempenho escolar,popularidade, dinheiro e aprovação dos outros', '2026-04-21 19:59:32.247518+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd0d96dc4-13b1-4c99-a242-8362057d9caa', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '67371245-6041-4df2-987e-05ea6fd6a427', 0, 'Ser criado por ele', '2026-04-21 23:56:22.036356+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6f389a0b-c8fc-440f-98f7-50474fce592a', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '67371245-6041-4df2-987e-05ea6fd6a427', 1, 'Se comparando ', '2026-04-21 23:56:22.036356+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5e030603-57f5-411b-9ff4-cbf466972b02', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '67371245-6041-4df2-987e-05ea6fd6a427', 0, 'Que sou semelhante a ele', '2026-04-21 23:57:50.017486+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c6fce281-10d6-4ab2-b284-4b18071dcbd8', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '67371245-6041-4df2-987e-05ea6fd6a427', 1, 'Redes sociais ', '2026-04-21 23:57:50.017486+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c1aa83c1-ad21-4ca6-bef8-9f3a2aec9599', '914b898d-24a3-46ad-a764-d2f24e5115d1', '67371245-6041-4df2-987e-05ea6fd6a427', 0, 'Que sou feliz..pois Deus me escolheu ', '2026-04-21 23:58:26.623406+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd7cd4e37-e4b5-4718-96cf-0f1dc378f8f8', '914b898d-24a3-46ad-a764-d2f24e5115d1', '67371245-6041-4df2-987e-05ea6fd6a427', 1, 'Em aparências.,mas deviam seguir as orientações da palavra ', '2026-04-21 23:58:26.623406+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f8d71e27-20e8-4d64-b5ee-e52cce3e07ed', 'a608622c-4120-4d15-949f-235ca64db2cf', '67371245-6041-4df2-987e-05ea6fd6a427', 0, 'Significa para mim que ou importante
', '2026-04-22 00:02:23.48895+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '867ef914-71d1-447e-ad75-908e2553ccec', 'a608622c-4120-4d15-949f-235ca64db2cf', '67371245-6041-4df2-987e-05ea6fd6a427', 1, 'Na personalidade', '2026-04-22 00:02:23.48895+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a9594a10-4c65-48ac-ba5a-817c9583d689', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '67371245-6041-4df2-987e-05ea6fd6a427', 0, 'Significa que eu tenho uma longa história para viver pela frente e muitas conquistas para serem conquistadas.', '2026-04-22 00:03:00.94477+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1b79a456-e7a9-42b9-91e0-c2001b339cce', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '67371245-6041-4df2-987e-05ea6fd6a427', 1, 'Em redes sociais e em outras pessoas.', '2026-04-22 00:03:00.94477+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f48d202e-37ca-4b45-8701-c22c8f8cab09', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '67371245-6041-4df2-987e-05ea6fd6a427', 0, 'Me sinto mais confortável e importante ', '2026-04-22 00:15:37.026783+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '20bab3e8-cdc2-4f44-82ed-0af7d8538824', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '67371245-6041-4df2-987e-05ea6fd6a427', 1, 'Nas redes sociais ', '2026-04-22 00:15:37.026783+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '738efa44-34e8-4092-af0c-c735c71ccc46', '4d062445-4744-4007-a2ac-d7c4743fc979', '67371245-6041-4df2-987e-05ea6fd6a427', 0, 'Ter a imagem dele
', '2026-04-22 00:19:47.817165+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a8048775-16a9-4865-86a6-651b4c818723', '4d062445-4744-4007-a2ac-d7c4743fc979', '67371245-6041-4df2-987e-05ea6fd6a427', 1, 'Nós cultos', '2026-04-22 00:19:47.817165+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '22dbfb3a-5f1f-4845-a17a-424877df87df', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '67371245-6041-4df2-987e-05ea6fd6a427', 0, 'Significa que tenho cuidar de mim igual Deus quis que eu me cuidasse', '2026-04-22 00:21:52.720125+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7528c83a-df2e-4d0a-9439-72a9eeb6d32f', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '67371245-6041-4df2-987e-05ea6fd6a427', 1, 'Em lugares que ela se sente bem', '2026-04-22 00:21:52.720125+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1b8bc1f1-619c-482f-8937-b0d5ba762954', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '67371245-6041-4df2-987e-05ea6fd6a427', 0, 'Sentimento de importância ', '2026-04-22 01:54:59.081855+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'de98be7b-9c52-4ac9-abf5-706909f68be2', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '67371245-6041-4df2-987e-05ea6fd6a427', 1, 'Na internet ', '2026-04-22 01:54:59.081855+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '603c4e25-d1f1-4dd3-a893-567b781755ad', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '67371245-6041-4df2-987e-05ea6fd6a427', 0, 'Me sinto muito honrada ', '2026-04-22 03:24:46.155071+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f54d9ab0-3c80-48aa-a0f2-f9dfe7589fda', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '67371245-6041-4df2-987e-05ea6fd6a427', 1, 'Nas redes sociais ', '2026-04-22 03:24:46.155071+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4e14a516-908b-4740-afe5-7dbf4fcf96af', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 0, 'Porque as vezes pensamos se realmente é verdade ', '2026-04-22 10:23:10.502052+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '729f9147-4760-4490-9e64-db6bca2f15b4', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 0, 'Porque a mentira é muito mais fácil que a verdade', '2026-04-22 12:55:07.701686+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0995308e-47ce-446c-a9d6-8c757093ff82', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 1, 'Quando temos problemas ', '2026-04-22 12:55:07.701686+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1f02a2fb-1e84-4833-bfbb-bead44a88e6e', '985bc110-c90a-4762-8b1b-7b081e0c6863', '6c37261b-db87-4224-b42f-546e9d6b8f2f', 0, 'Sim. Se Ele é o caminho, posso confiar nisso.', '2026-04-22 13:40:09.524884+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0b1eae46-3a55-495d-82b9-6ce31abd4124', '985bc110-c90a-4762-8b1b-7b081e0c6863', '6c37261b-db87-4224-b42f-546e9d6b8f2f', 1, 'Às vezes tento fazer isso. Mas lembro do Senhor, do criador, e procuro voltar a confiar nele como sendo o único caminho.', '2026-04-22 13:40:09.524884+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '05fc0fa9-f839-4cf7-8b00-b5847a3b9dac', '985bc110-c90a-4762-8b1b-7b081e0c6863', '2bc9be13-ca22-4f97-a054-0822e279b99b', 0, 'Às vezes esta ideia de merecer a salvação vem à tona. Então, preciso lembrar do sangue derramado na cruz, de como não sou merecedora, mas como Cristo me ama.', '2026-04-22 13:41:59.736244+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a889e039-8a01-44d9-afd5-a514cb2f43e9', '985bc110-c90a-4762-8b1b-7b081e0c6863', '2bc9be13-ca22-4f97-a054-0822e279b99b', 1, 'Traz paz.', '2026-04-22 13:41:59.736244+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2f98f3e1-ce90-491f-8880-1ee4146ba806', '985bc110-c90a-4762-8b1b-7b081e0c6863', '33212d42-ccc1-4887-891d-80c7a46207eb', 0, 'Meu futuro, minhas inseguranças em relação a ele.', '2026-04-22 13:43:18.375716+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ed56f890-eaa9-4f9b-8056-4bc10f8fa5b6', '985bc110-c90a-4762-8b1b-7b081e0c6863', '33212d42-ccc1-4887-891d-80c7a46207eb', 1, 'Sim. Mas preciso fazer isso constantemente', '2026-04-22 13:43:18.375716+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1fb9100b-78d2-4df6-87dd-76da92a3c847', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 0, 'Porque criar uma dúvida pode causar, desconfiança, aliás imagina desconfiar do salvador!', '2026-04-22 15:04:18.193363+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '722415ec-c44a-4672-9832-175064b800f6', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 1, 'Nós momentos mais críticos,tipo doença sem cura,quando alguém que amamos adoece....etc', '2026-04-22 15:04:18.193363+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'dce910d2-adeb-4b00-93ed-cc4d481998e6', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 0, 'Para pensarmos melhor', '2026-04-22 15:04:23.181727+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e0fbf494-bf6b-4d7f-9c26-96248db039eb', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 1, 'Em nenhum ue', '2026-04-22 15:04:23.181727+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f8d131fb-fd28-45af-b40f-c20b2256a6ed', '32a9f112-1192-4b2a-918f-c2895a76ade3', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 0, 'A poluição', '2026-04-22 15:51:48.617793+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e141a169-7298-4fa8-b37b-9a4a5c857304', '32a9f112-1192-4b2a-918f-c2895a76ade3', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 1, 'Pois sempre pecamos', '2026-04-22 15:51:48.617793+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6d08b67b-80a1-46a3-a076-ab8522fd72f2', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 0, 'Porque ela faz a gente questionar a verdade e perder a confiança em Deus, abrindo espaço para decisões erradas.', '2026-04-22 16:17:10.470994+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4e501d7e-822c-4903-acb8-0d8d72cfa493', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 1, 'Quando passo por dificuldades, não entendo o que está acontecendo ou quando sinto medo e insegurança.', '2026-04-22 16:17:10.470994+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e2cf3f0a-1f44-46f5-a281-f4a4591c2aae', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 0, 'Porque várias pessoas vão perdendo a fé em Deus até que se perguntam algumas perguntas como, será que Deus existe? Será que foi isso mesmo que ele disse?', '2026-04-22 17:57:05.186939+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0fb13cab-3383-4cd0-b59c-1aba1e325f33', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 1, 'As vezes é difícil quando está tudo "dando errado" na nossa vida .', '2026-04-22 17:57:05.186939+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2841e771-c86e-44e7-9da7-2b5cb084c216', '2f773751-38c2-45a1-8ee0-f5b856092730', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 0, 'Porque deixamos de confiar em Deus ', '2026-04-22 18:47:09.622947+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e44b3673-dc4d-4dd7-a7eb-b420761ccfa1', '2f773751-38c2-45a1-8ee0-f5b856092730', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 1, 'Quando perdemos o controle sobre algo e nos problemas da vida. ', '2026-04-22 18:47:09.622947+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '49de60bf-c404-4751-b677-c38ae3837559', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '2e26fe88-3337-4504-a083-c448326f0210', 0, 'Porque o pecado afeta nossa identidade e faz a gente acreditar que nossos erros nos definem. Muitas vezes a culpa e a lembrança do passado falam mais alto, e esquecemos que, em Cristo, podemos ser restaurados e ter uma nova identidade.', '2026-04-22 18:55:20.432737+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7e37f96b-e9c1-41cf-9239-f8b325cf2800', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '2e26fe88-3337-4504-a083-c448326f0210', 1, 'Significa que, como está em 2 Coríntios 5:17, eu me torno uma nova criatura. As coisas antigas ficam para trás e começo uma nova vida em Cristo. Não sou mais definido pelos meus pecados, mas pelo que Deus diz sobre mim: perdoado, reconciliado e filho de Deus.', '2026-04-22 18:55:20.432737+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd473f318-d52a-4eb1-b930-8510efb50c3d', '9289d1ce-a632-4cd7-930e-73023e549ec5', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 0, 'Pois ela pode fazer você parar de confiar em Deus,assim sua fé se desfazendo', '2026-04-22 19:36:15.731558+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '98118647-dcfe-478e-bd2a-a767dc66a03c', '9289d1ce-a632-4cd7-930e-73023e549ec5', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 1, 'Quando alguma coisa ruim acontece na sua vida,como a morte de alguém especial,ou um acidente', '2026-04-22 19:36:15.731558+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '234d5ffd-fd5e-4ad7-a304-1f07e88529f2', '1526dc8b-a92a-4a44-b358-b6a3083d0143', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 0, 'Porque pede para Deus o que ele disse ', '2026-04-22 22:34:26.071113+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e83335b5-d99e-43ae-8f34-5eae25a75d5b', '1526dc8b-a92a-4a44-b358-b6a3083d0143', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 1, 'Nos momentos que estamos pecando o outro ', '2026-04-22 22:34:26.071113+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '396a1049-ba83-44dc-b3ed-05d9cb77eff4', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 0, 'Por que é mais fácil ser atraído pelo mal do que fazer o bem.', '2026-04-22 23:08:31.945129+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b4b4631c-f8b6-4c96-a2ef-081afdb82db4', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 1, 'Naqueles momentos que nada da certo e que você está muito enraivado.', '2026-04-22 23:08:31.945129+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '903f66d8-3dd2-45d6-bcf3-dcf4d3adf0be', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 0, 'Porque Jesus não desiste dos seus filhos ', '2026-04-22 23:17:19.993285+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1e66d813-53d8-4a5c-8fc8-ccd105cae0aa', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 1, 'Na raiva e na decepção ou quando fã algo errado ', '2026-04-22 23:17:19.993285+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f44c85ef-4b1a-42f3-9009-4fd32a457c60', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 0, 'Por que Deus é Deus Ele não iria mentir ', '2026-04-22 23:27:44.008205+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '877e1f67-ad25-435d-9a72-22099b6d5e8a', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 1, 'Quando agente pede alguma coisa e não ganha ', '2026-04-22 23:27:44.008205+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ae479f8e-129f-413b-97a6-9798b0c6e3e9', '7640c7e4-6780-4c27-8a04-ae5ab375f580', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 0, 'Por que posso ter mais de uma opinião ', '2026-04-23 00:32:17.331431+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ef86ac86-35aa-4714-85b2-4eae892398f8', '7640c7e4-6780-4c27-8a04-ae5ab375f580', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 1, 'Quando algo errado ', '2026-04-23 00:32:17.331431+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a2cb8410-c067-4312-b765-28e7ce5013fd', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 0, 'Porque nos fazem refletir', '2026-04-23 00:52:44.402358+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4a9ade17-c5ba-4301-b51b-2fc130f6e2a6', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 1, 'Nos momentos difíceis ', '2026-04-23 00:52:44.402358+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1867e610-10a3-427d-ba3c-6eaf4ece1267', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 0, 'Porque ela pode abalar nossa fé ', '2026-04-23 01:33:44.740813+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '650a9b5a-ef3c-45d8-ad31-d974efc74861', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 1, 'Nenhum ele é bom o tempo todo ', '2026-04-23 01:33:44.740813+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '15f6a651-cfe4-40ef-b016-d0899bc89649', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 0, 'Pois não temos certeza ', '2026-04-23 02:13:43.197756+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6c460f7f-4223-4ad2-bf85-0b64dc5dde53', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 1, 'Momentos muito tristes ', '2026-04-23 02:13:43.197756+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ddd58fab-52b7-4910-a115-03da8db22b63', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 0, 'Quando elas fazem alguma coisa para ganhar outra ', '2026-04-23 10:25:22.702636+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '40fcd867-a87b-41eb-9893-d86c6aae8985', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 1, 'Quando Deus de o seu filho único para morrer pelos nossos pecados ', '2026-04-23 10:25:22.702636+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '00528931-e323-4228-8263-7df8c8eaa9fe', '4d062445-4744-4007-a2ac-d7c4743fc979', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 0, 'Nas ruas e nós acidentes', '2026-04-23 10:33:07.011003+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e340e8ae-16de-4bac-a5b6-6cdf383ba785', '4d062445-4744-4007-a2ac-d7c4743fc979', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 1, 'Com a luz', '2026-04-23 10:33:07.011003+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '13f88703-33c5-400d-aba6-f6c145dcf81e', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 0, 'O que beneficia ela ', '2026-04-23 13:49:09.900077+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1e1ad7d9-c31c-407d-9edb-8d568e97a5c9', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 1, 'Tendo compaixão ao próximo ', '2026-04-23 13:49:09.900077+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '09e8f504-1b47-4d60-a3bd-74db0f45d312', '1526dc8b-a92a-4a44-b358-b6a3083d0143', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 0, 'Nas situações que elas estão mal com os outros ', '2026-04-23 14:36:02.631361+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ef4475d2-75c2-4934-97ba-ef8e890ca4df', '1526dc8b-a92a-4a44-b358-b6a3083d0143', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 1, 'Ela viveu numa vida muito humilde e amorosa ele nos mostra amar o que nós termos ', '2026-04-23 14:36:02.631361+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b02ffe16-4359-4c9e-98ca-32cfca659e97', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 0, 'Nas de dinheiro ', '2026-04-23 15:04:09.487954+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '45defcd1-9b5e-4e0e-abd6-b6f63fa5f375', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 1, 'Pensando', '2026-04-23 15:04:09.487954+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f48ae6b6-0631-4815-b0ed-e5e4fe9a2285', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 0, 'Quando elas pensam em só se "ajudar".', '2026-04-23 15:18:47.917517+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6ab4795a-c23b-4b0e-b503-a58a8a2956ff', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 1, 'Por meio da bíblia e da sua salvação ', '2026-04-23 15:18:47.917517+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3fbb3d79-3d6a-4a7d-9462-e745f758209f', '32a9f112-1192-4b2a-918f-c2895a76ade3', '67371245-6041-4df2-987e-05ea6fd6a427', 0, 'Me sinto melhor', '2026-04-23 16:04:44.920155+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1dd69a59-a850-4fff-bc8d-42eccac83d07', '32a9f112-1192-4b2a-918f-c2895a76ade3', '67371245-6041-4df2-987e-05ea6fd6a427', 1, 'Nas redes sociais', '2026-04-23 16:04:44.920155+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fa4a9ed7-740b-42b5-9f52-31ce56f1ad91', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 0, 'No seu bem estar.', '2026-04-23 16:04:57.56264+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e00bd43f-392a-41ab-b771-d318925358e7', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 1, 'Vivendo uma vida de humildade e amor.', '2026-04-23 16:04:57.56264+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0f472230-8e1e-43f5-9965-17ee3ded03c0', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 0, 'Quando colocam seus interesses acima dos outros.', '2026-04-23 20:05:31.701296+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8b4eb3ec-2834-4001-80a2-76a432d3a66f', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 1, 'Jesus ensina a amar e pensar no próximo.', '2026-04-23 20:05:31.701296+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '00241087-f757-41bd-acc7-ca2e8b4a06d7', '9289d1ce-a632-4cd7-930e-73023e549ec5', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 0, 'Fazer bullying com o outro, não dividir algo,falar mal do outro pelas costas', '2026-04-23 20:57:54.731673+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6968e69e-a021-423c-a9e2-d191cd755fe4', '9289d1ce-a632-4cd7-930e-73023e549ec5', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 1, 'Jesus mostra que precisamos amar e pensar no bem do próximo', '2026-04-23 20:57:54.731673+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9e7f232f-0f04-4977-85c5-f6ea4c511fd9', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 0, 'Numa hora de perigo ', '2026-04-23 21:30:20.88477+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c0eda62a-a619-4e3b-9bfc-f13d5e75fffc', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 1, 'Pensando em ajudar o próximo ', '2026-04-23 21:30:20.88477+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3985a796-004a-471e-abad-97aae6c1eb54', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 0, 'Não sabemos distinguir oque é verdade ou mentira ', '2026-04-23 22:00:40.714405+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.devotional_responses (
  id, user_id, devotional_id, question_index, response, created_at, updated_at, church_id
)
VALUES
(
  '268eb521-8b3f-4d70-9e5d-35cd0fa5a2bb', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 1, 'Nos momentos mais difíceis da vida ', '2026-04-23 22:00:40.714405+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e67d3cdb-ba39-4b6d-8478-076938daff87', '7640c7e4-6780-4c27-8a04-ae5ab375f580', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 0, 'Quando tem uma decisão difícil a tomar ', '2026-04-23 22:13:11.764056+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6fb75945-3bce-41e9-9c25-d556d22c7ca7', '7640c7e4-6780-4c27-8a04-ae5ab375f580', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 1, 'Ele mostra o caminho certo , que nós devemos escolher ', '2026-04-23 22:13:11.764056+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6b7d35b3-f1a0-44d3-b0b5-973ab8d04873', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 0, 'Nos momentos e situações que elas podem ganhar uma competição ou até quando você vê uma pessoa sendo julgado e agredida e não fazer nada.', '2026-04-23 22:51:03.564789+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'dadd88da-9555-4a24-8511-0d210ddce285', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 1, 'Tirando nós de brigas, tentando entrar na mente para tirar coisas ruins e devagar nos ensinando com os erros.', '2026-04-23 22:51:03.564789+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4e1dbb36-ac9f-44cb-8ea9-f380cb173fd8', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 0, 'As vezes Quando precisam fazer alguma escolha', '2026-04-23 23:00:31.553117+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7857161c-cd31-46c8-8d16-8d820dae1940', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 1, 'Através da sua humildade e amor por cada um de nós ', '2026-04-23 23:00:31.553117+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '88b53a80-a4b6-474c-a1dc-25410e7a0db3', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 0, 'Quando são egoístas', '2026-04-23 23:05:37.488463+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '888882f0-c69a-4963-ac3b-be57c4506600', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 1, 'Com amor verdadeiro ', '2026-04-23 23:05:37.488463+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '98a9662d-c389-4c27-b1f5-df4e5d0e7e02', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 0, '
Geralmente quando estão pensando só nos próprios interesses, tipo querer levar vantagem, ganhar algo ou quando não se importam com os outros. Também pode acontecer quando estão com raiva, inveja ou muito focadas nelas mesmas.', '2026-04-24 00:08:52.493885+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3d24b5a7-bf89-4ccc-bdc6-a0fbd319b588', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 1, 'Jesus ensina a viver com amor e humildade, colocando Deus e as outras pessoas em primeiro lugar. Ele mostra que devemos ajudar, servir e pensar no próximo, não só em nós mesmos.', '2026-04-24 00:08:52.493885+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '92286d3d-c63a-4d0f-bbc4-6aad1a2cdf8b', 'a608622c-4120-4d15-949f-235ca64db2cf', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 0, 'Quando querem algo , ou querem fazer algo', '2026-04-24 00:10:19.288708+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd84ac2d7-0f2c-4e5d-a44d-fdec195c9723', 'a608622c-4120-4d15-949f-235ca64db2cf', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 1, 'Ele falou que devemos olhar para Deus e para as pessoas ao nosso redor', '2026-04-24 00:10:19.288708+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '87148e58-bb96-4f8d-af3b-e4c3dc9fba5c', '2f773751-38c2-45a1-8ee0-f5b856092730', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 0, 'Quando estão passando por problemas', '2026-04-24 00:16:11.684188+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '41c24cb0-2464-4ed0-bfb6-8eb3a92fbe8b', '2f773751-38c2-45a1-8ee0-f5b856092730', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 1, 'Devemos amar o próximo como a nós mesmos. ', '2026-04-24 00:16:11.684188+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'deffd726-3199-4bb3-99b1-c7357e8c50f6', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 0, 'Quando querem algo só pra elas', '2026-04-24 00:50:43.807019+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6616cf39-2cae-4306-9fdc-12405182f281', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 1, 'Pelo exemplo que ele deixou ', '2026-04-24 00:50:43.807019+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bb761ed6-ea00-4644-bcd1-b8e66692a5d8', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '40f39a0c-eb00-4646-8f8f-e79d0f2e782e', 0, 'Sim.Quando eu estava com amigdalite e fiquei melhor.', '2026-04-24 01:01:24.53949+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1dcb3965-815c-45a7-95d4-c6204c22953b', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '40f39a0c-eb00-4646-8f8f-e79d0f2e782e', 1, ' Nós não merecíamos mas como Deus nos ama muito ele mandou seu único filho para  nos salvar.', '2026-04-24 01:01:24.53949+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '40187fe0-a43a-4af6-bd63-6e80ba8e9fdc', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 0, 'Quando estão disputando ', '2026-04-24 01:39:27.420275+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fcc402c9-ab90-4e39-b8dd-65452dfa340e', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 1, 'Com seu amor e humildade', '2026-04-24 01:39:27.420275+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'af8ba110-5c36-41c3-b8fd-577a0d08ddd4', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 0, 'Momentos mais difíceis ', '2026-04-24 02:37:37.377856+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fd7c0fe4-20c3-47f2-b2bd-62e843f665f1', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 1, 'Ele nos chama a olhar para ele', '2026-04-24 02:37:37.377856+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '90e5ad21-cb45-4657-8cae-c8511793e232', '2dcc9a0e-accc-42df-8c78-5577fc2669db', 'af440fb5-5112-4e54-bbb3-82812e917370', 0, 'Para não ser rejeitado ou excluido', '2026-04-24 10:18:33.728174+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '270fc523-d805-46fb-99f3-c297f9e2dc41', '2dcc9a0e-accc-42df-8c78-5577fc2669db', 'af440fb5-5112-4e54-bbb3-82812e917370', 1, 'Sabendo que somos filhos de deus e somos únicos ', '2026-04-24 10:18:33.728174+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'da22539b-17f8-41bf-b2a2-9595d75b76c0', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'af440fb5-5112-4e54-bbb3-82812e917370', 0, 'Para outras pessoas só verem o que ela faz de bom ', '2026-04-24 10:27:37.757824+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bfffdaf0-ae8b-46fe-acea-553201b01a9b', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'af440fb5-5112-4e54-bbb3-82812e917370', 1, 'Ele ensina que não devemos esconder as nossas fraquezas pois todos temos algumas ', '2026-04-24 10:27:37.757824+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '762c2cb4-dad2-452c-9ef8-b32bd0d17998', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'af440fb5-5112-4e54-bbb3-82812e917370', 0, 'Por vergonha ', '2026-04-24 12:41:07.242015+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '15b80911-0011-4262-92a0-ef3c6e0c5409', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'af440fb5-5112-4e54-bbb3-82812e917370', 1, 'Nos dando esperança ', '2026-04-24 12:41:07.242015+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3fe0d919-305c-4c7e-9404-a09c86b60c6a', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 0, 'As guerras e brigas entre os seres humanos ', '2026-04-24 13:05:07.113825+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e4141d06-b8e1-4df3-950a-608f91118c39', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 1, 'Porque todos nós nós afastamos de Deus ', '2026-04-24 13:05:07.113825+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '61c7f960-4a6e-4efa-9081-16d707ab934e', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'af440fb5-5112-4e54-bbb3-82812e917370', 0, 'Porque existem pessoas que podem faze-las se sentir com vergonha e insegurança e então tentam esconder ', '2026-04-24 14:39:10.411424+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8d750ce7-20a9-4a8f-9fa9-904e70d24dae', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'af440fb5-5112-4e54-bbb3-82812e917370', 1, 'Faz com que nós possamos nos abrir com Deus pois ele não irá no criticar', '2026-04-24 14:39:10.411424+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f8f84bae-3a9f-48dd-97a0-62db0975d64e', '9289d1ce-a632-4cd7-930e-73023e549ec5', 'af440fb5-5112-4e54-bbb3-82812e917370', 0, 'Para não demonstrar fraqueza e insegurança,criando uma imagem de forte para os outros', '2026-04-24 14:59:56.580577+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e994af27-9039-414b-9a04-a3be407449b7', '9289d1ce-a632-4cd7-930e-73023e549ec5', 'af440fb5-5112-4e54-bbb3-82812e917370', 1, 'Com Deus não rejeitando nós por serem nós mesmos,que tudo bem ter insegurança e fraqueza,todos temos', '2026-04-24 14:59:56.580577+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c4fbaf98-aa47-4fb2-8622-b545eb2f2b1a', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'af440fb5-5112-4e54-bbb3-82812e917370', 0, 'Para nao mostrarem os seus pontos fracos ', '2026-04-24 15:22:57.031418+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fda9d81e-305e-491a-a7ce-897a489e3c2e', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'af440fb5-5112-4e54-bbb3-82812e917370', 1, 'Porque a gente começa a entender que certas coisas eram pro nosso bem', '2026-04-24 15:22:57.031418+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6d87822a-6b8b-467b-887e-9d84e7b49eaf', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'af440fb5-5112-4e54-bbb3-82812e917370', 0, 'Para ngm ver', '2026-04-24 15:39:07.958269+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b9bf8adb-b0c7-48f7-87e2-c1bb61331d1d', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'af440fb5-5112-4e54-bbb3-82812e917370', 1, 'Sim', '2026-04-24 15:39:07.958269+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '48503e1c-34da-4504-a6df-fb1a2e53ab82', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 0, 'Injustiça e egoísmo ', '2026-04-24 15:42:06.592921+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'dae3c95d-36a8-486e-b3cc-9fa8ea5d02cc', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '7d433010-74aa-4b63-bbca-c1db37c6ab21', 1, 'Por que vivem afastados de Deus', '2026-04-24 15:42:06.592921+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7b920d53-aa07-494b-9eec-edfd7f669f60', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '67371245-6041-4df2-987e-05ea6fd6a427', 0, 'Significa que que minha vida tem valor dignidade e propósito ', '2026-04-24 15:44:41.962131+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '865df918-b2c5-4f29-8e72-01e87a49c3fb', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '67371245-6041-4df2-987e-05ea6fd6a427', 1, 'Principalmente na popularidade e aparência ', '2026-04-24 15:44:41.962131+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '434f3bb9-5af5-44a7-bd77-10706c323f88', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 0, 'Por que quebra nossa confiança em Deus  e nos faz escolher a própria vontade ', '2026-04-24 15:53:17.667129+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '72a7116a-ba74-4bb2-bd94-9f72b27eb348', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 1, 'Na dor, na demora e quando não entendo o que Ele está fazendo ', '2026-04-24 15:53:17.667129+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9ab5a104-ca4b-4547-892d-cc988af4333b', '1526dc8b-a92a-4a44-b358-b6a3083d0143', 'af440fb5-5112-4e54-bbb3-82812e917370', 0, 'Por causa da vergonha do ser humano pelos os erros que já cometemos ', '2026-04-24 16:00:29.303257+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '40bb7b72-062d-4e98-85ba-fa370c99b72d', '1526dc8b-a92a-4a44-b358-b6a3083d0143', 'af440fb5-5112-4e54-bbb3-82812e917370', 1, 'Porque jesus vê algo muito poderoso ', '2026-04-24 16:00:29.303257+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b2dd849a-237a-4014-9d1c-dd6860b119da', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'af440fb5-5112-4e54-bbb3-82812e917370', 0, 'Para os outros não acharem que ela é fraca e sente vergonha dos erros por isso tenta escondê-los ', '2026-04-24 16:42:55.890421+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '024ec261-798d-4240-add3-b67cb0fe42f9', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'af440fb5-5112-4e54-bbb3-82812e917370', 1, 'Deus nos dá mais confiança  e não nos deixa sentir sozinho ', '2026-04-24 16:42:55.890421+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a3496efb-dbb0-44fd-9b91-8c27167c10be', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'af440fb5-5112-4e54-bbb3-82812e917370', 0, 'As pessoas escondem suas falhas porque sentem vergonha, medo de serem julgadas ou rejeitadas', '2026-04-24 18:20:33.717976+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3c410278-3287-4bce-8177-b88a8d363349', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'af440fb5-5112-4e54-bbb3-82812e917370', 1, 'O evangelho mostra que não precisamos nos esconder, porque Deus nos ama e oferece perdão', '2026-04-24 18:20:33.717976+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8e855e4d-b715-403a-ace8-a75559b2233d', '32a9f112-1192-4b2a-918f-c2895a76ade3', 'af440fb5-5112-4e54-bbb3-82812e917370', 0, 'Para não zoarem delas', '2026-04-24 20:34:59.410107+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b758e36e-9c47-4028-8863-515a6450cdc5', '32a9f112-1192-4b2a-918f-c2895a76ade3', 'af440fb5-5112-4e54-bbb3-82812e917370', 1, 'Muda pois sabemos que mesmo errando não seremos zoados', '2026-04-24 20:34:59.410107+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2eedb80b-c3af-4993-a78a-7d93f0bbb245', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'af440fb5-5112-4e54-bbb3-82812e917370', 0, 'Para não ficar com vergonha ', '2026-04-24 21:17:46.869704+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '02907de4-2d0e-4cd9-945c-6a78e9d2f44d', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'af440fb5-5112-4e54-bbb3-82812e917370', 1, 'Sim ', '2026-04-24 21:17:46.869704+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '03448ff5-d5ac-4289-90d5-437a54938e4a', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '9bbdbde3-6e68-4147-9731-738b3c553c48', 0, 'Processual', '2026-04-24 21:21:19.076554+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '81860b1d-98a5-48a4-a2cc-3a979c4ed3ed', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '9bbdbde3-6e68-4147-9731-738b3c553c48', 1, 'Novos pensamentos e bom mas eu não sei', '2026-04-24 21:21:19.076554+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a89a88e0-5c40-4af3-8384-6c1a9afe7829', '7640c7e4-6780-4c27-8a04-ae5ab375f580', 'af440fb5-5112-4e54-bbb3-82812e917370', 0, 'Para não serem julgadas ', '2026-04-24 22:30:22.122456+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd50355e5-24d0-4c9f-8fca-e545b3716010', '7640c7e4-6780-4c27-8a04-ae5ab375f580', 'af440fb5-5112-4e54-bbb3-82812e917370', 1, 'Que Deus nos perdoa mesmo errando ', '2026-04-24 22:30:22.122456+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6c81ea30-92f7-4ff8-9f1b-7a6e85026acf', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'af440fb5-5112-4e54-bbb3-82812e917370', 0, 'Por medo', '2026-04-24 23:23:37.111999+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '27e2e241-3210-4b3e-8cf4-c8bf920df051', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'af440fb5-5112-4e54-bbb3-82812e917370', 1, 'Com confiança em perdão de Jesus ', '2026-04-24 23:23:37.111999+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f84dc81b-8907-4773-96cf-aa4999fa1890', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', 'af440fb5-5112-4e54-bbb3-82812e917370', 0, 'As pessoas tentam esconder suas falhas porque sentem vergonha e insegurança, assim como Adão e Eva depois da queda. Antes eles viviam em liberdade, mas depois surgiu o medo, e isso faz a gente querer se esconder e não mostrar nossos erros.', '2026-04-25 00:31:20.016303+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ecd9e1e3-3f5d-4726-a227-725dadc28054', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', 'af440fb5-5112-4e54-bbb3-82812e917370', 1, 'O evangelho muda isso porque mostra que Deus não nos abandona. Em Jesus, Ele oferece perdão e nova vida, então não precisamos nos esconder, mas podemos confiar que Ele nos aceita e nos ajuda a melhorar.', '2026-04-25 00:31:20.016303+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b9a814d6-7dec-40b1-bd28-53acbaeb8d3f', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '9bbdbde3-6e68-4147-9731-738b3c553c48', 0, 'É processual.', '2026-04-25 00:39:02.055095+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e23d1c07-61ec-4253-a8f6-33bb628d4dcb', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '9bbdbde3-6e68-4147-9731-738b3c553c48', 1, 'Pensamentos positivos. ', '2026-04-25 00:39:02.055095+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '07db05ed-14c6-4c2e-9224-1730d9114220', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'af440fb5-5112-4e54-bbb3-82812e917370', 0, 'Para não serem criticadas', '2026-04-25 00:48:39.112561+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '26b06e40-501e-4dd7-81e7-8a0f7530c462', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'af440fb5-5112-4e54-bbb3-82812e917370', 1, 'Ele nos ajuda a ter confiança não ter vergonha ser mais confiante e se sentir confortável ', '2026-04-25 00:48:39.112561+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '721e856a-2fa9-4854-8cd7-6b890e584f66', '4d062445-4744-4007-a2ac-d7c4743fc979', 'af440fb5-5112-4e54-bbb3-82812e917370', 0, 'Nós talentos', '2026-04-25 00:48:55.514889+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6a7e6760-1c9a-4c5d-895c-e20ccc3d3b71', '4d062445-4744-4007-a2ac-d7c4743fc979', 'af440fb5-5112-4e54-bbb3-82812e917370', 1, 'Enfrentando
', '2026-04-25 00:48:55.514889+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2cff80c1-5d2d-40d4-9e0c-ee5d46f4edc3', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'af440fb5-5112-4e54-bbb3-82812e917370', 0, 'Por que elas sentem vergonha por sua falha, e não querem confessar o seu erro ou falha, e por isso elas escondem para não afetar sua reputação.', '2026-04-25 00:49:29.91335+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'dee177cf-45e8-4bf4-8564-527d8c012c67', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'af440fb5-5112-4e54-bbb3-82812e917370', 1, 'Podemos ter como certeza que Deus não nos abandona, não nos rejeita mas sempre oferece perdão a nossa vida.', '2026-04-25 00:49:29.91335+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '878b9eb5-8ae1-48c4-a97c-fdba0b254e79', 'a608622c-4120-4d15-949f-235ca64db2cf', 'af440fb5-5112-4e54-bbb3-82812e917370', 0, 'Pq elas querem parecer perfeitas', '2026-04-25 01:21:53.382298+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cc81363d-67de-4caf-882a-7deb8e9790d1', 'a608622c-4120-4d15-949f-235ca64db2cf', 'af440fb5-5112-4e54-bbb3-82812e917370', 1, 'Ela fala que n nos rejeita , mas nos oferece perdão e nova vida', '2026-04-25 01:21:53.382298+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ada72fbf-3147-43e9-a621-96ab1ad3f40c', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'af440fb5-5112-4e54-bbb3-82812e917370', 0, 'Pois sentem vergonha ', '2026-04-25 02:49:31.174525+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '28b303f7-0714-445a-9b13-71a7734e0841', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'af440fb5-5112-4e54-bbb3-82812e917370', 1, 'Fala que Deus é a nossa força e fortaleza ', '2026-04-25 02:49:31.174525+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '93e62a0d-6523-40df-a0e3-a3a03756c7d9', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'af440fb5-5112-4e54-bbb3-82812e917370', 0, 'Por causa da vergonha ', '2026-04-25 10:32:06.634455+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ded68d27-0dbd-479c-ade0-f26d6e9586cd', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'af440fb5-5112-4e54-bbb3-82812e917370', 1, 'Que através da palavra percebemos que Deus não nos abandona ', '2026-04-25 10:32:06.634455+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0409b363-ce4b-4261-a1b9-3877766b8c45', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '943d23da-0098-4055-ab69-014161625c65', 0, 'É crer no invisível.', '2026-04-25 10:36:31.446358+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b156aafe-7d1d-458f-bce4-c90c0b1b284f', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '943d23da-0098-4055-ab69-014161625c65', 1, 'Confiando em Deus.', '2026-04-25 10:36:31.446358+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '71a72287-88d1-4e6a-9d27-6cb5cb32d7cd', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', 'c7374bb4-0943-41a6-8f8c-1ccc4a8364d6', 0, 'Liberdade é sermos livres e licença é uma permissão.', '2026-04-25 10:44:12.594409+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '79f0fa3c-a485-4d61-8585-59e0d37695e3', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', 'c7374bb4-0943-41a6-8f8c-1ccc4a8364d6', 1, 'Que podemos fazer o quisermos mas tudo tem uma consequência.', '2026-04-25 10:44:12.594409+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '202fef83-799e-4e84-9003-cf4eff00039e', '32a9f112-1192-4b2a-918f-c2895a76ade3', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 0, 'Pois dependendo da dúvida, deixa a pessoa ansiosa', '2026-04-25 10:46:36.602039+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '96a7e8bf-a870-4f06-afa1-0e1ba4e7f731', '32a9f112-1192-4b2a-918f-c2895a76ade3', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 1, 'Quando alguém está sofrendo', '2026-04-25 10:46:36.602039+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f3e5188c-7cdd-4418-9e6a-bffb9431eeb7', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', 'f87d420e-f8aa-4665-837a-39a31a9c7ec7', 0, 'Me sinto mais alegre sabendo que Deus está comigo.', '2026-04-25 10:46:49.030761+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '39800b9e-5949-4f7a-9c3c-ee08c1e3b22a', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', 'f87d420e-f8aa-4665-837a-39a31a9c7ec7', 1, 'Brigas com a minha irmã.', '2026-04-25 10:46:49.030761+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f046c860-85fd-4762-96ef-ccbc0162105d', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', '67371245-6041-4df2-987e-05ea6fd6a427', 0, 'Ok', '2026-04-25 15:18:05.967267+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1c9c4646-339a-4f6d-9238-a74cbfd41e50', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', '67371245-6041-4df2-987e-05ea6fd6a427', 1, 'Ok', '2026-04-25 15:18:05.967267+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fde307c1-36af-4655-9bbf-545d8b8fcd08', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 0, 'Ok', '2026-04-25 15:18:16.220569+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ea22bba5-7554-437b-8bfb-2fda668aa15a', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 1, 'Ok', '2026-04-25 15:18:16.220569+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1972ec31-6584-4a8e-a979-be17320dfdd0', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 0, 'Ok', '2026-04-25 15:18:26.728291+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2af62d81-a163-403f-bcd6-9d87b7e2527d', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 1, 'Ok', '2026-04-25 15:18:26.728291+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2dad0835-7f87-44df-a58c-7674522a008f', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', 'af440fb5-5112-4e54-bbb3-82812e917370', 0, 'Ok', '2026-04-25 15:18:34.100398+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f1aa93ba-b036-4592-a88d-4a3c29b1f70f', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', 'af440fb5-5112-4e54-bbb3-82812e917370', 1, 'Ok', '2026-04-25 15:18:34.100398+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '45183408-e98e-41fb-bdc0-3a8f52a5ecb7', '66b31cf2-7782-4253-98ea-3b6d631703a4', '40f39a0c-eb00-4646-8f8f-e79d0f2e782e', 0, 'Sim 
Quando fiquei doente ', '2026-04-26 00:05:08.707524+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bee4e92b-a6d1-42e1-9ed6-076d8a67fd96', '66b31cf2-7782-4253-98ea-3b6d631703a4', '40f39a0c-eb00-4646-8f8f-e79d0f2e782e', 1, 'Não merecíamos mas recebemos mesmo assim', '2026-04-26 00:05:08.707524+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '22b140c9-7d29-4bf5-aef9-7af31d0bd297', '66b31cf2-7782-4253-98ea-3b6d631703a4', '943d23da-0098-4055-ab69-014161625c65', 0, 'A fé é invisível ', '2026-04-26 00:08:58.323231+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c07582bf-90ee-45b1-9a39-d6acb18c12b5', '66b31cf2-7782-4253-98ea-3b6d631703a4', '943d23da-0098-4055-ab69-014161625c65', 1, 'Lendo a Bíblia ', '2026-04-26 00:08:58.323231+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0ad75033-5b6e-4af0-adb2-91a62a888d4b', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 0, 'Quando tem dinheiro tem saúde tem trabalho pensa só em si', '2026-04-26 12:14:16.150099+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '95fa7f1c-1467-4911-aa08-568707712664', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 1, 'Ele nos ensina a amar os outros e sempre ajudar o próximo ', '2026-04-26 12:14:16.150099+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '253fd374-4542-4fa0-b117-354d18039297', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '67371245-6041-4df2-987e-05ea6fd6a427', 0, 'Significa que minha vida tem valor e propósito, porque fui criado por Deus para viver em relacionamento com Ele.', '2026-04-26 12:55:57.178543+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.devotional_responses (
  id, user_id, devotional_id, question_index, response, created_at, updated_at, church_id
)
VALUES
(
  'a9b536b4-6dbb-47a0-9650-a4b0a34288e4', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '67371245-6041-4df2-987e-05ea6fd6a427', 1, 'As pessoas buscam identidade na aparência, popularidade e aprovação dos outros, mas isso não substitui Deus.', '2026-04-26 12:55:57.178543+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4e945443-76d1-4ec0-bfb0-455c1ab914f1', '32a9f112-1192-4b2a-918f-c2895a76ade3', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 0, 'Quando as outras precisam de ajuda', '2026-04-26 15:21:11.638818+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '53a2c0b5-5d00-49c9-832b-06444a656e57', '32a9f112-1192-4b2a-918f-c2895a76ade3', 'cb0b8527-8e0f-4b22-871d-c5f7ea656401', 1, 'Pois ele era gentil', '2026-04-26 15:21:11.638818+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9d2cd1f2-df10-4b10-91c9-369e0c987ed9', 'a608622c-4120-4d15-949f-235ca64db2cf', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 0, 'Por vc n saber sobre', '2026-04-26 20:31:46.085535+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'eaa9d2eb-21a8-4df6-a037-11001d0b2671', 'a608622c-4120-4d15-949f-235ca64db2cf', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 1, '.', '2026-04-26 20:31:46.085535+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cbc0364b-c918-48ba-9adc-57dfaa171d12', '66b31cf2-7782-4253-98ea-3b6d631703a4', 'f87d420e-f8aa-4665-837a-39a31a9c7ec7', 0, 'A minha confiança ', '2026-04-26 21:43:57.41011+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3420b0a9-daf4-4e5d-a011-807fbebf9627', '66b31cf2-7782-4253-98ea-3b6d631703a4', 'f87d420e-f8aa-4665-837a-39a31a9c7ec7', 1, 'Brigar com os pais', '2026-04-26 21:43:57.41011+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3b30c51f-4c42-4554-8cbf-e40b2013a4c4', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 0, 'Porque faz a gente questionar a palavra de Deus e enfraquece nossa confiança nEle.', '2026-04-26 21:48:14.635416+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7bf57fb9-9b0f-4702-8c1f-80d3ea577f99', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', 'acd52f9f-c877-46b5-a897-1a1c1638781a', 1, 'Quando temos dúvidas, inseguranças ou queremos fazer nossa própria vontade em vez da de Deus.', '2026-04-26 21:48:14.635416+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c1f81537-fe25-4f07-b4b0-9ba358d5356f', '66b31cf2-7782-4253-98ea-3b6d631703a4', 'c7374bb4-0943-41a6-8f8c-1ccc4a8364d6', 0, 'Liberdade é responsabilidade e licença é o abuso da liberdade ', '2026-04-26 22:10:15.385208+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '847d01ea-e32b-43fd-affb-c6cba52c185b', '66b31cf2-7782-4253-98ea-3b6d631703a4', 'c7374bb4-0943-41a6-8f8c-1ccc4a8364d6', 1, 'Tendo limites ', '2026-04-26 22:10:15.385208+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7159d835-57b9-4094-889b-c60ba46855ea', '66b31cf2-7782-4253-98ea-3b6d631703a4', '9bbdbde3-6e68-4147-9731-738b3c553c48', 0, 'Processual ', '2026-04-26 22:11:54.010805+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1fb47d99-970d-4f41-a74d-35d488bcf534', '66b31cf2-7782-4253-98ea-3b6d631703a4', '9bbdbde3-6e68-4147-9731-738b3c553c48', 1, 'N sou inteligente ', '2026-04-26 22:11:54.010805+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '14477014-6b4a-40d7-b73f-c80f40dc094c', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 0, 'Por medo da verdade', '2026-04-27 13:14:26.028118+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e5db2e67-608b-4c15-a8dc-8739f811e56a', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 1, 'Nos colocando aprovações ', '2026-04-27 13:14:26.028118+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a36b3a04-ec71-402f-8301-d7d90c203c04', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 0, 'Por serem burras', '2026-04-27 16:06:10.749666+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f58a6477-fe28-4717-b6ec-cac16576ab50', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 1, 'Nós pensando nos sinais', '2026-04-27 16:06:10.749666+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1a26cd18-f062-4959-a71e-527c78e5919d', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 0, 'Porque é mais fácil de fazer as coisas erradas do que as certas', '2026-04-27 16:26:43.589282+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '926cbb15-9661-412c-b354-fbd8bf917cca', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 1, 'Como ele nos ensinou ', '2026-04-27 16:26:43.589282+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ea9f869d-28c6-46d3-9e92-d7d0f93d639e', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 0, 'As pessoas se afastam de Deus por medo, vergonha ou culpa.', '2026-04-27 17:21:25.577423+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0eb10d37-46b8-497a-9108-f212e88dbf3b', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 1, 'Jesus mostra que Deus quer nos restaurar ao oferecer perdão e amor.', '2026-04-27 17:21:25.577423+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7a07fac8-a29b-4722-9642-e16033d91d83', '32a9f112-1192-4b2a-918f-c2895a76ade3', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 0, 'Pois isso piora e dificulta a vida delas', '2026-04-27 18:56:07.663282+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '13777a82-138f-40e3-a2b2-5f91e8170b64', '32a9f112-1192-4b2a-918f-c2895a76ade3', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 1, 'Mostra pois ele nos salva', '2026-04-27 18:56:07.663282+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bba57694-7070-4a42-b42a-a3b4a555c76d', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 0, 'Por pensarem que não vale a pena ou medo dele', '2026-04-27 21:35:28.466789+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cdb07d5e-0e13-4177-a540-b7b379771ef4', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 1, 'Quando mandou ele morrer para nós salvar', '2026-04-27 21:35:28.466789+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4ffe50d7-70ce-4788-9119-b42319abe65d', '9289d1ce-a632-4cd7-930e-73023e549ec5', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 0, 'Com medo de se pecar,ter traído Deus', '2026-04-27 21:38:45.593684+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3ef01c71-fa7e-4f12-9c8b-a8d0615ba581', '9289d1ce-a632-4cd7-930e-73023e549ec5', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 1, 'Ele mostra que Deus confia em nós,e tudo bem pecar, é humano', '2026-04-27 21:38:45.593684+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3bef2e68-96a5-4982-b7a4-62350f973100', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 0, 'Algumas pessoas se afastam pois ficam dúvidas sobre Ele, se Ele existe mesmo e se é mesmo verdade as coisas que nos contam ', '2026-04-27 22:03:31.587842+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c0f82200-8661-4272-900e-9ad378decb81', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 1, 'Nos levando para um caminho de modo que a nossa vida começa ficar mais leve e mais divertida ao lado dele', '2026-04-27 22:03:31.587842+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bdcf96c6-8e72-4bfe-9da4-83afb6b595ae', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 0, 'Ele vence a morte e abre um novo caminho para a humanidade ', '2026-04-29 23:46:13.999958+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '618f3473-7394-4dd1-b815-43d1d0ec5128', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 0, 'Porque, quando erram, sentem medo ou vergonha. Assim como Adão e Eva se esconderam, muitas pessoas se afastam achando que Deus não vai aceitá-las por causa do pecado.', '2026-04-27 22:20:52.160615+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c31a10fa-7edd-4756-b7d0-9887d214283b', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 1, 'Jesus Cristo mostra que Deus vem ao nosso encontro mesmo quando falhamos. Em vez de se afastar, Deus se aproxima para restaurar o relacionamento com a gente.', '2026-04-27 22:20:52.160615+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4d6f97a0-f402-4fae-aa5e-8a80c61b8b6d', '914b898d-24a3-46ad-a764-d2f24e5115d1', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 0, 'Por medo e vergonha do seu pecados ', '2026-04-27 22:48:47.082475+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c8f20e41-e75a-4149-bf27-57b865127058', '914b898d-24a3-46ad-a764-d2f24e5115d1', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 1, 'Restaurando a paz e a confiança ', '2026-04-27 22:48:47.082475+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '11427922-e47a-4a03-83be-817dcf57a022', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 0, 'Por que elas não vêem oq Deus faz para nós e o que ele pode nos dar, e não sabem o motivo dele ter morrido por nós na cruz, e então não acreditam nele.', '2026-04-27 22:51:20.461933+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6b70f0e8-3c61-454d-8835-2e662d4bd0a6', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 1, 'Por ele ter entregado seu único filho para que ele possa morrer no lugar de todos na Terra, e então nos salvar e livrar dos pecados.', '2026-04-27 22:51:20.461933+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5c452716-3c68-4336-962f-13b940f7d97b', 'a608622c-4120-4d15-949f-235ca64db2cf', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 0, 'Talvez por que seja difícil seguir a ele', '2026-04-27 23:00:39.005026+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '75887206-8ee3-41bc-b065-14c6316e13cd', 'a608622c-4120-4d15-949f-235ca64db2cf', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 1, 'Que ele vem para restaurar um relacionamento quebredo', '2026-04-27 23:00:39.005026+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cb9638f4-13dc-40fd-bba4-264007e94841', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 0, 'Vergonha ', '2026-04-27 23:01:45.515664+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cf129c09-f499-4c30-978d-9059fc5aa4ef', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 1, 'Perdoando ', '2026-04-27 23:01:45.515664+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '390ae20f-1cb0-4bed-809c-c4f9a44d8940', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 0, 'Por causa do pecado ', '2026-04-27 23:02:34.705013+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e5268feb-f327-4ad9-84ed-2f608cc1602d', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 1, 'O relacionamento que está quebrado ', '2026-04-27 23:02:34.705013+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7382d72a-b60c-4ea4-9aff-f77e785ac3c2', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 0, 'Para serem aceitas em alguns lugares ', '2026-04-27 23:23:30.401233+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f5b2de8a-830d-4b4e-a06d-2f3849f6abb5', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 1, 'Ele quer restaurar nossos relacionamentos quebrados ', '2026-04-27 23:23:30.401233+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ede1a270-99c6-4dd4-8aae-ec0a724ef754', '985bc110-c90a-4762-8b1b-7b081e0c6863', '147906d7-9ead-4ea4-852d-3c2d8eaf5bc8', 0, 'Mesmo sabendo que não preciso sentir isso, algumas vezes tenho um pouco deste medo.', '2026-04-27 23:26:06.13858+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '99b7a8bb-9f4a-4f83-965e-900397c11214', '985bc110-c90a-4762-8b1b-7b081e0c6863', '147906d7-9ead-4ea4-852d-3c2d8eaf5bc8', 1, 'Sim. Confio.', '2026-04-27 23:26:06.13858+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bc736532-329d-4038-8050-bc6c0e2d0065', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'bff6d4cc-07ed-4161-bc65-1fcc36ed3a29', 0, 'Sim. Creio nisso firmemente.', '2026-04-27 23:27:46.561424+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '98314364-5a94-45e4-bcb7-1370893f0521', '985bc110-c90a-4762-8b1b-7b081e0c6863', 'bff6d4cc-07ed-4161-bc65-1fcc36ed3a29', 1, 'Lembrar disso em todas as minhas ações. Aprender a não temer e sempre manter minha longanimidade.', '2026-04-27 23:27:46.561424+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1b65b4c4-027d-409e-87bb-2d0aaf689a8c', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 0, 'Tem vergonha e muitos não tentam se afastar mas pela rotina não tiram tempo para Deus e acabam se afastado ', '2026-04-27 23:32:43.037921+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fea4f04e-cb33-47a2-a227-0aefe2118024', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 1, 'Pela palavra dele', '2026-04-27 23:32:43.037921+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7a29d230-d8a6-4a50-b93c-c117ebb8067a', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '663eb047-ecdf-46a7-a9a7-56bde90286b5', 0, 'É dependência diária da graça.', '2026-04-28 00:21:04.467895+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2c2028e0-0660-447d-949c-0c192b40f4e9', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '663eb047-ecdf-46a7-a9a7-56bde90286b5', 1, 'Se andar pelo Espírito não precisará 
 cumprir os desejos da carne.', '2026-04-28 00:21:04.467895+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'df92297a-ed1e-4fb6-a852-ebcb4e177147', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 0, 'Por medo, culpa ou por querer fazer do próprio jeito.', '2026-04-28 01:05:39.747008+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f37b4324-e1b3-4e0d-a0a9-01848da3f5c4', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 1, 'Vindo até nos e nos buscando primeiro. ', '2026-04-28 01:05:39.747008+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0d5389b0-b702-49a2-a18e-10ca1cf54060', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 0, 'Por medo ou vergonha ', '2026-04-28 01:15:17.844429+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a63bc55f-a1b8-4579-afde-8748b441c0ed', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 1, 'Pois Jesus perdoa quase todos os pecados ', '2026-04-28 01:15:17.844429+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b807eda6-639d-462c-950b-13163747a48d', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 0, 'Para ele não descobrir o pecado ', '2026-04-28 01:18:33.487468+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3fb59b66-bcb8-4f10-be89-9b2eb52cfafa', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 1, 'Que ele entregou seu próprio filho para nos salvar ', '2026-04-28 01:18:33.487468+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '431d211b-0cef-4823-a0e9-4d9a585729b7', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 0, 'Quando elas erram,sentem medo ou vergonha diante de Deus', '2026-04-28 02:05:17.186486+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f1267dab-dd63-49ec-a8ca-83c61c179c8a', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 1, 'Jesus aponta que, Deus vem até nós para restaurar o relacionamento quebrado', '2026-04-28 02:05:17.186486+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '13f509ab-d2c0-4ecb-9a28-cf0ea9ae015d', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 0, 'Para os outros não repararem no que não são boas ', '2026-04-28 10:30:58.931748+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'febc8ac7-90e9-4bb6-bd96-5b777695f165', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 1, 'Que sem a graça de Deus seria impossível ir para o céu ', '2026-04-28 10:30:58.931748+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1e3efd51-8855-4ae8-8596-f675884a6cdb', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 0, 'Por medo de sermos julgados. ', '2026-04-28 11:41:19.012773+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '48396236-0678-44ac-ad72-516c6c4081b1', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 1, 'Que Deus nos ama e trata de igual forma. ', '2026-04-28 11:41:19.012773+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd8a6a10d-0f06-4830-884e-103766dae842', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 0, 'Por medo de rejeição e para esconder falhas', '2026-04-28 12:43:35.274569+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'aa0f19a8-84c3-437c-8a36-01a375b5644f', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 1, 'Para o orgulho e nasce humanidade+aliviada', '2026-04-28 12:43:35.274569+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '751c7881-2fa0-47d1-94e1-dccac34b578b', '4d062445-4744-4007-a2ac-d7c4743fc979', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 0, 'Para empresonar ', '2026-04-28 13:17:07.077203+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4a26ef7a-b512-45d1-8fb1-a8361d466c96', '4d062445-4744-4007-a2ac-d7c4743fc979', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 1, 'Para se a prpsimar mais dele
', '2026-04-28 13:17:07.077203+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1473c257-16b7-4b58-ace1-e0dba7b1e2d6', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 0, 'Pra não serem julgadas', '2026-04-28 13:37:23.951784+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ca88cb51-e771-475f-8e63-73a4f2edec49', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 1, 'Se sentimos com mais liberdade ', '2026-04-28 13:37:23.951784+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '50af5d89-1728-46be-a2ad-4099da560ecd', '66b31cf2-7782-4253-98ea-3b6d631703a4', 'b4d6c36b-f4ec-496e-9899-c5b55d031f91', 0, 'Paciência ', '2026-04-28 15:05:56.987692+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2c5ec9a3-0eca-487e-a78e-afc111de7a1c', '66b31cf2-7782-4253-98ea-3b6d631703a4', 'b4d6c36b-f4ec-496e-9899-c5b55d031f91', 1, 'Tendo responsabilidade ', '2026-04-28 15:05:56.987692+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c295eb2c-23e9-4be7-adc2-074410fce693', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 0, 'Para não mostrarem defeitos', '2026-04-28 15:15:18.495061+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3cb055eb-aeb9-4381-8bdd-41079aa1b3aa', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 1, 'Que não preciso ser perfeita para estar na graça ', '2026-04-28 15:15:18.495061+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '05e376ff-bd0b-4781-b93a-3bf14f4d0e75', '32a9f112-1192-4b2a-918f-c2895a76ade3', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 0, 'Para impressionar os outros', '2026-04-28 15:38:28.910095+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e99eb911-6121-43ad-a2be-6299214769a2', '32a9f112-1192-4b2a-918f-c2895a76ade3', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 1, 'Muda a nossa atitude', '2026-04-28 15:38:28.910095+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c1c5a1ab-8046-4eb4-a0a3-0f41fcaae34a', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 0, 'Para serem aceitadas pelos os outros ', '2026-04-28 20:51:51.726467+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '981b6a29-6137-4159-a8f1-185fba4bf446', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 1, 'Faz com que nós cada vez mais aprendemos mais sobre Deus', '2026-04-28 20:51:51.726467+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'eacece6c-0328-4439-b2c6-89cc31dc72d4', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 1, 'Teste', '2026-05-16 14:23:22.648261+00', '2026-05-16 14:23:22.648261+00', NULL
),
(
  'b220b461-dc69-4246-aa68-5cf73307e91a', '9289d1ce-a632-4cd7-930e-73023e549ec5', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 0, 'Pelo orgulho,tentando parecer alguém que não são,para tentar impressionar ou agradar os outros', '2026-04-28 20:54:04.278584+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '52a70570-05c3-4344-913a-42aefbc3fc9d', '9289d1ce-a632-4cd7-930e-73023e549ec5', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 1, 'Que tudo mundo é igual, ninguém é perfeito,todos nós pecamos,e tudo bem', '2026-04-28 20:54:04.278584+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c57160bf-70be-4cf1-985c-ec0f7bdf2713', '1526dc8b-a92a-4a44-b358-b6a3083d0143', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 0, 'Para ser melhores que as outras ', '2026-04-28 22:15:34.719386+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '67f21bdf-1fc1-4bd9-902c-822aae34bd22', '1526dc8b-a92a-4a44-b358-b6a3083d0143', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 1, 'A convivência o respeito a igualdade ', '2026-04-28 22:15:34.719386+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2850c14a-a718-4f41-a376-9cc0376e3e1b', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 0, 'Para agradar a todas as pessoas ', '2026-04-28 22:24:38.489477+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '296ff07a-d205-4344-9023-676f7315069b', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 1, 'Nos nos  tornamos pessoas melhores ', '2026-04-28 22:24:38.489477+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6766ca64-3ebf-419d-a306-7b117d1cd686', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 0, 'Para os humanos não soarem ', '2026-04-28 22:32:12.790053+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bd7cb7fb-94b9-411e-a704-f824135ddc40', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 1, 'Tudo Samos mais paciente tem mais respeito ', '2026-04-28 22:32:12.790053+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7564b562-de52-41d7-8f3b-d2a12064c5ef', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 0, 'Por que elas querem que todos acham ela perfeita, por exemplo ela sentir inveja e querer ser melhor que aquela pessoa.', '2026-04-28 23:14:41.494925+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '49dc307c-7159-49b0-a875-8ba69ff45cdd', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 1, 'Por que Deus pode fazer muitos milagres na nossa vida, e então botar agente no caminho certo.', '2026-04-28 23:14:41.494925+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c62a746b-f9a8-4dc1-bab1-31d97daf2fa9', 'a608622c-4120-4d15-949f-235ca64db2cf', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 0, 'Para n serem julgadas', '2026-04-28 23:51:14.645138+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd2a1fe71-216c-4f27-bef6-2c8842ce99ed', 'a608622c-4120-4d15-949f-235ca64db2cf', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 1, 'Muda a forma de enxergar a vida', '2026-04-28 23:51:14.645138+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'faba45e1-c3f1-4d1c-9fee-a93927f26a6c', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 0, 'Por orgulho ou medo ', '2026-04-28 23:58:36.75793+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '088b07ea-968e-4716-ad18-29620db10b2e', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 1, 'Respeita mais os outros
', '2026-04-28 23:58:36.75793+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9d7f2530-8b2c-4acb-83e3-d2e01483ddba', '7640c7e4-6780-4c27-8a04-ae5ab375f580', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 0, 'Para serem aceitas ', '2026-04-29 00:06:22.616428+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9d75ab81-4c62-454c-9d4c-2b5be72c1a0a', '7640c7e4-6780-4c27-8a04-ae5ab375f580', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 1, 'Que não precisamos ser perfeitos e sim gratos por ter Deus ', '2026-04-29 00:06:22.616428+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5292ffa8-692f-423c-aa90-0461e4faa94a', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 0, 'Porque querem parecer melhores ou perfeitas diante dos outros e de Deus, escondendo seus erros.', '2026-04-29 00:33:37.283934+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '211291e5-1161-4fb9-8ce3-323be7c64b67', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 1, 'A gente entende que ninguém é perfeito, então não precisa fingir, e passamos a confiar mais na graça de Deus, com humildade.', '2026-04-29 00:33:37.283934+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ce514a24-e2a4-4e39-bf2b-a7fd065873c1', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', 'b4d6c36b-f4ec-496e-9899-c5b55d031f91', 0, 'Paciência.', '2026-04-29 00:47:15.520101+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '723b65c6-6cde-41e0-bbff-29e0ae7ba29f', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', 'b4d6c36b-f4ec-496e-9899-c5b55d031f91', 1, 'Colocando em oração e praticando.', '2026-04-29 00:47:15.520101+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fea49ce7-153b-4bf2-9d85-7a4030779471', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 0, 'Para Deus pensar que eles são melhores ', '2026-04-29 01:31:11.009245+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.devotional_responses (
  id, user_id, devotional_id, question_index, response, created_at, updated_at, church_id
)
VALUES
(
  'd1fb9669-f048-4431-a0ad-b5999802b9a4', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 1, 'Que não precisamos ser perfeito diante dele e se sentimos melhor ', '2026-04-29 01:31:11.009245+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7ec7de72-3353-4236-b09f-e6969c8ddf4b', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 0, 'Para agradar outras pessoas', '2026-04-29 01:41:41.814922+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '738ea777-6f4d-44fa-87e2-55f89da9a75b', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 1, 'A vida muda pra melhor', '2026-04-29 01:41:41.814922+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '34745f96-1052-4a1c-b624-942b00e00265', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 0, 'Deus nos ams', '2026-04-29 09:34:00.371286+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '10d6baa2-1252-41a8-b5ce-538edd0bc81a', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 1, 'Nenhum ser humano pode vencer o pecado sozinho ', '2026-04-29 09:34:00.371286+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '14274846-1f47-4271-ba4b-2c26f1bd3e6a', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 0, 'Uma promessa de esperança ', '2026-04-29 12:41:34.226484+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fea3972f-32d2-4bfb-8ae8-c0a898d5bcb0', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 1, 'Porque ele se sacrifico por nós ', '2026-04-29 12:41:34.226484+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e57fa919-cada-4827-941d-e004c9c78676', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 0, 'Que não tem pecado', '2026-04-29 15:22:23.432248+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6c841752-4d0e-4418-971a-4f67bdff7817', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 1, 'Porque ele nos salvou', '2026-04-29 15:22:23.432248+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7275fb69-f686-4702-abc1-732548cefc81', '32a9f112-1192-4b2a-918f-c2895a76ade3', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 0, 'Que ele tem um coração muito bom', '2026-04-29 15:29:38.891506+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c6395f72-0220-4a59-8908-b55d54d3f682', '32a9f112-1192-4b2a-918f-c2895a76ade3', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 1, 'Pois ele pode nós salvar', '2026-04-29 15:29:38.891506+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7978b7c3-9dd3-4f21-bd7e-4df73469d5a8', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 0, 'Mostra que Deus é justo e tem sempre um plano para nós', '2026-04-29 15:41:43.401096+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '684bb544-bb81-46c5-bcf8-bcb16b4de479', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 1, 'Porque se não fosse ele talvez nós não estaríamos mais aqui', '2026-04-29 15:41:43.401096+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1f508008-6bea-4472-9c6d-b3ccf6b13328', '66b31cf2-7782-4253-98ea-3b6d631703a4', '91324cc4-7a53-4a9d-8332-c8d0f51fc1f5', 0, 'Recomeço ', '2026-04-29 17:53:29.992103+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0fead1e4-cfb8-4c68-9696-ecb31f783798', '66b31cf2-7782-4253-98ea-3b6d631703a4', '91324cc4-7a53-4a9d-8332-c8d0f51fc1f5', 1, 'Para seguirmos o caminho de Deus ', '2026-04-29 17:53:29.992103+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '573861bc-2583-4348-940d-b241a4f456d6', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '91324cc4-7a53-4a9d-8332-c8d0f51fc1f5', 0, 'E um novo recomeço ', '2026-04-29 17:54:39.432605+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd5600e54-304e-4c57-9bc3-7f21dff59f05', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '91324cc4-7a53-4a9d-8332-c8d0f51fc1f5', 1, 'Por que temos que contar a verdade', '2026-04-29 17:54:39.432605+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'eed9a84e-28cd-48a0-9c38-ebfcd1347944', '9289d1ce-a632-4cd7-930e-73023e549ec5', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 0, 'Que ele tinha esperança na humanidade,que ela iria ser boa e sem rivalidades', '2026-04-29 20:26:31.834992+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '73529fd8-afb5-4937-9031-cb69ce0ebe16', '9289d1ce-a632-4cd7-930e-73023e549ec5', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 1, 'Porque ele é o nosso salvador,e o único que pode salvar a humanidade do pecado', '2026-04-29 20:26:31.834992+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7f0cd832-3030-46bd-93e7-c3ba6eff4300', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 0, 'Que ele preparou um lugar para nós ', '2026-04-29 22:55:13.396754+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '74130e1f-af22-4754-bcc0-6e6c5bf47408', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 1, 'Por que ele leva os nossos pecados e nos salvou', '2026-04-29 22:55:13.396754+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1c69c025-5d02-4d2d-b144-057d54500e29', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 0, 'Que o coração de Deus é muito bondoso ', '2026-04-29 23:11:50.483926+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '407488ac-a917-4f87-b02e-e4518bc724f1', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 1, 'Não a outra maior que ele ', '2026-04-29 23:11:50.483926+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '40fbc991-7da8-4684-b70a-5a0a5b36dbc0', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 0, 'Por que o coração de Deus é muito bom, pois ele perdoa muitos pecados e essa promessa mostra o quanto Deus pode amar agente.', '2026-04-29 23:21:58.329074+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b7ddae47-1e18-47f7-93ff-25878d2ba685', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 1, 'Pois é ele quem cura, quem ajuda e quem salva.', '2026-04-29 23:21:58.329074+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5c7adb58-539c-46e7-aad1-3ce2ec03bda4', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 0, 'Que é um coração bom que quer o melhor para nos ', '2026-04-29 23:25:30.648513+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bc757a5c-b661-4b2f-9eb0-e680948ac765', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 1, 'Por que ele nos inspirar a ser melhor ', '2026-04-29 23:25:30.648513+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd07518d6-f5d4-4fd0-9cc7-e2348d8538e3', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '91324cc4-7a53-4a9d-8332-c8d0f51fc1f5', 0, 'É recomeço.', '2026-04-29 23:29:29.974229+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7811f0db-0d27-45b8-b19a-4919ec4a450d', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '91324cc4-7a53-4a9d-8332-c8d0f51fc1f5', 1, 'Porque assim podemos confessar nossos pecados para Deus e sermos perdoados.', '2026-04-29 23:29:29.974229+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e744fa3a-3550-4057-a529-8d399fec4c67', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 1, 'Porque ele morreu na cruz por nós ', '2026-04-29 23:46:13.999958+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '63d23624-e83d-4138-a8c2-34808e96ed44', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 0, 'Pois sabe de tudo e o coração dele é enorme ', '2026-04-30 01:02:51.532931+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '22c5468d-e47c-4886-bd67-a97acf9bce68', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 1, 'Pois só ele e a salvação ', '2026-04-30 01:02:51.532931+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9de17422-61d1-4a72-9f61-06d1f2890dbd', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 0, 'Que ele tem um coração puro e perfeito ', '2026-04-30 01:20:19.657492+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '24a82c50-3018-482a-be7c-daab7122e754', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 1, 'Porque ele é a nossa salvação ', '2026-04-30 01:20:19.657492+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '34229273-d7bc-4493-9aa8-d37efd952bae', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '2e26fe88-3337-4504-a083-c448326f0210', 0, 'Por se compararem demais', '2026-04-30 10:02:27.718787+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '41e6b4fa-8cad-4b2c-bf20-b5e9db6c728d', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '2e26fe88-3337-4504-a083-c448326f0210', 1, 'Se renovar nele', '2026-04-30 10:02:27.718787+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '044d22ca-0f51-4596-a7ec-49e7a7973a80', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '2e26fe88-3337-4504-a083-c448326f0210', 0, 'Porque muitas vezes cometemos vários erros ', '2026-04-30 10:26:28.857934+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c2356cf6-233c-49da-84fb-8eeabeb369b6', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '2e26fe88-3337-4504-a083-c448326f0210', 1, 'Que eu nasci de novo em Cristo
', '2026-04-30 10:26:28.857934+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2afcd17c-6686-4b0b-a64d-44d069069e58', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '2e26fe88-3337-4504-a083-c448326f0210', 0, 'Por que somos perdoados e amados por Cristo ', '2026-04-30 13:15:51.924451+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '86efef7c-fa78-4fae-8612-ba76be881d76', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '2e26fe88-3337-4504-a083-c448326f0210', 1, 'Significa que ele criou uma nova obra em nós ', '2026-04-30 13:15:51.924451+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e576b696-2570-4a77-a3eb-aaabfdcb51b8', '66b31cf2-7782-4253-98ea-3b6d631703a4', '652c6aaa-e27e-4285-b429-62612f9bb96c', 0, 'Somos salvos ', '2026-04-30 14:50:50.747557+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd2912525-9b59-4823-b786-545e800669d5', '66b31cf2-7782-4253-98ea-3b6d631703a4', '652c6aaa-e27e-4285-b429-62612f9bb96c', 1, 'Minha irmã ', '2026-04-30 14:50:50.747557+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '743d0825-91b3-47fb-9d65-c4c27d9be57e', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '2e26fe88-3337-4504-a083-c448326f0210', 0, 'Por acharem que não tem salvação.', '2026-04-30 15:09:43.849666+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ceedefe4-88f7-494e-9a72-a94f3e44c2a3', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '2e26fe88-3337-4504-a083-c448326f0210', 1, 'Significa vida nova,deixar seus erros para trás e andar com Cristo Jesus ', '2026-04-30 15:09:43.849666+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '25ef4fb4-4fc3-4f3c-a891-d606289c9091', '9289d1ce-a632-4cd7-930e-73023e549ec5', '2e26fe88-3337-4504-a083-c448326f0210', 0, 'Porque se deixa levar pelos pecados,o deixando mal e com baixaestima', '2026-04-30 15:23:33.042101+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f76c305c-3b93-4f6c-beb4-e3d40076c07f', '9289d1ce-a632-4cd7-930e-73023e549ec5', '2e26fe88-3337-4504-a083-c448326f0210', 1, 'Que você é perdoado,reconciliados,vira filho de Deus,e recebe uma nova chance de se afastar dos pecados', '2026-04-30 15:23:33.042101+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c2c56f0e-03d6-4b64-990d-58ada0036f08', '32a9f112-1192-4b2a-918f-c2895a76ade3', '2e26fe88-3337-4504-a083-c448326f0210', 0, 'Pois acham que as outras pessoas vão lembrar disso para sempre', '2026-04-30 15:35:46.000757+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '20f42c7e-744c-4a26-878c-caec589fab76', '32a9f112-1192-4b2a-918f-c2895a76ade3', '2e26fe88-3337-4504-a083-c448326f0210', 1, 'Significa seguir a Deus e obedecer a ele', '2026-04-30 15:35:46.000757+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8cb2ae50-636d-48ba-a449-f526fdb8465b', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '652c6aaa-e27e-4285-b429-62612f9bb96c', 0, '
Não para ser salvo,mas porque fomos salvos.', '2026-04-30 16:02:07.50169+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'acb9a49c-bcae-447e-b538-7f02ae952484', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', '652c6aaa-e27e-4285-b429-62612f9bb96c', 1, 'Uma vida com um trabalho bom e cheia de alegria.', '2026-04-30 16:02:07.50169+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0f150da3-a044-402e-a551-085e711510da', 'a608622c-4120-4d15-949f-235ca64db2cf', '2e26fe88-3337-4504-a083-c448326f0210', 0, 'Por que elas se veem nos erros', '2026-04-30 19:07:27.076843+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e05b7346-6d3a-4122-9a9b-2dd68cf4a76d', 'a608622c-4120-4d15-949f-235ca64db2cf', '2e26fe88-3337-4504-a083-c448326f0210', 1, '.', '2026-04-30 19:07:27.076843+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2d11878a-1ea9-4b74-a327-4356510204e5', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', '2e26fe88-3337-4504-a083-c448326f0210', 0, 'Porque ainda não conhecem a Jesus ', '2026-04-30 21:50:41.505194+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c8a45df7-a4c7-44c3-a0c2-64e5f34eb65c', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', '2e26fe88-3337-4504-a083-c448326f0210', 1, 'Significa aceitar que somos quem ele diz que somos ', '2026-04-30 21:50:41.505194+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3751a3ee-e135-400c-9614-b83a1910290c', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '2e26fe88-3337-4504-a083-c448326f0210', 0, 'Algumas fazem isso para chamar atenção ', '2026-04-30 21:51:05.920937+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ca310e80-8948-4c16-b8b1-e38edf31098f', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '2e26fe88-3337-4504-a083-c448326f0210', 1, 'Significa que devemos dar um reset na nossa vida, e então viver para cristo', '2026-04-30 21:51:05.920937+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ea8a5be0-fedd-491f-9c6c-9b17bc608dc9', '4d062445-4744-4007-a2ac-d7c4743fc979', '2e26fe88-3337-4504-a083-c448326f0210', 0, 'Para novas obras de deus
', '2026-04-30 21:53:52.910117+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1b1dbd0a-39f9-443a-88ab-8ad4812afac6', '4d062445-4744-4007-a2ac-d7c4743fc979', '2e26fe88-3337-4504-a083-c448326f0210', 1, 'Quando confiamos em deus', '2026-04-30 21:53:52.910117+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '099a9037-4ad8-4af2-8165-705081ce9f27', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '2e26fe88-3337-4504-a083-c448326f0210', 0, 'Porque não somos definidos por nossos erros ou falhas ', '2026-04-30 22:00:46.624385+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f4d254fd-2f50-47cf-b108-7a0bb421e450', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '2e26fe88-3337-4504-a083-c448326f0210', 1, 'Isso significa que nossas vidas se torna perfeita 
', '2026-04-30 22:00:46.624385+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '11e0f70d-2e95-457d-a074-5468a0cba042', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '2e26fe88-3337-4504-a083-c448326f0210', 0, 'Porque elas não vêem no que podem se identificar como bom, e só vê o lado ruim das coisas.', '2026-04-30 22:04:30.82937+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '345a60e1-49d6-4239-8088-45f80766d7a4', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '2e26fe88-3337-4504-a083-c448326f0210', 1, 'Significa se tornar uma nova pessoa, com seus erros limpos, e tentar não cometer eles novamente.', '2026-04-30 22:04:30.82937+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7681b8e2-7c15-4b78-a0e0-c278c1183f5e', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '2e26fe88-3337-4504-a083-c448326f0210', 0, 'Por não ter discernimento ', '2026-04-30 22:32:00.334798+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f8bccafa-b223-4079-a9a0-6e319e5db21b', '68ee236d-432b-4e4b-b9ff-bd2fc05bdf5f', '2e26fe88-3337-4504-a083-c448326f0210', 1, 'Batismo e aceitação da salvação ', '2026-04-30 22:32:00.334798+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ea844cbb-6ef8-4ae9-8b07-f411d4994bf9', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '2e26fe88-3337-4504-a083-c448326f0210', 0, 'Por que levam uma vida longe de Deus ', '2026-04-30 23:17:43.295493+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '141f50c7-4258-4eaf-9dcf-4f8be96240e8', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '2e26fe88-3337-4504-a083-c448326f0210', 1, 'Uma vida nova em Cristo deixa o antigo homem e faz novo', '2026-04-30 23:17:43.295493+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '01443d62-af55-4bd7-b44a-5bb9594cbe39', '914b898d-24a3-46ad-a764-d2f24e5115d1', '2e26fe88-3337-4504-a083-c448326f0210', 0, 'Por orgulho ', '2026-04-30 23:18:11.579451+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1975dbb9-a5fb-4ca0-9cd5-9ae466ba90b1', '914b898d-24a3-46ad-a764-d2f24e5115d1', '2e26fe88-3337-4504-a083-c448326f0210', 1, 'Receber um perdão ', '2026-04-30 23:18:11.579451+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'eb9528b2-7c6e-4a64-a9b7-89de912d5d74', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '2e26fe88-3337-4504-a083-c448326f0210', 0, 'Por que pensam que não serão perdoados
', '2026-04-30 23:48:35.306724+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1ba7fa0f-7e82-4ddd-b104-0e77f12b5d68', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '2e26fe88-3337-4504-a083-c448326f0210', 1, 'Ser perdoado e ser mudado ', '2026-04-30 23:48:35.306724+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7146b70a-5447-4e1c-81d8-581d1b4cf7c1', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '2e26fe88-3337-4504-a083-c448326f0210', 0, 'Por culpa, vergonha e por esquecerem o perdão de Cristo ', '2026-05-01 00:41:38.13701+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f12241b7-6c23-49a7-b5a4-7e57385d6cd3', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '2e26fe88-3337-4504-a083-c448326f0210', 1, 'Ser filho de Deus perdoado e transformado, mas não definido pelo passado', '2026-05-01 00:41:38.13701+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0c9e2264-6f1f-4932-9486-9aed27e5f2ef', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '2e26fe88-3337-4504-a083-c448326f0210', 0, 'Porque sentem culpa, vergonha e acabam acreditando que são definidos pelos erros.', '2026-05-01 01:12:15.644774+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '814a085b-bb37-46da-9cb7-fb0bf6aa86e0', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '2e26fe88-3337-4504-a083-c448326f0210', 1, 'É ter uma nova vida em Cristo, sendo perdoado, amado e não definido pelos erros.', '2026-05-01 01:12:15.644774+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c425b935-916b-4d2a-94e0-79a73e52503d', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '2e26fe88-3337-4504-a083-c448326f0210', 0, 'Porque não confia em Deus ', '2026-05-01 01:20:13.417246+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '03cb3187-9323-48a8-b338-8f14de5335e4', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '2e26fe88-3337-4504-a083-c448326f0210', 1, 'Significa que a gente é renovado', '2026-05-01 01:20:13.417246+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6880c23f-cb74-4414-b719-7da97ad57e1f', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '2e26fe88-3337-4504-a083-c448326f0210', 0, 'Porque não sabemos oq fazer quando erramos mesmo Deus nos perdoando ', '2026-05-01 01:58:28.558312+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0e9e225e-8840-45b2-8b1d-5e404ca7ee8c', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '2e26fe88-3337-4504-a083-c448326f0210', 1, 'Receber uma nova vida em Cristo se render a ele', '2026-05-01 01:58:28.558312+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b0cb71fd-8b8f-47c7-bf81-8464a82535d7', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '2e26fe88-3337-4504-a083-c448326f0210', 0, 'Pois esquecem de Deus ', '2026-05-01 02:45:33.336097+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e0854d7b-3203-4ba3-9c14-ba5d96fef7ba', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '2e26fe88-3337-4504-a083-c448326f0210', 1, 'Significa ser novo filho de Cristo, novo Ser', '2026-05-01 02:45:33.336097+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'eb167d53-00b8-40d6-8dd0-34eee3d55edf', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 0, 'Que estamos nos aproximando cada vez mais Dele', '2026-05-01 11:27:47.531743+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '008f5bb5-878a-4262-8c15-855964102fad', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 1, 'Servindo a Deus e mostrando aos outros com ele é bom
', '2026-05-01 11:27:47.531743+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a66801bd-86f8-4c37-9d95-33a00313d3dd', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 0, 'Para viver de uma forma diferente ', '2026-05-01 13:29:32.760957+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b24ce762-8327-4161-b7ef-ac75cbdcb1ff', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 1, 'Com humildade ', '2026-05-01 13:29:32.760957+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '04d9c5e9-18c5-4c15-bccd-fb45dcde2c0d', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 0, 'Ter um tempo para Deus pra adora-lo, pedir perdão e se arrepender dos erros diariamente.', '2026-05-01 13:46:18.814869+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b7f4da92-19cc-45cd-8e79-07c1472d350b', 'f753b131-e334-4645-95d6-dd7f3f1193fc', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 1, 'Se afastar das maldades fazer o bem e ajudar quem precisa sempre buscando a Cristo.', '2026-05-01 13:46:18.814869+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c2fe8b88-eee1-43b8-9620-370e121f7175', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 0, 'Crer nele sem erae', '2026-05-01 15:02:44.304787+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b99dde65-f36f-45e9-8231-f813ac766fc3', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 1, 'Crendo', '2026-05-01 15:02:44.304787+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '56f8919e-3874-4b54-bdf0-9dc6d72f7c21', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', 'a513036a-cde9-4b22-9190-8e5b0cb13f62', 0, 'Me sinto mais leve,confiante e agradecida!', '2026-05-01 16:00:23.601733+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f6790207-56b5-4c66-b255-2fd12df6072f', '70a2c6f1-f740-4669-b8dc-29b38f04d9d9', 'a513036a-cde9-4b22-9190-8e5b0cb13f62', 1, 'A alegria.', '2026-05-01 16:00:23.601733+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a8dd9d1c-47e2-4978-9b6e-056288a0014f', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', 'a513036a-cde9-4b22-9190-8e5b0cb13f62', 0, 'Podemos viver', '2026-05-01 17:40:05.856894+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '788b365e-9848-46e9-a093-2e5ce48b7e9c', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', 'a513036a-cde9-4b22-9190-8e5b0cb13f62', 1, 'Mais perto de deus', '2026-05-01 17:40:05.856894+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '684de149-cbda-4395-908f-08ee59a9e822', '1526dc8b-a92a-4a44-b358-b6a3083d0143', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 0, 'Buscando justiça praticando misericórdia caminhando humildemente com deus ', '2026-05-01 18:37:35.101883+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '47bccf3d-88ce-4be9-a903-1297f5914926', '1526dc8b-a92a-4a44-b358-b6a3083d0143', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 1, 'Jesus significa aprender a viver de maneira diferente ', '2026-05-01 18:37:35.101883+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '81c3dc81-37c2-4d70-97e2-00ea860f6162', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 0, 'Aprender com ele e amar ele', '2026-05-01 18:53:31.393024+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a585d8ce-289e-4d20-bea1-64d75fdf66e5', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 1, 'Seguindo a Deus ', '2026-05-01 18:53:31.393024+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ebe7828c-90a8-4004-86b7-ddc78afec5bf', '32a9f112-1192-4b2a-918f-c2895a76ade3', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 0, 'Obedece ele', '2026-05-01 19:26:40.389613+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '848e4186-9871-435d-a2eb-4fdfdf3d662d', '32a9f112-1192-4b2a-918f-c2895a76ade3', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 1, 'Sendo gentil', '2026-05-01 19:26:40.389613+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cac19c0e-462f-4cce-b96c-e4dae1d2d9cc', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 0, 'Ler a bíblia, orar e obedecer ', '2026-05-01 19:59:06.197264+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '64cf6c14-86c4-470b-9796-82850848fd56', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 1, 'Obedecendo A vontade de Deus ', '2026-05-01 19:59:06.197264+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.devotional_responses (
  id, user_id, devotional_id, question_index, response, created_at, updated_at, church_id
)
VALUES
(
  'fc9aa3f6-31d8-4b1d-98c3-fee292a6ede1', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', 'a513036a-cde9-4b22-9190-8e5b0cb13f62', 0, 'Com cultos e bastantes eventos do ensino confirmatório, sinto que estou me aproximando de Deus', '2026-05-01 20:26:57.470064+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f5f76899-b0e6-477b-8741-c6c0d34594d6', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', 'a513036a-cde9-4b22-9190-8e5b0cb13f62', 1, 'Eu me afastei mais de Deus mas eu não sei como me voltar a ele, e mesmo assim ele sempre me ajudou', '2026-05-01 20:26:57.470064+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'dae12d8f-a1fb-439e-98f9-0869f57862a5', '9289d1ce-a632-4cd7-930e-73023e549ec5', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 0, 'Buscar justiça,praticar misericórdia,viver com mais paz no coração', '2026-05-01 21:30:46.80494+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9a98c4b5-f3f1-477d-af03-0bd70ec4f385', '9289d1ce-a632-4cd7-930e-73023e549ec5', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 1, 'Ser gentil, pacífico,educado,ter fé,ir a igreja,ler a bíblia', '2026-05-01 21:30:46.80494+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2e3f0651-c0ed-43a0-a8d2-68a2f06398ba', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 0, 'Viver em conversa constante com Ele, confiando e obedecendo nas coisas pequenas', '2026-05-01 23:10:48.573213+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f3bf4555-2a42-4e89-b42c-6857f51b76b8', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 1, 'Refletindo o amor esperança e perdão de Deus em nossas atitudes ', '2026-05-01 23:10:48.573213+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c835f98d-e15a-405b-a617-df748961e3be', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 0, 'Alegria ', '2026-05-01 23:48:53.641128+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '66f45112-08a7-4306-afe8-858f745bd7ed', '914b898d-24a3-46ad-a764-d2f24e5115d1', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 1, 'Pedindo proteção a Deus ', '2026-05-01 23:48:53.641128+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6ad2b799-99a0-41fa-b12f-426974784dee', '66b31cf2-7782-4253-98ea-3b6d631703a4', 'a513036a-cde9-4b22-9190-8e5b0cb13f62', 0, 'Tendo fé ', '2026-05-02 00:26:45.21294+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '82ef242f-de03-4502-9b0b-e24df247acf0', '66b31cf2-7782-4253-98ea-3b6d631703a4', 'a513036a-cde9-4b22-9190-8e5b0cb13f62', 1, 'Notas boas ', '2026-05-02 00:26:45.21294+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'df5d61a8-6e59-4a9f-b6c2-b530cad13542', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 0, 'Saber que em todas as situações Deus está comigo', '2026-05-02 01:11:28.766212+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '83fc25dc-85b7-498b-b032-b2cb3cbfb5b0', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 1, 'Seguindo a Deus levando a palavra a quem precisa', '2026-05-02 01:11:28.766212+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9c3ec4e8-7d21-4299-b46b-f8320d4b39a3', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 0, 'Não fazer o que ele manda não fazer.', '2026-05-02 01:18:43.979962+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6e81772c-7a0e-482f-bc38-7774edb00d98', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 1, 'Pelo sacrifício que Jesus fez para ter acesso ao pai.', '2026-05-02 01:18:43.979962+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd1e7bd05-d0ca-4884-80bf-710f79858472', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 0, 'Seguir a Deus, e fazer oq agrada a ele', '2026-05-02 01:28:33.900792+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '42d4e868-a3c4-45cd-9b2d-413c274505a7', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 1, 'Espalhando o evangelho ', '2026-05-02 01:28:33.900792+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '53156602-c32c-4475-9f8d-84a4d943717c', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 0, 'Seguir seus passos', '2026-05-02 01:58:47.927966+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9036499d-2a5b-4ae1-9de8-51fdfd0463b8', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 1, 'Seguindo os passos de Cristo ', '2026-05-02 01:58:47.927966+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '75302799-aa4c-4811-aa4e-9d0bc7ff7a76', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 0, 'Caminhar com Deus no dia a dia é tentar viver como Jesus: fazendo o bem, sendo justo e humilde em tudo.', '2026-05-02 02:19:07.52519+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ebe9df2b-8d5b-499b-ad72-5dcef06ece75', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 1, 'Podemos viver diferente praticando o amor, a misericórdia e fazendo o certo, mesmo quando o mundo faz o contrário.', '2026-05-02 02:19:07.52519+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2f2ee0e5-a8d6-4303-89b2-7d5904a711f2', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 0, 'É viver lembrando de Deus, confiando nele e fazendo o bem no dia a dia.', '2026-05-02 02:20:36.799257+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd9219575-ba1b-4852-809a-0b87efd89ab9', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 1, 'É escolher fazer o certo, ajudar os outros e mostrar o amor de Deus nas atitudes.', '2026-05-02 02:20:36.799257+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7e06d93e-08ef-42f6-a506-cd7ab4bf217e', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 0, 'Estar sempre com ele ', '2026-05-02 02:27:37.845541+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7418e768-f6d2-4025-9995-4b4de9fd7bbd', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 1, 'Não entendi ', '2026-05-02 02:27:37.845541+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ddad8bbd-247f-4c8b-bf00-e3665c8fc296', 'a608622c-4120-4d15-949f-235ca64db2cf', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 0, 'Aprender viver de maneira diferente ', '2026-05-02 02:50:05.729095+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4dec9637-1c22-4c5d-bf82-ccc6edc923f5', 'a608622c-4120-4d15-949f-235ca64db2cf', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 1, 'Fazendo diferente dos outros,  e fazendo cm Jesus ', '2026-05-02 02:50:05.729095+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9a266bdd-f560-4c96-b5e0-3cc35e422a6d', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '663eb047-ecdf-46a7-a9a7-56bde90286b5', 0, 'Esforço propio', '2026-05-02 04:37:53.999822+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b6fcc0d1-395e-44f5-8199-a7e7fe278a6f', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '663eb047-ecdf-46a7-a9a7-56bde90286b5', 1, 'E dependência diaria', '2026-05-02 04:37:53.999822+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8d73b8cf-e720-4f5f-a3e6-bf0759f9ff46', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 0, 'Que Deus é justo ', '2026-05-02 10:55:02.658201+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1bc0a848-8460-44b8-8327-542cbd464efe', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 1, 'Porque é ele que vai nos  salvar', '2026-05-02 10:55:02.658201+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7d053829-0fe6-4a3f-82ae-7b5ef1484791', '4d062445-4744-4007-a2ac-d7c4743fc979', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 0, 'Para entrar no caminho ruim
', '2026-05-02 11:43:34.511236+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9c8a790a-5113-43b8-a774-83b75059cf63', '4d062445-4744-4007-a2ac-d7c4743fc979', '6cb1c7b2-9946-4bb3-bda2-d4715e2ce7ad', 1, 'Para restaurar os nossos relacionamentos quebrados ', '2026-05-02 11:43:34.511236+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ff50e3ed-f048-472d-b4d7-47a2a668956e', '4d062445-4744-4007-a2ac-d7c4743fc979', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 0, 'Mostra algo muito importante ', '2026-05-02 11:45:54.655116+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5102d922-5934-458c-a9da-87e8940c2e35', '4d062445-4744-4007-a2ac-d7c4743fc979', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 1, 'Por que ele abriu caminhos um novo caminho para gente', '2026-05-02 11:45:54.655116+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7b292980-42f6-4ac7-ac16-31ea151bd9b2', '4d062445-4744-4007-a2ac-d7c4743fc979', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 0, 'Significa crê nele e andar com ele', '2026-05-02 11:48:30.143725+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '82c0e4c1-2342-4c42-bc00-181de3b7cff9', '4d062445-4744-4007-a2ac-d7c4743fc979', 'ebd44478-7d2d-46e1-8d31-eb4e6f9bd991', 1, 'Recebendo a Graça de Jesus Cristo ', '2026-05-02 11:48:30.143725+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a7113573-ec14-441e-bbe9-fc271d89c4b9', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 0, 'Para todos gostarem delas', '2026-05-02 13:03:57.673092+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd151df1d-6b04-49df-a265-772cf0618d71', '9b42238e-4e16-4511-9073-5281a0b6b1f4', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 1, 'Para biver', '2026-05-02 13:03:57.673092+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '54504faf-c294-4cae-9484-cf66aab25674', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '663eb047-ecdf-46a7-a9a7-56bde90286b5', 0, 'Andar com Deus no pensamento ', '2026-05-02 13:04:57.939374+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '876a1620-63ec-4306-b7dc-33d5e792f431', '16d028b2-ddaa-4fe4-b8b8-6ce2b5c33d1e', '663eb047-ecdf-46a7-a9a7-56bde90286b5', 1, 'Espírito é oque não é físico carne é físico ', '2026-05-02 13:04:57.939374+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b4a58e42-5de3-4c9b-a780-1dd67e6c9126', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 0, 'Q agente e fiel', '2026-05-02 13:05:09.115852+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f1f2cf47-d711-4e4d-b51c-5698d57547fc', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 1, 'Vida', '2026-05-02 13:05:09.115852+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8d2b8d96-3cc5-4472-8422-bee001638f33', '914b898d-24a3-46ad-a764-d2f24e5115d1', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 0, 'Ele é puro', '2026-05-02 13:26:49.950023+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd842f5bf-3286-492d-9dc3-da419b8b2e40', '914b898d-24a3-46ad-a764-d2f24e5115d1', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 1, 'Ele morreu por nós ', '2026-05-02 13:26:49.950023+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '52eebace-1a8b-4c48-8a92-e5ed420e354b', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 0, 'Para impressionar ', '2026-05-02 13:58:55.045141+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0b44953e-e3b7-4bc8-af88-9b90e73185dd', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 1, 'Todos somos iguais', '2026-05-02 13:58:55.045141+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ddada3e3-31cf-4cbb-a337-9b3238af9da9', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', 'b4d6c36b-f4ec-496e-9899-c5b55d031f91', 0, 'Não sei', '2026-05-02 14:01:09.795545+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ce747318-0e65-4f08-a39e-5109caee9759', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', 'b4d6c36b-f4ec-496e-9899-c5b55d031f91', 1, 'Se esforo', '2026-05-02 14:01:09.795545+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '57ccb3f3-5aed-4997-860d-4742e4c4312f', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '652c6aaa-e27e-4285-b429-62612f9bb96c', 0, 'Fomos criados para boas obras ', '2026-05-02 14:02:21.111477+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '85c41cbe-cf15-4652-bcf8-24b47b2fbb3f', '7c2a671d-0f04-463e-ab89-d0e4fae6d165', '652c6aaa-e27e-4285-b429-62612f9bb96c', 1, 'Fomos salvos', '2026-05-02 14:02:21.111477+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ea7f9118-3fb3-49fd-8153-18ec273a6939', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 0, 'Porque querem ser aceitas, evitar críticas e esconder suas falhas por medo ou vergonha.', '2026-05-02 14:35:28.091407+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3e27d07e-dea5-4a45-bb1c-9a30afb828f0', 'c703cab4-4562-496e-9243-fd6bd05d9a80', 'c586266a-7578-41d1-8d0c-ee74b50a6b82', 1, 'Traz liberdade, pois não precisamos ser perfeitos e podemos confiar na graça de Deus.', '2026-05-02 14:35:28.091407+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '61bcabfe-a5fb-4403-996d-17997357318e', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 0, 'Que Deus é amoroso e oferece esperança mesmo após o erro.', '2026-05-02 14:36:19.550252+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '160f70b4-36fd-45cc-a156-21052eb02147', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 1, 'Porque Ele venceu o pecado e a morte, trazendo salvação.', '2026-05-02 14:36:19.550252+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e025b9c6-c313-4cd3-b639-f6a242d3e114', '66b31cf2-7782-4253-98ea-3b6d631703a4', '663eb047-ecdf-46a7-a9a7-56bde90286b5', 0, 'N cumprir o desejo da carne ', '2026-05-02 15:59:43.472691+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a70c8a95-4060-4f06-963a-6824b4b3bc56', '66b31cf2-7782-4253-98ea-3b6d631703a4', '663eb047-ecdf-46a7-a9a7-56bde90286b5', 1, 'Espírito é por vontade própria e carne é desejo ', '2026-05-02 15:59:43.472691+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '54baef17-e842-4c95-963e-40aadcfba217', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 0, 'Que ele é cheio de misericórdia e nunca desiste da humanidade mesmo depois da queda', '2026-05-02 17:24:52.394975+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1143d65c-7646-4eee-8b60-91452675e3f3', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '4b1ef781-a51f-482f-bd43-e127c8c29a97', 1, 'Por que Ele venceu o pecado e a morte na cruz e na ressurreição abrindo caminho da redenção ', '2026-05-02 17:24:52.394975+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '763db56e-85c5-4739-a7bb-7dd7d3289a28', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '663eb047-ecdf-46a7-a9a7-56bde90286b5', 0, 'Andando pelo espírito não precisarás cumprir o desejo da carne', '2026-05-02 19:22:38.578669+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0cdf18c0-bb7e-44b0-a148-5fdb04100cb1', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '663eb047-ecdf-46a7-a9a7-56bde90286b5', 1, 'Por mais que tenhamos vontade de fazer alguma coisa, precisamos ter consciência se o desejo é certo ou errado', '2026-05-02 19:22:38.578669+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2a804629-c0ea-4ebe-a4fe-ad790dd7509e', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', 'b4d6c36b-f4ec-496e-9899-c5b55d031f91', 0, 'Domínio próprio, paciência e mansidão ', '2026-05-02 19:27:05.382447+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1cea9493-e85f-4627-9f10-ef7a3b5e44b2', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', 'b4d6c36b-f4ec-496e-9899-c5b55d031f91', 1, 'Buscando sabedoria ', '2026-05-02 19:27:05.382447+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '28bfb3aa-2c74-441a-bcce-87976ecaf8f9', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '91324cc4-7a53-4a9d-8332-c8d0f51fc1f5', 0, 'Recomeço, pois ganhamos uma nova vida', '2026-05-02 19:28:21.455498+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5bd179ab-2a29-4875-b581-2dfe6abe391e', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '91324cc4-7a53-4a9d-8332-c8d0f51fc1f5', 1, 'Para mostrar que se arrependeu de algo de errado que fizeste', '2026-05-02 19:28:21.455498+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6ce1140c-ff1b-439c-9f8a-b9838b24a2e2', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '652c6aaa-e27e-4285-b429-62612f9bb96c', 0, 'Ter uma vida de paz, tranquilidade e seguir legado que Jesus nos deixou', '2026-05-02 19:31:30.731541+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'be39a7c6-7456-4f1b-bbc6-8b7e7e03d9c3', 'af8a49dd-780a-419f-b967-a9c9e4b5837c', '652c6aaa-e27e-4285-b429-62612f9bb96c', 1, 'Uma família amorosa, fidelidade, saúde e amabilidade ', '2026-05-02 19:31:30.731541+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ec5c5368-ed45-4b60-82a7-2d0f474f1541', '84f87cda-6f3a-43ef-a265-93e7c3d15c23', 'd860c7de-47c9-4665-bf9d-315cd5cd4e6f', 0, 'Não, pois sempre tive pessoas ao meu lado .', '2026-05-08 17:48:26.755296+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ea74025c-c4cf-4f28-8536-e55cbd07c69b', '84f87cda-6f3a-43ef-a265-93e7c3d15c23', 'd860c7de-47c9-4665-bf9d-315cd5cd4e6f', 1, 'Porque Deus nos ama e temos valor para ele.', '2026-05-08 17:48:26.755296+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd6adb7f6-9594-43a0-9436-3b19ce7fc5ab', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'No que elas fazem ', '2026-05-11 10:28:45.319896+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c5c58811-8836-4f8c-9190-854e89797856', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Porque devemos deixar Deus cuidar do que fazemos', '2026-05-11 10:28:45.319896+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '14c8cdb4-ac74-4386-805b-9653d314c0fb', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Que Deus me ama muito ', '2026-05-11 10:28:45.319896+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1059aa52-3fe9-427e-b423-ec2851990e2f', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'Elas procuram na aparência na popularidade nas notas e no trabalho', '2026-05-11 13:19:22.400131+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bfaa7e21-4330-41e1-b80b-716915ec0a0c', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Por a nossa identidade é que somos criados por Deus', '2026-05-11 13:19:22.400131+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '47c732fe-c938-40b3-ab06-1daacc9b2dce', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Muda a forma que vemos a vida ', '2026-05-11 13:19:22.400131+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '17698102-99b0-42f1-bb04-a46907bb57e6', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'Comparando com outras', '2026-05-11 14:58:36.859653+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ac2ace58-0490-4bcb-904c-0333e92d403b', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Por fazer mal a nos', '2026-05-11 14:58:36.859653+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a1f4c00d-6304-45ee-81e8-9c9804947735', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'A identidade ', '2026-05-11 14:58:36.859653+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2ae5819d-069f-4623-a8d3-b6823e7b645b', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'Na bíblia ', '2026-05-11 15:12:52.562155+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a16c9b3d-9575-4204-b014-83b0778cf543', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Porque somos amados por Deus ', '2026-05-11 15:12:52.562155+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3a3f6886-68f0-4bfa-b1ee-19cba7072abc', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Isso muda a forma como vemos a vida porque vivemos mais atentando ser aceito por Deus ', '2026-05-11 15:12:52.562155+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c82296cf-4ea4-45c6-b507-8a38cf4d7e47', '32a9f112-1192-4b2a-918f-c2895a76ade3', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'Nas redes sociais', '2026-05-11 15:35:39.12736+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'eb6faaa0-45d2-49b8-a5fa-6835e5a3ec69', '32a9f112-1192-4b2a-918f-c2895a76ade3', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Pois eu posso fazer um ótimo pão de queijo mas não um bolo', '2026-05-11 15:35:39.12736+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5ba3a76d-776f-47e4-98fa-5da54b26f184', '32a9f112-1192-4b2a-918f-c2895a76ade3', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Eu me sinto mais amada', '2026-05-11 15:35:39.12736+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e430280e-285e-49c9-b55d-4380ab417fac', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'Na igreja ', '2026-05-11 16:21:28.143968+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '48cca7ae-85d2-437b-9767-11e1988e44e2', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Por que Deus criou a gente como nos somos, não por  pessoas querem que nos sejamos diferentes', '2026-05-11 16:21:28.143968+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fd51b9c0-1120-4574-90f1-4ea1c41a3307', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Saber que posso ser uma pessoa boa e não ficar me comparando com os outros', '2026-05-11 16:21:28.143968+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ef24a3b8-9132-4ead-85a2-9eee8b970268', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'As pessoas procuram valor na aparência, opiniões e sucesso.', '2026-05-11 19:26:12.474888+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '489dea71-06e5-4973-a717-beaccdf669a2', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Porque essas coisas mudam e não são seguras.', '2026-05-11 19:26:12.474888+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e895df6a-8026-48b6-96d0-65d1d5f13011', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Saber que sou filha de Deus traz paz e segurança.', '2026-05-11 19:26:12.474888+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'aa6d5ed4-5f8c-4f9f-b0c3-ea15cfc97514', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'Em notas , redes sociais etc ', '2026-05-11 20:21:40.007168+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '76f9ab7d-3b09-446a-a0b4-0e7b200adb1f', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Por que nos somos o que Deus quer ', '2026-05-11 20:21:40.007168+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd3bbeecf-3479-4237-a49e-af93a3b921cf', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Muda o pensamento e que quem aceitas nos é Deus ', '2026-05-11 20:21:40.007168+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cfcdd27e-c2a5-473d-b2e5-47a173aa714c', '9289d1ce-a632-4cd7-930e-73023e549ec5', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'Aparência,notas, popularidade, dinheiro, trabalho', '2026-05-11 20:27:26.565553+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'fe067a4f-a56e-4641-99ef-909721b4edb0', '9289d1ce-a632-4cd7-930e-73023e549ec5', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Porque elas mudam o tempo todo, assim ficamos inseguros', '2026-05-11 20:27:26.565553+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd9eedec3-bbd5-48c7-ad0f-e670d68c1f21', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '5e859f9e-3016-4482-96fd-1cae2e76f966', 0, 'Fazer oque não agrada a Deus', '2026-05-12 21:07:40.451334+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c3d6ace8-b678-4dc8-aeb2-67c9b752dc2d', '9289d1ce-a632-4cd7-930e-73023e549ec5', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Que assim não precisamos o conquistar, já somos amados e aceitos', '2026-05-11 20:27:26.565553+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '23025819-4041-4718-bbae-36a0351c8aa1', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'Redes sociais ', '2026-05-11 20:52:04.663757+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f916c072-74f3-44c6-89fb-e4d2cb48824b', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Por que não são verdadeiras ', '2026-05-11 20:52:04.663757+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '74aaacfc-ceff-4e1e-a5c1-fa0bd492600e', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Viver o caminho certo', '2026-05-11 20:52:04.663757+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b1bb5bad-39ee-4818-83ab-23ba05dd015f', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'No que as outras pessoas dizem sobre elas', '2026-05-11 20:56:57.310442+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.devotional_responses (
  id, user_id, devotional_id, question_index, response, created_at, updated_at, church_id
)
VALUES
(
  '9fa61e2c-1419-4e10-a4ee-8c764a95b47c', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Porque devemos nos definir em Deus, e as coisas que os outros falam de nós nem sempre são coisas boas', '2026-05-11 20:56:57.310442+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5e065ac1-8b44-4a6b-b856-cf8d3cae8c90', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Faz com que me sinta mais amada, protegida...', '2026-05-11 20:56:57.310442+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '28cc4751-c44c-410e-936a-f1218433917a', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'As pessoas normalmente procuram seu valor na opinião dos outros, na aparência, nas conquistas, nas notas e na popularidade.', '2026-05-11 21:04:23.896765+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'de41db75-882d-4644-9f4a-8ede326fdadd', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Porque todas essas coisas mudam com o tempo, mas nossa identidade em Deus permanece firme.', '2026-05-11 21:04:23.896765+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1c182e49-8f94-4926-bbfc-74f08274deae', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Saber que sou filho de Deus muda minha forma de viver, porque entendo que já sou amado e aceito por Ele, sem precisar provar meu valor para os outros.', '2026-05-11 21:04:23.896765+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4056f63c-48f6-4a95-a47b-4a6decb40004', '4d062445-4744-4007-a2ac-d7c4743fc979', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'Nas igrejas', '2026-05-11 21:09:55.347775+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd372bbff-a4c7-4a8c-b871-a70baa8dcff3', '4d062445-4744-4007-a2ac-d7c4743fc979', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Pq que defini quem somos é jesus Cristo
', '2026-05-11 21:09:55.347775+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3d013d00-8773-4033-894d-5e29019ad8e7', '4d062445-4744-4007-a2ac-d7c4743fc979', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Muda que eu tenho o valor do criador ', '2026-05-11 21:09:55.347775+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4760cdb1-d827-4067-8f21-75bf8ba88104', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'Geralmente em redes sociais, pra mostrar o que conquistou talvez, ou até se gabar pra pessoas com um nível mais baixo.', '2026-05-11 21:36:51.00175+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b5801443-9f04-41d5-9c2a-f7db005a6331', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Porque ao invés de se achar nas redes, agente pode mostrar o valor aproximado do que gosta sem se amostrar para os outros, mostrando que simples palavras valem ouro.', '2026-05-11 21:36:51.00175+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '550cfeee-6ff7-4ad8-95f7-0a4d8a215b02', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Que Deus pode nos mostrar o caminho certo, pra onde devemos seguir, que nós temos uma vida para viver cheia de propósitos,', '2026-05-11 21:36:51.00175+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '30a394b2-562e-4c84-a024-1cfd4d766cff', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'Na opinião dos outros. ', '2026-05-11 21:38:09.694892+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ce8cc0a1-f285-467b-b6fe-0f4188484e26', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Porque cada hora as pessoas mudam de opinião ', '2026-05-11 21:38:09.694892+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd455a28a-2fdc-46fa-8602-e47ce4cf4c4f', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Porque sou parecido com ele e amado por ele. ', '2026-05-11 21:38:09.694892+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd7f9ed04-d558-4283-acf6-450a1d988a99', '914b898d-24a3-46ad-a764-d2f24e5115d1', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'Em Deus ', '2026-05-11 23:17:03.102834+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c20b9f60-011f-4c6e-b47c-5018ceb6e155', '914b898d-24a3-46ad-a764-d2f24e5115d1', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Por que fomos criados por Deus ', '2026-05-11 23:17:03.102834+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a9ad6c18-8f27-4d0e-a2e7-936a68534db0', '914b898d-24a3-46ad-a764-d2f24e5115d1', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Viver mais tranquila..pois Ele nos ama', '2026-05-11 23:17:03.102834+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6c86a51d-54f1-462e-b9de-7e38765eba0f', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'No público ', '2026-05-12 01:09:26.719759+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0068f717-8493-45e3-a66a-7754cadef333', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Por que é Deus que decide quem nos somos', '2026-05-12 01:09:26.719759+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4c39928f-4d5d-4ced-a2bc-a2e34cf31a32', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Tendo mais fé', '2026-05-12 01:09:26.719759+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '566ff8f2-ae60-4360-a783-f3c155e1bb62', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'Nas redes sociais ', '2026-05-12 01:25:59.037505+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'dcd8a364-1a18-49f9-8edd-04a313295cc4', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Por que são passageiras e externas', '2026-05-12 01:25:59.037505+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a89c07e6-1d1e-4c5d-9196-7c0019d43ae5', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Paramos de viver de aprovação e vivemos em liberdade por que já somos aceitos por Ele', '2026-05-12 01:25:59.037505+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3a576dd8-0eb8-4c9f-8fd2-3a676f47510d', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'Nas redes sociais.', '2026-05-12 01:56:47.237037+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f05848ff-24df-4f17-9557-5ef1b093aa3c', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Ex: em redes sociais você pode ser a pessoa mais feliz do mundo mais na vida real totalmente o contrário já em Deus você é feliz.', '2026-05-12 01:56:47.237037+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd51d18b9-28bf-4a48-ae72-a095ce697797', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Me sinto melhor e mais confortável.', '2026-05-12 01:56:47.237037+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9435c02a-afc7-4529-a9a9-52b3b655d891', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'Na internet ', '2026-05-12 02:51:40.575245+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'c8613814-d97e-48a0-9039-0468e5912ae1', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Pois somos diferente ', '2026-05-12 02:51:40.575245+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '75d2c44a-2944-4a4c-a5a2-630fe387bbf2', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Me
Sinto acolhida ', '2026-05-12 02:51:40.575245+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '532f4b38-8079-4649-8ee1-50d81a037feb', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '5e859f9e-3016-4482-96fd-1cae2e76f966', 0, 'Não estudar mais a palavra de Deus ', '2026-05-12 10:33:39.309112+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5242c079-44ca-4566-9dea-28b2570cd1a6', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '5e859f9e-3016-4482-96fd-1cae2e76f966', 1, 'Ele deixa as pessoas felizes no momento mas na ora da morte não serão salvos', '2026-05-12 10:33:39.309112+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '08ca9c08-c186-41e9-9836-b8e0d114dc45', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '5e859f9e-3016-4482-96fd-1cae2e76f966', 2, 'Porque só Jesus não pecou', '2026-05-12 10:33:39.309112+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2faa9d7c-4245-4159-9358-f286c6d768eb', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '5e859f9e-3016-4482-96fd-1cae2e76f966', 0, 'Confiar mais em nois do que nele', '2026-05-12 13:58:49.955025+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '12f17149-5a41-44fc-a0bb-95f1bf3188c6', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '5e859f9e-3016-4482-96fd-1cae2e76f966', 1, 'Porque bagunça toda a nossa vida', '2026-05-12 13:58:49.955025+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '6202332c-efe1-465b-b090-b3b9b5d06875', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '5e859f9e-3016-4482-96fd-1cae2e76f966', 2, 'Porque todos nós falhamos', '2026-05-12 13:58:49.955025+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '27eb41db-eced-4149-bfc5-a3eb1833b12d', '9289d1ce-a632-4cd7-930e-73023e549ec5', '5e859f9e-3016-4482-96fd-1cae2e76f966', 0, 'Ter orgulho,pensar apenas em si,procurar uma identidade em coisas superficiais', '2026-05-12 19:18:47.099413+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1a6f004b-270e-498a-996a-5ea1b7b94eae', '9289d1ce-a632-4cd7-930e-73023e549ec5', '5e859f9e-3016-4482-96fd-1cae2e76f966', 1, 'As pessoas se afastam de Deus', '2026-05-12 19:18:47.099413+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3bdeac2d-e119-4631-a469-16bd77185855', '9289d1ce-a632-4cd7-930e-73023e549ec5', '5e859f9e-3016-4482-96fd-1cae2e76f966', 2, 'Que todos nós somos iguais,e Deus não desistiu de nós mesmo pecando', '2026-05-12 19:18:47.099413+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'dfe314e3-315d-453f-9b32-b081fda69bcb', '32a9f112-1192-4b2a-918f-c2895a76ade3', '5e859f9e-3016-4482-96fd-1cae2e76f966', 0, 'Matar, e não acreditar em Deus, talvez', '2026-05-12 20:42:46.99058+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd6b9e718-ae78-42ae-961d-1f6bec96bbfb', '32a9f112-1192-4b2a-918f-c2895a76ade3', '5e859f9e-3016-4482-96fd-1cae2e76f966', 1, 'Fazendo elas fazerem coisas erradas', '2026-05-12 20:42:46.99058+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '48a162d2-8b16-44c5-88bc-35a5957b9192', '32a9f112-1192-4b2a-918f-c2895a76ade3', '5e859f9e-3016-4482-96fd-1cae2e76f966', 2, 'Para não a ver indiferença', '2026-05-12 20:42:46.99058+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0abc6362-5b43-4f54-9364-1d84978e504e', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '5e859f9e-3016-4482-96fd-1cae2e76f966', 0, 'Pecado é viver longe de Deus.', '2026-05-12 20:47:59.313208+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e1a48dcc-a579-4225-9a63-2dad657468f8', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '5e859f9e-3016-4482-96fd-1cae2e76f966', 1, ' O pecado traz culpa e afasta de Deus.', '2026-05-12 20:47:59.313208+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '075e7b5b-b07c-4326-8d07-3adcead94795', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '5e859f9e-3016-4482-96fd-1cae2e76f966', 2, 'Todos precisam de Jesus e do perdão dele', '2026-05-12 20:47:59.313208+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ed387266-2f6f-4563-aec8-00dae2ab7b9d', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '5e859f9e-3016-4482-96fd-1cae2e76f966', 0, 'Blasfemia', '2026-05-12 20:50:41.680058+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ef89bd3e-2d57-494a-a1f3-63b8e2ebabed', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '5e859f9e-3016-4482-96fd-1cae2e76f966', 1, 'Apartir de outras', '2026-05-12 20:50:41.680058+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ecc0c3fc-c0b4-4267-9169-99792d8fcacb', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '5e859f9e-3016-4482-96fd-1cae2e76f966', 2, 'Para ngm se achar superior', '2026-05-12 20:50:41.680058+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e7f2768d-e517-4331-808a-257e10062e7a', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '5e859f9e-3016-4482-96fd-1cae2e76f966', 0, 'Falar coisas erradas ', '2026-05-12 21:03:52.961493+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9f9c89aa-90bd-42c7-aacf-8bb7b011a65b', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '5e859f9e-3016-4482-96fd-1cae2e76f966', 1, 'Afeta no dia a dia', '2026-05-12 21:03:52.961493+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '920d2f98-607d-4ce3-ad9e-61bdde3b7133', '2dcc9a0e-accc-42df-8c78-5577fc2669db', '5e859f9e-3016-4482-96fd-1cae2e76f966', 2, 'Que somos seres humanos e pecamos', '2026-05-12 21:03:52.961493+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4614ae8a-7d7e-4d33-995d-e66acb363e16', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '5e859f9e-3016-4482-96fd-1cae2e76f966', 1, 'Se vc peca e da certo vc provavelmente irá fazer mais vezes', '2026-05-12 21:07:40.451334+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '22660d47-6f13-48cf-a5b7-1d2c89b23899', '528f1076-2f86-4c8f-ae7f-cb0a460e4f49', '5e859f9e-3016-4482-96fd-1cae2e76f966', 2, 'Pois a única pessoa perfeita foi Jesus. Nós somos todos pecadores', '2026-05-12 21:07:40.451334+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7b95187a-9f96-43f7-954f-aaf26cf066f5', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '5e859f9e-3016-4482-96fd-1cae2e76f966', 0, 'viver longe de Deus, confiar mais em nós mesmos do que nele e tentar viver sem Ele.', '2026-05-12 21:20:15.775137+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f90a7c64-6b57-4edc-a10d-10546567c5b9', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '5e859f9e-3016-4482-96fd-1cae2e76f966', 1, 'O pecado afetou não só nossas atitudes, mas também nossa identidade.', '2026-05-12 21:20:15.775137+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '7c70032f-32c9-411c-aedd-d543d773da3c', '7640c7e4-6780-4c27-8a04-ae5ab375f580', '5e859f9e-3016-4482-96fd-1cae2e76f966', 2, 'Para o melhor convívio ', '2026-05-12 21:20:15.775137+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd2c56dbe-0943-40ae-9973-d46866d921cb', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '5e859f9e-3016-4482-96fd-1cae2e76f966', 0, 'É um jeito de afastar-nos de Cristo ', '2026-05-12 21:25:28.132774+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '563623e5-8c26-401d-8d8a-aa93816cceeb', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '5e859f9e-3016-4482-96fd-1cae2e76f966', 1, 'Indo para o caminho errado', '2026-05-12 21:25:28.132774+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b585b7f5-4c85-4b45-a97b-f7fd62fd3f4c', '7c675f6a-f519-4d74-b86e-eb3032a30c4a', '5e859f9e-3016-4482-96fd-1cae2e76f966', 2, 'Para ngm achar que é melhor q o outro', '2026-05-12 21:25:28.132774+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2957e4b2-ae15-4432-965d-87e5b296b7bb', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '5e859f9e-3016-4482-96fd-1cae2e76f966', 0, 'Eramos e se afastamos de Deus mas também e viver afastados de deus ', '2026-05-12 21:41:21.190273+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9f50c9fc-16aa-44ed-bf35-4b7da55ea4be', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '5e859f9e-3016-4482-96fd-1cae2e76f966', 1, 'O pecado afasta nós não só na atitude mas também na nossa identidade ', '2026-05-12 21:41:21.190273+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b7a6c427-c46b-4a50-8b07-24c8d2004e4a', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '5e859f9e-3016-4482-96fd-1cae2e76f966', 2, 'Porque e algo do ser humano , nós mesmos  entendemos nossos erros ', '2026-05-12 21:41:21.190273+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '169e4d74-1f3c-479c-995a-fcd128ffeea0', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '5e859f9e-3016-4482-96fd-1cae2e76f966', 0, 'Passar mal das pessoas ', '2026-05-12 22:05:21.204673+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1dafcf8a-47dc-4f4f-bb95-84abf589c976', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '5e859f9e-3016-4482-96fd-1cae2e76f966', 1, 'Piorando ', '2026-05-12 22:05:21.204673+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '5b8da155-f2a2-4dee-b38b-893cd44b9232', 'ebea6be2-1d97-4b43-a5bc-8f92af388061', '5e859f9e-3016-4482-96fd-1cae2e76f966', 2, 'Para a gente não pensar que a gente é santo', '2026-05-12 22:05:21.204673+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f2dbb587-57cc-4e4f-b8f9-047795589ed0', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '5e859f9e-3016-4482-96fd-1cae2e76f966', 0, 'Falar o nome de Deus em vão ', '2026-05-12 22:33:32.37306+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'd2aa997c-56a5-457d-8361-bd31d1ab6736', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '5e859f9e-3016-4482-96fd-1cae2e76f966', 1, 'Nos afasta de Deus ', '2026-05-12 22:33:32.37306+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ba900f03-f6e8-443d-899a-9a04e15178fb', 'ba6442c9-bc68-4670-a14f-bc7f7225fb93', '5e859f9e-3016-4482-96fd-1cae2e76f966', 2, 'Que todos somos iguais ', '2026-05-12 22:33:32.37306+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'aab57ffc-8d98-4244-9e84-4aa47eded072', '2f773751-38c2-45a1-8ee0-f5b856092730', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'ok', '2026-05-12 22:49:28.663708+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e791cbef-0d7a-4ad0-9222-fa6fe5d84609', '2f773751-38c2-45a1-8ee0-f5b856092730', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'ok', '2026-05-12 22:49:28.663708+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ce7a3ea1-3b87-4956-a1b0-04869d64a812', '2f773751-38c2-45a1-8ee0-f5b856092730', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'ok', '2026-05-12 22:49:28.663708+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'dedc52c0-f842-49ec-aa98-6f26a15c5f7e', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '5e859f9e-3016-4482-96fd-1cae2e76f966', 0, 'Pecado não é só fazer coisas erradas, mas também viver longe de Deus e tentar viver sem Ele.', '2026-05-12 22:51:38.723663+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '18dc655e-d7a2-4ee9-925b-93adb84de682', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '5e859f9e-3016-4482-96fd-1cae2e76f966', 1, 'O pecado afeta a vida das pessoas trazendo medo, culpa, comparação e orgulho, bagunçando o coração e a vida.', '2026-05-12 22:51:38.723663+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '67282aff-37a3-4c70-ab2f-be8dad43d345', 'c323dbd0-4856-47eb-82ca-6e2c3bc7917a', '5e859f9e-3016-4482-96fd-1cae2e76f966', 2, 'É importante entender que todos pecaram porque assim reconhecemos que precisamos de Deus e da salvação em Jesus.', '2026-05-12 22:51:38.723663+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '09087b10-4d64-4c62-8fed-c33ecf9fdcf8', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '5e859f9e-3016-4482-96fd-1cae2e76f966', 0, 'Agente tentar fazer algo que sabe que não consegue para se exibir para os outros, pegar e fazer aquilo mais não assumir que fez.', '2026-05-12 23:02:17.611215+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cb253b14-1365-4380-a149-c171975f7698', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '5e859f9e-3016-4482-96fd-1cae2e76f966', 1, 'Fazendo com que as pessoas se tornam pecadores, e isso acaba afastando-se de Deus.', '2026-05-12 23:02:17.611215+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '4e3ecfef-3615-4a7c-ba1f-01ab5b22eabc', 'f753b131-e334-4645-95d6-dd7f3f1193fc', '5e859f9e-3016-4482-96fd-1cae2e76f966', 2, 'Porque se agente não intender, e achar isso certo, não vai para o céu e Deus não nos perdoa.', '2026-05-12 23:02:17.611215+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'aa414ac4-c01d-40af-8216-59d47f0fde80', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '5e859f9e-3016-4482-96fd-1cae2e76f966', 0, 'É viver longe de Deus sempre escolhendo o nosso próprio caminho ', '2026-05-13 00:01:29.636505+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8cea01a1-5a11-4fa8-b537-1a5c245213f7', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '5e859f9e-3016-4482-96fd-1cae2e76f966', 1, 'Ele bagunça nossa identidade traz culpa medo etc...', '2026-05-13 00:01:29.636505+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3e024399-08a9-45fe-9097-bb1d9e4bcd7d', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '5e859f9e-3016-4482-96fd-1cae2e76f966', 2, 'Por que mostra que precisamos de um salvador: Jesus', '2026-05-13 00:01:29.636505+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8edcf0c5-d857-4715-b8d9-a72117ffc02c', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '5e859f9e-3016-4482-96fd-1cae2e76f966', 0, 'Fazer o errado para Deus, magoar ele e faz nos afastar dele', '2026-05-13 01:29:01.451221+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '455f1e46-57ca-4ef3-b282-bba7db1492b7', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '5e859f9e-3016-4482-96fd-1cae2e76f966', 1, 'Ele nos afasta de Deus ', '2026-05-13 01:29:01.451221+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '90565e9b-4a8c-485c-b873-0f7c68f6d65c', '0051fdc1-7e85-4d26-b24c-a12d2dc41781', '5e859f9e-3016-4482-96fd-1cae2e76f966', 2, 'Porque só Deus e Jesus são perfeitos.', '2026-05-13 01:29:01.451221+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '546a8b03-5448-4ac5-8062-af2b0985347d', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '5e859f9e-3016-4482-96fd-1cae2e76f966', 0, 'Viver longe de Deus ', '2026-05-13 02:42:05.145481+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'db84ec31-0d8c-4e78-b864-bd661a1fe43c', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '5e859f9e-3016-4482-96fd-1cae2e76f966', 1, 'Ele afeta nossa identidade com Cristo ', '2026-05-13 02:42:05.145481+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'bd0b1d7f-15fc-4c33-a604-f4b03b470b0d', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', '5e859f9e-3016-4482-96fd-1cae2e76f966', 2, 'Para aceitar o salvador ', '2026-05-13 02:42:05.145481+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9af60eec-e6b2-428f-a56b-2214bcd05c51', 'a608622c-4120-4d15-949f-235ca64db2cf', '9bf5b69c-d399-4266-9e14-57570672ef33', 0, 'Resgatar,libertar e comprar a volta', '2026-05-13 09:45:03.601722+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a0a69f34-717a-427f-8238-0cfa067319bb', 'a608622c-4120-4d15-949f-235ca64db2cf', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'Jesus', '2026-05-13 09:45:03.601722+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a01b5d00-03c5-4efa-876a-394c0017768f', 'a608622c-4120-4d15-949f-235ca64db2cf', '9bf5b69c-d399-4266-9e14-57570672ef33', 2, 'É saber que fomos resgatados', '2026-05-13 09:45:03.601722+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '9d7cf188-904b-41ef-bd70-7ba52018a258', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', '9bf5b69c-d399-4266-9e14-57570672ef33', 0, 'significa resgatar, libertar, comprar de volta. ', '2026-05-13 12:29:16.044081+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '67ec0759-3d99-4181-a5b5-9534f9692ba3', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'Jesus ', '2026-05-13 12:29:16.044081+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '3910b72a-7ecc-47b0-be06-80bd512dee36', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', '9bf5b69c-d399-4266-9e14-57570672ef33', 2, ' é viver sabendo que fomos resgatados por Jesus e agora pertencemos a Ele', '2026-05-13 12:29:16.044081+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'a394c313-7f1d-4243-957c-88fa759a355a', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '9bf5b69c-d399-4266-9e14-57570672ef33', 0, 'Se render', '2026-05-13 15:25:30.567618+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'cd98752b-2f2f-41eb-8e43-c3c4c8fe0a9e', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'Jesus Cristo ', '2026-05-13 15:25:30.567618+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '45d52f1b-c832-4ad0-88d0-226586b0df46', '9b42238e-4e16-4511-9073-5281a0b6b1f4', '9bf5b69c-d399-4266-9e14-57570672ef33', 2, 'Viver com fé ', '2026-05-13 15:25:30.567618+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '1ccd9536-dec4-475b-abc8-34d8b60d0d0f', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '9bf5b69c-d399-4266-9e14-57570672ef33', 0, 'Resgatar e libertar', '2026-05-13 15:40:27.775927+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'f8cae427-695c-4d19-befd-d502cfc523de', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'Foi jesus', '2026-05-13 15:40:27.775927+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'e0957ad2-77a8-4268-bdd5-87f68020c6ef', 'a98f08aa-3bc2-409c-a398-b7eec0a28825', '9bf5b69c-d399-4266-9e14-57570672ef33', 2, 'Saber que fomos salvos por ele', '2026-05-13 15:40:27.775927+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '8ddd83ea-1989-4c21-bf4c-db27de917fe2', '32a9f112-1192-4b2a-918f-c2895a76ade3', '9bf5b69c-d399-4266-9e14-57570672ef33', 0, 'Salvação, libertação', '2026-05-13 15:53:32.200429+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '207eb553-1be6-4ec3-8fd8-fd78b014e43a', '32a9f112-1192-4b2a-918f-c2895a76ade3', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'Jesus, filho de Deus', '2026-05-13 15:53:32.200429+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'dba33c49-b2d9-4d99-9f3e-6fb87e40b5dd', '32a9f112-1192-4b2a-918f-c2895a76ade3', '9bf5b69c-d399-4266-9e14-57570672ef33', 2, 'Viver para ele', '2026-05-13 15:53:32.200429+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.devotional_responses (
  id, user_id, devotional_id, question_index, response, created_at, updated_at, church_id
)
VALUES
(
  '978fd9e2-3b93-4a0e-99e8-de604c0f197a', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '9bf5b69c-d399-4266-9e14-57570672ef33', 0, 'Redenção significa ser resgatado e libertado do pecado por Jesus.', '2026-05-13 16:10:52.55175+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '91536ed1-d757-4053-916f-f2d36fdc3507', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'Quem pagou o preço pela nossa redenção foi Jesus, morrendo na cruz por nós', '2026-05-13 16:10:52.55175+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '0e12c519-6585-4b06-95b9-726e54b8cc24', 'c703cab4-4562-496e-9243-fd6bd05d9a80', '9bf5b69c-d399-4266-9e14-57570672ef33', 2, 'Viver pertencendo a Jesus é confiar nele, seguir seus ensinamentos e viver com gratidão pelo que Ele fez por nós.', '2026-05-13 16:10:52.55175+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '2e7e369c-2f2f-41eb-96f2-1bae5f0c44d3', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '9bf5b69c-d399-4266-9e14-57570672ef33', 0, 'Que alguém pagou o preço para sermos libertos', '2026-05-13 16:30:12.385017+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '59e2c56c-423b-44ed-808c-e79503bb0768', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'Jesus', '2026-05-13 16:30:12.385017+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '95f5320c-0b49-4809-b622-6ec5bef4bd13', 'd1157e70-4aa7-4e5c-8b78-4fbb2294702a', '9bf5b69c-d399-4266-9e14-57570672ef33', 2, 'Fazer as coisas que agradam a Deus ', '2026-05-13 16:30:12.385017+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '23dd887b-4690-4a60-9068-31f319b934fe', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '9bf5b69c-d399-4266-9e14-57570672ef33', 0, 'Significa resgatar libertar comprar de volta ', '2026-05-13 17:00:54.974625+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'b35f56a3-0910-4be2-8369-90c595b06803', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '9bf5b69c-d399-4266-9e14-57570672ef33', 1, 'Foi jesus que pegou o preço e agora pertence a ele ', '2026-05-13 17:00:54.974625+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  '83449454-1d04-4d0c-b9da-73513e46a848', '1526dc8b-a92a-4a44-b358-b6a3083d0143', '9bf5b69c-d399-4266-9e14-57570672ef33', 2, 'Significa viver a acreditar na existência dele ', '2026-05-13 17:00:54.974625+00', '2026-05-13 17:58:22.190502+00', '02f08580-80e5-4f57-8a2e-1b078d337278'
),
(
  'ddc98ced-f1d9-414e-b82c-a3ce06461c9e', '985bc110-c90a-4762-8b1b-7b081e0c6863', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 0, 'Nos bens materiais, no seu trabalho, na sua aparência ', '2026-05-14 23:49:41.699746+00', '2026-05-14 23:49:41.699746+00', NULL
),
(
  'b09275bd-cde5-41f6-89d5-17c7f32b2039', '985bc110-c90a-4762-8b1b-7b081e0c6863', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 1, 'Pois são passageiras, destrutivas.', '2026-05-14 23:49:41.699746+00', '2026-05-14 23:49:41.699746+00', NULL
),
(
  '97f1109a-9f8b-43c6-a8df-889a95ddb988', '985bc110-c90a-4762-8b1b-7b081e0c6863', '22ba4407-0c53-4c71-b29d-e341d3c904e9', 2, 'Ter a paz em saber que não preciso correr atrás de nada, Ele já me deu o que preciso. Assim, não há porque se preocupar.', '2026-05-14 23:49:41.699746+00', '2026-05-14 23:49:41.699746+00', NULL
),
(
  '8d44023d-25b8-459b-a89b-50a2aee8a1f9', 'f3fe7c42-0110-42bd-831c-4ee0e5d3c1fc', '4f5849b5-6c11-456a-85e5-40d90b26b4ed', 2, 'Teste', '2026-05-16 14:23:22.648261+00', '2026-05-16 14:23:22.648261+00', NULL
),
(
  'cc560008-7a6c-4ed0-b429-6883a59bef64', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '4923904c-0624-414c-a226-c0e44bf04174', 0, 'Significa que eu tenho um pai que me ama', '2026-05-19 00:54:34.90534+00', '2026-05-19 00:54:34.90534+00', NULL
),
(
  '80a3a825-8278-4d1f-9d5b-cf07086f66fe', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '4923904c-0624-414c-a226-c0e44bf04174', 1, 'Ama, cuida, protege etc...', '2026-05-19 00:54:34.90534+00', '2026-05-19 00:54:34.90534+00', NULL
),
(
  'eb358e46-a216-484d-8a79-eb2bda1519f3', 'aa7cfdb6-13b7-4988-8922-86de735eeab2', '4923904c-0624-414c-a226-c0e44bf04174', 2, 'Meda de forma em que podemos confiar Nele por que Ele nos ama e sempre está cuidando de todos nós.', '2026-05-19 00:54:34.90534+00', '2026-05-19 00:54:34.90534+00', NULL
),
(
  'ad3d0fcd-080c-470c-82cc-0e985a4b2629', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 0, 'Identidade ', '2026-05-20 03:36:14.147251+00', '2026-05-20 03:36:14.147251+00', NULL
),
(
  '6e17e595-76e2-4e40-b264-003fc11fbfc9', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 1, 'Nosso corpo é o templo do espírito, temos q nos cuidar', '2026-05-20 03:36:14.147251+00', '2026-05-20 03:36:14.147251+00', NULL
),
(
  '00cad73a-f7b3-45c8-884b-98639d31b1a9', 'd92c04c7-9f6b-4093-ac69-7bdc4ad82f13', 'd1f46ea0-fa0d-43d1-9f1a-b0cf522d17af', 2, 'Muito alegre', '2026-05-20 03:36:14.147251+00', '2026-05-20 03:36:14.147251+00', NULL
)
ON CONFLICT DO NOTHING;

COMMIT;
