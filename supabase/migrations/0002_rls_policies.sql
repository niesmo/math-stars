-- Enable RLS on all public tables
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- teachers
-- A teacher can only read and update their own row.
-- Insert/delete is handled server-side via service role.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "teachers: read own row" ON public.teachers;
CREATE POLICY "teachers: read own row"
  ON public.teachers FOR SELECT
  USING (auth.uid() = auth_id);

DROP POLICY IF EXISTS "teachers: update own row" ON public.teachers;
CREATE POLICY "teachers: update own row"
  ON public.teachers FOR UPDATE
  USING (auth.uid() = auth_id);

-- ---------------------------------------------------------------------------
-- classes
-- Teachers can manage their own classes.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "classes: teacher can read own classes" ON public.classes;
CREATE POLICY "classes: teacher can read own classes"
  ON public.classes FOR SELECT
  USING (
    teacher_id IN (
      SELECT id FROM public.teachers WHERE auth_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "classes: teacher can insert own classes" ON public.classes;
CREATE POLICY "classes: teacher can insert own classes"
  ON public.classes FOR INSERT
  WITH CHECK (
    teacher_id IN (
      SELECT id FROM public.teachers WHERE auth_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "classes: teacher can update own classes" ON public.classes;
CREATE POLICY "classes: teacher can update own classes"
  ON public.classes FOR UPDATE
  USING (
    teacher_id IN (
      SELECT id FROM public.teachers WHERE auth_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "classes: teacher can delete own classes" ON public.classes;
CREATE POLICY "classes: teacher can delete own classes"
  ON public.classes FOR DELETE
  USING (
    teacher_id IN (
      SELECT id FROM public.teachers WHERE auth_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- skill_levels
-- Public read-only — every client can read skill levels.
-- Writes only via service role (seeding).
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "skill_levels: public read" ON public.skill_levels;
CREATE POLICY "skill_levels: public read"
  ON public.skill_levels FOR SELECT
  USING (true);

-- ---------------------------------------------------------------------------
-- badges
-- Public read-only.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "badges: public read" ON public.badges;
CREATE POLICY "badges: public read"
  ON public.badges FOR SELECT
  USING (true);

-- ---------------------------------------------------------------------------
-- students, student_progress, practice_sessions, practice_attempts,
-- student_badges
--
-- Accessed exclusively through server-side API routes using the service role
-- key, which bypasses RLS. No direct client access permitted.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "students: no direct client access" ON public.students;
CREATE POLICY "students: no direct client access"
  ON public.students FOR ALL
  USING (false);

DROP POLICY IF EXISTS "student_progress: no direct client access" ON public.student_progress;
CREATE POLICY "student_progress: no direct client access"
  ON public.student_progress FOR ALL
  USING (false);

DROP POLICY IF EXISTS "practice_sessions: no direct client access" ON public.practice_sessions;
CREATE POLICY "practice_sessions: no direct client access"
  ON public.practice_sessions FOR ALL
  USING (false);

DROP POLICY IF EXISTS "practice_attempts: no direct client access" ON public.practice_attempts;
CREATE POLICY "practice_attempts: no direct client access"
  ON public.practice_attempts FOR ALL
  USING (false);

DROP POLICY IF EXISTS "student_badges: no direct client access" ON public.student_badges;
CREATE POLICY "student_badges: no direct client access"
  ON public.student_badges FOR ALL
  USING (false);

-- ---------------------------------------------------------------------------
-- leaderboard_entries
-- Public read (leaderboard is visible to everyone).
-- Writes only via service role (cron + session end server action).
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "leaderboard_entries: public read" ON public.leaderboard_entries;
CREATE POLICY "leaderboard_entries: public read"
  ON public.leaderboard_entries FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "leaderboard_entries: no direct client writes" ON public.leaderboard_entries;
CREATE POLICY "leaderboard_entries: no direct client writes"
  ON public.leaderboard_entries FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "leaderboard_entries: no direct client updates" ON public.leaderboard_entries;
CREATE POLICY "leaderboard_entries: no direct client updates"
  ON public.leaderboard_entries FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "leaderboard_entries: no direct client deletes" ON public.leaderboard_entries;
CREATE POLICY "leaderboard_entries: no direct client deletes"
  ON public.leaderboard_entries FOR DELETE
  USING (false);
