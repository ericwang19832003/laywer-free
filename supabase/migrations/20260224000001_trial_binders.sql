-- ============================================
-- Trial Binder Generator v1 — storage table
-- ============================================

-- ── Table ────────────────────────────────────

CREATE TABLE public.trial_binders (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id         uuid        REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  exhibit_set_id  uuid        REFERENCES public.exhibit_sets(id) ON DELETE SET NULL,
  title           text        NOT NULL DEFAULT 'Trial Binder',
  status          text        NOT NULL DEFAULT 'queued'
                              CHECK (status IN ('queued', 'building', 'ready', 'failed')),
  options         jsonb       NOT NULL DEFAULT '{}'::jsonb,
  storage_path    text,
  sha256          text,
  error           text,
  created_by      uuid        REFERENCES auth.users(id) NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ── Index ────────────────────────────────────

CREATE INDEX idx_trial_binders_case_created
  ON public.trial_binders (case_id, created_at DESC);

-- ── RLS ──────────────────────────────────────

ALTER TABLE public.trial_binders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trial binders"
  ON public.trial_binders FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = trial_binders.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own trial binders"
  ON public.trial_binders FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = trial_binders.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own trial binders"
  ON public.trial_binders FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = trial_binders.case_id
      AND cases.user_id = auth.uid()
  ));
