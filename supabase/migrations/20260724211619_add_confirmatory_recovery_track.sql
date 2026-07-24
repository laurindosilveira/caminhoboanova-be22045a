-- Individual recovery windows for the confirmatory learning trail.
-- The release itself is historical; its generated overrides enforce the
-- reduced score and the exact availability window at completion time.

create table public.confirmatory_recovery_releases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  church_id uuid not null references public.churches(id) on delete cascade,
  granted_by uuid not null references public.profiles(user_id) on delete restrict,
  available_from timestamptz not null default now(),
  available_until timestamptz not null,
  ended_at timestamptz,
  ended_by uuid references public.profiles(user_id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  constraint confirmatory_recovery_valid_window
    check (available_until > available_from)
);

create unique index confirmatory_recovery_one_open_per_user_idx
  on public.confirmatory_recovery_releases (user_id)
  where ended_at is null;

create index confirmatory_recovery_user_history_idx
  on public.confirmatory_recovery_releases (user_id, created_at desc);

alter table public.confirmatory_recovery_releases enable row level security;

alter table public.user_lesson_overrides
  add column if not exists recovery_release_id uuid
    references public.confirmatory_recovery_releases(id) on delete set null;

alter table public.user_devotional_overrides
  add column if not exists recovery_release_id uuid
    references public.confirmatory_recovery_releases(id) on delete set null;

create index if not exists user_lesson_overrides_recovery_release_idx
  on public.user_lesson_overrides (recovery_release_id)
  where recovery_release_id is not null;

create index if not exists user_devotional_overrides_recovery_release_idx
  on public.user_devotional_overrides (recovery_release_id)
  where recovery_release_id is not null;

create policy "Users read own confirmatory recovery releases"
  on public.confirmatory_recovery_releases
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or (
      (
        public.has_role((select auth.uid()), 'admin'::public.app_role)
        or public.has_role((select auth.uid()), 'lider'::public.app_role)
      )
      and (
        public.is_super_admin((select auth.uid()))
        or exists (
          select 1
          from public.profiles manager_profile
          join public.profiles target_profile
            on target_profile.user_id = confirmatory_recovery_releases.user_id
          where manager_profile.user_id = (select auth.uid())
            and manager_profile.church_id = target_profile.church_id
            and manager_profile.area = target_profile.area
        )
      )
    )
  );

-- Writes go through the RPCs below so authorization, the active-window
-- invariant, and generated item overrides are changed atomically.

create or replace function public.start_confirmatory_recovery(
  p_user_id uuid,
  p_available_until timestamptz,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_target public.profiles%rowtype;
  v_actor public.profiles%rowtype;
  v_release_id uuid;
begin
  if v_actor_id is null then
    raise exception 'Authentication required';
  end if;

  if not (
    public.has_role(v_actor_id, 'admin'::public.app_role)
    or public.has_role(v_actor_id, 'lider'::public.app_role)
  ) then
    raise exception 'Manager role required';
  end if;

  select * into v_target from public.profiles where user_id = p_user_id;
  select * into v_actor from public.profiles where user_id = v_actor_id;

  if v_target.user_id is null or v_target.church_id is null then
    raise exception 'Target profile not found';
  end if;

  if not public.is_super_admin(v_actor_id)
    and (
      v_actor.church_id is distinct from v_target.church_id
      or v_actor.area is distinct from v_target.area
    ) then
    raise exception 'Target user is outside your area';
  end if;

  if p_available_until <= now() then
    raise exception 'Recovery end must be in the future';
  end if;

  -- Reauthorization closes the previous open record, preserving its history.
  update public.confirmatory_recovery_releases
  set ended_at = now(), ended_by = v_actor_id
  where user_id = p_user_id and ended_at is null;

  update public.user_lesson_overrides
  set is_unlocked = false, updated_at = now()
  where user_id = p_user_id and recovery_release_id is not null;

  update public.user_devotional_overrides
  set is_unlocked = false, updated_at = now()
  where user_id = p_user_id and recovery_release_id is not null;

  insert into public.confirmatory_recovery_releases (
    user_id, church_id, granted_by, available_until, notes
  ) values (
    p_user_id, v_target.church_id, v_actor_id, p_available_until, nullif(btrim(p_notes), '')
  )
  returning id into v_release_id;

  -- Only unfinished studies are generated. Courses without a track are the
  -- original confirmatory trail; released tracks remain separate products.
  insert into public.user_lesson_overrides (
    user_id, lesson_id, is_unlocked, available_from, available_until,
    custom_points, notes, granted_by, church_id, recovery_release_id
  )
  select
    p_user_id, lesson.id, true, now(), p_available_until,
    10, 'Trilha de recuperação confirmatória', v_actor_id,
    v_target.church_id, v_release_id
  from public.lessons lesson
  join public.courses course on course.id = lesson.course_id
  where course.track_id is null
    and (course.church_id is null or course.church_id = v_target.church_id)
    and (lesson.church_id is null or lesson.church_id = v_target.church_id)
    and not exists (
      select 1 from public.lesson_progress progress
      where progress.user_id = p_user_id
        and progress.lesson_id = lesson.id
        and progress.is_completed = true
    )
  on conflict (user_id, lesson_id) do update set
    is_unlocked = true,
    available_from = excluded.available_from,
    available_until = excluded.available_until,
    custom_points = 10,
    notes = excluded.notes,
    granted_by = excluded.granted_by,
    church_id = excluded.church_id,
    recovery_release_id = excluded.recovery_release_id,
    updated_at = now();

  -- Only unfinished devotionals belonging to confirmatory lessons are exposed.
  insert into public.user_devotional_overrides (
    user_id, devotional_id, is_unlocked, available_from, available_until,
    custom_points, notes, granted_by, church_id, recovery_release_id
  )
  select
    p_user_id, devotional.id, true, now(), p_available_until,
    2, 'Trilha de recuperação confirmatória', v_actor_id,
    v_target.church_id, v_release_id
  from public.devotional_content devotional
  join public.lessons lesson on lesson.id = devotional.lesson_id
  join public.courses course on course.id = lesson.course_id
  where course.track_id is null
    and (course.church_id is null or course.church_id = v_target.church_id)
    and (lesson.church_id is null or lesson.church_id = v_target.church_id)
    and not exists (
      select 1 from public.devotional_progress progress
      where progress.user_id = p_user_id
        and progress.devotional_id = devotional.id
    )
  on conflict (user_id, devotional_id) do update set
    is_unlocked = true,
    available_from = excluded.available_from,
    available_until = excluded.available_until,
    custom_points = 2,
    notes = excluded.notes,
    granted_by = excluded.granted_by,
    church_id = excluded.church_id,
    recovery_release_id = excluded.recovery_release_id,
    updated_at = now();

  return v_release_id;
end;
$$;

create or replace function public.end_confirmatory_recovery(p_release_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_release public.confirmatory_recovery_releases%rowtype;
  v_actor public.profiles%rowtype;
  v_target public.profiles%rowtype;
begin
  if v_actor_id is null then
    raise exception 'Authentication required';
  end if;

  if not (
    public.has_role(v_actor_id, 'admin'::public.app_role)
    or public.has_role(v_actor_id, 'lider'::public.app_role)
  ) then
    raise exception 'Manager role required';
  end if;

  select * into v_release
  from public.confirmatory_recovery_releases
  where id = p_release_id;
  if not found then raise exception 'Recovery release not found'; end if;

  select * into v_actor from public.profiles where user_id = v_actor_id;
  select * into v_target from public.profiles where user_id = v_release.user_id;

  if not public.is_super_admin(v_actor_id)
    and (
      v_actor.church_id is distinct from v_target.church_id
      or v_actor.area is distinct from v_target.area
    ) then
    raise exception 'Target user is outside your area';
  end if;

  update public.confirmatory_recovery_releases
  set ended_at = coalesce(ended_at, now()), ended_by = coalesce(ended_by, v_actor_id)
  where id = p_release_id;

  update public.user_lesson_overrides
  set is_unlocked = false, updated_at = now()
  where recovery_release_id = p_release_id;

  update public.user_devotional_overrides
  set is_unlocked = false, updated_at = now()
  where recovery_release_id = p_release_id;
end;
$$;

revoke all on table public.confirmatory_recovery_releases from anon;
grant select on table public.confirmatory_recovery_releases to authenticated;
grant all on table public.confirmatory_recovery_releases to service_role;

revoke all on function public.start_confirmatory_recovery(uuid, timestamptz, text) from public, anon;
grant execute on function public.start_confirmatory_recovery(uuid, timestamptz, text) to authenticated, service_role;
revoke all on function public.end_confirmatory_recovery(uuid) from public, anon;
grant execute on function public.end_confirmatory_recovery(uuid) to authenticated, service_role;
