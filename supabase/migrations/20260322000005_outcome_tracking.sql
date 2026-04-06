-- Outcome tracking: allows users to report case outcomes (won/settled/lost/dropped/ongoing)
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS outcome text CHECK (
    outcome IS NULL OR outcome IN ('won', 'settled', 'lost', 'dropped', 'ongoing')
  ),
  ADD COLUMN IF NOT EXISTS outcome_reported_at timestamptz,
  ADD COLUMN IF NOT EXISTS outcome_notes text;

-- Index for querying outcome stats
CREATE INDEX IF NOT EXISTS idx_cases_outcome ON public.cases (outcome) WHERE outcome IS NOT NULL;
