--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'SQL_ASCII';
SET standard_conforming_strings = off;
SET search_path = public, auth, storage;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET escape_string_warning = off;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS public;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM (
        'user',
        'admin',
        'lider',
        'super_admin'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


--
-- Name: area_name; Type: TYPE; Schema: public; Owner: -
--

DO $$ BEGIN
    CREATE TYPE public.area_name AS ENUM (
        'Área 1',
        'Área 2',
        'DISCIPULADO JEMIAC'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


--
-- Name: community_name; Type: TYPE; Schema: public; Owner: -
--

DO $$ BEGIN
    CREATE TYPE public.community_name AS ENUM (
        'Martim Lutero',
        'Bom Pastor',
        'Rincão Fundo',
        'Rincão Frente',
        'Linha Brasil',
        'Iriá Pira 1',
        'Iriá Pira 2',
        'JEMIAC'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


--
-- Name: can_manage_church(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.can_manage_church(_church_id uuid) RETURNS boolean
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
declare
  result boolean := false;
begin
  if _church_id is null then
    return public.is_super_admin(auth.uid());
  end if;

  if public.is_super_admin(auth.uid()) then
    return true;
  end if;

  begin
    execute '
      select exists (
        select 1
        from public.user_roles ur
        join public.profiles p on p.user_id = ur.user_id
        where ur.user_id = $1
          and ur.role::text in (''admin'', ''lider'')
          and coalesce(ur.church_id, p.church_id) = $2
      )
    ' into result using auth.uid(), _church_id;
  exception
    when undefined_column then
      execute '
        select exists (
          select 1
          from public.user_roles ur
          join public.profiles p on p.user_id = ur.user_id
          where ur.user_id = $1
            and ur.role::text in (''admin'', ''lider'')
            and p.church_id = $2
        )
      ' into result using auth.uid(), _church_id;
  end;

  return coalesce(result, false);
end
$_$;


--
-- Name: check_church_member_limit(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.check_church_member_limit() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_member_limit INTEGER;
    v_current_count INTEGER;
    v_subscription_status TEXT;
    v_church_id UUID;
BEGIN
    -- Get the church_id for the profile
    v_church_id := NEW.church_id;
    
    -- If church_id is null, we don't enforce limits (might be a global user or super admin)
    IF v_church_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Get subscription info
    SELECT member_limit, subscription_status 
    INTO v_member_limit, v_subscription_status
    FROM public.church_subscriptions
    WHERE church_id = v_church_id
    LIMIT 1;

    -- If no subscription found, default to blocked (must have subscription to have members)
    IF v_subscription_status IS NULL THEN
        RAISE EXCEPTION 'Church has no subscription record.';
    END IF;

    -- Block if subscription is blocked or past_due/unpaid (optional: could allow grace period)
    IF v_subscription_status IN ('blocked', 'canceled') THEN
        RAISE EXCEPTION 'Church subscription is %.', v_subscription_status;
    END IF;

    -- If limit is null, it means unlimited (Pastoral plan)
    IF v_member_limit IS NULL THEN
        RETURN NEW;
    END IF;

    -- Count existing members
    SELECT count(*) INTO v_current_count
    FROM public.profiles
    WHERE church_id = v_church_id;

    -- If inserting new member, check if it exceeds limit
    IF (TG_OP = 'INSERT') AND (v_current_count >= v_member_limit) THEN
        RAISE EXCEPTION 'Member limit reached for this church (%/%). Upgrade your plan to add more members.', v_current_count, v_member_limit;
    END IF;

    RETURN NEW;
END;
$$;


--
-- Name: check_church_member_limit(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.check_church_member_limit(p_church_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_current_count INTEGER;
    v_limit INTEGER;
BEGIN
    -- Only count ACTIVE users towards the limit
    SELECT COUNT(*) INTO v_current_count
    FROM public.profiles
    WHERE church_id = p_church_id AND is_active = TRUE;

    SELECT member_limit INTO v_limit
    FROM public.church_subscriptions
    WHERE church_id = p_church_id
    LIMIT 1;

    IF v_limit IS NULL THEN
        RETURN TRUE;
    END IF;

    RETURN v_current_count < v_limit;
END;
$$;


--
-- Name: delete_push_scheduled(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.delete_push_scheduled(_id uuid) RETURNS void
    LANGUAGE sql SECURITY DEFINER
    AS $$
  DELETE FROM public.push_scheduled WHERE id = _id;
$$;


--
-- Name: delete_user_from_discipleship(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.delete_user_from_discipleship(_target_user_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'auth'
    AS $$
declare
  _caller_id uuid := auth.uid();
  _caller_is_admin boolean;
  _caller_is_leader boolean;
  _target_is_admin boolean;
  _target_is_leader boolean;
  _caller_area text;
  _target_area text;
begin
  if _caller_id is null then
    raise exception 'Nao autorizado';
  end if;

  if _target_user_id is null then
    raise exception 'Usuario alvo obrigatorio';
  end if;

  if _target_user_id = _caller_id then
    raise exception 'Voce nao pode deletar a si mesmo';
  end if;

  select public.has_role(_caller_id, 'admin'::public.app_role)
    into _caller_is_admin;

  select public.has_role(_caller_id, 'lider'::public.app_role)
    into _caller_is_leader;

  if not coalesce(_caller_is_admin, false)
     and not coalesce(_caller_is_leader, false) then
    raise exception 'Apenas administradores e discipuladores podem deletar usuarios';
  end if;

  select public.has_role(_target_user_id, 'admin'::public.app_role)
    into _target_is_admin;

  select public.has_role(_target_user_id, 'lider'::public.app_role)
    into _target_is_leader;

  if coalesce(_target_is_admin, false)
     or coalesce(_target_is_leader, false) then
    raise exception 'Nao e permitido deletar administradores ou discipuladores';
  end if;

  if coalesce(_caller_is_leader, false)
     and not coalesce(_caller_is_admin, false) then
    select area into _caller_area
    from public.profiles
    where user_id = _caller_id;

    select area into _target_area
    from public.profiles
    where user_id = _target_user_id;

    if _caller_area is null or _target_area is null or _caller_area <> _target_area then
      raise exception 'Voce so pode deletar usuarios da sua propria turma';
    end if;
  end if;

  delete from public.profiles
  where user_id = _target_user_id;

  delete from public.user_roles
  where user_id = _target_user_id;

  delete from auth.users
  where id = _target_user_id;

  return jsonb_build_object('success', true);
end;
$$;


--
-- Name: enforce_church_member_limit(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.enforce_church_member_limit() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    IF NOT public.check_church_member_limit(NEW.church_id) THEN
        RAISE EXCEPTION 'Limite de membros atingido para esta igreja. Faça o upgrade do plano para adicionar mais usuários.';
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: get_all_areas(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.get_all_areas() RETURNS TABLE(id uuid, name text, description text, created_at timestamp with time zone, created_by uuid)
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select
    a.id,
    a.name,
    a.description,
    a.created_at,
    a.created_by
  from public.areas a
  order by a.name;
$$;


--
-- Name: get_all_communities(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.get_all_communities() RETURNS TABLE(id uuid, name text, area_id uuid, created_at timestamp with time zone, created_by uuid)
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select
    c.id,
    c.name,
    c.area_id,
    c.created_at,
    c.created_by
  from public.communities c
  order by c.name;
$$;


--
-- Name: get_area_birthdays(text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.get_area_birthdays(_area text, _month integer DEFAULT NULL::integer) RETURNS TABLE(user_id uuid, full_name text, birth_date date, community text, area text)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  WITH requester AS (
    SELECT
      auth.uid() AS user_id,
      public.get_my_area()::text AS own_area,
      public.has_role(auth.uid(), 'admin'::public.app_role) AS is_admin,
      public.has_role(auth.uid(), 'lider'::public.app_role) AS is_lider,
      public.is_super_admin(auth.uid()) AS is_super
  ),
  scope AS (
    SELECT
      COALESCE(NULLIF(_area, ''), own_area) AS target_area,
      own_area,
      is_admin,
      is_lider,
      is_super
    FROM requester
  )
  SELECT
    p.user_id,
    p.full_name,
    p.birth_date,
    p.community::text AS community,
    p.area::text AS area
  FROM public.profiles p
  CROSS JOIN scope s
  WHERE p.birth_date IS NOT NULL
    AND (
      (_month IS NULL)
      OR EXTRACT(MONTH FROM p.birth_date)::integer = _month
    )
    AND p.area::text = s.target_area
    AND (
      s.is_super
      OR s.is_admin
      OR s.is_lider
      OR p.area::text = s.own_area
    )
  ORDER BY
    EXTRACT(DAY FROM p.birth_date)::integer,
    p.full_name;
$$;


--
-- Name: get_auth_church_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.get_auth_church_id() RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select p.church_id
  from public.profiles p
  where p.user_id = auth.uid()
  limit 1
$$;


--
-- Name: get_church_member_count(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.get_church_member_count(p_church_id uuid) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN (
        SELECT count(*)::INTEGER
        FROM public.profiles
        WHERE church_id = p_church_id
    );
END;
$$;


--
-- Name: get_church_user_stats(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.get_church_user_stats(p_church_id uuid) RETURNS TABLE(total_users bigint, active_users bigint, pending_users bigint, inactive_users bigint, member_limit integer)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE is_active = TRUE)::BIGINT as total_users,
        COUNT(*) FILTER (WHERE enrollment_status = 'approved' AND is_active = TRUE)::BIGINT as active_users,
        COUNT(*) FILTER (WHERE enrollment_status = 'pending' AND is_active = TRUE)::BIGINT as pending_users,
        COUNT(*) FILTER (WHERE is_active = FALSE)::BIGINT as inactive_users,
        (SELECT cs.member_limit FROM public.church_subscriptions cs WHERE cs.church_id = p_church_id LIMIT 1) as member_limit
    FROM public.profiles
    WHERE church_id = p_church_id;
END;
$$;


--
-- Name: get_community_area(public.community_name); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.get_community_area(_community public.community_name) RETURNS public.area_name
    LANGUAGE sql IMMUTABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT CASE
    WHEN _community IN ('Rincão Frente', 'Rincão Fundo', 'Bom Pastor', 'Iriá Pira 1') THEN 'Área 1'::area_name
    ELSE 'Área 2'::area_name
  END
$$;


--
-- Name: get_community_ranking(public.community_name); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.get_community_ranking(_community public.community_name) RETURNS TABLE(user_id uuid, full_name text, completed_count bigint, faith_points bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  _lesson_pts integer;
  _dev_pts integer;
  _dev_wk_pts integer;
  _dev_recovery_pts integer;
  _att_pts integer;
  _worship_pts integer;
  _course_bonus integer;
  _challenge_pts integer;
BEGIN
  SELECT
    COALESCE(MAX(CASE WHEN key = 'lesson_points' THEN value END), 20),
    COALESCE(MAX(CASE WHEN key = 'devotional_points' THEN value END), 5),
    COALESCE(MAX(CASE WHEN key = 'devotional_weekend_points' THEN value END), 2),
    COALESCE(MAX(CASE WHEN key = 'devotional_recovery_points' THEN value END), 2),
    COALESCE(MAX(CASE WHEN key = 'attendance_points' THEN value END), 10),
    COALESCE(MAX(CASE WHEN key = 'worship_points' THEN value END), 5),
    COALESCE(MAX(CASE WHEN key = 'course_completion_bonus' THEN value END), 100),
    COALESCE(MAX(CASE WHEN key = 'challenge_points' THEN value END), 15)
  INTO
    _lesson_pts,
    _dev_pts,
    _dev_wk_pts,
    _dev_recovery_pts,
    _att_pts,
    _worship_pts,
    _course_bonus,
    _challenge_pts
  FROM public.game_config;

  RETURN QUERY
  WITH scoped_profiles AS (
    SELECT p.user_id, p.full_name, p.area
    FROM public.profiles p
    WHERE p.community = _community
      AND NOT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = p.user_id
          AND ur.role IN ('admin', 'lider')
      )
  ),
  lesson_points AS (
    SELECT lr.user_id, COUNT(DISTINCT lr.lesson_id) * _lesson_pts AS pts
    FROM public.lesson_responses lr
    JOIN scoped_profiles sp ON sp.user_id = lr.user_id
    GROUP BY lr.user_id
  ),
  devotional_pts AS (
    SELECT
      dp.user_id,
      SUM(
        COALESCE(
          dp.awarded_points,
          CASE
            WHEN COALESCE(dp.is_recovery, false) THEN _dev_recovery_pts
            WHEN EXTRACT(DOW FROM dp.completed_at AT TIME ZONE 'America/Sao_Paulo') IN (0, 6) THEN _dev_wk_pts
            ELSE _dev_pts
          END
        )
      ) AS pts
    FROM public.devotional_progress dp
    JOIN scoped_profiles sp ON sp.user_id = dp.user_id
    GROUP BY dp.user_id
  ),
  attendance_pts AS (
    SELECT
      a.user_id,
      SUM(
        CASE
          WHEN COALESCE(cet.gives_points, false) THEN COALESCE(cet.points, _att_pts)
          ELSE _att_pts
        END
      ) AS pts
    FROM public.attendance a
    JOIN scoped_profiles sp ON sp.user_id = a.user_id
    JOIN public.events e ON e.id = a.event_id
    LEFT JOIN LATERAL (
      SELECT cet.gives_points, cet.points
      FROM public.custom_event_types cet
      WHERE cet.value = e.type
        AND (cet.area IS NULL OR cet.area = sp.area::text)
      ORDER BY CASE WHEN cet.area = sp.area::text THEN 0 ELSE 1 END
      LIMIT 1
    ) cet ON true
    WHERE a.status = 'presente'
    GROUP BY a.user_id
  ),
  worship_pts AS (
    SELECT wa.user_id, COUNT(*) * _worship_pts AS pts
    FROM public.worship_attendance wa
    JOIN scoped_profiles sp ON sp.user_id = wa.user_id
    WHERE wa.status = 'aprovado'
    GROUP BY wa.user_id
  ),
  activity_pts AS (
    SELECT up.user_id, COALESCE(SUM(act.points), 0) AS pts, COUNT(up.id) AS cnt
    FROM public.user_progress up
    JOIN public.activities act ON act.id = up.activity_id
    JOIN scoped_profiles sp ON sp.user_id = up.user_id
    GROUP BY up.user_id
  ),
  challenge_pts AS (
    SELECT cp.user_id, COUNT(*) * _challenge_pts AS pts
    FROM public.challenge_participants cp
    JOIN scoped_profiles sp ON sp.user_id = cp.user_id
    WHERE cp.completed = true
    GROUP BY cp.user_id
  ),
  course_bonus AS (
    SELECT sp.user_id, COUNT(DISTINCT c.id) * _course_bonus AS pts
    FROM scoped_profiles sp
    JOIN public.courses c ON true
    JOIN public.lessons l ON l.course_id = c.id
    LEFT JOIN public.lesson_responses lr
      ON lr.lesson_id = l.id
     AND lr.user_id = sp.user_id
    GROUP BY sp.user_id, c.id, (SELECT COUNT(*) FROM public.lessons WHERE course_id = c.id)
    HAVING COUNT(DISTINCT lr.lesson_id) = (SELECT COUNT(*) FROM public.lessons WHERE course_id = c.id)
  ),
  course_bonus_agg AS (
    SELECT cb.user_id, SUM(cb.pts) AS pts
    FROM course_bonus cb
    GROUP BY cb.user_id
  ),
  achievement_pts AS (
    SELECT au.user_id, COALESCE(SUM(au.bonus_points), 0) AS pts
    FROM public.achievement_unlocks au
    JOIN scoped_profiles sp ON sp.user_id = au.user_id
    GROUP BY au.user_id
  )
  SELECT
    sp.user_id,
    sp.full_name,
    COALESCE(ap.cnt, 0)::bigint AS completed_count,
    (
      COALESCE(lp.pts, 0) +
      COALESCE(dp.pts, 0) +
      COALESCE(atp.pts, 0) +
      COALESCE(ap.pts, 0) +
      COALESCE(cb.pts, 0) +
      COALESCE(wp.pts, 0) +
      COALESCE(achp.pts, 0) +
      COALESCE(chp.pts, 0)
    )::bigint AS faith_points
  FROM scoped_profiles sp
  LEFT JOIN lesson_points lp ON lp.user_id = sp.user_id
  LEFT JOIN devotional_pts dp ON dp.user_id = sp.user_id
  LEFT JOIN attendance_pts atp ON atp.user_id = sp.user_id
  LEFT JOIN activity_pts ap ON ap.user_id = sp.user_id
  LEFT JOIN course_bonus_agg cb ON cb.user_id = sp.user_id
  LEFT JOIN worship_pts wp ON wp.user_id = sp.user_id
  LEFT JOIN achievement_pts achp ON achp.user_id = sp.user_id
  LEFT JOIN challenge_pts chp ON chp.user_id = sp.user_id
  ORDER BY faith_points DESC, completed_count DESC;
END;
$$;


--
-- Name: get_game_config(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.get_game_config() RETURNS TABLE(key text, value integer)
    LANGUAGE sql SECURITY DEFINER
    AS $$ SELECT key, value FROM public.game_config ORDER BY key; $$;


--
-- Name: get_my_area(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.get_my_area() RETURNS public.area_name
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT 
    CASE 
      -- Super admin: return area from profile (UI will handle multi-area)
      WHEN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role IN ('admin', 'lider') AND is_super = true
      ) THEN (SELECT area FROM public.profiles WHERE user_id = auth.uid() LIMIT 1)
      -- Regular admin/lider: return admin_area or profile area
      ELSE COALESCE(
        (SELECT admin_area::area_name FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'lider') AND admin_area IS NOT NULL LIMIT 1),
        (SELECT area FROM public.profiles WHERE user_id = auth.uid() LIMIT 1)
      )
    END
$$;


--
-- Name: get_my_church_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.get_my_church_id() RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
    SELECT church_id FROM public.profiles WHERE user_id = auth.uid();
$$;


--
-- Name: get_my_community(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.get_my_community() RETURNS public.community_name
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT community FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$;


--
-- Name: get_profession_of_faith_report(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.get_profession_of_faith_report(p_church_id uuid) RETURNS TABLE(user_id uuid, full_name text, turma_name text, professed_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pr.user_id,
        pr.full_name,
        pr.turma_name,
        pr.professed_at
    FROM public.profession_of_faith_records pr
    WHERE pr.church_id = p_church_id
    ORDER BY pr.professed_at DESC;
END;
$$;


--
-- Name: get_push_automation_config(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.get_push_automation_config() RETURNS TABLE(key text, title text, body text, enabled boolean, description text)
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT key, title, body, enabled, description
  FROM public.push_automation_config
  ORDER BY key;
$$;


--
-- Name: get_push_scheduled_pending(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.get_push_scheduled_pending() RETURNS TABLE(id uuid, title text, body text, target text, target_value text, scheduled_at timestamp with time zone, created_at timestamp with time zone)
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT id, title, body, target, target_value, scheduled_at, created_at
  FROM public.push_scheduled
  WHERE sent = false
  ORDER BY scheduled_at;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  selected_area public.area_name;
  selected_community public.community_name;
  resolved_area_id uuid;
begin
  if new.raw_user_meta_data is null then
    return new;
  end if;

  if new.raw_user_meta_data->>'full_name' is null then
    return new;
  end if;

  if new.raw_user_meta_data->>'community' is null then
    return new;
  end if;

  selected_community := (trim(new.raw_user_meta_data->>'community'))::public.community_name;

  select c.area_id
    into resolved_area_id
  from public.communities c
  where c.name = selected_community::text
  limit 1;

  if resolved_area_id is null then
    raise exception 'Comunidade "%" não encontrada em public.communities', selected_community::text;
  end if;

  if nullif(trim(new.raw_user_meta_data->>'area'), '') is not null then
    selected_area := (trim(new.raw_user_meta_data->>'area'))::public.area_name;
  else
    select a.name::public.area_name
      into selected_area
    from public.areas a
    where a.id = resolved_area_id
    limit 1;
  end if;

  if not exists (
    select 1
    from public.areas a
    where a.id = resolved_area_id
      and a.name = selected_area::text
  ) then
    raise exception 'Comunidade "%" não pertence à área "%"', selected_community::text, selected_area::text;
  end if;

  insert into public.profiles (
    user_id,
    full_name,
    birth_date,
    phone,
    community,
    area,
    father_name,
    mother_name,
    father_phone,
    mother_phone,
    avatar_url,
    email
  )
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    (new.raw_user_meta_data->>'birth_date')::date,
    new.raw_user_meta_data->>'phone',
    selected_community,
    selected_area,
    coalesce(new.raw_user_meta_data->>'father_name', ''),
    coalesce(new.raw_user_meta_data->>'mother_name', ''),
    coalesce(new.raw_user_meta_data->>'father_phone', ''),
    coalesce(new.raw_user_meta_data->>'mother_phone', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    new.email
  )
  on conflict (user_id) do update
  set
    full_name = excluded.full_name,
    birth_date = excluded.birth_date,
    phone = excluded.phone,
    community = excluded.community,
    area = excluded.area,
    father_name = excluded.father_name,
    mother_name = excluded.mother_name,
    father_phone = excluded.father_phone,
    mother_phone = excluded.mother_phone,
    avatar_url = excluded.avatar_url,
    email = excluded.email;

  return new;
end;
$$;


--
-- Name: handle_new_user_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.handle_new_user_role() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, 'user')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;


--
-- Name: handle_prayer_interaction(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.handle_prayer_interaction() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.prayer_requests
    SET prayers_count = prayers_count + 1
    WHERE id = NEW.request_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.prayer_requests
    SET prayers_count = prayers_count - 1
    WHERE id = OLD.request_id;
  END IF;
  RETURN NULL;
END;
$$;


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: insert_push_scheduled(text, text, text, text, timestamp with time zone, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.insert_push_scheduled(_title text, _body text, _target text, _target_value text, _scheduled_at timestamp with time zone, _created_by uuid) RETURNS uuid
    LANGUAGE sql SECURITY DEFINER
    AS $$
  INSERT INTO public.push_scheduled (title, body, target, target_value, scheduled_at, created_by)
  VALUES (_title, _body, _target, _target_value, _scheduled_at, _created_by)
  RETURNING id;
$$;


--
-- Name: is_authorized_system_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.is_authorized_system_admin() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_is_authorized BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.authorized_system_admins asa
        JOIN auth.users au ON lower(au.email) = lower(asa.email)
        WHERE au.id = auth.uid()
          AND asa.is_active = true
    ) INTO v_is_authorized;

    RETURN COALESCE(v_is_authorized, FALSE);
END;
$$;


--
-- Name: is_authorized_system_admin_v2(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.is_authorized_system_admin_v2() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    RETURN public.is_authorized_system_admin();
END;
$$;


--
-- Name: is_super_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.is_super_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND (role = 'super_admin' OR (role = 'admin' AND church_id IS NULL))
  );
$$;


--
-- Name: is_super_admin(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid DEFAULT auth.uid()) RETURNS boolean
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
declare
  result boolean := false;
begin
  if to_regclass('public.user_roles') is null then
    return false;
  end if;

  begin
    execute '
      select exists (
        select 1
        from public.user_roles ur
        where ur.user_id = $1
          and (
            ur.role::text = ''super_admin''
            or coalesce(ur.is_super, false)
            or coalesce(ur.is_super_admin, false)
          )
      )
    ' into result using _user_id;
  exception
    when undefined_column then
      execute '
        select exists (
          select 1
          from public.user_roles ur
          where ur.user_id = $1
            and ur.role::text = ''super_admin''
        )
      ' into result using _user_id;
  end;

  return coalesce(result, false);
end
$_$;


--
-- Name: log_blocked_registration(uuid, text, text, text, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.log_blocked_registration(p_church_id uuid, p_email text, p_full_name text, p_reason text, p_current_count integer, p_limit integer) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    INSERT INTO public.blocked_registration_attempts (church_id, email, full_name, reason, current_count, member_limit)
    VALUES (p_church_id, p_email, p_full_name, p_reason, p_current_count, p_limit);
END;
$$;


--
-- Name: log_church_audit(uuid, text, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.log_church_audit(p_church_id uuid, p_action text, p_details jsonb DEFAULT '{}'::jsonb) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.church_audit_logs (church_id, action, details, created_at)
  VALUES (p_church_id, p_action, p_details, now());
END;
$$;


--
-- Name: log_login_event(text, text, text, uuid, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.log_login_event(p_email text, p_method text, p_status text, p_church_id uuid DEFAULT NULL::uuid, p_details jsonb DEFAULT '{}'::jsonb) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.login_audit_logs (email, method, status, church_id, details, ip_address)
    VALUES (
        p_email,
        p_method,
        p_status,
        p_church_id,
        p_details,
        current_setting('request.headers', true)::jsonb ->> 'x-real-ip'
    );
END;
$$;


--
-- Name: log_plan_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.log_plan_change() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    IF (OLD.recommended_plan IS DISTINCT FROM NEW.recommended_plan) OR 
       (OLD.member_limit IS DISTINCT FROM NEW.member_limit) OR
       (OLD.subscription_status IS DISTINCT FROM NEW.subscription_status) THEN
        INSERT INTO public.plan_history (
            church_id,
            changed_by,
            previous_plan,
            new_plan,
            previous_limit,
            new_limit,
            notes
        ) VALUES (
            NEW.church_id,
            auth.uid(),
            OLD.recommended_plan,
            NEW.recommended_plan,
            OLD.member_limit,
            NEW.member_limit,
            'Alteração de plano detectada via sistema/admin'
        );
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: log_system_access_attempt(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.log_system_access_attempt(p_status text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    INSERT INTO public.system_admin_audit_logs (admin_id, email, action, status, ip_address)
    VALUES (
        auth.uid(), 
        (SELECT email FROM auth.users WHERE id = auth.uid()), 
        'login_attempt', 
        p_status, 
        current_setting('request.headers', true)::jsonb ->> 'x-real-ip'
    );
END;
$$;


--
-- Name: notify_subscription_stats_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.notify_subscription_stats_change() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Notify about profile changes (approvals, inactivations) to refresh MinhaIgreja counts
  PERFORM pg_notify('pgrst', 'stats_changed');
  RETURN NULL;
END;
$$;


--
-- Name: on_prayer_answered(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.on_prayer_answered() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    IF NEW.status = 'answered' AND (OLD.status IS NULL OR OLD.status != 'answered') THEN
        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (NEW.user_id, 'Pedido respondido!', 'Seu pedido de oração foi marcado como respondido. Glória a Deus!', 'prayer_answered', '/comunidade');
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: on_prayer_interaction(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.on_prayer_interaction() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    target_user_id UUID;
    prayer_content TEXT;
BEGIN
    SELECT user_id, content INTO target_user_id, prayer_content FROM public.prayer_requests WHERE id = NEW.request_id;
    IF target_user_id IS NOT NULL AND target_user_id != NEW.user_id THEN
        INSERT INTO public.notifications (user_id, title, message, type, link)
        VALUES (target_user_id, 'Alguém orou por você!', 'Um irmão começou a interceder pelo seu pedido: "' || LEFT(prayer_content, 30) || '..."', 'prayer_interaction', '/comunidade');
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: process_profession_of_faith(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.process_profession_of_faith(p_user_id uuid, p_turma_id uuid DEFAULT NULL::uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_profile RECORD;
    v_turma_name TEXT;
BEGIN
    SELECT * INTO v_profile FROM public.profiles WHERE user_id = p_user_id;
    
    IF v_profile.user_id IS NULL THEN
        RAISE EXCEPTION 'Perfil não encontrado';
    END IF;

    IF p_turma_id IS NOT NULL THEN
        SELECT name INTO v_turma_name FROM public.turmas WHERE id = p_turma_id;
    END IF;

    -- Record in history
    INSERT INTO public.profession_of_faith_records (church_id, user_id, full_name, turma_id, turma_name)
    VALUES (v_profile.church_id, v_profile.user_id, v_profile.full_name, p_turma_id, v_turma_name);

    -- Inactivate user and clear turma to free spot
    UPDATE public.profiles 
    SET is_active = FALSE, 
        turma_id = NULL,
        enrollment_status = 'archived'
    WHERE user_id = p_user_id;

    -- Log audit
    INSERT INTO public.church_audit_logs (church_id, action, details)
    VALUES (v_profile.church_id, 'profession_of_faith_completed', jsonb_build_object('user_id', p_user_id, 'name', v_profile.full_name));
END;
$$;


--
-- Name: process_profession_of_faith(uuid, uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.process_profession_of_faith(p_user_id uuid, p_turma_id uuid DEFAULT NULL::uuid, p_performed_by uuid DEFAULT auth.uid()) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_profile RECORD;
    v_turma_name TEXT;
BEGIN
    SELECT * INTO v_profile FROM public.profiles WHERE user_id = p_user_id;
    
    IF v_profile.user_id IS NULL THEN
        RAISE EXCEPTION 'Perfil não encontrado';
    END IF;

    IF p_turma_id IS NOT NULL THEN
        SELECT name INTO v_turma_name FROM public.turmas WHERE id = p_turma_id;
    END IF;

    -- Record in history with performer
    INSERT INTO public.profession_of_faith_records (church_id, user_id, full_name, turma_id, turma_name, performed_by)
    VALUES (v_profile.church_id, v_profile.user_id, v_profile.full_name, p_turma_id, v_turma_name, p_performed_by);

    -- Inactivate user and clear turma to free spot
    UPDATE public.profiles 
    SET is_active = FALSE, 
        turma_id = NULL,
        enrollment_status = 'archived',
        updated_at = now()
    WHERE user_id = p_user_id;

    -- Log audit with detailed tracking
    INSERT INTO public.church_audit_logs (church_id, action, details)
    VALUES (
        v_profile.church_id, 
        'profession_of_faith_completed', 
        jsonb_build_object(
            'target_user_id', p_user_id, 
            'target_name', v_profile.full_name,
            'performed_by', p_performed_by,
            'previous_turma', v_turma_name
        )
    );
END;
$$;


--
-- Name: secure_extend_trial(uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.secure_extend_trial(p_church_subscription_id uuid, p_days integer) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_admin_email TEXT;
    v_new_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Check if caller is authorized system admin
    SELECT email INTO v_admin_email FROM auth.users WHERE id = auth.uid();
    
    IF NOT EXISTS (SELECT 1 FROM public.authorized_system_admins WHERE email = v_admin_email) THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    -- Calculate new date
    SELECT COALESCE(trial_ends_at, now()) + (p_days || ' days')::interval INTO v_new_date
    FROM public.church_subscriptions
    WHERE id = p_church_subscription_id;

    -- Update subscription
    UPDATE public.church_subscriptions
    SET trial_ends_at = v_new_date,
        subscription_status = 'trial',
        updated_at = now()
    WHERE id = p_church_subscription_id;

    -- Log audit
    INSERT INTO public.system_admin_audit_logs (admin_email, action, details)
    VALUES (v_admin_email, 'extend_trial', jsonb_build_object('id', p_church_subscription_id, 'days', p_days, 'new_date', v_new_date));
END;
$$;


--
-- Name: set_system_master_password(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.set_system_master_password(p_new_password text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'extensions'
    AS $$
BEGIN
    INSERT INTO public.system_settings (key, value)
    VALUES ('master_password_hash', extensions.crypt(p_new_password, extensions.gen_salt('bf', 10)))
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
END;
$$;


--
-- Name: sync_user_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.sync_user_role() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    UPDATE public.profiles
    SET role = NEW.role
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$;


--
-- Name: test_stripe_webhook(uuid, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.test_stripe_webhook(p_church_subscription_id uuid, p_event_type text, p_stripe_status text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_admin_email TEXT;
BEGIN
    -- Check if caller is authorized system admin
    SELECT email INTO v_admin_email FROM auth.users WHERE id = auth.uid();
    
    IF NOT EXISTS (SELECT 1 FROM public.authorized_system_admins WHERE email = v_admin_email) THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    -- Update status directly for testing
    UPDATE public.church_subscriptions
    SET subscription_status = p_stripe_status,
        updated_at = now()
    WHERE id = p_church_subscription_id;

    -- Log simulation
    INSERT INTO public.stripe_webhook_logs (event_id, event_type, status, church_subscription_id, payload)
    VALUES ('test_' || gen_random_uuid(), p_event_type, 'processed', p_church_subscription_id, jsonb_build_object('simulated', true, 'status', p_stripe_status));

    RETURN jsonb_build_object('success', true);
END;
$$;


--
-- Name: update_lesson_content_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.update_lesson_content_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_privacy_requests_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.update_privacy_requests_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_push_automation_config(text, text, text, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.update_push_automation_config(_key text, _title text, _body text, _enabled boolean) RETURNS void
    LANGUAGE sql SECURITY DEFINER
    AS $$
  UPDATE public.push_automation_config
  SET title = _title, body = _body, enabled = _enabled
  WHERE key = _key;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


--
-- Name: upsert_game_config_item(text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.upsert_game_config_item(_key text, _value integer) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Acesso negado'; END IF;
  INSERT INTO public.game_config (key, value) VALUES (_key, _value)
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
END; $$;


--
-- Name: verify_system_master_password(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.verify_system_master_password(p_password_attempt text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'extensions'
    AS $$
DECLARE
    v_stored_hash TEXT;
    v_is_authorized BOOLEAN;
BEGIN
    SELECT public.is_authorized_system_admin() INTO v_is_authorized;
    IF NOT v_is_authorized THEN RETURN FALSE; END IF;

    SELECT value INTO v_stored_hash FROM public.system_settings WHERE key = 'master_password_hash';
    IF v_stored_hash IS NULL THEN RETURN FALSE; END IF;

    RETURN v_stored_hash = extensions.crypt(p_password_attempt, v_stored_hash);
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: achievement_definitions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.achievement_definitions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    icon text DEFAULT '🏆'::text NOT NULL,
    title text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    metric text NOT NULL,
    target integer DEFAULT 1 NOT NULL,
    bonus_points integer DEFAULT 10 NOT NULL,
    is_secret boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid
);


--
-- Name: achievement_unlocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.achievement_unlocks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    achievement_key text NOT NULL,
    bonus_points integer DEFAULT 10 NOT NULL,
    unlocked_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid
);


--
-- Name: activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.activities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    subtitle text,
    order_num integer NOT NULL,
    points integer DEFAULT 10 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid,
    CONSTRAINT activities_type_check CHECK ((type = ANY (ARRAY['devocional'::text, 'formacao'::text, 'encontro'::text, 'desafio'::text])))
);


--
-- Name: activity_removal_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.activity_removal_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    removed_by uuid NOT NULL,
    target_user_id uuid NOT NULL,
    activity_type text NOT NULL,
    activity_id text NOT NULL,
    activity_title text DEFAULT ''::text NOT NULL,
    points_removed integer DEFAULT 0 NOT NULL,
    removed_at timestamp with time zone DEFAULT now() NOT NULL,
    notes text DEFAULT ''::text,
    church_id uuid
);


--
-- Name: area_pastors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.area_pastors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    area text NOT NULL,
    pastor_name text DEFAULT ''::text NOT NULL,
    phone text DEFAULT ''::text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    church_id uuid
);


--
-- Name: areas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.areas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    church_id uuid
);


--
-- Name: attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.attendance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    user_id uuid NOT NULL,
    status text DEFAULT 'presente'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    justification text,
    church_id uuid,
    confirmation_source text,
    confirmed_by uuid,
    user_requested_at timestamp with time zone,
    leader_confirmed_at timestamp with time zone,
    CONSTRAINT attendance_confirmation_source_check CHECK (((confirmation_source IS NULL) OR (confirmation_source = ANY (ARRAY['user'::text, 'leader'::text, 'both'::text])))),
    CONSTRAINT attendance_status_check CHECK ((status = ANY (ARRAY['presente'::text, 'faltou'::text, 'justificado'::text, 'pendente_presente'::text, 'pendente_falta'::text, 'justificou'::text, 'rejeitado'::text])))
);


--
-- Name: authorized_system_admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.authorized_system_admins (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid
);


--
-- Name: blocked_registration_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.blocked_registration_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    church_id uuid NOT NULL,
    email text,
    full_name text,
    attempted_at timestamp with time zone DEFAULT now(),
    reason text NOT NULL,
    current_count integer NOT NULL,
    member_limit integer NOT NULL
);


--
-- Name: challenge_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.challenge_participants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    challenge_id uuid NOT NULL,
    user_id uuid NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    completed_at timestamp with time zone,
    response_text text,
    file_url text,
    church_id uuid
);


--
-- Name: church_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.church_audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    church_id uuid,
    action text NOT NULL,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: church_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.church_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    church_name text NOT NULL,
    church_address text DEFAULT ''::text,
    church_phone text DEFAULT ''::text,
    church_email text NOT NULL,
    pastor_name text NOT NULL,
    pastor_role text DEFAULT 'Pastor'::text,
    pastor_phone text DEFAULT ''::text,
    pastor_email text DEFAULT ''::text,
    member_count text DEFAULT ''::text,
    average_age text DEFAULT ''::text,
    activities text DEFAULT ''::text,
    objectives text DEFAULT ''::text,
    needs text DEFAULT ''::text,
    preferences text DEFAULT ''::text,
    recommended_plan text DEFAULT 'comunidade'::text NOT NULL,
    stripe_customer_id text,
    stripe_subscription_id text,
    subscription_status text DEFAULT 'pending_checkout'::text NOT NULL,
    trial_ends_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    member_limit integer,
    church_id uuid,
    is_active boolean DEFAULT true,
    last_webhook_event_id text,
    trial_alert_snoozed_until timestamp with time zone,
    last_threshold_alert_pct integer DEFAULT 0
);


--
-- Name: churches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.churches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    address text,
    city text,
    state text,
    logo_url text,
    primary_color text DEFAULT '#1F3C88'::text,
    secondary_color text DEFAULT '#E8880A'::text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: communities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.communities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    area_id uuid NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    church_id uuid
);


--
-- Name: community_challenges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.community_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    emoji text DEFAULT '📖'::text NOT NULL,
    community text,
    area text,
    start_date date NOT NULL,
    end_date date NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    requires_text boolean DEFAULT false NOT NULL,
    requires_file boolean DEFAULT false NOT NULL,
    church_id uuid
);


--
-- Name: community_chat; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.community_chat (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    community text NOT NULL,
    user_id uuid NOT NULL,
    user_name text NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    reply_to uuid,
    reply_to_name text,
    reply_to_text text,
    file_url text,
    file_type text,
    church_id uuid
);


--
-- Name: community_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.community_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    community text NOT NULL,
    whatsapp_link text,
    verse_of_week text,
    verse_reference text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    church_id uuid
);


--
-- Name: course_unlocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.course_unlocks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    area text NOT NULL,
    unlocked_by uuid NOT NULL,
    unlocked_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid
);


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.courses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_num integer NOT NULL,
    title text NOT NULL,
    subtitle text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid
);


--
-- Name: custom_event_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.custom_event_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    value text NOT NULL,
    label text NOT NULL,
    emoji text DEFAULT '📅'::text NOT NULL,
    gives_points boolean DEFAULT false NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    area text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid
);


--
-- Name: data_export_audit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.data_export_audit (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid DEFAULT auth.uid() NOT NULL,
    export_type text NOT NULL,
    scope text NOT NULL,
    status text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid,
    CONSTRAINT data_export_audit_export_type_check CHECK ((export_type = ANY (ARRAY['personal_json'::text, 'admin_schema'::text, 'admin_data'::text, 'admin_full'::text]))),
    CONSTRAINT data_export_audit_scope_check CHECK ((scope = ANY (ARRAY['self'::text, 'system'::text]))),
    CONSTRAINT data_export_audit_status_check CHECK ((status = ANY (ARRAY['started'::text, 'completed'::text, 'failed'::text])))
);


--
-- Name: devotional_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.devotional_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    activity_id uuid,
    bible_text text DEFAULT ''::text NOT NULL,
    bible_reference text DEFAULT ''::text NOT NULL,
    reflection text DEFAULT ''::text NOT NULL,
    prayer text DEFAULT ''::text NOT NULL,
    practice text DEFAULT ''::text NOT NULL,
    questions text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    lesson_id uuid,
    day_number integer DEFAULT 1 NOT NULL,
    title text DEFAULT ''::text NOT NULL,
    worship_song_id uuid,
    church_id uuid
);


--
-- Name: devotional_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.devotional_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    devotional_id uuid NOT NULL,
    completed_at timestamp with time zone DEFAULT now() NOT NULL,
    is_recovery boolean DEFAULT false NOT NULL,
    awarded_points integer,
    override_release_id uuid,
    church_id uuid,
    CONSTRAINT devotional_progress_awarded_points_nonnegative CHECK (((awarded_points IS NULL) OR (awarded_points >= 0)))
);


--
-- Name: devotional_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.devotional_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    devotional_id uuid NOT NULL,
    question_index integer NOT NULL,
    response text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid
);


--
-- Name: devotional_worship_songs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.devotional_worship_songs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    devotional_id uuid NOT NULL,
    worship_song_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    church_id uuid
);


--
-- Name: discipleship_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.discipleship_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    objectives text,
    challenges text,
    recommendations text,
    next_steps text,
    pastor_notes text,
    health_status text DEFAULT 'atencao'::text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_priority boolean DEFAULT false NOT NULL,
    last_contact_at timestamp with time zone,
    aptidao text DEFAULT 'acompanhamento'::text,
    church_id uuid,
    CONSTRAINT discipleship_plans_aptidao_check CHECK ((aptidao = ANY (ARRAY['apto'::text, 'acompanhamento'::text, 'nao_apto'::text]))),
    CONSTRAINT discipleship_plans_health_status_check CHECK ((health_status = ANY (ARRAY['saudavel'::text, 'atencao'::text, 'critico'::text])))
);


--
-- Name: event_photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.event_photos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    user_id uuid NOT NULL,
    file_url text NOT NULL,
    caption text DEFAULT ''::text,
    status text DEFAULT 'pendente'::text NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    event_date timestamp with time zone NOT NULL,
    location text,
    area text,
    community text,
    type text DEFAULT 'encontro'::text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    linked_lesson_id uuid,
    target_user_id uuid,
    released_devotional_days integer[],
    turma_id uuid,
    church_id uuid
);


--
-- Name: frontend_error_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.frontend_error_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    church_id uuid,
    user_id uuid,
    error_message text NOT NULL,
    stack_trace text,
    component_stack text,
    url text,
    user_agent text,
    severity text DEFAULT 'error'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: game_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.game_config (
    key text NOT NULL,
    value integer NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid
);


--
-- Name: leader_guide; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.leader_guide (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lesson_id uuid NOT NULL,
    greeting text DEFAULT ''::text NOT NULL,
    icebreaker text DEFAULT ''::text NOT NULL,
    summary text DEFAULT ''::text NOT NULL,
    bible_texts text[] DEFAULT '{}'::text[] NOT NULL,
    questions text[] DEFAULT '{}'::text[] NOT NULL,
    practice text DEFAULT ''::text NOT NULL,
    prayer_prompt text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid
);


--
-- Name: leader_meeting_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.leader_meeting_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    leader_id uuid NOT NULL,
    lesson_id uuid NOT NULL,
    participation_notes text DEFAULT ''::text,
    questions_notes text DEFAULT ''::text,
    pastoral_care_notes text DEFAULT ''::text,
    follow_up_notes text DEFAULT ''::text,
    spiritual_notes text DEFAULT ''::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid,
    area public.area_name
);


--
-- Name: lesson_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.lesson_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lesson_id uuid NOT NULL,
    greeting text DEFAULT ''::text NOT NULL,
    icebreaker text DEFAULT ''::text NOT NULL,
    summary text DEFAULT ''::text NOT NULL,
    bible_texts text[] DEFAULT '{}'::text[] NOT NULL,
    questions text[] DEFAULT '{}'::text[] NOT NULL,
    practice text DEFAULT ''::text NOT NULL,
    prayer_prompt text DEFAULT ''::text NOT NULL,
    video_link text DEFAULT ''::text NOT NULL,
    audio_link text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    pdf_link text DEFAULT ''::text NOT NULL,
    church_id uuid
);


--
-- Name: lesson_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.lesson_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    lesson_id uuid NOT NULL,
    question_key text NOT NULL,
    response text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    awarded_points integer,
    override_release_id uuid,
    church_id uuid,
    CONSTRAINT lesson_responses_awarded_points_nonnegative CHECK (((awarded_points IS NULL) OR (awarded_points >= 0)))
);


--
-- Name: lessons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.lessons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    order_num integer NOT NULL,
    title text NOT NULL,
    objective text,
    topics text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    devotional_mode text DEFAULT '10_days'::text NOT NULL,
    church_id uuid
);


--
-- Name: login_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.login_audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text,
    method text NOT NULL,
    status text NOT NULL,
    church_id uuid,
    ip_address text,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: meeting_evaluations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.meeting_evaluations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    user_id uuid NOT NULL,
    admin_id uuid NOT NULL,
    participation_score integer,
    understanding_score integer,
    engagement_score integer,
    notes text DEFAULT ''::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid,
    CONSTRAINT meeting_evaluations_engagement_score_check CHECK (((engagement_score >= 1) AND (engagement_score <= 5))),
    CONSTRAINT meeting_evaluations_participation_score_check CHECK (((participation_score >= 1) AND (participation_score <= 5))),
    CONSTRAINT meeting_evaluations_understanding_score_check CHECK (((understanding_score >= 1) AND (understanding_score <= 5)))
);


--
-- Name: message_reactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.message_reactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    message_id uuid NOT NULL,
    user_id uuid NOT NULL,
    emoji text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid
);


--
-- Name: message_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.message_views (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    message_id uuid NOT NULL,
    user_id uuid NOT NULL,
    viewed_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    area text,
    community text,
    sent_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    turma_id uuid,
    church_id uuid
);


--
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    devocional boolean DEFAULT true NOT NULL,
    eventos boolean DEFAULT true NOT NULL,
    streak boolean DEFAULT true NOT NULL,
    mensagens boolean DEFAULT true NOT NULL,
    master_enabled boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    preferred_hour integer DEFAULT 7 NOT NULL,
    timezone text DEFAULT 'America/Sao_Paulo'::text NOT NULL,
    whatsapp_enabled boolean DEFAULT false NOT NULL,
    whatsapp_devocional boolean DEFAULT true NOT NULL,
    whatsapp_desafio boolean DEFAULT true NOT NULL,
    whatsapp_checkin boolean DEFAULT true NOT NULL,
    church_id uuid
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL,
    link text,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: pastoral_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.pastoral_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    admin_id uuid NOT NULL,
    note_type text DEFAULT 'acompanhamento'::text NOT NULL,
    content text NOT NULL,
    is_private boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid,
    CONSTRAINT pastoral_notes_note_type_check CHECK ((note_type = ANY (ARRAY['acompanhamento'::text, 'conversa'::text, 'encontro_individual'::text, 'observacao'::text])))
);


--
-- Name: plan_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.plan_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    church_id uuid NOT NULL,
    changed_by uuid,
    previous_plan text,
    new_plan text,
    previous_limit integer,
    new_limit integer,
    changed_at timestamp with time zone DEFAULT now() NOT NULL,
    notes text
);


--
-- Name: poll_votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.poll_votes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    poll_id uuid NOT NULL,
    user_id uuid NOT NULL,
    option_index integer NOT NULL,
    voted_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid
);


--
-- Name: polls; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.polls (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question text NOT NULL,
    options text[] DEFAULT '{}'::text[] NOT NULL,
    emoji text DEFAULT '📊'::text NOT NULL,
    created_by uuid NOT NULL,
    community text NOT NULL,
    area text,
    is_active boolean DEFAULT true NOT NULL,
    ends_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid
);


--
-- Name: prayer_diary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.prayer_diary (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    request_id uuid,
    title text NOT NULL,
    content text NOT NULL,
    response text,
    answered_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    area text,
    turma_id uuid
);


--
-- Name: prayer_interactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.prayer_interactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    request_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: prayer_pairs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.prayer_pairs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    community text NOT NULL,
    user_a_id uuid NOT NULL,
    user_b_id uuid NOT NULL,
    user_a_name text DEFAULT ''::text NOT NULL,
    user_b_name text DEFAULT ''::text NOT NULL,
    week_start date NOT NULL,
    user_a_confirmed boolean DEFAULT false NOT NULL,
    user_b_confirmed boolean DEFAULT false NOT NULL,
    user_a_testimony text,
    user_b_testimony text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid
);


--
-- Name: prayer_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.prayer_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    area text NOT NULL,
    turma_id uuid,
    content text NOT NULL,
    visibility text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    is_sensitive boolean DEFAULT false,
    prayers_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    community text,
    church_id uuid,
    CONSTRAINT prayer_requests_status_check CHECK ((status = ANY (ARRAY['open'::text, 'answered'::text, 'archived'::text]))),
    CONSTRAINT prayer_requests_visibility_check CHECK ((visibility = ANY (ARRAY['public'::text, 'leaders_only'::text, 'anonymous'::text])))
);


--
-- Name: privacy_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.privacy_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid DEFAULT auth.uid() NOT NULL,
    request_type text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    details text,
    admin_notes text,
    resolved_at timestamp with time zone,
    resolved_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid,
    CONSTRAINT privacy_requests_request_type_check CHECK ((request_type = ANY (ARRAY['data_deletion'::text, 'data_correction'::text, 'consent_review'::text, 'other'::text]))),
    CONSTRAINT privacy_requests_status_check CHECK ((status = ANY (ARRAY['open'::text, 'in_review'::text, 'completed'::text, 'rejected'::text])))
);


--
-- Name: profession_of_faith_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.profession_of_faith_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    church_id uuid NOT NULL,
    user_id uuid NOT NULL,
    full_name text NOT NULL,
    turma_id uuid,
    turma_name text,
    professed_at timestamp with time zone DEFAULT now(),
    details jsonb DEFAULT '{}'::jsonb,
    performed_by uuid
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    full_name text NOT NULL,
    birth_date date NOT NULL,
    phone text NOT NULL,
    community public.community_name NOT NULL,
    area public.area_name NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    father_name text DEFAULT ''::text,
    mother_name text DEFAULT ''::text,
    father_phone text DEFAULT ''::text,
    mother_phone text DEFAULT ''::text,
    address text DEFAULT ''::text,
    turma_id uuid,
    avatar_url text DEFAULT ''::text,
    confirmation_year smallint,
    email text,
    whatsapp_number text,
    whatsapp_validation_status text,
    whatsapp_last_blocked_reason text,
    whatsapp_last_blocked_at timestamp with time zone,
    role public.app_role DEFAULT 'user'::public.app_role,
    enrollment_status text DEFAULT 'active'::text,
    enrollment_status_updated_at timestamp with time zone,
    enrollment_status_updated_by uuid,
    church_id uuid,
    is_active boolean DEFAULT true
);


--
-- Name: push_activation_reminders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.push_activation_reminders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    target_user_id uuid NOT NULL,
    sent_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    dismissed_at timestamp with time zone,
    church_id uuid
);


--
-- Name: push_automation_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.push_automation_config (
    key text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    description text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid
);


--
-- Name: push_notification_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.push_notification_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type text DEFAULT 'manual'::text NOT NULL,
    title text DEFAULT ''::text NOT NULL,
    body text DEFAULT ''::text NOT NULL,
    target text DEFAULT 'all'::text NOT NULL,
    target_value text,
    sent_count integer DEFAULT 0 NOT NULL,
    failed_count integer DEFAULT 0 NOT NULL,
    sent_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid
);


--
-- Name: push_scheduled; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.push_scheduled (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    target text DEFAULT 'all'::text NOT NULL,
    target_value text,
    scheduled_at timestamp with time zone NOT NULL,
    sent boolean DEFAULT false NOT NULL,
    sent_at timestamp with time zone,
    sent_count integer DEFAULT 0,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid
);


--
-- Name: push_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    endpoint text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid
);


--
-- Name: ranking_seasons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.ranking_seasons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    community text NOT NULL,
    closed_at timestamp with time zone DEFAULT now() NOT NULL,
    closed_by uuid NOT NULL,
    winners jsonb DEFAULT '[]'::jsonb NOT NULL,
    total_participants integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid
);


--
-- Name: spiritual_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.spiritual_assessments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    prayer_score integer,
    presence_score integer,
    struggle_score integer,
    doubt_score integer,
    needs_pastor boolean DEFAULT false NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid,
    CONSTRAINT spiritual_assessments_doubt_score_check CHECK (((doubt_score >= 1) AND (doubt_score <= 5))),
    CONSTRAINT spiritual_assessments_prayer_score_check CHECK (((prayer_score >= 1) AND (prayer_score <= 5))),
    CONSTRAINT spiritual_assessments_presence_score_check CHECK (((presence_score >= 1) AND (presence_score <= 5))),
    CONSTRAINT spiritual_assessments_struggle_score_check CHECK (((struggle_score >= 1) AND (struggle_score <= 5)))
);


--
-- Name: stripe_webhook_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.stripe_webhook_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id text NOT NULL,
    event_type text NOT NULL,
    payload jsonb NOT NULL,
    church_subscription_id uuid,
    status text DEFAULT 'processed'::text,
    error_message text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: system_admin_audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.system_admin_audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    admin_id uuid,
    email text,
    action text NOT NULL,
    status text NOT NULL,
    ip_address text,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.system_settings (
    key text NOT NULL,
    value text NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: testimonies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.testimonies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    user_name text NOT NULL,
    community text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid
);


--
-- Name: turma_lesson_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.turma_lesson_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    turma_id uuid NOT NULL,
    lesson_id uuid NOT NULL,
    church_id uuid,
    greeting text,
    icebreaker text,
    summary text,
    bible_texts text[],
    questions text[],
    practice text,
    prayer_prompt text,
    video_link text,
    audio_link text,
    pdf_link text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: turmas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.turmas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    area text,
    year integer DEFAULT (EXTRACT(year FROM now()))::integer NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid
);


--
-- Name: user_devotional_overrides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.user_devotional_overrides (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    devotional_id uuid NOT NULL,
    granted_by uuid,
    custom_points integer,
    available_from timestamp with time zone,
    available_until timestamp with time zone,
    notes text,
    is_unlocked boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid,
    CONSTRAINT user_devotional_overrides_custom_points_nonnegative CHECK (((custom_points IS NULL) OR (custom_points >= 0)))
);


--
-- Name: user_lesson_overrides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.user_lesson_overrides (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    lesson_id uuid NOT NULL,
    granted_by uuid,
    custom_points integer,
    available_from timestamp with time zone,
    available_until timestamp with time zone,
    notes text,
    is_unlocked boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid,
    CONSTRAINT user_lesson_overrides_custom_points_nonnegative CHECK (((custom_points IS NULL) OR (custom_points >= 0)))
);


--
-- Name: user_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.user_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    activity_id uuid NOT NULL,
    completed_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    admin_area text,
    is_super boolean DEFAULT false NOT NULL,
    is_super_admin boolean DEFAULT false,
    church_id uuid
);


--
-- Name: whatsapp_reminder_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.whatsapp_reminder_config (
    key text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    message_template text NOT NULL,
    threshold integer DEFAULT 1 NOT NULL,
    description text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: whatsapp_reminder_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.whatsapp_reminder_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    reminder_type text NOT NULL,
    reference_id text,
    phone text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'sent'::text NOT NULL,
    error_detail text,
    sent_at timestamp with time zone DEFAULT now() NOT NULL,
    blocked_reason_code text,
    is_resent boolean DEFAULT false NOT NULL,
    resent_at timestamp with time zone,
    resent_by uuid,
    church_id uuid
);


--
-- Name: worship_attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.worship_attendance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    worship_date date NOT NULL,
    worship_time text NOT NULL,
    preacher_name text NOT NULL,
    status text DEFAULT 'pendente'::text NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    event_type text DEFAULT 'culto'::text NOT NULL,
    church_id uuid
);


--
-- Name: worship_songs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.worship_songs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    artist text NOT NULL,
    url text NOT NULL,
    platform text NOT NULL,
    theme text,
    thumbnail_url text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    church_id uuid,
    CONSTRAINT worship_songs_platform_check CHECK ((platform = ANY (ARRAY['youtube'::text, 'spotify'::text, 'other'::text])))
);


--
-- Name: year_promotion_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.year_promotion_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    from_year smallint DEFAULT 1 NOT NULL,
    to_year smallint DEFAULT 2 NOT NULL,
    turma_id uuid,
    status text DEFAULT 'pendente'::text NOT NULL,
    requested_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    church_id uuid
);


--
-- Name: achievement_definitions achievement_definitions_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievement_definitions
    ADD CONSTRAINT achievement_definitions_key_key UNIQUE (key);


--
-- Name: achievement_definitions achievement_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievement_definitions
    ADD CONSTRAINT achievement_definitions_pkey PRIMARY KEY (id);


--
-- Name: achievement_unlocks achievement_unlocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievement_unlocks
    ADD CONSTRAINT achievement_unlocks_pkey PRIMARY KEY (id);


--
-- Name: achievement_unlocks achievement_unlocks_user_id_achievement_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievement_unlocks
    ADD CONSTRAINT achievement_unlocks_user_id_achievement_key_key UNIQUE (user_id, achievement_key);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: activity_removal_log activity_removal_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_removal_log
    ADD CONSTRAINT activity_removal_log_pkey PRIMARY KEY (id);


--
-- Name: area_pastors area_pastors_area_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.area_pastors
    ADD CONSTRAINT area_pastors_area_key UNIQUE (area);


--
-- Name: area_pastors area_pastors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.area_pastors
    ADD CONSTRAINT area_pastors_pkey PRIMARY KEY (id);


--
-- Name: areas areas_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_name_key UNIQUE (name);


--
-- Name: areas areas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_event_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_event_id_user_id_key UNIQUE (event_id, user_id);


--
-- Name: attendance attendance_event_user_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_event_user_unique UNIQUE (event_id, user_id);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: authorized_system_admins authorized_system_admins_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authorized_system_admins
    ADD CONSTRAINT authorized_system_admins_email_key UNIQUE (email);


--
-- Name: authorized_system_admins authorized_system_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authorized_system_admins
    ADD CONSTRAINT authorized_system_admins_pkey PRIMARY KEY (id);


--
-- Name: blocked_registration_attempts blocked_registration_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blocked_registration_attempts
    ADD CONSTRAINT blocked_registration_attempts_pkey PRIMARY KEY (id);


--
-- Name: challenge_participants challenge_participants_challenge_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_participants
    ADD CONSTRAINT challenge_participants_challenge_id_user_id_key UNIQUE (challenge_id, user_id);


--
-- Name: challenge_participants challenge_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_participants
    ADD CONSTRAINT challenge_participants_pkey PRIMARY KEY (id);


--
-- Name: church_audit_logs church_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.church_audit_logs
    ADD CONSTRAINT church_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: church_subscriptions church_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.church_subscriptions
    ADD CONSTRAINT church_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: churches churches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.churches
    ADD CONSTRAINT churches_pkey PRIMARY KEY (id);


--
-- Name: churches churches_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.churches
    ADD CONSTRAINT churches_slug_key UNIQUE (slug);


--
-- Name: communities communities_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_name_key UNIQUE (name);


--
-- Name: communities communities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_pkey PRIMARY KEY (id);


--
-- Name: community_challenges community_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_challenges
    ADD CONSTRAINT community_challenges_pkey PRIMARY KEY (id);


--
-- Name: community_chat community_chat_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_chat
    ADD CONSTRAINT community_chat_pkey PRIMARY KEY (id);


--
-- Name: community_settings community_settings_community_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_settings
    ADD CONSTRAINT community_settings_community_key UNIQUE (community);


--
-- Name: community_settings community_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_settings
    ADD CONSTRAINT community_settings_pkey PRIMARY KEY (id);


--
-- Name: course_unlocks course_unlocks_course_id_area_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_unlocks
    ADD CONSTRAINT course_unlocks_course_id_area_key UNIQUE (course_id, area);


--
-- Name: course_unlocks course_unlocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_unlocks
    ADD CONSTRAINT course_unlocks_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: custom_event_types custom_event_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_event_types
    ADD CONSTRAINT custom_event_types_pkey PRIMARY KEY (id);


--
-- Name: custom_event_types custom_event_types_value_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_event_types
    ADD CONSTRAINT custom_event_types_value_key UNIQUE (value);


--
-- Name: data_export_audit data_export_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_export_audit
    ADD CONSTRAINT data_export_audit_pkey PRIMARY KEY (id);


--
-- Name: devotional_content devotional_content_activity_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devotional_content
    ADD CONSTRAINT devotional_content_activity_id_key UNIQUE (activity_id);


--
-- Name: devotional_content devotional_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devotional_content
    ADD CONSTRAINT devotional_content_pkey PRIMARY KEY (id);


--
-- Name: devotional_progress devotional_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devotional_progress
    ADD CONSTRAINT devotional_progress_pkey PRIMARY KEY (id);


--
-- Name: devotional_progress devotional_progress_user_id_devotional_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devotional_progress
    ADD CONSTRAINT devotional_progress_user_id_devotional_id_key UNIQUE (user_id, devotional_id);


--
-- Name: devotional_responses devotional_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devotional_responses
    ADD CONSTRAINT devotional_responses_pkey PRIMARY KEY (id);


--
-- Name: devotional_responses devotional_responses_user_id_devotional_id_question_index_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devotional_responses
    ADD CONSTRAINT devotional_responses_user_id_devotional_id_question_index_key UNIQUE (user_id, devotional_id, question_index);


--
-- Name: devotional_worship_songs devotional_worship_songs_devotional_id_worship_song_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devotional_worship_songs
    ADD CONSTRAINT devotional_worship_songs_devotional_id_worship_song_id_key UNIQUE (devotional_id, worship_song_id);


--
-- Name: devotional_worship_songs devotional_worship_songs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devotional_worship_songs
    ADD CONSTRAINT devotional_worship_songs_pkey PRIMARY KEY (id);


--
-- Name: discipleship_plans discipleship_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discipleship_plans
    ADD CONSTRAINT discipleship_plans_pkey PRIMARY KEY (id);


--
-- Name: discipleship_plans discipleship_plans_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discipleship_plans
    ADD CONSTRAINT discipleship_plans_user_id_key UNIQUE (user_id);


--
-- Name: event_photos event_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_photos
    ADD CONSTRAINT event_photos_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: frontend_error_logs frontend_error_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.frontend_error_logs
    ADD CONSTRAINT frontend_error_logs_pkey PRIMARY KEY (id);


--
-- Name: game_config game_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_config
    ADD CONSTRAINT game_config_pkey PRIMARY KEY (key);


--
-- Name: leader_guide leader_guide_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leader_guide
    ADD CONSTRAINT leader_guide_pkey PRIMARY KEY (id);


--
-- Name: leader_meeting_notes leader_meeting_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leader_meeting_notes
    ADD CONSTRAINT leader_meeting_notes_pkey PRIMARY KEY (id);


--
-- Name: lesson_content lesson_content_lesson_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_content
    ADD CONSTRAINT lesson_content_lesson_id_key UNIQUE (lesson_id);


--
-- Name: lesson_content lesson_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_content
    ADD CONSTRAINT lesson_content_pkey PRIMARY KEY (id);


--
-- Name: lesson_responses lesson_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_responses
    ADD CONSTRAINT lesson_responses_pkey PRIMARY KEY (id);


--
-- Name: lesson_responses lesson_responses_user_id_lesson_id_question_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_responses
    ADD CONSTRAINT lesson_responses_user_id_lesson_id_question_key_key UNIQUE (user_id, lesson_id, question_key);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: login_audit_logs login_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.login_audit_logs
    ADD CONSTRAINT login_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: meeting_evaluations meeting_evaluations_event_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_evaluations
    ADD CONSTRAINT meeting_evaluations_event_id_user_id_key UNIQUE (event_id, user_id);


--
-- Name: meeting_evaluations meeting_evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_evaluations
    ADD CONSTRAINT meeting_evaluations_pkey PRIMARY KEY (id);


--
-- Name: message_reactions message_reactions_message_id_user_id_emoji_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reactions
    ADD CONSTRAINT message_reactions_message_id_user_id_emoji_key UNIQUE (message_id, user_id, emoji);


--
-- Name: message_reactions message_reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reactions
    ADD CONSTRAINT message_reactions_pkey PRIMARY KEY (id);


--
-- Name: message_views message_views_message_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_views
    ADD CONSTRAINT message_views_message_id_user_id_key UNIQUE (message_id, user_id);


--
-- Name: message_views message_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_views
    ADD CONSTRAINT message_views_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_key UNIQUE (user_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: pastoral_notes pastoral_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pastoral_notes
    ADD CONSTRAINT pastoral_notes_pkey PRIMARY KEY (id);


--
-- Name: plan_history plan_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_history
    ADD CONSTRAINT plan_history_pkey PRIMARY KEY (id);


--
-- Name: poll_votes poll_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.poll_votes
    ADD CONSTRAINT poll_votes_pkey PRIMARY KEY (id);


--
-- Name: poll_votes poll_votes_poll_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.poll_votes
    ADD CONSTRAINT poll_votes_poll_id_user_id_key UNIQUE (poll_id, user_id);


--
-- Name: polls polls_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.polls
    ADD CONSTRAINT polls_pkey PRIMARY KEY (id);


--
-- Name: prayer_diary prayer_diary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prayer_diary
    ADD CONSTRAINT prayer_diary_pkey PRIMARY KEY (id);


--
-- Name: prayer_interactions prayer_interactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prayer_interactions
    ADD CONSTRAINT prayer_interactions_pkey PRIMARY KEY (id);


--
-- Name: prayer_interactions prayer_interactions_user_id_request_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prayer_interactions
    ADD CONSTRAINT prayer_interactions_user_id_request_id_key UNIQUE (user_id, request_id);


--
-- Name: prayer_pairs prayer_pairs_community_user_a_id_week_start_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prayer_pairs
    ADD CONSTRAINT prayer_pairs_community_user_a_id_week_start_key UNIQUE (community, user_a_id, week_start);


--
-- Name: prayer_pairs prayer_pairs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prayer_pairs
    ADD CONSTRAINT prayer_pairs_pkey PRIMARY KEY (id);


--
-- Name: prayer_requests prayer_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prayer_requests
    ADD CONSTRAINT prayer_requests_pkey PRIMARY KEY (id);


--
-- Name: privacy_requests privacy_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privacy_requests
    ADD CONSTRAINT privacy_requests_pkey PRIMARY KEY (id);


--
-- Name: profession_of_faith_records profession_of_faith_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profession_of_faith_records
    ADD CONSTRAINT profession_of_faith_records_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: push_activation_reminders push_activation_reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_activation_reminders
    ADD CONSTRAINT push_activation_reminders_pkey PRIMARY KEY (id);


--
-- Name: push_automation_config push_automation_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_automation_config
    ADD CONSTRAINT push_automation_config_pkey PRIMARY KEY (key);


--
-- Name: push_notification_log push_notification_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_notification_log
    ADD CONSTRAINT push_notification_log_pkey PRIMARY KEY (id);


--
-- Name: push_scheduled push_scheduled_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_scheduled
    ADD CONSTRAINT push_scheduled_pkey PRIMARY KEY (id);


--
-- Name: push_subscriptions push_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: push_subscriptions push_subscriptions_user_id_endpoint_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_user_id_endpoint_key UNIQUE (user_id, endpoint);


--
-- Name: ranking_seasons ranking_seasons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ranking_seasons
    ADD CONSTRAINT ranking_seasons_pkey PRIMARY KEY (id);


--
-- Name: spiritual_assessments spiritual_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spiritual_assessments
    ADD CONSTRAINT spiritual_assessments_pkey PRIMARY KEY (id);


--
-- Name: spiritual_assessments spiritual_assessments_user_id_month_year_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spiritual_assessments
    ADD CONSTRAINT spiritual_assessments_user_id_month_year_key UNIQUE (user_id, month, year);


--
-- Name: stripe_webhook_logs stripe_webhook_logs_event_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stripe_webhook_logs
    ADD CONSTRAINT stripe_webhook_logs_event_id_key UNIQUE (event_id);


--
-- Name: stripe_webhook_logs stripe_webhook_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stripe_webhook_logs
    ADD CONSTRAINT stripe_webhook_logs_pkey PRIMARY KEY (id);


--
-- Name: system_admin_audit_logs system_admin_audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_admin_audit_logs
    ADD CONSTRAINT system_admin_audit_logs_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (key);


--
-- Name: testimonies testimonies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonies
    ADD CONSTRAINT testimonies_pkey PRIMARY KEY (id);


--
-- Name: turma_lesson_content turma_lesson_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.turma_lesson_content
    ADD CONSTRAINT turma_lesson_content_pkey PRIMARY KEY (id);


--
-- Name: turma_lesson_content turma_lesson_content_turma_id_lesson_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.turma_lesson_content
    ADD CONSTRAINT turma_lesson_content_turma_id_lesson_id_key UNIQUE (turma_id, lesson_id);


--
-- Name: turmas turmas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.turmas
    ADD CONSTRAINT turmas_pkey PRIMARY KEY (id);


--
-- Name: user_devotional_overrides user_devotional_overrides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_devotional_overrides
    ADD CONSTRAINT user_devotional_overrides_pkey PRIMARY KEY (id);


--
-- Name: user_devotional_overrides user_devotional_overrides_user_devotional_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_devotional_overrides
    ADD CONSTRAINT user_devotional_overrides_user_devotional_key UNIQUE (user_id, devotional_id);


--
-- Name: user_lesson_overrides user_lesson_overrides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_lesson_overrides
    ADD CONSTRAINT user_lesson_overrides_pkey PRIMARY KEY (id);


--
-- Name: user_lesson_overrides user_lesson_overrides_user_lesson_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_lesson_overrides
    ADD CONSTRAINT user_lesson_overrides_user_lesson_key UNIQUE (user_id, lesson_id);


--
-- Name: user_progress user_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_pkey PRIMARY KEY (id);


--
-- Name: user_progress user_progress_user_id_activity_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_activity_id_key UNIQUE (user_id, activity_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: whatsapp_reminder_config whatsapp_reminder_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_reminder_config
    ADD CONSTRAINT whatsapp_reminder_config_pkey PRIMARY KEY (key);


--
-- Name: whatsapp_reminder_log whatsapp_reminder_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_reminder_log
    ADD CONSTRAINT whatsapp_reminder_log_pkey PRIMARY KEY (id);


--
-- Name: worship_attendance worship_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worship_attendance
    ADD CONSTRAINT worship_attendance_pkey PRIMARY KEY (id);


--
-- Name: worship_songs worship_songs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worship_songs
    ADD CONSTRAINT worship_songs_pkey PRIMARY KEY (id);


--
-- Name: year_promotion_requests year_promotion_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.year_promotion_requests
    ADD CONSTRAINT year_promotion_requests_pkey PRIMARY KEY (id);


--
-- Name: achievement_definitions_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX achievement_definitions_church_id_idx ON public.achievement_definitions USING btree (church_id);


--
-- Name: achievement_unlocks_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX achievement_unlocks_church_id_idx ON public.achievement_unlocks USING btree (church_id);


--
-- Name: activities_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activities_church_id_idx ON public.activities USING btree (church_id);


--
-- Name: activity_removal_log_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX activity_removal_log_church_id_idx ON public.activity_removal_log USING btree (church_id);


--
-- Name: area_pastors_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX area_pastors_church_id_idx ON public.area_pastors USING btree (church_id);


--
-- Name: areas_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX areas_church_id_idx ON public.areas USING btree (church_id);


--
-- Name: attendance_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attendance_church_id_idx ON public.attendance USING btree (church_id);


--
-- Name: attendance_event_user_unique_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX attendance_event_user_unique_idx ON public.attendance USING btree (event_id, user_id);


--
-- Name: challenge_participants_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX challenge_participants_church_id_idx ON public.challenge_participants USING btree (church_id);


--
-- Name: communities_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX communities_church_id_idx ON public.communities USING btree (church_id);


--
-- Name: community_challenges_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_challenges_church_id_idx ON public.community_challenges USING btree (church_id);


--
-- Name: community_chat_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_chat_church_id_idx ON public.community_chat USING btree (church_id);


--
-- Name: community_settings_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_settings_church_id_idx ON public.community_settings USING btree (church_id);


--
-- Name: course_unlocks_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX course_unlocks_church_id_idx ON public.course_unlocks USING btree (church_id);


--
-- Name: courses_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX courses_church_id_idx ON public.courses USING btree (church_id);


--
-- Name: custom_event_types_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX custom_event_types_church_id_idx ON public.custom_event_types USING btree (church_id);


--
-- Name: data_export_audit_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX data_export_audit_church_id_idx ON public.data_export_audit USING btree (church_id);


--
-- Name: devotional_content_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX devotional_content_church_id_idx ON public.devotional_content USING btree (church_id);


--
-- Name: devotional_content_lesson_day_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX devotional_content_lesson_day_unique ON public.devotional_content USING btree (lesson_id, day_number) WHERE (lesson_id IS NOT NULL);


--
-- Name: devotional_progress_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX devotional_progress_church_id_idx ON public.devotional_progress USING btree (church_id);


--
-- Name: devotional_responses_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX devotional_responses_church_id_idx ON public.devotional_responses USING btree (church_id);


--
-- Name: devotional_worship_songs_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX devotional_worship_songs_church_id_idx ON public.devotional_worship_songs USING btree (church_id);


--
-- Name: discipleship_plans_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX discipleship_plans_church_id_idx ON public.discipleship_plans USING btree (church_id);


--
-- Name: event_photos_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX event_photos_church_id_idx ON public.event_photos USING btree (church_id);


--
-- Name: events_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_church_id_idx ON public.events USING btree (church_id);


--
-- Name: game_config_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX game_config_church_id_idx ON public.game_config USING btree (church_id);


--
-- Name: idx_attendance_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attendance_created_at ON public.attendance USING btree (created_at);


--
-- Name: idx_attendance_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_attendance_user_id ON public.attendance USING btree (user_id);


--
-- Name: idx_church_subscriptions_pastor_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_church_subscriptions_pastor_email ON public.church_subscriptions USING btree (pastor_email);


--
-- Name: idx_church_subscriptions_stripe_customer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_church_subscriptions_stripe_customer ON public.church_subscriptions USING btree (stripe_customer_id);


--
-- Name: idx_church_subscriptions_stripe_subscription; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_church_subscriptions_stripe_subscription ON public.church_subscriptions USING btree (stripe_subscription_id);


--
-- Name: idx_data_export_audit_type_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_data_export_audit_type_created ON public.data_export_audit USING btree (export_type, created_at DESC);


--
-- Name: idx_data_export_audit_user_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_data_export_audit_user_created ON public.data_export_audit USING btree (user_id, created_at DESC);


--
-- Name: idx_devotional_progress_completed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_devotional_progress_completed_at ON public.devotional_progress USING btree (completed_at);


--
-- Name: idx_devotional_progress_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_devotional_progress_user_id ON public.devotional_progress USING btree (user_id);


--
-- Name: idx_discipleship_plans_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_discipleship_plans_user_id ON public.discipleship_plans USING btree (user_id);


--
-- Name: idx_events_turma_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_turma_id ON public.events USING btree (turma_id);


--
-- Name: idx_lesson_responses_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lesson_responses_created_at ON public.lesson_responses USING btree (created_at);


--
-- Name: idx_lesson_responses_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lesson_responses_user_id ON public.lesson_responses USING btree (user_id);


--
-- Name: idx_prayer_diary_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prayer_diary_user_id ON public.prayer_diary USING btree (user_id);


--
-- Name: idx_prayer_interactions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prayer_interactions_user_id ON public.prayer_interactions USING btree (user_id);


--
-- Name: idx_prayer_requests_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_prayer_requests_user_id ON public.prayer_requests USING btree (user_id);


--
-- Name: idx_privacy_requests_status_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_privacy_requests_status_created ON public.privacy_requests USING btree (status, created_at DESC);


--
-- Name: idx_privacy_requests_user_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_privacy_requests_user_created ON public.privacy_requests USING btree (user_id, created_at DESC);


--
-- Name: idx_profiles_area; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_area ON public.profiles USING btree (area);


--
-- Name: idx_profiles_enrollment_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_enrollment_status ON public.profiles USING btree (enrollment_status);


--
-- Name: idx_profiles_full_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_full_name ON public.profiles USING btree (full_name);


--
-- Name: idx_profiles_turma_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_turma_id ON public.profiles USING btree (turma_id);


--
-- Name: idx_ranking_seasons_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_ranking_seasons_unique ON public.ranking_seasons USING btree (course_id, community);


--
-- Name: idx_user_devotional_overrides_devotional_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_devotional_overrides_devotional_id ON public.user_devotional_overrides USING btree (devotional_id);


--
-- Name: idx_user_devotional_overrides_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_devotional_overrides_user_id ON public.user_devotional_overrides USING btree (user_id);


--
-- Name: idx_user_lesson_overrides_lesson_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_lesson_overrides_lesson_id ON public.user_lesson_overrides USING btree (lesson_id);


--
-- Name: idx_user_lesson_overrides_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_lesson_overrides_user_id ON public.user_lesson_overrides USING btree (user_id);


--
-- Name: idx_user_progress_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_progress_user_id ON public.user_progress USING btree (user_id);


--
-- Name: idx_user_roles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);


--
-- Name: idx_wrl_sent_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wrl_sent_at ON public.whatsapp_reminder_log USING btree (sent_at DESC);


--
-- Name: idx_wrl_status_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wrl_status_code ON public.whatsapp_reminder_log USING btree (status, blocked_reason_code, sent_at DESC);


--
-- Name: idx_wrl_user_type_ref; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wrl_user_type_ref ON public.whatsapp_reminder_log USING btree (user_id, reminder_type, reference_id, sent_at DESC);


--
-- Name: leader_guide_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leader_guide_church_id_idx ON public.leader_guide USING btree (church_id);


--
-- Name: leader_guide_lesson_church_uidx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX leader_guide_lesson_church_uidx ON public.leader_guide USING btree (lesson_id, church_id);


--
-- Name: leader_meeting_notes_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX leader_meeting_notes_church_id_idx ON public.leader_meeting_notes USING btree (church_id);


--
-- Name: leader_meeting_notes_lesson_church_area_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX leader_meeting_notes_lesson_church_area_idx ON public.leader_meeting_notes USING btree (lesson_id, church_id, area);


--
-- Name: lesson_content_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lesson_content_church_id_idx ON public.lesson_content USING btree (church_id);


--
-- Name: lesson_content_lesson_church_uidx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX lesson_content_lesson_church_uidx ON public.lesson_content USING btree (lesson_id, church_id);


--
-- Name: lesson_responses_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lesson_responses_church_id_idx ON public.lesson_responses USING btree (church_id);


--
-- Name: lessons_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lessons_church_id_idx ON public.lessons USING btree (church_id);


--
-- Name: meeting_evaluations_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX meeting_evaluations_church_id_idx ON public.meeting_evaluations USING btree (church_id);


--
-- Name: message_reactions_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX message_reactions_church_id_idx ON public.message_reactions USING btree (church_id);


--
-- Name: message_views_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX message_views_church_id_idx ON public.message_views USING btree (church_id);


--
-- Name: messages_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX messages_church_id_idx ON public.messages USING btree (church_id);


--
-- Name: notification_preferences_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notification_preferences_church_id_idx ON public.notification_preferences USING btree (church_id);


--
-- Name: pastoral_notes_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pastoral_notes_church_id_idx ON public.pastoral_notes USING btree (church_id);


--
-- Name: poll_votes_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX poll_votes_church_id_idx ON public.poll_votes USING btree (church_id);


--
-- Name: polls_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX polls_church_id_idx ON public.polls USING btree (church_id);


--
-- Name: prayer_pairs_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX prayer_pairs_church_id_idx ON public.prayer_pairs USING btree (church_id);


--
-- Name: prayer_requests_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX prayer_requests_church_id_idx ON public.prayer_requests USING btree (church_id);


--
-- Name: privacy_requests_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX privacy_requests_church_id_idx ON public.privacy_requests USING btree (church_id);


--
-- Name: profiles_email_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX profiles_email_unique ON public.profiles USING btree (email) WHERE (email IS NOT NULL);


--
-- Name: push_activation_reminders_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX push_activation_reminders_church_id_idx ON public.push_activation_reminders USING btree (church_id);


--
-- Name: push_automation_config_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX push_automation_config_church_id_idx ON public.push_automation_config USING btree (church_id);


--
-- Name: push_notification_log_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX push_notification_log_church_id_idx ON public.push_notification_log USING btree (church_id);


--
-- Name: push_scheduled_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX push_scheduled_church_id_idx ON public.push_scheduled USING btree (church_id);


--
-- Name: push_subscriptions_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX push_subscriptions_church_id_idx ON public.push_subscriptions USING btree (church_id);


--
-- Name: ranking_seasons_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ranking_seasons_church_id_idx ON public.ranking_seasons USING btree (church_id);


--
-- Name: spiritual_assessments_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX spiritual_assessments_church_id_idx ON public.spiritual_assessments USING btree (church_id);


--
-- Name: testimonies_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX testimonies_church_id_idx ON public.testimonies USING btree (church_id);


--
-- Name: turmas_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX turmas_church_id_idx ON public.turmas USING btree (church_id);


--
-- Name: user_devotional_overrides_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_devotional_overrides_church_id_idx ON public.user_devotional_overrides USING btree (church_id);


--
-- Name: user_lesson_overrides_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_lesson_overrides_church_id_idx ON public.user_lesson_overrides USING btree (church_id);


--
-- Name: user_progress_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_progress_church_id_idx ON public.user_progress USING btree (church_id);


--
-- Name: user_roles_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_roles_church_id_idx ON public.user_roles USING btree (church_id);


--
-- Name: user_roles_user_role_church_uidx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX user_roles_user_role_church_uidx ON public.user_roles USING btree (user_id, role, church_id);


--
-- Name: whatsapp_reminder_log_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX whatsapp_reminder_log_church_id_idx ON public.whatsapp_reminder_log USING btree (church_id);


--
-- Name: worship_attendance_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX worship_attendance_church_id_idx ON public.worship_attendance USING btree (church_id);


--
-- Name: worship_songs_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX worship_songs_church_id_idx ON public.worship_songs USING btree (church_id);


--
-- Name: year_promotion_requests_church_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX year_promotion_requests_church_id_idx ON public.year_promotion_requests USING btree (church_id);


--
-- Name: prayer_interactions on_prayer_interaction; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_prayer_interaction AFTER INSERT OR DELETE ON public.prayer_interactions FOR EACH ROW EXECUTE FUNCTION public.handle_prayer_interaction();


--
-- Name: profiles on_profile_created; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_profile_created AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();


--
-- Name: profiles tr_check_member_limit; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_check_member_limit BEFORE INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.check_church_member_limit();


--
-- Name: profiles tr_enforce_church_member_limit; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_enforce_church_member_limit BEFORE INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.enforce_church_member_limit();


--
-- Name: church_subscriptions tr_log_plan_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_log_plan_change AFTER UPDATE ON public.church_subscriptions FOR EACH ROW EXECUTE FUNCTION public.log_plan_change();


--
-- Name: profiles tr_notify_subscription_stats; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_notify_subscription_stats AFTER INSERT OR DELETE OR UPDATE ON public.profiles FOR EACH STATEMENT EXECUTE FUNCTION public.notify_subscription_stats_change();


--
-- Name: prayer_requests tr_on_prayer_answered; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_on_prayer_answered AFTER UPDATE ON public.prayer_requests FOR EACH ROW EXECUTE FUNCTION public.on_prayer_answered();


--
-- Name: prayer_interactions tr_on_prayer_interaction; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_on_prayer_interaction AFTER INSERT ON public.prayer_interactions FOR EACH ROW EXECUTE FUNCTION public.on_prayer_interaction();


--
-- Name: user_roles tr_sync_user_role; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_sync_user_role AFTER INSERT OR UPDATE OF role ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.sync_user_role();


--
-- Name: churches update_churches_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_churches_updated_at BEFORE UPDATE ON public.churches FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: devotional_content update_devotional_content_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_devotional_content_updated_at BEFORE UPDATE ON public.devotional_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: devotional_responses update_devotional_responses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_devotional_responses_updated_at BEFORE UPDATE ON public.devotional_responses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: discipleship_plans update_discipleship_plans_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_discipleship_plans_updated_at BEFORE UPDATE ON public.discipleship_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: leader_guide update_leader_guide_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_leader_guide_updated_at BEFORE UPDATE ON public.leader_guide FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: leader_meeting_notes update_leader_meeting_notes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_leader_meeting_notes_updated_at BEFORE UPDATE ON public.leader_meeting_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: lesson_content update_lesson_content_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_lesson_content_timestamp BEFORE UPDATE ON public.lesson_content FOR EACH ROW EXECUTE FUNCTION public.update_lesson_content_updated_at();


--
-- Name: lesson_responses update_lesson_responses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_lesson_responses_updated_at BEFORE UPDATE ON public.lesson_responses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: meeting_evaluations update_meeting_evaluations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_meeting_evaluations_updated_at BEFORE UPDATE ON public.meeting_evaluations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: notification_preferences update_notification_preferences_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: prayer_requests update_prayer_requests_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_prayer_requests_updated_at BEFORE UPDATE ON public.prayer_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: privacy_requests update_privacy_requests_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_privacy_requests_updated_at BEFORE UPDATE ON public.privacy_requests FOR EACH ROW EXECUTE FUNCTION public.update_privacy_requests_updated_at();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: push_automation_config update_push_automation_config_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_push_automation_config_updated_at BEFORE UPDATE ON public.push_automation_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: push_subscriptions update_push_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_push_subscriptions_updated_at BEFORE UPDATE ON public.push_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_devotional_overrides update_user_devotional_overrides_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_devotional_overrides_updated_at BEFORE UPDATE ON public.user_devotional_overrides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_lesson_overrides update_user_lesson_overrides_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_lesson_overrides_updated_at BEFORE UPDATE ON public.user_lesson_overrides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: worship_songs update_worship_songs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_worship_songs_updated_at BEFORE UPDATE ON public.worship_songs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: achievement_definitions achievement_definitions_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievement_definitions
    ADD CONSTRAINT achievement_definitions_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: achievement_unlocks achievement_unlocks_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievement_unlocks
    ADD CONSTRAINT achievement_unlocks_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);


--
-- Name: activities activities_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);


--
-- Name: activity_removal_log activity_removal_log_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_removal_log
    ADD CONSTRAINT activity_removal_log_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: area_pastors area_pastors_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.area_pastors
    ADD CONSTRAINT area_pastors_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: areas areas_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);


--
-- Name: attendance attendance_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);


--
-- Name: attendance attendance_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: attendance attendance_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: authorized_system_admins authorized_system_admins_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authorized_system_admins
    ADD CONSTRAINT authorized_system_admins_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: challenge_participants challenge_participants_challenge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_participants
    ADD CONSTRAINT challenge_participants_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.community_challenges(id) ON DELETE CASCADE;


--
-- Name: challenge_participants challenge_participants_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_participants
    ADD CONSTRAINT challenge_participants_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: church_audit_logs church_audit_logs_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.church_audit_logs
    ADD CONSTRAINT church_audit_logs_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE CASCADE;


--
-- Name: church_subscriptions church_subscriptions_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.church_subscriptions
    ADD CONSTRAINT church_subscriptions_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);


--
-- Name: communities communities_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id) ON DELETE CASCADE;


--
-- Name: communities communities_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communities
    ADD CONSTRAINT communities_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);


--
-- Name: community_challenges community_challenges_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_challenges
    ADD CONSTRAINT community_challenges_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: community_chat community_chat_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_chat
    ADD CONSTRAINT community_chat_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: community_chat community_chat_reply_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_chat
    ADD CONSTRAINT community_chat_reply_to_fkey FOREIGN KEY (reply_to) REFERENCES public.community_chat(id) ON DELETE SET NULL;


--
-- Name: community_settings community_settings_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_settings
    ADD CONSTRAINT community_settings_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: course_unlocks course_unlocks_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_unlocks
    ADD CONSTRAINT course_unlocks_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: course_unlocks course_unlocks_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_unlocks
    ADD CONSTRAINT course_unlocks_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: courses courses_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);


--
-- Name: custom_event_types custom_event_types_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_event_types
    ADD CONSTRAINT custom_event_types_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);


--
-- Name: data_export_audit data_export_audit_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_export_audit
    ADD CONSTRAINT data_export_audit_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: data_export_audit data_export_audit_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_export_audit
    ADD CONSTRAINT data_export_audit_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: devotional_content devotional_content_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devotional_content
    ADD CONSTRAINT devotional_content_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);


--
-- Name: devotional_content devotional_content_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devotional_content
    ADD CONSTRAINT devotional_content_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: devotional_content devotional_content_worship_song_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devotional_content
    ADD CONSTRAINT devotional_content_worship_song_id_fkey FOREIGN KEY (worship_song_id) REFERENCES public.worship_songs(id);


--
-- Name: devotional_progress devotional_progress_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devotional_progress
    ADD CONSTRAINT devotional_progress_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);


--
-- Name: devotional_progress devotional_progress_devotional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devotional_progress
    ADD CONSTRAINT devotional_progress_devotional_id_fkey FOREIGN KEY (devotional_id) REFERENCES public.devotional_content(id) ON DELETE CASCADE;


--
-- Name: devotional_progress devotional_progress_override_release_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devotional_progress
    ADD CONSTRAINT devotional_progress_override_release_id_fkey FOREIGN KEY (override_release_id) REFERENCES public.user_devotional_overrides(id) ON DELETE SET NULL;


--
-- Name: devotional_responses devotional_responses_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devotional_responses
    ADD CONSTRAINT devotional_responses_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: devotional_responses devotional_responses_progress_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devotional_responses
    ADD CONSTRAINT devotional_responses_progress_fkey FOREIGN KEY (user_id, devotional_id) REFERENCES public.devotional_progress(user_id, devotional_id) ON DELETE CASCADE;


--
-- Name: devotional_worship_songs devotional_worship_songs_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devotional_worship_songs
    ADD CONSTRAINT devotional_worship_songs_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: devotional_worship_songs devotional_worship_songs_devotional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devotional_worship_songs
    ADD CONSTRAINT devotional_worship_songs_devotional_id_fkey FOREIGN KEY (devotional_id) REFERENCES public.devotional_content(activity_id) ON DELETE CASCADE;


--
-- Name: devotional_worship_songs devotional_worship_songs_worship_song_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.devotional_worship_songs
    ADD CONSTRAINT devotional_worship_songs_worship_song_id_fkey FOREIGN KEY (worship_song_id) REFERENCES public.worship_songs(id) ON DELETE CASCADE;


--
-- Name: discipleship_plans discipleship_plans_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discipleship_plans
    ADD CONSTRAINT discipleship_plans_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: discipleship_plans discipleship_plans_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.discipleship_plans
    ADD CONSTRAINT discipleship_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: event_photos event_photos_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_photos
    ADD CONSTRAINT event_photos_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: event_photos event_photos_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_photos
    ADD CONSTRAINT event_photos_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: events events_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);


--
-- Name: events events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: events events_linked_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_linked_lesson_id_fkey FOREIGN KEY (linked_lesson_id) REFERENCES public.lessons(id) ON DELETE SET NULL;


--
-- Name: events events_turma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES public.turmas(id);


--
-- Name: game_config game_config_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_config
    ADD CONSTRAINT game_config_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: leader_guide leader_guide_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leader_guide
    ADD CONSTRAINT leader_guide_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: leader_guide leader_guide_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leader_guide
    ADD CONSTRAINT leader_guide_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: leader_meeting_notes leader_meeting_notes_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leader_meeting_notes
    ADD CONSTRAINT leader_meeting_notes_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: leader_meeting_notes leader_meeting_notes_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leader_meeting_notes
    ADD CONSTRAINT leader_meeting_notes_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id);


--
-- Name: lesson_content lesson_content_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_content
    ADD CONSTRAINT lesson_content_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);


--
-- Name: lesson_responses lesson_responses_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_responses
    ADD CONSTRAINT lesson_responses_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);


--
-- Name: lesson_responses lesson_responses_override_release_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_responses
    ADD CONSTRAINT lesson_responses_override_release_id_fkey FOREIGN KEY (override_release_id) REFERENCES public.user_lesson_overrides(id) ON DELETE SET NULL;


--
-- Name: lessons lessons_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);


--
-- Name: lessons lessons_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: login_audit_logs login_audit_logs_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.login_audit_logs
    ADD CONSTRAINT login_audit_logs_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);


--
-- Name: meeting_evaluations meeting_evaluations_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_evaluations
    ADD CONSTRAINT meeting_evaluations_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: meeting_evaluations meeting_evaluations_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_evaluations
    ADD CONSTRAINT meeting_evaluations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: message_reactions message_reactions_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reactions
    ADD CONSTRAINT message_reactions_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: message_reactions message_reactions_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reactions
    ADD CONSTRAINT message_reactions_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- Name: message_views message_views_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_views
    ADD CONSTRAINT message_views_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: message_views message_views_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_views
    ADD CONSTRAINT message_views_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- Name: messages messages_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);


--
-- Name: messages messages_sent_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sent_by_fkey FOREIGN KEY (sent_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: messages messages_turma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES public.turmas(id) ON DELETE SET NULL;


--
-- Name: notification_preferences notification_preferences_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: pastoral_notes pastoral_notes_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pastoral_notes
    ADD CONSTRAINT pastoral_notes_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: pastoral_notes pastoral_notes_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pastoral_notes
    ADD CONSTRAINT pastoral_notes_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: pastoral_notes pastoral_notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pastoral_notes
    ADD CONSTRAINT pastoral_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: plan_history plan_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_history
    ADD CONSTRAINT plan_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES auth.users(id);


--
-- Name: plan_history plan_history_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_history
    ADD CONSTRAINT plan_history_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE CASCADE;


--
-- Name: poll_votes poll_votes_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.poll_votes
    ADD CONSTRAINT poll_votes_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: poll_votes poll_votes_poll_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.poll_votes
    ADD CONSTRAINT poll_votes_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.polls(id) ON DELETE CASCADE;


--
-- Name: polls polls_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.polls
    ADD CONSTRAINT polls_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: prayer_diary prayer_diary_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prayer_diary
    ADD CONSTRAINT prayer_diary_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);


--
-- Name: prayer_diary prayer_diary_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prayer_diary
    ADD CONSTRAINT prayer_diary_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.prayer_requests(id) ON DELETE SET NULL;


--
-- Name: prayer_diary prayer_diary_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prayer_diary
    ADD CONSTRAINT prayer_diary_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: prayer_interactions prayer_interactions_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prayer_interactions
    ADD CONSTRAINT prayer_interactions_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);


--
-- Name: prayer_interactions prayer_interactions_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prayer_interactions
    ADD CONSTRAINT prayer_interactions_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.prayer_requests(id) ON DELETE CASCADE;


--
-- Name: prayer_interactions prayer_interactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prayer_interactions
    ADD CONSTRAINT prayer_interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: prayer_pairs prayer_pairs_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prayer_pairs
    ADD CONSTRAINT prayer_pairs_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: prayer_requests prayer_requests_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prayer_requests
    ADD CONSTRAINT prayer_requests_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: prayer_requests prayer_requests_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prayer_requests
    ADD CONSTRAINT prayer_requests_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);


--
-- Name: prayer_requests prayer_requests_turma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prayer_requests
    ADD CONSTRAINT prayer_requests_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES public.turmas(id) ON DELETE SET NULL;


--
-- Name: prayer_requests prayer_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prayer_requests
    ADD CONSTRAINT prayer_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: privacy_requests privacy_requests_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privacy_requests
    ADD CONSTRAINT privacy_requests_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: privacy_requests privacy_requests_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privacy_requests
    ADD CONSTRAINT privacy_requests_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: privacy_requests privacy_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.privacy_requests
    ADD CONSTRAINT privacy_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profession_of_faith_records profession_of_faith_records_performed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profession_of_faith_records
    ADD CONSTRAINT profession_of_faith_records_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES auth.users(id);


--
-- Name: profiles profiles_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);


--
-- Name: profiles profiles_enrollment_status_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_enrollment_status_updated_by_fkey FOREIGN KEY (enrollment_status_updated_by) REFERENCES auth.users(id);


--
-- Name: profiles profiles_turma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES public.turmas(id);


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: push_activation_reminders push_activation_reminders_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_activation_reminders
    ADD CONSTRAINT push_activation_reminders_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: push_automation_config push_automation_config_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_automation_config
    ADD CONSTRAINT push_automation_config_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: push_notification_log push_notification_log_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_notification_log
    ADD CONSTRAINT push_notification_log_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: push_scheduled push_scheduled_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_scheduled
    ADD CONSTRAINT push_scheduled_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: push_scheduled push_scheduled_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_scheduled
    ADD CONSTRAINT push_scheduled_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: push_subscriptions push_subscriptions_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: ranking_seasons ranking_seasons_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ranking_seasons
    ADD CONSTRAINT ranking_seasons_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: ranking_seasons ranking_seasons_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ranking_seasons
    ADD CONSTRAINT ranking_seasons_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: spiritual_assessments spiritual_assessments_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spiritual_assessments
    ADD CONSTRAINT spiritual_assessments_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: spiritual_assessments spiritual_assessments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.spiritual_assessments
    ADD CONSTRAINT spiritual_assessments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: stripe_webhook_logs stripe_webhook_logs_church_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stripe_webhook_logs
    ADD CONSTRAINT stripe_webhook_logs_church_subscription_id_fkey FOREIGN KEY (church_subscription_id) REFERENCES public.church_subscriptions(id);


--
-- Name: system_admin_audit_logs system_admin_audit_logs_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_admin_audit_logs
    ADD CONSTRAINT system_admin_audit_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES auth.users(id);


--
-- Name: testimonies testimonies_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonies
    ADD CONSTRAINT testimonies_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: turma_lesson_content turma_lesson_content_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.turma_lesson_content
    ADD CONSTRAINT turma_lesson_content_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: turma_lesson_content turma_lesson_content_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.turma_lesson_content
    ADD CONSTRAINT turma_lesson_content_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: turma_lesson_content turma_lesson_content_turma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.turma_lesson_content
    ADD CONSTRAINT turma_lesson_content_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES public.turmas(id) ON DELETE CASCADE;


--
-- Name: turmas turmas_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.turmas
    ADD CONSTRAINT turmas_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: user_devotional_overrides user_devotional_overrides_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_devotional_overrides
    ADD CONSTRAINT user_devotional_overrides_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: user_devotional_overrides user_devotional_overrides_devotional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_devotional_overrides
    ADD CONSTRAINT user_devotional_overrides_devotional_id_fkey FOREIGN KEY (devotional_id) REFERENCES public.devotional_content(id) ON DELETE CASCADE;


--
-- Name: user_devotional_overrides user_devotional_overrides_granted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_devotional_overrides
    ADD CONSTRAINT user_devotional_overrides_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES public.profiles(user_id) ON DELETE SET NULL;


--
-- Name: user_devotional_overrides user_devotional_overrides_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_devotional_overrides
    ADD CONSTRAINT user_devotional_overrides_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;


--
-- Name: user_lesson_overrides user_lesson_overrides_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_lesson_overrides
    ADD CONSTRAINT user_lesson_overrides_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: user_lesson_overrides user_lesson_overrides_granted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_lesson_overrides
    ADD CONSTRAINT user_lesson_overrides_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES public.profiles(user_id) ON DELETE SET NULL;


--
-- Name: user_lesson_overrides user_lesson_overrides_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_lesson_overrides
    ADD CONSTRAINT user_lesson_overrides_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: user_lesson_overrides user_lesson_overrides_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_lesson_overrides
    ADD CONSTRAINT user_lesson_overrides_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;


--
-- Name: user_progress user_progress_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id) ON DELETE CASCADE;


--
-- Name: user_progress user_progress_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);


--
-- Name: user_progress user_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: whatsapp_reminder_log whatsapp_reminder_log_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_reminder_log
    ADD CONSTRAINT whatsapp_reminder_log_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: whatsapp_reminder_log whatsapp_reminder_log_resent_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_reminder_log
    ADD CONSTRAINT whatsapp_reminder_log_resent_by_fkey FOREIGN KEY (resent_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: whatsapp_reminder_log whatsapp_reminder_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_reminder_log
    ADD CONSTRAINT whatsapp_reminder_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: worship_attendance worship_attendance_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worship_attendance
    ADD CONSTRAINT worship_attendance_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id);


--
-- Name: worship_songs worship_songs_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.worship_songs
    ADD CONSTRAINT worship_songs_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: year_promotion_requests year_promotion_requests_church_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.year_promotion_requests
    ADD CONSTRAINT year_promotion_requests_church_id_fkey FOREIGN KEY (church_id) REFERENCES public.churches(id) ON DELETE SET NULL;


--
-- Name: year_promotion_requests year_promotion_requests_turma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.year_promotion_requests
    ADD CONSTRAINT year_promotion_requests_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES public.turmas(id) ON DELETE SET NULL;


--
-- Name: activities Activities are viewable by own church or official; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Activities are viewable by own church or official" ON public.activities FOR SELECT USING (((church_id IS NULL) OR (church_id = public.get_auth_church_id()) OR public.is_super_admin()));


--
-- Name: devotional_worship_songs Admin full access for devotional_worship_songs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access for devotional_worship_songs" ON public.devotional_worship_songs USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = ANY (ARRAY['admin'::public.app_role, 'lider'::public.app_role]))))));


--
-- Name: achievement_unlocks Admins and leaders can delete achievement unlocks in area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins and leaders can delete achievement unlocks in area" ON public.achievement_unlocks FOR DELETE TO authenticated USING (((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role)) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = achievement_unlocks.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: attendance Admins and leaders can delete attendance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins and leaders can delete attendance" ON public.attendance FOR DELETE TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role)));


--
-- Name: devotional_progress Admins and leaders can delete devotional progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins and leaders can delete devotional progress" ON public.devotional_progress FOR DELETE TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role)));


--
-- Name: lesson_responses Admins and leaders can delete lesson responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins and leaders can delete lesson responses" ON public.lesson_responses FOR DELETE TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role)));


--
-- Name: user_progress Admins and leaders can delete user progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins and leaders can delete user progress" ON public.user_progress FOR DELETE TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role)));


--
-- Name: worship_attendance Admins and leaders can delete worship attendance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins and leaders can delete worship attendance" ON public.worship_attendance FOR DELETE TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role)));


--
-- Name: worship_attendance Admins and leaders can delete worship attendance in area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins and leaders can delete worship attendance in area" ON public.worship_attendance FOR DELETE TO authenticated USING (((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role)) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = worship_attendance.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: achievement_unlocks Admins and leaders can insert achievement unlocks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins and leaders can insert achievement unlocks" ON public.achievement_unlocks FOR INSERT TO authenticated WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role)));


--
-- Name: attendance Admins and leaders can manage attendance in their area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins and leaders can manage attendance in their area" ON public.attendance TO authenticated USING (((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role)) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = attendance.user_id) AND (p.area = public.get_my_area()))))))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role)));


--
-- Name: event_photos Admins and leaders can update photos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins and leaders can update photos" ON public.event_photos FOR UPDATE TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role)));


--
-- Name: push_automation_config Admins and lideres can edit push_automation_config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins and lideres can edit push_automation_config" ON public.push_automation_config TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role)));


--
-- Name: event_photos Admins can delete any photo; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete any photo" ON public.event_photos FOR DELETE TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role)));


--
-- Name: community_chat Admins can delete chat messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete chat messages" ON public.community_chat FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: devotional_progress Admins can delete devotional progress in area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete devotional progress in area" ON public.devotional_progress FOR DELETE TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = devotional_progress.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: lesson_responses Admins can delete lesson responses in area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete lesson responses in area" ON public.lesson_responses FOR DELETE TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = lesson_responses.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: testimonies Admins can delete testimonies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete testimonies" ON public.testimonies FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_progress Admins can delete user progress in their area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete user progress in their area" ON public.user_progress FOR DELETE TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = user_progress.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: push_activation_reminders Admins can insert reminders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert reminders" ON public.push_activation_reminders FOR INSERT TO authenticated WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role)));


--
-- Name: whatsapp_reminder_log Admins can insert whatsapp reminder log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert whatsapp reminder log" ON public.whatsapp_reminder_log FOR INSERT TO authenticated WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role) OR public.is_super_admin(auth.uid())));


--
-- Name: achievement_definitions Admins can manage achievement definitions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage achievement definitions" ON public.achievement_definitions TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: activities Admins can manage activities for their church; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage activities for their church" ON public.activities USING ((public.is_super_admin() OR ((church_id = public.get_auth_church_id()) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid())) = ANY (ARRAY['admin'::public.app_role, 'lider'::public.app_role])))));


--
-- Name: area_pastors Admins can manage area pastors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage area pastors" ON public.area_pastors USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: community_challenges Admins can manage challenges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage challenges" ON public.community_challenges USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: course_unlocks Admins can manage course unlocks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage course unlocks" ON public.course_unlocks USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: courses Admins can manage courses for their church; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage courses for their church" ON public.courses USING ((public.is_super_admin() OR ((church_id = public.get_auth_church_id()) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid())) = ANY (ARRAY['admin'::public.app_role, 'lider'::public.app_role])))));


--
-- Name: custom_event_types Admins can manage custom event types; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage custom event types" ON public.custom_event_types TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: devotional_content Admins can manage devotional content for their church; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage devotional content for their church" ON public.devotional_content USING ((public.is_super_admin() OR ((church_id = public.get_auth_church_id()) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid())) = ANY (ARRAY['admin'::public.app_role, 'lider'::public.app_role])))));


--
-- Name: user_devotional_overrides Admins can manage devotional overrides in area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage devotional overrides in area" ON public.user_devotional_overrides TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = user_devotional_overrides.user_id) AND (p.area = public.get_my_area()))))))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = user_devotional_overrides.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: meeting_evaluations Admins can manage evaluations in their area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage evaluations in their area" ON public.meeting_evaluations USING ((public.has_role(auth.uid(), 'admin'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = meeting_evaluations.user_id) AND (p.area = public.get_my_area()))))))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = meeting_evaluations.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: events Admins can manage events for their church; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage events for their church" ON public.events USING ((public.is_super_admin() OR ((church_id = public.get_auth_church_id()) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid())) = ANY (ARRAY['admin'::public.app_role, 'lider'::public.app_role])))));


--
-- Name: game_config Admins can manage game config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage game config" ON public.game_config TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: leader_guide Admins can manage leader guide; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage leader guide" ON public.leader_guide TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: lesson_content Admins can manage lesson content for their church; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage lesson content for their church" ON public.lesson_content USING ((public.is_super_admin() OR ((church_id = public.get_auth_church_id()) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid())) = ANY (ARRAY['admin'::public.app_role, 'lider'::public.app_role])))));


--
-- Name: user_lesson_overrides Admins can manage lesson overrides in area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage lesson overrides in area" ON public.user_lesson_overrides TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = user_lesson_overrides.user_id) AND (p.area = public.get_my_area()))))))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = user_lesson_overrides.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: lessons Admins can manage lessons for their church; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage lessons for their church" ON public.lessons USING ((public.is_super_admin() OR ((church_id = public.get_auth_church_id()) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid())) = ANY (ARRAY['admin'::public.app_role, 'lider'::public.app_role])))));


--
-- Name: prayer_pairs Admins can manage pairs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage pairs" ON public.prayer_pairs TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: polls Admins can manage polls; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage polls" ON public.polls TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: year_promotion_requests Admins can manage promotion requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage promotion requests" ON public.year_promotion_requests TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: push_notification_log Admins can manage push logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage push logs" ON public.push_notification_log TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: ranking_seasons Admins can manage ranking seasons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage ranking seasons" ON public.ranking_seasons USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: activity_removal_log Admins can manage removal logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage removal logs" ON public.activity_removal_log TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles Admins can manage their church users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage their church users" ON public.profiles FOR UPDATE USING ((church_id IN ( SELECT profiles_1.church_id
   FROM public.profiles profiles_1
  WHERE ((profiles_1.user_id = auth.uid()) AND (profiles_1.role = 'admin'::public.app_role)))));


--
-- Name: turmas Admins can manage turmas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage turmas" ON public.turmas USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: whatsapp_reminder_config Admins can manage whatsapp reminder config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage whatsapp reminder config" ON public.whatsapp_reminder_config TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_super_admin(auth.uid()))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.is_super_admin(auth.uid())));


--
-- Name: worship_songs Admins can manage worship songs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage worship songs" ON public.worship_songs USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.role = 'admin'::public.app_role)))));


--
-- Name: profiles Admins can update profiles in their area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update profiles in their area" ON public.profiles FOR UPDATE USING ((public.has_role(auth.uid(), 'admin'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (area = public.get_my_area())))) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: churches Admins can update their own church branding; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update their own church branding" ON public.churches FOR UPDATE USING ((id IN ( SELECT profiles.church_id
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::public.app_role)))));


--
-- Name: whatsapp_reminder_log Admins can update whatsapp reminder log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update whatsapp reminder log" ON public.whatsapp_reminder_log FOR UPDATE TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role) OR public.is_super_admin(auth.uid()))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role) OR public.is_super_admin(auth.uid())));


--
-- Name: worship_attendance Admins can update worship attendance in area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update worship attendance in area" ON public.worship_attendance FOR UPDATE USING ((public.has_role(auth.uid(), 'admin'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = worship_attendance.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: achievement_unlocks Admins can view all achievement unlocks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all achievement unlocks" ON public.achievement_unlocks FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: devotional_progress Admins can view all devotional progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all devotional progress" ON public.devotional_progress FOR SELECT USING ((public.has_role(auth.uid(), 'admin'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = devotional_progress.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: leader_meeting_notes Admins can view all leader notes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all leader notes" ON public.leader_meeting_notes FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: login_audit_logs Admins can view all login logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all login logs" ON public.login_audit_logs FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = ANY (ARRAY['admin'::public.app_role, 'super_admin'::public.app_role]))))));


--
-- Name: message_views Admins can view all message views; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all message views" ON public.message_views FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role)));


--
-- Name: push_subscriptions Admins can view all push subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all push subscriptions" ON public.push_subscriptions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: push_activation_reminders Admins can view all reminders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all reminders" ON public.push_activation_reminders FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role)));


--
-- Name: user_progress Admins can view area participants progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view area participants progress" ON public.user_progress FOR SELECT USING ((public.has_role(auth.uid(), 'admin'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = user_progress.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: devotional_responses Admins can view devotional responses in their area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view devotional responses in their area" ON public.devotional_responses FOR SELECT USING ((public.has_role(auth.uid(), 'admin'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = devotional_responses.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: lesson_responses Admins can view lesson responses in their area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view lesson responses in their area" ON public.lesson_responses FOR SELECT USING ((public.has_role(auth.uid(), 'admin'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = lesson_responses.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: profiles Admins can view profiles in their area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view profiles in their area" ON public.profiles FOR SELECT USING (((auth.uid() = user_id) OR (public.has_role(auth.uid(), 'admin'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (area = public.get_my_area())))));


--
-- Name: profession_of_faith_records Admins can view their church profession history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view their church profession history" ON public.profession_of_faith_records FOR SELECT USING ((church_id IN ( SELECT profiles.church_id
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.role = 'admin'::public.app_role)))));


--
-- Name: church_subscriptions Admins can view their church subscription; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view their church subscription" ON public.church_subscriptions FOR SELECT USING (((church_id = public.get_auth_church_id()) OR public.is_authorized_system_admin()));


--
-- Name: church_audit_logs Admins can view their own church audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view their own church audit logs" ON public.church_audit_logs FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role) AND (user_roles.church_id = church_audit_logs.church_id)))));


--
-- Name: worship_attendance Admins can view worship attendance in area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view worship attendance in area" ON public.worship_attendance FOR SELECT USING ((public.has_role(auth.uid(), 'admin'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = worship_attendance.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: church_subscriptions Anyone can insert church subscriptions during onboarding; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert church subscriptions during onboarding" ON public.church_subscriptions FOR INSERT TO authenticated, anon WITH CHECK (true);


--
-- Name: login_audit_logs Anyone can insert login logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert login logs" ON public.login_audit_logs FOR INSERT WITH CHECK (true);


--
-- Name: achievement_definitions Anyone can read achievement definitions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read achievement definitions" ON public.achievement_definitions FOR SELECT TO authenticated USING (true);


--
-- Name: areas Areas are viewable by church; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Areas are viewable by church" ON public.areas FOR SELECT USING ((church_id = public.get_my_church_id()));


--
-- Name: whatsapp_reminder_config Authenticated can read whatsapp reminder config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated can read whatsapp reminder config" ON public.whatsapp_reminder_config FOR SELECT TO authenticated USING (true);


--
-- Name: game_config Authenticated users can read game config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read game config" ON public.game_config FOR SELECT TO authenticated USING (true);


--
-- Name: push_automation_config Authenticated users can read push_automation_config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read push_automation_config" ON public.push_automation_config FOR SELECT TO authenticated USING (true);


--
-- Name: area_pastors Authenticated users can view area pastors; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view area pastors" ON public.area_pastors FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: community_challenges Authenticated users can view challenges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view challenges" ON public.community_challenges FOR SELECT USING (true);


--
-- Name: course_unlocks Authenticated users can view course unlocks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view course unlocks" ON public.course_unlocks FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: custom_event_types Authenticated users can view custom event types; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view custom event types" ON public.custom_event_types FOR SELECT TO authenticated USING (true);


--
-- Name: devotional_content Authenticated users can view devotional content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view devotional content" ON public.devotional_content FOR SELECT TO authenticated USING ((auth.uid() IS NOT NULL));


--
-- Name: leader_guide Authenticated users can view leader guide; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view leader guide" ON public.leader_guide FOR SELECT TO authenticated USING ((auth.uid() IS NOT NULL));


--
-- Name: turmas Authenticated users can view turmas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view turmas" ON public.turmas FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: authorized_system_admins Authorized system admins managed by super admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authorized system admins managed by super admins" ON public.authorized_system_admins USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));


--
-- Name: authorized_system_admins Authorized system admins visible to super admins; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authorized system admins visible to super admins" ON public.authorized_system_admins FOR SELECT USING (public.is_super_admin(auth.uid()));


--
-- Name: church_audit_logs Church admins can view their own church audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Church admins can view their own church audit logs" ON public.church_audit_logs FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.user_id = auth.uid()) AND (profiles.church_id = church_audit_logs.church_id) AND (profiles.role = 'admin'::public.app_role)))) OR (EXISTS ( SELECT 1
   FROM public.authorized_system_admins
  WHERE (authorized_system_admins.email = (( SELECT users.email
           FROM auth.users
          WHERE (users.id = auth.uid())))::text)))));


--
-- Name: churches Churches are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Churches are viewable by everyone" ON public.churches FOR SELECT USING ((is_active = true));


--
-- Name: communities Communities are viewable by church; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Communities are viewable by church" ON public.communities FOR SELECT USING ((church_id = public.get_my_church_id()));


--
-- Name: courses Courses are viewable by own church or official; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Courses are viewable by own church or official" ON public.courses FOR SELECT USING (((church_id IS NULL) OR (church_id = public.get_auth_church_id()) OR public.is_super_admin()));


--
-- Name: devotional_content Devotional content is viewable by own church or official; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Devotional content is viewable by own church or official" ON public.devotional_content FOR SELECT USING (((church_id IS NULL) OR (church_id = public.get_auth_church_id()) OR public.is_super_admin()));


--
-- Name: events Events are viewable by own church; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Events are viewable by own church" ON public.events FOR SELECT USING (((church_id = public.get_auth_church_id()) OR public.is_super_admin()));


--
-- Name: achievement_definitions Global or tenant content select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global or tenant content select" ON public.achievement_definitions FOR SELECT USING (((church_id IS NULL) OR public.is_super_admin(auth.uid()) OR (church_id = public.get_auth_church_id())));


--
-- Name: activities Global or tenant content select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global or tenant content select" ON public.activities FOR SELECT USING (((church_id IS NULL) OR public.is_super_admin(auth.uid()) OR (church_id = public.get_auth_church_id())));


--
-- Name: courses Global or tenant content select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global or tenant content select" ON public.courses FOR SELECT USING (((church_id IS NULL) OR public.is_super_admin(auth.uid()) OR (church_id = public.get_auth_church_id())));


--
-- Name: devotional_content Global or tenant content select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global or tenant content select" ON public.devotional_content FOR SELECT USING (((church_id IS NULL) OR public.is_super_admin(auth.uid()) OR (church_id = public.get_auth_church_id())));


--
-- Name: game_config Global or tenant content select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global or tenant content select" ON public.game_config FOR SELECT USING (((church_id IS NULL) OR public.is_super_admin(auth.uid()) OR (church_id = public.get_auth_church_id())));


--
-- Name: leader_guide Global or tenant content select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global or tenant content select" ON public.leader_guide FOR SELECT USING (((church_id IS NULL) OR public.is_super_admin(auth.uid()) OR (church_id = public.get_auth_church_id())));


--
-- Name: lesson_content Global or tenant content select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global or tenant content select" ON public.lesson_content FOR SELECT USING (((church_id IS NULL) OR public.is_super_admin(auth.uid()) OR (church_id = public.get_auth_church_id())));


--
-- Name: lessons Global or tenant content select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Global or tenant content select" ON public.lessons FOR SELECT USING (((church_id IS NULL) OR public.is_super_admin(auth.uid()) OR (church_id = public.get_auth_church_id())));


--
-- Name: devotional_content Leaders can manage devotional content in their area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Leaders can manage devotional content in their area" ON public.devotional_content TO authenticated USING (public.has_role(auth.uid(), 'lider'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'lider'::public.app_role));


--
-- Name: user_devotional_overrides Leaders can manage devotional overrides in area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Leaders can manage devotional overrides in area" ON public.user_devotional_overrides TO authenticated USING ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = user_devotional_overrides.user_id) AND (p.area = public.get_my_area()))))))) WITH CHECK ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = user_devotional_overrides.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: events Leaders can manage events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Leaders can manage events" ON public.events TO authenticated USING (public.has_role(auth.uid(), 'lider'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'lider'::public.app_role));


--
-- Name: lesson_content Leaders can manage lesson content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Leaders can manage lesson content" ON public.lesson_content TO authenticated USING (public.has_role(auth.uid(), 'lider'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'lider'::public.app_role));


--
-- Name: user_lesson_overrides Leaders can manage lesson overrides in area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Leaders can manage lesson overrides in area" ON public.user_lesson_overrides TO authenticated USING ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = user_lesson_overrides.user_id) AND (p.area = public.get_my_area()))))))) WITH CHECK ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = user_lesson_overrides.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: prayer_pairs Leaders can manage pairs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Leaders can manage pairs" ON public.prayer_pairs TO authenticated USING (public.has_role(auth.uid(), 'lider'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'lider'::public.app_role));


--
-- Name: polls Leaders can manage polls; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Leaders can manage polls" ON public.polls TO authenticated USING (public.has_role(auth.uid(), 'lider'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'lider'::public.app_role));


--
-- Name: leader_meeting_notes Leaders can update shared notes in their church and area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Leaders can update shared notes in their church and area" ON public.leader_meeting_notes FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND ((p.role = 'lider'::public.app_role) OR (p.role = 'admin'::public.app_role)) AND (p.church_id = leader_meeting_notes.church_id) AND (p.area = leader_meeting_notes.area)))));


--
-- Name: leader_meeting_notes Leaders can upsert shared notes in their church and area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Leaders can upsert shared notes in their church and area" ON public.leader_meeting_notes FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND ((p.role = 'lider'::public.app_role) OR (p.role = 'admin'::public.app_role)) AND (p.church_id = p.church_id) AND (p.area = p.area)))));


--
-- Name: push_notification_log Leaders can view push logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Leaders can view push logs" ON public.push_notification_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'lider'::public.app_role));


--
-- Name: push_subscriptions Leaders can view push subscriptions in area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Leaders can view push subscriptions in area" ON public.push_subscriptions FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = push_subscriptions.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: leader_meeting_notes Leaders can view shared notes in their church and area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Leaders can view shared notes in their church and area" ON public.leader_meeting_notes FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND ((p.role = 'lider'::public.app_role) OR (p.role = 'admin'::public.app_role)) AND (p.church_id = leader_meeting_notes.church_id) AND (p.area = leader_meeting_notes.area)))));


--
-- Name: lesson_content Lesson content is viewable by own church or official; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Lesson content is viewable by own church or official" ON public.lesson_content FOR SELECT USING (((church_id IS NULL) OR (church_id = public.get_auth_church_id()) OR public.is_super_admin()));


--
-- Name: lessons Lessons are viewable by own church or official; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Lessons are viewable by own church or official" ON public.lessons FOR SELECT USING (((church_id IS NULL) OR (church_id = public.get_auth_church_id()) OR public.is_super_admin()));


--
-- Name: community_chat Liders can delete chat messages in their area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Liders can delete chat messages in their area" ON public.community_chat FOR DELETE USING ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (community = (public.get_my_community())::text)));


--
-- Name: devotional_progress Liders can delete devotional progress in area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Liders can delete devotional progress in area" ON public.devotional_progress FOR DELETE TO authenticated USING ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = devotional_progress.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: lesson_responses Liders can delete lesson responses in area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Liders can delete lesson responses in area" ON public.lesson_responses FOR DELETE TO authenticated USING ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = lesson_responses.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: user_progress Liders can delete user progress in their area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Liders can delete user progress in their area" ON public.user_progress FOR DELETE TO authenticated USING ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = user_progress.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: worship_attendance Liders can delete worship attendance in area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Liders can delete worship attendance in area" ON public.worship_attendance FOR DELETE USING ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = worship_attendance.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: activity_removal_log Liders can insert removal logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Liders can insert removal logs" ON public.activity_removal_log FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'lider'::public.app_role));


--
-- Name: attendance Liders can manage attendance in their area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Liders can manage attendance in their area" ON public.attendance USING ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = attendance.user_id) AND (p.area = public.get_my_area()))))))) WITH CHECK (public.has_role(auth.uid(), 'lider'::public.app_role));


--
-- Name: course_unlocks Liders can manage course unlocks in their area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Liders can manage course unlocks in their area" ON public.course_unlocks USING ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (area = (public.get_my_area())::text))) WITH CHECK ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (area = (public.get_my_area())::text)));


--
-- Name: custom_event_types Liders can manage custom event types in area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Liders can manage custom event types in area" ON public.custom_event_types TO authenticated USING ((public.has_role(auth.uid(), 'lider'::public.app_role) AND ((area IS NULL) OR (area = (public.get_my_area())::text)))) WITH CHECK ((public.has_role(auth.uid(), 'lider'::public.app_role) AND ((area IS NULL) OR (area = (public.get_my_area())::text))));


--
-- Name: meeting_evaluations Liders can manage evaluations in their area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Liders can manage evaluations in their area" ON public.meeting_evaluations USING ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = meeting_evaluations.user_id) AND (p.area = public.get_my_area()))))))) WITH CHECK ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = meeting_evaluations.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: pastoral_notes Liders can manage pastoral notes in their area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Liders can manage pastoral notes in their area" ON public.pastoral_notes USING ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = pastoral_notes.user_id) AND (p.area = public.get_my_area()))))))) WITH CHECK ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = pastoral_notes.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: discipleship_plans Liders can manage plans in their area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Liders can manage plans in their area" ON public.discipleship_plans USING ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = discipleship_plans.user_id) AND (p.area = public.get_my_area()))))))) WITH CHECK ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = discipleship_plans.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: year_promotion_requests Liders can manage promotion requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Liders can manage promotion requests" ON public.year_promotion_requests TO authenticated USING (public.has_role(auth.uid(), 'lider'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'lider'::public.app_role));


--
-- Name: profiles Liders can update profiles in their area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Liders can update profiles in their area" ON public.profiles FOR UPDATE USING ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (area = public.get_my_area())))) WITH CHECK (public.has_role(auth.uid(), 'lider'::public.app_role));


--
-- Name: worship_attendance Liders can update worship attendance in area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Liders can update worship attendance in area" ON public.worship_attendance FOR UPDATE USING ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = worship_attendance.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: achievement_unlocks Liders can view achievement unlocks in their area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Liders can view achievement unlocks in their area" ON public.achievement_unlocks FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = achievement_unlocks.user_id) AND (p.area = public.get_my_area()))))));


--
-- Name: devotional_progress Liders can view all devotional progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Liders can view all devotional progress" ON public.devotional_progress FOR SELECT USING ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = devotional_progress.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: user_roles Liders can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Liders can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'lider'::public.app_role));


--
-- Name: user_progress Liders can view area participants progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Liders can view area participants progress" ON public.user_progress FOR SELECT USING ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = user_progress.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: spiritual_assessments Liders can view assessments in their area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Liders can view assessments in their area" ON public.spiritual_assessments FOR SELECT USING ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = spiritual_assessments.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: devotional_progress Liders can view devotional progress in their area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Liders can view devotional progress in their area" ON public.devotional_progress FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = devotional_progress.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: lesson_responses Liders can view lesson responses in their area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Liders can view lesson responses in their area" ON public.lesson_responses FOR SELECT TO authenticated USING ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = lesson_responses.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: profiles Liders can view profiles in their area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Liders can view profiles in their area" ON public.profiles FOR SELECT USING ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (area = public.get_my_area()))));


--
-- Name: activity_removal_log Liders can view removal logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Liders can view removal logs" ON public.activity_removal_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'lider'::public.app_role));


--
-- Name: worship_attendance Liders can view worship attendance in area; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Liders can view worship attendance in area" ON public.worship_attendance FOR SELECT USING ((public.has_role(auth.uid(), 'lider'::public.app_role) AND (public.is_super_admin(auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = worship_attendance.user_id) AND (p.area = public.get_my_area())))))));


--
-- Name: achievement_unlocks Own or tenant manager select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager select" ON public.achievement_unlocks FOR SELECT USING (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: attendance Own or tenant manager select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager select" ON public.attendance FOR SELECT USING (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: challenge_participants Own or tenant manager select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager select" ON public.challenge_participants FOR SELECT USING (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: community_chat Own or tenant manager select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager select" ON public.community_chat FOR SELECT USING (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: devotional_progress Own or tenant manager select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager select" ON public.devotional_progress FOR SELECT USING (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: devotional_responses Own or tenant manager select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager select" ON public.devotional_responses FOR SELECT USING (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: discipleship_plans Own or tenant manager select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager select" ON public.discipleship_plans FOR SELECT USING (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: lesson_responses Own or tenant manager select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager select" ON public.lesson_responses FOR SELECT USING (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: meeting_evaluations Own or tenant manager select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager select" ON public.meeting_evaluations FOR SELECT USING (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: notification_preferences Own or tenant manager select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager select" ON public.notification_preferences FOR SELECT USING (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: pastoral_notes Own or tenant manager select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager select" ON public.pastoral_notes FOR SELECT USING (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: poll_votes Own or tenant manager select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager select" ON public.poll_votes FOR SELECT USING (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: prayer_requests Own or tenant manager select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager select" ON public.prayer_requests FOR SELECT USING (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: spiritual_assessments Own or tenant manager select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager select" ON public.spiritual_assessments FOR SELECT USING (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: testimonies Own or tenant manager select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager select" ON public.testimonies FOR SELECT USING (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: user_devotional_overrides Own or tenant manager select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager select" ON public.user_devotional_overrides FOR SELECT USING (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: user_lesson_overrides Own or tenant manager select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager select" ON public.user_lesson_overrides FOR SELECT USING (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: user_progress Own or tenant manager select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager select" ON public.user_progress FOR SELECT USING (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: worship_attendance Own or tenant manager select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager select" ON public.worship_attendance FOR SELECT USING (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: year_promotion_requests Own or tenant manager select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager select" ON public.year_promotion_requests FOR SELECT USING (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: achievement_unlocks Own or tenant manager write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager write" ON public.achievement_unlocks USING (((user_id = auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: attendance Own or tenant manager write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager write" ON public.attendance USING (((user_id = auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: challenge_participants Own or tenant manager write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager write" ON public.challenge_participants USING (((user_id = auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: community_chat Own or tenant manager write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager write" ON public.community_chat USING (((user_id = auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: devotional_progress Own or tenant manager write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager write" ON public.devotional_progress USING (((user_id = auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: devotional_responses Own or tenant manager write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager write" ON public.devotional_responses USING (((user_id = auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: discipleship_plans Own or tenant manager write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager write" ON public.discipleship_plans USING (((user_id = auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: lesson_responses Own or tenant manager write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager write" ON public.lesson_responses USING (((user_id = auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: meeting_evaluations Own or tenant manager write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager write" ON public.meeting_evaluations USING (((user_id = auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: notification_preferences Own or tenant manager write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager write" ON public.notification_preferences USING (((user_id = auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: pastoral_notes Own or tenant manager write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager write" ON public.pastoral_notes USING (((user_id = auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: poll_votes Own or tenant manager write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager write" ON public.poll_votes USING (((user_id = auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: prayer_requests Own or tenant manager write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager write" ON public.prayer_requests USING (((user_id = auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: spiritual_assessments Own or tenant manager write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager write" ON public.spiritual_assessments USING (((user_id = auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: testimonies Own or tenant manager write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager write" ON public.testimonies USING (((user_id = auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: user_devotional_overrides Own or tenant manager write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager write" ON public.user_devotional_overrides USING (((user_id = auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: user_lesson_overrides Own or tenant manager write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager write" ON public.user_lesson_overrides USING (((user_id = auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: user_progress Own or tenant manager write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager write" ON public.user_progress USING (((user_id = auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: worship_attendance Own or tenant manager write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager write" ON public.worship_attendance USING (((user_id = auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: year_promotion_requests Own or tenant manager write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own or tenant manager write" ON public.year_promotion_requests USING (((user_id = auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK (((user_id = auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: achievement_unlocks Own rows manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows manage" ON public.achievement_unlocks USING ((user_id = auth.uid())) WITH CHECK (((user_id = auth.uid()) AND (church_id = public.get_auth_church_id())));


--
-- Name: attendance Own rows manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows manage" ON public.attendance USING ((user_id = auth.uid())) WITH CHECK (((user_id = auth.uid()) AND (church_id = public.get_auth_church_id())));


--
-- Name: challenge_participants Own rows manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows manage" ON public.challenge_participants USING ((user_id = auth.uid())) WITH CHECK (((user_id = auth.uid()) AND (church_id = public.get_auth_church_id())));


--
-- Name: community_chat Own rows manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows manage" ON public.community_chat USING ((user_id = auth.uid())) WITH CHECK (((user_id = auth.uid()) AND (church_id = public.get_auth_church_id())));


--
-- Name: devotional_progress Own rows manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows manage" ON public.devotional_progress USING ((user_id = auth.uid())) WITH CHECK (((user_id = auth.uid()) AND (church_id = public.get_auth_church_id())));


--
-- Name: devotional_responses Own rows manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows manage" ON public.devotional_responses USING ((user_id = auth.uid())) WITH CHECK (((user_id = auth.uid()) AND (church_id = public.get_auth_church_id())));


--
-- Name: discipleship_plans Own rows manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows manage" ON public.discipleship_plans USING ((user_id = auth.uid())) WITH CHECK (((user_id = auth.uid()) AND (church_id = public.get_auth_church_id())));


--
-- Name: lesson_responses Own rows manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows manage" ON public.lesson_responses USING ((user_id = auth.uid())) WITH CHECK (((user_id = auth.uid()) AND (church_id = public.get_auth_church_id())));


--
-- Name: meeting_evaluations Own rows manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows manage" ON public.meeting_evaluations USING ((user_id = auth.uid())) WITH CHECK (((user_id = auth.uid()) AND (church_id = public.get_auth_church_id())));


--
-- Name: notification_preferences Own rows manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows manage" ON public.notification_preferences USING ((user_id = auth.uid())) WITH CHECK (((user_id = auth.uid()) AND (church_id = public.get_auth_church_id())));


--
-- Name: pastoral_notes Own rows manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows manage" ON public.pastoral_notes USING ((user_id = auth.uid())) WITH CHECK (((user_id = auth.uid()) AND (church_id = public.get_auth_church_id())));


--
-- Name: poll_votes Own rows manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows manage" ON public.poll_votes USING ((user_id = auth.uid())) WITH CHECK (((user_id = auth.uid()) AND (church_id = public.get_auth_church_id())));


--
-- Name: prayer_requests Own rows manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows manage" ON public.prayer_requests USING ((user_id = auth.uid())) WITH CHECK (((user_id = auth.uid()) AND (church_id = public.get_auth_church_id())));


--
-- Name: push_subscriptions Own rows manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows manage" ON public.push_subscriptions USING ((user_id = auth.uid())) WITH CHECK (((user_id = auth.uid()) AND (church_id = public.get_auth_church_id())));


--
-- Name: spiritual_assessments Own rows manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows manage" ON public.spiritual_assessments USING ((user_id = auth.uid())) WITH CHECK (((user_id = auth.uid()) AND (church_id = public.get_auth_church_id())));


--
-- Name: testimonies Own rows manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows manage" ON public.testimonies USING ((user_id = auth.uid())) WITH CHECK (((user_id = auth.uid()) AND (church_id = public.get_auth_church_id())));


--
-- Name: user_devotional_overrides Own rows manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows manage" ON public.user_devotional_overrides USING ((user_id = auth.uid())) WITH CHECK (((user_id = auth.uid()) AND (church_id = public.get_auth_church_id())));


--
-- Name: user_lesson_overrides Own rows manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows manage" ON public.user_lesson_overrides USING ((user_id = auth.uid())) WITH CHECK (((user_id = auth.uid()) AND (church_id = public.get_auth_church_id())));


--
-- Name: user_progress Own rows manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows manage" ON public.user_progress USING ((user_id = auth.uid())) WITH CHECK (((user_id = auth.uid()) AND (church_id = public.get_auth_church_id())));


--
-- Name: worship_attendance Own rows manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows manage" ON public.worship_attendance USING ((user_id = auth.uid())) WITH CHECK (((user_id = auth.uid()) AND (church_id = public.get_auth_church_id())));


--
-- Name: year_promotion_requests Own rows manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows manage" ON public.year_promotion_requests USING ((user_id = auth.uid())) WITH CHECK (((user_id = auth.uid()) AND (church_id = public.get_auth_church_id())));


--
-- Name: achievement_unlocks Own rows select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows select" ON public.achievement_unlocks FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: attendance Own rows select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows select" ON public.attendance FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: challenge_participants Own rows select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows select" ON public.challenge_participants FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: community_chat Own rows select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows select" ON public.community_chat FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: devotional_progress Own rows select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows select" ON public.devotional_progress FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: devotional_responses Own rows select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows select" ON public.devotional_responses FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: discipleship_plans Own rows select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows select" ON public.discipleship_plans FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: lesson_responses Own rows select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows select" ON public.lesson_responses FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: meeting_evaluations Own rows select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows select" ON public.meeting_evaluations FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: notification_preferences Own rows select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows select" ON public.notification_preferences FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: pastoral_notes Own rows select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows select" ON public.pastoral_notes FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: poll_votes Own rows select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows select" ON public.poll_votes FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: prayer_requests Own rows select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows select" ON public.prayer_requests FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: push_subscriptions Own rows select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows select" ON public.push_subscriptions FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: spiritual_assessments Own rows select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows select" ON public.spiritual_assessments FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: testimonies Own rows select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows select" ON public.testimonies FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: user_devotional_overrides Own rows select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows select" ON public.user_devotional_overrides FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: user_lesson_overrides Own rows select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows select" ON public.user_lesson_overrides FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: user_progress Own rows select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows select" ON public.user_progress FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: worship_attendance Own rows select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows select" ON public.worship_attendance FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: year_promotion_requests Own rows select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own rows select" ON public.year_promotion_requests FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: profiles Profiles are viewable by same church members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profiles are viewable by same church members" ON public.profiles FOR SELECT USING ((church_id = public.get_my_church_id()));


--
-- Name: profiles Profiles own insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profiles own insert" ON public.profiles FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: profiles Profiles own update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profiles own update" ON public.profiles FOR UPDATE USING ((user_id = auth.uid())) WITH CHECK (((user_id = auth.uid()) AND (church_id = public.get_auth_church_id())));


--
-- Name: profiles Profiles tenant manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profiles tenant manage" ON public.profiles USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: profiles Profiles tenant select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Profiles tenant select" ON public.profiles FOR SELECT USING (((user_id = auth.uid()) OR public.is_super_admin(auth.uid()) OR (church_id = public.get_auth_church_id())));


--
-- Name: devotional_worship_songs Public read access for devotional_worship_songs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read access for devotional_worship_songs" ON public.devotional_worship_songs FOR SELECT USING (true);


--
-- Name: user_roles Roles tenant manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Roles tenant manage" ON public.user_roles USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: user_roles Roles tenant select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Roles tenant select" ON public.user_roles FOR SELECT USING (((user_id = auth.uid()) OR public.is_super_admin(auth.uid()) OR public.can_manage_church(church_id)));


--
-- Name: system_admin_audit_logs Root admin can view system audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Root admin can view system audit logs" ON public.system_admin_audit_logs FOR SELECT USING (((auth.uid() IN ( SELECT users.id
   FROM auth.users
  WHERE (lower((users.email)::text) = 'laurindosilveira@gmail.com'::text))) AND ((auth.jwt() ->> 'aal'::text) = 'aal2'::text)));


--
-- Name: church_subscriptions Super admins can manage church subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can manage church subscriptions" ON public.church_subscriptions TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));


--
-- Name: stripe_webhook_logs Super admins can view webhook logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can view webhook logs" ON public.stripe_webhook_logs FOR SELECT USING (public.is_authorized_system_admin());


--
-- Name: privacy_requests System admins can update privacy requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System admins can update privacy requests" ON public.privacy_requests FOR UPDATE TO authenticated USING (public.is_authorized_system_admin()) WITH CHECK (public.is_authorized_system_admin());


--
-- Name: church_audit_logs System admins can view all audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System admins can view all audit logs" ON public.church_audit_logs FOR SELECT USING (public.is_authorized_system_admin_v2());


--
-- Name: frontend_error_logs System admins can view all error logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System admins can view all error logs" ON public.frontend_error_logs FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.authorized_system_admins
  WHERE (authorized_system_admins.email = (( SELECT users.email
           FROM auth.users
          WHERE (users.id = auth.uid())))::text))));


--
-- Name: plan_history System admins can view all plan history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System admins can view all plan history" ON public.plan_history FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: blocked_registration_attempts System admins can view blocked registration logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System admins can view blocked registration logs" ON public.blocked_registration_attempts FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.authorized_system_admins
  WHERE (authorized_system_admins.email = (( SELECT users.email
           FROM auth.users
          WHERE (users.id = auth.uid())))::text))));


--
-- Name: achievement_unlocks Tenant admin manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admin manage" ON public.achievement_unlocks USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: attendance Tenant admin manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admin manage" ON public.attendance USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: challenge_participants Tenant admin manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admin manage" ON public.challenge_participants USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: community_chat Tenant admin manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admin manage" ON public.community_chat USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: devotional_progress Tenant admin manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admin manage" ON public.devotional_progress USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: devotional_responses Tenant admin manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admin manage" ON public.devotional_responses USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: discipleship_plans Tenant admin manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admin manage" ON public.discipleship_plans USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: leader_meeting_notes Tenant admin manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admin manage" ON public.leader_meeting_notes USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: lesson_responses Tenant admin manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admin manage" ON public.lesson_responses USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: meeting_evaluations Tenant admin manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admin manage" ON public.meeting_evaluations USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: notification_preferences Tenant admin manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admin manage" ON public.notification_preferences USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: pastoral_notes Tenant admin manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admin manage" ON public.pastoral_notes USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: poll_votes Tenant admin manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admin manage" ON public.poll_votes USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: prayer_requests Tenant admin manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admin manage" ON public.prayer_requests USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: push_subscriptions Tenant admin manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admin manage" ON public.push_subscriptions USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: spiritual_assessments Tenant admin manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admin manage" ON public.spiritual_assessments USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: testimonies Tenant admin manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admin manage" ON public.testimonies USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: user_devotional_overrides Tenant admin manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admin manage" ON public.user_devotional_overrides USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: user_lesson_overrides Tenant admin manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admin manage" ON public.user_lesson_overrides USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: user_progress Tenant admin manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admin manage" ON public.user_progress USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: worship_attendance Tenant admin manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admin manage" ON public.worship_attendance USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: year_promotion_requests Tenant admin manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admin manage" ON public.year_promotion_requests USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: achievement_definitions Tenant content manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant content manage" ON public.achievement_definitions USING ((public.is_super_admin(auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK ((public.is_super_admin(auth.uid()) OR ((church_id IS NOT NULL) AND public.can_manage_church(church_id))));


--
-- Name: activities Tenant content manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant content manage" ON public.activities USING ((public.is_super_admin(auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK ((public.is_super_admin(auth.uid()) OR ((church_id IS NOT NULL) AND public.can_manage_church(church_id))));


--
-- Name: courses Tenant content manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant content manage" ON public.courses USING ((public.is_super_admin(auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK ((public.is_super_admin(auth.uid()) OR ((church_id IS NOT NULL) AND public.can_manage_church(church_id))));


--
-- Name: devotional_content Tenant content manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant content manage" ON public.devotional_content USING ((public.is_super_admin(auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK ((public.is_super_admin(auth.uid()) OR ((church_id IS NOT NULL) AND public.can_manage_church(church_id))));


--
-- Name: game_config Tenant content manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant content manage" ON public.game_config USING ((public.is_super_admin(auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK ((public.is_super_admin(auth.uid()) OR ((church_id IS NOT NULL) AND public.can_manage_church(church_id))));


--
-- Name: leader_guide Tenant content manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant content manage" ON public.leader_guide USING ((public.is_super_admin(auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK ((public.is_super_admin(auth.uid()) OR ((church_id IS NOT NULL) AND public.can_manage_church(church_id))));


--
-- Name: lesson_content Tenant content manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant content manage" ON public.lesson_content USING ((public.is_super_admin(auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK ((public.is_super_admin(auth.uid()) OR ((church_id IS NOT NULL) AND public.can_manage_church(church_id))));


--
-- Name: lessons Tenant content manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant content manage" ON public.lessons USING ((public.is_super_admin(auth.uid()) OR public.can_manage_church(church_id))) WITH CHECK ((public.is_super_admin(auth.uid()) OR ((church_id IS NOT NULL) AND public.can_manage_church(church_id))));


--
-- Name: area_pastors Tenant manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant manage" ON public.area_pastors USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: areas Tenant manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant manage" ON public.areas USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: communities Tenant manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant manage" ON public.communities USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: community_challenges Tenant manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant manage" ON public.community_challenges USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: community_settings Tenant manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant manage" ON public.community_settings USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: course_unlocks Tenant manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant manage" ON public.course_unlocks USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: custom_event_types Tenant manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant manage" ON public.custom_event_types USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: devotional_worship_songs Tenant manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant manage" ON public.devotional_worship_songs USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: events Tenant manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant manage" ON public.events USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: messages Tenant manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant manage" ON public.messages USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: polls Tenant manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant manage" ON public.polls USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: ranking_seasons Tenant manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant manage" ON public.ranking_seasons USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: turmas Tenant manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant manage" ON public.turmas USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: worship_songs Tenant manage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant manage" ON public.worship_songs USING (public.can_manage_church(church_id)) WITH CHECK (public.can_manage_church(church_id));


--
-- Name: area_pastors Tenant select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant select" ON public.area_pastors FOR SELECT USING ((public.is_super_admin(auth.uid()) OR (church_id = public.get_auth_church_id())));


--
-- Name: areas Tenant select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant select" ON public.areas FOR SELECT USING ((public.is_super_admin(auth.uid()) OR (church_id = public.get_auth_church_id())));


--
-- Name: communities Tenant select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant select" ON public.communities FOR SELECT USING ((public.is_super_admin(auth.uid()) OR (church_id = public.get_auth_church_id())));


--
-- Name: community_challenges Tenant select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant select" ON public.community_challenges FOR SELECT USING ((public.is_super_admin(auth.uid()) OR (church_id = public.get_auth_church_id())));


--
-- Name: community_settings Tenant select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant select" ON public.community_settings FOR SELECT USING ((public.is_super_admin(auth.uid()) OR (church_id = public.get_auth_church_id())));


--
-- Name: course_unlocks Tenant select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant select" ON public.course_unlocks FOR SELECT USING ((public.is_super_admin(auth.uid()) OR (church_id = public.get_auth_church_id())));


--
-- Name: custom_event_types Tenant select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant select" ON public.custom_event_types FOR SELECT USING ((public.is_super_admin(auth.uid()) OR (church_id = public.get_auth_church_id())));


--
-- Name: devotional_worship_songs Tenant select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant select" ON public.devotional_worship_songs FOR SELECT USING ((public.is_super_admin(auth.uid()) OR (church_id = public.get_auth_church_id())));


--
-- Name: events Tenant select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant select" ON public.events FOR SELECT USING ((public.is_super_admin(auth.uid()) OR (church_id = public.get_auth_church_id())));


--
-- Name: messages Tenant select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant select" ON public.messages FOR SELECT USING ((public.is_super_admin(auth.uid()) OR (church_id = public.get_auth_church_id())));


--
-- Name: polls Tenant select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant select" ON public.polls FOR SELECT USING ((public.is_super_admin(auth.uid()) OR (church_id = public.get_auth_church_id())));


--
-- Name: ranking_seasons Tenant select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant select" ON public.ranking_seasons FOR SELECT USING ((public.is_super_admin(auth.uid()) OR (church_id = public.get_auth_church_id())));


--
-- Name: turmas Tenant select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant select" ON public.turmas FOR SELECT USING ((public.is_super_admin(auth.uid()) OR (church_id = public.get_auth_church_id())));


--
-- Name: worship_songs Tenant select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant select" ON public.worship_songs FOR SELECT USING ((public.is_super_admin(auth.uid()) OR (church_id = public.get_auth_church_id())));


--
-- Name: message_reactions Users can add reactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can add reactions" ON public.message_reactions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: privacy_requests Users can create own privacy requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own privacy requests" ON public.privacy_requests FOR INSERT TO authenticated WITH CHECK (((user_id = auth.uid()) AND (status = 'open'::text) AND (admin_notes IS NULL) AND (resolved_at IS NULL) AND (resolved_by IS NULL)));


--
-- Name: prayer_interactions Users can create their own prayer interactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own prayer interactions" ON public.prayer_interactions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: event_photos Users can delete own photos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own photos" ON public.event_photos FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: push_subscriptions Users can delete own push subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own push subscriptions" ON public.push_subscriptions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: community_chat Users can delete their own chat messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own chat messages" ON public.community_chat FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: prayer_interactions Users can delete their own prayer interactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own prayer interactions" ON public.prayer_interactions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: testimonies Users can delete their own testimonies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own testimonies" ON public.testimonies FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: poll_votes Users can delete their own votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own votes" ON public.poll_votes FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: push_activation_reminders Users can dismiss own reminders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can dismiss own reminders" ON public.push_activation_reminders FOR UPDATE TO authenticated USING ((auth.uid() = target_user_id));


--
-- Name: achievement_unlocks Users can insert own achievement unlocks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own achievement unlocks" ON public.achievement_unlocks FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: data_export_audit Users can insert own data export audit; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own data export audit" ON public.data_export_audit FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- Name: event_photos Users can insert own photos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own photos" ON public.event_photos FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_progress Users can insert own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: push_subscriptions Users can insert own push subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own push subscriptions" ON public.push_subscriptions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: message_views Users can insert own views; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own views" ON public.message_views FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: worship_attendance Users can insert own worship attendance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own worship attendance" ON public.worship_attendance FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: attendance Users can insert their own attendance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own attendance" ON public.attendance FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: devotional_progress Users can insert their own devotional progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own devotional progress" ON public.devotional_progress FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: frontend_error_logs Users can insert their own error logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own error logs" ON public.frontend_error_logs FOR INSERT WITH CHECK (((auth.uid() = user_id) OR (user_id IS NULL)));


--
-- Name: lesson_responses Users can insert their own lesson responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own lesson responses" ON public.lesson_responses FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: notification_preferences Users can insert their own notification preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own notification preferences" ON public.notification_preferences FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: testimonies Users can insert their own testimonies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own testimonies" ON public.testimonies FOR INSERT WITH CHECK (((auth.uid() = user_id) AND (community = (public.get_my_community())::text)));


--
-- Name: poll_votes Users can insert their own votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own votes" ON public.poll_votes FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: challenge_participants Users can join challenges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can join challenges" ON public.challenge_participants FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: challenge_participants Users can leave challenges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can leave challenges" ON public.challenge_participants FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: spiritual_assessments Users can manage their own assessments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own assessments" ON public.spiritual_assessments TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: devotional_responses Users can manage their own devotional responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own devotional responses" ON public.devotional_responses TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: prayer_diary Users can manage their own diary; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own diary" ON public.prayer_diary USING ((auth.uid() = user_id));


--
-- Name: lesson_responses Users can read their own lesson responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read their own lesson responses" ON public.lesson_responses FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: message_reactions Users can remove their own reactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can remove their own reactions" ON public.message_reactions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: push_subscriptions Users can update own push subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own push subscriptions" ON public.push_subscriptions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: attendance Users can update their own attendance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own attendance" ON public.attendance FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: lesson_responses Users can update their own lesson responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own lesson responses" ON public.lesson_responses FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: notification_preferences Users can update their own notification preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own notification preferences" ON public.notification_preferences FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: notifications Users can update their own notification status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own notification status" ON public.notifications FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: prayer_pairs Users can update their own pair data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own pair data" ON public.prayer_pairs FOR UPDATE TO authenticated USING (((auth.uid() = user_a_id) OR (auth.uid() = user_b_id)));


--
-- Name: challenge_participants Users can update their own participation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own participation" ON public.challenge_participants FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: event_photos Users can view approved photos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view approved photos" ON public.event_photos FOR SELECT TO authenticated USING (((status = 'aprovado'::text) OR (user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role)));


--
-- Name: challenge_participants Users can view challenge participants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view challenge participants" ON public.challenge_participants FOR SELECT USING (true);


--
-- Name: prayer_interactions Users can view interactions for visible requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view interactions for visible requests" ON public.prayer_interactions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.prayer_requests
  WHERE (prayer_requests.id = prayer_interactions.request_id))));


--
-- Name: message_reactions Users can view message reactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view message reactions" ON public.message_reactions FOR SELECT USING (true);


--
-- Name: messages Users can view messages for their area or community or turma; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view messages for their area or community or turma" ON public.messages FOR SELECT TO authenticated USING ((((area IS NULL) AND (community IS NULL) AND (turma_id IS NULL)) OR (area = (public.get_my_area())::text) OR (community = (public.get_my_community())::text) OR (turma_id = ( SELECT profiles.turma_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid())
 LIMIT 1))));


--
-- Name: achievement_unlocks Users can view own achievement unlocks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own achievement unlocks" ON public.achievement_unlocks FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: data_export_audit Users can view own data export audit; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own data export audit" ON public.data_export_audit FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR public.is_authorized_system_admin()));


--
-- Name: user_devotional_overrides Users can view own devotional overrides; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own devotional overrides" ON public.user_devotional_overrides FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_lesson_overrides Users can view own lesson overrides; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own lesson overrides" ON public.user_lesson_overrides FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: privacy_requests Users can view own privacy requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own privacy requests" ON public.privacy_requests FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR public.is_authorized_system_admin()));


--
-- Name: user_progress Users can view own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: push_subscriptions Users can view own push subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own push subscriptions" ON public.push_subscriptions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: push_activation_reminders Users can view own reminders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own reminders" ON public.push_activation_reminders FOR SELECT TO authenticated USING ((auth.uid() = target_user_id));


--
-- Name: message_views Users can view own views; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own views" ON public.message_views FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: whatsapp_reminder_log Users can view own whatsapp reminder log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own whatsapp reminder log" ON public.whatsapp_reminder_log FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role) OR public.is_super_admin(auth.uid())));


--
-- Name: worship_attendance Users can view own worship attendance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own worship attendance" ON public.worship_attendance FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: prayer_pairs Users can view pairs in their community; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view pairs in their community" ON public.prayer_pairs FOR SELECT TO authenticated USING ((community = (public.get_my_community())::text));


--
-- Name: poll_votes Users can view poll votes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view poll votes" ON public.poll_votes FOR SELECT TO authenticated USING (true);


--
-- Name: polls Users can view polls in their community; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view polls in their community" ON public.polls FOR SELECT TO authenticated USING (((community = (public.get_my_community())::text) OR (area = (public.get_my_area())::text)));


--
-- Name: profiles Users can view profiles in their community; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view profiles in their community" ON public.profiles FOR SELECT USING ((community = public.get_my_community()));


--
-- Name: ranking_seasons Users can view ranking seasons for their community; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view ranking seasons for their community" ON public.ranking_seasons FOR SELECT USING ((community = (public.get_my_community())::text));


--
-- Name: testimonies Users can view testimonies from their community; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view testimonies from their community" ON public.testimonies FOR SELECT USING ((community = (public.get_my_community())::text));


--
-- Name: church_audit_logs Users can view their church audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their church audit logs" ON public.church_audit_logs FOR SELECT USING ((church_id IN ( SELECT profiles.church_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: attendance Users can view their own attendance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own attendance" ON public.attendance FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: churches Users can view their own church; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own church" ON public.churches FOR SELECT USING ((id IN ( SELECT profiles.church_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: devotional_progress Users can view their own devotional progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own devotional progress" ON public.devotional_progress FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: lesson_responses Users can view their own lesson responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own lesson responses" ON public.lesson_responses FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: notification_preferences Users can view their own notification preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own notification preferences" ON public.notification_preferences FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: notifications Users can view their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: discipleship_plans Users can view their own plan; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own plan" ON public.discipleship_plans FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: worship_attendance Users can view their own worship attendance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own worship attendance" ON public.worship_attendance FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: events Users can view their personal events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their personal events" ON public.events FOR SELECT TO authenticated USING ((target_user_id = auth.uid()));


--
-- Name: worship_songs Worship songs are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Worship songs are viewable by everyone" ON public.worship_songs FOR SELECT USING ((is_active = true));


--
-- Name: achievement_definitions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;

--
-- Name: achievement_unlocks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.achievement_unlocks ENABLE ROW LEVEL SECURITY;

--
-- Name: activities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

--
-- Name: activity_removal_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.activity_removal_log ENABLE ROW LEVEL SECURITY;

--
-- Name: area_pastors; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.area_pastors ENABLE ROW LEVEL SECURITY;

--
-- Name: areas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;

--
-- Name: areas areas_admin_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY areas_admin_write ON public.areas TO authenticated USING ((public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role))) WITH CHECK ((public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: areas areas_select_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY areas_select_authenticated ON public.areas FOR SELECT TO authenticated USING (true);


--
-- Name: attendance; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

--
-- Name: authorized_system_admins; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.authorized_system_admins ENABLE ROW LEVEL SECURITY;

--
-- Name: blocked_registration_attempts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blocked_registration_attempts ENABLE ROW LEVEL SECURITY;

--
-- Name: challenge_participants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

--
-- Name: church_audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.church_audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: church_subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.church_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: churches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;

--
-- Name: communities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

--
-- Name: communities communities_admin_write; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY communities_admin_write ON public.communities TO authenticated USING ((public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role))) WITH CHECK ((public.is_super_admin(auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: communities communities_select_authenticated; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY communities_select_authenticated ON public.communities FOR SELECT TO authenticated USING (true);


--
-- Name: community_challenges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.community_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: community_chat; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.community_chat ENABLE ROW LEVEL SECURITY;

--
-- Name: community_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.community_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: course_unlocks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.course_unlocks ENABLE ROW LEVEL SECURITY;

--
-- Name: courses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

--
-- Name: custom_event_types; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.custom_event_types ENABLE ROW LEVEL SECURITY;

--
-- Name: data_export_audit; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.data_export_audit ENABLE ROW LEVEL SECURITY;

--
-- Name: devotional_content; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.devotional_content ENABLE ROW LEVEL SECURITY;

--
-- Name: devotional_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.devotional_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: devotional_responses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.devotional_responses ENABLE ROW LEVEL SECURITY;

--
-- Name: devotional_worship_songs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.devotional_worship_songs ENABLE ROW LEVEL SECURITY;

--
-- Name: discipleship_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.discipleship_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: event_photos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: frontend_error_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.frontend_error_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: game_config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.game_config ENABLE ROW LEVEL SECURITY;

--
-- Name: leader_guide; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.leader_guide ENABLE ROW LEVEL SECURITY;

--
-- Name: leader_meeting_notes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.leader_meeting_notes ENABLE ROW LEVEL SECURITY;

--
-- Name: lesson_content; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lesson_content ENABLE ROW LEVEL SECURITY;

--
-- Name: lesson_responses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lesson_responses ENABLE ROW LEVEL SECURITY;

--
-- Name: lessons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

--
-- Name: login_audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.login_audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: push_automation_config manage_push_automation_config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY manage_push_automation_config ON public.push_automation_config TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role)));


--
-- Name: push_scheduled manage_push_scheduled; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY manage_push_scheduled ON public.push_scheduled TO authenticated USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role))) WITH CHECK ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'lider'::public.app_role)));


--
-- Name: meeting_evaluations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.meeting_evaluations ENABLE ROW LEVEL SECURITY;

--
-- Name: message_reactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

--
-- Name: message_views; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.message_views ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_preferences; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: pastoral_notes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pastoral_notes ENABLE ROW LEVEL SECURITY;

--
-- Name: plan_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.plan_history ENABLE ROW LEVEL SECURITY;

--
-- Name: poll_votes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

--
-- Name: polls; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

--
-- Name: prayer_diary; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.prayer_diary ENABLE ROW LEVEL SECURITY;

--
-- Name: prayer_interactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.prayer_interactions ENABLE ROW LEVEL SECURITY;

--
-- Name: prayer_pairs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.prayer_pairs ENABLE ROW LEVEL SECURITY;

--
-- Name: prayer_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: prayer_requests prayer_requests_delete_own_or_leader; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY prayer_requests_delete_own_or_leader ON public.prayer_requests FOR DELETE USING (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.role = ANY (ARRAY['admin'::public.app_role, 'lider'::public.app_role])))))));


--
-- Name: prayer_requests prayer_requests_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY prayer_requests_insert_own ON public.prayer_requests FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: prayer_requests prayer_requests_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY prayer_requests_select_all ON public.prayer_requests FOR SELECT USING (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND ((p.role = ANY (ARRAY['admin'::public.app_role, 'lider'::public.app_role])) OR ((prayer_requests.visibility = ANY (ARRAY['public'::text, 'anonymous'::text])) AND (((p.community)::text = prayer_requests.community) OR ((p.area)::text = prayer_requests.area) OR (p.turma_id = prayer_requests.turma_id)))))))));


--
-- Name: prayer_requests prayer_requests_update_own_or_leader; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY prayer_requests_update_own_or_leader ON public.prayer_requests FOR UPDATE USING (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.user_id = auth.uid()) AND (p.role = ANY (ARRAY['admin'::public.app_role, 'lider'::public.app_role])))))));


--
-- Name: privacy_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.privacy_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: profession_of_faith_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profession_of_faith_records ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: push_activation_reminders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.push_activation_reminders ENABLE ROW LEVEL SECURITY;

--
-- Name: push_automation_config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.push_automation_config ENABLE ROW LEVEL SECURITY;

--
-- Name: push_notification_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.push_notification_log ENABLE ROW LEVEL SECURITY;

--
-- Name: push_scheduled; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.push_scheduled ENABLE ROW LEVEL SECURITY;

--
-- Name: push_subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: ranking_seasons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ranking_seasons ENABLE ROW LEVEL SECURITY;

--
-- Name: push_automation_config read_push_automation_config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_push_automation_config ON public.push_automation_config FOR SELECT TO authenticated USING (true);


--
-- Name: spiritual_assessments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.spiritual_assessments ENABLE ROW LEVEL SECURITY;

--
-- Name: stripe_webhook_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.stripe_webhook_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: system_admin_audit_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.system_admin_audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: system_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: testimonies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.testimonies ENABLE ROW LEVEL SECURITY;

--
-- Name: turma_lesson_content; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.turma_lesson_content ENABLE ROW LEVEL SECURITY;

--
-- Name: turmas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;

--
-- Name: user_devotional_overrides; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_devotional_overrides ENABLE ROW LEVEL SECURITY;

--
-- Name: user_lesson_overrides; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_lesson_overrides ENABLE ROW LEVEL SECURITY;

--
-- Name: user_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_reminder_config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_reminder_config ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_reminder_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_reminder_log ENABLE ROW LEVEL SECURITY;

--
-- Name: worship_attendance; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.worship_attendance ENABLE ROW LEVEL SECURITY;

--
-- Name: worship_songs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.worship_songs ENABLE ROW LEVEL SECURITY;

--
-- Name: year_promotion_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.year_promotion_requests ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


