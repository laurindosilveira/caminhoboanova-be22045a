-- Insere o roteiro do lider da Aula 9 (Mundo Digital e Pureza) do Curso 2
-- Curso: Firme na Fe: Crescendo na Vida Crista
-- lesson_id: a329150d-4bb9-48c9-a177-35550f607583

DO $$
DECLARE
  v_lesson_id UUID := 'a329150d-4bb9-48c9-a177-35550f607583';
  v_church_id UUID := NULL;
  v_video_link TEXT := 'https://youtu.be/f57tqQXvyrE';
  v_audio_link TEXT := 'https://soundcloud.com/laurindo-silveira/aula-9-mundo-digital-e-pureza';
  v_pdf_link TEXT := 'https://docs.google.com/document/d/1Lh-lAGY2tQCXhYR7tfYBEtRrB6lyrDfh/edit?usp=sharing&ouid=110071487990622020452&rtpof=true&sd=true';
  v_greeting TEXT := $content$ROTEIRO DO ENCONTRO
Curso: Crescendo na Fé
Aula 9 - Mundo Digital e Pureza
Seguindo Jesus também diante das telas

Saudação do Líder
Olá, pessoal! Que bom estarmos juntos mais uma vez.
Hoje vamos conversar sobre algo que faz parte da nossa vida todos os dias: o mundo digital. Celular, redes sociais, vídeos, jogos, mensagens e tudo aquilo que ocupa nossa atenção.
A pergunta não é apenas: "Quanto tempo passamos conectados?"
A pergunta mais importante é:
Como podemos seguir Jesus também diante das telas?
Nossa fé não fica desligada quando pegamos o celular. Jesus quer caminhar conosco em todos os ambientes da vida.$content$;
  v_icebreaker TEXT := $content$Quebra-gelo
Qual aplicativo você mais usa durante a semana?
Se esse aplicativo desaparecesse por sete dias, do que você sentiria mais falta?$content$;
  v_summary TEXT := $content$Resumo do Conteúdo
A tecnologia não é inimiga da fé.
O celular pode ser usado para estudar, conversar, aprender, criar, ouvir músicas, fortalecer amizades e compartilhar coisas boas.
O problema começa quando algo passa a dominar nossa vida.
Às vezes abrimos o celular por poucos minutos e, quando percebemos, muito tempo já passou. Em outros momentos, começamos a acreditar em tudo o que vemos nas redes.
Podemos pensar:
"Preciso ser igual aos outros."
"Minha vida é pior."
"Só tenho valor quando recebo aprovação."
Mas o Evangelho nos lembra de uma verdade diferente:
Nosso valor não vem das curtidas. Nosso valor vem do amor de Deus revelado em Jesus.
A Bíblia ensina que precisamos cuidar daquilo que ocupa nosso coração e nossa mente.
Isso não significa viver com medo da internet.
Significa desenvolver discernimento.
Precisamos aprender a perguntar:
"Isso me faz bem?"
"Isso me aproxima de Deus?"
"Isso me ajuda a amar melhor as pessoas?"
Também precisamos lembrar que aquilo que fazemos no mundo digital faz parte de nossa vida com Jesus.
A fé não aparece somente no culto.
Ela aparece:
nas mensagens que enviamos;
nos comentários que escrevemos;
nos vídeos que assistimos;
na forma como tratamos as pessoas;
e nas escolhas que fazemos quando ninguém está olhando.
Quando erramos, nossa resposta não deve ser fugir de Deus.
Jesus não veio salvar pessoas perfeitas.
Ele veio buscar pecadores.
Por isso podemos confessar nossos erros e confiar no perdão.
A graça de Deus não significa que nossas escolhas não importam.
Significa que Cristo nos perdoa e continua transformando nossa vida.
O Espírito Santo renova nossa mente e nos ajuda a viver de uma nova maneira.
Seguir Jesus também diante das telas significa aprender a usar a tecnologia sem ser dominado por ela.$content$;
  v_bible_texts TEXT[] := ARRAY[
    'Romanos 12.2 - "E não vivam conforme os padrões deste mundo, mas deixem que Deus os transforme pela renovação da mente, para que possam experimentar qual é a boa, agradável e perfeita vontade de Deus."',
    '1 Coríntios 6.12 - "Todas as coisas me são lícitas, mas nem todas convêm. Todas as coisas me são lícitas, mas eu não me deixarei dominar por nenhuma delas."',
    'Filipenses 4.8 - "Finalmente, irmãos, tudo o que é verdadeiro, tudo o que é respeitável, tudo o que é justo, tudo o que é puro, tudo o que é amável, tudo o que é de boa fama, se alguma virtude há e se algum louvor existe, seja isso o que ocupe o pensamento de vocês."',
    'Colossenses 3.17 - "E tudo o que vocês fizerem, seja em palavra, seja em ação, façam em nome do Senhor Jesus, dando por ele graças a Deus Pai."'
  ];
  v_questions TEXT[] := ARRAY[
    'Qual aplicativo, jogo ou rede social você mais gosta de usar? O que faz você gostar dele?',
    'Você já percebeu que algum conteúdo da internet mudou seu humor ou sua forma de pensar? Como isso aconteceu?',
    'Como podemos perceber quando estamos usando a tecnologia de forma saudável e quando ela começa a nos dominar?',
    'O que muda quando lembramos que nosso valor vem do amor de Deus e não da aprovação das pessoas?',
    'Que mudança prática você pode fazer nesta semana para seguir Jesus também na forma como usa o celular?'
  ];
  v_practice TEXT := $content$Prática da Semana
Durante esta semana, pratique o desafio:
Primeiro Jesus, depois a tela
Antes de abrir redes sociais ou começar a assistir vídeos pela manhã:
Leia um pequeno trecho da Bíblia.
Faça uma oração simples.
Entregue seu dia a Deus.
Depois, antes de publicar, comentar ou compartilhar alguma coisa, faça estas três perguntas:
É verdadeiro?
Demonstra amor?
Combina com alguém que segue Jesus?
No final da semana, observe se esse desafio mudou alguma coisa em seus pensamentos ou escolhas.$content$;
  v_prayer_prompt TEXT := $content$Oração Final
Senhor Jesus,
obrigado porque Tu estás conosco em todos os momentos da nossa vida.
Obrigado porque nosso valor não depende da aprovação das pessoas, mas do teu amor.
Perdoa-nos quando usamos mal nosso tempo, nossas palavras e nossas escolhas.
Renova nossa mente por meio da tua Palavra.
Ajuda-nos a usar a tecnologia com sabedoria, liberdade e amor.
Que nossas mensagens, comentários e atitudes mostrem que pertencemos a Ti.
E, quando errarmos, ajuda-nos a voltar para tua graça e confiar em teu perdão.
Continua formando nosso coração e ensinando-nos a caminhar contigo todos os dias.
Amém.$content$;
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
    prayer_prompt,
    video_link,
    audio_link,
    pdf_link
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
    v_prayer_prompt,
    v_video_link,
    v_audio_link,
    v_pdf_link
  )
  ON CONFLICT (lesson_id) DO UPDATE SET
    greeting = EXCLUDED.greeting,
    icebreaker = EXCLUDED.icebreaker,
    summary = EXCLUDED.summary,
    bible_texts = EXCLUDED.bible_texts,
    questions = EXCLUDED.questions,
    practice = EXCLUDED.practice,
    prayer_prompt = EXCLUDED.prayer_prompt,
    video_link = EXCLUDED.video_link,
    audio_link = EXCLUDED.audio_link,
    pdf_link = EXCLUDED.pdf_link,
    updated_at = now();
END $$;
