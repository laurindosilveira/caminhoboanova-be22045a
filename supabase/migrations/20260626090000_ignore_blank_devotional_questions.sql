-- Keep devotional completion aligned with the UI: blank question slots are hidden
-- from students and must not block saving.

UPDATE public.devotional_progress dp
SET church_id = p.church_id
FROM public.profiles p
WHERE dp.church_id IS NULL
  AND p.user_id = dp.user_id
  AND p.church_id IS NOT NULL;

UPDATE public.devotional_responses dr
SET church_id = p.church_id
FROM public.profiles p
WHERE dr.church_id IS NULL
  AND p.user_id = dr.user_id
  AND p.church_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.complete_devotional(
  p_devotional_id UUID,
  p_responses JSONB DEFAULT '{}'::jsonb,
  p_is_recovery BOOLEAN DEFAULT false,
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
  v_questions TEXT[];
  v_index INTEGER;
  v_effective_points INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF jsonb_typeof(COALESCE(p_responses, '{}'::jsonb)) <> 'object' THEN
    RAISE EXCEPTION 'Responses must be a JSON object';
  END IF;

  SELECT church_id INTO v_church_id
  FROM public.profiles
  WHERE user_id = v_user_id
  LIMIT 1;

  SELECT COALESCE(questions, ARRAY[]::TEXT[])
  INTO v_questions
  FROM public.devotional_content
  WHERE id = p_devotional_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Devotional not found';
  END IF;

  IF COALESCE(cardinality(v_questions), 0) > 0 THEN
    FOR v_index IN 0..cardinality(v_questions) - 1 LOOP
      IF btrim(COALESCE(v_questions[v_index + 1], '')) <> ''
        AND btrim(COALESCE(p_responses->>v_index::TEXT, '')) = '' THEN
        RAISE EXCEPTION 'Complete all devotional responses';
      END IF;
    END LOOP;
  END IF;

  IF p_override_release_id IS NOT NULL THEN
    SELECT override_row.custom_points
    INTO v_effective_points
    FROM public.user_devotional_overrides override_row
    WHERE override_row.id = p_override_release_id
      AND override_row.user_id = v_user_id
      AND override_row.devotional_id = p_devotional_id
      AND override_row.is_unlocked = true
      AND (override_row.available_from IS NULL OR override_row.available_from <= now())
      AND (override_row.available_until IS NULL OR override_row.available_until >= now());

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Invalid or expired devotional override';
    END IF;
  ELSIF p_awarded_points = 0 THEN
    v_effective_points := 0;
  ELSE
    SELECT COALESCE(
      (
        SELECT config.value::INTEGER
        FROM public.game_config config
        WHERE config.key = CASE
          WHEN p_is_recovery THEN 'devotional_recovery_points'
          ELSE 'devotional_points'
        END
          AND (config.church_id IS NULL OR config.church_id = v_church_id)
        ORDER BY config.church_id NULLS LAST
        LIMIT 1
      ),
      CASE WHEN p_is_recovery THEN 2 ELSE 5 END
    )
    INTO v_effective_points;
  END IF;

  INSERT INTO public.devotional_progress (
    user_id,
    devotional_id,
    is_recovery,
    awarded_points,
    override_release_id,
    church_id
  )
  VALUES (
    v_user_id,
    p_devotional_id,
    p_is_recovery,
    v_effective_points,
    p_override_release_id,
    v_church_id
  )
  ON CONFLICT (user_id, devotional_id)
  DO UPDATE SET
    is_recovery = public.devotional_progress.is_recovery OR EXCLUDED.is_recovery,
    awarded_points = COALESCE(public.devotional_progress.awarded_points, EXCLUDED.awarded_points),
    override_release_id = COALESCE(public.devotional_progress.override_release_id, EXCLUDED.override_release_id),
    church_id = COALESCE(EXCLUDED.church_id, public.devotional_progress.church_id);

  INSERT INTO public.devotional_responses (
    user_id, devotional_id, question_index, response, church_id
  )
  SELECT
    v_user_id,
    p_devotional_id,
    item.key::INTEGER,
    item.value,
    v_church_id
  FROM jsonb_each_text(COALESCE(p_responses, '{}'::jsonb)) AS item
  WHERE item.key ~ '^[0-9]+$'
  ON CONFLICT (user_id, devotional_id, question_index)
  DO UPDATE SET
    response = EXCLUDED.response,
    church_id = COALESCE(EXCLUDED.church_id, public.devotional_responses.church_id),
    updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_devotional(UUID, JSONB, BOOLEAN, INTEGER, UUID) TO authenticated;
