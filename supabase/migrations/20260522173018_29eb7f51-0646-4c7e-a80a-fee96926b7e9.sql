CREATE OR REPLACE FUNCTION public.get_community_ranking(_community public.community_name, _church_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(user_id uuid, full_name text, completed_count bigint, faith_points bigint)
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
  RETURN QUERY
  WITH lesson_pts AS (
    SELECT lr.user_id, COUNT(*) * (SELECT COALESCE(CAST(value AS INTEGER), 15) FROM game_config WHERE key = 'lesson_points') as pts
    FROM lesson_responses lr
    GROUP BY lr.user_id
  ),
  devotional_pts AS (
    SELECT 
      dp.user_id, 
      SUM(
        CASE 
          WHEN dp.awarded_points IS NOT NULL THEN dp.awarded_points
          WHEN dp.is_recovery = true THEN (SELECT COALESCE(CAST(value AS INTEGER), 2) FROM game_config WHERE key = 'devotional_recovery_points')
          WHEN EXTRACT(DOW FROM dp.completed_at) IN (0, 6) THEN (SELECT COALESCE(CAST(value AS INTEGER), 2) FROM game_config WHERE key = 'devotional_weekend_points')
          ELSE (SELECT COALESCE(CAST(value AS INTEGER), 5) FROM game_config WHERE key = 'devotional_points')
        END
      ) as pts
    FROM devotional_progress dp
    GROUP BY dp.user_id
  ),
  attendance_pts AS (
    SELECT a.user_id, COUNT(*) * (SELECT COALESCE(CAST(value AS INTEGER), 15) FROM game_config WHERE key = 'attendance_points') as pts
    FROM attendance a
    WHERE a.status = 'presente'
    GROUP BY a.user_id
  ),
  worship_pts AS (
    SELECT wa.user_id, COUNT(*) * (SELECT COALESCE(CAST(value AS INTEGER), 5) FROM game_config WHERE key = 'worship_points') as pts
    FROM worship_attendance wa
    WHERE wa.status = 'aprovado'
    GROUP BY wa.user_id
  ),
  achievement_pts AS (
    SELECT au.user_id, SUM(COALESCE(au.bonus_points, 0)) as pts
    FROM achievement_unlocks au
    GROUP BY au.user_id
  ),
  challenge_pts AS (
    SELECT cp.user_id, COUNT(*) * (SELECT COALESCE(CAST(value AS INTEGER), 15) FROM game_config WHERE key = 'challenge_points') as pts
    FROM challenge_participants cp
    WHERE cp.completed = true
    GROUP BY cp.user_id
  ),
  user_stats AS (
    SELECT 
      p.user_id, 
      p.full_name,
      COALESCE((SELECT count(*) FROM user_progress up WHERE up.user_id = p.user_id), 0) as completed_activities
    FROM public.profiles p
    WHERE p.community = _community AND (_church_id IS NULL OR p.church_id = _church_id)
  )
  SELECT 
    us.user_id,
    us.full_name,
    us.completed_activities as completed_count,
    CAST(
      COALESCE(lp.pts, 0) + 
      COALESCE(dp.pts, 0) + 
      COALESCE(atp.pts, 0) + 
      COALESCE(wp.pts, 0) + 
      COALESCE(achp.pts, 0) + 
      COALESCE(chp.pts, 0) 
    AS bigint) as faith_points
  FROM user_stats us
  LEFT JOIN lesson_pts lp ON lp.user_id = us.user_id
  LEFT JOIN devotional_pts dp ON dp.user_id = us.user_id
  LEFT JOIN attendance_pts atp ON atp.user_id = us.user_id
  LEFT JOIN worship_pts wp ON wp.user_id = us.user_id
  LEFT JOIN achievement_pts achp ON achp.user_id = us.user_id
  LEFT JOIN challenge_pts chp ON chp.user_id = us.user_id
  ORDER BY faith_points DESC;
END;
$function$;