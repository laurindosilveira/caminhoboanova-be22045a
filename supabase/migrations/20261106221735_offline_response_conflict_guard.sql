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
