-- Trilha oficial Caminho 3M.
-- Os textos abaixo sao resumos autorais dos livros fornecidos e as perguntas
-- preservam o roteiro de reflexao de cada capitulo.

CREATE TABLE IF NOT EXISTS public.learning_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  order_num integer NOT NULL DEFAULT 1,
  church_id uuid NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS track_id uuid NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'courses_track_id_fkey'
  ) THEN
    ALTER TABLE public.courses
      ADD CONSTRAINT courses_track_id_fkey
      FOREIGN KEY (track_id) REFERENCES public.learning_tracks(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS courses_track_id_idx ON public.courses(track_id);
ALTER TABLE public.learning_tracks ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_tracks TO authenticated;

CREATE TABLE IF NOT EXISTS public.track_church_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid NOT NULL REFERENCES public.learning_tracks(id) ON DELETE CASCADE,
  church_id uuid NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  released_by uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  released_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(track_id, church_id)
);

CREATE INDEX IF NOT EXISTS track_church_releases_church_id_idx
  ON public.track_church_releases(church_id);
ALTER TABLE public.track_church_releases ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.track_church_releases TO authenticated;

DROP POLICY IF EXISTS learning_tracks_select ON public.learning_tracks;
CREATE POLICY learning_tracks_select ON public.learning_tracks
FOR SELECT TO authenticated
USING (
  church_id IS NULL
  OR public.is_super_admin(auth.uid())
  OR church_id = public.get_auth_church_id()
);

DROP POLICY IF EXISTS learning_tracks_manage ON public.learning_tracks;
CREATE POLICY learning_tracks_manage ON public.learning_tracks
FOR ALL TO authenticated
USING (
  public.is_super_admin(auth.uid())
  OR (church_id IS NOT NULL AND public.can_manage_church(church_id))
)
WITH CHECK (
  public.is_super_admin(auth.uid())
  OR (church_id IS NOT NULL AND public.can_manage_church(church_id))
);

DROP POLICY IF EXISTS track_church_releases_select ON public.track_church_releases;
CREATE POLICY track_church_releases_select ON public.track_church_releases
FOR SELECT TO authenticated
USING (
  public.is_super_admin((SELECT auth.uid()))
  OR church_id = (SELECT public.get_auth_church_id())
);

DROP POLICY IF EXISTS track_church_releases_super_admin_manage ON public.track_church_releases;
CREATE POLICY track_church_releases_super_admin_manage ON public.track_church_releases
FOR ALL TO authenticated
USING (public.is_super_admin((SELECT auth.uid())))
WITH CHECK (public.is_super_admin((SELECT auth.uid())));

DO $$
DECLARE
  v_track uuid := '3a000000-0000-4000-8000-000000000001';
  v_course1 uuid := '3a100000-0000-4000-8000-000000000001';
  v_course2 uuid := '3a200000-0000-4000-8000-000000000001';
  v_course3 uuid := '3a300000-0000-4000-8000-000000000001';
  v_module uuid;
  v_lesson uuid;
  v_item jsonb;
  v_module_item jsonb;
  v_lesson_item jsonb;
  v_course_order integer;
  v_base_order integer;
BEGIN
  INSERT INTO public.learning_tracks (id, name, description, order_num, church_id)
  VALUES (
    v_track,
    'Caminho 3M',
    'Uma jornada discipuladora em três etapas: enraizar-se no Evangelho, viver as três marcas do discípulo e aprender a multiplicar discípulos.',
    3,
    NULL
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    order_num = EXCLUDED.order_num;

  SELECT COALESCE(MAX(order_num), 0) + 1 INTO v_base_order
  FROM public.courses
  WHERE id NOT IN (v_course1, v_course2, v_course3);

  INSERT INTO public.courses (id, order_num, title, subtitle, church_id, track_id)
  VALUES
    (v_course1, v_base_order, 'Enraizados no Evangelho',
     'Encontre seu lugar na história de Deus', NULL, v_track),
    (v_course2, v_base_order + 1, 'As 3 Marcas do Discípulo',
     'Amar a Deus, amar ao próximo e servir ao mundo', NULL, v_track),
    (v_course3, v_base_order + 2, 'As 3 Marcas do Discipulado',
     'Formando e multiplicando discípulos de Jesus', NULL, v_track)
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    track_id = EXCLUDED.track_id;

  -- A Igreja Boa Nova recebe a trilha no nivel da igreja. Os cursos continuam
  -- bloqueados para usuarios ate que lider/admin local os libere por area.
  INSERT INTO public.track_church_releases (track_id, church_id)
  SELECT v_track, c.id
  FROM public.churches c
  WHERE lower(trim(c.name)) IN ('igreja boa nova', 'boa nova')
  ON CONFLICT (track_id, church_id) DO NOTHING;

  -- CURSO 1: ENRAIZADOS NO EVANGELHO
  FOR v_module_item IN
    SELECT value FROM jsonb_array_elements($data$
    [
      {"id":"3a110000-0000-4000-8000-000000000001","title":"A Bíblia como uma grande história","order":1,
       "lessons":[
        {"id":"3a111000-0000-4000-8000-000000000001","title":"A Bíblia como uma Grande História","objective":"Compreender a Bíblia como uma narrativa unificada e descobrir seu lugar nela.","summary":"A Bíblia conta uma única grande história: Deus cria um mundo bom, a humanidade se rebela, o Senhor inicia a redenção, Jesus realiza a salvação, a Igreja anuncia o Reino e Cristo voltará para restaurar todas as coisas. O discípulo não é espectador, mas participante da missão de Deus.","bible":["Lucas 24.27,44-49","Hebreus 1.1-3","Salmo 78.1-7"],"questions":["Qual história você acreditava sobre sua vida antes de conhecer Jesus?","Em que momentos você se sentiu perdido dentro de uma história sem direção?","Que mensagens do mundo tentam definir seu valor e propósito?","Como é saber que Deus está contando uma história e quer incluir você nela?","Qual parte da história bíblica mais desperta sua curiosidade?"],"practice":"Observe as histórias que orientam seus pensamentos. Escolha uma verdade bíblica sobre sua identidade e relembre-a diariamente.","prayer":"Agradeça a Deus por incluir você em sua história e peça discernimento para viver segundo a verdade do Evangelho."}
       ]},
      {"id":"3a110000-0000-4000-8000-000000000002","title":"Criação e Queda","order":2,
       "lessons":[
        {"id":"3a111000-0000-4000-8000-000000000002","title":"Deus Estabelece o Seu Reino: A Criação","objective":"Reconhecer Deus como Criador e compreender a identidade e a vocação humanas.","summary":"Deus cria com ordem, beleza e propósito. A humanidade, feita à sua imagem, recebe dignidade e a missão de cultivar, guardar e refletir o caráter do Rei em toda a criação. Trabalho, relacionamentos e cuidado com o mundo fazem parte dessa vocação.","bible":["Gênesis 1.1-31","Gênesis 2.15","Salmo 8.3-9"],"questions":["O que a criação revela sobre quem Deus é?","O que significa ser criado à imagem de Deus?","Como essa identidade muda a maneira como você enxerga a si mesmo e as outras pessoas?","Em que área da criação Deus chama você a cuidar, desenvolver ou servir?","Que atitude prática pode refletir melhor o caráter de Deus nesta semana?"],"practice":"Escolha uma ação concreta de cuidado com uma pessoa, ambiente ou responsabilidade que Deus confiou a você.","prayer":"Louve o Criador e peça ajuda para refletir sua imagem com responsabilidade, criatividade e amor."},
        {"id":"3a111000-0000-4000-8000-000000000003","title":"Rebelião no Reino: A Queda","objective":"Entender a origem do pecado, seus efeitos e a promessa inicial de redenção.","summary":"A rebelião humana rompe a comunhão com Deus, desorganiza os relacionamentos e sujeita a criação à dor. O pecado é mais que um erro isolado: é a tentativa de viver sem o Rei. Mesmo no juízo, Deus anuncia esperança e inicia seu plano de restauração.","bible":["Gênesis 3.1-24","Romanos 3.23","Romanos 8.20-22"],"questions":["Onde você percebe os efeitos da Queda no mundo?","Como o pecado afeta nossa relação com Deus, conosco, com o próximo e com a criação?","Em que situações você tenta ocupar o lugar de Deus?","Por que reconhecer o pecado é necessário para compreender o Evangelho?","Que área quebrada da sua vida você deseja entregar à restauração de Deus?"],"practice":"Identifique uma atitude de autonomia em relação a Deus, confesse-a e dê um passo concreto de obediência.","prayer":"Confesse seu pecado sem esconder-se e agradeça pela graça de Deus que busca e restaura."}
       ]},
      {"id":"3a110000-0000-4000-8000-000000000003","title":"A promessa e o povo do Rei","order":3,
       "lessons":[
        {"id":"3a111000-0000-4000-8000-000000000004","title":"O Rei Escolhe Israel: Redenção Iniciada","objective":"Perceber como Deus inicia sua missão de bênção por meio de Abraão e Israel.","summary":"Deus chama Abraão e forma Israel para ser um povo santo, abençoado e enviado como bênção às nações. A aliança, a libertação do Egito, a Lei, a terra e a presença de Deus revelam fidelidade; a infidelidade do povo também mostra a necessidade de um Rei e Salvador perfeito.","bible":["Gênesis 12.1-3","Êxodo 19.3-6","2Samuel 7.12-16"],"questions":["Por que Deus escolheu Abraão e Israel?","O que significa ser abençoado para abençoar outros?","Que padrões de fidelidade e infidelidade você percebe na história de Israel e em sua vida?","Como a aliança revela o caráter fiel de Deus?","Quem Deus colocou perto de você para receber sua bênção nesta semana?"],"practice":"Abençoe intencionalmente uma pessoa por meio de oração, encorajamento ou serviço.","prayer":"Agradeça pela fidelidade da aliança e peça que sua vida seja instrumento de bênção."},
        {"id":"3a111000-0000-4000-8000-000000000005","title":"Esperando pelo Rei","objective":"Compreender a esperança messiânica anunciada pelos profetas.","summary":"Reis, sacerdotes e profetas apontam para a necessidade de um Libertador fiel. No exílio e na espera, Deus promete um novo coração, uma nova aliança, o derramamento do Espírito e a chegada do Rei que restauraria seu povo e alcançaria as nações.","bible":["Isaías 9.2-7","Jeremias 31.31-34","Ezequiel 36.25-27"],"questions":["Que promessas sustentaram o povo de Deus durante a espera?","Por que nenhum líder humano conseguiu realizar plenamente a restauração?","Como a espera revela nossa necessidade de confiar no caráter de Deus?","Em que área da vida você precisa aprender a esperar com esperança?","Como as promessas do Antigo Testamento preparam o caminho para Jesus?"],"practice":"Escolha uma promessa bíblica relacionada a uma espera atual, memorize-a e ore sobre ela durante a semana.","prayer":"Entregue suas esperas ao Deus fiel e peça perseverança para confiar em suas promessas."}
       ]},
      {"id":"3a110000-0000-4000-8000-000000000004","title":"Jesus, o Rei que veio","order":4,
       "lessons":[
        {"id":"3a111000-0000-4000-8000-000000000006","title":"A Vinda do Rei: Redenção Realizada","objective":"Reconhecer Jesus como centro da história e autor da redenção.","summary":"Jesus anuncia e encarna o Reino de Deus. Em sua vida, morte e ressurreição, ele vence o pecado, assume nosso lugar, inaugura a nova criação e reconcilia consigo um povo. A salvação é graça recebida pela fé e também o começo de uma vida sob o senhorio do Rei.","bible":["Marcos 1.14-15","Colossenses 1.13-20","1Coríntios 15.3-8"],"questions":["O que Jesus revela sobre o Reino de Deus?","Por que a cruz é necessária para nossa redenção?","O que a ressurreição muda na história e em sua vida?","O que significa receber Jesus como Salvador e Senhor?","Que área precisa ser colocada hoje sob o governo de Cristo?"],"practice":"Conte a alguém, com suas palavras, por que a morte e a ressurreição de Jesus são boas notícias.","prayer":"Agradeça a Jesus pela cruz e pela ressurreição e renda novamente sua vida ao governo dele."}
       ]},
      {"id":"3a110000-0000-4000-8000-000000000005","title":"A Igreja e a nova criação","order":5,
       "lessons":[
        {"id":"3a111000-0000-4000-8000-000000000007","title":"A Missão da Igreja: Redenção Proclamada","objective":"Assumir a identidade da Igreja como comunidade enviada pelo Espírito.","summary":"O Cristo ressurreto envia seus discípulos e derrama o Espírito Santo. A Igreja vive como sinal do Reino ao anunciar o Evangelho, formar discípulos, praticar comunhão, justiça e serviço. Cada cristão recebe dons e participa dessa missão no cotidiano.","bible":["Mateus 28.18-20","Atos 1.8","Atos 2.42-47"],"questions":["Qual é a missão que Jesus confiou à Igreja?","Como o Espírito Santo capacita os discípulos?","Que sinais do Reino uma comunidade cristã deve tornar visíveis?","Quais dons e oportunidades Deus já colocou em suas mãos?","Quem você pode amar, servir ou alcançar nesta semana?"],"practice":"Escolha uma pessoa e uma ação missionária concreta: orar, servir, ouvir, convidar ou compartilhar sua fé.","prayer":"Peça o poder do Espírito para testemunhar de Jesus com palavras, caráter e serviço."},
        {"id":"3a111000-0000-4000-8000-000000000008","title":"A Volta do Rei: Redenção Concluída","objective":"Viver à luz da volta de Cristo e da restauração de todas as coisas.","summary":"A história terminará com a volta de Jesus, a derrota definitiva do mal, a ressurreição e a renovação de toda a criação. A esperança cristã não é escapar do mundo, mas participar desde já dos sinais da nova criação, com santidade, perseverança e missão.","bible":["Apocalipse 21.1-5","1Coríntios 15.20-28","2Pedro 3.11-13"],"questions":["O que a Bíblia promete sobre o final da história?","Como a esperança da ressurreição muda a maneira de enfrentar sofrimento e morte?","Por que a nova criação dá sentido ao que fazemos hoje?","Que escolhas precisam mudar à luz da volta de Jesus?","Como você pode ser um sinal da restauração de Deus nesta semana?"],"practice":"Pratique um sinal de esperança: reconcilie, cuide, sirva ou restaure algo quebrado em seu alcance.","prayer":"Ore: 'Vem, Senhor Jesus', e peça fidelidade para viver hoje como cidadão da nova criação."}
       ]}
    ] $data$::jsonb)
  LOOP
    v_module := (v_module_item->>'id')::uuid;
    INSERT INTO public.modules (id, course_id, title, order_num, church_id)
    VALUES (v_module, v_course1, v_module_item->>'title', (v_module_item->>'order')::integer, NULL)
    ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, order_num = EXCLUDED.order_num;

    v_course_order := 0;
    FOR v_lesson_item IN SELECT value FROM jsonb_array_elements(v_module_item->'lessons')
    LOOP
      v_course_order := v_course_order + 1;
      v_lesson := (v_lesson_item->>'id')::uuid;
      INSERT INTO public.lessons (id, course_id, module_id, order_num, title, objective, topics, church_id)
      VALUES (
        v_lesson, v_course1, v_module,
        v_course_order,
        v_lesson_item->>'title',
        v_lesson_item->>'objective',
        ARRAY['Caminho 3M','Enraizados no Evangelho'],
        NULL
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title, objective = EXCLUDED.objective, module_id = EXCLUDED.module_id;

      INSERT INTO public.lesson_content
        (lesson_id, church_id, greeting, icebreaker, summary, bible_texts, questions, practice, prayer_prompt)
      VALUES (
        v_lesson, NULL,
        'Receba o grupo com alegria. Relembre brevemente a prática anterior e convide todos a perceber seu lugar na grande história de Deus.',
        'Se sua vida fosse um capítulo de uma grande história, que título ele teria hoje? Por quê?',
        v_lesson_item->>'summary',
        ARRAY(SELECT jsonb_array_elements_text(v_lesson_item->'bible')),
        ARRAY(SELECT jsonb_array_elements_text(v_lesson_item->'questions')),
        v_lesson_item->>'practice',
        v_lesson_item->>'prayer'
      )
      ON CONFLICT (lesson_id) DO UPDATE SET
        greeting=EXCLUDED.greeting, icebreaker=EXCLUDED.icebreaker, summary=EXCLUDED.summary,
        bible_texts=EXCLUDED.bible_texts, questions=EXCLUDED.questions,
        practice=EXCLUDED.practice, prayer_prompt=EXCLUDED.prayer_prompt, updated_at=now();
    END LOOP;
  END LOOP;

  -- CURSO 2: AS 3 MARCAS DO DISCIPULO
  v_course_order := 0;
  FOR v_module_item IN
    SELECT value FROM jsonb_array_elements($data$
    [
      {"id":"3a210000-0000-4000-8000-000000000001","title":"Parte 1 — Fundamentos do Discipulado","order":1,"lessons":[
        {"id":"3a211000-0000-4000-8000-000000000001","title":"O Chamado Para Ser Discípulo","summary":"Jesus não chama apenas para acreditar em ideias, mas para segui-lo, aprender dele e permitir que ele transforme identidade, escolhas e propósito. Ser discípulo é uma caminhada diária com Cristo, sua comunidade e sua missão.","bible":["Mateus 4.18-22","Lucas 9.23","João 15.4-5"],"questions":["O que significa para você ouvir Jesus dizendo: 'Siga-me'?","O que mais anima você nessa nova jornada como discípulo?","Que áreas da sua vida você sente que Jesus deseja transformar?","Você está disposto a caminhar com Cristo diariamente, mesmo quando for desafiador?"]},
        {"id":"3a211000-0000-4000-8000-000000000002","title":"Um Novo Nascimento: Sua Nova Identidade em Cristo","summary":"A vida cristã começa com a obra do Espírito que faz nascer de novo. Em Cristo, o passado deixa de definir a identidade: o discípulo se torna filho de Deus, nova criação, habitação do Espírito e membro de uma nova família.","bible":["João 3.1-8","2Coríntios 5.17","João 1.12"],"questions":["O que mais impacta você na ideia de nascer de novo?","Você percebe mudanças em sua vida desde que começou a seguir Jesus?","Em quais áreas você ainda vive como antes, e não como nova criatura?","O que significa, na prática, viver como filho de Deus no dia a dia?"]},
        {"id":"3a211000-0000-4000-8000-000000000003","title":"A Visão Geral das 3 Marcas do Discípulo","summary":"O discípulo amadurece de forma equilibrada em três direções inseparáveis: ama a Deus, ama ao próximo e serve ao mundo. Essas marcas expressam relacionamento, comunidade e missão, e ajudam a avaliar e orientar o crescimento.","bible":["Mateus 22.37-40","Mateus 28.18-20","Atos 2.42-47"],"questions":["Qual das três marcas está mais presente em sua vida hoje?","Qual delas você precisa desenvolver mais?","O que pode impedir você de viver um discipulado equilibrado?","Como seria sua vida se as três marcas estivessem mais presentes no cotidiano?"]},
        {"id":"3a211000-0000-4000-8000-000000000004","title":"As 3 Marcas na Igreja do Primeiro Século","summary":"Atos 2 mostra uma comunidade perseverante na Palavra e oração, comprometida com comunhão e generosidade, e relevante em seu testemunho. A igreja primitiva revela que as três marcas são um modo comunitário de viver o Evangelho.","bible":["Atos 2.42-47","Atos 4.32-35"],"questions":["O que mais chama sua atenção no estilo de vida da igreja primitiva?","Qual das três marcas está mais evidente em Atos 2?","O que falta hoje para vivermos algo parecido com essa comunidade?","Como você pode aplicar esse modelo em sua vida pessoal?"]}
      ]},
      {"id":"3a210000-0000-4000-8000-000000000002","title":"Parte 2 — Amar a Deus","order":2,"lessons":[
        {"id":"3a211000-0000-4000-8000-000000000005","title":"Amar a Deus de Todo o Coração","summary":"Amar a Deus é a raiz do discipulado, não uma obrigação fria. Esse amor envolve coração, mente, vontade e rotina, cresce na presença de Deus e reorganiza tudo o que disputa o centro da vida.","bible":["Marcos 12.29-30","Salmo 63.1-8"],"questions":["O que significa para você amar a Deus de todo o coração?","Esse amor é algo vivo ou apenas um conceito?","Há algo ocupando o lugar de Deus em seu coração?","O que pode ajudar você a desenvolver um relacionamento mais profundo com ele?"]},
        {"id":"3a211000-0000-4000-8000-000000000006","title":"Dedicação à Palavra","summary":"A Escritura é a voz que forma mente, caráter e decisões do discípulo. Ler com constância, atenção, oração e disposição para obedecer transforma informação em sabedoria vivida.","bible":["Salmo 119.9-16","2Timóteo 3.14-17","Tiago 1.22-25"],"questions":["Como tem sido sua relação com a Bíblia hoje?","Você lê a Palavra com constância ou apenas ocasionalmente?","O que mais dificulta a manutenção desse hábito?","O que mudaria se você ouvisse Deus diariamente?"]},
        {"id":"3a211000-0000-4000-8000-000000000007","title":"Oração Como Estilo de Vida","summary":"Orar é viver em relacionamento contínuo com Deus: falar com sinceridade, ouvir, agradecer, interceder e entregar preocupações. Mais que um horário, a oração se torna a respiração espiritual do discípulo.","bible":["Mateus 6.5-13","1Tessalonicenses 5.16-18","Filipenses 4.6-7"],"questions":["Como está sua vida de oração hoje?","Você ora apenas em momentos específicos ou ao longo do dia?","O que mais dificulta uma vida de oração constante?","Você sente que ouve Deus ou apenas fala com ele?"]},
        {"id":"3a211000-0000-4000-8000-000000000008","title":"Adoração Verdadeira","summary":"Adoração não se limita à música ou ao culto; é responder a Deus com toda a vida. Gratidão, entrega, obediência e escolhas cotidianas tornam-se expressão da glória de Deus.","bible":["João 4.23-24","Romanos 12.1-2","Colossenses 3.17"],"questions":["O que você entende por adoração hoje?","Sua adoração está mais ligada a momentos ou ao estilo de vida?","Há áreas que ainda não estão rendidas a Deus?","Como viver de modo mais intencional para a glória de Deus?"]},
        {"id":"3a211000-0000-4000-8000-000000000009","title":"Ceia Como Encontro com Cristo","summary":"A Ceia recorda e anuncia a morte de Jesus, alimenta a fé e fortalece a comunhão. Participar com discernimento envolve gratidão, exame pessoal, reconciliação e esperança até a volta de Cristo.","bible":["1Coríntios 11.23-29","Lucas 22.14-20"],"questions":["O que a Ceia do Senhor significa para você hoje?","Você participa com consciência ou de forma automática?","Há algo que precisa ser alinhado antes de se aproximar da mesa?","Como a Ceia fortalece sua fé e comunhão com a igreja?"]},
        {"id":"3a211000-0000-4000-8000-000000000010","title":"Temor e Reverência","summary":"Temer ao Senhor é reconhecer sua santidade, autoridade e presença com amor reverente. Esse temor produz sabedoria, integridade e decisões que honram a Deus mesmo quando ninguém está olhando.","bible":["Provérbios 1.7","Eclesiastes 12.13","Hebreus 12.28-29"],"questions":["O que significa para você temer a Deus?","Você percebe essa reverência em sua vida diária?","Há áreas em que vive sem considerar a vontade de Deus?","Como o temor do Senhor pode transformar suas decisões?"]}
      ]},
      {"id":"3a210000-0000-4000-8000-000000000003","title":"Parte 3 — Amar ao Próximo","order":3,"lessons":[
        {"id":"3a211000-0000-4000-8000-000000000011","title":"Amar ao Próximo Como a Si Mesmo","summary":"O amor cristão torna visível o amor recebido de Deus. Ele ultrapassa sentimento e afinidade para ouvir, perdoar, acolher e agir concretamente, inclusive diante de pessoas difíceis.","bible":["Marcos 12.31","João 13.34-35","1Coríntios 13.4-7"],"questions":["O que significa para você amar ao próximo?","Você percebe esse amor em sua vida de forma prática?","Há alguém que você tem dificuldade de amar hoje?","O que Deus chama você a fazer em relação a isso?"]},
        {"id":"3a211000-0000-4000-8000-000000000012","title":"Comunhão Intencional","summary":"Não existe discipulado solitário. Comunhão exige presença, vulnerabilidade, escuta e compromisso; relacionamentos profundos tornam-se ambiente de encorajamento, correção e crescimento.","bible":["Atos 2.42","Hebreus 10.24-25","Eclesiastes 4.9-12"],"questions":["Como estão seus relacionamentos dentro da fé?","Você tem pessoas com quem compartilha a vida de verdade?","O que dificulta uma comunhão mais profunda?","Que passo pode dar para se aproximar de alguém?"]},
        {"id":"3a211000-0000-4000-8000-000000000013","title":"Generosidade Prática","summary":"A graça de Deus liberta do apego e ensina a compartilhar tempo, recursos, capacidades e presença. Generosidade não depende de riqueza; nasce de gratidão e responde às necessidades reais.","bible":["2Coríntios 8.7-9","Atos 4.32-35","Provérbios 11.24-25"],"questions":["Como você vê a generosidade hoje?","Você se considera uma pessoa generosa?","O que mais dificulta viver com generosidade?","Há algo que Deus chama você a entregar?"]},
        {"id":"3a211000-0000-4000-8000-000000000014","title":"Unidade e Alegria","summary":"A unidade cristã não apaga diferenças, mas as submete ao amor de Cristo. Humildade, escuta, perdão e reconciliação protegem a comunhão e produzem a alegria de pertencer a um só corpo.","bible":["Efésios 4.1-6","Filipenses 2.1-4","Salmo 133"],"questions":["Como você lida com diferenças nos relacionamentos?","Você contribui para a unidade ou para a divisão?","Há algum relacionamento que precisa ser restaurado?","Como pode ser agente de unidade em seu ambiente?"]},
        {"id":"3a211000-0000-4000-8000-000000000015","title":"Cuidado Mútuo","summary":"A comunidade de Jesus carrega fardos, restaura com mansidão e oferece apoio espiritual e prático. Cuidar também exige permitir-se ser conhecido e receber ajuda.","bible":["Gálatas 6.1-2","Romanos 12.9-15","Tiago 5.16"],"questions":["Você tem pessoas com quem pode compartilhar suas lutas?","Você tem permitido ser cuidado por outros?","Está atento às necessidades das pessoas ao redor?","Como pode crescer no cuidado mútuo?"]}
      ]},
      {"id":"3a210000-0000-4000-8000-000000000004","title":"Parte 4 — Servir ao Mundo","order":4,"lessons":[
        {"id":"3a211000-0000-4000-8000-000000000016","title":"Servir ao Mundo em Nome de Jesus","summary":"Todo discípulo é enviado ao cotidiano como sal e luz. Missão é perceber pessoas e oportunidades, demonstrando o Reino por meio de serviço, compaixão e palavras que apontam para Jesus.","bible":["Mateus 5.13-16","João 20.21","Marcos 10.45"],"questions":["Você se vê como alguém enviado por Deus?","Em quais ambientes pode viver essa missão hoje?","Você tem sido sal e luz onde está?","O que pode impedir você de viver essa realidade?"]},
        {"id":"3a211000-0000-4000-8000-000000000017","title":"Testemunho Transformador","summary":"O testemunho cristão nasce da coerência entre fé, caráter e atitudes. Integridade, gentileza, esperança e mudança real despertam perguntas e tornam o Evangelho visível.","bible":["1Pedro 2.12","Mateus 5.16","Filipenses 2.14-16"],"questions":["O que sua vida comunica às pessoas ao redor?","Há coerência entre o que crê e o que vive?","Em quais áreas seu testemunho precisa ser fortalecido?","Como pode refletir melhor o caráter de Cristo?"]},
        {"id":"3a211000-0000-4000-8000-000000000018","title":"Evangelismo Cotidiano","summary":"Evangelizar é compartilhar as boas notícias de Jesus com naturalidade, respeito e clareza. O discípulo ora por pessoas, escuta suas histórias, conta o que Cristo fez e aproveita oportunidades do dia a dia.","bible":["1Pedro 3.15","Romanos 1.16","Colossenses 4.5-6"],"questions":["Você já compartilhou sua fé com alguém?","O que mais dificulta falar sobre Jesus?","Você se sente preparado para responder perguntas sobre sua fé?","Quem ao seu redor precisa ouvir sobre Cristo?"]},
        {"id":"3a211000-0000-4000-8000-000000000019","title":"Libertação e Poder de Deus","summary":"Cristo vence o pecado e os poderes que escravizam. O discípulo aprende a permanecer na verdade, abandonar práticas destrutivas, buscar ajuda e caminhar na liberdade sustentada pelo Espírito.","bible":["João 8.31-36","Colossenses 1.13-14","Gálatas 5.1"],"questions":["Há áreas em que você ainda se sente preso?","Você entende que tem autoridade em Cristo?","Quais pensamentos precisa alinhar à verdade de Deus?","Como pode viver com mais liberdade no dia a dia?"]},
        {"id":"3a211000-0000-4000-8000-000000000020","title":"Impacto Social Positivo","summary":"A fé bíblica produz misericórdia, justiça e serviço que alcançam necessidades concretas. O discípulo observa seu contexto, age com compaixão e coopera com Deus na transformação de pessoas e lugares.","bible":["Miquéias 6.8","Tiago 2.14-17","Isaías 58.6-10"],"questions":["Você percebe necessidades ao seu redor?","Como tem respondido a essas situações?","Há alguma área em que Deus chama você a agir?","Como sua fé pode gerar impacto em seu contexto?"]}
      ]}
    ] $data$::jsonb)
  LOOP
    v_module := (v_module_item->>'id')::uuid;
    INSERT INTO public.modules (id, course_id, title, order_num, church_id)
    VALUES (v_module, v_course2, v_module_item->>'title', (v_module_item->>'order')::integer, NULL)
    ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, order_num=EXCLUDED.order_num;

    FOR v_lesson_item IN SELECT value FROM jsonb_array_elements(v_module_item->'lessons')
    LOOP
      v_course_order := v_course_order + 1;
      v_lesson := (v_lesson_item->>'id')::uuid;
      INSERT INTO public.lessons (id, course_id, module_id, order_num, title, objective, topics, church_id)
      VALUES (
        v_lesson, v_course2, v_module,
        v_course_order,
        v_lesson_item->>'title',
        'Compreender e praticar o tema deste capítulo como parte das três marcas do discípulo.',
        ARRAY['Caminho 3M','As 3 Marcas do Discípulo'],
        NULL
      )
      ON CONFLICT (id) DO UPDATE SET
        title=EXCLUDED.title, objective=EXCLUDED.objective, module_id=EXCLUDED.module_id,
        order_num=EXCLUDED.order_num;

      INSERT INTO public.lesson_content
        (lesson_id, church_id, greeting, icebreaker, summary, bible_texts, questions, practice, prayer_prompt)
      VALUES (
        v_lesson, NULL,
        'Acolha o grupo e convide cada pessoa a compartilhar como viveu a prática do capítulo anterior. Reforce que a prestação de contas existe para promover crescimento, não cobrança.',
        'Qual experiência recente ajuda você a se conectar com o tema de hoje?',
        v_lesson_item->>'summary',
        ARRAY(SELECT jsonb_array_elements_text(v_lesson_item->'bible')),
        ARRAY(SELECT jsonb_array_elements_text(v_lesson_item->'questions')),
        'Durante a semana, pratique uma ação concreta relacionada ao capítulo nas três direções: amar a Deus, amar ao próximo e servir ao mundo. Registre o que aconteceu para compartilhar no próximo encontro.',
        'Ore com sinceridade sobre o tema, agradeça pela graça de Jesus e peça ao Espírito Santo uma transformação concreta para esta semana.'
      )
      ON CONFLICT (lesson_id) DO UPDATE SET
        greeting=EXCLUDED.greeting, icebreaker=EXCLUDED.icebreaker, summary=EXCLUDED.summary,
        bible_texts=EXCLUDED.bible_texts, questions=EXCLUDED.questions,
        practice=EXCLUDED.practice, prayer_prompt=EXCLUDED.prayer_prompt, updated_at=now();
    END LOOP;
  END LOOP;

  -- O mesmo roteiro fica disponivel na sala do lider.
  DELETE FROM public.leader_guide lg
  USING public.lessons l
  WHERE lg.lesson_id = l.id
    AND lg.church_id IS NULL
    AND l.course_id IN (v_course1, v_course2);

  INSERT INTO public.leader_guide
    (lesson_id, church_id, greeting, icebreaker, summary, bible_texts, questions, practice, prayer_prompt)
  SELECT
    lc.lesson_id, NULL, lc.greeting, lc.icebreaker, lc.summary,
    lc.bible_texts, lc.questions, lc.practice, lc.prayer_prompt
  FROM public.lesson_content lc
  JOIN public.lessons l ON l.id = lc.lesson_id
  WHERE lc.church_id IS NULL
    AND l.course_id IN (v_course1, v_course2);

  -- CURSO 3: somente estrutura, sem lesson_content, conforme solicitado.
  FOR v_module_item IN
    SELECT value FROM jsonb_array_elements($data$
    [
      {"id":"3a310000-0000-4000-8000-000000000001","title":"Introdução","order":1,"lessons":["O discipulado que Jesus nos deixou","O que é discipulado","A missão de fazer discípulos","O discipulador como cooperador de Cristo"]},
      {"id":"3a310000-0000-4000-8000-000000000002","title":"Parte 1 — Amar a Deus","order":2,"lessons":["O discipulador conduz pessoas a Cristo, não a si mesmo","Ensinando hábitos espirituais","Como conduzir conversas espirituais","Corrigindo e encorajando espiritualmente","A oração como ferramenta de discipulado"]},
      {"id":"3a310000-0000-4000-8000-000000000003","title":"Parte 2 — Amar ao Próximo","order":3,"lessons":["Construindo relacionamentos discipuladores","Hospitalidade e acolhimento","Cuidado pastoral no microgrupo","Lidando com conflitos","Desenvolvendo comunhão verdadeira"]},
      {"id":"3a310000-0000-4000-8000-000000000004","title":"Parte 3 — Servir ao Mundo","order":4,"lessons":["O discipulado sempre gera missão","Descobrindo dons e vocação","Evangelismo relacional","Mobilizando para servir","O discipulado que transforma a cidade"]},
      {"id":"3a310000-0000-4000-8000-000000000005","title":"Parte 4 — Multiplicando Discípulos","order":5,"lessons":["Identificando novos discipuladores","Preparando auxiliares","Como multiplicar um microgrupo","Enviando novos líderes","Permanecendo uma comunidade discipuladora"]}
    ] $data$::jsonb)
  LOOP
    v_module := (v_module_item->>'id')::uuid;
    INSERT INTO public.modules (id, course_id, title, order_num, church_id)
    VALUES (v_module, v_course3, v_module_item->>'title', (v_module_item->>'order')::integer, NULL)
    ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, order_num=EXCLUDED.order_num;

    v_course_order := 0;
    FOR v_lesson_item IN SELECT value FROM jsonb_array_elements(v_module_item->'lessons')
    LOOP
      v_course_order := v_course_order + 1;
      v_lesson := md5(v_course3::text || ':' || v_module::text || ':' || v_course_order::text)::uuid;
      INSERT INTO public.lessons (id, course_id, module_id, order_num, title, objective, topics, church_id)
      VALUES (
        v_lesson, v_course3, v_module, v_course_order,
        trim(both '"' from v_lesson_item::text),
        NULL,
        ARRAY['Caminho 3M','As 3 Marcas do Discipulado'],
        NULL
      )
      ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, module_id=EXCLUDED.module_id;
    END LOOP;
  END LOOP;
END $$;
