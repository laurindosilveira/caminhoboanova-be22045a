-- Performance pass for high-traffic tenant-scoped paths.
-- This migration only changes indexes/constraints. It does not update or delete user data.

do $$
begin
  if to_regclass('public.attendance_event_id_user_id_key') is not null then
    alter table public.attendance
      drop constraint if exists attendance_event_user_unique;

    drop index if exists public.attendance_event_user_unique_idx;
  end if;
end $$;

create index if not exists idx_profiles_church_id
  on public.profiles (church_id);

create index if not exists idx_profiles_church_enrollment_turma
  on public.profiles (church_id, enrollment_status, turma_id);

create index if not exists idx_profiles_turma_id
  on public.profiles (turma_id);

create index if not exists idx_profiles_enrollment_updated_by
  on public.profiles (enrollment_status_updated_by);

create index if not exists idx_user_roles_church_user_role
  on public.user_roles (church_id, user_id, role);

create index if not exists idx_attendance_user_church
  on public.attendance (user_id, church_id);

create index if not exists idx_attendance_church_created_at
  on public.attendance (church_id, created_at desc);

create index if not exists idx_lesson_progress_church_user
  on public.lesson_progress (church_id, user_id);

create index if not exists idx_lesson_progress_lesson_id
  on public.lesson_progress (lesson_id);

create index if not exists idx_lesson_progress_override_release_id
  on public.lesson_progress (override_release_id)
  where override_release_id is not null;

create index if not exists idx_lesson_responses_church_user
  on public.lesson_responses (church_id, user_id);

create index if not exists idx_lesson_responses_override_release_id
  on public.lesson_responses (override_release_id)
  where override_release_id is not null;

create index if not exists idx_devotional_progress_church_user
  on public.devotional_progress (church_id, user_id);

create index if not exists idx_devotional_progress_devotional_id
  on public.devotional_progress (devotional_id);

create index if not exists idx_devotional_progress_override_release_id
  on public.devotional_progress (override_release_id)
  where override_release_id is not null;

create index if not exists idx_devotional_responses_church_user
  on public.devotional_responses (church_id, user_id);

create index if not exists idx_user_progress_church_user
  on public.user_progress (church_id, user_id);

create index if not exists idx_user_progress_activity_id
  on public.user_progress (activity_id);

create index if not exists idx_achievement_unlocks_church_user
  on public.achievement_unlocks (church_id, user_id);

create index if not exists idx_push_subscriptions_church_user
  on public.push_subscriptions (church_id, user_id);

create index if not exists idx_notification_preferences_church_user
  on public.notification_preferences (church_id, user_id);

create index if not exists idx_community_chat_church_created_at
  on public.community_chat (church_id, created_at desc);

create index if not exists idx_community_chat_reply_to
  on public.community_chat (reply_to)
  where reply_to is not null;

create index if not exists idx_prayer_requests_church_created_at
  on public.prayer_requests (church_id, created_at desc);

create index if not exists idx_prayer_requests_turma_id
  on public.prayer_requests (turma_id)
  where turma_id is not null;

create index if not exists idx_events_church_event_date
  on public.events (church_id, event_date desc);

create index if not exists idx_events_created_by
  on public.events (created_by)
  where created_by is not null;

create index if not exists idx_events_linked_lesson_id
  on public.events (linked_lesson_id)
  where linked_lesson_id is not null;

create index if not exists idx_events_target_user_id
  on public.events (target_user_id)
  where target_user_id is not null;

create index if not exists idx_messages_church_created_at
  on public.messages (church_id, created_at desc);

create index if not exists idx_messages_sent_by
  on public.messages (sent_by)
  where sent_by is not null;

create index if not exists idx_messages_turma_id
  on public.messages (turma_id)
  where turma_id is not null;

create index if not exists idx_login_audit_logs_church_created_at
  on public.login_audit_logs (church_id, created_at desc);

create index if not exists idx_church_subscriptions_church_id
  on public.church_subscriptions (church_id);

create index if not exists idx_ranking_validation_logs_user_id
  on public.ranking_validation_logs (user_id);

create index if not exists idx_devotional_content_worship_song_id
  on public.devotional_content (worship_song_id)
  where worship_song_id is not null;

create index if not exists idx_devotional_content_church_lesson
  on public.devotional_content (church_id, lesson_id)
  where lesson_id is not null;

create index if not exists idx_global_course_releases_church_id
  on public.global_course_releases (church_id);

create index if not exists idx_global_course_releases_released_by
  on public.global_course_releases (released_by)
  where released_by is not null;

create index if not exists idx_lessons_course_id
  on public.lessons (course_id);

create index if not exists idx_lessons_module_id
  on public.lessons (module_id)
  where module_id is not null;

create index if not exists idx_areas_created_by
  on public.areas (created_by)
  where created_by is not null;

create index if not exists idx_communities_created_by
  on public.communities (created_by)
  where created_by is not null;

create index if not exists idx_communities_area_id
  on public.communities (area_id);

create index if not exists idx_custom_event_types_created_by
  on public.custom_event_types (created_by)
  where created_by is not null;

create index if not exists idx_authorized_system_admins_created_by
  on public.authorized_system_admins (created_by)
  where created_by is not null;

do $$
begin
  if to_regclass('public.bonus_removal_log') is not null then
    execute 'create index if not exists idx_bonus_removal_log_achievement_id on public.bonus_removal_log (achievement_id) where achievement_id is not null';
    execute 'create index if not exists idx_bonus_removal_log_removed_by on public.bonus_removal_log (removed_by) where removed_by is not null';
    execute 'create index if not exists idx_bonus_removal_log_target_user_id on public.bonus_removal_log (target_user_id) where target_user_id is not null';
  end if;
end $$;

create index if not exists idx_church_audit_logs_church_id
  on public.church_audit_logs (church_id);

create index if not exists idx_devotional_worship_songs_song_id
  on public.devotional_worship_songs (worship_song_id);

create index if not exists idx_event_photos_event_id
  on public.event_photos (event_id);

create index if not exists idx_notifications_user_id
  on public.notifications (user_id);

create index if not exists idx_pastoral_notes_admin_id
  on public.pastoral_notes (admin_id)
  where admin_id is not null;

create index if not exists idx_pastoral_notes_user_id
  on public.pastoral_notes (user_id);

create index if not exists idx_plan_history_changed_by
  on public.plan_history (changed_by)
  where changed_by is not null;

create index if not exists idx_plan_history_church_id
  on public.plan_history (church_id);

create index if not exists idx_prayer_diary_request_id
  on public.prayer_diary (request_id);

create index if not exists idx_prayer_interactions_request_id
  on public.prayer_interactions (request_id);

create index if not exists idx_privacy_requests_resolved_by
  on public.privacy_requests (resolved_by)
  where resolved_by is not null;

create index if not exists idx_profession_records_performed_by
  on public.profession_of_faith_records (performed_by)
  where performed_by is not null;

create index if not exists idx_push_scheduled_created_by
  on public.push_scheduled (created_by)
  where created_by is not null;

create index if not exists idx_ranking_exclusions_excluded_by
  on public.ranking_exclusions (excluded_by)
  where excluded_by is not null;

create index if not exists idx_stripe_webhook_logs_subscription_id
  on public.stripe_webhook_logs (church_subscription_id)
  where church_subscription_id is not null;

create index if not exists idx_system_admin_audit_logs_admin_id
  on public.system_admin_audit_logs (admin_id);

do $$
begin
  if to_regclass('public.system_update_log') is not null then
    execute 'create index if not exists idx_system_update_log_created_by on public.system_update_log (created_by) where created_by is not null';
  end if;
end $$;

create index if not exists idx_turma_lesson_content_church_id
  on public.turma_lesson_content (church_id);

create index if not exists idx_turma_lesson_content_lesson_id
  on public.turma_lesson_content (lesson_id);

create index if not exists idx_user_devotional_overrides_granted_by
  on public.user_devotional_overrides (granted_by)
  where granted_by is not null;

do $$
begin
  if to_regclass('public.user_lesson_overrides_church_id_idx') is null then
    execute 'create index if not exists idx_user_lesson_overrides_church_id on public.user_lesson_overrides (church_id)';
  end if;
end $$;

create index if not exists idx_user_lesson_overrides_granted_by
  on public.user_lesson_overrides (granted_by)
  where granted_by is not null;

create index if not exists idx_user_lesson_overrides_lesson_id
  on public.user_lesson_overrides (lesson_id);

create index if not exists idx_whatsapp_reminder_log_resent_by
  on public.whatsapp_reminder_log (resent_by)
  where resent_by is not null;

create index if not exists idx_year_promotion_requests_turma_id
  on public.year_promotion_requests (turma_id)
  where turma_id is not null;

create index if not exists idx_activity_removal_log_activity_id
  on public.activity_removal_log (activity_id);

create index if not exists idx_activity_removal_log_target_user_id
  on public.activity_removal_log (target_user_id)
  where target_user_id is not null;

create index if not exists idx_blocked_registration_attempts_church_id
  on public.blocked_registration_attempts (church_id)
  where church_id is not null;

do $$
begin
  if to_regclass('public.bonus_grant_log') is not null then
    execute 'create index if not exists idx_bonus_grant_log_target_user_id on public.bonus_grant_log (target_user_id)';
  end if;
end $$;

create index if not exists idx_challenge_participants_user_id
  on public.challenge_participants (user_id);

create index if not exists idx_community_challenges_created_by
  on public.community_challenges (created_by)
  where created_by is not null;

create index if not exists idx_community_chat_user_id
  on public.community_chat (user_id);

create index if not exists idx_devotional_responses_devotional_id
  on public.devotional_responses (devotional_id);

create index if not exists idx_event_photos_user_id
  on public.event_photos (user_id);

create index if not exists idx_frontend_error_logs_church_id
  on public.frontend_error_logs (church_id)
  where church_id is not null;

create index if not exists idx_frontend_error_logs_user_id
  on public.frontend_error_logs (user_id)
  where user_id is not null;

create index if not exists idx_lesson_responses_lesson_id
  on public.lesson_responses (lesson_id);

create index if not exists idx_meeting_evaluations_user_id
  on public.meeting_evaluations (user_id);

create index if not exists idx_message_reactions_user_id
  on public.message_reactions (user_id);

create index if not exists idx_message_views_user_id
  on public.message_views (user_id);

create index if not exists idx_poll_votes_user_id
  on public.poll_votes (user_id);

create index if not exists idx_polls_created_by
  on public.polls (created_by)
  where created_by is not null;

create index if not exists idx_prayer_diary_turma_id
  on public.prayer_diary (turma_id)
  where turma_id is not null;

create index if not exists idx_profession_records_church_id
  on public.profession_of_faith_records (church_id);

create index if not exists idx_profession_records_turma_id
  on public.profession_of_faith_records (turma_id)
  where turma_id is not null;

create index if not exists idx_profession_records_user_id
  on public.profession_of_faith_records (user_id);

create index if not exists idx_push_activation_reminders_target_user
  on public.push_activation_reminders (target_user_id);

create index if not exists idx_ranking_validation_logs_church_id
  on public.ranking_validation_logs (church_id);

create index if not exists idx_testimonies_user_id
  on public.testimonies (user_id);

create index if not exists idx_turma_lesson_content_created_by
  on public.turma_lesson_content (created_by)
  where created_by is not null;

create index if not exists idx_turmas_created_by
  on public.turmas (created_by)
  where created_by is not null;

create index if not exists idx_worship_attendance_user_id
  on public.worship_attendance (user_id);

create index if not exists idx_year_promotion_requests_user_id
  on public.year_promotion_requests (user_id);
