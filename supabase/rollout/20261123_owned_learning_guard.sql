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
  RETURN public.sync_offline_learning(p_kind,p_item_id,p_responses,p_video_watched,
    p_audio_listened,p_is_recovery,p_awarded_points,p_override_release_id,p_expected);
END $$;
REVOKE ALL ON FUNCTION public.sync_owned_learning(uuid,text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.sync_owned_learning(uuid,text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb) TO authenticated;
-- The unchecked entry point does not bind the queued action to its owner.
-- Only the SECURITY DEFINER wrapper above may call it for authenticated users.
REVOKE ALL ON FUNCTION public.sync_offline_learning(text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb) FROM PUBLIC,anon,authenticated;
