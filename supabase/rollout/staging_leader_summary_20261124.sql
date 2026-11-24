-- Staging-only: install the production summary function when it is absent.
BEGIN;
DO $$ BEGIN
 IF to_regprocedure('public.get_leader_participant_summaries(uuid,text,uuid)') IS NOT NULL THEN RAISE EXCEPTION 'STAGING_SUMMARY_ALREADY_EXISTS'; END IF;
 IF md5(replace(pg_get_functiondef(to_regprocedure('private.can_manage_turma(uuid,uuid)')), E'\r\n', E'\n')) IS DISTINCT FROM 'bb91e4ad20d394f9803cf46f99bbde40' THEN RAISE EXCEPTION 'STAGING_GROUP_AUTH_DIFFERENT'; END IF;
 IF md5(replace(pg_get_functiondef(to_regprocedure('private.is_church_admin(uuid,uuid)')), E'\r\n', E'\n')) NOT IN ('cc2146915ddaa7de54fd53a5044c56ea','d2d5801f856f9c847c751321fc11bd24') THEN RAISE EXCEPTION 'STAGING_ADMIN_AUTH_DIFFERENT'; END IF;
END $$;
CREATE OR REPLACE FUNCTION public.get_leader_participant_summaries(p_turma_id uuid DEFAULT NULL::uuid, p_area text DEFAULT NULL::text, p_church_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(user_id uuid, full_name text, community text, area text, birth_date date, phone text, turma_id uuid, confirmation_year integer, avatar_url text, father_name text, mother_name text, father_phone text, mother_phone text, address text, church_id uuid, completed_activity_ids uuid[], completed_lesson_count integer, completed_devotional_count integer, completed_event_count integer, progress_total integer, last_activity_at timestamp with time zone, last_activity_source text, last_devotional_at timestamp with time zone, recent_attendance_statuses text[], health_status text, is_priority boolean, needs_pastor boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_actor_id uuid := (SELECT auth.uid());
  v_actor_church_id uuid;
  v_church_id uuid;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT profile.church_id
  INTO v_actor_church_id
  FROM public.profiles AS profile
  WHERE profile.user_id = v_actor_id;

  v_church_id := CASE
    WHEN public.is_super_admin(v_actor_id)
      THEN COALESCE(p_church_id, v_actor_church_id)
    ELSE v_actor_church_id
  END;

  IF v_church_id IS NULL
     OR (
       NOT public.is_super_admin(v_actor_id)
       AND p_church_id IS NOT NULL
       AND p_church_id IS DISTINCT FROM v_actor_church_id
     ) THEN
    RAISE EXCEPTION 'Church scope is not authorized'
      USING ERRCODE = '42501';
  END IF;

  IF p_turma_id IS NOT NULL THEN
    IF NOT private.can_manage_turma(v_actor_id, p_turma_id) THEN
      RAISE EXCEPTION 'Group scope is not authorized'
        USING ERRCODE = '42501';
    END IF;
  ELSIF p_area IS NOT NULL THEN
    IF NOT private.is_church_admin(v_actor_id, v_church_id) THEN
      RAISE EXCEPTION 'Area scope is reserved for church administrators'
        USING ERRCODE = '42501';
    END IF;
  ELSIF NOT private.is_church_admin(v_actor_id, v_church_id) THEN
    RAISE EXCEPTION 'A leader must select an assigned group'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  WITH content_total AS (
    SELECT (
      (
        SELECT count(*)
        FROM public.lessons AS lesson
        WHERE lesson.church_id IS NULL OR lesson.church_id = v_church_id
      )
      +
      (
        SELECT count(*)
        FROM public.devotional_content AS devotional
        WHERE devotional.church_id IS NULL
           OR devotional.church_id = v_church_id
      )
    )::integer AS total
  )
  SELECT
    profile.user_id,
    profile.full_name,
    profile.community::text,
    profile.area::text,
    profile.birth_date,
    COALESCE(profile.whatsapp_number, profile.phone),
    profile.turma_id,
    profile.confirmation_year::integer,
    profile.avatar_url,
    profile.father_name,
    profile.mother_name,
    profile.father_phone,
    profile.mother_phone,
    profile.address,
    profile.church_id,
    legacy_data.activity_ids,
    lesson_data.completed_count,
    devotional_data.completed_count,
    attendance_data.present_count,
    content_total.total,
    latest_activity.happened_at,
    latest_activity.source,
    devotional_data.last_at,
    attendance_data.recent_statuses,
    COALESCE(plan.health_status, 'saudavel'),
    COALESCE(plan.is_priority, false),
    COALESCE(assessment.needs_pastor, false)
  FROM public.profiles AS profile
  CROSS JOIN content_total
  LEFT JOIN public.discipleship_plans AS plan
    ON plan.user_id = profile.user_id
   AND plan.church_id = profile.church_id
  LEFT JOIN LATERAL (
    SELECT
      COALESCE(
        array_agg(DISTINCT progress.activity_id),
        ARRAY[]::uuid[]
      ) AS activity_ids,
      max(progress.completed_at) AS last_at
    FROM public.user_progress AS progress
    WHERE progress.user_id = profile.user_id
      AND progress.church_id = profile.church_id
  ) AS legacy_data ON true
  LEFT JOIN LATERAL (
    SELECT
      count(DISTINCT progress.lesson_id)::integer AS completed_count,
      max(progress.completed_at) AS last_at
    FROM public.lesson_progress AS progress
    WHERE progress.user_id = profile.user_id
      AND progress.church_id = profile.church_id
      AND progress.is_completed = true
  ) AS lesson_data ON true
  LEFT JOIN LATERAL (
    SELECT max(response.updated_at) AS last_at
    FROM public.lesson_responses AS response
    WHERE response.user_id = profile.user_id
      AND response.church_id = profile.church_id
  ) AS response_data ON true
  LEFT JOIN LATERAL (
    SELECT
      count(*)::integer AS completed_count,
      max(progress.completed_at) AS last_at
    FROM public.devotional_progress AS progress
    WHERE progress.user_id = profile.user_id
      AND progress.church_id = profile.church_id
  ) AS devotional_data ON true
  LEFT JOIN LATERAL (
    WITH all_records AS (
      SELECT
        CASE
          WHEN attendance.status = 'presente' THEN 'presente'
          WHEN attendance.status IN ('faltou', 'falta') THEN 'faltou'
          WHEN attendance.status IN ('justificou', 'justificado') THEN 'justificou'
          ELSE attendance.status
        END AS normalized_status,
        event.event_date,
        attendance.created_at
      FROM public.attendance AS attendance
      JOIN public.events AS event
        ON event.id = attendance.event_id
       AND event.church_id = profile.church_id
      WHERE attendance.user_id = profile.user_id
        AND attendance.church_id = profile.church_id
        AND attendance.status IN (
          'presente',
          'faltou',
          'falta',
          'justificou',
          'justificado'
        )
        AND (
          event.turma_id = profile.turma_id
          OR (
            event.turma_id IS NULL
            AND event.area = profile.area::text
          )
        )
    ),
    recent_records AS (
      SELECT *
      FROM all_records
      ORDER BY event_date DESC, created_at DESC
      LIMIT 8
    )
    SELECT
      (
        SELECT count(*)::integer
        FROM all_records
        WHERE normalized_status = 'presente'
      )::integer AS present_count,
      COALESCE(
        array_agg(
          normalized_status
          ORDER BY event_date DESC, created_at DESC
        ),
        ARRAY[]::text[]
      ) AS recent_statuses,
      max(created_at) AS last_at
    FROM recent_records
  ) AS attendance_data ON true
  LEFT JOIN LATERAL (
    SELECT max(attendance.created_at) AS last_at
    FROM public.worship_attendance AS attendance
    WHERE attendance.user_id = profile.user_id
      AND attendance.church_id = profile.church_id
      AND attendance.status = 'aprovado'
  ) AS worship_data ON true
  LEFT JOIN LATERAL (
    SELECT auth_user.last_sign_in_at AS last_at
    FROM auth.users AS auth_user
    WHERE auth_user.id = profile.user_id
  ) AS access_data ON true
  LEFT JOIN LATERAL (
    SELECT
      spiritual.needs_pastor
      AND spiritual.created_at >= now() - interval '90 days'
      AND spiritual.created_at >
        COALESCE(
          plan.pastoral_request_resolved_at,
          '-infinity'::timestamptz
        ) AS needs_pastor
    FROM public.spiritual_assessments AS spiritual
    WHERE spiritual.user_id = profile.user_id
      AND spiritual.church_id = profile.church_id
    ORDER BY spiritual.created_at DESC
    LIMIT 1
  ) AS assessment ON true
  LEFT JOIN LATERAL (
    SELECT source_row.happened_at, source_row.source
    FROM (
      VALUES
        (lesson_data.last_at, 'lesson'::text),
        (response_data.last_at, 'lesson'::text),
        (devotional_data.last_at, 'devotional'::text),
        (legacy_data.last_at, 'activity'::text),
        (attendance_data.last_at, 'attendance'::text),
        (worship_data.last_at, 'worship'::text),
        (access_data.last_at, 'access'::text)
    ) AS source_row(happened_at, source)
    WHERE source_row.happened_at IS NOT NULL
    ORDER BY source_row.happened_at DESC
    LIMIT 1
  ) AS latest_activity ON true
  WHERE profile.church_id = v_church_id
    AND profile.user_id <> v_actor_id
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
  ORDER BY profile.full_name;
END;
$function$
;
REVOKE ALL ON FUNCTION public.get_leader_participant_summaries(uuid,text,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_leader_participant_summaries(uuid,text,uuid) TO authenticated,service_role;
NOTIFY pgrst, 'reload schema';
COMMIT;
