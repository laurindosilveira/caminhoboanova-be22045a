-- Recovery may expose only unfinished confirmatory content that the user's GC
-- has already reached. The next scheduled lesson is the exclusive cutoff.

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
  v_cutoff_course_order integer;
  v_cutoff_lesson_order integer;
  v_cutoff_lesson_id uuid;
  v_cutoff_inclusive boolean;
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

  if v_target.turma_id is null then
    raise exception 'Target user has no growth group';
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

  -- Prefer the closest future lesson. If no future lesson exists, use the
  -- latest lesson already scheduled for this GC as an inclusive cutoff.
  select
    coalesce(course.order_num, 0),
    coalesce(lesson.order_num, 0),
    lesson.id,
    event.event_date <= now()
  into
    v_cutoff_course_order,
    v_cutoff_lesson_order,
    v_cutoff_lesson_id,
    v_cutoff_inclusive
  from public.events event
  join public.lessons lesson on lesson.id = event.linked_lesson_id
  join public.courses course on course.id = lesson.course_id
  where course.track_id is null
    and (event.church_id is null or event.church_id = v_target.church_id)
    and (event.target_user_id is null or event.target_user_id = p_user_id)
    and (
      event.turma_id = v_target.turma_id
      or (
        event.turma_id is null
        and event.area is not distinct from v_target.area::text
        and (event.community is null or event.community is not distinct from v_target.community::text)
      )
    )
  order by
    (event.event_date > now()) desc,
    case when event.event_date > now() then event.event_date end asc,
    case when event.event_date <= now() then event.event_date end desc
  limit 1;

  if v_cutoff_lesson_id is null then
    raise exception 'No scheduled confirmatory lesson found for this growth group';
  end if;

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
    and (
      coalesce(course.order_num, 0) < v_cutoff_course_order
      or (
        coalesce(course.order_num, 0) = v_cutoff_course_order
        and coalesce(lesson.order_num, 0) < v_cutoff_lesson_order
      )
      or (v_cutoff_inclusive and lesson.id = v_cutoff_lesson_id)
    )
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
    and (
      coalesce(course.order_num, 0) < v_cutoff_course_order
      or (
        coalesce(course.order_num, 0) = v_cutoff_course_order
        and coalesce(lesson.order_num, 0) < v_cutoff_lesson_order
      )
      or (v_cutoff_inclusive and lesson.id = v_cutoff_lesson_id)
    )
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

revoke all on function public.start_confirmatory_recovery(uuid, timestamptz, text) from public, anon;
grant execute on function public.start_confirmatory_recovery(uuid, timestamptz, text) to authenticated, service_role;

-- Correct releases that were already open when this rule was introduced.
with release_cutoffs as (
  select
    release.id as release_id,
    cutoff.course_order,
    cutoff.lesson_order,
    cutoff.lesson_id,
    cutoff.is_inclusive
  from public.confirmatory_recovery_releases release
  join public.profiles target on target.user_id = release.user_id
  cross join lateral (
    select
      coalesce(course.order_num, 0) as course_order,
      coalesce(lesson.order_num, 0) as lesson_order,
      lesson.id as lesson_id,
      event.event_date <= now() as is_inclusive
    from public.events event
    join public.lessons lesson on lesson.id = event.linked_lesson_id
    join public.courses course on course.id = lesson.course_id
    where course.track_id is null
      and (event.church_id is null or event.church_id = target.church_id)
      and (event.target_user_id is null or event.target_user_id = target.user_id)
      and (
        event.turma_id = target.turma_id
        or (
          event.turma_id is null
          and event.area is not distinct from target.area::text
          and (event.community is null or event.community is not distinct from target.community::text)
        )
      )
    order by
      (event.event_date > now()) desc,
      case when event.event_date > now() then event.event_date end asc,
      case when event.event_date <= now() then event.event_date end desc
    limit 1
  ) cutoff
  where release.ended_at is null
)
update public.user_lesson_overrides override_row
set is_unlocked = false, updated_at = now()
from release_cutoffs cutoff, public.lessons lesson, public.courses course
where override_row.recovery_release_id = cutoff.release_id
  and override_row.lesson_id = lesson.id
  and lesson.course_id = course.id
  and not (
    coalesce(course.order_num, 0) < cutoff.course_order
    or (
      coalesce(course.order_num, 0) = cutoff.course_order
      and coalesce(lesson.order_num, 0) < cutoff.lesson_order
    )
    or (cutoff.is_inclusive and lesson.id = cutoff.lesson_id)
  );

with release_cutoffs as (
  select
    release.id as release_id,
    cutoff.course_order,
    cutoff.lesson_order,
    cutoff.lesson_id,
    cutoff.is_inclusive
  from public.confirmatory_recovery_releases release
  join public.profiles target on target.user_id = release.user_id
  cross join lateral (
    select
      coalesce(course.order_num, 0) as course_order,
      coalesce(lesson.order_num, 0) as lesson_order,
      lesson.id as lesson_id,
      event.event_date <= now() as is_inclusive
    from public.events event
    join public.lessons lesson on lesson.id = event.linked_lesson_id
    join public.courses course on course.id = lesson.course_id
    where course.track_id is null
      and (event.church_id is null or event.church_id = target.church_id)
      and (event.target_user_id is null or event.target_user_id = target.user_id)
      and (
        event.turma_id = target.turma_id
        or (
          event.turma_id is null
          and event.area is not distinct from target.area::text
          and (event.community is null or event.community is not distinct from target.community::text)
        )
      )
    order by
      (event.event_date > now()) desc,
      case when event.event_date > now() then event.event_date end asc,
      case when event.event_date <= now() then event.event_date end desc
    limit 1
  ) cutoff
  where release.ended_at is null
)
update public.user_devotional_overrides override_row
set is_unlocked = false, updated_at = now()
from release_cutoffs cutoff, public.devotional_content devotional, public.lessons lesson, public.courses course
where override_row.recovery_release_id = cutoff.release_id
  and override_row.devotional_id = devotional.id
  and devotional.lesson_id = lesson.id
  and lesson.course_id = course.id
  and not (
    coalesce(course.order_num, 0) < cutoff.course_order
    or (
      coalesce(course.order_num, 0) = cutoff.course_order
      and coalesce(lesson.order_num, 0) < cutoff.lesson_order
    )
    or (cutoff.is_inclusive and lesson.id = cutoff.lesson_id)
  );
