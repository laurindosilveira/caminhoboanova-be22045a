-- Synthetic identities and answers only; rolled back in the isolated copy.
BEGIN;
DO $$
DECLARE a uuid:='00000000-0000-0000-0000-000000000201'; b uuid:='00000000-0000-0000-0000-000000000202';
  item uuid; question text; previous text; result jsonb;
BEGIN
  IF has_function_privilege('anon','public.sync_owned_learning(uuid,text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb)','EXECUTE')
    OR NOT has_function_privilege('authenticated','public.sync_owned_learning(uuid,text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb)','EXECUTE') THEN
    RAISE EXCEPTION 'incorrect wrapper privileges';
  END IF;
  SELECT lesson_id,question_key,response INTO STRICT item,question,previous FROM public.lesson_responses WHERE user_id=a LIMIT 1;
  PERFORM set_config('request.jwt.claim.sub',b::text,true);
  BEGIN
    PERFORM public.sync_owned_learning(a,'save_lesson_draft',item,jsonb_build_object(question,'[conta errada]'),false,false,false,NULL,NULL,jsonb_build_object(question,previous));
    RAISE EXCEPTION 'different account accepted';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  IF NOT EXISTS(SELECT 1 FROM public.lesson_responses WHERE user_id=a AND lesson_id=item AND question_key=question AND response=previous) THEN
    RAISE EXCEPTION 'other account changed original answer';
  END IF;
  PERFORM set_config('request.jwt.claim.sub',a::text,true);
  result:=public.sync_owned_learning(a,'save_lesson_draft',item,jsonb_build_object(question,'[conta correta]'),false,false,false,NULL,NULL,jsonb_build_object(question,previous));
  IF result->>'status'<>'synced' THEN RAISE EXCEPTION 'correct account not synced'; END IF;
END $$;
ROLLBACK;
