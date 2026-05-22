CREATE OR REPLACE FUNCTION public.get_community_ranking(_community community_name, _church_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(user_id uuid, full_name text, completed_count bigint, faith_points bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    -- Count distinct lessons completed (removed church filter to include all user points)
    SELECT lr.user_id, COUNT(DISTINCT lr.lesson_id) * _lesson_pts AS pts
    FROM public.lesson_responses lr
    JOIN scoped_profiles sp ON sp.user_id = lr.user_id
    GROUP BY lr.user_id
  ),
  devotional_pts AS (
    -- Sum devotional points (removed church filter to include all user points)
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
    GROUP BY dp.user_id
  ),
  attendance_pts AS (
    -- Sum attendance points (removed church filter to include all user points)
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
      ORDER BY CASE WHEN cet.area = sp.area::text THEN 0 ELSE 1 END
      LIMIT 1
    ) cet ON true
    WHERE a.status = 'presente'
    GROUP BY a.user_id
  ),
  worship_pts AS (
    -- Count approved worship attendance (removed church filter)
    SELECT wa.user_id, COUNT(*) * _worship_pts AS pts
    FROM public.worship_attendance wa
    JOIN scoped_profiles sp ON sp.user_id = wa.user_id
    WHERE wa.status = 'aprovado'
    GROUP BY wa.user_id
  ),
  activity_pts AS (
    -- Sum points for generic activities (removed church filter)
    SELECT up.user_id, COALESCE(SUM(act.points), 0) AS pts, COUNT(up.id) AS cnt
    FROM public.user_progress up
    JOIN public.activities act ON act.id = up.activity_id
    JOIN scoped_profiles sp ON sp.user_id = up.user_id
    GROUP BY up.user_id
  ),
  achievement_pts AS (
    -- Achievement points (removed church filter)
    SELECT ua.user_id, SUM(ach.points) AS pts
    FROM public.user_achievements ua
    JOIN public.achievements ach ON ach.id = ua.achievement_id
    JOIN scoped_profiles sp ON sp.user_id = ua.user_id
    GROUP BY ua.user_id
  ),
  challenge_pts AS (
    -- Challenge points (removed church filter)
    SELECT up.user_id, COUNT(*) * _challenge_pts AS pts
    FROM public.user_progress up
    JOIN public.activities act ON act.id = up.activity_id
    JOIN scoped_profiles sp ON sp.user_id = up.user_id
    WHERE act.type = 'desafio'
    GROUP BY up.user_id
  )
  SELECT
    sp.user_id,
    sp.full_name,
    COALESCE(ap.cnt, 0)::bigint AS completed_count,
    (
      COALESCE(lp.pts, 0) +
      COALESCE(dp.pts, 0) +
      COALESCE(atp.pts, 0) +
      COALESCE(wp.pts, 0) +
      COALESCE(ap.pts, 0) +
      COALESCE(achp.pts, 0) +
      COALESCE(chp.pts, 0)
    )::bigint AS faith_points
  FROM scoped_profiles sp
  LEFT JOIN lesson_points lp ON lp.user_id = sp.user_id
  LEFT JOIN devotional_pts dp ON dp.user_id = sp.user_id
  LEFT JOIN attendance_pts atp ON atp.user_id = sp.user_id
  LEFT JOIN worship_pts wp ON wp.user_id = sp.user_id
  LEFT JOIN activity_pts ap ON ap.user_id = sp.user_id
  LEFT JOIN achievement_pts achp ON achp.user_id = sp.user_id
  LEFT JOIN challenge_pts chp ON chp.user_id = sp.user_id
  ORDER BY faith_points DESC;
END;
$function$;
