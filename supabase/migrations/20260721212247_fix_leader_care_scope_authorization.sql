-- can_manage_church also includes church leaders. The care dashboard needs a
-- narrower rule: leaders see only their assigned turma; admins may use broader
-- church and area scopes.

ALTER FUNCTION public.get_leader_care_dashboard(uuid, text, uuid)
  SET SCHEMA private;

REVOKE ALL ON FUNCTION private.get_leader_care_dashboard(uuid, text, uuid)
  FROM PUBLIC, anon, authenticated;

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
  v_church_id uuid;
  v_is_church_admin boolean := false;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT profile.church_id
  INTO v_actor_church_id
  FROM public.profiles AS profile
  WHERE profile.user_id = v_actor_id;

  IF public.is_super_admin(v_actor_id) THEN
    v_church_id := COALESCE(p_church_id, v_actor_church_id);
    v_is_church_admin := true;
  ELSE
    v_church_id := v_actor_church_id;
    IF p_church_id IS NOT NULL AND p_church_id IS DISTINCT FROM v_actor_church_id THEN
      RAISE EXCEPTION 'Church scope is not authorized' USING ERRCODE = '42501';
    END IF;

    SELECT EXISTS (
      SELECT 1
      FROM public.user_roles AS role_row
      JOIN public.profiles AS actor_profile
        ON actor_profile.user_id = role_row.user_id
      WHERE role_row.user_id = v_actor_id
        AND role_row.role = 'admin'::public.app_role
        AND actor_profile.church_id = v_church_id
    )
    INTO v_is_church_admin;
  END IF;

  IF v_church_id IS NULL THEN
    RAISE EXCEPTION 'Church scope is required' USING ERRCODE = '22023';
  END IF;

  IF p_turma_id IS NOT NULL THEN
    IF NOT private.can_manage_turma(v_actor_id, p_turma_id) THEN
      RAISE EXCEPTION 'Turma scope is not authorized' USING ERRCODE = '42501';
    END IF;
  ELSIF p_area IS NOT NULL THEN
    IF NOT v_is_church_admin THEN
      RAISE EXCEPTION 'Area scope is reserved for church administrators' USING ERRCODE = '42501';
    END IF;
  ELSIF NOT v_is_church_admin THEN
    RAISE EXCEPTION 'A leader must select an assigned turma' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT *
  FROM private.get_leader_care_dashboard(
    p_turma_id,
    p_area,
    v_church_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_leader_care_dashboard(uuid, text, uuid)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_leader_care_dashboard(uuid, text, uuid)
  TO authenticated;
