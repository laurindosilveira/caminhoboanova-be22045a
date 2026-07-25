-- A recovery window must never expose previous or future courses. It is
-- restricted to unfinished content from the course of the GC's next lesson,
-- and only to lessons before that next scheduled lesson.

create or replace function public.is_confirmatory_recovery_item_allowed(
  p_release_id uuid,
  p_lesson_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select
      item_lesson.course_id = cutoff.course_id
      and (
        coalesce(item_lesson.order_num, 0) < cutoff.lesson_order
        or (cutoff.is_inclusive and item_lesson.id = cutoff.lesson_id)
      )
    from public.confirmatory_recovery_releases release
    join public.profiles target on target.user_id = release.user_id
    join public.lessons item_lesson on item_lesson.id = p_lesson_id
    cross join lateral (
      select
        scheduled_course.id as course_id,
        coalesce(scheduled_lesson.order_num, 0) as lesson_order,
        scheduled_lesson.id as lesson_id,
        event.event_date <= now() as is_inclusive
      from public.events event
      join public.lessons scheduled_lesson on scheduled_lesson.id = event.linked_lesson_id
      join public.courses scheduled_course on scheduled_course.id = scheduled_lesson.course_id
      where scheduled_course.track_id is null
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
    where release.id = p_release_id
  ), false);
$$;

create or replace function public.enforce_recovery_lesson_scope()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.recovery_release_id is not null
    and new.is_unlocked
    and not public.is_confirmatory_recovery_item_allowed(
      new.recovery_release_id,
      new.lesson_id
    ) then
    new.is_unlocked := false;
  end if;
  return new;
end;
$$;

create or replace function public.enforce_recovery_devotional_scope()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lesson_id uuid;
begin
  if new.recovery_release_id is not null and new.is_unlocked then
    select devotional.lesson_id
    into v_lesson_id
    from public.devotional_content devotional
    where devotional.id = new.devotional_id;

    if v_lesson_id is null
      or not public.is_confirmatory_recovery_item_allowed(
        new.recovery_release_id,
        v_lesson_id
      ) then
      new.is_unlocked := false;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_recovery_lesson_scope_trigger
  on public.user_lesson_overrides;
create trigger enforce_recovery_lesson_scope_trigger
before insert or update of recovery_release_id, is_unlocked, lesson_id
on public.user_lesson_overrides
for each row execute function public.enforce_recovery_lesson_scope();

drop trigger if exists enforce_recovery_devotional_scope_trigger
  on public.user_devotional_overrides;
create trigger enforce_recovery_devotional_scope_trigger
before insert or update of recovery_release_id, is_unlocked, devotional_id
on public.user_devotional_overrides
for each row execute function public.enforce_recovery_devotional_scope();

-- Repair recovery windows that were already active.
update public.user_lesson_overrides override_row
set is_unlocked = false, updated_at = now()
where override_row.recovery_release_id is not null
  and override_row.is_unlocked
  and not public.is_confirmatory_recovery_item_allowed(
    override_row.recovery_release_id,
    override_row.lesson_id
  );

update public.user_devotional_overrides override_row
set is_unlocked = false, updated_at = now()
from public.devotional_content devotional
where override_row.recovery_release_id is not null
  and override_row.is_unlocked
  and devotional.id = override_row.devotional_id
  and (
    devotional.lesson_id is null
    or not public.is_confirmatory_recovery_item_allowed(
      override_row.recovery_release_id,
      devotional.lesson_id
    )
  );

revoke all on function public.is_confirmatory_recovery_item_allowed(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.enforce_recovery_lesson_scope()
  from public, anon, authenticated;
revoke all on function public.enforce_recovery_devotional_scope()
  from public, anon, authenticated;
