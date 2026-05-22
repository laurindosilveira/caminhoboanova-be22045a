-- Create a table for ranking validation logs
CREATE TABLE IF NOT EXISTS public.ranking_validation_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    church_id UUID,
    ranking_score BIGINT NOT NULL,
    calculated_score BIGINT NOT NULL,
    divergence BIGINT NOT NULL,
    breakdown JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ranking_validation_logs ENABLE ROW LEVEL SECURITY;

-- Policies for ranking validation logs (admins and leaders can view)
CREATE POLICY "Admins and leaders can view logs" 
ON public.ranking_validation_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('admin', 'lider')
  )
);

CREATE POLICY "Users can insert their own validation reports" 
ON public.ranking_validation_logs 
FOR INSERT 
WITH CHECK (true); -- Allow any client to report a divergence it found

-- Update get_community_ranking to include breakdown
DROP FUNCTION IF EXISTS public.get_community_ranking(_community community_name, _church_id uuid);

CREATE OR REPLACE FUNCTION public.get_community_ranking(_community community_name, _church_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(
    user_id uuid, 
    full_name text, 
    completed_count bigint, 
    faith_points bigint,
    base_points bigint,
    course_bonus bigint,
    achievement_bonus bigint,
    other_bonus bigint
 )
 LANGUAGE plpgsql
 STABLE
AS $function$
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
  -- Load config values once
  SELECT COALESCE(CAST(value AS INTEGER), 20) INTO _lesson_pts FROM game_config WHERE key = 'lesson_points';
  SELECT COALESCE(CAST(value AS INTEGER), 5) INTO _dev_pts FROM game_config WHERE key = 'devotional_points';
  SELECT COALESCE(CAST(value AS INTEGER), 2) INTO _dev_wk_pts FROM game_config WHERE key = 'devotional_weekend_points';
  SELECT COALESCE(CAST(value AS INTEGER), 2) INTO _dev_rec_pts FROM game_config WHERE key = 'devotional_recovery_points';
  SELECT COALESCE(CAST(value AS INTEGER), 15) INTO _att_pts FROM game_config WHERE key = 'attendance_points';
  SELECT COALESCE(CAST(value AS INTEGER), 5) INTO _wor_pts FROM game_config WHERE key = 'worship_points';
  SELECT COALESCE(CAST(value AS INTEGER), 100) INTO _course_pts FROM game_config WHERE key = 'course_completion_bonus';
  SELECT COALESCE(CAST(value AS INTEGER), 15) INTO _challenge_pts FROM game_config WHERE key = 'challenge_points';

  RETURN QUERY
  WITH lesson_stats AS (
    SELECT lr.user_id, COUNT(DISTINCT lr.lesson_id) * _lesson_pts as pts
    FROM lesson_responses lr
    GROUP BY lr.user_id
  ),
  dev_stats AS (
    SELECT 
      dp.user_id, 
      SUM(
        CASE 
          WHEN dp.awarded_points IS NOT NULL THEN dp.awarded_points
          WHEN dp.is_recovery = true THEN _dev_rec_pts
          WHEN EXTRACT(DOW FROM dp.completed_at) IN (0, 6) THEN _dev_wk_pts
          ELSE _dev_pts
        END
      ) as pts
    FROM devotional_progress dp
    GROUP BY dp.user_id
  ),
  att_stats AS (
    SELECT 
        a.user_id, 
        SUM(
            CASE 
                WHEN a.status != 'presente' THEN 0
                WHEN cet.gives_points = true THEN COALESCE(cet.points, _att_pts)
                ELSE _att_pts
            END
        ) as pts
    FROM attendance a
    JOIN events e ON e.id = a.event_id
    LEFT JOIN custom_event_types cet ON cet.value = e.type AND (cet.area IS NULL OR cet.area = e.area)
    GROUP BY a.user_id
  ),
  wor_stats AS (
    SELECT wa.user_id, COUNT(*) * _wor_pts as pts
    FROM worship_attendance wa
    WHERE wa.status = 'aprovado'
    GROUP BY wa.user_id
  ),
  ach_stats AS (
    SELECT au.user_id, SUM(COALESCE(au.bonus_points, 0)) as pts
    FROM achievement_unlocks au
    GROUP BY au.user_id
  ),
  course_counts AS (
    SELECT l.course_id, COUNT(*) as total_lessons
    FROM lessons l
    GROUP BY l.course_id
  ),
  user_course_completion AS (
    SELECT lr.user_id, l.course_id, COUNT(DISTINCT lr.lesson_id) as user_lessons
    FROM lesson_responses lr
    JOIN lessons l ON l.id = lr.lesson_id
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
    SELECT up.user_id, SUM(COALESCE(act.points, 0)) as pts
    FROM user_progress up
    JOIN activities act ON act.id = up.activity_id
    WHERE act.type NOT IN ('devocional', 'formacao', 'encontro')
    GROUP BY up.user_id
  ),
  challenge_stats AS (
    SELECT cp.user_id, SUM(_challenge_pts) as pts
    FROM challenge_participants cp
    WHERE cp.completed = true
    GROUP BY cp.user_id
  ),
  user_list AS (
    SELECT 
      p.user_id, 
      p.full_name,
      COALESCE((SELECT count(*) FROM user_progress up WHERE up.user_id = p.user_id), 0) as completed_count
    FROM public.profiles p
    WHERE p.community = _community AND (_church_id IS NULL OR p.church_id = _church_id)
  )
  SELECT 
    ul.user_id,
    ul.full_name,
    ul.completed_count,
    CAST(
      COALESCE(ls.pts, 0) + 
      COALESCE(ds.pts, 0) + 
      COALESCE(as2.pts, 0) + 
      COALESCE(ws.pts, 0) + 
      COALESCE(achs.pts, 0) + 
      COALESCE(cbs.pts, 0) +
      COALESCE(eas.pts, 0) +
      COALESCE(chs.pts, 0)
    AS bigint) as faith_points,
    CAST(
      COALESCE(ls.pts, 0) + 
      COALESCE(ds.pts, 0) + 
      COALESCE(as2.pts, 0) + 
      COALESCE(ws.pts, 0)
    AS bigint) as base_points,
    CAST(COALESCE(cbs.pts, 0) AS bigint) as course_bonus,
    CAST(COALESCE(achs.pts, 0) AS bigint) as achievement_bonus,
    CAST(COALESCE(eas.pts, 0) + COALESCE(chs.pts, 0) AS bigint) as other_bonus
  FROM user_list ul
  LEFT JOIN lesson_stats ls ON ls.user_id = ul.user_id
  LEFT JOIN dev_stats ds ON ds.user_id = ul.user_id
  LEFT JOIN att_stats as2 ON as2.user_id = ul.user_id
  LEFT JOIN wor_stats ws ON ws.user_id = ul.user_id
  LEFT JOIN ach_stats achs ON achs.user_id = ul.user_id
  LEFT JOIN course_bonus_stats cbs ON cbs.user_id = ul.user_id
  LEFT JOIN extra_act_stats eas ON eas.user_id = ul.user_id
  LEFT JOIN challenge_stats chs ON chs.user_id = ul.user_id
  ORDER BY faith_points DESC;
END;
$function$;

-- Function to recalculate ranking for a church (mainly to verify and potentially sync external caches)
CREATE OR REPLACE FUNCTION public.recalculate_ranking(_church_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    total_users INT;
BEGIN
    -- Check if user is admin/lider
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.user_id = auth.uid() 
        AND profiles.role IN ('admin', 'lider')
    ) THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    -- For now, this function returns a summary of the ranking for the church
    -- In a more complex system, it could update a 'cached_ranking' table.
    -- Here we use it as a verification tool.
    
    WITH ranking AS (
        SELECT * FROM public.get_community_ranking(
            (SELECT community FROM public.profiles WHERE church_id = _church_id LIMIT 1),
            _church_id
        )
    )
    SELECT jsonb_build_object(
        'church_id', _church_id,
        'recalculated_at', now(),
        'total_users', count(*),
        'total_points', sum(faith_points),
        'top_user', (SELECT full_name FROM ranking LIMIT 1)
    ) INTO result
    FROM ranking;

    RETURN result;
END;
$$;