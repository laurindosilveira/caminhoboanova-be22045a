-- Synthetic fixture, only inside the disposable local restored database.
DO $$
DECLARE c uuid; l uuid;
BEGIN
  SELECT id INTO c FROM public.churches ORDER BY id LIMIT 1;
  SELECT id INTO l FROM public.lessons ORDER BY id LIMIT 1;
  IF c IS NULL OR l IS NULL THEN RAISE EXCEPTION 'Missing local fixture prerequisites'; END IF;
  INSERT INTO auth.users(id,instance_id,aud,role,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,recovery_token,email_change,email_change_token_new)
  VALUES
  ('00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000000','authenticated','authenticated','ensaio-unificado-a@example.invalid',now(),'{"provider":"email","providers":["email"]}','{"full_name":"Conta ficticia A","birth_date":"2000-01-01"}',now(),now(),'','','',''),
  ('00000000-0000-0000-0000-000000000202','00000000-0000-0000-0000-000000000000','authenticated','authenticated','ensaio-unificado-b@example.invalid',now(),'{"provider":"email","providers":["email"]}','{"full_name":"Conta ficticia B","birth_date":"2000-01-01"}',now(),now(),'','','','');
  UPDATE public.profiles SET church_id=c WHERE user_id IN ('00000000-0000-0000-0000-000000000201','00000000-0000-0000-0000-000000000202');
  INSERT INTO public.lesson_responses(user_id,lesson_id,question_key,response,church_id)
    VALUES('00000000-0000-0000-0000-000000000201',l,'__ensaio_unificado__','[resposta atual ficticia]',c);
END $$;
