-- Synthetic identities only. The existing historical record remains with A.
BEGIN;
INSERT INTO public.user_roles(user_id, role, church_id)
SELECT p.user_id, 'lider', p.church_id FROM public.profiles p
WHERE p.user_id = '00000000-0000-0000-0000-000000000202'
ON CONFLICT DO NOTHING;
INSERT INTO public.user_roles(user_id, role, church_id)
SELECT p.user_id, 'admin', p.church_id FROM public.profiles p
WHERE p.user_id = '00000000-0000-0000-0000-000000000202'
ON CONFLICT DO NOTHING;
DO $$
DECLARE c uuid; d uuid;
BEGIN
  SELECT church_id INTO STRICT c FROM public.profiles WHERE user_id='00000000-0000-0000-0000-000000000201';
  INSERT INTO auth.users(id,instance_id,aud,role,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,recovery_token,email_change,email_change_token_new)
  VALUES ('00000000-0000-0000-0000-000000000203','00000000-0000-0000-0000-000000000000','authenticated','authenticated','lider-ensaio@example.invalid',now(),'{"provider":"email","providers":["email"]}','{"full_name":"Lider ficticio","birth_date":"2000-01-01"}',now(),now(),'','','','');
  UPDATE public.profiles SET church_id=c WHERE user_id='00000000-0000-0000-0000-000000000203';
  INSERT INTO public.user_roles(user_id,role,church_id) VALUES('00000000-0000-0000-0000-000000000203','lider',c) ON CONFLICT DO NOTHING;
  SELECT id INTO STRICT d FROM public.devotional_content WHERE church_id IS NULL OR church_id=c LIMIT 1;
  INSERT INTO public.devotional_progress(user_id,devotional_id,church_id)
    VALUES('00000000-0000-0000-0000-000000000201',d,c);
  INSERT INTO public.devotional_responses(user_id,devotional_id,church_id,question_index,response)
    VALUES('00000000-0000-0000-0000-000000000201',d,c,0,'[devocional ficticio]');
  INSERT INTO public.turmas(id,name,year,church_id,area,is_active) VALUES
    ('00000000-0000-0000-0000-000000000311','Turma ficticia 1',2026,c,'Área 1',true),
    ('00000000-0000-0000-0000-000000000312','Turma ficticia 2',2026,c,'Área 2',true);
  INSERT INTO public.turma_leaders(turma_id,user_id,church_id) VALUES
    ('00000000-0000-0000-0000-000000000311','00000000-0000-0000-0000-000000000203',c),
    ('00000000-0000-0000-0000-000000000312','00000000-0000-0000-0000-000000000202',c);
  UPDATE public.profiles SET turma_id='00000000-0000-0000-0000-000000000311',area='Área 1'
    WHERE user_id IN ('00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000202');
  UPDATE public.profiles SET enrollment_status='active'
    WHERE user_id='00000000-0000-0000-0000-000000000201';
END $$;
SET LOCAL ROLE authenticated;
DO $$
DECLARE n integer; affected integer;
BEGIN
  PERFORM set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000201',true);
  SELECT count(*) INTO n FROM public.lesson_responses
    WHERE user_id='00000000-0000-0000-0000-000000000201' AND question_key='__ensaio_unificado__';
  IF n <> 1 THEN RAISE EXCEPTION 'owner could not read own historical answer'; END IF;
  SELECT count(*) INTO n FROM public.devotional_responses
    WHERE user_id='00000000-0000-0000-0000-000000000201' AND response='[devocional ficticio]';
  IF n <> 1 THEN RAISE EXCEPTION 'owner could not read own devotional answer'; END IF;
  PERFORM set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000202',true);
  SELECT count(*) INTO n FROM public.lesson_responses
    WHERE user_id='00000000-0000-0000-0000-000000000201' AND question_key='__ensaio_unificado__';
  IF n <> 0 THEN RAISE EXCEPTION 'other user could read historical answer'; END IF;
  SELECT count(*) INTO n FROM public.devotional_responses
    WHERE user_id='00000000-0000-0000-0000-000000000201';
  IF n <> 0 THEN RAISE EXCEPTION 'leader could read devotional answer'; END IF;
  DELETE FROM public.lesson_responses;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'leader deleted protected answers'; END IF;
  DELETE FROM public.devotional_responses;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'leader deleted protected devotional answers'; END IF;
  DELETE FROM public.devotional_progress WHERE user_id='00000000-0000-0000-0000-000000000201';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'leader deleted protected devotional progress'; END IF;
  DELETE FROM public.lesson_progress WHERE user_id='00000000-0000-0000-0000-000000000201';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'leader deleted protected lesson progress'; END IF;
  IF has_function_privilege('authenticated','public.reset_turma_journey(uuid)','EXECUTE') THEN
    RAISE EXCEPTION 'old reset remains callable';
  END IF;
  PERFORM set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000203',true);
  SELECT count(*) INTO n FROM public.get_leader_participant_summaries('00000000-0000-0000-0000-000000000311',NULL,NULL)
    WHERE user_id='00000000-0000-0000-0000-000000000201';
  IF n <> 1 THEN RAISE EXCEPTION 'leader cannot see assigned student before transfer'; END IF;
  SELECT count(*) INTO n FROM public.get_leader_care_dashboard('00000000-0000-0000-0000-000000000311',NULL,NULL)
    WHERE user_id='00000000-0000-0000-0000-000000000201';
  IF n <> 1 THEN RAISE EXCEPTION 'care dashboard omitted assigned student before transfer'; END IF;
END $$;
RESET ROLE;
UPDATE public.profiles SET turma_id='00000000-0000-0000-0000-000000000312',area='Área 2'
  WHERE user_id='00000000-0000-0000-0000-000000000201';
SET LOCAL ROLE authenticated;
DO $$
DECLARE n integer;
BEGIN
  PERFORM set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000201',true);
  SELECT count(*) INTO n FROM public.lesson_responses WHERE user_id=auth.uid() AND question_key='__ensaio_unificado__';
  IF n <> 1 THEN RAISE EXCEPTION 'transferred owner cannot see own answer'; END IF;
  SELECT count(*) INTO n FROM public.devotional_responses WHERE user_id=auth.uid() AND response='[devocional ficticio]';
  IF n <> 1 THEN RAISE EXCEPTION 'transferred owner cannot see own devotional'; END IF;
  PERFORM set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000202',true);
  SELECT count(*) INTO n FROM public.lesson_responses WHERE user_id='00000000-0000-0000-0000-000000000201';
  IF n <> 0 THEN RAISE EXCEPTION 'old leader read transferred student answer'; END IF;
  PERFORM set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000203',true);
  SELECT count(*) INTO n FROM public.get_leader_participant_summaries('00000000-0000-0000-0000-000000000311',NULL,NULL)
    WHERE user_id='00000000-0000-0000-0000-000000000201';
  IF n <> 0 THEN RAISE EXCEPTION 'transferred student remained visible in old group summary'; END IF;
  SELECT count(*) INTO n FROM public.get_leader_care_dashboard('00000000-0000-0000-0000-000000000311',NULL,NULL)
    WHERE user_id='00000000-0000-0000-0000-000000000201';
  IF n <> 0 THEN RAISE EXCEPTION 'transferred student remained in old care dashboard'; END IF;
  BEGIN
    PERFORM * FROM public.get_leader_participant_summaries('00000000-0000-0000-0000-000000000312',NULL,NULL);
    RAISE EXCEPTION 'leader accessed another group summary';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    PERFORM * FROM public.get_leader_care_dashboard('00000000-0000-0000-0000-000000000312',NULL,NULL);
    RAISE EXCEPTION 'leader accessed another group care dashboard';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
UPDATE public.profiles SET turma_id='00000000-0000-0000-0000-000000000312',area='Área 2'
  WHERE user_id='00000000-0000-0000-0000-000000000202';
SET LOCAL ROLE authenticated;
DO $$
DECLARE n integer;
BEGIN
  PERFORM set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000202',true);
  SELECT count(*) INTO n FROM public.lesson_responses WHERE user_id='00000000-0000-0000-0000-000000000201';
  IF n <> 0 THEN RAISE EXCEPTION 'new group leader read earlier answer'; END IF;
  SELECT count(*) INTO n FROM public.devotional_responses WHERE user_id='00000000-0000-0000-0000-000000000201';
  IF n <> 0 THEN RAISE EXCEPTION 'new group leader read earlier devotional'; END IF;
END $$;
RESET ROLE;
UPDATE public.profiles SET is_active=false WHERE user_id='00000000-0000-0000-0000-000000000201';
SET LOCAL ROLE authenticated;
DO $$
DECLARE n integer;
BEGIN
  PERFORM set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000201',true);
  SELECT count(*) INTO n FROM public.lesson_responses WHERE user_id=auth.uid();
  IF n <> 0 THEN RAISE EXCEPTION 'inactive account read answer'; END IF;
END $$;
RESET ROLE;
ROLLBACK;
