-- ============================================
-- Phase 2: Case Insights + Post-Filing Lifecycle
-- ============================================

-- ── Case Insights ─────────────────────────────────────────────────

CREATE TABLE public.case_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  insight_type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  priority text NOT NULL DEFAULT 'info' CHECK (priority IN ('info', 'warning', 'urgent')),
  dismissed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_case_insights_active
  ON public.case_insights (case_id, dismissed, created_at DESC);

ALTER TABLE public.case_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own insights"
  ON public.case_insights FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.cases WHERE cases.id = case_insights.case_id AND cases.user_id = auth.uid()));

CREATE POLICY "Users can update own insights"
  ON public.case_insights FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.cases WHERE cases.id = case_insights.case_id AND cases.user_id = auth.uid()));

CREATE POLICY "Service role can manage insights"
  ON public.case_insights FOR ALL
  USING (auth.role() = 'service_role');

-- ── Post-Filing columns ───────────────────────────────────────────

ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS outcome text CHECK (outcome IN ('won', 'lost', 'settled', 'dismissed', 'continued')),
  ADD COLUMN IF NOT EXISTS hearing_date timestamptz;
