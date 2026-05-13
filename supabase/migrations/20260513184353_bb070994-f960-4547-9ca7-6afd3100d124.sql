-- Multi-church hardening for Caminho Boa Nova (Defensive version).

create extension if not exists pgcrypto;

create or replace function public.get_auth_church_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.church_id
  from public.profiles p
  where p.user_id = auth.uid()
  limit 1
$$;

create or replace function public.is_super_admin(_user_id uuid default auth.uid())
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
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
$$;

create or replace function public.can_manage_church(_church_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
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
$$;

-- Add church_id to all relevant tables
do $$
declare
  t text;
begin
  foreach t in array array[
    'areas', 'communities', 'user_roles', 'courses', 'activities', 'lessons',
    'lesson_content', 'devotional_content', 'turma_lesson_content', 'leader_guide',
    'turmas', 'events', 'custom_event_types', 'messages', 'message_reactions',
    'message_views', 'attendance', 'worship_attendance', 'worship_songs',
    'devotional_worship_songs', 'user_progress', 'lesson_responses',
    'devotional_progress', 'devotional_responses', 'achievement_unlocks',
    'achievement_definitions', 'game_config', 'bonus_grant_log', 'community_settings',
    'area_pastors', 'community_challenges', 'challenge_participants', 'course_unlocks',
    'ranking_seasons', 'discipleship_plans', 'pastoral_notes', 'spiritual_assessments',
    'meeting_evaluations', 'leader_meeting_notes', 'notification_preferences',
    'push_subscriptions', 'push_notification_log', 'push_scheduled',
    'push_automation_config', 'push_activation_reminders', 'whatsapp_reminder_log',
    'community_chat', 'prayer_requests', 'prayer_pairs', 'testimonies', 'polls',
    'poll_votes', 'event_photos', 'year_promotion_requests', 'activity_removal_log',
    'data_export_audit', 'privacy_requests', 'user_devotional_overrides', 'user_lesson_overrides'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I add column if not exists church_id uuid references public.churches(id) on delete set null', t);
      execute format('create index if not exists %I on public.%I(church_id)', t || '_church_id_idx', t);
    end if;
  end loop;
end $$;

-- Backfill church_id from profiles for user-owned records
do $$
declare
  t text;
begin
  foreach t in array array[
    'user_roles', 'user_progress', 'lesson_responses', 'devotional_progress',
    'devotional_responses', 'attendance', 'worship_attendance', 'achievement_unlocks',
    'challenge_participants', 'discipleship_plans', 'pastoral_notes', 'spiritual_assessments',
    'meeting_evaluations', 'notification_preferences', 'push_subscriptions',
    'community_chat', 'prayer_requests', 'testimonies', 'poll_votes',
    'year_promotion_requests', 'user_devotional_overrides', 'user_lesson_overrides'
  ] loop
    if to_regclass('public.' || t) is not null and exists (
      select 1 from information_schema.columns where table_schema = 'public' and table_name = t and column_name = 'user_id'
    ) then
      execute format(
        'update public.%I x set church_id = p.church_id from public.profiles p where x.church_id is null and x.user_id = p.user_id and p.church_id is not null',
        t
      );
    end if;
  end loop;
end $$;

-- Policies
do $$
declare
  t text;
begin
  -- User-owned tables: only if user_id column exists
  foreach t in array array[
    'user_progress', 'lesson_responses', 'devotional_progress', 'devotional_responses',
    'attendance', 'worship_attendance', 'achievement_unlocks', 'challenge_participants',
    'discipleship_plans', 'pastoral_notes', 'spiritual_assessments', 'meeting_evaluations',
    'leader_meeting_notes', 'notification_preferences', 'push_subscriptions',
    'community_chat', 'prayer_requests', 'testimonies', 'poll_votes',
    'year_promotion_requests', 'user_devotional_overrides', 'user_lesson_overrides'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
      execute format('drop policy if exists "Own rows select" on public.%I', t);
      execute format('drop policy if exists "Own rows manage" on public.%I', t);
      execute format('drop policy if exists "Tenant admin manage" on public.%I', t);

      -- Check if user_id exists for owner-based policies
      if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = t and column_name = 'user_id') then
        execute format('create policy "Own rows select" on public.%I for select using (user_id = auth.uid())', t);
        execute format('create policy "Own rows manage" on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid() and church_id = public.get_auth_church_id())', t);
      end if;

      -- Manager-based policy
      execute format('create policy "Tenant admin manage" on public.%I for all using (public.can_manage_church(church_id)) with check (public.can_manage_church(church_id))', t);
    end if;
  end loop;

  -- Tenant-wide tables
  foreach t in array array[
    'areas', 'communities', 'turmas', 'events', 'custom_event_types', 'messages',
    'community_settings', 'area_pastors', 'community_challenges', 'course_unlocks',
    'ranking_seasons', 'polls', 'worship_songs', 'devotional_worship_songs'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
      execute format('drop policy if exists "Tenant select" on public.%I', t);
      execute format('drop policy if exists "Tenant manage" on public.%I', t);
      execute format('create policy "Tenant select" on public.%I for select using (public.is_super_admin(auth.uid()) or church_id = public.get_auth_church_id())', t);
      execute format('create policy "Tenant manage" on public.%I for all using (public.can_manage_church(church_id)) with check (public.can_manage_church(church_id))', t);
    end if;
  end loop;
end $$;

-- Manual profile and roles policies (always exist)
alter table public.profiles enable row level security;
drop policy if exists "Profiles tenant select" on public.profiles;
drop policy if exists "Profiles own update" on public.profiles;
drop policy if exists "Profiles own insert" on public.profiles;
drop policy if exists "Profiles tenant manage" on public.profiles;
create policy "Profiles tenant select" on public.profiles for select using (user_id = auth.uid() or public.is_super_admin(auth.uid()) or church_id = public.get_auth_church_id());
create policy "Profiles own update" on public.profiles for update using (user_id = auth.uid()) with check (user_id = auth.uid() and church_id = public.get_auth_church_id());
create policy "Profiles own insert" on public.profiles for insert with check (user_id = auth.uid());
create policy "Profiles tenant manage" on public.profiles for all using (public.can_manage_church(church_id)) with check (public.can_manage_church(church_id));

alter table public.user_roles enable row level security;
drop policy if exists "Roles tenant select" on public.user_roles;
drop policy if exists "Roles tenant manage" on public.user_roles;
create policy "Roles tenant select" on public.user_roles for select using (user_id = auth.uid() or public.is_super_admin(auth.uid()) or public.can_manage_church(church_id));
create policy "Roles tenant manage" on public.user_roles for all using (public.can_manage_church(church_id)) with check (public.can_manage_church(church_id));