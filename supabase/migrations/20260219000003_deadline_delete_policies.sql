-- ============================================
-- Add DELETE policies for deadlines and reminders
-- Needed for idempotent deadline regeneration
-- ============================================

CREATE POLICY "Users can delete own deadlines"
  ON public.deadlines FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = deadlines.case_id AND cases.user_id = auth.uid()
  ));

-- Reminders cascade-delete when their parent deadline is deleted,
-- but add an explicit policy for direct deletion if needed.
CREATE POLICY "Users can delete own reminders"
  ON public.reminders FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    JOIN public.deadlines ON deadlines.case_id = cases.id
    WHERE deadlines.id = reminders.deadline_id AND cases.user_id = auth.uid()
  ));
