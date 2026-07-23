-- Daily leader care dashboard. All reads and writes go through tenant-aware RPCs.

CREATE TABLE IF NOT EXISTS public.leader_follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id uuid NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  turma_id uuid REFERENCES public.turmas(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  kind text NOT NULL CHECK (kind IN ('contact', 'note', 'task', 'pastoral_request')),
  title text NOT NULL,
  notes text,
  due_at timestamptz,
  contacted_at timestamptz,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'completed', 'cancelled')),
  completed_at timestamptz,
  completed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.leader_follow_ups ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.leader_follow_ups FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.leader_follow_ups TO service_role;

CREATE INDEX IF NOT EXISTS idx_leader_follow_ups_scope_open
  ON public.leader_follow_ups (church_id, turma_id, status, due_at)
  WHERE status = 'open';

CREATE INDEX IF NOT EXISTS idx_leader_follow_ups_user_created
  ON public.leader_follow_ups (user_id, created_at DESC);

ALTER TABLE public.discipleship_plans
  ADD COLUMN IF NOT EXISTS pastoral_request_resolved_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_completed_at
  ON public.lesson_progress (user_id, completed_at DESC)
  WHERE is_completed = true;

CREATE INDEX IF NOT EXISTS idx_devotional_progress_user_completed_at
  ON public.devotional_progress (user_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_user_created_at
  ON public.attendance (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_worship_attendance_user_created_at
  ON public.worship_attendance (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_spiritual_assessments_user_created_at
  ON public.spiritual_assessments (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_login_audit_church_email_created
  ON public.login_audit_logs (church_id, lower(email), created_at DESC)
  WHERE status = 'success';

CREATE OR REPLACE FUNCTION public.get_leader_care_dashboard(
  p_turma_id uuid DEFAULT NULL,
  p_area text DEFAULT NULL,
  p_church_id uuid DEFAULT NULL
)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  community text,
  phone text,
  avatar_url text,
  care_status text,
  care_reasons text[],
  last_activity_at timestamptz,
  last_activity_source text,
  last_access_at timestamptz,
  course_progress integer,
  lessons_completed integer,
  lessons_total integer,
  progress_trend text,
  trend_delta integer,
  attendance_4_present integer,
  attendance_4_total integer,
  attendance_8_present integer,
  attendance_8_total integer,
  devotionals_7 integer,
  devotionals_14 integer,
  devotionals_30 integer,
  needs_pastor boolean,
  pastoral_request_at timestamptz,
  pastoral_request_note text,
  last_contact_at timestamptz,
  next_action text,
  next_action_due_at timestamptz,
  follow_up_id uuid,
  assigned_to uuid,
  assigned_to_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id uuid := (SELECT auth.uid());
  v_actor_church_id uuid;
  v_actor_area text;
  v_church_id uuid;
  v_turma_church_id uuid;
  v_turma_area text;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT profile.church_id, profile.area::text
  INTO v_actor_church_id, v_actor_area
  FROM public.profiles AS profile
  WHERE profile.user_id = v_actor_id;

  IF public.is_super_admin(v_actor_id) THEN
    v_church_id := COALESCE(p_church_id, v_actor_church_id);
  ELSE
    v_church_id := v_actor_church_id;
    IF p_church_id IS NOT NULL AND p_church_id IS DISTINCT FROM v_actor_church_id THEN
      RAISE EXCEPTION 'Church scope is not authorized' USING ERRCODE = '42501';
    END IF;
  END IF;

  IF v_church_id IS NULL THEN
    RAISE EXCEPTION 'Church scope is required' USING ERRCODE = '22023';
  END IF;

  IF p_turma_id IS NOT NULL THEN
    SELECT turma.church_id, turma.area
    INTO v_turma_church_id, v_turma_area
    FROM public.turmas AS turma
    WHERE turma.id = p_turma_id
      AND turma.is_active = true;

    IF NOT FOUND OR v_turma_church_id IS DISTINCT FROM v_church_id THEN
      RAISE EXCEPTION 'Turma does not belong to the selected church' USING ERRCODE = '42501';
    END IF;

    IF NOT public.can_manage_church(v_church_id)
       AND NOT private.can_manage_turma(v_actor_id, p_turma_id) THEN
      RAISE EXCEPTION 'Turma scope is not authorized' USING ERRCODE = '42501';
    END IF;
  ELSIF p_area IS NOT NULL THEN
    IF NOT public.can_manage_church(v_church_id)
       AND p_area IS DISTINCT FROM v_actor_area THEN
      RAISE EXCEPTION 'Area scope is not authorized' USING ERRCODE = '42501';
    END IF;
  ELSIF NOT public.can_manage_church(v_church_id) THEN
    RAISE EXCEPTION 'A leader must select a turma' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  WITH members AS (
    SELECT
      profile.user_id,
      profile.full_name,
      profile.community::text AS community,
      COALESCE(profile.whatsapp_number, profile.phone) AS phone,
      profile.avatar_url,
      profile.church_id,
      profile.turma_id,
      profile.area::text AS area,
      profile.email
    FROM public.profiles AS profile
    WHERE profile.church_id = v_church_id
      AND profile.user_id <> v_actor_id
      AND profile.is_active IS DISTINCT FROM false
      AND profile.enrollment_status = 'active'
      AND (p_turma_id IS NULL OR profile.turma_id = p_turma_id)
      AND (p_area IS NULL OR profile.area::text = p_area)
      AND NOT EXISTS (
        SELECT 1
        FROM public.user_roles AS role_row
        WHERE role_row.user_id = profile.user_id
          AND role_row.role IN ('admin'::public.app_role, 'lider'::public.app_role)
      )
  ), lesson_total AS (
    SELECT count(*)::integer AS total
    FROM public.lessons AS lesson
    WHERE lesson.church_id IS NULL OR lesson.church_id = v_church_id
  )
  SELECT
    member.user_id,
    member.full_name,
    member.community,
    member.phone,
    member.avatar_url,
    health.care_status,
    CASE
      WHEN cardinality(reason_list.reasons) = 0 THEN ARRAY['Sem sinais de risco no momento']::text[]
      ELSE reason_list.reasons
    END AS care_reasons,
    latest_activity.happened_at AS last_activity_at,
    latest_activity.source AS last_activity_source,
    access_data.last_access_at,
    CASE
      WHEN lesson_total.total = 0 THEN 0
      ELSE round((lesson_data.completed_count::numeric / lesson_total.total::numeric) * 100)::integer
    END AS course_progress,
    lesson_data.completed_count AS lessons_completed,
    lesson_total.total AS lessons_total,
    CASE
      WHEN lesson_data.recent_count > lesson_data.previous_count THEN 'up'
      WHEN lesson_data.recent_count < lesson_data.previous_count THEN 'down'
      ELSE 'stable'
    END AS progress_trend,
    lesson_data.recent_count - lesson_data.previous_count AS trend_delta,
    attendance_data.present_4,
    attendance_data.total_4,
    attendance_data.present_8,
    attendance_data.total_8,
    devotional_data.count_7,
    devotional_data.count_14,
    devotional_data.count_30,
    pastoral_data.is_active AS needs_pastor,
    pastoral_data.requested_at AS pastoral_request_at,
    pastoral_data.notes AS pastoral_request_note,
    GREATEST(plan.last_contact_at, contact_data.last_contact_at) AS last_contact_at,
    follow_up.title AS next_action,
    follow_up.due_at AS next_action_due_at,
    follow_up.id AS follow_up_id,
    follow_up.assigned_to,
    assignee.full_name AS assigned_to_name
  FROM members AS member
  CROSS JOIN lesson_total
  LEFT JOIN public.discipleship_plans AS plan
    ON plan.user_id = member.user_id
   AND plan.church_id = member.church_id
  LEFT JOIN LATERAL (
    SELECT
      count(DISTINCT progress.lesson_id)::integer AS completed_count,
      count(DISTINCT progress.lesson_id) FILTER (
        WHERE progress.completed_at >= now() - interval '14 days'
      )::integer AS recent_count,
      count(DISTINCT progress.lesson_id) FILTER (
        WHERE progress.completed_at >= now() - interval '28 days'
          AND progress.completed_at < now() - interval '14 days'
      )::integer AS previous_count,
      max(progress.completed_at) AS last_at
    FROM public.lesson_progress AS progress
    WHERE progress.user_id = member.user_id
      AND progress.church_id = member.church_id
      AND progress.is_completed = true
  ) AS lesson_data ON true
  LEFT JOIN LATERAL (
    SELECT
      count(*) FILTER (WHERE progress.completed_at >= now() - interval '7 days')::integer AS count_7,
      count(*) FILTER (WHERE progress.completed_at >= now() - interval '14 days')::integer AS count_14,
      count(*) FILTER (WHERE progress.completed_at >= now() - interval '30 days')::integer AS count_30,
      max(progress.completed_at) AS last_at
    FROM public.devotional_progress AS progress
    WHERE progress.user_id = member.user_id
      AND progress.church_id = member.church_id
  ) AS devotional_data ON true
  LEFT JOIN LATERAL (
    SELECT max(progress.completed_at) AS last_at
    FROM public.user_progress AS progress
    WHERE progress.user_id = member.user_id
      AND progress.church_id = member.church_id
  ) AS activity_data ON true
  LEFT JOIN LATERAL (
    WITH recent_events AS (
      SELECT event.id, row_number() OVER (ORDER BY event.event_date DESC, event.id) AS position
      FROM public.events AS event
      WHERE event.church_id = member.church_id
        AND event.event_date <= now()
        AND (
          event.turma_id = member.turma_id
          OR (event.turma_id IS NULL AND event.area = member.area)
        )
      ORDER BY event.event_date DESC, event.id
      LIMIT 8
    ), event_presence AS (
      SELECT
        recent_event.position,
        EXISTS (
          SELECT 1
          FROM public.attendance AS attendance
          WHERE attendance.event_id = recent_event.id
            AND attendance.user_id = member.user_id
            AND attendance.church_id = member.church_id
            AND attendance.status = 'presente'
        ) AS was_present
      FROM recent_events AS recent_event
    )
    SELECT
      count(*) FILTER (WHERE position <= 4 AND was_present)::integer AS present_4,
      count(*) FILTER (WHERE position <= 4)::integer AS total_4,
      count(*) FILTER (WHERE was_present)::integer AS present_8,
      count(*)::integer AS total_8,
      (
        SELECT max(attendance.created_at)
        FROM public.attendance AS attendance
        WHERE attendance.user_id = member.user_id
          AND attendance.church_id = member.church_id
      ) AS last_at
    FROM event_presence
  ) AS attendance_data ON true
  LEFT JOIN LATERAL (
    SELECT max(attendance.created_at) AS last_at
    FROM public.worship_attendance AS attendance
    WHERE attendance.user_id = member.user_id
      AND attendance.church_id = member.church_id
      AND attendance.status = 'aprovado'
  ) AS worship_data ON true
  LEFT JOIN LATERAL (
    SELECT auth_user.last_sign_in_at AS last_access_at
    FROM auth.users AS auth_user
    WHERE auth_user.id = member.user_id
  ) AS access_data ON true
  LEFT JOIN LATERAL (
    SELECT
      assessment.needs_pastor
        AND assessment.created_at >= now() - interval '90 days'
        AND assessment.created_at > COALESCE(plan.pastoral_request_resolved_at, '-infinity'::timestamptz) AS is_active,
      assessment.created_at AS requested_at,
      assessment.notes
    FROM public.spiritual_assessments AS assessment
    WHERE assessment.user_id = member.user_id
      AND assessment.church_id = member.church_id
    ORDER BY assessment.created_at DESC
    LIMIT 1
  ) AS pastoral_data ON true
  LEFT JOIN LATERAL (
    SELECT follow_up_row.*
    FROM public.leader_follow_ups AS follow_up_row
    WHERE follow_up_row.user_id = member.user_id
      AND follow_up_row.church_id = member.church_id
      AND follow_up_row.status = 'open'
    ORDER BY follow_up_row.due_at ASC NULLS LAST, follow_up_row.created_at ASC
    LIMIT 1
  ) AS follow_up ON true
  LEFT JOIN public.profiles AS assignee
    ON assignee.user_id = follow_up.assigned_to
   AND assignee.church_id = member.church_id
  LEFT JOIN LATERAL (
    SELECT max(follow_up_row.contacted_at) AS last_contact_at
    FROM public.leader_follow_ups AS follow_up_row
    WHERE follow_up_row.user_id = member.user_id
      AND follow_up_row.church_id = member.church_id
      AND follow_up_row.contacted_at IS NOT NULL
  ) AS contact_data ON true
  LEFT JOIN LATERAL (
    SELECT source_row.happened_at, source_row.source
    FROM (
      VALUES
        (lesson_data.last_at, 'lesson'::text),
        (devotional_data.last_at, 'devotional'::text),
        (activity_data.last_at, 'activity'::text),
        (attendance_data.last_at, 'attendance'::text),
        (worship_data.last_at, 'worship'::text),
        (access_data.last_access_at, 'access'::text)
    ) AS source_row(happened_at, source)
    WHERE source_row.happened_at IS NOT NULL
    ORDER BY source_row.happened_at DESC
    LIMIT 1
  ) AS latest_activity ON true
  CROSS JOIN LATERAL (
    SELECT array_remove(ARRAY[
      CASE WHEN COALESCE(pastoral_data.is_active, false) THEN 'Solicitou ajuda pastoral' END,
      CASE WHEN latest_activity.happened_at IS NULL THEN 'Nenhuma atividade registrada' END,
      CASE WHEN latest_activity.happened_at < now() - interval '30 days' THEN 'Sem atividade ha mais de 30 dias' END,
      CASE WHEN latest_activity.happened_at >= now() - interval '30 days'
                 AND latest_activity.happened_at < now() - interval '14 days' THEN 'Sem atividade ha mais de 14 dias' END,
      CASE WHEN attendance_data.total_4 >= 3 AND attendance_data.present_4 <= 1 THEN 'Presenca baixa nos ultimos encontros' END,
      CASE WHEN attendance_data.total_4 >= 3 AND attendance_data.present_4 = 2 THEN 'Presenca oscilando' END,
      CASE WHEN devotional_data.count_7 = 0 THEN 'Nenhum devocional nos ultimos 7 dias' END,
      CASE WHEN lesson_data.recent_count < lesson_data.previous_count THEN 'Progresso caiu nas ultimas semanas' END,
      CASE WHEN COALESCE(plan.is_priority, false) THEN 'Marcado como prioridade pastoral' END,
      CASE WHEN follow_up.due_at < now() THEN 'Acompanhamento atrasado' END
    ]::text[], NULL) AS reasons
  ) AS reason_list
  CROSS JOIN LATERAL (
    SELECT CASE
      WHEN COALESCE(pastoral_data.is_active, false)
        OR latest_activity.happened_at IS NULL
        OR latest_activity.happened_at < now() - interval '45 days'
        OR (attendance_data.total_4 >= 3 AND attendance_data.present_4 <= 1)
        OR follow_up.due_at < now() - interval '7 days'
        THEN 'critical'
      WHEN COALESCE(plan.is_priority, false)
        OR plan.health_status IN ('atencao', 'critico')
        OR latest_activity.happened_at < now() - interval '14 days'
        OR (attendance_data.total_4 >= 3 AND attendance_data.present_4 = 2)
        OR devotional_data.count_7 = 0
        OR lesson_data.recent_count < lesson_data.previous_count
        OR follow_up.due_at < now()
        THEN 'attention'
      ELSE 'healthy'
    END AS care_status
  ) AS health
  ORDER BY
    CASE health.care_status WHEN 'critical' THEN 0 WHEN 'attention' THEN 1 ELSE 2 END,
    follow_up.due_at ASC NULLS LAST,
    member.full_name;
END;
$$;

REVOKE ALL ON FUNCTION public.get_leader_care_dashboard(uuid, text, uuid)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_leader_care_dashboard(uuid, text, uuid)
  TO authenticated;

CREATE OR REPLACE FUNCTION public.save_leader_follow_up(
  p_target_user_id uuid,
  p_kind text,
  p_title text,
  p_notes text DEFAULT NULL,
  p_due_at timestamptz DEFAULT NULL,
  p_assigned_to uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id uuid := (SELECT auth.uid());
  v_target public.profiles%ROWTYPE;
  v_assigned_to uuid := COALESCE(p_assigned_to, v_actor_id);
  v_follow_up public.leader_follow_ups%ROWTYPE;
  v_is_contact boolean := p_kind = 'contact';
BEGIN
  IF v_actor_id IS NULL OR NOT private.can_manage_member(v_actor_id, p_target_user_id) THEN
    RAISE EXCEPTION 'Member scope is not authorized' USING ERRCODE = '42501';
  END IF;

  IF p_kind NOT IN ('contact', 'note', 'task', 'pastoral_request') THEN
    RAISE EXCEPTION 'Invalid follow-up kind' USING ERRCODE = '22023';
  END IF;

  IF length(trim(COALESCE(p_title, ''))) < 3 THEN
    RAISE EXCEPTION 'A follow-up title is required' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_target
  FROM public.profiles
  WHERE user_id = p_target_user_id;

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles AS assignee
    WHERE assignee.user_id = v_assigned_to
      AND assignee.church_id = v_target.church_id
  ) THEN
    RAISE EXCEPTION 'Assigned leader must belong to the same church' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.leader_follow_ups (
    church_id, turma_id, user_id, assigned_to, created_by,
    kind, title, notes, due_at, contacted_at, status,
    completed_at, completed_by
  )
  VALUES (
    v_target.church_id,
    v_target.turma_id,
    p_target_user_id,
    v_assigned_to,
    v_actor_id,
    p_kind,
    trim(p_title),
    nullif(trim(COALESCE(p_notes, '')), ''),
    p_due_at,
    CASE WHEN v_is_contact THEN now() END,
    CASE WHEN p_kind IN ('contact', 'note') THEN 'completed' ELSE 'open' END,
    CASE WHEN p_kind IN ('contact', 'note') THEN now() END,
    CASE WHEN p_kind IN ('contact', 'note') THEN v_actor_id END
  )
  RETURNING * INTO v_follow_up;

  IF v_is_contact THEN
    INSERT INTO public.discipleship_plans (
      user_id, church_id, health_status, last_contact_at
    )
    VALUES (
      p_target_user_id, v_target.church_id, 'saudavel', now()
    )
    ON CONFLICT (user_id) DO UPDATE
      SET last_contact_at = excluded.last_contact_at,
          church_id = excluded.church_id,
          updated_at = now();
  END IF;

  RETURN jsonb_build_object(
    'id', v_follow_up.id,
    'status', v_follow_up.status,
    'due_at', v_follow_up.due_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.save_leader_follow_up(uuid, text, text, text, timestamptz, uuid)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_leader_follow_up(uuid, text, text, text, timestamptz, uuid)
  TO authenticated;

CREATE OR REPLACE FUNCTION public.complete_leader_follow_up(
  p_follow_up_id uuid,
  p_resolution_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id uuid := (SELECT auth.uid());
  v_follow_up public.leader_follow_ups%ROWTYPE;
BEGIN
  SELECT * INTO v_follow_up
  FROM public.leader_follow_ups
  WHERE id = p_follow_up_id
  FOR UPDATE;

  IF NOT FOUND
     OR v_actor_id IS NULL
     OR NOT private.can_manage_member(v_actor_id, v_follow_up.user_id) THEN
    RAISE EXCEPTION 'Follow-up scope is not authorized' USING ERRCODE = '42501';
  END IF;

  UPDATE public.leader_follow_ups
  SET status = 'completed',
      completed_at = now(),
      completed_by = v_actor_id,
      notes = CASE
        WHEN nullif(trim(COALESCE(p_resolution_notes, '')), '') IS NULL THEN notes
        WHEN notes IS NULL THEN trim(p_resolution_notes)
        ELSE notes || E'\n\nConclusao: ' || trim(p_resolution_notes)
      END,
      updated_at = now()
  WHERE id = p_follow_up_id;

  IF v_follow_up.kind = 'pastoral_request' THEN
    INSERT INTO public.discipleship_plans (
      user_id, church_id, health_status, pastoral_request_resolved_at
    )
    VALUES (
      v_follow_up.user_id, v_follow_up.church_id, 'atencao', now()
    )
    ON CONFLICT (user_id) DO UPDATE
      SET pastoral_request_resolved_at = excluded.pastoral_request_resolved_at,
          church_id = excluded.church_id,
          updated_at = now();
  END IF;

  RETURN jsonb_build_object('id', p_follow_up_id, 'status', 'completed');
END;
$$;

REVOKE ALL ON FUNCTION public.complete_leader_follow_up(uuid, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_leader_follow_up(uuid, text)
  TO authenticated;

CREATE OR REPLACE FUNCTION public.resolve_member_pastoral_request(
  p_target_user_id uuid,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_id uuid := (SELECT auth.uid());
  v_target public.profiles%ROWTYPE;
BEGIN
  IF v_actor_id IS NULL OR NOT private.can_manage_member(v_actor_id, p_target_user_id) THEN
    RAISE EXCEPTION 'Member scope is not authorized' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_target
  FROM public.profiles
  WHERE user_id = p_target_user_id;

  INSERT INTO public.discipleship_plans (
    user_id, church_id, health_status, pastoral_request_resolved_at
  )
  VALUES (
    p_target_user_id, v_target.church_id, 'atencao', now()
  )
  ON CONFLICT (user_id) DO UPDATE
    SET pastoral_request_resolved_at = excluded.pastoral_request_resolved_at,
        church_id = excluded.church_id,
        updated_at = now();

  INSERT INTO public.leader_follow_ups (
    church_id, turma_id, user_id, assigned_to, created_by,
    kind, title, notes, contacted_at, status, completed_at, completed_by
  )
  VALUES (
    v_target.church_id,
    v_target.turma_id,
    p_target_user_id,
    v_actor_id,
    v_actor_id,
    'pastoral_request',
    'Solicitacao pastoral concluida',
    nullif(trim(COALESCE(p_notes, '')), ''),
    now(),
    'completed',
    now(),
    v_actor_id
  );

  RETURN jsonb_build_object('user_id', p_target_user_id, 'resolved', true);
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_member_pastoral_request(uuid, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.resolve_member_pastoral_request(uuid, text)
  TO authenticated;
