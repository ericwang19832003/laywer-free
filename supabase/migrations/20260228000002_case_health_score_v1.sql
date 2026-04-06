-- ============================================
-- Case Health Score v1
-- Adds health_score, computed_at, inputs_snapshot
-- to case_risk_scores.
-- ============================================

-- ── Columns ──────────────────────────────────────────────────────

ALTER TABLE public.case_risk_scores
  ADD COLUMN health_score int,
  ADD COLUMN computed_at  timestamptz DEFAULT now(),
  ADD COLUMN inputs_snapshot jsonb DEFAULT '{}'::jsonb;

-- ── Backfill ─────────────────────────────────────────────────────

UPDATE public.case_risk_scores
   SET health_score = overall_score,
       computed_at  = created_at
 WHERE health_score IS NULL;

-- ── Index ────────────────────────────────────────────────────────

CREATE INDEX idx_case_risk_scores_case_computed
  ON public.case_risk_scores (case_id, computed_at DESC);
