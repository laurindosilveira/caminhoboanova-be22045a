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
