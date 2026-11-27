-- STAGING ONLY. Verify exact earlier hosted state before changing anything.
BEGIN;
DO $$ BEGIN
 IF md5(replace(pg_get_functiondef(to_regprocedure('public.sync_owned_learning(uuid,text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb)')),E'\r\n',E'\n')) IS DISTINCT FROM '00e64eb6e4a435501b3ef928d9e77999'
 OR to_regclass('private.learning_membership_version') IS NOT NULL
 OR to_regprocedure('public.get_owned_learning_scope(uuid)') IS NOT NULL
 OR EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.profiles'::regclass AND tgname='aa_rotate_learning_membership' AND NOT tgisinternal) THEN
   RAISE EXCEPTION 'STAGING_MEMBERSHIP_PRECONDITION_FAILED';
 END IF;
END $$;
CREATE OR REPLACE FUNCTION public.sync_owned_learning(
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

-- A version changes on every enrollment transition, including A -> B -> A.
-- It is private server state; clients cannot manufacture or update it.
CREATE TABLE private.learning_membership_version (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  version uuid NOT NULL DEFAULT gen_random_uuid()
);
ALTER TABLE private.learning_membership_version ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.learning_membership_version FROM PUBLIC,anon,authenticated;
INSERT INTO private.learning_membership_version(user_id) SELECT DISTINCT p.user_id FROM public.profiles p WHERE p.user_id IS NOT NULL;
CREATE FUNCTION private.rotate_learning_membership_version() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF TG_OP='INSERT' OR ROW(NEW.user_id,NEW.church_id,NEW.turma_id,NEW.area,NEW.is_active,NEW.enrollment_status)
      IS DISTINCT FROM ROW(OLD.user_id,OLD.church_id,OLD.turma_id,OLD.area,OLD.is_active,OLD.enrollment_status) THEN
    INSERT INTO private.learning_membership_version(user_id,version) VALUES(NEW.user_id,gen_random_uuid())
      ON CONFLICT(user_id) DO UPDATE SET version=EXCLUDED.version;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION private.rotate_learning_membership_version() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER aa_rotate_learning_membership AFTER INSERT OR UPDATE OF user_id,church_id,turma_id,area,is_active,enrollment_status
  ON public.profiles FOR EACH ROW EXECUTE FUNCTION private.rotate_learning_membership_version();
CREATE FUNCTION public.get_owned_learning_scope(p_user_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE result jsonb;
BEGIN
  IF auth.uid() IS NULL OR p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='LEARNING_ACCOUNT_CHANGED';
  END IF;
  SELECT jsonb_build_object('churchId',p.church_id,'turmaId',p.turma_id,'area',p.area::text,'membershipVersion',v.version)
    INTO result FROM public.profiles p JOIN public.turmas t ON t.id=p.turma_id
    JOIN private.learning_membership_version v ON v.user_id=p.user_id
    WHERE p.user_id=p_user_id AND t.church_id=p.church_id AND t.is_active
      -- Churches without configured areas still have an authoritative group.
      AND (t.area=p.area::text OR (t.area IS NULL AND p.area::text='Sem area'
        AND NOT EXISTS (SELECT 1 FROM public.areas a WHERE a.church_id=p.church_id)))
      AND coalesce(p.is_active,true) AND p.enrollment_status IN ('approved','active') FOR SHARE OF p,t,v;
  RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.get_owned_learning_scope(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_owned_learning_scope(uuid) TO authenticated;

-- A completion is accepted only while its captured scope still matches the
-- authoritative profile and active group. Historical queue entries without a
-- scope are retained on the device for review, never assigned by inference.
CREATE FUNCTION public.sync_owned_completion(
  p_user_id uuid, p_church_id uuid, p_turma_id uuid, p_area text, p_membership_version uuid,
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
    JOIN private.learning_membership_version v ON v.user_id=p.user_id
    WHERE v.version=p_membership_version AND p.user_id=p_user_id AND p.church_id=p_church_id AND p.turma_id=p_turma_id
      AND p.area::text=p_area AND t.church_id=p.church_id
      AND (t.area=p_area OR (t.area IS NULL AND p_area='Sem area'
        AND NOT EXISTS (SELECT 1 FROM public.areas a WHERE a.church_id=p.church_id)))
      AND t.is_active AND coalesce(p.is_active,true) AND p.enrollment_status IN ('approved','active')
    FOR SHARE OF p,t,v;
  IF NOT FOUND THEN RETURN jsonb_build_object('status','scope_review_required'); END IF;
  RETURN public.sync_offline_learning(p_kind,p_item_id,p_responses,p_video_watched,
    p_audio_listened,p_is_recovery,p_awarded_points,p_override_release_id,p_expected);
END $$;
REVOKE ALL ON FUNCTION public.sync_owned_completion(uuid,uuid,uuid,text,uuid,text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.sync_owned_completion(uuid,uuid,uuid,text,uuid,text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb) TO authenticated;

NOTIFY pgrst,'reload schema';
COMMIT;
