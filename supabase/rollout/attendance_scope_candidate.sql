-- REVIEW CANDIDATE ONLY. This file is tested locally and is not an automatic migration.
-- Preserve a leader's final decision even if an old client retries later.
CREATE TABLE private.attendance_write_guard (
  transaction_id bigint NOT NULL, user_id uuid NOT NULL, event_id uuid NOT NULL,
  PRIMARY KEY(transaction_id,user_id,event_id)
);
ALTER TABLE private.attendance_write_guard ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.attendance_write_guard FROM PUBLIC,anon,authenticated;
CREATE FUNCTION private.guard_own_final_attendance()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF TG_OP='INSERT' THEN
    IF pg_catalog.current_setting('role',true)='authenticated' AND auth.uid()=NEW.user_id
       AND (NEW.status NOT IN ('pendente_presente','pendente_falta') OR NEW.status IS NULL
            OR NEW.leader_confirmed_at IS NOT NULL OR NEW.confirmed_by IS NOT NULL) THEN
      RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='ATTENDANCE_REQUIRES_LEADER_CONFIRMATION';
    END IF;
    IF pg_catalog.current_setting('role',true)='authenticated' AND auth.uid()=NEW.user_id
       AND NOT EXISTS(SELECT 1 FROM private.attendance_write_guard g WHERE g.transaction_id=pg_catalog.txid_current()
         AND g.user_id=NEW.user_id AND g.event_id=NEW.event_id) THEN
      RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='ATTENDANCE_UPDATE_REQUIRES_REVIEW';
    END IF;
    RETURN NEW;
  END IF;
  IF pg_catalog.current_setting('role',true)='authenticated' AND auth.uid()=OLD.user_id
     AND (OLD.leader_confirmed_at IS NOT NULL OR OLD.status IN ('presente','faltou','falta','justificou','justificado')) THEN
    IF TG_OP='DELETE' OR (TG_OP='UPDATE' AND (
      NEW.status IS DISTINCT FROM OLD.status OR NEW.justification IS DISTINCT FROM OLD.justification
      OR NEW.confirmation_source IS DISTINCT FROM OLD.confirmation_source
      OR NEW.user_requested_at IS DISTINCT FROM OLD.user_requested_at
      OR NEW.leader_confirmed_at IS DISTINCT FROM OLD.leader_confirmed_at
      OR NEW.confirmed_by IS DISTINCT FROM OLD.confirmed_by OR NEW.event_id IS DISTINCT FROM OLD.event_id
      OR NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.church_id IS DISTINCT FROM OLD.church_id)) THEN
      RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='ATTENDANCE_ALREADY_FINAL';
    END IF;
  END IF;
  IF pg_catalog.current_setting('role',true)='authenticated' AND auth.uid()=OLD.user_id
     AND (TG_OP='DELETE' OR (TG_OP='UPDATE' AND (
       NEW.status IS DISTINCT FROM OLD.status OR NEW.justification IS DISTINCT FROM OLD.justification
       OR NEW.confirmation_source IS DISTINCT FROM OLD.confirmation_source
       OR NEW.user_requested_at IS DISTINCT FROM OLD.user_requested_at
       OR NEW.leader_confirmed_at IS DISTINCT FROM OLD.leader_confirmed_at
       OR NEW.confirmed_by IS DISTINCT FROM OLD.confirmed_by OR NEW.event_id IS DISTINCT FROM OLD.event_id
       OR NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.church_id IS DISTINCT FROM OLD.church_id)))
     AND NOT EXISTS(SELECT 1 FROM private.attendance_write_guard g WHERE g.transaction_id=pg_catalog.txid_current()
       AND g.user_id=OLD.user_id AND g.event_id=OLD.event_id) THEN
    RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='ATTENDANCE_UPDATE_REQUIRES_REVIEW';
  END IF;
  RETURN CASE WHEN TG_OP='DELETE' THEN OLD ELSE NEW END;
END $$;
REVOKE ALL ON FUNCTION private.guard_own_final_attendance() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER aa_guard_own_final_attendance BEFORE INSERT OR UPDATE OR DELETE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION private.guard_own_final_attendance();

-- A queued request is never applied to another account, church or current
-- group. Event scope does not prove historical membership; the request stays
-- pending for a leader and is never treated as a confirmed attendance.
CREATE FUNCTION public.sync_owned_attendance(p_user_id uuid,p_church_id uuid,p_event_id uuid,p_status text,p_requested_at timestamptz,p_justification text DEFAULT NULL,p_expected_status text DEFAULT NULL,p_expected_requested_at timestamptz DEFAULT NULL,p_expected_justification text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE profile public.profiles%ROWTYPE; event public.events%ROWTYPE; existing public.attendance%ROWTYPE; saved uuid; manager boolean;
BEGIN
 IF auth.uid() IS NULL OR auth.uid() IS DISTINCT FROM p_user_id THEN
   RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='ATTENDANCE_ACCOUNT_CHANGED'; END IF;
 IF p_event_id IS NULL OR p_status IS NULL OR p_status NOT IN ('pendente_presente','pendente_falta')
   OR p_requested_at IS NULL OR (p_justification IS NOT NULL AND length(p_justification)>5000) THEN
   RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='INVALID_ATTENDANCE_REQUEST'; END IF;
 SELECT * INTO profile FROM public.profiles WHERE user_id=p_user_id FOR SHARE;
 IF NOT FOUND OR profile.church_id IS NULL OR (p_church_id IS NOT NULL AND p_church_id IS DISTINCT FROM profile.church_id)
   OR NOT coalesce(profile.is_active,true) THEN RETURN jsonb_build_object('status','scope_review_required'); END IF;
 SELECT * INTO event FROM public.events WHERE id=p_event_id FOR SHARE;
 IF NOT FOUND OR event.church_id IS DISTINCT FROM profile.church_id
   OR (event.target_user_id IS NOT NULL AND event.target_user_id IS DISTINCT FROM p_user_id)
   OR (event.turma_id IS NOT NULL AND event.turma_id IS DISTINCT FROM profile.turma_id)
   OR (event.turma_id IS NULL AND event.area IS NOT NULL AND event.area IS DISTINCT FROM profile.area::text) THEN
   RETURN jsonb_build_object('status','scope_review_required'); END IF;
 SELECT EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=p_user_id AND r.role IN ('admin','lider')
    AND coalesce(r.church_id,profile.church_id)=profile.church_id) INTO manager;
 IF event.community IS NOT NULL AND event.type <> 'confirmatorio' AND NOT manager
   AND event.community IS DISTINCT FROM profile.community::text THEN
   RETURN jsonb_build_object('status','scope_review_required'); END IF;
 INSERT INTO private.attendance_write_guard(transaction_id,user_id,event_id) VALUES(pg_catalog.txid_current(),p_user_id,p_event_id) ON CONFLICT DO NOTHING;
 INSERT INTO public.attendance(user_id,church_id,event_id,status,confirmation_source,user_requested_at,justification)
 VALUES(p_user_id,profile.church_id,p_event_id,p_status,'user',p_requested_at,p_justification)
 ON CONFLICT(event_id,user_id) DO UPDATE SET status=EXCLUDED.status,confirmation_source=CASE
   WHEN public.attendance.status=EXCLUDED.status AND public.attendance.justification IS NOT DISTINCT FROM EXCLUDED.justification
   THEN public.attendance.confirmation_source ELSE 'user' END,
   user_requested_at=CASE WHEN public.attendance.status=EXCLUDED.status AND public.attendance.justification IS NOT DISTINCT FROM EXCLUDED.justification
     THEN public.attendance.user_requested_at ELSE EXCLUDED.user_requested_at END,justification=EXCLUDED.justification
 WHERE public.attendance.church_id=EXCLUDED.church_id AND public.attendance.leader_confirmed_at IS NULL AND public.attendance.confirmed_by IS NULL
   AND (public.attendance.confirmation_source IS NULL OR public.attendance.confirmation_source='user')
   AND public.attendance.status IN ('pendente_presente','pendente_falta')
   AND ((public.attendance.status=EXCLUDED.status AND public.attendance.justification IS NOT DISTINCT FROM EXCLUDED.justification)
     OR (p_expected_status IS NOT NULL AND public.attendance.status=p_expected_status
       AND public.attendance.user_requested_at IS NOT DISTINCT FROM p_expected_requested_at
       AND public.attendance.justification IS NOT DISTINCT FROM p_expected_justification))
 RETURNING id INTO saved;
 DELETE FROM private.attendance_write_guard WHERE transaction_id=pg_catalog.txid_current() AND user_id=p_user_id AND event_id=p_event_id;
 IF saved IS NOT NULL THEN RETURN jsonb_build_object('status','saved'); END IF;
 SELECT * INTO existing FROM public.attendance WHERE event_id=p_event_id AND user_id=p_user_id FOR SHARE;
 IF NOT FOUND OR existing.church_id IS DISTINCT FROM profile.church_id THEN RETURN jsonb_build_object('status','scope_review_required'); END IF;
 IF existing.leader_confirmed_at IS NOT NULL OR existing.status IN ('presente','faltou','falta','justificou','justificado') THEN
   RETURN jsonb_build_object('status','finalized','current_status',existing.status,'leader_confirmed_at',existing.leader_confirmed_at);
 END IF;
 RETURN jsonb_build_object('status','newer_request');
END $$;
REVOKE ALL ON FUNCTION public.sync_owned_attendance(uuid,uuid,uuid,text,timestamptz,text,text,timestamptz,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.sync_owned_attendance(uuid,uuid,uuid,text,timestamptz,text,text,timestamptz,text) TO authenticated;

-- A retry after an uncertain network response must not insert the same manual
-- worship record twice. Records without a known church remain on the device.
CREATE TABLE private.offline_worship_receipts (
  user_id uuid NOT NULL,
  action_id text NOT NULL,
  fingerprint text NOT NULL,
  worship_id uuid REFERENCES public.worship_attendance(id) ON DELETE SET NULL,
  PRIMARY KEY(user_id,action_id)
);
ALTER TABLE private.offline_worship_receipts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.offline_worship_receipts FROM PUBLIC,anon,authenticated;
CREATE TABLE private.worship_write_guard (
  transaction_id bigint NOT NULL, user_id uuid NOT NULL,
  PRIMARY KEY(transaction_id,user_id)
);
ALTER TABLE private.worship_write_guard ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.worship_write_guard FROM PUBLIC,anon,authenticated;
CREATE FUNCTION private.guard_own_worship_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF pg_catalog.current_setting('role',true)='authenticated' AND auth.uid()=NEW.user_id
     AND NOT EXISTS(SELECT 1 FROM private.worship_write_guard g
       WHERE g.transaction_id=pg_catalog.txid_current() AND g.user_id=NEW.user_id) THEN
    RAISE EXCEPTION USING ERRCODE='55000',MESSAGE='ATTENDANCE_UPDATE_REQUIRES_REVIEW';
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.guard_own_worship_insert() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER aa_guard_own_worship_insert BEFORE INSERT ON public.worship_attendance
  FOR EACH ROW EXECUTE FUNCTION private.guard_own_worship_insert();
CREATE FUNCTION public.sync_owned_worship(p_user_id uuid,p_church_id uuid,p_action_id text,p_worship_date date,p_worship_time text,p_preacher_name text,p_event_type text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE church uuid; fingerprint text; receipt private.offline_worship_receipts%ROWTYPE; item uuid;
BEGIN
 IF auth.uid() IS NULL OR auth.uid() IS DISTINCT FROM p_user_id THEN
   RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='ATTENDANCE_ACCOUNT_CHANGED'; END IF;
 IF p_action_id IS NULL OR length(p_action_id) NOT BETWEEN 1 AND 200 OR p_worship_date IS NULL
   OR p_worship_time IS NULL OR length(p_worship_time) NOT BETWEEN 1 AND 40
   OR p_preacher_name IS NULL OR length(p_preacher_name) NOT BETWEEN 1 AND 200
   OR p_event_type IS NULL OR length(p_event_type) NOT BETWEEN 1 AND 100 THEN
   RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='INVALID_WORSHIP_REQUEST'; END IF;
 SELECT church_id INTO church FROM public.profiles WHERE user_id=p_user_id AND coalesce(is_active,true) FOR SHARE;
 IF NOT FOUND OR church IS NULL OR p_church_id IS NULL OR p_church_id IS DISTINCT FROM church THEN
   RETURN jsonb_build_object('status','scope_review_required'); END IF;
 fingerprint:=encode(extensions.digest(convert_to(jsonb_build_array(p_church_id,p_worship_date,p_worship_time,p_preacher_name,p_event_type)::text,'UTF8'),'sha256'),'hex');
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('worship:'||p_user_id::text||':'||p_action_id,0));
 SELECT * INTO receipt FROM private.offline_worship_receipts WHERE user_id=p_user_id AND action_id=p_action_id;
 IF FOUND THEN
   IF receipt.fingerprint IS DISTINCT FROM fingerprint THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='WORSHIP_ACTION_CHANGED'; END IF;
   RETURN jsonb_build_object('status',CASE WHEN receipt.worship_id IS NULL THEN 'scope_review_required' ELSE 'saved' END);
 END IF;
 INSERT INTO private.worship_write_guard(transaction_id,user_id) VALUES(pg_catalog.txid_current(),p_user_id) ON CONFLICT DO NOTHING;
 INSERT INTO public.worship_attendance(user_id,church_id,worship_date,worship_time,preacher_name,event_type,status)
   VALUES(p_user_id,church,p_worship_date,p_worship_time,p_preacher_name,p_event_type,'pendente') RETURNING id INTO item;
 DELETE FROM private.worship_write_guard WHERE transaction_id=pg_catalog.txid_current() AND user_id=p_user_id;
 INSERT INTO private.offline_worship_receipts(user_id,action_id,fingerprint,worship_id) VALUES(p_user_id,p_action_id,fingerprint,item);
 RETURN jsonb_build_object('status','saved');
END $$;
REVOKE ALL ON FUNCTION public.sync_owned_worship(uuid,uuid,text,date,text,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.sync_owned_worship(uuid,uuid,text,date,text,text,text) TO authenticated;
