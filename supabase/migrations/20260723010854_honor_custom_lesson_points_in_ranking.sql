-- Ranking must honor reduced/custom lesson points instead of assigning the
-- standard lesson score to every completed lesson.
DO $$
DECLARE
  function_definition TEXT;
  old_lesson_stats CONSTANT TEXT := E'lesson_stats AS (\n    SELECT lr.user_id, COUNT(DISTINCT lr.lesson_id) * _lesson_pts AS pts\n    FROM lesson_responses lr\n    WHERE lr.user_id = ANY(_user_ids)\n    GROUP BY lr.user_id\n  ),';
  new_lesson_stats CONSTANT TEXT := E'lesson_stats AS (\n    SELECT per_lesson.user_id, SUM(per_lesson.pts) AS pts\n    FROM (\n      SELECT\n        lr.user_id,\n        lr.lesson_id,\n        COALESCE(MAX(lr.awarded_points), _lesson_pts) AS pts\n      FROM lesson_responses lr\n      WHERE lr.user_id = ANY(_user_ids)\n      GROUP BY lr.user_id, lr.lesson_id\n    ) AS per_lesson\n    GROUP BY per_lesson.user_id\n  ),';
BEGIN
  SELECT pg_get_functiondef(
    'public.get_community_ranking_internal(public.community_name,uuid)'::regprocedure
  ) INTO function_definition;

  IF position(old_lesson_stats IN function_definition) = 0 THEN
    IF position('awarded_points' IN function_definition) > 0 THEN
      RETURN;
    END IF;
    RAISE EXCEPTION 'No supported lesson_stats block was found in get_community_ranking_internal';
  END IF;

  EXECUTE replace(function_definition, old_lesson_stats, new_lesson_stats);
END;
$$;
