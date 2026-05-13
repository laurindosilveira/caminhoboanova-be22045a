-- Attendance confirmation idempotency.
-- One event attendance row per user; both user and leader can confirm,
-- but ranking points are still computed from a single final attendance row.

alter table public.attendance
  add column if not exists confirmation_source text,
  add column if not exists confirmed_by uuid,
  add column if not exists user_requested_at timestamptz,
  add column if not exists leader_confirmed_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'attendance_confirmation_source_check'
      and conrelid = 'public.attendance'::regclass
  ) then
    alter table public.attendance
      add constraint attendance_confirmation_source_check
      check (
        confirmation_source is null
        or confirmation_source in ('user', 'leader', 'both')
      );
  end if;
end $$;

update public.attendance
set confirmation_source = case
  when status in ('pendente_presente', 'pendente_falta') then 'user'
  when status in ('presente', 'faltou', 'justificou') then 'leader'
  else confirmation_source
end
where confirmation_source is null;

update public.attendance
set user_requested_at = created_at
where user_requested_at is null
  and confirmation_source in ('user', 'both');

update public.attendance
set leader_confirmed_at = created_at
where leader_confirmed_at is null
  and status in ('presente', 'faltou', 'justificou');

-- If old rows were duplicated before the unique constraint existed, keep the
-- most useful/final record and remove the rest before enforcing uniqueness.
with ranked as (
  select
    id,
    row_number() over (
      partition by event_id, user_id
      order by
        case status
          when 'presente' then 1
          when 'justificou' then 2
          when 'faltou' then 3
          when 'pendente_presente' then 4
          when 'pendente_falta' then 5
          else 6
        end,
        created_at asc
    ) as rn
  from public.attendance
)
delete from public.attendance a
using ranked r
where a.id = r.id
  and r.rn > 1;

create unique index if not exists attendance_event_user_unique_idx
  on public.attendance(event_id, user_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'attendance_event_user_unique'
      and conrelid = 'public.attendance'::regclass
  ) then
    alter table public.attendance
      add constraint attendance_event_user_unique
      unique using index attendance_event_user_unique_idx;
  end if;
exception
  when duplicate_object then
    null;
end $$;