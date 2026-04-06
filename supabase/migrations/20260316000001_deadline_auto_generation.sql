-- ============================================
-- Deadline Auto-Generation Support
-- Adds label, consequence, auto_generated to deadlines table.
-- Seeds escalation rules for new auto-generated deadline types.
-- ============================================

-- 1) Add new columns to deadlines
ALTER TABLE public.deadlines
  ADD COLUMN IF NOT EXISTS label text,
  ADD COLUMN IF NOT EXISTS consequence text,
  ADD COLUMN IF NOT EXISTS auto_generated boolean NOT NULL DEFAULT false;

-- 2) Add index for auto_generated deadline queries
CREATE INDEX IF NOT EXISTS idx_deadlines_auto_generated
  ON public.deadlines (case_id, auto_generated)
  WHERE auto_generated = true;

-- 3) Seed escalation rules for service_deadline
INSERT INTO public.escalation_rules (deadline_key, level, offset_days, condition_type, condition_key, message_template) VALUES
  ('service_deadline', 1, 30, 'always', NULL,
   'You have 60 days left to serve the other party. Start planning service now.'),
  ('service_deadline', 2, 14, 'no_event', 'defendant_served',
   'Your service deadline is in {due_date}. The other party has not been served yet.'),
  ('service_deadline', 3, 7, 'no_event', 'defendant_served',
   'Only 7 days left to serve the other party. Your case could be dismissed if service is not completed by {due_date}.')
ON CONFLICT (deadline_key, level) DO NOTHING;

-- 4) Seed escalation rules for answer_deadline_estimated
INSERT INTO public.escalation_rules (deadline_key, level, offset_days, condition_type, condition_key, message_template) VALUES
  ('answer_deadline_estimated', 1, 7, 'always', NULL,
   'The estimated answer deadline is {due_date}. Confirm the exact date from your citation.'),
  ('answer_deadline_estimated', 2, 3, 'no_event', 'answer_deadline_confirmed_event',
   'The answer deadline is in {due_date}. Please confirm the exact date.'),
  ('answer_deadline_estimated', 3, 1, 'no_event', 'answer_deadline_confirmed_event',
   'The answer deadline is tomorrow ({due_date}). Confirm or update this date.')
ON CONFLICT (deadline_key, level) DO NOTHING;

-- 5) Seed escalation rules for divorce_waiting_period
INSERT INTO public.escalation_rules (deadline_key, level, offset_days, condition_type, condition_key, message_template) VALUES
  ('divorce_waiting_period', 1, 7, 'always', NULL,
   'The 60-day waiting period ends on {due_date}. You can begin preparing for the final hearing.'),
  ('divorce_waiting_period', 2, 1, 'always', NULL,
   'The 60-day waiting period ends tomorrow ({due_date}). You may now schedule a final hearing.')
ON CONFLICT (deadline_key, level) DO NOTHING;

-- 6) Seed escalation rules for po_full_hearing
INSERT INTO public.escalation_rules (deadline_key, level, offset_days, condition_type, condition_key, message_template) VALUES
  ('po_full_hearing', 1, 7, 'always', NULL,
   'Your protective order hearing must be held by {due_date}. Contact the court to confirm the hearing date.'),
  ('po_full_hearing', 2, 3, 'always', NULL,
   'Your protective order hearing is in 3 days ({due_date}). Prepare your evidence and testimony.'),
  ('po_full_hearing', 3, 1, 'always', NULL,
   'Your protective order hearing is tomorrow ({due_date}). Make sure you have all documents ready.')
ON CONFLICT (deadline_key, level) DO NOTHING;
