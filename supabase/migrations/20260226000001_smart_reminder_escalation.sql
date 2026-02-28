-- ============================================
-- Smart Reminder Escalation
-- Configurable multi-level reminders that fire at different offsets
-- before a deadline, with optional conditions.
-- ============================================

-- 1) escalation_rules — system config, not per-user
CREATE TABLE public.escalation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deadline_key text NOT NULL,
  level int NOT NULL,
  offset_days int NOT NULL,
  condition_type text NOT NULL
    CHECK (condition_type IN ('always', 'no_event', 'status_not_changed'))
    DEFAULT 'always',
  condition_key text,
  message_template text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (deadline_key, level)
);

-- 2) reminder_escalations — per-case instance data
CREATE TABLE public.reminder_escalations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  deadline_id uuid NOT NULL REFERENCES public.deadlines(id) ON DELETE CASCADE,
  escalation_level int NOT NULL,
  message text NOT NULL,
  triggered_at timestamptz NOT NULL,
  acknowledged boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_escalation_rules_key_offset
  ON public.escalation_rules (deadline_key, offset_days);

CREATE INDEX idx_reminder_escalations_case_triggered
  ON public.reminder_escalations (case_id, triggered_at DESC);

-- ============================================
-- RLS
-- ============================================

ALTER TABLE public.escalation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_escalations ENABLE ROW LEVEL SECURITY;

-- escalation_rules: read-only for authenticated users (system config)
CREATE POLICY "Authenticated users can read escalation rules"
  ON public.escalation_rules FOR SELECT
  TO authenticated
  USING (true);

-- No INSERT/UPDATE/DELETE policies for authenticated role.
-- Only service_role (bypasses RLS) can modify rows.

-- reminder_escalations: case-owner read/write
CREATE POLICY "Users can view own reminder escalations"
  ON public.reminder_escalations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = reminder_escalations.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own reminder escalations"
  ON public.reminder_escalations FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = reminder_escalations.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own reminder escalations"
  ON public.reminder_escalations FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = reminder_escalations.case_id
      AND cases.user_id = auth.uid()
  ));

-- No DELETE policy — escalations are immutable audit records.

-- ============================================
-- Seed: escalation rules for two deadline types
-- ============================================

INSERT INTO public.escalation_rules (deadline_key, level, offset_days, condition_type, condition_key, message_template) VALUES
  -- answer_deadline_confirmed
  ('answer_deadline_confirmed', 1, 7, 'always', NULL,
   'Your answer deadline is in {due_date}. Start preparing your response.'),
  ('answer_deadline_confirmed', 2, 3, 'no_event', 'answer_filed',
   'Your answer deadline is in {due_date}. No answer has been filed yet.'),
  ('answer_deadline_confirmed', 3, 1, 'no_event', 'answer_filed',
   'URGENT: Your answer deadline is tomorrow ({due_date}). Missing this deadline may result in a default judgment.'),

  -- discovery_response_due_confirmed
  ('discovery_response_due_confirmed', 1, 7, 'always', NULL,
   'Discovery responses are due in {due_date}. Review what you need to prepare.'),
  ('discovery_response_due_confirmed', 2, 3, 'no_event', 'discovery_response_uploaded',
   'Discovery responses are due in {due_date}. No responses have been uploaded yet.'),
  ('discovery_response_due_confirmed', 3, 1, 'no_event', 'discovery_response_uploaded',
   'URGENT: Discovery responses are due tomorrow ({due_date}). Prepare and upload your responses now.');
