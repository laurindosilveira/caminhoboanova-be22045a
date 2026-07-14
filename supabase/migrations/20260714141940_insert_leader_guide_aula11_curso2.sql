-- Insere o roteiro do lider da Aula 11 (Servico cristao e vocacao) do Curso 2
-- Curso: Firme na Fe: Crescendo na Vida Crista
-- lesson_id: c868695c-b915-43b1-9247-9c6160fa6cf3

DO $$
DECLARE
  v_lesson_id UUID := 'c868695c-b915-43b1-9247-9c6160fa6cf3';
  v_church_id UUID := NULL;
  v_greeting TEXT := $greeting$ROTEIRO DO ENCONTRO — CHAMADOS PARA SERVIR
Tema: Serviço cristão e vocação

SAUDAÇÃO DO LÍDER
Receba os adolescentes de forma alegre e próxima. Quando todos estiverem reunidos, diga:
“Que bom ter vocês aqui! Hoje vamos conversar sobre uma pergunta muito importante: para que Deus nos colocou no mundo? Talvez você já tenha pensado sobre qual profissão quer ter no futuro, mas a nossa vocação é muito maior do que escolher um trabalho. Deus deseja usar nossa vida, nossos dons, nossas palavras e nossas atitudes para demonstrar seu amor às pessoas. E isso não começa apenas quando nos tornamos adultos. Deus pode agir através de nós hoje, na família, na escola, na igreja e nas amizades.”
“Durante o encontro, ninguém precisa ter todas as respostas. Este é um espaço para perguntar, pensar, compartilhar experiências e aprender juntos. Vamos ouvir uns aos outros com respeito e descobrir o que Jesus nos ensina sobre servir.”$greeting$;
  v_icebreaker TEXT := $icebreaker$QUEBRA-GELO
Dinâmica: “Quem faria isso?”

Apresente situações como:
“Quem provavelmente ajudaria a organizar uma festa?”
“Quem seria uma boa pessoa para conversar quando alguém estivesse triste?”
“Quem conseguiria ensinar alguma coisa com paciência?”
“Quem teria criatividade para produzir uma arte ou um vídeo?”
“Quem ajudaria alguém mesmo sem receber elogios?”
“Quem perceberia rapidamente se uma pessoa estivesse sozinha?”
Depois de algumas respostas, pergunte:
“Por que vocês escolheram essas pessoas?”
“O que vocês perceberam nelas?”
“Todas as pessoas foram escolhidas pelas mesmas qualidades?”$icebreaker$;
  v_summary TEXT := $summary$RESUMO DO CONTEÚDO
Comece dizendo:
“Quando ouvimos a palavra serviço, talvez pensemos em ajudar em alguma atividade da igreja, participar de uma campanha ou colaborar em um evento. Tudo isso é importante, mas o serviço cristão é muito maior. Servimos a Deus também quando ajudamos em casa, acolhemos uma pessoa na escola, ouvimos um amigo, cuidamos da criação ou realizamos nossas responsabilidades com dedicação.”
“Mas precisamos começar pelo lugar certo. A fé cristã não começa com aquilo que fazemos para Deus. Ela começa com aquilo que Deus fez por nós. Jesus veio ao mundo para nos servir. Ele acolheu pessoas, curou doentes, perdoou pecadores e entregou sua vida na cruz. Antes de Jesus dizer ‘sirvam’, ele mostra: ‘Eu servi vocês. Eu amei vocês. Eu dei minha vida por vocês.’”
Explique:
“Somos salvos pela graça de Deus, por meio da fé. Não somos salvos porque ajudamos muitas pessoas, participamos bastante da igreja ou fazemos coisas boas. A salvação é presente de Deus. Jesus fez por nós aquilo que jamais conseguiríamos fazer sozinhos.”
“Então, por que servimos? Servimos porque já fomos amados. As boas obras não compram a salvação. Elas são frutos da fé. Não fazemos o bem para conquistar o amor de Deus. Fazemos o bem porque, em Cristo, já recebemos o amor, o perdão e uma nova vida.”
Apresente o movimento:
“Primeiro, Deus age por nós: Jesus morre e ressuscita para nos salvar. Depois, Deus age em nós: o Espírito Santo cria fé, transforma nosso coração e nos ensina a seguir Jesus. Então, Deus age através de nós: ele usa nossos dons, nossas palavras, nossas atitudes e nosso tempo para cuidar das pessoas.”
Continue:
“Vocação também não significa apenas descobrir qual profissão teremos no futuro. Vocação é o chamado de Deus para amar e servir nos lugares onde estamos. Você já possui diferentes vocações. Você é filho ou filha. Talvez seja irmão ou irmã. É estudante, amigo, vizinho e faz parte de uma comunidade.”
“Deus pode agir através de coisas muito simples. Ajudar alguém com uma tarefa, ouvir uma pessoa que está triste, acolher quem está sozinho, colaborar em casa ou enviar uma mensagem de encorajamento podem ser formas de viver a vocação.”
“A pergunta principal não é apenas: ‘O que quero ser quando crescer?’ A pergunta também é: ‘Como Deus pode usar quem eu sou, onde estou e aquilo que tenho para amar meu próximo hoje?’”$summary$;
  v_bible_texts TEXT[] := ARRAY[
    $bible$Efésios 2.8–10
“Porque pela graça vocês são salvos, mediante a fé; e isto não vem de vocês, é dom de Deus; não de obras, para que ninguém se glorie. Pois somos feitura dele, criados em Cristo Jesus para boas obras, as quais Deus de antemão preparou para que andássemos nelas.”
Explique:
“Esse texto mostra a ordem correta. Primeiro vem a graça. Somos salvos por aquilo que Deus fez em Jesus. Depois vêm as boas obras. Servimos como resposta ao amor que já recebemos.”$bible$,
    $bible$Marcos 10.45
“Pois o próprio Filho do Homem não veio para ser servido, mas para servir e dar a sua vida em resgate por muitos.”
Explique:
“Jesus não é apenas um exemplo de serviço. Ele é o Salvador que entregou a vida por nós. A cruz é o maior ato de amor e serviço da história.”$bible$,
    $bible$1Pedro 4.10
“Sirvam uns aos outros, cada um conforme o dom que recebeu, como bons administradores da multiforme graça de Deus.”
Explique:
“Deus nos dá dons diferentes para que possamos ajudar pessoas. Nossos dons não são troféus. São presentes que podem ser colocados a serviço.”$bible$,
    $bible$Colossenses 3.17
“E tudo o que fizerem, seja em palavra, seja em ação, façam em nome do Senhor Jesus, dando por ele graças a Deus Pai.”
Explique:
“Seguir Jesus envolve toda a vida. Estudar, ajudar, criar, organizar, ouvir e cuidar também podem glorificar a Deus.”$bible$
  ];
  v_questions TEXT[] := ARRAY[
    $question$Qual é uma coisa que você gosta de fazer e acredita que poderia usar para ajudar alguém?
Permita que todos respondam. Valorize diferentes capacidades. Algumas pessoas podem falar sobre música, esportes, tecnologia, desenho, organização, conversa ou cuidado. Lembre que não existem respostas pequenas ou menos importantes.$question$,
    $question$Por que é importante lembrar que Jesus nos serviu antes de pedir que sirvamos outras pessoas?
Ajude o grupo a perceber que o serviço cristão nasce da graça. Não servimos para conquistar a salvação nem para tentar fazer Deus gostar de nós. Servimos porque Jesus já nos amou, perdoou e salvou.$question$,
    $question$Qual é a diferença entre fazer uma boa ação para receber elogios e servir como resposta ao amor de Jesus?
Estimule os adolescentes a pensar sobre motivações. Explique que receber um elogio não é errado, mas o serviço cristão não deve depender da aprovação das pessoas. Deus também vê aquilo que fazemos sem receber atenção.$question$,
    $question$Em quais lugares um adolescente pode viver sua vocação hoje?
Ajude o grupo a pensar na família, escola, igreja, internet, esportes, amizades e comunidade. Incentive exemplos concretos, como acolher um colega novo, ajudar em casa, respeitar professores, participar da igreja ou usar as redes sociais para encorajar.$question$,
    $question$Quem Deus colocou perto de você e qual atitude concreta você pode realizar nesta semana para demonstrar o amor de Jesus?
Dê alguns momentos de silêncio para que todos pensem. Incentive respostas específicas. Em vez de dizer apenas “vou ajudar mais”, peça que pensem em uma pessoa, uma necessidade e uma ação possível.$question$
  ];
  v_practice TEXT := $practice$PRÁTICA DA SEMANA
Desafio: “Uma pessoa, uma atitude”
Durante a semana, cada adolescente deverá escolher uma pessoa e realizar um ato de serviço de maneira intencional.
Pode ser:
Ajudar alguém em uma tarefa.
Conversar com uma pessoa que costuma ficar sozinha.
Colaborar em casa antes que alguém peça.
Enviar uma mensagem de encorajamento.
Ouvir um amigo com atenção.
Ajudar um colega que está enfrentando dificuldades.
Participar de alguma atividade da igreja.
Fazer algo bom sem publicar ou contar para receber elogios.
Peça que cada adolescente complete mentalmente a frase:
“Durante esta semana, quero demonstrar o amor de Jesus a __________, fazendo __________.”
Explique:
“A atitude não precisa ser grande. O mais importante é servir com amor. Depois, pense: Como Deus me usou para cuidar de alguém? O que aprendi sobre servir?”$practice$;
  v_prayer_prompt TEXT := $prayer$ORAÇÃO FINAL
Convide todos a formar um círculo. Se o grupo se sentir confortável, peça que cada adolescente diga apenas uma palavra representando algo que deseja colocar a serviço de Deus. Pode ser: criatividade, amizade, música, escuta, alegria, coragem, tempo ou cuidado.
Depois, ore:
“Senhor Deus, obrigado porque nos amaste antes que pudéssemos fazer qualquer coisa para merecer teu amor. Obrigado porque Jesus veio para nos servir, entregou sua vida na cruz e ressuscitou para nos dar perdão e esperança. Obrigado porque a salvação é presente da tua graça e nós podemos recebê-la pela fé.”
“Espírito Santo, ajuda-nos a perceber os dons que colocaste em nossa vida. Ensina-nos a não usar nossas capacidades apenas para chamar atenção, mas para cuidar das pessoas e glorificar teu nome.”
“Abre nossos olhos para perceber quem precisa de ajuda, amizade, cuidado e encorajamento. Mostra como podemos servir em nossa família, escola, igreja e comunidade.”
“Usa nossas palavras, atitudes, dons e escolhas para demonstrar o amor de Jesus. Ajuda-nos a lembrar que não servimos para conquistar teu amor. Servimos porque, em Cristo, já fomos profundamente amados.”
“Conduze-nos durante esta semana e dá-nos coragem para realizar a atitude que escolhemos. Em nome de Jesus. Amém.”$prayer$;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.leader_guide
    WHERE lesson_id = v_lesson_id
      AND church_id IS NOT DISTINCT FROM v_church_id
  ) THEN
    UPDATE public.leader_guide SET
      greeting = v_greeting,
      icebreaker = v_icebreaker,
      summary = v_summary,
      bible_texts = v_bible_texts,
      questions = v_questions,
      practice = v_practice,
      prayer_prompt = v_prayer_prompt,
      updated_at = now()
    WHERE lesson_id = v_lesson_id
      AND church_id IS NOT DISTINCT FROM v_church_id;
  ELSE
    INSERT INTO public.leader_guide (
      lesson_id,
      church_id,
      greeting,
      icebreaker,
      summary,
      bible_texts,
      questions,
      practice,
      prayer_prompt
    )
    VALUES (
      v_lesson_id,
      v_church_id,
      v_greeting,
      v_icebreaker,
      v_summary,
      v_bible_texts,
      v_questions,
      v_practice,
      v_prayer_prompt
    );
  END IF;

  INSERT INTO public.lesson_content (
    lesson_id,
    church_id,
    greeting,
    icebreaker,
    summary,
    bible_texts,
    questions,
    practice,
    prayer_prompt
  )
  VALUES (
    v_lesson_id,
    v_church_id,
    v_greeting,
    v_icebreaker,
    v_summary,
    v_bible_texts,
    v_questions,
    v_practice,
    v_prayer_prompt
  )
  ON CONFLICT (lesson_id) DO UPDATE SET
    greeting = EXCLUDED.greeting,
    icebreaker = EXCLUDED.icebreaker,
    summary = EXCLUDED.summary,
    bible_texts = EXCLUDED.bible_texts,
    questions = EXCLUDED.questions,
    practice = EXCLUDED.practice,
    prayer_prompt = EXCLUDED.prayer_prompt,
    updated_at = now();
END $$;
