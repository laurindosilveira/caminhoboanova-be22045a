-- REVIEW CANDIDATE ONLY. No historical area can be reconstructed from a
-- student's present group. Retain owner access without granting old answers
-- to the current leader merely because the group assignment has changed.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename IN ('lesson_responses', 'devotional_responses')
      AND (cmd = 'ALL' OR policyname NOT IN ('Tenant-owned rows select','Tenant-owned rows insert','Tenant-owned rows update','Tenant-owned rows delete'))) THEN
    RAISE EXCEPTION 'UNREVIEWED_LEARNING_POLICY';
  END IF;
  IF (SELECT count(*) FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename IN ('lesson_responses', 'devotional_responses')
      AND cmd = 'SELECT' AND policyname = 'Tenant-owned rows select') <> 2 THEN
    RAISE EXCEPTION 'EXPECTED_LEARNING_READ_POLICIES_MISSING';
  END IF;
  IF (SELECT count(*) FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename IN ('lesson_responses', 'devotional_responses')
      AND ((cmd = 'INSERT' AND policyname = 'Tenant-owned rows insert')
        OR (cmd = 'UPDATE' AND policyname = 'Tenant-owned rows update')
        OR (cmd = 'DELETE' AND policyname = 'Tenant-owned rows delete'))) <> 6 THEN
    RAISE EXCEPTION 'EXPECTED_LEARNING_WRITE_POLICIES_MISSING';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename IN ('lesson_progress', 'devotional_progress')
      AND cmd IN ('DELETE','ALL') AND policyname <> 'member_scope_delete')
    OR (SELECT count(*) FROM pg_catalog.pg_policies
      WHERE schemaname = 'public' AND tablename IN ('lesson_progress', 'devotional_progress')
        AND cmd = 'DELETE' AND policyname = 'member_scope_delete') <> 2 THEN
    RAISE EXCEPTION 'UNREVIEWED_PROGRESS_DELETE_POLICY';
  END IF;
END $$;

CREATE FUNCTION private.is_active_learning_owner(p_owner uuid, p_church uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT p_owner = (SELECT auth.uid()) AND p_church IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = p_owner AND p.church_id = p_church
      AND coalesce(p.is_active, true)
  )
$$;
REVOKE ALL ON FUNCTION private.is_active_learning_owner(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_active_learning_owner(uuid, uuid) TO authenticated;

DROP POLICY "Tenant-owned rows select" ON public.lesson_responses;
CREATE POLICY "historical answers owner select" ON public.lesson_responses FOR SELECT TO authenticated
  USING (private.is_active_learning_owner(user_id, church_id));
DROP POLICY "Tenant-owned rows select" ON public.devotional_responses;
CREATE POLICY "historical answers owner select" ON public.devotional_responses FOR SELECT TO authenticated
  USING (private.is_active_learning_owner(user_id, church_id));

DO $$
DECLARE v_table text;
BEGIN
  FOREACH v_table IN ARRAY ARRAY['lesson_responses','devotional_responses'] LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', 'Tenant-owned rows insert', v_table);
    EXECUTE format('DROP POLICY %I ON public.%I', 'Tenant-owned rows update', v_table);
    EXECUTE format('DROP POLICY %I ON public.%I', 'Tenant-owned rows delete', v_table);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (private.is_active_learning_owner(user_id,church_id))', 'answers owner insert', v_table);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (private.is_active_learning_owner(user_id,church_id)) WITH CHECK (private.is_active_learning_owner(user_id,church_id))', 'answers owner update', v_table);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (private.is_active_learning_owner(user_id,church_id))', 'answers owner delete', v_table);
  END LOOP;
END $$;

-- Deleting devotional progress can cascade to the student's answers. Prevent
-- a leader's direct Data API request from bypassing the owner-only answer rule.
DO $$
DECLARE v_table text;
BEGIN
  FOREACH v_table IN ARRAY ARRAY['lesson_progress','devotional_progress'] LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', 'member_scope_delete', v_table);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (private.is_active_learning_owner(user_id,church_id))', 'progress owner delete', v_table);
  END LOOP;
END $$;

-- This definer function deletes whole personal histories, including records
-- predating a group transfer. Suspend it until a scoped replacement exists.
DO $$ BEGIN
  IF to_regprocedure('public.reset_turma_journey(uuid)') IS NULL THEN
    RAISE EXCEPTION 'EXPECTED_GROUP_RESET_MISSING';
  END IF;
END $$;
REVOKE EXECUTE ON FUNCTION public.reset_turma_journey(uuid) FROM PUBLIC, anon, authenticated;
