-- Multi-church hardening for Caminho Boa Nova.
-- Apply this in Supabase before relying on tenant isolation in production.

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

do $$
declare
  t text;
begin
  foreach t in array array[
    'areas',
    'communities',
    'user_roles',
    'courses',
    'activities',
    'lessons',
    'lesson_content',
    'devotional_content',
    'turma_lesson_content',
    'leader_guide',
    'turmas',
    'events',
    'custom_event_types',
    'messages',
    'message_reactions',
    'message_views',
    'attendance',
    'worship_attendance',
    'worship_songs',
    'devotional_worship_songs',
    'user_progress',
    'lesson_responses',
    'devotional_progress',
    'devotional_responses',
    'achievement_unlocks',
    'achievement_definitions',
    'game_config',
    'bonus_grant_log',
    'community_settings',
    'area_pastors',
    'community_challenges',
    'challenge_participants',
    'course_unlocks',
    'ranking_seasons',
    'discipleship_plans',
    'pastoral_notes',
    'spiritual_assessments',
    'meeting_evaluations',
    'leader_meeting_notes',
    'notification_preferences',
    'push_subscriptions',
    'push_notification_log',
    'push_scheduled',
    'push_automation_config',
    'push_activation_reminders',
    'whatsapp_reminder_log',
    'community_chat',
    'prayer_requests',
    'prayer_pairs',
    'testimonies',
    'polls',
    'poll_votes',
    'event_photos',
    'year_promotion_requests',
    'activity_removal_log',
    'data_export_audit',
    'privacy_requests',
    'user_devotional_overrides',
    'user_lesson_overrides'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I add column if not exists church_id uuid references public.churches(id) on delete set null', t);
      execute format('create index if not exists %I on public.%I(church_id)', t || '_church_id_idx', t);
    end if;
  end loop;
end $$;

-- Backfill user-owned records from profiles.
do $$
declare
  t text;
begin
  foreach t in array array[
    'user_roles',
    'user_progress',
    'lesson_responses',
    'devotional_progress',
    'devotional_responses',
    'attendance',
    'worship_attendance',
    'achievement_unlocks',
    'challenge_participants',
    'discipleship_plans',
    'pastoral_notes',
    'spiritual_assessments',
    'meeting_evaluations',
    'notification_preferences',
    'push_subscriptions',
    'community_chat',
    'prayer_requests',
    'testimonies',
    'poll_votes',
    'year_promotion_requests',
    'user_devotional_overrides',
    'user_lesson_overrides'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format(
        'update public.%I x set church_id = p.church_id from public.profiles p where x.church_id is null and x.user_id = p.user_id and p.church_id is not null',
        t
      );
    end if;
  end loop;
end $$;

-- Backfill content/event-linked records.
do $$
begin
  if to_regclass('public.communities') is not null and to_regclass('public.areas') is not null then
    update public.communities c
    set church_id = a.church_id
    from public.areas a
    where c.church_id is null and c.area_id = a.id and a.church_id is not null;
  end if;

  if to_regclass('public.lesson_content') is not null and to_regclass('public.lessons') is not null then
    update public.lesson_content lc
    set church_id = l.church_id
    from public.lessons l
    where lc.church_id is null and lc.lesson_id = l.id and l.church_id is not null;
  end if;

  if to_regclass('public.devotional_content') is not null and to_regclass('public.lessons') is not null then
    update public.devotional_content dc
    set church_id = l.church_id
    from public.lessons l
    where dc.church_id is null and dc.lesson_id = l.id and l.church_id is not null;
  end if;

  if to_regclass('public.events') is not null and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'events' and column_name = 'created_by'
  ) then
    execute '
      update public.events e
      set church_id = p.church_id
      from public.profiles p
      where e.church_id is null and e.created_by = p.user_id and p.church_id is not null
    ';
  end if;

  -- Some existing projects have messages without created_by, so message church_id
  -- is filled later by the single-church legacy fallback or by new app writes.

  if to_regclass('public.message_reactions') is not null
    and to_regclass('public.messages') is not null
    and exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'message_reactions' and column_name = 'message_id'
    )
    and exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'messages' and column_name = 'church_id'
    )
  then
    execute '
      update public.message_reactions r
      set church_id = m.church_id
      from public.messages m
      where r.church_id is null and r.message_id = m.id and m.church_id is not null
    ';
  end if;

  if to_regclass('public.message_views') is not null
    and to_regclass('public.messages') is not null
    and exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'message_views' and column_name = 'message_id'
    )
    and exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'messages' and column_name = 'church_id'
    )
  then
    execute '
      update public.message_views v
      set church_id = m.church_id
      from public.messages m
      where v.church_id is null and v.message_id = m.id and m.church_id is not null
    ';
  end if;

  if to_regclass('public.event_photos') is not null and to_regclass('public.events') is not null then
    update public.event_photos ep
    set church_id = e.church_id
    from public.events e
    where ep.church_id is null and ep.event_id = e.id and e.church_id is not null;
  end if;
end $$;

-- Legacy single-church data: attach null tenant data to the only active church when safe.
do $$
declare
  only_church uuid;
begin
  select id into only_church from public.churches where is_active is distinct from false limit 1;

  if only_church is not null and (select count(*) from public.churches where is_active is distinct from false) = 1 then
    if to_regclass('public.areas') is not null then update public.areas set church_id = only_church where church_id is null; end if;
    if to_regclass('public.communities') is not null then update public.communities set church_id = only_church where church_id is null; end if;
    if to_regclass('public.turmas') is not null then update public.turmas set church_id = only_church where church_id is null; end if;
    if to_regclass('public.events') is not null then update public.events set church_id = only_church where church_id is null; end if;
    if to_regclass('public.messages') is not null then update public.messages set church_id = only_church where church_id is null; end if;
    if to_regclass('public.custom_event_types') is not null then update public.custom_event_types set church_id = only_church where church_id is null; end if;
    if to_regclass('public.community_settings') is not null then update public.community_settings set church_id = only_church where church_id is null; end if;
    if to_regclass('public.area_pastors') is not null then update public.area_pastors set church_id = only_church where church_id is null; end if;
    if to_regclass('public.community_challenges') is not null then update public.community_challenges set church_id = only_church where church_id is null; end if;
    if to_regclass('public.course_unlocks') is not null then update public.course_unlocks set church_id = only_church where church_id is null; end if;
    if to_regclass('public.ranking_seasons') is not null then update public.ranking_seasons set church_id = only_church where church_id is null; end if;
  end if;
end $$;

do $$
begin
  if to_regclass('public.lesson_content') is not null then
    create unique index if not exists lesson_content_lesson_church_uidx
      on public.lesson_content(lesson_id, church_id);
  end if;

  if to_regclass('public.user_roles') is not null then
    create unique index if not exists user_roles_user_role_church_uidx
      on public.user_roles(user_id, role, church_id);
  end if;
end $$;

-- Remove old permissive/area-only policies. If they remain, PostgreSQL ORs them
-- with new tenant policies and can still leak data between churches.
do $$
declare
  t text;
  p text;
begin
  foreach t in array array[
    'profiles',
    'user_roles',
    'courses',
    'lessons',
    'activities',
    'lesson_content',
    'devotional_content',
    'events',
    'messages',
    'attendance',
    'worship_attendance',
    'discipleship_plans',
    'pastoral_notes',
    'spiritual_assessments',
    'community_chat',
    'prayer_requests',
    'community_settings'
  ] loop
    if to_regclass('public.' || t) is not null then
      foreach p in array array[
        'Admins can view all profiles',
        'Users can view their own profile',
        'Users can update their own profile',
        'Users can insert their own profile',
        'Admins can view all roles',
        'Users can view their own role',
        'Admins can manage user roles',
        'Courses viewable by authenticated users',
        'Lessons viewable by authenticated users',
        'Events viewable by authenticated users',
        'Activities viewable by authenticated users',
        'Activities are viewable by everyone',
        'Lesson content is viewable by everyone',
        'Authenticated users can view lesson content',
        'Devotional content is viewable by everyone',
        'Users can view messages for their area or community',
        'Admins can manage courses',
        'Admins can manage lessons',
        'Admins can manage events',
        'Admins can manage messages',
        'Admins can manage activities',
        'Admins can manage lesson content',
        'Admins can manage devotional content',
        'Users can view chat from their community',
        'Users can insert chat messages in their community',
        'Users can view prayer requests from their community',
        'Users can insert prayer requests in their community',
        'Anyone authenticated can view community settings',
        'Admins can manage community settings',
        'Admins can manage attendance in their area',
        'Admins can manage pastoral notes in their area',
        'Admins can view assessments in their area',
        'Admins can manage plans in their area'
      ] loop
        execute format('drop policy if exists %I on public.%I', p, t);
      end loop;
    end if;
  end loop;
end $$;

alter table public.profiles enable row level security;
drop policy if exists "Profiles tenant select" on public.profiles;
drop policy if exists "Profiles own update" on public.profiles;
drop policy if exists "Profiles own insert" on public.profiles;
drop policy if exists "Profiles tenant manage" on public.profiles;
create policy "Profiles tenant select"
on public.profiles for select
using (
  user_id = auth.uid()
  or public.is_super_admin(auth.uid())
  or church_id = public.get_auth_church_id()
);
create policy "Profiles own update"
on public.profiles for update
using (user_id = auth.uid())
with check (user_id = auth.uid() and church_id = public.get_auth_church_id());
create policy "Profiles own insert"
on public.profiles for insert
with check (user_id = auth.uid());
create policy "Profiles tenant manage"
on public.profiles for all
using (public.can_manage_church(church_id))
with check (public.can_manage_church(church_id));

alter table public.user_roles enable row level security;
drop policy if exists "Roles tenant select" on public.user_roles;
drop policy if exists "Roles tenant manage" on public.user_roles;
create policy "Roles tenant select"
on public.user_roles for select
using (
  user_id = auth.uid()
  or public.is_super_admin(auth.uid())
  or public.can_manage_church(church_id)
);
create policy "Roles tenant manage"
on public.user_roles for all
using (public.can_manage_church(church_id))
with check (public.can_manage_church(church_id));

-- Tenant-visible tables: users can read same church, managers can write same church.
do $$
declare
  t text;
begin
  foreach t in array array[
    'areas',
    'communities',
    'turmas',
    'events',
    'custom_event_types',
    'messages',
    'community_settings',
    'area_pastors',
    'community_challenges',
    'course_unlocks',
    'ranking_seasons',
    'polls',
    'worship_songs',
    'devotional_worship_songs'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
      execute format('drop policy if exists "Tenant select" on public.%I', t);
      execute format('drop policy if exists "Tenant manage" on public.%I', t);
      execute format(
        'create policy "Tenant select" on public.%I for select using (public.is_super_admin(auth.uid()) or church_id = public.get_auth_church_id())',
        t
      );
      execute format(
        'create policy "Tenant manage" on public.%I for all using (public.can_manage_church(church_id)) with check (public.can_manage_church(church_id))',
        t
      );
    end if;
  end loop;
end $$;

-- User-owned tables: own user can read/write own rows, managers can administer their church.
do $$
declare
  t text;
begin
  foreach t in array array[
    'user_progress',
    'lesson_responses',
    'devotional_progress',
    'devotional_responses',
    'attendance',
    'worship_attendance',
    'achievement_unlocks',
    'challenge_participants',
    'discipleship_plans',
    'pastoral_notes',
    'spiritual_assessments',
    'meeting_evaluations',
    'notification_preferences',
    'community_chat',
    'prayer_requests',
    'testimonies',
    'poll_votes',
    'user_devotional_overrides',
    'user_lesson_overrides',
    'year_promotion_requests'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
      execute format('drop policy if exists "Own or tenant manager select" on public.%I', t);
      execute format('drop policy if exists "Own or tenant manager write" on public.%I', t);
      execute format(
        'create policy "Own or tenant manager select" on public.%I for select using (user_id = auth.uid() or public.can_manage_church(church_id))',
        t
      );
      execute format(
        'create policy "Own or tenant manager write" on public.%I for all using (user_id = auth.uid() or public.can_manage_church(church_id)) with check (user_id = auth.uid() or public.can_manage_church(church_id))',
        t
      );
    end if;
  end loop;
end $$;

-- Content tables may have global rows (church_id null) plus church overrides.
do $$
declare
  t text;
begin
  foreach t in array array[
    'courses',
    'activities',
    'lessons',
    'lesson_content',
    'devotional_content',
    'turma_lesson_content',
    'leader_guide',
    'achievement_definitions',
    'game_config'
  ] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
      execute format('drop policy if exists "Global or tenant content select" on public.%I', t);
      execute format('drop policy if exists "Tenant content manage" on public.%I', t);
      execute format(
        'create policy "Global or tenant content select" on public.%I for select using (church_id is null or public.is_super_admin(auth.uid()) or church_id = public.get_auth_church_id())',
        t
      );
      execute format(
        'create policy "Tenant content manage" on public.%I for all using (public.is_super_admin(auth.uid()) or public.can_manage_church(church_id)) with check (church_id is null or public.is_super_admin(auth.uid()) or public.can_manage_church(church_id))',
        t
      );
    end if;
  end loop;
end $$;
