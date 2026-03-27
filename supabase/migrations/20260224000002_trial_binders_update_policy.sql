-- ============================================
-- Trial Binders — UPDATE policy for build pipeline
-- ============================================

CREATE POLICY "Users can update own trial binders"
  ON public.trial_binders FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = trial_binders.case_id
      AND cases.user_id = auth.uid()
  ));
