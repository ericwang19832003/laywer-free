-- ============================================
-- BACKBONE TABLES for TurboTax Case Dashboard
-- ============================================

-- 1) cases
CREATE TABLE public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  jurisdiction text DEFAULT 'TX',
  county text,
  court_type text CHECK (court_type IN ('jp', 'county', 'district', 'unknown')) DEFAULT 'unknown',
  role text CHECK (role IN ('plaintiff', 'defendant')) NOT NULL,
  dispute_type text,
  status text CHECK (status IN ('active', 'archived')) DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- 2) tasks
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  task_key text NOT NULL,
  title text NOT NULL,
  status text CHECK (status IN ('locked', 'todo', 'in_progress', 'needs_review', 'completed', 'skipped')) DEFAULT 'locked',
  due_at timestamptz,
  unlocked_at timestamptz,
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 3) task_events (timeline)
CREATE TABLE public.task_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  kind text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 4) deadlines
CREATE TABLE public.deadlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  key text NOT NULL,
  due_at timestamptz NOT NULL,
  source text CHECK (source IN ('system', 'user_confirmed', 'court_notice')) DEFAULT 'system',
  rationale text,
  created_at timestamptz DEFAULT now()
);

-- 5) reminders
CREATE TABLE public.reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  deadline_id uuid REFERENCES public.deadlines(id) ON DELETE CASCADE NOT NULL,
  channel text CHECK (channel IN ('email', 'push')) DEFAULT 'email',
  send_at timestamptz NOT NULL,
  status text CHECK (status IN ('scheduled', 'sent', 'skipped', 'failed')) DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_cases_user_created ON public.cases (user_id, created_at DESC);
CREATE INDEX idx_tasks_case_status_due ON public.tasks (case_id, status, due_at);
CREATE INDEX idx_task_events_case_created ON public.task_events (case_id, created_at DESC);
CREATE INDEX idx_deadlines_case_due ON public.deadlines (case_id, due_at);
CREATE INDEX idx_reminders_status_send ON public.reminders (status, send_at);

-- ============================================
-- RLS
-- ============================================

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- cases: direct user_id check
CREATE POLICY "Users can view own cases"
  ON public.cases FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own cases"
  ON public.cases FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own cases"
  ON public.cases FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- tasks: join through cases
CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases WHERE cases.id = tasks.case_id AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases WHERE cases.id = tasks.case_id AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.cases WHERE cases.id = tasks.case_id AND cases.user_id = auth.uid()
  ));

-- task_events: join through cases
CREATE POLICY "Users can view own events"
  ON public.task_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases WHERE cases.id = task_events.case_id AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own events"
  ON public.task_events FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases WHERE cases.id = task_events.case_id AND cases.user_id = auth.uid()
  ));

-- deadlines: join through cases
CREATE POLICY "Users can view own deadlines"
  ON public.deadlines FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases WHERE cases.id = deadlines.case_id AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own deadlines"
  ON public.deadlines FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases WHERE cases.id = deadlines.case_id AND cases.user_id = auth.uid()
  ));

-- reminders: join through cases via deadlines
CREATE POLICY "Users can view own reminders"
  ON public.reminders FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    JOIN public.deadlines ON deadlines.case_id = cases.id
    WHERE deadlines.id = reminders.deadline_id AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own reminders"
  ON public.reminders FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    JOIN public.deadlines ON deadlines.case_id = cases.id
    WHERE deadlines.id = reminders.deadline_id AND cases.user_id = auth.uid()
  ));
