-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_turma_id ON public.profiles(turma_id);
CREATE INDEX IF NOT EXISTS idx_profiles_area ON public.profiles(area);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles(full_name);

-- Attendance
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON public.attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_created_at ON public.attendance(created_at);

-- Devotional Progress
CREATE INDEX IF NOT EXISTS idx_devotional_progress_user_id ON public.devotional_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_devotional_progress_completed_at ON public.devotional_progress(completed_at);

-- Lesson Responses
CREATE INDEX IF NOT EXISTS idx_lesson_responses_user_id ON public.lesson_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_responses_created_at ON public.lesson_responses(created_at);

-- User Progress
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);

-- User Roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Discipleship Plans
CREATE INDEX IF NOT EXISTS idx_discipleship_plans_user_id ON public.discipleship_plans(user_id);
