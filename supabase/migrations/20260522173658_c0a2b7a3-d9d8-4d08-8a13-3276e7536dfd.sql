CREATE OR REPLACE FUNCTION public.get_community_ranking(_community public.community_name, _church_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(user_id uuid, full_name text, completed_count bigint, faith_points bigint)
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
    SELECT lr.user_id, COUNT(DISTINCT lr.lesson_id) as l_count
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
    SELECT a.user_id, SUM(CASE WHEN a.status = 'presente' THEN _att_pts ELSE 0 END) as pts
    FROM attendance a
    WHERE a.status IN ('presente', 'faltou', 'falta', 'justificou', 'justificado')
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
    SELECT cp.user_id, COUNT(*) * _challenge_pts as pts
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
      COALESCE(ls.l_count, 0) * _lesson_pts + 
      COALESCE(ds.pts, 0) + 
      COALESCE(as2.pts, 0) + 
      COALESCE(ws.pts, 0) + 
      COALESCE(achs.pts, 0) + 
      COALESCE(cbs.pts, 0) +
      COALESCE(eas.pts, 0) +
      COALESCE(chs.pts, 0)
    AS bigint) as faith_points
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