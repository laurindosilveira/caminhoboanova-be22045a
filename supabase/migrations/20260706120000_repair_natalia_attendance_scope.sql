-- Natalia belongs to Area 2, but her imported turma_id points to the Area 1
-- class. Agenda attendance is scoped by turma in some views, so keep both
-- profile dimensions consistent.

DO $$
DECLARE
  v_user_id CONSTANT uuid := '914b898d-24a3-46ad-a764-d2f24e5115d1';
  v_area_2_turma_id uuid;
BEGIN
  SELECT t.id
  INTO v_area_2_turma_id
  FROM public.turmas t
  JOIN public.profiles p ON p.user_id = v_user_id
  WHERE t.church_id = p.church_id
    AND t.area = 'Área 2'
    AND t.is_active = true
  ORDER BY
    CASE WHEN t.name = 'Confirmatório 2026 - Área 2' THEN 0 ELSE 1 END,
    t.created_at
  LIMIT 1;

  IF v_area_2_turma_id IS NULL THEN
    RAISE EXCEPTION 'Active Area 2 turma not found for Natalia''s church';
  END IF;

  UPDATE public.profiles
  SET turma_id = v_area_2_turma_id,
      area = 'Área 2',
      updated_at = now()
  WHERE user_id = v_user_id
    AND (
      turma_id IS DISTINCT FROM v_area_2_turma_id
      OR area IS DISTINCT FROM 'Área 2'
    );
END;
$$;

-- Fail loudly if this repair is deployed without the atomic persistence
-- migrations required by lesson and devotional completion.
DO $$
BEGIN
  IF to_regprocedure(
    'public.complete_lesson(uuid,jsonb,boolean,boolean,integer,uuid)'
  ) IS NULL THEN
    RAISE EXCEPTION 'Required function public.complete_lesson is missing';
  END IF;

  IF to_regprocedure(
    'public.complete_devotional(uuid,jsonb,boolean,integer,uuid)'
  ) IS NULL THEN
    RAISE EXCEPTION 'Required function public.complete_devotional is missing';
  END IF;
END;
$$;
