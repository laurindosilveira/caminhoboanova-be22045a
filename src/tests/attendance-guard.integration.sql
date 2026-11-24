-- Synthetic identities and events only, in the disposable local database.
BEGIN;
DO $$
DECLARE church uuid; area text;
BEGIN
 SELECT p.church_id,p.area::text INTO STRICT church,area FROM public.profiles p WHERE p.user_id='00000000-0000-0000-0000-000000000201';
 INSERT INTO public.turmas(id,name,year,church_id,area,is_active) VALUES('00000000-0000-0000-0000-000000000301','Grupo ficticio',2026,church,area,true),
   ('00000000-0000-0000-0000-000000000302','Outro grupo ficticio',2026,church,area,true);
 UPDATE public.profiles SET turma_id='00000000-0000-0000-0000-000000000301' WHERE user_id='00000000-0000-0000-0000-000000000201';
 INSERT INTO public.events(id,title,event_date,type,church_id,turma_id,area) VALUES
 ('00000000-0000-0000-0000-000000000501','Evento ficticio',now(),'confirmatorio',church,'00000000-0000-0000-0000-000000000301',area),
 ('00000000-0000-0000-0000-000000000502','Evento outro grupo',now(),'confirmatorio',church,'00000000-0000-0000-0000-000000000302',area);
 PERFORM set_config('test.att_church',church::text,true);
END $$;
SET LOCAL ROLE authenticated;
DO $$
DECLARE a uuid:='00000000-0000-0000-0000-000000000201'; b uuid:='00000000-0000-0000-0000-000000000202';
 event_id uuid:='00000000-0000-0000-0000-000000000501'; church uuid:=current_setting('test.att_church')::uuid; result jsonb;
BEGIN
 PERFORM set_config('request.jwt.claim.sub',b::text,true);
 BEGIN PERFORM public.sync_owned_attendance(a,church,event_id,'pendente_presente','2026-01-01T10:00:00Z',NULL);
   RAISE EXCEPTION 'other account accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 PERFORM set_config('request.jwt.claim.sub',a::text,true);
 BEGIN
   INSERT INTO public.attendance(user_id,church_id,event_id,status,leader_confirmed_at)
   VALUES(a,church,event_id,'presente',now());
   RAISE EXCEPTION 'student created a confirmed attendance';
 EXCEPTION WHEN SQLSTATE '55000' THEN NULL; END;
 result:=public.sync_owned_attendance(a,church,'00000000-0000-0000-0000-000000000502','pendente_presente','2026-01-01T10:00:00Z',NULL);
 IF result->>'status'<>'scope_review_required' THEN RAISE EXCEPTION 'another group accepted'; END IF;
 result:=public.sync_owned_attendance(a,church,event_id,'pendente_presente','2026-01-01T10:00:00Z',NULL);
 IF result->>'status'<>'saved' THEN RAISE EXCEPTION 'pending attendance failed'; END IF;
 BEGIN UPDATE public.attendance SET status='pendente_falta' WHERE user_id=a AND attendance.event_id='00000000-0000-0000-0000-000000000501';
   RAISE EXCEPTION 'old client overwrote pending request'; EXCEPTION WHEN SQLSTATE '55000' THEN NULL; END;
 result:=public.sync_owned_attendance(a,church,event_id,'pendente_falta','2026-01-01T11:00:00Z','[justificativa ficticia]','pendente_presente','2026-01-01T10:00:00Z');
 IF result->>'status'<>'saved' THEN RAISE EXCEPTION 'new pending request failed'; END IF;
 result:=public.sync_owned_attendance(a,church,event_id,'pendente_presente','2026-01-01T10:00:00Z',NULL);
 IF result->>'status'<>'newer_request' THEN RAISE EXCEPTION 'old pending request replaced a newer one'; END IF;
END $$;
RESET ROLE;
UPDATE public.attendance SET status='presente',leader_confirmed_at=now(),confirmed_by='00000000-0000-0000-0000-000000000202'
 WHERE user_id='00000000-0000-0000-0000-000000000201' AND event_id='00000000-0000-0000-0000-000000000501';
SET LOCAL ROLE authenticated;
DO $$
DECLARE a uuid:='00000000-0000-0000-0000-000000000201'; v_event_id uuid:='00000000-0000-0000-0000-000000000501'; result jsonb;
BEGIN
 PERFORM set_config('request.jwt.claim.sub',a::text,true);
 result:=public.sync_owned_attendance(a,current_setting('test.att_church')::uuid,v_event_id,'pendente_falta',now(),'[pedido ficticio]');
 IF result->>'status'<>'finalized' OR result->>'current_status'<>'presente' THEN RAISE EXCEPTION 'confirmed attendance overwritten'; END IF;
 BEGIN UPDATE public.attendance SET status='pendente_falta' WHERE user_id=a AND attendance.event_id=v_event_id;
   RAISE EXCEPTION 'old direct update accepted'; EXCEPTION WHEN SQLSTATE '55000' THEN NULL; END;
 BEGIN DELETE FROM public.attendance WHERE user_id=a AND attendance.event_id=v_event_id;
   RAISE EXCEPTION 'confirmed attendance deleted'; EXCEPTION WHEN SQLSTATE '55000' THEN NULL; END;
 result:=public.sync_owned_worship(a,current_setting('test.att_church')::uuid,'fixture-worship','2026-01-01','10:00','[evento ficticio]','culto');
 IF result->>'status'<>'saved' THEN RAISE EXCEPTION 'worship request was not saved'; END IF;
 result:=public.sync_owned_worship(a,current_setting('test.att_church')::uuid,'fixture-worship','2026-01-01','10:00','[evento ficticio]','culto');
 IF result->>'status'<>'saved' THEN RAISE EXCEPTION 'worship retry failed'; END IF;
 BEGIN PERFORM public.sync_owned_worship(a,current_setting('test.att_church')::uuid,'fixture-worship','2026-01-02','10:00','[evento ficticio]','culto');
   RAISE EXCEPTION 'changed worship action accepted'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 result:=public.sync_owned_worship(a,NULL,'unknown-church','2026-01-01','10:00','[evento ficticio]','culto');
 IF result->>'status'<>'scope_review_required' THEN RAISE EXCEPTION 'unknown church accepted'; END IF;
 PERFORM set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000202',true);
 BEGIN PERFORM public.sync_owned_worship(a,current_setting('test.att_church')::uuid,'other-account','2026-01-01','10:00','[evento ficticio]','culto');
   RAISE EXCEPTION 'other account created worship request'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.attendance WHERE user_id='00000000-0000-0000-0000-000000000201'
   AND event_id='00000000-0000-0000-0000-000000000501' AND status='presente') THEN RAISE EXCEPTION 'final attendance missing'; END IF;
 IF (SELECT count(*) FROM private.offline_worship_receipts WHERE user_id='00000000-0000-0000-0000-000000000201' AND action_id='fixture-worship')<>1 THEN
   RAISE EXCEPTION 'worship retry duplicated receipt'; END IF;
 IF (SELECT count(*) FROM public.worship_attendance WHERE user_id='00000000-0000-0000-0000-000000000201' AND worship_date='2026-01-01' AND event_type='culto')<>1 THEN
   RAISE EXCEPTION 'worship retry created duplicate attendance'; END IF;
END $$;
ROLLBACK;
