-- Match lesson completion with editable content: blank question slots are not
-- visible work for students and must not block saving.

CREATE OR REPLACE FUNCTION public.complete_lesson(
  p_lesson_id UUID,
  p_responses JSONB,
  p_video_watched BOOLEAN DEFAULT false,
  p_audio_listened BOOLEAN DEFAULT false,
  p_awarded_points INTEGER DEFAULT NULL,
  p_override_release_id UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_church_id UUID;
  v_turma_id UUID;
  v_questions TEXT[];
  v_video_link TEXT;
  v_audio_link TEXT;
  v_index INTEGER;
  v_effective_points INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF jsonb_typeof(COALESCE(p_responses, '{}'::jsonb)) <> 'object' THEN
    RAISE EXCEPTION 'Responses must be a JSON object';
  END IF;

  SELECT church_id, turma_id
  INTO v_church_id, v_turma_id
  FROM public.profiles
  WHERE user_id = v_user_id
  LIMIT 1;

  SELECT
    CASE
      WHEN COALESCE(cardinality(tlc.questions), 0) > 0 THEN tlc.questions
      ELSE COALESCE(lc.questions, ARRAY[]::TEXT[])
    END,
    COALESCE(tlc.video_link, lc.video_link, ''),
    COALESCE(tlc.audio_link, lc.audio_link, '')
  INTO v_questions, v_video_link, v_audio_link
  FROM public.lessons l
  LEFT JOIN public.lesson_content lc ON lc.lesson_id = l.id
  LEFT JOIN public.turma_lesson_content tlc
    ON tlc.lesson_id = l.id AND tlc.turma_id = v_turma_id
  WHERE l.id = p_lesson_id
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lesson not found';
  END IF;

  IF btrim(COALESCE(p_responses->>'icebreaker', '')) = ''
    OR btrim(COALESCE(p_responses->>'practice', '')) = ''
    OR btrim(COALESCE(p_responses->>'prayer', '')) = '' THEN
    RAISE EXCEPTION 'Complete all required lesson responses';
  END IF;

  IF COALESCE(cardinality(v_questions), 0) > 0 THEN
    FOR v_index IN 0..cardinality(v_questions) - 1 LOOP
      IF btrim(COALESCE(v_questions[v_index + 1], '')) <> ''
        AND btrim(COALESCE(p_responses->>('q' || v_index), '')) = '' THEN
        RAISE EXCEPTION 'Complete all required lesson responses';
      END IF;
    END LOOP;
  END IF;

  IF btrim(v_video_link) <> '' AND NOT p_video_watched THEN
    RAISE EXCEPTION 'Watch the lesson video before completing';
  END IF;

  IF btrim(v_audio_link) <> '' AND NOT p_audio_listened THEN
    RAISE EXCEPTION 'Listen to the lesson audio before completing';
  END IF;

  IF p_override_release_id IS NOT NULL THEN
    SELECT override_row.custom_points
    INTO v_effective_points
    FROM public.user_lesson_overrides override_row
    WHERE override_row.id = p_override_release_id
      AND override_row.user_id = v_user_id
      AND override_row.lesson_id = p_lesson_id
      AND override_row.is_unlocked = true
      AND (override_row.available_from IS NULL OR override_row.available_from <= now())
      AND (override_row.available_until IS NULL OR override_row.available_until >= now());

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Invalid or expired lesson override';
    END IF;
  ELSIF p_awarded_points = 0 THEN
    v_effective_points := 0;
  ELSE
    v_effective_points := NULL;
  END IF;

  INSERT INTO public.lesson_responses (
    user_id,
    lesson_id,
    question_key,
    response,
    awarded_points,
    override_release_id,
    church_id
  )
  SELECT
    v_user_id,
    p_lesson_id,
    item.key,
    item.value,
    v_effective_points,
    p_override_release_id,
    v_church_id
  FROM jsonb_each_text(p_responses) AS item
  WHERE btrim(item.key) <> ''
  ON CONFLICT (user_id, lesson_id, question_key)
  DO UPDATE SET
    response = EXCLUDED.response,
    awarded_points = EXCLUDED.awarded_points,
    override_release_id = EXCLUDED.override_release_id,
    church_id = COALESCE(EXCLUDED.church_id, public.lesson_responses.church_id),
    updated_at = now();

  INSERT INTO public.lesson_progress (
    user_id,
    lesson_id,
    is_completed,
    completed_at,
    video_watched,
    audio_listened,
    awarded_points,
    override_release_id,
    church_id
  )
  VALUES (
    v_user_id,
    p_lesson_id,
    true,
    now(),
    p_video_watched,
    p_audio_listened,
    v_effective_points,
    p_override_release_id,
    v_church_id
  )
  ON CONFLICT (user_id, lesson_id)
  DO UPDATE SET
    is_completed = true,
    completed_at = COALESCE(public.lesson_progress.completed_at, now()),
    video_watched = public.lesson_progress.video_watched OR EXCLUDED.video_watched,
    audio_listened = public.lesson_progress.audio_listened OR EXCLUDED.audio_listened,
    awarded_points = COALESCE(public.lesson_progress.awarded_points, EXCLUDED.awarded_points),
    override_release_id = COALESCE(public.lesson_progress.override_release_id, EXCLUDED.override_release_id),
    church_id = COALESCE(EXCLUDED.church_id, public.lesson_progress.church_id),
    updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_lesson(UUID, JSONB, BOOLEAN, BOOLEAN, INTEGER, UUID) TO authenticated;
