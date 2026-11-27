-- Isolated synthetic data only. All changes roll back.
BEGIN;
DO $$
DECLARE church uuid; area text;
BEGIN
 SELECT p.church_id,p.area::text INTO STRICT church,area FROM public.profiles p WHERE p.user_id='00000000-0000-0000-0000-000000000201';
 INSERT INTO public.turmas(id,name,year,church_id,area,is_active) VALUES
 ('00000000-0000-0000-0000-000000000311','Turma de origem',2026,church,area,true),
 ('00000000-0000-0000-0000-000000000312','Turma de destino',2026,church,area,true);
 UPDATE public.profiles SET turma_id='00000000-0000-0000-0000-000000000311',enrollment_status='approved',is_active=true
 WHERE user_id='00000000-0000-0000-0000-000000000201';
 INSERT INTO public.user_course_entitlements(user_id,course_id,source)
 SELECT '00000000-0000-0000-0000-000000000201',l.course_id,'admin' FROM public.lesson_responses r JOIN public.lessons l ON l.id=r.lesson_id
 WHERE r.user_id='00000000-0000-0000-0000-000000000201' LIMIT 1;
 PERFORM set_config('test.completion_version',(SELECT version::text FROM private.learning_membership_version WHERE user_id='00000000-0000-0000-0000-000000000201'),true);
 PERFORM set_config('test.completion_church',church::text,true);
 PERFORM set_config('test.completion_area',area,true);
END $$;
SET LOCAL ROLE authenticated;
DO $$
DECLARE owner_id uuid:='00000000-0000-0000-0000-000000000201'; item uuid; question text; old_answer text; r jsonb; answers jsonb; i integer;
BEGIN
 PERFORM set_config('request.jwt.claim.sub',owner_id::text,true);
 SELECT lesson_id,question_key,response INTO STRICT item,question,old_answer FROM public.lesson_responses WHERE user_id=owner_id LIMIT 1;
 r:=public.sync_owned_learning(owner_id,'complete_lesson',item,jsonb_build_object(question,old_answer),false,false,false,NULL,NULL,jsonb_build_object(question,old_answer));
 IF r->>'status'<>'scope_review_required' THEN RAISE EXCEPTION 'old unscoped completion was accepted'; END IF;
 r:=public.sync_owned_completion(owner_id,current_setting('test.completion_church')::uuid,'00000000-0000-0000-0000-000000000312',current_setting('test.completion_area'),current_setting('test.completion_version')::uuid,
 'complete_lesson',item,jsonb_build_object(question,old_answer),false,false,false,NULL,NULL,jsonb_build_object(question,old_answer));
 IF r->>'status'<>'scope_review_required' THEN RAISE EXCEPTION 'wrong group was accepted'; END IF;
 answers:=jsonb_build_object(question,old_answer,'icebreaker','[ficticio]','practice','[ficticio]','prayer','[ficticio]');
 FOR i IN 0..50 LOOP answers:=answers||jsonb_build_object('q'||i,'[ficticio]'); END LOOP;
 r:=public.sync_owned_completion(owner_id,current_setting('test.completion_church')::uuid,'00000000-0000-0000-0000-000000000311',current_setting('test.completion_area'),current_setting('test.completion_version')::uuid,
   'complete_lesson',item,answers,true,true,false,NULL,NULL,jsonb_build_object(question,old_answer));
 IF r->>'status'<>'synced' THEN RAISE EXCEPTION 'matching scope was not accepted'; END IF;
 PERFORM set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000202',true);
 BEGIN
  PERFORM public.sync_owned_completion(owner_id,current_setting('test.completion_church')::uuid,'00000000-0000-0000-0000-000000000311',current_setting('test.completion_area'),current_setting('test.completion_version')::uuid,
   'complete_lesson',item,'{}',false,false,false,NULL,NULL,'{}');
  RAISE EXCEPTION 'other owner was accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
UPDATE public.profiles SET turma_id='00000000-0000-0000-0000-000000000312' WHERE user_id='00000000-0000-0000-0000-000000000201';
UPDATE public.profiles SET turma_id='00000000-0000-0000-0000-000000000311' WHERE user_id='00000000-0000-0000-0000-000000000201';
SET LOCAL ROLE authenticated;
DO $$
DECLARE owner_id uuid:='00000000-0000-0000-0000-000000000201'; item uuid; r jsonb;
BEGIN
 PERFORM set_config('request.jwt.claim.sub',owner_id::text,true);
 SELECT lesson_id INTO STRICT item FROM public.lesson_responses WHERE user_id=owner_id LIMIT 1;
 r:=public.sync_owned_completion(owner_id,current_setting('test.completion_church')::uuid,'00000000-0000-0000-0000-000000000311',current_setting('test.completion_area'),current_setting('test.completion_version')::uuid,
 'complete_lesson',item,'{}',false,false,false,NULL,NULL,'{}');
 IF r->>'status'<>'scope_review_required' THEN RAISE EXCEPTION 'completion accepted after transfer and return'; END IF;
END $$;

RESET ROLE;
UPDATE public.turmas SET area=NULL WHERE id='00000000-0000-0000-0000-000000000311';
SET LOCAL ROLE authenticated;
DO $$
DECLARE owner_id uuid:='00000000-0000-0000-0000-000000000201';
BEGIN
 PERFORM set_config('request.jwt.claim.sub',owner_id::text,true);
 IF public.get_owned_learning_scope(owner_id) IS NOT NULL THEN
   RAISE EXCEPTION 'an explicitly assigned area was inferred from an unassigned group';
 END IF;
END $$;

RESET ROLE;
DO $$
DECLARE owner_id uuid:='00000000-0000-0000-0000-000000000201'; church uuid:=gen_random_uuid(); item uuid; question text;
BEGIN
 INSERT INTO public.churches(id,name,slug,is_active) VALUES(church,'Igreja ficticia sem areas','church-without-areas-probe',true);
 INSERT INTO public.turmas(id,name,year,church_id,area,is_active)
 VALUES('00000000-0000-0000-0000-000000000313','Turma ficticia sem area',2026,church,NULL,true);
 SELECT lesson_id,question_key INTO STRICT item,question FROM public.lesson_responses WHERE user_id=owner_id LIMIT 1;
 PERFORM set_config('test.noarea_item',item::text,true);
 PERFORM set_config('test.noarea_question',question,true);
 UPDATE public.profiles SET church_id=church,turma_id='00000000-0000-0000-0000-000000000313',area='Sem area' WHERE user_id=owner_id;
END $$;
SET LOCAL ROLE authenticated;
DO $$
DECLARE owner_id uuid:='00000000-0000-0000-0000-000000000201'; scope jsonb; result jsonb;
        item uuid:=current_setting('test.noarea_item')::uuid; question text:=current_setting('test.noarea_question');
BEGIN
 PERFORM set_config('request.jwt.claim.sub',owner_id::text,true);
 scope:=public.get_owned_learning_scope(owner_id);
 IF scope->>'area' IS DISTINCT FROM 'Sem area' OR scope->>'turmaId' IS DISTINCT FROM '00000000-0000-0000-0000-000000000313' THEN
   RAISE EXCEPTION 'a church without areas lost its valid group scope';
 END IF;
 result:=public.sync_owned_completion(owner_id,(scope->>'churchId')::uuid,(scope->>'turmaId')::uuid,scope->>'area',(scope->>'membershipVersion')::uuid,
   'complete_lesson',item,jsonb_build_object(question,'[ficticio]'),false,false,false,NULL,NULL,jsonb_build_object(question,'[versao de teste anterior]'));
 IF result->>'status' IS DISTINCT FROM 'conflict' THEN
   RAISE EXCEPTION 'the unassigned scope did not reach normal conflict review';
 END IF;
END $$;
ROLLBACK;
