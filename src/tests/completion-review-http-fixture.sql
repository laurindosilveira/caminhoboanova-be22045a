-- Synthetic fixture only for the isolated PostgREST/IndexedDB test.
DO $$
DECLARE church uuid; area text; lesson uuid; course uuid;
BEGIN
 SELECT p.church_id,p.area::text INTO STRICT church,area FROM public.profiles p WHERE p.user_id='00000000-0000-0000-0000-000000000201';
 SELECT l.id,l.course_id INTO STRICT lesson,course FROM public.lesson_responses r JOIN public.lessons l ON l.id=r.lesson_id WHERE r.user_id='00000000-0000-0000-0000-000000000201' LIMIT 1;
 INSERT INTO auth.users(id,instance_id,aud,role,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,recovery_token,email_change,email_change_token_new)
 VALUES('00000000-0000-0000-0000-000000000203','00000000-0000-0000-0000-000000000000','authenticated','authenticated','ensaio-lider-http@example.invalid',now(),'{"provider":"email","providers":["email"]}','{"full_name":"Lider ficticio","birth_date":"2000-01-01"}',now(),now(),'','','','');
 INSERT INTO public.turmas(id,name,year,church_id,area,is_active) VALUES('00000000-0000-0000-0000-000000000321','Turma ficticia',2026,church,area,true);
 UPDATE public.profiles SET turma_id='00000000-0000-0000-0000-000000000321',enrollment_status='approved',is_active=true WHERE user_id='00000000-0000-0000-0000-000000000201';
 UPDATE public.profiles SET church_id=church,enrollment_status='approved',is_active=true WHERE user_id='00000000-0000-0000-0000-000000000203';
 INSERT INTO public.user_roles(user_id,role,church_id) VALUES('00000000-0000-0000-0000-000000000203','lider',church);
 INSERT INTO public.turma_leaders(user_id,turma_id,church_id) VALUES('00000000-0000-0000-0000-000000000203','00000000-0000-0000-0000-000000000321',church);
 INSERT INTO public.user_course_entitlements(user_id,course_id,source) VALUES('00000000-0000-0000-0000-000000000201',course,'admin');
END $$;
