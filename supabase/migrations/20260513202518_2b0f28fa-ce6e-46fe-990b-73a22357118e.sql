-- 1. Create turma_lesson_content if it doesn't exist
CREATE TABLE IF NOT EXISTS public.turma_lesson_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  church_id UUID REFERENCES public.churches(id) ON DELETE SET NULL,
  greeting TEXT,
  icebreaker TEXT,
  summary TEXT,
  bible_texts TEXT[],
  questions TEXT[],
  practice TEXT,
  prayer_prompt TEXT,
  video_link TEXT,
  audio_link TEXT,
  pdf_link TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(turma_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.turma_lesson_content ENABLE ROW LEVEL SECURITY;

-- 2. Fix leader_guide unique constraint
DO $$
BEGIN
  -- Drop the old unique constraint/index if it exists
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'leader_guide_lesson_id_key') THEN
    ALTER TABLE public.leader_guide DROP CONSTRAINT IF EXISTS leader_guide_lesson_id_key;
    DROP INDEX IF EXISTS public.leader_guide_lesson_id_key;
  END IF;
  
  -- Create the new multi-church unique index
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'leader_guide_lesson_church_uidx') THEN
    CREATE UNIQUE INDEX leader_guide_lesson_church_uidx ON public.leader_guide (lesson_id, church_id);
  END IF;
END $$;

-- 3. Update the specific lesson content
DO $$
DECLARE
  v_lesson_id UUID := 'a988a6eb-6505-45b4-93b4-eb01f7940877';
  v_church_id UUID := '02f08580-80e5-4f57-8a2e-1b078d337278';
  v_greeting TEXT := '👋 SAUDAÇÃO DO LÍDER
E aí, pessoal! Que bom estarmos juntos hoje!
Hoje vamos conversar sobre um tema muito presente na nossa geração: identidade.
Quem eu sou? O que me define? O que realmente importa?
A ideia aqui não é ter uma aula, mas uma conversa aberta, sincera e respeitosa.
Todo mundo pode participar, compartilhar, perguntar e até discordar — esse é um espaço seguro.
Bora juntos descobrir o que Deus diz sobre quem somos?';
  v_icebreaker TEXT := 'Se você pudesse escolher uma palavra para te definir hoje, qual seria?
(Pode ser algo leve, tipo: cansado, animado, perdido, confiante, etc.)
👉 Depois de ouvir algumas respostas, o líder pode comentar:
“Interessante como a gente se define muitas vezes pelo que está sentindo no momento, né?”';
  v_summary TEXT := 'Hoje em dia, o mundo diz pra gente:
👉 “Você é o que você sente.”
👉 “Descubra quem você é dentro de você.”
Mas a Bíblia mostra algo diferente:
Nosso coração pode nos enganar
Nossos sentimentos mudam
Nossa identidade não pode depender só disso
A Palavra de Deus nos ensina que:
👉 Nós fomos criados à imagem de Deus
👉 Nossa identidade é algo que recebemos, não inventamos
👉 O pecado trouxe confusão também sobre quem somos
👉 Mas em Jesus, nossa identidade pode ser restaurada
Sobre temas como identidade e gênero, precisamos lembrar:
Existem lutas reais
Existem pessoas feridas
Não respondemos com julgamento
Mas também não abrimos mão da verdade
👉 O caminho de Jesus é sempre: graça + verdade
E no final de tudo, essa frase resume bem:
🔥 “Minha identidade não vem do que eu sinto, mas do que Deus declara.”';
  v_bible_texts TEXT[] := ARRAY['Gênesis 1.27', 'Jeremias 17.9', 'Gênesis 3.7', '2 Coríntios 5.17', 'João 1.14'];
  v_questions TEXT[] := ARRAY[
    'Quando você pensa em “quem você é”, o que vem primeiro na sua cabeça?',
    'Você já sentiu confusão ou dúvida sobre sua identidade? Em que momentos isso acontece mais?',
    'Na sua opinião, por que hoje as pessoas estão tão preocupadas em “definir quem são”?',
    'O que muda na prática quando entendemos que nossa identidade vem de Deus e não só dos nossos sentimentos?',
    'Essa semana, como você pode lembrar diariamente quem você é em Cristo — mesmo quando seus sentimentos disserem o contrário?'
  ];
  v_practice TEXT := 'Durante essa semana, faça algo simples:
👉 Todos os dias, pare por 1 minuto e declare:
“Eu não sou definido pelo que sinto hoje.
Eu sou quem Deus diz que eu sou.”
Se quiser, escreva isso em algum lugar (celular, espelho, caderno).
E, se vier dúvida ou confusão, em vez de se fechar:
👉 Ore
👉 Leia um versículo
👉 Converse com alguém de confiança';
  v_prayer_prompt TEXT := 'Senhor Deus,
nós vivemos em um mundo cheio de vozes dizendo quem devemos ser.
Mas hoje queremos ouvir a Tua voz.
Quando estivermos confusos, inseguros ou perdidos,
lembra-nos que fomos criados por Ti
e que nossa identidade está em Jesus.
Ajuda-nos a viver com verdade e com amor,
como Cristo viveu.
E que possamos encontrar segurança em Ti, todos os dias.
Amém.';
BEGIN
  -- Update lesson_content (Student area)
  INSERT INTO public.lesson_content (lesson_id, church_id, greeting, icebreaker, summary, bible_texts, questions, practice, prayer_prompt)
  VALUES (v_lesson_id, v_church_id, v_greeting, v_icebreaker, v_summary, v_bible_texts, v_questions, v_practice, v_prayer_prompt)
  ON CONFLICT (lesson_id, church_id) DO UPDATE SET
    greeting = EXCLUDED.greeting,
    icebreaker = EXCLUDED.icebreaker,
    summary = EXCLUDED.summary,
    bible_texts = EXCLUDED.bible_texts,
    questions = EXCLUDED.questions,
    practice = EXCLUDED.practice,
    prayer_prompt = EXCLUDED.prayer_prompt,
    updated_at = now();

  -- Update leader_guide (Leader area)
  INSERT INTO public.leader_guide (lesson_id, church_id, greeting, icebreaker, summary, bible_texts, questions, practice, prayer_prompt)
  VALUES (v_lesson_id, v_church_id, v_greeting, v_icebreaker, v_summary, v_bible_texts, v_questions, v_practice, v_prayer_prompt)
  ON CONFLICT (lesson_id, church_id) DO UPDATE SET
    greeting = EXCLUDED.greeting,
    icebreaker = EXCLUDED.icebreaker,
    summary = EXCLUDED.summary,
    bible_texts = EXCLUDED.bible_texts,
    questions = EXCLUDED.questions,
    practice = EXCLUDED.practice,
    prayer_prompt = EXCLUDED.prayer_prompt,
    updated_at = now();
END $$;