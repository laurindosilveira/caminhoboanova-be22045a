-- Run only against an isolated restored database after the complete guard.
-- This test uses an existing student's rows as fixtures, prints no personal
-- data and rolls back every operation. Never run it against production.
BEGIN;

DO $$
DECLARE
  v_user uuid;
  v_lesson uuid;
  v_devotional uuid;
  v_lesson_progress uuid;
  v_devotional_progress uuid;
BEGIN
  SELECT l.user_id, l.id, d.id, lp.id, dp.id
    INTO v_user, v_lesson, v_devotional, v_lesson_progress, v_devotional_progress
  FROM public.lesson_responses l
  JOIN public.devotional_responses d ON d.user_id = l.user_id
  JOIN public.profiles p ON p.user_id = l.user_id
    AND p.church_id = l.church_id AND p.church_id = d.church_id
  JOIN public.lesson_progress lp ON lp.user_id = l.user_id AND lp.church_id = p.church_id
  JOIN public.devotional_progress dp ON dp.user_id = l.user_id AND dp.church_id = p.church_id
  LIMIT 1;
  IF v_user IS NULL THEN RAISE EXCEPTION 'Missing isolated test fixture'; END IF;
  PERFORM set_config('request.jwt.claim.sub', v_user::text, true);
  PERFORM set_config('test.guard_lesson_row', v_lesson::text, true);
  PERFORM set_config('test.guard_devotional_row', v_devotional::text, true);
  PERFORM set_config('test.guard_lesson_progress', v_lesson_progress::text, true);
  PERFORM set_config('test.guard_devotional_progress', v_devotional_progress::text, true);
END;
$$;

SET LOCAL ROLE authenticated;

DO $$
DECLARE
  v_id uuid;
  v_table text;
  v_operation text;
  v_count integer;
  v_item_column text;
  v_question_column text;
BEGIN
  FOREACH v_table IN ARRAY ARRAY['lesson_responses', 'devotional_responses',
    'lesson_progress', 'devotional_progress'] LOOP
    v_id := current_setting(CASE v_table
      WHEN 'lesson_responses' THEN 'test.guard_lesson_row'
      WHEN 'devotional_responses' THEN 'test.guard_devotional_row'
      WHEN 'lesson_progress' THEN 'test.guard_lesson_progress'
      ELSE 'test.guard_devotional_progress' END)::uuid;
    EXECUTE format('SELECT count(*) FROM public.%I WHERE id = $1', v_table)
      INTO v_count USING v_id;
    IF v_count <> 1 THEN RAISE EXCEPTION 'Fixture is not visible through RLS: %', v_table; END IF;

    FOREACH v_operation IN ARRAY ARRAY['UPDATE', 'DELETE'] LOOP
      BEGIN
        IF v_operation = 'UPDATE' THEN
          IF v_table IN ('lesson_responses', 'devotional_responses') THEN
            EXECUTE format('UPDATE public.%I SET response = response WHERE id = $1', v_table) USING v_id;
          ELSE
            EXECUTE format('UPDATE public.%I SET completed_at = completed_at WHERE id = $1', v_table) USING v_id;
          END IF;
        ELSE
          EXECUTE format('DELETE FROM public.%I WHERE id = $1', v_table) USING v_id;
        END IF;
        RAISE EXCEPTION 'Legacy operation unexpectedly succeeded: % %', v_table, v_operation;
      EXCEPTION WHEN SQLSTATE '55000' THEN
        IF SQLERRM <> 'APP_UPDATE_REQUIRED' THEN RAISE; END IF;
      END;
    END LOOP;

    IF v_table IN ('lesson_responses', 'devotional_responses') THEN
      v_item_column := CASE WHEN v_table = 'lesson_responses' THEN 'lesson_id' ELSE 'devotional_id' END;
      v_question_column := CASE WHEN v_table = 'lesson_responses' THEN 'question_key' ELSE 'question_index' END;
      BEGIN
        EXECUTE format(
          'INSERT INTO public.%1$I (user_id,%2$I,%3$I,response,church_id) '
          'SELECT user_id,%2$I,%3$I,''[tentativa-antiga]'',church_id FROM public.%1$I WHERE id=$1 '
          'ON CONFLICT (user_id,%2$I,%3$I) DO UPDATE SET response=EXCLUDED.response',
          v_table, v_item_column, v_question_column) USING v_id;
        RAISE EXCEPTION 'Legacy upsert unexpectedly succeeded: %', v_table;
      EXCEPTION WHEN SQLSTATE '55000' THEN
        IF SQLERRM <> 'APP_UPDATE_REQUIRED' THEN RAISE; END IF;
      END;
    END IF;

    EXECUTE format('SELECT count(*) FROM public.%I WHERE id = $1', v_table)
      INTO v_count USING v_id;
    IF v_count <> 1 THEN RAISE EXCEPTION 'The saved answer was not preserved'; END IF;
  END LOOP;
END;
$$;

-- A stale new client must see a conflict, and the protected path must still
-- save when the supplied baseline matches the latest version.
DO $$
DECLARE
  v_item uuid;
  v_key text;
  v_current text;
  v_result jsonb;
BEGIN
  SELECT lesson_id, question_key, response INTO v_item, v_key, v_current
  FROM public.lesson_responses
  WHERE id = current_setting('test.guard_lesson_row')::uuid;

  v_result := public.sync_owned_learning(auth.uid(), 'save_lesson_draft', v_item,
    jsonb_build_object(v_key, '[ensaio-sintetico]'), false, false, false,
    NULL, NULL, jsonb_build_object(v_key, '[base-antiga-que-nao-corresponde]'));
  IF v_result->>'status' <> 'conflict' THEN RAISE EXCEPTION 'Stale write did not conflict'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.lesson_responses
    WHERE id = current_setting('test.guard_lesson_row')::uuid
      AND response IS NOT DISTINCT FROM v_current) THEN
    RAISE EXCEPTION 'Conflict changed the latest answer';
  END IF;

  v_result := public.sync_owned_learning(auth.uid(), 'save_lesson_draft', v_item,
    jsonb_build_object(v_key, '[ensaio-sintetico]'), false, false, false,
    NULL, NULL, jsonb_build_object(v_key, v_current));
  IF v_result->>'status' <> 'synced' THEN RAISE EXCEPTION 'Protected save failed'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.lesson_responses
    WHERE id = current_setting('test.guard_lesson_row')::uuid
      AND response = '[ensaio-sintetico]') THEN
    RAISE EXCEPTION 'Protected save was not persisted';
  END IF;
END;
$$;

-- Completion also changes progress; the guard must permit both operations
-- when they belong to the same authorized synchronization.
DO $$
DECLARE
  v_item uuid;
  v_key text;
  v_previous jsonb;
  v_next jsonb;
  v_result jsonb;
BEGIN
  SELECT devotional_id INTO v_item FROM public.devotional_responses
  WHERE id = current_setting('test.guard_devotional_row')::uuid;
  SELECT jsonb_object_agg(question_index::text, response), min(question_index)::text
    INTO v_previous, v_key FROM public.devotional_responses
    WHERE user_id = auth.uid() AND devotional_id = v_item;
  v_next := jsonb_set(v_previous, ARRAY[v_key], to_jsonb('[ensaio-sintetico]'::text));
  v_result := public.sync_owned_learning(auth.uid(), 'complete_devotional', v_item, v_next,
    false, false, false, NULL, NULL, v_previous);
  IF v_result->>'status' <> 'synced' THEN RAISE EXCEPTION 'Protected devotional failed'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.devotional_responses
    WHERE user_id = auth.uid() AND devotional_id = v_item
      AND question_index::text = v_key AND response = '[ensaio-sintetico]') THEN
    RAISE EXCEPTION 'Protected devotional was not persisted';
  END IF;
END;
$$;

ROLLBACK;
