-- REVIEW CANDIDATE ONLY. Do not run an automatic migration batch.
-- All reviewed steps must commit atomically with the matching client.
-- Validate current production signatures, privileges, backup and rollback.
BEGIN;

-- Reviewed source: supabase/rollout/20261106221735_learning_compatibility.sql
-- Etapa de compatibilidade: compara respostas e coordena gravacoes por
-- usuario e licao/devocional, inclusive chamadas das versoes anteriores.
-- As versoes antigas ainda podem sobrescrever respostas antigas: a recusa
-- dessas escritas exige a etapa separada de rollout e aparelhos preparados.
-- Execute somente este arquivo apos conferir os pre-requisitos de producao;
-- nao execute outras migracoes historicas para chegar ate ele.

CREATE SCHEMA IF NOT EXISTS private;

-- Abort instead of replacing an unrelated or newer deployment.
DO $$
BEGIN
  IF to_regprocedure('public.save_lesson_draft(uuid,jsonb,boolean,boolean)') IS NULL
     OR to_regprocedure('public.complete_lesson(uuid,jsonb,boolean,boolean,integer,uuid)') IS NULL
     OR to_regprocedure('public.complete_devotional(uuid,jsonb,boolean,integer,uuid)') IS NULL THEN
    RAISE EXCEPTION 'Missing required learning write functions';
  END IF;
  IF to_regprocedure('public.sync_offline_learning(text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb)') IS NOT NULL
     OR to_regprocedure('private.learning_item_lock_key(uuid,text,uuid)') IS NOT NULL
     OR to_regprocedure('private.lock_learning_write()') IS NOT NULL
     OR EXISTS (
       SELECT 1 FROM pg_catalog.pg_trigger t
       JOIN pg_catalog.pg_class c ON c.oid = t.tgrelid
       JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = 'public' AND c.relname IN ('lesson_responses','lesson_progress','devotional_responses','devotional_progress')
         AND t.tgname = 'aa_lock_learning_write' AND NOT t.tgisinternal
     ) THEN
    RAISE EXCEPTION 'Learning protection already exists; review the current deployment before continuing';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION private.learning_item_lock_key(p_user uuid, p_kind text, p_item uuid)
RETURNS bigint LANGUAGE sql IMMUTABLE SET search_path = ''
AS $$ SELECT pg_catalog.hashtextextended(p_kind || ':' || p_user::text || ':' || p_item::text, 0) $$;
REVOKE ALL ON FUNCTION private.learning_item_lock_key(uuid,text,uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.lock_learning_write()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_kind text := CASE WHEN TG_TABLE_NAME LIKE 'lesson_%' THEN 'lesson' ELSE 'devotional' END;
  v_field text := CASE WHEN TG_TABLE_NAME LIKE 'lesson_%' THEN 'lesson_id' ELSE 'devotional_id' END;
  v_old jsonb; v_new jsonb; v_old_key bigint; v_new_key bigint;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    v_old := to_jsonb(OLD);
    v_old_key := private.learning_item_lock_key((v_old->>'user_id')::uuid, v_kind, (v_old->>v_field)::uuid);
  END IF;
  IF TG_OP <> 'DELETE' THEN
    v_new := to_jsonb(NEW);
    v_new_key := private.learning_item_lock_key((v_new->>'user_id')::uuid, v_kind, (v_new->>v_field)::uuid);
  END IF;
  IF v_old_key IS NOT NULL AND v_new_key IS NOT NULL THEN
    PERFORM pg_catalog.pg_advisory_xact_lock(least(v_old_key, v_new_key));
    IF v_old_key <> v_new_key THEN PERFORM pg_catalog.pg_advisory_xact_lock(greatest(v_old_key, v_new_key)); END IF;
  ELSE
    PERFORM pg_catalog.pg_advisory_xact_lock(coalesce(v_old_key, v_new_key));
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;
REVOKE ALL ON FUNCTION private.lock_learning_write() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS aa_lock_learning_write ON public.lesson_responses;
CREATE TRIGGER aa_lock_learning_write BEFORE INSERT OR UPDATE OR DELETE ON public.lesson_responses FOR EACH ROW EXECUTE FUNCTION private.lock_learning_write();
DROP TRIGGER IF EXISTS aa_lock_learning_write ON public.lesson_progress;
CREATE TRIGGER aa_lock_learning_write BEFORE INSERT OR UPDATE OR DELETE ON public.lesson_progress FOR EACH ROW EXECUTE FUNCTION private.lock_learning_write();
DROP TRIGGER IF EXISTS aa_lock_learning_write ON public.devotional_responses;
CREATE TRIGGER aa_lock_learning_write BEFORE INSERT OR UPDATE OR DELETE ON public.devotional_responses FOR EACH ROW EXECUTE FUNCTION private.lock_learning_write();
DROP TRIGGER IF EXISTS aa_lock_learning_write ON public.devotional_progress;
CREATE TRIGGER aa_lock_learning_write BEFORE INSERT OR UPDATE OR DELETE ON public.devotional_progress FOR EACH ROW EXECUTE FUNCTION private.lock_learning_write();

CREATE OR REPLACE FUNCTION public.sync_offline_learning(
  p_kind text, p_item_id uuid, p_responses jsonb,
  p_video_watched boolean DEFAULT false, p_audio_listened boolean DEFAULT false,
  p_is_recovery boolean DEFAULT false, p_awarded_points integer DEFAULT NULL,
  p_override_release_id uuid DEFAULT NULL, p_expected jsonb DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_user uuid := auth.uid(); v_kind text; v_current jsonb; v_conflict boolean;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF p_kind IS NULL OR p_kind NOT IN ('save_lesson_draft','complete_lesson','complete_devotional')
     OR p_item_id IS NULL OR jsonb_typeof(p_responses) IS DISTINCT FROM 'object'
     OR (p_expected IS NOT NULL AND jsonb_typeof(p_expected) IS DISTINCT FROM 'object') THEN
    RAISE EXCEPTION 'Invalid offline action';
  END IF;
  v_kind := CASE WHEN p_kind = 'complete_devotional' THEN 'devotional' ELSE 'lesson' END;
  PERFORM pg_catalog.pg_advisory_xact_lock(private.learning_item_lock_key(v_user, v_kind, p_item_id));
  IF v_kind = 'devotional' THEN
    SELECT coalesce(jsonb_object_agg(question_index::text, response),'{}'::jsonb) INTO v_current
      FROM public.devotional_responses WHERE user_id=v_user AND devotional_id=p_item_id;
  ELSE
    SELECT coalesce(jsonb_object_agg(question_key, response),'{}'::jsonb) INTO v_current
      FROM public.lesson_responses WHERE user_id=v_user AND lesson_id=p_item_id;
  END IF;
  SELECT EXISTS (SELECT 1 FROM jsonb_each_text(p_responses) AS pending(key,value)
    -- Older queued actions have no reliable baseline. A missing server key
    -- might mean it was deleted on another device, so require review too.
    WHERE CASE WHEN p_expected IS NULL THEN v_current->>pending.key IS DISTINCT FROM pending.value
      ELSE (v_current->pending.key) IS DISTINCT FROM (p_expected->pending.key) END) INTO v_conflict;
  IF v_conflict THEN RETURN jsonb_build_object('status','conflict','current',v_current); END IF;

  IF p_kind='save_lesson_draft' THEN
    PERFORM public.save_lesson_draft(p_item_id,p_responses,p_video_watched,p_audio_listened);
  ELSIF p_kind='complete_lesson' THEN
    PERFORM public.complete_lesson(p_item_id,p_responses,p_video_watched,p_audio_listened,p_awarded_points,p_override_release_id);
  ELSE
    PERFORM public.complete_devotional(p_item_id,p_responses,p_is_recovery,p_awarded_points,p_override_release_id);
  END IF;
  RETURN jsonb_build_object('status','synced','current',v_current || p_responses);
END;
$$;
REVOKE ALL ON FUNCTION public.sync_offline_learning(text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_offline_learning(text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb) TO authenticated;

-- Reviewed source: supabase/rollout/20261106225947_per_item_learning_conflict_guard.sql
CREATE TABLE IF NOT EXISTS private.learning_write_guard (
  transaction_id bigint NOT NULL,
  user_id uuid NOT NULL,
  item_kind text NOT NULL CHECK (item_kind IN ('lesson', 'devotional')),
  item_id uuid NOT NULL,
  PRIMARY KEY (transaction_id, user_id, item_kind, item_id)
);
REVOKE ALL ON private.learning_write_guard FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.learning_item_lock_key(p_user uuid, p_kind text, p_item uuid)
RETURNS bigint LANGUAGE sql IMMUTABLE SET search_path = ''
AS $$ SELECT pg_catalog.hashtextextended(p_kind || ':' || p_user::text || ':' || p_item::text, 0) $$;
REVOKE ALL ON FUNCTION private.learning_item_lock_key(uuid,text,uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.lock_learning_write()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_kind text := CASE WHEN TG_TABLE_NAME LIKE 'lesson_%' THEN 'lesson' ELSE 'devotional' END;
  v_field text := CASE WHEN TG_TABLE_NAME LIKE 'lesson_%' THEN 'lesson_id' ELSE 'devotional_id' END;
  v_old jsonb; v_new jsonb; v_old_key bigint; v_new_key bigint;
  v_uid uuid; v_item uuid;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    v_old := to_jsonb(OLD);
    v_old_key := private.learning_item_lock_key((v_old->>'user_id')::uuid, v_kind, (v_old->>v_field)::uuid);
  END IF;
  IF TG_OP <> 'DELETE' THEN
    v_new := to_jsonb(NEW);
    v_new_key := private.learning_item_lock_key((v_new->>'user_id')::uuid, v_kind, (v_new->>v_field)::uuid);
  END IF;
  IF v_old_key IS NOT NULL AND v_new_key IS NOT NULL THEN
    PERFORM pg_catalog.pg_advisory_xact_lock(least(v_old_key, v_new_key));
    IF v_old_key <> v_new_key THEN PERFORM pg_catalog.pg_advisory_xact_lock(greatest(v_old_key, v_new_key)); END IF;
  ELSE
    PERFORM pg_catalog.pg_advisory_xact_lock(coalesce(v_old_key, v_new_key));
  END IF;

  -- Old clients do not provide a trustworthy baseline. Reject their own
  -- response writes; do not discard their queue or report a successful save.
  IF pg_catalog.current_setting('role', true) = 'authenticated'
     AND (
       (TG_TABLE_NAME IN ('lesson_responses','devotional_responses')
         AND (TG_OP IN ('INSERT','UPDATE') OR
           (TG_OP = 'DELETE' AND auth.uid() = (v_old->>'user_id')::uuid)))
       OR (TG_TABLE_NAME IN ('lesson_progress','devotional_progress')
         AND auth.uid() = (CASE WHEN TG_OP = 'DELETE' THEN v_old ELSE v_new END->>'user_id')::uuid)
     ) THEN
    -- Old clients can delete newer answers or alter completion independently.
    -- Administrative deletions of another user's data retain their existing
    -- authorization and do not acquire a guard for the administrator's user.
    v_uid := (CASE WHEN TG_OP = 'DELETE' THEN v_old ELSE v_new END->>'user_id')::uuid;
    v_item := (CASE WHEN TG_OP = 'DELETE' THEN v_old ELSE v_new END->>v_field)::uuid;
    IF NOT EXISTS (
      SELECT 1 FROM private.learning_write_guard g
      WHERE g.transaction_id = pg_catalog.txid_current() AND g.user_id = v_uid
        AND g.item_kind = v_kind AND g.item_id = v_item
    ) THEN
      RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'APP_UPDATE_REQUIRED',
        HINT = 'Update the application before saving answers. Keep offline data on this device.';
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;
REVOKE ALL ON FUNCTION private.lock_learning_write() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS aa_lock_learning_write ON public.lesson_responses;
CREATE TRIGGER aa_lock_learning_write BEFORE INSERT OR UPDATE OR DELETE ON public.lesson_responses FOR EACH ROW EXECUTE FUNCTION private.lock_learning_write();
DROP TRIGGER IF EXISTS aa_lock_learning_write ON public.lesson_progress;
CREATE TRIGGER aa_lock_learning_write BEFORE INSERT OR UPDATE OR DELETE ON public.lesson_progress FOR EACH ROW EXECUTE FUNCTION private.lock_learning_write();
DROP TRIGGER IF EXISTS aa_lock_learning_write ON public.devotional_responses;
CREATE TRIGGER aa_lock_learning_write BEFORE INSERT OR UPDATE OR DELETE ON public.devotional_responses FOR EACH ROW EXECUTE FUNCTION private.lock_learning_write();
DROP TRIGGER IF EXISTS aa_lock_learning_write ON public.devotional_progress;
CREATE TRIGGER aa_lock_learning_write BEFORE INSERT OR UPDATE OR DELETE ON public.devotional_progress FOR EACH ROW EXECUTE FUNCTION private.lock_learning_write();

CREATE OR REPLACE FUNCTION public.sync_offline_learning(
  p_kind text, p_item_id uuid, p_responses jsonb,
  p_video_watched boolean DEFAULT false, p_audio_listened boolean DEFAULT false,
  p_is_recovery boolean DEFAULT false, p_awarded_points integer DEFAULT NULL,
  p_override_release_id uuid DEFAULT NULL, p_expected jsonb DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_user uuid := auth.uid(); v_kind text; v_current jsonb; v_conflict boolean;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF p_kind IS NULL OR p_kind NOT IN ('save_lesson_draft','complete_lesson','complete_devotional')
     OR p_item_id IS NULL OR jsonb_typeof(p_responses) IS DISTINCT FROM 'object'
     OR (p_expected IS NOT NULL AND jsonb_typeof(p_expected) IS DISTINCT FROM 'object') THEN
    RAISE EXCEPTION 'Invalid offline action';
  END IF;
  v_kind := CASE WHEN p_kind = 'complete_devotional' THEN 'devotional' ELSE 'lesson' END;
  PERFORM pg_catalog.pg_advisory_xact_lock(private.learning_item_lock_key(v_user, v_kind, p_item_id));
  IF v_kind = 'devotional' THEN
    SELECT coalesce(jsonb_object_agg(question_index::text, response),'{}'::jsonb) INTO v_current
      FROM public.devotional_responses WHERE user_id=v_user AND devotional_id=p_item_id;
  ELSE
    SELECT coalesce(jsonb_object_agg(question_key, response),'{}'::jsonb) INTO v_current
      FROM public.lesson_responses WHERE user_id=v_user AND lesson_id=p_item_id;
  END IF;
  SELECT EXISTS (SELECT 1 FROM jsonb_each_text(p_responses) AS pending(key,value)
    -- Older queued actions have no reliable baseline. A missing server key
    -- might mean it was deleted on another device, so require review too.
    WHERE CASE WHEN p_expected IS NULL THEN v_current->>pending.key IS DISTINCT FROM pending.value
      ELSE (v_current->pending.key) IS DISTINCT FROM (p_expected->pending.key) END) INTO v_conflict;
  IF v_conflict THEN RETURN jsonb_build_object('status','conflict','current',v_current); END IF;

  INSERT INTO private.learning_write_guard(transaction_id,user_id,item_kind,item_id)
  VALUES (pg_catalog.txid_current(),v_user,v_kind,p_item_id) ON CONFLICT DO NOTHING;
  IF p_kind='save_lesson_draft' THEN
    PERFORM public.save_lesson_draft(p_item_id,p_responses,p_video_watched,p_audio_listened);
  ELSIF p_kind='complete_lesson' THEN
    PERFORM public.complete_lesson(p_item_id,p_responses,p_video_watched,p_audio_listened,p_awarded_points,p_override_release_id);
  ELSE
    PERFORM public.complete_devotional(p_item_id,p_responses,p_is_recovery,p_awarded_points,p_override_release_id);
  END IF;
  DELETE FROM private.learning_write_guard WHERE transaction_id=pg_catalog.txid_current()
    AND user_id=v_user AND item_kind=v_kind AND item_id=p_item_id;
  RETURN jsonb_build_object('status','synced','current',v_current || p_responses);
END;
$$;
REVOKE ALL ON FUNCTION public.sync_offline_learning(text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_offline_learning(text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb) TO authenticated;

-- Reviewed source: supabase/rollout/20261123_owned_learning_guard.sql
-- Candidate for review only: installed as part of the single coordinated
-- update with the conflict and legacy-write guards, never independently.
DO $$ BEGIN
  IF to_regprocedure('public.sync_owned_learning(uuid,text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb)') IS NOT NULL THEN
    RAISE EXCEPTION 'Owned learning API already exists; review the deployed version';
  END IF;
END $$;
CREATE FUNCTION public.sync_owned_learning(
  p_user_id uuid, p_kind text, p_item_id uuid, p_responses jsonb,
  p_video_watched boolean DEFAULT false, p_audio_listened boolean DEFAULT false,
  p_is_recovery boolean DEFAULT false, p_awarded_points integer DEFAULT NULL,
  p_override_release_id uuid DEFAULT NULL, p_expected jsonb DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF auth.uid() IS NULL OR p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='LEARNING_ACCOUNT_CHANGED';
  END IF;
  IF p_kind IN ('complete_lesson','complete_devotional') THEN
    RETURN jsonb_build_object('status','scope_review_required');
  END IF;
  RETURN public.sync_offline_learning(p_kind,p_item_id,p_responses,p_video_watched,
    p_audio_listened,p_is_recovery,p_awarded_points,p_override_release_id,p_expected);
END $$;
REVOKE ALL ON FUNCTION public.sync_owned_learning(uuid,text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.sync_owned_learning(uuid,text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb) TO authenticated;
-- The unchecked entry point does not bind the queued action to its owner.
-- Only the SECURITY DEFINER wrapper above may call it for authenticated users.
REVOKE ALL ON FUNCTION public.sync_offline_learning(text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb) FROM PUBLIC,anon,authenticated;

-- A completion is accepted only while its captured scope still matches the
-- authoritative profile and active group. Historical queue entries without a
-- scope are retained on the device for review, never assigned by inference.
CREATE FUNCTION public.sync_owned_completion(
  p_user_id uuid, p_church_id uuid, p_turma_id uuid, p_area text,
  p_kind text, p_item_id uuid, p_responses jsonb,
  p_video_watched boolean DEFAULT false, p_audio_listened boolean DEFAULT false,
  p_is_recovery boolean DEFAULT false, p_awarded_points integer DEFAULT NULL,
  p_override_release_id uuid DEFAULT NULL, p_expected jsonb DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF auth.uid() IS NULL OR p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='LEARNING_ACCOUNT_CHANGED';
  END IF;
  IF p_kind IS NULL OR p_kind NOT IN ('complete_lesson','complete_devotional') THEN
    RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='INVALID_COMPLETION';
  END IF;
  PERFORM 1 FROM public.profiles p JOIN public.turmas t ON t.id=p.turma_id
    WHERE p.user_id=p_user_id AND p.church_id=p_church_id AND p.turma_id=p_turma_id
      AND p.area::text=p_area AND t.church_id=p.church_id AND t.area=p_area
      AND t.is_active AND coalesce(p.is_active,true) AND p.enrollment_status IN ('approved','active')
    FOR SHARE OF p,t;
  IF NOT FOUND THEN RETURN jsonb_build_object('status','scope_review_required'); END IF;
  RETURN public.sync_offline_learning(p_kind,p_item_id,p_responses,p_video_watched,
    p_audio_listened,p_is_recovery,p_awarded_points,p_override_release_id,p_expected);
END $$;
REVOKE ALL ON FUNCTION public.sync_owned_completion(uuid,uuid,uuid,text,text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.sync_owned_completion(uuid,uuid,uuid,text,text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb) TO authenticated;

-- Reviewed source: supabase/rollout/attendance_scope_candidate.sql
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

-- Reviewed source: supabase/rollout/historical_response_read_candidate.sql
-- REVIEW CANDIDATE ONLY. No historical area can be reconstructed from a
-- student's present group. Retain owner access without granting old answers
-- to the current leader merely because the group assignment has changed.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename IN ('lesson_responses', 'devotional_responses')
      AND (cmd = 'ALL' OR policyname NOT IN ('Tenant-owned rows select','Tenant-owned rows insert','Tenant-owned rows update','Tenant-owned rows delete'))) THEN
    RAISE EXCEPTION 'UNREVIEWED_LEARNING_POLICY';
  END IF;
  IF (SELECT count(*) FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename IN ('lesson_responses', 'devotional_responses')
      AND cmd = 'SELECT' AND policyname = 'Tenant-owned rows select') <> 2 THEN
    RAISE EXCEPTION 'EXPECTED_LEARNING_READ_POLICIES_MISSING';
  END IF;
  IF (SELECT count(*) FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename IN ('lesson_responses', 'devotional_responses')
      AND ((cmd = 'INSERT' AND policyname = 'Tenant-owned rows insert')
        OR (cmd = 'UPDATE' AND policyname = 'Tenant-owned rows update')
        OR (cmd = 'DELETE' AND policyname = 'Tenant-owned rows delete'))) <> 6 THEN
    RAISE EXCEPTION 'EXPECTED_LEARNING_WRITE_POLICIES_MISSING';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename IN ('lesson_progress', 'devotional_progress')
      AND cmd IN ('DELETE','ALL') AND policyname <> 'member_scope_delete')
    OR (SELECT count(*) FROM pg_catalog.pg_policies
      WHERE schemaname = 'public' AND tablename IN ('lesson_progress', 'devotional_progress')
        AND cmd = 'DELETE' AND policyname = 'member_scope_delete') <> 2 THEN
    RAISE EXCEPTION 'UNREVIEWED_PROGRESS_DELETE_POLICY';
  END IF;
END $$;

CREATE FUNCTION private.is_active_learning_owner(p_owner uuid, p_church uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT p_owner = (SELECT auth.uid()) AND p_church IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = p_owner AND p.church_id = p_church
      AND coalesce(p.is_active, true)
  )
$$;
REVOKE ALL ON FUNCTION private.is_active_learning_owner(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_active_learning_owner(uuid, uuid) TO authenticated;

DROP POLICY "Tenant-owned rows select" ON public.lesson_responses;
CREATE POLICY "historical answers owner select" ON public.lesson_responses FOR SELECT TO authenticated
  USING (private.is_active_learning_owner(user_id, church_id));
DROP POLICY "Tenant-owned rows select" ON public.devotional_responses;
CREATE POLICY "historical answers owner select" ON public.devotional_responses FOR SELECT TO authenticated
  USING (private.is_active_learning_owner(user_id, church_id));

DO $$
DECLARE v_table text;
BEGIN
  FOREACH v_table IN ARRAY ARRAY['lesson_responses','devotional_responses'] LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', 'Tenant-owned rows insert', v_table);
    EXECUTE format('DROP POLICY %I ON public.%I', 'Tenant-owned rows update', v_table);
    EXECUTE format('DROP POLICY %I ON public.%I', 'Tenant-owned rows delete', v_table);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (private.is_active_learning_owner(user_id,church_id))', 'answers owner insert', v_table);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (private.is_active_learning_owner(user_id,church_id)) WITH CHECK (private.is_active_learning_owner(user_id,church_id))', 'answers owner update', v_table);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (private.is_active_learning_owner(user_id,church_id))', 'answers owner delete', v_table);
  END LOOP;
END $$;

-- Deleting devotional progress can cascade to the student's answers. Prevent
-- a leader's direct Data API request from bypassing the owner-only answer rule.
DO $$
DECLARE v_table text;
BEGIN
  FOREACH v_table IN ARRAY ARRAY['lesson_progress','devotional_progress'] LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', 'member_scope_delete', v_table);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (private.is_active_learning_owner(user_id,church_id))', 'progress owner delete', v_table);
  END LOOP;
END $$;

-- This definer function deletes whole personal histories, including records
-- predating a group transfer. Suspend it until a scoped replacement exists.
DO $$ BEGIN
  IF to_regprocedure('public.reset_turma_journey(uuid)') IS NULL THEN
    RAISE EXCEPTION 'EXPECTED_GROUP_RESET_MISSING';
  END IF;
END $$;
REVOKE EXECUTE ON FUNCTION public.reset_turma_journey(uuid) FROM PUBLIC, anon, authenticated;

NOTIFY pgrst, 'reload schema';
COMMIT;
