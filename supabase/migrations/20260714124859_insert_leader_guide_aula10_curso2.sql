-- Insere o roteiro do lider da Aula 10 (Descobrindo meus dons) do Curso 2
-- Curso: Firme na Fe: Crescendo na Vida Crista
-- lesson_id: faddbfea-4925-4a89-920b-7da2905c747f

DO $$
DECLARE
  v_lesson_id UUID := 'faddbfea-4925-4a89-920b-7da2905c747f';
  v_church_id UUID := NULL;
  v_greeting TEXT := $greeting$ROTEIRO DO ENCONTRO
Tema: Descobrindo meus dons

Saudação do Líder
Olá, pessoal! Que bom estarmos juntos mais uma vez.
Hoje vamos conversar sobre uma pergunta que muita gente faz:
“Será que eu sou bom em alguma coisa?”
Talvez você já tenha olhado para alguém e pensado:
“Essa pessoa canta bem.”
“Ela é muito inteligente.”
“Ele joga muito.”
“Ela conversa com todo mundo.”
E depois tenha perguntado:
“Mas e eu? O que tenho de especial?”
Hoje vamos descobrir que Deus criou cada pessoa de forma única. Ele nos deu capacidades diferentes e deseja usar nossa vida para fazer o bem.
Mas existe algo que precisamos lembrar desde o começo:
Nosso valor não depende dos nossos dons.
Deus não nos ama porque somos talentosos.
Em Jesus, somos amados e recebidos pela graça.
Os dons não existem para provar nosso valor. Eles são presentes que recebemos para servir.$greeting$;
  v_icebreaker TEXT := $icebreaker$Quebra-gelo
O que você escolheria?
Peça que cada adolescente responda rapidamente:
“Se você pudesse ganhar uma destas habilidades instantaneamente, qual escolheria?”
Cantar muito bem.
Tocar qualquer instrumento.
Jogar muito bem qualquer esporte.
Falar todos os idiomas.
Desenhar perfeitamente.
Criar vídeos incríveis.
Ter muita facilidade para fazer amizades.
Resolver qualquer problema de matemática.
Cozinhar qualquer comida.
Falar diante de muitas pessoas sem sentir vergonha.$icebreaker$;
  v_summary TEXT := $summary$Resumo do Conteúdo
Deus criou cada pessoa de maneira única.
Isso significa que você não precisa ser igual a ninguém.
Você não precisa possuir os mesmos talentos dos seus amigos.
Na Bíblia, Paulo ensina que a Igreja é como um corpo.
O corpo possui muitas partes.
Os olhos são diferentes das mãos.
As mãos são diferentes dos pés.
Cada parte possui uma função.
Imagine um corpo formado apenas por olhos.
Ele poderia enxergar, mas não conseguiria caminhar, segurar objetos ou ouvir.
O corpo funciona porque todas as partes são diferentes e trabalham juntas.
A Igreja também funciona assim.
Algumas pessoas ensinam.
Outras cantam.
Algumas organizam.
Outras acolhem.
Algumas lideram.
Outras ajudam nos bastidores.
Algumas gostam de conversar.
Outras sabem ouvir muito bem.
Nenhuma pessoa possui todos os dons.
E nenhum dom torna alguém mais importante.
Todos precisamos uns dos outros.
Também precisamos entender que nossos dons não são troféus.
Deus não nos dá capacidades para competir ou mostrar que somos melhores.
Os dons existem para ajudar pessoas.
Por isso, a pergunta não deve ser apenas:
“O que eu sei fazer?”
Também precisamos perguntar:
“Como aquilo que sei fazer pode ajudar alguém?”
Talvez você goste de tecnologia.
Pode usar essa habilidade para ajudar na comunicação.
Talvez goste de música.
Pode colocar essa capacidade a serviço das pessoas.
Talvez perceba rapidamente quando alguém está triste.
Você pode acolher e ouvir.
Talvez seja criativo.
Pode produzir algo que compartilhe esperança.
Talvez seja organizado.
Pode ajudar um grupo a realizar uma atividade.
Mas antes de falar sobre aquilo que fazemos, precisamos lembrar quem somos.
A Bíblia ensina que somos salvos pela graça, por meio da fé em Jesus.
Não precisamos fazer coisas boas para conquistar o amor de Deus.
Jesus morreu e ressuscitou por nós.
Ele nos trouxe perdão e salvação.
Primeiro, Deus nos ama.
Depois, respondemos servindo.
Não servimos para que Deus nos aceite.
Servimos porque, em Cristo, já fomos aceitos.
Jesus é o maior exemplo de serviço.
Ele ouviu pessoas.
Acolheu crianças.
Curou doentes.
Alimentou quem tinha fome.
Lavou os pés dos discípulos.
E entregou sua vida na cruz.
Jesus usou tudo aquilo que possuía para amar e salvar.
Talvez você ainda não saiba quais são seus dons.
Não existe problema.
Os dons podem ser descobertos enquanto caminhamos com Deus, experimentamos coisas novas, servimos e ouvimos pessoas que nos conhecem.
Você ainda está aprendendo.
E Deus pode usar sua vida enquanto você cresce.$summary$;
  v_bible_texts TEXT[] := ARRAY[
    $bible$1 Coríntios 12.4–7
“Ora, os dons são diversos, mas o Espírito é o mesmo. E também há diversidade nos serviços, mas o Senhor é o mesmo. E há diversidade nas realizações, mas o mesmo Deus é quem opera tudo em todos. A manifestação do Espírito é concedida a cada um visando a um fim proveitoso.”$bible$,
    $bible$1 Coríntios 12.12
“Porque, assim como o corpo é um e tem muitos membros, e todos os membros, mesmo sendo muitos, constituem um só corpo, assim também é com respeito a Cristo.”$bible$,
    $bible$Efésios 2.8–10
“Porque pela graça vocês são salvos, mediante a fé; e isto não vem de vocês, é dom de Deus; não de obras, para que ninguém se glorie. Pois somos feitura dele, criados em Cristo Jesus para boas obras, as quais Deus de antemão preparou para que andássemos nelas.”$bible$,
    $bible$1 Pedro 4.10
“Sirvam uns aos outros, cada um conforme o dom que recebeu, como bons administradores da multiforme graça de Deus.”$bible$
  ];
  v_questions TEXT[] := ARRAY[
    $question$Qual atividade você gosta muito de fazer?
Pode ser jogar, conversar, desenhar, cantar, organizar, estudar, ajudar, criar vídeos ou qualquer outra coisa.$question$,
    $question$Qual qualidade ou habilidade outras pessoas já disseram que percebem em você?
Você concorda com elas?$question$,
    $question$Por que algumas pessoas pensam que os dons mais visíveis são mais importantes?
O que a comparação do corpo ensina sobre isso?$question$,
    $question$Qual é a diferença entre servir para conquistar o amor de Deus e servir porque já fomos amados por Deus?$question$,
    $question$Qual capacidade que você possui pode ser usada nesta semana para ajudar alguém?
Qual será seu primeiro passo?$question$
  ];
  v_practice TEXT := $practice$Prática da Semana
Durante esta semana, converse com duas pessoas que conhecem você.
Pode ser alguém da família, um amigo, um professor, um catequista ou um líder.
Faça esta pergunta:
“Que qualidade ou habilidade você percebe em mim?”
Anote as respostas.
Depois, escolha uma dessas qualidades e pense:
“Como posso usar isso para ajudar alguém?”
Realize uma atitude prática.
Pode ser:
Ouvir alguém.
Ajudar em casa.
Acolher uma pessoa.
Ensinar algo que você sabe.
Criar uma mensagem de esperança.
Ajudar em alguma atividade da Igreja.
Orar por um amigo.
Incentivar uma pessoa que está desanimada.
Na próxima aula, quem desejar poderá compartilhar o que descobriu.$practice$;
  v_prayer_prompt TEXT := $prayer$Oração Final
Senhor Deus,
obrigado porque criaste cada pessoa de forma única.
Obrigado porque não precisamos ser iguais.
Ajuda-nos a não viver comparando nossos dons com os dons das outras pessoas.
Obrigado porque nosso valor não depende daquilo que conseguimos fazer.
Em Jesus, somos amados, perdoados e recebidos pela graça.
Espírito Santo, ajuda-nos a descobrir as capacidades que recebemos.
Ensina-nos a desenvolver nossos dons com humildade.
Mostra como podemos usar nossa vida para ajudar pessoas, fortalecer a Igreja e compartilhar o amor de Jesus.
Dá-nos coragem para começar com pequenas atitudes.
Usa nossos dons para o bem.
Em nome de Jesus.
Amém.$prayer$;
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
