-- ============================================
-- Case Process Risk Scoring v1
-- ============================================

-- ── Table ──────────────────────────────────────────────────────────

CREATE TABLE public.case_risk_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  overall_score int NOT NULL,
  deadline_risk int NOT NULL,
  response_risk int NOT NULL,
  evidence_risk int NOT NULL,
  activity_risk int NOT NULL,
  risk_level text NOT NULL CHECK (risk_level IN ('low', 'moderate', 'elevated', 'high')),
  breakdown jsonb NOT NULL,
  model text,
  created_at timestamptz DEFAULT now()
);

-- ── Indexes ────────────────────────────────────────────────────────

CREATE INDEX idx_case_risk_scores_case_created
  ON public.case_risk_scores (case_id, created_at DESC);

-- ── RLS ────────────────────────────────────────────────────────────

ALTER TABLE public.case_risk_scores ENABLE ROW LEVEL SECURITY;

-- ---- case_risk_scores: only case owner can read/write ----

CREATE POLICY "Users can select own case_risk_scores"
  ON public.case_risk_scores FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_risk_scores.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own case_risk_scores"
  ON public.case_risk_scores FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_risk_scores.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own case_risk_scores"
  ON public.case_risk_scores FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_risk_scores.case_id
      AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own case_risk_scores"
  ON public.case_risk_scores FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.cases
    WHERE cases.id = case_risk_scores.case_id
      AND cases.user_id = auth.uid()
  ));
