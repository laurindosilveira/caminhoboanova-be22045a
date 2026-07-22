-- Keep the private follow-up table explicitly closed to API roles while giving
-- PostgreSQL covering indexes for every foreign-key maintenance path.

DROP POLICY IF EXISTS "No direct client access" ON public.leader_follow_ups;
CREATE POLICY "No direct client access"
  ON public.leader_follow_ups
  AS RESTRICTIVE
  FOR ALL
  TO PUBLIC
  USING (false)
  WITH CHECK (false);

CREATE INDEX IF NOT EXISTS idx_leader_follow_ups_turma_id
  ON public.leader_follow_ups (turma_id);

CREATE INDEX IF NOT EXISTS idx_leader_follow_ups_assigned_to
  ON public.leader_follow_ups (assigned_to);

CREATE INDEX IF NOT EXISTS idx_leader_follow_ups_created_by
  ON public.leader_follow_ups (created_by);

CREATE INDEX IF NOT EXISTS idx_leader_follow_ups_completed_by
  ON public.leader_follow_ups (completed_by);
