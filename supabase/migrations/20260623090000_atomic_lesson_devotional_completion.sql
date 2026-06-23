-- Make lesson/devotional persistence explicit, atomic and idempotent.

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  video_watched BOOLEAN NOT NULL DEFAULT false,
  audio_listened BOOLEAN NOT NULL DEFAULT false,
  awarded_points INTEGER,
  override_release_id UUID REFERENCES public.user_lesson_overrides(id) ON DELETE SET NULL,
  church_id UUID REFERENCES public.churches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT lesson_progress_user_lesson_key UNIQUE (user_id, lesson_id),
  CONSTRAINT lesson_progress_awarded_points_nonnegative
    CHECK (awarded_points IS NULL OR awarded_points >= 0)
);

CREATE INDEX IF NOT EXISTS lesson_progress_user_id_idx
  ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS lesson_progress_church_id_idx
  ON public.lesson_progress(church_id);
CREATE INDEX IF NOT EXISTS lesson_progress_completed_idx
  ON public.lesson_progress(user_id, is_completed);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their lesson progress" ON public.lesson_progress;
CREATE POLICY "Users can read their lesson progress"
  ON public.lesson_progress FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR (
      (
        public.has_role(auth.uid(), 'admin'::public.app_role)
        OR public.has_role(auth.uid(), 'lider'::public.app_role)
      )
      AND (
        public.is_super_admin(auth.uid())
        OR EXISTS (
          SELECT 1
          FROM public.profiles target_profile
          WHERE target_profile.user_id = lesson_progress.user_id
            AND target_profile.area = public.get_my_area()
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can write their lesson progress" ON public.lesson_progress;
CREATE POLICY "Users can write their lesson progress"
  ON public.lesson_progress FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins and leaders can delete lesson progress" ON public.lesson_progress;
CREATE POLICY "Admins and leaders can delete lesson progress"
  ON public.lesson_progress FOR DELETE TO authenticated
  USING (
    (
      public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'lider'::public.app_role)
    )
    AND (
      public.is_super_admin(auth.uid())
      OR EXISTS (
        SELECT 1
        FROM public.profiles target_profile
        WHERE target_profile.user_id = lesson_progress.user_id
          AND target_profile.area = public.get_my_area()
      )
    )
  );

DROP TRIGGER IF EXISTS update_lesson_progress_updated_at ON public.lesson_progress;
CREATE TRIGGER update_lesson_progress_updated_at
  BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Backfill only lessons that contain all required textual responses.
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
SELECT
  lr.user_id,
  lr.lesson_id,
  true,
  MAX(lr.updated_at),
  true,
  true,
  MAX(lr.awarded_points),
  (array_agg(lr.override_release_id) FILTER (WHERE lr.override_release_id IS NOT NULL))[1],
  COALESCE(
    (array_agg(lr.church_id) FILTER (WHERE lr.church_id IS NOT NULL))[1],
    (array_agg(p.church_id) FILTER (WHERE p.church_id IS NOT NULL))[1]
  )
FROM public.lesson_responses lr
LEFT JOIN public.profiles p ON p.user_id = lr.user_id
LEFT JOIN public.lesson_content lc ON lc.lesson_id = lr.lesson_id
GROUP BY lr.user_id, lr.lesson_id, lc.questions
HAVING
  COUNT(*) FILTER (
    WHERE lr.question_key = 'icebreaker' AND btrim(lr.response) <> ''
  ) > 0
  AND COUNT(*) FILTER (
    WHERE lr.question_key = 'practice' AND btrim(lr.response) <> ''
  ) > 0
  AND COUNT(*) FILTER (
    WHERE lr.question_key = 'prayer' AND btrim(lr.response) <> ''
  ) > 0
  AND COUNT(DISTINCT lr.question_key) FILTER (
    WHERE lr.question_key ~ '^q[0-9]+$' AND btrim(lr.response) <> ''
  ) >= COALESCE(cardinality(lc.questions), 0)
ON CONFLICT (user_id, lesson_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.save_lesson_draft(
  p_lesson_id UUID,
  p_responses JSONB DEFAULT '{}'::jsonb,
  p_video_watched BOOLEAN DEFAULT false,
  p_audio_listened BOOLEAN DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_church_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.lessons WHERE id = p_lesson_id) THEN
    RAISE EXCEPTION 'Lesson not found';
  END IF;

  IF jsonb_typeof(COALESCE(p_responses, '{}'::jsonb)) <> 'object' THEN
    RAISE EXCEPTION 'Responses must be a JSON object';
  END IF;

  SELECT church_id INTO v_church_id
  FROM public.profiles
  WHERE user_id = v_user_id
  LIMIT 1;

  INSERT INTO public.lesson_responses (
    user_id, lesson_id, question_key, response, church_id
  )
  SELECT
    v_user_id, p_lesson_id, item.key, item.value, v_church_id
  FROM jsonb_each_text(COALESCE(p_responses, '{}'::jsonb)) AS item
  WHERE btrim(item.key) <> ''
  ON CONFLICT (user_id, lesson_id, question_key)
  DO UPDATE SET
    response = EXCLUDED.response,
    church_id = COALESCE(EXCLUDED.church_id, public.lesson_responses.church_id),
    updated_at = now();

  INSERT INTO public.lesson_progress (
    user_id, lesson_id, is_completed, video_watched, audio_listened, church_id
  )
  VALUES (
    v_user_id, p_lesson_id, false, p_video_watched, p_audio_listened, v_church_id
  )
  ON CONFLICT (user_id, lesson_id)
  DO UPDATE SET
    video_watched = public.lesson_progress.video_watched OR EXCLUDED.video_watched,
    audio_listened = public.lesson_progress.audio_listened OR EXCLUDED.audio_listened,
    church_id = COALESCE(EXCLUDED.church_id, public.lesson_progress.church_id),
    updated_at = now();
END;
$$;

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
      IF btrim(COALESCE(p_responses->>('q' || v_index), '')) = '' THEN
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
    -- Zero is the only client-provided value accepted (late access).
    v_effective_points := 0;
  ELSE
    -- Normal lesson points are resolved by the ranking configuration.
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
      IF btrim(COALESCE(p_responses->>v_index::TEXT, '')) = '' THEN
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

REVOKE ALL ON FUNCTION public.save_lesson_draft(UUID, JSONB, BOOLEAN, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_lesson(UUID, JSONB, BOOLEAN, BOOLEAN, INTEGER, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_devotional(UUID, JSONB, BOOLEAN, INTEGER, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_lesson_draft(UUID, JSONB, BOOLEAN, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_lesson(UUID, JSONB, BOOLEAN, BOOLEAN, INTEGER, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_devotional(UUID, JSONB, BOOLEAN, INTEGER, UUID) TO authenticated;

-- Repair the duplicated ordering imported for the "Ensina-nos a orar" course.
UPDATE public.lessons
SET order_num = CASE
  WHEN title ILIKE 'Aula 1 %' THEN 1
  WHEN title ILIKE 'Aula 2 %' THEN 2
  WHEN title ILIKE 'Aula 3 %' THEN 3
  WHEN title ILIKE 'Aula 4 %' THEN 4
  WHEN title ILIKE 'Aula 5 %' THEN 5
  WHEN title ILIKE 'Aula 6 %' THEN 6
  WHEN title ILIKE 'Aula 7 %' THEN 7
  WHEN title ILIKE 'Aula 8 %' THEN 8
  ELSE order_num
END
WHERE course_id = '60e7bc3f-be26-4e52-8607-6d5a58f8e6f3';

-- Keep the existing ranking function shape, but make lesson points and course
-- bonuses depend on explicit completion instead of any draft response.
DO $$
DECLARE
  function_definition TEXT;
BEGIN
  IF to_regprocedure('public.get_community_ranking(public.community_name,uuid)') IS NULL THEN
    RETURN;
  END IF;

  SELECT pg_get_functiondef(
    'public.get_community_ranking(public.community_name,uuid)'::regprocedure
  )
  INTO function_definition;

  function_definition := replace(
    function_definition,
    'FROM public.lesson_responses lr',
    'FROM public.lesson_progress lr'
  );
  function_definition := replace(
    function_definition,
    'COUNT(DISTINCT lr.lesson_id) * _lesson_pts as pts',
    'SUM(COALESCE(lr.awarded_points, _lesson_pts)) as pts'
  );
  function_definition := replace(
    function_definition,
    'WHERE (_church_id IS NULL OR lr.church_id = _church_id OR lr.church_id IS NULL)',
    'WHERE lr.is_completed = true AND (_church_id IS NULL OR lr.church_id = _church_id OR lr.church_id IS NULL)'
  );

  EXECUTE function_definition;
END;
$$;
