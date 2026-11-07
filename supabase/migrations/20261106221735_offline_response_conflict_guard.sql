CREATE OR REPLACE FUNCTION public.sync_offline_learning(
  p_kind text,
  p_item_id uuid,
  p_responses jsonb,
  p_video_watched boolean DEFAULT false,
  p_audio_listened boolean DEFAULT false,
  p_is_recovery boolean DEFAULT false,
  p_awarded_points integer DEFAULT NULL,
  p_override_release_id uuid DEFAULT NULL,
  p_expected jsonb DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_current jsonb;
  v_conflict boolean;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF p_kind IS NULL OR p_kind NOT IN ('save_lesson_draft', 'complete_lesson', 'complete_devotional') OR p_item_id IS NULL OR jsonb_typeof(p_responses) IS DISTINCT FROM 'object' OR (p_expected IS NOT NULL AND jsonb_typeof(p_expected) IS DISTINCT FROM 'object') THEN
    RAISE EXCEPTION 'Invalid offline action';
  END IF;

  IF p_kind = 'complete_devotional' THEN
    -- Lock in the same order as complete_devotional. The comparison and write
    -- are one transaction, so concurrent online writers cannot bypass it.
    LOCK TABLE public.devotional_progress IN SHARE ROW EXCLUSIVE MODE;
    LOCK TABLE public.devotional_responses IN SHARE ROW EXCLUSIVE MODE;
    SELECT coalesce(jsonb_object_agg(question_index::text, response), '{}'::jsonb)
      INTO v_current FROM public.devotional_responses
     WHERE user_id = v_user AND devotional_id = p_item_id;
  ELSE
    LOCK TABLE public.lesson_responses IN SHARE ROW EXCLUSIVE MODE;
    LOCK TABLE public.lesson_progress IN SHARE ROW EXCLUSIVE MODE;
    SELECT coalesce(jsonb_object_agg(question_key, response), '{}'::jsonb)
      INTO v_current FROM public.lesson_responses
     WHERE user_id = v_user AND lesson_id = p_item_id;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM jsonb_each_text(p_responses) AS pending(key, value)
     WHERE CASE WHEN p_expected IS NULL
       THEN v_current ? pending.key AND v_current->>pending.key IS DISTINCT FROM pending.value
       ELSE (v_current->pending.key) IS DISTINCT FROM (p_expected->pending.key)
     END
  ) INTO v_conflict;

  IF v_conflict THEN RETURN jsonb_build_object('status', 'conflict', 'current', v_current); END IF;
  IF p_kind = 'save_lesson_draft' THEN
    PERFORM public.save_lesson_draft(p_item_id, p_responses, p_video_watched, p_audio_listened);
  ELSIF p_kind = 'complete_lesson' THEN
    PERFORM public.complete_lesson(p_item_id, p_responses, p_video_watched, p_audio_listened, p_awarded_points, p_override_release_id);
  ELSE
    PERFORM public.complete_devotional(p_item_id, p_responses, p_is_recovery, p_awarded_points, p_override_release_id);
  END IF;
  RETURN jsonb_build_object('status', 'synced');
END;
$$;
REVOKE ALL ON FUNCTION public.sync_offline_learning(text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sync_offline_learning(text,uuid,jsonb,boolean,boolean,boolean,integer,uuid,jsonb) TO authenticated;
