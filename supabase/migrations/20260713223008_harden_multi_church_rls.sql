-- Harden multi-church isolation by removing legacy broad policies that were
-- still OR'ed with the newer tenant-scoped RLS policies.

-- User-owned progress/attendance tables.
drop policy if exists "Admins and leaders can delete attendance" on public.attendance;
drop policy if exists "Admins and leaders can manage attendance in their area" on public.attendance;
drop policy if exists "Admins and leaders can delete devotional progress" on public.devotional_progress;
drop policy if exists "Admins and leaders can delete lesson responses" on public.lesson_responses;
drop policy if exists "Admins and leaders can delete user progress" on public.user_progress;
drop policy if exists "Admins and leaders can delete worship attendance" on public.worship_attendance;
drop policy if exists "Admins and leaders can delete worship attendance in area" on public.worship_attendance;
drop policy if exists "Admins can update worship attendance in area" on public.worship_attendance;

-- Broad role-only reads/writes that bypassed church_id.
drop policy if exists "Admins and leaders can insert achievement unlocks" on public.achievement_unlocks;
drop policy if exists "Admins can view all achievement unlocks" on public.achievement_unlocks;
drop policy if exists "Admins can manage achievement definitions" on public.achievement_definitions;
drop policy if exists "Admins can manage area pastors" on public.area_pastors;
drop policy if exists "Admins can manage challenges" on public.community_challenges;
drop policy if exists "Admins can manage course unlocks" on public.course_unlocks;
drop policy if exists "Admins can manage custom event types" on public.custom_event_types;
drop policy if exists "Admins can manage game config" on public.game_config;
drop policy if exists "Admins can manage leader guide" on public.leader_guide;
drop policy if exists "Admins can manage pairs" on public.prayer_pairs;
drop policy if exists "Admins can manage polls" on public.polls;
drop policy if exists "Admins can manage promotion requests" on public.year_promotion_requests;
drop policy if exists "Admins can manage push logs" on public.push_notification_log;
drop policy if exists "Admins can manage ranking seasons" on public.ranking_seasons;
drop policy if exists "Admins can manage removal logs" on public.activity_removal_log;
drop policy if exists "Admins can insert whatsapp reminder log" on public.whatsapp_reminder_log;
drop policy if exists "Admins can manage devotional overrides in area" on public.user_devotional_overrides;
drop policy if exists "Admins can manage evaluations in their area" on public.meeting_evaluations;
drop policy if exists "Admins can manage lesson overrides in area" on public.user_lesson_overrides;
drop policy if exists "Admins can view all leader notes" on public.leader_meeting_notes;
drop policy if exists "Admins can view all login logs" on public.login_audit_logs;
drop policy if exists "Admins can view all message views" on public.message_views;
drop policy if exists "Admins can view all push subscriptions" on public.push_subscriptions;
drop policy if exists "Admins can view all reminders" on public.push_activation_reminders;
drop policy if exists "Admins can view area participants progress" on public.user_progress;
drop policy if exists "Admins can view devotional responses in their area" on public.devotional_responses;
drop policy if exists "Admins can view lesson responses in their area" on public.lesson_responses;
drop policy if exists "Admins and lideres can edit push_automation_config" on public.push_automation_config;
drop policy if exists "Admins can update whatsapp reminder log" on public.whatsapp_reminder_log;
drop policy if exists "Leaders can view push logs" on public.push_notification_log;
drop policy if exists "Liders can insert removal logs" on public.activity_removal_log;
drop policy if exists "Liders can view removal logs" on public.activity_removal_log;
drop policy if exists "Users can view own whatsapp reminder log" on public.whatsapp_reminder_log;

-- Area-only profile policies are unsafe when different churches share area names.
drop policy if exists "Admins can update profiles in their area" on public.profiles;
drop policy if exists "Admins can view profiles in their area" on public.profiles;

-- Public/authenticated tenant-table reads that ignored church_id.
drop policy if exists "Authenticated users can read game config" on public.game_config;
drop policy if exists "Authenticated users can read push_automation_config" on public.push_automation_config;
drop policy if exists "Authenticated users can view area pastors" on public.area_pastors;
drop policy if exists "Authenticated users can view challenges" on public.community_challenges;
drop policy if exists "Authenticated users can view course unlocks" on public.course_unlocks;
drop policy if exists "Authenticated users can view custom event types" on public.custom_event_types;
drop policy if exists "Authenticated users can view devotional content" on public.devotional_content;
drop policy if exists "Authenticated users can view leader guide" on public.leader_guide;
drop policy if exists "Authenticated users can view turmas" on public.turmas;
drop policy if exists "Anyone can read achievement definitions" on public.achievement_definitions;

-- Legacy content/manage policies that granted all leaders/admins access across churches.
drop policy if exists "Admins can manage turmas" on public.turmas;
drop policy if exists "Admins can manage worship songs" on public.worship_songs;
drop policy if exists "Leaders can manage devotional content in their area" on public.devotional_content;
drop policy if exists "Leaders can manage events" on public.events;
drop policy if exists "Leaders can manage lesson content" on public.lesson_content;
drop policy if exists "Leaders can manage pairs" on public.prayer_pairs;
drop policy if exists "Leaders can manage polls" on public.polls;
drop policy if exists "Users can view pairs in their community" on public.prayer_pairs;
drop policy if exists "Users can update their own pair data" on public.prayer_pairs;

-- Event photos need the same tenant boundary as events and profiles.
drop policy if exists "Admins and leaders can update photos" on public.event_photos;
drop policy if exists "Admins can delete any photo" on public.event_photos;
drop policy if exists "Users can view approved photos" on public.event_photos;
drop policy if exists "Users can insert own photos" on public.event_photos;
drop policy if exists "Users can delete own photos" on public.event_photos;
drop policy if exists "Event photos tenant select" on public.event_photos;
drop policy if exists "Event photos own insert" on public.event_photos;
drop policy if exists "Event photos own delete" on public.event_photos;
drop policy if exists "Event photos tenant manage" on public.event_photos;

create policy "Event photos tenant select"
on public.event_photos
for select
to authenticated
using (
  public.is_super_admin(auth.uid())
  or (
    church_id = public.get_auth_church_id()
    and (
      status = 'aprovado'
      or user_id = auth.uid()
      or public.can_manage_church(church_id)
    )
  )
);

create policy "Event photos own insert"
on public.event_photos
for insert
to authenticated
with check (
  user_id = auth.uid()
  and church_id = public.get_auth_church_id()
);

create policy "Event photos own delete"
on public.event_photos
for delete
to authenticated
using (
  user_id = auth.uid()
  and church_id = public.get_auth_church_id()
);

create policy "Event photos tenant manage"
on public.event_photos
for all
to authenticated
using (public.can_manage_church(church_id))
with check (public.can_manage_church(church_id));

-- Tenant-scoped policies for configuration tables that were previously open
-- to every authenticated user. These names are distinct from the broad legacy
-- policies above so the migration is safe to re-run.
drop policy if exists "Push automation tenant select" on public.push_automation_config;
drop policy if exists "Push automation tenant manage" on public.push_automation_config;
create policy "Push automation tenant select"
on public.push_automation_config
for select
to authenticated
using (public.is_super_admin(auth.uid()) or church_id = public.get_auth_church_id());
create policy "Push automation tenant manage"
on public.push_automation_config
for all
to authenticated
using (public.can_manage_church(church_id))
with check (public.can_manage_church(church_id));

-- Keep audit logs church-scoped for church admins, while preserving super admin access.
drop policy if exists "Login audit tenant select" on public.login_audit_logs;
create policy "Login audit tenant select"
on public.login_audit_logs
for select
to authenticated
using (
  public.is_super_admin(auth.uid())
  or (
    church_id = public.get_auth_church_id()
    and public.can_manage_church(church_id)
  )
);

drop policy if exists "Prayer pairs tenant select" on public.prayer_pairs;
drop policy if exists "Prayer pairs own update" on public.prayer_pairs;
drop policy if exists "Prayer pairs tenant manage" on public.prayer_pairs;

create policy "Prayer pairs tenant select"
on public.prayer_pairs
for select
to authenticated
using (
  public.is_super_admin(auth.uid())
  or (
    church_id = public.get_auth_church_id()
    and (
      user_a_id = auth.uid()
      or user_b_id = auth.uid()
      or community = public.get_my_community()::text
      or public.can_manage_church(church_id)
    )
  )
);

create policy "Prayer pairs own update"
on public.prayer_pairs
for update
to authenticated
using (
  church_id = public.get_auth_church_id()
  and (user_a_id = auth.uid() or user_b_id = auth.uid())
)
with check (
  church_id = public.get_auth_church_id()
  and (user_a_id = auth.uid() or user_b_id = auth.uid())
);

create policy "Prayer pairs tenant manage"
on public.prayer_pairs
for all
to authenticated
using (public.can_manage_church(church_id))
with check (public.can_manage_church(church_id));

drop policy if exists "Activity removal tenant select" on public.activity_removal_log;
drop policy if exists "Activity removal tenant manage" on public.activity_removal_log;
create policy "Activity removal tenant select"
on public.activity_removal_log
for select
to authenticated
using (public.is_super_admin(auth.uid()) or public.can_manage_church(church_id));
create policy "Activity removal tenant manage"
on public.activity_removal_log
for all
to authenticated
using (public.can_manage_church(church_id))
with check (public.can_manage_church(church_id));

drop policy if exists "Push notification log tenant select" on public.push_notification_log;
drop policy if exists "Push notification log tenant manage" on public.push_notification_log;
create policy "Push notification log tenant select"
on public.push_notification_log
for select
to authenticated
using (public.is_super_admin(auth.uid()) or public.can_manage_church(church_id));
create policy "Push notification log tenant manage"
on public.push_notification_log
for all
to authenticated
using (public.can_manage_church(church_id))
with check (public.can_manage_church(church_id));

drop policy if exists "Whatsapp reminder log own or tenant select" on public.whatsapp_reminder_log;
drop policy if exists "Whatsapp reminder log tenant manage" on public.whatsapp_reminder_log;
create policy "Whatsapp reminder log own or tenant select"
on public.whatsapp_reminder_log
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_super_admin(auth.uid())
  or public.can_manage_church(church_id)
);
create policy "Whatsapp reminder log tenant manage"
on public.whatsapp_reminder_log
for all
to authenticated
using (public.can_manage_church(church_id))
with check (public.can_manage_church(church_id));
