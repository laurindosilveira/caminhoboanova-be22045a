-- Staging-only: preserve its older dashboard and install the reviewed production definition.
BEGIN;
DO $$ BEGIN
 IF md5(replace(pg_get_functiondef(to_regprocedure('private.get_leader_care_dashboard(uuid,text,uuid)')), E'\r\n', E'\n')) IS DISTINCT FROM '318a3a725c85a43d37a8c6ab17fb4e37' THEN RAISE EXCEPTION 'STAGING_CARE_VERSION_MISMATCH'; END IF;
 IF to_regprocedure('private.staging_original_care_20261124(uuid,text,uuid)') IS NOT NULL THEN RAISE EXCEPTION 'STAGING_CARE_BACKUP_EXISTS'; END IF;
END $$;
ALTER FUNCTION private.get_leader_care_dashboard(uuid,text,uuid) RENAME TO staging_original_care_20261124;
REVOKE ALL ON FUNCTION private.staging_original_care_20261124(uuid,text,uuid) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION private.get_leader_care_dashboard(p_turma_id uuid DEFAULT NULL::uuid, p_area text DEFAULT NULL::text, p_church_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(user_id uuid, full_name text, community text, phone text, avatar_url text, care_status text, care_reasons text[], last_activity_at timestamp with time zone, last_activity_source text, last_access_at timestamp with time zone, course_progress integer, lessons_completed integer, lessons_total integer, progress_trend text, trend_delta integer, attendance_4_present integer, attendance_4_total integer, attendance_8_present integer, attendance_8_total integer, devotionals_7 integer, devotionals_14 integer, devotionals_30 integer, needs_pastor boolean, pastoral_request_at timestamp with time zone, pastoral_request_note text, last_contact_at timestamp with time zone, next_action text, next_action_due_at timestamp with time zone, follow_up_id uuid, assigned_to uuid, assigned_to_name text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  WITH members AS (
    SELECT
      profile.user_id,
      profile.full_name,
      profile.community::text AS community,
      COALESCE(profile.whatsapp_number, profile.phone) AS phone,
      profile.avatar_url,
      profile.church_id,
      profile.turma_id,
      profile.area::text AS area
    FROM public.profiles AS profile
    WHERE profile.church_id = p_church_id
      AND profile.is_active IS DISTINCT FROM false
      AND profile.enrollment_status IN ('active', 'approved')
      AND (p_turma_id IS NULL OR profile.turma_id = p_turma_id)
      AND (p_area IS NULL OR profile.area::text = p_area)
      AND NOT EXISTS (
        SELECT 1
        FROM public.user_roles AS role_row
        WHERE role_row.user_id = profile.user_id
          AND role_row.role IN (
            'admin'::public.app_role,
            'lider'::public.app_role,
            'super_admin'::public.app_role
          )
      )
  ),
  lesson_total AS (
    SELECT count(*)::integer AS total
    FROM public.lessons AS lesson
    WHERE lesson.church_id IS NULL OR lesson.church_id = p_church_id
  )
  SELECT
    member.user_id,
    member.full_name,
    member.community,
    member.phone,
    member.avatar_url,
    health.care_status,
    CASE
      WHEN cardinality(reason_list.reasons) = 0
        THEN ARRAY['Sem sinais de risco no momento']::text[]
      ELSE reason_list.reasons
    END,
    latest_activity.happened_at,
    latest_activity.source,
    access_data.last_access_at,
    CASE
      WHEN lesson_total.total = 0 THEN 0
      ELSE LEAST(
        100,
        round(
          (lesson_data.completed_count::numeric / lesson_total.total::numeric) * 100
        )::integer
      )
    END,
    lesson_data.completed_count,
    lesson_total.total,
    CASE
      WHEN lesson_data.recent_count > lesson_data.previous_count THEN 'up'
      WHEN lesson_data.recent_count < lesson_data.previous_count THEN 'down'
      ELSE 'stable'
    END,
    lesson_data.recent_count - lesson_data.previous_count,
    attendance_data.present_4,
    attendance_data.total_4,
    attendance_data.present_8,
    attendance_data.total_8,
    devotional_data.count_7,
    devotional_data.count_14,
    devotional_data.count_30,
    pastoral_data.is_active,
    pastoral_data.requested_at,
    pastoral_data.notes,
    GREATEST(plan.last_contact_at, contact_data.last_contact_at),
    follow_up.title,
    follow_up.due_at,
    follow_up.id,
    follow_up.assigned_to,
    assignee.full_name
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
    SELECT max(response.updated_at) AS last_at
    FROM public.lesson_responses AS response
    WHERE response.user_id = member.user_id
      AND response.church_id = member.church_id
  ) AS response_data ON true
  LEFT JOIN LATERAL (
    SELECT
      count(*) FILTER (
        WHERE progress.completed_at >= now() - interval '7 days'
      )::integer AS count_7,
      count(*) FILTER (
        WHERE progress.completed_at >= now() - interval '14 days'
      )::integer AS count_14,
      count(*) FILTER (
        WHERE progress.completed_at >= now() - interval '30 days'
      )::integer AS count_30,
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
    WITH final_records AS (
      SELECT
        event.event_date,
        attendance.created_at,
        CASE
          WHEN attendance.status IN ('presente') THEN 'presente'
          WHEN attendance.status IN ('faltou', 'falta') THEN 'faltou'
          WHEN attendance.status IN ('justificou', 'justificado') THEN 'justificou'
          ELSE attendance.status
        END AS normalized_status
      FROM public.attendance AS attendance
      JOIN public.events AS event
        ON event.id = attendance.event_id
       AND event.church_id = member.church_id
      WHERE attendance.user_id = member.user_id
        AND attendance.church_id = member.church_id
        AND attendance.status IN (
          'presente',
          'faltou',
          'falta',
          'justificou',
          'justificado'
        )
        AND (
          event.turma_id = member.turma_id
          OR (
            event.turma_id IS NULL
            AND event.area = member.area
          )
        )
      ORDER BY event.event_date DESC, attendance.created_at DESC
      LIMIT 8
    ),
    numbered AS (
      SELECT
        final_records.*,
        row_number() OVER (
          ORDER BY final_records.event_date DESC, final_records.created_at DESC
        ) AS position
      FROM final_records
    )
    SELECT
      count(*) FILTER (
        WHERE position <= 4 AND normalized_status = 'presente'
      )::integer AS present_4,
      count(*) FILTER (WHERE position <= 4)::integer AS total_4,
      count(*) FILTER (
        WHERE normalized_status = 'presente'
      )::integer AS present_8,
      count(*)::integer AS total_8,
      max(created_at) AS last_at
    FROM numbered
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
        AND assessment.created_at >
          COALESCE(
            plan.pastoral_request_resolved_at,
            '-infinity'::timestamptz
          ) AS is_active,
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
      AND (
        member.turma_id IS NULL
        OR follow_up_row.turma_id IS NULL
        OR follow_up_row.turma_id = member.turma_id
      )
    ORDER BY
      follow_up_row.due_at ASC NULLS LAST,
      follow_up_row.created_at ASC
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
        (response_data.last_at, 'lesson'::text),
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
      CASE
        WHEN COALESCE(pastoral_data.is_active, false)
          THEN 'Solicitou ajuda pastoral'
      END,
      CASE
        WHEN latest_activity.happened_at IS NULL
          THEN 'Nenhuma atividade registrada'
      END,
      CASE
        WHEN latest_activity.happened_at < now() - interval '30 days'
          THEN 'Sem atividade ha mais de 30 dias'
      END,
      CASE
        WHEN latest_activity.happened_at >= now() - interval '30 days'
         AND latest_activity.happened_at < now() - interval '14 days'
          THEN 'Sem atividade ha mais de 14 dias'
      END,
      CASE
        WHEN attendance_data.total_4 >= 3
         AND attendance_data.present_4 <= 1
          THEN 'Presenca baixa nos encontros registrados'
      END,
      CASE
        WHEN attendance_data.total_4 >= 3
         AND attendance_data.present_4 = 2
          THEN 'Presenca oscilando'
      END,
      CASE
        WHEN devotional_data.count_7 = 0
          THEN 'Nenhum devocional nos ultimos 7 dias'
      END,
      CASE
        WHEN lesson_data.recent_count < lesson_data.previous_count
          THEN 'Progresso caiu nas ultimas semanas'
      END,
      CASE
        WHEN COALESCE(plan.is_priority, false)
          THEN 'Marcado como prioridade pastoral'
      END,
      CASE
        WHEN follow_up.due_at < now()
          THEN 'Acompanhamento atrasado'
      END
    ]::text[], NULL) AS reasons
  ) AS reason_list
  CROSS JOIN LATERAL (
    SELECT CASE
      WHEN COALESCE(pastoral_data.is_active, false)
        OR latest_activity.happened_at IS NULL
        OR latest_activity.happened_at < now() - interval '45 days'
        OR (
          attendance_data.total_4 >= 3
          AND attendance_data.present_4 <= 1
        )
        OR follow_up.due_at < now() - interval '7 days'
        THEN 'critical'
      WHEN COALESCE(plan.is_priority, false)
        OR plan.health_status IN ('atencao', 'critico')
        OR latest_activity.happened_at < now() - interval '14 days'
        OR (
          attendance_data.total_4 >= 3
          AND attendance_data.present_4 = 2
        )
        OR devotional_data.count_7 = 0
        OR lesson_data.recent_count < lesson_data.previous_count
        OR follow_up.due_at < now()
        THEN 'attention'
      ELSE 'healthy'
    END AS care_status
  ) AS health
  ORDER BY
    CASE health.care_status
      WHEN 'critical' THEN 0
      WHEN 'attention' THEN 1
      ELSE 2
    END,
    follow_up.due_at ASC NULLS LAST,
    member.full_name;
$function$
;
REVOKE ALL ON FUNCTION private.get_leader_care_dashboard(uuid,text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION private.get_leader_care_dashboard(uuid,text,uuid) TO service_role;
NOTIFY pgrst, 'reload schema';
COMMIT;
