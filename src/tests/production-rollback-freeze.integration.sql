-- Synthetic user and event; executed only inside the local disposable copy.
BEGIN;
DO $$ DECLARE c uuid; BEGIN
 SELECT church_id INTO STRICT c FROM public.profiles WHERE user_id='00000000-0000-0000-0000-000000000201';
 INSERT INTO public.events(id,title,event_date,type,church_id)
 VALUES('00000000-0000-0000-0000-000000000521','Evento ficticio reversao',now(),'confirmatorio',c);
 PERFORM set_config('test.rollback_church',c::text,true);
END $$;
SET LOCAL ROLE authenticated;
DO $$
DECLARE a uuid:='00000000-0000-0000-0000-000000000201'; c uuid:=current_setting('test.rollback_church')::uuid;
BEGIN
 PERFORM set_config('request.jwt.claim.sub',a::text,true);
 BEGIN
   INSERT INTO public.attendance(user_id,church_id,event_id,status)
   VALUES(a,c,'00000000-0000-0000-0000-000000000521','pendente_presente');
   RAISE EXCEPTION 'attendance accepted during rollback pause';
 EXCEPTION WHEN SQLSTATE '55000' THEN NULL; END;
 BEGIN
   INSERT INTO public.worship_attendance(user_id,church_id,worship_date,worship_time,preacher_name,event_type,status)
   VALUES(a,c,'2026-01-01','10:00','[evento ficticio]','culto','pendente');
   RAISE EXCEPTION 'worship accepted during rollback pause';
 EXCEPTION WHEN SQLSTATE '55000' THEN NULL; END;
END $$;
RESET ROLE;
ROLLBACK;
