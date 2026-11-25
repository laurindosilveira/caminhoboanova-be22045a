-- Run only on the disposable test database after installing the candidate.
BEGIN;
DO $$
DECLARE c uuid; ar text; lesson uuid;
BEGIN
 SELECT church_id,area::text INTO STRICT c,ar FROM public.profiles WHERE user_id='00000000-0000-0000-0000-000000000201';
 SELECT lesson_id INTO STRICT lesson FROM public.lesson_responses WHERE user_id='00000000-0000-0000-0000-000000000201' AND question_key='__ensaio_unificado__';
 INSERT INTO public.turmas(id,name,year,church_id,area,is_active)
 VALUES('00000000-0000-0000-0000-000000000319','Turma ficticia reversao',2026,c,ar,true);
 UPDATE public.profiles SET turma_id='00000000-0000-0000-0000-000000000319',enrollment_status='approved',is_active=true
 WHERE user_id='00000000-0000-0000-0000-000000000201';
 INSERT INTO public.user_course_entitlements(user_id,course_id,source)
 SELECT '00000000-0000-0000-0000-000000000201',course_id,'admin' FROM public.lessons WHERE id=lesson
 ON CONFLICT DO NOTHING;
 INSERT INTO public.devotional_content(id,lesson_id,church_id,title,questions)
 VALUES('00000000-0000-0000-0000-000000000539',lesson,c,'Devocional ficticio reversao',ARRAY['Pergunta ficticia']);
 INSERT INTO public.events(id,title,event_date,type,church_id)
 VALUES('00000000-0000-0000-0000-000000000529','Evento ficticio apos atualizacao',now(),'confirmatorio',c);
 PERFORM set_config('test.rollback_fixture_church',c::text,true);
 PERFORM set_config('test.rollback_fixture_area',ar,true);
 PERFORM set_config('test.rollback_fixture_version',(SELECT version::text FROM private.learning_membership_version WHERE user_id='00000000-0000-0000-0000-000000000201'),true);
END $$;
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000201',true);
SET LOCAL ROLE authenticated;
DO $$
DECLARE a uuid:='00000000-0000-0000-0000-000000000201'; c uuid:=current_setting('test.rollback_fixture_church')::uuid; l uuid; previous text; result jsonb; answers jsonb; expected jsonb; i integer;
BEGIN
 SELECT lesson_id,response INTO STRICT l,previous FROM public.lesson_responses WHERE user_id=a AND question_key='__ensaio_unificado__';
 result:=public.sync_owned_learning(a,'save_lesson_draft',l,jsonb_build_object('__ensaio_unificado__','[novo apos atualizacao]'),false,false,false,NULL,NULL,jsonb_build_object('__ensaio_unificado__',previous));
 IF result->>'status'<>'synced' THEN RAISE EXCEPTION 'new lesson save not confirmed'; END IF;
 answers:=jsonb_build_object('__ensaio_unificado__','[novo apos atualizacao]','icebreaker','[ficticio]','practice','[ficticio]','prayer','[ficticio]');
 FOR i IN 0..50 LOOP answers:=answers||jsonb_build_object('q'||i,'[ficticio]'); END LOOP;
 SELECT coalesce(jsonb_object_agg(question_key,response),'{}'::jsonb) INTO expected FROM public.lesson_responses WHERE user_id=a AND lesson_id=l;
 result:=public.sync_owned_completion(a,c,'00000000-0000-0000-0000-000000000319',current_setting('test.rollback_fixture_area'),current_setting('test.rollback_fixture_version')::uuid,
 'complete_lesson',l,answers,true,true,false,NULL,NULL,expected);
 IF result->>'status'<>'synced' THEN RAISE EXCEPTION 'new lesson completion not confirmed: %',result->>'status'; END IF;
 result:=public.sync_owned_completion(a,c,'00000000-0000-0000-0000-000000000319',current_setting('test.rollback_fixture_area'),current_setting('test.rollback_fixture_version')::uuid,
 'complete_devotional','00000000-0000-0000-0000-000000000539',jsonb_build_object('0','[devocional apos atualizacao]'),false,false,false,NULL,NULL,'{}');
 IF result->>'status'<>'synced' THEN RAISE EXCEPTION 'new devotional completion not confirmed: %',result->>'status'; END IF;
 result:=public.sync_owned_attendance(a,c,'00000000-0000-0000-0000-000000000529','pendente_presente','2026-11-25T10:00:00Z',NULL);
 IF result->>'status'<>'saved' THEN RAISE EXCEPTION 'new attendance not confirmed'; END IF;
 result:=public.sync_owned_worship(a,c,'rollback-preserve-20261125','2026-11-25','08:00','[ficticio]','culto');
 IF result->>'status'<>'saved' THEN RAISE EXCEPTION 'new worship not confirmed'; END IF;
END $$;
COMMIT;
