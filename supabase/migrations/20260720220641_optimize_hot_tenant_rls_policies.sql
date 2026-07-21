-- Reduce per-row RLS work on the hot member/progress tables.
-- No user data is changed by this migration.

create or replace function public.get_my_manageable_church_ids()
returns uuid[]
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce(
    array_agg(distinct coalesce(ur.church_id, p.church_id))
      filter (where coalesce(ur.church_id, p.church_id) is not null),
    '{}'::uuid[]
  )
  from public.user_roles ur
  left join public.profiles p on p.user_id = ur.user_id
  where ur.user_id = (select auth.uid())
    and ur.role in ('admin'::public.app_role, 'lider'::public.app_role)
$$;

revoke all on function public.get_my_manageable_church_ids() from public;
revoke all on function public.get_my_manageable_church_ids() from anon;
grant execute on function public.get_my_manageable_church_ids() to authenticated;

create or replace function public.can_manage_church(_church_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select case
    when _church_id is null then public.is_super_admin((select auth.uid()))
    else public.is_super_admin((select auth.uid()))
      or _church_id = any(public.get_my_manageable_church_ids())
  end
$$;

do $$
declare
  table_name text;
  own_or_manage text := $policy$
    (
      user_id = (select auth.uid())
      and church_id = (select public.get_auth_church_id())
    )
    or (select public.is_super_admin((select auth.uid())))
    or church_id = any((select public.get_my_manageable_church_ids())::uuid[])
  $policy$;
begin
  foreach table_name in array array[
    'attendance',
    'lesson_progress',
    'lesson_responses',
    'devotional_progress',
    'devotional_responses',
    'user_progress',
    'achievement_unlocks',
    'notification_preferences'
  ] loop
    execute format('drop policy if exists "Tenant-owned rows select" on public.%I', table_name);
    execute format('drop policy if exists "Tenant-owned rows write" on public.%I', table_name);
    execute format('drop policy if exists "Tenant-owned rows insert" on public.%I', table_name);
    execute format('drop policy if exists "Tenant-owned rows update" on public.%I', table_name);
    execute format('drop policy if exists "Tenant-owned rows delete" on public.%I', table_name);

    execute format(
      'create policy "Tenant-owned rows select" on public.%I for select to authenticated using (%s)',
      table_name,
      own_or_manage
    );

    execute format(
      'create policy "Tenant-owned rows insert" on public.%I for insert to authenticated with check (%s)',
      table_name,
      own_or_manage
    );

    execute format(
      'create policy "Tenant-owned rows update" on public.%I for update to authenticated using (%s) with check (%s)',
      table_name,
      own_or_manage,
      own_or_manage
    );

    execute format(
      'create policy "Tenant-owned rows delete" on public.%I for delete to authenticated using (%s)',
      table_name,
      own_or_manage
    );
  end loop;
end $$;

do $$
declare
  table_name text;
  member_or_manage text := $policy$
    church_id = (select public.get_auth_church_id())
    or (select public.is_super_admin((select auth.uid())))
    or church_id = any((select public.get_my_manageable_church_ids())::uuid[])
  $policy$;
  own_or_manage text := $policy$
    (
      user_id = (select auth.uid())
      and church_id = (select public.get_auth_church_id())
    )
    or (select public.is_super_admin((select auth.uid())))
    or church_id = any((select public.get_my_manageable_church_ids())::uuid[])
  $policy$;
begin
  foreach table_name in array array['community_chat', 'prayer_requests'] loop
    execute format('drop policy if exists "Tenant member select" on public.%I', table_name);
    execute format('drop policy if exists "Tenant-owned rows select" on public.%I', table_name);
    execute format('drop policy if exists "Tenant-owned rows write" on public.%I', table_name);
    execute format('drop policy if exists "Tenant-owned rows insert" on public.%I', table_name);
    execute format('drop policy if exists "Tenant-owned rows update" on public.%I', table_name);
    execute format('drop policy if exists "Tenant-owned rows delete" on public.%I', table_name);

    execute format(
      'create policy "Tenant member select" on public.%I for select to authenticated using (%s)',
      table_name,
      member_or_manage
    );

    execute format(
      'create policy "Tenant-owned rows insert" on public.%I for insert to authenticated with check (%s)',
      table_name,
      own_or_manage
    );

    execute format(
      'create policy "Tenant-owned rows update" on public.%I for update to authenticated using (%s) with check (%s)',
      table_name,
      own_or_manage,
      own_or_manage
    );

    execute format(
      'create policy "Tenant-owned rows delete" on public.%I for delete to authenticated using (%s)',
      table_name,
      own_or_manage
    );
  end loop;
end $$;

drop function if exists public.get_manageable_church_ids(uuid);
