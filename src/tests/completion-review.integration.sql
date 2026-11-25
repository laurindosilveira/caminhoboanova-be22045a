-- Synthetic users and activity only. Nothing leaves the isolated database.
BEGIN;
DO $$
DECLARE church uuid; area text; lesson uuid;
BEGIN
 SELECT p.church_id,p.area::text INTO STRICT church,area FROM public.profiles p WHERE p.user_id='00000000-0000-0000-0000-000000000201';
 SELECT lesson_id INTO STRICT lesson FROM public.lesson_responses WHERE user_id='00000000-0000-0000-0000-000000000201' LIMIT 1;
 INSERT INTO auth.users(id,instance_id,aud,role,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,recovery_token,email_change,email_change_token_new)
 VALUES('00000000-0000-0000-0000-000000000203','00000000-0000-0000-0000-000000000000','authenticated','authenticated','ensaio-lider@example.invalid',now(),'{"provider":"email","providers":["email"]}','{"full_name":"Lider ficticio","birth_date":"2000-01-01"}',now(),now(),'','','','');
 INSERT INTO public.turmas(id,name,year,church_id,area,is_active) VALUES
 ('00000000-0000-0000-0000-000000000321','Turma ficticia',2026,church,area,true),
 ('00000000-0000-0000-0000-000000000322','Outra turma',2026,church,area,true);
 UPDATE public.profiles SET turma_id='00000000-0000-0000-0000-000000000321',enrollment_status='approved',is_active=true
 WHERE user_id='00000000-0000-0000-0000-000000000201';
 UPDATE public.profiles SET church_id=church,enrollment_status='approved',is_active=true WHERE user_id='00000000-0000-0000-0000-000000000203';
 UPDATE public.profiles SET church_id=church,enrollment_status='approved',is_active=true WHERE user_id='00000000-0000-0000-0000-000000000202';
 INSERT INTO public.user_roles(user_id,role,church_id) VALUES('00000000-0000-0000-0000-000000000202','lider',church);
 INSERT INTO public.turma_leaders(user_id,turma_id,church_id) VALUES('00000000-0000-0000-0000-000000000202','00000000-0000-0000-0000-000000000322',church);
 INSERT INTO public.user_roles(user_id,role,church_id) VALUES('00000000-0000-0000-0000-000000000203','lider',church);
 INSERT INTO public.turma_leaders(user_id,turma_id,church_id) VALUES('00000000-0000-0000-0000-000000000203','00000000-0000-0000-0000-000000000321',church);
 PERFORM set_config('test.review_lesson',lesson::text,true);
END $$;
SET LOCAL ROLE authenticated;
DO $$
DECLARE student uuid:='00000000-0000-0000-0000-000000000201'; leader uuid:='00000000-0000-0000-0000-000000000203';
 outsider uuid:='00000000-0000-0000-0000-000000000202'; review_id uuid; result jsonb;
BEGIN
 PERFORM set_config('request.jwt.claim.sub',student::text,true);
 result:=public.request_completion_review('synthetic-review','complete_lesson',current_setting('test.review_lesson')::uuid);
 IF result->>'status'<>'pending' THEN RAISE EXCEPTION 'request not pending'; END IF;
 BEGIN PERFORM public.request_completion_review('synthetic-review','complete_lesson',gen_random_uuid());
   RAISE EXCEPTION 'altered action accepted'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 PERFORM set_config('request.jwt.claim.sub',outsider::text,true);
 IF EXISTS(SELECT 1 FROM public.list_completion_reviews('00000000-0000-0000-0000-000000000321')) THEN RAISE EXCEPTION 'outsider saw review'; END IF;
 PERFORM set_config('request.jwt.claim.sub',leader::text,true);
 SELECT id INTO STRICT review_id FROM public.list_completion_reviews('00000000-0000-0000-0000-000000000321');
 PERFORM set_config('test.review_id',review_id::text,true);
 PERFORM set_config('request.jwt.claim.sub',outsider::text,true);
 BEGIN PERFORM public.approve_completion_review(review_id,true); RAISE EXCEPTION 'outsider approved'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 PERFORM set_config('request.jwt.claim.sub',student::text,true);
 BEGIN PERFORM public.approve_completion_review(review_id,true); RAISE EXCEPTION 'student self-approved'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 PERFORM set_config('request.jwt.claim.sub',leader::text,true);
 result:=public.approve_completion_review(review_id,true);
 IF result->>'status'<>'approved' THEN RAISE EXCEPTION 'authorized review failed'; END IF;
 PERFORM set_config('request.jwt.claim.sub',student::text,true);
 result:=public.request_completion_review('synthetic-review','complete_lesson',current_setting('test.review_lesson')::uuid);
 IF result->>'status'<>'approved' OR result->'scope'->>'membershipVersion' IS NULL THEN RAISE EXCEPTION 'approved scope not returned'; END IF;
END $$;
RESET ROLE;
UPDATE public.profiles SET turma_id='00000000-0000-0000-0000-000000000322' WHERE user_id='00000000-0000-0000-0000-000000000201';
UPDATE public.profiles SET turma_id='00000000-0000-0000-0000-000000000321' WHERE user_id='00000000-0000-0000-0000-000000000201';
SET LOCAL ROLE authenticated;
DO $$
DECLARE result jsonb;
BEGIN
 PERFORM set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000201',true);
 result:=public.request_completion_review('synthetic-review','complete_lesson',current_setting('test.review_lesson')::uuid);
 IF result->>'status'<>'pending' OR result->'scope'<>'null'::jsonb THEN RAISE EXCEPTION 'old approval reused after transfer'; END IF;
END $$;
RESET ROLE;
UPDATE public.profiles SET is_active=false WHERE user_id='00000000-0000-0000-0000-000000000203';
SET LOCAL ROLE authenticated;
DO $$ BEGIN
 PERFORM set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000203',true);
 IF EXISTS(SELECT 1 FROM public.list_completion_reviews('00000000-0000-0000-0000-000000000321')) THEN RAISE EXCEPTION 'inactive leader saw review'; END IF;
 BEGIN PERFORM public.approve_completion_review(current_setting('test.review_id')::uuid,true);
  RAISE EXCEPTION 'inactive leader approved review'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
ROLLBACK;
