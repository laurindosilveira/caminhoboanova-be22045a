-- Drop existing function to change signature
DROP FUNCTION IF EXISTS public.get_community_ranking(_community community_name);

-- Updated Ranking function with church_id support and better consistency
CREATE OR REPLACE FUNCTION public.get_community_ranking(
  _community community_name,
  _church_id uuid DEFAULT NULL
)
RETURNS TABLE(
  user_id uuid,
  full_name text,
  completed_count bigint,
  faith_points bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _lesson_pts integer;
  _dev_pts integer;
  _dev_wk_pts integer;
  _dev_recovery_pts integer;
  _att_pts integer;
  _worship_pts integer;
  _course_bonus integer;
  _challenge_pts integer;
BEGIN
  -- Get point configuration
  SELECT
    COALESCE(MAX(CASE WHEN key = 'lesson_points'              THEN value END), 20),
    COALESCE(MAX(CASE WHEN key = 'devotional_points'          THEN value END), 5),
    COALESCE(MAX(CASE WHEN key = 'devotional_weekend_points'  THEN value END), 2),
    COALESCE(MAX(CASE WHEN key = 'devotional_recovery_points' THEN value END), 2),
    COALESCE(MAX(CASE WHEN key = 'attendance_points'          THEN value END), 10),
    COALESCE(MAX(CASE WHEN key = 'worship_points'             THEN value END), 5),
    COALESCE(MAX(CASE WHEN key = 'course_completion_bonus'    THEN value END), 100),
    COALESCE(MAX(CASE WHEN key = 'challenge_points'           THEN value END), 15)
  INTO 
    _lesson_pts, _dev_pts, _dev_wk_pts, _dev_recovery_pts, 
    _att_pts, _worship_pts, _course_bonus, _challenge_pts
  FROM public.game_config;

  RETURN QUERY
  WITH scoped_profiles AS (
    -- Get profiles in the community (and optionally church)
    -- Excluding admins and leaders from the public ranking
    SELECT p.user_id, p.full_name, p.area, p.church_id
    FROM public.profiles p
    WHERE p.community = _community
      AND (_church_id IS NULL OR p.church_id = _church_id)
      AND NOT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = p.user_id
          AND ur.role IN ('admin', 'lider')
      )
  ),
  lesson_points AS (
    -- Count distinct lessons completed
    SELECT lr.user_id, COUNT(DISTINCT lr.lesson_id) * _lesson_pts AS pts
    FROM public.lesson_responses lr
    JOIN scoped_profiles sp ON sp.user_id = lr.user_id
    WHERE (_church_id IS NULL OR lr.church_id = _church_id)
    GROUP BY lr.user_id
  ),
  devotional_pts AS (
    -- Sum devotional points with weekend/recovery logic
    SELECT
      dp.user_id,
      SUM(
        COALESCE(
          dp.awarded_points,
          CASE
            WHEN COALESCE(dp.is_recovery, false) THEN _dev_recovery_pts
            WHEN EXTRACT(DOW FROM dp.completed_at AT TIME ZONE 'America/Sao_Paulo') IN (0, 6) THEN _dev_wk_pts
            ELSE _dev_pts
          END
        )
      ) AS pts
    FROM public.devotional_progress dp
    JOIN scoped_profiles sp ON sp.user_id = dp.user_id
    WHERE (_church_id IS NULL OR dp.church_id = _church_id)
    GROUP BY dp.user_id
  ),
  attendance_pts AS (
    -- Sum attendance points, handling custom types and deleted events
    SELECT
      a.user_id,
      SUM(
        CASE
          WHEN cet.gives_points IS TRUE THEN COALESCE(cet.points, _att_pts)
          ELSE _att_pts
        END
      ) AS pts
    FROM public.attendance a
    JOIN scoped_profiles sp ON sp.user_id = a.user_id
    LEFT JOIN public.events e ON e.id = a.event_id
    LEFT JOIN LATERAL (
      -- Custom points by event type and area
      SELECT cet.gives_points, cet.points
      FROM public.custom_event_types cet
      WHERE cet.value = e.type
        AND (cet.area IS NULL OR cet.area = sp.area::text)
        AND (_church_id IS NULL OR cet.church_id = _church_id)
      ORDER BY CASE WHEN cet.area = sp.area::text THEN 0 ELSE 1 END
      LIMIT 1
    ) cet ON true
    WHERE a.status = 'presente'
      AND (_church_id IS NULL OR a.church_id = _church_id)
    GROUP BY a.user_id
  ),
  worship_pts AS (
    -- Count approved worship attendance
    SELECT wa.user_id, COUNT(*) * _worship_pts AS pts
    FROM public.worship_attendance wa
    JOIN scoped_profiles sp ON sp.user_id = wa.user_id
    WHERE wa.status = 'aprovado'
      AND (_church_id IS NULL OR wa.church_id = _church_id)
    GROUP BY wa.user_id
  ),
  activity_pts AS (
    -- Sum points for generic activities (excluding ones counted elsewhere)
    SELECT up.user_id, COALESCE(SUM(act.points), 0) AS pts, COUNT(up.id) AS cnt
    FROM public.user_progress up
    JOIN public.activities act ON act.id = up.activity_id
    JOIN scoped_profiles sp ON sp.user_id = up.user_id
    WHERE act.type NOT IN ('devocional', 'formacao', 'encontro')
      AND (_church_id IS NULL OR up.church_id = _church_id)
    GROUP BY up.user_id
  ),
  challenge_pts AS (
    -- Count completed community challenges
    SELECT cp.user_id, COUNT(*) * _challenge_pts AS pts
    FROM public.challenge_participants cp
    JOIN scoped_profiles sp ON sp.user_id = cp.user_id
    WHERE cp.completed = true
    GROUP BY cp.user_id
  ),
  course_completion AS (
    -- Calculate course bonuses (when all lessons in a course are completed)
    SELECT sp.user_id, SUM(_course_bonus) as pts
    FROM scoped_profiles sp
    JOIN public.courses c ON (_church_id IS NULL OR c.church_id = _church_id)
    WHERE NOT EXISTS (
      -- Find lessons in this course that the user hasn't responded to
      SELECT 1 
      FROM public.lessons l
      WHERE l.course_id = c.id
        AND NOT EXISTS (
          SELECT 1 
          FROM public.lesson_responses lr 
          WHERE lr.lesson_id = l.id 
            AND lr.user_id = sp.user_id
        )
    )
    -- Ensure the course actually has lessons
    AND EXISTS (SELECT 1 FROM public.lessons l WHERE l.course_id = c.id)
    GROUP BY sp.user_id
  ),
  achievement_pts AS (
    -- Sum points from unlocked achievements
    SELECT au.user_id, COALESCE(SUM(au.bonus_points), 0) AS pts
    FROM public.achievement_unlocks au
    JOIN scoped_profiles sp ON sp.user_id = au.user_id
    WHERE (_church_id IS NULL OR au.church_id = _church_id)
    GROUP BY au.user_id
  )
  SELECT 
    sp.user_id, 
    sp.full_name,
    COALESCE(ap.cnt, 0)::bigint AS completed_count,
    (
      COALESCE(lp.pts, 0) + 
      COALESCE(dp.pts, 0) + 
      COALESCE(atp.pts, 0) +
      COALESCE(ap.pts, 0) + 
      COALESCE(cc.pts, 0) + 
      COALESCE(wp.pts, 0) +
      COALESCE(achp.pts, 0) + 
      COALESCE(chp.pts, 0)
    )::bigint AS faith_points
  FROM scoped_profiles sp
  LEFT JOIN lesson_points lp ON lp.user_id = sp.user_id
  LEFT JOIN devotional_pts dp ON dp.user_id = sp.user_id
  LEFT JOIN attendance_pts atp ON atp.user_id = sp.user_id
  LEFT JOIN activity_pts ap ON ap.user_id = sp.user_id
  LEFT JOIN course_completion cc ON cc.user_id = sp.user_id
  LEFT JOIN worship_pts wp ON wp.user_id = sp.user_id
  LEFT JOIN achievement_pts achp ON achp.user_id = sp.user_id
  LEFT JOIN challenge_pts chp ON chp.user_id = sp.user_id
  ORDER BY faith_points DESC, completed_count DESC;
END;
$$;