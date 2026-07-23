-- Late lessons are intentionally worth exactly one point. Keep the existing
-- completion function and broaden only its explicit reduced-points branch.
DO $$
DECLARE
  function_definition TEXT;
  old_branch CONSTANT TEXT := E'ELSIF p_awarded_points = 0 THEN\n    v_effective_points := 0;';
  new_branch CONSTANT TEXT := E'ELSIF p_awarded_points BETWEEN 0 AND 1 THEN\n    v_effective_points := p_awarded_points;';
BEGIN
  SELECT pg_get_functiondef(
    'public.complete_lesson(uuid,jsonb,boolean,boolean,integer,uuid)'::regprocedure
  ) INTO function_definition;

  IF position(old_branch IN function_definition) = 0 THEN
    IF position(new_branch IN function_definition) > 0 THEN
      RETURN;
    END IF;
    RAISE EXCEPTION 'Expected reduced-points branch was not found in complete_lesson';
  END IF;

  EXECUTE replace(function_definition, old_branch, new_branch);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.complete_lesson(UUID, JSONB, BOOLEAN, BOOLEAN, INTEGER, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_lesson(UUID, JSONB, BOOLEAN, BOOLEAN, INTEGER, UUID) TO authenticated;
