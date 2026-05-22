-- Drop old versions if they exist with different parameter names/counts
DROP FUNCTION IF EXISTS public.get_community_ranking(public.community_name);
DROP FUNCTION IF EXISTS public.get_community_ranking(public.community_name, uuid);

-- Optimized and Fixed Ranking Function
CREATE OR REPLACE FUNCTION public.get_community_ranking(
  _community public.community_name DEFAULT NULL,
  _church_id UUID DEFAULT NULL
)
RETURNS TABLE(
  user_id UUID,
  full_name TEXT,
  completed_count BIGINT,
  faith_points BIGINT,
  base_points BIGINT,
  course_bonus BIGINT,
  achievement_bonus BIGINT,
  other_bonus BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _lesson_pts INT;
  _dev_pts INT;
  _dev_wk_pts INT;
  _dev_rec_pts INT;
  _att_pts INT;
  _wor_pts INT;
  _course_pts INT;
  _challenge_pts INT;
BEGIN
  -- Load config values once, optionally filtered by church
  SELECT COALESCE(CAST(value AS INTEGER), 20) INTO _lesson_pts FROM public.game_config WHERE key = 'lesson_points' AND (church_id IS NULL OR church_id = _church_id) ORDER BY church_id NULLS LAST LIMIT 1;
  SELECT COALESCE(CAST(value AS INTEGER), 5) INTO _dev_pts FROM public.game_config WHERE key = 'devotional_points' AND (church_id IS NULL OR church_id = _church_id) ORDER BY church_id NULLS LAST LIMIT 1;
  SELECT COALESCE(CAST(value AS INTEGER), 2) INTO _dev_wk_pts FROM public.game_config WHERE key = 'devotional_weekend_points' AND (church_id IS NULL OR church_id = _church_id) ORDER BY church_id NULLS LAST LIMIT 1;
  SELECT COALESCE(CAST(value AS INTEGER), 2) INTO _dev_rec_pts FROM public.game_config WHERE key = 'devotional_recovery_points' AND (church_id IS NULL OR church_id = _church_id) ORDER BY church_id NULLS LAST LIMIT 1;
  SELECT COALESCE(CAST(value AS INTEGER), 15) INTO _att_pts FROM public.game_config WHERE key = 'attendance_points' AND (church_id IS NULL OR church_id = _church_id) ORDER BY church_id NULLS LAST LIMIT 1;
  SELECT COALESCE(CAST(value AS INTEGER), 5) INTO _wor_pts FROM public.game_config WHERE key = 'worship_points' AND (church_id IS NULL OR church_id = _church_id) ORDER BY church_id NULLS LAST LIMIT 1;
  SELECT COALESCE(CAST(value AS INTEGER), 100) INTO _course_pts FROM public.game_config WHERE key = 'course_completion_bonus' AND (church_id IS NULL OR church_id = _church_id) ORDER BY church_id NULLS LAST LIMIT 1;
  SELECT COALESCE(CAST(value AS INTEGER), 15) INTO _challenge_pts FROM public.game_config WHERE key = 'challenge_points' AND (church_id IS NULL OR church_id = _church_id) ORDER BY church_id NULLS LAST LIMIT 1;

  RETURN QUERY
  WITH user_list AS (
    SELECT 
      p.user_id, 
      p.full_name,
      p.area,
      p.church_id
    FROM public.profiles p
    WHERE (_community IS NULL OR p.community = _community)
      AND (_church_id IS NULL OR p.church_id = _church_id)
      AND NOT EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = p.user_id AND ur.role IN ('admin', 'lider')
      )
  ),
  lesson_stats AS (
    SELECT lr.user_id, COUNT(DISTINCT lr.lesson_id) * _lesson_pts as pts
    FROM public.lesson_responses lr
    JOIN user_list ul ON ul.user_id = lr.user_id
    WHERE (_church_id IS NULL OR lr.church_id = _church_id OR lr.church_id IS NULL)
    GROUP BY lr.user_id
  ),
  dev_stats AS (
    SELECT 
      dp.user_id, 
      SUM(
        CASE 
          WHEN dp.awarded_points IS NOT NULL THEN dp.awarded_points
          WHEN COALESCE(dp.is_recovery, false) = true THEN _dev_rec_pts
          WHEN EXTRACT(DOW FROM (dp.completed_at AT TIME ZONE 'UTC') AT TIME ZONE 'America/Sao_Paulo') IN (0, 6) THEN _dev_wk_pts
          ELSE _dev_pts
        END
      ) as pts
    FROM public.devotional_progress dp
    JOIN user_list ul ON ul.user_id = dp.user_id
    WHERE (_church_id IS NULL OR dp.church_id = _church_id OR dp.church_id IS NULL)
    GROUP BY dp.user_id
  ),
  att_stats AS (
    SELECT 
        a.user_id, 
        SUM(
            CASE 
                WHEN a.status NOT IN ('presente') THEN 0
                WHEN cet.gives_points = true THEN COALESCE(cet.points, _att_pts)
                ELSE _att_pts
            END
        ) as pts
    FROM public.attendance a
    JOIN user_list ul ON ul.user_id = a.user_id
    JOIN public.events e ON e.id = a.event_id
    LEFT JOIN LATERAL (
      SELECT c.gives_points, c.points
      FROM public.custom_event_types c
      WHERE c.value = e.type 
        AND (c.church_id IS NULL OR c.church_id = ul.church_id)
        AND (c.area IS NULL OR c.area = ul.area)
      ORDER BY 
        CASE WHEN c.church_id = ul.church_id THEN 0 ELSE 1 END,
        CASE WHEN c.area = ul.area THEN 0 ELSE 1 END
      LIMIT 1
    ) cet ON true
    WHERE (_church_id IS NULL OR a.church_id = _church_id OR a.church_id IS NULL)
    GROUP BY a.user_id
  ),
  wor_stats AS (
    SELECT wa.user_id, COUNT(*) * _wor_pts as pts
    FROM public.worship_attendance wa
    JOIN user_list ul ON ul.user_id = wa.user_id
    WHERE wa.status = 'aprovado'
      AND (_church_id IS NULL OR wa.church_id = _church_id OR wa.church_id IS NULL)
    GROUP BY wa.user_id
  ),
  ach_stats AS (
    SELECT au.user_id, SUM(COALESCE(au.bonus_points, 0)) as pts
    FROM public.achievement_unlocks au
    JOIN user_list ul ON ul.user_id = au.user_id
    WHERE (_church_id IS NULL OR au.church_id = _church_id OR au.church_id IS NULL)
    GROUP BY au.user_id
  ),
  course_counts AS (
    SELECT l.course_id, COUNT(*) as total_lessons
    FROM public.lessons l
    WHERE (_church_id IS NULL OR l.church_id = _church_id OR l.church_id IS NULL)
    GROUP BY l.course_id
  ),
  user_course_completion AS (
    SELECT lr.user_id, l.course_id, COUNT(DISTINCT lr.lesson_id) as user_lessons
    FROM public.lesson_responses lr
    JOIN public.lessons l ON l.id = lr.lesson_id
    JOIN user_list ul ON ul.user_id = lr.user_id
    WHERE (_church_id IS NULL OR lr.church_id = _church_id OR lr.church_id IS NULL)
    GROUP BY lr.user_id, l.course_id
  ),
  course_bonus_stats AS (
    SELECT ucc.user_id, SUM(_course_pts) as pts
    FROM user_course_completion ucc
    JOIN course_counts cc ON cc.course_id = ucc.course_id
    WHERE ucc.user_lessons >= cc.total_lessons
    GROUP BY ucc.user_id
  ),
  extra_act_stats AS (
    SELECT up.user_id, SUM(COALESCE(act.points, 0)) as pts, COUNT(*) as cnt
    FROM public.user_progress up
    JOIN public.activities act ON act.id = up.activity_id
    JOIN user_list ul ON ul.user_id = up.user_id
    WHERE (_church_id IS NULL OR up.church_id = _church_id OR up.church_id IS NULL)
    GROUP BY up.user_id
  ),
  challenge_stats AS (
    SELECT cp.user_id, SUM(_challenge_pts) as pts
    FROM public.challenge_participants cp
    JOIN user_list ul ON ul.user_id = cp.user_id
    WHERE cp.completed = true
    GROUP BY cp.user_id
  )
  SELECT 
    ul.user_id,
    ul.full_name,
    COALESCE(eas.cnt, 0)::BIGINT as completed_count,
    CAST(
      COALESCE(ls.pts, 0) + 
      COALESCE(ds.pts, 0) + 
      COALESCE(as2.pts, 0) + 
      COALESCE(ws.pts, 0) + 
      COALESCE(achs.pts, 0) + 
      COALESCE(cbs.pts, 0) +
      COALESCE(eas.pts, 0) +
      COALESCE(chs.pts, 0)
    AS BIGINT) as faith_points,
    CAST(
      COALESCE(ls.pts, 0) + 
      COALESCE(ds.pts, 0) + 
      COALESCE(as2.pts, 0) + 
      COALESCE(ws.pts, 0)
    AS BIGINT) as base_points,
    CAST(COALESCE(cbs.pts, 0) AS BIGINT) as course_bonus,
    CAST(COALESCE(achs.pts, 0) AS BIGINT) as achievement_bonus,
    CAST(COALESCE(eas.pts, 0) + COALESCE(chs.pts, 0) AS BIGINT) as other_bonus
  FROM user_list ul
  LEFT JOIN lesson_stats ls ON ls.user_id = ul.user_id
  LEFT JOIN dev_stats ds ON ds.user_id = ul.user_id
  LEFT JOIN att_stats as2 ON as2.user_id = ul.user_id
  LEFT JOIN wor_stats ws ON ws.user_id = ul.user_id
  LEFT JOIN ach_stats achs ON achs.user_id = ul.user_id
  LEFT JOIN course_bonus_stats cbs ON cbs.user_id = ul.user_id
  LEFT JOIN extra_act_stats eas ON eas.user_id = ul.user_id
  LEFT JOIN challenge_stats chs ON chs.user_id = ul.user_id
  ORDER BY faith_points DESC, completed_count DESC;
END;
$$;

-- Update recalculate_ranking to be more descriptive
CREATE OR REPLACE FUNCTION public.recalculate_ranking(
  _church_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSONB;
BEGIN
    -- Check authorization
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'lider')
    ) THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    WITH ranking_data AS (
        SELECT * FROM public.get_community_ranking(NULL, _church_id)
    )
    SELECT jsonb_build_object(
        'status', 'success',
        'message', 'Ranking recalculated dynamically',
        'church_id', _church_id,
        'timestamp', now(),
        'summary', (
            SELECT jsonb_build_object(
                'total_users', count(*),
                'total_faith_points', sum(faith_points),
                'top_player', (SELECT full_name FROM ranking_data LIMIT 1)
            )
            FROM ranking_data
        )
    ) INTO result;

    RETURN result;
END;
$$;
